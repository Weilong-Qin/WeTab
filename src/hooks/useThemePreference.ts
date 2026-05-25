import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_THEME_PREFERENCE,
  applyThemePreference,
  loadThemePreference,
  saveThemePreference,
  subscribeToThemePreferenceChanges
} from "../services/themePreferenceService";
import type { ThemePreference } from "../types/settings";

export function useThemePreference() {
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>(DEFAULT_THEME_PREFERENCE);
  const [isThemePreferenceLoading, setIsThemePreferenceLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    void loadThemePreference()
      .then((preference) => {
        if (isMounted) {
          setThemePreferenceState(preference);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsThemePreferenceLoading(false);
        }
      });

    const unsubscribe = subscribeToThemePreferenceChanges((nextPreference) => {
      setThemePreferenceState(nextPreference);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    applyThemePreference(themePreference);
  }, [themePreference]);

  const setThemePreference = useCallback(async (nextPreference: ThemePreference) => {
    setThemePreferenceState(nextPreference);
    await saveThemePreference(nextPreference);
  }, []);

  return {
    isThemePreferenceLoading,
    setThemePreference,
    themePreference
  };
}