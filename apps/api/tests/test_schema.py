from typing import Any

import pytest
from pydantic import ValidationError

from app.schemas.lead import LeadCreate, normalize_phone
from tests.conftest import valid_payload


def _fields(payload: dict[str, Any]) -> set[str]:
    with pytest.raises(ValidationError) as info:
        LeadCreate.model_validate(payload)
    return {str(e["loc"][0]) for e in info.value.errors()}


def test_valid_payload_normalises_phone() -> None:
    lead = LeadCreate.model_validate(valid_payload(phone="90 123-45-67"))
    assert lead.phone == "+998901234567"


@pytest.mark.parametrize(
    ("raw", "expected"),
    [
        ("+998 90 123 45 67", "+998901234567"),
        ("(90) 123-45-67", "+998901234567"),
        ("+7 701 123 45 67", "+77011234567"),
    ],
)
def test_phone_normalisation(raw: str, expected: str) -> None:
    assert normalize_phone(raw) == expected


@pytest.mark.parametrize("raw", ["abc", "123", "+998 12", "+99890123", "0000000000", "+1 555"])
def test_invalid_phone_rejected(raw: str) -> None:
    with pytest.raises(ValueError, match="invalid phone"):
        normalize_phone(raw)


def test_invalid_phone_error_does_not_echo_input() -> None:
    with pytest.raises(ValidationError) as info:
        LeadCreate.model_validate(valid_payload(phone="not-a-phone-zzz"))
    assert "not-a-phone-zzz" not in str(info.value.errors()[0]["msg"])


def test_consent_must_be_true() -> None:
    assert _fields(valid_payload(consent=False)) == {"consent"}
    payload = valid_payload()
    del payload["consent"]
    assert _fields(payload) == {"consent"}


def test_honeypot_must_be_empty() -> None:
    assert _fields(valid_payload(website="http://spam.example")) == {"website"}


@pytest.mark.parametrize("ms", [0, 2999, -5])
def test_too_fast_submit_rejected(ms: int) -> None:
    assert _fields(valid_payload(elapsed_ms=ms)) == {"elapsed_ms"}


def test_min_elapsed_accepted() -> None:
    LeadCreate.model_validate(valid_payload(elapsed_ms=3000))


@pytest.mark.parametrize(
    ("field", "size"),
    [
        ("name", 101),
        ("company", 201),
        ("country", 101),
        ("message", 2001),
        ("volume_range", 51),
        ("source_page", 301),
        ("utm_source", 201),
        ("utm_medium", 201),
        ("utm_campaign", 201),
        ("utm_content", 201),
        ("utm_term", 201),
        ("user_agent", 401),
        ("turnstile_token", 2049),
        ("website", 201),
        ("phone", 33),
    ],
)
def test_oversized_fields_rejected(field: str, size: int) -> None:
    assert field in _fields(valid_payload(**{field: "a" * size}))


def test_boundary_sizes_accepted() -> None:
    LeadCreate.model_validate(valid_payload(name="a" * 100, message="m" * 2000))


@pytest.mark.parametrize("field", ["direction", "lang", "product"])
def test_unknown_enum_rejected(field: str) -> None:
    assert _fields(valid_payload(**{field: "nope"})) == {field}


def test_unknown_field_rejected() -> None:
    assert _fields(valid_payload(is_admin=True)) == {"is_admin"}


def test_nul_character_rejected() -> None:
    assert "name" in _fields(valid_payload(name="Iv\x00an"))


def test_blank_optionals_become_none_and_strings_are_stripped() -> None:
    lead = LeadCreate.model_validate(valid_payload(company="   ", message="", name="  Ann  "))
    assert lead.company is None
    assert lead.message is None
    assert lead.name == "Ann"


def test_email_shape() -> None:
    assert LeadCreate.model_validate(valid_payload(email="a@b.uz")).email == "a@b.uz"
    assert "email" in _fields(valid_payload(email="not an email"))
