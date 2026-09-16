"use client";

import { useState } from "react";
import {
  Action,
  BACK_TARGET,
  CONTENT_W,
  Frame,
  FramePreset,
  Item,
  PHONE_W,
  Kind,
  Palette,
  TRANSITIONS,
  Transition,
  VARIANTS,
  Variant,
  isFab,
  contentWidth,
  framePresetOf,
  halfWidth,
  isPhoneFrame,
  variantStyle,
  AlignKind,
} from "@/lib/tokens";
import { ButtonInspector } from "./ButtonInspector";
import { PartInspector } from "./PartInspector";
import { Icon } from "./M3Node";
import { ButtonRun, Field, IconBtn, Section, Segmented } from "./ui";
import { TRANSITION_TEXT, UIKey, t, useLang } from "@/lib/i18n";

export function variantsOf(kind: Kind): { key: Variant; label: string }[] {
  const variants = VARIANTS.map((v) => ({ ...v, label: t(v.key) }));
  switch (kind) {
    case "card":
      return [
        { key: "tonal", label: t("filled") },
        { key: "elevated", label: t("elevated") },
        { key: "outlined", label: t("outlined") },
      ];
    case "textField":
    case "select":
      return [
        { key: "outlined", label: t("outlined") },
        { key: "filled", label: t("filled") },
      ];
    case "searchBar":
      return [
        { key: "filled", label: t("filled") },
        { key: "outlined", label: t("outlined") },
      ];
    case "chip":
      return [
        { key: "outlined", label: t("outlined") },
        { key: "tonal", label: t("elevated") },
      ];
    case "fab":
    case "extendedFab":
    case "fabMenu":
      return variants.filter((v) => v.key !== "text" && v.key !== "elevated" && v.key !== "outlined");
    case "splitButton":
      return variants.filter((v) => v.key !== "text");
    case "toolbar":
      return [
        { key: "tonal", label: t("standard") },
        { key: "filled", label: t("vibrant") },
      ];
    case "iconButton":
      return variants.filter((v) => v.key !== "elevated" && v.key !== "text").concat({
        key: "text",
        label: t("standard"),
      });
    default:
      return variants;
  }
}

export function VariantSwatch({
  v,
  label,
  p,
  on,
  onClick,
  small,
}: {
  v: Variant;
  label: string;
  p: Palette;
  on: boolean;
  onClick: () => void;
  small?: boolean;
}) {
  const st = variantStyle(v, p);
  const h = small ? 32 : 40;
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={on}
      className="m3-press"
      style={{
        height: h,
        borderRadius: h / 2,
        cursor: "pointer",
        fontSize: small ? 11 : 12,
        fontWeight: 600,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        padding: small ? "0 10px" : "0 12px",
        ...st,
        boxShadow: v === "elevated" ? "0 1px 3px rgba(0,0,0,0.2)" : "none",
        outline: on ? `2px solid ${p.primary}` : "2px solid transparent",
        outlineOffset: 2,
      }}
    >
      {on && <Icon name="check" size={small ? 14 : 16} />}
      {label}
    </button>
  );
}

/** hover text for a width preset derived from the selected frame */
export const widthPresetLabel = (v: number, frameWidth = PHONE_W): string | undefined =>
  v === frameWidth
    ? t("screenWidth")
    : v === contentWidth(frameWidth)
      ? t("contentWidth")
      : v === halfWidth(frameWidth)
        ? t("halfWidth")
        : frameWidth !== PHONE_W && v === CONTENT_W
          ? t("columnWidth")
          : undefined;

export function FrameSizePicker({
  frame,
  palette: p,
  onChange,
  compact,
}: {
  frame: Frame;
  palette: Palette;
  onChange: (preset: FramePreset) => void;
  compact?: boolean;
}) {
  const lang = useLang();
  return (
    <Segmented<FramePreset>
      options={[
        { key: "phone", icon: "smartphone", label: compact ? undefined : t("phoneFrame", lang), title: t("phoneFrame", lang) },
        { key: "desktop", icon: "desktop_windows", label: compact ? undefined : t("desktopFrame", lang), title: t("desktopFrame", lang) },
      ]}
      value={framePresetOf(frame)}
      onChange={onChange}
      p={p}
      height={compact ? 36 : 40}
      grow={!compact}
    />
  );
}

function FrameChips({
  frames,
  value,
  onChange,
  p,
  back,
  small,
}: {
  frames: Frame[];
  value: string | null;
  onChange: (id: string | null) => void;
  p: Palette;
  /** offer "go back" as a target */
  back?: boolean;
  small?: boolean;
}) {
  const lang = useLang();
  const h = small ? 32 : 36;
  const chip = (id: string | null, label: string, icon: string) => {
    const on = value === id;
    return (
      <button
        key={id ?? "none"}
        onClick={() => onChange(id)}
        className="m3-press"
        style={{
          height: h,
          padding: "0 12px 0 8px",
          borderRadius: h / 2,
          border: "none",
          background: on ? p.primary : p.surfaceContainerHigh,
          color: on ? p.onPrimary : p.onSurfaceVariant,
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          maxWidth: "100%",
        }}
      >
        <Icon name={icon} size={18} />
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
      </button>
    );
  };
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {chip(null, t("none", lang), "block")}
      {back && chip(BACK_TARGET, t("goBack", lang), "arrow_back")}
      {frames.map((f) => chip(f.id, f.name || t("screen", lang), isPhoneFrame(f) ? "smartphone" : "desktop_windows"))}
    </div>
  );
}

