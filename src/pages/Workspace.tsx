import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  FileText,
  MessageSquare,
  Pin,
  Plus,
  Sparkles,
  Wrench,
  Ghost,
  Coffee,
  HeartHandshake,
  User,
  X,
  QrCode,
  Search,
  RefreshCw,
  Trash2,
  Clock,
  Edit3,
} from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import { cn } from '../../lib/utils';
import { db, type DraftRecord, type GeneratedArtifact } from '../../lib/localDB';
import { useCustomer } from '../../lib/CustomerContext';
import { forumApi } from '../services/forumApi';
import { getAuthSession } from '../services/authService';
import type { ForumBoard, Post } from '../types';
import { useToast } from '../components/common/Toast';

const TOOL_META: Record<string, { name: string; short: string; path: string }> = {
  'under-invoice-workflow': { name: '项下开票超级智能贴', short: '银承+存单质押从测算、预约、柜台到质押登记一条龙。', path: '/under-invoice-workflow' },
  'sensitive-comm': { name: '收费、暂缓这种话先别硬发', short: '把容易炸的对客消息收成能发出去的话。', path: '/sensitive-comm' },
  'rate-offer': { name: '利率优惠别再从零写', short: '把申请理由、口径和边界先搭好。', path: '/rate-offer' },
  'acceptance-calc': { name: '银承/存单收益先算明白', short: '别靠脑补估收益，先把账摊开。', path: '/acceptance-calculator' },
  'material-checklist': { name: '客户要“一次性材料”就发这个', short: '常见材料清单直接收好，不用现拼。', path: '/material-checklist' },
  'news-assistant': { name: 'AI 写完了，顺手排成能交的稿', short: '把零散内容收成能发、能交、能存的版式。', path: '/news-assistant' },
  'business-guide': { name: '见客户前，先把打法过一遍', short: '产品、场景、行业先有个顺手入口。', path: '/business-guide' },
  'to-myself-focus-timer': { name: '开一段不被打断的时间', short: '先把手头这件事做完。', path: '/scenarios' },
};

type WorkspaceGuidePost = {
  id: string;
  title: string;
  intro: string;
  problem: string;
  path: string;
  tags: string[];
};

const WORKSPACE_GUIDE_POSTS: WorkspaceGuidePost[] = [
  {
    id: 'under-invoice-workflow',
    title: '置顶超级智能贴：项下开票银承+存单质押全流程',
    intro: '从轻量测算、发票前置判断、预约邮件、利率流程、柜台提醒，到合同系统文字、中登网、入库和TXT/JSON下载，一层楼一层楼照着做。',
    problem: '解决项下开票流程长、字段前后不一致、邮件/OA/系统文字反复重写的问题。',
    path: '/under-invoice-workflow',
    tags: ['置顶', '超级智能贴', '项下开票'],
  },
  {
    id: 'sensitive-comm',
    title: '客户一问收费就炸？先把话术收住',
    intro: '最近又要通知收费、利率、暂缓，最难的不是政策，是怎么说不把客户点着。这个入口专门把这类消息写成能直接发的版本。',
    problem: '解决收费通知、利率调整、暂缓办理这类容易翻车的沟通。',
    path: '/sensitive-comm',
    tags: ['对客沟通', '省命话术'],
  },
  {
    id: 'material-checklist',
    title: '客户说“一次性把材料发我”，那就别再一条条敲了',
    intro: '常见材料已经按场景整理好，适合直接拿去发客户，也适合自己先核一遍有没有漏项。',
    problem: '解决材料反复补、客户来回问、自己临时拼清单的问题。',
    path: '/material-checklist',
    tags: ['材料清单', '少来回'],
  },
  {
    id: 'business-guide',
    title: '见客户前十分钟，先把打法过一遍',
    intro: '客户是什么行业、适合聊什么产品、第一句话怎么开，不用现场凭感觉翻。',
    problem: '解决拜访前没思路、产品话术散、需求摸排不成体系的问题。',
    path: '/business-guide',
    tags: ['拜访前', '产品打法'],
  },
  {
    id: 'news-assistant',
    title: 'AI 是写好了，但我真的懒得排版',
    intro: '内容有了，图片也有了，剩下最烦的是收成一篇能交出去的稿子。这个入口就是干这件事。',
    problem: '解决新闻稿、活动稿、汇报稿写完后不好看也不好交的问题。',
    path: '/news-assistant',
    tags: ['排版', '能交付'],
  },
  {
    id: 'rate-offer',
    title: '利率优惠别只说“帮忙申请一下”',
    intro: '优惠理由、业务贡献、审批边界都要讲清楚，不然来回改最耗时间。',
    problem: '解决利率优惠申请口径散、理由弱、签报难成稿的问题。',
    path: '/rate-offer',
    tags: ['签报', '利率'],
  },
  {
    id: 'acceptance-calc',
    title: '银承/存单别靠脑补算收益',
    intro: '客户问收益、成本、占用的时候，先把账算清楚，再决定怎么聊。',
    problem: '解决业务收益口径不清、现场估算不稳的问题。',
    path: '/acceptance-calculator',
    tags: ['测算', '先算账'],
  },
];

