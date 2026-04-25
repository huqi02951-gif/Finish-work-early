import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Briefcase, MessageSquare, Users, Terminal, Flame, Shield } from 'lucide-react';
import AppLayout from '../../components/layout/AppLayout';
import PostCard from '../../components/community/PostCard';
import { forumApi } from '../../services/forumApi';
import type { Post } from '../../types';

const BBSHomePage: React.FC = () => {
  const [professionalPosts, setProfessionalPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadHomeData = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const proRes = await forumApi.getPosts({ boardSlug: 'professional', pageSize: 6 });
      setProfessionalPosts(proRes.items);
    } catch (err) {
      console.error('Failed to load BBS home data:', err);
      setProfessionalPosts([]);
      setLoadError('社区分区数据加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadHomeData(); }, []);

  return (
    <AppLayout title="社区" showBack={true}>
      <div className="py-4 md:py-8 bg-brand-offwhite min-h-screen pb-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            {/* Hero Header */}
            <div className="mb-6 md:mb-8 animate-fade-in-up">
              <h1 className="text-2xl md:text-3xl font-serif text-brand-dark tracking-tight mb-2">社区</h1>
              <p className="text-sm text-brand-gray">同行的经验、教训、八卦，都在这里。</p>
            </div>

            {/* Two Zones */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 mb-8 md:mb-10 animate-fade-in-up">
              {/* Professional Zone */}
              <Link
                to="/bbs/professional"
                className="group block bg-white rounded-2xl md:rounded-[2rem] border border-brand-border/10 p-5 md:p-7 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 md:w-14 md:h-14 bg-brand-dark text-white rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                    <Briefcase className="w-5 h-5 md:w-7 md:h-7" />
                  </div>
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-brand-gray group-hover:text-brand-dark group-hover:translate-x-1 transition-all" />
                </div>
                <h2 className="text-base md:text-xl font-serif text-brand-dark font-bold mb-1">专业业务区</h2>
                <p className="text-[11px] md:text-sm text-brand-gray mb-4 leading-relaxed">
                  产品经验、信贷操作、工具教程、产品建议。知识沉淀，共同进步。
                </p>
                <div className="flex items-center gap-4 text-[10px] md:text-xs text-brand-gray">
                  <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {professionalPosts.length} 篇帖子</span>
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" /> 活跃讨论</span>
                </div>
              </Link>

              {/* Underground Tea Room — visible entry */}
              <Link
                to="/bbs/pantry"
                className="group relative block bg-[#050505] rounded-2xl md:rounded-[2rem] border border-[#00ff41]/25 p-5 md:p-7 shadow-lg hover:shadow-[0_0_30px_rgba(0,255,65,0.12)] transition-all overflow-hidden"
              >
                {/* scanline accent */}
                <div className="pointer-events-none absolute inset-0 opacity-[0.05]"
                  style={{ backgroundImage: 'repeating-linear-gradient(0deg, #00ff41 0px, #00ff41 1px, transparent 1px, transparent 3px)' }}
                />
                <div className="relative flex items-start justify-between mb-4">
                  <div className="w-11 h-11 md:w-14 md:h-14 bg-[#00ff41]/10 border border-[#00ff41]/30 text-[#00ff41] rounded-xl md:rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Terminal className="w-5 h-5 md:w-7 md:h-7" />
                  </div>
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-[#00ff41]/40 group-hover:text-[#00ff41] group-hover:translate-x-1 transition-all" />
                </div>
                <h2 className="relative text-base md:text-xl font-mono text-[#00ff41] font-bold mb-1">
                  地下茶水间<span className="ml-1 animate-pulse">_</span>
                </h2>
                <p className="relative text-[11px] md:text-xs text-[#00ff41]/60 font-mono mb-4 leading-relaxed">
                  匿名吐槽 · 黑市挂单 · 限时流言 · 定时密信。另一个世界的声音。
                </p>
                <div className="relative flex items-center gap-4 text-[10px] md:text-xs text-[#00ff41]/40 font-mono">
                  <span className="flex items-center gap-1"><Flame className="w-3 h-3" /> 限时焚毁</span>
                  <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> 仅本地存储</span>
                </div>
              </Link>
            </div>

            {/* Professional Zone Preview */}
            <div className="animate-fade-in-up">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-serif text-brand-dark font-bold flex items-center gap-2">
                  <Briefcase className="w-4 h-4" /> 最新动态
                </h3>
                <Link to="/bbs/professional" className="text-xs text-brand-gold font-medium flex items-center justify-center gap-1 hover:underline px-2 py-1 -mr-2">
                  查看全部 <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="grid gap-3">
                {loading ? (
                  <div className="text-sm text-brand-gray text-center py-6">加载中...</div>
                ) : loadError ? (
                  <div className="text-sm text-brand-gray text-center py-6">
                    <div>{loadError}</div>
                    <button onClick={() => void loadHomeData()} className="mt-2 text-xs text-brand-gold hover:underline px-4 py-2">
                      重试
                    </button>
                  </div>
                ) : professionalPosts.length ? (
                  professionalPosts.slice(0, 3).map(post => (
                    <PostCard key={post.id} post={post} variant="professional" basePath="/bbs/professional" />
                  ))
                ) : (
                  <div className="text-sm text-brand-gray text-center py-6">暂无帖子</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default BBSHomePage;
