import { defineConfig } from "wxt";

const productionPackageEvents = new Set(["build", "zip"]);
const isProductionPackage = productionPackageEvents.has(process.env.npm_lifecycle_event ?? "");

export default defineConfig({
  manifestVersion: 3,
  modules: ["@wxt-dev/module-react"],
  manifest: {
    name: "WeTab",
    description: "A bookmark-powered browser homepage with a reusable Digital Air design system.",
    version: "1.0.0",
    permissions: ["alarms", "bookmarks", "favicon", "storage"],
    host_permissions: [
      // Daily Feed API endpoints (always needed)
      "https://leetcode.com/*",
      "https://leetcode.cn/*",
      "https://api.github.com/*",
      "https://hacker-news.firebaseio.com/*"
    ],
    optional_host_permissions: [
      // URL validation and user-configured LLM endpoints (requested on demand)
      "http://*/*",
      "https://*/*"
    ],
    chrome_url_overrides: {
      newtab: "newtab.html"
    },
    options_page: "options.html"
  },
  webExt: {
    disabled: true
  },
  filterEntrypoints: isProductionPackage ? ["background", "newtab", "options"] : undefined
});
