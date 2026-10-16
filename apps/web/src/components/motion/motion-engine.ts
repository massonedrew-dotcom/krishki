import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

/**
 * Loaded lazily by MotionRoot after the page is interactive (GSAP + ScrollTrigger + Lenis stay out of the
 * initial bundle). Everything here is progressive enhancement: the server markup is already complete.
 */
let lenis: Lenis | null = null;
let ctx: gsap.Context | null = null;
let ready = false;

function boot(): void {
  gsap.registerPlugin(ScrollTrigger);
  lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis?.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  ready = true;
}

/** (Re)build every scroll-driven effect for the current DOM. Called on load and after each route change. */
export function build(options: { navigated: boolean }): void {
  if (!ready) boot();
  ctx?.revert();
  if (options.navigated) lenis?.scrollTo(0, { immediate: true, force: true });

  ctx = gsap.context(() => {
    // Page scroll progress under the header.
    const bar = document.querySelector<HTMLElement>(".page-progress > span");
    if (bar) {
      gsap.to(bar, {
        scaleX: 1,
        ease: "none",
        scrollTrigger: { start: 0, end: "max", scrub: 0.2 },
      });
    }

    // Kinetic headings: words slide up out of their masks when the heading enters the viewport.
    document.querySelectorAll<HTMLElement>(".split:not([data-hero])").forEach((el) => {
      const words = el.querySelectorAll<HTMLElement>(".w > span");
      ScrollTrigger.create({
        trigger: el,
        start: "top 88%",
        once: true,
        onEnter: () => {
          el.classList.add("is-in");
          gsap.fromTo(words, { yPercent: 112 }, { yPercent: 0, duration: 1.05, ease: "expo.out", stagger: 0.05 });
        },
      });
    });

    // Block reveals, batched so neighbours enter as a staggered group.
    const blocks = gsap.utils.toArray<HTMLElement>("[data-reveal]");
    if (blocks.length > 0) {
      ScrollTrigger.batch(blocks, {
        start: "top 92%",
        once: true,
        onEnter: (els) => {
          els.forEach((e) => e.classList.add("is-in"));
          gsap.fromTo(
            els,
            { opacity: 0, y: 26 },
            { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.08, clearProps: "opacity,transform" },
          );
        },
      });
    }

    // Parallax inside rounded frames.
    document.querySelectorAll<HTMLElement>("[data-parallax]").forEach((img) => {
      const amount = Number(img.dataset.parallax ?? "0.1") * 50;
      gsap.fromTo(
        img,
        { yPercent: -amount },
        {
          yPercent: amount,
          ease: "none",
          scrollTrigger: { trigger: img.parentElement, start: "top bottom", end: "bottom top", scrub: true },
        },
      );
    });

    // Slow drift for hero objects.
    document.querySelectorAll<HTMLElement>("[data-drift]").forEach((el) => {
      const amount = Number(el.dataset.drift ?? "6");
      gsap.to(el, {
        yPercent: -amount,
        rotate: -amount / 3,
        ease: "none",
        scrollTrigger: { trigger: el.parentElement, start: "top top", end: "bottom top", scrub: true },
      });
    });

    // Vertical rails (timeline, process lists): the line fills as you read, dots light up in turn.
    document.querySelectorAll<HTMLElement>(".vrail").forEach((rail) => {
      const fill = rail.querySelector<HTMLElement>(".vrail__fill");
      if (fill) {
        gsap.to(fill, {
          scaleY: 1,
          ease: "none",
          scrollTrigger: { trigger: rail, start: "top 65%", end: "bottom 60%", scrub: true },
        });
      }
      rail.querySelectorAll<HTMLElement>(".vrail__item").forEach((item) => {
        ScrollTrigger.create({
          trigger: item,
          start: "top 62%",
          onEnter: () => item.classList.add("is-active"),
          onLeaveBack: () => item.classList.remove("is-active"),
        });
      });
    });
  });

  ScrollTrigger.refresh();
}
