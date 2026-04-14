# Spec 004 — Frontend UX Optimizations (Mobile + Core Experience)

## Background
The frontend has functional pages but lacks critical UX foundations: toast notifications, loading states, search debounce, form validation, and mobile interaction patterns. These gaps compound across every page and degrade the mobile-first experience.

## Priority 1: Global Toast + Notification System [DONE]
- Create a lightweight Toast component (`src/components/common/Toast.tsx`) with types: `success`, `error`, `info`, `warning`
- Create a toast context/hook (`useToast`) for imperative calls: `toast.success('已复制到剪贴板')`
- Replace all `alert()` calls across the codebase with toast notifications:
  - [x] `Workspace.tsx` — 发帖失败 alert
  - [x] `ChecklistGenerator.tsx` — 导出失败 alert (already using toast)
  - [x] `FormalThread.tsx` — 回复失败 alert
  - [x] `FormalTopic.tsx` — 提交失败 alert
  - [x] `CommunityThread.tsx` — 评论失败 alert
  - [x] `CommunityTopic.tsx` — 提交失败 alert
  - [x] `BBS.tsx` — 发布失败 alert
  - [x] `BatchBillingTool.tsx` — 演示 alert
- Toast auto-dismisses after 3s, supports manual dismiss, stacks up to 3 visible
- Position: top-center on mobile, respects safe-area-inset-top

## Priority 2: Search Debounce [TODO]
- Create a `useDebounce` hook in `lib/utils.ts`
- Apply debounce (300ms) to:
  - `Feed.tsx` — 搜索帖子
  - `SkillsLibrary.tsx` — 搜索工具
  - `Workspace.tsx` — 搜索帖子（如有）
- The filter logic should run against the debounced value, not the raw input

## Priority 3: Skeleton Loading States [TODO]
- Replace inline loading text with skeleton placeholders in:
  - `Feed.tsx` — 帖子列表 skeleton (3 items)
  - `Workspace.tsx` — 帖子列表 skeleton
  - `SkillsLibrary.tsx` — 卡片网格 skeleton
- Skeleton should match the actual card shape and size to prevent layout shift
- Add `isLoading` state handling where missing

## Priority 4: Mobile Collapsible Content (BusinessGuide) [DONE — Enhanced]
- BusinessGuide product detail page reorganized around RM workflow phases:
  - **出门前准备** — 产品概况、核心要素、行业打法
  - **现场初筛** — 准入判断、产品边界、实战判断逻辑、必问问题
  - **对话话术** — 进门对话、对客话术(初次/深入/补件)、异议处理、话术包
  - **执行落地** — 材料清单、推进路径、提速清单、高频问题
  - **风控合规** — 禁止承诺、表达边界、禁忌表达、红线声明
- Added **5秒判断卡片** (长易担 vs 长融保快速决策) — surfaced above all sections
- Added **产品对比速览** — 核心区别直接展示在顶部
- Sticky section nav on mobile for quick jumping
- Expand All / Collapse All buttons
- Each section starts collapsed by default (except "出门前准备")
- Color-coded section headers for visual scanning

## Priority 5: Form Validation (replace alert) [PARTIAL]
- [x] `Workspace.tsx` 发帖表单 — alert replaced with toast warning (登录检查)
- [x] `ChecklistGenerator.tsx` — already using toast
- [ ] Inline error text below form fields (Workspace title/content validation)
- [ ] 检核表：企业名称不能为空（生成 Word 时）— inline validation

## Acceptance Criteria
1. [x] No `alert()` calls remain in the frontend codebase
2. [ ] Search inputs have smooth debounce (no lag, no jank)
3. [ ] Loading states show skeleton, not blank pages
4. [x] BusinessGuide on mobile shows collapsible sections, not an endless scroll of cards
5. [x] Toast is visible and functional across all pages
6. [x] Build passes (`npm run build`)
