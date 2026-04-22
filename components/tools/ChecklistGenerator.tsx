import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Clipboard, Download, Eye, FileBarChart, FileText, Package, Sparkles } from 'lucide-react';
import { saveAs } from 'file-saver';
import AppLayout from '../../src/components/layout/AppLayout';
import { cn } from '../../lib/utils';
import { useToast } from '../../src/components/common/Toast';
import {
  BOOLEAN_FIELD_COPY,
  CHANG_YI_DAN_ONLY_BOOLEAN_KEYS,
  OPTIONAL_BOOLEAN_FIELD_COPY,
  buildChecklistArtifacts,
  buildChecklistWordDoc,
  buildCreditPlanWordDoc,
  BooleanChoice,
  DEFAULT_FORM_DATA,
  ENTITY_OPTIONS,
  GeneratorFormData,
  INDUSTRY_OPTIONS,
  PAY_METHOD_OPTIONS,
  PRODUCT_OPTIONS,
  ProductType,
  REPAY_METHOD_OPTIONS,
  sanitizeDataForProduct,
  validateGeneratorData,
} from './checklist-generator/logic';

const STORAGE_KEY = 'checklist_generator_v2';

const inputClass = 'mt-1 w-full rounded-lg border border-brand-border/20 bg-brand-offwhite px-3 py-2 text-xs outline-none focus:border-brand-dark transition-colors';
const labelClass = 'text-[10px] font-bold uppercase tracking-widest text-brand-gray';

function yesNoLabel(value: BooleanChoice): string {
  if (value === null) return '未选择';
  return value ? '是' : '否';
}

