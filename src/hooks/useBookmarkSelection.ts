import { useEffect, useMemo, useRef, useState, type MouseEvent, type PointerEvent as ReactPointerEvent } from "react";
import type { BookmarkItem, FolderItem } from "../types/bookmarks";
import {
  buildSelectAllKeys,
  collectMarqueeSelectableItems,
  filterSelectionKeysForRegion,
  getSelectedOrganizationItems,
  isSelectAllShortcut,
  isTextEditingTarget,
  organizationItemKey,
  readMarqueeSelectionKeys,
  resolveKeyboardSelectionRegion,
  shouldIgnoreMarqueeStart,
  updateSelection,
  type MarqueeSelectableItem,
  type MarqueeSelectionState,
  type OrganizationItemRef,
  type SelectionRegion
} from "../utils/organization";

export interface UseBookmarkSelectionOptions {
  bookmarks: BookmarkItem[];
  folders: FolderItem[];
  flatFolders: FolderItem[];
  visibleBookmarks: BookmarkItem[];
  editorState: unknown;
  isSettingsOpen: boolean;
  contextMenu: unknown;
}

export function useBookmarkSelection({
  bookmarks,
  folders,
  flatFolders,
  visibleBookmarks,
  editorState,
  isSettingsOpen,
  contextMenu
}: UseBookmarkSelectionOptions) {
  const [selectedItemKeys, setSelectedItemKeys] = useState<Set<string>>(() => new Set());
  const [lastSelectedBookmarkId, setLastSelectedBookmarkId] = useState<string | null>(null);
  const [lastSelectedFolderId, setLastSelectedFolderId] = useState<string | null>(null);
  const [selectionModeRegion, setSelectionModeRegion] = useState<SelectionRegion | null>(null);
  const [moveTargetFolderId, setMoveTargetFolderId] = useState("");
  const [marqueeSelection, setMarqueeSelection] = useState<MarqueeSelectionState | null>(null);

  const sidebarSelectionRef = useRef<HTMLElement | null>(null);
  const contentSelectionRef = useRef<HTMLElement | null>(null);
  const lastSelectionRegionRef = useRef<SelectionRegion | null>(null);
  const marqueeSelectionRef = useRef<MarqueeSelectionState | null>(null);
  const marqueeSelectableItemsRef = useRef<MarqueeSelectableItem[]>([]);
  const marqueeAnimationFrameRef = useRef<number | null>(null);

  // ---- Derived ----

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

  // ---- Selection mode ----

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

  function toggleSelectionMode() {
    if (selectionModeRegion === "bookmarks") {
      clearSelection();
      return;
    }
    activateSelectionRegion("bookmarks");
  }

  // ---- Select items ----

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

  // ---- Marquee pointer down ----

  function handleSelectionPointerDown(region: SelectionRegion, event: ReactPointerEvent<HTMLElement>) {
    if (event.button !== 0 || shouldIgnoreMarqueeStart(event.target)) return;

    const hasSelectableItems = region === "folders" ? flatFolders.length > 0 : visibleBookmarks.length > 0;
    if (!hasSelectableItems) return;

    event.preventDefault();
    activateSelectionRegion(region, event.ctrlKey || event.metaKey);

    const nextSelection: MarqueeSelectionState = {
      baseKeys:
        event.ctrlKey || event.metaKey
          ? filterSelectionKeysForRegion(selectedItemKeys, region)
          : new Set(),
      currentX: event.clientX,
      currentY: event.clientY,
      originX: event.clientX,
      originY: event.clientY,
      region
    };

    marqueeSelectableItemsRef.current = collectMarqueeSelectableItems(
      region,
      sidebarSelectionRef.current,
      contentSelectionRef.current
    );
    marqueeSelectionRef.current = nextSelection;
    setMarqueeSelection(nextSelection);
  }

  // ---- Drag & Drop ----

  function startDrag(
    event: import("react").DragEvent<HTMLElement>,
    type: "bookmark" | "folder",
    id: string
  ) {
    const itemKey = organizationItemKey({ id, type });
    const draggedItems = selectedItemKeys.has(itemKey)
      ? selectedItems
      : getSelectedOrganizationItems(new Set([itemKey]), bookmarks, folders);

    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData(
      "application/vnd.vtab.organization-items",
      JSON.stringify(draggedItems)
    );
  }

  function readDraggedItems(event: import("react").DragEvent<HTMLElement>): OrganizationItemRef[] {
    try {
      const rawValue = event.dataTransfer.getData("application/vnd.vtab.organization-items");
      const parsedValue = JSON.parse(rawValue) as OrganizationItemRef[];
      return Array.isArray(parsedValue) ? parsedValue : [];
    } catch {
      return [];
    }
  }

  function handleBookmarkDragStart(bookmark: BookmarkItem, event: import("react").DragEvent<HTMLElement>) {
    startDrag(event, "bookmark", bookmark.id);
  }

  function handleFolderDragStart(folder: FolderItem, event: import("react").DragEvent<HTMLElement>) {
    startDrag(event, "folder", folder.id);
  }

  function handleDropOnFolder(folder: FolderItem, event: import("react").DragEvent<HTMLElement>) {
    event.preventDefault();
    const items = readDraggedItems(event);
    return items;
  }

  function handleDropBeforeBookmark(bookmark: BookmarkItem, event: import("react").DragEvent<HTMLElement>) {
    event.preventDefault();
    const items = readDraggedItems(event);
    return { items: items.filter((item) => item.type === "bookmark"), parentId: bookmark.parentId, index: bookmark.index };
  }

  function handleDropBeforeFolder(folder: FolderItem, event: import("react").DragEvent<HTMLElement>) {
    event.preventDefault();
    const items = readDraggedItems(event);
    return { items: items.filter((item) => item.type === "folder"), parentId: folder.parentId, index: folder.index };
  }

  // ---- Keyboard: select-all ----

  const isMarqueeSelecting = marqueeSelection !== null;

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (editorState || isSettingsOpen || contextMenu) return;
      if (!isSelectAllShortcut(event) || isTextEditingTarget(event.target)) return;

      const region = resolveKeyboardSelectionRegion(
        event.target,
        sidebarSelectionRef.current,
        contentSelectionRef.current,
        lastSelectionRegionRef.current
      );
      const nextKeys = buildSelectAllKeys(region, flatFolders, visibleBookmarks);
      if (!nextKeys.size) return;

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
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [contextMenu, editorState, flatFolders, isSettingsOpen, visibleBookmarks]);

  // ---- Marquee pointer tracking ----

  useEffect(() => {
    if (!isMarqueeSelecting) return;

    function applyMarqueeSelection(selection: MarqueeSelectionState) {
      setMarqueeSelection(selection);
      setSelectedItemKeys(readMarqueeSelectionKeys(selection, marqueeSelectableItemsRef.current));
      marqueeAnimationFrameRef.current = null;
    }

    function handlePointerMove(event: PointerEvent) {
      const activeSelection = marqueeSelectionRef.current;
      if (!activeSelection) return;

      const nextSelection: MarqueeSelectionState = {
        baseKeys: activeSelection.baseKeys,
        currentX: event.clientX,
        currentY: event.clientY,
        originX: activeSelection.originX,
        originY: activeSelection.originY,
        region: activeSelection.region
      };

      marqueeSelectionRef.current = nextSelection;
      if (marqueeAnimationFrameRef.current !== null) return;

      marqueeAnimationFrameRef.current = window.requestAnimationFrame(() => {
        const pendingSelection = marqueeSelectionRef.current;
        if (pendingSelection) applyMarqueeSelection(pendingSelection);
      });
    }

    function handlePointerUp() {
      if (marqueeAnimationFrameRef.current !== null) {
        window.cancelAnimationFrame(marqueeAnimationFrameRef.current);
        marqueeAnimationFrameRef.current = null;
      }

      const activeSelection = marqueeSelectionRef.current;
      if (activeSelection) {
        setSelectedItemKeys(
          readMarqueeSelectionKeys(activeSelection, marqueeSelectableItemsRef.current)
        );
      }

      setMarqueeSelection(null);
      marqueeSelectionRef.current = null;
      marqueeSelectableItemsRef.current = [];
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);

      if (marqueeAnimationFrameRef.current !== null) {
        window.cancelAnimationFrame(marqueeAnimationFrameRef.current);
        marqueeAnimationFrameRef.current = null;
      }
    };
  }, [isMarqueeSelecting]);

  // Sync marquee ref
  useEffect(() => {
    marqueeSelectionRef.current = marqueeSelection;
  }, [marqueeSelection]);

  return {
    // State
    selectedItemKeys,
    selectionModeRegion,
    moveTargetFolderId,
    setMoveTargetFolderId,
    marqueeSelection,

    // Refs
    sidebarSelectionRef,
    contentSelectionRef,

    // Derived
    selectedItems,
    hasSelectedItems,
    isBookmarkSelectionMode,
    isFolderSelectionMode,
    selectedBookmarks,

    // Actions
    clearSelection,
    toggleSelectionMode,
    handleSelectBookmark,
    handleSelectFolder,
    handleSelectionPointerDown,
    handleBookmarkDragStart,
    handleFolderDragStart,
    handleDropOnFolder,
    handleDropBeforeBookmark,
    handleDropBeforeFolder
  };
}
