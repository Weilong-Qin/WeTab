import { isDescendantFolder } from "../services/bookmarkService";
import type { BookmarkItem, FolderItem } from "../types/bookmarks";

// ---------------------------------------------------------------------------
// Organization item types
// ---------------------------------------------------------------------------

export type OrganizationItemType = "bookmark" | "folder";

export interface OrganizationItemRef {
  id: string;
  index?: number;
  parentId?: string;
  type: OrganizationItemType;
}

// ---------------------------------------------------------------------------
// Selection types
// ---------------------------------------------------------------------------

export type SelectionRegion = "bookmarks" | "folders";

export interface MarqueeSelectionState {
  baseKeys: Set<string>;
  currentX: number;
  currentY: number;
  originX: number;
  originY: number;
  region: SelectionRegion;
}

export interface MarqueeSelectableItem {
  key: string;
  rect: DOMRect;
}

// ---------------------------------------------------------------------------
// Undo types
// ---------------------------------------------------------------------------

export type UndoAction =
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
      snapshots: import("../services/bookmarkService").BookmarkNodeSnapshot[];
      type: "delete";
    };

// ---------------------------------------------------------------------------
// Context menu types
// ---------------------------------------------------------------------------

export interface ContextMenuState {
  item: OrganizationItemRef;
  label: string;
  x: number;
  y: number;
}

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

export function organizationItemKey(item: Pick<OrganizationItemRef, "id" | "type">): string {
  return `${item.type}:${item.id}`;
}

export function flattenFolders(folders: FolderItem[]): FolderItem[] {
  return folders.flatMap((folder) => [folder, ...flattenFolders(folder.children ?? [])]);
}

export function getSidebarFolder(folders: FolderItem[], folderId: string): FolderItem | undefined {
  for (const folder of folders) {
    if (folder.id === folderId) return folder;
    if (folder.children) {
      const nested = getSidebarFolder(folder.children, folderId);
      if (nested) return nested;
    }
  }
  return undefined;
}

export function canMoveItem(
  item: OrganizationItemRef,
  targetParentId: string | undefined,
  folders: FolderItem[]
): boolean {
  if (!targetParentId || item.id === targetParentId) return false;
  if (item.type === "folder" && isDescendantFolder(folders, item.id, targetParentId)) return false;
  return true;
}

export function pruneNestedSelections(
  items: OrganizationItemRef[],
  folders: FolderItem[]
): OrganizationItemRef[] {
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
    if (!parentFolderId) return true;

    return !items.some(
      (candidate) =>
        candidate.type === "folder" &&
        (candidate.id === parentFolderId ||
          isDescendantFolder(folders, candidate.id, parentFolderId))
    );
  });
}

export function getSelectedOrganizationItems(
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

// ---------------------------------------------------------------------------
// Selection keyboard / pointer helpers
// ---------------------------------------------------------------------------

export function isSelectAllShortcut(event: KeyboardEvent): boolean {
  return (event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === "a";
}

export function isTextEditingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    target.matches("input, textarea, select") ||
    Boolean(target.closest("[contenteditable='true']"))
  );
}

export function resolveKeyboardSelectionRegion(
  target: EventTarget | null,
  sidebarElement: HTMLElement | null,
  contentElement: HTMLElement | null,
  fallbackRegion: SelectionRegion | null
): SelectionRegion {
  if (target instanceof Node) {
    if (sidebarElement?.contains(target)) return "folders";
    if (contentElement?.contains(target)) return "bookmarks";
  }
  return fallbackRegion ?? "bookmarks";
}

export function buildSelectAllKeys(
  region: SelectionRegion,
  folders: FolderItem[],
  bookmarks: BookmarkItem[]
): Set<string> {
  const keys = new Set<string>();
  if (region === "folders") {
    folders.forEach((folder) => keys.add(organizationItemKey({ id: folder.id, type: "folder" })));
  }
  if (region === "bookmarks") {
    bookmarks.forEach((bookmark) =>
      keys.add(organizationItemKey({ id: bookmark.id, type: "bookmark" }))
    );
  }
  return keys;
}

