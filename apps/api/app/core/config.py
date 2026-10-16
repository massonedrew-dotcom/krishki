from functools import lru_cache
from typing import Any, Self

from pydantic import SecretStr, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Runtime configuration, read from the environment (and an optional .env file)."""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore", case_sensitive=False)

    app_env: str = "local"
    database_url: SecretStr
    site_key: SecretStr | None = None
    allowed_origins: str = ""
    ip_hash_salt: SecretStr | None = None
    # Header carrying the visitor IP, set by the Next.js server. Trusted only after X-Site-Key
    # has been verified. Falls back to the socket peer when absent or malformed.
    client_ip_header: str = "x-forwarded-for"
    turnstile_secret_key: SecretStr | None = None
    telegram_bot_token: SecretStr | None = None
    telegram_chat_id: str | None = None
    telegram_admin_chat: str | None = None
    telegram_topic_b2b_wholesale: int | None = None
    telegram_topic_export: int | None = None
    telegram_topic_private_label: int | None = None
    telegram_topic_retail: int | None = None
    telegram_topic_services: int | None = None
    smtp_url: SecretStr | None = None
    lead_fallback_email: str | None = None

    @field_validator(
        "site_key",
        "ip_hash_salt",
        "turnstile_secret_key",
        "telegram_bot_token",
        "telegram_chat_id",
        "telegram_admin_chat",
        "telegram_topic_b2b_wholesale",
        "telegram_topic_export",
        "telegram_topic_private_label",
        "telegram_topic_retail",
        "telegram_topic_services",
        "smtp_url",
        "lead_fallback_email",
        mode="before",
    )
    @classmethod
    def _blank_is_none(cls, value: Any) -> Any:
        # .env.example ships empty values; treat them as "not set".
        if isinstance(value, str) and value.strip() == "":
            return None
        return value

    @model_validator(mode="after")
    def _require_production_secrets(self) -> Self:
        if self.is_production:
            missing = [
                name
                for name in ("site_key", "ip_hash_salt", "turnstile_secret_key")
                if getattr(self, name) is None
            ]
            if missing:
                raise ValueError(f"Missing required settings in production: {', '.join(missing)}")
        return self

    @property
    def is_production(self) -> bool:
        return self.app_env.lower() == "production"

    @property
    def turnstile_skippable(self) -> bool:
        """Turnstile is skipped only for local development without a secret."""
        return self.app_env.lower() == "local" and self.turnstile_secret_key is None

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]

    def topic_for(self, direction: str) -> int | None:
        value = getattr(self, f"telegram_topic_{direction}", None)
        return value if isinstance(value, int) else None


@lru_cache
def get_settings() -> Settings:
    return Settings()
