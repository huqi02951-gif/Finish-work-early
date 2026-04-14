# 规格 001：后端数据模型与 API 联调

## 背景
项目已有 NestJS + Prisma + PostgreSQL 后端框架，发现页和发布页已打通。但大部分业务数据仍依赖前端 Mock 或静态配置。

## 需求
1. 在 Prisma schema 中补充以下数据模型：
   - `Skill`：技能定义（id, name, category, scene, description, status, marketingGuide JSON）
   - `ProductGuideCard`：产品指南（id, name, category, sellingPoints, entryCriteria, scenes JSON）
   - `SceneTag`：场景标签枚举（对客户、对审查、对中后台、对自己）
   - `MaterialChecklistTemplate`：材料清单模板（templateCode, fields JSON, rules JSON）
   - `User`：用户（已有，需关联帖子、收藏等）
   - `Post`：帖子（已有，需关联评论、点赞等）

2. 生成对应的 REST API 端点：
   - `GET /api/skills` — Skills 列表（支持 category、scene 筛选）
   - `GET /api/skills/:id` — 单个 Skill 详情
   - `GET /api/products` — 产品指南列表
   - `GET /api/products/:id` — 单个产品指南
   - `GET /api/materials/:templateCode` — 材料清单模板

3. 前端替换：将 `components/SkillsLibrary.tsx` 和相关页面从 Mock 数据切换为 API 调用

## 验收标准
- `npm run prisma:generate` 无错误
- 所有新增 API 端点返回正确的 JSON 数据
- Skills 列表页面显示来自后端 API 的数据
- 前端无 TypeScript 编译错误
