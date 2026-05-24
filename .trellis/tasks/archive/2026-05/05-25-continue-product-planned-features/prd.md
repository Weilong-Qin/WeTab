# Continue Product Planned Features

## Goal

Continue the archived browser bookmark homepage MVP by implementing the next incomplete product slice: basic homepage write-through bookmark management. The new-tab page should let users create browser bookmark folders/bookmarks, edit bookmark title/URL, and delete bookmarks with explicit confirmation while keeping native browser bookmarks as the source of truth.

## What I Already Know

* Archived product PRD planned native bookmark read/write sync, manual URL validation, LLM settings/test/suggestions, and richer homepage management.
* Current app already has WXT + React + TypeScript, native bookmark reading, folder tree navigation, global search, bookmark grid, language settings, and static LLM settings UI.
* Current dirty work already adds Vitest and `bookmarkService.test.ts`; it belongs to the bookmark-service quality baseline needed for this slice.
* Browser APIs must stay behind services. React pages/components should consume service functions and view models only.
* User-facing text must be localized through `src/i18n/messages.ts`.

## Requirements

* Add service methods for native bookmark creation, update, and deletion.
* Add tests for bookmark service write-through methods, including browser API calls and missing-access failures.
* Add a new-tab modal/form for creating a bookmark in the selected folder.
* Add a new-tab modal/form for creating a folder under the selected folder.
* Add edit/delete actions to bookmark cards without breaking normal click-to-open behavior.
* Edit bookmark title and URL through native browser bookmark update.
* Delete bookmark only after explicit confirmation.
* Refresh the mapped bookmark view after successful writes.
* Preserve search, folder selection, and bookmark event refresh behavior.
* Keep folder names, bookmark titles, and URLs as user data; do not translate them.

## Acceptance Criteria

* [x] Users can create a bookmark from the homepage and see it in native browser bookmarks.
* [x] Users can create a folder from the homepage and see it in native browser bookmarks.
* [x] Users can edit an existing bookmark title and URL from the homepage.
* [x] Users can delete an existing bookmark only after confirming.
* [x] Browser API write calls are isolated in `bookmarkService.ts`.
* [x] Unit tests cover create/update/delete service methods.
* [x] `npm run test`, `npm run lint`, `npm run typecheck`, and `npm run build` pass sequentially.

## Technical Approach

* Extend `bookmarkService.ts` with typed service operations around `browser.bookmarks.create`, `update`, and `remove`.
* Use the currently selected folder as the default parent. If the synthetic `all` folder is selected, choose the first real root folder when available.
* Keep transient form state in `NewTabPage.tsx`; no global state library.
* Add a reusable `BookmarkEditorModal` component for create/edit flows.
* Refactor `BookmarkCard` so the card opens the URL through an anchor region and exposes separate edit/delete icon buttons.
* Reuse existing Digital Air CSS tokens and shared component classes.

## Out of Scope

* Drag-and-drop move/reorder.
* Folder rename/delete.
* Manual URL accessibility validation.
* LLM test connection and classification suggestions.
* Scheduled background checks.
* Semantic search or user-defined tags.

## Technical Notes

* Relevant specs: `.trellis/spec/frontend/directory-structure.md`, `component-guidelines.md`, `state-management.md`, `type-safety.md`, and `quality-guidelines.md`.
* Existing product source: `.trellis/tasks/archive/2026-05/05-24-browser-bookmark-homepage-extension/prd.md`.
* Existing dirty files before this task: `package.json`, `package-lock.json`, `src/services/bookmarkService.ts`, `src/services/bookmarkService.test.ts`.
