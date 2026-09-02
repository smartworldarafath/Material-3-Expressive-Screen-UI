import { KIND_TEXT, Lang, TRANSITION_TEXT, getLang } from "./i18n";
import {
  Doc,
  Frame,
  Group,
  Item,
  PALETTES,
  PHONE_H,
  PHONE_W,
  Variant,
  frameOfGroup,
  groupBounds,
} from "./tokens";

const VARIANT_JA: Record<Variant, string> = {
  filled: "塗りつぶし",
  tonal: "トーナル",
  elevated: "エレベーテッド",
  outlined: "アウトライン",
  text: "テキスト",
};
const VARIANT_EN: Record<Variant, string> = {
  filled: "filled",
  tonal: "tonal",
  elevated: "elevated",
  outlined: "outlined",
  text: "text",
};

const hasText = (s?: string | null) => !!s && s.trim().length > 0;
const qj = (s: string) => `「${s.trim()}」`;
const qe = (s: string) => `"${s.trim()}"`;
const trimEnd = (s: string) => s.trim().replace(/[。.\s]+$/, "");

/* ================= Japanese ================= */

function itemJa(it: Item): string {
  const q = qj;
  const v = VARIANT_JA[it.variant];
  const noun = KIND_TEXT.ja[it.kind]?.noun ?? it.kind;
  switch (it.kind) {
    case "button":
      return `${hasText(it.label) ? q(it.label) : "ラベルなし"}の${v}ボタン${it.icon ? `（${it.icon} アイコン付き）` : ""}`;
    case "iconButton":
      return `${it.icon ?? "空"} アイコンの${v}アイコンボタン`;
    case "fab":
      return `${it.icon ?? "空"} アイコンの${v} FAB${it.size && it.size >= 96 ? "（大サイズ）" : it.size && it.size <= 40 ? "（小サイズ）" : ""}`;
    case "extendedFab":
      return `${q(it.label)}${it.icon ? `と ${it.icon} アイコン` : ""}の拡張 FAB（${v}）`;
    case "chip":
      return `${q(it.label)}のチップ${it.checked ? "（選択状態）" : ""}${it.icon && !it.checked ? `（${it.icon} アイコン付き）` : ""}`;
    case "topAppBar":
      return `タイトル${q(it.label)}のトップアプリバー${it.icon ? `。左に ${it.icon}` : ""}${it.icon2 ? `、右に ${it.icon2}` : ""}${it.icon || it.icon2 ? " のアイコンボタン" : ""}`;
    case "bottomNav": {
      const tabs = (it.tabs ?? []).map((t) => `${q(t.label || "ラベルなし")}(${t.icon || "アイコンなし"})`);
      return `${tabs.length}項目のナビゲーションバー（${tabs.join("、")}。最初の項目が選択状態）`;
    }
    case "searchBar":
      return `プレースホルダー${q(it.label)}の検索バー${it.icon2 ? `（右端に ${it.icon2} アイコン）` : ""}`;
    case "card": {
      const style = it.variant === "elevated" ? "エレベーテッド" : it.variant === "outlined" ? "アウトライン" : "塗りつぶし";
      return `${style}カード。上部に${it.icon ? `${it.icon} アイコンの` : ""}プレースホルダー画像、見出し${q(it.label)}${hasText(it.supporting) ? `、本文${q(it.supporting!)}` : ""}`;
    }
    case "listItem":
      return `${q(it.label)}${hasText(it.supporting) ? `（サブテキスト${q(it.supporting!)}）` : ""}${it.icon ? `、先頭に ${it.icon} アイコン` : ""}${it.icon2 ? `、末尾に ${it.icon2}` : ""}`;
    case "dialog":
      return `見出し${q(it.label)}${hasText(it.supporting) ? `、本文${q(it.supporting!)}` : ""}${it.icon ? `、${it.icon} アイコン付き` : ""}のダイアログ（キャンセル／OK のテキストボタン）`;
    case "snackbar":
      return `${q(it.label)}のスナックバー${hasText(it.supporting) ? `（${q(it.supporting!)}のアクション付き）` : ""}`;
    case "textField":
      return `ラベル${q(it.label)}の${it.variant === "filled" ? "塗りつぶし" : "アウトライン"}テキスト入力${it.icon ? `（先頭に ${it.icon} アイコン）` : ""}${hasText(it.supporting) ? `。補助テキストは${q(it.supporting!)}` : ""}`;
    case "switch":
      return `${q(it.label)}のスイッチ（初期状態は${it.checked ? "オン" : "オフ"}）`;
    case "checkbox":
      return `${q(it.label)}のチェックボックス（初期状態は${it.checked ? "チェック済み" : "未チェック"}）`;
    case "slider":
      return `スライダー（初期値 ${it.value ?? 40}%）`;
    case "text":
      return `${it.bold ? "太字の" : ""}テキスト${q(it.label)}（${it.size ?? 28}sp）`;
    case "image":
      return `${it.size ?? 200}dp 角の画像${it.src ? "（指定の画像を表示）" : "プレースホルダー"}`;
    case "divider":
      return "区切り線";
    case "box":
      return `${it.size ?? 360}×${it.size2 ?? 220}dp のボックス（背景 ${it.fill ?? "surfaceContainerLow"}、角丸は上 ${it.radiusTop ?? 28}dp・下 ${it.radiusBottom ?? 0}dp${it.checked ? "、上部にドラッグハンドル" : ""}）`;
    case "loadingIndicator":
      return `M3 Expressive の形が変化するローディングインジケータ${it.contained ? "（コンテナ付き）" : ""}`;
    case "linearProgress":
      return `${it.wavy ? "波形の" : ""}リニアプログレス（${it.value === undefined ? "不確定" : `${it.value}%`}）`;
    case "circularProgress":
      return `${it.wavy ? "波形の" : ""}サーキュラープログレス（${it.value === undefined ? "不確定" : `${it.value}%`}）`;
    default:
      return noun;
  }
}

