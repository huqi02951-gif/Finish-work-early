# 第二轮架构收口决议 + 后端冻结范围 + Codex 执行说明

> v2.0 | 2026-04-18 | 状态：冻结，可执行

---

# 任务1：第二轮架构收口决议

## 1.1 Forum 统一决议

| 对象 | 决议 | 说明 |
|------|------|------|
| `backend/src/forum/` (ForumService 920行) | **保留，作为社区唯一服务** | 含 Board/PostType/Tag/审核状态机/ModerationLog，不改 |
| `backend/src/posts/` (PostsService) | **废弃，删除整个目录** | 仅有 findAll/findById/create，是 ForumService 子集 |
| `backend/src/comments/` (CommentsService) | **废弃，删除整个目录** | 仅有 create 一个方法，ForumService.createComment 完全覆盖 |
| `app.module.ts` 中 PostsModule/CommentsModule 的 import | **废弃，移除** | 删除 import 行和 imports 数组中的引用 |
| Forum 三层 Controller (public/user/admin) | **保留** | 权限分层结构正确 |
| ForumService 中 `authorSelect` 常量 (第39-45行) | **保留，冻结** | 其他模块不要再写 inline select |

## 1.2 api.ts / forumApi.ts 最终拆分

**结论：api.ts 保留但收窄为 Auth 专用；帖子/评论/通知方法全部迁走。**

`api.ts` 中方法的逐条处置：

| 方法 | 决议 | 迁移目标 |
|------|------|---------|
| `sendEmailCode()` | **保留在 api.ts** | Auth 职责，不动 |
| `verifyEmailCode()` | **保留在 api.ts** | Auth 职责，不动 |
| `logout()` | **保留在 api.ts** | Auth 职责，不动 |
| `getCurrentUser()` | **保留在 api.ts** | Auth/User 职责，不动 |
| `getPosts()` | **废弃** → 调用方改用 `forumApi.getPosts()` | 涉及：Feed.tsx、BBS.tsx |
| `getPostById()` | **废弃** → 调用方改用 `forumApi.getPost()` | 涉及：CommunityTopic.tsx、CommunityThread.tsx |
| `createPost()` | **废弃** → 调用方改用 `forumApi.createPost()` | 涉及：BBS.tsx、Publish.tsx |
| `getMyPosts()` | **废弃** → 调用方改用 `forumApi.getMyPosts()` | 无当前调用方，直接删 |
| `createComment()` | **废弃** → 调用方改用 `forumApi.createComment()` | 涉及：CommunityTopic.tsx、CommunityThread.tsx |
| `getNotifications()` | **暂缓** — 后端无通知 API，前端先返空数组 | Messages.tsx 暂保留现有 stub |
| `markNotificationAsRead()` | **暂缓** — 同上 | 同上 |
| `createDemoSession()` | **保留在 api.ts** | Auth 职责 |
| `ensureDemoSession()` | **保留在 api.ts** | Auth 职责 |
| `withAuth()` 内部函数 | **保留在 api.ts，但 forumApi 也需可复用** | 提取为 `src/services/httpClient.ts` 共享 |

**最终文件职责**：
- `api.ts` → 重命名为 `authApi.ts`（**暂缓**，第一版先不重命名，只删帖子方法）
- `forumApi.ts` → 帖子/评论/版块/审核全部在这
- `contentApi.ts` → 产品/技能/页面配置，不动
- `authService.ts` → 前端 Auth 状态管理（token 存储/读取），不动

**涉及迁移的前端文件清单（7个）**：

| 文件 | 当前调用 | 改为 |
|------|---------|------|
| `src/pages/Feed.tsx` | `apiService.getPosts()` | `forumApi.getPosts()` |
| `src/pages/Publish.tsx` | `apiService.createPost()` | `forumApi.createPost()` |
| `src/pages/community/BBS.tsx` | `apiService.getPosts()` + `apiService.createPost()` | `forumApi.getPosts()` + `forumApi.createPost()` |
| `src/pages/community/CommunityTopic.tsx` | `apiService.getPostById()` + `apiService.createComment()` | `forumApi.getPost()` + `forumApi.createComment()` |
| `src/pages/community/CommunityThread.tsx` | `apiService.getPostById()` + `apiService.createComment()` | `forumApi.getPost()` + `forumApi.createComment()` |
| `src/pages/Profile.tsx` | `apiService.getCurrentUser()` | **保留**（getCurrentUser 留在 api.ts） |
| `src/pages/Messages.tsx` | `apiService.getNotifications()` | **暂缓**（通知 API 不存在，先不动） |

