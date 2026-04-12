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
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('overview');
  const [artifacts, setArtifacts] = useState<GeneratedArtifact[]>([]);
  const [exports, setExports] = useState<ExportRecord[]>([]);
  const [stats, setStats] = useState({ totalArtifacts: 0, totalExports: 0 });
  const [communitySummary, setCommunitySummary] = useState<Awaited<ReturnType<typeof getCommunitySummary>> | null>(null);

  const load = async () => {
    const [arts, exps, totalArtifacts, totalExports, summary] = await Promise.all([
      db.artifacts.orderBy('createdAt').reverse().limit(8).toArray(),
      db.exports.orderBy('createdAt').reverse().limit(5).toArray(),
      db.artifacts.count(),
      db.exports.count(),
      getCommunitySummary(),
    ]);
    setArtifacts(arts);
    setExports(exps);
    setStats({ totalArtifacts, totalExports });
    setCommunitySummary(summary);
  };

  useEffect(() => {
    load();
  }, []);

  const quickTools = useMemo(
    () => ['sensitive-comm', 'rate-offer', 'acceptance-calc', 'material-checklist'].map((id) => ({ id, ...TOOL_META[id] })),
    [],
  );

  const deleteArtifact = async (id: number) => {
    await db.artifacts.delete(id);
    await load();
  };

  const formalChannels: string[] = ['经验分享', '系统操作', '合规探讨', '专题'];
  const formalHotThreads = (communitySummary?.hotThreads || []).filter(t => formalChannels.includes(t.channel));

  return (
    <AppLayout title="工作台">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6">
        <section className="flex flex-col gap-3 border-b border-brand-border/40 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-gray">workspace</div>
            <h1 className="mt-3 text-3xl font-semibold text-brand-dark">正式与效率的专业前台。</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-brand-gray">
              工作台是你处理业务的数字总台。汇集历史记录、客户上下文、高频工具，并在业务社区沉淀真实的经验与操作指南。
            </p>
          </div>

          <div className="inline-flex rounded-md border border-brand-border/60 bg-white p-1">
            {[
              { id: 'overview' as const, label: '工具总览' },
              { id: 'community' as const, label: '业务社区' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  'rounded-md px-3 py-2 text-sm font-semibold transition-colors',
                  activeTab === item.id ? 'bg-brand-dark text-white' : 'text-brand-gray hover:text-brand-dark',
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </section>

        {activeTab === 'overview' ? (
          <div className="grid gap-6">
            <section className="grid gap-3 md:grid-cols-4">
              {[
                { label: '生成记录', value: stats.totalArtifacts, icon: FileText },
                { label: '导出次数', value: stats.totalExports, icon: Download },
                { label: '社区主题', value: communitySummary?.totalThreads ?? 0, icon: MessageSquare },
                { label: '专题数量', value: communitySummary?.totalTopics ?? 0, icon: Sparkles },
              ].map((item) => (
                <div key={item.label} className="rounded-md border border-brand-border/60 bg-white p-4">
                  <item.icon size={16} className="text-brand-gray" />
                  <div className="mt-3 text-2xl font-semibold text-brand-dark">{item.value}</div>
                  <div className="mt-1 text-[11px] uppercase tracking-[0.12em] text-brand-gray">{item.label}</div>
                </div>
              ))}
            </section>

            <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
              <div className="rounded-md border border-brand-border/60 bg-white">
                <div className="flex items-center justify-between border-b border-brand-border/40 px-4 py-3">
                  <div className="text-sm font-semibold text-brand-dark">当前客户上下文</div>
                  {hasCustomer ? (
                    <button type="button" onClick={clearCustomer} className="text-xs text-brand-gray hover:text-brand-dark">
                      清除
                    </button>
                  ) : null}
                </div>
                <div className="p-4">
                  {hasCustomer ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {[
                        { label: '客户名称', value: customer.name },
                        { label: '联系人', value: customer.contactPerson },
                        { label: '行业', value: customer.industry },
                        { label: '电话', value: customer.phone },
                        { label: '渠道', value: customer.channel },
                      ].filter((item) => item.value).map((item) => (
                        <div key={item.label}>
                          <div className="text-[11px] text-brand-gray">{item.label}</div>
                          <div className="mt-1 text-sm font-semibold text-brand-dark">{item.value}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      <p className="text-sm leading-7 text-brand-gray">
                        当前没有客户上下文。填入一个名称后，工具页会继续复用这条信息。
                      </p>
                      <input
                        placeholder="输入客户名称后按回车"
                        className="rounded-md border border-brand-border/60 bg-brand-offwhite px-3 py-2 text-sm outline-none"
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
              </div>

              <div className="rounded-md border border-brand-border/60 bg-white">
                <div className="border-b border-brand-border/40 px-4 py-3 text-sm font-semibold text-brand-dark">快速进入工具</div>
                <div className="grid gap-3 p-4 sm:grid-cols-2">
                  {quickTools.map((tool) => (
                    <Link
                      key={tool.id}
                      to={tool.path}
                      className="rounded-md border border-brand-border/50 bg-brand-offwhite p-4 transition-colors hover:bg-white"
                    >
                      <div className="text-sm font-semibold text-brand-dark">{tool.name}</div>
                      <div className="mt-2 inline-flex items-center gap-1 text-xs text-brand-gray">
                        打开
                        <ArrowRight size={12} />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-md border border-brand-border/60 bg-white">
                <div className="flex items-center justify-between border-b border-brand-border/40 px-4 py-3">
                  <div className="text-sm font-semibold text-brand-dark">最近生成记录</div>
                  <span className="text-xs text-brand-gray">{stats.totalArtifacts} 条</span>
                </div>
                <div className="grid gap-3 p-4">
                  {artifacts.length ? artifacts.map((item) => {
                    const meta = TOOL_META[item.toolId] || { name: item.toolId, path: '/' };
                    return (
                      <div key={item.id} className="flex items-start gap-3 rounded-md border border-brand-border/50 bg-brand-offwhite p-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-3">
                            <div className="truncate text-sm font-semibold text-brand-dark">{item.title}</div>
                            <div className="text-[11px] text-brand-gray">{new Date(item.createdAt).toLocaleString('zh-CN')}</div>
                          </div>
                          <div className="mt-2 line-clamp-2 text-sm leading-6 text-brand-gray">{item.content}</div>
                          <div className="mt-3 flex items-center gap-3 text-xs">
                            <span className="rounded-md border border-brand-border/50 px-2 py-1 text-brand-gray">{meta.name}</span>
                            <Link to={meta.path} className="text-brand-dark hover:underline">再次使用</Link>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => item.id && deleteArtifact(item.id)}
                          className="rounded-md border border-brand-border/50 p-2 text-brand-gray hover:text-brand-dark"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  }) : (
                    <div className="rounded-md border border-dashed border-brand-border/60 p-8 text-center text-sm text-brand-gray">
                      还没有生成记录。
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-md border border-brand-border/60 bg-white">
                <div className="flex items-center justify-between border-b border-brand-border/40 px-4 py-3">
                  <div className="text-sm font-semibold text-brand-dark">社区脉冲摘要</div>
                  <button type="button" onClick={() => setActiveTab('community')} className="text-xs text-brand-dark hover:underline">查看社区</button>
                </div>
                <div className="grid gap-3 p-4">
                  {formalHotThreads.slice(0, 3).map((item) => (
                    <Link key={item.uid} to={item.kind === 'topic' ? `/bbs/topic/${item.uid}` : `/bbs/thread/${item.uid}`} className="rounded-md border border-brand-border/50 bg-brand-offwhite p-4 transition-colors hover:bg-white">
                      <div className="text-[11px] text-brand-gray">{item.channel}</div>
                      <div className="mt-2 text-sm font-semibold text-brand-dark">{item.title}</div>
                      <div className="mt-2 line-clamp-2 text-sm leading-6 text-brand-gray">{item.content}</div>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          </div>
        ) : (
          <div className="grid gap-6">
            <section className="rounded-md border border-brand-border/60 bg-white p-5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-gray">formal community</div>
              <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-brand-dark">专业、效率、共享的业务前台。</h2>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-brand-gray">
                    大家分享的经验、系统操作在这里汇总。如果你想找个地方八卦吐槽或者二手交易...去茶水间看看吧，那是另一个世界。
                  </p>
                </div>
                <Link
                  to="/bbs"
                  className="inline-flex shrink-0 items-center gap-2 rounded-md border border-[#2d1b0d] bg-[#1a0e05] px-4 py-2.5 text-sm font-semibold text-[#f7b98d] transition-colors hover:bg-black hover:border-[#f7b98d]/30"
                >
                  去往茶水间
                  <Lock size={15} />
                </Link>
              </div>
            </section>

            <section className="grid gap-4 lg:grid-cols-3">
              <div className="rounded-md border border-brand-border/60 bg-white p-4">
                <div className="text-[11px] uppercase tracking-[0.12em] text-brand-gray">热门主题</div>
                <div className="mt-3 grid gap-3">
                  {(communitySummary?.hotThreads || []).slice(0, 3).map((item) => (
                    <Link key={item.uid} to={item.kind === 'topic' ? `/bbs/topic/${item.uid}` : `/bbs/thread/${item.uid}`} className="rounded-md border border-brand-border/50 bg-brand-offwhite p-3 transition-colors hover:bg-white">
                      <div className="text-[11px] text-brand-gray">{item.channel} · {formatRelativeTime(item.createdAt)}</div>
                      <div className="mt-2 text-sm font-semibold text-brand-dark">{item.title}</div>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="rounded-md border border-brand-border/60 bg-white p-4">
                <div className="text-[11px] uppercase tracking-[0.12em] text-brand-gray">最新 Gossip</div>
                <div className="mt-3 grid gap-3">
                  {(communitySummary?.latestGossip || []).slice(0, 3).map((item) => (
                    <Link key={item.uid} to={`/bbs/thread/${item.uid}`} className="rounded-md border border-brand-border/50 bg-brand-offwhite p-3 transition-colors hover:bg-white">
                      <div className="text-sm leading-6 text-brand-dark line-clamp-3">{item.content}</div>
                      <div className="mt-2 text-[11px] text-brand-gray">{formatExpiry(item.expiresAt)}</div>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="rounded-md border border-brand-border/60 bg-white p-4">
                <div className="text-[11px] uppercase tracking-[0.12em] text-brand-gray">专题入口</div>
                <div className="mt-3 grid gap-3">
                  {(communitySummary?.topics || []).slice(0, 3).map((item) => (
                    <Link key={item.uid} to={`/bbs/topic/${item.uid}`} className="rounded-md border border-brand-border/50 bg-brand-offwhite p-3 transition-colors hover:bg-white">
                      <div className="text-sm font-semibold text-brand-dark">{item.title}</div>
                      <div className="mt-2 text-[11px] text-brand-gray">{item.replyCount} 条讨论</div>
                    </Link>
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-md border border-brand-border/60 bg-white p-4">
              <div className="text-[11px] uppercase tracking-[0.12em] text-brand-gray">待销毁暗帖</div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {(communitySummary?.expiringThreads || []).slice(0, 4).map((item) => (
                  <Link key={item.uid} to={`/bbs/thread/${item.uid}`} className="rounded-md border border-brand-border/50 bg-brand-offwhite p-4 transition-colors hover:bg-white">
                    <div className="text-sm font-semibold text-brand-dark">{item.title}</div>
                    <div className="mt-2 text-sm leading-6 text-brand-gray line-clamp-2">{item.content}</div>
                    <div className="mt-3 inline-flex items-center gap-1 text-[11px] text-brand-gray">
                      <Clock3 size={12} />
                      {formatExpiry(item.expiresAt)}
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            <section className="rounded-md border border-brand-border/60 bg-white p-4">
              <div className="text-[11px] uppercase tracking-[0.12em] text-brand-gray">最近导出</div>
              <div className="mt-3 grid gap-3">
                {exports.length ? exports.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-md border border-brand-border/50 bg-brand-offwhite p-3 text-sm">
                    <div>
                      <div className="font-semibold text-brand-dark">{item.filename || item.format.toUpperCase()}</div>
                      <div className="mt-1 text-[11px] text-brand-gray">{new Date(item.createdAt).toLocaleString('zh-CN')}</div>
                    </div>
                    <div className="inline-flex items-center gap-2 text-brand-gray">
                      <Download size={14} />
                      {item.format}
                    </div>
                  </div>
                )) : (
                  <div className="rounded-md border border-dashed border-brand-border/60 p-8 text-center text-sm text-brand-gray">
                    还没有导出记录。
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default WorkspacePage;
