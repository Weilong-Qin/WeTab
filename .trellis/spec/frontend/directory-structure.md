# Directory Structure

> How frontend code is organized in this project.

---

## Overview

vTab is a WXT + React + TypeScript browser extension. Extension entrypoints live under `entrypoints/`; reusable application code lives under `src/`.

Pages should stay thin. Put browser APIs, storage, and data mapping in `src/services/`; put reusable UI in `src/components/`; put shared view-model contracts in `src/types/`.

---

## Directory Layout

```text
entrypoints/
├── newtab/          # Chrome new-tab replacement
├── options/         # Extension options/settings page
└── design-system/   # Development-only component preview

src/
├── components/      # Reusable UI primitives and composed UI
├── data/            # Sample data for development-only previews
├── hooks/           # Reusable React state/effect hooks
├── i18n/            # English/Chinese message dictionaries
├── pages/           # Thin page assemblies for entrypoints
├── services/        # Browser API, storage, and mapping boundaries
├── styles/          # Global CSS and design tokens
├── types/           # Shared TypeScript view-model types
└── utils/           # Small pure helpers
```

---

## Module Organization

### Entrypoints

Each WXT HTML entrypoint owns only HTML bootstrap and `main.tsx`. Route real UI through `src/pages/*`.

```tsx
// entrypoints/newtab/main.tsx
createRoot(document.getElementById("root")!).render(<NewTabPage />);
```

### Pages

Pages compose components, call hooks/services, and own page-level state. Do not define new visual systems in page files.

### Services

Browser and extension APIs must be isolated in services:

* `bookmarkService.ts` wraps `browser.bookmarks.*` and maps native bookmark trees to `BookmarkViewModel`.
* `languageService.ts` wraps `browser.storage.local` and browser UI language detection.
* `layoutPreferenceService.ts` stores sidebar width preferences.

### Styles

Use `src/styles/tokens.css` for design tokens and `src/styles/global.css` for shared component classes. Do not reintroduce Tailwind CDN or large repeated inline class stacks.

---

## Naming Conventions

* Components: `PascalCase.tsx`, exported as named functions.
* Hooks: `useThing.ts`.
* Services: `<domain>Service.ts`.
* Types: domain-based files such as `bookmarks.ts` and `language.ts`.
* CSS classes: BEM-like blocks, for example `sidebar__nav`, `bookmark-card__footer`, `button--primary`.

---

## Examples

* `src/pages/NewTabPage.tsx` — page assembly using bookmark service, i18n hook, shell, sidebar, breadcrumbs, and card grid.
* `src/components/Sidebar.tsx` — reusable recursive navigation component with expansion state.
* `src/services/bookmarkService.ts` — browser bookmark API boundary and view-model mapper.
