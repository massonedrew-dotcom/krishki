# Style directions — home redesign v4

- **Date**: 2026-10-26
- **Status**: proposal, three directions for the lead and the client to choose from
- **Inputs**: `docs/research/factory-site-styles-2026-10-26.md` + `research_notes/Стиль сайтов заводов упаковки/*` (4 files), `docs/plans/home-redesign-v4.md`, `docs/content-inventory.md`, `docs/client-brief.md` (update 2026-10-26: benchmark krishki-surur.uz, new domain), `DESIGN.md`, skills krishki-domain, krishki-design-system, krishki-qa, impeccable, taste-skill, ui-ux-pro-max.
- **Mockups**: `prototypes/style-directions/{a,b,c}/index.html`. Each is self-contained, uses Google Fonts only and its own copied images in `img/`.
- **Screenshots**: `qa/screens/style-directions/{a,b,c}-{1440,390}.png` (first screen) and `…-full.png` (whole mockup). To re-shoot, run `node qa/screens/style-directions/shoot.mjs [a b c]` with the repo's Playwright. The script logs horizontal overflow and console errors: 0 and 0 for all six shots.

Every mockup has the same content: a two-row header (top row: Поставщикам · Дистрибьюторам · **Заказать** · Telegram · WhatsApp · phone · RU/UZ/EN; main row: logo + ELIT KONSERVA · Продукция · О заводе · Услуги · Бренды · Контакты; below 1280 px only logo + «Заказать» + burger). Then the hero with the 3D lid at its centre, the products section (SKO I-82, Twist-Off 82 red + green, wikel ring) and the factory chapters section (timeline 1996 / 2014 / 2016 / 2022 plus the seven-step production chain). All copy is Russian and comes from `content-inventory.md`. Gaps are marked `TODO(client)`. There are no prices, no commercial terms and no domain anywhere. Wherever a factory photo does not exist yet, the slot is an explicit shot brief («Снять: …»), not a stock image.

## The benchmark and what all three share

The client's benchmark is krishki-surur.uz: a Russian-only WordPress brochure with a stock-looking slider, no factory photos and no 3D. The client wants a site that is "modern, beautiful, with 3D". All three directions beat that benchmark the same way:

1. **The 3D lid sits at the centre of the hero.** The choreography: the gold SKO flips to show the inside with the grey rubber ring, then the Twist-Off red and green. The static fallback is `apps/web/public/images/lids/sko-34-1600.webp`, and each mockup shows that photo where the 3D canvas goes, marked with a dashed frame and a «3D» note. The mockup-only marker is not part of the design. Each direction uses an alpha cutout of the fallback photo (see Imagery). Production needs that cutout as a separate asset, because the original sits on white.
2. **Proof replaces adjectives.** Every product has a spec table (datasheet), the factory story is told as numbered operations with real numbers (sheet size, coating thickness, lacquer brand, GOST checks), and the years are real. There is no counter without a unit and no "лучшие".
3. **Messengers are in the top row** (Telegram first for UZ, WhatsApp for KZ/KG), and «Заказать» is the only red element in the UI.
4. **One loud medium.** The 3D lid is the only loud medium. Everything else is a photo, type or line work.

## Type (all three)

**No change proposed: Montserrat (display) + Inter (text)**, both Google Fonts under SIL OFL 1.1. The directions differ through weight, case and scale, not through new families:

- A: Montserrat 300 for large headings with 600 for emphasis.
- B: Montserrat 800, tight tracking.
- C: Montserrat 700 with Inter tabular figures.

**Glyph check (done 2026-10-26, Playwright + canvas width test).** Each character is rendered as `"<font>, monospace"` and as `"<font>, serif"`. If the two widths match, the glyph comes from the font itself.

- Montserrat 400/800 and Inter 400/700: all present. Checked characters: Ў ў Қ қ Ғ ғ Ҳ ҳ, U+02BB ʻ (oʻ gʻ), U+02BC ʼ, Ё, №.
- Control font Unbounded: correctly reported as missing Қ Ғ Ҳ, which confirms the test detects gaps.

Note that DESIGN.md still lists Tektur + Onest. The redesign-v3 decision (Montserrat + Inter) supersedes it, and DESIGN.md needs an update by the lead.

Numbers use `font-variant-numeric: tabular-nums lining-nums` everywhere: specs, quantities, phone.

---

## A — «Лаковая печь» (Lacquer oven)

