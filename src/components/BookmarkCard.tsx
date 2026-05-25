import { Icon } from "./Icon";
import type { DragEvent, MouseEvent } from "react";
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
  onDragStart,
  onDropBefore,
  onSelect,
  selectionMode = false
}: BookmarkCardProps) {
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
      draggable={Boolean(onDragStart)}
      onClick={handleCardClick}
      onDragOver={(event) => {
        if (onDropBefore) {
          event.preventDefault();
        }
      }}
      onDragStart={(event) => onDragStart?.(bookmark, event)}
      onDrop={(event) => onDropBefore?.(bookmark, event)}
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
          <span>{bookmark.iconLabel}</span>
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
    </article>
  );
}


