import os
import subprocess
import sys
from collections.abc import AsyncIterator, Callable, Iterator
from pathlib import Path
from typing import Any

import httpx
import pytest
from fastapi import FastAPI
from sqlalchemy import delete
from sqlalchemy.ext.asyncio import AsyncEngine, async_sessionmaker

# Settings need a database URL; tests that do not use the DB fixture never connect to it.
os.environ.setdefault("DATABASE_URL", "postgresql+asyncpg://test:test@localhost:5432/test")

from app.core.config import Settings  # noqa: E402
from app.main import create_app  # noqa: E402
from app.models.lead import Lead, LeadEvent  # noqa: E402
from app.services.mailer import Mailer  # noqa: E402
from app.services.telegram import LeadNotifier  # noqa: E402

API_DIR = Path(__file__).resolve().parent.parent
SITE_KEY = "test-site-key-0123456789"
DUMMY_DB = "postgresql+asyncpg://t:t@localhost:5432/t"


class FakeSender:
    """Stands in for the aiogram Bot."""

    def __init__(self, fail_chats: set[str] | None = None, fail_all: bool = False) -> None:
        self.sent: list[dict[str, Any]] = []
        self.attempts = 0
        self.fail_chats = fail_chats or set()
        self.fail_all = fail_all
        self.closed = False

    async def send(self, chat_id: str, text: str, thread_id: int | None = None) -> int:
        self.attempts += 1
        if self.fail_all or chat_id in self.fail_chats:
            raise RuntimeError("telegram down")
        self.sent.append({"chat_id": chat_id, "text": text, "thread_id": thread_id})
        return 1000 + len(self.sent)

    async def close(self) -> None:
        self.closed = True


class FakeMailer(Mailer):
    def __init__(self) -> None:
        super().__init__("smtp://u:p@localhost:587", "from@example.com")
        self.mails: list[tuple[str, str, str]] = []

    async def send(self, to: str, subject: str, body: str) -> None:
        self.mails.append((to, subject, body))


def make_settings(database_url: str = DUMMY_DB, /, **overrides: Any) -> Settings:
    values: dict[str, Any] = {
        "app_env": "local",
        "database_url": database_url,
        "site_key": SITE_KEY,
        "ip_hash_salt": "test-salt",
        "telegram_chat_id": "-1001",
        "telegram_admin_chat": "-2002",
        "telegram_topic_export": 77,
    }
    values.update(overrides)
    return Settings(_env_file=None, **values)


async def no_sleep(_: float) -> None:
    return None


def build_app(
    settings: Settings,
    sender: FakeSender | None = None,
    mailer: Mailer | None = None,
    **kwargs: Any,
) -> FastAPI:
    sender = sender or FakeSender()
    app = create_app(settings, sender=sender, mailer=mailer, **kwargs)
    # Same notifier, but without real sleeping between retries.
    app.state.notifier = LeadNotifier(
        settings, app.state.sessionmaker, sender, mailer, sleep=no_sleep
    )
    return app


def client_for(app: FastAPI) -> httpx.AsyncClient:
    return httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test")


def valid_payload(**overrides: Any) -> dict[str, Any]:
    payload: dict[str, Any] = {
        "name": "Ivan Petrov",
        "phone": "+998901234567",
        "company": "Test LLC",
        "country": "Kazakhstan",
        "direction": "export",
        "product": "sko",
        "volume_range": "100k-1m",
        "message": "Please send the price list",
        "lang": "ru",
        "source_page": "/ru/export",
        "consent": True,
        "website": "",
        "elapsed_ms": 8000,
    }
    payload.update(overrides)
    return payload


def headers(ip: str = "203.0.113.7", key: str | None = SITE_KEY) -> dict[str, str]:
    h = {"X-Forwarded-For": ip}
    if key is not None:
        h["X-Site-Key"] = key
    return h


# --- Docker / Postgres -------------------------------------------------------------------


def _docker_available() -> bool:
    try:
        import docker

        docker.from_env().ping()
    except Exception:
        return False
    return True


def _migrate(url: str) -> None:
    env = {**os.environ, "DATABASE_URL": url}
    subprocess.run(  # noqa: S603
        [sys.executable, "-m", "alembic", "upgrade", "head"],
        cwd=API_DIR,
        env=env,
        check=True,
        capture_output=True,
    )


@pytest.fixture(scope="session")
def pg_url() -> Iterator[str]:
    """Async URL of a throwaway Postgres 16. Skips when Docker is unavailable.

    TEST_DATABASE_URL (asyncpg URL of an EMPTY database) can be set to bypass Docker.
    """
    external = os.environ.get("TEST_DATABASE_URL")
    if external:
        yield external
        return
    if not _docker_available():
        pytest.skip("Docker daemon is not available (testcontainers needs it)")
    from testcontainers.postgres import PostgresContainer

    with PostgresContainer("postgres:16-alpine", driver="asyncpg") as pg:
        yield pg.get_connection_url()


@pytest.fixture(scope="session")
def migrated_url(pg_url: str) -> str:
    _migrate(pg_url)
    return pg_url


@pytest.fixture
async def db_app(migrated_url: str) -> AsyncIterator[Callable[..., FastAPI]]:
    """Factory building an app wired to the migrated DB; tables are emptied before each test."""
    apps: list[FastAPI] = []

    def factory(**kwargs: Any) -> FastAPI:
        settings = kwargs.pop("settings", None) or make_settings(migrated_url)
        app = build_app(settings, **kwargs)
        apps.append(app)
        return app

    cleaner = create_cleaner(migrated_url)
    await cleaner()
    yield factory
    for app in apps:
        engine: AsyncEngine = app.state.engine
        await engine.dispose()


def create_cleaner(url: str) -> Callable[[], Any]:
    from app.db.session import make_engine, make_sessionmaker

    async def clean() -> None:
        engine = make_engine(url)
        sm: async_sessionmaker[Any] = make_sessionmaker(engine)
        async with sm() as session:
            await session.execute(delete(LeadEvent))
            await session.execute(delete(Lead))
            await session.commit()
        await engine.dispose()

    return clean
