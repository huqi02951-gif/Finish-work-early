import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ChevronRight, 
  Copy, 
  Search, 
  LayoutDashboard, 
  Briefcase, 
  Target, 
  User, 
  MessageSquare, 
  Zap, 
  ShieldCheck, 
  FileText, 
  TrendingUp, 
  AlertCircle,
  CheckCircle2,
  Info,
  Users,
  Sparkles,
  ArrowRight,
  Clock,
  Ban,
  Settings,
  RefreshCcw,
  Star
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import AppLayout from '../../src/components/layout/AppLayout';

// --- Types & Data ---

interface BusinessGuideData {
  products: ProductCard[];
  industries: IndustryCard[];
  scenarios: ScenarioCard[];
  personas: PersonaCard[];
}

interface ProductCard {
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
  // New professional fields
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

interface IndustryCard {
  id: string;
  name: string;
  businessModel: string;
  upstreamDownstream: string;
  capitalNeed: string;
  risks: string[];
  recommendedProducts: string[];
  firstVisitTips: string[];
  mustAskQuestions: string[];
}

interface ScenarioCard {
  id: string;
  name: string;
  goal: string;
  openingTalk: string;
  mustAskQuestions: string[];
  riskPoints: string[];
  recommendedProducts: string[];
  nextSteps: string[];
}

interface PersonaCard {
  id: string;
  name: string;
  style: string;
  goodAtCustomers: string[];
  goodAtProducts: string[];
  openingStyle: string;
  questionStyle: string;
  pushStyle: string;
  advantages: string[];
  weaknesses: string[];
  typicalOpening: string;
  typicalFollowUp: string;
  typicalClose: string;
  objectionHandling: string;
}

const GUIDE_DATA: BusinessGuideData = {
  products: [
    {
      id: 'chang_rong_bao',
      name: '长融保',
      category: '政策性增信经营贷 (传统模式)',
      targetCustomers: ['中小微企业', '个体工商户', '小微企业主', '农户'],
      suitableIndustries: ['制造业', '科技类', '各行业中小微'],
      overview: '传统银担合作模式，由厦门市中小企业融资担保有限公司提供80%本金连带责任保证担保。适用于信用基础稍弱但经营真实、有明确资金用途的企业。',
      details: {
        rate: '执行普惠金融优惠利率，通常为 LPR 加点 (具体视客户评级而定)',
        term: '最长可达 3 年，支持分期还款或到期还本',
        pricing: '银行利息 + 担保费 (0.5%/年)',
        subsidy: '符合条件可申请厦门市中小微企业融资担保费补贴 (最高补贴 50%)',
        guarantee: '厦门中小担提供 80% 本金连带责任保证担保',
        creditMethod: '线下人工审批，额度最高可达 1000 万元',
        creditCriteria: '真实经营满 1 年，有报税流水，纳税信用非 D，无重大负面记录'
      },
      comparison: {
        with: '长易担',
        points: [
          '审批方式：长融保为传统线下审批，长易担为简易备案模式',
          '效率：长易担效率更高，长融保适合额度需求更大或情况更复杂的客户',
          '准入：长融保准入相对宽泛，长易担对纳税额和经营年限有硬性要求'
        ]
      },
      sellingPoints: ['逻辑成熟', '模式稳定', '适配面广', '政策性增信', '额度上限高'],
      entryCriteria: [
        '【共同准入】厦门注册民营企业，非国企/政府融资平台',
        '【共同准入】无经营异常、失信、强执、重大处罚记录',
        '【共同准入】本行预警、不良、重大风险限制名单外',
        '【共同准入】真实经营满1年，有报税流水，纳税信用非D',
        '【专项准入】信用基础稍弱但经营真实，有明确设备/原材料采购需求',
        '【专项准入】支持先进制造业、科技类企业购买设备及原材料、技改、数智化改造等'
      ],
      commonBlockers: ['非一年期以上贷款', '随借随还循环贷', '无真实经营场景', '房地产/金融/类金融行业', '非厦门注册企业'],
      openingTalk: '“张总，最近国家在推‘民间投资专项担保计划’，针对咱们制造业企业有专门的增信支持。咱们今年如果有设备更新或者原材料备货的打算，可以看看这个政策性产品，期限长，还能解决抵押物不足的问题。”',
      mustAskQuestions: ['“今年是否有设备更新或技改计划？”', '“目前的融资期限是否匹配经营周期？”', '“是否有担保增信的需求？”', '“去年的纳税额大概在什么量级？”', '“是否有他行担保在保业务？”'],
      needRecognition: '客户提到“想拿长一点期限”、“信用额度不够”、“有明确资金用途”或“抵押物不足”。',
      materials: ['主体材料 (执照、章程)', '经营材料 (购销合同、流水)', '财税材料 (近两年财报、纳税证明)', '用途材料 (采购合同/发票/技改方案)'],
      steps: ['客户向中小担申请意向', '中小担出具《担保意向函》', '银行审批并落实条件', '中小担出具《放款通知书》', '银行放款'],
      objections: [
        { q: '“为什么要担保费？”', a: '“担保费是 0.5%/年，但通过担保增信，您可以获得更长周期、更稳妥的额度，且符合条件还能申请 50% 的保费贴补，实际成本极低。”' },
        { q: '“审批时间会不会很长？”', a: '“我们会和中小担保持紧密沟通，只要资料齐全，我们会通过绿色通道加快进度，通常在 10-15 个工作日内完成。”' },
        { q: '“利率能再低点吗？”', a: '“这款产品本身就是政策性的，利率已经非常优惠。加上保费补贴，您的综合融资成本在市场上是非常有竞争力的。”' }
      ],
      forbiddenPhrases: ['“随借随还”', '“循环贷”', '“100% 成功”'],
      relatedSkill: { name: '利率报价工具', path: '/rate-offer' },
      productBoundary: {
        suitable: ["厦门注册民营企业", "真实经营且有报税流水", "有明确的设备/原材料采购需求", "信用记录良好但抵押物不足"],
        unsuitable: ["国企或政府融资平台", "经营异常或有重大处罚记录", "随借随还需求客户", "非真实经营用途"]
      },
      highFreqQA: [
        {
          question: "长融保最高能做多少？最长多久？",
          answer: "单户最高可达1000万元，期限通常为1-3年，具体根据您的经营周期和      entryCriteria: [
        '【共同准入】厦门注册民营企业，非国企/政府融资平台',
        '【专项准入】首次纳入不能有当前逾期，不做展期/借新还旧/无还本续贷',
        '【专项准入】重点支持先进制造业、科技型企业',
        '【专项准入】原则上不接受建筑施工类企业（高新技术企业除外）',
        '【专项准入】实收资本、资产总额、营业收入、社保人数不能为0',
        '【专项准入】近6个月内不能发生实控人/法人/大股东重大变更',
        '【300万以上硬门槛】成立满2年，纳税信用非D，近12个月缴税≥5万',
        '【300万以上硬门槛】资产负债率≤70%，且需符合营授比要求'
      ],
      commonBlockers: ['当前有逾期', '展期/借新还旧业务', '中小担存量在保客户', '纳税额不达标', '建筑施工类企业'],
      openingTalk: '“李总，咱们公司作为高新技术企业，正好符合我们最新的‘长易担’简易审批政策。这个产品专门给咱们这种优质制造业和科技企业提速，银行审完直接备案，不用像以前那样两头跑，放款非常快。”',
      mustAskQuestions: ['“近12个月缴税总额是否不低于5万元？”', '“是否有设备采购或技术改造需求？”', '“目前是否有他行在保担保业务？”', '“资产负债率大概在什么水平？”', '“是否为中小担存量在保客户？”'],
      needRecognition: '优质企业提到“需要快速到账”、“追求极致效率”、“制造业技改”或“高新政策对接”。',
      materials: ['基础主体材料', '近两年纳税证明', '主要购销合同', '资产负债表 (300万以上必供)'],
      steps: ['银行审批通过', '向中小担报送备案', '中小担现场尽调 (300万以上必做)', '保费到账', '放款'],
�并另行申报，并非产品自带属性。",
          internalLogic: "贴息是财政行为，银行仅协助申报，不保证结果。",
          prohibited: "禁止承诺“贷款即享1.5%贴息”。"
        }
      ],
      speedUpChecklist: {
        rmActions: ["前置查询纳税信用等级", "核实企业是否为中小担在保客户", "确认贷款用途是否在支持范围内"],
        customerCooperation: ["提供近两年审计报告或报税报表", "准备好采购合同或技改方案", "配合中小担现场尽调（如需）"]
      },
      industryMarketing: {
        manufacturing: "从设备更新和技改升级切入，强调中长期资金与生产周期的匹配。",
        tech: "从研发投入和订单兑现切入，强调政策性增信对轻资产企业的支持。"
      },
      scripts: {
        initial: "【初次触达】张总您好，我是厦行的XX。近期国家针对民营企业有‘民间投资专项担保计划’，咱们公司如果今年有扩产或技改计划，这个政策性增信产品非常合适，期限长且支持力度大，方便的话我给您发个简要介绍？",
        deep: "【深入沟通】张总，长融保的核心在于‘政策增信’。由中小担提供80%担保，解决咱们抵押物不足的问题。虽然是非循环模式，但一年以上的期限能让咱们资金安排更从容。关于保费和贴息，我们可以根据最新的政策口径帮您测算叠加空间。",
        followUp: "【补件推进】张总，长融保的审批需要咱们提供近两年的报税报表和具体的采购合同。这些材料越详实，中小担出具意向函的速度就越快，咱们争取这周把材料报上去？"
      },
      practicalLogic: [
        "第一步：看注册地和企业性质（必须厦门民营，排除国企/平台）",
        "第二步：看纳税等级（非D级）和经营异常（一票否决项）",
        "第三步：看资金用途（必须是设备/原料/技改等真实经营用途）",
        "第四步：确认客户是否接受一年期以上非循环模式（关键心理预期管理）",
        "【初筛秘籍】现场先看执照经营范围、查纳税信用等级、问是否有他行担保在保。"
      ]
    },
    {
      id: 'chang_yi_dan',
      name: '长易担',
      category: '简易审批备案经营贷 (高效模式)',
      targetCustomers: ['优质中小微企业', '制造业', '科技型企业'],
      suitableIndustries: ['先进制造业', '科技类', '数智化升级企业'],
      overview: '简易审批、单笔备案模式，由中小担提供 80% 本金担保。突出“快”和“简”，适合纳税规范、信用优良的优质企业。',
      details: {
        rate: '执行普惠金融优惠利率，通常优于传统模式',
        term: '通常为 1 年期，可根据政策续作',
        pricing: '银行利息 + 担保费 (通常 0.5%/年)',
        subsidy: '同样享受厦门市保费贴补政策',
        guarantee: '中小担 80% 本金担保，单笔备案',
        creditMethod: '简易审批流程，银行审批后向担保公司备案即可',
        creditCriteria: '成立满 2 年，近 12 个月缴税总额 ≥ 5 万元，纳税信用非 D，资产负债率 ≤ 70%'
      },
      comparison: {
        with: '长融保',
        points: [
          '效率：长易担是“备案制”，银行审完即报备，速度极快',
          '门槛：长易担有明确的纳税门槛 (5万) 和年限门槛 (2年)',
          '尽调：300万以下免现场尽调，300万以上需现场尽调'
        ]
      },
      sellingPoints: ['效率极高', '政策属性强', '单笔备案', '感知直接', '资料简化'],
      entryCriteria: [
        '【共同准入】厦门注册民营企业，非国企/政府融资平台',
        '【专项准入】首次纳入不能有当前逾期，不做展期/借新还旧/无还本续贷',
        '【专项准入】原则上不做建筑施工类（除高新技术企业外）',
        '【专项准入】实收资本、资产总额、营业收入、社保人数不能为0',
        '【专项准入】近6个月内不能发生实控人/法人/大股东重大变更',
        '【300万以上硬门槛】成立满2年，纳税信用非D，近12个月缴税≥5万',
        '【300万以上硬门槛】资产负债率≤70%，且需符合营授比要求'
      ],
      commonBlockers: ['当前有逾期', '展期/借新还旧业务', '中小担在保风险客户', '纳税额不达标'],
      openingTalk: '“李总，咱们公司作为高新技术企业，正好符合我们最新的‘长易担’简易审批政策。这个产品专门给咱们这种优质制造业和科技企业提速，银行审完直接备案，不用像以前那样两跑，放款非常快。”',
      mustAskQuestions: ['“近12个月缴税总额是否不低于5万元？”', '“是否有设备采购或技术改造需求？”', '“目前是否有他行在保担保业务？”', '“资产负债率大概在什么水平？”'],
      needRecognition: '优质企业提到“需要快速到账”、“追求极致效率”或“制造业技改”。',
      materials: ['基础主体材料', '近两年纳税证明', '主要购销合同', '资产负债表'],
      steps: ['银行审批通过', '向中小担报送备案', '中小担现场尽调 (300万以上)', '保费到账', '放款'],
      objections: [
        { q: '“300万以上为什么要现场尽调？”', a: '“这是政策性产品的标准流程，为了确保资金精准支持到优质企业的真实技改中。我们会全力配合提速，通常 1-2 天即可完成尽调。”' },
        { q: '“如果纳税不够 5 万能办吗？”', a: '“如果纳税稍欠，我们可以考虑转为‘长融保’模式，虽然流程稍多，但准入更灵活，同样能享受政策红利。”' }
      ],
      forbiddenPhrases: ['“建筑施工类企业”', '“逾期客户”', '“不看报税”'],
      relatedSkill: { name: '费率优惠测算', path: '/fee-discount' },
      productBoundary: {
        suitable: ["优质制造业、科技型企业", "成立满2年且报税规范", "纳税信用等级非D", "无当前逾期、展期或借新还旧记录"],
        unsuitable: ["建筑施工类企业（高新除外）", "中小担及其关联担保主体在保客户", "实收资本/营业收入为0的企业", "近6个月实控人重大变更"]
      },
      highFreqQA: [
        {
          question: "建筑施工类企业能不能做？",
          answer: "原则上不做纯建筑施工类企业，但如果您拥有‘高新技术企业’证书，是可以作为例外准入的。",
          internalLogic: "建筑类风险波动大，政策导向支持实体制造和高新科技。",
          prohibited: "禁止承诺“所有建筑企业都能做”。"
        },
        {
          question: "300万元以上为什么要看报税报表？",
          answer: "300万元以上属于硬门槛准入，需核实营授比、资产负债率等指标，报税口径是最权威的判断依据。",
          internalLogic: "防止企业通过多套报表粉饰财务状况，确保政策性资金流向真实经营主体。",
          prohibited: "禁止承诺“不看报表也能做300万以上”。"
        },
        {
          question: "能不能随借随还？",
          answer: "该产品为政策性经营贷，单笔期限一年以上，不支持随借随还循环模式。",
          internalLogic: "政策导向是支持中长期经营，而非短期头寸拆借。",
          prohibited: "禁止承诺“可以做成循环贷”。"
        }
      ],
      speedUpChecklist: {
        rmActions: ["核实企业是否为首次纳入且无逾期", "确认企业非中小担存量在保客户", "300万以上提前预约中小担现场尽调"],
        customerCooperation: ["准备好近两年的纳税证明和报税报表", "确保资产负债率和营授比符合硬门槛要求", "用途口径、合同口径必须保持高度一致"]
      },
      industryMarketing: {
        manufacturing: "强调简易审批带来的效率提升，适合订单充足、急需采购原材料的优质工厂。",
        tech: "强调对高新企业的政策偏好，特别是对建筑施工类高新企业的例外支持。"
      },
      scripts: {
        initial: "【初次触达】李总您好，我是厦行的XX。咱们公司作为优质制造业企业，正好符合我们‘长易担’的简易审批政策，不仅有80%的政策性增信，流程也比一般贷款快很多，您看这周哪天方便我过去给您详细汇报下？",
        deep: "【深入沟通】李总，‘长易担’的核心是‘快’。银行审批后直接向担保公司备案，省去了繁琐的重复审批。对于咱们这种报税规范、信用良好的企业，这是目前效率最高的政策性产品。关于300万以上的硬指标，我们可以先预审一下报表。",
        followUp: "【补件推进】李总，咱们申请的是300万以上的额度，中小担需要安排一次现场尽调。麻烦您这边把近两年的纳税证明和用途合同先发我，我同步跟担保公司预约时间，争取下周完成现场环节。"
      },
      practicalLogic: [
        "第一步：看行业属性（制造业/科技型优先，建筑类需高新证书）",
        "第二步：看是否为中小担新客户（存量在保客户通常转长融保）",
        "第三步：看额度需求（300万以下走简易备案，300万以上走硬门槛准入）",
        "第四步：300万以上核实报税口径资产负债率(≤70%)和营授比",
        "【初筛秘籍】现场先看纳税证明（近12个月是否≥5万）、查中小担在保情况、看资产负债表。"
      ]
    },
    {
      id: 'bank_acceptance',
      name: '银承',
      category: '结算/融资',
      targetCustomers: ['贸易企业', '制造业企业', '有支付需求的企业'],
      suitableIndustries: ['制造业', '贸易业', '批发零售'],
      overview: '银行承兑汇票是由承兑申请人签发，并由银行承兑的票据。',
      sellingPoints: ['信用度高', '流通性强', '节约财务成本', '缓解现金流压力'],
      entryCriteria: ['有真实贸易背景', '在我行开立结算账户', '符合我行授信准入'],
      commonBlockers: ['保证金比例高', '敞口额度不足', '贸易背景资料不全'],
      openingTalk: '“张总，我看咱们公司平时跟上游结算挺频繁的，现在是用现金多还是票据多？我们行现在的银承政策挺给力，能帮您把资金利用率再提一提。”',
      mustAskQuestions: ['“您每年的采购规模大概多少？”', '“目前主要的结算方式是什么？”', '“上游供应商对银行承兑汇票的接受度怎么样？”'],
      needRecognition: '如果客户提到“现金流紧张”、“财务成本高”或�  personas: [
    {
      id: 'chen_manufacturing',
      name: '老陈 (陈建国)',
      style: '制造业转型深耕型',
      goodAtCustomers: ['传统制造业', '技改升级企业', '家族式工厂'],
      goodAtProducts: ['长融保', '设备融资租赁', '中长期流贷'],
      openingStyle: '接地气，从车间生产、原材料价格、环保政策切入。',
      questionStyle: '实地导向，关注产能利用率、订单排期和设备折旧。',
      pushStyle: '稳健推进，强调“匹配生产周期”和“政策性增信”的稳定性。',
      advantages: ['懂行、懂生产、懂老板心理', '能看透工厂的真实经营热度'],
      weaknesses: ['对纯轻资产科技企业的理解稍慢'],
      typicalOpening: '“张总，我看咱们车间这几台新机器跑得挺欢啊，是刚上的技改项目吧？最近原材料涨得厉害，咱们这笔‘长融保’正好能覆盖掉这块的波动，而且一年以上的期限，跟咱们生产周期最合拍。”',
      typicalFollowUp: '“李厂长，关于那笔技改贷款，中小担那边我已经沟通好了。咱们这种实实在在做生产的企业，政策是最支持的。材料我帮您理好了，咱们这周就把意向函拿下来。”',
      typicalClose: '“咱们做制造业的，稳就是快。长融保虽然不是随借随还，但它能给咱们一个长期的、确定的资金预期。咱们先把这笔落了，后面扩产就更有底气。”',
      objectionHandling: '“担保费确实是0.5%，但您算算，加上咱们帮您申请的50%保费补贴，综合成本比您去外面拿短贷续贷低多了，关键是不用担心抽贷断贷。”'
    },
    {
      id: 'su_tech',
      name: '小苏 (苏曼)',
      style: '科创成长领航型',
      goodAtCustomers: ['高新技术企业', '专精特新', '轻资产研发团队'],
      goodAtProducts: ['长易担', '投贷联动', '知识产权质押'],
      openingStyle: '前瞻专业，从行业赛道、技术壁垒、融资轮次切入。',
      questionStyle: '逻辑驱动，关注研发投入占比、核心专利和营授比。',
      pushStyle: '极致效率，强调“简易备案”和“极速放款”的快节奏。',
      advantages: ['效率极高', '对科创政策敏感', '能与技术型老板同频'],
      weaknesses: ['处理传统复杂抵押业务时可能缺乏耐心'],
      typicalOpening: '“李总，咱们公司作为高新企业，正好在‘长易担’的白名单里。这个产品专门给咱们这种优质科创企业提速，银行审完直接备案，不用两头跑，最快3天就能到账。”',
      typicalFollowUp: '“王总，备案材料我已经预审过了，咱们的营授比和资产负债率都在硬门槛之内。我已经跟中小担预约了明天的现场尽调，咱们争取下周就把款放出来。”',
      typicalClose: '“对于高成长企业，时间就是金钱。长易担的简易模式就是为了匹配咱们的节奏。现在锁定名额，正好能赶上咱们下一波研发投入的节点。”',
      objectionHandling: '“300万以上确实需要现场尽调，这是政策红线的硬要求。但您放心，我会全程陪同，重点展示咱们的技术壁垒，确保一次性通过。”'
    },
    {
      id: 'lin_policy',
      name: '林工 (林志远)',
      style: '政策合规专家型',
      goodAtCustomers: ['对成本敏感的企业', '拟上市/规范化公司', '政府项目关联企业'],
      goodAtProducts: ['贴息贷款', '银担合作全系', '跨境结算'],
      openingStyle: '权威严谨，从政府红头文件、保费奖补、贴息口径切入。',
      questionStyle: '合规导向，通过核对纳税等级、行业代码展示专业度。',
      pushStyle: '红利引导，通过“测算叠加空间”和“窗口期”驱动决策。',
      advantages: ['政策解读极准', '合规性极强', '能帮客户拿满补贴'],
      weaknesses: ['沟通可能显得有些死板、教条'],
      typicalOpening: '“吴总，最新的《民间投资专项担保计划》您关注了吗？根据文件第三条，咱们这种制造业企业走‘长融保’，叠加贴息后的综合成本可以降到2%以下，这可是实打实的政策红利。”',
      typicalFollowUp: '“陈总，我对比了财政厅和工信局的最新口径，咱们这笔贷款的保费补贴申请表我已经填好了。只要咱们的纳税等级保持在B级以上，这笔补贴就是板上钉钉。”',
      typicalClose: '“政策窗口期通常很短，建议我们现在就启动备案。我会帮您把控好每一个合规细节，确保后续审计和贴息申报万无一失。”',
      objectionHandling: '“关于贴息，我们要明确：它是财政行为，非银行自带。但我会按照最严谨的口径帮您准备材料，最大限度争取到账。”'
    }
  ]
��们行有专门的‘科技贷’，利率比普通贷款低不少。”',
      mustAskQuestions: ['“公司目前有哪些政策性认定？”', '“去年的纳税等级是？”', '“是否有政府贴息项目的申报计划？”'],
      needRecognition: '客户关注“政府补贴”、“降本增效”或“品牌背书”。',
      materials: ['高新/专精特新证书', '纳税证明', '研发投入说明'],
      steps: ['政策匹配', '入库核实', '授信审批', '贴息申报'],
      objections: [
        { q: '“申报太复杂，怕办不下来。”', a: '“我们有专业的政策顾问团队，会帮您一对一梳理，成功率很高。”' }
      ],
      forbiddenPhrases: ['“这钱是白给的。”', '“不用还。”'],
      relatedSkill: { name: '费率优惠测算', path: '/fee-discount' }
    },
    {
      id: 'account_settlement',
      name: '开户/结算类',
      category: '基础业务',
      targetCustomers: ['新设企业、有异地结算需求的企业'],
      suitableIndustries: ['各行业'],
      overview: '包括对公账户开立、网银、现金管理等基础服务。',
      sellingPoints: ['开户快', '费率优', '系统稳定', '服务贴心'],
      entryCriteria: ['资料真实有效', '法人面签', '经营地址真实'],
      commonBlockers: ['异地开户受限', '反洗钱审核严', '上门核实不便'],
      openingTalk: '“吴总，新公司刚成立，开户办了吗？我们行现在针对新入驻企业有‘开户大礼包’，免首年年费，网银转账还有优惠。”',
      mustAskQuestions: ['“平时的转账频率高吗？”', '“是否有代发工资或代扣缴需求？”', '“对网银的操作便捷性有什么要求？”'],
      needRecognition: '客户抱怨“他行开户慢”、“手续费贵”或“系统难用”。',
      materials: ['营业执照', '法人身份证', '公章/财务章/法人章'],
      steps: ['预约申请', '上门核实', '柜面办理', '激活使用'],
      objections: [
        { q: '“离你们网点有点远。”', a: '“我们现在很多业务都能在网银或手机银行办，而且我们会提供上门服务。”' }
      ],
      forbiddenPhrases: ['“当天就能拿账号。”', '“不用法人来。”']
    }
  ],
  industries: [
    {
      id: 'manufacturing',
      name: '制造业',
      businessModel: '购入原材料 -> 加工制造 -> 销售产成品 -> 回笼资金。',
      upstreamDownstream: '上游为原材料供应商，下游为分销商或终端客户。',
      capitalNeed: '原材料采购资金、设备更新升级、厂房建设。',
      risks: ['原材料价格波动', '环保政策影响', '技术迭代风险'],
      recommendedProducts: ['流动资金贷款', '银承', '设备融资租赁'],
      firstVisitTips: ['“一定要去车间看看，感受生产热度。”', '“关注工人的忙碌程度和成品库存。”'],
      mustAskQuestions: ['“目前的产能利用率是多少？”', '“主要的原材料成本占比多大？”', '[' + '“下游回款周期一般多久？”' + ']']
    },
    {
      id: 'trading',
      name: '贸易业',
      businessModel: '低价买入 -> 高价卖出，赚取差价，核心在于周转。',
      upstreamDownstream: '上游厂家，下游零售商或次级贸易商。',
      capitalNeed: '囤货资金、预付款项、信用证开立。',
      risks: ['存货贬值', '下游违约', '虚假贸易风险'],
      recommendedProducts: ['银承', '国内信用证', '保理业务'],
      firstVisitTips: ['“关注仓库的进出货频率。”', '“了解其在行业内的上下游话语权。”'],
      mustAskQuestions: ['“每年的周转次数大概是多少？”', '“上游是否要求预付货款？”', '“下游的账期是怎么给的？”']
    },
    {
      id: 'tech_enterprise',
      name: '科技企业',
      businessModel: '研发投入 -> 技术转化 -> 产品销售/授权。',
      upstreamDownstream: '上游为人才、研发设备，下游为行业应用客户。',
      capitalNeed: '研发经费、人才引进、知识产权保护、市场推广。',
      risks: ['研发失败风险', '核心人才流失', '市场准入壁垒'],
      recommendedProducts: ['科技贷', '投贷联动', '知识产权质押'],
      firstVisitTips: ['“关注其专利数量和研发团队背景。”', '“了解其产品的核心竞争力在哪里。”'],
      mustAskQuestions: ['“每年的研发投入占比是多少？”', '“目前有哪些核心专利或技术壁垒？”', '“下一阶段的融资计划是？”']
    },
    {
      id: 'taiwan_business',
      name: '台企台商',
      businessModel: '多为精密制造或电子配套，注重品质和长期合作。',
      upstreamDownstream: '多与母公司或全球供应链配套。',
      capitalNeed: '跨境结算、日常经营周转、扩大再生产。',
      risks: ['汇率风险', '供应链调整风险', '政策敏感度'],
      recommendedProducts: ['跨境结算', '内保外贷', '专项台商贷'],
      firstVisitTips: ['“尊重其管理文化，注重礼仪。”', '“了解其母公司在全球的布局。”'],
      mustAskQuestions: ['“目前跨境收付汇的主要路径是？”', '“对汇率避险有什么具体要求？”', '“母公司对大陆子公司的支持力度如何？”']
    }
  ],
  scenarios: [
    {
      id: 'first_visit',
      name: '首次拜访客户',
      goal: '建立信任，获取基础经营信息，挖掘潜在需求。',
      openingTalk: '“张总您好，我是[银行名称]的[姓名]，之前一直关注咱们企业，在行业内口碑非常好。今天过来主要是想认识一下，学习学习，也看看有没有能为您服务的机会。”',
      mustAskQuestions: ['“咱们企业目前的发展重点在哪里？”', '“在金融服务方面，您目前觉得最不方便的地方是什么？”'],
      riskPoints: ['用力过猛推产品', '不了解背景瞎提问', '忽略客户反馈'],
      recommendedProducts: ['开户/结算', '基础流贷'],
      nextSteps: ['添加微信', '发送行内简介', '约定下次实地考察']
    },
    {
      id: 'customer_asks_loan',
      name: '客户主动问融资',
      goal: '快速判断准入，锁定真实用途，引导后续流程。',
      openingTalk: '“没问题李总，咱们企业经营这么稳健，融资肯定没问题。您这次大概需要多少额度？主要是用在哪个环节？”',
      mustAskQuestions: ['“这笔资金预计什么时候要用到？”', '“目前能提供的担保方式有哪些？”'],
      riskPoints: ['盲目承诺额度', '忽略用途合规性', '未核实真实流水'],
      recommendedProducts: ['流贷', '抵押贷'],
      nextSteps: ['发送材料清单', '进行初步预审']
    },
    {
      id: 'competitor_cooperation',
      name: '客户已有他行合作',
      goal: '寻找他行痛点，差异化切入，争取“二选一”或“主合作”。',
      openingTalk: '“他行能给您支持说明咱们企业确实优秀。不过每家银行的侧重点不同，我们行在[某产品/某效率]上很有优势，您可以对比参考下。”',
      mustAskQuestions: ['“目前他行的服务中，您觉得还有哪些可以提升的地方？”', '“他行的额度够用吗？审批速度如何？”'],
      riskPoints: ['恶意贬低同业', '只拼价格不拼服务', '忽略自身优势'],
      recommendedProducts: ['银承', '专项优惠贷'],
      nextSteps: ['提供对比方案', '邀请体验特色功能']
    },
    {
      id: 'rate_only',
      name: '客户只谈利率',
      goal: '引导关注综合成本和服务价值，弱化单一价格竞争。',
      openingTalk: '“利率确实是核心，但除了明面上的利率，资金的到账速度、使用的灵活性以及后续的增值服务，其实都是隐形成本。我帮您算一笔综合账。”',
      mustAskQuestions: ['“除了利率，您对放款时效的要求高吗？”', '“如果能提供更灵活的还款方式，您会考虑吗？”'],
      riskPoints: ['陷入价格战陷阱', '忽略客户真实痛点', '承诺无法达到的低价'],
      recommendedProducts: ['贴息类产品', '随借随还流贷'],
      nextSteps: ['出具综合成本分析表', '介绍非金服务']
    },
    {
      id: 'missing_materials',
      name: '客户资料不齐',
      goal: '安抚客户情绪，提供替代方案，确保流程不中断。',
      openingTalk: '“张总，我理解准备资料挺麻烦的。这几项材料如果暂时没有，我们可以先用[替代材料]预审，或者我帮您一起想办法补齐。”',
      mustAskQuestions: ['“这部分缺失的信息，在其他报表或合同里有体现吗？”', '“大概需要多久能补齐？”'],
      riskPoints: ['生硬拒绝', '原则性问题让步', '未告知补件期限'],
      recommendedProducts: ['信用类小额贷'],
      nextSteps: ['列出补件清单', '协助客户调取数据']
    },
    {
      id: 'fast_disbursement',
      name: '客户想快放款',
      goal: '管理客户预期，通过绿色通道提速，建立专业形象。',
      openingTalk: '“李总，我明白这笔钱对您很重要。我会立刻启动我们的‘绿色通道’，只要资料齐全，我会盯着流程走。咱们现在先核对下最关键的几个点。”',
      mustAskQuestions: ['“最晚什么时候必须到账？”', '“目前资料准备到什么程度了？”'],
      riskPoints: ['虚假承诺时效', '为了速度忽略合规', '未告知流程中的不确定性'],
      recommendedProducts: ['线上快贷', '存量抵押贷'],
      nextSteps: ['建立专项沟通群', '实时反馈进度']
    }
  ],
  personas: [
    {
      id: 'amy',
      name: 'Amy',
      style: '关系建立型',
      goodAtCustomers: ['首次接触客户', '长期经营客户', '注重情感连接的客户'],
      goodAtProducts: ['存款', '综合结算', '轻融资', '个人理财'],
      openingStyle: '亲切自然，从生活或行业见闻切入，不带攻击性。',
      questionStyle: '循序渐进，像聊天一样获取信息，关注客户的感受。',
      pushStyle: '温和建议，强调长期合作和陪伴，不急于求成。',
      advantages: ['亲和力极强', '容易获得客户信任', '客户粘性高'],
      weaknesses: ['专业形象可能不够硬', '推进大额授信时力度稍弱'],
      typicalOpening: '“张总，好久没见，听说咱们公司最近又拿奖了，真是可喜可贺！今天刚好路过，给您带了点我们行的特色小礼品...”',
      typicalFollowUp: '“李姐，上次说的那件事我一直记着呢，我帮您问了几个专家，他们的建议是...”',
      typicalClose: '“咱们认识这么久了，我的为人您也清楚。这个方案是我专门为您申请的，您看要不咱们先试着办一笔？”',
      objectionHandling: '“我特别理解您的顾虑，换做是我也会这么想。其实我们可以先从基础业务合作起，您慢慢感受我们的服务。”'
    },
    {
      id: 'emily',
      name: 'Emily',
      style: '专业推进型',
      goodAtCustomers: ['理性、数据导向的客户', '大型企业财务总监', '科技型企业主'],
      goodAtProducts: ['复杂授信', '投行方案', '供应链金融', '利率避险'],
      openingStyle: '干练专业，直接切入核心业务或行业深度洞察。',
      questionStyle: '逻辑严密，直击痛点，通过专业问题展示深度。',
      pushStyle: '数据驱动，通过方案对比和利益分析引导客户决策。',
      advantages: ['专业度高', '执行力强', '能处理复杂业务'],
      weaknesses: ['可能显得有些强势', '不容易建立深层情感连接'],
      typicalOpening: '“王总，根据我对贵司财报的分析，目前的资产负债结构还有优化空间。我今天带了一个针对性的降本增效方案...”',
      typicalFollowUp: '“陈总，关于上次讨论的授信方案，我已经完成了初步的测算，结果显示可以为您节约约15%的财务成本。”',
      typicalClose: '“基于目前的市场环境和贵司的需求，这份方案是目前的最优解。建议我们尽快启动流程，锁定目前的优惠利率。”',
      objectionHandling: '“您的担忧很有代表性。但从行业数据来看，目前这种模式已经非常成熟，风险点主要在于...”'
    },
    {
      id: 'michael',
      name: 'Michael',
      style: '资源整合型',
      goodAtCustomers: ['有扩张需求的客户', '需要跨界资源的客户', '老板圈子'],
      goodAtProducts: ['并购贷款', '银团贷款', '非金服务', '撮合业务'],
      openingStyle: '视野开阔，从宏观趋势或资源对接切入。',
      questionStyle: '关注战略，询问企业的发展愿景和资源缺口。',
      pushStyle: '价值交换，通过提供银行以外的附加价值来锁定合作。',
      advantages: ['资源广', '格局大', '能解决客户的非金融痛点'],
      weaknesses: ['可能让客户觉得不够接地气', '基础业务细节可能关注不足'],
      typicalOpening: '“吴总，最近我接触了几家做上游配套的企业，感觉跟咱们公司的业务互补性很强，什么时候安排大家坐坐？”',
      typicalFollowUp: '“关于您上次提到的厂房选址问题，我帮您对接了园区的负责人，他们那边有一些针对性政策...”',
      typicalClose: '“我们行不仅是提供资金，更是您的战略合作伙伴。把这块业务交给我们，您能腾出更多精力去做市场。”',
      objectionHandling: '“价格只是合作的一部分。您看，通过我们的平台，您能接触到更多的优质供应商，这部分的价值远超那几个点。”'
    },
    {
      id: 'david',
      name: 'David',
      style: '高效直击型 (Brutalist)',
      goodAtCustomers: ['追求极致效率的企业主', '时间紧迫的决策者', '制造业工厂主'],
      goodAtProducts: ['长易担', '线上快贷', '银承'],
      openingStyle: '极简直接，不寒暄，直接抛出核心利益点。',
      questionStyle: '封闭式提问，快速确认准入指标，不浪费一秒钟。',
      pushStyle: '效率施压，强调“现在办，明天拿”，用速度换取决策。',
      advantages: ['效率极高', '不拖泥带水', '深受忙碌老板喜爱'],
      weaknesses: ['可能显得缺乏人情味', '容易忽略复杂的合规细节'],
      typicalOpening: '“李总，长话短说。咱们行现在有个‘长易担’，专门给您这种优质工厂提速，银行审完直接放款，不用两头跑。您纳税够5万吗？”',
      typicalFollowUp: '“材料我已经发您微信了，一共就三项，您现在拍个照发我，我下午就进系统。”',
      typicalClose: '“名额有限，今天报上去明天就能出结果。您看是现在签还是下午我再过来？”',
      objectionHandling: '“理解。但市场不等人，晚一天就是一天的利息。咱们先走流程，不行再撤。”'
    },
    {
      id: 'sophia',
      name: 'Sophia',
      style: '咨询共情型',
      goodAtCustomers: ['处于转型期的企业', '注重长期战略的创始人', '科技创业团队'],
      goodAtProducts: ['长融保', '投贷联动', '知识产权质押'],
      openingStyle: '深度倾听，从企业的成长故事和痛点切入。',
      questionStyle: '启发式提问，引导客户思考未来的资金布局。',
      pushStyle: '方案共创，让客户觉得方案是“我们一起想出来的”。',
      advantages: ['深度洞察', '客户忠诚度极高', '能挖掘深层需求'],
      weaknesses: ['成交周期可能较长', '容易陷入细节讨论'],
      typicalOpening: '“陈总，我看咱们公司近三年的研发投入增长很快，这种‘厚积薄发’的过程一定很不容易。在目前这个阶段，您最希望金融机构能提供什么样的支持？”',
      typicalFollowUp: '“关于上次讨论的授信方案，我已经完成了初步的测算，结果显示可以为您节约约15%的财务成本。”',
      typicalClose: '“这个方案是我们共同探讨的结果，它不仅是资金，更是对咱们技术价值的认可。我们一起把它落地？”',
      objectionHandling: '“我完全理解您的顾虑。其实每一个伟大的企业在扩张期都会面临这种抉择。我们可以分步走...”'
    },
    {
      id: 'leo',
      name: 'Leo',
      style: '政策专家型',
      goodAtCustomers: ['对政策敏感的企业', '财务管理规范的公司', '拟上市企业'],
      goodAtProducts: ['贴息贷款', '专项担保计划', '绿色金融'],
      openingStyle: '权威解读，从最新的政府文件和行业红利切入。',
      questionStyle: '合规性提问，通过核对指标展示专业严谨。',
      pushStyle: '红利引导，强调“政策窗口期”，错过就没补贴。',
      advantages: ['极具权威感', '能帮客户拿补贴', '合规性极强'],
      weaknesses: ['可能显得有些死板', '沟通成本较高'],
      typicalOpening: '“王总，最新的《民间投资专项担保计划》您关注了吗？里面提到的保费奖补政策，咱们公司正好在支持范围内。”',
      typicalFollowUp: '“根据我对比财政厅和工信局的最新口径，咱们这笔贷款如果走‘长融保’，叠加贴息后的综合成本可以降到...”',
      typicalClose: '“政策窗口期通常很短，建议我们现在就锁定名额，确保补贴能顺利申报。”',
      objectionHandling: '“从政策逻辑来看，您的理解稍有偏差。根据文件第三条规定...”'
    }
  ]
};

