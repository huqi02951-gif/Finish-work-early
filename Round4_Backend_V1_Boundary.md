# 第四轮：后端第一版边界确认

> v4.0 | 2026-04-19 | 状态：冻结，可执行

---

# 任务1：CustomerContext 第一版接法决议

## 1.1 现状

| 层 | 状态 | 具体情况 |
|----|------|---------|
| 后端 | ✅ 完整可用 | Prisma model 已建、Service 有 listMine/create/update/remove 四个方法、Controller 有 GET/POST/PATCH/DELETE 四个端点、已接入 AuditLog |
| 前端 | ❌ 未接入后端 | `lib/CustomerContext.tsx` 纯 localStorage 单客户模式。只被 `Workspace.tsx` 一个文件消费，用于工具预填客户名/行业等 |

## 1.2 决议：第四轮不切主源

**推荐方案：本地为主，后端只做 CRUD 预备。**

理由：
1. 前端只有 `Workspace.tsx` 一个消费方，且是"当前正在操作的客户"这种会话级状态，不是"客户列表管理"
2. 前端当前是单客户模式（一次只填一个客户信息），后端是多客户列表模式（listMine 返回数组）。接入需要改 UI 交互模型（加选择器/列表），不是简单替换数据源
3. 后端 CRUD 已完整且有审计日志，不需要额外开发
4. 本轮目标是收口，不是扩功能

## 1.3 后端 CustomerContext 模块本轮做到什么程度

**什么都不做。已经够了。**

| 组件 | 当前状态 | 本轮操作 |
|------|---------|---------|
| Prisma model CustomerContext | 已建 | 不改 |
| CustomerContextService | listMine/create/update/remove 四个方法 | 不改 |
| CustomerContextController | GET/POST/PATCH/DELETE 四个端点 | 不改 |
| AuditLog 联动 | create/update/delete 三个操作都记录 | 不改 |
| 前端接入 | 未接入 | 不做 |

## 1.4 前端真正接通后端的时机

**建议放在第六轮或之后。**

前置条件（全部满足才做）：
1. api.ts 收口完成（第四轮 Step A-D 完成）
2. 前端需要"客户列表"功能（可以保存多个客户、切换当前客户、搜索历史客户）
3. 有 UI 设计方案（列表选择器/下拉/侧边栏）

接入时的改法（提前说清楚，但不是现在做）：
1. `lib/CustomerContext.tsx` 的 `useCustomer()` hook 保留接口不变
2. 内部实现从 localStorage 单对象 → 后端 API 多客户列表 + 当前选中项
3. 新增 `selectedCustomerId` state，用于标记当前操作的客户
4. `setCustomer()` 改为：先写后端 POST/PATCH → 成功后更新本地 state
5. 加载时：调 `GET /customer-context/me` 拉列表，取最近使用的一条为默认

---

# 任务2：Draft / Artifact 第一版 CRUD 边界决议

## 2.1 现状

| 模块 | 后端 | 前端 | 消费方 |
|------|------|------|--------|
| Draft | ❌ 无 Prisma model，无 Service/Controller | `localDB.ts` 的 `saveDraft()` / `getDrafts()` | 当前无前端调用方（函数已导出但未被 import） |
| Artifact | ❌ 无 Prisma model，无 Service/Controller | `localDB.ts` 的 `saveArtifact()` / `getRecentArtifacts()` | `components/shared/ActionBar.tsx`（保存生成结果、查看历史）、`src/pages/Workspace.tsx`（展示最近产物列表） |

## 2.2 Draft 本轮做到什么程度

**建 Prisma model + 建 Service（只含基础 CRUD）+ 建 Controller。不接前端。**

| 步骤 | 做/不做 | 说明 |
|------|---------|------|
| 在 schema.prisma 新增 Draft model | ✅ 做 | 按第三轮草案的字段建 |
| 跑 migration | ✅ 做 | `prisma migrate dev --name add_draft_artifact` |
| 建 DraftService | ✅ 做 | 只含 4 个方法：`listMine(userId, toolId?)`、`upsert(userId, toolId, title, data)`、`getOne(userId, id)`、`remove(userId, id)` |
| 建 DraftController | ✅ 做 | GET /drafts/me、POST /drafts、GET /drafts/:id、DELETE /drafts/:id，全部 AuthGuard |
| 前端 localDB.ts 改为调后端 | ❌ 不做 | 等第五轮或更后 |
| AuditLog 联动 | ❌ 不做 | 草稿是高频写操作，记审计日志会产生大量无价值数据 |

## 2.3 Artifact 本轮做到什么程度

**同 Draft：建 Prisma model + Service + Controller。不接前端。**

