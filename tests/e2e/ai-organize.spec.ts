import { expect, test } from "@playwright/test";
import { entrypointUrls } from "./support/entrypointUrls";

const EXTENSION_QUERY = "?e2e=1";

test("ai organize uses the configured DeepSeek-compatible provider", async ({ page }) => {
  await page.route("https://api.deepseek.com/models", async (route) => {
    await route.fulfill({
      headers: {
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "GET,HEAD,OPTIONS"
      },
      status: 204
    });
  });

  await page.route("https://api.deepseek.com/chat/completions", async (route) => {
    const requestBody = route.request().postDataJSON() as {
      model?: string;
      messages?: Array<{ content?: string }>;
    };

    const scope = JSON.parse(requestBody.messages?.[1]?.content ?? "{}");
    const bookmarkId = scope.bookmarks?.[0]?.id;
    const folderId = scope.folders?.find((folder: { id: string }) => folder.id !== "all")?.id;

    expect(requestBody.model).toBe("deepseek-v4-flash");
    expect(bookmarkId).toBeTruthy();

    await route.fulfill({
      body: JSON.stringify({
        choices: [
          {
            message: {
              content: JSON.stringify({
                suggestions: [
                  {
                    bookmarkId,
                    confidence: 0.92,
                    newFolderName: folderId ? undefined : "DeepSeek Review",
                    reason: "Place this bookmark in a review folder to keep the current view organized.",
                    targetFolderId: folderId
                  }
                ]
              })
            }
          }
        ]
      }),
      headers: {
        "access-control-allow-origin": "*",
        "content-type": "application/json"
      },
      status: 200
    });
  });

  await page.goto(`${entrypointUrls.options}${EXTENSION_QUERY}`);

  await page.getByLabel("Base URL").fill("https://api.deepseek.com");
  await page.getByLabel("API key").fill("sk-deepseek-test");
  await page.getByLabel("Model").fill("deepseek-v4-flash");

  await expect(page.getByText(/saved/i)).toBeVisible();
  await page.getByRole("button", { name: /test connection/i }).click();
  await expect(page.getByText(/connection test succeeded/i)).toBeVisible();

  await page.goto(`${entrypointUrls.newtab}${EXTENSION_QUERY}`);

  await page.getByRole("button", { name: "AI Organize" }).click();
  const scopeDialog = page.getByRole("dialog");
  await expect(scopeDialog).toBeVisible();
  await scopeDialog.getByLabel("Current view").check();
  await scopeDialog.getByRole("button", { name: "Generate suggestions" }).click();

  await expect(page.getByRole("heading", { name: "Review classification suggestions" })).toBeVisible();
  await expect(page.getByText("Place this bookmark in a review folder to keep the current view organized.")).toBeVisible();
  await expect(page.getByText(/suggestion ready for review/i)).toBeVisible();
});