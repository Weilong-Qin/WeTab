import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { useI18n } from "./useI18n";
import {
  captureBookmarkNodeSnapshots,
  copyBookmarkNode,
  createBookmark,
  createFolder,
  deleteBookmark,
  deleteFolder,
  filterBookmarks,
  findFolderPath,
  hasFolder,
  loadBookmarkView,
  moveBookmarkNode,
  resolveWritableParentFolderId,
  restoreBookmarkNodeSnapshots,
  subscribeToBookmarkChanges,
  updateBookmark,
  updateFolder,
  type BookmarkNodeSnapshot
} from "../services/bookmarkService";
import type { BookmarkItem, FolderItem } from "../types/bookmarks";
import {
  canMoveItem,
  flattenFolders,
  pruneNestedSelections,
  type OrganizationItemRef,
  type UndoAction
} from "../utils/organization";

export function useBookmarkData() {
  const { messages } = useI18n();
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [undoAction, setUndoAction] = useState<UndoAction | null>(null);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  // ---- Data loading ----

  const applyBookmarkView = useCallback(
    (view: Awaited<ReturnType<typeof loadBookmarkView>>) => {
      setFolders(view.folders);
      setBookmarks(view.bookmarks);
      setSelectedFolderId((currentFolderId) =>
        currentFolderId === "all" || hasFolder(view.folders, currentFolderId)
          ? currentFolderId
          : "all"
      );
      setErrorMessage(null);
    },
    []
  );

  const refreshBookmarks = useCallback(async () => {
    const view = await loadBookmarkView(messages.bookmarkView);
    applyBookmarkView(view);
  }, [applyBookmarkView, messages.bookmarkView]);

  useEffect(() => {
    let isMounted = true;

    async function initialLoad() {
      try {
        const view = await loadBookmarkView(messages.bookmarkView);
        if (!isMounted) return;
        applyBookmarkView(view);
      } catch (error) {
        if (!isMounted) return;
        setErrorMessage(
          error instanceof Error ? error.message : messages.bookmarkView.bookmarkAccessUnavailable
        );
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void initialLoad();
    const unsubscribe = subscribeToBookmarkChanges(() => void initialLoad());

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [applyBookmarkView, messages.bookmarkView]);

  // ---- Mutation wrapper ----

  async function withMutation<T>(fn: () => Promise<T>): Promise<T | undefined> {
    try {
      setIsMutating(true);
      return await fn();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : messages.newTab.editor.saveError
      );
      return undefined;
    } finally {
      setIsMutating(false);
    }
  }

  // ---- Derived data ----

  const flatFolders = useMemo(
    () => flattenFolders(folders).filter((folder) => folder.id !== "all"),
    [folders]
  );

  const visibleBookmarks = useMemo(
    () => filterBookmarks(bookmarks, deferredQuery, selectedFolderId),
    [bookmarks, deferredQuery, selectedFolderId]
  );

  // ---- CRUD operations ----

  async function submitEditor(
    intent: string,
    editorValues: { title: string; url: string },
    editorBookmark?: BookmarkItem,
    editorFolder?: FolderItem
  ) {
    const parentId = resolveWritableParentFolderId(folders, selectedFolderId);

    await withMutation(async () => {
      if (intent === "create-folder") {
        await createFolder({ parentId, title: editorValues.title });
      } else if (intent === "edit-folder" && editorFolder) {
        await updateFolder({ id: editorFolder.id, title: editorValues.title });
      } else if (intent === "edit-bookmark" && editorBookmark) {
        await updateBookmark({
          id: editorBookmark.id,
          title: editorValues.title,
          url: editorValues.url
        });
      } else {
        await createBookmark({
          parentId,
          title: editorValues.title,
          url: editorValues.url
        });
      }

      await refreshBookmarks();
    });
  }

  async function removeBookmark(bookmark: BookmarkItem, confirmMessage: string) {
    if (!window.confirm(confirmMessage)) return;

    await withMutation(async () => {
      const snapshots = await captureBookmarkNodeSnapshots([bookmark.id]);
      await deleteBookmark(bookmark.id);
      await refreshBookmarks();
      setUndoAction({
        label: messages.newTab.undo.deleteComplete(1),
        snapshots,
        type: "delete"
      });
    });
  }

  async function removeFolder(folder: FolderItem, confirmMessage: string) {
    if (!window.confirm(confirmMessage)) return;

    await withMutation(async () => {
      const snapshots = await captureBookmarkNodeSnapshots([folder.id]);
      await deleteFolder(folder.id);
      await refreshBookmarks();
      setUndoAction({
        label: messages.newTab.undo.deleteComplete(1),
        snapshots,
        type: "delete"
      });
    });
  }

  async function bulkDelete(
    itemsToDelete: OrganizationItemRef[],
    confirmMessage: string
  ) {
    const pruned = pruneNestedSelections(itemsToDelete, folders);
    if (!pruned.length || !window.confirm(confirmMessage)) return;

    await withMutation(async () => {
      const snapshots = await captureBookmarkNodeSnapshots(pruned.map((item) => item.id));

      for (const item of pruned) {
        if (item.type === "folder") {
          await deleteFolder(item.id);
        } else {
          await deleteBookmark(item.id);
        }
      }

      await refreshBookmarks();
      setUndoAction({
        label: messages.newTab.undo.deleteComplete(pruned.length),
        snapshots,
        type: "delete"
      });
    });
  }

  async function moveItems(
    items: OrganizationItemRef[],
    targetParentId?: string,
    targetIndex?: number
  ) {
    const movableItems = items.filter((item) => canMoveItem(item, targetParentId, folders));
    if (!movableItems.length) return;

    await withMutation(async () => {
      for (const item of movableItems) {
        await moveBookmarkNode({
          id: item.id,
          index: targetIndex,
          parentId: targetParentId
        });
      }

      await refreshBookmarks();
      setUndoAction({
        entries: movableItems,
        label: messages.newTab.undo.moveComplete(movableItems.length),
        type: "move"
      });
    });
  }

  async function copyItems(
    items: OrganizationItemRef[],
    targetParentId?: string,
    targetIndex?: number
  ) {
    const copyableItems = pruneNestedSelections(
      items.filter((item) => canMoveItem(item, targetParentId, folders)),
      folders
    );
    if (!targetParentId || !copyableItems.length) return;

    await withMutation(async () => {
      const copiedItems: OrganizationItemRef[] = [];

      for (const item of copyableItems) {
        const copiedNode = await copyBookmarkNode({
          id: item.id,
          index: targetIndex,
          parentId: targetParentId
        });

        if (copiedNode) {
          copiedItems.push({
            id: copiedNode.id,
            parentId: copiedNode.parentId,
            type: item.type
          });
        }
      }

      await refreshBookmarks();
      setUndoAction({
        entries: copiedItems,
        label: messages.newTab.undo.copyComplete(copiedItems.length),
        type: "copy"
      });
    });
  }

  async function undo() {
    if (!undoAction) return;

    await withMutation(async () => {
      if (undoAction.type === "move") {
        for (const entry of undoAction.entries) {
          await moveBookmarkNode({
            id: entry.id,
            index: entry.index,
            parentId: entry.parentId
          });
        }
      } else if (undoAction.type === "copy") {
        for (const entry of undoAction.entries) {
          if (entry.type === "folder") {
            await deleteFolder(entry.id);
          } else {
            await deleteBookmark(entry.id);
          }
        }
      } else {
        await restoreBookmarkNodeSnapshots(undoAction.snapshots);
      }

      await refreshBookmarks();
      setUndoAction(null);
    });
  }

  // ---- Breadcrumb ----

  const currentBreadcrumb = useMemo(
    () => findFolderPath(folders, selectedFolderId),
    [folders, selectedFolderId]
  );

  return {
    // State
    folders,
    bookmarks,
    selectedFolderId,
    setSelectedFolderId,
    query,
    setQuery,
    isLoading,
    isMutating,
    errorMessage,
    undoAction,
    setUndoAction,

    // Derived
    flatFolders,
    visibleBookmarks,
    currentBreadcrumb,

    // Operations
    refreshBookmarks,
    withMutation,
    submitEditor,
    removeBookmark,
    removeFolder,
    bulkDelete,
    moveItems,
    copyItems,
    undo
  };
}
