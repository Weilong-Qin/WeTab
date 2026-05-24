import type { BookmarkViewLabels } from "../services/bookmarkService";
import type { LanguageCode, LanguageOption } from "../types/language";

export interface AppMessages {
  appShell: {
    closeNavigation: string;
    openNavigation: string;
    resizeSidebar: string;
  };
  bookmarkView: BookmarkViewLabels;
  newTab: {
    addBookmark: string;
    addBookmarkTitle: string;
    addFolder: string;
    heroTag: string;
    heroTitle: string;
    heroDescription: string;
    bookmarkSummary: string;
    breadcrumbLabel: string;
    loadingLinks: string;
    nativeLinks: string;
    gridEyebrow: string;
    gridSearchTitle: string;
    gridFolderTitle: string;
    folderPaths: string;
    reload: string;
    accessErrorTitle: string;
    loadingTitle: string;
    loadingDescription: string;
    noMatchesTitle: string;
    noMatchesDescription: string;
    noBookmarksTitle: string;
    noBookmarksDescription: string;
    searchPlaceholder: string;
    searchAriaLabel: string;
    deleteBookmarkConfirm: (title: string) => string;
    bookmarkActions: {
      delete: string;
      edit: string;
      open: string;
    };
    urlValidation: {
      check: string;
      checking: string;
      complete: (count: number) => string;
      error: string;
    };
    editor: {
      saveError: string;
      createBookmark: {
        cancel: string;
        close: string;
        folderName: string;
        save: string;
        title: string;
        titleLabel: string;
        urlLabel: string;
      };
      createFolder: {
        cancel: string;
        close: string;
        folderName: string;
        save: string;
        title: string;
        titleLabel: string;
        urlLabel: string;
      };
      editBookmark: {
        cancel: string;
        close: string;
        folderName: string;
        save: string;
        title: string;
        titleLabel: string;
        urlLabel: string;
      };
    };
    sidebar: {
      actionLabel: string;
      brandSubtitle: string;
      collapseFolder: (label: string) => string;
      expandFolder: (label: string) => string;
      folderSectionLabel: string;
      navLabel: string;
      profileSubtitle: string;
      profileTitle: string;
      statusAccessNeeded: string;
      statusLive: string;
    };
  };
  options: {
    tag: string;
    title: string;
    description: string;
    providerTitle: string;
    providerHelp: string;
    testConnection: string;
    baseUrl: string;
    apiKey: string;
    model: string;
    dataSentTitle: string;
    dataSentDescription: string;
    languageTitle: string;
    languageHelp: string;
    languageLabel: string;
    languageDescription: string;
  };
}

export const languageOptions: LanguageOption[] = [
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "zh-CN", label: "Chinese", nativeLabel: "中文" }
];

