"""Endpoint tests. Section 1 never reaches the DB (rejected earlier); section 2 needs Postgres."""

import uuid
from collections.abc import Callable
from typing import Any

import httpx
import pytest
from fastapi import FastAPI
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.lead import Lead, LeadEvent
from app.services.turnstile import TurnstileVerifier
from tests.conftest import (
    FakeMailer,
    FakeSender,
    build_app,
    client_for,
    headers,
    make_settings,
    valid_payload,
)

# --- 1. Rejections that happen before any DB access ------------------------------------------


async def _post(app: FastAPI, payload: dict[str, Any], **hdr: Any) -> httpx.Response:
    async with client_for(app) as client:
        return await client.post("/v1/leads", json=payload, headers=headers(**hdr))


async def test_missing_site_key_is_401() -> None:
    resp = await _post(build_app(make_settings()), valid_payload(), key=None)
    assert resp.status_code == 401
    assert resp.json() == {"error": {"code": "unauthorized", "message": "Unauthorized"}}


async def test_bad_site_key_is_401_even_with_invalid_body() -> None:
    resp = await _post(build_app(make_settings()), {"name": "x"}, key="wrong")
    assert resp.status_code == 401


async def test_unconfigured_site_key_fails_closed() -> None:
    app = build_app(make_settings(site_key=None))
    assert (await _post(app, valid_payload(), key="anything")).status_code == 401


@pytest.mark.parametrize(
    ("override", "field"),
    [
        ({"phone": "abc"}, "phone"),
        ({"website": "bot"}, "website"),
        ({"elapsed_ms": 1000}, "elapsed_ms"),
        ({"consent": False}, "consent"),
        ({"message": "x" * 2001}, "message"),
        ({"name": "n" * 101}, "name"),
        ({"direction": "other"}, "direction"),
    ],
)
async def test_invalid_input_is_422_and_not_echoed(override: dict[str, Any], field: str) -> None:
    resp = await _post(build_app(make_settings()), valid_payload(**override))
    assert resp.status_code == 422
    body = resp.json()
    assert body["error"]["code"] == "validation_error"
    assert field in body["error"]["message"]
    for value in override.values():
        if isinstance(value, str) and len(value) > 3:
            assert value not in resp.text


def _turnstile_app(success: bool | None) -> FastAPI:
    def handler(request: httpx.Request) -> httpx.Response:
        if success is None:
            raise httpx.ConnectError("down")
        return httpx.Response(200, json={"success": success})

    settings = make_settings(turnstile_secret_key="sec")
    verifier = TurnstileVerifier(settings, transport=httpx.MockTransport(handler))
    return build_app(settings, turnstile=verifier)


async def test_missing_turnstile_token_is_400() -> None:
    resp = await _post(_turnstile_app(True), valid_payload())
    assert resp.status_code == 400
    assert resp.json()["error"]["code"] == "captcha_failed"


async def test_invalid_turnstile_token_is_400() -> None:
    resp = await _post(_turnstile_app(False), valid_payload(turnstile_token="bad"))
    assert resp.status_code == 400
    assert resp.json()["error"]["code"] == "captcha_failed"
    assert "bad" not in resp.text


async def test_turnstile_outage_is_503() -> None:
    resp = await _post(_turnstile_app(None), valid_payload(turnstile_token="t"))
    assert resp.status_code == 503


async def test_missing_salt_is_503_not_a_crash() -> None:
    app = build_app(make_settings(ip_hash_salt=None))
    resp = await _post(app, valid_payload())
    assert resp.status_code == 503


# --- 2. Needs Postgres (testcontainers; skipped when Docker is unavailable) -------------------

AppFactory = Callable[..., FastAPI]


async def _count(app: FastAPI, model: type[Lead] | type[LeadEvent]) -> int:
    async with app.state.sessionmaker() as session:
        session_: AsyncSession = session
        return (await session_.execute(select(func.count()).select_from(model))).scalar_one()


async def _leads(app: FastAPI) -> list[Lead]:
    async with app.state.sessionmaker() as session:
        return list((await session.execute(select(Lead))).scalars())


async def test_valid_lead_saved_and_telegram_sent(db_app: AppFactory) -> None:
    sender = FakeSender()
    app = db_app(sender=sender)
    resp = await _post(app, valid_payload(phone="90 123 45 67"))
    assert resp.status_code == 201
    assert set(resp.json()) == {"id"}
    lead_id = uuid.UUID(resp.json()["id"])

    [lead] = await _leads(app)
    assert lead.id == lead_id
    assert lead.phone == "+998901234567"
    assert lead.status.value == "new"
    assert lead.ip_hash != "203.0.113.7" and len(lead.ip_hash) == 64
    assert lead.telegram_message_id == 1001
    assert "203.0.113.7" not in str(lead.__dict__)

    assert len(sender.sent) == 1
    assert sender.sent[0]["chat_id"] == "-1001"
    assert sender.sent[0]["thread_id"] == 77  # export topic
    assert "#export" in sender.sent[0]["text"]
    assert await _count(app, LeadEvent) == 2  # created + telegram_sent


async def test_ip_hash_is_sha256_of_salt_plus_ip(db_app: AppFactory) -> None:
    import hashlib

    app = db_app()
    await _post(app, valid_payload(), ip="198.51.100.9")
    [lead] = await _leads(app)
    assert lead.ip_hash == hashlib.sha256(b"test-salt198.51.100.9").hexdigest()


