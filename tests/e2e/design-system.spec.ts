import { expect, test } from "@playwright/test";
import { entrypointUrls } from "./support/entrypointUrls";

const EXTENSION_QUERY = "?e2e=1";

test("design system preview renders the shared component library", async ({ page }) => {
  const devUrl = process.env.E2E_DEV_URL;
  const target = devUrl ? `${devUrl}${EXTENSION_QUERY}` : `${entrypointUrls.designSystem}${EXTENSION_QUERY}`;
  await page.goto(target);

  await expect(page.getByRole("heading", { name: "Command Center Design System" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Color Tokens (OKLCH)" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Search and Navigation" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Cards and Empty State" })).toBeVisible();
  await expect(page.getByRole("link", { name: "OpenAI Platform" })).toBeVisible();
  await expect(page.getByText("Command Center Empty")).toBeVisible();
});
