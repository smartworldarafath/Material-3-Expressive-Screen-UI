import type { CSSProperties } from "react";
import { KIND_TEXT, NAV_TABS, getLang } from "./i18n";

/* ---------- geometry ---------- */
export const H = 56; // M3 medium button height (dp)
export const GAP = 3; // connected group spacing
export const R_FULL = 28; // outer corner of a connected run
export const R_INNER = 8; // inner corner when connected (M3 small)

/** magnetic field size, along the run and across it */
export const SNAP_MAIN = 44;
export const SNAP_CROSS = 24;
/** how sharply the pull ramps up (higher = gentler at the edge) */
export const PULL_EXP = 2.2;
/** ms allowed for the landing animation before the item is committed */
export const SETTLE_MS = 340;

/** phone screen used by the "phone" canvas mode (Pixel-like, dp) */
/* Pixel-class phone, 412 dp wide; kept at 892 dp tall so the whole screen fits the canvas */
export const PHONE_W = 412;
export const PHONE_H = 892;
export const PHONE_R = 40;
/** system insets: the status bar above a top app bar and the gesture area below a navigation bar.
 *  Both bars carry their inset as extra height so their background reaches the rounded screen edge. */
export const STATUS_BAR_H = 24;
export const NAV_BAR_H = 24;
/** M3 layout margin: parts that are not edge-to-edge sit this far from the screen edge */
export const PHONE_MARGIN = 16;
/** width of a part that spans the screen with a margin on both sides */
export const CONTENT_W = PHONE_W - PHONE_MARGIN * 2;
/** width of one of two parts sharing a row, with a margin-sized gutter between them */
export const HALF_W = (CONTENT_W - PHONE_MARGIN) / 2;
/** width presets offered in the inspector: two columns, with margins, edge-to-edge */
export const WIDTH_PRESETS = [HALF_W, CONTENT_W, PHONE_W];
/** height presets for free-form boxes: half the screen, the whole screen */
export const HEIGHT_PRESETS = [PHONE_H / 2, PHONE_H];
/** bezel around the screen and the label above it */
export const BEZEL = 10;
export const FRAME_LABEL_H = 44;
/** horizontal distance between newly added frames */
export const FRAME_GAP = 120;

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
export const uid = () => Math.random().toString(36).slice(2, 10);

export type Radii = { tl: number; tr: number; bl: number; br: number };
export const uniformRadii = (r: number): Radii => ({ tl: r, tr: r, bl: r, br: r });

/* ---------- color ---------- */
export type Palette = {
  key: string;
  label: string;
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  inversePrimary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;
  surface: string;
  surfaceContainerLow: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
  surfaceContainerHighest: string;
  onSurface: string;
  onSurfaceVariant: string;
  outline: string;
  outlineVariant: string;
  inverseSurface: string;
  inverseOnSurface: string;
  error: string;
  onError: string;
  errorContainer: string;
  onErrorContainer: string;
};

const ERROR = {
  error: "#B3261E",
  onError: "#FFFFFF",
  errorContainer: "#F9DEDC",
  onErrorContainer: "#410E0B",
};

