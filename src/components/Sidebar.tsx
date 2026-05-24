import { Button } from "./Button";
import { Icon } from "./Icon";
import { useEffect, useRef, useState } from "react";
import type { FolderItem } from "../types/bookmarks";
import { cx } from "../utils/classNames";

export interface SidebarProps {
  folders: FolderItem[];
  selectedFolderId: string;
  onSelectFolder: (id: string) => void;
  brandTitle?: string;
  brandSubtitle?: string;
  actionLabel?: string;
  collapseFolderLabel?: (label: string) => string;
  expandFolderLabel?: (label: string) => string;
  folderSectionLabel?: string;
  navLabel?: string;
  statusLabel?: string;
  profileTitle?: string;
  profileSubtitle?: string;
}

export function Sidebar({
  folders,
  selectedFolderId,
  onSelectFolder,
  brandTitle = "Digital Air",
  brandSubtitle = "Workspace",
  actionLabel = "AI Organize",
  collapseFolderLabel = (label) => `Collapse ${label}`,
  expandFolderLabel = (label) => `Expand ${label}`,
  folderSectionLabel = "Folders",
  navLabel = "Bookmark folders",
  statusLabel = "Sync Status: Live",
  profileTitle = "Personal Library",
  profileSubtitle = "Digital Air Space"
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
        <Button className="sidebar__ai-button" icon="sparkles" variant="primary">
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
            onSelect={onSelectFolder}
            onToggle={toggleFolder}
            selectedFolderId={selectedFolderId}
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
              key={folder.id}
              onSelect={onSelectFolder}
              onToggle={toggleFolder}
              selectedFolderId={selectedFolderId}
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
        <div className="sidebar__profile">
          <div className="sidebar__avatar">PL</div>
          <div>
            <strong>{profileTitle}</strong>
            <span>{profileSubtitle}</span>
          </div>
          <Icon name="settings" size={18} />
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
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
  selectedFolderId: string;
}

function SidebarItem({
  folder,
  collapseFolderLabel,
  expandedFolderIds,
  expandFolderLabel,
  isExpanded,
  isActive,
  onSelect,
  onToggle,
  selectedFolderId
}: SidebarItemProps) {
  const hasChildren = Boolean(folder.children?.length);

  return (
    <div className="sidebar-item-wrap">
      <div className={cx("sidebar-item", isActive && "sidebar-item--active")}>
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
          onClick={() => {
            if (hasChildren && !isExpanded) {
              onToggle(folder.id);
            }

            onSelect(folder.id);
          }}
          type="button"
        >
          <Icon name={folder.icon} size={19} />
          <span>{folder.label}</span>
        </button>
        <span className="sidebar-item__count">{folder.count}</span>
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
              key={child.id}
              onSelect={onSelect}
              onToggle={onToggle}
              selectedFolderId={selectedFolderId}
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
