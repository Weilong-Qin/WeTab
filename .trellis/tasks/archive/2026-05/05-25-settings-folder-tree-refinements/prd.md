# Settings and Folder Tree UI Refinements

## Goal

Tighten three small new-tab UI details so the settings modal fits better and folder tree drag/drop gives clearer visual feedback.

## Requirements

* Move settings explanations out of large inline description areas and into compact info tooltips where practical.
* Keep the settings modal compact enough that all primary settings are reachable without excessive vertical scanning.
* In the sidebar folder tree, do not show a chevron arrow for folders that have no child folders.
* When dragging a folder over another folder as a drop target, highlight the target folder row.
* Preserve existing browser bookmark behavior and existing edit/delete/select controls.

## Acceptance Criteria

* [ ] Settings modal section descriptions are available via tooltip affordances instead of occupying large layout space.
* [ ] Leaf folders render without a visible arrow icon while maintaining row alignment.
* [ ] Folder rows receive a visible hover/active drop target style during drag-over.
* [ ] Existing drop-on-folder and drop-before-folder handlers still fire.
* [ ] Type-check/build passes.

## Definition of Done

* Reuse existing local components, tokens, and global styles.
* Keep page/component files focused; do not introduce a new visual system.
* Run the project type-check or build command.

## Technical Approach

Use the existing settings info icon pattern and sidebar row class structure. Add minimal state in the sidebar item for drag-over feedback, update leaf folder toggle placeholders to reserve width without rendering a chevron, and add CSS states for drop targeting.

## Decision (ADR-lite)

Context: The request is a targeted UX refinement on existing components.

Decision: Implement directly in the existing settings modal, sidebar tree, and global stylesheet rather than adding new components.

Consequences: The change stays small and consistent with the current Digital Air design system. Native `title` tooltips remain sufficient unless the design system later adds a richer Tooltip primitive.

## Out of Scope

* Rebuilding settings as a full page or changing settings persistence behavior.
* Changing bookmark move semantics or adding new drag/drop destinations.
* Introducing a third-party tooltip library.

## Technical Notes

* `src/components/SettingsModal.tsx` renders the settings modal content and existing info icon tooltips.
* `src/components/Sidebar.tsx` renders recursive folder items and handles folder drag/drop events.
* `src/styles/global.css` contains settings modal, form, sidebar item, and drag/drop styles.
