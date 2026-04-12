import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Briefcase,
  Clock3,
  Download,
  FileText,
  Lock,
  MessageSquare,
  Sparkles,
  Trash2,
  Users,
} from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import { cn } from '../../lib/utils';
import { db, type ExportRecord, type GeneratedArtifact } from '../../lib/localDB';
import { useCustomer } from '../../lib/CustomerContext';
import { formatExpiry, formatRelativeTime, getCommunitySummary } from '../../lib/community';

const TOOL_META: Record<string, { name: string; path: string }> = {
  'sensitive-comm': { name: '敏感沟通助手', path: '/sensitive-comm' },
  'rate-offer': { name: '利率优惠签报', path: '/rate-offer' },
  'acceptance-calc': { name: '银承/存单测算', path: '/acceptance-calculator' },
  'material-checklist': { name: '材料清单中心', path: '/material-checklist' },
  'news-assistant': { name: '宣传稿排版', path: '/news-assistant' },
  'batch-billing': { name: '批量开票', path: '/batch-billing' },
};

type WorkspaceTab = 'overview' | 'community';

const WorkspacePage: React.FC = () => {
  const { customer, setCustomer, clearCustomer, hasCustomer } = useCustomer();
  const [artifacts, setArtifacts] = useState<GeneratedArtifact[]>([]);
  const [exports, setExports] = useState<ExportRecord[]>([]);
  const [stats, setStats] = useState({ totalArtifacts: 0, totalExports: 0 });
  const [communitySummary, setCommunitySummary] = useState<Awaited<ReturnType<typeof getCommunitySummary>> | null>(null);
  const [formalEntries, setFormalEntries] = useState<any[]>([]);
  const [composing, setComposing] = useState(false);
  const [form, setForm] = useState({ channel: '经验分享', title: '', content: '' });

  const load = async () => {
    const [arts, exps, totalArtifacts, totalExports, summary] = await Promise.all([
      db.artifacts.orderBy('createdAt').reverse().limit(8).toArray(),
      db.exports.orderBy('createdAt').reverse().limit(5).toArray(),
      db.artifacts.count(),
      db.exports.count(),
      getCommunitySummary(),
      db.threads.toArray().then(arr => arr.filter(t => ['经验分享', '系统操作', '合规探讨', '专题'].includes(t.channel)).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())),
    ].map(p => p.catch(() => [])) as Promise<any>); // Safely resolve db.threads which might not be imported correctly yet so let's import listCommunityEntries instead

  };

  const loadFormal = async () => {
    const { listCommunityEntries } = await import('../../lib/community');
    const items = await listCommunityEntries();
    setFormalEntries(items.filter((item) => ['经验分享', '系统操作', '合规探讨', '专题'].includes(item.channel as string)));
  };

  useEffect(() => {
    load();
    loadFormal();
  }, []);

  const quickTools = useMemo(
    () => ['sensitive-comm', 'rate-offer', 'acceptance-calc', 'material-checklist'].map((id) => ({ id, ...TOOL_META[id] })),
    [],
  );

  const deleteArtifact = async (id: number) => {
    await db.artifacts.delete(id);
    await load();
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;
    const { createCommunityThread } = await import('../../lib/community');
    await createCommunityThread({
      title: form.title.trim(),
      content: form.content.trim(),
      channel: form.channel as any,
      anonymous: false,
      author: '当前浏览器用户',
    });
    setForm({ channel: '经验分享', title: '', content: '' });
    setComposing(false);
    await loadFormal();
    const summary = await getCommunitySummary();
    setCommunitySummary(summary);
  };

  const formalChannels: string[] = ['经验分享', '系统操作', '合规探讨', '专题'];

  return (
    <AppLayout title="工作台">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6">
        <section className="flex flex-col gap-3 border-b border-brand-border/40 pb-6">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-gray">workspace</div>
            <h1 className="mt-3 text-3xl font-semibold text-brand-dark">正式与效率的专业前台。</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-brand-gray">
              工作台是你处理业务的数字总台。汇集历史记录、高频工具，并在业务社区沉淀真实的经验与操作指南。
            </p>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          {/* Left Column: Formal Feed & Community */}
          <div className="flex flex-col gap-6">
            <section className="rounded-md border border-brand-border/60 bg-white p-5">
              <div className="flex items-center justify-between border-b border-brand-border/40 pb-4">
                <div>
                  <h2 className="text-xl font-semibold text-brand-dark">业务社区与经验库</h2>
                  <p className="mt-1 text-xs text-brand-gray">专业、效率、共享。在这里沉淀系统的操作指引和过件经验。</p>
                </div>
                <button
                  onClick={() => setComposing(!composing)}
                  className="inline-flex items-center gap-2 rounded-md border border-brand-dark bg-brand-dark px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-black"
                >
                  固化我的经验
                </button>
              </div>

              {composing && (
                <form onSubmit={handleCreatePost} className="mt-4 rounded-md border border-brand-dark/20 bg-brand-offwhite p-4">
                  <div className="mb-3 grid gap-3 sm:grid-cols-[120px_1fr]">
                    <select 
                      value={form.channel}
                      onChange={e => setForm({...form, channel: e.target.value})}
                      className="rounded-md border border-brand-border/60 bg-white px-3 py-2 text-sm outline-none"
                    >
                      {formalChannels.filter(c => c !== '专题').map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <input 
                      placeholder="一句话概括你的经验或指引（必填）" 
                      value={form.title}
                      onChange={e => setForm({...form, title: e.target.value})}
                      className="rounded-md border border-brand-border/60 bg-white px-3 py-2 text-sm outline-none"
                      required
                    />
                  </div>
                  <textarea 
                    placeholder="详细描述具体的操作步骤、防坑指南，手把手教同事怎么做..." 
                    value={form.content}
                    onChange={e => setForm({...form, content: e.target.value})}
                    className="min-h-24 w-full rounded-md border border-brand-border/60 bg-white px-3 py-2 text-sm leading-6 outline-none"
                    required
                  />
                  <div className="mt-3 flex justify-end gap-3">
                    <button type="button" onClick={() => setComposing(false)} className="text-sm text-brand-gray hover:text-brand-dark">取消</button>
                    <button type="submit" className="rounded-md bg-brand-dark px-4 py-1.5 text-sm font-semibold text-white hover:bg-black">发布经验帖</button>
                  </div>
                </form>
              )}

              <div className="mt-4 grid gap-4">
                {formalEntries.map((item) => (
                  <div key={item.uid} className="rounded-md border border-brand-border/50 bg-brand-offwhite p-4 transition-colors hover:bg-brand-light-gray/20">
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-brand-gray">
                      <span className="font-semibold text-brand-dark">{item.channel}</span>
                      <span>{formatRelativeTime(item.createdAt)}</span>
                      <span>{item.author}</span>
                    </div>
                    <Link to={item.kind === 'topic' ? `/formal/topic/${item.uid}` : `/formal/thread/${item.uid}`} className="mt-2 block">
                      <h3 className="text-lg font-semibold text-brand-dark">{item.title}</h3>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-brand-gray line-clamp-3">{item.content}</p>
                    </Link>
                    <div className="mt-3 flex items-center gap-1 text-[11px] text-brand-gray">
                      <MessageSquare size={13} className="mr-1" /> {item.replyCount} 条回帖与补充
                    </div>
                  </div>
                ))}
                {formalEntries.length === 0 && !composing && (
                  <div className="rounded-md border border-dashed border-brand-border/60 p-8 text-center text-sm text-brand-gray">
                    还没有业务经验帖，点击右上角分享第一条。
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Right Column: Tools, Context, Exports & Pantry */}
          <div className="flex flex-col gap-6">
            
            {/* The Pantry Portal */}
            <section className="relative overflow-hidden rounded-xl border border-[#2d1b0d] bg-[#0c0805] shadow-[0_4px_30px_rgba(247,185,141,0.08)]">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-paper.png')] opacity-20 pointer-events-none"></div>
              <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[#f7b98d] opacity-[0.05] blur-2xl"></div>
              
              <div className="relative p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-2 w-2 rounded-full bg-[#f7b98d] animate-pulse"></div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8a6b57]">The Secret Node</div>
                </div>
                <h3 className="text-xl font-bold text-[#f7b98d] mb-2 tracking-tight">前往地下茶水间</h3>
                <p className="text-[13px] leading-6 text-[#a68670] mb-5">
                  这里是正经工作区。如果想匿名发疯、吐槽找瓜、或者出个闲置，请戴上面具，进入另一个世界。
                </p>
                
                <Link
                  to="/bbs"
                  className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-[#2d1b0d] px-4 py-3 text-sm font-bold text-[#f7b98d] transition-all hover:bg-[#3d2512] hover:shadow-[0_0_20px_rgba(247,185,141,0.2)]"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <Lock size={15} className="group-hover:unlock-icon-animate" />
                    验证匿名身份
                  </span>
                  <div className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-[#f7b98d]/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                </Link>
              </div>
            </section>

            {/* Tools Area */}
            <section className="rounded-md border border-brand-border/60 bg-white">
              <div className="border-b border-brand-border/40 px-4 py-3 pb-2">
                <h3 className="text-sm font-semibold text-brand-dark">工兵连</h3>
              </div>
              <div className="p-4 grid gap-4">
                {/* 热门推荐 */}
                <div>
                  <div className="text-[11px] mb-2 font-semibold uppercase tracking-[0.12em] text-brand-gray/80 flex items-center gap-1.5"><Sparkles size={11} className="text-amber-500" /> 热门推荐</div>
                  <div className="grid grid-cols-2 gap-2">
                    {quickTools.slice(0, 2).map((tool) => (
                      <Link key={tool.id} to={tool.path} className="flex items-center justify-between rounded border border-brand-border/50 bg-brand-offwhite px-3 py-2 transition-colors hover:bg-white hover:shadow-sm">
                        <span className="text-xs font-semibold text-brand-dark">{tool.name}</span>
                        <ArrowRight size={12} className="text-brand-gray" />
                      </Link>
                    ))}
                  </div>
                </div>
                {/* 今日上新 */}
                <div>
                  <div className="text-[11px] mb-2 font-semibold uppercase tracking-[0.12em] text-brand-gray/80 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> 今日上新</div>
                  <div className="grid grid-cols-2 gap-2">
                    {quickTools.slice(2, 4).map((tool) => (
                      <Link key={tool.id} to={tool.path} className="flex items-center justify-between rounded border border-brand-border/50 bg-brand-offwhite px-3 py-2 transition-colors hover:bg-white hover:shadow-sm">
                        <span className="text-xs font-semibold text-brand-dark">{tool.name}</span>
                        <ArrowRight size={12} className="text-brand-gray" />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Customer Context */}
            <section className="rounded-md border border-brand-border/60 bg-white">
              <div className="flex items-center justify-between border-b border-brand-border/40 px-4 py-3">
                <div className="text-sm font-semibold text-brand-dark">当前客户上下文</div>
                {hasCustomer ? (
                  <button type="button" onClick={clearCustomer} className="text-[10px] text-brand-gray hover:text-brand-dark">清除</button>
                ) : null}
              </div>
              <div className="p-4">
                {hasCustomer ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      { label: '客户名称', value: customer.name },
                      { label: '联系人', value: customer.contactPerson },
                    ].filter((item) => item.value).map((item) => (
                      <div key={item.label}>
                        <div className="text-[10px] text-brand-gray">{item.label}</div>
                        <div className="mt-0.5 text-xs font-semibold text-brand-dark truncate">{item.value}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid gap-3">
                    <input
                      placeholder="输入名称锁定上下文 (回车)"
                      className="rounded border border-brand-border/60 bg-brand-offwhite px-3 py-2 text-xs outline-none"
                      onKeyDown={(event) => {
                        const value = (event.target as HTMLInputElement).value.trim();
                        if (event.key === 'Enter' && value) {
                          setCustomer({ name: value });
                          (event.target as HTMLInputElement).value = '';
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            </section>

            {/* Artifacts & Topics */}
            <section className="rounded-md border border-brand-border/60 bg-white p-4">
              <div className="text-[11px] uppercase tracking-[0.12em] text-brand-gray mb-3 pb-2 border-b border-brand-border/40 flex justify-between items-center">
                <span>最近生成</span>
                <span className="font-semibold">{stats.totalArtifacts}</span>
              </div>
              <div className="grid gap-2">
                {artifacts.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex flex-col justify-center rounded border border-brand-border/40 bg-brand-offwhite p-2">
                    <div className="flex items-center justify-between">
                      <div className="truncate text-xs font-semibold text-brand-dark">{item.title}</div>
                      <div className="text-[9px] text-brand-gray">{new Date(item.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-md border border-brand-border/60 bg-white p-4">
              <div className="text-[11px] uppercase tracking-[0.12em] text-brand-gray mb-3 pb-2 border-b border-brand-border/40 flex justify-between items-center">
                <span>近期专题汇总</span>
              </div>
              <div className="grid gap-2">
                {(communitySummary?.topics || []).slice(0, 3).map((item) => (
                  <Link key={item.uid} to={`/formal/topic/${item.uid}`} className="rounded border border-brand-border/50 bg-brand-offwhite p-2 transition-colors hover:bg-white truncate">
                    <div className="font-semibold text-brand-dark text-xs truncate">{item.title}</div>
                  </Link>
                ))}
              </div>
            </section>

          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default WorkspacePage;
