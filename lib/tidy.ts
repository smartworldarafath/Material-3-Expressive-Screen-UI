import { FULL_WIDTH, Frame, Group, Item, PHONE_MARGIN, canJoin, carryItemSize, connectSpecOf, frameOfGroup, frameRect, frameSizeOf, groupBounds } from "./tokens";

/* Rule-based layout for one screen. Nothing here is guessed by a model.
 *
 * 1. Parts of one connectable family that sit next to each other fuse into a
 *    connected run, the same way the magnetic drop does: list items stacked in
 *    a column, buttons or icon buttons side by side in a row.
 * 2. Bars stick to the edges they belong to (app bar and tabs at the top, the
 *    navigation bar at the bottom, toolbars and snackbars hovering above it,
 *    a bottom sheet on the bottom edge), a FAB takes the bottom-right corner,
 *    a dialog is centered.
 * 3. Everything else is stacked from the top on the 16dp layout margins. Rows,
 *    hand-made groups and intentional overlaps (a badge on an icon, parts on a
 *    box) are kept as one unit, and a part keeps the side it was on.
 *
 * Only positions change and runs are joined; sizes, order and contents stay. */

type Rect = { l: number; t: number; r: number; b: number };

/** vertical distance between stacked rows */
const ROW_GAP = 16;
/** a tighter gap after a heading and between list-like rows of one kind */
const TIGHT_GAP = 8;
/** horizontal distance between parts packed into one row */
const ROW_ITEM_GAP = 8;
/** the farthest two parts of one family may be apart and still be joined: side by side, and stacked */
const JOIN_GAP_X = 24;
const JOIN_GAP_Y = 48;
/** parts of one family the author kept apart stay clearly apart, beyond the joining distance */
const APART_GAP_X = JOIN_GAP_X + 8;
const APART_GAP_Y = JOIN_GAP_Y + 8;

const LIST_KINDS = new Set(["listItem", "textField", "checkbox", "radio", "switch", "chip", "divider", "card"]);

/** one movable unit: a group plus everything nested inside or overlapping it */
type Unit = { ids: string[]; bb: Rect; kind: string; checked?: boolean; /** the first part, for family checks */ probe: Item };

const overlap = (a: Rect, b: Rect) => Math.min(a.r, b.r) > Math.max(a.l, b.l) && Math.min(a.b, b.b) > Math.max(a.t, b.t);
const union = (a: Rect, b: Rect): Rect => ({ l: Math.min(a.l, b.l), t: Math.min(a.t, b.t), r: Math.max(a.r, b.r), b: Math.max(a.b, b.b) });
/** how much of the smaller extent two spans share, 0..1 */
const share = (a0: number, a1: number, b0: number, b1: number) => Math.max(0, Math.min(a1, b1) - Math.max(a0, b0)) / Math.max(1, Math.min(a1 - a0, b1 - b0));

/* ---------- 1. join runs ---------- */

/** whether the whole run is one connectable family, so a neighbour can join it */
const runFamily = (g: Group): { axis: "x" | "y"; probe: Item } | null => {
  if (g.free) return null;
  const spec = connectSpecOf(g.items[0]);
  if (!spec) return null;
  if (!g.items.every((it) => canJoin(g.items[0], it))) return null;
  return { axis: spec.axis, probe: g.items[0] };
};

/** Neighbouring runs of one family fuse into a single run, in reading order. */
function joinRuns(groups: Group[], widths: Record<string, number>): Group[] {
  const out = [...groups];
  for (;;) {
    let joined = false;
    const bounds = new Map(out.map((g) => [g.id, groupBounds(g, widths)]));
    outer: for (let i = 0; i < out.length; i++) {
      const a = out[i];
      const fa = runFamily(a);
      if (!fa) continue;
      for (let j = 0; j < out.length; j++) {
        if (i === j) continue;
        const b = out[j];
        const fb = runFamily(b);
        if (!fb || fa.axis !== fb.axis || !canJoin(fa.probe, fb.probe)) continue;
        const ra = bounds.get(a.id)!;
        const rb = bounds.get(b.id)!;
        /* b must come right after a along the axis, and line up across it */
        const gap = fa.axis === "x" ? rb.l - ra.r : rb.t - ra.b;
        if (gap < -2 || gap > (fa.axis === "x" ? JOIN_GAP_X : JOIN_GAP_Y)) continue;
        const lined = fa.axis === "x" ? share(ra.t, ra.b, rb.t, rb.b) : share(ra.l, ra.r, rb.l, rb.r);
        if (lined < 0.5) continue;
        /* nothing else may sit between them */
        const between: Rect = fa.axis === "x" ? { l: ra.r, t: Math.min(ra.t, rb.t), r: rb.l, b: Math.max(ra.b, rb.b) } : { l: Math.min(ra.l, rb.l), t: ra.b, r: Math.max(ra.r, rb.r), b: rb.t };
        if (out.some((o) => o !== a && o !== b && overlap(bounds.get(o.id)!, between))) continue;
        const merged: Group = { ...a, axis: fa.axis, items: [...a.items, ...b.items] };
        /* the run keeps the later layer so the joined parts still draw above whatever they were over */
        const at = Math.max(i, j);
        out.splice(at, 1, merged);
        out.splice(Math.min(i, j), 1);
        joined = true;
        break outer;
      }
    }
    if (!joined) return out;
  }
}

