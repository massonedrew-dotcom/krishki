"use client";

import Image from "next/image";
import styles from "./hero-lid-slot.module.css";
import { HERO_LID_ID } from "./store";

type Frame = { src: string; width: number; height: number };

/**
 * Live photo frames per hero step (client, 27 Oct: real-looking lids instead of the 3D render). Generated
 * packshots with an alpha background, masters in assets/generated/lids-live-2026-10-27/. Within a step the
 * scroll walks through the frames like a lid turned in the hand: SKO top → tilt → inside with the rubber ring.
 */
const FRAMES: Frame[][] = [
  [
    { src: "/images/lids/live/sko-34.webp", width: 904, height: 608 },
    { src: "/images/lids/live/sko-tilt.webp", width: 694, height: 652 },
    { src: "/images/lids/live/sko-inside-tilt.webp", width: 712, height: 689 },
    { src: "/images/lids/live/sko-inside.webp", width: 894, height: 658 },
  ],
  [
    { src: "/images/lids/live/red-34.webp", width: 849, height: 551 },
    { src: "/images/lids/live/red-tilt.webp", width: 715, height: 595 },
    { src: "/images/lids/live/red-inside.webp", width: 849, height: 610 },
    { src: "/images/lids/live/green-34.webp", width: 880, height: 599 },
  ],
  [{ src: "/images/lids/live/rings.webp", width: 947, height: 793 }],
];

/** Frame index inside a step for its local scroll progress 0 … 1. */
export const frameAt = (step: number, local: number) => {
  const n = FRAMES[step]?.length ?? 1;
  return Math.min(n - 1, Math.max(0, Math.floor(local * n)));
};

export type HeroLidSlotProps = {
  /** Alt texts per step (SKO, Twist-Off, ring), from messages. */
  alts: [string, string, string];
  /** Step shown: 0 SKO, 1 Twist-Off, 2 wikel ring. */
  step?: number;
  /** Frame inside the step (see frameAt). */
  frame?: number;
  id?: string;
  sizes?: string;
  className?: string;
};

/**
 * Hero centre: the live photo of the product of the current step. The frames of the current and the next
 * step are mounted and loaded eagerly, so a turn never waits for the network; the frames cross-fade and the
 * shown one floats gently. The first SKO frame is the LCP image.
 */
export function HeroLidSlot({ alts, step = 0, frame = 0, id = HERO_LID_ID, sizes = "(min-width: 1024px) 34vw, 72vw", className }: HeroLidSlotProps) {
  const mounted: { s: number; f: number }[] = [];
  FRAMES.forEach((frames, s) =>
    frames.forEach((_, f) => {
      if (s === step || s === step + 1 || (s === 0 && f === 0)) mounted.push({ s, f });
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
            draggable={false}
          />
        );
      })}
    </div>
  );
}
