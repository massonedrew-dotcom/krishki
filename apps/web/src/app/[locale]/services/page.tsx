import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { NumberedList } from "@/components/blocks/numbered-list";
import { PageHero } from "@/components/blocks/page-hero";
import { SectionHead } from "@/components/blocks/section-head";
import { Steps } from "@/components/blocks/steps";
import { LeadCta } from "@/components/forms/lead-cta";
import { Container, Photo, Section, SpecTable, SplitText } from "@/components/ui";
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
        media={<Photo img={PHOTO.lithoMix} alt={t("hero.alt")} sizes="(min-width: 1024px) 40vw, 100vw" card ratio="4 / 3" priority />}
      />

      <Section tone="white" labelledBy="lines-title">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-x-10">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
              <SectionHead eyebrow={t("lines.eyebrow")} title={t("lines.title")} id="lines-title" size="md" />
            </div>
          </div>
          <div className="lg:col-span-8">
            <NumberedList items={LINES.map((k) => ({ key: k, title: t(`lines.items.${k}.t`), text: t(`lines.items.${k}.d`) }))} />
          </div>
        </div>
      </Section>

      <Section tone="sky" labelledBy="process-title">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-x-10">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
              <SectionHead eyebrow={t("process.eyebrow")} title={t("process.title")} id="process-title" size="md" />
            </div>
          </div>
          <div className="lg:col-span-7">
            <Steps items={PROCESS.map((k) => ({ key: k, title: t(`process.items.${k}.t`), text: t(`process.items.${k}.d`) }))} />
          </div>
        </div>
      </Section>

      <Section tone="white" labelledBy="specs-title">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-x-10">
          <div className="lg:col-span-4">
            <SectionHead eyebrow={t("specs.eyebrow")} title={t("specs.title")} id="specs-title" size="md" />
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

      <section className="surface-mist py-16 md:py-24" aria-label={t("hero.eyebrow")}>
        <Container>
          <ul className="grid gap-6 md:grid-cols-3">
            {(["t1", "t2", "t3"] as const).map((k) => (
              <li key={k} className="max-w-none border-t-2 border-azure-500 pt-5" data-reveal>
                <SplitText as="p" className="font-display text-28 font-semibold" text={t(`benefits.${k}`)} />
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <LeadCta defaultDirection="lithography" defaultProduct="services" />
    </>
  );
}
