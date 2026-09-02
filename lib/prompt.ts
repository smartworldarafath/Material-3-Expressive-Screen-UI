import { KIND_TEXT, Lang, TRANSITION_TEXT, getLang } from "./i18n";
import {
  Doc,
  Frame,
  Group,
  Item,
  Kind,
  PALETTES,
  Palette,
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
    if (horiz === 1) return `${v}の中央に`;
    const h = horiz < 0 ? "" : ["左寄せで", "", "右寄せで"][horiz];
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

/* ---------- color palette ---------- */

/** The palette as a Material color scheme, grouped the way a theme file is written. */
function paletteLines(p: Palette): string[] {
  const row = (pairs: [string, string][]) => `- ${pairs.map(([k, v]) => `${k} ${v}`).join(" / ")}`;
  return [
    row([
      ["primary", p.primary],
      ["onPrimary", p.onPrimary],
      ["primaryContainer", p.primaryContainer],
      ["onPrimaryContainer", p.onPrimaryContainer],
    ]),
    row([
      ["secondaryContainer", p.secondaryContainer],
      ["onSecondaryContainer", p.onSecondaryContainer],
      ["tertiaryContainer", p.tertiaryContainer],
      ["onTertiaryContainer", p.onTertiaryContainer],
    ]),
    row([
      ["surface", p.surface],
      ["surfaceContainerLow", p.surfaceContainerLow],
      ["surfaceContainer", p.surfaceContainer],
      ["surfaceContainerHigh", p.surfaceContainerHigh],
      ["surfaceContainerHighest", p.surfaceContainerHighest],
    ]),
    row([
      ["onSurface", p.onSurface],
      ["onSurfaceVariant", p.onSurfaceVariant],
      ["outline", p.outline],
      ["outlineVariant", p.outlineVariant],
    ]),
    row([
      ["inverseSurface", p.inverseSurface],
      ["inverseOnSurface", p.inverseOnSurface],
      ["inversePrimary", p.inversePrimary],
    ]),
    row([
      ["error", p.error],
      ["onError", p.onError],
      ["errorContainer", p.errorContainer],
      ["onErrorContainer", p.onErrorContainer],
    ]),
  ];
}

/* ---------- per-component style notes ---------- */

/** How each kind should look and behave; only the kinds on the canvas are written out. */
const STYLE_NOTES: Record<Lang, Partial<Record<Kind, string>>> = {
  ja: {
    button:
      "ボタン: 高さ 56dp のミディアムサイズで、角は完全な丸（ピル型）。塗りつぶしは primary、トーナルは secondaryContainer、アウトラインは outline の 1dp 枠。横に連結したボタングループは 3dp の隙間で並べ、隣り合う内側の角だけ 8dp に小さくし、外側の角は丸のままにする（M3 Expressive の Connected button group）。",
    iconButton:
      "アイコンボタン: 48dp の円形。塗りつぶし・トーナル・アウトライン・スタンダードを指定通りに使い分ける。連結したアイコンボタン群は Connected button group として実装する。",
    fab: "FAB: 通常は 56dp・角丸 16dp、大サイズは 96dp・角丸 28dp、小サイズは 40dp・角丸 12dp。トーナルは primaryContainer、塗りつぶしは primary。画面端から 16dp 離して浮かせ、影は Level 3。",
    extendedFab: "拡張 FAB: 高さ 56dp、角丸 16dp、左にアイコン・右にラベル。",
    chip: "チップ: 高さ 32dp、角丸 8dp。選択状態は secondaryContainer で塗り、先頭にチェックアイコンを出す。横並びのチップグループは 8dp 間隔で、はみ出す場合は横スクロール。",
    topAppBar:
      "トップアプリバー: 高さ 64dp、背景は surface。タイトルは titleLarge、左右のアイコンボタンは 48dp。スクロール時に surfaceContainer へ色が変わる標準の挙動でよい。",
    bottomNav:
      "ナビゲーションバー: 高さ 80dp、背景は surfaceContainer。選択中の項目は secondaryContainer のピル型インジケータ（幅 64dp・高さ 32dp）で示し、アイコンは塗りつぶし、ラベルは labelMedium。",
    searchBar: "検索バー: 高さ 56dp、角は完全な丸、背景は surfaceContainerHigh。先頭に検索アイコン、末尾に指定のアイコン。",
    card: "カード: 角丸 20dp、上部に画像領域。塗りつぶしは surfaceContainerHighest、エレベーテッドは surfaceContainerLow に Level 1 の影、アウトラインは outlineVariant の 1dp 枠。見出しは titleMedium、本文は bodyMedium、内側の余白は 16dp。",
    listItem:
      "リスト項目: 高さ 72dp、先頭アイコンは 24dp、主テキストは bodyLarge、サブテキストは bodyMedium の onSurfaceVariant。上下に連結したリストは 3dp の隙間で並べ、外側の角を 28dp、隣り合う内側の角を 8dp にする（M3 Expressive のリスト表現）。",
    dialog: "ダイアログ: 幅 312dp、角丸 28dp、背景は surfaceContainerHigh。見出しは headlineSmall、本文は bodyMedium、下部右寄せにテキストボタン。",
    snackbar: "スナックバー: 高さ 48dp、角丸 8dp、背景は inverseSurface、文字は inverseOnSurface。アクションは inversePrimary のテキストボタン。画面下部から 16dp 上に表示し、数秒で消える。",
    textField:
      "テキスト入力: 高さ 56dp。アウトラインは角丸 16dp・枠 outline、塗りつぶしは surfaceContainerHighest に下線。フォーカス時はラベルが上に浮き、枠が primary の 2dp になる。補助テキストは bodySmall で下に出す。",
    switch: "スイッチ: M3 標準サイズ（トラック 52×32dp）。オンは primary、オフは surfaceContainerHighest に outline の枠。ラベルは左、スイッチは右端。",
    checkbox: "チェックボックス: 18dp の四角、角丸 2dp、チェック時は primary。ラベルは右に bodyLarge。",
    slider: "スライダー: M3 Expressive の太いトラック（高さ 16dp）と縦長のハンドル（幅 4dp・高さ 44dp）。ハンドルの左は primary、右は secondaryContainer。",
    text: "テキスト: 指定の sp サイズ。見出しは onSurface、説明文は onSurfaceVariant、行間はサイズの 1.3〜1.5 倍。",
    image: "画像: 角丸 20dp、指定がなければ surfaceContainerHighest のプレースホルダー。アスペクト比を保って中央でクロップ。",
    divider: "区切り線: 1dp の outlineVariant、左右に 16dp の余白。",
    box: "ボックス: 指定した背景色と角丸で中の要素をまとめる。ドラッグハンドル付きの場合はボトムシートとして下から出す。",
    loadingIndicator:
      "ローディング表示: M3 Expressive の形が変化する LoadingIndicator（回転しながら多角形の間を変形するもの）を使う。コンテナ付きは secondaryContainer の円の中に置く。",
    linearProgress: "リニアプログレス: M3 Expressive の太いバー。波形指定のときは進行中に波打つ wavy スタイルにする。トラックは secondaryContainer、進捗は primary。",
    circularProgress: "サーキュラープログレス: M3 Expressive の太いストローク。波形指定のときは波打つ wavy スタイルにする。",
  },
  en: {
    button:
      "Buttons: medium size, 56dp tall, fully rounded (pill). Filled uses primary, tonal uses secondaryContainer, outlined has a 1dp outline border. A connected button group is a row with 3dp gaps where only the inner adjoining corners shrink to 8dp and the outer corners stay round (the M3 Expressive connected button group).",
    iconButton:
      "Icon buttons: 48dp circles in the filled / tonal / outlined / standard style as specified. A connected run of icon buttons is a connected button group.",
    fab: "FAB: 56dp with 16dp corners; large is 96dp with 28dp corners; small is 40dp with 12dp corners. Tonal uses primaryContainer, filled uses primary. Float it 16dp from the screen edge with a level 3 shadow.",
    extendedFab: "Extended FAB: 56dp tall, 16dp corners, icon on the left and label on the right.",
    chip: "Chips: 32dp tall, 8dp corners. The selected state fills with secondaryContainer and shows a leading check icon. A chip group is a row with 8dp gaps that scrolls horizontally when it overflows.",
    topAppBar:
      "Top app bar: 64dp tall on surface. Title in titleLarge, 48dp icon buttons on each side. The standard tint to surfaceContainer on scroll is fine.",
    bottomNav:
      "Navigation bar: 80dp tall on surfaceContainer. The active destination shows a secondaryContainer pill indicator (64×32dp), a filled icon and a labelMedium label.",
    searchBar: "Search bar: 56dp tall, fully rounded, on surfaceContainerHigh, with a leading search icon and the specified trailing icon.",
    card: "Cards: 20dp corners with an image area on top. Filled uses surfaceContainerHighest, elevated uses surfaceContainerLow with a level 1 shadow, outlined has a 1dp outlineVariant border. Headline in titleMedium, body in bodyMedium, 16dp inner padding.",
    listItem:
      "List items: 72dp tall, 24dp leading icon, headline in bodyLarge, supporting text in bodyMedium on onSurfaceVariant. A stacked list is a vertical run with 3dp gaps, 28dp outer corners and 8dp inner corners (the M3 Expressive list treatment).",
    dialog: "Dialogs: 312dp wide, 28dp corners, on surfaceContainerHigh. Headline in headlineSmall, body in bodyMedium, text buttons aligned right at the bottom.",
    snackbar: "Snackbar: 48dp tall, 8dp corners, inverseSurface background with inverseOnSurface text; the action is an inversePrimary text button. Show it 16dp above the bottom edge and dismiss after a few seconds.",
    textField:
      "Text fields: 56dp tall. Outlined has 16dp corners and an outline border; filled sits on surfaceContainerHighest with an underline. On focus the label floats up and the border becomes 2dp primary. Supporting text goes underneath in bodySmall.",
    switch: "Switches: standard M3 size (52×32dp track). On is primary; off is surfaceContainerHighest with an outline border. Label on the left, switch at the trailing edge.",
    checkbox: "Checkboxes: 18dp square with 2dp corners, primary when checked, label on the right in bodyLarge.",
    slider: "Sliders: the M3 Expressive thick track (16dp) with a tall handle (4×44dp). Primary on the left of the handle, secondaryContainer on the right.",
    text: "Text: the specified sp size; headings on onSurface, descriptions on onSurfaceVariant, line height 1.3–1.5× the size.",
    image: "Images: 20dp corners; a surfaceContainerHighest placeholder when none is provided. Keep the aspect ratio and center-crop.",
    divider: "Dividers: 1dp outlineVariant with 16dp horizontal insets.",
    box: "Boxes: the specified background token and corner radii, grouping what sits inside. With a drag handle it is a bottom sheet that slides up from the bottom.",
    loadingIndicator:
      "Loading: use the M3 Expressive shape-morphing LoadingIndicator (the rotating polygon that morphs between shapes). The contained variant sits inside a secondaryContainer circle.",
    linearProgress: "Linear progress: the thick M3 Expressive bar; use the wavy style when specified. Track is secondaryContainer, progress is primary.",
    circularProgress: "Circular progress: the thick M3 Expressive stroke; use the wavy style when specified.",
  },
};

const GENERAL_JA = [
  "コンポーネントは Jetpack Compose の material3（Expressive API を含む最新版）または Material Web の標準部品を使い、独自の見た目を作らない。",
  "色は必ず上のカラースキームのロール名（primary、surfaceContainer など）で参照し、ハードコードした色を使わない。ライトモード固定でよい。",
  "余白は画面端 16dp、部品同士は 8〜16dp を基本にし、タイポグラフィは M3 の型（titleLarge、bodyMedium など）を使う。",
  "タップできる部品にはリップルと軽い縮小のフィードバックを付け、画面遷移や状態変化には M3 Expressive のスプリングモーション（軽く弾む動き）を使う。",
  "アイコンは Material Symbols Rounded を使う。",
];
const GENERAL_EN = [
  "Use standard components from Jetpack Compose material3 (latest, including the Expressive APIs) or Material Web rather than custom-drawn ones.",
  "Always reference colors through the scheme roles above (primary, surfaceContainer, …) instead of hard-coded values. Light mode only is fine.",
  "Keep 16dp screen margins and 8–16dp between parts, and use the M3 type styles (titleLarge, bodyMedium, …).",
  "Give every tappable part ripple plus a slight press-scale, and use M3 Expressive spring motion (a light bounce) for transitions and state changes.",
  "Use Material Symbols Rounded for icons.",
];

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

  /* kinds on the canvas, in order of first appearance, for the style section */
  const kindsUsed: Kind[] = [];
  for (const g of groups) for (const it of g.items) if (!kindsUsed.includes(it.kind)) kindsUsed.push(it.kind);
  const styleNotes = kindsUsed.map((k) => STYLE_NOTES[lang][k]).filter((s): s is string => !!s);

  if (ja) {
    const title = only ? `${q(only.name || screenWord)}画面` : doc.title.trim() || (frames.length > 1 ? "このアプリ" : "この画面");
    lines.push(`${title}を Material 3 Expressive のデザインで実装してください。` + (doc.brief.trim() ? trimEnd(doc.brief) + "。" : ""));
    lines.push(
      phone
        ? "想定はスマホの縦画面で、ライトモード固定です。"
        : "レイアウトは自由配置で、ライトモード固定です。",
    );

    lines.push("");
    lines.push("## カラー");
    lines.push(`テーマは ${pal.label} 系です。Material 3 のライトカラースキームに次の色を設定し、UI の色はすべてこのロール経由で参照してください。`);
    lines.push(...paletteLines(pal));

    lines.push("");
    lines.push("## 画面構成");
    if (groups.length === 0) {
      lines.push("画面にはまだ部品が置かれていません。");
    } else if (frames.length > 0) {
      if (frames.length > 1) lines.push(`画面は ${frames.length} つあり、${frames.map((f) => q(f.name || screenWord)).join("、")}です。`);
      frames.forEach((f, i) => {
        const gs = byFrame.get(f.id) ?? [];
        if (i > 0 || frames.length > 1) lines.push("");
        lines.push(`${q(f.name || screenWord)}画面${f.bg && f.bg !== "surface" ? `（背景は ${f.bg}）` : ""}${gs.length ? "は上から順に次の通りです。" : "はまだ空です。"}`);
        describeScreen(lines, gs, { x: f.x, y: f.y }, widths, "ja");
      });
      if (loose.length && !only) {
        lines.push("");
        lines.push("画面の外に置かれている部品（共通パーツや参考）:");
        describeScreen(lines, loose, null, widths, "ja");
      }
    } else {
      lines.push("画面を上から順に説明します。");
      describeScreen(lines, groups, null, widths, "ja");
    }

    const notes = groups.flatMap((g) => notesJa(g, allFrames));
    if (notes.length) {
      lines.push("");
      lines.push("## 振る舞いと画面遷移");
      for (const n of notes) lines.push(`- ${n}`);
    }

    if (styleNotes.length) {
      lines.push("");
      lines.push("## 各部品のスタイル");
      lines.push("使っている部品ごとの指定です。数値は M3 Expressive の標準値なので、標準コンポーネントで実現できるものは標準に任せてください。");
      for (const s of styleNotes) lines.push(`- ${s}`);
    }

    lines.push("");
    lines.push("## 全体の指針");
    for (const s of GENERAL_JA) lines.push(`- ${s}`);
    return lines.join("\n");
  }

  const title = only ? `the ${q(only.name || screenWord)} screen` : doc.title.trim() || (frames.length > 1 ? "this app" : "this screen");
  lines.push(`Please implement ${title} in the Material 3 Expressive design language.` + (doc.brief.trim() ? ` ${trimEnd(doc.brief)}.` : ""));
  lines.push(
    phone
      ? "Target a portrait phone screen, light mode only."
      : "The layout is free-form, light mode only.",
  );

  lines.push("");
  lines.push("## Colors");
  lines.push(`The theme is ${pal.label}. Set these on the Material 3 light color scheme and reference every UI color through its role.`);
  lines.push(...paletteLines(pal));

  lines.push("");
  lines.push("## Layout");
  if (groups.length === 0) {
    lines.push("Nothing has been placed on the screen yet.");
  } else if (frames.length > 0) {
    if (frames.length > 1) lines.push(`There are ${frames.length} screens: ${frames.map((f) => q(f.name || screenWord)).join(", ")}.`);
    frames.forEach((f, i) => {
      const gs = byFrame.get(f.id) ?? [];
      if (i > 0 || frames.length > 1) lines.push("");
      lines.push(`The ${q(f.name || screenWord)} screen${f.bg && f.bg !== "surface" ? ` (background ${f.bg})` : ""}${gs.length ? ", from top to bottom:" : " is still empty."}`);
      describeScreen(lines, gs, { x: f.x, y: f.y }, widths, "en");
    });
    if (loose.length && !only) {
      lines.push("");
      lines.push("Parts placed outside the screens (shared parts or references):");
      describeScreen(lines, loose, null, widths, "en");
    }
  } else {
    lines.push("The screen, from top to bottom:");
    describeScreen(lines, groups, null, widths, "en");
  }

  const notes = groups.flatMap((g) => notesEn(g, allFrames));
  if (notes.length) {
    lines.push("");
    lines.push("## Behavior and navigation");
    for (const n of notes) lines.push(`- ${n}`);
  }

  if (styleNotes.length) {
    lines.push("");
    lines.push("## Component styles");
    lines.push("Per-component notes for the parts in use. The numbers are the M3 Expressive defaults, so let the standard components handle whatever they already do.");
    for (const s of styleNotes) lines.push(`- ${s}`);
  }

  lines.push("");
  lines.push("## General guidance");
  for (const s of GENERAL_EN) lines.push(`- ${s}`);
  return lines.join("\n");
}
