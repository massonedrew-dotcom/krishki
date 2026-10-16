import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** Old krishki.uz URLs -> new routes (301). */
const OLD_URLS: [string, string][] = [
  ["/produkciya", "/ru/products"],
  ["/uslugi", "/ru/services"],
  ["/o-nas", "/ru/about"],
  ["/polezno-znat", "/ru/useful"],
];

// GITHUB_PAGES=1 builds a static preview for GitHub Pages (no server, no redirects, no middleware).
const isPagesPreview = process.env.GITHUB_PAGES === "1";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = isPagesPreview
  ? {
      output: "export",
      basePath,
      trailingSlash: true,
      poweredByHeader: false,
      transpilePackages: ["@krishki/shared"],
      images: { loader: "custom", loaderFile: "./src/lib/pages-image-loader.ts" },
    }
  : {
      output: "standalone",
      poweredByHeader: false,
      transpilePackages: ["@krishki/shared"],
      async redirects() {
        return OLD_URLS.map(([source, destination]) => ({ source, destination, statusCode: 301 }));
      },
    };

export default withNextIntl(nextConfig);
