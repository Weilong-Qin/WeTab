import { useEffect, useMemo, useState } from "react";
import { AppShell } from "../components/AppShell";
import { BookmarkCard } from "../components/BookmarkCard";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { Button } from "../components/Button";
import { EmptyState } from "../components/EmptyState";
import { Sidebar } from "../components/Sidebar";
import { Tag } from "../components/Tag";
import { TopSearch } from "../components/TopSearch";
import { useI18n } from "../hooks/useI18n";
import {
  filterBookmarks,
  findFolderPath,
  hasFolder,
  loadBookmarkView,
  subscribeToBookmarkChanges
} from "../services/bookmarkService";
import type { BookmarkItem, FolderItem } from "../types/bookmarks";

export function NewTabPage() {
  const { messages } = useI18n();
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState("all");
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function refreshBookmarks() {
      try {
        const view = await loadBookmarkView(messages.bookmarkView);

        if (!isMounted) {
          return;
        }

        setFolders(view.folders);
        setBookmarks(view.bookmarks);
        setSelectedFolderId((currentFolderId) =>
          currentFolderId === "all" || hasFolder(view.folders, currentFolderId)
            ? currentFolderId
            : "all"
        );
        setErrorMessage(null);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setErrorMessage(error instanceof Error ? error.message : messages.bookmarkView.bookmarkAccessUnavailable);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void refreshBookmarks();
    const unsubscribe = subscribeToBookmarkChanges(() => void refreshBookmarks());

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [messages.bookmarkView]);

  const visibleBookmarks = useMemo(
    () => filterBookmarks(bookmarks, query, selectedFolderId),
    [bookmarks, query, selectedFolderId]
  );
  const currentBreadcrumb = useMemo(
    () => findFolderPath(folders, selectedFolderId),
    [folders, selectedFolderId]
  );

  return (
    <AppShell
      closeNavigationLabel={messages.appShell.closeNavigation}
      fab={
        <Button disabled icon="bookmarkAdd" title={messages.newTab.addBookmarkTitle} variant="fab">
          {messages.newTab.addBookmark}
        </Button>
      }
      openNavigationLabel={messages.appShell.openNavigation}
      resizeSidebarLabel={messages.appShell.resizeSidebar}
      sidebar={
        <Sidebar
          actionLabel={messages.newTab.sidebar.actionLabel}
          brandSubtitle={messages.newTab.sidebar.brandSubtitle}
          brandTitle="vTab"
          collapseFolderLabel={messages.newTab.sidebar.collapseFolder}
          expandFolderLabel={messages.newTab.sidebar.expandFolder}
          folderSectionLabel={messages.newTab.sidebar.folderSectionLabel}
          folders={folders}
          navLabel={messages.newTab.sidebar.navLabel}
          onSelectFolder={setSelectedFolderId}
          profileSubtitle={messages.newTab.sidebar.profileSubtitle}
          profileTitle={messages.newTab.sidebar.profileTitle}
          selectedFolderId={selectedFolderId}
          statusLabel={
            errorMessage
              ? messages.newTab.sidebar.statusAccessNeeded
              : messages.newTab.sidebar.statusLive
          }
        />
      }
      topSearch={
        <TopSearch
          ariaLabel={messages.newTab.searchAriaLabel}
          onChange={setQuery}
          placeholder={messages.newTab.searchPlaceholder}
          value={query}
        />
      }
    >
      <section className="dashboard-head">
        <div>
          <Tag tone="blue">{messages.newTab.heroTag}</Tag>
          <h2>{messages.newTab.heroTitle}</h2>
          <p>{messages.newTab.heroDescription}</p>
        </div>
        <div className="dashboard-head__stats" aria-label={messages.newTab.bookmarkSummary}>
          <strong>{bookmarks.length}</strong>
          <span>{isLoading ? messages.newTab.loadingLinks : messages.newTab.nativeLinks}</span>
        </div>
      </section>

      <section className="content-section">
        <Breadcrumbs
          items={currentBreadcrumb}
          label={messages.newTab.breadcrumbLabel}
          onSelect={setSelectedFolderId}
        />
        <div className="section-title-row">
          <div>
            <p className="eyebrow">{messages.newTab.gridEyebrow}</p>
            <h2>{query ? messages.newTab.gridSearchTitle : messages.newTab.gridFolderTitle}</h2>
          </div>
          <Button icon="sliders" variant="glass">
            {messages.newTab.folderPaths}
          </Button>
        </div>

        {errorMessage ? (
          <EmptyState
            actionLabel={messages.newTab.reload}
            description={errorMessage}
            icon="refresh"
            onAction={() => window.location.reload()}
            title={messages.newTab.accessErrorTitle}
          />
        ) : isLoading ? (
          <EmptyState
            description={messages.newTab.loadingDescription}
            hideAction
            title={messages.newTab.loadingTitle}
          />
        ) : visibleBookmarks.length ? (
          <div className="bookmark-grid">
            {visibleBookmarks.map((bookmark) => (
              <BookmarkCard bookmark={bookmark} key={bookmark.id} />
            ))}
          </div>
        ) : (
          <EmptyState
            description={
              bookmarks.length
                ? messages.newTab.noMatchesDescription
                : messages.newTab.noBookmarksDescription
            }
            hideAction
            title={bookmarks.length ? messages.newTab.noMatchesTitle : messages.newTab.noBookmarksTitle}
          />
        )}
      </section>
    </AppShell>
  );
}
