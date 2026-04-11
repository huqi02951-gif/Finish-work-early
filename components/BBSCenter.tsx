
import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, Users, Lightbulb, Share2, MessageCircle, ArrowRight, 
  Search, Plus, Eye, EyeOff, Flame, Clock, Tag, User, 
  ChevronRight, MoreHorizontal, ThumbsUp, MessageSquare as ReplyIcon, 
  Bookmark, Shield, Zap, Globe, Lock, Terminal, Wifi, Radio, 
  AlertTriangle, Hash, Activity
} from 'lucide-react';
import AppLayout from '../src/components/layout/AppLayout';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// --- Matrix Rain Canvas ---
const MatrixRain: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    const fontSize = 10;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = new Array(columns).fill(1);

    const draw = () => {
      ctx.fillStyle = 'rgba(5, 5, 7, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(0, 255, 65, 0.12)';
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 50);
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full opacity-30 pointer-events-none"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};

// --- Glitch Text ---
const GlitchText: React.FC<{ text: string; className?: string }> = ({ text, className }) => {
  return (
    <span className={cn("relative inline-block", className)}>
      <span className="relative z-10">{text}</span>
      <span className="absolute top-0 left-[1px] z-0 text-[#00ff41] opacity-30 clip-glitch-1" aria-hidden>{text}</span>
      <span className="absolute top-0 left-[-1px] z-0 text-[#ff0040] opacity-20 clip-glitch-2" aria-hidden>{text}</span>
    </span>
  );
};

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
  encrypted?: boolean;
}

