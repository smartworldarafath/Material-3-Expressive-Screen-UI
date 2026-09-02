"use client";

import { motion } from "motion/react";
import {
  H,
  Item,
  Kind,
  MEASURED,
  NAV_BAR_H,
  Palette,
  Radii,
  STATUS_BAR_H,
  baseRadii,
  onToken,
  sizeOf,
  variantShadow,
  variantStyle,
} from "@/lib/tokens";
import { CircularProgress, LinearProgress, LoadingIndicator } from "./Loading";
import { t, useLang } from "@/lib/i18n";

export function Icon({
  name,
  size = 24,
  color,
  fill,
  weight,
}: {
  name: string;
  size?: number;
  color?: string;
  fill?: boolean;
  weight?: number;
}) {
  return (
    <span
      className="msr"
      data-fill={fill ? "1" : "0"}
      style={{
        fontSize: size,
        color,
        fontVariationSettings: weight
          ? `"FILL" ${fill ? 1 : 0}, "wght" ${weight}, "GRAD" 0, "opsz" 24`
          : undefined,
      }}
    >
      {name}
    </span>
  );
}

const ellipsis = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
} as const;

const NO_BOX: Kind[] = [
  "circularProgress",
  "linearProgress",
  "loadingIndicator",
  "switch",
  "checkbox",
  "slider",
  "text",
  "divider",
];

/** Padding follows M3: icon+label is tighter than label alone. */
export function ButtonContent({ item }: { item: Item }) {
  const hasIcon = !!item.icon;
  const hasLabel = item.label.trim().length > 0;
  const padX = hasLabel ? (hasIcon ? 22 : 26) : 16;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: hasIcon && hasLabel ? 8 : 0,
        paddingLeft: padX,
        paddingRight: padX,
        height: H,
        fontSize: 16,
        fontWeight: 500,
        letterSpacing: 0.1,
        whiteSpace: "nowrap",
      }}
    >
      {hasIcon && <Icon name={item.icon!} size={24} fill={item.variant === "filled"} />}
      {hasLabel && <span>{item.label}</span>}
    </span>
  );
}

function ExtendedFabContent({ item }: { item: Item }) {
  const hasIcon = !!item.icon;
  const hasLabel = item.label.trim().length > 0;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: hasIcon && hasLabel ? 12 : 0,
        padding: "0 20px",
        height: 56,
        fontSize: 14,
        fontWeight: 500,
        whiteSpace: "nowrap",
      }}
    >
      {hasIcon && <Icon name={item.icon!} size={24} />}
      {hasLabel && <span>{item.label}</span>}
    </span>
  );
}

function ChipContent({ item, p }: { item: Item; p: Palette }) {
  const on = !!item.checked;
  const lead = on ? "check" : item.icon;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        paddingLeft: lead ? 8 : 16,
        paddingRight: 16,
        height: 32,
        fontSize: 14,
        fontWeight: 500,
        whiteSpace: "nowrap",
        color: on ? p.onSecondaryContainer : undefined,
      }}
    >
      {lead && <Icon name={lead} size={18} />}
      <span>{item.label}</span>
    </span>
  );
}

function SwitchContent({ item, p }: { item: Item; p: Palette }) {
  const on = !!item.checked;
  const hasLabel = item.label.trim().length > 0;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 14, height: 32, whiteSpace: "nowrap" }}>
      {hasLabel && <span style={{ fontSize: 16, color: p.onSurface }}>{item.label}</span>}
      <span
        style={{
          position: "relative",
          width: 52,
          height: 32,
          borderRadius: 16,
          background: on ? p.primary : p.surfaceContainerHighest,
          border: on ? "2px solid transparent" : `2px solid ${p.outline}`,
          boxSizing: "border-box",
          flex: "0 0 auto",
          transition: "background 160ms",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: "50%",
            left: on ? 22 : 4,
            width: on ? 24 : 16,
            height: on ? 24 : 16,
            marginTop: on ? -12 : -8,
            borderRadius: 12,
            background: on ? p.onPrimary : p.outline,
            display: "grid",
            placeItems: "center",
            color: p.onPrimaryContainer,
            transition: "left 160ms, width 160ms, height 160ms",
          }}
        >
          {on && <Icon name="check" size={16} weight={600} />}
        </span>
      </span>
    </span>
  );
}

