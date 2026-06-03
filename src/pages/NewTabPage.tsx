import { useEffect, useRef, useState } from "react";
import { AppShell } from "../components/AppShell";
import { BookmarkCard } from "../components/BookmarkCard";
import { BookmarkEditorModal } from "../components/BookmarkEditorModal";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { DailyFeed } from "../components/DailyFeed";
import { Button } from "../components/Button";
import { EmptyState } from "../components/EmptyState";
import { Icon } from "../components/Icon";
import { LlmScopeModal, type LlmScopeChoice } from "../components/LlmScopeModal";
import { Sidebar } from "../components/Sidebar";
import { TopSearch } from "../components/TopSearch";
import { SettingsModal } from "../components/SettingsModal";
import { useI18n } from "../hooks/useI18n";
import { useLeetCodeProfile } from "../hooks/useLeetCodeProfile";
import { useThemePreference } from "../hooks/useThemePreference";
import { useUrlValidationSchedule } from "../hooks/useUrlValidationSchedule";
import { useBookmarkData } from "../hooks/useBookmarkData";
import { useBookmarkEditor } from "../hooks/useBookmarkEditor";
import { useBookmarkSelection } from "../hooks/useBookmarkSelection";
import { useLlmSuggestions } from "../hooks/useLlmSuggestions";
import { useUrlValidation } from "../hooks/useUrlValidation";
import { useBookmarkContextMenu } from "../hooks/useBookmarkContextMenu";
import { runScheduledUrlValidation } from "../services/urlValidationScheduleService";
import {
  formatSuggestionTarget,
  getMarqueeStyle,
  getSidebarFolder,
  pruneNestedSelections,
  resolveSuggestionBookmarkTitle,
  resolveSuggestionCurrentFolderLabel
} from "../utils/organization";

