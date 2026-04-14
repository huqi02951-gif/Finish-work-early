/**
 * ═══════════════════════════════════════════════════════════════════════
 *  产品工作台配置 — 配置驱动的产品 Agent Workspace
 *
 *  每个产品通过 config 定义：
 *    - primary / secondary 动作（立即运行、一键材料清单等）
 *    - workspace sections（页面渲染哪些区块、顺序、对应数据字段）
 *    - 准入/边界/路径/禁止承诺等结构化字段
 *
 *  后续新增产品时，只需在此文件添加配置，BusinessGuide 自动渲染。
 * ═══════════════════════════════════════════════════════════════════════
 */

import type { ProductGuideCard } from '../types';

/* ─── Workspace Action 类型 ─── */
export interface WorkspaceAction {
  /** 动作唯一标识 */
  code: string;
  /** 按钮文案 */
  label: string;
  /** 跳转路由 */
  route: string;
  /** 按钮样式 */
  variant: 'primary' | 'secondary' | 'outline';
  /** 图标名（lucide） */
  icon: string;
  /** 副标题/说明 */
  subtitle?: string;
}

/* ─── Workspace Section 类型 ─── */
export interface WorkspaceSection {
  /** 区块唯一标识 */
  code: string;
  /** 区块标题 */
  title: string;
  /** 区块对应 ProductGuideCard 上的字段路径（dot notation） */
  dataField: string;
  /** 渲染类型 */
  renderAs: 'list' | 'text' | 'qa-list' | 'warning-list' | 'stats' | 'comparison' | 'steps';
  /** 所属栏目：客户向 / 内部向 / 合规 */
  category: 'customer' | 'internal' | 'compliance';
}

/* ─── 产品工作台配置 ─── */
export interface ProductWorkspaceConfig {
  /** 产品 ID（对应 ProductGuideCard.id） */
  productId: string;
  /** 工作台主标题 */
  title: string;
  /** 工作台副标题 */
  subtitle: string;
  /** 主动作区 */
  primaryActions: WorkspaceAction[];
  /** 页面 Section 布局定义 */
  sections: WorkspaceSection[];
}

/* ═══════════════════════════════════════════════════════════════════════
 *  长易担 — 工作台配置
 * ═══════════════════════════════════════════════════════════════════════ */
export const CHANG_YI_DAN_WORKSPACE: ProductWorkspaceConfig = {
  productId: 'chang_yi_dan',
  title: '长易担 · 产品工作台',
  subtitle: '简易审批备案经营贷 — 高效模式',
  primaryActions: [
    {
      code: 'generate',
      label: '立即运行',
      route: '/checklist-generator?product=chang_yi_dan',
      variant: 'primary',
      icon: 'FileText',
      subtitle: '生成检核表 + 授信方案',
    },
    {
      code: 'customer-scene',
      label: '对客户实战',
      route: '/product-scene?product=chang_yi_dan&scene=customer',
      variant: 'secondary',
      icon: 'Users',
      subtitle: '卖点 · 话术 · 高频问答',
    },
    {
      code: 'review-scene',
      label: '对审查实战',
      route: '/product-scene?product=chang_yi_dan&scene=review',
      variant: 'outline',
      icon: 'ShieldCheck',
      subtitle: '检核表 · 模板 · 上报',
    },
  ],
  sections: [
    // ── 产品概况 ──
    { code: 'overview', title: '产品关键要素', dataField: 'details', renderAs: 'stats', category: 'customer' },
    { code: 'selling_points', title: '核心卖点', dataField: 'sellingPoints', renderAs: 'list', category: 'customer' },
    // ── 准入判断 ──
    { code: 'entry', title: '准入门槛 / 边界', dataField: 'entryCriteria', renderAs: 'list', category: 'customer' },
    { code: 'boundary', title: '产品边界', dataField: 'productBoundary', renderAs: 'list', category: 'customer' },
    // ── 客户对话 ──
    { code: 'opening', title: '需要问客户的关键信息', dataField: 'mustAskQuestions', renderAs: 'list', category: 'customer' },
    { code: 'need_recognition', title: '需求识别信号', dataField: 'needRecognition', renderAs: 'text', category: 'customer' },
    { code: 'scripts', title: '对客话术模板', dataField: 'scripts', renderAs: 'list', category: 'customer' },
    { code: 'faq_customer', title: '客户高频问答', dataField: 'highFreqQA', renderAs: 'qa-list', category: 'customer' },
    // ── 推进 ──
    { code: 'steps', title: '推进路径', dataField: 'steps', renderAs: 'steps', category: 'customer' },
    { code: 'speed_up', title: '提速放款清单', dataField: 'speedUpChecklist', renderAs: 'list', category: 'customer' },
    // ── 内部 ──
    { code: 'practical_logic', title: '实战判断逻辑', dataField: 'practicalLogic', renderAs: 'list', category: 'internal' },
    { code: 'faq_internal', title: '客户经理内部逻辑', dataField: 'highFreqQA', renderAs: 'qa-list', category: 'internal' },
    // ── 合规 ──
    { code: 'forbidden', title: '禁止口头承诺', dataField: 'forbiddenPhrases', renderAs: 'warning-list', category: 'compliance' },
    { code: 'prohibited_qa', title: 'QA 禁止口径', dataField: 'highFreqQA', renderAs: 'warning-list', category: 'compliance' },
    // ── 对比 ──
    { code: 'comparison', title: '与竞品区别', dataField: 'comparison', renderAs: 'comparison', category: 'customer' },
  ],
};

