import asyncio
import html
import logging
import uuid
from collections.abc import Awaitable, Callable
from typing import Protocol

from aiogram import Bot
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode
from aiogram.types import LinkPreviewOptions
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from app.core.config import Settings
from app.models.lead import Lead, LeadEvent
from app.services.mailer import Mailer

log = logging.getLogger(__name__)

MAX_ATTEMPTS = 3
BASE_DELAY_S = 1.0

DIRECTION_TAGS = {
    "b2b_wholesale": "#b2b",
    "export": "#export",
    "private_label": "#private_label",
    "retail": "#retail",
    "services": "#services",
}
LANG_TAGS = {"ru": "#ru", "uz": "#uz", "en": "#en"}


class MessageSender(Protocol):
    async def send(self, chat_id: str, text: str, thread_id: int | None = None) -> int:
        """Send an HTML message and return its message id."""
        ...

    async def close(self) -> None: ...


class AiogramSender:
    def __init__(self, token: str) -> None:
        self._bot = Bot(token=token, default=DefaultBotProperties(parse_mode=ParseMode.HTML))

    async def send(self, chat_id: str, text: str, thread_id: int | None = None) -> int:
        msg = await self._bot.send_message(
            chat_id=chat_id,
            text=text,
            message_thread_id=thread_id,
            link_preview_options=LinkPreviewOptions(is_disabled=True),
        )
        return msg.message_id

    async def close(self) -> None:
        await self._bot.session.close()


def _e(value: object) -> str:
    return html.escape(str(value))


def format_lead_message(lead: Lead) -> str:
    """HTML message for Telegram. Every user-supplied value goes through html.escape."""
    tags = f"{DIRECTION_TAGS[lead.direction.value]} {LANG_TAGS[lead.lang.value]}"
    lines = [f"<b>Новая заявка</b> {tags}", ""]
    rows: list[tuple[str, str | None]] = [
        ("Имя", lead.name),
        ("Телефон", lead.phone),
        ("Компания", lead.company),
        ("Email", lead.email),
        ("Страна", lead.country),
        ("Продукт", lead.product.value),
        ("Объём", lead.volume_range),
        ("Страница", lead.source_page),
    ]
    for label, value in rows:
        if value:
            lines.append(f"<b>{label}:</b> {_e(value)}")
    if lead.message:
        lines += ["", _e(lead.message)]
    lines += ["", f"<code>{lead.id}</code>"]
    return "\n".join(lines)


def format_fallback_text(lead: Lead) -> str:
    """Plain-text body for the email fallback."""
    rows = [
        ("Name", lead.name),
        ("Phone", lead.phone),
        ("Company", lead.company),
        ("Email", lead.email),
        ("Country", lead.country),
        ("Direction", lead.direction.value),
        ("Product", lead.product.value),
        ("Volume", lead.volume_range),
        ("Language", lead.lang.value),
        ("Page", lead.source_page),
        ("Message", lead.message),
        ("Lead id", str(lead.id)),
    ]
    return "\n".join(f"{k}: {v}" for k, v in rows if v)


Sleep = Callable[[float], Awaitable[None]]


class LeadNotifier:
    """Sends the lead card to Telegram after commit; never loses the lead on failure."""

    def __init__(
        self,
        settings: Settings,
        sessionmaker: async_sessionmaker[AsyncSession],
        sender: MessageSender | None,
        mailer: Mailer | None = None,
        sleep: Sleep = asyncio.sleep,
    ) -> None:
        self._settings = settings
        self._sessionmaker = sessionmaker
        self._sender = sender
        self._mailer = mailer
        self._sleep = sleep

    async def notify(self, lead_id: uuid.UUID) -> None:
        try:
            await self._notify(lead_id)
        except Exception as exc:  # background task: must never raise
            log.error(
                "notifier crashed",
                extra={
                    "event": "notify_crash",
                    "lead_id": str(lead_id),
                    "exc_type": type(exc).__name__,
                },
            )

    async def _notify(self, lead_id: uuid.UUID) -> None:
        async with self._sessionmaker() as session:
            lead = await session.get(Lead, lead_id)
            if lead is None:
                return
            message_id = await self._send_with_retries(lead)
            if message_id is not None:
                lead.telegram_message_id = message_id
                session.add(LeadEvent(lead_id=lead.id, type="telegram_sent", payload={}))
                await session.commit()
                return
            session.add(
                LeadEvent(
                    lead_id=lead.id, type="telegram_failed", payload={"attempts": MAX_ATTEMPTS}
                )
            )
            await session.commit()
            await self._on_final_failure(lead)

    async def _send_with_retries(self, lead: Lead) -> int | None:
        chat_id = self._settings.telegram_chat_id
        if self._sender is None or not chat_id:
            log.warning(
                "telegram not configured",
                extra={"event": "telegram_unconfigured", "lead_id": str(lead.id)},
            )
            return None
        text = format_lead_message(lead)
        thread_id = self._settings.topic_for(lead.direction.value)
        for attempt in range(1, MAX_ATTEMPTS + 1):
            try:
                return await self._sender.send(chat_id, text, thread_id)
            except Exception as exc:
                log.warning(
                    "telegram send failed",
                    extra={
                        "event": "telegram_retry",
                        "lead_id": str(lead.id),
                        "attempt": attempt,
                        "exc_type": type(exc).__name__,
                    },
                )
                if attempt < MAX_ATTEMPTS:
                    await self._sleep(BASE_DELAY_S * 2 ** (attempt - 1))
        return None

    async def _on_final_failure(self, lead: Lead) -> None:
        log.error(
            "telegram delivery failed, lead saved",
            extra={
                "event": "telegram_failed",
                "lead_id": str(lead.id),
                "direction": lead.direction.value,
                "attempts": MAX_ATTEMPTS,
            },
        )
        admin = self._settings.telegram_admin_chat
        if self._sender is not None and admin:
            # No PII in the alert: id and direction only.
            alert = (
                "<b>Лид не доставлен в Telegram</b>\n"
                f"Направление: {_e(lead.direction.value)}\n<code>{lead.id}</code>"
            )
            try:
                await self._sender.send(admin, alert, None)
            except Exception as exc:
                log.error(
                    "admin alert failed",
                    extra={"event": "admin_alert_failed", "exc_type": type(exc).__name__},
                )
        if self._mailer is not None and self._settings.lead_fallback_email:
            try:
                await self._mailer.send(
                    self._settings.lead_fallback_email,
                    f"Lead {lead.id} (Telegram delivery failed)",
                    format_fallback_text(lead),
                )
            except Exception as exc:
                log.error(
                    "email fallback failed",
                    extra={"event": "email_fallback_failed", "exc_type": type(exc).__name__},
                )
