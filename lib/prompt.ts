import { KIND_TEXT, Lang, SWIPE_TEXT, TRANSITION_TEXT, getLang } from "./i18n";
import {
  Action,
  BACK_TARGET,
  Doc,
  Frame,
  Group,
  Item,
  Kind,
  PALETTES,
  Palette,
  PHONE_H,
  PHONE_W,
  SWIPE_DIRS,
  Variant,
  explodeGroup,
  frameOfGroup,
  groupBounds,
} from "./tokens";

const VARIANT_TEXT: Record<Lang, Record<Variant, string>> = {
  ja: { filled: "塗りつぶし", tonal: "トーナル", elevated: "エレベーテッド", outlined: "アウトライン", text: "テキスト" },
  en: { filled: "filled", tonal: "tonal", elevated: "elevated", outlined: "outlined", text: "text" },
  zh: { filled: "填充", tonal: "色调", elevated: "浮起", outlined: "描边", text: "文字" },
};

const hasText = (s?: string | null) => !!s && s.trim().length > 0;
const qj = (s: string) => `「${s.trim()}」`;
const qe = (s: string) => `"${s.trim()}"`;
const qz = (s: string) => `“${s.trim()}”`;
const quote = (lang: Lang) => (lang === "ja" ? qj : lang === "zh" ? qz : qe);
const trimEnd = (s: string) => s.trim().replace(/[。.\s]+$/, "");

/* ================= single parts ================= */

