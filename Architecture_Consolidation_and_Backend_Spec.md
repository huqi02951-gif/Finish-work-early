# Finish Work Early — 架构收口清单 + 后端需求规格 + 实施优先级

> 文档版本：v1.0 | 日期：2026-04-18
> 角色：总架构师 + 后端规格负责人
> 状态：待评审

---

## 第一部分：架构收口清单

### 1.1 模块保留清单（不动）

| 模块 | 位置 | 理由 |
|------|------|------|
| **ForumService** | `backend/src/forum/` | 920行，功能最完整：支持 Board 分区、PostType 分类、Tag 系统、完整审核状态机、ModerationLog。是社区的唯一正解 |
| **CatalogProductsService** | `backend/src/catalog-products/` | 产品 CRUD + 产品-技能多对多关系管理，逻辑正确 |
| **CatalogSkillsService** | `backend/src/catalog-skills/` | 技能 CRUD，与产品对称 |
| **PageConfigsService** | `backend/src/page-configs/` | JSONB 配置下发，带版本管理，home_page / skills_library_page 验证逻辑完整 |
| **PrismaService** | `backend/src/prisma/` | 数据库抽象层，全局注入，保留 |
| **EmailAuthService** | `backend/src/auth/email-auth.*` | 邮箱验证码登录流程，保留但需修复安全问题 |
| **localDB.ts** | `lib/localDB.ts` | Dexie IndexedDB 层：草稿、产物、导出记录、工作台。纯本地工具数据，不上云，保留 |
| **CustomerContext.tsx** | `lib/CustomerContext.tsx` | 客户上下文 React Context + localStorage，纯前端状态，保留 |

### 1.2 模块废弃清单（删除）

| 模块 | 位置 | 废弃理由 | 替代方案 |
|------|------|----------|----------|
| **PostsService** | `backend/src/posts/posts.service.ts` | 仅有简单 CRUD（findAll/findById/create），是 ForumService 的子集。造成 `/posts` 和 `/forum/posts` 双路径混乱 | 所有帖子操作统一走 ForumService → `/api/v1/forum/*` |
| **PostsController** | `backend/src/posts/posts.controller.ts` | 绑定在 PostsService 上的路由，废弃 | 前端 `api.ts` 中的 `getPosts()` 改调 `forumApi.ts` |
| **CommentsService** | `backend/src/comments/comments.service.ts` | 仅有 `create()` 一个方法，ForumService 中 `createComment()` 完全覆盖 | 统一走 ForumService 的评论接口 |
| **CommentsController** | `backend/src/comments/comments.controller.ts` | 同上 | 统一走 `/api/v1/forum/posts/:id/comments` |
| **前端 bbsSeedData.ts** | `src/data/bbsSeedData.ts` | 100+ 条硬编码种子帖，与后端 Prisma seed 重复。BBS 页面应从 API 拉取 | 改为调用 `/api/v1/forum/posts` |
| **前端 api.ts 中的 posts 相关方法** | `src/services/api.ts` lines 230-269 | 调用已废弃的 `/posts` 端点 | 统一使用 `forumApi.ts` 的方法 |
| **BBS legacy 路由** | `src/App.tsx` 中 `/bbs/legacy` | 旧版 BBS 页面路由仍存在 | 移除 legacy 路由和对应组件 |

### 1.3 模块合并清单

| 合并方向 | 涉及文件 | 具体动作 |
|----------|----------|----------|
| **PostsModule + CommentsModule → 删除，ForumModule 独占** | `backend/src/posts/*`, `backend/src/comments/*` | 1) 检查前端所有 import 引用 `api.ts` 中 posts/comments 方法的地方 → 替换为 `forumApi.ts` 方法；2) 从 `AppModule` 移除 PostsModule、CommentsModule 的 import；3) 删除两个目录 |
| **CatalogProducts + CatalogSkills 共享验证层** | `catalog-products/catalog-products.service.ts`, `catalog-skills/catalog-skills.service.ts` | 两个 service 中的 `validatePayload()` 逻辑几乎相同（21-53行重复）。提取为 `shared/catalog-validation.helper.ts`，两边引用 |
| **前端 community.ts (Dexie 本地) 渐进合并到 forumApi** | `lib/community.ts`, `src/services/forumApi.ts` | 当前 BBS 部分页面（茶水间、匿名吐槽）仍读 community.ts 的本地 IndexedDB。短期保留，中期逐步将这些板块也迁移到后端 Forum API。在 community.ts 中增加 `// @deprecated` 标记 |

