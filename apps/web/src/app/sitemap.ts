import type { MetadataRoute } from "next";
import { LOCALES } from "@krishki/shared";
import { SITE_URL } from "@/lib/seo";
import { PAGE_PATHS } from "@/lib/site";

// static: the preview is a static export (GitHub Pages)
export const dynamic = "force-static";

/** Every page in every locale, each with its ru/uz/en alternates (hreflang in the sitemap as well). */
export default function sitemap(): MetadataRoute.Sitemap {
  return PAGE_PATHS.flatMap((path) =>
    LOCALES.map((locale) => ({
      url: `${SITE_URL}/${locale}${path}`,
      changeFrequency: path === "" ? ("weekly" as const) : ("monthly" as const),
      priority: path === "" ? 1 : path.startsWith("/products") ? 0.8 : 0.6,
      alternates: { languages: Object.fromEntries(LOCALES.map((l) => [l, `${SITE_URL}/${l}${path}`])) },
    })),
  );
}
