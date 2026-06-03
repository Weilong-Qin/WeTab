import { describe, expect, it } from "vitest";
import {
  buildSelectAllKeys,
  filterSelectionKeysForRegion,
  flattenFolders,
  formatSuggestionTarget,
  getSidebarFolder,
  organizationItemKey,
  resolveSuggestionBookmarkTitle,
  resolveSuggestionCurrentFolderLabel
} from "./organization";
import type { BookmarkItem, FolderItem } from "../types/bookmarks";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeFolder(overrides: Partial<FolderItem> & { id: string; label: string }): FolderItem {
  return { children: [], count: 0, icon: "folderOpen", ...overrides };
}

function makeBookmark(overrides: Partial<BookmarkItem> & { id: string; title: string; url: string }): BookmarkItem {
  return {
    description: "",
    domain: "",
    folderIdPath: [],
    folderPath: [],
    iconLabel: "",
    index: 0,
    status: "unchecked" as const,
    tag: "",
    tagTone: "neutral" as const,
    ...overrides
  };
}

const rootFolder = makeFolder({
  id: "all",
  label: "All",
  children: [
    makeFolder({
      id: "f1",
      label: "Dev",
      parentId: "all",
      children: [
        makeFolder({ id: "f1a", label: "React", parentId: "f1" }),
        makeFolder({ id: "f1b", label: "CSS", parentId: "f1" })
      ]
    }),
    makeFolder({ id: "f2", label: "News", parentId: "all" })
  ]
});

const flatFolders = flattenFolders([rootFolder]);

// ---------------------------------------------------------------------------
// organizationItemKey
// ---------------------------------------------------------------------------

describe("organizationItemKey", () => {
  it("returns type:id format", () => {
    expect(organizationItemKey({ id: "123", type: "bookmark" })).toBe("bookmark:123");
    expect(organizationItemKey({ id: "abc", type: "folder" })).toBe("folder:abc");
  });
});

// ---------------------------------------------------------------------------
// flattenFolders
// ---------------------------------------------------------------------------

describe("flattenFolders", () => {
  it("flattens nested folder tree", () => {
    const ids = flattenFolders([rootFolder]).map((f) => f.id);
    expect(ids).toEqual(["all", "f1", "f1a", "f1b", "f2"]);
  });

  it("handles empty input", () => {
    expect(flattenFolders([])).toEqual([]);
  });

  it("handles folders without children", () => {
    const leaf = makeFolder({ id: "x", label: "X" });
    expect(flattenFolders([leaf]).map((f) => f.id)).toEqual(["x"]);
  });
});

// ---------------------------------------------------------------------------
// getSidebarFolder
// ---------------------------------------------------------------------------

