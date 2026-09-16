"use client";

import { useEffect, useState } from "react";
import {
  BACK_TARGET,
  ColorToken,
  Frame,
  FramePreset,
  Group,
  LINK_TARGET,
  Palette,
  Place,
  SWIPE_DIRS,
  frameOfGroup,
  isPhoneFrame,
  onToken,
} from "@/lib/tokens";
import { Icon } from "./M3Node";
import {
  ButtonRun,
  Field,
  IconBtn,
  PanelShell,
  Section,
  Segmented,
  TidyButton,
  TidyState,
} from "./ui";
import { AiHooks, FrameSizePicker } from "./Inspector";
import { AiIconBtn, PartTabs, Tab } from "./PartPanel";
import { COLOR_TOKEN_TEXT, t, useLang } from "@/lib/i18n";

/* The panel for a screen. It wears the same chrome a part's panel does -- the title row with
 * what can be done to the screen, then short sections -- and keeps to what a screen actually
 * has. The design tab holds its name and shape, its colour and how its body is laid out; the
 * trigger tab holds where taps on it lead and what it is for -- the same split a part's panel
 * makes. What the prompt says about it lives in the prompt tab. */

/** the few colours a screen is painted in, offered the way a part's looks are */
const SCREEN_FILLS: ColorToken[] = [
  "surface",
  "surfaceContainerLow",
  "surfaceContainerHigh",
  "primaryContainer",
  "secondaryContainer",
];

/** the screen's colour as one connected run: each cell is the colour, and the one worn carries a check */
function ScreenFillRun({
  value,
  onChange,
  p,
}: {
  value: ColorToken;
  onChange: (bg: ColorToken | undefined) => void;
  p: Palette;
}) {
  const lang = useLang();
  return (
    <Segmented<ColorToken>
      options={SCREEN_FILLS.map((tk) => ({
        key: tk,
        title: lang === "en" ? tk : COLOR_TOKEN_TEXT[lang][tk],
        node: tk === value ? <Icon name="check" size={20} /> : <span />,
        style: {
          background: p[tk],
          color: onToken(tk, p),
          border: `1px solid ${p.outlineVariant}`,
          minWidth: 0,
          padding: 0,
        },
      }))}
      value={SCREEN_FILLS.includes(value) ? value : SCREEN_FILLS[0]}
      onChange={(bg) => onChange(bg === "surface" ? undefined : bg)}
      p={p}
      height={44}
      label={t("screenLook", lang)}
      tight
    />
  );
}

/** the title row: what the screen is, and everything that can be done to it */
function FrameHeader({
  frame,
  p,
  onPreview,
  onDuplicate,
  onDelete,
}: {
  frame: Frame;
  p: Palette;
  onPreview: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const lang = useLang();
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        marginBottom: 6,
        padding: "0 2px 0 6px",
        color: p.onSurfaceVariant,
      }}
    >
      <Icon
        name={isPhoneFrame(frame) ? "smartphone" : "desktop_windows"}
        size={20}
      />
      <span
        style={{
          fontSize: 14,
          fontWeight: 600,
          flex: 1,
          minWidth: 0,
          color: p.onSurface,
          marginLeft: 4,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {frame.name || t("screen", lang)}
      </span>
      <IconBtn
        icon="play_arrow"
        p={p}
        onClick={onPreview}
        title={t("previewFrom", lang)}
        size={36}
        fill
      />
      <IconBtn
        icon="content_copy"
        p={p}
        onClick={onDuplicate}
        title={t("duplicate", lang)}
        size={36}
      />
      <IconBtn
        icon="delete"
        p={p}
        danger
        onClick={onDelete}
        title={t("delete", lang)}
        size={36}
      />
    </div>
  );
}

/** the screens a tap or a swipe on this screen leads to: what the prompt will link */
type LinkOut = { key: string; label: string; icon: string; count: number };
function linksOutOf(
  frame: Frame,
  frames: Frame[],
  groups: Group[],
  widths: Record<string, number>,
  lang: Parameters<typeof t>[1],
): LinkOut[] {
  const targets = new Map<string, LinkOut>();
  const add = (to: string | undefined, icon: string) => {
    if (!to) return;
    const known =
      to === BACK_TARGET ||
      to === LINK_TARGET ||
      frames.some((f) => f.id === to);
    if (!known) return;
    const label =
      to === BACK_TARGET
        ? t("goBack", lang)
        : to === LINK_TARGET
          ? t("linkBrowser", lang)
          : (frames.find((f) => f.id === to)?.name ?? "") || t("screen", lang);
    const cur = targets.get(to);
    targets.set(to, {
      key: to,
      label,
      icon: cur?.icon ?? icon,
      count: (cur?.count ?? 0) + 1,
    });
  };
  for (const g of groups) {
    if (frameOfGroup(g, frames, widths)?.id !== frame.id) continue;
    for (const it of g.items) {
      add(it.action?.to, "touch_app");
      for (const a of Object.values(it.actions ?? {})) add(a.to, "touch_app");
    }
  }
  for (const d of SWIPE_DIRS) add(frame.swipe?.[d.key], d.icon);
  return [...targets.values()];
}

