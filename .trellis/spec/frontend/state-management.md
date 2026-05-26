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
* `vtab.llmConfig` via `llmConfigService.ts`.
* `vtab.llmSuggestions` via `llmSuggestionService.ts`.
* `vtab.themePreference` via `themePreferenceService.ts`.
* `vtab.urlValidationSchedule` via `urlValidationScheduleService.ts`.

Fallback to `localStorage` only for non-extension preview/development contexts where `browser.storage.local` is unavailable.

### Browser data state

Browser bookmarks are source-of-truth data. Read and subscribe through `bookmarkService.ts`; React components should consume mapped view models only.

Bookmark view models may include derived fields that reduce repeated UI work. `BookmarkItem.searchText` is extension-derived lowercase text for search and must be rebuilt from title, URL, domain, description, and folder path whenever the native bookmark tree is mapped. If a caller supplies sample or legacy bookmarks without `searchText`, `filterBookmarks()` must fall back to deriving the same text at read time.

### Bookmark write-through management

#### 1. Scope / Trigger

This contract applies when homepage UI writes to native browser bookmarks. It exists because browser bookmarks are the source of truth, while React state is only a mapped view of the latest native tree.

#### 2. Signatures

Bookmark writes must go through `src/services/bookmarkService.ts`:

```ts
createBookmark({ parentId, title, url }): Promise<void>
createFolder({ parentId, title }): Promise<void>
copyBookmarkNode({ id, parentId, index? }): Promise<BrowserBookmarkNode | undefined>
updateBookmark({ id, title, url }): Promise<void>
updateFolder({ id, title }): Promise<void>
deleteBookmark(bookmarkId): Promise<void>
deleteFolder(folderId): Promise<void>
moveBookmarkNode({ id, parentId, index? }): Promise<void>
captureBookmarkNodeSnapshots(nodeIds): Promise<BookmarkNodeSnapshot[]>
restoreBookmarkNodeSnapshots(snapshots): Promise<void>
resolveWritableParentFolderId(folders, selectedFolderId): string | undefined
```

#### 3. Contracts

* `parentId` is optional; when the synthetic `all` folder is selected, use `resolveWritableParentFolderId()` to choose the first native root folder when available.
* `title` and `url` are trimmed before calling the browser bookmark API.
* `createFolder()` creates a native bookmark folder by omitting `url`.
* `copyBookmarkNode()` captures the source node with native `getSubTree()` and recreates the bookmark or folder tree with native `create()` under the requested parent/index. It returns the new top-level native node, or `undefined` if the source node no longer exists.
* `updateFolder()` renames a native folder by updating only its title.
* `deleteBookmark()` removes only bookmark items.
* `deleteFolder()` uses native recursive folder deletion and must only be called after explicit UI confirmation.
* `moveBookmarkNode()` wraps native bookmark/folder move and reorder. Passing `parentId` moves across folders; passing `index` reorders inside the target parent.
* Best-effort delete undo must capture native node snapshots before deletion and restore by recreating nodes. Restored nodes may receive new native bookmark IDs.
* After any successful write, refresh from `loadBookmarkView()` instead of mutating mapped React state in place.

#### 4. Validation & Error Matrix

* Missing bookmark API -> service throws the localized bookmark-access error.
* Empty form fields -> handled by required form inputs before service calls.
* Invalid URL in the create/edit form -> handled by `type="url"` before service calls.
* Browser API rejection -> surface a localized editor error and keep the modal open for correction/retry.
* Copy source node missing after selection -> service returns `undefined`; caller should skip that item and refresh from `loadBookmarkView()` after the batch.
* Deleted bookmark confirmation rejected -> do not call `deleteBookmark()`.
* Folder delete confirmation rejected -> do not call `deleteFolder()`.
* Moving a folder into itself or its descendant -> block in UI before calling native move.
* Delete undo after native delete -> recreate from snapshot; do not promise ID-keyed metadata survives.

