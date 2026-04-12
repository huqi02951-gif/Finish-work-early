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
}

export type SceneType = '对客户' | '对审查' | '对中后台' | '对自己' | '对审查报批' | '对中后台协同' | '对审查报批 + 对客户沟通' | '对自己 / 对中后台';

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
