"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { buildPrompt } from "@/lib/prompt";
import { Doc, Palette } from "@/lib/tokens";
import { Icon } from "./M3Node";
import { Field } from "./ui";
import { t, useLang } from "@/lib/i18n";

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
  const text = useMemo(() => buildPrompt(doc, widths, undefined, lang), [doc, widths, lang]);
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
    URL.revokeObjectURL(url);
  };

  const openProject = async (file: File) => {
    try {
      const next = JSON.parse(await file.text()) as Doc;
      if (!next || !Array.isArray(next.groups) || !Array.isArray(next.frames)) throw new Error("Invalid project");
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
        placeholder={t("screenName", lang)}
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
      <div
        className="no-scrollbar"
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          borderRadius: 18,
          background: p.surfaceContainerLow,
          padding: 14,
          fontSize: 13,
          lineHeight: 1.75,
          color: p.onSurface,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {text}
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