## 1.3 Skills / Products / Page Config 字段冻结

**Skills 表冻结字段（不改列名/类型）**：
`slug`, `title`, `category`, `summary`, `toolRoute`, `formLabel`, `status`, `sortOrder`, `detailData(JSONB)`

**Products 表冻结字段**：
`slug`, `name`, `category`, `summary`, `coverUrl`, `targetUrl`, `status`, `sortOrder`, `detailData(JSONB)`

**PageConfig 表冻结字段**：
`pageKey`, `configData(JSONB)`, `version`, `schemaVersion`

**`detailData` / `configData` 的 JSONB 结构**：
- **暂缓** schema 强约束。第一版只在 service 层做运行时校验（现有 `validateHomePageConfig()` 等方法已足够）。不引入 JSON Schema 库。

**前端 `constants/skills.ts` (458行硬编码)**：
- **暂缓迁移**。这里面包含 `marketingGuide` 大量文案（话术/脚本/QA），数据量大且变更频率低。第一版不搬后端。
- 等后端 seed 流程稳定后再迁移，预计 Phase 2。

## 1.4 localDB / community / CustomerContext 云端策略

| 模块 | 决议 | 理由 |
|------|------|------|
| `lib/localDB.ts` (Dexie: drafts/artifacts/exports/workspace) | **保留本地，不上云** | 含客户敏感信息(客户名/金额)，无社交属性，上云需加密方案 |
| `lib/CustomerContext.tsx` (localStorage: 客户名/行业/电话) | **保留本地，不上云** | 纯工具预填用途，不需要跨设备 |
| `lib/community.ts` (Dexie: threads/replies) | **暂缓迁移** | 当前仅3个文件引用：Profile.tsx、ToMyselfSpace.tsx（Gossip发帖）、以及 community 页面组件。第一版不动。Phase 1后期处理 |
| `src/data/bbsSeedData.ts` (硬编码种子帖) | **暂缓** | 目前由 BBSHome.tsx 等使用，改动需前端联调。等 Forum API 迁移完再清理 |

**第一版云端策略一句话**：第一版只管"后端已有的数据走云端"，本地数据层一概不动。

## 1.5 JWT / Demo / Token 收口

**第二轮只收一条线：JWT 安全线。**

| 事项 | 决议 | 具体改法 |
|------|------|---------|
| JWT 硬编码回退密钥 | **立即废弃** | `auth.module.ts` 第12行：删除 `\|\| 'FINISH_WORK_PHASE_1_SECRET'`，改为启动时无 env 则 throw |
| Token payload 加 loginMethod | **后补** | 改动涉及 auth.service.ts sign() + 前端 authService 解析 + forumApi requireRealToken() 联动，链路长。第一版不做 |
| Demo session 自动创建逻辑 | **保留，不动** | 现有 createOrLoginDemoSession 逻辑可用，不碰 |
| UserSession 表接入 | **后补** | 表已建但从未写入。第一版不接入，Phase 1 处理 |
| @nestjs/throttler 限频 | **后补** | 需要确定限频策略后再接。第一版不加 |
| 前端 withAuth() 自动降级 demo | **保留，不动** | 当前行为可接受，改动风险大于收益 |

**总结：第一版 Auth 只做一件事 —— 移除硬编码密钥。其余全部后补。**

---

# 任务2：后端第一版冻结范围

## 2.1 第一版只做的模块

| 模块 | 做什么 | 做到什么程度 |
|------|--------|-------------|
| **Auth 模块** | 移除硬编码 JWT 密钥 | 只改 `auth.module.ts` 一行。其余不动 |
| **Forum 模块** | 成为唯一社区服务 | 删除 PostsModule/CommentsModule。ForumService 本身不改一行代码 |
| **App 根模块** | 清理 imports | 移除 PostsModule/CommentsModule 的注册 |

## 2.2 第一版不做的模块

| 模块 | 不做理由 |
|------|---------|
| Like / Bookmark / Report 表和 API | 需要先确认前端交互设计 |
| Notification 表和 API | 需要先定义通知类型和触发时机 |
| Announcement 表和 API | 非核心优先 |
| AuditLog 全局拦截器 | 需设计 action enum 和 target 格式 |
| CatalogProducts/CatalogSkills 共享验证层提取 | 重构型工作，不影响功能 |
| constants/skills.ts 数据灌入后端 seed | 数据量大(458行)，需要先定义 detailData 结构 |
| community.ts 迁移 | 引用方少(3处)，改动需前后端联调 |
| 管理后台前端 | 后端 Admin API 已有，后台前端 Phase 3 再建 |

## 2.3 Prisma 第一版：不新增任何表

