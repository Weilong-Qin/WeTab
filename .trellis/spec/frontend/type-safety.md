# Type Safety

> Type safety patterns in this project.

---

## Overview

The frontend uses TypeScript with strict settings. Shared contracts live in `src/types/`, while service-specific helper interfaces can live next to the service when they are not reused elsewhere.

---

## Type Organization

* `src/types/bookmarks.ts` defines `BookmarkItem`, `FolderItem`, and `BookmarkViewModel`.
* `src/types/language.ts` defines supported language codes and language option metadata.
* `src/components/Icon.tsx` defines the `IconName` union used by components and bookmark folders.

Components should import view-model types rather than native browser API types. Native `Browser.bookmarks.BookmarkTreeNode` should stay inside `bookmarkService.ts`.

---

## Validation

Validate external or persisted values at service boundaries:

* `normalizeLanguage(value)` accepts only English or Chinese-compatible language inputs.
* `normalizeSidebarWidth(value)` clamps width to 240-420 px and falls back to 280.
* `bookmarkService.ts` treats native bookmark nodes with a string `url` as bookmarks; folder nodes stay folders.

---

## Common Patterns

Use explicit discriminating helpers for browser data:

```ts
function isBookmark(node: BrowserBookmarkNode): boolean {
  return typeof node.url === "string" && node.url.length > 0;
}
```

Use shared message interfaces for localized strings:

```ts
export type LanguageCode = "en" | "zh-CN";
export const messages: Record<LanguageCode, AppMessages> = { ... };
```

---

## Forbidden Patterns

* No `any` for browser API payloads. Use WXT `Browser.*` types or define a narrow local type.
* No unchecked persisted values. Normalize values read from `browser.storage.local`.
* No hard-coded UI text in feature pages when an i18n message key exists.
* No type assertions to silence nullable DOM nodes unless the entrypoint guarantees the element exists.
