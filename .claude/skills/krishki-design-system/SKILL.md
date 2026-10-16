---
name: krishki-design-system
description: Visual language, tokens, typography, motion rules and anti-slop bans for krishki.uz. Load before writing any component, page, Tailwind config or animation.
---

# krishki.uz design system

## Direction
"Food-grade industrial precision": brushed tin, gold lacquer, deep ink, printed lithography colour as the only loud element. The product (the lid) is the hero; UI stays quiet around it.

## Tokens (CSS variables on :root, mirrored in Tailwind v4 @theme)
- --ink-950 #0B0D10 (main dark background)
- --ink-800 #1A1E24
- --tin-300 #C9CDD2, --tin-100 #EEF0F2 (light surfaces, dividers)
- --lacquer-500 #C8962E (gold lacquer, primary accent, CTAs)
- --lacquer-300 #E6C27A
- --signal-500: one brand colour taken from the «Мечта хозяйки» logo (TODO(client): exact hex)
- Radius: 2px for UI, full circle only for lids. No rounded-2xl cards.
- Spacing scale 4/8/12/16/24/32/48/64/96/128. Section padding desktop 128, mobile 64.

## Typography
- Display: an industrial grotesk with Cyrillic and Uzbek Latin support (candidates: "Unbounded", "Onest", "Manrope" only if contrast is enough; prefer licensed alternatives the client approves). Check ʻ and ʼ glyphs for Uzbek.
- Text: a readable grotesk with Cyrillic.
- Numbers: tabular figures for specs and production numbers.
- Banned as primary fonts: Inter, Roboto, Arial, system-ui default stack.
- Scale: 14/16/18/22/28/36/48/64/88. Max line length 68ch.

## Layout rules
- Asymmetric grids, large product imagery, technical captions (mono, small, uppercase) like engineering drawings.
- Spec tables styled like a datasheet, not like SaaS pricing cards.

## Motion rules
- One hero choreography (lid scroll story). Everything else: short reveals 300–600 ms, ease "power3.out".
- No parallax on text. No animation that blocks reading or the CTA.
- prefers-reduced-motion: show static frames, disable Lenis.

## Banned patterns (AI slop)
purple/blue gradients, glassmorphism everywhere, bento grids, three identical feature cards with icons, emoji icons, side-border accent cards, generic stock photos of handshakes, "Trusted by" marquees without real logos, gradient text headlines, floating blobs, fake testimonials, fake counters.
Liquid glass and shader gradients allowed in at most one place each (see krishki-3d).

## Components list
Header (lang switch ru/uz/en, phone, "Заказать"), Hero (3D lid), ProductSpec, LidWall (50 designs), ServicesSplit, ProcessTimeline (tin → lacquer → print → stamping → ring → QA), NumbersStrip, PartnersStrip, GeoMap (Uzbekistan + Central Asia), LeadForm (direction select), Footer.
