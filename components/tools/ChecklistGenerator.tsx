import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FileText, Download, Sparkles, Eye, Clipboard, Package, FileBarChart } from 'lucide-react';
import { saveAs } from 'file-saver';
import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, AlignmentType, BorderStyle, ShadingType
} from 'docx';
import AppLayout from '../../src/components/layout/AppLayout';
import { cn } from '../../lib/utils';

type ProductType = 'chang_yi_dan' | 'chang_rong_bao';

/* ═══════════════════════════════════════════════
   CHECKLIST ROW DATA (exact from 长易担长融保业务检核表.docx template)
   ═══════════════════════════════════════════════ */

interface ChecklistRow {
  key: string;
  label: string;
  defaultAnswer: string;
  section: 'access' | 'special' | 'over300' | 'scheme_crb' | 'scheme_cyd';
}

const CHECKLIST_ROWS: ChecklistRow[] = [
  { key: 'a1', label: '1、注册地位于厦门市的中小微企业、中小微非企业经济组织。"长融保"业务还支持个体工商户、小微企业主及农户。', defaultAnswer: '符合要求，为厦门市中小微企业。', section: 'access' },
  { key: 'a2', label: '2、借款人在未被列入经营异常名录，借款人及其法定代表人、实际控制人在不存在失信被执行人等重大不良信用记录，查询"国家企业信用信息公示系统"及"信用中国"并提供截图。', defaultAnswer: '查询"国家企业信用信息公示系统"及"信用中国"，符合要求。', section: 'access' },
  { key: 'a3', label: '3、存在作为被告的借贷类案件纠纷原则上不予准入（若我行同意准入的，应提供相关说明材料，经中小担同意后予以准入，以中小担对接人与我行微信确认后的截图为准，并上传信贷系统），不存在未履行完毕的强制执行或重大行政处罚记录。', defaultAnswer: '查询法院网、被执行及失信被执行网站、企查查、裁判文书网等平台，未发现涉及诉讼案件，符合要求。', section: 'access' },
  { key: 'a4', label: '4、借款人及其法定代表人、实际控制人未涉及洗钱、恐怖融资、扩散融资、逃税骗税、制裁等风险，未违法从事民间借贷、非法集资、涉黑涉恶及其他非法金融活动。', defaultAnswer: '查询"国家企业信用信息公示系统"及"信用中国"，被执行及失信被执行网站，审查员复查企查查，未涉及，符合要求。', section: 'access' },
  { key: 'a5', label: '5、提供的产品（服务）不属于国家禁止、限制或淘汰类', defaultAnswer: '查询我行授信政策中的国家禁止、限制、淘汰类名单，未在名单内，符合要求。', section: 'access' },
  { key: 'a6', label: '6、借款人近三年未发生重大安全（含网络安全、数据安全）、质量、环境污染等事故，无偷漏税等违法违规行为记录。', defaultAnswer: '查询"国家企业信用信息公示系统"及"信用中国"，审查员复查企查查，未涉及，符合要求。', section: 'access' },
  { key: 'a7', label: '7、借款人及其关联人（法定代表人、控股股东、实际控制人）、关联企业（关联人控制企业）当前在本行无不良及重大预警情况。', defaultAnswer: '非我行不良或重大预警客户，符合要求。', section: 'access' },
  { key: 'a8', label: '8、借款人符合本行基础评级策略的准入要求，具体标准以最新通知为准。', defaultAnswer: '融合基础评级为B级，符合准入要求。', section: 'access' },
  { key: 's1', label: '1、首次纳入长易担业务的，借款人无当前逾期贷款（含本金或利息），本业务不涵盖本行展期、借新还旧（含归还转贷资金）、无还本续贷（不得覆盖原额度，采用接力贷、信贷周转资金等）等风险缓释类业务及存量风险转化业务。', defaultAnswer: '不存在该类风险缓释业务及存量风险转化业务的情况。', section: 'special' },
  { key: 's2', label: '2、"长易担"需为线下尽调审批业务（300万以下可采用线上+线下模式），需落实借款人或担保企业具备实际经营场景，且资金用途合理合规。"长易担"项下在保业务风险缓释时，可不受相关信用条件及以下授信方案中融资期限等条件约束，但不得扩大中小担的担保责任（包括担保责任方式、承保比例、担保责任金额等），不得续贷至国家融资担保基金的其他业务品种。', defaultAnswer: '企业实际经营，用途合理合规。非在保业务风险缓释。', section: 'special' },
  { key: 's3', label: '3、本业务不接受个人经营性贷款申请（农户除外）；原则上不接受建筑施工类企业申请（具有有效高新技术企业资质的除外）。"长易担"业务重点支持先进制造业、科技等相关领域。', defaultAnswer: '符合要求，非个人经营性贷款，非建筑施工类。', section: 'special' },
  { key: 's4', label: '4、借款人不属于政府融资平台或国有企业，具体包括:①政府部门、机构、事业单位出资设立的国有独资企业，以及上述单位、企业直接或间接合计持股为100%的国有全资企业;②上述单位、企业单独或共同出资，合计拥有产(股)权比例超过50%，且其中之一为最大股东的企业;③上述所列单位、企业对外出资，拥有股权比例超过50%的各级子企业;④上述单位、单一国有及国有控股企业直接或间接持股比例未超过50%，但为第一大股东，并且通过股东协议、公司章程、董事会决议或者其他协议安排能够对其实际支配的企业。', defaultAnswer: '不属于政府融资平台或国有企业，符合要求。', section: 'special' },
  { key: 's5', label: '5、借款人在放款时点非中小担及其关联担保主体（如包含市担保、湖里担保、海沧担保等关联主体）的融资担保在保客户（不含批量融资担保业务），非中小担及其关联担保主体的风险客户（包括展期、重组、逾期、代偿、审批未通过或明知风险未开展合作等情形）。', defaultAnswer: '非中小担及关联融资在保客户及风险客户，符合要求。', section: 'special' },
  { key: 's6', label: '6、原则上借款人的实收资本、资产总额、营业收入、社保人数不能为0，若其中任意一项或多项为0，但若经办支行认为情况合理的可向中小担提供相应情况说明及相关实际经营核实照片，经中小担审核同意后可准入，以中小担对接人与我行微信确认后的截图为准，并上传信贷系统。', defaultAnswer: '实收资本、资产总额、营业收入、社保人数不为0，符合要求。', section: 'special' },
  { key: 's7', label: '7、原则上款人在主债权起始日前6个月内未发生法定代表人、实际控制人或大股东的变更，若发生上述变更但经办支行认为情况合理的应向中小担提供相应情况说明，经中小担保审核确认后准入，以中小担对接人与我行微信确认后的截图为准，并上传信贷系统。', defaultAnswer: '未发生变更，符合要求。', section: 'special' },
  { key: 'o1', label: '8.1借款人或担保企业成立时间满2年及以上；', defaultAnswer: '成立时间____年，符合要求。', section: 'over300' },
  { key: 'o2', label: '8.2借款人（含经营主体）上一年度纳税信用等级非D级，申请授信前12个月（或上年度）的缴税总额（含税收优惠减免额）在5万元（含）以上', defaultAnswer: '上一年的纳税等级___级，缴税额__万，符合要求。', section: 'over300' },
  { key: 'o3', label: '8.3借款人（含经营主体）营授比不超过40%，批发零售行业营授比不超过20%（营授比=企业征信报告体现的借款人（含经营主体）授信敞口总额(余额，含本次，可剔除低信用风险敞口)/申请授信前12个月（或上年度）报税收入，以纳税申报表为准）', defaultAnswer: '营授比=___/__=__%<40%,符合要求。', section: 'over300' },
  { key: 'o4', label: '8.4借款人（含经营主体）最新一期报税报表体现的资产负债率不超过70%。', defaultAnswer: '资产负债率=___/___=__%<70%，符合要求。', section: 'over300' },
  { key: 'r1', label: '1.1单一借款人在民间投资专项计划项下（长融保与长易担业务合计）最高授信额度不超过2000万元；借款人在中小担的各类业务合计融资担保责任余额不超过5000万元，且不超过中小担净资产（扣除对其他融资担保公司投资）的10%，借款人及其关联方在中小担各类业务的融资担保责任余额不超过中小担净资产（扣除对其他融资担保公司投资）的15%。', defaultAnswer: '本次申请__万，未在中小担有其他业务，符合要求。', section: 'scheme_crb' },
  { key: 'r2', label: '1.2单笔贷款期限设置为一年期以上（不含一年期），以借款凭证载明期限为准，贷款形式，不采用随借随还的循环贷模式。', defaultAnswer: '已在授信方案中落实。', section: 'scheme_crb' },
  { key: 'r3', label: '1.3中小担提供连带责任保证担保，担保范围为单笔借款合同项下未清偿贷款本金余额的80%（不含利息、违约金、罚息等），保证期间自单笔贷款授信合同签订之日起，至债务履行期限届满（含本行宣布债务提前到期）之日后三年止。', defaultAnswer: '已在授信方案中落实。', section: 'scheme_crb' },
  { key: 'r4', label: '1.4贷款用途需为购买设备及原材料、技术改造、数智化改造（含购买硬件设备和软件系统）、改扩建厂房、店面装修、经营周转等生产活动，以及用于餐饮住宿、健康、养老、托育、家政、文化娱乐、旅游、体育、绿色、数字、零售等消费领域场景拓展和升级改造等。\n需根据借款人实际资金用途在借款合同或借款业务申请书中具体选择下列融资用途中任意一项，分别为："购买设备及原材料"、"技术改造"、"数智化改造"、"改扩建厂房"、"店面装修"、"经营周转"，与授信批复保持一致，不得使用其他表述。', defaultAnswer: '已在授信方案中落实。', section: 'scheme_crb' },
  { key: 'r5', label: '1.5中小担向我行出具《担保意向函》，信贷系统建立中小担最高额保证合同，以实现担保额度占用。', defaultAnswer: '已提供，系统已建立。', section: 'scheme_crb' },
  { key: 'r6', label: '1.6放款前提供《放款通知书》。', defaultAnswer: '已在授信方案中落实。', section: 'scheme_crb' },
  { key: 'e1', label: '2.1单一借款人在长易担业务项下所有合作银行的最高授信额度合计不超过1000万元，民间投资专项计划项下（长易担与长融保业务合计）不超过2000万元；（备注：此处单一借款人包含同一法定代表人的企业或有为借款人提供保证的企业或个人）。', defaultAnswer: '本次申请__万，符合要求。', section: 'scheme_cyd' },
  { key: 'e2', label: '2.2借款人在中小担所有批量担保业务（含长易担业务，国家融资担保基金直连"总对总"业务除外）的最高授信额度合计不超过2000万元', defaultAnswer: '符合要求。', section: 'scheme_cyd' },
  { key: 'e3', label: '2.3借款人在中小担的各类业务合计融资担保责任余额不超过5000万元，且在中小担各类业务合计融资担保责任余额不得超过中小担净资产(扣除中小担对其他融资担保公司投资)的10%，借款人及其关联方在中小担各类业务的融资担保责任余额不得超过中小担净资产（扣除对其他融资担保公司投资）的15%。', defaultAnswer: '符合要求。', section: 'scheme_cyd' },
  { key: 'e4', label: '2.4单笔贷款期限设置为一年期以上（不含一年期），以借款凭证载明期限为准，贷款形式，不采用随借随还的循环贷模式。原则上采用单笔备案模式，若本行以授信额度备案至中小担，其项下存在多笔提款的，需按提款笔数逐笔向中小担备案。', defaultAnswer: '已在授信方案中落实。', section: 'scheme_cyd' },
  { key: 'e5', label: '2.5中小担提供连带责任保证担保，担保范围为单笔借款合同项下未清偿贷款本金余额的80%（不含利息、违约金、罚息等），保证期间自单笔贷款授信合同签订之日起，至债务履行期限届满（含本行宣布债务提前到期）之日后三年止。\n如有除中小担之外的第三方为我行提供保证担保或作为共同借款人/共同债务人的，应同时确保该第三方为同一笔担保贷款向中小担提供反担保；对于有不动产抵押的业务，须同步向中小担办理二押(确无法办理二押的，需经由中小担审核通过可豁免，以中小担对接人与我行微信确认后的截图为准，并上传信贷系统)。', defaultAnswer: '已在授信方案中落实。', section: 'scheme_cyd' },
  { key: 'e6', label: '2.6贷款用途需为购买设备及原材料、技术改造、数智化改造（含购买硬件设备和软件系统）、改扩建厂房、店面装修、经营周转等生产活动，以及用于餐饮住宿、健康、养老、托育、家政、文化娱乐、旅游、体育、绿色、数字、零售等消费领域场景拓展和升级改造等。\n需根据借款人实际资金用途在借款合同或借款业务申请书中具体选择下列融资用途中任意一项，分别为："购买设备及原材料"、"技术改造"、"数智化改造"、"改扩建厂房"、"店面装修"、"经营周转"，与授信批复保持一致，不得使用其他表述。', defaultAnswer: '已在授信方案中落实。', section: 'scheme_cyd' },
  { key: 'e7', label: '2.7信贷系统建立中小担最高额保证合同，以实现担保额度占用。', defaultAnswer: '系统已建立。', section: 'scheme_cyd' },
  { key: 'e8', label: '2.8放款前提供《放款通知书》。', defaultAnswer: '已在授信方案中落实。', section: 'scheme_cyd' },
];