export function NewTabPage() {
  const { messages } = useI18n();
  const { leetcodeProfile } = useLeetCodeProfile();
  useThemePreference();

  // ---- Bookmark data ----
  const data = useBookmarkData();
  const {
    folders,
    bookmarks,
    selectedFolderId,
    setSelectedFolderId,
    query,
    setQuery,
    isLoading,
    isMutating,
    errorMessage,
    undoAction,
    setUndoAction,
    flatFolders,
    visibleBookmarks,
    currentBreadcrumb,
    refreshBookmarks,
    withMutation,
    submitEditor,
    removeBookmark,
    removeFolder,
    bulkDelete,
    moveItems,
    copyItems,
    undo
  } = data;

  // ---- Editor ----
  const editor = useBookmarkEditor();
  const {
    editorState,
    editorValues,
    setEditorValues,
    editorError,
    clearEditorError,
    editorLabels,
    openCreateBookmark,
    openCreateFolder,
    openEditBookmark,
    openEditFolder,
    closeEditor,
    resetEditor
  } = editor;

  // ---- Selection ----
  const selection = useBookmarkSelection({
    bookmarks,
    folders,
    flatFolders,
    visibleBookmarks,
    editorState,
    isSettingsOpen: false,
    contextMenu: null
  });
  const {
    selectedItemKeys,
    selectionModeRegion,
    moveTargetFolderId,
    setMoveTargetFolderId,
    marqueeSelection,
    sidebarSelectionRef,
    contentSelectionRef,
    selectedItems,
    hasSelectedItems,
    isBookmarkSelectionMode,
    isFolderSelectionMode,
    selectedBookmarks,
    clearSelection,
    toggleSelectionMode,
    handleSelectBookmark,
    handleSelectFolder,
    handleSelectionPointerDown,
    handleBookmarkDragStart,
    handleFolderDragStart,
    handleDropOnFolder: readDropOnFolder,
    handleDropBeforeBookmark: readDropBeforeBookmark,
    handleDropBeforeFolder: readDropBeforeFolder
  } = selection;

  // ---- LLM Suggestions ----
  const llm = useLlmSuggestions();
  const {
    suggestionBatch,
    suggestionMessage,
    isRequestingSuggestions,
    isLlmScopeModalOpen,
    setIsLlmScopeModalOpen,
    pendingSuggestions,
    openLlmScopeModal,
    requestSuggestions,
    persistBatch,
    rejectSuggestion,
    applySuggestion,
    applyAllSuggestions,
    dismissSuggestionMessage
  } = llm;

  // ---- URL validation ----
  const urlValidation = useUrlValidation();
  const {
    validationMessage,
    isValidatingUrls,
    dismissValidationMessage,
    validateVisible
  } = urlValidation;

  // ---- Context menu ----
  const ctxMenu = useBookmarkContextMenu();
  const {
    contextMenu,
    closeContextMenu,
    handleBookmarkContextMenu,
    handleFolderContextMenu,
    getTargetFolders
  } = ctxMenu;

  // ---- Settings ----
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // ---- Search ----
  // query/setQuery come from data hook

  // ---- Derived ----
  const contextMenuTargetFolders = getTargetFolders(folders);
  const defaultLlmScope: LlmScopeChoice = selectedBookmarks.length ? "selected" : "visible";

  const {
    isUrlValidationScheduleLoading,
    urlValidationSchedule
  } = useUrlValidationSchedule();
  const {
    enabled: isUrlValidationScheduleEnabled,
    intervalMinutes: urlValidationScheduleIntervalMinutes,
    scope: urlValidationScheduleScope,
    targetFolderId: urlValidationScheduleTargetFolderId
  } = urlValidationSchedule;

  // ---- Thin handlers wiring hooks together ----

  async function handleEditorSubmit() {
    if (!editorState) return;
    clearEditorError();
    const result = await withMutation(async () => {
      await submitEditor(editorState.intent, editorValues, editorState.bookmark, editorState.folder);
      resetEditor();
    });
  }

  function handleDeleteBookmark(bookmark: Parameters<typeof removeBookmark>[0]) {
    void removeBookmark(bookmark, messages.newTab.deleteBookmarkConfirm(bookmark.title));
  }

  function handleDeleteFolder(folder: Parameters<typeof removeFolder>[0]) {
    void removeFolder(folder, messages.newTab.deleteFolderConfirm(folder.label));
  }

  async function handleBulkDelete() {
    const pruned = pruneNestedSelections(selectedItems, folders);
    if (!pruned.length) return;
    await bulkDelete(selectedItems, messages.newTab.deleteSelectedConfirm(pruned.length));
    clearSelection();
  }

  async function handleMoveSelectedToFolder() {
    if (!moveTargetFolderId || !selectedItems.length) return;
    await moveItems(selectedItems, moveTargetFolderId);
    clearSelection();
  }

  async function handleCopySelectedToFolder() {
    if (!moveTargetFolderId || !selectedItems.length) return;
    await copyItems(selectedItems, moveTargetFolderId);
    clearSelection();
  }

  function handleContextMenuEdit() {
    if (!contextMenu) return;
    if (contextMenu.item.type === "folder") {
      const folder = getSidebarFolder(folders, contextMenu.item.id);
      if (folder) openEditFolder(folder);
    } else {
      const bookmark = bookmarks.find((b) => b.id === contextMenu.item.id);
      if (bookmark) openEditBookmark(bookmark);
    }
    closeContextMenu();
  }

  function handleContextMenuDelete() {
    if (!contextMenu) return;
    if (contextMenu.item.type === "folder") {
      const folder = flatFolders.find((f) => f.id === contextMenu.item.id);
      if (folder) handleDeleteFolder(folder);
    } else {
      const bookmark = bookmarks.find((b) => b.id === contextMenu.item.id);
      if (bookmark) handleDeleteBookmark(bookmark);
    }
    closeContextMenu();
  }

  function handleContextMenuMove(targetFolderId: string) {
    if (!contextMenu) return;
    void moveItems([contextMenu.item], targetFolderId);
    closeContextMenu();
  }

  function handleContextMenuCopy(targetFolderId: string) {
    if (!contextMenu) return;
    void copyItems([contextMenu.item], targetFolderId);
    closeContextMenu();
  }

  function handleDropOnFolder(folder: Parameters<typeof readDropOnFolder>[0], event: Parameters<typeof readDropOnFolder>[1]) {
    const items = readDropOnFolder(folder, event);
    if (items) void moveItems(items, folder.id);
  }

  function handleDropBeforeBookmark(bookmark: Parameters<typeof readDropBeforeBookmark>[0], event: Parameters<typeof readDropBeforeBookmark>[1]) {
    const result = readDropBeforeBookmark(bookmark, event);
    if (result) void moveItems(result.items, result.parentId, result.index);
  }

  function handleDropBeforeFolder(folder: Parameters<typeof readDropBeforeFolder>[0], event: Parameters<typeof readDropBeforeFolder>[1]) {
    const result = readDropBeforeFolder(folder, event);
    if (result) void moveItems(result.items, result.parentId, result.index);
  }

  function handleOpenLlmScopeModal() {
    openLlmScopeModal(selectedBookmarks, visibleBookmarks);
  }

  async function handleRequestSuggestions(scope: LlmScopeChoice) {
    await withMutation(async () => {
      await requestSuggestions(scope, selectedBookmarks, visibleBookmarks, folders);
    });
  }

  async function handleApplySuggestion(suggestion: Parameters<typeof applySuggestion>[0]) {
    await withMutation(async () => {
      await applySuggestion(suggestion, folders, refreshBookmarks);
    });
  }

  async function handleApplyAllSuggestions() {
    await withMutation(async () => {
      await applyAllSuggestions(folders, refreshBookmarks);
    });
  }

  async function handleValidateVisibleBookmarks() {
    await validateVisible(visibleBookmarks, refreshBookmarks);
  }

  // ---- Scheduled URL validation ----
  const bookmarksRef = useRef(bookmarks);
  useEffect(() => { bookmarksRef.current = bookmarks; }, [bookmarks]);
  const isScheduledValidationRunningRef = useRef(false);

  useEffect(() => {
    if (!isUrlValidationScheduleEnabled || isUrlValidationScheduleLoading || isLoading) return;

    let isMounted = true;

    async function runValidation() {
      if (isScheduledValidationRunningRef.current) return;
      try {
        isScheduledValidationRunningRef.current = true;
        const validatedCount = await runScheduledUrlValidation(bookmarksRef.current, {
          enabled: isUrlValidationScheduleEnabled,
          intervalMinutes: urlValidationScheduleIntervalMinutes,
          scope: urlValidationScheduleScope,
          targetFolderId: urlValidationScheduleTargetFolderId
        });
        if (isMounted && validatedCount > 0) await refreshBookmarks();
      } catch {
        return;
      } finally {
        isScheduledValidationRunningRef.current = false;
      }
    }

    void runValidation();
    const intervalId = globalThis.setInterval(() => void runValidation(), urlValidationScheduleIntervalMinutes * 60_000);

    return () => {
      isMounted = false;
      globalThis.clearInterval(intervalId);
    };
  }, [
    isLoading,
    isUrlValidationScheduleEnabled,
    isUrlValidationScheduleLoading,
    refreshBookmarks,
    urlValidationScheduleIntervalMinutes,
    urlValidationScheduleScope,
    urlValidationScheduleTargetFolderId
  ]);

  // ---- JSX ----

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
          actionDisabled={isRequestingSuggestions || (!selectedBookmarks.length && !visibleBookmarks.length)}
          actionLabel={isRequestingSuggestions ? messages.newTab.llm.loading : messages.newTab.sidebar.actionLabel}
          actionLabels={messages.newTab.folderActions}
          actionTitle={messages.newTab.sidebar.actionTitle}
          brandSubtitle={messages.newTab.sidebar.brandSubtitle}
          brandTitle="WeTab"
          collapseFolderLabel={messages.newTab.sidebar.collapseFolder}
          expandFolderLabel={messages.newTab.sidebar.expandFolder}
          folderSectionLabel={messages.newTab.sidebar.folderSectionLabel}
          folders={folders}
          navLabel={messages.newTab.sidebar.navLabel}
          onAction={handleOpenLlmScopeModal}
          onDeleteFolder={handleDeleteFolder}
          onDragFolderStart={handleFolderDragStart}
          onDropBeforeFolder={handleDropBeforeFolder}
          onDropOnFolder={handleDropOnFolder}
          onEditFolder={openEditFolder}
          onFolderContextMenu={handleFolderContextMenu}
          onSelectFolder={setSelectedFolderId}
          onSelectFolderItem={handleSelectFolder}
          onSelectionPointerDown={(event) => handleSelectionPointerDown("folders", event)}
          selectionContainerRef={sidebarSelectionRef}
          selectedItemKeys={selectedItemKeys}
          selectedFolderId={selectedFolderId}
          selectionMode={isFolderSelectionMode}
          onOpenSettings={() => setIsSettingsOpen(true)}
          settingsLabel={messages.settings.openButton}
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
      <DailyFeed key={leetcodeProfile.username} labels={messages.newTab.dailyFeed} />
      <section
        className="content-section"
        onPointerDown={(event) => handleSelectionPointerDown("bookmarks", event)}
        ref={contentSelectionRef}
      >
        <Breadcrumbs
          items={currentBreadcrumb}
          label={messages.newTab.breadcrumbLabel}
          onSelect={setSelectedFolderId}
        />
        <div className="section-title-row">
          <div>
            <h2>{query ? messages.newTab.gridSearchTitle : messages.newTab.gridFolderTitle}</h2>
          </div>
          <div className="section-title-row__actions">
            <Button icon="check" onClick={toggleSelectionMode} variant={isBookmarkSelectionMode ? "primary" : "glass"}>
              {isBookmarkSelectionMode ? messages.newTab.selection.done : messages.newTab.selection.select}
            </Button>
            <Button
              disabled={isValidatingUrls || !visibleBookmarks.length}
              icon="shield"
              onClick={handleValidateVisibleBookmarks}
              variant="glass"
            >
              {isValidatingUrls ? messages.newTab.urlValidation.checking : messages.newTab.urlValidation.check}
            </Button>
            <Button icon="folderAdd" onClick={openCreateFolder} variant="glass">
              {messages.newTab.addFolder}
            </Button>
          </div>
        </div>
        {selectionModeRegion || hasSelectedItems ? (
          <div className="bulk-toolbar">
            <span>{messages.newTab.selection.selectedCount(selectedItems.length)}</span>
            <select
              aria-label={messages.newTab.selection.moveTo}
              disabled={!hasSelectedItems || isMutating}
              onChange={(event) => setMoveTargetFolderId(event.target.value)}
              value={moveTargetFolderId}
            >
              <option value="">{messages.newTab.selection.chooseFolder}</option>
              {flatFolders.map((folder) => (
                <option key={folder.id} value={folder.id}>
                  {folder.label}
                </option>
              ))}
            </select>
            <Button disabled={!hasSelectedItems || !moveTargetFolderId || isMutating} icon="folderOpen" onClick={handleMoveSelectedToFolder} variant="glass">
              {messages.newTab.selection.moveTo}
            </Button>
            <Button disabled={!hasSelectedItems || !moveTargetFolderId || isMutating} icon="copy" onClick={handleCopySelectedToFolder} variant="glass">
              {messages.newTab.selection.copyTo}
            </Button>
            <Button disabled={!hasSelectedItems || isMutating} icon="trash" onClick={handleBulkDelete} variant="glass">
              {messages.newTab.selection.delete}
            </Button>
            <Button disabled={!hasSelectedItems || isMutating} onClick={clearSelection} variant="subtle">
              {messages.newTab.selection.clear}
            </Button>
          </div>
        ) : null}
        {suggestionBatch ? (
          <section className="llm-review-panel" aria-label={messages.newTab.llm.reviewTitle}>
            <div className="llm-review-panel__heading">
              <div>
                <p className="eyebrow">{messages.newTab.llm.eyebrow}</p>
                <h3>{messages.newTab.llm.reviewTitle}</h3>
              </div>
              <div className="llm-review-panel__actions">
                <Button disabled={!pendingSuggestions.length || isMutating} icon="check" onClick={handleApplyAllSuggestions} variant="primary">
                  {messages.newTab.llm.applyAll}
                </Button>
                <Button disabled={isMutating} onClick={() => void persistBatch(null)} variant="subtle">
                  {messages.newTab.llm.clear}
                </Button>
              </div>
            </div>
            <div className="llm-suggestion-list">
              {suggestionBatch.suggestions.map((suggestion) => (
                <article className="llm-suggestion" key={suggestion.id}>
                  <div>
                    <h4>{resolveSuggestionBookmarkTitle(suggestion, bookmarks)}</h4>
                    <p className="llm-suggestion__folders">
                      <strong>当前：</strong>
                      {resolveSuggestionCurrentFolderLabel(suggestion, folders, bookmarks) || "(未分类)"}
                      {' '}
                      <strong>→ 建议：</strong>
                      {formatSuggestionTarget(suggestion, folders, messages.newTab.llm.newFolderPrefix)}
                    </p>
                    <p>{suggestion.reason}</p>
                  </div>
                  <div className="llm-suggestion__meta">
                    <span>{messages.newTab.llm.confidence(Math.round(suggestion.confidence * 100))}</span>
                    <span>{messages.newTab.llm.status[suggestion.status]}</span>
                  </div>
                  {suggestion.status === "pending" ? (
                    <div className="llm-suggestion__actions">
                      <Button disabled={isMutating} icon="check" onClick={() => void handleApplySuggestion(suggestion)} variant="glass">
                        {messages.newTab.llm.apply}
                      </Button>
                      <Button disabled={isMutating} icon="x" onClick={() => void rejectSuggestion(suggestion.id)} variant="subtle">
                        {messages.newTab.llm.reject}
                      </Button>
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          </section>
        ) : null}

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
                isSelected={selectedItemKeys.has(`bookmark:${bookmark.id}`)}
                key={bookmark.id}
                onContextMenu={handleBookmarkContextMenu}
                onDelete={handleDeleteBookmark}
                onDragStart={handleBookmarkDragStart}
                onDropBefore={handleDropBeforeBookmark}
                onEdit={openEditBookmark}
                onSelect={handleSelectBookmark}
                selectionMode={isBookmarkSelectionMode}
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
          isSaving={isMutating}
          labels={editorLabels}
          mode={editorState.intent === "create-folder" || editorState.intent === "edit-folder" ? "folder" : "bookmark"}
          onChange={setEditorValues}
          onClose={() => closeEditor(isMutating)}
          onSubmit={handleEditorSubmit}
          values={editorValues}
        />
      ) : null}
      {isSettingsOpen ? (
        <SettingsModal folders={folders} onClose={() => setIsSettingsOpen(false)} />
      ) : null}
      {isLlmScopeModalOpen ? (
        <LlmScopeModal
          defaultScope={defaultLlmScope}
          isSubmitting={isRequestingSuggestions}
          labels={{
            ...messages.newTab.llm.scope,
            currentViewDescription: messages.newTab.llm.scope.currentViewDescription(visibleBookmarks.length),
            selectedDescription: messages.newTab.llm.scope.selectedDescription(selectedBookmarks.length)
          }}
          onClose={() => setIsLlmScopeModalOpen(false)}
          onSubmit={(scope) => void handleRequestSuggestions(scope)}
          selectedCount={selectedBookmarks.length}
          visibleCount={visibleBookmarks.length}
        />
      ) : null}
      {marqueeSelection ? (
        <div className="selection-marquee" style={getMarqueeStyle(marqueeSelection)} />
      ) : null}
      {validationMessage || suggestionMessage || undoAction ? (
        <div aria-live="polite" className="feedback-toast-stack">
          {validationMessage ? (
            <article className="feedback-toast" role="status">
              <div className="feedback-toast__message">
                <Icon name="shield" size={18} />
                <span>{validationMessage}</span>
              </div>
              <Button
                aria-label={messages.newTab.feedback.close}
                className="feedback-toast__close"
                icon="x"
                onClick={dismissValidationMessage}
                variant="icon"
              />
            </article>
          ) : null}
          {suggestionMessage ? (
            <article className="feedback-toast" role="status">
              <div className="feedback-toast__message">
                <Icon name="sparkles" size={18} />
                <span>{suggestionMessage}</span>
              </div>
              <Button
                aria-label={messages.newTab.feedback.close}
                className="feedback-toast__close"
                icon="x"
                onClick={dismissSuggestionMessage}
                variant="icon"
              />
            </article>
          ) : null}
          {undoAction ? (
            <article className="feedback-toast feedback-toast--undo" role="status">
              <div className="feedback-toast__message">
                <Icon name="refresh" size={18} />
                <span>{undoAction.label}</span>
              </div>
              <div className="feedback-toast__actions">
                <Button disabled={isMutating} icon="refresh" onClick={undo} variant="glass">
                  {messages.newTab.undo.action}
                </Button>
                <Button
                  aria-label={messages.newTab.feedback.close}
                  className="feedback-toast__close"
                  icon="x"
                  onClick={() => setUndoAction(null)}
                  variant="icon"
                />
              </div>
            </article>
          ) : null}
        </div>
      ) : null}
      {contextMenu ? (
        <div
          className="context-menu"
          role="menu"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onContextMenu={(event) => { event.preventDefault(); event.stopPropagation(); }}
          onClick={(event) => event.stopPropagation()}
          onWheel={(event) => event.stopPropagation()}
        >
          <div className="context-menu__label">{contextMenu.label}</div>
          <button disabled={isMutating} onClick={handleContextMenuEdit} role="menuitem" type="button">
            <Icon name="pencil" size={15} />
            <span>{contextMenu.item.type === "folder" ? messages.newTab.contextMenu.renameFolder : messages.newTab.contextMenu.renameBookmark}</span>
          </button>
          <button disabled={isMutating} onClick={handleContextMenuDelete} role="menuitem" type="button">
            <Icon name="trash" size={15} />
            <span>{messages.newTab.contextMenu.delete}</span>
          </button>
          <div className="context-menu__submenu">
            <button className="context-menu__submenu-trigger" disabled={isMutating} role="menuitem" type="button">
              <Icon name="folderOpen" size={15} />
              <span>{messages.newTab.contextMenu.moveTo}</span>
              <Icon className="context-menu__submenu-icon" name="chevronRight" size={14} />
            </button>
            <div className="context-menu__submenu-panel" role="menu">
              {contextMenuTargetFolders.map((folder) => (
                <button
                  disabled={isMutating}
                  key={`move-${folder.id}`}
                  onClick={() => handleContextMenuMove(folder.id)}
                  role="menuitem"
                  type="button"
                >
                  <Icon name="folderOpen" size={15} />
                  <span>{folder.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="context-menu__submenu">
            <button className="context-menu__submenu-trigger" disabled={isMutating} role="menuitem" type="button">
              <Icon name="copy" size={15} />
              <span>{messages.newTab.contextMenu.copyTo}</span>
              <Icon className="context-menu__submenu-icon" name="chevronRight" size={14} />
            </button>
            <div className="context-menu__submenu-panel" role="menu">
              {contextMenuTargetFolders.map((folder) => (
                <button
                  disabled={isMutating}
                  key={`copy-${folder.id}`}
                  onClick={() => handleContextMenuCopy(folder.id)}
                  role="menuitem"
                  type="button"
                >
                  <Icon name="copy" size={15} />
                  <span>{folder.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}