### 1.4 接口统一清单

| 当前问题 | 统一后 | 改动范围 |
|----------|--------|----------|
| `/api/v1/posts` (PostsController) 和 `/api/v1/forum/posts` (ForumController) 两套端点 | **唯一端点：`/api/v1/forum/posts`** | 后端删除 PostsController；前端 `api.ts` 停用 |
| `/api/v1/posts/:id/comments` 和 `/api/v1/forum/posts/:id/comments` 两套评论接口 | **唯一端点：`/api/v1/forum/posts/:id/comments`** | 同上 |
| 前端 `api.ts` 的 `getPosts()` 返回 `BackendPost[]` (无 board/postType)，`forumApi.ts` 返回 `BackendForumPost[]` (完整字段) | **统一类型：`BackendForumPost`** | 前端统一使用 `forumApi.ts` 的类型定义 |
| Auth token fallback：`api.ts` 中 `withAuth()` 自动降级 demo → `forumApi.ts` 中 `requireRealToken()` 抛异常 | **统一策略：明确区分 guest/demo/auth 三个层级** | 详见 1.5 Auth 方案 |

### 1.5 必须冻结的模型（不再改表结构）

以下 Prisma 模型已经在生产中被使用、有种子数据和前端绑定，在完成收口之前**禁止修改表结构**：

| 模型 | 理由 |
|------|------|
| `User` | 前后端 auth、论坛、评论全部依赖 userId。字段已稳定 |
| `Post` | ForumService 920 行逻辑全部基于此表。字段丰富（board、postType、tags、moderation），不要再加列 |
| `Comment` | 结构简单，但 postId+authorId 关系已固化 |
| `Board` | slug 被前端路由硬绑定（如 `/bbs/professional`） |
| `Tag` / `PostTag` | 标签系统已在 ForumService 中完整实现 |
| `Product` / `Skill` / `ProductSkillRel` | Catalog 服务已完整实现 CRUD + 关联管理 |
| `PageConfig` | 配置下发系统已稳定运行 |

**允许新增的模型**（后续按需加表）：`Announcement`、`Report`、`AuditLog`、`Like`、`Bookmark`、`Notification`

---

## 第二部分：后端需求规格文件 (Backend Requirements Spec)

### 2.1 业务域划分

```
┌─────────────────────────────────────────────────────┐
│                    Finish Work Early                 │
├──────────┬──────────┬──────────┬────────────────────┤
│  Auth域   │  社区域   │  内容域   │  工具域（远期）     │
│          │          │          │                    │
│ • 登录    │ • 论坛    │ • 产品库  │ • 签报生成         │
│ • 注册    │ • 评论    │ • 技能库  │ • 敏感沟通         │
│ • Demo   │ • 标签    │ • 页面配置│ • 材料清单         │
│ • 会话    │ • 版块    │ • 公告    │ • 批量开票         │
│ • 角色    │ • 审核    │          │                    │
│          │ • 举报    │          │                    │
└──────────┴──────────┴──────────┴────────────────────┘
```

### 2.2 各业务域职责边界

#### Auth 域 (`backend/src/auth/`)

**职责**：用户身份验证、会话管理、角色权限判定

**当前问题与修复**：
1. `auth.module.ts` 第12行：`secret: process.env.JWT_SECRET || 'FINISH_WORK_PHASE_1_SECRET'` — 硬编码回退密钥，**必须移除**
2. Demo session 签发的 JWT 与正式用户 JWT 无区分 — 需要在 token payload 中加入 `loginMethod` 字段
3. `UserSession` 表已建但从未写入数据 — 需要接入

**修复方案**：
```typescript
// auth.module.ts — 修改后
JwtModule.register({
  global: true,
  secret: (() => {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('FATAL: JWT_SECRET environment variable is required');
    return secret;
  })(),
  signOptions: { expiresIn: '7d' },
})
```

**Token Payload 统一规范**：
```typescript
interface JwtPayload {
  sub: number;          // user.id
  username: string;
  role: UserRole;        // USER | ADMIN | MANAGER
  loginMethod: 'email' | 'phone' | 'demo';
  iat: number;
  exp: number;
}
```

