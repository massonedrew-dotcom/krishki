"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { usePathname } from "@/i18n/navigation";

type Props = {
  openLabel: string;
  closeLabel: string;
  children: ReactNode;
};

const FOCUSABLE = "a[href], button:not([disabled])";

/**
 * Burger + full-screen sheet. The sheet content is rendered on the server and passed in as children.
 * The sheet is `position: fixed` and its ancestors must never get a transform or backdrop-filter
 * (ticket 17): the header keeps its blur on a pseudo-element for that reason.
 */
export function MobileMenu({ openLabel, closeLabel, children }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const panelId = useId();
  const burgerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // A route change closes the panel.
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        burgerRef.current?.focus();
        return;
      }
      if (e.key !== "Tab") return;
      // Keep Tab inside the burger + sheet pair while the sheet covers the page.
      const items = panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
      const last = items?.[items.length - 1];
      if (!last) return;
      if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        burgerRef.current?.focus();
      } else if (e.shiftKey && document.activeElement === burgerRef.current) {
        e.preventDefault();
        last.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        ref={burgerRef}
        type="button"
        className="burger xl:hidden"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? closeLabel : openLabel}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="burger__bars" aria-hidden="true" />
      </button>
      <div
        ref={panelRef}
        id={panelId}
        className="menu-panel xl:hidden"
        data-open={open}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("a")) setOpen(false);
        }}
      >
        {children}
      </div>
    </>
  );
}
