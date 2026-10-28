import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LeadForm } from "@/components/forms/lead-form";
import { HERO_STEPS } from "@/components/home/hero-lid";
import { HeroSteps } from "@/components/home/hero-steps";
import { HomeScroll } from "@/components/home/home-scroll";
import { ButtonLink, Container, Marquee, Section, SplitText } from "@/components/ui";
import { Link } from "@/i18n/navigation";
import { MAP_URL } from "@/lib/contacts";
import { organizationJsonLd, pageMetadata } from "@/lib/seo";
import { LID_LIVE, ORDER_HREF, PARTNERS, PHOTO, TUBE_V2 } from "@/lib/site";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(locale, "", "home");
}

const ROWS = ["for", "material", "outside", "inside", "seal", "pack"] as const;
const STATIONS = [
  { key: "tin", gold: false },
  { key: "lacquer", gold: true },
  { key: "litho", gold: true },
  { key: "stamp", gold: false },
  { key: "seal", gold: false },
  { key: "qc", gold: false },
  { key: "pack", gold: false },
] as const;
/** Years sit at their true position on a 1996-2026 ruler (percent of 30 years). */
const YEARS = [
  { key: "y1996", year: "1996", at: 0, left: false },
  { key: "y2014", year: "2014", at: 60, left: true },
  { key: "y2016", year: "2016", at: 66.7, left: false },
  { key: "y2022", year: "2022", at: 86.7, left: false },
] as const;
const AUDIENCE = [
  { key: "distributors", href: "/distributors" },
  { key: "suppliers", href: "/suppliers" },
  { key: "private", href: "/private-label" },
] as const;
const TUBES = [
  { key: "mechta", img: TUBE_V2.skoMechta },
  { key: "twistGreen", img: TUBE_V2.twistGreen },
  { key: "twistRed", img: TUBE_V2.twistRed },
  { key: "moya", img: TUBE_V2.moyaMechta },
  { key: "rosa", img: TUBE_V2.rosa },
] as const;

const WHOLESALE = `${ORDER_HREF}?direction=wholesale`;

/**
 * Home, plan v4 section 3 in style C. The first screen is direction A (dark graphite stage, gold lid).
 * TODO(client): factory photos for the stations without a picture, exact dimensions for the datasheet,
 * ring size and rubber grade, permission to show partner logos.
 */
