# brainstorm: browser bookmark homepage extension

## Goal

Build a personal browser homepage extension similar to iTab. The extension should render browser bookmarks as homepage navigation items, allow users to click through from the homepage, keep homepage navigation and browser bookmarks in two-way sync, periodically validate URL availability, support optional OpenAI-compatible LLM assisted bookmark organization, and provide direct search across saved URLs from the homepage.

## What I already know

* The product target is a browser new-tab/homepage extension.
* Browser bookmarks are the source content for homepage navigation.
* Bookmark management in the browser should reflect on the homepage navigation.
* Navigation item management on the homepage should reflect back into browser bookmarks.
* The extension should include scheduled URL accessibility checks.
* The extension should optionally call an OpenAI API compatible LLM for intelligent bookmark management.
* The homepage should search existing bookmarked URLs directly.
* The repo currently has no application code or package scaffold; root files are Trellis/agent configuration plus `AGENTS.md`.
* `.trellis/spec/frontend/` and `.trellis/spec/backend/` exist, but the frontend guidelines are placeholders rather than project-specific conventions.
* Trellis reports this as a single-repo project with no configured packages.
* Browser extension APIs support the requested native bookmark read/write/event model.

## Assumptions (temporary)

* The MVP will target Chromium-compatible browsers first unless we decide otherwise.
* Bookmark sync should preserve the browser's folder hierarchy where practical.
* LLM features should be opt-in and user-configured, because API keys and browsing/bookmark data are sensitive.
* URL validation should avoid aggressive background traffic and respect extension platform limits.

## Open Questions

* None currently. Awaiting final confirmation before implementation planning starts.

## Requirements (evolving)

* Migrate the visual design from root `tmp.html` into the WXT/React project as reusable components and design-system CSS.
* Extract reusable design tokens from `tmp.html`: colors, typography, spacing, radius, shadows/effects, and responsive layout rules.
* Preserve visual fidelity to `tmp.html` for layout, spacing, color, type scale, glass surfaces, hover/focus states, and component composition where practical.
* Do not keep CDN Tailwind or page-level repeated style stacks from `tmp.html`; convert them into maintainable local CSS and React components.
* Add a development-only design system preview page that displays colors, typography, buttons, cards, form/search controls, navigation, and layout examples.
* Update root `AGENTS.md` outside the Trellis-managed block with project overview, frontend directory structure, design-system architecture, component reuse rules, and future development notes.
* MVP scope is the "current requirement only" minimal viable version.
* Target Chromium-compatible browsers first using Manifest V3.
* Use WXT + React + TypeScript as the extension scaffold.
* Keep browser API access behind local modules/services rather than calling extension APIs throughout UI components.
* Use native browser bookmarks as the source of truth for navigation items.
* Store extension-only metadata separately, such as URL health status, LLM suggestions, and UI preferences.
* MVP homepage navigation structure strictly maps native bookmark folders and bookmark items.
* Moving/reordering navigation items in the homepage writes through to the corresponding native bookmark folder/item operations.
* Reserve future sidecar metadata support for optional homepage-only overlays such as pinning, hiding, or custom ordering, but do not include those overlays in MVP behavior.
* Conflict handling follows browser bookmark events as the final state. Homepage writes call the native bookmark API and then resync from browser events or the bookmark tree.
* MVP assumes single-user local operation where true concurrent edits are rare; edge cases can still come from browser sync, imports, multiple windows, other bookmark extensions, or event ordering.
* Display browser bookmarks as homepage navigation entries.
* Clicking a homepage navigation entry opens the bookmarked URL.
* Bookmark changes made through browser bookmark management are reflected on the homepage.
* Homepage navigation edits can create/update/delete/reorder corresponding browser bookmarks.
* Homepage MVP exposes full basic bookmark management: create folder, create bookmark, rename, edit URL, move, delete, and reorder.
* Destructive delete operations require explicit confirmation.
* Provide manual URL accessibility validation in MVP.
* Preserve the architecture extension point for scheduled URL validation, but do not include automatic scheduled checks in MVP.
* Provide search over bookmarked URLs.
* Search MVP covers bookmark title, URL/domain, and folder path.
* Folder classification/path acts as the MVP tag source for search and filtering.
* MVP does not include a separate user-defined tag system.
* Homepage first-screen layout uses a top global search bar, a left bookmark folder tree, and a right bookmark grid.
* The folder tree selects the current folder/category scope.
* The bookmark grid shows the selected folder's bookmark items or search results.
* Provide optional LLM-assisted bookmark management through a configurable OpenAI-compatible API.
* LLM-assisted management must produce reviewable suggestions; it must not automatically modify bookmarks in MVP.
* LLM MVP capability is intelligent classification suggestions for selected bookmarks or folders.
* LLM classification may suggest moving bookmarks to existing folders or creating new folders.
* LLM classification suggestions require user confirmation before any native bookmark move/create operation.
* MVP includes an options/settings page for OpenAI-compatible LLM configuration.
* LLM settings include provider base URL, API key, model, data/permission explanation, and test connection.
* URL validation uses built-in defaults in MVP and does not expose settings.