**Idea in one line:** the lid as a precious object under the warm light of the lacquering oven. A dark warm graphite stage, gold lacquer as the light, and the gold 3D lid as the only bright thing on the page.

**Research findings it answers**
- "Nobody in the sector uses a dark, metal art direction." A takes exactly that free niche and is the furthest from the blue/white template.
- "Monochrome base + one signal colour" (the Awwwards cluster): graphite plus gold, with red only for «Заказать».
- "One loud medium (the 3D lid)": specular gold reads best against dark, so the 3D lid looks the most premium here.
- "Process told as numbered chapters": seven chapter rows, each with a real number and a real frame or a shot brief.
- "Spec tables": each product row has a «Паспорт» table.

**Palette** (contrast values computed with the WCAG 2.x formula)

| Token | Hex | Use | Contrast |
|---|---|---|---|
| ground | `#110F0C` | page | — |
| raised | `#1B1814` | panels, form fields | — |
| line / line-soft | `#3B342A` / `#2A251E` | hairlines | decorative |
| text | `#F3EDE2` | body | 16.42 on ground, 15.18 on raised |
| muted | `#B5AC9C` | secondary text | 8.52 on ground, 7.87 on raised |
| tertiary | `#8C8476` | captions | 5.17 on ground, 4.78 on raised |
| gold-text | `#E2C27F` | accent text | 11.17 on ground, 10.32 on raised |
| gold | `#D6AE5C` | «Запросить прайс» button | ink on gold 9.17 |
| order | `#B8231A` | «Заказать» | white on it 6.38 |

**Imagery rules**
- Lids only as alpha cutouts on the dark ground: `sko-34`, `sko-top`, `twist-red-34`, `twist-green-34`. Never use the white-background originals on dark.
- Material photos (`litho-mix`, `sko-gold-stack`, `tubes-mechta`, `rings`) appear only inside framed chapter or product slots.
- **To shoot (one macro day):** gold lacquer on a sheet leaving the oven (backlit, warm), a lithographed sheet in raking light, a macro of the lid edge, the ring being laid in, the lab with an operator, pallets being loaded. Warm grade, deep shadows, no blue cast.
- **To generate (3D team):** the GLB lid in a dark studio HDRI with one warm key light. The grey rubber ring must stay grey.

**Material and texture:** no textures in CSS. The material is the lid itself plus soft warm radial light, like an oven glow. There are hairline rules, no cards and no shadows on UI, and a drop shadow on lids only.

**Motion rules**
- One choreography: the hero lid (flip → inside with the ring → Twist-Off).
- The living background moves slowly. Section reveals take 300–600 ms with ease-out.
- A slow light sweep crosses the background (14 s). Lenis is off under reduced motion.
- No motion on text.

**Living background:** a near-black warm field. Blurred gold, red and green lids drift at three depths (depth of field), and a faint band of warm light sweeps across like an oven door. On scroll the lids line up for the factory section. The fallback is a still of the same frame (the CSS layers in the mockup).

**Risks**
- Dark can feel heavy for food packaging. Mitigations: warm graphite, not cold black; food colour comes from the red and green lids and the litho photos; the order form can sit on a light panel.
- The approved v4 plan says "light direction, azure UI". A reverses that, so the client must approve it.
- The dark sections show real-photo gaps more: the old-site photos are low resolution.
- The cutouts must be clean: the white fringe is visible on dark. The fringe is fixed in the mockup assets, but production needs proper cutouts.

---

## B — «Оттиск» (Proof sheet)

**Idea in one line:** the page is a printed tin sheet from ELIT's own lithography line. Crop marks, registration marks and the print control strip frame the content, and the lids are laid out on the sheet as they are stamped.

**Research findings it answers**
- "Lithography and lacquering are almost never shown, even by makers of decorated metal." B makes the client's own service (lithography) the visual system.
- "A palette taken from the material" (the mechanism behind Ramondin, not its look): a warm tin-cream sheet, with process colours C M Y K plus gold, red and green from the real lids.
- "Warm off-white base, not pure white": the client's complaint about the plain white look.
- "Process as chapters" becomes a «Технологическая карта» (process card), a real factory document with columns Операция / Что и чем / Кадр.
- "Spec tables": each product proof has a datasheet list and colour patches of the real lid colours.

**Palette**