/* ─── Common clauses ─── */
const COMMON_CLAUSES = `合同限制性条款：借款人已充分了解民间投资专项担保计划相关政策，认可中小担的增信作用，自愿按约定缴纳担保费；无论本行是否获得中小担代偿，均不影响本行对借款人、担保人的全额追偿权利，借款人、担保人不得以本行获得代偿为由主张减免债务；借款人未按约定使用资金、未按时偿还贷款的，本行有权宣布贷款提前到期，并要求中小担履行担保责任，同时借款人按约定承担相应违约责任。
涉及反担保的，本行协助中小担与反担保人签订反担保合同，落实反担保相关手续。`;

const DOCUMENT_CLAUSES = `4、额度建档以及重新备案时需提供以下资料：均需由客户经理截屏（注意截屏时间需体现）、并上传至信贷系统客户影像资料中。
（1）查询厦门市商事主体登记及信用信息公示平台，借款人未被列入经营异常名录。
（2）查询中国执行信息公开网（被执行人信息和失信被执行人查询模块）及"国家企业信用信息公示系统"及"信用中国"、税务网站等，能显示借款人及其法定代表人、实际控制人当前无被执行借贷合同案件或刑事案件或失信被执行信息、未涉及洗钱、恐怖融资、扩散融资、逃税骗税、制裁等风险，未违法从事民间借贷、非法集资、涉黑涉恶及其他非法金融活动、近三年未发生重大安全（含网络安全、数据安全）、质量、环境污染等事故，无偷漏税等违法违规行为记录。`;

