import { browser, type Browser } from "wxt/browser";
import { applyUrlValidationStatuses, loadUrlValidationStatuses } from "./urlValidationService";
import type { BookmarkItem, BookmarkViewModel, FolderItem, TagTone } from "../types/bookmarks";

type BrowserBookmarkApi = typeof browser.bookmarks;
type BrowserBookmarkNode = Browser.bookmarks.BookmarkTreeNode;

const ALL_BOOKMARKS_ID = "all";
const BOOKMARK_REFRESH_DELAY_MS = 180;
const ACCENTS: Array<NonNullable<BookmarkItem["accent"]>> = ["blue", "red", "green", "amber"];

export interface BookmarkViewLabels {
  allBookmarksLabel: string;
  bookmarkAccessUnavailable: string;
  bookmarkDescription: (domain: string) => string;
  defaultBookmarkLabel: string;
  defaultFolderLabel: string;
}

export interface CreateBookmarkInput {
  parentId?: string;
  title: string;
  url: string;
}

export interface CreateFolderInput {
  parentId?: string;
  title: string;
}

export interface UpdateBookmarkInput {
  id: string;
  title: string;
  url: string;
}

export interface UpdateFolderInput {
  id: string;
  title: string;
}

export interface MoveBookmarkNodeInput {
  id: string;
  parentId?: string;
  index?: number;
}

export interface BookmarkNodeSnapshot {
  children?: BookmarkNodeSnapshot[];
  index?: number;
  parentId?: string;
  title: string;
  url?: string;
}

const DEFAULT_BOOKMARK_VIEW_LABELS: BookmarkViewLabels = {
  allBookmarksLabel: "All Bookmarks",
  bookmarkAccessUnavailable:
    "Browser bookmark access is unavailable. Open vTab as the installed extension new-tab page and confirm the bookmarks permission is enabled.",
  bookmarkDescription: (domain) => `Saved from ${domain}`,
  defaultBookmarkLabel: "Bookmark",
  defaultFolderLabel: "Bookmarks"
};

export async function loadBookmarkView(
  labels: BookmarkViewLabels = DEFAULT_BOOKMARK_VIEW_LABELS
): Promise<BookmarkViewModel> {
  const bookmarkApi = getBookmarkApi(labels);

  const [tree, urlValidationStatuses] = await Promise.all([
    bookmarkApi.getTree(),
    loadUrlValidationStatuses()
  ]);
  const view = mapBookmarkTreeToView(tree, labels);

  return {
    ...view,
    bookmarks: applyUrlValidationStatuses(view.bookmarks, urlValidationStatuses)
  };
}

export function subscribeToBookmarkChanges(onChange: () => void): () => void {
  const bookmarkApi = getOptionalBookmarkApi();

  if (!bookmarkApi) {
    return () => undefined;
  }

  let importInProgress = false;
  let refreshTimer: ReturnType<typeof globalThis.setTimeout> | undefined;

  const clearRefreshTimer = () => {
    if (refreshTimer) {
      globalThis.clearTimeout(refreshTimer);
      refreshTimer = undefined;
    }
  };

  const scheduleRefresh = () => {
    if (importInProgress) {
      return;
    }

    clearRefreshTimer();
    refreshTimer = globalThis.setTimeout(onChange, BOOKMARK_REFRESH_DELAY_MS);
  };

  const handleImportBegan = () => {
    importInProgress = true;
    clearRefreshTimer();
  };

  const handleImportEnded = () => {
    importInProgress = false;
    scheduleRefresh();
  };

  bookmarkApi.onCreated.addListener(scheduleRefresh);
  bookmarkApi.onChanged.addListener(scheduleRefresh);
  bookmarkApi.onMoved.addListener(scheduleRefresh);
  bookmarkApi.onRemoved.addListener(scheduleRefresh);
  bookmarkApi.onChildrenReordered.addListener(scheduleRefresh);
  bookmarkApi.onImportBegan.addListener(handleImportBegan);
  bookmarkApi.onImportEnded.addListener(handleImportEnded);

  return () => {
    clearRefreshTimer();
    bookmarkApi.onCreated.removeListener(scheduleRefresh);
    bookmarkApi.onChanged.removeListener(scheduleRefresh);
    bookmarkApi.onMoved.removeListener(scheduleRefresh);
    bookmarkApi.onRemoved.removeListener(scheduleRefresh);
    bookmarkApi.onChildrenReordered.removeListener(scheduleRefresh);
    bookmarkApi.onImportBegan.removeListener(handleImportBegan);
    bookmarkApi.onImportEnded.removeListener(handleImportEnded);
  };
}