/* ---------- 2 and 3. place ---------- */

const area = (r: Rect) => Math.max(0, r.r - r.l) * Math.max(0, r.b - r.t);

/** Groups that touch each other stay together, so a badge on an icon or parts on a box move as one.
 *  Bars, FABs and dialogs never join a cluster: they have their own place and are often drawn over content. */
function clusters(groups: Group[], widths: Record<string, number>): Unit[] {
  const units: Unit[] = groups.map((g) => ({ ids: [g.id], bb: groupBounds(g, widths), kind: g.items[0].kind, checked: g.items[0].checked, probe: g.items[0] }));
  for (;;) {
    let merged = false;
    outer: for (let i = 0; i < units.length; i++) {
      if (isAnchored(units[i])) continue;
      for (let j = i + 1; j < units.length; j++) {
        if (isAnchored(units[j]) || !overlap(units[i].bb, units[j].bb)) continue;
        /* the larger member names the cluster: it is the container, the rest sits on it */
        const big = area(units[i].bb) >= area(units[j].bb) ? units[i] : units[j];
        units[i] = { ...big, ids: [...units[i].ids, ...units[j].ids], bb: union(units[i].bb, units[j].bb) };
        units.splice(j, 1);
        merged = true;
        break outer;
      }
    }
    if (!merged) return units;
  }
}

/** Units whose vertical extents overlap and that sit side by side form one row. */
function rowsOf(units: Unit[]): Unit[][] {
  const sorted = [...units].sort((a, b) => a.bb.t - b.bb.t || a.bb.l - b.bb.l);
  const out: Unit[][] = [];
  for (const u of sorted) {
    const row = out[out.length - 1];
    if (row) {
      const rt = Math.min(...row.map((r) => r.bb.t));
      const rb = Math.max(...row.map((r) => r.bb.b));
      const cy = (u.bb.t + u.bb.b) / 2;
      const rcy = (rt + rb) / 2;
      const beside = row.every((r) => r.bb.r <= u.bb.l + 2 || r.bb.l >= u.bb.r - 2);
      if (beside && ((cy >= rt && cy <= rb) || (rcy >= u.bb.t && rcy <= u.bb.b))) {
        row.push(u);
        continue;
      }
    }
    out.push([u]);
  }
  for (const r of out) r.sort((a, b) => a.bb.l - b.bb.l);
  return out;
}

const isTop = (u: Unit) => u.kind === "topAppBar" || u.kind === "tabs";
const isBottomBar = (u: Unit) => u.kind === "bottomNav" || (u.kind === "box" && !!u.checked);
const isFloatingBottom = (u: Unit) => u.kind === "toolbar" || u.kind === "snackbar";
const isFab = (u: Unit) => u.kind === "fab" || u.kind === "extendedFab" || u.kind === "fabMenu";
const isOverlay = (u: Unit) => u.kind === "dialog";
const isAnchored = (u: Unit) => isTop(u) || isBottomBar(u) || isFloatingBottom(u) || isFab(u) || isOverlay(u);

/** where a unit sits horizontally, so tidying keeps a right-aligned part on the right.
 *  Judged from the edges, so a part already on the margin reads the same way after tidying. */
function align(bb: Rect, fr: Rect): "left" | "center" | "right" | "fill" {
  const w = bb.r - bb.l;
  if (w >= fr.r - fr.l - PHONE_MARGIN * 2 - 8) return "fill";
  const near = PHONE_MARGIN + 12;
  const left = bb.l - fr.l <= near;
  const right = fr.r - bb.r <= near;
  if (left && !right) return "left";
  if (right && !left) return "right";
  return "center";
}