const CONCLUSION_CLAUSE = `5、调查报告和其他条件需明确结论：明确担保方式为纳入"长融保"、"长易担"产品补偿范围。`;

const APPROVAL_PATH = `四、报审路径：与增信基金额度合控管理。以下场景可通过小企业条线申报：
1、符合除增信抵押贷场景的其他增信基金场景，且长易担额度+增信基金额度授信敞口不超过500万元
2、符合除增信抵押贷场景的其他增信基金场景的三类重点客群：专精特新企业、科技型企业（仅限国家级、省级高新技术企业及福建省科技小巨人）、经营满2年且近2年营收盈利稳定（去年纳税申报营业额不低于2000万）的拥有自有厂房的生产型企业，如同时满足如下条件的可通过小企业条线上报：（1）500万元＜长易担额度+增信基金额度授信敞口≤1000万元且全部额度授信敞口≤3000万元，（2）可提供近一个年度的经备案的审计报告（如无法提供经备案的审计报告，不适用财务报表未经审计而提高到分行行长这一规定），并要求至少上一个年度盈利。（3）可适用小企业完整版授信报告及材料清单，但需增加补充调查说明，若为生产型企业，还需提供看厂报告。
3、通过小企业条线申报的各类信用保证类长易担额度+增信子基金业务，同一实际控制人控制的企业不超过2户且总额度不超过1000万元（增信抵押贷不计入该1000万元额度内，承做增信抵押贷的企业也不在2户限制范围内）。
如超过上述1000万元总额度的需满足以下条件：若2家企业均为专精特新企业、科技型企业（仅限国家级、省级高新技术企业及福建省科技小巨人）、经营满2年且近2年营收盈利稳定的拥有自有厂房的生产型企业中的一类，则可超过1000万元，但不超过1500万元，且不得申请采用小企业非标授信。
4、不符合以上要求的需按工商条线上报。`;

/* ═══════════════════════════════════════════════
   FORM STATE — 含全部关键字段
   ═══════════════════════════════════════════════ */

interface FormInfo {
  // 基本信息
  enterpriseName: string;
  legalRep: string;
  actualController: string;
  spouseName: string;
  establishedDate: string;
  // 授信信息
  creditAmount: string;
  creditTerm: string;
  fundPurpose: string;
  currentApplyAmount: string;   // 本行本次申请额度
  otherBankApproved: string;    // 他行已获批额度
  // 还本付息
  repayMethod: string;          // 还本方式
  quarterlyRepayAmount: string; // 每季度归还本金金额（万元）
  rateExpression: string;       // 利率表述
  payMethod: string;            // 支付方式（受托支付/自主支付）
  extraGuarantee: string;       // 其他担保方式补充
  // 财务指标
  taxGrade: string;
  taxGradePrevYear: string;     // 上一年度纳税信用等级
  taxAmount12m: string;
  taxAmountPrevYear: string;    // 申请授信前12个月缴税总额
  creditLoanRatio: string;      // 营授比
  assetLiabilityRatio: string;  // 资产负债率
  // 企业标签
  isTechEnterprise: boolean;    // 科技型企业
  isSpecialized: boolean;       // 专精特新
  isProduction: boolean;        // 生产型企业
  // 担保标识
  isOver300w: boolean;
  hasThirdPartyGuarantee: boolean;
  hasMortgage: boolean;
  // 检核项答案
  answers: Record<string, string>;
}

const DEFAULT_INFO: FormInfo = {
  enterpriseName: '',
  legalRep: '',
  actualController: '',
  spouseName: '',
  establishedDate: '',
  creditAmount: '',
  creditTerm: '',
  fundPurpose: '',
  currentApplyAmount: '',
  otherBankApproved: '',
  repayMethod: 'quarterly',     // 默认：按季还本
  quarterlyRepayAmount: '',
  rateExpression: 'LPR-50bp',   // 默认利率表述
  payMethod: 'entrusted',       // 默认：受托支付
  extraGuarantee: '',
  taxGrade: '',
  taxGradePrevYear: '',
  taxAmount12m: '',
  taxAmountPrevYear: '',
  creditLoanRatio: '',
  assetLiabilityRatio: '',
  isTechEnterprise: false,
  isSpecialized: false,
  isProduction: false,
  isOver300w: false,
  hasThirdPartyGuarantee: false,
  hasMortgage: false,
  answers: {},
};

/* ═══════════════════════════════════════════════
   AUTO-ANSWER GENERATION (智能联动)
   ═══════════════════════════════════════════════ */

function generateAutoAnswers(product: ProductType, info: FormInfo): Record<string, string> {
  const answers: Record<string, string> = {};

  // o1 成立时间
  if (info.establishedDate) {
    answers['o1'] = `成立时间${info.establishedDate}，符合要求。`;
  }

  // o2 纳税等级 + 缴税额
  if (info.taxGradePrevYear || info.taxAmountPrevYear) {
    const grade = info.taxGradePrevYear || '___';
    const amt = info.taxAmountPrevYear ? `${info.taxAmountPrevYear}万` : '__万';
    answers['o2'] = `上一年的纳税等级${grade}级，缴税额${amt}，符合要求。`;
  }

  // o3 营授比
  if (info.creditLoanRatio) {
    answers['o3'] = `营授比=${info.creditLoanRatio}%<40%,符合要求。`;
  }

  // o4 资产负债率
  if (info.assetLiabilityRatio) {
    answers['o4'] = `资产负债率=${info.assetLiabilityRatio}%<70%，符合要求。`;
  }

  // e1/r1 额度申请
  if (info.currentApplyAmount) {
    const amt = info.currentApplyAmount;
    if (info.otherBankApproved) {
      answers['e1'] = `借款人我行申请${amt}万，他行已获批${info.otherBankApproved}万，符合要求。`;
    } else {
      answers['e1'] = `本次申请${amt}万，未在中小担有其他业务，符合要求。`;
    }
    if (info.otherBankApproved) {
      answers['r1'] = `本次申请${amt}万，他行已获批${info.otherBankApproved}万，符合要求。`;
    } else {
      answers['r1'] = `本次申请${amt}万，未在中小担有其他业务，符合要求。`;
    }
  }

  // e1 长易担额度说明（含他行额度）
  if (info.currentApplyAmount && info.otherBankApproved) {
    answers['e1'] = `借款人我行申请${info.currentApplyAmount}万，他行已获批${info.otherBankApproved}万，合计${(parseFloat(info.currentApplyAmount) + parseFloat(info.otherBankApproved)) || '__'}万<1000万，符合要求。`;
  }

  return answers;
}

/* ═══════════════════════════════════════════════
   CREDIT PLAN TEXT GENERATOR
   ═══════════════════════════════════════════════ */

