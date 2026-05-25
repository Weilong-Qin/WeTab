export type ThemePreference = "light" | "dark" | "system";

export type UrlValidationScheduleScope = "all" | "folder";

export type UrlValidationScheduleIntervalMinutes = 15 | 60 | 360 | 1440;

export interface UrlValidationScheduleConfig {
  enabled: boolean;
  intervalMinutes: UrlValidationScheduleIntervalMinutes;
  scope: UrlValidationScheduleScope;
  targetFolderId?: string;
}
