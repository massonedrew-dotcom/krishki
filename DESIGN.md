---
name: ELIT KONSERVA / krishki.uz
description: Food-grade industrial precision. Brushed tin, gold lacquer, deep ink. The lid is the hero, the interface stays quiet.
colors:
  ink-950: "#0B0D10"
  ink-800: "#1A1E24"
  ink-700: "#2A3038"
  ink-600: "#4A515B"
  ink-400: "#6B737D"
  tin-500: "#A3A9B1"
  tin-300: "#C9CDD2"
  tin-100: "#EEF0F2"
  paper: "#FFFFFF"
  lacquer-700: "#7A5A12"
  lacquer-500: "#C8962E"
  lacquer-300: "#E6C27A"
  alert-600: "#A52A1D"
  alert-300: "#FF9C8A"
  signal-500-placeholder: "#C0392B"
typography:
  display:
    fontFamily: "Montserrat, Arial, sans-serif"
    fontSize: "clamp(2.5rem, 0.8rem + 6.6vw, 5.5rem)"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.02em"
  heading:
    fontFamily: "Montserrat, Arial, sans-serif"
    fontSize: "clamp(1.625rem, 1.1rem + 2.2vw, 2.25rem)"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Inter, Segoe UI, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  caption:
    fontFamily: "IBM Plex Mono, ui-monospace, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0.08em"
rounded:
  ui: "2px"
  lid: "9999px"
spacing:
  1: "4px"
  2: "8px"
  3: "12px"
  4: "16px"
  6: "24px"
  8: "32px"
  12: "48px"
  16: "64px"
  24: "96px"
  32: "128px"
components:
  button-primary:
    backgroundColor: "{colors.lacquer-500}"
    textColor: "{colors.ink-950}"
    rounded: "{rounded.ui}"
    height: "48px"
    padding: "0 24px"
  button-primary-hover:
    backgroundColor: "{colors.lacquer-300}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink-950}"
    rounded: "{rounded.ui}"
    height: "48px"
  input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink-950}"
    rounded: "{rounded.ui}"
    height: "48px"
---

# Design system: ELIT KONSERVA

Live reference: `/ru/styleguide` (also `/uz`, `/en`; noindex). Tokens live in `apps/web/src/app/globals.css`, component styles in `apps/web/src/components/ui/ui.css`. This file is the contract; the code follows it.

## Overview

Direction: **food-grade industrial precision**. A factory datasheet, not a SaaS landing page. Brushed tin and deep ink are the stage, gold lacquer is the only interface accent, and the printed colour of the lids is the only loud element on the site. The lid render (see `qa/screens/3d/sko-top34.png`, `twist-red-top34.png`) is the hero image; UI stays quiet around it.

Tone: facts and numbers over adjectives. Technical captions like engineering drawings. Spec tables like datasheets. Light surfaces for reading and forms, dark (ink) surfaces for product moments and the footer.

Not decided yet: `--signal-500`, the brand colour from the «Мечта хозяйки» logo. `TODO(client)`: exact hex. Until then the token is named `--signal-500-placeholder`, shown in the styleguide, and used nowhere in the interface.

## Colors

Raw tokens on `:root` (`--ink-950` ...), mirrored in Tailwind v4 `@theme inline` (`bg-ink-950`, `text-lacquer-500`). Components never use raw tokens directly; they use surface variables that `.surface-light` / `.surface-dark` re-point.

| Token | Hex | Role |
|---|---|---|
| ink-950 | #0B0D10 | Dark surface; main text on light |
| ink-800 | #1A1E24 | Raised layer and form fields on dark |
| ink-700 | #2A3038 | Dividers on dark |
| ink-600 | #4A515B | Secondary text on light |
| ink-400 | #6B737D | Control borders on light |
| tin-500 | #A3A9B1 | Secondary text on dark |
| tin-300 | #C9CDD2 | Dividers on light |
| tin-100 | #EEF0F2 | Light surface; main text on dark |
| paper | #FFFFFF | Form fields on light |
| lacquer-700 | #7A5A12 | Accent text and underlines on light (5.6:1) |
| lacquer-500 | #C8962E | Primary action, accent. Never as text on light |
| lacquer-300 | #E6C27A | Hover, focus ring and accent text on dark |
| alert-600 / alert-300 | #A52A1D / #FF9C8A | Error on light / on dark |
| signal-500-placeholder | #C0392B | TODO(client). Not used in UI |

Surface variables: `--surface`, `--surface-raised`, `--fg`, `--fg-muted`, `--line`, `--line-strong`, `--accent`, `--accent-hover`, `--accent-text`, `--on-accent`, `--focus`, `--danger`, `--disabled-bg`, `--disabled-fg`.

Rules: lacquer is for actions, focus on dark and one underline accent. No gradients. Text contrast AA minimum; the styleguide computes the real ratios at build time. Colour never carries state alone: errors also have text.

## Typography

Fonts (all Google Fonts, SIL OFL 1.1, self-hosted via `next/font/google`, subsets cyrillic + cyrillic-ext + latin + latin-ext, `font-display: swap`):

| Role | Family | Why |
|---|---|---|
| Display / headings, big figures | **Montserrat** (700, 800) | Firm, corporate-industrial letterforms. Cyrillic, Uzbek Cyrillic Ў Қ Ғ Ҳ and U+02BB/U+02BC verified (fontTools, 2026-10-19). `font-semibold` in markup resolves to 700. |
| Text and UI | **Inter** (400, 500, 600) | Neutral, highly legible grotesk with full Cyrillic, Uzbek Latin and tabular figures (`tnum`). |
| Technical captions | **IBM Plex Mono** (400, 500) | Drawing-annotation voice for captions, units, table headers. Uzbek `ʻ` renders as a small mark; do not set running Uzbek text in mono. |

