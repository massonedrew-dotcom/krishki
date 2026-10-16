import re
import uuid
from typing import Annotated

import phonenumbers
from pydantic import BaseModel, ConfigDict, Field, StringConstraints, field_validator

from app.models.lead import Direction, Lang, Product

DEFAULT_REGION = "UZ"
MIN_ELAPSED_MS = 3000
_EMAIL_RE = re.compile(r"^[^@\s]{1,64}@[^@\s]+\.[^@\s]{2,}$")

_Str = StringConstraints(strip_whitespace=True)
Name = Annotated[str, _Str, Field(min_length=2, max_length=100)]
Country = Annotated[str, _Str, Field(min_length=2, max_length=100)]
Phone = Annotated[str, _Str, Field(min_length=5, max_length=32)]
OptShort = Annotated[str | None, _Str, Field(default=None, max_length=200)]


def normalize_phone(raw: str, region: str = DEFAULT_REGION) -> str:
    """Return the phone in E.164 or raise ValueError (the message never echoes the input)."""
    try:
        parsed = phonenumbers.parse(raw, region)
    except phonenumbers.NumberParseException:
        raise ValueError("invalid phone") from None
    if not phonenumbers.is_valid_number(parsed):
        raise ValueError("invalid phone")
    return phonenumbers.format_number(parsed, phonenumbers.PhoneNumberFormat.E164)


class LeadCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: Name
    phone: Phone
    company: OptShort
    email: Annotated[str | None, _Str, Field(default=None, max_length=254)]
    country: Country
    direction: Direction
    product: Product = Product.unknown
    volume_range: Annotated[str | None, _Str, Field(default=None, max_length=50)]
    message: Annotated[str | None, _Str, Field(default=None, max_length=2000)]
    lang: Lang
    source_page: Annotated[str | None, _Str, Field(default=None, max_length=300)]
    utm_source: OptShort
    utm_medium: OptShort
    utm_campaign: OptShort
    utm_content: OptShort
    utm_term: OptShort
    user_agent: Annotated[str | None, _Str, Field(default=None, max_length=400)]
    consent: bool
    # Honeypot: hidden in the form, real users leave it empty.
    website: Annotated[str, Field(default="", max_length=200)]
    elapsed_ms: Annotated[int, Field(ge=MIN_ELAPSED_MS, le=7 * 24 * 3600 * 1000)]
    turnstile_token: Annotated[str | None, Field(default=None, max_length=2048)]

    @field_validator("*", mode="after")
    @classmethod
    def _no_nul_and_blank_to_none(cls, value: object) -> object:
        if isinstance(value, str):
            if "\x00" in value:
                raise ValueError("invalid characters")
            return value
        return value

    @field_validator(
        "company",
        "email",
        "volume_range",
        "message",
        "source_page",
        "utm_source",
        "utm_medium",
        "utm_campaign",
        "utm_content",
        "utm_term",
        "user_agent",
        "turnstile_token",
        mode="after",
    )
    @classmethod
    def _empty_to_none(cls, value: str | None) -> str | None:
        return value or None

    @field_validator("phone", mode="after")
    @classmethod
    def _phone_e164(cls, value: str) -> str:
        return normalize_phone(value)

    @field_validator("email", mode="after")
    @classmethod
    def _email_shape(cls, value: str | None) -> str | None:
        if value is not None and not _EMAIL_RE.match(value):
            raise ValueError("invalid email")
        return value

    @field_validator("consent", mode="after")
    @classmethod
    def _consent_required(cls, value: bool) -> bool:
        if value is not True:
            raise ValueError("consent required")
        return value

    @field_validator("website", mode="after")
    @classmethod
    def _honeypot_empty(cls, value: str) -> str:
        if value != "":
            raise ValueError("must be empty")
        return value


class LeadCreated(BaseModel):
    id: uuid.UUID
