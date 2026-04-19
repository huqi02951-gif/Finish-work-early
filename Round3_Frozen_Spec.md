# 第三轮冻结规格

> v3.0 | 2026-04-19 | 状态：冻结，可执行
> 前置状态确认：第二轮 Phase 0 已部分落地——PostsModule/CommentsModule 已删除、JWT 硬编码已修复（auth.config.ts）、CustomerContext + AuditLog 表已建、Profiles/Roles 模块已加入

---

# 任务1：内容模型冻结文档

## 1.1 Skill 模型字段决议

**Prisma 已有 Skill 表结构**：`slug, title, category, summary, toolRoute, formLabel, status, sortOrder, detailData(JSONB)`

| 字段 | 来源 | 第一版是否入库 | 存储方式 | 说明 |
|------|------|---------------|---------|------|
| `slug` (id) | Prisma Skill.slug | ✅ 已在库 | 结构化列 | 唯一标识，冻结 |
| `title` (name) | Prisma Skill.title | ✅ 已在库 | 结构化列 VarChar(100) | 冻结 |
| `category` | Prisma Skill.category | ✅ 已在库 | 结构化列 VarChar(100) | 如"测算类 Skill"、"OA报批 Skill"，冻结 |
| `summary` (description) | Prisma Skill.summary | ✅ 已在库 | 结构化列 Text | 技能简介，冻结 |
| `toolRoute` | Prisma Skill.toolRoute | ✅ 已在库 | 结构化列 | 前端路由路径，冻结 |
| `formLabel` | Prisma Skill.formLabel | ✅ 已在库 | 结构化列 | 表单标签，冻结 |
| `status` | Prisma Skill.status | ✅ 已在库 | CatalogStatus 枚举 | DRAFT/PUBLISHED/OFFLINE，冻结 |
| `sortOrder` | Prisma Skill.sortOrder | ✅ 已在库 | 结构化列 | 排序权重，冻结 |
| `scene` | 前端 constants/skills.ts | ❌ 留前端 | detailData JSONB | 如"对客户 + 对审查"，量小、只展示，不值得单独建列 |
| `sceneTags` | 前端 constants/skills.ts | ❌ 留前端 | detailData JSONB | 字符串数组，筛选用。后续若需后端筛选再提升为结构化 |
| `audience` | 前端 constants/skills.ts | ❌ 留前端 | detailData JSONB | 字符串数组 |
| `input` | 前端 constants/skills.ts | ❌ 留前端 | detailData JSONB | 字符串数组 |
| `output` | 前端 constants/skills.ts | ❌ 留前端 | detailData JSONB | 字符串数组 |
| `form` | 前端 constants/skills.ts | ❌ 留前端 | detailData JSONB | 如"网页"、"本地 Python GUI" |
| `marketingGuide` | 前端 constants/skills.ts | ❌ 留前端 | detailData JSONB | 大文案对象（含 framework/scripts/QA 等），单个可达 5KB+。第一版不拆 |

**结论**：Skill 表结构已冻结，7个结构化列不动。前端 `constants/skills.ts` 中的 `scene/sceneTags/audience/input/output/form/marketingGuide` 全部走 `detailData` JSONB，第一版不提升为结构化列。

## 1.2 Product 模型字段决议

**Prisma 已有 Product 表结构**：`slug, name, category, summary, coverUrl, targetUrl, status, sortOrder, detailData(JSONB)`

