import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { Link as IntlLink } from "@/i18n/navigation";
import { cx } from "@/lib/cx";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";
/** Forces a visual state in the styleguide only. Real pages never pass it. */
export type ForcedState = "hover" | "focus";

type Shared = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  forcedState?: ForcedState;
  children: ReactNode;
};

function classes(variant: ButtonVariant, size: ButtonSize, extra?: string) {
  return cx("btn", `btn--${variant}`, size !== "md" && `btn--${size}`, extra);
}

type ButtonProps = Shared &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
    /** Shows a spinner, sets aria-busy and blocks activation. Pair with a visible text label. */
    loading?: boolean;
  };

export function Button({
  variant = "primary",
  size = "md",
  forcedState,
  loading = false,
  className,
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      type={loading ? "button" : type}
      className={classes(variant, size, className)}
      data-state={forcedState}
      aria-busy={loading || undefined}
      aria-disabled={loading || undefined}
    >
      {loading ? <span className="btn__spinner" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}

type ButtonLinkProps = Shared & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children" | "href"> & { href: string };

const EXTERNAL = /^(https?:|tel:|mailto:|#)/;

/** Link styled as a button. Internal paths keep the locale prefix through next-intl. */
export function ButtonLink({
  variant = "primary",
  size = "md",
  forcedState,
  className,
  children,
  href,
  ...rest
}: ButtonLinkProps) {
  const cls = classes(variant, size, className);
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
