import { type NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { OLD_URLS } from "./lib/old-urls";

const intl = createMiddleware(routing);

/**
 * Next's own trailing-slash redirect is off (next.config skipTrailingSlashRedirect), because it ran before the
 * old-URL redirects and turned «/produkciya/» into two hops (308, then 301). Here the old krishki.uz URLs get
 * one 301 straight to the new page, and any other path with a trailing slash gets the usual 308 without it.
 */
export default function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const bare = path.length > 1 && path.endsWith("/") ? path.replace(/\/+$/, "") : path;
  const target = OLD_URLS[bare];
  if (target) return NextResponse.redirect(new URL(target, req.url), 301);
  if (bare !== path) {
    const url = req.nextUrl.clone();
    url.pathname = bare || "/";
    return NextResponse.redirect(url, 308);
  }
  return intl(req);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
