import type { ManualQuickGuide } from '../types';

export const MANUAL_QUICK_GUIDES: ManualQuickGuide[] = [
  {
    moduleCode: 'home',
    moduleName: '首页',
    whatItDoes: ['帮你快速找到入口', '先按当前要办的事分流'],
    whereToClick: ['先看首页四个方向入口', '按你现在是对客户、对审查、对中后台还是对自己来点'],
    whatYouWillSee: ['四个场景入口', '每个方向对应的模块和工具'],
    whenToUse: ['刚进系统不知道先去哪', '手上有事，但还不知道该用哪个模块'],
  },
  {
    moduleCode: 'business_guide',
    moduleName: '业务通',
    whatItDoes: ['帮你快速看懂产品', '帮你直接拿话术、材料、审查说明'],
    whereToClick: ['进入业务通', '点对应产品卡片', '按页面里的对客户或对审查内容往下看'],
    whatYouWillSee: ['产品特点', '适合客户', '对客话术', '审查说明', '材料方向'],
    whenToUse: ['客户问产品怎么做时', '你要先做初筛时', '准备报审或准备找客户补材料时'],
  },
  {
    moduleCode: 'skills',
    moduleName: 'Skills 工具库',
    whatItDoes: ['像工具箱一样帮你找功能', '按场景直接找能生成内容的工具'],
    whereToClick: ['先点场景标签', '再看卡片说明和入口按钮'],
    whatYouWillSee: ['工具名称', '适用场景', '能生成什么内容', '进入入口'],
    whenToUse: ['知道要干什么，但不知道该用哪个工具', '想从场景反推合适工具'],
  },
  {
    moduleCode: 'scene_usage',
    moduleName: '场景使用说明',
    sceneGuides: [
      {
        sceneTag: '对客户',
        whatItDoes: ['帮你讲产品', '帮你发客户消息', '帮你整理客户要配合的材料'],
        whereToClick: ['点“对客户”标签', '优先看产品类、沟通类、材料类工具'],
        whatYouWillSee: ['对客话术', '客户常见问题回答', '材料方向', '推进提醒'],
        whenToUse: ['拜访客户前', '客户问产品时', '客户要补资料时'],
      },
      {
        sceneTag: '对审查',
        whatItDoes: ['帮你做准入判断', '帮你生成给审查员的说明', '帮你统一口径'],
        whereToClick: ['点“对审查”标签', '优先看检核表、上报说明、审查模板类工具'],
        whatYouWillSee: ['检核逻辑', '上报模板', '风险提示', '禁忌口径'],
        whenToUse: ['准备报审前', '需要整理上报内容时', '怕审查口径不一致时'],
      },
    ],
  },
];
