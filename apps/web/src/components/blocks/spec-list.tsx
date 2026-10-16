import { cx } from "@/lib/cx";

type Row = { label: string; value: string };

/** Hairline list of label / value pairs, like the specs column of the lid prototype. */
export function SpecList({ rows, className, size = "md" }: { rows: Row[]; className?: string; size?: "md" | "lg" }) {
  return (
    <dl className={cx("border-t border-line", className)}>
      {rows.map((r) => (
        <div key={r.label} className="border-b border-line py-4">
          <dt className="caption">{r.label}</dt>
          <dd className={cx("tnum mt-1 font-display font-semibold", size === "lg" ? "text-28" : "text-22")}>{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}
