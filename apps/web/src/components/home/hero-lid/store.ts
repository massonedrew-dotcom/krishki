/*
 * Tiny shared state between the hero slot (DOM: photo, drag input) and the hero-lid pass that the
 * living background renders into the slot's rect. No React state per frame: the pass reads the
 * drag numbers directly; only `live` is subscribed to (the photo fades out once the 3D lid draws).
 */

type Listener = () => void;

const listeners = new Set<Listener>();
let live = false;

export const heroLidDrag = {
  /** Accumulated yaw from mouse drags, radians. */
  yaw: 0,
  /** Current pitch offset while dragging, radians; the pass springs it back to 0 on release. */
  pitch: 0,
  active: false,
};

export const heroLidLive = {
  get: () => live,
  set(next: boolean) {
    if (next === live) return;
    live = next;
    // page CSS hook: while live, the canvas paints the hero's dark stage, so the hero section drops its
    // own background, e.g. html[data-hero-lid="live"] #hero { background: transparent; }
    if (next) document.documentElement.dataset.heroLid = "live";
    else delete document.documentElement.dataset.heroLid;
    listeners.forEach((l) => l());
  },
  subscribe(l: Listener) {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
};

/** Default id of the hero slot element that the background tracks. */
export const HERO_LID_ID = "hero-lid";
