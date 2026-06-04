import { browser, type Browser } from "wxt/browser";
import {
  loadUrlValidationScheduleConfig,
  buildUrlValidationTargets
} from "../src/services/urlValidationScheduleService";
import { validateBookmarkUrls } from "../src/services/urlValidationService";
import type { UrlValidationScheduleConfig } from "../src/types/settings";

type BookmarkTreeNode = Browser.bookmarks.BookmarkTreeNode;

const ALARM_NAME = "vtab-url-validation";

// ---- Bookmark tree flattening ----

interface MinimalBookmark {
  folderIdPath: string[];
  id: string;
  url: string;
}

function flattenBookmarkTree(
  nodes: BookmarkTreeNode[],
  folderIdPath: string[] = []
): MinimalBookmark[] {
  const results: MinimalBookmark[] = [];

  for (const node of nodes) {
    if (node.url) {
      results.push({
        folderIdPath,
        id: node.id,
        url: node.url
      });
    }

    if (node.children) {
      const childPath = node.url ? folderIdPath : [...folderIdPath, node.id];
      results.push(...flattenBookmarkTree(node.children, childPath));
    }
  }

  return results;
}

// ---- Alarm management ----

function alarmPeriodInMinutes(config: UrlValidationScheduleConfig): number | undefined {
  if (!config.enabled) return undefined;
  return config.intervalMinutes;
}

async function syncAlarm(): Promise<void> {
  const config = await loadUrlValidationScheduleConfig();
  const periodInMinutes = alarmPeriodInMinutes(config);

  await browser.alarms.clear(ALARM_NAME);

  if (periodInMinutes) {
    await browser.alarms.create(ALARM_NAME, { periodInMinutes });
  }
}

// ---- Scheduled validation ----

async function runScheduledValidation(): Promise<void> {
  const config = await loadUrlValidationScheduleConfig();

  if (!config.enabled) return;

  const tree = await browser.bookmarks.getTree();
  const allBookmarks = flattenBookmarkTree(tree);
  const targets = buildUrlValidationTargets(
    allBookmarks as Parameters<typeof buildUrlValidationTargets>[0],
    config
  );

  if (targets.length === 0) return;

  await validateBookmarkUrls(targets);
}

// ---- Main ----

export default defineBackground(() => {
  // Set up alarm on install or browser startup
  browser.runtime.onInstalled.addListener(() => {
    void syncAlarm();
  });

  browser.runtime.onStartup.addListener(() => {
    void syncAlarm();
  });

  // Fire validation when alarm triggers
  browser.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === ALARM_NAME) {
      void runScheduledValidation();
    }
  });

  // Re-sync alarm when schedule config changes in storage
  browser.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === "local" && "vtab.urlValidationSchedule" in changes) {
      void syncAlarm();
    }
  });
});
