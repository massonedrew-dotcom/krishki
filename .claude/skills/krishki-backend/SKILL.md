---
name: krishki-backend
description: Backend architecture for krishki.uz — FastAPI service, PostgreSQL schema, lead pipeline to Telegram, admin, API contracts, Docker and deployment. Load before any work in apps/api, infra or database.
---

# Backend

## Service layout (apps/api)
```
app/
  main.py            # FastAPI app, middleware, routers
  core/config.py     # pydantic-settings, reads .env
  core/security.py   # rate limit, captcha verify, admin auth
  db/session.py      # async SQLAlchemy engine
  models/            # SQLAlchemy models
  schemas/           # Pydantic v2 in/out models
  routers/leads.py   # POST /v1/leads
  routers/lids.py    # GET /v1/lids (stage 2, when catalog moves to DB)
  routers/health.py  # GET /healthz
  services/telegram.py  # aiogram Bot, send lead card to group by topic
  services/translate.py # stage 2: LLM translation of content
alembic/
tests/
```

## Data model (stage 1)
- `leads`: id uuid, created_at, name, company, phone (E.164), email nullable, country, direction (enum: b2b_wholesale, export, private_label, retail, services), product (enum: sko, twist_off, ring, service, unknown), volume_range, message (≤ 2000), lang (ru|uz|en), source_page, utm_source/medium/campaign/content/term, ip_hash (sha256 + salt), user_agent, status (new|in_progress|won|lost|spam), telegram_message_id.
- `lead_events`: id, lead_id, at, type, payload jsonb (status changes, notes).
Stage 2: `lid_designs`, `content_blocks`, `admins`.

## Lead pipeline
1. Next.js form → server action → `POST {API}/v1/leads` (server-to-server, secret header `X-Site-Key`).
2. API: validate, verify Cloudflare Turnstile token, honeypot field, rate limit (5/10 min per ip_hash, 50/day global per ip), dedupe same phone within 10 min.
3. Save to DB, then send Telegram message to the sales group: forum topic per direction (`TELEGRAM_TOPIC_<DIRECTION>`), hashtags `#b2b #export ...`, inline buttons "В работу" / "Спам" handled by a webhook updating `status`.
4. If Telegram fails: lead is still saved, retry with backoff (3 attempts), alert to `TELEGRAM_ADMIN_CHAT`.
5. Response to client: 201 `{id}` only. Never echo input.

## API conventions
- Versioned `/v1`, JSON only, errors `{error: {code, message}}`, OpenAPI exported to `packages/shared/openapi.json`, TS types generated with openapi-typescript.
- All timestamps UTC, ISO 8601.

## Admin (stage 2)
Option A: sqladmin on `/admin` behind Caddy basic auth + IP allowlist. Option B: Directus/Payload for content. Decide in docs/adr/.

## Infra
- docker-compose: `api`, `db` (postgres:16, volume, not exposed), `caddy` (TLS, reverse proxy, security headers), `backup` (pg_dump nightly to off-site storage, 14 days retention).
- CI (GitHub Actions): lint (ruff, eslint), typecheck (mypy, tsc), tests (pytest, vitest), Playwright smoke, build images, deploy on tag.
- Env vars documented in `.env.example`; secrets only in the server/CI secret store.
