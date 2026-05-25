import { Icon } from "./Icon";
import { useMemo, useState, type DragEvent, type MouseEvent } from "react";
import { buildBookmarkFaviconUrl } from "../services/faviconService";
import type { BookmarkItem } from "../types/bookmarks";
import { cx } from "../utils/classNames";

export interface BookmarkCardActionLabels {
  delete: string;
  edit: string;
  open: string;
  select?: string;
}

export interface BookmarkCardProps {
  actionLabels?: BookmarkCardActionLabels;
  bookmark: BookmarkItem;
  isSelected?: boolean;
  onContextMenu?: (bookmark: BookmarkItem, event: MouseEvent<HTMLElement>) => void;
  onDelete?: (bookmark: BookmarkItem) => void;
  onDragStart?: (bookmark: BookmarkItem, event: DragEvent<HTMLElement>) => void;
  onDropBefore?: (bookmark: BookmarkItem, event: DragEvent<HTMLElement>) => void;
  onEdit?: (bookmark: BookmarkItem) => void;
  onSelect?: (bookmark: BookmarkItem, event: MouseEvent<HTMLElement>) => void;
  selectionMode?: boolean;
}

export function BookmarkCard({
  actionLabels,
  bookmark,
  isSelected = false,
  onContextMenu,
  onDelete,
  onDragStart,
  onDropBefore,
  onEdit,
  onSelect,
  selectionMode = false
}: BookmarkCardProps) {
  const faviconUrl = useMemo(() => buildBookmarkFaviconUrl(bookmark.url), [bookmark.url]);
  const [failedFaviconUrl, setFailedFaviconUrl] = useState<string | null>(null);
  const faviconImageUrl = faviconUrl && failedFaviconUrl !== faviconUrl ? faviconUrl : undefined;

  function handleCardClick(event: MouseEvent<HTMLElement>) {
    if (!selectionMode && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
      return;
    }

    event.preventDefault();
    onSelect?.(bookmark, event);
  }

  return (
    <article
      className={cx("bookmark-card", isSelected && "bookmark-card--selected")}
      data-selection-key={`bookmark:${bookmark.id}`}
      data-selection-region="bookmarks"
      draggable={Boolean(onDragStart)}
      onClick={handleCardClick}
      onDragOver={(event) => {
        if (onDropBefore) {
          event.preventDefault();
        }
      }}
      onDragStart={(event) => onDragStart?.(bookmark, event)}
      onDrop={(event) => onDropBefore?.(bookmark, event)}
      onContextMenu={(event) => onContextMenu?.(bookmark, event)}
      title={bookmark.url}
    >
      <a
        aria-label={actionLabels?.open}
        className="bookmark-card__link"
        href={bookmark.url}
        rel="noreferrer"
        target="_blank"
      >
        <div className={cx("bookmark-card__icon-tile", bookmark.accent && `accent-${bookmark.accent}`)}>
          {faviconImageUrl ? (
            <img
              alt=""
              className="bookmark-card__favicon"
              onError={() => setFailedFaviconUrl(faviconImageUrl)}
              src={faviconImageUrl}
            />
          ) : (
            <span>{bookmark.iconLabel}</span>
          )}
        </div>
        <div className="bookmark-card__body">
          <div className="bookmark-card__heading">
            <h3>{bookmark.title}</h3>
            {bookmark.status === "verified" ? <Icon className="verified-icon" name="check" size={14} /> : null}
            {bookmark.status === "offline" ? <Icon className="offline-icon" name="x" size={14} /> : null}
          </div>
        </div>
      </a>
      {selectionMode ? (
        <label className="bookmark-card__select">
          <input aria-label={actionLabels?.select} checked={isSelected} readOnly type="checkbox" />
        </label>
      ) : null}
      {!selectionMode && (onEdit || onDelete) ? (
        <div className="bookmark-card__actions">
          {onEdit ? (
            <button
              aria-label={actionLabels?.edit}
              className="bookmark-card__action"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onEdit(bookmark);
              }}
              title={actionLabels?.edit}
              type="button"
            >
              <Icon name="pencil" size={14} />
            </button>
          ) : null}
          {onDelete ? (
            <button
              aria-label={actionLabels?.delete}
              className="bookmark-card__action"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onDelete(bookmark);
              }}
              title={actionLabels?.delete}
              type="button"
            >
              <Icon name="trash" size={14} />
            </button>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
