import type { ElementType } from "react";
import { cx } from "@/lib/cx";

type Props = {
  text: string;
  as?: ElementType;
  className?: string;
  id?: string;
  /** Above the fold: pure-CSS reveal on load, no JavaScript needed. Otherwise GSAP reveals it on scroll. */
  hero?: boolean;
};

/**
 * Kinetic text without SplitText: words are wrapped on the server, so the heading is plain, indexable text.
 * The reveal itself is CSS (hero) or GSAP ScrollTrigger (everything else), see motion-engine.ts.
 */
export function SplitText({ text, as: Tag = "span", className, id, hero = false }: Props) {
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <Tag id={id} className={cx("split", className)} data-split data-hero={hero ? "" : undefined}>
      {words.map((word, i) => (
        <span key={`${word}-${i}`}>
          <span className="w">
            <span style={{ "--i": i } as React.CSSProperties}>{word}</span>
          </span>
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </Tag>
  );
}
