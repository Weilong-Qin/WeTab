import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createBookmark,
  createFolder,
  deleteBookmark,
  filterBookmarks,
  findFolderPath,
  loadBookmarkView,
  resolveWritableParentFolderId,
  updateBookmark,
  subscribeToBookmarkChanges
} from "./bookmarkService";

interface TestBookmarkNode {
  id: string;
  title: string;
  url?: string;
  children?: TestBookmarkNode[];
}

const bookmarkApiMock = vi.hoisted(() => {
  type BookmarkListener = () => void;

  function createEventMock() {
    const listeners = new Set<BookmarkListener>();

    return {
      addListener: vi.fn((listener: BookmarkListener) => {
        listeners.add(listener);
      }),
      emit: () => {
        for (const listener of listeners) {
          listener();
        }
      },
      listenerCount: () => listeners.size,
      removeListener: vi.fn((listener: BookmarkListener) => {
        listeners.delete(listener);
      })
    };
  }

  return {
    create: vi.fn<() => Promise<TestBookmarkNode>>(),
    getTree: vi.fn<() => Promise<TestBookmarkNode[]>>(),
    onChanged: createEventMock(),
    onChildrenReordered: createEventMock(),
    onCreated: createEventMock(),
    onImportBegan: createEventMock(),
    onImportEnded: createEventMock(),
    onMoved: createEventMock(),
    onRemoved: createEventMock(),
    remove: vi.fn<() => Promise<void>>(),
    update: vi.fn<() => Promise<TestBookmarkNode>>()
  };
});

vi.mock("wxt/browser", () => ({
  browser: {
    bookmarks: bookmarkApiMock
  }
}));

const labels = {
  allBookmarksLabel: "All",
  bookmarkAccessUnavailable: "No bookmark access",
  bookmarkDescription: (domain: string) => `Saved from ${domain}`,
  defaultBookmarkLabel: "Bookmark",
  defaultFolderLabel: "Bookmarks"
};

const nativeTree: TestBookmarkNode[] = [
  {
    id: "0",
    title: "",
    children: [
      {
        id: "1",
        title: "Bookmarks Bar",
        children: [
          {
            id: "2",
            title: "Dev",
            children: [
              {
                id: "3",
                title: "OpenAI Platform",
                url: "https://platform.openai.com/docs"
              },
              {
                id: "4",
                title: "TypeScript",
                url: "https://www.typescriptlang.org/docs/"
              }
            ]
          },
          {
            id: "5",
            title: "News",
            children: [
              {
                id: "6",
                title: "Example News",
                url: "https://news.example.com"
              }
            ]
          }
        ]
      },
      {
        id: "7",
        title: "Other Bookmarks",
        children: [
          {
            id: "8",
            title: "Loose Link",
            url: "https://loose.test"
          }
        ]
      }
    ]
  }
];

beforeEach(() => {
  vi.useRealTimers();
  bookmarkApiMock.create.mockReset();
  bookmarkApiMock.create.mockResolvedValue({
    id: "9",
    title: "Created"
  });
  bookmarkApiMock.getTree.mockReset();
  bookmarkApiMock.getTree.mockResolvedValue(nativeTree);
  bookmarkApiMock.remove.mockReset();
  bookmarkApiMock.remove.mockResolvedValue();
  bookmarkApiMock.update.mockReset();
  bookmarkApiMock.update.mockResolvedValue({
    id: "3",
    title: "Updated",
    url: "https://updated.test"
  });
});

afterEach(() => {
  vi.clearAllMocks();
  vi.useRealTimers();
});

