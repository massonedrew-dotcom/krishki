# Redesign v3 — fix what is broken, simplify the home page, new colours and fonts

- **Status**: proposed, waiting for the client's choice of direction (A / B / C)
- **Date**: 2026-10-19
- **Input**: client feedback in chat on 2026-10-19, with two screenshots. The lead checked the live Pages build at 1366 px and 390 px.
- **Owners**: frontend-dev for phases 1–3, threed-dev for phase 4. The lead reviews each phase against the DoD.

## What the client said, and what the lead found

| # | Client | Cause found in code |
|---|---|---|
| 1 | «Рассчитать тираж» → a big, ugly lid and the form at the bottom; the form must come first | The CTA goes to `/contacts#lead-form`. `PageHero` (`blocks/page-hero.tsx:23`) draws a 60rem decorative `.lid-disc` on every inner page, which leaves ~500 px of empty disc above the heading. On /contacts the form sits below the hero, the contacts and the map. |
| 1b | The left-to-right lid animation on the home page is gone | The 3D parade exists only in `prototypes/hero-scroll` (`/prototype/`). The site still shows the static slot `home/hero-parade-slot.tsx` (TODO task 5): an empty disc plus one static lid that drifts. |
| 2 | 50-piece tubes «потерялись картинки» | `page.tsx:160-161`: the tube images render at about 10 px. The `<Image>` has `max-h-full w-auto` inside an `aspect-[3/5]` flex box, and its height never resolves. |
| 3 | SKO is «слишком растянуто» | `page.tsx:114`: the SKO card is `lg:row-span-2`, but its photo is fixed at 4/3, so the card is half empty. The SKO page banner (`products/[slug]` banner `slide-02`) is a cropped old-site slide with baked-in text cut off («Крышки СКО / Лидер продаж»). |
| 4 | The home page is «не информативно, всё в куче» | In the hero, the headline (7 cols at text-88), the 2-col spec list and the disc overlap at 1280–1440 px (`page.tsx:36-66`). The 01–08 rail runs under the lid. After that come 9 sections with the same rhythm (eyebrow, big H2, list) and no clear path. |

## Phase 1 — bugs (no design decision needed, can start now)
1. `PageHero`: remove the giant disc from inner pages. Keep the hero compact (≤ 60 vh) and use real media on the right where a page has it.
2. /contacts: make the lead form the first block after a short heading, with contacts beside it at ≥ 1024 px. «Рассчитать тираж» and «Запросить прайс» land on the form with the right preset direction.
3. Tubes: give the image box a real height (`h-full w-full object-contain` on a fixed-height frame). Check every `TUBE.*` image on /, /brands and the product pages.
4. Product cards: drop `row-span-2` or make the photo fill the card height (`ratio="fill"`). No empty card body.
5. SKO and Twist-off banners: stop using old slides with baked-in text. Use the clean photos from `PHOTO.*`, or crop so no text is cut.
6. Home hero overlap: the spec list moves under the buttons as one row of three facts. The headline drops to a size that fits 7 columns at 1280 px. The rail sits below the media, not under it.
- DoD: Playwright 1440 / 1366 / 1280 / 390 for /, /products, /products/sko-i82, /products/twist-off, /brands and /contacts. No overlap; checked by the lead.

## Phase 2 — clearer home page (information architecture)
Order and content, each section with one job:
1. **Hero**: what we make, for whom, one CTA. Facts in one row: types, batch, since 1996.
2. **Products**: 3 equal cards (SKO / Twist-off / ring), each with a photo, 2 facts and «Подробнее».
3. **Tubes & brands**: the real tube photos, big, in a horizontal scroll on mobile.
4. **Why us**: the 6 reasons as a compact 3×2 grid with short text, not a tall numbered list.
5. **Services**: lacquering/litho and private label, the two existing stacking cards.
6. **Batch + CTA**: «1 000 – 10 000 000» with the form inline (ru name / phone / direction) instead of a link away.
7. **Partners**: the marquee. Then geography and the footer.
- Remove the duplicated «почему мы» facts that repeat the scale block.
- Copy stays in messages/*.json; no new facts.

## Phase 3 — new colours and fonts (needs the client's choice)
Three directions are offered (see the chat preview). All of them use free OFL fonts with Cyrillic and Uzbek oʻ gʻ, keep AA contrast, keep the «Мечта хозяйки» red for the main CTA and keep lacquer gold for the lids. The chosen one becomes the tokens in `globals.css`, DESIGN.md and krishki-design-system.

- **A — «Чистый завод»**: white and azure as now, but calmer. Fonts: Manrope (headings) + Golos Text (body) instead of Tektur + Onest. Least risk.
- **B — «Тёплая консервация»**: warm cream background, tomato red, gold, deep ink. Fonts: Playfair Display (headings) + Golos Text. Feels like food and the home kitchen.
- **C — «Промышленный премиум»**: deep navy sections, gold accents, white cards. Fonts: Unbounded (headings) + Inter Tight (body). Feels like a serious B2B factory.

After the choice: a token swap and a fonts swap (next/font, self-hosted), LICENSES.md, then a full impeccable / ui-ux-pro-max pass on every page. The fonts in `handoff/fonts` are proprietary or demo, so they are not used.

## Update 2026-10-19 (later the same day)
- The client sent two motion references and asked for a light, modern factory home with **three products moving in the centre**. They are adapted into `prompts/10-light-cinematic-home.md`, taking techniques only and not copying any code or assets. That prompt **replaces phase 4 below** and absorbs phase 2's home structure. Tickets 20–23 are in TASKS.md.
- Fonts: the client's six fonts (`C:\Users\user\Desktop\шрифт`) were checked with fontTools. None has the Uzbek Latin oʻ gʻ (U+02BB), five lack Ў Қ Ғ Ҳ, and all are demo, commercial or unlicensed. They are not usable for site text; at most one could be a decorative Russian-only accent once the licence is bought. Free alternatives are compared in `docs/research/fonts-specimen.png`. Montserrat covers everything; Unbounded and Playfair Display miss only Ғ Ҳ, which a fallback stack can cover. The client chooses.
- Lid facts and standards: `docs/research/lid-standards.md`.

## Phase 4 — the lid parade on the home page (task 5, threed-dev) — superseded by prompts/10
Move the prototype parade (`prototypes/hero-scroll`) into `HeroParadeSlot` as a lazy R3F canvas, with the static render as the fallback, within the budgets: hero JS < 60 KB gz and LCP < 2.5 s on mobile. This is what brings back the left-to-right lid animation.

## Order
Phase 1 now (bugs) → phase 3 once the direction is chosen → phase 2 on the new tokens → phase 4 in parallel with phase 2 (different files: threed-dev owns `components/home/hero-parade-slot.tsx` and the 3D code).

## Font decision 2026-10-19
The client asked the lead to pick «адекватно и профессионально». Chosen: **Montserrat** (headings, 700/800) + **Inter** (text and UI, 400/500/600). Both are OFL, self-hosted via next/font. They replace Tektur + Onest when ticket 23 lands.
- 22 Google fonts were checked with fontTools for Cyrillic, Uzbek Cyrillic (Ў Қ Ғ Ҳ), Uzbek Latin (oʻ gʻ = U+02BB) and English; 14 cover everything.
- Of the three shortlisted pairs (`docs/research/font-pairs.png`), IBM Plex draws ʻ with a visible gap, and Commissioner is softer. Montserrat + Inter reads as the most corporate-industrial.
- Manrope, Unbounded, Jost, Rubik, PT Sans/Serif and Golos fail at least one Uzbek glyph.
