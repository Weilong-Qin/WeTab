import { browser, type Browser } from "wxt/browser";
import type { LeetCodeProfileConfig, LeetCodeRegion } from "../types/settings";

const LEETCODE_PROFILE_STORAGE_KEY = "vtab.leetcodeProfile";

export const DEFAULT_LEETCODE_PROFILE_CONFIG: LeetCodeProfileConfig = {
  region: "com",
  username: ""
};

export function normalizeLeetCodeProfileConfig(value: unknown): LeetCodeProfileConfig {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ...DEFAULT_LEETCODE_PROFILE_CONFIG };
  }

  const maybeConfig = value as Partial<Record<keyof LeetCodeProfileConfig, unknown>>;

  return {
    region: normalizeLeetCodeRegion(maybeConfig.region),
    username: normalizeLeetCodeUsername(maybeConfig.username)
  };
}

export function normalizeLeetCodeRegion(value: unknown): LeetCodeRegion {
  if (value === "cn") {
    return "cn";
  }

  return "com";
}

export function normalizeLeetCodeUsername(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().replace(/^@+/, "").slice(0, 64);
}

export async function loadLeetCodeProfileConfig(): Promise<LeetCodeProfileConfig> {
  try {
    const result = await browser.storage.local.get(LEETCODE_PROFILE_STORAGE_KEY);
    return normalizeLeetCodeProfileConfig(result[LEETCODE_PROFILE_STORAGE_KEY]);
  } catch {
    return normalizeLeetCodeProfileConfig(readFallbackStorage());
  }
}

export async function saveLeetCodeProfileConfig(
  config: LeetCodeProfileConfig
): Promise<LeetCodeProfileConfig> {
  const normalizedConfig = normalizeLeetCodeProfileConfig(config);

  try {
    await browser.storage.local.set({ [LEETCODE_PROFILE_STORAGE_KEY]: normalizedConfig });
  } catch {
    getFallbackStorage()?.setItem(LEETCODE_PROFILE_STORAGE_KEY, JSON.stringify(normalizedConfig));
  }

  return normalizedConfig;
}

export function subscribeToLeetCodeProfileChanges(
  onChange: (config: LeetCodeProfileConfig) => void
): () => void {
  const listener = (
    changes: Record<string, Browser.storage.StorageChange>,
    areaName: string
  ) => {
    if (areaName !== "local" || !(LEETCODE_PROFILE_STORAGE_KEY in changes)) {
      return;
    }

    onChange(normalizeLeetCodeProfileConfig(changes[LEETCODE_PROFILE_STORAGE_KEY]?.newValue));
  };

  browser.storage.onChanged.addListener(listener);

  return () => browser.storage.onChanged.removeListener(listener);
}

function getFallbackStorage(): Storage | undefined {
  return typeof globalThis.localStorage === "undefined" ? undefined : globalThis.localStorage;
}

function readFallbackStorage(): unknown {
  const fallbackStorage = getFallbackStorage();

  if (!fallbackStorage) {
    return DEFAULT_LEETCODE_PROFILE_CONFIG;
  }

  const rawValue = fallbackStorage.getItem(LEETCODE_PROFILE_STORAGE_KEY);

  if (!rawValue) {
    return DEFAULT_LEETCODE_PROFILE_CONFIG;
  }

  try {
    return JSON.parse(rawValue) as unknown;
  } catch {
    return DEFAULT_LEETCODE_PROFILE_CONFIG;
  }
}
