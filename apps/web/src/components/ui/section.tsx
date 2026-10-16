import type { ElementType, ReactNode } from "react";
import { cx } from "@/lib/cx";

type ContainerProps = { as?: ElementType; className?: string; children: ReactNode };

/** Page-width wrapper: max 1440, side padding 16 / 32 / 48. */
export function Container({ as: Tag = "div", className, children }: ContainerProps) {
  return (
    <Tag className={cx("mx-auto w-full max-w-[var(--container-max)] px-[var(--page-x)]", className)}>
      {children}
    </Tag>
  );
}

export type Tone = "white" | "mist" | "sky" | "azure";

type SectionProps = {
  tone?: Tone;
  /** Id of the heading inside, used as aria-labelledby. */
  labelledBy?: string;
  id?: string;
  className?: string;
  /** Skip the vertical padding (hero, full-bleed media). */
  flush?: boolean;
  children: ReactNode;
};

/** Vertical rhythm block. Tones alternate white / mist / sky; azure is the one deep band per page. */
export function Section({ tone = "white", labelledBy, id, className, flush = false, children }: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cx(`surface-${tone}`, tone === "azure" && "grain", !flush && "py-[var(--section-y)]", className)}
    >
      <Container>{children}</Container>
    </section>
  );
}

/** Mono eyebrow above a heading. */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cx("caption mb-4 flex items-center gap-3", className)}>
      <span aria-hidden="true" className="h-px w-8 bg-current opacity-60" />
      {children}
    </p>
  );
}
