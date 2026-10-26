import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/blocks/page-hero";
import { LeadForm } from "@/components/forms/lead-form";
import { Section } from "@/components/ui";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(locale, "/suppliers", "suppliers");
}

/**
 * Shell page. TODO(client): the audience of the «Поставщикам» tab is not confirmed (plan v4, question 1).
 * Every key under `suppliers.*` is neutral placeholder copy: replace it, and the form `direction` list
 * (it has no supplier option yet), when the client answers. Nothing here states who the supplier is.
 */
export default async function SuppliersPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("suppliers");

  return (
    <>
      <PageHero eyebrow={t("hero.eyebrow")} title={t("hero.title")} lead={t("hero.lead")} />

      <Section tone="white" id="lead-form" labelledBy="suppliers-form-title" className="!pt-10 md:!pt-14">
        <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-x-10">
          <div className="lg:col-span-4">
            <h2 id="suppliers-form-title" className="text-36">
              {t("form.title")}
            </h2>
            <p className="mt-3 text-18 text-ink-700">{t("form.lead")}</p>
          </div>
          <div className="rounded-card border border-sky-line bg-paper p-6 shadow-soft md:p-10 lg:col-span-8">
            <LeadForm />
          </div>
        </div>
      </Section>
    </>
  );
}
