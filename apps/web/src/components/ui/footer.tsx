import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { EMAIL, FACEBOOK, INSTAGRAM, MAP_URL, PHONES, TELEGRAM, WHATSAPP } from "@/lib/contacts";
import { LOGO, NAV } from "@/lib/site";
import { Container } from "./section";

/** Footer on the mist surface: company, navigation, contacts, socials, copyright. */
export async function Footer() {
  const t = await getTranslations("common");
  const socials = [
    { label: t("contacts.whatsapp"), href: WHATSAPP.href },
    { label: t("contacts.telegram"), href: TELEGRAM.href },
    { label: t("contacts.instagram"), href: INSTAGRAM.href },
    { label: t("contacts.facebook"), href: FACEBOOK.href },
  ];

  return (
    <footer className="surface-mist border-t border-sky-line">
      <Container className="grid gap-12 py-16 md:grid-cols-12 md:gap-x-8 md:py-24">
        <div className="md:col-span-4">
          <div className="flex items-center gap-3">
            <Image src={LOGO.src} width={LOGO.width} height={LOGO.height} alt="" sizes="96px" className="h-12 w-auto" />
            <p className="font-display text-28 font-semibold">{t("brand")}</p>
          </div>
          <p className="mt-4 text-fg-muted">{t("footer.since")}</p>
          <p className="caption mt-6">{t("footer.brands")}</p>
        </div>
        <nav className="md:col-span-2" aria-label={t("footer.navTitle")}>
          <h2 className="caption">{t("footer.navTitle")}</h2>
          <ul className="mt-3 grid gap-0.5">
            {NAV.map((n) => (
              <li key={n.key}>
                <Link
                  href={n.href}
                  className="inline-flex min-h-11 items-center text-ink-950 no-underline hover:underline"
                >
                  {t(`nav.${n.key}`)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="md:col-span-3">
          <h2 className="caption">{t("footer.contactsTitle")}</h2>
          <ul className="tnum mt-3 grid gap-0.5">
            {PHONES.map((p) => (
              <li key={p.href}>
                <a href={p.href} className="inline-flex min-h-11 items-center text-ink-950 no-underline hover:underline">
                  {p.display}
                </a>
              </li>
            ))}
            <li>
              <a href={`mailto:${EMAIL}`} className="link inline-flex min-h-11 items-center">
                {EMAIL}
              </a>
            </li>
          </ul>
        </div>
        <div className="md:col-span-3">
          <h2 className="caption">{t("footer.addressTitle")}</h2>
          <address className="mt-3 not-italic">{t("footer.address")}</address>
          <a href={MAP_URL} className="link mt-1 inline-flex min-h-11 items-center">
            {t("footer.map")}
          </a>
          <h2 className="caption mt-6">{t("footer.socialsTitle")}</h2>
          <ul className="mt-2 flex flex-wrap gap-x-5">
            {socials.map((s) => (
              <li key={s.href}>
                <a href={s.href} className="link inline-flex min-h-11 items-center">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-sky-line pt-6 md:col-span-12">
          <p className="tnum caption max-w-none">{t("footer.copyright")}</p>
          <Link href="/privacy" className="link inline-flex min-h-11 items-center text-14">
            {t("footer.privacy")}
          </Link>
        </div>
      </Container>
    </footer>
  );
}
