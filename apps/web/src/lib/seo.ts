import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LOCALES } from "@krishki/shared";
import { EMAIL, FACEBOOK, INSTAGRAM, PHONES, TELEGRAM } from "./contacts";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elit-konserva.com";

const HREFLANG: Record<string, string> = { ru: "ru-UZ", uz: "uz-UZ", en: "en" };
const OG_LOCALE: Record<string, string> = { ru: "ru_RU", uz: "uz_UZ", en: "en_US" };
const OG_IMAGE = "/og/og-default.jpg";

/**
 * schema.org Organization for the home page. Facts only from docs/content-inventory.md and lib/contacts.ts.
 * TODO(client): legal/production address confirmed in writing (brief #15, #17), INN.
 */
export function organizationJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "ELIT KONSERVA",
    legalName: "ООО «Elit Konserva»",
    url: SITE_URL,
    logo: `${SITE_URL}/images/brand/mechta-khozyayki-v2-600.webp`,
    foundingDate: "1996",
    email: EMAIL,
    telephone: PHONES.map((p) => p.href.replace("tel:", "")),
    address: {
      "@type": "PostalAddress",
      streetAddress: "ул. Кипчок Арик, 98 А",
      addressLocality: "Коканд",
      addressRegion: "Ферганская область",
      addressCountry: "UZ",
    },
    sameAs: [INSTAGRAM.href, TELEGRAM.href, FACEBOOK.href],
  };
}

/**
 * Per-page metadata: unique title/description from `<namespace>.meta`, canonical and hreflang alternates.
 * One shared share image (public/og/og-default.jpg, 1200×630, no text in it). JSON-LD: organizationJsonLd();
 * robots and sitemap: app/robots.ts, app/sitemap.ts.
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
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "ELIT KONSERVA" }],
    },
    twitter: { card: "summary_large_image", images: [OG_IMAGE] },
  };
}
