export interface SettingsMessages {
  openButton: string;
  title: string;
  description: string;
  close: string;
  languageTitle: string;
  languageHelp: string;
  languageLabel: string;
  languageDescription: string;
  leetcodeTitle: string;
  leetcodeHelp: string;
  leetcodeRegionLabel: string;
  leetcodeRegionDescription: string;
  leetcodeRegionOptions: {
    com: string;
    cn: string;
  };
  leetcodeUsernameLabel: string;
  leetcodeUsernamePlaceholder: string;
  leetcodeUsernameDescription: string;
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
}

export const settingsMessages = {
  en: {
    openButton: "Open settings",
    title: "Settings",
    description: "Configure WeTab behavior, appearance, and bookmark automation from one place.",
    close: "Close settings",
    languageTitle: "Language",
    languageHelp: "Stored locally and applied across extension pages.",
    languageLabel: "Display language",
    languageDescription: "Choose the language used for WeTab interface text. Bookmark titles and folder names are left unchanged.",
    leetcodeTitle: "LeetCode activity",
    leetcodeHelp: "Optional. WeTab reads only public LeetCode profile activity, never submission code or cookies.",
    leetcodeRegionLabel: "LeetCode region",
    leetcodeRegionDescription: "Choose leetcode.com for global accounts or leetcode.cn for China-region accounts.",
    leetcodeRegionOptions: {
      com: "leetcode.com (Global)",
      cn: "leetcode.cn (China)"
    },
    leetcodeUsernameLabel: "LeetCode username",
    leetcodeUsernamePlaceholder: "username",
    leetcodeUsernameDescription: "Used for the Daily Feed activity card.",
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
  } satisfies SettingsMessages,
  "zh-CN": {
    openButton: "打开设置",
    title: "设置",
    description: "在同一处配置 WeTab 的行为、外观和书签自动化。",
    close: "关闭设置",
    languageTitle: "语言",
    languageHelp: "本地保存，并应用到所有扩展页面。",
    languageLabel: "显示语言",
    languageDescription: "选择 WeTab 界面文本使用的语言。书签标题和文件夹名称保持不变。",
    leetcodeTitle: "LeetCode 活跃度",
    leetcodeHelp: "可选。WeTab 只读取公开的 LeetCode 主页活跃度，不读取提交代码或 cookie。",
    leetcodeRegionLabel: "LeetCode 区域",
    leetcodeRegionDescription: "全球账号选择 leetcode.com，中国区账号选择 leetcode.cn。",
    leetcodeRegionOptions: {
      com: "leetcode.com (全球)",
      cn: "leetcode.cn (中国)"
    },
    leetcodeUsernameLabel: "LeetCode 用户名",
    leetcodeUsernamePlaceholder: "用户名",
    leetcodeUsernameDescription: "用于 Daily Feed 的活跃度卡片。",
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
    scheduleScopeDescription:
      "选择定时检查是扫描全部书签，还是扫描某个文件夹内的书签。文件夹选择会保存在这里，不再依赖主界面的当前选中项。",
    scheduleScopeAll: "全部书签",
    scheduleScopeFolder: "指定文件夹",
    scheduleFolderLabel: "检查文件夹",
    scheduleFolderPlaceholder: "选择文件夹",
    scheduleFolderRequired: "请先选择文件夹，再使用指定文件夹范围。"
  } satisfies SettingsMessages
} as const;