function itemJa(it: Item): string {
  const q = qj;
  const v = VARIANT_TEXT.ja[it.variant];
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
      return `${q(it.label)}${hasText(it.supporting) ? `（サブテキスト${q(it.supporting!)}）` : ""}${it.icon ? `、先頭に ${it.icon} アイコン${it.iconFill === "none" ? "（背景なし）" : it.iconFill ? `（背景 ${it.iconFill}）` : ""}` : ""}${it.icon2 ? `、末尾に ${it.icon2}` : ""}${it.fill && it.fill !== "surfaceContainerLow" ? `、背景は ${it.fill}` : ""}`;
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
      return `${it.size ?? PHONE_W}×${it.size2 ?? 220}dp の${it.checked ? "ボトムシート（上部にドラッグハンドル。" : "ボックス（"}背景 ${it.fill ?? "surfaceContainerLow"}、角丸は上 ${it.radiusTop ?? 28}dp・下 ${it.radiusBottom ?? 28}dp）`;
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

function itemEn(it: Item): string {
  const q = qe;
  const v = VARIANT_TEXT.en[it.variant];
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
      return `${q(it.label)}${hasText(it.supporting) ? ` with supporting text ${q(it.supporting!)}` : ""}${it.icon ? `, a leading ${it.icon} icon${it.iconFill === "none" ? " (no background circle)" : it.iconFill ? ` (on a ${it.iconFill} circle)` : ""}` : ""}${it.icon2 ? `, a trailing ${it.icon2} icon` : ""}${it.fill && it.fill !== "surfaceContainerLow" ? `, on a ${it.fill} background` : ""}`;
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
      return `a ${it.size ?? PHONE_W}×${it.size2 ?? 220}dp ${it.checked ? "bottom sheet with a drag handle at the top" : "box"} (background ${it.fill ?? "surfaceContainerLow"}, corner radius ${it.radiusTop ?? 28}dp top / ${it.radiusBottom ?? 28}dp bottom)`;
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

function itemZh(it: Item): string {
  const q = qz;
  const v = VARIANT_TEXT.zh[it.variant];
  const noun = KIND_TEXT.zh[it.kind]?.noun ?? it.kind;
  switch (it.kind) {
    case "button":
      return `${hasText(it.label) ? q(it.label) : "无标签"}的${v}按钮${it.icon ? `（带 ${it.icon} 图标）` : ""}`;
    case "iconButton":
      return `${it.icon ?? "空"} 图标的${v}图标按钮`;
    case "fab":
      return `${it.icon ?? "空"} 图标的${v} FAB${it.size && it.size >= 96 ? "（大尺寸）" : it.size && it.size <= 40 ? "（小尺寸）" : ""}`;
    case "extendedFab":
      return `${q(it.label)}${it.icon ? `和 ${it.icon} 图标` : ""}的扩展 FAB（${v}）`;
    case "chip":
      return `${q(it.label)}标签片${it.checked ? "（选中状态）" : ""}${it.icon && !it.checked ? `（带 ${it.icon} 图标）` : ""}`;
    case "topAppBar":
      return `标题为${q(it.label)}的顶部应用栏${it.icon ? `，左侧是 ${it.icon}` : ""}${it.icon2 ? `，右侧是 ${it.icon2}` : ""}${it.icon || it.icon2 ? " 图标按钮" : ""}`;
    case "bottomNav": {
      const tabs = (it.tabs ?? []).map((t) => `${q(t.label || "无标签")}(${t.icon || "无图标"})`);
      return `${tabs.length}个项目的导航栏（${tabs.join("、")}，第一项为选中状态）`;
    }
    case "searchBar":
      return `占位文字为${q(it.label)}的搜索栏${it.icon2 ? `（右端有 ${it.icon2} 图标）` : ""}`;
    case "card": {
      const style = it.variant === "elevated" ? "浮起" : it.variant === "outlined" ? "描边" : "填充";
      return `${style}卡片。顶部是${it.icon ? `${it.icon} 图标的` : ""}占位图片，标题${q(it.label)}${hasText(it.supporting) ? `，正文${q(it.supporting!)}` : ""}`;
    }
    case "listItem":
      return `${q(it.label)}${hasText(it.supporting) ? `（辅助文本${q(it.supporting!)}）` : ""}${it.icon ? `，前置 ${it.icon} 图标${it.iconFill === "none" ? "（无背景）" : it.iconFill ? `（背景 ${it.iconFill}）` : ""}` : ""}${it.icon2 ? `，后置 ${it.icon2}` : ""}${it.fill && it.fill !== "surfaceContainerLow" ? `，背景为 ${it.fill}` : ""}`;
    case "dialog":
      return `标题${q(it.label)}${hasText(it.supporting) ? `、正文${q(it.supporting!)}` : ""}${it.icon ? `、带 ${it.icon} 图标` : ""}的对话框（取消／确定文字按钮）`;
    case "snackbar":
      return `${q(it.label)}消息条${hasText(it.supporting) ? `（带${q(it.supporting!)}操作）` : ""}`;
    case "textField":
      return `标签为${q(it.label)}的${it.variant === "filled" ? "填充" : "描边"}文本输入框${it.icon ? `（前置 ${it.icon} 图标）` : ""}${hasText(it.supporting) ? `，辅助文本为${q(it.supporting!)}` : ""}`;
    case "switch":
      return `${q(it.label)}开关（初始状态为${it.checked ? "开" : "关"}）`;
    case "checkbox":
      return `${q(it.label)}复选框（初始状态为${it.checked ? "已勾选" : "未勾选"}）`;
    case "slider":
      return `滑块（初始值 ${it.value ?? 40}%）`;
    case "text":
      return `${it.bold ? "粗体" : ""}文本${q(it.label)}（${it.size ?? 28}sp）`;
    case "image":
      return `${it.size ?? 200}dp 见方的图片${it.src ? "（显示指定的图片）" : "占位符"}`;
    case "divider":
      return "分割线";
    case "box":
      return `${it.size ?? PHONE_W}×${it.size2 ?? 220}dp 的${it.checked ? "底部面板（顶部带拖动条，" : "容器框（"}背景 ${it.fill ?? "surfaceContainerLow"}，圆角上 ${it.radiusTop ?? 28}dp、下 ${it.radiusBottom ?? 28}dp）`;
    case "loadingIndicator":
      return `M3 Expressive 形状变化的加载指示器${it.contained ? "（带容器）" : ""}`;
    case "linearProgress":
      return `${it.wavy ? "波浪形" : ""}线性进度条（${it.value === undefined ? "不确定进度" : `${it.value}%`}）`;
    case "circularProgress":
      return `${it.wavy ? "波浪形" : ""}圆形进度条（${it.value === undefined ? "不确定进度" : `${it.value}%`}）`;
    default:
      return noun;
  }
}

const itemText = (it: Item, lang: Lang) => (lang === "ja" ? itemJa(it) : lang === "zh" ? itemZh(it) : itemEn(it));

/* ================= connected runs ================= */

function groupText(g: Group, lang: Lang): string {
  if (g.items.length === 1) return itemText(g.items[0], lang);
  const q = quote(lang);
  const kind = g.items[0].kind;
  const vt = VARIANT_TEXT[lang];
  const same = g.items.every((it) => it.variant === g.items[0].variant);
  if (lang === "ja") {
    if (kind === "listItem") return `${g.items.length}項目のリスト。上から ${g.items.map(itemJa).join("、")}`;
    if (kind === "chip") return `${g.items.map((it) => q(it.label) + (it.checked ? "(選択中)" : "")).join("")}のチップが横に並ぶチップグループ`;
    if (kind === "iconButton") return `${g.items.map((it) => it.icon ?? "空").join("・")} のアイコンボタンが連結したボタングループ`;
    const names = same
      ? g.items.map((it) => q(it.label || "ラベルなし")).join("")
      : g.items.map((it) => `${q(it.label || "ラベルなし")}(${vt[it.variant]})`).join("");
    return `${names}の${g.items.length}つのボタンが横に連結したボタングループ${same ? `（${vt[g.items[0].variant]}）` : ""}`;
  }
  if (lang === "zh") {
    if (kind === "listItem") return `${g.items.length}项的列表，从上到下依次为 ${g.items.map(itemZh).join("、")}`;
    if (kind === "chip") return `由${g.items.map((it) => q(it.label) + (it.checked ? "(选中)" : "")).join("")}横向排列组成的标签片组`;
    if (kind === "iconButton") return `由 ${g.items.map((it) => it.icon ?? "空").join("、")} 图标按钮相连组成的按钮组`;
    const names = same
      ? g.items.map((it) => q(it.label || "无标签")).join("")
      : g.items.map((it) => `${q(it.label || "无标签")}(${vt[it.variant]})`).join("");
    return `由${names}这 ${g.items.length} 个按钮横向相连组成的按钮组${same ? `（${vt[g.items[0].variant]}）` : ""}`;
  }
  if (kind === "listItem") return `a list of ${g.items.length} items, top to bottom: ${g.items.map(itemEn).join("; ")}`;
  if (kind === "chip") return `a chip group: ${g.items.map((it) => q(it.label) + (it.checked ? " (selected)" : "")).join(", ")}`;
  if (kind === "iconButton") return `a connected group of icon buttons: ${g.items.map((it) => it.icon ?? "empty").join(", ")}`;
  const names = same
    ? g.items.map((it) => q(it.label || "unlabeled")).join(", ")
    : g.items.map((it) => `${q(it.label || "unlabeled")} (${vt[it.variant]})`).join(", ");
  return `a connected button group of ${g.items.length}${same ? ` ${vt[g.items[0].variant]}` : ""} buttons: ${names}`;
}

/** short name for a run when it is referred to again (as a container or a neighbour) */
function groupName(g: Group, lang: Lang): string {
  const it = g.items[0];
  const noun = KIND_TEXT[lang][it.kind]?.noun ?? it.kind;
  const q = quote(lang);
  if (g.items.length > 1) return lang === "en" ? `the ${noun} group` : lang === "zh" ? `${noun}组` : `${noun}のグループ`;
  if (it.kind === "box") return lang === "en" ? (it.checked ? "the bottom sheet" : "the box") : lang === "zh" ? (it.checked ? "底部面板" : "容器框") : it.checked ? "ボトムシート" : "ボックス";
  if (hasText(it.label) && it.kind !== "text") return lang === "en" ? `the ${q(it.label)} ${noun}` : `${q(it.label)}${noun}`;
  return lang === "en" ? `the ${noun}` : noun;
}

/* ================= behavior notes ================= */

function actionText(a: Action, frames: Frame[], lang: Lang): string | null {
  const q = quote(lang);
  if (a.to === BACK_TARGET) {
    return lang === "ja" ? "前の画面に戻る（入ったときの遷移を逆再生する）" : lang === "zh" ? "返回上一个屏幕（反向播放进入时的过渡动画）" : "goes back to the previous screen (playing the entry transition in reverse)";
  }
  const target = frames.find((f) => f.id === a.to);
  if (!target) return null;
  const tr = TRANSITION_TEXT[lang][a.transition];
  const name = q(target.name || (lang === "en" ? "screen" : lang === "zh" ? "屏幕" : "画面"));
  if (lang === "ja") return `${name}画面へ${a.transition !== "none" ? `${tr}で` : ""}遷移する`;
  if (lang === "zh") return `${a.transition !== "none" ? `以${tr}的方式` : ""}跳转到${name}屏幕`;
  return `opens the ${name} screen${a.transition !== "none" ? ` with ${tr}` : ""}`;
}

function slotName(it: Item, slot: string, lang: Lang): string {
  if (slot.startsWith("tab:")) {
    const i = Number(slot.slice(4));
    const tab = it.tabs?.[i];
    const q = quote(lang);
    const label = tab?.label ? q(tab.label) : `#${i + 1}`;
    return lang === "ja" ? `${label}の項目` : lang === "zh" ? `${label}项` : `the ${label} destination`;
  }
  const icon = slot === "icon2" ? it.icon2 : it.icon;
  if (lang === "ja") return `${slot === "icon2" ? "右" : "左"}の ${icon ?? ""} アイコンボタン`;
  if (lang === "zh") return `${slot === "icon2" ? "右侧" : "左侧"}的 ${icon ?? ""} 图标按钮`;
  return `the ${icon ?? ""} icon button on the ${slot === "icon2" ? "right" : "left"}`;
}

function notes(g: Group, frames: Frame[], lang: Lang): string[] {
  const out: string[] = [];
  const q = quote(lang);
  for (const it of g.items) {
    const noun = KIND_TEXT[lang][it.kind]?.noun ?? it.kind;
    const name = hasText(it.label) && it.kind !== "text" ? (lang === "en" ? `The ${q(it.label)} ${noun}` : `${q(it.label)}${noun}`) : lang === "en" ? `The ${noun}` : hasText(it.label) ? (lang === "ja" ? `テキスト${q(it.label)}` : `文本${q(it.label)}`) : noun;
    const parts: string[] = [];
    if (it.action) {
      const a = actionText(it.action, frames, lang);
      if (a) parts.push(lang === "ja" ? `タップすると${a}` : lang === "zh" ? `点击后${a}` : `${a} when tapped`);
    }
    for (const [slot, action] of Object.entries(it.actions ?? {})) {
      if (!action) continue;
      const a = actionText(action, frames, lang);
      if (!a) continue;
      const s = slotName(it, slot, lang);
      if (lang === "en") out.push(`Tapping ${s} of ${name.replace(/^The /, "the ")} ${a}.`);
      else parts.push(lang === "ja" ? `${s}をタップすると${a}` : `点击${s}后${a}`);
    }
    if (it.toggle) {
      const vt = VARIANT_TEXT[lang];
      const icon = it.toggle.icon; // undefined = same as off, null = no icon
      const variant = it.toggle.variant;
      const changes: string[] = [];
      const label = it.toggle.label !== undefined && it.toggle.label !== it.label ? it.toggle.label : undefined;
      if (lang === "ja") {
        if (label !== undefined) changes.push(`ラベルが${qj(label)}に変わる`);
        if (icon) changes.push(`アイコンが ${icon} に変わる`);
        else if (icon === null) changes.push("アイコンが消える");
        if (variant) changes.push(`スタイルが${vt[variant]}に変わる`);
        parts.push(`タップするたびにオン／オフが切り替わるトグルボタンにする${changes.length ? `（オンのときは${changes.join("、")}）` : ""}`);
      } else if (lang === "zh") {
        if (label !== undefined) changes.push(`文字变为${qz(label)}`);
        if (icon) changes.push(`图标变为 ${icon}`);
        else if (icon === null) changes.push("图标消失");
        if (variant) changes.push(`样式变为${vt[variant]}`);
        parts.push(`做成每次点击都切换开/关状态的切换按钮${changes.length ? `（开启时${changes.join("、")}）` : ""}`);
      } else {
        if (label !== undefined) changes.push(`the label becomes ${qe(label)}`);
        if (icon) changes.push(`the icon becomes ${icon}`);
        else if (icon === null) changes.push("the icon disappears");
        if (variant) changes.push(`the style becomes ${vt[variant]}`);
        parts.push(`is a toggle button that flips on / off with every tap${changes.length ? ` (when on, ${changes.join(" and ")})` : ""}`);
      }
    }
    if (hasText(it.note)) parts.push(trimEnd(it.note!));
    if (!parts.length) continue;
    if (lang === "ja") out.push(`${name}は、${parts.join("。また、")}。`);
    else if (lang === "zh") out.push(`${name}：${parts.join("；")}。`);
    else out.push(`${name} ${parts.join(". It also ")}.`);
  }
  return out;
}

function swipeNotes(f: Frame, frames: Frame[], lang: Lang): string[] {
  const out: string[] = [];
  const q = quote(lang);
  const screen = lang === "en" ? "screen" : lang === "zh" ? "屏幕" : "画面";
  for (const d of SWIPE_DIRS) {
    const to = f.swipe?.[d.key];
    if (!to) continue;
    const a = actionText({ to, transition: d.transition }, frames, lang);
    if (!a) continue;
    const sw = SWIPE_TEXT[lang][d.key];
    const name = q(f.name || screen);
    if (lang === "ja") out.push(`${name}画面は、${sw}すると指の動きに追従して${a}。`);
    else if (lang === "zh") out.push(`${name}屏幕：${sw}时跟随手指移动并${a}。`);
    else out.push(`The ${name} screen ${a} when ${sw}; the screen follows the finger while dragging.`);
  }
  return out;
}

/* ================= layout: rows and layers ================= */

type Rect = { l: number; t: number; r: number; b: number };
type LNode = { g: Group; bb: Rect; children: LNode[] };

const area = (r: Rect) => Math.max(0, r.r - r.l) * Math.max(0, r.b - r.t);
const contains = (o: Rect, i: Rect, tol = 2) => i.l >= o.l - tol && i.t >= o.t - tol && i.r <= o.r + tol && i.b <= o.b + tol;
const overlapArea = (a: Rect, b: Rect) =>
  Math.max(0, Math.min(a.r, b.r) - Math.max(a.l, b.l)) * Math.max(0, Math.min(a.b, b.b) - Math.max(a.t, b.t));

/** Groups keep their canvas order (later = drawn on top). A run that sits fully inside an
 *  earlier, larger one is nested in it, so a box with parts on it reads as one container. */
function layoutTree(groups: Group[], widths: Record<string, number>): LNode[] {
  const nodes: LNode[] = groups.map((g) => ({ g, bb: groupBounds(g, widths), children: [] }));
  const roots: LNode[] = [];
  nodes.forEach((n, i) => {
    let parent: LNode | null = null;
    for (let j = 0; j < i; j++) {
      const c = nodes[j];
      if (c.g.items[0].kind === "topAppBar" || c.g.items[0].kind === "bottomNav") continue;
      if (contains(c.bb, n.bb) && area(c.bb) > area(n.bb) && (!parent || area(c.bb) < area(parent.bb))) parent = c;
    }
    (parent ? parent.children : roots).push(n);
  });
  return roots;
}

/** Siblings whose vertical extents overlap and that sit side by side form one row. */
function rowsOf(nodes: LNode[]): LNode[][] {
  const sorted = [...nodes].sort((a, b) => a.bb.t - b.bb.t || a.bb.l - b.bb.l);
  const out: LNode[][] = [];
  for (const n of sorted) {
    const row = out[out.length - 1];
    if (row) {
      const rt = Math.min(...row.map((r) => r.bb.t));
      const rb = Math.max(...row.map((r) => r.bb.b));
      const cy = (n.bb.t + n.bb.b) / 2;
      const rcy = (rt + rb) / 2;
      const beside = row.every((r) => r.bb.r <= n.bb.l + 2 || r.bb.l >= n.bb.r - 2);
      if (beside && ((cy >= rt && cy <= rb) || (rcy >= n.bb.t && rcy <= n.bb.b))) {
        row.push(n);
        continue;
      }
    }
    out.push([n]);
  }
  for (const r of out) r.sort((a, b) => a.bb.l - b.bb.l);
  return out;
}

/** where a rect sits inside a container, in words */
function zone(bb: Rect, within: Rect, lang: Lang, phone: boolean): string {
  const w = within.r - within.l;
  const h = within.b - within.t;
  const cy = (bb.t + bb.b) / 2 - within.t;
  const cx = (bb.l + bb.r) / 2 - within.l;
  const bw = bb.r - bb.l;
  const vert = cy < h * (phone ? 0.22 : 0.3) ? 0 : cy > h * (phone ? 0.8 : 0.7) ? 2 : 1;
  const horiz = bw >= w * 0.85 ? -1 : cx < w * 0.36 ? 0 : cx > w * 0.64 ? 2 : 1;
  if (lang === "ja") {
    const v = ["上部", "中央付近", "下部"][vert];
    if (horiz === 1) return `${v}の中央に`;
    const hh = horiz < 0 ? "" : ["左寄せで", "", "右寄せで"][horiz];
    return `${v}に${hh}`;
  }
  if (lang === "zh") {
    const v = ["上部", "中部", "下部"][vert];
    if (horiz === 1) return `${v}居中`;
    const hh = horiz < 0 ? "" : ["靠左", "", "靠右"][horiz];
    return `${v}${hh}`;
  }
  const v = ["Near the top", "In the middle", "Near the bottom"][vert];
  const hh = horiz < 0 ? "" : [", aligned left", ", centered", ", aligned right"][horiz];
  return `${v}${hh}`;
}

/** the row phrase: a single part, or several parts side by side that must stay on one line */
function rowText(row: LNode[], where: string, lang: Lang, within: Rect): string {
  if (row.length === 1) {
    const d = groupText(row[0].g, lang);
    return lang === "ja" ? `${where}${d}を置きます。` : lang === "zh" ? `${where}放置${d}。` : `${where}: ${d}.`;
  }
  const last = row[row.length - 1];
  const fillsRight = last.bb.r >= within.r - 24;
  const descs = row.map((n) => groupText(n.g, lang));
  if (lang === "ja") {
    const stretch = fillsRight ? `。最後の${groupName(last.g, "ja")}は右端まで残りの幅いっぱいに伸ばします` : "";
    return `${where}、左から ${descs.join("、")} を横一列に並べます（同じ行に収めて縦方向は中央揃え。縦に積んだり折り返したりしません${stretch}）。`;
  }
  if (lang === "zh") {
    const stretch = fillsRight ? `，最后的${groupName(last.g, "zh")}向右拉伸占满剩余宽度` : "";
    return `${where}，从左到右横向排成一行：${descs.join("、")}（放在同一行并垂直居中，不要竖着堆叠或换行${stretch}）。`;
  }
  const stretch = fillsRight ? `; ${groupName(last.g, "en")} stretches to fill the remaining width to the right edge` : "";
  return `${where}, in one row from left to right: ${descs.join(", ")} (keep them on the same line, vertically centered; never stack or wrap them${stretch}).`;
}

function describeNodes(lines: string[], nodes: LNode[], within: Rect | null, widths: Record<string, number>, lang: Lang, depth: number, phone: boolean) {
  const rows = rowsOf(nodes);
  const pad = "  ".repeat(depth);
  const box: Rect = within ?? {
    l: Math.min(...nodes.map((n) => n.bb.l)),
    t: Math.min(...nodes.map((n) => n.bb.t)),
    r: Math.max(...nodes.map((n) => n.bb.r)),
    b: Math.max(...nodes.map((n) => n.bb.b)),
  };
  rows.forEach((row, i) => {
    const first = row[0];
    const rowRect: Rect = {
      l: Math.min(...row.map((n) => n.bb.l)),
      t: Math.min(...row.map((n) => n.bb.t)),
      r: Math.max(...row.map((n) => n.bb.r)),
      b: Math.max(...row.map((n) => n.bb.b)),
    };
    let where: string;
    if (within) where = zone(rowRect, box, lang, phone);
    else where = lang === "ja" ? (i === 0 ? "まず" : "その下に") : lang === "zh" ? (i === 0 ? "首先" : "其下方") : i === 0 ? "First" : "Below that";
    /* a part that partly covers an earlier sibling is drawn on top of it */
    const overlaps: string[] = [];
    if (row.length === 1) {
      for (const other of nodes) {
        if (other === first || nodes.indexOf(other) > nodes.indexOf(first)) continue;
        const ov = overlapArea(other.bb, first.bb);
        if (ov > 0 && ov >= area(first.bb) * 0.25 && !contains(other.bb, first.bb)) overlaps.push(groupName(other.g, lang));
      }
    }
    let line = rowText(row, where, lang, box);
    if (overlaps.length) {
      const o = overlaps.join(lang === "en" ? " and " : "、");
      line = lang === "ja" ? `${line.replace(/。$/, "")}（${o}の上に一部重ねて前面に描画）。` : lang === "zh" ? `${line.replace(/。$/, "")}（部分覆盖在${o}之上，绘制在前面）。` : `${line.replace(/\.$/, "")} (partly overlapping ${o}, drawn on top).`;
    }
    lines.push(`${pad}- ${line}`);
    for (const n of row) {
      if (!n.children.length) continue;
      const name = groupName(n.g, lang);
      lines.push(
        `${pad}  - ${lang === "ja" ? `${name}の中には次を重ねて配置します（ボックス側を背景にし、以下はその前面に載せる。位置はボックス内での相対位置）:` : lang === "zh" ? `${name}内部叠放以下内容（以容器为背景，下列组件绘制在其前面，位置为容器内的相对位置）：` : `Inside ${name}, layered on top of it (the container is the background; positions are relative to it):`}`,
      );
      describeNodes(lines, n.children, n.bb, widths, lang, depth + 2, false);
    }
  });
}

function describeScreen(lines: string[], groups: Group[], frameRect: Rect | null, widths: Record<string, number>, lang: Lang) {
  if (!groups.length) return;
  const roots = layoutTree(groups, widths);
  describeNodes(lines, roots, frameRect, widths, lang, 0, true);
}

/* ---------- color palette ---------- */

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

/** How each kind should look; only the kinds on the canvas are written out.
 *  `boxSheet` is the box note used when at least one box has its handle on. */
const STYLE_NOTES: Record<Lang, Partial<Record<Kind | "boxSheet", string>>> = {
  ja: {
    button:
      "ボタン: 高さ 56dp のミディアムサイズで、角は完全な丸（ピル型）。塗りつぶしは primary、トーナルは secondaryContainer、アウトラインは outline の 1dp 枠。横に連結したボタングループは 3dp の隙間で並べ、隣り合う内側の角だけ 8dp に小さくし、外側の角は丸のままにする（M3 Expressive の Connected button group）。",
    iconButton:
      "アイコンボタン: 48dp の円形。塗りつぶし・トーナル・アウトライン・スタンダードを指定通りに使い分ける。連結したアイコンボタン群は Connected button group として実装する。",
    fab: "FAB: 通常は 56dp・角丸 16dp、大サイズは 96dp・角丸 28dp、小サイズは 40dp・角丸 12dp。トーナルは primaryContainer、塗りつぶしは primary。画面端から 16dp 離して浮かせ、影は Level 3。",
    extendedFab: "拡張 FAB: 高さ 56dp、角丸 16dp、左にアイコン・右にラベル。",
    chip: "チップ: 高さ 32dp、角丸 8dp。選択状態は secondaryContainer で塗り、先頭にチェックアイコンを出す。横並びのチップグループは 8dp 間隔で、はみ出す場合は横スクロール。",
    topAppBar:
      "トップアプリバー: 高さ 64dp、背景は surface。背景はステータスバーの後ろまで伸ばし、その分（システムインセット）だけ上に余白を取る。タイトルは titleLarge、左右のアイコンボタンは 48dp。スクロール時に surfaceContainer へ色が変わる標準の挙動でよい。",
    bottomNav:
      "ナビゲーションバー: 高さ 80dp、背景は surfaceContainer。背景は画面下端のジェスチャーナビゲーション領域まで伸ばし、その分（システムインセット）だけ下に余白を取る。選択中の項目は secondaryContainer のピル型インジケータ（幅 64dp・高さ 32dp）で示し、アイコンは塗りつぶし、ラベルは labelMedium。",
    searchBar: "検索バー: 高さ 56dp、角は完全な丸、背景は surfaceContainerHigh。先頭に検索アイコン、末尾に指定のアイコン。",
    card: "カード: 角丸 20dp、上部に画像領域。塗りつぶしは surfaceContainerHighest、エレベーテッドは surfaceContainerLow に Level 1 の影、アウトラインは outlineVariant の 1dp 枠。見出しは titleMedium、本文は bodyMedium、内側の余白は 16dp。",
    listItem:
      "リスト項目: 高さ 72dp、先頭アイコンは 24dp（指定がなければ primaryContainer の 40dp の円の上）、主テキストは bodyLarge、サブテキストは bodyMedium の onSurfaceVariant。背景は指定のロール（指定がなければ surfaceContainerLow）。上下に連結したリストは 3dp の隙間で並べ、外側の角を 28dp、隣り合う内側の角を 8dp にする（M3 Expressive のリスト表現）。",
    dialog: "ダイアログ: 幅 312dp、角丸 28dp、背景は surfaceContainerHigh。見出しは headlineSmall、本文は bodyMedium、下部右寄せにテキストボタン。",
    snackbar: "スナックバー: 高さ 48dp、角丸 8dp、背景は inverseSurface、文字は inverseOnSurface。アクションは inversePrimary のテキストボタン。画面下部から 16dp 上に表示し、数秒で消える。",
    textField:
      "テキスト入力: 高さ 56dp。アウトラインは角丸 16dp・枠 outline、塗りつぶしは surfaceContainerHighest に下線。フォーカス時はラベルが上に浮き、枠が primary の 2dp になる。補助テキストは bodySmall で下に出す。",
    switch: "スイッチ: M3 標準サイズ（トラック 52×32dp）。オンは primary、オフは surfaceContainerHighest に outline の枠。ラベルは左、スイッチは右端。",
    checkbox: "チェックボックス: 18dp の四角、角丸 2dp、チェック時は primary。ラベルは右に bodyLarge。",
    slider: "スライダー: M3 Expressive の太いトラック（高さ 16dp）と縦長のハンドル（幅 4dp・高さ 44dp）。ハンドルの左は primary、右は secondaryContainer。ドラッグで値を変えられる。",
    text: "テキスト: 指定の sp サイズ。見出しは onSurface、説明文は onSurfaceVariant、行間はサイズの 1.3〜1.5 倍。タップしてもリップルなどの反応は付けない。",
    image: "画像: 角丸 20dp、指定がなければ surfaceContainerHighest のプレースホルダー。アスペクト比を保って中央でクロップ。",
    divider: "区切り線: 1dp の outlineVariant、左右に 16dp の余白。",
    box: "ボックス: 指定した背景色と角丸を持つ単なるコンテナ。中に重ねる部品の背景として使い、独自の挙動は付けない。",
    boxSheet:
      "ボックス / ボトムシート: 指定した背景色と角丸を持つコンテナ。ドラッグハンドル付きと書いたものだけはモーダルボトムシート（ModalBottomSheet）として下から出し、それ以外のボックスは単なる背景コンテナにする。",
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
      "Top app bar: 64dp tall on surface, with its background extended behind the status bar (pad the top by the system inset). Title in titleLarge, 48dp icon buttons on each side. The standard tint to surfaceContainer on scroll is fine.",
    bottomNav:
      "Navigation bar: 80dp tall on surfaceContainer, with its background extended down through the gesture navigation area (pad the bottom by the system inset). The active destination shows a secondaryContainer pill indicator (64×32dp), a filled icon and a labelMedium label.",
    searchBar: "Search bar: 56dp tall, fully rounded, on surfaceContainerHigh, with a leading search icon and the specified trailing icon.",
    card: "Cards: 20dp corners with an image area on top. Filled uses surfaceContainerHighest, elevated uses surfaceContainerLow with a level 1 shadow, outlined has a 1dp outlineVariant border. Headline in titleMedium, body in bodyMedium, 16dp inner padding.",
    listItem:
      "List items: 72dp tall, 24dp leading icon (on a 40dp primaryContainer circle unless stated), headline in bodyLarge, supporting text in bodyMedium on onSurfaceVariant, on the specified background role (surfaceContainerLow unless stated). A stacked list is a vertical run with 3dp gaps, 28dp outer corners and 8dp inner corners (the M3 Expressive list treatment).",
    dialog: "Dialogs: 312dp wide, 28dp corners, on surfaceContainerHigh. Headline in headlineSmall, body in bodyMedium, text buttons aligned right at the bottom.",
    snackbar: "Snackbar: 48dp tall, 8dp corners, inverseSurface background with inverseOnSurface text; the action is an inversePrimary text button. Show it 16dp above the bottom edge and dismiss after a few seconds.",
    textField:
      "Text fields: 56dp tall. Outlined has 16dp corners and an outline border; filled sits on surfaceContainerHighest with an underline. On focus the label floats up and the border becomes 2dp primary. Supporting text goes underneath in bodySmall.",
    switch: "Switches: standard M3 size (52×32dp track). On is primary; off is surfaceContainerHighest with an outline border. Label on the left, switch at the trailing edge.",
    checkbox: "Checkboxes: 18dp square with 2dp corners, primary when checked, label on the right in bodyLarge.",
    slider: "Sliders: the M3 Expressive thick track (16dp) with a tall handle (4×44dp). Primary on the left of the handle, secondaryContainer on the right. Dragging changes the value.",
    text: "Text: the specified sp size; headings on onSurface, descriptions on onSurfaceVariant, line height 1.3–1.5× the size. No ripple or press feedback on tap.",
    image: "Images: 20dp corners; a surfaceContainerHighest placeholder when none is provided. Keep the aspect ratio and center-crop.",
    divider: "Dividers: 1dp outlineVariant with 16dp horizontal insets.",
    box: "Boxes: plain containers with the specified background token and corner radii. They are the background for whatever is layered on them and have no behavior of their own.",
    boxSheet:
      "Boxes / bottom sheets: containers with the specified background token and corner radii. Only the ones described with a drag handle are modal bottom sheets that slide up from the bottom; every other box is a plain background container.",
    loadingIndicator:
      "Loading: use the M3 Expressive shape-morphing LoadingIndicator (the rotating polygon that morphs between shapes). The contained variant sits inside a secondaryContainer circle.",
    linearProgress: "Linear progress: the thick M3 Expressive bar; use the wavy style when specified. Track is secondaryContainer, progress is primary.",
    circularProgress: "Circular progress: the thick M3 Expressive stroke; use the wavy style when specified.",
  },
  zh: {
    button:
      "按钮：中号，高 56dp，完全圆角（胶囊形）。填充用 primary，色调用 secondaryContainer，描边用 1dp 的 outline 边框。横向相连的按钮组以 3dp 间距排列，只把相邻的内侧圆角缩小到 8dp，外侧保持圆角（M3 Expressive 的 Connected button group）。",
    iconButton: "图标按钮：48dp 圆形。按指定使用填充／色调／描边／标准样式。相连的图标按钮组实现为 Connected button group。",
    fab: "FAB：常规 56dp、圆角 16dp；大尺寸 96dp、圆角 28dp；小尺寸 40dp、圆角 12dp。色调用 primaryContainer，填充用 primary。距屏幕边缘 16dp 悬浮，阴影为 Level 3。",
    extendedFab: "扩展 FAB：高 56dp，圆角 16dp，左侧图标、右侧标签。",
    chip: "标签片：高 32dp，圆角 8dp。选中状态用 secondaryContainer 填充并在前面显示勾选图标。横向标签片组间距 8dp，溢出时横向滚动。",
    topAppBar:
      "顶部应用栏：高 64dp，背景为 surface。背景延伸到状态栏后面，并按系统内边距在顶部留出空间。标题用 titleLarge，左右图标按钮 48dp。滚动时变为 surfaceContainer 的标准行为即可。",
    bottomNav:
      "导航栏：高 80dp，背景为 surfaceContainer。背景延伸到屏幕底部的手势导航区域，并按系统内边距在底部留出空间。选中项用 secondaryContainer 的胶囊指示器（宽 64dp、高 32dp）表示，图标为填充样式，标签用 labelMedium。",
    searchBar: "搜索栏：高 56dp，完全圆角，背景为 surfaceContainerHigh。前置搜索图标，后置指定图标。",
    card: "卡片：圆角 20dp，顶部为图片区域。填充用 surfaceContainerHighest，浮起用 surfaceContainerLow 加 Level 1 阴影，描边用 1dp 的 outlineVariant 边框。标题用 titleMedium，正文用 bodyMedium，内边距 16dp。",
    listItem:
      "列表项：高 72dp，前置图标 24dp（未指定时放在 40dp 的 primaryContainer 圆形上），主文本用 bodyLarge，辅助文本用 bodyMedium 的 onSurfaceVariant，背景为指定的颜色角色（未指定则为 surfaceContainerLow）。上下相连的列表以 3dp 间距排列，外侧圆角 28dp，相邻内侧圆角 8dp（M3 Expressive 的列表样式）。",
    dialog: "对话框：宽 312dp，圆角 28dp，背景为 surfaceContainerHigh。标题用 headlineSmall，正文用 bodyMedium，底部右对齐放文字按钮。",
    snackbar: "消息条：高 48dp，圆角 8dp，背景为 inverseSurface，文字为 inverseOnSurface。操作为 inversePrimary 的文字按钮。显示在距屏幕底部 16dp 处，数秒后消失。",
    textField:
      "文本输入框：高 56dp。描边样式圆角 16dp、边框为 outline；填充样式背景为 surfaceContainerHighest 并带下划线。聚焦时标签上浮，边框变为 2dp 的 primary。辅助文本用 bodySmall 显示在下方。",
    switch: "开关：M3 标准尺寸（轨道 52×32dp）。开为 primary，关为 surfaceContainerHighest 加 outline 边框。标签在左，开关靠右。",
    checkbox: "复选框：18dp 方形，圆角 2dp，勾选时为 primary。标签在右侧，用 bodyLarge。",
    slider: "滑块：M3 Expressive 的粗轨道（高 16dp）和竖长手柄（宽 4dp、高 44dp）。手柄左侧为 primary，右侧为 secondaryContainer。可拖动改变数值。",
    text: "文本：指定的 sp 字号。标题用 onSurface，说明文字用 onSurfaceVariant，行高为字号的 1.3〜1.5 倍。点击时不加涟漪等反馈。",
    image: "图片：圆角 20dp，未指定时使用 surfaceContainerHighest 的占位符。保持宽高比并居中裁剪。",
    divider: "分割线：1dp 的 outlineVariant，左右留 16dp 边距。",
    box: "容器框：只是带指定背景色和圆角的容器，作为叠放在其上的组件的背景，本身没有任何行为。",
    boxSheet: "容器框／底部面板：带指定背景色和圆角的容器。只有描述中带拖动条的才做成从底部滑出的模态底部面板（ModalBottomSheet），其余容器框只是普通的背景容器。",
    loadingIndicator: "加载指示：使用 M3 Expressive 形状变化的 LoadingIndicator（旋转并在多边形之间变形）。带容器的放在 secondaryContainer 的圆形中。",
    linearProgress: "线性进度条：M3 Expressive 的粗进度条。指定波浪形时使用进行中波动的 wavy 样式。轨道为 secondaryContainer，进度为 primary。",
    circularProgress: "圆形进度条：M3 Expressive 的粗描边。指定波浪形时使用 wavy 样式。",
  },
};

const GENERAL: Record<Lang, string[]> = {
  ja: [
    "コンポーネントは Jetpack Compose の material3（Expressive API を含む最新版）または Material Web の標準部品を使い、独自の見た目を作らない。",
    "色は必ず上のカラースキームのロール名（primary、surfaceContainer など）で参照し、ハードコードした色を使わない。ライトモード固定でよい。",
    "余白は画面端 16dp、部品同士は 8〜16dp を基本にし、タイポグラフィは M3 の型（titleLarge、bodyMedium など）を使う。",
    "「横一列に並べる」と書いた部品は必ず 1 つの Row（横並びコンテナ）に入れて同じ行に置き、縦に積んだり次の行に折り返したりしない。行の高さは一番高い部品に合わせ、他は縦中央に揃える。",
    "「〜の中に重ねて配置」と書いた部品は、その容器（ボックスやカード）を背景にした Box の上に重ねて描く。重なりは意図したものなので、レイアウトの都合で分離したり順序を変えたりしない。前後関係は記述の順（後に書いたものが前面）に従う。",
    "タップできる部品にはリップルと軽い縮小のフィードバックを付け、画面遷移や状態変化には M3 Expressive のスプリングモーション（軽く弾む動き）を使う。「戻る」は入ったときの遷移を逆再生し、システムの戻る操作（戻るジェスチャー・戻るボタン）でも同じ動きにする。",
    "アイコンは Material Symbols Rounded を使う。",
    "エミュレータや実機での動作検証は不要。実装が終わったら release ビルド（Android なら署名済みの release APK）を作成して成果物として出力する。",
  ],
  en: [
    "Use standard components from Jetpack Compose material3 (latest, including the Expressive APIs) or Material Web rather than custom-drawn ones.",
    "Always reference colors through the scheme roles above (primary, surfaceContainer, …) instead of hard-coded values. Light mode only is fine.",
    "Keep 16dp screen margins and 8–16dp between parts, and use the M3 type styles (titleLarge, bodyMedium, …).",
    "Parts described as \"in one row\" must share a single Row (horizontal container) on the same line; never stack them vertically or wrap them. The row is as tall as its tallest part and the others are vertically centered in it.",
    "Parts described as \"layered inside\" a container are drawn on top of that container (a Box with the container as its background). The overlap is intentional: do not separate or reorder them for layout reasons. Later items in the description are drawn in front of earlier ones.",
    "Give every tappable part ripple plus a slight press-scale, and use M3 Expressive spring motion (a light bounce) for transitions and state changes. \"Back\" plays the entry transition in reverse, and the system back gesture / button must do the same.",
    "Use Material Symbols Rounded for icons.",
    "Do not verify on an emulator or a device. When the implementation is done, produce a release build (for Android, a signed release APK) as the deliverable.",
  ],
  zh: [
    "组件使用 Jetpack Compose material3（包含 Expressive API 的最新版）或 Material Web 的标准组件，不要自绘外观。",
    "颜色必须通过上面配色方案的角色名（primary、surfaceContainer 等）引用，不要写死颜色值。只做浅色模式即可。",
    "屏幕边缘留 16dp，组件之间 8〜16dp，排版使用 M3 的字体样式（titleLarge、bodyMedium 等）。",
    "写明“横向排成一行”的组件必须放进同一个 Row（横向容器）并在同一行显示，不要竖着堆叠或换行。行高以最高的组件为准，其余组件垂直居中。",
    "写明“内部叠放”的组件要绘制在该容器（容器框或卡片）之上（以容器为背景的 Box）。这种叠放是有意为之，不要因布局原因拆开或调整顺序。前后关系按描述顺序，后写的在前面。",
    "可点击的组件加涟漪和轻微缩放反馈，屏幕跳转和状态变化使用 M3 Expressive 的弹簧动效（轻微回弹）。“返回”反向播放进入时的过渡动画，系统返回手势／返回键也要做同样的效果。",
    "图标使用 Material Symbols Rounded。",
    "不需要在模拟器或真机上验证。实现完成后生成 release 构建（Android 则为已签名的 release APK）作为交付物。",
  ],
};

/* ---------- fixed phrases ---------- */

const PH = {
  ja: {
    screen: "画面",
    intro: (title: string, brief: string) => `${title}を Material 3 Expressive のデザインで実装してください。${brief ? trimEnd(brief) + "。" : ""}`,
    titleOnly: (name: string) => `${name}画面`,
    titleAll: (n: number) => (n > 1 ? "このアプリ" : "この画面"),
    target: (phone: boolean) => (phone ? "想定はスマホの縦画面で、ライトモード固定です。" : "レイアウトは自由配置で、ライトモード固定です。"),
    hColor: "## カラー",
    dynamic:
      "ダイナミックカラーを使います。Android 12 以降ではユーザーの壁紙から生成されるカラースキーム（dynamicLightColorScheme / dynamicDarkColorScheme）を適用し、それが使えない端末では下の色をフォールバックにしてください。",
    colorIntro: (label: string, fallback: boolean) =>
      fallback
        ? `フォールバック用のテーマは ${label} 系です。Material 3 のライトカラースキームに次の色を設定し、UI の色はすべてこのロール経由で参照してください。`
        : `テーマは ${label} 系です。Material 3 のライトカラースキームに次の色を設定し、UI の色はすべてこのロール経由で参照してください。`,
    hLayout: "## 画面構成",
    empty: "画面にはまだ部品が置かれていません。",
    screens: (names: string[]) => `画面は ${names.length} つあり、${names.join("、")}です。`,
    screenHead: (name: string, bg: string | undefined, has: boolean) => `${name}画面${bg ? `（背景は ${bg}）` : ""}${has ? "は上から順に次の通りです。重なっている部品はその旨を書いています。" : "はまだ空です。"}`,
    loose: "画面の外に置かれている部品（共通パーツや参考）:",
    freeform: "画面を上から順に説明します。",
    hBehavior: "## 振る舞いと画面遷移",
    hStyle: "## 各部品のスタイル",
    styleIntro: "使っている部品ごとの指定です。数値は M3 Expressive の標準値なので、標準コンポーネントで実現できるものは標準に任せてください。",
    hGeneral: "## 全体の指針",
  },
  en: {
    screen: "screen",
    intro: (title: string, brief: string) => `Please implement ${title} in the Material 3 Expressive design language.${brief ? ` ${trimEnd(brief)}.` : ""}`,
    titleOnly: (name: string) => `the ${name} screen`,
    titleAll: (n: number) => (n > 1 ? "this app" : "this screen"),
    target: (phone: boolean) => (phone ? "Target a portrait phone screen, light mode only." : "The layout is free-form, light mode only."),
    hColor: "## Colors",
    dynamic:
      "Use dynamic color: on Android 12+ apply the scheme generated from the user's wallpaper (dynamicLightColorScheme / dynamicDarkColorScheme), and fall back to the colors below where it is unavailable.",
    colorIntro: (label: string, fallback: boolean) =>
      fallback
        ? `The fallback theme is ${label}. Set these on the Material 3 light color scheme and reference every UI color through its role.`
        : `The theme is ${label}. Set these on the Material 3 light color scheme and reference every UI color through its role.`,
    hLayout: "## Layout",
    empty: "Nothing has been placed on the screen yet.",
    screens: (names: string[]) => `There are ${names.length} screens: ${names.join(", ")}.`,
    screenHead: (name: string, bg: string | undefined, has: boolean) => `The ${name} screen${bg ? ` (background ${bg})` : ""}${has ? ", from top to bottom (overlapping parts are called out as such):" : " is still empty."}`,
    loose: "Parts placed outside the screens (shared parts or references):",
    freeform: "The screen, from top to bottom:",
    hBehavior: "## Behavior and navigation",
    hStyle: "## Component styles",
    styleIntro: "Per-component notes for the parts in use. The numbers are the M3 Expressive defaults, so let the standard components handle whatever they already do.",
    hGeneral: "## General guidance",
  },
  zh: {
    screen: "屏幕",
    intro: (title: string, brief: string) => `请用 Material 3 Expressive 的设计实现${title}。${brief ? trimEnd(brief) + "。" : ""}`,
    titleOnly: (name: string) => `${name}屏幕`,
    titleAll: (n: number) => (n > 1 ? "这个应用" : "这个屏幕"),
    target: (phone: boolean) => (phone ? "目标为竖屏手机，只做浅色模式。" : "布局为自由排布，只做浅色模式。"),
    hColor: "## 配色",
    dynamic:
      "使用动态配色：在 Android 12 及以上应用由用户壁纸生成的配色方案（dynamicLightColorScheme / dynamicDarkColorScheme），不支持的设备则使用下面的颜色作为备用。",
    colorIntro: (label: string, fallback: boolean) =>
      fallback
        ? `备用主题为 ${label} 系。请在 Material 3 的浅色配色方案中设置以下颜色，UI 的所有颜色都通过这些角色引用。`
        : `主题为 ${label} 系。请在 Material 3 的浅色配色方案中设置以下颜色，UI 的所有颜色都通过这些角色引用。`,
    hLayout: "## 屏幕结构",
    empty: "屏幕上还没有放置任何组件。",
    screens: (names: string[]) => `共有 ${names.length} 个屏幕：${names.join("、")}。`,
    screenHead: (name: string, bg: string | undefined, has: boolean) => `${name}屏幕${bg ? `（背景为 ${bg}）` : ""}${has ? "从上到下依次如下（重叠的组件会特别说明）：" : "目前为空。"}`,
    loose: "放在屏幕之外的组件（公共部件或参考）：",
    freeform: "从上到下说明屏幕内容：",
    hBehavior: "## 行为与屏幕跳转",
    hStyle: "## 各组件的样式",
    styleIntro: "以下是所用组件的规格。数值均为 M3 Expressive 的标准值，能用标准组件实现的就交给标准组件。",
    hGeneral: "## 整体原则",
  },
};

export function buildPrompt(doc: Doc, widths: Record<string, number>, onlyFrameId?: string, lang: Lang = getLang()): string {
  const pal = (doc.paletteKey === "custom" && doc.customPalette) || PALETTES.find((p) => p.key === doc.paletteKey) || PALETTES[0];
  const phone = doc.frame === "phone";
  const allFrames = phone ? doc.frames : [];
  const only = onlyFrameId ? allFrames.find((f) => f.id === onlyFrameId) : undefined;
  const frames = only ? [only] : allFrames;
  /* canvas order is the layer order; rows are worked out per screen. A hand-made
   * group is written part by part, since it exists only to move things together. */
  const groups = doc.groups
    .filter((g) => !only || frameOfGroup(g, allFrames, widths)?.id === only.id)
    .flatMap((g) => explodeGroup(g, widths));
  const lines: string[] = [];
  const q = quote(lang);
  const ph = PH[lang];

  const byFrame = new Map<string, Group[]>();
  const loose: Group[] = [];
  for (const g of groups) {
    const f = frameOfGroup(g, allFrames, widths);
    if (f && frames.some((x) => x.id === f.id)) byFrame.set(f.id, [...(byFrame.get(f.id) ?? []), g]);
    else if (!f) loose.push(g);
  }

  const kindsUsed: Kind[] = [];
  let sheet = false;
  for (const g of groups)
    for (const it of g.items) {
      if (!kindsUsed.includes(it.kind)) kindsUsed.push(it.kind);
      if (it.kind === "box" && it.checked) sheet = true;
    }
  const styleNotes = kindsUsed
    .map((k) => (k === "box" && sheet ? STYLE_NOTES[lang].boxSheet : STYLE_NOTES[lang][k]))
    .filter((s): s is string => !!s);

  const title = only ? ph.titleOnly(q(only.name || ph.screen)) : doc.title.trim() || ph.titleAll(frames.length);
  lines.push(ph.intro(title, doc.brief.trim()));
  lines.push(ph.target(phone));

  lines.push("");
  lines.push(ph.hColor);
  if (doc.dynamicColor) lines.push(ph.dynamic);
  lines.push(ph.colorIntro(pal.label, !!doc.dynamicColor));
  lines.push(...paletteLines(pal));

  lines.push("");
  lines.push(ph.hLayout);
  if (groups.length === 0) {
    lines.push(ph.empty);
  } else if (frames.length > 0) {
    if (frames.length > 1) lines.push(ph.screens(frames.map((f) => q(f.name || ph.screen))));
    frames.forEach((f, i) => {
      const gs = byFrame.get(f.id) ?? [];
      if (i > 0 || frames.length > 1) lines.push("");
      lines.push(ph.screenHead(q(f.name || ph.screen), f.bg && f.bg !== "surface" ? f.bg : undefined, gs.length > 0));
      describeScreen(lines, gs, { l: f.x, t: f.y, r: f.x + PHONE_W, b: f.y + PHONE_H }, widths, lang);
    });
    if (loose.length && !only) {
      lines.push("");
      lines.push(ph.loose);
      describeScreen(lines, loose, null, widths, lang);
    }
  } else {
    lines.push(ph.freeform);
    describeScreen(lines, groups, null, widths, lang);
  }

  const behavior = [...groups.flatMap((g) => notes(g, allFrames, lang)), ...frames.flatMap((f) => swipeNotes(f, allFrames, lang))];
  if (behavior.length) {
    lines.push("");
    lines.push(ph.hBehavior);
    for (const n of behavior) lines.push(`- ${n}`);
  }

  if (styleNotes.length) {
    lines.push("");
    lines.push(ph.hStyle);
    lines.push(ph.styleIntro);
    for (const s of styleNotes) lines.push(`- ${s}`);
  }

  lines.push("");
  lines.push(ph.hGeneral);
  for (const s of GENERAL[lang]) lines.push(`- ${s}`);
  return lines.join("\n");
}
