import { browser, type Browser } from "wxt/browser";
import type { BookmarkItem } from "../types/bookmarks";
import type {
  UrlValidationScheduleConfig,
  UrlValidationScheduleIntervalMinutes,
  UrlValidationScheduleScope
} from "../types/settings";
import { validateBookmarkUrls, type UrlValidationTarget } from "./urlValidationService";

const URL_VALIDATION_SCHEDULE_STORAGE_KEY = "vtab.urlValidationSchedule";

export const DEFAULT_URL_VALIDATION_SCHEDULE_CONFIG: UrlValidationScheduleConfig = {
  enabled: false,
  intervalMinutes: 60,
  scope: "all"
};

const VALID_INTERVAL_MINUTES: UrlValidationScheduleIntervalMinutes[] = [15, 60, 360, 1440];

export function normalizeUrlValidationScheduleConfig(value: unknown): UrlValidationScheduleConfig {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ...DEFAULT_URL_VALIDATION_SCHEDULE_CONFIG };
  }

  const maybeConfig = value as Partial<Record<keyof UrlValidationScheduleConfig, unknown>>;

  return {
    enabled: typeof maybeConfig.enabled === "boolean" ? maybeConfig.enabled : DEFAULT_URL_VALIDATION_SCHEDULE_CONFIG.enabled,
    intervalMinutes: normalizeIntervalMinutes(maybeConfig.intervalMinutes),
    scope: normalizeScope(maybeConfig.scope),
    targetFolderId: normalizeTargetFolderId(maybeConfig.targetFolderId)
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

function normalizeIntervalMinutes(value: unknown): UrlValidationScheduleIntervalMinutes {
  const parsedValue = typeof value === "number" ? value : Number(value);

  return VALID_INTERVAL_MINUTES.includes(parsedValue as UrlValidationScheduleIntervalMinutes)
    ? (parsedValue as UrlValidationScheduleIntervalMinutes)
    : DEFAULT_URL_VALIDATION_SCHEDULE_CONFIG.intervalMinutes;
}

function normalizeScope(value: unknown): UrlValidationScheduleScope {
  return value === "folder" ? "folder" : DEFAULT_URL_VALIDATION_SCHEDULE_CONFIG.scope;
}

function normalizeTargetFolderId(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
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
