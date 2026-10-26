import type { Mode, TierOverride } from "./types";

export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const MOBILE_QUERY = "(max-width: 768px)";

/**
 * WebGL that is worth running a full-page loop on. three r163+ needs WebGL 2;
 * `failIfMajorPerformanceCaveat` rejects software rasterisers and blocklisted GPUs,
 * which then get the static image instead of a slow canvas.
 */
function hasGoodWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2", { failIfMajorPerformanceCaveat: true });
    if (!gl) return false;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

/** Decides the render mode once, on the client, after first paint. */
export function detectMode(override: TierOverride = "auto"): Mode {
  if (override === "static") return "static";
  if (window.matchMedia(REDUCED_MOTION_QUERY).matches) return "static";
  if (!hasGoodWebGL()) return "static";
  if (override === "desktop" || override === "mobile") return override;
  const lowCores = (navigator.hardwareConcurrency ?? 8) <= 4;
  return window.matchMedia(MOBILE_QUERY).matches || lowCores ? "mobile" : "desktop";
}
