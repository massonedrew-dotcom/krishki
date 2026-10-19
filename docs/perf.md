# Performance log

## 2026-10-19 — prototypes/light-home (ticket 20)
Measured headless on hardware ANGLE (dev laptop, Intel UHD iGPU, D3D11), 12 s stage scrub. Emulated tiers on one laptop — NOT real devices; re-measure on a real mid Android after the R3F port (ticket 23).

| Tier | Settled fps | JS frame avg / p95 |
|---|---|---|
| desktop 1440 | ~46–53 | 5.2 / 16 ms |
| tablet 768, CPU ×2 throttle | ~51–58 | 2–3 / 4–5 ms |
| mobile 390, CPU ×4 throttle | ~50–56 | 3 / 7 ms |

index.html 102.8 KB (28.9 KB gz); assets ≈ 640 KB; lid-sko.glb 54.6 KB, lid-twist.glb 58.7 KB.
