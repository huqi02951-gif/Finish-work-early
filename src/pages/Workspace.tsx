import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Briefcase,
  FileText,
  MessageSquare,
  Pin,
  Plus,
  Sparkles,
  Terminal,
  Wrench,
  Ghost,
  Dices,
  Coffee,
  HeartHandshake,
  User,
  X,
  QrCode
} from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import { cn } from '../../lib/utils';
import { db, type GeneratedArtifact } from '../../lib/localDB';
import { useCustomer } from '../../lib/CustomerContext';
import { forumApi } from '../services/forumApi';
import { getAuthSession } from '../services/authService';
import type { ForumBoard, Post } from '../types';
import { useToast } from '../components/common/Toast';

const TOOL_META: Record<string, { name: string; path: string }> = {
  'sensitive-comm': { name: '敏感沟通助手', path: '/sensitive-comm' },
  'rate-offer': { name: '利率优惠签报', path: '/rate-offer' },
  'acceptance-calc': { name: '银承/存单测算', path: '/acceptance-calculator' },
  'material-checklist': { name: '材料清单中心', path: '/material-checklist' },
};

const DEFAULT_BOARD = 'experience-sharing';
const MOCK_AVATARS = ['行内第一深情', '理性的终端机', '加班吃泡面', '打工人404'];

