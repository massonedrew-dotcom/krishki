import { cx } from "@/lib/cx";

type Step = { key: string; title: string; text: string; label?: string };

/**
 * Vertical rail with a scroll-scrubbed fill. Used for the timeline, the process and the how-it-works lists.
 * `label` replaces the running number (e.g. a year).
 */
export function Steps({ items, className }: { items: Step[]; className?: string }) {
  return (
    <div className={cx("vrail", className)}>
      <div aria-hidden="true" className="vrail__line">
        <span className="vrail__fill" />
      </div>
      <ol className="grid gap-12 md:gap-16">
        {items.map((s, i) => (
          <li key={s.key} className="vrail__item max-w-none">
            <span className="vrail__dot" aria-hidden="true" />
            <p className="caption tnum">{s.label ?? String(i + 1).padStart(2, "0")}</p>
            <h3 className="mt-2 text-36">{s.title}</h3>
            <p className="mt-3 max-w-[36rem] text-18 text-fg-muted">{s.text}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
