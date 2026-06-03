export interface OptionsMessages {
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
}

export const optionsMessages = {
  en: {
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
  } satisfies OptionsMessages,
  "zh-CN": {
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
  } satisfies OptionsMessages
} as const;