function generateCreditPlanText(product: ProductType, info: FormInfo): string {
  const productName = product === 'chang_yi_dan' ? '长易担' : '长融保';
  const guaranteeParty = '厦门市中小企业融资担保有限公司';
  const spouseText = info.spouseName ? `及其配偶${info.spouseName}` : '';
  const thirdPartyText = info.hasThirdPartyGuarantee ? `，由法定代表人${info.legalRep || 'XX'}${spouseText}提供连带责任保证` : '';
  const extraGuaranteeText = info.extraGuarantee ? `，${info.extraGuarantee}` : '';
  const mortgageText = info.hasMortgage ? '，并落实相应抵押登记手续' : '';

  // 还本方式
  const repayMap: Record<string, string> = {
    'quarterly': `采用按月付息，每季度归还贷款本金${info.quarterlyRepayAmount || '__'}万元，到期结清贷款本息。`,
    'monthly': `采用按月付息，按月归还贷款本金${info.quarterlyRepayAmount || '__'}万元，到期结清贷款本息。`,
    'bullet': `采用按月付息，到期一次性还本。`,
    'custom': info.repayMethod === 'custom' ? (info.answers['repay_custom'] || '按双方约定执行。') : '',
  };
  const repayText = repayMap[info.repayMethod] || repayMap['quarterly'];

  // 利率表述
  const rateText = info.rateExpression || '不低于五年期LPR-50b.p.';

  // 支付方式
  const payMethodText = info.payMethod === 'entrusted' ? '受托支付' : (info.payMethod === 'autonomous' ? '自主支付' : '受托支付');

  return `授信申请人：${info.enterpriseName || 'XX'}

授信方案（${productName}）：流动资金贷款不可循环额度人民币${info.creditAmount || info.currentApplyAmount || '__'}万元整，期限${info.creditTerm || '__'}。额度项下单笔期限不低于12个月且不超过36个月，单笔期限可超额度有效期后3个月。贷款支用利率按${rateText}执行，利率按年调整。${repayText}

担保方式：由${guaranteeParty}提供连带责任保证（代偿未清偿贷款本金余额的80%）${thirdPartyText}${extraGuaranteeText}。

资金用途：用于申请人${info.fundPurpose || '经营周转'}。

贷款支用条件：
1. 办理好${guaranteeParty}的担保手续，额度项下单笔提款需逐笔向${guaranteeParty}备案。
2. 额度项下单笔提款采用${payMethodText}方式，额度项下提用时需同步提供对应的购销合同，要求单笔提用金额不超过购销合同的80%。
3. 放款前提供${guaranteeParty}的《放款通知书》。
4. 本笔纳入"${productName}"产品补偿范围。
5. 查询厦门市商事主体登记及信用信息公示平台，借款人未被列入经营异常名录。查询中国执行信息公开网（被执行人信息和失信被执行人查询模块）及"国家企业信用信息公示系统"及"信用中国"、税务网站等，能显示借款人及其法定代表人、实际控制人${info.actualController || 'XX'}当前无被执行借贷合同案件或刑事案件或失信被执行信息、未涉及洗钱、恐怖融资、扩散融资、逃税骗税、制裁等风险，未违法从事民间借贷、非法集资、涉黑涉恶及其他非法金融活动、近三年未发生重大安全（含网络安全、数据安全）、质量、环境污染等事故，无偷漏税等违法违规行为记录。

合同限制性条款：
借款人已充分了解民间投资专项担保计划相关政策，认可${guaranteeParty}的增信作用，自愿按约定缴纳担保费；无论本行是否获得${guaranteeParty}代偿，均不影响本行对借款人、担保人的全额追偿权利，借款人、担保人不得以本行获得代偿为由主张减免债务；借款人未按约定使用资金、未按时偿还贷款的，本行有权宣布贷款提前到期，并要求${guaranteeParty}履行担保责任，同时借款人按约定承担相应违约责任。涉及反担保的，本行协助中小担与反担保人签订反担保合同，落实反担保相关手续。

签订仲裁协议，约定产生的纠纷交由厦门仲裁委员会进行仲裁。信贷资金不得挪用于购房，若发现贷款资金挪用于房地产领域，授信人有权解除合同，提前收回贷款，并追究相应法律责任。${mortgageText}

贷后管理：按《厦门银行厦门业务管理总部民间投资专项担保计划"长融保"、"长易担"业务管理办法》的贷后要求执行。`;
}

/* ═══════════════════════════════════════════════
   CHECKLIST TEXT GENERATOR
   ═══════════════════════════════════════════════ */

function generateChecklistText(product: ProductType, info: FormInfo, checkedKeys: Set<string>): string {
  const getAnswer = (item: ChecklistRow) => {
    if (!checkedKeys.has(item.key)) return '□ 未检视';
    return info.answers[item.key] || item.defaultAnswer;
  };

  const lines: string[] = [];
  lines.push('长易担长融保业务检核表');
  lines.push('');
  lines.push('本表使用范围：授信新增、续授信时均需填列此表进行检视，提供的材料均要求上两年度及近期的报税财报、上年度社保缴纳证明。');
  lines.push('');
  lines.push(`授信申请人：${info.enterpriseName || '________'}`);
  lines.push(`法定代表人：${info.legalRep || '________'}    实际控制人：${info.actualController || '________'}    配偶姓名：${info.spouseName || '________'}`);
  lines.push('');

  // （一）
  lines.push('（一）业务项目准入条件检视');
  CHECKLIST_ROWS.filter(r => r.section === 'access').forEach(item => {
    lines.push(`  ${item.label}`);
    lines.push(`  检视情况：${getAnswer(item)}`);
    lines.push('');
  });

  // （二）
  if (product === 'chang_yi_dan') {
    lines.push('（二）长易担业务的特殊准入要求（长融保业务无需检视）');
    CHECKLIST_ROWS.filter(r => r.section === 'special').forEach(item => {
      lines.push(`  ${item.label}`);
      lines.push(`  检视情况：${getAnswer(item)}`);
      lines.push('');
    });
  }

  // 超300万
  if (info.isOver300w) {
    lines.push('8、单户授信额度高于300万元且非按揭类项目的需满足以下要求：');
    CHECKLIST_ROWS.filter(r => r.section === 'over300').forEach(item => {
      lines.push(`  ${item.label}`);
      lines.push(`  检视情况：${getAnswer(item)}`);
      lines.push('');
    });
  }

  // 授信方案
  lines.push('授信方案');
  if (product === 'chang_rong_bao') {
    lines.push('1、长融保业务：');
    CHECKLIST_ROWS.filter(r => r.section === 'scheme_crb').forEach(item => {
      lines.push(`  ${item.label}`);
      lines.push(`  检视情况：${getAnswer(item)}`);
      lines.push('');
    });
  } else {
    lines.push('2、长易担业务：');
    CHECKLIST_ROWS.filter(r => r.section === 'scheme_cyd').forEach(item => {
      lines.push(`  ${item.label}`);
      lines.push(`  检视情况：${getAnswer(item)}`);
      lines.push('');
    });
  }

  // Common
  lines.push('长融保与长易担共同遵循条款：');
  lines.push(COMMON_CLAUSES);
  lines.push('检视情况：已在授信方案中落实。');
  lines.push('');
  lines.push(DOCUMENT_CLAUSES);
  lines.push('检视情况：已在授信方案中落实。');
  lines.push('');
  lines.push(CONCLUSION_CLAUSE);
  lines.push('');
  lines.push(APPROVAL_PATH);
  lines.push('');

  return lines.join('\n');
}

