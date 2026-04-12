import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { MessageSquare, Send, Sparkles } from 'lucide-react';
import CyberLayout from '../../components/layout/CyberLayout';
import CommunityAccessGate from '../../components/community/CommunityAccessGate';
import {
  createCommunityReply,
  formatExpiry,
  formatRelativeTime,
  getCommunityThread,
  promoteCommunityThreadToTopic,
} from '../../../lib/community';

const CommunityThreadPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<Awaited<ReturnType<typeof getCommunityThread>>>(null);
  const [content, setContent] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [promoting, setPromoting] = useState(false);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    try {
      setDetail(await getCommunityThread(id));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleReply = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!id || !content.trim()) return;
    setSubmitting(true);
    try {
      await createCommunityReply({
        threadId: id,
        content: content.trim(),
        anonymous,
        author: anonymous ? '匿名节点' : '当前浏览器',
      });
      setContent('');
      setAnonymous(false);
      await load();
    } finally {
      setSubmitting(false);
    }
  };

  const handlePromote = async () => {
    if (!id) return;
    setPromoting(true);
    try {
      await promoteCommunityThreadToTopic(id);
      navigate(`/bbs/topic/${id}`);
    } finally {
      setPromoting(false);
    }
  };

  return (
    <CyberLayout title="帖子详情" subtitle="本地线程 · 匿名回复" showBack>
      <CommunityAccessGate moduleName={`解密节点残留数据碎片_${id?.slice(0,6)}`} />
      <div className="mx-auto max-w-4xl px-4 py-5 font-mono">
        {loading ? (
          <div className="border border-[#00ff41]/30 bg-[#00ff41]/5 p-6 text-sm text-[#00ff41]/60 animate-pulse">正在提取底层碎片...</div>
        ) : !detail ? (
          <div className="border border-red-900/50 bg-red-950/20 p-6 text-sm text-red-500">404 - 节点由于时间限制已被销毁。</div>
        ) : (
          <div className="grid gap-4">
            <section className="border border-[#00ff41]/30 bg-black p-5 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#00ff41] opacity-50"></div>
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#00ff41] opacity-50"></div>
              
              <div className="flex flex-wrap items-center gap-3 text-[10px] text-[#00ff41]/60 font-bold uppercase tracking-widest">
                <span className="border border-[#00ff41] px-1.5 py-0.5 bg-[#00ff41]/10 text-[#00ff41] shadow-[0_0_8px_rgba(0,255,65,0.4)]">{detail.thread.channel}</span>
                <span>SYS.TIME // {formatRelativeTime(detail.thread.createdAt)}</span>
                {detail.thread.expiresAt ? <span className="text-red-500">EXP // {formatExpiry(detail.thread.expiresAt)}</span> : null}
                <span>AUTHOR // {detail.thread.author}</span>
              </div>
              <h1 className="mt-4 text-xl sm:text-2xl font-bold text-[#00ff41] shadow-[0_0_8px_rgba(0,255,65,0.2)]">{detail.thread.title}</h1>
              <p className="mt-4 sm:mt-5 whitespace-pre-wrap text-xs sm:text-sm leading-6 sm:leading-7 text-[#00ff41]/80">{detail.thread.content}</p>
              <div className="mt-6 flex flex-wrap items-center gap-4 text-[10px] font-bold">
                <span className="inline-flex items-center gap-1 text-[#00ff41]">
                  <MessageSquare size={13} />
                  REPLIES: {detail.thread.replyCount}
                </span>
                {detail.thread.kind !== 'topic' ? (
                  <button
                    type="button"
                    onClick={handlePromote}
                    disabled={promoting}
                    className="inline-flex items-center gap-2 border border-purple-900/50 bg-purple-950/20 px-3 py-2 text-[10px] font-bold text-purple-400 transition-colors hover:border-purple-500 hover:bg-purple-900/30 disabled:opacity-50 tracking-widest"
                  >
                    <Sparkles size={13} />
                    {promoting ? 'PROCESSING...' : 'PROMOTE_TO_TOPIC'}
                  </button>
                ) : null}
                <Link
                  to="/bbs"
                  className="ml-auto text-[10px] sm:text-xs text-[#00ff41]/50 hover:text-[#00ff41] hover:underline uppercase tracking-widest"
                >
                  &lt; EXIT_NODE
                </Link>
              </div>
            </section>

            <section className="border border-[#00ff41]/30 bg-black p-5">
              <div className="text-[10px] uppercase tracking-widest text-[#00ff41]/60 font-bold border-b border-[#00ff41]/30 pb-2 mb-4">&gt; 接入本地共鸣网络</div>
              <form className="grid gap-3" onSubmit={handleReply}>
                <textarea
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  className="min-h-24 border border-[#00ff41]/50 bg-black px-3 py-2 text-sm leading-6 text-[#00ff41] outline-none placeholder:text-[#00ff41]/30 focus:border-[#00ff41]"
                  placeholder="注入信息碎片..."
                />
                <label className="inline-flex items-center gap-2 text-sm text-[#00ff41]">
                  <input type="checkbox" checked={anonymous} onChange={(event) => setAnonymous(event.target.checked)} className="accent-[#00ff41] bg-black border-[#00ff41]" />
                  启用洋葱路由隐藏身份
                </label>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 border border-[#00ff41] bg-black px-4 py-2 text-sm font-bold text-[#00ff41] transition-colors hover:bg-[#00ff41] hover:text-black disabled:opacity-50"
                  >
                    <Send size={14} />
                    {submitting ? '传输中...' : '提交数据'}
                  </button>
                </div>
              </form>
            </section>

            <section className="border border-[#00ff41]/30 bg-black p-5">
              <div className="text-[10px] uppercase tracking-widest text-[#00ff41]/60 font-bold border-b border-[#00ff41]/30 pb-2 mb-4">&gt; 返回信号</div>
              <div className="grid gap-3">
                {detail.replies.length ? detail.replies.map((reply) => (
                  <div key={reply.uid} className="border border-[#00ff41]/20 bg-[#00ff41]/5 p-4 hover:border-[#00ff41]/50 transition-colors">
                    <div className="flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-widest font-bold">
                      <span className="text-[#00ff41] break-all">{reply.author}</span>
                      <span className="text-[#00ff41]/50">{formatRelativeTime(reply.createdAt)}</span>
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#00ff41]/80">{reply.content}</p>
                  </div>
                )) : (
                  <div className="border border-dashed border-[#00ff41]/30 p-8 text-center text-sm text-[#00ff41]/40 font-bold uppercase tracking-widest">
                    NO_SIGNAL_RECEIVED.
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </CyberLayout>
  );
};

export default CommunityThreadPage;