#### 5. Good / Base / Bad Cases

* Good: selected folder is a real native folder, UI calls `createBookmark({ parentId: selectedFolderId, ... })`, then reloads the bookmark tree.
* Base: selected folder is `all`, UI resolves the first native root folder and writes there.
* Base: moving a bookmark card to a folder calls `moveBookmarkNode({ id, parentId })`, then reloads the bookmark tree.
* Base: copying selected bookmarks/folders to a folder calls `copyBookmarkNode({ id, parentId })` per pruned top-level item, then reloads the bookmark tree.
* Base: undoing a move calls `moveBookmarkNode()` with the captured previous `parentId` and `index`.
* Base: undoing a copy deletes the copied top-level native nodes; copied folders are removed with `removeTree()`.
* Base: undoing a delete recreates the captured bookmark/folder tree with `browser.bookmarks.create()`.
* Bad: UI pushes a new `BookmarkItem` directly into React state without a native browser API write.
* Bad: deleting a folder through repeated child deletes when native recursive deletion is the intended operation.
* Bad: promising restored bookmark IDs after delete undo.

#### 6. Tests Required

* Unit-test service calls with mocked `wxt/browser`.
* Assert `createBookmark()` and `createFolder()` call `browser.bookmarks.create()` with trimmed fields.
* Assert `updateBookmark()` calls `browser.bookmarks.update()` with trimmed fields.
* Assert `updateFolder()` calls `browser.bookmarks.update()` with a trimmed title only.
* Assert `deleteBookmark()` calls `browser.bookmarks.remove()`.
* Assert `deleteFolder()` calls `browser.bookmarks.removeTree()`.
* Assert `moveBookmarkNode()` calls `browser.bookmarks.move()` with target parent/index.
* Assert `copyBookmarkNode()` calls `getSubTree()` and recreates bookmark/folder trees with `browser.bookmarks.create()` under the target parent.
* Assert snapshot capture/restoration uses `getSubTree()` and recreates nested children.
* Assert `resolveWritableParentFolderId()` handles real folder, `all`, and missing selected folder cases.

#### 7. Wrong vs Correct

Wrong:

```ts
setBookmarks((items) => [...items, optimisticBookmark]);
```

Correct:

```ts
await createBookmark({ parentId, title, url });
const view = await loadBookmarkView(messages.bookmarkView);
applyBookmarkView(view);
```

Wrong:

```ts
setFolders((items) => reorderLocally(items));
```

Correct:

```ts
await moveBookmarkNode({ id, parentId, index });
const view = await loadBookmarkView(messages.bookmarkView);
applyBookmarkView(view);
```

### URL validation metadata

#### 1. Scope / Trigger

This contract applies when the homepage manually checks bookmark URL reachability. URL validation is extension-only metadata; native browser bookmark titles, URLs, folders, and ordering must not be changed by validation.

#### 2. Signatures

URL validation belongs in `src/services/urlValidationService.ts`:

```ts
loadUrlValidationStatuses(): Promise<UrlValidationStatusMap>
saveUrlValidationStatuses(statuses): Promise<void>
applyUrlValidationStatuses(bookmarks, statuses): BookmarkItem[]
validateBookmarkUrls(targets, options?): Promise<UrlValidationStatusMap>
validateUrl(url, options?): Promise<BookmarkStatus>

interface UrlValidationOptions {
  concurrency?: number // defaults to 6, clamps to 1-12
  now?: number
  timeoutMs?: number
}
```

#### 3. Contracts

* Manifest must declare HTTP/HTTPS host permissions before extension pages can `fetch()` arbitrary bookmark URLs.
* Storage key: `vtab.urlValidationStatus`.
* Storage value: `Record<bookmarkId, { checkedAt: number; status: "verified" | "offline" | "unchecked" }>`; invalid records are ignored when read.
* `loadBookmarkView()` must merge persisted validation status into mapped `BookmarkItem.status`.
* Manual validation checks only the bookmarks in the chosen UI scope. Do not add scheduled/background checks without a new contract.
* Validation runs with conservative finite concurrency to avoid long serial batches while keeping network pressure bounded.
* Validation concurrency must be bounded and testable; callers may lower it for tests or constrained environments, but should not run unbounded `Promise.all()` over every bookmark.