function groupJa(g: Group): string {
  const q = qj;
  if (g.items.length === 1) return itemJa(g.items[0]);
  const kind = g.items[0].kind;
  if (kind === "listItem") return `${g.items.length}項目のリスト。上から ${g.items.map(itemJa).join("、")}`;
  if (kind === "chip") return `${g.items.map((it) => q(it.label) + (it.checked ? "(選択中)" : "")).join("")}のチップが横に並ぶチップグループ`;
  if (kind === "iconButton") return `${g.items.map((it) => it.icon ?? "空").join("・")} のアイコンボタンが連結したボタングループ`;
  const same = g.items.every((it) => it.variant === g.items[0].variant);
  const names = same
    ? g.items.map((it) => q(it.label || "ラベルなし")).join("")
    : g.items.map((it) => `${q(it.label || "ラベルなし")}(${VARIANT_JA[it.variant]})`).join("");
  return `${names}の${g.items.length}つのボタンが横に連結したボタングループ${same ? `（${VARIANT_JA[g.items[0].variant]}）` : ""}`;
}

function notesJa(g: Group, frames: Frame[]): string[] {
  const out: string[] = [];
  for (const it of g.items) {
    const noun = KIND_TEXT.ja[it.kind]?.noun ?? it.kind;
    const name = hasText(it.label) ? qj(it.label) + noun : noun;
    const parts: string[] = [];
    if (it.action) {
      const target = frames.find((f) => f.id === it.action!.to);
      if (target) {
        const tr = TRANSITION_TEXT.ja[it.action.transition];
        parts.push(`タップすると${qj(target.name || "画面")}画面へ${it.action.transition !== "none" ? `${tr}で` : ""}遷移する`);
      }
    }
    if (hasText(it.note)) parts.push(trimEnd(it.note!));
    if (parts.length) out.push(`${name}は、${parts.join("。また、")}。`);
  }
  return out;
}

/* ================= English ================= */