## Research References

* [`research/browser-extension-platform.md`](research/browser-extension-platform.md) — Native browser bookmark APIs support the two-way sync model; MV3 new-tab UI plus alarms/service worker is the recommended Chromium-first platform shape.
* [`research/product-mvp-patterns.md`](research/product-mvp-patterns.md) — Comparable products suggest a fast visual new-tab dashboard, search, folders/collections, and keeping advanced management out of the first screen.
* [`research/llm-bookmark-management.md`](research/llm-bookmark-management.md) — LLM features should produce schema-validated, user-reviewed suggestions before any bookmark writes.
* [`research/extension-scaffold.md`](research/extension-scaffold.md) — WXT + React + TypeScript is the recommended scaffold for this empty repo and MV3 extension target.
* [`research/tmp-html-design-system.md`](research/tmp-html-design-system.md) — Extracted `tmp.html` design tokens, reusable component targets, responsive rules, and interaction states.

## Research Notes

### What similar tools and APIs imply

* The new-tab page should be fast and able to render from cached bookmark data, then refresh from browser APIs.
* Native browser bookmarks should be the MVP source of truth; extension storage should hold sidecar metadata such as health status, LLM suggestions, and UI preferences.
* URL validation should be rate-limited and stored as metadata rather than modifying bookmark titles.
* LLM organization should be opt-in, folder-scoped where possible, and reviewable before applying changes.
* WXT + React + TypeScript is the recommended scaffold because this is a greenfield extension and WXT handles extension entrypoints/build tooling while preserving direct use of browser APIs.

### Feasible approaches here

**Approach A: Native Bookmarks as Source of Truth** (Recommended)

* How it works: render the browser bookmark tree directly; homepage edits call native bookmark APIs; extension storage stores metadata only.
* Pros: best matches the two-way binding requirement and works with browser-native bookmark manager/sync.
* Cons: custom homepage layout must respect bookmark tree semantics unless we add overlay preferences.

**Approach B: Extension Workspace Synced to Bookmarks**

* How it works: maintain an internal navigation workspace and reconcile it with browser bookmarks.
* Pros: supports richer custom layout and future non-bookmark items.
* Cons: conflict resolution becomes complex early and can weaken the "directly reflects" product promise.

**Approach C: Import Once, Manage Internally**

* How it works: import bookmarks into the extension and manage navigation separately.
* Pros: simplest custom homepage data model.
* Cons: does not satisfy the explicit two-way binding requirement; not recommended for this product.

## Acceptance Criteria (evolving)

