"use client";

import { useEffect, useMemo, useState } from "react";
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
}: {
  doc: Doc;
  widths: Record<string, number>;
  palette: Palette;
  onDoc: (patch: Partial<Doc>) => void;
}) {
  const lang = useLang();
  const text = useMemo(() => buildPrompt(doc, widths, undefined, lang), [doc, widths, lang]);
  const [copied, setCopied] = useState(false);

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
