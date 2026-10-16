"""Migration tests; need Postgres (skipped without Docker)."""

import subprocess
import sys

from alembic.autogenerate import compare_metadata
from alembic.migration import MigrationContext
from sqlalchemy import inspect

from app.db.base import Base
from tests.conftest import API_DIR


def test_models_match_migration(migrated_url: str) -> None:
    """After `alembic upgrade head` the DB schema has no drift from the ORM models."""
    import asyncio

    from sqlalchemy.ext.asyncio import create_async_engine

    async def diff() -> list[object]:
        engine = create_async_engine(migrated_url)
        try:
            async with engine.connect() as conn:

                def run(sync_conn: object) -> list[object]:
                    ctx = MigrationContext.configure(sync_conn)  # type: ignore[arg-type]
                    return list(compare_metadata(ctx, Base.metadata))

                return await conn.run_sync(run)
        finally:
            await engine.dispose()

    assert asyncio.run(diff()) == []


def test_tables_and_enums_exist(migrated_url: str) -> None:
    import asyncio

    from sqlalchemy.ext.asyncio import create_async_engine

    async def names() -> tuple[set[str], set[str]]:
        engine = create_async_engine(migrated_url)
        try:
            async with engine.connect() as conn:

                def run(sync_conn: object) -> tuple[set[str], set[str]]:
                    insp = inspect(sync_conn)
                    assert insp is not None
                    enums = {e["name"] for e in insp.get_enums()}
                    return set(insp.get_table_names()), enums

                return await conn.run_sync(run)
        finally:
            await engine.dispose()

    tables, enums = asyncio.run(names())
    assert {"leads", "lead_events"} <= tables
    assert {"lead_direction", "lead_product", "lead_status", "lead_lang"} <= enums


def test_alembic_has_single_head() -> None:
    out = subprocess.run(  # noqa: S603
        [sys.executable, "-m", "alembic", "heads"],
        cwd=API_DIR,
        capture_output=True,
        text=True,
        check=True,
    )
    assert out.stdout.count("(head)") == 1
    assert "0001_leads" in out.stdout