#### 4. Validation & Error Matrix

* Non-HTTP(S) URL -> `offline`.
* `HEAD` response `200-399` -> `verified`.
* `HEAD` not allowed or network failure -> retry once with `GET`.
* `GET` response `200-399` -> `verified`.
* Other response, fetch failure, or timeout -> `offline`.
* Storage read failure -> use an empty status map.
* Storage write failure -> surface a localized UI error and keep bookmark data unchanged.

#### 5. Good / Base / Bad Cases

* Good: user clicks "Check links", the page validates visible bookmarks, persists status by bookmark ID, reloads the mapped bookmark view, and card badges update.
* Base: a previously stored status is applied on page load before the user checks links again.
* Bad: validation modifies bookmark titles with status prefixes or writes health state into native bookmark folders.

#### 6. Tests Required

* Unit-test URL validation with mocked `fetch` and `browser.storage.local`.
* Assert reachable `HEAD` responses are `verified`.
* Assert `HEAD` rejection falls back to `GET`.
* Assert failures/timeouts/non-HTTP URLs become `offline`.
* Assert batch validation honors the configured concurrency limit.
* Assert persisted status loading filters invalid records.
* Assert batch validation preserves existing records and writes new bookmark statuses by ID.

#### 7. Wrong vs Correct

Wrong:

```ts
await updateBookmark({ id, title: `[offline] ${title}`, url });
```

Correct:

```ts
await validateBookmarkUrls([{ id, url }]);
const view = await loadBookmarkView(messages.bookmarkView);
applyBookmarkView(view);
```

### Scheduled URL validation automation

#### 1. Scope / Trigger

This contract applies when the new-tab page automatically rechecks bookmark URLs on a timer while vTab is open. It exists to persist user preference and run repeatable validation without mutating native bookmark content.

#### 2. Signatures

Scheduled validation belongs in `src/services/urlValidationScheduleService.ts`:

```ts
type UrlValidationScheduleScope = "all" | "folder"

interface UrlValidationScheduleConfig {
  enabled: boolean;
  intervalMinutes: 15 | 60 | 360 | 1440;
  scope: UrlValidationScheduleScope;
  targetFolderId?: string;
}

normalizeUrlValidationScheduleConfig(value): UrlValidationScheduleConfig
loadUrlValidationScheduleConfig(): Promise<UrlValidationScheduleConfig>
saveUrlValidationScheduleConfig(config): Promise<UrlValidationScheduleConfig>
subscribeToUrlValidationScheduleChanges(onChange): () => void
buildUrlValidationTargets(bookmarks, config): UrlValidationTarget[]
runScheduledUrlValidation(bookmarks, config): Promise<number>
```

#### 3. Contracts

* Storage key: `vtab.urlValidationSchedule`.
* Storage value: `{ enabled: boolean; intervalMinutes: 15 | 60 | 360 | 1440; scope: "all" | "folder"; targetFolderId?: string }`.
* Fallback storage may use `localStorage` in preview/development contexts only.
* `scope === "folder"` uses `targetFolderId` persisted from the settings modal. It must not depend on transient main-page selection state.
* Scheduled validation only runs while the new-tab page is open, because the current implementation uses a page-local timer.
* After each scheduled run, refresh the bookmark view so persisted validation badges update in the UI.
* The page-local timer should depend on the persisted schedule config and read the latest bookmark list from a ref. Do not include the bookmark array itself in the timer effect dependencies, because scheduled validation refreshes bookmark data after a run and can otherwise immediately retrigger itself.

#### 4. Validation & Error Matrix