/* ═══════════════════════════════════════════════════════════════════════
 *  长融保 — 工作台配置
 * ═══════════════════════════════════════════════════════════════════════ */
export const CHANG_RONG_BAO_WORKSPACE: ProductWorkspaceConfig = {
  productId: 'chang_rong_bao',
  title: '长融保 · 产品工作台',
  subtitle: '政策性增信经营贷 — 传统模式',
  primaryActions: [
    {
      code: 'generate',
      label: '立即运行',
      route: '/checklist-generator?product=chang_rong_bao',
      variant: 'primary',
      icon: 'FileText',
      subtitle: '生成检核表 + 授信方案',
    },
    {
      code: 'customer-scene',
      label: '对客户实战',
      route: '/product-scene?product=chang_rong_bao&scene=customer',
      variant: 'secondary',
      icon: 'Users',
      subtitle: '卖点 · 话术 · 高频问答',
    },
    {
      code: 'review-scene',
      label: '对审查实战',
      route: '/product-scene?product=chang_rong_bao&scene=review',
      variant: 'outline',
      icon: 'ShieldCheck',
      subtitle: '检核表 · 模板 · 上报',
    },
  ],
  sections: [
    { code: 'overview', title: '产品关键要素', dataField: 'details', renderAs: 'stats', category: 'customer' },
    { code: 'selling_points', title: '核心卖点', dataField: 'sellingPoints', renderAs: 'list', category: 'customer' },
    { code: 'entry', title: '准入门槛 / 边界', dataField: 'entryCriteria', renderAs: 'list', category: 'customer' },
    { code: 'boundary', title: '产品边界', dataField: 'productBoundary', renderAs: 'list', category: 'customer' },
    { code: 'opening', title: '需要问客户的关键信息', dataField: 'mustAskQuestions', renderAs: 'list', category: 'customer' },
    { code: 'need_recognition', title: '需求识别信号', dataField: 'needRecognition', renderAs: 'text', category: 'customer' },
    { code: 'scripts', title: '对客话术模板', dataField: 'scripts', renderAs: 'list', category: 'customer' },
    { code: 'faq_customer', title: '客户高频问答', dataField: 'highFreqQA', renderAs: 'qa-list', category: 'customer' },
    { code: 'steps', title: '推进路径', dataField: 'steps', renderAs: 'steps', category: 'customer' },
    { code: 'speed_up', title: '提速放款清单', dataField: 'speedUpChecklist', renderAs: 'list', category: 'customer' },
    { code: 'practical_logic', title: '实战判断逻辑', dataField: 'practicalLogic', renderAs: 'list', category: 'internal' },
    { code: 'faq_internal', title: '客户经理内部逻辑', dataField: 'highFreqQA', renderAs: 'qa-list', category: 'internal' },
    { code: 'forbidden', title: '禁止口头承诺', dataField: 'forbiddenPhrases', renderAs: 'warning-list', category: 'compliance' },
    { code: 'prohibited_qa', title: 'QA 禁止口径', dataField: 'highFreqQA', renderAs: 'warning-list', category: 'compliance' },
    { code: 'comparison', title: '与竞品区别', dataField: 'comparison', renderAs: 'comparison', category: 'customer' },
  ],
};

/* ═══════════════════════════════════════════════════════════════════════
 *  产品工作台配置注册表 — 按产品 ID 索引
 *  新增产品时，在此注册即可，BusinessGuide 自动适配
 * ═══════════════════════════════════════════════════════════════════════ */
export const PRODUCT_WORKSPACE_CONFIGS: Record<string, ProductWorkspaceConfig> = {
  chang_yi_dan: CHANG_YI_DAN_WORKSPACE,
  chang_rong_bao: CHANG_RONG_BAO_WORKSPACE,
};

/**
 * 获取产品工作台配置
 */
export function getProductWorkspace(productId: string): ProductWorkspaceConfig | undefined {
  return PRODUCT_WORKSPACE_CONFIGS[productId];
}

/**
 * 获取产品的主动作列表（供卡片/工作台使用）
 */
export function getProductActions(productId: string): WorkspaceAction[] {
  return PRODUCT_WORKSPACE_CONFIGS[productId]?.primaryActions ?? [];
}
