import { browser, type Browser } from "wxt/browser";
import type { ThemePreference } from "../types/settings";

const THEME_PREFERENCE_STORAGE_KEY = "vtab.themePreference";

export const DEFAULT_THEME_PREFERENCE: ThemePreference = "system";

export function normalizeThemePreference(value: unknown): ThemePreference {
  if (value === "light" || value === "dark" || value === "system") {
    return value;
  }

  return DEFAULT_THEME_PREFERENCE;
}

export async function loadThemePreference(): Promise<ThemePreference> {
  try {
    const result = await browser.storage.local.get(THEME_PREFERENCE_STORAGE_KEY);
    return normalizeThemePreference(result[THEME_PREFERENCE_STORAGE_KEY]);
  } catch {
    return normalizeThemePreference(getFallbackStorage()?.getItem(THEME_PREFERENCE_STORAGE_KEY));
  }
}

export async function saveThemePreference(preference: ThemePreference): Promise<ThemePreference> {
  const normalizedPreference = normalizeThemePreference(preference);

  try {
    await browser.storage.local.set({ [THEME_PREFERENCE_STORAGE_KEY]: normalizedPreference });
  } catch {
    getFallbackStorage()?.setItem(THEME_PREFERENCE_STORAGE_KEY, normalizedPreference);
  }

  return normalizedPreference;
}

export function subscribeToThemePreferenceChanges(onChange: (preference: ThemePreference) => void): () => void {
  const listener = (
    changes: Record<string, Browser.storage.StorageChange>,
    areaName: string
  ) => {
    if (areaName !== "local") {
      return;
    }

    const changedPreference = normalizeThemePreference(changes[THEME_PREFERENCE_STORAGE_KEY]?.newValue);

    onChange(changedPreference);
  };

  browser.storage.onChanged.addListener(listener);

  return () => browser.storage.onChanged.removeListener(listener);
}

export function applyThemePreference(preference: ThemePreference, root?: HTMLElement): void {
  const targetRoot = root ?? getDocumentRoot();

  if (!targetRoot) {
    return;
  }

  targetRoot.dataset.theme = preference;
  targetRoot.style.colorScheme = preference === "system" ? "light dark" : preference;
}

function getFallbackStorage(): Storage | undefined {
  return typeof globalThis.localStorage === "undefined" ? undefined : globalThis.localStorage;
}

function getDocumentRoot(): HTMLElement | undefined {
  return typeof document === "undefined" ? undefined : document.documentElement;
}