import hashlib
import hmac
import ipaddress

from fastapi import Request

from app.core.config import Settings
from app.core.errors import ApiError


def verify_site_key(request: Request, provided: str | None) -> None:
    """Constant-time check of X-Site-Key. Fails closed when no key is configured."""
    settings: Settings = request.app.state.settings
    expected = settings.site_key.get_secret_value() if settings.site_key else None
    if expected is None:
        raise ApiError(401, "unauthorized", "Unauthorized")
    ok = hmac.compare_digest((provided or "").encode(), expected.encode())
    if not ok:
        raise ApiError(401, "unauthorized", "Unauthorized")


def client_ip(request: Request, settings: Settings) -> str:
    """Visitor IP. Call only after verify_site_key: the header is trusted from the site only."""
    raw = request.headers.get(settings.client_ip_header)
    if raw:
        candidate = raw.split(",")[0].strip()
        try:
            return str(ipaddress.ip_address(candidate))
        except ValueError:
            pass
    return request.client.host if request.client else "unknown"


def hash_ip(ip: str, salt: str) -> str:
    return hashlib.sha256((salt + ip).encode()).hexdigest()
