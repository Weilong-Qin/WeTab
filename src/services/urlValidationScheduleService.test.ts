import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { BookmarkItem } from "../types/bookmarks";
import {
  DEFAULT_URL_VALIDATION_SCHEDULE_CONFIG,
  buildUrlValidationTargets,
  loadUrlValidationScheduleConfig,
  normalizeUrlValidationScheduleConfig,
  runScheduledUrlValidation,
  saveUrlValidationScheduleConfig
} from "./urlValidationScheduleService";

const storageMock = vi.hoisted(() => ({
  get: vi.fn<() => Promise<Record<string, unknown>>>(),
  set: vi.fn<() => Promise<void>>()
}));

const validateBookmarkUrlsMock = vi.hoisted(() => vi.fn());

vi.mock("./urlValidationService", () => ({
  validateBookmarkUrls: validateBookmarkUrlsMock
}));

vi.mock("wxt/browser", () => ({
  browser: {
    storage: {
      local: storageMock,
      onChanged: {
        addListener: vi.fn(),
        removeListener: vi.fn()
      }
    }
  }
}));

const bookmarks: BookmarkItem[] = [
  {
    accent: "blue",
    description: "Saved from example.com",
    domain: "example.com",
    folderIdPath: ["1"],
    folderPath: ["Bookmarks"],
    iconLabel: "E",
    id: "1",
    status: "unchecked",
    tag: "Examples",
    tagTone: "blue",
    title: "Example",
    url: "https://example.com"
  },
  {
    accent: "red",
    description: "Saved from example.org",
    domain: "example.org",
    folderIdPath: ["1"],
    folderPath: ["Bookmarks"],
    iconLabel: "O",
    id: "2",
    status: "unchecked",
    tag: "Docs",
    tagTone: "red",
    title: "Docs",
    url: "https://example.org"
  }
];

beforeEach(() => {
  storageMock.get.mockReset();
  storageMock.get.mockResolvedValue({});
  storageMock.set.mockReset();
  storageMock.set.mockResolvedValue();
  validateBookmarkUrlsMock.mockReset();
  validateBookmarkUrlsMock.mockResolvedValue({});
  vi.stubGlobal("localStorage", {
    clear: vi.fn(),
    getItem: vi.fn((key: string) => fallbackStorage[key] ?? null),
    removeItem: vi.fn((key: string) => {
      delete fallbackStorage[key];
    }),
    setItem: vi.fn((key: string, value: string) => {
      fallbackStorage[key] = value;
    })
  });
  fallbackStorage = {};
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("urlValidationScheduleService", () => {
  it("normalizes invalid values to the default schedule config", () => {
    expect(normalizeUrlValidationScheduleConfig(null)).toEqual(DEFAULT_URL_VALIDATION_SCHEDULE_CONFIG);
    expect(
      normalizeUrlValidationScheduleConfig({ enabled: true, intervalMinutes: 7, scope: "selected" })
    ).toEqual({ enabled: true, intervalMinutes: 60, scope: "all", targetFolderId: undefined });
  });

  it("loads and saves the schedule config with storage fallback", async () => {
    storageMock.get.mockResolvedValue({
      "vtab.urlValidationSchedule": {
        enabled: true,
        intervalMinutes: 15,
        scope: "folder",
        targetFolderId: "1"
      }
    });

    await expect(loadUrlValidationScheduleConfig()).resolves.toEqual({
      enabled: true,
      intervalMinutes: 15,
      scope: "folder",
      targetFolderId: "1"
    });

    storageMock.get.mockRejectedValueOnce(new Error("storage unavailable"));
    globalThis.localStorage.setItem(
      "vtab.urlValidationSchedule",
      JSON.stringify({ enabled: true, intervalMinutes: 360, scope: "folder", targetFolderId: "1" })
    );
    await expect(loadUrlValidationScheduleConfig()).resolves.toEqual({
      enabled: true,
      intervalMinutes: 360,
      scope: "folder",
      targetFolderId: "1"
    });

    await expect(
      saveUrlValidationScheduleConfig({ enabled: true, intervalMinutes: 360, scope: "folder", targetFolderId: "1" })
    ).resolves.toEqual({ enabled: true, intervalMinutes: 360, scope: "folder", targetFolderId: "1" });

    expect(storageMock.set).toHaveBeenCalledWith({
      "vtab.urlValidationSchedule": { enabled: true, intervalMinutes: 360, scope: "folder", targetFolderId: "1" }
    });
  });

  it("builds validation targets from a configured folder or all bookmarks", async () => {
    expect(
      buildUrlValidationTargets(bookmarks, { enabled: true, intervalMinutes: 60, scope: "folder", targetFolderId: "1" })
    ).toEqual([
      { id: "1", url: "https://example.com" },
      { id: "2", url: "https://example.org" }
    ]);

    expect(
      buildUrlValidationTargets(bookmarks, { enabled: true, intervalMinutes: 60, scope: "all" })
    ).toEqual([
      { id: "1", url: "https://example.com" },
      { id: "2", url: "https://example.org" }
    ]);
  });

  it("runs scheduled validation only when enabled and returns the target count", async () => {
    await expect(
      runScheduledUrlValidation(bookmarks, { enabled: false, intervalMinutes: 60, scope: "folder", targetFolderId: "1" })
    ).resolves.toBe(0);

    await expect(
      runScheduledUrlValidation(bookmarks, { enabled: true, intervalMinutes: 60, scope: "folder", targetFolderId: "1" })
    ).resolves.toBe(2);

    expect(validateBookmarkUrlsMock).toHaveBeenCalledWith([
      { id: "1", url: "https://example.com" },
      { id: "2", url: "https://example.org" }
    ]);
  });
});

let fallbackStorage: Record<string, string> = {};
