"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Photo } from "@/components/ui/photo";
import type { Img } from "@/lib/site";

type Item = {
  key: string;
  type: "sko" | "twist" | "ring";
  href: string;
  img: Img;
  alt: string;
  tag: string;
  name: string;
  desc: string;
  pack: string;
};

type Props = {
  items: Item[];
  filters: { value: "all" | "sko" | "twist" | "ring"; label: string }[];
  filterLabel: string;
  countLabel: string; // contains {count}
  packLabel: string;
  moreLabel: string;
};

/** Catalogue grid with type filter. All cards are rendered on the server; filtering only toggles `hidden`. */
export function ProductGrid({ items, filters, filterLabel, countLabel, packLabel, moreLabel }: Props) {
  const [active, setActive] = useState<"all" | "sko" | "twist" | "ring">("all");
  const visible = items.filter((i) => active === "all" || i.type === active).length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div role="group" aria-label={filterLabel} className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.value}
              type="button"
              className="chip"
              aria-pressed={active === f.value}
              onClick={() => setActive(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <p className="caption tnum max-w-none" role="status">
          {countLabel.replace("{count}", String(visible))}
        </p>
      </div>
      <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => (
          <li
            key={it.key}
            hidden={active !== "all" && it.type !== active}
            className="lift relative flex max-w-none flex-col overflow-hidden rounded-card border border-sky-line bg-paper"
          >
            <Photo img={it.img} alt={it.alt} sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw" ratio="4 / 3" className="rounded-none" />
            <div className="flex flex-1 flex-col items-start gap-3 p-6">
              <Badge>{it.tag}</Badge>
              <h3 className="text-28">
                <Link href={it.href} className="no-underline after:absolute after:inset-0 after:content-['']">
                  {it.name}
                </Link>
              </h3>
              <p className="text-16 text-ink-700">{it.desc}</p>
              <p className="caption mt-auto pt-2">
                {packLabel}: <span className="tnum text-ink-950">{it.pack}</span>
              </p>
              <span className="arrow-link">{moreLabel}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
