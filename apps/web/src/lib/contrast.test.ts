import { describe, expect, it } from "vitest";
import { contrastRatio } from "./contrast";

describe("contrastRatio", () => {
  it("is 21 for black on white", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 1);
  });
  it("is symmetric", () => {
    expect(contrastRatio("#0f1b2a", "#c8962e")).toBeCloseTo(contrastRatio("#c8962e", "#0f1b2a"), 5);
  });
  it("keeps v2 brand text pairs at AA (4.5)", () => {
    const pairs: [string, string][] = [
      ["#0f1b2a", "#ffffff"], // ink on white
      ["#0f1b2a", "#eaf4fb"], // ink on sky
      ["#566b80", "#ffffff"], // muted on white
      ["#566b80", "#eaf4fb"], // muted on sky
      ["#0e5e9c", "#ffffff"], // link on white
      ["#0e5e9c", "#eaf4fb"], // link on sky
      ["#ffffff", "#d61f29"], // CTA label on red
      ["#ffffff", "#0e5e9c"], // text on the azure band
      ["#cfe6f5", "#0e5e9c"], // muted text on the azure band
      ["#ffffff", "#0a3f6b"], // top bar
      ["#7a5a12", "#ffffff"], // gold text on white
    ];
    for (const [fg, bg] of pairs) expect(contrastRatio(fg, bg), `${fg} on ${bg}`).toBeGreaterThan(4.5);
  });
  it("keeps control borders at 3:1", () => {
    expect(contrastRatio("#6f8499", "#ffffff")).toBeGreaterThan(3);
  });
});
