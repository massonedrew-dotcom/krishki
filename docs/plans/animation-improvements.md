# Animation improvements — apps/web

- **Status**: proposed, waiting for approval
- **Commit**: 9648071
- **Owner**: frontend-dev (all plans touch apps/web only)
- **Sources**: skills `improve-animations` (audit) and `find-animation-opportunities` (Emil Kowalski). Run on 2026-10-19 by the lead.

## Verdict

The motion layer is already in good shape. It has one engine (`src/components/motion/motion-engine.ts`: GSAP, ScrollTrigger and Lenis, lazy-loaded). Tokens live in `src/app/globals.css:64-68`. The reduced-motion contract is clean: `html.m` is set only when reduced motion is off. Hero text runs on CSS so the LCP does not wait for JS. Easing is right everywhere: no `ease-in`, no `transition: all`, no `scale(0)`.

The remaining issues are small: missing press feedback, one scroll bug on Back, two performance details and one teleporting filter. The highest-leverage item is plan 001, press feedback on buttons and chips.

Settled decisions this audit respects:
- `--ease-out` is GSAP `power3.out` on purpose, so CSS and GSAP share one curve (`globals.css:64`).
- Reveal and heading durations of 0.9–1.05 s are marketing motion and stay as they are.
- Reduced motion turns the GSAP layer off entirely (`site.css:1-6`, `motion-root.tsx:127`). This is the documented contract and is not reopened here.
- The `--ease-out: var(--ease-out)` line in `@theme inline` (`globals.css:197`) looks circular but is not. The compiled CSS puts it in `@layer theme`, and the unlayered `:root` value wins. Checked in `out/_next/static/css`.

## Findings

| # | Severity | Category | Location | Finding | Fix |
|---|---|---|---|---|---|
| 001 | HIGH | Feedback | `ui.css:27`, `site.css:400` | Buttons and filter chips have no `:active` state, so a press gives no response before navigation or submit | `scale(0.97)` on `:active`, 160 ms |
| 002 | MEDIUM | Interruptibility / UX | `motion-engine.ts:26` | Every route change forces `scrollTo(0)`, including browser Back, so Back loses the reading position | Sync Lenis to the scroll position Next already set, instead of forcing 0 |
| 003 | MEDIUM | Performance | `site.css:29-32` | `will-change: transform` is set permanently on every word of every heading, which means dozens of GPU layers per page for the whole session | Remove it; keyframes and GSAP promote layers only while animating |
| 004 | MEDIUM | Accessibility | `site.css:420` | `.lift:hover` lift is not gated to real pointers, so on touch a tapped card stays raised after Back | Gate the hover under `(hover: hover) and (pointer: fine)` |
| 005 | LOW | Performance | `site.css:433-442` | `.arrow-link::after` animates `width` (layout), and only reacts when the small span itself is hovered, not the card | Use `transform: scaleX` and also trigger it from the card hover |

## Missed opportunities

| # | Location | Today | Purpose | Frequency | Motion |
|---|---|---|---|---|---|
| 006 | `product-grid.tsx:59` | Filter chips toggle `hidden` and cards teleport | Preventing a jarring change | Occasional (catalogue) | GSAP Flip, 0.45 s `power3.out`, leaving cards fade out in 0.2 s |
| 007 | `site.css:271-288` + `.menu-panel .nav__link` | The panel slides in, but all links appear at once | Spatial consistency | Occasional (mobile) | Links rise 0.75rem → 0 with opacity, 40 ms stagger, 250 ms `--ease-out` |
| — | `lead-form.tsx:19` | No success state yet (TODO task 9) | Delight (rare) | Rare | Write the plan together with task 9: checkmark draw plus a short confirmation. No plan now |

## Rejected candidates

- **Count-up on big numbers** (`page.tsx:91` «scale.number», `pack-flow.tsx:25`). Rejected at gate 4, function: these are the facts a buyer reads, and counting delays the reading. The existing `data-reveal` is enough.
- **Hide-on-scroll header** (`header.tsx:46`). Rejected at gate 1, frequency: the header is core navigation on every scroll, and moving it hurts more than it helps.
- **Animated language switch** (`lang-switch.tsx`). Rejected at gate 1, frequency: navigation chrome already has a full page entrance.
- **Mouse-follow tilt on product cards** (the idea from Чудо Садик `motion.js`). Rejected at gate 4, function: cards are B2B catalogue items, and tilt reads as playful. It fits a kindergarten site, not a factory. Keep it for the hero lid only, if the 3D slot ever needs a fallback.
- **Animating the vertical rail dots more** (`site.css:130`). Rejected at gate 2, purpose: the scrubbed fill already shows the state.

