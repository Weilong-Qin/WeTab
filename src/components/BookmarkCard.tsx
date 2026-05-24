import { Icon } from "./Icon";
import { Tag } from "./Tag";
import type { BookmarkItem } from "../types/bookmarks";
import { cx } from "../utils/classNames";

export interface BookmarkCardProps {
  bookmark: BookmarkItem;
}

export function BookmarkCard({ bookmark }: BookmarkCardProps) {
  return (
    <a
      className="bookmark-card"
      href={bookmark.url}
      rel="noreferrer"
      target="_blank"
      title={bookmark.url}
    >
      <div className={cx("bookmark-card__icon-tile", bookmark.accent && `accent-${bookmark.accent}`)}>
        <span>{bookmark.iconLabel}</span>
      </div>
      <div className="bookmark-card__body">
        <div className="bookmark-card__heading">
          <h3>{bookmark.title}</h3>
          {bookmark.status === "verified" ? <Icon className="verified-icon" name="check" size={16} /> : null}
        </div>
        <p>{bookmark.description}</p>
      </div>
      <div className="bookmark-card__footer">
        <Tag tone={bookmark.tagTone}>{bookmark.tag}</Tag>
        <Icon className="bookmark-card__more" name="more" size={20} />
      </div>
    </a>
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
