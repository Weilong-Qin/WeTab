import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_URL_VALIDATION_SCHEDULE_CONFIG,
  loadUrlValidationScheduleConfig,
  saveUrlValidationScheduleConfig,
  subscribeToUrlValidationScheduleChanges
} from "../services/urlValidationScheduleService";
import type { UrlValidationScheduleConfig } from "../types/settings";

export function useUrlValidationSchedule() {
  const [urlValidationSchedule, setUrlValidationScheduleState] = useState<UrlValidationScheduleConfig>(
    DEFAULT_URL_VALIDATION_SCHEDULE_CONFIG
  );
  const [isUrlValidationScheduleLoading, setIsUrlValidationScheduleLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    void loadUrlValidationScheduleConfig()
      .then((config) => {
        if (isMounted) {
          setUrlValidationScheduleState(config);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsUrlValidationScheduleLoading(false);
        }
      });

    const unsubscribe = subscribeToUrlValidationScheduleChanges((nextConfig) => {
      setUrlValidationScheduleState(nextConfig);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const setUrlValidationSchedule = useCallback(async (nextConfig: UrlValidationScheduleConfig) => {
    const savedConfig = await saveUrlValidationScheduleConfig(nextConfig);
    setUrlValidationScheduleState(savedConfig);
    return savedConfig;
  }, []);

  return {
    isUrlValidationScheduleLoading,
    setUrlValidationSchedule,
    urlValidationSchedule
  };
}