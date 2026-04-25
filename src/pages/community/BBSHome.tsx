import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Briefcase, MessageSquare, Users } from 'lucide-react';
import AppLayout from '../../components/layout/AppLayout';
import PostCard from '../../components/community/PostCard';
import { forumApi } from '../../services/forumApi';
import type { Post } from '../../types';

const BBSHomePage: React.FC = () => {
  const [professionalPosts, setProfessionalPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // ─── Mysterious entrance state ────────────────────────────
  const navigate = useNavigate();
  const [knockCount, setKnockCount] = useState(0);
  const [hint, setHint] = useState<string>('');
  const knockTimerRef = useRef<number | null>(null);

  const SECRET_LINES = [
    '> auth.token expired ...',
    '> recheck again',
    '> hold the door ... almost',
  ];

  const handleKnock = () => {
    const next = knockCount + 1;
    setKnockCount(next);
    setHint(SECRET_LINES[Math.min(next - 1, SECRET_LINES.length - 1)]);

    if (knockTimerRef.current) window.clearTimeout(knockTimerRef.current);
    knockTimerRef.current = window.setTimeout(() => {
      setKnockCount(0);
      setHint('');
    }, 2000);

    if (next >= 3) {
      if (knockTimerRef.current) window.clearTimeout(knockTimerRef.current);
      setHint('> ACCESS GRANTED ...');
      setTimeout(() => navigate('/bbs/pantry'), 500);
    }
  };

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

  useEffect(() => {
    void loadHomeData();
    return () => {
      if (knockTimerRef.current) window.clearTimeout(knockTimerRef.current);
    };
  }, []);

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

            {/* Professional Zone Card */}
            <Link
              to="/bbs/professional"
              className="group block bg-white rounded-2xl md:rounded-[2rem] border border-brand-border/10 p-5 md:p-7 shadow-sm hover:shadow-md transition-all mb-6 md:mb-8"
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

            {/* Professional Zone Preview */}
            <div className="mb-12 animate-fade-in-up">
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

            {/* ─── Mysterious knock-knock entrance ─────────────── */}
            <div className="mt-16 animate-fade-in-up select-none">
              <button
                onClick={handleKnock}
                className="group block w-full text-left rounded-xl border border-dashed border-brand-border/40 bg-black/[0.02] hover:bg-black/[0.04] hover:border-brand-border/70 transition-all px-4 py-3 font-mono"
                aria-label="?"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[11px] text-brand-gray/40 group-hover:text-brand-gray/70 tracking-[0.2em] transition-colors">
                    {hint || '> _'}
                  </span>
                  <span className="flex items-center gap-1">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className={`h-1.5 w-1.5 rounded-full transition-colors ${
                          i < knockCount ? 'bg-emerald-500' : 'bg-brand-border/40'
                        }`}
                      />
                    ))}
                  </span>
                </div>
              </button>
              <p className="mt-2 text-center text-[9px] font-mono tracking-[0.3em] uppercase text-brand-gray/20">
                end of feed
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default BBSHomePage;
