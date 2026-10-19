# LICENSES

Third-party repositories cloned into `vendor/` (reference only, `vendor/` is git-ignored).
Checked 2026-10-15 from the LICENSE files in the cloned repositories.

| Repo (vendor/ dir) | License | Commercial use | Notes |
|---|---|---|---|
| tsogjavklann/awwwards-3d (awwwards-3d) | MIT | Yes | Skill + coin-scroll template; keep copyright notice if code is copied |
| pmndrs/react-three-fiber | MIT | Yes | npm dependency |
| pmndrs/drei | MIT | Yes | npm dependency |
| ruucm/shadergradient | MIT | Yes | npm `@shadergradient/react` (repo root has no LICENSE file; README and package.json state MIT) |
| dashersw/liquid-glass-js | MIT | Yes | npm dependency |
| paper-design/liquid-logo | **PolyForm Shield 1.0.0** | Yes, with a restriction | Not OSI open source. Forbids using the software to provide a product that competes with the licensor (Paper). A factory website does not compete, so use is allowed; do not redistribute it as a design tool. Decision for ADR 0003 |
| paper-design/shaders (paper-shaders) | Apache-2.0 | Yes | Keep NOTICE; state changes if modified |
| ahujasid/blender-mcp | MIT | Yes | Dev tool only, not shipped |
| pbakaus/impeccable | Apache-2.0 | Yes | Skill; keep NOTICE.md |
| nextlevelbuilder/ui-ux-pro-max-skill | MIT | Yes | Skill |
| Leonxlnx/taste-skill | MIT | Yes | Skill |
| VoltAgent/awesome-design-md | MIT | Yes | Reference only. Per CLAUDE.md rule 6, do not copy layout or branding of existing commercial sites |
| freshtechbro/claudedesignskills (claudedesignskills) | MIT | Yes | Skills copied: react-three-fiber, threejs-webgl, web3d-integration-patterns, blender-web-pipeline. Its gsap-scrolltrigger was replaced by the official one on 2026-10-19 |
| greensock/gsap-skills | MIT | Yes | Official GSAP skills, all 8 copied (gsap-core, -timeline, -scrolltrigger, -plugins, -react, -frameworks, -performance, -utils). Added 2026-10-19 |
| emilkowalski/skills (emil-skills) | MIT | Yes | Copied: emil-design-eng, animate, animation-vocabulary, animation-performance, find-animation-opportunities, improve-animations, review-animations. Added 2026-10-19 |
| BowTiedSwan/animejs-skills | MIT (stated in README, no LICENSE file) | Yes | Skill `animejs` copied. Anime.js is not in the stack; reference only. Added 2026-10-19 |
| kokonut-labs/kokonutui | MIT | Yes | Reference. Components need `motion` (Framer Motion), not in the stack: adding it needs approval. Added 2026-10-19 |
| magicuidesign/magicui | MIT | Yes | Reference, same `motion` dependency note. Added 2026-10-19 |
| DavidHDev/react-bits | **MIT + Commons Clause** | Yes for use in a site; selling the components themselves is forbidden | Reference. Keep the notice if a component is copied. Added 2026-10-19 |
| juliangarnier/anime | MIT | Yes | Reference, not in the stack. Added 2026-10-19 |
| motiondivision/motion | MIT | Yes | Reference, not in the stack. Added 2026-10-19 |

## Open points
- liquid-logo (PolyForm Shield): confirm use for the preloader (phase 2) before shipping it.
- Skills copied into `.claude/skills/` come from the repos above and carry the same licenses.
- Not yet recorded: licenses of npm packages added later (gsap, lenis, three). Note: GSAP standard license allows commercial use but is not open source. Re-check when added.

## Python dependencies (apps/api, task 8, checked 2026-10-16)
| Package | License | Commercial use |
|---|---|---|
| fastapi, pydantic, pydantic-settings, uvicorn, httpx | MIT / BSD-3-Clause | Yes |
| sqlalchemy | MIT | Yes |
| alembic | MIT | Yes |
| asyncpg | Apache-2.0 | Yes |
| aiogram 3.31.0 (pulls aiohttp, Apache-2.0) | MIT | Yes |
| phonenumbers 9.0.41 | Apache-2.0 | Yes |
| testcontainers[postgres] 4.15.0 (dev only) | Apache-2.0 | Yes |

## Fonts and frontend dev tools (task 2, checked 2026-10-16)
| Item | License | Commercial use | Notes |
|---|---|---|---|
| Tektur (Google Fonts) | SIL OFL 1.1 | Yes | self-hosted via next/font |
| Onest (Google Fonts) | SIL OFL 1.1 | Yes | self-hosted via next/font |
| IBM Plex Mono (Google Fonts) | SIL OFL 1.1 | Yes | captions only |
| axe-core, @axe-core/playwright | MPL-2.0 | Yes | dev dependency, not shipped |
| next, react, next-intl, tailwindcss | MIT | Yes | |
| openapi-typescript 7.13 (dev, packages/shared) | MIT | Yes | generates src/api.d.ts from openapi.json |
| three 0.170, gsap 3.12.5, lenis 1.1.0 via unpkg/esm.sh (prototype only) | MIT / GSAP standard licence (no charge, commercial use allowed) / MIT | 2026-10-16 |
