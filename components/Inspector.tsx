"use client";

import { useEffect, useRef, useState } from "react";
import {
  Action,
  BACK_TARGET,
  CONTENT_W,
  Frame,
  FramePreset,
  HALF_W,
  Item,
  KIND_SPEC,
  PHONE_H,
  PHONE_W,
  Kind,
  NavTab,
  Palette,
  SWIPE_DIRS,
  SwipeDir,
  TAPPABLE,
  TOGGLEABLE,
  TRANSITIONS,
  Transition,
  VARIANTS,
  Variant,
  actionSlotsOf,
  contentWidth,
  defaultTabsFor,
  framePresetOf,
  frameSizeOf,
  halfWidth,
  isPhoneFrame,
  toggleIcon,
  iconSlotsOf,
  setIconSlot,
  variantStyle,
} from "@/lib/tokens";
import { IconPicker } from "./IconPicker";
import { Icon } from "./M3Node";
import { ButtonRun, CornerIcon, Field, IconBtn, Section, Segmented, SizePresets, Slider, TidyButton, TidyState, Toggle, TokenChips } from "./ui";
import { AiWriteBtn } from "./AiPanel";
import { popHistory } from "@/lib/ai";
import { KIND_TEXT, SWIPE_TEXT, TRANSITION_TEXT, t, useLang } from "@/lib/i18n";

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
      return [
        { key: "outlined", label: t("outlined") },
        { key: "filled", label: t("filled") },
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

const MAX_IMAGE_PX = 1200;

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

const heightPresetLabel = (v: number, frameHeight = PHONE_H): string | undefined =>
  v === frameHeight ? t("screenHeight") : v === frameHeight / 2 ? t("halfHeight") : undefined;

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

/** Downscale a picked file so the document stays small enough for localStorage. */
function readImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const s = Math.min(1, MAX_IMAGE_PX / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.max(1, Math.round(img.width * s));
      c.height = Math.max(1, Math.round(img.height * s));
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL("image/webp", 0.86));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("image"));
    };
    img.src = url;
  });
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

