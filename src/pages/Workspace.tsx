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
import { db, type DraftRecord, type GeneratedArtifact } from '../../lib/localDB';
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
  'to-myself-focus-timer': { name: '专注计时器', path: '/scenarios' },
};

const DEFAULT_BOARD = 'experience-sharing';
const MOCK_AVATARS = ['行内第一深情', '理性的终端机', '加班吃泡面', '打工人404'];
const MAX_WORKSPACE_ARTIFACTS = 4;
const MAX_WORKSPACE_DRAFTS = 5;
const TOOL_DATA_API_ROOT = (
  import.meta.env.VITE_API_BASE_URL ||
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : '')
).replace(/\/$/, '') + '/api/v1';

type RemoteArtifactRecord = {
  id: number;
  toolId: string;
  title: string;
  content: string;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
};

type RemoteDraftRecord = {
  id: number;
  toolId: string;
  title: string;
  data: Record<string, unknown> | unknown[];
  createdAt: string;
  updatedAt: string;
};

type ToolDataSource = 'cloud' | 'local' | 'mixed';
type ToolDataChannelSource = 'cloud' | 'local' | 'empty';

type ToolDataLoadResult = {
  artifacts: GeneratedArtifact[];
  drafts: DraftRecord[];
  source: ToolDataSource;
  artifactSource: ToolDataChannelSource;
  draftSource: ToolDataChannelSource;
  cloudRequestSucceeded: boolean;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function normalizeText(value: unknown, fallback: string) {
  const normalized = typeof value === 'string' ? value.trim() : '';
  return normalized || fallback;
}

function normalizeDate(value: unknown) {
  const parsed = new Date(typeof value === 'string' ? value : '');
  return Number.isNaN(parsed.getTime()) ? new Date(0) : parsed;
}

function normalizeDraftData(data: RemoteDraftRecord['data']): Record<string, any> {
  if (Array.isArray(data)) {
    return { items: data };
  }
  return isRecord(data) ? data : {};
}

function mapRemoteArtifact(item: unknown, index: number): GeneratedArtifact | null {
  if (!isRecord(item)) {
    return null;
  }

  return {
    id: typeof item.id === 'number' ? item.id : undefined,
    toolId: normalizeText(item.toolId, 'unknown-tool'),
    title: normalizeText(item.title, `未命名物料 ${index + 1}`),
    content: typeof item.content === 'string' ? item.content : '',
    metadata: isRecord(item.metadata) ? item.metadata : undefined,
    createdAt: normalizeDate(item.createdAt),
  };
}

function mapRemoteDraft(item: unknown, index: number): DraftRecord | null {
  if (!isRecord(item)) {
    return null;
  }

  return {
    id: typeof item.id === 'number' ? item.id : undefined,
    toolId: normalizeText(item.toolId, 'unknown-tool'),
    title: normalizeText(item.title, `未命名草稿 ${index + 1}`),
    data: normalizeDraftData(item.data as RemoteDraftRecord['data']),
    createdAt: normalizeDate(item.createdAt),
    updatedAt: normalizeDate(item.updatedAt),
  };
}

function getWorkspaceCloudToken() {
  const session = getAuthSession();
  if (!session || session.loginMethod === 'demo') {
    return null;
  }
  return session.accessToken;
}

function dedupeArtifacts(items: GeneratedArtifact[]) {
  const seen = new Set<string>();
  return items.filter((item, index) => {
    const key = [
      item.id ?? 'no-id',
      item.toolId,
      item.title,
      item.createdAt instanceof Date ? item.createdAt.getTime() : index,
    ].join('::');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function dedupeDrafts(items: DraftRecord[]) {
  const seen = new Set<string>();
  return items.filter((item, index) => {
    const key = [
      item.id ?? 'no-id',
      item.toolId,
      item.title,
      item.updatedAt instanceof Date ? item.updatedAt.getTime() : index,
    ].join('::');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function sortArtifacts(items: GeneratedArtifact[]) {
  return [...items].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

function sortDrafts(items: DraftRecord[]) {
  return [...items].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
}

function pickToolDataSource(
  cloudCount: number,
  localCount: number,
): ToolDataChannelSource {
  if (cloudCount > 0) return 'cloud';
  if (localCount > 0) return 'local';
  return 'empty';
}

function combineToolDataSource(
  artifactSource: ToolDataChannelSource,
  draftSource: ToolDataChannelSource,
  cloudRequestSucceeded: boolean,
): ToolDataSource {
  const nonEmptySources = new Set(
    [artifactSource, draftSource].filter((item) => item !== 'empty'),
  );

  if (nonEmptySources.size === 0) return cloudRequestSucceeded ? 'cloud' : 'local';
  if (nonEmptySources.size === 1) {
    return nonEmptySources.has('cloud') ? 'cloud' : 'local';
  }
  return 'mixed';
}

async function requestToolData<T>(path: string, token: string): Promise<T> {
  const response = await fetch(`${TOOL_DATA_API_ROOT}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`tool-data request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

async function loadLocalWorkspaceToolData(): Promise<ToolDataLoadResult> {
  const [localArtifacts, localDrafts] = await Promise.all([
    db.artifacts.orderBy('createdAt').reverse().limit(MAX_WORKSPACE_ARTIFACTS).toArray(),
    db.drafts.orderBy('updatedAt').reverse().limit(MAX_WORKSPACE_DRAFTS).toArray(),
  ]);
  const dedupedLocalArtifacts = sortArtifacts(dedupeArtifacts(localArtifacts)).slice(0, MAX_WORKSPACE_ARTIFACTS);
  const dedupedLocalDrafts = sortDrafts(dedupeDrafts(localDrafts)).slice(0, MAX_WORKSPACE_DRAFTS);

  return {
    artifacts: dedupedLocalArtifacts,
    drafts: dedupedLocalDrafts,
    source: 'local',
    artifactSource: dedupedLocalArtifacts.length ? 'local' : 'empty',
    draftSource: dedupedLocalDrafts.length ? 'local' : 'empty',
    cloudRequestSucceeded: false,
  };
}

async function loadWorkspaceToolData(localData: ToolDataLoadResult): Promise<ToolDataLoadResult> {
  const token = getWorkspaceCloudToken();

  if (!token) {
    return localData;
  }

  try {
    const [cloudArtifacts, cloudDrafts] = await Promise.all([
      requestToolData<RemoteArtifactRecord[]>(`/artifacts/me?limit=${MAX_WORKSPACE_ARTIFACTS}`, token),
      requestToolData<RemoteDraftRecord[]>('/drafts/me', token),
    ]);
    const normalizedCloudArtifacts = Array.isArray(cloudArtifacts)
      ? sortArtifacts(dedupeArtifacts(
          cloudArtifacts
            .map((item, index) => mapRemoteArtifact(item, index))
            .filter((item): item is GeneratedArtifact => item !== null),
        )).slice(0, MAX_WORKSPACE_ARTIFACTS)
      : [];
    const normalizedCloudDrafts = Array.isArray(cloudDrafts)
      ? sortDrafts(dedupeDrafts(
          cloudDrafts
            .map((item, index) => mapRemoteDraft(item, index))
            .filter((item): item is DraftRecord => item !== null),
        )).slice(0, MAX_WORKSPACE_DRAFTS)
      : [];
    const artifactSource = pickToolDataSource(
      normalizedCloudArtifacts.length,
      localData.artifacts.length,
    );
    const draftSource = pickToolDataSource(
      normalizedCloudDrafts.length,
      localData.drafts.length,
    );

    return {
      artifacts: normalizedCloudArtifacts.length ? normalizedCloudArtifacts : localData.artifacts,
      drafts: normalizedCloudDrafts.length ? normalizedCloudDrafts : localData.drafts,
      source: combineToolDataSource(artifactSource, draftSource, true),
      artifactSource,
      draftSource,
      cloudRequestSucceeded: true,
    };
  } catch {
    return localData;
  }
}

const WorkspacePage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { customer, setCustomer, clearCustomer, hasCustomer } = useCustomer();
  const [boards, setBoards] = useState<ForumBoard[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [officialPosts, setOfficialPosts] = useState<Post[]>([]);
  const [recentArtifacts, setRecentArtifacts] = useState<GeneratedArtifact[]>([]);
  const [recentDrafts, setRecentDrafts] = useState<DraftRecord[]>([]);
  const [toolDataSource, setToolDataSource] = useState<ToolDataSource>('local');
  const [artifactSource, setArtifactSource] = useState<ToolDataChannelSource>('empty');
  const [draftSource, setDraftSource] = useState<ToolDataChannelSource>('empty');
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
    () => boards.filter((item) => !item.isOfficial && item.slug !== 'pantry'),
    [boards],
  );

  const workspacePosts = useMemo(
    () => posts.filter((post) => post.board?.slug !== 'pantry'),
    [posts],
  );

  const applyToolData = (toolData: ToolDataLoadResult) => {
    setRecentArtifacts(toolData.artifacts);
    setRecentDrafts(toolData.drafts);
    setToolDataSource(toolData.source);
    setArtifactSource(toolData.artifactSource);
    setDraftSource(toolData.draftSource);
  };

  const loadCommunity = async () => {
    setLoading(true);
    try {
      const [boardList, postList, officialList] = await Promise.all([
        forumApi.getBoards(),
        forumApi.getPosts({
          boardSlug: activeBoard === 'all' ? undefined : activeBoard,
          pageSize: 20,
        }),
        forumApi.getOfficialPosts({
          pageSize: 4,
        }),
      ]);

      setBoards(boardList);
      setPosts(postList.items);
      setOfficialPosts(officialList.items);

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
    void loadCommunity();
  }, [activeBoard]);

  useEffect(() => {
    let cancelled = false;

    const loadToolData = async () => {
      const localData = await loadLocalWorkspaceToolData();
      if (cancelled) return;
      applyToolData(localData);

      const mergedData = await loadWorkspaceToolData(localData);
      if (cancelled) return;
      applyToolData(mergedData);
    };

    void loadToolData();

    return () => {
      cancelled = true;
    };
  }, []);

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

  const getToolPath = (toolId: string) => TOOL_META[toolId]?.path ?? null;

  const handleAuthorClick = (e: React.MouseEvent, nickname: string, isAnon: boolean) => {
    e.preventDefault();
    setSelectedAuthor({ nickname, isAnon });
    setShowQr(false);
  }

  const toolDataStatusLabel = useMemo(() => {
    if (toolDataSource === 'cloud') return '云端同步';
    if (toolDataSource === 'mixed') return '云地混合';
    return '本地保底';
  }, [toolDataSource]);

  const toolDataStatusHint = useMemo(() => {
    if (artifactSource === 'local' || draftSource === 'local') {
      return '云端为空或不可用时，当前列表已回退到本地暂存。';
    }
    if (artifactSource === 'empty' && draftSource === 'empty') {
      return '当前没有可展示的草稿或物料。';
    }
    return '当前展示优先读取云端草稿与物料。';
  }, [artifactSource, draftSource]);

  return (
    <AppLayout title="工作台" theme="default">
      <div className="min-h-[100dvh] bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.06),transparent_32%),linear-gradient(180deg,#ffffff_0%,#f5f6fa_100%)] pb-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:gap-6 px-4 py-5 sm:px-6 sm:py-8">
        <section className="flex flex-col gap-4 pb-1">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex-grow pl-1">
              <p className="text-[11px] font-black tracking-[0.18em] uppercase text-neutral-400">APEX Workspace</p>
              <h1 className="mt-2 text-3xl sm:text-5xl font-black text-[#111827] tracking-tight">工作台</h1>
              <p className="mt-2 max-w-2xl text-[13px] sm:text-sm leading-relaxed text-neutral-500 font-medium">
                把近期物料、草稿、客户上下文和高频工具放在一个安静的工作面板里。茶水间作为社区里的独立空间进入。
              </p>
            </div>
            
            <div className="flex gap-2">
              <Link
                to="/instructions"
                className="flex-1 sm:flex-none flex justify-center items-center gap-1.5 rounded-2xl bg-white border border-neutral-200/80 px-4 py-3 min-h-[44px] text-[13px] font-bold text-neutral-600 hover:bg-neutral-50 shadow-sm transition-all active:scale-95"
              >
                <FileText size={14} />
                官方帮助
              </Link>
              <button
                onClick={() => setComposing((current) => !current)}
                className="flex-[2] sm:flex-none flex justify-center items-center gap-1.5 rounded-2xl bg-brand-dark px-5 py-3 min-h-[44px] text-[14px] font-bold text-white hover:bg-brand-dark/90 shadow-[0_10px_24px_rgba(15,23,42,0.16)] transition-all active:scale-95"
              >
                <Plus size={16} />
                我要发帖
              </button>
            </div>
          </div>
        </section>

        {/* Mobile Tab Switcher */}
        <div className="flex gap-1 mb-2 bg-white/80 border border-neutral-200 rounded-2xl p-1 sm:hidden shadow-sm">
          <button onClick={() => setMobileTab('posts')}
            className={`flex-1 py-2 rounded-xl text-[13px] font-bold transition-all ${mobileTab === 'posts' ? 'bg-brand-dark text-white shadow-sm' : 'text-neutral-500'}`}>
            动态
          </button>
          <button onClick={() => setMobileTab('tools')}
            className={`flex-1 py-2 rounded-xl text-[13px] font-bold transition-all ${mobileTab === 'tools' ? 'bg-brand-dark text-white shadow-sm' : 'text-neutral-500'}`}>
            面板
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
              <section className="rounded-[24px] bg-white/95 p-4 sm:p-5 border border-white shadow-[0_18px_60px_rgba(15,23,42,0.08)] animate-slide-in-down overflow-hidden relative">
                
                <form className="grid gap-2 relative z-10" onSubmit={handleCreatePost}>
                  <div className="flex items-center justify-between mb-1 pb-2 border-b border-neutral-100/60">
                     <h3 className="font-black text-neutral-900 flex items-center gap-1.5"><MessageSquare size={16}/> 撰写新帖子</h3>
                     <button
                       type="button" 
                       onClick={() => setIsAnonymous(!isAnonymous)}
                       className={cn(
                          "px-3 py-1.5 rounded-full text-[11px] font-bold border transition-colors flex items-center gap-1",
                          isAnonymous ? "bg-neutral-900 text-white border-neutral-900" : "bg-neutral-100 text-neutral-500 border-transparent"
                       )}
                     >
                       <Ghost size={12} /> {isAnonymous ? "匿名已开" : "实名模式"}
                     </button>
                  </div>

                  {isAnonymous && (
                    <div className="flex items-center gap-2 mb-2 p-2.5 bg-neutral-100 rounded-xl text-neutral-600 text-[11px] font-medium">
                      <span>当前马甲：</span>
                      <span className="text-neutral-900 font-bold">{anonName}</span>
                      <button type="button" onClick={rollDice} className="ml-auto flex items-center gap-1 hover:text-neutral-900 transition-colors bg-white px-2 py-1 rounded-md active:scale-95 text-[10px]">
                        <Dices size={10} /> 摇骰子换名
                      </button>
                    </div>
                  )}

                  <div className="grid gap-2 md:grid-cols-[140px_1fr] border-b border-neutral-100/60 pb-1">
                    <select
                      value={form.boardSlug}
                      onChange={(event) => setForm((current) => ({ ...current, boardSlug: event.target.value }))}
                      className="bg-transparent px-1 py-1.5 text-sm outline-none text-neutral-600 font-medium focus:text-blue-600"
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
                      className="bg-transparent px-1 py-1.5 text-base outline-none text-neutral-800 font-bold placeholder:text-neutral-300 placeholder:font-normal"
                      placeholder="标题概括核心点"
                      required
                    />
                  </div>
                  <textarea
                    value={form.content}
                    onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))}
                    className="min-h-[160px] resize-none bg-transparent px-1 py-2 text-[15px] leading-8 outline-none text-neutral-700 placeholder:text-neutral-300 mt-1"
                    placeholder="详细说明背景、做法与结论。越真实的细节，越能帮到其他同事..."
                    required
                  />
                  <div className="border-t border-neutral-100/60 pt-2 flex items-center">
                    <span className="text-neutral-400 text-xs px-1">#</span>
                    <input
                      value={form.tags}
                      onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))}
                      className="flex-1 bg-transparent px-1 py-1.5 text-sm outline-none text-neutral-600 placeholder:text-neutral-300"
                      placeholder="附加标签 (二手, 求购物资)"
                    />
                  </div>
                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setComposing(false)}
                      className="px-5 py-2.5 rounded-xl text-sm font-bold text-neutral-500 hover:bg-neutral-100 transition-colors"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      className="rounded-xl bg-brand-dark px-6 py-2.5 text-sm font-bold text-white hover:bg-brand-dark/90 transition-colors shadow-md"
                    >
                      {isAnonymous ? '匿名发布' : '发布'}
                    </button>
                  </div>
                </form>
              </section>
            ) : null}

            {/* Board filter Pill Tabs */}
            <section className="py-1 sticky top-14 z-30">
              <div className="flex flex-wrap gap-2 rounded-2xl border border-white/80 bg-white/80 p-2 shadow-sm backdrop-blur">
                <button
                  onClick={() => setActiveBoard('all')}
                  className={cn(
                    "rounded-xl px-4 py-2 text-xs font-extrabold transition-all border",
                    activeBoard === 'all'
                      ? 'bg-brand-dark text-white border-brand-dark shadow-sm'
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
                      "rounded-xl px-4 py-2 text-xs font-bold transition-all border",
                      activeBoard === board.slug
                         ? 'bg-brand-dark text-white border-brand-dark shadow-sm'
                         : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
                    )}
                  >
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
              ) : workspacePosts.length ? (
                workspacePosts.map((post) => {
                  const isTradeItem = post.tags.some(t => ['二手','交换','出售','求购','置换'].includes(t));
                  const isHot = (post.commentCount || 0) > 5;
                  
                  return (
                    <article 
                      key={post.id} 
                      className={cn(
                        "rounded-[22px] p-4 sm:p-5 transition-all hover:-translate-y-0.5 active:scale-[0.99] relative overflow-hidden bg-white border border-white shadow-sm",
                        isHot ? "outline outline-1 outline-blue-500/10" : ""
                      )}
                    >
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
                          <span className="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                            {post.board.name}
                          </span>
                        ) : null}
                        
                        <button 
                           onClick={(e) => handleAuthorClick(e, post.author?.nickname || '隐藏信源', false)}
                           className="py-1.5 px-2 -ml-2 rounded-md flex items-center transition-all bg-transparent active:scale-95 text-blue-600 active:bg-blue-50"
                        >
                          <span className="opacity-50 mr-1">•</span> {post.author?.nickname || '隐藏信源'}
                        </button>
                      </div>

                      <Link to={getPostPath(post)} className="block relative z-10">
                        <h3 className={cn(
                          "text-[15px] font-bold leading-snug tracking-tight mb-2 break-words pr-2",
                          "text-neutral-900"
                        )}>
                          {post.title}
                        </h3>
                        <p className={cn(
                          "line-clamp-2 text-[14px] leading-relaxed break-words",
                          "text-neutral-500"
                        )}>
                          {post.summary || post.content}
                        </p>
                      </Link>

                      <div className="mt-3.5 flex flex-wrap items-center justify-between relative z-10">
                        <div className="flex gap-1.5">
                           {post.tags.slice(0, 3).map((tag) => (
                             <span key={tag} className={cn(
                               "rounded px-1.5 py-0.5 text-[10px] font-bold",
                               "bg-neutral-100 text-neutral-500"
                             )}>
                               #{tag}
                             </span>
                           ))}
                        </div>
                        <div className={cn(
                          "flex items-center gap-3 text-[11px] font-bold",
                          "text-neutral-400"
                        )}>
                           {isHot && <span className="text-blue-500">热帖</span>}
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
            <section className="rounded-[24px] border border-white bg-white/90 p-4 shadow-sm relative overflow-hidden">
               <div className="mb-3 flex items-center gap-1.5 text-[13px] font-extrabold text-neutral-900">
                <Sparkles size={14} className="text-brand-gold" />
                官方必读
              </div>
              <div className="grid gap-2">
                {officialPosts.map((post) => (
                  <Link key={post.id} to={getPostPath(post)} className="rounded-2xl bg-neutral-50 border border-neutral-100 p-3 transition-colors hover:bg-white flex flex-col gap-1">
                    <div className="text-[13px] font-bold text-neutral-800 tracking-tight leading-snug">{post.title}</div>
                  </Link>
                ))}
              </div>
            </section>

            {/* 高频小工作台 */}
            <section className="rounded-[24px] border border-white bg-white/90 p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-1.5 text-[13px] font-extrabold text-neutral-800">
                <Wrench size={14} className="text-neutral-500" />
                高频工具
              </div>
              <div className="grid grid-cols-2 gap-2">
                {quickTools.map((tool) => (
                  <Link
                    key={tool.id}
                    to={tool.path}
                    className="flex flex-col gap-1 rounded-2xl border border-neutral-100 bg-neutral-50 p-3 text-neutral-700 hover:bg-white hover:shadow-sm hover:border-neutral-200 transition-all active:scale-95 text-left"
                  >
                    <span className="text-[12px] font-bold line-clamp-1">{tool.name}</span>
                    <ArrowRight size={12} className="text-neutral-300 mt-auto ml-auto" />
                  </Link>
                ))}
              </div>
            </section>

            {/* Context & Artifacts */}
            <section className="rounded-[24px] border border-white bg-white/90 p-4 shadow-sm">
              <div className="flex flex-col gap-4">
                 <div>
                    <div className="mb-2 flex items-center justify-between text-[13px] font-extrabold text-neutral-800">
                      <span>工作上下文</span>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          'text-[10px] font-bold',
                          toolDataSource === 'cloud'
                            ? 'text-emerald-600'
                            : toolDataSource === 'mixed'
                              ? 'text-sky-600'
                              : 'text-neutral-400'
                        )}>
                          {toolDataStatusLabel}
                        </span>
                      {hasCustomer && (
                         <button type="button" onClick={clearCustomer} className="text-[11px] text-neutral-400 hover:text-red-500">清除暂存</button>
                      )}
                      </div>
                    </div>
                    <div className="mb-2 text-[10px] text-neutral-400">
                      {toolDataStatusHint}
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
                      <span className="text-[10px] font-medium text-neutral-400">
                        {artifactSource === 'cloud' ? '云端' : artifactSource === 'local' ? '本地' : '空'}
                      </span>
                    </div>
                    {recentArtifacts.length ? (
                      <div className="flex flex-col gap-2">
                        {recentArtifacts.map((item, index) => {
                          const path = getToolPath(item.toolId);
                          const key = `${item.toolId}-${item.id ?? 'local'}-${item.createdAt.getTime()}-${index}`;
                          const className = 'text-xs font-bold text-neutral-600 truncate border-l-2 border-neutral-200 pl-2 py-0.5 hover:text-blue-600 transition-colors';

                          return path ? (
                            <Link key={key} to={path} className={className}>
                              {item.title}
                            </Link>
                          ) : (
                            <div key={key} className={className}>
                              {item.title}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                       <div className="text-xs font-medium text-neutral-400">无最新生成的文件物料。</div>
                    )}
                 </div>

                 <div className="border-t border-dashed border-neutral-200 pt-3">
                    <div className="mb-2 flex items-center gap-1.5 text-[13px] font-extrabold text-neutral-800">
                      <FileText size={12} className="text-neutral-400" />
                      暂存草稿
                      <span className="text-[10px] font-medium text-neutral-400">
                        {draftSource === 'cloud' ? '云端' : draftSource === 'local' ? '本地' : '空'}
                      </span>
                    </div>
                    {recentDrafts.length ? (
                      <div className="flex flex-col gap-2">
                        {recentDrafts.map((item, index) => {
                          const path = getToolPath(item.toolId);
                          const key = `${item.toolId}-${item.id ?? 'local'}-${item.updatedAt.getTime()}-${index}`;
                          const className = 'text-xs font-bold text-neutral-600 truncate border-l-2 border-blue-200 pl-2 py-0.5 hover:text-blue-600 transition-colors';

                          return path ? (
                            <Link key={key} to={path} className={className}>
                              {item.title}
                            </Link>
                          ) : (
                            <div key={key} className={className}>
                              {item.title}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                       <div className="text-xs font-medium text-neutral-400">无可用草稿，云端与本地都没有可展示数据。</div>
                    )}
                 </div>
              </div>
            </section>

          </div>
        </div>
      </div>
      </div>

      {/* Author Drawer */}
      {selectedAuthor && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedAuthor(null)} />
           <div className={cn(
             "relative w-full max-w-6xl mx-auto rounded-t-[32px] p-6 pb-[max(1rem,env(safe-area-inset-bottom))] animate-slide-in-down border-t",
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
