# ADR 0005 — Admin and CMS (phase 2)

Status: accepted for phase 2 (2026-10-15). Implementation starts after launch; prompts/09 holds the full spec.

## Context
Only Oleg will edit. He needs to change lid designs, photos, partners, texts in 3 languages and see leads. MVP keeps content in the repo (messages/*.json, content/lids.json), so every edit needs us. The admin must not block the November launch.

## Options
1. **Custom admin** (Next.js route group + FastAPI `/v1/admin/*`, S3 storage, pyvips pipeline) — prompts/09.
   + exact fit: lid texture crop and atlas rebuild for the 3D wall, audit log, 2FA, data stays on our DB in Uzbekistan.
   − largest effort (≈ 3–4 weeks with tests and security review).
2. **Payload CMS 3 inside the Next.js app** (MIT, Postgres adapter).
   + ready UI, auth, media, localisation in ~1–2 weeks.
   − second data model next to FastAPI; atlas/KTX2 pipeline still custom; another dependency to secure.
3. **Directus or Strapi** as a separate service.
   + rich UI, no code for CRUD.
   − another container and licence to check (Directus BSL above revenue threshold), translation UX for 3 languages needs config, more attack surface.
4. **sqladmin on FastAPI** for leads only, content stays in git.
   + 2–3 days, enough for leads.
   − Oleg still cannot edit texts or images.

## Decision
- MVP: no admin. Leads are read in Telegram; content edits go through us (turnaround ≤ 1 working day).
- Phase 2 (start right after launch): option 1 per prompts/09, because the lid-texture/atlas pipeline and data localisation are core requirements. Re-evaluate option 2 at phase-2 kickoff only if the timeline must be under 2 weeks.

## Consequences
- MVP content files use the same shapes as the future tables (lids.json ↔ lid_designs, messages ↔ content_blocks) so seeding is a script.
- Leads table is created in MVP with `status`, so the admin leads screen needs no migration of old data.
