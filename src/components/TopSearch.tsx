import { useEffect, useRef } from "react";
import { Icon } from "./Icon";

export interface TopSearchProps {
  value: string;
  onChange: (value: string) => void;
  ariaLabel?: string;
  placeholder?: string;
}

export function TopSearch({
  value,
  onChange,
  ariaLabel = "Search bookmarks",
  placeholder = "Search bookmarks, tabs, or ask AI..."
}: TopSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    }

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  return (
    <div className="top-search" role="search">
      <Icon className="top-search__icon" name="search" size={16} />
      <input
        ref={inputRef}
        aria-label={ariaLabel}
        className="top-search__input"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type="search"
        value={value}
      />
      <div className="top-search__keys" aria-hidden="true">
        <kbd>{navigator.platform.toLowerCase().includes("mac") ? "⌘" : "Ctrl"}</kbd>
        <kbd>K</kbd>
      </div>
    </div>
  );
}
