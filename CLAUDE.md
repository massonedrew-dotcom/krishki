# CLAUDE.md — ELIT KONSERVA / krishki.uz

## Project
B2B website for ELIT KONSERVA (Kokand, Uzbekistan, since 1996), brand «Мечта хозяйки» and «Елисейские крышки».
Products: SKO I-82 lids, Twist-Off lids, wikel sealing rings. Services: tin lacquering (PPG lacquers), tin lithography, private-label lids.
Orders from 1,000 to 10,000,000 units. Export to Central Asia.
Goal of the site: generate qualified B2B leads (wholesale, export, private label, retail) and show factory credibility.

## Stack (do not change without approval)
- Monorepo (pnpm workspaces): `apps/web`, `apps/api`, `packages/shared`
- Frontend: Next.js 15 App Router, TypeScript strict, Tailwind CSS v4, next-intl (ru default, uz, en)
- Motion and 3D: GSAP + ScrollTrigger, Lenis, three, @react-three/fiber, @react-three/drei
- Backend: FastAPI (Python 3.12), SQLAlchemy 2 + Alembic, PostgreSQL 16, Pydantic v2, aiogram 3 notifier
- Infra: Docker Compose, Caddy (TLS + reverse proxy), GitHub Actions CI
- Frontend may deploy to Vercel; API + DB on a VPS

## Skills to load
- Project skills in `.claude/skills/`: krishki-domain, krishki-design-system, krishki-3d, krishki-backend, krishki-security, krishki-seo-i18n, krishki-qa
- Community skills (installed by scripts/install.*): impeccable, ui-ux-pro-max, taste-skill, awwwards-3d
- Always load krishki-domain before writing any copy or data model

## Roles (subagents in `.claude/agents/`)
architect, frontend-dev, threed-dev, backend-dev, security-reviewer, qa-seo, marketer (research, positioning, page structure), web-designer (style directions, mockups, visual review).
Task ownership is in TASKS.md. Every task must name its owner and its Definition of Done.

## Orchestration (lead architect = the main Claude session)
The main session is the lead architect. It owns the plan, splits work, starts the subagents and accepts or rejects their results. Subagents cannot start other subagents, so all delegation goes through the main session.
1. Before delegating: the ticket in TASKS.md has owner, inputs, file scope and DoD. The brief names exactly which files/folders the agent may write. Two agents never write the same files at the same time.
2. Parallel work only on disjoint scopes (e.g. apps/web vs apps/api). Shared files (root package.json, CI, packages/shared, docs/adr) are written by the lead only.
3. After each agent run the lead reviews before accepting:
   - read the diff (`git diff --stat`, then the changed files);
   - re-run the checks itself (lint, typecheck, tests, build) — an agent's "done" is not evidence;
   - check scope (no files outside the brief), CLAUDE.md rules (no secrets, no invented facts, copy only in messages/*.json, licences recorded);
   - UI: open the Playwright screenshots 1440/390 and look at them;
   - result is recorded in docs/reviews/<date>-<task>.md: accepted / changes requested, with file:line.
4. Rejected work goes back to the same agent with concrete findings; the lead does not silently fix large problems itself.
5. The lead updates TASKS.md statuses and reports to the user in Russian.
6. The `architect` subagent is used only for isolated design write-ups (ADRs, API contracts); decisions are approved by the lead and the user.

### When to delegate vs do it in the main loop (adopted 2026-10-26)
Source: Anthropic, "Building agents: when to fold subagents into your main agent loop" (2026-10-22). Default is a single main loop with skills; a subagent must earn its place.
- **Do in the main loop (load the matching skill):** work that chains on what this session already knows, edits the same files, or is a few steps — small UI fixes, copy changes, wiring assets, design decisions, marketing/positioning reasoning, plan updates. Every handoff is a lossy summary and adds latency.
- **Use a subagent only for:** (a) parallel independent work that needs a fresh, throwaway context (multi-angle web research, a separate component with a clean interface such as the 3D background); (b) black-box verification (security-reviewer, qa-seo, an independent visual review); (c) a context that is measurably bloated or needs different tool permissions.
- **Fold chained specialists together:** if agent B always consumes agent A's output (e.g. marketer → web-designer), run them as one task in the main loop or one agent, not a relay.
- **Brief by context, not by org chart:** give a subagent a piece that needs little from the rest of the system and ask for a compact result (files + checks + findings), not a narrative.
- **One writer per build dir:** never let two agents run `next build`/`next start` in `apps/web` at once (the shared `.next` corrupts; seen on ticket 24).
- **Measure before changing the setup:** keep a small set of golden checks per area (Playwright specs, lint/typecheck/build, pytest); change one thing at a time and keep what holds up.

## Working rules
1. Plan first: for any task larger than one file, write the plan to `docs/plans/<task>.md` and wait for approval.
2. Small commits, conventional commit messages, one concern per PR.
3. Never commit secrets. All config through `.env` files listed in `.env.example`.
4. Every UI change: Playwright screenshots at 1440px and 390px, compared before reporting done.
5. Every API change: pytest passing, OpenAPI schema updated, shared types regenerated.
6. Third-party code: check LICENSE first, record it in LICENSES.md. No code without a license. No copying layout, branding or copy from existing commercial sites.
7. Performance budget is a hard requirement (see krishki-qa).
8. Write in English in code and comments; UI copy comes from `apps/web/messages/{ru,uz,en}.json`.
