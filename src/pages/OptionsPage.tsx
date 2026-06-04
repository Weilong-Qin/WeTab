import { type ChangeEvent } from "react";
import { GlassPanel } from "../components/GlassPanel";
import { Icon } from "../components/Icon";
import { LlmConfigForm } from "../components/LlmConfigForm";
import { Tag } from "../components/Tag";
import { useI18n } from "../hooks/useI18n";
import { useLlmConfig } from "../hooks/useLlmConfig";
import { useThemePreference } from "../hooks/useThemePreference";

export function OptionsPage() {
  const { isLanguageLoading, language, languageOptions, messages, setLanguage } = useI18n();
  useThemePreference();
  const llm = useLlmConfig();

  function handleLanguageChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextOption = languageOptions.find((option) => option.code === event.target.value);

    if (nextOption) {
      void setLanguage(nextOption.code);
    }
  }

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
        <LlmConfigForm
          headingTitle={
            <h2 className="settings-panel__title-with-icon">
              {messages.options.providerTitle}
              <Icon
                className="settings-info-icon"
                name="info"
                size={16}
                title={`${messages.options.providerHelp}\n\n${messages.options.dataSentTitle}: ${messages.options.dataSentDescription}`}
              />
            </h2>
          }
          isLlmConfigLoading={llm.isLlmConfigLoading}
          isTestConnectionDisabled={llm.isTestConnectionDisabled}
          llmConfig={llm.llmConfig}
          messages={{
            baseUrl: messages.options.baseUrl,
            apiKey: messages.options.apiKey,
            model: messages.options.model,
            testConnection: messages.options.testConnection,
            testingConnection: messages.options.testingConnection,
            providerStatus: messages.options.providerStatus
          }}
          onFieldChange={llm.handleLlmConfigChange}
          onTestConnection={llm.handleTestConnection}
          saveStatus={llm.saveStatus}
          testStatus={llm.testStatus}
        />
      </GlassPanel>
    </main>
  );
}
