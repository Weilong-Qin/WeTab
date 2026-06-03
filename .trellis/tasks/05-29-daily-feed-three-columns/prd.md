# Show Daily Feed Sources Side By Side

## Goal

Update the Daily Feed UI so GitHub Trending, Hacker News, and LeetCode Daily are visible at the same time as three side-by-side source blocks instead of being selected through tabs.

## What I Already Know

* The user wants the Daily Feed sources displayed in parallel as three blocks.
* Current working tree already contains an untracked `src/components/DailyFeed.tsx` and related service/type files.
* The existing Daily Feed implementation loads each source independently and renders a grid, but the presentation should clearly read as three separate source blocks.
* `src/pages/NewTabPage.tsx` already imports and mounts `DailyFeed`.

## Requirements

* Render GitHub Trending, Hacker News, LeetCode Daily, and LeetCode Activity simultaneously.
* Do not use a tab selector or active source switching in the Daily Feed UI.
* Keep independent loading, empty/error, and retry behavior per source.
* Keep the component reusable through its existing `sources` prop.
* Use existing design tokens and global component styles.
* Preserve responsive behavior so narrow screens remain usable.
* Daily Feed UI text should follow the configured i18n language.
* LeetCode Daily should include a Related Practice block with Warm-up, Core, and Stretch practice links.
* LeetCode Activity should be opt-in through a stored LeetCode username and should only read public profile activity.

## Acceptance Criteria

* [ ] Daily Feed shows four source blocks in one view on desktop-width screens.
* [ ] No tab buttons, selected-tab state, or tab-switching interaction is present for the three sources.
* [ ] Each source block has its own heading and list/loading/error content.
* [ ] LeetCode Daily includes a localized Related Practice block.
* [ ] LeetCode Activity shows recent public activity frequency when a username is configured.
* [ ] Daily Feed labels, actions, and generated metadata update when language changes.
* [ ] Type-check/build passes.

## Definition Of Done

* Implementation is scoped to Daily Feed component/style/page integration as needed.
* Project quality command runs successfully or any blocker is reported.
* No unrelated dirty work is reverted or included.

## Out Of Scope

* Changing feed fetching APIs or ranking logic.
* Adding new feed sources.
* Changing bookmark management behavior.

## Technical Notes

* Relevant files: `src/components/DailyFeed.tsx`, `src/styles/global.css`, `src/pages/NewTabPage.tsx`.
* Relevant specs: `.trellis/spec/frontend/index.md` and component/style guidelines referenced by it.
