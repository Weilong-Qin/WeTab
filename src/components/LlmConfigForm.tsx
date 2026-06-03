import type { ReactNode } from "react";
import { DEFAULT_LLM_CONFIG, type LlmConfig } from "../services/llmConfigService";
import { isHttpUrl, getProviderStatusMessage, type SaveStatus, type TestStatus } from "../hooks/useLlmConfig";
import { Button } from "./Button";

export interface LlmConfigFormMessages {
  baseUrl: string;
  apiKey: string;
  model: string;
  testConnection: string;
  testingConnection: string;
  providerStatus: {
    invalidBaseUrl: string;
    loading: string;
    saveError: string;
    saved: string;
    saving: string;
    testError: string;
    testSuccess: string;
  };
}

export interface LlmConfigFormProps {
  isLlmConfigLoading: boolean;
  isTestConnectionDisabled: boolean;
  llmConfig: LlmConfig;
  onFieldChange: (field: keyof LlmConfig, value: string) => void;
  onTestConnection: () => void;
  saveStatus: SaveStatus;
  testStatus: TestStatus;
  headingTitle: ReactNode;
  messages: LlmConfigFormMessages;
}

export function LlmConfigForm({
  isLlmConfigLoading,
  isTestConnectionDisabled,
  llmConfig,
  onFieldChange,
  onTestConnection,
  saveStatus,
  testStatus,
  headingTitle,
  messages
}: LlmConfigFormProps) {
  const providerStatusMessage = getProviderStatusMessage({
    isBaseUrlValid: isHttpUrl(llmConfig.baseUrl),
    isLoading: isLlmConfigLoading,
    saveStatus,
    testStatus,
    messages: messages.providerStatus
  });

  return (
    <>
      <div className="settings-panel__heading">
        {headingTitle}
        <Button
          disabled={isTestConnectionDisabled}
          icon="shield"
          onClick={onTestConnection}
          variant="glass"
        >
          {testStatus === "testing" ? messages.testingConnection : messages.testConnection}
        </Button>
      </div>

      <form className="settings-form" onSubmit={(event) => event.preventDefault()}>
        <label>
          <span>{messages.baseUrl}</span>
          <input
            disabled={isLlmConfigLoading}
            onChange={(event) => onFieldChange("baseUrl", event.target.value)}
            placeholder={DEFAULT_LLM_CONFIG.baseUrl}
            type="url"
            value={llmConfig.baseUrl}
          />
        </label>
        <label>
          <span>{messages.apiKey}</span>
          <input
            autoComplete="off"
            disabled={isLlmConfigLoading}
            onChange={(event) => onFieldChange("apiKey", event.target.value)}
            placeholder="sk-..."
            type="password"
            value={llmConfig.apiKey}
          />
        </label>
        <label>
          <span>{messages.model}</span>
          <input
            disabled={isLlmConfigLoading}
            onChange={(event) => onFieldChange("model", event.target.value)}
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
    </>
  );
}
