# 01 — Architecture (агент: architect)

```
Use the architect agent. Load krishki-domain, krishki-backend, krishki-3d, krishki-security. Produce:
1. docs/architecture.md: system diagram in Mermaid (browser, Next.js on Vercel, FastAPI on VPS, PostgreSQL, Telegram, Turnstile, GTM/GA4, Yandex Metrica), request flow for the lead form, rendering strategy per page (static, ISR, client islands), where 3D chunks load.
2. docs/adr/0001-monorepo-and-stack.md, 0002-lead-pipeline.md, 0003-3d-strategy-sequence-vs-realtime.md, 0004-hosting.md, 0005-admin-and-cms-stage2.md, each with at least two options and the trade-offs.
3. Repo scaffold only (no features): pnpm workspaces, apps/web (Next.js 15, TS strict, Tailwind v4, next-intl with ru/uz/en), apps/api (FastAPI skeleton with /healthz), packages/shared, docker-compose.yml (api, db, caddy), .env.example, .gitignore, LICENSES.md, GitHub Actions CI running lint, typecheck and tests.
4. Update TASKS.md with concrete tickets per agent for stage 1.
Stop and wait for my approval after step 2.
```
