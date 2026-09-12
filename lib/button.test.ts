/**
 * lib/tokens.ts — the button's M3 size scale and the link a tap can open.
 *
 * Locks in:
 *  - buttonMetrics returns Material's own values on each named size, and mixes them in between
 *  - a height the author set reaches sizeOf, baseRadii and the narrowest width a button may take
 *  - linkUrlOf only hands back addresses a browser may follow, and completes a bare host
 */
import { describe, expect, it } from "vitest";
import {
  BUTTON_H_MAX,
  BUTTON_H_MIN,
  BUTTON_SIZES,
  H,
  Item,
  LINK_TARGET,
  buttonHeightOf,
  buttonMetrics,
  buttonMinWidth,
  buttonSizeKeyOf,
  baseRadii,
  linkHostOf,
  linkUrlOf,
  makeItem,
  sizeOf,
} from "./tokens";

const button = (patch: Partial<Item> = {}): Item => ({ ...makeItem("button"), ...patch });

describe("the button's M3 size scale", () => {
  it("keeps Material's own values on each named size", () => {
    expect(BUTTON_SIZES.map((s) => s.h)).toEqual([32, 40, 56, 96, 136]);
    expect(buttonMetrics(32)).toEqual({ h: 32, padX: 12, gap: 8, icon: 20, font: 14 });
    expect(buttonMetrics(56)).toEqual({ h: 56, padX: 24, gap: 8, icon: 24, font: 16 });
    expect(buttonMetrics(136)).toEqual({ h: 136, padX: 64, gap: 16, icon: 40, font: 32 });
  });

  it("mixes the two sizes a height falls between", () => {
    const mid = buttonMetrics(76); // halfway from M (56) to L (96)
    expect(mid).toEqual({ h: 76, padX: 36, gap: 10, icon: 28, font: 20 });
    expect(buttonSizeKeyOf(76)).toBeNull();
    expect(buttonSizeKeyOf(96)).toBe("l");
  });

  it("stays inside the scale whatever height it is handed", () => {
    expect(buttonMetrics(-40).h).toBe(BUTTON_H_MIN);
    expect(buttonMetrics(400).h).toBe(BUTTON_H_MAX);
    expect(buttonHeightOf(button())).toBe(H);
    expect(buttonHeightOf(button({ size2: 1000 }))).toBe(BUTTON_H_MAX);
  });

  it("carries the height into the drawn box, its corners and how narrow it may be", () => {
    const tall = button({ size: 200, size2: 96 });
    expect(sizeOf(tall, {})).toEqual({ w: 200, h: 96 });
    expect(baseRadii(tall)).toEqual({ tl: 48, tr: 48, bl: 48, br: 48 });
    /* at its narrowest the button is a circle, so a taller one cannot be as narrow */
    expect(buttonMinWidth(tall)).toBe(96);
    expect(buttonMinWidth(button())).toBe(H);
  });
});

describe("a tap that opens a link", () => {
  const link = (url?: string) => ({ to: LINK_TARGET, transition: "none" as const, url });

  it("reads a bare host as https and keeps a full address as it is", () => {
    expect(linkUrlOf(link("example.com/docs"))).toBe("https://example.com/docs");
    expect(linkUrlOf(link("http://example.com/"))).toBe("http://example.com/");
    expect(linkHostOf(link("example.com/docs"))).toBe("example.com");
  });

  it("hands back nothing for an address the browser must not follow", () => {
    expect(linkUrlOf(link(" "))).toBeNull();
    expect(linkUrlOf(link("javascript:alert(1)"))).toBeNull();
    expect(linkUrlOf(link("mailto:someone@example.com"))).toBeNull();
    expect(linkUrlOf(undefined)).toBeNull();
    expect(linkHostOf(link("not a url"))).toBeNull();
  });
});
