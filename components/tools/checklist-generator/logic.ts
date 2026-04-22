import {
  AlignmentType,
  BorderStyle,
  Document,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  TextRun,
  WidthType,
} from 'docx';

export type ProductType = 'chang_yi_dan' | 'chang_rong_bao';
export type EntityType = 'enterprise' | 'individual_business' | 'micro_owner' | 'farmer';
export type IndustryType = 'wholesale_retail' | 'other';
export type RepayMethod = 'quarterly' | 'monthly' | 'bullet';
export type PayMethod = 'entrusted' | 'autonomous';
export type BooleanChoice = boolean | null;

type SectionKey =
  | 'access'
  | 'special'
  | 'over300'
  | 'scheme_crb'
  | 'scheme_cyd'
  | 'common'
  | 'approval';

export interface ChecklistRow {
  key: string;
  label: string;
  section: SectionKey;
  editable?: boolean;
}

export interface GeneratorFormData {
  enterpriseName: string;
  legalRep: string;
  actualController: string;
  spouseName: string;
  entityType: EntityType;
  registeredInXiamen: BooleanChoice;
  industryType: IndustryType;
  isGovOrSoe: BooleanChoice;
  isConstructionBusiness: BooleanChoice;
  isPersonalBusinessLoan: BooleanChoice;
  isFirstTimeChangYiDan: BooleanChoice;
  hasCurrentOverdueLoan: BooleanChoice;
  hasRiskReliefBusiness: BooleanChoice;
  isZxdGuaranteeCustomer: BooleanChoice;
  isZxdRiskCustomer: BooleanChoice;
  paidInCapitalZero: BooleanChoice;
  assetTotalZeroFlag: BooleanChoice;
  revenueZeroFlag: BooleanChoice;
  socialSecurityZero: BooleanChoice;
  ownerChangedWithin6m: BooleanChoice;
  bankBadOrWarning: BooleanChoice;
  fusionBaseRating: string;
  operationIsReal: BooleanChoice;
  fundUseCompliant: BooleanChoice;
  businessAbnormalListed: BooleanChoice;
  majorDishonestyOrExecutor: BooleanChoice;
  lendingDispute: BooleanChoice;
  unfulfilledEnforcement: BooleanChoice;
  majorAdministrativePenalty: BooleanChoice;
  amlOrSanctionRisk: BooleanChoice;
  illegalFinancialActivity: BooleanChoice;
  majorIncident3y: BooleanChoice;
  taxIllegalRecord: BooleanChoice;
  forbiddenRestrictedBusiness: BooleanChoice;
  isTechEnterprise: BooleanChoice;
  isMortgageProject: BooleanChoice;
  establishmentDate: string;
  taxCreditLevel: string;
  taxAmount12m: string;
  creditExposureTotal: string;
  taxRevenue12m: string;
  latestAssetTotal: string;
  latestLiabilityTotal: string;
  latestAssetLiabilityRatio: string;
  currentApplyAmount: string;
  existingMinjianPlanCreditAmount: string;
  otherBankChangYiDanAmount: string;
  existingBatchGuaranteeCreditAmount: string;
  zxdBusinessResponsibilityBalance: string;
  relatedPartyResponsibilityBalance: string;
  zxdNetAsset: string;
  creditAmount: string;
  creditTerm: string;
  fundPurpose: string;
  repayMethod: RepayMethod;
  quarterlyRepayAmount: string;
  monthlyRepayAmount: string;
  rateExpression: string;
  payMethod: PayMethod;
  hasThirdPartyGuarantee: BooleanChoice;
  hasMortgage: BooleanChoice;
  hasMultipleDrawdowns: BooleanChoice;
  hasFiledEachDrawdown: BooleanChoice;
  extraGuarantee: string;
  breakthroughReasons: Record<string, string>;
  answerOverrides: Record<string, string>;
}

export interface InputFieldDefinition {
  key: keyof GeneratorFormData;
  label: string;
  group: 'A基础信息' | 'B测算信息' | 'C突破判断';
  required: '必填' | '选填';
  owner: '用户' | '系统';
  consequence: '不能生成' | '不能判断' | '可暂缺';
  participatesInFormula: boolean;
}

export interface ValidationIssue {
  field: keyof GeneratorFormData | string;
  message: string;
}

interface RowOutput {
  key: string;
  label: string;
  answer: string;
}

export interface ChecklistArtifacts {
  productName: string;
  needsOver300Review: boolean;
  accessRows: RowOutput[];
  specialRows: RowOutput[];
  over300Rows: RowOutput[];
  schemeRows: RowOutput[];
  commonRows: RowOutput[];
  approvalRows: RowOutput[];
  checklistText: string;
  creditPlanText: string;
  creditPlanParagraphs: CreditPlanParagraph[];
}

interface EvaluationResult {
  answer: string;
}

interface CreditPlanParagraph {
  segments: Array<{ text: string; bold?: boolean }>;
}

const PRODUCT_LABELS: Record<ProductType, string> = {
  chang_yi_dan: '长易担',
  chang_rong_bao: '长融保',
};

const ENTITY_LABELS: Record<EntityType, string> = {
  enterprise: '企业',
  individual_business: '个体工商户',
  micro_owner: '小微企业主',
  farmer: '农户',
};

const INDUSTRY_LABELS: Record<IndustryType, string> = {
  wholesale_retail: '批发零售',
  other: '其他',
};

const PAY_METHOD_LABELS: Record<PayMethod, string> = {
  entrusted: '受托支付',
  autonomous: '自主支付',
};

const GRID_WIDTHS = [7272, 1308, 1308];
const TABLE_BORDERS = {
  top: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
  bottom: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
  left: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
  right: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
  insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
  insideVertical: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
};