export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const tf = await getTranslations("form");
  const tc = await getTranslations("common");

  // constant JSON from our own facts; "<" escaped so it can never close the script tag
  const jsonLd = JSON.stringify(organizationJsonLd()).replace(/</g, String.raw`\u003c`);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      {/* 1. Hero: direction A. Tall with a sticky stage, so scrolling turns the live lid photos step by step. */}
      <section id="hero" className="h-stage surface-stage" aria-labelledby="home-title" data-hero-track="">
        <Container className="h-stage__grid">
          <div className="h-stage__text">
            <h1 id="home-title">
              {t("hero.titleLead")} <strong>{t("hero.titleAccent")}</strong>
            </h1>
            <p className="h-stage__lead">{t("hero.lead")}</p>
            <div className="h-stage__cta mt-8 flex flex-wrap gap-3">
              <ButtonLink href={ORDER_HREF} variant="order" size="lg">
                {t("hero.order")}
              </ButtonLink>
              <ButtonLink href={WHOLESALE} variant="secondary" size="lg">
                {t("hero.price")}
              </ButtonLink>
            </div>
            <p className="h-stage__note max-w-none">{t("hero.note")}</p>
          </div>
          {/* three scroll steps: the live photo turns through its views, the card shows its datasheet rows */}
          <HeroSteps
            alts={[t("hero.slotAlt"), t("products.items.twist.altRed"), t("products.items.ring.alt")]}
            sizes="(min-width: 1024px) 36vw, 90vw"
            items={HERO_STEPS.map((k) => ({
              key: k,
              name: t(`products.items.${k}.name`),
              sub: t(`products.items.${k}.sub`),
              rows: ROWS.map((r) => ({ label: t(`products.labels.${r}`), value: t(`products.items.${k}.${r}`) })),
            }))}
          />
          <ul className="h-facts tnum">
            {(["market", "batch", "geo"] as const).map((k) => (
              <li key={k}>
                {t(`hero.facts.${k}.l`)}
                <b>{t(`hero.facts.${k}.v`)}</b>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Sections 2-8 stack like sheets: each slides up over the previous one (home-scroll.tsx) */}
      <HomeScroll />
      <div className="h-stack">
      {/* 2. Products: one comparison datasheet */}
      <Section tone="white" id="products" labelledBy="products-title">
        <div className="h-head">
          <SplitText as="h2" id="products-title" text={t("products.title")} />
          <p data-reveal>{t("products.lead")}</p>
        </div>
        <div className="h-ds tnum" data-reveal>
          <div className="h-ds__labels" aria-hidden="true">
            <span />
            <span />
            {ROWS.map((r) => (
              <span key={r}>{t(`products.labels.${r}`)}</span>
            ))}
            <span />
          </div>
          {(["sko", "twist", "ring"] as const).map((p) => (
            <article key={p} className="h-ds__col" aria-labelledby={`ds-${p}`}>
              {p === "sko" ? (
                <div className="h-ds__pic h-ds__pic--one">
                  <Image src={LID_LIVE.sko34.src} width={LID_LIVE.sko34.width} height={LID_LIVE.sko34.height} alt={t("products.items.sko.alt")} sizes="(min-width: 1024px) 28vw, 90vw" />
                </div>
              ) : p === "twist" ? (
                <div className="h-ds__pic h-ds__pic--pair">
                  <Image src={LID_LIVE.red34.src} width={LID_LIVE.red34.width} height={LID_LIVE.red34.height} alt={t("products.items.twist.altRed")} sizes="(min-width: 1024px) 18vw, 60vw" />
                  <Image src={LID_LIVE.green34.src} width={LID_LIVE.green34.width} height={LID_LIVE.green34.height} alt={t("products.items.twist.altGreen")} sizes="(min-width: 1024px) 18vw, 60vw" />
                </div>
              ) : (
                <div className="h-ds__pic h-ds__pic--photo">
                  <Image src={PHOTO.rings.src} width={PHOTO.rings.width} height={PHOTO.rings.height} alt={t("products.items.ring.alt")} sizes="(min-width: 1024px) 28vw, 90vw" />
                </div>
              )}
              <h3 id={`ds-${p}`}>
                {t(`products.items.${p}.name`)}
                <small>{t(`products.items.${p}.sub`)}</small>
              </h3>
              {ROWS.map((r) => (
                <div key={r} className="h-ds__v">
                  <span className="h-ds__k">{t(`products.labels.${r}`)}</span>
                  {t(`products.items.${p}.${r}`)}
                </div>
              ))}
              <div className="h-ds__act">
                <ButtonLink href={`${WHOLESALE}&product=${p === "twist" ? "twist" : p === "ring" ? "ring" : "sko"}`} size="sm">
                  {t("products.price")}
                </ButtonLink>
                <ButtonLink
                  href={p === "sko" ? "/products/sko-i82" : p === "twist" ? "/products/twist-off" : "/products/wikel-ring"}
                  variant="secondary"
                  size="sm"
                >
                  {t("products.more")}
                </ButtonLink>
              </div>
            </article>
          ))}
        </div>
      </Section>

      {/* 3. Factory: the line as stations, then the timeline ruler */}
      <section className="surface-azure" aria-labelledby="factory-title" id="factory">
        {/* the line: pinned on desktop while the rail fills and the stations light up one by one */}
        <div className="h-line-track">
          <Container className="h-line-pin">
            <div className="h-head">
              <SplitText as="h2" id="factory-title" text={t("factory.title")} />
              <p data-reveal>{t("factory.lead")}</p>
            </div>
            <ol className="h-stations">
              {STATIONS.map((s, i) => (
                <li key={s.key} className={`h-st${s.gold ? " h-st--gold" : ""}`}>
                  <span className="h-st__node tnum" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3>{t(`factory.stations.${s.key}.t`)}</h3>
                  <p>{t(`factory.stations.${s.key}.d`)}</p>
                </li>
              ))}
            </ol>
          </Container>
        </div>
        <Container className="pb-[var(--section-y)]">
          <div className="h-ruler tnum" aria-hidden="true">
            <div className="h-ruler__scale" />
            {YEARS.map((y) => (
              <div key={y.key} className={`h-ruler__ev${y.left ? " h-ruler__ev--l" : ""}`} style={{ left: `${y.at}%` }}>
                <b>{y.year}</b>
                <span>{t(`factory.years.${y.key}.s`)}</span>
              </div>
            ))}
            <div className="h-ruler__ends">
              <span>1996</span>
              <span>2026</span>
            </div>
          </div>
          <ol className="h-years tnum">
            {YEARS.map((y) => (
              <li key={y.key}>
                <b>{y.year}</b>
                <span>{t(`factory.years.${y.key}.d`)}</span>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* 4. Who we work with: a drawing index linking to the audience pages */}
      <Section tone="white" labelledBy="audience-title">
        <div className="h-head">
          <SplitText as="h2" id="audience-title" text={t("audience.title")} />
        </div>
        <ul className="h-index" data-reveal>
          {AUDIENCE.map((a) => (
            <li key={a.key} className="h-index__item">
              <h3>
                <Link href={a.href}>{t(`audience.items.${a.key}.t`)}</Link>
              </h3>
              <p>{t(`audience.items.${a.key}.d`)}</p>
              <span className="arrow-link mt-auto pt-2">{t(`audience.items.${a.key}.cta`)}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* 5. Brands in tubes */}
      <Section tone="mist" labelledBy="brands-title">
        <div className="h-head">
          <SplitText as="h2" id="brands-title" text={t("brands.title")} />
          <p data-reveal>{t("brands.lead")}</p>
        </div>
        {/* scrolls sideways on phones: focusable and named so keyboard users can scroll it too */}
        <ul className="h-tubes" data-reveal tabIndex={0} aria-label={t("brands.title")}>
          {TUBES.map((b) => (
            <li key={b.key}>
              <figure className="h-tube">
                <div className="h-tube__pic">
                  <Image src={b.img.src} fill alt={t(`brands.items.${b.key}.alt`)} sizes="(min-width: 1024px) 18vw, 62vw" />
                </div>
                <figcaption>
                  <b>{t(`brands.items.${b.key}.n`)}</b>
                  {t(`brands.items.${b.key}.d`)}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
        <ButtonLink href="/brands" variant="secondary" className="mt-8">
          {t("brands.cta")}
        </ButtonLink>
      </Section>

      {/* 6. Services */}
      <Section tone="white" labelledBy="services-title">
        <div className="h-head">
          <SplitText as="h2" id="services-title" text={t("services.title")} />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {(["lacquer", "private"] as const).map((k) => (
            <article key={k} className="h-frame" data-reveal>
              <div className="h-frame__in">
                <div className="h-frame__pic">
                  <Image
                    src={k === "lacquer" ? PHOTO.lithoMix.src : PHOTO.privateSko.src}
                    fill
                    alt={t(`services.items.${k}.alt`)}
                    sizes="(min-width: 768px) 45vw, 100vw"
                  />
                </div>
                <div className="h-frame__body">
                  <p className="h-frame__tag max-w-none">{t(`services.items.${k}.tag`)}</p>
                  <h3>{t(`services.items.${k}.title`)}</h3>
                  <p>{t(`services.items.${k}.text`)}</p>
                  <ButtonLink href={k === "lacquer" ? "/services" : "/private-label"} variant="secondary" size="sm" className="mt-auto">
                    {t(`services.items.${k}.cta`)}
                  </ButtonLink>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Section>

      {/* 7. Partners. TODO(client): permission to show the logos (brief #7). */}
      <section className="surface-white py-[var(--space-16)]" aria-labelledby="partners-title">
        <Container>
          <SplitText as="h2" id="partners-title" className="text-48" text={t("partners.title")} />
        </Container>
        <div className="mt-10 md:mt-12" data-reveal>
          <Marquee items={PARTNERS} label={t("partners.label")} pauseLabel={tc("marquee.pause")} playLabel={tc("marquee.play")} />
        </div>
      </section>

      {/* 8. Geography and the inline order form */}
      <Section tone="white" id="lead-form" labelledBy="geo-title">
        <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-x-10">
          <div className="lg:col-span-5">
            <SplitText as="h2" id="geo-title" className="text-48" text={t("geo.title")} />
            <p className="mt-5 text-18 text-ink-700" data-reveal>
              {t("geo.text")}
            </p>
            <ButtonLink href={MAP_URL} variant="secondary" className="mt-8" data-reveal>
              {t("geo.cta")}
            </ButtonLink>
          </div>
          <div className="h-frame lg:col-span-7" data-reveal>
            <div className="h-frame__in p-6 md:p-10">
              <h3 className="text-28">{tf("title")}</h3>
              <p className="mb-6 mt-2 text-ink-700">{tf("lead")}</p>
              <LeadForm />
            </div>
          </div>
        </div>
      </Section>
      </div>
    </>
  );
}
