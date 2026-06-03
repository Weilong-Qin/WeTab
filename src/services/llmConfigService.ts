import { browser, type Browser } from "wxt/browser";
import { LlmConfigPartialSchema } from "../utils/schemas";

const LLM_CONFIG_STORAGE_KEY = "vtab.llmConfig";
const DEFAULT_CONNECTION_TIMEOUT_MS = 10000;
let pendingLlmConfigSave: Promise<void> | null = null;

export interface LlmConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
}

export interface LlmConnectionTestResult {
  ok: boolean;
  status?: number;
}

export const DEFAULT_LLM_CONFIG: LlmConfig = {
  baseUrl: "https://api.openai.com/v1",
  apiKey: "",
  model: "gpt-4.1-mini"
};

export function normalizeLlmConfig(value: unknown): LlmConfig {
  const parsed = LlmConfigPartialSchema.safeParse(value);

  if (!parsed.success) {
    return { ...DEFAULT_LLM_CONFIG };
  }

  const raw = parsed.data;
  const baseUrl = normalizeBaseUrl(raw.baseUrl);
  const model = raw.model || DEFAULT_LLM_CONFIG.model;

  return {
    baseUrl,
    apiKey: raw.apiKey ?? "",
    model
  };
}

export async function loadLlmConfig(): Promise<LlmConfig> {
  try {
    await pendingLlmConfigSave;
    const result = await browser.storage.local.get(LLM_CONFIG_STORAGE_KEY);
    return normalizeLlmConfig(result[LLM_CONFIG_STORAGE_KEY]);
  } catch {
    return { ...DEFAULT_LLM_CONFIG };
  }
}

export async function saveLlmConfig(config: LlmConfig): Promise<LlmConfig> {
  const normalizedConfig = normalizeLlmConfig(config);
  const savePromise = browser.storage.local.set({ [LLM_CONFIG_STORAGE_KEY]: normalizedConfig });
  pendingLlmConfigSave = savePromise;

  try {
    await savePromise;
  } finally {
    if (pendingLlmConfigSave === savePromise) {
      pendingLlmConfigSave = null;
    }
  }

  return normalizedConfig;
}

export function subscribeToLlmConfigChanges(onChange: (config: LlmConfig) => void): () => void {
  const listener = (
    changes: Record<string, Browser.storage.StorageChange>,
    areaName: string
  ) => {
    if (areaName !== "local" || !(LLM_CONFIG_STORAGE_KEY in changes)) {
      return;
    }

    onChange(normalizeLlmConfig(changes[LLM_CONFIG_STORAGE_KEY]?.newValue));
  };

  browser.storage.onChanged.addListener(listener);

  return () => browser.storage.onChanged.removeListener(listener);
}

export async function testLlmConnection(
  config: LlmConfig,
  timeoutMs = DEFAULT_CONNECTION_TIMEOUT_MS
): Promise<LlmConnectionTestResult> {
  const normalizedConfig = normalizeLlmConfig(config);

  if (!normalizedConfig.apiKey || !normalizedConfig.model) {
    return { ok: false };
  }

  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${normalizedConfig.baseUrl}/models`, {
      headers: {
        Authorization: `Bearer ${normalizedConfig.apiKey}`
      },
      method: "GET",
      signal: controller.signal
    });

    return {
      ok: response.ok,
      status: response.status
    };
  } catch {
    return { ok: false };
  } finally {
    globalThis.clearTimeout(timeout);
  }
}

function normalizeBaseUrl(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) {
    return DEFAULT_LLM_CONFIG.baseUrl;
  }

  const trimmed = value.trim().replace(/\/+$/u, "");

  if (!trimmed) {
    return DEFAULT_LLM_CONFIG.baseUrl;
  }

  try {
    const parsedUrl = new URL(trimmed);

    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      return DEFAULT_LLM_CONFIG.baseUrl;
    }

    return trimmed;
  } catch {
    return DEFAULT_LLM_CONFIG.baseUrl;
  }
}
