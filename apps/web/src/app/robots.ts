import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

// static: the preview is a static export (GitHub Pages)
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/bg-demo"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
