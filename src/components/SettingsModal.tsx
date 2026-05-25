import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { Button } from "./Button";
import { GlassPanel } from "./GlassPanel";
import { Tag } from "./Tag";
import { useI18n } from "../hooks/useI18n";
import { useThemePreference } from "../hooks/useThemePreference";
import { useUrlValidationSchedule } from "../hooks/useUrlValidationSchedule";
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

const SCHEDULE_INTERVAL_OPTIONS = [15, 60, 360, 1440] as const;

export interface SettingsModalProps {
  onClose: () => void;
  selectedBookmarkCount: number;
}

export function SettingsModal({ onClose, selectedBookmarkCount }: SettingsModalProps) {
  const { isLanguageLoading, language, languageOptions, messages, setLanguage } = useI18n();
  const { isThemePreferenceLoading, setThemePreference, themePreference } = useThemePreference();
  const {
    isUrlValidationScheduleLoading,
    setUrlValidationSchedule,
    urlValidationSchedule
  } = useUrlValidationSchedule();
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

  function handleThemeChange(event: ChangeEvent<HTMLSelectElement>) {
    void setThemePreference(event.target.value as "light" | "dark" | "system");
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

  async function handleScheduleEnabledChange(event: ChangeEvent<HTMLInputElement>) {
    await setUrlValidationSchedule({
      ...urlValidationSchedule,
      enabled: event.target.checked
    });
  }

  async function handleScheduleIntervalChange(event: ChangeEvent<HTMLSelectElement>) {
    await setUrlValidationSchedule({
      ...urlValidationSchedule,
      intervalMinutes: Number(event.target.value) as 15 | 60 | 360 | 1440
    });
  }

  async function handleScheduleScopeChange(event: ChangeEvent<HTMLSelectElement>) {
    await setUrlValidationSchedule({
      ...urlValidationSchedule,
      scope: event.target.value === "all" ? "all" : "selected"
    });
  }

  const providerStatusMessage = getProviderStatusMessage({
    isBaseUrlValid,
    isLoading: isLlmConfigLoading,
    saveStatus,
    testStatus,
    messages: messages.settings.providerStatus
  });

  return (
    <div className="modal-backdrop settings-modal-backdrop" role="presentation" onClick={onClose}>
      <GlassPanel
        aria-modal="true"
        className="settings-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="settings-modal__heading">
          <div>
            <Tag tone="blue">{messages.settings.title}</Tag>
            <h2>{messages.settings.title}</h2>
            <p>{messages.settings.description}</p>
          </div>
          <Button aria-label={messages.settings.close} icon="x" onClick={onClose} variant="icon" />
        </div>

        <div className="settings-modal__content">
          <section className="settings-section">
            <div className="settings-panel__heading">
              <div>
                <h3>{messages.settings.languageTitle}</h3>
                <p>{messages.settings.languageHelp}</p>
              </div>
            </div>
            <div className="settings-form settings-form--split">
              <label>
                <span>{messages.settings.languageLabel}</span>
                <select disabled={isLanguageLoading} onChange={handleLanguageChange} value={language}>
                  {languageOptions.map((option) => (
                    <option key={option.code} value={option.code}>
                      {option.nativeLabel}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>{messages.settings.themeLabel}</span>
                <select disabled={isThemePreferenceLoading} onChange={handleThemeChange} value={themePreference}>
                  <option value="light">{messages.settings.themeModes.light}</option>
                  <option value="dark">{messages.settings.themeModes.dark}</option>
                  <option value="system">{messages.settings.themeModes.system}</option>
                </select>
              </label>
            </div>
            <div className="settings-note">
              <p>{messages.settings.themeDescription}</p>
            </div>
          </section>

          <section className="settings-section">
            <div className="settings-panel__heading">
              <div>
                <h3>{messages.settings.providerTitle}</h3>
                <p>{messages.settings.providerHelp}</p>
              </div>
              <Button
                disabled={isTestConnectionDisabled}
                icon="shield"
                onClick={handleTestConnection}
                variant="glass"
              >
                {testStatus === "testing"
                  ? messages.settings.testingConnection
                  : messages.settings.testConnection}
              </Button>
            </div>

            <form className="settings-form" onSubmit={(event) => event.preventDefault()}>
              <label>
                <span>{messages.settings.baseUrl}</span>
                <input
                  disabled={isLlmConfigLoading}
                  onChange={(event) => handleLlmConfigChange("baseUrl", event.target.value)}
                  placeholder={DEFAULT_LLM_CONFIG.baseUrl}
                  type="url"
                  value={llmConfig.baseUrl}
                />
              </label>
              <label>
                <span>{messages.settings.apiKey}</span>
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
                <span>{messages.settings.model}</span>
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

            <div className="settings-note">
              <strong>{messages.settings.dataSentTitle}</strong>
              <p>{messages.settings.dataSentDescription}</p>
            </div>
          </section>

          <section className="settings-section">
            <div className="settings-panel__heading">
              <div>
                <h3>{messages.settings.scheduleTitle}</h3>
                <p>{messages.settings.scheduleHelp}</p>
              </div>
            </div>

            <div className="settings-form settings-form--split">
              <label className="settings-toggle">
                <span>{messages.settings.scheduleEnabledLabel}</span>
                <input
                  checked={urlValidationSchedule.enabled}
                  disabled={isUrlValidationScheduleLoading}
                  onChange={(event) => void handleScheduleEnabledChange(event)}
                  type="checkbox"
                />
              </label>
              <label>
                <span>{messages.settings.scheduleIntervalLabel}</span>
                <select
                  disabled={isUrlValidationScheduleLoading || !urlValidationSchedule.enabled}
                  onChange={(event) => void handleScheduleIntervalChange(event)}
                  value={String(urlValidationSchedule.intervalMinutes)}
                >
                  {SCHEDULE_INTERVAL_OPTIONS.map((minutes) => (
                    <option key={minutes} value={minutes}>
                      {formatScheduleIntervalLabel(minutes, language)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>{messages.settings.scheduleScopeLabel}</span>
                <select
                  disabled={isUrlValidationScheduleLoading || !urlValidationSchedule.enabled}
                  onChange={(event) => void handleScheduleScopeChange(event)}
                  value={urlValidationSchedule.scope}
                >
                  <option value="selected">{messages.settings.scheduleScopeSelected}</option>
                  <option value="all">{messages.settings.scheduleScopeAll}</option>
                </select>
              </label>
            </div>

            <div className="settings-note">
              <p>{messages.settings.scheduleScopeDescription}</p>
              <p>{messages.settings.scheduleScopeSelectedNote(selectedBookmarkCount)}</p>
              {urlValidationSchedule.scope === "selected" && selectedBookmarkCount === 0 ? (
                <strong className="settings-status settings-status--warning">
                  {messages.settings.scheduleScopeNoSelection}
                </strong>
              ) : null}
            </div>
          </section>
        </div>
      </GlassPanel>
    </div>
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

function formatScheduleIntervalLabel(minutes: number, language: "en" | "zh-CN"): string {
  if (language === "zh-CN") {
    if (minutes === 15) {
      return "15 分钟";
    }

    if (minutes === 60) {
      return "1 小时";
    }

    if (minutes === 360) {
      return "6 小时";
    }

    return "24 小时";
  }

  if (minutes === 15) {
    return "15 minutes";
  }

  if (minutes === 60) {
    return "1 hour";
  }

  if (minutes === 360) {
    return "6 hours";
  }

  return "24 hours";
}