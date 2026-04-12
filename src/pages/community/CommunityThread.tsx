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
      <CommunityAccessGate />
      <div className="mx-auto max-w-4xl px-4 py-5">
        {loading ? (
          <div className="rounded-lg border border-[#21432f] bg-[#07110d] p-6 text-sm text-[#70a17f]">正在读取节点...</div>
        ) : !detail ? (
          <div className="rounded-lg border border-[#21432f] bg-[#07110d] p-6 text-sm text-[#70a17f]">未找到这个本地帖子。</div>
        ) : (
          <div className="grid gap-4">
            <section className="rounded-lg border border-[#21432f] bg-[#07110d] p-5">
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#70a17f]">
                <span>{detail.thread.channel}</span>
                <span>{formatRelativeTime(detail.thread.createdAt)}</span>
                {detail.thread.expiresAt ? <span>{formatExpiry(detail.thread.expiresAt)}</span> : null}
                <span>{detail.thread.author}</span>
              </div>
              <h1 className="mt-3 text-2xl font-semibold text-[#f2fff5]">{detail.thread.title}</h1>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[#a6c6b0]">{detail.thread.content}</p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1 text-xs text-[#70a17f]">
                  <MessageSquare size={13} />
                  {detail.thread.replyCount} 条回复
                </span>
                {detail.thread.kind !== 'topic' ? (
                  <button
                    type="button"
                    onClick={handlePromote}
                    disabled={promoting}
                    className="inline-flex items-center gap-2 rounded-md border border-[#372852] bg-[#0f0b19] px-3 py-2 text-xs font-semibold text-[#e3d7ff] transition-colors hover:border-[#5b4390] disabled:opacity-50"
                  >
                    <Sparkles size={13} />
                    {promoting ? '处理中...' : '转为专题'}
                  </button>
                ) : null}
                <Link
                  to="/bbs"
                  className="text-xs text-[#8cffb0] hover:underline"
                >
                  返回社区
                </Link>
              </div>
            </section>

            <section className="rounded-lg border border-[#21432f] bg-[#07110d] p-5">
              <div className="text-xs uppercase tracking-[0.16em] text-[#70a17f]">写一条本地回复</div>
              <form className="mt-3 grid gap-3" onSubmit={handleReply}>
                <textarea
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  className="min-h-24 rounded-md border border-[#21432f] bg-[#0b1711] px-3 py-2 text-sm leading-6 text-[#f2fff5] outline-none"
                  placeholder="继续讨论这个主题。"
                />
                <label className="inline-flex items-center gap-2 text-sm text-[#c8ffd7]">
                  <input type="checkbox" checked={anonymous} onChange={(event) => setAnonymous(event.target.checked)} />
                  匿名回复
                </label>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 rounded-md border border-[#21432f] bg-[#0f1d15] px-4 py-2 text-sm font-semibold text-[#c8ffd7] transition-colors hover:border-[#2d6541] disabled:opacity-50"
                  >
                    <Send size={14} />
                    {submitting ? '提交中...' : '写入回复'}
                  </button>
                </div>
              </form>
            </section>

            <section className="rounded-lg border border-[#21432f] bg-[#07110d] p-5">
              <div className="text-xs uppercase tracking-[0.16em] text-[#70a17f]">回复串</div>
              <div className="mt-3 grid gap-3">
                {detail.replies.length ? detail.replies.map((reply) => (
                  <div key={reply.uid} className="rounded-md border border-[#21432f] bg-[#0b1711] p-4">
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#70a17f]">
                      <span>{reply.author}</span>
                      <span>{formatRelativeTime(reply.createdAt)}</span>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#d7ffe3]">{reply.content}</p>
                  </div>
                )) : (
                  <div className="rounded-md border border-dashed border-[#21432f] bg-[#0b1711] p-4 text-sm text-[#70a17f]">
                    还没有回复，第一条就从这里开始。
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
