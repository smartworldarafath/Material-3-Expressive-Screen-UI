/**
 * The three parts that are surfaces rather than controls: the carousel and the two pickers.
 *
 * Locks in:
 *  - each one falls back to the layout it was built with, and reads a value the author set
 *  - the box follows the layout: a calendar is as tall as its rows, a typed date is a field
 *  - the prompt names the layout, the cards, the day and the clock
 */
import { describe, expect, it } from "vitest";
import { buildPrompt } from "./prompt";
import {
  DEFAULT_THEME,
  KIND_ORDER,
  PALETTE_HIDDEN,
  PROGRESS_KINDS,
  extendedFabHeight,
  extendedFabMetrics,
  fabTypePatch,
  FAB_MENU_CLOSE,
  fabOpen,
  hasMenu,
  menuHeight,
  menuOpen,
  menuPatch,
  migrateFabMenu,
  Doc,
  Item,
  carouselCountOf,
  carouselLayoutOf,
  dateLayoutOf,
  dayOf,
  hourOf,
  makeItem,
  minuteOf,
  progressTypePatch,
  sizeOf,
  timeLayoutOf,
} from "./tokens";

const docWith = (item: Item): Doc => ({
  title: "MyApp",
  brief: "",
  paletteKey: "purple",
  frame: "phone",
  platform: "android",
  theme: DEFAULT_THEME,
  frames: [{ id: "f", name: "Home", x: 0, y: 0 }],
  groups: [{ id: "g", x: 16, y: 100, axis: "x", items: [item] }],
});

describe("carousel", () => {
  it("starts as a multi-browse row of four cards", () => {
    const it = makeItem("carousel");
    expect(carouselLayoutOf(it)).toBe("multiBrowse");
    expect(carouselCountOf(it)).toBe(4);
    expect(sizeOf(it, {})).toEqual({ w: 412, h: 180 });
  });

  it("keeps the count and the layout within what it can draw", () => {
    expect(carouselCountOf({ ...makeItem("carousel"), count: 99 })).toBe(8);
    expect(carouselLayoutOf({ ...makeItem("carousel"), layout: "dial" })).toBe("multiBrowse");
  });

  it("names its layout and its cards in the prompt", () => {
    const out = buildPrompt(docWith({ ...makeItem("carousel"), layout: "hero", count: 3 }), {}, undefined, "en");
    expect(out).toContain("a hero carousel of 3 cards");
  });
});

describe("date picker", () => {
  it("is a dialog with a day circled until it is told otherwise", () => {
    const it = makeItem("datePicker");
    expect(dateLayoutOf(it)).toBe("modal");
    expect(dayOf(it)).toBe(17);
    /* the calendar's rows follow its width, and a typed date is only a field */
    expect(sizeOf(it, {}).h).toBeGreaterThan(400);
    expect(sizeOf({ ...it, layout: "input" }, {}).h).toBe(96);
    expect(sizeOf({ ...it, layout: "docked" }, {}).h).toBeLessThan(sizeOf(it, {}).h);
  });

  it("holds the day inside a month", () => {
    expect(dayOf({ ...makeItem("datePicker"), day: 0 })).toBe(1);
    expect(dayOf({ ...makeItem("datePicker"), day: 44 })).toBe(31);
  });

  it("says which day is selected in the prompt", () => {
    const out = buildPrompt(docWith({ ...makeItem("datePicker"), day: 9 }), {}, undefined, "en");
    expect(out).toContain("day 9 selected");
    expect(out).toContain("modal dialog");
  });
});

describe("time picker", () => {
  it("starts on the dial at half past ten", () => {
    const it = makeItem("timePicker");
    expect(timeLayoutOf(it)).toBe("dial");
    expect(hourOf(it)).toBe(10);
    expect(minuteOf(it)).toBe(30);
    expect(sizeOf({ ...it, layout: "input" }, {}).h).toBeLessThan(sizeOf(it, {}).h);
  });

  it("keeps the clock on a real time", () => {
    expect(hourOf({ ...makeItem("timePicker"), hour: 30 })).toBe(23);
    expect(minuteOf({ ...makeItem("timePicker"), minute: -5 })).toBe(0);
  });

  it("reads the clock out in the prompt, in halves of the day", () => {
    const out = buildPrompt(docWith({ ...makeItem("timePicker"), hour: 15, minute: 5 }), {}, undefined, "en");
    expect(out).toContain("03:05 PM");
    expect(out).toContain("dial");
  });
});

