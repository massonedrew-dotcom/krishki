"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { Img } from "@/lib/site";

type Item = { key: string; name: string; img: Img };

/** Idle drift, px per frame at 60 fps; page scroll adds to it (client, 27 Oct: "move with the scroll"). */
const DRIFT = 0.9;
const SCROLL_GAIN = 0.35;
/** Cap of the flick speed after a drag, px per frame. */
const MAX_FLING = 30;

/**
 * Endless logo strip. It drifts on its own, speeds up with the page scroll (always right to left) and
 * can be dragged with the mouse or a finger; a flick keeps some momentum. Logos sit bare on the section
 * ground, no plates (client, 28 Oct). The second group is a visual
 * duplicate, hidden from assistive tech and the tab order. With reduced motion it is a plain sideways
 * scroller.
 */
export function Marquee({ items, label }: { items: Item[]; label: string }) {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    const tr = track.current;
    if (!el || !tr || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let x = 0;
    let vel = 0; // extra speed from scroll and flicks, px per frame, decays
    let half = tr.scrollWidth / 2;
    let lastY = window.scrollY;
    let drag: { id: number; x: number; t: number; v: number } | null = null;
    let hover = false;
    let raf = 0;

    const wrap = () => {
      if (half <= 0) return;
      x = ((x % half) + half) % half; // keep x in [0, half): the second group takes over seamlessly
    };
    const tick = () => {
      const y = window.scrollY;
      // always right to left (client, 28 Oct): either scroll direction only speeds it up
      vel = Math.max(-MAX_FLING, Math.min(MAX_FLING, vel + Math.abs(y - lastY) * SCROLL_GAIN * 0.1));
      lastY = y;
      if (!drag) {
        x += (hover ? 0 : DRIFT) + vel;
        vel *= 0.92;
      }
      wrap();
      tr.style.transform = `translate3d(${-x}px, 0, 0)`;
      raf = requestAnimationFrame(tick);
    };

    const down = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      drag = { id: e.pointerId, x: e.clientX, t: performance.now(), v: 0 };
      el.setPointerCapture(e.pointerId);
      el.dataset.dragging = "";
    };
    const move = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.x;
      const now = performance.now();
      drag.v = (-dx / Math.max(1, now - drag.t)) * 16; // px per frame
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
    el.dataset.live = "";
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
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
    <div ref={root} className="marquee" role="group" aria-label={label}>
      <div ref={track} className="marquee__track">
        {group(false)}
        {group(true)}
      </div>
    </div>
  );
}
