"use client";

import { useState } from "react";
import {
  CAROUSEL_HEIGHTS,
  CAROUSEL_LAYOUTS,
  cardWidths,
  CarouselLayout,
  DATE_LAYOUTS,
  DateLayout,
  Frame,
  Item,
  KIND_SPEC,
  LOADING_SIZES,
  PHONE_W,
  PROGRESS_KINDS,
  Palette,
  ProgressKind,
  RING_SIZES,
  TIME_LAYOUTS,
  TRACK_DEFAULT,
  TRACK_MAX,
  TRACK_MIN,
  TimeLayout,
  barWidths,
  carouselCardPatch,
  carouselCardsOf,
  carouselCountOf,
  carouselLayoutOf,
  dateLayoutOf,
  dayOf,
  frameSizeOf,
  hourOf,
  isProgress,
  maxRingThickness,
  minuteOf,
  progressThickness,
  progressTypePatch,
  sizeOf,
  timeLayoutOf,
} from "@/lib/tokens";
import { Field, ImageRow, NamedSizes, PanelShell, Section, Segmented, Slider, Toggle } from "./ui";
import { arcPath, wavePath } from "./Loading";

import { Icon } from "./M3Node";
import { AiHooks } from "./Inspector";
import { AlignBox, NoteSection, PartHeader, PartTabs, PlaceFn, Tab, TriggerSection, hasTrigger } from "./PartPanel";
import { t, useLang } from "@/lib/i18n";

/* One panel for the parts that are surfaces rather than controls. It wears the button's chrome --
 * the title row, the two tabs, the align grid, the spec field -- and fills the design tab with
 * only what the part actually has: a carousel has cards to count, a picker a value to set. A part
 * a tap can go through keeps the trigger tab; anything else drops it and its spec moves up. */

/** the width of a part, on the slider and as the three widths a screen is built from */
function WidthRow({ item, frame, onChange, p }: { item: Item; frame: Frame | null; onChange: (patch: Partial<Item>) => void; p: Palette }) {
  const lang = useLang();
  const spec = KIND_SPEC[item.kind];
  const size = spec.size!;
  const frameW = frame ? frameSizeOf(frame).w : PHONE_W;
  const [picked, setCard] = useState(0);
  /** the carousel card the panel is about: its picture, and where a tap on it goes. A row that
   *  has lost cards leaves the pick on the last one still there. */
  const card = item.kind === "carousel" ? Math.min(picked, carouselCountOf(item) - 1) : picked;
  /* a bar is measured across the screen; a ring is measured corner to corner */
  const bar = item.kind === "linearProgress";
  const width = sizeOf(item, {}).w;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <Slider icon="width" title={t("width", lang)} value={width} min={Math.min(size.min, width)} max={Math.max(frameW, size.max)} step={size.step} onChange={(v) => onChange({ size: v })} p={p} />
      <Segmented
        options={(size.presets ?? []).map((v) => ({ key: String(v), label: `${v}` }))}
        value={String(width)}
        onChange={(k) => onChange({ size: Number(k) })}
        p={p}
        height={36}
      />
    </div>
  );
}

/** The four shapes an indicator can take, drawn small with the very geometry the part itself is
 *  drawn with: a straight track or one travelling in a wave, laid out or bent into a ring. A
 *  picture says which is which faster than the words "linear" and "wavy" ever did, and picking
 *  one sets both the shape and the wave in a single tap. */
const PROGRESS_LOOKS = [
  { key: "bar", kind: "linearProgress", wavy: false, label: "progressBar" },
  { key: "wavyBar", kind: "linearProgress", wavy: true, label: "progressWavyBar" },
  { key: "ring", kind: "circularProgress", wavy: false, label: "progressRing" },
  { key: "wavyRing", kind: "circularProgress", wavy: true, label: "progressWavyRing" },
] as const;
type ProgressLook = (typeof PROGRESS_LOOKS)[number];

/* the thumbnail is a part 44dp wide: the same wave, the same gap before the track, a quarter of
 * the size the real one is drawn at */
const THUMB_W = 44;
const THUMB_H = 28;
/** the wave is shortened for the picture, so a thumbnail this small still reads as a wave */
const THUMB_WAVELENGTH = 13;

