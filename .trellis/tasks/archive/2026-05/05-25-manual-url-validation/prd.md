# Manual URL Validation

## Goal

Implement the next planned product slice: manual URL accessibility validation for visible bookmark scopes. Users should be able to trigger link checks from the new-tab page, see reachable/unreachable status on bookmark cards, and have the status persisted as extension metadata without modifying native browser bookmarks.

## What I Already Know

* The archived product PRD requires manual URL validation in MVP and explicitly excludes automatic scheduled validation.
* Chrome extension pages and service workers can perform cross-origin `fetch()` only for origins covered by `host_permissions`.
* URL health status is extension-only metadata and must not mutate bookmark titles, URLs, or folders.
* Existing bookmark cards already have `status: "verified" | "unchecked" | "offline"`.
* Existing services use `browser.storage.local` for extension preferences.

## Requirements

* Add manifest host permissions for HTTP and HTTPS URL validation.
* Add a URL validation service that checks selected bookmark URLs with conservative timeout/defaults.
* Persist URL validation metadata in `browser.storage.local`, keyed by native bookmark ID.
* Merge persisted validation statuses into `loadBookmarkView()`.
* Add a visible new-tab action to manually validate the currently visible bookmarks.
* During validation, keep normal homepage use available and show progress feedback.
* Update bookmark card visual status for verified/offline/unchecked states.
* Keep validation metadata separate from native browser bookmarks.

## Acceptance Criteria

* [x] Users can trigger URL validation for the current visible bookmark list.
* [x] Reachable bookmarks are marked verified.
* [x] Failed/unreachable bookmarks are marked offline.
* [x] Validation status persists across reloads.
* [x] Validation does not modify native browser bookmark data.
* [x] Validation service has unit tests for reachable, unreachable, timeout/fetch failure, storage read/write, and status merging.
* [x] `npm run test`, `npm run lint`, `npm run typecheck`, and `npm run build` pass sequentially.

## Technical Approach

* Add `src/services/urlValidationService.ts`.
* Store metadata under `vtab.urlValidationStatus`.
* Use `fetch(url, { method: "HEAD", signal })`; fall back to `GET` if the server rejects `HEAD`.
* Treat HTTP status `200-399` as verified and other responses/errors/timeouts as offline.
* Use a small sequential validation loop for MVP to avoid aggressive network traffic.
* Extend `bookmarkService.loadBookmarkView()` to load status metadata and map bookmark status by bookmark ID.
* Add a "Check links" action in the bookmark grid header.

## Out of Scope

* Automatic scheduled validation.
* User-configurable timeout, concurrency, or schedule.
* Storing detailed HTTP status text in the UI.
* Folder-level aggregate health summaries.
* LLM stale-link cleanup suggestions.

## Research References

* Chrome cross-origin network requests docs: extension pages can fetch remote origins when host permissions are declared.
* Chrome permissions docs: host permissions enable extension pages/service workers to make matching `fetch()` requests.

## Technical Notes

* Sources consulted: `https://developer.chrome.com/docs/extensions/develop/concepts/network-requests` and `https://developer.chrome.com/docs/extensions/develop/concepts/declare-permissions`.
* Existing status type: `src/types/bookmarks.ts`.
* Existing storage patterns: `src/services/languageService.ts`, `src/services/layoutPreferenceService.ts`.
