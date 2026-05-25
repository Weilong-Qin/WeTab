import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { Button } from "../components/Button";
import { GlassPanel } from "../components/GlassPanel";
import { Icon } from "../components/Icon";
import { Tag } from "../components/Tag";
import { useI18n } from "../hooks/useI18n";
import { useThemePreference } from "../hooks/useThemePreference";
import {
  DEFAULT_LLM_CONFIG,
  loadLlmConfig,
  normalizeLlmConfig,
  saveLlmConfig,
  testLlmConnection,
  type LlmConfig
} from "../services/llmConfigService";

type SaveStatus = "idle" | "saving" | "saved" | "error";
type TestStatus = "idle" | "testing" | "success" | "error";

export function OptionsPage() {
  const { isLanguageLoading, language, languageOptions, messages, setLanguage } = useI18n();
  useThemePreference();
  const [isLlmConfigLoading, setIsLlmConfigLoading] = useState(true);
  const [llmConfig, setLlmConfig] = useState<LlmConfig>(DEFAULT_LLM_CONFIG);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [testStatus, setTestStatus] = useState<TestStatus>("idle");

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

  function handleLanguageChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextOption = languageOptions.find((option) => option.code === event.target.value);

    if (nextOption) {
      void setLanguage(nextOption.code);
    }
  }

  function handleLlmConfigChange(field: keyof LlmConfig, value: string) {
    const nextConfig = {
      ...llmConfig,
      [field]: value
    };

    setLlmConfig(nextConfig);
    setSaveStatus("saving");
    setTestStatus("idle");

    void saveLlmConfig(nextConfig)
      .then(() => setSaveStatus("saved"))
      .catch(() => setSaveStatus("error"));
  }

  async function handleTestConnection() {
    if (isTestConnectionDisabled) {
      return;
    }

    setTestStatus("testing");

    const result = await testLlmConnection(normalizedLlmConfig);
    setTestStatus(result.ok ? "success" : "error");
  }

  const providerStatusMessage = getProviderStatusMessage({
    isBaseUrlValid,
    isLoading: isLlmConfigLoading,
    saveStatus,
    testStatus,
    messages: messages.options.providerStatus
  });

  return (
    <main className="settings-page">
      <section className="settings-hero">
        <Tag tone="blue">{messages.options.tag}</Tag>
        <h1>{messages.options.title}</h1>
        <p>{messages.options.description}</p>
      </section>

      <GlassPanel className="settings-panel settings-panel--language">
        <div className="settings-panel__heading">
          <h2 className="settings-panel__title-with-icon">
            {messages.options.languageTitle}
            <Icon
              className="settings-info-icon"
              name="info"
              size={16}
              title={`${messages.options.languageHelp}\n\n${messages.options.languageDescription}`}
            />
          </h2>
        </div>

        <form className="settings-form settings-form--single">
          <label>
            <span>{messages.options.languageLabel}</span>
            <select disabled={isLanguageLoading} onChange={handleLanguageChange} value={language}>
              {languageOptions.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.nativeLabel}
                </option>
              ))}
            </select>
          </label>
        </form>

      </GlassPanel>

      <GlassPanel className="settings-panel">
        <div className="settings-panel__heading">
          <h2 className="settings-panel__title-with-icon">
            {messages.options.providerTitle}
            <Icon
              className="settings-info-icon"
              name="info"
              size={16}
              title={`${messages.options.providerHelp}\n\n${messages.options.dataSentTitle}: ${messages.options.dataSentDescription}`}
            />
          </h2>
          <Button
            disabled={isTestConnectionDisabled}
            icon="shield"
            onClick={handleTestConnection}
            variant="glass"
          >
            {testStatus === "testing" ? messages.options.testingConnection : messages.options.testConnection}
          </Button>
        </div>

        <form className="settings-form" onSubmit={(event) => event.preventDefault()}>
          <label>
            <span>{messages.options.baseUrl}</span>
            <input
              disabled={isLlmConfigLoading}
              onChange={(event) => handleLlmConfigChange("baseUrl", event.target.value)}
              placeholder={DEFAULT_LLM_CONFIG.baseUrl}
              type="url"
              value={llmConfig.baseUrl}
            />
          </label>
          <label>
            <span>{messages.options.apiKey}</span>
            <input
              autoComplete="off"
              disabled={isLlmConfigLoading}
              onChange={(event) => handleLlmConfigChange("apiKey", event.target.value)}
              placeholder="sk-..."
              type="password"
              value={llmConfig.apiKey}
            />
          </label>
          <label>
            <span>{messages.options.model}</span>
            <input
              disabled={isLlmConfigLoading}
              onChange={(event) => handleLlmConfigChange("model", event.target.value)}
              placeholder={DEFAULT_LLM_CONFIG.model}
              type="text"
              value={llmConfig.model}
            />
          </label>
        </form>

        {providerStatusMessage ? (
          <p aria-live="polite" className="settings-status">
            {providerStatusMessage}
          </p>
        ) : null}

      </GlassPanel>
    </main>
  );
}

interface ProviderStatusMessageParams {
  isBaseUrlValid: boolean;
  isLoading: boolean;
  saveStatus: SaveStatus;
  testStatus: TestStatus;
  messages: {
    invalidBaseUrl: string;
    loading: string;
    saveError: string;
    saved: string;
    saving: string;
    testError: string;
    testSuccess: string;
  };
}

function getProviderStatusMessage({
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

function isHttpUrl(value: string): boolean {
  try {
    const parsedUrl = new URL(value.trim());
    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
  } catch {
    return false;
  }
}
