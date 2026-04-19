# 第五轮-A：冻结边界回审

> v5A | 2026-04-19 | 状态：回审完成

---

# 任务1：ToolDataModule 回审

## 1.1 Prisma model 对照

| 检查项 | R4 冻结规格 | 实际落地 | 判定 |
|--------|------------|---------|------|
| Draft 字段 | id, userId, toolId, title, data(Json), createdAt, updatedAt, deletedAt | 完全一致 | ✅ 合格 |
| Artifact 字段 | id, userId, toolId, title, content(Text), metadata(Json?), createdAt, deletedAt | 完全一致，无 updatedAt | ✅ 合格 |
| Draft 索引 | (userId, toolId, updatedAt) + (userId, deletedAt, updatedAt) | 完全一致 | ✅ 合格 |
| Artifact 索引 | (userId, toolId, createdAt) + (userId, deletedAt, createdAt) | 完全一致 | ✅ 合格 |
| 多余表 | 不建 ExportRecord / WorkspaceItem | 未建 | ✅ 合格 |

## 1.2 Service 方法对照

| 检查项 | R4 规定 | 实际落地 | 判定 |
|--------|--------|---------|------|
| DraftService.listMine(userId, toolId?) | ✅ 要做 | ✅ 已实现，带 deletedAt: null 过滤 | ✅ 合格 |
| DraftService.upsert(userId, toolId, title, data) | ✅ 要做 | ✅ 已实现，按 userId+toolId+title 去重 | ✅ 合格 |
| DraftService.getOne(userId, id) | ✅ 要做 | ✅ 已实现，带 userId 校验 | ✅ 合格 |
| DraftService.remove(userId, id) | ✅ 要做，软删除 | ✅ 已实现，设 deletedAt | ✅ 合格 |
| ArtifactService.listMine(userId, toolId?, limit?) | ✅ 要做 | ✅ 已实现，limit 上限 100 | ✅ 合格 |
| ArtifactService.create(userId, toolId, title, content, metadata?) | ✅ 要做 | ✅ 已实现 | ✅ 合格 |
| ArtifactService.remove(userId, id) | ✅ 要做，软删除 | ✅ 已实现 | ✅ 合格 |
| AuditLog 联动 | ❌ 不做 | ❌ 未做 | ✅ 合格 |
| Artifact update/patch | ❌ 不做 | ❌ 未做 | ✅ 合格 |

## 1.3 Controller 端点对照

| 端点 | R4 规定 | 实际 | 判定 |
|------|--------|------|------|
| GET /drafts/me | ✅ | ✅ AuthGuard + ?toolId | ✅ |
| POST /drafts | ✅ | ✅ AuthGuard | ✅ |
| GET /drafts/:id | ✅ | ✅ AuthGuard | ✅ |
| DELETE /drafts/:id | ✅ | ✅ AuthGuard | ✅ |
| GET /artifacts/me | ✅ | ✅ AuthGuard + ?toolId + ?limit | ✅ |
| POST /artifacts | ✅ | ✅ AuthGuard | ✅ |
| DELETE /artifacts/:id | ✅ | ✅ AuthGuard | ✅ |
| PUT / PATCH 任何 | ❌ 不做 | ❌ 未做 | ✅ |
| batch 端点 | ❌ 不做 | ❌ 未做 | ✅ |

## 1.4 模块结构对照

| 检查项 | R4 规定 | 实际 | 判定 |
|--------|--------|------|------|
| Draft + Artifact 在同一模块 | ToolDataModule | ✅ `backend/src/tool-data/tool-data.module.ts` | ✅ |
| AppModule 注册 | 只在 imports 注册一次 | ✅ `app.module.ts` 第14行 import + 第28行注册 | ✅ |
| 前端改动 | 不改 localDB / ActionBar / Workspace | 未改 | ✅ |

## 1.5 需要收紧的点

**一个小问题**：DraftService.upsert() 中 `deletedAt: null` 的更新逻辑（第60-64行）在更新已有草稿时会设置 `deletedAt: null`。这不是 bug（确保恢复已软删除的同名草稿），但行为隐含——如果用户曾删除一个草稿，再用相同 toolId+title 创建，会命中已删除的旧记录并恢复它。R4 未明确规定此行为。

**决议**：接受现状，不改。upsert 查询已带 `deletedAt: null`，所以只会匹配未删除的草稿。已删除的草稿不会被误恢复。代码正确。

**总结：ToolDataModule 完全在 R4 冻结边界内，无超界，无遗漏。**

---

# 任务2：CustomerContext 边界回审

## 2.1 第五轮-A 是否切前端主源

**不切。理由不变。**

上一轮的判断依然成立：前端 `lib/CustomerContext.tsx` 是单客户会话级状态（只被 Workspace.tsx 消费），后端是多客户列表 CRUD。二者交互模型不同，接入需要先做 UI 变更。本轮目标是闭合工程落地，不做新功能。

## 2.2 后端 CustomerContext 是否达到"够用但不接前端"

**是。确认完整。**

| 能力 | 状态 |
|------|------|
| Prisma model | ✅ 已有，字段完整 |
| Service CRUD | ✅ listMine/create/update/remove |
| Controller 端点 | ✅ GET/POST/PATCH/DELETE，全部 AuthGuard |
| AuditLog 联动 | ✅ create/update/delete 三个操作都记录 |
| 软删除 | ✅ deletedAt |
| 搜索 | ✅ listMine 支持 ?search= 参数（名称/联系人/行业模糊搜索） |

