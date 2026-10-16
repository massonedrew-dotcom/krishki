import httpx
from fastapi import FastAPI, HTTPException

from app.core.config import Settings
from app.main import create_app
from tests.conftest import make_settings


def _client(app: FastAPI) -> httpx.AsyncClient:
    return httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test")


def _settings(env: str) -> Settings:
    if env == "production":
        return make_settings(app_env=env, site_key="k", ip_hash_salt="s", turnstile_secret_key="t")
    return make_settings(app_env=env)


async def test_healthz() -> None:
    async with _client(create_app(_settings("local"))) as client:
        resp = await client.get("/healthz")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


async def test_docs_enabled_outside_production() -> None:
    async with _client(create_app(_settings("local"))) as client:
        assert (await client.get("/docs")).status_code == 200
        assert (await client.get("/openapi.json")).status_code == 200


async def test_docs_disabled_in_production() -> None:
    async with _client(create_app(_settings("production"))) as client:
        for path in ("/docs", "/redoc", "/openapi.json"):
            assert (await client.get(path)).status_code == 404


async def test_error_format_http_exception() -> None:
    app = create_app(_settings("local"))

    @app.get("/boom")
    async def boom() -> None:
        raise HTTPException(status_code=403, detail="nope")

    async with _client(app) as client:
        resp = await client.get("/boom")
        missing = await client.get("/missing")
    assert resp.status_code == 403
    assert resp.json() == {"error": {"code": "http_403", "message": "nope"}}
    assert missing.status_code == 404
    assert missing.json()["error"]["code"] == "http_404"


async def test_error_format_validation_does_not_echo_input() -> None:
    app = create_app(_settings("local"))

    @app.get("/num/{n}")
    async def num(n: int) -> dict[str, int]:
        return {"n": n}

    async with _client(app) as client:
        resp = await client.get("/num/secret-value")
    assert resp.status_code == 422
    assert resp.json()["error"]["code"] == "validation_error"
    assert "secret-value" not in resp.text
