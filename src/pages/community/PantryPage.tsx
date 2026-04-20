import React, { useEffect, useState, useMemo } from 'react';
import { Flame, Coffee, Package2, MessageSquare, Hash, Search, Sparkles, Terminal } from 'lucide-react';
import CyberLayout from '../../components/layout/CyberLayout';
import CommunityAccessGate from '../../components/community/CommunityAccessGate';
import GossipBoard from '../../components/community/GossipBoard';
import PostCard from '../../components/community/PostCard';
import { cn } from '../../../lib/utils';
import { useDebounce } from '../../../lib/utils';
import { forumApi } from '../../services/forumApi';
import type { Post } from '../../types';

type PantrySection = 'all' | 'gossip' | 'chat' | 'trade' | 'coffee';

const SUB_SECTIONS: { id: PantrySection; label: string; icon: React.ReactNode }[] = [
  { id: 'all', label: '全部', icon: <Terminal className="w-3 h-3" /> },
  { id: 'gossip', label: '限时流言', icon: <Flame className="w-3 h-3" /> },
  { id: 'chat', label: '匿名闲聊', icon: <MessageSquare className="w-3 h-3" /> },
  { id: 'trade', label: '二手置换', icon: <Package2 className="w-3 h-3" /> },
  { id: 'coffee', label: '请喝咖啡', icon: <Coffee className="w-3 h-3" /> },
];

const categoryMap: Record<string, PantrySection> = {
  '匿名吐槽': 'chat',
  'Gossip 贴板': 'gossip',
  '二手交易': 'trade',
  '请喝咖啡': 'coffee',
};

const PantryPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<PantrySection>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [pantryPosts, setPantryPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadPantryPosts = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await forumApi.getPosts({ boardSlug: 'pantry', pageSize: 50 });
      setPantryPosts(res.items);
    } catch (err) {
      console.error('Failed to load pantry posts:', err);
      setPantryPosts([]);
      setLoadError('茶水间帖子加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPantryPosts();
  }, []);

  const filteredPosts = useMemo(() => {
    let posts = pantryPosts;
    if (activeSection !== 'all') {
      posts = posts.filter(p => categoryMap[p.category] === activeSection);
    }
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      posts = posts.filter(p =>
        p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q) || p.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return posts;
  }, [pantryPosts, activeSection, debouncedSearch]);
  return (
    <CyberLayout title="地下茶水间" subtitle="the pantry · anonymous gossip">
      <CommunityAccessGate moduleName="地下茶水间节点" />

      <div className="mx-auto max-w-5xl px-4 py-5 font-mono">
        {/* Hero */}
        <div className="rounded-none border border-[#00ff41]/40 bg-black p-4 mb-4 shadow-[0_0_15px_rgba(0,255,65,0.08)]">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-[#00ff41]/50 flex items-center gap-2">
                <Terminal className="w-3 h-3" /> encrypted tea room
              </div>
              <h2 className="mt-1 text-lg sm:text-xl font-bold text-[#00ff41]">地下茶水间</h2>
              <p className="mt-1 text-[10px] sm:text-xs text-[#00ff41]/60 leading-relaxed">
                匿名吐槽 · 限时流言 · 二手交易 · 请开发者喝咖啡
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {[
            { label: '在线探针', value: pantryPosts.length, icon: MessageSquare },
            { label: '限时流言', value: 'LIVE', icon: Flame },
            { label: '匿名通道', value: 'E2E', icon: Hash },
            { label: '活跃节点', value: 'ONLINE', icon: Sparkles },
          ].map(item => (
            <div key={item.label} className="border border-[#00ff41]/20 bg-black p-3 text-center">
              <item.icon size={12} className="text-[#00ff41]/50 mx-auto mb-1.5" />
              <div className="text-lg font-bold text-[#00ff41]">{item.value}</div>
              <div className="text-[9px] uppercase tracking-widest text-[#00ff41]/40">{item.label}</div>
            </div>
          ))}
        </div>

        {/* Sub-section Nav + Search */}
        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
          <div className="flex gap-1.5 overflow-x-auto pb-1 flex-1 scrollbar-hide">
            {SUB_SECTIONS.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={cn(
                  'flex items-center justify-center gap-1.5 px-3 py-1.5 min-h-[44px] rounded-none border text-[10px] font-bold whitespace-nowrap transition-all',
                  activeSection === s.id
                    ? 'border-[#00ff41] bg-[#00ff41] text-black'
                    : 'border-[#00ff41]/20 bg-black text-[#00ff41]/50 hover:border-[#00ff41]/40'
                )}
              >
                {s.icon} {s.label}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-64">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#00ff41]/30" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="检索暗号..."
              className="w-full border border-[#00ff41]/20 min-h-[44px] bg-black py-1.5 pl-8 pr-3 text-xs text-[#00ff41] outline-none placeholder:text-[#00ff41]/20 focus:border-[#00ff41]/40"
            />
          </div>
        </div>

        {/* Gossip Board (always visible when section includes gossip) */}
        {(activeSection === 'all' || activeSection === 'gossip') && (
          <GossipBoard className="mb-6" />
        )}

        {/* Pantry Posts */}
        <div className="space-y-3">
          {activeSection !== 'gossip' && (
            <>
              {loading ? (
                <div className="border border-dashed border-[#00ff41]/20 bg-black p-8 text-center text-sm text-[#00ff41]/30 font-mono">
                  数据同步中...
                </div>
              ) : loadError ? (
                <div className="border border-dashed border-[#00ff41]/20 bg-black p-8 text-center text-sm text-[#00ff41]/30 font-mono">
                  <div>{loadError}</div>
                  <button onClick={() => void loadPantryPosts()} className="mt-2 text-xs text-[#00ff41]/60 hover:text-[#00ff41] min-h-[44px] px-4 py-2">
                    RETRY
                  </button>
                </div>
              ) : filteredPosts.length > 0 ? (
                filteredPosts.map(post => (
                  <PostCard key={post.id} post={post} variant="pantry" basePath="/bbs/pantry/thread" />
                ))
              ) : (
                <div className="border border-dashed border-[#00ff41]/20 bg-black p-8 text-center text-sm text-[#00ff41]/30">
                  {pantryPosts.length === 0 && !debouncedSearch && activeSection === 'all'
                    ? '茶水间暂时还没有帖子'
                    : '404 — 没有找到匹配的帖子'}
                </div>
              )}
            </>
          )}
        </div>

        {/* Hot Tags */}
        <div className="mt-6 border border-[#00ff41]/20 bg-black p-4 rounded-none">
          <div className="text-[10px] font-bold uppercase tracking-widest text-[#00ff41]/40 mb-3 flex items-center gap-2">
            <Hash className="w-3 h-3" /> INDEXED TOPICS
          </div>
          <div className="flex flex-wrap gap-2">
            {['#降薪吐槽', '#指标压力', '#利率战', '#跳槽', '#效率工具', '#匿名夜聊', '#二手交易', '#产品吐槽'].map(tag => (
              <span key={tag} className="px-2 py-1 bg-[#00ff41]/5 border border-[#00ff41]/10 text-[#00ff41]/30 text-[10px] font-mono rounded-sm hover:border-[#00ff41]/30 hover:text-[#00ff41]/60 transition-all cursor-pointer">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </CyberLayout>
  );
};

export default PantryPage;
