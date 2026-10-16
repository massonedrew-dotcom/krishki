import { getTranslations } from "next-intl/server";
import { Container, Eyebrow } from "@/components/ui/section";
import { SplitText } from "@/components/ui/split-text";
import { PHONES, TELEGRAM, WHATSAPP } from "@/lib/contacts";
import { LeadForm, type LeadFormProps } from "./lead-form";

type Props = LeadFormProps & {
  /** Anchor id; the header CTA links to /contacts#lead-form. */
  id?: string;
};

/** Reusable closing block: the one deep azure band of a page, with the lead form on a white card. */
export async function LeadCta({ id = "lead-form", defaultDirection, defaultProduct }: Props) {
  const t = await getTranslations("form");
  const tc = await getTranslations("common");
  const primary = PHONES[0];

  return (
    <section id={id} aria-labelledby={`${id}-title`} className="surface-azure grain py-[var(--section-y)]">
      <Container className="grid gap-12 lg:grid-cols-12 lg:gap-x-10">
        <div className="lg:col-span-5">
          <Eyebrow>{t("eyebrow")}</Eyebrow>
          <SplitText as="h2" id={`${id}-title`} className="text-64" text={t("title")} />
          <p className="mt-6 text-18 text-fg-muted" data-reveal>
            {t("lead")}
          </p>
          <ul className="mt-8 grid gap-1 text-18" data-reveal>
            <li>
              <a href={primary.href} className="tnum inline-flex min-h-11 items-center font-semibold text-white">
                {primary.display}
              </a>
            </li>
            <li className="flex gap-6">
              <a href={WHATSAPP.href} className="link inline-flex min-h-11 items-center">
                {tc("contacts.whatsapp")}
              </a>
              <a href={TELEGRAM.href} className="link inline-flex min-h-11 items-center">
                {tc("contacts.telegram")}
              </a>
            </li>
          </ul>
        </div>
        <div className="surface-white rounded-card p-6 shadow-lift md:p-10 lg:col-span-7" data-reveal>
          <LeadForm defaultDirection={defaultDirection} defaultProduct={defaultProduct} />
        </div>
      </Container>
    </section>
  );
}
