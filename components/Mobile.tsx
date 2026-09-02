"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Item, KIND_SPEC, PALETTES, Palette, iconSlotsOf, setIconSlot } from "@/lib/tokens";
import { Lang, t, useLang } from "@/lib/i18n";
import { IconPicker } from "./IconPicker";
import { Icon } from "./M3Node";
import { VariantSwatch, variantsOf } from "./Inspector";
import { Field, IconBtn, Segmented, Toggle } from "./ui";

const REPO_URL = "https://github.com/lnkiai/m3e-canvas";

/** Sheet that slides up from the bottom edge; the canvas above stays usable. */
export function BottomSheet({ p, onClose, children }: { p: Palette; onClose: () => void; children: React.ReactNode }) {
  const lang = useLang();
  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", stiffness: 420, damping: 38, mass: 0.8 }}
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        maxHeight: "72%",
        display: "flex",
        flexDirection: "column",
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        background: p.surfaceContainerLow,
        boxShadow: "0 -6px 24px rgba(0,0,0,0.16)",
        zIndex: 60,
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <button
        onClick={onClose}
        aria-label={t("close", lang)}
        style={{
          height: 26,
          border: "none",
          background: "transparent",
          display: "grid",
          placeItems: "center",
          cursor: "pointer",
          flex: "0 0 auto",
        }}
      >
        <span style={{ width: 32, height: 4, borderRadius: 2, background: p.outlineVariant }} />
      </button>
      <div className="no-scrollbar" style={{ overflowY: "auto", padding: "0 14px 16px", minHeight: 0 }}>
        {children}
      </div>
    </motion.div>
  );
}

function Row({ icon, label, p, children }: { icon: string; label: string; p: Palette; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 6,
          color: p.onSurfaceVariant,
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: 0.4,
        }}
      >
        <Icon name={icon} size={16} />
        {label}
      </div>
      {children}
    </div>
  );
}

/** The compact phone editor: text, icon, style, state and a one-line note. */
export function MobileInspector({
  item,
  palette: p,
  onChange,
  onDelete,
  onDuplicate,
  onClose,
}: {
  item: Item;
  palette: Palette;
  onChange: (patch: Partial<Item>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onClose: () => void;
}) {
  const lang = useLang();
  const spec = KIND_SPEC[item.kind];
  const slots = iconSlotsOf(item).filter((s) => !s.key.startsWith("tab:"));
  const [slotKey, setSlotKey] = useState(slots[0]?.key ?? "icon");
  const [pickerOpen, setPickerOpen] = useState(false);
  useEffect(() => {
    setSlotKey(iconSlotsOf(item)[0]?.key ?? "icon");
    setPickerOpen(false);
  }, [item.id]);
  const activeSlot = slots.find((s) => s.key === slotKey) ?? slots[0];
  const variants = spec.hasVariant ? variantsOf(item.kind) : [];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            background: p.secondaryContainer,
            color: p.onSecondaryContainer,
            display: "grid",
            placeItems: "center",
          }}
        >
          <Icon name={spec.paletteIcon} size={22} />
        </div>
        <span style={{ fontSize: 16, fontWeight: 700, color: p.onSurface, flex: 1 }}>{spec.label}</span>
        <IconBtn icon="content_copy" p={p} onClick={onDuplicate} title={t("duplicate", lang)} size={44} />
        <IconBtn icon="delete" p={p} danger onClick={onDelete} title={t("delete", lang)} size={44} />
        <IconBtn icon="check" p={p} on onClick={onClose} title={t("done", lang)} size={44} />
      </div>

      {(spec.hasLabel || spec.hasSupporting) && (
        <Row icon="title" label={t("text", lang)} p={p}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {spec.hasLabel && (
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <Field value={item.label} onChange={(label) => onChange({ label })} placeholder={t("label", lang)} p={p} icon="short_text" height={48} />
                {item.kind === "text" && (
                  <IconBtn icon="format_bold" p={p} size={48} on={!!item.bold} onClick={() => onChange({ bold: !item.bold })} title={t("bold", lang)} />
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
                height={48}
              />
            )}
          </div>
        </Row>
      )}

      {slots.length > 0 && activeSlot && (
        <Row icon="emoji_symbols" label={t("icon", lang)} p={p}>
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
                    height: 48,
                    minWidth: 48,
                    padding: slots.length > 1 ? "0 14px 0 10px" : 0,
                    borderRadius: 24,
                    border: "none",
                    background: on ? p.primary : p.surfaceContainerHigh,
                    color: on ? p.onPrimary : s.value ? p.onSurface : p.outline,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  <Icon name={s.value ?? "block"} size={24} />
                  {slots.length > 1 && <span>{s.label}</span>}
                </button>
              );
            })}
            {activeSlot.value && (
              <button
                onClick={() => onChange(setIconSlot(item, activeSlot.key, null))}
                className="m3-press"
                style={{
                  height: 48,
                  padding: "0 14px 0 10px",
                  borderRadius: 24,
                  border: `1px solid ${p.outline}`,
                  background: "transparent",
                  color: p.onSurfaceVariant,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                <Icon name="close" size={20} />
                {t("noIcon", lang)}
              </button>
            )}
          </div>
          {pickerOpen && (
            <div style={{ marginTop: 8 }}>
              <IconPicker value={activeSlot.value} onChange={(icon) => onChange(setIconSlot(item, activeSlot.key, icon))} palette={p} />
            </div>
          )}
        </Row>
      )}

      {variants.length > 0 && (
        <Row icon="palette" label={t("style", lang)} p={p}>
          <div className="no-scrollbar" style={{ display: "flex", gap: 6, overflowX: "auto", padding: "3px 3px 6px" }}>
            {variants.map((v) => (
              <VariantSwatch key={v.key} v={v.key} label={v.label} p={p} on={item.variant === v.key} onClick={() => onChange({ variant: v.key })} />
            ))}
          </div>
        </Row>
      )}

      {spec.hasChecked && (
        <Row icon="tune" label={t("state", lang)} p={p}>
          <Toggle
            on={!!item.checked}
            onChange={(checked) => onChange({ checked })}
            p={p}
            icon={item.kind === "chip" ? "check_circle" : item.kind === "box" ? "drag_handle" : "toggle_on"}
            label={item.kind === "chip" ? t("selected", lang) : item.kind === "box" ? t("handle", lang) : t("on", lang)}
          />
        </Row>
      )}

      <Row icon="bolt" label={t("behavior", lang)} p={p}>
        <Field value={item.note ?? ""} onChange={(note) => onChange({ note })} placeholder={["button", "fab", "iconButton", "extendedFab"].includes(item.kind) ? t("whenPressed", lang) : t("whatItDoes", lang)} p={p} icon="bolt" height={48} />
      </Row>
    </div>
  );
}

