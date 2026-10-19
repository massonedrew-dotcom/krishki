# QA pass — live static preview (GitHub Pages)

- **Date**: 2026-10-19
- **Target**: https://massonedrew-dotcom.github.io/krishki/ (`/ru/`, `/uz/`, `/en/`), deployed from `main` @ `a3f1c76`
- **Checklists**: `.claude/skills/krishki-qa/SKILL.md`, `.claude/skills/krishki-seo-i18n/SKILL.md`
- **Mode**: read-only. This file is the only change.
- **Verdict**: **not launch-ready**. One Critical layout bug affects every inner page, and the mobile performance budget is missed on every page measured.

## Coverage

All 13 routes in `apps/web/e2e/pages.spec.ts` (`""`, `/products`, `/products/sko-i82`, `/products/twist-off`, `/products/wikel-ring`, `/brands`, `/services`, `/private-label`, `/about`, `/useful`, `/contacts`, `/privacy`, `/styleguide`) were checked in **all three locales**, 39 pages in total. The spec itself covers only a subset of uz/en.

| Check | Tool | Scope |
|---|---|---|
| Console errors/warnings, failed requests | Playwright 1.64 (Chromium 1248) | 39 pages |
| axe-core (`wcag2a/aa`, `wcag21aa`, `wcag22aa`, `best-practice`) | @axe-core/playwright 4.13, 1440 px, after scroll-reveal | 39 pages |
| Horizontal overflow | `scrollWidth − innerWidth` at 390 / 768 / 1280 / 1440, after a full scroll | 39 pages × 4 |
| Broken images | `img.complete && naturalWidth === 0` | 39 pages |
| Broken links | every unique `a[href]` (48), GET without following redirects | whole site |
| Meta: title, description, canonical, hreflang, OG, JSON-LD, H1 | DOM read | 39 pages |
| Uzbek glyphs | counts of U+02BB vs U+2018/U+2019/`'`/`` ` `` in `body.innerText`; `@font-face` unicode-range | 13 uz pages |
| Lighthouse 12, mobile (default Moto G Power profile) + desktop preset | 13 ru + 3 uz + 2 en pages = 36 runs; 5 pages re-run 3× with a fresh browser (30 runs) | 18 pages |

**Measurement caveat.** Lighthouse ran on a Windows workstation against the GitHub Pages CDN. Run-to-run variance was large: TBT for the same URL ranged from 584 ms to 31 s. Medians of 3 fresh-browser runs are quoted where available. Treat absolute numbers as indicative. The direction is consistent: no mobile run on any page met the TBT or Performance budget. Authoritative numbers should come from Lighthouse CI in GitHub Actions (ticket 12).

## Findings

| # | Severity | Page | Issue | Evidence | Owner |
|---|---|---|---|---|---|
| 1 | **Critical** | All inner pages (12 routes × 3 locales; not the home page) | **The first screen is an empty decorative disc and the H1 sits below the fold.** `.lid-disc { position: relative }` in `site.css` is unlayered CSS. It beats Tailwind's layered `absolute` utility on the `PageHero` disc, so the 736 px / 960 px disc enters normal flow and pushes the hero copy down. | Computed `position: relative`, disc height 960 px on `/ru/about/` at 1440. H1 `top` = **887 px at 390×844** and **1193–1265 px at 1440×900** on every inner route (fold 844/900). Home is fine: 143 / 225 px. Lighthouse picks the header logo or brand text as LCP on inner pages, which confirms that no hero content is painted above the fold. Source: `apps/web/src/components/ui/site.css:367-369`, `apps/web/src/components/blocks/page-hero.tsx:21-24`. The same `absolute` is defeated in `lid-viewer-slot.tsx:13`, `hero-parade-slot.tsx:20` and `brands/page.tsx:52`. Fix: drop `position: relative` from `.lid-disc`, or move `site.css` rules into `@layer components`. | frontend-dev |
| 2 | High | All pages, mobile | **Mobile performance budget missed** (Perf ≥ 90, TBT < 200 ms, LCP < 2.5 s). | Median of 3 fresh runs: `/ru/` Perf 76 · LCP 3.09 s · TBT 672 ms; `/ru/about/` 72 · 3.31 s · 965 ms; `/ru/contacts/` 79 · 2.24 s · 786 ms; `/ru/useful/` 64 · 2.54 s · 2.33 s; `/ru/products/sko-i82/` 70 · 3.14 s · 1.14 s. Single runs on the other pages: Perf 62–92, TBT 278–1026 ms. Best page: `/uz/products/sko-i82/` (92, but TBT 278 ms). Bootup on `/ru/` mobile: the GSAP/ScrollTrigger chunk `e809d3ec` takes 1.3 s and `react-dom` 0.55 s. `max-potential-fid`, `mainthread-work-breakdown` and `bootup-time` fail on 16–24 of 36 runs. The motion engine is lazy (`motion-root.tsx:38`), but it starts immediately after hydration, so it still lands inside the TBT window. Recommend deferring it until idle or first interaction on mobile, and checking the split-text and reveal setup for forced reflow (`forced-reflow-insight` flagged on 3 runs). | frontend-dev |
| 3 | High | `/ru/products/sko-i82/` (desktop) | Desktop performance on the SKO product page is bad and reproducible, unlike every other page on desktop (95–100). | 3 fresh desktop runs: Perf 42 / 58 / 54, TBT 7.3 s / 2.8 s / 2.3 s. Also seen in the first pass on `/ru/products/` desktop (Perf 45, Speed Index 6.3 s) and `/ru/services/` desktop (58, TBT 5.7 s). Likely the lid viewer plus parallax ScrollTriggers. Needs a performance trace. | frontend-dev |
| 4 | High | All 39 pages | **No OG image and no JSON-LD.** krishki-seo-i18n requires a 1200×630 OG image per locale and Organization, LocalBusiness, Product and BreadcrumbList structured data. | `og:image` is null and there are 0 `application/ld+json` scripts on all 39 pages. `twitter:card` = `summary`. `seo.ts:12` still says `TODO(task 10)`. | frontend-dev (ticket 10) |
| 5 | High | Site-wide | **No `sitemap.xml` and no `robots.txt`.** They are missing from the source, not just from the preview. | `/krishki/sitemap.xml` and `/krishki/robots.txt` return 404. There is no `app/sitemap.ts` or `app/robots.ts` in `apps/web/src`. | frontend-dev (ticket 10), qa-seo verifies |
| 6 | Medium | Initial JS, all pages | **Initial JS budget exceeded**: 183–197 KB gz against a limit of < 170 KB (3D excluded; there is no 3D on these pages). | Lighthouse script transfer on `/ru/` mobile: `6da73edf` (react-dom) 54 KB, `331` 46 KB, `185` (GSAP + Lenis) 30 KB, `619` 22 KB, `e809d3ec` (ScrollTrigger) 20 KB, plus page and runtime chunks. `/ru/useful/` desktop came in at 130 KB, which suggests the motion chunks are optional there. `legacy-javascript` is flagged on 36/36 runs (~12 KB of polyfills). | frontend-dev |
| 7 | Medium | `/about` (ru, uz, en) | **Contrast failure** on the three stat numbers: `text-azure-500` on `surface-sky`. | axe `color-contrast` (serious): `#1e98cc` on `#eaf4fb` = **2.93:1**, 48 px semibold, needs 3:1. Selector `.gap-x-8.gap-y-2.border-b > .leading-none.text-azure-500.font-display`. Confirmed after the reveal animation finished, so it is not a mid-fade artefact. Use a darker azure (e.g. azure-600/700) on sky surfaces. | frontend-dev |
| 8 | Medium | All pages ≥ 768 px | axe `region` (moderate): the top bar (city/since, phone, WhatsApp, Telegram, language switch) is outside any landmark. | `header.tsx:25`: `.topbar` is rendered before and outside `<header className="site-header">` (line 46). 4 nodes per page on all 39 pages. Move the topbar inside `<header>` or give it its own landmark (`<aside aria-label>` / `role="region"`). | frontend-dev |
| 9 | Low | `/products` (ru, uz, en) | axe `heading-order` (moderate): catalogue cards go from H1 straight to H3. | `/ru/products/` outline: `H1` → 7 × `H3` (card titles) → `H2 «СКО или твист-офф?»`. Add a visually hidden H2 for the grid, or make the card titles H2. Lighthouse a11y 98–99 on this page only. | frontend-dev |
| 10 | Low | `/styleguide` (ru, uz, en) at 390 | Real horizontal overflow of 341–421 px: the typography specimen column is about 795 px wide on a 390 px screen. `body { overflow-x: clip }` hides it, so the content is cut off rather than scrollable. | Offenders `h2.text-48.md:col-span-3`, `div.md:col-span-9`, `p.font-display.text-64` at `right = 731–811 px`. The page is `noindex`, so the user impact is internal only. | frontend-dev |
| 11 | Low | `/products` at 390, `/products/sko-i82` and `/twist-off` at 768 | Transient overflow (18–58 px) **before** scroll-reveal runs: `h2.split` and `.arrow-link` start translated to the right. It disappears once elements reveal, and `body { overflow-x: clip }` prevents a scrollbar. No visible defect, but it explains why the e2e overflow assertion can be flaky. | Measured after a scripted full scroll: `/ru/products/` sw=417; `/ru/products/sko-i82/` 768 sw=826 (`span.arrow-link r=826`). Re-measured after scrolling the element into view and waiting 1.5 s: table 361 px inside an `overflow-x-auto` wrapper, `.arrow-link right = 366`, no overflow. | frontend-dev |
| 12 | Low | 404 (any unknown path) | The 404 is Next's default English page: «404: This page could not be found», with `lang=""` and no site chrome or language links. | `/krishki/ru/nonexistent/` → 404, default body. There is no `not-found.tsx` under `apps/web/src/app`. The static export makes this more visible, but the same gap exists in the standalone build. | frontend-dev |

