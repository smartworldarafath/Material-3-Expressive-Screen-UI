"use client";

import { useEffect, useRef, useState } from "react";
import { Reorder, useDragControls } from "motion/react";
import {
  BACK_TARGET,
  BUTTON_H_MAX,
  BUTTON_H_MIN,
  CHIP_H_MAX,
  CHIP_H_MIN,
  CHIP_SIZES,
  chipHeightOf,
  BUTTON_SIZES,
  FAB_H_MAX,
  FAB_H_MIN,
  FAB_KINDS,
  FAB_SIZES,
  FabKind,
  Frame,
  Item,
  KIND_SPEC,
  LINK_TARGET,
  MENU_TARGET,
  fabOpen,
  hasMenu,
  menuOpen,
  menuPatch,
  NavTab,
  PHONE_W,
  Palette,
  R_INNER,
  Variant,
  actionSlotsOf,
  buttonHeightOf,
  buttonMinWidth,
  contentWidth,
  defaultTabsFor,
  extendedFabHeight,
  fabTypePatch,
  frameSizeOf,
  halfWidth,
  isFab,
  isPhoneFrame,
  removeTabPatch,
  reorderTabsPatch,
  toggleIcon,
  variantStyle,
} from "@/lib/tokens";
import { IconPicker } from "./IconPicker";
import { Icon, M3Static } from "./M3Node";
import { Field, IconBtn, PanelShell, Section, Segmented, Select, SelectOption, Slider, Toggle } from "./ui";
import { AiHooks, variantsOf } from "./Inspector";
import { LinkStage, TapStage } from "./TapStage";
import { AiIconBtn, AlignBox, PartHeader, PartTabs, PlaceFn, Tab, actionOptionsOf } from "./PartPanel";
import { KIND_TEXT, t, useLang } from "@/lib/i18n";

export type { PlaceFn };

/** the button styles as one connected run, each cell painted the way that style looks;
 *  the chosen one carries a check mark and nothing else is written on them */
function VariantRow({ kind, value, onChange, p }: { kind: Item["kind"]; value: Variant; onChange: (v: Variant) => void; p: Palette }) {
  const variants = variantsOf(kind);
  const h = 40;
  return (
    <div role="radiogroup" style={{ display: "flex", gap: 3 }}>
      {variants.map((v, i) => {
        const on = v.key === value;
        const st = variantStyle(v.key, p);
        const first = i === 0;
        const last = i === variants.length - 1;
        return (
          <button
            key={v.key}
            role="radio"
            aria-checked={on}
            title={v.label}
            aria-label={v.label}
            onClick={() => onChange(v.key)}
            className="m3-press"
            style={{
              flex: 1,
              minWidth: 0,
              height: h,
              padding: "0 4px",
              cursor: "pointer",
              borderTopLeftRadius: first ? h / 2 : R_INNER,
              borderBottomLeftRadius: first ? h / 2 : R_INNER,
              borderTopRightRadius: last ? h / 2 : R_INNER,
              borderBottomRightRadius: last ? h / 2 : R_INNER,
              ...st,
              /* a text button paints nothing, so its cell gets a faint edge to be found by */
              border: v.key === "outlined" ? st.border : v.key === "text" ? `1px dashed ${p.outlineVariant}` : "none",
              boxShadow: v.key === "elevated" ? "0 1px 3px rgba(0,0,0,0.2)" : "none",
              fontSize: 11,
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 3,
              overflow: "hidden",
              whiteSpace: "nowrap",
            }}
          >
            {on && <Icon name="check" size={20} />}
          </button>
        );
      })}
    </div>
  );
}

/** the width presets as one connected run. The four names carry the meaning on their own, so the
 *  cells stay plain words: a drawing next to them only repeated what the word already said. */