function TransitionPicker({ value, onChange, p }: { value: Transition; onChange: (t: Transition) => void; p: Palette }) {
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
function ActionEditor({
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

/** a multiline field with the AI button under it, fused with a button that swaps the AI text and the original once the AI has written it */
function AiField({ ai, history, onRestore, p, value, onChange, placeholder }: { ai: AiHooks; history?: string[]; onRestore: () => void; p: Palette; value: string; onChange: (v: string) => void; placeholder: string }) {
  const lang = useLang();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <Field value={value} onChange={onChange} placeholder={placeholder} p={p} multiline rows={3} />
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <ButtonRun>
          <AiWriteBtn p={p} busy={ai.busy} disabled={!ai.ready} onClick={ai.onRun} onCancel={ai.onCancel} label={t("aiWriteShort", lang)} title={ai.ready ? t("aiWrite", lang) : (ai.reason ?? t("aiNoKey", lang))} />
          {!!history?.length && <IconBtn icon="undo" p={p} size={40} on onClick={onRestore} title={t("aiRestore", lang)} />}
        </ButtonRun>
      </div>
    </div>
  );
}

export function FrameInspector({
  frame,
  palette: p,
  onChange,
  onDelete,
  onDuplicate,
  onPreview,
  prompt,
  onSaveImage,
  frames,
  tidy,
  onTidy,
  ai,
  onSize,
}: {
  frame: Frame;
  palette: Palette;
  onChange: (patch: Partial<Frame>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onPreview: () => void;
  prompt: string;
  onSaveImage: () => Promise<void>;
  frames: Frame[];
  /** what the tidy button offers: tidy the screen, undo the last tidy, or nothing (already tidy) */
  tidy: TidyState;
  onTidy: () => void;
  ai: AiHooks;
  onSize: (preset: FramePreset) => void;
}) {
  const lang = useLang();
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [swipeDir, setSwipeDir] = useState<SwipeDir>("left");
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1400);
    return () => clearTimeout(t);
  }, [copied]);
  const actionBtn = (icon: string, label: string, onClick: () => void, busy?: boolean) => (
    <button
      onClick={onClick}
      disabled={busy}
      className="m3-press"
      style={{
        flex: 1,
        height: 44,
        borderRadius: 22,
        border: "none",
        background: p.secondaryContainer,
        color: p.onSecondaryContainer,
        fontSize: 13,
        fontWeight: 600,
        cursor: busy ? "default" : "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        opacity: busy ? 0.6 : 1,
      }}
    >
      <Icon name={icon} size={20} />
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
          marginBottom: 10,
          padding: "6px 6px 6px 14px",
          borderRadius: 20,
          background: p.secondaryContainer,
          color: p.onSecondaryContainer,
        }}
      >
        <Icon name={isPhoneFrame(frame) ? "smartphone" : "desktop_windows"} size={20} />
        <span style={{ fontSize: 14, fontWeight: 600, flex: 1, minWidth: 0 }}>{t("screen", lang)}</span>
        <IconBtn icon="play_arrow" p={p} onClick={onPreview} title={t("previewFrom", lang)} size={32} fill />
        <IconBtn icon="content_copy" p={p} onClick={onDuplicate} title={t("duplicate", lang)} size={32} />
        <IconBtn icon="delete" p={p} danger onClick={onDelete} title={t("delete", lang)} size={32} />
      </div>
      <Section id="frame-size" icon="aspect_ratio" title={t("frameSize", lang)} p={p}>
        <FrameSizePicker frame={frame} palette={p} onChange={onSize} />
      </Section>
      <Section id="frame-name" icon="label" title={t("name", lang)} p={p}>
        <Field value={frame.name} onChange={(name) => onChange({ name })} placeholder={t("screenName", lang)} p={p} icon={isPhoneFrame(frame) ? "smartphone" : "desktop_windows"} />
      </Section>
      <Section id="frame-note" icon="notes" title={t("description", lang)} p={p}>
        <AiField ai={ai} history={frame.noteHistory} onRestore={() => onChange(popHistory(frame.note, frame.noteHistory, "note", "noteHistory"))} p={p} value={frame.note ?? ""} onChange={(note) => onChange({ note: note || undefined })} placeholder={t("screenDescription", lang)} />
      </Section>
      <Section id="frame-bg" icon="format_color_fill" title={t("background", lang)} p={p}>
        <TokenChips value={frame.bg ?? "surface"} onChange={(bg) => onChange({ bg })} p={p} />
      </Section>
      <Section id="frame-tidy" icon="align_space_even" title={t("tidy", lang)} p={p}>
        <TidyButton state={tidy} onClick={onTidy} p={p} />
      </Section>
      {frames.length > 1 && (
        <Section id="frame-swipe" icon="swipe" title={t("swipeTo", lang)} p={p}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Segmented<SwipeDir>
              options={SWIPE_DIRS.map((d) => ({ key: d.key, icon: d.icon, title: SWIPE_TEXT[lang][d.key], dot: !!frame.swipe?.[d.key] }))}
              value={swipeDir}
              onChange={setSwipeDir}
              p={p}
              height={36}
            />
            <FrameChips
              frames={frames.filter((f) => f.id !== frame.id)}
              value={frame.swipe?.[swipeDir] ?? null}
              onChange={(to) => {
                const swipe = { ...(frame.swipe ?? {}) };
                if (to) swipe[swipeDir] = to;
                else delete swipe[swipeDir];
                onChange({ swipe: Object.keys(swipe).length ? swipe : undefined });
              }}
              p={p}
              small
            />
          </div>
        </Section>
      )}
      <Section id="frame-export" icon="ios_share" title={t("export", lang)} p={p}>
        <ButtonRun>
          {actionBtn(
            copied ? "check" : "content_copy",
            copied ? t("copied", lang) : t("prompt", lang),
            async () => {
              try {
                await navigator.clipboard.writeText(prompt);
                setCopied(true);
              } catch {}
            },
          )}
          {actionBtn(
            "image",
            saving ? t("saving", lang) : t("saveImage", lang),
            async () => {
              setSaving(true);
              try {
                await onSaveImage();
              } finally {
                setSaving(false);
              }
            },
            saving,
          )}
        </ButtonRun>
        <div
          className="no-scrollbar"
          style={{
            marginTop: 10,
            maxHeight: 260,
            overflowY: "auto",
            borderRadius: 16,
            background: p.surfaceContainerLow,
            padding: 12,
            fontSize: 12,
            lineHeight: 1.7,
            color: p.onSurfaceVariant,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {prompt}
        </div>
      </Section>
    </div>
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
  multi,
  grouped,
  onGroup,
  onUngroup,
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
  multi: number;
  /** the selection is exactly one hand-made group */
  grouped?: boolean;
  onGroup?: () => void;
  onUngroup?: () => void;
}) {
  const lang = useLang();
  const fileRef = useRef<HTMLInputElement>(null);
  const slots = item ? iconSlotsOf(item) : [];
  const [slotKey, setSlotKey] = useState("icon");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [actionSlot, setActionSlot] = useState("");
  /** editing the "on" look of a toggle button instead of its normal look */
  const [onTab, setOnTab] = useState(false);

  useEffect(() => {
    setSlotKey(item ? (iconSlotsOf(item)[0]?.key ?? "icon") : "icon");
    setPickerOpen(false);
    setActionSlot("");
    setOnTab(false);
  }, [item?.id, item?.kind, item?.tabs?.length]);

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

  const spec = KIND_SPEC[item.kind];
  const frameSize = frame ? frameSizeOf(frame) : { w: PHONE_W, h: PHONE_H };
  const mapWidthPreset = (v: number) =>
    v === PHONE_W ? frameSize.w : v === CONTENT_W ? contentWidth(frameSize.w) : v === HALF_W ? halfWidth(frameSize.w) : v;
  const mapHeightPreset = (v: number) => (v === PHONE_H ? frameSize.h : v === PHONE_H / 2 ? frameSize.h / 2 : v);
  const widthMax = (max: number) =>
    max === PHONE_W ? frameSize.w : max === CONTENT_W ? contentWidth(frameSize.w) : max;
  const heightMax = (max: number) => (max === PHONE_H ? frameSize.h : max);
  const editOn = !!item.toggle && onTab;
  /* the on-state is edited through the same text / icon / style controls:
   * `shown` is what they display, `change` routes their patches into `toggle` */
  const shown: Item = editOn
    ? {
        ...item,
        label: item.toggle?.label ?? item.label,
        icon: toggleIcon(item),
        variant: item.toggle?.variant ?? item.variant,
      }
    : item;
  const change = (patch: Partial<Item>) => {
    if (!editOn) {
      onChange(patch);
      return;
    }
    const next = { ...(item.toggle ?? {}) };
    if ("label" in patch) next.label = patch.label;
    if ("icon" in patch) next.icon = patch.icon;
    if ("variant" in patch) next.variant = patch.variant;
    onChange({ toggle: next });
  };
  const activeSlot: { key: string; value: string | null } | undefined = (() => {
    const s = slots.find((x) => x.key === slotKey) ?? slots[0];
    return s && editOn && s.key === "icon" ? { ...s, value: shown.icon } : s;
  })();
  const actionSlots = actionSlotsOf(item);
  const slotBtn = (key: string, label: string | undefined, icon: string | null, on: boolean, onClick: () => void, dim?: boolean) => (
    <button
      key={key}
      onClick={onClick}
      title={label}
      className="m3-press"
      style={{
        height: 44,
        minWidth: 44,
        padding: label ? "0 14px 0 10px" : 0,
        borderRadius: 22,
        border: "none",
        background: on ? p.primary : p.surfaceContainerHigh,
        color: on ? p.onPrimary : dim ? p.outline : p.onSurface,
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      <Icon name={icon ?? "block"} size={22} />
      {label && <span>{label}</span>}
    </button>
  );
  const tabs: NavTab[] = item.tabs ?? [];
  const variants = spec.hasVariant ? variantsOf(item.kind) : [];

  const setTabCount = (n: number) => {
    const next: NavTab[] = [];
    const defaults = defaultTabsFor(item.kind);
    for (let i = 0; i < n; i++) next.push(tabs[i] ? { ...tabs[i] } : { ...defaults[i % defaults.length] });
    onChange({ tabs: next });
  };
  /** entries of a tab row have no icon; toolbar buttons have no label */
  const tabIcons = item.kind !== "tabs";
  const tabLabels = item.kind !== "toolbar";
  const mainSlots = slots.filter((s) => !s.key.startsWith("tab:"));

  const setTabLabel = (i: number, label: string) =>
    onChange({ tabs: tabs.map((t, j) => (j === i ? { ...t, label } : t)) });

  const hasRadius =
    item.kind === "bottomNav" ||
    item.kind === "navRail" ||
    item.kind === "topAppBar" ||
    item.kind === "card" ||
    item.kind === "image" ||
    item.kind === "box";

  return (
    <div className="no-scrollbar" style={{ padding: "12px 12px 20px", overflowY: "auto", height: "100%" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 10,
          padding: "6px 6px 6px 14px",
          borderRadius: 20,
          background: p.secondaryContainer,
          color: p.onSecondaryContainer,
        }}
      >
        <Icon name={spec.paletteIcon} size={20} />
        <span style={{ fontSize: 14, fontWeight: 600, flex: 1, minWidth: 0 }}>{KIND_TEXT[lang][item.kind]?.noun ?? spec.label}</span>
        <IconBtn icon="content_copy" p={p} onClick={onDuplicate} title={t("duplicateKey", lang)} size={32} />
        <IconBtn icon="delete" p={p} danger onClick={onDelete} title={t("delete", lang)} size={32} />
      </div>

      {TOGGLEABLE.includes(item.kind) && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "10px 4px 12px", marginBottom: 12 }}>
          <Toggle
            on={!!item.toggle}
            onChange={(on) => {
              onChange({ toggle: on ? {} : undefined });
              setOnTab(on);
              setPickerOpen(false);
            }}
            p={p}
            icon="swap_horiz"
            label={t("toggle", lang)}
            grow
          />
          {item.toggle && (
            <>
              <Segmented<"off" | "on">
                options={[
                  { key: "off", icon: "radio_button_unchecked", label: t("normalState", lang) },
                  { key: "on", icon: "check_circle", label: t("onState", lang) },
                ]}
                value={onTab ? "on" : "off"}
                onChange={(k) => {
                  setOnTab(k === "on");
                  setPickerOpen(false);
                }}
                p={p}
                height={36}
              />
              {editOn && <div style={{ fontSize: 11, color: p.onSurfaceVariant, padding: "0 4px" }}>{t("onStateHint", lang)}</div>}
            </>
          )}
        </div>
      )}

      {(spec.hasLabel || spec.hasSupporting) && (
        <Section id="text" icon="title" title={t("text", lang)} p={p}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {spec.hasLabel && (
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <Field
                  value={shown.label}
                  onChange={(label) => change({ label })}
                  placeholder={t("label", lang)}
                  p={p}
                  icon="short_text"
                />
                {item.kind === "text" && (
                  <IconBtn
                    icon="format_bold"
                    p={p}
                    size={44}
                    on={!!item.bold}
                    onClick={() => onChange({ bold: !item.bold })}
                    title={t("bold", lang)}
                  />
                )}
              </div>
            )}
            {spec.hasSupporting && !editOn && (
              <Field
                value={item.supporting ?? ""}
                onChange={(supporting) => onChange({ supporting })}
                placeholder={item.kind === "snackbar" ? t("action", lang) : t("supporting", lang)}
                p={p}
                icon="notes"
              />
            )}
          </div>
        </Section>
      )}

      {spec.hasTabs && !editOn && (
        <Section id="tabs" icon="view_column" title={t("tabs", lang)} p={p}>
          <Segmented
            options={(item.kind === "toolbar" ? [2, 3, 4, 5, 6] : [2, 3, 4, 5]).map((n) => ({ key: String(n), label: String(n) }))}
            value={String(tabs.length)}
            onChange={(k) => setTabCount(Number(k))}
            p={p}
            height={36}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10 }}>
            {tabs.map((tab, i) => {
              const on = slotKey === `tab:${i}` && pickerOpen;
              return (
                <div key={i} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  {tabIcons && (
                  <button
                    onClick={() => {
                      setSlotKey(`tab:${i}`);
                      setPickerOpen(true);
                    }}
                    title={t("changeIcon", lang)}
                    aria-label={t("changeIcon", lang)}
                    className="m3-press"
                    style={{
                      width: 40,
                      height: 40,
                      flex: "0 0 auto",
                      borderRadius: 20,
                      border: "none",
                      background: on ? p.primary : p.surfaceContainerHigh,
                      color: on ? p.onPrimary : p.onSurfaceVariant,
                      cursor: "pointer",
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <Icon name={tab.icon || "add"} size={20} />
                  </button>
                  )}
                  {tabLabels && <Field value={tab.label} onChange={(v) => setTabLabel(i, v)} placeholder={t("label", lang)} p={p} height={40} />}
                  {tabIcons && tab.icon && (
                    <IconBtn icon="close" p={p} size={40} onClick={() => onChange(setIconSlot(item, `tab:${i}`, null))} title={t("noIcon", lang)} />
                  )}
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {item.kind === "image" && !editOn && (
        <Section id="image" icon="image" title={t("image", lang)} p={p}>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={async (e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (!f) return;
              try {
                onChange({ src: await readImage(f) });
              } catch {}
            }}
          />
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <button
              onClick={() => fileRef.current?.click()}
              className="m3-press"
              style={{
                flex: 1,
                height: 44,
                borderRadius: 22,
                border: "none",
                background: p.primary,
                color: p.onPrimary,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Icon name="upload" size={20} />
              {t("pickImage", lang)}
            </button>
            {item.src && (
              <IconBtn icon="close" p={p} size={44} onClick={() => onChange({ src: undefined })} title={t("removeImage", lang)} />
            )}
          </div>
        </Section>
      )}

      {mainSlots.length > 0 && activeSlot && !item.src && (
        <Section id="icon" icon="emoji_symbols" title={t("icon", lang)} p={p}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {mainSlots.map((s) =>
              slotBtn(
                s.key,
                mainSlots.length > 1 ? s.label : undefined,
                editOn && s.key === "icon" ? shown.icon : s.value,
                s.key === activeSlot.key && pickerOpen,
                () => {
                  const on = s.key === activeSlot.key && pickerOpen;
                  setSlotKey(s.key);
                  setPickerOpen(!on);
                },
                !s.value,
              ),
            )}
            {activeSlot.value && !activeSlot.key.startsWith("tab:") && (
              <IconBtn
                icon="close"
                p={p}
                size={44}
                onClick={() => {
                  // a slot without an icon cannot be tapped, so its action goes too
                  const patch: Partial<Item> = setIconSlot(item, activeSlot.key, null);
                  if (!editOn && item.actions?.[activeSlot.key]) {
                    const actions = { ...item.actions };
                    delete actions[activeSlot.key];
                    patch.actions = Object.keys(actions).length ? actions : undefined;
                  }
                  change(patch);
                }}
                title={t("noIcon", lang)}
              />
            )}
          </div>
        </Section>
      )}

      {pickerOpen && activeSlot && (
        <div style={{ margin: "-4px 4px 12px" }}>
          <IconPicker
            value={activeSlot.value}
            onChange={(icon) => change(setIconSlot(item, activeSlot.key, icon))}
            palette={p}
          />
        </div>
      )}

      {variants.length > 0 && (
        <Section id="style" icon="palette" title={t("style", lang)} p={p}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {variants.map((v) => (
              <VariantSwatch
                key={v.key}
                v={v.key}
                label={v.label}
                p={p}
                on={shown.variant === v.key}
                onClick={() => change({ variant: v.key })}
              />
            ))}
          </div>
        </Section>
      )}

      {spec.hasFill && !editOn && (
        <Section id="fill" icon="format_color_fill" title={t("background", lang)} p={p}>
          <TokenChips value={item.fill ?? "surfaceContainerLow"} onChange={(fill) => onChange({ fill })} p={p} />
          {item.kind === "listItem" && (
            <>
              <div style={{ fontSize: 12, fontWeight: 600, color: p.onSurfaceVariant, margin: "10px 0 6px" }}>{t("iconBackground", lang)}</div>
              <TokenChips
                value={item.iconFill && item.iconFill !== "none" ? item.iconFill : "primaryContainer"}
                onChange={(iconFill) => onChange({ iconFill })}
                p={p}
                none
                noneOn={item.iconFill === "none"}
                onNone={() => onChange({ iconFill: "none" })}
              />
            </>
          )}
        </Section>
      )}

      {(spec.hasChecked || spec.hasValue || spec.hasWavy || spec.hasContained) && !editOn && (
        <Section id="state" icon="tune" title={t("state", lang)} p={p}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "2px 0" }}>
            {spec.hasChecked && (
              <Toggle
                on={!!item.checked}
                onChange={(checked) => onChange({ checked })}
                p={p}
                icon={item.kind === "chip" ? "check_circle" : item.kind === "box" ? "drag_handle" : "toggle_on"}
                label={item.kind === "chip" ? t("selected", lang) : item.kind === "box" ? t("handle", lang) : t("on", lang)}
                grow
              />
            )}
            {item.kind === "switch" && (
              <Toggle on={!item.noCheck} onChange={(on) => onChange({ noCheck: on ? undefined : true })} p={p} icon="check" label={t("thumbCheck", lang)} grow />
            )}
            {spec.hasContained && (
              <Toggle
                on={!!item.contained}
                onChange={(contained) => onChange({ contained })}
                p={p}
                icon="circle"
                label={t("container", lang)}
                grow
              />
            )}
            {spec.hasWavy && (
              <Toggle on={!!item.wavy} onChange={(wavy) => onChange({ wavy })} p={p} icon="airwave" label={t("wavy", lang)} grow />
            )}
            {spec.hasValue && item.kind !== "slider" && (
              <Toggle
                on={item.value !== undefined}
                onChange={(on) => onChange({ value: on ? 60 : undefined })}
                p={p}
                icon="percent"
                label={t("determinate", lang)}
                grow
              />
            )}
            {spec.hasValue && (item.kind === "slider" || item.value !== undefined) && (
              <Slider
                icon="percent"
                value={item.value ?? 40}
                min={0}
                max={100}
                step={1}
                onChange={(value) => onChange({ value })}
                p={p}
                unit="%"
              />
            )}
          </div>
        </Section>
      )}

      {(spec.size || hasRadius) && !editOn && (
        <Section id="size" icon="straighten" title={t("size", lang)} p={p}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {spec.size && (
              <>
                <Slider
                  icon={spec.size.icon}
                  title={
                    item.kind === "text"
                      ? t("fontSize", lang)
                      : spec.size.icon === "width"
                        ? t("width", lang)
                        : t("size", lang)
                  }
                  value={item.size ?? spec.defSize ?? spec.w}
                  min={spec.size.min}
                  max={widthMax(spec.size.max)}
                  step={spec.size.step}
                  onChange={(size) => onChange({ size })}
                  p={p}
                  unit={item.kind === "text" ? "sp" : ""}
                />
                {spec.size.presets && (
                  <SizePresets
                    values={[...new Set([...(frameSize.w !== PHONE_W && spec.size.icon === "width" && spec.size.presets.includes(CONTENT_W) ? [CONTENT_W] : []), ...spec.size.presets.map(mapWidthPreset)])].sort((a, b) => a - b)}
                    value={item.size ?? spec.defSize ?? spec.w}
                    min={spec.size.min}
                    max={widthMax(spec.size.max)}
                    onChange={(size) => onChange({ size })}
                    p={p}
                    labelOf={item.kind === "text" ? undefined : (v) => widthPresetLabel(v, frameSize.w)}
                  />
                )}
              </>
            )}
            {spec.size2 && (
              <>
                <Slider
                  icon={spec.size2.icon}
                  title={t("height", lang)}
                  value={item.size2 ?? spec.h}
                  min={spec.size2.min}
                  max={heightMax(spec.size2.max)}
                  step={spec.size2.step}
                  onChange={(size2) => onChange({ size2 })}
                  p={p}
                />
                {spec.size2.presets && (
                  <SizePresets
                    values={[...new Set(spec.size2.presets.map(mapHeightPreset))]}
                    value={item.size2 ?? spec.h}
                    min={spec.size2.min}
                    max={heightMax(spec.size2.max)}
                    onChange={(size2) => onChange({ size2 })}
                    p={p}
                    labelOf={(v) => heightPresetLabel(v, frameSize.h)}
                  />
                )}
              </>
            )}
            {hasRadius && (item.kind === "card" || item.kind === "image") && (
              <Slider
                icon="rounded_corner"
                title={t("cornerRadius", lang)}
                value={item.radiusTop ?? spec.radius}
                min={0}
                max={48}
                step={1}
                onChange={(radiusTop) => onChange({ radiusTop })}
                p={p}
              />
            )}
            {hasRadius && item.kind === "box" && (
              <Toggle
                on={!!item.corners}
                onChange={(each) =>
                  onChange(
                    each
                      ? { corners: { tl: item.radiusTop ?? 0, tr: item.radiusTop ?? 0, bl: item.radiusBottom ?? 0, br: item.radiusBottom ?? 0 } }
                      : { corners: undefined, radiusTop: item.corners?.tl ?? item.radiusTop, radiusBottom: item.corners?.bl ?? item.radiusBottom },
                  )
                }
                p={p}
                icon="crop_free"
                label={t("cornersEach", lang)}
                grow
              />
            )}
            {hasRadius && item.kind === "box" && item.corners && (
              <>
                {(["tl", "tr", "bl", "br"] as const).map((k) => (
                  <Slider
                    key={k}
                    iconNode={<CornerIcon side={k} />}
                    title={t(k === "tl" ? "cornerTl" : k === "tr" ? "cornerTr" : k === "bl" ? "cornerBl" : "cornerBr", lang)}
                    value={item.corners![k]}
                    min={0}
                    max={40}
                    step={1}
                    onChange={(v) => onChange({ corners: { ...item.corners!, [k]: v } })}
                    p={p}
                  />
                ))}
              </>
            )}
            {hasRadius && (item.kind === "bottomNav" || item.kind === "navRail" || item.kind === "topAppBar" || (item.kind === "box" && !item.corners)) && (
              <>
                {/* a rail's two sliders are its left and right sides; the fields are shared with the bars */}
                <Slider
                  iconNode={<CornerIcon side={item.kind === "navRail" ? "left" : "top"} />}
                  title={t(item.kind === "navRail" ? "cornerLeft" : "cornerTop", lang)}
                  value={item.radiusTop ?? 0}
                  min={0}
                  max={40}
                  step={1}
                  onChange={(radiusTop) => onChange({ radiusTop })}
                  p={p}
                />
                <Slider
                  iconNode={<CornerIcon side={item.kind === "navRail" ? "right" : "bottom"} />}
                  title={t(item.kind === "navRail" ? "cornerRight" : "cornerBottom", lang)}
                  value={item.radiusBottom ?? 0}
                  min={0}
                  max={40}
                  step={1}
                  onChange={(radiusBottom) => onChange({ radiusBottom })}
                  p={p}
                />
              </>
            )}
          </div>
        </Section>
      )}

      {(TAPPABLE.includes(item.kind) || actionSlots.length > 0) && frames.length > 0 && !editOn && (
        <Section id="action" icon="ads_click" title={t("tapTo", lang)} p={p}>
          {actionSlots.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Segmented<string>
                options={actionSlots.map((s) => ({
                  key: s.key,
                  icon: s.value ?? undefined,
                  label: s.value ? undefined : s.label,
                  title: s.label,
                  dot: !!item.actions?.[s.key],
                }))}
                value={actionSlot || actionSlots[0].key}
                onChange={setActionSlot}
                p={p}
                height={40}
              />
              {(() => {
                const key = actionSlot || actionSlots[0].key;
                return (
                  <ActionEditor
                    frames={frames}
                    action={item.actions?.[key]}
                    onChange={(a) => {
                      const actions = { ...(item.actions ?? {}) };
                      if (a) actions[key] = a;
                      else delete actions[key];
                      onChange({ actions: Object.keys(actions).length ? actions : undefined });
                    }}
                    p={p}
                  />
                );
              })()}
            </div>
          ) : (
            <ActionEditor frames={frames} action={item.action} onChange={(action) => onChange({ action })} p={p} />
          )}
        </Section>
      )}

      {!editOn && (
      <Section id="note" icon="bolt" title={t("behavior", lang)} p={p}>
        <AiField
          ai={ai}
          history={item.noteHistory}
          onRestore={() => onChange(popHistory(item.note, item.noteHistory, "note", "noteHistory"))}
          p={p}
          value={item.note ?? ""}
          onChange={(note) => onChange({ note })}
          placeholder={item.kind === "button" || item.kind === "fab" || item.kind === "iconButton" || item.kind === "extendedFab" ? t("whenPressed", lang) : t("whatItDoes", lang)}
        />
      </Section>
      )}
    </div>
  );
}
