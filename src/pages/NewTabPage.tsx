import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type DragEvent,
  type MouseEvent,
  type PointerEvent as ReactPointerEvent
} from "react";
import { AppShell } from "../components/AppShell";
import { BookmarkCard } from "../components/BookmarkCard";
import { BookmarkEditorModal, type BookmarkEditorValues } from "../components/BookmarkEditorModal";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { Button } from "../components/Button";
import { EmptyState } from "../components/EmptyState";
import { Icon } from "../components/Icon";
import { Sidebar } from "../components/Sidebar";
import { TopSearch } from "../components/TopSearch";
import { useI18n } from "../hooks/useI18n";
import { SettingsModal } from "../components/SettingsModal";
import { useThemePreference } from "../hooks/useThemePreference";
import { useUrlValidationSchedule } from "../hooks/useUrlValidationSchedule";
import {
  copyBookmarkNode,
  createBookmark,
  createFolder,
  captureBookmarkNodeSnapshots,
  deleteBookmark,
  deleteFolder,
  filterBookmarks,
  findFolderPath,
  hasFolder,
  isDescendantFolder,
  loadBookmarkView,
  moveBookmarkNode,
  resolveWritableParentFolderId,
  restoreBookmarkNodeSnapshots,
  subscribeToBookmarkChanges,
  updateBookmark,
  updateFolder,
  type BookmarkNodeSnapshot
} from "../services/bookmarkService";
import {
  applyLlmSuggestion,
  buildLlmSuggestionScope,
  loadLlmSuggestionBatch,
  requestLlmClassificationSuggestions,
  saveLlmSuggestionBatch,
  updateSuggestionStatus,
  type LlmSuggestionBatch,
  type LlmClassificationSuggestion
} from "../services/llmSuggestionService";
import { validateBookmarkUrls } from "../services/urlValidationService";
import { runScheduledUrlValidation } from "../services/urlValidationScheduleService";
import type { BookmarkItem, FolderItem } from "../types/bookmarks";

type EditorIntent = "create-bookmark" | "create-folder" | "edit-bookmark" | "edit-folder";

interface EditorState {
  intent: EditorIntent;
  bookmark?: BookmarkItem;
  folder?: FolderItem;
}

type OrganizationItemType = "bookmark" | "folder";

interface OrganizationItemRef {
  id: string;
  index?: number;
  parentId?: string;
  type: OrganizationItemType;
}

type UndoState =
  | {
      entries: OrganizationItemRef[];
      label: string;
      type: "move";
    }
  | {
      entries: OrganizationItemRef[];
      label: string;
      type: "copy";
    }
  | {
      label: string;
      snapshots: BookmarkNodeSnapshot[];
      type: "delete";
    };

interface ContextMenuState {
  item: OrganizationItemRef;
  label: string;
  x: number;
  y: number;
}

type SelectionRegion = "bookmarks" | "folders";

interface MarqueeSelectionState {
  baseKeys: Set<string>;
  currentX: number;
  currentY: number;
  originX: number;
  originY: number;
  region: SelectionRegion;
}

const EMPTY_EDITOR_VALUES: BookmarkEditorValues = {
  title: "",
  url: ""
};

