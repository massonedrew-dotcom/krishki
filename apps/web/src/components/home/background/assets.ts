// Static files of the background. NEXT_PUBLIC_BASE_PATH is set for the GitHub Pages preview.
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const BG_ASSETS = {
  /** SKO I-82 lid + wikel ring, meshopt + quantised, full detail (from prototypes/hero-scroll/lid-sko.glb). */
  sko: `${BASE}/models/lid-sko.glb`,
  /** Twist-off 82 lid + plastisol, meshopt + quantised, full detail (from prototypes/hero-scroll/lid-twist.glb). */
  twist: `${BASE}/models/lid-twist.glb`,
  /** Red lithography for the Twist-off top, 512 px (from prototypes/hero-scroll/tex/twist-tomato.webp). */
  twistRed: `${BASE}/models/twist-tomato-512.webp`,
  /** Pre-rendered frames of the scene (hero mood) for reduced motion and no WebGL. */
  staticWide: `${BASE}/images/bg/living-bg-wide.webp`,
  staticTall: `${BASE}/images/bg/living-bg-tall.webp`,
} as const;
