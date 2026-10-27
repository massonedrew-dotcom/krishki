# Review — v4 client fixes of 27 Oct (plan docs/plans/v4-client-fixes-2026-10-27.md)

Date: 2026-10-27 · Reviewer: lead · Verdict: **accepted with lead fixes**

## Lead (main loop)
- Header (client: no burger, no right-hand top row): one sticky row from 1280 px with sections, audience buttons, language and «Заказать»; below 1280 px the sections and audience pages are buttons in a sideways-scrolling second row. `components/ui/header.tsx`, `site.css` (`.head-btn`, `.head-row`), `main-nav.tsx` (HeaderOrder removed), `mobile-menu.tsx` deleted. Scroll padding follows the two-row header (`globals.css`). e2e header specs rewritten (`e2e/header-tabs.spec.ts`, `e2e/pages.spec.ts`).
- Lid strip under the hero removed (`page.tsx`, `home.css`).
- «Красим и печатаем жесть сами» → «Своя лакировка и литография жести» (ru/uz/en).
- Elisey tubes and wikel rings: background removed (Higgsfield background remover, 2 runs), carton with «Российское качество товара» gone. Files `public/images/photos/{tubes-elisey-cut,rings-cut}.webp`, masters in `assets/generated/cutouts-2026-10-27/`. `Img.cutout` makes frames show them whole (`photo.tsx`); datasheet ring cell no longer crops (`home.css`).
- Brands: Gurman collage → clean v2 tubes; all brands on v2 tubes.
- Distributors: lead form on the page (`#lead-form`, direction wholesale), hero and samples buttons scroll to it.
- eslint ignores every `.next*` build dir (review/fe dist dirs were linted: 14 806 false problems).

## threed-dev (hero steps, background)
Accepted. Checked: typecheck, lint, vitest 12/12; screenshots in `qa/screens/26c-hero-steps/` at 1440 and 390 looked at.
1. Hero: three scroll steps SKO → Twist-Off → wikel ring on a turntable, datasheet card «01 / 03» from existing message keys, step buttons work by keyboard. `components/home/hero-steps/`, `hero-lid/steps.ts`.
2. SKO inside now shows a grey rubber ring built in code (`lid-kit.ts`, `hero-lid-pass.ts`). TODO(client): real section and colour.
3. Background: floating ring removed, lids only in side bands, `keep-out.ts` shrinks or hides lids over text.
- Lead fix: red Twist-Off read brown on the dark stage → lighter red and a bit more env light on the stage (`hero-lid-pass.ts`).

## Open
- Static-tier background images `public/images/bg/living-bg-{wide,tall}.webp` still show the old rings; re-render needs a QA build with `KRISHKI_BG_DEMO=1`.
- Hero card repeats the datasheet rows below; client to say if one should be trimmed.
- fps measured on the dev server only (57–60 fps, Intel UHD); add to docs/perf.md after a production measurement.
