import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Clock3,
  Flame,
  Lock,
  MessageSquare,
  Plus,
  Search,
  Shield,
  Sparkles,
  TerminalSquare,
} from 'lucide-react';
import CyberLayout from '../../components/layout/CyberLayout';
import CommunityAccessGate from '../../components/community/CommunityAccessGate';
import {
  COMMUNITY_CHANNELS,
  type CommunityChannel,
  type CommunityEntry,
  createCommunityThread,
  formatExpiry,
  formatRelativeTime,
  getCommunitySummary,
  listCommunityEntries,
} from '../../../lib/community';
import { cn } from '../../../lib/utils';

const CHANNEL_FILTERS: Array<CommunityChannel | '全部'> = ['全部', ...COMMUNITY_CHANNELS];

const channelColorMap: Record<CommunityChannel, string> = {
  '经验分享': 'text-[#94f7b8] border-[#21432f] bg-[#0b1711]',
  '系统操作': 'text-[#8fd8ff] border-[#1f3c4d] bg-[#09141b]',
  '今日生活': 'text-[#f7d28d] border-[#4a3620] bg-[#171109]',
  '暗帖区': 'text-[#ff8ca7] border-[#5b2230] bg-[#1a0d12]',
  'Gossip 贴板': 'text-[#ffc78a] border-[#5b3b22] bg-[#1a120c]',
  '专题': 'text-[#d6c2ff] border-[#372852] bg-[#0f0b19]',
};

