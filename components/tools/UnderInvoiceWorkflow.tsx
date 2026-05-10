import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Banknote,
  Check,
  ClipboardCopy,
  Coffee,
  Download,
  ExternalLink,
  FileArchive,
  Plus,
  Trash2,
} from 'lucide-react';
import AppLayout from '../../src/components/layout/AppLayout';
import { cn } from '../../lib/utils';
import { useToast } from '../../src/components/common/Toast';

type InvoiceStatus = 'normal' | 'exception_required' | 'manual_review_required' | 'unknown';

type GeneratedText = {
  title: string;
  body: string;
  fullText: string;
};

type BillItem = {
  id: string;
  payee: string;
  amount: number;
  payeeAccount: string;
  payeeBankName: string;
  payeeBankNo: string;
  goodsName?: string;
};

type ProjectData = {
  branchName: string;
  drawer: string;
  drawerAccount: string;
  acceptor: string;
  contactEmail: string;
  contactAddress: string;
  contactPhone: string;
  projectNo: string;
  creditContractNo: string;
  pledgeContractNo: string;
  billBatchNo: string;
  preliminaryBillAmount: number;
  preliminaryDepositAmount: number;
  finalBillAmount: number;
  finalDepositAmount: number;
  issueDate: string;
  maturityDate: string;
  depositStartDate: string;
  depositEndDate: string;
  depositRate: number;
  depositTerm: string;
  depositNo: string;
  depositAccount: string;
  feeRate: number;
  invoiceDate: string;
  goodsName: string;
  bills: BillItem[];
};

const today = new Date().toISOString().slice(0, 10);

const addMonths = (dateText: string, months: number) => {
  const base = dateText ? new Date(`${dateText}T00:00:00`) : new Date();
  const day = base.getDate();
  base.setMonth(base.getMonth() + months);
  if (base.getDate() !== day) base.setDate(0);
  return base.toISOString().slice(0, 10);
};

const makeBill = (): BillItem => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  payee: '',
  amount: 0,
  payeeAccount: '',
  payeeBankName: '',
  payeeBankNo: '',
  goodsName: '',
});

const initialData: ProjectData = {
  branchName: '科技业务部',
  drawer: '',
  drawerAccount: '',
  acceptor: '',
  contactEmail: '',
  contactAddress: '',
  contactPhone: '',
  projectNo: '',
  creditContractNo: '',
  pledgeContractNo: '',
  billBatchNo: '',
  preliminaryBillAmount: 0,
  preliminaryDepositAmount: 0,
  finalBillAmount: 0,
  finalDepositAmount: 0,
  issueDate: today,
  maturityDate: addMonths(today, 6),
  depositStartDate: today,
  depositEndDate: addMonths(today, 6),
  depositRate: 0.014,
  depositTerm: '6个月',
  depositNo: '',
  depositAccount: '',
  feeRate: 0.0005,
  invoiceDate: today,
  goodsName: '原材料',
  bills: [{ ...makeBill(), id: 'bill-1' }],
};

function parseWanInput(value: string) {
  const parsed = Number(String(value || '').replace(/,/g, ''));
  return Number.isFinite(parsed) ? parsed * 10000 : 0;
}

