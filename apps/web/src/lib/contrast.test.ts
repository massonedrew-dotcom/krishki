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
  it("keeps v4 light brand text pairs at AA (4.5)", () => {
    const pairs: [string, string][] = [
      ["#0b2545", "#f7fafd"], // ink on the page ground
      ["#33506f", "#f7fafd"], // muted on the page ground
      ["#33506f", "#dcedf9"], // muted on the sky band
      ["#33506f", "#eaf5fd"], // muted on the hero stage
      ["#0067a6", "#ffffff"], // link and primary button
      ["#ffffff", "#0067a6"], // primary button label
      ["#ffffff", "#d3131b"], // «Заказать» label on red
      ["#d3131b", "#eaf5fd"], // red accent text on the hero stage
      ["#8a5d00", "#ffffff"], // yellow-family text on white
      ["#ffffff", "#004f82"], // text on the blue band
      ["#d9edfa", "#004f82"], // muted text on the blue band
      ["#ffd54a", "#004f82"], // yellow numbers on the blue band
      ["#0b2545", "#ffc20e"], // ink on a yellow button
    ];
    for (const [fg, bg] of pairs) expect(contrastRatio(fg, bg), `${fg} on ${bg}`).toBeGreaterThan(4.5);
  });
  it("keeps v4 control borders at 3:1", () => {
    expect(contrastRatio("#5d7b98", "#ffffff")).toBeGreaterThan(3);
  });
  it("keeps control borders at 3:1", () => {
    expect(contrastRatio("#6f8499", "#ffffff")).toBeGreaterThan(3);
  });
});
