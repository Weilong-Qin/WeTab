import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  applyUrlValidationStatuses,
  loadUrlValidationStatuses,
  validateBookmarkUrls,
  validateUrl
} from "./urlValidationService";
import type { BookmarkItem } from "../types/bookmarks";

const storageMock = vi.hoisted(() => ({
  get: vi.fn<() => Promise<Record<string, unknown>>>(),
  set: vi.fn<() => Promise<void>>()
}));

vi.mock("wxt/browser", () => ({
  browser: {
    storage: {
      local: storageMock
    }
  }
}));

const fetchMock = vi.fn<typeof fetch>();

const bookmark: BookmarkItem = {
  id: "3",
  title: "OpenAI Platform",
  url: "https://platform.openai.com/docs",
  domain: "platform.openai.com",
  description: "Saved from platform.openai.com",
  folderPath: ["Bookmarks Bar", "Dev"],
  folderIdPath: ["1", "2"],
  tag: "Dev",
  tagTone: "blue",
  iconLabel: "O",
  status: "unchecked",
  accent: "blue"
};

beforeEach(() => {
  vi.useRealTimers();
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
  storageMock.get.mockReset();
  storageMock.get.mockResolvedValue({});
  storageMock.set.mockReset();
  storageMock.set.mockResolvedValue();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("urlValidationService", () => {
  it("marks 2xx and 3xx HEAD responses as verified", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    await expect(validateUrl("https://example.com")).resolves.toBe("verified");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://example.com",
      expect.objectContaining({ method: "HEAD" })
    );
  });

  it("falls back to GET when HEAD is rejected by the server", async () => {
    fetchMock
      .mockResolvedValueOnce(new Response(null, { status: 405 }))
      .mockResolvedValueOnce(new Response(null, { status: 200 }));

    await expect(validateUrl("https://example.com")).resolves.toBe("verified");
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "https://example.com",
      expect.objectContaining({ method: "GET" })
    );
  });

  it("marks fetch failures, timeouts, and non-http URLs as offline", async () => {
    fetchMock.mockRejectedValue(new TypeError("Network error"));

    await expect(validateUrl("https://offline.test")).resolves.toBe("offline");
    await expect(validateUrl("chrome://bookmarks")).resolves.toBe("offline");

    vi.useFakeTimers();
    fetchMock.mockImplementationOnce(
      (_input, init) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => reject(new DOMException("Timeout", "AbortError")));
        })
    );
    const timeoutCheck = validateUrl("https://timeout.test", { timeoutMs: 20 });
    vi.advanceTimersByTime(20);
    await expect(timeoutCheck).resolves.toBe("offline");
  });

  it("loads only valid persisted status records and applies them to bookmarks", async () => {
    storageMock.get.mockResolvedValue({
      "vtab.urlValidationStatus": {
        3: { checkedAt: 123, status: "verified" },
        4: { checkedAt: "bad", status: "offline" },
        5: { checkedAt: 456, status: "unknown" }
      }
    });

    const statuses = await loadUrlValidationStatuses();
    const [mappedBookmark] = applyUrlValidationStatuses([bookmark], statuses);

    expect(statuses).toEqual({
      3: { checkedAt: 123, status: "verified" }
    });
    expect(mappedBookmark?.status).toBe("verified");
  });

  it("validates targets sequentially and persists results by bookmark id", async () => {
    storageMock.get.mockResolvedValue({
      "vtab.urlValidationStatus": {
        old: { checkedAt: 1, status: "offline" }
      }
    });
    fetchMock
      .mockResolvedValueOnce(new Response(null, { status: 200 }))
      .mockResolvedValueOnce(new Response(null, { status: 500 }));

    const statuses = await validateBookmarkUrls(
      [
        { id: "3", url: "https://ok.test" },
        { id: "4", url: "https://bad.test" }
      ],
      { now: 999 }
    );

    expect(statuses).toEqual({
      old: { checkedAt: 1, status: "offline" },
      3: { checkedAt: 999, status: "verified" },
      4: { checkedAt: 999, status: "offline" }
    });
    expect(storageMock.set).toHaveBeenCalledWith({
      "vtab.urlValidationStatus": statuses
    });
  });
});
