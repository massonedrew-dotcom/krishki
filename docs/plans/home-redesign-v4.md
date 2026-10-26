# Home redesign v4 — factory-first home, top audience tabs, living background

- **Status**: proposed, waiting for the client's approval
- **Date**: 2026-10-26
- **Input**: client chat 2026-10-26. Redo the look and the background animation of the home page; apply the earlier edits (docs/plans/redesign-v3.md); make the home page informative about the factory; buttons at the top; separate tabs «Поставщикам», «Дистрибьюторам», «Заказать». The style reference (`index (1).html`) was sent only to show the *kind* of background: a full-screen animated scene behind the content. Its layout, neon look, copy and code are **not** used.
- **Already decided**: light direction A, Montserrat + Inter (redesign-v3, 2026-10-19); three products SKO / Twist-off / wikel ring; new 2K lid photos in `assets/generated/lids-2026-10-26/` (generated 2026-10-26).
- **Owners**: lead (plan, shared files, review), frontend-dev (header, pages, sections), threed-dev (background), qa-seo (final pass).
- **Deadline**: launch 9 Nov 2026 (TASKS.md). This plan replaces ticket 23's home part.

## 1. What the client asked → what we do
| # | Ask | Answer in this plan |
|---|---|---|
| 1 | New look and design | Light factory style: white/mist surfaces, azure UI, red only for «Заказать», gold only on lids. Montserrat + Inter. Fewer, larger sections, one job each. |
| 2 | Background animation | One fixed, full-page background layer behind all sections (section 4). Our own scene with lids, not the reference's city. |
| 3 | Earlier edits | redesign-v3 phase 1 is done (ticket 19). Phase 2 (one job per section, no repeated facts, form inline) is built into section 3. |
| 4 | Informative about the factory | A «Завод» block on the home page: timeline 1996 → 2014 → 2016 → 2022, the production chain, quality control, packing, geography. Only facts from docs/content-inventory.md. |
| 5 | Buttons at the top | A two-row header (section 2). |
| 6 | Tabs «Поставщикам», «Дистрибьюторам», «Заказать» | Three separate pages linked from the top row of the header (section 2.2). |

## 2. Header and the new tabs
### 2.1 Header (all pages)
- **Top row** (thin, mist background): `Поставщикам` · `Дистрибьюторам` · **`Заказать`** (red button) · phone · language switch ru/uz/en.
- **Main row**: logo «Мечта хозяйки» + ELIT KONSERVA · Продукция · О заводе · Услуги · Бренды · Контакты.
- Below 1280 px: the top row collapses into the burger sheet; «Заказать» stays visible next to the burger. The sheet is appended to `<body>` (ticket 17 bug).
- Sticky on scroll, shrinks to the main row only; the «Заказать» button moves into the main row.

### 2.2 Three new pages (ru/uz/en, copy in messages/*.json)
| Tab | Route | For whom | Content | Form preset |
|---|---|---|---|---|
| Поставщикам | `/[locale]/suppliers` | **to confirm, see Q1** | depends on Q1 | depends on Q1 |
| Дистрибьюторам | `/[locale]/distributors` | wholesalers and export buyers in CIS | assortment (SKO, Twist-off, ring, brand lines), packing and lots (1,000 to 10,000,000, tube/box sizes), samples, CIS geography, partners, «Запросить прайс» | `b2b_wholesale` / `export` |
| Заказать | `/[locale]/order` | anyone ready to order | the lead form first (product, quantity, direction, contacts), then 3 steps «заявка → прайс и образцы → поставка», contacts | chosen in the form |

Distributor terms (discounts, MOQ per design, delivery terms, prices) are not known: they stay `TODO(client)` and are not shown.

