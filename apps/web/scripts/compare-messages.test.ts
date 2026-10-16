import { describe, expect, it } from "vitest";
import { compareMessages, flattenKeys } from "./compare-messages.mjs";

describe("compareMessages", () => {
  it("flattens nested keys", () => {
    expect(flattenKeys({ a: { b: "x" }, c: "y" })).toEqual(["a.b", "c"]);
  });

  it("returns no problems for equal key sets", () => {
    expect(
      compareMessages({ ru: { a: { b: "1" } }, uz: { a: { b: "2" } }, en: { a: { b: "3" } } }),
    ).toEqual([]);
  });

  it("reports keys missing in a locale", () => {
    const problems = compareMessages({ ru: { a: "1", b: "2" }, uz: { a: "1" }, en: { a: "1", b: "2" } });
    expect(problems).toEqual(['uz: missing key "b"']);
  });
});
