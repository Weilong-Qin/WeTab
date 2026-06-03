import { useEffect, useRef, useState } from "react";
import { useI18n } from "./useI18n";
import { validateBookmarkUrls } from "../services/urlValidationService";
import type { BookmarkItem } from "../types/bookmarks";

export function useUrlValidation() {
  const { messages } = useI18n();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [isValidatingUrls, setIsValidatingUrls] = useState(false);
  const validationMessageTimeoutRef = useRef<ReturnType<typeof globalThis.setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (validationMessageTimeoutRef.current !== null) {
        globalThis.clearTimeout(validationMessageTimeoutRef.current);
      }
    };
  }, []);

  function dismissValidationMessage() {
    if (validationMessageTimeoutRef.current !== null) {
      globalThis.clearTimeout(validationMessageTimeoutRef.current);
      validationMessageTimeoutRef.current = null;
    }
    setValidationMessage(null);
  }

  async function validateVisible(
    visibleBookmarks: BookmarkItem[],
    refreshBookmarks: () => Promise<void>
  ) {
    if (!visibleBookmarks.length) return;

    dismissValidationMessage();

    try {
      setIsValidatingUrls(true);
      setValidationMessage(null);

      await validateBookmarkUrls(
        visibleBookmarks.map((bookmark) => ({
          id: bookmark.id,
          url: bookmark.url
        }))
      );

      await refreshBookmarks();
      setValidationMessage(messages.newTab.urlValidation.complete(visibleBookmarks.length));
      validationMessageTimeoutRef.current = globalThis.setTimeout(() => {
        setValidationMessage(null);
        validationMessageTimeoutRef.current = null;
      }, 3500);
    } catch (error) {
      setValidationMessage(
        error instanceof Error ? error.message : messages.newTab.urlValidation.error
      );
      validationMessageTimeoutRef.current = globalThis.setTimeout(() => {
        setValidationMessage(null);
        validationMessageTimeoutRef.current = null;
      }, 4500);
    } finally {
      setIsValidatingUrls(false);
    }
  }

  return {
    validationMessage,
    isValidatingUrls,
    dismissValidationMessage,
    validateVisible
  };
}