export async function createBookmark(input: CreateBookmarkInput): Promise<void> {
  const bookmarkApi = getBookmarkApi();
  await bookmarkApi.create({
    parentId: input.parentId,
    title: input.title.trim(),
    url: input.url.trim()
  });
}

export async function createFolder(input: CreateFolderInput): Promise<void> {
  const bookmarkApi = getBookmarkApi();
  await bookmarkApi.create({
    parentId: input.parentId,
    title: input.title.trim()
  });
}

export async function updateBookmark(input: UpdateBookmarkInput): Promise<void> {
  const bookmarkApi = getBookmarkApi();
  await bookmarkApi.update(input.id, {
    title: input.title.trim(),
    url: input.url.trim()
  });
}

export async function updateFolder(input: UpdateFolderInput): Promise<void> {
  const bookmarkApi = getBookmarkApi();
  await bookmarkApi.update(input.id, {
    title: input.title.trim()
  });
}

export async function deleteBookmark(bookmarkId: string): Promise<void> {
  const bookmarkApi = getBookmarkApi();
  await bookmarkApi.remove(bookmarkId);
}

export async function deleteFolder(folderId: string): Promise<void> {
  const bookmarkApi = getBookmarkApi();
  await bookmarkApi.removeTree(folderId);
}

export async function moveBookmarkNode(input: MoveBookmarkNodeInput): Promise<void> {
  const bookmarkApi = getBookmarkApi();
  await bookmarkApi.move(input.id, {
    parentId: input.parentId,
    index: input.index
  });
}

export async function captureBookmarkNodeSnapshots(nodeIds: string[]): Promise<BookmarkNodeSnapshot[]> {
  const bookmarkApi = getBookmarkApi();
  const snapshots: BookmarkNodeSnapshot[] = [];

  for (const nodeId of nodeIds) {
    const [node] = await bookmarkApi.getSubTree(nodeId);

    if (node) {
      snapshots.push(snapshotBookmarkNode(node));
    }
  }

  return snapshots;
}

export async function restoreBookmarkNodeSnapshots(snapshots: BookmarkNodeSnapshot[]): Promise<void> {
  for (const snapshot of snapshots) {
    await restoreBookmarkNodeSnapshot(snapshot);
  }
}

