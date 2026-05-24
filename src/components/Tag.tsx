import type { HTMLAttributes } from "react";
import { cx } from "../utils/classNames";
import type { TagTone } from "../types/bookmarks";

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: TagTone;
}

export function Tag({ tone = "neutral", className, children, ...props }: TagProps) {
  return (
    <span className={cx("tag", `tag--${tone}`, className)} {...props}>
      {children}
    </span>
  );
}
