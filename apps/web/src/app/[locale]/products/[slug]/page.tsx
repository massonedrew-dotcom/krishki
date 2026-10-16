import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { NumberedList } from "@/components/blocks/numbered-list";
import { PackFlow } from "@/components/blocks/pack-flow";
import { PageHero } from "@/components/blocks/page-hero";
import { SectionHead } from "@/components/blocks/section-head";
import { LeadCta } from "@/components/forms/lead-cta";
import { LidViewerSlot } from "@/components/product/lid-viewer-slot";
import { ButtonLink, Photo, Section, SpecTable } from "@/components/ui";
import { Link } from "@/i18n/navigation";
import { pageMetadata } from "@/lib/seo";
import { PHOTO, PRODUCT_SLUGS, type Img, type ProductSlug } from "@/lib/site";

type Props = { params: Promise<{ locale: string; slug: string }> };

type Config = {
  ns: "sko" | "twist" | "ring";
  home: "sko" | "twist" | "ring";
  specs: string[];
  features: string[];
  variants: { key: string; img: Img }[];
  packs: { key: string; img?: Img }[];
  lid: Img;
  banner?: Img;
  product: "sko" | "twist" | "ring";
  related: ProductSlug[];
};

const CONFIG: Record<ProductSlug, Config> = {
  "sko-i82": {
    ns: "sko",
    home: "sko",
    specs: ["type", "jar", "metal", "thickness", "outside", "inside", "ring", "rib"],
    features: ["coat", "ring", "rib"],
    variants: [
      { key: "gold", img: PHOTO.skoGold },
      { key: "litho", img: PHOTO.lithoMix },
      { key: "private", img: PHOTO.privateSko },
    ],
    packs: [
      { key: "mechta", img: PHOTO.tubesMechta },
      { key: "elisey", img: PHOTO.tubesElisey },
    ],
    lid: PHOTO.lidSko,
    banner: PHOTO.bannerSko,
    product: "sko",
    related: ["twist-off", "wikel-ring"],
  },
  "twist-off": {
    ns: "twist",
    home: "twist",
    specs: ["type", "jar", "metal", "outside", "inside", "button", "gasket", "close"],
    features: ["button", "gasket", "hand"],
    variants: [
      { key: "mono", img: PHOTO.twistStack },
      { key: "full", img: PHOTO.twistTomato },
      { key: "private", img: PHOTO.twistIttifoq },
    ],
    packs: [{ key: "mechta", img: PHOTO.tubesTwist }, { key: "bulk" }],
    lid: PHOTO.lidTwist,
    banner: PHOTO.bannerTwist,
    product: "twist",
    related: ["sko-i82", "wikel-ring"],
  },
  "wikel-ring": {
    ns: "ring",
    home: "ring",
    specs: ["use", "material", "standard", "dims", "since", "pack"],
    features: ["food", "gost", "pack"],
    variants: [
      { key: "rings", img: PHOTO.rings },
      { key: "box", img: PHOTO.ringsBox },
    ],
    packs: [{ key: "bulk" }],
    lid: PHOTO.rings,
    product: "ring",
    related: ["sko-i82", "twist-off"],
  },
};

export function generateStaticParams() {
  return PRODUCT_SLUGS.map((slug) => ({ slug }));
}
export const dynamicParams = false;

function isSlug(v: string): v is ProductSlug {
  return (PRODUCT_SLUGS as readonly string[]).includes(v);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isSlug(slug)) return {};
  return pageMetadata(locale, `/products/${slug}`, `product.${CONFIG[slug].ns}`);
}

