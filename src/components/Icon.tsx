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
  ExternalLink,
  FlaskConical,
  FolderOpen,
  Layers3,
  LayoutGrid,
  Lightbulb,
  Menu,
  MoreHorizontal,
  Palette,
  Plus,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
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
  | "external"
  | "flask"
  | "folderOpen"
  | "layers"
  | "layout"
  | "lightbulb"
  | "menu"
  | "more"
  | "palette"
  | "plus"
  | "refresh"
  | "search"
  | "settings"
  | "shield"
  | "sliders"
  | "sparkles"
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
  external: ExternalLink,
  flask: FlaskConical,
  folderOpen: FolderOpen,
  layers: Layers3,
  layout: LayoutGrid,
  lightbulb: Lightbulb,
  menu: Menu,
  more: MoreHorizontal,
  palette: Palette,
  plus: Plus,
  refresh: RefreshCw,
  search: Search,
  settings: Settings,
  shield: ShieldCheck,
  sliders: SlidersHorizontal,
  sparkles: Sparkles,
  users: Users,
  x: X
};

export interface IconProps extends Omit<LucideProps, "name"> {
  name: IconName;
}

export function Icon({ name, strokeWidth = 1.8, ...props }: IconProps) {
  const Component = icons[name];
  return <Component aria-hidden="true" focusable="false" strokeWidth={strokeWidth} {...props} />;
}
