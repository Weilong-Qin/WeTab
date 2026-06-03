import { useEffect, useState, type MouseEvent } from "react";
import type { BookmarkItem, FolderItem } from "../types/bookmarks";
import {
  canMoveItem,
  flattenFolders,
  type ContextMenuState
} from "../utils/organization";

export function useBookmarkContextMenu() {
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  // Close on outside interaction
  useEffect(() => {
    if (!contextMenu) return;

    function closeContextMenu() {
      setContextMenu(null);
    }

    window.addEventListener("click", closeContextMenu);
    window.addEventListener("keydown", closeContextMenu);
    window.addEventListener("resize", closeContextMenu);

    return () => {
      window.removeEventListener("click", closeContextMenu);
      window.removeEventListener("keydown", closeContextMenu);
      window.removeEventListener("resize", closeContextMenu);
    };
  }, [contextMenu]);

  function handleBookmarkContextMenu(bookmark: BookmarkItem, event: MouseEvent<HTMLElement>) {
    event.preventDefault();
    setContextMenu({
      item: {
        id: bookmark.id,
        index: bookmark.index,
        parentId: bookmark.parentId,
        type: "bookmark"
      },
      label: bookmark.title,
      x: event.clientX,
      y: event.clientY
    });
  }

  function handleFolderContextMenu(folder: FolderItem, event: MouseEvent<HTMLElement>) {
    event.preventDefault();
    setContextMenu({
      item: {
        id: folder.id,
        index: folder.index,
        parentId: folder.parentId,
        type: "folder"
      },
      label: folder.label,
      x: event.clientX,
      y: event.clientY
    });
  }

  function getTargetFolders(folders: FolderItem[]): FolderItem[] {
    const flat = flattenFolders(folders).filter((f) => f.id !== "all");
    if (!contextMenu) return flat;
    return flat.filter((folder) => canMoveItem(contextMenu.item, folder.id, folders));
  }

  function closeContextMenu() {
    setContextMenu(null);
  }

  return {
    contextMenu,
    closeContextMenu,
    handleBookmarkContextMenu,
    handleFolderContextMenu,
    getTargetFolders
  };
}