---

## Plan 001 — Press feedback on buttons and chips

**Problem.** `src/components/ui/ui.css:27-30` (`.btn`) transitions only colours:
```css
transition:
  background-color var(--dur-fast) var(--ease-out),
  border-color var(--dur-fast) var(--ease-out),
  color var(--dur-fast) var(--ease-out);
```
`src/components/ui/site.css:400-403` (`.chip`) is the same, and neither has `:active`.

**Target.**
```css
/* ui.css, inside the existing .btn rule */
transition:
  background-color var(--dur-fast) var(--ease-out),
  border-color var(--dur-fast) var(--ease-out),
  color var(--dur-fast) var(--ease-out),
  transform 160ms var(--ease-out);

/* ui.css, after .btn:focus-visible */
.btn:active:not(:disabled):not([aria-disabled="true"]) {
  transform: scale(0.97);
}
/* site.css: add the same transform line to .chip's transition, then */
.chip:active {
  transform: scale(0.97);
}
```
Reduced motion: keep the press (it is feedback, not travel) and do not add an override.

**Steps.** 1) Edit `.btn` transition. 2) Add `.btn:active` rule. 3) Edit `.chip` transition. 4) Add `.chip:active` rule.

**Boundaries.** Only `ui.css` and `site.css`. No markup changes and no new tokens.

**Verify.** `pnpm --filter web lint && pnpm --filter web typecheck && pnpm --filter web build`. Feel check: press and hold a primary button and a chip. The press should be a visible but slight shrink, and on release it should return without bounce. Disabled buttons must not shrink. In DevTools Animations at 10 %, the scale should start immediately, with no slow start.

## Plan 002 — Keep scroll position on Back/Forward

**Problem.** `src/components/motion/motion-engine.ts:26`:
```ts
if (options.navigated) lenis?.scrollTo(0, { immediate: true, force: true });
```
`build` runs about 150 ms after every pathname change (`motion-root.tsx:166`), after Next has already restored the scroll on Back. The forced 0 throws the user to the top.

**Target.** Next already scrolls to top on a link click and restores on Back. Lenis only needs to adopt that position:
```ts
if (options.navigated) {
  lenis?.resize();
  lenis?.scrollTo(window.scrollY, { immediate: true, force: true });
}
```

**Boundaries.** Only `motion-engine.ts`. Do not touch `motion-root.tsx` or the 150 ms schedule.

**Verify.** Run the build checks. Feel check with the production build (`pnpm --filter web start`):
1. On `/ru/products`, scroll halfway, open a product and press Back. You should land at the same spot.
2. Clicking a header link should start at the top.
3. After Back, the first mouse-wheel tick should continue smoothly from the restored spot, with no jump.

## Plan 003 — Drop permanent will-change on heading words

**Problem.** `src/components/ui/site.css:29-32`:
```css
.split .w > span {
  display: inline-block;
  will-change: transform;
}
```
This applies to every word of every `.split` heading for the life of the page.

**Target.** Delete the `will-change: transform;` line and keep `display: inline-block`.

**Verify.** Run the build checks. In DevTools → Layers on `/ru`, the number of layers should drop noticeably. Feel check: the heading word-up animation still looks the same at 10 % playback, with no blurry text during the motion.

## Plan 004 — Gate card lift to real pointers

**Problem.** `src/components/ui/site.css:420-424`:
```css
.lift:hover,
.lift:focus-within {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lift);
}
```

**Target.**
```css
.lift:focus-within {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lift);
}
@media (hover: hover) and (pointer: fine) {
  .lift:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lift);
  }
}
```
Leave the existing reduced-motion block (`site.css:506-509`) as it is.

**Verify.** Run the build checks. In the Playwright 390 px screenshot nothing should change. In DevTools mobile emulation, tapping a card and pressing Back should leave no raised card. On desktop, hover lifts as before.

## Plan 005 — Arrow link on transform, driven by the card

**Problem.** `src/components/ui/site.css:433-442` animates `width: 1.5rem → 2.25rem` and only on `.arrow-link:hover`. Inside a product card (`product-grid.tsx:74`), the arrow is a `<span>` that is rarely hovered directly.

**Target.**
```css
.arrow-link::after {
  content: "";
  width: 2.25rem;
  height: 1px;
  background: currentColor;
  transform: scaleX(0.667);
  transform-origin: left;
  transition: transform var(--dur-base) var(--ease-out);
}
@media (hover: hover) and (pointer: fine) {
  .arrow-link:hover::after,
  .lift:hover .arrow-link::after {
    transform: scaleX(1);
  }
}
.lift:focus-within .arrow-link::after {
  transform: scaleX(1);
}
```
Remove the old `box-shadow: 4px 0 0 0 transparent;` line (it has no effect).