describe("getSidebarFolder", () => {
  it("finds top-level folder", () => {
    expect(getSidebarFolder([rootFolder], "all")?.id).toBe("all");
  });

  it("finds deeply nested folder", () => {
    expect(getSidebarFolder([rootFolder], "f1a")?.label).toBe("React");
  });

  it("returns undefined for missing folder", () => {
    expect(getSidebarFolder([rootFolder], "missing")).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// buildSelectAllKeys
// ---------------------------------------------------------------------------

describe("buildSelectAllKeys", () => {
  const bookmarks = [
    makeBookmark({ id: "b1", title: "A", url: "https://a.com" }),
    makeBookmark({ id: "b2", title: "B", url: "https://b.com" })
  ];

  it("builds folder keys for folders region", () => {
    const keys = buildSelectAllKeys("folders", flatFolders, bookmarks);
    expect(keys.size).toBe(flatFolders.length);
    expect(keys.has("folder:all")).toBe(true);
    expect(keys.has("folder:f1a")).toBe(true);
  });

  it("builds bookmark keys for bookmarks region", () => {
    const keys = buildSelectAllKeys("bookmarks", flatFolders, bookmarks);
    expect(keys.size).toBe(2);
    expect(keys.has("bookmark:b1")).toBe(true);
    expect(keys.has("bookmark:b2")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// filterSelectionKeysForRegion
// ---------------------------------------------------------------------------

describe("filterSelectionKeysForRegion", () => {
  it("keeps only bookmark keys", () => {
    const keys = new Set(["bookmark:b1", "folder:f1", "bookmark:b2"]);
    const filtered = filterSelectionKeysForRegion(keys, "bookmarks");
    expect([...filtered]).toEqual(["bookmark:b1", "bookmark:b2"]);
  });

  it("keeps only folder keys", () => {
    const keys = new Set(["bookmark:b1", "folder:f1", "folder:f2"]);
    const filtered = filterSelectionKeysForRegion(keys, "folders");
    expect([...filtered]).toEqual(["folder:f1", "folder:f2"]);
  });

  it("returns empty set when no matches", () => {
    const keys = new Set(["bookmark:b1"]);
    expect(filterSelectionKeysForRegion(keys, "folders").size).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// resolveSuggestionBookmarkTitle
// ---------------------------------------------------------------------------

describe("resolveSuggestionBookmarkTitle", () => {
  const bookmarks = [makeBookmark({ id: "b1", title: "GitHub", url: "https://github.com" })];

  it("returns bookmark title when found", () => {
    expect(
      resolveSuggestionBookmarkTitle(
        { bookmarkId: "b1", confidence: 1, id: "s1", reason: "", status: "pending", targetFolderId: "f1" },
        bookmarks
      )
    ).toBe("GitHub");
  });

  it("falls back to bookmarkId when not found", () => {
    expect(
      resolveSuggestionBookmarkTitle(
        { bookmarkId: "missing", confidence: 1, id: "s2", reason: "", status: "pending", targetFolderId: "f1" },
        bookmarks
      )
    ).toBe("missing");
  });
});

// ---------------------------------------------------------------------------
// resolveSuggestionCurrentFolderLabel
// ---------------------------------------------------------------------------

describe("resolveSuggestionCurrentFolderLabel", () => {
  const bookmarks = [
    makeBookmark({ id: "b1", title: "A", url: "https://a.com", folderPath: ["Dev", "React"] })
  ];

  it("returns folder label when currentFolderId matches", () => {
    expect(
      resolveSuggestionCurrentFolderLabel(
        { bookmarkId: "b1", confidence: 1, currentFolderId: "f1a", id: "s1", reason: "", status: "pending", targetFolderId: "f2" },
        [rootFolder],
        bookmarks
      )
    ).toBe("React");
  });

  it("falls back to last folderPath entry", () => {
    expect(
      resolveSuggestionCurrentFolderLabel(
        { bookmarkId: "b1", confidence: 1, id: "s1", reason: "", status: "pending", targetFolderId: "f2" },
        [rootFolder],
        bookmarks
      )
    ).toBe("React");
  });

  it("returns undefined when no info available", () => {
    expect(
      resolveSuggestionCurrentFolderLabel(
        { bookmarkId: "unknown", confidence: 1, id: "s1", reason: "", status: "pending", targetFolderId: "f2" },
        [rootFolder],
        []
      )
    ).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// formatSuggestionTarget
// ---------------------------------------------------------------------------

describe("formatSuggestionTarget", () => {
  it("formats new folder target with prefix", () => {
    expect(
      formatSuggestionTarget(
        { bookmarkId: "b1", confidence: 1, id: "s1", newFolderName: "AI", reason: "", status: "pending", targetFolderId: "" },
        [rootFolder],
        "\u2192"
      )
    ).toBe("\u2192 AI");
  });
  
  it("resolves existing folder label", () => {
    expect(
      formatSuggestionTarget(
        { bookmarkId: "b1", confidence: 1, id: "s1", reason: "", status: "pending", targetFolderId: "f2" },
        [rootFolder],
        "\u2192"
      )
    ).toBe("News");
  });
  
  it("falls back to targetFolderId for unknown folder", () => {
    expect(
      formatSuggestionTarget(
        { bookmarkId: "b1", confidence: 1, id: "s1", reason: "", status: "pending", targetFolderId: "unknown-id" },
        [rootFolder],
        "\u2192"
      )
    ).toBe("unknown-id");
  });
});
