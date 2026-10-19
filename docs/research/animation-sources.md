# Animation sources for krishki.uz (checked 2026-10-19)

Source: reel by saint4ai, which names Anime.js, Motion, Kokonut UI and 21st.dev. Licences are recorded in LICENSES.md.

## Installed skills (`.claude/skills/`)
| Skill | From | Use for |
|---|---|---|
| gsap-core, gsap-timeline, gsap-scrolltrigger, gsap-plugins, gsap-react, gsap-frameworks, gsap-performance, gsap-utils | greensock/gsap-skills (official) | everything GSAP, our main motion tool. Replaced the older community gsap-scrolltrigger |
| emil-design-eng, animate, animation-vocabulary, animation-performance, find-animation-opportunities, improve-animations, review-animations | emilkowalski/skills | polish: easing, duration, micro-interactions, motion review |
| animejs | BowTiedSwan/animejs-skills | Anime.js v4. Reference only, not in the stack |

## Component libraries to look at (`vendor/`, reference only)
| Repo | Site | Stack | Notes |
|---|---|---|---|
| kokonut-labs/kokonutui | kokonutui.com | React + Tailwind + Motion | shadcn registry `@kokonutui` |
| magicuidesign/magicui | magicui.design | React + Tailwind + Motion | marquee, number ticker, border beam |
| DavidHDev/react-bits | reactbits.dev | React, some GSAP/three | MIT + Commons Clause |
| juliangarnier/anime | animejs.com | vanilla JS | SVG drawing, staggers |
| motiondivision/motion | motion.dev | React / vanilla | springs, layout animations |

21st.dev is a marketplace: each component has its own author and licence, so check it per component. There is a 21st plugin in the Claude plugin directory.

## Ideas from our own projects
`chudosadik/.../ui_kits/website/motion.js` and `motion.css` have a cursor-driven 3D card tilt, magnetic buttons, a light sweep across buttons, a reading-progress bar and a wave entrance for grid children. They are plain JS/CSS with reduced-motion support, so they port to GSAP easily.

## Rules
- Stack is GSAP + ScrollTrigger + Lenis + R3F. Adding `motion` or `animejs` to apps/web is a stack change and needs approval.
- Do not copy layout or branding of commercial sites (CLAUDE.md rule 6). Take techniques, not designs.
- Every animation honours `prefers-reduced-motion` and the performance budget (krishki-qa).