const BBSCenter: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('全部');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAnonymousMode, setIsAnonymousMode] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [signalStrength, setSignalStrength] = useState(87);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      setSignalStrength(80 + Math.floor(Math.random() * 18));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const categories = [
    { id: 'all', name: '全部', icon: Terminal, color: '#00ff41' },
    { id: 'exp', name: '经验帖', icon: Share2, desc: '系统操作·信贷流程·避坑指南', color: '#00d4ff' },
    { id: 'intel', name: '行业情报', icon: Radio, desc: '政策动态·竞品观察·业务情报', color: '#ff6b00' },
    { id: 'scene', name: '场景讨论', icon: Lightbulb, desc: '客户切入·产品推介·难点突破', color: '#a855f7' },
    { id: 'anon', name: '暗帖区', icon: Lock, desc: '匿名吐槽·职场感受·GOSSIP', color: '#ff0040' },
  ];

  const posts: Post[] = [
    {
      id: '1',
      title: '关于"长融保"授信审批中容易被忽略的三个合规细节',
      author: '资深审查员',
      isAnonymous: false,
      category: '经验帖',
      time: '2h ago',
      replies: 45,
      likes: 128,
      tags: ['长融保', '合规', '审批'],
      summary: '在近期的长融保审批中，发现不少客户经理在提交材料时，对于关联企业的认定和担保费的预留存在理解偏差...',
      hotValue: 95
    },
    {
      id: '2',
      title: '某友行最近在推的"科技贷"利率已经降到2.85%了，大家怎么看？',
      author: '情报观察员',
      isAnonymous: true,
      category: '行业情报',
      time: '4h ago',
      replies: 89,
      likes: 56,
      tags: ['竞品分析', '利率', '科技贷'],
      summary: '据可靠消息，某国有行在厦门分行推出的专项产品，针对专精特新企业给出了极具竞争力的价格...',
      hotValue: 88,
      encrypted: true
    },
    {
      id: '3',
      title: '客户只谈利率，完全不看服务和增信方案，这种"死局"怎么破？',
      author: '深港来帖',
      isAnonymous: true,
      category: '场景讨论',
      time: '6h ago',
      replies: 156,
      likes: 210,
      tags: ['获客技巧', '利率谈判'],
      summary: '最近遇到几个制造业客户，开口就是比利率，我们行的优势在于中长期资金的稳定性，但客户现在只看眼前...',
      hotValue: 92
    },
    {
      id: '4',
      title: '吐槽一下：现在的系统报批流程是不是越来越长了？',
      author: 'ANON_0x4F2A',
      isAnonymous: true,
      category: '暗帖区',
      time: '1d ago',
      replies: 320,
      likes: 540,
      tags: ['吐槽', '流程', '树洞'],
      summary: '以前一个流贷审批大概5个工作日，现在光是前置审核就要走一周，心累...',
      hotValue: 99,
      encrypted: true
    },
    {
      id: '5',
      title: '整理了一份《柜面业务高频退件清单》，建议收藏',
      author: '柜面小能手',
      isAnonymous: false,
      category: '经验帖',
      time: '1d ago',
      replies: 67,
      likes: 342,
      tags: ['柜面业务', '避坑', '干货'],
      summary: '总结了过去三个月内，支行上报业务中被退件最多的10个原因，希望能帮大家提高效率...',
      hotValue: 85
    }
  ];

  const hotTags = ['#长融保实战', '#利率战', '#专精特新', '#系统优化', '#吐槽大会', '#行业情报'];

  const filteredPosts = activeCategory === '全部' 
    ? posts 
    : posts.filter(p => p.category === activeCategory);

  const getHotColor = (value: number) => {
    if (value >= 95) return 'text-[#ff0040]';
    if (value >= 90) return 'text-[#ff6b00]';
    if (value >= 80) return 'text-[#00ff41]';
    return 'text-white/30';
  };

  const getHotBg = (value: number) => {
    if (value >= 95) return 'bg-[#ff0040]/10 border-[#ff0040]/20';
    if (value >= 90) return 'bg-[#ff6b00]/10 border-[#ff6b00]/20';
    if (value >= 80) return 'bg-[#00ff41]/10 border-[#00ff41]/20';
    return 'bg-white/5 border-white/5';
  };

  return (
    <AppLayout title="BBS 中心" showBack>
      {/* 🧪 本地演示标签 */}
      <div className="mx-4 mt-3 px-4 py-2.5 bg-amber-50 border border-amber-200/60 rounded-2xl flex items-center gap-2">
        <span className="text-sm">🧪</span>
        <span className="text-[11px] text-amber-700 font-medium">本地演示模式 · 数据仅保存在当前浏览器中</span>
      </div>
      <div className="min-h-screen bg-[#050507] text-white pb-24 relative overflow-hidden">
        {/* Matrix Rain Background */}
        <MatrixRain />
        
        {/* CRT Scanline Effect */}
        <div className="fixed inset-0 pointer-events-none z-40 opacity-[0.03]"
          style={{
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,65,0.03) 2px, rgba(0,255,65,0.03) 4px)',
          }}
        />

        {/* Vignette */}
        <div className="fixed inset-0 pointer-events-none z-30"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 50%, rgba(5,5,7,0.6) 100%)',
          }}
        />

        {/* Immersive Header */}
        <header className="relative px-4 pt-4 sm:pt-8 pb-4 sm:pb-6 overflow-hidden z-10">
          {/* Neon glow orbs */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#00ff41]/5 rounded-full blur-[80px]" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#ff0040]/5 rounded-full blur-[60px]" />
          
          <div className="relative z-10">
            {/* Terminal status bar */}
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00ff41] animate-pulse" />
                <span className="text-[9px] font-mono text-[#00ff41]/60 tracking-widest">
                  NODE:XM-BBS-{signalStrength}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[9px] font-mono text-white/20">
                  {currentTime.toLocaleTimeString('en-US', { hour12: false })}
                </span>
                <div className="flex items-center gap-1 text-[#00ff41]/40">
                  <Wifi className="w-2.5 h-2.5" />
                  <Activity className="w-2.5 h-2.5" />
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-[#00ff41]/10 border border-[#00ff41]/20 flex items-center justify-center shadow-[0_0_15px_rgba(0,255,65,0.15)]">
                <Terminal className="w-4 h-4 text-[#00ff41]" />
              </div>
              <div>
                <GlitchText 
                  text="BBS 中心" 
                  className="text-lg sm:text-2xl font-bold tracking-tight font-mono" 
                />
                <p className="text-[8px] sm:text-[9px] text-[#00ff41]/40 uppercase tracking-[0.4em] font-mono mt-0.5">
                  ENCRYPTED KNOWLEDGE NETWORK // v2.4.1
                </p>
              </div>
            </div>
            <p className="text-white/40 text-[10px] sm:text-xs max-w-md leading-relaxed font-mono pl-12">
              &gt; 专属于客户经理的实战经验暗网。每一份情报都经加密通道传输。
            </p>
          </div>
        </header>

        {/* Search & Controls */}
        <div className="px-4 mb-4 sm:mb-6 relative z-10">
          <div className="flex flex-col gap-3">
            {/* Search */}
            <div className="relative group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#00ff41]/30 group-focus-within:text-[#00ff41] transition-colors w-3.5 h-3.5" />
              <input 
                type="text" 
                placeholder="$ grep -r '关键词' /bbs/posts/*" 
                className="w-full pl-9 pr-4 py-2.5 sm:py-3 bg-[#0a0a0c] border border-[#00ff41]/10 rounded-xl focus:outline-none focus:border-[#00ff41]/40 focus:shadow-[0_0_20px_rgba(0,255,65,0.08)] transition-all text-xs font-mono placeholder:text-white/15 text-[#00ff41]/80"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-mono text-white/15 hidden sm:block">ESC</div>
            </div>
            
            {/* Controls Row */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex p-0.5 bg-white/[0.03] rounded-lg border border-white/5">
                <button 
                  onClick={() => setIsAnonymousMode(false)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-mono font-bold transition-all",
                    !isAnonymousMode 
                      ? "bg-[#00ff41]/10 text-[#00ff41] shadow-[0_0_10px_rgba(0,255,65,0.1)]" 
                      : "text-white/25 hover:text-white/40"
                  )}
                >
                  <Eye className="w-3 h-3" /> PUBLIC
                </button>
                <button 
                  onClick={() => setIsAnonymousMode(true)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-mono font-bold transition-all",
                    isAnonymousMode 
                      ? "bg-[#ff0040]/10 text-[#ff0040] shadow-[0_0_10px_rgba(255,0,64,0.1)]" 
                      : "text-white/25 hover:text-white/40"
                  )}
                >
                  <EyeOff className="w-3 h-3" /> ANON
                </button>
              </div>
              
              <button className="flex items-center gap-1.5 px-4 py-2 bg-[#00ff41]/10 border border-[#00ff41]/20 rounded-lg font-mono font-bold text-[10px] text-[#00ff41] hover:bg-[#00ff41]/20 active:scale-95 transition-all shadow-[0_0_15px_rgba(0,255,65,0.08)]">
                <Plus className="w-3 h-3" /> NEW POST
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills (horizontal scroll on mobile) */}
        <div className="px-4 mb-4 sm:mb-6 relative z-10">
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.name)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all whitespace-nowrap border shrink-0",
                  activeCategory === cat.name 
                    ? "border-current shadow-[0_0_12px_rgba(0,255,65,0.1)]"
                    : "bg-white/[0.02] text-white/25 border-white/5 hover:bg-white/[0.04] hover:text-white/40"
                )}
                style={activeCategory === cat.name ? { 
                  color: cat.color, 
                  backgroundColor: `${cat.color}10`,
                  borderColor: `${cat.color}30`
                } : {}}
              >
                <cat.icon className="w-3 h-3" />
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 relative z-10">
          
          {/* Post Feed */}
          <div className="lg:col-span-8 space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredPosts.map((post, idx) => (
                <motion.div 
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05, duration: 0.3 }}
                  className={cn(
                    "relative rounded-xl sm:rounded-2xl p-4 sm:p-5 transition-all group cursor-pointer",
                    "bg-white/[0.02] border border-white/[0.06] hover:border-[#00ff41]/20",
                    "hover:shadow-[0_0_30px_rgba(0,255,65,0.04)] hover:bg-white/[0.04]"
                  )}
                >
                  {/* Encrypted indicator */}
                  {post.encrypted && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-1.5 py-0.5 bg-[#ff0040]/10 border border-[#ff0040]/20 rounded text-[7px] font-mono text-[#ff0040]/60">
                      <Lock className="w-2 h-2" /> E2E
                    </div>
                  )}

                  {/* Author row */}
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className={cn(
                        "w-7 h-7 rounded-md flex items-center justify-center border",
                        post.isAnonymous 
                          ? "bg-[#ff0040]/10 border-[#ff0040]/15 text-[#ff0040]" 
                          : "bg-[#00ff41]/8 border-[#00ff41]/10 text-[#00ff41]/60"
                      )}>
                        {post.isAnonymous ? <Lock className="w-3 h-3" /> : <User className="w-3 h-3" />}
                      </div>
                      <div>
                        <p className={cn(
                          "text-[11px] font-mono font-bold",
                          post.isAnonymous ? "text-[#ff0040]/70" : "text-white/60"
                        )}>
                          {post.isAnonymous ? `[${post.author}]` : post.author}
                        </p>
                        <p className="text-[8px] text-white/20 font-mono tracking-wider">
                          {post.time} · {post.category}
                        </p>
                      </div>
                    </div>
                    <div className={cn(
                      "flex items-center gap-1 px-1.5 py-0.5 rounded border text-[9px] font-mono font-bold",
                      getHotBg(post.hotValue),
                      getHotColor(post.hotValue)
                    )}>
                      <Flame className="w-2.5 h-2.5" />
                      {post.hotValue}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-[13px] sm:text-sm font-bold text-white/90 mb-1.5 group-hover:text-[#00ff41] transition-colors leading-snug">
                    {post.title}
                  </h3>
                  
                  {/* Summary */}
                  <p className="text-[10px] sm:text-[11px] text-white/30 mb-3 line-clamp-2 font-mono leading-relaxed">
                    {post.summary}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {post.tags.map(tag => (
                      <span key={tag} className="text-[8px] font-mono font-bold px-1.5 py-0.5 bg-white/[0.03] text-[#00ff41]/40 rounded border border-[#00ff41]/8">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2.5 border-t border-white/[0.04]">
                    <div className="flex items-center gap-4">
                      <button className="flex items-center gap-1.5 text-white/20 hover:text-[#00ff41] transition-colors">
                        <ThumbsUp className="w-3 h-3" />
                        <span className="text-[10px] font-mono font-bold">{post.likes}</span>
                      </button>
                      <button className="flex items-center gap-1.5 text-white/20 hover:text-[#00d4ff] transition-colors">
                        <ReplyIcon className="w-3 h-3" />
                        <span className="text-[10px] font-mono font-bold">{post.replies}</span>
                      </button>
                    </div>
                    <button className="p-1.5 text-white/10 hover:text-[#ff6b00] transition-colors">
                      <Bookmark className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Sidebar — visible on mobile as horizontal cards, desktop as column */}
          <div className="lg:col-span-4 space-y-3 sm:space-y-4">
            {/* Hot Ranking */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl sm:rounded-2xl p-4 sm:p-5">
              <h4 className="text-[9px] font-mono font-bold uppercase tracking-[0.3em] text-[#ff6b00]/60 mb-3 flex items-center gap-2">
                <Flame className="w-3 h-3 text-[#ff6b00]" /> TRENDING // 今日热议
              </h4>
              <div className="space-y-3">
                {posts.slice(0, 3).map((post, idx) => (
                  <div key={post.id} className="flex gap-3 group cursor-pointer">
                    <span className={cn(
                      "text-lg font-mono font-black shrink-0 w-6 text-center",
                      idx === 0 ? "text-[#ff0040]/40" : idx === 1 ? "text-[#ff6b00]/30" : "text-white/10"
                    )}>
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <h5 className="text-[11px] font-bold text-white/60 line-clamp-2 group-hover:text-[#00ff41] transition-colors leading-snug">
                        {post.title}
                      </h5>
                      <p className="text-[8px] text-white/20 mt-1 font-mono">{post.replies} replies · {post.likes} ↑</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hot Tags */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl sm:rounded-2xl p-4 sm:p-5">
              <h4 className="text-[9px] font-mono font-bold uppercase tracking-[0.3em] text-white/20 mb-3 flex items-center gap-2">
                <Hash className="w-3 h-3" /> TAGS
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {hotTags.map(tag => (
                  <button key={tag} className="px-2 py-1 bg-white/[0.03] hover:bg-[#00ff41]/10 border border-white/[0.05] hover:border-[#00ff41]/20 rounded-md text-[9px] font-mono font-bold text-white/25 hover:text-[#00ff41] transition-all">
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* System Notice */}
            <div className="relative overflow-hidden rounded-xl sm:rounded-2xl p-4 sm:p-5 bg-[#00ff41]/[0.03] border border-[#00ff41]/10">
              {/* Scanning line */}
              <div className="absolute top-0 left-0 w-full h-[1px] bg-[#00ff41]/20 animate-[scanline_4s_linear_infinite]" />
              
              <div className="flex items-center gap-2 text-[#00ff41]/60 mb-2">
                <Shield className="w-3 h-3" />
                <span className="text-[8px] font-mono font-bold uppercase tracking-[0.3em]">SYS_NOTICE</span>
              </div>
              <p className="text-[10px] text-white/30 leading-relaxed font-mono">
                &gt; BBS 暗网通道已启用 E2E 加密协议。所有匿名帖经零知识证明处理，请放心交流实战情报。
              </p>
              <div className="mt-2 flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-[#00ff41] animate-pulse" />
                <span className="text-[7px] font-mono text-[#00ff41]/30">SECURE_CHANNEL :: ACTIVE</span>
              </div>
            </div>

            {/* Connection Status */}
            <div className="px-3 py-2 bg-white/[0.01] border border-white/[0.04] rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wifi className="w-2.5 h-2.5 text-[#00ff41]/30" />
                <span className="text-[7px] font-mono text-white/15">PEERS: 1,247 ONLINE</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full bg-[#00ff41]/40 animate-pulse" />
                <span className="text-[7px] font-mono text-[#00ff41]/20">LATENCY: 12ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for glitch effects */}
      <style>{`
        .clip-glitch-1 {
          animation: glitch-1 2.5s infinite steps(2);
        }
        .clip-glitch-2 {
          animation: glitch-2 3s infinite steps(3);
        }
        @keyframes glitch-1 {
          0%, 100% { clip-path: inset(0 0 0 0); }
          20% { clip-path: inset(20% 0 60% 0); }
          40% { clip-path: inset(60% 0 10% 0); }
        }
        @keyframes glitch-2 {
          0%, 100% { clip-path: inset(0 0 0 0); }
          30% { clip-path: inset(40% 0 30% 0); }
          60% { clip-path: inset(10% 0 70% 0); }
        }
      `}</style>
    </AppLayout>
  );
};

export default BBSCenter;
