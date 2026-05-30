import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_LEETCODE_PROFILE_CONFIG,
  loadLeetCodeProfileConfig,
  saveLeetCodeProfileConfig,
  subscribeToLeetCodeProfileChanges
} from "../services/leetcodeProfileService";
import type { LeetCodeProfileConfig } from "../types/settings";

export function useLeetCodeProfile() {
  const [leetcodeProfile, setLeetCodeProfileState] = useState<LeetCodeProfileConfig>(
    DEFAULT_LEETCODE_PROFILE_CONFIG
  );
  const [isLeetCodeProfileLoading, setIsLeetCodeProfileLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    void loadLeetCodeProfileConfig()
      .then((config) => {
        if (isMounted) {
          setLeetCodeProfileState(config);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLeetCodeProfileLoading(false);
        }
      });

    const unsubscribe = subscribeToLeetCodeProfileChanges((nextConfig) => {
      setLeetCodeProfileState(nextConfig);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const setLeetCodeProfile = useCallback(async (nextConfig: LeetCodeProfileConfig) => {
    const savedConfig = await saveLeetCodeProfileConfig(nextConfig);
    setLeetCodeProfileState(savedConfig);
    return savedConfig;
  }, []);

  return {
    isLeetCodeProfileLoading,
    leetcodeProfile,
    setLeetCodeProfile
  };
}
