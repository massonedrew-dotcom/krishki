"use client";

import Image from "next/image";
import { type CSSProperties, useEffect, useState } from "react";
import { type Img, LID_LIVE } from "@/lib/site";
import styles from "./hero-lid-slot.module.css";
import { HERO_LID_ID } from "./store";

/**
 * Live photo frames per hero step (client, 27 Oct: real-looking lids instead of the 3D render). Within a step
 * the scroll walks through the frames like a lid turned in the hand: SKO top → tilt → inside with the ring.
 */
const FRAMES: Img[][] = [
  [LID_LIVE.sko34, LID_LIVE.skoTilt, LID_LIVE.skoInsideTilt, LID_LIVE.skoInside],
  [LID_LIVE.red34, LID_LIVE.redTilt, LID_LIVE.redInside, LID_LIVE.green34],
  [LID_LIVE.rings],
];

/** Number of photo frames of a step. */
export const frameCount = (step: number) => FRAMES[step]?.length ?? 1;

export type HeroLidSlotProps = {
  /** Alt texts per step (SKO, Twist-Off, ring), from messages. */
  alts: [string, string, string];
  /** Step shown: 0 SKO, 1 Twist-Off, 2 wikel ring. */
  step?: number;
  /** Frame nearest to the scroll position (gets the alt text); the picture itself follows --pos (CSS). */
  frame?: number;
  id?: string;
  sizes?: string;
  className?: string;
};

/**
 * Hero centre: the live photo of the product of the current step. First paint mounts only the first SKO
 * frame (the LCP image); once the page has loaded and is idle, the frames of the current and the next step
 * are mounted eagerly, so a turn never waits for the network and nothing competes with the LCP. Inside a step the frames
 * cross-fade and turn continuously with the scroll (--pos, set by HeroSteps on an ancestor); between steps
 * they fade. The whole slot floats gently. The first SKO frame is the LCP image.
 */
export function HeroLidSlot({ alts, step = 0, frame = 0, id = HERO_LID_ID, sizes = "(min-width: 1024px) 34vw, 72vw", className }: HeroLidSlotProps) {
  // the extra frames wait for window load + idle, so they never compete with the LCP frame
  const [warm, setWarm] = useState(false);
  useEffect(() => {
    let idle = 0;
    const go = () => {
      const ric = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200));
      idle = ric(() => setWarm(true));
    };
    if (document.readyState === "complete") go();
    else window.addEventListener("load", go, { once: true });
    return () => {
      window.removeEventListener("load", go);
      (window.cancelIdleCallback ?? window.clearTimeout)(idle);
    };
  }, []);
  const mounted: { s: number; f: number }[] = [];
  FRAMES.forEach((frames, s) =>
    frames.forEach((_, f) => {
      const first = s === 0 && f === 0;
      if (first || (warm && (s === step || s === step + 1))) mounted.push({ s, f });
    }),
  );

  return (
    <div id={id} data-hero-lid="" data-step={step} className={[styles.slot, className].filter(Boolean).join(" ")}>
      {mounted.map(({ s, f }) => {
        const img = FRAMES[s]![f]!;
        const on = s === step && f === frame;
        return (
          <Image
            key={img.src}
            src={img.src}
            width={img.width}
            height={img.height}
            alt={on ? alts[s]! : ""}
            aria-hidden={on ? undefined : true}
            priority={s === 0 && f === 0}
            loading={s === 0 && f === 0 ? undefined : "eager"}
            sizes={sizes}
            className={styles.photo}
            data-on={on || undefined}
            data-cur={s === step || undefined}
            style={{ "--i": f } as CSSProperties}
            draggable={false}
          />
        );
      })}
    </div>
  );
}
