"use client";

import { useEffect, useState } from "react";
import {
  CARD_IMAGE_MIN,
  CAROUSEL_HEIGHTS,
  CAROUSEL_LAYOUTS,
  CHOICE_KINDS,
  CardAlign,
  ChoiceKind,
  CarouselLayout,
  DATE_LAYOUTS,
  DateLayout,
  FIELD_KINDS,
  FieldKind,
  Frame,
  Item,
  KIND_SPEC,
  LOADING_SIZES,
  PHONE_H,
  PHONE_W,
  PICTURE_KINDS,
  PROGRESS_DEFAULT_VALUE,
  Palette,
  PictureKind,
  RING_SIZES,
  SLIDER_DEFAULT_VALUE,
  TEXT_SIZES,
  TIME_LAYOUTS,
  TOP_BAR_SIZES,
  TRACK_DEFAULT,
  TRACK_MAX,
  TRACK_MIN,
  TimeLayout,
  actionSlotsOf,
  barWidths,
  cardContentAlignOf,
  cardDefaultFillOf,
  cardFillOf,
  cardImageMaxOf,
  cardImagePosOf,
  cardImageSizeOf,
  cardLayoutOf,
  cardLayoutPatch,
  cardTextColorOf,
  cardWidths,
  carouselCardPatch,
  carouselCardsOf,
  carouselCountOf,
  carouselLayoutOf,
  choiceTypePatch,
  dateLayoutOf,
  dayOf,
  fieldTypePatch,
  frameSizeOf,
  hourOf,
  isChoice,
  isField,
  isPicture,
  isProgress,
  isWideRail,
  maxRingThickness,
  minuteOf,
  onToken,
  pictureTypePatch,
  progressThickness,
  progressTypePatch,
  setIconSlot,
  sizeOf,
  timeLayoutOf,
  topBarHeightOf,
} from "@/lib/tokens";
import { CardLayoutPicker, Field, ImageRow, NamedSizes, PanelShell, Section, Segmented, Slider, TextTokenChips, Toggle, TokenChips } from "./ui";
import { arcPath, wavePath } from "./Loading";
import { Icon } from "./M3Node";
import { AiHooks } from "./Inspector";
import { AlignBox, CornerRows, EdgeCornerRows, EntryList, IconRow, NoTriggerNote, NoteSection, PartHeader, PartTabs, PlaceFn, StyleRun, Tab, TriggerSection, WidthRows, hasTrigger } from "./PartPanel";
import { dateHeadline } from "./Pickers";
import { KIND_TEXT, t, useLang } from "@/lib/i18n";

/* One panel for every part that is not a button. It wears the button's chrome -- the title row,
 * the two tabs, the align grid, the spec field -- and fills the design tab with only what the
 * part actually has: a bar has entries to arrange, a card a picture to place, a field a style to
 * pick. Choices are drawn rather than named wherever a drawing says it faster, and nothing is
 * explained in prose. A part a tap can go through keeps the trigger tab. */

type Change = (patch: Partial<Item>) => void;

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
function ProgressTypePicker({ item, onChange, p }: { item: Item; onChange: Change; p: Palette }) {
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
      label={t("partType", lang)}
    />
  );
}

/** What the indicator is saying, as two icons standing on their own at the start of the row: the
 *  loop it circles in with no end in sight, or the share it counts up to -- and that share is the
 *  slider that fills the rest of the row, which is there only when there is a share to set. */
