import { useEffect, useState } from "react";
import { useI18n } from "./useI18n";
import type { LlmScopeChoice } from "../components/LlmScopeModal";
import {
  applyLlmSuggestion,
  buildLlmSuggestionScope,
  loadLlmSuggestionBatch,
  requestLlmClassificationSuggestions,
  saveLlmSuggestionBatch,
  updateSuggestionStatus,
  type LlmClassificationSuggestion,
  type LlmSuggestionBatch
} from "../services/llmSuggestionService";
import type { BookmarkItem, FolderItem } from "../types/bookmarks";

export function useLlmSuggestions() {
  const { messages } = useI18n();
  const [suggestionBatch, setSuggestionBatch] = useState<LlmSuggestionBatch | null>(null);
  const [suggestionMessage, setSuggestionMessage] = useState<string | null>(null);
  const [isRequestingSuggestions, setIsRequestingSuggestions] = useState(false);
  const [isLlmScopeModalOpen, setIsLlmScopeModalOpen] = useState(false);

  const pendingSuggestions =
    suggestionBatch?.suggestions.filter((suggestion) => suggestion.status === "pending") ?? [];

  // Load persisted suggestions on mount
  useEffect(() => {
    let isMounted = true;

    async function loadSaved() {
      const batch = await loadLlmSuggestionBatch();
      if (isMounted) setSuggestionBatch(batch);
    }

    void loadSaved();
    return () => {
      isMounted = false;
    };
  }, []);

  function openLlmScopeModal(
    selectedBookmarks: BookmarkItem[],
    visibleBookmarks: BookmarkItem[]
  ): LlmScopeChoice {
    if (!selectedBookmarks.length && !visibleBookmarks.length) {
      setSuggestionMessage(messages.newTab.llm.noBookmarks);
      return "visible";
    }
    setIsLlmScopeModalOpen(true);
    return selectedBookmarks.length ? "selected" : "visible";
  }

  async function requestSuggestions(
    scope: LlmScopeChoice,
    selectedBookmarks: BookmarkItem[],
    visibleBookmarks: BookmarkItem[],
    folders: FolderItem[]
  ) {
    const scopeBookmarks = scope === "selected" ? selectedBookmarks : visibleBookmarks;

    if (!scopeBookmarks.length) {
      setSuggestionMessage(messages.newTab.llm.noBookmarks);
      return;
    }

    try {
      setIsRequestingSuggestions(true);
      setSuggestionMessage(null);
      setIsLlmScopeModalOpen(false);

      const batch = await requestLlmClassificationSuggestions(
        buildLlmSuggestionScope(scopeBookmarks, folders)
      );
      setSuggestionBatch(batch);
      setSuggestionMessage(messages.newTab.llm.suggestionsReady(batch.suggestions.length));
    } catch (error) {
      setSuggestionMessage(
        error instanceof Error ? error.message : messages.newTab.llm.error
      );
    } finally {
      setIsRequestingSuggestions(false);
    }
  }

  async function persistBatch(batch: LlmSuggestionBatch | null) {
    setSuggestionBatch(batch);
    await saveLlmSuggestionBatch(batch);
  }

  async function rejectSuggestion(suggestionId: string) {
    if (!suggestionBatch) return;
    await persistBatch(updateSuggestionStatus(suggestionBatch, suggestionId, "rejected"));
  }

  async function applySuggestion(
    suggestion: LlmClassificationSuggestion,
    folders: FolderItem[],
    refreshBookmarks: () => Promise<void>
  ) {
    if (!suggestionBatch) return;

    try {
      await applyLlmSuggestion(suggestion, folders);
      const nextBatch = updateSuggestionStatus(suggestionBatch, suggestion.id, "applied");
      await persistBatch(nextBatch);
      await refreshBookmarks();
      setSuggestionMessage(messages.newTab.llm.applied);
    } catch (error) {
      setSuggestionMessage(
        error instanceof Error ? error.message : messages.newTab.llm.applyError
      );
    }
  }

  async function applyAllSuggestions(
    folders: FolderItem[],
    refreshBookmarks: () => Promise<void>
  ) {
    for (const suggestion of pendingSuggestions) {
      await applySuggestion(suggestion, folders, refreshBookmarks);
    }
  }

  function dismissSuggestionMessage() {
    setSuggestionMessage(null);
  }

  return {
    suggestionBatch,
    suggestionMessage,
    isRequestingSuggestions,
    isLlmScopeModalOpen,
    setIsLlmScopeModalOpen,
    pendingSuggestions,

    openLlmScopeModal,
    requestSuggestions,
    persistBatch,
    rejectSuggestion,
    applySuggestion,
    applyAllSuggestions,
    dismissSuggestionMessage
  };
}
