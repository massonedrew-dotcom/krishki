import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PRIMARY_PHONE, TELEGRAM, WHATSAPP } from "@/lib/contacts";
import { AUDIENCE_NAV, LOGO, NAV, ORDER_HREF } from "@/lib/site";
import { ButtonLink } from "./button";
import { Container } from "./section";
import { LangSwitch } from "./lang-switch";
import { HeaderOrder, MainNav } from "./main-nav";
import { MobileMenu } from "./mobile-menu";

const TOPBAR_ID = "site-topbar";

/**
 * Two rows. Top row (from 1280 px): audience pages, «Заказать», phone, language. Main row (sticky): logo and
 * the main sections. Below 1280 px the top row lives in the sheet and «Заказать» sits next to the burger.
 */
export async function Header() {
  const t = await getTranslations("common");
  const items = NAV.map((n) => ({ href: n.href, label: t(`nav.${n.key}`) }));
  const audience = AUDIENCE_NAV.map((n) => ({ href: n.href, label: t(`nav.${n.key}`) }));
  const locales = (["ru", "uz", "en"] as const).map((code) => ({
    code,
    short: t(`lang.${code}.short`),
    name: t(`lang.${code}.name`),
  }));
  const phoneLabel = t("header.phoneLabel", { phone: PRIMARY_PHONE.display });
  const orderLabel = t("nav.order");

  return (
    <>
      <div id={TOPBAR_ID} className="topbar hidden xl:block">
        <Container className="flex h-11 items-center gap-6">
          <MainNav
            items={audience}
            label={t("header.audienceLabel")}
            className="h-full"
            listClassName="topbar__list"
            linkClassName="topbar__link"
          />
          <ButtonLink href={ORDER_HREF} size="sm" variant="order">
            {orderLabel}
          </ButtonLink>
          <span className="flex-1" aria-hidden="true" />
          <a href={TELEGRAM.href} className="topbar__plain">
            {t("contacts.telegram")}
          </a>
          <a href={WHATSAPP.href} className="topbar__plain">
            {t("contacts.whatsapp")}
          </a>
          <a href={PRIMARY_PHONE.href} className="topbar__plain tnum !text-[#e4e7ea]" aria-label={phoneLabel}>
            {PRIMARY_PHONE.display}
          </a>
          <LangSwitch label={t("lang.label")} locales={locales} />
        </Container>
      </div>
      <header className="site-header">
        <Container className="flex h-[var(--header-h)] items-center gap-3 xl:gap-8">
          <Link href="/" aria-label={t("header.homeLabel")} className="flex min-h-11 shrink-0 items-center gap-3 no-underline">
            {/* TODO(client): replace the raster logo with a vector file when it arrives. */}
            <Image
              src={LOGO.src}
              width={LOGO.width}
              height={LOGO.height}
              alt=""
              priority
              sizes="120px"
              className="h-9 w-auto md:h-14"
            />
            <span className="hidden border-l border-sky-line pl-4 font-display text-14 font-semibold tracking-[0.16em] text-ink-700 sm:inline">
              {t("brand")}
            </span>
          </Link>
          <MainNav items={items} label={t("nav.mainLabel")} className="hidden xl:block" listClassName="gap-1" />
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <HeaderOrder href={ORDER_HREF} label={orderLabel} topbarId={TOPBAR_ID} />
            <MobileMenu openLabel={t("nav.menuOpen")} closeLabel={t("nav.menuClose")}>
              <MainNav items={items} label={t("nav.mainLabel")} listClassName="flex-col" />
              <MainNav
                items={audience}
                label={t("header.audienceLabel")}
                className="mt-6"
                listClassName="flex-col"
                linkClassName="nav__link nav__link--sub"
              />
              <div className="mt-8 grid gap-4">
                <ButtonLink href={ORDER_HREF} size="lg" variant="order">
                  {orderLabel}
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