export const PALETTES: Palette[] = [
  {
    key: "purple",
    label: "Purple",
    primary: "#6750A4",
    onPrimary: "#FFFFFF",
    primaryContainer: "#EADDFF",
    onPrimaryContainer: "#21005D",
    inversePrimary: "#D0BCFF",
    secondaryContainer: "#E8DEF8",
    onSecondaryContainer: "#1D192B",
    tertiaryContainer: "#FFD8E4",
    onTertiaryContainer: "#31111D",
    surface: "#FEF7FF",
    surfaceContainerLow: "#F7F2FA",
    surfaceContainer: "#F3EDF7",
    surfaceContainerHigh: "#ECE6F0",
    surfaceContainerHighest: "#E6E0E9",
    onSurface: "#1D1B20",
    onSurfaceVariant: "#49454F",
    outline: "#79747E",
    outlineVariant: "#CAC4D0",
    inverseSurface: "#322F35",
    inverseOnSurface: "#F5EFF7",
    ...ERROR,
  },
  {
    key: "blue",
    label: "Blue",
    primary: "#0B57D0",
    onPrimary: "#FFFFFF",
    primaryContainer: "#D3E3FD",
    onPrimaryContainer: "#041E49",
    inversePrimary: "#A8C7FA",
    secondaryContainer: "#DCE2F9",
    onSecondaryContainer: "#131C2B",
    tertiaryContainer: "#FFD8EE",
    onTertiaryContainer: "#2E1125",
    surface: "#FAF9FD",
    surfaceContainerLow: "#F3F3FA",
    surfaceContainer: "#EEEDF3",
    surfaceContainerHigh: "#E9E8EF",
    surfaceContainerHighest: "#E3E2E6",
    onSurface: "#1B1B1F",
    onSurfaceVariant: "#44474E",
    outline: "#74777F",
    outlineVariant: "#C4C6D0",
    inverseSurface: "#303034",
    inverseOnSurface: "#F2F0F4",
    ...ERROR,
  },
  {
    key: "green",
    label: "Green",
    primary: "#2E6A45",
    onPrimary: "#FFFFFF",
    primaryContainer: "#B0F1C2",
    onPrimaryContainer: "#00210F",
    inversePrimary: "#95D5A7",
    secondaryContainer: "#D3E8D8",
    onSecondaryContainer: "#102016",
    tertiaryContainer: "#C2E8FF",
    onTertiaryContainer: "#001E2C",
    surface: "#F6FBF4",
    surfaceContainerLow: "#F0F5EE",
    surfaceContainer: "#EAF0E8",
    surfaceContainerHigh: "#E4EAE2",
    surfaceContainerHighest: "#DEE4DC",
    onSurface: "#181D18",
    onSurfaceVariant: "#414941",
    outline: "#707972",
    outlineVariant: "#BFC9C0",
    inverseSurface: "#2D322D",
    inverseOnSurface: "#EEF2EB",
    ...ERROR,
  },
  {
    key: "coral",
    label: "Coral",
    primary: "#984061",
    onPrimary: "#FFFFFF",
    primaryContainer: "#FFD9E2",
    onPrimaryContainer: "#3E001D",
    inversePrimary: "#FFB0C8",
    secondaryContainer: "#F6DDE4",
    onSecondaryContainer: "#31101D",
    tertiaryContainer: "#FFDBCA",
    onTertiaryContainer: "#2C1600",
    surface: "#FFF8F8",
    surfaceContainerLow: "#FCF0F2",
    surfaceContainer: "#F6EBED",
    surfaceContainerHigh: "#F3E5E9",
    surfaceContainerHighest: "#EEE0E3",
    onSurface: "#201A1B",
    onSurfaceVariant: "#524346",
    outline: "#847377",
    outlineVariant: "#D5C2C6",
    inverseSurface: "#352F30",
    inverseOnSurface: "#FAEEEF",
    ...ERROR,
  },
  {
    key: "amber",
    label: "Amber",
    primary: "#8B5000",
    onPrimary: "#FFFFFF",
    primaryContainer: "#FFDCC2",
    onPrimaryContainer: "#2C1600",
    inversePrimary: "#FFB77C",
    secondaryContainer: "#F6DFC8",
    onSecondaryContainer: "#271905",
    tertiaryContainer: "#D5EDC0",
    onTertiaryContainer: "#0E2004",
    surface: "#FFF8F5",
    surfaceContainerLow: "#FCF1EA",
    surfaceContainer: "#F7ECE4",
    surfaceContainerHigh: "#F3E6DE",
    surfaceContainerHighest: "#EDE0D8",
    onSurface: "#211A14",
    onSurfaceVariant: "#51443B",
    outline: "#83746A",
    outlineVariant: "#D6C3B6",
    inverseSurface: "#362F28",
    inverseOnSurface: "#FBEEE5",
    ...ERROR,
  },
  {
    key: "teal",
    label: "Teal",
    primary: "#00696E",
    onPrimary: "#FFFFFF",
    primaryContainer: "#9CF1F6",
    onPrimaryContainer: "#002022",
    inversePrimary: "#80D5DA",
    secondaryContainer: "#CCE8E9",
    onSecondaryContainer: "#051F20",
    tertiaryContainer: "#D2E4FF",
    onTertiaryContainer: "#001C3B",
    surface: "#F4FBFB",
    surfaceContainerLow: "#EEF5F5",
    surfaceContainer: "#E8EFEF",
    surfaceContainerHigh: "#E2EAEA",
    surfaceContainerHighest: "#DDE4E4",
    onSurface: "#161D1D",
    onSurfaceVariant: "#3F4948",
    outline: "#6F7979",
    outlineVariant: "#BEC8C8",
    inverseSurface: "#2B3232",
    inverseOnSurface: "#ECF2F2",
    ...ERROR,
  },
  {
    key: "mono",
    label: "Mono",
    primary: "#4A4459",
    onPrimary: "#FFFFFF",
    primaryContainer: "#E6E0F0",
    onPrimaryContainer: "#1A1626",
    inversePrimary: "#CFC3E0",
    secondaryContainer: "#E6E1E6",
    onSecondaryContainer: "#1B1B1F",
    tertiaryContainer: "#E9E0EA",
    onTertiaryContainer: "#1E1A22",
    surface: "#FCF8FD",
    surfaceContainerLow: "#F5F1F6",
    surfaceContainer: "#EFEBF0",
    surfaceContainerHigh: "#E9E5EA",
    surfaceContainerHighest: "#E4E0E5",
    onSurface: "#1C1B1F",
    onSurfaceVariant: "#48454E",
    outline: "#79747E",
    outlineVariant: "#CAC4D0",
    inverseSurface: "#313033",
    inverseOnSurface: "#F4EFF4",
    ...ERROR,
  },
];

