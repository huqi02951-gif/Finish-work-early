# Finish Work Early — 测试文档

## 1. 项目概述

### 1.1 项目简介

"Finish Work Early" 是一个面向银行一线客户经理的 Agent + Skills 平台。通过将实战经验沉淀为可复用的数字技能，实现业务流程标准化，提升客户经理在客户沟通、内部审批、材料准备等环节的作业效率。

### 1.2 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| 框架 | React | 19.2.0 |
| 构建工具 | Vite | 6.2.0 |
| 语言 | TypeScript | ~5.8.2 |
| 路由 | React Router DOM | 7.14.0 |
| 样式 | Tailwind CSS | 4.2.2 |
| 动画 | Framer Motion | 12.23.24 |
| 3D 渲染 | Three.js + React Three Fiber | 0.181.1 / 9.4.0 |
| 本地数据库 | Dexie (IndexedDB) | 4.4.2 |
| AI 集成 | Google GenAI | 1.48.0 |
| 文档导出 | docx, xlsx, file-saver | 9.6.1 / 0.18.5 / 2.0.5 |
| UI 图标 | lucide-react | 0.553.0 |
| 农历计算 | lunar-javascript | 1.7.7 |
| Markdown | react-markdown | 10.1.0 |

### 1.3 项目结构

```
Finish-work-early/
├── components/                    # 主页面与工具组件
│   ├── Home.tsx                   #   首页（营销版，带 Hero/场景/Skills 展示）
│   ├── Layout.tsx                 #   全局布局（导航栏、面包屑、底部导航、页脚）
│   ├── SkillsLibrary.tsx          #   Skills 工具库（搜索+筛选）
│   ├── UpdateLog.tsx              #   更新记录中心
│   ├── UsageInstructions.tsx      #   使用说明
│   ├── Feedback.tsx               #   反馈/共创
│   ├── ScenarioCenter.tsx         #   场景中心
│   ├── SkillDetail.tsx            #   Skill 详情页
│   ├── MaterialChecklistCenter.tsx #  材料清单中心
│   ├── BBSCenter.tsx              #   BBS 交流中心
│   ├── shared/                    #   共享小组件
│   │   └── ActionBar.tsx          #     操作栏
│   └── tools/                     #   业务工具
│       ├── AcceptanceCalculator.tsx    # 银承/存单测算
│       ├── RateOfferTool.tsx           # 利率优惠签报生成
│       ├── FeeDiscountTool.tsx         # 中收优惠生成器
│       ├── NewsTypesettingAssistant.tsx # 宣传稿排版助手
│       ├── SensitiveCommAssistant.tsx  # 敏感沟通助手
│       ├── BatchBillingTool.tsx        # 项下开票批量生成
│       ├── BusinessGuide.tsx           # 业务通（产品打法库）
│       └── ToMyselfSpace.tsx           # 对自己空间
├── src/
│   ├── App.tsx                    # 路由配置（HashRouter）
│   ├── main.tsx                   # 入口（ErrorBoundary + CustomerProvider）
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx      #   轻量应用布局（顶部栏+底部导航）
│   │   │   └── CyberLayout.tsx    #   Cyber 风格布局
│   │   └── common/
│   │       └── InitialBadge.tsx   #     头像缩写徽章
│   ├── pages/
│   │   ├── Home.tsx               #   首页（轻量版，ChatGPT 风格）
│   │   ├── Feed.tsx               #   动态 Feed 流
│   │   ├── Messages.tsx           #   消息中心
│   │   ├── Profile.tsx            #   个人中心
│   │   ├── Publish.tsx            #   发布内容
│   │   ├── Workspace.tsx          #   工作台
│   │   └── community/
│   │       ├── BBS.tsx            #     BBS 主页
│   │       ├── CommunityThread.tsx #    社区帖子
│   │       ├── CommunityTopic.tsx  #    社区话题
│   │       ├── FormalThread.tsx    #    正式帖子
│   │       └── FormalTopic.tsx     #    正式话题
│   ├── services/
│   │   └── api.ts                 # API 服务层（当前为 Mock + 本地 DB）
│   ├── mock/
│   │   └── data.ts                # Mock 数据
│   ├── types/
│   │   └── index.ts               # 类型定义（User, Post, Comment 等）
│   └── styles/
│       └── global.css             # 全局样式
├── constants/
│   └── skills.ts                  # Skills 全量数据（28 个 Skill）
├── data/
│   └── checklistData.ts           # 柜面业务材料清单数据（开户/销户/变更/授信）
├── lib/
│   ├── utils.ts                   # cn() 工具函数（clsx + tailwind-merge）
│   ├── localDB.ts                 # Dexie 本地数据库封装
│   ├── CustomerContext.tsx        # 全局客户上下文（localStorage 持久化）
│   ├── exportDocx.ts              # Word 文档导出工具
│   ├── localSignals.ts            # 本地信号/状态管理
│   └── community.ts               # 社区功能工具函数
├── types.ts                       # Skill 类型定义
├── index.html                     # HTML 入口
├── vite.config.ts                 # Vite 配置
└── skills/
    └── product_rm_expert.md       # 产品 RM 专家 Skill 定义
```

