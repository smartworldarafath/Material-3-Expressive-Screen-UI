import { describe, it, expect } from "vitest";

import { isHex } from "./color";

describe("isHex", () => {
  it("accepts a six-digit hex color with a leading #", () => {
    expect(isHex("#6750A4")).toBe(true);
    expect(isHex("#ff0088")).toBe(true);
  });

  it("rejects shorthand, missing #, and non-hex input", () => {
    expect(isHex("#fff")).toBe(false);
    expect(isHex("6750A4")).toBe(false);
    expect(isHex("#GGGGGG")).toBe(false);
  });
});
