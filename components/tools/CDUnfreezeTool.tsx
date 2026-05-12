/**
 * 存单解冻 一键生成工具
 * - 用户填写客户必填信息 + 支行/手工管控信息
 * - 自动生成：
 *   1) OA1：现金等价物解除质押审批流程（题目 / 正文 / 手工管控批注，分块一键复制）
 *   2) OA2：公文分发流程 — 科技业务部关于XX银承到期手工备款的申请
 *   3) 存单解冻通知书（用于柜面文书的纯文本版本，便于直接复制）
 *   4) 支行手工备款票据清单 — 模板字段（票据号、金额留空让用户继续填）
 *
 * 通用化要求：
 * - 不写死任何客户/支行/管控人员；所有差异化字段由前端表单收集。
 * - 金额按"元"录入（含千分位与小数），自动换算为"人民币X万元整"中文大写。
 * - 同时挂载在 Skills 仓库 与 场景中心 / 对中后台 下。
 */
import React, { useMemo, useState } from 'react';
import { ArrowLeft, Copy, CheckCircle2, RefreshCcw, Sparkles, Info, FileText, ListChecks, Building2, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import AppLayout from '../../src/components/layout/AppLayout';
import { cn } from '../../lib/utils';

// ─── 工具函数：金额转中文大写（万元口径） ───────────────────────────

const CN_DIGITS = '零壹贰叁肆伍陆柒捌玖';
const CN_SMALL_UNITS = ['', '拾', '佰', '仟'];
const CN_BIG_UNITS = ['', '万', '亿', '兆'];

const intToChineseUpper = (n: number): string => {
  if (n === 0) return '零';
  const fourToCn = (num: number): string => {
    let result = '';
    let zeroFlag = false;
    const s = String(num);
    const length = s.length;
    for (let i = 0; i < length; i++) {
      const d = Number(s[i]);
      const pos = length - i - 1;
      if (d === 0) {
        zeroFlag = true;
      } else {
        if (zeroFlag && result) result += '零';
        zeroFlag = false;
        result += CN_DIGITS[d] + CN_SMALL_UNITS[pos];
      }
    }
    return result;
  };
  const parts: { part: number; cn: string }[] = [];
  let unitIndex = 0;
  let cur = n;
  while (cur > 0) {
    const part = cur % 10000;
    if (part !== 0) {
      parts.push({ part, cn: fourToCn(part) + CN_BIG_UNITS[unitIndex] });
    } else {
      parts.push({ part, cn: '' });
    }
    cur = Math.floor(cur / 10000);
    unitIndex += 1;
  }
  let result = '';
  let needZero = false;
  for (let i = parts.length - 1; i >= 0; i--) {
    const { part, cn } = parts[i];
    if (part === 0) {
      needZero = true;
      continue;
    }
    if (result) {
      if (needZero || part < 1000) result += '零';
    }
    result += cn;
    needZero = false;
  }
  return result;
};

/** 输入"元"金额字符串（允许逗号 / 小数），返回万元口径中文大写。如果不是万元整数倍，返回 null。 */
const yuanToChineseUpperWan = (yuanStr: string): { ok: true; upper: string; wan: number } | { ok: false; error: string } => {
  const s = String(yuanStr || '').replace(/,/g, '').trim();
  if (!s) return { ok: false, error: '金额为空' };
  const amount = Number(s);
  if (!Number.isFinite(amount) || amount <= 0) return { ok: false, error: '金额需为正数' };
  const wan = amount / 10000;
  if (Math.abs(wan - Math.round(wan)) > 1e-6) {
    return { ok: false, error: '当前模板仅支持"人民币XX万元整"，请确认金额为万元整数倍' };
  }
  const wanInt = Math.round(wan);
  return { ok: true, upper: intToChineseUpper(wanInt), wan: wanInt };
};

const formatYuan = (s: string): string => {
  const n = Number(String(s || '').replace(/,/g, '').trim());
  if (!Number.isFinite(n)) return s;
  return n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const parseYuanNumber = (s: string): number => {
  const n = Number(String(s || '').replace(/,/g, '').trim());
  return Number.isFinite(n) ? n : 0;
};

const xmlEscape = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const formatCnDate = (value: string): string => {
  const s = value.trim();
  const m = s.match(/^(\d{4})[-/.年](\d{1,2})[-/.月](\d{1,2})/);
  if (!m) return s || new Date().toLocaleDateString('zh-CN');
  return `${m[1]}年${m[2].padStart(2, '0')}月${m[3].padStart(2, '0')}日`;
};

const cleanBranchName = (value: string): string =>
  value
    .trim()
    .replace(/^厦门银行/, '')
    .replace(/营业部$/, '')
    .trim();

const safeFilePart = (value: string): string =>
  (value || '客户').replace(/[\\/:*?"<>|]/g, '').trim() || '客户';

const downloadText = (filename: string, content: string) => {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, filename);
};

const withBusinessHall = (branchName: string): string => {
  const branch = branchName.trim();
  if (!branch) return '支行营业部';
  return branch.endsWith('营业部') ? branch : `${branch}营业部`;
};

const templateUrl = (fileName: string) =>
  `${import.meta.env.BASE_URL}templates/cd-unfreeze/${fileName}`;

const fetchTemplate = async (fileName: string): Promise<ArrayBuffer> => {
  const res = await fetch(templateUrl(fileName));
  if (!res.ok) throw new Error(`模板加载失败：${fileName}`);
  return res.arrayBuffer();
};

const replaceAll = (source: string, replacements: Record<string, string>) =>
  Object.entries(replacements).reduce((xml, [key, value]) => xml.split(key).join(xmlEscape(value)), source);

// ─── 复制按钮（与 ActionBar 风格保持一致，但本工具内自包含） ──────

const CopyChip: React.FC<{ text: string; label?: string; className?: string; full?: boolean; disabled?: boolean }> = ({ text, label = '一键复制', className, full, disabled }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    if (disabled) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button
      onClick={handleCopy}
      disabled={disabled}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border',
        disabled
          ? 'bg-neutral-100 text-neutral-300 border-neutral-100 cursor-not-allowed'
          : copied
          ? 'bg-emerald-500 text-white border-emerald-500'
          : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-400 hover:text-neutral-900',
        full && 'w-full justify-center py-2 text-xs',
        className,
      )}
    >
      {copied ? <CheckCircle2 size={13} /> : <Copy size={13} />}
      {copied ? '已复制' : label}
    </button>
  );
};