function WidthRow({ value, onChange, frameW, p }: { value: number | undefined; onChange: (size: number | undefined) => void; frameW: number; p: Palette }) {
  const lang = useLang();
  const cells: { key: string; size?: number; label: string; hint: string }[] = [
    { key: "auto", label: t("autoWidth", lang), hint: t("autoWidthHint", lang) },
    { key: "half", size: halfWidth(frameW), label: t("halfWidth", lang), hint: t("halfWidthHint", lang) },
    { key: "content", size: contentWidth(frameW), label: t("contentWidth", lang), hint: t("contentWidthHint", lang) },
    { key: "screen", size: frameW, label: t("screenWidth", lang), hint: t("screenWidthHint", lang) },
  ];
  const h = 40;
  return (
    <div role="radiogroup" style={{ display: "flex", gap: 3 }}>
      {cells.map((c, i) => {
        const on = value === c.size;
        const first = i === 0;
        const last = i === cells.length - 1;
        /* the word says what the width is for, the number says what it comes to on this screen */
        const title = `${c.label}${c.size ? ` · ${c.size}dp` : ""} — ${c.hint}`;
        return (
          <button
            key={c.key}
            role="radio"
            aria-checked={on}
            title={title}
            aria-label={title}
            onClick={() => onChange(c.size)}
            className="m3-press"
            style={{
              flex: 1,
              minWidth: 0,
              height: h,
              border: "none",
              padding: "0 4px",
              cursor: "pointer",
              borderTopLeftRadius: first ? h / 2 : R_INNER,
              borderBottomLeftRadius: first ? h / 2 : R_INNER,
              borderTopRightRadius: last ? h / 2 : R_INNER,
              borderBottomRightRadius: last ? h / 2 : R_INNER,
              background: on ? p.primary : p.surfaceContainerHigh,
              color: on ? p.onPrimary : p.onSurfaceVariant,
              fontSize: 12,
              fontWeight: on ? 700 : 600,
              overflow: "hidden",
              whiteSpace: "nowrap",
              transition: "background 120ms, color 120ms",
              textOverflow: "ellipsis",
            }}
          >
            {c.label}
          </button>
        );
      })}
    </div>
  );
}

/** the heights M3 names, as one connected run. Each cell carries its own name, because XS to XL
 *  (and S to L for a FAB) is what the size is called everywhere else in Material. */
