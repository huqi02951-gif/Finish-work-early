/**
 * 工作台 — 个人生产力中心
 * 
 * 聚合最近生成的内容、快捷进入工具、管理当前客户上下文。
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock, FileText, Download, Trash2, ChevronRight,
  ShieldCheck, Sparkles, Calculator, ClipboardList,
  Newspaper, Receipt, Users, ArrowRight, X
} from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';
import { db, type GeneratedArtifact, type ExportRecord } from '../../lib/localDB';
import { useCustomer } from '../../lib/CustomerContext';

const TOOL_META: Record<string, { name: string; icon: React.ElementType; color: string; path: string }> = {
  'sensitive-comm':    { name: '敏感沟通助手', icon: ShieldCheck, color: 'text-amber-600 bg-amber-50', path: '/sensitive-comm' },
  'rate-offer':        { name: '利率优惠签报', icon: Sparkles,    color: 'text-blue-600 bg-blue-50',   path: '/rate-offer' },
  'acceptance-calc':   { name: '银承/存单测算', icon: Calculator,  color: 'text-emerald-600 bg-emerald-50', path: '/acceptance-calculator' },
  'material-checklist':{ name: '材料清单中心', icon: ClipboardList, color: 'text-purple-600 bg-purple-50', path: '/material-checklist' },
  'news-assistant':    { name: '宣传稿排版',   icon: Newspaper,   color: 'text-rose-600 bg-rose-50',   path: '/news-assistant' },
  'batch-billing':     { name: '批量开票',     icon: Receipt,     color: 'text-indigo-600 bg-indigo-50', path: '/batch-billing' },
};

const WorkspacePage: React.FC = () => {
  const { customer, setCustomer, clearCustomer, hasCustomer } = useCustomer();
  const [artifacts, setArtifacts] = useState<GeneratedArtifact[]>([]);
  const [exports, setExports] = useState<ExportRecord[]>([]);
  const [stats, setStats] = useState({ totalArtifacts: 0, totalExports: 0 });

  useEffect(() => {
    const load = async () => {
      const [arts, exps, totalA, totalE] = await Promise.all([
        db.artifacts.orderBy('createdAt').reverse().limit(8).toArray(),
        db.exports.orderBy('createdAt').reverse().limit(5).toArray(),
        db.artifacts.count(),
        db.exports.count(),
      ]);
      setArtifacts(arts);
      setExports(exps);
      setStats({ totalArtifacts: totalA, totalExports: totalE });
    };
    load();
  }, []);

  const quickTools = [
    { ...TOOL_META['sensitive-comm'], id: 'sensitive-comm' },
    { ...TOOL_META['rate-offer'], id: 'rate-offer' },
    { ...TOOL_META['acceptance-calc'], id: 'acceptance-calc' },
    { ...TOOL_META['material-checklist'], id: 'material-checklist' },
  ];

  const deleteArtifact = async (id: number) => {
    await db.artifacts.delete(id);
    setArtifacts(prev => prev.filter(a => a.id !== id));
    setStats(prev => ({ ...prev, totalArtifacts: prev.totalArtifacts - 1 }));
  };

  return (
    <AppLayout title="工作台">
      <div className="bg-brand-offwhite pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 space-y-6 sm:space-y-8">

          {/* ─── Sub-header ─── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-2"
          >
            <p className="text-xs sm:text-sm text-brand-gray opacity-60">你的本地生产力中心 · 在这里管理所有生成记录和工具快捷入口</p>
          </motion.div>

          {/* ─── Stats Cards ─── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: '生成记录', value: stats.totalArtifacts, icon: FileText, color: 'text-blue-600' },
              { label: '导出次数', value: stats.totalExports, icon: Download, color: 'text-emerald-600' },
              { label: '可用工具', value: Object.keys(TOOL_META).length, icon: Sparkles, color: 'text-amber-600' },
              { label: '当前客户', value: hasCustomer ? '1' : '—', icon: Users, color: 'text-purple-600' },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl border border-brand-border/5 p-4 sm:p-5 shadow-sm"
              >
                <s.icon size={16} className={cn("mb-2 opacity-60", s.color)} />
                <div className="text-xl sm:text-2xl font-bold text-brand-dark tracking-tight">{s.value}</div>
                <div className="text-[9px] sm:text-[10px] font-bold text-brand-gray uppercase tracking-widest mt-1 opacity-50">{s.label}</div>
              </motion.div>
            ))}
          </div>

          {/* ─── Customer Context Card ─── */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl sm:rounded-3xl border border-brand-border/5 shadow-sm overflow-hidden"
          >
            <div className="px-5 sm:px-6 py-4 border-b border-brand-border/5 flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-bold text-brand-dark flex items-center gap-2">
                <Users size={16} className="text-purple-500" /> 当前客户上下文
              </h3>
              {hasCustomer && (
                <button onClick={clearCustomer} className="text-[10px] text-brand-gray hover:text-red-500 font-bold flex items-center gap-1 transition-colors">
                  <X size={12} /> 清除
                </button>
              )}
            </div>
            <div className="p-5 sm:p-6">
              {hasCustomer ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[
                    { label: '客户名称', value: customer.name },
                    { label: '联系人', value: customer.contactPerson },
                    { label: '行业', value: customer.industry },
                    { label: '电话', value: customer.phone },
                    { label: '渠道', value: customer.channel },
                  ].filter(f => f.value).map(f => (
                    <div key={f.label}>
                      <div className="text-[9px] font-bold text-brand-gray uppercase tracking-widest opacity-40 mb-1">{f.label}</div>
                      <div className="text-xs sm:text-sm font-medium text-brand-dark">{f.value}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                  <div className="flex-grow text-center sm:text-left">
                    <p className="text-xs text-brand-gray opacity-60">
                      填入客户信息后，所有工具将自动预填该客户数据。
                    </p>
                  </div>
                  <input
                    placeholder="输入客户名称开始..."
                    className="w-full sm:w-auto px-4 py-2.5 bg-brand-light-gray/50 border border-brand-border/10 rounded-xl text-sm focus:ring-2 focus:ring-purple-200 outline-none"
                    onKeyDown={e => {
                      if (e.key === 'Enter' && (e.target as HTMLInputElement).value) {
                        setCustomer({ name: (e.target as HTMLInputElement).value });
                      }
                    }}
                  />
                </div>
              )}
            </div>
          </motion.div>

          {/* ─── Quick Access Tools ─── */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs sm:text-sm font-bold text-brand-dark">快速进入工具</h3>
              <Link to="/scenarios?tab=customer" className="text-[10px] text-brand-gray hover:text-brand-dark font-bold flex items-center gap-1 transition-colors">
                全部场景 <ChevronRight size={12} />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {quickTools.map((tool, i) => (
                <Link
                  key={tool.id}
                  to={tool.path}
                  className="bg-white rounded-2xl border border-brand-border/5 p-4 shadow-sm hover:shadow-lg transition-all group active:scale-95"
                >
                  <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110", tool.color)}>
                    <tool.icon size={18} />
                  </div>
                  <div className="text-xs font-bold text-brand-dark mb-0.5 line-clamp-1">{tool.name}</div>
                  <div className="text-[9px] text-brand-gray opacity-40 font-bold flex items-center gap-1">
                    进入 <ArrowRight size={10} />
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* ─── Workflow Link: 业务通 → 敏感沟通 ─── */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-brand-dark to-brand-dark/90 rounded-2xl sm:rounded-3xl p-5 sm:p-6 text-white relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Sparkles size={80} />
            </div>
            <div className="relative z-10">
              <div className="text-[9px] font-bold uppercase tracking-widest text-white/40 mb-3">工具联动</div>
              <h3 className="text-base sm:text-lg font-bold mb-2 tracking-tight">业务通 → 敏感沟通助手</h3>
              <p className="text-[11px] sm:text-xs text-white/60 mb-4 leading-relaxed max-w-lg">
                在业务通中了解产品要点后，一键跳转到敏感沟通助手，自动带入客户信息，直接生成对客话术。
              </p>
              <div className="flex gap-3">
                <Link
                  to="/business-guide"
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-[11px] font-bold hover:bg-white/20 transition-all flex items-center gap-2"
                >
                  进入业务通 <ArrowRight size={14} />
                </Link>
                <Link
                  to="/sensitive-comm"
                  className="px-4 py-2 bg-white text-brand-dark rounded-xl text-[11px] font-bold hover:bg-white/90 transition-all flex items-center gap-2"
                >
                  直接进入沟通助手 <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </motion.div>

          {/* ─── Recent Artifacts ─── */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs sm:text-sm font-bold text-brand-dark flex items-center gap-2">
                <Clock size={14} className="text-brand-gray" /> 最近生成记录
              </h3>
              {artifacts.length > 0 && (
                <span className="text-[9px] text-brand-gray opacity-40 font-bold">{stats.totalArtifacts} 条记录</span>
              )}
            </div>

            {artifacts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-brand-border/5 p-10 text-center shadow-sm">
                <FileText size={32} className="text-brand-gray opacity-15 mx-auto mb-3" />
                <p className="text-xs font-bold text-brand-dark mb-1">暂无记录</p>
                <p className="text-[10px] text-brand-gray opacity-50">使用工具生成内容并点击「存入历史」后，记录会出现在这里。</p>
              </div>
            ) : (
              <div className="space-y-2">
                {artifacts.map((item) => {
                  const meta = TOOL_META[item.toolId] || { name: item.toolId, icon: FileText, color: 'text-gray-500 bg-gray-50', path: '/' };
                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl border border-brand-border/5 p-4 shadow-sm flex items-start gap-3 group hover:shadow-md transition-all"
                    >
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5", meta.color)}>
                        <meta.icon size={14} />
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-xs font-bold text-brand-dark truncate">{item.title}</span>
                          <span className="text-[9px] text-brand-gray opacity-40 shrink-0">
                            {new Date(item.createdAt).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[10px] text-brand-gray line-clamp-1 opacity-60">{item.content.slice(0, 80)}...</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[8px] font-bold text-brand-gray bg-brand-light-gray/50 px-2 py-0.5 rounded-full uppercase tracking-widest">{meta.name}</span>
                          <Link
                            to={meta.path}
                            className="text-[9px] font-bold text-apple-blue hover:underline flex items-center gap-0.5"
                          >
                            再次使用 <ChevronRight size={10} />
                          </Link>
                        </div>
                      </div>
                      <button
                        onClick={() => item.id && deleteArtifact(item.id)}
                        className="p-1.5 text-brand-gray/30 hover:text-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition-all shrink-0"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
};

export default WorkspacePage;
