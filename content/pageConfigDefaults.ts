import type { HomePageConfig, SkillsLibraryPageConfig } from '../types';

export const HOME_PAGE_DEFAULT_CONFIG: HomePageConfig = {
  hero: {
    title: '今天想处理什么业务？',
    subtitle: '让工具拳拳到肉，让专业能力信手拈来。',
  },
  scenarios: [
    {
      id: 'customer',
      title: '对客户',
      desc: '营销话术、业务打法、产品测算',
      path: '/scenarios?tab=customer',
    },
    {
      id: 'review',
      title: '对审查',
      desc: '政策解读、准入核对、合规建议',
      path: '/scenarios?tab=review',
    },
    {
      id: 'backoffice',
      title: '对中后台',
      desc: '流程指引、材料清单、系统操作',
      path: '/scenarios?tab=backoffice',
    },
    {
      id: 'self',
      title: '对自己',
      desc: '经验沉淀、效率工具、职场成长',
      path: '/scenarios?tab=self',
    },
  ],
  footer: {
    badgeText: 'Finish Work Early',
    creditText: 'Designed by XD.HU & PHYLLIS FENG',
  },
};

export const SKILLS_LIBRARY_PAGE_DEFAULT_CONFIG: SkillsLibraryPageConfig = {
  badgeText: 'finish work early',
  title: 'Skills 工具库',
  subtitle: '全量 Skills 展示与检索。每个 Skill 对应一个具体业务痛点，把经验、流程、模板、口径、测算逻辑固化下来。',
  filterOptions: ['全部', '在线可用', '本地工具', '需后端支持', '开发中/能力介绍'],
  emptyState: {
    title: '未找到匹配的 Skills',
    description: '尝试更换搜索词或筛选条件',
    resetLabel: '重置搜索',
  },
};
