import logging
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import ApiError
from app.db.session import get_session

log = logging.getLogger(__name__)

router = APIRouter(tags=["health"])


@router.get("/healthz")
async def healthz() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/readyz")
async def readyz(session: Annotated[AsyncSession, Depends(get_session)]) -> dict[str, str]:
    try:
        await session.execute(select(1))
    except Exception as exc:
        log.error(
            "database not ready",
            extra={"event": "not_ready", "exc_type": type(exc).__name__},
        )
        raise ApiError(503, "not_ready", "Database unavailable") from None
    return {"status": "ready"}
