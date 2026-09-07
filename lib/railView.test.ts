import { describe, expect, it } from "vitest";
import { modalRailPlacements, railMotionTargets } from "./railView";
import { updateRail } from "./rail";
import { Frame, GAP, Group, Item, sizeOf } from "./tokens";

const rail: Item = { id: "rail", kind: "navRail", label: "", icon: "menu", variant: "filled", railExpanded: false, railModal: true, size2: 500 };
const sibling: Item = { id: "sibling", kind: "button", label: "Sibling", icon: null, variant: "filled" };
const group: Group = { id: "mixed", x: 20, y: 40, axis: "x", items: [sibling, rail] };

describe("modal rail rendering layers", () => {
  it.each([false, true])("isolates only the rail without modifying its free group (expanded=%s)", (expanded) => {
    const free = { ...group, free: true, items: [sibling, { ...rail, railExpanded: expanded }], pos: { rail: { x: 12, y: 18 }, sibling: { x: 120, y: 150 } } };
    const before = structuredClone(free);
    const layers = modalRailPlacements([free], {});
    expect(layers).toHaveLength(1);
    expect(layers[0]).toMatchObject({ item: { id: "rail" }, x: 32, y: 58, index: 1 });
    expect(layers[0].group).toBe(free);
    expect(free).toEqual(before);
  });

  it("retains the flex slot and vertical alignment beside a taller sibling", () => {
    const tall: Item = { ...sibling, kind: "box", size: 300, size2: 700 };
    const layers = modalRailPlacements([{ ...group, items: [tall, rail] }], {});
    expect(layers[0]).toMatchObject({ x: 20 + 300 + GAP, y: 140, w: 96, h: 500 });
  });

  it("retains a vertical run's offset and excludes standard rails", () => {
    const layers = modalRailPlacements([{ ...group, axis: "y" }, { ...group, id: "standard", items: [{ ...rail, id: "standard-rail", railModal: false }] }], {});
    expect(layers).toHaveLength(1);
    expect(layers[0].y).toBe(40 + sizeOf(sibling, {}).h + GAP);
  });
});

describe("rail motion scope", () => {
  const frame: Frame = { id: "f", name: "Desktop", x: 0, y: 0, w: 1280, h: 800 };
  const before: Group[] = [
    { id: "nav", x: 0, y: 0, axis: "x", items: [{ ...rail, railModal: false, size2: 800 }] },
    { id: "bar", x: 96, y: 0, axis: "x", items: [{ ...sibling, id: "bar", kind: "topAppBar", size: 1184 }] },
    { ...group, id: "body", x: 112, y: 120, items: [sibling] },
    { ...group, id: "locked", locked: true, x: 112, y: 400, items: [{ ...sibling, id: "locked" }] },
  ];

  it("targets only the rail, resized bar and moved groups", () => {
    const after = updateRail(before, [frame], {}, "rail", { railExpanded: true });
    const motion = railMotionTargets(before, after, {}, "rail");
    expect([...motion.groups]).toEqual(["bar", "body"]);
    expect([...motion.items]).toEqual(["rail", "bar"]);
    expect([...motion.positions]).toEqual(["bar", "sibling"]);
    expect(motion.items.has("locked")).toBe(false);
    expect(motion.items.has("sibling")).toBe(false);
  });

  it("keeps unrelated groups out of a modal toggle", () => {
    const modal = before.map((g, i) => i === 0 ? { ...g, items: [{ ...rail, size2: 800 }] } : g);
    const after = updateRail(modal, [frame], {}, "rail", { railExpanded: true });
    const motion = railMotionTargets(modal, after, {}, "rail");
    expect([...motion.groups]).toEqual([]);
    expect([...motion.items]).toEqual(["rail"]);
    expect([...motion.positions]).toEqual([]);
  });
});
