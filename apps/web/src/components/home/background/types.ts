/** Section moods of the living background, top to bottom of the home page. */
export type Mood = "hero" | "products" | "factory" | "order";

export const MOODS: readonly Mood[] = ["hero", "products", "factory", "order"];

/** Mood → id of the page element that carries it. Missing ids are skipped; none at all → gentle drift. */
export type SectionIds = Partial<Record<Mood, string>>;

/** Live render tiers. `static` = one pre-rendered image of the scene (reduced motion, no WebGL, weak GPU). */
export type LiveTier = "desktop" | "mobile";
export type Mode = LiveTier | "static";

/** What the page may force (QA, demo). `auto` decides from media queries and the device. */
export type TierOverride = "auto" | Mode;

export type LidKind = "sko" | "twistRed" | "twistGreen" | "ring";

/** Frame-time stats exposed on window.__livingBg when `debug` is on. */
export type FrameStats = { frames: number; seconds: number; fps: number; avgMs: number; p95Ms: number };
