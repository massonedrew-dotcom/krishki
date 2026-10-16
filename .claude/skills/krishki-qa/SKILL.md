---
name: krishki-qa
description: Definition of Done, performance budgets, accessibility and testing workflow (Playwright, Lighthouse, pytest) for krishki.uz. Load before declaring any task done and for every QA pass.
---

# Definition of Done (every task)
- [ ] Works in ru, uz, en
- [ ] Playwright screenshots at 1440×900 and 390×844 saved to `qa/screens/<task>/` and checked by eye
- [ ] No console errors or warnings
- [ ] Lint + typecheck + tests green
- [ ] Budgets below respected (Lighthouse CI on the preview)
- [ ] Keyboard navigable, visible focus, contrast AA
- [ ] prefers-reduced-motion respected
- [ ] LICENSES.md updated if third-party code was added

# Budgets (mobile, Lighthouse, Moto G Power profile)
- LCP < 2.5 s, CLS < 0.05, INP < 200 ms, TBT < 200 ms
- Initial JS < 170 KB gz (3D chunks excluded, lazy)
- Hero LCP image < 120 KB
- Performance score ≥ 90, Accessibility ≥ 95, SEO 100

# Tests
- Frontend: vitest for utils and form schema; Playwright e2e: lead submit per direction (API mocked + one real staging run), language switch, lid filters, mobile fallback for lid wall, reduced-motion.
- Backend: pytest + httpx AsyncClient + testcontainers Postgres; cases: valid lead, invalid phone, honeypot filled, rate limit hit, Telegram down (lead still saved), duplicate within 10 min.
- Use Playwright CLI (not MCP) for speed: `npx playwright test`, `npx playwright screenshot`.

# Accessibility
- Canvas elements have `aria-hidden="true"` and an equivalent HTML description/list next to them.
- The lid wall is fully usable as a list of buttons for keyboard and screen readers.
- Form: labels, error messages linked via aria-describedby, success state announced (aria-live).
