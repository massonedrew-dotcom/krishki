import type { ReactNode } from "react";
import { Container, Eyebrow } from "@/components/ui/section";
import { SplitText } from "@/components/ui/split-text";
import { cx } from "@/lib/cx";

type Props = {
  eyebrow: string;
  title: string;
  lead?: string;
  /** Buttons under the lead. */
  actions?: ReactNode;
  /** Right-hand media column. */
  media?: ReactNode;
  className?: string;
};

/** Inner-page hero: mist surface, oversized kinetic title, compact (max 60vh) with optional media. */
export function PageHero({ eyebrow, title, lead, actions, media, className }: Props) {
  return (
    <section className={cx("surface-mist relative overflow-hidden lg:max-h-[60vh]", className)}>
      <Container className="relative grid items-end gap-10 pb-10 pt-10 md:pb-14 md:pt-14 lg:grid-cols-12 lg:gap-x-10">
        <div className={media ? "lg:col-span-7" : "lg:col-span-9"}>
          <Eyebrow>{eyebrow}</Eyebrow>
          <SplitText as="h1" hero className="text-64" text={title} />
          {lead ? (
            <p className="mt-6 max-w-[34rem] text-18 text-ink-700 md:mt-8 md:text-22" data-hero-fade style={{ "--d": 200 } as React.CSSProperties}>
              {lead}
            </p>
          ) : null}
          {actions ? (
            <div className="mt-8 flex flex-wrap gap-3" data-hero-fade style={{ "--d": 320 } as React.CSSProperties}>
              {actions}
            </div>
          ) : null}
        </div>
        {media ? (
          <div className="mx-auto w-full max-w-[22rem] lg:col-span-5 lg:max-w-[20rem] lg:justify-self-end" data-hero-fade style={{ "--d": 260 } as React.CSSProperties}>
            {media}
          </div>
        ) : null}
      </Container>
    </section>
  );
}