export function TransitionPicker({ value, onChange, p }: { value: Transition; onChange: (t: Transition) => void; p: Palette }) {
  const lang = useLang();
  return (
    <Segmented<Transition>
      options={TRANSITIONS.map((tr) => ({ key: tr.key, icon: tr.icon, title: TRANSITION_TEXT[lang][tr.key] }))}
      value={value}
      onChange={onChange}
      p={p}
      height={34}
    />
  );
}

/** target frame (or back) plus the transition, for one tap target */
export function ActionEditor({
  frames,
  action,
  onChange,
  p,
}: {
  frames: Frame[];
  action: Action | undefined;
  onChange: (a: Action | undefined) => void;
  p: Palette;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <FrameChips
        frames={frames}
        value={action?.to ?? null}
        onChange={(to) => onChange(to ? { to, transition: action?.transition ?? "slide" } : undefined)}
        p={p}
        back
      />
      {action && action.to !== BACK_TARGET && (
        <TransitionPicker value={action.transition} onChange={(transition) => onChange({ ...action, transition })} p={p} />
      )}
    </div>
  );
}

/** what a field's AI button needs from the page; `reason` explains a disabled button */
export type AiHooks = { ready: boolean; reason?: string; busy: boolean; onRun: () => void; onCancel: () => void };

/** A small picture of what an alignment does: a dashed box for the reference (the screen's
 *  body for one part, the selection for several) and two bars placed the way the parts will be;
 *  spacing evenly shows three bars with equal gaps. */
function AlignGlyph({ kind, color, faint }: { kind: AlignKind; color: string; faint: string }) {
  const bars: [number, number, number, number][] =
    kind === "left" ? [[4, 7, 16, 6], [4, 15, 10, 6]]
    : kind === "centerH" ? [[12, 7, 16, 6], [15, 15, 10, 6]]
    : kind === "right" ? [[20, 7, 16, 6], [26, 15, 10, 6]]
    : kind === "distributeH" ? [[4, 8, 6, 12], [17, 8, 6, 12], [30, 8, 6, 12]]
    : kind === "top" ? [[12, 4, 6, 14], [22, 4, 6, 8]]
    : kind === "centerV" ? [[12, 7, 6, 14], [22, 10, 6, 8]]
    : kind === "bottom" ? [[12, 10, 6, 14], [22, 16, 6, 8]]
    : [[14, 4, 12, 4], [14, 12, 12, 4], [14, 20, 12, 4]];
  return (
    <svg width={40} height={28} viewBox="0 0 40 28" aria-hidden>
      <rect x={1} y={1} width={38} height={26} rx={3} fill="none" stroke={faint} strokeWidth={1} strokeDasharray="3 2" />
      {bars.map(([x, y, w, h], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} rx={1.5} fill={color} />
      ))}
    </svg>
  );
}

/** The alignment controls: one row for left / centre / right, one for top / middle / bottom,
 *  each ending in "space evenly", which needs at least two parts. One part lines up with its
 *  screen's body; several line up with each other. Each button draws its result. */
function AlignSection({ single, onAlign, p }: { single: boolean; onAlign: (kind: AlignKind) => void; p: Palette }) {
  const lang = useLang();
  const rows: [AlignKind, UIKey][][] = [
    [["left", "alignLeft"], ["centerH", "alignCenterH"], ["right", "alignRight"], ["distributeH", "distributeH"]],
    [["top", "alignTop"], ["centerV", "alignCenterV"], ["bottom", "alignBottom"], ["distributeV", "distributeV"]],
  ];
  return (
    <Section id="align" icon="align_horizontal_left" title={t("align", lang)} p={p}>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {rows.map((row, i) => (
          <ButtonRun key={i}>
            {row.map(([kind, key], j) => {
              const off = single && kind.startsWith("distribute");
              const outer = 22;
              const inner = 8;
              return (
                <button
                  key={kind}
                  onClick={() => onAlign(kind)}
                  disabled={off}
                  title={t(key, lang)}
                  aria-label={t(key, lang)}
                  className="m3-press"
                  style={{
                    flex: 1,
                    height: 44,
                    border: "none",
                    borderRadius: `${j === 0 ? outer : inner}px ${j === row.length - 1 ? outer : inner}px ${j === row.length - 1 ? outer : inner}px ${j === 0 ? outer : inner}px`,
                    background: p.surfaceContainerHigh,
                    cursor: off ? "default" : "pointer",
                    display: "grid",
                    placeItems: "center",
                    opacity: off ? 0.38 : 1,
                  }}
                >
                  <AlignGlyph kind={kind} color={off ? p.onSurfaceVariant : p.primary} faint={p.outline} />
                </button>
              );
            })}
          </ButtonRun>
        ))}
      </div>
    </Section>
  );
}

