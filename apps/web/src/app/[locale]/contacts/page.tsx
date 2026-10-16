import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/blocks/page-hero";
import { LeadCta } from "@/components/forms/lead-cta";
import { ButtonLink, Section } from "@/components/ui";
import { EMAIL, FACEBOOK, INSTAGRAM, MAP_URL, PHONES, TELEGRAM, WHATSAPP } from "@/lib/contacts";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(locale, "/contacts", "contacts");
}

export default async function ContactsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contacts");
  const tc = await getTranslations("common");

  const linkCls = "inline-flex min-h-11 items-center text-ink-950 no-underline hover:text-azure-700";

  return (
    <>
      <PageHero
        eyebrow={t("hero.eyebrow")}
        title={t("hero.title")}
        lead={t("hero.lead")}
        actions={
          <ButtonLink href="#lead-form" size="lg">
            {tc("cta.requestPrice")}
          </ButtonLink>
        }
      />

      <Section tone="white">
        <dl className="grid gap-x-10 gap-y-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="caption border-b border-line pb-3">{t("phones")}</dt>
            <dd className="tnum mt-3 grid gap-1 font-display text-28 font-semibold">
              {PHONES.map((p) => (
                <a key={p.href} href={p.href} className={linkCls}>
                  {p.display}
                </a>
              ))}
            </dd>
          </div>
          <div>
            <dt className="caption border-b border-line pb-3">{t("messengers")}</dt>
            <dd className="mt-3 grid gap-1 font-display text-28 font-semibold">
              <a href={WHATSAPP.href} className={linkCls}>
                {tc("contacts.whatsapp")}
              </a>
              <a href={TELEGRAM.href} className={linkCls}>
                {tc("contacts.telegram")}
              </a>
              <span className="mt-2 text-14 font-normal text-fg-muted">{TELEGRAM.handle}</span>
            </dd>
          </div>
          <div>
            <dt className="caption border-b border-line pb-3">{t("email")}</dt>
            <dd className="mt-3 grid gap-1 font-display text-22 font-semibold">
              <a href={`mailto:${EMAIL}`} className={linkCls}>
                {EMAIL}
              </a>
              <div className="mt-6 flex gap-5 text-16 font-normal">
                <a href={INSTAGRAM.href} className="link inline-flex min-h-11 items-center">
                  {tc("contacts.instagram")}
                </a>
                <a href={FACEBOOK.href} className="link inline-flex min-h-11 items-center">
                  {tc("contacts.facebook")}
                </a>
              </div>
            </dd>
          </div>
          <div>
            <dt className="caption border-b border-line pb-3">{t("addressTitle")}</dt>
            <dd className="mt-3">
              <address className="text-18 not-italic">{t("address")}</address>
              <a href={MAP_URL} className="link mt-2 inline-flex min-h-11 items-center">
                {t("map")}
              </a>
              <p className="caption mt-4">
                {t("hours")}: <span className="text-ink-950">{t("hoursValue")}</span>
              </p>
            </dd>
          </div>
        </dl>
      </Section>

      <LeadCta />
    </>
  );
}
