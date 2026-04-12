import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BookOpenText, MessageSquare, Send } from 'lucide-react';
import AppLayout from '../../components/layout/AppLayout';
import {
  createCommunityReply,
  formatRelativeTime,
  getCommunityThread,
} from '../../../lib/community';

const FormalTopicPage: React.FC = () => {
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
        author: anonymous ? '匿名同事' : '当前浏览器用户',
      });
      setContent('');
      setAnonymous(false);
      await load();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout title="业务专题" showBack>
      <div className="mx-auto max-w-4xl px-4 py-5">
        {loading ? (
          <div className="rounded-lg border border-brand-border/60 bg-white p-6 text-sm text-brand-gray">正在读取专题...</div>
        ) : !detail ? (
          <div className="rounded-lg border border-brand-border/60 bg-white p-6 text-sm text-brand-gray">未找到这个专题。</div>
        ) : (
          <div className="grid gap-4">
            <section className="rounded-lg border border-brand-dark/20 bg-brand-offwhite p-6">
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-brand-gray">
                <span className="font-semibold text-brand-dark">专题</span>
                <span>{formatRelativeTime(detail.thread.createdAt)}</span>
                <span>{detail.thread.author}</span>
              </div>
              <div className="mt-4 flex items-start justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-semibold text-brand-dark">{detail.thread.title}</h1>
                  <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-brand-dark/80">{detail.thread.content}</p>
                </div>
                <BookOpenText size={24} className="shrink-0 text-brand-gray" />
              </div>
              <div className="mt-6 inline-flex items-center gap-1 text-xs text-brand-gray">
                <MessageSquare size={13} />
                {detail.thread.replyCount} 条讨论与补充
              </div>
            </section>

            <section className="rounded-lg border border-brand-border/60 bg-white p-5">
              <div className="text-xs uppercase tracking-[0.16em] text-brand-gray">参与专题建设</div>
              <form className="mt-3 grid gap-3" onSubmit={handleReply}>
                <textarea
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  className="min-h-24 rounded-md border border-brand-border/60 bg-white px-3 py-2 text-sm leading-6 text-brand-dark outline-none"
                  placeholder="贡献一条相关经验、操作路径或现场观察案例。"
                />
                <label className="inline-flex items-center gap-2 text-sm text-brand-gray">
                  <input type="checkbox" checked={anonymous} onChange={(event) => setAnonymous(event.target.checked)} />
                  匿名分享
                </label>
                <div className="flex items-center justify-between gap-3">
                  <Link to="/workspace" className="text-xs text-brand-dark hover:underline">返回业务社区</Link>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 rounded-md border border-brand-dark bg-brand-dark px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-black disabled:opacity-50"
                  >
                    <Send size={14} />
                    {submitting ? '提交中...' : '补充专题内容'}
                  </button>
                </div>
              </form>
            </section>

            <section className="rounded-lg border border-brand-border/60 bg-white p-5">
              <div className="text-xs uppercase tracking-[0.16em] text-brand-gray">专题记录</div>
              <div className="mt-4 grid gap-3">
                {detail.replies.length ? detail.replies.map((reply) => (
                  <div key={reply.uid} className="rounded-md border border-brand-border/40 bg-brand-offwhite p-4">
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-brand-gray">
                      <span className="font-semibold text-brand-dark">{reply.author}</span>
                      <span>{formatRelativeTime(reply.createdAt)}</span>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-brand-dark/80">{reply.content}</p>
                  </div>
                )) : (
                  <div className="rounded-md border border-dashed border-brand-border/60 p-8 text-center text-sm text-brand-gray">
                    这个专题还没有经验库沉淀，作为第一名贡献者分享吧。
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

export default FormalTopicPage;