export function filterSelectionKeysForRegion(
  keys: Set<string>,
  region: SelectionRegion
): Set<string> {
  const prefix = `${region === "folders" ? "folder" : "bookmark"}:`;
  return new Set([...keys].filter((key) => key.startsWith(prefix)));
}

export function shouldIgnoreMarqueeStart(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return true;
  return Boolean(
    target.closest(
      "a, button, input, label, select, textarea, [contenteditable='true'], [data-selection-key], .bulk-toolbar, .context-menu, .llm-review-panel"
    )
  );
}

interface SelectionUpdateParams {
  event: import("react").MouseEvent<HTMLElement>;
  item: Pick<OrganizationItemRef, "id" | "type">;
  lastId: string | null;
  orderedItems: Array<Pick<OrganizationItemRef, "id" | "type">>;
  setLastId: (id: string) => void;
  setSelectedItemKeys: (updater: (currentKeys: Set<string>) => Set<string>) => void;
}

export function updateSelection({
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

// ---------------------------------------------------------------------------
// Marquee helpers
// ---------------------------------------------------------------------------

export function collectMarqueeSelectableItems(
  region: SelectionRegion,
  sidebarElement: HTMLElement | null,
  contentElement: HTMLElement | null
): MarqueeSelectableItem[] {
  const container = region === "folders" ? sidebarElement : contentElement;
  if (!container) return [];

  return Array.from(
    container.querySelectorAll<HTMLElement>(
      `[data-selection-region="${region}"][data-selection-key]`
    )
  ).flatMap((item) => {
    const key = item.dataset.selectionKey;
    return key ? [{ key, rect: item.getBoundingClientRect() }] : [];
  });
}

export function readMarqueeSelectionKeys(
  selection: MarqueeSelectionState,
  selectableItems: MarqueeSelectableItem[]
): Set<string> {
  const keys = new Set(selection.baseKeys);
  const marqueeRect = getMarqueeClientRect(selection);

  selectableItems.forEach((item) => {
    if (doRectsIntersect(marqueeRect, item.rect)) {
      keys.add(item.key);
    }
  });

  return keys;
}

export function getMarqueeStyle(selection: MarqueeSelectionState): import("react").CSSProperties {
  const rect = getMarqueeClientRect(selection);
  return { height: rect.height, left: rect.left, top: rect.top, width: rect.width };
}

export function getMarqueeClientRect(selection: MarqueeSelectionState): DOMRect {
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

// ---------------------------------------------------------------------------
// LLM suggestion display helpers
// ---------------------------------------------------------------------------

export function resolveSuggestionBookmarkTitle(
  suggestion: import("../services/llmSuggestionService").LlmClassificationSuggestion,
  bookmarks: BookmarkItem[]
): string {
  return bookmarks.find((bookmark) => bookmark.id === suggestion.bookmarkId)?.title ?? suggestion.bookmarkId;
}

export function resolveSuggestionCurrentFolderLabel(
  suggestion: import("../services/llmSuggestionService").LlmClassificationSuggestion,
  folders: FolderItem[],
  bookmarks: BookmarkItem[]
): string | undefined {
  if (suggestion.currentFolderId) {
    const folder = flattenFolders(folders).find((f) => f.id === suggestion.currentFolderId);
    if (folder) return folder.label;
  }

  const bm = bookmarks.find((b) => b.id === suggestion.bookmarkId);
  if (bm && Array.isArray(bm.folderPath) && bm.folderPath.length) {
    return bm.folderPath[bm.folderPath.length - 1];
  }

  return undefined;
}

export function formatSuggestionTarget(
  suggestion: import("../services/llmSuggestionService").LlmClassificationSuggestion,
  folders: FolderItem[],
  newFolderPrefix: string
): string {
  if (suggestion.newFolderName) {
    return `${newFolderPrefix} ${suggestion.newFolderName}`;
  }
  const targetFolder = flattenFolders(folders).find((folder) => folder.id === suggestion.targetFolderId);
  return targetFolder?.label ?? suggestion.targetFolderId ?? "";
}
