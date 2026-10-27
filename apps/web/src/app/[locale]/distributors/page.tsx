import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { PageHero } from "@/components/blocks/page-hero";
import { LeadForm } from "@/components/forms/lead-form";
import { SectionHead } from "@/components/blocks/section-head";
import { Link } from "@/i18n/navigation";
import { ButtonLink, Container, Marquee, Section } from "@/components/ui";
import { MAP_URL } from "@/lib/contacts";
import { pageMetadata } from "@/lib/seo";
import { PARTNERS, TUBE_V2 } from "@/lib/site";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(locale, "/distributors", "distributors");
}

const SUPPLY = [
  { key: "sko", href: "/products/sko-i82" },
  { key: "twist", href: "/products/twist-off" },
  { key: "ring", href: "/products/wikel-ring" },
  { key: "brands", href: "/brands" },
] as const;

const PACK_ROWS = ["mechta", "elisey", "moya", "twist", "ring"] as const;

/** The wholesale request form sits on this page (client, 27 Oct). */
const FORM = "#lead-form";

/**
 * Distributors and export buyers. No commercial terms on this page (client, 2026-10-26): prices, discounts,
 * minimum per design and delivery terms are given after the request. TODO(client): lot size per region,
 * paid or free samples, tube and box dimensions in mm.
 */
export default async function DistributorsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("distributors");
  const tc = await getTranslations("common");

  return (
    <>
      <PageHero
        eyebrow={t("hero.eyebrow")}
        title={t("hero.title")}
        lead={t("hero.lead")}
        actions={
          <>
            <ButtonLink href={FORM} size="lg">
              {t("hero.cta")}
            </ButtonLink>
            <ButtonLink href="#lots" variant="secondary" size="lg">
              {t("hero.more")}
            </ButtonLink>
            <p className="mt-1 basis-full text-14 text-fg-muted">{t("hero.terms")}</p>
          </>
        }
        media={
          <div className="frame frame--card" style={{ aspectRatio: "4 / 3" }}>
            {/* Inner grid keeps the tubes out of `.frame > img`, which would stretch and crop them. */}
            <div className="grid h-full grid-cols-4 items-end gap-3 px-6 pb-6 pt-8 md:gap-5">
              {[TUBE_V2.skoMechta, TUBE_V2.twistGreen, TUBE_V2.moyaMechta, TUBE_V2.rosa].map((img, i) => (
                <Image
                  key={img.src}
                  src={img.src}
                  width={img.width}
                  height={img.height}
                  alt={i === 0 ? t("hero.alt") : ""}
                  sizes="(min-width: 1024px) 160px, 25vw"
                  priority
                  className="packshot max-h-full w-full object-contain object-bottom"
                />
              ))}
            </div>
          </div>
        }
      />

      <Section tone="white" labelledBy="supply-title">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-x-10">
          <div className="lg:col-span-4">
            <SectionHead title={t("supply.title")} id="supply-title" size="md" />
          </div>
          <ul className="border-t border-line lg:col-span-8">
            {SUPPLY.map((s) => (
              <li
                key={s.key}
                className="grid max-w-none gap-x-8 gap-y-3 border-b border-line py-7 md:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_auto] md:items-baseline"
                data-reveal
              >
                <h3 className="text-28">{t(`supply.items.${s.key}.t`)}</h3>
                <p className="text-18 text-ink-700">{t(`supply.items.${s.key}.d`)}</p>
                <Link href={s.href} className="arrow-link min-h-11">
                  {tc("cta.more")}
                  <span className="sr-only">: {t(`supply.items.${s.key}.t`)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section tone="sky" id="lots" labelledBy="lots-title">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-x-10">
          <div className="lg:col-span-4">
            <SectionHead title={t("lots.title")} lead={t("lots.lead")} id="lots-title" size="md" />
          </div>
          <div className="lg:col-span-8">
            <p className="caption max-w-none border-b border-ink-950 pb-3">{t("lots.caption")}</p>
            <ul>
              {PACK_ROWS.map((r) => (
                <li
                  key={r}
                  className="grid max-w-none gap-x-8 gap-y-3 border-b border-line py-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.6fr)_minmax(0,1.6fr)]"
                  data-reveal
                >
                  <h3 className="text-22">{t(`lots.rows.${r}.l`)}</h3>
                  <p className="grid gap-1">
                    <span className="caption">{t("lots.columns.unit")}</span>
                    <span className="tnum font-display text-28 font-semibold leading-tight">
                      {t(`lots.rows.${r}.unit`)}
                    </span>
                  </p>
                  <p className="grid gap-1">
                    <span className="caption">{t("lots.columns.group")}</span>
                    <span className="text-18">{t(`lots.rows.${r}.group`)}</span>
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section tone="white">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-x-16">
          <article aria-labelledby="samples-title" className="border-t-2 border-ink-950 pt-6">
            <h2 id="samples-title" className="text-36">
              {t("samples.title")}
            </h2>
            <p className="mb-8 mt-4 text-18 text-ink-700">{t("samples.text")}</p>
            <ButtonLink href={FORM} variant="secondary">
              {t("samples.cta")}
            </ButtonLink>
          </article>
          <article aria-labelledby="geo-title" className="border-t-2 border-ink-950 pt-6">
            <h2 id="geo-title" className="text-36">
              {t("geo.title")}
            </h2>
            <p className="mb-8 mt-4 text-18 text-ink-700">{t("geo.text")}</p>
            <ButtonLink href={MAP_URL} variant="secondary">
              {t("geo.cta")}
            </ButtonLink>
          </article>
        </div>
      </Section>

      {/* TODO(client): permission to show partner logos (brief #7). */}
      <section className="surface-mist py-[var(--section-y)]" aria-labelledby="partners-title">
        <Container>
          <SectionHead title={t("partners.title")} id="partners-title" size="md" />
        </Container>
        <div className="mt-12" data-reveal>
          <Marquee items={PARTNERS} label={t("partners.label")} />
        </div>
      </section>

      <Section tone="white" id="lead-form" labelledBy="distributors-cta-title">
        <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-x-10">
          <div className="lg:col-span-4">
            <SectionHead title={t("cta.title")} lead={t("cta.text")} id="distributors-cta-title" size="md" />
          </div>
          <div className="rounded-card border border-sky-line bg-paper p-6 shadow-soft md:p-10 lg:col-span-8">
            <LeadForm defaultDirection="wholesale" />
          </div>
        </div>
      </Section>
    </>
  );
}