function HeightRow({ value, onChange, steps, p }: { value: number; onChange: (h: number) => void; steps?: { key: string; h: number }[]; p: Palette }) {
  const h = 40;
  const cells = steps ?? BUTTON_SIZES.map((b) => ({ key: b.key, h: b.h }));
  return (
    <div role="radiogroup" style={{ display: "flex", gap: 3 }}>
      {cells.map((c, i) => {
        const on = value === c.h;
        const first = i === 0;
        const last = i === cells.length - 1;
        const label = c.key.toUpperCase();
        const title = `${label} · ${c.h}dp`;
        return (
          <button
            key={c.key}
            role="radio"
            aria-checked={on}
            title={title}
            aria-label={title}
            onClick={() => onChange(c.h)}
            className="m3-press"
            style={{
              flex: 1,
              minWidth: 0,
              height: h,
              border: "none",
              padding: "0 4px",
              cursor: "pointer",
              borderTopLeftRadius: first ? h / 2 : R_INNER,
              borderBottomLeftRadius: first ? h / 2 : R_INNER,
              borderTopRightRadius: last ? h / 2 : R_INNER,
              borderBottomRightRadius: last ? h / 2 : R_INNER,
              background: on ? p.primary : p.surfaceContainerHigh,
              color: on ? p.onPrimary : p.onSurfaceVariant,
              fontSize: 12,
              fontWeight: on ? 700 : 600,
              overflow: "hidden",
              whiteSpace: "nowrap",
              transition: "background 120ms, color 120ms",
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

/** the three shapes a FAB takes, as one connected run: the circle, the one with a label, and
 *  the one that opens a menu. Picking one turns the part into it, keeping what they share. */
function FabTypeRow({ value, onChange, p }: { value: FabKind; onChange: (k: FabKind) => void; p: Palette }) {
  const lang = useLang();
  const words: Record<FabKind, string> = { fab: t("fabPlain", lang), extendedFab: t("fabExtended", lang) };
  return (
    <Segmented<FabKind>
      options={FAB_KINDS.map((k) => ({ key: k, label: words[k], title: KIND_TEXT[lang][k]?.noun ?? KIND_SPEC[k].label }))}
      value={value}
      onChange={onChange}
      p={p}
    />
  );
}

/** What a FAB menu opens: one row per entry, dragged by the handle at the start of its words.
 *  Carrying a row down onto the button that adds entries turns that button into the one that
 *  takes this one out, so there is nothing to delete with until something is being dragged. */
function MenuItems({ item, onChange, p }: { item: Item; onChange: (patch: Partial<Item>) => void; p: Palette }) {
  const lang = useLang();
  const [pick, setPick] = useState<number | null>(null);
  const [dragging, setDragging] = useState<number | null>(null);
  const [overBin, setOverBin] = useState(false);
  const bin = useRef<HTMLButtonElement | null>(null);
  const tabs: NavTab[] = item.tabs ?? [];
  /* a name per row that survives a reorder, so the list knows which row moved where */
  const keys = useRef<string[]>([]);
  if (keys.current.length !== tabs.length) {
    keys.current = tabs.map((_, i) => keys.current[i] ?? `e${i}-${Math.random().toString(36).slice(2, 7)}`);
  }
  const set = (i: number, patch: Partial<NavTab>) => onChange({ tabs: tabs.map((t, j) => (j === i ? { ...t, ...patch } : t)) });
  const onBin = (e: { clientX: number; clientY: number }) => {
    const r = bin.current?.getBoundingClientRect();
    return !!r && e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top - 8 && e.clientY <= r.bottom + 8;
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <Reorder.Group
        axis="y"
        values={keys.current}
        onReorder={(next: string[]) => {
          const order = next.map((k) => keys.current.indexOf(k));
          keys.current = next;
          onChange(reorderTabsPatch(item, order));
        }}
        style={{ display: "flex", flexDirection: "column", gap: 6, padding: 0, margin: 0 }}
      >
        {tabs.map((tab, i) => (
          <MenuRow
            key={keys.current[i]}
            id={keys.current[i]}
            tab={tab}
            open={pick === i}
            onPick={() => setPick(pick === i ? null : i)}
            onLabel={(label) => set(i, { label })}
            onDragStart={() => setDragging(i)}
            onDrag={(e) => setOverBin(onBin(e))}
            onDragEnd={(e) => {
              const drop = onBin(e);
              setDragging(null);
              setOverBin(false);
              if (drop && tabs.length > 1) onChange(removeTabPatch(item, i));
            }}
            p={p}
          />
        ))}
      </Reorder.Group>
      {pick !== null && tabs[pick] && (
        <IconPicker value={tabs[pick].icon} onChange={(icon) => set(pick, { icon: icon ?? "" })} onClose={() => setPick(null)} palette={p} />
      )}
      <button
        ref={bin}
        onClick={() => {
          const spare = defaultTabsFor("fabMenu");
          onChange({ tabs: [...tabs, { ...spare[tabs.length % spare.length] }] });
        }}
        className="m3-press"
        style={{
          height: 44,
          borderRadius: 22,
          border: `1px ${dragging !== null ? "dashed" : "solid"} ${overBin ? p.error : dragging !== null ? p.error : p.outline}`,
          background: overBin ? p.errorContainer : "transparent",
          color: dragging !== null ? p.error : p.primary,
          fontSize: 13,
          fontWeight: 600,
          cursor: dragging !== null ? "copy" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          transition: "background 120ms, color 120ms, border-color 120ms",
        }}
      >
        <Icon name={dragging !== null ? "delete" : "add"} size={18} />
        {t(dragging !== null ? "dropToRemove" : "addTab", lang)}
      </button>
      {/* how an entry is moved and how it is taken out, in the one line it takes to say */}
      <div style={{ fontSize: 11, lineHeight: 1.4, color: p.onSurfaceVariant, padding: "0 6px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {t("menuItemsHint", lang)}
      </div>
    </div>
  );
}

/** one entry: the handle at the start of its words, the words, and the icon beside them */
function MenuRow({
  id,
  tab,
  open,
  onPick,
  onLabel,
  onDragStart,
  onDrag,
  onDragEnd,
  p,
}: {
  id: string;
  tab: NavTab;
  open: boolean;
  onPick: () => void;
  onLabel: (v: string) => void;
  onDragStart: () => void;
  onDrag: (e: { clientX: number; clientY: number }) => void;
  onDragEnd: (e: { clientX: number; clientY: number }) => void;
  p: Palette;
}) {
  const lang = useLang();
  const controls = useDragControls();
  return (
    <Reorder.Item
      value={id}
      dragListener={false}
      dragControls={controls}
      onDragStart={onDragStart}
      onDrag={(e) => onDrag(e as PointerEvent)}
      onDragEnd={(e) => onDragEnd(e as PointerEvent)}
      style={{ listStyle: "none", display: "flex", gap: 6, alignItems: "center", position: "relative" }}
    >
      <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
        <Field value={tab.label} onChange={onLabel} placeholder={t("label", lang)} p={p} icon="drag_indicator" height={44} />
        {/* the handle sits where the field draws its mark, and is the only thing that drags */}
        <span
          onPointerDown={(e) => {
            e.preventDefault();
            controls.start(e);
          }}
          title={t("reorder", lang)}
          style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 38, cursor: "grab", touchAction: "none" }}
        />
      </div>
      <button
        onClick={onPick}
        title={t("changeIcon", lang)}
        aria-label={t("changeIcon", lang)}
        aria-expanded={open}
        className="m3-press"
        style={{
          width: 44,
          height: 44,
          flex: "0 0 auto",
          borderRadius: 22,
          border: tab.icon || open ? "none" : `1.5px dashed ${p.outline}`,
          background: open ? p.primary : tab.icon ? p.surfaceContainerHigh : "transparent",
          color: open ? p.onPrimary : tab.icon ? p.onSurface : p.outline,
          cursor: "pointer",
          display: "grid",
          placeItems: "center",
        }}
      >
        {tab.icon ? <Icon name={tab.icon} size={22} /> : <Icon name="add" size={20} />}
      </button>
    </Reorder.Item>
  );
}

/** a small mark at the start of a row that says which look the row edits: the normal one or the "on" one */
function StateMark({ on, p, title }: { on: boolean; p: Palette; title: string }) {
  return (
    <span title={title} aria-label={title} style={{ width: 24, flex: "0 0 auto", display: "grid", placeItems: "center", color: on ? p.primary : p.outline }}>
      <Icon name={on ? "check_circle" : "radio_button_unchecked"} size={20} fill={on} />
    </span>
  );
}

/** the toggle button itself on a small stage: tapping it flips between its two looks, and the
 *  corner says which one is showing */
function ToggleStage({ item, shownOn, onPick, p }: { item: Item; shownOn: boolean; onPick: (on: boolean) => void; p: Palette }) {
  const lang = useLang();
  /* the stage keeps the width the button was given; a button wider than the panel is drawn to scale */
  const look: Item = shownOn
    ? { ...item, label: item.toggle?.label ?? item.label, icon: toggleIcon(item), variant: item.toggle?.variant ?? item.variant }
    : item;
  const stage = useRef<HTMLDivElement | null>(null);
  const [avail, setAvail] = useState(0);
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setAvail(el.clientWidth));
    ro.observe(el);
    setAvail(el.clientWidth);
    return () => ro.disconnect();
  }, []);
  /* a button wider than the stage is zoomed out until it fits, and stays centred either way */
  const k = item.size && avail ? Math.min(1, (avail - 32) / item.size) : 1;
  return (
    <div
      ref={stage}
      style={{
        position: "relative",
        height: 132,
        borderRadius: 16,
        overflow: "hidden",
        backgroundColor: p.surfaceContainerLow,
        backgroundImage: `radial-gradient(${p.outlineVariant} 1px, transparent 1px)`,
        backgroundSize: "12px 12px",
        display: "grid",
        placeItems: "center",
      }}
    >
      <button
        onClick={() => onPick(!shownOn)}
        aria-pressed={shownOn}
        title={shownOn ? t("onState", lang) : t("normalState", lang)}
        className="m3-press"
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          border: "none",
          background: "transparent",
          padding: 0,
          cursor: "pointer",
          transform: `translate(-50%, -50%)${k < 1 ? ` scale(${k})` : ""}`,
        }}
      >
        <M3Static item={look} palette={p} style={{ transition: "background 200ms, color 200ms" }} />
      </button>
      {/* a hand in the corner: the stage is something to tap, and that is all it says */}
      <span aria-hidden style={{ position: "absolute", right: 10, top: 10, color: p.outline, display: "inline-flex" }}>
        <Icon name="touch_app" size={18} />
      </span>
    </div>
  );
}

export function ButtonInspector({
  ai,
  item,
  palette: p,
  frame,
  onChange,
  onDelete,
  onDuplicate,
  locked,
  onToggleLock,
  onPlace,
  measured,
  selfRect,
  allFrames,
  onShowOn,
  onShowMenu,
}: {
  ai: AiHooks;
  item: Item;
  palette: Palette;
  frame: Frame | null;
  onChange: (patch: Partial<Item>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  /** the group this button sits in is locked */
  locked?: boolean;
  onToggleLock?: () => void;
  onPlace?: PlaceFn;
  /** the width the button takes on its own when no width was set */
  measured?: number;
  /** where the button sits on the canvas, for the tap map */
  selfRect: { x: number; y: number; w: number; h: number } | null;
  /** every screen on the canvas, for the tap map */
  allFrames: Frame[];
  /** asks the canvas to draw this button in its "on" look (or the normal one again) */
  onShowOn?: (on: boolean) => void;
  /** asks the canvas to show this FAB's menu open while it is being set up */
  onShowMenu?: (open: boolean) => void;
}) {
  const lang = useLang();
  const spec = KIND_SPEC[item.kind];
  const [tab, setTab] = useState<Tab>("design");
  /** which entry of a FAB menu the trigger tab is setting */
  const [slot, setSlot] = useState("tab:0");
  /** which icon slot the picker edits: the normal look or the "on" look */
  const [picker, setPicker] = useState<"none" | "icon" | "toggle">("none");
  /** the canvas shows the "on" look while the on-row is being edited */
  const [shownOn, setShownOnState] = useState(false);
  const setShownOn = (on: boolean) => {
    setShownOnState(on);
    onShowOn?.(on);
  };
  useEffect(() => {
    setPicker("none");
    setShownOnState(false);
  }, [item.id]);
  /* the canvas shows the menu while this tab is open, and the button again when it is not */
  const menuShown = tab === "behavior" && hasMenu(item);
  useEffect(() => {
    onShowMenu?.(menuShown);
    return () => onShowMenu?.(false);
  }, [menuShown, onShowMenu]);

  const isIcon = item.kind === "iconButton";
  const fab = isFab(item.kind);
  /* a chip is as wide as its label makes it, and carries a selected look of its own */
  const chip = item.kind === "chip";
  /* a FAB may be asked to open a menu: the entries are its, and each has its own destination */
  const isMenu = hasMenu(item);
  const isExtended = item.kind === "extendedFab";
  /* the parts with no words of their own: their text section is the icon alone */
  const iconOnly = isIcon || item.kind === "fab";
  const isToggle = !!item.toggle;
  const isLink = item.action?.to === LINK_TARGET;
  const setToggle = (patch: Partial<NonNullable<Item["toggle"]>>) => onChange({ toggle: { ...(item.toggle ?? {}), ...patch } });

  /** what a tap does: nothing, flip the button's own look, go back, or open one of the screens */
  const actionValue = isToggle ? "toggle" : (item.action?.to ?? "none");
  const actionOptions: SelectOption[] = actionOptionsOf(item, frame, allFrames, lang);
  const pickAction = (k: string) => {
    if (k === MENU_TARGET) {
      onChange({ toggle: undefined, ...menuPatch(item, true) });
      return;
    }
    if (isMenu) onChange(menuPatch(item, false));
    if (k === "toggle") {
      /* the on look starts out filled, the usual M3 pair; a filled button turns tonal instead.
       * A toggle button stays on its screen, so a destination it had is dropped with it. */
      onChange({ toggle: { variant: item.variant === "filled" ? "tonal" : "filled" }, action: undefined });
      return;
    }
    setShownOn(false);
    setPicker("none");
    if (k === LINK_TARGET) {
      /* a link leaves the sketch for the browser, so no screen transition plays with it */
      onChange({ toggle: undefined, action: { to: LINK_TARGET, transition: "none", url: item.action?.url } });
      return;
    }
    const transition = item.action && item.action.to !== LINK_TARGET ? item.action.transition : "slide";
    onChange({ toggle: undefined, action: k === "none" ? undefined : { to: k, transition } });
  };

  const frameW = frame ? frameSizeOf(frame).w : PHONE_W;
  const size = spec.size ?? spec.size2 ?? { min: 40, max: PHONE_W, step: 4, icon: "width" };
  /* what the slider shows is the width on the canvas, even while the text sets it */
  const width = item.size ?? measured ?? spec.w;
  /* the one measure each shape is given: a circle's diameter, a label's height, a button's height */
  const height = chip ? chipHeightOf(item) : isExtended ? extendedFabHeight(item) : item.kind === "fab" ? (item.size ?? 56) : buttonHeightOf(item);
  /* a button is a circle at its narrowest, so how short it is says how narrow it can be */
  const minW = Math.min(buttonMinWidth(item), width);
  /* a circle's one measure is its width; a button's is its height, and a width the author set
   * that is now narrower than the button is tall grows with it */
  const setHeight = (v: number) =>
    onChange(isIcon || item.kind === "fab" ? { size: v } : isExtended || chip ? { size2: v } : item.size && item.size < v ? { size2: v, size: v } : { size2: v });

  const iconBtn = (icon: string | null, faint: boolean, open: boolean, title: string, onClick: () => void) => (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      aria-expanded={open}
      className="m3-press"
      style={{
        width: 44,
        height: 44,
        flex: "0 0 auto",
        borderRadius: 22,
        border: icon || open ? "none" : `1.5px dashed ${p.outline}`,
        background: open ? p.primary : icon ? p.surfaceContainerHigh : "transparent",
        color: open ? p.onPrimary : icon ? (faint ? p.outline : p.onSurface) : p.outline,
        cursor: "pointer",
        display: "grid",
        placeItems: "center",
        fontSize: 11,
        fontWeight: 700,
      }}
    >
      {icon ? <Icon name={icon} size={22} /> : "N/A"}
    </button>
  );
  const onIcon = toggleIcon(item);

  return (
    <PanelShell
      p={p}
      locked={!!locked}
      onUnlock={onToggleLock}
      head={<PartHeader kind={item.kind} p={p} locked={!!locked} onDuplicate={onDuplicate} onToggleLock={onToggleLock} onDelete={onDelete} />}
      tabs={<PartTabs value={tab} onChange={setTab} p={p} />}
    >
      {tab === "design" && (
        <>
          {fab && (
            <Section id="fab-type" icon="add_circle" title={t("fabType", lang)} p={p}>
              <FabTypeRow value={item.kind as FabKind} onChange={(k) => onChange(fabTypePatch(item, k))} p={p} />
            </Section>
          )}
          <Section id="btn-text" icon={iconOnly ? "insert_emoticon" : "short_text"} title={t(iconOnly ? "icon" : "text", lang)} p={p} onToggle={(open) => { if (!open) setPicker("none"); }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {isToggle && <StateMark on={false} p={p} title={t("normalState", lang)} />}
                {!iconOnly && (
                  <div style={{ flex: 1, minWidth: 0 }} onFocusCapture={() => setShownOn(false)}>
                    <Field value={item.label} onChange={(label) => onChange({ label })} placeholder={t("label", lang)} p={p} />
                  </div>
                )}
                {iconBtn(item.icon, false, picker === "icon", t("icon", lang), () => {
                  setShownOn(false);
                  setPicker(picker === "icon" ? "none" : "icon");
                })}
                {iconOnly && <span style={{ flex: 1 }} />}
              </div>
              {picker === "icon" && <IconPicker value={item.icon} onChange={(icon) => onChange({ icon })} onClose={() => setPicker("none")} palette={p} />}
              {isToggle && (
                /* the on look: an empty box keeps the normal text, shown faintly as the placeholder */
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <StateMark on p={p} title={t("onState", lang)} />
                  {!iconOnly && (
                    <div style={{ flex: 1, minWidth: 0 }} onFocusCapture={() => setShownOn(true)}>
                      <Field value={item.toggle?.label ?? ""} onChange={(label) => setToggle({ label: label || undefined })} placeholder={item.label || t("label", lang)} p={p} />
                    </div>
                  )}
                  {iconBtn(onIcon, item.toggle?.icon === undefined, picker === "toggle", t("icon", lang), () => {
                    setShownOn(true);
                    setPicker(picker === "toggle" ? "none" : "toggle");
                  })}
                  {iconOnly && <span style={{ flex: 1 }} />}
                </div>
              )}
              {picker === "toggle" && <IconPicker value={onIcon} onChange={(icon) => setToggle({ icon })} onClose={() => setPicker("none")} palette={p} />}
            </div>
          </Section>
          <Section id="btn-style" icon="palette" title={t("style", lang)} p={p}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {isToggle && <StateMark on={false} p={p} title={t("normalState", lang)} />}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <VariantRow
                    kind={item.kind}
                    value={item.variant}
                    onChange={(variant) => {
                      setShownOn(false);
                      onChange({ variant });
                    }}
                    p={p}
                  />
                </div>
              </div>
              {isToggle && (
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <StateMark on p={p} title={t("onState", lang)} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <VariantRow
                      kind={item.kind}
                      value={item.toggle?.variant ?? item.variant}
                      onChange={(variant) => {
                        setShownOn(true);
                        setToggle({ variant });
                      }}
                      p={p}
                    />
                  </div>
                </div>
              )}
              {chip && (
                /* a chip is either plain or picked out; the picked look is a style, so it is set here */
                <Toggle on={!!item.checked} onChange={(checked) => onChange({ checked })} p={p} icon="check_circle" label={t("selected", lang)} grow />
              )}
            </div>
          </Section>
          <Section id="btn-size" icon="straighten" title={t("size", lang)} p={p}>
            {/* the two axes are each a slider over its presets, with room between them so the
                eye can tell which row belongs to which measure. An icon button is a circle: it
                has one measure, and the row of M3 sizes is all it needs. */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {!isIcon && !fab && !chip && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <Slider icon="width" title={t("width", lang)} value={width} min={minW} max={frameW} step={size.step} onChange={(v) => onChange({ size: v })} p={p} />
                  <WidthRow value={item.size} onChange={(size) => onChange({ size })} frameW={frameW} p={p} />
                </div>
              )}
              {true && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <Slider
                    /* a part with one measure is sized corner to corner, and says so */
                    icon={isIcon || fab ? "open_in_full" : "height"}
                    title={t(isIcon || fab ? "size" : "height", lang)}
                    value={height}
                    min={chip ? CHIP_H_MIN : fab ? (isExtended ? 56 : FAB_H_MIN) : BUTTON_H_MIN}
                    max={chip ? CHIP_H_MAX : fab ? FAB_H_MAX : BUTTON_H_MAX}
                    step={size.step}
                    onChange={setHeight}
                    p={p}
                  />
                  <HeightRow
                    value={height}
                    onChange={setHeight}
                    steps={
                      chip
                        ? CHIP_SIZES.map((c) => ({ key: c.key, h: c.h }))
                        : fab
                          ? FAB_SIZES.map((f) => ({ key: f.key, h: isExtended ? f.h : f.d }))
                          : undefined
                    }
                    p={p}
                  />
                </div>
              )}
            </div>
          </Section>
          {onPlace && (
            <Section id="btn-align" icon="grid_on" title={t("align", lang)} p={p}>
              <AlignBox onPlace={onPlace} p={p} />
            </Section>
          )}
        </>
      )}

      {tab === "behavior" && (
        <Section id="btn-action" icon="ads_click" title={t("tapTo", lang)} p={p}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Select
              options={actionOptionsOf(item, frame, allFrames, lang)}
              value={isMenu ? MENU_TARGET : actionValue}
              onChange={pickAction}
              p={p}
              label={t("tapTo", lang)}
            />
            {isMenu && (
              <>
                <MenuItems item={item} onChange={onChange} p={p} />
                {/* the entry being sent somewhere, then where it goes */}
                <Segmented<string>
                  options={actionSlotsOf(item).map((sl) => ({ key: sl.key, icon: sl.value ?? undefined, label: sl.value ? undefined : sl.label, title: sl.label, dot: !!item.actions?.[sl.key] }))}
                  value={slot}
                  onChange={setSlot}
                  p={p}
                  height={40}
                />
                <Select
                  options={actionOptionsOf(item, frame, allFrames, lang).filter((o) => o.key !== "toggle")}
                  value={item.actions?.[slot]?.to ?? "none"}
                  onChange={(k) => {
                    const actions = { ...(item.actions ?? {}) };
                    if (k === "none") delete actions[slot];
                    else actions[slot] = { to: k, transition: k === LINK_TARGET ? "none" : (actions[slot]?.transition ?? "slide"), url: actions[slot]?.url };
                    onChange({ actions: Object.keys(actions).length ? actions : undefined });
                  }}
                  p={p}
                  label={t("tapTo", lang)}
                />
              </>
            )}
            {isMenu ? (
              <TapStage
                frames={allFrames}
                self={frame}
                selfRect={selfRect}
                action={item.actions?.[slot]}
                onChange={(a) => {
                  const actions = { ...(item.actions ?? {}) };
                  if (a) actions[slot] = a;
                  else delete actions[slot];
                  onChange({ actions: Object.keys(actions).length ? actions : undefined });
                }}
                p={p}
              />
            ) : isToggle ? (
              <>
                <ToggleStage item={item} shownOn={shownOn} onPick={setShownOn} p={p} />
                <div style={{ fontSize: 12, lineHeight: 1.5, color: p.onSurfaceVariant, padding: "0 4px" }}>{t("toggleLookHint", lang)}</div>
              </>
            ) : isLink ? (
              <LinkStage self={frame} selfRect={selfRect} action={item.action} onChange={(action) => onChange({ action })} p={p} />
            ) : (
              <TapStage frames={allFrames} self={frame} selfRect={selfRect} action={item.action} onChange={(action) => onChange({ action })} p={p} />
            )}
          </div>
        </Section>
      )}
      {tab === "behavior" && (
        <Section id="btn-note" icon="short_text" title={t(item.kind === "button" ? "noteDialog" : "partSpec", lang)} p={p}>
          <Field
            value={item.note ?? ""}
            onChange={(note) => onChange({ note })}
            placeholder={t("whenPressedExample", lang)}
            p={p}
            multiline
            grow
            rows={2}
            maxHeight={200}
            aiBusy={ai.busy}
            action={<AiIconBtn ai={ai} p={p} />}
          />
        </Section>
      )}
    </PanelShell>
  );
}