export const paletteOf = (key: string): Palette =>
  PALETTES.find((p) => p.key === key) ?? PALETTES[0];

/* ---------- contrast roles a component can take ---------- */
export type Variant = "filled" | "tonal" | "elevated" | "outlined" | "text";

export const VARIANTS: { key: Variant; label: string }[] = [
  { key: "filled", label: "Filled" },
  { key: "tonal", label: "Tonal" },
  { key: "elevated", label: "Elevated" },
  { key: "outlined", label: "Outlined" },
  { key: "text", label: "Text" },
];

export function variantStyle(v: Variant, p: Palette): CSSProperties {
  switch (v) {
    case "filled":
      return { background: p.primary, color: p.onPrimary, border: "none" };
    case "tonal":
      return { background: p.secondaryContainer, color: p.onSecondaryContainer, border: "none" };
    case "elevated":
      return { background: p.surfaceContainerLow, color: p.primary, border: "none" };
    case "outlined":
      return { background: "transparent", color: p.primary, border: `1px solid ${p.outline}` };
    case "text":
      return { background: "transparent", color: p.primary, border: "none" };
  }
}

export function variantShadow(v: Variant): string {
  if (v === "elevated") return "0 1px 3px rgba(0,0,0,0.20), 0 4px 8px rgba(0,0,0,0.10)";
  return "none";
}

/* ---------- component kinds ---------- */
export type Kind =
  | "box"
  | "button"
  | "iconButton"
  | "fab"
  | "extendedFab"
  | "chip"
  | "topAppBar"
  | "bottomNav"
  | "searchBar"
  | "card"
  | "listItem"
  | "dialog"
  | "snackbar"
  | "textField"
  | "switch"
  | "checkbox"
  | "slider"
  | "text"
  | "image"
  | "divider"
  | "loadingIndicator"
  | "linearProgress"
  | "circularProgress";

export type Axis = "x" | "y";
/** kinds that fuse into a run: buttons side by side, list items stacked */
export type ConnectSpec = { axis: Axis; outer: number; inner: number; family: string };

/** `presets` are quick picks shown as chips; values outside min..max are hidden */
export type SizeSpec = { min: number; max: number; step: number; icon: string; presets?: number[] };

export type Category = "actions" | "navigation" | "containment" | "inputs" | "content" | "progress";

export const CATEGORIES: { key: Category; label: string; icon: string }[] = [
  { key: "actions", label: "Actions", icon: "touch_app" },
  { key: "navigation", label: "Navigation", icon: "explore" },
  { key: "containment", label: "Containment", icon: "web_asset" },
  { key: "inputs", label: "Inputs", icon: "toggle_on" },
  { key: "content", label: "Content", icon: "notes" },
  { key: "progress", label: "Progress", icon: "progress_activity" },
];

export type KindSpec = {
  label: string;
  /** short Japanese noun used by the prompt generator */
  noun: string;
  category: Category;
  paletteIcon: string;
  /** intrinsic size; buttons measure their content, sized kinds use `size` */
  w: number;
  h: number;
  radius: number;
  hasVariant: boolean;
  hasLabel: boolean;
  hasSupporting: boolean;
  hasIcon: boolean;
  hasChecked?: boolean;
  /** second dimension (height) for free-form boxes */
  size2?: SizeSpec;
  hasFill?: boolean;
  hasValue?: boolean;
  hasWavy?: boolean;
  hasContained?: boolean;
  connect?: ConnectSpec;
  size?: SizeSpec;
  defLabel: string;
  defIcon: string | null;
  defSupporting?: string;
  defIcon2?: string;
  defSize?: number;
  defVariant?: Variant;
};

