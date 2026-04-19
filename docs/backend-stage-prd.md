# Finish Work Early 后端阶段需求

## 1. 阶段目标

本阶段不是推翻现有站点，而是在保留“营销端 + 事务端 + 沉淀端”方向的前提下，把现有前端原型收成一个可持续接后端的业务平台。

当前阶段只做四件事：

1. 收口 API 和模块边界
2. 建立后端需求和演进约束
3. 搭出可继续扩展的后端基础框架
4. 稳定手机端入口依赖的社区/BBS 数据结构

## 2. 不可推翻项

1. 不推翻现有信息架构
2. 不重写所有页面
3. 不改变“营销端 + 事务端 + 沉淀端”的产品方向
4. 所有新增后端能力都必须逐步接入现有页面

## 3. 后端域收口

### 3.1 前台产品域

- 营销端：客户沟通、产品打法、测算辅助
- 事务端：材料清单、签报/OA、流程辅助、模板生成
- 沉淀端：工作台、论坛/BBS、经验社区、匿名讨论

### 3.2 后端服务域

- `auth`：登录、JWT、邮箱验证码、demo 会话开关
- `forum`：正式论坛、官方帮助、官方更新、兼容旧版 feed/BBS 帖子
- `catalog-products`：产品库
- `catalog-skills`：技能库
- `page-configs`：页面配置中心
- `users`：当前用户和“我的内容”

### 3.3 API 收口原则

社区只保留一套主域：`/api/v1/forum/*`。

- 正式论坛页面走结构化 `board`
- 旧版 feed/BBS 页面通过兼容参数继续走 `forum`
- 不再继续扩散 `posts + comments + forum` 三套并行业务逻辑

## 4. 本地数据与云端边界

### 4.1 本地保留

只允许以下内容留在本地：

- 工具草稿
- 导出记录
- 工作台最近产物
- 轻量偏好
- 客户上下文临时缓存

对应现有实现：

- [`lib/localDB.ts`](/Users/daisy/gemini demo/finish work early/Finish-work-early/lib/localDB.ts)
- [`lib/CustomerContext.tsx`](/Users/daisy/gemini demo/finish work early/Finish-work-early/lib/CustomerContext.tsx)

### 4.2 云端托管

必须进入后端的数据：

- 用户身份和权限
- 论坛/BBS/帮助中心内容
- 产品库、技能库、页面配置
- 后续需要跨端共享的客户资料、材料任务、流程状态

### 4.3 同步原则

本地数据未来只做两类演进：

1. 明确不上云的纯个人缓存
2. 带同步状态的可同步草稿

在同步协议没定义前，不把 `localDB` 直接当正式业务库。

## 5. 论坛/BBS 结构要求

### 5.1 正式论坛

- 官方帮助
- 官方更新
- 经验分享
- 系统操作
- 合规探讨
- 产品实战
- Skills 交流

### 5.2 BBS/茶水间

BBS 保留现有入口和视觉，不另起一套后端服务。兼容层继续允许按 `category` 读写，但底层统一归入 `forum` 域处理。

这意味着：

- 手机端入口不需要重写
- 正式论坛和地下茶水间可共用帖子/评论主模型
- 后续若要把 BBS 升级为独立 board，只需要做数据迁移，不需要重做页面协议

## 6. 鉴权要求

### 6.1 本阶段必须满足

- JWT 不允许硬编码 fallback secret
- demo session 必须由环境变量显式控制
- 写操作只接受真实登录态，不接受 demo token 冒充业务身份

### 6.2 核心环境变量

- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `ENABLE_DEMO_AUTH`
- `DATABASE_URL`
- `SMTP_*`

## 7. Catalog 接入策略

本阶段不重写前端产品页和技能页，但后端必须成为唯一真源：

- 页面默认数据可以继续保留本地 fallback
- 生产读取优先走后端 catalog/page-config
- 新增、下线、排序、文案修订统一通过后端 CRUD 完成

## 8. 分期

### Phase A: 基线收口

- `forum` 成为唯一社区域
- `auth` 配置安全化
- `users/me/posts` 改为复用 `forum`
- 文档明确本地/云端边界

### Phase B: 业务能力补齐

- 材料清单模板中心
- 签报/OA 模板生成任务
- 客户上下文上云与多端共享
- 产品测算结果持久化

### Phase C: 平台化

- 管理后台
- 审核与审计
- 可同步工作台
- 经验沉淀和知识检索

## 9. 当前代码落点

- 论坛主域：[`backend/src/forum/forum.service.ts`](/Users/daisy/gemini demo/finish work early/Finish-work-early/backend/src/forum/forum.service.ts)
- 鉴权主域：[`backend/src/auth`](/Users/daisy/gemini demo/finish work early/Finish-work-early/backend/src/auth)
- 产品库：[`backend/src/catalog-products`](/Users/daisy/gemini demo/finish work early/Finish-work-early/backend/src/catalog-products)
- 技能库：[`backend/src/catalog-skills`](/Users/daisy/gemini demo/finish work early/Finish-work-early/backend/src/catalog-skills)
- 页面配置：[`backend/src/page-configs`](/Users/daisy/gemini demo/finish work early/Finish-work-early/backend/src/page-configs)

## 10. 使用方式

这份文档不是最终蓝图，而是当前阶段的约束。后续新增需求只要满足两条就可以接：

1. 不破坏现有三端结构
2. 优先并入现有后端域，而不是再长一套平行模块