* Disabled schedule -> return zero targets and do not call `validateBookmarkUrls()`.
* `scope === "folder"` with no target folder -> return zero targets.
* Invalid stored config -> normalize to the default enabled/interval/scope values.
* Legacy stored `scope === "selected"` values -> normalize to the default all-bookmarks scope.
* Storage read failure -> return the default schedule config.
* Storage write failure -> leave the page state unchanged and keep the previous config in storage.

#### 5. Good / Base / Bad Cases

* Good: user enables the schedule in the settings modal, chooses all bookmarks or a specific folder there, the new-tab page starts a timer, validates the configured target, then refreshes the bookmark view.
* Base: the schedule is disabled, so the page does not create an interval or trigger background validation.
* Bad: writing scheduled-check status into native bookmark titles or folders, or assuming the timer survives after the new-tab page is closed.

#### 6. Tests Required

* Unit-test schedule config normalization and storage load/save with mocked `wxt/browser`.
* Assert invalid stored values normalize to the default schedule config.
* Assert folder-scope target building uses the persisted `targetFolderId`.
* Assert the scheduled runner returns zero when disabled or when folder scope has no target folder.

#### 7. Wrong vs Correct

#### Wrong

```ts
await validateBookmarkUrls(bookmarks.map((bookmark) => ({ id: bookmark.id, url: bookmark.url })));
```

#### Correct

```ts
const targets = buildUrlValidationTargets(bookmarks, scheduleConfig);
await validateBookmarkUrls(targets);
```

### LLM provider configuration

#### 1. Scope / Trigger

This contract applies when the options page reads or writes OpenAI-compatible provider settings, and when it explicitly tests provider connectivity. It is extension configuration, not bookmark metadata, and must not send bookmark data during setup.

#### 2. Signatures

LLM configuration belongs in `src/services/llmConfigService.ts`:

```ts
interface LlmConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
}

normalizeLlmConfig(value): LlmConfig
loadLlmConfig(): Promise<LlmConfig>
saveLlmConfig(config): Promise<LlmConfig>
subscribeToLlmConfigChanges(onChange): () => void
testLlmConnection(config, timeoutMs?): Promise<{ ok: boolean; status?: number }>
```

#### 3. Contracts

* Storage key: `vtab.llmConfig`.
* Storage value: `{ baseUrl: string; apiKey: string; model: string }`.
* `baseUrl`, `apiKey`, and `model` are trimmed before persistence.
* `baseUrl` has trailing slashes removed and must be HTTP or HTTPS; missing or invalid values fall back to `https://api.openai.com/v1`.
* Missing or blank `model` falls back to the default model.
* Options/settings UIs should debounce text-field persistence so every keystroke updates local React state immediately, while storage writes happen after a short idle delay. If the page or modal unmounts with a pending save, flush the pending config to storage before cleanup finishes.
* Connection tests call `GET {baseUrl}/models` with `Authorization: Bearer <apiKey>` and no bookmark titles, URLs, folder paths, or bookmark IDs.
* Connection tests only run from explicit user action. Do not add background or automatic provider pings without a new contract.

#### 4. Validation & Error Matrix

* Missing storage or storage read failure -> return default config.
* Malformed stored config -> normalize each field and fall back to defaults where needed.
* Missing API key or model -> do not call `fetch()`; return `{ ok: false }`.
* Non-2xx provider response -> return `{ ok: false, status }`.
* Fetch failure or timeout -> return `{ ok: false }`.

#### 5. Good / Base / Bad Cases

* Good: user edits options, UI saves through `saveLlmConfig()`, and a button click runs `testLlmConnection()` against `/models`.
* Base: stored config is missing or invalid, options page loads default base URL and model with an empty API key.
* Bad: options page sends bookmark titles or URLs while testing credentials, or calls the provider automatically on page load.

#### 6. Tests Required

