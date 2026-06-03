import { useState, type CSSProperties, type ChangeEvent } from "react";
import { Button } from "./Button";
import { GlassPanel } from "./GlassPanel";
import { Icon } from "./Icon";
import { LlmConfigForm } from "./LlmConfigForm";
import { Tag } from "./Tag";
import { useI18n } from "../hooks/useI18n";
import { useLeetCodeProfile } from "../hooks/useLeetCodeProfile";
import { useLlmConfig } from "../hooks/useLlmConfig";
import { useThemePreference } from "../hooks/useThemePreference";
import { useUrlValidationSchedule } from "../hooks/useUrlValidationSchedule";
import type { LeetCodeRegion } from "../types/settings";
import type { FolderItem } from "../types/bookmarks";

const SCHEDULE_INTERVAL_OPTIONS = [15, 60, 360, 1440] as const;

export interface SettingsModalProps {
  folders: FolderItem[];
  onClose: () => void;
}

export function SettingsModal({ folders, onClose }: SettingsModalProps) {
  const { isLanguageLoading, language, languageOptions, messages, setLanguage } = useI18n();
  const { isLeetCodeProfileLoading, leetcodeProfile, setLeetCodeProfile } = useLeetCodeProfile();
  const { isThemePreferenceLoading, setThemePreference, themePreference } = useThemePreference();
  const {
    isUrlValidationScheduleLoading,
    setUrlValidationSchedule,
    urlValidationSchedule
  } = useUrlValidationSchedule();
  const llm = useLlmConfig();
  const scheduleFolderOptions = flattenSettingFolders(folders).filter((folder) => folder.id !== "all");

  function handleLanguageChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextOption = languageOptions.find((option) => option.code === event.target.value);

    if (nextOption) {
      void setLanguage(nextOption.code);
    }
  }

  function handleThemeChange(event: ChangeEvent<HTMLSelectElement>) {
    void setThemePreference(event.target.value as "light" | "dark" | "system");
  }

  function handleLeetCodeUsernameChange(event: ChangeEvent<HTMLInputElement>) {
    void setLeetCodeProfile({ ...leetcodeProfile, username: event.target.value });
  }

  function handleLeetCodeRegionChange(event: ChangeEvent<HTMLSelectElement>) {
    void setLeetCodeProfile({
      ...leetcodeProfile,
      region: event.target.value as LeetCodeRegion
    });
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
    const scope = event.target.value === "folder" ? "folder" : "all";

    await setUrlValidationSchedule({
      ...urlValidationSchedule,
      scope,
      targetFolderId:
        scope === "folder"
          ? urlValidationSchedule.targetFolderId ?? scheduleFolderOptions[0]?.id
          : undefined
    });
  }

  async function handleScheduleFolderChange(event: ChangeEvent<HTMLSelectElement>) {
    await setUrlValidationSchedule({
      ...urlValidationSchedule,
      scope: "folder",
      targetFolderId: event.target.value || undefined
    });
  }

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
            <h2 className="settings-panel__title-with-icon">
              {messages.settings.title}
              <SettingsInfoTooltip text={messages.settings.description} />
            </h2>
          </div>
          <Button aria-label={messages.settings.close} icon="x" onClick={onClose} variant="icon" />
        </div>

        <div className="settings-modal__content">
          <section className="settings-section">
            <div className="settings-panel__heading">
              <h3 className="settings-panel__title-with-icon">
                {messages.settings.languageTitle}
                <SettingsInfoTooltip text={messages.settings.languageHelp} />
              </h3>
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
                <div className="settings-label-with-icon">
                  <span>{messages.settings.themeLabel}</span>
                  <SettingsInfoTooltip align="end" inline size={14} text={messages.settings.themeDescription} />
                </div>
                <select disabled={isThemePreferenceLoading} onChange={handleThemeChange} value={themePreference}>
                  <option value="light">{messages.settings.themeModes.light}</option>
                  <option value="dark">{messages.settings.themeModes.dark}</option>
                  <option value="system">{messages.settings.themeModes.system}</option>
                </select>
              </label>
            </div>
          </section>

          <section className="settings-section">
            <div className="settings-panel__heading">
              <h3 className="settings-panel__title-with-icon">
                {messages.settings.leetcodeTitle}
                <SettingsInfoTooltip text={messages.settings.leetcodeHelp} />
              </h3>
            </div>
            <div className="settings-form">
              <label>
                <div className="settings-label-with-icon">
                  <span>{messages.settings.leetcodeRegionLabel}</span>
                  <SettingsInfoTooltip align="end" inline size={14} text={messages.settings.leetcodeRegionDescription} />
                </div>
                <select
                  disabled={isLeetCodeProfileLoading}
                  onChange={handleLeetCodeRegionChange}
                  value={leetcodeProfile.region}
                >
                  <option value="com">{messages.settings.leetcodeRegionOptions.com}</option>
                  <option value="cn">{messages.settings.leetcodeRegionOptions.cn}</option>
                </select>
              </label>
              <label>
                <div className="settings-label-with-icon">
                  <span>{messages.settings.leetcodeUsernameLabel}</span>
                  <SettingsInfoTooltip align="end" inline size={14} text={messages.settings.leetcodeUsernameDescription} />
                </div>
                <input
                  autoComplete="off"
                  disabled={isLeetCodeProfileLoading}
                  onChange={handleLeetCodeUsernameChange}
                  placeholder={messages.settings.leetcodeUsernamePlaceholder}
                  type="text"
                  value={leetcodeProfile.username}
                />
              </label>
            </div>
          </section>

          <section className="settings-section">
            <LlmConfigForm
              headingTitle={
                <h3 className="settings-panel__title-with-icon">
                  {messages.settings.providerTitle}
                  <SettingsInfoTooltip text={`${messages.settings.providerHelp}\n\n${messages.settings.dataSentTitle}: ${messages.settings.dataSentDescription}`} />
                </h3>
              }
              isLlmConfigLoading={llm.isLlmConfigLoading}
              isTestConnectionDisabled={llm.isTestConnectionDisabled}
              llmConfig={llm.llmConfig}
              messages={{
                baseUrl: messages.settings.baseUrl,
                apiKey: messages.settings.apiKey,
                model: messages.settings.model,
                testConnection: messages.settings.testConnection,
                testingConnection: messages.settings.testingConnection,
                providerStatus: messages.settings.providerStatus
              }}
              onFieldChange={llm.handleLlmConfigChange}
              onTestConnection={llm.handleTestConnection}
              saveStatus={llm.saveStatus}
              testStatus={llm.testStatus}
            />
          </section>

          <section className="settings-section">
            <div className="settings-panel__heading">
              <h3 className="settings-panel__title-with-icon">
                {messages.settings.scheduleTitle}
                <SettingsInfoTooltip text={messages.settings.scheduleHelp} />
              </h3>
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
                <div className="settings-label-with-icon">
                  <span>{messages.settings.scheduleScopeLabel}</span>
                  <SettingsInfoTooltip align="end" inline size={14} text={messages.settings.scheduleScopeDescription} />
                </div>
                <select
                  disabled={isUrlValidationScheduleLoading || !urlValidationSchedule.enabled}
                  onChange={(event) => void handleScheduleScopeChange(event)}
                  value={urlValidationSchedule.scope}
                >
                  <option value="all">{messages.settings.scheduleScopeAll}</option>
                  <option value="folder">{messages.settings.scheduleScopeFolder}</option>
                </select>
              </label>
              {urlValidationSchedule.scope === "folder" ? (
                <label>
                  <span>{messages.settings.scheduleFolderLabel}</span>
                  <select
                    disabled={isUrlValidationScheduleLoading || !urlValidationSchedule.enabled || !scheduleFolderOptions.length}
                    onChange={(event) => void handleScheduleFolderChange(event)}
                    value={urlValidationSchedule.targetFolderId ?? ""}
                  >
                    <option value="">{messages.settings.scheduleFolderPlaceholder}</option>
                    {scheduleFolderOptions.map((folder) => (
                      <option key={folder.id} value={folder.id}>
                        {folder.label}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
            </div>

            {urlValidationSchedule.scope === "folder" && !urlValidationSchedule.targetFolderId ? (
              <div className="settings-note">
                <strong className="settings-status settings-status--warning" style={{ marginTop: 0 }}>
                  {messages.settings.scheduleFolderRequired}
                </strong>
              </div>
            ) : null}
          </section>
        </div>
      </GlassPanel>
    </div>
  );
}

function flattenSettingFolders(folders: FolderItem[]): FolderItem[] {
  return folders.flatMap((folder) => [folder, ...flattenSettingFolders(folder.children ?? [])]);
}

interface SettingsInfoTooltipProps {
  align?: "center" | "end";
  inline?: boolean;
  size?: number;
  text: string;
}

function SettingsInfoTooltip({ align = "center", inline = false, size = 16, text }: SettingsInfoTooltipProps) {
  const [tooltipPosition, setTooltipPosition] = useState<{ left: number; top: number } | null>(null);
  const tooltipStyle = tooltipPosition
    ? ({
        "--tooltip-left": `${tooltipPosition.left}px`,
        "--tooltip-top": `${tooltipPosition.top}px`
      } as CSSProperties)
    : undefined;

  function showTooltip(target: HTMLElement) {
    const rect = target.getBoundingClientRect();
    setTooltipPosition({
      left: align === "end" ? rect.right : rect.left + rect.width / 2,
      top: rect.bottom + 10
    });
  }

  function hideTooltip() {
    setTooltipPosition(null);
  }

  return (
    <span
      aria-label={text}
      className={`settings-info-tooltip settings-info-tooltip--${align}${inline ? " settings-info-tooltip--inline" : ""}`}
      onBlur={hideTooltip}
      onFocus={(event) => showTooltip(event.currentTarget)}
      onMouseEnter={(event) => showTooltip(event.currentTarget)}
      onMouseLeave={hideTooltip}
      role="img"
      tabIndex={0}
    >
      <Icon name="info" size={size} />
      {tooltipPosition ? (
        <span className={`settings-info-tooltip__bubble settings-info-tooltip__bubble--${align}`} role="tooltip" style={tooltipStyle}>
          {text}
        </span>
      ) : null}
    </span>
  );
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