export const CHECKLIST_TEMPLATE_ROWS: ChecklistRow[] = [
  { key: 'a1', label: '1、注册地位于厦门市的中小微企业、中小微非企业经济组织。“长融保”业务还支持个体工商户、小微企业主及农户。', section: 'access', editable: true },
  { key: 'a2', label: '2、借款人在未被列入经营异常名录，借款人及其法定代表人、实际控制人在不存在失信被执行人等重大不良信用记录，查询“国家企业信用信息公示系统”及“信用中国”并提供截图。', section: 'access', editable: true },
  { key: 'a3', label: '3、存在作为被告的借贷类案件纠纷原则上不予准入（若我行同意准入的，应提供相关说明材料，经中小担同意后予以准入，以中小担对接人与我行微信确认后的截图为准，并上传信贷系统），不存在未履行完毕的强制执行或重大行政处罚记录。', section: 'access', editable: true },
  { key: 'a4', label: '4、借款人及其法定代表人、实际控制人未涉及洗钱、恐怖融资、扩散融资、逃税骗税、制裁等风险，未违法从事民间借贷、非法集资、涉黑涉恶及其他非法金融活动。', section: 'access', editable: true },
  { key: 'a5', label: '5、提供的产品（服务）不属于国家禁止、限制或淘汰类', section: 'access', editable: true },
  { key: 'a6', label: '6、借款人近三年未发生重大安全（含网络安全、数据安全）、质量、环境污染等事故，无偷漏税等违法违规行为记录。', section: 'access', editable: true },
  { key: 'a7', label: '7、借款人及其关联人（法定代表人、控股股东、实际控制人）、关联企业（关联人控制企业）当前在本行无不良及重大预警情况。', section: 'access', editable: true },
  { key: 'a8', label: '8、借款人符合本行基础评级策略的准入要求，具体标准以最新通知为准。', section: 'access', editable: true },
  { key: 's1', label: '1、首次纳入长易担业务的，借款人无当前逾期贷款（含本金或利息），本业务不涵盖本行展期、借新还旧（含归还转贷资金）、无还本续贷（不得覆盖原额度，采用接力贷、信贷周转资金等）等风险缓释类业务及存量风险转化业务。', section: 'special', editable: true },
  { key: 's2', label: '2、“长易担”需为线下尽调审批业务（300万以下可采用线上+线下模式），需落实借款人或担保企业具备实际经营场景，且资金用途合理合规。“长易担”项下在保业务风险缓释时，可不受相关信用条件及以下授信方案中融资期限等条件约束，但不得扩大中小担的担保责任（包括担保责任方式、承保比例、担保责任金额等），不得续贷至国家融资担保基金的其他业务品种。', section: 'special', editable: true },
  { key: 's3', label: '3、本业务不接受个人经营性贷款申请（农户除外）；原则上不接受建筑施工类企业申请（具有有效高新技术企业资质的除外）。“长易担”业务重点支持先进制造业、科技等相关领域。', section: 'special', editable: true },
  { key: 's4', label: '4、借款人不属于政府融资平台或国有企业，具体包括:①政府部门、机构、事业单位出资设立的国有独资企业，以及上述单位、企业直接或间接合计持股为100%的国有全资企业;②上述单位、企业单独或共同出资，合计拥有产(股)权比例超过50%，且其中之一为最大股东的企业;③上述所列单位、企业对外出资，拥有股权比例超过50%的各级子企业;④上述单位、单一国有及国有控股企业直接或间接持股比例未超过50%，但为第一大股东，并且通过股东协议、公司章程、董事会决议或者其他协议安排能够对其实际支配的企业。', section: 'special', editable: true },
  { key: 's5', label: '5、借款人在放款时点非中小担及其关联担保主体（如包含市担保、湖里担保、海沧担保等关联主体）的融资担保在保客户（不含批量融资担保业务），非中小担及其关联担保主体的风险客户（包括展期、重组、逾期、代偿、审批未通过或明知风险未开展合作等情形）。', section: 'special', editable: true },
  { key: 's6', label: '6、原则上借款人的实收资本、资产总额、营业收入、社保人数不能为0，若其中任意一项或多项为0，但若经办支行认为情况合理的可向中小担提供相应情况说明及相关实际经营核实照片，经中小担审核同意后可准入，以中小担对接人与我行微信确认后的截图为准，并上传信贷系统。', section: 'special', editable: true },
  { key: 's7', label: '7、原则上款人在主债权起始日前6个月内未发生法定代表人、实际控制人或大股东的变更，若发生上述变更但经办支行认为情况合理的应向中小担提供相应情况说明，经中小担保审核确认后准入，以中小担对接人与我行微信确认后的截图为准，并上传信贷系统。', section: 'special', editable: true },
  { key: 'o1', label: '8.1借款人或担保企业成立时间满2年及以上；', section: 'over300', editable: true },
  { key: 'o2', label: '8.2借款人（含经营主体）上一年度纳税信用等级非D级，申请授信前12个月（或上年度）的缴税总额（含税收优惠减免额）在5万元（含）以上', section: 'over300', editable: true },
  { key: 'o3', label: '8.3借款人（含经营主体）营授比不超过40%，批发零售行业营授比不超过20%（营授比=企业征信报告体现的借款人（含经营主体）授信敞口总额(余额，含本次，可剔除低信用风险敞口)/申请授信前12个月（或上年度）报税收入，以纳税申报表为准）', section: 'over300', editable: true },
  { key: 'o4', label: '8.4借款人（含经营主体）最新一期报税报表体现的资产负债率不超过70%。', section: 'over300', editable: true },
  { key: 'r1', label: '1.1单一借款人在民间投资专项计划项下（长融保与长易担业务合计）最高授信额度不超过2000万元；借款人在中小担的各类业务合计融资担保责任余额不超过5000万元，且不超过中小担净资产（扣除对其他融资担保公司投资）的10%，借款人及其关联方在中小担各类业务的融资担保责任余额不超过中小担净资产（扣除对其他融资担保公司投资）的15%。', section: 'scheme_crb', editable: true },
  { key: 'r2', label: '1.2单笔贷款期限设置为一年期以上（不含一年期），以借款凭证载明期限为准，贷款形式，不采用随借随还的循环贷模式。', section: 'scheme_crb', editable: true },
  { key: 'r3', label: '1.3中小担提供连带责任保证担保，担保范围为单笔借款合同项下未清偿贷款本金余额的80%（不含利息、违约金、罚息等），保证期间自单笔贷款授信合同签订之日起，至债务履行期限届满（含本行宣布债务提前到期）之日后三年止。', section: 'scheme_crb', editable: true },
  { key: 'r4', label: '1.4贷款用途需为购买设备及原材料、技术改造、数智化改造（含购买硬件设备和软件系统）、改扩建厂房、店面装修、经营周转等生产活动，以及用于餐饮住宿、健康、养老、托育、家政、文化娱乐、旅游、体育、绿色、数字、零售等消费领域场景拓展和升级改造等。\n需根据借款人实际资金用途在借款合同或借款业务申请书中具体选择下列融资用途中任意一项，分别为：“购买设备及原材料”、“技术改造”、“数智化改造”、“改扩建厂房”、“店面装修”、“经营周转”，与授信批复保持一致，不得使用其他表述。', section: 'scheme_crb', editable: true },
  { key: 'r5', label: '1.5中小担向我行出具《担保意向函》，信贷系统建立中小担最高额保证合同，以实现担保额度占用。', section: 'scheme_crb', editable: true },
  { key: 'r6', label: '1.6放款前提供《放款通知书》。', section: 'scheme_crb', editable: true },
  { key: 'e1', label: '2.1单一借款人在长易担业务项下所有合作银行的最高授信额度合计不超过1000万元，民间投资专项计划项下（长易担与长融保业务合计）不超过2000万元；（备注：此处单一借款人包含同一法定代表人的企业或有为借款人提供保证的企业或个人）。', section: 'scheme_cyd', editable: true },
  { key: 'e2', label: '2.2借款人在中小担所有批量担保业务（含长易担业务，国家融资担保基金直连“总对总”业务除外）的最高授信额度合计不超过2000万元', section: 'scheme_cyd', editable: true },
  { key: 'e3', label: '2.3借款人在中小担的各类业务合计融资担保责任余额不超过5000万元，且在中小担各类业务合计融资担保责任余额不得超过中小担净资产(扣除中小担对其他融资担保公司投资)的10%，借款人及其关联方在中小担各类业务的融资担保责任余额不得超过中小担净资产（扣除对其他融资担保公司投资）的15%。', section: 'scheme_cyd', editable: true },
  { key: 'e4', label: '2.4单笔贷款期限设置为一年期以上（不含一年期），以借款凭证载明期限为准，贷款形式，不采用随借随还的循环贷模式。原则上采用单笔备案模式，若本行以授信额度备案至中小担，其项下存在多笔提款的，需按提款笔数逐笔向中小担备案。', section: 'scheme_cyd', editable: true },
  { key: 'e5', label: '2.5中小担提供连带责任保证担保，担保范围为单笔借款合同项下未清偿贷款本金余额的80%（不含利息、违约金、罚息等），保证期间自单笔贷款授信合同签订之日起，至债务履行期限届满（含本行宣布债务提前到期）之日后三年止。\n如有除中小担之外的第三方为我行提供保证担保或作为共同借款人/共同债务人的，应同时确保该第三方为同一笔担保贷款向中小担提供反担保；对于有不动产抵押的业务，须同步向中小担办理二押(确无法办理二押的，需经由中小担审核通过可豁免，以中小担对接人与我行微信确认后的截图为准，并上传信贷系统)。', section: 'scheme_cyd', editable: true },
  { key: 'e6', label: '2.6贷款用途需为购买设备及原材料、技术改造、数智化改造（含购买硬件设备和软件系统）、改扩建厂房、店面装修、经营周转等生产活动，以及用于餐饮住宿、健康、养老、托育、家政、文化娱乐、旅游、体育、绿色、数字、零售等消费领域场景拓展和升级改造等。\n需根据借款人实际资金用途在借款合同或借款业务申请书中具体选择下列融资用途中任意一项，分别为：“购买设备及原材料”、“技术改造”、“数智化改造”、“改扩建厂房”、“店面装修”、“经营周转”，与授信批复保持一致，不得使用其他表述。', section: 'scheme_cyd', editable: true },
  { key: 'e7', label: '2.7信贷系统建立中小担最高额保证合同，以实现担保额度占用。', section: 'scheme_cyd', editable: true },
  { key: 'e8', label: '2.8放款前提供《放款通知书》。', section: 'scheme_cyd', editable: true },
  { key: 'c1', label: '合同限制性条款：借款人已充分了解民间投资专项担保计划相关政策，认可中小担的增信作用，自愿按约定缴纳担保费；无论本行是否获得中小担代偿，均不影响本行对借款人、担保人的全额追偿权利，借款人、担保人不得以本行获得代偿为由主张减免债务；借款人未按约定使用资金、未按时偿还贷款的，本行有权宣布贷款提前到期，并要求中小担履行担保责任，同时借款人按约定承担相应违约责任。\n涉及反担保的，本行协助中小担与反担保人签订反担保合同，落实反担保相关手续。', section: 'common', editable: true },
  { key: 'c2', label: '4、额度建档以及重新备案时需提供以下资料：均需由客户经理截屏（注意截屏时间需体现）、并上传至信贷系统客户影像资料中。\n（1）查询厦门市商事主体登记及信用信息公示平台，借款人未被列入经营异常名录。\n（2）查询中国执行信息公开网（被执行人信息和失信被执行人查询模块）及“国家企业信用信息公示系统”及“信用中国”、税务网站等，能显示借款人及其法定代表人、实际控制人XXX当前无被执行借贷合同案件或刑事案件或失信被执行信息、未涉及洗钱、恐怖融资、扩散融资、逃税骗税、制裁等风险，未违法从事民间借贷、非法集资、涉黑涉恶及其他非法金融活动、近三年未发生重大安全（含网络安全、数据安全）、质量、环境污染等事故，无偷漏税等违法违规行为记录。', section: 'common', editable: true },
  { key: 'c3', label: '5、调查报告和其他条件需明确结论：明确担保方式为纳入“长融保”、“长易担”产品补偿范围。', section: 'common', editable: true },
  { key: 'p1', label: '1、符合除增信抵押贷场景的其他增信基金场景，且长易担额度+增信基金额度授信敞口不超过500万元', section: 'approval' },
  { key: 'p2', label: '2、符合除增信抵押贷场景的其他增信基金场景的三类重点客群：专精特新企业、科技型企业（仅限国家级、省级高新技术企业及福建省科技小巨人）、经营满2年且近2年营收盈利稳定（去年纳税申报营业额不低于2000万）的拥有自有厂房的生产型企业，如同时满足如下条件的可通过小企业条线上报：（1）500万元＜长易担额度+增信基金额度授信敞口≤1000万元且全部额度授信敞口≤3000万元，（2）可提供近一个年度的经备案的审计报告（如无法提供经备案的审计报告，不适用财务报表未经审计而提高到分行行长这一规定），并要求至少上一个年度盈利。（3）可适用小企业完整版授信报告及材料清单，但需增加补充调查说明，若为生产型企业，还需提供看厂报告。', section: 'approval' },
  { key: 'p3', label: '3、通过小企业条线申报的各类信用保证类长易担额度+增信子基金业务，同一实际控制人控制的企业不超过2户且总额度不超过1000万元（增信抵押贷不计入该1000万元额度内，承做增信抵押贷的企业也不在2户限制范围内）。如超过上述1000万元总额度的需满足以下条件：若2家企业均为专精特新企业、科技型企业（仅限国家级、省级高新技术企业及福建省科技小巨人）、经营满2年且近2年营收盈利稳定的拥有自有厂房的生产型企业中的一类，则可超过1000万元，但不超过1500万元，且不得申请采用小企业非标授信。', section: 'approval' },
  { key: 'p4', label: '4、不符合以上要求的需按工商条线上报。', section: 'approval' },
];

export const DEFAULT_FORM_DATA: GeneratorFormData = {
  enterpriseName: '',
  legalRep: '',
  actualController: '',
  spouseName: '',
  entityType: 'enterprise',
  registeredInXiamen: null,
  industryType: 'other',
  isGovOrSoe: null,
  isConstructionBusiness: null,
  isPersonalBusinessLoan: null,
  isFirstTimeChangYiDan: null,
  hasCurrentOverdueLoan: null,
  hasRiskReliefBusiness: null,
  isZxdGuaranteeCustomer: null,
  isZxdRiskCustomer: null,
  paidInCapitalZero: null,
  assetTotalZeroFlag: null,
  revenueZeroFlag: null,
  socialSecurityZero: null,
  ownerChangedWithin6m: null,
  bankBadOrWarning: null,
  fusionBaseRating: '',
  operationIsReal: null,
  fundUseCompliant: null,
  businessAbnormalListed: null,
  majorDishonestyOrExecutor: null,
  lendingDispute: null,
  unfulfilledEnforcement: null,
  majorAdministrativePenalty: null,
  amlOrSanctionRisk: null,
  illegalFinancialActivity: null,
  majorIncident3y: null,
  taxIllegalRecord: null,
  forbiddenRestrictedBusiness: null,
  isTechEnterprise: null,
  isMortgageProject: null,
  establishmentDate: '',
  taxCreditLevel: '',
  taxAmount12m: '',
  creditExposureTotal: '',
  taxRevenue12m: '',
  latestAssetTotal: '',
  latestLiabilityTotal: '',
  latestAssetLiabilityRatio: '',
  currentApplyAmount: '',
  existingMinjianPlanCreditAmount: '',
  otherBankChangYiDanAmount: '',
  existingBatchGuaranteeCreditAmount: '',
  zxdBusinessResponsibilityBalance: '',
  relatedPartyResponsibilityBalance: '',
  zxdNetAsset: '',
  creditAmount: '',
  creditTerm: '',
  fundPurpose: '',
  repayMethod: 'quarterly',
  quarterlyRepayAmount: '',
  monthlyRepayAmount: '',
  rateExpression: '不低于五年期LPR-50b.p.',
  payMethod: 'entrusted',
  hasThirdPartyGuarantee: null,
  hasMortgage: null,
  hasMultipleDrawdowns: null,
  hasFiledEachDrawdown: null,
  extraGuarantee: '',
  breakthroughReasons: {},
  answerOverrides: {},
};

const PRODUCT_SPECIFIC_KEYS: Record<ProductType, Array<keyof GeneratorFormData>> = {
  chang_yi_dan: [],
  chang_rong_bao: [
    'otherBankChangYiDanAmount',
    'existingBatchGuaranteeCreditAmount',
    'hasMultipleDrawdowns',
    'hasFiledEachDrawdown',
  ],
};

function overrideOr(answer: string, data: GeneratorFormData, key: string): string {
  const override = data.answerOverrides[key]?.trim();
  return override ? `【人工修改】${override}` : answer;
}

function normalizeRating(value: string): string {
  const text = value.trim();
  if (!text) return '';
  return text.includes('级') ? text : `${text}级`;
}

