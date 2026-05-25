# OpenAI-compatible structured bookmark suggestions

## Sources

* OpenAI model docs show modern chat models support Chat Completions and Structured Outputs: https://developers.openai.com/api/docs/models/compare
* OpenAI GPT-4o mini docs describe focused extraction/classification tasks and structured outputs support: https://developers.openai.com/api/docs/models/gpt-4o-mini
* Existing project research: `.trellis/tasks/archive/2026-05/05-24-browser-bookmark-homepage-extension/research/llm-bookmark-management.md`

## Findings

* The safest product model is "suggestions, not commands": the LLM returns proposed actions and extension code applies only user-approved actions.
* Bookmarks are sensitive. The request should send only selected bookmark title, URL/domain, folder path, and available target folders. Do not fetch page contents or send hidden browser data.
* OpenAI Structured Outputs are useful for enforcing a schema, but OpenAI-compatible providers may not support the same `response_format` behavior.
* For this repo's OpenAI-compatible settings, the MVP should call `{baseUrl}/chat/completions` with explicit JSON-only instructions and a `response_format` JSON schema where compatible, then locally validate parsed suggestions.
* The MVP suggestion type should be narrow: move selected bookmarks to existing folders or create a new folder then move selected bookmarks. Duplicate detection and stale-link cleanup are out of scope.

## Implementation Notes

* Use existing `loadLlmConfig()` and reject missing API key/model before sending bookmark data.
* Keep LLM network code in `src/services/`.
* Persist reviewable suggestion batches in extension storage if the UI needs to survive refresh.
* Apply approved suggestions through `createFolder()` and `moveBookmarkNode()`, then reload the native bookmark tree.
