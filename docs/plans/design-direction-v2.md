# Design direction v2 — client feedback 2026-10-16

Replaces the dark "ink" direction of DESIGN.md / krishki-design-system where they conflict. Approved by the client in chat: "красиво", but: white background with 3D animations flying behind, style of the old krishki.uz made modern, livelier texts, multi-page site (not a landing), design that feels 2026.

## 1. Look
- **Light site.** Base background white / near-white (#FFFFFF, #F5F8FB). Sections alternate white and very light blue (#EAF4FB). One deep section allowed per page (the azure brand band, not black).
- **Palette from the old site:** azure blue (old header, sample from assets/reference/old-site — ≈ #1E98CC; deep variant ≈ #0E5E9C for text on light), «Мечта хозяйки» red (sample from logo.png, ≈ #E3262F) for CTAs and accents, lacquer gold (#C8962E / #E6C27A) for the lids and fine details, ink #0F1B2A for text. Green only as the colour of real Twist-Off lids, not UI.
- **3D background layer:** behind the content, slow floating 3D objects — small SKO/Twist-Off lids with real lithography textures, a few wikel rings, maybe tomato/cucumber-style colour accents through the lid textures — at different depths with soft depth-of-field blur, drifting and gently rotating, reacting slightly to scroll and mouse (lerped). Low density (8–14 objects), never behind body text at full opacity. Mobile: 4–6 objects, lower DPR; reduced-motion: static.
- **Hero object:** the lid parade (8 models through the centre, left → right) stays on the home page, now on white with soft shadows/reflections.
- **2026 feel:** oversized display type with tight leading, kinetic text reveals (split lines/words), scroll-linked progress rails (like the 01–08 rail — client liked it), sticky/stacking sections, horizontal marquee of partner logos (real logos), large rounded-but-precise media (radius 12–20 px allowed now for media cards; UI controls 8–10 px), soft 3D shadows, subtle grain. Smooth scroll (Lenis), page transitions (fade/slide of the content, the 3D layer persists).
- Still banned: purple/AI gradients, fake counters, fake testimonials, emoji icons, generic stock photos, three identical icon cards.

## 2. Copy tone (ru first; uz/en drafts)
Short, confident, concrete, buyer-centric. Facts only (docs/content-inventory.md), but phrased with energy. Headlines are verbs/benefits, body is 1–2 sentences, numbers big.
Examples of the tone (facts are real):
- Home H1: «Крышки, которым доверяют урожай» / sub: «СКО I-82 и твист-офф 82 от завода в Коканде. С 1996 года.»
- «От 1 000 до 10 000 000 штук — одна партия или целый сезон.»
- «Ваша марка на каждой банке» (private label)
- «Двойной лак внутри и снаружи. Резинка из пищевого каучука. Ребро жёсткости.»
- «Красим и печатаем жесть сами: лаки PPG, краски HUBER GROUP.»
- «Отправляем образцы» / «Работаем по Узбекистану и Центральной Азии»
No superlatives without proof ("лучшие", "№1"). Every page ends with a CTA «Запросить прайс».

## 3. Site map (multi-page, MVP) — /ru /uz /en prefixes
| Route | Page | Main content |
|---|---|---|
| `/` | Главная | hero + lid parade (3D), why us (6 real advantages), brands teaser, services teaser, partners marquee, geography, CTA |
| `/products` | Продукция | catalogue grid of all lid types (SKO gold, SKO litho, SKO private label, Twist-Off single colour, Twist-Off full colour, Twist-Off private label, wikel ring) with filters SKO / Twist-Off / Ring |
| `/products/sko-i82` | Крышка СКО I-82 | 3D lid viewer (rotate), datasheet, coatings, packaging (50 pcs tube, 500 bag / 1000 box), variants, CTA |
| `/products/twist-off` | Твист-офф 82 | same structure, vacuum button, plastisol, 20-pc tube, 240 bag, 850 box |
| `/products/wikel-ring` | Викельное кольцо | since 2014, GOST, food rubber, 30 kg packs |
| `/brands` | Бренды | Мечта хозяйки (Beka orzusi), Елисейские крышки, Моя мечта, Роса, Гурман (TODO confirm) — tube photos, specs from catalog |
| `/services` | Лакировка и литография | process (offset print on metal, UV inks, QC per GOST), sheet sizes 710×510–1145×950, 0.15–0.40 mm, 4 service lines |
| `/private-label` | Под вашу марку | how it works (brief → design → print → lids), examples Sardoba/Hilol/Ibrat/Ittifoq/Modesto/Afrosiyob (client allowed), MOQ 1 000 |
| `/about` | О заводе | timeline 1996 → 2014 rings → 2016 twist-off → 2022 Елисейские, quality lab, gallery (old-site photos), partners, geography |
| `/useful` | Полезно знать | «Как выбрать крышку СКО» guide (ribs, ring, weight TODO, inner coating) |
| `/contacts` | Контакты | phones, WhatsApp, Telegram, email, address, map link, lead form |
| `/privacy` | Политика | draft |
Old URLs → 301: /produkciya/ → /ru/products, /uslugi/ → /ru/services, /o-nas/ → /ru/about, /polezno-znat/ → /ru/useful.

## 4. Ownership
- threed-dev: prototype (prototypes/hero-scroll) → white background + floating 3D layer; later port to Next/R3F (task 5).
- frontend-dev: multi-page skeleton in apps/web with this direction (task 2 rework + task 4).
- lead: reviews, keeps this doc current.
