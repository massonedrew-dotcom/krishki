import type Lenis from "lenis";

declare global {
  interface Window {
    /** The page's Lenis instance, set by components/motion/motion-engine.ts once it boots. */
    __lenis?: Lenis;
  }
}

export {};
