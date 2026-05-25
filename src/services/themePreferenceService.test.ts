import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_THEME_PREFERENCE,
  applyThemePreference,
  loadThemePreference,
  normalizeThemePreference,
  saveThemePreference
} from "./themePreferenceService";

const storageMock = vi.hoisted(() => ({
  get: vi.fn<() => Promise<Record<string, unknown>>>(),
  set: vi.fn<() => Promise<void>>()
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
  vi.stubGlobal("localStorage", {
    clear: vi.fn(),
    getItem: vi.fn((key: string) => fallbackStorage[key] ?? null),
    removeItem: vi.fn((key: string) => {
      delete fallbackStorage[key];
    }),
    setItem: vi.fn((key: string, value: string) => {
      fallbackStorage[key] = value;
    })
  });
  fallbackStorage = {};
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("themePreferenceService", () => {
  it("normalizes invalid values to the default theme preference", () => {
    expect(normalizeThemePreference("dark")).toBe("dark");
    expect(normalizeThemePreference("invalid")).toBe(DEFAULT_THEME_PREFERENCE);
  });

  it("loads and saves theme preference through extension storage with localStorage fallback", async () => {
    storageMock.get.mockResolvedValue({ "vtab.themePreference": "dark" });
    await expect(loadThemePreference()).resolves.toBe("dark");

    storageMock.get.mockRejectedValueOnce(new Error("storage unavailable"));
    globalThis.localStorage.setItem("vtab.themePreference", "light");
    await expect(loadThemePreference()).resolves.toBe("light");

    await expect(saveThemePreference("system")).resolves.toBe("system");
    expect(storageMock.set).toHaveBeenCalledWith({ "vtab.themePreference": "system" });
  });

  it("applies the theme preference to the document root", () => {
    const root = {
      dataset: {} as DOMStringMap,
      style: { colorScheme: "" }
    } as HTMLElement;

    applyThemePreference("dark", root);

    expect(root.dataset.theme).toBe("dark");
    expect(root.style.colorScheme).toBe("dark");
  });
});

let fallbackStorage: Record<string, string> = {};