export function Inspector({
  ai,
  item,
  palette: p,
  frames,
  frame,
  onChange,
  onDelete,
  onDuplicate,
  locked,
  onToggleLock,
  multi,
  grouped,
  railStandalone = false,
  onGroup,
  onUngroup,
  onAlign,
  widths,
  onPlace,
  selfRect,
  allFrames,
  onShowOn,
  onShowMenu,
}: {
  /** the AI button beside the behavior field */
  ai: AiHooks;
  item: Item | null;
  palette: Palette;
  frames: Frame[];
  /** frame containing the selected part; its dimensions bound size controls */
  frame?: Frame | null;
  onChange: (patch: Partial<Item>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  /** every group holding the selection is locked */
  locked?: boolean;
  onToggleLock?: () => void;
  multi: number;
  /** the selection is exactly one hand-made group */
  grouped?: boolean;
  /** Modal expansion is available only when this rail owns its group. */
  railStandalone?: boolean;
  onGroup?: () => void;
  onUngroup?: () => void;
  /** lines the selected parts up with each other, or spaces them evenly */
  onAlign?: (kind: AlignKind) => void;
  /** measured widths of the parts that size themselves to their text */
  widths?: Record<string, number>;
  /** puts a lone part at one of nine spots in its screen's body, clear of the parts already there */
  onPlace?: (col: "left" | "centerH" | "right", row: "top" | "centerV" | "bottom") => void;
  /** where the selected part sits on the canvas, for the tap map */
  selfRect?: { x: number; y: number; w: number; h: number } | null;
  /** every screen on the canvas, whatever the frame mode; the tap map draws them all */
  allFrames?: Frame[];
  /** the canvas should draw the selected toggle button in its "on" look */
  onShowOn?: (on: boolean) => void;
  /** asks the canvas to show a FAB's menu open while it is being set up */
  onShowMenu?: (open: boolean) => void;
}) {
  const lang = useLang();

  if (!item) {
    if (multi > 1) {
      const bigBtn = (icon: string, label: string, onClick?: () => void) => (
        <button
          onClick={onClick}
          className="m3-press"
          style={{
            height: 48,
            borderRadius: 24,
            border: "none",
            background: p.primary,
            color: p.onPrimary,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            width: "100%",
          }}
        >
          <Icon name={icon} size={22} />
          {label}
        </button>
      );
      return (
        <div className="no-scrollbar" style={{ padding: "12px 12px 20px", overflowY: "auto", height: "100%" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 12,
              padding: "6px 6px 6px 14px",
              borderRadius: 20,
              background: p.secondaryContainer,
              color: p.onSecondaryContainer,
            }}
          >
            <Icon name={grouped ? "group_work" : "select_all"} size={20} />
            <span style={{ fontSize: 14, fontWeight: 600, flex: 1, minWidth: 0 }}>
              {grouped ? t("group", lang) : lang === "en" ? `${multi} ${t("selectedParts", lang)}` : `${multi}${t("selectedParts", lang)}`}
            </span>
            <IconBtn icon="delete" p={p} danger onClick={onDelete} title={t("deleteSelection", lang)} size={32} />
          </div>
          {onAlign && <AlignSection single={false} onAlign={onAlign} p={p} />}
          {grouped ? bigBtn("ungroup", t("ungroup", lang), onUngroup) : bigBtn("group_work", t("makeGroup", lang), onGroup)}
          <div style={{ marginTop: 10, fontSize: 12, lineHeight: 1.5, color: p.onSurfaceVariant, padding: "0 6px" }}>
            {grouped ? t("groupEditNote", lang) : `${t("groupHint", lang)} (Ctrl+G)`}
          </div>
        </div>
      );
    }
    return (
      <div
        style={{
          height: "100%",
          display: "grid",
          placeItems: "center",
          color: p.outlineVariant,
          padding: 24,
          textAlign: "center",
        }}
      >
        <Icon name="ads_click" size={44} />
      </div>
    );
  }

  /* the parts a tap sends somewhere and that fuse into a run are edited in the button's panel */
  if (item.kind === "button" || item.kind === "iconButton" || item.kind === "chip" || item.kind === "splitButton" || isFab(item.kind)) {
    return <ButtonInspector ai={ai} item={item} palette={p} frame={frame ?? null} onChange={onChange} onDelete={onDelete} onDuplicate={onDuplicate} locked={locked} onToggleLock={onToggleLock} onPlace={onPlace} measured={widths?.[item.id]} selfRect={selfRect ?? null} allFrames={allFrames ?? frames} onShowOn={onShowOn} onShowMenu={onShowMenu} />;
  }

  /* everything else shares one panel, built from the button's own */
  return (
    <PartInspector
      ai={ai}
      item={item}
      palette={p}
      frame={frame ?? null}
      onChange={onChange}
      onDelete={onDelete}
      onDuplicate={onDuplicate}
      locked={locked}
      onToggleLock={onToggleLock}
      onPlace={onPlace}
      selfRect={selfRect ?? null}
      allFrames={allFrames ?? frames}
      measured={widths?.[item.id]}
      railStandalone={railStandalone}
    />
  );
}