function itemEn(it: Item): string {
  const q = qe;
  const v = VARIANT_EN[it.variant];
  const noun = KIND_TEXT.en[it.kind]?.noun ?? it.kind;
  switch (it.kind) {
    case "button":
      return `a ${v} button ${hasText(it.label) ? q(it.label) : "with no label"}${it.icon ? ` with a ${it.icon} icon` : ""}`;
    case "iconButton":
      return `a ${v} icon button with the ${it.icon ?? "empty"} icon`;
    case "fab":
      return `a ${it.size && it.size >= 96 ? "large " : it.size && it.size <= 40 ? "small " : ""}${v} FAB with the ${it.icon ?? "empty"} icon`;
    case "extendedFab":
      return `a ${v} extended FAB ${q(it.label)}${it.icon ? ` with a ${it.icon} icon` : ""}`;
    case "chip":
      return `a chip ${q(it.label)}${it.checked ? " (selected)" : ""}${it.icon && !it.checked ? ` with a ${it.icon} icon` : ""}`;
    case "topAppBar":
      return `a top app bar titled ${q(it.label)}${it.icon ? ` with a ${it.icon} icon button on the left` : ""}${it.icon2 ? `${it.icon ? " and" : " with"} ${it.icon2} on the right` : ""}`;
    case "bottomNav": {
      const tabs = (it.tabs ?? []).map((t) => `${q(t.label || "unlabeled")} (${t.icon || "no icon"})`);
      return `a navigation bar with ${tabs.length} destinations: ${tabs.join(", ")}; the first one is selected`;
    }
    case "searchBar":
      return `a search bar with the placeholder ${q(it.label)}${it.icon2 ? ` and a ${it.icon2} icon at the end` : ""}`;
    case "card": {
      const style = it.variant === "elevated" ? "an elevated" : it.variant === "outlined" ? "an outlined" : "a filled";
      return `${style} card with a placeholder image${it.icon ? ` (${it.icon} icon)` : ""} on top, the headline ${q(it.label)}${hasText(it.supporting) ? ` and the body ${q(it.supporting!)}` : ""}`;
    }
    case "listItem":
      return `${q(it.label)}${hasText(it.supporting) ? ` with supporting text ${q(it.supporting!)}` : ""}${it.icon ? `, a leading ${it.icon} icon` : ""}${it.icon2 ? `, a trailing ${it.icon2} icon` : ""}`;
    case "dialog":
      return `a dialog headed ${q(it.label)}${hasText(it.supporting) ? ` with the body ${q(it.supporting!)}` : ""}${it.icon ? ` and a ${it.icon} icon` : ""}, with Cancel and OK text buttons`;
    case "snackbar":
      return `a snackbar ${q(it.label)}${hasText(it.supporting) ? ` with a ${q(it.supporting!)} action` : ""}`;
    case "textField":
      return `${it.variant === "filled" ? "a filled" : "an outlined"} text field labeled ${q(it.label)}${it.icon ? ` with a leading ${it.icon} icon` : ""}${hasText(it.supporting) ? `; supporting text ${q(it.supporting!)}` : ""}`;
    case "switch":
      return `a switch ${q(it.label)} (initially ${it.checked ? "on" : "off"})`;
    case "checkbox":
      return `a checkbox ${q(it.label)} (initially ${it.checked ? "checked" : "unchecked"})`;
    case "slider":
      return `a slider (initial value ${it.value ?? 40}%)`;
    case "text":
      return `${it.bold ? "bold " : ""}text ${q(it.label)} at ${it.size ?? 28}sp`;
    case "image":
      return `a ${it.size ?? 200}dp square image${it.src ? " (use the provided image)" : " placeholder"}`;
    case "divider":
      return "a divider";
    case "box":
      return `a ${it.size ?? 360}×${it.size2 ?? 220}dp box (background ${it.fill ?? "surfaceContainerLow"}, corner radius ${it.radiusTop ?? 28}dp top / ${it.radiusBottom ?? 0}dp bottom${it.checked ? ", with a drag handle at the top" : ""})`;
    case "loadingIndicator":
      return `the M3 Expressive shape-morphing loading indicator${it.contained ? " (contained)" : ""}`;
    case "linearProgress":
      return `a ${it.wavy ? "wavy " : ""}linear progress indicator (${it.value === undefined ? "indeterminate" : `${it.value}%`})`;
    case "circularProgress":
      return `a ${it.wavy ? "wavy " : ""}circular progress indicator (${it.value === undefined ? "indeterminate" : `${it.value}%`})`;
    default:
      return noun;
  }
}

function groupEn(g: Group): string {
  const q = qe;
  if (g.items.length === 1) return itemEn(g.items[0]);
  const kind = g.items[0].kind;
  if (kind === "listItem") return `a list of ${g.items.length} items, top to bottom: ${g.items.map(itemEn).join("; ")}`;
  if (kind === "chip") return `a chip group: ${g.items.map((it) => q(it.label) + (it.checked ? " (selected)" : "")).join(", ")}`;
  if (kind === "iconButton") return `a connected group of icon buttons: ${g.items.map((it) => it.icon ?? "empty").join(", ")}`;
  const same = g.items.every((it) => it.variant === g.items[0].variant);
  const names = same
    ? g.items.map((it) => q(it.label || "unlabeled")).join(", ")
    : g.items.map((it) => `${q(it.label || "unlabeled")} (${VARIANT_EN[it.variant]})`).join(", ");
  return `a connected button group of ${g.items.length}${same ? ` ${VARIANT_EN[g.items[0].variant]}` : ""} buttons: ${names}`;
}