const DEFAULT_BOARD = 'experience-sharing';
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

// Fixed hash for author stats (replaces Math.random)
function hashNumber(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

// Relative time formatter
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return '刚刚';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}分钟前`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}小时前`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}天前`;
  return date.toLocaleDateString('zh-CN');
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

async function requestToolData<T>(path: string, token: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${TOOL_DATA_API_ROOT}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init.headers || {}),
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
  const [recentArtifacts, setRecentArtifacts] = useState<GeneratedArtifact[]>([]);
  const [recentDrafts, setRecentDrafts] = useState<DraftRecord[]>([]);
  const [artifactSource, setArtifactSource] = useState<ToolDataChannelSource>('empty');
  const [draftSource, setDraftSource] = useState<ToolDataChannelSource>('empty');
  const [loading, setLoading] = useState(true);
  const [composing, setComposing] = useState(false);
  const [activeBoard, setActiveBoard] = useState<string>('all');
  const [selectedAuthor, setSelectedAuthor] = useState<{nickname: string, isAnon: boolean} | null>(null);
  const [showQr, setShowQr] = useState(false);

  // Search & pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [postPage, setPostPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [postsLoading, setPostsLoading] = useState(false);

  // Delete state
  const [deletingArtifactId, setDeletingArtifactId] = useState<number | undefined>(undefined);
  const [deletingDraftId, setDeletingDraftId] = useState<number | undefined>(undefined);

  const [form, setForm] = useState({
    boardSlug: DEFAULT_BOARD,
    title: '',
    content: '',
    tags: '',
  });
  const [mobileTab, setMobileTab] = useState<'posts' | 'tools'>('posts');

  const quickTools = useMemo(
    () => ['under-invoice-workflow', 'sensitive-comm', 'rate-offer', 'acceptance-calc', 'material-checklist'].map((id) => ({ id, ...TOOL_META[id] })),
    [],
  );

  const displayBoards = useMemo(
    () => boards.filter((item) => !item.isOfficial && item.slug !== 'pantry'),
    [boards],
  );

  const workspacePosts = useMemo(() => {
    let filtered = posts.filter((post) => post.board?.slug !== 'pantry');
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(q) ||
        (p.content || '').toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return filtered;
  }, [posts, searchQuery]);

  const applyToolData = (toolData: ToolDataLoadResult) => {
    setRecentArtifacts(toolData.artifacts);
    setRecentDrafts(toolData.drafts);
    setArtifactSource(toolData.artifactSource);
    setDraftSource(toolData.draftSource);
  };

  const loadCommunity = async (loadPage = 1) => {
    if (loadPage === 1) setPostsLoading(true);
    try {
      const [boardList, postList] = await Promise.all([
        forumApi.getBoards(),
        forumApi.getPosts({
          boardSlug: activeBoard === 'all' ? undefined : activeBoard,
          pageSize: 20,
          page: loadPage,
        }),
      ]);

      setBoards(boardList);
      if (loadPage > 1) {
        setPosts(prev => {
          const existing = new Set(prev.map(p => p.id));
          const newPosts = postList.items.filter(p => !existing.has(p.id));
          return [...prev, ...newPosts];
        });
      } else {
        setPosts(postList.items);
      }
      setPostPage(loadPage);
      setHasMorePosts(postList.items.length >= 20);

      if (!boardList.find((item) => item.slug === form.boardSlug && !item.isOfficial)) {
        const fallbackBoard = boardList.find((item) => !item.isOfficial)?.slug || DEFAULT_BOARD;
        setForm((current) => ({ ...current, boardSlug: fallbackBoard }));
      }
      return true;
    } catch (error) {
      console.error('Failed to load workspace community', error);
      return false;
    } finally {
      if (loadPage === 1) setPostsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const [communityLoaded] = await Promise.all([
        loadCommunity(1),
        (async () => {
          const localData = await loadLocalWorkspaceToolData();
          const mergedData = await loadWorkspaceToolData(localData);
          applyToolData(mergedData);
        })(),
      ]);
      if (communityLoaded) toast.success('已刷新');
      else toast.warning('本地工作数据已刷新，社区服务暂不可用');
    } catch {
      toast.error('刷新失败，请稍后重试');
    } finally {
      setIsRefreshing(false);
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

  const handleDeleteArtifact = async (id: number) => {
    setDeletingArtifactId(id);
    try {
      if (artifactSource === 'cloud') {
        const token = getWorkspaceCloudToken();
        if (!token) throw new Error('登录已失效');
        await requestToolData(`/artifacts/${id}`, token, { method: 'DELETE' });
      } else {
        await db.artifacts.delete(id);
      }
      setRecentArtifacts(prev => prev.filter(a => a.id !== id));
      toast.success('已删除');
    } catch {
      toast.error('删除失败');
    } finally {
      setDeletingArtifactId(undefined);
    }
  };

  const handleDeleteDraft = async (id: number) => {
    setDeletingDraftId(id);
    try {
      if (draftSource === 'cloud') {
        const token = getWorkspaceCloudToken();
        if (!token) throw new Error('登录已失效');
        await requestToolData(`/drafts/${id}`, token, { method: 'DELETE' });
      } else {
        await db.drafts.delete(id);
      }
      setRecentDrafts(prev => prev.filter(d => d.id !== id));
      toast.success('已删除');
    } catch {
      toast.error('删除失败');
    } finally {
      setDeletingDraftId(undefined);
    }
  };

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
                经验流负责沉淀真实打法，流程台负责把 Skills 编排成可执行任务；草稿、产物和客户案头都从这里续上。
              </p>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex justify-center items-center gap-1.5 rounded-2xl bg-white border border-neutral-200 px-4 py-3 min-h-[44px] text-[14px] font-bold text-neutral-600 hover:bg-neutral-50 shadow-sm transition-all active:scale-95 disabled:opacity-50"
              >
                <RefreshCw size={16} className={cn(isRefreshing && 'animate-spin')} />
                刷新
              </button>
              <button
                onClick={() => setComposing((current) => !current)}
                className="flex-[2] sm:flex-none flex justify-center items-center gap-1.5 rounded-2xl bg-brand-dark px-5 py-3 min-h-[44px] text-[14px] font-bold text-white hover:bg-brand-dark/90 shadow-[0_10px_24px_rgba(15,23,42,0.16)] transition-all active:scale-95"
              >
                <Plus size={16} />
                沉淀一条经验
              </button>
            </div>
          </div>
        </section>

        {/* Mobile Tab Switcher */}
        <div className="flex gap-1 mb-2 bg-white/80 border border-neutral-200 rounded-2xl p-1 sm:hidden shadow-sm">
          <button onClick={() => setMobileTab('posts')}
            className={`flex-1 py-2 rounded-xl text-[13px] font-bold transition-all ${mobileTab === 'posts' ? 'bg-brand-dark text-white shadow-sm' : 'text-neutral-500'}`}>
            经验流
          </button>
          <button onClick={() => setMobileTab('tools')}
            className={`flex-1 py-2 rounded-xl text-[13px] font-bold transition-all ${mobileTab === 'tools' ? 'bg-brand-dark text-white shadow-sm' : 'text-neutral-500'}`}>
            流程台
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
                     <h3 className="font-black text-neutral-900 flex items-center gap-1.5"><MessageSquare size={16}/> 写一条经验</h3>
                     <Link
                       to="/bbs/pantry"
                       className="px-3 py-1.5 rounded-full text-[11px] font-bold border border-transparent bg-neutral-100 text-neutral-500 transition-colors flex items-center gap-1 hover:text-neutral-900"
                     >
                       <Ghost size={12} /> 匿名去茶水间
                     </Link>
                  </div>

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
                      placeholder="一句话说清楚这帖值在哪"
                      required
                    />
                  </div>
                  <textarea
                    value={form.content}
                    onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))}
                    className="min-h-[160px] resize-none bg-transparent px-1 py-2 text-[15px] leading-8 outline-none text-neutral-700 placeholder:text-neutral-300 mt-1"
                    placeholder="把场景、坑点、你怎么处理写清楚就行。越像真实经历，后来人越能用上..."
                    required
                  />
                  <div className="border-t border-neutral-100/60 pt-2 flex items-center">
                    <span className="text-neutral-400 text-xs px-1">#</span>
                    <input
                      value={form.tags}
                      onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))}
                      className="flex-1 bg-transparent px-1 py-1.5 text-sm outline-none text-neutral-600 placeholder:text-neutral-300"
                      placeholder="附加标签，比如收费、材料、排版"
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
                      发出去
                    </button>
                  </div>
                </form>
              </section>
            ) : null}

            {/* Unified Toolbar: Search + Board Filter */}
            <div className="rounded-[20px] bg-white/90 border border-white shadow-sm p-3 flex flex-col gap-2 sticky top-14 z-30 backdrop-blur">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="搜索帖子标题、内容或标签..."
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-9 pr-4 py-2.5 text-[13px] font-medium outline-none focus:border-blue-500/50 focus:bg-white transition-all placeholder:text-neutral-300"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                    <X size={14} />
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setActiveBoard('all')}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-[11px] font-extrabold transition-all border",
                    activeBoard === 'all'
                      ? 'bg-brand-dark text-white border-brand-dark shadow-sm'
                      : 'bg-transparent text-neutral-500 border-neutral-200 hover:bg-neutral-100'
                  )}
                >
                  全部
                </button>
                {displayBoards.map((board) => (
                  <button
                    key={board.slug}
                    onClick={() => setActiveBoard(board.slug)}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-[11px] font-bold transition-all border",
                      activeBoard === board.slug
                         ? 'bg-brand-dark text-white border-brand-dark shadow-sm'
                         : 'bg-transparent text-neutral-500 border-neutral-200 hover:bg-neutral-100'
                    )}
                  >
                    {board.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Posts List */}
            <div className="grid gap-3">
              {postsLoading ? (
                <div className="rounded-[20px] p-8 text-center text-sm font-bold text-neutral-400">
                  正在把帖子捞出来...
                </div>
              ) : workspacePosts.length ? (
                <>
                  {searchQuery && (
                    <p className="text-[11px] font-bold text-neutral-400 px-1">
                      找到 {workspacePosts.length} 条结果
                    </p>
                  )}
                  {workspacePosts.map((post) => {
                    const postDate = post.createdAt ? new Date(post.createdAt) : null;
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
                        <div className="flex gap-1.5 flex-wrap items-center">
                           {post.tags.slice(0, 3).map((tag) => (
                             <span key={tag} className={cn(
                               "rounded px-1.5 py-0.5 text-[10px] font-bold",
                               "bg-neutral-100 text-neutral-500"
                             )}>
                               #{tag}
                             </span>
                           ))}
                           {postDate && (
                             <span className="flex items-center gap-1 text-[10px] font-bold text-neutral-400">
                               <Clock size={10} /> {formatRelativeTime(postDate)}
                             </span>
                           )}
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
                })}

                    {/* Load More */}
                  {hasMorePosts && !searchQuery && (
                    <button
                      onClick={() => void loadCommunity(postPage + 1)}
                      className="py-3 rounded-2xl text-[13px] font-bold text-neutral-500 border border-neutral-200 bg-white hover:bg-neutral-50 transition-all active:scale-95 shadow-sm"
                    >
                      加载更多帖子
                    </button>
                  )}
                </>
              ) : (
                <div className="rounded-[20px] border border-dashed border-neutral-200 bg-white p-10 text-center text-sm font-bold text-neutral-400 shadow-sm">
                  {searchQuery ? '没有找到匹配的帖子' : '这里还没人开帖。把你刚踩过的坑写下来，后来人会感谢你。'}
                </div>
              )}
            </div>
          </div>

          {/* Right/Bottom Auxiliary Panel */}
          <div className={cn(
            "flex flex-col gap-4",
            mobileTab === 'posts' ? "hidden sm:flex" : "flex",
          )}>

            {/* Navigation: Guide Posts + Quick Entries */}
            <section className="rounded-[24px] border border-white bg-white/90 p-4 shadow-sm relative overflow-hidden">
              <div className="mb-3 flex items-center gap-1.5 text-[13px] font-extrabold text-neutral-900">
                <Sparkles size={14} className="text-brand-gold" />
                工作流导航
              </div>

              {/* Guide Posts */}
              <div className="grid gap-2 mb-3">
                {WORKSPACE_GUIDE_POSTS.map((post) => (
                  <Link
                    key={post.id}
                    to={post.path}
                    className={cn(
                      'group rounded-2xl border p-3 transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-sm flex flex-col gap-2',
                      post.id === 'under-invoice-workflow'
                        ? 'border-amber-200 bg-amber-50 ring-2 ring-amber-100'
                        : 'border-neutral-100 bg-neutral-50'
                    )}
                  >
                    <div className="flex flex-wrap gap-1">
                      {post.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-neutral-400 ring-1 ring-neutral-100">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="text-[13px] font-extrabold text-neutral-900 tracking-tight leading-snug">{post.title}</div>
                    <p className="text-[12px] leading-relaxed text-neutral-500 line-clamp-2">{post.intro}</p>
                  </Link>
                ))}
              </div>

              {/* Quick Entries */}
              <div className="pt-3 border-t border-dashed border-neutral-200">
                <div className="mb-2 flex items-center gap-1.5 text-[12px] font-extrabold text-neutral-700">
                  <Wrench size={12} className="text-neutral-400" />
                  马上开干
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {quickTools.map((tool) => (
                    <Link
                      key={tool.id}
                      to={tool.path}
                      className="flex flex-col gap-0.5 rounded-xl border border-neutral-100 bg-neutral-50 p-2.5 text-neutral-700 hover:bg-white hover:shadow-sm hover:border-neutral-200 transition-all active:scale-95 text-left"
                    >
                      <span className="text-[11px] font-extrabold leading-snug line-clamp-2">{tool.name}</span>
                      <span className="text-[10px] text-neutral-400 leading-relaxed line-clamp-2">{tool.short}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </section>

            {/* Workbench: Customer + Artifacts + Drafts */}
            <section className="rounded-[24px] border border-white bg-white/90 p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-1.5 text-[13px] font-extrabold text-neutral-900">
                <Briefcase size={14} className="text-blue-500" />
                案头这一摊
              </div>

              {/* Customer */}
              {hasCustomer ? (
                <div className="mb-3 bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-center gap-2">
                  <span className="text-sm font-extrabold text-blue-900 flex-1">{customer.name}</span>
                  <button type="button" onClick={clearCustomer} className="text-[11px] text-neutral-400 hover:text-red-500 shrink-0">清除</button>
                </div>
              ) : (
                <input
                  placeholder="输入客户名后回车..."
                  className="mb-3 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs font-bold outline-none focus:border-blue-500"
                  onKeyDown={(event) => {
                    const value = (event.target as HTMLInputElement).value.trim();
                    if (event.key === 'Enter' && value) {
                      setCustomer({ name: value });
                      (event.target as HTMLInputElement).value = '';
                    }
                  }}
                />
              )}

              {/* Artifacts + Drafts in a 2-col grid */}
              <div className="grid grid-cols-2 gap-3">
                {/* Artifacts */}
                <div>
                  <div className="mb-1.5 flex items-center gap-1 text-[11px] font-extrabold text-neutral-700">
                    <FileText size={11} className="text-neutral-400" />
                    产出的文件
                    <span className={cn(
                      'ml-auto text-[10px] font-bold',
                      artifactSource === 'cloud' ? 'text-emerald-600' : 'text-neutral-300'
                    )}>
                      {artifactSource === 'cloud' ? '云' : artifactSource === 'local' ? '本' : '-'}
                    </span>
                  </div>
                  {recentArtifacts.length ? (
                    <div className="flex flex-col gap-1.5">
                      {recentArtifacts.map((item, index) => {
                        const path = getToolPath(item.toolId);
                        const key = `${item.toolId}-${item.id ?? 'local'}-${item.createdAt.getTime()}-${index}`;
                        const isDeleting = deletingArtifactId === item.id;
                        return (
                          <div key={key} className="group flex items-center gap-0.5">
                            {path ? (
                              <Link to={path} className="flex-1 text-[11px] font-bold text-neutral-600 truncate hover:text-blue-600 transition-colors">
                                {item.title}
                              </Link>
                            ) : (
                              <div className="flex-1 text-[11px] font-bold text-neutral-600 truncate">
                                {item.title}
                              </div>
                            )}
                            <button
                              onClick={() => item.id && handleDeleteArtifact(item.id)}
                              disabled={isDeleting}
                              className="shrink-0 p-0.5 rounded text-neutral-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50"
                              title="删除"
                            >
                              <Trash2 size={10} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-[11px] font-medium text-neutral-300">暂无产出</div>
                  )}
                </div>

                {/* Drafts */}
                <div>
                  <div className="mb-1.5 flex items-center gap-1 text-[11px] font-extrabold text-neutral-700">
                    <Edit3 size={11} className="text-blue-300" />
                    草稿
                    <span className={cn(
                      'ml-auto text-[10px] font-bold',
                      draftSource === 'cloud' ? 'text-emerald-600' : 'text-neutral-300'
                    )}>
                      {draftSource === 'cloud' ? '云' : draftSource === 'local' ? '本' : '-'}
                    </span>
                  </div>
                  {recentDrafts.length ? (
                    <div className="flex flex-col gap-1.5">
                      {recentDrafts.map((item, index) => {
                        const path = getToolPath(item.toolId);
                        const key = `${item.toolId}-${item.id ?? 'local'}-${item.updatedAt.getTime()}-${index}`;
                        const isDeleting = deletingDraftId === item.id;
                        return (
                          <div key={key} className="group flex items-center gap-0.5">
                            {path ? (
                              <Link to={path} className="flex-1 text-[11px] font-bold text-neutral-600 truncate hover:text-blue-600 transition-colors">
                                {item.title}
                              </Link>
                            ) : (
                              <div className="flex-1 text-[11px] font-bold text-neutral-600 truncate">
                                {item.title}
                              </div>
                            )}
                            <button
                              onClick={() => item.id && handleDeleteDraft(item.id)}
                              disabled={isDeleting}
                              className="shrink-0 p-0.5 rounded text-neutral-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50"
                              title="删除"
                            >
                              <Trash2 size={10} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-[11px] font-medium text-neutral-300">暂无草稿</div>
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
                    累计精华贡献：{(hashNumber(selectedAuthor.nickname) % 20) + 1} 篇
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
                         <p className="text-xs text-neutral-500 font-bold mb-1">长按识别打赏码</p>
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
