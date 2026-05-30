import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_LEETCODE_PROFILE_CONFIG,
  loadLeetCodeProfileConfig,
  normalizeLeetCodeProfileConfig,
  normalizeLeetCodeUsername,
  saveLeetCodeProfileConfig
} from "./leetcodeProfileService";

const storageMock = vi.hoisted(() => ({
  get: vi.fn<(key: string) => Promise<Record<string, unknown>>>(),
  set: vi.fn<(value: Record<string, unknown>) => Promise<void>>()
}));

vi.mock("wxt/browser", () => ({
  browser: {
    storage: {
      local: storageMock,
      onChanged: {
        addListener: vi.fn(),
        removeListener: vi.fn()
      }
    }
  }
}));

beforeEach(() => {
  storageMock.get.mockReset();
  storageMock.get.mockResolvedValue({});
  storageMock.set.mockReset();
  storageMock.set.mockResolvedValue();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("leetcodeProfileService", () => {
  it("normalizes username config without accepting invalid values", () => {
    expect(normalizeLeetCodeUsername(" @daily_user ")).toBe("daily_user");
    expect(normalizeLeetCodeUsername(123)).toBe("");
    expect(normalizeLeetCodeProfileConfig({ username: " alice " })).toEqual({ region: "com", username: "alice" });
    expect(normalizeLeetCodeProfileConfig(null)).toEqual(DEFAULT_LEETCODE_PROFILE_CONFIG);
  });

  it("loads and saves the normalized LeetCode username", async () => {
    storageMock.get.mockResolvedValue({
      "vtab.leetcodeProfile": { username: " alice " }
    });

    await expect(loadLeetCodeProfileConfig()).resolves.toEqual({ region: "com", username: "alice" });
    await expect(saveLeetCodeProfileConfig({ region: "com", username: " @bob " })).resolves.toEqual({ region: "com", username: "bob" });
    expect(storageMock.set).toHaveBeenCalledWith({
      "vtab.leetcodeProfile": { region: "com", username: "bob" }
    });
  });
});
