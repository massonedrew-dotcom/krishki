import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MOODS, type Mood, type SectionIds } from "./types";

/** Scroll range of the hero sequence: ScrollTrigger start/end on the hero section (or up to endTrigger). */
export type HeroScroll = { start?: string; end?: string; endTrigger?: string };

/** Hero sequence progress 0 … 1 over the hero range (scrub; the frame loop smooths it). */
export function bindHeroScroll(heroId: string | undefined, cfg: HeroScroll, out: { hero: number }): () => void {
  gsap.registerPlugin(ScrollTrigger);
  const el = heroId ? document.getElementById(heroId) : null;
  if (!el) return () => {};
  const endEl = cfg.endTrigger ? document.getElementById(cfg.endTrigger) : null;
  const st = ScrollTrigger.create({
    trigger: el,
    endTrigger: endEl ?? el,
    start: cfg.start ?? "top top",
    // ends when the hero's bottom meets the viewport's: a sticky slot is still fully in view
    end: cfg.end ?? "bottom bottom",
    onUpdate: (self) => {
      out.hero = self.progress;
    },
  });
  out.hero = st.progress;
  return () => st.kill();
}

export type ScrollState = {
  /** Mood the lids are heading to. "hero" doubles as the gentle drift between and outside sections. */
  mood: Mood;
  /** Page scroll progress 0 … 1. */
  progress: number;
  /** Moods whose element was found on the page (for the debug API). */
  bound: Mood[];
};

/**
 * Binds the moods to the page sections with ScrollTrigger. A section is active while it crosses the
 * middle band of the viewport; outside every section (or when no id is found) the lids drift.
 * Returns a cleanup that kills only the triggers created here.
 */
export function bindScrollMoods(sections: SectionIds, state: ScrollState): () => void {
  gsap.registerPlugin(ScrollTrigger);
  const triggers: ScrollTrigger[] = [];
  const active: Mood[] = [];
  const pick = () => {
    state.mood = active[active.length - 1] ?? "hero";
  };

  const page = ScrollTrigger.create({
    start: 0,
    end: "max",
    onUpdate: (self) => {
      state.progress = self.progress;
    },
  });
  triggers.push(page);
  state.progress = page.progress;

  state.bound = [];
  for (const mood of MOODS) {
    const id = sections[mood];
    const el = id ? document.getElementById(id) : null;
    if (!el) continue;
    state.bound.push(mood);
    triggers.push(
      ScrollTrigger.create({
        trigger: el,
        start: "top 60%",
        // the order block sits at the foot of the page: keep the lids settled down to the footer
        end: mood === "order" ? "bottom top" : "bottom 40%",
        onToggle: (self) => {
          const at = active.indexOf(mood);
          if (at >= 0) active.splice(at, 1);
          if (self.isActive) active.push(mood);
          pick();
        },
      }),
    );
  }

  // state at mount (the page may be restored mid-scroll)
  active.length = 0;
  for (const t of triggers.slice(1)) {
    const mood = state.bound[triggers.indexOf(t) - 1];
    if (t.isActive && mood) active.push(mood);
  }
  pick();

  return () => {
    for (const t of triggers) t.kill();
  };
}
