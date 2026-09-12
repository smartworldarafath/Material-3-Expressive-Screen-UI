"use client";

import { useEffect, useRef, useState } from "react";
import { BACK_TARGET, BUTTON_H_MAX, BUTTON_H_MIN, BUTTON_SIZES, Frame, Item, KIND_SPEC, LINK_TARGET, PHONE_W, Palette, R_INNER, Variant, buttonHeightOf, buttonMinWidth, contentWidth, frameSizeOf, halfWidth, isPhoneFrame, toggleIcon, variantStyle } from "@/lib/tokens";
import { IconPicker } from "./IconPicker";
import { Icon, M3Static } from "./M3Node";
import { Field, IconBtn, Section, Select, SelectOption, Slider } from "./ui";
import { AiHooks, variantsOf } from "./Inspector";
import { LinkStage, TapStage } from "./TapStage";
import { KIND_TEXT, t, useLang } from "@/lib/i18n";

type Tab = "design" | "behavior";
type Col = 0 | 1 | 2;
type Row3 = 0 | 1 | 2;
const COL_KIND = ["left", "centerH", "right"] as const;
const ROW_KIND = ["top", "centerV", "bottom"] as const;
export type PlaceFn = (col: (typeof COL_KIND)[number], row: (typeof ROW_KIND)[number]) => void;

/** the glyph a cell turns into once picked: three short bars sitting where the part now sits */
function AlignGlyph({ c, r, color }: { c: Col; r: Row3; color: string }) {
  const place = ["flex-start", "center", "flex-end"];
  return (
    <span aria-hidden style={{ width: 22, height: 22, display: "flex", flexDirection: "column", justifyContent: place[r], alignItems: place[c] }}>
      {[14, 8, 11].map((w, i) => (
        <span key={i} style={{ width: w, height: 3, borderRadius: 2, background: color, marginTop: i ? 2 : 0 }} />
      ))}
    </span>
  );
}