| 字段 | 第一版是否入库 | 存储方式 | 说明 |
|------|---------------|---------|------|
| `slug` | ✅ 已在库 | 结构化列 | 冻结 |
| `name` | ✅ 已在库 | 结构化列 VarChar(100) | 冻结 |
| `category` | ✅ 已在库 | 结构化列 VarChar(100) | 冻结 |
| `summary` (overview) | ✅ 已在库 | 结构化列 Text | 冻结 |
| `coverUrl` | ✅ 已在库 | 结构化列 | 冻结 |
| `targetUrl` | ✅ 已在库 | 结构化列 | 冻结 |
| `status` | ✅ 已在库 | CatalogStatus 枚举 | 冻结 |
| `sortOrder` | ✅ 已在库 | 结构化列 | 冻结 |
| `targetCustomers` | ❌ 留 JSONB | detailData | 字符串数组 |
| `suitableIndustries` | ❌ 留 JSONB | detailData | 字符串数组 |
| `sellingPoints` | ❌ 留 JSONB | detailData | 字符串数组 |
| `entryCriteria` | ❌ 留 JSONB | detailData | 字符串数组 |
| `commonBlockers` | ❌ 留 JSONB | detailData | 字符串数组 |
| `openingTalk` | ❌ 留 JSONB | detailData | 文本 |
| `mustAskQuestions` | ❌ 留 JSONB | detailData | 字符串数组 |
| `materials` | ❌ 留 JSONB | detailData | 字符串数组 |
| `steps` | ❌ 留 JSONB | detailData | 字符串数组 |
| `objections` | ❌ 留 JSONB | detailData | 对象数组 |
| `forbiddenPhrases` | ❌ 留 JSONB | detailData | 字符串数组 |
| `productBoundary` | ❌ 留 JSONB | detailData | 对象（suitable/unsuitable） |
| `highFreqQA` | ❌ 留 JSONB | detailData | 对象数组 |
| `scripts` | ❌ 留 JSONB | detailData | 对象（initial/deep/followUp） |
| `practicalLogic` | ❌ 留 JSONB | detailData | 字符串数组 |
| `comparison` | ❌ 留 JSONB | detailData | 文本 |
| `speedUpChecklist` | ❌ 留 JSONB | detailData | 对象 |
| `industryMarketing` | ❌ 留 JSONB | detailData | 对象 |
| `messagingPack` | ❌ 留 JSONB | detailData | 对象 |
| `checklistTemplateCode` | ❌ 留 JSONB | detailData | 字符串 |
| `reviewSubmissionTemplateCode` | ❌ 留 JSONB | detailData | 字符串 |

**结论**：Product 表 8 个结构化列冻结。所有产品打法内容（20+ 字段）全部走 `detailData` JSONB。理由：这些字段变更频率极低，数量多但只在详情页展示，没有检索需求。`contentApi.ts` 的 `mapProduct()` 已经正确地从 JSONB 映射到前端类型。

## 1.3 PageConfig 模型字段决议

| 字段 | 第一版是否入库 | 存储方式 | 说明 |
|------|---------------|---------|------|
| `pageKey` | ✅ 已在库 | 结构化列 unique | 如 `home_page`、`skills_library_page`，冻结 |
| `configData` | ✅ 已在库 | JSONB | 整个页面骨架数据，继续 JSONB |
| `version` | ✅ 已在库 | 结构化列 Int | 内容版本号，冻结 |
| `schemaVersion` | ✅ 已在库 | 结构化列 Int | 结构版本号，冻结 |
| `publishedAt` | ✅ 已在库 | 结构化列 DateTime? | 冻结 |
| `updatedById` | ✅ 已在库 | 结构化列 FK → User | 冻结 |

**`configData` 内部结构**：不做 JSON Schema 强约束。现有 `page-configs.service.ts` 中的 `validateHomePageConfig()` / `validateSkillsLibraryPageConfig()` 运行时校验已足够。

**第一版支持的 pageKey 值**：`home_page` 和 `skills_library_page`。新增 pageKey 不改表结构，只加验证函数。

## 1.4 前端硬编码数据迁移原则

| 文件 | 行数 | 迁移决议 | 迁移时机 | 前置条件 |
|------|------|---------|---------|---------|
| `constants/skills.ts` | 458行，20+ 技能定义 | 数据灌入后端 Skill seed，前端改为 API 调用 | Phase 2 | 1) contentApi.ts 的 getSkills() 已跑通；2) detailData JSONB 结构对齐 |
| `data/checklistData.ts` | 材料清单配置 | 暂不迁移，继续前端持有 | 远期 | 无后端需求驱动 |
| `src/data/bbsSeedData.ts` | BBS 种子帖 | 删除，由后端 Forum seed 替代 | Phase 1 后期 | BBS 页面全部改为 forumApi 调用 |

