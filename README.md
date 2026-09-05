<p align="center">
  <img src="app/icon.svg" width="72" alt="Material 3 Expressive Logo" />
</p>

<h1 align="center">Material 3 Expressive Screen UI</h1>

<p align="center">
  <strong>Design, assemble, and test interactive Material 3 Expressive user interfaces directly in your browser, and instantly transform your visual layouts into rich prompts for AI coding assistants.</strong>
</p>

<p align="center">
  <a href="https://smartworldarafath.github.io/Material-3-Expressive-Screen-UI/"><img alt="Live Demo" src="https://img.shields.io/badge/demo-Live%20Preview-6750A4?logo=googlechrome&logoColor=white" /></a>
  <a href="https://github.com/smartworldarafath/Material-3-Expressive-Screen-UI/actions/workflows/deploy.yml"><img alt="Deploy Status" src="https://img.shields.io/badge/Deploy%20Status-deploy-6750A4?logo=github" /></a>
  <a href="LICENSE"><img alt="MIT License" src="https://img.shields.io/badge/license-MIT-blue.svg" /></a>
  <a href="https://github.com/sponsors/smartworldarafath"><img alt="Become a Sponsor" src="https://img.shields.io/badge/sponsor-%E2%9D%A4-EA4AAA?logo=githubsponsors&logoColor=white" /></a>
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs" />
  <img alt="React" src="https://img.shields.io/badge/React-19-20232a?logo=react&logoColor=61DAFB" />
  <img alt="Material 3 Expressive" src="https://img.shields.io/badge/Material%203-Expressive-EADDFF?logo=materialdesign&logoColor=6750A4" />
  <img alt="Client-Side Only" src="https://img.shields.io/badge/backend-zero%20(localStorage)-2E6A45" />
</p>

<p align="center">
  <a href="https://smartworldarafath.github.io/Material-3-Expressive-Screen-UI/"><strong>🚀 Open the Live Application</strong></a> · <a href="#core-features">Features</a> · <a href="#keyboard-shortcuts">Shortcuts</a> · <a href="#sponsoring--support">Sponsor & Donate</a> · <a href="#contributors">Contributors</a>
</p>

![Demonstrating screen composition, palette adjustment, prompt generation, and Android deployment](docs/story.gif)

<p align="center"><sub>Construct a recipes interface, re-theme dynamic hues, synthesize an AI prompt, pass it to an autonomous coding agent, and execute on Android. (<a href="docs/story.mp4">mp4 video walkthrough</a>)</sub></p>

Compatible out of the box with modern AI programming agents and vibe-coding environments such as Claude Code, Codex, Gemini CLI, Cursor, and ChatGPT: copy the generated prompt, hand it to your AI tool, and watch your application come to life.

---

## Core Features

