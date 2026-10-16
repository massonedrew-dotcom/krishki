# ADR 0003 — 3D strategy: image sequence vs realtime

Status: accepted (2026-10-15)

## Context
The client wants a "3D site for lids". The brief puts realtime 3D after launch because of the November deadline. Budgets (krishki-qa): mobile LCP < 2.5 s, initial JS < 170 KB gz. Most buyers in the region browse on mid-range Android phones and mobile internet. We have no real lid scans yet, only catalog photos of tubes.

## Options
1. **Pre-rendered image sequence from Blender, scrubbed on scroll** (canvas + GSAP).
   + looks like real 3D with photoreal metal; any phone can play it; LCP is a plain image; predictable.
   − fixed camera, no interaction; frames weigh (≈ 25 KB × N).
2. **Realtime R3F scene for the hero** (GLB lid, HDRI, PBR).
   + interactive, one small GLB instead of many frames.
   − 200+ KB of JS, shader warm-up, weak phones drop frames, harder QA; risky in 3 weeks.
3. **Static hero image only** (render or photo).
   + fastest, zero risk.
   − no "3D" effect that the client asked for.

## Decision
MVP: **option 1 in a short form** — one Blender scene (SKO I-82 lid and Twist-Off lid at real size), a 60–90 frame sequence (lid turns, shows gold outside and silver inside, settles on a jar), WebP 1600 px desktop / 900 px mobile, first frame is the static LCP image. If the sequence slips, option 3 ships with the first frame (same asset, no rework).
Phase 2: **option 2** for the 50-lid wall (drei Instances, texture atlas) and optionally for the hero, plus the liquid-metal preloader.

Licences: liquid-logo is PolyForm Shield (see LICENSES.md) — allowed for a non-competing site, confirm before phase 2. GSAP: standard "no charge" licence, commercial use allowed — record when installed.

## Consequences
- threed-dev starts Blender modelling now; the same models feed phase 2 GLBs.
- Real lithography textures are needed for both phases (TODO(client) design scans); placeholders use the catalog colours.
- Sequence budget: ≤ 2.5 MB desktop total, ≤ 1.2 MB mobile, loaded after LCP.

## Amendment 2026-10-16 — realtime hero moves into the MVP
Client feedback on the styleguide: the site must be a cinematic scroll experience where the **SKO lid with the rubber ring** (not Twist-Off) travels left → centre → flips → across the brand slides → right. A fixed camera image sequence cannot follow a path across several sections, so:
- MVP hero and story use **option 2 (realtime)**: one fixed canvas behind the sections, SKO GLB (Draco, < 400 KB), GSAP ScrollTrigger + Lenis, HDRI/RoomEnvironment, light bloom + grain.
- Fallbacks stay mandatory: reduced-motion → static render; no WebGL2 / weak device → pre-rendered stills of the same poses (from Blender) placed in each section.
- Budget unchanged for the initial JS (< 170 KB gz); the 3D chunk loads after LCP (first section's static lid render is the LCP image), < 250 KB gz.
- Status: prototype first (prototypes/hero-scroll), client approval, then port to Next.js + R3F (task 5).
