
import React, { useState, useEffect } from 'react';
import { Search, Filter, MessageCircle, Share2, Heart } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import { apiService } from '../services/api';
import { Post } from '../types';
import { cn } from '../../lib/utils';

const Feed: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeCategory, setActiveCategory] = useState('全部');
  const [isLoading, setIsLoading] = useState(true);

  const categories = ['全部', '政策解读', '业务打法', '经验分享', '行业动态'];

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      const data = await apiService.getPosts(activeCategory === '全部' ? undefined : activeCategory);
      setPosts(data);
      setIsLoading(false);
    };
    fetchPosts();
  }, [activeCategory]);

  return (
    <AppLayout title="发现">
      {/* 🧪 本地演示标签 */}
      <div className="mx-4 mt-3 px-4 py-2.5 bg-amber-50 border border-amber-200/60 rounded-2xl flex items-center gap-2">
        <span className="text-sm">🧪</span>
        <span className="text-[11px] text-amber-700 font-medium">本地演示模式 · 数据仅保存在当前浏览器中</span>
      </div>
      <div className="sticky top-14 z-40 bg-brand-offwhite/80 backdrop-blur-md border-b border-brand-border/5 px-4 py-3 space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray opacity-40" size={16} />
          <input 
            type="text" 
            placeholder="搜索政策、话术、打法..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-brand-border/10 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-gold/20 transition-all"
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
        ) : posts.length > 0 ? (
          posts.map((post) => (
            <div key={post.id} className="bg-white rounded-2xl border border-brand-border/10 shadow-sm overflow-hidden animate-fade-in-up">
              {/* Post Header */}
              <div className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-light-gray overflow-hidden">
                  <img src={post.author?.avatar} alt={post.author?.nickname} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-brand-dark">{post.author?.nickname}</h4>
                  <p className="text-[10px] text-brand-gray font-medium opacity-60">{new Date(post.createdAt).toLocaleDateString()} • {post.category}</p>
                </div>
              </div>

              {/* Post Content */}
              <div className="px-4 pb-2">
                <h3 className="text-base font-bold text-brand-dark mb-2">{post.title}</h3>
                <p className="text-sm text-brand-gray line-clamp-3 leading-relaxed">{post.content}</p>
              </div>

              {/* Post Image */}
              {post.images.length > 0 && (
                <div className="mt-2 aspect-video w-full bg-brand-light-gray">
                  <img src={post.images[0]} alt="Post" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              )}

              {/* Post Footer */}
              <div className="p-4 border-t border-brand-border/5 flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <button className="flex items-center gap-1.5 text-brand-gray hover:text-brand-gold transition-colors">
                    <Heart size={18} />
                    <span className="text-xs font-bold">12</span>
                  </button>
                  <button className="flex items-center gap-1.5 text-brand-gray hover:text-brand-gold transition-colors">
                    <MessageCircle size={18} />
                    <span className="text-xs font-bold">3</span>
                  </button>
                </div>
                <button className="text-brand-gray hover:text-brand-gold transition-colors">
                  <Share2 size={18} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center space-y-4 opacity-40">
            <Search size={48} className="mx-auto" />
            <p className="text-sm font-bold uppercase tracking-widest">暂无相关内容</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Feed;