**Verify.** Run the build checks. Screenshots at 1440 and 390 px: the resting line length must look identical to before (1.5rem). Hovering anywhere on a product card should extend the line.

## Plan 006 — Animate the catalogue filter with GSAP Flip

**Problem.** `src/components/blocks/product-grid.tsx:55-60` toggles `hidden` on `<li>`, so cards jump into new grid positions instantly.

**Target.** Use GSAP Flip, which is free and already part of the `gsap` dependency (`gsap/Flip`). Load it lazily inside the click handler so it stays out of the initial bundle:
```tsx
const listRef = useRef<HTMLUListElement>(null);

async function choose(value: Filter) {
  const list = listRef.current;
  const animate = list && document.documentElement.classList.contains("m");
  if (!animate) return setActive(value);
  const [{ default: gsap }, { Flip }] = await Promise.all([import("gsap"), import("gsap/Flip")]);
  gsap.registerPlugin(Flip);
  const state = Flip.getState(list.children);
  flushSync(() => setActive(value));
  Flip.from(state, {
    duration: 0.45,
    ease: "power3.out",
    absolute: true,
    onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.3, ease: "power3.out" }),
    onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.96, duration: 0.2, ease: "power3.out" }),
  });
}
```
Pass `ref={listRef}` to the `<ul>` and `onClick={() => choose(f.value)}` to the chips. `flushSync` comes from `react-dom`. Without `html.m` (reduced motion), the filter stays instant.

**Boundaries.** Only `product-grid.tsx`, no new dependency. Load `gsap-react` and `gsap-plugins` skills before writing. Rapid clicks must stay safe: call `Flip.killFlipsOf(list.children)` at the start of `choose`.

**Verify.** Run the build checks, then confirm the JS budget in krishki-qa is still met (Flip loads only on the first click). Feel check: clicking chips quickly 5 times should never leave a half-faded card or overlapping cards. With reduced motion emulated, the filter should switch instantly. Add a Playwright test: after clicking «Twist-Off», only twist cards are visible.

## Plan 007 — Stagger the mobile menu links

**Problem.** `.menu-panel` (`site.css:271-288`) slides in 1rem with opacity, and all links inside appear in the same frame.

**Target.**
```css
.m .menu-panel .nav__link {
  opacity: 0;
  transform: translateY(0.75rem);
  transition:
    opacity 250ms var(--ease-out),
    transform 250ms var(--ease-out);
}
.m .menu-panel[data-open="true"] .nav__link {
  opacity: 1;
  transform: none;
}
.m .menu-panel[data-open="true"] li:nth-child(1) .nav__link { transition-delay: 40ms; }
.m .menu-panel[data-open="true"] li:nth-child(2) .nav__link { transition-delay: 80ms; }
.m .menu-panel[data-open="true"] li:nth-child(3) .nav__link { transition-delay: 120ms; }
.m .menu-panel[data-open="true"] li:nth-child(4) .nav__link { transition-delay: 160ms; }
.m .menu-panel[data-open="true"] li:nth-child(5) .nav__link { transition-delay: 200ms; }
.m .menu-panel[data-open="true"] li:nth-child(n + 6) .nav__link { transition-delay: 240ms; }
```
Closing has no delays, so all links leave together and the menu never feels slow to close. Check the real markup in `main-nav.tsx:23` first. If links are not inside `li`, STOP and report instead of improvising.

**Verify.** Run the build checks. At 390 px, open and close the menu quickly 5 times: the transitions should retarget, with no flicker and no links stuck invisible. The links must be clickable during the stagger.

## Execution order

| Plan | Severity | Depends on | Status |
|---|---|---|---|
| 001 press feedback | HIGH | — | TODO |
| 002 Back scroll | MEDIUM | — | TODO |
| 003 will-change | MEDIUM | — | TODO |
| 004 lift gating | MEDIUM | — | TODO |
| 005 arrow link | LOW | 004 (same rules) | TODO |
| 007 menu stagger | LOW | — | TODO |
| 006 filter Flip | LOW | — | TODO |

Plans 001 and 003–005 and 007 are CSS-only and can be one frontend-dev ticket. Plan 002 and plan 006 touch TS and should be separate commits. Every plan needs the CLAUDE.md DoD: Playwright screenshots at 1440 and 390 px, and lint, typecheck and build passing.
