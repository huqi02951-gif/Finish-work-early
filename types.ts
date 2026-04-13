export type SkillDisplayStatus =
  | '在线可用'
  | '需后端支持'
  | '本地工具'
  | '开发中'
  | '开发中/能力介绍';

export interface MarketingGuide {
  framework: string;
  understanding: string;
  industryFocus: string;
  targetCustomers: string;
  openingTalk: string;
  comparison: string;
  interestRates: string;
  materials: string;
  speedUp: string;
  rolePlay: string;
  summary: string;
  productBoundary?: {
    suitable: string[];
    unsuitable: string[];
  };
  highFreqQA?: {
    question: string;
    answer: string;
    internalLogic: string;
    prohibited: string;
  }[];
  speedUpChecklist?: {
    rmActions: string[];
    customerCooperation: string[];
  };
  industryMarketing?: {
    manufacturing: string;
    tech: string;
  };
  scripts?: {
    initial: string;
    deep: string;
    followUp: string;
  };
  practicalLogic?: string[];
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  scene: string;
  audience: string[];
  input: string[];
  output: string[];
  form: string;
  status: SkillDisplayStatus[] | SkillDisplayStatus;
  note?: string;
  description: string;
  toolRoute?: string;
  marketingGuide?: MarketingGuide;
  /** 场景标签，用于 Skills 列表筛选。后续可由数据库驱动 */
  sceneTags?: SceneTag[];
}

export type SceneType = '对客户' | '对审查' | '对中后台' | '对自己' | '对审查报批' | '对中后台协同' | '对审查报批 + 对客户沟通' | '对自己 / 对中后台';

/**
 * 场景标签 — 用于 Skills 和产品的场景化分类与筛选
 * 后续可扩展为数据库枚举字段
 */
export type SceneTag = '对客户' | '对审查' | '对中后台' | '对自己';

/**
 * 产品场景化内容 — 将产品拆成"对客户"和"对审查"两套视角
 * 后续会由 CMS / 数据库驱动，当前先用 config 文件承载
 */
export interface ProductSceneCustomer {
  /** 产品核心卖点（对客视角） */
  highlights: string[];
  /** 营销切入话术 */
  marketingEntry: string;
  /** 可直接发给客户的话术（初次/深入/推进） */
  scripts: { label: string; content: string }[];
  /** 材料清单入口说明 */
  materialsIntro: string;
  /** 客户高频问答 */
  faq: { q: string; a: string }[];
}

export interface ProductSceneReview {
  /** 授信上报检核表 */
  checklist: string[];
  /** 审查说明模板（可复制） */
  reviewTemplate: string;
  /** 授信上报内容模板（可复制） */
  creditReportTemplate: string;
  /** 常见审查问题与应对 */
  reviewFAQ: { q: string; a: string }[];
  /** 禁止用语 */
  forbidden: string[];
}

export interface ProductScenes {
  customer: ProductSceneCustomer;
  review: ProductSceneReview;
}

export type ProductMessagingChannel = 'wechat' | 'phone' | 'face_to_face';

export interface ProductMessagingPack {
  oneLineSellingPoint?: string;
  directCustomerScripts: {
    code: string;
    title: string;
    channel: ProductMessagingChannel;
    variant?: 'short' | 'medium';
    content: string;
  }[];
  marketingEntryPoints?: {
    code: string;
    title: string;
    content: string;
  }[];
  suitableCustomerTalks?: {
    code: string;
    title: string;
    customerProfile: string;
    content: string;
  }[];
  internalUnderstanding?: string[];
  valueVsOrdinaryLoan?: string[];
  canSay?: string[];
  shouldNotSayDead?: string[];
  industryTalks?: {
    code: string;
    title: string;
    industry: string;
    content: string;
  }[];
  mediumLongTermNarratives?: string[];
  whyNowNarratives?: string[];
  compareWithOrdinaryCredit?: string[];
  reviewSubmissionScripts: {
    code: string;
    title: string;
    content: string;
  }[];
  commonQA: {
    question: string;
    answer: string;
    prohibited?: string;
  }[];
  forbiddenCommitments: string[];
  fastTrackTips: string[];
  marketingTemplates?: {
    firstVisit: string;
    followUp: string;
    rateReply: string;
    subsidyReply: string;
    taxDocsReply: string;
  };
}

