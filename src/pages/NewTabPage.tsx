import { useCallback, useEffect, useMemo, useState } from "react";
import { AppShell } from "../components/AppShell";
import { BookmarkCard } from "../components/BookmarkCard";
import { BookmarkEditorModal, type BookmarkEditorValues } from "../components/BookmarkEditorModal";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { Button } from "../components/Button";
import { EmptyState } from "../components/EmptyState";
import { Sidebar } from "../components/Sidebar";
import { Tag } from "../components/Tag";
import { TopSearch } from "../components/TopSearch";
import { useI18n } from "../hooks/useI18n";
import {
  createBookmark,
  createFolder,
  deleteBookmark,
  filterBookmarks,
  findFolderPath,
  hasFolder,
  loadBookmarkView,
  resolveWritableParentFolderId,
  subscribeToBookmarkChanges,
  updateBookmark
} from "../services/bookmarkService";
import type { BookmarkItem, FolderItem } from "../types/bookmarks";

type EditorIntent = "create-bookmark" | "create-folder" | "edit-bookmark";

interface EditorState {
  intent: EditorIntent;
  bookmark?: BookmarkItem;
}

const EMPTY_EDITOR_VALUES: BookmarkEditorValues = {
  title: "",
  url: ""
};

export function NewTabPage() {
  const { messages } = useI18n();
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState("all");
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [editorError, setEditorError] = useState<string | null>(null);
  const [editorState, setEditorState] = useState<EditorState | null>(null);
  const [editorValues, setEditorValues] = useState<BookmarkEditorValues>(EMPTY_EDITOR_VALUES);

  const applyBookmarkView = useCallback((view: Awaited<ReturnType<typeof loadBookmarkView>>) => {
    setFolders(view.folders);
    setBookmarks(view.bookmarks);
    setSelectedFolderId((currentFolderId) =>
      currentFolderId === "all" || hasFolder(view.folders, currentFolderId)
        ? currentFolderId
        : "all"
    );
    setErrorMessage(null);
  }, []);

  const refreshBookmarks = useCallback(async () => {
    const view = await loadBookmarkView(messages.bookmarkView);
    applyBookmarkView(view);
  }, [applyBookmarkView, messages.bookmarkView]);

  useEffect(() => {
    let isMounted = true;

    async function refreshBookmarks() {
      try {
        const view = await loadBookmarkView(messages.bookmarkView);

        if (!isMounted) {
          return;
        }

        applyBookmarkView(view);
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
  }, [applyBookmarkView, messages.bookmarkView]);

  const visibleBookmarks = useMemo(
    () => filterBookmarks(bookmarks, query, selectedFolderId),
    [bookmarks, query, selectedFolderId]
  );
  const currentBreadcrumb = useMemo(
    () => findFolderPath(folders, selectedFolderId),
    [folders, selectedFolderId]
  );
  const editorLabels = useMemo(() => {
    if (editorState?.intent === "create-folder") {
      return messages.newTab.editor.createFolder;
    }

    if (editorState?.intent === "edit-bookmark") {
      return messages.newTab.editor.editBookmark;
    }

    return messages.newTab.editor.createBookmark;
  }, [editorState?.intent, messages.newTab.editor]);

  function openCreateBookmark() {
    setEditorState({ intent: "create-bookmark" });
    setEditorValues(EMPTY_EDITOR_VALUES);
    setEditorError(null);
  }

  function openCreateFolder() {
    setEditorState({ intent: "create-folder" });
    setEditorValues(EMPTY_EDITOR_VALUES);
    setEditorError(null);
  }

  function openEditBookmark(bookmark: BookmarkItem) {
    setEditorState({ intent: "edit-bookmark", bookmark });
    setEditorValues({ title: bookmark.title, url: bookmark.url });
    setEditorError(null);
  }

  function closeEditor() {
    if (isSaving) {
      return;
    }

    setEditorState(null);
    setEditorValues(EMPTY_EDITOR_VALUES);
    setEditorError(null);
  }

  async function handleEditorSubmit() {
    if (!editorState) {
      return;
    }

    const parentId = resolveWritableParentFolderId(folders, selectedFolderId);

    try {
      setIsSaving(true);
      setEditorError(null);

      if (editorState.intent === "create-folder") {
        await createFolder({
          parentId,
          title: editorValues.title
        });
      } else if (editorState.intent === "edit-bookmark" && editorState.bookmark) {
        await updateBookmark({
          id: editorState.bookmark.id,
          title: editorValues.title,
          url: editorValues.url
        });
      } else {
        await createBookmark({
          parentId,
          title: editorValues.title,
          url: editorValues.url
        });
      }

      await refreshBookmarks();
      setEditorState(null);
      setEditorValues(EMPTY_EDITOR_VALUES);
    } catch (error) {
      setEditorError(error instanceof Error ? error.message : messages.newTab.editor.saveError);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteBookmark(bookmark: BookmarkItem) {
    if (!window.confirm(messages.newTab.deleteBookmarkConfirm(bookmark.title))) {
      return;
    }

    try {
      setIsSaving(true);
      await deleteBookmark(bookmark.id);
      await refreshBookmarks();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : messages.newTab.editor.saveError);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AppShell
      closeNavigationLabel={messages.appShell.closeNavigation}
      fab={
        <Button icon="bookmarkAdd" onClick={openCreateBookmark} title={messages.newTab.addBookmarkTitle} variant="fab">
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
          <div className="section-title-row__actions">
            <Button icon="sliders" variant="glass">
              {messages.newTab.folderPaths}
            </Button>
            <Button icon="folderAdd" onClick={openCreateFolder} variant="glass">
              {messages.newTab.addFolder}
            </Button>
          </div>
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
              <BookmarkCard
                actionLabels={messages.newTab.bookmarkActions}
                bookmark={bookmark}
                key={bookmark.id}
                onDelete={handleDeleteBookmark}
                onEdit={openEditBookmark}
              />
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
      {editorState ? (
        <BookmarkEditorModal
          errorMessage={editorError}
          isSaving={isSaving}
          labels={editorLabels}
          mode={editorState.intent === "create-folder" ? "folder" : "bookmark"}
          onChange={setEditorValues}
          onClose={closeEditor}
          onSubmit={handleEditorSubmit}
          values={editorValues}
        />
      ) : null}
    </AppShell>
  );
}
