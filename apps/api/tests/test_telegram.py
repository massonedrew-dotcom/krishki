import logging
import uuid
from typing import Any

import pytest

from app.models.lead import Direction, Lang, Lead, Product
from app.services.mailer import Mailer
from app.services.telegram import (
    MAX_ATTEMPTS,
    LeadNotifier,
    format_lead_message,
)
from tests.conftest import FakeMailer, FakeSender, make_settings


def _lead(**kw: object) -> Lead:
    values: dict[str, object] = {
        "id": uuid.uuid4(),
        "name": "Ivan",
        "phone": "+998901234567",
        "country": "KZ",
        "direction": Direction.export,
        "product": Product.sko,
        "lang": Lang.ru,
        "ip_hash": "h",
    }
    values.update(kw)
    return Lead(**values)


def _notifier(
    sender: FakeSender | None, mailer: Mailer | None = None, **settings: Any
) -> tuple[LeadNotifier, list[float]]:
    sleeps: list[float] = []

    async def sleep(seconds: float) -> None:
        sleeps.append(seconds)

    notifier = LeadNotifier(
        make_settings(**settings),
        None,  # type: ignore[arg-type]  # DB is not touched by the methods under test
        sender,
        mailer,
        sleep=sleep,
    )
    return notifier, sleeps


def test_message_escapes_every_user_value() -> None:
    evil = "<script>alert(1)</script>&<b>x</b>"
    lead = _lead(
        name=evil,
        company=evil,
        email=evil,
        country=evil,
        volume_range=evil,
        source_page=evil,
        message=evil,
    )
    text = format_lead_message(lead)
    assert "<script>" not in text
    assert "<b>x</b>" not in text
    assert "&lt;script&gt;" in text
    assert text.count("&lt;script&gt;") == 7
    assert "&amp;" in text


def test_message_has_hashtags_and_id() -> None:
    lead = _lead(direction=Direction.private_label, lang=Lang.uz)
    text = format_lead_message(lead)
    assert "#private_label" in text
    assert "#uz" in text
    assert str(lead.id) in text


@pytest.mark.parametrize(
    ("direction", "tag"),
    [
        (Direction.b2b_wholesale, "#b2b"),
        (Direction.export, "#export"),
        (Direction.private_label, "#private_label"),
        (Direction.retail, "#retail"),
        (Direction.services, "#services"),
    ],
)
def test_direction_hashtags(direction: Direction, tag: str) -> None:
    assert tag in format_lead_message(_lead(direction=direction)).split("\n")[0].split()


async def test_send_uses_chat_and_topic_by_direction() -> None:
    sender = FakeSender()
    notifier, _ = _notifier(sender)
    msg_id = await notifier._send_with_retries(_lead(direction=Direction.export))
    assert msg_id == 1001
    assert sender.sent[0]["chat_id"] == "-1001"
    assert sender.sent[0]["thread_id"] == 77
    # no topic configured for retail
    await notifier._send_with_retries(_lead(direction=Direction.retail))
    assert sender.sent[1]["thread_id"] is None


class FlakySender(FakeSender):
    def __init__(self, failures: int) -> None:
        super().__init__()
        self.failures = failures

    async def send(self, chat_id: str, text: str, thread_id: int | None = None) -> int:
        if self.attempts < self.failures:
            self.attempts += 1
            raise RuntimeError("flaky")
        return await super().send(chat_id, text, thread_id)


async def test_retries_with_exponential_backoff_then_succeeds() -> None:
    sender = FlakySender(failures=2)
    notifier, sleeps = _notifier(sender)
    msg_id = await notifier._send_with_retries(_lead())
    assert msg_id is not None
    assert sleeps == [1.0, 2.0]
    assert sender.attempts == 3


async def test_gives_up_after_three_attempts() -> None:
    sender = FakeSender(fail_all=True)
    notifier, sleeps = _notifier(sender)
    assert await notifier._send_with_retries(_lead()) is None
    assert sender.attempts == MAX_ATTEMPTS == 3
    assert sleeps == [1.0, 2.0]


async def test_final_failure_alerts_admin_without_pii(caplog: pytest.LogCaptureFixture) -> None:
    sender = FakeSender(fail_chats={"-1001"})
    notifier, _ = _notifier(sender)
    lead = _lead(name="SecretName", phone="+998909998877")
    with caplog.at_level(logging.INFO):
        await notifier._on_final_failure(lead)
    assert [m["chat_id"] for m in sender.sent] == ["-2002"]
    alert = sender.sent[0]["text"]
    assert str(lead.id) in alert
    assert "SecretName" not in alert
    assert "+998909998877" not in alert
    assert "SecretName" not in caplog.text
    assert "998909998877" not in caplog.text


async def test_final_failure_sends_email_fallback_when_configured() -> None:
    mailer = FakeMailer()
    notifier, _ = _notifier(FakeSender(), mailer, lead_fallback_email="boss@example.com")
    lead = _lead()
    await notifier._on_final_failure(lead)
    assert len(mailer.mails) == 1
    to, subject, body = mailer.mails[0]
    assert to == "boss@example.com"
    assert str(lead.id) in subject
    assert "+998901234567" in body


async def test_no_email_without_fallback_address() -> None:
    mailer = FakeMailer()
    notifier, _ = _notifier(FakeSender(), mailer)
    await notifier._on_final_failure(_lead())
    assert mailer.mails == []


async def test_failures_of_alert_and_mail_do_not_raise() -> None:
    class BrokenMailer(FakeMailer):
        async def send(self, to: str, subject: str, body: str) -> None:
            raise OSError("smtp down")

    notifier, _ = _notifier(
        FakeSender(fail_all=True), BrokenMailer(), lead_fallback_email="boss@example.com"
    )
    await notifier._on_final_failure(_lead())


async def test_unconfigured_telegram_returns_none_without_attempts() -> None:
    notifier, sleeps = _notifier(None)
    assert await notifier._send_with_retries(_lead()) is None
    assert sleeps == []


def test_mailer_url_parsing() -> None:
    m = Mailer("smtps://user%40x:p%3Aw@mail.example.com", "a@b.c")
    assert (m._ssl, m._port, m._user, m._password) == (True, 465, "user@x", "p:w")
    assert Mailer("smtp://mail.example.com", "a@b.c")._port == 587
    with pytest.raises(ValueError, match="SMTP_URL"):
        Mailer("http://nope", "a@b.c")
