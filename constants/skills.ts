import type { Skill } from '../types';

export const SKILLS: Skill[] = [
  {
    id: 'cd-calculator',
    name: "银承/存单测算小助手",
    category: "测算类 Skill",
    scene: "对自己 + 对中后台 + 对客户",
    audience: ["客户经理", "中后台", "放款中心"],
    input: ["金额", "期限", "利率", "保证金/存单参数"],
    output: ["测算结果", "关键参数口径"],
    form: "网页",
    status: "在线可用",
    toolRoute: "/acceptance-calculator",
    description: "快速测算银承、存单等业务的收益与成本，提供标准化的测算口径输出，方便与中后台沟通。"
  },
  {
    id: 'account-fee-discount',
    name: "账户业务费用优惠申请",
    category: "OA报批 Skill",
    scene: "对中后台 + 对客户",
    audience: ["客户经理", "领导审批", "客户"],
    input: ["申请机构", "联系方式", "客户名称", "申请日期", "EVA", "客户标签", "分行", "优惠项目选择"],
    output: ["年度优惠申请表 Excel", "OA申请文案", "对客话术"],
    form: "本地 Python GUI",
    status: "在线可用",
    toolRoute: "/fee-discount",
    description: "本地化工具，支持批量生成账户费用优惠申请所需的 Excel 表格及配套的 OA 审批文案。"
  },
  {
    id: 'rate-discount-report',
    name: "利率优惠签报智能生成",
    category: "审批文案生成 Skill",
    scene: "对中后台",
    audience: ["客户经理", "领导/审批"],
    input: ["客户名称", "优惠事项", "EVA/客户标签", "申请理由", "审批口径", "补充事实"],
    output: ["签报正文", "摘要", "可复制文本", "Word 文件"],
    form: "网页",
    status: "在线可用",
    toolRoute: "/rate-offer",
    description: "针对银行利率优惠申请场景，自动生成符合中后台口径的结构化签报文案，减少手动转译时间。"
  },
  {
    id: 'news-assistant',
    name: "宣传稿排版助手",
    category: "排版助手 Skill",
    scene: "对中后台",
    audience: ["客户经理", "中后台", "宣传员"],
    input: ["标题方向", "栏目方向", "落款单位", "投稿人", "日期", "原始材料", "图片"],
    output: ["成稿正文", "排版核对清单", "Word 文件"],
    form: "网页",
    status: "在线可用",
    toolRoute: "/news-assistant",
    description: "自动整理并排版《厦行信息》投稿新闻稿，支持图片插入和 Word 导出。"
  },
  {
    id: 'sensitive-comm-assistant',
    name: "敏感沟通助手",
    category: "对客沟通 Skill",
    scene: "对客户",
    audience: ["客户经理"],
    input: ["场景选择", "客户称呼", "沟通渠道", "语气风格", "场景专属字段"],
    output: ["直接发送版", "更正式版", "更柔和版", "电话沟通提纲版"],
    form: "网页 + 规则引擎",
    status: "在线可用",
    toolRoute: "/sensitive-comm",
    description: "处理对客沟通中收费通知、利率调整、授信暂缓等敏感事项，提供高情商、专业、边界清晰的标准化话术。"
  },
  {
    id: 'batch-billing-generation',
    name: "项下开票本地下载工具包",
    category: "本地工具包 Skill",
    scene: "对中后台 + 对自己",
    audience: ["客户经理", "中后台", "柜台/放款中心"],
    input: ["开票主体信息", "账号", "合同编号", "日期", "金额", "存单信息", "多笔收款人明细"],
    output: ["本地工具包 (Python + 模板)", "docx/xlsx 生成能力"],
    form: "本地下载工具包",
    status: "在线可用",
    toolRoute: "/batch-billing",
    description: "集成 Python 脚本与预设占位符的 Word/Excel 模板，填写客户必要信息后即可一键批量生成标准化开票文档。"
  },
  {
    id: 'discount-credit-workflow',
    name: "贴现/专门授信工作流",
    category: "授信审批材料 Skill",
    scene: "对审查 + 对客户",
    audience: ["客户经理", "审查", "客户"],
    input: ["企业基础信息", "经营信息", "上下游信息", "营业收入", "净资产", "邮件地址"],
    output: ["字段确认单", "调查报告", "附件4", "操作规范", "客户盖章材料清单", "对内邮件", "对客邮件"],
    form: "Skill + Python + 调试网页",
    status: "在线可用",
    toolRoute: "/business-guide",
    description: "端到端的贴现及专门授信全流程辅助，涵盖从客户信息收集到内部报告生成的全套材料。"
  },
  {
    id: 'chang-rong-bao',
    name: "长融保",
    category: "政策性增信经营贷",
    scene: "对客户 + 对审查",
    audience: ["客户经理", "中小微企业", "个体工商户"],
    input: ["主体材料", "经营材料", "财税材料", "用途和增信材料"],
    output: ["担保意向函", "放款通知书", "综合融资方案"],
    form: "网页 + 银担合作模式",
    status: "在线可用",
    toolRoute: "/business-guide?product=chang_rong_bao",
    description: "适合中小微客户的政策性增信经营贷，支持厦门市注册的中小微企业、个体工商户等，提供80%本金担保。",
    marketingGuide: {
      framework: "属于民间投资专项担保计划项下的流动资金贷款/经营性贷款工具。由厦门市中小企业融资担保有限公司提供80%本金连带责任保证担保，单笔期限一年期以上，非随借随还。传统银担合作模式：客户先向中小担申请担保，中小担审后出意向函，银行审批，放款前中小担出放款通知书。",
      understanding: "定位为“适合覆盖面更广、先求能做成、先求稳落地的客户”。优势是逻辑成熟、模式稳定、适配面广，适合真实经营但信用基础稍弱、需要增信的企业。",
      industryFocus: "重点支持先进制造业、科技类企业。支持购买设备及原材料、技术改造、数智化改造、改扩建厂房、店面装修、经营周转等用途。",
      targetCustomers: "1. 真实经营、有报税流水、有订单但信用基础不强需要增信的企业；2. 希望拿长效期限而非单纯短贷续贷的客户；3. 资金用途明确（设备、原料、改造等）的客户。",
      openingTalk: "“张总，最近国家在推‘民间投资专项担保计划’，针对咱们制造业企业有专门的增信支持。咱们今年如果有设备更新或者原材料备货的打算，可以看看这个政策性产品，期限长，还能解决抵押物不足的问题。”",
      comparison: "相比长易担，长融保更稳，审批逻辑更传统，适合大多数中小微企业。虽然流程多一步（需先向担保公司申请意向），但通过率更有保障。",
      interestRates: "按我行最新指导利率执行。担保费0.5%/年。注意：担保计划不等于自动贴息，贴息需另行申报。",
      materials: "主体材料、财税材料（报税报表）、经营材料（合同订单）、用途材料（采购合同/发票）。",
      speedUp: "前置核对纳税信用等级和经营异常情况，确保用途口径与批复一致。",
      rolePlay: "“制造业企业最怕资金断档。长融保提供一年期以上的中长期资金，匹配生产周期，比短贷续贷更踏实。”",
      summary: "长融保：稳健型银担合作，80%担保，一年期以上，非循环。适合求稳落地的中小微客户。",
      productBoundary: {
        suitable: ["厦门注册民营企业", "真实经营且有报税流水", "有明确的设备/原材料采购需求", "信用记录良好但抵押物不足"],
        unsuitable: ["国企或政府融资平台", "经营异常或有重大处罚记录", "随借随还需求客户", "非真实经营用途"]
      },
      highFreqQA: [
        {
          question: "担保费是不是全额补贴？",
          answer: "担保费补贴由地方财政根据当期政策执行，不能简单理解为全额补贴。目前标准保费为0.5%/年。",
          internalLogic: "防止客户产生“零成本”预期，后期政策变动导致投诉。",
          prohibited: "禁止承诺“担保费全额返还”或“免收担保费”。"
        },
        {
          question: "利率是不是自动贴息1.5%？",
          answer: "1.5%贴息属于中小微企业贷款贴息政策，需符合特定条件并另行申报，并非产品自带属性。",
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
      practicalLogic: ["第一步：看注册地和企业性质（民营/厦门）", "第二步：看纳税等级和经营异常", "第三步：看资金用途（是否为设备/原料/技改）", "第四步：确认是否能接受非循环模式"]
    }
  },
  {
    id: 'chang-yi-dan',
    name: "长易担",
    category: "简易审批备案经营贷",
    scene: "对客户 + 对审查",
    audience: ["客户经理", "优质中小微企业", "制造业/科技型"],
    input: ["主体材料", "经营材料", "财税材料", "用途和增信材料"],
    output: ["单笔备案管理", "同意放款通知书", "高效率融资方案"],
    form: "网页 + 简易审批模式",
    status: "在线可用",
    toolRoute: "/business-guide?product=chang_yi_dan",
    description: "面向优质中小微企业的简易审批单笔备案经营贷，重点支持先进制造业、科技类企业，效率更高。",
    marketingGuide: {
      framework: "属于民间投资专项担保计划项下的流动资金贷款/经营性贷款工具。由厦门市中小企业融资担保有限公司提供80%本金连带责任保证担保，单笔期限一年期以上，非随借随还。简易审批、单笔备案模式：客户先向银行申请，银行审批通过后向中小担报送材料备案。",
      understanding: "定位为“更快，更偏优质客户的简易审批备案模式”。实行单笔备案管理，设置担保代偿上限率和逾期率预警线。优势是效率更高、政策属性更强、客户感知直接。",
      industryFocus: "重点支持先进制造业、科技等相关领域。原则上不接受建筑施工类企业（高新除外）。",
      targetCustomers: "1. 制造业、科技型企业；2. 成立满两年、报税规范、纳税信用好、缴税有量的客户；3. 资产负债率不高、经营真实、上下游逻辑清楚的客户。",
      openingTalk: "“李总，咱们公司作为高新技术企业，正好符合我们最新的‘长易担’简易审批政策。这个产品专门给咱们这种优质制造业和科技企业提速，银行审完直接备案，不用像以前那样两头跑，放款非常快。”",
      comparison: "相比长融保，长易担门槛更高（尤其是300万以上），但效率极高。适合资质优异、希望快速落地的制造业和科技企业。",
      interestRates: "按我行最新指导利率执行。担保费0.5%/年。300万以下原则上一次性收取，300万以上原则上分年收取。",
      materials: "主体材料、财税材料、经营材料、用途材料。300万以上需特别关注报税口径的资产负债率和营授比。",
      speedUp: "300万以上中小担必须现场尽调，需提前预约。保费到账后出《同意放款通知书》。",
      rolePlay: "“对于咱们这种高成长性的科技企业，时间就是金钱。长易担的简易审批模式就是为了匹配咱们的节奏，只要材料规范，流程非常顺畅。”",
      summary: "长易担：高效型简易备案，80%担保，一年期以上，非循环。重点支持优质制造业、科技类。",
      productBoundary: {
        suitable: ["优质制造业、科技型企业", "成立满2年且报税规范", "纳税信用等级非D", "无当前逾期、展期或借新还旧记录"],
        unsuitable: ["建筑施工类企业（高新除外）", "中小担及其关联担保主体在保客户", "实收资本/营业收入为0的企业", "近6个月实控人重大变更"]
      },
      highFreqQA: [
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
      practicalLogic: ["第一步：看行业（是否为制造业/科技型，排除建筑类）", "第二步：看是否为中小担在保客户（必须是新客户）", "第三步：看额度需求（300万为分水岭）", "第四步：300万以上核实报税口径的财务指标"]
    }
  },
  {
    id: 'scenario-center',
    name: "场景中心",
    category: "平台核心板块",
    scene: "全场景展业导航",
    audience: ["全行客户经理"],
    input: ["业务场景选择"],
    output: ["结构化工具推荐", "展业全流程指引"],
    form: "网页",
    status: "在线可用",
    toolRoute: "/scenarios",
    description: "按业务场景组织，直观展示每个环节下的实用工具。从客户沟通到内部审批，全方位提升作业效能。"
  },
  {
    id: 'business-guide-main',
    name: "业务通 (产品打法库)",
    category: "平台核心板块",
    scene: "对客户",
    audience: ["客户经理"],
    input: ["产品名称", "行业名称"],
    output: ["产品打法", "行业洞察", "场景策略", "风格卡片"],
    form: "网页",
    status: "在线可用",
    toolRoute: "/business-guide",
    description: "全量产品打法手册，包含产品概况、准入判断、进门对话、需求识别、材料清单等结构化内容。"
  },
  {
    id: 'material-checklist-main',
    name: "材料清单中心",
    category: "平台核心板块",
    scene: "对客户",
    audience: ["客户经理"],
    input: ["业务类型", "客户情况"],
    output: ["标准化材料清单 (Word/Excel)"],
    form: "网页",
    status: "在线可用",
    toolRoute: "/material-checklist",
    description: "自动化生成对客材料清单，支持柜面业务与授信业务，一键导出，专业高效。"
  },
  {
    id: 'bbs-center-main',
    name: "交流社区 (BBS)",
    category: "平台核心板块",
    scene: "对自己",
    audience: ["全行员工"],
    input: ["实战经验", "业务提问"],
    output: ["经验沉淀", "问题解答"],
    form: "网页",
    status: "在线可用",
    toolRoute: "/bbs",
    description: "客户经理实战交流平台，分享展业心得，解决业务难题，共同成长。"
  },
  {
    id: 'feng-shui-calendar',
    name: "打工风水历",
    category: "趣味/效率 Skill",
    scene: "对自己",
    audience: ["打工人"],
    input: ["日期"],
    output: ["今日宜忌", "开运好物", "风水建议"],
    form: "网页",
    status: "在线可用",
    toolRoute: "/scenarios?tab=self",
    description: "结合五行与打工现实的趣味日历，提供每日宜忌、幸运色及职场生存建议。"
  },
  {
    id: 'food-selector',
    name: "今天吃什么",
    category: "趣味/效率 Skill",
    scene: "对自己",
    audience: ["打工人"],
    input: ["随机抽取"],
    output: ["午餐建议"],
    form: "网页",
    status: "在线可用",
    toolRoute: "/scenarios?tab=self",
    description: "打工人午餐救星，解决“中午吃什么”的终极难题。"
  },
  {
    id: 'off-duty-game',
    name: "高效下班清醒系统",
    category: "趣味/效率 Skill",
    scene: "对自己",
    audience: ["打工人"],
    input: ["加班时长", "月薪"],
    output: ["清醒金句", "下班动作建议"],
    form: "网页",
    status: "在线可用",
    toolRoute: "/scenarios?tab=self",
    description: "强制下班·发疯清醒官，通过数据揭示加班真相，引导高效下班。"
  },
  {
    id: 'update-log-main',
    name: "更新日志",
    category: "平台信息",
    scene: "对自己",
    audience: ["全行员工"],
    input: ["版本号"],
    output: ["新功能介绍", "优化项"],
    form: "网页",
    status: "在线可用",
    toolRoute: "/updates",
    description: "记录平台能力的每一次演进，不错过任何一个好用的新工具。"
  },
  {
    id: 'feedback-main',
    name: "反馈建议",
    category: "平台信息",
    scene: "对自己",
    audience: ["全行员工"],
    input: ["需求描述", "问题反馈"],
    output: ["需求入库", "问题修复"],
    form: "网页",
    status: "在线可用",
    toolRoute: "/feedback",
    description: "您的每一个建议都是我们前进的动力，共同打造最懂客户经理的平台。"
  },
  {
    id: 'industry-manufacturing',
    name: "制造业行业洞察",
    category: "行业洞察 Skill",
    scene: "对客户",
    audience: ["客户经理"],
    input: ["制造业客户"],
    output: ["行业特征", "上下游逻辑", "风险点", "产品推荐"],
    form: "网页",
    status: "在线可用",
    toolRoute: "/business-guide?tab=guide&type=industry",
    description: "深度剖析制造业经营逻辑，提供从原材料采购到产成品销售的全流程金融服务建议。"
  },
  {
    id: 'industry-tech',
    name: "科技企业行业洞察",
    category: "行业洞察 Skill",
    scene: "对客户",
    audience: ["客户经理"],
    input: ["科技型客户"],
    output: ["研发逻辑", "核心竞争力识别", "融资建议"],
    form: "网页",
    status: "在线可用",
    toolRoute: "/business-guide?tab=guide&type=industry",
    description: "针对高新、专精特新企业，提供研发投入、专利价值及投贷联动等维度的专业洞察。"
  },
  {
    id: 'scenario-first-visit',
    name: "首次拜访策略",
    category: "场景策略 Skill",
    scene: "对客户",
    audience: ["客户经理"],
    input: ["新客户"],
    output: ["进门话术", "必问问题", "观察要点"],
    form: "网页",
    status: "在线可用",
    toolRoute: "/business-guide?tab=guide&type=scenario",
    description: "解决“第一步怎么走”的问题，提供标准化的开场白与需求摸排清单。"
  },
  {
    id: 'scenario-competitor',
    name: "竞争对手挖角策略",
    category: "场景策略 Skill",
    scene: "对客户",
    audience: ["客户经理"],
    input: ["他行存量客户"],
    output: ["切入点分析", "差异化优势对比"],
    form: "网页",
    status: "在线可用",
    toolRoute: "/business-guide?tab=guide&type=scenario",
    description: "针对他行已入驻客户，寻找服务盲区，提供精准的“挖角”方案与话术。"
  },
  {
    id: 'bbs-feed',
    name: "实战动态 (Feed)",
    category: "社交/交流 Skill",
    scene: "对自己",
    audience: ["全行员工"],
    input: ["关注的人", "热门话题"],
    output: ["实时业务动态", "实战案例分享"],
    form: "网页",
    status: "在线可用",
    toolRoute: "/bbs",
    description: "实时获取全行客户经理的展业动态，学习最新实战案例。"
  },
  {
    id: 'bbs-publish',
    name: "经验发布",
    category: "社交/交流 Skill",
    scene: "对自己",
    audience: ["全行员工"],
    input: ["文字", "图片", "标签"],
    output: ["发布动态", "经验沉淀"],
    form: "网页",
    status: "在线可用",
    toolRoute: "/bbs",
    description: "便捷发布展业心得、成功案例或业务疑问，与全行同事互动交流。"
  },
  {
    id: 'messages-center',
    name: "消息中心",
    category: "平台功能",
    scene: "对自己",
    audience: ["全行员工"],
    input: ["系统通知", "互动消息"],
    output: ["未读提醒", "对话列表"],
    form: "网页",
    status: "在线可用",
    toolRoute: "/bbs",
    description: "集成系统通知、评论回复、点赞提醒等，确保重要信息不遗漏。"
  },
  {
    id: 'profile-main',
    name: "个人中心 (展业看板)",
    category: "平台核心板块",
    scene: "对自己",
    audience: ["客户经理"],
    input: ["个人信息", "展业数据"],
    output: ["能力雷达图", "展业成就", "我的收藏"],
    form: "网页",
    status: "在线可用",
    toolRoute: "/profile",
    description: "数字化展业看板，展示个人成长轨迹、能力分布及收藏的实用工具。"
  }
];