## 3. Home page structure (top to bottom)
1. **Hero**: who we are in one line («Завод металлических крышек в Коканде с 1996 года»), CTA «Заказать» + «Запросить прайс», one row of 3 facts (since 1996 · 1,000 to 10,000,000 pcs · export to Central Asia). The background (section 4) is live behind it.
2. **Products**: 3 equal cards SKO / Twist-off / wikel ring with the new photos (top + inside view), 2 facts each, «Подробнее».
3. **The factory**: timeline 1996 / 2014 / 2016 / 2022; production chain lacquering (PPG) → lithography → stamping → rings → packing; in-house lab checks each batch; old-site photos where use rights allow (TODO(client)).
4. **Who we work with**: 3 cards linking to the tabs: Дистрибьюторам · Поставщикам · Под вашу марку.
5. **Brands in tubes**: the real tube photos, horizontal scroll on mobile.
6. **Services**: lacquering/lithography and private label (the two existing cards).
7. **Partners**: marquee (logo permission TODO(client)).
8. **Geography + order**: the CIS map strip and the inline form (name / phone / direction).
Removed: the separate «Scale» and «Why us» blocks (their facts move into the hero and the factory block, no duplicates).

## 4. Background animation
- One `<canvas>` fixed behind the page, `aria-hidden`, z-index under the content. Sections sit on white or frosted panels so text keeps AA contrast.
- Scene: a soft light «liquid tin» field (pearl-white to sky tones, slow), with lids (the existing GLBs: gold SKO, red/green Twist-off, the ring) floating at different depths. Scroll moves the camera slowly through them; each section has its own mood: hero (lids drift in), products (the three come forward), factory (lids line up like a production line), order (they settle).
- Tiers: desktop full; mobile fewer lids, lower DPR; `prefers-reduced-motion` and no-WebGL get a static image of the same scene.
- Budgets (krishki-qa): LCP < 2.5 s on mobile, the canvas loads lazily after LCP, JS for the background < 60 KB gz above three itself, ≥ 50 fps desktop / ≥ 30 fps mid Android.
- Reuse: the shader and turntable work from `prototypes/light-home/` (ticket 20), not the reference file.

## 5. Images
- Convert the accepted 2K lid photos to WebP 1600/800 with transparent background (`remove_background` is not needed: they are on white; a cutout is made only for cards that sit on colour). Store under `apps/web/public/images/lids/`. Originals stay out of git (132 MB); add `assets/generated/` to .gitignore.
- Rejected: 10 and 11 (macro ring: wrong red ring, dented rim). 06 has a red-brown ring: not used until the ring colour is confirmed (Q3).
- LICENSES.md: record that the images are generated with Higgsfield (Nano Banana 2.1) from the client's own photos.

## 6. Work split and order
| Step | Owner | Files (write scope) | DoD |
|---|---|---|---|
| A. Plan, .gitignore, image conversion, LICENSES.md | lead | `docs/plans`, `.gitignore`, `LICENSES.md`, `apps/web/public/images/lids/` | images ≤ 200 KB each at 1600 |
| B. Header two rows + 3 new pages + messages ru/uz/en | frontend-dev | `components/ui/header.tsx`, `main-nav.tsx`, `mobile-menu.tsx`, `site.css`, `app/[locale]/{suppliers,distributors,order}/`, `messages/*.json` | screenshots 1440/1280/390 ×3 langs; keyboard; lint/typecheck/build |
| C. Home sections 1–8 | frontend-dev (after B, same messages file) | `app/[locale]/page.tsx`, `components/home/*` except the background | DoD krishki-qa, no invented facts |
| D. Background layer | threed-dev (parallel with B/C) | `components/home/background/*` only | budgets in section 4, fallbacks shot |
| E. QA, SEO for new routes (metadata, sitemap, hreflang) | qa-seo | `qa/`, report | no fail |
Each step is reviewed by the lead in `docs/reviews/2026-10-xx-<step>.md`. B and D run in parallel (disjoint files); C waits for B.

Rough timing: A 26 Oct · B 27–28 Oct · D 27–30 Oct · C 29–31 Oct · E 1–2 Nov. Leaves a week before 9 Nov for client edits.

## 7. Open questions for the client
1. **«Поставщикам»** — who is it for? (a) companies that supply the factory with tin, lacquer, rubber; (b) canneries and food producers that buy lids (then it overlaps with «Дистрибьюторам»); (c) something else from your ТЗ — please send that ТЗ file, it is not in the project.
2. **Distributor terms**: can we show any (minimum lot per region, samples free or paid, dealer discount)? If not, the page says «условия — по запросу».
3. **Rubber ring colour** in SKO lids (beige, grey, translucent?), for the inside photo.
4. Use rights for the old-site factory photos (needed for the factory block).
