import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    exclude: ["**/node_modules/**", "**/dist/**", "**/.wxt/**", "**/.output/**", "tests/e2e/**"]
  }
});
