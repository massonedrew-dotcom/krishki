import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { NumberedList } from "@/components/blocks/numbered-list";
import { SectionHead } from "@/components/blocks/section-head";
import { SpecList } from "@/components/blocks/spec-list";
import { LeadCta } from "@/components/forms/lead-cta";
import { HeroParadeSlot } from "@/components/home/hero-parade-slot";
import { LidRail } from "@/components/home/lid-rail";
import { Badge, ButtonLink, Container, Eyebrow, Marquee, Photo, Section, SplitText } from "@/components/ui";
import { Link } from "@/i18n/navigation";
import { MAP_URL } from "@/lib/contacts";
import { pageMetadata } from "@/lib/seo";
import { PARTNERS, PHOTO, TUBE } from "@/lib/site";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(locale, "", "home");
}

const WHY = ["quality", "region", "samples", "prices", "custom", "volume"] as const;

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const tc = await getTranslations("common");

    return (
    <>
      {/* 1. Hero + parade slot */}
      <section className="surface-white relative overflow-hidden" aria-labelledby="home-title">
        <Container className="pb-8 pt-10 md:pt-16">
          <div className="grid gap-y-8 lg:min-h-[calc(100svh-var(--header-h)-13.5rem)] lg:grid-cols-12 lg:items-center lg:gap-x-8">
            <div className="relative z-10 lg:col-span-5 lg:col-start-7 lg:row-start-1">
              <Eyebrow>{t("hero.eyebrow")}</Eyebrow>
              <SplitText as="h1" id="home-title" hero className="text-64 sm:text-88" text={t("hero.title")} />
              <p
                className="mt-6 max-w-[30rem] text-18 text-ink-700 md:mt-8 md:text-22"
                data-hero-fade
                style={{ "--d": 200 } as React.CSSProperties}
              >
                {t("hero.lead")}
              </p>
              <div className="mt-8 flex flex-wrap gap-3" data-hero-fade style={{ "--d": 320 } as React.CSSProperties}>
                <ButtonLink href="/contacts#lead-form" size="lg">
                  {t("hero.primary")}
                </ButtonLink>
                <ButtonLink href="/products" variant="secondary" size="lg">
                  {t("hero.secondary")}
                </ButtonLink>
              </div>
            </div>
            {/* TODO(task 5): the 3D parade replaces the static render inside this slot. */}
            <HeroParadeSlot alt={t("hero.slotAlt")} caption={t("hero.slotCaption")} />
            <div className="relative z-10 mt-8 lg:col-span-2 lg:col-start-11 lg:row-start-1 lg:mt-0 lg:self-end" data-hero-fade style={{ "--d": 420 } as React.CSSProperties}>
              <SpecList
                rows={[
                  { label: t("hero.specs.type.label"), value: t("hero.specs.type.value") },
                  { label: t("hero.specs.batch.label"), value: t("hero.specs.batch.value") },
                  { label: t("hero.specs.metal.label"), value: t("hero.specs.metal.value") },
                ]}
              />
            </div>
          </div>
          <LidRail />
        </Container>
      </section>

      {/* 2. Why us */}
      <Section tone="mist" labelledBy="why-title">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-x-10">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
              <SectionHead eyebrow={t("why.eyebrow")} title={t("why.title")} id="why-title" />
            </div>
          </div>
          <div className="lg:col-span-8">
            <NumberedList items={WHY.map((k) => ({ key: k, title: t(`why.items.${k}.t`), text: t(`why.items.${k}.d`) }))} />
          </div>
        </div>
      </Section>

      {/* 3. Scale */}
      <Section tone="sky" labelledBy="scale-title">
        <div className="grid items-end gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <Eyebrow>{t("scale.eyebrow")}</Eyebrow>
            <p className="tnum font-display text-64 font-semibold leading-none tracking-tight text-azure-700 sm:text-88 lg:text-120" data-reveal>
              {t("scale.number")}
            </p>
            <p className="caption mt-4">{t("scale.unit")}</p>
          </div>
          <div className="lg:col-span-4">
            <SplitText as="h2" id="scale-title" className="text-36" text={t("scale.title")} />
            <p className="mt-4 text-18 text-ink-700" data-reveal>
              {t("scale.text")}
            </p>
            <ButtonLink href="/contacts#lead-form" className="mt-8" data-reveal>
              {t("scale.cta")}
            </ButtonLink>
          </div>
        </div>
      </Section>

      {/* 4. Products */}
      <Section tone="white" labelledBy="products-title">
        <SectionHead eyebrow={t("products.eyebrow")} title={t("products.title")} lead={t("products.lead")} id="products-title" />
        <div className="mt-12 grid gap-6 lg:grid-cols-12">
          {(
            [
              { key: "sko", href: "/products/sko-i82", img: PHOTO.skoGold, span: "lg:col-span-6", ratio: "4 / 3" },
              { key: "twist", href: "/products/twist-off", img: PHOTO.twistStack, span: "lg:col-span-6", ratio: "4 / 3" },
              { key: "ring", href: "/products/wikel-ring", img: PHOTO.rings, span: "lg:col-span-12", ratio: "21 / 7" },
            ] as const
          ).map((p) => (
            <article key={p.key} className={`lift relative flex flex-col overflow-hidden rounded-card border border-sky-line bg-paper ${p.span}`} data-reveal>
              <Photo img={p.img} alt={t(`products.items.${p.key}.alt`)} sizes="(min-width: 1024px) 50vw, 100vw" ratio={p.ratio} className="rounded-none" parallax />
              <div className="flex flex-1 flex-col items-start gap-3 p-6 md:p-8">
                <Badge>{t(`products.items.${p.key}.tag`)}</Badge>
                <h3 className="text-36">
                  <Link href={p.href} className="no-underline after:absolute after:inset-0 after:content-['']">
                    {t(`products.items.${p.key}.name`)}
                  </Link>
                </h3>
                <p className="text-16 text-ink-700">{t(`products.items.${p.key}.desc`)}</p>
                <span className="arrow-link mt-auto pt-2">{tc("cta.more")}</span>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-10">
          <ButtonLink href="/products" variant="secondary">
            {t("products.all")}
          </ButtonLink>
        </div>
      </Section>

      {/* 5. Brands */}
      <Section tone="sky" labelledBy="brands-title">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-x-10">
          <div className="lg:col-span-4">
            <SectionHead eyebrow={t("brands.eyebrow")} title={t("brands.title")} lead={t("brands.lead")} id="brands-title" size="md" />
            <ButtonLink href="/brands" className="mt-8" data-reveal>
              {t("brands.cta")}
            </ButtonLink>
          </div>
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:col-span-8">
            {(
              [
                { img: TUBE.skoMechta, alt: t("brands.mechtaAlt") },
                { img: TUBE.twistGreenRed, alt: t("brands.twistAlt") },
                { img: TUBE.moyaMechta, alt: t("brands.moyaAlt") },
                { img: TUBE.rosa, alt: t("brands.rosaAlt") },
              ] as const
            ).map((b) => (
              <li key={b.alt} className="lift max-w-none rounded-card bg-paper p-3" data-reveal>
                <div className="relative h-56 sm:h-64 lg:h-72">
                  <Image src={b.img.src} width={b.img.width} height={b.img.height} alt={b.alt} sizes="(min-width: 640px) 20vw, 44vw" className="h-full w-full object-contain" />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* 6. Services: two stacking cards */}
      <section className="surface-white py-[var(--section-y)]" aria-labelledby="services-title">
        <Container>
          <SectionHead eyebrow={t("services.eyebrow")} title={t("services.title")} id="services-title" />
          <div className="mt-12 grid gap-6">
            {(["lacquer", "private"] as const).map((k, i) => (
              <article
                key={k}
                className="stack-card grid overflow-hidden rounded-card border border-sky-line bg-mist shadow-soft md:grid-cols-2"
                style={{ "--stack": i } as React.CSSProperties}
              >
                <div className="flex flex-col items-start gap-4 p-6 md:p-12">
                  <Badge>{t(`services.items.${k}.tag`)}</Badge>
                  <h3 className="text-48">{t(`services.items.${k}.title`)}</h3>
                  <p className="text-18 text-ink-700">{t(`services.items.${k}.text`)}</p>
                  <ButtonLink href={k === "lacquer" ? "/services" : "/private-label"} variant="secondary" className="mt-auto">
                    {t(`services.items.${k}.cta`)}
                  </ButtonLink>
                </div>
                <Photo
                  img={k === "lacquer" ? PHOTO.lithoMix : PHOTO.privateSko}
                  alt={t(`services.items.${k}.alt`)}
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="min-h-64 rounded-none"
                  ratio="fill"
                />
              </article>
            ))}
          </div>
        </Container>
      </section>

      {/* 7. Partners */}
      <section className="surface-mist py-[var(--section-y)]" aria-labelledby="partners-title">
        <Container>
          <SectionHead eyebrow={t("partners.eyebrow")} title={t("partners.title")} lead={t("partners.lead")} id="partners-title" size="md" />
        </Container>
        <div className="mt-12" data-reveal>
          <Marquee items={PARTNERS} label={t("partners.label")} />
        </div>
      </section>

      {/* 8. Geography */}
      <Section tone="white" labelledBy="geo-title">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-x-10">
          <div className="lg:col-span-7">
            <SectionHead eyebrow={t("geo.eyebrow")} title={t("geo.title")} lead={t("geo.text")} id="geo-title" />
            <ButtonLink href={MAP_URL} variant="secondary" className="mt-8" data-reveal>
              {t("geo.cta")}
            </ButtonLink>
          </div>
          <div className="relative mx-auto w-full max-w-md lg:col-span-5" aria-hidden="true">
            <div className="lid-disc w-full" />
            <Image
              src={PHOTO.lidTwist.src}
              width={PHOTO.lidTwist.width}
              height={PHOTO.lidTwist.height}
              alt=""
              sizes="28rem"
              className="absolute left-1/2 top-1/2 w-[78%] -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_20px_24px_rgba(15,27,42,0.2)]"
            />
          </div>
        </div>
      </Section>

      <LeadCta />
    </>
  );
}
