# krishki-api

FastAPI service: leads API, PostgreSQL, Telegram notifier. See `docs/adr/0002-lead-pipeline.md`.

## Commands

```
uv sync --locked
uv run ruff check . && uv run ruff format --check . && uv run mypy app tests
uv run pytest                      # DB tests use testcontainers and skip when Docker is unavailable
uv run alembic upgrade head        # needs DATABASE_URL (owner role, see below)
uv run python export_openapi.py --check   # build the schema without writing
uv run python export_openapi.py           # writes packages/shared/openapi.json
```

`TEST_DATABASE_URL=postgresql+asyncpg://...` (an empty database) makes the DB tests use an existing
Postgres instead of testcontainers.

## Endpoints

- `POST /v1/leads` (header `X-Site-Key`, optional `X-Forwarded-For` or `CLIENT_IP_HEADER` with the visitor IP) -> 201 `{id}`
- `GET /healthz` liveness, `GET /readyz` checks the database
- Errors: `{"error": {"code", "message"}}`; 401 unauthorized, 400 captcha_failed, 422 validation_error,
  429 rate_limited, 503 captcha_unavailable / not_ready.

## Database roles (deploy concern)

Migrations run with an owner role; the running API uses a role that cannot DROP or ALTER.
Run once per environment as a superuser (replace passwords, keep them in the secret store):

```sql
CREATE ROLE krishki_owner LOGIN PASSWORD '<owner-password>';
CREATE ROLE krishki_app   LOGIN PASSWORD '<app-password>';
CREATE DATABASE krishki OWNER krishki_owner;
\c krishki
REVOKE ALL ON DATABASE krishki FROM PUBLIC;
GRANT CONNECT ON DATABASE krishki TO krishki_app;
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO krishki_app;

-- Tables are created by krishki_owner (alembic), so default privileges apply to its objects.
ALTER DEFAULT PRIVILEGES FOR ROLE krishki_owner IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE ON TABLES TO krishki_app;
ALTER DEFAULT PRIVILEGES FOR ROLE krishki_owner IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO krishki_app;
```

No DELETE is granted: retention clean-up runs under the owner role. If tables already exist, also run
`GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO krishki_app;` and the same for sequences.
Use `krishki_owner` in `DATABASE_URL` only for `alembic upgrade head`; the `api` container gets `krishki_app`.
(`alembic_version` is also readable/writable only by the owner; the API never touches it.)

## Notes

- Logs are JSON with a field whitelist (`app/core/logging.py`); run uvicorn with `--no-access-log`
  (set in the Dockerfile) because access logs contain the raw peer IP.
- Telegram retries: 3 attempts, 1 s then 2 s backoff; final failure -> admin alert + optional SMTP email.
  `SMTP_URL` format: `smtp://user:pass@host:587` (STARTTLS) or `smtps://user:pass@host:465`.
- Turnstile is skipped only when `APP_ENV=local` and `TURNSTILE_SECRET_KEY` is empty.
