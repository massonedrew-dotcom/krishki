import { Eyebrow } from "@/components/ui/section";
import { SplitText } from "@/components/ui/split-text";
import { cx } from "@/lib/cx";

type Props = {
  eyebrow?: string;
  title: string;
  lead?: string;
  id?: string;
  className?: string;
  size?: "lg" | "md";
};

/** Section heading: mono eyebrow, kinetic title, optional lead. */
export function SectionHead({ eyebrow, title, lead, id, className, size = "lg" }: Props) {
  return (
    <div className={cx("max-w-[52rem]", className)}>
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <SplitText as="h2" id={id} className={size === "lg" ? "text-64" : "text-48"} text={title} />
      {lead ? (
        <p className="mt-5 text-18 text-fg-muted md:text-22" data-reveal>
          {lead}
        </p>
      ) : null}
    </div>
  );
}
