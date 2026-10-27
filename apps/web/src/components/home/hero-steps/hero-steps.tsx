"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { HeroLidSlot } from "../hero-lid/hero-lid-slot";
import { activeStep, type HeroStepKey, STEP_COUNT, stepAnchor } from "../hero-lid/steps";
import { heroLidLive, heroStepsScroll } from "../hero-lid/store";

export type HeroStepItem = {
  key: HeroStepKey;
  name: string;
  sub: string;
  /** Spec rows (label from home.products.labels, value from home.products.items.<key>); "—" rows are skipped. */
  rows: { label: string; value: string }[];
};

export type HeroStepsProps = {
  items: HeroStepItem[];
  /** Alt of the SKO photo (the LCP image). */
  alt: string;
  /** Alt of the Twist-Off photo (fallback picture of step 2). */
  altTwist: string;
  sizes?: string;
};

/** Desktop: the whole hero grid is sticky (home.css); below it only the step block is. */
const DESKTOP = "(min-width: 64rem)";
const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Hero product steps «01 / 03»: the 3D object on the turntable (drawn by the living background into the
 * slot) and a datasheet card with the product's name and spec rows. Scroll drives the step while the 3D
 * lid is live (the hero gets scroll room in home.css); the step buttons scroll to a step. Without the
 * live 3D (first paint, reduced motion, no WebGL, static tier) the hero is one screen, the slot shows the
 * matching photo and the buttons switch the card directly. No GSAP here: a passive scroll listener.
 */
export function HeroSteps({ items, alt, altTwist, sizes }: HeroStepsProps) {
  const live = useSyncExternalStore(heroLidLive.subscribe, heroLidLive.get, () => false);
  const root = useRef<HTMLDivElement>(null);
  const [picked, setPicked] = useState(0);
  const [scrolled, setScrolled] = useState(0);
  const active = live ? scrolled : picked;

  // the sticky offset follows the real header height (it has a second row below 80rem)
  useEffect(() => {
    const el = root.current;
    const hero = el?.closest<HTMLElement>("[data-hero-track]");
    const header = document.querySelector<HTMLElement>(".site-header") ?? document.querySelector<HTMLElement>("header");
    if (!hero || !header) return;
    const sync = () => hero.style.setProperty("--hero-pin-top", `${Math.round(header.getBoundingClientRect().height)}px`);
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(header);
    return () => ro.disconnect();
  }, []);

  // live: scroll progress over the sticky range → shared store (3D pass) and the shown card
  useEffect(() => {
    const el = root.current;
    if (!live || !el) return;
    const mq = window.matchMedia(DESKTOP);
    let frame = 0;
    const measure = () => {
      frame = 0;
      const { track, pin } = parts(el, mq.matches);
      if (!track || !pin) return;
      const top = parseFloat(getComputedStyle(pin).top) || 0;
      const t = track.getBoundingClientRect();
      const range = t.height - pin.getBoundingClientRect().height;
      const p = range > 1 ? Math.min(1, Math.max(0, (top - t.top) / range)) : 0;
      heroStepsScroll.progress = p;
      setScrolled(activeStep(p));
    };
    const queue = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    heroStepsScroll.driven = true;
    measure();
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    mq.addEventListener("change", queue);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
      mq.removeEventListener("change", queue);
      heroStepsScroll.driven = false;
    };
  }, [live]);

  const go = (i: number) => {
    const el = root.current;
    if (!live || !el) {
      setPicked(i);
      return;
    }
    const { track, pin } = parts(el, window.matchMedia(DESKTOP).matches);
    if (!track || !pin) return;
    const top = parseFloat(getComputedStyle(pin).top) || 0;
    const range = track.offsetHeight - pin.offsetHeight;
    const y = track.getBoundingClientRect().top + window.scrollY - top + stepAnchor(i) * range;
    window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
  };

  return (
    <div ref={root} className="h-steps" data-live={live || undefined}>
      <div className="h-steps__pin">
        <HeroLidSlot alt={alt} altTwist={altTwist} step={active} className="stage-lid" sizes={sizes} />
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
                  onClick={() => go(i)}
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

/** The scroll track and its sticky child: the hero section and its grid on desktop, else this block and its pin. */
function parts(el: HTMLElement, desktop: boolean): { track: HTMLElement | null; pin: HTMLElement | null } {
  if (desktop) {
    const track = el.closest<HTMLElement>("[data-hero-track]");
    // the sticky grid: the first child of the hero section (home.css .h-stage__grid)
    return { track, pin: (track?.firstElementChild as HTMLElement | null) ?? null };
  }
  return { track: el, pin: el.querySelector<HTMLElement>(".h-steps__pin") };
}
