import Image from "next/image";
import { LID_CUTOUT } from "@/lib/site";

/**
 * Centre of the home hero: the gold SKO I-82 as a static cutout on the dark stage.
 *
 * Contract for the 3D component (threed-dev, mounted by the lead after review):
 * - the root has `id="hero-lid-slot"` and `data-hero-lid-slot`; the 3D canvas takes over by rendering into
 *   (or over) this box, which keeps a fixed 1:1 aspect ratio, so nothing shifts when it swaps in;
 * - the cutout stays in the DOM as the LCP element and the no-WebGL / reduced-motion fallback;
 * - the canvas must be `aria-hidden`; the image carries the text alternative.
 */
export function HeroLidSlot({ alt }: { alt: string }) {
  return (
    <div id="hero-lid-slot" data-hero-lid-slot className="stage-lid">
      <Image
        src={LID_CUTOUT.sko34.src}
        width={LID_CUTOUT.sko34.width}
        height={LID_CUTOUT.sko34.height}
        alt={alt}
        priority
        sizes="(min-width: 1280px) 40vw, 90vw"
        className="stage-lid__img"
        data-hero-lid-fallback
      />
    </div>
  );
}
