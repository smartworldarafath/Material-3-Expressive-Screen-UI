"use client";

import { createContext, useContext } from "react";

export type Lang = "ja" | "en";
export const LANGS: Lang[] = ["ja", "en"];

/* A module-level copy lets non-React helpers (item defaults, prompt text)
 * follow the language without threading it through every call. */
let current: Lang = "ja";
export const getLang = () => current;
export const setGlobalLang = (l: Lang) => {
  current = l;
};

export const LangContext = createContext<Lang>("ja");
export const useLang = () => useContext(LangContext);

const UI = {
  // panels
  parts: { ja: "部品", en: "Parts" },
  edit: { ja: "編集", en: "Edit" },
  prompt: { ja: "プロンプト", en: "Prompt" },
  closePanel: { ja: "パネルを閉じる", en: "Close panel" },
  search: { ja: "検索", en: "Search" },
  favorites: { ja: "お気に入り", en: "Favorites" },
  addFavorite: { ja: "お気に入りに追加", en: "Add to favorites" },
  removeFavorite: { ja: "お気に入りから外す", en: "Remove from favorites" },
  clear: { ja: "クリア", en: "Clear" },
  language: { ja: "Language / 言語", en: "Language / 言語" },
  // toolbar
  select: { ja: "選択 (V)", en: "Select (V)" },
  hand: { ja: "手のひら (H / Space)", en: "Hand (H / Space)" },
  blank: { ja: "白紙", en: "Blank canvas" },
  phone: { ja: "スマホ画面", en: "Phone screens" },
  addFrame: { ja: "画面を追加", en: "Add screen" },
  preview: { ja: "プレビュー (P)", en: "Preview (P)" },
  zoomIn: { ja: "拡大 (+)", en: "Zoom in (+)" },
  zoomOut: { ja: "縮小 (-)", en: "Zoom out (-)" },
  fit: { ja: "全体を表示 (0)", en: "Fit (0)" },
  undo: { ja: "元に戻す (Ctrl+Z)", en: "Undo (Ctrl+Z)" },
  redo: { ja: "やり直す (Ctrl+Shift+Z)", en: "Redo (Ctrl+Shift+Z)" },
  clearAll: { ja: "すべて消す", en: "Clear canvas" },
  // inspector
  screen: { ja: "画面", en: "Screen" },
  screenName: { ja: "画面の名前", en: "Screen name" },
  name: { ja: "名前", en: "Name" },
  background: { ja: "背景", en: "Background" },
  export: { ja: "書き出し", en: "Export" },
  copied: { ja: "コピーしました", en: "Copied" },
  saveImage: { ja: "画像で保存", en: "Save as image" },
  saving: { ja: "保存中…", en: "Saving…" },
  previewFrom: { ja: "この画面からプレビュー", en: "Preview from this screen" },
  duplicate: { ja: "複製", en: "Duplicate" },
  duplicateKey: { ja: "複製 (Ctrl+D)", en: "Duplicate (Ctrl+D)" },
  delete: { ja: "削除 (Delete)", en: "Delete (Delete)" },
  deleteSelection: { ja: "選択を削除", en: "Delete selection" },
  text: { ja: "テキスト", en: "Text" },
  label: { ja: "ラベル", en: "Label" },
  bold: { ja: "太字", en: "Bold" },
  action: { ja: "アクション", en: "Action" },
  supporting: { ja: "サブテキスト", en: "Supporting text" },
  tabs: { ja: "項目", en: "Items" },
  changeIcon: { ja: "アイコンを変更", en: "Change icon" },
  image: { ja: "画像", en: "Image" },
  pickImage: { ja: "画像を選ぶ", en: "Choose image" },
  removeImage: { ja: "画像を外す", en: "Remove image" },
  icon: { ja: "アイコン", en: "Icon" },
  noIcon: { ja: "アイコンなし", en: "No icon" },
  searchIcons: { ja: "アイコンを検索", en: "Search icons" },
  style: { ja: "スタイル", en: "Style" },
  state: { ja: "状態", en: "State" },
  selected: { ja: "選択", en: "Selected" },
  handle: { ja: "ハンドル", en: "Handle" },
  on: { ja: "オン", en: "On" },
  container: { ja: "コンテナ", en: "Container" },
  wavy: { ja: "波形", en: "Wavy" },
  determinate: { ja: "確定", en: "Determinate" },
  size: { ja: "サイズ", en: "Size" },
  width: { ja: "幅", en: "Width" },
  height: { ja: "高さ", en: "Height" },
  fontSize: { ja: "文字サイズ", en: "Font size" },
  cornerRadius: { ja: "角丸", en: "Corner radius" },
  cornerTop: { ja: "上の角丸", en: "Top corners" },
  cornerBottom: { ja: "下の角丸", en: "Bottom corners" },
  screenWidth: { ja: "画面いっぱい", en: "Screen width" },
  contentWidth: { ja: "左右 16dp の余白", en: "16dp side margins" },
  halfWidth: { ja: "2 列に並べる幅", en: "Half a row (two columns)" },
  screenHeight: { ja: "画面の高さ", en: "Screen height" },
  halfHeight: { ja: "画面の半分", en: "Half the screen" },
  tapTo: { ja: "タップで移動", en: "Tap to open" },
  none: { ja: "なし", en: "None" },
  behavior: { ja: "振る舞い", en: "Behavior" },
  whenPressed: { ja: "押したとき…", en: "When pressed…" },
  whatItDoes: { ja: "この部品の動き…", en: "What this part does…" },
  removeLink: { ja: "リンクを外す", en: "Remove link" },
  // prompt panel
  brief: { ja: "この画面の目的や全体の動き…", en: "Purpose of this screen, overall flow…" },
  copyPrompt: { ja: "プロンプトをコピー", en: "Copy prompt" },
  // preview
  back: { ja: "戻る", en: "Back" },
  close: { ja: "閉じる (Esc)", en: "Close (Esc)" },
  // parts content
  cancel: { ja: "キャンセル", en: "Cancel" },
  ok: { ja: "OK", en: "OK" },
  leading: { ja: "先頭", en: "Leading" },
  trailing: { ja: "末尾", en: "Trailing" },
  // frames
  home: { ja: "ホーム", en: "Home" },
  screenN: { ja: "画面", en: "Screen" },
  copySuffix: { ja: " コピー", en: " copy" },
  // mobile
  mobileNote: { ja: "フル機能は PC のブラウザで使えます", en: "Full features on a desktop browser" },
  addButton: { ja: "ボタンを追加", en: "Add button" },
  done: { ja: "完了", en: "Done" },
  theme: { ja: "テーマ", en: "Theme" },
  settings: { ja: "テーマと設定", en: "Theme and settings" },
} as const;

