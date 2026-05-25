# Homepage bookmark and folder organization

## Goal

Complete the remaining native bookmark management surface on the new-tab homepage: users can rename and delete folders, move bookmarks/folders between native folders, and reorder bookmarks/folders while keeping browser bookmarks as the source of truth.

## What I already know

* User requested: implement homepage move/reorder for bookmarks or folders, plus folder rename/delete.
* Existing homepage supports create folder, create bookmark, edit bookmark title/URL, delete bookmark with confirmation, manual URL validation, search, and native bookmark event refresh.
* `src/services/bookmarkService.ts` already subscribes to `browser.bookmarks.onMoved` and `onChildrenReordered`, but only exposes create/update/delete bookmark write helpers.
* Current service has no `browser.bookmarks.move()` wrapper and no folder update/delete helpers.
* Current UI has bookmark action buttons on `BookmarkCard`, but folder entries in `Sidebar` only support select/expand.
* Current editor modal can support folder mode; it is already used for create folder, so folder rename can likely reuse it.
* Native browser bookmarks are the source of truth; homepage writes should call the native bookmark API and refresh from `loadBookmarkView()`.

## Assumptions

* This task should stay Chromium/WXT-first and use native `browser.bookmarks.*` APIs only.
* Reordering should be explicit UI-driven, not a sidecar custom sort overlay.
* Folder delete is destructive and must require confirmation.
* Deleting folders should use native recursive removal because browser bookmark folders can contain children.

## Open Questions

* None.

## Requirements

* Add service helpers for renaming folders, deleting folders, moving bookmarks/folders, and reordering bookmarks/folders through native browser bookmark APIs.
* Keep browser APIs isolated in `src/services/`.
* Reuse existing editor/modal patterns for folder rename where practical.
* Use drag-and-drop as the primary move/reorder interaction.
* Drag-and-drop MVP targets desktop mouse/trackpad interactions in Chromium extension pages.
* Allow deleting non-empty folders with explicit confirmation that all contained bookmarks and child folders will be deleted.
* Support bulk move and bulk delete from the homepage.
* Support explicit selection mode with checkboxes for bulk operations.
* Support Ctrl/Shift multi-select for desktop users.
* Support bulk move by dragging any selected item to a target folder.
* Support bulk move through a toolbar "Move to..." folder selector.
* Support undo after move and delete operations.
* Delete undo is best-effort: restore deleted bookmark/folder trees from pre-delete snapshots, but do not guarantee preserving original native bookmark IDs.
* Refresh bookmark view after successful writes instead of mutating mapped React state in place.
* Preserve native browser bookmarks as the source of truth.

## Acceptance Criteria

* [x] Users can rename a folder from the homepage.
* [x] Users can delete a folder from the homepage after explicit confirmation.
* [x] Deleting a non-empty folder uses native recursive folder deletion and warns about contained items.
* [x] Users can move a bookmark to another folder from the homepage.
* [x] Users can reorder bookmarks within a folder from the homepage.
* [x] Users can move a folder to another folder from the homepage where native browser APIs allow it.
* [x] Users can reorder folders within a parent folder from the homepage.
* [x] Users can select multiple bookmarks/folders for bulk move.
* [x] Users can select multiple bookmarks/folders for bulk delete with explicit confirmation.
* [x] Users can enter an explicit selection mode and select items with visible controls.
* [x] Users can Ctrl/Shift-select multiple items in desktop browsers.
* [x] Users can drag selected items to a folder to move them as a group.
* [x] Users can use a toolbar "Move to..." folder selector to move selected items.
* [x] Users can undo move operations after completion.
* [x] Users can undo delete operations after completion.
* [x] Delete undo recreates deleted bookmarks/folders in their previous parent/position where possible and communicates best-effort behavior through UX copy where needed.
* [x] Moving/reordering writes through to native browser bookmarks and the UI refreshes from the bookmark tree.
* [x] Invalid native operations fail gracefully with localized UI errors.
* [x] Unit tests cover service wrappers for folder update/delete, move, and reorder behavior.
* [x] `npm run test`, `npm run lint`, `npm run typecheck`, and `npm run build` pass.

## Definition of Done

