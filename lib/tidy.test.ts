import { describe, expect, it } from "vitest";

import { tidyFrame } from "./tidy";
import { Frame, Group, Item, Kind, NAV_BAR_H, PHONE_H, PHONE_MARGIN, PHONE_W, makeItem } from "./tokens";

const frame: Frame = { id: "f1", name: "Home", x: 0, y: 0 };
const frames = [frame];

const grp = (id: string, x: number, y: number, items: Item[]): Group => ({ id, x, y, axis: "x", items });
const part = (kind: Kind, id: string): Item => ({ ...makeItem(kind), id });

describe("tidyFrame", () => {
  it("snaps the app bar to the top edge and the navigation bar to the bottom", () => {
    const groups = [grp("g-bar", 40, 300, [part("topAppBar", "bar")]), grp("g-nav", 40, 100, [part("bottomNav", "nav")])];
    const out = tidyFrame(groups, frame, frames, {});
    const bar = out!.find((g) => g.id === "g-bar")!;
    const nav = out!.find((g) => g.id === "g-nav")!;
    expect([bar.x, bar.y]).toEqual([0, 0]);
    expect([nav.x, nav.y]).toEqual([0, PHONE_H - (80 + NAV_BAR_H)]);
  });

  it("moves a FAB to the bottom-right corner, one margin in", () => {
    const out = tidyFrame([grp("g-fab", 40, 100, [part("fab", "fab")])], frame, frames, {});
    expect([out![0].x, out![0].y]).toEqual([PHONE_W - PHONE_MARGIN - 56, PHONE_H - PHONE_MARGIN - 56]);
  });

  it("joins neighbouring buttons into one connected run in reading order", () => {
    const out = tidyFrame([grp("g1", 16, 300, [part("button", "b1")]), grp("g2", 150, 300, [part("button", "b2")])], frame, frames, {});
    expect(out).toHaveLength(1);
    expect(out![0].items.map((it) => it.id)).toEqual(["b1", "b2"]);
  });

  it("joins buttons dropped onto each other, in reading order", () => {
    const out = tidyFrame([grp("g1", 150, 300, [part("button", "b1")]), grp("g2", 100, 304, [part("button", "b2")])], frame, frames, {});
    expect(out).toHaveLength(1);
    expect(out![0].items.map((it) => it.id)).toEqual(["b2", "b1"]);
  });

  it("joins neighbouring list items into one connected column", () => {
    const out = tidyFrame([grp("g1", 16, 100, [part("listItem", "l1")]), grp("g2", 16, 180, [part("listItem", "l2")])], frame, frames, {});
    expect(out).toHaveLength(1);
    expect(out![0].axis).toBe("y");
    expect(out![0].items.map((it) => it.id)).toEqual(["l1", "l2"]);
  });

  it("returns null for a frame that is already tidy", () => {
    const messy = [grp("g-bar", 40, 300, [part("topAppBar", "bar")]), grp("g-fab", 10, 10, [part("fab", "fab")])];
    const once = tidyFrame(messy, frame, frames, {});
    expect(once).not.toBeNull();
    expect(tidyFrame(once!, frame, frames, {})).toBeNull();
  });
});