function parseAmount(value: string): number | null {
  if (/元/.test(value) && !/万/.test(value)) return null;
  const normalized = value.replace(/[,，%\s万元元]/g, '');
  if (!normalized) return null;
  const amount = Number(normalized);
  return Number.isFinite(amount) ? amount : null;
}

function isInvalidNumericInput(value: string): boolean {
  return value.trim() !== '' && parseAmount(value) === null;
}

function formatAmount(value: number | null, digits = 2): string {
  if (value === null || !Number.isFinite(value)) return '__';
  return Number.isInteger(value) ? `${value}` : value.toFixed(digits).replace(/\.?0+$/, '');
}

function formatPercent(value: number | null, digits = 2): string {
  if (value === null || !Number.isFinite(value)) return '__%';
  return `${value.toFixed(digits).replace(/\.?0+$/, '')}%`;
}

function buildBreakthroughSuffix(data: GeneratorFormData, key: string): string {
  const reason = data.breakthroughReasons[key]?.trim();
  return `需突破。突破理由：${reason || '请补充。'}`;
}

function buildMissing(text: string): EvaluationResult {
  return { answer: `需补充：${text}` };
}

function buildPass(text: string): EvaluationResult {
  return { answer: `${text}符合要求。` };
}

function buildFail(text: string, data: GeneratorFormData, key: string): EvaluationResult {
  return { answer: `${text}不符合要求，${buildBreakthroughSuffix(data, key)}` };
}

function requireChoice(
  value: BooleanChoice,
  label: string,
): EvaluationResult | null {
  return value === null ? buildMissing(`请确认${label}。`) : null;
}

function parseDateInput(value: string): Date | null {
  const text = value.trim();
  if (!text) return null;
  const direct = new Date(text);
  if (!Number.isNaN(direct.getTime())) return direct;
  const match = text.match(/^(\d{4})(?:[年\/\-\.](\d{1,2}))?(?:[月\/\-\.](\d{1,2}))?/);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2] || '1');
  const day = Number(match[3] || '1');
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatChineseDate(value: string): string {
  const text = value.trim();
  if (!text) return '';
  const parsed = parseDateInput(text);
  if (!parsed) return text;
  const y = parsed.getFullYear();
  const m = parsed.getMonth() + 1;
  const d = parsed.getDate();
  if (/^\d{4}$/.test(text)) return `${y}年`;
  if (/^\d{4}[年\/\-\.]\d{1,2}$/.test(text) || /^\d{4}-\d{1,2}$/.test(text)) return `${y}年${m}月`;
  return `${y}年${m}月${d}日`;
}

function yearsBetween(date: Date, now = new Date()): number {
  let years = now.getFullYear() - date.getFullYear();
  const monthDiff = now.getMonth() - date.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < date.getDate())) years -= 1;
  return years;
}

function parseTermMonths(value: string): number | null {
  const text = value.trim();
  if (!text) return null;
  const yearMatch = text.match(/(\d+(?:\.\d+)?)\s*年/);
  if (yearMatch) return Number(yearMatch[1]) * 12;
  const monthMatch = text.match(/(\d+(?:\.\d+)?)\s*个?月/);
  if (monthMatch) return Number(monthMatch[1]);
  const numeric = Number(text);
  return Number.isFinite(numeric) ? numeric : null;
}

function primaryApplyAmount(data: GeneratorFormData): number | null {
  return parseAmount(data.currentApplyAmount) ?? parseAmount(data.creditAmount);
}

function primaryCreditAmountText(data: GeneratorFormData): string {
  return data.creditAmount.trim() || data.currentApplyAmount.trim() || '__';
}

function resolveAssetLiabilityRatio(data: GeneratorFormData): { ratio: number | null; asset: number | null; liability: number | null; fromFormula: boolean } {
  const asset = parseAmount(data.latestAssetTotal);
  const liability = parseAmount(data.latestLiabilityTotal);
  if (asset !== null && asset > 0 && liability !== null) {
    return { ratio: (liability / asset) * 100, asset, liability, fromFormula: true };
  }
  const ratio = parseAmount(data.latestAssetLiabilityRatio);
  return { ratio, asset, liability, fromFormula: false };
}

function evaluateAccessRow(key: string, product: ProductType, data: GeneratorFormData): EvaluationResult {
  switch (key) {
    case 'a1': {
      const missing = requireChoice(data.registeredInXiamen, '注册地是否厦门');
      if (missing) return missing;
      if (!data.registeredInXiamen) {
        return buildFail('授信申请人注册地不在厦门市。', data, key);
      }
      if (product === 'chang_yi_dan' && (data.entityType === 'micro_owner' || data.entityType === 'farmer')) {
        return buildFail(`授信申请人为${ENTITY_LABELS[data.entityType]}，不属于长易担本条支持主体范围。`, data, key);
      }
      return buildPass(`授信申请人为厦门市${ENTITY_LABELS[data.entityType]}，注册地在厦门市，`);
    }
    case 'a2': {
      const abnormalMissing = requireChoice(data.businessAbnormalListed, '是否列入经营异常');
      if (abnormalMissing) return abnormalMissing;
      const dishonestyMissing = requireChoice(data.majorDishonestyOrExecutor, '是否存在重大失信/被执行');
      if (dishonestyMissing) return dishonestyMissing;
      if (data.businessAbnormalListed || data.majorDishonestyOrExecutor) {
        const reasons = [
          data.businessAbnormalListed ? '存在经营异常名录记录' : '',
          data.majorDishonestyOrExecutor ? '存在重大失信或被执行记录' : '',
        ].filter(Boolean).join('，');
        return buildFail(`查询“国家企业信用信息公示系统”及“信用中国”，${reasons}，`, data, key);
      }
      return buildPass('查询“国家企业信用信息公示系统”及“信用中国”，未发现经营异常或重大不良信用记录，');
    }
    case 'a3': {
      const disputeMissing = requireChoice(data.lendingDispute, '是否存在借贷类案件纠纷');
      if (disputeMissing) return disputeMissing;
      const enforcementMissing = requireChoice(data.unfulfilledEnforcement, '是否存在强制执行未履行完毕');
      if (enforcementMissing) return enforcementMissing;
      const penaltyMissing = requireChoice(data.majorAdministrativePenalty, '是否存在重大行政处罚');
      if (penaltyMissing) return penaltyMissing;
      if (data.lendingDispute || data.unfulfilledEnforcement || data.majorAdministrativePenalty) {
        const reasons = [
          data.lendingDispute ? '存在借贷类案件纠纷' : '',
          data.unfulfilledEnforcement ? '存在未履行完毕的强制执行' : '',
          data.majorAdministrativePenalty ? '存在重大行政处罚' : '',
        ].filter(Boolean).join('，');
        return buildFail(`查询法院网、中国执行信息公开网、企查查、裁判文书网等平台，${reasons}，`, data, key);
      }
      return buildPass('查询法院网、中国执行信息公开网、企查查、裁判文书网等平台，未发现借贷类案件纠纷、未履行完毕的强制执行或重大行政处罚记录，');
    }
    case 'a4': {
      const amlMissing = requireChoice(data.amlOrSanctionRisk, '是否涉及洗钱/恐怖融资/扩散融资/逃税骗税/制裁等风险');
      if (amlMissing) return amlMissing;
      const illegalFinanceMissing = requireChoice(data.illegalFinancialActivity, '是否涉及民间借贷/非法集资/涉黑涉恶等非法金融活动');
      if (illegalFinanceMissing) return illegalFinanceMissing;
      if (data.amlOrSanctionRisk || data.illegalFinancialActivity) {
        const reasons = [
          data.amlOrSanctionRisk ? '存在洗钱、恐怖融资、扩散融资、逃税骗税或制裁等风险' : '',
          data.illegalFinancialActivity ? '涉及民间借贷、非法集资、涉黑涉恶等非法金融活动' : '',
        ].filter(Boolean).join('，');
        return buildFail(`查询“国家企业信用信息公示系统”“信用中国”及执行信息公开网，${reasons}，`, data, key);
      }
      return buildPass('查询“国家企业信用信息公示系统”“信用中国”及执行信息公开网，未发现洗钱、恐怖融资、扩散融资、逃税骗税、制裁或非法金融活动风险，');
    }
    case 'a5': {
      const missing = requireChoice(data.forbiddenRestrictedBusiness, '产品或服务是否属于国家禁止/限制/淘汰类');
      if (missing) return missing;
      return data.forbiddenRestrictedBusiness
        ? buildFail('借款人提供的产品或服务属于国家禁止、限制或淘汰类，', data, key)
        : buildPass('查询我行授信政策中的国家禁止、限制、淘汰类名单，借款人提供的产品或服务未在名单内，');
    }
    case 'a6': {
      const incidentMissing = requireChoice(data.majorIncident3y, '近三年是否发生重大安全/质量/环保事故');
      if (incidentMissing) return incidentMissing;
      const taxMissing = requireChoice(data.taxIllegalRecord, '是否存在偷漏税等违法违规记录');
      if (taxMissing) return taxMissing;
      if (data.majorIncident3y || data.taxIllegalRecord) {
        const reasons = [
          data.majorIncident3y ? '近三年发生重大安全、质量或环保事故' : '',
          data.taxIllegalRecord ? '存在偷漏税等违法违规记录' : '',
        ].filter(Boolean).join('，');
        return buildFail(`查询公开信息并结合税务核查，${reasons}，`, data, key);
      }
      return buildPass('查询公开信息并结合税务核查，近三年未发现重大安全、质量、环保事故或偷漏税等违法违规记录，');
    }
    case 'a7': {
      const missing = requireChoice(data.bankBadOrWarning, '借款人及关联人在本行是否不良或重大预警');
      if (missing) return missing;
      return data.bankBadOrWarning
        ? buildFail('借款人及其关联人在本行存在不良或重大预警情况，', data, key)
        : buildPass('借款人及其关联人在本行无不良及重大预警情况，');
    }
    case 'a8': {
      const rating = normalizeRating(data.fusionBaseRating);
      if (!rating) return buildMissing('请填写融合基础评级等级。');
      return buildPass(`融合基础评级为${rating}，`);
    }
    default:
      return buildMissing('未配置的准入项。');
  }
}

