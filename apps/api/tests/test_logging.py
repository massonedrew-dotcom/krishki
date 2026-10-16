import json
import logging

from app.core.logging import JsonFormatter


def _format(**extra: object) -> dict[str, object]:
    record = logging.LogRecord("t", logging.INFO, __file__, 1, "hello", None, None)
    for k, v in extra.items():
        setattr(record, k, v)
    out: dict[str, object] = json.loads(JsonFormatter().format(record))
    return out


def test_json_with_whitelisted_fields_only() -> None:
    out = _format(event="x", lead_id="abc", phone="+998901234567", name="Ivan", ip="1.2.3.4")
    assert out["event"] == "x"
    assert out["lead_id"] == "abc"
    for forbidden in ("phone", "name", "ip"):
        assert forbidden not in out
    assert "+998901234567" not in json.dumps(out)


def test_exception_message_is_not_logged() -> None:
    try:
        raise ValueError("contains +998901234567")
    except ValueError:
        import sys

        record = logging.LogRecord("t", logging.ERROR, __file__, 1, "boom", None, sys.exc_info())
    out = json.loads(JsonFormatter().format(record))
    assert out["exc_type"] == "ValueError"
    assert "998901234567" not in json.dumps(out)