/** the gap above a row, from what came before it */
function gapBefore(prev: Unit[] | null, row: Unit[]): number {
  if (!prev) return 0;
  /* two stacked runs of one family were left separate on purpose: keep them beyond the joining distance */
  if (prev.length === 1 && row.length === 1 && canJoin(prev[0].probe, row[0].probe) && connectSpecOf(prev[0].probe)?.axis === "y") return APART_GAP_Y;
  const pk = prev.length === 1 ? prev[0].kind : null;
  const k = row.length === 1 ? row[0].kind : null;
  if (pk === "text") return TIGHT_GAP;
  if (pk === "divider" || k === "divider") return TIGHT_GAP;
  if (pk && k && pk === k && LIST_KINDS.has(k)) return TIGHT_GAP;
  return ROW_GAP;
}

/** A group moved the least distance that puts it inside a screen; an edge-to-edge
 *  part sits on the left edge. A group that fits already is returned as is. */
export function pullInto(g: Group, frame: Frame, widths: Record<string, number>): Group {
  const fr = frameRect(frame);
  const bb = groupBounds(g, widths);
  let dx = bb.r > fr.r ? Math.max(fr.l - bb.l, fr.r - bb.r) : bb.l < fr.l ? fr.l - bb.l : 0;
  const dy = bb.b > fr.b ? Math.max(fr.t - bb.t, fr.b - bb.b) : bb.t < fr.t ? fr.t - bb.t : 0;
  if (g.items.length === 1 && FULL_WIDTH.includes(g.items[0].kind)) dx = fr.l - bb.l;
  return dx || dy ? { ...g, x: g.x + Math.round(dx), y: g.y + Math.round(dy) } : g;
}

/** A screen changing size, and everything that follows from it: the screens to its
 *  right move over with their parts so nothing overlaps, the parts of the screen
 *  take the sizes the new screen calls for, anything that fell outside is pulled
 *  back in, and the screen is laid out again by the rules above. */
export function carryFrame(groups: Group[], frame: Frame, to: Frame, frames: Frame[], widths: Record<string, number>): { frames: Frame[]; groups: Group[] } {
  const from = frameSizeOf(frame);
  const after = frameSizeOf(to);
  const owner = new Map(groups.map((g) => [g.id, frameOfGroup(g, frames, widths)?.id] as const));
  /* screens whose left edge is past the old right edge keep their distance from it */
  const shift = after.w - from.w;
  const moved = new Map(frames.filter((f) => f.id !== frame.id && f.x >= frame.x + from.w).map((f) => [f.id, shift] as const));
  const nextFrames = frames.map((f) => (f.id === to.id ? to : moved.has(f.id) ? { ...f, x: f.x + shift } : f));
  const resized = groups.map((g) => {
    const o = owner.get(g.id);
    if (o === frame.id) return pullInto({ ...g, items: g.items.map((it) => carryItemSize(it, from, after)) }, to, widths);
    const dx = o ? moved.get(o) : undefined;
    return dx ? { ...g, x: g.x + dx } : g;
  });
  return { frames: nextFrames, groups: tidyFrame(resized, to, nextFrames, widths) ?? resized };
}

