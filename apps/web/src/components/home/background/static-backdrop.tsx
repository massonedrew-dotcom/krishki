"use client";

import { useEffect, useRef, useState } from "react";
import { BG_ASSETS } from "./assets";

/**
 * Reduced motion / no WebGL: one pre-rendered frame of the scene, drawn "cover" into a 2D canvas.
 * A canvas (not an <img>) on purpose: a full-screen image painted after load would become the page's
 * LCP element; canvases are not LCP candidates.
 */
export function StaticBackdrop({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    let img: HTMLImageElement | null = null;
    let src = "";
    let frame = 0;
    let alive = true;

    const pick = () => (window.innerWidth / Math.max(1, window.innerHeight) < 0.9 ? BG_ASSETS.staticTall : BG_ASSETS.staticWide);
    const draw = () => {
      if (!img) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.round(canvas.clientWidth * dpr);
      const h = Math.round(canvas.clientHeight * dpr);
      if (!w || !h) return;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      const k = Math.max(w / img.naturalWidth, h / img.naturalHeight);
      const dw = img.naturalWidth * k;
      const dh = img.naturalHeight * k;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
    };
    const load = () => {
      src = pick();
      const next = new Image();
      next.decoding = "async";
      next.src = src;
      next
        .decode()
        .then(() => {
          if (!alive || next.src.indexOf(src) < 0) return;
          img = next;
          draw();
          setShown(true);
        })
        .catch(() => {
          /* the CSS base gradient stays: nothing to report to the user */
        });
    };
    const onResize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => (pick() !== src ? load() : draw()));
    };

    load();
    window.addEventListener("resize", onResize);
    return () => {
      alive = false;
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      img = null;
    };
  }, []);

  return <canvas ref={ref} className={className} data-shown={shown || undefined} />;
}