/** two M3 primary tabs with the underline indicator */
function Tabs({ value, onChange, p }: { value: Tab; onChange: (t: Tab) => void; p: Palette }) {
  const lang = useLang();
  const tabs: { key: Tab; icon: string; label: string }[] = [
    { key: "design", icon: "palette", label: t("design", lang) },
    { key: "behavior", icon: "bolt", label: t("trigger", lang) },
  ];
  return (
    <div role="tablist" style={{ display: "flex", borderBottom: `1px solid ${p.outlineVariant}`, margin: "0 -12px 16px" }}>
      {tabs.map((tab) => {
        const on = tab.key === value;
        return (
          <button
            key={tab.key}
            role="tab"
            aria-selected={on}
            onClick={() => onChange(tab.key)}
            className="m3-press"
            style={{
              flex: 1,
              height: 48,
              border: "none",
              background: "transparent",
              color: on ? p.primary : p.onSurfaceVariant,
              cursor: "pointer",
              position: "relative",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            <Icon name={tab.icon} size={20} fill={on} />
            {tab.label}
            {on && <span aria-hidden style={{ position: "absolute", left: 16, right: 16, bottom: 0, height: 3, borderRadius: "3px 3px 0 0", background: p.primary }} />}
          </button>
        );
      })}
    </div>
  );
}

/** a wide 3x3 grid of dots: one tap lines the part up on both axes, and the dot becomes a glyph for that spot */
function AlignBox({ onPlace, p }: { onPlace: PlaceFn; p: Palette }) {
  const lang = useLang();
  const [pick, setPick] = useState<[Col, Row3] | null>(null);
  const colTitle = [t("alignLeft", lang), t("alignCenterH", lang), t("alignRight", lang)];
  const rowTitle = [t("alignTop", lang), t("alignCenterV", lang), t("alignBottom", lang)];
  return (
    <div
      role="group"
      aria-label={t("align", lang)}
      style={{
        width: "100%",
        height: 108,
        borderRadius: 16,
        background: p.surfaceContainerHigh,
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gridTemplateRows: "repeat(3, 1fr)",
        padding: 4,
        boxSizing: "border-box",
      }}
    >
      {([0, 1, 2] as Row3[]).flatMap((r) =>
        ([0, 1, 2] as Col[]).map((c) => {
          const on = pick?.[0] === c && pick?.[1] === r;
          const title = `${colTitle[c]} / ${rowTitle[r]}`;
          return (
            <button
              key={`${c}${r}`}
              onClick={() => {
                setPick([c, r]);
                onPlace(COL_KIND[c], ROW_KIND[r]);
              }}
              title={title}
              aria-label={title}
              aria-pressed={on}
              className="m3-press"
              style={{
                border: "none",
                borderRadius: 12,
                background: on ? p.primary : "transparent",
                color: on ? p.onPrimary : p.outline,
                cursor: "pointer",
                display: "grid",
                placeItems: "center",
                padding: 0,
                transition: "background 120ms",
              }}
            >
              {on ? <AlignGlyph c={c} r={r} color={p.onPrimary} /> : <span aria-hidden style={{ width: 8, height: 8, borderRadius: 4, background: p.outline }} />}
            </button>
          );
        }),
      )}
    </div>
  );
}

/** the button styles as one connected run, each cell painted the way that style looks;
 *  the chosen one carries a check mark and nothing else is written on them */
function VariantRow({ value, onChange, p }: { value: Variant; onChange: (v: Variant) => void; p: Palette }) {
  const variants = variantsOf("button");
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

/** the five heights M3 names, as one connected run. Each cell carries its own name, because
 *  XS to XL is what the size is called everywhere else in Material. */
function HeightRow({ value, onChange, p }: { value: number; onChange: (h: number) => void; p: Palette }) {
  const h = 40;
  return (
    <div role="radiogroup" style={{ display: "flex", gap: 3 }}>
      {BUTTON_SIZES.map((c, i) => {
        const on = value === c.h;
        const first = i === 0;
        const last = i === BUTTON_SIZES.length - 1;
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

/** everything that can be done to the part itself, behind one button: the header stays a title */
function PartMenu({
  p,
  locked,
  onDuplicate,
  onToggleLock,
  onDelete,
}: {
  p: Palette;
  locked: boolean;
  onDuplicate: () => void;
  onToggleLock?: () => void;
  onDelete: () => void;
}) {
  const lang = useLang();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        setOpen(false);
      }
    };
    window.addEventListener("pointerdown", onDown, true);
    window.addEventListener("keydown", onKey, true);
    return () => {
      window.removeEventListener("pointerdown", onDown, true);
      window.removeEventListener("keydown", onKey, true);
    };
  }, [open]);
  const rows: { icon: string; label: string; danger?: boolean; onClick: () => void }[] = [
    { icon: "content_copy", label: t("duplicate", lang), onClick: onDuplicate },
    ...(onToggleLock ? [{ icon: locked ? "lock_open" : "lock", label: t(locked ? "unlock" : "lock", lang), onClick: onToggleLock }] : []),
    { icon: "delete", label: t("delete", lang), danger: true, onClick: onDelete },
  ];
  return (
    <div ref={box} style={{ position: "relative", flex: "0 0 auto" }}>
      <IconBtn icon="more_vert" p={p} on={open} onClick={() => setOpen((o) => !o)} title={t("more", lang)} size={32} />
      {open && (
        <div
          role="menu"
          style={{
            position: "absolute",
            right: 0,
            top: 38,
            zIndex: 40,
            minWidth: 168,
            padding: 4,
            borderRadius: 12,
            background: p.surfaceContainerHigh,
            boxShadow: "0 8px 24px rgba(0,0,0,0.18), 0 2px 6px rgba(0,0,0,0.10)",
          }}
        >
          {rows.map((r) => (
            <button
              key={r.icon}
              role="menuitem"
              onClick={() => {
                setOpen(false);
                r.onClick();
              }}
              className="m3-press"
              style={{
                width: "100%",
                height: 40,
                padding: "0 10px",
                border: "none",
                borderRadius: 8,
                background: "transparent",
                color: r.danger ? p.error : p.onSurface,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: 14,
                fontWeight: 500,
                textAlign: "left",
                whiteSpace: "nowrap",
              }}
            >
              <Icon name={r.icon} size={20} />
              {r.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** the AI writer inside the description field: drawn as quietly as the clear button beside it */
function AiIconBtn({ ai, p }: { ai: AiHooks; p: Palette }) {
  const lang = useLang();
  const live = ai.ready || ai.busy;
  const title = ai.busy ? t("cancel", lang) : ai.ready ? t("aiWrite", lang) : (ai.reason ?? t("aiNoKey", lang));
  return (
    <button
      onClick={ai.busy ? ai.onCancel : ai.onRun}
      disabled={!live}
      title={title}
      aria-label={title}
      style={{
        width: 30,
        height: 30,
        borderRadius: 15,
        border: "none",
        background: "transparent",
        color: live ? p.onSurfaceVariant : p.outline,
        cursor: live ? "pointer" : "default",
        display: "grid",
        placeItems: "center",
      }}
    >
      <span className={ai.busy ? "m3-spin" : undefined} style={{ display: "inline-flex" }}>
        <Icon name={ai.busy ? "progress_activity" : "auto_awesome"} size={16} />
      </span>
    </button>
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
}) {
  const lang = useLang();
  const spec = KIND_SPEC.button;
  const [tab, setTab] = useState<Tab>("design");
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

  const isToggle = !!item.toggle;
  const isLink = item.action?.to === LINK_TARGET;
  const setToggle = (patch: Partial<NonNullable<Item["toggle"]>>) => onChange({ toggle: { ...(item.toggle ?? {}), ...patch } });

  /** what a tap does: nothing, flip the button's own look, go back, or open one of the screens */
  const actionValue = isToggle ? "toggle" : (item.action?.to ?? "none");
  const actionOptions: SelectOption[] = [
    { key: "none", label: t("none", lang), icon: "block" },
    { key: "toggle", label: t("toggleTitle", lang), icon: "swap_horiz" },
    { key: BACK_TARGET, label: t("back", lang), icon: "arrow_back" },
    { key: LINK_TARGET, label: t("openLink", lang), icon: "open_in_new" },
    ...[...allFrames]
      .sort((a, b) => a.x - b.x || a.y - b.y)
      .filter((f) => f.id !== frame?.id)
      .map((f) => ({ key: f.id, label: f.name || t("screen", lang), icon: isPhoneFrame(f) ? "smartphone" : "desktop_windows" })),
  ];
  const pickAction = (k: string) => {
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
  const size = spec.size!;
  /* what the slider shows is the width on the canvas, even while the text sets it */
  const width = item.size ?? measured ?? spec.w;
  const height = buttonHeightOf(item);
  /* a button is a circle at its narrowest, so how short it is says how narrow it can be */
  const minW = Math.min(buttonMinWidth(item), width);
  /* a width the author set that is now narrower than the button is tall grows with it */
  const setHeight = (size2: number) => onChange(item.size && item.size < size2 ? { size2, size: size2 } : { size2 });

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
    <div className="no-scrollbar" style={{ padding: "12px 12px 20px", overflowY: "auto", height: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, padding: "0 2px 0 6px", color: p.onSurfaceVariant }}>
        <Icon name={spec.paletteIcon} size={20} />
        <span style={{ fontSize: 14, fontWeight: 600, flex: 1, minWidth: 0, color: p.onSurface }}>{KIND_TEXT[lang].button?.noun ?? spec.label}</span>
        <PartMenu p={p} locked={!!locked} onDuplicate={onDuplicate} onToggleLock={onToggleLock} onDelete={onDelete} />
      </div>

      <Tabs value={tab} onChange={setTab} p={p} />

      {tab === "design" && (
        <>
          <Section id="btn-text" icon="short_text" title={t("text", lang)} p={p} onToggle={(open) => { if (!open) setPicker("none"); }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {isToggle && <StateMark on={false} p={p} title={t("normalState", lang)} />}
                <div style={{ flex: 1, minWidth: 0 }} onFocusCapture={() => setShownOn(false)}>
                  <Field value={item.label} onChange={(label) => onChange({ label })} placeholder={t("label", lang)} p={p} />
                </div>
                {iconBtn(item.icon, false, picker === "icon", t("icon", lang), () => {
                  setShownOn(false);
                  setPicker(picker === "icon" ? "none" : "icon");
                })}
              </div>
              {picker === "icon" && <IconPicker value={item.icon} onChange={(icon) => onChange({ icon })} onClose={() => setPicker("none")} palette={p} />}
              {isToggle && (
                /* the on look: an empty box keeps the normal text, shown faintly as the placeholder */
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <StateMark on p={p} title={t("onState", lang)} />
                  <div style={{ flex: 1, minWidth: 0 }} onFocusCapture={() => setShownOn(true)}>
                    <Field value={item.toggle?.label ?? ""} onChange={(label) => setToggle({ label: label || undefined })} placeholder={item.label || t("label", lang)} p={p} />
                  </div>
                  {iconBtn(onIcon, item.toggle?.icon === undefined, picker === "toggle", t("icon", lang), () => {
                    setShownOn(true);
                    setPicker(picker === "toggle" ? "none" : "toggle");
                  })}
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
            </div>
          </Section>
          <Section id="btn-size" icon="straighten" title={t("size", lang)} p={p}>
            {/* the two axes are each a slider over its presets, with room between them so the
                eye can tell which row belongs to which measure */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <Slider icon="width" title={t("width", lang)} value={width} min={minW} max={frameW} step={size.step} onChange={(v) => onChange({ size: v })} p={p} />
                <WidthRow value={item.size} onChange={(size) => onChange({ size })} frameW={frameW} p={p} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <Slider icon="height" title={t("height", lang)} value={height} min={BUTTON_H_MIN} max={BUTTON_H_MAX} step={size.step} onChange={setHeight} p={p} />
                <HeightRow value={height} onChange={setHeight} p={p} />
              </div>
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
            <Select options={actionOptions} value={actionValue} onChange={pickAction} p={p} label={t("tapTo", lang)} />
            {isToggle ? (
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
        <Section id="btn-note" icon="short_text" title={t("noteDialog", lang)} p={p}>
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
    </div>
  );
}
