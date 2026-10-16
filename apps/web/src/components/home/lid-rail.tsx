import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

const ITEMS = [
  { key: "gold", href: "/products/sko-i82" },
  { key: "mechta", href: "/brands" },
  { key: "elisey", href: "/brands" },
  { key: "litho", href: "/products" },
  { key: "private", href: "/private-label" },
  { key: "twist", href: "/products/twist-off" },
  { key: "twistColor", href: "/products/twist-off" },
  { key: "ring", href: "/products/wikel-ring" },
] as const;

/**
 * Number rail 01–08 under the hero. Static for now: 01 is marked current.
 * TODO(task 5): the 3D parade drives aria-current and the progress line while lids pass through the centre.
 */
export async function LidRail() {
  const t = await getTranslations("home.hero");
  return (
    <nav aria-label={t("railLabel")} className="mt-10 md:mt-14">
      <ol className="lidrail">
        {ITEMS.map((it, i) => (
          <li key={it.key} className="max-w-none">
            <Link href={it.href} className="lidrail__item" aria-current={i === 0 ? "true" : undefined}>
              <span className="caption tnum" style={{ color: "inherit" }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>{t(`rail.${it.key}`)}</span>
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}