export const KIND_SPEC: Record<Kind, KindSpec> = {
  box: {
    label: "Box",
    noun: "ボックス",
    category: "containment",
    paletteIcon: "check_box_outline_blank",
    w: PHONE_W,
    h: 220,
    radius: 28,
    hasVariant: false,
    hasLabel: false,
    hasSupporting: false,
    hasIcon: false,
    hasChecked: true,
    hasFill: true,
    size: { min: 40, max: PHONE_W, step: 4, icon: "width", presets: WIDTH_PRESETS },
    size2: { min: 24, max: PHONE_H, step: 4, icon: "height", presets: HEIGHT_PRESETS },
    defLabel: "",
    defIcon: null,
    defSize: PHONE_W,
  },
  button: {
    label: "Button",
    noun: "ボタン",
    category: "actions",
    paletteIcon: "buttons_alt",
    w: 0,
    h: H,
    radius: R_FULL,
    hasVariant: true,
    hasLabel: true,
    hasSupporting: false,
    hasIcon: true,
    connect: { axis: "x", outer: R_FULL, inner: R_INNER, family: "button" },
    defLabel: "ボタン",
    defIcon: "add",
  },
  iconButton: {
    label: "Icon Button",
    noun: "アイコンボタン",
    category: "actions",
    paletteIcon: "radio_button_checked",
    w: 48,
    h: 48,
    radius: 24,
    hasVariant: true,
    hasLabel: false,
    hasSupporting: false,
    hasIcon: true,
    connect: { axis: "x", outer: 24, inner: R_INNER, family: "button" },
    size: { min: 40, max: 96, step: 4, icon: "open_in_full", presets: [40, 48, 56, 96] },
    defLabel: "",
    defIcon: "favorite",
    defSize: 48,
    defVariant: "tonal",
  },
  fab: {
    label: "FAB",
    noun: "FAB（フローティングボタン）",
    category: "actions",
    paletteIcon: "add_circle",
    w: 56,
    h: 56,
    radius: 16,
    hasVariant: true,
    hasLabel: false,
    hasSupporting: false,
    hasIcon: true,
    size: { min: 40, max: 128, step: 4, icon: "open_in_full", presets: [40, 56, 96] },
    defLabel: "",
    defIcon: "edit",
    defSize: 56,
    defVariant: "tonal",
  },
  extendedFab: {
    label: "Extended FAB",
    noun: "拡張 FAB",
    category: "actions",
    paletteIcon: "add_box",
    w: 0,
    h: 56,
    radius: 16,
    hasVariant: true,
    hasLabel: true,
    hasSupporting: false,
    hasIcon: true,
    defLabel: "作成",
    defIcon: "edit",
    defVariant: "tonal",
  },
  chip: {
    label: "Chip",
    noun: "チップ",
    category: "actions",
    paletteIcon: "label",
    w: 0,
    h: 32,
    radius: 8,
    hasVariant: true,
    hasLabel: true,
    hasSupporting: false,
    hasIcon: true,
    hasChecked: true,
    connect: { axis: "x", outer: 16, inner: 4, family: "chip" },
    defLabel: "チップ",
    defIcon: null,
    defVariant: "outlined",
  },
  topAppBar: {
    label: "Top App Bar",
    noun: "トップアプリバー",
    category: "navigation",
    paletteIcon: "toolbar",
    w: 412,
    h: 64 + STATUS_BAR_H,
    radius: 0,
    hasVariant: false,
    hasLabel: true,
    hasSupporting: false,
    hasIcon: true,
    defLabel: "タイトル",
    defIcon: "menu",
    defIcon2: "more_vert",
  },
  bottomNav: {
    label: "Navigation Bar",
    noun: "ナビゲーションバー",
    category: "navigation",
    paletteIcon: "bottom_navigation",
    w: 412,
    h: 80 + NAV_BAR_H,
    radius: 0,
    hasVariant: false,
    hasLabel: false,
    hasSupporting: false,
    hasIcon: false,
    defLabel: "",
    defIcon: null,
  },
  searchBar: {
    label: "Search Bar",
    noun: "検索バー",
    category: "navigation",
    paletteIcon: "search",
    w: CONTENT_W,
    h: 56,
    radius: 28,
    hasVariant: false,
    hasLabel: true,
    hasSupporting: false,
    hasIcon: true,
    size: { min: 200, max: PHONE_W, step: 4, icon: "width", presets: WIDTH_PRESETS },
    defLabel: "検索",
    defIcon: "search",
    defIcon2: "mic",
    defSize: CONTENT_W,
  },
  card: {
    label: "Card",
    noun: "カード",
    category: "containment",
    paletteIcon: "web_asset",
    w: CONTENT_W,
    h: 188,
    radius: 20,
    hasVariant: true,
    hasLabel: true,
    hasSupporting: true,
    hasIcon: true,
    size: { min: 160, max: PHONE_W, step: 4, icon: "width", presets: WIDTH_PRESETS },
    defLabel: "カードの見出し",
    defIcon: "image",
    defSupporting: "補足テキストがここに入ります。",
    defSize: CONTENT_W,
    defVariant: "tonal",
  },
  listItem: {
    label: "List Item",
    noun: "リスト項目",
    category: "containment",
    paletteIcon: "list",
    w: CONTENT_W,
    h: 72,
    radius: R_FULL,
    hasVariant: false,
    hasLabel: true,
    hasSupporting: true,
    hasIcon: true,
    connect: { axis: "y", outer: R_FULL, inner: R_INNER, family: "list" },
    size: { min: 200, max: PHONE_W, step: 4, icon: "width", presets: WIDTH_PRESETS },
    defLabel: "リスト項目",
    defIcon: "person",
    defSupporting: "サブテキスト",
    defIcon2: "chevron_right",
    defSize: CONTENT_W,
  },
  dialog: {
    label: "Dialog",
    noun: "ダイアログ",
    category: "containment",
    paletteIcon: "chat_bubble",
    w: 312,
    h: 220,
    radius: 28,
    hasVariant: false,
    hasLabel: true,
    hasSupporting: true,
    hasIcon: true,
    defLabel: "確認",
    defIcon: "info",
    defSupporting: "この操作を実行しますか？",
  },
  snackbar: {
    label: "Snackbar",
    noun: "スナックバー",
    category: "containment",
    paletteIcon: "call_to_action",
    w: 344,
    h: 48,
    radius: 8,
    hasVariant: false,
    hasLabel: true,
    hasSupporting: true,
    hasIcon: false,
    defLabel: "保存しました",
    defIcon: null,
    defSupporting: "元に戻す",
  },
  textField: {
    label: "Text Field",
    noun: "テキスト入力",
    category: "inputs",
    paletteIcon: "text_fields",
    w: CONTENT_W,
    h: 56,
    radius: 16,
    hasVariant: true,
    hasLabel: true,
    hasSupporting: true,
    hasIcon: true,
    size: { min: 160, max: PHONE_W, step: 4, icon: "width", presets: WIDTH_PRESETS },
    defLabel: "ラベル",
    defIcon: "search",
    defSupporting: "",
    defSize: CONTENT_W,
    defVariant: "outlined",
  },
  switch: {
    label: "Switch",
    noun: "スイッチ",
    category: "inputs",
    paletteIcon: "toggle_on",
    w: 0,
    h: 32,
    radius: 16,
    hasVariant: false,
    hasLabel: true,
    hasSupporting: false,
    hasIcon: false,
    hasChecked: true,
    defLabel: "通知",
    defIcon: null,
  },
  checkbox: {
    label: "Checkbox",
    noun: "チェックボックス",
    category: "inputs",
    paletteIcon: "check_box",
    w: 0,
    h: 40,
    radius: 4,
    hasVariant: false,
    hasLabel: true,
    hasSupporting: false,
    hasIcon: false,
    hasChecked: true,
    defLabel: "同意する",
    defIcon: null,
  },
  slider: {
    label: "Slider",
    noun: "スライダー",
    category: "inputs",
    paletteIcon: "sliders",
    w: CONTENT_W,
    h: 44,
    radius: 22,
    hasVariant: false,
    hasLabel: false,
    hasSupporting: false,
    hasIcon: false,
    hasValue: true,
    size: { min: 120, max: PHONE_W, step: 4, icon: "width", presets: WIDTH_PRESETS },
    defLabel: "",
    defIcon: null,
    defSize: CONTENT_W,
  },
  text: {
    label: "Text",
    noun: "テキスト",
    category: "content",
    paletteIcon: "title",
    w: 0,
    h: 40,
    radius: 0,
    hasVariant: false,
    hasLabel: true,
    hasSupporting: false,
    hasIcon: false,
    size: { min: 12, max: 57, step: 1, icon: "format_size", presets: [14, 16, 22, 28, 32, 45, 57] },
    defLabel: "見出し",
    defIcon: null,
    defSize: 28,
  },
  image: {
    label: "Image",
    noun: "画像",
    category: "content",
    paletteIcon: "image",
    w: 200,
    h: 200,
    radius: 20,
    hasVariant: false,
    hasLabel: false,
    hasSupporting: false,
    hasIcon: true,
    size: { min: 48, max: PHONE_W, step: 4, icon: "open_in_full", presets: [96, HALF_W, CONTENT_W, PHONE_W] },
    defLabel: "",
    defIcon: "image",
    defSize: 200,
  },
  divider: {
    label: "Divider",
    noun: "区切り線",
    category: "content",
    paletteIcon: "horizontal_rule",
    w: CONTENT_W,
    h: 16,
    radius: 0,
    hasVariant: false,
    hasLabel: false,
    hasSupporting: false,
    hasIcon: false,
    size: { min: 40, max: PHONE_W, step: 4, icon: "width", presets: WIDTH_PRESETS },
    defLabel: "",
    defIcon: null,
    defSize: CONTENT_W,
  },
  loadingIndicator: {
    label: "Loading Indicator",
    noun: "ローディングインジケータ",
    category: "progress",
    paletteIcon: "motion_blur",
    w: 48,
    h: 48,
    radius: 24,
    hasVariant: false,
    hasLabel: false,
    hasSupporting: false,
    hasIcon: false,
    hasContained: true,
    size: { min: 32, max: 128, step: 4, icon: "open_in_full", presets: [32, 48, 64, 96] },
    defLabel: "",
    defIcon: null,
    defSize: 48,
  },
  linearProgress: {
    label: "Linear Progress",
    noun: "リニアプログレス",
    category: "progress",
    paletteIcon: "linear_scale",
    w: CONTENT_W,
    h: 24,
    radius: 12,
    hasVariant: false,
    hasLabel: false,
    hasSupporting: false,
    hasIcon: false,
    hasValue: true,
    hasWavy: true,
    size: { min: 120, max: PHONE_W, step: 4, icon: "width", presets: WIDTH_PRESETS },
    defLabel: "",
    defIcon: null,
    defSize: CONTENT_W,
  },
  circularProgress: {
    label: "Circular Progress",
    noun: "サーキュラープログレス",
    category: "progress",
    paletteIcon: "progress_activity",
    w: 48,
    h: 48,
    radius: 24,
    hasVariant: false,
    hasLabel: false,
    hasSupporting: false,
    hasIcon: false,
    hasValue: true,
    hasWavy: true,
    size: { min: 24, max: 120, step: 4, icon: "open_in_full", presets: [24, 40, 48, 64] },
    defLabel: "",
    defIcon: null,
    defSize: 48,
  },
};

