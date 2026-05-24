import { useCallback, useEffect, useMemo, useState } from "react";
import { languageOptions, messages } from "../i18n/messages";
import {
  getBrowserLanguage,
  resolveLanguage,
  saveLanguage,
  subscribeToLanguageChanges
} from "../services/languageService";
import type { LanguageCode } from "../types/language";

export function useI18n() {
  const [language, setLanguageState] = useState<LanguageCode>(() => getBrowserLanguage());
  const [isLanguageLoading, setIsLanguageLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    void resolveLanguage()
      .then((resolvedLanguage) => {
        if (isMounted) {
          setLanguageState(resolvedLanguage);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLanguageLoading(false);
        }
      });

    const unsubscribe = subscribeToLanguageChanges((nextLanguage) => {
      setLanguageState(nextLanguage);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback(async (nextLanguage: LanguageCode) => {
    setLanguageState(nextLanguage);
    await saveLanguage(nextLanguage);
  }, []);

  const activeMessages = useMemo(() => messages[language], [language]);

  return {
    isLanguageLoading,
    language,
    languageOptions,
    messages: activeMessages,
    setLanguage
  };
}
