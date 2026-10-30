import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PRIMARY_PHONE } from "@/lib/contacts";
import { AUDIENCE_NAV, NAV, ORDER_HREF } from "@/lib/site";
import { ButtonLink } from "./button";
import { Container } from "./section";
import { LangSwitch } from "./lang-switch";
import { MainNav } from "./main-nav";
import { Wordmark } from "./wordmark";

/**
 * One sticky header, no burger (client, 27 Oct). From 1280 px a single row: logo, sections, audience buttons,
 * language, «Заказать». Below 1280 px the sticky logo row keeps «Заказать», and the sections and audience
 * pages sit as buttons in a row under it that scrolls sideways and scrolls away with the page.
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

  return (
    <>
    <header className="site-header">
      <Container className="flex h-[var(--header-h)] items-center gap-3 xl:gap-6">
        <Link href="/" aria-label={t("header.homeLabel")} className="flex min-h-11 shrink-0 items-center no-underline">
          <Wordmark className="text-[1.0625rem] md:text-[1.375rem]" />
        </Link>
        <MainNav items={items} label={t("nav.mainLabel")} className="hidden xl:block" listClassName="gap-0" />
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <a
            href={PRIMARY_PHONE.href}
            className="tnum hidden min-h-11 items-center whitespace-nowrap font-semibold text-ink-950 no-underline 2xl:inline-flex"
            aria-label={phoneLabel}
          >
            {PRIMARY_PHONE.display}
          </a>
          <MainNav
            items={audience}
            label={t("header.audienceLabel")}
            className="hidden xl:block"
            listClassName="gap-2"
            linkClassName="head-btn"
          />
          <div className="hidden md:block">
            <LangSwitch label={t("lang.label")} locales={locales} />
          </div>
          <ButtonLink href={ORDER_HREF} size="sm" variant="order" className="header-order">
            {t("nav.order")}
          </ButtonLink>
        </div>
      </Container>
    </header>
    {/* not sticky (client, 27 Oct): the button row scrolls away and only the logo row stays on top */}
    <div className="head-row xl:hidden">
      <Container className="head-row__track">
        <MainNav items={[...items, ...audience]} label={t("nav.mainLabel")} listClassName="gap-2" linkClassName="head-btn" />
        <div className="md:hidden">
          <LangSwitch preview label={t("lang.label")} locales={locales} />
        </div>
      </Container>
    </div>
    </>
  );
}
