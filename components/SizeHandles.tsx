"use client";

import { useEffect, useRef, useState } from "react";
import { animate } from "motion/react";
import { Palette, SETTLE_MS, clamp, lerp } from "@/lib/tokens";
import { t, useLang } from "@/lib/i18n";

/** which edge a button is held by, or which point around an icon button's circle */
export type HandleSide = "left" | "right" | "top" | "bottom" | "tl" | "tr" | "bl" | "br";
export const CORNERS: HandleSide[] = ["tl", "tr", "bl", "br"];

export type Box = { l: number; t: number; r: number; b: number };

/** A corner point sits at the 45 degree mark of its corner, so it travels 1/sqrt(2) of the way
 *  out along each axis as well as half of the growth itself: moving it by one pixel on both axes
 *  is this many pixels of size. The drag divides by it, and the point stays under the pointer. */
export const CORNER_GAIN = 1 + Math.SQRT1_2;

const same = (a: Box, c: Box) => a.l === c.l && a.t === c.t && a.r === c.r && a.b === c.b;
const mix = (a: Box, c: Box, k: number): Box => ({ l: lerp(a.l, c.l, k), t: lerp(a.t, c.t, k), r: lerp(a.r, c.r, k), b: lerp(a.b, c.b, k) });

/** The handles a lone button is resized by: one on each edge, or four points around a circle.
 *  They hang off a box that eases to the part's new size the way the part itself does, so a size
 *  picked in the panel moves the part and its handles together. A drag sets the box at once. */
export function SizeHandles({
  round,
  box,
  z,
  instant,
  p,
  onDown,
}: {
  /** the part is a circle: it is held by four points on it rather than by its edges */
  round: boolean;
  box: Box;
  /** canvas zoom, so a handle keeps its size on screen */
  z: number;
  /** the size is following a pointer: the handles must land where it is, with no easing */
  instant: boolean;
  p: Palette;
  onDown: (e: React.PointerEvent, side: HandleSide) => void;
}) {
  const lang = useLang();
  const [shown, setShown] = useState(box);
  const at = useRef(box);
  useEffect(() => {
    const from = at.current;
    const land = () => {
      at.current = box;
      setShown(box);
    };
    if (instant || same(from, box)) {
      land();
      return;
    }
    const run = animate(0, 1, {
      duration: SETTLE_MS / 1000,
      ease: [0.2, 0, 0, 1],
      onUpdate: (k) => {
        const cur = mix(from, box, k);
        at.current = cur;
        setShown(cur);
      },
      onComplete: land,
    });
    return () => run.stop();
    /* the easing runs off its own clock: only a new box may start it over */
  }, [box.l, box.t, box.r, box.b, instant]); // eslint-disable-line react-hooks/exhaustive-deps

  const w = shown.r - shown.l;
  const h = shown.b - shown.t;
  const cx = (shown.l + shown.r) / 2;
  const cy = (shown.t + shown.b) / 2;
  /* the handle follows the button's height on screen, within bounds: it must neither dwarf a
   * button zoomed far out nor vanish on one zoomed far in */
  const hh = clamp(h * 0.55, 12 / z, 32 / z);
  const hw = clamp(hh * 0.22, 3 / z, 7 / z);
  /* the drawn handle keeps its size; what the finger may land on is a little wider all round */
  const PAD = 7 / z;

  const handle = (side: HandleSide, x: number, y: number, dw: number, dh: number, cursor: string, title: string) => (
    <div
      key={side}
      onPointerDown={(e) => onDown(e, side)}
      title={title}
      style={{
        position: "absolute",
        left: x - dw / 2 - PAD,
        top: y - dh / 2 - PAD,
        width: dw + PAD * 2,
        height: dh + PAD * 2,
        display: "grid",
        placeItems: "center",
        cursor,
        zIndex: 55,
        touchAction: "none",
      }}
    >
      <span
        style={{
          width: dw,
          height: dh,
          borderRadius: Math.min(dw, dh),
          background: p.primary,
          border: `${1 / z}px solid ${p.surface}`,
          boxSizing: "border-box",
        }}
      />
    </div>
  );

  if (round) {
    /* each point sits where its diagonal crosses the corner it is nearest. On a circle that is
     * the circle itself; on a part longer than it is tall -- an extended FAB, a chip -- it is the
     * rounded end, which is the same arc, so the four points land on the outline either way. */
    const rr = Math.min(w, h) / 2;
    const dot = clamp(rr * 0.34, 5 / z, 11 / z);
    const inset = rr - rr / Math.SQRT2;
    const offX = w / 2 - inset;
    const offY = h / 2 - inset;
    return (
      <>
        {CORNERS.map((side) =>
          handle(
            side,
            cx + (side === "tl" || side === "bl" ? -offX : offX),
            cy + (side === "tl" || side === "tr" ? -offY : offY),
            dot,
            dot,
            side === "tl" || side === "br" ? "nwse-resize" : "nesw-resize",
            t("resizeSize", lang),
          ),
        )}
      </>
    );
  }

  /* the side handles keep the button's proportions; the top and bottom ones are the same pill
   * laid down, and never wider than the button they sit on */
  const vw = Math.min(hh, w * 0.55);
  return (
    <>
      {(["left", "right", "top", "bottom"] as const).map((side) => {
        const vertical = side === "top" || side === "bottom";
        return handle(
          side,
          vertical ? cx : side === "left" ? shown.l : shown.r,
          vertical ? (side === "top" ? shown.t : shown.b) : cy,
          vertical ? vw : hw,
          vertical ? hw : hh,
          vertical ? "ns-resize" : "ew-resize",
          t(vertical ? "resizeHeight" : "resizeWidth", lang),
        );
      })}
    </>
  );
}