export function filterBookmarks(
  bookmarks: BookmarkItem[],
  query: string,
  folderId: string
): BookmarkItem[] {
  const normalizedQuery = query.trim().toLowerCase();
  const scopedBookmarks =
    folderId === ALL_BOOKMARKS_ID
      ? bookmarks
      : bookmarks.filter((bookmark) => bookmark.folderIdPath.includes(folderId));

  if (!normalizedQuery) {
    return scopedBookmarks;
  }

  return scopedBookmarks.filter((bookmark) => {
    const haystack = [
      bookmark.title,
      bookmark.url,
      bookmark.domain,
      bookmark.description,
      bookmark.folderPath.join(" ")
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  });
}

export function hasFolder(folders: FolderItem[], folderId: string): boolean {
  return folders.some((folder) => folder.id === folderId || hasFolder(folder.children ?? [], folderId));
}

export function resolveWritableParentFolderId(folders: FolderItem[], selectedFolderId: string): string | undefined {
  if (selectedFolderId !== ALL_BOOKMARKS_ID && hasFolder(folders, selectedFolderId)) {
    return selectedFolderId;
  }

  return folders.find((folder) => folder.id !== ALL_BOOKMARKS_ID)?.id;
}

export function findFolderPath(folders: FolderItem[], folderId: string): Array<{ id: string; label: string }> {
  const rootFolder = folders[0];

  if (rootFolder?.id === folderId) {
    return [{ id: rootFolder.id, label: rootFolder.label }];
  }

  const path = findFolderPathWithoutSyntheticRoot(
    folders.filter((folder) => folder.id !== ALL_BOOKMARKS_ID),
    folderId
  );

  if (path.length) {
    return rootFolder ? [{ id: rootFolder.id, label: rootFolder.label }, ...path] : path;
  }

  return rootFolder ? [{ id: rootFolder.id, label: rootFolder.label }] : [];
}

export function findFolderById(folders: FolderItem[], folderId: string): FolderItem | undefined {
  for (const folder of folders) {
    if (folder.id === folderId) {
      return folder;
    }

    const child = findFolderById(folder.children ?? [], folderId);

    if (child) {
      return child;
    }
  }

  return undefined;
}

export function isDescendantFolder(folders: FolderItem[], sourceFolderId: string, targetFolderId: string): boolean {
  const sourceFolder = findFolderById(folders, sourceFolderId);
  return sourceFolder ? hasFolder(sourceFolder.children ?? [], targetFolderId) : false;
}

function findFolderPathWithoutSyntheticRoot(
  folders: FolderItem[],
  folderId: string
): Array<{ id: string; label: string }> {
  for (const folder of folders) {
    if (folder.id === folderId) {
      return [{ id: folder.id, label: folder.label }];
    }

    const childPath = findFolderPathWithoutSyntheticRoot(folder.children ?? [], folderId);

    if (childPath.length) {
      return [{ id: folder.id, label: folder.label }, ...childPath];
    }
  }

  return [];
}

function mapBookmarkTreeToView(
  tree: BrowserBookmarkNode[],
  labels: BookmarkViewLabels
): BookmarkViewModel {
  const rootChildren = tree.flatMap((node) => node.children ?? []);
  const bookmarks: BookmarkItem[] = [];
  const folders = rootChildren
    .filter(isFolder)
    .map((node) => mapFolderNode(node, [], bookmarks, labels));

  return {
    folders: [
      {
        id: ALL_BOOKMARKS_ID,
        label: labels.allBookmarksLabel,
        count: bookmarks.length,
        icon: "folderOpen"
      },
      ...folders
    ],
    bookmarks
  };
}

function mapFolderNode(
  node: BrowserBookmarkNode,
  parentPath: Array<{ id: string; title: string }>,
  bookmarks: BookmarkItem[],
  labels: BookmarkViewLabels
): FolderItem {
  const title = normalizeFolderTitle(node.title, labels);
  const folderPath = [...parentPath, { id: node.id, title }];
  const childFolders = (node.children ?? [])
    .filter(isFolder)
    .map((child) => mapFolderNode(child, folderPath, bookmarks, labels));

  for (const child of node.children ?? []) {
    if (isBookmark(child)) {
      bookmarks.push(mapBookmarkNode(child, folderPath, labels));
    }
  }

  return {
    id: node.id,
    parentId: node.parentId,
    index: node.index,
    label: title,
    count: countDescendantBookmarks(node),
    icon: folderIconForTitle(title),
    expanded: childFolders.length > 0,
    children: childFolders.length ? childFolders : undefined
  };
}

function mapBookmarkNode(
  node: BrowserBookmarkNode,
  folderPath: Array<{ id: string; title: string }>,
  labels: BookmarkViewLabels
): BookmarkItem {
  const url = node.url ?? "";
  const domain = getDomain(url);
  const title = node.title.trim() || domain || url;
  const pathLabels = folderPath.map((folder) => folder.title);
  const leafFolder = pathLabels.at(-1) ?? labels.defaultBookmarkLabel;

  return {
    id: node.id,
    parentId: node.parentId,
    index: node.index,
    title,
    url,
    domain,
    description: domain ? labels.bookmarkDescription(domain) : url,
    folderPath: pathLabels,
    folderIdPath: folderPath.map((folder) => folder.id),
    tag: leafFolder,
    tagTone: tagToneForValue(leafFolder),
    iconLabel: iconLabelForBookmark(title, domain),
    status: "unchecked",
    accent: accentForValue(node.id)
  };
}

function snapshotBookmarkNode(node: BrowserBookmarkNode): BookmarkNodeSnapshot {
  return {
    children: node.children?.map(snapshotBookmarkNode),
    index: node.index,
    parentId: node.parentId,
    title: node.title,
    url: node.url
  };
}

async function restoreBookmarkNodeSnapshot(snapshot: BookmarkNodeSnapshot): Promise<void> {
  const bookmarkApi = getBookmarkApi();
  const createDetails: Browser.bookmarks.CreateDetails = {
    index: snapshot.index,
    parentId: snapshot.parentId,
    title: snapshot.title
  };

  if (snapshot.url) {
    createDetails.url = snapshot.url;
  }

  const createdNode = await bookmarkApi.create(createDetails);

  for (const child of snapshot.children ?? []) {
    await restoreBookmarkNodeSnapshot({
      ...child,
      parentId: createdNode.id
    });
  }
}

function countDescendantBookmarks(node: BrowserBookmarkNode): number {
  return (node.children ?? []).reduce((count, child) => {
    if (isBookmark(child)) {
      return count + 1;
    }

    return count + countDescendantBookmarks(child);
  }, 0);
}

function getBookmarkApi(labels: BookmarkViewLabels = DEFAULT_BOOKMARK_VIEW_LABELS): BrowserBookmarkApi {
  const bookmarkApi = getOptionalBookmarkApi();

  if (!bookmarkApi) {
    throw new Error(labels.bookmarkAccessUnavailable);
  }

  return bookmarkApi;
}

function getOptionalBookmarkApi(): BrowserBookmarkApi | undefined {
  const maybeBrowser = browser as typeof browser | undefined;
  return maybeBrowser?.bookmarks?.getTree ? maybeBrowser.bookmarks : undefined;
}

function isFolder(node: BrowserBookmarkNode): boolean {
  return typeof node.url !== "string";
}

function isBookmark(node: BrowserBookmarkNode): boolean {
  return typeof node.url === "string" && node.url.length > 0;
}

function normalizeFolderTitle(title: string, labels: BookmarkViewLabels): string {
  return title.trim() || labels.defaultFolderLabel;
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function iconLabelForBookmark(title: string, domain: string): string {
  const source = title || domain || "?";
  return source.trim().charAt(0).toUpperCase() || "?";
}

function tagToneForValue(value: string): TagTone {
  const hash = hashString(value);

  if (hash % 5 === 0) {
    return "red";
  }

  return hash % 3 === 0 ? "neutral" : "blue";
}

function accentForValue(value: string): BookmarkItem["accent"] {
  return ACCENTS[hashString(value) % ACCENTS.length];
}

function folderIconForTitle(title: string): FolderItem["icon"] {
  const normalized = title.toLowerCase();

  if (normalized.includes("work") || normalized.includes("office")) {
    return "briefcase";
  }

  if (normalized.includes("dev") || normalized.includes("code") || normalized.includes("github")) {
    return "code";
  }

  if (normalized.includes("inspiration") || normalized.includes("idea")) {
    return "lightbulb";
  }

  if (normalized.includes("social") || normalized.includes("community")) {
    return "users";
  }

  return "folderOpen";
}

function hashString(value: string): number {
  let hash = 0;

  for (const char of value) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }

  return hash;
}
