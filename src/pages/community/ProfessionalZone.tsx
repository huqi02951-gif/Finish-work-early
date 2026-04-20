import React, { useEffect, useMemo, useState } from 'react';
import { ArrowUp, Clock, Search, MessageSquare, Pin } from 'lucide-react';
import AppLayout from '../../components/layout/AppLayout';
import PostCard from '../../components/community/PostCard';
import TagFilter from '../../components/community/TagFilter';
import { cn } from '../../../lib/utils';
import { useDebounce } from '../../../lib/utils';
import { forumApi } from '../../services/forumApi';
import type { Post } from '../../types';

type SortMode = 'latest' | 'hot' | 'pinned';

const ProfessionalZonePage: React.FC = () => {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [sortMode, setSortMode] = useState<SortMode>('pinned');
  const [professionalPosts, setProfessionalPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadProfessionalPosts = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await forumApi.getPosts({ boardSlug: 'professional', pageSize: 50 });
      setProfessionalPosts(res.items);
    } catch (err) {
      console.error('Failed to load professional posts:', err);
      setProfessionalPosts([]);
      setLoadError('专业业务区加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProfessionalPosts();
  }, []);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    professionalPosts.forEach(p => p.tags.forEach(t => tagSet.add(t)));
    return Array.from(tagSet);
  }, [professionalPosts]);

  const filteredPosts = useMemo(() => {
    let posts = [...professionalPosts];

    // Tag filter
    if (activeTag) {
      posts = posts.filter(p => p.tags.includes(activeTag));
    }

    // Search
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      posts = posts.filter(p =>
        p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q) || p.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    // Sort
    if (sortMode === 'pinned') {
      posts.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    } else if (sortMode === 'latest') {
      posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortMode === 'hot') {
      posts.sort((a, b) => (b.commentCount || 0) - (a.commentCount || 0));
    }

    return posts;
  }, [professionalPosts, activeTag, debouncedSearch, sortMode]);
  return (
    <AppLayout title="专业业务区" showBack>
      <div className="py-4 md:py-8 bg-brand-offwhite min-h-screen pb-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6 animate-fade-in-up">
              <h1 className="text-2xl md:text-3xl font-serif text-brand-dark tracking-tight mb-1">专业业务区</h1>
              <p className="text-sm text-brand-gray">知识沉淀 · 经验交流 · 共同进步</p>
            </div>

            {/* Controls Row */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6 animate-fade-in-up">
              {/* Search */}
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray/40" />
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="搜索帖子、标签..."
                  className="w-full pl-9 pr-4 py-2 min-h-[44px] bg-white border border-brand-border/20 rounded-xl text-sm text-brand-dark outline-none focus:border-brand-gold transition-all placeholder:text-brand-gray/40"
                />
              </div>

              {/* Sort Toggle */}
              <div className="flex items-center gap-1 bg-white border border-brand-border/20 rounded-xl p-1">
                {([
                  { key: 'pinned' as SortMode, label: '置顶', icon: <Pin className="w-3 h-3" /> },
                  { key: 'latest' as SortMode, label: '最新', icon: <Clock className="w-3 h-3" /> },
                  { key: 'hot' as SortMode, label: '最热', icon: <ArrowUp className="w-3 h-3" /> },
                ]).map(s => (
                  <button
                    key={s.key}
                    onClick={() => setSortMode(s.key)}
                    className={cn(
                      'flex items-center gap-1 px-3 py-2 min-h-[44px] rounded-lg text-xs font-medium transition-all',
                      sortMode === s.key
                        ? 'bg-brand-dark text-white'
                        : 'text-brand-gray hover:text-brand-dark'
                    )}
                  >
                    {s.icon} {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tag Filter */}
            <div className="mb-6 animate-fade-in-up">
              <TagFilter tags={allTags} activeTag={activeTag} onTagClick={setActiveTag} />
            </div>

            {/* Posts List */}
            <div className="space-y-3 animate-fade-in-up">
              {loading ? (
                <div className="text-center py-12 text-brand-gray text-sm">加载中...</div>
              ) : loadError ? (
                <div className="text-center py-12 text-brand-gray">
                  <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">{loadError}</p>
                  <button onClick={() => void loadProfessionalPosts()} className="mt-2 text-xs text-brand-gold hover:underline min-h-[44px] px-4 py-2">
                    重试
                  </button>
                </div>
              ) : filteredPosts.length > 0 ? (
                filteredPosts.map(post => (
                  <PostCard key={post.id} post={post} variant="professional" basePath="/bbs/professional" />
                ))
              ) : (
                <div className="text-center py-12 text-brand-gray">
                  <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  {professionalPosts.length === 0 && !activeTag && !debouncedSearch ? (
                    <p className="text-sm">专业业务区暂时还没有帖子</p>
                  ) : (
                    <>
                      <p className="text-sm">没有找到匹配的帖子</p>
                      <button
                        onClick={() => { setActiveTag(null); setSearchQuery(''); }}
                        className="mt-2 text-xs text-brand-gold hover:underline min-h-[44px] px-4 py-2"
                      >
                        清除筛选
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ProfessionalZonePage;
