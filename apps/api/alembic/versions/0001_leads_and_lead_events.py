"""create leads and lead_events

Revision ID: 0001_leads
Revises:
Create Date: 2026-10-16
"""

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision = "0001_leads"
down_revision = None
branch_labels = None
depends_on = None

direction = postgresql.ENUM(
    "b2b_wholesale",
    "export",
    "private_label",
    "retail",
    "services",
    name="lead_direction",
    create_type=False,
)
product = postgresql.ENUM(
    "sko", "twist_off", "ring", "service", "unknown", name="lead_product", create_type=False
)
status = postgresql.ENUM(
    "new", "in_progress", "won", "lost", "spam", name="lead_status", create_type=False
)
lang = postgresql.ENUM("ru", "uz", "en", name="lead_lang", create_type=False)


def upgrade() -> None:
    bind = op.get_bind()
    for enum_type in (direction, product, status, lang):
        enum_type.create(bind, checkfirst=True)

    op.create_table(
        "leads",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("company", sa.String(200)),
        sa.Column("phone", sa.String(20), nullable=False),
        sa.Column("email", sa.String(254)),
        sa.Column("country", sa.String(100), nullable=False),
        sa.Column("direction", direction, nullable=False),
        sa.Column("product", product, nullable=False),
        sa.Column("volume_range", sa.String(50)),
        sa.Column("message", sa.Text()),
        sa.Column("lang", lang, nullable=False),
        sa.Column("source_page", sa.String(300)),
        sa.Column("utm_source", sa.String(200)),
        sa.Column("utm_medium", sa.String(200)),
        sa.Column("utm_campaign", sa.String(200)),
        sa.Column("utm_content", sa.String(200)),
        sa.Column("utm_term", sa.String(200)),
        sa.Column("ip_hash", sa.String(64), nullable=False),
        sa.Column("user_agent", sa.String(400)),
        sa.Column("status", status, nullable=False, server_default="new"),
        sa.Column("telegram_message_id", sa.BigInteger()),
    )
    op.create_index("ix_leads_phone_created_at", "leads", ["phone", "created_at"])
    op.create_index("ix_leads_ip_hash_created_at", "leads", ["ip_hash", "created_at"])

    op.create_table(
        "lead_events",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column(
            "lead_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("leads.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")
        ),
        sa.Column("type", sa.String(50), nullable=False),
        sa.Column(
            "payload",
            postgresql.JSONB(),
            nullable=False,
            server_default=sa.text("'{}'::jsonb"),
        ),
    )
    op.create_index("ix_lead_events_lead_id", "lead_events", ["lead_id"])


def downgrade() -> None:
    op.drop_index("ix_lead_events_lead_id", table_name="lead_events")
    op.drop_table("lead_events")
    op.drop_index("ix_leads_ip_hash_created_at", table_name="leads")
    op.drop_index("ix_leads_phone_created_at", table_name="leads")
    op.drop_table("leads")
    bind = op.get_bind()
    for enum_type in (lang, status, product, direction):
        enum_type.drop(bind, checkfirst=True)
