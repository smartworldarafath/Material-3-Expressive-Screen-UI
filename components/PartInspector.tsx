"use client";

import { useState } from "react";
import {
  CAROUSEL_LAYOUTS,
  CarouselLayout,
  DATE_LAYOUTS,
  DateLayout,
  Frame,
  Item,
  KIND_SPEC,
  PHONE_W,
  Palette,
  TIME_LAYOUTS,
  TimeLayout,
  carouselCountOf,
  carouselLayoutOf,
  dateLayoutOf,
  dayOf,
  frameSizeOf,
  hourOf,
  minuteOf,
  sizeOf,
  timeLayoutOf,
} from "@/lib/tokens";
import { Field, PanelShell, Section, Segmented, Slider } from "./ui";
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

  const design = (
    <>
      {item.kind === "carousel" && (
        <>
          <Section id="part-layout" icon="view_carousel" title={t("layout", lang)} p={p}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Segmented<CarouselLayout>
                options={CAROUSEL_LAYOUTS.map((l) => ({
                  key: l.key,
                  icon: l.icon,
                  title: t(`carousel${l.key[0].toUpperCase()}${l.key.slice(1)}` as "carouselHero", lang),
                }))}
                value={carouselLayoutOf(item)}
                onChange={(layout) => onChange({ layout })}
                p={p}
              />
              <Slider icon="view_column" title={t("cards", lang)} value={carouselCountOf(item)} min={2} max={8} step={1} onChange={(count) => onChange({ count })} p={p} />
            </div>
          </Section>
          <Section id="part-text" icon="short_text" title={t("text", lang)} p={p}>
            <Field value={item.label} onChange={(label) => onChange({ label })} placeholder={t("label", lang)} p={p} />
          </Section>
          <Section id="part-size" icon="straighten" title={t("size", lang)} p={p}>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <WidthRow item={item} frame={frame} onChange={onChange} p={p} />
              {spec.size2 && (
                <Slider icon="height" title={t("height", lang)} value={sizeOf(item, {}).h} min={spec.size2.min} max={spec.size2.max} step={spec.size2.step} onChange={(size2) => onChange({ size2 })} p={p} />
              )}
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
        <>
          <PartHeader kind={item.kind} p={p} locked={!!locked} onDuplicate={onDuplicate} onToggleLock={onToggleLock} onDelete={onDelete} />
          {!trigger && <div style={{ height: 10 }} />}
        </>
      }
      tabs={trigger ? <PartTabs value={tab} onChange={setTab} p={p} /> : undefined}
    >
      {(!trigger || tab === "design") && design}
      {trigger && tab === "behavior" && <TriggerSection item={item} frame={frame} allFrames={allFrames} selfRect={selfRect} onChange={onChange} p={p} />}
      {(!trigger || tab === "behavior") && <NoteSection item={item} ai={ai} onChange={onChange} p={p} />}
    </PanelShell>
  );
}
