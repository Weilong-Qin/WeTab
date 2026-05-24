# Database Guidelines

> Database patterns and conventions for this project.

---

## Overview

vTab currently has no database, ORM, migration tool, or server-side persistence layer. Native browser bookmarks are the source of truth for bookmark data.

Extension-only preferences are stored through browser extension storage behind services, not through a database abstraction.

---

## Query Patterns

Do not add query builders or repository layers for current bookmark features. Read browser data through service boundaries:

* `bookmarkService.ts` calls `browser.bookmarks.getTree()` and maps the native tree into `BookmarkViewModel`.
* Filtering is performed on mapped `BookmarkItem[]` values with pure functions such as `filterBookmarks`.
* Folder paths and breadcrumb lookup are derived from the mapped tree, not persisted separately.

---

## Migrations

No migrations exist in this project. If a future task introduces persisted extension metadata, prefer browser storage sidecar records keyed by native bookmark IDs before considering a database.

---

## Naming Conventions

No table, collection, index, or migration naming conventions apply. For persisted extension preferences, use explicit namespaced keys documented in the frontend state-management spec, such as `vtab.language` and `vtab.sidebarWidth`.

---

## Common Mistakes

* Do not mirror browser bookmarks into an extension database for current features.
* Do not treat sample data under `src/data/` as persistent production data.
* Do not add extension-only bookmark metadata without keying it to native bookmark IDs and keeping writes reviewable.