**API 权限分层**：
| 层级 | Token 要求 | 可访问接口 |
|------|-----------|-----------|
| Public (游客) | 无需 token | `GET /forum/posts`, `GET /products`, `GET /skills`, `GET /page-configs/*` |
| Demo (试用) | demo token | Public + `POST /forum/posts`(限频), `POST /forum/posts/:id/comments`(限频) |
| Auth (已注册) | real token | Demo + 无限频, `PUT /forum/posts/:id`, `DELETE`(soft) |
| Admin | real token + role=ADMIN | 全部 + 审核, 配置, 用户管理 |

#### 社区域 (`backend/src/forum/`)

**职责**：帖子 CRUD、评论管理、版块管理、标签系统、审核状态机、ModerationLog

**当前状态**：ForumService 920 行，功能完整，是项目中最成熟的模块。

**待补充功能**：
1. 点赞系统（需新增 `Like` 表）
2. 收藏/书签系统（需新增 `Bookmark` 表）
3. 举报系统（需新增 `Report` 表）
4. 通知系统（需新增 `Notification` 表）

**帖子状态机（已实现）**：
```
              ┌──────────┐
              │  PENDING  │←── 新帖（如果 board.requiresReview=true）
              └────┬─────┘
          approve ↓    ↓ reject
         ┌────────┐  ┌──────────┐
         │PUBLISHED│  │ REJECTED │
         └───┬────┘  └──────────┘
       hide ↓ ↑ restore
         ┌────────┐
         │ HIDDEN  │
         └────────┘
         (任意状态) → ARCHIVED (软删除, 设 deletedAt)
```

#### 内容域 (`backend/src/catalog-products/`, `catalog-skills/`, `page-configs/`)

**职责**：产品库 CRUD、技能库 CRUD、页面配置 JSONB 管理

**当前问题**：
1. 前端 `constants/skills.ts` 硬编码了 20+ 个技能的完整定义（含 marketingGuide 大量文案），但后端 `CatalogSkillsService` 已提供完整 CRUD → 数据不同源
2. 产品和技能的 `detailData: Json` 字段结构没有 schema 约束

**修复方案**：
1. 将 `constants/skills.ts` 的数据灌入后端 Prisma seed，前端技能列表改为 API 调用
2. 在 `detailData` 的验证函数中增加 JSON Schema 校验

#### 工具域（远期，当前不建后端）

**涉及工具**：签报生成、敏感沟通助手、材料清单、批量开票、银承测算等

**当前状态**：这些工具的逻辑全部在前端完成（纯计算 + 模板填充），产物保存在 `localDB.ts` 的 IndexedDB 中。

**策略**：短期不为这些工具建后端 API。工具域的数据边界是：
- **本地保留**：草稿（DraftRecord）、生成结果（GeneratedArtifact）、导出记录（ExportRecord）、工作台条目（WorkspaceItem）
- **远期上云**：当用户需要跨设备同步工作台时，再为 localDB 加 sync 层

### 2.3 核心表清单

#### 已有表（冻结，不改结构）

| 表名 | 主要字段 | 当前状态 |
|------|---------|---------|
| `users` | id, username, nickname, passwordHash, email, phone, role, status, clientKey | ✅ 稳定 |
| `boards` | id, slug, name, requiresReview, status, sortOrder | ✅ 稳定 |
| `posts` | id, title, content, category, postType, sourceType, isOfficial, isPinned, status, boardId, authorId | ✅ 稳定 |
| `comments` | id, content, status, postId, authorId, deletedAt | ✅ 稳定 |
| `tags` / `post_tags` | Tag: slug, name, sortOrder; PostTag: postId, tagId | ✅ 稳定 |
| `moderation_logs` | id, postId, commentId, operatorId, action, reason | ✅ 稳定 |
| `page_configs` | pageKey, configData(JSONB), version, schemaVersion | ✅ 稳定 |
| `products` | slug, name, category, summary, status, detailData(JSONB) | ✅ 稳定 |
| `skills` | slug, title, category, summary, toolRoute, status, detailData(JSONB) | ✅ 稳定 |
| `product_skill_rel` | productId, skillId, sortOrder | ✅ 稳定 |
| `verification_codes` | type, target, code, purpose, used, expiresAt | ✅ 稳定 |
| `user_sessions` | userId, deviceInfo, ipAddress, tokenHash, expiresAt | ⚠️ 已建但未使用 |

