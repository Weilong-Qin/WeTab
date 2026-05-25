import { browser } from "wxt/browser";
import { createFolder, moveBookmarkNode } from "./bookmarkService";
import { loadLlmConfig, normalizeLlmConfig } from "./llmConfigService";
import type { BookmarkItem, FolderItem } from "../types/bookmarks";

const LLM_SUGGESTION_STORAGE_KEY = "vtab.llmSuggestions";
const DEFAULT_SUGGESTION_TIMEOUT_MS = 20000;

export interface LlmSuggestionBookmarkInput {
  domain: string;
  folderPath: string[];
  id: string;
  title: string;
  url: string;
}

export interface LlmSuggestionFolderInput {
  id: string;
  label: string;
}

export interface LlmSuggestionRequestScope {
  bookmarks: LlmSuggestionBookmarkInput[];
  folders: LlmSuggestionFolderInput[];
}

export interface LlmClassificationSuggestion {
  bookmarkId: string;
  confidence: number;
  id: string;
  newFolderName?: string;
  reason: string;
  status: "pending" | "applied" | "rejected";
  targetFolderId?: string;
}

export interface LlmSuggestionBatch {
  createdAt: number;
  id: string;
  suggestions: LlmClassificationSuggestion[];
}

interface RawSuggestion {
  bookmarkId?: unknown;
  confidence?: unknown;
  newFolderName?: unknown;
  reason?: unknown;
  targetFolderId?: unknown;
}

interface RawSuggestionResponse {
  suggestions?: unknown;
}

export function buildLlmSuggestionScope(
  bookmarks: BookmarkItem[],
  folders: FolderItem[]
): LlmSuggestionRequestScope {
  return {
    bookmarks: bookmarks.map((bookmark) => ({
      domain: bookmark.domain,
      folderPath: bookmark.folderPath,
      id: bookmark.id,
      title: bookmark.title,
      url: bookmark.url
    })),
    folders: flattenFolders(folders)
      .filter((folder) => folder.id !== "all")
      .map((folder) => ({
        id: folder.id,
        label: folder.label
      }))
  };
}

export async function requestLlmClassificationSuggestions(
  scope: LlmSuggestionRequestScope,
  timeoutMs = DEFAULT_SUGGESTION_TIMEOUT_MS
): Promise<LlmSuggestionBatch> {
  const config = normalizeLlmConfig(await loadLlmConfig());

  if (!config.apiKey || !config.model) {
    throw new Error("LLM provider is not configured.");
  }

  if (!scope.bookmarks.length) {
    throw new Error("No bookmarks selected for classification.");
  }

  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      body: JSON.stringify({
        messages: [
          {
            content:
              "You classify browser bookmarks. Return only JSON matching this shape: {\"suggestions\":[{\"bookmarkId\":\"...\",\"targetFolderId\":\"...\",\"newFolderName\":\"...\",\"confidence\":0.8,\"reason\":\"short reason\"}]}. Use either targetFolderId or newFolderName. Only suggest bookmarks from the input.",
            role: "system"
          },
          {
            content: JSON.stringify(scope),
            role: "user"
          }
        ],
        model: config.model,
        response_format: { type: "json_object" },
        temperature: 0.2
      }),
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json"
      },
      method: "POST",
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`LLM provider returned ${response.status}.`);
    }

    const payload = (await response.json()) as unknown;
    const content = extractChatCompletionContent(payload);
    const parsedContent = parseSuggestionContent(content);
    const batch = createSuggestionBatch(parsedContent, scope);
    await saveLlmSuggestionBatch(batch);
    return batch;
  } finally {
    globalThis.clearTimeout(timeout);
  }
}

export async function loadLlmSuggestionBatch(): Promise<LlmSuggestionBatch | null> {
  try {
    const result = await browser.storage.local.get(LLM_SUGGESTION_STORAGE_KEY);
    return normalizeSuggestionBatch(result[LLM_SUGGESTION_STORAGE_KEY]);
  } catch {
    return null;
  }
}

export async function saveLlmSuggestionBatch(batch: LlmSuggestionBatch | null): Promise<void> {
  await browser.storage.local.set({ [LLM_SUGGESTION_STORAGE_KEY]: batch });
}

export function updateSuggestionStatus(
  batch: LlmSuggestionBatch,
  suggestionId: string,
  status: LlmClassificationSuggestion["status"]
): LlmSuggestionBatch {
  return {
    ...batch,
    suggestions: batch.suggestions.map((suggestion) =>
      suggestion.id === suggestionId ? { ...suggestion, status } : suggestion
    )
  };
}