| Token | Hex | Use | Contrast |
|---|---|---|---|
| sheet | `#EEE8DC` | page | — |
| paper | `#F8F5EE` | proofs (cards) | — |
| ink | `#1B1712` | text, rules | 14.61 on sheet, 16.37 on paper |
| muted | `#574F44` | secondary text | 6.60 on sheet, 7.40 on paper |
| magenta-text | `#A3164F` | accent text, brand lines | 6.18 on sheet, 6.93 on paper |
| band | `#1B1712` | top header row, timeline band | paper text 16.37, muted `#C2B8A6` 9.08, yellow `#F4C21B` year 10.68 |
| C / M / Y | `#009FC7` / `#D4237A` / `#F4C21B` | print marks, passes: **decorative only, never text** | — |
| order | `#B42318` | «Заказать» | white on it 6.57 |

**Imagery rules**
- Lid cutouts are laid on the sheet grid: top views for the nest, 3/4 views in the proofs.
- `litho-mix` is the key photo, because it shows real printed lids.
- **To shoot:** flat top-down scans of real printed sheets and of finished litho lids (the "50 designs" need these anyway), a press-sheet close-up with registration marks, a colour bar macro, and the press operator checking a proof.
- **To generate:** the 3D lid in a soft daylight studio on the cream sheet, with a soft contact shadow.

**Material and texture:** paper and tin, with no gloss in the UI. There are crop marks at the plate corners, registration targets, a 7-colour control strip (CMYK + gold + red + green), 1.5 px ink rules, outlined "blank" circles and multiply-blended colour passes.

**Motion rules**
- The 3D lid is the hero choreography.
- The page's own signature is short "print passes": a colour wipes into an empty circle once, 1.4 s, ease-out. Lids settle onto the sheet once.
- Nothing loops except the 3D lid.
- Under reduced motion everything is shown printed and static.

**Living background:** a full-page tin sheet with the stamping nest of circles. As the visitor scrolls, the circles get printed pass by pass (cyan, magenta, yellow, key, then gold lacquer), then punched out and float as finished lids. The order section ends with a stack of finished lids. The fallback is the static nest from the mockup hero.

**Risks**
- It is the most "designerly" of the three, so print marks could read as decoration if overused. Rule: marks only at plate corners and section joints, never inside text.
- CMYK colours must never carry text or state.
- The heavy 800-weight Montserrat headline gets long in Uzbek and English: test the uz/en strings for line count.
- The nest is a schematic, captioned as an illustration, and must not be read as a technical drawing.

---

## C — «Чертёж на жести» (Drawing on tin)

**Idea in one line:** the lid explained like an engineering drawing on brushed tin. The 3D lid is the main view, the section drawing below it names every layer (tin, gold lacquer, food enamel, stiffening rib, grey rubber ring), and a drawing title block signs it with the factory's name.

**Research findings it answers**
- "No one shows a spec table on the home page": C turns the whole products section into one comparison datasheet (SKO / Twist-Off / ring in aligned rows) that a buyer can scan without calling.
- "Buyers arrive late with a shortlist and filter without a salesperson" (6sense/Gartner): the facts are laid out for comparison.
- "One real product detail becomes the signature" (the Pano mechanism): the section drawing of the I-82 lid with its layers is ELIT's own detail.
- "Process as chapters": the seven operations as a production line diagram (stations on a rail), plus a measured timeline ruler from 1996 to 2026 where the years sit at their true positions.

**Palette**

| Token | Hex | Use | Contrast |
|---|---|---|---|
| tin | `#DADDE0` | page (brushed with 1–7 px CSS lines) | — |
| plate | `#ECEEF0` | drawing frame, datasheet | — |
| ink | `#101317` | text, line work | 13.66 on tin |
| muted | `#434A53` | secondary | 6.57 on tin, 7.71 on plate |
| gold-text | `#7A5A12` | accent text («с 1996 года») | 4.67 on tin, 5.47 on plate |
| order | `#B8231A` | «Заказать», TODO marks | white on it 6.38; as text 5.48 on plate, 4.68 on tin |
| dark | `#101317` / `#1A1E24` | factory section | text `#E4E7EA` 15.00, muted `#A3A9B1` 7.86 (7.07 on raised), gold `#E6C27A` 10.96, alert `#FF9C8A` 9.20 |

**Imagery rules**
- Product photos on white panels inside the datasheet. The originals work here as they are; cutouts are needed only on the tin ground.
- **To draw:** an accurate SKO I-82 and Twist-Off 82 section from the client's drawings. The current SVG is a schematic, labelled «не в масштабе», with no invented dimensions.
- **To shoot:** each operation as a documentary still from a fixed angle (the stations), plus the lab instruments.

