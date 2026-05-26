import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  applyLlmSuggestion,
  buildLlmSuggestionScope,
  loadLlmSuggestionBatch,
  requestLlmClassificationSuggestions,
  saveLlmSuggestionBatch,
  updateSuggestionStatus,
  type LlmClassificationSuggestion
} from "./llmSuggestionService";
import type { BookmarkItem, FolderItem } from "../types/bookmarks";

const storageMock = vi.hoisted(() => ({
  get: vi.fn<(key: string) => Promise<Record<string, unknown>>>(),
  set: vi.fn<(value: Record<string, unknown>) => Promise<void>>()
}));

const bookmarkApiMock = vi.hoisted(() => ({
  create: vi.fn<() => Promise<{ id: string; title: string }>>(),
  getTree: vi.fn<() => Promise<Array<{ id: string; title: string }>>>(),
  move: vi.fn<() => Promise<void>>()
}));

vi.mock("wxt/browser", () => ({
  browser: {
    bookmarks: bookmarkApiMock,
    storage: {
      local: storageMock,
      onChanged: {
        addListener: vi.fn(),
        removeListener: vi.fn()
      }
    }
  }
}));

const fetchMock = vi.fn<typeof fetch>();

const bookmark: BookmarkItem = {
  accent: "blue",
  description: "Saved from platform.openai.com",
  domain: "platform.openai.com",
  folderIdPath: ["1", "2"],
  folderPath: ["Bookmarks Bar", "Dev"],
  iconLabel: "O",
  id: "3",
  index: 0,
  parentId: "2",
  status: "unchecked",
  tag: "Dev",
  tagTone: "blue",
  title: "OpenAI Platform",
  url: "https://platform.openai.com/docs"
};

const folders: FolderItem[] = [
  { count: 1, icon: "folderOpen", id: "all", label: "All" },
  {
    count: 1,
    children: [{ count: 1, icon: "code", id: "2", label: "Dev", parentId: "1" }],
    icon: "folderOpen",
    id: "1",
    label: "Bookmarks Bar"
  },
  { count: 0, icon: "lightbulb", id: "5", label: "Research" }
];

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
  storageMock.get.mockReset();
  storageMock.get.mockResolvedValue({
    "vtab.llmConfig": {
      apiKey: "key",
      baseUrl: "https://provider.test/v1",
      model: "gpt-test"
    }
  });
  storageMock.set.mockReset();
  storageMock.set.mockResolvedValue();
  bookmarkApiMock.create.mockReset();
  bookmarkApiMock.create.mockResolvedValue({ id: "9", title: "AI" });
  bookmarkApiMock.getTree.mockReset();
  bookmarkApiMock.getTree.mockResolvedValue([]);
  bookmarkApiMock.move.mockReset();
  bookmarkApiMock.move.mockResolvedValue();
});

describe("llmSuggestionService", () => {
  it("builds a privacy-scoped request payload from bookmarks and folders", () => {
    const scope = buildLlmSuggestionScope([bookmark], folders);

    expect(scope).toEqual({
      bookmarks: [
        {
          domain: "platform.openai.com",
          folderPath: ["Bookmarks Bar", "Dev"],
          folderIdPath: ["1", "2"],
          id: "3",
          title: "OpenAI Platform",
          url: "https://platform.openai.com/docs"
        }
      ],
      folders: [
        { id: "1", label: "Bookmarks Bar" },
        { id: "2", label: "Dev" },
        { id: "5", label: "Research" }
      ]
    });
    expect(JSON.stringify(scope)).not.toContain("status");
  });

  it("requests chat completions, validates suggestions, and persists the batch", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  suggestions: [
                    {
                      bookmarkId: "3",
                      confidence: 0.9,
                      reason: "AI docs belong in Research",
                      targetFolderId: "5"
                    },
                    {
                      bookmarkId: "missing",
                      confidence: 1,
                      reason: "Invalid bookmark",
                      targetFolderId: "5"
                    }
                  ]
                })
              }
            }
          ]
        }),
        { status: 200 }
      )
    );

    const batch = await requestLlmClassificationSuggestions(buildLlmSuggestionScope([bookmark], folders));

    expect(fetchMock).toHaveBeenCalledWith(
      "https://provider.test/v1/chat/completions",
      expect.objectContaining({
        headers: {
          Authorization: "Bearer key",
          "Content-Type": "application/json"
        },
        method: "POST"
      })
    );
    const requestBody = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body)) as {
      messages: Array<{ content: string }>;
    };
    expect(requestBody.messages[1]?.content).toContain("OpenAI Platform");
    expect(requestBody.messages[1]?.content).not.toContain("unchecked");
    expect(batch.suggestions).toHaveLength(1);
    expect(batch.suggestions[0]).toMatchObject({
      bookmarkId: "3",
      status: "pending",
      targetFolderId: "5"
    });
    expect(storageMock.set).toHaveBeenCalledWith({
      "vtab.llmSuggestions": batch
    });
  });

  it("loads and updates persisted suggestion batches safely", async () => {
    const suggestion: LlmClassificationSuggestion = {
      bookmarkId: "3",
      confidence: 0.8,
      id: "suggestion-1",
      reason: "Move it",
      status: "pending",
      targetFolderId: "5"
    };
    storageMock.get.mockResolvedValue({
      "vtab.llmSuggestions": {
        createdAt: 1,
        id: "batch-1",
        suggestions: [suggestion, { bad: true }]
      }
    });

    const batch = await loadLlmSuggestionBatch();
    const updated = updateSuggestionStatus({ createdAt: 1, id: "batch-1", suggestions: [suggestion] }, "suggestion-1", "rejected");
    await saveLlmSuggestionBatch(updated);

    expect(batch?.suggestions).toEqual([suggestion]);
    expect(updated.suggestions[0]?.status).toBe("rejected");
    expect(storageMock.set).toHaveBeenCalledWith({
      "vtab.llmSuggestions": updated
    });
  });

  it("applies existing-folder and new-folder suggestions through native bookmark writes", async () => {
    await applyLlmSuggestion(
      {
        bookmarkId: "3",
        confidence: 0.8,
        id: "suggestion-1",
        reason: "Move it",
        status: "pending",
        targetFolderId: "5"
      },
      folders
    );
    await applyLlmSuggestion(
      {
        bookmarkId: "3",
        confidence: 0.8,
        id: "suggestion-2",
        newFolderName: "AI",
        reason: "Move it",
        status: "pending"
      },
      folders
    );

    expect(bookmarkApiMock.move).toHaveBeenNthCalledWith(1, "3", {
      index: undefined,
      parentId: "5"
    });
    expect(bookmarkApiMock.create).toHaveBeenCalledWith({
      parentId: "1",
      title: "AI"
    });
    expect(bookmarkApiMock.move).toHaveBeenNthCalledWith(2, "3", {
      index: undefined,
      parentId: "9"
    });
  });
});
