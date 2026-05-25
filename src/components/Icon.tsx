import {
  AirVent,
  BookOpen,
  BookmarkPlus,
  Braces,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Code2,
  Command,
  Copy,
  ExternalLink,
  FlaskConical,
  FolderOpen,
  FolderPlus,
  Info,
  Layers3,
  LayoutGrid,
  Lightbulb,
  Menu,
  MoreHorizontal,
  Palette,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  Users,
  X
} from "lucide-react";
import type { LucideIcon, LucideProps } from "lucide-react";

export type IconName =
  | "air"
  | "book"
  | "bookmarkAdd"
  | "braces"
  | "briefcase"
  | "check"
  | "chevronDown"
  | "chevronRight"
  | "code"
  | "command"
  | "copy"
  | "external"
  | "flask"
  | "folderAdd"
  | "folderOpen"
  | "info"
  | "layers"
  | "layout"
  | "lightbulb"
  | "menu"
  | "more"
  | "palette"
  | "pencil"
  | "plus"
  | "refresh"
  | "search"
  | "settings"
  | "shield"
  | "sliders"
  | "sparkles"
  | "trash"
  | "users"
  | "x";

const icons: Record<IconName, LucideIcon> = {
  air: AirVent,
  book: BookOpen,
  bookmarkAdd: BookmarkPlus,
  braces: Braces,
  briefcase: BriefcaseBusiness,
  check: CheckCircle2,
  chevronDown: ChevronDown,
  chevronRight: ChevronRight,
  code: Code2,
  command: Command,
  copy: Copy,
  external: ExternalLink,
  flask: FlaskConical,
  folderAdd: FolderPlus,
  folderOpen: FolderOpen,
  info: Info,
  layers: Layers3,
  layout: LayoutGrid,
  lightbulb: Lightbulb,
  menu: Menu,
  more: MoreHorizontal,
  palette: Palette,
  pencil: Pencil,
  plus: Plus,
  refresh: RefreshCw,
  search: Search,
  settings: Settings,
  shield: ShieldCheck,
  sliders: SlidersHorizontal,
  sparkles: Sparkles,
  trash: Trash2,
  users: Users,
  x: X
};

export interface IconProps extends Omit<LucideProps, "name"> {
  name: IconName;
  title?: string;
}

export function Icon({ name, strokeWidth = 1.8, ...props }: IconProps) {
  const Component = icons[name];
  return <Component aria-hidden="true" focusable="false" strokeWidth={strokeWidth} {...props} />;
}
