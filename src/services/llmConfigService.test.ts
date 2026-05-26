import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_LLM_CONFIG,
  loadLlmConfig,
  normalizeLlmConfig,
  saveLlmConfig,
  testLlmConnection
} from "./llmConfigService";

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

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  vi.useRealTimers();
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
  storageMock.get.mockReset();
  storageMock.get.mockResolvedValue({});
  storageMock.set.mockReset();
  storageMock.set.mockResolvedValue();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("llmConfigService", () => {
  it("normalizes text fields, trailing slashes, and invalid persisted values", () => {
    expect(
      normalizeLlmConfig({
        baseUrl: " https://provider.test/v1/// ",
        apiKey: " sk-test ",
        model: " gpt-test "
      })
    ).toEqual({
      baseUrl: "https://provider.test/v1",
      apiKey: "sk-test",
      model: "gpt-test"
    });

    expect(
      normalizeLlmConfig({
        baseUrl: "chrome://bookmarks",
        apiKey: 123,
        model: ""
      })
    ).toEqual(DEFAULT_LLM_CONFIG);
  });

  it("loads saved settings from extension storage with safe defaults", async () => {
    storageMock.get.mockResolvedValue({
      "vtab.llmConfig": {
        baseUrl: " https://provider.test/v1/ ",
        apiKey: " key ",
        model: " model "
      }
    });

    await expect(loadLlmConfig()).resolves.toEqual({
      baseUrl: "https://provider.test/v1",
      apiKey: "key",
      model: "model"
    });

    storageMock.get.mockRejectedValueOnce(new Error("storage unavailable"));
    await expect(loadLlmConfig()).resolves.toEqual(DEFAULT_LLM_CONFIG);
  });

  it("persists normalized settings to local extension storage", async () => {
    await expect(
      saveLlmConfig({
        baseUrl: " https://provider.test/v1/ ",
        apiKey: " key ",
        model: " model "
      })
    ).resolves.toEqual({
      baseUrl: "https://provider.test/v1",
      apiKey: "key",
      model: "model"
    });

    expect(storageMock.set).toHaveBeenCalledWith({
      "vtab.llmConfig": {
        baseUrl: "https://provider.test/v1",
        apiKey: "key",
        model: "model"
      }
    });
  });

  it("waits for an in-flight save before loading settings", async () => {
    let resolveSave: () => void = () => undefined;
    const savePromise = new Promise<void>((resolve) => {
      resolveSave = resolve;
    });
    storageMock.set.mockReturnValueOnce(savePromise);
    storageMock.get.mockResolvedValueOnce({
      "vtab.llmConfig": {
        baseUrl: "https://fresh.test/v1",
        apiKey: "fresh-key",
        model: "fresh-model"
      }
    });

    const pendingSave = saveLlmConfig({
      baseUrl: "https://fresh.test/v1",
      apiKey: "fresh-key",
      model: "fresh-model"
    });
    const pendingLoad = loadLlmConfig();

    expect(storageMock.get).not.toHaveBeenCalled();

    resolveSave();

    await expect(pendingSave).resolves.toEqual({
      baseUrl: "https://fresh.test/v1",
      apiKey: "fresh-key",
      model: "fresh-model"
    });
    await expect(pendingLoad).resolves.toEqual({
      baseUrl: "https://fresh.test/v1",
      apiKey: "fresh-key",
      model: "fresh-model"
    });
    expect(storageMock.get).toHaveBeenCalledWith("vtab.llmConfig");
  });

  it("tests provider connectivity through the models endpoint with only the API key", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    await expect(
      testLlmConnection({
        baseUrl: "https://provider.test/v1/",
        apiKey: "key",
        model: "gpt-test"
      })
    ).resolves.toEqual({
      ok: true,
      status: 204
    });

    expect(fetchMock).toHaveBeenCalledWith("https://provider.test/v1/models", {
      headers: {
        Authorization: "Bearer key"
      },
      method: "GET",
      signal: expect.any(AbortSignal) as AbortSignal
    });
    expect(fetchMock).not.toHaveBeenCalledWith(expect.stringContaining("bookmark"), expect.anything());
  });

  it("does not test when required credentials are missing and reports fetch failures", async () => {
    await expect(
      testLlmConnection({
        baseUrl: "https://provider.test/v1",
        apiKey: "",
        model: "gpt-test"
      })
    ).resolves.toEqual({ ok: false });
    expect(fetchMock).not.toHaveBeenCalled();

    fetchMock.mockRejectedValueOnce(new TypeError("Network error"));
    await expect(
      testLlmConnection({
        baseUrl: "https://provider.test/v1",
        apiKey: "key",
        model: "gpt-test"
      })
    ).resolves.toEqual({ ok: false });
  });
});
