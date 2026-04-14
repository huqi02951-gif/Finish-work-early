import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { BookOpenText, MessageSquare, Send } from 'lucide-react';
import AppLayout from '../../components/layout/AppLayout';
import { forumApi } from '../../services/forumApi';
import { getAuthSession } from '../../services/authService';
import type { Comment, Post } from '../../types';
import { useToast } from '../../components/common/Toast';

const FormalTopicPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [detail, commentList] = await Promise.all([
        forumApi.getPostDetail(id),
        forumApi.getPostComments(id, { pageSize: 100 }),
      ]);
      setPost(detail);
      setComments(commentList.items);
    } catch (err) {
      console.error('Failed to load topic:', err);
      setPost(null);
      setComments([]);
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

    const session = getAuthSession();
    if (!session || session.loginMethod === 'demo') {
      toast.warning('请先登录后再补充');
      navigate('/login');
      return;
    }

    setSubmitting(true);
    try {
      await forumApi.createComment(id, content.trim());
      setContent('');
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '提交失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout title="业务专题" showBack>
      <div className="mx-auto max-w-4xl px-4 py-5">
        {loading ? (
          <div className="rounded-lg border border-brand-border/60 bg-white p-6 text-sm text-brand-gray">正在读取专题...</div>
        ) : !post ? (
          <div className="rounded-lg border border-brand-border/60 bg-white p-6 text-sm text-brand-gray">未找到这个专题。</div>
        ) : (
          <div className="grid gap-4">
            <section className="rounded-lg border border-brand-dark/20 bg-brand-offwhite p-6">
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-brand-gray">
                {post.board ? <span className="font-semibold text-brand-dark">{post.board.name}</span> : null}
                <span>{new Date(post.createdAt).toLocaleString('zh-CN')}</span>
                <span>{post.author?.nickname || '未知用户'}</span>
              </div>
              <div className="mt-4 flex items-start justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-semibold text-brand-dark">{post.title}</h1>
                  {post.summary ? <p className="mt-3 text-sm leading-7 text-brand-gray">{post.summary}</p> : null}
                  <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-brand-dark/80">{post.content}</p>
                </div>
                <BookOpenText size={24} className="shrink-0 text-brand-gray" />
              </div>
              <div className="mt-6 inline-flex items-center gap-1 text-xs text-brand-gray">
                <MessageSquare size={13} />
                专题讨论 {comments.length} 条
              </div>
            </section>

            <section className="rounded-lg border border-brand-border/60 bg-white p-5">
              <div className="text-xs uppercase tracking-[0.16em] text-brand-gray">继续补充专题</div>
              {post.commentsLocked ? (
                <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                  该专题已被管理员锁定评论。
                </div>
              ) : (
                <form className="mt-3 grid gap-3" onSubmit={handleReply}>
                  <textarea
                    value={content}
                    onChange={(event) => setContent(event.target.value)}
                    className="min-h-24 rounded-md border border-brand-border/60 bg-white px-3 py-2 text-sm leading-6 text-brand-dark outline-none"
                    placeholder="补一条经验、路径、风险点或现场观察。"
                  />
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
              )}
            </section>

            <section className="rounded-lg border border-brand-border/60 bg-white p-5">
              <div className="text-xs uppercase tracking-[0.16em] text-brand-gray">专题记录</div>
              <div className="mt-4 grid gap-3">
                {comments.length ? (
                  comments.map((comment) => (
                    <article key={comment.id} className="rounded-md border border-brand-border/50 bg-brand-offwhite p-4">
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-brand-gray">
                        <span className="font-semibold text-brand-dark">{comment.author?.nickname || '未知用户'}</span>
                        <span>{new Date(comment.createdAt).toLocaleString('zh-CN')}</span>
                      </div>
                      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-brand-dark/80">{comment.content}</p>
                    </article>
                  ))
                ) : (
                  <div className="rounded-md border border-dashed border-brand-border/60 p-8 text-center text-sm text-brand-gray">
                    还没有专题补充。
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
