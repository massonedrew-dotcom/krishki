import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/blocks/page-hero";
import { SectionHead } from "@/components/blocks/section-head";
import { Steps } from "@/components/blocks/steps";
import { LeadForm } from "@/components/forms/lead-form";
import { Section } from "@/components/ui";
import { PHONES, TELEGRAM, WHATSAPP } from "@/lib/contacts";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(locale, "/order", "order");
}

const STEPS = ["request", "price", "supply"] as const;

export default async function OrderPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("order");
  const tf = await getTranslations("form");
  const tc = await getTranslations("common");
  const tk = await getTranslations("contacts");

  const linkCls = "inline-flex min-h-11 items-center text-ink-950 no-underline hover:text-azure-700";

  return (
    <>
      <PageHero eyebrow={t("hero.eyebrow")} title={t("hero.title")} lead={t("hero.lead")} />

      {/* The form comes first. ?direction= and ?product= presets are read by LeadForm itself. */}
      <Section tone="white" id="lead-form" labelledBy="order-form-title" className="!pt-10 md:!pt-14">
        <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-x-10">
          <div className="lg:col-span-4">
            <h2 id="order-form-title" className="text-36">
              {tf("title")}
            </h2>
            <p className="mt-3 text-18 text-ink-700">{tf("lead")}</p>
          </div>
          <div className="rounded-card border border-sky-line bg-paper p-6 shadow-soft md:p-10 lg:col-span-8">
            <LeadForm />
          </div>
        </div>
      </Section>

      <Section tone="sky" labelledBy="order-steps-title">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-x-10">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
              <SectionHead title={t("steps.title")} id="order-steps-title" size="md" />
            </div>
          </div>
          <div className="lg:col-span-7">
            <Steps
              items={STEPS.map((k) => ({ key: k, title: t(`steps.items.${k}.t`), text: t(`steps.items.${k}.d`) }))}
            />
          </div>
        </div>
      </Section>

      <Section tone="white" labelledBy="order-contacts-title">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-x-10">
          <div className="lg:col-span-4">
            <SectionHead title={t("contacts.title")} id="order-contacts-title" size="md" />
          </div>
          <dl className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:col-span-8">
            <div>
              <dt className="caption border-b border-line pb-3">{tk("phones")}</dt>
              <dd className="tnum mt-3 grid gap-1 font-display text-28 font-semibold">
                {PHONES.map((p) => (
                  <a key={p.href} href={p.href} className={linkCls}>
                    {p.display}
                  </a>
                ))}
              </dd>
            </div>
            <div>
              <dt className="caption border-b border-line pb-3">{tk("messengers")}</dt>
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
          </dl>
        </div>
      </Section>
    </>
  );
}
