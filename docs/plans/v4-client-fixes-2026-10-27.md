# v4 client fixes — 2026-10-27

Owner: lead (main loop). Branch: redesign-v4. Source: client feedback 27 Oct + lead visual review of localhost:3100/ru at 1440.

## Client points
1. **«Российское качество» on the Elisey photo** (`public/images/photos/tubes-elisey.webp`, used in `about/page.tsx:42`, `brands/page.tsx:29`, `products/[slug]/page.tsx:43`). Cut the tubes out of the background (one remove_background run, verify the label text), show them larger on a clean surface; drop the box with the print.
2. **Wikel rings on a grey photo background** (`PHOTO.rings`, home datasheet + ring product page). Same cutout treatment; if the cutout is poor, use the 3D grey ring render.
3. **Gurman card is a pasted collage** (`TUBE.gurman` = old `tubes/gurman.webp` with a blue block). Switch to the clean v2 tubes `TUBE.gurmanG` / `gurmanFamily`, same card format as the other brands.
4. **«Запросить прайс» does nothing** — that was the old static prototype. In v4 every price button goes to `/order?direction=wholesale&product=…` and presets the form (checked in the browser). No code change.
5. **Partner / distributor forms**: `/distributors` has only buttons to `/order`. Put the lead form on `/distributors` itself (preset direction wholesale), and a short «Стать партнёром» form block on `/suppliers` stays. Open question: does the Telegram message need a separate «дистрибьютор» type? That would change `packages/shared` DIRECTIONS and the API — not done without approval.
6. **Old design on the link**: the Pages run for redesign-v4 built fine but GitHub rejected the deploy: `Branch "redesign-v4" is not allowed to deploy to github-pages due to environment protection rules`. Client action: repo Settings → Environments → github-pages → Deployment branches → add `redesign-v4`, then re-run the workflow.

## Lead review findings (1440)
7. Background 3D lids fly over headings and copy («Паспорт продукции», audience cards, «Красим и печатаем») — reads as chaos. Keep lids out of text zones (mask behind text columns or keep them to the margins, lower size near copy).
8. Factory «seven operations»: only 3 of 7 stations have a picture — uneven row. Either a picture for every station or none.
9. Hero: dark empty band below the stage before the lid marquee; the stats column floats far from the headline.
10. Not yet checked: 390 px slices and inner pages.

## Client points, round 2 (same day, on the live v4)
11. **Hero lid does not read as SKO.** Inside view has no rubber ring. A real SKO I-82 has a food-grade rubber ring seated in the groove along the inner rim (lid-standards.md:11; client: grey). Our generated photo `lids/sko-inside-*.webp` misses it too. Fix: model the ring in the hero lid (grey, matte rubber, visible bead along the rim), check against the client's lid, regenerate the inside photo only if it is used as fallback.
12. **Lid change is only a colour swap.** Replace with the old prototype motion (prototype-light «01 / 03» product scroll): each lid turns in 3D while its card shows name and spec rows (type, control, sealing, closing, packing). Three steps: SKO I-82 → Twist-Off 82 → wikel ring, facts from the datasheet only.
13. **Remove the lid marquee strip** under the hero.
14. **Background 3D**: the floating rubber ring looks odd; lids cover text and wash out the «Три пути к нам» cards. Drop the ring from the background, keep lids out of text columns, add a solid surface under cards. Merges with finding 7.
15. **Rename «Красим и печатаем жесть сами»** — new heading in messages/*.json, e.g. «Своя лакировка и литография жести» (ru/uz/en, client to approve wording).
16. **Header** (client 27 Oct: both): no burger on phone and no right-hand top row on desktop; one header with buttons (Заказать, Дистрибьюторам, Поставщикам), contacts and languages fit in.

## Done when
Screenshots 1440/390 of home, /brands, /about, /distributors, /products/wikel-ring; lint, typecheck, build pass; review note in docs/reviews; client sees v4 on the Pages link.