export const KIND_ORDER: Kind[] = [
  "button",
  "iconButton",
  "fab",
  "extendedFab",
  "chip",
  "topAppBar",
  "bottomNav",
  "searchBar",
  "card",
  "listItem",
  "box",
  "dialog",
  "snackbar",
  "textField",
  "switch",
  "checkbox",
  "slider",
  "text",
  "image",
  "divider",
  "loadingIndicator",
  "linearProgress",
  "circularProgress",
];

/* ---------- screen data ---------- */
export type NavTab = { icon: string; label: string };

export type Item = {
  id: string;
  kind: Kind;
  label: string;
  icon: string | null;
  icon2?: string | null;
  variant: Variant;
  supporting?: string;
  size?: number;
  radiusTop?: number;
  radiusBottom?: number;
  tabs?: NavTab[];
  /** on/off state for switches, checkboxes and chips */
  checked?: boolean;
  /** 0..100 for sliders and determinate progress; undefined = indeterminate */
  value?: number;
  wavy?: boolean;
  contained?: boolean;
  /** free text the author writes about what this part does */
  note?: string;
  bold?: boolean;
  /** height for free-form boxes */
  size2?: number;
  /** palette token used as background (boxes) */
  fill?: ColorToken;
  /** data URL of a user-picked image */
  src?: string;
  /** tap navigation to another frame */
  action?: Action;
};

