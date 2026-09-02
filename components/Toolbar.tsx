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
  const REPO_URL = "https://github.com/lnkiai/m3e-canvas";
  const githubBtn = (
    <a
      href={REPO_URL}
      target="_blank"
      rel="noreferrer"
      title="GitHub"
      aria-label="GitHub"
      className="m3-press"
      style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        display: "grid",
        placeItems: "center",
        color: p.onSurfaceVariant,
        textDecoration: "none",
        flex: "0 0 auto",
      }}
    >
      <svg width="22" height="22" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
      </svg>
    </a>
  );
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
          {githubBtn}
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
          {githubBtn}
        </Pill>
      </div>
    </>
  );
}