---

## 2. 路由总览

项目使用 `HashRouter`，所有路由以 `#` 开头。

| 路由 | 组件 | 描述 |
|------|------|------|
| `#/` | `HomePage` (src) | 首页（轻量版，ChatGPT 风格四宫格） |
| `#/` | `Home` (components) | 首页（营销版，Hero + 场景 + Skills 展示） |
| `#/scenarios` | `ScenarioCenter` | 场景中心（四大场景导航） |
| `#/skills` | `SkillsLibrary` | Skills 工具库（搜索+筛选列表） |
| `#/skills/:id` | `SkillDetail` | Skill 详情页 |
| `#/rate-offer` | `RateOfferTool` | 利率优惠签报智能生成 |
| `#/acceptance-calculator` | `AcceptanceCalculator` | 银承/存单测算小助手 |
| `#/fee-discount` | `FeeDiscountTool` | 中收优惠生成器 |
| `#/news-assistant` | `NewsTypesettingAssistant` | 宣传稿排版助手 |
| `#/sensitive-comm` | `SensitiveCommAssistant` | 敏感沟通助手 |
| `#/batch-billing` | `BatchBillingTool` | 项下开票批量生成 |
| `#/business-guide` | `BusinessGuide` | 业务通（产品打法库） |
| `#/material-checklist` | `MaterialChecklistCenter` | 材料清单中心 |
| `#/updates` | `UpdateLog` | 更新记录中心 |
| `#/feedback` | `Feedback` | 反馈/共创 |
| `#/instructions` | `UsageInstructions` | 使用说明 |
| `#/bbs` | `BBSPage` | BBS 交流主页 |
| `#/bbs/thread/:id` | `CommunityThreadPage` | 社区帖子详情 |
| `#/bbs/topic/:id` | `CommunityTopicPage` | 社区话题详情 |
| `#/workspace` | `WorkspacePage` | 工作台 |
| `#/profile` | `ProfilePage` | 个人中心 |
| `#/feed` | `FeedPage` | 动态 Feed 流 |
| `#/publish` | `PublishPage` | 发布内容 |
| `#/messages` | `MessagesPage` | 消息中心 |
| `#/formal/thread/:id` | `FormalThreadPage` | 正式帖子 |
| `#/formal/topic/:id` | `FormalTopicPage` | 正式话题 |
| `#/*` | `NotFoundPage` | 404 页面 |

---

## 3. 核心模块测试

### 3.1 数据层 (lib/)

#### 3.1.1 本地数据库 — `localDB.ts`

**数据库名称**: `FinishWorkEarlyDB` (IndexedDB via Dexie)

**表结构**:

| 表名 | 字段 | 索引 |
|------|------|------|
| `drafts` | id, toolId, title, data, createdAt, updatedAt | toolId, updatedAt |
| `artifacts` | id, toolId, title, content, metadata, createdAt | toolId, createdAt |
| `exports` | id, artifactId, toolId, format, filename, createdAt | toolId, createdAt |
| `posts` | id, type, title, content, author, likes, metadata, createdAt | type, createdAt |
| `workspace` | id, type, refId, toolId, title, preview, createdAt | toolId, type, createdAt |

**测试点**:

