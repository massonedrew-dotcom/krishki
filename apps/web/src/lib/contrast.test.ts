import { describe, expect, it } from "vitest";
import { contrastRatio } from "./contrast";

describe("contrastRatio", () => {
  it("is 21 for black on white", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 1);
  });
  it("is symmetric", () => {
    expect(contrastRatio("#0b0d10", "#c8962e")).toBeCloseTo(contrastRatio("#c8962e", "#0b0d10"), 5);
  });
  it("keeps brand text pairs at AA (4.5)", () => {
    expect(contrastRatio("#0b0d10", "#eef0f2")).toBeGreaterThan(4.5);
    expect(contrastRatio("#4a515b", "#eef0f2")).toBeGreaterThan(4.5);
    expect(contrastRatio("#0b0d10", "#c8962e")).toBeGreaterThan(4.5);
    expect(contrastRatio("#7a5a12", "#eef0f2")).toBeGreaterThan(4.5);
    expect(contrastRatio("#a3a9b1", "#1a1e24")).toBeGreaterThan(4.5);
  });
});
