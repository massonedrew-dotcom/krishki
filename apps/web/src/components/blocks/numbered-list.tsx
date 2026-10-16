type Item = { key: string; title: string; text: string };

/** Editorial list with big numerals and hairlines. The opposite of three identical icon cards. */
export function NumberedList({ items }: { items: Item[] }) {
  return (
    <ol className="border-t border-line">
      {items.map((it, i) => (
        <li
          key={it.key}
          className="grid max-w-none gap-x-8 gap-y-2 border-b border-line py-7 md:grid-cols-[6rem_1fr_1.2fr] md:items-baseline md:py-9"
          data-reveal
        >
          <span className="tnum font-display text-48 font-semibold leading-none text-azure-500">
            {String(i + 1).padStart(2, "0")}
          </span>
          <h3 className="text-28">{it.title}</h3>
          <p className="text-18 text-ink-700">{it.text}</p>
        </li>
      ))}
    </ol>
  );
}
