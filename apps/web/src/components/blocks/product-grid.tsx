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
      <ul className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {items.map((it) => (
          <li
            key={it.key}
            hidden={active !== "all" && it.type !== active}
            className={`lift relative flex max-w-none flex-col overflow-hidden rounded-card border border-sky-line bg-paper ${it.type === "ring" ? "col-span-2 lg:flex-row" : ""}`}
          >
            <div className={it.type === "ring" ? "lg:w-3/5 lg:shrink-0" : undefined}>
              <Photo img={it.img} alt={it.alt} sizes="(min-width: 1024px) 24vw, 50vw" ratio={it.type === "ring" ? "9 / 10" : "3 / 2"} className="rounded-none" />
            </div>
            <div className="flex flex-1 flex-col items-start gap-2 p-3 md:p-4">
              <Badge>{it.tag}</Badge>
              <h3 className="text-16 md:text-18">
                <Link href={it.href} className="no-underline after:absolute after:inset-0 after:content-['']">
                  {it.name}
                </Link>
              </h3>
              <p className="hidden text-14 text-ink-700 md:block">{it.desc}</p>
              <p className="caption mt-auto hidden md:block">
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
