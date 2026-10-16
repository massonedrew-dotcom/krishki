# 08 — QA and launch (агенты: qa-seo, security-reviewer, architect)

```
Use the qa-seo agent: run the full Definition of Done from krishki-qa on staging for every page in ru, uz, en; Lighthouse CI mobile; axe; Playwright e2e including a real lead to the staging Telegram group. Then the security-reviewer agent runs prompt 06 again on the release candidate. Then the architect agent writes docs/launch-checklist.md: DNS and TLS, 301 redirects from every old krishki.uz URL (/produkciya/, /uslugi/, /o-nas/, /polezno-znat/) to the new ones, Search Console and Yandex Webmaster verification, sitemap submission, Google Business Profile and Yandex Business URL update, backup restore test, monitoring (uptime + error alerts to Telegram), rollback plan. Do not deploy to production without my explicit go.
```
