import { defineConfig } from "wxt";

const isBuild = process.env.npm_lifecycle_event === "build";

export default defineConfig({
  manifestVersion: 3,
  modules: ["@wxt-dev/module-react"],
  manifest: {
    name: "vTab",
    description: "A bookmark-powered browser homepage with a reusable Digital Air design system.",
    version: "0.1.0",
    permissions: ["bookmarks", "favicon", "storage"],
    host_permissions: ["http://*/*", "https://*/*"],
    chrome_url_overrides: {
      newtab: "newtab.html"
    },
    options_page: "options.html"
  },
  webExt: {
    disabled: true
  },
  filterEntrypoints: isBuild ? ["newtab", "options"] : undefined
});
