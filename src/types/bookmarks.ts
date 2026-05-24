import type { IconName } from "../components/Icon";

export type BookmarkStatus = "verified" | "unchecked" | "offline";
export type TagTone = "blue" | "red" | "neutral";

export interface BookmarkItem {
  id: string;
  title: string;
  url: string;
  domain: string;
  description: string;
  folderPath: string[];
  folderIdPath: string[];
  tag: string;
  tagTone: TagTone;
  iconLabel: string;
  status: BookmarkStatus;
  accent?: "blue" | "red" | "green" | "amber";
}

export interface FolderItem {
  id: string;
  label: string;
  count: number;
  icon: IconName;
  active?: boolean;
  expanded?: boolean;
  children?: FolderItem[];
}

export interface BookmarkViewModel {
  folders: FolderItem[];
  bookmarks: BookmarkItem[];
}
