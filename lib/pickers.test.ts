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
  Doc,
  Item,
  carouselCountOf,
  carouselLayoutOf,
  dateLayoutOf,
  dayOf,
  hourOf,
  makeItem,
  minuteOf,
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
