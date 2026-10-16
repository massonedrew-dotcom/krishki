import logging

import httpx

from app.core.config import Settings
from app.core.errors import ApiError

SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify"
log = logging.getLogger(__name__)


class TurnstileVerifier:
    def __init__(self, settings: Settings, transport: httpx.AsyncBaseTransport | None = None):
        self._settings = settings
        self._transport = transport

    async def check(self, token: str | None, ip: str) -> None:
        """Raise ApiError unless the token is valid. Skipped only for local dev without secret."""
        if self._settings.turnstile_skippable:
            return
        secret = self._settings.turnstile_secret_key
        if secret is None:
            log.error("turnstile secret missing", extra={"event": "turnstile_unconfigured"})
            raise ApiError(503, "captcha_unavailable", "Captcha unavailable")
        if not token:
            raise ApiError(400, "captcha_failed", "Captcha verification failed")
        data = {"secret": secret.get_secret_value(), "response": token, "remoteip": ip}
        try:
            async with httpx.AsyncClient(timeout=5.0, transport=self._transport) as client:
                resp = await client.post(SITEVERIFY_URL, data=data)
            resp.raise_for_status()
            body = resp.json()
        except (httpx.HTTPError, ValueError) as exc:
            log.warning(
                "turnstile unreachable",
                extra={"event": "turnstile_error", "exc_type": type(exc).__name__},
            )
            raise ApiError(503, "captcha_unavailable", "Captcha unavailable") from None
        if not isinstance(body, dict) or body.get("success") is not True:
            raise ApiError(400, "captcha_failed", "Captcha verification failed")
