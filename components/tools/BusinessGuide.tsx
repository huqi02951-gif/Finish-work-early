import React, { useState } from 'react';
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
  Ban
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
  relatedSkill?: {
    name: string;
    path: string;
  };
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
      category: '政策性增信经营贷',
      targetCustomers: ['中小微企业', '个体工商户', '小微企业主', '农户'],
      suitableIndustries: ['制造业', '科技类', '各行业中小微'],
      overview: '传统银担合作模式，由厦门市中小企业融资担保有限公司提供80%本金连带责任保证担保。',
      sellingPoints: ['逻辑成熟', '模式稳定', '适配面广', '政策性增信'],
      entryCriteria: ['真实经营', '有报税流水', '有订单', '信用基础稍弱需增信'],
      commonBlockers: ['非一年期以上', '随借随还循环贷', '无真实经营场景'],
      openingTalk: '“我这次来，主要是想看看您企业今年有没有设备更新、技改升级、产能扩张或者原材料备货这类资金安排。我们最近有一类针对制造业、科技类企业比较合适的政策型经营贷，不是单纯拼额度，而是期限、增信和整体融资成本都更适合中长期经营使用。”',
      mustAskQuestions: ['“今年是否有设备更新或技改计划？”', '“目前的融资期限是否匹配经营周期？”', '“是否有担保增信的需求？”'],
      needRecognition: '客户提到“想拿长一点期限”、“信用额度不够”或“有明确资金用途”。',
      materials: ['主体材料', '经营材料', '财税材料', '用途和增信材料'],
      steps: ['客户向中小担申请', '中小担出意向函', '银行审批', '中小担出放款通知书', '银行放款'],
      objections: [
        { q: '“为什么要担保费？”', a: '“担保费是0.5%/年，但通过担保增信，您可以获得更长周期、更稳妥的额度，综合成本依然非常有优势。”' }
      ],
      forbiddenPhrases: ['“随借随还”', '“循环贷”'],
      relatedSkill: { name: '材料清单 (授信类)', path: '/material-checklist?type=credit' }
    },
    {
      id: 'chang_yi_dan',
      name: '长易担',
      category: '简易审批备案经营贷',
      targetCustomers: ['优质中小微企业', '制造业', '科技型企业'],
      suitableIndustries: ['先进制造业', '科技类', '数智化升级企业'],
      overview: '简易审批、单笔备案模式，由中小担提供80%本金担保，效率更高。',
      sellingPoints: ['效率极高', '政策属性强', '单笔备案', '感知直接'],
      entryCriteria: ['成立满两年', '报税规范', '纳税信用非D', '资产负债率不超过70%'],
      commonBlockers: ['当前有逾期', '展期/借新还旧业务', '中小担在保风险客户'],
      openingTalk: '“针对您这类优质的制造业/科技型企业，我们现在有‘长易担’简易审批模式，流程非常快，重点支持您的设备更新和数智化改造。”',
      mustAskQuestions: ['“近12个月缴税总额是否不低于5万元？”', '“是否有设备采购或技术改造需求？”', '“目前是否有他行在保担保业务？”'],
      needRecognition: '优质企业提到“需要快速到账”、“追求极致效率”或“制造业技改”。',
      materials: ['主体材料', '经营材料', '财税材料', '用途和增信材料'],
      steps: ['银行审批通过', '向中小担报送备案', '中小担现场尽调(300万以上)', '保费到账', '放款'],
      objections: [
        { q: '“300万以上为什么要现场尽调？”', a: '“这是政策性产品的标准流程，为了确保资金精准支持到优质企业的真实技改和生产中，我们会全力配合提速。”' }
      ],
      forbiddenPhrases: ['“建筑施工类企业”', '“逾期客户”'],
      relatedSkill: { name: '材料清单 (授信类)', path: '/material-checklist?type=credit' }
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
      needRecognition: '如果客户提到“现金流紧张”、“财务成本高”或“供应商催款”，就是切入点。',
      materials: ['营业执照', '购销合同', '财务报表', '开户许可证'],
      steps: ['开户/授信申请', '贸易背景审核', '缴纳保证金', '票据签发'],
      objections: [
        { q: '“保证金比例太高了。”', a: '“我们可以根据您的信用状况申请降低比例，或者结合其他担保方式。”' }
      ],
      forbiddenPhrases: ['“我们行随便开。”', '“不用看贸易背景。”'],
      relatedSkill: { name: '银承测算工具', path: '/acceptance-calculator' }
    },
    {
      id: 'working_capital_loan',
      name: '流动资金贷款',
      category: '融资',
      targetCustomers: ['各类经营正常的企业'],
      suitableIndustries: ['制造业', '服务业', '贸易业'],
      overview: '为满足企业生产经营过程中临时性、季节性的资金需求。',
      sellingPoints: ['期限灵活', '审批快', '随借随还（部分产品）'],
      entryCriteria: ['经营满两年', '信用记录良好', '有固定经营场所'],
      commonBlockers: ['负债率过高', '流水不足', '用途不合规'],
      openingTalk: '“王总，最近订单量增加不少吧？生产线上是不是需要补充点原材料资金？我们这边的流贷产品现在有专项额度，利率也有优惠。”',
      mustAskQuestions: ['“最近的订单排期怎么样？”', '“资金回笼周期一般是多久？”', '“目前的融资渠道有哪些？”'],
      needRecognition: '客户提到“接了大单”、“原材料涨价”或“回款慢”。',
      materials: ['近两年财报', '近半年流水', '主要购销合同'],
      steps: ['资料收集', '实地调查', '授信审批', '合同签署', '提款'],
      objections: [
        { q: '“利率还是有点高。”', a: '“我们可以为您申请针对小微企业的专项贴息，折算下来非常划算。”' }
      ],
      forbiddenPhrases: ['“100%能批。”', '“钱拿去干啥都行。”'],
      relatedSkill: { name: '利率报价工具', path: '/rate-offer' }
    },
    {
      id: 'mortgage_loan',
      name: '抵押贷款',
      category: '融资',
      targetCustomers: ['拥有优质抵押物的企业或主'],
      suitableIndustries: ['各行业'],
      overview: '以房产、土地等不动产作为抵押获取的贷款。',
      sellingPoints: ['额度高', '期限长', '利率相对较低'],
      entryCriteria: ['抵押物权属清晰', '评估价值充足', '变现能力强'],
      commonBlockers: ['抵押物有瑕疵', '评估价不达预期', '二抵限制'],
      openingTalk: '“李总，咱们这块厂房/办公楼升值不少吧？其实可以把这部分‘沉睡’的资产盘活，转化成公司的发展资金。”',
      mustAskQuestions: ['“抵押物目前的权属情况是？”', '“是否有过抵押记录？”', '“您预期的融资额度是多少？”'],
      needRecognition: '客户有“长期投资需求”、“购买设备”或“大规模扩张计划”。',
      materials: ['房产证/土地证', '评估报告', '权属人身份证明'],
      steps: ['抵押物评估', '授信申报', '抵押登记', '放款'],
      objections: [
        { q: '“手续太麻烦了。”', a: '“我们现在有绿色通道，很多流程可以线上办理，我们会全程协助。”' }
      ],
      forbiddenPhrases: ['“只要有房就能贷。”', '“不看经营只看房。”'],
      relatedSkill: { name: '利率报价工具', path: '/rate-offer' }
    },
    {
      id: 'rate_discount',
      name: '利率优惠类',
      category: '政策性产品',
      targetCustomers: ['科技型、绿色、普惠小微企业'],
      suitableIndustries: ['高新技术', '环保', '农业'],
      overview: '结合政府贴息或政策性担保的低成本融资产品。',
      sellingPoints: ['极低利率', '政策扶持', '提升企业形象'],
      entryCriteria: ['符合政策定义', '入库企业优先', '纳税信用好'],
      commonBlockers: ['名额有限', '申报周期长', '合规要求严'],
      openingTalk: '“陈总，恭喜咱们公司又拿到了高新企业认定！您知道吗，针对您这类企业，我们行有专门的‘科技贷’，利率比普通贷款低不少。”',
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
    }
  ]
};

