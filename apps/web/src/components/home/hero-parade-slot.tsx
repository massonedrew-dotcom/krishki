import Image from "next/image";
import { PHOTO } from "@/lib/site";

/**
 * <HeroParadeSlot/> is the full-width slot for the 3D lid parade (task 5, owner: threed-dev).
 *
 * Contract for the replacement:
 * - below lg it is an in-flow block between the hero text and the specs; from lg up it fills the whole hero
 *   (absolute, inset 0) and sits behind the text column and the specs;
 * - the canvas must be aria-hidden, pointer-events none, lazy, with this static image as the no-WebGL
 *   and reduced-motion fallback;
 * - it must keep the hero LCP element light: the static render below stays server-rendered.
 *
 * PLACEHOLDER: a static render of the gold SKO I-82 lid.
 */
export function HeroParadeSlot({ alt, caption }: { alt: string; caption: string }) {
  return (
    <div data-slot="hero-parade" className="relative z-0 mx-auto w-full max-w-[34rem] lg:absolute lg:inset-0 lg:max-w-none">
      <figure className="relative mx-auto aspect-[3/2] w-[88%] lg:absolute lg:left-[2%] lg:top-1/2 lg:w-[min(36vw,34rem)] lg:-translate-y-[46%]">
        <div aria-hidden="true" className="lid-disc absolute left-1/2 top-1/2 w-[112%] -translate-x-1/2 -translate-y-1/2 opacity-80" />
        <div
          aria-hidden="true"
          className="absolute inset-x-[8%] bottom-[2%] h-[14%] rounded-lid bg-ink-950/25 blur-2xl"
        />
        <div className="relative h-full w-full" data-drift="7">
          <Image
            src={PHOTO.lidSko.src}
            width={PHOTO.lidSko.width}
            height={PHOTO.lidSko.height}
            alt={alt}
            priority
            sizes="(min-width: 1024px) 36vw, 88vw"
            className="h-full w-full object-contain drop-shadow-[0_24px_30px_rgba(15,27,42,0.22)]"
          />
        </div>
        <figcaption className="caption absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap">{caption}</figcaption>
      </figure>
    </div>
  );
}