Alternates evaluated and glyph-checked (cmap + screenshot): Oswald (display, condensed), IBM Plex Sans (text), Commissioner. Rejected: Manrope (no U+02BB, U+02BC, no Қ Ғ Ҳ), Golos Text, Geologica, Roboto Condensed (no U+02BB), Unbounded (no Қ Ғ Ҳ), Familjen/Hanken Grotesk (no Cyrillic). Font decision 2026-10-19 (client rejected Tektur + Onest; evidence in `docs/plans/redesign-v3.md` and `docs/research/font-pairs.png`): Montserrat + Inter chosen over IBM Plex (gap in ʻ) and Commissioner (too soft); Jost, Rubik, PT Sans/Serif also fail an Uzbek glyph. Banned as primary: Roboto, Arial, system-ui.

Scale (px): **14 / 16 / 18 / 22 / 28 / 36 / 48 / 64 / 88** as `text-14` ... `text-88`. 36 and up are fluid below 768 px (88 becomes ~40 px at 390). Line height 1.6 for body, 1.0–1.25 for display. Max line length 68ch (`p` and `li` are capped at 62ch, which keeps Cyrillic and Uzbek lines under 80 characters). Display tracking never below -0.04em. Headings use `text-wrap: balance`.

Numbers: `.tnum` (tabular, lining) on every spec value, price, quantity, phone number. Captions: `.caption` (mono, 12 px, uppercase, +0.08em) for table captions, units, figure captions, never as an eyebrow above a heading.

Uzbek: Latin, `ʻ` U+02BB for oʻ gʻ, `ʼ` U+02BC for the glottal stop. Never ASCII `'` or U+2018.

## Layout

- Grid: 12 columns, gutter 24 px, container max 1440 px. Page margins 16 / 32 / 48 px (mobile / ≥768 / ≥1280).
- Section padding: 64 px mobile, 128 px from 768 px (`--section-y`).
- Spacing scale (Tailwind numeric scale on a 4 px base): 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 / 128 = `1 2 3 4 6 8 12 16 24 32`.
- Section pattern: asymmetric. Heading and lead in columns 1–4, content in 5–12. Large product imagery, never a row of identical cards.
- Breakpoints: 640 / 768 / 1024 / 1280. Touch targets ≥ 44 px (buttons 40 / 48 / 56; form controls 48).
- Surfaces alternate light and dark by content, not by rhythm alone.

## Elevation & Depth

No shadows. Depth is a hairline (`--line`), a 2 px rule above tables, and a surface change. Focus is a 2 px outline with 2–3 px offset (ink on light, lacquer-300 on dark). Glass and blur: none, except where krishki-3d allows one liquid-glass moment.

## Shapes

Radius 2 px for every UI element (`rounded-ui`). A full circle (`rounded-lid`) only for lids. No `rounded-2xl` cards, no pills.

## Motion

- Everything except the hero lid story: 300–600 ms reveals; colour and underline feedback 150 ms. Tokens `--dur-fast 150`, `--dur-base 300`, `--dur-slow 600`.
- Easing: `--ease-out: cubic-bezier(0.165, 0.84, 0.44, 1)` (GSAP `power3.out`).
- One authored hero choreography (lid scroll story). No parallax on text. Nothing blocks reading or the CTA.
- `prefers-reduced-motion`: static frames, no smooth scroll, Lenis off, loading indicator static (dotted ring) while the text label keeps announcing the state. Do not zero out colour feedback.

## Components

Implemented in `apps/web/src/components/ui/` (server components unless noted):

| Component | States / notes |
|---|---|
| Button, ButtonLink | primary (lacquer) / secondary (outline) / ghost (text); sm 40 / md 48 / lg 56; default, hover, focus-visible, disabled, loading (`aria-busy`, spinner + label) |
| TextLink | underline 1 px, 3 px on hover; internal paths via next-intl |
| Field | label + hint + error wired by `htmlFor` / `aria-describedby`; required marker + sr-only text; error sets `aria-invalid` and names the recovery |
| Input, Textarea, Select, Checkbox | native elements, 48 px, 24 px checkbox with 44 px target; default, hover, focus, disabled, error |
| Badge | outline / solid / accent; mono uppercase; for facts ("СКО I-82", "ЭЖК") |
| SpecTable | datasheet table: 2 px top rule, mono headers and units, tabular figures, `<caption>` and `scope` |
| Container, Section | max 1440, rhythm 64 / 128, light or dark tone |
| Header | wordmark, phone, "Запросить прайс", language switch (client island, `ru / uz / en`); menu added when pages exist |
| Footer | company, address, phones, email, Telegram, copyright |

Still to build (later tasks): Hero (lid), ProductSpec, LidWall, ServicesSplit, ProcessTimeline, NumbersStrip, PartnersStrip, GeoMap, LeadForm, mobile menu.

## Do's and Don'ts

Do: lead with the lid; write technical captions; keep numbers tabular; use the real facts from krishki-domain; keep one accent; show every state.

Banned (AI slop): purple/blue gradients, gradient text, glassmorphism as decoration, bento grids, three identical icon cards, emoji or unicode glyphs as icons, coloured side-border accent cards (`border-left` > 1 px), hard offset shadows, kickers/eyebrows above headings, section numbers without meaning, hero-metric template (big number + small label), generic stock photos, "Trusted by" marquees without real logos, fake testimonials, fake counters, floating blobs, Inter/Roboto/Arial/system-ui as primary, `rounded-2xl` cards, invented facts (use `TODO(client)`).
