import { Icon } from "./Icon";
import { Tag } from "./Tag";
import type { BookmarkItem } from "../types/bookmarks";
import { cx } from "../utils/classNames";
import { Button } from "./Button";

export interface BookmarkCardActionLabels {
  delete: string;
  edit: string;
  open: string;
}

export interface BookmarkCardProps {
  actionLabels?: BookmarkCardActionLabels;
  bookmark: BookmarkItem;
  onDelete?: (bookmark: BookmarkItem) => void;
  onEdit?: (bookmark: BookmarkItem) => void;
}

export function BookmarkCard({ actionLabels, bookmark, onDelete, onEdit }: BookmarkCardProps) {
  return (
    <article className="bookmark-card" title={bookmark.url}>
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
