# ADR 0002 — Lead pipeline

Status: accepted (2026-10-15)

## Context
The site exists to produce leads. Today all leads go to Oleg. Top buyer question is price, so most leads are "Запросить прайс". Leads hold personal data (name, phone). Telegram is the agreed channel; email access is unclear.

## Options
1. **Form → Next.js server action → FastAPI → PostgreSQL → Telegram (background, retries)**.
   + lead is never lost if Telegram fails; anti-spam and validation in one place; status history ready for phase 2.
   − needs DB and API before launch.
2. **Form → Telegram directly from a Next.js route handler, no DB**.
   + 1 day of work.
   − a Telegram outage or a deleted message loses the lead; no rate limit storage; no analytics by direction; personal data lives only in Telegram.
3. **Third-party form service (Formspree, Bitrix24 form)**.
   + no backend.
   − data abroad, monthly fee, weak control of spam and UX, no localisation of PD.

## Decision
Option 1 as described in krishki-backend, trimmed for MVP:
- MVP: `POST /v1/leads` with Pydantic validation, Turnstile, honeypot, min time 3 s, rate limit (5 / 10 min per ip_hash), 10-min phone dedupe, 201 `{id}`; Telegram message to one group (forum topics per direction created now, all read by Oleg); 3 retries with backoff; admin alert; SMTP email fallback if a mailbox is available (TODO(client)).
- Phase 2: inline buttons «В работу» / «Спам» with webhook, per-manager routing, CSV export in admin.
- Form fields: name, phone (E.164, default +998), company (optional), country, direction (b2b_wholesale, export, private_label, retail, services), product (preset by page), volume range, message (optional), consent checkbox. Hidden: lang, source_page, UTM.

## Consequences
- Telegram is a notification channel, the DB is the source of truth.
- Telegram servers are abroad: if the lawyer says lead data cannot leave Uzbekistan, the Telegram message carries only the lead id, direction and country, and Oleg opens the full card in the admin (phase 2) — fallback decision, to confirm with the lawyer.
- Turnstile needs a Cloudflare account (free) owned by the company.