function ProgressThumb({ look, on, p }: { look: ProgressLook; on: boolean; p: Palette }) {
  const ink = on ? p.onPrimary : p.onSurfaceVariant;
  const track = on ? p.onPrimary : p.outlineVariant;
  const stroke = { fill: "none", strokeWidth: 2.8, strokeLinecap: "round" as const };
  const mid = THUMB_H / 2;
  const bar = look.kind === "linearProgress";
  return (
    <svg width={THUMB_W} height={THUMB_H} viewBox={`0 0 ${THUMB_W} ${THUMB_H}`} aria-hidden>
      {bar ? (
        <>
          <path d={wavePath(4, 26, mid, look.wavy ? 3 : 0, 0, THUMB_WAVELENGTH)} stroke={ink} {...stroke} />
          <path d={wavePath(31, 40, mid, 0, 0, 1)} stroke={track} opacity={on ? 0.4 : 0.7} {...stroke} />
        </>
      ) : (
        <>
          <path d={arcPath(THUMB_W / 2, mid, 10, -90, 150, look.wavy ? 0.7 : 0, 7, 0)} stroke={ink} {...stroke} />
          <path d={arcPath(THUMB_W / 2, mid, 10, 180, 255, 0, 7, 0)} stroke={track} opacity={on ? 0.4 : 0.7} {...stroke} />
        </>
      )}
    </svg>
  );
}

/** Those four as one connected run, each cell a picture of what it makes and nothing else: the
 *  drawing is the label. Picking one sets the shape and the wave together. */
function ProgressTypePicker({ item, onChange, p }: { item: Item; onChange: (patch: Partial<Item>) => void; p: Palette }) {
  const lang = useLang();
  const current = PROGRESS_LOOKS.find((l) => l.kind === item.kind && l.wavy === !!item.wavy) ?? PROGRESS_LOOKS[0];
  return (
    <Segmented<ProgressLook["key"]>
      options={PROGRESS_LOOKS.map((look) => ({
        key: look.key,
        title: t(look.label, lang),
        node: <ProgressThumb look={look} on={look.key === current.key} p={p} />,
      }))}
      value={current.key}
      onChange={(k) => {
        const look = PROGRESS_LOOKS.find((l) => l.key === k)!;
        onChange({ ...progressTypePatch(item, look.kind), wavy: look.wavy || undefined });
      }}
      p={p}
      height={44}
    />
  );
}

/** What the indicator is saying, as two icons standing on their own at the start of the row: the
 *  loop it circles in with no end in sight, or the share it counts up to -- and that share is the
 *  slider that fills the rest of the row, which is there only when there is a share to set. */
function ProgressValue({ item, onChange, p }: { item: Item; onChange: (patch: Partial<Item>) => void; p: Palette }) {
  const lang = useLang();
  const pct = item.value !== undefined;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <Segmented<"loop" | "percent">
        options={[
          { key: "loop", icon: "autorenew", title: t("progressLoop", lang) },
          { key: "percent", icon: "percent", title: t("progressPercent", lang) },
        ]}
        value={pct ? "percent" : "loop"}
        onChange={(k) => onChange({ value: k === "percent" ? 60 : undefined })}
        p={p}
        grow={false}
      />
      {pct && (
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* the run beside it already says what this is measuring, so the slider carries no icon */}
          <Slider iconNode={<></>} title={t("progressState", lang)} value={item.value ?? 60} min={0} max={100} step={1} onChange={(value) => onChange({ value })} p={p} unit="%" />
        </div>
      )}
    </div>
  );
}

/** A layout drawn as the row of cards it actually makes: the same widths the part is built from,
 *  read as shares of the row, so the picture in the cell is the arrangement itself. */
function CarouselThumb({ layout, on, p }: { layout: CarouselLayout; on: boolean; p: Palette }) {
  const shares = cardWidths(layout, 100, 4);
  const ink = on ? p.onPrimary : p.onSurfaceVariant;
  return (
    <span aria-hidden style={{ display: "flex", gap: 1.5, width: 44, height: 22, overflow: "hidden" }}>
      {shares.map((w, i) => (
        <span key={i} style={{ width: `${w}%`, flex: "0 0 auto", borderRadius: 3, background: ink, opacity: i === 0 ? 1 : 0.45 }} />
      ))}
    </span>
  );
}

/** M3's four arrangements as one connected run of those pictures, with no words: the drawing
 *  says how the cards are laid out better than "multi-browse" ever could. */
