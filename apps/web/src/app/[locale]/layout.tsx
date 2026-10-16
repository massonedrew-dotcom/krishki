import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { Footer, Header } from "@/components/ui";
import { MotionRoot } from "@/components/motion/motion-root";
import { routing } from "@/i18n/routing";
import { fontVariables } from "@/lib/fonts";
import { SITE_URL } from "@/lib/seo";
import "../globals.css";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return { metadataBase: new URL(SITE_URL), title: t("title"), description: t("description") };
}

/** Sets html.m (motion on) before first paint unless the user asked for reduced motion. */
const MOTION_FLAG = `if(!matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.classList.add("m")`;

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();
  const t = await getTranslations("common");

  return (
    <html lang={locale} className={fontVariables} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: MOTION_FLAG }} />
      </head>
      <body>
        <a href="#main" className="skip-link">
          {t("skip")}
        </a>
        <div className="page-progress" aria-hidden="true">
          <span />
        </div>
        {/* Client components get only the namespaces they use, not the whole catalogue. */}
        <NextIntlClientProvider messages={{ form: messages.form }}>
          <Header />
          <main id="main">{children}</main>
          <Footer />
          <MotionRoot />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
