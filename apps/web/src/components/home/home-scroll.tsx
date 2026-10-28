"use client";

import { useEffect } from "react";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/**
 * Scroll effects of the home page below the hero (client, 27 Oct: "as in the old version").
 * 1. Sheet stack: every section in `.h-stack` is sticky; a tall one sticks at its bottom edge (top = vh - h),
 *    and while the next one slides up over it, it recedes (`--recede` 0..1 drives scale and an ink shade).
 * 2. Factory line: across `.h-line-track` the rail fills (`--line-p` 0..1) and the stations light up one by one.
 * Pure DOM, one passive scroll listener; nothing runs with reduced motion (the CSS keeps a plain page then).
 */
export function HomeScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const stack = document.querySelector<HTMLElement>(".h-stack");
    const sheets = stack ? [...stack.children].filter((el): el is HTMLElement => el instanceof HTMLElement) : [];
    const track = document.querySelector<HTMLElement>(".h-line-track");
    const stations = track ? [...track.querySelectorAll<HTMLElement>(".h-st")] : [];
    const pinned = window.matchMedia("(min-width: 70rem)"); // same breakpoint as the sticky pin in home.css

    // natural document tops, measured with the sticky offsets reset (a stuck element reports its stuck rect)
    let tops: number[] = [];
    const measure = () => {
      const vh = window.innerHeight;
      sheets.forEach((s) => (s.style.top = ""));
      tops = sheets.map((s) => s.getBoundingClientRect().top + window.scrollY);
      sheets.forEach((s, i) => {
        if (i < sheets.length - 1) s.style.top = `${Math.min(0, vh - s.offsetHeight)}px`;
      });
      update();
    };

    let frame = 0;
    const update = () => {
      frame = 0;
      // reads first, writes after: no forced layout between them
      const y = window.scrollY;
      const vh = window.innerHeight;
      const r = track?.getBoundingClientRect();
      for (let i = 0; i < sheets.length - 1; i++) {
        const next = tops[i + 1] ?? Infinity;
        sheets[i]!.style.setProperty("--recede", clamp01(1 - (next - y) / vh).toFixed(3));
      }
      if (track && r) {
        // desktop: the pin holds while the track scrolls by; below 70rem the list itself passes 60 % of the screen
        const p = pinned.matches
          ? clamp01(-r.top / Math.max(1, r.height - vh))
          : clamp01((vh * 0.6 - r.top) / Math.max(1, r.height));
        track.style.setProperty("--line-p", p.toFixed(4));
        const lit = Math.min(stations.length, Math.floor(p * stations.length + 0.35));
        stations.forEach((st, i) => st.toggleAttribute("data-lit", i < lit));
      }
    };
    const queue = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    measure();
    // phones fire resize whenever the address bar shows or hides; only a real size change re-measures
    let lastW = window.innerWidth;
    let lastH = window.innerHeight;
    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (w === lastW && Math.abs(h - lastH) < 120) return;
      lastW = w;
      lastH = h;
      measure();
    };
    const ro = new ResizeObserver(() => measure());
    sheets.forEach((s) => ro.observe(s));
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", onResize);
    document.documentElement.dataset.homeScroll = "on";
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", onResize);
      delete document.documentElement.dataset.homeScroll;
      sheets.forEach((s) => {
        s.style.top = "";
        s.style.removeProperty("--recede");
      });
    };
  }, []);

  return null;
}
