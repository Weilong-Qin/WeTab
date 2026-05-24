# Extension Scaffold Research

## Topic

Research scaffold options for a Chromium Manifest V3 new-tab extension with React/TypeScript UI, background/service-worker logic, and future cross-browser room.

## Sources

* Chrome Extensions Get Started: https://developer.chrome.com/docs/extensions/get-started/
* WXT home: https://wxt.dev/
* WXT introduction: https://wxt.dev/guide/introduction.html
* Plasmo extension pages: https://www.plasmocn.org/en/docs/framework/ext-pages
* CRXJS manifest docs: https://crxjs.dev/concepts/manifest/

## Findings

* Chrome official docs describe the fundamental pieces: `manifest.json`, extension pages, service workers for background events, content scripts, actions, and side panels. They also note all extension logic must be packaged with the extension rather than downloaded at runtime.
* WXT is a modern web-extension framework with TypeScript defaults, fast dev mode/HMR, file-based entrypoints, MV2/MV3 support, and multi-browser targets. It explicitly says it does not replace the extension APIs; developers still use Chrome/Mozilla API docs for platform behavior.
* Plasmo provides a very simple React file convention for pages such as `newtab.tsx`, `options.tsx`, and `popup.tsx`. It is productive for React-centric extensions, but the official docs surfaced here are less ideal as the primary source for this project because the linked docs are a Chinese mirror and some framework conventions are more opinionated.
* CRXJS integrates Chrome extension builds into Vite. It keeps the stack close to plain Vite and provides typed/dynamic manifest support through `defineManifest`, but requires more manual structure decisions than WXT.

## Feasible Approaches

### Approach A: WXT + React + TypeScript (Recommended)

Use WXT as the extension framework, React for UI, TypeScript for type safety, and native extension APIs for bookmarks/storage/runtime.

Pros:
* Purpose-built for extensions and MV3.
* File-based entrypoints fit new-tab, options, popup, and background workers.
* Leaves room for future Firefox/Edge support.
* Reduces custom build plumbing in an otherwise empty repo.

Cons:
* Adds a framework-specific directory convention.
* Future maintainers need to understand WXT in addition to Chrome APIs.

### Approach B: Vite + React + CRXJS

Use standard Vite React with `@crxjs/vite-plugin`, typed manifest configuration, and manually organized extension entrypoints.

Pros:
* Close to standard Vite/React project structure.
* Less framework abstraction than WXT.
* Good when the team wants full control over paths and build behavior.

Cons:
* More decisions to make for extension layout, page wiring, and dev ergonomics.
* Cross-browser packaging is less turnkey.

### Approach C: Handwritten Manifest + Minimal Build

Use a handwritten Manifest V3 extension with plain TypeScript/React build setup or minimal bundled scripts.

Pros:
* Maximum transparency.
* Lowest framework dependency.

Cons:
* More custom build/dev/reload work.
* Slower to reach product functionality.
* Higher chance of MV3 packaging mistakes.

## Recommendation

Use WXT + React + TypeScript for MVP. This repo is currently empty, so WXT's conventions can become the initial project conventions instead of fighting existing structure. Keep browser API access behind small local modules so the product logic is not tightly coupled to WXT internals.