describe("the FAB's three shapes", () => {
  it("switches between them in place, keeping what they share", () => {
    const fab = { ...makeItem("fab"), icon: "edit", size: 96 };
    const ext = { ...fab, ...fabTypePatch(fab, "extendedFab") };
    expect(ext.kind).toBe("extendedFab");
    /* the circle's diameter becomes the height the label sits in */
    expect(ext.size2).toBe(96);
    expect(ext.icon).toBe("edit");
    expect({ ...ext, ...fabTypePatch(ext, "fab") }.size).toBe(96);
  });

  it("opens a menu as a tap action, and keeps the entries when it is taken off again", () => {
    const fab = makeItem("fab");
    const withMenu = { ...fab, ...menuPatch(fab, true) };
    expect(hasMenu(withMenu)).toBe(true);
    expect(withMenu.tabs?.length).toBeGreaterThan(1);
    /* shut, it is a circle; open, it is as tall as its entries make it */
    expect(sizeOf(withMenu, {})).toEqual({ w: 56, h: 56 });
    const shown = { ...withMenu, [fabOpen]: true };
    expect(menuOpen(shown)).toBe(true);
    expect(sizeOf(shown, { [fab.id]: 200 })).toEqual({ w: 200, h: menuHeight(shown, 56) });
    /* the button that shuts the menu is the M one whatever size the FAB itself is */
    const large = { ...withMenu, size: 96, [fabOpen]: true };
    expect(sizeOf(large, { [fab.id]: 200 })).toEqual({ w: 200, h: menuHeight(large, FAB_MENU_CLOSE) });
    expect(sizeOf(large, { [fab.id]: 200 }).h).toBe(sizeOf(shown, { [fab.id]: 200 }).h);
    const off = { ...shown, ...menuPatch(shown, false) };
    expect(hasMenu(off)).toBe(false);
    expect(off.tabs?.length).toBeGreaterThan(1);
  });

  it("reads a sketch saved when a menu was a part of its own", () => {
    const old = { ...makeItem("fab"), kind: "fabMenu" as const, size: 220, tabs: [{ icon: "edit", label: "Note" }] };
    const now = migrateFabMenu(old);
    expect(now.kind).toBe("fab");
    expect(hasMenu(now)).toBe(true);
    expect(now.tabs).toEqual(old.tabs);
    expect(sizeOf(now, {})).toEqual({ w: 56, h: 56 });
  });

  it("gives an extended FAB the three heights M3 names", () => {
    const ext = makeItem("extendedFab");
    expect(extendedFabHeight(ext)).toBe(56);
    expect(extendedFabHeight({ ...ext, size2: 80 })).toBe(80);
    expect(extendedFabHeight({ ...ext, size2: 400 })).toBe(96);
    /* the label and the icon grow with the container */
    expect(extendedFabMetrics(56).icon).toBe(24);
    expect(extendedFabMetrics(96).icon).toBe(32);
    expect(sizeOf({ ...ext, size2: 96 }, { [ext.id]: 140 })).toEqual({ w: 140, h: 96 });
  });

  it("keeps the two other shapes out of the palette but still openable", () => {
    /* the shapes a part is only switched into from its own panel: a FAB's other two, and the
       ring a progress indicator becomes */
    expect(PALETTE_HIDDEN).toEqual(["extendedFab", "fabMenu", "circularProgress"]);
    /* a sketch saved with any of them still names a kind the editor knows */
    expect(KIND_ORDER).toContain("extendedFab");
    expect(KIND_ORDER).toContain("fabMenu");
    expect(KIND_ORDER).toContain("circularProgress");
  });
});

describe("a FAB that opens a menu", () => {
  it("says so in the prompt, with the entries it raises", () => {
    const fab = { ...makeItem("fab"), id: "fb", icon: "edit" };
    const doc = docWith({ ...fab, ...menuPatch(fab, true), tabs: [{ icon: "edit", label: "Note" }, { icon: "mic", label: "Voice" }] });
    const out = buildPrompt(doc, {}, undefined, "en");
    expect(out).toContain("raises a menu of 2 items");
    expect(out).toContain('"Note"(edit)');
  });
});

describe("the two shapes of a progress indicator", () => {
  it("switches between them in place, keeping how far along it is", () => {
    const bar = { ...makeItem("linearProgress"), value: 40, wavy: true, trackThickness: 8 };
    const ring = { ...bar, ...progressTypePatch(bar, "circularProgress") };
    expect(ring.kind).toBe("circularProgress");
    /* the value, the wave and the track travel; the measure does not, because a bar is drawn by
       its width and a ring by its diameter */
    expect(ring.value).toBe(40);
    expect(ring.wavy).toBe(true);
    expect(ring.trackThickness).toBe(8);
    expect(sizeOf(ring, {})).toEqual({ w: 48, h: 48 });
    expect({ ...ring, ...progressTypePatch(ring, "linearProgress") }.size).toBe(380);
    expect(PROGRESS_KINDS).toEqual(["linearProgress", "circularProgress"]);
  });

  it("still says which shape it is in the prompt", () => {
    const bar = buildPrompt(docWith({ ...makeItem("linearProgress"), wavy: true, value: 40 }), {}, undefined, "en");
    expect(bar).toContain("a wavy linear progress indicator (40%)");
    const ring = buildPrompt(docWith({ ...makeItem("circularProgress"), trackThickness: 8 }), {}, undefined, "en");
    expect(ring).toContain("a circular progress indicator (indeterminate, 8dp track thickness)");
  });
});