/** Theme, language and the project link, in one small sheet. */
export function MobileSettings({
  palette: p,
  paletteKey,
  onPalette,
  lang,
  onLang,
}: {
  palette: Palette;
  paletteKey: string;
  onPalette: (key: string) => void;
  lang: Lang;
  onLang: (l: Lang) => void;
}) {
  return (
    <div>
      <Row icon="palette" label={t("theme", lang)} p={p}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", padding: "2px 0" }}>
          {PALETTES.map((pal) => {
            const on = pal.key === paletteKey;
            return (
              <button
                key={pal.key}
                onClick={() => onPalette(pal.key)}
                title={pal.label}
                aria-label={pal.label}
                aria-pressed={on}
                className="m3-press"
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  border: "none",
                  background: pal.primary,
                  color: pal.onPrimary,
                  cursor: "pointer",
                  display: "grid",
                  placeItems: "center",
                  outline: on ? `3px solid ${p.onSurface}` : "3px solid transparent",
                  outlineOffset: 3,
                }}
              >
                {on && <Icon name="check" size={24} />}
              </button>
            );
          })}
        </div>
      </Row>
      <Row icon="translate" label={t("language", lang)} p={p}>
        <Segmented<Lang>
          options={[
            { key: "ja", label: "日本語" },
            { key: "en", label: "English" },
          ]}
          value={lang}
          onChange={onLang}
          p={p}
          height={44}
        />
      </Row>
      <a
        href={REPO_URL}
        target="_blank"
        rel="noreferrer"
        className="m3-press"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          height: 48,
          padding: "0 16px",
          borderRadius: 24,
          background: p.surfaceContainerHigh,
          color: p.onSurface,
          textDecoration: "none",
          fontSize: 14,
          fontWeight: 600,
        }}
      >
        <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
        </svg>
        GitHub
        <span style={{ flex: 1 }} />
        <Icon name="open_in_new" size={18} />
      </a>
    </div>
  );
}

/** Edit / duplicate / delete for the selected part, sized for thumbs. */
export function MobileActionBar({
  p,
  onEdit,
  onDuplicate,
  onDelete,
}: {
  p: Palette;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const lang = useLang();
  return (
    <div
      style={{
        position: "absolute",
        left: 14,
        bottom: "calc(16px + env(safe-area-inset-bottom))",
        display: "flex",
        gap: 4,
        padding: 6,
        borderRadius: 32,
        background: p.surface,
        boxShadow: "0 6px 18px rgba(0,0,0,0.14)",
        zIndex: 46,
      }}
    >
      <button
        onClick={onEdit}
        className="m3-press"
        style={{
          height: 52,
          padding: "0 20px 0 16px",
          borderRadius: 26,
          border: "none",
          background: p.primary,
          color: p.onPrimary,
          fontSize: 15,
          fontWeight: 700,
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Icon name="tune" size={22} />
        {t("edit", lang)}
      </button>
      <IconBtn icon="content_copy" p={p} size={52} title={t("duplicate", lang)} onClick={onDuplicate} />
      <IconBtn icon="delete" p={p} size={52} danger title={t("delete", lang)} onClick={onDelete} />
    </div>
  );
}