- **Intuitive Drag-and-Drop Canvas**: Effortlessly position buttons, floating action buttons (FABs), split action buttons, expandable FAB menus, filter chips, top application bars, bottom navigation bars, floating utility toolbars, segmented tabs, search inputs, elevated cards, interactive lists, modal dialogs, snackbars, text inputs, dropdown selectors, switches, checkboxes, radio groups, sliders, badges, media containers, and camera or map placeholders.
- **Magnetic Docking & Corner Blending**: Snap related widgets together—neighbouring buttons and list tiles fuse into unified visual groups with organically softened corner transitions.
- **Authentic M3 Expressive Morphing Loaders**: Experience genuine Android shape-shifting loading indicators and expressive undulating circular/linear progress bars.
- **Dual-Viewport Architecture (Phone & Desktop)**: Create unlimited screens, assign custom names and canvas tones, and drag complete screens freely. Seamlessly toggle between a standard mobile viewport (412×892) and an expanded desktop display (1280×800). Navigation bars gracefully transform into vertical navigation rails and layouts fluidly reposition.
- **Interactive Wireframing & Flow Navigation**: Link buttons, navigation items, or app bar icons to target screens (or navigate back) using animated transitions including directional slides, subtle fades, scale expansions, or instant switches. Canvas flow arrows clearly illustrate user journeys, and the built-in prototype preview allows live walkthroughs.
- **Gesture-Driven Swipe Navigation**: Configure bidirectional swipe gestures (left, right, up, down) with fluid physics in the live preview.
- **Interactive State Toggles**: Configure buttons to toggle between on/off states with customizable dynamic icons and visual styles.
- **Hierarchical Layer Stack & Grouping**: Inspect z-index elevation and hierarchy within the layer inspector. Reorder items, group multi-part selections to preserve spatial relationships, and maintain clean layout semantics for AI synthesis.
- **Unified Expressive Theming Engine**: Calibrate the four pillars of Material 3 Expressive. Select from 7 curated palettes or generate a complete M3 tonal scheme from a single base color. Toggle between light and dark modes, adjust contrast tiers, and configure wallpaper-adaptive dynamic colors. Seamlessly modify shape curvature (square, rounded, full pill) and typography scales.
- **Automated AI Prompt Synthesis**: Transform your entire prototype or an isolated screen into a clear, comprehensive, and deterministic prompt tailored for Android (Jetpack Compose) or modern Web frameworks.
- **One-Click Layout Tidy**: Instantly snap app bars to viewport boundaries, position floating actions in ideal corners, connect adjacent elements, and normalize layout spacing to 16dp gutters.
- **Privacy-First Local Storage**: Completely browser-resident with zero server dependencies. Your designs never leave your machine unless you share them.
- **Direct-to-Provider AI Assistant (Optional)**: Bring your own API key (Anthropic Claude, OpenAI, Google Gemini, or DeepSeek) to autonomously draft component behavior notes and screen descriptions. Keys remain strictly within your browser.
- **Export & Portability**: Copy synthesized prompts, download high-resolution PNG screen captures, or generate shareable stateless URL links embedding the compressed document.
- **Responsive Mobile Companion**: Access a streamlined, single-screen mobile editor directly on phones to construct and tweak buttons on the go.

<table>
  <tr>
    <td width="50%"><img src="docs/preview.png" alt="Interactive prototype preview" /><br /><sub><strong>Interactive Preview:</strong> Test real clicks, tap transitions, and back-stack history.</sub></td>
    <td width="50%"><img src="docs/prompt.png" alt="AI prompt synthesis" /><br /><sub><strong>Prompt Generator:</strong> Generates structured design specifications ready for AI coding tools.</sub></td>
  </tr>
</table>

<p align="center"><img src="docs/mobile.png" width="240" alt="Mobile companion mode" /><br /><sub><strong>Mobile View:</strong> Compact button and component editor with modal sheet customization.</sub></p>

---

## Keyboard Shortcuts

| Shortcut | Functionality |
| --- | --- |
| `V` / `H` | Toggle Select mode / Hand pan mode (or hold `Space` to pan) |
| Mouse Wheel, `Ctrl` + Wheel | Pan canvas vertically, Zoom canvas in/out |
| `+` / `-` / `0` | Zoom in, Zoom out, Fit canvas to viewport |
| `Ctrl + Z` / `Ctrl + Shift + Z` | Undo last operation / Redo operation |
| `Ctrl + D` | Duplicate active selection |
| Arrow Keys (`Shift` = 10px) | Nudge selected element(s) precisely |
| `Delete` / `Backspace` | Remove selected component or screen |
| `P` | Launch interactive prototype preview |

---

## Development Setup

To run the project locally or contribute improvements:

```bash
# Clone the repository
git clone https://github.com/smartworldarafath/Material-3-Expressive-Screen-UI.git
cd Material-3-Expressive-Screen-UI

# Install dependencies
npm install

# Start development server
npm run dev        # Visit http://localhost:3000

# Type verification and test execution
npm run typecheck  # TypeScript check
npm test           # Vitest unit test suite

# Produce static production build
npm run build      # Static export generated into ./out
```

### GitHub Pages Deployment

The application is deployed as a fully static website. When serving under a GitHub repository path, set `NEXT_PUBLIC_BASE_PATH=/Material-3-Expressive-Screen-UI` during compilation. The automated workflow `.github/workflows/deploy.yml` takes care of static generation and publishing on every push to the `main` branch.

---

## Maintainer & Creator

This repository is maintained and developed by:

<p align="left">
  <a href="https://github.com/smartworldarafath">
    <img src="https://github.com/smartworldarafath.png?size=100" width="80" height="80" style="border-radius:50%;" alt="Arafath Rahman" />
  </a>
</p>

