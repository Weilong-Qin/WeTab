# PRD: UI Refinements

## Problem
1. Settings page is too tall and unreadable due to large descriptions. Needs tooltip-based descriptions.
2. Sidebar navigation shows expand/collapse arrows even for folders with no children.
3. Sidebar folders lack visual drop feedback during drag-and-drop.

## Goals
- **Settings Layout**: Move verbose descriptions/help text into native tooltips (e.g., using `title` on an info icon) to compress the vertical size of the settings modal.
- **Sidebar Arrows**: Conditionally render the toggle arrow only if `folder.children?.length > 0`.
- **Drag Feedback**: Implement `onDragEnter`, `onDragLeave`, and `onDrop` state management in `SidebarItem` to apply a highlight class (`isDragOver`) when another item is dragged over a folder. Adjust `global.css` to respect this class.

## Scope
- Modify `SettingsModal.tsx` and `global.css` to clean up text descriptions.
- Modify `Sidebar.tsx` to add child-checking for the chevron icon and drag-over state.
- Update `global.css` for `.sidebar-item--drag-over`.