**迁移通用原则**：
1. 先确认后端 API 已能返回等价数据
2. 前端新建适配函数，不改组件 props 类型
3. 灰度切换：先 API 调用 → fallback 到本地常量 → 确认稳定后删除本地常量
4. 一次只迁移一个文件，不批量

## 1.5 后续什么时候把 JSONB 字段提升为结构化列

**触发条件（满足任一即考虑）**：
1. 需要对该字段做 SQL WHERE 查询（如"按行业筛选产品"需要 `suitableIndustries` 结构化）
2. 需要对该字段做排序
3. 该字段被多个模块引用且需要一致性约束
4. 该字段值域有限且稳定（适合做枚举或外键）

**当前无任何 JSONB 子字段满足上述条件，全部保持 JSONB。**

---

# 任务2：CustomerProfile / Draft / Artifact 第一版 Schema 草案

## 2.1 现状确认

| 模型 | 当前状态 |
|------|---------|
| CustomerContext | ✅ **已在 Prisma schema 中**，已有后端 Service + Controller + AuditLog 联动 |
| Draft（工具草稿） | ❌ 仅存在于前端 localDB.ts (IndexedDB)，无后端表 |
| Artifact（生成产物） | ❌ 仅存在于前端 localDB.ts (IndexedDB)，无后端表 |

## 2.2 CustomerContext — 已有表，冻结

**此表已落地，不需要重建。以下为当前字段记录，供第三轮对齐。**

| 字段 | 类型 | 必填 | 可空 | JSONB | 索引 | 说明 |
|------|------|------|------|-------|------|------|
| `id` | Int autoincrement | ✅ | — | — | PK | — |
| `userId` | Int FK→User | ✅ | — | — | ✅ 复合索引 (userId, deletedAt, updatedAt) | 属主 |
| `customerName` | VarChar(150) | ✅ | — | — | ✅ 单独索引 | 客户/企业名 |
| `contactPerson` | VarChar(100) | — | ✅ | — | — | 联系人 |
| `phone` | VarChar(50) | — | ✅ | — | — | 电话 |
| `industry` | VarChar(100) | — | ✅ | — | — | 行业 |
| `channel` | VarChar(100) | — | ✅ | — | — | 沟通渠道 |
| `remark` | Text | — | ✅ | — | — | 备注 |
| `extraData` | Json? | — | ✅ | ✅ | — | 扩展字段 |
| `lastUsedAt` | DateTime? | — | ✅ | — | — | 最近使用时间 |
| `createdAt` | DateTime | ✅ | — | — | — | — |
| `updatedAt` | DateTime | ✅ | — | — | — | — |
| `deletedAt` | DateTime? | — | ✅ | — | — | 软删除 |

**决议**：冻结，不改任何列。前端 `lib/CustomerContext.tsx` 第一版继续使用 localStorage，不接入此表。接入时机：当需要跨设备同步客户列表时。

## 2.3 Draft（工具草稿）— 第一版 Prisma model 草案

**设计原则**：对齐前端 `localDB.ts` 中 `DraftRecord` 的字段，但不是所有字段都建列。

```prisma
model Draft {
  id        Int      @id @default(autoincrement())
  userId    Int      @map("user_id")
  toolId    String   @map("tool_id") @db.VarChar(100)
  title     String   @db.VarChar(200)
  data      Json
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  deletedAt DateTime? @map("deleted_at")
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, toolId, updatedAt])
  @@index([userId, deletedAt, updatedAt])
  @@map("drafts")
}
```

| 字段 | 类型 | 必填 | 可空 | JSONB | 索引 | 说明 |
|------|------|------|------|-------|------|------|
| `id` | Int autoincrement | ✅ | — | — | PK | — |
| `userId` | Int FK→User | ✅ | — | — | ✅ 复合索引 | 草稿属主 |
| `toolId` | VarChar(100) | ✅ | — | — | ✅ 复合索引 | 工具标识，如 'sensitive-comm'、'rate-offer' |
| `title` | VarChar(200) | ✅ | — | — | — | 草稿标题 |
| `data` | Json | ✅ | — | ✅ | — | 工具表单的完整状态快照。每个工具结构不同，必须 JSONB |
| `createdAt` | DateTime | ✅ | — | — | — | — |
| `updatedAt` | DateTime | ✅ | — | — | — | — |
| `deletedAt` | DateTime? | — | ✅ | — | — | 软删除 |