function evaluateSpecialRow(key: string, data: GeneratorFormData): EvaluationResult {
  switch (key) {
    case 's1': {
      const firstTimeMissing = requireChoice(data.isFirstTimeChangYiDan, '是否首次纳入长易担');
      if (firstTimeMissing) return firstTimeMissing;
      const overdueMissing = requireChoice(data.hasCurrentOverdueLoan, '当前是否存在逾期贷款');
      if (overdueMissing) return overdueMissing;
      const riskReliefMissing = requireChoice(data.hasRiskReliefBusiness, '是否存在展期/借新还旧/无还本续贷/风险缓释类业务');
      if (riskReliefMissing) return riskReliefMissing;
      if (data.hasCurrentOverdueLoan || data.hasRiskReliefBusiness) {
        const reasons = [
          data.hasCurrentOverdueLoan ? '存在当前逾期贷款' : '',
          data.hasRiskReliefBusiness ? '涉及展期、借新还旧、无还本续贷或存量风险转化业务' : '',
        ].filter(Boolean).join('，');
        return buildFail(`${data.isFirstTimeChangYiDan ? '首次纳入长易担，' : ''}${reasons}，`, data, key);
      }
      return buildPass(`${data.isFirstTimeChangYiDan ? '首次纳入长易担，' : ''}当前无逾期贷款，且不涉及展期、借新还旧、无还本续贷或存量风险转化业务，`);
    }
    case 's2': {
      const operationMissing = requireChoice(data.operationIsReal, '实际经营是否真实');
      if (operationMissing) return operationMissing;
      const fundUseMissing = requireChoice(data.fundUseCompliant, '资金用途是否合理合规');
      if (fundUseMissing) return fundUseMissing;
      const riskReliefMissing = requireChoice(data.hasRiskReliefBusiness, '是否存在展期/借新还旧/无还本续贷/风险缓释类业务');
      if (riskReliefMissing) return riskReliefMissing;
      if (!data.operationIsReal || !data.fundUseCompliant || data.hasRiskReliefBusiness) {
        const reasons = [
          !data.operationIsReal ? '实际经营场景核实不足' : '',
          !data.fundUseCompliant ? '资金用途不合理或不合规' : '',
          data.hasRiskReliefBusiness ? '属于在保业务风险缓释情形，需另行核实不得扩大中小担担保责任' : '',
        ].filter(Boolean).join('，');
        return buildFail(`${reasons}，`, data, key);
      }
      return buildPass('借款人具备实际经营场景，资金用途合理合规，且本次不属于在保业务风险缓释情形，');
    }
    case 's3': {
      const personalLoanMissing = requireChoice(data.isPersonalBusinessLoan, '是否个人经营性贷款');
      if (personalLoanMissing) return personalLoanMissing;
      const constructionMissing = requireChoice(data.isConstructionBusiness, '是否建筑施工类');
      if (constructionMissing) return constructionMissing;
      if (data.isConstructionBusiness) {
        const techMissing = requireChoice(data.isTechEnterprise, '是否具有有效高新技术企业资质');
        if (techMissing) return techMissing;
      }
      if ((data.isPersonalBusinessLoan && data.entityType !== 'farmer') || (data.isConstructionBusiness && !data.isTechEnterprise)) {
        const reasons = [
          data.isPersonalBusinessLoan && data.entityType !== 'farmer' ? '属于个人经营性贷款' : '',
          data.isConstructionBusiness && !data.isTechEnterprise ? '属于建筑施工类企业且无有效高新技术企业资质' : '',
        ].filter(Boolean).join('，');
        return buildFail(`${reasons}，`, data, key);
      }
      return buildPass(`非个人经营性贷款${data.entityType === 'farmer' ? '（农户除外）' : ''}，${data.isConstructionBusiness ? '虽属于建筑施工类，但具备有效高新技术企业资质，' : '非建筑施工类企业，'}资金投向与长易担支持方向一致，`);
    }
    case 's4': {
      const missing = requireChoice(data.isGovOrSoe, '是否为政府融资平台/国企');
      if (missing) return missing;
      return data.isGovOrSoe
        ? buildFail('借款人属于政府融资平台或国有企业，', data, key)
        : buildPass('借款人不属于政府融资平台或国有企业，');
    }
    case 's5': {
      const customerMissing = requireChoice(data.isZxdGuaranteeCustomer, '是否为中小担及关联担保主体在保客户');
      if (customerMissing) return customerMissing;
      const riskMissing = requireChoice(data.isZxdRiskCustomer, '是否为中小担及关联担保主体风险客户');
      if (riskMissing) return riskMissing;
      if (data.isZxdGuaranteeCustomer || data.isZxdRiskCustomer) {
        const reasons = [
          data.isZxdGuaranteeCustomer ? '属于中小担及关联担保主体融资担保在保客户' : '',
          data.isZxdRiskCustomer ? '属于中小担及关联担保主体风险客户' : '',
        ].filter(Boolean).join('，');
        return buildFail(`${reasons}，`, data, key);
      }
      return buildPass('放款时点非中小担及其关联担保主体融资担保在保客户，且非风险客户，');
    }
    case 's6': {
      const missingKeys: Array<[BooleanChoice, string]> = [
        [data.paidInCapitalZero, '实收资本是否为0'],
        [data.assetTotalZeroFlag, '资产总额是否为0'],
        [data.revenueZeroFlag, '营业收入是否为0'],
        [data.socialSecurityZero, '社保人数是否为0'],
      ];
      const missing = missingKeys.find(([value]) => value === null);
      if (missing) return buildMissing(`请确认${missing[1]}。`);
      const zeroFields = [
        data.paidInCapitalZero ? '实收资本' : '',
        data.assetTotalZeroFlag ? '资产总额' : '',
        data.revenueZeroFlag ? '营业收入' : '',
        data.socialSecurityZero ? '社保人数' : '',
      ].filter(Boolean);
      if (zeroFields.length > 0) {
        return buildFail(`${zeroFields.join('、')}存在为0的情形，`, data, key);
      }
      return buildPass('实收资本、资产总额、营业收入、社保人数均不为0，');
    }
    case 's7': {
      const missing = requireChoice(data.ownerChangedWithin6m, '主债权起始日前6个月内是否发生法定代表人/实控人/大股东变更');
      if (missing) return missing;
      return data.ownerChangedWithin6m
        ? buildFail('主债权起始日前6个月内发生法定代表人、实际控制人或大股东变更，', data, key)
        : buildPass('主债权起始日前6个月内未发生法定代表人、实际控制人或大股东变更，');
    }
    default:
      return buildMissing('未配置的特殊准入项。');
  }
}

function evaluateOver300Row(key: string, data: GeneratorFormData): EvaluationResult {
  const established = parseDateInput(data.establishmentDate);
  const establishedDisplay = formatChineseDate(data.establishmentDate);
  const years = established ? yearsBetween(established) : null;
  const taxAmount = parseAmount(data.taxAmount12m);
  const exposure = parseAmount(data.creditExposureTotal);
  const revenue = parseAmount(data.taxRevenue12m);
  const ratioInfo = resolveAssetLiabilityRatio(data);

  switch (key) {
    case 'o1':
      if (!established || !establishedDisplay) return buildMissing('请填写企业成立日期或成立年份。');
      if (years === null) return buildMissing('成立时间格式无法识别，请按YYYY-MM-DD、YYYY-MM或YYYY填写。');
      return years >= 2
        ? buildPass(`成立时间为${establishedDisplay}，截至申请时成立已满2年，符合8.1，`)
        : buildFail(`成立时间为${establishedDisplay}，截至申请时成立未满2年，不符合8.1，`, data, key);
    case 'o2': {
      const rating = normalizeRating(data.taxCreditLevel);
      if (!rating) return buildMissing('请填写上一年度纳税信用等级。');
      if (taxAmount === null) return buildMissing('请填写申请授信前12个月（或上年度）缴税总额。');
      const pass = !/^D级?$/i.test(rating) && taxAmount >= 5;
      const prefix = `上一年度纳税信用等级为${rating}，申请授信前12个月（或上年度）缴税总额为${formatAmount(taxAmount)}万元，`;
      return pass
        ? buildPass(`${prefix}符合“非D级且缴税总额5万元（含）以上”要求，`)
        : buildFail(`${prefix}不符合“非D级且缴税总额5万元（含）以上”要求，`, data, key);
    }
    case 'o3': {
      if (exposure === null) return buildMissing('请填写企业征信体现的授信敞口总额。');
      if (revenue === null || revenue <= 0) return buildMissing('请填写申请授信前12个月（或上年度）报税收入，且须大于0。');
      const ratio = (exposure / revenue) * 100;
      const standard = data.industryType === 'wholesale_retail' ? 20 : 40;
      const prefix = `营授比 = ${formatAmount(exposure)} ÷ ${formatAmount(revenue)} = ${formatPercent(ratio)}。企业所属行业为${INDUSTRY_LABELS[data.industryType]}行业，对应营授比控制标准为≤${standard}%。本次测算结果为${formatPercent(ratio)}。`;
      return ratio <= standard
        ? { answer: `${prefix}结论：符合要求。` }
        : { answer: `${prefix}结论：不符合要求，${buildBreakthroughSuffix(data, key)}` };
    }
    case 'o4': {
      if (ratioInfo.ratio === null) {
        return buildMissing('请填写最新一期报税报表资产总额、负债总额，或直接填写资产负债率。');
      }
      if (ratioInfo.fromFormula) {
        const prefix = `资产负债率 = ${formatAmount(ratioInfo.liability)} ÷ ${formatAmount(ratioInfo.asset)} = ${formatPercent(ratioInfo.ratio)}。控制标准为≤70%。`;
        return ratioInfo.ratio <= 70
          ? { answer: `${prefix}结论：符合要求。` }
          : { answer: `${prefix}结论：不符合要求，${buildBreakthroughSuffix(data, key)}` };
      }
      const prefix = `资产负债率为${formatPercent(ratioInfo.ratio)}。控制标准为≤70%。`;
      return ratioInfo.ratio <= 70
        ? { answer: `${prefix}结论：符合要求。` }
        : { answer: `${prefix}结论：不符合要求，${buildBreakthroughSuffix(data, key)}` };
    }
    default:
      return buildMissing('未配置的测算项。');
  }
}

function buildExposureLimitText(data: GeneratorFormData, key: string, options: {
  planLimit: number;
  changYiDanLimit?: number;
  batchLimit?: number;
  includeChangYiDan: boolean;
}): EvaluationResult {
  const apply = primaryApplyAmount(data);
  const existingPlan = parseAmount(data.existingMinjianPlanCreditAmount);
  const otherChangYiDan = parseAmount(data.otherBankChangYiDanAmount);
  const existingBatch = parseAmount(data.existingBatchGuaranteeCreditAmount);
  const responsibility = parseAmount(data.zxdBusinessResponsibilityBalance);
  const related = parseAmount(data.relatedPartyResponsibilityBalance);
  const netAsset = parseAmount(data.zxdNetAsset);

  if (apply === null) return buildMissing('请填写本次申请金额。');
  if (existingPlan === null) return buildMissing('请填写民间投资专项计划项下既有授信额度。');
  if (responsibility === null) return buildMissing('请填写在中小担各类业务融资担保责任余额。');
  if (related === null) return buildMissing('请填写借款人及其关联方在中小担各类业务融资担保责任余额。');
  if (netAsset === null || netAsset <= 0) return buildMissing('请填写中小担净资产（扣除对其他融资担保公司投资）。');

  const planTotal = apply + existingPlan;
  const planPass = planTotal <= options.planLimit;
  const responsibility10Limit = netAsset * 0.1;
  const related15Limit = netAsset * 0.15;
  const responsibilityPass = responsibility <= 5000 && responsibility <= responsibility10Limit;
  const relatedPass = related <= related15Limit;

  const sentences: string[] = [];

  if (options.includeChangYiDan) {
    if (otherChangYiDan === null) return buildMissing('请填写他行长易担已获批金额。');
    const changYiDanTotal = apply + otherChangYiDan;
    const changYiDanPass = options.changYiDanLimit !== undefined ? changYiDanTotal <= options.changYiDanLimit : true;
    sentences.push(`长易担业务项下所有合作银行最高授信额度合计 = 本次申请${formatAmount(apply)} + 他行长易担已获批${formatAmount(otherChangYiDan)} = ${formatAmount(changYiDanTotal)}万元，对照标准≤${options.changYiDanLimit}万元，${changYiDanPass ? '符合要求。' : `不符合要求，${buildBreakthroughSuffix(data, key)}`}`);
  }

  if (options.batchLimit !== undefined) {
    if (existingBatch === null) return buildMissing('请填写中小担所有批量担保业务既有最高授信额度合计。');
    const batchTotal = apply + existingBatch;
    const batchPass = batchTotal <= options.batchLimit;
    sentences.push(`中小担所有批量担保业务最高授信额度合计 = 本次申请${formatAmount(apply)} + 既有批量担保业务${formatAmount(existingBatch)} = ${formatAmount(batchTotal)}万元，对照标准≤${options.batchLimit}万元，${batchPass ? '符合要求。' : `不符合要求，${buildBreakthroughSuffix(data, key)}`}`);
  }

  sentences.push(`民间投资专项计划项下长融保+长易担合计授信额度 = 本次申请${formatAmount(apply)} + 既有民间投资专项计划授信${formatAmount(existingPlan)} = ${formatAmount(planTotal)}万元，对照标准≤${options.planLimit}万元，${planPass ? '符合要求。' : `不符合要求，${buildBreakthroughSuffix(data, key)}`}`);
  sentences.push(`借款人在中小担各类业务融资担保责任余额 = ${formatAmount(responsibility)}万元，对照标准≤5000万元且≤中小担净资产${formatAmount(netAsset)} × 10% = ${formatAmount(responsibility10Limit)}万元，${responsibilityPass ? '符合要求。' : `不符合要求，${buildBreakthroughSuffix(data, key)}`}`);
  sentences.push(`借款人及其关联方在中小担各类业务融资担保责任余额 = ${formatAmount(related)}万元，对照标准≤中小担净资产${formatAmount(netAsset)} × 15% = ${formatAmount(related15Limit)}万元，${relatedPass ? '符合要求。' : `不符合要求，${buildBreakthroughSuffix(data, key)}`}`);

  return { answer: sentences.join(' ') };
}

