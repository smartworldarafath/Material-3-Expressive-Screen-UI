"use client";

import { useEffect, useState } from "react";
import { PALETTES, Palette } from "@/lib/tokens";
import { isHex, onColorFor, schemeFromSeed } from "@/lib/color";
import { t, useLang } from "@/lib/i18n";
import { Section, Segmented, Toggle } from "./ui";

/** roles the author can override by hand; their "on" color follows automatically */
type Role = Exclude<keyof Palette, "seed">;
const TUNABLE: { key: Role; on?: Role }[] = [
  { key: "primary", on: "onPrimary" },
  { key: "primaryContainer", on: "onPrimaryContainer" },
  { key: "secondaryContainer", on: "onSecondaryContainer" },
  { key: "tertiaryContainer", on: "onTertiaryContainer" },
  { key: "surfaceContainer" },
  { key: "surfaceContainerHigh" },
  { key: "inverseSurface", on: "inverseOnSurface" },
];

/** the palette's key colors as overlapping dots, right-aligned in the row */
function Swatches({ pal }: { pal: Palette }) {
  const colors = [pal.primary, pal.primaryContainer, pal.secondaryContainer, pal.tertiaryContainer, pal.surfaceContainerHigh];
  return (
    <span style={{ display: "inline-flex", flex: "0 0 auto", marginLeft: "auto", paddingLeft: 8 }}>
      {colors.map((c, i) => (
        <span
          key={i}
          style={{
            width: 20,
            height: 20,
            borderRadius: 10,
            background: c,
            marginLeft: i === 0 ? 0 : -7,
            boxShadow: "0 0 0 2px rgba(255,255,255,0.9), inset 0 0 0 1px rgba(0,0,0,0.08)",
            zIndex: colors.length - i,
            position: "relative",
          }}
        />
      ))}
    </span>
  );
}

function ColorField({ value, onChange, p, label }: { value: string; onChange: (hex: string) => void; p: Palette; label: string }) {
  const [text, setText] = useState(value);
  useEffect(() => setText(value), [value]);
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 8, height: 36 }}>
      <span style={{ position: "relative", width: 28, height: 28, borderRadius: 14, background: value, boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.12)", flex: "0 0 auto", overflow: "hidden" }}>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          aria-label={label}
          style={{ position: "absolute", inset: -8, width: 44, height: 44, opacity: 0, cursor: "pointer" }}
        />
      </span>
      <span style={{ flex: 1, minWidth: 0, fontSize: 12, color: p.onSurface, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
      <input
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          if (isHex(e.target.value)) onChange(e.target.value.toUpperCase());
        }}
        onBlur={() => setText(value)}
        spellCheck={false}
        style={{
          width: 76,
          height: 28,
          padding: "0 8px",
          borderRadius: 8,
          border: "none",
          background: p.surfaceContainerHigh,
          color: p.onSurface,
          fontSize: 12,
          fontFamily: "ui-monospace, monospace",
          outline: "none",
        }}
      />
    </label>
  );
}

/** The color tab of the left panel: preset themes, a seed-based custom scheme
 *  with per-role tweaks, and the dynamic-color (wallpaper) switch. */