export async function applyLlmSuggestion(
  suggestion: LlmClassificationSuggestion,
  folders: FolderItem[]
): Promise<void> {
  if (suggestion.status !== "pending") {
    return;
  }

  let targetFolderId = suggestion.targetFolderId;

  if (!targetFolderId && suggestion.newFolderName) {
    const parentId = resolveDefaultSuggestionParentId(folders);
    const folder = await createFolder({
      parentId,
      title: suggestion.newFolderName
    });
    targetFolderId = folder.id;
  }

  if (!targetFolderId) {
    throw new Error("Suggestion has no target folder.");
  }

  await moveBookmarkNode({
    id: suggestion.bookmarkId,
    parentId: targetFolderId
  });
}

function createSuggestionBatch(
  rawResponse: RawSuggestionResponse,
  scope: LlmSuggestionRequestScope
): LlmSuggestionBatch {
  const rawSuggestions = Array.isArray(rawResponse.suggestions) ? rawResponse.suggestions : [];
  const bookmarkIds = new Set(scope.bookmarks.map((bookmark) => bookmark.id));
  const folderIds = new Set(scope.folders.map((folder) => folder.id));
  const suggestions = rawSuggestions
    .map((value, index) => normalizeSuggestion(value, index, bookmarkIds, folderIds))
    .filter((suggestion): suggestion is LlmClassificationSuggestion => Boolean(suggestion));

  return {
    createdAt: Date.now(),
    id: `llm-${Date.now()}`,
    suggestions
  };
}

function normalizeSuggestion(
  value: unknown,
  index: number,
  bookmarkIds: Set<string>,
  folderIds: Set<string>
): LlmClassificationSuggestion | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const rawSuggestion = value as RawSuggestion;
  const bookmarkId = normalizeText(rawSuggestion.bookmarkId);
  const targetFolderId = normalizeText(rawSuggestion.targetFolderId);
  const newFolderName = normalizeText(rawSuggestion.newFolderName);
  const reason = normalizeText(rawSuggestion.reason) || "Suggested by LLM.";
  const confidence = normalizeConfidence(rawSuggestion.confidence);

  if (!bookmarkIds.has(bookmarkId)) {
    return null;
  }

  if (targetFolderId && !folderIds.has(targetFolderId)) {
    return null;
  }

  if (!targetFolderId && !newFolderName) {
    return null;
  }

  return {
    bookmarkId,
    confidence,
    id: `suggestion-${bookmarkId}-${index}`,
    newFolderName: newFolderName || undefined,
    reason,
    status: "pending",
    targetFolderId: targetFolderId || undefined
  };
}

function extractChatCompletionContent(payload: unknown): string {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("LLM response was not valid JSON.");
  }

  const maybePayload = payload as {
    choices?: Array<{ message?: { content?: unknown } }>;
  };
  const content = maybePayload.choices?.[0]?.message?.content;

  if (typeof content !== "string") {
    throw new Error("LLM response did not include message content.");
  }

  return content;
}

function parseSuggestionContent(content: string): RawSuggestionResponse {
  const parsed = JSON.parse(content) as unknown;

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("LLM response content was not an object.");
  }

  return parsed as RawSuggestionResponse;
}

function normalizeSuggestionBatch(value: unknown): LlmSuggestionBatch | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const maybeBatch = value as Partial<LlmSuggestionBatch>;

  if (
    typeof maybeBatch.id !== "string" ||
    typeof maybeBatch.createdAt !== "number" ||
    !Array.isArray(maybeBatch.suggestions)
  ) {
    return null;
  }

  return {
    createdAt: maybeBatch.createdAt,
    id: maybeBatch.id,
    suggestions: maybeBatch.suggestions.filter(isStoredSuggestion)
  };
}

function isStoredSuggestion(value: unknown): value is LlmClassificationSuggestion {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const suggestion = value as Partial<LlmClassificationSuggestion>;
  return (
    typeof suggestion.id === "string" &&
    typeof suggestion.bookmarkId === "string" &&
    typeof suggestion.reason === "string" &&
    typeof suggestion.confidence === "number" &&
    (suggestion.status === "pending" || suggestion.status === "applied" || suggestion.status === "rejected")
  );
}

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeConfidence(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(parsed)) {
    return 0.5;
  }

  return Math.min(1, Math.max(0, parsed));
}

function resolveDefaultSuggestionParentId(folders: FolderItem[]): string | undefined {
  return flattenFolders(folders).find((folder) => folder.id !== "all")?.id;
}

function flattenFolders(folders: FolderItem[]): FolderItem[] {
  return folders.flatMap((folder) => [folder, ...flattenFolders(folder.children ?? [])]);
}
