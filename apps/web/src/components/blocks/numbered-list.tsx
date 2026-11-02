import { cx } from "@/lib/cx";

type Item = { key: string; title: string; text: string };

/** Editorial list with numerals and hairlines. `dense` stacks title and text for a half-width column. */
export function NumberedList({ items, dense = false }: { items: Item[]; dense?: boolean }) {
  return (
    <ol className="border-t border-line">
      {items.map((it, i) => (
        <li
          key={it.key}
          className={cx(
            "grid max-w-none gap-x-5 border-b border-line py-3 md:py-4",
            dense ? "grid-cols-[2.75rem_1fr]" : "grid-cols-[2.75rem_1fr] md:grid-cols-[3.5rem_1fr_1.2fr] md:items-baseline",
          )}
          data-reveal
        >
          <span className="tnum row-span-2 font-display text-28 font-semibold leading-none text-azure-500 md:row-span-1">
            {String(i + 1).padStart(2, "0")}
          </span>
          <h3 className="text-18">{it.title}</h3>
          <p className={cx("col-start-2 mt-1 text-14 text-ink-700", !dense && "md:col-start-3 md:mt-0")}>{it.text}</p>
        </li>
      ))}
    </ol>
  );
}
