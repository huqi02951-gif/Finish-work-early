import React, { useEffect, useMemo, useState } from 'react';
import { Flame, Zap, Clock, ArrowRight } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { GossipPost, GossipStatus } from '../../types/gossip';
import { computeStatus, HEAT_THRESHOLDS } from '../../types/gossip';
import GossipPostCard from './GossipPostCard';
import { forumApi } from '../../services/forumApi';
import type { Post } from '../../types';
import { useToast } from '../../components/common/Toast';

/** Map a backend Post to the GossipPost UI model with synthetic gossip fields */
function postToGossip(post: Post): GossipPost {
  const created = new Date(post.createdAt).getTime();
  const heatScore = Math.min((post.commentCount || 0) * 5 + 10, 100);
  const expireAt = new Date(created + 12 * 3600000).toISOString();
  const gossipCategory = (post.category || '') as GossipPost['category'];
  const validCategories: GossipPost['category'][] = ['匿名吐槽', 'Gossip 贴板', '二手交易', '请喝咖啡'];
  return {
    id: post.id,
    title: post.title,
    content: post.content,
    author: post.author?.nickname || '匿名用户',
    isAnonymous: true,
    category: validCategories.includes(gossipCategory) ? gossipCategory : '匿名吐槽',
    createdAt: post.createdAt,
    expireAt,
    heatScore,
    reviveCount: 0,
    status: 'fermenting',
    replyCount: post.commentCount || 0,
    tags: post.tags || [],
  };
}

interface GossipBoardProps {
  className?: string;
}

const GossipBoard: React.FC<GossipBoardProps> = ({ className }) => {
  const toast = useToast();
  const [activeFilter, setActiveFilter] = useState<GossipStatus | 'all'>('all');
  const [posts, setPosts] = useState<GossipPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadGossipPosts = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await forumApi.getPosts({ boardSlug: 'gossip', pageSize: 30 });
      setPosts(res.items.map(postToGossip));
    } catch (err) {
      console.error('Failed to load gossip posts:', err);
      setPosts([]);
      setLoadError('流言板接入失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadGossipPosts();
  }, []);

  const handleRevive = (id: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== id) return p;
      const newExpireAt = new Date(Date.now() + 4 * 3600000).toISOString();
      return { ...p, expireAt: newExpireAt, reviveCount: p.reviveCount + 1 };
    }));
    toast.success('续命成功！该流言延长4小时');
  };

  const filtered = useMemo(() => {
    let filtered = posts.map(p => ({ ...p, status: computeStatus(p) }));
    if (activeFilter !== 'all') {
      filtered = filtered.filter(p => p.status === activeFilter);
    }
    // Sort: about_to_burn > hot_discussion > fermenting > just_sent > revived > burned
    const order: Record<string, number> = {
      about_to_burn: 0,
      hot_discussion: 1,
      fermenting: 2,
      revived: 3,
      just_sent: 4,
      burned: 5,
    };
    return filtered.sort((a, b) => (order[a.status] ?? 5) - (order[b.status] ?? 5));
  }, [posts, activeFilter]);

  const filters: { label: string; value: GossipStatus | 'all'; icon: React.ReactNode }[] = [
    { label: '全部', value: 'all', icon: <ArrowRight className="w-2.5 h-2.5" /> },
    { label: '即将焚毁', value: 'about_to_burn', icon: <Flame className="w-2.5 h-2.5" /> },
    { label: '今夜热议', value: 'hot_discussion', icon: <Zap className="w-2.5 h-2.5" /> },
    { label: '正在发酵', value: 'fermenting', icon: <Clock className="w-2.5 h-2.5" /> },
  ];

  return (
    <div className={cn('space-y-4', className)}>
      {/* Board header */}
      <div className="border border-[#ff0040]/30 bg-black/60 p-4 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-[#ff0040] flex items-center gap-2">
              <Flame className="w-4 h-4" /> 限时流言板
            </h3>
            <p className="text-[10px] text-[#ff0040]/40 font-mono mt-0.5">
              12h 自动焚毁 · 热度达标可续命 · 当前在线 {filtered.filter(p => p.status !== 'burned').length} 条
            </p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {filters.map(f => {
            const count = f.value === 'all'
              ? filtered.length
              : filtered.filter(p => p.status === f.value).length;
            return (
              <button
                key={f.value}
                onClick={() => setActiveFilter(f.value)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold border whitespace-nowrap transition-all',
                  activeFilter === f.value
                    ? 'border-[#ff0040] bg-[#ff0040]/10 text-[#ff0040]'
                    : 'border-white/10 text-white/30 hover:border-white/20'
                )}
              >
                {f.icon} {f.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Posts grid */}
        <div className="grid gap-3">
          {loading ? (
            <div className="text-center py-8 text-[#ff0040]/20 text-xs font-mono animate-pulse">
              信号接入中...
            </div>
          ) : loadError ? (
            <div className="text-center py-8 text-[#ff0040]/20 text-xs font-mono">
              <div>{loadError}</div>
              <button onClick={() => void loadGossipPosts()} className="mt-2 text-[#ff0040]/50 hover:text-[#ff0040]">
                RETRY
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 text-[#ff0040]/20 text-xs font-mono">
              暂无匹配的流言
            </div>
          ) : (
            filtered.map(post => (
              <GossipPostCard key={post.id} post={post} onRevive={handleRevive} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default GossipBoard;
