import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/blocks/page-hero";
import { LeadCta } from "@/components/forms/lead-cta";
import { Section } from "@/components/ui";
import { cx } from "@/lib/cx";
import { pageMetadata } from "@/lib/seo";
import { LOGO, PHOTO, TUBE_V2, type Img } from "@/lib/site";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(locale, "/brands", "brands");
}

type Brand = {
  key: "mechta" | "elisey" | "moya" | "rosa" | "gurman";
  specs: string[];
  images: Img[];
  logo?: boolean;
  wide?: boolean;
};

const BRANDS: Brand[] = [
  { key: "mechta", specs: ["types", "tube", "group"], images: [TUBE_V2.skoMechta, TUBE_V2.twistGreen], logo: true, wide: true },
  { key: "elisey", specs: ["types", "tube", "group"], images: [PHOTO.tubesElisey] },
  { key: "gurman", specs: ["tube", "designs", "rest"], images: [TUBE_V2.gurmanFamily, TUBE_V2.gurmanG] },
  { key: "moya", specs: ["metal", "outer", "inner", "top", "inks", "pack"], images: [TUBE_V2.moyaMechta] },
  { key: "rosa", specs: ["metal", "outer", "inner", "top", "inks", "pack"], images: [TUBE_V2.rosa] },
];

export default async function BrandsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("brands");

  return (
    <>
      <PageHero eyebrow={t("hero.eyebrow")} title={t("hero.title")} lead={t("hero.lead")} />

      <Section tone="white">
        <div className="grid gap-4 lg:grid-cols-2">
          {BRANDS.map((b) => (
            <article key={b.key} aria-labelledby={`brand-${b.key}`} className={cx("brand-panel", b.wide && "brand-panel--wide")} data-reveal>
              <div className="brand-panel__pics">
                {b.images.map((img, i) => (
                  <Image
                    key={img.src}
                    src={img.src}
                    width={img.width}
                    height={img.height}
                    alt={i === 0 ? t(`${b.key}.imgAlt`) : ""}
                    sizes="(min-width: 1024px) 12rem, 30vw"
                  />
                ))}
              </div>
              <div className="min-w-0">
                {b.logo ? <Image src={LOGO.src} width={LOGO.width} height={LOGO.height} alt="" sizes="6rem" className="mb-2 h-10 w-auto" /> : null}
                <p className="caption">{t(`${b.key}.alt`)}</p>
                <h2 id={`brand-${b.key}`} className="mt-1 text-28">
                  {t(`${b.key}.name`)}
                </h2>
                <p className="mt-1 font-display text-16 text-azure-700">{t(`${b.key}.slogan`)}</p>
                <p className="mt-2 text-14 text-ink-700">{t(`${b.key}.text`)}</p>
              </div>
              <dl className="brand-panel__specs tnum">
                {b.specs.map((k) => (
                  <div key={k}>
                    <dt>{t(`${b.key}.specs.${k}.l`)}</dt>
                    <dd>{t(`${b.key}.specs.${k}.v`)}</dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
        </div>
      </Section>

      <LeadCta />
    </>
  );
}
