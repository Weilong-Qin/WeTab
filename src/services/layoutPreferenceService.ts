import { browser } from "wxt/browser";

const SIDEBAR_WIDTH_STORAGE_KEY = "vtab.sidebarWidth";

export const DEFAULT_SIDEBAR_WIDTH = 280;
export const MIN_SIDEBAR_WIDTH = 240;
export const MAX_SIDEBAR_WIDTH = 420;

export function normalizeSidebarWidth(width: unknown): number {
  const parsed = typeof width === "number" ? width : Number(width);

  if (!Number.isFinite(parsed)) {
    return DEFAULT_SIDEBAR_WIDTH;
  }

  return Math.min(MAX_SIDEBAR_WIDTH, Math.max(MIN_SIDEBAR_WIDTH, Math.round(parsed)));
}

export async function loadSidebarWidth(): Promise<number> {
  try {
    const result = await browser.storage.local.get(SIDEBAR_WIDTH_STORAGE_KEY);
    return normalizeSidebarWidth(result[SIDEBAR_WIDTH_STORAGE_KEY]);
  } catch {
    return normalizeSidebarWidth(window.localStorage.getItem(SIDEBAR_WIDTH_STORAGE_KEY));
  }
}

export async function saveSidebarWidth(width: number): Promise<void> {
  const normalizedWidth = normalizeSidebarWidth(width);

  try {
    await browser.storage.local.set({ [SIDEBAR_WIDTH_STORAGE_KEY]: normalizedWidth });
  } catch {
    window.localStorage.setItem(SIDEBAR_WIDTH_STORAGE_KEY, String(normalizedWidth));
  }
}
