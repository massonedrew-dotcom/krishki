"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Img } from "@/lib/site";

type Item = { key: string; name: string; img: Img };

/** Speeds are px per 60 fps frame; the loop scales them by real frame time, so 120/144 Hz screens match. */
const DRIFT = 0.9;
const SCROLL_GAIN = 0.35;
/** Cap of the flick speed after a drag, px per frame. */
const MAX_FLING = 30;
const FRAME_MS = 1000 / 60;

type Props = {
  items: Item[];
  label: string;
  /** Accessible names of the pause / play toggle (WCAG 2.2.2), from messages. */
  pauseLabel: string;
  playLabel: string;
};

/**
 * Endless logo strip. It drifts on its own, speeds up with the page scroll (always right to left) and
 * can be dragged with the mouse or a finger; a flick keeps some momentum. Logos sit bare on the section
 * ground, no plates (client, 28 Oct). A pause button stops the drift for keyboard and touch users; hover
 * pauses it for the mouse. The loop only runs while the strip is on screen. The second group is a visual
 * duplicate, hidden from assistive tech and the tab order. With reduced motion it is a plain sideways
 * scroller and the button is not shown.
 */
export function Marquee({ items, label, pauseLabel, playLabel }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false); // read by the rAF loop; kept in sync by the toggle, never during render

  useEffect(() => {
    const el = root.current;
    const tr = track.current;
    if (!el || !tr || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let x = 0;
    let vel = 0; // extra speed from scroll and flicks, px per frame, decays
    let half = tr.scrollWidth / 2;
    let lastY = window.scrollY;
    let lastT = 0;
    let drag: { id: number; x: number; t: number; v: number } | null = null;
    let hover = false;
    let raf = 0;
    let running = false;

    const wrap = () => {
      if (half <= 0) return;
      x = ((x % half) + half) % half; // keep x in [0, half): the second group takes over seamlessly
    };
    const tick = (t: number) => {
      const dt = lastT ? Math.min(4, (t - lastT) / FRAME_MS) : 1; // frames elapsed, capped after a stall
      lastT = t;
      const y = window.scrollY;
      // always right to left (client, 28 Oct): either scroll direction only speeds it up
      vel = Math.max(-MAX_FLING, Math.min(MAX_FLING, vel + Math.abs(y - lastY) * SCROLL_GAIN * 0.1));
      lastY = y;
      if (!drag) {
        const drift = hover || pausedRef.current ? 0 : DRIFT;
        x += (drift + (pausedRef.current ? 0 : vel)) * dt;
        vel *= 0.92 ** dt;
      }
      wrap();
      tr.style.transform = `translate3d(${-x}px, 0, 0)`;
      raf = requestAnimationFrame(tick);
    };
    const start = () => {
      if (running) return;
      running = true;
      lastT = 0;
      lastY = window.scrollY;
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const down = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      if ((e.target as HTMLElement).closest("button")) return;
      drag = { id: e.pointerId, x: e.clientX, t: performance.now(), v: 0 };
      el.setPointerCapture(e.pointerId);
      el.dataset.dragging = "";
    };
    const move = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.x;
      const now = performance.now();
      drag.v = (-dx / Math.max(1, now - drag.t)) * FRAME_MS; // px per frame
      drag.x = e.clientX;
      drag.t = now;
      x -= dx;
    };
    const up = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      vel = Math.max(-MAX_FLING, Math.min(MAX_FLING, drag.v)); // flick momentum, capped
      drag = null;
      delete el.dataset.dragging;
    };
    const enter = () => (hover = true);
    const leave = () => (hover = false);
    const resize = () => (half = tr.scrollWidth / 2);

    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    const ro = new ResizeObserver(resize);
    ro.observe(tr);
    // run the loop only while the strip is near the screen
    const io = new IntersectionObserver(([en]) => (en?.isIntersecting ? start() : stop()), { rootMargin: "200px 0px" });
    io.observe(el);
    el.dataset.live = "";
    setLive(true);
    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
      delete el.dataset.live;
    };
  }, []);

  const group = (hidden: boolean) => (
    <ul className="marquee__group" aria-hidden={hidden || undefined} role={hidden ? "presentation" : undefined}>
      {items.map((p) => (
        <li key={p.key} className="marquee__item">
          <Image
            src={p.img.src}
            width={p.img.width}
            height={p.img.height}
            alt={hidden ? "" : p.name}
            sizes="208px"
            className="marquee__logo"
            draggable={false}
          />
        </li>
      ))}
    </ul>
  );
  return (
    <div className="marquee-wrap" role="group" aria-label={label}>
      <div ref={root} className="marquee">
        <div ref={track} className="marquee__track">
          {group(false)}
          {group(true)}
        </div>
      </div>
      {live ? (
        <button
          type="button"
          className="marquee__toggle"
          aria-pressed={paused}
          aria-label={paused ? playLabel : pauseLabel}
          onClick={() => {
            pausedRef.current = !pausedRef.current;
            setPaused(pausedRef.current);
          }}
        >
          <span aria-hidden="true">{paused ? "▶" : "❚❚"}</span>
        </button>
      ) : null}
    </div>
  );
}
