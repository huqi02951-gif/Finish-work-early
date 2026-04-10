
import React, { useState } from 'react';
import { 
  MessageSquare, Users, Lightbulb, Share2, MessageCircle, ArrowRight, 
  Search, Plus, Eye, EyeOff, Flame, Clock, Tag, User, 
  ChevronRight, MoreHorizontal, ThumbsUp, MessageSquare as ReplyIcon, 
  Bookmark, Shield, Zap, Globe, Lock
} from 'lucide-react';
import AppLayout from '../src/components/layout/AppLayout';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface Post {
  id: string;
  title: string;
  author: string;
  isAnonymous: boolean;
  category: string;
  time: string;
  replies: number;
  likes: number;
  tags: string[];
  summary: string;
  hotValue: number;
}

const BBSCenter: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('全部');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAnonymousMode, setIsAnonymousMode] = useState(false);

  const categories = [
    { id: 'all', name: '全部', icon: Globe },
    { id: 'exp', name: '经验帖', icon: Share2, desc: '系统操作、信贷流程、避坑指南' },
    { id: 'intel', name: '行业情报', icon: Zap, desc: '政策动态、竞争行观察、业务情报' },
    { id: 'scene', name: '场景讨论', icon: Lightbulb, desc: '客户切入、产品推介、难点突破' },
    { id: 'anon', name: '暗帖区', icon: Lock, desc: '匿名吐槽、职场感受、gossip' },
  ];

  const posts: Post[] = [
    {
      id: '1',
      title: '关于“长融保”授信审批中容易被忽略的三个合规细节',
      author: '资深审查员',
      isAnonymous: false,
      category: '经验帖',
      time: '2小时前',
      replies: 45,
      likes: 128,
      tags: ['长融保', '合规', '审批'],
      summary: '在近期的长融保审批中，发现不少客户经理在提交材料时，对于关联企业的认定和担保费的预留存在理解偏差...',
      hotValue: 95
    },
    {
      id: '2',
      title: '某友行最近在推的“科技贷”利率已经降到2.85%了，大家怎么看？',
      author: '情报观察员',
      isAnonymous: true,
      category: '行业情报',
      time: '4小时前',
      replies: 89,
      likes: 56,
      tags: ['竞品分析', '利率', '科技贷'],
      summary: '据可靠消息，某国有行在厦门分行推出的专项产品，针对专精特新企业给出了极具竞争力的价格...',
      hotValue: 88
    },
    {
      id: '3',
      title: '客户只谈利率，完全不看服务和增信方案，这种“死局”怎么破？',
      author: '深港来帖',
      isAnonymous: true,
      category: '场景讨论',
      time: '6小时前',
      replies: 156,
      likes: 210,
      tags: ['获客技巧', '利率谈判'],
      summary: '最近遇到几个制造业客户，开口就是比利率，我们行的优势在于中长期资金的稳定性，但客户现在只看眼前...',
      hotValue: 92
    },
    {
      id: '4',
      title: '吐槽一下：现在的系统报批流程是不是越来越长了？',
      author: '匿名用户A17',
      isAnonymous: true,
      category: '暗帖区',
      time: '1天前',
      replies: 320,
      likes: 540,
      tags: ['吐槽', '流程', '树洞'],
      summary: '以前一个流贷审批大概5个工作日，现在光是前置审核就要走一周，心累...',
      hotValue: 99
    },
    {
      id: '5',
      title: '整理了一份《柜面业务高频退件清单》，建议收藏',
      author: '柜面小能手',
      isAnonymous: false,
      category: '经验帖',
      time: '1天前',
      replies: 67,
      likes: 342,
      tags: ['柜面业务', '避坑', '干货'],
      summary: '总结了过去三个月内，支行上报业务中被退件最多的10个原因，希望能帮大家提高效率...',
      hotValue: 85
    }
  ];

  const hotTags = ['#长融保实战', '#利率战', '#专精特新', '#系统优化', '#吐槽大会', '#行业情报'];

  return (
    <AppLayout title="BBS 中心" showBack>
      <div className="min-h-screen bg-[#0a0a0c] text-white pb-24">
        {/* Immersive Header */}
        <header className="relative px-6 pt-8 sm:pt-16 pb-6 sm:pb-12 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.1),transparent_70%)]"></div>
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-brand-gold/5 rounded-full blur-[100px]"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3 sm:mb-4">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-gold shadow-[0_0_20px_rgba(197,160,89,0.1)]">
                <Shield className="w-[18px] h-[18px] sm:w-5 sm:h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-3xl font-bold tracking-tight">BBS 中心</h1>
                <p className="text-[8px] sm:text-[10px] text-white/40 uppercase tracking-[0.3em] font-bold mt-0.5 sm:mt-1">Encrypted Knowledge Space</p>
              </div>
            </div>
            <p className="text-white/60 text-[11px] sm:text-sm max-w-md leading-relaxed font-medium">
              专属于客户经理的经验情报站。在这里，每一份实战经验都是进阶的阶梯。
            </p>
          </div>
        </header>

        {/* Search & Post Bar */}
        <div className="px-6 mb-6 sm:mb-8">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-brand-gold transition-colors w-4 h-4 sm:w-[18px] sm:h-[18px]" />
              <input 
                type="text" 
                placeholder="搜索经验、情报或话题..." 
                className="w-full pl-11 pr-4 py-3 sm:py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-brand-gold/50 focus:ring-4 focus:ring-brand-gold/5 transition-all text-xs sm:text-sm font-medium placeholder:text-white/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex p-1 bg-white/5 rounded-xl border border-white/10">
                <button 
                  onClick={() => setIsAnonymousMode(false)}
                  className={cn(
                    "flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all",
                    !isAnonymousMode ? "bg-white/10 text-white shadow-lg" : "text-white/40 hover:text-white/60"
                  )}
                >
                  <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> 公开
                </button>
                <button 
                  onClick={() => setIsAnonymousMode(true)}
                  className={cn(
                    "flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all",
                    isAnonymousMode ? "bg-brand-gold/20 text-brand-gold shadow-lg" : "text-white/40 hover:text-white/60"
                  )}
                >
                  <EyeOff className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> 匿名
                </button>
              </div>
              
              <button className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-gold text-brand-dark rounded-xl font-bold text-[11px] sm:text-xs hover:scale-[1.02] active:scale-95 transition-all shadow-[0_10px_20px_rgba(197,160,89,0.2)]">
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> 发布新帖
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="px-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Categories (Desktop) / Horizontal Scroll (Mobile) */}
          <div className="lg:col-span-3">
            <div className="flex lg:flex-col gap-2 overflow-x-auto no-scrollbar pb-2 lg:pb-0 sticky lg:top-24">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.name)}
                  className={cn(
                    "flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-xl text-[11px] sm:text-sm font-bold transition-all whitespace-nowrap border text-left w-full",
                    activeCategory === cat.name 
                      ? "bg-brand-gold/10 text-brand-gold border-brand-gold/30 shadow-[0_0_15px_rgba(197,160,89,0.1)]" 
                      : "bg-white/5 text-white/40 border-white/5 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <cat.icon className={cn("w-4 h-4 sm:w-[18px] sm:h-[18px]", activeCategory === cat.name ? "text-brand-gold" : "opacity-50")} />
                  <div className="hidden lg:block">
                    <p>{cat.name}</p>
                    {cat.desc && <p className="text-[9px] font-medium opacity-40 mt-0.5">{cat.desc}</p>}
                  </div>
                  <span className="lg:hidden">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Middle: Post Feed */}
          <div className="lg:col-span-6 space-y-4">
            {posts.map((post) => (
              <motion.div 
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 border border-white/10 rounded-[2rem] p-6 hover:bg-white/[0.07] transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold border",
                      post.isAnonymous ? "bg-brand-gold/10 text-brand-gold border-brand-gold/20" : "bg-white/10 text-white/60 border-white/10"
                    )}>
                      {post.isAnonymous ? <Lock className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <p className={cn("text-xs font-bold", post.isAnonymous ? "text-brand-gold" : "text-white/80")}>
                        {post.author}
                      </p>
                      <p className="text-[9px] text-white/30 font-medium uppercase tracking-widest">{post.time} · {post.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-lg border border-white/5">
                    <Flame className="w-3 h-3 text-orange-500" />
                    <span className="text-[10px] font-bold text-white/40">{post.hotValue}</span>
                  </div>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-white mb-2 sm:mb-3 group-hover:text-brand-gold transition-colors leading-tight">
                  {post.title}
                </h3>
                
                <p className="text-[11px] sm:text-sm text-white/50 mb-4 sm:mb-6 line-clamp-2 font-medium leading-relaxed">
                  {post.summary}
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {post.tags.map(tag => (
                    <span key={tag} className="text-[9px] font-bold px-2 py-1 bg-white/5 text-white/40 rounded-md border border-white/5">
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-white/30 hover:text-brand-gold transition-colors">
                      <ThumbsUp className="w-4 h-4" />
                      <span className="text-xs font-bold">{post.likes}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/30 hover:text-brand-gold transition-colors">
                      <ReplyIcon className="w-4 h-4" />
                      <span className="text-xs font-bold">{post.replies}</span>
                    </div>
                  </div>
                  <button className="p-2 text-white/20 hover:text-white transition-colors">
                    <Bookmark className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Right: Hot List & Tags (Desktop Only) */}
          <div className="lg:col-span-3 hidden lg:block space-y-8">
            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6">
              <h4 className="text-xs font-bold uppercase tracking-widest text-brand-gold mb-6 flex items-center gap-2">
                <Flame className="w-4 h-4" /> 今日热议榜
              </h4>
              <div className="space-y-6">
                {posts.slice(0, 3).map((post, idx) => (
                  <div key={post.id} className="flex gap-4 group cursor-pointer">
                    <span className="text-2xl font-serif italic text-white/10 group-hover:text-brand-gold/40 transition-colors">0{idx + 1}</span>
                    <div>
                      <h5 className="text-xs font-bold text-white/80 line-clamp-2 group-hover:text-white transition-colors leading-snug">
                        {post.title}
                      </h5>
                      <p className="text-[9px] text-white/30 mt-1 font-medium">{post.replies} 条讨论</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6">
              <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-6 flex items-center gap-2">
                <Tag className="w-4 h-4" /> 热门标签
              </h4>
              <div className="flex flex-wrap gap-2">
                {hotTags.map(tag => (
                  <button key={tag} className="px-3 py-1.5 bg-white/5 hover:bg-brand-gold/10 border border-white/5 hover:border-brand-gold/30 rounded-lg text-[10px] font-bold text-white/40 hover:text-brand-gold transition-all">
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 bg-brand-gold/5 border border-brand-gold/10 rounded-[2rem]">
              <div className="flex items-center gap-2 text-brand-gold mb-3">
                <Zap className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">情报局公告</span>
              </div>
              <p className="text-[11px] text-white/60 leading-relaxed font-medium">
                BBS 中心已开启“匿名观察员”机制，所有匿名发帖均经过加密处理，请放心交流实战经验。
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default BBSCenter;
