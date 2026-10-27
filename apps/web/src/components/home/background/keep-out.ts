/*
 * Keep-out zones for the background lids: the line boxes of the page's text (headings, copy, links,
 * buttons, table cells), so a lid never sits under words. Line boxes, not element boxes: a short heading
 * leaves the space beside it free. Rects are kept in document coordinates and re-measured after layout
 * changes (resize, body size, fonts) and when scrolling settles (sticky elements move); per frame they are
 * only shifted by the scroll position.
 */

export type KeepOut = {
  /** Distance in px from a circle (viewport px) to the nearest text rect; < 0 = overlapping. */
  gap: (cx: number, cy: number, r: number) => number;
  /** Call once per frame before gap(): picks the rects near the viewport. */
  frame: (viewportH: number) => void;
  dispose: () => void;
};

type Rect = { x0: number; y0: number; x1: number; y1: number };

/** Text that is never over the lids: the hero has its own stage, the sticky header its own ground. */
const SKIP = "[data-living-bg], #hero, .site-header, script, style, noscript, template";

export function createKeepOut(root: HTMLElement = document.body): KeepOut {
  let rects: Rect[] = [];
  let near: Rect[] = [];
  let timer = 0;
  let scrolling = 0;

  const collect = () => {
    timer = 0;
    const out: Rect[] = [];
    const sy = window.scrollY;
    const sx = window.scrollX;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(n) {
        if (!n.nodeValue || !n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        const el = n.parentElement;
        if (!el || el.closest(SKIP)) return NodeFilter.FILTER_REJECT;
        // visibility: hidden text has boxes but no words on screen
        if (el.checkVisibility && !el.checkVisibility({ checkVisibilityCSS: true, visibilityProperty: true })) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    const range = document.createRange();
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      range.selectNodeContents(n);
      const list = range.getClientRects();
      for (let i = 0; i < list.length; i++) {
        const q = list[i]!;
        if (q.width < 1 || q.height < 1) continue;
        out.push({ x0: q.left + sx, y0: q.top + sy, x1: q.right + sx, y1: q.bottom + sy });
      }
    }
    range.detach();
    out.sort((a, b) => a.y0 - b.y0);
    rects = out;
  };
  const later = (ms: number) => {
    if (timer) clearTimeout(timer);
    timer = window.setTimeout(collect, ms);
  };
  const onScroll = () => {
    // sticky blocks (e.g. stacked cards) move while scrolling: re-measure once it settles
    if (scrolling) clearTimeout(scrolling);
    scrolling = window.setTimeout(() => {
      scrolling = 0;
      collect();
    }, 180);
  };

  const onResize = () => later(120);
  const ro = new ResizeObserver(onResize);
  ro.observe(root);
  window.addEventListener("resize", onResize);
  window.addEventListener("scroll", onScroll, { passive: true });
  void document.fonts?.ready.then(() => later(0));
  collect();

  let sy = 0;
  return {
    frame(viewportH) {
      sy = window.scrollY;
      const top = sy - 200;
      const bottom = sy + viewportH + 200;
      near = [];
      for (const q of rects) {
        if (q.y0 > bottom) break;
        if (q.y1 >= top) near.push(q);
      }
    },
    gap(cx, cy, r) {
      const x = cx + window.scrollX;
      const y = cy + sy;
      let best = Infinity;
      for (const q of near) {
        const dx = Math.max(q.x0 - x, 0, x - q.x1);
        const dy = Math.max(q.y0 - y, 0, y - q.y1);
        const d = Math.hypot(dx, dy) - r;
        if (d < best) best = d;
        if (best < 0) break;
      }
      return best;
    },
    dispose() {
      ro.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      if (timer) clearTimeout(timer);
      if (scrolling) clearTimeout(scrolling);
      rects = [];
      near = [];
    },
  };
}