function evaluateSchemeRow(key: string, product: ProductType, data: GeneratorFormData): EvaluationResult {
  const termMonths = parseTermMonths(data.creditTerm);
  const termText = data.creditTerm.trim();
  const fundPurpose = data.fundPurpose.trim();

  switch (key) {
    case 'r1':
      return buildExposureLimitText(data, key, { planLimit: 2000, includeChangYiDan: false });
    case 'r2':
    case 'e4':
      if (!termText) return buildMissing('请填写授信期限。');
      if (termMonths === null) return buildMissing('授信期限格式无法识别，请按“36个月”或“3年”填写。');
      if (key === 'e4' && data.hasMultipleDrawdowns === true && data.hasFiledEachDrawdown !== true) {
        return buildFail('授信方案存在多笔提款，但未确认按提款笔数逐笔向中小担备案，', data, key);
      }
      if (key === 'e4' && data.hasMultipleDrawdowns === null) {
        return buildMissing('请确认长易担项下是否存在多笔提款。');
      }
      if (key === 'e4' && data.hasMultipleDrawdowns === true && data.hasFiledEachDrawdown === null) {
        return buildMissing('请确认多笔提款是否已逐笔备案。');
      }
      return termMonths > 12
        ? buildPass(`授信方案拟定单笔贷款期限为${termText}，且不采用随借随还循环贷模式${key === 'e4' ? `，${data.hasMultipleDrawdowns ? '多笔提款已确认逐笔备案' : '按单笔备案模式执行'}` : ''}，`)
        : buildFail(`授信方案拟定单笔贷款期限为${termText}，未满足一年期以上（不含一年期）要求，`, data, key);
    case 'r3':
      return buildPass('授信方案已明确中小担提供80%本金连带责任保证担保，保证期间为单笔贷款合同签订之日起至债务履行期限届满（含提前到期）后三年，');
    case 'r4':
    case 'e6':
      return fundPurpose
        ? buildPass(`本次贷款用途为“${fundPurpose}”，已按模板口径落入授信方案及合同融资用途表述，`)
        : buildMissing('请填写资金用途，并使用模板允许的融资用途口径。');
    case 'r5':
      return buildPass('授信方案已明确放款前取得中小担《担保意向函》，并在信贷系统建立中小担最高额保证合同，');
    case 'r6':
    case 'e8':
      return buildPass('授信方案已明确放款前提供厦门市中小企业融资担保有限公司《放款通知书》，');
    case 'e1':
      return buildExposureLimitText(data, key, { planLimit: 2000, changYiDanLimit: 1000, includeChangYiDan: true });
    case 'e2':
      return buildExposureLimitText(data, key, { planLimit: 2000, changYiDanLimit: 1000, batchLimit: 2000, includeChangYiDan: true });
    case 'e3':
      return buildExposureLimitText(data, key, { planLimit: 2000, includeChangYiDan: false });
    case 'e5': {
      const parts = ['授信方案已明确中小担提供80%本金连带责任保证担保，保证期间为单笔贷款合同签订之日起至债务履行期限届满（含提前到期）后三年'];
      if (data.hasThirdPartyGuarantee) parts.push('并需同步落实第三方向中小担提供反担保');
      if (data.hasMortgage) parts.push('并需同步向中小担办理二押，确无法办理时需经中小担审核通过');
      return buildPass(`${parts.join('，')}，`);
    }
    case 'e7':
      return buildPass('授信方案已明确在信贷系统建立中小担最高额保证合同，以实现担保额度占用，');
    default:
      return product === 'chang_yi_dan'
        ? buildMissing('未配置的长易担授信方案条款。')
        : buildMissing('未配置的长融保授信方案条款。');
  }
}

function evaluateCommonRow(key: string, data: GeneratorFormData): EvaluationResult {
  switch (key) {
    case 'c1':
      return buildPass('合同限制性条款已在授信方案中按模板落实，');
    case 'c2': {
      const actualController = data.actualController.trim() || 'XXX';
      return buildPass(`额度建档及重新备案资料已按模板列示，涉及借款人法定代表人、实际控制人${actualController}的公开查询要求已在授信方案中落实，`);
    }
    case 'c3':
      return buildPass(`调查报告及其他条件已明确结论为纳入“长融保”“长易担”产品补偿范围，`);
    default:
      return buildMissing('未配置的共同条款。');
  }
}

function buildRowOutputs(rows: ChecklistRow[], product: ProductType, data: GeneratorFormData): RowOutput[] {
  return rows.map((row) => {
    let computed: EvaluationResult;
    if (row.section === 'access') computed = evaluateAccessRow(row.key, product, data);
    else if (row.section === 'special') computed = evaluateSpecialRow(row.key, data);
    else if (row.section === 'over300') computed = evaluateOver300Row(row.key, data);
    else if (row.section === 'scheme_crb' || row.section === 'scheme_cyd') computed = evaluateSchemeRow(row.key, product, data);
    else if (row.section === 'common') computed = evaluateCommonRow(row.key, data);
    else computed = { answer: '' };

    return {
      key: row.key,
      label: row.label.replace('XXX', data.actualController.trim() || 'XXX'),
      answer: overrideOr(computed.answer, data, row.key),
    };
  });
}

function planLineParagraphs(product: ProductType, data: GeneratorFormData): CreditPlanParagraph[] {
  const productName = PRODUCT_LABELS[product];
  const creditAmount = primaryCreditAmountText(data);
  const creditTerm = data.creditTerm.trim() || '__';
  const rateExpression = data.rateExpression.trim() || '不低于五年期LPR-50b.p.';
  const fundPurpose = data.fundPurpose.trim() || '经营周转';
  const payMethod = PAY_METHOD_LABELS[data.payMethod];
  const legalRep = data.legalRep.trim() || 'XX';
  const actualController = data.actualController.trim() || 'XX';
  const spouse = data.spouseName.trim();
  const extraGuarantee = data.extraGuarantee.trim();
  const thirdPartyTail = data.hasThirdPartyGuarantee
    ? `，由法定代表人${legalRep}${spouse ? `及其配偶${spouse}` : ''}提供连带责任保证`
    : '';
  const extraGuaranteeTail = extraGuarantee ? `，${extraGuarantee}` : '';
  const repayText =
    data.repayMethod === 'monthly'
      ? `采用按月付息，按月归还贷款本金${data.monthlyRepayAmount.trim() || '__'}万元，到期结清贷款本息。`
      : data.repayMethod === 'bullet'
        ? '采用按月付息，到期一次性还本。'
        : `采用按月付息，每季度归还贷款本金${data.quarterlyRepayAmount.trim() || '__'}万元，到期结清贷款本息。`;
  const paragraph6 =
    product === 'chang_yi_dan'
      ? '办理好厦门市中小企业融资担保有限公司的担保手续，额度项下单笔提款需逐笔向厦门市中小企业融资担保有限公司备案。'
      : '办理好厦门市中小企业融资担保有限公司的担保手续，取得《担保意向函》，并在信贷系统建立中小担最高额保证合同，以实现担保额度占用。';

  return [
    { segments: [{ text: '授信申请人：', bold: true }, { text: data.enterpriseName.trim() || 'XX', bold: true }] },
    { segments: [{ text: `授信方案（${productName}）`, bold: true }, { text: `：流动资金贷款不可循环额度人民币${creditAmount}万元整，期限${creditTerm}。额度项下单笔期限不低于12个月且不超过36个月，单笔期限可超额度有效期后3个月。贷款支用利率按${rateExpression}执行，利率按年调整。${repayText}` }] },
    { segments: [{ text: '担保方式', bold: true }, { text: `：由厦门市中小企业融资担保有限公司提供连带责任保证（代偿未清偿贷款本金余额的80%）${thirdPartyTail}${extraGuaranteeTail}。` }] },
    { segments: [{ text: '资金用途：', bold: true }, { text: `用于申请人${fundPurpose}。`, bold: true }] },
    { segments: [{ text: '贷款支用条件：', bold: true }] },
    { segments: [{ text: paragraph6, bold: true }] },
    { segments: [{ text: `额度项下单笔提款采用${payMethod}方式，额度项下提用时需同步提供对应的购销合同，要求单笔提用金额不超过购销合同的80%。`, bold: true }] },
    { segments: [{ text: '放款前提供厦门市中小企业融资担保有限公司的《放款通知书》。', bold: true }] },
    { segments: [{ text: `本笔纳入“${productName}”产品补偿范围。`, bold: true }] },
    { segments: [{ text: '查询厦门市商事主体登记及信用信息公示平台，借款人未被列入经营异常名录。查询中国执行信息公开网（被执行人信息和失信被执行人查询模块）及“国家企业信用信息公示系统”及“信用中国”、税务网站等，能显示借款人及其法定代表人、实际控制人', bold: true }, { text: actualController }, { text: '当前无被执行借贷合同案件或刑事案件或失信被执行信息、未涉及洗钱、恐怖融资、扩散融资、逃税骗税、制裁等风险，未违法从事民间借贷、非法集资、涉黑涉恶及其他非法金融活动、近三年未发生重大安全（含网络安全、数据安全）、质量、环境污染等事故，无偷漏税等违法违规行为记录。', bold: true }] },
    { segments: [{ text: '合同限制性条款：', bold: true }] },
    { segments: [{ text: '借款人已充分了解民间投资专项担保计划相关政策，认可厦门市中小企业融资担保有限公司的增信作用，自愿按约定缴纳担保费；无论本行是否获得厦门市中小企业融资担保有限公司代偿，均不影响本行对借款人、担保人的全额追偿权利，借款人、担保人不得以本行获得代偿为由主张减免债务；借款人未按约定使用资金、未按时偿还贷款的，本行有权宣布贷款提前到期，并要求厦门市中小企业融资担保有限公司履行担保责任，同时借款人按约定承担相应违约责任。涉及反担保的，本行协助中小担与反担保人签订反担保合同，落实反担保相关手续。', bold: true }] },
    { segments: [{ text: '签订仲裁协议，约定产生的纠纷交由厦门仲裁委员会进行仲裁。信贷资金不得挪用于购房，若发现贷款资金挪用于房地产领域，授信人有权解除合同，提前收回贷款，并追究相应法律责任。', bold: true }] },
    { segments: [{ text: '贷后管理', bold: true }, { text: '：按《厦门银行厦门业务管理总部民间投资专项担保计划”长融保“、”长易担“业务管理办法》的贷后要求执行。' }] },
  ];
}

