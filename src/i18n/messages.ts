import type { BookmarkViewLabels } from "../services/bookmarkService";
import type { LanguageCode, LanguageOption } from "../types/language";
import type { OptionsMessages } from "./options-messages";
import { optionsMessages } from "./options-messages";
import type { SettingsMessages } from "./settings-messages";
import { settingsMessages } from "./settings-messages";

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
    dailyFeed: {
      activity: {
        activeDays: (count: number) => string;
        acTotal: (ac: number, total: number) => string;
        configureDescription: string;
        last30: (count: number) => string;
        notFoundDescription: string;
        siteRanking: (ranking: string) => string;
        streak: (count: number) => string;
        totalSubmissions: (count: number) => string;
      };
      collapse: string;
      difficulty: (difficulty: string, topics: string[]) => string;
      expand: string;
      practiceLabels: {
        core: string;
        stretch: string;
        warmUp: string;
      };
      practiceMetadata: (topic: string, difficulty: string) => string;
      relatedPracticeSubtitle: string;
      relatedPracticeTitle: string;
      groups: Record<string, string>;
      retry: string;
      sources: {
        github: string;
        hackernews: string;
        leetcode: string;
        leetcodeActivity: string;
      };
      title: string;
      topicName: (topic: string) => string;
      unknownDifficulty: string;
    };
    deleteBookmarkConfirm: (title: string) => string;
    deleteFolderConfirm: (title: string) => string;
    deleteSelectedConfirm: (count: number) => string;
    bookmarkActions: {
      delete: string;
      edit: string;
      open: string;
      select: string;
    };
    folderActions: {
      delete: string;
      edit: string;
      select: string;
    };
    contextMenu: {
      copyTo: string;
      delete: string;
      moveTo: string;
      renameBookmark: string;
      renameFolder: string;
    };
    selection: {
      chooseFolder: string;
      clear: string;
      copyTo: string;
      delete: string;
      done: string;
      moveTo: string;
      select: string;
      selectedCount: (count: number) => string;
    };
    undo: {
      action: string;
      copyComplete: (count: number) => string;
      deleteComplete: (count: number) => string;
      moveComplete: (count: number) => string;
    };
    llm: {
      applied: string;
      apply: string;
      applyAll: string;
      applyError: string;
      clear: string;
      confidence: (score: number) => string;
      error: string;
      eyebrow: string;
      loading: string;
      newFolderPrefix: string;
      noBookmarks: string;
      reject: string;
      reviewTitle: string;
      scope: {
        cancel: string;
        close: string;
        currentViewDescription: (count: number) => string;
        currentViewLabel: string;
        selectedDescription: (count: number) => string;
        selectedLabel: string;
        submit: string;
        title: string;
      };
      status: {
        applied: string;
        pending: string;
        rejected: string;
      };
      suggestionsReady: (count: number) => string;
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
      editFolder: {
        cancel: string;
        close: string;
        folderName: string;
        save: string;
        title: string;
        titleLabel: string;
        urlLabel: string;
      };
    };
    feedback: {
      close: string;
    };
    sidebar: {
      actionLabel: string;
      actionTitle: string;
      brandSubtitle: string;
      collapseFolder: (label: string) => string;
      expandFolder: (label: string) => string;
      folderSectionLabel: string;
      navLabel: string;
    };
  };
  options: OptionsMessages;
  settings: SettingsMessages;
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
        "Browser bookmark access is unavailable. Open WeTab as the installed extension new-tab page and confirm the bookmarks permission is enabled.",
      bookmarkDescription: (domain) => `Saved from ${domain}`,
      defaultBookmarkLabel: "Bookmark",
      defaultFolderLabel: "Bookmarks"
    },
    newTab: {
      addBookmark: "Add Bookmark",
      addBookmarkTitle: "Add a bookmark to the selected browser bookmark folder.",
      addFolder: "Add Folder",
      heroTag: "Native Bookmark Library",
      heroTitle: "WeTab turns your browser bookmarks into a searchable homepage.",
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
      reload: "Reload WeTab",
      accessErrorTitle: "WeTab cannot read browser bookmarks",
      loadingTitle: "Loading bookmarks",
      loadingDescription: "WeTab is reading your native bookmark tree and preparing folder counts.",
      noMatchesTitle: "No matching bookmarks",
      noMatchesDescription: "Try a different search term or choose another bookmark folder from the sidebar.",
      noBookmarksTitle: "No browser bookmarks yet",
      noBookmarksDescription:
        "Your browser bookmark tree is empty. Add bookmarks in Chrome and WeTab will refresh automatically.",
      searchPlaceholder: "Search bookmark titles, domains, or folder paths...",
      searchAriaLabel: "Search bookmarks",
      dailyFeed: {
        activity: {
          activeDays: (count) => `${count}/7 active days`,
          acTotal: (ac, total) => `${ac}/${total} solved`,
          configureDescription: "Set a LeetCode username in settings to show public activity.",
          last30: (count) => `${count} submissions in 30d`,
          notFoundDescription: "No public activity found for this username.",
          siteRanking: (ranking) => `Ranking #${ranking}`,
          streak: (count) => `${count} day streak`,
          totalSubmissions: (count) => `${count} total submissions`
        },
        collapse: "Collapse",
        difficulty: (difficulty, topics) =>
          [`Difficulty: ${difficulty}`, ...topics.slice(0, 2)].join(" · "),
        expand: "Expand",
        practiceLabels: {
          core: "Core",
          stretch: "Stretch",
          warmUp: "Warm-up"
        },
        practiceMetadata: (topic, difficulty) => `${topic} · ${difficulty}`,
        relatedPracticeSubtitle: "Warm-up · Core · Stretch",
        relatedPracticeTitle: "Related Practice",
        groups: {
          leetcode: "LeetCode"
        },
        retry: "Retry",
        sources: {
          github: "GitHub Trending",
          hackernews: "HackerNews",
          leetcode: "LeetCode Daily",
          leetcodeActivity: "LeetCode Activity"
        },
        title: "Daily Feed",
        topicName: (topic) => topic,
        unknownDifficulty: "Unknown"
      },
      deleteBookmarkConfirm: (title) => `Delete "${title}" from browser bookmarks?`,
      deleteFolderConfirm: (title) =>
        `Delete folder "${title}" and all bookmarks and folders inside it? This writes to browser bookmarks.`,
      deleteSelectedConfirm: (count) =>
        `Delete ${count} selected item${count === 1 ? "" : "s"} from browser bookmarks?`,
      bookmarkActions: {
        delete: "Delete bookmark",
        edit: "Edit bookmark",
        open: "Open bookmark",
        select: "Select bookmark"
      },
      folderActions: {
        delete: "Delete folder",
        edit: "Rename folder",
        select: "Select folder"
      },
      contextMenu: {
        copyTo: "Copy to",
        delete: "Delete",
        moveTo: "Move to",
        renameBookmark: "Rename bookmark",
        renameFolder: "Rename folder"
      },
      selection: {
        chooseFolder: "Choose folder",
        clear: "Clear",
        copyTo: "Copy to...",
        delete: "Delete selected",
        done: "Done",
        moveTo: "Move to...",
        select: "Select",
        selectedCount: (count) => `${count} selected`
      },
      undo: {
        action: "Undo",
        copyComplete: (count) => `Copied ${count} item${count === 1 ? "" : "s"}.`,
        deleteComplete: (count) => `Deleted ${count} item${count === 1 ? "" : "s"}.`,
        moveComplete: (count) => `Moved ${count} item${count === 1 ? "" : "s"}.`
      },
      llm: {
        applied: "Suggestion applied.",
        apply: "Apply",
        applyAll: "Apply all",
        applyError: "Unable to apply the suggestion. Refresh bookmarks and try again.",
        clear: "Clear",
        confidence: (score) => `${score}% confidence`,
        error: "Unable to request classification suggestions. Check LLM settings and try again.",
        eyebrow: "AI suggestions",
        loading: "Classifying...",
        newFolderPrefix: "New folder:",
        noBookmarks: "Select bookmarks or open a folder with bookmarks before requesting suggestions.",
        reject: "Reject",
        reviewTitle: "Review classification suggestions",
        scope: {
          cancel: "Cancel",
          close: "Close AI scope selector",
          currentViewDescription: (count) => `${count} visible bookmark${count === 1 ? "" : "s"} in the current search and folder view.`,
          currentViewLabel: "Current view",
          selectedDescription: (count) => `${count} selected bookmark${count === 1 ? "" : "s"}. Use multi-select to narrow this scope.`,
          selectedLabel: "Selected bookmarks",
          submit: "Generate suggestions",
          title: "Choose bookmarks for AI organization"
        },
        status: {
          applied: "Applied",
          pending: "Pending",
          rejected: "Rejected"
        },
        suggestionsReady: (count) => `${count} suggestion${count === 1 ? "" : "s"} ready for review.`
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
        },
        editFolder: {
          cancel: "Cancel",
          close: "Close folder editor",
          folderName: "Folder name",
          save: "Save changes",
          title: "Rename folder",
          titleLabel: "Bookmark title",
          urlLabel: "URL"
        }
      },
      feedback: {
        close: "Dismiss notification"
      },
      sidebar: {
        actionLabel: "AI Organize",
        actionTitle: "Generate organization suggestions for selected bookmarks or the current view.",
        brandSubtitle: "Bookmark Home",
        collapseFolder: (label) => `Collapse ${label}`,
        expandFolder: (label) => `Expand ${label}`,
        folderSectionLabel: "Folders",
        navLabel: "Bookmark folders"
      }
    },
    options: optionsMessages.en,
    settings: settingsMessages.en
  },
  "zh-CN": {
    appShell: {
      closeNavigation: "关闭导航",
      openNavigation: "打开导航",
      resizeSidebar: "调整侧栏宽度"
    },
    bookmarkView: {
      allBookmarksLabel: "全部书签",
      bookmarkAccessUnavailable: "无法访问浏览器书签。请以已安装扩展的新标签页方式打开 WeTab，并确认已启用书签权限。",
      bookmarkDescription: (domain) => `保存自 ${domain}`,
      defaultBookmarkLabel: "书签",
      defaultFolderLabel: "书签"
    },
    newTab: {
      addBookmark: "添加书签",
      addBookmarkTitle: "将书签添加到当前选中的浏览器书签文件夹。",
      addFolder: "添加文件夹",
      heroTag: "浏览器原生书签库",
      heroTitle: "WeTab 将浏览器书签变成可搜索的新标签页主页。",
      heroDescription: "浏览你已在 Chrome 中维护的文件夹层级，按标题、域名或文件夹路径搜索，并直接从新标签页打开保存的链接。",
      bookmarkSummary: "书签概览",
      breadcrumbLabel: "当前书签文件夹",
      loadingLinks: "正在加载链接",
      nativeLinks: "原生链接",
      gridEyebrow: "书签网格",
      gridSearchTitle: "搜索结果",
      gridFolderTitle: "当前文件夹",
      folderPaths: "文件夹路径",
      reload: "重新加载 WeTab",
      accessErrorTitle: "WeTab 无法读取浏览器书签",
      loadingTitle: "正在加载书签",
      loadingDescription: "WeTab 正在读取浏览器原生书签树并准备文件夹数量。",
      noMatchesTitle: "没有匹配的书签",
      noMatchesDescription: "请尝试其他搜索词，或从侧边栏选择另一个书签文件夹。",
      noBookmarksTitle: "暂无浏览器书签",
      noBookmarksDescription: "你的浏览器书签树为空。在 Chrome 中添加书签后，WeTab 会自动刷新。",
      searchPlaceholder: "搜索书签标题、域名或文件夹路径...",
      searchAriaLabel: "搜索书签",
      dailyFeed: {
        activity: {
          activeDays: (count) => `近 7 天活跃 ${count} 天`,
          acTotal: (ac, total) => `已解决 ${ac}/${total} 题`,
          configureDescription: "在设置中填写 LeetCode 用户名后显示公开做题频率。",
          last30: (count) => `近 30 天提交 ${count} 次`,
          notFoundDescription: "没有找到这个用户名的公开做题记录。",
          siteRanking: (ranking) => `排名 #${ranking}`,
          streak: (count) => `连续活跃 ${count} 天`,
          totalSubmissions: (count) => `总计提交 ${count} 次`
        },
        collapse: "折叠",
        difficulty: (difficulty, topics) => {
          const labels: Record<string, string> = {
            Easy: "简单",
            Hard: "困难",
            Medium: "中等",
            Unknown: "未知"
          };
          return [`难度：${labels[difficulty] ?? difficulty}`, ...topics.slice(0, 2)].join(" · ");
        },
        expand: "展开",
        practiceLabels: {
          core: "核心",
          stretch: "进阶",
          warmUp: "热身"
        },
        practiceMetadata: (topic, difficulty) => {
          const labels: Record<string, string> = {
            Easy: "简单",
            Hard: "困难",
            Medium: "中等"
          };
          return `${topic} · ${labels[difficulty] ?? difficulty}`;
        },
        relatedPracticeSubtitle: "热身 · 核心 · 进阶",
        relatedPracticeTitle: "相关练习",
        groups: {
          leetcode: "LeetCode"
        },
        retry: "重试",
        sources: {
          github: "GitHub 趋势",
          hackernews: "HackerNews",
          leetcode: "LeetCode 每日一题",
          leetcodeActivity: "LeetCode 活跃度"
        },
        title: "每日动态",
        topicName: (topic) => {
          const labels: Record<string, string> = {
            Array: "数组",
            BFS: "广度优先搜索",
            "Binary Search": "二分查找",
            "DFS/BFS": "深度/广度优先搜索",
            DP: "动态规划",
            Graph: "图",
            "Hash Table": "哈希表",
            "In-place": "原地算法",
            "Prefix Sum": "前缀和",
            "Sliding Window": "滑动窗口",
            String: "字符串",
            "String DP": "字符串动态规划",
            Tree: "树",
            "Two Pointers": "双指针"
          };
          return labels[topic] ?? topic;
        },
        unknownDifficulty: "未知"
      },
      deleteBookmarkConfirm: (title) => `要从浏览器书签中删除“${title}”吗？`,
      deleteFolderConfirm: (title) => `要删除文件夹“${title}”以及其中所有书签和子文件夹吗？此操作会写入浏览器书签。`,
      deleteSelectedConfirm: (count) => `要从浏览器书签中删除已选的 ${count} 个项目吗？`,
      bookmarkActions: {
        delete: "删除书签",
        edit: "编辑书签",
        open: "打开书签",
        select: "选择书签"
      },
      folderActions: {
        delete: "删除文件夹",
        edit: "重命名文件夹",
        select: "选择文件夹"
      },
      contextMenu: {
        copyTo: "复制到",
        delete: "删除",
        moveTo: "移动到",
        renameBookmark: "重命名书签",
        renameFolder: "重命名文件夹"
      },
      selection: {
        chooseFolder: "选择文件夹",
        clear: "清除",
        copyTo: "复制到...",
        delete: "删除已选",
        done: "完成",
        moveTo: "移动到...",
        select: "选择",
        selectedCount: (count) => `已选择 ${count} 个`
      },
      undo: {
        action: "撤销",
        copyComplete: (count) => `已复制 ${count} 个项目。`,
        deleteComplete: (count) => `已删除 ${count} 个项目。`,
        moveComplete: (count) => `已移动 ${count} 个项目。`
      },
      llm: {
        applied: "建议已应用。",
        apply: "应用",
        applyAll: "全部应用",
        applyError: "无法应用建议。请刷新书签后重试。",
        clear: "清除",
        confidence: (score) => `${score}% 置信度`,
        error: "无法请求分类建议。请检查 LLM 设置后重试。",
        eyebrow: "AI 建议",
        loading: "正在分类...",
        newFolderPrefix: "新建文件夹：",
        noBookmarks: "请先选择书签，或打开包含书签的文件夹后再请求建议。",
        reject: "拒绝",
        reviewTitle: "审核分类建议",
        scope: {
          cancel: "取消",
          close: "关闭 AI 范围选择",
          currentViewDescription: (count) => `当前搜索与文件夹视图中的 ${count} 个可见书签。`,
          currentViewLabel: "当前视图",
          selectedDescription: (count) => `${count} 个已选书签。可先使用多选缩小范围。`,
          selectedLabel: "已选书签",
          submit: "生成建议",
          title: "选择用于 AI 整理的书签"
        },
        status: {
          applied: "已应用",
          pending: "待处理",
          rejected: "已拒绝"
        },
        suggestionsReady: (count) => `已生成 ${count} 条建议，可开始审核。`
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
        },
        editFolder: {
          cancel: "取消",
          close: "关闭文件夹编辑器",
          folderName: "文件夹名称",
          save: "保存更改",
          title: "重命名文件夹",
          titleLabel: "书签标题",
          urlLabel: "URL"
        }
      },
      feedback: {
        close: "关闭提醒"
      },
      sidebar: {
        actionLabel: "AI 整理",
        actionTitle: "为选中书签或当前视图生成整理建议。",
        brandSubtitle: "书签主页",
        collapseFolder: (label) => `折叠${label}`,
        expandFolder: (label) => `展开${label}`,
        folderSectionLabel: "文件夹",
        navLabel: "书签文件夹"
      }
    },
    options: optionsMessages["zh-CN"],
    settings: settingsMessages["zh-CN"]
  }
};