export type ChecklistRuleOperator =
  | 'eq'
  | 'neq'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'in';

export interface ChecklistRuleCondition {
  field: string;
  op: ChecklistRuleOperator;
  value: string | number | boolean | string[];
}

export interface ChecklistDefaultValueRule {
  field: string;
  defaultValue: string | number | boolean;
  readonly?: boolean;
}

export interface ChecklistRequiredRule {
  field: string;
  required?: boolean;
  requiredWhen?: ChecklistRuleCondition[];
}

export interface ChecklistVisibilityRule {
  field: string;
  visibleWhen: ChecklistRuleCondition[];
}

export interface ChecklistComputedField {
  field: string;
  type: 'boolean' | 'enum' | 'text';
  expression: string;
}

export interface ChecklistRuntimeRuleSet {
  templateCode: string;
  defaultValueRules: ChecklistDefaultValueRule[];
  requiredRules: ChecklistRequiredRule[];
  visibilityRules: ChecklistVisibilityRule[];
  computedFields: ChecklistComputedField[];
}

export interface ManualQuickGuide {
  moduleCode: string;
  moduleName: string;
  whatItDoes?: string[];
  whereToClick?: string[];
  whatYouWillSee?: string[];
  whenToUse?: string[];
  sceneGuides?: Array<{
    sceneTag: SceneTag;
    whatItDoes: string[];
    whereToClick: string[];
    whatYouWillSee: string[];
    whenToUse: string[];
  }>;
}

export interface ProductComparisonTalkPack {
  code: string;
  title: string;
  internalJudgement: string[];
  customerExplanation: string[];
}

export interface ForumGuidePost {
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  sceneTags: SceneTag[];
  sortOrder: number;
  sections: {
    title: string;
    body: string[];
  }[];
}

export interface ProductGuideCard {
  id: string;
  name: string;
  category: string;
  targetCustomers: string[];
  suitableIndustries: string[];
  overview: string;
  sellingPoints: string[];
  entryCriteria: string[];
  commonBlockers: string[];
  openingTalk: string;
  mustAskQuestions: string[];
  needRecognition: string;
  materials: string[];
  steps: string[];
  objections: { q: string; a: string }[];
  forbiddenPhrases: string[];
  details?: {
    rate: string;
    term: string;
    pricing: string;
    subsidy: string;
    guarantee: string;
    creditMethod: string;
    creditCriteria: string;
  };
  comparison?: {
    with: string;
    points: string[];
  };
  relatedSkill?: {
    name: string;
    path: string;
  };
  productBoundary?: {
    suitable: string[];
    unsuitable: string[];
  };
  highFreqQA?: {
    question: string;
    answer: string;
    internalLogic: string;
    prohibited: string;
  }[];
  speedUpChecklist?: {
    rmActions: string[];
    customerCooperation: string[];
  };
  industryMarketing?: {
    manufacturing: string;
    tech: string;
  };
  scripts?: {
    initial: string;
    deep: string;
    followUp: string;
  };
  practicalLogic?: string[];
  /**
   * 场景化拆分内容：对客户 + 对审查
   * 后续由数据库/CMS驱动，当前从 config 文件读取
   */
  scenes?: ProductScenes;
  /**
   * APEX 产品补充话术包：对客直发 / 对审查上报 / Q&A / 禁止承诺 / 提速提示
   */
  messagingPack?: ProductMessagingPack;
  /**
   * 模板引擎标识，供检核表和上报说明模块按 code 拉配置
   */
  checklistTemplateCode?: string;
  reviewSubmissionTemplateCode?: string;
}

export interface HomePageScenarioConfig {
  id: 'customer' | 'review' | 'backoffice' | 'self';
  title: string;
  desc: string;
  path: string;
}

export interface HomePageConfig {
  hero: {
    title: string;
    subtitle: string;
  };
  scenarios: HomePageScenarioConfig[];
  footer: {
    badgeText: string;
    creditText: string;
  };
}

export interface SkillsLibraryPageConfig {
  badgeText: string;
  title: string;
  subtitle: string;
  filterOptions: string[];
  emptyState: {
    title: string;
    description: string;
    resetLabel: string;
  };
}