* [ ] The extension is implemented as a Chromium-compatible Manifest V3 extension.
* [ ] The project scaffold uses WXT, React, and TypeScript.
* [ ] The visual design from `tmp.html` is represented as local design tokens and reusable React components.
* [ ] No Tailwind CDN dependency remains in the migrated app.
* [ ] Root `AGENTS.md` documents the project, frontend structure, design system, component reuse policy, and future development notes.
* [ ] A development-only design-system preview page demonstrates core tokens and reusable components.
* [ ] Bookmark, storage, and LLM browser/platform integration logic is isolated from presentation components.
* [ ] The extension can read bookmark folders/items and render them on the homepage.
* [ ] Bookmark folders are rendered as homepage navigation groups/directories in MVP.
* [ ] Adding, editing, deleting, or moving a bookmark in the browser updates the homepage view.
* [ ] Adding, editing, deleting, or moving a navigation item on the homepage updates browser bookmarks.
* [ ] Users can create bookmark folders from the homepage and see them in browser bookmarks.
* [ ] Users can create bookmarks from the homepage and see them in browser bookmarks.
* [ ] Users can rename bookmarks/folders from the homepage.
* [ ] Users can edit bookmark URLs from the homepage.
* [ ] Users can move and reorder bookmarks/folders from the homepage.
* [ ] Users must confirm before deleting bookmarks or folders from the homepage.
* [ ] Users can search saved bookmarks by title, URL/domain, and folder path.
* [ ] Folder names can be used as category/tag-like filters in search.
* [ ] The new-tab homepage provides top global search, left folder tree navigation, and right bookmark grid browsing.
* [ ] Selecting a folder in the tree updates the bookmark grid.
* [ ] Entering a search query shows matching bookmarks in the grid.
* [ ] Users can manually trigger URL validation for a selected scope.
* [ ] URL validation records reachable/unreachable status without blocking normal homepage use.
* [ ] LLM features require explicit configuration and do not run with missing credentials.
* [ ] Users can configure OpenAI-compatible base URL, API key, and model in an options/settings page.
* [ ] Users can test the configured LLM connection.
* [ ] The settings page explains which bookmark fields may be sent for LLM classification.
* [ ] LLM suggestions require user confirmation before any bookmark changes are written.
* [ ] Users can request LLM classification suggestions for a selected bookmark scope.
* [ ] Users can review and apply or reject each LLM classification suggestion.

## Technical Approach

* Scaffold a WXT + React + TypeScript Chromium MV3 extension.
* Implement a new-tab page with top global search, left bookmark folder tree, and right bookmark grid.
* Add local service/module boundaries:
  * Bookmark service wraps native bookmark tree reads, search, create/update/move/delete/reorder, and event subscriptions.
  * Metadata service stores URL health status, UI preferences extension points, and LLM suggestion state.
  * URL validation service performs manual reachability checks with conservative defaults.
  * LLM service stores provider configuration, tests connectivity, and requests structured classification suggestions.
* Treat browser bookmarks as the source of truth. UI mutations write through native bookmark APIs, then reconcile from bookmark events or a fresh tree read.
* Use folder path as the MVP category/tag model; no separate tag database.
* Keep LLM changes reviewable: the model proposes classification actions, and extension code applies approved bookmark writes.

## Definition of Done (team quality bar)

* Tests added/updated where appropriate.
* Lint / typecheck / CI green.
* Docs/notes updated if behavior changes.
* Rollout/rollback considered if risky.

## Implementation Plan (small PRs)

* PR1: Scaffold WXT + React + TypeScript app, new-tab page shell, options page shell, lint/typecheck/test baseline.
* PR2: Native bookmark read model, folder tree, bookmark grid, global search by title/URL/folder path.
* PR3: Homepage write-through editing: create folder/bookmark, rename, edit URL, move, reorder, delete with confirmation.
* PR4: Manual URL accessibility validation and metadata persistence.
* PR5: LLM settings, test connection, classification suggestions, review/apply flow.
* PR6: Polish states, error handling, permission explanations, tests, docs, and spec updates.

## Out of Scope (explicit)

* Full cross-browser support beyond Chromium-compatible browsers.
* Cloud account sync unless explicitly added later.
* Automatic LLM changes without user review.
* LLM duplicate detection.
* LLM cleanup suggestions for inaccessible/stale links.
* Automatic scheduled URL accessibility validation.
* User-configurable URL validation timeout, concurrency, or schedule.
* Separate user-defined tag system independent of bookmark folders.
* Semantic or embedding-based search.
* Rich custom workspace layout that diverges from native bookmark hierarchy.
* Homepage-only pin/hide/custom-sort overlays, except for preserving metadata extension points.
* Full page-content indexing or semantic search over page bodies.

## Decision (ADR-lite)

### Native bookmark hierarchy mapping

**Context**: Homepage navigation must stay bidirectionally bound to browser-native bookmarks.

**Decision**: MVP strictly maps browser bookmark folders/items to homepage directories/navigation items. Future sidecar metadata may add pin/hide/custom-sort overlays after the core sync model is reliable.

