import json
from typing import Any

import httpx
import pytest

from app.core.errors import ApiError
from app.services.turnstile import SITEVERIFY_URL, TurnstileVerifier
from tests.conftest import make_settings


def _verifier(handler: httpx.MockTransport, **settings: Any) -> TurnstileVerifier:
    return TurnstileVerifier(make_settings(**settings), transport=handler)


def _ok(request: httpx.Request) -> httpx.Response:
    return httpx.Response(200, json={"success": True})


async def test_skipped_in_local_without_secret() -> None:
    def boom(request: httpx.Request) -> httpx.Response:
        raise AssertionError("must not call Cloudflare")

    await _verifier(httpx.MockTransport(boom)).check(None, "1.2.3.4")


async def test_not_skipped_outside_local_without_secret() -> None:
    v = _verifier(httpx.MockTransport(_ok), app_env="staging")
    with pytest.raises(ApiError) as info:
        await v.check("tok", "1.2.3.4")
    assert info.value.status_code == 503


async def test_not_skipped_in_local_when_secret_set() -> None:
    v = _verifier(httpx.MockTransport(_ok), turnstile_secret_key="sec")
    with pytest.raises(ApiError) as info:
        await v.check(None, "1.2.3.4")
    assert (info.value.status_code, info.value.code) == (400, "captcha_failed")


async def test_valid_token_posts_secret_token_and_ip() -> None:
    seen: dict[str, str] = {}

    def handler(request: httpx.Request) -> httpx.Response:
        assert str(request.url) == SITEVERIFY_URL
        seen.update(dict(p.split("=") for p in request.content.decode().split("&")))
        return httpx.Response(200, json={"success": True})

    v = _verifier(httpx.MockTransport(handler), turnstile_secret_key="sec")
    await v.check("tok123", "1.2.3.4")
    assert seen == {"secret": "sec", "response": "tok123", "remoteip": "1.2.3.4"}


async def test_invalid_token_rejected() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(200, content=json.dumps({"success": False, "error-codes": ["x"]}))

    v = _verifier(httpx.MockTransport(handler), turnstile_secret_key="sec")
    with pytest.raises(ApiError) as info:
        await v.check("bad", "1.2.3.4")
    assert (info.value.status_code, info.value.code) == (400, "captcha_failed")


@pytest.mark.parametrize("status", [500, 502])
async def test_cloudflare_error_fails_closed(status: int) -> None:
    v = _verifier(httpx.MockTransport(lambda r: httpx.Response(status)), turnstile_secret_key="sec")
    with pytest.raises(ApiError) as info:
        await v.check("tok", "1.2.3.4")
    assert info.value.status_code == 503


async def test_network_error_fails_closed() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        raise httpx.ConnectError("down")

    v = _verifier(httpx.MockTransport(handler), turnstile_secret_key="sec")
    with pytest.raises(ApiError) as info:
        await v.check("tok", "1.2.3.4")
    assert info.value.status_code == 503


async def test_garbage_response_fails_closed() -> None:
    v = _verifier(
        httpx.MockTransport(lambda r: httpx.Response(200, content=b"<html>")),
        turnstile_secret_key="sec",
    )
    with pytest.raises(ApiError) as info:
        await v.check("tok", "1.2.3.4")
    assert info.value.status_code == 503