**决议：第一版不跑 migration。**

理由：
1. 现有 schema.prisma 的 13 个模型已覆盖当前所有已实现功能
2. 新增 Like/Bookmark/Report/Notification/Announcement/AuditLog 表属于 Phase 1-2 的事
3. 避免在收口阶段引入 schema 变更风险

**已有表中需要关注但不改的**：
| 表 | 现状 | 决议 |
|----|------|------|
| `user_sessions` | 建了但没用 | **冻结**，不删不改不接入。Phase 1 再处理 |
| `verification_codes` | 邮箱验证码在用 | **冻结** |
| `comments.deletedAt` | 有字段但状态只有 PUBLISHED/HIDDEN | **冻结**，Comment 软删除逻辑 Phase 1 补 |

## 2.4 字段策略：结构化 vs JSONB vs 前端持有

| 数据 | 当前存储方式 | 第一版决议 |
|------|-------------|-----------|
| Post 核心字段 (title/content/status/postType等) | PostgreSQL 结构化列 | **冻结，不改** |
| Post.contentData | JSONB | **继续 JSONB**，富文本扩展用 |
| Product.detailData | JSONB | **继续 JSONB**，产品详情页数据 |
| Skill.detailData | JSONB | **继续 JSONB**，技能详情数据 |
| PageConfig.configData | JSONB | **继续 JSONB**，页面骨架配置 |
| Skills 完整定义 (含 marketingGuide) | 前端 constants/skills.ts 硬编码 | **继续前端持有**，Phase 2 迁移 |
| 材料清单数据 | 前端 data/checklistData.ts | **继续前端持有**，无后端需求 |
| BBS 种子帖 | 前端 src/data/bbsSeedData.ts | **继续前端持有**，Phase 1 后清理 |
| 工具草稿/产物 | 前端 localDB (IndexedDB) | **继续前端持有**，不上云 |
| 客户上下文 | 前端 localStorage | **继续前端持有**，不上云 |
| 社区帖子/回复 (茶水间等) | 前端 community.ts (IndexedDB) | **继续前端持有**，Phase 1后迁移 |

---

# 任务3：Codex 执行说明

## 3.1 执行顺序（共4步，按序执行）

### Step 1：后端删除 PostsModule + CommentsModule

**改动文件**：
```
DELETE: backend/src/posts/posts.service.ts
DELETE: backend/src/posts/posts.controller.ts
DELETE: backend/src/posts/posts.module.ts
DELETE: backend/src/comments/comments.service.ts
DELETE: backend/src/comments/comments.controller.ts
DELETE: backend/src/comments/comments.module.ts
EDIT:   backend/src/app.module.ts
```

**app.module.ts 具体改法**：
- 删除 `import { PostsModule } from './posts/posts.module';` 
- 删除 `import { CommentsModule } from './comments/comments.module';`
- 从 `@Module({ imports: [...] })` 数组中移除 `PostsModule` 和 `CommentsModule`

**停止条件**：后端能正常启动 (`npm run start:dev` 不报错)。`GET /api/v1/posts` 返回 404。`GET /api/v1/forum/posts` 正常返回数据。

**不要顺手做**：不要改 ForumService 的任何代码。不要改 Prisma schema。不要动 dist/ 目录（构建自动生成）。

**回报确认**：截图或输出 `npm run start:dev` 的启动日志，确认无 import error。

---

### Step 2：移除 JWT 硬编码密钥

**改动文件**：
```
EDIT: backend/src/auth/auth.module.ts
```

**具体改法**（第12行附近）：

把：
```typescript
secret: process.env.JWT_SECRET || 'FINISH_WORK_PHASE_1_SECRET',
```

改为：
```typescript
secret: (() => {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error('FATAL: JWT_SECRET env var is required. Set it in .env');
  return s;
})(),
```

**停止条件**：不设 JWT_SECRET 时 `npm run start:dev` 启动直接报错并退出。设了 JWT_SECRET 后正常启动。

**不要顺手做**：不要改 token payload 结构。不要加 loginMethod 字段。不要动 auth.service.ts。不要加 throttler。

**回报确认**：1) 无 JWT_SECRET 启动截图（应报 FATAL error）。2) 有 JWT_SECRET 启动截图（应正常）。

---

### Step 3：前端迁移 5 个文件的 apiService 帖子调用

**改动文件**（按顺序改）：

