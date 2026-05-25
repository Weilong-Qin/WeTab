# LLM configuration and connection test

## Goal

Persist OpenAI-compatible LLM provider settings from the options page and let the user explicitly test connectivity before any bookmark AI workflow is enabled.

## Requirements

* Load saved LLM settings into the options page.
* Persist base URL, API key, and model to extension local storage as the user edits the form.
* Normalize stored values:
  * Trim all fields.
  * Remove trailing slashes from the base URL.
  * Fall back to a default OpenAI-compatible base URL and model when stored values are missing or invalid.
* Keep browser/storage/network integration in `src/services/`; React components should orchestrate UI state only.
* Provide a Test connection action that only runs when the user clicks it.
* The connection test must call an OpenAI-compatible endpoint without sending bookmark data.
* Show loading, success, failure, save, and validation states with localized UI strings.
* LLM classification suggestions remain out of scope for this task.

## Acceptance Criteria

* [x] The options page fields are controlled by saved provider settings.
* [x] Editing base URL, API key, or model saves normalized settings to `browser.storage.local`.
* [x] Missing or invalid stored settings do not crash the options page.
* [x] Clicking Test connection calls the configured provider with the API key.
* [x] Test connection is disabled while settings are loading or required fields are missing.
* [x] The connection test sends no bookmark titles, URLs, folder paths, or bookmark IDs.
* [x] Success, failure, and loading results are visible and localized.
* [x] Unit tests cover config normalization, storage persistence, and test request behavior.
* [x] `npm run test`, `npm run lint`, `npm run typecheck`, and `npm run build` pass.

## Definition of Done

* Tests added or updated for new service behavior.
* Lint, typecheck, tests, and build pass locally.
* Specs updated if the task establishes a reusable LLM settings/storage contract.
* Work is committed in a focused task commit before Trellis finish-work archiving.

## Technical Approach

* Add `src/services/llmConfigService.ts` to own LLM config storage, normalization, subscription, and connection testing.
* Use `browser.storage.local` with a stable key such as `vtab.llmConfig`.
* Use `GET {baseUrl}/models` with an `Authorization: Bearer <apiKey>` header for the OpenAI-compatible connectivity check.
* Treat any 2xx response as success and include non-2xx/fetch failures as user-visible failures.
* Update `src/pages/OptionsPage.tsx` to load settings on mount, save changes through the service, and call the service on Test connection.
* Add localized messages in `src/i18n/messages.ts`.

## Decision (ADR-lite)

**Context**: LLM configuration is a prerequisite for bookmark classification suggestions, but bookmark data is sensitive and should not be sent during setup.

**Decision**: This task only persists provider settings and tests the provider via a metadata endpoint. It does not send bookmark data or implement classification prompts.

**Consequences**: The next LLM feature can depend on a service-level configuration contract, and users can verify credentials before running any AI action.

## Out of Scope

* LLM bookmark classification suggestions.
* Applying or reviewing AI-generated bookmark moves.
* Provider-specific model discovery UI.
* Encrypting or syncing API keys outside extension local storage.
* Background connection checks.

## Technical Notes

* Original product PRD: `.trellis/tasks/archive/2026-05/05-24-browser-bookmark-homepage-extension/prd.md`.
* Existing options page is static and already contains the provider fields and data-sent explanation.
* Existing storage patterns live in `src/services/languageService.ts` and `src/services/layoutPreferenceService.ts`.
* User-facing strings must be added to `src/i18n/messages.ts`.
