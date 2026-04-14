/**
 * ProductScenePage — 产品场景化实战页面
 *
 * 将长融保/长易担等产品拆成两个核心视角：
 *   - 对客户：产品卖点、营销话术、可直接发客户的内容、材料清单入口
 *   - 对审查：检核表、审查说明模板、授信上报模板、可复制内容
 *
 * 数据来源：content/businessGuideProducts.ts → product.scenes
 * 后续接入数据库时，只需替换数据源，本组件渲染逻辑不变。
 */
import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Users, ShieldCheck, Copy, Check, ChevronRight, ArrowRight,
  MessageSquare, FileText, ClipboardList, AlertTriangle, Sparkles,
  CheckCircle2, Ban, HelpCircle, ListChecks,
} from 'lucide-react';
import { cn } from '../lib/utils';
import AppLayout from '../src/components/layout/AppLayout';
import { BUSINESS_GUIDE_PRODUCTS } from '../content/businessGuideProducts';
import type { ProductGuideCard, ProductSceneCustomer, ProductSceneReview } from '../types';

/* ─── Copy helper ─── */
const useCopy = () => {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    });
  };
  return { copied, copy };
};

/* ─── 对客户 Tab ─── */
const CustomerTab: React.FC<{ product: ProductGuideCard; scene: ProductSceneCustomer }> = ({ product, scene }) => {
  const { copied, copy } = useCopy();
  const navigate = useNavigate();
  const messagingPack = product.messagingPack;
  const highlights = messagingPack?.oneLineSellingPoint
    ? [messagingPack.oneLineSellingPoint, ...scene.highlights].slice(0, 5)
    : scene.highlights;
  const marketingEntry = messagingPack?.marketingEntryPoints?.[0]?.content || scene.marketingEntry;
  const customerScripts = messagingPack?.directCustomerScripts?.length
    ? messagingPack.directCustomerScripts.map((item) => ({
        label: item.title,
        content: item.content,
      }))
    : scene.scripts;
  const customerFaq = messagingPack?.commonQA?.length
    ? messagingPack.commonQA.map((item) => ({
        q: item.question,
        a: item.answer,
        prohibited: item.prohibited,
      }))
    : scene.faq.map((item) => ({ ...item, prohibited: undefined }));
  const canSay = messagingPack?.canSay || [];
  const shouldNotSayDead = messagingPack?.shouldNotSayDead || [];

  return (
    <div className="space-y-3 sm:space-y-6">
      {/* 产品卖点 */}
      <section className="bg-white rounded-xl border border-brand-border/5 p-3 sm:rounded-2xl sm:p-5 shadow-sm">
        <div className="flex items-center gap-1.5 mb-2 sm:mb-3">
          <Sparkles size={12} className="text-brand-gold shrink-0" />
          <h3 className="text-[11px] sm:text-xs font-bold text-brand-dark">核心卖点</h3>
        </div>
        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 sm:gap-2">
          {highlights.map((h, i) => (
            <div key={i} className="flex items-start gap-1.5 p-2 sm:p-3 bg-brand-light-gray/30 rounded-lg sm:rounded-xl">
              <CheckCircle2 size={12} className="text-emerald-500 mt-0.5 shrink-0" />
              <span className="text-[11px] sm:text-xs text-brand-dark font-medium leading-snug">{h}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 营销切入 */}
      <section className="bg-white rounded-xl border border-brand-border/5 p-3 sm:rounded-2xl sm:p-5 shadow-sm">
        <div className="flex items-center gap-1.5 mb-2 sm:mb-3">
          <MessageSquare size={12} className="text-apple-blue shrink-0" />
          <h3 className="text-[11px] sm:text-sm font-bold text-brand-dark">营销切入点</h3>
        </div>
        <p className="text-[11px] sm:text-xs text-brand-gray font-medium leading-snug sm:leading-relaxed bg-apple-blue/5 rounded-lg sm:rounded-xl p-2.5 sm:p-4 border border-apple-blue/10">
          {marketingEntry}
        </p>
      </section>

      {/* 可直接发客户的话术 */}
      <section className="bg-white rounded-xl border border-brand-border/5 p-3 sm:rounded-2xl sm:p-5 shadow-sm">
        <div className="flex items-center gap-1.5 mb-3 sm:mb-4">
          <FileText size={12} className="text-apple-purple shrink-0" />
          <h3 className="text-[11px] sm:text-sm font-bold text-brand-dark">话术模板（可复制发客户）</h3>
        </div>
        <div className="space-y-2 sm:space-y-3">
          {customerScripts.map((s, i) => (
            <div key={i} className="bg-brand-light-gray/30 rounded-lg sm:rounded-xl p-2.5 sm:p-4 border border-brand-border/5 relative group">
              <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                <span className="text-[9px] sm:text-[10px] font-bold text-brand-gold uppercase tracking-widest">{s.label}</span>
                <button
                  onClick={() => copy(s.content, `script-${i}`)}
                  className="flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-brand-gray hover:text-apple-blue transition-colors"
                >
                  {copied === `script-${i}` ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} />}
                  {copied === `script-${i}` ? '已复制' : '复制'}
                </button>
              </div>
              <p className="text-[11px] sm:text-xs text-brand-dark font-medium leading-snug sm:leading-relaxed">{s.content}</p>
            </div>
          ))}
        </div>
      </section>

      {(canSay.length || shouldNotSayDead.length) ? (
        <section className="grid grid-cols-1 gap-3 sm:gap-4">
          {canSay.length ? (
            <div className="bg-white rounded-xl border border-brand-border/5 p-3 sm:rounded-2xl sm:p-5 shadow-sm">
              <div className="flex items-center gap-1.5 mb-2 sm:mb-4">
                <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                <h3 className="text-[11px] sm:text-sm font-bold text-brand-dark">这些话可以直接讲</h3>
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                {canSay.map((item, index) => (
                  <div key={index} className="rounded-lg bg-emerald-50/70 px-2.5 sm:px-4 py-2 sm:py-3 text-[11px] sm:text-xs font-medium leading-snug sm:leading-relaxed text-emerald-700">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {shouldNotSayDead.length ? (
            <div className="bg-white rounded-xl border border-red-100 p-3 sm:rounded-2xl sm:p-5 shadow-sm">
              <div className="flex items-center gap-1.5 mb-2 sm:mb-4">
                <AlertTriangle size={12} className="text-red-500 shrink-0" />
                <h3 className="text-[11px] sm:text-sm font-bold text-red-700">这些话不要说死</h3>
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                {shouldNotSayDead.map((item, index) => (
                  <div key={index} className="rounded-lg bg-red-50 px-2.5 sm:px-4 py-2 sm:py-3 text-[11px] sm:text-xs font-medium leading-snug sm:leading-relaxed text-red-600">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      {/* 客户高频问答 */}
      <section className="bg-white rounded-xl border border-brand-border/5 p-3 sm:rounded-2xl sm:p-5 shadow-sm">
        <div className="flex items-center gap-1.5 mb-3 sm:mb-4">
          <HelpCircle size={12} className="text-orange-500 shrink-0" />
          <h3 className="text-[11px] sm:text-sm font-bold text-brand-dark">客户高频问答</h3>
        </div>
        <div className="space-y-2 sm:space-y-3">
          {customerFaq.map((f, i) => (
            <div key={i} className="bg-brand-light-gray/20 rounded-lg sm:rounded-xl p-2.5 sm:p-4">
              <p className="text-[11px] sm:text-xs font-bold text-brand-dark mb-1 sm:mb-1.5 leading-snug">Q: {f.q}</p>
              <p className="text-[11px] sm:text-xs text-brand-gray font-medium leading-snug sm:leading-relaxed">A: {f.a}</p>
              {'prohibited' in f && f.prohibited ? (
                <p className="mt-1.5 sm:mt-2 text-[10px] sm:text-[11px] font-medium leading-snug text-red-500">不要说死：{f.prohibited}</p>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      {/* 材料清单入口 */}
      <section className="bg-brand-dark rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[11px] sm:text-sm font-bold text-white mb-0.5 sm:mb-1">材料清单中心</h3>
            <p className="text-[10px] sm:text-[11px] text-white/60 font-medium leading-snug">{scene.materialsIntro}</p>
          </div>
          <button
            onClick={() => navigate('/material-checklist?type=credit')}
            className="shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 bg-white text-brand-dark rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold hover:bg-brand-gold hover:text-white transition-all flex items-center gap-1 sm:gap-1.5"
          >
            进入清单 <ArrowRight size={12} />
          </button>
        </div>
      </section>
    </div>
  );
};

/* ─── 对审查 Tab ─── */
const ReviewTab: React.FC<{ product: ProductGuideCard; scene: ProductSceneReview }> = ({ product, scene }) => {
  const { copied, copy } = useCopy();
  const navigate = useNavigate();
  const messagingPack = product.messagingPack;
  const reviewScripts = messagingPack?.reviewSubmissionScripts || [];
  const forbiddenList = messagingPack?.forbiddenCommitments?.length ? messagingPack.forbiddenCommitments : scene.forbidden;
  const fastTrackTips = messagingPack?.fastTrackTips || [];

  return (
    <div className="space-y-3 sm:space-y-6">
      {/* 检核表 */}
      <section className="bg-white rounded-xl border border-brand-border/5 p-3 sm:rounded-2xl sm:p-5 shadow-sm">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <div className="flex items-center gap-1.5">
            <ClipboardList size={12} className="text-apple-blue shrink-0" />
            <h3 className="text-[11px] sm:text-xs font-bold text-brand-dark">授信上报检核表</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/checklist-generator?product=${product.id}`)}
              className="flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-apple-blue hover:underline transition-colors"
            >
              <ArrowRight size={10} /> 进入生成器
            </button>
            <button
              onClick={() => copy(scene.checklist.map((c, i) => `${i + 1}. ${c}`).join('\n'), 'checklist')}
              className="flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-brand-gray hover:text-apple-blue transition-colors"
            >
              {copied === 'checklist' ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} />}
              {copied === 'checklist' ? '已复制' : '复制'}
            </button>
          </div>
        </div>
        <div className="space-y-1.5 sm:space-y-2">
          {scene.checklist.map((c, i) => (
            <label key={i} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-brand-light-gray/30 rounded-lg sm:rounded-xl cursor-pointer hover:bg-brand-light-gray/50 transition-colors group">
              <input type="checkbox" className="mt-0.5 rounded border-brand-border/20 text-apple-blue focus:ring-apple-blue/20" />
              <span className="text-[11px] sm:text-xs text-brand-dark font-medium leading-snug sm:leading-relaxed">{c}</span>
            </label>
          ))}
        </div>
      </section>

      {reviewScripts.length ? (
        <section className="bg-white rounded-xl border border-brand-border/5 p-3 sm:rounded-2xl sm:p-5 shadow-sm">
          <div className="flex items-center gap-1.5 mb-3 sm:mb-4">
            <FileText size={12} className="text-apple-purple shrink-0" />
            <h3 className="text-[11px] sm:text-sm font-bold text-brand-dark">对审查可直接复制的话术</h3>
          </div>
          <div className="space-y-2 sm:space-y-3">
            {reviewScripts.map((item, index) => (
              <div key={item.code} className="bg-brand-light-gray/30 rounded-lg sm:rounded-xl p-2.5 sm:p-4 border border-brand-border/5">
                <div className="mb-1.5 sm:mb-2 flex items-center justify-between gap-3">
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-brand-gold">{item.title}</span>
                  <button
                    onClick={() => copy(item.content, `review-script-${index}`)}
                    className="flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-brand-gray hover:text-apple-blue transition-colors"
                  >
                    {copied === `review-script-${index}` ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} />}
                    {copied === `review-script-${index}` ? '已复制' : '复制'}
                  </button>
                </div>
                <p className="text-[11px] sm:text-xs text-brand-dark font-medium leading-snug sm:leading-relaxed">{item.content}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* 审查说明模板 */}
      <section className="bg-white rounded-xl border border-brand-border/5 p-3 sm:rounded-2xl sm:p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-1.5">
            <FileText size={12} className="text-apple-purple shrink-0" />
            <h3 className="text-[11px] sm:text-sm font-bold text-brand-dark">审查说明模板</h3>
          </div>
          <button
            onClick={() => copy(scene.reviewTemplate, 'review-tpl')}
            className="flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-brand-gray hover:text-apple-blue transition-colors"
          >
            {copied === 'review-tpl' ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} />}
            {copied === 'review-tpl' ? '已复制' : '复制'}
          </button>
        </div>
        <pre className="text-[10px] sm:text-[11px] text-brand-dark font-mono leading-snug sm:leading-relaxed whitespace-pre-wrap bg-brand-light-gray/30 rounded-lg sm:rounded-xl p-2.5 sm:p-4 border border-brand-border/5 max-h-80 overflow-y-auto">
          {scene.reviewTemplate}
        </pre>
      </section>

      {/* 授信上报内容模板 */}
      <section className="bg-white rounded-xl border border-brand-border/5 p-3 sm:rounded-2xl sm:p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={12} className="text-emerald-500 shrink-0" />
            <h3 className="text-[11px] sm:text-sm font-bold text-brand-dark">授信上报内容</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/checklist-generator?product=${product.id}`)}
              className="flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-emerald-600 hover:underline transition-colors"
            >
              <ArrowRight size={10} /> 生成器
            </button>
            <button
              onClick={() => copy(scene.creditReportTemplate, 'credit-tpl')}
              className="flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-brand-gray hover:text-apple-blue transition-colors"
            >
              {copied === 'credit-tpl' ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} />}
              {copied === 'credit-tpl' ? '已复制' : '复制'}
            </button>
          </div>
        </div>
        <pre className="text-[10px] sm:text-[11px] text-brand-dark font-mono leading-snug sm:leading-relaxed whitespace-pre-wrap bg-brand-light-gray/30 rounded-lg sm:rounded-xl p-2.5 sm:p-4 border border-brand-border/5 max-h-80 overflow-y-auto">
          {scene.creditReportTemplate}
        </pre>
      </section>

      {/* 审查常见问题 */}
      <section className="bg-white rounded-xl border border-brand-border/5 p-3 sm:rounded-2xl sm:p-5 shadow-sm">
        <div className="flex items-center gap-1.5 mb-3 sm:mb-4">
          <HelpCircle size={12} className="text-orange-500 shrink-0" />
          <h3 className="text-[11px] sm:text-sm font-bold text-brand-dark">审查常见问题</h3>
        </div>
        <div className="space-y-2 sm:space-y-3">
          {scene.reviewFAQ.map((f, i) => (
            <div key={i} className="bg-brand-light-gray/20 rounded-lg sm:rounded-xl p-2.5 sm:p-4">
              <p className="text-[11px] sm:text-xs font-bold text-brand-dark mb-1 sm:mb-1.5 leading-snug">Q: {f.q}</p>
              <p className="text-[11px] sm:text-xs text-brand-gray font-medium leading-snug sm:leading-relaxed">A: {f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 禁止用语 */}
      <section className="bg-red-50/50 rounded-xl border border-red-100 p-3 sm:rounded-2xl sm:p-5">
        <div className="flex items-center gap-1.5 mb-2 sm:mb-3">
          <AlertTriangle size={12} className="text-red-500 shrink-0" />
          <h3 className="text-[11px] sm:text-sm font-bold text-red-700">禁止用语</h3>
        </div>
        <div className="space-y-1 sm:space-y-1.5">
          {forbiddenList.map((f, i) => (
            <div key={i} className="flex items-center gap-2">
              <Ban size={10} className="text-red-400 shrink-0" />
              <span className="text-[11px] sm:text-xs text-red-600 font-medium">{f}</span>
            </div>
          ))}
        </div>
      </section>

      {fastTrackTips.length ? (
        <section className="bg-emerald-50/60 rounded-xl border border-emerald-100 p-3 sm:rounded-2xl sm:p-5">
          <div className="flex items-center gap-1.5 mb-2 sm:mb-3">
            <Sparkles size={12} className="text-emerald-600 shrink-0" />
            <h3 className="text-[11px] sm:text-sm font-bold text-emerald-700">提速推进提醒</h3>
          </div>
          <div className="space-y-1.5 sm:space-y-2">
            {fastTrackTips.map((item, index) => (
              <div key={index} className="rounded-lg sm:rounded-xl bg-white/70 px-2.5 sm:px-4 py-2 sm:py-3 text-[11px] sm:text-xs font-medium leading-snug sm:leading-relaxed text-emerald-700">
                {item}
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
};

/* ─── Main Page ─── */
const ProductScenePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const productId = searchParams.get('product') || 'chang_rong_bao';
  const initialTab = (searchParams.get('scene') as 'customer' | 'review') || 'customer';
  const [activeTab, setActiveTab] = useState<'customer' | 'review'>(initialTab);

  // 从统一 config 读取产品（后续替换为 API 调用）
  const product = useMemo(
    () => BUSINESS_GUIDE_PRODUCTS.find((p) => p.id === productId),
    [productId],
  );

  useEffect(() => {
    const scene = searchParams.get('scene');
    if (scene === 'customer' || scene === 'review') {
      setActiveTab(scene);
    }
  }, [searchParams]);

  if (!product || !product.scenes) {
    return (
      <AppLayout title="产品场景" showBack>
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-6">
          <div className="text-5xl mb-4 opacity-20">📋</div>
          <h2 className="text-lg font-bold text-brand-dark mb-2">暂无场景数据</h2>
          <p className="text-sm text-brand-gray mb-6">该产品尚未配置场景化内容</p>
          <button onClick={() => navigate(-1)} className="px-6 py-2.5 bg-brand-dark text-white rounded-xl text-xs font-bold">
            返回
          </button>
        </div>
      </AppLayout>
    );
  }

  const TABS = [
    { id: 'customer' as const, label: '对客户', icon: Users, desc: '话术 · 卖点 · 材料' },
    { id: 'review' as const, label: '对审查', icon: ShieldCheck, desc: '检核 · 模板 · 上报' },
  ];

  return (
    <AppLayout title={`${product.name} · 实战场景`} showBack>
      <div className="pb-16 bg-brand-offwhite min-h-screen">
        {/* Header */}
        <header className="px-4 pt-6 pb-3 sm:px-6 sm:pt-8 sm:pb-4">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2 py-0.5 bg-brand-gold/10 text-brand-gold text-[8px] font-bold uppercase tracking-widest rounded-full border border-brand-gold/20">
              {product.category}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-brand-dark tracking-tight mb-1">{product.name}</h1>
          <p className="text-xs text-brand-gray font-medium opacity-70">{product.overview}</p>
        </header>

        {/* Quick Actions — 两个独立大 CTA */}
        <div className="px-4 sm:px-6 mb-4 grid grid-cols-2 gap-3">
          {/* CTA 1: 生成检核表 */}
          <button
            onClick={() => navigate(`/checklist-generator?product=${product.id}&mode=checklist`)}
            className="flex flex-col items-start gap-2 bg-brand-dark text-white rounded-2xl p-4 hover:opacity-90 active:scale-95 transition-all shadow-lg"
          >
            <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center">
              <ListChecks size={18} className="text-brand-gold" />
            </div>
            <div>
              <p className="text-[13px] font-bold leading-snug">生成检核表</p>
              <p className="text-[10px] text-white/50 mt-0.5 leading-tight">材料 · 准入 · 核查</p>
            </div>
          </button>
          {/* CTA 2: 生成授信方案 */}
          <button
            onClick={() => navigate(`/checklist-generator?product=${product.id}&mode=creditplan`)}
            className="flex flex-col items-start gap-2 bg-white text-brand-dark rounded-2xl p-4 border border-brand-border/10 hover:bg-brand-light-gray/50 active:scale-95 transition-all shadow-sm"
          >
            <div className="w-9 h-9 bg-brand-gold/10 rounded-xl flex items-center justify-center">
              <FileText size={18} className="text-brand-dark" />
            </div>
            <div>
              <p className="text-[13px] font-bold leading-snug text-brand-dark">生成授信方案</p>
              <p className="text-[10px] text-brand-gray/50 mt-0.5 leading-tight">报告 · 摘要 · 上报</p>
            </div>
          </button>
        </div>

        {/* Tab Switch */}
        <div className="px-4 mb-4 sm:px-6 sm:mb-6 sticky top-16 z-40 backdrop-blur-md py-2 sm:py-3 bg-brand-offwhite/80">
          <div className="flex gap-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex-1 flex items-center gap-2 px-3 py-2.5 rounded-lg sm:rounded-xl text-left transition-all border',
                  activeTab === tab.id
                    ? 'bg-white border-brand-border/10 shadow-sm'
                    : 'bg-brand-light-gray/30 border-transparent hover:bg-white/60',
                )}
              >
                <tab.icon size={14} className={cn(activeTab === tab.id ? 'text-brand-dark' : 'text-brand-gray/50')} />
                <div>
                  <p className={cn('text-xs font-bold', activeTab === tab.id ? 'text-brand-dark' : 'text-brand-gray')}>{tab.label}</p>
                  <p className="text-[8px] sm:text-[9px] text-brand-gray/60 font-medium hidden sm:block">{tab.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-4 sm:px-6">
          {activeTab === 'customer' ? (
            <CustomerTab product={product} scene={product.scenes.customer} />
          ) : (
            <ReviewTab product={product} scene={product.scenes.review} />
          )}
        </div>

        {/* Bottom Actions */}
        <div className="px-4 sm:px-6 mt-6 sm:mt-8 grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
          <button
            onClick={() => navigate(`/checklist-generator?product=${product.id}`)}
            className="py-3 bg-brand-dark text-white rounded-xl text-xs font-bold hover:bg-brand-dark/90 transition-colors flex items-center justify-center gap-1.5"
          >
            <ListChecks size={14} /> 生成检核表+授信方案
          </button>
          <button
            onClick={() => navigate(`/business-guide?product=${product.id}`)}
            className="py-3 bg-white border border-brand-border/10 rounded-xl text-xs font-bold text-brand-dark hover:bg-brand-light-gray transition-colors flex items-center justify-center gap-1.5"
          >
            查看完整打法 <ChevronRight size={14} />
          </button>
          <button
            onClick={() => navigate('/material-checklist?type=credit')}
            className="py-3 bg-white border border-brand-border/10 rounded-xl text-xs font-bold text-brand-dark hover:bg-brand-light-gray transition-colors flex items-center justify-center gap-1.5"
          >
            材料清单 <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </AppLayout>
  );
};

export default ProductScenePage;
