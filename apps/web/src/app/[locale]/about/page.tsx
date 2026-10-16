import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { NumberedList } from "@/components/blocks/numbered-list";
import { PageHero } from "@/components/blocks/page-hero";
import { SectionHead } from "@/components/blocks/section-head";
import { Steps } from "@/components/blocks/steps";
import { LeadCta } from "@/components/forms/lead-cta";
import { Container, Marquee, Photo, Section } from "@/components/ui";
import { MAP_URL } from "@/lib/contacts";
import { pageMetadata } from "@/lib/seo";
import { PARTNERS, PHOTO } from "@/lib/site";
import { ButtonLink } from "@/components/ui";

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

  const gallery = [
    { key: "gold", img: PHOTO.skoGold, cls: "md:col-span-7", ratio: "4 / 3" },
    { key: "twist", img: PHOTO.twistStack, cls: "md:col-span-5", ratio: "4 / 3" },
    { key: "tubes", img: PHOTO.tubesTwist, cls: "md:col-span-5", ratio: "16 / 9" },
    { key: "rings", img: PHOTO.ringsBox, cls: "md:col-span-7", ratio: "16 / 9" },
  ] as const;

  return (
    <>
      <PageHero
        eyebrow={t("hero.eyebrow")}
        title={t("hero.title")}
        lead={t("hero.lead")}
        media={<Photo img={PHOTO.tubesElisey} alt={t("hero.alt")} sizes="(min-width: 1024px) 40vw, 100vw" card ratio="4 / 3" priority />}
      />

      <Section tone="white" labelledBy="timeline-title">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-x-10">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
              <SectionHead eyebrow={t("timeline.eyebrow")} title={t("timeline.title")} id="timeline-title" size="md" />
            </div>
          </div>
          <div className="lg:col-span-7">
            <Steps
              items={YEARS.map((k) => ({
                key: k,
                label: t(`timeline.items.${k}.y`),
                title: t(`timeline.items.${k}.t`),
                text: t(`timeline.items.${k}.d`),
              }))}
            />
          </div>
        </div>
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
        <div className="mt-12 grid gap-6 md:grid-cols-12">
          {gallery.map((g) => (
            <div key={g.key} className={g.cls} data-reveal>
              <Photo img={g.img} alt={t(`gallery.alts.${g.key}`)} sizes="(min-width: 768px) 55vw, 100vw" card ratio={g.ratio} parallax />
            </div>
          ))}
        </div>
      </Section>

      <section className="surface-mist py-[var(--section-y)]" aria-labelledby="about-partners-title">
        <Container>
          <SectionHead eyebrow={t("partners.eyebrow")} title={t("partners.title")} id="about-partners-title" size="md" />
        </Container>
        <div className="mt-12" data-reveal>
          <Marquee items={PARTNERS} label={t("partners.label")} />
        </div>
      </section>

      <Section tone="white" labelledBy="about-geo-title">
        <SectionHead eyebrow={t("geo.eyebrow")} title={t("geo.title")} lead={t("geo.text")} id="about-geo-title" />
        <ButtonLink href={MAP_URL} variant="secondary" className="mt-8" data-reveal>
          {t("geo.cta")}
        </ButtonLink>
      </Section>

      <LeadCta />
    </>
  );
}
