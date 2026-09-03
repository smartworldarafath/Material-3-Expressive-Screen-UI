/**
 * A small Material-style scheme generator: one seed color becomes a light
 * color scheme by placing each role at a fixed tone (CIE L*) with the seed's
 * hue and a role-specific chroma, then clipping chroma into the sRGB gamut.
 * It follows the shape of Material's HCT tonal palettes without the full
 * CAM16 model, which is more than enough for a mockup palette.
 */

import type { Palette } from "./tokens";

export type Lab = { L: number; a: number; b: number };
export type Lch = { L: number; C: number; h: number };

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export function hexToRgb(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export const rgbToHex = (r: number, g: number, b: number) =>
  "#" + [r, g, b].map((v) => Math.round(clamp01(v / 255) * 255).toString(16).padStart(2, "0")).join("").toUpperCase();

const lin = (c: number) => {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
};
const gam = (v: number) => (v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055);

const WHITE = [0.95047, 1, 1.08883];
const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
const fInv = (t: number) => (t > 0.2069 ? t * t * t : (t - 16 / 116) / 7.787);

export function rgbToLab(r: number, g: number, b: number): Lab {
  const R = lin(r);
  const G = lin(g);
  const B = lin(b);
  const x = (R * 0.4124 + G * 0.3576 + B * 0.1805) / WHITE[0];
  const y = (R * 0.2126 + G * 0.7152 + B * 0.0722) / WHITE[1];
  const z = (R * 0.0193 + G * 0.1192 + B * 0.9505) / WHITE[2];
  const fx = f(x);
  const fy = f(y);
  const fz = f(z);
  return { L: 116 * fy - 16, a: 500 * (fx - fy), b: 200 * (fy - fz) };
}

/** sRGB in 0..255, or null when the color is outside the gamut */
function labToRgb(lab: Lab): [number, number, number] | null {
  const fy = (lab.L + 16) / 116;
  const fx = lab.a / 500 + fy;
  const fz = fy - lab.b / 200;
  const x = fInv(fx) * WHITE[0];
  const y = fInv(fy) * WHITE[1];
  const z = fInv(fz) * WHITE[2];
  const R = x * 3.2406 + y * -1.5372 + z * -0.4986;
  const G = x * -0.9689 + y * 1.8758 + z * 0.0415;
  const B = x * 0.0557 + y * -0.204 + z * 1.057;
  const out = [R, G, B].map(gam);
  if (out.some((v) => v < -0.002 || v > 1.002)) return null;
  return out.map((v) => clamp01(v) * 255) as [number, number, number];
}

export function labToLch(lab: Lab): Lch {
  const C = Math.hypot(lab.a, lab.b);
  let h = (Math.atan2(lab.b, lab.a) * 180) / Math.PI;
  if (h < 0) h += 360;
  return { L: lab.L, C, h };
}

/** the color at a tone / chroma / hue, with chroma reduced until it fits sRGB */
export function tone(L: number, C: number, h: number): string {
  const rad = (h * Math.PI) / 180;
  let c = C;
  for (let i = 0; i < 40; i++) {
    const rgb = labToRgb({ L, a: c * Math.cos(rad), b: c * Math.sin(rad) });
    if (rgb) return rgbToHex(rgb[0], rgb[1], rgb[2]);
    c *= 0.88;
  }
  const rgb = labToRgb({ L, a: 0, b: 0 }) ?? [128, 128, 128];
  return rgbToHex(rgb[0], rgb[1], rgb[2]);
}

/** Material 3 light scheme from a seed color. */
export function schemeFromSeed(seedHex: string, label = "Custom"): Palette {
  const rgb = hexToRgb(seedHex) ?? [103, 80, 164];
  const lch = labToLch(rgbToLab(rgb[0], rgb[1], rgb[2]));
  const h = lch.h;
  const primaryC = Math.max(36, Math.min(lch.C, 60));
  const secondaryC = primaryC / 3;
  const tertiaryH = (h + 60) % 360;
  const tertiaryC = primaryC / 2;
  const neutralC = 3;
  const neutralVarC = 7;
  const P = (L: number) => tone(L, primaryC, h);
  const S = (L: number) => tone(L, secondaryC, h);
  const T = (L: number) => tone(L, tertiaryC, tertiaryH);
  const N = (L: number) => tone(L, neutralC, h);
  const NV = (L: number) => tone(L, neutralVarC, h);
  return {
    key: "custom",
    label,
    seed: seedHex.toUpperCase(),
    primary: P(40),
    onPrimary: P(100),
    primaryContainer: P(90),
    onPrimaryContainer: P(10),
    inversePrimary: P(80),
    secondaryContainer: S(90),
    onSecondaryContainer: S(10),
    tertiaryContainer: T(90),
    onTertiaryContainer: T(10),
    surface: N(98),
    surfaceContainerLow: N(96),
    surfaceContainer: N(94),
    surfaceContainerHigh: N(92),
    surfaceContainerHighest: N(90),
    onSurface: N(10),
    onSurfaceVariant: NV(30),
    outline: NV(50),
    outlineVariant: NV(80),
    inverseSurface: N(20),
    inverseOnSurface: N(95),
    error: "#B3261E",
    onError: "#FFFFFF",
    errorContainer: "#F9DEDC",
    onErrorContainer: "#410E0B",
  };
}

/** readable text color for an arbitrary background: the same hue at tone 10 or 100 */
export function onColorFor(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return "#000000";
  const lch = labToLch(rgbToLab(rgb[0], rgb[1], rgb[2]));
  return lch.L > 60 ? tone(10, Math.min(lch.C, 30), lch.h) : tone(100, 0, lch.h);
}

export const isHex = (v: string) => /^#[0-9a-f]{6}$/i.test(v.trim());
