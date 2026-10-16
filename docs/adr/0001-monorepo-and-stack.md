# ADR 0001 — Monorepo and stack

Status: accepted (2026-10-15)

## Context
Three weeks to launch. One team of agents, one approver (Oleg). Needs: SSR pages in 3 languages, one form, a lead store, a Telegram notifier, phase 2 admin and 3D. CLAUDE.md fixes a stack; this ADR confirms it and limits the MVP part.

## Options
1. **pnpm monorepo: Next.js 15 + FastAPI + PostgreSQL** (CLAUDE.md stack).
   + clean split, typed API contract via OpenAPI, phase 2 admin and media pipeline (prompt 09) fit the Python side (pyvips, arq).
   − two runtimes, two CI jobs, more infra for an MVP with one endpoint.
2. **Next.js only** (route handler writes to Postgres via Drizzle and posts to Telegram).
   + fastest MVP, one deploy.
   − phase 2 admin/media pipeline would be rebuilt or moved later; diverges from the agreed stack and agent roles.
3. **Static site (Astro) + serverless form function**.
   + smallest JS.
   − no place for phase 2 admin and revalidation; new stack for the team.

## Decision
Option 1, with MVP limits: the API in MVP has only `/healthz` and `POST /v1/leads` (+ Telegram webhook in phase 2). Tooling: pnpm workspaces (no Turborepo until build time hurts), TypeScript strict, Tailwind v4, next-intl, ESLint + Prettier; Python 3.12 managed by uv, ruff + mypy + pytest. Node 24 LTS locally, `engines` ≥ 20.

## Consequences
- Shared enums (direction, product, lang) live in `packages/shared` and are generated from OpenAPI, so form and API never drift.
- Docker is needed for the db locally; the API can also run with `uv run` against a local Postgres.
- Phase 2 builds on the same API without migration.
