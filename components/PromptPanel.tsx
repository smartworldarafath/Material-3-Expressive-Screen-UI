"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { buildPrompt } from "@/lib/prompt";
import { Doc, Palette } from "@/lib/tokens";
import { readProject, saveProject } from "@/lib/project";
import { Icon } from "./M3Node";
import { ButtonRun, Field, IconBtn } from "./ui";
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
  /** a project file was chosen; null when it could not be read as one */
  onImport: (doc: Doc | null) => void;
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
          if (file) void readProject(file).then(onImport);
        }}
      />
      <ButtonRun>
        {projectButton("download", t("saveProject", lang), () => saveProject(doc))}
        {projectButton("upload", t("openProject", lang), () => fileRef.current?.click())}
      </ButtonRun>
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
