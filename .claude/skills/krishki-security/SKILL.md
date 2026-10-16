---
name: krishki-security
description: Security baseline and review checklist for krishki.uz (Next.js + FastAPI + PostgreSQL + Telegram bot). Load before any work touching forms, API, auth, headers, infra, dependencies or secrets, and for every security review.
---

# Security baseline

## Threat model (short)
Assets: leads (personal data: name, phone), Telegram bot token, DB, admin panel, site reputation.
Threats: form spam/flooding, bot token leak, injection, XSS via lead text shown in admin/Telegram, admin brute force, supply-chain (npm/pip), defacement, DDoS on the 3D assets.

## Must-haves
1. Secrets: only env vars; `.env*` in .gitignore; gitleaks in CI and pre-commit. Rotate the Telegram token if it ever appears in a log or commit.
2. Input: Zod on the client, Pydantic on the server (server is the source of truth). Length limits on every field. Phone normalised to E.164.
3. Output: escape lead text for Telegram (parse_mode HTML with html.escape) and admin. Never render user input with dangerouslySetInnerHTML.
4. Anti-spam: Cloudflare Turnstile, honeypot field, min time-to-submit 3 s, rate limits (see krishki-backend).
5. DB: least-privilege role for the app (no DROP/ALTER), DB port not public, SQLAlchemy parameters only, no raw string SQL.
6. Headers (Caddy + next.config): HSTS (max-age 1y, includeSubDomains), CSP with nonces (script-src self + nonce + challenges.cloudflare.com; worker-src blob: for three loaders; img-src self data: blob:), X-Content-Type-Options nosniff, Referrer-Policy strict-origin-when-cross-origin, Permissions-Policy (camera=(), microphone=(), geolocation=()), frame-ancestors 'none'.
7. CORS: API accepts only the site origin; server-to-server calls use `X-Site-Key`.
8. Admin: not public; basic auth + IP allowlist or SSO; 2FA if a CMS is used; login rate limiting.
9. Dependencies: lockfiles committed, `pnpm audit` / `pip-audit` in CI, Renovate/Dependabot weekly, pin GitHub Actions by SHA.
10. Logging: no PII or tokens in logs; store ip_hash, not raw IP; log retention 30 days.
11. Privacy: privacy policy page in ru/uz/en (Uzbekistan personal data law — data localisation question goes to the client's lawyer: TODO(client)); consent checkbox on the form; lead retention policy.
12. Backups: nightly encrypted pg_dump off-server, monthly restore test.
13. Server: SSH keys only, no root login, ufw (22, 80, 443), fail2ban, unattended-upgrades.

## Review checklist (security-reviewer agent)
Go through OWASP Top 10 2025 for the diff; run `semgrep --config auto`, `gitleaks detect`, `pnpm audit`, `pip-audit`, `bandit -r apps/api`; check headers with `curl -I` on staging; output findings as Critical/High/Medium/Low with file:line and a concrete fix. No "looks fine" without evidence.
