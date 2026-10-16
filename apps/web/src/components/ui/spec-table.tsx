import { cx } from "@/lib/cx";

export type SpecRow = { label: string; values: string[] };

type Props = {
  /** Technical caption above the table, rendered as a mono uppercase <caption>. */
  caption: string;
  columns: { parameter: string; values: string[] };
  rows: SpecRow[];
  className?: string;
};

/** Datasheet-style table: hairline rows, mono headers, tabular figures. One value column or several (comparison). */
export function SpecTable({ caption, columns, rows, className }: Props) {
  return (
    <table className={cx("spec", className)}>
      <caption className="spec__caption caption">{caption}</caption>
      <thead>
        <tr>
          <th scope="col">{columns.parameter}</th>
          {columns.values.map((v) => (
            <th scope="col" key={v}>
              {v}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.label}>
            <th scope="row">{row.label}</th>
            {row.values.map((v, i) => (
              <td key={`${row.label}-${i}`}>{v}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
