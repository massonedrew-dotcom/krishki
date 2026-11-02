import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { NumberedList } from "@/components/blocks/numbered-list";
import { PageHero } from "@/components/blocks/page-hero";
import { SectionHead } from "@/components/blocks/section-head";
import { LeadCta } from "@/components/forms/lead-cta";
import { Photo, Section, SpecTable } from "@/components/ui";
import { pageMetadata } from "@/lib/seo";
import { PHOTO } from "@/lib/site";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(locale, "/services", "services");
}

const LINES = ["lids", "combo", "cans", "chem"] as const;
const PROCESS = ["prepress", "print", "lacquer", "qc"] as const;
const SPECS = ["material", "sheet", "thickness", "lacquer", "inks", "qc", "lead", "price"] as const;

export default async function ServicesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("services");

  return (
    <>
      <PageHero
        eyebrow={t("hero.eyebrow")}
        title={t("hero.title")}
        lead={t("hero.lead")}
        media={<Photo img={PHOTO.lithoMix} alt={t("hero.alt")} sizes="(min-width: 1024px) 40vw, 100vw" card ratio="16 / 9" priority />}
      />

      <Section tone="white">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-x-12">
          <div>
            <SectionHead eyebrow={t("lines.eyebrow")} title={t("lines.title")} id="lines-title" size="md" />
            <div className="mt-6">
              <NumberedList dense items={LINES.map((k) => ({ key: k, title: t(`lines.items.${k}.t`), text: t(`lines.items.${k}.d`) }))} />
            </div>
          </div>
          <div>
            <SectionHead eyebrow={t("process.eyebrow")} title={t("process.title")} id="process-title" size="md" />
            <div className="mt-6">
              <NumberedList dense items={PROCESS.map((k) => ({ key: k, title: t(`process.items.${k}.t`), text: t(`process.items.${k}.d`) }))} />
            </div>
          </div>
        </div>
      </Section>

      <Section tone="sky" labelledBy="specs-title">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-x-10">
          <div className="lg:col-span-4">
            <SectionHead eyebrow={t("specs.eyebrow")} title={t("specs.title")} id="specs-title" size="md" />
            <ul className="mt-6 grid gap-3">
              {(["t1", "t2", "t3"] as const).map((k) => (
                <li key={k} className="max-w-none border-t-2 border-azure-500 pt-2 font-display text-16 font-semibold" data-reveal>
                  {t(`benefits.${k}`)}
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-8" data-reveal>
            <SpecTable
              caption={t("specs.eyebrow")}
              columns={{ parameter: t("specs.columns.param"), values: [t("specs.columns.value")] }}
              rows={SPECS.map((k) => ({ label: t(`specs.rows.${k}.l`), values: [t(`specs.rows.${k}.v`)] }))}
            />
          </div>
        </div>
      </Section>

      <LeadCta defaultDirection="lithography" defaultProduct="services" />
    </>
  );
}
