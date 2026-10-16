import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/blocks/page-hero";
import { LeadCta } from "@/components/forms/lead-cta";
import { Photo, Section, SplitText } from "@/components/ui";
import { pageMetadata } from "@/lib/seo";
import { PHOTO } from "@/lib/site";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(locale, "/useful", "useful");
}

const ITEMS = ["ribs", "ring", "weight", "lacquer", "colour"] as const;

export default async function UsefulPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("useful");

  return (
    <>
      <PageHero
        eyebrow={t("hero.eyebrow")}
        title={t("hero.title")}
        lead={t("hero.lead")}
        media={<Photo img={PHOTO.skoGold} alt={t("hero.alt")} sizes="(min-width: 1024px) 40vw, 100vw" card ratio="4 / 3" priority />}
      />

      <Section tone="white">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-x-10">
          <nav aria-label={t("tocLabel")} className="lg:col-span-4">
            <div className="lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
              <p className="caption">{t("tocLabel")}</p>
              <ol className="mt-4 border-t border-line">
                {ITEMS.map((k, i) => (
                  <li key={k} className="max-w-none border-b border-line">
                    <a href={`#${k}`} className="flex min-h-12 items-center gap-4 py-2 text-ink-950 no-underline hover:text-azure-700">
                      <span className="caption tnum">{String(i + 1).padStart(2, "0")}</span>
                      <span className="font-medium">{t(`items.${k}.t`)}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </nav>
          <div className="grid gap-16 lg:col-span-8">
            {ITEMS.map((k, i) => (
              <article key={k} id={k} className="grid gap-4 md:grid-cols-[5rem_1fr]">
                <span className="tnum font-display text-64 font-semibold leading-none text-azure-500" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <SplitText as="h2" className="text-36" text={t(`items.${k}.t`)} />
                  <p className="mt-4 text-18 text-ink-700" data-reveal>
                    {t(`items.${k}.d`)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </Section>

      <Section tone="sky" labelledBy="rule-title">
        <div className="mx-auto max-w-3xl text-center">
          <SplitText as="h2" id="rule-title" className="text-64" text={t("rule.title")} />
          <p className="mx-auto mt-6 text-22 text-ink-700" data-reveal>
            {t("rule.text")}
          </p>
        </div>
      </Section>

      <LeadCta defaultProduct="sko" />
    </>
  );
}
