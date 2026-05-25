import { Button } from "./Button";
import { Icon } from "./Icon";
import { useEffect, useRef, useState, type DragEvent, type MouseEvent } from "react";
import type { FolderItem } from "../types/bookmarks";
import { cx } from "../utils/classNames";

export interface SidebarProps {
  folders: FolderItem[];
  selectedFolderId: string;
  onSelectFolder: (id: string) => void;
  brandTitle?: string;
  brandSubtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionLabels?: {
    delete: string;
    edit: string;
    select: string;
  };
  collapseFolderLabel?: (label: string) => string;
  expandFolderLabel?: (label: string) => string;
  folderSectionLabel?: string;
  navLabel?: string;
  onDeleteFolder?: (folder: FolderItem) => void;
  onDragFolderStart?: (folder: FolderItem, event: DragEvent<HTMLElement>) => void;
  onDropBeforeFolder?: (folder: FolderItem, event: DragEvent<HTMLElement>) => void;
  onDropOnFolder?: (folder: FolderItem, event: DragEvent<HTMLElement>) => void;
  onEditFolder?: (folder: FolderItem) => void;
  statusLabel?: string;
  onSelectFolderItem?: (folder: FolderItem, event: MouseEvent<HTMLElement>) => void;
  profileTitle?: string;
  profileSubtitle?: string;
  selectedItemKeys?: Set<string>;
  selectionMode?: boolean;
  onOpenSettings?: () => void;
  settingsLabel?: string;
}

export function Sidebar({
  folders,
  selectedFolderId,
  onSelectFolder,
  brandTitle = "Digital Air",
  brandSubtitle = "Workspace",
  actionLabel = "AI Organize",
  actionLabels,
  onAction,
  collapseFolderLabel = (label) => `Collapse ${label}`,
  expandFolderLabel = (label) => `Expand ${label}`,
  folderSectionLabel = "Folders",
  navLabel = "Bookmark folders",
  onDeleteFolder,
  onDragFolderStart,
  onDropBeforeFolder,
  onDropOnFolder,
  onEditFolder,
  onSelectFolderItem,
  statusLabel = "Sync Status: Live",
  profileTitle = "Personal Library",
  profileSubtitle = "Digital Air Space",
  selectedItemKeys = new Set(),
  selectionMode = false,
  onOpenSettings,
  settingsLabel = "Open settings"
}: SidebarProps) {
  const [expandedFolderIds, setExpandedFolderIds] = useState<Set<string>>(() => new Set());
  const initializedExpansionRef = useRef(false);
  const rootFolder = folders[0];
  const nestedFolders = folders.slice(1);

  useEffect(() => {
    if (initializedExpansionRef.current || !folders.length) {
      return;
    }

    initializedExpansionRef.current = true;
    setExpandedFolderIds(new Set(collectInitiallyExpandedFolderIds(folders)));
  }, [folders]);

  function toggleFolder(folderId: string) {
    setExpandedFolderIds((currentIds) => {
      const nextIds = new Set(currentIds);

      if (nextIds.has(folderId)) {
        nextIds.delete(folderId);
      } else {
        nextIds.add(folderId);
      }

      return nextIds;
    });
  }

  return (
    <div className="sidebar">
      <div className="sidebar__brand">
        <div className="sidebar__brand-mark">
          <Icon name="air" size={19} />
        </div>
        <div>
          <h1>{brandTitle}</h1>
          <p>{brandSubtitle}</p>
        </div>
      </div>

      <nav className="sidebar__nav" aria-label={navLabel}>
        <Button className="sidebar__ai-button" icon="sparkles" onClick={onAction} variant="primary">
          {actionLabel}
        </Button>

        {rootFolder ? (
          <SidebarItem
            folder={rootFolder}
            collapseFolderLabel={collapseFolderLabel}
            expandedFolderIds={expandedFolderIds}
            expandFolderLabel={expandFolderLabel}
            isExpanded={expandedFolderIds.has(rootFolder.id)}
            isActive={selectedFolderId === rootFolder.id}
            isSelected={selectedItemKeys.has(`folder:${rootFolder.id}`)}
            selectedItemKeys={selectedItemKeys}
            actionLabels={actionLabels}
            onDeleteFolder={onDeleteFolder}
            onDragFolderStart={onDragFolderStart}
            onDropBeforeFolder={onDropBeforeFolder}
            onDropOnFolder={onDropOnFolder}
            onEditFolder={onEditFolder}
            onSelect={onSelectFolder}
            onSelectFolderItem={onSelectFolderItem}
            onToggle={toggleFolder}
            selectedFolderId={selectedFolderId}
            selectionMode={selectionMode}
          />
        ) : null}

        <div className="sidebar__section-label">{folderSectionLabel}</div>
        <div className="sidebar__folder-list">
          {nestedFolders.map((folder) => (
            <SidebarItem
              folder={folder}
              collapseFolderLabel={collapseFolderLabel}
              expandedFolderIds={expandedFolderIds}
              expandFolderLabel={expandFolderLabel}
              isExpanded={expandedFolderIds.has(folder.id)}
              isActive={selectedFolderId === folder.id}
              isSelected={selectedItemKeys.has(`folder:${folder.id}`)}
              selectedItemKeys={selectedItemKeys}
              actionLabels={actionLabels}
              key={folder.id}
              onDeleteFolder={onDeleteFolder}
              onDragFolderStart={onDragFolderStart}
              onDropBeforeFolder={onDropBeforeFolder}
              onDropOnFolder={onDropOnFolder}
              onEditFolder={onEditFolder}
              onSelect={onSelectFolder}
              onSelectFolderItem={onSelectFolderItem}
              onToggle={toggleFolder}
              selectedFolderId={selectedFolderId}
              selectionMode={selectionMode}
            />
          ))}
        </div>
      </nav>

      <footer className="sidebar__footer">
        <div className="sidebar__sync">
          <span className="sidebar__sync-dot" />
          <span>{statusLabel}</span>
          <Icon name="refresh" size={16} />
        </div>
        <div className="sidebar__footer-row">
          <div className="sidebar__profile">
            <div className="sidebar__avatar">PL</div>
            <div>
              <strong>{profileTitle}</strong>
              <span>{profileSubtitle}</span>
            </div>
          </div>
          {onOpenSettings ? (
            <Button aria-label={settingsLabel} icon="settings" onClick={onOpenSettings} variant="icon" />
          ) : null}
        </div>
      </footer>
    </div>
  );
}

