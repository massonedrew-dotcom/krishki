import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/blocks/page-hero";
import { Section } from "@/components/ui";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const meta = await pageMetadata(locale, "/privacy", "privacy");
  return { ...meta, robots: { index: false, follow: true } };
}

const SECTIONS = ["who", "data", "why", "store", "cookies"] as const;

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("privacy");

  return (
    <>
      <PageHero eyebrow={t("hero.eyebrow")} title={t("hero.title")} lead={t("hero.lead")} />
      <Section tone="white">
        <div className="mx-auto grid max-w-3xl gap-10">
          {SECTIONS.map((k, i) => (
            <section key={k} className="border-t border-line pt-6">
              <h2 className="text-28">
                <span className="caption tnum mr-3">{String(i + 1).padStart(2, "0")}</span>
                {t(`sections.${k}.t`)}
              </h2>
              <p className="mt-3 text-18 text-ink-700">{t(`sections.${k}.d`)}</p>
            </section>
          ))}
        </div>
      </Section>
    </>
  );
}
