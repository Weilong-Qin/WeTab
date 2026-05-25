# 设置按钮与配置弹窗

## Goal

Add a visible settings entry point in the new-tab experience that opens a modal for configuring language, theme, LLM provider settings, and scheduled bookmark link checks, without forcing users to jump to a separate options page for the common path.

## What I already know

* The project already has an options page with language and OpenAI-compatible LLM provider settings.
* The new-tab page already has one-off bookmark URL validation, LLM-powered bookmark organization, and reusable modal styling.
* There is no existing theme preference storage or theme application layer yet; current tokens are light-only.
* The sidebar footer already shows a settings icon, but it is not wired as an interactive settings button.
* Bookmark URL validation currently works as a one-time action against visible bookmarks and persists result state in extension storage.

## Assumptions (temporary)

* The new settings entry point will live in the new-tab page and open a modal.
* The modal will reuse the existing visual language and form patterns from the options page and bookmark editor modal.
* Theme selection will be stored in extension storage and applied through a document-level attribute or class.
* Scheduled bookmark checking will reuse the existing URL validation service rather than introducing a second probe implementation.

## Open Questions

* None.

## Requirements (evolving)

* Add a settings button in the new-tab UI that opens a modal.
* The modal must allow switching language between Chinese and English.
* The modal must allow choosing a theme mode: light, dark, or follow browser/system.
* The modal must allow editing LLM settings used for smart folder organization: model, apiKey, baseUrl.
* The modal must expose scheduled bookmark link checking controls: enable/disable, interval, and scope. The initial scope should support manually selected bookmarks.
* Settings should persist locally and update the active UI without requiring a full browser restart.
* Existing one-off link validation and LLM suggestion flows must keep working after the new settings are added.

## Acceptance Criteria (evolving)

* [ ] A settings button is visible in the new-tab experience and opens a modal.
* [ ] Language changes immediately update the extension UI and persist locally.
* [ ] Theme changes update the page appearance and persist locally.
* [ ] LLM provider settings can be edited and saved from the modal.
* [ ] Scheduled bookmark checking settings can be edited and saved from the modal, including manual selection scope.
* [ ] Existing bookmark validation and LLM suggestion features still behave correctly after the change.

## Definition of Done (team quality bar)

* Tests added/updated where the new storage or UI behavior is covered.
* Lint / typecheck / test pass.
* Docs/notes updated if behavior changes.

## Out of Scope (explicit)

* Reworking the existing options page into a multi-step settings wizard.
* Adding backend sync for settings across devices.
* Changing bookmark data itself as part of scheduled checks.

## Technical Notes

* Existing settings surface: [src/pages/OptionsPage.tsx](../../src/pages/OptionsPage.tsx)
* Existing modal pattern: [src/components/BookmarkEditorModal.tsx](../../src/components/BookmarkEditorModal.tsx)
* Existing one-off URL validation: [src/services/urlValidationService.ts](../../src/services/urlValidationService.ts)
* Existing LLM provider config: [src/services/llmConfigService.ts](../../src/services/llmConfigService.ts)
* Existing language service: [src/services/languageService.ts](../../src/services/languageService.ts)
* Existing settings icon in sidebar footer: [src/components/Sidebar.tsx](../../src/components/Sidebar.tsx)