"use client";

import { useEffect, useRef, useState } from "react";
import {
  CONTENT_W,
  Frame,
  HALF_W,
  Item,
  KIND_SPEC,
  PHONE_H,
  PHONE_W,
  Kind,
  NavTab,
  Palette,
  TAPPABLE,
  TRANSITIONS,
  Transition,
  VARIANTS,
  Variant,
  defaultTabs,
  iconSlotsOf,
  setIconSlot,
  variantStyle,
} from "@/lib/tokens";
import { IconPicker } from "./IconPicker";
import { Icon } from "./M3Node";
import { Field, IconBtn, Section, Segmented, SizePresets, Slider, Toggle, TokenChips } from "./ui";
import { t, useLang } from "@/lib/i18n";

export function variantsOf(kind: Kind): { key: Variant; label: string }[] {
  switch (kind) {
    case "card":
      return [
        { key: "tonal", label: "Filled" },
        { key: "elevated", label: "Elevated" },
        { key: "outlined", label: "Outlined" },
      ];
    case "textField":
      return [
        { key: "outlined", label: "Outlined" },
        { key: "filled", label: "Filled" },
      ];
    case "chip":
      return [
        { key: "outlined", label: "Outlined" },
        { key: "tonal", label: "Elevated" },
      ];
    case "fab":
    case "extendedFab":
      return VARIANTS.filter((v) => v.key !== "text" && v.key !== "elevated" && v.key !== "outlined");
    case "iconButton":
      return VARIANTS.filter((v) => v.key !== "elevated" && v.key !== "text").concat({
        key: "text",
        label: "Standard",
      });
    default:
      return VARIANTS;
  }
}

export function VariantSwatch({
  v,
  label,
  p,
  on,
  onClick,
}: {
  v: Variant;
  label: string;
  p: Palette;
  on: boolean;
  onClick: () => void;
}) {
  const st = variantStyle(v, p);
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={on}
      className="m3-press"
      style={{
        height: 40,
        borderRadius: 20,
        cursor: "pointer",
        fontSize: 12,
        fontWeight: 600,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        padding: "0 12px",
        ...st,
        boxShadow: v === "elevated" ? "0 1px 3px rgba(0,0,0,0.2)" : "none",
        outline: on ? `2px solid ${p.primary}` : "2px solid transparent",
        outlineOffset: 2,
      }}
    >
      {on && <Icon name="check" size={16} />}
      {label}
    </button>
  );
}

const MAX_IMAGE_PX = 1200;

/** hover text for a width preset that comes from the phone frame */
export const widthPresetLabel = (v: number): string | undefined =>
  v === PHONE_W ? t("screenWidth") : v === CONTENT_W ? t("contentWidth") : v === HALF_W ? t("halfWidth") : undefined;