**不建的字段**：无 `synced` 标记——同步策略由前端 localDB 自行管理，后端只管自己的 CRUD。

**不建的索引**：不对 `title` 建索引——草稿没有全局搜索需求，只按 userId+toolId 查。

## 2.4 Artifact（生成产物）— 第一版 Prisma model 草案

```prisma
model Artifact {
  id        Int      @id @default(autoincrement())
  userId    Int      @map("user_id")
  toolId    String   @map("tool_id") @db.VarChar(100)
  title     String   @db.VarChar(200)
  content   String   @db.Text
  metadata  Json?
  createdAt DateTime @default(now()) @map("created_at")
  deletedAt DateTime? @map("deleted_at")
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, toolId, createdAt])
  @@index([userId, deletedAt, createdAt])
  @@map("artifacts")
}
```

| 字段 | 类型 | 必填 | 可空 | JSONB | 索引 | 说明 |
|------|------|------|------|-------|------|------|
| `id` | Int autoincrement | ✅ | — | — | PK | — |
| `userId` | Int FK→User | ✅ | — | — | ✅ 复合索引 | 产物属主 |
| `toolId` | VarChar(100) | ✅ | — | — | ✅ 复合索引 | 来源工具 |
| `title` | VarChar(200) | ✅ | — | — | — | 产物标题 |
| `content` | Text | ✅ | — | — | — | 主文本内容（签报正文、沟通话术等） |
| `metadata` | Json? | — | ✅ | ✅ | — | 附加信息（参数快照、导出格式等） |
| `createdAt` | DateTime | ✅ | — | — | — | — |
| `deletedAt` | DateTime? | — | ✅ | — | — | 软删除 |

**不建的字段**：
- 无 `updatedAt`——产物生成后不编辑，只删除
- 无 `format` 列——导出格式记录在 metadata 中，不需要按格式查询
- 无 `draftId` 外键——产物与草稿无强关联（一个草稿可生成多个产物，但不需要 SQL JOIN）

## 2.5 第一版不建的表（明确排除）

| 表 | 排除理由 |
|----|---------|
| ExportRecord | 导出记录纯本地行为，无跨设备需求，继续前端 localDB |
| WorkspaceItem | 工作台条目是本地 UI 状态，继续前端 localDB |
| Like / Bookmark | 社区增强功能，不在本轮范围 |
| Report | 举报系统，不在本轮范围 |
| Notification | 通知系统，不在本轮范围 |
| Announcement | 公告系统，不在本轮范围 |

## 2.6 Draft + Artifact 上云时机

**不是现在。** 第一版只定 schema 草案，不跑 migration，不建 CRUD。

**上云触发条件**：用户明确要求"换设备也能看到我的草稿和生成历史"。

**上云时的前端适配方式**：
1. `localDB.ts` 的 `saveDraft()` / `saveArtifact()` 改为"先写本地 IndexedDB，再异步 POST 到后端"
2. 加载时"先读本地缓存，再拉后端合并"
3. 冲突策略：以 updatedAt 较新者为准

---

# 任务3：Auth 路径统一规范

## 3.1 现状确认（第三轮基准）

| 文件 | 当前实际职责 |
|------|-------------|
| `src/services/authService.ts` | 前端 Auth 状态管理：session 读写 localStorage、token 获取（getBestToken）、用户信息获取（getBestUser）、登录判断（isAuthenticated/isDemoSession） |
| `src/services/api.ts` | 混合职责：Auth API 调用（sendEmailCode/verifyEmailCode/logout）+ User API（getCurrentUser）+ 帖子方法（已改为委托 forumApi 但仍导出）+ Demo session 管理（createDemoSession/ensureDemoSession）+ 通知 mock + requestJson 基础函数 + requireRealToken |
| `src/services/forumApi.ts` | 论坛 API 调用（posts/comments/boards）+ 自有 requestJson + 自有 requireRealToken + 自有 BackendUser 类型定义 |
| `src/services/contentApi.ts` | 内容 API 调用（products/skills/page-configs）+ 自有 requestJson |