function paragraphsToText(paragraphs: CreditPlanParagraph[]): string {
  return paragraphs
    .map((paragraph) => paragraph.segments.map((segment) => segment.text).join(''))
    .join('\n');
}

function buildChecklistText(
  product: ProductType,
  data: GeneratorFormData,
  accessRows: RowOutput[],
  specialRows: RowOutput[],
  over300Rows: RowOutput[],
  schemeRows: RowOutput[],
  commonRows: RowOutput[],
  approvalRows: RowOutput[],
): string {
  const lines: string[] = [
    '长易担长融保业务检核表',
    '',
    '本表使用范围：授信新增、续授信时均需填列此表进行检视，提供的材料均要求上两年度及近期的报税财报、上年度社保缴纳证明。',
    '',
    `授信申请人：${data.enterpriseName.trim() || '________'}`,
    `法定代表人：${data.legalRep.trim() || '________'}    实际控制人：${data.actualController.trim() || '________'}    配偶姓名：${data.spouseName.trim() || '________'}`,
    '',
    '（一）业务项目准入条件检视',
  ];

  accessRows.forEach((row) => {
    lines.push(`  ${row.label}`);
    lines.push(`  检视情况：${row.answer}`);
    lines.push('');
  });

  if (product === 'chang_yi_dan') {
    lines.push('（二）长易担业务的特殊准入要求（长融保业务无需检视）');
    specialRows.forEach((row) => {
      lines.push(`  ${row.label}`);
      lines.push(`  检视情况：${row.answer}`);
      lines.push('');
    });
    if (over300Rows.length > 0) {
      lines.push('8、单户授信额度高于300万元且非按揭类项目的需满足以下要求：');
      over300Rows.forEach((row) => {
        lines.push(`  ${row.label}`);
        lines.push(`  检视情况：${row.answer}`);
        lines.push('');
      });
    }
  }

  lines.push('授信方案');
  lines.push(product === 'chang_rong_bao' ? '1、长融保业务：' : '2、长易担业务：');
  schemeRows.forEach((row) => {
    lines.push(`  ${row.label}`);
    lines.push(`  检视情况：${row.answer}`);
    lines.push('');
  });

  lines.push('长融保与长易担共同遵循条款：');
  commonRows.forEach((row) => {
    lines.push(`  ${row.label}`);
    lines.push(`  检视情况：${row.answer}`);
    lines.push('');
  });

  lines.push('四、报审路径：与增信基金额度合控管理。以下场景可通过小企业条线申报：');
  approvalRows.forEach((row) => {
    lines.push(`  ${row.label}`);
  });

  return lines.join('\n');
}

export function buildChecklistArtifacts(product: ProductType, data: GeneratorFormData): ChecklistArtifacts {
  const needsOver300Review = product === 'chang_yi_dan' && (primaryApplyAmount(data) ?? 0) > 300 && data.isMortgageProject === false;
  const accessRows = buildRowOutputs(CHECKLIST_TEMPLATE_ROWS.filter((row) => row.section === 'access'), product, data);
  const specialRows = product === 'chang_yi_dan'
    ? buildRowOutputs(CHECKLIST_TEMPLATE_ROWS.filter((row) => row.section === 'special'), product, data)
    : [];
  const over300Rows = needsOver300Review
    ? buildRowOutputs(CHECKLIST_TEMPLATE_ROWS.filter((row) => row.section === 'over300'), product, data)
    : [];
  const schemeRows = buildRowOutputs(
    CHECKLIST_TEMPLATE_ROWS.filter((row) => row.section === (product === 'chang_rong_bao' ? 'scheme_crb' : 'scheme_cyd')),
    product,
    data,
  );
  const commonRows = buildRowOutputs(CHECKLIST_TEMPLATE_ROWS.filter((row) => row.section === 'common'), product, data);
  const approvalRows = buildRowOutputs(CHECKLIST_TEMPLATE_ROWS.filter((row) => row.section === 'approval'), product, data);
  const creditPlanParagraphs = planLineParagraphs(product, data);
  const creditPlanText = paragraphsToText(creditPlanParagraphs);

  return {
    productName: PRODUCT_LABELS[product],
    needsOver300Review,
    accessRows,
    specialRows,
    over300Rows,
    schemeRows,
    commonRows,
    approvalRows,
    checklistText: buildChecklistText(product, data, accessRows, specialRows, over300Rows, schemeRows, commonRows, approvalRows),
    creditPlanText,
    creditPlanParagraphs,
  };
}

export function sanitizeDataForProduct(product: ProductType, data: GeneratorFormData): GeneratorFormData {
  const next: GeneratorFormData = {
    ...data,
    breakthroughReasons: { ...data.breakthroughReasons },
    answerOverrides: { ...data.answerOverrides },
  };

  PRODUCT_SPECIFIC_KEYS[product].forEach((key) => {
    next[key] = DEFAULT_FORM_DATA[key] as never;
  });

  const irrelevantKeys = product === 'chang_rong_bao'
    ? ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 'o1', 'o2', 'o3', 'o4', 'e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'e8']
    : ['r1', 'r2', 'r3', 'r4', 'r5', 'r6'];

  irrelevantKeys.forEach((key) => {
    delete next.breakthroughReasons[key];
    delete next.answerOverrides[key];
  });

  return next;
}

export function validateGeneratorData(product: ProductType, data: GeneratorFormData): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const currentApply = primaryApplyAmount(data);
  const needsOver300Review = product === 'chang_yi_dan' && (currentApply ?? 0) > 300 && data.isMortgageProject === false;

  const requiredAlways: Array<{ key: keyof GeneratorFormData; label: string }> = [
    { key: 'enterpriseName', label: '授信申请人名称' },
    { key: 'legalRep', label: '法定代表人' },
    { key: 'actualController', label: '实际控制人' },
    { key: 'fusionBaseRating', label: '融合基础评级' },
    { key: 'creditTerm', label: '授信期限' },
    { key: 'fundPurpose', label: '资金用途' },
    { key: 'existingMinjianPlanCreditAmount', label: '民间投资专项计划既有授信额度' },
    { key: 'zxdBusinessResponsibilityBalance', label: '借款人在中小担业务融资担保责任余额' },
    { key: 'relatedPartyResponsibilityBalance', label: '关联方在中小担融资担保责任余额' },
    { key: 'zxdNetAsset', label: '中小担净资产' },
  ];

  requiredAlways.forEach(({ key, label }) => {
    if (!String(data[key] ?? '').trim()) issues.push({ field: key, message: `${label}未填写。` });
  });

  if (currentApply === null) {
    issues.push({ field: 'currentApplyAmount', message: '本次申请金额或授信方案金额至少需填写一个。' });
  }

  if (product === 'chang_yi_dan') {
    [
      ['otherBankChangYiDanAmount', '他行长易担已获批金额'],
      ['existingBatchGuaranteeCreditAmount', '中小担所有批量担保业务既有额度'],
    ].forEach(([field, label]) => {
      if (!String(data[field as keyof GeneratorFormData] ?? '').trim()) {
        issues.push({ field, message: `${label}未填写。` });
      }
    });

    if (data.hasMultipleDrawdowns === null) {
      issues.push({ field: 'hasMultipleDrawdowns', message: '请确认长易担项下是否存在多笔提款。' });
    }
    if (data.hasMultipleDrawdowns === true && data.hasFiledEachDrawdown === null) {
      issues.push({ field: 'hasFiledEachDrawdown', message: '存在多笔提款时，请确认是否已逐笔备案。' });
    }
  }

  if (needsOver300Review) {
    [
      ['establishmentDate', '企业成立日期/年份'],
      ['taxCreditLevel', '上一年度纳税信用等级'],
      ['taxAmount12m', '申请授信前12个月缴税总额'],
      ['creditExposureTotal', '授信敞口总额'],
      ['taxRevenue12m', '报税收入'],
    ].forEach(([field, label]) => {
      if (!String(data[field as keyof GeneratorFormData] ?? '').trim()) {
        issues.push({ field, message: `${label}未填写，无法完成8.1-8.4检验。` });
      }
    });

    const hasAssetLiabilityFormula = data.latestAssetTotal.trim() && data.latestLiabilityTotal.trim();
    if (!hasAssetLiabilityFormula && !data.latestAssetLiabilityRatio.trim()) {
      issues.push({ field: 'latestAssetTotal', message: '最新一期资产总额/负债总额或资产负债率至少需填写一组，无法完成8.4检验。' });
    }
  }

  [
    ['currentApplyAmount', '本次申请金额'],
    ['creditAmount', '授信方案金额'],
    ['taxAmount12m', '申请授信前12个月缴税总额'],
    ['creditExposureTotal', '授信敞口总额'],
    ['taxRevenue12m', '报税收入'],
    ['latestAssetTotal', '最新一期资产总额'],
    ['latestLiabilityTotal', '最新一期负债总额'],
    ['latestAssetLiabilityRatio', '最新一期资产负债率'],
    ['existingMinjianPlanCreditAmount', '民间投资专项计划既有授信额度'],
    ['otherBankChangYiDanAmount', '他行长易担已获批金额'],
    ['existingBatchGuaranteeCreditAmount', '中小担所有批量担保业务既有额度'],
    ['zxdBusinessResponsibilityBalance', '借款人在中小担业务融资担保责任余额'],
    ['relatedPartyResponsibilityBalance', '关联方在中小担融资担保责任余额'],
    ['zxdNetAsset', '中小担净资产'],
    ['quarterlyRepayAmount', '每季度归还本金'],
    ['monthlyRepayAmount', '每月归还本金'],
  ].forEach(([field, label]) => {
    const value = String(data[field as keyof GeneratorFormData] ?? '');
    if (isInvalidNumericInput(value)) issues.push({ field, message: `${label}格式错误，请填写数字。` });
    const parsed = parseAmount(value);
    if (parsed !== null && parsed < 0) issues.push({ field, message: `${label}不能为负数。` });
    if (/元/.test(value) && !/万/.test(value)) issues.push({ field, message: `${label}口径必须为“万元”，不能按“元”填写。` });
  });

  const changYiDanOnlyBooleanKeys = new Set<keyof GeneratorFormData>(CHANG_YI_DAN_ONLY_BOOLEAN_KEYS);
  BOOLEAN_FIELD_COPY.forEach(({ key, label }) => {
    if (product === 'chang_rong_bao' && changYiDanOnlyBooleanKeys.has(key)) return;
    if (data[key] === null) {
      issues.push({ field: key, message: `${label}尚未确认。` });
    }
  });

  const artifacts = buildChecklistArtifacts(product, data);
  const breakthroughRows = [...artifacts.accessRows, ...artifacts.specialRows, ...artifacts.over300Rows, ...artifacts.schemeRows]
    .filter((row) => row.answer.includes('需突破'));
  breakthroughRows.forEach((row) => {
    if (!data.breakthroughReasons[row.key]?.trim()) {
      issues.push({ field: row.key, message: `“${row.label}”已触发需突破，但突破理由未填写。` });
    }
  });

  return issues;
}

