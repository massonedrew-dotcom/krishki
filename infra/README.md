# infra

Docker Compose stack: `api` (FastAPI), `db` (PostgreSQL 16), `caddy` (TLS + reverse proxy).

1. Copy `.env.example` to `.env` in the repo root and fill in values (never commit it).
2. Validate: `docker compose --env-file .env -f infra/docker-compose.yml config`.
3. Local dev: `docker compose --env-file .env -f infra/docker-compose.yml -f infra/docker-compose.override.yml up --build db api`
   (the override file publishes the db on `127.0.0.1:5432` only).
4. Run the web app on the host (`pnpm dev`, port 3000); Caddy proxies to `WEB_UPSTREAM`
   (default `host.docker.internal:3000`).
5. Start Caddy with `... up caddy`; it serves `https://$SITE_DOMAIN` (`localhost` uses Caddy's local CA).
6. Public API surface is only `/api/healthz`; any other `/api/*` returns 404. Web reaches the API server-to-server.
7. Production: use `-f infra/docker-compose.yml` only (no override, db unpublished).
8. Apply migrations: `docker compose --env-file .env -f infra/docker-compose.yml run --rm api alembic upgrade head`.
9. Without Docker: `cd apps/api && uv sync && uv run uvicorn app.main:app --reload`.
10. Backups (nightly pg_dump) are not part of this scaffold yet.
