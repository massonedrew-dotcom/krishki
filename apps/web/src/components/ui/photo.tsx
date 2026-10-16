import Image from "next/image";
import { cx } from "@/lib/cx";
import type { Img } from "@/lib/site";

type Props = {
  img: Img;
  alt: string;
  sizes: string;
  className?: string;
  /** Aspect ratio of the frame, e.g. "4 / 3", or "fill" to stretch to the parent. Defaults to the image's own. */
  ratio?: string;
  card?: boolean;
  priority?: boolean;
  parallax?: boolean;
  /** Fit the picture inside the frame instead of cropping (packshots). */
  contain?: boolean;
  imgClassName?: string;
};

/** Rounded media frame around next/image. Parallax is applied by the GSAP engine on [data-parallax]. */
export function Photo({ img, alt, sizes, className, ratio, card, priority, parallax, contain, imgClassName }: Props) {
  return (
    <div
      className={cx("frame", card && "frame--card", ratio === "fill" && "frame--fill", className)}
      style={ratio === "fill" ? undefined : { aspectRatio: ratio ?? `${img.width} / ${img.height}` }}
      data-parallax-wrap={parallax ? "" : undefined}
    >
      <Image
        src={img.src}
        width={img.width}
        height={img.height}
        alt={alt}
        sizes={sizes}
        priority={priority}
        className={cx(contain && "!object-contain", imgClassName)}
        data-parallax={parallax ? "0.1" : undefined}
      />
    </div>
  );
}
