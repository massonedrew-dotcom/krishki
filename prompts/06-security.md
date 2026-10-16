# 06 — Security review (агент: security-reviewer)

```
Use the security-reviewer agent. Load krishki-security. Review the whole repo and the staging deployment: run semgrep --config auto, gitleaks detect, pnpm audit, pip-audit, bandit -r apps/api; check response headers and CSP with curl -I on staging for /, /ru, /api/healthz; try the lead endpoint with oversized fields, HTML/script payloads, invalid phones, missing Turnstile token, 20 rapid requests; verify the Telegram message escapes HTML; verify the DB is not reachable from the internet and the app DB role cannot ALTER or DROP. Write docs/security/<date>-full.md with findings by severity, evidence and fixes. Do not edit code.
```