/* ═══════════════════════════════════════════════
   WORD GENERATION - CHECKLIST (TABLE FORMAT)
   ═══════════════════════════════════════════════ */

const TABLE_BORDER = {
  top: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
  bottom: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
  left: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
  right: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
  insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
  insideVertical: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
};

// 数据单元格：宋体 + 统一行距 + 内边距
const makeCell = (text: string, bold = false, size = 20, widthPct?: number, bgColor?: string) => {
  const para = new Paragraph({
    children: [new TextRun({ text, bold, size, font: '宋体' })],
    spacing: { after: 40, before: 20, line: 320, lineRule: 'auto' },
  });
  return new TableCell({
    children: [para],
    width: widthPct ? { size: widthPct, type: WidthType.PERCENTAGE } : undefined,
    shading: bgColor ? { type: ShadingType.CLEAR, color: bgColor, fill: bgColor } : undefined,
    margins: {
      top: 40,
      bottom: 40,
      left: 80,
      right: 80,
    },
  });
};

// 表头行：跨2列 + 灰色底色 + 居中 + 加粗 + 稍大字号
const makeSectionRow = (text: string) =>
  new TableRow({
    children: [
      new TableCell({
        children: [new Paragraph({
          children: [new TextRun({ text, bold: true, size: 22, font: '宋体' })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 40, before: 80 },
        })],
        columnSpan: 2,
        shading: { type: ShadingType.CLEAR, color: 'E8E8E8', fill: 'E8E8E8' },
        margins: { top: 60, bottom: 60, left: 80, right: 80 },
      }),
    ],
  });

// 数据行：左列 75%，右列 25%，右列加粗
const makeDataRow = (label: string, answer: string) =>
  new TableRow({
    children: [
      makeCell(label, false, 20, 75),
      makeCell(answer, true, 20, 25),
    ],
  });

