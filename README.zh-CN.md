# vTab

vTab 是一款 **Chromium 优先的浏览器扩展**，用高密度、专业化的工作台替代默认新标签页，帮助你导航、整理并维护浏览器书签。它面向重视速度、清晰度和信息密度，而非装饰感的用户。

![新标签页](docs/images/newtab.png)

---

## 功能特性

### 📑 原生书签管理
- 完整读写 Chrome 书签 — 文件夹、子文件夹和链接以交互式侧边栏和卡片网格形式呈现。
- 直接在新标签页中 **创建**、**编辑**、**删除**和**移动**书签与文件夹。
- **拖拽排序** — 将书签拖入文件夹、调整顺序、重构书签树。
- **文件夹侧边栏** — 支持折叠嵌套、宽度拖拽调节、"查看全部"快捷切换。

### 🔍 强大的搜索
- 实时搜索书签的 **标题**、**URL/域名**和**文件夹路径**。
- 面包屑导航显示当前在书签树中的位置。
- 键盘快捷键（`Ctrl/Cmd + A`）全选可见项。

### 🎯 批量选择与操作
- **框选** — 按住拖拽以扫选书签或文件夹。
- **Shift-click** 范围选择，**Ctrl/Cmd-click** 累加选择。
- **批量移动**、**复制**和**删除**，支持撤销。
- 右键菜单提供快捷操作。

### 🔗 链接健康检测
- 验证书签 URL 是否可访问 — 以**已验证** / **离线** / **未检查**状态徽章展示。
- **定时验证**在后台自动运行（可配置间隔：15 分钟至 24 小时，可选全量或指定文件夹）。
- 手动"检查可见链接"按钮，按需验证。

### 🤖 LLM 智能整理（可选）
- 连接任意 **兼容 OpenAI 的 API** 提供商（通过 Ollama / LM Studio 运行本地模型，或 OpenAI 等）。
- 请求 **AI 分类建议**，自动将书签整理到对应文件夹。
- 所有建议 **需审核** 后才应用 — 未经你明确批准，不会对书签做任何更改。
- 一键应用、拒绝或批量接受建议。
- 在主动触发建议请求之前，**不会发送任何书签数据**。

### 🎨 Digital Air 设计系统
- **Token 优先**的 CSS 架构，使用 OKLCH 色彩空间确保明/暗主题精准渲染。
- **浅色**、**深色**和**跟随系统**三种主题模式。
- 高密度、高信息含量的布局配合精确的字体排印尺度。
- "玻璃面板"美学、聚焦环和微交互动效。
- 响应式适配至 620px — 移动端侧边栏、自适应网格。

### 🌐 国际化
- 内置 **英文**（en）和**中文**（zh-CN）。
- 自动检测浏览器 UI 语言；用户偏好可持久化并即时生效。

---

## 用户指南

### 下载