## 3.2 每个文件最终职责（冻结）

| 文件 | 最终唯一职责 | 不应包含的内容 |
|------|-------------|---------------|
| `authService.ts` | Auth 状态管理（纯本地，不发 HTTP 请求） | 不发 API 请求、不处理 demo session 创建 |
| `api.ts` | Auth API 调用 + Demo session 管理 + HTTP 基础设施（requestJson、withAuth 封装） | 不包含帖子/评论方法、不包含通知 mock |
| `forumApi.ts` | 论坛 API 调用（帖子/评论/版块/审核） | 不包含 requestJson 重复定义、不包含 requireRealToken 重复定义 |
| `contentApi.ts` | 内容 API 调用（产品/技能/页面配置） | 不包含 requestJson 重复定义 |

## 3.3 必须移走的逻辑

| 当前位置 | 逻辑 | 移动目标 | 优先级 |
|---------|------|---------|--------|
| `api.ts` 中 getPosts/getPostById/createPost/getMyPosts/createComment | 帖子方法（虽然内部已委托 forumApi，但仍作为 apiService 属性导出） | 删除这些属性。调用方直接 import forumApi | **本轮必须做** |
| `api.ts` 中 getNotifications/markNotificationAsRead | 通知 mock | 删除。Messages.tsx 内联 mock 或显示空态 | **本轮必须做** |
| `forumApi.ts` 中 requestJson (第161-185行) | 与 api.ts 中 requestJson 重复 | **暂缓**。第一版不提取共享 httpClient。两份 requestJson 逻辑一致，保持现状不会出 bug | 暂缓 |
| `forumApi.ts` 中 requireRealToken (第198-204行) | 与 api.ts 中 requireRealToken 重复 | **暂缓**。同上 | 暂缓 |
| `forumApi.ts` 中 BackendUser 类型定义 | 与 api.ts 中 BackendUser 重复 | **暂缓**。不影响运行 | 暂缓 |
| `contentApi.ts` 中 requestJson (第67-84行) | 第三份重复 | **暂缓** | 暂缓 |

**暂缓理由**：三份 requestJson 逻辑完全一致，提取为共享模块是纯重构工作，不改变行为，当前不产生 bug。在稳定运行后再统一。

## 3.4 Demo session 第一版处理

| 事项 | 决议 |
|------|------|
| `createDemoSession()` 保留在哪里 | **保留在 api.ts**，不动 |
| `ensureDemoSession()` 保留在哪里 | **保留在 api.ts**，不动 |
| Demo token 与 real token 的 payload 区分 | **第一版不做**。后端 `signToken()` 不加 loginMethod 字段。前端通过 localStorage key 区分（`fwe:auth-session` vs `fwe:demo-session`），已够用 |
| Demo session 自动创建时机 | **保持现状**：api.ts 中 getCurrentUser() 在无 session 时自动调用 ensureDemoSession() |
| ENABLE_DEMO_AUTH 环境变量 | **保留**。`auth.config.ts` 已实现：生产环境默认关闭 demo auth |
| Demo 用户写操作限频 | **第一版不做**。后端不加 throttler |

## 3.5 Real token 第一版处理

| 事项 | 决议 |
|------|------|
| 邮箱验证码登录流程 | **保留现状**。api.ts `sendEmailCode()` → `verifyEmailCode()` → authService `setAuthSession()` |
| Token 存储位置 | **保留 localStorage**，不改 |
| Token payload 结构 | **保留现状**：`{ sub, username, role }`。不加 loginMethod |
| 写操作鉴权 | **保留现状**：forumApi 和 api.ts 中各有一个 `requireRealToken()`，检查 `getAuthSession()` 且 `loginMethod !== 'demo'` |
| Token 过期处理 | 后端 JWT expiresIn 已配置为 7d（auth.config.ts）。前端收到 401 时不自动刷新，提示用户重新登录 |

