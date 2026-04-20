import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MessageSquare, Send, Clock, Flame, Shield, ArrowLeft } from 'lucide-react';
import CyberLayout from '../../components/layout/CyberLayout';
import CommentSection from '../../components/community/CommentSection';
import TipJar from '../../components/community/TipJar';
import { cn } from '../../../lib/utils';
import { forumApi } from '../../services/forumApi';
import type { Post, Comment } from '../../types';
import { useToast } from '../../components/common/Toast';

const PantryThreadPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState<Post | null>(null);
  const [content, setContent] = useState('');
  const [anonymous, setAnonymous] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    const load = async () => {
      try {
        const [postData, commentsData] = await Promise.all([
          forumApi.getPostDetail(id),
          forumApi.getPostComments(id, { pageSize: 50 }),
        ]);
        setPost(postData);
        setComments(commentsData.items);
      } catch (err) {
        console.error('Failed to load pantry thread:', err);
        setPost(null);
        setComments([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      const newComment: Comment = {
        id: `c_${Date.now()}`,
        postId: id || '',
        userId: 'anon',
        content: content.trim(),
        createdAt: new Date().toISOString(),
        author: { id: 'anon', nickname: anonymous ? '匿名用户' : '我', avatar: '', role: 'user', email: '', createdAt: '' },
      };
      setComments(prev => [newComment, ...prev]);
      setContent('');
      toast.success('评论已发布');
    } catch {
      toast.error('评论发布失败');
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
    return d.toLocaleDateString('zh-CN');
  };

  return (
    <CyberLayout title="茶水间帖子" showBack>
      <div className="mx-auto max-w-3xl px-4 py-5 font-mono">
        {loading ? (
          <div className="border border-[#00ff41]/20 bg-black p-6 animate-pulse">
            <div className="h-4 w-32 bg-[#00ff41]/10 rounded mb-3" />
            <div className="h-6 w-3/4 bg-[#00ff41]/10 rounded mb-2" />
            <div className="h-3 w-full bg-[#00ff41]/10 rounded mb-1" />
            <div className="h-3 w-2/3 bg-[#00ff41]/10 rounded" />
          </div>
        ) : !post ? (
          <div className="border border-[#00ff41]/20 bg-black p-6 text-center">
            <p className="text-[#00ff41]/40 text-sm">404 — 该帖子信号已中断</p>
            <Link to="/bbs/pantry" className="text-xs text-[#00ff41]/60 hover:text-[#00ff41] mt-2 inline-block">
              返回茶水间
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Post Content */}
            <section className="border border-[#00ff41]/20 bg-black p-5">
              {/* Meta */}
              <div className="flex items-center gap-3 mb-3 text-[10px] text-[#00ff41]/40">
                <span className={cn(
                  'px-1.5 py-0.5 border text-[9px] font-bold',
                  post.category === '匿名吐槽' ? 'text-red-400 border-red-800' :
                  post.category === 'Gossip 贴板' ? 'text-amber-400 border-amber-800' :
                  post.category === '二手交易' ? 'text-purple-400 border-purple-800' :
                  'text-[#00ff41] border-[#00ff41]/50'
                )}>
                  {post.category}
                </span>
                <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> {formatRelativeTime(post.createdAt)}</span>
                <span className="flex items-center gap-1"><Shield className="w-2.5 h-2.5" /> {post.author?.nickname || '匿名用户'}</span>
              </div>

              {/* Title */}
              <h1 className="text-lg font-bold text-[#00ff41] mb-3">{post.title}</h1>

              {/* Content */}
              <p className="text-sm text-[#00ff41]/70 leading-relaxed whitespace-pre-wrap">{post.content}</p>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-[#00ff41]/10">
                  {post.tags.map(tag => (
                    <span key={tag} className="text-[9px] px-1.5 py-0.5 bg-[#a855f7]/10 text-[#a855f7]/50 border border-[#a855f7]/10 font-mono">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center gap-4 mt-3 text-[9px] text-[#00ff41]/30">
                <span className="flex items-center gap-1"><MessageSquare className="w-2.5 h-2.5" /> {post.commentCount || 0} 评论</span>
                <span className="flex items-center gap-1"><Flame className="w-2.5 h-2.5" /> 匿名通道</span>
              </div>
            </section>

            {/* Tip Jar */}
            <TipJar dark />

            {/* Reply Form */}
            <section className="border border-[#00ff41]/20 bg-black p-5">
              <div className="text-[10px] uppercase tracking-widest text-[#00ff41]/40 mb-3">回复</div>
              <form onSubmit={handleReply}>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className="w-full border border-[#00ff41]/20 bg-black px-3 py-2 text-sm text-[#00ff41] outline-none placeholder:text-[#00ff41]/20 focus:border-[#00ff41]/40 resize-none min-h-[80px] rounded-none"
                  placeholder="补充一条情报、路径或现场观察..."
                />
                <div className="flex items-center justify-between mt-2">
                  <label className="inline-flex items-center gap-2 text-xs text-[#00ff41]/50">
                    <input
                      type="checkbox"
                      checked={anonymous}
                      onChange={e => setAnonymous(e.target.checked)}
                      className="accent-[#00ff41]"
                    />
                    匿名回复
                  </label>
                  <button
                    type="submit"
                    disabled={submitting || !content.trim()}
                    className="inline-flex items-center gap-2 border border-[#00ff41] bg-[#00ff41]/10 px-4 py-2 text-xs font-bold text-[#00ff41] hover:bg-[#00ff41] hover:text-black transition-all disabled:opacity-40 disabled:hover:bg-[#00ff41]/10 disabled:hover:text-[#00ff41]"
                  >
                    <Send size={13} />
                    {submitting ? '传输中...' : '写入节点'}
                  </button>
                </div>
              </form>
            </section>

            {/* Comments */}
            <section className="border border-[#00ff41]/20 bg-black p-5">
              <div className="text-[10px] uppercase tracking-widest text-[#00ff41]/40 mb-3 flex items-center gap-2">
                <MessageSquare className="w-3 h-3" /> 讨论 ({comments.length})
              </div>
              <CommentSection comments={comments} dark />
            </section>
          </div>
        )}
      </div>
    </CyberLayout>
  );
};

export default PantryThreadPage;