**Material and texture:** brushed tin is drawn by two repeating CSS line patterns, with no image cost. There is a drawing grid inside the frame, a 1.5 px frame with an inner 1 px border, a title block, leader lines with dots, and a dashed centre line. The UI is flat with 2 px radius.

**Motion rules**
- The 3D lid rotates in the main view.
- When it flips, the section drawing below draws its lines in (stroke-dashoffset, once).
- The "line" strip under the hero moves slowly (40 s loop). It is the visible slice of the living background.
- The stations light up one by one as the factory section scrolls.
- Under reduced motion everything is static and fully drawn.

**Living background:** a production line. Lids travel on a rail across the page behind the content (visible as the strip under the hero). On scroll the line stops at each section: the products line up into datasheet columns, the factory section shows the stations, and the order section shows the lids packed. The fallback is the static strip.

**Risks**
- It is the closest to the current light look: grey can still read as "corporate" if the drawing is weak. The drawing quality is what makes or breaks C.
- The section drawing needs real dimensions from the client (`TODO(client)`). Until then it stays a schematic.
- The datasheet needs care on mobile: it collapses to three stacked sheets in the mockup.

---

## Recommendation

**Choose A («Лаковая печь») and take C's product datasheet into it.**

- The client asked for something "modern, beautiful, with 3D" and better than krishki-surur.uz. A gold metal lid in 3D reads best on a dark warm stage, and that is the most visible break from both the benchmark and the blue/white sector template. The research found no competitor in this niche.
- A keeps the page quiet around the one loud medium. The colour comes from the products themselves (gold, red, green, litho prints), which is what the award winners do.
- The weak point of A, heaviness for a food product, is controlled: warm graphite instead of black, food colour from real lid photos, and the order form on a light panel.
- C's comparison datasheet is the strongest lead-generation element of the three. It fits A's dark rows as a «Паспорт продукции» block and should replace A's three separate tables.
- B is the most original concept and the best fit for the private-label and services pages. Its "print pass" can live there (Услуги / Под вашу марку) without competing with the hero.

**What the lead and client must decide**
1. Dark (A) reverses the "light direction" written in home-redesign-v4. This needs the client's yes.
2. Shooting day: all three directions depend on real factory photos for the chapters. Each chapter slot lists what to shoot.
3. A drawing or dimensions of SKO I-82, needed if the C datasheet and drawing are used.

## Notes for implementation (not done here; apps/web was not touched)

- **Cutouts.** Cutouts of `sko-34`, `sko-top` and the `twist-*` views were made for the mockups (white background flood-filled from the edges, contact shadow kept as translucent warm black, 3-pass fringe cleanup). They live only in `prototypes/style-directions/*/img/`. The `sko-inside` view could not be cut this way (its silver interior joins the white background), so the "inside with grey ring" frame must come from the 3D render or a proper manual cutout.
- **Image sizes.** Each prototype `img/` folder is about 530–600 KB in total. The hero fallback cutout `sko-34.webp` (900 px) is about 34 KB, within the 120 KB hero LCP budget.
- **Accessibility.**
  - The living-background layers are `aria-hidden`.
  - The canvas will need a text equivalent (krishki-qa).
  - The C timeline ruler is `aria-hidden` and paired with a visually hidden list on desktop.
  - The drawing SVG has `<title>`/`<desc>` and real text labels.
- **Copy.** «Поставщик красок: HUBER GROUP или «Huberg»», equipment, capacity, ring size and GOST number are all `TODO(client)`. The «Полный цикл» claim is not made.

## Decision 2026-10-26 (client)
- **Site-wide style: C «Чертёж на жести»** (brushed tin, ink line work, drawing frames, title blocks, comparison spec table, production line + timeline).
- **Home hero (first screen) only: A «Лаковая печь»** — dark warm graphite stage with the gold 3D lid in the centre; the page transitions from the dark hero into the C tin surface below.
- **Gold is an accent, used partially** (hero, key numbers, hairlines), not a dominant colour across the site.
- Red stays only for «Заказать». Fonts unchanged: Montserrat + Inter.
- No «Снять: …» placeholders on the real site: use our existing photos; where none exist, the section works without a photo (TODO(client) stays in code comments only).
