export interface ChecklistItem {
  name: string;
  format: string; // e.g., "PDF", "原件", "复印件盖章"
  note?: string;
  required?: boolean;
}

export interface RequiredInfoItem {
  label: string;
  type: 'text' | 'textarea' | 'table';
  fields?: string[]; // For table type
  rows?: number; // For table type
}

export interface RequiredInfoSection {
  title: string;
  items: RequiredInfoItem[];
}

export interface BusinessSubCategory {
  id: string;
  name: string;
  checklist: ChecklistItem[];
  specialNotes?: string[];
  formsToFill?: string[];
  managerReminders?: string[];
  requiredInfo?: RequiredInfoSection[]; // New field for information customers need to fill
  scriptTemplate: (params: { customerName: string; managerName: string; phone: string; wechat?: string }) => string;
}

export interface BusinessCategory {
  id: string;
  name: string;
  subCategories: BusinessSubCategory[];
}

// Helper to get dynamic dates
export const getDynamicDates = () => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-indexed
  
  // Last month
  const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  return {
    lastTwoYears: `${currentYear - 2}年度、${currentYear - 1}年度`,
    latestMonth: `${lastMonthYear}年${lastMonth}月`,
    currentYear,
    currentMonth
  };
};

const dates = getDynamicDates();

const COMMON_REQUIRED_INFO: RequiredInfoSection[] = [
  {
    title: '1. 企业基础信息补充',
    items: [
      { label: '企业简介（成立背景、主要业务、行业地位等）', type: 'textarea' },
      { label: '法人/实际控制人简介（从业经历、行业经验等）', type: 'textarea' },
      { label: '集团简介（如涉及集团客户，请提供）', type: 'textarea' }
    ]
  },
  {
    title: '2. 财务与经营补充信息',
    items: [
      { label: '主要产品情况（产品名称、经营年限、销售占比等）', type: 'textarea' },
      { label: '应收账款明细及回款周期', type: 'textarea' },
      { label: '应付账款明细及付款周期', type: 'textarea' },
      { label: '预收/预付款项说明', type: 'textarea' },
      { label: '存货构成及周转情况', type: 'textarea' },
      { label: `上年度及截止${dates.latestMonth}销售收入结构`, type: 'textarea' }
    ]
  },
  {
    title: '3. 上下游信息（前五大）',
    items: [
      { 
        label: '前五大供应商', 
        type: 'table', 
        fields: ['供应商名称', '合作年限', '采购金额(万元)', '占比(%)', '结算方式'],
        rows: 5
      },
      { 
        label: '前五大销售客户', 
        type: 'table', 
        fields: ['客户名称', '合作年限', '销售金额(万元)', '占比(%)', '结算方式'],
        rows: 5
      }
    ]
  },
  {
    title: '4. 银行融资及资产信息',
    items: [
      { 
        label: '现有银行融资情况', 
        type: 'table', 
        fields: ['银行名称', '借款人', '授信品种', '授信余额(万元)', '利率', '到期日', '担保方式'],
        rows: 3
      },
      { label: '房产资产情况（地址、权属人、面积、估值、抵押状态等）', type: 'textarea' },
      { label: '其他抵押/担保情况说明', type: 'textarea' }
    ]
  },
  {
    title: '5. 关键联系人信息',
    items: [
      { 
        label: '关键联系人明细', 
        type: 'table', 
        fields: ['职务', '姓名', '联系方式'],
        rows: 5 // 法定代表人, 实际控制人, 财务负责人, 法人配偶, 实控人配偶
      }
    ]
  }
];