export function NewTabPage() {
  const { messages } = useI18n();
  useThemePreference();
  const {
    isUrlValidationScheduleLoading,
    urlValidationSchedule
  } = useUrlValidationSchedule();
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState("all");
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isValidatingUrls, setIsValidatingUrls] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [editorError, setEditorError] = useState<string | null>(null);
  const [editorState, setEditorState] = useState<EditorState | null>(null);
  const [editorValues, setEditorValues] = useState<BookmarkEditorValues>(EMPTY_EDITOR_VALUES);
  const [selectionModeRegion, setSelectionModeRegion] = useState<SelectionRegion | null>(null);
  const [selectedItemKeys, setSelectedItemKeys] = useState<Set<string>>(() => new Set());
  const [lastSelectedBookmarkId, setLastSelectedBookmarkId] = useState<string | null>(null);
  const [lastSelectedFolderId, setLastSelectedFolderId] = useState<string | null>(null);
  const [moveTargetFolderId, setMoveTargetFolderId] = useState("");
  const [undoState, setUndoState] = useState<UndoState | null>(null);
  const [isRequestingSuggestions, setIsRequestingSuggestions] = useState(false);
  const [suggestionBatch, setSuggestionBatch] = useState<LlmSuggestionBatch | null>(null);
  const [suggestionMessage, setSuggestionMessage] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [marqueeSelection, setMarqueeSelection] = useState<MarqueeSelectionState | null>(null);
  const sidebarSelectionRef = useRef<HTMLElement | null>(null);
  const contentSelectionRef = useRef<HTMLElement | null>(null);
  const lastSelectionRegionRef = useRef<SelectionRegion | null>(null);
  const validationMessageTimeoutRef = useRef<ReturnType<typeof globalThis.setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (validationMessageTimeoutRef.current !== null) {
        globalThis.clearTimeout(validationMessageTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!contextMenu) {
      return;
    }

    function closeContextMenu() {
      setContextMenu(null);
    }

    window.addEventListener("click", closeContextMenu);
    window.addEventListener("keydown", closeContextMenu);
    window.addEventListener("resize", closeContextMenu);

    return () => {
      window.removeEventListener("click", closeContextMenu);
      window.removeEventListener("keydown", closeContextMenu);
      window.removeEventListener("resize", closeContextMenu);
    };
  }, [contextMenu]);

  function dismissValidationMessage() {
    if (validationMessageTimeoutRef.current !== null) {
      globalThis.clearTimeout(validationMessageTimeoutRef.current);
      validationMessageTimeoutRef.current = null;
    }

    setValidationMessage(null);
  }

  function dismissSuggestionMessage() {
    setSuggestionMessage(null);
  }

  const applyBookmarkView = useCallback((view: Awaited<ReturnType<typeof loadBookmarkView>>) => {
    setFolders(view.folders);
    setBookmarks(view.bookmarks);
    setSelectedFolderId((currentFolderId) =>
      currentFolderId === "all" || hasFolder(view.folders, currentFolderId)
        ? currentFolderId
        : "all"
    );
    setErrorMessage(null);
  }, []);

  const refreshBookmarks = useCallback(async () => {
    const view = await loadBookmarkView(messages.bookmarkView);
    applyBookmarkView(view);
  }, [applyBookmarkView, messages.bookmarkView]);

  useEffect(() => {
    let isMounted = true;

    async function refreshBookmarks() {
      try {
        const view = await loadBookmarkView(messages.bookmarkView);

        if (!isMounted) {
          return;
        }

        applyBookmarkView(view);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setErrorMessage(error instanceof Error ? error.message : messages.bookmarkView.bookmarkAccessUnavailable);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void refreshBookmarks();
    const unsubscribe = subscribeToBookmarkChanges(() => void refreshBookmarks());

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [applyBookmarkView, messages.bookmarkView]);

  useEffect(() => {
    let isMounted = true;

    async function loadSavedSuggestions() {
      const batch = await loadLlmSuggestionBatch();

      if (isMounted) {
        setSuggestionBatch(batch);
      }
    }

    void loadSavedSuggestions();

    return () => {
      isMounted = false;
    };
  }, []);

  const visibleBookmarks = useMemo(
    () => filterBookmarks(bookmarks, query, selectedFolderId),
    [bookmarks, query, selectedFolderId]
  );
  const currentBreadcrumb = useMemo(
    () => findFolderPath(folders, selectedFolderId),
    [folders, selectedFolderId]
  );
  const flatFolders = useMemo(() => flattenFolders(folders).filter((folder) => folder.id !== "all"), [folders]);
  const contextMenuTargetFolders = useMemo(() => {
    if (!contextMenu) {
      return flatFolders;
    }

    return flatFolders.filter((folder) => canMoveItem(contextMenu.item, folder.id, folders));
  }, [contextMenu, flatFolders, folders]);
  const selectedItems = useMemo(
    () => getSelectedOrganizationItems(selectedItemKeys, bookmarks, folders),
    [bookmarks, folders, selectedItemKeys]
  );
  const hasSelectedItems = selectedItems.length > 0;
  const isBookmarkSelectionMode = selectionModeRegion === "bookmarks";
  const isFolderSelectionMode = selectionModeRegion === "folders";
  const selectedBookmarks = useMemo(
    () => bookmarks.filter((bookmark) => selectedItemKeys.has(`bookmark:${bookmark.id}`)),
    [bookmarks, selectedItemKeys]
  );
  const classificationBookmarks = selectedBookmarks.length ? selectedBookmarks : visibleBookmarks;
  const pendingSuggestions = suggestionBatch?.suggestions.filter((suggestion) => suggestion.status === "pending") ?? [];
  const editorLabels = useMemo(() => {
    if (editorState?.intent === "create-folder") {
      return messages.newTab.editor.createFolder;
    }

    if (editorState?.intent === "edit-folder") {
      return messages.newTab.editor.editFolder;
    }

    if (editorState?.intent === "edit-bookmark") {
      return messages.newTab.editor.editBookmark;
    }

    return messages.newTab.editor.createBookmark;
  }, [editorState?.intent, messages.newTab.editor]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (editorState || isSettingsOpen || contextMenu) {
        return;
      }

      if (!isSelectAllShortcut(event) || isTextEditingTarget(event.target)) {
        return;
      }

      const region = resolveKeyboardSelectionRegion(
        event.target,
        sidebarSelectionRef.current,
        contentSelectionRef.current,
        lastSelectionRegionRef.current
      );
      const nextKeys = buildSelectAllKeys(region, flatFolders, visibleBookmarks);

      if (!nextKeys.size) {
        return;
      }

      event.preventDefault();
      setSelectedItemKeys(nextKeys);
      setSelectionModeRegion(region);
      lastSelectionRegionRef.current = region;

      if (region === "folders") {
        setLastSelectedFolderId(flatFolders.at(-1)?.id ?? null);
      }

      if (region === "bookmarks") {
        setLastSelectedBookmarkId(visibleBookmarks.at(-1)?.id ?? null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [contextMenu, editorState, flatFolders, isSettingsOpen, visibleBookmarks]);

  useEffect(() => {
    if (!marqueeSelection) {
      return;
    }

    const activeSelection = marqueeSelection;

    function handlePointerMove(event: PointerEvent) {
      const nextSelection: MarqueeSelectionState = {
        baseKeys: activeSelection.baseKeys,
        currentX: event.clientX,
        currentY: event.clientY,
        originX: activeSelection.originX,
        originY: activeSelection.originY,
        region: activeSelection.region
      };

      setMarqueeSelection(nextSelection);
      setSelectedItemKeys(readMarqueeSelectionKeys(nextSelection, sidebarSelectionRef.current, contentSelectionRef.current));
    }

    function handlePointerUp() {
      setMarqueeSelection(null);
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [marqueeSelection]);

  useEffect(() => {
    if (!urlValidationSchedule.enabled || isUrlValidationScheduleLoading) {
      return;
    }

    let isMounted = true;

    async function runValidation() {
      try {
        await runScheduledUrlValidation(bookmarks, urlValidationSchedule);

        if (isMounted) {
          await refreshBookmarks();
        }
      } catch {
        return;
      }
    }

    void runValidation();

    const intervalId = globalThis.setInterval(() => {
      void runValidation();
    }, urlValidationSchedule.intervalMinutes * 60_000);

    return () => {
      isMounted = false;
      globalThis.clearInterval(intervalId);
    };
  }, [bookmarks, isUrlValidationScheduleLoading, refreshBookmarks, urlValidationSchedule]);

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

  function closeEditor() {
    if (isSaving) {
      return;
    }

    setEditorState(null);
    setEditorValues(EMPTY_EDITOR_VALUES);
    setEditorError(null);
  }

  function toggleSelectionMode() {
    if (selectionModeRegion === "bookmarks") {
      clearSelection();
      return;
    }

    activateSelectionRegion("bookmarks");
  }

  function clearSelection() {
    setSelectedItemKeys(new Set());
    setLastSelectedBookmarkId(null);
    setLastSelectedFolderId(null);
    setMoveTargetFolderId("");
    setSelectionModeRegion(null);
    lastSelectionRegionRef.current = null;
  }

  function activateSelectionRegion(region: SelectionRegion, keepCurrentRegionKeys = true) {
    setSelectionModeRegion(region);
    lastSelectionRegionRef.current = region;
    setSelectedItemKeys((currentKeys) =>
      keepCurrentRegionKeys ? filterSelectionKeysForRegion(currentKeys, region) : new Set()
    );
  }

  function handleSelectionPointerDown(region: SelectionRegion, event: ReactPointerEvent<HTMLElement>) {
    if (event.button !== 0 || shouldIgnoreMarqueeStart(event.target)) {
      return;
    }

    const hasSelectableItems = region === "folders" ? flatFolders.length > 0 : visibleBookmarks.length > 0;

    if (!hasSelectableItems) {
      return;
    }

    event.preventDefault();
    setContextMenu(null);
    activateSelectionRegion(region, event.ctrlKey || event.metaKey);
    setMarqueeSelection({
      baseKeys: event.ctrlKey || event.metaKey ? filterSelectionKeysForRegion(selectedItemKeys, region) : new Set(),
      currentX: event.clientX,
      currentY: event.clientY,
      originX: event.clientX,
      originY: event.clientY,
      region
    });
  }

  function handleSelectBookmark(bookmark: BookmarkItem, event: MouseEvent<HTMLElement>) {
    activateSelectionRegion("bookmarks", event.ctrlKey || event.metaKey || event.shiftKey);
    updateSelection({
      event,
      item: { id: bookmark.id, type: "bookmark" },
      lastId: lastSelectedBookmarkId,
      orderedItems: visibleBookmarks.map((item) => ({ id: item.id, type: "bookmark" as const })),
      setLastId: setLastSelectedBookmarkId,
      setSelectedItemKeys
    });
  }

  function handleSelectFolder(folder: FolderItem, event: MouseEvent<HTMLElement>) {
    activateSelectionRegion("folders", event.ctrlKey || event.metaKey || event.shiftKey);
    updateSelection({
      event,
      item: { id: folder.id, type: "folder" },
      lastId: lastSelectedFolderId,
      orderedItems: flatFolders.map((item) => ({ id: item.id, type: "folder" as const })),
      setLastId: setLastSelectedFolderId,
      setSelectedItemKeys
    });
  }

  async function handleEditorSubmit() {
    if (!editorState) {
      return;
    }

    const parentId = resolveWritableParentFolderId(folders, selectedFolderId);

    try {
      setIsSaving(true);
      setEditorError(null);

      if (editorState.intent === "create-folder") {
        await createFolder({
          parentId,
          title: editorValues.title
        });
      } else if (editorState.intent === "edit-folder" && editorState.folder) {
        await updateFolder({
          id: editorState.folder.id,
          title: editorValues.title
        });
      } else if (editorState.intent === "edit-bookmark" && editorState.bookmark) {
        await updateBookmark({
          id: editorState.bookmark.id,
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
      setEditorState(null);
      setEditorValues(EMPTY_EDITOR_VALUES);
    } catch (error) {
      setEditorError(error instanceof Error ? error.message : messages.newTab.editor.saveError);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteBookmark(bookmark: BookmarkItem) {
    if (!window.confirm(messages.newTab.deleteBookmarkConfirm(bookmark.title))) {
      return;
    }

    try {
      setIsSaving(true);
      const snapshots = await captureBookmarkNodeSnapshots([bookmark.id]);
      await deleteBookmark(bookmark.id);
      await refreshBookmarks();
      setUndoState({
        label: messages.newTab.undo.deleteComplete(1),
        snapshots,
        type: "delete"
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : messages.newTab.editor.saveError);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteFolder(folder: FolderItem) {
    if (!window.confirm(messages.newTab.deleteFolderConfirm(folder.label))) {
      return;
    }

    try {
      setIsSaving(true);
      const snapshots = await captureBookmarkNodeSnapshots([folder.id]);
      await deleteFolder(folder.id);
      await refreshBookmarks();
      setUndoState({
        label: messages.newTab.undo.deleteComplete(1),
        snapshots,
        type: "delete"
      });
      setSelectedItemKeys((currentKeys) => {
        const nextKeys = new Set(currentKeys);
        nextKeys.delete(`folder:${folder.id}`);
        return nextKeys;
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : messages.newTab.editor.saveError);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleBulkDelete() {
    const itemsToDelete = pruneNestedSelections(selectedItems, folders);

    if (!itemsToDelete.length || !window.confirm(messages.newTab.deleteSelectedConfirm(itemsToDelete.length))) {
      return;
    }

    try {
      setIsSaving(true);
      const snapshots = await captureBookmarkNodeSnapshots(itemsToDelete.map((item) => item.id));

      for (const item of itemsToDelete) {
        if (item.type === "folder") {
          await deleteFolder(item.id);
        } else {
          await deleteBookmark(item.id);
        }
      }

      await refreshBookmarks();
      clearSelection();
      setUndoState({
        label: messages.newTab.undo.deleteComplete(itemsToDelete.length),
        snapshots,
        type: "delete"
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : messages.newTab.editor.saveError);
    } finally {
      setIsSaving(false);
    }
  }

  async function moveItems(items: OrganizationItemRef[], targetParentId?: string, targetIndex?: number) {
    const movableItems = items.filter((item) => canMoveItem(item, targetParentId, folders));

    if (!movableItems.length) {
      return;
    }

    try {
      setIsSaving(true);

      for (const item of movableItems) {
        await moveBookmarkNode({
          id: item.id,
          index: targetIndex,
          parentId: targetParentId
        });
      }

      await refreshBookmarks();
      setUndoState({
        entries: movableItems,
        label: messages.newTab.undo.moveComplete(movableItems.length),
        type: "move"
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : messages.newTab.editor.saveError);
    } finally {
      setIsSaving(false);
    }
  }

  async function copyItems(items: OrganizationItemRef[], targetParentId?: string, targetIndex?: number) {
    const copyableItems = pruneNestedSelections(
      items.filter((item) => canMoveItem(item, targetParentId, folders)),
      folders
    );

    if (!targetParentId || !copyableItems.length) {
      return;
    }

    try {
      setIsSaving(true);
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
      setUndoState({
        entries: copiedItems,
        label: messages.newTab.undo.copyComplete(copiedItems.length),
        type: "copy"
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : messages.newTab.editor.saveError);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleMoveSelectedToFolder() {
    if (!moveTargetFolderId || !selectedItems.length) {
      return;
    }

    await moveItems(selectedItems, moveTargetFolderId);
    clearSelection();
  }

  async function handleCopySelectedToFolder() {
    if (!moveTargetFolderId || !selectedItems.length) {
      return;
    }

    await copyItems(selectedItems, moveTargetFolderId);
    clearSelection();
  }

  function handleBookmarkContextMenu(bookmark: BookmarkItem, event: MouseEvent<HTMLElement>) {
    event.preventDefault();
    setContextMenu({
      item: {
        id: bookmark.id,
        index: bookmark.index,
        parentId: bookmark.parentId,
        type: "bookmark"
      },
      label: bookmark.title,
      x: event.clientX,
      y: event.clientY
    });
  }

  function handleFolderContextMenu(folder: FolderItem, event: MouseEvent<HTMLElement>) {
    event.preventDefault();
    setContextMenu({
      item: {
        id: folder.id,
        index: folder.index,
        parentId: folder.parentId,
        type: "folder"
      },
      label: folder.label,
      x: event.clientX,
      y: event.clientY
    });
  }

  function handleContextMenuEdit() {
    if (!contextMenu) {
      return;
    }

    if (contextMenu.item.type === "folder") {
      const folder = flatFolders.find((item) => item.id === contextMenu.item.id);

      if (folder) {
        openEditFolder(folder);
      }
    } else {
      const bookmark = bookmarks.find((item) => item.id === contextMenu.item.id);

      if (bookmark) {
        openEditBookmark(bookmark);
      }
    }

    setContextMenu(null);
  }

  function handleContextMenuDelete() {
    if (!contextMenu) {
      return;
    }

    if (contextMenu.item.type === "folder") {
      const folder = flatFolders.find((item) => item.id === contextMenu.item.id);

      if (folder) {
        void handleDeleteFolder(folder);
      }
    } else {
      const bookmark = bookmarks.find((item) => item.id === contextMenu.item.id);

      if (bookmark) {
        void handleDeleteBookmark(bookmark);
      }
    }

    setContextMenu(null);
  }

  function handleContextMenuMove(targetFolderId: string) {
    if (!contextMenu) {
      return;
    }

    void moveItems([contextMenu.item], targetFolderId);
    setContextMenu(null);
  }

  function handleContextMenuCopy(targetFolderId: string) {
    if (!contextMenu) {
      return;
    }

    void copyItems([contextMenu.item], targetFolderId);
    setContextMenu(null);
  }

  function handleBookmarkDragStart(bookmark: BookmarkItem, event: DragEvent<HTMLElement>) {
    startDrag(event, "bookmark", bookmark.id);
  }

  function handleFolderDragStart(folder: FolderItem, event: DragEvent<HTMLElement>) {
    startDrag(event, "folder", folder.id);
  }

  function handleDropOnFolder(folder: FolderItem, event: DragEvent<HTMLElement>) {
    event.preventDefault();
    const items = readDraggedItems(event);
    void moveItems(items, folder.id);
  }

  function handleDropBeforeBookmark(bookmark: BookmarkItem, event: DragEvent<HTMLElement>) {
    event.preventDefault();
    const items = readDraggedItems(event);
    void moveItems(items.filter((item) => item.type === "bookmark"), bookmark.parentId, bookmark.index);
  }

  function handleDropBeforeFolder(folder: FolderItem, event: DragEvent<HTMLElement>) {
    event.preventDefault();
    const items = readDraggedItems(event);
    void moveItems(items.filter((item) => item.type === "folder"), folder.parentId, folder.index);
  }

  function startDrag(event: DragEvent<HTMLElement>, type: OrganizationItemType, id: string) {
    const itemKey = organizationItemKey({ id, type });
    const draggedItems = selectedItemKeys.has(itemKey)
      ? selectedItems
      : getSelectedOrganizationItems(new Set([itemKey]), bookmarks, folders);

    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("application/vnd.vtab.organization-items", JSON.stringify(draggedItems));
  }

  function readDraggedItems(event: DragEvent<HTMLElement>): OrganizationItemRef[] {
    try {
      const rawValue = event.dataTransfer.getData("application/vnd.vtab.organization-items");
      const parsedValue = JSON.parse(rawValue) as OrganizationItemRef[];
      return Array.isArray(parsedValue) ? parsedValue : [];
    } catch {
      return [];
    }
  }

  async function handleUndo() {
    if (!undoState) {
      return;
    }

    try {
      setIsSaving(true);

      if (undoState.type === "move") {
        for (const entry of undoState.entries) {
          await moveBookmarkNode({
            id: entry.id,
            index: entry.index,
            parentId: entry.parentId
          });
        }
      } else if (undoState.type === "copy") {
        for (const entry of undoState.entries) {
          if (entry.type === "folder") {
            await deleteFolder(entry.id);
          } else {
            await deleteBookmark(entry.id);
          }
        }
      } else {
        await restoreBookmarkNodeSnapshots(undoState.snapshots);
      }

      await refreshBookmarks();
      setUndoState(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : messages.newTab.editor.saveError);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRequestSuggestions() {
    if (!classificationBookmarks.length) {
      setSuggestionMessage(messages.newTab.llm.noBookmarks);
      return;
    }

    try {
      setIsRequestingSuggestions(true);
      setSuggestionMessage(null);
      const batch = await requestLlmClassificationSuggestions(
        buildLlmSuggestionScope(classificationBookmarks, folders)
      );
      setSuggestionBatch(batch);
      setSuggestionMessage(messages.newTab.llm.suggestionsReady(batch.suggestions.length));
    } catch (error) {
      setSuggestionMessage(error instanceof Error ? error.message : messages.newTab.llm.error);
    } finally {
      setIsRequestingSuggestions(false);
    }
  }

  async function persistSuggestionBatch(batch: LlmSuggestionBatch | null) {
    setSuggestionBatch(batch);
    await saveLlmSuggestionBatch(batch);
  }

  async function handleRejectSuggestion(suggestionId: string) {
    if (!suggestionBatch) {
      return;
    }

    await persistSuggestionBatch(updateSuggestionStatus(suggestionBatch, suggestionId, "rejected"));
  }

  async function handleApplySuggestion(suggestion: LlmClassificationSuggestion) {
    if (!suggestionBatch) {
      return;
    }

    try {
      setIsSaving(true);
      await applyLlmSuggestion(suggestion, folders);
      const nextBatch = updateSuggestionStatus(suggestionBatch, suggestion.id, "applied");
      await persistSuggestionBatch(nextBatch);
      await refreshBookmarks();
      setSuggestionMessage(messages.newTab.llm.applied);
    } catch (error) {
      setSuggestionMessage(error instanceof Error ? error.message : messages.newTab.llm.applyError);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleApplyAllSuggestions() {
    for (const suggestion of pendingSuggestions) {
      await handleApplySuggestion(suggestion);
    }
  }

  async function handleValidateVisibleBookmarks() {
    if (!visibleBookmarks.length) {
      return;
    }

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

  return (
    <AppShell
      closeNavigationLabel={messages.appShell.closeNavigation}
      fab={
        <Button icon="bookmarkAdd" onClick={openCreateBookmark} title={messages.newTab.addBookmarkTitle} variant="fab">
          {messages.newTab.addBookmark}
        </Button>
      }
      openNavigationLabel={messages.appShell.openNavigation}
      resizeSidebarLabel={messages.appShell.resizeSidebar}
      sidebar={
        <Sidebar
          actionLabel={isRequestingSuggestions ? messages.newTab.llm.loading : messages.newTab.sidebar.actionLabel}
          actionLabels={messages.newTab.folderActions}
          brandSubtitle={messages.newTab.sidebar.brandSubtitle}
          brandTitle="vTab"
          collapseFolderLabel={messages.newTab.sidebar.collapseFolder}
          expandFolderLabel={messages.newTab.sidebar.expandFolder}
          folderSectionLabel={messages.newTab.sidebar.folderSectionLabel}
          folders={folders}
          navLabel={messages.newTab.sidebar.navLabel}
          onAction={handleRequestSuggestions}
          onDeleteFolder={handleDeleteFolder}
          onDragFolderStart={handleFolderDragStart}
          onDropBeforeFolder={handleDropBeforeFolder}
          onDropOnFolder={handleDropOnFolder}
          onEditFolder={openEditFolder}
          onFolderContextMenu={handleFolderContextMenu}
          onSelectFolder={setSelectedFolderId}
          onSelectFolderItem={handleSelectFolder}
          onSelectionPointerDown={(event) => handleSelectionPointerDown("folders", event)}
          selectionContainerRef={sidebarSelectionRef}
          selectedItemKeys={selectedItemKeys}
          selectedFolderId={selectedFolderId}
          selectionMode={isFolderSelectionMode}
          onOpenSettings={() => setIsSettingsOpen(true)}
          settingsLabel={messages.settings.openButton}
        />
      }
      topSearch={
        <TopSearch
          ariaLabel={messages.newTab.searchAriaLabel}
          onChange={setQuery}
          placeholder={messages.newTab.searchPlaceholder}
          value={query}
        />
      }
    >
      <section
        className="content-section"
        onPointerDown={(event) => handleSelectionPointerDown("bookmarks", event)}
        ref={contentSelectionRef}
      >
        <Breadcrumbs
          items={currentBreadcrumb}
          label={messages.newTab.breadcrumbLabel}
          onSelect={setSelectedFolderId}
        />
        <div className="section-title-row">
          <div>
            <h2>{query ? messages.newTab.gridSearchTitle : messages.newTab.gridFolderTitle}</h2>
          </div>
          <div className="section-title-row__actions">
            <Button icon="check" onClick={toggleSelectionMode} variant={isBookmarkSelectionMode ? "primary" : "glass"}>
              {isBookmarkSelectionMode ? messages.newTab.selection.done : messages.newTab.selection.select}
            </Button>
            <Button
              disabled={isValidatingUrls || !visibleBookmarks.length}
              icon="shield"
              onClick={handleValidateVisibleBookmarks}
              variant="glass"
            >
              {isValidatingUrls ? messages.newTab.urlValidation.checking : messages.newTab.urlValidation.check}
            </Button>
            <Button icon="folderAdd" onClick={openCreateFolder} variant="glass">
              {messages.newTab.addFolder}
            </Button>
          </div>
        </div>
        {selectionModeRegion || hasSelectedItems ? (
          <div className="bulk-toolbar">
            <span>{messages.newTab.selection.selectedCount(selectedItems.length)}</span>
            <select
              aria-label={messages.newTab.selection.moveTo}
              disabled={!hasSelectedItems || isSaving}
              onChange={(event) => setMoveTargetFolderId(event.target.value)}
              value={moveTargetFolderId}
            >
              <option value="">{messages.newTab.selection.chooseFolder}</option>
              {flatFolders.map((folder) => (
                <option key={folder.id} value={folder.id}>
                  {folder.label}
                </option>
              ))}
            </select>
            <Button disabled={!hasSelectedItems || !moveTargetFolderId || isSaving} icon="folderOpen" onClick={handleMoveSelectedToFolder} variant="glass">
              {messages.newTab.selection.moveTo}
            </Button>
            <Button disabled={!hasSelectedItems || !moveTargetFolderId || isSaving} icon="copy" onClick={handleCopySelectedToFolder} variant="glass">
              {messages.newTab.selection.copyTo}
            </Button>
            <Button disabled={!hasSelectedItems || isSaving} icon="trash" onClick={handleBulkDelete} variant="glass">
              {messages.newTab.selection.delete}
            </Button>
            <Button disabled={!hasSelectedItems || isSaving} onClick={clearSelection} variant="subtle">
              {messages.newTab.selection.clear}
            </Button>
          </div>
        ) : null}
        {suggestionBatch ? (
          <section className="llm-review-panel" aria-label={messages.newTab.llm.reviewTitle}>
            <div className="llm-review-panel__heading">
              <div>
                <p className="eyebrow">{messages.newTab.llm.eyebrow}</p>
                <h3>{messages.newTab.llm.reviewTitle}</h3>
              </div>
              <div className="llm-review-panel__actions">
                <Button disabled={!pendingSuggestions.length || isSaving} icon="check" onClick={handleApplyAllSuggestions} variant="primary">
                  {messages.newTab.llm.applyAll}
                </Button>
                <Button disabled={isSaving} onClick={() => void persistSuggestionBatch(null)} variant="subtle">
                  {messages.newTab.llm.clear}
                </Button>
              </div>
            </div>
            <div className="llm-suggestion-list">
              {suggestionBatch.suggestions.map((suggestion) => (
                <article className="llm-suggestion" key={suggestion.id}>
                  <div>
                    <h4>{resolveSuggestionBookmarkTitle(suggestion, bookmarks)}</h4>
                    <p>{formatSuggestionTarget(suggestion, folders, messages.newTab.llm.newFolderPrefix)}</p>
                    <p>{suggestion.reason}</p>
                  </div>
                  <div className="llm-suggestion__meta">
                    <span>{messages.newTab.llm.confidence(Math.round(suggestion.confidence * 100))}</span>
                    <span>{messages.newTab.llm.status[suggestion.status]}</span>
                  </div>
                  {suggestion.status === "pending" ? (
                    <div className="llm-suggestion__actions">
                      <Button disabled={isSaving} icon="check" onClick={() => void handleApplySuggestion(suggestion)} variant="glass">
                        {messages.newTab.llm.apply}
                      </Button>
                      <Button disabled={isSaving} icon="x" onClick={() => void handleRejectSuggestion(suggestion.id)} variant="subtle">
                        {messages.newTab.llm.reject}
                      </Button>
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {errorMessage ? (
          <EmptyState
            actionLabel={messages.newTab.reload}
            description={errorMessage}
            icon="refresh"
            onAction={() => window.location.reload()}
            title={messages.newTab.accessErrorTitle}
          />
        ) : isLoading ? (
          <EmptyState
            description={messages.newTab.loadingDescription}
            hideAction
            title={messages.newTab.loadingTitle}
          />
        ) : visibleBookmarks.length ? (
          <div className="bookmark-grid">
            {visibleBookmarks.map((bookmark) => (
              <BookmarkCard
                actionLabels={messages.newTab.bookmarkActions}
                bookmark={bookmark}
                isSelected={selectedItemKeys.has(`bookmark:${bookmark.id}`)}
                key={bookmark.id}
                onContextMenu={handleBookmarkContextMenu}
                onDelete={handleDeleteBookmark}
                onDragStart={handleBookmarkDragStart}
                onDropBefore={handleDropBeforeBookmark}
                onEdit={openEditBookmark}
                onSelect={handleSelectBookmark}
                selectionMode={isBookmarkSelectionMode}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            description={
              bookmarks.length
                ? messages.newTab.noMatchesDescription
                : messages.newTab.noBookmarksDescription
            }
            hideAction
            title={bookmarks.length ? messages.newTab.noMatchesTitle : messages.newTab.noBookmarksTitle}
          />
        )}
      </section>
      {editorState ? (
        <BookmarkEditorModal
          errorMessage={editorError}
          isSaving={isSaving}
          labels={editorLabels}
          mode={editorState.intent === "create-folder" || editorState.intent === "edit-folder" ? "folder" : "bookmark"}
          onChange={setEditorValues}
          onClose={closeEditor}
          onSubmit={handleEditorSubmit}
          values={editorValues}
        />
      ) : null}
      {isSettingsOpen ? (
        <SettingsModal folders={folders} onClose={() => setIsSettingsOpen(false)} />
      ) : null}
      {marqueeSelection ? (
        <div className="selection-marquee" style={getMarqueeStyle(marqueeSelection)} />
      ) : null}
      {validationMessage || suggestionMessage || undoState ? (
        <div aria-live="polite" className="feedback-toast-stack">
          {validationMessage ? (
            <article className="feedback-toast" role="status">
              <div className="feedback-toast__message">
                <Icon name="shield" size={18} />
                <span>{validationMessage}</span>
              </div>
              <Button
                aria-label={messages.newTab.feedback.close}
                className="feedback-toast__close"
                icon="x"
                onClick={dismissValidationMessage}
                variant="icon"
              />
            </article>
          ) : null}
          {suggestionMessage ? (
            <article className="feedback-toast" role="status">
              <div className="feedback-toast__message">
                <Icon name="sparkles" size={18} />
                <span>{suggestionMessage}</span>
              </div>
              <Button
                aria-label={messages.newTab.feedback.close}
                className="feedback-toast__close"
                icon="x"
                onClick={dismissSuggestionMessage}
                variant="icon"
              />
            </article>
          ) : null}
          {undoState ? (
            <article className="feedback-toast feedback-toast--undo" role="status">
              <div className="feedback-toast__message">
                <Icon name="refresh" size={18} />
                <span>{undoState.label}</span>
              </div>
              <div className="feedback-toast__actions">
                <Button disabled={isSaving} icon="refresh" onClick={handleUndo} variant="glass">
                  {messages.newTab.undo.action}
                </Button>
                <Button
                  aria-label={messages.newTab.feedback.close}
                  className="feedback-toast__close"
                  icon="x"
                  onClick={() => setUndoState(null)}
                  variant="icon"
                />
              </div>
            </article>
          ) : null}
        </div>
      ) : null}
      {contextMenu ? (
        <div
          className="context-menu"
          role="menu"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onContextMenu={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
          onClick={(event) => event.stopPropagation()}
          onWheel={(event) => event.stopPropagation()}
        >
          <div className="context-menu__label">{contextMenu.label}</div>
          <button disabled={isSaving} onClick={handleContextMenuEdit} role="menuitem" type="button">
            <Icon name="pencil" size={15} />
            <span>
              {contextMenu.item.type === "folder"
                ? messages.newTab.contextMenu.renameFolder
                : messages.newTab.contextMenu.renameBookmark}
            </span>
          </button>
          <button disabled={isSaving} onClick={handleContextMenuDelete} role="menuitem" type="button">
            <Icon name="trash" size={15} />
            <span>{messages.newTab.contextMenu.delete}</span>
          </button>
          <div className="context-menu__submenu">
            <button className="context-menu__submenu-trigger" disabled={isSaving} role="menuitem" type="button">
              <Icon name="folderOpen" size={15} />
              <span>{messages.newTab.contextMenu.moveTo}</span>
              <Icon className="context-menu__submenu-icon" name="chevronRight" size={14} />
            </button>
            <div className="context-menu__submenu-panel" role="menu">
              {contextMenuTargetFolders.map((folder) => (
                <button
                  disabled={isSaving}
                  key={`move-${folder.id}`}
                  onClick={() => handleContextMenuMove(folder.id)}
                  role="menuitem"
                  type="button"
                >
                  <Icon name="folderOpen" size={15} />
                  <span>{folder.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="context-menu__submenu">
            <button className="context-menu__submenu-trigger" disabled={isSaving} role="menuitem" type="button">
              <Icon name="copy" size={15} />
              <span>{messages.newTab.contextMenu.copyTo}</span>
              <Icon className="context-menu__submenu-icon" name="chevronRight" size={14} />
            </button>
            <div className="context-menu__submenu-panel" role="menu">
              {contextMenuTargetFolders.map((folder) => (
                <button
                  disabled={isSaving}
                  key={`copy-${folder.id}`}
                  onClick={() => handleContextMenuCopy(folder.id)}
                  role="menuitem"
                  type="button"
                >
                  <Icon name="copy" size={15} />
                  <span>{folder.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}

function isSelectAllShortcut(event: KeyboardEvent): boolean {
  return (event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === "a";
}

function isTextEditingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return (
    target.isContentEditable ||
    target.matches("input, textarea, select") ||
    Boolean(target.closest("[contenteditable='true']"))
  );
}

function resolveKeyboardSelectionRegion(
  target: EventTarget | null,
  sidebarElement: HTMLElement | null,
  contentElement: HTMLElement | null,
  fallbackRegion: SelectionRegion | null
): SelectionRegion {
  if (target instanceof Node) {
    if (sidebarElement?.contains(target)) {
      return "folders";
    }

    if (contentElement?.contains(target)) {
      return "bookmarks";
    }
  }

  return fallbackRegion ?? "bookmarks";
}

function buildSelectAllKeys(
  region: SelectionRegion,
  folders: FolderItem[],
  bookmarks: BookmarkItem[]
): Set<string> {
  const keys = new Set<string>();

  if (region === "folders") {
    folders.forEach((folder) => keys.add(organizationItemKey({ id: folder.id, type: "folder" })));
  }

  if (region === "bookmarks") {
    bookmarks.forEach((bookmark) => keys.add(organizationItemKey({ id: bookmark.id, type: "bookmark" })));
  }

  return keys;
}

function filterSelectionKeysForRegion(keys: Set<string>, region: SelectionRegion): Set<string> {
  const prefix = `${region === "folders" ? "folder" : "bookmark"}:`;
  return new Set([...keys].filter((key) => key.startsWith(prefix)));
}

function shouldIgnoreMarqueeStart(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) {
    return true;
  }

  return Boolean(
    target.closest(
      "a, button, input, label, select, textarea, [contenteditable='true'], [data-selection-key], .bulk-toolbar, .context-menu, .llm-review-panel"
    )
  );
}

function readMarqueeSelectionKeys(
  selection: MarqueeSelectionState,
  sidebarElement: HTMLElement | null,
  contentElement: HTMLElement | null
): Set<string> {
  const container = selection.region === "folders" ? sidebarElement : contentElement;
  const keys = new Set(selection.baseKeys);

  if (!container) {
    return keys;
  }

  const marqueeRect = getMarqueeClientRect(selection);
  const selectableItems = container.querySelectorAll<HTMLElement>(
    `[data-selection-region="${selection.region}"][data-selection-key]`
  );

  selectableItems.forEach((item) => {
    if (doRectsIntersect(marqueeRect, item.getBoundingClientRect())) {
      const selectionKey = item.dataset.selectionKey;

      if (selectionKey) {
        keys.add(selectionKey);
      }
    }
  });

  return keys;
}

function getMarqueeStyle(selection: MarqueeSelectionState): CSSProperties {
  const rect = getMarqueeClientRect(selection);

  return {
    height: rect.height,
    left: rect.left,
    top: rect.top,
    width: rect.width
  };
}

function getMarqueeClientRect(selection: MarqueeSelectionState): DOMRect {
  const left = Math.min(selection.originX, selection.currentX);
  const top = Math.min(selection.originY, selection.currentY);
  const width = Math.abs(selection.currentX - selection.originX);
  const height = Math.abs(selection.currentY - selection.originY);

  return new DOMRect(left, top, width, height);
}

function doRectsIntersect(firstRect: DOMRect, secondRect: DOMRect): boolean {
  return (
    firstRect.left <= secondRect.right &&
    firstRect.right >= secondRect.left &&
    firstRect.top <= secondRect.bottom &&
    firstRect.bottom >= secondRect.top
  );
}

interface SelectionUpdateParams {
  event: MouseEvent<HTMLElement>;
  item: Pick<OrganizationItemRef, "id" | "type">;
  lastId: string | null;
  orderedItems: Array<Pick<OrganizationItemRef, "id" | "type">>;
  setLastId: (id: string) => void;
  setSelectedItemKeys: (updater: (currentKeys: Set<string>) => Set<string>) => void;
}

function updateSelection({
  event,
  item,
  lastId,
  orderedItems,
  setLastId,
  setSelectedItemKeys
}: SelectionUpdateParams) {
  const itemKey = organizationItemKey(item);

  setLastId(item.id);

  if (event.shiftKey && lastId) {
    const currentIndex = orderedItems.findIndex((orderedItem) => orderedItem.id === item.id);
    const lastIndex = orderedItems.findIndex((orderedItem) => orderedItem.id === lastId);

    if (currentIndex >= 0 && lastIndex >= 0) {
      const start = Math.min(currentIndex, lastIndex);
      const end = Math.max(currentIndex, lastIndex);
      const rangeKeys = orderedItems.slice(start, end + 1).map(organizationItemKey);
      setSelectedItemKeys((currentKeys) => {
        const keys = event.ctrlKey || event.metaKey ? new Set(currentKeys) : new Set<string>();
        rangeKeys.forEach((rangeKey) => keys.add(rangeKey));
        return keys;
      });
      return;
    }
  }

  setSelectedItemKeys((currentKeys) => {
    const keys = new Set(currentKeys);
    if (keys.has(itemKey) && (event.ctrlKey || event.metaKey)) {
      keys.delete(itemKey);
    } else if (event.ctrlKey || event.metaKey) {
      keys.add(itemKey);
    } else {
      return new Set([itemKey]);
    }
    return keys;
  });
}

function organizationItemKey(item: Pick<OrganizationItemRef, "id" | "type">): string {
  return `${item.type}:${item.id}`;
}

function getSelectedOrganizationItems(
  selectedKeys: Set<string>,
  bookmarks: BookmarkItem[],
  folders: FolderItem[]
): OrganizationItemRef[] {
  const bookmarkItems = bookmarks
    .filter((bookmark) => selectedKeys.has(`bookmark:${bookmark.id}`))
    .map((bookmark) => ({
      id: bookmark.id,
      index: bookmark.index,
      parentId: bookmark.parentId,
      type: "bookmark" as const
    }));
  const folderItems = flattenFolders(folders)
    .filter((folder) => folder.id !== "all" && selectedKeys.has(`folder:${folder.id}`))
    .map((folder) => ({
      id: folder.id,
      index: folder.index,
      parentId: folder.parentId,
      type: "folder" as const
    }));

  return [...bookmarkItems, ...folderItems];
}

function flattenFolders(folders: FolderItem[]): FolderItem[] {
  return folders.flatMap((folder) => [folder, ...flattenFolders(folder.children ?? [])]);
}

function canMoveItem(item: OrganizationItemRef, targetParentId: string | undefined, folders: FolderItem[]): boolean {
  if (!targetParentId || item.id === targetParentId) {
    return false;
  }

  if (item.type === "folder" && isDescendantFolder(folders, item.id, targetParentId)) {
    return false;
  }

  return true;
}

function pruneNestedSelections(items: OrganizationItemRef[], folders: FolderItem[]): OrganizationItemRef[] {
  return items.filter((item) => {
    if (item.type === "folder") {
      return !items.some(
        (candidate) =>
          candidate.type === "folder" &&
          candidate.id !== item.id &&
          isDescendantFolder(folders, candidate.id, item.id)
      );
    }

    const parentFolderId = item.parentId;

    if (!parentFolderId) {
      return true;
    }

    return !items.some(
      (candidate) =>
        candidate.type === "folder" &&
        (candidate.id === parentFolderId || isDescendantFolder(folders, candidate.id, parentFolderId))
    );
  });
}

function resolveSuggestionBookmarkTitle(suggestion: LlmClassificationSuggestion, bookmarks: BookmarkItem[]): string {
  return bookmarks.find((bookmark) => bookmark.id === suggestion.bookmarkId)?.title ?? suggestion.bookmarkId;
}

function formatSuggestionTarget(
  suggestion: LlmClassificationSuggestion,
  folders: FolderItem[],
  newFolderPrefix: string
): string {
  if (suggestion.newFolderName) {
    return `${newFolderPrefix} ${suggestion.newFolderName}`;
  }

  const targetFolder = flattenFolders(folders).find((folder) => folder.id === suggestion.targetFolderId);
  return targetFolder?.label ?? suggestion.targetFolderId ?? "";
}
