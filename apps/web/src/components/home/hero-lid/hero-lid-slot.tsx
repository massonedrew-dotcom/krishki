import Image from "next/image";
import type { CSSProperties } from "react";
import { ACCORDION_LAYER_WIDTH, ACCORDION_LAYERS, type AccordionLayerKey, type Img, LID_CUTOUT, PHOTO } from "@/lib/site";
import styles from "./hero-lid-slot.module.css";
import { HERO_LID_ID } from "./store";

/** The factory's own photos per step (client, 29 Oct: no generated packshots; they showed lids we do not make). */
const PHOTOS: Img[] = [LID_CUTOUT.sko34, LID_CUTOUT.twistRed34, PHOTO.rings];

export type AccordionCopy = {
  /** Layer name (home.hero.accordion.layers) and its spec from the SKO datasheet row (home.products.items.sko). */
  layers: Record<AccordionLayerKey, { name: string; value: string }>;
};

export type HeroLidSlotProps = {
  /** Alt texts per step (SKO, Twist-Off, ring), from messages. */
  alts: [string, string, string];
  /** Accordion captions. Omit for photos only (the background demo). */
  accordion?: AccordionCopy;
  /** Step shown: 0 SKO, 1 Twist-Off, 2 wikel ring. */
  step?: number;
  /** How far the SKO is taken apart, 0 (assembled photo) … 1 (four layers fanned out); driven by the scroll. */
  open?: number;
  id?: string;
  sizes?: string;
  className?: string;
};

/**
 * Hero centre (client, 30 Oct). The page opens with the SKO taken apart: outer lacquer, tinplate, inner lacquer
 * and the rubber ring stand on their edge on an arc, each with its spec. Scrolling folds them back into the real
 * SKO photo (`open` 1 → 0), then the step changes to Twist-Off and the rings. The layer list is aria-hidden: the
 * datasheet card beside it carries the same rows for screen readers. The layers are the first thing on screen, so they load
 * with priority, as does the SKO photo they fold into.
 */
export function HeroLidSlot({ alts, accordion, step = 0, open = 0, id = HERO_LID_ID, sizes = "(min-width: 1024px) 34vw, 72vw", className }: HeroLidSlotProps) {
  const apart = accordion !== undefined && step === 0 ? open : 0;

  return (
    <div
      id={id}
      data-hero-lid=""
      data-step={step}
      className={[styles.slot, className].filter(Boolean).join(" ")}
      style={{ "--open": apart.toFixed(3) } as CSSProperties}
    >
      {PHOTOS.map((img, s) => (
        <Image
          key={img.src}
          src={img.src}
          width={img.width}
          height={img.height}
          alt={s === step ? alts[s]! : ""}
          aria-hidden={s === step ? undefined : true}
          priority={s === 0}
          sizes={sizes}
          className={styles.photo}
          data-on={s === step || undefined}
          data-sko={s === 0 || undefined}
          draggable={false}
        />
      ))}

      {accordion && (
        <ul className={styles.stack} aria-hidden="true" data-on={step === 0 || undefined}>
          {ACCORDION_LAYERS.map((l, i) => (
            <li key={l.key} className={styles.layer} style={{ "--i": i, "--n": ACCORDION_LAYERS.length } as CSSProperties}>
              <Image src={l.src} width={ACCORDION_LAYER_WIDTH} height={l.height} alt="" priority sizes="(min-width: 1024px) 14vw, 30vw" className={styles.layerImg} draggable={false} />
              <span className={styles.caption}>
                <b>{accordion.layers[l.key].name}</b>
                {accordion.layers[l.key].value}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
