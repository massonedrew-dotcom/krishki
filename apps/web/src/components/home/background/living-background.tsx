"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./living-background.module.css";
import { HERO_LID_ID } from "../hero-lid/store";
import { StaticBackdrop } from "./static-backdrop";
import { detectMode, REDUCED_MOTION_QUERY } from "./tier";
import type { HeroScroll } from "./scroll-moods";
import type { Mode, SectionIds, TierOverride } from "./types";

// three, R3F, GSAP and the scene live in this chunk; it is requested only after first paint and idle
const BackgroundScene = dynamic(() => import("./background-scene"), { ssr: false, loading: () => null });

const NO_HERO_SCROLL: HeroScroll = {};

export const DEFAULT_SECTIONS: SectionIds = { hero: "hero", products: "products", factory: "factory", order: "order" };

export type LivingBackgroundProps = {
  /** Mood → element id on the page. Defaults to ids "hero", "products", "factory", "order". */
  sections?: SectionIds;
  /**
   * Id of the <HeroLidSlot/> element the rotating hero lid is drawn into (same canvas, one WebGL
   * context). Default "hero-lid"; null turns the hero lid off. A missing element is simply skipped.
   */
  heroLid?: string | null;
  /**
   * Scroll range of the hero steps (SKO I-82 → Twist-Off 82 → wikel ring), as ScrollTrigger start/end on
   * the hero section; endTrigger = id of a later section to stretch it (e.g. "products"). Ignored while a
   * <HeroSteps/> is mounted: it reports its own sticky range (hero-lid/store.ts heroStepsScroll).
   * Default { start: "top top", end: "bottom bottom" }: give the hero extra height (e.g. 250–300vh)
   * with a sticky slot inside, or pin it, so the sequence has room.
   */
  heroScroll?: HeroScroll;
  /** Force a tier (QA and the dev demo). Reduced motion always wins and gets the static image. */
  tier?: TierOverride;
  /** Exposes window.__livingBg (frame times, mood) for QA. */
  debug?: boolean;
};

/**
 * Living background of the home page: one fixed layer behind all sections, aria-hidden, no pointer
 * events. Renders nothing on the server and in the first paint; after `load` + idle it picks a mode:
 * desktop / mobile (live WebGL) or static (reduced motion, no WebGL 2, weak GPU, context lost).
 * The layer is portalled to <body>, so transforms on page wrappers cannot break `position: fixed`.
 */
export function LivingBackground({
  sections = DEFAULT_SECTIONS,
  heroLid = HERO_LID_ID,
  heroScroll = NO_HERO_SCROLL,
  tier = "auto",
  debug = false,
}: LivingBackgroundProps) {
  const [mode, setMode] = useState<Mode | null>(null);
  const [live, setLive] = useState(false);
  const [reason, setReason] = useState<string | null>(null);
  /** QA: ?bgdebug=1 exposes window.__livingBg (frame times) on any page, e.g. to measure fps on the home page. */
  const [queryDebug, setQueryDebug] = useState(false);

  // a new object literal from the parent on every render must not rebind ScrollTrigger
  const key = JSON.stringify(sections);
  const stableSections = useMemo(() => JSON.parse(key) as SectionIds, [key]);

  useEffect(() => {
    let cancelled = false;
    let idle: number | undefined;
    let timer: number | undefined;
    const start = () => {
      if (cancelled) return;
      setQueryDebug(new URLSearchParams(window.location.search).get("bgdebug") === "1");
      setMode(detectMode(tier));
    };
    const schedule = () => {
      // Safari has no requestIdleCallback
      if (typeof window.requestIdleCallback === "function") idle = window.requestIdleCallback(start, { timeout: 2500 });
      else timer = setTimeout(start, 300) as unknown as number;
    };
    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });

    // the user may switch reduced motion on while the page is open
    const mq = window.matchMedia(REDUCED_MOTION_QUERY);
    const onChange = () => setMode((m) => (m === null ? m : detectMode(tier)));
    mq.addEventListener("change", onChange);

    return () => {
      cancelled = true;
      window.removeEventListener("load", schedule);
      if (idle !== undefined) window.cancelIdleCallback(idle);
      if (timer !== undefined) clearTimeout(timer);
      mq.removeEventListener("change", onChange);
    };
  }, [tier]);

  const onReady = useCallback(() => setLive(true), []);
  const onFail = useCallback((why: string) => {
    setReason(why);
    setLive(false);
    setMode("static");
  }, []);

  if (mode === null) return null;

  return createPortal(
    <div
      aria-hidden="true"
      className={styles.layer}
      data-living-bg={mode}
      data-live={live || undefined}
      data-fallback-reason={reason ?? undefined}
    >
      <div className={styles.base} />
      {mode === "static" ? (
        <StaticBackdrop className={styles.still} />
      ) : (
        <div className={styles.canvas}>
          <BackgroundScene tier={mode} sections={stableSections} heroLid={heroLid} heroScroll={heroScroll} debug={debug || queryDebug} onReady={onReady} onFail={onFail} />
        </div>
      )}
    </div>,
    document.body,
  );
}
