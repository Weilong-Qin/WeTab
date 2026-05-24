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

### Bookmark write-through management

#### 1. Scope / Trigger

This contract applies when homepage UI writes to native browser bookmarks. It exists because browser bookmarks are the source of truth, while React state is only a mapped view of the latest native tree.

#### 2. Signatures

Bookmark writes must go through `src/services/bookmarkService.ts`:

```ts
createBookmark({ parentId, title, url }): Promise<void>
createFolder({ parentId, title }): Promise<void>
updateBookmark({ id, title, url }): Promise<void>
deleteBookmark(bookmarkId): Promise<void>
resolveWritableParentFolderId(folders, selectedFolderId): string | undefined
```

#### 3. Contracts

* `parentId` is optional; when the synthetic `all` folder is selected, use `resolveWritableParentFolderId()` to choose the first native root folder when available.
* `title` and `url` are trimmed before calling the browser bookmark API.
* `createFolder()` creates a native bookmark folder by omitting `url`.
* `deleteBookmark()` removes only bookmark items. Folder deletion requires a separate explicit contract before implementation.
* After any successful write, refresh from `loadBookmarkView()` instead of mutating mapped React state in place.

#### 4. Validation & Error Matrix

* Missing bookmark API -> service throws the localized bookmark-access error.
* Empty form fields -> handled by required form inputs before service calls.
* Invalid URL in the create/edit form -> handled by `type="url"` before service calls.
* Browser API rejection -> surface a localized editor error and keep the modal open for correction/retry.
* Deleted bookmark confirmation rejected -> do not call `deleteBookmark()`.

#### 5. Good / Base / Bad Cases

* Good: selected folder is a real native folder, UI calls `createBookmark({ parentId: selectedFolderId, ... })`, then reloads the bookmark tree.
* Base: selected folder is `all`, UI resolves the first native root folder and writes there.
* Bad: UI pushes a new `BookmarkItem` directly into React state without a native browser API write.

#### 6. Tests Required

* Unit-test service calls with mocked `wxt/browser`.
* Assert `createBookmark()` and `createFolder()` call `browser.bookmarks.create()` with trimmed fields.
* Assert `updateBookmark()` calls `browser.bookmarks.update()` with trimmed fields.
* Assert `deleteBookmark()` calls `browser.bookmarks.remove()`.
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
```

#### 3. Contracts

* Manifest must declare HTTP/HTTPS host permissions before extension pages can `fetch()` arbitrary bookmark URLs.
* Storage key: `vtab.urlValidationStatus`.
* Storage value: `Record<bookmarkId, { checkedAt: number; status: "verified" | "offline" | "unchecked" }>`; invalid records are ignored when read.
* `loadBookmarkView()` must merge persisted validation status into mapped `BookmarkItem.status`.
* Manual validation checks only the bookmarks in the chosen UI scope. Do not add scheduled/background checks without a new contract.
* Validation runs conservatively and sequentially for the MVP.

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