async function buildChecklistWordDoc(product: ProductType, info: FormInfo): Promise<Blob> {
  const children: any[] = [
    new Paragraph({
      children: [new TextRun({ text: '长易担长融保业务检核表', bold: true, size: 36, font: '宋体' })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
    }),
    new Paragraph({
      children: [new TextRun({ text: '本表使用范围：授信新增、续授信时均需填列此表进行检视，提供的材料均要求上两年度及近期的报税财报、上年度社保缴纳证明。', size: 18, color: '666666', font: '宋体' })],
      spacing: { after: 120 },
    }),
    new Paragraph({
      children: [new TextRun({ text: `授信申请人：${info.enterpriseName || '________'}`, bold: true, size: 24, font: '宋体' })],
      spacing: { after: 60 },
    }),
    new Paragraph({
      children: [new TextRun({ text: `法定代表人：${info.legalRep || '________'}    实际控制人：${info.actualController || '________'}    配偶姓名：${info.spouseName || '________'}`, size: 20, font: '宋体' })],
      spacing: { after: 160 },
    }),
  ];

  const tableRows: TableRow[] = [];

  const addSection = (heading: string, rows: ChecklistRow[]) => {
    tableRows.push(makeSectionRow(heading));
    rows.forEach(item => {
      const answer = info.answers[item.key] || item.defaultAnswer;
      tableRows.push(makeDataRow(item.label, answer));
    });
  };

  addSection('（一）业务项目准入条件检视', CHECKLIST_ROWS.filter(r => r.section === 'access'));
  if (product === 'chang_yi_dan') {
    addSection('（二）长易担业务的特殊准入要求（长融保业务无需检视）', CHECKLIST_ROWS.filter(r => r.section === 'special'));
  }
  if (info.isOver300w) {
    addSection('8、单户授信额度高于300万元且非按揭类项目的需满足以下要求：', CHECKLIST_ROWS.filter(r => r.section === 'over300'));
  }

  if (product === 'chang_rong_bao') {
    addSection('1、长融保业务：', CHECKLIST_ROWS.filter(r => r.section === 'scheme_crb'));
  } else {
    addSection('2、长易担业务：', CHECKLIST_ROWS.filter(r => r.section === 'scheme_cyd'));
  }

  // Common clauses
  tableRows.push(makeSectionRow('长融保与长易担共同遵循条款：'));
  tableRows.push(makeDataRow(COMMON_CLAUSES, '已在授信方案中落实。'));
  tableRows.push(makeDataRow(DOCUMENT_CLAUSES, '已在授信方案中落实。'));
  tableRows.push(makeDataRow(CONCLUSION_CLAUSE, '已在授信方案中落实。'));

  // Approval path
  const approvalLines = APPROVAL_PATH.split('\n').filter(Boolean);
  approvalLines.forEach(line => {
    tableRows.push(makeDataRow(line, ''));
  });

  const table = new Table({
    rows: tableRows,
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: TABLE_BORDER,
    columnWidths: [5670, 1890], // 75%/25% in twentieths of a point (A4 ~9500 twips total usable)
  });

  children.push(table);

  const doc = new Document({ sections: [{ properties: {}, children }] });
  return Packer.toBlob(doc);
}

/* ═══════════════════════════════════════════════
   WORD GENERATION - CREDIT PLAN
   ═══════════════════════════════════════════════ */

async function buildCreditPlanWordDoc(product: ProductType, info: FormInfo): Promise<Blob> {
  const text = generateCreditPlanText(product, info);
  const productName = product === 'chang_yi_dan' ? '长易担' : '长融保';

  const children: any[] = [
    new Paragraph({
      children: [new TextRun({ text: `授信方案（${productName}）`, bold: true, size: 32, font: '宋体' })],
      spacing: { after: 240 },
    }),
  ];

  text.split('\n').forEach((line) => {
    if (!line.trim()) {
      children.push(new Paragraph({ text: '' }));
      return;
    }
    const isHeading = line.includes('授信申请人') || line.includes('授信方案（') || line.includes('担保方式') || line.includes('资金用途') || line.includes('贷款支用条件') || line.includes('合同限制性条款') || line.includes('贷后管理');
    children.push(new Paragraph({
      children: [new TextRun({ text: line, size: 24, bold: isHeading, font: '宋体' })],
      spacing: { after: 100, line: 400, lineRule: 'auto' },
    }));
  });

  const doc = new Document({ sections: [{ properties: {}, children }] });
  return Packer.toBlob(doc);
}

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════ */

const ChecklistGenerator: React.FC = () => {
  const [searchParams] = useSearchParams();
  const urlProduct = searchParams.get('product') as ProductType | null;
  const initialProduct = urlProduct === 'chang_rong_bao' ? 'chang_rong_bao' : 'chang_yi_dan';

  const [product, setProduct] = useState<ProductType>(initialProduct);
  const [info, setInfo] = useState<FormInfo>(() => {
    const saved = localStorage.getItem('checklist_form_info');
    if (saved) { try { return JSON.parse(saved); } catch { /* ignore */ } }
    return { ...DEFAULT_INFO };
  });
  const [checkedKeys, setCheckedKeys] = useState<Set<string>>(() => new Set(CHECKLIST_ROWS.map(r => r.key)));
  const [hasPreview, setHasPreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewTab, setPreviewTab] = useState<'checklist' | 'creditPlan'>('checklist');

  // Auto-save
  useEffect(() => {
    localStorage.setItem('checklist_form_info', JSON.stringify(info));
  }, [info]);

  // Auto-generate answers when key fields change
  useEffect(() => {
    const autoAnswers = generateAutoAnswers(product, info);
    if (Object.keys(autoAnswers).length > 0) {
      setInfo(prev => {
        const merged = { ...prev.answers };
        Object.entries(autoAnswers).forEach(([k, v]) => {
          // Only auto-fill if user hasn't manually overridden
          if (!merged[k] || merged[k] === CHECKLIST_ROWS.find(r => r.key === k)?.defaultAnswer) {
            merged[k] = v;
          }
        });
        return { ...prev, answers: merged };
      });
    }
  }, [info.creditAmount, info.otherBankApproved, info.currentApplyAmount, info.establishedDate, info.taxGradePrevYear, info.taxAmountPrevYear, info.creditLoanRatio, info.assetLiabilityRatio, product]);

  // Reset checkedKeys when product changes
  useEffect(() => {
    setCheckedKeys(new Set(CHECKLIST_ROWS.map(r => r.key)));
  }, [product]);

  const updateInfo = useCallback((field: keyof FormInfo, value: string | boolean) => {
    setInfo(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateAnswer = useCallback((key: string, value: string) => {
    setInfo(prev => ({ ...prev, answers: { ...prev.answers, [key]: value } }));
  }, []);

  const toggleKey = useCallback((key: string) => {
    setCheckedKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const checkAllSection = useCallback((keys: string[]) => {
    const allChecked = keys.every(k => checkedKeys.has(k));
    setCheckedKeys(prev => {
      const next = new Set(prev);
      keys.forEach(k => { allChecked ? next.delete(k) : next.add(k); });
      return next;
    });
  }, [checkedKeys]);

  const productName = product === 'chang_yi_dan' ? '长易担' : '长融保';

  // Count filled: focus on core fields
  const coreFields: (keyof FormInfo)[] = ['enterpriseName', 'legalRep', 'actualController', 'creditAmount', 'creditTerm', 'fundPurpose'];
  const filledCount = coreFields.filter(f => info[f] !== '').length;

  const handleGeneratePreview = () => {
    setHasPreview(true);
  };

  const handleDownloadChecklist = async () => {
    setIsGenerating(true);
    try {
      const blob = await buildChecklistWordDoc(product, info);
      saveAs(blob, `${info.enterpriseName || '企业'}_${productName}业务检核表.docx`);
    } catch (err) {
      console.error('生成检核表失败', err);
      alert('生成失败，请重试');
    } finally { setIsGenerating(false); }
  };

  const handleDownloadCreditPlan = async () => {
    setIsGenerating(true);
    try {
      const blob = await buildCreditPlanWordDoc(product, info);
      saveAs(blob, `${info.enterpriseName || '企业'}_${productName}授信方案.docx`);
    } catch (err) {
      console.error('生成授信方案失败', err);
      alert('生成失败，请重试');
    } finally { setIsGenerating(false); }
  };

  const handleDownloadAll = async () => {
    setIsGenerating(true);
    try {
      const [cb, cp] = await Promise.all([
        buildChecklistWordDoc(product, info),
        buildCreditPlanWordDoc(product, info),
      ]);
      saveAs(cb, `${info.enterpriseName || '企业'}_${productName}业务检核表.docx`);
      setTimeout(() => saveAs(cp, `${info.enterpriseName || '企业'}_${productName}授信方案.docx`), 500);
    } catch (err) {
      console.error('生成全部文档失败', err);
      alert('生成失败，请重试');
    } finally { setIsGenerating(false); }
  };

  const generatedChecklistText = useMemo(() => generateChecklistText(product, info, checkedKeys), [product, info, checkedKeys]);
  const generatedCreditPlanText = useMemo(() => generateCreditPlanText(product, info), [product, info]);

  const inputClass = 'w-full mt-1 rounded-lg border border-brand-border/20 bg-brand-offwhite px-3 py-2 text-xs outline-none focus:border-brand-dark transition-colors';
  const labelClass = 'text-[10px] font-bold text-brand-gray uppercase tracking-widest';

  const accessRows = CHECKLIST_ROWS.filter(r => r.section === 'access');
  const specialRows = CHECKLIST_ROWS.filter(r => r.section === 'special');
  const overRows = CHECKLIST_ROWS.filter(r => r.section === 'over300');
  const schemeRows = product === 'chang_rong_bao'
    ? CHECKLIST_ROWS.filter(r => r.section === 'scheme_crb')
    : CHECKLIST_ROWS.filter(r => r.section === 'scheme_cyd');

  // ─── Checklist edit section ───
  const ChecklistEditSection = ({ title, rows, showToggle = true }: { title: string; rows: ChecklistRow[]; showToggle?: boolean }) => {
    const sectionKeys = rows.map(r => r.key);
    const allChecked = sectionKeys.every(k => checkedKeys.has(k));
    return (
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <h4 className="text-xs font-bold text-brand-dark">{title}</h4>
          {showToggle && (
            <button onClick={() => checkAllSection(sectionKeys)} className="text-[10px] font-bold text-brand-gray hover:text-brand-dark">
              {allChecked ? '取消全选' : '全选'}
            </button>
          )}
        </div>
        <div className="grid gap-1.5">
          {rows.map(item => {
            const isChecked = checkedKeys.has(item.key);
            return (
              <div key={item.key} className={cn('rounded-lg border p-2.5 transition-colors', isChecked ? 'bg-emerald-50/50 border-emerald-200' : 'bg-white border-brand-border/10 opacity-60')}>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" checked={isChecked} onChange={() => toggleKey(item.key)} className="mt-0.5 rounded border-brand-border/20 text-emerald-600 focus:ring-emerald-600/20 shrink-0" />
                  <span className="text-[11px] text-brand-dark leading-relaxed">{item.label}</span>
                </label>
                {isChecked && (
                  <textarea value={info.answers[item.key] || item.defaultAnswer} onChange={e => updateAnswer(item.key, e.target.value)} className={cn(inputClass, 'mt-1.5 resize-none')} rows={2} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <AppLayout title={`${productName} - 生成中心`} showBack>
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 pb-24">

        {/* ─── Header ─── */}
        <div className="flex items-center gap-3 mb-5">
          <h1 className="text-lg sm:text-xl font-black text-brand-dark">{productName} · 智能生成中心</h1>
          <span className="text-[10px] font-bold text-brand-gray bg-brand-offwhite px-2 py-1 rounded-md">填写一次信息，同时生成检核表+授信方案</span>
        </div>

        {/* ─── Product Selector ─── */}
        <div className="flex gap-2 mb-5">
          {([['chang_yi_dan', '长易担'], ['chang_rong_bao', '长融保']] as [ProductType, string][]).map(([p, label]) => (
            <button key={p} onClick={() => { setProduct(p); setHasPreview(false); }}
              className={cn('flex-1 py-2.5 rounded-lg text-xs font-bold transition-all border',
                product === p ? 'bg-brand-dark text-white border-brand-dark' : 'bg-white text-brand-gray border-brand-border/20 hover:bg-brand-offwhite')}>
              {label}
            </button>
          ))}
        </div>

        {/* ─── Two-column layout ─── */}
        <div className="flex flex-col lg:flex-row gap-5">

          {/* ═══ LEFT: Input Panel ═══ */}
          <div className="w-full lg:w-[22rem] shrink-0">
            <div className="bg-white rounded-xl border border-brand-border/10 p-4 shadow-sm sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto">
              <h3 className="text-sm font-bold text-brand-dark mb-3 flex items-center gap-2">
                <Sparkles size={14} className="text-brand-gold" />
                企业核心信息
              </h3>

              {/* Progress */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-[10px] text-brand-gray mb-1">
                  <span>核心信息 {filledCount}/{coreFields.length} 已填</span>
                  <span>{productName}</span>
                </div>
                <div className="h-1 bg-brand-offwhite rounded-full overflow-hidden">
                  <div className="h-full bg-brand-dark transition-all duration-300 rounded-full" style={{ width: `${(filledCount / coreFields.length) * 100}%` }} />
                </div>
              </div>

              {/* Section 1: 基本信息 */}
              <div className="text-[10px] font-bold text-brand-dark uppercase tracking-widest mb-1.5 mt-1">基本信息</div>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="col-span-2">
                  <label className={labelClass}>企业名称</label>
                  <input value={info.enterpriseName} onChange={e => updateInfo('enterpriseName', e.target.value)} className={inputClass} placeholder="XX有限公司" />
                </div>
                <div>
                  <label className={labelClass}>法定代表人</label>
                  <input value={info.legalRep} onChange={e => updateInfo('legalRep', e.target.value)} className={inputClass} placeholder="姓名" />
                </div>
                <div>
                  <label className={labelClass}>实际控制人</label>
                  <input value={info.actualController} onChange={e => updateInfo('actualController', e.target.value)} className={inputClass} placeholder="姓名" />
                </div>
                <div>
                  <label className={labelClass}>配偶姓名</label>
                  <input value={info.spouseName} onChange={e => updateInfo('spouseName', e.target.value)} className={inputClass} placeholder="可选" />
                </div>
                <div>
                  <label className={labelClass}>成立时间</label>
                  <input value={info.establishedDate} onChange={e => updateInfo('establishedDate', e.target.value)} className={inputClass} placeholder="2020年6月" />
                </div>
              </div>

              {/* Section 2: 授信信息 */}
              <div className="text-[10px] font-bold text-brand-dark uppercase tracking-widest mb-1.5 mt-3">授信信息</div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className={labelClass}>授信金额（万元）</label>
                  <input value={info.creditAmount} onChange={e => updateInfo('creditAmount', e.target.value)} className={inputClass} placeholder="500" />
                </div>
                <div>
                  <label className={labelClass}>授信期限</label>
                  <input value={info.creditTerm} onChange={e => updateInfo('creditTerm', e.target.value)} className={inputClass} placeholder="36个月" />
                </div>
                <div>
                  <label className={labelClass}>本次申请额度</label>
                  <input value={info.currentApplyAmount} onChange={e => updateInfo('currentApplyAmount', e.target.value)} className={inputClass} placeholder="500" />
                </div>
                <div>
                  <label className={labelClass}>他行已获批额度</label>
                  <input value={info.otherBankApproved} onChange={e => updateInfo('otherBankApproved', e.target.value)} className={inputClass} placeholder="0" />
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>资金用途</label>
                  <input value={info.fundPurpose} onChange={e => updateInfo('fundPurpose', e.target.value)} className={inputClass} placeholder="经营周转/购买设备/原材料等" />
                </div>
              </div>

              {/* Section 3: 还本付息 & 利率 */}
              <div className="text-[10px] font-bold text-brand-dark uppercase tracking-widest mb-1.5 mt-3">还本付息 & 利率</div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className={labelClass}>还本方式</label>
                  <select value={info.repayMethod} onChange={e => updateInfo('repayMethod', e.target.value)} className={inputClass}>
                    <option value="quarterly">按季还本</option>
                    <option value="monthly">按月还本</option>
                    <option value="bullet">到期一次性还本</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>每季度还本金额（万元）</label>
                  <input value={info.quarterlyRepayAmount} onChange={e => updateInfo('quarterlyRepayAmount', e.target.value)} className={inputClass} placeholder="50" />
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>利率表述</label>
                  <input value={info.rateExpression} onChange={e => updateInfo('rateExpression', e.target.value)} className={inputClass} placeholder="不低于五年期LPR-50b.p." />
                </div>
                <div>
                  <label className={labelClass}>支付方式</label>
                  <select value={info.payMethod} onChange={e => updateInfo('payMethod', e.target.value)} className={inputClass}>
                    <option value="entrusted">受托支付</option>
                    <option value="autonomous">自主支付</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>其他担保补充</label>
                  <input value={info.extraGuarantee} onChange={e => updateInfo('extraGuarantee', e.target.value)} className={inputClass} placeholder="可选" />
                </div>
              </div>

              {/* Section 4: 财务指标 */}
              <div className="text-[10px] font-bold text-brand-dark uppercase tracking-widest mb-1.5 mt-3">财务指标</div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className={labelClass}>纳税等级</label>
                  <select value={info.taxGrade} onChange={e => updateInfo('taxGrade', e.target.value)} className={inputClass}>
                    <option value="">请选择</option>
                    <option value="A">A级</option><option value="B">B级</option><option value="M">M级</option><option value="C">C级</option><option value="D">D级</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>上年度纳税等级</label>
                  <input value={info.taxGradePrevYear} onChange={e => updateInfo('taxGradePrevYear', e.target.value)} className={inputClass} placeholder="B" />
                </div>
                <div>
                  <label className={labelClass}>近12个月缴税总额（万元）</label>
                  <input value={info.taxAmount12m} onChange={e => updateInfo('taxAmount12m', e.target.value)} className={inputClass} placeholder="20" />
                </div>
                <div>
                  <label className={labelClass}>上年度缴税总额（万元）</label>
                  <input value={info.taxAmountPrevYear} onChange={e => updateInfo('taxAmountPrevYear', e.target.value)} className={inputClass} placeholder="20" />
                </div>
                <div>
                  <label className={labelClass}>营授比（%）</label>
                  <input value={info.creditLoanRatio} onChange={e => updateInfo('creditLoanRatio', e.target.value)} className={inputClass} placeholder="25" />
                </div>
                <div>
                  <label className={labelClass}>资产负债率（%）</label>
                  <input value={info.assetLiabilityRatio} onChange={e => updateInfo('assetLiabilityRatio', e.target.value)} className={inputClass} placeholder="50" />
                </div>
              </div>

              {/* Section 5: 企业标签 */}
              <div className="text-[10px] font-bold text-brand-dark uppercase tracking-widest mb-1.5 mt-3">企业标签</div>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-xs text-brand-dark">
                  <input type="checkbox" checked={info.isTechEnterprise} onChange={e => updateInfo('isTechEnterprise', e.target.checked)} className="rounded border-brand-border/20 text-brand-dark" />
                  科技型企业（国家级/省级高新）
                </label>
                <label className="flex items-center gap-2 text-xs text-brand-dark">
                  <input type="checkbox" checked={info.isSpecialized} onChange={e => updateInfo('isSpecialized', e.target.checked)} className="rounded border-brand-border/20 text-brand-dark" />
                  专精特新企业
                </label>
                <label className="flex items-center gap-2 text-xs text-brand-dark">
                  <input type="checkbox" checked={info.isProduction} onChange={e => updateInfo('isProduction', e.target.checked)} className="rounded border-brand-border/20 text-brand-dark" />
                  生产型企业（自有厂房）
                </label>
                <label className="flex items-center gap-2 text-xs text-brand-dark">
                  <input type="checkbox" checked={info.isOver300w} onChange={e => updateInfo('isOver300w', e.target.checked)} className="rounded border-brand-border/20 text-brand-dark" />
                  超过300万元
                </label>
                <label className="flex items-center gap-2 text-xs text-brand-dark">
                  <input type="checkbox" checked={info.hasThirdPartyGuarantee} onChange={e => updateInfo('hasThirdPartyGuarantee', e.target.checked)} className="rounded border-brand-border/20 text-brand-dark" />
                  第三方保证/共同借款
                </label>
                <label className="flex items-center gap-2 text-xs text-brand-dark">
                  <input type="checkbox" checked={info.hasMortgage} onChange={e => updateInfo('hasMortgage', e.target.checked)} className="rounded border-brand-border/20 text-brand-dark" />
                  涉及抵押物
                </label>
              </div>

              {/* Generate Preview button */}
              <button
                onClick={handleGeneratePreview}
                className="w-full mt-4 flex items-center justify-center gap-2 py-3 bg-brand-dark text-white rounded-xl text-sm font-bold hover:opacity-90 transition-opacity shadow-lg"
              >
                <Eye size={16} />
                生成预览
              </button>

              <p className="text-[10px] text-brand-gray text-center mt-2">已自动保存填写内容，下次打开可直接使用</p>
            </div>
          </div>

          {/* ═══ RIGHT: Preview Panel ═══ */}
          <div className="flex-1 min-w-0">
            {!hasPreview ? (
              /* ─── Placeholder before preview ─── */
              <div className="flex flex-col items-center justify-center h-80 bg-white rounded-xl border border-brand-border/10 border-dashed">
                <Eye size={40} className="text-brand-border mb-3" />
                <p className="text-sm font-bold text-brand-gray text-center px-6">请先填写企业信息并点击"生成预览"</p>
                <p className="text-[11px] text-brand-gray mt-2 text-center px-6">预览将同时展示检核表和授信方案，生成后可在下方切换 Tab 查看</p>
              </div>
            ) : (
              <>
                {/* Preview hint */}
                <div className="mb-3 flex items-center gap-2 text-[11px] text-brand-gray">
                  <Sparkles size={12} className="text-brand-gold shrink-0" />
                  已生成预览，请在下方切换 Tab 查看检核表和授信方案，确认无误后可复制或下载
                </div>

                {/* Preview tabs */}
                <div className="flex gap-1 mb-4 bg-brand-offwhite rounded-lg p-1">
                  <button onClick={() => setPreviewTab('checklist')}
                    className={cn('flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-bold transition-all',
                      previewTab === 'checklist' ? 'bg-white text-brand-dark shadow-sm' : 'text-brand-gray')}>
                    <FileText size={12} /> 检核表预览
                  </button>
                  <button onClick={() => setPreviewTab('creditPlan')}
                    className={cn('flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-bold transition-all',
                      previewTab === 'creditPlan' ? 'bg-white text-brand-dark shadow-sm' : 'text-brand-gray')}>
                    <FileBarChart size={12} /> 授信方案预览
                  </button>
                </div>

                {/* ─── Checklist Preview ─── */}
                {previewTab === 'checklist' && (
                  <div className="bg-white rounded-xl border border-brand-border/10 p-4 shadow-sm">
                    <ChecklistEditSection title="（一）业务项目准入条件检视" rows={accessRows} />
                    {product === 'chang_yi_dan' && <ChecklistEditSection title="（二）长易担业务的特殊准入要求" rows={specialRows} />}
                    {info.isOver300w && <ChecklistEditSection title="8、单户授信额度高于300万元附加要求" rows={overRows} />}
                    <ChecklistEditSection title="授信方案" rows={schemeRows} />

                    <div className="mt-4 pt-4 border-t border-brand-border/10">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xs font-bold text-brand-dark">检核表文本预览（编辑上方条目后自动更新）</h3>
                      </div>
                      <pre className="whitespace-pre-wrap text-[11px] leading-5 text-brand-dark bg-brand-offwhite rounded-lg p-3 max-h-[40vh] overflow-y-auto font-mono">
                        {generatedChecklistText}
                      </pre>
                    </div>
                  </div>
                )}

                {/* ─── Credit Plan Preview ─── */}
                {previewTab === 'creditPlan' && (
                  <div className="bg-white rounded-xl border border-brand-border/10 p-4 shadow-sm">
                    <pre className="whitespace-pre-wrap text-[11px] leading-5 text-brand-dark bg-brand-offwhite rounded-lg p-3 max-h-[60vh] overflow-y-auto font-mono">
                      {generatedCreditPlanText}
                    </pre>
                  </div>
                )}

                {/* ─── ACTION BAR (only shown after preview) ─── */}
                <div className="mt-4 bg-white rounded-xl border border-brand-border/10 p-4 shadow-sm">
                  <h3 className="text-xs font-bold text-brand-dark mb-3 flex items-center gap-2">
                    <Download size={14} className="text-brand-gold" />
                    导出操作
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => navigator.clipboard.writeText(generatedChecklistText)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-white border border-brand-border/20 rounded-lg text-xs font-bold text-brand-dark hover:bg-brand-offwhite">
                      <Clipboard size={12} /> 复制检核表
                    </button>
                    <button onClick={handleDownloadChecklist} disabled={isGenerating}
                      className="flex items-center gap-1.5 px-3 py-2 bg-brand-dark text-white rounded-lg text-xs font-bold hover:opacity-90 disabled:opacity-50">
                      <Download size={12} /> {isGenerating ? '生成中...' : '下载检核表 Word'}
                    </button>
                    <div className="w-px h-8 bg-brand-border/20 mx-1" />
                    <button onClick={() => navigator.clipboard.writeText(generatedCreditPlanText)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-white border border-brand-border/20 rounded-lg text-xs font-bold text-brand-dark hover:bg-brand-offwhite">
                      <Clipboard size={12} /> 复制授信方案
                    </button>
                    <button onClick={handleDownloadCreditPlan} disabled={isGenerating}
                      className="flex items-center gap-1.5 px-3 py-2 bg-brand-dark text-white rounded-lg text-xs font-bold hover:opacity-90 disabled:opacity-50">
                      <Download size={12} /> {isGenerating ? '生成中...' : '下载授信方案 Word'}
                    </button>
                    <div className="w-px h-8 bg-brand-border/20 mx-1" />
                    <button onClick={handleDownloadAll} disabled={isGenerating}
                      className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-brand-dark to-brand-dark/80 text-white rounded-lg text-xs font-bold hover:opacity-90 disabled:opacity-50 shadow-md">
                      <Package size={12} /> {isGenerating ? '生成中...' : '一键下载全部'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ChecklistGenerator;
