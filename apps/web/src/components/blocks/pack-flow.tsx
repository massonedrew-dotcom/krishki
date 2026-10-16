import { Photo } from "@/components/ui/photo";
import type { Img } from "@/lib/site";

type Props = {
  title: string;
  img?: Img;
  alt?: string;
  tube: { value: string; note: string };
  group?: { value: string; note: string };
};

/** Packaging as a flow: tube -> group pack. Big numerals carry the information. */
export function PackFlow({ title, img, alt, tube, group }: Props) {
  return (
    <article className="grid gap-8 rounded-card border border-sky-line bg-paper p-5 md:grid-cols-12 md:gap-10 md:p-8" data-reveal>
      {img ? (
        <div className="md:col-span-5">
          <Photo img={img} alt={alt ?? ""} sizes="(min-width: 768px) 40vw, 90vw" ratio="16 / 10" />
        </div>
      ) : null}
      <div className={img ? "md:col-span-7" : "md:col-span-12"}>
        <h3 className="text-28">{title}</h3>
        <div className="mt-6 grid gap-6 sm:grid-cols-[1fr_auto_1fr] sm:items-start">
          <div>
            <p className="tnum font-display text-64 font-semibold leading-none text-azure-700">{tube.value}</p>
            <p className="mt-3 text-16 text-ink-700">{tube.note}</p>
          </div>
          {group ? (
            <>
              <span aria-hidden="true" className="hidden self-center text-48 text-ink-300 sm:block">
                →
              </span>
              <div>
                <p className="tnum font-display text-64 font-semibold leading-none text-azure-700">{group.value}</p>
                <p className="mt-3 text-16 text-ink-700">{group.note}</p>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </article>
  );
}