**不需要额外开发。**

## 2.3 前端接通推迟到第几轮

**推迟到第六轮或之后。** 与 R4 决议一致，不修改。

前置条件不变：需要 UI 设计方案（客户选择器）+ api.ts 收口完成。

---

# 任务3：第五轮-B 轻增强准入判断

## 3.1 判断基准

准入条件：
1. 不新增 Prisma 表
2. 不新增后端模块
3. 改动范围限于前端页面/组件
4. 不破坏已收口的 api.ts / forumApi.ts 边界
5. 可在 1-2 天内完成

## 3.2 逐项判断

### BBS / 地下茶水间轻增强

| 方向 | 准入 | 理由 |
|------|------|------|
| BBSHome / ProfessionalZone 从 bbsSeedData 硬编码切到 forumApi | ✅ 准入 | 只改前端 import 和数据加载逻辑。后端 Forum API 已完整。BBSHome.tsx 当前 import `professionalPosts, pantryPosts` from bbsSeedData，应改为 forumApi.getPosts({ boardSlug })。这是收口工作的延续，不是新功能 |
| PantryPage / PantryThreadPage 从 bbsSeedData 切到 forumApi | ✅ 准入 | 同上。PantryPage.tsx import `pantryPosts` from bbsSeedData |
| GossipBoard 从 bbsSeedData 切到 forumApi | ✅ 准入 | GossipBoard.tsx import `gossipPosts` from bbsSeedData |
| 完成上述切换后删除 bbsSeedData.ts | ✅ 准入 | 前置：所有引用方已切到 API。确认无 import 残留后再删 |
| lib/community.ts (Dexie 本地社区) 迁移到 forumApi | ❌ 不准入 | community.ts 有独立数据模型（CommunityEntry/CommunityReply/CommunityKind/expiresAt 过期机制），迁移需要后端 Board 新增 + 过期清理逻辑。超出轻增强范围 |
| 新增匿名发帖功能 | ❌ 不准入 | 需要后端改 Forum 逻辑（匿名身份处理），超出 R5-B 范围 |
| 新增帖子点赞 / 收藏 | ❌ 不准入 | 需要新增 Prisma 表，违反准入条件 #1 |

### "我的"轻增强

| 方向 | 准入 | 理由 |
|------|------|------|
| Profile.tsx 中 `listCommunityEntries` 改为 forumApi.getMyPosts | ✅ 准入 | Profile.tsx 第15行从 lib/community import listCommunityEntries，用于展示"我的帖子"。改为 forumApi.getMyPosts() 是数据源收口，不是新功能 |
| Profile.tsx 中 `apiService.getCurrentUser()` 保留 | — 不涉及 | 这个调用在 api.ts 中，auth 职责，不动 |
| 新增"我的草稿"列表页 | ❌ 不准入 | 后端 Draft CRUD 已有，但前端还没接。接入需要新建 UI 组件 + 新建 service 层调用。这不是轻增强 |
| 新增"我的收藏"功能 | ❌ 不准入 | 需要新增 Prisma 表 |

### "对自己"轻增强

| 方向 | 准入 | 理由 |
|------|------|------|
| Workspace.tsx 工具产物历史展示优化（纯 UI 调整） | ✅ 准入 | 只改组件渲染逻辑，不改数据源，不改 localDB |
| ToMyselfSpace.tsx 中 `createSelfGossipThread` 从 community.ts 切到 forumApi | ❌ 不准入 | Gossip 帖子有 expiresAt 过期机制，后端 Forum 不支持自动过期。迁移超出轻增强范围 |
| 新增跨设备工作台同步 | ❌ 不准入 | 需要前端接入后端 Draft/Artifact API + 设计同步策略。链路长 |

## 3.3 R5-B 推荐执行清单（准入项汇总）

| 序号 | 任务 | 涉及文件 | 依赖 |
|------|------|---------|------|
| 1 | BBSHome.tsx 从 bbsSeedData 切到 forumApi | BBSHome.tsx | 后端需有对应 board 的 seed 数据 |
| 2 | ProfessionalZone.tsx 从 bbsSeedData 切到 forumApi | ProfessionalZone.tsx | 同上 |
| 3 | PantryPage.tsx 从 bbsSeedData 切到 forumApi | PantryPage.tsx | 同上 |
| 4 | PantryThreadPage.tsx 从 bbsSeedData 切到 forumApi | PantryThreadPage.tsx | 同上 |
| 5 | GossipBoard.tsx 从 bbsSeedData 切到 forumApi | GossipBoard.tsx | 同上 |
| 6 | Profile.tsx 从 lib/community 切到 forumApi.getMyPosts | Profile.tsx | 无 |
| 7 | 确认无 bbsSeedData import 残留后删除 bbsSeedData.ts | bbsSeedData.ts | #1-#5 全部完成 |

**前置检查**：确认后端 Board 表中是否已有 `professional`、`pantry`、`gossip` 等 board slug 的 seed 数据。如果没有，需要先跑 seed 脚本补齐。

---

> **本文档即第五轮-A 回审结果。ToolDataModule 和 CustomerContext 均在冻结边界内，R5-B 可执行 7 项准入任务。**
