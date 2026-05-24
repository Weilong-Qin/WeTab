import { browser, type Browser } from "wxt/browser";
import type { LanguageCode } from "../types/language";

const LANGUAGE_STORAGE_KEY = "vtab.language";
const DEFAULT_LANGUAGE: LanguageCode = "en";

export function normalizeLanguage(value: unknown): LanguageCode | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();

  if (normalized === "en" || normalized.startsWith("en-")) {
    return "en";
  }

  if (normalized === "zh" || normalized.startsWith("zh-")) {
    return "zh-CN";
  }

  return undefined;
}

export async function resolveLanguage(): Promise<LanguageCode> {
  const storedLanguage = await readStoredLanguage();
  return storedLanguage ?? getBrowserLanguage();
}

export async function saveLanguage(language: LanguageCode): Promise<void> {
  await browser.storage.local.set({ [LANGUAGE_STORAGE_KEY]: language });
}

export function getBrowserLanguage(): LanguageCode {
  const uiLanguage = browser.i18n?.getUILanguage?.() ?? navigator.language;
  return normalizeLanguage(uiLanguage) ?? DEFAULT_LANGUAGE;
}

export function subscribeToLanguageChanges(onChange: (language: LanguageCode) => void): () => void {
  const listener = (
    changes: Record<string, Browser.storage.StorageChange>,
    areaName: string
  ) => {
    if (areaName !== "local") {
      return;
    }

    const changedLanguage = normalizeLanguage(changes[LANGUAGE_STORAGE_KEY]?.newValue);

    if (changedLanguage) {
      onChange(changedLanguage);
    }
  };

  browser.storage.onChanged.addListener(listener);

  return () => browser.storage.onChanged.removeListener(listener);
}

async function readStoredLanguage(): Promise<LanguageCode | null> {
  try {
    const result = await browser.storage.local.get(LANGUAGE_STORAGE_KEY);
    return normalizeLanguage(result[LANGUAGE_STORAGE_KEY]) ?? null;
  } catch {
    return null;
  }
}