async def test_html_in_payload_is_escaped_in_telegram_text(db_app: AppFactory) -> None:
    sender = FakeSender()
    app = db_app(sender=sender)
    evil = "<img src=x onerror=alert(1)>"
    resp = await _post(app, valid_payload(name=evil, message=f"{evil}</b><a href='x'>"))
    assert resp.status_code == 201
    text = sender.sent[0]["text"]
    assert "<img" not in text
    assert "<a href" not in text
    assert "&lt;img src=x onerror=alert(1)&gt;" in text


async def test_duplicate_phone_within_10_min_returns_same_id_and_one_message(
    db_app: AppFactory,
) -> None:
    sender = FakeSender()
    app = db_app(sender=sender)
    first = await _post(app, valid_payload())
    second = await _post(app, valid_payload(name="Other Name"), ip="198.51.100.20")
    assert first.status_code == second.status_code == 201
    assert first.json() == second.json()
    assert await _count(app, Lead) == 1
    assert len(sender.sent) == 1


async def test_same_phone_after_window_creates_new_lead(db_app: AppFactory) -> None:
    from datetime import UTC, datetime, timedelta

    sender = FakeSender()
    app = db_app(sender=sender)
    await _post(app, valid_payload())
    async with app.state.sessionmaker() as session:
        [lead] = (await session.execute(select(Lead))).scalars().all()
        lead.created_at = datetime.now(UTC) - timedelta(minutes=11)
        await session.commit()
    resp = await _post(app, valid_payload())
    assert resp.status_code == 201
    assert await _count(app, Lead) == 2
    assert len(sender.sent) == 2


def _phone(n: int) -> str:
    return f"+99890123{n:04d}"


async def test_rate_limit_5_per_10_min_per_ip(db_app: AppFactory) -> None:
    app = db_app()
    for n in range(5):
        resp = await _post(app, valid_payload(phone=_phone(n)))
        assert resp.status_code == 201, n
    blocked = await _post(app, valid_payload(phone=_phone(99)))
    assert blocked.status_code == 429
    assert blocked.json()["error"]["code"] == "rate_limited"
    assert "Retry-After" in blocked.headers
    assert await _count(app, Lead) == 5
    # another IP is unaffected
    other = await _post(app, valid_payload(phone=_phone(98)), ip="198.51.100.1")
    assert other.status_code == 201


async def test_rate_limit_50_per_day_per_ip(db_app: AppFactory) -> None:
    from datetime import UTC, datetime, timedelta

    app = db_app()
    hour_ago = datetime.now(UTC) - timedelta(hours=1)
    ip_hash = None
    await _post(app, valid_payload(phone=_phone(0)))
    async with app.state.sessionmaker() as session:
        [first] = (await session.execute(select(Lead))).scalars().all()
        ip_hash = first.ip_hash
        first.created_at = hour_ago
        for n in range(1, 50):
            session.add(
                Lead(
                    name="Bulk",
                    phone=_phone(n),
                    country="KZ",
                    direction=first.direction,
                    lang=first.lang,
                    ip_hash=ip_hash,
                    created_at=hour_ago,
                )
            )
        await session.commit()
    resp = await _post(app, valid_payload(phone=_phone(500)))
    assert resp.status_code == 429


async def test_telegram_down_lead_still_saved_and_admin_alerted(
    db_app: AppFactory, migrated_url: str
) -> None:
    sender = FakeSender(fail_chats={"-1001"})  # sales group fails, admin chat works
    mailer = FakeMailer()
    settings = make_settings(migrated_url, lead_fallback_email="boss@example.com")
    app = db_app(sender=sender, mailer=mailer, settings=settings)
    resp = await _post(app, valid_payload())
    assert resp.status_code == 201

    [lead] = await _leads(app)
    assert str(lead.id) == resp.json()["id"]
    assert lead.telegram_message_id is None
    assert sender.attempts == 3 + 1  # 3 tries to the group, 1 admin alert
    assert [m["chat_id"] for m in sender.sent] == ["-2002"]
    assert str(lead.id) in sender.sent[0]["text"]
    assert "Ivan" not in sender.sent[0]["text"]
    assert len(mailer.mails) == 1
    async with app.state.sessionmaker() as session:
        types = (await session.execute(select(LeadEvent.type))).scalars().all()
    assert sorted(types) == ["created", "telegram_failed"]


async def test_telegram_and_admin_both_down_still_201(db_app: AppFactory) -> None:
    app = db_app(sender=FakeSender(fail_all=True))
    resp = await _post(app, valid_payload())
    assert resp.status_code == 201
    assert await _count(app, Lead) == 1


async def test_oversized_message_rejected_and_nothing_saved(db_app: AppFactory) -> None:
    app = db_app()
    resp = await _post(app, valid_payload(message="x" * 2001))
    assert resp.status_code == 422
    assert await _count(app, Lead) == 0


async def test_readyz_ok_with_db(db_app: AppFactory) -> None:
    app = db_app()
    async with client_for(app) as client:
        resp = await client.get("/readyz")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ready"}


async def test_readyz_503_when_db_unreachable() -> None:
    # Port 1 refuses connections immediately; no Docker needed.
    app = build_app(make_settings("postgresql+asyncpg://t:t@127.0.0.1:1/t"))
    async with client_for(app) as client:
        resp = await client.get("/readyz")
    assert resp.status_code == 503
    assert resp.json()["error"]["code"] == "not_ready"
    await app.state.engine.dispose()
