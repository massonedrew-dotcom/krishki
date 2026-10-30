"use client";

import Image from "next/image";
import { type CSSProperties, useState } from "react";
import { ACCORDION_LAYER_WIDTH, ACCORDION_LAYERS, type AccordionLayerKey, type Img, LID_CUTOUT, PHOTO } from "@/lib/site";
import styles from "./hero-lid-slot.module.css";
import { HERO_LID_ID } from "./store";

/** The factory's own photos per step (client, 29 Oct: no generated packshots; they showed lids we do not make). */
const PHOTOS: Img[] = [LID_CUTOUT.sko34, LID_CUTOUT.twistRed34, PHOTO.rings];

export type HeroLidSlotProps = {
  /** Alt texts per step (SKO, Twist-Off, ring), from messages. */
  alts: [string, string, string];
  /** Accordion copy (home.hero.accordion): button labels and one caption per layer. Omit for photos only. */
  accordion?: { open: string; close: string; label: string; layers: Record<AccordionLayerKey, string> };
  /** Step shown: 0 SKO, 1 Twist-Off, 2 wikel ring. */
  step?: number;
  id?: string;
  sizes?: string;
  className?: string;
};

/**
 * Hero centre: the real photo of the current step's product. On the SKO step a button opens the lid like an
 * accordion, sideways (client, 30 Oct: «left to right, like bellows»): outer lacquer, tinplate, inner lacquer and
 * the rubber ring fan out one after another with a little overshoot, each with its caption below; pressing
 * again folds them back onto the photo. Reduced motion:
 * the same two states, no travel. The first SKO photo is the LCP image.
 */
export function HeroLidSlot({ alts, accordion, step = 0, id = HERO_LID_ID, sizes = "(min-width: 1024px) 34vw, 72vw", className }: HeroLidSlotProps) {
  const [open, setOpen] = useState(false);
  const hasAccordion = accordion !== undefined && step === 0;
  const isOpen = open && hasAccordion;

  return (
    <div id={id} data-hero-lid="" data-step={step} data-open={isOpen || undefined} className={[styles.slot, className].filter(Boolean).join(" ")}>
      {PHOTOS.map((img, s) => (
        <Image
          key={img.src}
          src={img.src}
          width={img.width}
          height={img.height}
          alt={s === step && !isOpen ? alts[s]! : ""}
          aria-hidden={s === step && !isOpen ? undefined : true}
          priority={s === 0}
          sizes={sizes}
          className={styles.photo}
          data-on={(s === step && !isOpen) || undefined}
          data-photo={s === 2 ? "on-white" : undefined}
          draggable={false}
        />
      ))}

      {hasAccordion && (
        <>
          <ul className={styles.stack} aria-label={accordion.label} aria-hidden={!isOpen}>
            {ACCORDION_LAYERS.map((l, i) => (
              <li
                key={l.key}
                className={styles.layer}
                style={{ "--i": i, "--n": ACCORDION_LAYERS.length } as CSSProperties}
              >
                <Image src={l.src} width={ACCORDION_LAYER_WIDTH} height={l.height} alt="" sizes="(min-width: 1024px) 14vw, 30vw" className={styles.layerImg} draggable={false} />
                <span className={styles.caption}>{accordion.layers[l.key]}</span>
              </li>
            ))}
          </ul>
          {/* the whole lid is the hit area (client: «нажал на крышку»); the pill carries the visible label */}
          <button type="button" className={styles.toggle} aria-pressed={isOpen} onClick={() => setOpen((v) => !v)}>
            <span className={styles.pill}>{isOpen ? accordion.close : accordion.open}</span>
          </button>
        </>
      )}
    </div>
  );
}
