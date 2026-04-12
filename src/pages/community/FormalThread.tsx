import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { MessageSquare, Send, Sparkles } from 'lucide-react';
import AppLayout from '../../components/layout/AppLayout';
import {
  createCommunityReply,
  formatExpiry,
  formatRelativeTime,
  getCommunityThread,
  promoteCommunityThreadToTopic,
} from '../../../lib/community';

const FormalThreadPage: React.FC = () => {
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
        author: anonymous ? '匿名同事' : '当前浏览器用户',
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
      navigate(`/formal/topic/${id}`);
    } finally {
      setPromoting(false);
    }
  };

  return (
    <AppLayout title="经验与指引详情" showBack>
      <div className="mx-auto max-w-4xl px-4 py-5">
        {loading ? (
          <div className="rounded-lg border border-brand-border/60 bg-white p-6 text-sm text-brand-gray">正在读取...</div>
        ) : !detail ? (
          <div className="rounded-lg border border-brand-border/60 bg-white p-6 text-sm text-brand-gray">未找到这个经验帖。</div>
        ) : (
          <div className="grid gap-4">
            <section className="rounded-lg border border-brand-border/60 bg-white p-6">
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-brand-gray">
                <span className="font-semibold text-brand-dark">{detail.thread.channel}</span>
                <span>{formatRelativeTime(detail.thread.createdAt)}</span>
                {detail.thread.expiresAt ? <span>{formatExpiry(detail.thread.expiresAt)}</span> : null}
                <span>{detail.thread.author}</span>
              </div>
              <h1 className="mt-3 text-2xl font-semibold text-brand-dark">{detail.thread.title}</h1>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-brand-dark/80">{detail.thread.content}</p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1 text-xs text-brand-gray">
                  <MessageSquare size={13} />
                  {detail.thread.replyCount} 条回复
                </span>
                {detail.thread.kind !== 'topic' && detail.thread.channel !== '专题' ? (
                  <button
                    type="button"
                    onClick={handlePromote}
                    disabled={promoting}
                    className="inline-flex items-center gap-2 rounded-md border border-brand-border/60 bg-brand-offwhite px-3 py-2 text-xs font-semibold text-brand-dark transition-colors hover:bg-white disabled:opacity-50"
                  >
                    <Sparkles size={13} />
                    {promoting ? '处理中...' : '转为长期专题'}
                  </button>
                ) : null}
                <Link
                  to="/workspace"
                  className="text-xs text-brand-dark hover:underline ml-auto"
                >
                  返回业务社区
                </Link>
              </div>
            </section>

            <section className="rounded-lg border border-brand-border/60 bg-white p-5">
              <div className="text-xs uppercase tracking-[0.16em] text-brand-gray">补充经验或指引</div>
              <form className="mt-3 grid gap-3" onSubmit={handleReply}>
                <textarea
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  className="min-h-24 rounded-md border border-brand-border/60 bg-white px-3 py-2 text-sm leading-6 text-brand-dark outline-none"
                  placeholder="提供更多细节、解答疑问或修正错误..."
                />
                <label className="inline-flex items-center gap-2 text-sm text-brand-gray">
                  <input type="checkbox" checked={anonymous} onChange={(event) => setAnonymous(event.target.checked)} />
                  匿名回复
                </label>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 rounded-md border border-brand-dark bg-brand-dark px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-black disabled:opacity-50"
                  >
                    <Send size={14} />
                    {submitting ? '提交中...' : '发布补充'}
                  </button>
                </div>
              </form>
            </section>

            <section className="rounded-lg border border-brand-border/60 bg-white p-5">
              <div className="text-xs uppercase tracking-[0.16em] text-brand-gray">交流与讨论</div>
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
                    还没有讨论，第一条补充就从这里开始。
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

export default FormalThreadPage;
