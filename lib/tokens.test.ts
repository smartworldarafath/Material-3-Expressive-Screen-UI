import { afterEach, describe, expect, it } from "vitest";

import { DEFAULT_THEME, R_FULL, baseRadii, makeItem, normalizeTheme, runCorners, scaleR, setGlobalShape } from "./tokens";

afterEach(() => setGlobalShape("rounded")); // restore the module default

describe("setGlobalShape / scaleR", () => {
  it("shrinks radii for the square scale and grows them for full", () => {
    setGlobalShape("square");
    expect(scaleR(R_FULL)).toBe(Math.round(R_FULL * 0.35));
    setGlobalShape("full");
    expect(scaleR(R_FULL)).toBe(Math.round(R_FULL * 1.6));
    setGlobalShape("rounded");
    expect(scaleR(R_FULL)).toBe(R_FULL);
  });

  it("flows into a part's default corners", () => {
    setGlobalShape("rounded");
    const rounded = baseRadii(makeItem("button")).tl;
    setGlobalShape("square");
    expect(baseRadii(makeItem("button")).tl).toBeLessThan(rounded);
    setGlobalShape("full");
    expect(baseRadii(makeItem("button")).tl).toBeGreaterThan(rounded);
  });

  it("keeps a radius the author typed in, whatever the scale", () => {
    const card = { ...makeItem("card"), radiusTop: 12 };
    setGlobalShape("full");
    expect(baseRadii(card)).toEqual({ tl: 12, tr: 12, bl: 12, br: 12 });
  });
});

describe("runCorners", () => {
  const outer = 28;
  const inner = 8;

  it("puts the outer corners at the ends of a horizontal run, inner between parts", () => {
    expect(runCorners("x", true, false, outer, inner)).toEqual({ tl: outer, bl: outer, tr: inner, br: inner });
    expect(runCorners("x", false, true, outer, inner)).toEqual({ tl: inner, bl: inner, tr: outer, br: outer });
  });

  it("puts the outer corners at the ends of a vertical run, inner between parts", () => {
    expect(runCorners("y", true, false, outer, inner)).toEqual({ tl: outer, tr: outer, bl: inner, br: inner });
    expect(runCorners("y", false, true, outer, inner)).toEqual({ tl: inner, tr: inner, bl: outer, br: outer });
  });

  it("rounds a lone part all over and a middle part nowhere", () => {
    expect(runCorners("x", true, true, outer, inner)).toEqual({ tl: outer, tr: outer, bl: outer, br: outer });
    expect(runCorners("y", false, false, outer, inner)).toEqual({ tl: inner, tr: inner, bl: inner, br: inner });
  });
});

describe("normalizeTheme", () => {
  it("returns the defaults untouched for undefined or empty input", () => {
    expect(normalizeTheme(undefined)).toEqual(DEFAULT_THEME);
    expect(normalizeTheme({})).toEqual(DEFAULT_THEME);
  });

  it("keeps the valid fields of a partial theme and fills in the rest", () => {
    expect(normalizeTheme({ dark: true, shape: "full" })).toEqual({ ...DEFAULT_THEME, dark: true, shape: "full" });
  });

  it("replaces unknown option values with the default", () => {
    const t = normalizeTheme({ contrast: "blaring" as never, font: "papyrus" as never, shape: "pointy" as never });
    expect(t.contrast).toBe(DEFAULT_THEME.contrast);
    expect(t.font).toBe(DEFAULT_THEME.font);
    expect(t.shape).toBe(DEFAULT_THEME.shape);
  });
});
