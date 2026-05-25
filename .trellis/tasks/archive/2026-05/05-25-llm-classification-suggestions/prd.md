# LLM classification suggestions

## Goal

Implement opt-in LLM bookmark classification suggestions for selected bookmark scopes. Users can request suggestions, review each proposed move/create-folder action, and apply or reject suggestions before any native browser bookmark changes are written.

## What I already know

* User requested: implement LLM classification suggestions plus review/apply flow.
* Existing options page persists OpenAI-compatible base URL, API key, and model in `src/services/llmConfigService.ts`.
* Existing LLM connection test calls `{baseUrl}/models` and sends no bookmark data.
* Existing homepage has selection mode, Ctrl/Shift multi-select, bulk move/delete, drag organization, and native write helpers.
* Existing `bookmarkService.ts` exposes `createFolder()` and `moveBookmarkNode()` needed to apply classification suggestions.
* Existing product research says LLM output must be treated as suggestions, not commands, and only user-approved changes should write to browser bookmarks.
* OpenAI-compatible providers may differ on structured-output support, so service-level validation is required even when requesting JSON.

## Assumptions

* MVP scope is classification only: suggest moving selected bookmarks to existing folders or to a newly created folder.
* The user explicitly triggers LLM analysis from the homepage; there are no background LLM calls.
* The request sends only selected bookmark title, URL/domain, folder path, and available folder names/IDs.
* Suggestions are reviewable and can be applied/rejected individually or as a batch.
* Missing LLM credentials disables the request and points users to options.

## Open Questions

* None.

## Requirements

* Add an LLM suggestion service under `src/services/`.
* Load LLM provider settings from existing `llmConfigService`.
* Call an OpenAI-compatible chat endpoint only when the user explicitly requests suggestions.
* Send only selected bookmark metadata and available target folders; do not send full page contents, hidden metadata, URL validation history, or bookmark IDs that are not in scope.
* Parse and validate LLM output before it reaches UI state.
* Persist suggestion batches as extension sidecar metadata if needed for refresh-safe review.
* Show loading, missing-config, success, parse failure, and provider failure states with localized messages.
* Let users review each suggestion with target folder/new folder, confidence, and reason.
* Let users apply or reject each suggestion individually.
* Let users apply all pending suggestions.
* AI Classify scope uses selected bookmarks first; if no bookmarks are selected, it analyzes the current visible bookmark list.
* Applying a suggestion writes through native bookmarks via `createFolder()` and/or `moveBookmarkNode()`.
* Refresh bookmark view after applying suggestions.

## Acceptance Criteria

* [x] AI Classify only runs after explicit user action.
* [x] If bookmarks are selected, AI Classify sends only selected bookmarks.
* [x] If no bookmarks are selected, AI Classify sends the current visible bookmark list.
* [x] Missing API key/model prevents LLM requests and shows localized guidance.
* [x] The request payload contains selected bookmark title, URL/domain, folder path, and available folders only.
* [x] The request does not include URL validation statuses, extension-only metadata, hidden browser data, or full page contents.
* [x] Suggestions are locally validated before display.
* [x] Users can review, apply, and reject individual suggestions.
* [x] Users can apply all valid pending suggestions.
* [x] Applying a move suggestion moves the bookmark through native browser bookmarks.
* [x] Applying a create-folder suggestion creates the folder and moves the bookmark through native browser bookmarks.
* [x] Applied/rejected suggestions are removed or marked so they are not applied twice.
* [x] Unit tests cover request payload shaping, response validation, storage persistence, and apply behavior.
* [x] `npm run test`, `npm run lint`, `npm run typecheck`, and `npm run build` pass.

## Definition of Done

* Tests added or updated for service behavior and apply flow.
* Lint, typecheck, tests, and build pass locally.
* Specs updated for LLM suggestion storage/request/apply contract.
* Work is committed in a focused task commit before Trellis finish-work archiving.

## Research References

* [`research/openai-compatible-structured-suggestions.md`](research/openai-compatible-structured-suggestions.md) — use explicit JSON suggestions plus local validation for OpenAI-compatible providers.
* `.trellis/tasks/archive/2026-05/05-24-browser-bookmark-homepage-extension/research/llm-bookmark-management.md` — LLM bookmark management must be opt-in and reviewable.

## Technical Approach

* Add `src/services/llmSuggestionService.ts` for request shaping, response validation, storage, and apply helpers.
* Reuse `loadLlmConfig()` for provider settings.
* Use `{baseUrl}/chat/completions` for broad OpenAI-compatible provider support.
* Validate suggestions against current bookmark/folder view before displaying or applying.
* Add a review panel/modal on `NewTabPage` launched by the existing sidebar "AI Classify" action.
* Apply suggestions with `createFolder()` and `moveBookmarkNode()` and then reload via `loadBookmarkView()`.

## Decision (ADR-lite)

**Context**: LLM output can be wrong and bookmark data is sensitive.

**Decision**: The MVP only requests classification suggestions for a user-selected scope, validates model output locally, and requires user confirmation before any native bookmark write.

**Consequences**: The flow is safer and auditable, but it does not auto-clean, deduplicate, or silently reorganize bookmarks.

### Classification scope

**Context**: Users need control over which bookmark data is sent to the provider without a heavy preflight dialog every time.

**Decision**: AI Classify analyzes selected bookmarks first. If no bookmarks are selected, it falls back to the current visible bookmark list.

**Consequences**: The flow stays fast and respects user selection as the most explicit privacy boundary.

### Review/apply granularity

**Context**: Classification suggestions can be useful in batches, but model output must remain reviewable before writes.

**Decision**: Support individual apply/reject controls and an apply-all action for valid pending suggestions.

**Consequences**: Users can process suggestions efficiently without giving up per-suggestion control.

## Out of Scope

* Automatic LLM changes without user review.
* Duplicate detection.
* Stale-link cleanup suggestions.
* Semantic search or embeddings.
* Full page-content fetching or summarization.
* Background or scheduled LLM analysis.
* Provider-specific model discovery UI.