## Checks that passed

- **Console**: 0 errors or warnings, 0 `pageerror`, and 0 failed requests (≥ 400 or network failure) on all 39 pages.
- **Images**: 0 broken images, and every `<img>` has an `alt` attribute (decorative ones use `alt=""`).
- **Links**: 48 unique hrefs. All internal links return 200. `wa.me` → 302 to `api.whatsapp.com`, which is expected. The `tel:` and `mailto:` links are well-formed.
- **Titles and descriptions**: unique per page and locale, all titles ≤ 60 characters and all descriptions ≤ 155. Exactly one `<h1>` and the correct `<html lang>` on all 39 pages.
- **canonical + hreflang**: present on every indexable page: `ru-UZ`, `uz-UZ`, `en`, `x-default` → `/ru/…`, with absolute URLs on `https://krishki.uz` and a trailing slash. `/styleguide` has no canonical or hreflang and is `noindex, nofollow`, which is intended (`styleguide/page.tsx:12`).
- **Lighthouse SEO**: 100 on every page except `/privacy` (66) and `/styleguide` (63), which fail only `is-crawlable`. Both are intentionally `noindex` (`privacy/page.tsx:12`, `styleguide/page.tsx:12`). Confirm with the client that the privacy page should stay out of the index.
- **Lighthouse a11y / best practices**: a11y 100 everywhere except `/products` (98–99, see #9). Best practices 100 everywhere.
- **CLS**: ≤ 0.016 on all runs (budget < 0.05).
- **Desktop performance**: 95–100 on 14 of 18 pages (exceptions in #3).
- **Uzbek glyphs**: all 13 uz pages use **U+02BB** only (23–53 occurrences per page). There are 0 U+2018, 0 U+2019, 0 ASCII `'` and 0 backtick substitutes after o/g. The latin subsets of Onest, Tektur and IBM Plex Mono in use all declare `U+2BB-2BC` in `unicode-range` and are loaded, so ʻ renders in the brand fonts with no system-font fallback. **Re-check after the Montserrat + Inter swap**: confirm the new latin subset still lists U+02BB.

## Static-export artefacts (not bugs)

These are caused by the GitHub Pages preview build (`GITHUB_PAGES=1`, `output: "export"`, `basePath=/krishki`, middleware removed in `pages.yml`) and are expected to differ in production.

| Observation | Why it is an artefact |
|---|---|
| canonical, hreflang and `og:url` point to `https://krishki.uz/…`, not the preview host | Correct for production (`metadataBase` = `SITE_URL`). The preview is meant to declare the real domain as canonical. |
| `/` is a meta-refresh to `/krishki/ru/`, not an Accept-Language redirect | Static export cannot run middleware. The workflow writes `out/index.html` by hand. |
| `/krishki/ru` → **301** → `/krishki/ru/` | GitHub Pages directory redirect because of `trailingSlash: true` in the export config. Production uses no trailing slash. |
| Old URLs (`/produkciya`, `/uslugi`, `/o-nas`, `/polezno-znat`) are not redirected | `redirects()` exists only in the standalone config (`next.config.ts:31-33`). It is covered by e2e against `next start`. |
| Lead form cannot submit | There is no API on Pages. It was not tested here. |
| `uses-long-cache-ttl` / `cache-insight` flagged on 36/36 runs | GitHub Pages serves `_next/static/*` with a 10-minute cache. Caddy in production must set `immutable` on hashed assets (backend-dev should verify in the Caddyfile). |
| `uses-responsive-images` / `image-delivery-insight` (up to 281 KB savings) | The Pages build uses a pass-through image loader (`pages-image-loader.ts`) with no optimizer, so the full-size source is served. **Re-measure on production.** If it persists there, it becomes a real Medium. |
| `document-latency-insight` / `server-response-time` on 1–2 runs | GitHub Pages CDN latency. |

## Suggested tickets

1. **frontend-dev, today**: #1 (one-line CSS fix, then re-check the H1 position at 390/1440 on all inner pages and the lid viewer and brands tubes for regressions).
2. **frontend-dev**: #2, #3, #6 as one "mobile TBT and JS budget" ticket, with a before/after Lighthouse median of 3.
3. **frontend-dev, ticket 10**: #4, #5, #12.
4. **frontend-dev, a11y batch**: #7, #8, #9, #10.
5. **qa-seo**: add Lighthouse CI on the Pages preview to the pipeline so the numbers come from a stable runner. Extend `pages.spec.ts` with an "H1 above the fold" assertion so #1 cannot regress. Re-run this pass after the font swap and #1.
