import type { BookmarkItem, FolderItem } from "../types/bookmarks";

export const sampleFolders: FolderItem[] = [
  { id: "all", label: "All Library", count: 244, icon: "folderOpen", active: true },
  { id: "work", label: "Work", count: 48, icon: "briefcase" },
  { id: "inspiration", label: "Inspiration", count: 72, icon: "lightbulb" },
  {
    id: "development",
    label: "Development",
    count: 96,
    icon: "code",
    expanded: true,
    children: [
      { id: "react-components", label: "React Components", count: 34, icon: "braces" },
      { id: "infrastructure", label: "Infrastructure", count: 22, icon: "layers" }
    ]
  },
  { id: "social", label: "Social", count: 28, icon: "users" }
];

export const sampleBookmarks: BookmarkItem[] = [
  {
    id: "openai",
    title: "OpenAI Platform",
    url: "https://platform.openai.com",
    domain: "platform.openai.com",
    description: "LLM APIs and model documentation",
    folderPath: ["Work", "AI"],
    folderIdPath: ["work", "ai"],
    tag: "AI",
    tagTone: "blue",
    iconLabel: "O",
    status: "verified",
    accent: "green"
  },
  {
    id: "dribbble",
    title: "Dribbble Inspiration",
    url: "https://dribbble.com",
    domain: "dribbble.com",
    description: "Design inspiration",
    folderPath: ["Inspiration"],
    folderIdPath: ["inspiration"],
    tag: "Inspo",
    tagTone: "red",
    iconLabel: "D",
    status: "verified",
    accent: "red"
  },
  {
    id: "github",
    title: "GitHub Repos",
    url: "https://github.com",
    domain: "github.com",
    description: "Code and infrastructure",
    folderPath: ["Development"],
    folderIdPath: ["development"],
    tag: "Dev",
    tagTone: "blue",
    iconLabel: "G",
    status: "verified",
    accent: "blue"
  },
  {
    id: "vercel",
    title: "Vercel Ship 2024",
    url: "https://vercel.com",
    domain: "vercel.com",
    description: "Highlights on Turborepo, Next.js, and AI SDK integration.",
    folderPath: ["Development", "Infrastructure"],
    folderIdPath: ["development", "infrastructure"],
    tag: "Dev",
    tagTone: "blue",
    iconLabel: "V",
    status: "verified",
    accent: "green"
  },
  {
    id: "behance",
    title: "Behance Showcase",
    url: "https://behance.net",
    domain: "behance.net",
    description: "Visual arts portfolio",
    folderPath: ["Inspiration"],
    folderIdPath: ["inspiration"],
    tag: "Inspo",
    tagTone: "red",
    iconLabel: "B",
    status: "unchecked",
    accent: "amber"
  },
  {
    id: "tailwind",
    title: "Tailwind Docs",
    url: "https://tailwindcss.com",
    domain: "tailwindcss.com",
    description: "Utility-first CSS framework",
    folderPath: ["Development", "React Components"],
    folderIdPath: ["development", "react-components"],
    tag: "Dev",
    tagTone: "blue",
    iconLabel: "T",
    status: "verified",
    accent: "blue"
  }
];
