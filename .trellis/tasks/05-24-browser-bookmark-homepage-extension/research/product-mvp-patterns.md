# Product MVP Pattern Research

## Topic

Research comparable bookmark/new-tab products and extract MVP conventions for a personal browser homepage extension.

## Sources

* Raindrop.io: https://raindrop.io/
* Raindrop.io browser extension help: https://help.raindrop.io/browser-extension
* JotTab: https://jottab.com/
* uTab: https://utab.io/
* BoTab: https://botab.net/
* Tabkit: https://tabkit.app/

## Findings

* Common new-tab bookmark products emphasize visual access first: grid/list views, folders/collections, icons/thumbnails, wallpaper/theme settings, and quick search.
* Bookmark managers such as Raindrop.io emphasize organization power: collections, tags, duplicate/broken-link checks, full-text search, manual sorting, import/export, and cross-device access.
* New-tab-first products tend to keep the homepage fast and visually useful, while advanced management is moved into settings, command palettes, sidebars, or modal workflows.
* Several comparable products market local/privacy-first behavior. This matters here because native bookmarks and optional LLM calls may reveal sensitive browsing intent.
* Search is commonly positioned as retrieval, not just filtering: good UX should search title, URL/domain, folder path, and possibly user-added tags or LLM-generated categories later.
* AI bookmark managers commonly pitch auto-categorization, duplicate detection, summaries, and semantic retrieval. These are useful but risky if they modify bookmarks automatically.

## Mapping to This Repo

* Since the repo is currently empty, MVP scope should avoid building a full cloud bookmark manager.
* The product's differentiator should be: "native browser bookmarks, visible and manageable from the new tab page."
* For implementation risk, keep LLM management as reviewable suggestions first. Direct auto-move/auto-delete can be a later opt-in mode.

## Suggested MVP Shape

* New-tab dashboard:
  * Folder/sidebar or grouped sections based on bookmark folders.
  * Main grid/list of bookmark tiles.
  * Search box over title, URL, and folder path.
  * Basic item actions: open, rename, edit URL, move, delete.
* Bookmark sync:
  * Initial full load from native bookmarks.
  * Event-driven refresh on native bookmark changes.
  * UI write-through to native bookmarks for homepage edits.
* URL health:
  * Manual "check now" plus scheduled background checks.
  * Store status, last checked time, and error class in extension storage.
  * Do not mutate bookmark titles with status badges.
* LLM:
  * User configures provider base URL, API key, model, and enabled operations.
  * MVP operation should be one or two low-risk suggestions: categorize unsorted bookmarks and detect duplicates/stale candidates.
  * Suggestions should require user confirmation before changing bookmarks.

## Recommendation

Start with a privacy-first native bookmark dashboard, not a cloud bookmark manager. Treat visual browsing, search, and reliable two-way sync as MVP. Treat themes, cloud sync, semantic search, and automatic AI cleanup as follow-up layers.
