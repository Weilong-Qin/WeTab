# tmp.html Design System Extraction

## Source

* `tmp.html` in repo root, inspected on 2026-05-24.

## Product Visual Direction

The source page is a polished "Digital Air" browser-homepage UI. It uses a bright frosted-glass surface system over a soft radial background, with dense but calm bookmark-management layout:

* Fixed 280px left sidebar.
* Fixed top floating search bar for the main canvas.
* Main content offset by sidebar width.
* Folder navigation in the sidebar.
* Bookmark grid with glass cards and hover lift.
* Floating action button in the bottom-right.
* Material Symbols style iconography.

## Design Tokens

### Color

Core colors from the Tailwind config:

* `background`: `#f9f9fb`
* `surface`: `#f9f9fb`
* `surface-container-lowest`: `#ffffff`
* `surface-container-low`: `#f3f3f5`
* `surface-container`: `#eeeef0`
* `surface-container-high`: `#e8e8ea`
* `surface-container-highest`: `#e2e2e4`
* `surface-dim`: `#d9dadc`
* `surface-bright`: `#f9f9fb`
* `on-surface`: `#1a1c1d`
* `on-surface-variant`: `#444748`
* `outline`: `#747878`
* `outline-variant`: `#c4c7c7`
* `primary`: `#000000`
* `primary-container`: `#1c1b1b`
* `secondary`: `#0058bc`
* `secondary-container`: `#0070eb`
* `error`: `#ba1a1a`
* `error-container`: `#ffdad6`
* Accent tag colors:
  * `on-tertiary-fixed-variant`: `#930005`
  * `on-secondary-fixed-variant`: `#004493`

### Typography

The source uses Inter for all families:

* Display: 48px / 1.1 / weight 600 / letter spacing -0.04em.
* Headline large: 32px / 1.2 / weight 600 / letter spacing -0.03em.
* Headline medium: 24px / 1.3 / weight 500 / letter spacing -0.02em.
* Body large: 18px / 1.5 / weight 400 / letter spacing -0.01em.
* Body medium: 15px / 1.5 / weight 400 / letter spacing -0.01em.
* Label medium: 13px / 1.2 / weight 500 / letter spacing 0.01em.
* Label small: 11px / 1.2 / weight 600 / letter spacing 0.03em.

Implementation note: keep these as named CSS custom properties/classes. The source uses negative letter spacing; the project should preserve source fidelity for this migrated design even though future new UI should avoid inventing additional negative tracking.

### Spacing and Layout

* Sidebar width: 280px.
* Container padding: 40px.
* Gutter: 24px.
* Card gap: 20px.
* Base unit: 8px.
* Search bar height: 56px.
* Top search header height: 96px.
* Main content top padding: 112px.

### Radius

* Default: 4px.
* Large: 8px.
* XL: 12px.
* 2XL/card: 16px.
* Empty state: 32px.
* Full: 9999px.

### Effects

* Page background: radial gradient from `#f9f9fb` to `#eeeef0`.
* Glass panel: `rgba(249, 249, 251, 0.6)`, `backdrop-filter: blur(40px)`, subtle outline.
* Bookmark card hover: scale 1.02, 20px/40px soft shadow, secondary-tinted border.
* Search focus: secondary ring, shadow lift, scale 1.01.
* Icon tile hover: icon tile scales to 1.1.
* FAB hover: scale 1.05; active scale 0.95.

## Reusable Components to Extract

* `AppShell`: fixed sidebar plus offset main content.
* `Sidebar`: brand block, AI action button, folder tree, sync footer, settings entry.
* `SidebarItem`: supports active, nested, count, icon, expanded/collapsed.
* `TopSearch`: glass rounded search input with command shortcut hints.
* `Button`: primary, glass/icon, fab variants.
* `GlassPanel`: reusable frosted surface wrapper.
* `BookmarkCard`: compact card with icon, title, description, tag, optional verified state, hover action.
* `FeatureCard`: wider asymmetric card with image/preview content.
* `Tag`: compact uppercase folder/category label.
* `EmptyState`: dashed glass add panel.
* `DesignTokenSwatch`: used only in design-system preview.

## Responsive Rules

The source is desktop-first:

* Sidebar fixed at 280px on desktop.
* Main canvas starts after sidebar.
* Bookmark grid: 1 column base, 2 at small, 3 at large, 4 at extra large.
* Search bar is centered and max-width 672px.

Implementation should add mobile behavior that the source does not fully define:

* Sidebar becomes a top/overlay panel below tablet widths.
* Main canvas has no left margin on mobile.
* Search header spans full width on mobile.
* Grid remains one column on narrow screens.

## Interaction Requirements

* Clicking/focusing the search bar visually lifts it.
* `Ctrl+K` / `Cmd+K` focuses search.
* Sidebar items use subtle background hover.
* Bookmark cards expose the action icon on hover/focus.
* Buttons and cards need keyboard-focus states, not hover-only affordances.

## Migration Notes

* Do not keep Tailwind CDN. Implement the extracted token system in project CSS.
* Do not inline repeated class stacks in pages. Use React components and CSS classes.
* Avoid remote images as required assets. Use local CSS fallback icon tiles and deterministic placeholder initials for bookmarks.
* The design-system preview page should demonstrate tokens and components with sample data only.
