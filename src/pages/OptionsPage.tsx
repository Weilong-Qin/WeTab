import type { ChangeEvent } from "react";
import { Button } from "../components/Button";
import { GlassPanel } from "../components/GlassPanel";
import { Tag } from "../components/Tag";
import { useI18n } from "../hooks/useI18n";

export function OptionsPage() {
  const { isLanguageLoading, language, languageOptions, messages, setLanguage } = useI18n();

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
          <div>
            <h2>{messages.options.languageTitle}</h2>
            <p>{messages.options.languageHelp}</p>
          </div>
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

        <div className="settings-note">
          <p>{messages.options.languageDescription}</p>
        </div>
      </GlassPanel>

      <GlassPanel className="settings-panel">
        <div className="settings-panel__heading">
          <div>
            <h2>{messages.options.providerTitle}</h2>
            <p>{messages.options.providerHelp}</p>
          </div>
          <Button icon="shield" variant="glass">{messages.options.testConnection}</Button>
        </div>

        <form className="settings-form">
          <label>
            <span>{messages.options.baseUrl}</span>
            <input placeholder="https://api.openai.com/v1" type="url" />
          </label>
          <label>
            <span>{messages.options.apiKey}</span>
            <input placeholder="sk-..." type="password" />
          </label>
          <label>
            <span>{messages.options.model}</span>
            <input placeholder="gpt-4.1-mini" type="text" />
          </label>
        </form>

        <div className="settings-note">
          <strong>{messages.options.dataSentTitle}</strong>
          <p>{messages.options.dataSentDescription}</p>
        </div>
      </GlassPanel>
    </main>
  );
}