function notesEn(g: Group, frames: Frame[]): string[] {
  const out: string[] = [];
  for (const it of g.items) {
    const noun = KIND_TEXT.en[it.kind]?.noun ?? it.kind;
    const name = hasText(it.label) ? `The ${qe(it.label)} ${noun}` : `The ${noun}`;
    const parts: string[] = [];
    if (it.action) {
      const target = frames.find((f) => f.id === it.action!.to);
      if (target) {
        const tr = TRANSITION_TEXT.en[it.action.transition];
        parts.push(`opens the ${qe(target.name || "screen")} screen when tapped${it.action.transition !== "none" ? `, with ${tr}` : ""}`);
      }
    }
    if (hasText(it.note)) parts.push(trimEnd(it.note!));
    if (parts.length) out.push(`${name} ${parts.join(". It also ")}.`);
  }
  return out;
}

/* ================= shared ================= */

function zone(g: Group, origin: { x: number; y: number }, widths: Record<string, number>, lang: Lang): string {
  const bb = groupBounds(g, widths);
  const cy = (bb.t + bb.b) / 2 - origin.y;
  const cx = (bb.l + bb.r) / 2 - origin.x;
  const w = bb.r - bb.l;
  const vert = cy < PHONE_H * 0.22 ? 0 : cy > PHONE_H * 0.8 ? 2 : 1;
  const horiz = w >= PHONE_W * 0.85 ? -1 : cx < PHONE_W * 0.36 ? 0 : cx > PHONE_W * 0.64 ? 2 : 1;
  if (lang === "ja") {
    const v = ["上部", "中央付近", "下部"][vert];
    const h = horiz < 0 ? "" : ["左寄せで", "中央に", "右寄せで"][horiz];
    return `${v}に${h}`;
  }
  const v = ["Near the top", "In the middle", "Near the bottom"][vert];
  const h = horiz < 0 ? "" : [", aligned left", ", centered", ", aligned right"][horiz];
  return `${v}${h}`;
}

function describeScreen(
  lines: string[],
  groups: Group[],
  origin: { x: number; y: number } | null,
  widths: Record<string, number>,
  lang: Lang,
) {
  groups.forEach((g, i) => {
    if (lang === "ja") {
      const where = origin ? zone(g, origin, widths, "ja") : i === 0 ? "まず" : "その下に";
      lines.push(`- ${where}${groupJa(g)}を置きます。`);
    } else {
      const where = origin ? zone(g, origin, widths, "en") : i === 0 ? "First" : "Below that";
      lines.push(`- ${where}: ${groupEn(g)}.`);
    }
  });
}

