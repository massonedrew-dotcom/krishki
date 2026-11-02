import { DOTS, MAP_H, MAP_W, POINTS } from "./export-map-data";

export const EXPORT_COUNTRIES = ["kz", "kg", "tj", "tm", "ru", "by", "az"] as const;
type Country = (typeof EXPORT_COUNTRIES)[number];

type Props = {
  title: string;
  origin: string;
  countries: Record<Country, string>;
};

/** Label placement around each point: x offset and text anchor, chosen so close neighbours do not collide. */
const LABEL: Record<Country, { dx: number; dy: number; anchor: "start" | "end" | "middle" }> = {
  kz: { dx: 0, dy: -24, anchor: "middle" },
  kg: { dx: 22, dy: -6, anchor: "start" },
  tj: { dx: 22, dy: 24, anchor: "start" },
  tm: { dx: -22, dy: 10, anchor: "end" },
  ru: { dx: 0, dy: -24, anchor: "middle" },
  by: { dx: 0, dy: 44, anchor: "middle" },
  az: { dx: -22, dy: 10, anchor: "end" },
};

/** A bowed line from the factory to a country. */
function arc([x1, y1]: readonly number[], [x2, y2]: readonly number[]): string {
  const [ax = 0, ay = 0, bx = 0, by = 0] = [x1, y1, x2, y2];
  const lift = Math.hypot(bx - ax, by - ay) * 0.18;
  return `M${ax} ${ay}Q${(ax + bx) / 2} ${(ay + by) / 2 - lift} ${bx} ${by}`;
}

/** Light dot-matrix map: lines run from Kokand to the delivery countries. Static SVG, the flow is CSS only. */
export function ExportMap({ title, origin, countries }: Props) {
  const [ox = 0, oy = 0] = POINTS.kokand;
  return (
    <figure className="xmap">
      <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} role="img" aria-label={title}>
        <path className="xmap__dots xmap__dots--other" d={DOTS.other} />
        <path className="xmap__dots xmap__dots--delivery" d={DOTS.delivery} />
        <path className="xmap__dots xmap__dots--home" d={DOTS.home} />
        {EXPORT_COUNTRIES.map((c, i) => (
          <path key={c} className="xmap__arc" style={{ animationDelay: `${i * -0.4}s` }} d={arc(POINTS.kokand, POINTS[c])} />
        ))}
        {EXPORT_COUNTRIES.map((c) => {
          const [x = 0, y = 0] = POINTS[c];
          const l = LABEL[c];
          return (
            <g key={c}>
              <circle className="xmap__point" cx={x} cy={y} r="8" />
              <text className="xmap__label" x={x + l.dx} y={y + l.dy} textAnchor={l.anchor}>
                {countries[c]}
              </text>
            </g>
          );
        })}
        <circle className="xmap__ping" cx={ox} cy={oy} r="16" />
        <circle className="xmap__origin" cx={ox} cy={oy} r="11" />
        <text className="xmap__label xmap__label--origin" x={ox} y={oy + 44} textAnchor="middle">
          {origin}
        </text>
      </svg>
    </figure>
  );
}