#### 待新增表

```prisma
// ─── 点赞表 ───
model Like {
  id        Int      @id @default(autoincrement())
  userId    Int      @map("user_id")
  postId    Int?     @map("post_id")
  commentId Int?     @map("comment_id")
  createdAt DateTime @default(now()) @map("created_at")

  user    User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  post    Post?    @relation(fields: [postId], references: [id], onDelete: Cascade)
  comment Comment? @relation(fields: [commentId], references: [id], onDelete: Cascade)

  @@unique([userId, postId])
  @@unique([userId, commentId])
  @@map("likes")
}

// ─── 收藏表 ───
model Bookmark {
  id        Int      @id @default(autoincrement())
  userId    Int      @map("user_id")
  postId    Int      @map("post_id")
  createdAt DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  post Post @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@unique([userId, postId])
  @@map("bookmarks")
}

// ─── 举报表 ───
model Report {
  id         Int      @id @default(autoincrement())
  reporterId Int      @map("reporter_id")
  postId     Int?     @map("post_id")
  commentId  Int?     @map("comment_id")
  reason     String   @db.Text
  status     String   @default("pending") // pending | reviewed | dismissed
  reviewedAt DateTime? @map("reviewed_at")
  createdAt  DateTime @default(now()) @map("created_at")

  reporter User     @relation(fields: [reporterId], references: [id])
  post     Post?    @relation(fields: [postId], references: [id], onDelete: SetNull)
  comment  Comment? @relation(fields: [commentId], references: [id], onDelete: SetNull)

  @@index([status, createdAt])
  @@map("reports")
}

// ─── 通知表 ───
model Notification {
  id        Int      @id @default(autoincrement())
  userId    Int      @map("user_id")
  type      String   // 'comment_reply' | 'post_approved' | 'post_rejected' | 'system'
  title     String
  content   String   @db.Text
  refPostId Int?     @map("ref_post_id")
  isRead    Boolean  @default(false) @map("is_read")
  createdAt DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, isRead, createdAt])
  @@map("notifications")
}

// ─── 公告表 ───
model Announcement {
  id          Int       @id @default(autoincrement())
  title       String
  content     String    @db.Text
  priority    Int       @default(0)
  isActive    Boolean   @default(true) @map("is_active")
  publishedAt DateTime? @map("published_at")
  expiresAt   DateTime? @map("expires_at")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  @@index([isActive, priority, publishedAt])
  @@map("announcements")
}

// ─── 审计日志表（通用，不仅限于审核操作）───
model AuditLog {
  id         Int      @id @default(autoincrement())
  operatorId Int      @map("operator_id")
  action     String   // 'CREATE_PRODUCT' | 'UPDATE_SKILL' | 'DELETE_PAGE_CONFIG' | ...
  target     String   // 'product:123' | 'skill:45' | ...
  detail     Json?
  ipAddress  String?  @map("ip_address")
  createdAt  DateTime @default(now()) @map("created_at")

  operator User @relation(fields: [operatorId], references: [id])

  @@index([operatorId, createdAt])
  @@index([action, createdAt])
  @@map("audit_logs")
}
```

### 2.4 API 设计规范

**基础路径**：`/api/v1`

**响应格式**：
```json
{
  "code": 0,
  "msg": "success",
  "data": { ... }
}
```

**错误响应**（全局异常过滤器统一）：
```json
{
  "code": 40001,
  "msg": "帖子不存在",
  "data": null
}
```

**API 端点总览**：

