import { barSlotOf, railSide } from "./tidy";
import { Frame, Group, Item, carryItemSize, frameOfGroup, frameSizeOf, railWidth } from "./tokens";

/** Change a rail without tidying the screen or losing hand-placed vertical positions. */
export function updateRail(groups: Group[], frames: Frame[], widths: Record<string, number>, id: string, patch: Partial<Item>): Group[] {
  const target = groups.find((g) => g.items.some((it) => it.id === id && it.kind === "navRail"));
  if (!target) return groups;
  const item = target.items.find((it) => it.id === id)!;
  const updated = { ...item, ...patch };
  if (Object.entries(patch).every(([key, value]) => item[key as keyof Item] === value)) return groups;
  const frame = frameOfGroup(target, frames, widths);
  const standalone = target.items.length === 1;
  const right = standalone && frame && railSide(target, frame, widths) === "right";
  const next = groups.map((g) => g === target ? {
    ...g,
    x: right ? g.x + railWidth(item) - railWidth(updated) : g.x,
    items: g.items.map((it) => it.id === id ? updated : it),
  } : g);
  if (!standalone || !frame) return next;

  const before = barSlotOf(groups, frame, frames, widths);
  const after = barSlotOf(next, frame, frames, widths);
  if (before.x === after.x && before.w === after.w) return next;
  const { h } = frameSizeOf(frame);
  const owners = new Set(groups.filter((g) => frameOfGroup(g, frames, widths)?.id === frame.id).map((g) => g.id));
  return next.map((g) => {
    if (!owners.has(g.id) || g.locked || g.items.some((it) => it.kind === "navRail")) return g;
    return {
      ...g,
      x: g.x + after.x - before.x,
      /* Hand-made groups keep their internal geometry; only the whole group follows the body. */
      items: g.free ? g.items : g.items.map((it) => carryItemSize(it, { w: before.w, h }, { w: after.w, h })),
    };
  });
}
