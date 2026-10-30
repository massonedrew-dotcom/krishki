"use client";

import { useState } from "react";
import { HeroLidSlot, type HeroLidSlotProps } from "../hero-lid/hero-lid-slot";
import { type HeroStepKey, STEP_COUNT } from "../hero-lid/steps";

export type HeroStepItem = {
  key: HeroStepKey;
  name: string;
  sub: string;
  /** Spec rows (label from home.products.labels, value from home.products.items.<key>); "—" rows are skipped. */
  rows: { label: string; value: string }[];
};

export type HeroStepsProps = {
  items: HeroStepItem[];
  /** Alt texts of the photos per step: SKO (the LCP image), Twist-Off, ring. */
  alts: [string, string, string];
  accordion: HeroLidSlotProps["accordion"];
  sizes?: string;
};

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Hero product steps «01 / 03»: the real photo of the product and a datasheet card with its name and spec
 * rows. The step buttons switch the product. No scroll hijack (client, 29 Oct: the lid turning with the
 * scroll read as «constructed wrong»); the SKO step has the accordion instead (hero-lid-slot.tsx).
 */
export function HeroSteps({ items, alts, accordion, sizes }: HeroStepsProps) {
  const [active, setActive] = useState(0);

  return (
    <div className="h-steps">
      <div className="h-steps__pin">
        <HeroLidSlot alts={alts} accordion={accordion} step={active} className="stage-lid" sizes={sizes} />
        <div className="h-step">
          <div className="h-step__bar">
            <p className="h-step__idx tnum" aria-hidden="true">
              {pad(active + 1)} <span>/ {pad(STEP_COUNT)}</span>
            </p>
            <div className="h-step__pips">
              {items.map((it, i) => (
                <button
                  key={it.key}
                  type="button"
                  className="h-step__pip"
                  aria-label={it.name}
                  aria-pressed={i === active}
                  data-hero-step-btn={i}
                  onClick={() => setActive(i)}
                >
                  <i />
                </button>
              ))}
            </div>
          </div>
          <div className="h-step__cards">
            {items.map((it, i) => (
              <article
                key={it.key}
                className="h-step__card"
                data-on={i === active || undefined}
                aria-hidden={i === active ? undefined : true}
                inert={i !== active}
              >
                <p className="h-step__name">{it.name}</p>
                <p className="h-step__sub">{it.sub}</p>
                <dl className="h-step__rows">
                  {it.rows
                    .filter((r) => r.value.trim() !== "—")
                    .map((r) => (
                      <div key={r.label}>
                        <dt>{r.label}</dt>
                        <dd>{r.value}</dd>
                      </div>
                    ))}
                </dl>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