function ProgressValue({ item, onChange, p }: { item: Item; onChange: Change; p: Palette }) {
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
        onChange={(k) => onChange({ value: k === "percent" ? PROGRESS_DEFAULT_VALUE : undefined })}
        p={p}
        grow={false}
        label={t("state", lang)}
      />
      {pct && (
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* the run beside it already says what this is measuring, so the slider carries no icon */}
          <Slider iconNode={<></>} title={t("progressState", lang)} value={item.value ?? PROGRESS_DEFAULT_VALUE} min={0} max={100} step={1} onChange={(value) => onChange({ value })} p={p} unit="%" />
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
function CarouselLayoutPicker({ item, onChange, p }: { item: Item; onChange: Change; p: Palette }) {
  const lang = useLang();
  const current = carouselLayoutOf(item);
  return (
    <Segmented<CarouselLayout>
      options={CAROUSEL_LAYOUTS.map((l) => ({
        key: l.key,
        title: t(l.text, lang),
        node: <CarouselThumb layout={l.key} on={l.key === current} p={p} />,
      }))}
      value={current}
      onChange={(layout) => onChange({ layout })}
      p={p}
      height={44}
      label={t("layout", lang)}
    />
  );
}

/** The cards themselves as one connected run: each cell shows the picture that card carries, or
 *  its number while it has none, and the one picked out is the card the controls under it -- and
 *  the trigger tab -- are about. A card a tap is sent from wears the run's own mark. */
function CardStrip({ item, selected, onSelect, p }: { item: Item; selected: number; onSelect: (i: number) => void; p: Palette }) {
  const lang = useLang();
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
      label={t("cards", lang)}
    />
  );
}

/** the places a bar can be tapped, as one connected run: the icons at its ends, or the entries
 *  along it, each cell the icon the place shows and a mark when a tap has been sent from it */
function SlotStrip({ item, selected, onSelect, p }: { item: Item; selected: string; onSelect: (k: string) => void; p: Palette }) {
  const lang = useLang();
  const slots = actionSlotsOf(item);
  return (
    <Segmented<string>
      options={slots.map((s) => ({ key: s.key, icon: s.value ?? undefined, label: s.value ? undefined : s.label, title: s.label, dot: !!item.actions?.[s.key] }))}
      value={selected}
      onChange={onSelect}
      p={p}
      height={40}
      tight={slots.length > 4}
      label={t("tapTo", lang)}
    />
  );
}

/** The three selection controls drawn small, as one connected run: the drawing of a switch, a
 *  checkbox and a radio is the whole of what tells them apart. */
function ChoiceThumb({ kind, on, p }: { kind: ChoiceKind; on: boolean; p: Palette }) {
  const ink = on ? p.onPrimary : p.onSurfaceVariant;
  if (kind === "switch")
    return (
      <span aria-hidden style={{ width: 30, height: 18, borderRadius: 9, border: `2px solid ${ink}`, boxSizing: "border-box", position: "relative" }}>
        <span style={{ position: "absolute", right: 2, top: 2, width: 10, height: 10, borderRadius: 5, background: ink }} />
      </span>
    );
  if (kind === "checkbox")
    return (
      <span aria-hidden style={{ width: 18, height: 18, borderRadius: 3, background: ink, display: "grid", placeItems: "center", color: on ? p.primary : p.surfaceContainerHigh }}>
        <Icon name="check" size={14} weight={700} />
      </span>
    );
  return (
    <span aria-hidden style={{ width: 18, height: 18, borderRadius: 9, border: `2px solid ${ink}`, boxSizing: "border-box", display: "grid", placeItems: "center" }}>
      <span style={{ width: 8, height: 8, borderRadius: 4, background: ink }} />
    </span>
  );
}

function ChoiceTypePicker({ item, onChange, p }: { item: Item; onChange: Change; p: Palette }) {
  const lang = useLang();
  return (
    <Segmented<ChoiceKind>
      options={CHOICE_KINDS.map((k) => ({ key: k, title: KIND_TEXT[lang][k]?.noun ?? KIND_SPEC[k].label, node: <ChoiceThumb kind={k} on={k === item.kind} p={p} /> }))}
      value={item.kind as ChoiceKind}
      onChange={(k) => onChange(choiceTypePatch(item, k))}
      p={p}
      height={44}
      label={t("partType", lang)}
    />
  );
}

/** the three things a box can show: a picture, the camera's view, a map */
function PictureTypePicker({ item, onChange, p }: { item: Item; onChange: Change; p: Palette }) {
  const lang = useLang();
  const icons: Record<PictureKind, string> = { image: "image", camera: "photo_camera", map: "map" };
  return (
    <Segmented<PictureKind>
      options={PICTURE_KINDS.map((k) => ({ key: k, icon: icons[k], title: KIND_TEXT[lang][k]?.noun ?? KIND_SPEC[k].label }))}
      value={item.kind as PictureKind}
      onChange={(k) => onChange(pictureTypePatch(item, k))}
      p={p}
      label={t("partType", lang)}
    />
  );
}

/** the two fields: one typed into, one that drops a list */
function FieldTypePicker({ item, onChange, p }: { item: Item; onChange: Change; p: Palette }) {
  const lang = useLang();
  const icons: Record<FieldKind, string> = { textField: "text_fields", select: "arrow_drop_down_circle" };
  return (
    <Segmented<FieldKind>
      options={FIELD_KINDS.map((k) => ({ key: k, icon: icons[k], title: KIND_TEXT[lang][k]?.noun ?? KIND_SPEC[k].label }))}
      value={item.kind as FieldKind}
      onChange={(k) => onChange(fieldTypePatch(item, k))}
      p={p}
      label={t("partType", lang)}
    />
  );
}

/** the words on a part: its label, and the second line it may carry under it */
function TextRows({ item, onChange, p, labelKey = "label", supportingKey = "supporting", paragraph = false, bold = false }: { item: Item; onChange: Change; p: Palette; labelKey?: "label" | "title" | "message"; supportingKey?: "supporting" | "action" | "body"; paragraph?: boolean; bold?: boolean }) {
  const lang = useLang();
  const spec = KIND_SPEC[item.kind];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {spec.hasLabel && (
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Field value={item.label} onChange={(label) => onChange({ label })} placeholder={t(labelKey, lang)} p={p} />
          </div>
          {bold && (
            <Segmented<"regular" | "bold">
              options={[
                { key: "regular", icon: "format_size", title: t("regular", lang) },
                { key: "bold", icon: "format_bold", title: t("bold", lang) },
              ]}
              value={item.bold ? "bold" : "regular"}
              onChange={(k) => onChange({ bold: k === "bold" || undefined })}
              p={p}
              grow={false}
              height={44}
              label={t("bold", lang)}
            />
          )}
        </div>
      )}
      {spec.hasSupporting && (
        <Field
          value={item.supporting ?? ""}
          onChange={(supporting) => onChange({ supporting })}
          placeholder={t(supportingKey, lang)}
          p={p}
          multiline={paragraph}
          rows={paragraph ? 2 : undefined}
          grow={paragraph}
          maxHeight={paragraph ? 140 : undefined}
        />
      )}
    </div>
  );
}