const BBSPage: React.FC = () => {
  const [entries, setEntries] = useState<CommunityEntry[]>([]);
  const [activeChannel, setActiveChannel] = useState<CommunityChannel | '全部'>('全部');
  const [searchQuery, setSearchQuery] = useState('');
  const [summary, setSummary] = useState<Awaited<ReturnType<typeof getCommunitySummary>> | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    channel: '经验分享' as CommunityChannel,
    anonymous: false,
    title: '',
    content: '',
  });

  const load = async () => {
    const [items, nextSummary] = await Promise.all([
      listCommunityEntries(activeChannel),
      getCommunitySummary(),
    ]);
    setEntries(items);
    setSummary(nextSummary);
  };

  useEffect(() => {
    load();
  }, [activeChannel]);

  const visibleEntries = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return entries;
    return entries.filter((entry) =>
      [entry.title, entry.content, entry.author, entry.channel]
        .join(' ')
        .toLowerCase()
        .includes(query),
    );
  }, [entries, searchQuery]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;

    setSubmitting(true);
    try {
      await createCommunityThread({
        title: form.title.trim(),
        content: form.content.trim(),
        channel: form.channel,
        anonymous: form.anonymous,
        author: form.anonymous ? '匿名节点' : '当前浏览器',
      });
      setForm({ channel: form.channel, anonymous: false, title: '', content: '' });
      setComposerOpen(false);
      await load();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CyberLayout title="暗网社区" subtitle="本地原型 · 匿名发帖 · Gossip 汇总">
      <CommunityAccessGate />

      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-5">
        <section className="rounded-lg border border-[#21432f] bg-[#07110d] p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-[#70a17f]">open node / local only</div>
              <h1 className="mt-2 text-2xl font-semibold text-[#f2fff5]">经验、系统、生活和暗帖，都在同一个本地节点里。</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[#8fb09a]">
                当前是浏览器本地社区原型。帖子、回复、专题与 gossip 只保存在当前设备，不代表真实全员共享社区。
              </p>
            </div>

            <button
              type="button"
              onClick={() => setComposerOpen((current) => !current)}
              className="inline-flex items-center gap-2 rounded-md border border-[#21432f] bg-[#0b1711] px-4 py-2 text-sm font-semibold text-[#c8ffd7] transition-colors hover:border-[#2d6541]"
            >
              <Plus size={15} />
              发布本地帖子
            </button>
          </div>
        </section>

        {composerOpen ? (
          <section className="rounded-lg border border-[#21432f] bg-[#07110d] p-4">
            <form className="grid gap-3" onSubmit={handleSubmit}>
              <div className="grid gap-3 md:grid-cols-[160px_1fr]">
                <label className="grid gap-1 text-xs text-[#70a17f]">
                  频道
                  <select
                    value={form.channel}
                    onChange={(event) => setForm((current) => ({ ...current, channel: event.target.value as CommunityChannel }))}
                    className="rounded-md border border-[#21432f] bg-[#0b1711] px-3 py-2 text-sm text-[#f2fff5] outline-none"
                  >
                    {COMMUNITY_CHANNELS.filter((item) => item !== '专题').map((channel) => (
                      <option key={channel} value={channel}>{channel}</option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-1 text-xs text-[#70a17f]">
                  标题
                  <input
                    value={form.title}
                    onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                    className="rounded-md border border-[#21432f] bg-[#0b1711] px-3 py-2 text-sm text-[#f2fff5] outline-none"
                    placeholder="写一个足够清楚的标题"
                  />
                </label>
              </div>

              <label className="grid gap-1 text-xs text-[#70a17f]">
                正文
                <textarea
                  value={form.content}
                  onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))}
                  className="min-h-28 rounded-md border border-[#21432f] bg-[#0b1711] px-3 py-2 text-sm leading-6 text-[#f2fff5] outline-none"
                  placeholder="描述经验、系统入口、今天的观察，或者一条匿名暗帖。"
                />
              </label>

              <label className="inline-flex items-center gap-2 text-sm text-[#c8ffd7]">
                <input
                  type="checkbox"
                  checked={form.anonymous}
                  onChange={(event) => setForm((current) => ({ ...current, anonymous: event.target.checked }))}
                />
                匿名节点发布
              </label>

              <div className="flex items-center justify-between gap-3 text-[11px] text-[#70a17f]">
                <span>暗帖区与 Gossip 贴板默认 24 小时后自动销毁。</span>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-md border border-[#21432f] bg-[#0f1d15] px-4 py-2 text-sm font-semibold text-[#c8ffd7] transition-colors hover:border-[#2d6541] disabled:opacity-50"
                >
                  <Shield size={14} />
                  {submitting ? '发布中...' : '写入本地节点'}
                </button>
              </div>
            </form>
          </section>
        ) : null}

        <section className="grid gap-3 md:grid-cols-4">
          {[
            { label: '活跃主题', value: summary?.totalThreads ?? 0, icon: MessageSquare },
            { label: '专题数量', value: summary?.totalTopics ?? 0, icon: Sparkles },
            { label: 'Gossip 条目', value: summary?.totalGossip ?? 0, icon: Lock },
            { label: '本地回复', value: summary?.totalReplies ?? 0, icon: TerminalSquare },
          ].map((item) => (
            <div key={item.label} className="rounded-lg border border-[#21432f] bg-[#07110d] p-4">
              <item.icon size={16} className="text-[#8cffb0]" />
              <div className="mt-3 text-2xl font-semibold text-[#f2fff5]">{item.value}</div>
              <div className="mt-1 text-[11px] uppercase tracking-[0.16em] text-[#70a17f]">{item.label}</div>
            </div>
          ))}
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-lg border border-[#21432f] bg-[#07110d] p-4">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap gap-2">
                {CHANNEL_FILTERS.map((channel) => (
                  <button
                    key={channel}
                    type="button"
                    onClick={() => setActiveChannel(channel)}
                    className={cn(
                      'rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors',
                      activeChannel === channel
                        ? 'border-[#3e7d54] bg-[#102016] text-[#d7ffe3]'
                        : 'border-[#21432f] bg-[#0b1711] text-[#70a17f] hover:border-[#2d6541]',
                    )}
                  >
                    {channel}
                  </button>
                ))}
              </div>

              <div className="relative w-full md:max-w-xs">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#70a17f]" />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="搜索标题、正文、频道"
                  className="w-full rounded-md border border-[#21432f] bg-[#0b1711] py-2 pl-9 pr-3 text-sm text-[#f2fff5] outline-none"
                />
              </div>
            </div>

            <div className="grid gap-3">
              {visibleEntries.length > 0 ? (
                visibleEntries.map((entry) => (
                  <Link
                    key={entry.uid}
                    to={entry.kind === 'topic' ? `/bbs/topic/${entry.uid}` : `/bbs/thread/${entry.uid}`}
                    className="rounded-lg border border-[#21432f] bg-[#0b1711] p-4 transition-colors hover:border-[#2d6541]"
                  >
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#70a17f]">
                      <span className={cn('rounded-md border px-2 py-1', channelColorMap[entry.channel])}>
                        {entry.channel}
                      </span>
                      <span>{formatRelativeTime(entry.createdAt)}</span>
                      {entry.expiresAt ? <span>{formatExpiry(entry.expiresAt)}</span> : null}
                    </div>
                    <div className="mt-3 flex items-start justify-between gap-3">
                      <div>
                        <div className="text-base font-semibold text-[#f2fff5]">{entry.title}</div>
                        <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#9fc0aa]">{entry.content}</p>
                      </div>
                      <ArrowRight size={16} className="shrink-0 text-[#8cffb0]" />
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-[#70a17f]">
                      <span>{entry.author}</span>
                      <span className="inline-flex items-center gap-1"><MessageSquare size={12} /> {entry.replyCount}</span>
                      <span className="inline-flex items-center gap-1"><Flame size={12} /> {entry.likes}</span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-[#21432f] bg-[#0b1711] p-8 text-center text-sm text-[#70a17f]">
                  当前筛选下没有本地帖子。
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-4">
            <section className="rounded-lg border border-[#21432f] bg-[#07110d] p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#70a17f]">最新 Gossip</div>
              <div className="mt-3 grid gap-2">
                {summary?.latestGossip.length ? summary.latestGossip.map((item) => (
                  <Link
                    key={item.uid}
                    to={`/bbs/thread/${item.uid}`}
                    className="rounded-md border border-[#5b3b22] bg-[#1a120c] p-3 text-sm text-[#ffd8ae] transition-colors hover:border-[#8a5c37]"
                  >
                    <div className="line-clamp-2">{item.content}</div>
                    <div className="mt-2 text-[11px] text-[#d0a06f]">{formatExpiry(item.expiresAt)}</div>
                  </Link>
                )) : <div className="text-sm text-[#70a17f]">暂无 gossip</div>}
              </div>
            </section>

            <section className="rounded-lg border border-[#21432f] bg-[#07110d] p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#70a17f]">专题入口</div>
              <div className="mt-3 grid gap-2">
                {summary?.topics.length ? summary.topics.map((item) => (
                  <Link
                    key={item.uid}
                    to={`/bbs/topic/${item.uid}`}
                    className="rounded-md border border-[#372852] bg-[#0f0b19] p-3 text-sm text-[#e3d7ff] transition-colors hover:border-[#5b4390]"
                  >
                    <div>{item.title}</div>
                    <div className="mt-2 text-[11px] text-[#a78bd6]">{item.replyCount} 条讨论</div>
                  </Link>
                )) : <div className="text-sm text-[#70a17f]">暂无专题</div>}
              </div>
            </section>

            <section className="rounded-lg border border-[#21432f] bg-[#07110d] p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#70a17f]">待销毁暗帖</div>
              <div className="mt-3 grid gap-2">
                {summary?.expiringThreads.length ? summary.expiringThreads.map((item) => (
                  <Link
                    key={item.uid}
                    to={`/bbs/thread/${item.uid}`}
                    className="rounded-md border border-[#5b2230] bg-[#1a0d12] p-3 text-sm text-[#ffccda] transition-colors hover:border-[#8c3a4d]"
                  >
                    <div className="line-clamp-2">{item.title}</div>
                    <div className="mt-2 inline-flex items-center gap-1 text-[11px] text-[#ffa7bf]">
                      <Clock3 size={11} />
                      {formatExpiry(item.expiresAt)}
                    </div>
                  </Link>
                )) : <div className="text-sm text-[#70a17f]">暂无限时暗帖</div>}
              </div>
            </section>
          </div>
        </section>
      </div>
    </CyberLayout>
  );
};

export default BBSPage;
