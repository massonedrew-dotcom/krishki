import enum
import uuid
from datetime import UTC, datetime
from typing import Any

from sqlalchemy import BigInteger, DateTime, Enum, ForeignKey, Index, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Direction(enum.StrEnum):
    b2b_wholesale = "b2b_wholesale"
    export = "export"
    private_label = "private_label"
    retail = "retail"
    services = "services"


class Product(enum.StrEnum):
    sko = "sko"
    twist_off = "twist_off"
    ring = "ring"
    service = "service"
    unknown = "unknown"


class LeadStatus(enum.StrEnum):
    new = "new"
    in_progress = "in_progress"
    won = "won"
    lost = "lost"
    spam = "spam"


class Lang(enum.StrEnum):
    ru = "ru"
    uz = "uz"
    en = "en"


def _enum(cls: type[enum.StrEnum], name: str) -> Enum:
    return Enum(cls, name=name, values_callable=lambda e: [m.value for m in e])


def _utcnow() -> datetime:
    return datetime.now(UTC)


class Lead(Base):
    __tablename__ = "leads"
    __table_args__ = (
        Index("ix_leads_phone_created_at", "phone", "created_at"),
        Index("ix_leads_ip_hash_created_at", "ip_hash", "created_at"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=func.gen_random_uuid(),
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=_utcnow, server_default=func.now()
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    company: Mapped[str | None] = mapped_column(String(200))
    phone: Mapped[str] = mapped_column(String(20), nullable=False)
    email: Mapped[str | None] = mapped_column(String(254))
    country: Mapped[str] = mapped_column(String(100), nullable=False)
    direction: Mapped[Direction] = mapped_column(_enum(Direction, "lead_direction"), nullable=False)
    product: Mapped[Product] = mapped_column(
        _enum(Product, "lead_product"), nullable=False, default=Product.unknown
    )
    volume_range: Mapped[str | None] = mapped_column(String(50))
    message: Mapped[str | None] = mapped_column(Text)
    lang: Mapped[Lang] = mapped_column(_enum(Lang, "lead_lang"), nullable=False)
    source_page: Mapped[str | None] = mapped_column(String(300))
    utm_source: Mapped[str | None] = mapped_column(String(200))
    utm_medium: Mapped[str | None] = mapped_column(String(200))
    utm_campaign: Mapped[str | None] = mapped_column(String(200))
    utm_content: Mapped[str | None] = mapped_column(String(200))
    utm_term: Mapped[str | None] = mapped_column(String(200))
    ip_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    user_agent: Mapped[str | None] = mapped_column(String(400))
    status: Mapped[LeadStatus] = mapped_column(
        _enum(LeadStatus, "lead_status"),
        nullable=False,
        default=LeadStatus.new,
        server_default=LeadStatus.new.value,
    )
    telegram_message_id: Mapped[int | None] = mapped_column(BigInteger)


class LeadEvent(Base):
    __tablename__ = "lead_events"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    lead_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("leads.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=_utcnow, server_default=func.now()
    )
    type: Mapped[str] = mapped_column(String(50), nullable=False)
    payload: Mapped[dict[str, Any]] = mapped_column(
        JSONB, nullable=False, default=dict, server_default="{}"
    )
