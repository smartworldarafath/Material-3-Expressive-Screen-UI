<p align="center">
  <img src="app/icon.svg" width="72" alt="" />
</p>

<h1 align="center">M3E Canvas</h1>

<p align="center">
  <strong>Sketch Material 3 Expressive screens in the browser, link them, tap through them, and copy a prompt for your AI coding tool.</strong>
</p>

<p align="center">
  <a href="https://lnkiai.github.io/m3e-canvas/"><img alt="Live demo" src="https://img.shields.io/badge/demo-lnkiai.github.io%2Fm3e--canvas-6750A4?logo=googlechrome&logoColor=white" /></a>
  <a href="https://github.com/lnkiai/m3e-canvas/actions/workflows/deploy.yml"><img alt="Deploy" src="https://github.com/lnkiai/m3e-canvas/actions/workflows/deploy.yml/badge.svg" /></a>
  <a href="LICENSE"><img alt="MIT License" src="https://img.shields.io/badge/license-MIT-blue.svg" /></a>
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs" />
  <img alt="React" src="https://img.shields.io/badge/React-19-20232a?logo=react&logoColor=61DAFB" />
  <img alt="Material 3 Expressive" src="https://img.shields.io/badge/Material%203-Expressive-EADDFF?logo=materialdesign&logoColor=6750A4" />
  <img alt="No backend" src="https://img.shields.io/badge/backend-none%20(localStorage)-2E6A45" />
</p>

<p align="center">
  <a href="#日本語">日本語</a> · <a href="https://lnkiai.github.io/m3e-canvas/">Open the app</a>
</p>

![The M3E Canvas editor with two linked screens](docs/editor.png)

## What it does

- **Drag-and-drop parts** – buttons, icon buttons, FABs, chips, app bars, navigation bars, search bars, cards, lists, dialogs, snackbars, text fields, switches, checkboxes, sliders, text, images, boxes and dividers, all drawn to Material 3 Expressive.
- **Magnetic connections** – bring two buttons or list items close and they fuse into a connected group; the corners soften as they meet.
- **Real M3 Expressive loading** – the shape-morphing Loading Indicator (ported from material-components-android) and wavy linear / circular progress indicators.
- **Phone screens** – add as many screens as you like, name them, pick a background, and drag a screen to move everything on it.
- **Tap to navigate** – give any tappable part a target screen and a transition (slide, fade, expand, none). Arrows show the flow on the canvas and the preview lets you actually tap through it.
- **Prompt output** – the whole design (or a single screen) becomes a concise natural-language prompt in Japanese or English, including your own notes on what each part does.
- **Export** – copy the prompt or save a screen as a PNG.
- **Alignment guides**, undo/redo, keyboard shortcuts, seven color themes, a favorites row in the parts panel, and everything is saved in your browser (localStorage).
- **Phone-friendly** – on a phone you get one fixed screen and a buttons-only editor: tap the plus to add a button, tap a button to move it, and edit its text, icon and style in a bottom sheet. The full multi-screen editor is for desktop browsers.

<table>
  <tr>
    <td width="50%"><img src="docs/preview.png" alt="Tap-through preview" /><br /><sub>Preview: tap a part and the linked screen slides in.</sub></td>
    <td width="50%"><img src="docs/prompt.png" alt="Prompt panel" /><br /><sub>Prompt: the design as a concise brief, in Japanese or English.</sub></td>
  </tr>
</table>

<p align="center"><img src="docs/mobile.png" width="240" alt="Phone version" /><br /><sub>Phone: one screen, buttons only, edited in a bottom sheet.</sub></p>

## Keyboard

| Key | Action |
| --- | --- |
| `V` / `H` | Select / hand tool (hold `Space` to pan) |
| Wheel, `Ctrl` + wheel | Pan, zoom |
| `+` `-` `0` | Zoom in, zoom out, fit |
| `Ctrl+Z` / `Ctrl+Shift+Z` | Undo / redo |
| `Ctrl+D` | Duplicate |
| Arrows (`Shift` = 10) | Nudge |
| `Delete` | Delete part or screen |
| `P` | Preview |

## Develop

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static export to ./out
```

The app is a static Next.js export. To host it under a sub-path (for example a GitHub Pages project site), set `NEXT_PUBLIC_BASE_PATH=/your-repo` at build time. `.github/workflows/deploy.yml` does this automatically and publishes `out/` to GitHub Pages on every push to `main`.

## Credits

- Loading indicator shapes and animation model: [material-components-android](https://github.com/material-components/material-components-android) (Apache-2.0) via [Aler1x/m3-loading-indicator](https://github.com/Aler1x/m3-loading-indicator). See `NOTICE`.
- Icons: [Material Symbols](https://fonts.google.com/icons) (Apache-2.0). Fonts are loaded from Google Fonts.

## See also

- [matraic/m3e](https://github.com/matraic/m3e) – Material 3 Expressive as Lit web components (MIT), with React bindings and an icon package. A good home for the screens you sketch here.

## License

MIT © lnkiai

---

## 日本語

**Material 3 Expressive の画面をブラウザで組み立てて、画面同士をつなぎ、タップして確かめ、そのまま AI コーディング用のプロンプトにするツールです。**

公開版: https://lnkiai.github.io/m3e-canvas/

![M3E Canvas のエディタ画面](docs/editor.png)

### できること

- **ドラッグ＆ドロップ** – ボタン、アイコンボタン、FAB、チップ、アプリバー、ナビゲーションバー、検索バー、カード、リスト、ダイアログ、スナックバー、テキスト入力、スイッチ、チェックボックス、スライダー、テキスト、画像、ボックス、区切り線。
- **磁石のような連結** – ボタンやリスト項目を近づけると 1 つのグループにくっつき、角が溶けてつながります。
- **本物の M3 Expressive ローディング** – 形が変化する Loading Indicator（Android 実装からの移植）と、波形のリニア／サーキュラープログレス。
- **スマホ画面** – 画面を何枚でも追加して名前や背景色を付け、画面ごと動かせます。
- **タップで遷移** – 部品に移動先の画面と遷移（スライド／フェード／拡大／なし）を設定。キャンバスに矢印が出て、プレビューでは実際にタップして確かめられます。
- **プロンプト出力** – デザイン全体、または 1 画面だけを、日本語か英語の簡潔な文章にします。部品ごとの「振る舞い」メモもそのまま入ります。
- **書き出し** – プロンプトのコピー、画面の PNG 保存。
- **補助線スナップ**、Undo/Redo、キーボードショートカット、7 種のカラーテーマ、お気に入り部品。作業内容はブラウザ（localStorage）に自動保存されます。
- **スマホでも** – スマホでは 1 画面固定のボタン専用エディタになります。プラスでボタンを追加し、タップして動かし、ボトムシートでテキスト・アイコン・スタイルを編集できます。複数画面のフル機能は PC のブラウザ向けです。

### 開発

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # ./out に静的書き出し
```

静的サイトとして書き出す構成です。サブパス（GitHub Pages のプロジェクトサイトなど）で配信するときはビルド時に `NEXT_PUBLIC_BASE_PATH=/リポジトリ名` を指定してください。`.github/workflows/deploy.yml` が `main` への push ごとにこれを行い、GitHub Pages に公開します。

### ライセンス

MIT © lnkiai
