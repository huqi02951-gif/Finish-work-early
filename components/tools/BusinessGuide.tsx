import React, { useState, useEffect, useCallback } from 'react';
import {
  ChevronRight,
  ChevronDown,
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
  Ban,
  RefreshCcw,
  Star,
  LogOut,
  Eye,
  ClipboardCheck,
  Scale,
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import AppLayout from '../../src/components/layout/AppLayout';
import { ProductGuideCard } from '../../types';
import { BUSINESS_GUIDE_PRODUCTS } from '../../content/businessGuideProducts';
import { INDUSTRIES, SCENARIOS, PERSONAS } from '../../content/businessGuideGuideData';
import { getProductWorkspace, getProductActions, WorkspaceAction, WorkspaceSection } from '../../content/productConfig';
import { getProducts } from '../../src/services/contentApi';

// --- Component ---

const BusinessGuide: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [guideType, setGuideType] = useState<'product' | 'industry' | 'scenario'>('product');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [policyExpanded, setPolicyExpanded] = useState(false);
  const [productCards, setProductCards] = useState<ProductGuideCard[]>([...BUSINESS_GUIDE_PRODUCTS].sort((a, b) => {
    // 长易担放在长融保前面
    if (a.id === 'chang_yi_dan') return -1;
    if (b.id === 'chang_yi_dan') return 1;
    return 0;
  }));

  // Workflow collapsible sections state
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    'prep': false,
    'screen': true,
    'scripts': true,
    'execute': true,
    'compliance': true,
  });

  const toggleSection = (id: string) => {
    setCollapsedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = useCallback(() => {
    setCollapsedSections({ 'prep': false, 'screen': false, 'scripts': false, 'execute': false, 'compliance': false });
  }, []);

  const collapseAll = useCallback(() => {
    setCollapsedSections({ 'prep': true, 'screen': true, 'scripts': true, 'execute': true, 'compliance': true });
  }, []);

  useEffect(() => {
    let cancelled = false;

    getProducts()
      .then((products) => {
        if (!cancelled && products.length > 0) {
          setProductCards(products);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setProductCards(BUSINESS_GUIDE_PRODUCTS);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const product = searchParams.get('product');
    const type = searchParams.get('type');
    const tab = searchParams.get('tab');

    if (tab === 'persona') {
      setActiveTab('persona');
    } else if (tab === 'guide') {
      setActiveTab('guide');
    }

    if (type === 'industry' || type === 'scenario' || type === 'product') {
      setGuideType(type as any);
    }

    if (product) {
      setSelectedId(product);
      setActiveTab('guide');
      setGuideType('product');
    }
  }, [searchParams]);

  // --- Comparison Data ---
  const COMPARISON_DATA = [
    {
      feature: '产品定位',
      changRongBao: '稳健型：传统银担合作，覆盖面广，适合稳扎稳打落地',
      changYiDan: '高效型：简易审批备案模式，适合优质客户快速推进'
    },
    {
      feature: '适合客户',
      changRongBao: '信用基础稍弱、有真实经营场景、额度需求较大(最高1000万)',
      changYiDan: '资质优、纳税规范(≥5万)、成立满2年、追求效率'
    },
    {
      feature: '不适合客户',
      changRongBao: '无真实经营、随借随还需求、房地产/金融类行业',
      changYiDan: '建筑施工类(高新除外)、存量风险转化、实收资本为0'
    },
    {
      feature: '审批路径',
      changRongBao: '银行审批 -> 中小担人工审批 -> 出意向函',
      changYiDan: '银行审批 -> 向中小担备案 (300万以上需现场尽调)'
    },
    {
      feature: '期限要求',
      changRongBao: '一年期以上，不支持随借随还',
      changYiDan: '一年期以上，不支持随借随还'
    },
    {
      feature: '单户额度',
      changRongBao: '最高 1000 万元',
      changYiDan: '最高 1000 万元 (长易担+长融保合计≤2000万)'
    },
    {
      feature: '担保方式',
      changRongBao: '中小担 80% 本金担保 + 个人保证/抵押(视情况)',
      changYiDan: '中小担 80% 本金担保，纯信用备案为主'
    },
    {
      feature: '担保费收取',
      changRongBao: '0.5%/年，通常由客户预付，后期申请补贴',
      changYiDan: '0.5%/年，通常由客户预付，后期申请补贴'
    },
    {
      feature: '贷款用途',
      changRongBao: '设备采购、原材料、技改、扩产 (需与批复一致)',
      changYiDan: '真实经营周转、技改、研发 (需与批复一致)'
    },
    {
      feature: '现场尽调',
      changRongBao: '必须现场尽调',
      changYiDan: '300万以下免现场；300万以上必须现场'
    },
    {
      feature: '推进速度',
      changRongBao: '10-15 个工作日',
      changYiDan: '3-7 个工作日 (300万以下极快)'
    },
    {
      feature: '优先推荐场景',
      changRongBao: '客户情况复杂、额度需求高、抵押物严重不足',
      changYiDan: '优质制造业/科技企业、急需用款、报税数据漂亮'
    }
  ];

  // --- Helpers ---

  const getActiveContent = () => {
    if (activeTab === 'guide') {
      if (guideType === 'product') return productCards.find(p => p.id === selectedId);
      if (guideType === 'industry') return INDUSTRIES.find(i => i.id === selectedId);
      if (guideType === 'scenario') return SCENARIOS.find(s => s.id === selectedId);
    } else {
      return PERSONAS.find(p => p.id === selectedId);
    }
    return null;
  };

  const activeContent = getActiveContent();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // --- Sub-components ---

  const SidebarItem = ({ id, name, icon: Icon, active }: { id: string, name: string, icon: any, active: boolean }) => (
    <button
      onClick={() => setSelectedId(id)}
      className={cn(
        "w-full flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl transition-all text-left group shrink-0 md:shrink",
        active 
          ? "bg-brand-dark text-white shadow-lg" 
          : "hover:bg-brand-light-gray text-brand-gray"
      )}
    >
      <Icon className={cn("w-3.5 h-3.5 md:w-4 md:h-4", active ? "text-brand-gold" : "group-hover:text-brand-dark")} />
      <span className="text-[10px] md:text-xs font-bold whitespace-nowrap md:whitespace-normal">{name}</span>
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

          {/* Red Warning Box */}
      <div className="mb-8 p-6 bg-red-50 border-2 border-red-200 rounded-2xl">
        <button className="flex items-start gap-4 w-full text-left" onClick={() => setPolicyExpanded(!policyExpanded)}>
          <AlertCircle className="text-red-600 w-6 h-6 shrink-0 mt-1" />
          <div className="flex-grow">
            <div className="flex items-center justify-between">
              <h4 className="text-red-800 font-bold text-lg">重要政策声明 (红线)</h4>
              <ChevronRight className={cn("text-red-400 w-5 h-5 transition-transform", policyExpanded && "rotate-90")} />
            </div>
            <p className="text-red-700 text-sm leading-relaxed font-medium mt-1">
              “民间投资专项担保计划”<span className="underline font-black">不等于</span>自动享受贴息或担保费全额补贴。
            </p>
          </div>
        </button>
        {policyExpanded && (
          <div className="mt-4 ml-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-red-900/80">
              <div className="bg-white/50 p-3 rounded-lg">
                <p className="font-bold mb-1">1. 担保费补贴</p>
                <p>以地方财政当期口径为准，不能默认全额补贴。标准保费 0.5%/年需预付。</p>
              </div>
              <div className="bg-white/50 p-3 rounded-lg">
                <p className="font-bold mb-1">2. 1.5% 利率贴息</p>
                <p>属于并行政策，需看用途和申报条件。并非做了担保计划就自动贴息。</p>
              </div>
            </div>
            <p className="mt-3 text-[10px] text-red-600 font-bold italic">※ 禁止向客户承诺“全额补贴”或“自动贴息”，仅可评估叠加空间。</p>
          </div>
        )}
      </div>

      {/* Mobile Hero: Product Workspace Quick-Access (only on mobile) */}
      <div className="lg:hidden mb-6 animate-fade-in-up">
        <p className="text-[10px] font-bold text-brand-gray uppercase tracking-widest opacity-50 mb-3">核心产品 — 立即运行</p>
        <div className="flex overflow-x-auto gap-3 no-scrollbar mb-3 -mx-4 px-4">
          {productCards.map(p => {
            const workspace = getProductWorkspace(p.id);
            const primaryAction = workspace?.primaryActions.find(a => a.variant === 'primary');
            return (
              <button
                key={p.id}
                onClick={() => {
                  if (primaryAction) {
                    navigate(primaryAction.route);
                  } else {
                    setGuideType('product'); setSelectedId(p.id); setActiveTab('guide');
                  }
                }}
                className={cn(
                  "flex flex-col gap-2.5 p-4 rounded-2xl border text-left transition-all duration-300 min-w-[160px] flex-shrink-0",
                  selectedId === p.id
                    ? "bg-brand-dark text-white border-brand-dark shadow-xl"
                    : "bg-white text-brand-dark border-brand-border/10 shadow-sm active:scale-95"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  selectedId === p.id ? "bg-white/15" : "bg-brand-gold/10"
                )}>
                  <Briefcase size={18} className={selectedId === p.id ? "text-brand-gold" : "text-brand-dark"} />
                </div>
                <div>
                  <p className="text-sm font-bold leading-tight">{p.name}</p>
                  <p className={cn("text-[10px] mt-1 leading-snug line-clamp-2 opacity-60", selectedId === p.id ? "text-white" : "text-brand-gray")}>{p.category}</p>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold mt-auto text-brand-gold">
                  {primaryAction?.label || '查看详情'} <ChevronRight size={12} />
                </div>
              </button>
            );
          })}
        </div>
        <button
          onClick={() => { setGuideType('product'); setSelectedId('product_comparison'); setActiveTab('guide'); }}
          className={cn(
            "w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all",
            selectedId === 'product_comparison'
              ? "bg-brand-gold/10 border-brand-gold/30"
              : "bg-white border-brand-border/10 shadow-sm"
          )}
        >
          <div className="flex items-center gap-2.5">
            <RefreshCcw size={14} className="text-brand-gold shrink-0" />
            <span className="text-xs font-bold text-brand-dark">产品实战对比</span>
            <span className="text-[10px] text-brand-gray opacity-50">长易担 vs 长融保</span>
          </div>
          <ChevronRight size={14} className="text-brand-gray/40" />
        </button>
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
                      {guideType === 'product' && (
                        <SidebarItem id="product_comparison" name="产品实战对比" icon={RefreshCcw} active={selectedId === 'product_comparison'} />
                      )}
                      {guideType === 'product' && productCards.map(p => (
                        <SidebarItem key={p.id} id={p.id} name={p.name} icon={Briefcase} active={selectedId === p.id} />
                      ))}
                      {guideType === 'industry' && INDUSTRIES.map(i => (
                        <SidebarItem key={i.id} id={i.id} name={i.name} icon={Target} active={selectedId === i.id} />
                      ))}
                      {guideType === 'scenario' && SCENARIOS.map(s => (
                        <SidebarItem key={s.id} id={s.id} name={s.name} icon={Zap} active={selectedId === s.id} />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-[9px] md:text-[10px] font-bold text-brand-gray uppercase tracking-widest opacity-40 mb-3 md:mb-4">风格人物</p>
                  <div className="flex overflow-x-auto md:flex-col gap-1 no-scrollbar">
                    {PERSONAS.map(p => (
                      <SidebarItem key={p.id} id={p.id} name={p.name} icon={User} active={selectedId === p.id} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Content: Results */}
            <div className="lg:col-span-9 animate-fade-in">
              <AnimatePresence mode="wait">
                {selectedId === 'product_comparison' ? (
                  <motion.div
                    key="comparison"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-white rounded-[2rem] md:rounded-[3rem] border border-brand-border/10 shadow-sm overflow-hidden"
                  >
                    <div className="p-6 md:p-12 border-b border-brand-border/5 bg-brand-light-gray/20">
                      <h3 className="font-serif text-2xl md:text-4xl text-brand-dark mb-2">产品实战对比</h3>
                      <p className="text-brand-gray text-xs md:text-lg opacity-60">快速区分核心银担产品，精准匹配客户需求</p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-brand-dark text-white">
                            <th className="px-6 py-4 text-left text-xs md:text-sm font-bold uppercase tracking-wider border-r border-white/10">对比维度</th>
                            <th className="px-6 py-4 text-left text-xs md:text-sm font-bold uppercase tracking-wider border-r border-white/10">长融保</th>
                            <th className="px-6 py-4 text-left text-xs md:text-sm font-bold uppercase tracking-wider">长易担</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-border/10">
                          {COMPARISON_DATA.map((row, idx) => (
                            <tr key={idx} className={cn(idx % 2 === 0 ? "bg-white" : "bg-brand-light-gray/10")}>
                              <td className="px-6 py-5 text-xs md:text-sm font-bold text-brand-dark border-r border-brand-border/10 bg-brand-light-gray/5">{row.feature}</td>
                              <td className="px-6 py-5 text-xs md:text-sm text-brand-gray border-r border-brand-border/10">{row.changRongBao}</td>
                              <td className="px-6 py-5 text-xs md:text-sm text-brand-gray">{row.changYiDan}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="p-6 md:p-10 bg-brand-gold/5 border-t border-brand-gold/10">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-brand-gold/10 rounded-full flex items-center justify-center shrink-0">
                          <AlertCircle className="text-brand-gold w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs md:text-sm font-bold text-brand-dark mb-1">客户经理实战建议</p>
                          <p className="text-[10px] md:text-xs text-brand-gray leading-relaxed">
                            对于制造业、有技改需求的大中型客户，首选<span className="text-brand-dark font-bold">长融保</span>，额度高且贴息政策更优；
                            对于初创期、急需资金周转的科技型小微企业，首选<span className="text-brand-dark font-bold">长易担</span>，流程极简，时效性强。
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : activeContent ? (
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
                        <Sparkles className="w-24 h-24 md:w-40 md:h-40" />
                      </div>
                      <div className="relative z-10">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 md:mb-6">
                          <div className="flex items-center gap-3 md:gap-4">
                            <span className="px-3 md:px-4 py-1 md:py-1.5 bg-brand-gold/10 text-brand-gold text-[9px] md:text-[10px] font-bold uppercase tracking-widest rounded-full border border-brand-gold/20">
                              {activeTab === 'guide' ? (guideType === 'product' ? '产品打法' : guideType === 'industry' ? '行业洞察' : '场景策略') : '风格卡片'}
                            </span>
                            <h2 className="text-xl md:text-3xl font-serif text-brand-dark">{(activeContent as any).name}</h2>
                          </div>
                        </div>
                          <p className="text-sm md:text-lg text-brand-gray font-medium leading-relaxed max-w-3xl">
                          {activeTab === 'guide' 
                            ? (guideType === 'product' ? (activeContent as ProductGuideCard).overview : guideType === 'industry' ? (activeContent as any).businessModel : (activeContent as any).goal)
                            : (activeContent as any).style}
                        </p>
                      </div>

                      {/* 产品工作台主动作区 — 配置驱动 */}
                      {activeTab === 'guide' && guideType === 'product' && (() => {
                        const workspace = getProductWorkspace((activeContent as ProductGuideCard).id);
                        if (!workspace) return null;
                        return (
                          <div className="border-t border-brand-border/5 pt-4 mt-4">
                            <p className="text-[9px] font-bold text-brand-gray uppercase tracking-widest opacity-50 mb-3">主动作区</p>
                            <div className="flex flex-wrap gap-2">
                              {workspace.primaryActions.map(action => {
                                const iconMap: Record<string, React.ElementType> = {
                                  FileText, Users, ShieldCheck, Zap, Briefcase, Clock,
                                };
                                const Icon = iconMap[action.icon] || Zap;
                                const variantClasses: Record<string, string> = {
                                  primary: "flex items-center gap-1.5 px-5 py-2.5 bg-brand-dark text-white rounded-xl text-xs font-bold hover:opacity-90 transition-all shadow-sm",
                                  secondary: "flex items-center gap-1.5 px-4 py-2 bg-apple-blue/10 text-apple-blue border border-apple-blue/20 rounded-xl text-xs font-bold hover:bg-apple-blue/20 transition-all",
                                  outline: "flex items-center gap-1.5 px-4 py-2 bg-white text-brand-dark border border-brand-border/15 rounded-xl text-xs font-bold hover:bg-brand-light-gray transition-all",
                                };
                                return (
                                  <button
                                    key={action.code}
                                    onClick={() => navigate(action.route)}
                                    className={variantClasses[action.variant]}
                                  >
                                    <Icon className="w-3.5 h-3.5" />
                                    {action.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Workflow-based Collapsible Sections (mobile-first) */}
                    {guideType === 'product' && (() => {
                      const p = activeContent as ProductGuideCard;
                      const sectionDefs = [
                        {
                          id: 'prep',
                          label: '出门前准备',
                          icon: LogOut,
                          desc: '产品概况、核心要素、行业打法',
                          color: 'blue' as const,
                        },
                        {
                          id: 'screen',
                          label: '现场初筛',
                          icon: Eye,
                          desc: '准入、边界、5秒判断逻辑',
                          color: 'emerald' as const,
                        },
                        {
                          id: 'scripts',
                          label: '对话话术',
                          icon: MessageSquare,
                          desc: '开场、追问、异议处理',
                          color: 'amber' as const,
                        },
                        {
                          id: 'execute',
                          label: '执行落地',
                          icon: ClipboardCheck,
                          desc: '材料、路径、提速清单',
                          color: 'purple' as const,
                        },
                        {
                          id: 'compliance',
                          label: '风控合规',
                          icon: Scale,
                          desc: '禁止承诺、红线、禁忌',
                          color: 'red' as const,
                        },
                      ];

                      const colorMap: Record<string, { bg: string; iconBg: string; iconColor: string; border: string }> = {
                        blue: { bg: 'bg-blue-50/50', iconBg: 'bg-blue-100', iconColor: 'text-blue-600', border: 'border-blue-100' },
                        emerald: { bg: 'bg-emerald-50/50', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600', border: 'border-emerald-100' },
                        amber: { bg: 'bg-amber-50/50', iconBg: 'bg-amber-100', iconColor: 'text-amber-600', border: 'border-amber-100' },
                        purple: { bg: 'bg-purple-50/50', iconBg: 'bg-purple-100', iconColor: 'text-purple-600', border: 'border-purple-100' },
                        red: { bg: 'bg-red-50/50', iconBg: 'bg-red-100', iconColor: 'text-red-600', border: 'border-red-100' },
                      };

                      // Sticky section nav for mobile
                      const SectionNav = (
                        <div className="sticky top-[3.5rem] z-30 -mx-1 px-1 py-2 bg-brand-offwhite/95 backdrop-blur sm:hidden">
                          <div className="flex gap-1 overflow-x-auto no-scrollbar">
                            {sectionDefs.map(s => {
                              const Icon = s.icon;
                              const isCollapsed = collapsedSections[s.id];
                              return (
                                <button
                                  key={s.id}
                                  onClick={() => toggleSection(s.id)}
                                  className={cn(
                                    "shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all",
                                    isCollapsed
                                      ? "bg-white text-brand-gray border-brand-border/20"
                                      : cn("text-white border-transparent", colorMap[s.color].bg.replace('/50', ''), colorMap[s.color].iconBg),
                                  )}
                                >
                                  <Icon size={11} />
                                  {s.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );

                      // Quick decision card
                      const QuickDecisionCard = (
                        <div className="bg-gradient-to-r from-brand-gold/10 via-amber-50/60 to-brand-gold/10 border border-brand-gold/20 rounded-2xl p-4 mb-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Zap size={16} className="text-brand-gold" />
                            <span className="text-xs font-bold text-brand-dark">5秒判断：这个客户适合哪个产品？</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                            <div className="bg-white/80 rounded-xl p-3 border border-emerald-100">
                              <div className="font-bold text-emerald-700 mb-1">长易担（高效型）</div>
                              <ul className="space-y-0.5 text-brand-gray">
                                <li>成立满 2 年，近 12 个月纳税 &ge; 5 万</li>
                                <li>制造业/科技型，报税规范</li>
                                <li>追求效率，3-7 个工作日放款</li>
                                <li>300 万以下免现场尽调</li>
                                <li className="text-red-500 font-medium">建筑施工类(无高新)、有逾期</li>
                              </ul>
                            </div>
                            <div className="bg-white/80 rounded-xl p-3 border border-blue-100">
                              <div className="font-bold text-blue-700 mb-1">长融保（稳健型）</div>
                              <ul className="space-y-0.5 text-brand-gray">
                                <li>信用基础稍弱但经营真实</li>
                                <li>真实经营满 1 年，有报税流水</li>
                                <li>额度需求大（最高 1000 万）</li>
                                <li>10-15 个工作日，线下审批</li>
                                <li className="text-red-500 font-medium">随借随还、无真实经营场景</li>
                              </ul>
                            </div>
                          </div>
                          <div className="mt-3 flex gap-2">
                            <button onClick={expandAll} className="flex-1 py-2 bg-brand-dark text-white rounded-lg text-[10px] font-bold hover:opacity-90 transition-all">
                              展开全部打法
                            </button>
                            <button onClick={collapseAll} className="flex-1 py-2 bg-white border border-brand-border/20 text-brand-gray rounded-lg text-[10px] font-bold hover:bg-brand-light-gray transition-all">
                              折叠全部
                            </button>
                          </div>
                        </div>
                      );

                      return (
                        <div className="space-y-3">
                          {/* Product comparison — surfaced above sections */}
                          {p.comparison && (
                            <div className="bg-white rounded-2xl border border-brand-border/10 shadow-sm p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <RefreshCcw size={14} className="text-brand-gold" />
                                <span className="text-xs font-bold text-brand-dark">与 {p.comparison.with} 的核心区别</span>
                              </div>
                              <ul className="space-y-1.5 text-[11px] text-brand-gray">
                                {p.comparison.points.map((pt, i) => (
                                  <li key={i} className="flex gap-2">
                                    <span className="shrink-0 w-4 h-4 rounded-full bg-brand-gold/10 text-brand-gold text-[9px] font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                                    <span>{pt}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {QuickDecisionCard}
                          {SectionNav}

                          {sectionDefs.map(section => {
                            const isCollapsed = collapsedSections[section.id];
                            const c = colorMap[section.color];
                            const Icon = section.icon;
                            return (
                              <div key={section.id} className={cn("rounded-2xl border shadow-sm overflow-hidden transition-all", c.border, c.bg)}>
                                <button
                                  onClick={() => toggleSection(section.id)}
                                  className={cn("w-full flex items-center justify-between p-4 text-left transition-colors", isCollapsed ? "" : "border-b " + c.border)}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center", c.iconBg, c.iconColor)}>
                                      <Icon size={16} />
                                    </div>
                                    <div>
                                      <div className="text-sm font-bold text-brand-dark">{section.label}</div>
                                      <div className="text-[10px] text-brand-gray opacity-60">{section.desc}</div>
                                    </div>
                                  </div>
                                  <ChevronDown size={18} className={cn("text-brand-gray transition-transform duration-200", isCollapsed ? "" : "rotate-180")} />
                                </button>
                                {!isCollapsed && (
                                  <div className="p-4 bg-white/80">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {section.id === 'prep' && (
                                        <>
                                          <ContentCard title="产品概况" icon={Info} content={p.overview} />
                                          {p.details && (
                                            <ContentCard
                                              title="产品核心要素"
                                              icon={Star}
                                              list={[
                                                `利率：${p.details.rate}`,
                                                `期限：${p.details.term}`,
                                                `费率：${p.details.pricing}`,
                                                `担保：${p.details.guarantee}`,
                                                `审批：${p.details.creditMethod}`,
                                                `补贴：${p.details.subsidy}`,
                                              ]}
                                            />
                                          )}
                                          <div className="md:col-span-2">
                                            <ContentCard
                                              title="行业营销打法"
                                              icon={Briefcase}
                                              list={[
                                                `【制造业】\n${p.industryMarketing?.manufacturing}`,
                                                `\n【科技型】\n${p.industryMarketing?.tech}`,
                                              ]}
                                            />
                                          </div>
                                        </>
                                      )}
                                      {section.id === 'screen' && (
                                        <>
                                          <ContentCard title="准入判断" icon={ShieldCheck} list={p.entryCriteria} />
                                          <ContentCard
                                            title="产品边界"
                                            icon={Target}
                                            list={[
                                              "【适合客群】",
                                              ...(p.productBoundary?.suitable.map(s => `· ${s}`) || []),
                                              "\n【不适合客群】",
                                              ...(p.productBoundary?.unsuitable.map(u => `· ${u}`) || []),
                                            ]}
                                          />
                                          <ContentCard
                                            title="实战判断逻辑"
                                            icon={Zap}
                                            list={p.practicalLogic?.map((l, i) => `${i + 1}. ${l}`)}
                                          />
                                          <ContentCard title="需求识别" icon={Target} content={p.needRecognition} />
                                          <div className="md:col-span-2">
                                            <ContentCard
                                              title="必问问题清单"
                                              icon={MessageSquare}
                                              list={p.mustAskQuestions}
                                              copyable
                                            />
                                          </div>
                                        </>
                                      )}
                                      {section.id === 'scripts' && (
                                        <>
                                          <ContentCard title="进门对话" icon={MessageSquare} content={p.openingTalk} copyable />
                                          <ContentCard title="对客话术（初次触达）" icon={MessageSquare} content={p.scripts?.initial} copyable />
                                          <ContentCard title="对客话术（深入沟通）" icon={MessageSquare} content={p.scripts?.deep} copyable />
                                          <ContentCard title="对客话术（补件推进）" icon={MessageSquare} content={p.scripts?.followUp} copyable />
                                          {p.messagingPack?.oneLineSellingPoint && (
                                            <ContentCard title="一句话卖点" icon={Sparkles} content={p.messagingPack.oneLineSellingPoint} copyable />
                                          )}
                                          {p.messagingPack?.directCustomerScripts?.length ? (
                                            <ContentCard
                                              title="新版对客话术包"
                                              icon={Users}
                                              list={p.messagingPack.directCustomerScripts.map(item => {
                                                const variantLabel = item.variant ? ` / ${item.variant === 'short' ? '短版' : '中版'}` : '';
                                                return `【${item.title}${variantLabel}】\n${item.content}`;
                                              })}
                                              copyable
                                            />
                                          ) : null}
                                          {p.messagingPack?.marketingEntryPoints?.length ? (
                                            <ContentCard
                                              title="营销切入模板"
                                              icon={MessageSquare}
                                              list={p.messagingPack.marketingEntryPoints.map(item => `【${item.title}】\n${item.content}`)}
                                              copyable
                                            />
                                          ) : null}
                                          {p.messagingPack?.marketingTemplates && (
                                            <ContentCard
                                              title="客户沟通追问模板"
                                              icon={MessageSquare}
                                              list={[
                                                `【第一次拜访】\n${p.messagingPack.marketingTemplates.firstVisit}`,
                                                `【客户说先看看】\n${p.messagingPack.marketingTemplates.followUp}`,
                                                `【客户问利率】\n${p.messagingPack.marketingTemplates.rateReply}`,
                                                `【客户问贴补】\n${p.messagingPack.marketingTemplates.subsidyReply}`,
                                                `【客户问为什么要报税资料】\n${p.messagingPack.marketingTemplates.taxDocsReply}`,
                                              ]}
                                              copyable
                                            />
                                          )}
                                          <ContentCard
                                            title="异议处理"
                                            icon={MessageSquare}
                                            list={p.objections.map(o => `问：${o.q}\n答：${o.a}`)}
                                          />
                                        </>
                                      )}
                                      {section.id === 'execute' && (
                                        <>
                                          <ContentCard
                                            title="材料清单"
                                            icon={FileText}
                                            list={p.materials}
                                            copyable
                                            action={{
                                              label: '去生成检核表+授信方案',
                                              onClick: () => navigate(`/checklist-generator?product=${p.id}`),
                                            }}
                                          />
                                          <ContentCard title="推进路径" icon={TrendingUp} list={p.steps} />
                                          <ContentCard title="提速放款清单（RM动作）" icon={Clock} list={p.speedUpChecklist?.rmActions} />
                                          <ContentCard title="提速放款清单（客户配合）" icon={Users} list={p.speedUpChecklist?.customerCooperation} copyable />
                                          <div className="md:col-span-2">
                                            <ContentCard
                                              title="客户高频问题（对客版）"
                                              icon={MessageSquare}
                                              list={p.highFreqQA?.map(qa => `问：${qa.question}\n答：${qa.answer}`)}
                                              copyable
                                            />
                                          </div>
                                          <div className="md:col-span-2">
                                            <ContentCard
                                              title="客户经理内部逻辑"
                                              icon={ShieldCheck}
                                              list={p.highFreqQA?.map(qa => `针对：${qa.question}\n逻辑：${qa.internalLogic}`)}
                                            />
                                          </div>
                                          {p.messagingPack?.reviewSubmissionScripts?.length && (
                                            <div className="md:col-span-2">
                                              <ContentCard
                                                title="对审查可复制话术"
                                                icon={FileText}
                                                list={p.messagingPack.reviewSubmissionScripts.map(item => `【${item.title}】\n${item.content}`)}
                                                copyable
                                              />
                                            </div>
                                          )}
                                        </>
                                      )}
                                      {section.id === 'compliance' && (
                                        <>
                                          <div className="md:col-span-2 p-4 bg-red-50 border border-red-200 rounded-[1.5rem]">
                                            <div className="flex items-center gap-2 mb-3 text-red-600">
                                              <AlertCircle size={18} />
                                              <h4 className="font-bold text-sm">重要政策声明（红线）</h4>
                                            </div>
                                            <p className="text-xs text-red-700 leading-relaxed font-bold">
                                              &ldquo;民间投资专项担保计划&rdquo;不等于自动享受贴息或担保费全额补贴。
                                            </p>
                                            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-[10px] text-red-600/80">
                                              <div>
                                                <p className="font-bold mb-0.5">1. 担保费补贴</p>
                                                <p>以地方财政当期口径为准，不能默认全额补贴。标准保费 0.5%/年需预付。</p>
                                              </div>
                                              <div>
                                                <p className="font-bold mb-0.5">2. 1.5%利率贴息</p>
                                                <p>属于并行政策，需看用途和申报条件。并非做了担保计划就自动贴息。</p>
                                              </div>
                                            </div>
                                            <p className="mt-3 text-[9px] text-red-500 font-bold italic">※ 禁止向客户承诺&ldquo;全额补贴&rdquo;或&ldquo;自动贴息&rdquo;，仅可评估叠加空间。</p>
                                          </div>
                                          <ContentCard
                                            title="禁止承诺口径"
                                            icon={Ban}
                                            list={p.highFreqQA?.map(qa => `警告：${qa.prohibited}`)}
                                            warning
                                          />
                                          {((p.messagingPack?.canSay?.length || p.messagingPack?.shouldNotSayDead?.length)) && (
                                            <ContentCard
                                              title="表达边界"
                                              icon={Ban}
                                              list={[
                                                ...((p.messagingPack?.canSay || []).map(item => `【可以说】${item}`)),
                                                ...((p.messagingPack?.shouldNotSayDead || []).map(item => `【不要说死】${item}`)),
                                              ]}
                                              warning
                                              copyable
                                            />
                                          )}
                                          <ContentCard title="禁忌表达" icon={Ban} list={p.forbiddenPhrases} warning />
                                        </>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}

                    {/* Industry, Scenario, Persona views */}
                    {activeTab === 'guide' && guideType === 'industry' && activeContent && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                        <ContentCard title="行业特征" icon={Info} content={(activeContent as any).businessModel} />
                        <ContentCard title="常见资金需求" icon={Zap} content={(activeContent as any).capitalNeed} />
                        <ContentCard title="风险点" icon={AlertCircle} list={(activeContent as any).risks} warning />
                        <ContentCard title="常见切入产品" icon={Briefcase} list={(activeContent as any).recommendedProducts} />
                        <ContentCard title="首次拜访建议" icon={User} list={(activeContent as any).firstVisitTips} />
                        <ContentCard title="重点提问清单" icon={MessageSquare} list={(activeContent as any).mustAskQuestions} copyable />
                      </div>
                    )}
                    {activeTab === 'guide' && guideType === 'scenario' && activeContent && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                        <ContentCard title="场景目标" icon={CheckCircle2} content={(activeContent as any).goal} />
                        <ContentCard title="开场怎么说" icon={MessageSquare} content={(activeContent as any).openingTalk} copyable />
                        <ContentCard title="必问问题" icon={Target} list={(activeContent as any).mustAskQuestions} copyable />
                        <ContentCard title="风险识别点" icon={AlertCircle} list={(activeContent as any).riskPoints} warning />
                        <ContentCard title="推荐产品方向" icon={Briefcase} list={(activeContent as any).recommendedProducts} />
                        <ContentCard title="下一步动作" icon={TrendingUp} list={(activeContent as any).nextSteps} />
                      </div>
                    )}
                    {activeTab === 'persona' && activeContent && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                        <ContentCard title="风格定位" icon={Info} content={(activeContent as any).style} />
                        <ContentCard title="擅长客群" icon={Users} list={(activeContent as any).goodAtCustomers} />
                        <ContentCard title="擅长产品" icon={Briefcase} list={(activeContent as any).goodAtProducts} />
                        <ContentCard title="开场风格" icon={MessageSquare} content={(activeContent as any).openingStyle} />
                        <ContentCard title="提问风格" icon={Target} content={(activeContent as any).questionStyle} />
                        <ContentCard title="推进节奏" icon={Clock} content={(activeContent as any).pushStyle} />
                        <ContentCard title="典型开场白" icon={MessageSquare} content={(activeContent as any).typicalOpening} copyable />
                        <ContentCard title="后续跟进" icon={TrendingUp} content={(activeContent as any).typicalFollowUp} copyable />
                        <ContentCard title="异议处理" icon={ShieldCheck} content={(activeContent as any).objectionHandling} />
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <div className="h-[400px] md:h-[600px] bg-white rounded-[1.5rem] md:rounded-[2.5rem] border border-dashed border-brand-border/20 flex flex-col items-center justify-center text-center p-8 md:p-12">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-brand-light-gray rounded-full flex items-center justify-center mb-6 md:mb-8">
                      <Search className="w-8 h-8 md:w-10 md:h-10 text-brand-gray opacity-30" />
                    </div>
                    <h3 className="font-serif text-xl md:text-2xl text-brand-dark mb-3 md:mb-4">请选择一个维度开始</h3>
                    <p className="text-xs md:text-sm text-brand-gray font-medium opacity-60 max-w-md">
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