/** The tidied groups of the document, or null when `frame` is already tidy. */
export function tidyFrame(groups: Group[], frame: Frame, frames: Frame[], widths: Record<string, number>): Group[] | null {
  const fr: Rect = frameRect(frame);
  const frameW = fr.r - fr.l;
  const frameH = fr.b - fr.t;
  const mineIds = new Set(groups.filter((g) => frameOfGroup(g, frames, widths)?.id === frame.id).map((g) => g.id));
  if (!mineIds.size) return null;

  /* joining rewrites the list; the other screens' groups keep their slots */
  const before = groups.filter((g) => mineIds.has(g.id));
  const mine = joinRuns(before, widths);
  const joined = mine.length !== before.length;

  const units = clusters(mine, widths);
  const target = new Map<Unit, { l: number; t: number }>();

  let top = fr.t;
  for (const u of units.filter(isTop).sort((a, b) => a.bb.t - b.bb.t)) {
    target.set(u, { l: fr.l, t: top });
    top += u.bb.b - u.bb.t;
  }
  let bottom = fr.b;
  for (const u of units.filter(isBottomBar).sort((a, b) => b.bb.t - a.bb.t)) {
    bottom -= u.bb.b - u.bb.t;
    target.set(u, { l: fr.l + Math.round((frameW - (u.bb.r - u.bb.l)) / 2), t: bottom });
  }
  for (const u of units.filter(isFloatingBottom).sort((a, b) => b.bb.t - a.bb.t)) {
    const h = u.bb.b - u.bb.t;
    const w = u.bb.r - u.bb.l;
    bottom -= PHONE_MARGIN + h;
    target.set(u, { l: fr.l + Math.round((frameW - w) / 2), t: bottom });
  }
  let fabBottom = bottom;
  for (const u of units.filter(isFab).sort((a, b) => b.bb.t - a.bb.t)) {
    const h = u.bb.b - u.bb.t;
    const w = u.bb.r - u.bb.l;
    fabBottom -= PHONE_MARGIN + h;
    target.set(u, { l: fr.r - PHONE_MARGIN - w, t: fabBottom });
  }
  for (const u of units.filter(isOverlay)) {
    target.set(u, { l: fr.l + Math.round((frameW - (u.bb.r - u.bb.l)) / 2), t: fr.t + Math.round((frameH - (u.bb.b - u.bb.t)) / 2) });
  }

  /* everything else flows from the top on the layout margins, down to the bottom bars;
   * rows that would not fit are left where they are rather than pushed off the screen */
  const rows = rowsOf(units.filter((u) => !target.has(u)));
  const limit = bottom - PHONE_MARGIN;
  let y = top + PHONE_MARGIN;
  let prev: Unit[] | null = null;
  for (const row of rows) {
    y += gapBefore(prev, row);
    const rowH = Math.max(...row.map((u) => u.bb.b - u.bb.t));
    if (y + rowH > limit) break;
    if (row.length === 1) {
      const u = row[0];
      const w = u.bb.r - u.bb.l;
      const a = align(u.bb, fr);
      const l = a === "left" ? fr.l + PHONE_MARGIN : a === "right" ? fr.r - PHONE_MARGIN - w : fr.l + Math.round((frameW - w) / 2);
      target.set(u, { l, t: y });
    } else {
      const ws = row.map((u) => u.bb.r - u.bb.l);
      const total = ws.reduce((s, w) => s + w, 0);
      /* neighbours of one family that were not joined were kept apart on purpose */
      const gaps = row.slice(1).map((u, i) => (canJoin(row[i].probe, u.probe) ? APART_GAP_X : ROW_ITEM_GAP));
      const minPacked = total + gaps.reduce((s, g) => s + g, 0);
      const span = row[row.length - 1].bb.r - row[0].bb.l;
      const inner = frameW - PHONE_MARGIN * 2;
      const spread = span >= inner * 0.7 && minPacked <= inner;
      const packed = spread ? inner : minPacked;
      const extra = spread ? (inner - minPacked) / gaps.length : 0;
      const a = spread ? "left" : align({ l: row[0].bb.l, t: 0, r: row[row.length - 1].bb.r, b: 0 }, fr);
      let x = a === "right" ? fr.r - PHONE_MARGIN - packed : a === "center" ? fr.l + (frameW - packed) / 2 : fr.l + PHONE_MARGIN;
      row.forEach((u, i) => {
        const h = u.bb.b - u.bb.t;
        target.set(u, { l: Math.round(x), t: y + Math.round((rowH - h) / 2) });
        x += ws[i] + (gaps[i] ?? 0) + extra;
      });
    }
    y += rowH;
    prev = row;
  }

  /* apply each unit's shift to every group it holds */
  const shift = new Map<string, { dx: number; dy: number }>();
  for (const [u, to] of target) {
    const dx = Math.round(to.l - u.bb.l);
    const dy = Math.round(to.t - u.bb.t);
    for (const id of u.ids) shift.set(id, { dx, dy });
  }
  let moved = joined;
  const placed = new Map(
    mine.map((g) => {
      const s = shift.get(g.id);
      if (!s || (s.dx === 0 && s.dy === 0)) return [g.id, g] as const;
      moved = true;
      return [g.id, { ...g, x: g.x + s.dx, y: g.y + s.dy }] as const;
    }),
  );
  if (!moved) return null;
  /* keep canvas order: a joined run takes the slot of its last original member */
  const survivorOf = new Map<string, Group>();
  for (const m of mine) for (const it of m.items) survivorOf.set(it.id, m);
  const lastSlot = new Map<string, number>();
  groups.forEach((g, i) => {
    if (mineIds.has(g.id)) lastSlot.set(survivorOf.get(g.items[0].id)!.id, i);
  });
  const out: Group[] = [];
  groups.forEach((g, i) => {
    if (!mineIds.has(g.id)) {
      out.push(g);
      return;
    }
    const m = survivorOf.get(g.items[0].id)!;
    if (lastSlot.get(m.id) === i) out.push(placed.get(m.id)!);
  });
  return out;
}