describe("bookmarkService", () => {
  it("maps the native bookmark tree into folders and bookmark cards", async () => {
    const view = await loadBookmarkView(labels);

    expect(view.bookmarks).toHaveLength(4);
    expect(view.folders[0]).toMatchObject({
      id: "all",
      label: "All",
      count: 4
    });
    expect(view.folders[1]).toMatchObject({
      id: "1",
      label: "Bookmarks Bar",
      count: 3
    });
    expect(view.folders[1]?.children?.[0]).toMatchObject({
      id: "2",
      label: "Dev",
      count: 2
    });
    expect(view.bookmarks[0]).toMatchObject({
      id: "3",
      title: "OpenAI Platform",
      domain: "platform.openai.com",
      folderPath: ["Bookmarks Bar", "Dev"],
      folderIdPath: ["1", "2"],
      status: "unchecked",
      tag: "Dev"
    });
  });

  it("filters bookmarks by selected folder, title, domain, and folder path", async () => {
    const view = await loadBookmarkView(labels);

    expect(filterBookmarks(view.bookmarks, "", "2").map((bookmark) => bookmark.id)).toEqual(["3", "4"]);
    expect(filterBookmarks(view.bookmarks, "platform", "all").map((bookmark) => bookmark.id)).toEqual(["3"]);
    expect(filterBookmarks(view.bookmarks, "typescriptlang.org", "all").map((bookmark) => bookmark.id)).toEqual([
      "4"
    ]);
    expect(filterBookmarks(view.bookmarks, "other bookmarks", "all").map((bookmark) => bookmark.id)).toEqual([
      "8"
    ]);
    expect(filterBookmarks(view.bookmarks, "news", "1").map((bookmark) => bookmark.id)).toEqual(["6"]);
  });

  it("returns a breadcrumb path anchored at the synthetic root", async () => {
    const view = await loadBookmarkView(labels);

    expect(findFolderPath(view.folders, "2")).toEqual([
      { id: "all", label: "All" },
      { id: "1", label: "Bookmarks Bar" },
      { id: "2", label: "Dev" }
    ]);
  });

  it("resolves a writable parent folder from selected folder or the first native root folder", async () => {
    const view = await loadBookmarkView(labels);

    expect(resolveWritableParentFolderId(view.folders, "2")).toBe("2");
    expect(resolveWritableParentFolderId(view.folders, "all")).toBe("1");
    expect(resolveWritableParentFolderId(view.folders, "missing")).toBe("1");
  });

  it("creates bookmarks and folders through the native bookmark API", async () => {
    await createBookmark({
      parentId: "2",
      title: " New Bookmark ",
      url: " https://new.test "
    });
    await createFolder({
      parentId: "1",
      title: " New Folder "
    });

    expect(bookmarkApiMock.create).toHaveBeenNthCalledWith(1, {
      parentId: "2",
      title: "New Bookmark",
      url: "https://new.test"
    });
    expect(bookmarkApiMock.create).toHaveBeenNthCalledWith(2, {
      parentId: "1",
      title: "New Folder"
    });
  });

  it("updates and deletes bookmarks through the native bookmark API", async () => {
    await updateBookmark({
      id: "3",
      title: " Updated Bookmark ",
      url: " https://updated.test "
    });
    await deleteBookmark("3");

    expect(bookmarkApiMock.update).toHaveBeenCalledWith("3", {
      title: "Updated Bookmark",
      url: "https://updated.test"
    });
    expect(bookmarkApiMock.remove).toHaveBeenCalledWith("3");
  });

  it("debounces native bookmark events and unsubscribes cleanly", () => {
    vi.useFakeTimers();
    const onChange = vi.fn();

    const unsubscribe = subscribeToBookmarkChanges(onChange);

    expect(bookmarkApiMock.onCreated.listenerCount()).toBe(1);
    bookmarkApiMock.onCreated.emit();
    bookmarkApiMock.onChanged.emit();
    vi.advanceTimersByTime(179);
    expect(onChange).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(onChange).toHaveBeenCalledTimes(1);

    unsubscribe();
    expect(bookmarkApiMock.onCreated.listenerCount()).toBe(0);
    bookmarkApiMock.onCreated.emit();
    vi.advanceTimersByTime(180);
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
