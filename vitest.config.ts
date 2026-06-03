import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    exclude: ["**/node_modules/**", "**/dist/**", "**/.wxt/**", "**/.output/**", "tests/e2e/**"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.test.{ts,tsx}",
        "src/testing/**",
        "src/data/**",
        "src/types/**"
      ],
      reporter: ["text", "text-summary"]
    }
  }
});
