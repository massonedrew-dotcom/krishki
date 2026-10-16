import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LOCALES } from "@krishki/shared";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://krishki.uz";

const HREFLANG: Record<string, string> = { ru: "ru-UZ", uz: "uz-UZ", en: "en" };
const OG_LOCALE: Record<string, string> = { ru: "ru_RU", uz: "uz_UZ", en: "en_US" };

/**
 * Per-page metadata: unique title/description from `<namespace>.meta`, canonical and hreflang alternates.
 * TODO(task 10): OG image 1200x630 per locale, JSON-LD, sitemap.
 */
export async function pageMetadata(locale: string, path: string, namespace: string): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: `${namespace}.meta` });
  const languages: Record<string, string> = {};
  for (const l of LOCALES) languages[HREFLANG[l] ?? l] = `/${l}${path}`;
  languages["x-default"] = `/ru${path}`;
  return {
    title: t("title"),
    description: t("description"),
    alternates: { canonical: `/${locale}${path}`, languages },
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: `/${locale}${path}`,
      siteName: "ELIT KONSERVA",
      locale: OG_LOCALE[locale] ?? locale,
      type: "website",
    },
  };
}
