# Ralph Fix Plan — Finish Work Early

## High Priority
- [ ] 完善 NestJS 后端：补全 Prisma schema 中的业务数据模型（Skills、场景标签、材料清单模板、产品营销话术包）
- [ ] 前后端联调：将前端 Mock 数据替换为真实 API 调用（发现页帖子列表、发布页、Skills 列表）
- [ ] 完善 Skill 详情页：打通 marketingGuide、sceneTags、scenes 等复杂字段的渲染与交互
- [ ] 材料清单中心（MaterialChecklistCenter）：实现规则引擎运行时（可见性、必填、默认值、计算字段）
- [ ] 场景中心（ScenarioCenter）：实现"对客户"、"对审查"、"对中后台"、"对自己"四个视角的内容切换与筛选
- [ ] 搜索 debounce 与 Skeleton loading（Spec 004 剩余项）

## Medium Priority
- [ ] Google AI 集成：实现 Skills 内的 AI 对话/生成功能（营销话术生成、材料清单自动填充）
- [ ] 利率优惠签报工具（RateOfferTool）：对接后端计算接口
- [ ] 银承/存单测算工具（AcceptanceCalculator）：完善计算逻辑与导出功能
- [ ] BBS 社区：完善评论、点赞、关注、话题标签功能
- [ ] 动态 Feed 流：实现分页加载、排序、过滤
- [ ] 文档导出优化：优化 docx/xlsx 导出模板，支持自定义模板引擎

## Low Priority
- [ ] 性能优化：代码分割、懒加载、图片优化
- [ ] GitHub Pages 部署自动化：完善 CI/CD 工作流
- [ ] 敏感沟通助手（SensitiveCommAssistant）：补充敏感词库和场景模板
- [ ] 新闻稿排版助手（NewsTypesettingAssistant）：完善拖拽排版和预览
- [ ] 更新记录中心（UpdateLog）：自动化版本变更日志
- [ ] 反馈/共创（Feedback）：用户建议收集与筛选

## Completed
- [x] 项目初始化（Vite + React + TypeScript + Tailwind）
- [x] 基础路由结构（HashRouter + 多页面）
- [x] Skills 工具库页面（搜索 + 筛选 UI）
- [x] 首页 Hero + 场景入口 + Skills 展示
- [x] 产品 guide 内容配置（content/ 目录）
- [x] 类型系统定义（types.ts — Skill、MarketingGuide、ProductGuideCard 等）
- [x] 后端基础框架搭建（NestJS + Prisma + PostgreSQL）
- [x] 发现页/发布页前后端联调（PostgreSQL 写入与读取）
- [x] Playwright E2E 测试框架集成
- [x] GitHub Pages 部署工作流
- [x] 前端 UX 基建（Spec 004）：Toast 系统、alert 全替换、BusinessGuide 工作流折叠分区
- [x] BusinessGuide 重构：按客户经理工作流重组内容（出门前准备→现场初筛→对话话术→执行落地→风控合规）
- [x] 手机端 5 秒判断卡片（长易担 vs 长融保快速决策）

## Notes
- 项目核心目标：为银行一线客户经理提供可复用的数字技能工具集
- 所有内容（话术、指南、清单）需保持中文，贴近银行业务场景
- 前端已具备完整页面骨架，重点在后端联调、规则引擎、AI 集成
- Ralph 循环时应优先打通"数据链路"（后端 API → 前端展示），再完善交互细节
