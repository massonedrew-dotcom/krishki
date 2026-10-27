import { describe, expect, it } from "vitest";
import { activeStep, STEP_COUNT, stepAnchor, stepLocal, stepPos } from "./steps";

describe("hero steps mapping", () => {
  it("starts on the SKO and ends on the ring", () => {
    expect(stepPos(0)).toBe(0);
    expect(stepPos(1)).toBeCloseTo(STEP_COUNT - 1, 5);
    expect(activeStep(0)).toBe(0);
    expect(activeStep(1)).toBe(STEP_COUNT - 1);
  });

  it("never turns backwards while scrolling down", () => {
    let prev = -1;
    for (let i = 0; i <= 300; i++) {
      const pos = stepPos(i / 300);
      expect(pos).toBeGreaterThanOrEqual(prev - 1e-9);
      prev = pos;
    }
  });

  it("dwells on each product (the turntable rests between turns)", () => {
    expect(stepPos(0.15)).toBe(0);
    expect(stepPos(1.5 / 3)).toBe(1);
    expect(stepPos(0.95)).toBe(2);
  });

  it("each step button's anchor shows that step", () => {
    for (let i = 0; i < STEP_COUNT; i++) expect(activeStep(stepAnchor(i))).toBe(i);
  });

  it("clamps out-of-range progress", () => {
    expect(stepPos(-1)).toBe(0);
    expect(stepPos(2)).toBeCloseTo(STEP_COUNT - 1, 5);
    expect(stepLocal(0.5, 0)).toBe(1);
    expect(stepLocal(0, 1)).toBe(0);
  });
});
