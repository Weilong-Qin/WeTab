# Component Guidelines

> How components are built in this project.

---

## Overview

vTab uses reusable React components styled by shared CSS classes from the Digital Air design system. Pages must reuse existing components first and extend them through props, variants, and `className` before creating similar components.

---

## Component Structure

Use named exports and explicit prop interfaces:

```tsx
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "glass" | "icon" | "fab" | "subtle";
  icon?: IconName;
}

export function Button({ variant = "glass", icon, children, ...props }: ButtonProps) {
  // ...
}
```

Keep component files focused:

* UI-only rendering belongs in `src/components/`.
* Page data orchestration belongs in `src/pages/`.
* Browser APIs and storage access belong in `src/services/`, not components.

---

## Props Conventions

* Use typed callbacks such as `onSelectFolder: (id: string) => void`.
* Use label props for accessibility and localization, for example `openNavigationLabel`, `navLabel`, `expandFolderLabel`.
* Use variants for repeated visual differences. Do not fork a component for a one-off style.
* Preserve `className` support where composition is useful.

---

## Styling Patterns

Shared component styles live in `src/styles/global.css`; tokens live in `src/styles/tokens.css`.

Correct:

```tsx
<Button icon="sparkles" variant="primary">
  {messages.newTab.sidebar.actionLabel}
</Button>
```

Wrong:

```tsx
// Do not recreate a button with ad hoc style objects or copied class stacks.
<button style={{ borderRadius: 999, padding: 16 }}>AI</button>
```

---

## Accessibility

* Icon-only buttons require `aria-label`.
* Expandable tree controls require `aria-expanded`.
* Current navigation targets should use `aria-current="page"` where applicable.
* Search inputs require a localized `aria-label`.
* Drag handles should expose `role="separator"` with min/max/current values.

---

## Common Mistakes

* Do not call `browser.*` APIs from components. Add or extend a service.
* Do not translate user data such as bookmark titles or folder names.
* Do not create a second card style for ordinary bookmark items; use `BookmarkCard` for the main grid.
* Do not add page-only visual primitives without adding them to the design-system preview when they become reusable.
* Do not call a loading helper from `useEffect()` if that helper synchronously calls `setState()` before awaiting data. Initialize loading state up front, then update state from the async completion callback or a user event handler so `react-hooks/set-state-in-effect` stays green.
