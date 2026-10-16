"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "@/i18n/navigation";

type Engine = typeof import("./motion-engine");

/**
 * Starts smooth scroll and scroll-driven animation after the page has loaded and the browser is idle.
 * Does nothing when the user prefers reduced motion (the layout's inline script never sets html.m then).
 */
export function MotionRoot() {
  const pathname = usePathname();
  const engine = useRef<Engine | null>(null);
  const first = useRef(true);

  useEffect(() => {
    const root = document.documentElement;
    if (!root.classList.contains("m")) return;
    const navigated = !first.current;
    first.current = false;

    if (navigated) {
      // Soft entrance for the new page content; the header and the page chrome stay put.
      const main = document.getElementById("main");
      main?.classList.remove("page-enter");
      void main?.offsetWidth;
      main?.classList.add("page-enter");
    }

    let cancelled = false;
    const run = () => {
      if (cancelled) return;
      if (engine.current) {
        engine.current.build({ navigated });
        return;
      }
      import("./motion-engine")
        .then((m) => {
          if (cancelled) return;
          engine.current = m;
          m.build({ navigated });
        })
        .catch(() => root.classList.remove("m"));
    };

    let timer: number | undefined;
    const schedule = () => {
      timer = window.setTimeout(run, 150);
    };
    if (engine.current || document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });

    return () => {
      cancelled = true;
      window.removeEventListener("load", schedule);
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [pathname]);

  return null;
}