function makeCell(text: string, options?: { bold?: boolean; columnSpan?: number; width?: number; center?: boolean; shading?: string }) {
  const lines = text.split('\n');
  return new TableCell({
    columnSpan: options?.columnSpan,
    width: options?.width ? { size: options.width, type: WidthType.DXA } : undefined,
    shading: options?.shading ? { type: ShadingType.CLEAR, color: options.shading, fill: options.shading } : undefined,
    margins: { top: 80, bottom: 80, left: 100, right: 100 },
    children: lines.map((line) => new Paragraph({
      alignment: options?.center ? AlignmentType.CENTER : AlignmentType.LEFT,
      spacing: { after: 40, before: 20, line: 320 },
      children: [
        new TextRun({
          text: line,
          bold: options?.bold,
          size: 21,
          font: '宋体',
        }),
      ],
    })),
  });
}

function makeFullRow(text: string, shading?: string) {
  return new TableRow({
    cantSplit: true,
    children: [makeCell(text, { bold: true, columnSpan: 3, width: 9888, shading })],
  });
}

function makeSectionHeaderRow(left: string) {
  return new TableRow({
    cantSplit: true,
    children: [
      makeCell(left, { bold: true, width: GRID_WIDTHS[0], shading: 'E8E8E8' }),
      makeCell('检视情况', { bold: true, columnSpan: 2, width: GRID_WIDTHS[1] + GRID_WIDTHS[2], center: true, shading: 'E8E8E8' }),
    ],
  });
}

function makeAnswerRow(label: string, answer: string) {
  return new TableRow({
    cantSplit: true,
    children: [
      makeCell(label, { width: GRID_WIDTHS[0] }),
      makeCell(answer, { width: GRID_WIDTHS[1] + GRID_WIDTHS[2], columnSpan: 2 }),
    ],
  });
}

function makeApprovalRow(label: string) {
  return new TableRow({
    cantSplit: true,
    children: [
      makeCell(label, { width: GRID_WIDTHS[0] + GRID_WIDTHS[1], columnSpan: 2 }),
      makeCell('', { width: GRID_WIDTHS[2] }),
    ],
  });
}

export async function buildChecklistWordDoc(product: ProductType, data: GeneratorFormData): Promise<Blob> {
  const artifacts = buildChecklistArtifacts(product, data);
  const rows: TableRow[] = [
    new TableRow({
      cantSplit: true,
      children: [
        makeCell('本表使用范围：授信新增、续授信时均需填列此表进行检视，提供的材料均要求上两年度及近期的报税财报、上年度社保缴纳证明。', { width: GRID_WIDTHS[0] }),
        makeCell('', { width: GRID_WIDTHS[1] + GRID_WIDTHS[2], columnSpan: 2 }),
      ],
    }),
    makeSectionHeaderRow('（一）业务项目准入条件检视'),
  ];

  artifacts.accessRows.forEach((row) => rows.push(makeAnswerRow(row.label, row.answer)));

  if (product === 'chang_yi_dan') {
    rows.push(makeFullRow('（二）长易担业务的特殊准入要求（长融保业务无需检视）'));
    artifacts.specialRows.forEach((row) => rows.push(makeAnswerRow(row.label, row.answer)));
    if (artifacts.over300Rows.length > 0) {
      rows.push(makeFullRow('8、单户授信额度高于300万元且非按揭类项目的需满足以下要求：'));
      artifacts.over300Rows.forEach((row) => rows.push(makeAnswerRow(row.label, row.answer)));
    }
  }

  rows.push(makeFullRow('授信方案'));
  rows.push(makeFullRow(product === 'chang_rong_bao' ? '1、长融保业务：' : '2、长易担业务：'));
  artifacts.schemeRows.forEach((row) => rows.push(makeAnswerRow(row.label, row.answer)));
  rows.push(makeFullRow('长融保与长易担共同遵循条款：'));
  artifacts.commonRows.forEach((row) => rows.push(makeAnswerRow(row.label, row.answer)));
  rows.push(makeFullRow('四、报审路径：与增信基金额度合控管理。以下场景可通过小企业条线申报：'));
  artifacts.approvalRows.forEach((row) => rows.push(makeApprovalRow(row.label)));

  const doc = new Document({
    sections: [{
      properties: {
        page: { margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 } },
      },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 },
          children: [new TextRun({ text: '长易担长融保业务检核表', bold: true, size: 30, font: '宋体' })],
        }),
        new Table({
          width: { size: 9888, type: WidthType.DXA },
          rows,
          borders: TABLE_BORDERS,
          layout: TableLayoutType.FIXED,
          columnWidths: GRID_WIDTHS,
        }),
      ],
    }],
  });

  return Packer.toBlob(doc);
}

export async function buildCreditPlanWordDoc(product: ProductType, data: GeneratorFormData): Promise<Blob> {
  const artifacts = buildChecklistArtifacts(product, data);
  const children = artifacts.creditPlanParagraphs.map((paragraph, index) => new Paragraph({
    spacing: { after: index === 4 || index === 10 ? 80 : 60, before: 0, line: 320 },
    children: paragraph.segments.map((segment) => new TextRun({
      text: segment.text,
      bold: segment.bold,
      size: 21,
      font: '宋体',
    })),
  }));

  const doc = new Document({
    sections: [{
      properties: {
        page: { margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 } },
      },
      children,
    }],
  });

  return Packer.toBlob(doc);
}

export const PRODUCT_OPTIONS: Array<{ value: ProductType; label: string }> = [
  { value: 'chang_yi_dan', label: '长易担' },
  { value: 'chang_rong_bao', label: '长融保' },
];

export const ENTITY_OPTIONS: Array<{ value: EntityType; label: string }> = [
  { value: 'enterprise', label: '企业' },
  { value: 'individual_business', label: '个体工商户' },
  { value: 'micro_owner', label: '小微企业主' },
  { value: 'farmer', label: '农户' },
];

export const INDUSTRY_OPTIONS: Array<{ value: IndustryType; label: string }> = [
  { value: 'wholesale_retail', label: '批发零售' },
  { value: 'other', label: '其他行业' },
];

export const PAY_METHOD_OPTIONS: Array<{ value: PayMethod; label: string }> = [
  { value: 'entrusted', label: '受托支付' },
  { value: 'autonomous', label: '自主支付' },
];

export const REPAY_METHOD_OPTIONS: Array<{ value: RepayMethod; label: string }> = [
  { value: 'quarterly', label: '按季还本' },
  { value: 'monthly', label: '按月还本' },
  { value: 'bullet', label: '到期一次性还本' },
];

export const BOOLEAN_FIELD_COPY: Array<{ key: keyof GeneratorFormData; label: string }> = [
  { key: 'registeredInXiamen', label: '注册地是否厦门' },
  { key: 'isGovOrSoe', label: '是否为政府融资平台/国企' },
  { key: 'isConstructionBusiness', label: '是否建筑施工类' },
  { key: 'isPersonalBusinessLoan', label: '是否个人经营性贷款' },
  { key: 'isFirstTimeChangYiDan', label: '是否首次纳入长易担' },
  { key: 'hasCurrentOverdueLoan', label: '当前是否存在逾期贷款' },
  { key: 'hasRiskReliefBusiness', label: '是否存在展期/借新还旧/无还本续贷/风险缓释类业务' },
  { key: 'isZxdGuaranteeCustomer', label: '是否为中小担及关联担保主体在保客户' },
  { key: 'isZxdRiskCustomer', label: '是否为中小担及关联担保主体风险客户' },
  { key: 'paidInCapitalZero', label: '实收资本是否为0' },
  { key: 'assetTotalZeroFlag', label: '资产总额是否为0' },
  { key: 'revenueZeroFlag', label: '营业收入是否为0' },
  { key: 'socialSecurityZero', label: '社保人数是否为0' },
  { key: 'ownerChangedWithin6m', label: '主债权起始日前6个月内是否发生法定代表人/实控人/大股东变更' },
  { key: 'bankBadOrWarning', label: '借款人及关联人在本行是否不良或重大预警' },
  { key: 'operationIsReal', label: '实际经营是否真实' },
  { key: 'fundUseCompliant', label: '资金用途是否合理合规' },
  { key: 'businessAbnormalListed', label: '是否列入经营异常' },
  { key: 'majorDishonestyOrExecutor', label: '是否存在重大失信/被执行' },
  { key: 'lendingDispute', label: '是否存在借贷类案件纠纷' },
  { key: 'unfulfilledEnforcement', label: '是否存在强制执行未履行完毕' },
  { key: 'majorAdministrativePenalty', label: '是否存在重大行政处罚' },
  { key: 'amlOrSanctionRisk', label: '是否涉及洗钱/恐怖融资/扩散融资/逃税骗税/制裁等风险' },
  { key: 'illegalFinancialActivity', label: '是否涉及民间借贷/非法集资/涉黑涉恶等非法金融活动' },
  { key: 'majorIncident3y', label: '近三年是否发生重大安全/质量/环保事故' },
  { key: 'taxIllegalRecord', label: '是否存在偷漏税等违法违规记录' },
  { key: 'forbiddenRestrictedBusiness', label: '产品或服务是否属于国家禁止/限制/淘汰类' },
  { key: 'isTechEnterprise', label: '是否具有有效高新技术企业资质' },
  { key: 'isMortgageProject', label: '是否按揭类项目' },
];

export const CHANG_YI_DAN_ONLY_BOOLEAN_KEYS: Array<keyof GeneratorFormData> = [
  'isGovOrSoe',
  'isConstructionBusiness',
  'isPersonalBusinessLoan',
  'isFirstTimeChangYiDan',
  'hasCurrentOverdueLoan',
  'hasRiskReliefBusiness',
  'isZxdGuaranteeCustomer',
  'isZxdRiskCustomer',
  'paidInCapitalZero',
  'assetTotalZeroFlag',
  'revenueZeroFlag',
  'socialSecurityZero',
  'ownerChangedWithin6m',
  'operationIsReal',
  'fundUseCompliant',
  'isTechEnterprise',
  'isMortgageProject',
];

export const OPTIONAL_BOOLEAN_FIELD_COPY: Array<{ key: keyof GeneratorFormData; label: string }> = [
  { key: 'hasThirdPartyGuarantee', label: '是否存在第三方保证/共同借款安排' },
  { key: 'hasMortgage', label: '是否存在不动产抵押需核实二押安排' },
  { key: 'hasMultipleDrawdowns', label: '长易担项下是否存在多笔提款' },
  { key: 'hasFiledEachDrawdown', label: '多笔提款是否已逐笔备案' },
];

