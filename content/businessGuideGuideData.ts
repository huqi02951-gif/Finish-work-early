/**
 * ═══════════════════════════════════════════════════════════════════════
 * 行业洞察 / 场景策略 / 风格人物 — 配置数据
 * 后续接入数据库/CMS 时，只需替换此数据源
 * ═══════════════════════════════════════════════════════════════════════
 */

export interface IndustryCard {
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

export interface ScenarioCard {
  id: string;
  name: string;
  goal: string;
  openingTalk: string;
  mustAskQuestions: string[];
  riskPoints: string[];
  recommendedProducts: string[];
  nextSteps: string[];
}

export interface PersonaCard {
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

export const INDUSTRIES: IndustryCard[] = [
  {
    id: 'manufacturing',
    name: '制造业',
    businessModel: '购入原材料 -> 加工制造 -> 销售产成品 -> 回笼资金。',
    upstreamDownstream: '上游为原材料供应商，下游为分销商或终端客户。',
    capitalNeed: '原材料采购资金、设备更新升级、厂房建设。',
    risks: ['原材料价格波动', '环保政策影响', '技术迭代风险'],
    recommendedProducts: ['流动资金贷款', '银承', '设备融资租赁'],
    firstVisitTips: ['"一定要去车间看看，感受生产热度。"', '"关注工人的忙碌程度和成品库存。"'],
    mustAskQuestions: ['"目前的产能利用率是多少？"', '"主要的原材料成本占比多大？"', '"下游回款周期一般多久？"'],
  },
  {
    id: 'trading',
    name: '贸易业',
    businessModel: '低价买入 -> 高价卖出，赚取差价，核心在于周转。',
    upstreamDownstream: '上游厂家，下游零售商或次级贸易商。',
    capitalNeed: '囤货资金、预付款项、信用证开立。',
    risks: ['存货贬值', '下游违约', '虚假贸易风险'],
    recommendedProducts: ['银承', '国内信用证', '保理业务'],
    firstVisitTips: ['"关注仓库的进出货频率。"', '"了解其在行业内的上下游话语权。"'],
    mustAskQuestions: ['"每年的周转次数大概是多少？"', '"上游是否要求预付货款？"', '"下游的账期是怎么给的？"'],
  },
  {
    id: 'tech_enterprise',
    name: '科技企业',
    businessModel: '研发投入 -> 技术转化 -> 产品销售/授权。',
    upstreamDownstream: '上游为人才、研发设备，下游为行业应用客户。',
    capitalNeed: '研发经费、人才引进、知识产权保护、市场推广。',
    risks: ['研发失败风险', '核心人才流失', '市场准入壁垒'],
    recommendedProducts: ['科技贷', '投贷联动', '知识产权质押'],
    firstVisitTips: ['"关注其专利数量和研发团队背景。"', '"了解其产品的核心竞争力在哪里。"'],
    mustAskQuestions: ['"每年的研发投入占比是多少？"', '"目前有哪些核心专利或技术壁垒？"', '"下一阶段的融资计划是？"'],
  },
  {
    id: 'taiwan_business',
    name: '台企台商',
    businessModel: '多为精密制造或电子配套，注重品质和长期合作。',
    upstreamDownstream: '多与母公司或全球供应链配套。',
    capitalNeed: '跨境结算、日常经营周转、扩大再生产。',
    risks: ['汇率风险', '供应链调整风险', '政策敏感度'],
    recommendedProducts: ['跨境结算', '内保外贷', '专项台商贷'],
    firstVisitTips: ['"尊重其管理文化，注重礼仪。"', '"了解其母公司在全球的布局。"'],
    mustAskQuestions: ['"目前跨境收付汇的主要路径是？"', '"对汇率避险有什么具体要求？"', '"母公司对大陆子公司的支持力度如何？"'],
  },
];

export const SCENARIOS: ScenarioCard[] = [
  {
    id: 'first_visit',
    name: '首次拜访客户',
    goal: '建立信任，获取基础经营信息，挖掘潜在需求。',
    openingTalk: '"张总您好，我是[银行名称]的[姓名]，之前一直关注咱们企业，在行业内口碑非常好。今天过来主要是想认识一下，学习学习，也看看有没有能为您服务的机会。"',
    mustAskQuestions: ['"咱们企业目前的发展重点在哪里？"', '"在金融服务方面，您目前觉得最不方便的地方是什么？"'],
    riskPoints: ['用力过猛推产品', '不了解背景瞎提问', '忽略客户反馈'],
    recommendedProducts: ['开户/结算', '基础流贷'],
    nextSteps: ['添加微信', '发送行内简介', '约定下次实地考察'],
  },
  {
    id: 'customer_asks_loan',
    name: '客户主动问融资',
    goal: '快速判断准入，锁定真实用途，引导后续流程。',
    openingTalk: '"没问题李总，咱们企业经营这么稳健，融资肯定没问题。您这次大概需要多少额度？主要是用在哪个环节？"',
    mustAskQuestions: ['"这笔资金预计什么时候要用到？"', '"目前能提供的担保方式有哪些？"'],
    riskPoints: ['盲目承诺额度', '忽略用途合规性', '未核实真实流水'],
    recommendedProducts: ['流贷', '抵押贷'],
    nextSteps: ['发送材料清单', '进行初步预审'],
  },
  {
    id: 'competitor_cooperation',
    name: '客户已有他行合作',
    goal: '寻找他行痛点，差异化切入，争取"二选一"或"主合作"。',
    openingTalk: '"他行能给您支持说明咱们企业确实优秀。不过每家银行的侧重点不同，我们行在[某产品/某效率]上很有优势，您可以对比参考下。"',
    mustAskQuestions: ['"目前他行的服务中，您觉得还有哪些可以提升的地方？"', '"他行的额度够用吗？审批速度如何？"'],
    riskPoints: ['恶意贬低同业', '只拼价格不拼服务', '忽略自身优势'],
    recommendedProducts: ['银承', '专项优惠贷'],
    nextSteps: ['提供对比方案', '邀请体验特色功能'],
  },
  {
    id: 'rate_only',
    name: '客户只谈利率',
    goal: '引导关注综合成本和服务价值，弱化单一价格竞争。',
    openingTalk: '"利率确实是核心，但除了明面上的利率，资金的到账速度、使用的灵活性以及后续的增值服务，其实都是隐形成本。我帮您算一笔综合账。"',
    mustAskQuestions: ['"除了利率，您对放款时效的要求高吗？"', '"如果能提供更灵活的还款方式，您会考虑吗？"'],
    riskPoints: ['陷入价格战陷阱', '忽略客户真实痛点', '承诺无法达到的低价'],
    recommendedProducts: ['贴息类产品', '随借随还流贷'],
    nextSteps: ['出具综合成本分析表', '介绍非金服务'],
  },
  {
    id: 'missing_materials',
    name: '客户资料不齐',
    goal: '安抚客户情绪，提供替代方案，确保流程不中断。',
    openingTalk: '"张总，我理解准备资料挺麻烦的。这几项材料如果暂时没有，我们可以先用[替代材料]预审，或者我帮您一起想办法补齐。"',
    mustAskQuestions: ['"这部分缺失的信息，在其他报表或合同里有体现吗？"', '"大概需要多久能补齐？"'],
    riskPoints: ['生硬拒绝', '原则性问题让步', '未告知补件期限'],
    recommendedProducts: ['信用类小额贷'],
    nextSteps: ['列出补件清单', '协助客户调取数据'],
  },
  {
    id: 'fast_disbursement',
    name: '客户想快放款',
    goal: '管理客户预期，通过绿色通道提速，建立专业形象。',
    openingTalk: '"李总，我明白这笔钱对您很重要。我会立刻启动我们的\'绿色通道\'，只要资料齐全，我会盯着流程走。咱们现在先核对下最关键的几个点。"',
    mustAskQuestions: ['"最晚什么时候必须到账？"', '"目前资料准备到什么程度了？"'],
    riskPoints: ['虚假承诺时效', '为了速度忽略合规', '未告知流程中的不确定性'],
    recommendedProducts: ['线上快贷', '存量抵押贷'],
    nextSteps: ['建立专项沟通群', '实时反馈进度'],
  },
];

export const PERSONAS: PersonaCard[] = [
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
    typicalOpening: '"张总，好久没见，听说咱们公司最近又拿奖了，真是可喜可贺！今天刚好路过，给您带了点我们行的特色小礼品..."',
    typicalFollowUp: '"李姐，上次说的那件事我一直记着呢，我帮您问了几个专家，他们的建议是..."',
    typicalClose: '"咱们认识这么久了，我的为人您也清楚。这个方案是我专门为您申请的，您看要不咱们先试着办一笔？"',
    objectionHandling: '"我特别理解您的顾虑，换做是我也会这么想。其实我们可以先从基础业务合作起，您慢慢感受我们的服务。"',
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
    typicalOpening: '"王总，根据我对贵司财报的分析，目前的资产负债结构还有优化空间。我今天带了一个针对性的降本增效方案..."',
    typicalFollowUp: '"陈总，关于上次讨论的授信方案，我已经完成了初步的测算，结果显示可以为您节约约15%的财务成本。"',
    typicalClose: '"基于目前的市场环境和贵司的需求，这份方案是目前的最优解。建议我们尽快启动流程，锁定目前的优惠利率。"',
    objectionHandling: '"您的担忧很有代表性。但从行业数据来看，目前这种模式已经非常成熟，风险点主要在于..."',
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
    typicalOpening: '"吴总，最近我接触了几家做上游配套的企业，感觉跟咱们公司的业务互补性很强，什么时候安排大家坐坐？"',
    typicalFollowUp: '"关于您上次提到的厂房选址问题，我帮您对接了园区的负责人，他们那里有一些针对性政策..."',
    typicalClose: '"我们行不仅是提供资金，更是您的战略合作伙伴。把这块业务交给我们，您能腾出更多精力去做市场。"',
    objectionHandling: '"价格只是合作的一部分。您看，通过我们的平台，您能接触到更多的优质供应商，这部分的价值远超那几个点。"',
  },
  {
    id: 'david',
    name: 'David',
    style: '高效直击型 (Brutalist)',
    goodAtCustomers: ['追求极致效率的企业主', '时间紧迫的决策者', '制造业工厂主'],
    goodAtProducts: ['长易担', '线上快贷', '银承'],
    openingStyle: '极简直接，不寒暄，直接抛出核心利益点。',
    questionStyle: '封闭式提问，快速确认准入指标，不浪费一秒钟。',
    pushStyle: '效率施压，强调"现在办，明天拿"，用速度换取决策。',
    advantages: ['效率极高', '不拖泥带水', '深受忙碌老板喜爱'],
    weaknesses: ['可能显得缺乏人情味', '容易忽略复杂的合规细节'],
    typicalOpening: '"李总，长话短说。咱们行现在有个\'长易担\'，专门给您这种优质工厂提速，银行审完直接放款，不用两头跑。您纳税够5万吗？"',
    typicalFollowUp: '"材料我已经发您微信了，一共就三项，您现在拍个照发我，我下午就进系统。"',
    typicalClose: '"名额有限，今天报上去明天就能出结果。您看是现在签还是下午我再过来？"',
    objectionHandling: '"理解。但市场不等人，晚一天就是一天的利息。咱们先走流程，不行再撤。"',
  },
  {
    id: 'sophia',
    name: 'Sophia',
    style: '咨询共情型',
    goodAtCustomers: ['处于转型期的企业', '注重长期战略的创始人', '科技创业团队'],
    goodAtProducts: ['长融保', '投贷联动', '知识产权质押'],
    openingStyle: '深度倾听，从企业的成长故事和痛点切入。',
    questionStyle: '启发式提问，引导客户思考未来的资金布局。',
    pushStyle: '方案共创，让客户觉得方案是"我们一起想出来的"。',
    advantages: ['深度洞察', '客户忠诚度极高', '能挖掘深层需求'],
    weaknesses: ['成交周期可能较长', '容易陷入细节讨论'],
    typicalOpening: '"陈总，我看咱们公司近三年的研发投入增长很快，这种\'厚积薄发\'的过程一定很不容易。在目前这个阶段，您最希望金融机构能提供什么样的支持？"',
    typicalFollowUp: '"陈总，上次您提到公司正在做产线升级，我这边研究了一些方案，结合咱们的研发投入和产业方向，有几条路径可以帮助拿到更优的政策支持，等您方便了咱们坐下来一起梳理下。"',
    typicalClose: '"这个方案是我们共同探讨的结果，它不仅是资金，更是对咱们技术价值的认可。我们一起把它落地？"',
    objectionHandling: '"我完全理解您的顾虑。其实每一个伟大的企业在扩张期都会面临这种抉择。我们可以分步走..."',
  },
  {
    id: 'leo',
    name: 'Leo',
    style: '政策专家型',
    goodAtCustomers: ['对政策敏感的企业', '财务管理规范的公司', '拟上市企业'],
    goodAtProducts: ['贴息贷款', '专项担保计划', '绿色金融'],
    openingStyle: '权威解读，从最新的政府文件和行业红利切入。',
    questionStyle: '合规性提问，通过核对指标展示专业严谨。',
    pushStyle: '红利引导，强调"政策窗口期"，错过就没补贴。',
    advantages: ['极具权威感', '能帮客户拿补贴', '合规性极强'],
    weaknesses: ['可能显得有些死板', '沟通成本较高'],
    typicalOpening: '"王总，最新的《民间投资专项担保计划》您关注了吗？里面提到的保费奖补政策，咱们公司正好在支持范围内。"',
    typicalFollowUp: '"根据我对比财政厅和工信局的最新口径，咱们这笔贷款如果走\'长融保\'，叠加贴息后的综合成本可以降到..."',
    typicalClose: '"政策窗口期通常很短，建议我们现在就锁定名额，确保补贴能顺利申报。"',
    objectionHandling: '"从政策逻辑来看，您的理解稍有偏差。根据文件第三条规定..."',
  },
];
