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
  Terminal
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

const PANTRY_CHANNELS: CommunityChannel[] = ['匿名吐槽', 'Gossip 贴板', '二手交易'];
const CHANNEL_FILTERS: Array<CommunityChannel | '全部'> = ['全部', ...PANTRY_CHANNELS];

const channelColorMap: Record<string, string> = {
  '匿名吐槽': 'text-red-500 border-red-900 bg-red-950/30',
  'Gossip 贴板': 'text-amber-500 border-amber-900 bg-amber-950/30',
  '二手交易': 'text-purple-400 border-purple-900 bg-purple-950/30',
};

const BBSPage: React.FC = () => {
  const [entries, setEntries] = useState<CommunityEntry[]>([]);
  const [activeChannel, setActiveChannel] = useState<CommunityChannel | '全部'>('全部');
  const [searchQuery, setSearchQuery] = useState('');
  const [summary, setSummary] = useState<Awaited<ReturnType<typeof getCommunitySummary>> | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    channel: '匿名吐槽' as CommunityChannel,
    anonymous: true,
    title: '',
    content: '',
  });

  const load = async () => {
    const nextSummary = await getCommunitySummary();
    const loadedItems = await listCommunityEntries(activeChannel === '全部' ? undefined : activeChannel);
    const filteredItems = activeChannel === '全部' 
      ? loadedItems.filter((item) => PANTRY_CHANNELS.includes(item.channel as any))
      : loadedItems;

    setEntries(filteredItems);
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
      setForm({ channel: form.channel, anonymous: true, title: '', content: '' });
      setComposerOpen(false);
      await load();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CyberLayout title="茶水间" subtitle="另一个世界 · 匿名吐槽 · 闲置交易">
      <CommunityAccessGate moduleName="地下茶水间节点" />

      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-5 font-mono">
        {/* Header Hero Section */}
        <section className="rounded-none border border-[#00ff41]/50 bg-black p-4 shadow-[0_0_15px_rgba(0,255,65,0.1)] relative overflow-hidden">
          {/* subtle scanline for hero */}
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(0,255,65,0.02),rgba(0,255,65,0.02))] bg-[length:100%_4px,3px_100%] opacity-20 z-0"></div>

          <div className="relative z-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-[#00ff41]/50 flex items-center gap-2">
                <Terminal className="w-3 h-3 text-[#00ff41]/70" /> the pantry / local only
              </div>
              <h1 className="mt-2 text-2xl font-bold text-[#00ff41] glitch-hover">这里是真实的地下世界。</h1>
              <p className="mt-2 max-w-3xl text-xs leading-6 text-[#00ff41]/70">
                各种八卦、降薪吐槽、闲置交易在此畅所欲言。默认 24 小时后自动销毁，不留痕迹。
              </p>
            </div>

            <button
              type="button"
              onClick={() => setComposerOpen((current) => !current)}
              className="inline-flex items-center gap-2 border border-[#00ff41] bg-[#00ff41]/10 px-4 py-2 text-sm font-bold text-[#00ff41] transition-all hover:bg-[#00ff41] hover:text-black group"
            >
              <Plus size={15} className="group-hover:animate-spin" />
              发布加密贴
            </button>
          </div>
        </section>

        {composerOpen ? (
          <section className="rounded-none border border-[#00ff41]/50 bg-[#00ff41]/5 p-4 shadow-[0_0_15px_rgba(0,255,65,0.1)]">
            <form className="grid gap-3" onSubmit={handleSubmit}>
              <div className="text-[10px] text-[#00ff41]/50 uppercase tracking-widest border-b border-[#00ff41]/30 pb-2 mb-2">
                &gt; EXECUTE SYNC_POST
              </div>
              <div className="grid gap-3 md:grid-cols-[160px_1fr]">
                <label className="grid gap-1 text-xs text-[#00ff41]/70 font-bold">
                  频道
                  <select
                    value={form.channel}
                    onChange={(event) => setForm((current) => ({ ...current, channel: event.target.value as CommunityChannel }))}
                    className="rounded-none border border-[#00ff41]/50 bg-black px-3 py-2 text-sm text-[#00ff41] outline-none focus:border-[#00ff41]"
                  >
                    {PANTRY_CHANNELS.map((channel) => (
                      <option key={channel} value={channel}>{channel}</option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-1 text-xs text-[#00ff41]/70 font-bold">
                  标题
                  <input
                    value={form.title}
                    onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                    className="rounded-none border border-[#00ff41]/50 bg-black px-3 py-2 text-sm text-[#00ff41] outline-none placeholder:text-[#00ff41]/30 focus:border-[#00ff41]"
                    placeholder="请输入标题"
                  />
                </label>
              </div>

              <label className="grid gap-1 text-xs text-[#00ff41]/70 font-bold">
                正文
                <textarea
                  value={form.content}
                  onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))}
                  className="min-h-28 rounded-none border border-[#00ff41]/50 bg-black px-3 py-2 text-sm leading-6 text-[#00ff41] outline-none placeholder:text-[#00ff41]/30 focus:border-[#00ff41]"
                  placeholder="吐个槽，爆个料，或者出个闲置..."
                />
              </label>

              <label className="inline-flex items-center gap-2 text-sm text-[#00ff41]">
                <input
                  type="checkbox"
                  checked={form.anonymous}
                  onChange={(event) => setForm((current) => ({ ...current, anonymous: event.target.checked }))}
                  className="accent-[#00ff41] bg-black border-[#00ff41]"
                />
                启用匿名洋葱网络
              </label>

              <div className="flex items-center justify-between gap-3 text-[11px] text-[#00ff41]/60">
                <span>* 警告：24小时后将自动抹除数据片段。</span>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 border border-[#00ff41] bg-black px-4 py-2 text-sm font-bold text-[#00ff41] transition-colors hover:bg-[#00ff41] hover:text-black disabled:opacity-50 disabled:hover:bg-black disabled:hover:text-[#00ff41]"
                >
                  <Shield size={14} />
                  {submitting ? '加密传输中...' : '写入节点'}
                </button>
              </div>
            </form>
          </section>
        ) : null}

        {/* Stats */}
        <section className="grid gap-3 md:grid-cols-4">
          {[
            { label: '活跃探针', value: summary?.totalThreads ?? 0, icon: MessageSquare },
            { label: '专题索引', value: summary?.totalTopics ?? 0, icon: Sparkles },
            { label: 'Gossip 暗号', value: summary?.totalGossip ?? 0, icon: Lock },
            { label: '共鸣互动', value: summary?.totalReplies ?? 0, icon: TerminalSquare },
          ].map((item) => (
            <div key={item.label} className="border border-[#00ff41]/30 bg-[#00ff41]/5 p-4 hover:bg-[#00ff41]/10 transition-colors">
              <item.icon size={16} className="text-[#00ff41] mb-2" />
              <div className="text-2xl font-bold text-[#00ff41] drop-shadow-[0_0_8px_rgba(0,255,65,0.8)]">{item.value}</div>
              <div className="mt-1 text-[10px] uppercase tracking-widest text-[#00ff41]/60">{item.label}</div>
            </div>
          ))}
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="border border-[#00ff41]/30 bg-black p-4">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap gap-2">
                {CHANNEL_FILTERS.map((channel) => (
                  <button
                    key={channel}
                    type="button"
                    onClick={() => setActiveChannel(channel)}
                    className={cn(
                      'border px-3 py-1.5 text-xs font-bold transition-colors',
                      activeChannel === channel
                        ? 'border-[#00ff41] bg-[#00ff41] text-black shadow-[0_0_10px_rgba(0,255,65,0.4)]'
                        : 'border-[#00ff41]/30 bg-[#00ff41]/5 text-[#00ff41]/70 hover:border-[#00ff41]',
                    )}
                  >
                    {channel === '全部' ? '[ALL]' : `[${channel}]`}
                  </button>
                ))}
              </div>

              <div className="relative w-full md:max-w-xs group">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#00ff41]/50 group-focus-within:text-[#00ff41]" />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="检索暗号关键字..."
                  className="w-full border border-[#00ff41]/30 bg-black py-2 pl-9 pr-3 text-sm text-[#00ff41] outline-none placeholder:text-[#00ff41]/30 focus:border-[#00ff41] focus:shadow-[0_0_8px_rgba(0,255,65,0.2)]"
                />
              </div>
            </div>

            <div className="grid gap-3">
              {visibleEntries.length > 0 ? (
                visibleEntries.map((entry) => (
                  <Link
                    key={entry.uid}
                    to={entry.kind === 'topic' ? `/bbs/topic/${entry.uid}` : `/bbs/thread/${entry.uid}`}
                    className="group border border-[#00ff41]/20 bg-black p-4 transition-all hover:border-[#00ff41] hover:bg-[#00ff41]/5 relative overflow-hidden"
                  >
                    {/* Corners */}
                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#00ff41] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#00ff41] opacity-0 group-hover:opacity-100 transition-opacity"></div>

                    <div className="flex flex-wrap items-center gap-2 text-[10px] text-[#00ff41]/60 font-bold tracking-wider uppercase">
                      <span className={cn('border px-1.5 py-0.5', channelColorMap[entry.channel] || 'text-[#00ff41] border-[#00ff41]/50 bg-[#00ff41]/10')}>
                        {entry.channel === 'Gossip 贴板' ? 'GOSSIP' : entry.channel === '匿名吐槽' ? 'RANT' : 'TRADE'}
                      </span>
                      <span>SYS.TIME // {formatRelativeTime(entry.createdAt)}</span>
                      {entry.expiresAt ? <span className="text-red-400">EXP // {formatExpiry(entry.expiresAt)}</span> : null}
                    </div>
                    <div className="mt-3 flex items-start justify-between gap-3">
                      <div>
                        <div className="text-base font-bold text-[#00ff41] group-hover:text-[#00ff41] group-hover:shadow-[0_0_8px_rgba(0,255,65,0.5)] transition-shadow">
                          {entry.title}
                        </div>
                        <p className="mt-2 line-clamp-3 text-xs leading-5 text-[#00ff41]/70">{entry.content}</p>
                      </div>
                      <ArrowRight size={16} className="shrink-0 text-[#00ff41]/30 group-hover:text-[#00ff41] transition-colors" />
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-4 text-[10px] text-[#00ff41]/50 font-bold">
                      <span className="text-[#00ff41] bg-[#00ff41]/10 px-1 py-0.5">AUTHOR: {entry.author}</span>
                      <span className="inline-flex items-center gap-1"><MessageSquare size={10} /> REPS: {entry.replyCount}</span>
                      <span className="inline-flex items-center gap-1"><Flame size={10} /> RESONANCE: {entry.likes}</span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="border border-dashed border-[#00ff41]/30 bg-black p-8 text-center text-sm text-[#00ff41]/50 flex flex-col items-center gap-2 animate-pulse">
                  <TerminalSquare className="w-8 h-8 opacity-50" />
                  <span>404 - ENTRANCE NOT FOUND</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-4">
            <section className="border border-[#00ff41]/30 bg-black p-4">
              <div className="text-[10px] font-bold uppercase tracking-widest text-amber-500 mb-3 border-b border-amber-900/50 pb-1">
                &gt; HOT GOSSIP_
              </div>
              <div className="grid gap-2">
                {summary?.latestGossip.length ? summary.latestGossip.map((item) => (
                  <Link
                    key={item.uid}
                    to={`/bbs/thread/${item.uid}`}
                    className="border border-amber-900/50 bg-amber-950/20 p-3 text-xs text-amber-400 transition-colors hover:border-amber-500 hover:bg-amber-900/30 font-semibold"
                  >
                    <div className="line-clamp-2 leading-relaxed">{item.content}</div>
                    <div className="mt-2 text-[9px] text-amber-500/70 tracking-widest">EXP: {formatExpiry(item.expiresAt)}</div>
                  </Link>
                )) : <div className="text-xs text-[#00ff41]/50">NO_DATA</div>}
              </div>
            </section>

            <section className="border border-[#00ff41]/30 bg-black p-4">
              <div className="text-[10px] font-bold uppercase tracking-widest text-[#00ff41]/70 mb-3 border-b border-[#00ff41]/30 pb-1">
                &gt; INDEXED_TOPICS
              </div>
              <div className="grid gap-2">
                {summary?.topics.length ? summary.topics.map((item) => (
                  <Link
                    key={item.uid}
                    to={`/bbs/topic/${item.uid}`}
                    className="border border-[#00ff41]/30 bg-[#00ff41]/5 p-3 text-xs text-[#00ff41] transition-colors hover:border-[#00ff41] hover:bg-[#00ff41]/10 font-bold"
                  >
                    <div className="leading-relaxed">{item.title}</div>
                    <div className="mt-2 text-[9px] text-[#00ff41]/60 tracking-widest">{item.replyCount} REPLIES_ DETECTED</div>
                  </Link>
                )) : <div className="text-xs text-[#00ff41]/50">NO_DATA</div>}
              </div>
            </section>

            <section className="border border-[#00ff41]/30 bg-black p-4">
              <div className="text-[10px] font-bold uppercase tracking-widest text-red-500 mb-3 border-b border-red-900/50 pb-1 flex items-center gap-1">
                <Clock3 className="w-3 h-3" /> 24H_SELF_DESTRUCT
              </div>
              <div className="grid gap-2">
                {summary?.expiringThreads.length ? summary.expiringThreads.map((item) => (
                  <Link
                    key={item.uid}
                    to={`/bbs/thread/${item.uid}`}
                    className="border border-red-900/50 bg-red-950/20 p-3 text-xs text-red-400 transition-colors hover:border-red-500 hover:bg-red-900/30 font-semibold"
                  >
                    <div className="line-clamp-2 leading-relaxed">{item.title}</div>
                    <div className="mt-2 inline-flex items-center gap-1 text-[9px] text-red-500/70 tracking-widest">
                      EXP: {formatExpiry(item.expiresAt)}
                    </div>
                  </Link>
                )) : <div className="text-xs text-[#00ff41]/50">NO_DATA</div>}
              </div>
            </section>
          </div>
        </section>
      </div>
    </CyberLayout>
  );
};

export default BBSPage;