export type Transition = "slide" | "fade" | "expand" | "none";
export type Action = { to: string; transition: Transition };

export const TRANSITIONS: { key: Transition; label: string; icon: string }[] = [
  { key: "slide", label: "Slide", icon: "arrow_forward" },
  { key: "fade", label: "Fade", icon: "blur_on" },
  { key: "expand", label: "Expand", icon: "open_in_full" },
  { key: "none", label: "None", icon: "block" },
];

/** kinds a user can tap in the preview */
export const TAPPABLE: Kind[] = ["button", "iconButton", "fab", "extendedFab", "chip", "listItem", "card", "image", "text"];

/** palette roles a user may pick as a background */
export type ColorToken =
  | "surface"
  | "surfaceContainerLow"
  | "surfaceContainer"
  | "surfaceContainerHigh"
  | "surfaceContainerHighest"
  | "primaryContainer"
  | "secondaryContainer"
  | "tertiaryContainer"
  | "primary"
  | "inverseSurface";

export const COLOR_TOKENS: { key: ColorToken; label: string }[] = [
  { key: "surface", label: "Surface" },
  { key: "surfaceContainerLow", label: "Container low" },
  { key: "surfaceContainer", label: "Container" },
  { key: "surfaceContainerHigh", label: "Container high" },
  { key: "surfaceContainerHighest", label: "Container highest" },
  { key: "primaryContainer", label: "Primary container" },
  { key: "secondaryContainer", label: "Secondary container" },
  { key: "tertiaryContainer", label: "Tertiary container" },
  { key: "primary", label: "Primary" },
  { key: "inverseSurface", label: "Inverse surface" },
];

