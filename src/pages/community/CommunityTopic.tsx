import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BookOpenText, MessageSquare, Send } from 'lucide-react';
import CyberLayout from '../../components/layout/CyberLayout';
import CommunityAccessGate from '../../components/community/CommunityAccessGate';
import {
  createCommunityReply,
  formatRelativeTime,
  getCommunityThread,
} from '../../../lib/community';

const CommunityTopicPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<Awaited<ReturnType<typeof getCommunityThread>>>(null);
  const [content, setContent] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

  return (
    <CyberLayout title="专题页" subtitle="长期保留 · 可持续讨论" showBack>
      <CommunityAccessGate />
      <div className="mx-auto max-w-4xl px-4 py-5">
        {loading ? (
          <div className="rounded-lg border border-[#21432f] bg-[#07110d] p-6 text-sm text-[#70a17f]">正在读取专题...</div>
        ) : !detail ? (
          <div className="rounded-lg border border-[#21432f] bg-[#07110d] p-6 text-sm text-[#70a17f]">未找到这个专题。</div>
        ) : (
          <div className="grid gap-4">
            <section className="rounded-lg border border-[#372852] bg-[#0f0b19] p-5">
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#a78bd6]">
                <span>专题</span>
                <span>{formatRelativeTime(detail.thread.createdAt)}</span>
                <span>{detail.thread.author}</span>
              </div>
              <div className="mt-3 flex items-start justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-semibold text-[#f4eeff]">{detail.thread.title}</h1>
                  <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[#d7cfff]">{detail.thread.content}</p>
                </div>
                <BookOpenText size={18} className="shrink-0 text-[#d6c2ff]" />
              </div>
              <div className="mt-4 inline-flex items-center gap-1 text-xs text-[#a78bd6]">
                <MessageSquare size={13} />
                {detail.thread.replyCount} 条讨论
              </div>
            </section>

            <section className="rounded-lg border border-[#21432f] bg-[#07110d] p-5">
              <div className="text-xs uppercase tracking-[0.16em] text-[#70a17f]">继续补充专题</div>
              <form className="mt-3 grid gap-3" onSubmit={handleReply}>
                <textarea
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  className="min-h-24 rounded-md border border-[#21432f] bg-[#0b1711] px-3 py-2 text-sm leading-6 text-[#f2fff5] outline-none"
                  placeholder="补一条经验、路径或现场观察。"
                />
                <label className="inline-flex items-center gap-2 text-sm text-[#c8ffd7]">
                  <input type="checkbox" checked={anonymous} onChange={(event) => setAnonymous(event.target.checked)} />
                  匿名回复
                </label>
                <div className="flex items-center justify-between gap-3">
                  <Link to="/bbs" className="text-xs text-[#8cffb0] hover:underline">返回社区</Link>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 rounded-md border border-[#21432f] bg-[#0f1d15] px-4 py-2 text-sm font-semibold text-[#c8ffd7] transition-colors hover:border-[#2d6541] disabled:opacity-50"
                  >
                    <Send size={14} />
                    {submitting ? '提交中...' : '补充专题'}
                  </button>
                </div>
              </form>
            </section>

            <section className="rounded-lg border border-[#21432f] bg-[#07110d] p-5">
              <div className="text-xs uppercase tracking-[0.16em] text-[#70a17f]">专题讨论</div>
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
                    这个专题还没有跟帖。
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

export default CommunityTopicPage;
