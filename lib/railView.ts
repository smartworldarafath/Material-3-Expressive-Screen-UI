import { Group, Item, layoutOf } from "./tokens";

export const isModalRail = (item: Item) => item.kind === "navRail" && !!item.railModal;

/** Keep modal rails in their own stable rendering layers, even while collapsed. */
export function modalRailPlacements(groups: Group[], widths: Record<string, number>) {
  return groups.flatMap((group) => {
    const parts = layoutOf(group, widths);
    const height = Math.max(0, ...parts.map((part) => part.h));
    return parts.filter(({ item }) => isModalRail(item)).map((placed) => ({
      ...placed,
      y: placed.y + (!group.free && group.axis === "x" ? (height - placed.h) / 2 : 0),
      group,
    }));
  });
}

/** Animate only geometry changed by this rail action, not future screen interactions. */
export function railMotionTargets(before: Group[], after: Group[], widths: Record<string, number>, railId: string) {
  const groups = new Set<string>();
  const items = new Set<string>([railId]);
  const positions = new Set<string>();
  const previous = new Map(before.map((group) => [group.id, group]));
  for (const group of after) {
    const old = previous.get(group.id);
    if (!old) continue;
    if (old.x !== group.x || old.y !== group.y) groups.add(group.id);
    const placed = new Map(layoutOf(old, widths).map((part) => [part.item.id, part]));
    for (const part of layoutOf(group, widths)) {
      const was = placed.get(part.item.id);
      if (!was) continue;
      if (was.w !== part.w || was.h !== part.h) items.add(part.item.id);
      if (was.x !== part.x || was.y !== part.y) positions.add(part.item.id);
    }
  }
  return { groups, items, positions };
}
