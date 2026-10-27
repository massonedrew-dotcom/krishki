"use client";

import { useEffect, useState } from "react";
import { LivingBackground, type TierOverride } from "@/components/home/background";
import { HeroLidSlot } from "@/components/home/hero-lid";

const SECTIONS = [
  { id: "hero", h: "300vh", label: "hero: dark stage, scroll turns the lid" },
  { id: "products", h: "160vh", label: "products: the three come forward" },
  { id: undefined, h: "90vh", label: "(no id) gentle drift" },
  { id: "factory", h: "170vh", label: "factory: lids line up like a production line" },
  { id: undefined, h: "90vh", label: "(no id) gentle drift" },
  { id: "order", h: "150vh", label: "order: they settle" },
] as const;

// the hero pattern for page.tsx: dark CSS ground for the first paint / fallback, handed to the canvas when live
const HERO_CSS = `
  #hero { background: #110f0c; }
  html[data-hero-lid="live"] #hero { background: transparent; }
`;

const TIERS: readonly TierOverride[] = ["auto", "desktop", "mobile", "static"];

export function BgDemo() {
  const [opts, setOpts] = useState<{ tier: TierOverride; bare: boolean; debug: boolean; compare: boolean } | null>(null);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const t = q.get("tier") as TierOverride | null;
    setOpts({ tier: t && TIERS.includes(t) ? t : "auto", bare: q.get("bare") === "1", debug: q.get("debug") !== "0", compare: q.get("compare") === "1" });
  }, []);

  if (!opts) return null;
  if (opts.compare) {
    // QA: an 800 px square slot at the top-left, nothing else (window.__heroLid.compare poses the lid)
    return (
      <>
        <LivingBackground tier={opts.tier === "auto" ? "desktop" : opts.tier} debug />
        <div style={{ width: 800, height: 800 }}>
          <HeroLidSlot alts={["SKO I-82 lid", "Twist-Off 82 lid", "Wikel ring"]} sizes="800px" />
        </div>
      </>
    );
  }
  return (
    <>
      {/* bare = background only (used to render the static frames): no hero lid in them */}
      <LivingBackground tier={opts.tier} debug={opts.debug} heroLid={opts.bare ? null : undefined} />
      <style>{HERO_CSS}</style>
      <main style={{ visibility: opts.bare ? "hidden" : undefined }}>
        {SECTIONS.map((s, i) => (
          <section
            key={i}
            id={s.id}
            data-demo-section={s.id ?? "gap"}
            style={{ minHeight: s.h, padding: "12vh 6vw", display: "flex", flexWrap: "wrap", gap: 32, alignItems: "flex-start" }}
          >
            <div
              style={{
                maxWidth: 560,
                padding: "28px 32px",
                borderRadius: 16,
                background: i % 2 ? "rgb(255 255 255 / 0.72)" : "#ffffff",
                backdropFilter: i % 2 ? "blur(14px)" : undefined,
                boxShadow: "0 1px 2px rgb(15 27 42 / 0.06), 0 14px 32px -12px rgb(15 27 42 / 0.16)",
              }}
            >
              <p style={{ font: "500 12px/1.4 var(--font-mono-stack)", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-500)" }}>
                #{s.id ?? "—"} · {i % 2 ? "frosted panel" : "white panel"}
              </p>
              <h2 style={{ font: "700 36px/1.15 var(--font-display-stack)", color: "var(--ink-950)", margin: "8px 0 12px" }}>{s.label}</h2>
              <p style={{ color: "var(--ink-700)" }}>
                Dummy copy for contrast checks on top of the living background. Tier: {opts.tier}.
              </p>
            </div>
            {s.id === "hero" ? (
              <div style={{ position: "sticky", top: "14vh", width: "min(40vw, 560px)", minWidth: 280, marginLeft: "auto", marginRight: "4vw" }}>
                <HeroLidSlot alts={["SKO I-82 lid", "Twist-Off 82 lid", "Wikel ring"]} />
              </div>
            ) : null}
          </section>
        ))}
      </main>
    </>
  );
}