export const messages: Record<LanguageCode, AppMessages> = {
  en: {
    appShell: {
      closeNavigation: "Close navigation",
      openNavigation: "Open navigation",
      resizeSidebar: "Resize sidebar"
    },
    bookmarkView: {
      allBookmarksLabel: "All Bookmarks",
      bookmarkAccessUnavailable:
        "Browser bookmark access is unavailable. Open vTab as the installed extension new-tab page and confirm the bookmarks permission is enabled.",
      bookmarkDescription: (domain) => `Saved from ${domain}`,
      defaultBookmarkLabel: "Bookmark",
      defaultFolderLabel: "Bookmarks"
    },
    newTab: {
      addBookmark: "Add Bookmark",
      addBookmarkTitle: "Add a bookmark to the selected browser bookmark folder.",
      addFolder: "Add Folder",
      heroTag: "Native Bookmark Library",
      heroTitle: "vTab turns your browser bookmarks into a searchable homepage.",
      heroDescription:
        "Browse the folder hierarchy you already maintain in Chrome, search by title, domain, or folder path, and open saved links directly from the new tab.",
      bookmarkSummary: "Bookmark summary",
      breadcrumbLabel: "Current bookmark folder",
      loadingLinks: "loading links",
      nativeLinks: "native links",
      gridEyebrow: "Bookmark Grid",
      gridSearchTitle: "Search results",
      gridFolderTitle: "Selected folder",
      folderPaths: "Folder paths",
      reload: "Reload vTab",
      accessErrorTitle: "vTab cannot read browser bookmarks",
      loadingTitle: "Loading bookmarks",
      loadingDescription: "vTab is reading your native bookmark tree and preparing folder counts.",
      noMatchesTitle: "No matching bookmarks",
      noMatchesDescription: "Try a different search term or choose another bookmark folder from the sidebar.",
      noBookmarksTitle: "No browser bookmarks yet",
      noBookmarksDescription:
        "Your browser bookmark tree is empty. Add bookmarks in Chrome and vTab will refresh automatically.",
      searchPlaceholder: "Search bookmark titles, domains, or folder paths...",
      searchAriaLabel: "Search bookmarks",
      deleteBookmarkConfirm: (title) => `Delete "${title}" from browser bookmarks?`,
      bookmarkActions: {
        delete: "Delete bookmark",
        edit: "Edit bookmark",
        open: "Open bookmark"
      },
      urlValidation: {
        check: "Check links",
        checking: "Checking...",
        complete: (count) => `Checked ${count} visible bookmark${count === 1 ? "" : "s"}.`,
        error: "Unable to check links right now. Confirm network access and try again."
      },
      editor: {
        saveError: "Unable to update browser bookmarks. Confirm the extension still has bookmark access.",
        createBookmark: {
          cancel: "Cancel",
          close: "Close bookmark editor",
          folderName: "Folder name",
          save: "Create bookmark",
          title: "Create bookmark",
          titleLabel: "Bookmark title",
          urlLabel: "URL"
        },
        createFolder: {
          cancel: "Cancel",
          close: "Close folder editor",
          folderName: "Folder name",
          save: "Create folder",
          title: "Create folder",
          titleLabel: "Bookmark title",
          urlLabel: "URL"
        },
        editBookmark: {
          cancel: "Cancel",
          close: "Close bookmark editor",
          folderName: "Folder name",
          save: "Save changes",
          title: "Edit bookmark",
          titleLabel: "Bookmark title",
          urlLabel: "URL"
        }
      },
      sidebar: {
        actionLabel: "AI Classify",
        brandSubtitle: "Bookmark Home",
        collapseFolder: (label) => `Collapse ${label}`,
        expandFolder: (label) => `Expand ${label}`,
        folderSectionLabel: "Folders",
        navLabel: "Bookmark folders",
        profileSubtitle: "Native source",
        profileTitle: "Browser Bookmarks",
        statusAccessNeeded: "Bookmark Access Needed",
        statusLive: "Native Bookmarks Live"
      }
    },
    options: {
      tag: "Options",
      title: "LLM configuration",
      description:
        "Configure an OpenAI-compatible provider before requesting bookmark organization suggestions. No bookmark data is sent until you explicitly test or run an AI action.",
      providerTitle: "Provider",
      providerHelp: "Stored locally with extension settings.",
      testConnection: "Test connection",
      baseUrl: "Base URL",
      apiKey: "API key",
      model: "Model",
      dataSentTitle: "Data sent for classification",
      dataSentDescription:
        "vTab may send selected bookmark titles, URLs, and folder paths to the configured provider only when you request suggestions. Suggestions remain reviewable before any browser bookmark changes are written.",
      languageTitle: "Language",
      languageHelp: "Stored locally and applied to extension pages.",
      languageLabel: "Display language",
      languageDescription: "Choose the language used for vTab interface text. Bookmark titles and folder names are left unchanged."
    }
  },
  "zh-CN": {
    appShell: {
      closeNavigation: "关闭导航",
      openNavigation: "打开导航",
      resizeSidebar: "调整侧栏宽度"
    },
    bookmarkView: {
      allBookmarksLabel: "全部书签",
      bookmarkAccessUnavailable: "无法访问浏览器书签。请以已安装扩展的新标签页方式打开 vTab，并确认已启用书签权限。",
      bookmarkDescription: (domain) => `保存自 ${domain}`,
      defaultBookmarkLabel: "书签",
      defaultFolderLabel: "书签"
    },
    newTab: {
      addBookmark: "添加书签",
      addBookmarkTitle: "将书签添加到当前选中的浏览器书签文件夹。",
      addFolder: "添加文件夹",
      heroTag: "浏览器原生书签库",
      heroTitle: "vTab 将浏览器书签变成可搜索的新标签页主页。",
      heroDescription: "浏览你已在 Chrome 中维护的文件夹层级，按标题、域名或文件夹路径搜索，并直接从新标签页打开保存的链接。",
      bookmarkSummary: "书签概览",
      breadcrumbLabel: "当前书签文件夹",
      loadingLinks: "正在加载链接",
      nativeLinks: "原生链接",
      gridEyebrow: "书签网格",
      gridSearchTitle: "搜索结果",
      gridFolderTitle: "当前文件夹",
      folderPaths: "文件夹路径",
      reload: "重新加载 vTab",
      accessErrorTitle: "vTab 无法读取浏览器书签",
      loadingTitle: "正在加载书签",
      loadingDescription: "vTab 正在读取浏览器原生书签树并准备文件夹数量。",
      noMatchesTitle: "没有匹配的书签",
      noMatchesDescription: "请尝试其他搜索词，或从侧边栏选择另一个书签文件夹。",
      noBookmarksTitle: "暂无浏览器书签",
      noBookmarksDescription: "你的浏览器书签树为空。在 Chrome 中添加书签后，vTab 会自动刷新。",
      searchPlaceholder: "搜索书签标题、域名或文件夹路径...",
      searchAriaLabel: "搜索书签",
      deleteBookmarkConfirm: (title) => `要从浏览器书签中删除“${title}”吗？`,
      bookmarkActions: {
        delete: "删除书签",
        edit: "编辑书签",
        open: "打开书签"
      },
      urlValidation: {
        check: "检查链接",
        checking: "正在检查...",
        complete: (count) => `已检查 ${count} 个当前可见书签。`,
        error: "暂时无法检查链接。请确认网络访问后重试。"
      },
      editor: {
        saveError: "无法更新浏览器书签。请确认扩展仍然拥有书签访问权限。",
        createBookmark: {
          cancel: "取消",
          close: "关闭书签编辑器",
          folderName: "文件夹名称",
          save: "创建书签",
          title: "创建书签",
          titleLabel: "书签标题",
          urlLabel: "URL"
        },
        createFolder: {
          cancel: "取消",
          close: "关闭文件夹编辑器",
          folderName: "文件夹名称",
          save: "创建文件夹",
          title: "创建文件夹",
          titleLabel: "书签标题",
          urlLabel: "URL"
        },
        editBookmark: {
          cancel: "取消",
          close: "关闭书签编辑器",
          folderName: "文件夹名称",
          save: "保存更改",
          title: "编辑书签",
          titleLabel: "书签标题",
          urlLabel: "URL"
        }
      },
      sidebar: {
        actionLabel: "AI 分类",
        brandSubtitle: "书签主页",
        collapseFolder: (label) => `折叠${label}`,
        expandFolder: (label) => `展开${label}`,
        folderSectionLabel: "文件夹",
        navLabel: "书签文件夹",
        profileSubtitle: "原生来源",
        profileTitle: "浏览器书签",
        statusAccessNeeded: "需要书签访问权限",
        statusLive: "原生书签已同步"
      }
    },
    options: {
      tag: "选项",
      title: "LLM 配置",
      description: "在请求书签整理建议前，先配置兼容 OpenAI 的服务提供方。除非你主动测试或运行 AI 操作，否则不会发送书签数据。",
      providerTitle: "服务提供方",
      providerHelp: "随扩展设置保存在本地。",
      testConnection: "测试连接",
      baseUrl: "基础 URL",
      apiKey: "API 密钥",
      model: "模型",
      dataSentTitle: "用于分类的数据",
      dataSentDescription:
        "只有当你请求建议时，vTab 才可能把选中的书签标题、URL 和文件夹路径发送给已配置的服务提供方。所有建议都需要先审核，才会写入浏览器书签。",
      languageTitle: "语言",
      languageHelp: "保存在本地，并应用到扩展页面。",
      languageLabel: "显示语言",
      languageDescription: "选择 vTab 界面文本使用的语言。书签标题和文件夹名称不会被翻译。"
    }
  }
};
