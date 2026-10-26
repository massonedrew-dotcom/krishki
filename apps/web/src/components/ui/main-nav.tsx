"use client";

import { useEffect, useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { cx } from "@/lib/cx";
import { ButtonLink } from "./button";

type Props = {
  items: { href: string; label: string }[];
  label: string;
  className?: string;
  listClassName?: string;
  /** Class of each link. The main row and the sheet use `nav__link`, the top row uses `topbar__link`. */
  linkClassName?: string;
};

/** Navigation list. Client component only to mark the current section with aria-current. */
export function MainNav({ items, label, className, listClassName, linkClassName = "nav__link" }: Props) {
  const pathname = usePathname();
  return (
    <nav aria-label={label} className={className}>
      <ul className={cx("flex", listClassName)}>
        {items.map((item) => {
          const current = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.href} className="max-w-none">
              <Link href={item.href} className={linkClassName} aria-current={current ? "page" : undefined}>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/**
 * «Заказать» in the main row. Below 1280 px it is always shown next to the burger. From 1280 px the top row
 * carries the button, and this one fades in only after the top row has scrolled out of view.
 */
export function HeaderOrder({ href, label, topbarId }: { href: string; label: string; topbarId: string }) {
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const topbar = document.getElementById(topbarId);
    if (!topbar) return;
    const io = new IntersectionObserver(([entry]) => setStuck(entry ? !entry.isIntersecting : false));
    io.observe(topbar);
    return () => io.disconnect();
  }, [topbarId]);

  return (
    <ButtonLink href={href} size="sm" className="header-order" data-stuck={stuck}>
      {label}
    </ButtonLink>
  );
}