/** readable foreground for a chosen background token */
export function onToken(t: ColorToken, p: Palette): string {
  switch (t) {
    case "primary":
      return p.onPrimary;
    case "primaryContainer":
      return p.onPrimaryContainer;
    case "secondaryContainer":
      return p.onSecondaryContainer;
    case "tertiaryContainer":
      return p.onTertiaryContainer;
    case "inverseSurface":
      return p.inverseOnSurface;
    default:
      return p.onSurface;
  }
}

export type Frame = { id: string; name: string; x: number; y: number; bg?: ColorToken };

export const frameRect = (f: Frame) => ({ l: f.x, t: f.y, r: f.x + PHONE_W, b: f.y + PHONE_H });

/** world-space bounds of a whole run */
export function groupBounds(g: Group, widths: Record<string, number>) {
  let l = g.x;
  let t = g.y;
  let r = g.x;
  let b = g.y;
  let off = 0;
  for (const it of g.items) {
    const sz = sizeOf(it, widths);
    const x = g.axis === "x" ? g.x + off : g.x;
    const y = g.axis === "x" ? g.y : g.y + off;
    r = Math.max(r, x + sz.w);
    b = Math.max(b, y + sz.h);
    off += (g.axis === "x" ? sz.w : sz.h) + GAP;
  }
  return { l, t, r, b };
}

/** a run belongs to the frame that contains its centre */
export function frameOfGroup(g: Group, frames: Frame[], widths: Record<string, number>): Frame | undefined {
  const bb = groupBounds(g, widths);
  const cx = (bb.l + bb.r) / 2;
  const cy = (bb.t + bb.b) / 2;
  return frames.find((f) => {
    const fr = frameRect(f);
    return cx >= fr.l && cx <= fr.r && cy >= fr.t && cy <= fr.b;
  });
}

export const groupsInFrame = (groups: Group[], f: Frame, frames: Frame[], widths: Record<string, number>) =>
  groups.filter((g) => frameOfGroup(g, frames, widths)?.id === f.id);

export type Group = {
  id: string;
  x: number;
  y: number;
  axis: Axis;
  items: Item[];
};

export type FrameMode = "blank" | "phone";

export type Doc = {
  groups: Group[];
  frames: Frame[];
  paletteKey: string;
  frame: FrameMode;
  title: string;
  brief: string;
};

export const defaultTabs = (): NavTab[] => NAV_TABS[getLang()].map((t) => ({ ...t }));

