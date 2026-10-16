import Image from "next/image";
import type { Img } from "@/lib/site";

/**
 * <LidViewerSlot/> is the slot for the rotatable 3D lid viewer (task 5, owner: threed-dev).
 * Contract: a square-ish area; the canvas is aria-hidden and lazy; this static render stays as the fallback.
 *
 * PLACEHOLDER: a static render of the lid.
 */
export function LidViewerSlot({ img, alt }: { img: Img; alt: string }) {
  return (
    <div data-slot="lid-viewer" className="relative mx-auto aspect-square w-full max-w-[30rem]">
      <div aria-hidden="true" className="lid-disc absolute inset-0" />
      <div aria-hidden="true" className="absolute inset-x-[16%] bottom-[16%] h-[8%] rounded-lid bg-ink-950/25 blur-xl" />
      <Image
        src={img.src}
        width={img.width}
        height={img.height}
        alt={alt}
        priority
        sizes="(min-width: 1024px) 30rem, 80vw"
        className="absolute left-1/2 top-1/2 w-[88%] -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_22px_26px_rgba(15,27,42,0.22)]"
        data-drift="5"
      />
    </div>
  );
}