// --- Component ---

const BusinessGuide: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'guide' | 'persona'>('guide');
  const [guideType, setGuideType] = useState<'product' | 'industry' | 'scenario'>('product');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const product = searchParams.get('product');
    const type = searchParams.get('type');
    const tab = searchParams.get('tab');

    if (tab === 'persona') {
      setActiveTab('persona');
    } else if (tab === 'guide') {
      setActiveTab('guide');
    }

    if (type === 'industry' || type === 'scenario' || type === 'product') {
      setGuideType(type as any);
    }

    if (product) {
      setSelectedId(product);
      setActiveTab('guide');
      setGuideType('product');
    }
  }, [searchParams]);

  // --- Comparison Data ---
  const COMPARISON_DATA = [
    {
      feature: '产品定位',
      changRongBao: '稳健型：传统银担合作，覆盖面广，适合稳扎稳打落地',
      changYiDan: '高效型：简易审批备案模式，适合优质客户快速推进'
    },
    {
      feature: '适合客户',
      changRongBao: '信用基础稍弱、有真实经营场景、额度需求较大(最高1000万)',
      changYiDan: '资质优、纳税规范(≥5万)、成立满2年、追求效率'
    },
    {
      feature: '不适合客户',
      changRongBao: '无真实经营、随借随还需求、房地产/金融类行业',
      changYiDan: '建筑施工类(高新除外)、存量风险转化、实收资本为0'
    },
    {
      feature: '审批路径',
      changRongBao: '银行审批 -> 中小担人工审批 -> 出意向函',
      changYiDan: '银行审批 -> 向中小担备案 (300万以上需现场尽调)'
    },
    {
      feature: '期限要求',
      changRongBao: '一年期以上，不支持随借随还',
      changYiDan: '一年期以上，不支持随借随还'
    },
    {
      feature: '单户额度',
      changRongBao: '最高 1000 万元',
      changYiDan: '最高 500 万元 (300万为分水岭)'
    },
    {
      feature: '担保方式',
      changRongBao: '中小担 80% 本金担保 + 个人保证/抵押(视情况)',
      changYiDan: '中小担 80% 本金担保，纯信用备案为主'
    },
    {
      feature: '担保费收取',
      changRongBao: '0.5%/年，通常由客户预付，后期申请补贴',
      changYiDan: '0.5%/年，通常由客户预付，后期申请补贴'
    },
    {
      feature: '贷款用途',
      changRongBao: '设备采购、原材料、技改、扩产 (需与批复一致)',
      changYiDan: '真实经营周转、技改、研发 (需与批复一致)'
    },
    {
      feature: '现场尽调',
      changRongBao: '必须现场尽调',
      changYiDan: '300万以下免现场；300万以上必须现场'
    },
    {
      feature: '推进速度',
      changRongBao: '10-15 个工作日',
      changYiDan: '3-7 个工作日 (300万以下极快)'
    },
    {
      feature: '优先推荐场景',
      changRongBao: '客户情况复杂、额度需求高、抵押物严重不足',
      changYiDan: '优质制造业/科技企业、急需用款、报税数据漂亮'
    }
  ];

  // --- Helpers ---

  const getActiveContent = () => {
    if (activeTab === 'guide') {
      if (guideType === 'product') return GUIDE_DATA.products.find(p => p.id === selectedId);
      if (guideType === 'industry') return GUIDE_DATA.industries.find(i => i.id === selectedId);
      if (guideType === 'scenario') return GUIDE_DATA.scenarios.find(s => s.id === selectedId);
    } else {
      return GUIDE_DATA.personas.find(p => p.id === selectedId);
    }
    return null;
  };

  const activeContent = getActiveContent();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // --- Sub-components ---

  const SidebarItem = ({ id, name, icon: Icon, active }: { id: string, name: string, icon: any, active: boolean }) => (
    <button
      onClick={() => setSelectedId(id)}
      className={cn(
        "w-full flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl transition-all text-left group shrink-0 md:shrink",
        active 
          ? "bg-brand-dark text-white shadow-lg" 
          : "hover:bg-brand-light-gray text-brand-gray"
      )}
    >
      <Icon className={cn("w-3.5 h-3.5 md:w-4 md:h-4", active ? "text-brand-gold" : "group-hover:text-brand-dark")} />
      <span className="text-[10px] md:text-xs font-bold whitespace-nowrap md:whitespace-normal">{name}</span>
    </button>
  );

  return (
    <AppLayout title="客户经理业务通" showBack>
      <div className="py-8 md:py-16 bg-brand-offwhite min-h-screen">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8 md:mb-12 animate-fade-in-up">
              <div className="flex items-center gap-4 md:gap-6 mb-4 md:mb-6">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-brand-dark text-white rounded-xl md:rounded-2xl flex items-center justify-center shadow-xl shrink-0">
                  <LayoutDashboard size={24} className="md:hidden" />
                  <LayoutDashboard size={32} className="hidden md:block" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-4xl font-serif text-brand-dark tracking-tight">客户经理业务通</h1>
                  <p className="text-xs md:text-base text-brand-gray font-medium opacity-60 mt-1 md:mt-2">把产品知识、行业判断、客户对话和推进路径沉淀成可复用的业务打法</p>
                </div>
              </div>
            </div>

          {/* Red Warning Box */}
      <div className="mb-8 p-6 bg-red-50 border-2 border-red-200 rounded-2xl animate-pulse">
        <div className="flex items-start gap-4">
          <AlertCircle className="text-red-600 w-6 h-6 shrink-0 mt-1" />
          <div>
            <h4 className="text-red-800 font-bold text-lg mb-2">重要政策声明 (红线)</h4>
            <p className="text-red-700 text-sm leading-relaxed font-medium">
              “民间投资专项担保计划”<span className="underline font-black">不等于</span>自动享受贴息或担保费全额补贴。
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-xs text-red-900/80">
              <div className="bg-white/50 p-3 rounded-lg">
                <p className="font-bold mb-1">1. 担保费补贴</p>
                <p>以地方财政当期口径为准，不能默认全额补贴。标准保费 0.5%/年需预付。</p>
              </div>
              <div className="bg-white/50 p-3 rounded-lg">
                <p className="font-bold mb-1">2. 1.5% 利率贴息</p>
                <p>属于并行政策，需看用途和申报条件。并非做了担保计划就自动贴息。</p>
              </div>
            </div>
            <p className="mt-3 text-[10px] text-red-600 font-bold italic">※ 禁止向客户承诺“全额补贴”或“自动贴息”，仅可评估叠加空间。</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10">
            {/* Left Sidebar: Selection */}
            <div className="lg:col-span-3 space-y-6 md:space-y-8 animate-fade-in-up">
              {/* Tab Switcher */}
              <div className="flex p-1 bg-brand-light-gray rounded-xl md:rounded-2xl border border-brand-border/5">
                <button
                  onClick={() => { setActiveTab('guide'); setSelectedId(null); }}
                  className={cn(
                    "flex-1 py-2.5 md:py-3 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-bold uppercase tracking-widest transition-all",
                    activeTab === 'guide' ? "bg-white text-brand-dark shadow-sm" : "text-brand-gray hover:text-brand-dark"
                  )}
                >
                  业务通
                </button>
                <button
                  onClick={() => { setActiveTab('persona'); setSelectedId(null); }}
                  className={cn(
                    "flex-1 py-2.5 md:py-3 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-bold uppercase tracking-widest transition-all",
                    activeTab === 'persona' ? "bg-white text-brand-dark shadow-sm" : "text-brand-gray hover:text-brand-dark"
                  )}
                >
                  经验上身
                </button>
              </div>

              {activeTab === 'guide' ? (
                <div className="space-y-6 md:space-y-8">
                  {/* Guide Type Filters */}
                  <div className="space-y-2">
                    <p className="text-[9px] md:text-[10px] font-bold text-brand-gray uppercase tracking-widest opacity-40 mb-3 md:mb-4">分类维度</p>
                    <div className="flex overflow-x-auto md:flex-col gap-1 no-scrollbar">
                      {[
                        { id: 'product', name: '按产品', icon: Briefcase },
                        { id: 'scenario', name: '按场景', icon: Zap },
                        { id: 'industry', name: '按行业', icon: Target },
                      ].map(t => (
                        <button
                          key={t.id}
                          onClick={() => { setGuideType(t.id as any); setSelectedId(null); }}
                          className={cn(
                            "flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl transition-all text-left whitespace-nowrap",
                            guideType === t.id ? "bg-brand-gold/10 text-brand-gold" : "text-brand-gray hover:bg-brand-light-gray"
                          )}
                        >
                          <t.icon size={14} className="md:w-4 md:h-4" />
                          <span className="text-[11px] md:text-xs font-bold">{t.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="space-y-2">
                    <p className="text-[9px] md:text-[10px] font-bold text-brand-gray uppercase tracking-widest opacity-40 mb-3 md:mb-4">
                      {guideType === 'product' ? '产品列表' : guideType === 'industry' ? '行业列表' : '场景列表'}
                    </p>
                    <div className="flex overflow-x-auto md:flex-col gap-1 no-scrollbar">
                      {guideType === 'product' && (
                        <SidebarItem id="product_comparison" name="产品实战对比" icon={RefreshCcw} active={selectedId === 'product_comparison'} />
                      )}
                      {guideType === 'product' && GUIDE_DATA.products.map(p => (
                        <SidebarItem key={p.id} id={p.id} name={p.name} icon={Briefcase} active={selectedId === p.id} />
                      ))}
                      {guideType === 'industry' && GUIDE_DATA.industries.map(i => (
                        <SidebarItem key={i.id} id={i.id} name={i.name} icon={Target} active={selectedId === i.id} />
                      ))}
                      {guideType === 'scenario' && GUIDE_DATA.scenarios.map(s => (
                        <SidebarItem key={s.id} id={s.id} name={s.name} icon={Zap} active={selectedId === s.id} />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-[9px] md:text-[10px] font-bold text-brand-gray uppercase tracking-widest opacity-40 mb-3 md:mb-4">风格人物</p>
                  <div className="flex overflow-x-auto md:flex-col gap-1 no-scrollbar">
                    {GUIDE_DATA.personas.map(p => (
                      <SidebarItem key={p.id} id={p.id} name={p.name} icon={User} active={selectedId === p.id} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Content: Results */}
            <div className="lg:col-span-9 animate-fade-in">
              <AnimatePresence mode="wait">
                {selectedId === 'product_comparison' ? (
                  <motion.div
                    key="comparison"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-white rounded-[2rem] md:rounded-[3rem] border border-brand-border/10 shadow-sm overflow-hidden"
                  >
                    <div className="p-6 md:p-12 border-b border-brand-border/5 bg-brand-light-gray/20">
                      <h3 className="font-serif text-2xl md:text-4xl text-brand-dark mb-2">产品实战对比</h3>
                      <p className="text-brand-gray text-xs md:text-lg opacity-60">快速区分核心银担产品，精准匹配客户需求</p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-brand-dark text-white">
                            <th className="px-6 py-4 text-left text-xs md:text-sm font-bold uppercase tracking-wider border-r border-white/10">对比维度</th>
                            <th className="px-6 py-4 text-left text-xs md:text-sm font-bold uppercase tracking-wider border-r border-white/10">长融保</th>
                            <th className="px-6 py-4 text-left text-xs md:text-sm font-bold uppercase tracking-wider">长易担</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-border/10">
                          {COMPARISON_DATA.map((row, idx) => (
                            <tr key={idx} className={cn(idx % 2 === 0 ? "bg-white" : "bg-brand-light-gray/10")}>
                              <td className="px-6 py-5 text-xs md:text-sm font-bold text-brand-dark border-r border-brand-border/10 bg-brand-light-gray/5">{row.feature}</td>
                              <td className="px-6 py-5 text-xs md:text-sm text-brand-gray border-r border-brand-border/10">{row.changRongBao}</td>
                              <td className="px-6 py-5 text-xs md:text-sm text-brand-gray">{row.changYiDan}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="p-6 md:p-10 bg-brand-gold/5 border-t border-brand-gold/10">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-brand-gold/10 rounded-full flex items-center justify-center shrink-0">
                          <AlertCircle className="text-brand-gold w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs md:text-sm font-bold text-brand-dark mb-1">客户经理实战建议</p>
                          <p className="text-[10px] md:text-xs text-brand-gray leading-relaxed">
                            对于制造业、有技改需求的大中型客户，首选<span className="text-brand-dark font-bold">长融保</span>，额度高且贴息政策更优；
                            对于初创期、急需资金周转的科技型小微企业，首选<span className="text-brand-dark font-bold">长易担</span>，流程极简，时效性强。
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : activeContent ? (
                  <motion.div
                    key={selectedId}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    {/* Summary Header */}
                    <div className="bg-white p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] border border-brand-border/10 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-6 md:p-10 opacity-[0.03] pointer-events-none">
                        <Sparkles className="w-24 h-24 md:w-40 md:h-40" />
                      </div>
                      <div className="relative z-10">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 md:mb-6">
                          <div className="flex items-center gap-3 md:gap-4">
                            <span className="px-3 md:px-4 py-1 md:py-1.5 bg-brand-gold/10 text-brand-gold text-[9px] md:text-[10px] font-bold uppercase tracking-widest rounded-full border border-brand-gold/20">
                              {activeTab === 'guide' ? (guideType === 'product' ? '产品打法' : guideType === 'industry' ? '行业洞察' : '场景策略') : '风格卡片'}
                            </span>
                            <h2 className="text-xl md:text-3xl font-serif text-brand-dark">{(activeContent as any).name}</h2>
                          </div>
                          {activeTab === 'guide' && guideType === 'product' && (activeContent as ProductCard).relatedSkill && (
                            <button 
                              onClick={() => navigate((activeContent as ProductCard).relatedSkill!.path)}
                              className="flex items-center justify-center gap-2 px-4 md:px-5 py-2 md:py-2.5 bg-brand-dark text-white rounded-lg md:rounded-xl font-bold text-[10px] md:text-xs hover:bg-brand-dark/90 transition-all shadow-lg group/btn self-start sm:self-auto"
                            >
                              <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-brand-gold" />
                              立即调用: {(activeContent as ProductCard).relatedSkill!.name}
                              <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover/btn:translate-x-1 transition-transform" />
                            </button>
                          )}
                        </div>
                        <p className="text-sm md:text-lg text-brand-gray font-medium leading-relaxed max-w-3xl">
                          {activeTab === 'guide' 
                            ? (guideType === 'product' ? (activeContent as ProductCard).overview : guideType === 'industry' ? (activeContent as IndustryCard).businessModel : (activeContent as ScenarioCard).goal)
                            : (activeContent as PersonaCard).style}
                        </p>
                      </div>
                    </div>

                    {/* Detailed Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                      {activeTab === 'guide' ? (
                        <>
                          {guideType === 'product' && (
                            <>
                              <ContentCard title="产品概况" icon={Info} content={(activeContent as ProductCard).overview} />
                              <ContentCard title="准入判断" icon={ShieldCheck} list={(activeContent as ProductCard).entryCriteria} />
                              <ContentCard title="进门对话" icon={MessageSquare} content={(activeContent as ProductCard).openingTalk} copyable />
                              <ContentCard title="需求识别" icon={Target} content={(activeContent as ProductCard).needRecognition} />
                              <ContentCard 
                                title="材料清单" 
                                icon={FileText} 
                                list={(activeContent as ProductCard).materials} 
                                copyable 
                                action={(activeContent as ProductCard).relatedSkill?.path.includes('material-checklist') ? {
                                  label: '去生成授信清单',
                                  onClick: () => navigate((activeContent as ProductCard).relatedSkill!.path)
                                } : undefined}
                              />
                              <ContentCard title="推进路径" icon={TrendingUp} list={(activeContent as ProductCard).steps} />
                              
                              {/* Product Stats */}
                              {(activeContent as ProductCard).details && (
                                <ContentCard 
                                  title="产品核心要素" 
                                  icon={Star} 
                                  list={[
                                    `利率：${(activeContent as ProductCard).details?.rate}`,
                                    `期限：${(activeContent as ProductCard).details?.term}`,
                                    `费率：${(activeContent as ProductCard).details?.pricing}`,
                                    `担保：${(activeContent as ProductCard).details?.guarantee}`,
                                    `审批：${(activeContent as ProductCard).details?.creditMethod}`,
                                    `补贴：${(activeContent as ProductCard).details?.subsidy}`
                                  ]} 
                                />
                              )}

                              {/* New Professional RM Modules */}
                              <ContentCard 
                                title="产品边界" 
                                icon={Target} 
                                list={[
                                  "【适合客群】",
                                  ...(activeContent as ProductCard).productBoundary?.suitable.map(s => `· ${s}`) || [],
                                  "\n【不适合客群】",
                                  ...(activeContent as ProductCard).productBoundary?.unsuitable.map(u => `· ${u}`) || []
                                ]} 
                              />

                              <ContentCard 
                                title="实战判断逻辑" 
                                icon={Zap} 
                                list={(activeContent as ProductCard).practicalLogic?.map((l, i) => `${i + 1}. ${l}`)} 
                              />

                              <ContentCard 
                                title="客户高频问题 (对客版)" 
                                icon={MessageSquare} 
                                list={(activeContent as ProductCard).highFreqQA?.map(qa => `问：${qa.question}\n答：${qa.answer}`)} 
                                copyable
                              />

                              <ContentCard 
                                title="客户经理内部逻辑" 
                                icon={ShieldCheck} 
                                list={(activeContent as ProductCard).highFreqQA?.map(qa => `针对：${qa.question}\n逻辑：${qa.internalLogic}`)} 
                              />

                              <ContentCard 
                                title="禁止承诺口径" 
                                icon={Ban} 
                                list={(activeContent as ProductCard).highFreqQA?.map(qa => `警告：${qa.prohibited}`)} 
                                warning
                              />

                              <ContentCard 
                                title="提速放款清单 (RM动作)" 
                                icon={Clock} 
                                list={(activeContent as ProductCard).speedUpChecklist?.rmActions} 
                              />

                              <ContentCard 
                                title="提速放款清单 (客户配合)" 
                                icon={Users} 
                                list={(activeContent as ProductCard).speedUpChecklist?.customerCooperation} 
                                copyable
                              />

                              <ContentCard 
                                title="行业营销打法" 
                                icon={Briefcase} 
                                list={[
                                  `【制造业】\n${(activeContent as ProductCard).industryMarketing?.manufacturing}`,
                                  `\n【科技型】\n${(activeContent as ProductCard).industryMarketing?.tech}`
                                ]} 
                              />

                              <ContentCard 
                                title="对客话术 (初次触达)" 
                                icon={MessageSquare} 
                                content={(activeContent as ProductCard).scripts?.initial} 
                                copyable
                              />

                              <ContentCard 
                                title="对客话术 (深入沟通)" 
                                icon={MessageSquare} 
                                content={(activeContent as ProductCard).scripts?.deep} 
                                copyable
                              />

                              <ContentCard 
                                title="对客话术 (补件推进)" 
                                icon={MessageSquare} 
                                content={(activeContent as ProductCard).scripts?.followUp} 
                                copyable
                              />

                              <div className="md:col-span-2 p-6 bg-red-50 border border-red-200 rounded-[2rem]">
                                <div className="flex items-center gap-3 mb-4 text-red-600">
                                  <AlertCircle size={24} />
                                  <h4 className="font-bold text-lg">重要政策声明 (红线)</h4>
                                </div>
                                <p className="text-sm text-red-700 leading-relaxed font-bold">
                                  “民间投资专项担保计划”不等于自动享受贴息或担保费全额补贴。
                                </p>
                                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-red-600/80">
                                  <div>
                                    <p className="font-bold mb-1">1. 关于担保费补贴：</p>
                                    <p>国家层面支持降费，但地方财政是否有配套补贴、比例多少，须以当期地方执行口径为准。不能默认全额补贴。</p>
                                  </div>
                                  <div>
                                    <p className="font-bold mb-1">2. 关于1.5%贴息：</p>
                                    <p>属于并行的中小微贴息政策。是否适用取决于贷款用途、行业等申报条件，非产品自带属性。</p>
                                  </div>
                                </div>
                              </div>

                              {(activeContent as ProductCard).details && (
                                <ContentCard 
                                  title="核心要素" 
                                  icon={Settings} 
                                  list={[
                                    `利率：${(activeContent as ProductCard).details!.rate}`,
                                    `期限：${(activeContent as ProductCard).details!.term}`,
                                    `定价：${(activeContent as ProductCard).details!.pricing}`,
                                    `贴补：${(activeContent as ProductCard).details!.subsidy}`,
                                    `担保：${(activeContent as ProductCard).details!.guarantee}`,
                                    `授信：${(activeContent as ProductCard).details!.creditMethod}`,
                                    `条件：${(activeContent as ProductCard).details!.creditCriteria}`
                                  ]} 
                                />
                              )}
                              {(activeContent as ProductCard).comparison && (
                                <ContentCard 
                                  title={`与 ${(activeContent as ProductCard).comparison!.with} 的区别`} 
                                  icon={RefreshCcw} 
                                  list={(activeContent as ProductCard).comparison!.points} 
                                  warning
                                />
                              )}
                              <ContentCard title="异议处理" icon={MessageSquare} list={(activeContent as ProductCard).objections.map(o => `问：${o.q}\n答：${o.a}`)} />
                              <ContentCard title="禁忌表达" icon={Ban} list={(activeContent as ProductCard).forbiddenPhrases} warning />
                            </>
                          )}
                          {guideType === 'industry' && (
                            <>
                              <ContentCard title="行业特征" icon={Info} content={(activeContent as IndustryCard).businessModel} />
                              <ContentCard title="常见资金需求" icon={Zap} content={(activeContent as IndustryCard).capitalNeed} />
                              <ContentCard title="风险点" icon={AlertCircle} list={(activeContent as IndustryCard).risks} warning />
                              <ContentCard title="常见切入产品" icon={Briefcase} list={(activeContent as IndustryCard).recommendedProducts} />
                              <ContentCard title="首次拜访建议" icon={User} list={(activeContent as IndustryCard).firstVisitTips} />
                              <ContentCard title="重点提问清单" icon={MessageSquare} list={(activeContent as IndustryCard).mustAskQuestions} copyable />
                            </>
                          )}
                          {guideType === 'scenario' && (
                            <>
                              <ContentCard title="场景目标" icon={CheckCircle2} content={(activeContent as ScenarioCard).goal} />
                              <ContentCard title="开场怎么说" icon={MessageSquare} content={(activeContent as ScenarioCard).openingTalk} copyable />
                              <ContentCard title="必问问题" icon={Target} list={(activeContent as ScenarioCard).mustAskQuestions} copyable />
                              <ContentCard title="风险识别点" icon={AlertCircle} list={(activeContent as ScenarioCard).riskPoints} warning />
                              <ContentCard title="推荐产品方向" icon={Briefcase} list={(activeContent as ScenarioCard).recommendedProducts} />
                              <ContentCard title="下一步动作" icon={TrendingUp} list={(activeContent as ScenarioCard).nextSteps} />
                            </>
                          )}
                        </>
                      ) : (
                        <>
                          <ContentCard title="风格定位" icon={Info} content={(activeContent as PersonaCard).style} />
                          <ContentCard title="擅长客群" icon={Users} list={(activeContent as PersonaCard).goodAtCustomers} />
                          <ContentCard title="擅长产品" icon={Briefcase} list={(activeContent as PersonaCard).goodAtProducts} />
                          <ContentCard title="开场风格" icon={MessageSquare} content={(activeContent as PersonaCard).openingStyle} />
                          <ContentCard title="提问风格" icon={Target} content={(activeContent as PersonaCard).questionStyle} />
                          <ContentCard title="推进节奏" icon={Clock} content={(activeContent as PersonaCard).pushStyle} />
                          <ContentCard title="典型开场白" icon={MessageSquare} content={(activeContent as PersonaCard).typicalOpening} copyable />
                          <ContentCard title="后续跟进" icon={TrendingUp} content={(activeContent as PersonaCard).typicalFollowUp} copyable />
                          <ContentCard title="异议处理" icon={ShieldCheck} content={(activeContent as PersonaCard).objectionHandling} />
                        </>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <div className="h-[400px] md:h-[600px] bg-white rounded-[1.5rem] md:rounded-[2.5rem] border border-dashed border-brand-border/20 flex flex-col items-center justify-center text-center p-8 md:p-12">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-brand-light-gray rounded-full flex items-center justify-center mb-6 md:mb-8">
                      <Search className="w-8 h-8 md:w-10 md:h-10 text-brand-gray opacity-30" />
                    </div>
                    <h3 className="font-serif text-xl md:text-2xl text-brand-dark mb-3 md:mb-4">请选择一个维度开始</h3>
                    <p className="text-xs md:text-sm text-brand-gray font-medium opacity-60 max-w-md">
                      点击左侧的分类和具体条目，即可查看结构化的业务打法建议。
                    </p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
);
};

const ContentCard = ({ title, icon: Icon, content, list, copyable, warning, action }: { 
  title: string, 
  icon: any, 
  content?: string, 
  list?: string[], 
  copyable?: boolean,
  warning?: boolean,
  action?: { label: string, onClick: () => void }
}) => (
  <div className={cn(
    "bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border shadow-sm flex flex-col group transition-all hover:shadow-md",
    warning ? "border-red-100 bg-red-50/10" : "border-brand-border/10"
  )}>
    <div className="flex items-center justify-between mb-4 md:mb-6">
      <div className="flex items-center gap-2 md:gap-3">
        <div className={cn(
          "w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center",
          warning ? "bg-red-100 text-red-500" : "bg-brand-light-gray text-brand-dark"
        )}>
          <Icon size={16} className="md:w-[18px] md:h-[18px]" />
        </div>
        <h4 className={cn("text-[10px] md:text-sm font-bold uppercase tracking-widest", warning ? "text-red-600" : "text-brand-dark")}>{title}</h4>
      </div>
      {copyable && (content || list) && (
        <button 
          onClick={() => {
            const text = content || (list ? list.join('\n') : '');
            navigator.clipboard.writeText(text);
          }}
          className="p-1.5 md:p-2 hover:bg-brand-light-gray rounded-lg transition-colors text-brand-gray"
        >
          <Copy size={12} className="md:w-3.5 md:h-3.5" />
        </button>
      )}
    </div>
    
    <div className="flex-grow">
      {content && (
        <p className={cn(
          "text-xs md:text-sm leading-relaxed font-medium",
          warning ? "text-red-700/80" : "text-brand-gray"
        )}>
          {content}
        </p>
      )}
      {list && (
        <ul className="space-y-2 md:space-y-3">
          {list.map((item, idx) => (
            <li key={idx} className="flex gap-2 md:gap-3">
              <div className={cn(
                "w-1 h-1 md:w-1.5 md:h-1.5 rounded-full mt-1.5 md:mt-2 shrink-0",
                warning ? "bg-red-400" : "bg-brand-gold"
              )} />
              <span className={cn(
                "text-xs md:text-sm leading-relaxed font-medium",
                warning ? "text-red-700/80" : "text-brand-gray"
              )}>{item}</span>
            </li>
          ))}
        </ul>
      )}
      {action && (
        <button 
          onClick={action.onClick}
          className="mt-6 w-full flex items-center justify-center gap-2 py-3 bg-brand-light-gray hover:bg-brand-border/20 text-brand-dark rounded-xl text-[10px] md:text-xs font-bold transition-all border border-brand-border/10 group/act"
        >
          <Sparkles size={14} className="text-brand-gold group-hover/act:scale-110 transition-transform" />
          {action.label}
          <ArrowRight size={12} className="group-hover/act:translate-x-1 transition-transform" />
        </button>
      )}
    </div>
  </div>
);

export default BusinessGuide;
