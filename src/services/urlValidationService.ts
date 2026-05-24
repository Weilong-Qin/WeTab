import { browser } from "wxt/browser";
import type { BookmarkItem, BookmarkStatus } from "../types/bookmarks";

const URL_VALIDATION_STORAGE_KEY = "vtab.urlValidationStatus";
const DEFAULT_TIMEOUT_MS = 6000;

export interface UrlValidationRecord {
  checkedAt: number;
  status: BookmarkStatus;
}

export type UrlValidationStatusMap = Record<string, UrlValidationRecord>;

export interface UrlValidationTarget {
  id: string;
  url: string;
}

export interface UrlValidationOptions {
  now?: number;
  timeoutMs?: number;
}

export async function loadUrlValidationStatuses(): Promise<UrlValidationStatusMap> {
  try {
    const result = await browser.storage.local.get(URL_VALIDATION_STORAGE_KEY);
    return normalizeStatusMap(result[URL_VALIDATION_STORAGE_KEY]);
  } catch {
    return {};
  }
}

export async function saveUrlValidationStatuses(statuses: UrlValidationStatusMap): Promise<void> {
  await browser.storage.local.set({ [URL_VALIDATION_STORAGE_KEY]: statuses });
}

export function applyUrlValidationStatuses<T extends BookmarkItem>(
  bookmarks: T[],
  statuses: UrlValidationStatusMap
): T[] {
  return bookmarks.map((bookmark) => ({
    ...bookmark,
    status: statuses[bookmark.id]?.status ?? "unchecked"
  }));
}

export async function validateBookmarkUrls(
  targets: UrlValidationTarget[],
  options: UrlValidationOptions = {}
): Promise<UrlValidationStatusMap> {
  const existingStatuses = await loadUrlValidationStatuses();
  const nextStatuses: UrlValidationStatusMap = { ...existingStatuses };
  const checkedAt = options.now ?? Date.now();

  for (const target of targets) {
    nextStatuses[target.id] = {
      checkedAt,
      status: await validateUrl(target.url, options)
    };
  }

  await saveUrlValidationStatuses(nextStatuses);
  return nextStatuses;
}

export async function validateUrl(url: string, options: UrlValidationOptions = {}): Promise<BookmarkStatus> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  if (!isHttpUrl(url)) {
    return "offline";
  }

  const headStatus = await fetchWithTimeout(url, "HEAD", timeoutMs);

  if (headStatus === "verified") {
    return "verified";
  }

  if (headStatus === "offline" || headStatus === "retry") {
    const getStatus = await fetchWithTimeout(url, "GET", timeoutMs);
    return getStatus === "retry" ? "offline" : getStatus;
  }

  return "offline";
}

async function fetchWithTimeout(
  url: string,
  method: "GET" | "HEAD",
  timeoutMs: number
): Promise<BookmarkStatus | "retry"> {
  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method,
      signal: controller.signal
    });

    if (response.status >= 200 && response.status < 400) {
      return "verified";
    }

    return response.status === 405 && method === "HEAD" ? "retry" : "offline";
  } catch {
    return method === "HEAD" ? "retry" : "offline";
  } finally {
    globalThis.clearTimeout(timeout);
  }
}

function isHttpUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
  } catch {
    return false;
  }
}

function normalizeStatusMap(value: unknown): UrlValidationStatusMap {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const statuses: UrlValidationStatusMap = {};

  for (const [id, record] of Object.entries(value)) {
    if (!record || typeof record !== "object" || Array.isArray(record)) {
      continue;
    }

    const maybeRecord = record as Partial<UrlValidationRecord>;

    if (!isBookmarkStatus(maybeRecord.status) || typeof maybeRecord.checkedAt !== "number") {
      continue;
    }

    statuses[id] = {
      checkedAt: maybeRecord.checkedAt,
      status: maybeRecord.status
    };
  }

  return statuses;
}

function isBookmarkStatus(value: unknown): value is BookmarkStatus {
  return value === "verified" || value === "offline" || value === "unchecked";
}