## 3.6 Token 刷新现在做不做

**不做。**

理由：
1. Token 有效期 7 天，短期内不会频繁过期
2. 刷新 token 需要后端新增 `/auth/refresh` 端点 + 生成 refresh token + 前端拦截器改造，链路长
3. UserSession 表虽已建但未接入，接入后才有 token 吊销基础，否则 refresh 也不安全
4. 当前阶段用户量极小，7 天重新登录一次可接受

**后续做的前提**：UserSession 表接入 + 有明确的用户反馈"经常被踢出登录"。

## 3.7 Codex 收口执行顺序

### Step A：清理 api.ts 中的帖子方法导出

**文件**：`src/services/api.ts`

**操作**：
1. 从 `apiService` 对象中删除以下 5 个属性：`getPosts`、`getPostById`、`createPost`、`getMyPosts`、`createComment`
2. 删除 `import { forumApi } from './forumApi'` 这行 import（删除帖子方法后不再需要）
3. 删除 `requireRealToken()` 函数（api.ts 中不再有调用方）
4. 保留 `requestJson`、`createDemoSession`、`ensureDemoSession`、`getDemoClientKey`、`mapBackendUser`、`mapBackendRole`

**停止条件**：`apiService` 只剩 `sendEmailCode`、`verifyEmailCode`、`logout`、`getCurrentUser` 四个方法。TypeScript 编译无错。

**不要顺手做**：不要重命名 api.ts。不要改 forumApi.ts。不要提取共享 httpClient。

### Step B：清理 api.ts 中的通知 mock

**文件**：`src/services/api.ts`、`src/pages/Messages.tsx`

**操作**：
1. 从 `apiService` 中删除 `getNotifications` 和 `markNotificationAsRead`
2. 删除 `import { MOCK_NOTIFICATIONS } from '../mock/data'` 这行
3. 在 Messages.tsx 中：如果移除 apiService.getNotifications() 后编译报错，改为直接 import MOCK_NOTIFICATIONS 并内联使用，或显示"暂无通知"空态

**停止条件**：`apiService` 最终只有 `sendEmailCode`、`verifyEmailCode`、`logout`、`getCurrentUser`。编译通过。

**不要顺手做**：不要建 Notification 后端。不要改通知 UI。

### Step C：确认前端 7 个文件的 apiService 调用已全部迁移

**验证操作**（只验证，不改代码）：

用 grep 确认以下文件中不存在 `apiService.getPosts` / `apiService.getPostById` / `apiService.createPost` / `apiService.createComment` 的调用：
- `src/pages/Feed.tsx`
- `src/pages/Publish.tsx`
- `src/pages/community/BBS.tsx`
- `src/pages/community/CommunityTopic.tsx`
- `src/pages/community/CommunityThread.tsx`

如果发现仍有残留调用，改为 forumApi 对应方法。

**回报确认**：grep 输出为空（无残留调用）+ `npm run build` 通过。

### Step D（可选，仅在 Step A-C 全部完成后）：确认 api.ts 最终形态

**验证**：贴出 `apiService` 对象的完整定义（应只有4个方法）。确认文件中不再 import forumApi、不再 import MOCK_NOTIFICATIONS、不再定义 requireRealToken。

## 3.8 本轮执行红线

1. **不提取共享 httpClient** — 三份 requestJson 保持独立
2. **不改 authService.ts** — 它已是纯状态管理，不动
3. **不改 forumApi.ts** — 它的职责已对，不动
4. **不改 contentApi.ts** — 它的职责已对，不动
5. **不改后端任何文件** — 后端本轮无改动
6. **不跑 Prisma migration** — Draft/Artifact 只定草案，不建表
7. **不加 token 刷新逻辑**
8. **不给 token payload 加 loginMethod**
9. **不重命名 api.ts 为 authApi.ts**
10. **不删除 api.ts 中的 createDemoSession / ensureDemoSession / getCurrentUser**

---

> **本文档即第三轮冻结版本。Codex 按 Step A → B → C → D 顺序执行。每步完成后回报确认。**
