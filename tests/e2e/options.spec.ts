import { expect, test } from "@playwright/test";
import { entrypointUrls } from "./support/entrypointUrls";

const EXTENSION_QUERY = "?e2e=1";

test("options page updates language and theme preferences", async ({ page }) => {
  await page.goto(`${entrypointUrls.options}${EXTENSION_QUERY}`);

  await expect(page.getByRole("heading", { name: "LLM configuration" })).toBeVisible();
  await page.getByLabel("Display language").selectOption("zh-CN");
  await expect(page.getByRole("heading", { name: "LLM 配置" })).toBeVisible();
  await expect(page.getByRole("button", { name: "测试连接" })).toBeVisible();
  await expect(page.getByLabel("显示语言")).toBeVisible();
});

test("options page saves provider settings and tests the connection", async ({ page }) => {
  await page.route("https://provider.test/v1/models", async (route) => {
    await route.fulfill({
      headers: {
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "GET,HEAD,OPTIONS"
      },
      status: 204
    });
  });

  await page.goto(`${entrypointUrls.options}${EXTENSION_QUERY}`);

  await page.getByLabel("Base URL").fill("https://provider.test/v1/");
  await page.getByLabel("API key").fill("sk-test");
  await page.getByLabel("Model").fill("gpt-test");

  await expect(page.getByText(/saved/i)).toBeVisible();
  await page.getByRole("button", { name: /test connection/i }).click();
  await expect(page.getByText(/connection test succeeded/i)).toBeVisible();
});