interface SidebarItemProps {
  folder: FolderItem;
  collapseFolderLabel: (label: string) => string;
  expandedFolderIds: Set<string>;
  expandFolderLabel: (label: string) => string;
  isExpanded: boolean;
  isActive: boolean;
  isSelected: boolean;
  selectedItemKeys: Set<string>;
  actionLabels?: {
    delete: string;
    edit: string;
    select: string;
  };
  onDeleteFolder?: (folder: FolderItem) => void;
  onDragFolderStart?: (folder: FolderItem, event: DragEvent<HTMLElement>) => void;
  onDropBeforeFolder?: (folder: FolderItem, event: DragEvent<HTMLElement>) => void;
  onDropOnFolder?: (folder: FolderItem, event: DragEvent<HTMLElement>) => void;
  onEditFolder?: (folder: FolderItem) => void;
  onSelect: (id: string) => void;
  onSelectFolderItem?: (folder: FolderItem, event: MouseEvent<HTMLElement>) => void;
  onToggle: (id: string) => void;
  selectedFolderId: string;
  selectionMode: boolean;
}

function SidebarItem({
  folder,
  collapseFolderLabel,
  expandedFolderIds,
  expandFolderLabel,
  isExpanded,
  isActive,
  isSelected,
  selectedItemKeys,
  actionLabels,
  onDeleteFolder,
  onDragFolderStart,
  onDropBeforeFolder,
  onDropOnFolder,
  onEditFolder,
  onSelect,
  onSelectFolderItem,
  onToggle,
  selectedFolderId,
  selectionMode
}: SidebarItemProps) {
  const hasChildren = Boolean(folder.children?.length);
  const isSyntheticRoot = folder.id === "all";

  function handleSelectClick(event: MouseEvent<HTMLElement>) {
    if (!selectionMode && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
      if (hasChildren && !isExpanded) {
        onToggle(folder.id);
      }

      onSelect(folder.id);
      return;
    }

    event.preventDefault();
    onSelectFolderItem?.(folder, event);
  }

  return (
    <div className="sidebar-item-wrap">
      <div
        className={cx("sidebar-item", isActive && "sidebar-item--active", isSelected && "sidebar-item--selected")}
        draggable={!isSyntheticRoot && Boolean(onDragFolderStart)}
        onDragOver={(event) => {
          if (!isSyntheticRoot && (onDropBeforeFolder || onDropOnFolder)) {
            event.preventDefault();
          }
        }}
        onDragStart={(event) => {
          if (!isSyntheticRoot) {
            onDragFolderStart?.(folder, event);
          }
        }}
        onDrop={(event) => {
          if (!isSyntheticRoot) {
            onDropOnFolder?.(folder, event);
          }
        }}
      >
        {selectionMode && !isSyntheticRoot ? (
          <label className="sidebar-item__checkbox">
            <input aria-label={actionLabels?.select} checked={isSelected} readOnly type="checkbox" />
          </label>
        ) : null}
        {hasChildren ? (
          <button
            aria-expanded={isExpanded}
            aria-label={
              isExpanded ? collapseFolderLabel(folder.label) : expandFolderLabel(folder.label)
            }
            className="sidebar-item__toggle"
            onClick={() => onToggle(folder.id)}
            type="button"
          >
            <Icon name={isExpanded ? "chevronDown" : "chevronRight"} size={16} />
          </button>
        ) : folder.id === "all" ? (
          <span className="sidebar-item__toggle-placeholder" />
        ) : (
          <span className="sidebar-item__toggle-placeholder">
            <Icon name="chevronRight" size={16} />
          </span>
        )}
        <button
          aria-current={isActive ? "page" : undefined}
          className="sidebar-item__select"
          onClick={handleSelectClick}
          type="button"
        >
          <Icon name={folder.icon} size={19} />
          <span>{folder.label}</span>
        </button>
        <span className="sidebar-item__count">{folder.count}</span>
        {!isSyntheticRoot && (onEditFolder || onDeleteFolder) ? (
          <span className="sidebar-item__actions">
            {onDropBeforeFolder ? (
              <span
                className="sidebar-item__drop-before"
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => onDropBeforeFolder(folder, event)}
              />
            ) : null}
            {onEditFolder ? (
              <Button
                aria-label={actionLabels?.edit}
                icon="pencil"
                onClick={() => onEditFolder(folder)}
                title={actionLabels?.edit}
                variant="icon"
              />
            ) : null}
            {onDeleteFolder ? (
              <Button
                aria-label={actionLabels?.delete}
                icon="trash"
                onClick={() => onDeleteFolder(folder)}
                title={actionLabels?.delete}
                variant="icon"
              />
            ) : null}
          </span>
        ) : null}
      </div>
      {isExpanded && folder.children?.length ? (
        <div className="sidebar-sublist">
          {folder.children.map((child) => (
            <SidebarItem
              folder={child}
              collapseFolderLabel={collapseFolderLabel}
              expandedFolderIds={expandedFolderIds}
              expandFolderLabel={expandFolderLabel}
              isExpanded={expandedFolderIds.has(child.id)}
              isActive={selectedFolderId === child.id}
              isSelected={selectedItemKeys.has(`folder:${child.id}`)}
              selectedItemKeys={selectedItemKeys}
              actionLabels={actionLabels}
              key={child.id}
              onDeleteFolder={onDeleteFolder}
              onDragFolderStart={onDragFolderStart}
              onDropBeforeFolder={onDropBeforeFolder}
              onDropOnFolder={onDropOnFolder}
              onEditFolder={onEditFolder}
              onSelect={onSelect}
              onSelectFolderItem={onSelectFolderItem}
              onToggle={onToggle}
              selectedFolderId={selectedFolderId}
              selectionMode={selectionMode}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function collectInitiallyExpandedFolderIds(folders: FolderItem[]): string[] {
  return folders.flatMap((folder) => {
    const childIds = collectInitiallyExpandedFolderIds(folder.children ?? []);
    return folder.expanded ? [folder.id, ...childIds] : childIds;
  });
}
