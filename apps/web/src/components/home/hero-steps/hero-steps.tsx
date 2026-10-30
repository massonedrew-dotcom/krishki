"use client";

import { useEffect, useRef, useState } from "react";
import { type AccordionCopy, HeroLidSlot } from "../hero-lid/hero-lid-slot";
import { heroAnchor, heroOpen, heroStep, type HeroStepKey, STEP_COUNT } from "../hero-lid/steps";

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
  accordion: AccordionCopy;
  sizes?: string;
};

/** Desktop: the whole hero grid is sticky (home.css); below it only the step block is. */
const DESKTOP = "(min-width: 64rem)";
const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Hero product steps «01 / 03» (client, 30 Oct). The page opens with the SKO taken apart and its specs; the
 * scroll folds it into the lid, then turns to Twist-Off and the rings while the datasheet card follows, then the
 * page scrolls on. The hero gets its scroll room in home.css via html[data-hero-scroll]; the step buttons
 * scroll to a product. Reduced motion: one screen, the SKO shown apart, the buttons switch the product.
 */
export function HeroSteps({ items, alts, accordion, sizes }: HeroStepsProps) {
  const [live, setLive] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const [picked, setPicked] = useState(0);
  const [scrolled, setScrolled] = useState({ step: 0, open: 1 });
  const active = live ? scrolled.step : picked;
  const open = live ? scrolled.open : picked === 0 ? 1 : 0;

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    document.documentElement.dataset.heroScroll = "on";
    setLive(true);
    return () => {
      delete document.documentElement.dataset.heroScroll;
    };
  }, []);

  // the sticky offset follows the real header height (it has a second row below 80rem)
  useEffect(() => {
    const el = root.current;
    const hero = el?.closest<HTMLElement>("[data-hero-track]");
    const header = document.querySelector<HTMLElement>(".site-header");
    if (!hero || !header) return;
    const sync = () => hero.style.setProperty("--hero-pin-top", `${Math.round(header.getBoundingClientRect().height)}px`);
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(header);
    return () => ro.disconnect();
  }, []);

  // live: scroll progress over the sticky range → how far apart the SKO is, and which product is shown
  useEffect(() => {
    const el = root.current;
    if (!live || !el) return;
    const mq = window.matchMedia(DESKTOP);
    let raf = 0;
    const measure = () => {
      raf = 0;
      const p = progress(el, mq.matches);
      if (p === null) return;
      const next = { step: heroStep(p), open: Math.round(heroOpen(p) * 200) / 200 };
      setScrolled((prev) => (prev.step === next.step && prev.open === next.open ? prev : next));
    };
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    mq.addEventListener("change", queue);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
      mq.removeEventListener("change", queue);
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
    const y = track.getBoundingClientRect().top + window.scrollY - top + heroAnchor(i) * range;
    // through Lenis when it runs (so the two never fight), else the native smooth scroll
    if (window.__lenis) window.__lenis.scrollTo(Math.max(0, y));
    else window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
  };

  return (
    <div ref={root} className="h-steps" data-live={live || undefined}>
      <div className="h-steps__pin">
        <HeroLidSlot alts={alts} accordion={accordion} step={active} open={open} className="stage-lid" sizes={sizes} />
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

/** Scroll progress 0 … 1 over the sticky range, or null when the parts are missing. */
function progress(el: HTMLElement, desktop: boolean): number | null {
  const { track, pin } = parts(el, desktop);
  if (!track || !pin) return null;
  const top = parseFloat(getComputedStyle(pin).top) || 0;
  const range = track.getBoundingClientRect().height - pin.getBoundingClientRect().height;
  return range > 1 ? Math.min(1, Math.max(0, (top - track.getBoundingClientRect().top) / range)) : 0;
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
