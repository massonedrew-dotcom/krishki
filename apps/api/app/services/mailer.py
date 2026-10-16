import asyncio
import smtplib
import ssl
from email.message import EmailMessage
from urllib.parse import unquote, urlparse


class Mailer:
    """Minimal SMTP sender. SMTP_URL: smtp://user:pass@host:587 (STARTTLS) or smtps://...:465."""

    def __init__(self, smtp_url: str, sender: str) -> None:
        parsed = urlparse(smtp_url)
        if parsed.scheme not in ("smtp", "smtps") or not parsed.hostname:
            raise ValueError("invalid SMTP_URL")
        self._ssl = parsed.scheme == "smtps"
        self._host = parsed.hostname
        self._port = parsed.port or (465 if self._ssl else 587)
        self._user = unquote(parsed.username) if parsed.username else None
        self._password = unquote(parsed.password) if parsed.password else None
        self._sender = sender

    async def send(self, to: str, subject: str, body: str) -> None:
        await asyncio.to_thread(self._send_sync, to, subject, body)

    def _send_sync(self, to: str, subject: str, body: str) -> None:
        msg = EmailMessage()
        msg["From"] = self._sender
        msg["To"] = to
        msg["Subject"] = subject
        msg.set_content(body)
        context = ssl.create_default_context()
        if self._ssl:
            with smtplib.SMTP_SSL(self._host, self._port, timeout=15, context=context) as smtp:
                self._login_and_send(smtp, msg)
        else:
            with smtplib.SMTP(self._host, self._port, timeout=15) as smtp:
                smtp.starttls(context=context)
                self._login_and_send(smtp, msg)

    def _login_and_send(self, smtp: smtplib.SMTP, msg: EmailMessage) -> None:
        if self._user and self._password:
            smtp.login(self._user, self._password)
        smtp.send_message(msg)
