import { z } from "zod";

// ---------------------------------------------------------------------------
// LLM Config
// ---------------------------------------------------------------------------

export const LlmConfigSchema = z.object({
  baseUrl: z.string().trim(),
  apiKey: z.string().trim(),
  model: z.string().trim()
});

/** Partial schema for parsing untrusted storage data — missing fields get defaults. */
export const LlmConfigPartialSchema = z.object({
  baseUrl: z.string().trim().optional(),
  apiKey: z.string().trim().optional(),
  model: z.string().trim().optional()
});

export type LlmConfigInput = z.input<typeof LlmConfigSchema>;

// ---------------------------------------------------------------------------
// Theme
// ---------------------------------------------------------------------------

export const ThemePreferenceSchema = z.enum(["light", "dark", "system"]);

// ---------------------------------------------------------------------------
// LeetCode Profile
// ---------------------------------------------------------------------------

export const LeetCodeRegionSchema = z.enum(["com", "cn"]);

/** Lenient schema: each field falls back to defaults when missing/invalid. */
export const LeetCodeProfileLenientSchema = z
  .object({
    region: LeetCodeRegionSchema.catch("com"),
    username: z
      .string()
      .trim()
      .max(64)
      .transform((v) => v.replace(/^@+/, ""))
      .catch("")
  })
  .catch({ region: "com" as const, username: "" });

// ---------------------------------------------------------------------------
// URL Validation Schedule
// ---------------------------------------------------------------------------

export const UrlValidationScheduleIntervalSchema = z.union([
  z.literal(15),
  z.literal(60),
  z.literal(360),
  z.literal(1440)
]);

export const UrlValidationScheduleScopeSchema = z.enum(["all", "folder"]);

/** Lenient schema: each field falls back to defaults when missing/invalid. */
export const UrlValidationScheduleLenientSchema = z
  .object({
    enabled: z.boolean().catch(false),
    intervalMinutes: UrlValidationScheduleIntervalSchema.catch(60),
    scope: UrlValidationScheduleScopeSchema.catch("all"),
    targetFolderId: z.string().min(1).optional().catch(undefined)
  })
  .catch({ enabled: false, intervalMinutes: 60 as const, scope: "all" as const });

// ---------------------------------------------------------------------------
// Safe parse helper
// ---------------------------------------------------------------------------

/**
 * Parse an unknown value with a zod schema, returning the default value on failure.
 * This is the standard pattern for reading untrusted browser storage data.
 */
export function safeParseOrDefault<T>(
  schema: z.ZodType<T>,
  value: unknown,
  defaultValue: T
): T {
  const result = schema.safeParse(value);
  return result.success ? (result.data as T) : defaultValue;
}
