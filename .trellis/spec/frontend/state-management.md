# State Management

> How state is managed in this project.

---

## Overview

Use React local state plus small services. Do not add global state libraries unless a future feature has cross-page state complexity that cannot be handled through extension storage and hooks.

---

## State Categories

### Page-local UI state

Keep transient page state in the page component:

* Selected bookmark folder ID.
* Search query.
* Loading/error state for bookmark reads.

### Component-local UI state

Keep purely presentational interaction state inside the component:

* Sidebar mobile open state in `AppShell`.
* Sidebar expanded folder IDs in `Sidebar`.

### Persisted extension preferences

Store user preferences in `browser.storage.local` behind a service:

* `vtab.language` via `languageService.ts`.
* `vtab.sidebarWidth` via `layoutPreferenceService.ts`.

Fallback to `localStorage` only for non-extension preview/development contexts where `browser.storage.local` is unavailable.

### Browser data state

Browser bookmarks are source-of-truth data. Read and subscribe through `bookmarkService.ts`; React components should consume mapped view models only.

---

## When to Use Global State

Avoid app-wide global state for current MVP features. Promote state only when:

* Multiple entrypoints need live shared state beyond storage-change sync.
* Derived data becomes expensive and cannot be localized to a page.
* A feature needs optimistic cross-page mutation tracking.

Document the new contract in this file before adding a global store.

---

## Browser/Extension State Contracts

### Language

* Storage key: `vtab.language`.
* Values: `"en"` or `"zh-CN"`.
* Default: browser UI language when it normalizes to English or Chinese, otherwise English.
* Pages should use `useI18n()` and message dictionaries, not hard-coded UI strings.

### Sidebar width

* Storage key: `vtab.sidebarWidth`.
* Values: number in pixels.
* Clamp: 240 to 420.
* Default: 280.

---

## Common Mistakes

* Do not store expanded folder state in the bookmark view model; expansion is UI state.
* Do not persist every hover/focus interaction.
* Do not mutate bookmark view models in place; derive filtered lists with pure functions such as `filterBookmarks`.
