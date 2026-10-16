import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

type Props = { tone?: "outline" | "solid" | "accent"; children: ReactNode; className?: string };

/** Tag for facts and status ("SKO I-82", "ЭЖК"). Not interactive. */
export function Badge({ tone = "outline", children, className }: Props) {
  return <span className={cx("badge", tone !== "outline" && `badge--${tone}`, className)}>{children}</span>;
}