// --- Component ---

const BusinessGuide: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'guide' | 'persona'>('guide');
  const [guideType, setGuideType] = useState<'product' | 'industry' | 'scenario'>('product');
  const [selectedId, setSelectedId] = useState<string | null>(null);

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
        "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left group",
        active 
          ? "bg-brand-dark text-white shadow-lg" 
          : "hover:bg-brand-light-gray text-brand-gray"
      )}
    >
      <Icon size={16} className={cn(active ? "text-brand-gold" : "group-hover:text-brand-dark")} />
      <span className="text-xs font-bold">{name}</span>
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
                {activeContent ? (
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
                        <Sparkles size={120} className="md:w-40 md:h-40" />
                      </div>
                      <div className="relative z-10">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 md:mb-6">
                          <div className="flex items-center gap-3 md:gap-4">
                            <span className="px-3 md:px-4 py-1 md:py-1.5 bg-brand-gold/10 text-brand-gold text-[9px] md:text-[10px] font-bold uppercase tracking-widest rounded-full border border-brand-gold/20">
                              {activeTab === 'guide' ? (guideType === 'product' ? '产品打法' : guideType === 'industry' ? '行业洞察' : '场景策略') : '风格卡片'}
                            </span>
                            <h2 className="text-2xl md:text-3xl font-serif text-brand-dark">{(activeContent as any).name}</h2>
                          </div>
                          {activeTab === 'guide' && guideType === 'product' && (activeContent as ProductCard).relatedSkill && (
                            <button 
                              onClick={() => navigate((activeContent as ProductCard).relatedSkill!.path)}
                              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-dark text-white rounded-xl font-bold text-[10px] md:text-xs hover:bg-brand-dark/90 transition-all shadow-lg group/btn self-start sm:self-auto"
                            >
                              <Sparkles size={14} className="text-brand-gold" />
                              立即调用: {(activeContent as ProductCard).relatedSkill!.name}
                              <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                            </button>
                          )}
                        </div>
                        <p className="text-base md:text-lg text-brand-gray font-medium leading-relaxed max-w-3xl">
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
                  <div className="h-[600px] bg-white rounded-[2.5rem] border border-dashed border-brand-border/20 flex flex-col items-center justify-center text-center p-12">
                    <div className="w-20 h-20 bg-brand-light-gray rounded-full flex items-center justify-center mb-8">
                      <Search size={32} className="text-brand-gray opacity-30" />
                    </div>
                    <h3 className="font-serif text-2xl text-brand-dark mb-4">请选择一个维度开始</h3>
                    <p className="text-brand-gray font-medium opacity-60 max-w-md">
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
