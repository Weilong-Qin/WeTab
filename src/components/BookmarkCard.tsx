import { Icon } from "./Icon";
import { Tag } from "./Tag";
import type { DragEvent, MouseEvent } from "react";
import type { BookmarkItem } from "../types/bookmarks";
import { cx } from "../utils/classNames";
import { Button } from "./Button";

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
  onDelete,
  onDragStart,
  onDropBefore,
  onEdit,
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
      {selectionMode ? (
        <label className="bookmark-card__select">
          <input aria-label={actionLabels?.select} checked={isSelected} readOnly type="checkbox" />
        </label>
      ) : null}
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
            {bookmark.status === "verified" ? <Icon className="verified-icon" name="check" size={16} /> : null}
            {bookmark.status === "offline" ? <Icon className="offline-icon" name="x" size={16} /> : null}
          </div>
          <p>{bookmark.description}</p>
        </div>
      </a>
      <div className="bookmark-card__footer">
        <Tag tone={bookmark.tagTone}>{bookmark.tag}</Tag>
        {onEdit || onDelete ? (
          <div className="bookmark-card__actions">
            {onEdit ? (
              <Button
                aria-label={actionLabels?.edit}
                icon="pencil"
                onClick={() => onEdit(bookmark)}
                title={actionLabels?.edit}
                variant="icon"
              />
            ) : null}
            {onDelete ? (
              <Button
                aria-label={actionLabels?.delete}
                icon="trash"
                onClick={() => onDelete(bookmark)}
                title={actionLabels?.delete}
                variant="icon"
              />
            ) : null}
          </div>
        ) : (
          <Icon className="bookmark-card__more" name="more" size={20} />
        )}
      </div>
    </article>
  );
}

export function FeatureCard({ bookmark }: BookmarkCardProps) {
  return (
    <a
      className="bookmark-card bookmark-card--feature"
      href={bookmark.url}
      rel="noreferrer"
      target="_blank"
      title={bookmark.url}
    >
      <div className="feature-card__preview" aria-hidden="true">
        <span>{bookmark.iconLabel}</span>
      </div>
      <div className="feature-card__content">
        <div className="bookmark-card__heading">
          <h3>{bookmark.title}</h3>
          {bookmark.status === "verified" ? <Icon className="verified-icon" name="check" size={18} /> : null}
          {bookmark.status === "offline" ? <Icon className="offline-icon" name="x" size={18} /> : null}
        </div>
        <p>{bookmark.description}</p>
        <div className="feature-card__meta">
          <span className="feature-card__stack">
            <i />
            <i />
            <i />
          </span>
          <span>{bookmark.folderPath.join(" / ")}</span>
        </div>
      </div>
      <Tag tone={bookmark.tagTone}>{bookmark.tag}</Tag>
    </a>
  );
}
