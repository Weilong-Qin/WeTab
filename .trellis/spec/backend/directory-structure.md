# Directory Structure

> How backend code is organized in this project.

---

## Overview

vTab currently has no backend package, server runtime, API route layer, or server-side build target. It is a Chromium-first WXT browser extension, so backend-like integration work lives in frontend extension services under `src/services/`.

Do not create server folders, API endpoints, or database modules unless a future task explicitly adds a backend package and updates these specs.

---

## Directory Layout

```text
src/
|-- services/        # Browser API, extension storage, and mapping boundaries
|-- types/           # Shared frontend view-model contracts
`-- utils/           # Small pure helpers

entrypoints/
|-- newtab/          # Browser new-tab replacement
|-- options/         # Extension settings page
`-- design-system/   # Development-only preview surface
```

---

## Module Organization

Use frontend service modules for platform boundaries:

* `src/services/bookmarkService.ts` wraps `browser.bookmarks.*`, maps native bookmark nodes, filters bookmarks, and exposes bookmark-change subscriptions.
* `src/services/languageService.ts` wraps extension storage and language normalization.
* `src/services/layoutPreferenceService.ts` wraps extension storage and sidebar width clamping.

Pages and components consume service functions and typed view models. They should not call browser APIs directly.

---

## Naming Conventions

Backend naming conventions do not apply until a backend exists. For extension service boundaries, follow frontend naming:

* Services: `<domain>Service.ts`.
* Service tests: `<domain>Service.test.ts`.
* Shared contracts: domain-based files in `src/types/`.
* Small pure helpers: `src/utils/`.

---

## Examples

* `src/services/bookmarkService.ts` is the current model for isolating browser APIs from React components.
* `src/services/languageService.ts` is the current model for validating persisted extension preferences.
* `src/services/layoutPreferenceService.ts` is the current model for clamping persisted numeric settings.
