
export interface Skill {
  id: string;
  name: string;
  category: string;
  scene: string;
  audience: string[];
  input: string[];
  output: string[];
  form: string;
  status: ('在线可用' | '需后端支持' | '本地工具' | '开发中' | '开发中/能力介绍')[] | '在线可用' | '需后端支持' | '本地工具' | '开发中' | '开发中/能力介绍';
  note?: string;
  description: string;
  toolRoute?: string;
  marketingGuide?: {
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
    // New fields for professional RM guide
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
  };
}

export type SceneType = '对客户' | '对审查' | '对中后台' | '对自己' | '对审查报批' | '对中后台协同' | '对审查报批 + 对客户沟通' | '对自己 / 对中后台';