export type UIKey = keyof typeof UI;

export const t = (key: UIKey, lang: Lang = current): string => UI[key][lang];

/* ---- part defaults and nouns ---- */

export const KIND_TEXT: Record<
  Lang,
  Record<string, { noun: string; label?: string; supporting?: string }>
> = {
  ja: {
    box: { noun: "ボックス" },
    button: { noun: "ボタン", label: "ボタン" },
    iconButton: { noun: "アイコンボタン" },
    fab: { noun: "FAB（フローティングボタン）" },
    extendedFab: { noun: "拡張 FAB", label: "作成" },
    chip: { noun: "チップ", label: "チップ" },
    topAppBar: { noun: "トップアプリバー", label: "タイトル" },
    bottomNav: { noun: "ナビゲーションバー" },
    searchBar: { noun: "検索バー", label: "検索" },
    card: { noun: "カード", label: "カードの見出し", supporting: "補足テキストがここに入ります。" },
    listItem: { noun: "リスト項目", label: "リスト項目", supporting: "サブテキスト" },
    dialog: { noun: "ダイアログ", label: "確認", supporting: "この操作を実行しますか？" },
    snackbar: { noun: "スナックバー", label: "保存しました", supporting: "元に戻す" },
    textField: { noun: "テキスト入力", label: "ラベル" },
    switch: { noun: "スイッチ", label: "通知" },
    checkbox: { noun: "チェックボックス", label: "同意する" },
    slider: { noun: "スライダー" },
    text: { noun: "テキスト", label: "見出し" },
    image: { noun: "画像" },
    divider: { noun: "区切り線" },
    loadingIndicator: { noun: "ローディングインジケータ" },
    linearProgress: { noun: "リニアプログレス" },
    circularProgress: { noun: "サーキュラープログレス" },
  },
  en: {
    box: { noun: "box" },
    button: { noun: "button", label: "Button" },
    iconButton: { noun: "icon button" },
    fab: { noun: "FAB" },
    extendedFab: { noun: "extended FAB", label: "Create" },
    chip: { noun: "chip", label: "Chip" },
    topAppBar: { noun: "top app bar", label: "Title" },
    bottomNav: { noun: "navigation bar" },
    searchBar: { noun: "search bar", label: "Search" },
    card: { noun: "card", label: "Card headline", supporting: "Supporting text goes here." },
    listItem: { noun: "list item", label: "List item", supporting: "Supporting text" },
    dialog: { noun: "dialog", label: "Confirm", supporting: "Do you want to continue?" },
    snackbar: { noun: "snackbar", label: "Saved", supporting: "Undo" },
    textField: { noun: "text field", label: "Label" },
    switch: { noun: "switch", label: "Notifications" },
    checkbox: { noun: "checkbox", label: "I agree" },
    slider: { noun: "slider" },
    text: { noun: "text", label: "Headline" },
    image: { noun: "image" },
    divider: { noun: "divider" },
    loadingIndicator: { noun: "loading indicator" },
    linearProgress: { noun: "linear progress indicator" },
    circularProgress: { noun: "circular progress indicator" },
  },
};

export const NAV_TABS: Record<Lang, { icon: string; label: string }[]> = {
  ja: [
    { icon: "home", label: "ホーム" },
    { icon: "search", label: "検索" },
    { icon: "favorite", label: "保存" },
    { icon: "settings", label: "設定" },
  ],
  en: [
    { icon: "home", label: "Home" },
    { icon: "search", label: "Search" },
    { icon: "favorite", label: "Saved" },
    { icon: "settings", label: "Settings" },
  ],
};

export const TRANSITION_TEXT: Record<Lang, Record<string, string>> = {
  ja: { slide: "横スライド", fade: "フェード", expand: "拡大", none: "アニメーションなし" },
  en: { slide: "a horizontal slide", fade: "a fade", expand: "an expand", none: "no animation" },
};