| 域 | 端点 | 方法 | 权限 | 状态 |
|----|------|------|------|------|
| **Auth** | `/auth/demo-session` | POST | Public | ✅ 已有 |
| | `/auth/email/send-code` | POST | Public | ✅ 已有 |
| | `/auth/email/verify` | POST | Public | ✅ 已有 |
| | `/auth/me` | GET | Auth | ✅ 已有 |
| **Forum** | `/forum/boards` | GET | Public | ✅ 已有 |
| | `/forum/posts` | GET | Public | ✅ 已有 |
| | `/forum/posts/:id` | GET | Public | ✅ 已有 |
| | `/forum/posts` | POST | Demo+ | ✅ 已有 |
| | `/forum/posts/:id` | PUT | Auth | ✅ 已有 |
| | `/forum/posts/:id` | DELETE | Auth | ✅ 已有 |
| | `/forum/posts/:id/comments` | GET | Public | ✅ 已有 |
| | `/forum/posts/:id/comments` | POST | Demo+ | ✅ 已有 |
| | `/forum/admin/posts/:id/review` | POST | Admin | ✅ 已有 |
| | `/forum/admin/posts/:id/pin` | POST | Admin | ✅ 已有 |
| | `/forum/admin/comments/:id/hide` | POST | Admin | ✅ 已有 |
| **Forum 待新增** | `/forum/posts/:id/like` | POST/DELETE | Auth | ❌ 待建 |
| | `/forum/posts/:id/bookmark` | POST/DELETE | Auth | ❌ 待建 |
| | `/forum/posts/:id/report` | POST | Auth | ❌ 待建 |
| **Content** | `/products` | GET | Public | ✅ 已有 |
| | `/products/:slug` | GET | Public | ✅ 已有 |
| | `/admin/products` | POST/PUT/DELETE | Admin | ✅ 已有 |
| | `/skills` | GET | Public | ✅ 已有 |
| | `/skills/:slug` | GET | Public | ✅ 已有 |
| | `/admin/skills` | POST/PUT/DELETE | Admin | ✅ 已有 |
| | `/page-configs/:key` | GET | Public | ✅ 已有 |
| | `/admin/page-configs/:key` | PUT | Admin | ✅ 已有 |
| **待新增** | `/announcements` | GET | Public | ❌ 待建 |
| | `/admin/announcements` | CRUD | Admin | ❌ 待建 |
| | `/notifications` | GET | Auth | ❌ 待建 |
| | `/notifications/read` | PUT | Auth | ❌ 待建 |
| | `/admin/reports` | GET | Admin | ❌ 待建 |
| | `/admin/audit-logs` | GET | Admin | ❌ 待建 |

### 2.5 Auth / Role / Demo / Session 统一方案

**当前问题梳理**：
1. JWT secret 有硬编码回退 → 改为启动时强制校验 env
2. Demo token 和真实 token 无区分 → token payload 加 `loginMethod`
3. 前端 `withAuth()` 自动降级为 demo → 容易掩盖真实 auth 问题
4. `UserSession` 表空置 → 接入，登录时写入、登出时失效

**统一后的 Auth 流程**：

```
前端请求
  │
  ├─ 无 token → Public 层（只读接口）
  │
  ├─ 有 token
  │   ├─ 解析 payload.loginMethod
  │   │   ├─ 'demo' → Demo 层（读 + 限频写）
  │   │   └─ 'email'/'phone' → Auth 层
  │   │       └─ payload.role === 'ADMIN' → Admin 层
  │   └─ token 无效/过期 → 401
  │
  └─ 前端处理 401
      ├─ 如果有 real session → 提示重新登录
      └─ 如果只有 demo → 静默续期 demo session
```

**限频策略**（使用 `@nestjs/throttler`）：
| 层级 | 写操作限频 | 说明 |
|------|-----------|------|
| Demo | 5次/小时 | 发帖+评论合计 |
| Auth | 30次/小时 | 正常使用足够 |
| Admin | 不限 | 管理操作不限 |

### 2.6 Local vs Cloud 数据策略

```
┌──────────────────────────────────────────┐
│              前端数据层分布               │
├────────────────┬─────────────────────────┤
│  本地保留       │  上云（API驱动）         │
│  (IndexedDB)   │  (PostgreSQL)           │
├────────────────┼─────────────────────────┤
│ 工具草稿       │ 用户账户               │
│ 生成产物       │ 论坛帖子/评论          │
│ 导出记录       │ 产品/技能目录          │
│ 工作台条目     │ 页面配置              │
│ 客户上下文     │ 公告                  │
│ 主题偏好       │ 点赞/收藏/举报        │
│ 面板折叠状态   │ 通知                  │
│               │ 用户 Session           │
│               │ 审计日志              │
└────────────────┴─────────────────────────┘
```

