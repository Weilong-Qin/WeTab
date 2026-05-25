import { browser } from "wxt/browser";

const DEFAULT_FAVICON_SIZE = 32;

export function buildBookmarkFaviconUrl(bookmarkUrl: string, size = DEFAULT_FAVICON_SIZE): string | undefined {
  try {
    const parsedUrl = new URL(bookmarkUrl);

    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      return undefined;
    }

    const newTabUrl = browser.runtime.getURL("/newtab.html");
    const extensionBaseUrl = newTabUrl.slice(0, newTabUrl.lastIndexOf("/"));
    const params = new URLSearchParams({
      pageUrl: parsedUrl.href,
      size: String(size)
    });

    return `${extensionBaseUrl}/_favicon/?${params.toString()}`;
  } catch {
    return undefined;
  }
}
