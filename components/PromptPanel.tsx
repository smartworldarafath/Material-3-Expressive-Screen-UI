"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { buildPrompt } from "@/lib/prompt";
import { Doc, KIND_ORDER, Kind, Palette } from "@/lib/tokens";
import { Icon } from "./M3Node";
import { Field, IconBtn } from "./ui";
import { t, useLang } from "@/lib/i18n";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isProject = (value: unknown): value is Doc => {
  if (!isRecord(value) || !Array.isArray(value.groups) || !Array.isArray(value.frames)) return false;
  const kinds = new Set<Kind>(KIND_ORDER);
  const validTabs = (tabs: unknown) =>
    tabs === undefined ||
    (Array.isArray(tabs) &&
      tabs.every(
        (tab) =>
          isRecord(tab) &&
          typeof tab.label === "string" &&
          typeof tab.icon === "string",
      ));
  const validItem = (item: unknown) =>
    isRecord(item) &&
    typeof item.id === "string" &&
    typeof item.kind === "string" &&
    kinds.has(item.kind as Kind) &&
    typeof item.label === "string" &&
    (typeof item.icon === "string" || item.icon === null) &&
    typeof item.variant === "string" &&
    (item.supporting === undefined || typeof item.supporting === "string") &&
    (item.note === undefined || typeof item.note === "string") &&
    validTabs(item.tabs);
  const validGroup = (group: unknown) =>
    isRecord(group) &&
    typeof group.id === "string" &&
    Number.isFinite(group.x) &&
    Number.isFinite(group.y) &&
    (group.axis === "x" || group.axis === "y") &&
    Array.isArray(group.items) &&
    group.items.length > 0 &&
    group.items.every(validItem);
  const validFrame = (frame: unknown) =>
    isRecord(frame) &&
    typeof frame.id === "string" &&
    typeof frame.name === "string" &&
    Number.isFinite(frame.x) &&
    Number.isFinite(frame.y) &&
    (frame.note === undefined || typeof frame.note === "string");
  return value.groups.every(validGroup) && value.frames.every(validFrame);
};

export function PromptPanel({
  doc,
  widths,
  palette: p,
  onDoc,
  onImport,
}: {
  doc: Doc;
  widths: Record<string, number>;
  palette: Palette;
  onDoc: (patch: Partial<Doc>) => void;
  onImport: (doc: Doc) => void;
}) {
  const lang = useLang();
  const generated = useMemo(() => buildPrompt(doc, widths, undefined, lang), [doc, widths, lang]);
  const edited = doc.promptEdit !== undefined;
  const text = edited ? doc.promptEdit! : generated;
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1400);
    return () => clearTimeout(t);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {}
  };

  const saveProject = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(doc, null, 2)], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "m3e-canvas.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  const openProject = async (file: File) => {
    try {
      const next: unknown = JSON.parse(await file.text());
      if (!isProject(next)) throw new Error("Invalid project");
      if (window.confirm(t("replaceProject", lang))) onImport(next);
    } catch {
      window.alert(t("invalidProject", lang));
    }
  };

  const projectButton = (icon: string, label: string, onClick: () => void) => (
    <button
      onClick={onClick}
      className="m3-press"
      style={{
        flex: 1,
        height: 42,
        borderRadius: 21,
        border: "none",
        background: p.secondaryContainer,
        color: p.onSecondaryContainer,
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 7,
      }}
    >
      <Icon name={icon} size={19} />
      {label}
    </button>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: 12, gap: 10 }}>
      <Field
        value={doc.title}
        onChange={(title) => onDoc({ title })}
        placeholder={t("appName", lang)}
        p={p}
        icon="smartphone"
      />
      <Field
        value={doc.brief}
        onChange={(brief) => onDoc({ brief })}
        placeholder={t("brief", lang)}
        p={p}
        icon="lightbulb"
        multiline
        rows={3}
      />
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) void openProject(file);
        }}
      />
      <div style={{ display: "flex", gap: 6 }}>
        {projectButton("download", t("saveProject", lang), saveProject)}
        {projectButton("upload", t("openProject", lang), () => fileRef.current?.click())}
      </div>
      <div style={{ position: "relative", flex: 1, minHeight: 0, display: "flex" }}>
        <textarea
          className="no-scrollbar"
          value={text}
          onChange={(e) => onDoc({ promptEdit: e.target.value })}
          spellCheck={false}
          aria-label={t("prompt", lang)}
          style={{
            flex: 1,
            minHeight: 0,
            width: "100%",
            borderRadius: 18,
            border: "none",
            background: p.surfaceContainerLow,
            padding: edited ? "14px 14px 48px" : 14,
            fontSize: 13,
            lineHeight: 1.75,
            color: p.onSurface,
            fontFamily: "inherit",
            resize: "none",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
        {edited && (
          <div style={{ position: "absolute", right: 8, bottom: 8 }}>
            <IconBtn icon="undo" p={p} size={32} onClick={() => onDoc({ promptEdit: undefined })} title={t("promptReset", lang)} />
          </div>
        )}
      </div>
      <button
        onClick={copy}
        className="m3-press"
        style={{
          height: 48,
          borderRadius: 24,
          border: "none",
          background: copied ? p.tertiaryContainer : p.primary,
          color: copied ? p.onTertiaryContainer : p.onPrimary,
          fontSize: 14,
          fontWeight: 600,
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          transition: "background 160ms, color 160ms",
        }}
      >
        <Icon name={copied ? "check" : "content_copy"} size={20} />
        {copied ? t("copied", lang) : t("copyPrompt", lang)}
      </button>
    </div>
  );
}
