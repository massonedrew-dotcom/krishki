import { notFound } from "next/navigation";
import { BgDemo } from "./demo";

/**
 * Dev-only demo of <LivingBackground/> with tall dummy sections (ids hero / products / factory / order).
 * Not part of production: 404 when NODE_ENV is "production", unless a local QA build sets KRISHKI_BG_DEMO=1
 * (used to measure fps and bundle size on a production bundle; never set it in CI or deploys).
 * Query: ?tier=desktop|mobile|static (default auto), ?bare=1 hides the panels, ?debug=0 hides window.__livingBg.
 */
export default function BgDemoPage() {
  if (process.env.NODE_ENV === "production" && process.env.KRISHKI_BG_DEMO !== "1") notFound();
  return <BgDemo />;
}
