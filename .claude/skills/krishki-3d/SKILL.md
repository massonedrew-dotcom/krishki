---
name: krishki-3d
description: 3D and motion pipeline for krishki.uz — Blender lid model, GLB export, React Three Fiber scenes, scroll image sequence, the 50-lid instanced wall, liquid-logo, shadergradient and liquid-glass usage, performance and mobile fallbacks. Load before any three.js, R3F, GSAP or Blender task.
---

# 3D pipeline

## Assets
- Source: `assets/blender/lid-sko.blend`, `lid-twist.blend` (built via Blender MCP or `blender -b -P scripts/blender/build_lid.py`).
- Real size: SKO I-82 outer Ø 82 mm. Model in metres, scale 1 unit = 1 m.
- Top face UV: circular planar projection, so any of 50 lithography textures can be swapped.
- Export: GLB, Draco or meshopt, < 400 KB per lid. Textures: KTX2 (fallback WebP), 1024 px, sRGB for albedo.
- Image sequence for hero: 160 frames, WebP, 1600 px desktop / 900 px mobile, `public/sequence/{desktop,mobile}/lid_0001.webp`.
- HDRI: Poly Haven studio HDRI (CC0), 1k, `.hdr` → prefiltered via drei `<Environment files=... />`.

## Hero (scroll story)
Primary: canvas image sequence scrubbed by GSAP ScrollTrigger (pin hero, 300vh scroll).
Beats: 1–60 SKO lid descends and seals a jar; 61–110 Twist-Off unscrews; 111–160 exploded view (tin, lacquer, print, ring) with captions.
Preload first 20 frames, lazy-load the rest with `fetchPriority="low"`. Static first frame is the LCP image.

## Lid wall (50 designs)
- R3F + drei `<Instances>`: one geometry, one material, texture atlas 8×8 (KTX2) with per-instance UV offset via instanced attribute.
- Material: MeshPhysicalMaterial metalness 1, roughness 0.25, clearcoat 0.6.
- Hover: instance flips (rotation.x π) to show inside lacquer. Click: side panel with data from lids.json.
- Filters: all / sko / twist-off / private label — animate instances out and in, do not remount the canvas.
- Mobile (< 768 px or `navigator.hardwareConcurrency <= 4` or no WebGL2): CSS grid of WebP images, same filters.
- Mount the canvas only when the section is within 1 viewport (IntersectionObserver); `frameloop="demand"` when idle; DPR clamp [1, 1.75].

## Community libraries (see scripts/install.*) and their single allowed role
| library | role on site |
|---------|-------------|
| awwwards-3d skill (coin-scroll template) | reference for hero choreography, Blender → GLB script |
| @react-three/fiber + drei | all live 3D |
| paper-design liquid-logo / @paper-design/shaders-react | preloader + logo mark in liquid metal (brand-coloured, ≤ 2 s) |
| shadergradient | at most one slow background behind the lithography section, palette from tokens only |
| liquid-glass-js | only header pill / filter chips over the lid wall; disabled on mobile |

## Budgets
- Hero JS (sequence + GSAP + Lenis) < 60 KB gz. R3F chunk lazy, < 220 KB gz.
- 60 fps on desktop, ≥ 45 fps on a mid Android (Redmi Note class). Measure with Chrome performance panel and record in docs/perf.md.
- Dispose geometries/textures on unmount. No memory growth after 10 filter switches.
