import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { NumberedList } from "@/components/blocks/numbered-list";
import { PageHero } from "@/components/blocks/page-hero";
import { SectionHead } from "@/components/blocks/section-head";
import { EXPORT_COUNTRIES, ExportMap } from "@/components/blocks/export-map";
import { LeadCta } from "@/components/forms/lead-cta";
import { Container, Marquee, Photo, Section } from "@/components/ui";
import { pageMetadata } from "@/lib/seo";
import { PARTNERS, PHOTO } from "@/lib/site";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(locale, "/about", "about");
}

const YEARS = ["y1996", "y2014", "y2016", "y2022"] as const;
const QUALITY = ["lab", "food", "docs"] as const;

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");
  const tc = await getTranslations("common");

  const gallery = [
    { key: "gold", img: PHOTO.skoGold },
    { key: "twist", img: PHOTO.twistStack },
    { key: "tubes", img: PHOTO.tubesTwist },
    { key: "rings", img: PHOTO.ringsBox },
  ] as const;

  return (
    <>
      <PageHero
        eyebrow={t("hero.eyebrow")}
        title={t("hero.title")}
        lead={t("hero.lead")}
        media={<Photo img={PHOTO.tubesElisey} alt={t("hero.alt")} sizes="(min-width: 1024px) 40vw, 100vw" card ratio="16 / 9" priority />}
      />

      <Section tone="white" labelledBy="timeline-title">
        <SectionHead eyebrow={t("timeline.eyebrow")} title={t("timeline.title")} id="timeline-title" size="md" />
        <ol className="mt-6 grid grid-cols-2 gap-x-4 gap-y-6 lg:grid-cols-4">
          {YEARS.map((k) => (
            <li key={k} className="max-w-none border-t-2 border-azure-500 pt-3" data-reveal>
              <p className="tnum font-display text-28 font-semibold text-azure-700">{t(`timeline.items.${k}.y`)}</p>
              <h3 className="mt-1 text-18">{t(`timeline.items.${k}.t`)}</h3>
              <p className="mt-1 text-14 text-ink-700">{t(`timeline.items.${k}.d`)}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section tone="sky" labelledBy="quality-title">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-x-10">
          <div className="lg:col-span-4">
            <SectionHead eyebrow={t("quality.eyebrow")} title={t("quality.title")} id="quality-title" size="md" />
          </div>
          <div className="lg:col-span-8">
            <NumberedList items={QUALITY.map((k) => ({ key: k, title: t(`quality.items.${k}.t`), text: t(`quality.items.${k}.d`) }))} />
          </div>
        </div>
      </Section>

      <Section tone="white" labelledBy="gallery-title">
        <SectionHead eyebrow={t("gallery.eyebrow")} title={t("gallery.title")} id="gallery-title" />
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          {gallery.map((g) => (
            <div key={g.key} data-reveal>
              <Photo img={g.img} alt={t(`gallery.alts.${g.key}`)} sizes="(min-width: 1024px) 24vw, 50vw" card ratio="1 / 1" />
            </div>
          ))}
        </div>
      </Section>

      <section className="surface-mist py-[var(--section-y)]" aria-labelledby="about-partners-title">
        <Container>
          <SectionHead eyebrow={t("partners.eyebrow")} title={t("partners.title")} id="about-partners-title" size="md" />
        </Container>
        <div className="mt-6" data-reveal>
          <Marquee items={PARTNERS} label={t("partners.label")} pauseLabel={tc("marquee.pause")} playLabel={tc("marquee.play")} />
        </div>
      </section>

      <Section tone="white" labelledBy="about-geo-title">
        <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-x-10">
          <div className="lg:col-span-4">
            <SectionHead eyebrow={t("geo.eyebrow")} title={t("geo.title")} lead={t("geo.text")} id="about-geo-title" size="md" />
            <ul className="mt-5 flex flex-wrap gap-2 text-14 font-semibold">
              {EXPORT_COUNTRIES.map((c) => (
                <li key={c} className="max-w-none rounded-full border border-sky-line px-3 py-1">
                  {t(`geo.countries.${c}`)}
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-8" data-reveal>
            <ExportMap
              title={t("geo.mapTitle")}
              origin={t("geo.origin")}
              countries={{
                kz: t("geo.countries.kz"),
                kg: t("geo.countries.kg"),
                tj: t("geo.countries.tj"),
                tm: t("geo.countries.tm"),
                ru: t("geo.countries.ru"),
                by: t("geo.countries.by"),
                az: t("geo.countries.az"),
              }}
            />
          </div>
        </div>
      </Section>

      <LeadCta />
    </>
  );
}
