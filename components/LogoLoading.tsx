"use client";

import { useEffect, useRef } from "react";
import { LoadingAnimator, morphedShape, Point } from "@/lib/shapes";
import { LOGO_GLYPH, LOGO_MARK } from "@/components/Logo";

/** The logo's cookie is shape 1 of the loading sequence: start there so the mark
 *  in the static page turns into the indicator without a jump. */
const LOGO_SHAPE = 1;

function pathOf(pts: Point[], scale: number): string {
  let d = "";
  for (let i = 0; i < pts.length; i++) {
    d += (i === 0 ? "M" : "L") + (pts[i][0] * scale).toFixed(2) + " " + (pts[i][1] * scale).toFixed(2);
  }
  return d + "Z";
}

/** The app mark as the M3 Expressive loading indicator: the cookie morphs through the
 *  shape sequence while the layers glyph stays still in its centre. Until the first
 *  animation frame it is the static logo itself, so the page and the mark line up. */
export function LogoLoading({ size = 48, color, glyph = "#FFFFFF" }: { size?: number; color: string; glyph?: string }) {
  const pathRef = useRef<SVGPathElement>(null);
  const anim = useRef<LoadingAnimator | null>(null);
  /* the normalised shapes span the full box, as the cookie does in the static logo */
  const scale = size / 2;
  const c = size / 2;
  /* the glyph sits where it does in the static logo: 1.35x a 64 unit box at (72, 74) of 144 */
  const g = size / 144;

  useEffect(() => {
    if (typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!anim.current) anim.current = new LoadingAnimator();
    let raf = 0;
    const loop = (ts: number) => {
      const a = anim.current!;
      a.update(ts);
      const el = pathRef.current;
      if (el) {
        el.setAttribute("d", pathOf(morphedShape(a.morph + LOGO_SHAPE), scale));
        el.setAttribute("transform", `translate(${c} ${c}) rotate(${a.rotation.toFixed(2)})`);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [scale, c]);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" style={{ display: "block", overflow: "visible" }}>
      <path ref={pathRef} fill={color} d={LOGO_MARK} transform={`scale(${g})`} />
      <path fill={glyph} transform={`translate(${72 * g} ${74 * g}) scale(${1.35 * g}) translate(-32 -32)`} d={LOGO_GLYPH} />
    </svg>
  );
}
