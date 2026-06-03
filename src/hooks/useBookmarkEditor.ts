import { useMemo, useState } from "react";
import type { BookmarkEditorValues } from "../components/BookmarkEditorModal";
import type { BookmarkItem, FolderItem } from "../types/bookmarks";
import { useI18n } from "./useI18n";

type EditorIntent = "create-bookmark" | "create-folder" | "edit-bookmark" | "edit-folder";

export interface EditorState {
  intent: EditorIntent;
  bookmark?: BookmarkItem;
  folder?: FolderItem;
}

const EMPTY_EDITOR_VALUES: BookmarkEditorValues = { title: "", url: "" };

export function useBookmarkEditor() {
  const { messages } = useI18n();
  const [editorState, setEditorState] = useState<EditorState | null>(null);
  const [editorValues, setEditorValues] = useState<BookmarkEditorValues>(EMPTY_EDITOR_VALUES);
  const [editorError, setEditorError] = useState<string | null>(null);

  function openCreateBookmark() {
    setEditorState({ intent: "create-bookmark" });
    setEditorValues(EMPTY_EDITOR_VALUES);
    setEditorError(null);
  }

  function openCreateFolder() {
    setEditorState({ intent: "create-folder" });
    setEditorValues(EMPTY_EDITOR_VALUES);
    setEditorError(null);
  }

  function openEditBookmark(bookmark: BookmarkItem) {
    setEditorState({ intent: "edit-bookmark", bookmark });
    setEditorValues({ title: bookmark.title, url: bookmark.url });
    setEditorError(null);
  }

  function openEditFolder(folder: FolderItem) {
    setEditorState({ intent: "edit-folder", folder });
    setEditorValues({ title: folder.label, url: "" });
    setEditorError(null);
  }

  function closeEditor(isSaving: boolean) {
    if (isSaving) return;
    setEditorState(null);
    setEditorValues(EMPTY_EDITOR_VALUES);
    setEditorError(null);
  }

  function resetEditor() {
    setEditorState(null);
    setEditorValues(EMPTY_EDITOR_VALUES);
  }

  function clearEditorError() {
    setEditorError(null);
  }

  const editorLabels = useMemo(() => {
    if (editorState?.intent === "create-folder") return messages.newTab.editor.createFolder;
    if (editorState?.intent === "edit-folder") return messages.newTab.editor.editFolder;
    if (editorState?.intent === "edit-bookmark") return messages.newTab.editor.editBookmark;
    return messages.newTab.editor.createBookmark;
  }, [editorState?.intent, messages.newTab.editor]);

  return {
    editorState,
    editorValues,
    setEditorValues,
    editorError,
    clearEditorError,
    editorLabels,
    openCreateBookmark,
    openCreateFolder,
    openEditBookmark,
    openEditFolder,
    closeEditor,
    resetEditor
  };
}
