import { describe, expect, it } from "vitest";
import { updateRail } from "./rail";
import { Frame, Group, Item } from "./tokens";

const frame: Frame = { id: "f", name: "Desktop", x: 20, y: 40, w: 1280, h: 800 };
const rail: Item = { id: "rail", kind: "navRail", label: "", icon: "menu", variant: "filled", railExpanded: false, size2: 800 };
const bar: Item = { id: "bar", kind: "topAppBar", label: "Title", icon: "menu", variant: "filled", size: 1184 };
const group = (id: string, x: number, items: Item[]): Group => ({ id, x, y: 40, axis: "x", items });
const stage = (right = false): Group[] => [group("rail-group", right ? 1204 : 20, [rail]), group("bar-group", right ? 20 : 116, [bar])];

describe("updateRail", () => {
  it.each([false, true])("expands and collapses a standard rail reversibly on the right=%s", (right) => {
    const original = stage(right);
    const expanded = updateRail(original, [frame], {}, "rail", { railExpanded: true });
    expect(expanded[0].x).toBe(right ? 1080 : 20);
    expect(expanded[1].x).toBe(right ? 20 : 240);
    expect(expanded[1].items[0].size).toBe(1060);
    expect(expanded.map((g) => g.y)).toEqual(original.map((g) => g.y));
    expect(updateRail(expanded, [frame], {}, "rail", { railExpanded: false })).toEqual(original);
    expect(original[0].items[0].railExpanded).toBe(false);
  });

  it.each([false, true])("keeps the body unchanged while a modal rail expands on the right=%s", (right) => {
    const original = stage(right);
    original[0] = { ...original[0], items: [{ ...rail, railModal: true }] };
    const expanded = updateRail(original, [frame], {}, "rail", { railExpanded: true });
    expect(expanded[0].x).toBe(right ? 1080 : 20);
    expect(expanded[1]).toBe(original[1]);
    expect(updateRail(expanded, [frame], {}, "rail", { railExpanded: false })).toEqual(original);
  });

  it("reflows the body when an expanded rail switches between standard and modal", () => {
    const expanded = updateRail(stage(), [frame], {}, "rail", { railExpanded: true });
    const modal = updateRail(expanded, [frame], {}, "rail", { railModal: true });
    expect(modal[0].x).toBe(expanded[0].x);
    expect(modal[1].x).toBe(116);
    expect(modal[1].items[0].size).toBe(1184);
    const standard = updateRail(modal, [frame], {}, "rail", { railModal: false });
    expect(standard[1]).toEqual(expanded[1]);
  });

  it("leaves locked groups and other screens untouched", () => {
    const locked = { ...group("locked", 116, [{ ...bar, id: "locked-bar" }]), locked: true };
    const other = group("other", 1516, [{ ...bar, id: "other-bar" }]);
    const original = [...stage(), locked, other];
    const frames = [frame, { ...frame, id: "other-frame", x: 1420 }];
    const out = updateRail(original, frames, {}, "rail", { railExpanded: true });
    expect(out[2]).toBe(locked);
    expect(out[3]).toBe(other);
  });

  it("moves hand-made groups as a whole without resizing their members", () => {
    const free: Group = { ...group("free", 116, [{ ...bar, id: "free-bar" }]), free: true, pos: { "free-bar": { x: 8, y: 90 } } };
    const out = updateRail([...stage(), free], [frame], {}, "rail", { railExpanded: true });
    expect(out[2].x).toBe(240);
    expect(out[2].items).toBe(free.items);
    expect(out[2].pos).toBe(free.pos);
    expect(out[2].y).toBe(free.y);
  });

  it("only patches a rail inside a hand-made group", () => {
    const original = [group("mixed", 116, [rail, bar]), group("other", 500, [{ ...bar, id: "other-bar" }])];
    const out = updateRail(original, [frame], {}, "rail", { railExpanded: true });
    expect(out[0].x).toBe(original[0].x);
    expect(out[0].items[0].railExpanded).toBe(true);
    expect(out[0].items[1]).toBe(bar);
    expect(out[1]).toBe(original[1]);
  });

  it("only patches a rail without an owning frame", () => {
    const original = [group("loose", 2000, [rail])];
    const out = updateRail(original, [frame], {}, "rail", { railExpanded: true });
    expect(out[0].x).toBe(2000);
    expect(out[0].items[0].railExpanded).toBe(true);
  });

  it("preserves a right rail's inset instead of snapping it to the screen edge", () => {
    const original = stage(true);
    original[0] = { ...original[0], x: original[0].x - 12 };
    const out = updateRail(original, [frame], {}, "rail", { railExpanded: true });
    expect(out[0].x).toBe(1068);
  });

  it("returns the same groups for a missing target or an unchanged patch", () => {
    const original = stage();
    expect(updateRail(original, [frame], {}, "missing", { railExpanded: true })).toBe(original);
    expect(updateRail(original, [frame], {}, "rail", { railExpanded: false })).toBe(original);
  });
});
