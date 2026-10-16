import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/blocks/page-hero";
import { ProductGrid } from "@/components/blocks/product-grid";
import { SectionHead } from "@/components/blocks/section-head";
import { LeadCta } from "@/components/forms/lead-cta";
import { Section, SpecTable } from "@/components/ui";
import { pageMetadata } from "@/lib/seo";
import { PHOTO } from "@/lib/site";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(locale, "/products", "products");
}

const ITEMS = [
  { key: "skoGold", href: "/products/sko-i82", img: PHOTO.skoGold },
  { key: "skoLitho", href: "/products/sko-i82", img: PHOTO.lithoMix },
  { key: "skoPrivate", href: "/private-label", img: PHOTO.privateSko },
  { key: "twistMono", href: "/products/twist-off", img: PHOTO.twistStack },
  { key: "twistFull", href: "/products/twist-off", img: PHOTO.twistTomato },
  { key: "twistPrivate", href: "/private-label", img: PHOTO.twistIttifoq },
  { key: "ring", href: "/products/wikel-ring", img: PHOTO.ringsBox },
] as const;

const ROWS = ["jar", "close", "seal", "tube", "moq"] as const;

export default async function ProductsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("products");
  const tc = await getTranslations("common");

  return (
    <>
      <PageHero eyebrow={t("hero.eyebrow")} title={t("hero.title")} lead={t("hero.lead")} />

      <Section tone="white">
        <ProductGrid
          filterLabel={t("filter.label")}
          countLabel={t("filter.count")}
          packLabel={t("packLabel")}
          moreLabel={tc("cta.more")}
          filters={[
            { value: "all", label: t("filter.all") },
            { value: "sko", label: t("filter.sko") },
            { value: "twist", label: t("filter.twist") },
            { value: "ring", label: t("filter.ring") },
          ]}
          items={ITEMS.map((i) => ({
            key: i.key,
            type: t(`items.${i.key}.type`) as "sko" | "twist" | "ring",
            href: i.href,
            img: i.img,
            alt: t(`items.${i.key}.alt`),
            tag: t(`items.${i.key}.tag`),
            name: t(`items.${i.key}.name`),
            desc: t(`items.${i.key}.desc`),
            pack: t(`items.${i.key}.pack`),
          }))}
        />
      </Section>

      <Section tone="sky" labelledBy="compare-title">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-x-10">
          <div className="lg:col-span-4">
            <SectionHead eyebrow={t("compare.eyebrow")} title={t("compare.title")} id="compare-title" size="md" />
          </div>
          <div className="rounded-card bg-paper p-5 md:p-8 lg:col-span-8" data-reveal>
            <SpecTable
              caption={t("compare.caption")}
              columns={{
                parameter: t("compare.columns.param"),
                values: [t("compare.columns.sko"), t("compare.columns.twist")],
              }}
              rows={ROWS.map((r) => ({
                label: t(`compare.rows.${r}.l`),
                values: [t(`compare.rows.${r}.sko`), t(`compare.rows.${r}.twist`)],
              }))}
            />
          </div>
        </div>
      </Section>

      <LeadCta />
    </>
  );
}
