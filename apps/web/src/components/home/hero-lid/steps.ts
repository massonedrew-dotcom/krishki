/*
 * The hero's three product steps (SKO I-82 → Twist-Off 82 → wikel ring), shared by the HTML step cards
 * (hero-steps/) and the 3D turntable (background/hero-lid-pass.ts), so the card and the object turn together.
 *
 * Scroll progress p (0 … 1 over the hero's sticky range) maps to s = p · 3. Each step dwells, then the
 * turntable turns to the next one over TURN around s = 1 and s = 2:
 *   s 0 … 0.78 SKO, 0.78 … 1.22 turn, 1.22 … 1.78 Twist-Off, 1.78 … 2.22 turn, 2.22 … 3 ring.
 */

export const HERO_STEPS = ["sko", "twist", "ring"] as const;
export type HeroStepKey = (typeof HERO_STEPS)[number];
export const STEP_COUNT = HERO_STEPS.length;

/** Half width of a turn, in steps. */
const TURN = 0.22;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (v: number) => {
  const c = clamp01(v);
  return c * c * (3 - 2 * c);
};

/** Continuous turntable position 0 … STEP_COUNT − 1 for progress p (0 = SKO in front, 1 = Twist-Off, 2 = ring). */
export function stepPos(p: number): number {
  const s = clamp01(p) * STEP_COUNT;
  let pos = 0;
  for (let i = 1; i < STEP_COUNT; i++) pos += smooth((s - (i - TURN)) / (2 * TURN));
  return pos;
}

/** Local progress 0 … 1 inside step i's own share of the scroll (for motions within a step). */
export function stepLocal(p: number, i: number): number {
  return clamp01(clamp01(p) * STEP_COUNT - i);
}

/** The step whose card is shown: switches at the middle of each turn. */
export function activeStep(p: number): number {
  return Math.min(STEP_COUNT - 1, Math.max(0, Math.round(stepPos(p))));
}

/** Progress at which step i is settled (used by the step buttons to scroll there). */
export function stepAnchor(i: number): number {
  const s = i === 0 ? 0 : i === STEP_COUNT - 1 ? STEP_COUNT - 0.35 : i + 0.5;
  return s / STEP_COUNT;
}

/*
 * Hero timeline (client, 30 Oct): the page opens with the SKO taken apart and its specs; scrolling folds the
 * layers into the lid, then the product changes to Twist-Off and the rings, then the page scrolls on.
 *   p 0 … 0.18 apart · 0.18 … 0.42 folding · 0.42 … 0.6 SKO · 0.6 … 0.8 Twist-Off · 0.8 … 1 rings
 */
const APART_UNTIL = 0.18;
const FOLDED_AT = 0.42;
const PRODUCT_AT = [0, 0.6, 0.8] as const;

/** How far the SKO is apart at progress p: 1 at the top, 0 once folded. */
export function heroOpen(p: number): number {
  return 1 - smooth((clamp01(p) - APART_UNTIL) / (FOLDED_AT - APART_UNTIL));
}

/** The product shown at progress p (0 SKO, 1 Twist-Off, 2 rings). */
export function heroStep(p: number): number {
  const c = clamp01(p);
  let step = 0;
  PRODUCT_AT.forEach((at, i) => {
    if (c >= at) step = i;
  });
  return step;
}

/** Progress a step button scrolls to: the middle of that product's own stretch (SKO: assembled). */
export function heroAnchor(i: number): number {
  const from = i === 0 ? FOLDED_AT : PRODUCT_AT[i] ?? 0;
  const to = PRODUCT_AT[i + 1] ?? 1;
  return (from + to) / 2;
}