const DownloadChip: React.FC<{ label: string; onClick: () => Promise<void> | void; disabled?: boolean }> = ({ label, onClick, disabled }) => {
  const [downloading, setDownloading] = useState(false);
  const handleClick = async () => {
    if (disabled || downloading) return;
    setDownloading(true);
    try {
      await onClick();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : '文件生成失败，请检查输入后重试。');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || downloading}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border',
        disabled
          ? 'bg-neutral-100 text-neutral-300 border-neutral-100 cursor-not-allowed'
          : 'bg-neutral-900 text-white border-neutral-900 hover:bg-neutral-700',
      )}
    >
      <Download size={13} />
      {downloading ? '生成中' : label}
    </button>
  );
};

// ─── 表单字段类型 ─────────────────────────────────────────────────

type FormState = {
  customerName: string;     // 客户名称（户名）
  cdAccount: string;         // 存单账号
  cdAmountYuan: string;      // 存单金额（元）
  cdMaturityDate: string;    // 存单到期日（yyyy/MM/dd 或 yyyy-MM-dd）
  creditMaturityDate: string; // 授信到期日
  branchName: string;         // 经办支行（如：xx支行营业部）
  approverFirst: string;      // 科技业务部手工管控 - 初审
  approverFinal: string;      // 科技业务部手工管控 - 终审
  drawerName: string;         // 票据出票人（默认 = 客户名称）
};