const heightPresetLabel = (v: number): string | undefined =>
  v === PHONE_H ? t("screenHeight") : v === PHONE_H / 2 ? t("halfHeight") : undefined;

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
}: {
  frames: Frame[];
  value: string | null;
  onChange: (id: string | null) => void;
  p: Palette;
}) {
  const lang = useLang();
  const chip = (id: string | null, label: string, icon: string) => {
    const on = value === id;
    return (
      <button
        key={id ?? "none"}
        onClick={() => onChange(id)}
        className="m3-press"
        style={{
          height: 36,
          padding: "0 14px 0 10px",
          borderRadius: 18,
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
      {frames.map((f) => chip(f.id, f.name || t("screen", lang), "smartphone"))}
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
}: {
  frame: Frame;
  palette: Palette;
  onChange: (patch: Partial<Frame>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onPreview: () => void;
  prompt: string;
  onSaveImage: () => Promise<void>;
}) {
  const lang = useLang();
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
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
        <Icon name="smartphone" size={20} />
        <span style={{ fontSize: 14, fontWeight: 600, flex: 1, minWidth: 0 }}>{t("screen", lang)}</span>
        <IconBtn icon="play_arrow" p={p} onClick={onPreview} title={t("previewFrom", lang)} size={32} fill />
        <IconBtn icon="content_copy" p={p} onClick={onDuplicate} title={t("duplicate", lang)} size={32} />
        <IconBtn icon="delete" p={p} danger onClick={onDelete} title={t("delete", lang)} size={32} />
      </div>
      <Section id="frame-name" icon="label" title={t("name", lang)} p={p}>
        <Field value={frame.name} onChange={(name) => onChange({ name })} placeholder={t("screenName", lang)} p={p} icon="smartphone" />
      </Section>
      <Section id="frame-bg" icon="format_color_fill" title={t("background", lang)} p={p}>
        <TokenChips value={frame.bg ?? "surface"} onChange={(bg) => onChange({ bg })} p={p} />
      </Section>
      <Section id="frame-export" icon="ios_share" title={t("export", lang)} p={p}>
        <div style={{ display: "flex", gap: 6 }}>
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
        </div>
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
  item,
  palette: p,
  frames,
  onChange,
  onDelete,
  onDuplicate,
  multi,
}: {
  item: Item | null;
  palette: Palette;
  frames: Frame[];
  onChange: (patch: Partial<Item>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  multi: number;
}) {
  const lang = useLang();
  const fileRef = useRef<HTMLInputElement>(null);
  const slots = item ? iconSlotsOf(item) : [];
  const [slotKey, setSlotKey] = useState("icon");
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    setSlotKey(item ? (iconSlotsOf(item)[0]?.key ?? "icon") : "icon");
    setPickerOpen(false);
  }, [item?.id, item?.kind, item?.tabs?.length]);

  if (!item) {
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
        <div>
          <Icon name={multi > 1 ? "select_all" : "ads_click"} size={44} />
          {multi > 1 && (
            <div style={{ marginTop: 10, color: p.onSurfaceVariant, fontSize: 13 }}>
              {multi}
              <IconBtn icon="delete" p={p} danger onClick={onDelete} title={t("deleteSelection", lang)} />
            </div>
          )}
        </div>
      </div>
    );
  }

  const spec = KIND_SPEC[item.kind];
  const activeSlot = slots.find((s) => s.key === slotKey) ?? slots[0];
  const tabs: NavTab[] = item.tabs ?? [];
  const variants = spec.hasVariant ? variantsOf(item.kind) : [];

  const setTabCount = (n: number) => {
    const next: NavTab[] = [];
    for (let i = 0; i < n; i++) {
      const defaults = defaultTabs();
      next.push(tabs[i] ? { ...tabs[i] } : { ...defaults[i % defaults.length] });
    }
    onChange({ tabs: next });
  };

  const setTabLabel = (i: number, label: string) =>
    onChange({ tabs: tabs.map((t, j) => (j === i ? { ...t, label } : t)) });

  const hasRadius =
    item.kind === "bottomNav" ||
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
        <span style={{ fontSize: 14, fontWeight: 600, flex: 1, minWidth: 0 }}>{spec.label}</span>
        <IconBtn icon="content_copy" p={p} onClick={onDuplicate} title={t("duplicateKey", lang)} size={32} />
        <IconBtn icon="delete" p={p} danger onClick={onDelete} title={t("delete", lang)} size={32} />
      </div>

      {(spec.hasLabel || spec.hasSupporting) && (
        <Section id="text" icon="title" title={t("text", lang)} p={p}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {spec.hasLabel && (
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <Field
                  value={item.label}
                  onChange={(label) => onChange({ label })}
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
            {spec.hasSupporting && (
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

      {item.kind === "bottomNav" && (
        <Section id="tabs" icon="view_column" title={t("tabs", lang)} p={p}>
          <Segmented
            options={[2, 3, 4, 5].map((n) => ({ key: String(n), label: String(n) }))}
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
                  <Field value={tab.label} onChange={(v) => setTabLabel(i, v)} placeholder={t("label", lang)} p={p} height={40} />
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {item.kind === "image" && (
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

      {slots.length > 0 && activeSlot && item.kind !== "bottomNav" && !item.src && (
        <Section id="icon" icon="emoji_symbols" title={t("icon", lang)} p={p}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {slots.map((s) => {
              const on = s.key === activeSlot.key && pickerOpen;
              return (
                <button
                  key={s.key}
                  onClick={() => {
                    setSlotKey(s.key);
                    setPickerOpen(!(on && pickerOpen));
                  }}
                  title={s.label}
                  className="m3-press"
                  style={{
                    height: 44,
                    minWidth: 44,
                    padding: slots.length > 1 ? "0 14px 0 10px" : 0,
                    borderRadius: 22,
                    border: "none",
                    background: on ? p.primary : p.surfaceContainerHigh,
                    color: on ? p.onPrimary : s.value ? p.onSurface : p.outline,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  <Icon name={s.value ?? "block"} size={22} />
                  {slots.length > 1 && <span>{s.label}</span>}
                </button>
              );
            })}
            {activeSlot.value && (
              <IconBtn
                icon="close"
                p={p}
                size={44}
                onClick={() => onChange(setIconSlot(item, activeSlot.key, null))}
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
            onChange={(icon) => onChange(setIconSlot(item, activeSlot.key, icon))}
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
                on={item.variant === v.key}
                onClick={() => onChange({ variant: v.key })}
              />
            ))}
          </div>
        </Section>
      )}

      {(spec.hasChecked || spec.hasValue || spec.hasWavy || spec.hasContained) && (
        <Section id="state" icon="tune" title={t("state", lang)} p={p}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {spec.hasChecked && (
              <Toggle
                on={!!item.checked}
                onChange={(checked) => onChange({ checked })}
                p={p}
                icon={item.kind === "chip" ? "check_circle" : item.kind === "box" ? "drag_handle" : "toggle_on"}
                label={item.kind === "chip" ? t("selected", lang) : item.kind === "box" ? t("handle", lang) : t("on", lang)}
              />
            )}
            {spec.hasFill && (
              <TokenChips value={item.fill ?? "surfaceContainerLow"} onChange={(fill) => onChange({ fill })} p={p} />
            )}
            {spec.hasContained && (
              <Toggle
                on={!!item.contained}
                onChange={(contained) => onChange({ contained })}
                p={p}
                icon="circle"
                label={t("container", lang)}
              />
            )}
            {spec.hasWavy && (
              <Toggle on={!!item.wavy} onChange={(wavy) => onChange({ wavy })} p={p} icon="airwave" label={t("wavy", lang)} />
            )}
            {spec.hasValue && item.kind !== "slider" && (
              <Toggle
                on={item.value !== undefined}
                onChange={(on) => onChange({ value: on ? 60 : undefined })}
                p={p}
                icon="percent"
                label={t("determinate", lang)}
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

      {(spec.size || hasRadius) && (
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
                  max={spec.size.max}
                  step={spec.size.step}
                  onChange={(size) => onChange({ size })}
                  p={p}
                  unit={item.kind === "text" ? "sp" : ""}
                />
                {spec.size.presets && (
                  <SizePresets
                    values={spec.size.presets}
                    value={item.size ?? spec.defSize ?? spec.w}
                    min={spec.size.min}
                    max={spec.size.max}
                    onChange={(size) => onChange({ size })}
                    p={p}
                    labelOf={item.kind === "text" ? undefined : widthPresetLabel}
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
                  max={spec.size2.max}
                  step={spec.size2.step}
                  onChange={(size2) => onChange({ size2 })}
                  p={p}
                />
                {spec.size2.presets && (
                  <SizePresets
                    values={spec.size2.presets}
                    value={item.size2 ?? spec.h}
                    min={spec.size2.min}
                    max={spec.size2.max}
                    onChange={(size2) => onChange({ size2 })}
                    p={p}
                    labelOf={heightPresetLabel}
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
            {hasRadius && (item.kind === "bottomNav" || item.kind === "topAppBar" || item.kind === "box") && (
              <>
                <Slider
                  icon="vertical_align_top"
                  title={t("cornerTop", lang)}
                  value={item.radiusTop ?? 0}
                  min={0}
                  max={40}
                  step={1}
                  onChange={(radiusTop) => onChange({ radiusTop })}
                  p={p}
                />
                <Slider
                  icon="vertical_align_bottom"
                  title={t("cornerBottom", lang)}
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

      {TAPPABLE.includes(item.kind) && (
        <Section id="action" icon="ads_click" title={t("tapTo", lang)} p={p}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <FrameChips
              frames={frames}
              value={item.action?.to ?? null}
              onChange={(to) =>
                onChange({ action: to ? { to, transition: item.action?.transition ?? "slide" } : undefined })
              }
              p={p}
            />
            {item.action && (
              <Segmented<Transition>
                options={TRANSITIONS.map((tr) => ({ key: tr.key, icon: tr.icon, title: tr.label }))}
                value={item.action.transition}
                onChange={(transition) => onChange({ action: { ...item.action!, transition } })}
                p={p}
                height={36}
              />
            )}
          </div>
        </Section>
      )}

      <Section id="note" icon="bolt" title={t("behavior", lang)} p={p}>
        <Field
          value={item.note ?? ""}
          onChange={(note) => onChange({ note })}
          placeholder={
            item.kind === "button" || item.kind === "fab" || item.kind === "iconButton" || item.kind === "extendedFab"
              ? t("whenPressed", lang)
              : t("whatItDoes", lang)
          }
          p={p}
          multiline
          rows={3}
        />
      </Section>
    </div>
  );
}
