import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PRIMARY_PHONE, TELEGRAM, WHATSAPP } from "@/lib/contacts";
import { LOGO, NAV } from "@/lib/site";
import { ButtonLink } from "./button";
import { Container } from "./section";
import { LangSwitch } from "./lang-switch";
import { MainNav } from "./main-nav";
import { MobileMenu } from "./mobile-menu";

/** Utility bar + sticky main bar: logo, navigation, price CTA. Below 1320 px the navigation moves into the menu. */
export async function Header() {
  const t = await getTranslations("common");
  const items = NAV.map((n) => ({ href: n.href, label: t(`nav.${n.key}`) }));
  const locales = (["ru", "uz", "en"] as const).map((code) => ({
    code,
    short: t(`lang.${code}.short`),
    name: t(`lang.${code}.name`),
  }));
  const phoneLabel = t("header.phoneLabel", { phone: PRIMARY_PHONE.display });

  return (
    <>
      <div className="topbar hidden md:block">
        <Container className="flex min-h-10 items-center justify-between gap-6 py-1">
          <p className="max-w-none text-14 text-[#cfe6f5]">{t("header.topTag")}</p>
          <div className="flex items-center gap-6">
            <a
              href={PRIMARY_PHONE.href}
              className="tnum inline-flex min-h-8 items-center whitespace-nowrap font-medium"
              aria-label={phoneLabel}
            >
              {PRIMARY_PHONE.display}
            </a>
            <a href={WHATSAPP.href} className="inline-flex min-h-8 items-center">
              {t("contacts.whatsapp")}
            </a>
            <a href={TELEGRAM.href} className="inline-flex min-h-8 items-center">
              {t("contacts.telegram")}
            </a>
            <LangSwitch label={t("lang.label")} locales={locales} />
          </div>
        </Container>
      </div>
      <header className="site-header">
        <Container className="flex h-[var(--header-h)] items-center gap-4 md:gap-8">
          <Link href="/" aria-label={t("header.homeLabel")} className="flex shrink-0 items-center gap-3 no-underline">
            {/* TODO(client): replace the raster logo with a vector file when it arrives. */}
            <Image
              src={LOGO.src}
              width={LOGO.width}
              height={LOGO.height}
              alt=""
              priority
              sizes="72px"
              className="h-9 w-auto md:h-11"
            />
            <span className="hidden font-display text-18 font-semibold sm:inline tracking-tight text-ink-950 md:text-22">
              {t("brand")}
            </span>
          </Link>
          <MainNav items={items} label={t("nav.mainLabel")} className="ml-auto hidden nav:block" listClassName="gap-5" />
          <ButtonLink href="/contacts#lead-form" size="sm" className="hidden nav:inline-flex">
            {t("cta.requestPrice")}
          </ButtonLink>
          <div className="ml-auto flex items-center gap-1 sm:gap-2 nav:hidden">
            <a href={PRIMARY_PHONE.href} className="btn btn--secondary btn--sm header-call" aria-label={phoneLabel}>
              {t("cta.call")}
            </a>
            <MobileMenu openLabel={t("nav.menuOpen")} closeLabel={t("nav.menuClose")}>
              <MainNav items={items} label={t("nav.mainLabel")} listClassName="flex-col" />
              <div className="mt-8 grid gap-4">
                <ButtonLink href="/contacts#lead-form" size="lg">
                  {t("cta.requestPrice")}
                </ButtonLink>
                <a
                  href={PRIMARY_PHONE.href}
                  className="tnum inline-flex min-h-11 items-center text-22 font-semibold text-ink-950 no-underline"
                  aria-label={phoneLabel}
                >
                  {PRIMARY_PHONE.display}
                </a>
                <div className="flex gap-6">
                  <a href={WHATSAPP.href} className="link inline-flex min-h-11 items-center">
                    {t("contacts.whatsapp")}
                  </a>
                  <a href={TELEGRAM.href} className="link inline-flex min-h-11 items-center">
                    {t("contacts.telegram")}
                  </a>
                </div>
                <LangSwitch preview label={t("lang.label")} locales={locales} />
              </div>
            </MobileMenu>
          </div>
        </Container>
      </header>
    </>
  );
}