**Consequences**: The MVP has simpler data flow and conflict semantics, but provides less visual layout customization than iTab-like products until overlay metadata is added later.

### Bookmark event conflict handling

**Context**: The product treats native browser bookmarks as the source of truth. In normal single-user operation, concurrent edits are unlikely, but browser sync, imports, multiple windows, other bookmark extensions, or event ordering can still create race-like cases.

**Decision**: Browser bookmark events and the latest native bookmark tree are authoritative. Homepage mutations write through to native bookmark APIs, then the homepage reconciles from bookmark events or a fresh tree read.

**Consequences**: MVP avoids a local transaction/conflict-resolution system. Rare edge cases may overwrite transient homepage state with the latest browser bookmark state.

### LLM MVP operation

**Context**: LLM support should make bookmark management smarter without risking silent unwanted bookmark changes or exposing more data than needed.

**Decision**: MVP supports intelligent classification suggestions only. It can recommend moving selected bookmarks to existing folders or creating new folders, but all writes require explicit user confirmation.

**Consequences**: MVP delivers a useful AI feature with bounded risk. Duplicate detection, stale-link cleanup, semantic search, and automatic cleanup remain follow-up work.

### URL validation scope

**Context**: Scheduled URL validation was part of the initial idea, but periodic background checks increase permission, network, throttling, and service-worker complexity.

**Decision**: MVP supports manual URL accessibility checks only. The user explicitly triggers checks for a selected scope, and the extension records status metadata. Scheduled validation is preserved as a future extension point.

**Consequences**: MVP has lower permission and background-task risk, but does not yet fully deliver automatic timed validation.

### Homepage editing surface

**Context**: Two-way binding means homepage management should be able to write meaningful changes back to native browser bookmarks.

**Decision**: MVP includes full basic bookmark editing from the homepage: create folder, create bookmark, rename, edit URL, move, delete, and reorder. Delete is guarded by explicit confirmation.

**Consequences**: MVP has a complete management loop, but must implement careful UI affordances and error handling for destructive and structural operations.

### Search scope

**Context**: Users need to find saved URLs directly from the homepage without introducing a heavy separate metadata system.

**Decision**: MVP search indexes bookmark title, URL/domain, and folder path. Folder classification/path is treated as the MVP tag/category source for search and filtering.

**Consequences**: Search remains simple and aligned with native bookmark hierarchy. Dedicated tags and semantic search are deferred.

### Extension scaffold

**Context**: The repo is a greenfield project with Trellis setup but no application source. The MVP needs a Chromium MV3 extension with a React new-tab UI, background/service-worker behavior, and future room for cross-browser targets.

**Decision**: Use WXT + React + TypeScript. Keep browser API access in local modules/services so UI components do not directly own extension platform behavior.

**Consequences**: The project adopts WXT's file and build conventions, reducing custom build work and leaving future cross-browser room. Product logic should remain decoupled from WXT where practical.

### Homepage layout

**Context**: The homepage must support both quick retrieval and direct navigation across the native bookmark hierarchy.

**Decision**: MVP first screen uses a top global search bar, a left bookmark folder tree, and a right bookmark grid. The grid shows the selected folder or search results.

**Consequences**: Users get search-first access without losing the folder/category model. This layout is less visually decorative than iTab-style grouped dashboards but better aligned with MVP management workflows.

### Settings scope

**Context**: MVP needs LLM configuration but should avoid turning settings into a broad control panel before core workflows are stable.

**Decision**: MVP settings include only OpenAI-compatible LLM provider configuration, data/permission explanation, and test connection. URL validation uses built-in defaults.

**Consequences**: LLM use is explicit and understandable, while URL validation remains simple. Advanced validation settings can be added later.

## Technical Notes

* Initial PRD seeded from user request on 2026-05-24.
* Repo inspection: no `package.json` or app source exists yet; this is effectively a new extension scaffold.
* Trellis workflow: task is in `planning`; before implementation, `implement.jsonl` and `check.jsonl` need agent-curated spec/research entries unless using inline dispatch mode.
* Frontend specs are currently generic placeholders; implementation should establish initial conventions and update specs if patterns are created.
* Technical research persisted under `research/`.