export function makeItem(kind: Kind): Item {
  const s = KIND_SPEC[kind];
  const text = KIND_TEXT[getLang()][kind];
  const it: Item = {
    id: uid(),
    kind,
    label: text?.label ?? s.defLabel,
    icon: s.defIcon,
    variant: s.defVariant ?? "filled",
  };
  if (s.defSupporting !== undefined) it.supporting = text?.supporting ?? s.defSupporting;
  if (s.defIcon2 !== undefined) it.icon2 = s.defIcon2;
  if (s.defSize !== undefined) it.size = s.defSize;
  if (s.hasChecked) it.checked = kind !== "chip" && kind !== "box";
  if (kind === "box") {
    it.size2 = 220;
    it.radiusTop = 28;
    it.radiusBottom = 0;
    it.fill = "surfaceContainerHigh";
  }
  if (kind === "slider") it.value = 40;
  if (kind === "bottomNav") {
    it.tabs = defaultTabs();
    it.radiusTop = 0;
    it.radiusBottom = 0;
  }
  return it;
}

/** Content-sized kinds are measured in the DOM; the rest derive from spec + size. */
export const MEASURED: Kind[] = ["button", "extendedFab", "chip", "switch", "checkbox", "text"];

export function sizeOf(it: Item, widths: Record<string, number>) {
  const s = KIND_SPEC[it.kind];
  const n = it.size ?? s.defSize ?? s.w;
  switch (it.kind) {
    case "button":
    case "extendedFab":
    case "chip":
    case "switch":
    case "checkbox":
      return { w: widths[it.id] ?? 128, h: s.h };
    case "text":
      return { w: widths[it.id] ?? 120, h: Math.round(n * 1.3) };
    case "iconButton":
    case "fab":
    case "circularProgress":
    case "loadingIndicator":
    case "image":
      return { w: n, h: n };
    case "searchBar":
    case "listItem":
    case "textField":
    case "slider":
    case "linearProgress":
    case "divider":
      return { w: n, h: s.h };
    case "card":
      return { w: n, h: Math.round(n * 0.5875) };
    case "box":
      return { w: n, h: it.size2 ?? s.h };
    default:
      return { w: s.w, h: s.h };
  }
}

/** Corners for a part that is not part of a connected run. */
export function baseRadii(it: Item): Radii {
  const s = KIND_SPEC[it.kind];
  switch (it.kind) {
    case "box":
    case "bottomNav":
    case "topAppBar": {
      const t = it.radiusTop ?? 0;
      const b = it.radiusBottom ?? 0;
      return { tl: t, tr: t, bl: b, br: b };
    }
    case "fab":
      return uniformRadii(Math.round((it.size ?? 56) * 0.28));
    case "iconButton":
    case "circularProgress":
    case "loadingIndicator":
      return uniformRadii((it.size ?? 48) / 2);
    case "image":
      return uniformRadii(it.radiusTop ?? s.radius);
    case "card":
      return uniformRadii(it.radiusTop ?? s.radius);
    default:
      return uniformRadii(s.radius);
  }
}

export const connectSpecOf = (it: Item): ConnectSpec | undefined => KIND_SPEC[it.kind].connect;
export const connectable = (it: Item) => !!KIND_SPEC[it.kind].connect;
/** two parts fuse when they share an axis and a family (buttons and icon buttons mix) */
export const canJoin = (a: Item, b: Item) => {
  const sa = connectSpecOf(a);
  const sb = connectSpecOf(b);
  return !!sa && !!sb && sa.axis === sb.axis && sa.family === sb.family;
};

/* ---------- icon slots ---------- */
export type IconSlot = { key: string; label: string; value: string | null };

export function iconSlotsOf(it: Item): IconSlot[] {
  switch (it.kind) {
    case "listItem":
    case "topAppBar":
    case "searchBar":
      return [
        { key: "icon", label: getLang() === "ja" ? "先頭" : "Leading", value: it.icon },
        { key: "icon2", label: getLang() === "ja" ? "末尾" : "Trailing", value: it.icon2 ?? null },
      ];
    case "bottomNav":
      return (it.tabs ?? []).map((t, i) => ({
        key: `tab:${i}`,
        label: `${i + 1}`,
        value: t.icon || null,
      }));
    default:
      return KIND_SPEC[it.kind].hasIcon
        ? [{ key: "icon", label: getLang() === "ja" ? "アイコン" : "Icon", value: it.icon }]
        : [];
  }
}

export function setIconSlot(it: Item, key: string, v: string | null): Partial<Item> {
  if (key === "icon") return { icon: v };
  if (key === "icon2") return { icon2: v };
  if (key.startsWith("tab:")) {
    const i = Number(key.slice(4));
    const tabs = (it.tabs ?? []).map((t, j) => (j === i ? { ...t, icon: v ?? "" } : t));
    return { tabs };
  }
  return {};
}