function CheckboxContent({ item, p }: { item: Item; p: Palette }) {
  const on = !!item.checked;
  const hasLabel = item.label.trim().length > 0;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, height: 40, whiteSpace: "nowrap" }}>
      <span style={{ width: 40, height: 40, display: "grid", placeItems: "center", flex: "0 0 auto" }}>
        <span
          style={{
            width: 18,
            height: 18,
            borderRadius: 3,
            boxSizing: "border-box",
            border: on ? "none" : `2px solid ${p.onSurfaceVariant}`,
            background: on ? p.primary : "transparent",
            color: p.onPrimary,
            display: "grid",
            placeItems: "center",
          }}
        >
          {on && <Icon name="check" size={16} weight={700} />}
        </span>
      </span>
      {hasLabel && <span style={{ fontSize: 16, color: p.onSurface, paddingRight: 8 }}>{item.label}</span>}
    </span>
  );
}

function TextContent({ item, p }: { item: Item; p: Palette }) {
  const fs = item.size ?? 28;
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: fs,
        lineHeight: 1.3,
        fontWeight: item.bold ? 700 : 400,
        color: p.onSurface,
        whiteSpace: "nowrap",
        padding: "0 2px",
      }}
    >
      {item.label || " "}
    </span>
  );
}

/** The Android status bar drawn in a top app bar's inset: clock left, status icons right. */
function StatusBar({ p }: { p: Palette }) {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        height: STATUS_BAR_H,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        fontSize: 13,
        fontWeight: 500,
        color: p.onSurface,
        pointerEvents: "none",
      }}
    >
      <span style={{ fontVariantNumeric: "tabular-nums" }}>9:30</span>
      <span style={{ display: "inline-flex", gap: 2 }}>
        <Icon name="signal_wifi_4_bar" size={14} fill />
        <Icon name="signal_cellular_4_bar" size={14} fill />
        <Icon name="battery_full" size={14} fill />
      </span>
    </div>
  );
}

/** The gesture navigation handle drawn in a navigation bar's inset. */
function GestureHandle({ p }: { p: Palette }) {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        left: "50%",
        bottom: Math.round((NAV_BAR_H - 4) / 2),
        width: 108,
        height: 4,
        marginLeft: -54,
        borderRadius: 2,
        background: p.onSurface,
        opacity: 0.35,
        pointerEvents: "none",
      }}
    />
  );
}

/** Content for kinds that size to their text; rendered again offscreen to measure. */
export function MeasuredContent({ item, p }: { item: Item; p: Palette }) {
  switch (item.kind) {
    case "button":
      return <ButtonContent item={item} />;
    case "extendedFab":
      return <ExtendedFabContent item={item} />;
    case "chip":
      return <ChipContent item={item} p={p} />;
    case "switch":
      return <SwitchContent item={item} p={p} />;
    case "checkbox":
      return <CheckboxContent item={item} p={p} />;
    case "text":
      return <TextContent item={item} p={p} />;
    default:
      return null;
  }
}