/** the size of a line of text: the M3 type scale it stands on, and the sp between its steps */
function TextSizeRows({ item, onChange, p }: { item: Item; onChange: Change; p: Palette }) {
  const lang = useLang();
  const spec = KIND_SPEC[item.kind];
  const size = item.size ?? spec.defSize ?? 28;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <Slider icon="format_size" title={t("fontSize", lang)} value={size} min={spec.size!.min} max={spec.size!.max} step={1} onChange={(v) => onChange({ size: v })} p={p} unit="sp" />
      <Segmented<string>
        options={TEXT_SIZES.map((s) => ({ key: s.key, title: t(s.key === "body" ? "typeBody" : s.key === "title" ? "typeTitle" : s.key === "headline" ? "typeHeadline" : "typeDisplay", lang), node: <span style={{ fontSize: Math.min(22, 10 + s.value * 0.25), fontWeight: 600, lineHeight: 1 }}>Aa</span> }))}
        value={TEXT_SIZES.find((s) => s.value === size)?.key ?? ""}
        onChange={(k) => onChange({ size: TEXT_SIZES.find((s) => s.key === k)!.value })}
        p={p}
        height={44}
        label={t("fontSize", lang)}
      />
    </div>
  );
}

/** a navigation rail's two states and where the expanded one goes: pictures of the rail itself */
function RailThumb({ expanded, modal, on, p }: { expanded: boolean; modal?: boolean; on: boolean; p: Palette }) {
  const ink = on ? p.onPrimary : p.onSurfaceVariant;
  return (
    <span aria-hidden style={{ display: "flex", width: 44, height: 26, borderRadius: 4, overflow: "hidden", border: `1.5px solid ${ink}`, boxSizing: "border-box", position: "relative" }}>
      <span style={{ width: expanded ? 20 : 9, height: "100%", background: ink, opacity: modal ? 0.55 : 1, flex: "0 0 auto" }} />
      {modal && <span style={{ position: "absolute", left: 9, top: 0, bottom: 0, right: 0, background: ink, opacity: 0.15 }} />}
    </span>
  );
}

