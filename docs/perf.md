# Performance log

## 2026-10-19 — prototypes/light-home (ticket 20)
Measured headless on hardware ANGLE (dev laptop, Intel UHD iGPU, D3D11), 12 s stage scrub. Emulated tiers on one laptop — NOT real devices; re-measure on a real mid Android after the R3F port (ticket 23).

| Tier | Settled fps | JS frame avg / p95 |
|---|---|---|
| desktop 1440 | ~46–53 | 5.2 / 16 ms |
| tablet 768, CPU ×2 throttle | ~51–58 | 2–3 / 4–5 ms |
| mobile 390, CPU ×4 throttle | ~50–56 | 3 / 7 ms |

index.html 102.8 KB (28.9 KB gz); assets ≈ 640 KB; lid-sko.glb 54.6 KB, lid-twist.glb 58.7 KB.

## 2026-10-26 — living background, home v4 (ticket 26)
`apps/web/src/components/home/background/`, measured on a production bundle (`next build` + `next start`, demo route `/bg-demo` with `KRISHKI_BG_DEMO=1`) with `qa/screens/26-background/shoot.mjs perf`. Headless Chromium on hardware ANGLE: Intel UHD Graphics (i3-1005G1 laptop, D3D11). Each tier: 5 s idle at the hero, then a 12 s eased scroll scrub through hero → products → factory → order. Emulated tiers on one laptop, NOT real devices; re-measure on a real mid Android before launch.

| Tier | Settings | Idle fps (p95 frame) | Scroll scrub fps (p95 frame) |
|---|---|---|---|
| desktop 1440×900, DPR 1 | 14 lids, MSAA | 60.0 (18.1 ms) | 59.7 (18.2 ms) |
| desktop 1440×900, DPR 2 → cap 1.5 | 14 lids, MSAA | 60.0 (18.7 ms) | 59.9 (18.8 ms) |
| mobile 390×844, DPR 3 → cap 1.5, CPU ×4 throttle | 7 lids, no MSAA, low-poly ring | 60.0 (17.9 ms) | 59.9 (18.7 ms) |

- With a 1.75 DPR cap, desktop DPR 2 scrubbed at 47.5 fps (p95 28.8 ms) on the same iGPU, so both tiers are now capped at 1.5.
- Reduced motion / no WebGL 2 / `failIfMajorPerformanceCaveat` (software GL): no canvas loop; a static frame is drawn once into a 2D canvas (`public/images/bg/living-bg-wide.webp` 1920×1080, 64 KB; `living-bg-tall.webp` 860×1864, 30 KB).
- Loading: nothing in the first paint. The layer mounts after `load` + `requestIdleCallback`, so it cannot be the LCP element (the static frame is a canvas, which is not an LCP candidate). Rendering pauses while the tab is hidden.
- JS, gzip -9, production chunks:
  - own code: scene chunk 5.7 KB + shell (inside the page chunk, 3.6 KB together with the demo page) → under 10 KB, budget 60 KB;
  - GSAP core + ScrollTrigger 44.5 KB (24.8 + 19.7), shared with the motion engine on real pages;
  - three + R3F + three addons (GLTFLoader, meshopt decoder, RoomEnvironment): 267 KB (88.0 + 100.6 + 51.8 + 27.0). Above the 220 KB R3F chunk guideline in krishki-3d, because R3F imports all of three (`import * as THREE`). All of it is lazy.
- Assets: `public/models/lid-sko.glb` 73.5 KB and `lid-twist.glb` 69.0 KB (meshopt + quantised, simplified to about 37 % of the triangles, no Draco decoder to download); `twist-tomato-512.webp` 15.6 KB.
