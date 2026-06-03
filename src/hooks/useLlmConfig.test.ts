import { describe, expect, it } from "vitest";
import { getProviderStatusMessage, isHttpUrl } from "./useLlmConfig";

// ---------------------------------------------------------------------------
// isHttpUrl
// ---------------------------------------------------------------------------

describe("isHttpUrl", () => {
  it("accepts http URLs", () => {
    expect(isHttpUrl("http://example.com")).toBe(true);
  });

  it("accepts https URLs", () => {
    expect(isHttpUrl("https://api.openai.com/v1")).toBe(true);
  });

  it("rejects non-http protocols", () => {
    expect(isHttpUrl("ftp://example.com")).toBe(false);
  });

  it("rejects plain strings", () => {
    expect(isHttpUrl("not-a-url")).toBe(false);
  });

  it("rejects empty strings", () => {
    expect(isHttpUrl("")).toBe(false);
    expect(isHttpUrl("  ")).toBe(false);
  });

  it("trims whitespace before parsing", () => {
    expect(isHttpUrl("  https://example.com  ")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// getProviderStatusMessage
// ---------------------------------------------------------------------------

const baseMessages = {
  invalidBaseUrl: "Invalid URL",
  loading: "Loading…",
  saveError: "Save failed",
  saved: "Saved",
  saving: "Saving…",
  testError: "Connection failed",
  testSuccess: "Connection OK"
};

describe("getProviderStatusMessage", () => {
  it("returns loading message when isLoading", () => {
    expect(
      getProviderStatusMessage({
        isBaseUrlValid: true,
        isLoading: true,
        saveStatus: "idle",
        testStatus: "idle",
        messages: baseMessages
      })
    ).toBe("Loading…");
  });

  it("returns invalidBaseUrl when URL is invalid", () => {
    expect(
      getProviderStatusMessage({
        isBaseUrlValid: false,
        isLoading: false,
        saveStatus: "idle",
        testStatus: "idle",
        messages: baseMessages
      })
    ).toBe("Invalid URL");
  });

  it("returns test success message", () => {
    expect(
      getProviderStatusMessage({
        isBaseUrlValid: true,
        isLoading: false,
        saveStatus: "idle",
        testStatus: "success",
        messages: baseMessages
      })
    ).toBe("Connection OK");
  });

  it("returns test error message", () => {
    expect(
      getProviderStatusMessage({
        isBaseUrlValid: true,
        isLoading: false,
        saveStatus: "idle",
        testStatus: "error",
        messages: baseMessages
      })
    ).toBe("Connection failed");
  });

  it("returns saving message", () => {
    expect(
      getProviderStatusMessage({
        isBaseUrlValid: true,
        isLoading: false,
        saveStatus: "saving",
        testStatus: "idle",
        messages: baseMessages
      })
    ).toBe("Saving…");
  });

  it("returns saved message", () => {
    expect(
      getProviderStatusMessage({
        isBaseUrlValid: true,
        isLoading: false,
        saveStatus: "saved",
        testStatus: "idle",
        messages: baseMessages
      })
    ).toBe("Saved");
  });

  it("returns save error message", () => {
    expect(
      getProviderStatusMessage({
        isBaseUrlValid: true,
        isLoading: false,
        saveStatus: "error",
        testStatus: "idle",
        messages: baseMessages
      })
    ).toBe("Save failed");
  });

  it("returns empty string when idle", () => {
    expect(
      getProviderStatusMessage({
        isBaseUrlValid: true,
        isLoading: false,
        saveStatus: "idle",
        testStatus: "idle",
        messages: baseMessages
      })
    ).toBe("");
  });

  it("prioritizes test status over save status", () => {
    expect(
      getProviderStatusMessage({
        isBaseUrlValid: true,
        isLoading: false,
        saveStatus: "saving",
        testStatus: "success",
        messages: baseMessages
      })
    ).toBe("Connection OK");
  });
});
