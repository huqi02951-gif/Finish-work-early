
import React, { useState, useEffect } from 'react';
import { Search, MessageCircle, Share2, Heart } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import { apiService } from '../services/api';
import { Post } from '../types';
import { cn } from '../../lib/utils';
import InitialBadge from '../components/common/InitialBadge';

const Feed: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeCategory, setActiveCategory] = useState('全部');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [likedPostIds, setLikedPostIds] = useState<string[]>([]);
  const [shareTip, setShareTip] = useState<string | null>(null);

  const categories = ['全部', '政策解读', '业务打法', '经验分享', '行业动态'];

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const data = await apiService.getPosts(activeCategory === '全部' ? undefined : activeCategory);
        setPosts(data);
      } catch (error) {
        const message = error instanceof Error ? error.message : '加载失败';
        setLoadError(message);
        setPosts([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, [activeCategory]);

  const visiblePosts = posts.filter((post) => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return true;
    return [
      post.title,
      post.content,
      post.category,
      post.author?.nickname,
      ...(post.tags || []),
    ]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query));
  });

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      const copied = document.execCommand('copy');
      document.body.removeChild(el);
      return copied;
    }
  };

  const handleShare = async (post: Post) => {
    const url = `${window.location.origin}${window.location.pathname}#/feed`;
    const ok = await copyText(`${post.title}\n${post.content}\n${url}`);
    setShareTip(ok ? `已复制「${post.title}」分享内容` : '复制失败，请手动重试');
    window.setTimeout(() => setShareTip(null), 1800);
  };

  const toggleLike = (postId: string) => {
    setLikedPostIds((current) =>
      current.includes(postId) ? current.filter((id) => id !== postId) : [...current, postId],
    );
  };

  return (
    <AppLayout title="发现">
      <div className="mx-4 mt-3 px-4 py-2.5 bg-emerald-50 border border-emerald-200/60 rounded-2xl flex items-center gap-2">
        <span className="text-sm">●</span>
        <span className="text-[11px] text-emerald-700 font-medium">Phase 1 后端联通模式 · 内容来自真实 API 和数据库</span>
      </div>
      <div className="sticky top-[3.5rem] z-40 bg-brand-offwhite/80 backdrop-blur-md border-b border-brand-border/5 px-4 py-3 space-y-3">
        {shareTip && (
          <div className="px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200/70 text-[11px] text-emerald-700 font-medium">
            {shareTip}
          </div>
        )}
        {loadError && (
          <div className="px-4 py-2 rounded-xl bg-rose-50 border border-rose-200/70 text-[11px] text-rose-700 font-medium">
            发现页加载失败：{loadError}
          </div>
        )}
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray opacity-40" size={16} />
          <input 
            type="text" 
            placeholder="搜索政策、话术、打法..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-brand-border/10 rounded-xl text-base outline-none focus:ring-2 focus:ring-brand-gold/20 transition-all"
          />
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-4 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all",
                activeCategory === cat 
                  ? "bg-brand-dark text-white shadow-md" 
                  : "bg-white text-brand-gray border border-brand-border/10"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl h-64 animate-pulse border border-brand-border/10" />
            ))}
          </div>
        ) : visiblePosts.length > 0 ? (
          visiblePosts.map((post) => (
            <div key={post.id} className="bg-white rounded-md border border-brand-border/40 shadow-sm animate-fade-in-up">
              <div className="p-4 flex items-center gap-3">
                <InitialBadge label={post.author?.nickname || '本地'} />
                <div>
                  <h4 className="text-sm font-bold text-brand-dark">{post.author?.nickname}</h4>
                  <p className="text-[10px] text-brand-gray font-medium opacity-60">{new Date(post.createdAt).toLocaleDateString()} • {post.category}</p>
                </div>
              </div>

              <div className="px-4 pb-2">
                <h3 className="text-base font-bold text-brand-dark mb-2">{post.title}</h3>
                <p className="text-sm text-brand-gray line-clamp-4 leading-relaxed">{post.content}</p>
                {post.tags.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span key={tag} className="rounded-md border border-brand-border/50 px-2 py-1 text-[11px] text-brand-gray">
                        #{tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="p-4 border-t border-brand-border/5 flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <button
                    type="button"
                    onClick={() => toggleLike(post.id)}
                    className={cn(
                      "flex items-center gap-1.5 transition-colors",
                      likedPostIds.includes(post.id) ? "text-rose-500" : "text-brand-gray hover:text-brand-gold",
                    )}
                  >
                    <Heart size={18} />
                    <span className="text-xs font-bold">{likedPostIds.includes(post.id) ? 13 : 12}</span>
                  </button>
                  <button
                    type="button"
                    disabled
                    title="评论详情将在下一阶段接入前端"
                    className="flex items-center gap-1.5 text-brand-gray/40 cursor-not-allowed"
                  >
                    <MessageCircle size={18} />
                    <span className="text-xs font-bold">-</span>
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => handleShare(post)}
                  className="text-brand-gray hover:text-brand-gold transition-colors"
                >
                  <Share2 size={18} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center space-y-4 opacity-40">
            <Search size={48} className="mx-auto" />
            <p className="text-sm font-bold uppercase tracking-widest">暂无匹配内容</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Feed;
