# Quality Guidelines

> Code quality standards for frontend development.

---

## Overview

The required quality gate for this project is:

```bash
npm run test
npm run lint
npm run typecheck
npm run build
```

`npm run build` intentionally runs `npm run clean` first to remove `.wxt/` and `.output/`. This avoids stale WXT/Vite generated state on Windows.

---

## Forbidden Patterns

* Do not run `npm run build` concurrently with `npm run typecheck`; build cleans `.wxt/`, and typecheck extends `.wxt/tsconfig.json`.
* Do not reintroduce Tailwind CDN or remote design-system CSS.
* Do not leave browser API calls inside React components.
* Do not create duplicate components for visual variants that an existing component can support through props.
* Do not translate bookmark titles, URLs, or folder names.

---

## Required Patterns

* Use `npm run clean && wxt build` through the existing `npm run build` script.
* Use `npm run zip` for release artifacts, and keep WXT production entrypoint filtering active for both the `build` and `zip` npm lifecycle events. `wxt zip` runs its own production build before creating `.output/*.zip`, so filtering only during `build` can accidentally package development-only entrypoints.
* Use `useI18n()` for user-facing app text.
* Use services for browser storage/bookmark APIs.
* Use `BookmarkCard` for normal bookmark-grid items.
* Keep the design-system preview updated when reusable visual primitives are added.

## Release Packaging Contract

### 1. Scope / Trigger

This applies whenever CI or local release work creates installable extension artifacts.

### 2. Signatures

```bash
npm run build
npm run zip
```

### 3. Contracts

* `npm run build` must produce a production WXT extension under `.output/chrome-mv3/`.
* `npm run zip` must produce one or more release archives matching `.output/*.zip`.
* Production artifacts must include `newtab` and `options` entrypoints only; `design-system` is development-only.

### 4. Validation & Error Matrix

* No `.output/*.zip` after `npm run zip` -> release workflow must fail.
* Zip contains `design-system.html` -> production entrypoint filtering is wrong.
* Build/typecheck run concurrently -> invalid because build cleans `.wxt/`.

### 5. Good/Base/Bad Cases

* Good: tag `v0.1.0` runs test, lint, typecheck, build, zip, then uploads `.output/vtab-0.1.0-chrome.zip`.
* Base: branch push runs the same package job and stores the zip as a workflow artifact only.
* Bad: running raw `wxt zip` outside the npm `zip` script if filtering depends on `npm_lifecycle_event`.

### 6. Tests Required

* Verify `npm run build` and `npm run zip` sequentially.
* Inspect the zip contents when entrypoint filtering changes.

### 7. Wrong vs Correct

#### Wrong

```ts
const isBuild = process.env.npm_lifecycle_event === "build";
```

#### Correct

```ts
const productionPackageEvents = new Set(["build", "zip"]);
```

---

## Testing Requirements

Vitest is the unit-test baseline. Every change must at least pass:

* Vitest unit tests.
* ESLint.
* TypeScript typecheck.
* WXT production build.

For logic-heavy services, add or update unit tests. Priority targets:

* `bookmarkService.ts` tree mapping and folder filtering.
* `languageService.ts` language normalization.
* `layoutPreferenceService.ts` width clamping.

Service tests should mock WXT/browser APIs at the service boundary rather than moving browser API calls into components. For example, `bookmarkService.test.ts` mocks `wxt/browser` and verifies native bookmark tree mapping, search/filter behavior, breadcrumbs, and bookmark event refresh behavior.

---

## Code Review Checklist

* Does the change preserve native browser bookmarks as source of truth?
* Are browser APIs isolated behind services?
* Are UI strings localized through message dictionaries?
* Does the sidebar/tree behavior work with nested folders?
* Does the right pane use uniform bookmark cards unless there is an explicit product reason otherwise?
* Did test/lint/typecheck/build pass sequentially?
