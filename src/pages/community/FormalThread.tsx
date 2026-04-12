import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { MessageSquare, Send, Sparkles } from 'lucide-react';
import AppLayout from '../../components/layout/AppLayout';
import { apiService } from '../../services/api';
import { getAuthSession } from '../../services/authService';
import type { Post } from '../../types';

interface CommentItem {
  id: string;
  postId: string;
  content: string;
  author?: { id: string; nickname: string; role: string };
  createdAt: string;
}

interface ThreadDetail {
  post: Post;
  comments: CommentItem[];
}

const FormalThreadPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<ThreadDetail | null>(null);
  const [content, setContent] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const post = await apiService.getPostById(id);
      if (post) {
        // Comments are fetched separately in the backend response
        setDetail({ post, comments: [] });
      } else {
        setDetail(null);
      }
    } catch (err) {
      console.error('Failed to load thread:', err);
      setDetail(null);
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
      alert('请先登录后再回复');
      navigate('/login');
      return;
    }

    setSubmitting(true);
    try {
      await apiService.createComment(id, content.trim());
      setContent('');
      setAnonymous(false);
      await load();
    } catch (err) {
      alert('回复失败，请检查网络连接');
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
                <span className="font-semibold text-brand-dark">{detail.post.category}</span>
                <span>{formatRelativeTime(detail.post.createdAt)}</span>
                <span>{detail.post.author?.nickname || '未知用户'}</span>
              </div>
              <h1 className="mt-3 text-2xl font-semibold text-brand-dark">{detail.post.title}</h1>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-brand-dark/80">{detail.post.content}</p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
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
                <div className="rounded-md border border-dashed border-brand-border/60 p-8 text-center text-sm text-brand-gray">
                  讨论功能将在完整后端部署后开放。
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default FormalThreadPage;