| 测试项 | 输入 | 预期输出 |
|--------|------|----------|
| `saveDraft` 新增 | toolId='test', title='草稿1', data={a:1} | 数据库新增一条记录 |
| `saveDraft` 更新 | 相同 toolId + title | 更新已有记录的 data 和 updatedAt |
| `saveArtifact` | toolId='test', title='产物', content='...' | 数据库新增 artifact |
| `logExport` | toolId='test', format='docx', filename='a.docx' | 数据库新增 export 记录 |
| `getRecentArtifacts` 全部 | 无参数 | 返回所有 artifact，按 createdAt 倒序，最多 20 条 |
| `getRecentArtifacts` 按工具 | toolId='rate-offer' | 仅返回该工具的 artifact |
| `getDrafts` | toolId='sensitive-comm' | 返回该工具的草稿，按 updatedAt 倒序 |
| `saveLocalPost` + `getLocalPosts` | type='feed' | 保存后可按 type 查询 |
| 数据库版本升级 | 新增字段 | Dexie version 正确迁移 |

#### 3.1.2 客户上下文 — `CustomerContext.tsx`

| 测试项 | 输入 | 预期输出 |
|--------|------|----------|
| 初始化无数据 | localStorage 无数据 | customer 为空对象，hasCustomer=false |
| 初始化有数据 | localStorage 存在保存的数据 | customer 自动恢复，hasCustomer=true |
| setCustomer | {name:'A公司'} | customer.name='A公司'，同步到 localStorage |
| setCustomer 合并 | 已有 name='A公司'，调用 {phone:'123'} | name 保留，phone 新增 |
| clearCustomer | 调用 clearCustomer() | 重置为空对象，localStorage 清除 |
| hasCustomer 判断 | name 为空字符串 | hasCustomer=false |
| hasCustomer 判断 | name 有值 | hasCustomer=true |

#### 3.1.3 API 服务层 — `api.ts`

| 测试项 | 输入 | 预期输出 |
|--------|------|----------|
| `getCurrentUser` | 无 | 返回 MOCK_USER |
| `getPosts` 全部 | 无 category | 返回本地 posts + MOCK_POSTS，按时间倒序 |
| `getPosts` 按分类 | category='政策解读' | 仅返回该分类的 posts |
| `getPostById` | id='p1' | 返回对应 post |
| `getPostById` | id='不存在' | 返回 undefined |
| `createPost` | {title:'新帖', content:'内容'} | 保存到 IndexedDB，返回新 post 对象 |
| `getNotifications` | 无 | 返回 MOCK_NOTIFICATIONS |
| `markNotificationAsRead` | id='n1' | 无报错 |

#### 3.1.4 工具函数 — `utils.ts`

| 测试项 | 输入 | 预期输出 |
|--------|------|----------|
| `cn` 单值 | 'bg-red-500' | 'bg-red-500' |
| `cn` 多值合并 | 'bg-red-500', 'text-white' | 'bg-red-500 text-white' |
| `cn` 冲突覆盖 | 'bg-red-500 bg-blue-500' | 'bg-blue-500'（tailwind-merge 处理） |
| `cn` 条件类名 | 'base', false && 'hidden' | 'base' |

### 3.2 常量与数据 — constants/ & data/

#### 3.2.1 Skills 数据 — `skills.ts`

| 测试项 | 预期 |
|--------|------|
| SKILLS 数组长度 | 28 个 Skill |
| 每个 Skill 必填字段 | id, name, category, scene, audience, input, output, form, status, description |
| id 唯一性 | 所有 id 不重复 |
| status 值校验 | 只能是 '在线可用' | '需后端支持' | '本地工具' | '开发中' | '开发中/能力介绍' 之一 |
| marketingGuide 结构 | 如存在，须包含 framework, understanding, industryFocus 等全部字段 |
| toolRoute 格式 | 如存在，须以 '/' 开头 |

#### 3.2.2 材料清单数据 — `checklistData.ts`

| 测试项 | 预期 |
|--------|------|
| COUNTER_BUSINESS 结构 | 包含开户、销户、变更、特殊业务四大类 |
| CREDIT_BUSINESS 结构 | 包含低风险类、工商类、小企业类 |
| 动态日期 | getDynamicDates() 返回的日期随当前时间自动计算 |
| scriptTemplate 调用 | 传入参数后返回非空字符串 |
| requiredInfo 结构 | COMMON_REQUIRED_INFO 中每项包含 title 和 items |

### 3.3 布局组件

#### 3.3.1 全局布局 — `Layout.tsx` (components/)

