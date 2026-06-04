import { browser, type Browser } from "wxt/browser";
import type { BookmarkItem } from "../types/bookmarks";
import type {
  UrlValidationScheduleConfig
} from "../types/settings";
import { UrlValidationScheduleLenientSchema } from "../utils/schemas";
import { validateBookmarkUrls, type UrlValidationTarget } from "./urlValidationService";

const URL_VALIDATION_SCHEDULE_STORAGE_KEY = "vtab.urlValidationSchedule";

export const DEFAULT_URL_VALIDATION_SCHEDULE_CONFIG: UrlValidationScheduleConfig = {
  enabled: false,
  intervalMinutes: 60,
  scope: "all"
};

export function normalizeUrlValidationScheduleConfig(value: unknown): UrlValidationScheduleConfig {
  const result = UrlValidationScheduleLenientSchema.parse(value);

  return {
    enabled: result.enabled,
    intervalMinutes: result.intervalMinutes as UrlValidationScheduleConfig["intervalMinutes"],
    scope: result.scope as UrlValidationScheduleConfig["scope"],
    targetFolderId: result.targetFolderId
  };
}

export async function loadUrlValidationScheduleConfig(): Promise<UrlValidationScheduleConfig> {
  try {
    const result = await browser.storage.local.get(URL_VALIDATION_SCHEDULE_STORAGE_KEY);
    return normalizeUrlValidationScheduleConfig(result[URL_VALIDATION_SCHEDULE_STORAGE_KEY]);
  } catch {
    return normalizeUrlValidationScheduleConfig(readFallbackStorage());
  }
}

export async function saveUrlValidationScheduleConfig(
  config: UrlValidationScheduleConfig
): Promise<UrlValidationScheduleConfig> {
  const normalizedConfig = normalizeUrlValidationScheduleConfig(config);

  try {
    await browser.storage.local.set({ [URL_VALIDATION_SCHEDULE_STORAGE_KEY]: normalizedConfig });
  } catch {
    getFallbackStorage()?.setItem(URL_VALIDATION_SCHEDULE_STORAGE_KEY, JSON.stringify(normalizedConfig));
  }

  return normalizedConfig;
}

export function subscribeToUrlValidationScheduleChanges(
  onChange: (config: UrlValidationScheduleConfig) => void
): () => void {
  const listener = (
    changes: Record<string, Browser.storage.StorageChange>,
    areaName: string
  ) => {
    if (areaName !== "local" || !(URL_VALIDATION_SCHEDULE_STORAGE_KEY in changes)) {
      return;
    }

    onChange(normalizeUrlValidationScheduleConfig(changes[URL_VALIDATION_SCHEDULE_STORAGE_KEY]?.newValue));
  };

  browser.storage.onChanged.addListener(listener);

  return () => browser.storage.onChanged.removeListener(listener);
}

export function buildUrlValidationTargets(
  bookmarks: BookmarkItem[],
  config: UrlValidationScheduleConfig
): UrlValidationTarget[] {
  if (!config.enabled) {
    return [];
  }

  const targetBookmarks =
    config.scope === "all"
      ? bookmarks
      : filterBookmarksByFolder(bookmarks, config.targetFolderId);

  return targetBookmarks
    .filter((bookmark) => bookmark.url.trim().length > 0)
    .map((bookmark) => ({
      id: bookmark.id,
      url: bookmark.url
    }));
}

export async function runScheduledUrlValidation(
  bookmarks: BookmarkItem[],
  config: UrlValidationScheduleConfig
): Promise<number> {
  const targets = buildUrlValidationTargets(bookmarks, config);

  if (!targets.length) {
    return 0;
  }

  await validateBookmarkUrls(targets);
  return targets.length;
}

function filterBookmarksByFolder(bookmarks: BookmarkItem[], targetFolderId: string | undefined): BookmarkItem[] {
  if (!targetFolderId) {
    return [];
  }

  return bookmarks.filter((bookmark) => bookmark.folderIdPath.includes(targetFolderId));
}

function getFallbackStorage(): Storage | undefined {
  return typeof globalThis.localStorage === "undefined" ? undefined : globalThis.localStorage;
}

function readFallbackStorage(): unknown {
  const fallbackStorage = getFallbackStorage();

  if (!fallbackStorage) {
    return DEFAULT_URL_VALIDATION_SCHEDULE_CONFIG;
  }

  const rawValue = fallbackStorage.getItem(URL_VALIDATION_SCHEDULE_STORAGE_KEY);

  if (!rawValue) {
    return DEFAULT_URL_VALIDATION_SCHEDULE_CONFIG;
  }

  try {
    return JSON.parse(rawValue) as unknown;
  } catch {
    return DEFAULT_URL_VALIDATION_SCHEDULE_CONFIG;
  }
}
