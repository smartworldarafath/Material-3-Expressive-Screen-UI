"use client";

import { useEffect, useRef, useState } from "react";
import { BACK_TARGET, Frame, Item, KIND_SPEC, LINK_TARGET, Palette, TAPPABLE, TOGGLEABLE, isPhoneFrame } from "@/lib/tokens";
import { Icon } from "./M3Node";
import { Field, IconBtn, Section, Select, SelectOption } from "./ui";
import { AiHooks } from "./Inspector";
import { LinkStage, TapStage } from "./TapStage";
import { KIND_TEXT, t, useLang } from "@/lib/i18n";

/* The chrome every part's panel wears: the title row with its menu, the two tabs, the grid that
 * lines a part up, the field the model writes into, and the tap action with its stage. A part
 * takes the pieces it has a use for -- a part nothing can be done to has no trigger tab at all. */

export type Tab = "design" | "behavior";
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
export function PartTabs({ value, onChange, p }: { value: Tab; onChange: (t: Tab) => void; p: Palette }) {
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
export function AlignBox({ onPlace, p }: { onPlace: PlaceFn; p: Palette }) {
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
export function AiIconBtn({ ai, p }: { ai: AiHooks; p: Palette }) {
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


/** the title row: what the part is, and everything that can be done to it behind one button */
export function PartHeader({
  kind,
  p,
  locked,
  onDuplicate,
  onToggleLock,
  onDelete,
}: {
  kind: Item["kind"];
  p: Palette;
  locked: boolean;
  onDuplicate: () => void;
  onToggleLock?: () => void;
  onDelete: () => void;
}) {
  const lang = useLang();
  const spec = KIND_SPEC[kind];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, padding: "0 2px 0 6px", color: p.onSurfaceVariant }}>
      <Icon name={spec.paletteIcon} size={20} />
      <span style={{ fontSize: 14, fontWeight: 600, flex: 1, minWidth: 0, color: p.onSurface }}>{KIND_TEXT[lang][kind]?.noun ?? spec.label}</span>
      <PartMenu p={p} locked={locked} onDuplicate={onDuplicate} onToggleLock={onToggleLock} onDelete={onDelete} />
    </div>
  );
}

/** what a tap can be sent to: nothing, the screen it came from, a web page, or another screen */
export function actionOptionsOf(item: Item, frame: Frame | null, frames: Frame[], lang: Parameters<typeof t>[1]): SelectOption[] {
  return [
    { key: "none", label: t("none", lang), icon: "block" },
    ...(TOGGLEABLE.includes(item.kind) ? [{ key: "toggle", label: t("toggleTitle", lang), icon: "swap_horiz" }] : []),
    { key: BACK_TARGET, label: t("back", lang), icon: "arrow_back" },
    { key: LINK_TARGET, label: t("openLink", lang), icon: "open_in_new" },
    ...[...frames]
      .sort((a, b) => a.x - b.x || a.y - b.y)
      .filter((f) => f.id !== frame?.id)
      .map((f) => ({ key: f.id, label: f.name || t("screen", lang), icon: isPhoneFrame(f) ? "smartphone" : "desktop_windows" })),
  ];
}

/** where a tap goes, with the map or the browser window under it. Parts that cannot be tapped
 *  never see this; the toggle a button can be is handled by the button's own panel. */
export function TriggerSection({
  item,
  frame,
  allFrames,
  selfRect,
  onChange,
  p,
}: {
  item: Item;
  frame: Frame | null;
  allFrames: Frame[];
  selfRect: { x: number; y: number; w: number; h: number } | null;
  onChange: (patch: Partial<Item>) => void;
  p: Palette;
}) {
  const lang = useLang();
  const isLink = item.action?.to === LINK_TARGET;
  const pick = (k: string) => {
    if (k === LINK_TARGET) {
      onChange({ action: { to: LINK_TARGET, transition: "none", url: item.action?.url } });
      return;
    }
    const transition = item.action && item.action.to !== LINK_TARGET ? item.action.transition : "slide";
    onChange({ action: k === "none" ? undefined : { to: k, transition } });
  };
  return (
    <Section id="part-action" icon="ads_click" title={t("tapTo", lang)} p={p}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <Select options={actionOptionsOf(item, frame, allFrames, lang)} value={item.action?.to ?? "none"} onChange={pick} p={p} label={t("tapTo", lang)} />
        {isLink ? (
          <LinkStage self={frame} selfRect={selfRect} action={item.action} onChange={(action) => onChange({ action })} p={p} />
        ) : (
          <TapStage frames={allFrames} self={frame} selfRect={selfRect} action={item.action} onChange={(action) => onChange({ action })} p={p} />
        )}
      </div>
    </Section>
  );
}

/** what the part is for, in the author's words, with the model's pen in the corner */
export function NoteSection({ item, ai, onChange, p }: { item: Item; ai: AiHooks; onChange: (patch: Partial<Item>) => void; p: Palette }) {
  const lang = useLang();
  return (
    <Section id="part-note" icon="short_text" title={t(item.kind === "button" ? "noteDialog" : "partSpec", lang)} p={p}>
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
  );
}

/** a part can be tapped through to somewhere, so its panel carries a trigger tab */
export const hasTrigger = (kind: Item["kind"]) => TAPPABLE.includes(kind);
