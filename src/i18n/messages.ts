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
  options: {
    tag: string;
    title: string;
    description: string;
    providerTitle: string;
    providerHelp: string;
    testConnection: string;
    testingConnection: string;
    baseUrl: string;
    apiKey: string;
    model: string;
    providerStatus: {
      invalidBaseUrl: string;
      loading: string;
      saveError: string;
      saved: string;
      saving: string;
      testError: string;
      testSuccess: string;
    };
    dataSentTitle: string;
    dataSentDescription: string;
    languageTitle: string;
    languageHelp: string;
    languageLabel: string;
    languageDescription: string;
  };
  settings: {
    openButton: string;
    title: string;
    description: string;
    close: string;
    languageTitle: string;
    languageHelp: string;
    languageLabel: string;
    languageDescription: string;
    themeTitle: string;
    themeHelp: string;
    themeLabel: string;
    themeDescription: string;
    themeModes: {
      light: string;
      dark: string;
      system: string;
    };
    providerTitle: string;
    providerHelp: string;
    testConnection: string;
    testingConnection: string;
    baseUrl: string;
    apiKey: string;
    model: string;
    providerStatus: {
      invalidBaseUrl: string;
      loading: string;
      saveError: string;
      saved: string;
      saving: string;
      testError: string;
      testSuccess: string;
    };
    dataSentTitle: string;
    dataSentDescription: string;
    scheduleTitle: string;
    scheduleHelp: string;
    scheduleEnabledLabel: string;
    scheduleIntervalLabel: string;
    scheduleScopeLabel: string;
    scheduleScopeDescription: string;
    scheduleScopeAll: string;
    scheduleScopeFolder: string;
    scheduleFolderLabel: string;
    scheduleFolderPlaceholder: string;
    scheduleFolderRequired: string;
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
    options: {
      tag: "Options",
      title: "LLM configuration",
      description:
        "Configure an OpenAI-compatible provider before requesting bookmark organization suggestions. No bookmark data is sent until you explicitly test or run an AI action.",
      providerTitle: "Provider",
      providerHelp: "Stored locally with extension settings.",
      testConnection: "Test connection",
      testingConnection: "Testing...",
      baseUrl: "Base URL",
      apiKey: "API key",
      model: "Model",
      providerStatus: {
        invalidBaseUrl: "Enter an HTTP or HTTPS base URL before testing the connection.",
        loading: "Loading saved provider settings...",
        saveError: "Unable to save provider settings. Try again from the extension options page.",
        saved: "Provider settings saved.",
        saving: "Saving provider settings...",
        testError: "Connection test failed. Check the base URL, API key, and model.",
        testSuccess: "Connection test succeeded. No bookmark data was sent."
      },
      dataSentTitle: "Data sent for classification",
      dataSentDescription:
        "WeTab may send selected bookmark titles, URLs, and folder paths to the configured provider only when you request suggestions. Suggestions remain reviewable before any browser bookmark changes are written.",
      languageTitle: "Language",
      languageHelp: "Stored locally and applied to extension pages.",
      languageLabel: "Display language",
      languageDescription: "Choose the language used for WeTab interface text. Bookmark titles and folder names are left unchanged."
    },
    settings: {
      openButton: "Open settings",
      title: "Settings",
      description: "Configure WeTab behavior, appearance, and bookmark automation from one place.",
      close: "Close settings",
      languageTitle: "Language",
      languageHelp: "Stored locally and applied across extension pages.",
      languageLabel: "Display language",
      languageDescription: "Choose the language used for WeTab interface text. Bookmark titles and folder names are left unchanged.",
      themeTitle: "Theme",
      themeHelp: "Stored locally and applied across extension pages.",
      themeLabel: "Appearance mode",
      themeDescription: "Pick a light, dark, or browser/system-following appearance for the extension UI.",
      themeModes: {
        light: "Light",
        dark: "Dark",
        system: "Follow browser/system"
      },
      providerTitle: "LLM provider",
      providerHelp: "Stored locally with extension settings.",
      testConnection: "Test connection",
      testingConnection: "Testing...",
      baseUrl: "Base URL",
      apiKey: "API key",
      model: "Model",
      providerStatus: {
        invalidBaseUrl: "Enter an HTTP or HTTPS base URL before testing the connection.",
        loading: "Loading saved provider settings...",
        saveError: "Unable to save provider settings. Try again from the settings modal.",
        saved: "Provider settings saved.",
        saving: "Saving provider settings...",
        testError: "Connection test failed. Check the base URL, API key, and model.",
        testSuccess: "Connection test succeeded. No bookmark data was sent."
      },
      dataSentTitle: "Data sent for classification",
      dataSentDescription:
        "WeTab may send selected bookmark titles, URLs, and folder paths to the configured provider only when you request suggestions. Suggestions remain reviewable before any browser bookmark changes are written.",
      scheduleTitle: "Scheduled link checks",
      scheduleHelp: "Automatically recheck bookmark links while WeTab is open.",
      scheduleEnabledLabel: "Enable scheduled checks",
      scheduleIntervalLabel: "Check interval",
      scheduleScopeLabel: "Scope",
      scheduleScopeDescription: "Choose whether scheduled checks inspect all bookmarks or bookmarks inside one folder. Folder choices are saved here and do not depend on the current page selection.",
      scheduleScopeAll: "All bookmarks",
      scheduleScopeFolder: "Specific folder",
      scheduleFolderLabel: "Folder to check",
      scheduleFolderPlaceholder: "Choose a folder",
      scheduleFolderRequired: "Choose a folder before using the folder scope."
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
    options: {
      tag: "选项",
      title: "LLM 配置",
      description: "在请求书签整理建议前，先配置兼容 OpenAI 的服务提供方。除非你主动测试或运行 AI 操作，否则不会发送书签数据。",
      providerTitle: "服务提供方",
      providerHelp: "随扩展设置保存在本地。",
      testConnection: "测试连接",
      testingConnection: "测试中...",
      baseUrl: "基础 URL",
      apiKey: "API 密钥",
      model: "模型",
      providerStatus: {
        invalidBaseUrl: "请输入 HTTP 或 HTTPS 基础 URL 后再测试连接。",
        loading: "正在加载已保存的服务配置...",
        saveError: "无法保存服务配置。请在扩展选项页重试。",
        saved: "服务配置已保存。",
        saving: "正在保存服务配置...",
        testError: "连接测试失败。请检查基础 URL、API 密钥和模型。",
        testSuccess: "连接测试成功。未发送任何书签数据。"
      },
      dataSentTitle: "用于分类的数据",
      dataSentDescription:
        "只有当你请求建议时，WeTab 才可能把选中的书签标题、URL 和文件夹路径发送给已配置的服务提供方。所有建议都需要先审核，才会写入浏览器书签。",
      languageTitle: "语言",
      languageHelp: "保存在本地，并应用到扩展页面。",
      languageLabel: "显示语言",
      languageDescription: "选择 WeTab 界面文本使用的语言。书签标题和文件夹名称不会被翻译。"
    },
    settings: {
      openButton: "打开设置",
      title: "设置",
      description: "在同一处配置 WeTab 的行为、外观和书签自动化。",
      close: "关闭设置",
      languageTitle: "语言",
      languageHelp: "本地保存，并应用到所有扩展页面。",
      languageLabel: "显示语言",
      languageDescription: "选择 WeTab 界面文本使用的语言。书签标题和文件夹名称保持不变。",
      themeTitle: "主题",
      themeHelp: "本地保存，并应用到所有扩展页面。",
      themeLabel: "外观模式",
      themeDescription: "为扩展界面选择浅色、暗色或跟随浏览器/系统的外观。",
      themeModes: {
        light: "浅色",
        dark: "暗色",
        system: "跟随浏览器/系统"
      },
      providerTitle: "LLM 提供方",
      providerHelp: "随扩展设置本地保存。",
      testConnection: "测试连接",
      testingConnection: "正在测试...",
      baseUrl: "Base URL",
      apiKey: "API key",
      model: "模型",
      providerStatus: {
        invalidBaseUrl: "请先输入 HTTP 或 HTTPS 的 Base URL 再测试连接。",
        loading: "正在加载已保存的提供方设置...",
        saveError: "无法保存提供方设置。请在设置弹窗中重试。",
        saved: "提供方设置已保存。",
        saving: "正在保存提供方设置...",
        testError: "连接测试失败。请检查 Base URL、API key 和模型。",
        testSuccess: "连接测试成功。未发送任何书签数据。"
      },
      dataSentTitle: "分类时发送的数据",
      dataSentDescription:
        "只有在你请求建议时，WeTab 才会把选中的书签标题、URL 和文件夹路径发送给已配置的提供方。任何建议在写入浏览器书签变更前都可以继续审核。",
      scheduleTitle: "定时链接检查",
      scheduleHelp: "在 WeTab 打开时自动重新检查书签链接是否有效。",
      scheduleEnabledLabel: "启用定时检查",
      scheduleIntervalLabel: "检查间隔",
      scheduleScopeLabel: "范围",
      scheduleScopeDescription: "选择定时检查是扫描全部书签，还是扫描某个文件夹内的书签。文件夹选择会保存在这里，不再依赖主界面的当前选中项。",
      scheduleScopeAll: "全部书签",
      scheduleScopeFolder: "指定文件夹",
      scheduleFolderLabel: "检查文件夹",
      scheduleFolderPlaceholder: "选择文件夹",
      scheduleFolderRequired: "请先选择文件夹，再使用指定文件夹范围。"
    }
  }
};
