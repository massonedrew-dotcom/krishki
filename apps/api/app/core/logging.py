"""Structured JSON logging. Only whitelisted fields are emitted, so PII cannot leak by accident."""

import json
import logging
from datetime import UTC, datetime

# Never add name, phone, email, message, raw IP or tokens here.
ALLOWED_EXTRA = frozenset(
    {
        "event",
        "lead_id",
        "direction",
        "lang",
        "attempt",
        "attempts",
        "reason",
        "status_code",
        "error_code",
        "exc_type",
    }
)


class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload: dict[str, object] = {
            "ts": datetime.fromtimestamp(record.created, UTC).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "msg": record.getMessage(),
        }
        for key in ALLOWED_EXTRA:
            if hasattr(record, key):
                payload[key] = getattr(record, key)
        if record.exc_info and record.exc_info[0] is not None:
            # Class name only: exception messages may contain user data.
            payload["exc_type"] = record.exc_info[0].__name__
        return json.dumps(payload, ensure_ascii=False, default=str)


def setup_logging(level: int = logging.INFO) -> None:
    handler = logging.StreamHandler()
    handler.setFormatter(JsonFormatter())
    root = logging.getLogger()
    root.handlers[:] = [handler]
    root.setLevel(level)