| 测试项 | 预期 |
|--------|------|
| 导航栏滚动效果 | 未滚动时 bg-transparent，滚动后 bg-white/80 + backdrop-blur |
| 桌面端导航 | 宽度 > 1024px 时显示完整导航链接 + "立即体验" 按钮 |
| 移动端汉堡菜单 | 宽度 < 1024px 时显示汉堡按钮，点击弹出侧边抽屉 |
| 移动端底部导航 | 始终显示（首页/场景/工具/反馈 四个 tab） |
| 面包屑 | 非首页显示当前路径，点击可回退 |
| 高亮当前页面 | 导航项与当前路径匹配时高亮 |
| Footer | 始终显示品牌信息、标语、Live Status |

#### 3.3.2 轻量应用布局 — `AppLayout.tsx` (src/)

| 测试项 | 预期 |
|--------|------|
| 顶部栏 | 显示标题 + 返回首页/返回按钮 + 个人头像 |
| showBack=true | 显示返回箭头，点击 navigate(-1) |
| showBack=false | 显示 Home 图标，点击跳转 / |
| 底部导航 | 首页/仓库/工作台/我的 四个 tab |
| 当前 tab 高亮 | 路径匹配时 icon 放大、颜色变深 |
| 页面进入动画 | 子组件带 fade-in + slide-up 动画 |

### 3.4 页面组件

#### 3.4.1 首页

**轻量版** (`src/pages/Home.tsx`):

| 测试项 | 预期 |
|--------|------|
| 四宫格场景 | 显示 对客户/对审查/对中后台/对自己 四个卡片 |
| 卡片点击 | 跳转到对应的 `#/scenarios?tab=xxx` |
| 响应式布局 | 移动端 2 列，桌面端 4 列 |
| 动画效果 | 页面加载时卡片依次淡入 |

**营销版** (`components/Home.tsx`):

| 测试项 | 预期 |
|--------|------|
| Hero 区域 | 显示标题、副标题、"进入场景中心" 和 "浏览工具库" 按钮 |
| 场景卡片 | 四个场景，每个显示 Skill 数量统计 |
| 精选 Skills | 展示 4 个 Featured Skills，带状态指示灯 |
| 底部 CTA | 显示 System Console 风格的引导区域 |

#### 3.4.2 Skills 工具库 — `SkillsLibrary.tsx`

| 测试项 | 预期 |
|--------|------|
| 搜索功能 | 输入关键词，过滤 name 和 description 匹配的 Skill |
| 筛选功能 | 按状态筛选（全部/在线可用/本地工具/需后端支持/开发中/能力介绍） |
| 搜索+筛选联动 | 同时生效，结果取交集 |
| 空结果处理 | 显示 "未找到匹配的 Skills" + "重置搜索" 按钮 |
| 状态标签 | 在线可用=绿色，需后端支持=蓝色，本地工具=橙色 |
| Skill 卡片 | 显示类别、名称、描述、适用场景、核心输入 |
| 立即运行按钮 | 仅 status 包含 '在线可用' 且有 toolRoute 时显示 |

#### 3.4.3 更新记录 — `UpdateLog.tsx`

| 测试项 | 预期 |
|--------|------|
| 更新列表 | 按时间倒序显示版本记录 |
| 版本信息 | 包含日期、版本号、标题、描述、更新项列表 |
| 底部 CTA | 显示 "更多能力正在孵化中" + "提交需求建议" 按钮 |

#### 3.4.4 使用说明 — `UsageInstructions.tsx`

| 测试项 | 预期 |
|--------|------|
| 三种使用方式 | 在线网页工具、本地批量生成工具、可安装到大模型平台的 Skills |
| 每类步骤展示 | 每类展示 4 个操作步骤 |
| 注意事项 | 3 条注意事项 + 技术支持区域 |

#### 3.4.5 Feed 流 — `src/pages/Feed.tsx`

| 测试项 | 预期 |
|--------|------|
| 帖子加载 | 显示 Loading skeleton，加载完成后展示帖子 |
| 分类筛选 | 全部/政策解读/业务打法/经验分享/行业动态 |
| 搜索功能 | 搜索标题、内容、分类、作者、标签 |
| 点赞 | 点击切换点赞状态，显示数量 |
| 分享 | 复制帖子内容到剪贴板，显示成功提示 |
| 评论 | 按钮禁用（当前未开放） |
| 演示模式提示 | 顶部显示 "本地演示模式" 提示条 |