const DEFAULT_FORM: FormState = {
  customerName: '',
  cdAccount: '',
  cdAmountYuan: '',
  cdMaturityDate: '',
  creditMaturityDate: '',
  branchName: '',
  approverFirst: '',
  approverFinal: '',
  drawerName: '',
};

// ─── 主组件 ──────────────────────────────────────────────────────

const CDUnfreezeTool: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);

  const setField = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm((prev) => ({ ...prev, [k]: v }));
  };

  // 校验 + 大写换算
  const amountResult = useMemo(() => yuanToChineseUpperWan(form.cdAmountYuan), [form.cdAmountYuan]);
  const amountUpper = amountResult.ok === true ? amountResult.upper : '';
  const amountError = amountResult.ok === false ? amountResult.error : '';
  const amountFormatted = useMemo(() => formatYuan(form.cdAmountYuan), [form.cdAmountYuan]);

  const requiredMissing = useMemo(() => {
    const miss: string[] = [];
    if (!form.customerName.trim()) miss.push('客户名称');
    if (!form.cdAccount.trim()) miss.push('存单账号');
    if (!form.cdAmountYuan.trim()) miss.push('存单金额');
    if (!form.cdMaturityDate.trim()) miss.push('存单到期日');
    if (!form.creditMaturityDate.trim()) miss.push('授信到期日');
    if (!form.branchName.trim()) miss.push('经办支行');
    return miss;
  }, [form]);

  const ready = requiredMissing.length === 0 && amountResult.ok;
  const documentMissing = useMemo(() => {
    const miss: string[] = [];
    if (!form.customerName.trim()) miss.push('客户名称');
    if (!form.cdAccount.trim()) miss.push('存单账号');
    if (!form.cdAmountYuan.trim()) miss.push('存单金额');
    if (!form.cdMaturityDate.trim()) miss.push('存单到期日');
    return miss;
  }, [form]);
  const documentReady = documentMissing.length === 0 && amountResult.ok;
  const listMissing = useMemo(() => {
    const miss: string[] = [];
    if (!form.cdAmountYuan.trim()) miss.push('存单金额');
    if (!form.cdMaturityDate.trim()) miss.push('存单到期日');
    if (!form.branchName.trim()) miss.push('经办支行');
    if (!(form.drawerName.trim() || form.customerName.trim())) miss.push('出票人或客户名称');
    return miss;
  }, [form]);
  const listReady = listMissing.length === 0 && amountResult.ok;
  const hasAnyInput = Object.values(form).some((value) => value.trim());
  const customerName = form.customerName.trim();
  const cdAccount = form.cdAccount.trim();
  const cdMaturityDate = form.cdMaturityDate.trim();
  const creditMaturityDate = form.creditMaturityDate.trim();
  const branchName = form.branchName.trim();
  const drawer = form.drawerName.trim() || customerName;
  const branchShort = cleanBranchName(form.branchName);
  const branchDept = withBusinessHall(branchName);
  const amountWanText = amountUpper ? `${amountUpper}万` : '';
  const amountFullText = amountUpper ? `人民币${amountUpper}万元整` : '';
  const manualControlText = form.approverFirst.trim() || form.approverFinal.trim()
    ? `科技业务部手工管控：${form.approverFirst.trim() ? `初审${form.approverFirst.trim()}` : '初审按流程处理'}，${form.approverFinal.trim() ? `终审${form.approverFinal.trim()}` : '终审按流程处理'}。`
    : '科技业务部手工管控：按科技业务部初审、终审流程处理。';

  // ─── 生成各类输出文本 ─────────────────────────────────────────

  // OA1：现金等价物解除质押审批流程
  const oa1Title = `科技业务部关于${customerName}存单解冻的申请`;
  const oa1Body = `户名：${customerName}，账号：${cdAccount}，金额：${amountFullText}，存单到期日${cdMaturityDate}，授信到期日${creditMaturityDate}，授信到期，申请解冻该存单归还我行授信，存单解冻时间${cdMaturityDate}。妥否，请审批！`;
  const oa1ManualControl = manualControlText;
  const oa1Full = `【流程】现金等价物解除质押审批流程\n【题目】${oa1Title}\n\n${oa1Body}\n\n${oa1ManualControl}`;

  // OA2：公文分发流程
  const oa2Title = `科技业务部关于${customerName}银承到期手工备款的申请`;
  const oa2Body = `${customerName}在我行购买存单用于质押开立银行承兑汇票，存单解冻时间${cdMaturityDate}，本笔存单到期日为${cdMaturityDate}，解冻存单归还银承，签发银票，见附件，需柜台协助处理。
1. 请${branchDept}将存单销户后全部本息划至支行的其他应付款内部账户；
2. 请营运管理部集中作业中心于到期日，通过支行其他应付款内部户进行手工备款；
3. 请${branchDept}将银票备款后剩余金额，划转至客户结算户。`;
  const oa2Full = `【流程】公文分发流程\n【题目】${oa2Title}\n\n${oa2Body}`;

  // 存单解冻通知书 — 纯文本版（基于柜台模板核心要素，便于复制粘贴）
  const cdNoticeText = `存单解冻通知书

致：${branchDept}

经审核，请贵部将存单（户名：${customerName}，账号：${cdAccount}，金额：${amountFullText}）按以下手续办理：

1. 授信未结清，同意解冻该存单，请就质押存单归还本行授信。
2. 存单解冻时间为${cdMaturityDate}，解冻时间严格为存单到期日，不得提早或延后。
3. 存单解冻后，柜面作业人员同步手工划转存单本息归还本行授信。

${manualControlText}

科技业务部
${new Date().toLocaleDateString('zh-CN')}`;

  const customerTxt = `# 客户必填

## 客户资料
- {{客户名称}}: ${customerName}
- {{存单账号}}: ${cdAccount}
- {{存单金额}}: ${form.cdAmountYuan.trim()}
- {{存单到期日}}: ${cdMaturityDate}
- {{授信到期日}}: ${creditMaturityDate}`;

  // 支行手工备款票据清单 — 按模板字段生成（票据号码 / 到期日留空）
  const billingHeader = ['序', '票据号码', '到期日', '金额', '出票人'];
  const billingRows = [
    ['1', '', '', ready ? amountFormatted : '', ready ? drawer : ''],
  ];
  const billingTabText =
    `${branchShort}需手工备款票据清单（${formatCnDate(form.cdMaturityDate)}）\n` +
    `${billingHeader.join('\t')}\n` +
    billingRows.map((r) => r.join('\t')).join('\n') +
    `\n\n备注：票据号码 / 到期日请按实际待备款票据补齐；如有多张票据，请在 Excel 中按行复制扩展。`;

  const handleReset = () => setForm(DEFAULT_FORM);

  const downloadCustomerTxt = () => {
    downloadText(`${safeFilePart(customerName)}_客户资料_存单解冻.txt`, customerTxt);
  };

  const buildNoticeDocx = async () => {
    if (!documentReady) {
      const amountMessage = form.cdAmountYuan.trim() && !amountResult.ok ? `；金额：${amountError}` : '';
      throw new Error(`请先补齐通知书必填信息：${documentMissing.join('、') || '金额'}${amountMessage}`);
    }

    const zip = await JSZip.loadAsync(await fetchTemplate('cd-unfreeze-notice.docx'));
    const documentPath = 'word/document.xml';
    const documentFile = zip.file(documentPath);
    if (!documentFile) throw new Error('存单解冻通知书模板结构异常。');

    const xml = await documentFile.async('string');
    const updatedXml = replaceAll(xml, {
      '{{客户名称}}': form.customerName.trim(),
      '{{存单账号}}': form.cdAccount.trim(),
      '{{存单金额}}': amountUpper,
      // 模板占位符名为“授信到期日”，但正文注明“解冻时间严格为存单到期日”，这里按存单到期日填。
      '{{授信到期日}}': form.cdMaturityDate.trim(),
      '科技支行': branchShort,
    });

    zip.file(documentPath, updatedXml);
    const blob = await zip.generateAsync({
      type: 'blob',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    saveAs(blob, `${safeFilePart(form.customerName)}_存单解冻通知书.docx`);
  };

  const buildBackingListXlsx = async () => {
    if (!listReady) {
      const amountMessage = form.cdAmountYuan.trim() && !amountResult.ok ? `；金额：${amountError}` : '';
      throw new Error(`请先补齐清单必填信息：${listMissing.join('、') || '金额'}${amountMessage}`);
    }

    const zip = await JSZip.loadAsync(await fetchTemplate('manual-backing-list.xlsx'));
    const sheetPath = 'xl/worksheets/sheet1.xml';
    const sheetFile = zip.file(sheetPath);
    if (!sheetFile) throw new Error('手工备款清单模板结构异常。');

    const amount = parseYuanNumber(form.cdAmountYuan);
    const title = `${branchShort}需手工备款票据清单（${formatCnDate(form.cdMaturityDate)}）`;
    let xml = await sheetFile.async('string');
    xml = xml.replace(
      /<c r="A1"[^>]*>[\s\S]*?<\/c>/,
      `<c r="A1" s="1" t="inlineStr"><is><t>${xmlEscape(title)}</t></is></c>`,
    );
    xml = xml
      .replace(/<c r="A3" s="5">[\s\S]*?<\/c>/, '<c r="A3" s="5"><v>1</v></c>')
      .replace(/<c r="B3" s="6" t="s">[\s\S]*?<\/c>/, '<c r="B3" s="6"/>')
      .replace(/<c r="C3" s="7">[\s\S]*?<\/c>/, '<c r="C3" s="7"/>')
      .replace(/<c r="D3" s="8">[\s\S]*?<\/c>/, `<c r="D3" s="8"><v>${amount}</v></c>`)
      .replace(/<c r="E3" s="5" t="s">[\s\S]*?<\/c>/, `<c r="E3" s="5" t="inlineStr"><is><t>${xmlEscape(drawer)}</t></is></c>`);
    [4, 5, 6, 7].forEach((row) => {
      xml = xml
        .replace(new RegExp(`<c r="A${row}" s="5">[\\s\\S]*?<\\/c>`), `<c r="A${row}" s="5"/>`)
        .replace(new RegExp(`<c r="B${row}" s="9" t="s">[\\s\\S]*?<\\/c>`), `<c r="B${row}" s="9"/>`)
        .replace(new RegExp(`<c r="B${row}" s="6" t="s">[\\s\\S]*?<\\/c>`), `<c r="B${row}" s="6"/>`)
        .replace(new RegExp(`<c r="C${row}" s="7">[\\s\\S]*?<\\/c>`), `<c r="C${row}" s="7"/>`)
        .replace(new RegExp(`<c r="D${row}" s="8">[\\s\\S]*?<\\/c>`), `<c r="D${row}" s="8"/>`)
        .replace(new RegExp(`<c r="E${row}" s="5" t="s">[\\s\\S]*?<\\/c>`), `<c r="E${row}" s="5"/>`);
    });

    zip.file(sheetPath, xml);
    const blob = await zip.generateAsync({
      type: 'blob',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(blob, `${safeFilePart(form.customerName)}_${formatCnDate(form.cdMaturityDate)}_${branchShort}需手工备款票据清单.xlsx`);
  };

  // ─── UI ───────────────────────────────────────────────────────

  return (
    <AppLayout title="存单解冻" showBack theme="default">
      <div className="bg-[#F5F6FA] min-h-[100dvh] pb-24">
        {/* 顶部说明 */}
        <div className="max-w-5xl mx-auto px-4 pt-5">
          <button
            onClick={() => navigate(-1)}
            className="mb-3 inline-flex items-center gap-1 text-[11px] font-bold text-neutral-500 hover:text-neutral-900"
          >
            <ArrowLeft size={14} /> 返回
          </button>
          <div className="bg-white rounded-2xl border border-neutral-200/70 shadow-sm p-5 md:p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center shadow">
                <Sparkles size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-extrabold tracking-[0.18em] uppercase text-neutral-400">对中后台 · 一键生成</p>
                <h1 className="text-xl md:text-2xl font-black tracking-tight text-neutral-900">存单解冻</h1>
                <p className="mt-1 text-[12px] text-neutral-500 font-medium leading-relaxed">
                  填写客户必填信息 + 经办支行 / 手工管控人员，一键生成两个 OA、存单解冻通知书与手工备款票据清单。所有内容支持一键复制。
                </p>
              </div>
              <button
                onClick={handleReset}
                className="hidden md:inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-neutral-200 text-[11px] font-bold text-neutral-600 hover:text-neutral-900 hover:border-neutral-400"
              >
                <RefreshCcw size={12} /> 重置
              </button>
            </div>
          </div>
        </div>

        {/* 表单 */}
        <div className="max-w-5xl mx-auto px-4 mt-4">
          <div className="bg-white rounded-2xl border border-neutral-200/70 shadow-sm p-5 md:p-6">
            <h2 className="text-sm font-extrabold text-neutral-900 mb-4 flex items-center gap-2">
              <Info size={14} className="text-blue-600" /> 客户必填信息
            </h2>
            <div className="mb-4 flex flex-wrap gap-2">
              <DownloadChip label="下载客户资料 TXT" onClick={downloadCustomerTxt} disabled={!hasAnyInput} />
              <CopyChip label="复制客户资料" text={customerTxt} disabled={!hasAnyInput} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="客户名称（户名）" required>
                <input
                  type="text"
                  value={form.customerName}
                  onChange={(e) => setField('customerName', e.target.value)}
                  placeholder="如：XX实业有限公司"
                  className={inputCls}
                />
              </Field>
              <Field label="存单账号" required>
                <input
                  type="text"
                  value={form.cdAccount}
                  onChange={(e) => setField('cdAccount', e.target.value)}
                  placeholder="如：80136100003722"
                  className={inputCls}
                />
              </Field>
              <Field label="存单金额（元，按万元整数倍）" required hint={amountResult.ok ? `≈ 人民币${amountUpper}万元整` : (form.cdAmountYuan ? amountError : '示例：48000000.00')}>
                <input
                  type="text"
                  inputMode="decimal"
                  value={form.cdAmountYuan}
                  onChange={(e) => setField('cdAmountYuan', e.target.value)}
                  placeholder="48,000,000.00"
                  className={cn(inputCls, !amountResult.ok && form.cdAmountYuan && 'border-red-300 focus:border-red-500')}
                />
              </Field>
              <Field label="存单到期日" required>
                <input
                  type="text"
                  value={form.cdMaturityDate}
                  onChange={(e) => setField('cdMaturityDate', e.target.value)}
                  placeholder="如：2026/04/29"
                  className={inputCls}
                />
              </Field>
              <Field label="授信到期日" required>
                <input
                  type="text"
                  value={form.creditMaturityDate}
                  onChange={(e) => setField('creditMaturityDate', e.target.value)}
                  placeholder="如：2026/04/29"
                  className={inputCls}
                />
              </Field>
              <Field label="经办支行（手动填写，每行不同）" required>
                <input
                  type="text"
                  value={form.branchName}
                  onChange={(e) => setField('branchName', e.target.value)}
                  placeholder="如：XX支行 / XX分行营业部"
                  className={inputCls}
                />
              </Field>
            </div>

            <h2 className="text-sm font-extrabold text-neutral-900 mt-6 mb-4 flex items-center gap-2">
              <Building2 size={14} className="text-indigo-600" /> 科技业务部手工管控（每行不同，请按本行实际填写）
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Field label="初审人">
                <input
                  type="text"
                  value={form.approverFirst}
                  onChange={(e) => setField('approverFirst', e.target.value)}
                  placeholder="如：XXX"
                  className={inputCls}
                />
              </Field>
              <Field label="终审人">
                <input
                  type="text"
                  value={form.approverFinal}
                  onChange={(e) => setField('approverFinal', e.target.value)}
                  placeholder="如：XXX"
                  className={inputCls}
                />
              </Field>
              <Field label="出票人（默认 = 客户名称）">
                <input
                  type="text"
                  value={form.drawerName}
                  onChange={(e) => setField('drawerName', e.target.value)}
                  placeholder="留空则自动填客户名称"
                  className={inputCls}
                />
              </Field>
            </div>

            {!ready && (
              <p className="mt-4 text-[11px] font-bold text-amber-600">
                {requiredMissing.length > 0 && <>还需填写：{requiredMissing.join('、')}。</>}
                {!amountResult.ok && form.cdAmountYuan && <>金额：{amountError}</>}
              </p>
            )}
          </div>
        </div>

        {/* 输出区 */}
        <div className="max-w-5xl mx-auto px-4 mt-4 space-y-4">
          {/* OA1 */}
          <OutputCard
            icon={<FileText size={16} className="text-indigo-600" />}
            badge="OA · 现金等价物解除质押审批流程"
            title={oa1Title}
            actions={
              <CopyChip label="复制 OA1 全文" text={oa1Full} disabled={!hasAnyInput} />
            }
          >
            <FieldBlock label="OA 题目" copyText={oa1Title}>
              <pre className={preCls}>{oa1Title}</pre>
            </FieldBlock>
            <FieldBlock label="OA 正文（户名 / 账号 / 金额 / 到期日 / 申请理由 / 解冻时间）" copyText={oa1Body}>
              <pre className={preCls}>{oa1Body}</pre>
            </FieldBlock>
            <FieldBlock label="科技业务部手工管控" copyText={oa1ManualControl}>
              <pre className={preCls}>{oa1ManualControl}</pre>
            </FieldBlock>
          </OutputCard>

          {/* OA2 */}
          <OutputCard
            icon={<FileText size={16} className="text-blue-600" />}
            badge="OA · 公文分发流程"
            title={oa2Title}
            actions={
              <CopyChip label="复制 OA2 全文" text={oa2Full} disabled={!hasAnyInput} />
            }
          >
            <FieldBlock label="OA 题目" copyText={oa2Title}>
              <pre className={preCls}>{oa2Title}</pre>
            </FieldBlock>
            <FieldBlock label="OA 正文（含三步柜台协助要求）" copyText={oa2Body}>
              <pre className={preCls}>{oa2Body}</pre>
            </FieldBlock>
          </OutputCard>

          {/* 存单解冻通知书 */}
          <OutputCard
            icon={<FileText size={16} className="text-emerald-600" />}
            badge="柜台文书"
            title="存单解冻通知书"
            actions={
              <div className="flex flex-wrap justify-end gap-2">
                <DownloadChip label="下载 Word" onClick={buildNoticeDocx} />
                <CopyChip label="复制全文" text={cdNoticeText} disabled={!hasAnyInput} />
              </div>
            }
          >
            <pre className={cn(preCls, 'whitespace-pre-wrap')}>{cdNoticeText}</pre>
          </OutputCard>

          {/* 票据清单模板 */}
          <OutputCard
            icon={<ListChecks size={16} className="text-amber-600" />}
            badge="清单模板"
            title="支行手工备款票据清单（模板）"
            actions={
              <div className="flex flex-wrap justify-end gap-2">
                <DownloadChip label="下载 Excel" onClick={buildBackingListXlsx} />
                <CopyChip label="复制为表格" text={billingTabText} disabled={!hasAnyInput} />
              </div>
            }
            hint="票据号码 / 到期日按要求留空；下方表格已用制表符分隔，可直接粘贴到 Excel。"
          >
            <div className="overflow-x-auto rounded-lg border border-neutral-200">
              <table className="w-full text-[12px]">
                <thead className="bg-neutral-50 text-neutral-600">
                  <tr>
                    {billingHeader.map((h) => (
                      <th key={h} className="px-3 py-2 text-left font-bold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {billingRows.map((row, ri) => (
                    <tr key={ri} className="border-t border-neutral-100">
                      {row.map((c, ci) => (
                        <td key={ci} className="px-3 py-2 text-neutral-800">
                          {c}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </OutputCard>
        </div>

        {/* 底部小贴士 */}
        <div className="max-w-5xl mx-auto px-4 mt-4">
          <div className="rounded-xl bg-blue-50/70 border border-blue-100 px-4 py-3 text-[11px] text-blue-900 leading-relaxed font-medium">
            提示：本工具不存储任何客户信息，所有内容仅在本机生成并由你手动复制至 OA / Excel。如金额不是万元整数倍，请先与客户经理确认；如手工管控人员变动，请直接修改对应字段后重新复制。
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

// ─── 子组件 ────────────────────────────────────────────────────

const inputCls =
  'w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg text-[13px] font-medium text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200/60 transition-all';

const preCls =
  'whitespace-pre-wrap text-[12.5px] font-medium text-neutral-800 bg-neutral-50 border border-neutral-200 rounded-lg p-3 leading-relaxed';

const Field: React.FC<{ label: string; required?: boolean; hint?: string; children: React.ReactNode }> = ({ label, required, hint, children }) => (
  <label className="block">
    <span className="text-[11px] font-extrabold text-neutral-700 mb-1.5 inline-flex items-center gap-1">
      {label}
      {required && <span className="text-red-500">*</span>}
    </span>
    {children}
    {hint && <span className="block text-[10px] mt-1 text-neutral-400 font-medium">{hint}</span>}
  </label>
);

const OutputCard: React.FC<{
  icon: React.ReactNode;
  badge: string;
  title: string;
  actions?: React.ReactNode;
  hint?: string;
  children: React.ReactNode;
}> = ({ icon, badge, title, actions, hint, children }) => (
  <div className="bg-white rounded-2xl border border-neutral-200/70 shadow-sm">
    <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3 border-b border-neutral-100">
      <div className="min-w-0">
        <p className="text-[10px] font-extrabold tracking-[0.15em] uppercase text-neutral-400 flex items-center gap-1.5">
          {icon}
          {badge}
        </p>
        <h3 className="text-[15px] md:text-base font-extrabold text-neutral-900 mt-1 leading-snug break-words">{title}</h3>
      </div>
      <div className="shrink-0">{actions}</div>
    </div>
    <div className="p-5 space-y-3">
      {children}
      {hint && <p className="text-[10.5px] text-neutral-400 font-medium leading-relaxed">{hint}</p>}
    </div>
  </div>
);

const FieldBlock: React.FC<{ label: string; copyText: string; children: React.ReactNode }> = ({ label, copyText, children }) => (
  <div>
    <div className="flex items-center justify-between mb-1.5">
      <span className="text-[10.5px] font-extrabold tracking-[0.12em] uppercase text-neutral-500">{label}</span>
      <CopyChip text={copyText} label="复制" />
    </div>
    {children}
  </div>
);

export default CDUnfreezeTool;