* Tests added or updated for new service behavior.
* Lint, typecheck, tests, and build pass locally.
* Specs updated if the task establishes a reusable bookmark move/reorder/folder-delete contract.
* Work is committed in a focused task commit before Trellis finish-work archiving.

## Out of Scope

* Homepage-only custom ordering overlays that diverge from native bookmark order.
* Touch-first drag gestures.
* Keyboard-accessible move/reorder alternatives.
* Deleting browser-managed root folders if the native API rejects it.
* LLM-assisted organization.

## Technical Notes

* `src/pages/NewTabPage.tsx` owns page state and current bookmark editor flow.
* `src/components/BookmarkCard.tsx` has edit/delete action buttons and can be extended with move/reorder actions.
* `src/components/Sidebar.tsx` renders folders recursively and can be extended with folder action controls.
* `src/services/bookmarkService.ts` is the platform boundary for native bookmark reads/writes.
* `src/types/bookmarks.ts` may need parent/index metadata on view models to support move/reorder UI.
* Existing bookmark service tests mock `wxt/browser` and are the right place to add native API wrapper assertions.

## Implementation Plan

* PR1: Service contracts and tests for folder update/delete, move/reorder, snapshot restore, and undo state helpers.
* PR2: Folder actions in the sidebar: rename, recursive delete confirmation, drag/drop move and reorder targets.
* PR3: Bookmark card drag/drop move and reorder, including drop feedback and prevention of accidental link opens.
* PR4: Selection mode plus Ctrl/Shift multi-select across bookmarks/folders.
* PR5: Bulk move/delete toolbar, "Move to..." folder selector, grouped drag moves, and undo notifications/actions.
* PR6: Final polish, localized strings, spec updates, and full quality gate.

## Decision (ADR-lite)

### Drag-and-drop organization

**Context**: The user prefers direct manipulation for moving and reordering bookmarks/folders from the homepage.

**Decision**: Use desktop mouse/trackpad drag-and-drop as the primary MVP interaction for bookmark and folder organization rather than button/menu-only movement.

**Consequences**: The UI can feel more natural, but implementation must carefully handle native bookmark API constraints, accidental link opens, drop target feedback, and graceful errors. Touch gestures and keyboard-accessible movement are deferred. Button/menu actions may still be used for non-drag actions such as rename/delete.

### Recursive folder deletion

**Context**: Browser bookmark folders can contain bookmarks and nested folders. Restricting deletion to empty folders would force users into a tedious cleanup flow.

**Decision**: Folder deletion may delete non-empty folders by calling the native recursive deletion API, but only after explicit confirmation that contained bookmarks and child folders will also be removed.

**Consequences**: Folder deletion matches browser bookmark-manager expectations while keeping destructive operations reviewable. Undo/history is still out of scope.

### Bulk operations and undo

**Context**: The user wants bulk move/delete plus undo after moving or deleting bookmark items/folders.

**Decision**: Include bulk move/delete and post-operation undo in this task. Move undo should reverse native move operations. Delete undo is best-effort: capture pre-delete bookmark/folder snapshots and recreate them in the previous parent/position where possible, without promising original native bookmark IDs.

**Consequences**: The implementation must capture enough pre-operation state to reverse moves and to restore deleted bookmark/folder trees as far as the native API permits. Restored items may receive new native bookmark IDs, so ID-keyed sidecar metadata such as URL validation status is not guaranteed to survive delete undo.

### Bulk selection interaction

**Context**: Bulk move/delete needs a discoverable workflow and fast desktop power-user selection.

**Decision**: Support both explicit selection mode with visible checkboxes and Ctrl/Shift multi-select for desktop users.

**Consequences**: Selection state becomes page-level UI state spanning bookmark cards and folder rows. The implementation must avoid accidental link opens while selecting and must clear invalid selections after bookmark tree refreshes.

### Bulk move execution

**Context**: Bulk move should work both with the chosen drag-and-drop model and with a clearer command path for many selected items.

**Decision**: Support both dragging any selected item to a target folder and a toolbar "Move to..." folder selector.

**Consequences**: The feature has two move initiation paths that must share the same service-level bulk move and undo logic. The toolbar selector improves discoverability while drag keeps the direct-manipulation workflow.