### 3.5 业务工具

#### 3.5.1 银承/存单测算小助手 — `AcceptanceCalculator.tsx`

| 测试项 | 预期 |
|--------|------|
| 输入字段 | 金额、期限、利率、保证金比例、存单利率等 |
| 计算逻辑 | 收益、成本、质押率等实时计算 |
| 结果展示 | 清晰的测算结果展示 |
| 导出功能 | 支持复制结果 |

#### 3.5.2 利率优惠签报生成 — `RateOfferTool.tsx`

| 测试项 | 预期 |
|--------|------|
| 输入字段 | 客户名称、优惠事项、EVA/标签、申请理由、审批口径等 |
| 文案生成 | 自动生成结构化签报正文 |
| 导出 | 支持复制文本、下载 Word 文件 |
| 草稿保存 | 自动保存到 IndexedDB |

#### 3.5.3 中收优惠生成器 — `FeeDiscountTool.tsx`

| 测试项 | 预期 |
|--------|------|
| 输入字段 | 申请机构、联系方式、客户名称、EVA、客户标签等 |
| 结果生成 | 生成优惠申请表 + OA 文案 |
| Excel 导出 | 下载标准 Excel 附件 |

#### 3.5.4 敏感沟通助手 — `SensitiveCommAssistant.tsx`

| 测试项 | 预期 |
|--------|------|
| 场景选择 | 收费通知、利率调整、授信暂缓等 |
| 输入字段 | 客户称呼、沟通渠道、语气风格 |
| 多版本输出 | 直接发送版、更正式版、更柔和版、电话沟通提纲版 |
| 语气调整 | 不同场景下话术风格变化明显 |

#### 3.5.5 宣传稿排版助手 — `NewsTypesettingAssistant.tsx`

| 测试项 | 预期 |
|--------|------|
| 输入字段 | 标题、栏目、落款单位、投稿人、日期、原始材料 |
| 图片支持 | 支持插入图片 |
| 导出 | 生成排版后的 Word 文件 |
| 核对清单 | 生成排版核对清单 |

#### 3.5.6 项下开票批量生成 — `BatchBillingTool.tsx`

| 测试项 | 预期 |
|--------|------|
| 输入 | 开票主体信息、合同编号、金额、多笔收款人 |
| 批量生成 | 支持多条收款人数据批量处理 |
| 导出格式 | docx / xlsx |

#### 3.5.7 业务通 — `BusinessGuide.tsx`

| 测试项 | 预期 |
|--------|------|
| 产品选择 | 长融保、长易担等产品 |
| 行业洞察 | 制造业、科技企业等行业分析 |
| 营销指引 | 展示 framework, targetCustomers, openingTalk 等完整营销指南 |
| 话术展示 | 初次触达、深入沟通、补件推进三阶段话术 |
| 产品边界 | suitable / unsuitable 清单 |
| 高频 QA | 问题、答案、内部逻辑、禁止承诺项 |

#### 3.5.8 材料清单中心 — `MaterialChecklistCenter.tsx`

| 测试项 | 预期 |
|--------|------|
| 业务类型选择 | 柜面业务（开户/销户/变更/特殊） + 授信业务（低风险/工商/小企业） |
| 清单展示 | 每项显示材料名称、格式要求、备注 |
| 经理提醒 | 显示关键注意事项 |
| 话术模板 | 自动生成对客沟通话术 |
| 信息收集 | 展示需要客户填写的经营信息项 |
| 导出 | 支持 Word/Excel 导出 |

### 3.6 社区功能

#### 3.6.1 BBS — `src/pages/community/BBS.tsx`

| 测试项 | 预期 |
|--------|------|
| 帖子列表 | 展示社区帖子，支持分类筛选 |
| 发帖功能 | 可创建新帖子 |
| 帖子详情 | 点击可查看完整内容 |

### 3.7 错误处理

#### 3.7.1 ErrorBoundary (`main.tsx`)

| 测试项 | 预期 |
|--------|------|
| 组件渲染错误 | 捕获错误并显示错误页面 |
| 错误信息展示 | 显示错误类型和堆栈信息 |
| 重新加载 | 点击按钮刷新页面 |

#### 3.7.2 404 页面