export function ColorPanel({
  p,
  paletteKey,
  onPalette,
  custom,
  onCustom,
  dynamic,
  onDynamic,
}: {
  p: Palette;
  paletteKey: string;
  onPalette: (key: string) => void;
  custom: Palette | null;
  onCustom: (pal: Palette) => void;
  dynamic: boolean;
  onDynamic: (on: boolean) => void;
}) {
  const lang = useLang();
  const [tab, setTab] = useState<"templates" | "custom">(paletteKey === "custom" ? "custom" : "templates");
  const [seed, setSeed] = useState(custom?.seed ?? custom?.primary ?? "#6750A4");

  const applySeed = (hex: string) => {
    setSeed(hex);
    onCustom(schemeFromSeed(hex));
    onPalette("custom");
  };
  const cur = custom ?? schemeFromSeed(seed);

  return (
    <div className="no-scrollbar" style={{ height: "100%", overflowY: "auto", padding: "12px 12px 20px" }}>
      <Segmented<"templates" | "custom">
        options={[
          { key: "templates", icon: "palette", label: t("templates", lang) },
          { key: "custom", icon: "colorize", label: t("customColor", lang) },
        ]}
        value={tab}
        onChange={setTab}
        p={p}
        height={38}
      />

      {tab === "templates" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 12 }}>
          {PALETTES.map((pal) => {
            const on = pal.key === paletteKey;
            return (
              <button
                key={pal.key}
                onClick={() => onPalette(pal.key)}
                aria-pressed={on}
                className="m3-press"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  height: 48,
                  padding: "0 12px 0 10px",
                  borderRadius: 16,
                  border: "none",
                  background: on ? p.secondaryContainer : p.surfaceContainerLow,
                  color: on ? p.onSecondaryContainer : p.onSurface,
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <span style={{ width: 28, height: 28, borderRadius: 14, background: `linear-gradient(135deg, ${pal.primary} 50%, ${pal.primaryContainer} 50%)`, flex: "0 0 auto" }} />
                <span style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 }}>{pal.label}</span>
                <Swatches pal={pal} />
              </button>
            );
          })}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              justifyContent: "flex-end",
              gap: 8,
              padding: 10,
              borderRadius: 16,
              background: paletteKey === "custom" ? p.secondaryContainer : p.surfaceContainerLow,
              color: paletteKey === "custom" ? p.onSecondaryContainer : p.onSurface,
            }}
          >
            <div style={{ flex: "1 1 180px", minWidth: 0 }}>
              <ColorField value={seed} onChange={applySeed} p={p} label={t("seedColor", lang)} />
            </div>
            {paletteKey !== "custom" && (
              <button
                onClick={() => applySeed(seed)}
                className="m3-press"
                style={{ height: 32, padding: "0 12px", borderRadius: 16, border: "none", background: p.primary, color: p.onPrimary, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
              >
                {t("useThis", lang)}
              </button>
            )}
          </div>
          <div style={{ fontSize: 11, lineHeight: 1.5, color: p.onSurfaceVariant, padding: "0 4px" }}>{t("seedHint", lang)}</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", padding: "0 2px" }}>
            {["#6750A4", "#0B57D0", "#2E6A45", "#984061", "#8B5000", "#00696E", "#B3261E", "#4A4459"].map((c) => (
              <button
                key={c}
                onClick={() => applySeed(c)}
                title={c}
                aria-label={c}
                className="m3-press"
                style={{ width: 26, height: 26, borderRadius: 13, border: "none", padding: 0, background: c, cursor: "pointer", outline: seed === c ? `2px solid ${p.primary}` : "2px solid transparent", outlineOffset: 2 }}
              />
            ))}
          </div>
          <Section id="color-tune" icon="tune" title={t("fineTune", lang)} p={p} defaultOpen={false}>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {TUNABLE.map((r) => (
                <ColorField
                  key={r.key}
                  value={cur[r.key]}
                  label={r.key}
                  p={p}
                  onChange={(hex) => {
                    const next: Palette = { ...cur, [r.key]: hex };
                    if (r.on) (next as Record<string, string>)[r.on] = onColorFor(hex);
                    onCustom(next);
                    onPalette("custom");
                  }}
                />
              ))}
            </div>
          </Section>
        </div>
      )}

      <div style={{ marginTop: 16, padding: 12, borderRadius: 16, background: p.surfaceContainerLow }}>
        <Toggle on={dynamic} onChange={onDynamic} p={p} icon="wallpaper" label={t("dynamicColor", lang)} />
        <div style={{ marginTop: 8, fontSize: 11, lineHeight: 1.5, color: p.onSurfaceVariant }}>
          {dynamic ? t("dynamicOnHint", lang) : t("dynamicOffHint", lang)}
        </div>
      </div>
    </div>
  );
}