| 步骤 | 做/不做 | 说明 |
|------|---------|------|
| 在 schema.prisma 新增 Artifact model | ✅ 做 | 按第三轮草案的字段建 |
| 跑 migration（与 Draft 合一次） | ✅ 做 | 同一次 migration |
| 建 ArtifactService | ✅ 做 | 只含 3 个方法：`listMine(userId, toolId?, limit?)`、`create(userId, toolId, title, content, metadata?)`、`remove(userId, id)` |
| 建 ArtifactController | ✅ 做 | GET /artifacts/me、POST /artifacts、DELETE /artifacts/:id，全部 AuthGuard |
| Artifact 编辑/更新接口 | ❌ 不做 | 产物生成后不编辑，第三轮已决定无 updatedAt |
| 前端 ActionBar.tsx / Workspace.tsx 改为调后端 | ❌ 不做 | 等第五轮或更后 |
| AuditLog 联动 | ❌ 不做 | 产物是用户私有数据，不需要管理员审计 |

## 2.4 哪些 CRUD 先做（汇总）

| API 端点 | 方法 | 本轮做 | 说明 |
|----------|------|--------|------|
| `GET /drafts/me` | listMine | ✅ | 支持 ?toolId= 可选筛选 |
| `POST /drafts` | upsert | ✅ | body: { toolId, title, data }。同 toolId+title 已存在则更新 |
| `GET /drafts/:id` | getOne | ✅ | 只能查自己的 |
| `DELETE /drafts/:id` | remove | ✅ | 软删除（设 deletedAt） |
| `GET /artifacts/me` | listMine | ✅ | 支持 ?toolId= 和 ?limit= |
| `POST /artifacts` | create | ✅ | body: { toolId, title, content, metadata? } |
| `DELETE /artifacts/:id` | remove | ✅ | 软删除 |
| `PUT /drafts/:id` | update | ❌ | upsert 已覆盖更新场景 |
| `PATCH /artifacts/:id` | update | ❌ | 产物不可编辑 |

## 2.5 哪些同步策略现在不做

| 策略 | 不做理由 |
|------|---------|
| 本地 IndexedDB → 后端自动同步 | 需要设计冲突解决（updatedAt 比较）、离线队列、重试机制。链路复杂，本轮不碰 |
| 后端 → 本地 IndexedDB 回写缓存 | 需要在前端加缓存失效逻辑，增加调试难度 |
| localDB.ts 中 `synced` 字段标记 | 目前该字段在注释中提及但未实现。不要提前实现 |
| 批量导入历史本地数据到后端 | 需要设计去重策略（同 toolId+title 的草稿如何合并），不做 |
| WebSocket 推送同步通知 | 远期需求，不做 |

## 2.6 Codex 落地红线

1. **Draft 和 Artifact 放在同一个 NestJS module 中**，命名为 `ToolDataModule`（`backend/src/tool-data/`）。不要建两个独立 module
2. **Service 中所有查询必须带 `where: { userId, deletedAt: null }`**。用户只能操作自己的数据
3. **不建 ExportRecord 表**。导出记录继续前端 localDB
4. **不建 WorkspaceItem 表**。工作台条目继续前端 localDB
5. **不加分页**。listMine 直接返回数组，不返回 PagedResponse。草稿和产物量级小（单用户通常 < 100 条），不需要分页
6. **不做全文搜索**。不对 content/data 建 GIN 索引
7. **不做 batch 端点**（批量创建、批量删除）
8. **不改 localDB.ts 的任何代码**
9. **不改 ActionBar.tsx 和 Workspace.tsx 的任何代码**
10. **不在 app.module.ts 之外的地方 import ToolDataModule**——只在 AppModule.imports 注册一次

## 2.7 Codex 执行清单

### Step 1：schema.prisma 新增 Draft + Artifact model

在 `backend/prisma/schema.prisma` 文件末尾追加 Draft 和 Artifact model。需同时在 User model 中加上关系字段：`drafts Draft[]` 和 `artifacts Artifact[]`。

跑 `npx prisma migrate dev --name add_draft_artifact`。

**停止条件**：migration 成功，`npx prisma generate` 无报错。

### Step 2：建 ToolDataModule

创建以下文件：
- `backend/src/tool-data/tool-data.module.ts`
- `backend/src/tool-data/draft.service.ts`
- `backend/src/tool-data/artifact.service.ts`
- `backend/src/tool-data/draft.controller.ts`
- `backend/src/tool-data/artifact.controller.ts`

在 `app.module.ts` 的 imports 中注册 `ToolDataModule`。

**停止条件**：后端启动无报错。以下 curl 全部返回预期结果（需要有效 JWT token）：
```
GET  /api/v1/drafts/me       → 200 + []
POST /api/v1/drafts           → 201 + { id, toolId, title, ... }
GET  /api/v1/drafts/:id       → 200 + { ... }
DELETE /api/v1/drafts/:id     → 200 + { success: true }
GET  /api/v1/artifacts/me     → 200 + []
POST /api/v1/artifacts        → 201 + { id, toolId, title, content, ... }
DELETE /api/v1/artifacts/:id  → 200 + { success: true }
```

### Step 3：验证

`npm run build` 后端编译通过。所有已有端点（Forum、Auth、CatalogProducts、CatalogSkills、PageConfigs、CustomerContext、AuditLog、Profiles、Roles）不受影响。

**回报确认**：贴出 Step 2 的 curl 测试结果 + 后端启动日志。

---

> **本文档即第四轮冻结版本。Step 1 → 2 → 3 顺序执行。**