export function buildPrompt(doc: Doc, widths: Record<string, number>, onlyFrameId?: string, lang: Lang = getLang()): string {
  const pal = PALETTES.find((p) => p.key === doc.paletteKey) ?? PALETTES[0];
  const phone = doc.frame === "phone";
  const allFrames = phone ? doc.frames : [];
  const only = onlyFrameId ? allFrames.find((f) => f.id === onlyFrameId) : undefined;
  const frames = only ? [only] : allFrames;
  const groups = [...doc.groups]
    .filter((g) => !only || frameOfGroup(g, allFrames, widths)?.id === only.id)
    .sort((a, b) => a.y - b.y || a.x - b.x);
  const lines: string[] = [];
  const ja = lang === "ja";
  const q = ja ? qj : qe;
  const screenWord = ja ? "画面" : "screen";

  const byFrame = new Map<string, Group[]>();
  const loose: Group[] = [];
  for (const g of groups) {
    const f = frameOfGroup(g, allFrames, widths);
    if (f && frames.some((x) => x.id === f.id)) byFrame.set(f.id, [...(byFrame.get(f.id) ?? []), g]);
    else if (!f) loose.push(g);
  }

  if (ja) {
    const title = only ? `${q(only.name || screenWord)}画面` : doc.title.trim() || (frames.length > 1 ? "このアプリ" : "この画面");
    lines.push(`${title}を Material 3 Expressive のデザインで実装してください。` + (doc.brief.trim() ? trimEnd(doc.brief) + "。" : ""));
    lines.push(
      phone
        ? `想定はスマホの縦画面（${PHONE_W}×${PHONE_H}dp）で、カラーテーマは ${pal.label} 系（プライマリ ${pal.primary}）です。`
        : `レイアウトは自由配置で、カラーテーマは ${pal.label} 系（プライマリ ${pal.primary}）です。`,
    );
    if (groups.length === 0) {
      lines.push("画面にはまだ部品が置かれていません。");
    } else if (frames.length > 0) {
      if (frames.length > 1) lines.push(`画面は ${frames.length} つあり、${frames.map((f) => q(f.name || screenWord)).join("、")}です。`);
      for (const f of frames) {
        const gs = byFrame.get(f.id) ?? [];
        lines.push("");
        lines.push(`${q(f.name || screenWord)}画面${f.bg && f.bg !== "surface" ? `（背景は ${f.bg}）` : ""}${gs.length ? "は上から順に次の通りです。" : "はまだ空です。"}`);
        describeScreen(lines, gs, { x: f.x, y: f.y }, widths, "ja");
      }
      if (loose.length && !only) {
        lines.push("");
        lines.push("画面の外に置かれている部品（共通パーツや参考）:");
        describeScreen(lines, loose, null, widths, "ja");
      }
    } else {
      lines.push("");
      lines.push("画面を上から順に説明します。");
      describeScreen(lines, groups, null, widths, "ja");
    }
    const notes = groups.flatMap((g) => notesJa(g, allFrames));
    if (notes.length) {
      lines.push("");
      lines.push("それぞれの振る舞いと画面遷移は次の通りです。");
      for (const n of notes) lines.push(`- ${n}`);
    }
    lines.push("");
    lines.push(
      "コンポーネントは Material 3 Expressive の標準（Jetpack Compose の material3、または Material Web）を使い、角丸・余白・タイポグラフィはガイドラインのデフォルトに従ってください。ローディング表示には形が変化する Loading Indicator を使い、進捗表示には波形のプログレスインジケータを使ってください。",
    );
    return lines.join("\n");
  }

  const title = only ? `the ${q(only.name || screenWord)} screen` : doc.title.trim() || (frames.length > 1 ? "this app" : "this screen");
  lines.push(`Please implement ${title} in the Material 3 Expressive design language.` + (doc.brief.trim() ? ` ${trimEnd(doc.brief)}.` : ""));
  lines.push(
    phone
      ? `Target a portrait phone screen (${PHONE_W}×${PHONE_H}dp). The color theme is ${pal.label} (primary ${pal.primary}).`
      : `The layout is free-form. The color theme is ${pal.label} (primary ${pal.primary}).`,
  );
  if (groups.length === 0) {
    lines.push("Nothing has been placed on the screen yet.");
  } else if (frames.length > 0) {
    if (frames.length > 1) lines.push(`There are ${frames.length} screens: ${frames.map((f) => q(f.name || screenWord)).join(", ")}.`);
    for (const f of frames) {
      const gs = byFrame.get(f.id) ?? [];
      lines.push("");
      lines.push(`The ${q(f.name || screenWord)} screen${f.bg && f.bg !== "surface" ? ` (background ${f.bg})` : ""}${gs.length ? ", from top to bottom:" : " is still empty."}`);
      describeScreen(lines, gs, { x: f.x, y: f.y }, widths, "en");
    }
    if (loose.length && !only) {
      lines.push("");
      lines.push("Parts placed outside the screens (shared parts or references):");
      describeScreen(lines, loose, null, widths, "en");
    }
  } else {
    lines.push("");
    lines.push("The screen, from top to bottom:");
    describeScreen(lines, groups, null, widths, "en");
  }
  const notes = groups.flatMap((g) => notesEn(g, allFrames));
  if (notes.length) {
    lines.push("");
    lines.push("Behavior and navigation:");
    for (const n of notes) lines.push(`- ${n}`);
  }
  lines.push("");
  lines.push(
    "Use standard Material 3 Expressive components (Jetpack Compose material3 or Material Web) and keep corner radii, spacing and typography at the guideline defaults. Use the shape-morphing Loading Indicator for loading states and the wavy progress indicators for progress.",
  );
  return lines.join("\n");
}
