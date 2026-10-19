# 10 — Light cinematic home: three lids in motion (agent: threed-dev, then frontend-dev)

Adapted from two references the client sent on 2026-10-19 (a dark scroll-orbit sculpture page and a light driver site with stacked sections). We take **techniques only**. We do NOT copy:
- their code (the references quote another project's source; there is no licence for it — CLAUDE.md rule 6);
- their assets (GLB, photos, HDR, masks), layout or copy;
- the custom cursor that hides the native one, or hidden scrollbars (bad for a B2B site's accessibility).

Every shader, spring and module here is written fresh for krishki.

## Goal
A **light, modern, factory** home page for ELIT KONSERVA. In the centre, the three products — **SKO I-82, Twist-off 82 and the wikel ring** — float and turn in 3D, driven by scroll. Each product in turn comes to the front with its **characteristics** beside it. Then the factory story (о заводе), the brands in tubes, geography and a CTA.

Load the skills before writing code:
- `krishki-domain`: facts. Use only facts from docs/content-inventory.md and docs/research/lid-standards.md; anything TODO(client) is not shown.
- `krishki-design-system` and `krishki-3d`.
- `gsap-core`, `gsap-scrolltrigger` and `gsap-performance`.
- `animate` and `animation-performance` (Emil Kowalski).
- `threejs-webgl`.

## Step 1 — prototype (this ticket)
One self-contained `prototypes/light-home/index.html`, like `prototypes/hero-scroll/`:
- three r0.170 and lenis 1.1 via an importmap from unpkg/esm.sh (the versions already recorded in LICENSES.md), GSAP 3.12.5 + ScrollTrigger;
- no build step;
- assets copied into `prototypes/light-home/` from our own repo only.

The prototype is reviewed by the client before anything is ported into apps/web (Step 2, a separate ticket).

### Tokens (top of the file; light only, no dark mode)
Directions A/B/C are still open with the client, so all colours and fonts are CSS variables in one block. Defaults are direction A:

```
--paper #FFFFFF; --mist #F5F8FB; --sky #EAF4FB; --sky-line #D6E8F4;
--ink #0F1B2A; --ink-muted #566B80; --azure #1E98CC; --azure-deep #0E5E9C;
--red #D61F29 (CTA only); --gold #C8962E; --gold-soft #E6C27A;
--font-display "Montserrat" 700/800; --font-text "Inter" 400/500/600 (Google Fonts, OFL). Chosen 2026-10-19, see docs/research/font-pairs.png: both verified with fontTools for full Cyrillic, Uzbek Cyrillic Ў Қ Ғ Ҳ, Uzbek Latin oʻ gʻ (U+02BB) and English
```

One accent per screen: azure for UI, red only for «Запросить прайс», gold only on the lids.

### Shell
- Native cursor and scrollbar.
- Lenis smooth scroll, off under `prefers-reduced-motion`.
- `history.scrollRestoration = "manual"`.
- **Loader veil**: white, a circle (lid silhouette) filling from the top plus a 4 px meter at the foot. Progress creeps to 0.7 on its own and completes when all three models and textures are uploaded and one frame is rendered. Then the veil fades and the entrance starts. Remove it when its rendered opacity is ≤ 0.004, with a 3 s backstop. On a load error, show a visible banner with the failing URL; never leave the veil up forever.
- **Header**:
  - logo «Мечта хозяйки» (`apps/web/public/images/brand/mechta-khozyayki.webp`) + «ELIT KONSERVA»;
  - nav: Продукция · Бренды · Услуги · О заводе · Контакты;
  - red «Запросить прайс».
  - Below 1280 px: a burger opening a full-screen sheet appended to `<body>`, never inside a transformed header (that bug was fixed in ticket 17).

### Section 1 — the product stage (pinned, ~400vh of scroll)
- **Canvas** fixed behind the copy while the stage is pinned, `aria-hidden`.
- **Background shader**, light, our own:
  - a slow "liquid tin" field: soft pearl-white to `--sky` bands with thin contour lines in `--sky-line` (iso-lines of a sum of 3–4 sines, with crossed sine displacement so the field rolls);
  - time scale slow (~0.08), very low contrast so text on top stays AA;
  - scroll shifts the palette from cool sky (top) to a warm gold-cream tint (end of the stage).
- **The three products** on a turntable carousel at 120° apart, in the centre of the frame:
  - SKO I-82: `prototypes/hero-scroll/lid-sko.glb` (gold);
  - Twist-off 82: `lid-twist.glb` with a red lithography texture from `prototypes/hero-scroll/tex/`;
  - wikel ring: built in code as a `TorusGeometry` (rounded section), matte food-rubber beige, roughness 0.8.
  - Scroll rotates the carousel so each product comes to the front at its slide.
  - Each product also spins slowly on its own axis and tilts toward the mouse (max ±6°, lerp 0.05).
  - The front product scales 1.0, the others 0.7 and fade to 60%.
- **Camera**: gentle orbit ±20° in azimuth and a small rise over the stage, plus lerp 0.03 for inertia. No full 360°: the carousel does the rotating.
- **Light rig** for metal on white:
  - `RoomEnvironment` through `PMREMGenerator` as the environment (no external HDR);
  - a soft key light upper-right and a cool rim behind;
  - ACES tone mapping, exposure about 1.0, tuned until gold reads as gold, not brown.
  - A soft contact shadow under the front product: a blurred radial texture on a plane, not a shadow map.
- **Particles**: ~200 tiny motes, gold and azure, **normal blending** (additive is invisible on white), opacity 0.35, rising slowly. Turbulence rises with scroll speed.
- **Slides** (copy from messages; letters or words rise with a blur-up of 8 px → 0, 30–40 ms stagger; descriptions fade up after 0.3 s):
  1. «Крышки, которым доверяют урожай» + «СКО I-82 и твист-офф 82 от завода в Коканде. С 1996 года.» + two buttons.
  2. **СКО I-82**, with a spec panel: bracket corners (four 10 px L-strokes) and a `<dl>`:
     - для банок с венчиком СКО I-82;
     - жесть ЭЖК 0,16–0,20 мм;
     - снаружи золотистый лак или литография;
     - внутри пищевая эмаль;
     - резинка из пищевого каучука;
     - ребро жёсткости;
     - туба 50 шт.
  3. **Твист-офф 82**, same panel:
     - винтовая, горловина 82;
     - кнопка контроля вакуума;
     - пластизоль под стерилизацию и пастеризацию;
     - закручивается рукой;
     - туба 20 шт;
     - 240 в пакете / 850 в коробке.
  4. **Викельное кольцо**:
     - пищевая резина;
     - для крышек СКО;
     - с 2014 года;
     - мешок или коробка 30 кг.
- A **stories progress** of four thin dashes on the right edge fills with scroll. The nav jumps to each slide.

### Sections 2–6 — the factory, as a sticky stack (light sheets)
Each pinned layer recedes as the next covers it: scale to 0.94 and a 35% ink shade. The transform goes on an inner wrapper, never on the sticky element. No shrink on phones.
2. **Завод в цифрах**: 1996 · 1 000 – 10 000 000 шт · ЭЖК 0,16–0,20 мм · лаки PPG, краски HUBER GROUP.
   - Big figures in display type, letter reveals; no fake counters or count-up.
   - **Seam**: a "lid dissolve". The previous sheet's colour carries over as solid rows of **circles** (lids, not a chequer), which thin out into a scattered pattern and burn off with scroll. A deterministic hash per cell; ~6% of the circles in gold.
3. **Как мы делаем крышку**, a production line trace:
   - a scroll-scrubbed line on canvas runs through 5 stations: жесть → лакировка → литография → штамповка → контроль;
   - it slows at each station (the pace is in the path's own bends), lighting a marker as it passes;
   - copy per station from content-inventory §4.
4. **История** (о заводе), a timeline:
   - 1996 основан · 2014 викельное кольцо · 2016 твист-офф · 2022 «Елисейские крышки»;
   - plates with a cut corner holding the old-site production photos (`assets/reference/old-site/production-*.jpg`);
   - a rail with a progress thread and a turning square marker;
   - years assemble letter by letter, three parallax layers per row, and hover dims the other rows.
5. **Бренды в тубах**:
   - the tube photos (`apps/web/public/images/tubes/*`) **large**, in a horizontal scroll on mobile;
   - pack facts: 50 / 20 шт.
6. **География + CTA + footer**:
   - a halftone dot map of the Fergana valley / Central Asia drawn from public-domain Natural Earth outlines (record the source in LICENSES.md), with a ping on Kokand;
   - **no destination names** that are not in content-inventory.
   - Then a CTA band «Запросить прайс» and a footer: a thin azure page edge with an ink panel inset 16 px, white contour lines at 10%, nav, contacts, legal row.

### Motion rules
- One rAF ticker; Lenis runs first in it.
- Springs: our own damped spring (tension/friction, mass 1).
- Entrances use ease-out curves only.
- Animate transform and opacity only.
- Everything that loops pauses off screen (IntersectionObserver plus 10 frames).
- Reduced motion: no Lenis, no carousel spin, products shown side by side and static, reveals as plain fades.

### Performance tiers (desktop / tablet / mobile)
- DPR caps: 1.5 / 1.25 / 1.
- Particles: 200 / 120 / 60.
- Mobile: the shader at half resolution; a 60 fps cap on touch.
- Budgets from krishki-qa: hero JS < 60 KB gz once ported; LCP < 2.5 s on mobile. In the prototype, log the frame time per tier to the console.
- If WebGL is missing: show static lid photos (`apps/web/public/images/lid-*.webp`) in the stage, and the veil lifts at once.

### Done when (prototype)
- Opens from `file://` or a static server without errors at 1440, 1366, 1280, 768 and 390 px.
- Screenshots of each slide and section at 1440 and 390 are in `qa/screens/20-light-home/`.
- Recordings or notes give the fps per tier.
- Every fact on the page traces to docs/content-inventory.md or docs/research/lid-standards.md.
- LICENSES.md lists three, GSAP, Lenis, Natural Earth and the fonts.

## Step 2 — port into apps/web (separate ticket, after the client approves the prototype and the colour direction)
- Hero stage as a lazy R3F client island in `components/home/hero-parade-slot.tsx` (threed-dev owns it), with the static render as the fallback.
- The stack sections as Server Components plus small client islands; copy into `messages/{ru,uz,en}.json`.
- Same budgets.