const ChecklistGenerator: React.FC = () => {
  const [searchParams] = useSearchParams();
  const toast = useToast();
  const initialProduct = searchParams.get('product') === 'chang_rong_bao' ? 'chang_rong_bao' : 'chang_yi_dan';

  const [product, setProduct] = useState<ProductType>(initialProduct);
  const [info, setInfo] = useState<GeneratorFormData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return sanitizeDataForProduct(initialProduct, DEFAULT_FORM_DATA);
    try {
      return sanitizeDataForProduct(initialProduct, { ...DEFAULT_FORM_DATA, ...JSON.parse(saved) });
    } catch {
      return sanitizeDataForProduct(initialProduct, DEFAULT_FORM_DATA);
    }
  });
  const [hasPreview, setHasPreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewTab, setPreviewTab] = useState<'checklist' | 'creditPlan'>('checklist');
  const [mobileTab, setMobileTab] = useState<'form' | 'preview'>('form');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [validationMessages, setValidationMessages] = useState<Record<string, string[]>>({});

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(info));
  }, [info]);

  const artifacts = useMemo(() => buildChecklistArtifacts(product, info), [product, info]);

  const updateField = <K extends keyof GeneratorFormData>(key: K, value: GeneratorFormData[K]) => {
    setInfo((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'hasMultipleDrawdowns' && value !== true) {
        next.hasFiledEachDrawdown = null;
      }
      return next;
    });
  };

  const updateBreakthroughReason = (key: string, value: string) => {
    setInfo((prev) => ({
      ...prev,
      breakthroughReasons: { ...prev.breakthroughReasons, [key]: value },
    }));
  };

  const updateAnswerOverride = (key: string, value: string) => {
    setInfo((prev) => ({
      ...prev,
      answerOverrides: { ...prev.answerOverrides, [key]: value },
    }));
  };

  const breakthroughRows = useMemo(
    () => [...artifacts.accessRows, ...artifacts.specialRows, ...artifacts.over300Rows, ...artifacts.schemeRows]
      .filter((row) => row.answer.includes('需突破')),
    [artifacts],
  );

  const validationList = useMemo(
    () => Object.entries(validationMessages).flatMap(([field, messages]) => messages.map((message) => ({ field, message }))),
    [validationMessages],
  );

  const coreFieldsFilled = [
    info.enterpriseName.trim(),
    info.legalRep.trim(),
    info.actualController.trim(),
    info.fusionBaseRating.trim(),
    info.currentApplyAmount.trim() || info.creditAmount.trim(),
    info.creditTerm.trim(),
    info.fundPurpose.trim(),
  ].filter(Boolean).length;

  const handleGeneratePreview = (): boolean => {
    const issues = validateGeneratorData(product, info);
    if (issues.length > 0) {
      const next = issues.reduce<Record<string, string[]>>((acc, issue) => {
        acc[issue.field] = [...(acc[issue.field] || []), issue.message];
        return acc;
      }, {});
      setValidationMessages(next);
      setShowAdvanced(true);
      setMobileTab('form');
      toast.error(issues[0].message);
      return false;
    }
    setValidationMessages({});
    setHasPreview(true);
    return true;
  };

  const handleDownloadChecklist = async () => {
    const issues = validateGeneratorData(product, info);
    if (issues.length > 0) {
      const next = issues.reduce<Record<string, string[]>>((acc, issue) => {
        acc[issue.field] = [...(acc[issue.field] || []), issue.message];
        return acc;
      }, {});
      setValidationMessages(next);
      toast.error(issues[0].message);
      return;
    }
    setIsGenerating(true);
    try {
      const blob = await buildChecklistWordDoc(product, info);
      saveAs(blob, `${info.enterpriseName || '企业'}_${artifacts.productName}业务检核表.docx`);
    } catch (error) {
      console.error(error);
      toast.error('检核表生成失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadCreditPlan = async () => {
    const issues = validateGeneratorData(product, info);
    if (issues.length > 0) {
      const next = issues.reduce<Record<string, string[]>>((acc, issue) => {
        acc[issue.field] = [...(acc[issue.field] || []), issue.message];
        return acc;
      }, {});
      setValidationMessages(next);
      toast.error(issues[0].message);
      return;
    }
    setIsGenerating(true);
    try {
      const blob = await buildCreditPlanWordDoc(product, info);
      saveAs(blob, `${info.enterpriseName || '企业'}_${artifacts.productName}授信方案.docx`);
    } catch (error) {
      console.error(error);
      toast.error('授信方案生成失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadAll = async () => {
    const issues = validateGeneratorData(product, info);
    if (issues.length > 0) {
      const next = issues.reduce<Record<string, string[]>>((acc, issue) => {
        acc[issue.field] = [...(acc[issue.field] || []), issue.message];
        return acc;
      }, {});
      setValidationMessages(next);
      toast.error(issues[0].message);
      return;
    }
    setIsGenerating(true);
    try {
      const [checklistBlob, creditPlanBlob] = await Promise.all([
        buildChecklistWordDoc(product, info),
        buildCreditPlanWordDoc(product, info),
      ]);
      saveAs(checklistBlob, `${info.enterpriseName || '企业'}_${artifacts.productName}业务检核表.docx`);
      setTimeout(() => saveAs(creditPlanBlob, `${info.enterpriseName || '企业'}_${artifacts.productName}授信方案.docx`), 500);
    } catch (error) {
      console.error(error);
      toast.error('文件生成失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  const renderRowEditor = (title: string, rows: typeof artifacts.accessRows) => (
    <div className="mb-4 rounded-xl border border-brand-border/10 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h4 className="text-xs font-black text-brand-dark">{title}</h4>
        <span className="text-[10px] font-bold text-brand-gray">人工改写会自动带出【人工修改】标记</span>
      </div>
      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.key} className="rounded-lg border border-brand-border/10 bg-brand-offwhite/50 p-3">
            <div className="mb-1 text-[11px] leading-relaxed text-brand-dark">{row.label}</div>
            <textarea
              rows={3}
              value={info.answerOverrides[row.key] ?? row.answer}
              onChange={(event) => updateAnswerOverride(row.key, event.target.value)}
              className={`${inputClass} resize-none bg-white`}
            />
          </div>
        ))}
      </div>
    </div>
  );

  const fieldClass = <K extends keyof GeneratorFormData>(key: K) =>
    cn(inputClass, validationMessages[key]?.length ? 'border-red-400 bg-red-50' : '');

  const renderFieldError = (key: keyof GeneratorFormData | string) =>
    validationMessages[key]?.length ? <div className="mt-1 text-[10px] font-medium text-red-600">{validationMessages[key][0]}</div> : null;

  const renderBooleanSelect = (
    key: keyof GeneratorFormData,
    label: string,
    options?: { optional?: boolean; disabled?: boolean },
  ) => (
    <div key={String(key)}>
      <label className={labelClass}>{label}</label>
      <select
        value={info[key] === null ? '' : String(info[key])}
        onChange={(event) => {
          const nextValue = event.target.value === '' ? null : event.target.value === 'true';
          updateField(key, nextValue as GeneratorFormData[typeof key]);
        }}
        disabled={options?.disabled}
        className={cn(
          fieldClass(key),
          options?.disabled && 'cursor-not-allowed bg-brand-offwhite/60 text-brand-gray',
        )}
      >
        <option value="">{options?.optional ? '未选择（可留空）' : '请选择'}</option>
        <option value="true">是</option>
        <option value="false">否</option>
      </select>
      {renderFieldError(key)}
    </div>
  );

  const switchProduct = (nextProduct: ProductType) => {
    setProduct(nextProduct);
    setInfo((prev) => sanitizeDataForProduct(nextProduct, prev));
    setValidationMessages({});
    setHasPreview(false);
    setMobileTab('form');
  };

  const renderCreditPlanPreview = () => (
    <div className="overflow-hidden rounded-xl border border-brand-border/10 bg-white shadow-sm">
      <div className="flex items-center justify-between bg-brand-dark px-5 py-3">
        <span className="text-sm font-black text-white">授信方案（{artifacts.productName}）</span>
        <span className="text-[10px] font-mono text-white/60">{info.enterpriseName || '—'}</span>
      </div>
      <div className="max-h-[60vh] space-y-1 overflow-y-auto p-4">
        {artifacts.creditPlanText.split('\n').map((line, index) => {
          if (!line.trim()) return <div key={index} className="h-2" />;
          const isHeading = ['授信申请人', '授信方案（', '担保方式', '资金用途', '贷款支用条件', '合同限制性条款', '贷后管理'].some((key) => line.startsWith(key));
          if (isHeading) {
            return (
              <div key={index} className="pt-2">
                <span className="border-b-2 border-brand-gold pb-0.5 text-xs font-black text-brand-dark">{line}</span>
              </div>
            );
          }
          return <p key={index} className="text-[12px] leading-relaxed text-brand-dark/90">{line}</p>;
        })}
      </div>
    </div>
  );

  const renderPreviewContent = () => (
    <>
      <div className="mb-3 flex items-center gap-2 text-[11px] text-brand-gray">
        <Sparkles size={12} className="shrink-0 text-brand-gold" />
        已按模板结构生成预览。产品不适用模块会自动删除，共同条款与报审路径保持模板原样。
      </div>

      <div className="mb-4 flex gap-1 rounded-lg bg-brand-offwhite p-1">
        <button
          onClick={() => setPreviewTab('checklist')}
          className={cn(
            'flex-1 rounded-md py-2 text-xs font-bold transition-all',
            previewTab === 'checklist' ? 'bg-white text-brand-dark shadow-sm' : 'text-brand-gray',
          )}
        >
          <span className="inline-flex items-center gap-1.5">
            <FileText size={12} />
            检核表预览
          </span>
        </button>
        <button
          onClick={() => setPreviewTab('creditPlan')}
          className={cn(
            'flex-1 rounded-md py-2 text-xs font-bold transition-all',
            previewTab === 'creditPlan' ? 'bg-white text-brand-dark shadow-sm' : 'text-brand-gray',
          )}
        >
          <span className="inline-flex items-center gap-1.5">
            <FileBarChart size={12} />
            授信方案预览
          </span>
        </button>
      </div>

      {previewTab === 'checklist' ? (
        <>
          {renderRowEditor('（一）业务项目准入条件检视', artifacts.accessRows)}
          {product === 'chang_yi_dan' && renderRowEditor('（二）长易担业务的特殊准入要求（长融保业务无需检视）', artifacts.specialRows)}
          {product === 'chang_yi_dan' && artifacts.over300Rows.length > 0 && renderRowEditor('8、单户授信额度高于300万元且非按揭类项目的需满足以下要求', artifacts.over300Rows)}
          {renderRowEditor(product === 'chang_rong_bao' ? '1、长融保业务' : '2、长易担业务', artifacts.schemeRows)}
          {renderRowEditor('长融保与长易担共同遵循条款', artifacts.commonRows)}

          <div className="rounded-xl border border-brand-border/10 bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-xs font-black text-brand-dark">报审路径</h4>
            </div>
            <div className="space-y-2 text-[11px] leading-relaxed text-brand-dark">
              <div>四、报审路径：与增信基金额度合控管理。以下场景可通过小企业条线申报：</div>
              {artifacts.approvalRows.map((row) => (
                <div key={row.key}>{row.label}</div>
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-brand-border/10 bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-xs font-black text-brand-dark">文本预览</h4>
              <button
                onClick={() => navigator.clipboard.writeText(artifacts.checklistText)}
                className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-gray hover:text-brand-dark"
              >
                <Clipboard size={10} />
                复制全文
              </button>
            </div>
            <pre className="max-h-[40vh] whitespace-pre-wrap overflow-y-auto rounded-lg bg-brand-offwhite p-3 font-mono text-[11px] leading-5 text-brand-dark">
              {artifacts.checklistText}
            </pre>
          </div>
        </>
      ) : (
        <div className="space-y-3">
          {renderCreditPlanPreview()}
          <div className="rounded-xl border border-brand-border/10 bg-brand-offwhite/50 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[10px] font-bold text-brand-gray">原始文本</span>
              <button
                onClick={() => navigator.clipboard.writeText(artifacts.creditPlanText)}
                className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-gray hover:text-brand-dark"
              >
                <Clipboard size={10} />
                复制全文
              </button>
            </div>
            <pre className="max-h-[30vh] whitespace-pre-wrap overflow-y-auto font-mono text-[10px] leading-4 text-brand-dark/70">
              {artifacts.creditPlanText}
            </pre>
          </div>
        </div>
      )}

      <div className="mt-4 overflow-hidden rounded-xl border border-brand-border/10 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-brand-border/10 px-4 py-3">
          <Download size={13} className="text-brand-gold" />
          <span className="text-xs font-black text-brand-dark">导出文件</span>
        </div>
        <div className="grid grid-cols-1 gap-2 p-3 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <div className="px-1 text-[9px] font-bold uppercase tracking-widest text-brand-gray">检核表</div>
            <button
              onClick={() => navigator.clipboard.writeText(artifacts.checklistText)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-offwhite px-3 py-2 text-xs font-bold text-brand-dark transition-colors hover:bg-brand-border/10"
            >
              <Clipboard size={11} />
              复制文本
            </button>
            <button
              onClick={handleDownloadChecklist}
              disabled={isGenerating}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-dark px-3 py-2 text-xs font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <Download size={11} />
              {isGenerating ? '生成中...' : '下载 Word'}
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="px-1 text-[9px] font-bold uppercase tracking-widest text-brand-gray">授信方案</div>
            <button
              onClick={() => navigator.clipboard.writeText(artifacts.creditPlanText)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-offwhite px-3 py-2 text-xs font-bold text-brand-dark transition-colors hover:bg-brand-border/10"
            >
              <Clipboard size={11} />
              复制文本
            </button>
            <button
              onClick={handleDownloadCreditPlan}
              disabled={isGenerating}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-dark px-3 py-2 text-xs font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <Download size={11} />
              {isGenerating ? '生成中...' : '下载 Word'}
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="px-1 text-[9px] font-bold uppercase tracking-widest text-brand-gray">一键全部</div>
            <button
              onClick={handleDownloadAll}
              disabled={isGenerating}
              className="flex min-h-[4.5rem] flex-1 items-center justify-center gap-1.5 rounded-lg bg-brand-dark px-4 py-2 text-xs font-bold text-white shadow-md transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <Package size={14} />
              {isGenerating ? '生成中...' : '一键下载全部文件'}
            </button>
          </div>
        </div>
      </div>
    </>
  );

  const renderCoreFields = () => (
    <>
      <div className="mb-3 text-[10px] font-black uppercase tracking-widest text-brand-dark">A层：基础必填信息</div>
      <div className="grid grid-cols-2 gap-2.5">
        <div className="col-span-2">
          <label className={labelClass}>授信申请人名称</label>
          <input
            value={info.enterpriseName}
            onChange={(event) => updateField('enterpriseName', event.target.value)}
            className={fieldClass('enterpriseName')}
            placeholder="XX有限公司"
          />
          {renderFieldError('enterpriseName')}
        </div>
        <div>
          <label className={labelClass}>法定代表人</label>
          <input
            value={info.legalRep}
            onChange={(event) => updateField('legalRep', event.target.value)}
            className={fieldClass('legalRep')}
            placeholder="姓名"
          />
          {renderFieldError('legalRep')}
        </div>
        <div>
          <label className={labelClass}>实际控制人</label>
          <input
            value={info.actualController}
            onChange={(event) => updateField('actualController', event.target.value)}
            className={fieldClass('actualController')}
            placeholder="姓名"
          />
          {renderFieldError('actualController')}
        </div>
        <div>
          <label className={labelClass}>企业类型</label>
          <select value={info.entityType} onChange={(event) => updateField('entityType', event.target.value as GeneratorFormData['entityType'])} className={inputClass}>
            {ENTITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>行业类型</label>
          <select value={info.industryType} onChange={(event) => updateField('industryType', event.target.value as GeneratorFormData['industryType'])} className={inputClass}>
            {INDUSTRY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>融合基础评级</label>
          <input
            value={info.fusionBaseRating}
            onChange={(event) => updateField('fusionBaseRating', event.target.value)}
            className={fieldClass('fusionBaseRating')}
            placeholder="例如 B级"
          />
          {renderFieldError('fusionBaseRating')}
        </div>
        <div>
          <label className={labelClass}>企业成立日期/年份</label>
          <input
            value={info.establishmentDate}
            onChange={(event) => updateField('establishmentDate', event.target.value)}
            className={fieldClass('establishmentDate')}
            placeholder="2020-06 或 2020年6月"
          />
          {renderFieldError('establishmentDate')}
        </div>
        <div>
          <label className={labelClass}>本次申请金额（万元）</label>
          <input
            value={info.currentApplyAmount}
            onChange={(event) => updateField('currentApplyAmount', event.target.value)}
            className={fieldClass('currentApplyAmount')}
            placeholder="500"
          />
          {renderFieldError('currentApplyAmount')}
        </div>
        <div>
          <label className={labelClass}>授信方案金额（万元）</label>
          <input
            value={info.creditAmount}
            onChange={(event) => updateField('creditAmount', event.target.value)}
            className={fieldClass('creditAmount')}
            placeholder="默认可与本次申请金额一致"
          />
          {renderFieldError('creditAmount')}
        </div>
        <div>
          <label className={labelClass}>授信期限</label>
          <input
            value={info.creditTerm}
            onChange={(event) => updateField('creditTerm', event.target.value)}
            className={fieldClass('creditTerm')}
            placeholder="3年 / 36个月"
          />
          {renderFieldError('creditTerm')}
        </div>
        <div>
          <label className={labelClass}>资金用途</label>
          <input
            value={info.fundPurpose}
            onChange={(event) => updateField('fundPurpose', event.target.value)}
            className={fieldClass('fundPurpose')}
            placeholder="经营周转 / 购买设备及原材料"
          />
          {renderFieldError('fundPurpose')}
        </div>
      </div>
    </>
  );

  const renderAdvancedFields = () => (
    <>
      <div className="mt-4 mb-3 text-[10px] font-black uppercase tracking-widest text-brand-dark">B层：必须用于测算的数据输入</div>
      <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] leading-relaxed text-amber-800">
        金额口径统一按“万元”填写。输入“元”会直接拦截，避免测算结果按错误单位放大。
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label className={labelClass}>上一年度纳税信用等级</label>
          <input value={info.taxCreditLevel} onChange={(event) => updateField('taxCreditLevel', event.target.value)} className={fieldClass('taxCreditLevel')} placeholder="A/B/C/M/D" />
          {renderFieldError('taxCreditLevel')}
        </div>
        <div>
          <label className={labelClass}>申请授信前12个月缴税总额（万元）</label>
          <input value={info.taxAmount12m} onChange={(event) => updateField('taxAmount12m', event.target.value)} className={fieldClass('taxAmount12m')} placeholder="20" />
          {renderFieldError('taxAmount12m')}
        </div>
        <div>
          <label className={labelClass}>授信敞口总额（万元）</label>
          <input value={info.creditExposureTotal} onChange={(event) => updateField('creditExposureTotal', event.target.value)} className={fieldClass('creditExposureTotal')} placeholder="500" />
          {renderFieldError('creditExposureTotal')}
        </div>
        <div>
          <label className={labelClass}>报税收入（万元）</label>
          <input value={info.taxRevenue12m} onChange={(event) => updateField('taxRevenue12m', event.target.value)} className={fieldClass('taxRevenue12m')} placeholder="2000" />
          {renderFieldError('taxRevenue12m')}
        </div>
        <div>
          <label className={labelClass}>最新一期资产总额（万元）</label>
          <input value={info.latestAssetTotal} onChange={(event) => updateField('latestAssetTotal', event.target.value)} className={fieldClass('latestAssetTotal')} placeholder="2000" />
          {renderFieldError('latestAssetTotal')}
        </div>
        <div>
          <label className={labelClass}>最新一期负债总额（万元）</label>
          <input value={info.latestLiabilityTotal} onChange={(event) => updateField('latestLiabilityTotal', event.target.value)} className={fieldClass('latestLiabilityTotal')} placeholder="1000" />
          {renderFieldError('latestLiabilityTotal')}
        </div>
        <div className="col-span-2">
          <label className={labelClass}>最新一期资产负债率（可选，资产/负债为空时使用）</label>
          <input value={info.latestAssetLiabilityRatio} onChange={(event) => updateField('latestAssetLiabilityRatio', event.target.value)} className={fieldClass('latestAssetLiabilityRatio')} placeholder="50" />
          {renderFieldError('latestAssetLiabilityRatio')}
        </div>
        <div>
          <label className={labelClass}>民间投资专项计划既有授信额度（万元）</label>
          <input value={info.existingMinjianPlanCreditAmount} onChange={(event) => updateField('existingMinjianPlanCreditAmount', event.target.value)} className={fieldClass('existingMinjianPlanCreditAmount')} placeholder="0" />
          {renderFieldError('existingMinjianPlanCreditAmount')}
        </div>
        {product === 'chang_yi_dan' && (
          <>
            <div>
              <label className={labelClass}>他行长易担已获批金额（万元）</label>
              <input value={info.otherBankChangYiDanAmount} onChange={(event) => updateField('otherBankChangYiDanAmount', event.target.value)} className={fieldClass('otherBankChangYiDanAmount')} placeholder="0" />
              {renderFieldError('otherBankChangYiDanAmount')}
            </div>
            <div>
              <label className={labelClass}>中小担所有批量担保业务既有额度（万元）</label>
              <input value={info.existingBatchGuaranteeCreditAmount} onChange={(event) => updateField('existingBatchGuaranteeCreditAmount', event.target.value)} className={fieldClass('existingBatchGuaranteeCreditAmount')} placeholder="0" />
              {renderFieldError('existingBatchGuaranteeCreditAmount')}
            </div>
          </>
        )}
        <div>
          <label className={labelClass}>借款人在中小担业务融资担保责任余额（万元）</label>
          <input value={info.zxdBusinessResponsibilityBalance} onChange={(event) => updateField('zxdBusinessResponsibilityBalance', event.target.value)} className={fieldClass('zxdBusinessResponsibilityBalance')} placeholder="0" />
          {renderFieldError('zxdBusinessResponsibilityBalance')}
        </div>
        <div>
          <label className={labelClass}>关联方在中小担融资担保责任余额（万元）</label>
          <input value={info.relatedPartyResponsibilityBalance} onChange={(event) => updateField('relatedPartyResponsibilityBalance', event.target.value)} className={fieldClass('relatedPartyResponsibilityBalance')} placeholder="0" />
          {renderFieldError('relatedPartyResponsibilityBalance')}
        </div>
        <div>
          <label className={labelClass}>中小担净资产（扣除对担保公司投资，万元）</label>
          <input value={info.zxdNetAsset} onChange={(event) => updateField('zxdNetAsset', event.target.value)} className={fieldClass('zxdNetAsset')} placeholder="10000" />
          {renderFieldError('zxdNetAsset')}
        </div>
      </div>

      <div className="mt-4 mb-3 text-[10px] font-black uppercase tracking-widest text-brand-dark">方案落字补充</div>
      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label className={labelClass}>配偶姓名</label>
          <input value={info.spouseName} onChange={(event) => updateField('spouseName', event.target.value)} className={inputClass} placeholder="可选" />
        </div>
        <div>
          <label className={labelClass}>贷款支用方式</label>
          <select value={info.payMethod} onChange={(event) => updateField('payMethod', event.target.value as GeneratorFormData['payMethod'])} className={inputClass}>
            {PAY_METHOD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>还本方式</label>
          <select value={info.repayMethod} onChange={(event) => updateField('repayMethod', event.target.value as GeneratorFormData['repayMethod'])} className={inputClass}>
            {REPAY_METHOD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>利率表述</label>
          <input value={info.rateExpression} onChange={(event) => updateField('rateExpression', event.target.value)} className={inputClass} />
        </div>
        {info.repayMethod === 'quarterly' && (
          <div>
            <label className={labelClass}>每季度归还本金（万元）</label>
            <input value={info.quarterlyRepayAmount} onChange={(event) => updateField('quarterlyRepayAmount', event.target.value)} className={fieldClass('quarterlyRepayAmount')} placeholder="5" />
            {renderFieldError('quarterlyRepayAmount')}
          </div>
        )}
        {info.repayMethod === 'monthly' && (
          <div>
            <label className={labelClass}>每月归还本金（万元）</label>
            <input value={info.monthlyRepayAmount} onChange={(event) => updateField('monthlyRepayAmount', event.target.value)} className={fieldClass('monthlyRepayAmount')} placeholder="5" />
            {renderFieldError('monthlyRepayAmount')}
          </div>
        )}
        <div className="col-span-2">
          <label className={labelClass}>其他担保方式补充</label>
          <input value={info.extraGuarantee} onChange={(event) => updateField('extraGuarantee', event.target.value)} className={inputClass} placeholder="例如：追加抵押物、保证人等" />
        </div>
      </div>

      <div className="mt-4 mb-3 text-[10px] font-black uppercase tracking-widest text-brand-dark">必须逐项确认的核查项</div>
      <div className="mb-2 text-[11px] text-brand-gray">这些字段默认不再预设为合规，未选择会阻止生成和导出。</div>
      <div className="grid gap-2 md:grid-cols-2">
        {BOOLEAN_FIELD_COPY.filter((item) =>
          product === 'chang_yi_dan' || !CHANG_YI_DAN_ONLY_BOOLEAN_KEYS.includes(item.key)
        ).map((item) => renderBooleanSelect(item.key, item.label))}
      </div>

      <div className="mt-4 mb-3 text-[10px] font-black uppercase tracking-widest text-brand-dark">补充判断项</div>
      <div className="grid gap-2 md:grid-cols-2">
        {OPTIONAL_BOOLEAN_FIELD_COPY.filter((item) =>
          product === 'chang_yi_dan' || !['hasMultipleDrawdowns', 'hasFiledEachDrawdown'].includes(String(item.key))
        ).map((item) => {
          const disabled = item.key === 'hasFiledEachDrawdown' && info.hasMultipleDrawdowns !== true;
          return renderBooleanSelect(item.key, item.label, { optional: true, disabled });
        })}
      </div>

      {breakthroughRows.length > 0 && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="mb-2 text-[10px] font-black uppercase tracking-widest text-amber-700">已触发“需突破”</div>
          <div className="space-y-3">
            {breakthroughRows.map((row) => (
              <div key={row.key}>
                <div className="mb-1 text-[11px] leading-relaxed text-amber-900">{row.label}</div>
                <textarea
                  rows={2}
                  value={info.breakthroughReasons[row.key] ?? ''}
                  onChange={(event) => updateBreakthroughReason(row.key, event.target.value)}
                  className={`${inputClass} resize-none bg-white`}
                  placeholder="请填写突破理由，系统会自动带入检核表落字"
                />
                {renderFieldError(row.key)}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );

  return (
    <AppLayout title={`${artifacts.productName} - 检核表与方案生成器`} showBack>
      <div className="mx-auto max-w-7xl px-4 py-4 pb-24 sm:px-6 sm:py-6">
        <div className="mb-4 flex items-center gap-3">
          <h1 className="text-lg font-black text-brand-dark sm:text-xl">{artifacts.productName} · 模板驱动生成器</h1>
          <span className="hidden rounded-md bg-brand-offwhite px-2 py-1 text-[10px] font-bold text-brand-gray sm:inline">
            按模板生成检核表 + 授信方案，不保留无关模块
          </span>
        </div>

        <div className="mb-4 flex gap-2">
          {PRODUCT_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => switchProduct(option.value)}
              className={cn(
                'flex-1 rounded-lg border py-2.5 text-xs font-bold transition-all',
                product === option.value
                  ? 'border-brand-dark bg-brand-dark text-white'
                  : 'border-brand-border/20 bg-white text-brand-gray hover:bg-brand-offwhite',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        {validationList.length > 0 && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="mb-2 text-[10px] font-black uppercase tracking-widest text-red-700">待补充或修正</div>
            <div className="space-y-1 text-[11px] leading-relaxed text-red-700">
              {validationList.slice(0, 8).map((item, index) => (
                <div key={`${item.field}-${index}`}>{item.message}</div>
              ))}
              {validationList.length > 8 && <div>其余 {validationList.length - 8} 项请继续下拉查看字段红框提示。</div>}
            </div>
          </div>
        )}

        <div className="lg:hidden">
          <div className="mb-4 flex gap-1 rounded-lg bg-brand-offwhite p-1">
            <button
              onClick={() => setMobileTab('form')}
              className={cn('flex-1 rounded-md py-2.5 text-sm font-bold transition-all', mobileTab === 'form' ? 'bg-white text-brand-dark shadow-sm' : 'text-brand-gray')}
            >
              填写信息
            </button>
            <button
              onClick={() => setMobileTab('preview')}
              className={cn('relative flex-1 rounded-md py-2.5 text-sm font-bold transition-all', mobileTab === 'preview' ? 'bg-white text-brand-dark shadow-sm' : 'text-brand-gray')}
            >
              查看结果
              {hasPreview && <span className="absolute right-2 top-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />}
            </button>
          </div>

          {mobileTab === 'form' ? (
            <div className="space-y-3">
              <div className="rounded-xl border border-brand-border/10 bg-white p-4 shadow-sm">
                {renderCoreFields()}
                <button
                  onClick={() => {
                    const ok = handleGeneratePreview();
                    if (ok) setMobileTab('preview');
                  }}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-dark py-3.5 text-sm font-bold text-white shadow-lg transition-opacity hover:opacity-90"
                >
                  <Sparkles size={16} />
                  生成检核表 + 授信方案
                </button>
              </div>

              <button
                onClick={() => setShowAdvanced((value) => !value)}
                className="flex w-full items-center justify-between rounded-xl border border-brand-border/10 bg-white px-4 py-3 text-xs font-bold text-brand-dark shadow-sm"
              >
                <span>展开 B 层测算数据与核查项</span>
                <span className="text-[10px] text-brand-gray">{showAdvanced ? '收起 ▲' : '展开 ▼'}</span>
              </button>

              {showAdvanced && (
                <div className="rounded-xl border border-brand-border/10 bg-white p-4 shadow-sm">
                  {renderAdvancedFields()}
                </div>
              )}
            </div>
          ) : (
            <div>
              {hasPreview ? (
                renderPreviewContent()
              ) : (
                <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-brand-border/10 bg-white">
                  <Eye size={36} className="mb-3 text-brand-border" />
                  <p className="px-6 text-center text-sm font-bold text-brand-gray">先填写信息并生成预览</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="hidden gap-5 lg:flex">
          <div className="w-[24rem] shrink-0">
            <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto rounded-xl border border-brand-border/10 bg-white p-4 shadow-sm">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-brand-dark">
                <Sparkles size={14} className="text-brand-gold" />
                输入模型
              </h3>
              <div className="mb-3">
                <div className="mb-1 flex items-center justify-between text-[10px] text-brand-gray">
                  <span>核心信息 {coreFieldsFilled}/7</span>
                  <span>{artifacts.productName}</span>
                </div>
                <div className="h-1 overflow-hidden rounded-full bg-brand-offwhite">
                  <div className="h-full rounded-full bg-brand-dark transition-all" style={{ width: `${(coreFieldsFilled / 7) * 100}%` }} />
                </div>
              </div>
              {renderCoreFields()}
              {renderAdvancedFields()}
              <button
                onClick={handleGeneratePreview}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-dark py-3 text-sm font-bold text-white shadow-lg transition-opacity hover:opacity-90"
              >
                <Eye size={16} />
                生成预览
              </button>
            </div>
          </div>

          <div className="min-w-0 flex-1">
            {hasPreview ? (
              renderPreviewContent()
            ) : (
              <div className="flex h-80 flex-col items-center justify-center rounded-xl border border-dashed border-brand-border/10 bg-white">
                <Eye size={40} className="mb-3 text-brand-border" />
                <p className="px-6 text-center text-sm font-bold text-brand-gray">填写 A 层基础信息和 B 层测算数据后，点击“生成预览”</p>
                <p className="mt-2 px-6 text-center text-[11px] text-brand-gray">预览会固定按模板生成，长融保不显示长易担特殊准入，长易担只保留长易担授信方案条款。</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-brand-border/10 bg-white p-4 shadow-sm">
          <div className="mb-2 text-[10px] font-black uppercase tracking-widest text-brand-dark">当前关键开关</div>
          <div className="grid gap-2 text-[11px] text-brand-dark sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-brand-offwhite/60 px-3 py-2">产品类型：{artifacts.productName}</div>
            <div className="rounded-lg bg-brand-offwhite/60 px-3 py-2">行业类型：{info.industryType === 'wholesale_retail' ? '批发零售' : '其他行业'}</div>
            <div className="rounded-lg bg-brand-offwhite/60 px-3 py-2">按揭类项目：{yesNoLabel(info.isMortgageProject)}</div>
            <div className="rounded-lg bg-brand-offwhite/60 px-3 py-2">是否触发 8.1-8.4：{artifacts.needsOver300Review ? '是' : '否'}</div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ChecklistGenerator;
