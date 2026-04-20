import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BookOpenText, MessageSquare } from 'lucide-react';
import AppLayout from '../../components/layout/AppLayout';
import { forumApi } from '../../services/forumApi';
import type { Comment, Post } from '../../types';

const FormalTopicPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    setLoadError(null);
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
      setLoadError(err instanceof Error && err.message.includes('404') ? '未找到这个专题。' : '专题读取失败，请稍后重试。');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [id]);

  return (
    <AppLayout title="业务专题" showBack>
      <div className="mx-auto max-w-4xl px-4 py-5">
        {loading ? (
          <div className="rounded-lg border border-brand-border/60 bg-white p-6 text-sm text-brand-gray">正在读取专题...</div>
        ) : !post ? (
          <div className="rounded-lg border border-brand-border/60 bg-white p-6 text-sm text-brand-gray">{loadError || '未找到这个专题。'}</div>
        ) : (
          <div className="grid gap-6">
            <section className="bg-white px-2 py-4">
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-brand-gray">
                {post.board ? <span className="font-semibold text-brand-dark">{post.board.name}</span> : null}
                <span>{new Date(post.createdAt).toLocaleString('zh-CN')}</span>
                <span>{post.author?.nickname || '未知用户'}</span>
              </div>
              <div className="mt-4 flex items-start justify-between gap-3">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111] leading-snug tracking-tight break-words pr-2">{post.title}</h1>
                  {post.summary ? <p className="mt-4 text-[15px] leading-8 text-neutral-500 font-medium">{post.summary}</p> : null}
                  <p className="mt-6 whitespace-pre-wrap text-[16px] leading-[1.8] text-neutral-800 tracking-wide break-words">{post.content}</p>
                </div>
                <BookOpenText size={24} className="shrink-0 text-brand-gray" />
              </div>
              <div className="mt-6 inline-flex items-center gap-1 text-xs text-brand-gray">
                <MessageSquare size={13} />
                专题讨论 {comments.length} 条
              </div>
            </section>

            <section className="bg-white p-2 border-t border-neutral-100/60 mt-4">
              <div className="text-xs uppercase tracking-[0.16em] text-brand-gray">专题记录</div>
              <div className="mt-4 grid gap-3">
                {comments.length ? (
                  comments.map((comment) => (
                    <article key={comment.id} className="border-b border-neutral-100/60 bg-white py-4 px-2 last:border-0">
                      <div className="flex flex-wrap items-center gap-2 text-[12px] text-neutral-400">
                        <span className="font-extrabold text-neutral-800">{comment.author?.nickname || '隐藏信源'}</span>
                        <span className="text-[10px] bg-neutral-100 px-1.5 rounded text-neutral-500 font-mono scale-90 origin-left">{new Date(comment.createdAt).toLocaleString('zh-CN')}</span>
                      </div>
                      <p className="mt-2 whitespace-pre-wrap text-[15px] leading-7 text-neutral-700 break-words">{comment.content}</p>
                    </article>
                  ))
                ) : (
                  <div className="border border-dashed border-neutral-200/60 rounded-xl p-8 text-center text-sm text-neutral-400 font-medium">
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
