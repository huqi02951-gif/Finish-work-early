# 前端 API 化优先级

## P1：先改，收益最高，风险最低

### 1. Skills 列表页

- [components/SkillsLibrary.tsx](/Users/daisy/gemini demo/finish work early/Finish-work-early/components/SkillsLibrary.tsx)
- 现状：已具备 `API > 本地常量 fallback`
- 建议：继续以 [`getSkills`](/Users/daisy/gemini demo/finish work early/Finish-work-early/src/services/contentApi.ts) 为主，逐步削弱 [`constants/skills.ts`](/Users/daisy/gemini demo/finish work early/Finish-work-early/constants/skills.ts) 的页面直读

### 2. 业务通首页

- [components/tools/BusinessGuide.tsx](/Users/daisy/gemini demo/finish work early/Finish-work-early/components/tools/BusinessGuide.tsx)
- 现状：已接 [`getProducts`](/Users/daisy/gemini demo/finish work early/Finish-work-early/src/services/contentApi.ts)，仍保留本地 fallback
- 建议：以 catalog-products 为真源，先稳定产品卡片、排序、上下架

### 3. 首页 page config

- [src/pages/Home.tsx](/Users/daisy/gemini demo/finish work early/Finish-work-early/src/pages/Home.tsx)
- 现状：已接 [`getPageConfig`](/Users/daisy/gemini demo/finish work early/Finish-work-early/src/services/contentApi.ts)，本地默认值仍保留
- 建议：先把首页 hero 和 scenario 配置稳定成后台可控

## P2：第二批改，等待 P1 稳定后接

### 4. Skill 详情页

- [components/SkillDetail.tsx](/Users/daisy/gemini demo/finish work early/Finish-work-early/components/SkillDetail.tsx)
- 现状：仍直接读 [`constants/skills.ts`](/Users/daisy/gemini demo/finish work early/Finish-work-early/constants/skills.ts)
- 建议：切到 `getSkillDetail(slug)`，保留 fallback

### 5. 产品详情与产品场景页

- [components/ProductScenePage.tsx](/Users/daisy/gemini demo/finish work early/Finish-work-early/components/ProductScenePage.tsx)
- [components/ApexPreviewPage.tsx](/Users/daisy/gemini demo/finish work early/Finish-work-early/components/ApexPreviewPage.tsx)
- 现状：直接读 [`content/businessGuideProducts.ts`](/Users/daisy/gemini demo/finish work early/Finish-work-early/content/businessGuideProducts.ts)
- 建议：切到 `getProductDetail(slug)`，产品长文案和场景内容改为 catalog 后端下发

## P3：最后处理，依赖页面编排策略

### 6. 场景中心

- [components/ScenarioCenter.tsx](/Users/daisy/gemini demo/finish work early/Finish-work-early/components/ScenarioCenter.tsx)
- 现状：直接读 skills 常量，并按场景自行分发
- 建议：待 skills catalog 稳定后，再决定是否引入场景配置 API

### 7. 旧版营销首页组件

- [components/Home.tsx](/Users/daisy/gemini demo/finish work early/Finish-work-early/components/Home.tsx)
- 现状：直接依赖 skills 常量做展示统计
- 建议：最后再切，避免在首页改动期同时动两套入口

## 当前不建议现在就改的点

1. 不一次性删除所有本地常量
2. 不把全部页面改成纯后端驱动
3. 不在 page-config 里直接下发复杂组件树

现阶段最合理的做法是：

- 后端成为真源
- 前端保留 fallback
- 按页面逐块替换，不推翻当前网站方向