function Body({ item, p }: { item: Item; p: Palette }) {
  const lang = useLang();
  const hasLabel = item.label.trim().length > 0;
  const hasSupporting = !!item.supporting?.trim();

  if (MEASURED.includes(item.kind)) return <MeasuredContent item={item} p={p} />;

  switch (item.kind) {
    case "box":
      return item.checked ? (
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 16 }}>
          <div
            style={{
              width: 32,
              height: 4,
              borderRadius: 2,
              background: onToken(item.fill ?? "surfaceContainerLow", p),
              opacity: 0.4,
            }}
          />
        </div>
      ) : null;

    case "iconButton": {
      const s = item.size ?? 48;
      return (
        <div style={{ display: "grid", placeItems: "center", height: "100%" }}>
          {item.icon && <Icon name={item.icon} size={Math.round(s / 2)} fill={item.variant === "filled"} />}
        </div>
      );
    }

    case "fab": {
      const s = item.size ?? 56;
      return (
        <div style={{ display: "grid", placeItems: "center", height: "100%" }}>
          {item.icon && <Icon name={item.icon} size={Math.round(s * 0.42)} />}
        </div>
      );
    }

    case "topAppBar":
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            padding: `${STATUS_BAR_H}px 4px 0`,
            height: "100%",
            boxSizing: "border-box",
            position: "relative",
          }}
        >
          <StatusBar p={p} />
          <div style={{ width: 48, height: 48, display: "grid", placeItems: "center", flex: "0 0 auto" }}>
            {item.icon && <Icon name={item.icon} size={24} color={p.onSurface} />}
          </div>
          <div style={{ flex: 1, minWidth: 0, fontSize: 22, color: p.onSurface, ...ellipsis }}>
            {item.label}
          </div>
          <div style={{ width: 48, height: 48, display: "grid", placeItems: "center", flex: "0 0 auto" }}>
            {item.icon2 && <Icon name={item.icon2} size={24} color={p.onSurfaceVariant} />}
          </div>
        </div>
      );

    case "searchBar":
      return (
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 16px", height: "100%" }}>
          {item.icon && <Icon name={item.icon} size={24} color={p.onSurface} />}
          <div style={{ flex: 1, minWidth: 0, fontSize: 16, color: p.onSurfaceVariant, ...ellipsis }}>
            {item.label}
          </div>
          {item.icon2 && <Icon name={item.icon2} size={24} color={p.onSurfaceVariant} />}
        </div>
      );

    case "card": {
      const w = item.size ?? 320;
      return (
        <div
          style={{
            padding: 12,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 8,
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              height: Math.round(w * 0.28),
              borderRadius: 14,
              background: p.primaryContainer,
              color: p.onPrimaryContainer,
              display: "grid",
              placeItems: "center",
              flex: "0 0 auto",
            }}
          >
            {item.icon && <Icon name={item.icon} size={34} />}
          </div>
          {hasLabel && (
            <div style={{ fontSize: 16, fontWeight: 600, color: p.onSurface, ...ellipsis }}>{item.label}</div>
          )}
          {hasSupporting && (
            <div style={{ fontSize: 13, lineHeight: 1.5, color: p.onSurfaceVariant, overflow: "hidden" }}>
              {item.supporting}
            </div>
          )}
        </div>
      );
    }

    case "listItem":
      return (
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "0 16px", height: "100%" }}>
          {item.icon && (
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                background: p.primaryContainer,
                color: p.onPrimaryContainer,
                display: "grid",
                placeItems: "center",
                flex: "0 0 auto",
              }}
            >
              <Icon name={item.icon} size={22} />
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            {hasLabel && <div style={{ fontSize: 16, color: p.onSurface, ...ellipsis }}>{item.label}</div>}
            {hasSupporting && (
              <div style={{ fontSize: 13, color: p.onSurfaceVariant, ...ellipsis }}>{item.supporting}</div>
            )}
          </div>
          {item.icon2 && <Icon name={item.icon2} size={22} color={p.onSurfaceVariant} />}
        </div>
      );

    case "dialog":
      return (
        <div
          style={{
            padding: 24,
            height: "100%",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {item.icon && (
            <div style={{ textAlign: "center", color: p.primary }}>
              <Icon name={item.icon} size={24} />
            </div>
          )}
          {hasLabel && (
            <div
              style={{
                fontSize: 24,
                color: p.onSurface,
                textAlign: item.icon ? "center" : "left",
                ...ellipsis,
              }}
            >
              {item.label}
            </div>
          )}
          {hasSupporting && (
            <div style={{ fontSize: 14, lineHeight: 1.5, color: p.onSurfaceVariant, flex: 1, overflow: "hidden" }}>
              {item.supporting}
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            {[t("cancel", lang), t("ok", lang)].map((t) => (
              <span
                key={t}
                style={{
                  padding: "0 12px",
                  height: 40,
                  display: "inline-flex",
                  alignItems: "center",
                  color: p.primary,
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      );

    case "snackbar":
      return (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 8px 0 16px", height: "100%" }}>
          <div style={{ flex: 1, minWidth: 0, fontSize: 14, color: p.inverseOnSurface, ...ellipsis }}>
            {item.label}
          </div>
          {hasSupporting && (
            <span
              style={{
                padding: "0 12px",
                height: 36,
                display: "inline-flex",
                alignItems: "center",
                color: p.inversePrimary,
                fontSize: 14,
                fontWeight: 500,
                whiteSpace: "nowrap",
              }}
            >
              {item.supporting}
            </span>
          )}
        </div>
      );

    case "textField": {
      const filled = item.variant === "filled";
      return (
        <div style={{ position: "relative", height: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 16px", height: "100%" }}>
            {item.icon && <Icon name={item.icon} size={24} color={p.onSurfaceVariant} />}
            <span style={{ flex: 1, minWidth: 0, fontSize: 16, color: p.onSurfaceVariant, ...ellipsis }}>
              {filled ? "" : ""}
            </span>
          </div>
          {hasLabel && (
            <span
              style={{
                position: "absolute",
                left: item.icon ? 52 : 16,
                top: filled ? 8 : -8,
                fontSize: 12,
                lineHeight: "16px",
                color: p.primary,
                background: filled ? "transparent" : p.surface,
                padding: filled ? 0 : "0 4px",
                marginLeft: filled ? 0 : -4,
              }}
            >
              {item.label}
            </span>
          )}
          {filled && (
            <span
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                height: 2,
                background: p.primary,
              }}
            />
          )}
          {hasSupporting && (
            <span
              style={{
                position: "absolute",
                left: 16,
                top: "100%",
                marginTop: 4,
                fontSize: 12,
                color: p.onSurfaceVariant,
                whiteSpace: "nowrap",
              }}
            >
              {item.supporting}
            </span>
          )}
        </div>
      );
    }

    case "slider": {
      const v = Math.min(100, Math.max(0, item.value ?? 40)) / 100;
      const w = item.size ?? 280;
      const handleX = 2 + (w - 4) * v;
      return (
        <div style={{ position: "relative", height: "100%" }}>
          <div
            style={{
              position: "absolute",
              left: 0,
              width: Math.max(0, handleX - 8),
              top: 14,
              height: 16,
              borderRadius: "8px 2px 2px 8px",
              background: p.primary,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: handleX + 8,
              right: 0,
              top: 14,
              height: 16,
              borderRadius: "2px 8px 8px 2px",
              background: p.secondaryContainer,
            }}
          />
          <div
            style={{
              position: "absolute",
              right: 6,
              top: 20,
              width: 4,
              height: 4,
              borderRadius: 2,
              background: p.onSecondaryContainer,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: handleX - 2,
              top: 0,
              width: 4,
              height: 44,
              borderRadius: 2,
              background: p.primary,
            }}
          />
        </div>
      );
    }

    case "image":
      if (item.src) {
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.src}
            alt=""
            draggable={false}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        );
      }
      return (
        <div style={{ display: "grid", placeItems: "center", height: "100%", color: p.outline }}>
          {item.icon && <Icon name={item.icon} size={Math.min(48, Math.round((item.size ?? 200) * 0.3))} />}
        </div>
      );

    case "divider":
      return (
        <div style={{ display: "flex", alignItems: "center", height: "100%" }}>
          <div style={{ width: "100%", height: 1, background: p.outlineVariant }} />
        </div>
      );

    case "bottomNav": {
      const tabs = item.tabs ?? [];
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-around",
            height: "100%",
            padding: `0 4px ${NAV_BAR_H}px`,
            boxSizing: "border-box",
            position: "relative",
          }}
        >
          <GestureHandle p={p} />
          {tabs.map((t, i) => {
            const on = i === 0;
            const withLabel = t.label.trim().length > 0;
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 32,
                    borderRadius: 16,
                    display: "grid",
                    placeItems: "center",
                    background: on ? p.secondaryContainer : "transparent",
                    color: on ? p.onSecondaryContainer : p.onSurfaceVariant,
                  }}
                >
                  {t.icon && <Icon name={t.icon} size={22} fill={on} />}
                </div>
                {withLabel && (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: on ? 600 : 400,
                      color: on ? p.onSurface : p.onSurfaceVariant,
                      maxWidth: "100%",
                      ...ellipsis,
                    }}
                  >
                    {t.label}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      );
    }

    case "circularProgress":
      return (
        <CircularProgress
          size={item.size ?? 48}
          color={p.primary}
          trackColor={p.secondaryContainer}
          wavy={item.wavy}
          value={item.value === undefined ? undefined : item.value / 100}
        />
      );

    case "linearProgress":
      return (
        <div style={{ display: "flex", alignItems: "center", height: "100%" }}>
          <LinearProgress
            width={item.size ?? 320}
            color={p.primary}
            trackColor={p.secondaryContainer}
            wavy={item.wavy}
            value={item.value === undefined ? undefined : item.value / 100}
          />
        </div>
      );

    case "loadingIndicator": {
      const s = item.size ?? 48;
      return (
        <LoadingIndicator
          size={s}
          color={item.contained ? p.onPrimaryContainer : p.primary}
          contained={item.contained}
          containerColor={p.primaryContainer}
        />
      );
    }
  }
  return null;
}

function boxStyle(item: Item, p: Palette): React.CSSProperties {
  if (NO_BOX.includes(item.kind)) return { background: "transparent", border: "none" };
  switch (item.kind) {
    case "box": {
      const t = item.fill ?? "surfaceContainerLow";
      return { background: p[t], color: onToken(t, p), border: "none" };
    }
    case "button":
    case "iconButton":
    case "fab":
    case "extendedFab":
      return variantStyle(item.variant, p);
    case "chip":
      if (item.checked) return { background: p.secondaryContainer, color: p.onSecondaryContainer, border: "none" };
      return item.variant === "outlined"
        ? { background: "transparent", color: p.onSurfaceVariant, border: `1px solid ${p.outlineVariant}` }
        : { background: p.surfaceContainerLow, color: p.onSurfaceVariant, border: "none" };
    case "card":
      if (item.variant === "outlined") return { background: p.surface, border: `1px solid ${p.outlineVariant}` };
      if (item.variant === "elevated") return { background: p.surfaceContainerLow, border: "none" };
      return { background: p.surfaceContainerHighest, border: "none" };
    case "textField":
      return item.variant === "filled"
        ? { background: p.surfaceContainerHighest, border: "none", color: p.onSurface }
        : { background: p.surface, border: `1px solid ${p.outline}`, color: p.onSurface };
    case "topAppBar":
    case "bottomNav":
      return { background: p.surfaceContainer, border: "none", color: p.onSurface };
    case "searchBar":
      return { background: p.surfaceContainerHigh, border: "none", color: p.onSurface };
    case "dialog":
      return { background: p.surfaceContainerHigh, border: "none", color: p.onSurface };
    case "snackbar":
      return { background: p.inverseSurface, border: "none", color: p.inverseOnSurface };
    case "image":
      return { background: p.surfaceContainerHighest, border: "none" };
    case "listItem":
      return { background: p.surfaceContainerLow, border: "none", color: p.onSurface };
    default:
      return { background: p.surfaceContainerHigh, border: "none", color: p.onSurface };
  }
}

function shadowOf(item: Item): string {
  if (NO_BOX.includes(item.kind)) return "none";
  switch (item.kind) {
    case "button":
    case "iconButton":
    case "extendedFab":
      return variantShadow(item.variant);
    case "fab":
      return "0 3px 8px rgba(0,0,0,0.18), 0 1px 3px rgba(0,0,0,0.12)";
    case "card":
      return item.variant === "elevated" ? "0 1px 3px rgba(0,0,0,0.20), 0 2px 6px rgba(0,0,0,0.10)" : "none";
    case "dialog":
      return "0 8px 24px rgba(0,0,0,0.18), 0 2px 6px rgba(0,0,0,0.10)";
    case "snackbar":
      return "0 3px 8px rgba(0,0,0,0.18)";
    default:
      return "none";
  }
}

export type { Radii };

/** Corner radii are driven continuously by the magnet; a stiff spring keeps them on the pointer. */
const RADIUS_TWEEN = { type: "spring" as const, stiffness: 900, damping: 48, mass: 0.4 };

export function M3Node({
  item,
  palette,
  radii,
  widths,
  pressed,
  dragging,
  selected,
  interactive = true,
  onPointerDown,
}: {
  item: Item;
  palette: Palette;
  radii?: Radii;
  widths: Record<string, number>;
  pressed?: boolean;
  dragging?: boolean;
  selected?: boolean;
  interactive?: boolean;
  onPointerDown?: (e: React.PointerEvent) => void;
}) {
  const r = radii ?? baseRadii(item);
  const size = sizeOf(item, widths);
  const measured = MEASURED.includes(item.kind);
  const clips = !NO_BOX.includes(item.kind) && item.kind !== "textField";

  return (
    <motion.div
      data-node={item.id}
      data-kind={item.kind}
      onPointerDown={onPointerDown}
      initial={false}
      animate={{
        borderTopLeftRadius: r.tl,
        borderBottomLeftRadius: r.bl,
        borderTopRightRadius: r.tr,
        borderBottomRightRadius: r.br,
        scale: pressed ? 0.97 : 1,
      }}
      transition={{
        borderTopLeftRadius: RADIUS_TWEEN,
        borderBottomLeftRadius: RADIUS_TWEEN,
        borderTopRightRadius: RADIUS_TWEEN,
        borderBottomRightRadius: RADIUS_TWEEN,
        scale: { type: "spring", stiffness: 700, damping: 30, mass: 0.5 },
      }}
      style={{
        ...boxStyle(item, palette),
        width: measured ? undefined : size.w,
        height: size.h,
        display: measured ? "inline-flex" : "block",
        alignItems: "center",
        overflow: clips ? "hidden" : "visible",
        cursor: !interactive ? "default" : dragging ? "grabbing" : "grab",
        userSelect: "none",
        touchAction: "none",
        boxSizing: "border-box",
        boxShadow: shadowOf(item),
        outline: selected ? `2px solid ${palette.primary}` : "2px solid transparent",
        outlineOffset: 3,
        transition: "outline-color 120ms",
        flex: "0 0 auto",
      }}
    >
      <Body item={item} p={palette} />
    </motion.div>
  );
}

/** Plain (non-animated) rendering of a part; used where frames must be deterministic. */
export function M3Static({
  item,
  palette,
  radii,
  style,
}: {
  item: Item;
  palette: Palette;
  radii?: Radii;
  style?: React.CSSProperties;
}) {
  const r = radii ?? baseRadii(item);
  const size = sizeOf(item, {});
  const measured = MEASURED.includes(item.kind);
  const clips = !NO_BOX.includes(item.kind) && item.kind !== "textField";
  return (
    <div
      style={{
        ...boxStyle(item, palette),
        width: measured ? undefined : size.w,
        height: size.h,
        display: measured ? "inline-flex" : "block",
        alignItems: "center",
        overflow: clips ? "hidden" : "visible",
        boxSizing: "border-box",
        boxShadow: shadowOf(item),
        borderTopLeftRadius: r.tl,
        borderTopRightRadius: r.tr,
        borderBottomLeftRadius: r.bl,
        borderBottomRightRadius: r.br,
        flex: "0 0 auto",
        ...style,
      }}
    >
      <Body item={item} p={palette} />
    </div>
  );
}
