import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BookOpenText, MessageSquare, Send } from 'lucide-react';
import AppLayout from '../../components/layout/AppLayout';
import { apiService } from '../../services/api';
import type { Post } from '../../types';
import { useToast } from '../../components/common/Toast';

const CommunityTopicPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState<Post | null>(null);
  const [content, setContent] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const loaded = await apiService.getPostById(id);
      setPost(loaded || null);
    } catch (err) {
      console.error('Failed to load topic:', err);
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
      await apiService.createComment(id, content.trim());
      setContent('');
      setAnonymous(false);
      await load();
    } catch (err) {
      toast.error('提交失败');
    } finally {
      setSubmitting(false);
    }
  };

  const formatRelativeTime = (dateStr: string): string => {
    const d = new Date(dateStr);
    const diff = Date.now() - d.getTime();
    const minutes = Math.floor(diff / 60_000);
    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes} 分钟前`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} 小时前`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} 天前`;
    return d.toLocaleDateString('zh-CN');
  };

  return (
    <AppLayout title="专题页" showBack>
      <div className="mx-auto max-w-4xl px-4 py-5">
        {loading ? (
          <div className="rounded-lg border border-brand-border/60 bg-white p-6 text-sm text-brand-gray">正在读取专题...</div>
        ) : !post ? (
          <div className="rounded-lg border border-brand-border/60 bg-white p-6 text-sm text-brand-gray">未找到这个专题。</div>
        ) : (
          <div className="grid gap-4">
            <section className="rounded-lg border border-brand-border/60 bg-white p-5">
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-brand-gray">
                <span>专题</span>
                <span>{formatRelativeTime(post.createdAt)}</span>
                <span>{post.author?.nickname || '未知用户'}</span>
              </div>
              <div className="mt-3 flex items-start justify-between gap-3">
                <div>
                  <h1 className="text-xl font-semibold text-brand-dark">{post.title}</h1>
                  <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-brand-dark/80">{post.content}</p>
                </div>
                <BookOpenText size={18} className="shrink-0 text-[#d6c2ff]" />
              </div>
              <div className="mt-4 inline-flex items-center gap-1 text-xs text-brand-gray">
                <MessageSquare size={13} />
                专题讨论
              </div>
            </section>

            <section className="rounded-lg border border-brand-border/60 bg-white p-5">
              <div className="text-xs uppercase tracking-[0.16em] text-brand-gray">继续补充专题</div>
              <form className="mt-3 grid gap-3" onSubmit={handleReply}>
                <textarea
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  className="min-h-24 rounded-md border border-brand-border/60 bg-brand-offwhite px-3 py-2 text-sm leading-6 text-brand-dark outline-none"
                  placeholder="补一条经验、路径或现场观察。"
                />
                <label className="inline-flex items-center gap-2 text-sm text-brand-dark">
                  <input type="checkbox" checked={anonymous} onChange={(event) => setAnonymous(event.target.checked)} />
                  匿名回复
                </label>
                <div className="flex items-center justify-between gap-3">
                  <Link to="/bbs" className="text-xs text-brand-dark hover:underline">返回社区</Link>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 rounded-md border border-brand-border/60 bg-brand-dark px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark/90 disabled:opacity-50"
                  >
                    <Send size={14} />
                    {submitting ? '提交中...' : '补充专题'}
                  </button>
                </div>
              </form>
            </section>

            <section className="rounded-lg border border-brand-border/60 bg-white p-5">
              <div className="text-xs uppercase tracking-[0.16em] text-brand-gray">专题讨论</div>
              <div className="mt-3 grid gap-3">
                <div className="rounded-md border border-dashed border-brand-border/60 bg-brand-offwhite p-4 text-sm text-brand-gray">
                  完整讨论功能将在后端部署后开放。
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default CommunityTopicPage;