**核心原则**：
1. **工具类数据纯本地**：签报草稿、测算结果、导出历史不上云。理由：敏感（客户信息）、量大（每次操作都产生）、无社交属性
2. **社区类数据纯云端**：帖子、评论、点赞必须服务端持久化。理由：多用户共享、需要审核、需要搜索
3. **客户上下文本地**：`CustomerContext` 存客户名/行业等，纯工具预填用途，不上云
4. **远期可选**：如果用户要求"换手机也能看到我的工作台"，再为 localDB 增加 sync 层。预留的 `synced` 字段已在 localDB 中设计

**前端 community.ts（Dexie 本地社区）迁移策略**：
- 当前 `lib/community.ts` 中的 `CommunityDB` 存了茶水间、匿名吐槽、二手交易等帖子在本地 IndexedDB
- 这些内容在概念上属于社区，应该上云
- 迁移方式：逐步将 `CommunityDB` 的读写方法替换为 `forumApi.ts` 的调用，保持函数签名不变
- 在后端 Board 表中新增对应版块：`pantry`(茶水间)、`anonymous`(匿名吐槽)、`marketplace`(二手交易)、`gossip`(Gossip 贴板)

### 2.7 分阶段实施方案

#### Phase 0：清理与安全加固（第1周）
- 移除 JWT 硬编码回退密钥
- 统一 token payload 结构
- 删除 PostsModule、CommentsModule
- 前端 api.ts 中 posts 方法迁移到 forumApi.ts
- 接入 @nestjs/throttler 基础限频

#### Phase 1：社区完善（第2-3周）
- 新增 Like、Bookmark、Report 表和 API
- 接入 UserSession 表（登录写入、登出失效）
- 新增 Notification 表和 API
- 前端 community.ts 开始迁移（先迁经验分享/专题，后迁匿名区）

#### Phase 2：内容管理完善（第4-5周）
- 新增 Announcement 表和 API
- 新增 AuditLog 全局拦截器
- 将 constants/skills.ts 数据灌入后端 seed
- 前端技能列表改为 API 调用
- 提取 catalog 共享验证层

#### Phase 3：管理后台（第6-8周）
- 搭建独立管理后台前端（React Admin 或类似）
- 对接所有 Admin API
- 实现用户管理、内容管理、配置管理、审核队列
- 实现 AuditLog 查看界面

#### Phase 4：工具域云化（远期）
- 为 localDB 增加可选 sync 层
- 工具使用数据统计 API
- 客户上下文跨设备同步（可选）

---

## 第三部分：后端实施优先级

### 3.1 第一周必须做的事（Phase 0）

**优先级 P0 — 不做就有安全风险或阻塞后续所有工作**

| # | 任务 | 具体文件 | 预计耗时 | 验证方法 |
|---|------|---------|---------|---------|
| 1 | **移除 JWT 硬编码回退密钥** | `backend/src/auth/auth.module.ts` 第12行 | 0.5h | 不设 JWT_SECRET 环境变量时启动应直接报错退出 |
| 2 | **Token payload 加 loginMethod** | `backend/src/auth/auth.service.ts` 的 `sign()` 调用处 | 1h | 解码 demo token 应包含 `loginMethod: 'demo'`；邮箱登录 token 包含 `loginMethod: 'email'` |
| 3 | **删除 PostsModule + CommentsModule** | 删除 `backend/src/posts/`、`backend/src/comments/`；修改 `backend/src/app.module.ts` 移除 import | 1h | `curl /api/v1/posts` 应返回 404；`curl /api/v1/forum/posts` 正常 |
| 4 | **前端 api.ts posts 方法迁移** | 找到所有 import `api.ts` 中 `getPosts`、`getPost`、`createPost`、`createComment` 的组件，替换为 `forumApi.ts` | 3h | 前端所有页面帖子列表、帖子详情、发帖、评论功能正常 |
| 5 | **接入 @nestjs/throttler** | `npm install @nestjs/throttler`；在 `app.module.ts` 全局注册；在 ForumController 写操作上加装饰器 | 1h | Demo token 连续发6条帖子，第6条应返回 429 |
| 6 | **移除前端 /bbs/legacy 路由** | `src/App.tsx` 中删除 legacy 路由 | 0.5h | 访问 `/bbs/legacy` 应跳转 404 |

**第一周总计预估：7小时**

### 3.2 第二周可以做的事（Phase 1 前半）

