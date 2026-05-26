import { Button } from "./Button";
import { Icon } from "./Icon";
import { useEffect, useRef, useState, type DragEvent, type MouseEvent, type PointerEvent, type Ref } from "react";
import type { FolderItem } from "../types/bookmarks";
import { cx } from "../utils/classNames";

export interface SidebarProps {
  folders: FolderItem[];
  selectedFolderId: string;
  onSelectFolder: (id: string) => void;
  brandTitle?: string;
  brandSubtitle?: string;
  actionDisabled?: boolean;
  actionLabel?: string;
  actionTitle?: string;
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
  onFolderContextMenu?: (folder: FolderItem, event: MouseEvent<HTMLElement>) => void;
  onSelectionPointerDown?: (event: PointerEvent<HTMLElement>) => void;
  statusLabel?: string;
  onSelectFolderItem?: (folder: FolderItem, event: MouseEvent<HTMLElement>) => void;
  selectionContainerRef?: Ref<HTMLElement>;
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
  actionDisabled = false,
  actionLabel = "AI Organize",
  actionTitle,
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
  onFolderContextMenu,
  onSelectionPointerDown,
  onSelectFolderItem,
  selectionContainerRef,
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
      <div className="sidebar__brand-row">
        <div className="sidebar__brand">
          <div className="sidebar__brand-mark">
            <Icon name="air" size={19} />
          </div>
          <div>
            <h1>{brandTitle}</h1>
            <p>{brandSubtitle}</p>
          </div>
        </div>
        {onOpenSettings ? (
          <Button aria-label={settingsLabel} icon="settings" onClick={onOpenSettings} variant="icon" />
        ) : null}
      </div>

      {onAction ? (
        <div className="sidebar__workspace-actions">
          <Button
            className="sidebar__ai-button"
            disabled={actionDisabled}
            icon="sparkles"
            onClick={onAction}
            title={actionTitle}
            variant="glass"
          >
            {actionLabel}
          </Button>
        </div>
      ) : null}

      <nav
        aria-label={navLabel}
        className="sidebar__nav"
        onPointerDown={onSelectionPointerDown}
        ref={selectionContainerRef}
      >
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
            onFolderContextMenu={onFolderContextMenu}
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
              onFolderContextMenu={onFolderContextMenu}
              onSelect={onSelectFolder}
              onSelectFolderItem={onSelectFolderItem}
              onToggle={toggleFolder}
              selectedFolderId={selectedFolderId}
              selectionMode={selectionMode}
            />
          ))}
        </div>
      </nav>

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
  onFolderContextMenu?: (folder: FolderItem, event: MouseEvent<HTMLElement>) => void;
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
  onFolderContextMenu,
  onSelect,
  onSelectFolderItem,
  onToggle,
  selectedFolderId,
  selectionMode
}: SidebarItemProps) {
  const hasChildren = Boolean(folder.children?.length);
  const isSyntheticRoot = folder.id === "all";
  const [isDropTarget, setIsDropTarget] = useState(false);

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
        className={cx(
          "sidebar-item",
          isActive && "sidebar-item--active",
          isSelected && "sidebar-item--selected",
          isDropTarget && "sidebar-item--drop-target"
        )}
        data-selection-key={isSyntheticRoot ? undefined : `folder:${folder.id}`}
        data-selection-region={isSyntheticRoot ? undefined : "folders"}
        draggable={!isSyntheticRoot && Boolean(onDragFolderStart)}
        onDragEnter={(event) => {
          if (!isSyntheticRoot && (onDropBeforeFolder || onDropOnFolder)) {
            event.preventDefault();
            setIsDropTarget(true);
          }
        }}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setIsDropTarget(false);
          }
        }}
        onDragOver={(event) => {
          if (!isSyntheticRoot && (onDropBeforeFolder || onDropOnFolder)) {
            event.preventDefault();
            setIsDropTarget(true);
          }
        }}
        onDragStart={(event) => {
          if (!isSyntheticRoot) {
            onDragFolderStart?.(folder, event);
          }
        }}
        onDrop={(event) => {
          setIsDropTarget(false);

          if (!isSyntheticRoot) {
            onDropOnFolder?.(folder, event);
          }
        }}
        onDragEnd={() => setIsDropTarget(false)}
        onContextMenu={(event) => {
          if (!isSyntheticRoot) {
            onFolderContextMenu?.(folder, event);
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
          <span className="sidebar-item__toggle-placeholder" />
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
              onFolderContextMenu={onFolderContextMenu}
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
