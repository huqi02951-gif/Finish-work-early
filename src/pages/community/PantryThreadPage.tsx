import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MessageSquare, Clock, Flame, Shield } from 'lucide-react';
import CyberLayout from '../../components/layout/CyberLayout';
import CommentSection from '../../components/community/CommentSection';
import TipJar from '../../components/community/TipJar';
import { cn } from '../../../lib/utils';
import { pantryApi, PantryPost } from '../../services/pantryApi';
import type { Comment } from '../../types';

const PantryThreadPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [post, setPost] = useState<PantryPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);

  const loadThread = async () => {
    if (!id) return;
    setLoading(true);
    setLoadError(null);
    try {
      const [postData, commentsData] = await Promise.all([
        pantryApi.getPostDetail(Number(id)),
        pantryApi.listComments(Number(id)),
      ]);
      setPost(postData);
      setComments((Array.isArray(commentsData) ? commentsData : []).map((comment: any) => ({
        id: String(comment.id),
        postId: String(comment.postId),
        userId: String(comment.authorId),
        content: comment.content,
        createdAt: comment.createdAt,
        author: {
          id: String(comment.authorId),
          nickname: comment.anonymousAlias || '匿名线人',
          avatar: '',
          role: 'user',
          createdAt: comment.createdAt,
        },
      })));
    } catch (err) {
      console.error('Failed to load pantry thread:', err);
      setPost(null);
      setComments([]);
      setLoadError('该帖子暂时无法读取');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    void loadThread();
  }, [id]);

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
      <div className="mx-auto max-w-3xl px-4 py-5 pb-[calc(max(2rem,env(safe-area-inset-bottom)))] font-mono">
        {loading ? (
          <div className="border border-[#00ff41]/20 bg-black p-6 animate-pulse">
            <div className="h-4 w-32 bg-[#00ff41]/10 rounded mb-3" />
            <div className="h-6 w-3/4 bg-[#00ff41]/10 rounded mb-2" />
            <div className="h-3 w-full bg-[#00ff41]/10 rounded mb-1" />
            <div className="h-3 w-2/3 bg-[#00ff41]/10 rounded" />
          </div>
        ) : !post ? (
          <div className="border border-[#00ff41]/20 bg-black p-6 text-center">
            <p className="text-[#00ff41]/40 text-sm">{loadError || '404 — 该帖子信号已中断'}</p>
            {id && (
              <button onClick={() => void loadThread()} className="text-xs text-[#00ff41]/60 hover:text-[#00ff41] mt-2 min-h-[44px] px-4 py-2 mx-auto flex items-center justify-center">
                RETRY
              </button>
            )}
            <Link to="/bbs/pantry" className="text-xs text-[#00ff41]/60 hover:text-[#00ff41] mt-2 min-h-[44px] px-4 py-2 flex items-center justify-center">
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
                  post.kind === 'burn' ? 'text-red-400 border-red-800' :
                  post.kind === 'gossip' ? 'text-amber-400 border-amber-800' :
                  post.kind === 'thread' ? 'text-purple-400 border-purple-800' :
                  'text-[#00ff41] border-[#00ff41]/50'
                )}>
                  {post.kind === 'burn' ? '马上焚' : post.kind === 'thread' ? '深水长瓜' : '金融爆料'}
                </span>
                <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> {formatRelativeTime(post.createdAt)}</span>
                <span className="flex items-center gap-1"><Shield className="w-2.5 h-2.5" /> {post.anonymousAlias || '匿名线人'}</span>
              </div>

              {/* Title */}
              <h1 className="text-lg font-bold text-[#00ff41] mb-3 break-words pr-2">{post.title}</h1>

              {/* Content */}
              <p className="text-sm text-[#00ff41]/70 leading-relaxed whitespace-pre-wrap break-words pr-2">{post.content}</p>

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
                <span className="flex items-center gap-1"><MessageSquare className="w-2.5 h-2.5" /> {post.commentCount || 0} 留言</span>
                <span className="flex items-center gap-1"><Flame className="w-2.5 h-2.5" /> 匿名通道</span>
              </div>
            </section>

            {/* Tip Jar */}
            <TipJar dark />

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
