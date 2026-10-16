from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.config import Settings, get_settings
from app.core.errors import ApiError
from app.core.logging import setup_logging
from app.db.session import make_engine, make_sessionmaker
from app.routers import health, leads
from app.services.mailer import Mailer
from app.services.telegram import AiogramSender, LeadNotifier, MessageSender
from app.services.turnstile import TurnstileVerifier


def _error(
    status: int, code: str, message: str, headers: dict[str, str] | None = None
) -> JSONResponse:
    return JSONResponse(
        status_code=status,
        content={"error": {"code": code, "message": message}},
        headers=headers,
    )


async def api_error_handler(_: Request, exc: Exception) -> JSONResponse:
    if isinstance(exc, ApiError):
        return _error(exc.status_code, exc.code, exc.message, exc.headers)
    return _error(500, "internal_error", "Internal server error")


async def http_exception_handler(_: Request, exc: Exception) -> JSONResponse:
    if isinstance(exc, StarletteHTTPException):
        return _error(exc.status_code, f"http_{exc.status_code}", str(exc.detail))
    return _error(500, "internal_error", "Internal server error")


async def validation_exception_handler(_: Request, exc: Exception) -> JSONResponse:
    # Never echo submitted input: report only field locations.
    if not isinstance(exc, RequestValidationError):
        return _error(500, "internal_error", "Internal server error")
    fields = sorted({".".join(str(p) for p in e["loc"] if p != "body") for e in exc.errors()})
    names = ", ".join(f for f in fields if f)
    return _error(422, "validation_error", f"Invalid fields: {names}" if names else "Invalid input")


def create_app(
    settings: Settings | None = None,
    *,
    sender: MessageSender | None = None,
    turnstile: TurnstileVerifier | None = None,
    mailer: Mailer | None = None,
) -> FastAPI:
    """Build the app. Collaborators can be injected for tests."""
    settings = settings or get_settings()
    engine = make_engine(settings.database_url.get_secret_value())
    sessionmaker = make_sessionmaker(engine)

    if sender is None and settings.telegram_bot_token is not None:
        sender = AiogramSender(settings.telegram_bot_token.get_secret_value())
    if mailer is None and settings.smtp_url is not None and settings.lead_fallback_email:
        mailer = Mailer(settings.smtp_url.get_secret_value(), settings.lead_fallback_email)

    @asynccontextmanager
    async def lifespan(_: FastAPI) -> AsyncIterator[None]:
        yield
        if sender is not None:
            await sender.close()
        await engine.dispose()

    docs_enabled = not settings.is_production
    app = FastAPI(
        title="krishki.uz API",
        version="0.1.0",
        docs_url="/docs" if docs_enabled else None,
        redoc_url="/redoc" if docs_enabled else None,
        openapi_url="/openapi.json" if docs_enabled else None,
        lifespan=lifespan,
    )
    app.state.settings = settings
    app.state.engine = engine
    app.state.sessionmaker = sessionmaker
    app.state.turnstile = turnstile or TurnstileVerifier(settings)
    app.state.notifier = LeadNotifier(settings, sessionmaker, sender, mailer)

    if settings.cors_origins:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=settings.cors_origins,
            allow_methods=["GET", "POST"],
            allow_headers=["content-type", "x-site-key"],
        )
    app.add_exception_handler(ApiError, api_error_handler)
    # Starlette's HTTPException is the base class of FastAPI's, so this covers both.
    app.add_exception_handler(StarletteHTTPException, http_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.include_router(health.router)
    app.include_router(leads.router)
    return app


def _build() -> FastAPI:
    setup_logging()
    return create_app()


app = _build()