export const INPUT_FIELD_DEFINITIONS: InputFieldDefinition[] = [
  { key: 'enterpriseName', label: '授信申请人名称', group: 'A基础信息', required: '必填', owner: '用户', consequence: '不能生成', participatesInFormula: false },
  { key: 'legalRep', label: '法定代表人', group: 'A基础信息', required: '必填', owner: '用户', consequence: '不能生成', participatesInFormula: false },
  { key: 'actualController', label: '实际控制人', group: 'A基础信息', required: '必填', owner: '用户', consequence: '不能生成', participatesInFormula: false },
  { key: 'spouseName', label: '配偶姓名', group: 'A基础信息', required: '选填', owner: '用户', consequence: '可暂缺', participatesInFormula: false },
  { key: 'entityType', label: '企业类型', group: 'A基础信息', required: '必填', owner: '用户', consequence: '不能判断', participatesInFormula: false },
  { key: 'registeredInXiamen', label: '注册地是否厦门', group: 'A基础信息', required: '必填', owner: '用户', consequence: '不能判断', participatesInFormula: false },
  { key: 'industryType', label: '行业类型', group: 'A基础信息', required: '必填', owner: '用户', consequence: '不能判断', participatesInFormula: true },
  { key: 'fusionBaseRating', label: '融合基础评级', group: 'A基础信息', required: '必填', owner: '用户', consequence: '不能判断', participatesInFormula: false },
  { key: 'isGovOrSoe', label: '是否为政府融资平台/国企', group: 'A基础信息', required: '必填', owner: '用户', consequence: '不能判断', participatesInFormula: false },
  { key: 'isConstructionBusiness', label: '是否建筑施工类', group: 'A基础信息', required: '必填', owner: '用户', consequence: '不能判断', participatesInFormula: false },
  { key: 'isPersonalBusinessLoan', label: '是否个人经营性贷款', group: 'A基础信息', required: '必填', owner: '用户', consequence: '不能判断', participatesInFormula: false },
  { key: 'isFirstTimeChangYiDan', label: '是否首次纳入长易担', group: 'A基础信息', required: '必填', owner: '用户', consequence: '不能判断', participatesInFormula: false },
  { key: 'hasCurrentOverdueLoan', label: '当前是否存在逾期贷款', group: 'A基础信息', required: '必填', owner: '用户', consequence: '不能判断', participatesInFormula: false },
  { key: 'hasRiskReliefBusiness', label: '是否存在展期/借新还旧/无还本续贷/风险缓释类业务', group: 'A基础信息', required: '必填', owner: '用户', consequence: '不能判断', participatesInFormula: false },
  { key: 'isZxdGuaranteeCustomer', label: '是否为中小担及关联担保主体在保客户', group: 'A基础信息', required: '必填', owner: '用户', consequence: '不能判断', participatesInFormula: false },
  { key: 'isZxdRiskCustomer', label: '是否为中小担及关联担保主体风险客户', group: 'A基础信息', required: '必填', owner: '用户', consequence: '不能判断', participatesInFormula: false },
  { key: 'paidInCapitalZero', label: '实收资本是否为0', group: 'A基础信息', required: '必填', owner: '用户', consequence: '不能判断', participatesInFormula: false },
  { key: 'assetTotalZeroFlag', label: '资产总额是否为0', group: 'A基础信息', required: '必填', owner: '用户', consequence: '不能判断', participatesInFormula: false },
  { key: 'revenueZeroFlag', label: '营业收入是否为0', group: 'A基础信息', required: '必填', owner: '用户', consequence: '不能判断', participatesInFormula: false },
  { key: 'socialSecurityZero', label: '社保人数是否为0', group: 'A基础信息', required: '必填', owner: '用户', consequence: '不能判断', participatesInFormula: false },
  { key: 'ownerChangedWithin6m', label: '主债权起始日前6个月内是否发生法定代表人/实控人/大股东变更', group: 'A基础信息', required: '必填', owner: '用户', consequence: '不能判断', participatesInFormula: false },
  { key: 'bankBadOrWarning', label: '借款人及关联人在本行是否不良或重大预警', group: 'A基础信息', required: '必填', owner: '用户', consequence: '不能判断', participatesInFormula: false },
  { key: 'operationIsReal', label: '实际经营是否真实', group: 'A基础信息', required: '必填', owner: '用户', consequence: '不能判断', participatesInFormula: false },
  { key: 'fundUseCompliant', label: '资金用途是否合理合规', group: 'A基础信息', required: '必填', owner: '用户', consequence: '不能判断', participatesInFormula: false },
  { key: 'businessAbnormalListed', label: '是否列入经营异常', group: 'A基础信息', required: '必填', owner: '用户', consequence: '不能判断', participatesInFormula: false },
  { key: 'majorDishonestyOrExecutor', label: '是否存在重大失信/被执行', group: 'A基础信息', required: '必填', owner: '用户', consequence: '不能判断', participatesInFormula: false },
  { key: 'lendingDispute', label: '是否存在借贷类案件纠纷', group: 'A基础信息', required: '必填', owner: '用户', consequence: '不能判断', participatesInFormula: false },
  { key: 'unfulfilledEnforcement', label: '是否存在强制执行未履行完毕', group: 'A基础信息', required: '必填', owner: '用户', consequence: '不能判断', participatesInFormula: false },
  { key: 'majorAdministrativePenalty', label: '是否存在重大行政处罚', group: 'A基础信息', required: '必填', owner: '用户', consequence: '不能判断', participatesInFormula: false },
  { key: 'amlOrSanctionRisk', label: '是否涉及洗钱/恐怖融资/扩散融资/逃税骗税/制裁等风险', group: 'A基础信息', required: '必填', owner: '用户', consequence: '不能判断', participatesInFormula: false },
  { key: 'illegalFinancialActivity', label: '是否涉及民间借贷/非法集资/涉黑涉恶等非法金融活动', group: 'A基础信息', required: '必填', owner: '用户', consequence: '不能判断', participatesInFormula: false },
  { key: 'majorIncident3y', label: '近三年是否发生重大安全/质量/环保事故', group: 'A基础信息', required: '必填', owner: '用户', consequence: '不能判断', participatesInFormula: false },
  { key: 'taxIllegalRecord', label: '是否存在偷漏税等违法违规记录', group: 'A基础信息', required: '必填', owner: '用户', consequence: '不能判断', participatesInFormula: false },
  { key: 'forbiddenRestrictedBusiness', label: '产品或服务是否属于国家禁止/限制/淘汰类', group: 'A基础信息', required: '必填', owner: '用户', consequence: '不能判断', participatesInFormula: false },
  { key: 'isTechEnterprise', label: '是否具有有效高新技术企业资质', group: 'A基础信息', required: '选填', owner: '用户', consequence: '可暂缺', participatesInFormula: false },
  { key: 'isMortgageProject', label: '是否按揭类项目', group: 'A基础信息', required: '必填', owner: '用户', consequence: '不能判断', participatesInFormula: false },
  { key: 'establishmentDate', label: '企业成立日期/年份', group: 'B测算信息', required: '必填', owner: '用户', consequence: '不能判断', participatesInFormula: true },
  { key: 'taxCreditLevel', label: '上一年度纳税信用等级', group: 'B测算信息', required: '必填', owner: '用户', consequence: '不能判断', participatesInFormula: true },
  { key: 'taxAmount12m', label: '申请授信前12个月缴税总额', group: 'B测算信息', required: '必填', owner: '用户', consequence: '不能判断', participatesInFormula: true },
  { key: 'creditExposureTotal', label: '授信敞口总额', group: 'B测算信息', required: '必填', owner: '用户', consequence: '不能判断', participatesInFormula: true },
  { key: 'taxRevenue12m', label: '报税收入', group: 'B测算信息', required: '必填', owner: '用户', consequence: '不能判断', participatesInFormula: true },
  { key: 'latestAssetTotal', label: '最新一期资产总额', group: 'B测算信息', required: '选填', owner: '用户', consequence: '不能判断', participatesInFormula: true },
  { key: 'latestLiabilityTotal', label: '最新一期负债总额', group: 'B测算信息', required: '选填', owner: '用户', consequence: '不能判断', participatesInFormula: true },
  { key: 'latestAssetLiabilityRatio', label: '最新一期资产负债率', group: 'B测算信息', required: '选填', owner: '用户', consequence: '不能判断', participatesInFormula: true },
  { key: 'currentApplyAmount', label: '本次申请金额', group: 'B测算信息', required: '必填', owner: '用户', consequence: '不能生成', participatesInFormula: true },
  { key: 'creditAmount', label: '授信方案金额', group: 'B测算信息', required: '选填', owner: '用户', consequence: '可暂缺', participatesInFormula: true },
  { key: 'existingMinjianPlanCreditAmount', label: '民间投资专项计划既有授信额度', group: 'B测算信息', required: '必填', owner: '用户', consequence: '不能判断', participatesInFormula: true },
  { key: 'otherBankChangYiDanAmount', label: '他行长易担已获批金额', group: 'B测算信息', required: '选填', owner: '用户', consequence: '不能判断', participatesInFormula: true },
  { key: 'existingBatchGuaranteeCreditAmount', label: '中小担所有批量担保业务既有额度', group: 'B测算信息', required: '选填', owner: '用户', consequence: '不能判断', participatesInFormula: true },
  { key: 'zxdBusinessResponsibilityBalance', label: '借款人在中小担业务融资担保责任余额', group: 'B测算信息', required: '必填', owner: '用户', consequence: '不能判断', participatesInFormula: true },
  { key: 'relatedPartyResponsibilityBalance', label: '关联方在中小担融资担保责任余额', group: 'B测算信息', required: '必填', owner: '用户', consequence: '不能判断', participatesInFormula: true },
  { key: 'zxdNetAsset', label: '中小担净资产', group: 'B测算信息', required: '必填', owner: '用户', consequence: '不能判断', participatesInFormula: true },
  { key: 'creditTerm', label: '授信期限', group: 'B测算信息', required: '必填', owner: '用户', consequence: '不能生成', participatesInFormula: true },
  { key: 'fundPurpose', label: '资金用途', group: 'B测算信息', required: '必填', owner: '用户', consequence: '不能生成', participatesInFormula: false },
  { key: 'repayMethod', label: '还本方式', group: 'B测算信息', required: '选填', owner: '用户', consequence: '可暂缺', participatesInFormula: false },
  { key: 'quarterlyRepayAmount', label: '每季度归还本金', group: 'B测算信息', required: '选填', owner: '用户', consequence: '可暂缺', participatesInFormula: false },
  { key: 'monthlyRepayAmount', label: '每月归还本金', group: 'B测算信息', required: '选填', owner: '用户', consequence: '可暂缺', participatesInFormula: false },
  { key: 'rateExpression', label: '利率表述', group: 'B测算信息', required: '选填', owner: '用户', consequence: '可暂缺', participatesInFormula: false },
  { key: 'payMethod', label: '贷款支用方式', group: 'B测算信息', required: '选填', owner: '用户', consequence: '可暂缺', participatesInFormula: false },
  { key: 'hasThirdPartyGuarantee', label: '是否存在第三方保证/共同借款安排', group: 'B测算信息', required: '选填', owner: '用户', consequence: '可暂缺', participatesInFormula: false },
  { key: 'hasMortgage', label: '是否存在不动产抵押需核实二押安排', group: 'B测算信息', required: '选填', owner: '用户', consequence: '可暂缺', participatesInFormula: false },
  { key: 'extraGuarantee', label: '其他担保方式补充', group: 'B测算信息', required: '选填', owner: '用户', consequence: '可暂缺', participatesInFormula: false },
  { key: 'breakthroughReasons', label: '突破理由集合', group: 'C突破判断', required: '选填', owner: '用户', consequence: '不能判断', participatesInFormula: false },
  { key: 'answerOverrides', label: '检核表人工覆盖文本', group: 'C突破判断', required: '选填', owner: '用户', consequence: '可暂缺', participatesInFormula: false },
];
