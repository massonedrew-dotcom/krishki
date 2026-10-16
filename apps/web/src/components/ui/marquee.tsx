import Image from "next/image";
import type { Img } from "@/lib/site";

type Item = { key: string; name: string; img: Img };

/** Endless logo strip. The second group is a visual duplicate, hidden from assistive tech and the tab order. */
export function Marquee({ items, label }: { items: Item[]; label: string }) {
  const group = (hidden: boolean) => (
    <ul className="marquee__group" aria-hidden={hidden || undefined} role={hidden ? "presentation" : undefined}>
      {items.map((p) => (
        <li
          key={p.key}
          className="flex h-24 w-44 shrink-0 items-center justify-center overflow-hidden rounded-media border border-sky-line bg-paper md:h-28 md:w-52"
        >
          <Image
            src={p.img.src}
            width={p.img.width}
            height={p.img.height}
            alt={hidden ? "" : p.name}
            sizes="208px"
            className="h-full w-full object-contain p-2"
          />
        </li>
      ))}
    </ul>
  );
  return (
    <div className="marquee" role="group" aria-label={label}>
      <div className="marquee__track">
        {group(false)}
        {group(true)}
      </div>
    </div>
  );
}
