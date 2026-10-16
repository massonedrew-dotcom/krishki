import type { AnchorHTMLAttributes } from "react";
import { Link as IntlLink } from "@/i18n/navigation";
import { cx } from "@/lib/cx";
import type { ForcedState } from "./button";

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
  forcedState?: ForcedState;
};

const EXTERNAL = /^(https?:|tel:|mailto:|#)/;

/** Text link. Internal paths go through next-intl so the locale prefix is kept. */
export function TextLink({ href, forcedState, className, children, ...rest }: Props) {
  const cls = cx("link", className);
  if (EXTERNAL.test(href)) {
    return (
      <a {...rest} href={href} className={cls} data-state={forcedState}>
        {children}
      </a>
    );
  }
  return (
    <IntlLink {...rest} href={href} className={cls} data-state={forcedState}>
      {children}
    </IntlLink>
  );
}
