import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/blocks/page-hero";
import { SpecList } from "@/components/blocks/spec-list";
import { LeadCta } from "@/components/forms/lead-cta";
import { Photo, Section, SplitText } from "@/components/ui";
import { cx } from "@/lib/cx";
import { pageMetadata } from "@/lib/seo";
import { LOGO, PHOTO, TUBE, type Img } from "@/lib/site";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(locale, "/brands", "brands");
}

type Brand = {
  key: "mechta" | "elisey" | "moya" | "rosa" | "gurman";
  specs: string[];
  tubes?: Img[];
  photo?: Img;
  logo?: boolean;
};

const BRANDS: Brand[] = [
  { key: "mechta", specs: ["types", "tube", "group"], tubes: [TUBE.skoMechta, TUBE.twistGreenRed], logo: true },
  { key: "elisey", specs: ["types", "tube", "group"], photo: PHOTO.tubesElisey },
  { key: "moya", specs: ["metal", "outer", "inner", "top", "inks", "pack"], tubes: [TUBE.moyaMechta] },
  { key: "rosa", specs: ["metal", "outer", "inner", "top", "inks", "pack"], tubes: [TUBE.rosa] },
  { key: "gurman", specs: ["tube", "designs", "rest"], photo: TUBE.gurman },
];

export default async function BrandsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("brands");

  return (
    <>
      <PageHero eyebrow={t("hero.eyebrow")} title={t("hero.title")} lead={t("hero.lead")} />

      {BRANDS.map((b, i) => {
        const flip = i % 2 === 1;
        return (
          <Section key={b.key} tone={flip ? "mist" : "white"} labelledBy={`brand-${b.key}`}>
            <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-x-12">
              <div className={cx("lg:col-span-5", flip && "lg:order-2")} data-reveal>
                {b.tubes ? (
                  <div className="relative mx-auto flex max-w-md items-end justify-center gap-4 py-8">
                    <div aria-hidden="true" className="lid-disc absolute inset-x-0 top-1/2 -translate-y-1/2" />
                    {b.tubes.map((img) => (
                      <Image
                        key={img.src}
                        src={img.src}
                        width={img.width}
                        height={img.height}
                        alt={b.tubes?.length === 1 || img === b.tubes?.[0] ? t(`${b.key}.imgAlt`) : ""}
                        sizes="(min-width: 1024px) 18rem, 45vw"
                        className="packshot relative h-auto max-h-[26rem] w-auto min-w-0 flex-1 object-contain"
                        style={{ maxWidth: b.tubes && b.tubes.length > 1 ? "48%" : "62%" }}
                      />
                    ))}
                  </div>
                ) : b.photo ? (
                  <Photo
                    img={b.photo}
                    alt={t(`${b.key}.imgAlt`)}
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    card
                    ratio={b.key === "gurman" ? "4 / 4.4" : undefined}
                    imgClassName={b.key === "gurman" ? "object-top" : undefined}
                  />
                ) : null}
              </div>
              <div className={cx("lg:col-span-7", flip && "lg:order-1")}>
                {b.logo ? (
                  <Image src={LOGO.src} width={LOGO.width} height={LOGO.height} alt="" sizes="9rem" className="mb-4 h-20 w-auto" />
                ) : null}
                <p className="caption">{t(`${b.key}.alt`)}</p>
                <SplitText as="h2" id={`brand-${b.key}`} className="mt-2 text-64" text={t(`${b.key}.name`)} />
                <p className="mt-4 font-display text-22 text-azure-700" data-reveal>
                  {t(`${b.key}.slogan`)}
                </p>
                <p className="mt-4 text-18 text-ink-700" data-reveal>
                  {t(`${b.key}.text`)}
                </p>
                <div className="mt-8" data-reveal>
                  <SpecList rows={b.specs.map((k) => ({ label: t(`${b.key}.specs.${k}.l`), value: t(`${b.key}.specs.${k}.v`) }))} />
                </div>
              </div>
            </div>
          </Section>
        );
      })}

      <LeadCta />
    </>
  );
}
