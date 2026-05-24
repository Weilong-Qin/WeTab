# Quality Guidelines

> Code quality standards for backend development.

---

## Overview

There is no backend package to lint, type-check, build, or test. Backend quality guidance for this repo means preventing accidental server/database architecture from being added to a browser-extension-only codebase.

Use the frontend quality gate for current implementation work:

```bash
npm run test
npm run lint
npm run typecheck
npm run build
```

---

## Forbidden Patterns

* Do not add backend frameworks, API route folders, ORM layers, migration directories, or server processes for current bookmark and settings features.
* Do not move browser bookmark or storage integration out of `src/services/` into React components.
* Do not persist native bookmark mirrors in local files or databases.
* Do not add runtime logging of user bookmark data or secrets.

---

## Required Patterns

* Keep native browser bookmarks as the source of truth.
* Keep platform APIs behind service modules.
* Keep extension-only metadata, when introduced, keyed by native bookmark IDs.
* Update these backend specs before introducing a real backend package.

---

## Testing Requirements

No backend test suite exists. Service logic should be covered with Vitest in `src/services/*.test.ts`, with WXT/browser APIs mocked at the service boundary.

---

## Code Review Checklist

* Did the change avoid adding unnecessary backend/server architecture?
* Are browser APIs still isolated behind services?
* Are native bookmarks still the source of truth?
* Are preference or metadata writes explicit, typed, and reviewable?
* Did the frontend quality gate pass?