* Unit-test config normalization with whitespace, trailing slashes, missing fields, and invalid protocols.
* Unit-test storage load/save with mocked `wxt/browser` storage.
* Unit-test connection testing with mocked `fetch`, asserting the `/models` URL and authorization header.
* Assert no connection request is made when required credentials are missing.

#### 7. Wrong vs Correct

Wrong:

```ts
await fetch(`${baseUrl}/chat/completions`, {
  body: JSON.stringify({ bookmarks })
});
```

Correct:

```ts
await testLlmConnection(config);
```

### LLM classification suggestions

#### 1. Scope / Trigger

This contract applies when the homepage requests, stores, reviews, applies, or rejects LLM bookmark classification suggestions. Suggestions are extension-side metadata and must never directly mutate native bookmarks without user confirmation.

#### 2. Signatures

LLM suggestions belong in `src/services/llmSuggestionService.ts`:

```ts
buildLlmSuggestionScope(bookmarks, folders): LlmSuggestionRequestScope
requestLlmClassificationSuggestions(scope, timeoutMs?): Promise<LlmSuggestionBatch>
loadLlmSuggestionBatch(): Promise<LlmSuggestionBatch | null>
saveLlmSuggestionBatch(batch): Promise<void>
updateSuggestionStatus(batch, suggestionId, status): LlmSuggestionBatch
applyLlmSuggestion(suggestion, folders): Promise<void>
```

#### 3. Contracts

* Storage key: `vtab.llmSuggestions`.
* Suggestion statuses: `"pending"`, `"applied"`, `"rejected"`.
* AI classification must run only after explicit user action.
* Request scope sends selected bookmarks first; if none are selected, it sends the current visible bookmark list.
* Request payload includes only bookmark ID, title, URL, domain, folder path, and available folder ID/label pairs.
* Request payload must not include URL validation status, extension-only metadata, hidden browser data, or fetched page contents.
* Provider requests use the configured OpenAI-compatible `{baseUrl}/chat/completions` endpoint with the stored API key/model.
* Model output must be parsed and locally validated before display.
* Applying a suggestion writes through native bookmarks using `moveBookmarkNode()` and, for new-folder suggestions, `createFolder()` followed by `moveBookmarkNode()`.

#### 4. Validation & Error Matrix

* Missing API key/model -> do not call provider; surface localized missing-config guidance.
* Empty bookmark scope -> do not call provider; ask user to select/open bookmarks.
* Non-2xx provider response -> show request failure and preserve existing suggestions.
* Malformed JSON or unexpected response shape -> show parse failure and do not display invalid suggestions.
* Suggestion bookmark ID not in request scope -> drop the suggestion.
* Suggestion target folder ID not in available folders -> drop the suggestion unless it has a valid `newFolderName`.
* Apply failure from native bookmarks -> surface apply error and leave suggestion pending.

#### 5. Good / Base / Bad Cases

* Good: user selects three bookmarks, clicks AI Classify, reviews suggestions, applies one, rejects another, then the page reloads the native bookmark tree.
* Base: no selection exists, so the current visible bookmark list is sent for suggestions.
* Base: a new-folder suggestion creates a native folder under the first native root folder, then moves the bookmark into it.
* Bad: LLM response directly calls bookmark APIs without user review.
* Bad: prompt sends all bookmarks when the user selected only a subset.

#### 6. Tests Required

* Unit-test request scope shaping and assert sensitive/status metadata is omitted.
* Unit-test provider request URL, headers, model, and local response validation.
* Unit-test persisted suggestion loading/saving and invalid record filtering.
* Unit-test applying existing-folder and new-folder suggestions through native bookmark API wrappers.

#### 7. Wrong vs Correct

Wrong:

```ts
await requestLlmClassificationSuggestions(buildLlmSuggestionScope(allBookmarks, folders));
```

Correct:

```ts
const scopeBookmarks = selectedBookmarks.length ? selectedBookmarks : visibleBookmarks;
await requestLlmClassificationSuggestions(buildLlmSuggestionScope(scopeBookmarks, folders));
```

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
