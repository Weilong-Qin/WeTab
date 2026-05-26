import { expect, test } from "@playwright/test";
import { entrypointUrls } from "./support/entrypointUrls";

const EXTENSION_QUERY = "?e2e=1";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.confirm = () => true;
  });
});

test("new tab covers navigation, search, settings, and transient link validation", async ({ page }) => {
  await page.route("https://tailwindcss.com/**", async (route) => {
    await route.fulfill({
      body: "",
      headers: {
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "GET,HEAD,OPTIONS"
      },
      status: 200
    });
  });

  await page.goto(`${entrypointUrls.newtab}${EXTENSION_QUERY}`);

  await expect(page.getByRole("heading", { name: "WeTab" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Open settings" })).toBeVisible();
  await expect(page.getByRole("searchbox", { name: /search bookmarks/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: "OpenAI Platform" })).toBeVisible();
  await expect(page.getByRole("button", { name: /expand design/i })).toHaveCount(0);

  await page.getByRole("button", { name: "Open settings" }).click();
  const settingsDialog = page.getByRole("dialog");
  await expect(settingsDialog).toBeVisible();
  await expect(settingsDialog.getByLabel("Language")).toBeVisible();
  await expect(settingsDialog.getByLabel("Appearance mode")).toBeVisible();
  await settingsDialog.getByRole("button", { name: /close/i }).click();
  await expect(settingsDialog).toBeHidden();

  const search = page.getByRole("searchbox", { name: /search bookmarks/i });
  await search.fill("Tailwind");
  await expect(page.getByRole("heading", { name: "Tailwind Docs" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "OpenAI Platform" })).toHaveCount(0);

  await page.getByRole("button", { name: /check links/i }).click();
  await expect(page.getByText(/checked 1 visible bookmark/i)).toBeVisible();
  await expect(page.getByText(/checked 1 visible bookmark/i)).toBeHidden({ timeout: 6_000 });
});

test("new tab supports creating, editing, deleting, and dragging items", async ({ page }) => {
  await page.goto(`${entrypointUrls.newtab}${EXTENSION_QUERY}`);

  await page.getByRole("button", { name: "Add Folder" }).click();
  const folderDialog = page.getByRole("dialog");
  await folderDialog.getByLabel("Folder name").fill("Research");
  await folderDialog.getByRole("button", { name: /create folder/i }).click();
  await expect(page.getByRole("button", { name: "Research" })).toBeVisible();

  await page.getByRole("button", { name: "Add Bookmark" }).click();
  const bookmarkDialog = page.getByRole("dialog");
  await bookmarkDialog.getByLabel("Bookmark title").fill("Spec Site");
  await bookmarkDialog.getByLabel("URL").fill("https://spec.example.com");
  await bookmarkDialog.getByRole("button", { name: /create bookmark/i }).click();
  await expect(page.getByRole("heading", { name: "Spec Site" })).toBeVisible();

  await page.getByRole("heading", { name: "Spec Site" }).click({ button: "right" });
  await page.getByRole("menuitem", { name: /rename bookmark/i }).click();
  const editBookmarkDialog = page.getByRole("dialog");
  await editBookmarkDialog.getByLabel("Bookmark title").fill("Spec Site Updated");
  await editBookmarkDialog.getByRole("button", { name: /save/i }).click();
  await expect(page.getByRole("heading", { name: "Spec Site Updated" })).toBeVisible();

  await page.getByRole("button", { name: "Research" }).click({ button: "right" });
  await page.getByRole("menuitem", { name: /rename folder/i }).click();
  const editFolderDialog = page.getByRole("dialog");
  await editFolderDialog.getByLabel("Folder name").fill("Research Area");
  await editFolderDialog.getByRole("button", { name: /save/i }).click();
  await expect(page.getByRole("button", { name: "Research Area" })).toBeVisible();

  await page.getByRole("heading", { name: "Spec Site Updated" }).click({ button: "right" });
  await page.getByRole("menuitem", { name: /delete/i }).click();
  await expect(page.getByRole("heading", { name: "Spec Site Updated" })).toHaveCount(0);

  const workFolder = page.locator('[data-selection-key="folder:3"]');
  const developmentFolder = page.locator('[data-selection-key="folder:6"]');
  await workFolder.dragTo(developmentFolder);

  await page.waitForTimeout(250);
  await expect(page.getByRole("button", { name: "Work" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Research Area" })).toBeVisible();
});
