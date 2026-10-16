"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { cx } from "@/lib/cx";

type Props = {
  items: { href: string; label: string }[];
  label: string;
  className?: string;
  listClassName?: string;
};

/** Primary navigation. Client component only to mark the current section with aria-current. */
export function MainNav({ items, label, className, listClassName }: Props) {
  const pathname = usePathname();
  return (
    <nav aria-label={label} className={className}>
      <ul className={cx("flex", listClassName)}>
        {items.map((item) => {
          const current = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.href} className="max-w-none">
              <Link href={item.href} className="nav__link" aria-current={current ? "page" : undefined}>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
