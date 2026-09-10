"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Palette } from "@/lib/tokens";
import { t, useLang } from "@/lib/i18n";

type IconMeta = { n: string; p: number; t: string };

const FONT = '24px "Material Symbols Rounded"';
/** module-level so validation survives re-mounts of the panel */
let cache: IconMeta[] | null = null;
const glyphOk = new Map<string, boolean>();

/** Candidates measured per pass. A real Material Symbols glyph is exactly 1em
 *  wide; a name with no glyph falls back to text and measures wider. Icon names
 *  can be as short as "tv"/"4k", so we compare against a known-good reference
 *  glyph rather than a width threshold. */
const BATCH = 400;
const SHOWN = 240;

export function IconPicker({
  value,
  onChange,
  onClose,
  palette,
}: {
  value: string | null;
  onChange: (icon: string | null) => void;
  onClose: () => void;
  palette: Palette;
}) {
  const lang = useLang();
  const [icons, setIcons] = useState<IconMeta[] | null>(cache);
  const [q, setQ] = useState("");
  const [fontReady, setFontReady] = useState(false);
  /* bumped after each measuring pass; the visible list depends on it because
   * glyphOk is a plain map, not React state */
  const [tick, bump] = useState(0);

  const refEl = useRef<HTMLSpanElement>(null);
  const probeEls = useRef<Map<string, HTMLElement>>(new Map());

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      // Dismiss the picker without clearing the editor's selection.
      e.stopPropagation();
      onClose();
    };
    document.addEventListener("keydown", key, true);
    return () => document.removeEventListener("keydown", key, true);
  }, [onClose]);

  useEffect(() => {
    if (cache) return;
    fetch(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/material-symbols.json`)
      .then((r) => r.json())
      .then((d: IconMeta[]) => {
        cache = d;
        setIcons(d);
      })
      .catch(() => setIcons([]));
  }, []);

  useEffect(() => {
    let alive = true;
    const done = () => alive && setFontReady(true);
    if (document.fonts.check(FONT)) {
      done();
      return;
    }
    document.fonts.load(FONT, "search").then(done, done);
    return () => {
      alive = false;
    };
  }, []);

  const candidates = useMemo(() => {
    if (!icons) return [];
    const s = q.trim().toLowerCase().replace(/\s+/g, "_");
    if (!s) return icons.slice(0, BATCH);
    const raw = q.trim().toLowerCase();
    const starts: IconMeta[] = [];
    const rest: IconMeta[] = [];
    for (const i of icons) {
      if (i.n.startsWith(s)) starts.push(i);
      else if (i.n.includes(s) || i.t.includes(raw)) rest.push(i);
      if (starts.length + rest.length >= BATCH * 2) break;
    }
    return [...starts, ...rest].slice(0, BATCH);
  }, [icons, q]);

  const unknown = useMemo(() => candidates.filter((c) => !glyphOk.has(c.n)), [candidates]);

  useLayoutEffect(() => {
    if (!fontReady || unknown.length === 0) return;
    const ref = refEl.current?.getBoundingClientRect().width ?? 0;
    if (ref <= 0) return;
    let learned = false;
    for (const c of unknown) {
      const el = probeEls.current.get(c.n);
      if (!el) continue;
      const w = el.getBoundingClientRect().width;
      glyphOk.set(c.n, Math.abs(w - ref) < 0.75);
      learned = true;
    }
    if (learned) bump((v) => v + 1);
  }, [fontReady, unknown]);

  const visible = useMemo(
    () => candidates.filter((c) => glyphOk.get(c.n) === true).slice(0, SHOWN),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [candidates, fontReady, tick],
  );

  const loading = !icons || !fontReady;

  return (
    <div>
      {/* Hidden probes need intrinsic text widths to distinguish missing glyphs. */}
      <div
        aria-hidden
        style={{ position: "fixed", left: -99999, top: 0, visibility: "hidden", pointerEvents: "none" }}
      >
        <span ref={refEl} className="msr" style={{ fontSize: 24, width: "auto" }}>
          search
        </span>
        {unknown.map((c) => (
          <span
            key={c.n}
            ref={(el) => {
              if (el) probeEls.current.set(c.n, el);
              else probeEls.current.delete(c.n);
            }}
            className="msr"
            style={{ fontSize: 24, width: "auto" }}
          >
            {c.n}
          </span>
        ))}
      </div>

      {/* search line and grid share one surface: the line stays put while the icons scroll under it */}
      <div
        className="no-scrollbar"
        style={{
          height: 292,
          overflowY: "auto",
          overflowX: "hidden",
          borderRadius: 16,
          background: palette.surfaceContainerLow,
        }}
      >
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 1,
            display: "flex",
            alignItems: "center",
            gap: 8,
            height: 44,
            padding: "0 12px",
            background: palette.surfaceContainerLow,
            borderBottom: `1px solid ${palette.outlineVariant}`,
          }}
        >
          <span className="msr" style={{ fontSize: 20, color: palette.outline, flex: "0 0 auto" }}>
            search
          </span>
          <input
            aria-label={t("searchIcons", lang)}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={icons ? t("searchIcons", lang) : "…"}
            style={{
              flex: 1,
              minWidth: 0,
              height: 40,
              border: "none",
              background: "transparent",
              color: palette.onSurface,
              fontSize: 14,
              fontFamily: "inherit",
              outline: "none",
            }}
          />
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(42px, 1fr))",
            gap: 4,
            padding: 6,
            alignContent: "start",
          }}
        >
          {!q && (
            /* the first tile stands for "no icon"; it sits where the eye lands first */
            <button
              title={t("noIcon", lang)}
              aria-label={t("noIcon", lang)}
              aria-pressed={value === null}
              onClick={() => onChange(null)}
              style={{
                aspectRatio: "1",
                minWidth: 0,
                display: "grid",
                placeItems: "center",
                borderRadius: 12,
                border: `1.5px dashed ${value === null ? "transparent" : palette.outline}`,
                background: value === null ? palette.primary : "transparent",
                color: value === null ? palette.onPrimary : palette.onSurfaceVariant,
                cursor: "pointer",
              }}
            >
              {/* a crossed-out circle: the same drawn language the width presets use */}
              <svg width={22} height={22} viewBox="0 0 22 22" aria-hidden>
                <circle cx={11} cy={11} r={8} fill="none" stroke="currentColor" strokeWidth={1.6} />
                <line x1={5.3} y1={5.3} x2={16.7} y2={16.7} stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" />
              </svg>
            </button>
          )}
          {visible.map((i) => (
            <button
              key={i.n}
              title={i.n}
              aria-label={i.n}
              aria-pressed={value === i.n}
              onClick={() => onChange(i.n)}
              style={{
                aspectRatio: "1",
                minWidth: 0,
                display: "grid",
                placeItems: "center",
                borderRadius: 12,
                border: "none",
                background: value === i.n ? palette.primary : "transparent",
                color: value === i.n ? palette.onPrimary : palette.onSurfaceVariant,
                cursor: "pointer",
              }}
            >
              <span className="msr" style={{ fontSize: 22 }}>
                {i.n}
              </span>
            </button>
          ))}
          {!loading && visible.length === 0 && (
            <div style={{ gridColumn: "1 / -1", padding: 16, fontSize: 13, color: palette.outline }}>
              <span className="msr" style={{ fontSize: 24 }}>search_off</span>
            </div>
          )}
          {loading && (
            <div style={{ gridColumn: "1 / -1", padding: 16, fontSize: 13, color: palette.outline }}>
              <span className="msr" style={{ fontSize: 24 }}>hourglass_top</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
