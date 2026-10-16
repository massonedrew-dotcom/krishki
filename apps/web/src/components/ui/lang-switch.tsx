"use client";

import { useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

type Props = {
  label: string;
  /** Render as a plain group instead of a nav landmark. */
  preview?: boolean;
  locales: { code: "ru" | "uz" | "en"; short: string; name: string }[];
};

/** Language switch. Client component only because it needs the current pathname. */
export function LangSwitch({ label, locales, preview = false }: Props) {
  const current = useLocale();
  const pathname = usePathname();

  const Wrapper = preview ? "div" : "nav";

  return (
    <Wrapper aria-label={label} className="lang" role={preview ? "group" : undefined}>
      {locales.map((l) => (
        <Link
          key={l.code}
          href={pathname}
          locale={l.code}
          lang={l.code}
          hrefLang={l.code}
          className="lang__item"
          aria-current={l.code === current ? "true" : undefined}
          title={l.name}
        >
          <span>{l.short}</span>
          <span className="sr-only">{l.name}</span>
        </Link>
      ))}
    </Wrapper>
  );
}
