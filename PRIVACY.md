# Privacy Policy for WeTab

**Last updated:** June 3, 2026

WeTab is a browser extension that replaces the default new-tab page with a bookmark-powered navigation workspace. This privacy policy explains what data WeTab collects, how it is used, and what choices you have.

---

## Summary

- **WeTab does not collect, transmit, or share any personal data with its developer.**
- All settings and data are stored **locally** on your device via the browser's built-in storage API.
- Network requests are made **only** to services you explicitly interact with (bookmark URL validation, Daily Feed APIs, and a user-configured LLM provider).
- No analytics, telemetry, or tracking scripts are included.

---

## Data Stored Locally

WeTab uses `chrome.storage.local` to persist the following data **on your device only**:

| Data | Purpose |
|---|---|
| **Browser bookmarks** (read/write) | Display and manage your native Chrome bookmarks on the new-tab page. Bookmarks are accessed via the `chrome.bookmarks` API and are never transmitted to any external server by WeTab. |
| **Theme preference** (light/dark/system) | Remember your visual theme choice across sessions. |
| **Language preference** (en/zh-CN) | Remember your UI language choice across sessions. |
| **LLM provider configuration** (base URL, API key, model name) | Store your self-configured OpenAI-compatible API settings. The API key is stored in plain text in local browser storage — it is never sent anywhere except the API endpoint you specify. |
| **URL validation records** (status + timestamp per bookmark) | Cache the results of bookmark link health checks so they persist across sessions. |
| **URL validation schedule** (enabled, interval, scope) | Remember your automatic link-checking schedule settings. |
| **LeetCode profile** (region, username) | Display your LeetCode activity on the Daily Feed panel. Only the public username you enter is stored. |
| **Daily Feed cache** (fetched feed items, 1-hour TTL) | Cache GitHub Trending, HackerNews, and LeetCode feed data to reduce redundant network requests. |
| **LLM suggestion batches** (classification results) | Store AI-generated bookmark organization suggestions until you review and apply or dismiss them. |

None of the above data leaves your device unless you trigger one of the network features described below.

---

## Network Requests

WeTab makes network requests **only** in the following scenarios:

### 1. Bookmark URL Validation (User-Initiated or Scheduled)
- **What:** Sends HTTP `HEAD` (and fallback `GET`) requests to bookmark URLs to check if they are still reachable.
- **Where:** Directly to the bookmark URLs in your collection.
- **When:** When you manually click the "validate links" button, or if you enable the scheduled validation feature (runs via a background alarm at your chosen interval: 15 min / 1 h / 6 h / 24 h).
- **Data sent:** Only the bookmark URL itself (no other bookmark metadata or personal data).

### 2. Daily Feed (Automatic, Cached)
- **GitHub Trending:** Fetches public repository data from `https://api.github.com/search/repositories`. No authentication required. No personal data sent.
- **HackerNews Top Stories:** Fetches public story data from `https://hacker-news.firebaseio.com`. No authentication required. No personal data sent.
- **LeetCode Daily Challenge:** Fetches the public daily coding challenge from `https://leetcode.com/graphql/` or `https://leetcode.cn/graphql/`. No personal data sent beyond the LeetCode username you configure (for activity tracking).

### 3. LLM-Powered Suggestions (Explicitly User-Initiated)
- **What:** Sends bookmark titles, URLs, domains, and folder paths to an OpenAI-compatible API endpoint that **you configure** (e.g., OpenAI, Ollama, LM Studio).
- **Where:** The API endpoint you specify in the extension's Options/Settings page.
- **When:** Only when you explicitly click the "Suggest" button. **No data is sent automatically.**
- **Data sent:** Bookmark titles, URLs, domains, folder paths, and folder names for the selected bookmarks. Your API key is included in the request header for authentication.
- **Third-party policy:** Data handling is governed by the privacy policy of the LLM provider you choose. WeTab does not operate or endorse any specific LLM provider.

---

## Permissions

WeTab requests the following Chrome extension permissions:

| Permission | Reason |
|---|---|
| `bookmarks` | Read and write your native browser bookmarks for display and management on the new-tab page. |
| `favicon` | Retrieve website favicon images to display on bookmark cards. |
| `storage` | Persist extension settings and cached data locally on your device. |
| `alarms` | Run scheduled URL validation in the background at user-configured intervals. |

### Host Permissions

| Pattern | Reason |
|---|---|
| `https://leetcode.com/*` | Fetch LeetCode daily challenge and user activity. |
| `https://leetcode.cn/*` | Fetch LeetCode CN daily challenge and user activity. |
| `https://api.github.com/*` | Fetch GitHub trending repositories for the Daily Feed. |
| `https://hacker-news.firebaseio.com/*` | Fetch HackerNews top stories for the Daily Feed. |

### Optional Host Permissions

| Pattern | Reason |
|---|---|
| `http://*/*` and `https://*/*` | Requested on demand for: (1) validating that bookmark URLs are still reachable, and (2) connecting to user-configured LLM API endpoints. These permissions are not required until you use these features. |

---

## Data Sharing

WeTab **does not** share, sell, or transmit any user data to the extension developer or any third party, except:

- **LLM Provider:** When you explicitly request AI suggestions, bookmark data is sent to the API endpoint you configured. This is governed by that provider's privacy policy.
- **Public APIs:** Daily Feed features query public APIs (GitHub, HackerNews, LeetCode) that have their own privacy policies.

---

## Data Security

- All data is stored locally using the browser's `chrome.storage.local` API, which is sandboxed per-extension.
- API keys for LLM providers are stored in local storage. While the browser's storage is sandboxed, it is not encrypted at rest — treat your API key as you would any locally-stored credential.
- WeTab does not include any analytics, tracking pixels, or third-party scripts.

---

## Your Rights

- **Access your data:** All data WeTab stores can be viewed in Chrome DevTools → Application → Storage → Extension Storage.
- **Delete your data:** Uninstalling the extension automatically removes all locally stored data. You can also clear specific settings from the extension's Options page.
- **Disable features:** URL validation scheduling, Daily Feed, and LLM suggestions are all optional and can be disabled at any time.

---

## Changes to This Policy

If this privacy policy is updated, the changes will be reflected in the extension's GitHub repository and the Chrome Web Store listing. Continued use of the extension after an update constitutes acceptance of the revised policy.

---

## Contact

For questions or concerns about this privacy policy, please open an issue on the [WeTab GitHub repository](https://github.com/weilong/vtab/issues).
