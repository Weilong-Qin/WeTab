# Browser Extension Platform Research

## Topic

Research how to build a browser new-tab/homepage extension that reads and writes native browser bookmarks, keeps a homepage UI synchronized with bookmark changes, and runs periodic URL accessibility checks.

## Sources

* Chrome Extensions `chrome.bookmarks` API: https://developer.chrome.com/docs/extensions/reference/api/bookmarks
* Chrome Extensions override pages: https://developer.chrome.com/docs/extensions/develop/ui/override-chrome-pages
* Chrome Extensions `chrome.alarms` API: https://developer.chrome.com/docs/extensions/reference/api/alarms
* Chrome Extensions cross-origin requests: https://developer.chrome.com/docs/extensions/develop/concepts/network-requests
* Chrome Extensions service worker lifecycle: https://developer.chrome.com/docs/extensions/develop/concepts/service-workers/lifecycle
* MDN WebExtensions bookmarks API: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/bookmarks
* MDN `chrome_url_overrides`: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/chrome_url_overrides

## Findings

* Chromium extension APIs directly support the core two-way binding model:
  * Read full bookmark hierarchy with `chrome.bookmarks.getTree()`.
  * Create folders/bookmarks with `create()`.
  * Move nodes with `move()`.
  * Remove bookmarks/folders with `remove()` / `removeTree()`.
  * Update title and URL with `update()`.
  * Search bookmarks by title and URL with `search()`.
* Bookmark event listeners support live refresh:
  * `onCreated`, `onChanged`, `onMoved`, `onRemoved`, `onChildrenReordered`, `onImportBegan`, and `onImportEnded`.
  * Import events matter because bulk imports can generate many changes; expensive observers should suppress per-create work during imports and resync once import ends.
* Chrome new-tab replacement uses `chrome_url_overrides: { "newtab": "..." }`. Chrome docs note the new-tab page should be fast and small, avoid slow synchronous work, and not assume keyboard focus starts in the page.
* MDN confirms `chrome_url_overrides.newtab` also exists in WebExtensions, but the replacement HTML must be bundled with the extension, not loaded from a remote URL.
* Periodic checks should use `chrome.alarms`. Chrome 120 supports a 30 second minimum interval, but a bookmark-health feature should use a much slower default to avoid excessive network traffic.
* Alarm persistence is not guaranteed across restarts; the service worker should recreate missing alarms on startup/activation.
* MV3 service workers are terminated after inactivity or long work. Background logic must persist state in extension storage or IndexedDB rather than global variables.
* URL validation from the extension service worker requires host permissions for cross-origin requests. Broad `https://*/` and `http://*/` host permissions may trigger scary install warnings, so optional host permissions or user-triggered permission requests should be considered.

## Mapping to This Repo

* The repo currently has no app code or package tooling, so the implementation can choose a modern extension scaffold.
* Recommended default is Chromium Manifest V3 first, with an abstraction layer around `chrome.*` APIs so Firefox/WebExtensions can be added later.
* Core data model should use native bookmark node IDs as stable identities. Homepage metadata that is not representable in bookmarks, such as health-check status, favicon cache, manual UI layout preferences, or LLM suggestions, should live in extension storage keyed by bookmark ID.
* New-tab UI should render quickly from cached data, then refresh from `bookmarks.getTree()` and event-driven updates.
* Scheduled validation should be background, rate-limited, cancellable, and stored as metadata rather than modifying bookmark titles or URLs.

## Feasible Approaches

### Approach A: Native Bookmarks as Source of Truth (Recommended)

The homepage renders the browser bookmark tree directly. UI edits call `chrome.bookmarks.*`; external bookmark edits are captured through bookmark events. Extension storage only keeps metadata and preferences.

Pros:
* Best matches the user's two-way binding requirement.
* No duplicate bookmark database to reconcile.
* Works with browser-native bookmark manager and browser sync.

Cons:
* Homepage layout is constrained by bookmark tree semantics.
* Extra UI metadata requires careful sidecar storage keyed by bookmark IDs.

### Approach B: Extension Workspace Synced to Bookmarks

The extension maintains its own navigation workspace and syncs changes to/from native bookmarks.

Pros:
* More flexible UI grouping, tagging, pinning, hidden sections, and custom layouts.
* Easier to add future non-bookmark content.

Cons:
* Sync conflict logic becomes product-critical immediately.
* Harder to guarantee the user's "directly reflects" expectation.

### Approach C: Import Bookmarks Once, Then Manage Internally

The extension imports browser bookmarks into its own store and uses browser bookmarks only as a source/import/export mechanism.

Pros:
* Fast to build a custom homepage app.
* Flexible internal data model.

Cons:
* Does not satisfy the explicit two-way binding requirement.
* Users may be surprised when browser bookmark edits are not reflected.

## Recommendation

Use Approach A for MVP: native browser bookmarks are the source of truth, with extension storage as a metadata sidecar. This preserves the user's core product promise and leaves room to add optional "workspace layout" overlays later.