function RailRows({ item, onChange, p, standalone }: { item: Item; onChange: Change; p: Palette; standalone: boolean }) {
  const lang = useLang();
  const wide = isWideRail(item);
  const value = !wide ? "" : item.railExpanded ? (item.railModal ? "modal" : "expanded") : "collapsed";
  return (
    <Segmented<string>
      options={[
        { key: "collapsed", title: t("railCollapsed", lang), node: <RailThumb expanded={false} on={value === "collapsed"} p={p} /> },
        { key: "expanded", title: t("railExpanded", lang), node: <RailThumb expanded on={value === "expanded"} p={p} /> },
        /* a rail that shares its group with other parts cannot overlay them, so the modal state waits until it stands alone */
        ...(standalone ? [{ key: "modal", title: t("railModal", lang), node: <RailThumb expanded modal on={value === "modal"} p={p} /> }] : []),
      ]}
      value={value}
      onChange={(k) => onChange({ railExpanded: k !== "collapsed", railModal: k === "modal" ? true : wide ? false : undefined })}
      p={p}
      height={44}
      label={t("railState", lang)}
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
  measured,
  railStandalone = false,
}: {
  ai: AiHooks;
  item: Item;
  palette: Palette;
  frame: Frame | null;
  onChange: Change;
  onDelete: () => void;
  onDuplicate: () => void;
  locked?: boolean;
  onToggleLock?: () => void;
  onPlace?: PlaceFn;
  selfRect: { x: number; y: number; w: number; h: number } | null;
  allFrames: Frame[];
  /** the width the part takes on its own when no width was set */
  measured?: number;
  /** the rail owns its group, so it may overlay the screen when expanded */
  railStandalone?: boolean;
}) {
  const lang = useLang();
  const [tab, setTab] = useState<Tab>("design");
  const spec = KIND_SPEC[item.kind];
  const frameW = frame ? frameSizeOf(frame).w : PHONE_W;
  const frameH = frame ? frameSizeOf(frame).h : PHONE_H;
  const [picked, setCard] = useState(0);
  /** the place inside a bar the trigger tab is about */
  const [slot, setSlot] = useState<string>("");
  /* another part being picked starts the panel on its first card, and its first place, again */
  useEffect(() => {
    setCard(0);
    setSlot("");
  }, [item.id]);
  /** the carousel card the panel is about: its picture, and where a tap on it goes. A row that
   *  has lost cards leaves the pick on the last one still there. */
  const card = item.kind === "carousel" ? Math.max(0, Math.min(picked, carouselCountOf(item) - 1)) : picked;
  /* a bar is measured across the screen; a ring is measured corner to corner */
  const bar = item.kind === "linearProgress";
  const { w: width, h: height } = sizeOf(item, measured ? { [item.id]: measured } : {});
  const slots = actionSlotsOf(item);
  const slotKey = slots.some((s) => s.key === slot) ? slot : (slots[0]?.key ?? "");
  const kind = item.kind;
  const iconSlots = [
    { key: "icon", value: item.icon, title: t(spec.hasIcon && (kind === "listItem" || kind === "topAppBar" || kind === "searchBar") ? "leading" : "icon", lang) },
    ...(kind === "listItem" || kind === "topAppBar" || kind === "searchBar" ? [{ key: "icon2", value: item.icon2 ?? null, title: t("trailing", lang) }] : []),
  ];
  const widthRows = (auto = false) => (
    <WidthRows value={width} min={spec.size?.min ?? 40} max={spec.size?.max ?? PHONE_W} step={spec.size?.step ?? 4} frameW={frameW} onChange={(size) => onChange({ size })} p={p} auto={auto} />
  );
  const heightRow = (presets?: readonly { key: string; value: number }[]) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <Slider icon="height" title={t("height", lang)} value={height} min={spec.size2?.min ?? 24} max={Math.max(spec.size2?.max === PHONE_H ? frameH : (spec.size2?.max ?? PHONE_H), height)} step={spec.size2?.step ?? 4} onChange={(size2) => onChange({ size2 })} p={p} />
      {presets && <NamedSizes steps={presets} value={height} onChange={(size2) => onChange({ size2 })} p={p} label={t("height", lang)} />}
    </div>
  );
  const sizeSection = (children: React.ReactNode) => (
    <Section id="part-size" icon="straighten" title={t("size", lang)} p={p}>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>{children}</div>
    </Section>
  );

  const design = (
    <>
      {/* ---------- the parts that switch kind inside the panel ---------- */}
      {isChoice(kind) && (
        <Section id="part-type" icon="toggle_on" title={t("partType", lang)} p={p}>
          <ChoiceTypePicker item={item} onChange={onChange} p={p} />
        </Section>
      )}
      {isPicture(kind) && (
        <Section id="part-type" icon="image" title={t("partType", lang)} p={p}>
          <PictureTypePicker item={item} onChange={onChange} p={p} />
        </Section>
      )}
      {isField(kind) && (
        <Section id="part-type" icon="text_fields" title={t("partType", lang)} p={p}>
          <FieldTypePicker item={item} onChange={onChange} p={p} />
        </Section>
      )}
      {isProgress(kind) && (
        <Section id="part-type" icon="progress_activity" title={t("partType", lang)} p={p}>
          <ProgressTypePicker item={item} onChange={onChange} p={p} />
        </Section>
      )}

      {/* ---------- words and icons ---------- */}
      {(kind === "topAppBar" || kind === "searchBar" || kind === "listItem") && (
        <Section id="part-text" icon="short_text" title={t("text", lang)} p={p}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {/* the words stand between the two icons they stand between on the part */}
            <IconRow slots={iconSlots} onPick={(key, icon) => onChange(setIconSlot(item, key, icon))} p={p}>
              <Field value={item.label} onChange={(label) => onChange({ label })} placeholder={t(kind === "searchBar" ? "placeholder" : kind === "topAppBar" ? "title" : "label", lang)} p={p} />
            </IconRow>
            {spec.hasSupporting && <Field value={item.supporting ?? ""} onChange={(supporting) => onChange({ supporting })} placeholder={t("supporting", lang)} p={p} />}
          </div>
        </Section>
      )}
      {(kind === "dialog" || isField(kind)) && (
        <Section id="part-text" icon="short_text" title={t("text", lang)} p={p}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <IconRow slots={iconSlots} onPick={(key, icon) => onChange(setIconSlot(item, key, icon))} p={p}>
              <Field value={item.label} onChange={(label) => onChange({ label })} placeholder={t(kind === "dialog" ? "title" : "label", lang)} p={p} />
            </IconRow>
            <Field
              value={item.supporting ?? ""}
              onChange={(supporting) => onChange({ supporting })}
              placeholder={t(kind === "dialog" ? "body" : "supporting", lang)}
              p={p}
              multiline={kind === "dialog"}
              rows={kind === "dialog" ? 2 : undefined}
              grow={kind === "dialog"}
              maxHeight={140}
            />
          </div>
        </Section>
      )}
      {kind === "snackbar" && (
        <Section id="part-text" icon="short_text" title={t("text", lang)} p={p}>
          <TextRows item={item} onChange={onChange} p={p} labelKey="message" supportingKey="action" />
        </Section>
      )}
      {kind === "card" && (
        <Section id="part-text" icon="short_text" title={t("text", lang)} p={p}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <TextRows item={item} onChange={onChange} p={p} labelKey="title" supportingKey="body" paragraph />
            {/* where the words sit on the card, and the colour they are written in */}
            <Segmented<CardAlign>
              options={[
                { key: "start", icon: "vertical_align_top", title: t("textTop", lang) },
                { key: "center", icon: "vertical_align_center", title: t("textMiddle", lang) },
                { key: "end", icon: "vertical_align_bottom", title: t("textBottom", lang) },
              ]}
              value={cardContentAlignOf(item)}
              onChange={(contentAlign) => onChange({ contentAlign })}
              p={p}
              label={t("textPosition", lang)}
            />
            <TextTokenChips value={item.textColor} auto={cardTextColorOf(item, p)} onChange={(textColor) => onChange({ textColor })} p={p} />
          </div>
        </Section>
      )}
      {(isChoice(kind) || kind === "text") && (
        <Section id="part-text" icon="short_text" title={t("text", lang)} p={p}>
          <TextRows item={item} onChange={onChange} p={p} bold={kind === "text"} />
        </Section>
      )}

      {/* ---------- entries ---------- */}
      {(kind === "bottomNav" || kind === "navRail" || kind === "toolbar" || kind === "tabs" || kind === "select") && (
        <Section id="part-entries" icon={kind === "select" ? "list" : "view_column"} title={t(kind === "select" ? "options" : "tabs", lang)} p={p}>
          <EntryList item={item} onChange={onChange} p={p} icons={kind !== "tabs" && kind !== "select"} labels={kind !== "toolbar"} selectable={kind !== "toolbar"} clearable={kind === "select"} />
        </Section>
      )}

      {/* ---------- pictures ---------- */}
      {kind === "card" && (
        <Section id="part-image" icon="image" title={t("image", lang)} p={p}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <CardLayoutPicker value={cardLayoutOf(item)} onChange={(layout) => onChange(cardLayoutPatch(layout))} p={p} />
            {!item.noImage && cardImagePosOf(item) !== "background" && cardImageMaxOf(item) > CARD_IMAGE_MIN && (
              /* the image area's one free dimension: its height on top, its width at a side; a card too small to leave room hides it */
              <Slider
                icon={cardImagePosOf(item) === "top" ? "height" : "width"}
                title={t(cardImagePosOf(item) === "top" ? "height" : "width", lang)}
                value={cardImageSizeOf(item)}
                min={CARD_IMAGE_MIN}
                max={cardImageMaxOf(item)}
                step={4}
                onChange={(imageSize) => onChange({ imageSize })}
                p={p}
              />
            )}
            {(!item.noImage || item.src) && <ImageRow key={item.id} value={item.src} onChange={(src) => onChange({ src })} p={p} />}
          </div>
        </Section>
      )}
      {kind === "image" && (
        <Section id="part-image" icon="image" title={t("image", lang)} p={p}>
          <ImageRow key={item.id} value={item.src} onChange={(src) => onChange({ src })} p={p} />
        </Section>
      )}
      {kind === "carousel" && (
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
              <ImageRow value={carouselCardsOf(item)[card]?.src} onChange={(src) => onChange(carouselCardPatch(item, card, { src }))} p={p} />
            </div>
          </Section>
        </>
      )}

      {/* ---------- the pickers' own controls ---------- */}
      {kind === "datePicker" && (
        <>
          <Section id="part-layout" icon="calendar_month" title={t("layout", lang)} p={p}>
            <Segmented<DateLayout>
              options={DATE_LAYOUTS.map((l) => ({ key: l.key, icon: l.icon, title: t(l.text, lang) }))}
              value={dateLayoutOf(item)}
              onChange={(layout) => onChange({ layout })}
              p={p}
              label={t("layout", lang)}
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
              <Field value={item.label} onChange={(label) => onChange({ label })} placeholder={dateHeadline(dayOf(item), lang)} p={p} />
            </Section>
          )}
        </>
      )}
      {kind === "timePicker" && (
        <>
          <Section id="part-layout" icon="schedule" title={t("layout", lang)} p={p}>
            <Segmented<TimeLayout>
              options={TIME_LAYOUTS.map((l) => ({ key: l.key, icon: l.icon, title: t(l.text, lang) }))}
              value={timeLayoutOf(item)}
              onChange={(layout) => onChange({ layout })}
              p={p}
              label={t("layout", lang)}
            />
          </Section>
          <Section id="part-time" icon="schedule" title={t("selectTime", lang)} p={p}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Slider icon="schedule" title={t("hourLabel", lang)} value={hourOf(item)} min={0} max={23} step={1} onChange={(hour) => onChange({ hour })} p={p} />
              <Slider icon="timer" title={t("minuteLabel", lang)} value={minuteOf(item)} min={0} max={59} step={1} onChange={(minute) => onChange({ minute })} p={p} />
            </div>
          </Section>
        </>
      )}

      {/* ---------- style and colour ---------- */}
      {(kind === "card" || isField(kind) || kind === "toolbar") && (
        <Section id="part-style" icon="palette" title={t("style", lang)} p={p}>
          <StyleRun kind={kind} value={item.variant} onChange={(variant) => onChange({ variant })} p={p} />
        </Section>
      )}
      {(kind === "card" || kind === "listItem" || kind === "box") && (
        <Section id="part-fill" icon="format_color_fill" title={t("background", lang)} p={p}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <TokenChips
              value={kind === "card" ? cardFillOf(item) : (item.fill ?? "surfaceContainerLow")}
              onChange={(fill) => onChange({ fill })}
              p={p}
              none={kind === "card"}
              noneOn={kind === "card" && !item.fill}
              onNone={() => onChange({ fill: undefined })}
              noneColor={kind === "card" ? p[cardDefaultFillOf(item.variant)] : undefined}
              noneTextColor={kind === "card" ? onToken(cardDefaultFillOf(item.variant), p) : undefined}
              noneIcon={kind === "card" ? "restart_alt" : undefined}
              noneLabel={kind === "card" ? t("defaultColor", lang) : undefined}
            />
            {kind === "listItem" && item.icon && (
              /* the disc behind the leading icon, or none: the icon stands bare */
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ color: p.onSurfaceVariant, display: "inline-flex" }} title={t("iconBackground", lang)}>
                  <Icon name="account_circle" size={20} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <TokenChips
                    value={item.iconFill && item.iconFill !== "none" ? item.iconFill : "primaryContainer"}
                    onChange={(iconFill) => onChange({ iconFill })}
                    p={p}
                    none
                    noneOn={item.iconFill === "none"}
                    onNone={() => onChange({ iconFill: "none" })}
                  />
                </div>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* ---------- state ---------- */}
      {isChoice(kind) && (
        <Section id="part-state" icon="tune" title={t("state", lang)} p={p}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Toggle on={!!item.checked} onChange={(checked) => onChange({ checked })} p={p} icon="toggle_on" label={t("on", lang)} grow />
            {kind === "switch" && <Toggle on={!item.noCheck} onChange={(on) => onChange({ noCheck: on ? undefined : true })} p={p} icon="check" label={t("thumbCheck", lang)} grow />}
          </div>
        </Section>
      )}
      {kind === "listItem" && (
        <Section id="part-state" icon="tune" title={t("state", lang)} p={p}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {/* a switch at the trailing end takes the place of the trailing icon */}
            <Toggle on={!!item.switch} onChange={(on) => onChange({ switch: on || undefined })} p={p} icon="toggle_on" label={t("listSwitch", lang)} grow />
            {item.switch && <Toggle on={!!item.checked} onChange={(checked) => onChange({ checked })} p={p} icon="check" label={t("on", lang)} grow />}
          </div>
        </Section>
      )}
      {kind === "box" && (
        <Section id="part-state" icon="tune" title={t("state", lang)} p={p}>
          <Toggle on={!!item.checked} onChange={(checked) => onChange({ checked })} p={p} icon="drag_handle" label={t("handle", lang)} grow />
        </Section>
      )}
      {kind === "navRail" && (
        <Section id="part-rail" icon="side_navigation" title={t("railState", lang)} p={p}>
          <RailRows item={item} onChange={onChange} p={p} standalone={railStandalone} />
        </Section>
      )}
      {kind === "loadingIndicator" && (
        <Section id="part-state" icon="tune" title={t("state", lang)} p={p}>
          <Toggle on={!!item.contained} onChange={(contained) => onChange({ contained })} p={p} icon="circle" label={t("container", lang)} grow />
        </Section>
      )}
      {isProgress(kind) && (
        <Section id="part-state" icon="tune" title={t("state", lang)} p={p}>
          <ProgressValue item={item} onChange={onChange} p={p} />
        </Section>
      )}
      {kind === "slider" && (
        <Section id="part-state" icon="tune" title={t("state", lang)} p={p}>
          <Slider icon="percent" title={t("progressState", lang)} value={item.value ?? SLIDER_DEFAULT_VALUE} min={0} max={100} step={1} onChange={(value) => onChange({ value })} p={p} unit="%" />
        </Section>
      )}

      {/* ---------- size and corners ---------- */}
      {kind === "text" && sizeSection(<TextSizeRows item={item} onChange={onChange} p={p} />)}
      {kind === "topAppBar" &&
        sizeSection(
          <>
            {widthRows()}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Slider icon="height" title={t("height", lang)} value={topBarHeightOf(item)} min={spec.size2!.min} max={spec.size2!.max} step={4} onChange={(size2) => onChange({ size2 })} p={p} />
              <NamedSizes steps={TOP_BAR_SIZES.map((b) => ({ key: b.key, value: b.h }))} value={topBarHeightOf(item)} onChange={(size2) => onChange({ size2 })} p={p} label={t("height", lang)} />
            </div>
            <EdgeCornerRows item={item} onChange={onChange} p={p} />
          </>,
        )}
      {(kind === "bottomNav" || kind === "tabs") &&
        sizeSection(
          <>
            {widthRows()}
            {kind === "bottomNav" && <EdgeCornerRows item={item} onChange={onChange} p={p} />}
          </>,
        )}
      {kind === "navRail" &&
        sizeSection(
          <>
            {heightRow([
              { key: "half", value: Math.round(frameH / 2) },
              { key: "full", value: frameH },
            ])}
            <EdgeCornerRows item={item} onChange={onChange} p={p} />
          </>,
        )}
      {(kind === "searchBar" || kind === "listItem" || isField(kind) || kind === "divider") && sizeSection(widthRows())}
      {kind === "switch" && sizeSection(widthRows(true))}
      {(kind === "card" || kind === "box") &&
        sizeSection(
          <>
            {widthRows()}
            {heightRow(kind === "card" ? spec.size2!.presets!.map((v) => ({ key: v === 120 ? "s" : v === 188 ? "m" : "l", value: v })) : [{ key: "half", value: Math.round(frameH / 2) }, { key: "full", value: frameH }])}
            <CornerRows item={item} onChange={onChange} p={p} />
          </>,
        )}
      {isPicture(kind) &&
        sizeSection(
          <>
            {widthRows()}
            {kind !== "image" && heightRow()}
            <CornerRows item={item} onChange={onChange} p={p} />
          </>,
        )}
      {kind === "carousel" &&
        sizeSection(
          /* a carousel runs the width of the screen it is on: its height is the one measure its author sets */
          heightRow(CAROUSEL_HEIGHTS),
        )}
      {(kind === "datePicker" || kind === "timePicker") && sizeSection(widthRows())}
      {kind === "slider" &&
        sizeSection(
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Slider icon="width" title={t("width", lang)} value={item.size ?? spec.w} min={Math.min(spec.size!.min, item.size ?? spec.w)} max={Math.max(frameW, spec.size!.max)} step={spec.size!.step} onChange={(size) => onChange({ size })} p={p} />
            <NamedSizes steps={barWidths(frameW)} value={item.size ?? spec.w} onChange={(size) => onChange({ size })} p={p} label={t("width", lang)} />
          </div>,
        )}
      {kind === "loadingIndicator" &&
        sizeSection(
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Slider icon="open_in_full" title={t("size", lang)} value={item.size ?? spec.w} min={spec.size!.min} max={spec.size!.max} step={spec.size!.step} onChange={(size) => onChange({ size })} p={p} />
            <NamedSizes steps={LOADING_SIZES} value={item.size ?? spec.w} onChange={(size) => onChange({ size })} p={p} />
          </div>,
        )}
      {isProgress(kind) &&
        sizeSection(
          /* the two measures are each a slider over its named sizes, with room between them so
             the eye can tell which row belongs to which -- the same as a button's panel. How
             thick the track is comes first: a ring can only be so thick before its gap eats it. */
          <>
            <Slider
              icon="line_weight"
              title={t("trackThickness", lang)}
              value={progressThickness(item)}
              min={TRACK_MIN}
              max={kind === "circularProgress" ? maxRingThickness(item.size ?? spec.w) : TRACK_MAX}
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
          </>,
        )}

      {onPlace && (
        <Section id="part-align" icon="grid_on" title={t("align", lang)} p={p}>
          <AlignBox key={item.id} onPlace={onPlace} p={p} />
        </Section>
      )}
    </>
  );

  return (
    <PanelShell
      p={p}
      locked={!!locked}
      onUnlock={onToggleLock}
      head={<PartHeader kind={item.kind} p={p} locked={!!locked} onDuplicate={onDuplicate} onToggleLock={onToggleLock} onDelete={onDelete} />}
      tabs={<PartTabs value={tab} onChange={setTab} p={p} />}
    >
      {tab === "design" && (
        <div role="tabpanel" id="part-panel-design" aria-labelledby="part-tab-design">
          {design}
        </div>
      )}
      {tab === "behavior" && (
        <div role="tabpanel" id="part-panel-behavior" aria-labelledby="part-tab-behavior">
          {kind === "carousel" ? (
            /* every card is a place of its own to be sent from: the row picks which one */
            <TriggerSection item={item} frame={frame} allFrames={allFrames} selfRect={selfRect} onChange={onChange} p={p} slot={`tab:${card}`} head={<CardStrip item={item} selected={card} onSelect={setCard} p={p} />} />
          ) : slots.length > 0 ? (
            /* a bar is tapped at its icons or along its entries: the row picks which place */
            <TriggerSection item={item} frame={frame} allFrames={allFrames} selfRect={selfRect} onChange={onChange} p={p} slot={slotKey} head={<SlotStrip item={item} selected={slotKey} onSelect={setSlot} p={p} />} />
          ) : hasTrigger(kind) ? (
            <TriggerSection item={item} frame={frame} allFrames={allFrames} selfRect={selfRect} onChange={onChange} p={p} />
          ) : (
            <NoTriggerNote p={p} />
          )}
          <NoteSection item={item} ai={ai} onChange={onChange} p={p} />
        </div>
      )}
    </PanelShell>
  );
}
