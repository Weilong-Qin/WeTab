import { describe, expect, it, vi } from "vitest";
import { buildBookmarkFaviconUrl } from "./faviconService";

vi.mock("wxt/browser", () => ({
  browser: {
    runtime: {
      getURL: (path: string) => `chrome-extension://vtab${path}`
    }
  }
}));

describe("faviconService", () => {
  it("builds a Chromium favicon API URL for http and https bookmarks", () => {
    expect(buildBookmarkFaviconUrl("https://example.com/path?q=1")).toBe(
      "chrome-extension://vtab/_favicon/?pageUrl=https%3A%2F%2Fexample.com%2Fpath%3Fq%3D1&size=32"
    );
    expect(buildBookmarkFaviconUrl("http://example.com", 16)).toBe(
      "chrome-extension://vtab/_favicon/?pageUrl=http%3A%2F%2Fexample.com%2F&size=16"
    );
  });

  it("skips unsupported or invalid bookmark URLs", () => {
    expect(buildBookmarkFaviconUrl("chrome://extensions")).toBeUndefined();
    expect(buildBookmarkFaviconUrl("not a url")).toBeUndefined();
  });
});
