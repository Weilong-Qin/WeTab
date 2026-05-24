# Hook Guidelines

> How hooks are used in this project.

---

## Overview

Custom hooks are used for reusable React state/effect orchestration. Services own browser APIs; hooks call services and expose React-friendly values.

---

## Custom Hook Patterns

Hook files live under `src/hooks/` and must start with `use`.

Example:

```tsx
const { language, messages, setLanguage } = useI18n();
```

`useI18n()` is the canonical way to access localized UI text. It:

* Resolves stored language.
* Falls back to browser UI language.
* Listens to `browser.storage.onChanged`.
* Updates `document.documentElement.lang`.

---

## Data Fetching

Do not fetch browser data directly inside reusable components. For bookmark data, pages call `bookmarkService` in an effect and subscribe through `subscribeToBookmarkChanges`.

```tsx
useEffect(() => {
  void refreshBookmarks();
  const unsubscribe = subscribeToBookmarkChanges(() => void refreshBookmarks());
  return unsubscribe;
}, [messages.bookmarkView]);
```

Use an `isMounted` guard when resolving async work into state.

---

## Naming Conventions

* Hook names: `useI18n`, `use<Domain>`.
* Hook return values should be objects, not tuples, when more than two values are returned.
* Expose setter functions with clear names such as `setLanguage`.

---

## Common Mistakes

* Do not hide write operations inside a hook without naming them. `setLanguage()` is explicit; automatic bookmark writes would not be.
* Do not put raw message strings in pages when a message key exists.
* Do not forget cleanup for storage or bookmark event listeners.