const WorkspacePage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { customer, setCustomer, clearCustomer, hasCustomer } = useCustomer();
  const [boards, setBoards] = useState<ForumBoard[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [officialPosts, setOfficialPosts] = useState<Post[]>([]);
  const [recentArtifacts, setRecentArtifacts] = useState<GeneratedArtifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [composing, setComposing] = useState(false);
  const [activeBoard, setActiveBoard] = useState<string>('all');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [anonName, setAnonName] = useState(MOCK_AVATARS[0]);
  const [selectedAuthor, setSelectedAuthor] = useState<{nickname: string, isAnon: boolean} | null>(null);
  const [showQr, setShowQr] = useState(false);
  
  const [form, setForm] = useState({
    boardSlug: DEFAULT_BOARD,
    title: '',
    content: '',
    tags: '',
  });
  const [mobileTab, setMobileTab] = useState<'posts' | 'tools'>('posts');

  const quickTools = useMemo(
    () => ['sensitive-comm', 'rate-offer', 'acceptance-calc', 'material-checklist'].map((id) => ({ id, ...TOOL_META[id] })),
    [],
  );

  const displayBoards = useMemo(
    () => boards.filter((item) => !item.isOfficial),
    [boards],
  );

  const loadCommunity = async () => {
    setLoading(true);
    try {
      const [boardList, postList, officialList, artifacts] = await Promise.all([
        forumApi.getBoards(),
        forumApi.getPosts({
          boardSlug: activeBoard === 'all' ? undefined : activeBoard,
          pageSize: 20,
        }),
        forumApi.getOfficialPosts({
          pageSize: 4,
        }),
        db.artifacts.orderBy('createdAt').reverse().limit(4).toArray(),
      ]);

      setBoards(boardList);
      setPosts(postList.items);
      setOfficialPosts(officialList.items);
      setRecentArtifacts(artifacts);

      if (!boardList.find((item) => item.slug === form.boardSlug && !item.isOfficial)) {
        const fallbackBoard = boardList.find((item) => !item.isOfficial)?.slug || DEFAULT_BOARD;
        setForm((current) => ({ ...current, boardSlug: fallbackBoard }));
      }
    } catch (error) {
      console.error('Failed to load workspace community', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCommunity();
  }, [activeBoard]);

  const rollDice = () => {
    const random = MOCK_AVATARS[Math.floor(Math.random() * MOCK_AVATARS.length)];
    setAnonName(random);
  }

  const handleCreatePost = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;

    const session = getAuthSession();
    if (!session || session.loginMethod === 'demo') {
      toast.warning('请先登录后再发帖');
      navigate('/login');
      return;
    }

    try {
      await forumApi.createPost({
        boardSlug: form.boardSlug,
        title: form.title.trim(),
        content: form.content.trim(),
        tags: form.tags
          .split(/[，,]/)
          .map((item) => item.trim())
          .filter(Boolean),
        postType: form.boardSlug === 'system-operations' ? 'TOPIC' : 'DISCUSSION',
      });
      setForm({
        boardSlug: form.boardSlug,
        title: '',
        content: '',
        tags: '',
      });
      setComposing(false);
      await loadCommunity();
    } catch (error) {
      const message = error instanceof Error ? error.message : '发帖失败';
      toast.error(message);
    }
  };

  const getPostPath = (post: Post) =>
    post.postType === 'TOPIC' ? `/formal/topic/${post.id}` : `/formal/thread/${post.id}`;

  const handleAuthorClick = (e: React.MouseEvent, nickname: string, isAnon: boolean) => {
    e.preventDefault();
    setSelectedAuthor({ nickname, isAnon });
    setShowQr(false);
  }

  return (
    <AppLayout title="工作台" theme="default">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:gap-6 px-3 py-4 sm:px-6 sm:py-6 bg-[#F5F6FA] min-h-[100dvh] pb-24">
        <section className="flex flex-col gap-4 pb-2">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex-grow pl-1">
              <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#1c1c1e] tracking-tight">工作台 & 茶水间</h1>
              <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-neutral-500 font-medium">
                实用任务入口合集。包含官方指南及匿名的实战交流经验沉淀区域。
              </p>
            </div>
            
            {/* High-frequency Action Bar (Sticky-like) */}
            <div className="flex gap-2">
              <Link
                to="/instructions"
                className="flex-1 sm:flex-none flex justify-center items-center gap-1.5 rounded-[12px] bg-white border border-neutral-200/80 px-4 py-2.5 text-[13px] font-bold text-neutral-600 hover:bg-neutral-50 shadow-sm transition-all"
              >
                <FileText size={14} />
                官方帮助
              </Link>
              <button
                onClick={() => setComposing((current) => !current)}
                className="flex-[2] sm:flex-none flex justify-center items-center gap-1.5 rounded-[12px] bg-blue-600 px-5 py-2.5 text-[13px] font-bold text-white hover:bg-blue-700 shadow-[0_4px_12px_rgba(37,99,235,0.2)] transition-all"
              >
                <Plus size={16} />
                我要发帖
              </button>
            </div>
          </div>
        </section>

        {/* Mobile Tab Switcher */}
        <div className="flex gap-1 mb-2 bg-neutral-200/50 rounded-xl p-1 sm:hidden">
          <button onClick={() => setMobileTab('posts')}
            className={`flex-1 py-1.5 rounded-[10px] text-[13px] font-bold transition-all ${mobileTab === 'posts' ? 'bg-white text-blue-600 shadow-sm' : 'text-neutral-500'}`}>
            交流大厅
          </button>
          <button onClick={() => setMobileTab('tools')}
            className={`flex-1 py-1.5 rounded-[10px] text-[13px] font-bold transition-all ${mobileTab === 'tools' ? 'bg-white text-neutral-800 shadow-sm' : 'text-neutral-500'}`}>
            工具面板
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
          {/* Main Content Area (Posts & Compose) */}
          <div className={cn(
            "flex flex-col gap-4",
            mobileTab === 'tools' ? "hidden sm:flex" : "flex",
          )}>
            
            {/* Composer */}
            {composing ? (
              <section className="rounded-[20px] bg-white p-5 border border-neutral-100 shadow-[0_4px_24px_rgba(0,0,0,0.04)] animate-slide-in-down overflow-hidden relative">
                {isAnonymous && <div className="absolute inset-0 bg-neutral-900 pointer-events-none mix-blend-overlay opacity-5 noise-bg"></div>}
                
                <form className="grid gap-3 relative z-10" onSubmit={handleCreatePost}>
                  <div className="flex items-center justify-between mb-2 pb-3 border-b border-neutral-100">
                     <h3 className="font-bold text-neutral-800 flex items-center gap-1.5"><MessageSquare size={16}/> 撰写新帖子</h3>
                     <button
                       type="button" 
                       onClick={() => setIsAnonymous(!isAnonymous)}
                       className={cn(
                          "px-3 py-1.5 rounded-full text-[11px] font-bold border transition-colors flex items-center gap-1",
                          isAnonymous ? "bg-black text-[#00FFAA] border-[#00FFAA]/30 shadow-[0_0_8px_rgba(0,255,170,0.2)]" : "bg-neutral-100 text-neutral-500 border-transparent"
                       )}
                     >
                       <Ghost size={12} /> {isAnonymous ? "匿名已开" : "实名模式"}
                     </button>
                  </div>

                  {isAnonymous && (
                    <div className="flex items-center gap-2 mb-2 p-2.5 bg-neutral-900 rounded-xl text-[#EAEAEA] text-[11px] font-mono">
                      <span>当前马甲：</span>
                      <span className="text-[#00FFAA] font-bold">{anonName}</span>
                      <button type="button" onClick={rollDice} className="ml-auto flex items-center gap-1 hover:text-white transition-colors bg-white/10 px-2 py-1 rounded-md active:scale-95 text-[10px]">
                        <Dices size={10} /> 摇骰子换名
                      </button>
                    </div>
                  )}

                  <div className="grid gap-3 md:grid-cols-[160px_1fr]">
                    <select
                      value={form.boardSlug}
                      onChange={(event) => setForm((current) => ({ ...current, boardSlug: event.target.value }))}
                      className="rounded-xl border border-neutral-200 bg-neutral-50/50 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:bg-white font-medium"
                    >
                      {displayBoards.map((board) => (
                        <option key={board.slug} value={board.slug}>
                          {board.name}
                        </option>
                      ))}
                    </select>
                    <input
                      value={form.title}
                      onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                      className="rounded-xl border border-neutral-200 bg-neutral-50/50 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:bg-white font-medium placeholder:text-neutral-400"
                      placeholder="一句话概括核心点"
                      required
                    />
                  </div>
                  <textarea
                    value={form.content}
                    onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))}
                    className="min-h-28 rounded-xl border border-neutral-200 bg-neutral-50/50 px-4 py-3 text-sm leading-relaxed outline-none focus:border-blue-500 focus:bg-white font-medium placeholder:text-neutral-400"
                    placeholder="详细说明背景、做法与结论。越真实的细节，越能帮到其他同事..."
                    required
                  />
                  <input
                    value={form.tags}
                    onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))}
                    className="rounded-xl border border-neutral-200 bg-neutral-50/50 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:bg-white font-medium placeholder:text-neutral-400"
                    placeholder="添加标签（以逗号分隔，如：二手, 求购）"
                  />
                  <div className="flex justify-end gap-3 mt-1">
                    <button
                      type="button"
                      onClick={() => setComposing(false)}
                      className="px-5 py-2.5 rounded-xl text-sm font-bold text-neutral-500 hover:bg-neutral-100 transition-colors"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition-colors shadow-md"
                    >
                      {isAnonymous ? '匿名发布' : '发布'}
                    </button>
                  </div>
                </form>
              </section>
            ) : null}

            {/* Board filter Pill Tabs */}
            <section className="bg-[#F5F6FA] py-1 sticky top-14 z-30">
              <div className="flex gap-2 overflow-x-auto no-scrollbar snap-x">
                <button
                  onClick={() => setActiveBoard('all')}
                  className={cn(
                    "snap-start shrink-0 rounded-full px-4 py-1.5 text-xs font-extrabold transition-all border",
                    activeBoard === 'all'
                      ? 'bg-neutral-800 text-white border-neutral-800 shadow-sm'
                      : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
                  )}
                >
                  全部板块
                </button>
                {displayBoards.map((board) => (
                  <button
                    key={board.slug}
                    onClick={() => setActiveBoard(board.slug)}
                    className={cn(
                      "snap-start shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition-all border",
                      activeBoard === board.slug
                         ? (board.slug === 'pantry' ? 'bg-[#050505] text-[#00FFAA] border-[#00FFAA]/50 shadow-[0_0_8px_rgba(0,255,170,0.3)]' : 'bg-blue-600 text-white border-blue-600 shadow-sm')
                         : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
                    )}
                  >
                    {board.slug === 'pantry' && <Terminal size={10} className="inline mr-1" />}
                    {board.name}
                  </button>
                ))}
              </div>
            </section>

            {/* Posts List */}
            <div className="grid gap-3">
              {loading ? (
                <div className="rounded-[20px] p-8 text-center text-sm font-bold text-neutral-400">
                  正在同步数据中...
                </div>
              ) : posts.length ? (
                posts.map((post) => {
                  const isPantry = post.board?.slug === 'pantry';
                  const isTradeItem = post.tags.some(t => ['二手','交换','出售','求购','置换'].includes(t));
                  const isHot = (post.commentCount || 0) > 5;
                  
                  return (
                    <article 
                      key={post.id} 
                      className={cn(
                        "rounded-[20px] p-4 transition-all hover:scale-[1.01] active:scale-[0.99] relative overflow-hidden",
                        isPantry ? "bg-[#111111] text-[#EAEAEA] border border-[#222222]" : "bg-white border border-neutral-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)]",
                        isHot ? (isPantry ? "shadow-[0_0_15px_rgba(0,255,170,0.15)] outline outline-1 outline-[#00FFAA]/40" : "shadow-[0_4px_16px_rgba(37,99,235,0.08)] outline outline-1 outline-blue-500/30") : ""
                      )}
                    >
                      {/* Pantry Noise layer */}
                      {isPantry && <div className="absolute inset-0 bg-[#00FFAA]/5 noise-bg mix-blend-overlay pointer-events-none" />}

                      <div className="flex flex-wrap items-center gap-1.5 text-[11px] mb-2 font-bold relative z-10">
                        {post.isPinned ? (
                          <span className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 bg-orange-100 text-orange-600 border border-orange-200">
                            <Pin size={10} /> 置顶
                          </span>
                        ) : null}
                        {isTradeItem ? (
                           <span className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 bg-yellow-100 text-yellow-700 border border-yellow-300 shadow-sm">
                             <HeartHandshake size={10} /> 闲置互转
                           </span>
                        ) : null}
                        {post.board ? (
                          <span className={isPantry ? "text-[#00FFAA]/70 font-mono" : "text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded"}>
                            {post.board.name}
                          </span>
                        ) : null}
                        
                        <button 
                           onClick={(e) => handleAuthorClick(e, post.author?.nickname || '隐藏信源', isPantry)}
                           className={cn(
                             "ml-1 hover:underline underline-offset-2", 
                             isPantry ? "text-[#00FFAA]/80 font-mono" : "text-blue-600"
                           )}
                        >
                          • {post.author?.nickname || '隐藏信源'}
                        </button>
                      </div>

                      <Link to={getPostPath(post)} className="block relative z-10">
                        <h3 className={cn(
                          "text-base font-extrabold leading-snug tracking-tight mb-1.5",
                          isPantry ? "text-white group-hover:text-[#00FFAA]" : "text-neutral-800"
                        )}>
                          {post.title}
                        </h3>
                        <p className={cn(
                          "line-clamp-2 text-[13px] leading-relaxed font-medium",
                          isPantry ? "text-neutral-400" : "text-neutral-500"
                        )}>
                          {post.summary || post.content}
                        </p>
                      </Link>

                      <div className="mt-3.5 flex flex-wrap items-center justify-between relative z-10">
                        <div className="flex gap-1.5">
                           {post.tags.slice(0, 3).map((tag) => (
                             <span key={tag} className={cn(
                               "rounded px-1.5 py-0.5 text-[10px] font-bold",
                               isPantry ? "bg-white/10 text-neutral-300 font-mono border border-white/5" : "bg-neutral-100 text-neutral-500"
                             )}>
                               #{tag}
                             </span>
                           ))}
                        </div>
                        <div className={cn(
                          "flex items-center gap-3 text-[11px] font-bold",
                          isPantry ? "text-[#00FFAA]/60 font-mono" : "text-neutral-400"
                        )}>
                           {isHot && <span className={isPantry ? "text-[#00FFAA] animate-pulse" : "text-blue-500"}>热帖</span>}
                           <span className="flex items-center gap-1"><MessageSquare size={12} /> {post.commentCount || 0}</span>
                        </div>
                      </div>
                    </article>
                  );
                })
              ) : (
                <div className="rounded-[20px] border border-dashed border-neutral-200 bg-white p-10 text-center text-sm font-bold text-neutral-400 shadow-sm">
                  没有找到帖子信号，点击“我要发帖”新建一个。
                </div>
              )}
            </div>
          </div>

          {/* Right/Bottom Auxiliary Panel */}
          <div className={cn(
            "flex flex-col gap-4",
            mobileTab === 'posts' ? "hidden sm:flex" : "flex",
          )}>
            
            {/* 官方帮助帖 (Pinned visual) */}
            <section className="rounded-[20px] border border-orange-200 bg-gradient-to-b from-orange-50 to-white p-4 shadow-sm relative overflow-hidden">
               <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-orange-400 to-orange-200" />
               <div className="mb-3 flex items-center gap-1.5 text-[13px] font-extrabold text-orange-700">
                <Sparkles size={14} className="text-orange-500" />
                官方必读
              </div>
              <div className="grid gap-2">
                {officialPosts.map((post) => (
                  <Link key={post.id} to={getPostPath(post)} className="rounded-[12px] bg-white/70 backdrop-blur-sm border border-orange-100 p-2.5 transition-colors hover:bg-white flex flex-col gap-1 shadow-[0_2px_8px_rgba(255,237,213,0.5)]">
                    <div className="text-[13px] font-bold text-neutral-800 tracking-tight leading-snug">{post.title}</div>
                  </Link>
                ))}
              </div>
            </section>

            {/* 高频小工作台 */}
            <section className="rounded-[20px] border border-neutral-100 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-1.5 text-[13px] font-extrabold text-neutral-800">
                <Wrench size={14} className="text-blue-500" />
                桌面工具挂件
              </div>
              <div className="grid grid-cols-2 gap-2">
                {quickTools.map((tool) => (
                  <Link
                    key={tool.id}
                    to={tool.path}
                    className="flex flex-col gap-1 rounded-[12px] border border-neutral-100 bg-neutral-50 p-2.5 text-neutral-700 hover:bg-white hover:shadow-sm hover:border-blue-100 transition-all active:scale-95 text-left"
                  >
                    <span className="text-[12px] font-bold line-clamp-1">{tool.name}</span>
                    <ArrowRight size={12} className="text-neutral-300 mt-auto ml-auto" />
                  </Link>
                ))}
              </div>
            </section>

            {/* Context & Artifacts */}
            <section className="rounded-[20px] border border-neutral-100 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-4">
                 <div>
                    <div className="mb-2 flex items-center justify-between text-[13px] font-extrabold text-neutral-800">
                      <span>工作上下文</span>
                      {hasCustomer && (
                         <button type="button" onClick={clearCustomer} className="text-[11px] text-neutral-400 hover:text-red-500">清除暂存</button>
                      )}
                    </div>
                     {hasCustomer ? (
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex flex-col gap-1">
                          <span className="text-[10px] text-blue-500 font-bold uppercase">当前案头客户</span>
                          <span className="text-sm font-extrabold text-blue-900">{customer.name}</span>
                        </div>
                      ) : (
                        <input
                          placeholder="输入名称后回车，挂载上下文"
                          className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs font-bold outline-none focus:border-blue-500"
                          onKeyDown={(event) => {
                            const value = (event.target as HTMLInputElement).value.trim();
                            if (event.key === 'Enter' && value) {
                              setCustomer({ name: value });
                              (event.target as HTMLInputElement).value = '';
                            }
                          }}
                        />
                      )}
                 </div>

                 <div className="border-t border-dashed border-neutral-200 pt-3">
                    <div className="mb-2 flex items-center gap-1.5 text-[13px] font-extrabold text-neutral-800">
                      <Briefcase size={12} className="text-neutral-400" />
                      近期的物料
                    </div>
                    {recentArtifacts.length ? (
                      <div className="flex flex-col gap-2">
                        {recentArtifacts.map((item) => (
                           <div key={item.id} className="text-xs font-bold text-neutral-600 truncate border-l-2 border-neutral-200 pl-2 py-0.5">
                             {item.title}
                           </div>
                        ))}
                      </div>
                    ) : (
                       <div className="text-xs font-medium text-neutral-400">无最新生成的文件物料。</div>
                    )}
                 </div>
              </div>
            </section>

          </div>
        </div>
      </div>

      {/* Author Drawer */}
      {selectedAuthor && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedAuthor(null)} />
           <div className={cn(
             "relative w-full max-w-6xl mx-auto rounded-t-[32px] p-6 pb-safe animate-slide-in-down border-t",
             selectedAuthor.isAnon ? "bg-[#111] border-[#222]" : "bg-white border-white"
           )}>
              <button 
                onClick={() => setSelectedAuthor(null)} 
                className={cn("absolute right-6 top-6 w-8 h-8 rounded-full flex items-center justify-center", selectedAuthor.isAnon ? "bg-white/10 text-white" : "bg-neutral-100 text-neutral-500")}
              >
                <X size={16} />
              </button>

              <div className="flex flex-col items-center text-center mt-4">
                 <div className={cn(
                   "w-20 h-20 rounded-full flex items-center justify-center mb-4 border-4",
                   selectedAuthor.isAnon ? "bg-black border-[#00FFAA]/30 text-[#00FFAA]" : "bg-blue-50 border-blue-100 text-blue-500"
                 )}>
                    {selectedAuthor.isAnon ? <Ghost size={32}/> : <User size={32}/>}
                 </div>
                 <h3 className={cn(
                   "text-2xl font-extrabold mb-1",
                   selectedAuthor.isAnon ? "text-white font-mono" : "text-neutral-800"
                 )}>{selectedAuthor.nickname}</h3>
                 <div className={cn("text-xs font-bold mb-6 px-3 py-1 rounded-full", selectedAuthor.isAnon ? "bg-[#00FFAA]/10 text-[#00FFAA]" : "bg-blue-50 text-blue-600")}>
                    累计精华贡献：{Math.floor(Math.random() * 20 + 1)} 篇
                 </div>

                 {/* Action */}
                 <div className="w-full max-w-sm flex flex-col gap-3 mt-4">
                    {!showQr ? (
                      <button 
                         onClick={() => setShowQr(true)}
                         className={cn(
                           "w-full py-4 rounded-2xl flex flex-col items-center justify-center gap-1 font-bold transition-all active:scale-95",
                           selectedAuthor.isAnon ? "bg-[#00FFAA] text-black shadow-[0_4px_24px_rgba(0,255,170,0.3)]" : "bg-orange-500 text-white shadow-[0_4px_24px_rgba(249,115,22,0.3)]"
                         )}
                      >
                         <span className="flex items-center gap-1.5 text-base"><Coffee size={18} /> 请贴主喝杯咖啡</span>
                         <span className="text-[10px] opacity-80 font-normal">支持创作者持续输出实战经验</span>
                      </button>
                    ) : (
                      <div className={cn(
                        "w-full p-6 bg-white rounded-[24px] flex flex-col items-center justify-center border animate-fade-in",
                        selectedAuthor.isAnon ? "border-[#00FFAA]" : "border-orange-200"
                      )}>
                         <div className="w-48 h-48 bg-neutral-100 rounded-xl flex items-center justify-center mb-4 relative overflow-hidden">
                            <QrCode size={64} className="text-neutral-300" />
                            <div className="absolute inset-0 border-4 border-dashed border-neutral-300 rounded-xl" />
                         </div>
                         <p className="text-xs text-neutral-500 font-bold mb-1">长按识别打赏码 (前端Mock)</p>
                         <p className="text-[10px] text-neutral-400 font-medium">所有的打赏将直接进入原贴主账户，平台不抽成。</p>
                      </div>
                    )}
                 </div>
              </div>
           </div>
        </div>
      )}

    </AppLayout>
  );
};

export default WorkspacePage;
