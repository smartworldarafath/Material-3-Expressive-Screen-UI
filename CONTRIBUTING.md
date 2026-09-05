# Contributing to Material 3 Expressive Screen UI

Thank you for your interest in contributing! This document outlines guidelines for reporting issues, proposing enhancements, and submitting pull requests.

## Getting Started

- **Bug Reports & Minor Fixes**: Feel free to submit an issue or open a pull request directly.
- **New Components, Panels, or Prompt Refinements**: Please open an issue beforehand so we can align on design specs and implementation strategy prior to investing significant development time. Material 3 Expressive follows strict design tokens and naming conventions, and prompt templates are finely tuned.
- **Inquiries & Ideas**: Join the conversation in [Discussions](https://github.com/smartworldarafath/Material-3-Expressive-Screen-UI/discussions).

## Local Development Setup

```bash
npm install
npm run dev        # Launch local server at http://localhost:3000
npm run typecheck  # Run TypeScript verification (tsc --noEmit)
npm test           # Execute Vitest test suite
npm run build      # Perform static site export into out/
```

Node 22.12 or newer is required (the test suite needs it); CI uses Node 22. The app is a single Next.js page with no server; everything is stored in the browser.

## Where things live

| Area | Files |
|---|---|
| Part definitions, sizes, corners, theme | `lib/tokens.ts` |
| UI strings and part defaults (ja / en / zh / ko) | `lib/i18n.ts` |
| Drawing a part | `components/M3Node.tsx` |
| Editing a part (desktop / phone) | `components/Inspector.tsx`, `components/Mobile.tsx` |
| Tap-through preview | `components/Preview.tsx` |
| Prompt text (ja / en / zh / ko) | `lib/prompt.ts` |
| Color schemes | `lib/color.ts`, `components/ColorPanel.tsx` |
| Shape / type / motion panels | `components/ThemePanel.tsx` |
| The editor itself | `app/page.tsx` |

### Adding a part

A new kind touches all of these; the existing kinds are the reference:

1. `Kind`, `KIND_SPEC`, `KIND_ORDER` and, if needed, `sizeOf` / `baseRadii` / `iconSlotsOf` in `lib/tokens.ts`
2. `KIND_TEXT` for all four languages in `lib/i18n.ts`
3. Rendering in `components/M3Node.tsx` (and `MEASURED` / `NO_BOX` when it applies)
4. The item sentence in `itemJa`, `itemEn`, `itemZh`, `itemKo` and a `STYLE_NOTES` entry per language in `lib/prompt.ts`
5. Any special editor in `components/Inspector.tsx`; tap targets in `components/Preview.tsx` if it is tappable

## Conventions

- Code comments are in English. UI strings and prompt text exist in Japanese,
  English, Chinese and Korean; a string added in one language must be added in all four.
- Use the standard Material 3 Expressive values (sizes, corners, tokens) and name
  them the way Material does. When in doubt, link the Material page in your PR.
- Keep the editor chrome and the parts on separate paths: parts are drawn from the
  palette tokens only, so they stay correct in dark mode and under every scheme.
- Small, focused pull requests are easier to review than one large one.
- Commit messages are in English and describe the change, not the file.

## Pull requests

- Branch from `main` in your fork.
- Run `npm run typecheck`, `npm test` and `npm run build`; CI runs the same three on every PR.
- Fill in the PR template: what changed, why, and how you checked it. Screenshots
  help for anything visual.
- By contributing you agree that your changes are licensed under the project's
  [MIT license](LICENSE).