export const COUNTER_BUSINESS: BusinessCategory[] = [
  {
    id: 'open',
    name: '开户业务',
    subCategories: [
      {
        id: 'open-basic',
        name: '基本户开户',
        checklist: [
          { name: '单位有效证件原件', format: '原件' },
          { name: '法人身份证原件', format: '原件' },
          { name: '网银/手机银行管理员/大额核实人/对账联系人身份证复印件', format: '复印件', note: '正反面复印在同一份上' },
          { name: '受益人身份证复印件（控股超过25%（含）的自然人）', format: '复印件' },
          { name: '经办身份证原件', format: '原件' },
          { name: '代理人在职证明（例社保缴交记录、公积金缴交记录、劳动合同等）', format: '原件' },
          { name: '租赁合同/产权证/无偿使用说明原件', format: '原件' },
          { name: '公章、财务章（如有）、法人章', format: '原件' },
          { name: '公司章程', format: '复印件', note: '官网无法识别受益人时需提供，需带水印版本' },
        ],
        managerReminders: [
          '【印鉴审核】预留印鉴须清晰、易辨别。严禁使用原子印章、光敏印章等易变形材质。',
          '【授权核实】如预留私章非法人本人，必须提供授权书及授权人身份证原件。',
          '【章程水印】识别受益人如需章程，必须是市监局下载的带水印版本，复印件无效。',
          '【费用提醒】购买支付密码器需220元现金；网银Ukey工本费及年费需提前确认账户余额。',
          '【意愿核实】若小程序核实未通过，必须补录开户核实视频，确保真实意愿。',
          '【尽职调查】开户前必须完成实地走访，拍摄办公场地照片并留存。'
        ],
        scriptTemplate: ({ customerName, managerName, wechat }) => 
          `您好${customerName ? '，' + customerName : ''}。我是厦门银行的${managerName || '客户经理'}。关于您咨询的【基本户开户】业务，我为您整理了一份详细的材料清单。办理时需要提供原件核对，复印件麻烦帮我加盖下单位公章。为了保证后续办理顺畅，建议您提前核对下印章的清晰度。清单如下，如有任何疑问，随时微信联系我${wechat ? '（微信号：' + wechat + '）' : ''}。`
      },
      {
        id: 'open-general',
        name: '一般户开户',
        checklist: [
          { name: '单位有效证件原件', format: '原件' },
          { name: '法人身份证原件', format: '原件' },
          { name: '开户许可证或基本存款账户信息表原件', format: '原件' },
          { name: '网银/手机银行管理员/大额核实人/对账联系人身份证复印件', format: '复印件' },
          { name: '受益人身份证复印件', format: '复印件' },
          { name: '经办身份证原件', format: '原件' },
          { name: '公章、财务章、法人章', format: '原件' },
        ],
        managerReminders: [
          '【基本户校验】办理前必须通过人行系统确认基本户状态为“正常”。',
          '【信息一致性】核对基本户信息表上的法人、地址是否与最新证照一致，不一致须先办基本户变更。',
          '【关联关系】询问客户开立一般户的用途（如贷款、代发工资等），做好系统维护。'
        ],
        scriptTemplate: ({ customerName, managerName, wechat }) => 
          `您好${customerName ? '，' + customerName : ''}。我是厦门银行的${managerName || '客户经理'}。为您整理了【一般户开户】的材料清单。办理时需要用到贵司的基本存款账户信息表原件，请您留意准备。清单已发在下方，您可以先核对一下，有需要随时找我${wechat ? '（微信号：' + wechat + '）' : ''}。`
      },
      {
        id: 'open-special',
        name: '专户开户',
        checklist: [
          { name: '单位有效证件原件', format: '原件' },
          { name: '法人身份证原件', format: '原件' },
          { name: '开户许可证或基本存款账户信息表原件', format: '原件' },
          { name: '开立专户的文件依据', format: '原件', note: '注意：必须是政府部门或上级单位的文件依据' },
          { name: '经办身份证原件', format: '原件' },
          { name: '公章、财务章、法人章', format: '原件' },
        ],
        managerReminders: [
          '【依据审核】核心是“文件依据”，须为政府或上级单位红头文件，普通协议不予认可。',
          '【预算单位】若涉及预算单位，需额外核实财政审批手续。',
          '【资金封闭】明确资金用途，确保符合专款专用监管要求。'
        ],
        scriptTemplate: ({ customerName, managerName, wechat }) => 
          `您好${customerName ? '，' + customerName : ''}。我是厦门银行的${managerName || '客户经理'}。关于【专户开户】，除了基础证照外，最关键的是需要一份“开立专户的文件依据”。我已经把详细清单整理好了，您可以对照准备，有不确定的文件可以先拍给我看看${wechat ? '（微信号：' + wechat + '）' : ''}。`
      }
    ]
  },
  {
    id: 'close',
    name: '销户业务',
    subCategories: [
      {
        id: 'close-basic',
        name: '基本户销户',
        checklist: [
          { name: '法人身份证原件', format: '原件' },
          { name: '开户许可证原件或基本存款账户信息原件', format: '原件交回' },
          { name: '旧印鉴卡', format: '原件交回' },
          { name: '经办身份证原件', format: '原件' },
          { name: '支付密码器', format: '原件', note: '如后续还要使用需带上，没带则只能注销' },
          { name: '转账支票或现金支票', format: '原件', note: '若有，需交回作废' },
          { name: '公章、财务章、法人章', format: '原件', note: '新旧章都要带' },
        ],
        managerReminders: [
          '【前置条件】确认客户名下在该行及其他行的所有子账户、一般户已全部撤销。',
          '【信息变更】若法人、户名已变更但未在银行更新，须先办变更再办销户。',
          '【余额处理】若账户有余额，须确认转出路径，且预留印鉴必须有效。',
          '【工商注销】若公司已注销，须提供工商部门出具的注销通知书。'
        ],
        scriptTemplate: ({ customerName, managerName, wechat }) => 
          `您好${customerName ? '，' + customerName : ''}。我是厦门银行的${managerName || '客户经理'}。办理【基本户销户】前，请您先确认公司名下在其他银行的账户是否已全部撤销。另外，办理时需要交回原有的开户许可证/信息表、印鉴卡以及未用完的支票。清单已整理如下，您看下是否方便准备${wechat ? '（微信号：' + wechat + '）' : ''}。`
      },
      {
        id: 'close-general',
        name: '一般户销户',
        checklist: [
          { name: '法人身份证原件', format: '原件' },
          { name: '旧印鉴卡', format: '原件交回' },
          { name: '经办身份证原件', format: '原件' },
          { name: '支付密码器', format: '原件' },
          { name: '转账支票或现金支票', format: '原件', note: '若有，需交回作废' },
          { name: '公章、财务章、法人章', format: '原件' },
        ],
        managerReminders: [
          '【余额清零】销户前账户余额原则上应为零，或提供明确的资金划转指令。',
          '【凭证回收】务必回收所有未用重要空白凭证（支票等）。'
        ],
        scriptTemplate: ({ customerName, managerName, wechat }) => 
          `您好${customerName ? '，' + customerName : ''}。我是厦门银行的${managerName || '客户经理'}。为您整理了【一般户销户】的材料清单。办理前请确认贵司的基本户信息是否为最新，清单如下，请查收${wechat ? '（微信号：' + wechat + '）' : ''}。`
      }
    ]
  },
  {
    id: 'change',
    name: '变更业务',
    subCategories: [
      {
        id: 'change-name-basic',
        name: '基本户变更户名',
        checklist: [
          { name: '新单位有效证件原件', format: '原件' },
          { name: '新法人身份证原件', format: '原件' },
          { name: '变更户名核准通知书原件', format: '原件' },
          { name: '开户许可证原件或基本存款账户信息原件', format: '原件交回' },
          { name: '旧印鉴卡', format: '原件交回' },
          { name: '经办身份证原件', format: '原件' },
          { name: '新的公章、财务章、法人章', format: '原件', note: '新旧章都要带' },
        ],
        managerReminders: [
          '【核准通知】必须提供工商部门出具的正式变更通知书。',
          '【印章衔接】新旧章均需带至柜面，若旧章已销毁须提供销毁证明。',
          '【关联变更】网银、短信通、对账联系人等信息需同步更新。'
        ],
        scriptTemplate: ({ customerName, managerName, wechat }) => 
          `您好${customerName ? '，' + customerName : ''}。我是厦门银行的${managerName || '客户经理'}。关于贵司【基本户变更户名】业务，我已为您整理了清单。办理时需要带上工商部门出具的核准通知书原件，以及新旧两套印章。清单如下，您可以先对照准备${wechat ? '（微信号：' + wechat + '）' : ''}。`
      },
      {
        id: 'change-legal-basic',
        name: '基本户变更法人',
        checklist: [
          { name: '新单位有效证件原件', format: '原件' },
          { name: '新法人身份证原件', format: '原件' },
          { name: '开户许可证原件或基本存款账户信息原件', format: '原件交回' },
          { name: '旧印鉴卡', format: '原件交回' },
          { name: '经办身份证原件', format: '原件' },
          { name: '公章、财务章、新旧法人章', format: '原件' },
        ],
        managerReminders: [
          '【联网核查】新法人手机号需进行联网核查，建议法人本人到场或提供授权。',
          '【受益人更新】法人变更通常涉及受益人变化，需重新填写受益人登记表。'
        ],
        scriptTemplate: ({ customerName, managerName, wechat }) => 
          `您好${customerName ? '，' + customerName : ''}。我是厦门银行的${managerName || '客户经理'}。办理【基本户变更法人】业务，请您准备好新任法人的身份证原件，以及新旧两枚法人章。详细清单已为您整理好，请查收${wechat ? '（微信号：' + wechat + '）' : ''}。`
      }
    ]
  },
  {
    id: 'special',
    name: '特殊业务',
    subCategories: [
      {
        id: 'dormant-basic',
        name: '久悬户返还',
        checklist: [
          { name: '单位有效证件原件', format: '原件' },
          { name: '法人身份证原件', format: '原件' },
          { name: '开户许可证或基本存款账户信息表原件', format: '原件' },
          { name: '经办身份证原件', format: '原件' },
          { name: '租赁合同/产权证/无偿使用说明原件', format: '原件' },
          { name: '受益人身份证复印件', format: '复印件' },
          { name: '公章、财务章、法人章', format: '原件' },
        ],
        managerReminders: [
          '【视同新开】久悬返还流程等同于新开户，必须重新进行实地核实。',
          '【尽职调查】重点核实企业为何长期不使用账户，以及当前的经营真实性。'
        ],
        scriptTemplate: ({ customerName, managerName, wechat }) => 
          `您好${customerName ? '，' + customerName : ''}。我是厦门银行的${managerName || '客户经理'}。关于贵司账户的【久悬返还】业务，流程上视同新开户，我们需要重新进行上门核实。我已经把需要准备的材料清单整理好了，您可以先准备起来，咱们约个时间我过去一趟${wechat ? '（微信号：' + wechat + '）' : ''}。`
      }
    ]
  }
];

