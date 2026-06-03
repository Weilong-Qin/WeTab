import { useEffect, useMemo, useRef, useState } from "react";
import {
  DEFAULT_LLM_CONFIG,
  loadLlmConfig,
  normalizeLlmConfig,
  saveLlmConfig,
  testLlmConnection,
  type LlmConfig
} from "../services/llmConfigService";

export type SaveStatus = "idle" | "saving" | "saved" | "error";
export type TestStatus = "idle" | "testing" | "success" | "error";

const LLM_CONFIG_SAVE_DEBOUNCE_MS = 400;

export interface UseLlmConfigReturn {
  isBaseUrlValid: boolean;
  isLlmConfigLoading: boolean;
  isTestConnectionDisabled: boolean;
  llmConfig: LlmConfig;
  normalizedLlmConfig: LlmConfig;
  saveStatus: SaveStatus;
  testStatus: TestStatus;
  handleLlmConfigChange: (field: keyof LlmConfig, value: string) => void;
  handleTestConnection: () => void;
}

export function useLlmConfig(): UseLlmConfigReturn {
  const [isLlmConfigLoading, setIsLlmConfigLoading] = useState(true);
  const [llmConfig, setLlmConfig] = useState<LlmConfig>(DEFAULT_LLM_CONFIG);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [testStatus, setTestStatus] = useState<TestStatus>("idle");
  const llmConfigSaveTimeoutRef = useRef<ReturnType<typeof globalThis.setTimeout> | null>(null);
  const llmConfigSaveRequestIdRef = useRef(0);
  const pendingLlmConfigSaveRef = useRef<LlmConfig | null>(null);

  const normalizedLlmConfig = useMemo(() => normalizeLlmConfig(llmConfig), [llmConfig]);
  const isBaseUrlValid = isHttpUrl(llmConfig.baseUrl);
  const isTestConnectionDisabled =
    isLlmConfigLoading ||
    testStatus === "testing" ||
    !isBaseUrlValid ||
    !llmConfig.apiKey.trim() ||
    !llmConfig.model.trim();

  useEffect(() => {
    let isMounted = true;

    async function loadSavedConfig() {
      const savedConfig = await loadLlmConfig();

      if (isMounted) {
        setLlmConfig(savedConfig);
        setIsLlmConfigLoading(false);
      }
    }

    void loadSavedConfig();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (llmConfigSaveTimeoutRef.current !== null) {
        globalThis.clearTimeout(llmConfigSaveTimeoutRef.current);
      }

      const pendingConfig = pendingLlmConfigSaveRef.current;
      pendingLlmConfigSaveRef.current = null;

      if (pendingConfig) {
        void saveLlmConfig(pendingConfig);
      }
    };
  }, []);

  function handleLlmConfigChange(field: keyof LlmConfig, value: string) {
    const nextConfig = {
      ...llmConfig,
      [field]: value
    };

    setLlmConfig(nextConfig);
    setSaveStatus("saving");
    setTestStatus("idle");

    if (llmConfigSaveTimeoutRef.current !== null) {
      globalThis.clearTimeout(llmConfigSaveTimeoutRef.current);
    }

    const requestId = llmConfigSaveRequestIdRef.current + 1;
    llmConfigSaveRequestIdRef.current = requestId;
    pendingLlmConfigSaveRef.current = nextConfig;
    llmConfigSaveTimeoutRef.current = globalThis.setTimeout(() => {
      llmConfigSaveTimeoutRef.current = null;
      pendingLlmConfigSaveRef.current = null;

      void saveLlmConfig(nextConfig)
        .then(() => {
          if (llmConfigSaveRequestIdRef.current === requestId) {
            setSaveStatus("saved");
          }
        })
        .catch(() => {
          if (llmConfigSaveRequestIdRef.current === requestId) {
            setSaveStatus("error");
          }
        });
    }, LLM_CONFIG_SAVE_DEBOUNCE_MS);
  }

  async function handleTestConnection() {
    if (isTestConnectionDisabled) {
      return;
    }

    setTestStatus("testing");

    const result = await testLlmConnection(normalizedLlmConfig);
    setTestStatus(result.ok ? "success" : "error");
  }

  return {
    isBaseUrlValid,
    isLlmConfigLoading,
    isTestConnectionDisabled,
    llmConfig,
    normalizedLlmConfig,
    saveStatus,
    testStatus,
    handleLlmConfigChange,
    handleTestConnection
  };
}

export function isHttpUrl(value: string): boolean {
  try {
    const parsedUrl = new URL(value.trim());
    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
  } catch {
    return false;
  }
}

export interface ProviderStatusMessages {
  invalidBaseUrl: string;
  loading: string;
  saveError: string;
  saved: string;
  saving: string;
  testError: string;
  testSuccess: string;
}

interface ProviderStatusMessageParams {
  isBaseUrlValid: boolean;
  isLoading: boolean;
  saveStatus: SaveStatus;
  testStatus: TestStatus;
  messages: ProviderStatusMessages;
}

export function getProviderStatusMessage({
  isBaseUrlValid,
  isLoading,
  saveStatus,
  testStatus,
  messages
}: ProviderStatusMessageParams): string {
  if (isLoading) {
    return messages.loading;
  }

  if (!isBaseUrlValid) {
    return messages.invalidBaseUrl;
  }

  if (testStatus === "success") {
    return messages.testSuccess;
  }

  if (testStatus === "error") {
    return messages.testError;
  }

  if (saveStatus === "saving") {
    return messages.saving;
  }

  if (saveStatus === "saved") {
    return messages.saved;
  }

  if (saveStatus === "error") {
    return messages.saveError;
  }

  return "";
}