function LinksOut({ links, p }: { links: LinkOut[]; p: Palette }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {links.map((v) => (
        <span
          key={v.key}
          title={v.label}
          style={{
            height: 30,
            padding: "0 10px 0 8px",
            borderRadius: 15,
            background: p.surfaceContainerHigh,
            color: p.onSurfaceVariant,
            fontSize: 12,
            fontWeight: 600,
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            maxWidth: "100%",
          }}
        >
          <Icon name={v.icon} size={16} />
          <span
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {v.label}
          </span>
          {v.count > 1 && <span style={{ opacity: 0.7 }}>×{v.count}</span>}
        </span>
      ))}
    </div>
  );
}

export function FrameInspector({
  frame,
  palette: p,
  onChange,
  onDelete,
  onDuplicate,
  onPreview,
  prompt,
  onSaveImage,
  frames,
  groups,
  widths,
  tidy,
  onTidy,
  onPlace,
  ai,
  onSize,
}: {
  frame: Frame;
  palette: Palette;
  onChange: (patch: Partial<Frame>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onPreview: () => void;
  /** the prompt for this one screen, copied from the export row */
  prompt: string;
  onSaveImage: () => Promise<void>;
  frames: Frame[];
  groups: Group[];
  widths: Record<string, number>;
  /** what the tidy button offers: tidy the screen, undo the last tidy, or nothing (already tidy) */
  tidy: TidyState;
  onTidy: () => void;
  /** sets where Tidy puts the body of this screen, and tidies */
  onPlace: (place: Place) => void;
  ai: AiHooks;
  onSize: (preset: FramePreset) => void;
}) {
  const lang = useLang();
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<Tab>("design");
  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 1400);
    return () => clearTimeout(id);
  }, [copied]);
  const links = linksOutOf(frame, frames, groups, widths, lang);
  const actionBtn = (
    icon: string,
    label: string,
    onClick: () => void,
    busy?: boolean,
  ) => (
    <button
      onClick={onClick}
      disabled={busy}
      className="m3-press"
      style={{
        flex: 1,
        height: 44,
        borderRadius: 22,
        border: "none",
        background: p.secondaryContainer,
        color: p.onSecondaryContainer,
        fontSize: 13,
        fontWeight: 600,
        cursor: busy ? "default" : "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        opacity: busy ? 0.6 : 1,
      }}
    >
      <Icon name={icon} size={20} />
      {label}
    </button>
  );
  return (
    <PanelShell
      p={p}
      head={
        <FrameHeader
          frame={frame}
          p={p}
          onPreview={onPreview}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
        />
      }
      tabs={<PartTabs value={tab} onChange={setTab} p={p} />}
    >
      <div
        role="tabpanel"
        id="part-panel-design"
        aria-labelledby="part-tab-design"
        hidden={tab !== "design"}
      >
        <Section id="frame-name" icon="label" title={t("name", lang)} p={p}>
          {/* the shape the screen takes stands at the start of its name, the way a part's icon does */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <FrameSizePicker
              frame={frame}
              palette={p}
              onChange={onSize}
              compact
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <Field
                value={frame.name}
                onChange={(name) => onChange({ name })}
                placeholder={t("screenName", lang)}
                p={p}
              />
            </div>
          </div>
        </Section>
        <Section id="frame-style" icon="palette" title={t("style", lang)} p={p}>
          <ScreenFillRun
            value={frame.bg ?? "surface"}
            onChange={(bg) => onChange({ bg })}
            p={p}
          />
        </Section>
        <Section
          id="frame-tidy"
          icon="align_space_even"
          title={t("tidy", lang)}
          p={p}
        >
          <TidyButton
            state={tidy}
            onClick={onTidy}
            p={p}
            place={frame.place}
            onPlace={onPlace}
          />
        </Section>
      </div>
      <div
        role="tabpanel"
        id="part-panel-behavior"
        aria-labelledby="part-tab-behavior"
        hidden={tab !== "behavior"}
      >
        {links.length > 0 && (
          <Section
            id="frame-links"
            icon="alt_route"
            title={t("linksOut", lang)}
            p={p}
          >
            <LinksOut links={links} p={p} />
          </Section>
        )}
        <Section
          id="frame-note"
          icon="notes"
          title={t("description", lang)}
          p={p}
        >
          <Field
            value={frame.note ?? ""}
            onChange={(note) => onChange({ note: note || undefined })}
            placeholder={t("screenDescription", lang)}
            p={p}
            multiline
            grow
            rows={2}
            maxHeight={200}
            aiBusy={ai.busy}
            action={<AiIconBtn ai={ai} p={p} />}
          />
        </Section>
      </div>
      <Section
        id="frame-export"
        icon="ios_share"
        title={t("export", lang)}
        p={p}
      >
        <ButtonRun>
          {actionBtn(
            copied ? "check" : "content_copy",
            copied ? t("copied", lang) : t("prompt", lang),
            async () => {
              try {
                await navigator.clipboard.writeText(prompt);
                setCopied(true);
              } catch {}
            },
          )}
          {actionBtn(
            "image",
            saving ? t("saving", lang) : t("saveImage", lang),
            async () => {
              setSaving(true);
              try {
                await onSaveImage();
              } finally {
                setSaving(false);
              }
            },
            saving,
          )}
        </ButtonRun>
      </Section>
    </PanelShell>
  );
}
