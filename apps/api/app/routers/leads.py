import logging
from datetime import UTC, datetime, timedelta
from typing import Annotated

from fastapi import APIRouter, BackgroundTasks, Depends, Header, Request
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import Settings
from app.core.errors import ApiError
from app.core.security import client_ip, hash_ip, verify_site_key
from app.db.session import get_session
from app.models.lead import Lead, LeadEvent
from app.schemas.lead import LeadCreate, LeadCreated
from app.services.telegram import LeadNotifier
from app.services.turnstile import TurnstileVerifier

log = logging.getLogger(__name__)

router = APIRouter(prefix="/v1", tags=["leads"])

DEDUPE_WINDOW = timedelta(minutes=10)
SHORT_WINDOW = timedelta(minutes=10)
SHORT_LIMIT = 5
DAY_WINDOW = timedelta(days=1)
DAY_LIMIT = 50


async def require_site_key(
    request: Request, x_site_key: Annotated[str | None, Header()] = None
) -> None:
    verify_site_key(request, x_site_key)


async def _count_since(session: AsyncSession, ip_hash: str, since: datetime) -> int:
    stmt = (
        select(func.count())
        .select_from(Lead)
        .where(Lead.ip_hash == ip_hash, Lead.created_at > since)
    )
    return (await session.execute(stmt)).scalar_one()


@router.post(
    "/leads",
    status_code=201,
    response_model=LeadCreated,
    dependencies=[Depends(require_site_key)],
    responses={
        400: {"description": "Captcha failed"},
        401: {"description": "Bad or missing X-Site-Key"},
        429: {"description": "Rate limit"},
        503: {"description": "Captcha or configuration unavailable"},
    },
)
async def create_lead(
    payload: LeadCreate,
    request: Request,
    background: BackgroundTasks,
    session: Annotated[AsyncSession, Depends(get_session)],
) -> LeadCreated:
    settings: Settings = request.app.state.settings
    verifier: TurnstileVerifier = request.app.state.turnstile
    notifier: LeadNotifier = request.app.state.notifier

    salt = settings.ip_hash_salt.get_secret_value() if settings.ip_hash_salt else None
    if salt is None:
        log.error("ip hash salt missing", extra={"event": "config_error"})
        raise ApiError(503, "unavailable", "Service unavailable")
    ip = client_ip(request, settings)
    ip_hash = hash_ip(ip, salt)

    await verifier.check(payload.turnstile_token, ip)

    now = datetime.now(UTC)
    # Serialise concurrent submissions of the same phone so dedupe is reliable.
    await session.execute(select(func.pg_advisory_xact_lock(func.hashtext(payload.phone))))

    existing = (
        await session.execute(
            select(Lead.id)
            .where(Lead.phone == payload.phone, Lead.created_at > now - DEDUPE_WINDOW)
            .order_by(Lead.created_at.desc())
            .limit(1)
        )
    ).scalar_one_or_none()
    if existing is not None:
        log.info("duplicate lead", extra={"event": "lead_duplicate", "lead_id": str(existing)})
        return LeadCreated(id=existing)

    if await _count_since(session, ip_hash, now - SHORT_WINDOW) >= SHORT_LIMIT:
        raise ApiError(429, "rate_limited", "Too many requests", {"Retry-After": "600"})
    if await _count_since(session, ip_hash, now - DAY_WINDOW) >= DAY_LIMIT:
        raise ApiError(429, "rate_limited", "Too many requests", {"Retry-After": "3600"})

    data = payload.model_dump(exclude={"consent", "website", "elapsed_ms", "turnstile_token"})
    lead = Lead(**data, ip_hash=ip_hash)
    session.add(lead)
    await session.flush()
    session.add(LeadEvent(lead_id=lead.id, type="created", payload={}))
    await session.commit()

    log.info(
        "lead created",
        extra={
            "event": "lead_created",
            "lead_id": str(lead.id),
            "direction": lead.direction.value,
            "lang": lead.lang.value,
        },
    )
    background.add_task(notifier.notify, lead.id)
    return LeadCreated(id=lead.id)