预编译的 vTab 扩展包可从 **[GitHub Releases](https://github.com/weilong/vtab/releases)** 页面获取。

每个发布版包含一个 `.zip` 文件（`vtab-<version>.zip`），内含完整构建的扩展，可直接侧载到浏览器使用。

> ⚠️ vTab 目前通过**侧载**方式安装（需要 Chrome 开发者模式）。后续版本将计划上架 Chrome 网上应用店。

### 安装到浏览器

1. 从 [Releases](https://github.com/weilong/vtab/releases) 页面下载最新的 `vtab-<version>.zip`。
2. 将压缩包解压到电脑上的一个文件夹。
3. 打开 Chrome / Edge / Brave，访问 `chrome://extensions`。
4. 开启右上角的**开发者模式**。
5. 点击**加载已解压的扩展程序**，选择刚刚解压的文件夹。
6. 打开一个新标签页 — vTab 应该已经作为你的主页生效了。

> 💡 **小技巧：** 你也可以直接在 `chrome://extensions` 页面（开发者模式开启状态下）把 `.zip` 文件拖进去 — Chrome 会自动解压并加载。

### 使用说明

安装 vTab 后，每个新标签页都会显示你的书签工作台：

| 操作 | 方法 |
|---|---|
| **浏览文件夹** | 点击左侧边栏中的文件夹，书签网格会自动过滤显示该文件夹中的内容。 |
| **搜索书签** | 在顶部搜索栏输入 — 结果会实时匹配书签的标题、URL 和文件夹路径。 |
| **打开书签** | 点击任意书签卡片，在当前标签页中打开链接。 |
| **在新标签页打开** | 鼠标中键点击，或 Ctrl/Cmd + 点击书签卡片。 |
| **创建书签** | 点击右下角的 **+** 浮动按钮，填写标题和 URL，保存即可。 |
| **创建文件夹** | 在侧边栏中右键 → 选择父文件夹 → 填写名称保存。 |
| **编辑书签/文件夹** | 悬停在卡片上 → 点击出现的 ✏️ 图标，或右键选择**编辑**。 |
| **删除** | 悬停在卡片上 → 点击 🗑️ 图标，或右键 → **删除**，确认对话框后完成。 |
| **移动项目** | 将书签拖拽到侧边栏的文件夹上，或右键 → **移动到** → 选择目标文件夹。 |
| **多选** | 按住鼠标拖拽框选，或按住 Shift/Ctrl 依次点击。选中后底部会显示批量操作按钮。 |
| **检查链接健康** | 点击顶部工具栏的**盾牌图标**，验证当前可见的链接是否可访问。 |
| **切换主题** | 使用侧边栏底部的主题选择器（浅色 / 深色 / 跟随系统）。 |
| **打开设置** | 点击侧边栏的 ⚙️ 齿轮图标，或右键扩展图标 → **选项**。 |
| **LLM 建议** | 先在设置页中配置 LLM 提供商。然后选中书签（或保持全量可见），点击侧边栏的**建议**按钮。审核建议后再决定应用或拒绝。 |
| **撤销** | 删除或移动后，右上角会出现提示条，带有**撤销**按钮。 |

---

## 开发者指南

### 环境要求

- **Node.js** 22+
- **npm** 10+
- 基于 **Chromium 的浏览器**（Chrome、Edge、Brave 等）

### 安装依赖

```bash
# 克隆仓库
git clone <仓库地址>
cd vtab

# 安装依赖
npm install
```

### 开发服务器（热重载）

```bash
npm run dev
```

启动 WXT 开发服务器，自动打开一个已加载 vTab 为未打包扩展的 Chromium 窗口。**源文件变更后扩展会实时热重载** — 无需手动刷新。

开发服务器的构建产物输出至 `.output/chrome-mv3-dev/`。

### 生产构建

```bash
npm run build
```

在 `.output/chrome-mv3/` 下生成优化后的生产构建版本。当你准备测试接近生产环境的版本或打包分发时使用。

### 加载未打包的扩展（手动）

如果开发服务器没有自动加载，或你想手动加载特定的构建版本：

1. 打开 `chrome://extensions`。
2. 开启**开发者模式**（右上角）。
3. 点击**加载已解压的扩展程序**。
4. 选择 `.output/chrome-mv3-dev/`（开发版）或 `.output/chrome-mv3/`（生产版）。

### 打包分发

```bash
npm run zip
```

在 `.output/` 下生成 `.zip` 文件，可用于侧载或提交至 Chrome 网上应用店。

### 测试

```bash
# 运行单元测试（Vitest）
npm run test

# 运行端到端测试（Playwright）
npm run test:e2e
```

### 代码质量

```bash
# 代码检查（零警告策略）
npm run lint

# TypeScript 类型检查
npm run typecheck
```

### 清理生成文件

```bash
npm run clean
```

移除 `.output/` 等生成的目录。

---

## 脚本参考

| 命令 | 说明 |
|---|---|
| `npm run dev` | 启动 WXT 开发服务器（热重载） |
| `npm run build` | 清理 + 生产构建 |
| `npm run zip` | 打包扩展为 `.zip` 文件 |
| `npm run test` | 运行单元测试（Vitest） |
| `npm run test:e2e` | 运行 Playwright 端到端测试 |
| `npm run lint` | ESLint 检查（零警告策略） |
| `npm run typecheck` | TypeScript 类型检查 |
| `npm run clean` | 清理生成的输出目录 |

---

## 项目结构

```
entrypoints/
├── newtab/            # 浏览器新标签页替换
├── options/           # 扩展设置（LLM 配置、主题、语言）
└── design-system/     # 仅开发环境的设计 Token 预览

src/
├── components/        # 可复用 UI 组件（AppShell、Sidebar、
│                      #   BookmarkCard、TopSearch、Button 等）
├── pages/             # 轻量页面组装（NewTabPage、OptionsPage、
│                      #   DesignSystemPage）
├── services/          # 浏览器 API 集成与业务逻辑
│   ├── bookmarkService.ts          # Chrome 书签 CRUD
│   ├── llmConfigService.ts         # LLM 提供商设置
│   ├── llmSuggestionService.ts     # AI 分类建议
│   ├── urlValidationService.ts     # 链接健康检测
│   ├── themePreferenceService.ts   # 主题持久化
│   └── languageService.ts          # 国际化持久化
├── hooks/             # React Hooks（useI18n、useThemePreference 等）
├── styles/
│   ├── tokens.css     # 设计 Token（颜色、字体、间距等）
│   └── global.css     # 共享组件与布局样式
├── types/             # TypeScript 视图模型类型
├── data/              # 开发预览用示例数据
├── i18n/              # 国际化消息（英文、中文）
└── testing/           # 测试设置与浏览器模拟

tests/
└── e2e/               # Playwright 端到端测试
```

---

## 配置说明

### LLM 提供商

打开**选项页**（右键扩展图标 → 选项，或访问 `chrome-extension://<id>/options.html`）进行配置：

| 字段 | 说明 |
|---|---|
| **Base URL** | 兼容 OpenAI 的 API 地址（例如 `https://api.openai.com/v1` 或本地 Ollama 的 `http://localhost:11434/v1`） |
| **API Key** | 你的 API 密钥 |
| **Model** | 模型标识（例如 `gpt-4o-mini`、`llama3.2`） |

使用**测试连接**按钮验证配置，此时不会触碰你的书签。只有在主动请求建议时才会发送书签数据。

### 主题

在侧边栏的主题选择器中切换**浅色**、**深色**或**跟随系统**。主题偏好会持久保存。

### 语言

在选项页中选择**英文**或**中文**。扩展在首次访问时会自动检测浏览器 UI 语言。

### 链接验证定时

在选项页中启用定时链接检查，可让 vTab 在后台按指定间隔（15 分钟 / 1 小时 / 6 小时 / 24 小时）自动重新验证书签 URL。可选限制仅检查特定文件夹。

---

## 权限说明

vTab 需要以下 Chrome 权限：

| 权限 | 用途 |
|---|---|
| `bookmarks` | 读写浏览器的原生书签 |
| `favicon` | 在书签卡片上显示网站图标 |
| `storage` | 持久化设置（主题、语言、LLM 配置、验证状态） |
| `http://*/*` / `https://*/*` | 验证书签 URL 是否可访问 |

默认情况下所有数据都保存在本地。仅当你**主动请求**时，数据才会发送至 LLM 提供商。

---

## 架构亮点

### 设计系统 — Token 优先

颜色、字体排印、间距、圆角和阴影均以 CSS 自定义属性定义在 `tokens.css` 中。OKLCH 颜色函数确保浅色和深色调色板在视觉上均匀一致。主题系统（`light` / `dark` / `system`）通过 `data-theme` 属性切换整套 Token。

### 组件复用

页面通过组合现有组件来实现，而非定义新的视觉体系。组件通过聚焦的 props 和 `className` 支持变体组合。设计系统预览页面可独立验证每个 Token 和组件。

### 服务层

浏览器 API（`chrome.bookmarks`、`chrome.storage`）被隔离在服务模块（`src/services/`）之后。React 组件从不直接调用浏览器 API — 这提高了可测试性，并使表现层与平台解耦。

---

## 技术栈

| 层 | 技术 |
|---|---|
| 框架 | [WXT](https://wxt.dev/) + React 19 |
| 语言 | TypeScript 5.7 |
| 构建 | Vite 6 |
| 样式 | CSS 自定义属性 + OKLCH Token |
| 图标 | Lucide React |
| 测试 | Vitest（单元）+ Playwright（E2E） |
| 代码检查 | ESLint 10 |

---

## 许可证

MIT