export default async function ProductPage({ params }: Props) {
  const { locale, slug } = await params;
  if (!isSlug(slug)) notFound();
  setRequestLocale(locale);
  const cfg = CONFIG[slug];
  const t = await getTranslations(`product.${cfg.ns}`);
  const c = await getTranslations("product.common");
  const th = await getTranslations("home.products.items");
  const tc = await getTranslations("common");

  const specRows = [
    ...cfg.specs.map((k) => ({ label: t(`specs.${k}.l`), values: [t(`specs.${k}.v`)] })),
    ...(cfg.ns === "ring" ? [] : [{ label: c("moq"), values: [c("moqValue")] }]),
    { label: c("price"), values: [c("priceValue")] },
  ];

  return (
    <>
      <PageHero
        eyebrow={t("hero.eyebrow")}
        title={t("hero.title")}
        lead={t("hero.lead")}
        actions={
          <>
            <ButtonLink href="#lead-form" size="lg">
              {tc("cta.requestPrice")}
            </ButtonLink>
            <ButtonLink href="/products" variant="secondary" size="lg">
              {c("back")}
            </ButtonLink>
          </>
        }
        media={<LidViewerSlot img={cfg.lid} alt={t("hero.alt")} />}
      />

      {cfg.banner ? (
        <Section tone="white" className="!pb-0 !pt-12 md:!pt-20">
          <Photo img={cfg.banner} alt={t("hero.bannerAlt")} sizes="(min-width: 1440px) 1344px, 100vw" ratio="12 / 5" card parallax />
        </Section>
      ) : null}

      <Section tone="white" labelledBy="features-title">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-x-10">
          <div className="lg:col-span-4">
            <SectionHead eyebrow={c("featuresEyebrow")} title={t("featuresTitle")} id="features-title" size="md" />
          </div>
          <div className="lg:col-span-8">
            <NumberedList items={cfg.features.map((k) => ({ key: k, title: t(`features.${k}.t`), text: t(`features.${k}.d`) }))} />
          </div>
        </div>
      </Section>

      <Section tone="sky" labelledBy="datasheet-title">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-x-10">
          <div className="lg:col-span-4">
            <SectionHead eyebrow={c("datasheetEyebrow")} title={c("datasheetTitle")} id="datasheet-title" size="md" />
          </div>
          <div className="rounded-card bg-paper p-5 md:p-8 lg:col-span-8" data-reveal>
            <SpecTable
              caption={t("hero.eyebrow")}
              columns={{ parameter: c("columns.param"), values: [c("columns.value")] }}
              rows={specRows}
            />
          </div>
        </div>
      </Section>

      <Section tone="white" labelledBy="variants-title">
        <SectionHead eyebrow={c("variantsEyebrow")} title={c("variantsTitle")} id="variants-title" />
        <ul className={`mt-12 grid gap-6 ${cfg.variants.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
          {cfg.variants.map((v) => (
            <li key={v.key} className="max-w-none" data-reveal>
              <Photo img={v.img} alt={t(`variants.${v.key}.alt`)} sizes="(min-width: 768px) 30vw, 100vw" ratio="4 / 3" card />
              <h3 className="mt-5 text-28">{t(`variants.${v.key}.t`)}</h3>
              <p className="mt-2 text-16 text-ink-700">{t(`variants.${v.key}.d`)}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="mist" labelledBy="pack-title">
        <SectionHead eyebrow={c("packEyebrow")} title={c("packTitle")} id="pack-title" />
        <div className="mt-12 grid gap-6">
          {cfg.packs.map((p) => {
            const group = t(`pack.${p.key}.group`);
            return (
              <PackFlow
                key={p.key}
                title={t(`pack.${p.key}.title`)}
                img={p.img}
                alt={t(`pack.${p.key}.alt`)}
                tube={{ value: t(`pack.${p.key}.tube`), note: t(`pack.${p.key}.tubeNote`) }}
                group={group ? { value: group, note: t(`pack.${p.key}.groupNote`) } : undefined}
              />
            );
          })}
        </div>
      </Section>

      <Section tone="white" labelledBy="related-title">
        <p className="caption mb-6" id="related-title">
          {c("relatedEyebrow")}
        </p>
        <ul className="grid gap-6 md:grid-cols-2">
          {cfg.related.map((r) => {
            const k = CONFIG[r].home;
            return (
              <li key={r} className="max-w-none">
                <Link
                  href={`/products/${r}`}
                  className="lift group flex items-end justify-between gap-6 rounded-card border border-sky-line bg-mist p-6 no-underline md:p-10"
                >
                  <span>
                    <span className="caption block">{th(`${k}.tag`)}</span>
                    <span className="mt-2 block font-display text-48 font-semibold leading-tight text-ink-950">
                      {th(`${k}.name`)}
                    </span>
                  </span>
                  <span className="arrow-link shrink-0">{tc("cta.more")}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Section>

      <LeadCta defaultProduct={cfg.product} />
    </>
  );
}
