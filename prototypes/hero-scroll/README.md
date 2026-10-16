# prototypes/hero-scroll — home page prototype (design direction v2)

Clickable prototype of the krishki.uz home page: light site, the **lid parade** (8 lid models pass through the centre left → right while you scroll), a persistent **floating 3D layer** of small lids and wikel rings behind the content, then why-us, partners marquee, azure geography band and CTA.
Not production code. It will be ported to `apps/web` (Next.js + R3F) separately.

## Run

```sh
npx -y serve prototypes/hero-scroll -l 4173      # then open http://localhost:4173/
```
Do not open the file directly (ES modules + importmap need http). `?fps` shows an fps meter.

## Files

| path | what |
|---|---|
| `index.html` | the whole page: CSS, HTML, three.js scene, GSAP ScrollTrigger + Lenis |
| `lid-sko.glb` | SKO I-82 lid + wikel ring, Draco, 53 KB (from `assets/blender/lid-sko.blend`) |
| `lid-twist.glb` | Twist-Off 82 lid + plastisol, white inside, Draco, 57 KB (from `assets/blender/lid-twist.blend`) |
| `tex/*.webp` | 1024 px circular lid-top lithography textures (planar top UV, edge at r = 0.488) |
| `img/*.webp` | partner logos, «Мечта хозяйки» logo, cucumber photo, Blender still of the gold lid |
| `tools/make-textures.mjs` + `lid-ellipses.json` | unwarps lid tops from the old-site photos (ellipse → circle, sharpen); draws the Ibrat top as SVG |
| `tools/prep-assets.mjs` | copies partner logos / logo / photo to WebP |
| `tools/shoot.mjs` | Playwright screenshots → `qa/screens/prototype/` (`--only 1440|390`, `--pick p01,p02`, `--rm`) |

Rebuild the GLBs (headless Blender, project root):
```sh
"D:/Blender/blender.exe" -b assets/blender/lid-sko.blend   -P scripts/blender/export_glb.py -- --out prototypes/hero-scroll/lid-sko.glb
"D:/Blender/blender.exe" -b assets/blender/lid-twist.blend -P scripts/blender/export_glb.py -- --out prototypes/hero-scroll/lid-twist.glb --inner-color F4F2EC --inner-metallic 0 --inner-roughness 0.35
node prototypes/hero-scroll/tools/make-textures.mjs && node prototypes/hero-scroll/tools/prep-assets.mjs
```

## Fallbacks
- **Mobile (≤ 768 px):** same parade, lid in the upper half, captions below; 5 floaters instead of 12; DPR ≤ 1.5; conveyor nav hidden.
- **prefers-reduced-motion:** no Lenis, no scrub, no loop. The parade becomes a vertical list of the 8 lids (flat texture discs); the floating layer is rendered as still frames; marquee stops.
- **No WebGL:** same list, no canvas.
- **Dispose:** `window.__parade.destroy()` (also on `pagehide`) disposes geometries, materials, textures, env map, renderer, ScrollTriggers and Lenis.

## Licences and sources
| item | licence / permission |
|---|---|
| three 0.170.0 | MIT |
| GSAP 3.12.5 + ScrollTrigger | GSAP standard licence (free, commercial use allowed, not OSI) |
| Lenis 1.1.0 | MIT |
| Tektur, Onest, IBM Plex Mono (Google Fonts) | SIL OFL 1.1 |
| awwwards-3d coin-scroll template (loop/lerp/dispose pattern) | MIT, tsogjavklann/awwwards-3d |
| Environment lighting | procedural (softbox planes → PMREM), no HDRI file, nothing to licence |
| Lid textures, logos, photos | client material from the old krishki.uz (`assets/reference/old-site/`); client allowed use, incl. partner logos (Sardoba, Hilol, Ibrat, Modesto, Оливьез, Picolla, Ittifoq) |
| Lid models | own Blender models (`scripts/blender/build_lid.py`) |

## Placeholders / TODO(client)
- Lithography textures are unwarped from small product photos (lids ≈ 200 px wide in the source) → soft. Replace with the real print files (design scans / PDFs) for production.
- Ibrat lid top is redrawn (all photos show it partly covered by other lids).
- Ring colour: light grey as on the old-site photos (the Blender file has dark red-brown) — confirm.
- Twist-Off single-colour shades (#2F8F3A / #C62A2A) are by eye.
- Nav items point to `#` — the real pages are built in `apps/web`.
- WhatsApp link assumes +998 97 590-88-22 is on WhatsApp — confirm.