**优先级 P1 — 社区核心体验补齐**

| # | 任务 | 预计耗时 | 依赖 |
|---|------|---------|------|
| 1 | Prisma schema 新增 Like + Bookmark 表，运行 migration | 1h | Phase 0 完成 |
| 2 | ForumService 新增 `toggleLike()`、`toggleBookmark()` 方法 | 3h | #1 |
| 3 | ForumController 新增 `POST/DELETE /forum/posts/:id/like` 和 `/bookmark` | 1h | #2 |
| 4 | 前端帖子卡片接入点赞/收藏 API | 3h | #3 |
| 5 | 接入 UserSession 表 — 登录时写入，刷新 /auth/me 时校验 | 2h | Phase 0 #2 |

### 3.3 第三周可以做的事（Phase 1 后半）

**优先级 P1 — 社区闭环**

| # | 任务 | 预计耗时 |
|---|------|---------|
| 1 | Prisma schema 新增 Report + Notification 表 | 1h |
| 2 | 举报 API：`POST /forum/posts/:id/report` + Admin 查看举报列表 | 3h |
| 3 | 通知 API：评论回复自动生成通知 + 未读计数 | 4h |
| 4 | 前端 community.ts 迁移（经验分享、专题板块改为 API 调用） | 4h |

### 3.4 后做的事（Phase 2-3，第4-8周）

| 阶段 | 任务 | 优先级 |
|------|------|--------|
| Phase 2 | Announcement CRUD + 前端公告组件 | P2 |
| Phase 2 | AuditLog 全局拦截器 | P2 |
| Phase 2 | constants/skills.ts 数据迁移到后端 seed | P2 |
| Phase 2 | catalog 共享验证层提取 | P2 |
| Phase 3 | 管理后台前端搭建 | P2 |
| Phase 3 | 用户管理界面 | P2 |
| Phase 3 | 审核队列界面 | P2 |

### 3.5 现在不能碰的事

| 事项 | 为什么不能碰 |
|------|-------------|
| **重写前端路由结构** | 前端页面已大量稳定运行，路由改动会牵一发动全身 |
| **把 localDB 的工具数据搬上云** | 工具数据含客户敏感信息，上云需要先做加密和权限方案设计，目前没有需求 |
| **引入 GraphQL** | 当前 RESTful API 结构清晰，覆盖所有已知需求，不需要增加技术复杂度 |
| **搭建独立微服务** | 项目规模不到需要拆服务的程度，单体 NestJS 完全够用 |
| **重新设计 Prisma schema 中已有表的字段** | 这些表已有数据和前端绑定，改字段会造成连锁 migration 问题 |
| **把匿名吐槽/Gossip 板块上云** | 这类内容有过期自毁机制（expiresAt），本地 IndexedDB 天然支持，搬上云后还需额外实现定时清理。等核心板块迁移完后再处理 |
| **做 AI 审核/智能推荐** | 属于 Phase 4+ 的事，当前基础设施未就绪 |

---

## 附录：关键文件快速索引

| 文件 | 作用 | 行数 |
|------|------|------|
| `backend/src/forum/forum.service.ts` | 社区核心服务 | ~920 |
| `backend/src/auth/auth.service.ts` | Auth + Demo Session | ~120 |
| `backend/src/auth/auth.module.ts` | JWT 配置（含问题密钥） | ~25 |
| `backend/prisma/schema.prisma` | 数据模型定义 | ~327 |
| `src/services/forumApi.ts` | 前端论坛 API 层（保留） | ~230 |
| `src/services/api.ts` | 前端旧版 API 层（废弃中） | ~270 |
| `src/services/authService.ts` | 前端 Auth 状态管理 | ~200 |
| `src/services/contentApi.ts` | 前端内容 API（产品/技能/配置） | ~160 |
| `lib/localDB.ts` | 本地 IndexedDB 工具数据 | ~137 |
| `lib/community.ts` | 本地 IndexedDB 社区数据（待迁移） | ~528 |
| `lib/CustomerContext.tsx` | 客户上下文 React Context | ~80 |
| `constants/skills.ts` | 前端硬编码技能定义（待迁移） | ~458 |

---

> **下一步行动**：请 review 此文档，确认 Phase 0 的6项任务可以开始执行。确认后我将按顺序逐项实施。