export const CREDIT_BUSINESS: BusinessCategory[] = [
  {
    id: 'low-risk',
    name: '低风险类',
    subCategories: [
      {
        id: 'low-risk-general',
        name: '低风险类授信材料清单',
        checklist: [
          { name: '法人客户申请书', format: '原件', note: '需加盖公章' },
          { name: '经年检的营业执照', format: '复印件盖章' },
          { name: '法定代表人身份证明（身份证）', format: '复印件签字、盖章' },
          { name: '企业信用信息查询授权书', format: '原件', note: '需法人签字并加盖公章' },
          { name: '公司章程', format: '复印件盖章' },
          { name: '验资报告及附件', format: '复印件盖章' },
          { name: `${dates.lastTwoYears}财务报告及${dates.latestMonth}最新月份财务报表`, format: '复印件盖章', note: '含资产负债表、利润表、现金流量表' },
          { name: `企业${dates.lastTwoYears}以及${dates.latestMonth}纳税申报表`, format: '电子版', note: '需包含增值税、所得税申报表' },
          { name: '企业近半年银行流水', format: '电子版', note: '含明细流水，建议PDF格式' },
          { name: '企业上下游情况表', format: '电子版', note: '请参考需填写信息部分' },
        ],
        managerReminders: [
          '【报表一致性】重点核对财务报表收入与纳税申报表收入是否匹配，差异较大需说明。',
          '【征信有效期】征信授权书签字日期必须在1个月内，否则需重新签署。',
          '【流水核查】关注流水中是否存在大额个人往来，识别潜在的关联借款。',
          '【低风险特质】核实抵押物或质押物的权属是否清晰，评估值是否覆盖授信额度。'
        ],
        requiredInfo: COMMON_REQUIRED_INFO,
        scriptTemplate: ({ customerName, managerName, wechat }) => 
          `您好${customerName ? '，' + customerName : ''}。关于贵司本次申请的【低风险授信业务】，我为您整理了详细的办理指南。

附件包含两部分：
1. 需要贵司提供的材料清单；
2. 需要贵司补充填写的经营信息项。

您可以按清单先行准备，其中“需填写信息”部分您可以直接在微信上回复我，或者填在文档里。如有暂缺或疑问请随时联系我${wechat ? '（微信号：' + wechat + '）' : ''}。期待您的回复！`
      }
    ]
  },
  {
    id: 'industrial',
    name: '工商类',
    subCategories: [
      {
        id: 'industrial-general',
        name: '工商类授信材料清单（通用版）',
        checklist: [
          { name: '公司营业执照正副本', format: '复印件盖章' },
          { name: '公司章程', format: '复印件盖章' },
          { name: '验资报告', format: '复印件盖章' },
          { name: '环保批复及排污许可证', format: '复印件盖章', note: '生产型企业必备' },
          { name: '法定代表人及实际控制人身份证', format: '复印件盖章' },
          { name: '近三年财务报表（审计报告）及最新月度财务报表', format: '复印件盖章' },
          { name: '存货构成明细表及近半年应收应付账款明细', format: '复印件盖章', note: '须有结算时间' },
          { name: `近一年每月的增值税纳税申报表及缴税凭证`, format: '复印件盖章' },
          { name: '经营场所权属证明文件（国土证、房产证、租赁合同等）', format: '复印件盖章' },
          { name: '公司近半年银行往来对账单', format: '电子版', note: '必须有交易对手栏' },
          { name: '公司上下游前五大额供销合同或订单', format: '复印件盖章', note: '提供近期、数额较大的' },
        ],
        managerReminders: [
          '【环保红线】生产型企业必须核实环保批复，这是准入的刚性要求。',
          '【结算周期】应收账款明细必须包含结算时间，用以分析企业的账期和回款能力。',
          '【流水对手】银行流水必须包含交易对手，用于核实业务真实性及是否存在洗钱风险。',
          '【实控人背景】需深入调研实际控制人的行业背景、从业年限及个人资产负债情况。'
        ],
        requiredInfo: COMMON_REQUIRED_INFO,
        scriptTemplate: ({ customerName, managerName, wechat }) => 
          `您好${customerName ? '，' + customerName : ''}。为您整理了本次【工商类授信】的资料清单。

为尽快开展尽职调查，请您协助准备相关经营及财务资料，并补充填写下方的经营信息项。您可以先看下清单，有不确定的地方（比如某些材料暂时拿不到）请随时跟我沟通${wechat ? '（微信号：' + wechat + '）' : ''}。辛苦了！`
      }
    ]
  },
  {
    id: 'small-biz',
    name: '小企业类',
    subCategories: [
      {
        id: 'small-biz-full',
        name: '小企业授信材料清单（完整版）',
        checklist: [
          { name: '营业执照（最新版本）', format: 'PDF' },
          { name: '公司章程（含全体股东签字页）', format: 'PDF' },
          { name: '经营场所证明（产权证或租赁合同）', format: 'PDF' },
          { name: '银行对账单（企业+法人近6个月）', format: 'PDF', note: '含明细流水' },
          { name: `财务报表（${dates.lastTwoYears}及${dates.latestMonth}）`, format: 'Excel+PDF', note: '含资产负债表、利润表' },
          { name: '购销合同（上下游各 5 份）', format: 'PDF', note: '合同金额建议≥贷款金额' },
          { name: `纳税申报表（${dates.lastTwoYears}及${dates.latestMonth}）`, format: 'PDF' },
          { name: '税务信用查询（评级+无欠税截图）', format: 'PDF' },
          { name: '身份证+户口簿（法人、配偶、抵押人等）', format: 'PDF', note: '需本人签字' },
          { name: '婚姻状况证明（结婚证或单身声明）', format: 'PDF' },
          { name: '房产查询报告（i 厦门详细版产调）', format: 'PDF', note: '含抵押、历史信息' },
          { name: '企业征信查询授权书 + 个人征信查询授权书', format: '原件', note: '需邮寄，见模板' },
        ],
        managerReminders: [
          '【扫描规范】要求客户将材料扫描为清晰的单独PDF，严禁手机拍照拼接。',
          '【命名规则】统一命名为“[企业全称]-[材料名称].pdf”，方便归档。',
          '【面谈面签】个人材料（身份证、授权书）必须由客户经理见证本人签字，严禁代签。',
          '【产调时效】产调报告必须是近一周内的最新结果。'
        ],
        requiredInfo: COMMON_REQUIRED_INFO,
        specialNotes: [
          '所有材料请扫描为清晰的单独 PDF 文件（禁止合并）。',
          '文件命名格式：[企业全称]-[材料名称].pdf。',
          '企业材料必须加盖公章，个人材料必须本人签字。',
        ],
        scriptTemplate: ({ customerName, managerName, wechat }) => 
          `您好${customerName ? '，' + customerName : ''}。关于本次【小企业授信】的申请，我已为您整理好所需材料清单及需补充填写的经营信息。

为提高审批效率，建议您按清单准备并尽量一次性提供。其中个人部分的材料（如身份证、征信授权书）需要您本人签字。如有任何疑问，请随时联系我${wechat ? '（微信号：' + wechat + '）' : ''}。`
      }
    ]
  }
];