**Arafath Rahman** ([@smartworldarafath](https://github.com/smartworldarafath))  
*Full-Stack & UI/UX Developer | Open Source Enthusiast*  
Passionate about engineering next-generation design systems, expressive user interfaces, and bridging visual design with autonomous AI coding agents.

---

## Sponsoring & Support

Material 3 Expressive Screen UI is completely free, open-source software under the MIT License. 

If this tool enhances your productivity, streamlines your UI prototypes, or saves you hours of coding, please consider supporting ongoing maintenance and new feature development:

💖 **[Sponsor Arafath on GitHub Sponsors](https://github.com/sponsors/smartworldarafath)**

You can also support directly via **nsave** or **RedotPay** using the QR codes below:

<table>
  <tr>
    <td align="center" width="50%">
      <img src="docs/nsave_qr.jpg" width="220" alt="nsave QR Code" /><br />
      <sub><b>nsave</b></sub><br />
      <sub>Scan to send support via nsave (@arafath_rahman9)</sub>
    </td>
    <td align="center" width="50%">
      <img src="docs/redotpay_qr.jpg" width="220" alt="RedotPay QR Code" /><br />
      <sub><b>RedotPay</b></sub><br />
      <sub>Scan to send support via RedotPay</sub>
    </td>
  </tr>
</table>

Your sponsorship directly funds time spent refining components, tuning prompt generation models, and expanding capabilities. No features are gated behind payment.

---

## Contributors

Special thanks to all the talented individuals who have contributed code, design feedback, and improvements to this project:

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/smartworldarafath">
        <img src="https://github.com/smartworldarafath.png?size=80" width="70" height="70" style="border-radius:50%;" alt="smartworldarafath" /><br />
        <sub><b>Arafath Rahman</b></sub>
      </a><br />
      <sub>Maintainer & Lead</sub>
    </td>
    <td align="center">
      <a href="https://github.com/lnkiai">
        <img src="https://github.com/lnkiai.png?size=80" width="70" height="70" style="border-radius:50%;" alt="lnkiai" /><br />
        <sub><b>lnkiai</b></sub>
      </a><br />
      <sub>Contributor</sub>
    </td>
    <td align="center">
      <a href="https://github.com/rishabhiskawai">
        <img src="https://github.com/rishabhiskawai.png?size=80" width="70" height="70" style="border-radius:50%;" alt="rishabhiskawai" /><br />
        <sub><b>rishabhiskawai</b></sub>
      </a><br />
      <sub>Contributor</sub>
    </td>
    <td align="center">
      <a href="https://github.com/jungminjo">
        <img src="https://github.com/jungminjo.png?size=80" width="70" height="70" style="border-radius:50%;" alt="jungminjo" /><br />
        <sub><b>jungminjo</b></sub>
      </a><br />
      <sub>Contributor</sub>
    </td>
    <td align="center">
      <a href="https://github.com/CQMHV">
        <img src="https://github.com/CQMHV.png?size=80" width="70" height="70" style="border-radius:50%;" alt="CQMHV" /><br />
        <sub><b>CQMHV</b></sub>
      </a><br />
      <sub>Contributor</sub>
    </td>
    <td align="center">
      <a href="https://github.com/Cokedog320">
        <img src="https://github.com/Cokedog320.png?size=80" width="70" height="70" style="border-radius:50%;" alt="Cokedog320" /><br />
        <sub><b>Cokedog320</b></sub>
      </a><br />
      <sub>Contributor</sub>
    </td>
  </tr>
</table>

Contributions, bug reports, and suggestions are always warmly welcomed! Please consult [CONTRIBUTING.md](CONTRIBUTING.md) to get involved.

---

## Credits & Attributions

- **Loading Indicator Mechanics**: Ported from [material-components-android](https://github.com/material-components/material-components-android) (Apache-2.0) based on [Aler1x/m3-loading-indicator](https://github.com/Aler1x/m3-loading-indicator). See `NOTICE`.
- **System Icons**: [Material Symbols](https://fonts.google.com/icons) (Apache-2.0) provided by Google Fonts.
- **Related Inspirations**:
  - [matraic/m3e](https://github.com/matraic/m3e) – Material 3 Expressive as Lit web components.
  - [Beer CSS](https://www.beercss.com/) – Material Design 3 CSS framework.

---

## License

This project is licensed under the [MIT License](LICENSE) © 2026 Arafath Rahman and Contributors.
