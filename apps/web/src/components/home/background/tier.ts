import type { Mode, TierOverride } from "./types";

export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const MOBILE_QUERY = "(max-width: 768px)";

/**
 * WebGL that is worth running a full-page loop on. three r163+ needs WebGL 2;
 * `failIfMajorPerformanceCaveat` rejects software rasterisers and blocklisted GPUs,
 * which then get the static image instead of a slow canvas.
 */
function hasGoodWebGL(allowSoftware: boolean): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2", { failIfMajorPerformanceCaveat: true });
    if (!gl) return false;
    // some software rasterisers pass the caveat check (SwiftShader in headless Chrome, llvmpipe):
    // a full-page loop on them starves the main thread
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "";
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return allowSoftware || !SOFTWARE_GL.test(renderer);
  } catch {
    return false;
  }
}

const SOFTWARE_GL = /swiftshader|llvmpipe|softpipe|software|basic render/i;

/** QA: ?bg=desktop|mobile|static on the page forces a tier (and lets a software GPU run the live one). */
function queryTier(): TierOverride {
  const v = new URLSearchParams(window.location.search).get("bg");
  return v === "desktop" || v === "mobile" || v === "static" ? v : "auto";
}

/** Decides the render mode once, on the client, after first paint. */
export function detectMode(requested: TierOverride = "auto"): Mode {
  const override = requested === "auto" ? queryTier() : requested;
  if (override === "static") return "static";
  if (window.matchMedia(REDUCED_MOTION_QUERY).matches) return "static";
  if (!hasGoodWebGL(override !== "auto")) return "static";
  if (override === "desktop" || override === "mobile") return override;
  const lowCores = (navigator.hardwareConcurrency ?? 8) <= 4;
  return window.matchMedia(MOBILE_QUERY).matches || lowCores ? "mobile" : "desktop";
}
