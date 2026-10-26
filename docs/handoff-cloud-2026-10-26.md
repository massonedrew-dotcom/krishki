# Handoff to the cloud session — 2026-10-26

Branch `redesign-v4`. The last commit "wip: …" holds UNREVIEWED work that two local agents stopped mid-step (the user's limits were running out). Treat it as a draft: review before building on it.

## Client decisions (do not re-ask)
- Style: **C «Чертёж на жести»** site-wide; **home first screen in A «Лаковая печь»** (dark graphite #110F0C, gold accent). Gold only as an accent. Red only for «Заказать». Montserrat + Inter. Details: `docs/design/style-directions.md` (end: "Decision 2026-10-26").
- Hero: a **3D lid in the centre that changes on scroll**: SKO gold → flips to the inside (silver enamel + GREY rubber ring) → Twist-off red → Twist-off green. Idle: slow turntable. Reduced motion / no WebGL: photo `apps/web/public/images/lids/sko-34-*.webp`.
- No prices or commercial terms anywhere («Цены и условия сообщим после заявки»).
- Domain: **https://elit-konserva.com** (not krishki.uz).
- Competitor benchmark: krishki-surur.uz (must look clearly better, modern, with 3D).
- Open question to the client: who the «Поставщикам» tab is for (page is a neutral shell).

## State
- Done and reviewed (committed earlier on this branch): new lid photos, single tubes `TUBE_V2`, logo v2, two-row header + /distributors /order /suppliers (`docs/reviews/2026-10-26-24-header-tabs.md`), plan `docs/plans/home-redesign-v4.md`, research, style directions.
- WIP, unreviewed (in the wip commit):
  - Ticket 25 (frontend): style C tokens/fonts site-wide, home page in A+C, comparison spec table, factory line + timeline, `components/home/hero-lid-slot.tsx`. Stopped mid-way — check `git show --stat HEAD` and finish per the brief in TASKS.md row 25.
  - Ticket 26 (3D background, `components/home/background/**`, dev route `app/bg-demo`) and 26b (scroll-driven hero lid, `components/home/hero-lid/**`). Known: ring must read grey; fogged lids must not show pale silhouettes; mount both in `app/[locale]/page.tsx` (background behind all sections, hero lid in the hero slot), one WebGL context if possible.
- Read `CLAUDE.md` first (rules, review process, "When to delegate vs do it in the main loop").

## What done looks like
1. Ticket 25 finished; 26 + 26b reviewed, fixed and mounted on the home page.
2. `pnpm --filter web lint`, `typecheck`, `build` pass; Playwright e2e (`apps/web/e2e/*`) pass; screenshots 1440/390 checked by eye.
3. Reviews in `docs/reviews/`, TASKS.md statuses updated, small conventional commits on `redesign-v4`, pushed.
4. A preview the client can open: build the GitHub Pages static preview the way `.github/workflows` already does (check the workflow; it may need the branch added) and report the URL.
5. Report to the user in Russian.