function formatWan(amount: number): string {
  if (!Number.isFinite(amount)) return '0.00';
  return (amount / 10000).toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatYuan(amount: number): string {
  if (!Number.isFinite(amount)) return '0.00';
  return amount.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatRate(rate: number): string {
  if (!Number.isFinite(rate) || rate <= 0) return '';
  return `${(rate * 100).toFixed(2).replace(/\.00$/, '')}%`;
}

function parseRateInput(value: string) {
  const text = String(value || '').trim();
  const parsed = Number(text.replace('%', ''));
  if (!Number.isFinite(parsed)) return 0;
  return text.includes('%') || parsed > 1 ? parsed / 100 : parsed;
}

function toChineseCurrency(amount: number): string {
  const n = Math.round(Math.abs(amount));
  if (!Number.isFinite(n) || n === 0) return '零元整';
  const nums = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
  const units = ['', '拾', '佰', '仟'];
  const groups = ['', '万', '亿', '兆'];
  const sectionToCn = (section: number) => {
    let out = '';
    let zero = false;
    for (let i = 0; i < 4; i += 1) {
      const digit = Math.floor(section / 10 ** (3 - i)) % 10;
      if (digit === 0) {
        zero = true;
      } else {
        if (zero && out) out += '零';
        out += `${nums[digit]}${units[3 - i]}`;
        zero = false;
      }
    }
    return out.replace(/零+$/g, '');
  };
  const parts: string[] = [];
  let rest = n;
  let index = 0;
  while (rest > 0) {
    const section = rest % 10000;
    if (section) parts.unshift(`${sectionToCn(section)}${groups[index]}`);
    rest = Math.floor(rest / 10000);
    index += 1;
  }
  return `${parts.join('').replace(/零+/g, '零')}元整`;
}

function calcFee(billAmount: number, feeRate = 0.0005): number {
  return billAmount * feeRate;
}

function daysBetween(start: string, end: string) {
  if (!start || !end) return 183;
  const a = new Date(`${start}T00:00:00`).getTime();
  const b = new Date(`${end}T00:00:00`).getTime();
  if (!Number.isFinite(a) || !Number.isFinite(b)) return 183;
  return Math.max(1, Math.round((b - a) / 86400000));
}

function calcDepositForBill(billAmount: number, depositRate: number, start: string, end: string): number {
  if (!billAmount || !depositRate) return 0;
  return billAmount / (1 + depositRate * (daysBetween(start, end) / 365));
}

function calcBillForDeposit(depositAmount: number, depositRate: number, start: string, end: string): number {
  if (!depositAmount || !depositRate) return 0;
  return depositAmount * (1 + depositRate * (daysBetween(start, end) / 365));
}

function calcMaturityDate(issueDate: string, months = 6): string {
  return addMonths(issueDate, months);
}

function dateMinusMonths(dateText: string, months: number) {
  return addMonths(dateText, -months);
}

function checkInvoiceStatus(invoiceDate: string, issueDate: string): InvoiceStatus {
  if (!invoiceDate || !issueDate) return 'unknown';
  const invoice = new Date(`${invoiceDate}T00:00:00`).getTime();
  const issue = new Date(`${issueDate}T00:00:00`).getTime();
  const twoMonthLine = new Date(`${dateMinusMonths(issueDate, 2)}T00:00:00`).getTime();
  const sixMonthLine = new Date(`${dateMinusMonths(issueDate, 6)}T00:00:00`).getTime();
  if (!Number.isFinite(invoice) || !Number.isFinite(issue)) return 'unknown';
  if (invoice >= twoMonthLine) return 'normal';
  if (invoice >= sixMonthLine) return 'exception_required';
  return 'manual_review_required';
}

function payeeList(data: ProjectData) {
  const names = data.bills.map((bill) => bill.payee.trim()).filter(Boolean);
  return names.length ? Array.from(new Set(names)).join('、') : '收款人';
}

function displayGoods(data: ProjectData) {
  const goods = data.bills.map((bill) => bill.goodsName?.trim()).filter(Boolean);
  return goods.length ? Array.from(new Set(goods)).join('、') : data.goodsName || '原材料';
}

function finalBillWan(data: ProjectData) {
  return formatWan(data.finalBillAmount);
}

function finalDepositWan(data: ProjectData) {
  return formatWan(data.finalDepositAmount);
}

function generateQuotaReservationEmail(data: ProjectData): GeneratedText {
  const title = `${data.branchName}关于${data.drawer || '开票人'}银承承做申请`;
  const body = `各位领导上午好！
${data.branchName}客户${data.drawer || '开票人'}拟于${data.issueDate || '开票日期'}向我行申请开立一笔银承金额为${finalBillWan(data)}万元，具体信息详见附件，妥否？请领导批示。`;
  const fullText = `邮件标题：${title}

${body}

附件提醒：请上挂《${data.drawer || '开票人'}-全额质押开票（含低风险业务和现金专案）承做申请表》。`;
  return { title, body, fullText };
}

function generateRateFileDistributionText(data: ProjectData): GeneratedText {
  const title = `${data.branchName}关于${data.drawer || '开票人'}存单${finalDepositWan(data)}万元利率优惠流程`;
  const body = `利率申请（单笔：${data.drawer || '开票人'}拟购买我行定期存单${finalDepositWan(data)}万元，期限${data.depositStartDate || '存单开始日期'}至${data.depositEndDate || '存单到期日期'}，年利率${formatRate(data.depositRate)}。）`;
  const fullText = `${title}

${body}

附件提醒：请上挂：《利率审批通过OA》。

特别提示：存单无需冻结，不走存单冻结确认书。本流程为存单质押，不是存单冻结。`;
  return { title, body, fullText };
}

function generateCorporateRateApprovalText(data: ProjectData): GeneratedText {
  const title = `${data.branchName}关于${data.drawer || '开票人'}存单利率优惠事项审批`;
  const body = `${data.drawer || '开票人'}拟在我行购买定期存单${finalDepositWan(data)}万元，期限${data.depositStartDate || '存单开始日期'}至${data.depositEndDate || '存单到期日期'}，申请执行年利率${formatRate(data.depositRate)}。
该客户非我行关联方，不涉及关联交易，非公共资源类存款。本次利率优惠主要基于客户银承项下存单质押业务办理需要，存单资金来源合法合规，业务背景真实，存单将用于本笔银行承兑汇票质押担保。
建议客户补充/确认：客户基本情况、已获批或拟使用银承额度、存单资金来源、贸易背景对应购销合同和发票情况。
妥否，请领导审批。`;
  return { title, body, fullText: `${title}\n\n${body}` };
}

function generateCustomerMaterialMessage(): GeneratedText {
  const title = '客户柜台办理材料提醒';
  const body = `您好，办理大额存单及银承开票前，请携带以下材料至柜台：
1. 法人身份证复印件，无需原件；
2. 经办人身份证原件；
3. 公司公章；
4. 财务章；
5. 法人私章/预留印鉴章。
本笔业务按存单质押流程办理，存单无需冻结。柜台办理完成后，我们再继续协助推进提票、质押登记及后续系统流程。

另外，麻烦先通过微信同步本次开票对应的购销合同、发票、发票清单，便于我们提前核对贸易背景。`;
  return { title, body, fullText: body };
}

function generateCounterManagerMessage(data: ProjectData): GeneratedText {
  const title = '柜台主任WOA提醒';
  const body = `主任好，${data.drawer || '开票人'}预计于${data.issueDate || '开票日期'}办理大额存单开立及银承项下存单质押业务，存单金额约${finalDepositWan(data)}万元，期限${data.depositStartDate || '存单开始日期'}至${data.depositEndDate || '存单到期日期'}，年利率${formatRate(data.depositRate)}。
麻烦柜台协助提前准备/关注以下事项：
1. 本笔为存单质押业务，存单无需冻结；
2. 我会提前提供质押物移交明细表电子版要素；
3. 客户办理完成后，请协助提供存单原件复印件、抵质押品出入库单第三联原件、存单封包后的封皮/质押物移交明细表复印件等材料；
4. 相关复印件请加盖柜台业务章，存单原件复印件需柜台主任签章。
谢谢主任。`;
  return { title, body, fullText: body };
}

function generateCounterCollectionChecklist(): GeneratedText {
  const title = '柜台办理完成后取件清单';
  const body = `柜台办理完成后，请向柜台索取以下材料：
1. 存单原件复印件：需加盖柜台业务章及柜台主任签章；
2. 抵质押品出入库单第三联原件；
3. 存单封包后的封皮/质押物移交明细表复印件：需加盖柜台业务章。
特别提醒：存单无需冻结；请同步确认存单编号、存单账号，用于后续合同、系统录入及质押登记。`;
  return { title, body, fullText: body };
}

function generateCustomerOnlineTicketMessage(data: ProjectData): GeneratedText {
  const body = `您好，柜台存单开立完成后，麻烦您登录网银自行录入提票信息。录入时请注意：
1. 保证金类型请选择“存单”；
2. 存单金额必须与柜台开立的存单金额一致，为${formatYuan(data.finalDepositAmount)}元；
3. 存单账号请填写：${data.depositAccount || '存单账号'}，注意存单账号不是存单编号；
4. 存单编号为：${data.depositNo || '存单编号'}；
5. 票据金额为${formatYuan(data.finalBillAmount)}元，期限${data.issueDate || '银票开具日'}至${data.maturityDate || '银票到期日'}；
6. 银票手续费按万分之五测算，为${formatYuan(calcFee(data.finalBillAmount, data.feeRate))}元；
7. 录入完成后，请将系统生成的银承开票批次号/K开头批次号发回给我。`;
  return { title: '发送客户网银提票提醒', body, fullText: body };
}

function generateCreditPurpose(data: ProjectData): string {
  const names = payeeList(data);
  const goods = displayGoods(data);
  return `用于向${names}采购${goods}${data.bills.filter((bill) => bill.payee.trim()).length > 1 ? '等' : ''}，付款方式为银行承兑汇票。`;
}

function generateCreditRemark(data: ProjectData): string {
  return `银行承兑汇票，票据类型为电票，金额合计人民币${formatYuan(data.finalBillAmount)}元，期限${data.issueDate || '开票日期'}至${data.maturityDate || '到期日期'}，以人民币${formatYuan(data.finalDepositAmount)}元存单质押。支付对象为非关联企业。本笔业务贸易背景真实，存单资金来源合法合规。经查询借款人及担保人征信、全国法院被执行人信息查询网、国家税务总局厦门税务网站等相关信息，确认借款人及担保人、法定代表人均无被执行、欠税、征信不良等异常情况。`;
}

function generateMainDebtDescription(data: ProjectData): string {
  return `本合同担保主债权为主合同项下银承开票批次号：${data.billBatchNo || '银承开票批次号/K开头批次号'}的银行承兑汇票业务申请书项下的债务。`;
}

function generateGuaranteeContractTexts(data: ProjectData): GeneratedText[] {
  const guaranteeAmount = data.finalBillAmount * 1.5;
  const propertyDescription = `${data.drawer || '开票人'}持有厦门银行股份有限公司定期存单${finalDepositWan(data)}万元，期限${data.depositStartDate || '存单开始日期'}至${data.depositEndDate || '存单到期日期'}，年利率${formatRate(data.depositRate)}。`;
  const guaranteeScope = `详见编号为${data.pledgeContractNo || '编号'}质1的《质押合同》第三条约定。`;
  const all = `系统担保合同：日期一定注意！${data.issueDate || '开票日期'}至${data.maturityDate || '到期日期'}
担保金额（元）：${formatYuan(guaranteeAmount)}
主合同号码：${data.creditContractNo || '授信额度合同编号'}
债务履行期限：${data.issueDate || '开票日期'}至${data.maturityDate || '到期日期'}
质押财产价值：${formatYuan(data.finalDepositAmount)}
质押合同号码：${data.pledgeContractNo || '编号'}质1
担保范围：${guaranteeScope}
财产描述：${propertyDescription}
附件：额度协议、质押合同、存单。`;
  return [
    { title: '系统担保合同信息', body: all, fullText: all },
    { title: '财产描述', body: propertyDescription, fullText: propertyDescription },
    { title: '担保范围', body: guaranteeScope, fullText: guaranteeScope },
  ];
}

function generateZhongdengRegistrationText(data: ProjectData): GeneratedText {
  const body = `中登网/质押登记信息核对：
出质人：${data.drawer || '开票人'}
主合同号码：${data.creditContractNo || '授信额度合同编号'}
银承开票批次号：${data.billBatchNo || '银承开票批次号/K开头批次号'}
债务履行期限：${data.issueDate || '开票日期'}至${data.maturityDate || '到期日期'}
质押合同号码：${data.pledgeContractNo || '编号'}质1
质押财产：${data.drawer || '开票人'}持有厦门银行股份有限公司定期存单${finalDepositWan(data)}万元
存单编号：${data.depositNo || '存单编号'}
存单账号：${data.depositAccount || '存单账号'}
存单期限：${data.depositStartDate || '存单开始日期'}至${data.depositEndDate || '存单到期日期'}
存单利率：${formatRate(data.depositRate)}
质押财产价值：${formatYuan(data.finalDepositAmount)}
担保范围：详见编号为${data.pledgeContractNo || '编号'}质1的《质押合同》第三条约定。`;
  return { title: '中登网登记信息', body, fullText: body };
}

function generatePledgeEntrySteps(): GeneratedText {
  const body = `1. 中登网质押登记完成后，前往押品系统进行抵质押登记；
2. 抵质押登记完成后，发起押品入库流程；
3. 入库申请提交支行库管员；
4. 入库申请需上传存单影像资料；
5. 支行库管员通过后，入库成功；
6. 入库成功后，提交对公信贷系统放款申请；
7. 放款申请上传所有开票材料扫描件；
8. 对公信贷系统提交成功后，携带开票材料，核心为纸质质押合同，至分行放款中心线下审批；
9. 完成质押合同我行用印申请后，重新扫描质押合同并上传对公信贷系统影像。`;
  return { title: '押品系统、入库、放款申请步骤', body, fullText: body };
}

function generateSubmitOpinion(): GeneratedText {
  const body = `短版：本岗已确认质押物状态正常，同意。

完整版：本岗已确认质押物状态正常，未存在外部查冻扣等异常情形，同意。`;
  return { title: '提交意见', body, fullText: body };
}

function generateInvoiceExceptionText(data: ProjectData): GeneratedText | null {
  const status = checkInvoiceStatus(data.invoiceDate, data.issueDate);
  if (status !== 'exception_required') return null;
  const body = `附件清单系支行本月报送增值税发票早于开票日2个月但不早于6个月的例外申请，请审批。

建议发送/报送：裘丽娟、陈锘霖。
如错过当月批量报送，可改走OA特殊流程申请。`;
  return { title: '发票例外申请文字', body, fullText: body };
}

function generateUserInputTxt(data: ProjectData): string {
  const billLines = data.bills.length
    ? data.bills.flatMap((bill) => [
        `- 收款人: ${bill.payee}`,
        `  金额: ${bill.amount ? `${formatWan(bill.amount)}万` : ''}`,
        `  收款人账号: ${bill.payeeAccount}`,
        `  收款人开户行行名: ${bill.payeeBankName}`,
        `  收款人开户行行号: ${bill.payeeBankNo}`,
      ])
    : [
        '- 收款人: ',
        '  金额: ',
        '  收款人账号: ',
        '  收款人开户行行名: ',
        '  收款人开户行行号: ',
      ];
  return [
    '# 项下开票 · 用户必填清单',
    '# 填好后直接运行：项下README_自动化.py',
    '# 脚本会自动读取“续开_模板_已加占位符”，自动输出到“输出”文件夹。',
    '# 新增占位符时，在本清单里新增一行“占位符名称: 内容”即可。',
    '',
    '# ---------- 1. 基本信息 ----------',
    `开票人: ${data.drawer}`,
    `开票人账号: ${data.drawerAccount}`,
    `承兑人: ${data.acceptor || data.drawer}`,
    `编号: ${data.pledgeContractNo}`,
    `授信额度合同编号: ${data.creditContractNo}`,
    `银城开票P字号: ${data.billBatchNo}`,
    '',
    '# ---------- 2. 联系信息 ----------',
    `电子邮箱: ${data.contactEmail}`,
    `联系地址: ${data.contactAddress}`,
    `联系电话: ${data.contactPhone}`,
    '',
    '# ---------- 3. 日期与金额 ----------',
    `开票日期: ${data.issueDate}`,
    `到期日期: ${data.maturityDate}`,
    `开票金额: ${data.finalBillAmount ? `${formatWan(data.finalBillAmount)}万` : ''}`,
    `存单金额: ${data.finalDepositAmount ? `${formatWan(data.finalDepositAmount)}万` : ''}`,
    `存款利率: ${formatRate(data.depositRate)}`,
    `几年期存单: ${data.depositTerm || '6个月'}`,
    `存单开始日期: ${data.depositStartDate}`,
    `存单到期日期: ${data.depositEndDate}`,
    `存单编号: ${data.depositNo}`,
    `存单账号: ${data.depositAccount}`,
    '',
    '# ---------- 4. 分票明细 ----------',
    '# 有几张票就保留几组；金额合计应等于“开票金额”。',
    '[BILLS]',
    ...billLines,
  ].join('\n');
}

function generateJsonExport(data: ProjectData): string {
  return JSON.stringify(data, null, 2);
}

function downloadText(filename: string, content: string, type = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

const invoiceStatusMeta: Record<InvoiceStatus, { label: string; tone: string; message: string }> = {
  normal: {
    label: '可正常进入后续流程',
    tone: 'border-emerald-700/25 bg-emerald-50 text-emerald-900',
    message: '发票日期未超过开票日前2个月：可正常进入后续流程。',
  },
  exception_required: {
    label: '需提前发起发票例外申请',
    tone: 'border-amber-700/25 bg-amber-50 text-amber-900',
    message: '发票日期早于开票日2个月以上但不超过6个月：需提前发起发票例外申请。',
  },
  manual_review_required: {
    label: '需人工确认，不建议直接办理',
    tone: 'border-red-700/25 bg-red-50 text-red-900',
    message: '发票日期早于开票日6个月以上：不建议直接办理，请先人工确认贸易背景及例外审批可行性。',
  },
  unknown: {
    label: '待判断',
    tone: 'border-slate-700/20 bg-slate-50 text-slate-800',
    message: '请填写发票开具日期和预计开票日期后进行判断。',
  },
};

const flowSteps = [
  '额度项下合同登记',
  '下载网银影像资料',
  '中登网质押登记',
  '押品系统抵质押登记',
  '押品入库',
  '放款申请',
  '线下放款中心审批',
  '重新上传用印后质押合同',
];

// 带热气动画的咖啡小标签 —— 给"请喝杯咖啡"的位置用
const SteamyCoffee: React.FC<{ className?: string }> = ({ className }) => (
  <span className={cn('relative inline-flex h-4 w-4 items-center justify-center', className)} aria-hidden>
    <span
      className="fwe-coffee-steam absolute left-[3px] top-[-6px] h-2 w-[1.5px] rounded-full bg-[#a08566]"
      style={{ animationDelay: '0s' }}
    />
    <span
      className="fwe-coffee-steam absolute left-[7px] top-[-7px] h-2 w-[1.5px] rounded-full bg-[#a08566]"
      style={{ animationDelay: '0.45s' }}
    />
    <span
      className="fwe-coffee-steam absolute left-[11px] top-[-6px] h-2 w-[1.5px] rounded-full bg-[#a08566]"
      style={{ animationDelay: '0.9s' }}
    />
    <Coffee className="h-4 w-4 relative" />
  </span>
);

const CopyButton: React.FC<{ label?: string; text: string; onCopy: (text: string) => void; disabled?: boolean }> = ({
  label = '复制',
  text,
  onCopy,
  disabled,
}) => (
  <button
    type="button"
    disabled={disabled}
    onClick={() => onCopy(text)}
    className="inline-flex min-h-10 items-center justify-center gap-2 border border-[#24443a]/20 bg-white px-3 text-xs font-bold text-[#24443a] transition hover:border-[#24443a] disabled:cursor-not-allowed disabled:opacity-45"
  >
    <ClipboardCopy className="h-3.5 w-3.5" />
    {label}
  </button>
);

const TextBlock: React.FC<{
  title: string;
  text: string;
  onCopy: (text: string) => void;
  disabled?: boolean;
  actions?: Array<{ label: string; text: string; disabled?: boolean }>;
}> = ({ title, text, onCopy, disabled, actions }) => (
  <div className="border border-[#24443a]/12 bg-[#fffdf7] p-3">
    <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <h4 className="font-black text-[#20251f]">{title}</h4>
      <div className="flex flex-wrap gap-2">
        {(actions || [{ label: '复制', text, disabled }]).map((action) => (
          <CopyButton key={action.label} label={action.label} text={action.text} onCopy={onCopy} disabled={action.disabled ?? disabled} />
        ))}
      </div>
    </div>
    <pre className="max-h-72 overflow-auto whitespace-pre-wrap border border-[#24443a]/10 bg-white p-3 text-xs leading-5 text-[#2f372e]">
      {disabled ? '请先完成最终金额与日期确认后生成。' : text}
    </pre>
  </div>
);

const Floor: React.FC<{
  no: number;
  title: string;
  doing: string;
  need: string;
  generate: string;
  reminder?: string;
  children: React.ReactNode;
}> = ({ no, title, doing, need, generate, reminder, children }) => (
  <section className="border border-[#263d35]/15 bg-[#fbf7ef]">
    <div className="border-b border-[#263d35]/10 bg-[#f2eadc] px-4 py-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="text-[11px] font-black text-[#8a5a2f]">{no}楼</div>
          <h2 className="mt-1 text-xl font-black text-[#18201c]">{title}</h2>
        </div>
        <div className="grid gap-2 text-xs leading-5 text-[#5e675c] md:max-w-xl md:grid-cols-3">
          <p><span className="font-black text-[#1e2924]">当前步骤：</span>{doing}</p>
          <p><span className="font-black text-[#1e2924]">需要填写：</span>{need}</p>
          <p><span className="font-black text-[#1e2924]">自动生成：</span>{generate}</p>
        </div>
      </div>
      {reminder ? (
        <div className="mt-3 border border-[#9d2b2b]/20 bg-[#fff7f4] px-3 py-2 text-xs font-bold leading-5 text-[#8f2020]">
          {reminder}
        </div>
      ) : null}
    </div>
    <div className="p-4">{children}</div>
  </section>
);

const Field: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  suffix?: string;
}> = ({ label, value, onChange, type = 'text', placeholder, suffix }) => (
  <label className="grid min-w-0 gap-1 text-xs font-bold text-[#4d574c]">
    {label}
    <div className="flex min-w-0 border border-[#263d35]/15 bg-white focus-within:border-[#7b4b21]">
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-h-11 w-full min-w-0 bg-transparent px-3 text-sm font-medium text-[#1f271f] outline-none"
      />
      {suffix ? <span className="flex items-center px-3 text-xs text-[#6a7168]">{suffix}</span> : null}
    </div>
  </label>
);

// 解析"6个月" / "6 月" / "6"等输入，回退默认 6 个月
function parseTermMonths(text: string): number {
  const matched = String(text || '').match(/-?\d+(\.\d+)?/);
  if (!matched) return 6;
  const n = Math.round(Number(matched[0]));
  return Number.isFinite(n) && n > 0 ? n : 6;
}

const UnderInvoiceWorkflow: React.FC = () => {
  const toast = useToast();
  const [data, setData] = useState<ProjectData>(initialData);
  // 1 楼金额双向联动："bill" 表示开票金额是用户输入侧、存单为反算侧；"deposit" 反之。
  const [linkedSource, setLinkedSource] = useState<'bill' | 'deposit'>('bill');
  const [finalConfirmed, setFinalConfirmed] = useState(false);
  const [showTxtPreview, setShowTxtPreview] = useState(true);
  const [invoiceGameProgress, setInvoiceGameProgress] = useState(0);

  const invoiceStatus = useMemo(() => checkInvoiceStatus(data.invoiceDate, data.issueDate), [data.invoiceDate, data.issueDate]);
  const invoiceException = useMemo(() => generateInvoiceExceptionText(data), [data]);
  const quotaEmail = useMemo(() => generateQuotaReservationEmail(data), [data]);
  const rateFlow = useMemo(() => generateRateFileDistributionText(data), [data]);
  const corporateApproval = useMemo(() => generateCorporateRateApprovalText(data), [data]);
  const customerMaterial = useMemo(() => generateCustomerMaterialMessage(), []);
  const counterManager = useMemo(() => generateCounterManagerMessage(data), [data]);
  const counterCollection = useMemo(() => generateCounterCollectionChecklist(), []);
  const customerOnlineTicket = useMemo(() => generateCustomerOnlineTicketMessage(data), [data]);
  const purpose = useMemo(() => generateCreditPurpose(data), [data]);
  const remark = useMemo(() => generateCreditRemark(data), [data]);
  const mainDebt = useMemo(() => generateMainDebtDescription(data), [data]);
  const contractTexts = useMemo(() => generateGuaranteeContractTexts(data), [data]);
  const zhongdeng = useMemo(() => generateZhongdengRegistrationText(data), [data]);
  const pledgeSteps = useMemo(() => generatePledgeEntrySteps(), []);
  const submitOpinion = useMemo(() => generateSubmitOpinion(), []);
  const userTxt = useMemo(() => generateUserInputTxt(data), [data]);
  const jsonExport = useMemo(() => generateJsonExport(data), [data]);
  const fee = calcFee(data.finalBillAmount || data.preliminaryBillAmount, data.feeRate);
  const guaranteeAmount = (data.finalBillAmount || data.preliminaryBillAmount) * 1.5;
  const preliminaryDepositByBill = calcDepositForBill(data.preliminaryBillAmount, data.depositRate, data.issueDate, data.maturityDate);
  const preliminaryBillByDeposit = calcBillForDeposit(data.preliminaryDepositAmount, data.depositRate, data.issueDate, data.maturityDate);
  const finalReady = Boolean(data.finalBillAmount && data.finalDepositAmount && data.issueDate && data.maturityDate && data.depositStartDate && data.depositEndDate);
  const amountMismatch = Boolean(data.finalBillAmount && data.finalDepositAmount && data.finalBillAmount !== data.finalDepositAmount);
  const invoiceExceptionUnlocked = invoiceStatus === 'exception_required' && invoiceGameProgress >= 3;
  const businessSummaryRows = [
    ['开票金额_元', `${formatYuan(data.finalBillAmount || data.preliminaryBillAmount)} 元`],
    ['开票金额_人民币大写', toChineseCurrency(data.finalBillAmount || data.preliminaryBillAmount)],
    ['存单金额_元', `${formatYuan(data.finalDepositAmount || data.preliminaryDepositAmount)} 元`],
    ['担保金额（人民币大写）', toChineseCurrency(guaranteeAmount)],
    ['担保金额（元）', `${formatYuan(guaranteeAmount)} 元`],
    ['手续费', `${formatYuan(fee)} 元 / ${formatWan(fee)} 万元 / ${toChineseCurrency(fee)}`],
  ];
  const businessSummaryText = businessSummaryRows.map(([label, value]) => `${label}: ${value}`).join('\n');
  const allCopyText = [
    quotaEmail.fullText,
    rateFlow.fullText,
    corporateApproval.fullText,
    customerMaterial.fullText,
    counterManager.fullText,
    counterCollection.fullText,
    mainDebt,
    purpose,
    remark,
    ...contractTexts.map((item) => item.fullText),
    zhongdeng.fullText,
    pledgeSteps.fullText,
    submitOpinion.fullText,
    invoiceExceptionUnlocked ? invoiceException?.fullText || '' : '',
  ].filter(Boolean).join('\n\n---\n\n');

  const update = <K extends keyof ProjectData>(key: K, value: ProjectData[K]) => {
    setData((current) => ({ ...current, [key]: value }));
  };

  // 按 linkedSource 反算另一侧金额（实际天数 = daysBetween，由 issueDate / maturityDate 决定）
  const recomputeLinkedAmount = (current: ProjectData, source: 'bill' | 'deposit'): ProjectData => {
    if (source === 'bill') {
      const newDeposit = calcDepositForBill(current.preliminaryBillAmount, current.depositRate, current.issueDate, current.maturityDate);
      return { ...current, preliminaryDepositAmount: newDeposit || current.preliminaryDepositAmount };
    }
    const newBill = calcBillForDeposit(current.preliminaryDepositAmount, current.depositRate, current.issueDate, current.maturityDate);
    return { ...current, preliminaryBillAmount: newBill || current.preliminaryBillAmount };
  };

  // 改了银票开具日：默认按当前期限月数对日重算到期日，再按 linkedSource 反算另一侧金额
  const updateIssueDate = (value: string) => {
    setData((current) => {
      const months = parseTermMonths(current.depositTerm);
      const maturityDate = addMonths(value, months);
      const next: ProjectData = {
        ...current,
        issueDate: value,
        maturityDate,
        depositStartDate: value,
        depositEndDate: maturityDate,
      };
      return recomputeLinkedAmount(next, linkedSource);
    });
    setFinalConfirmed(false);
  };

  // 改了银票期限月数：按对日重算到期日，days 跟着 daysBetween 自然变化（183/184/...）
  const updateTermMonths = (value: string) => {
    const months = parseTermMonths(value);
    setData((current) => {
      const maturityDate = addMonths(current.issueDate, months);
      const next: ProjectData = {
        ...current,
        depositTerm: `${months}个月`,
        maturityDate,
        depositEndDate: maturityDate,
      };
      return recomputeLinkedAmount(next, linkedSource);
    });
    setFinalConfirmed(false);
  };

  // 改了银票到期日：按实际日期差重新计算（非对日、隔天、手动改都按真实差）
  const updateMaturityDate = (value: string) => {
    setData((current) => {
      const next: ProjectData = {
        ...current,
        maturityDate: value,
        depositEndDate: value,
      };
      return recomputeLinkedAmount(next, linkedSource);
    });
    setFinalConfirmed(false);
  };

  // 改了存单利率：按 linkedSource 反算另一侧
  const updateDepositRate = (value: string) => {
    const rate = parseRateInput(value);
    setData((current) => recomputeLinkedAmount({ ...current, depositRate: rate }, linkedSource));
    setFinalConfirmed(false);
  };

  // 输入开票金额：linkedSource = bill，反算并填回拟存单金额
  const updatePreliminaryBill = (value: string) => {
    const amount = parseWanInput(value);
    setLinkedSource('bill');
    setData((current) => {
      const newDeposit = calcDepositForBill(amount, current.depositRate, current.issueDate, current.maturityDate);
      return {
        ...current,
        preliminaryBillAmount: amount,
        preliminaryDepositAmount: newDeposit || (amount ? current.preliminaryDepositAmount : 0),
      };
    });
  };

  // 输入存单金额：linkedSource = deposit，反算并填回拟开票金额
  const updatePreliminaryDeposit = (value: string) => {
    const amount = parseWanInput(value);
    setLinkedSource('deposit');
    setData((current) => {
      const newBill = calcBillForDeposit(amount, current.depositRate, current.issueDate, current.maturityDate);
      return {
        ...current,
        preliminaryDepositAmount: amount,
        preliminaryBillAmount: newBill || (amount ? current.preliminaryBillAmount : 0),
      };
    });
  };

  const confirmPreliminary = () => {
    setData((current) => {
      const bill = current.preliminaryBillAmount;
      const deposit = current.preliminaryDepositAmount || bill;
      const maturityDate = current.maturityDate || calcMaturityDate(current.issueDate, 6);
      return {
        ...current,
        finalBillAmount: current.finalBillAmount || bill,
        finalDepositAmount: current.finalDepositAmount || deposit,
        maturityDate,
        depositStartDate: current.depositStartDate || current.issueDate,
        depositEndDate: current.depositEndDate || maturityDate,
      };
    });
    setTimeout(() => document.getElementById('floor-3')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  const confirmFinal = () => {
    if (!finalReady) {
      toast.warning('请先补齐最终金额和日期');
      return;
    }
    setFinalConfirmed(true);
    toast.success('最终金额和日期已确认');
  };

  const copyText = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast.success('已复制');
  };

  const updateBill = <K extends keyof BillItem>(id: string, key: K, value: BillItem[K]) => {
    setData((current) => ({
      ...current,
      bills: current.bills.map((bill) => (bill.id === id ? { ...bill, [key]: value } : bill)),
    }));
  };

  const addBill = () => {
    setData((current) => ({ ...current, bills: [...current.bills, makeBill()] }));
  };

  const removeBill = (id: string) => {
    setData((current) => ({ ...current, bills: current.bills.filter((bill) => bill.id !== id) }));
  };

  // 第 8 楼"收款人名称" ↔ 第 12 楼分票明细的 payee 双向联动
  // 8 楼字段展示的是 bills 里所有非空收款人，按顿号拼接（自动跟随 12 楼变化）
  const payeesText = useMemo(
    () => data.bills.map((bill) => bill.payee.trim()).filter(Boolean).join('、'),
    [data.bills],
  );

  // 用户在 8 楼修改"收款人名称"时，按顿号/逗号/空白拆分，回写到 bills[i].payee
  // 名称多于现有 bill 时自动追加新的空白 bill；少于时把多出来的 bill 的 payee 清空（保留账号等其它字段）
  const updatePayeesFromText = (value: string) => {
    const names = value.split(/[、，,\s]+/).map((s) => s.trim()).filter(Boolean);
    setData((current) => {
      const next = current.bills.map((bill, i) => ({
        ...bill,
        payee: i < names.length ? names[i] : '',
      }));
      // 名称比现有 bills 多时追加新的 bill，承接剩余名称
      for (let i = next.length; i < names.length; i += 1) {
        next.push({ ...makeBill(), payee: names[i] });
      }
      // 全清空时至少保留一条空白 bill，避免分票明细为空
      if (next.length === 0) next.push(makeBill());
      return { ...current, bills: next };
    });
  };

  return (
    <AppLayout title="项下开票智能帖" showBack>
      <div className="min-h-screen bg-[#f4efe5] pb-16 text-[#1f271f]">
        {/* 咖啡热气动画 keyframes —— 局部样式，不污染全局 */}
        <style>{`
          @keyframes fwe-coffee-steam-kf {
            0%   { transform: translateY(0)   scaleY(0.55); opacity: 0; }
            18%  { transform: translateY(-2px) scaleY(0.85); opacity: 0.55; }
            55%  { transform: translateY(-7px) scaleY(1);    opacity: 0.78; }
            100% { transform: translateY(-13px) scaleY(0.7); opacity: 0; }
          }
          .fwe-coffee-steam { animation: fwe-coffee-steam-kf 1.6s ease-in-out infinite; }
        `}</style>
        <div className="mx-auto max-w-6xl px-4 py-5 md:px-6 md:py-8">
          <header className="mb-4 border border-[#263d35]/15 bg-[#fffdf7] p-5">
            <div>
              <div className="mb-3 flex flex-wrap gap-2 text-[11px] font-black">
                {['银承', '存单质押', '项下开票', '对中后台', '流程指引', '测算Skill'].map((tag) => (
                  <span key={tag} className="border border-[#9b6b43]/25 bg-[#efe2cf] px-2 py-1 text-[#7b4b21]">{tag}</span>
                ))}
              </div>
              <h1 className="text-2xl font-black md:text-4xl">【项下开票实战帖】银承+存单质押全流程智能操作帖</h1>
              <div className="mt-3 flex flex-wrap gap-3 text-sm font-bold text-[#59635a]">
                <span>发帖人：湾悦城 冯工</span>
                <span>技术支持：科技 胡工</span>
              </div>
              <div className="mt-4 max-w-4xl space-y-2 text-sm leading-6 text-[#4f5c52]">
                <p>各位工友好，楼主湾悦城冯工，这一条算是给同行的"还债帖"。每次接项下开票（银承+存单质押）那一摊事，从额度预约、利率优惠流程、柜台材料、网银提票，再到合同系统、中登网、押品入库……每一步都恨不得拿小抄，少一项 OA 就被催一遍。索性把脑子里那点东西一次性全倒出来，做成这条流水帖：1 楼先测算，往下一楼一楼填，需要发的话术和系统文字直接出现在复制框里，**不用你再二次加工**。</p>
                <p>关键口径放最前面：本笔按 <b>存单质押</b> 办理，存单 <b>无需冻结</b>，不生成冻结确认书；注意事项与可复制正文是分开的，复制框里粘出来的就是成稿，别再润色一遍。</p>
                <p>使用顺序很简单：1 楼先录银票开具日 / 发票日期 / 开票金额或存单金额 → 柜台开出存单后回 7 楼补存单编号、账号 → 客户网银提票后回 7 楼补银承开票批次号 / K 开头批次号。其它楼层文案会跟着自动变好，不用你 ctrl+c / ctrl+v 跑全场。</p>
                <p className="text-[#7b4b21] font-bold">客户经理同行的辛苦我懂——这个帖子如果能帮你省去半天！减少头发的掉落！减少沟通完你的沟通你的的困惑！请请我们喝杯咖啡吧！👇</p>
              </div>
              <div className="mt-4 inline-flex items-center gap-2 border border-[#9b6b43]/25 bg-[#fff7e8] px-3 py-2.5 text-sm font-black text-[#7b4b21]">
                <SteamyCoffee />
                热乎的，请我们喝杯咖啡吧！
              </div>
            </div>
          </header>

          <div className="space-y-4">
            <Floor
              no={1}
              title="业务说明与快速测算"
              doing="客户询价时快速判断方案。"
              need="支行、开票人、开票金额或存单金额、银票期限、利率、发票日期、银票开具日。"
              generate="用开票金额反算存单，或用存单金额测算可开票金额。"
              reminder="这是 Apex 银承/存单测算小助手的简化版；不录贴现价格、加点、优质客户、提前进款、意向状态。"
            >
              <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="支行名称" value={data.branchName} onChange={(value) => update('branchName', value)} placeholder="如 科技业务部" />
                  <Field label="开票人名称" value={data.drawer} onChange={(value) => update('drawer', value)} placeholder="客户名称" />
                  <Field label="拟开票金额" value={data.preliminaryBillAmount ? String(data.preliminaryBillAmount / 10000) : ''} onChange={updatePreliminaryBill} type="number" suffix="万元" />
                  <Field label="拟存单金额" value={data.preliminaryDepositAmount ? String(data.preliminaryDepositAmount / 10000) : ''} onChange={updatePreliminaryDeposit} type="number" suffix="万元" />
                  <Field label="银票期限" value={String(parseTermMonths(data.depositTerm))} onChange={updateTermMonths} type="number" suffix="个月" placeholder="默认 6" />
                  <Field label="存单利率" value={formatRate(data.depositRate)} onChange={updateDepositRate} placeholder="1.4%" />
                  <Field label="预计银票开具日" value={data.issueDate} onChange={updateIssueDate} type="date" />
                  <Field label="银票到期日" value={data.maturityDate} onChange={updateMaturityDate} type="date" />
                  <Field label="银承项下发票开具日" value={data.invoiceDate} onChange={(value) => update('invoiceDate', value)} type="date" />
                </div>
                <div className="border border-[#24443a]/12 bg-white p-4">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-black">Apex 简化测算区</h3>
                    <a href="#/acceptance-calculator" className="inline-flex min-h-9 items-center gap-2 border border-[#24443a]/20 bg-white px-3 text-xs font-bold text-[#24443a]">
                      <ExternalLink className="h-3.5 w-3.5" />
                      打开完整测算小助手
                    </a>
                    {/* TODO: 接入 Apex 首页 → 对中后台 → 银承/存单测算小助手 */}
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div><dt className="text-xs text-[#687064]">开票人</dt><dd className="font-black">{data.drawer || '待填'}</dd></div>
                    <div><dt className="text-xs text-[#687064]">联动主输入</dt><dd className="font-black">{linkedSource === 'bill' ? '开票金额→反算存单' : '存单金额→反算开票'}</dd></div>
                    <div><dt className="text-xs text-[#687064]">拟开票金额</dt><dd className="font-black">{formatWan(data.preliminaryBillAmount)} 万</dd></div>
                    <div><dt className="text-xs text-[#687064]">拟存单金额</dt><dd className="font-black">{formatWan(data.preliminaryDepositAmount)} 万</dd></div>
                    <div><dt className="text-xs text-[#687064]">银票期限</dt><dd className="font-black">{data.depositTerm}</dd></div>
                    <div><dt className="text-xs text-[#687064]">实际天数</dt><dd className="font-black">{daysBetween(data.issueDate, data.maturityDate)} 天</dd></div>
                    <div><dt className="text-xs text-[#687064]">存单利率</dt><dd className="font-black">{formatRate(data.depositRate)}</dd></div>
                    <div><dt className="text-xs text-[#687064]">手续费率</dt><dd className="font-black">万分之五</dd></div>
                    <div><dt className="text-xs text-[#687064]">银票开具日</dt><dd className="font-black">{data.issueDate}</dd></div>
                    <div><dt className="text-xs text-[#687064]">银票到期日</dt><dd className="font-black">{data.maturityDate}</dd></div>
                  </dl>
                  <div className="mt-4 border border-[#24443a]/10 bg-[#f6f2e9] p-3 font-black">
                    银票手续费：人民币 {formatYuan(calcFee(data.preliminaryBillAmount, data.feeRate))} 元
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" onClick={() => toast.success('已完成快速测算')} className="inline-flex min-h-10 items-center gap-2 bg-[#24443a] px-4 text-sm font-bold text-white">
                      <Banknote className="h-4 w-4" />
                      快速测算
                    </button>
                    <button type="button" onClick={confirmPreliminary} className="inline-flex min-h-10 items-center gap-2 border border-[#24443a]/20 bg-white px-4 text-sm font-bold text-[#24443a]">
                      确认测算结果，进入最终金额确认
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-[#687064]">
                    客户询价时，可先向分行公司部了解近期大额存单利率政策；客户承做意向明确后，再确认当日是否可预约银承额度并发送预约邮件。
                  </p>
                </div>
              </div>
            </Floor>

            <Floor
              no={2}
              title="发票前置判断"
              doing="正式承做前判断发票日期是否合规。"
              need="发票开具日期、预计开票日期。"
              generate="正常办理、需例外申请、需人工确认三类提示。"
              reminder="发票日期早于开票日6个月以上时，不显示可正常办理。"
            >
              <div className={cn('border p-4', invoiceStatusMeta[invoiceStatus].tone)}>
                <div className="font-black">{invoiceStatusMeta[invoiceStatus].label}</div>
                <p className="mt-1 text-sm leading-6">{invoiceStatusMeta[invoiceStatus].message}</p>
              </div>
              {invoiceException ? (
                <div className="mt-3 border border-[#9b6b43]/25 bg-[#fff7e8] p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="font-black text-[#7b4b21]">我知道你急，但你先别急，容我挖个鼻屎想一想。</h3>
                      <p className="mt-1 text-sm leading-6 text-[#735b43]">
                        发票超过 2 个月、不满 6 个月时，每个月可报送例外申请；也可以走 OA 特殊流程申请。这里先做个小互动，确认你真的看到了风险口径后再放审批文案。
                      </p>
                    </div>
                    <div className="text-xs font-black text-[#7b4b21]">解锁进度 {Math.min(invoiceGameProgress, 3)} / 3</div>
                  </div>
                  <div className="mt-3 grid gap-2 md:grid-cols-3">
                    {[
                      '我确认：不是正常办理',
                      '我确认：未超过6个月',
                      '好了，给我审批文案',
                    ].map((label, index) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => setInvoiceGameProgress((current) => Math.max(current, index + 1))}
                        className={cn(
                          'min-h-10 border px-3 text-xs font-black transition',
                          invoiceGameProgress >= index + 1
                            ? 'border-[#24443a] bg-[#24443a] text-white'
                            : 'border-[#9b6b43]/25 bg-white text-[#7b4b21] hover:border-[#7b4b21]'
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  {invoiceExceptionUnlocked ? (
                    <div className="mt-3">
                      <TextBlock title={invoiceException.title} text={invoiceException.body} onCopy={copyText} />
                    </div>
                  ) : (
                    <div className="mt-3 border border-dashed border-[#9b6b43]/35 bg-white/70 p-3 text-sm font-bold text-[#7b4b21]">
                      审批文字先藏一下。按完上面三步后，会出现发送给裘丽娟、陈锘霖的例外申请文案。
                    </div>
                  )}
                </div>
              ) : null}
            </Floor>

            <Floor
              no={3}
              title="最终金额和日期确认"
              doing="锁定后续邮件、OA、合同、系统文字引用口径。"
              need="最终开票金额、最终存单金额。"
              generate="最终口径摘要，后续全部按此生成。"
              reminder="存单金额和开票金额不一致时，只提示确认，不阻断。"
            >
              <div id="floor-3" className="grid gap-3 sm:grid-cols-2">
                <Field label="最终开票金额" value={data.finalBillAmount ? String(data.finalBillAmount / 10000) : ''} onChange={(value) => { update('finalBillAmount', parseWanInput(value)); setFinalConfirmed(false); }} type="number" suffix="万元" />
                <Field label="最终存单金额" value={data.finalDepositAmount ? String(data.finalDepositAmount / 10000) : ''} onChange={(value) => { update('finalDepositAmount', parseWanInput(value)); setFinalConfirmed(false); }} type="number" suffix="万元" />
              </div>
              {amountMismatch ? (
                <div className="mt-3 border border-amber-700/25 bg-amber-50 p-3 text-sm font-bold text-amber-900">
                  请确认是否因业务需要不一致。
                </div>
              ) : null}
              <div className="mt-3 border border-[#24443a]/10 bg-white p-3 text-sm leading-6 text-[#4f5c52]">
                银票开具日、到期日、存单起止日期、利率已在 1 楼确认：{data.issueDate} 至 {data.maturityDate}，存单期限 {data.depositStartDate} 至 {data.depositEndDate}，利率 {formatRate(data.depositRate)}。此处只复核最终金额。
              </div>
              <button type="button" onClick={confirmFinal} className="mt-3 inline-flex min-h-10 items-center gap-2 bg-[#24443a] px-4 text-sm font-bold text-white">
                <Check className="h-4 w-4" />
                确认最终金额和日期
              </button>
              {finalConfirmed ? <span className="ml-3 text-sm font-bold text-emerald-800">已确认，后续文字统一引用最终口径。</span> : null}
            </Floor>

            <Floor
              no={4}
              title="额度预约邮件"
              doing="客户确认后发送银承承做申请。"
              need="依赖最终金额和日期。"
              generate="邮件标题、正文、完整邮件。"
              reminder="请上挂全额质押开票承做申请表。"
            >
              <TextBlock
                title="额度预约邮件"
                text={quotaEmail.fullText}
                onCopy={copyText}
                disabled={!finalConfirmed}
                actions={[
                  { label: '复制邮件标题', text: quotaEmail.title, disabled: !finalConfirmed },
                  { label: '复制邮件正文', text: quotaEmail.body, disabled: !finalConfirmed },
                  { label: '复制完整邮件', text: quotaEmail.fullText, disabled: !finalConfirmed },
                ]}
              />
            </Floor>

            <Floor
              no={5}
              title="利率优惠流程与对公板块审批"
              doing="发利率优惠文件分发；未走利率审批时发通用审批。"
              need="最终存单金额、存单日期、利率。"
              generate="利率流程和对公板块审批完整文字。"
              reminder="存单无需冻结，不走存单冻结确认书。本流程为存单质押，不是存单冻结。"
            >
              <div className="grid gap-3 lg:grid-cols-2">
                <TextBlock
                  title="利率优惠文件分发流程"
                  text={rateFlow.fullText}
                  onCopy={copyText}
                  disabled={!finalConfirmed}
                  actions={[
                    { label: '复制流程标题', text: rateFlow.title, disabled: !finalConfirmed },
                    { label: '复制流程正文', text: rateFlow.body, disabled: !finalConfirmed },
                    { label: '复制完整流程说明', text: rateFlow.fullText, disabled: !finalConfirmed },
                  ]}
                />
                <TextBlock
                  title="对公板块审批通用文本"
                  text={corporateApproval.fullText}
                  onCopy={copyText}
                  disabled={!finalConfirmed}
                  actions={[
                    { label: '复制审批标题', text: corporateApproval.title, disabled: !finalConfirmed },
                    { label: '复制审批正文', text: corporateApproval.body, disabled: !finalConfirmed },
                    { label: '复制完整审批内容', text: corporateApproval.fullText, disabled: !finalConfirmed },
                  ]}
                />
              </div>
              <div className="mt-3 border border-[#24443a]/15 bg-white p-3 text-sm font-bold leading-6 text-[#24443a]">
                如本笔存单利率此前尚未走利率优惠审批流程，请先发起对公板块审批流程。审批文本已包含：客户非我行关联方；不涉及关联交易；非公共资源类存款。
              </div>
            </Floor>

            <Floor
              no={6}
              title="客户材料和柜台材料提醒"
              doing="柜台办理前准备，分别发送客户和柜台，自查取件。"
              need="最终金额、存单日期、利率。"
              generate="客户材料提醒、柜台WOA、取件清单、核保拍照。"
              reminder="法人身份证复印件无需原件；存单无需冻结。"
            >
              <div className="grid gap-3 lg:grid-cols-2">
                <TextBlock title={customerMaterial.title} text={customerMaterial.body} onCopy={copyText} actions={[{ label: '复制客户材料提醒', text: customerMaterial.body }]} />
                <TextBlock title="柜台WOA提醒" text={counterManager.body} onCopy={copyText} actions={[{ label: '复制发柜台WOA提醒', text: counterManager.body }]} />
                <TextBlock title={counterCollection.title} text={counterCollection.body} onCopy={copyText} actions={[{ label: '复制柜台取件清单', text: counterCollection.body }]} />
                <TextBlock
                  title="核保拍照提醒"
                  text="请注意：客户完成存单开立后，同步安排开票材料盖章。质押合同需进行双人客户经理核保拍照，照片应体现出质人盖公章、盖私章的过程或合影。"
                  onCopy={copyText}
                  actions={[{ label: '复制核保拍照提醒', text: '请注意：客户完成存单开立后，同步安排开票材料盖章。质押合同需进行双人客户经理核保拍照，照片应体现出质人盖公章、盖私章的过程或合影。' }]}
                />
              </div>
            </Floor>

            <Floor
              no={7}
              title="柜台完成后补录存单信息，并发送客户网银提票提醒"
              doing="柜台先出存单编号和存单账号，客户提票后再出银承开票批次号。"
              need="先录存单编号、存单账号；客户提票后再录银承开票批次号/K开头批次号。"
              generate="客户网银提票提醒、主债权描述。"
              reminder="存单编号和存单账号由柜台先出；银承开票批次号不是P字号，客户提票完成后再补录。"
            >
              <p className="mb-3 text-sm leading-6 text-[#5d665a]">
                柜台购买存单后，先补录存单编号和存单账号。随后可一键生成发给客户的网银提票提醒；客户提票完成后，再补录系统生成的银承开票批次号/K开头批次号。
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="存单编号" value={data.depositNo} onChange={(value) => update('depositNo', value)} />
                <Field label="存单账号" value={data.depositAccount} onChange={(value) => update('depositAccount', value)} />
              </div>
              <div className="mt-3">
                <TextBlock title={customerOnlineTicket.title} text={customerOnlineTicket.body} onCopy={copyText} actions={[{ label: '一键发送给客户', text: customerOnlineTicket.body }]} />
              </div>
              <div className="mt-3">
                <Field label="客户提票后补录：银承开票批次号/K开头批次号" value={data.billBatchNo} onChange={(value) => update('billBatchNo', value)} />
              </div>
              <div className="mt-3">
                <TextBlock title="主债权描述" text={mainDebt} onCopy={copyText} actions={[{ label: '复制主债权描述', text: mainDebt }]} />
              </div>
            </Floor>

            <Floor
              no={8}
              title="信贷系统用途和备注"
              doing="额度项下合同登记和系统录入。"
              need="收款人名称、品名、承兑人；最终金额和日期沿用 3 楼确认结果。"
              generate="用途、备注、用途+备注。"
              reminder="收款人名称在此填写后，会自动同步到 12 楼分票明细；多个名称用顿号分隔。系统文字使用最终确认金额。"
            >
              <div className="mb-3 grid gap-3 md:grid-cols-2">
                <Field
                  label="收款人名称"
                  value={payeesText}
                  onChange={updatePayeesFromText}
                  placeholder="如：上海某科技有限公司、厦门某贸易有限公司"
                />
                <Field label="采购品名" value={data.goodsName} onChange={(value) => update('goodsName', value)} placeholder="如 锌锭等原材料" />
                <Field label="承兑人" value={data.acceptor} onChange={(value) => update('acceptor', value)} placeholder="通常同开票人" />
              </div>
              <p className="mb-3 text-xs leading-5 text-[#687064]">
                填写后，系统将自动按"用于向<b>{payeesText || '收款人名称'}</b>采购{data.goodsName || '原材料'}"格式拼接信贷系统用途；多个名称用顿号分隔，会自动按顺序填到 12 楼"分票明细"的每张票里。
              </p>
              <div className="grid gap-3 lg:grid-cols-2">
                <TextBlock title="信贷系统用途" text={purpose} onCopy={copyText} actions={[{ label: '复制用途', text: purpose }]} />
                <TextBlock
                  title="信贷系统备注"
                  text={remark}
                  onCopy={copyText}
                  actions={[
                    { label: '复制备注', text: remark },
                    { label: '复制用途+备注', text: `${purpose}\n\n${remark}` },
                  ]}
                />
              </div>
            </Floor>

            <Floor
              no={9}
              title="系统担保合同和质押合同文字"
              doing="生成担保合同、质押合同相关系统字段。"
              need="授信合同编号、质押合同编号、存单编号等。"
              generate="合同系统文字、财产描述、担保范围。"
              reminder="注意：担保合同编号、担保金额、债务履行期限、质押财产价值、存单编号必须逐项核对。存单号必须使用柜台实际开出的存单号，登记证明引入存单。"
            >
              <div className="mb-3 grid gap-3 md:grid-cols-2">
                <Field label="授信额度合同编号/主合同号码" value={data.creditContractNo} onChange={(value) => update('creditContractNo', value)} />
                <Field label="编号/质押合同编号前缀" value={data.pledgeContractNo} onChange={(value) => update('pledgeContractNo', value)} />
              </div>
              <div className="grid gap-3">
                <TextBlock
                  title="系统担保合同信息"
                  text={contractTexts[0].body}
                  onCopy={copyText}
                  actions={[
                    { label: '复制系统担保合同信息', text: contractTexts[0].body },
                    { label: '复制全部合同系统文字', text: contractTexts.map((item) => item.body).join('\n\n') },
                  ]}
                />
                <div className="grid gap-3 lg:grid-cols-2">
                  <TextBlock title="财产描述" text={contractTexts[1].body} onCopy={copyText} actions={[{ label: '复制财产描述', text: contractTexts[1].body }]} />
                  <TextBlock title="担保范围" text={contractTexts[2].body} onCopy={copyText} actions={[{ label: '复制担保范围', text: contractTexts[2].body }]} />
                </div>
              </div>
            </Floor>

            <Floor
              no={10}
              title="中登网质押登记信息"
              doing="中登网登记前核对关键字段。"
              need="最终字段、合同编号、批次号、存单信息。"
              generate="中登网/质押登记信息核对。"
              reminder="登记成功后，请截图留存；点击登记编号下载登记证明，并上传系统。上传材料大小控制在20M以内。"
            >
              <TextBlock title={zhongdeng.title} text={zhongdeng.body} onCopy={copyText} actions={[{ label: '复制中登网登记信息', text: zhongdeng.body }]} />
            </Floor>

            <Floor
              no={11}
              title="押品系统、入库、放款申请步骤"
              doing="中登网后进入押品、入库和放款流程。"
              need="无新增核心字段。"
              generate="入库流程步骤、提交意见。"
              reminder="做成简单步骤，不做复杂卡片。"
            >
              <div className="mb-4 overflow-x-auto">
                <div className="flex min-w-[900px] items-center gap-2">
                  {flowSteps.map((step, index) => (
                    <React.Fragment key={step}>
                      <div className="border border-[#24443a]/15 bg-white px-3 py-2 text-center text-xs font-black text-[#24443a]">{step}</div>
                      {index < flowSteps.length - 1 ? <ArrowRight className="h-4 w-4 shrink-0 text-[#9b6b43]" /> : null}
                    </React.Fragment>
                  ))}
                </div>
              </div>
              <div className="grid gap-3 lg:grid-cols-2">
                <TextBlock title={pledgeSteps.title} text={pledgeSteps.body} onCopy={copyText} actions={[{ label: '复制入库流程步骤', text: pledgeSteps.body }]} />
                <TextBlock title={submitOpinion.title} text={submitOpinion.body} onCopy={copyText} actions={[{ label: '复制提交意见', text: submitOpinion.body }]} />
              </div>
            </Floor>

            <Floor
              no={12}
              title="用户必填清单下载"
              doing="输出给本地自动化脚本读取的输入文件。"
              need="模板字段和分票明细。"
              generate="TXT预览、TXT下载、JSON导出。"
              reminder="TXT格式严格兼容用户必填清单_模板.txt，多张票动态生成多组[BILLS]。"
            >
              <div className="mb-3 grid gap-3 md:grid-cols-3">
                <Field label="开票人账号" value={data.drawerAccount} onChange={(value) => update('drawerAccount', value)} />
                <Field label="电子邮箱" value={data.contactEmail} onChange={(value) => update('contactEmail', value)} />
                <Field label="联系电话" value={data.contactPhone} onChange={(value) => update('contactPhone', value)} />
                <div className="md:col-span-3">
                  <Field label="联系地址" value={data.contactAddress} onChange={(value) => update('contactAddress', value)} />
                </div>
              </div>

              <div className="mb-4 border border-[#24443a]/12 bg-white p-3">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-black">分票明细</h3>
                  <button type="button" onClick={addBill} className="inline-flex min-h-10 items-center gap-2 bg-[#24443a] px-3 text-xs font-bold text-white">
                    <Plus className="h-3.5 w-3.5" />
                    加票
                  </button>
                </div>
                <div className="space-y-3">
                  {data.bills.map((bill, index) => (
                    <div key={bill.id} className="border border-[#24443a]/10 bg-[#fbf7ef] p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-black">第 {index + 1} 张</span>
                        {data.bills.length > 1 ? (
                          <button type="button" onClick={() => removeBill(bill.id)} className="text-[#9d2b2b]" aria-label="删除分票">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        ) : null}
                      </div>
                      <div className="grid gap-2 md:grid-cols-2">
                        <Field label="收款人名称" value={bill.payee} onChange={(value) => updateBill(bill.id, 'payee', value)} />
                        <Field label="金额" value={bill.amount ? String(bill.amount / 10000) : ''} onChange={(value) => updateBill(bill.id, 'amount', parseWanInput(value))} type="number" suffix="万元" />
                        <Field label="收款人账号" value={bill.payeeAccount} onChange={(value) => updateBill(bill.id, 'payeeAccount', value)} />
                        <Field label="开户行行号" value={bill.payeeBankNo} onChange={(value) => updateBill(bill.id, 'payeeBankNo', value)} />
                        <div className="md:col-span-2">
                          <Field label="开户行行名" value={bill.payeeBankName} onChange={(value) => updateBill(bill.id, 'payeeBankName', value)} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-3 flex flex-wrap gap-2">
                <button type="button" onClick={() => setShowTxtPreview((current) => !current)} className="inline-flex min-h-10 items-center gap-2 border border-[#24443a]/20 bg-white px-3 text-xs font-bold text-[#24443a]">
                  <FileArchive className="h-3.5 w-3.5" />
                  预览用户必填清单
                </button>
                <CopyButton label="复制用户必填清单" text={userTxt} onCopy={copyText} />
                <button type="button" onClick={() => downloadText(`用户必填清单_${data.drawer || '项下开票'}.txt`, userTxt)} className="inline-flex min-h-10 items-center gap-2 bg-[#24443a] px-3 text-xs font-bold text-white">
                  <Download className="h-3.5 w-3.5" />
                  下载TXT
                </button>
                <button type="button" onClick={() => downloadText(`项下开票_${data.drawer || '项目'}.json`, jsonExport, 'application/json;charset=utf-8')} className="inline-flex min-h-10 items-center gap-2 border border-[#9b6b43]/30 bg-[#efe2cf] px-3 text-xs font-bold text-[#7b4b21]">
                  <Download className="h-3.5 w-3.5" />
                  导出JSON
                </button>
              </div>
              {showTxtPreview ? (
                <pre className="max-h-96 overflow-auto whitespace-pre-wrap border border-[#24443a]/10 bg-white p-3 text-xs leading-5 text-[#2f372e]">{userTxt}</pre>
              ) : null}
            </Floor>

            <Floor
              no={13}
              title="全部可复制内容汇总"
              doing="统一收口全部可复制成稿。"
              need="无新增字段。"
              generate="关键业务信息汇总表和全部文字包。"
              reminder="注意事项单独展示，不混入复制正文。"
            >
              <div className="mb-3 border border-[#24443a]/12 bg-white p-3">
                <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="font-black">关键业务信息汇总</h3>
                  <CopyButton label="复制汇总表" text={businessSummaryText} onCopy={copyText} />
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse text-sm">
                    <tbody>
                      {businessSummaryRows.map(([label, value]) => (
                        <tr key={label} className="border-t border-[#24443a]/10 first:border-t-0">
                          <th className="w-56 bg-[#f6f2e9] px-3 py-2 text-left font-black text-[#24443a]">{label}</th>
                          <td className="px-3 py-2 font-bold text-[#2f372e]">{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="mb-3 grid gap-3 lg:grid-cols-[0.8fr_1.2fr]">
                <div className="border border-[#9d2b2b]/20 bg-[#fff7f4] p-3 text-sm leading-6 text-[#8f2020]">
                  <h3 className="mb-2 font-black">注意事项汇总</h3>
                  <p>1. 存单无需冻结，不生成冻结确认书。</p>
                  <p>2. 发票早于开票日6个月以上需人工确认，不显示可正常办理。</p>
                  <p>3. 存单编号、存单账号、银承开票批次号/K开头批次号必须在柜台完成后补录。</p>
                  <p>4. 合同编号、担保金额、期限、存单号必须逐项核对。</p>
                </div>
                <div className="flex flex-wrap items-start gap-2">
                  <CopyButton label="复制全部" text={allCopyText} onCopy={copyText} />
                  <button type="button" onClick={() => downloadText(`系统文字包_${data.drawer || '项下开票'}.txt`, allCopyText)} className="inline-flex min-h-10 items-center gap-2 bg-[#24443a] px-3 text-xs font-bold text-white">
                    <Download className="h-3.5 w-3.5" />
                    下载全部文字包
                  </button>
                </div>
              </div>
              <pre className="max-h-96 overflow-auto whitespace-pre-wrap border border-[#24443a]/10 bg-white p-3 text-xs leading-5 text-[#2f372e]">{allCopyText}</pre>
              <div className="mt-4 inline-flex items-center gap-2 border border-[#9b6b43]/25 bg-[#fff7e8] px-3 py-2.5 text-sm font-black text-[#7b4b21]">
                <SteamyCoffee />
                看到这了真不容易，请我们喝杯咖啡吧！
              </div>
            </Floor>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default UnderInvoiceWorkflow;