| 测试项 | 预期 |
|--------|------|
| 未知路由 | 访问不存在的路径时显示 404 |
| 返回首页 | 提供返回首页按钮 |

---

## 4. 响应式设计测试

### 4.1 断点

| 断点 | 屏幕宽度 | 设备类型 |
|------|----------|----------|
| sm | 640px | 大屏手机 |
| md | 768px | 平板 |
| lg | 1024px | 小屏笔记本 |
| xl | 1280px | 桌面 |

### 4.2 响应式测试矩阵

| 组件 | 移动端 | 平板 | 桌面 |
|------|--------|------|------|
| 导航栏 | 底部 tab bar | 桌面导航 | 桌面导航 |
| 首页场景卡片 | 2 列 | 2 列 | 4 列 |
| Skills 列表 | 1 列 | 2 列 | 3 列 |
| 精选 Skills | 1 列 | 2 列 | 4 列 |
| 底部导航 | 显示 | 隐藏 | 隐藏 |
| 汉堡菜单 | 显示 | 隐藏 | 隐藏 |

---

## 5. 浏览器兼容性

### 5.1 支持浏览器

| 浏览器 | 最低版本 |
|--------|----------|
| Chrome | 90+ |
| Firefox | 90+ |
| Safari | 14+ |
| Edge | 90+ |

### 5.2 必需 Web API

| API | 用途 |
|-----|------|
| IndexedDB | 本地数据存储（Dexie） |
| localStorage | 客户上下文、偏好设置 |
| Clipboard API | 文本复制功能 |
| FileReader | 文件上传处理 |
| Blob / URL | 文件导出下载 |

---

## 6. 构建与部署测试

### 6.1 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器（默认端口 5000）
npm run dev

# 类型检查
npm run lint
```

### 6.2 生产构建

```bash
# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

### 6.3 构建验证清单

| 测试项 | 预期 |
|--------|------|
| `npm run build` 无报错 | 成功生成 dist/ 目录 |
| dist/ 包含所有静态资源 | HTML, JS, CSS, 图片等 |
| 路由使用 Hash 模式 | GitHub Pages 兼容 |
| base 路径正确 | 生产环境使用 './' |
| 环境变量注入 | GEMINI_API_KEY 正确注入 |

### 6.4 GitHub Pages 部署

| 测试项 | 预期 |
|--------|------|
| 推送 main 分支 | 触发 GitHub Actions |
| Deploy 工作流 | 成功完成构建和部署 |
| 页面可访问 | URL 正常加载 |
| 所有路由可用 | Hash 路由正常工作 |

---

## 7. 环境变量

| 变量名 | 用途 | 必需 |
|--------|------|------|
| `GEMINI_API_KEY` | Gemini AI API 密钥 | 是（AI 功能） |
| `PORT` | 开发服务器端口 | 否（默认 5000） |

---

## 8. 已知限制

| 限制项 | 说明 |
|--------|------|
| 社区数据 | 当前为本地演示模式，数据仅保存在 IndexedDB |
| 评论功能 | 暂未开放，按钮禁用 |
| 后端 API | api.ts 当前使用 Mock 数据，预留后端集成接口 |
| 用户系统 | 使用固定 MOCK_USER，无真实登录/注册 |
| 图片上传 | 依赖浏览器 FileReader，无服务端存储 |
| AI 功能 | 依赖 Gemini API Key，未配置时相关功能不可用 |

---

## 9. Skills 完整清单

