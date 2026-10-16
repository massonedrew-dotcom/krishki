# 05 — Backend and leads (агент: backend-dev)

```
Use the backend-dev agent. Load krishki-backend, krishki-security, krishki-domain. Implement in apps/api:
1. Settings via pydantic-settings, async SQLAlchemy 2, Alembic migration for leads and lead_events exactly as in krishki-backend.
2. POST /v1/leads with Pydantic validation, Turnstile verification, honeypot, min submit time, rate limits, 10-minute phone dedupe, ip_hash, 201 {id}.
3. Telegram notifier with aiogram 3: message to the sales group forum topic by direction, hashtags, inline buttons "В работу"/"Спам" via a webhook that updates status; retries with backoff; admin alert on failure; lead is saved even if Telegram is down.
4. GET /healthz, structured JSON logs without PII.
5. pytest with testcontainers covering every case in krishki-qa.
6. Export OpenAPI to packages/shared, generate TS types, then wire the Next.js LeadForm via a server action that calls the API with X-Site-Key. Client-side Zod schema must mirror the Pydantic one.
7. docker-compose with api, db (not exposed), caddy (TLS + security headers), nightly backup container.
```