**3a. `src/pages/Feed.tsx`**
- 把 `import { apiService } from '../services/api'` 改为 `import { forumApi } from '../services/forumApi'`
- 把 `apiService.getPosts(category)` 改为 `forumApi.getPosts({ category })` 
- 注意：forumApi.getPosts() 返回 `PagedResponse<Post>`（带 data/total/page 字段），Feed 需要取 `.data` 数组。如果现有 forumApi.getPosts() 的入参或返回结构不兼容，**在 forumApi.ts 中新增一个 `getPostsSimple()` 包装方法**，不要改 ForumService

**3b. `src/pages/Publish.tsx`**
- 同理替换 import
- `apiService.createPost({ title, content, category })` → `forumApi.createPost({ title, content, category })`
- 检查 forumApi.createPost() 是否接受相同参数，不兼容则在 forumApi.ts 加兼容包装

**3c. `src/pages/community/BBS.tsx`**
- 替换 import
- `apiService.getPosts(category)` → `forumApi.getPosts(...)` 
- `apiService.createPost(...)` → `forumApi.createPost(...)`
- 这个文件同时 import 了其他东西（community 组件），只改 apiService 相关调用

**3d. `src/pages/community/CommunityTopic.tsx`**
- `apiService.getPostById(id)` → `forumApi.getPost(id)`
- `apiService.createComment(id, content)` → `forumApi.createComment(id, { content })`
- 注意参数格式差异：forumApi.createComment 可能接受 object，需核对

**3e. `src/pages/community/CommunityThread.tsx`**
- 同 CommunityTopic.tsx 的改法

**停止条件**：5 个文件不再 import apiService（auth 相关调用除外）。前端编译无 TypeScript 错误 (`npm run build` 通过)。

**不要顺手做**：
- **不要动 Messages.tsx**（getNotifications 先不管）
- **不要动 Profile.tsx** 中的 `getCurrentUser()`（保留在 api.ts）
- **不要动 AppLayout.tsx** 中的 `logout()`（保留在 api.ts）
- **不要动 EmailLogin.tsx**（Auth 方法保留在 api.ts）
- **不要重构 forumApi.ts 的内部结构**
- **不要改 api.ts 中 withAuth/createDemoSession 的逻辑**

**回报确认**：`npm run build` 完整输出。确认无 TS 编译错误。

---

### Step 4：api.ts 清理残留死代码

**改动文件**：
```
EDIT: src/services/api.ts
```

**具体改法**：从 `apiService` 对象中删除以下方法定义：
- `getPosts`
- `getPostById`
- `createPost`
- `getMyPosts`
- `createComment`

同时删除 `api.ts` 中不再使用的类型定义（如 `BackendPost`、`mapBackendPost` 函数），但**只删确认无其他引用的**。用 grep 验证后再删。

**停止条件**：`api.ts` 中 `apiService` 只剩 auth 相关方法（sendEmailCode/verifyEmailCode/logout/getCurrentUser/getNotifications/markNotificationAsRead）。`npm run build` 通过。

**不要顺手做**：不要重命名 api.ts 为 authApi.ts。不要改 apiService 的导出名称。不要动 withAuth 函数。

**回报确认**：贴出清理后 `apiService` 对象的完整方法列表。

---

## 3.2 执行红线（这些点绝对不碰）

1. **不改 ForumService 的任何业务逻辑**（forum.service.ts 920行一字不动）
2. **不改 Prisma schema**（不跑 migration）
3. **不改后端 Forum Controller 的路由路径**
4. **不改 lib/localDB.ts、lib/community.ts、lib/CustomerContext.tsx**
5. **不改 constants/skills.ts**
6. **不改 src/data/bbsSeedData.ts**
7. **不加新的 npm 包**（不装 throttler、不装 JSON schema 库）
8. **不建管理后台**
9. **不碰 dist/ 目录**（自动生成）
10. **不改 vite.config.ts / tsconfig.json**

## 3.3 改完后整体验证清单

全部4步完成后，执行以下验证：

```bash
# 1. 后端启动测试（需设 JWT_SECRET）
cd backend && JWT_SECRET=test_secret_123 npm run start:dev
# 预期：正常启动，无 import error

# 2. 后端路由验证
curl http://localhost:3000/api/v1/posts        # 预期：404
curl http://localhost:3000/api/v1/forum/posts   # 预期：200 + 帖子列表
curl http://localhost:3000/api/v1/forum/boards  # 预期：200 + 版块列表

# 3. 前端编译测试
cd .. && npm run build
# 预期：无 TS 错误，构建成功

# 4. JWT 安全验证
cd backend && npm run start:dev  # 不设 JWT_SECRET
# 预期：启动失败，报 FATAL error
```

---

> **本文档即第二轮冻结版本。Step 1-4 按顺序执行，每步完成后回报确认再进下一步。**