| # | ID | 名称 | 类别 | 场景 | 状态 |
|---|----|------|------|------|------|
| 1 | cd-calculator | 银承/存单测算小助手 | 测算类 | 对自己+对中后台+对客户 | 在线可用 |
| 2 | account-fee-discount | 账户业务费用优惠申请 | OA报批 | 对中后台+对客户 | 在线可用 |
| 3 | rate-discount-report | 利率优惠签报智能生成 | 审批文案生成 | 对中后台 | 在线可用 |
| 4 | news-assistant | 宣传稿排版助手 | 排版助手 | 对中后台 | 在线可用 |
| 5 | sensitive-comm-assistant | 敏感沟通助手 | 对客沟通 | 对客户 | 在线可用 |
| 6 | batch-billing-generation | 项下开票本地下载工具包 | 本地工具包 | 对中后台+对自己 | 在线可用 |
| 7 | discount-credit-workflow | 贴现/专门授信工作流 | 授信审批材料 | 对审查+对客户 | 在线可用 |
| 8 | chang-rong-bao | 长融保 | 政策性增信经营贷 | 对客户+对审查 | 在线可用 |
| 9 | chang-yi-dan | 长易担 | 简易审批备案经营贷 | 对客户+对审查 | 在线可用 |
| 10 | scenario-center | 场景中心 | 平台核心板块 | 全场景展业导航 | 在线可用 |
| 11 | business-guide-main | 业务通 (产品打法库) | 平台核心板块 | 对客户 | 在线可用 |
| 12 | material-checklist-main | 材料清单中心 | 平台核心板块 | 对客户 | 在线可用 |
| 13 | bbs-center-main | 交流社区 (BBS) | 平台核心板块 | 对自己 | 在线可用 |
| 14 | feng-shui-calendar | 打工风水历 | 趣味/效率 | 对自己 | 在线可用 |
| 15 | food-selector | 今天吃什么 | 趣味/效率 | 对自己 | 在线可用 |
| 16 | off-duty-game | 高效下班清醒系统 | 趣味/效率 | 对自己 | 在线可用 |
| 17 | update-log-main | 更新日志 | 平台信息 | 对自己 | 在线可用 |
| 18 | feedback-main | 反馈建议 | 平台信息 | 对自己 | 在线可用 |
| 19 | industry-manufacturing | 制造业行业洞察 | 行业洞察 | 对客户 | 在线可用 |
| 20 | industry-tech | 科技企业行业洞察 | 行业洞察 | 对客户 | 在线可用 |
| 21 | scenario-first-visit | 首次拜访策略 | 场景策略 | 对客户 | 在线可用 |
| 22 | scenario-competitor | 竞争对手挖角策略 | 场景策略 | 对客户 | 在线可用 |
| 23 | bbs-feed | 实战动态 (Feed) | 社交/交流 | 对自己 | 在线可用 |
| 24 | bbs-publish | 经验发布 | 社交/交流 | 对自己 | 在线可用 |
| 25 | messages-center | 消息中心 | 平台功能 | 对自己 | 在线可用 |
| 26 | profile-main | 个人中心 (展业看板) | 平台核心板块 | 对自己 | 在线可用 |
| 27 | *(未命名)* | *(数据中第 27 条)* | *-* | *-* | *-* |
| 28 | *(未命名)* | *(数据中第 28 条)* | *-* | *-* | *-* |

---

## 10. 数据流转关系

```
用户输入
  │
  ├─→ 工具表单 ──→ 计算/生成逻辑 ──→ 结果展示
  │       │              │              │
  │       ├─→ saveDraft() ──→ IndexedDB (drafts)
  │       │              │              ├─→ saveArtifact() ──→ IndexedDB (artifacts)
  │       │              │              └─→ logExport() ──→ IndexedDB (exports)
  │       │              │
  │       └─→ CustomerContext (客户信息自动预填)
  │
  ├─→ 社区发帖 ──→ saveLocalPost() ──→ IndexedDB (posts)
  │       │
  │       └─→ apiService.getPosts() ──→ 合并 Mock 数据 + 本地数据
  │
  └─→ 工作台 ──→ IndexedDB (workspace)
```

---

## 11. 测试建议

由于项目当前没有配置测试框架（无 Jest/Vitest/RTL），建议按以下优先级建立测试体系：

### 11.1 P0 — 核心功能测试（推荐最先建立）

1. **lib/localDB.ts** — 数据层单元测试（所有 CRUD 操作）
2. **lib/CustomerContext.tsx** — Context 状态管理测试
3. **lib/utils.ts** — 工具函数单元测试
4. **api.ts** — API 服务层 Mock/集成测试

### 11.2 P1 — 组件集成测试

1. **SkillsLibrary** — 搜索、筛选、列表渲染
2. **ScenarioCenter** — 场景切换、Tab 联动
3. **BusinessGuide** — 产品切换、营销指引展示
4. **MaterialChecklistCenter** — 业务类型切换、清单渲染

### 11.3 P2 — 页面 E2E 测试

1. 首页导航流程
2. 工具完整使用流程（输入→计算/生成→导出）
3. 社区发帖、浏览流程
4. 响应式布局验证

---

*文档生成时间：2026-04-12*
