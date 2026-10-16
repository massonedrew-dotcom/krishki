import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/blocks/page-hero";
import { SectionHead } from "@/components/blocks/section-head";
import { Steps } from "@/components/blocks/steps";
import { LeadCta } from "@/components/forms/lead-cta";
import { Photo, Section, SpecTable } from "@/components/ui";
import { pageMetadata } from "@/lib/seo";
import { PHOTO } from "@/lib/site";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(locale, "/private-label", "privateLabel");
}

const STEPS = ["brief", "design", "print", "batch"] as const;
const SPECS = ["types", "moq", "max", "coat", "price"] as const;

export default async function PrivateLabelPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("privateLabel");

  return (
    <>
      <PageHero
        eyebrow={t("hero.eyebrow")}
        title={t("hero.title")}
        lead={t("hero.lead")}
        media={<Photo img={PHOTO.privateSko} alt={t("hero.alt")} sizes="(min-width: 1024px) 40vw, 100vw" card ratio="4 / 3" priority />}
      />

      <Section tone="white" labelledBy="steps-title">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-x-10">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
              <SectionHead eyebrow={t("steps.eyebrow")} title={t("steps.title")} id="steps-title" size="md" />
            </div>
          </div>
          <div className="lg:col-span-7">
            <Steps items={STEPS.map((k) => ({ key: k, title: t(`steps.items.${k}.t`), text: t(`steps.items.${k}.d`) }))} />
          </div>
        </div>
      </Section>

      <Section tone="sky" labelledBy="examples-title">
        <SectionHead eyebrow={t("examples.eyebrow")} title={t("examples.title")} lead={t("examples.lead")} id="examples-title" />
        <div className="mt-12 grid gap-6 md:grid-cols-12">
          <div className="md:col-span-7" data-reveal>
            <Photo img={PHOTO.privateSko} alt={t("examples.alt1")} sizes="(min-width: 768px) 55vw, 100vw" card ratio="4 / 3" parallax />
          </div>
          <div className="grid gap-6 md:col-span-5">
            <div data-reveal>
              <Photo img={PHOTO.twistIttifoq} alt={t("examples.alt2")} sizes="(min-width: 768px) 40vw, 100vw" card ratio="16 / 10" />
            </div>
            <div data-reveal>
              <Photo img={PHOTO.lithoMix} alt={t("examples.alt3")} sizes="(min-width: 768px) 40vw, 100vw" card ratio="16 / 10" />
            </div>
          </div>
        </div>
      </Section>

      <Section tone="white" labelledBy="terms-title">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-x-10">
          <div className="lg:col-span-4">
            <SectionHead eyebrow={t("specs.eyebrow")} title={t("specs.title")} id="terms-title" size="md" />
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

      <LeadCta defaultDirection="privateLabel" />
    </>
  );
}
