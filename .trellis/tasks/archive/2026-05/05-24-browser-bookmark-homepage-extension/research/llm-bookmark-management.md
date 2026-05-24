# LLM Bookmark Management Research

## Topic

Research how to safely add OpenAI-compatible LLM assistance for bookmark organization.

## Sources

* OpenAI Structured Outputs guide: https://developers.openai.com/api/docs/guides/structured-outputs
* OpenAI Text Generation guide: https://developers.openai.com/api/docs/guides/text

## Findings

* OpenAI recommends the Responses API for text-generation applications, especially when using reasoning-capable models.
* Structured Outputs let the application constrain model responses to a JSON schema. This is important for bookmark management because the extension needs predictable actions like `suggest_category`, `suggest_duplicate`, `suggest_rename`, or `suggest_delete_candidate`.
* Structured Outputs are preferable to free-form JSON for user-facing automation because they can enforce required fields and enums.
* The OpenAI docs distinguish structured response formatting from function calling. For this extension, a first MVP should use structured suggestions returned to the UI; actual bookmark modifications should be performed by extension code only after user confirmation.
* If the product supports "OpenAI-compatible" providers, not all providers will support the latest OpenAI-specific structured-output features. The implementation should define a provider capability layer or fall back to strict JSON parsing plus validation.

## Privacy and Safety Notes

* Bookmarks can reveal sensitive personal and work interests. LLM features must be explicit opt-in.
* API keys should be stored locally in extension storage and never committed or logged.
* Users should be able to choose which folders are eligible for LLM analysis.
* For MVP, send only title, URL/domain, folder path, and optionally page metadata if later implemented. Avoid fetching full page content unless separately approved.
* Model output should be treated as suggestions, not commands.

## Feasible LLM MVP Operations

### Operation A: Categorize Unsorted Bookmarks (Recommended)

Input: selected bookmark IDs with title, URL, current folder path, and available target folders.

Output: suggested target folder, confidence, and short reason.

Risk: Low if user confirms before move.

### Operation B: Duplicate / Near-Duplicate Suggestions

Input: bookmark title, canonicalized URL/domain, and existing candidates.

Output: duplicate groups with suggested keep/remove candidates.

Risk: Medium because false positives can remove useful variants. Require confirmation.

### Operation C: Bulk Auto-Cleanup

Input: many bookmarks and policy rules.

Output: direct changes.

Risk: High. Not recommended for MVP.

## Recommendation

Use an OpenAI-compatible provider config, but keep the MVP provider abstraction narrow: base URL, API key, model, and feature capability flags. Use schema-validated suggestions where available, fall back to local validation for compatible providers, and require user confirmation before writing to bookmarks.