function CarouselLayoutPicker({ item, onChange, p }: { item: Item; onChange: (patch: Partial<Item>) => void; p: Palette }) {
  const lang = useLang();
  const current = carouselLayoutOf(item);
  return (
    <Segmented<CarouselLayout>
      options={CAROUSEL_LAYOUTS.map((l) => ({
        key: l.key,
        title: t(`carousel${l.key[0].toUpperCase()}${l.key.slice(1)}` as "carouselHero", lang),
        node: <CarouselThumb layout={l.key} on={l.key === current} p={p} />,
      }))}
      value={current}
      onChange={(layout) => onChange({ layout })}
      p={p}
      height={44}
    />
  );
}

/** The cards themselves as one connected run: each cell shows the picture that card carries, or
 *  its number while it has none, and the one picked out is the card the controls under it -- and
 *  the trigger tab -- are about. A card a tap is sent from wears the run's own mark. */
function CardStrip({ item, selected, onSelect, p }: { item: Item; selected: number; onSelect: (i: number) => void; p: Palette }) {
  const cards = carouselCardsOf(item);
  return (
    <Segmented<string>
      options={cards.map((card, i) => ({
        key: String(i),
        title: `${i + 1}`,
        dot: !!item.actions?.[`tab:${i}`],
        node: card.src ? (
          <span aria-hidden style={{ position: "absolute", inset: 0, borderRadius: "inherit", overflow: "hidden" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={card.src} alt="" draggable={false} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            {/* the picture covers the cell, so the one picked out wears a ring of its own */}
            {i === selected && <span style={{ position: "absolute", inset: 0, borderRadius: "inherit", border: `3px solid ${p.primary}`, boxSizing: "border-box" }} />}
          </span>
        ) : (
          <span style={{ fontSize: 12, fontWeight: 700 }}>{i + 1}</span>
        ),
      }))}
      value={String(selected)}
      onChange={(k) => onSelect(Number(k))}
      p={p}
      height={44}
      tight
    />
  );
}

export function PartInspector({
  ai,
  item,
  palette: p,
  frame,
  onChange,
  onDelete,
  onDuplicate,
  locked,
  onToggleLock,
  onPlace,
  selfRect,
  allFrames,
}: {
  ai: AiHooks;
  item: Item;
  palette: Palette;
  frame: Frame | null;
  onChange: (patch: Partial<Item>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  locked?: boolean;
  onToggleLock?: () => void;
  onPlace?: PlaceFn;
  selfRect: { x: number; y: number; w: number; h: number } | null;
  allFrames: Frame[];
}) {
  const lang = useLang();
  const [tab, setTab] = useState<Tab>("design");
  const trigger = hasTrigger(item.kind);
  const spec = KIND_SPEC[item.kind];
  const frameW = frame ? frameSizeOf(frame).w : PHONE_W;
  const [picked, setCard] = useState(0);
  /** the carousel card the panel is about: its picture, and where a tap on it goes. A row that
   *  has lost cards leaves the pick on the last one still there. */
  const card = item.kind === "carousel" ? Math.min(picked, carouselCountOf(item) - 1) : picked;
  /* a bar is measured across the screen; a ring is measured corner to corner */
  const bar = item.kind === "linearProgress";

  const design = (
    <>
      {item.kind === "carousel" && (
        <>
          <Section id="part-layout" icon="view_carousel" title={t("layout", lang)} p={p}>
            <CarouselLayoutPicker item={item} onChange={onChange} p={p} />
          </Section>
          <Section id="part-cards" icon="photo_library" title={t("cards", lang)} p={p}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Slider icon="view_column" title={t("cards", lang)} value={carouselCountOf(item)} min={2} max={8} step={1} onChange={(count) => onChange({ count })} p={p} />
              <CardStrip item={item} selected={card} onSelect={setCard} p={p} />
              {/* the card picked out in the run is the one these are about: what it says, and
                * the picture on it. The words keep the line breaks they were typed with. */}
              <Field
                value={carouselCardsOf(item)[card]?.label ?? ""}
                onChange={(label) => onChange(carouselCardPatch(item, card, { label }))}
                placeholder={t("label", lang)}
                p={p}
                multiline
                rows={2}
                maxHeight={140}
              />
              <ImageRow
                value={carouselCardsOf(item)[card]?.src}
                onChange={(src) => onChange(carouselCardPatch(item, card, { src }))}
                p={p}
              />
            </div>
          </Section>
          <Section id="part-size" icon="straighten" title={t("size", lang)} p={p}>
            {/* a carousel runs the width of the screen it is on: its height is the one measure
                its author sets */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Slider icon="height" title={t("height", lang)} value={sizeOf(item, {}).h} min={spec.size2!.min} max={spec.size2!.max} step={spec.size2!.step} onChange={(size2) => onChange({ size2 })} p={p} />
              <NamedSizes steps={CAROUSEL_HEIGHTS} value={sizeOf(item, {}).h} onChange={(size2) => onChange({ size2 })} p={p} />
            </div>
          </Section>
        </>
      )}

      {item.kind === "datePicker" && (
        <>
          <Section id="part-layout" icon="calendar_month" title={t("layout", lang)} p={p}>
            <Segmented<DateLayout>
              options={DATE_LAYOUTS.map((l) => ({ key: l.key, icon: l.icon, title: t(`date${l.key[0].toUpperCase()}${l.key.slice(1)}` as "dateModal", lang) }))}
              value={dateLayoutOf(item)}
              onChange={(layout) => onChange({ layout })}
              p={p}
            />
          </Section>
          {/* the calendar is the only place a day can be circled; typed in, only the text shows */}
          {dateLayoutOf(item) !== "input" && (
            <Section id="part-day" icon="event" title={t("selectedDay", lang)} p={p}>
              <Slider icon="today" title={t("selectedDay", lang)} value={dayOf(item)} min={1} max={31} step={1} onChange={(day) => onChange({ day })} p={p} />
            </Section>
          )}
          {dateLayoutOf(item) !== "docked" && (
            <Section id="part-text" icon="short_text" title={t("text", lang)} p={p}>
              <Field value={item.label} onChange={(label) => onChange({ label })} placeholder={t("dateExample", lang)} p={p} />
            </Section>
          )}
          <Section id="part-size" icon="straighten" title={t("size", lang)} p={p}>
            <WidthRow item={item} frame={frame} onChange={onChange} p={p} />
          </Section>
        </>
      )}

      {item.kind === "timePicker" && (
        <>
          <Section id="part-layout" icon="schedule" title={t("layout", lang)} p={p}>
            <Segmented<TimeLayout>
              options={TIME_LAYOUTS.map((l) => ({ key: l.key, icon: l.icon, title: t(`time${l.key[0].toUpperCase()}${l.key.slice(1)}` as "timeDial", lang) }))}
              value={timeLayoutOf(item)}
              onChange={(layout) => onChange({ layout })}
              p={p}
            />
          </Section>
          <Section id="part-time" icon="schedule" title={t("selectTime", lang)} p={p}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Slider icon="schedule" title={t("hourLabel", lang)} value={hourOf(item)} min={0} max={23} step={1} onChange={(hour) => onChange({ hour })} p={p} />
              <Slider icon="timer" title={t("minuteLabel", lang)} value={minuteOf(item)} min={0} max={59} step={1} onChange={(minute) => onChange({ minute })} p={p} />
            </div>
          </Section>
          <Section id="part-size" icon="straighten" title={t("size", lang)} p={p}>
            <WidthRow item={item} frame={frame} onChange={onChange} p={p} />
          </Section>
        </>
      )}

      {isProgress(item.kind) && (
        <>
          {/* which shape it takes, and whether its track travels in a wave: one picture each */}
          <Section id="part-type" icon="progress_activity" title={t("partType", lang)} p={p}>
            <ProgressTypePicker item={item} onChange={onChange} p={p} />
          </Section>
          {/* what it is saying: a wait with no end, or a share counted up to */}
          <Section id="part-state" icon="tune" title={t("state", lang)} p={p}>
            <ProgressValue item={item} onChange={onChange} p={p} />
          </Section>
          <Section id="part-size" icon="straighten" title={t("size", lang)} p={p}>
            {/* the two measures are each a slider over its named sizes, with room between them so
                the eye can tell which row belongs to which -- the same as a button's panel. How
                thick the track is comes first: a ring can only be so thick before its gap eats it. */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <Slider
                icon="line_weight"
                title={t("trackThickness", lang)}
                value={progressThickness(item)}
                min={TRACK_MIN}
                max={item.kind === "circularProgress" ? maxRingThickness(item.size ?? spec.w) : TRACK_MAX}
                step={1}
                onChange={(v) => onChange({ trackThickness: v === TRACK_DEFAULT ? undefined : v })}
                p={p}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <Slider
                  icon={bar ? "width" : "open_in_full"}
                  title={t(bar ? "width" : "size", lang)}
                  value={item.size ?? spec.w}
                  min={Math.min(spec.size!.min, item.size ?? spec.w)}
                  max={bar ? Math.max(frameW, spec.size!.max) : spec.size!.max}
                  step={spec.size!.step}
                  onChange={(size) => onChange({ size })}
                  p={p}
                />
                <NamedSizes steps={bar ? barWidths(frameW) : RING_SIZES} value={item.size ?? spec.w} onChange={(size) => onChange({ size })} p={p} />
              </div>
            </div>
          </Section>
        </>
      )}

      {item.kind === "slider" && (
        <>
          {/* where its handle sits: the one thing a sketched slider says */}
          <Section id="part-state" icon="tune" title={t("state", lang)} p={p}>
            <Slider icon="percent" title={t("progressState", lang)} value={item.value ?? 40} min={0} max={100} step={1} onChange={(value) => onChange({ value })} p={p} unit="%" />
          </Section>
          <Section id="part-size" icon="straighten" title={t("size", lang)} p={p}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Slider
                icon="width"
                title={t("width", lang)}
                value={item.size ?? spec.w}
                min={Math.min(spec.size!.min, item.size ?? spec.w)}
                max={Math.max(frameW, spec.size!.max)}
                step={spec.size!.step}
                onChange={(size) => onChange({ size })}
                p={p}
              />
              <NamedSizes steps={barWidths(frameW)} value={item.size ?? spec.w} onChange={(size) => onChange({ size })} p={p} />
            </div>
          </Section>
        </>
      )}

      {item.kind === "loadingIndicator" && (
        <>
          <Section id="part-state" icon="tune" title={t("state", lang)} p={p}>
            <Toggle on={!!item.contained} onChange={(contained) => onChange({ contained })} p={p} icon="circle" label={t("container", lang)} grow />
          </Section>
          <Section id="part-size" icon="straighten" title={t("size", lang)} p={p}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Slider
                icon="open_in_full"
                title={t("size", lang)}
                value={item.size ?? spec.w}
                min={spec.size!.min}
                max={spec.size!.max}
                step={spec.size!.step}
                onChange={(size) => onChange({ size })}
                p={p}
              />
              <NamedSizes steps={LOADING_SIZES} value={item.size ?? spec.w} onChange={(size) => onChange({ size })} p={p} />
            </div>
          </Section>
        </>
      )}

      {onPlace && (
        <Section id="part-align" icon="grid_on" title={t("align", lang)} p={p}>
          <AlignBox onPlace={onPlace} p={p} />
        </Section>
      )}
    </>
  );

  return (
    <PanelShell
      p={p}
      locked={!!locked}
      onUnlock={onToggleLock}
      head={
        <PartHeader kind={item.kind} p={p} locked={!!locked} onDuplicate={onDuplicate} onToggleLock={onToggleLock} onDelete={onDelete} />
      }
      tabs={<PartTabs value={tab} onChange={setTab} p={p} />}
    >
      {tab === "design" && design}
      {tab === "behavior" &&
        (item.kind === "carousel" ? (
          /* every card is a place of its own to be sent from: the row picks which one */
          <TriggerSection
            item={item}
            frame={frame}
            allFrames={allFrames}
            selfRect={selfRect}
            onChange={onChange}
            p={p}
            slot={`tab:${card}`}
            head={<CardStrip item={item} selected={card} onSelect={setCard} p={p} />}
          />
        ) : trigger ? (
          <TriggerSection item={item} frame={frame} allFrames={allFrames} selfRect={selfRect} onChange={onChange} p={p} />
        ) : (
          /* nothing is opened by tapping this one: the tab says so and leaves the spec the room */
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, lineHeight: 1.5, color: p.onSurfaceVariant, padding: "2px 6px 10px" }}>
            <Icon name="block" size={18} />
            <span>{t("noTrigger", lang)}</span>
          </div>
        ))}
      {tab === "behavior" && <NoteSection item={item} ai={ai} onChange={onChange} p={p} />}
    </PanelShell>
  );
}
