"use client";

import {
  CARD_PADDING,
  Item,
  Palette,
  carouselCardsOf,
  carouselShapes,
  cardScrimOf,
  dateLayoutOf,
  dayOf,
  hourOf,
  minuteOf,
  scaleR,
  sizeOf,
  timeLayoutOf,
} from "@/lib/tokens";
import { t, useLang } from "@/lib/i18n";
import { Icon } from "./M3Node";

/* The three parts drawn here are wide surfaces rather than controls: a carousel's row of
 * cards, a calendar, a clock. They take their whole box and read their numbers off the item,
 * so a sketch shows a date and a time an author chose rather than today's. */

export function CarouselBody({ item, p, scroll = 0 }: { item: Item; p: Palette; scroll?: number }) {
  const { w, h } = sizeOf(item, {});
  const cards = carouselCardsOf(item);
  const r = scaleR(16);
  /* where each card stands at this scroll: at rest it is the arrangement the layout names, and
   * part-way through a scroll each card is between two of its sizes */
  const shapes = carouselShapes(item, w, scroll);
  return (
    <div style={{ position: "relative", height: "100%", overflow: "hidden" }}>
      {shapes.map(({ x, w: cw, lead }, i) => {
        const card = cards[i];
        const src = card?.src;
        const words = card?.label?.trim() ?? "";
        if (cw < 1) return null;
        return (
          <div
            key={i}
            data-card={i}
            style={{
              position: "absolute",
              left: x,
              top: 0,
              width: cw,
              height: "100%",
              borderRadius: r,
              background: src ? p.surfaceContainerHighest : i === 0 ? p.primaryContainer : p.surfaceContainerHighest,
              color: i === 0 ? p.onPrimaryContainer : p.onSurfaceVariant,
              display: "grid",
              placeItems: "center",
              overflow: "hidden",
            }}
          >
            {src ? (
              /* the picture fills its card, however the card is shaped */
              // eslint-disable-next-line @next/next/no-img-element
              <img src={src} alt="" draggable={false} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              cw > 56 && !words && <Icon name="image" size={Math.min(32, Math.round(Math.min(cw, h) * 0.28))} />
            )}
            {/* every card stands on the same scrim a card's own words stand on: it fades in from
              * the foot of the card, so the row reads as one whatever the pictures are */}
            <div style={{ position: "absolute", inset: 0, background: cardScrimOf("#ffffff", "end"), pointerEvents: "none" }} />
            {/* only the card in the large keyline says anything: it fades in as it grows into it */}
            {cw > 72 && words && lead > 0 && (
              <span
                style={{
                  position: "absolute",
                  left: 14,
                  right: 14,
                  bottom: 12,
                  fontSize: 16,
                  fontWeight: 600,
                  lineHeight: 1.35,
                  /* what the author typed, line breaks and all */
                  whiteSpace: "pre-line",
                  overflow: "hidden",
                  color: "#fff",
                  opacity: lead,
                }}
              >
                {words}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

/** the run of text buttons a picker dialog ends with */
function PickerActions({ p }: { p: Palette }) {
  const lang = useLang();
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, padding: "0 12px 12px" }}>
      {[t("cancel", lang), "OK"].map((label) => (
        <span key={label} style={{ height: 40, padding: "0 12px", borderRadius: 20, color: p.primary, fontSize: 14, fontWeight: 600, display: "inline-flex", alignItems: "center" }}>
          {label}
        </span>
      ))}
    </div>
  );
}

/** the seven letters over a month's columns, in the language the sketch is written in */
const WEEKDAYS: Record<string, string[]> = {
  ja: ["日", "月", "火", "水", "木", "金", "土"],
  en: ["S", "M", "T", "W", "T", "F", "S"],
  zh: ["日", "一", "二", "三", "四", "五", "六"],
  ko: ["일", "월", "화", "수", "목", "금", "토"],
};

/** a month as a grid: 31 days from a fixed weekday, with the chosen one on a filled circle */
function Month({ item, p, cell }: { item: Item; p: Palette; cell: number }) {
  const lang = useLang();
  const day = dayOf(item);
  /* the first of the month sits on the third column, so the grid reads like a real one */
  const offset = 3;
  const cells = Array.from({ length: 42 }, (_, i) => (i < offset || i - offset >= 31 ? null : i - offset + 1));
  return (
    <div style={{ padding: "0 24px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
        {(WEEKDAYS[lang] ?? WEEKDAYS.en).map((d, i) => (
          <span key={i} style={{ height: cell, display: "grid", placeItems: "center", fontSize: 12, fontWeight: 600, color: p.onSurfaceVariant }}>
            {d}
          </span>
        ))}
        {cells.map((d, i) => (
          <span key={i} style={{ height: cell, display: "grid", placeItems: "center" }}>
            {d !== null && (
              <span
                style={{
                  width: cell - 4,
                  height: cell - 4,
                  borderRadius: (cell - 4) / 2,
                  display: "grid",
                  placeItems: "center",
                  fontSize: 13,
                  fontWeight: d === day ? 700 : 500,
                  background: d === day ? p.primary : "transparent",
                  color: d === day ? p.onPrimary : p.onSurface,
                  border: d === day - 1 ? `1px solid ${p.primary}` : "none",
                  boxSizing: "border-box",
                }}
              >
                {d}
              </span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

/** the field a date is typed into, with the calendar button at its end */
function DateField({ item, p }: { item: Item; p: Palette }) {
  const lang = useLang();
  return (
    <div style={{ padding: 16 }}>
      <div style={{ fontSize: 12, color: p.onSurfaceVariant, marginBottom: 6 }}>{t("dateLabel", lang)}</div>
      <div
        style={{
          height: 56,
          borderRadius: 4,
          border: `1px solid ${p.outline}`,
          display: "flex",
          alignItems: "center",
          padding: "0 12px 0 16px",
          gap: 8,
          color: p.onSurface,
          fontSize: 16,
        }}
      >
        <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {item.label.trim() || t("dateExample", lang)}
        </span>
        <Icon name="calendar_month" size={22} />
      </div>
    </div>
  );
}

export function DatePickerBody({ item, p }: { item: Item; p: Palette }) {
  const lang = useLang();
  const layout = dateLayoutOf(item);
  if (layout === "input") return <DateField item={item} p={p} />;
  const { w } = sizeOf(item, {});
  const cell = Math.round((w - 48) / 7);
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {layout === "modal" && (
        <div style={{ padding: "16px 24px 0" }}>
          <div style={{ fontSize: 12, color: p.onSurfaceVariant }}>{t("selectDate", lang)}</div>
          <div style={{ fontSize: 28, fontWeight: 500, color: p.onSurface, marginTop: 8, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {item.label.trim() || t("dateExample", lang)}
          </div>
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 16px 0 24px", color: p.onSurfaceVariant }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: p.onSurface, display: "inline-flex", alignItems: "center", gap: 4 }}>
          {t("monthExample", lang)}
          <Icon name="arrow_drop_down" size={20} />
        </span>
        <span style={{ display: "inline-flex", gap: 12 }}>
          <Icon name="chevron_left" size={20} />
          <Icon name="chevron_right" size={20} />
        </span>
      </div>
      <div style={{ flex: 1, minHeight: 0, paddingTop: 4 }}>
        <Month item={item} p={p} cell={cell} />
      </div>
      <PickerActions p={p} />
    </div>
  );
}

/** one of the two number plates a time is read off */
function TimeBox({ text, on, p, wide }: { text: string; on: boolean; p: Palette; wide: number }) {
  return (
    <span
      style={{
        width: wide,
        height: 72,
        borderRadius: 8,
        display: "grid",
        placeItems: "center",
        background: on ? p.primaryContainer : p.surfaceContainerHighest,
        color: on ? p.onPrimaryContainer : p.onSurface,
        fontSize: 40,
        fontWeight: 400,
        border: on ? `2px solid ${p.primary}` : "none",
        boxSizing: "border-box",
      }}
    >
      {text}
    </span>
  );
}

/** the clock face: the hours around it and a hand reaching the chosen one */
function Dial({ item, p, size }: { item: Item; p: Palette; size: number }) {
  const hour = hourOf(item) % 12 || 12;
  const R = size / 2;
  const ring = R - 20;
  const angle = ((hour % 12) / 12) * Math.PI * 2 - Math.PI / 2;
  const hx = R + Math.cos(angle) * ring;
  const hy = R + Math.sin(angle) * ring;
  return (
    <div style={{ width: size, height: size, borderRadius: R, background: p.surfaceContainerHighest, position: "relative" }}>
      <svg width={size} height={size} style={{ position: "absolute", inset: 0 }} aria-hidden>
        <line x1={R} y1={R} x2={hx} y2={hy} stroke={p.primary} strokeWidth={2} />
        <circle cx={R} cy={R} r={3} fill={p.primary} />
        <circle cx={hx} cy={hy} r={20} fill={p.primary} />
      </svg>
      {Array.from({ length: 12 }, (_, i) => {
        const n = i + 1;
        const a = (n / 12) * Math.PI * 2 - Math.PI / 2;
        const on = n === hour;
        return (
          <span
            key={n}
            style={{
              position: "absolute",
              left: R + Math.cos(a) * ring - 20,
              top: R + Math.sin(a) * ring - 20,
              width: 40,
              height: 40,
              display: "grid",
              placeItems: "center",
              fontSize: 15,
              fontWeight: on ? 700 : 500,
              color: on ? p.onPrimary : p.onSurface,
            }}
          >
            {n}
          </span>
        );
      })}
    </div>
  );
}

export function TimePickerBody({ item, p }: { item: Item; p: Palette }) {
  const lang = useLang();
  const layout = timeLayoutOf(item);
  const { w } = sizeOf(item, {});
  const hour24 = hourOf(item);
  const hh = String(hour24 % 12 || 12).padStart(2, "0");
  const mm = String(minuteOf(item)).padStart(2, "0");
  const pm = hour24 >= 12;
  const plate = Math.min(96, Math.round((w - CARD_PADDING * 2 - 60) / 2));
  const dial = Math.min(256, w - 48);
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "16px 24px 0", fontSize: 12, color: p.onSurfaceVariant }}>{t("selectTime", lang)}</div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "12px 24px 0" }}>
        <TimeBox text={hh} on p={p} wide={plate} />
        <span style={{ fontSize: 32, color: p.onSurface }}>:</span>
        <TimeBox text={mm} on={false} p={p} wide={plate} />
        <span style={{ display: "flex", flexDirection: "column", width: 48, height: 72, borderRadius: 8, border: `1px solid ${p.outline}`, overflow: "hidden" }}>
          {["AM", "PM"].map((s) => {
            const on = (s === "PM") === pm;
            return (
              <span
                key={s}
                style={{
                  flex: 1,
                  display: "grid",
                  placeItems: "center",
                  fontSize: 12,
                  fontWeight: 600,
                  background: on ? p.tertiaryContainer : "transparent",
                  color: on ? p.onTertiaryContainer : p.onSurfaceVariant,
                }}
              >
                {s}
              </span>
            );
          })}
        </span>
      </div>
      {layout === "dial" ? (
        <div style={{ flex: 1, minHeight: 0, display: "grid", placeItems: "center", padding: "12px 0" }}>
          <Dial item={item} p={p} size={dial} />
        </div>
      ) : (
        <div style={{ flex: 1, minHeight: 0, display: "flex", alignItems: "flex-start", padding: "10px 24px", gap: 8, color: p.onSurfaceVariant, fontSize: 12 }}>
          <span style={{ width: plate, textAlign: "center" }}>{t("hourLabel", lang)}</span>
          <span style={{ width: 10 }} />
          <span style={{ width: plate, textAlign: "center" }}>{t("minuteLabel", lang)}</span>
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", padding: "0 12px 12px" }}>
        <Icon name={layout === "dial" ? "keyboard" : "schedule"} size={22} />
        <span style={{ flex: 1 }} />
        <PickerActions p={p} />
      </div>
    </div>
  );
}
