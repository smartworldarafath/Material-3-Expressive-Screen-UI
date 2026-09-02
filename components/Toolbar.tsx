"use client";

import { FrameMode, Palette } from "@/lib/tokens";
import { Lang } from "@/lib/i18n";
import { IconBtn, Segmented } from "./ui";
import { t, useLang } from "@/lib/i18n";

export type Mode = "select" | "hand";

function Pill({ p, children }: { p: Palette; children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        padding: 6,
        borderRadius: 28,
        background: p.surfaceContainerLow,
        boxShadow: "0 2px 10px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.04)",
        pointerEvents: "auto",
      }}
    >
      {children}
    </div>
  );
}

export function Toolbar({
  p,
  mode,
  onMode,
  frame,
  onFrame,
  zoom,
  onZoom,
  onFit,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onClear,
  onAddFrame,
  onPreview,
  rightInset,
  onLang,
  mobile,
  onPrompt,
}: {
  p: Palette;
  mode: Mode;
  onMode: (m: Mode) => void;
  frame: FrameMode;
  onFrame: (f: FrameMode) => void;
  zoom: number;
  onZoom: (z: number) => void;
  onFit: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onAddFrame: () => void;
  onPreview: () => void;
  /** width of the open right panel, so the zoom pill slides out of its way */
  rightInset: number;
  lang: Lang;
  onLang: (l: Lang) => void;
  mobile?: boolean;
  onPrompt?: () => void;
}) {
  const lang = useLang();
  const langBtn = (
    <button
      onClick={() => onLang(lang === "ja" ? "en" : "ja")}
      title={t("language", lang)}
      className="m3-press"
      style={{
        height: 40,
        minWidth: 44,
        padding: "0 10px",
        borderRadius: 20,
        border: "none",
        background: "transparent",
        color: p.onSurfaceVariant,
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: 1,
        cursor: "pointer",
      }}
    >
      {lang === "ja" ? "JA" : "EN"}
    </button>
  );
  if (mobile) {
    return (
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 10,
          display: "flex",
          justifyContent: "center",
          pointerEvents: "none",
          zIndex: 40,
          padding: "0 8px",
        }}
      >
        <Pill p={p}>
          <Segmented<Mode>
            options={[
              {
                key: "select",
                icon: "arrow_selector_tool",
                title: t("select", lang),
              },
              { key: "hand", icon: "pan_tool", title: t("hand", lang) },
            ]}
            value={mode}
            onChange={onMode}
            p={p}
            height={40}
            grow={false}
          />
          <IconBtn
            icon="undo"
            p={p}
            onClick={onUndo}
            disabled={!canUndo}
            title={t("undo", lang)}
            size={40}
          />
          <IconBtn
            icon="redo"
            p={p}
            onClick={onRedo}
            disabled={!canRedo}
            title={t("redo", lang)}
            size={40}
          />
          <IconBtn
            icon="fit_screen"
            p={p}
            onClick={onFit}
            title={t("fit", lang)}
            size={40}
          />
          {frame === "phone" && (
            <IconBtn
              icon="play_arrow"
              p={p}
              onClick={onPreview}
              title={t("preview", lang)}
              size={40}
              fill
            />
          )}
          <IconBtn
            icon="auto_awesome"
            p={p}
            onClick={onPrompt}
            title={t("prompt", lang)}
            size={40}
          />
          {langBtn}
        </Pill>
      </div>
    );
  }
  return (
    <>
      <div
        style={{
          position: "fixed",
          right: rightInset + 22,
          bottom: 22,
          zIndex: 40,
          transition: "right 260ms cubic-bezier(0.2, 0, 0, 1)",
        }}
      >
        <Pill p={p}>
          <IconBtn
            icon="remove"
            p={p}
            onClick={() => onZoom(zoom / 1.2)}
            title={t("zoomOut", lang)}
            size={40}
          />
          <button
            onClick={onFit}
            title={t("fit", lang)}
            className="m3-press"
            style={{
              height: 40,
              minWidth: 56,
              borderRadius: 20,
              border: "none",
              background: "transparent",
              color: p.onSurface,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {Math.round(zoom * 100)}%
          </button>
          <IconBtn
            icon="add"
            p={p}
            onClick={() => onZoom(zoom * 1.2)}
            title={t("zoomIn", lang)}
            size={40}
          />
        </Pill>
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 14,
          display: "flex",
          justifyContent: "center",
          gap: 10,
          pointerEvents: "none",
          zIndex: 40,
          flexWrap: "nowrap",
          padding: "0 72px",
        }}
      >
        <Pill p={p}>
          <Segmented<Mode>
            options={[
              {
                key: "select",
                icon: "arrow_selector_tool",
                title: t("select", lang),
              },
              { key: "hand", icon: "pan_tool", title: t("hand", lang) },
            ]}
            value={mode}
            onChange={onMode}
            p={p}
            height={40}
            grow={false}
          />
        </Pill>

        <Pill p={p}>
          {frame === "phone" && (
            <IconBtn
              icon="add_to_photos"
              p={p}
              onClick={onAddFrame}
              title={t("addFrame", lang)}
              size={40}
            />
          )}
          <IconBtn
            icon="play_arrow"
            p={p}
            onClick={onPreview}
            title={t("preview", lang)}
            size={40}
            fill
          />
        </Pill>

        <Pill p={p}>
          <IconBtn
            icon="undo"
            p={p}
            onClick={onUndo}
            disabled={!canUndo}
            title={t("undo", lang)}
            size={40}
          />
          <IconBtn
            icon="redo"
            p={p}
            onClick={onRedo}
            disabled={!canRedo}
            title={t("redo", lang)}
            size={40}
          />
          <IconBtn
            icon="delete_sweep"
            p={p}
            onClick={onClear}
            title={t("clearAll", lang)}
            size={40}
          />
          {langBtn}
        </Pill>
      </div>
    </>
  );
}
