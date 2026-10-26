"use client";

import Image from "next/image";
import { useRef, useSyncExternalStore } from "react";
import styles from "./hero-lid-slot.module.css";
import { HERO_LID_ID, heroLidDrag, heroLidLive } from "./store";

export type HeroLidSlotProps = {
  /** Alt text of the SKO I-82 photo, from messages (e.g. «Крышка СКО I-82»). */
  alt: string;
  /** Element id the living background tracks; keep the default unless the page has two slots. */
  id?: string;
  /** next/image sizes for the photo. */
  sizes?: string;
  className?: string;
};

/**
 * Hero centre: a square slot. Server-rendered alpha cutout of the SKO I-82 lid photo (LCP element, and
 * the fallback for reduced motion / no WebGL / before the canvas loads), framed like the 3D lid
 * (84 % of the slot width, centred), so the hand-over has no jump. Works on the dark hero stage.
 * When <LivingBackground/> is on the page and live, it paints the hero's dark stage and draws the 3D
 * lid into this exact rect (same canvas, one WebGL context); the photo fades out and
 * html[data-hero-lid="live"] is set, so the hero section can drop its own background.
 * Mouse drag turns the lid; touch is ignored so page scroll is never trapped.
 */
export function HeroLidSlot({ alt, id = HERO_LID_ID, sizes = "(min-width: 1024px) 34vw, 72vw", className }: HeroLidSlotProps) {
  const live = useSyncExternalStore(heroLidLive.subscribe, heroLidLive.get, () => false);
  const last = useRef<{ x: number; y: number } | null>(null);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!live || e.pointerType !== "mouse" || e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    last.current = { x: e.clientX, y: e.clientY };
    heroLidDrag.active = true;
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const p = last.current;
    if (!p) return;
    const w = Math.max(1, e.currentTarget.clientWidth);
    heroLidDrag.yaw += ((e.clientX - p.x) / w) * Math.PI * 1.6;
    heroLidDrag.pitch = Math.max(-0.9, Math.min(0.9, heroLidDrag.pitch + ((e.clientY - p.y) / w) * Math.PI));
    last.current = { x: e.clientX, y: e.clientY };
  };
  const end = () => {
    last.current = null;
    heroLidDrag.active = false;
  };

  return (
    <div
      id={id}
      data-hero-lid=""
      data-live={live || undefined}
      className={[styles.slot, className].filter(Boolean).join(" ")}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={end}
      onPointerCancel={end}
      onLostPointerCapture={end}
    >
      <Image
        src="/images/lids/sko-34-cutout.webp"
        width={785}
        height={500}
        alt={alt}
        priority
        sizes={sizes}
        className={styles.photo}
        draggable={false}
      />
    </div>
  );
}
