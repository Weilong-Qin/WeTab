# Error Handling

> How errors are handled in this project.

---

## Overview

There is no backend request/response error layer in vTab. Errors come from extension service boundaries, browser API availability, persisted preference parsing, or frontend rendering flows.

Services should normalize external values and surface actionable errors to pages. Pages decide how to render loading, empty, or error states.

---

## Error Types

No custom backend error classes exist. Use plain `Error` at service boundaries when a browser capability is unavailable, as `bookmarkService.ts` does for missing bookmark access.

For persisted preferences, prefer normalization and fallback values over throwing.

---

## Error Handling Patterns

Current patterns:

* `loadBookmarkView()` throws a localized browser-access error if `browser.bookmarks` is unavailable.
* `getDomain()` catches invalid bookmark URLs and returns an empty domain so mapping can continue.
* Preference services normalize invalid storage values to supported defaults.
* React pages should catch service failures and render existing empty/error UI instead of exposing raw exceptions.

---

## API Error Responses

No HTTP API error response format exists. Do not add API response wrappers unless a future backend package is introduced.

---

## Common Mistakes

* Do not call browser APIs directly from React components and handle errors ad hoc there.
* Do not throw for malformed user bookmark URLs; preserve the bookmark and degrade derived fields.
* Do not translate or rewrite user bookmark data while building error messages.
