/**
 * 社区数据层 — 现已迁移为联调云端(后端) API。
 * 本文件作为 Adapter, 尽力保留原来的方法签名和返回结构，以使组件无感迁移。
 */

// ─── 类型 ──────────────────────────────────────

export const COMMUNITY_CHANNELS = [
  '经验分享',
  '系统操作',
  '合规探讨',
  '匿名吐槽',
  'Gossip 贴板',
  '二手交易',
  '专题',
] as const;

export type CommunityChannel = (typeof COMMUNITY_CHANNELS)[number];

export type CommunityKind = 'thread' | 'dark' | 'gossip' | 'topic';

export interface CommunityEntry {
  uid: string;
  title: string;
  content: string;
  channel: CommunityChannel;
  author: string;
  anonymous: boolean;
  kind: CommunityKind;
  likes: number;
  replyCount: number;
  expiresAt?: Date;
  source?: string;
  createdAt: Date;
}

export interface CommunityReply {
  uid: string;
  threadId: string;
  content: string;
  author: string;
  anonymous: boolean;
  createdAt: Date;
}

// ─── API 适配器配置 ─────────────────────────────

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

async function authFetch(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('fwe_jwt_token'); // 假设后续对接认证存入此处
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE_URL}${url}`, { ...options, headers });
  if (!res.ok) {
    throw new Error(`API error: ${res.statusText}`);
  }
  return res.json();
}

/**
 * 将后端返回的 Post 结构适度兼容转化为前端原来依赖的 CommunityEntry
 */
function mapPostToEntry(post: any): CommunityEntry {
  const isGossip = post.category === 'Gossip 贴板';
  const isDark = post.category === '匿名吐槽' || post.category === '二手交易';
  const isTopic = post.postType === 'GUIDE';

  let kind: CommunityKind = 'thread';
  if (isTopic) kind = 'topic';
  else if (isGossip) kind = 'gossip';
  else if (isDark) kind = 'dark';

  return {
    uid: post.id.toString(),
    title: post.title || '',
    content: post.content || post.summary || '',
    channel: (post.board?.name || post.category || '经验分享') as CommunityChannel,
    author: post.author?.nickname || '匿名用户',
    anonymous: isGossip || isDark,
    kind,
    likes: 0, // 暂时 mock
    replyCount: post._count?.comments || 0,
    createdAt: new Date(post.createdAt),
    expiresAt: isGossip || isDark ? new Date(new Date(post.createdAt).getTime() + 24 * 3600_000) : undefined,
  };
}

// ─── 查询方法 ──────────────────────────────────

export async function getCommunitySummary() {
  // 通过 public forum api 获取列表，然后进行前端聚合。
  // 在真正生产级，这应该由后端出专门的 Summary API。这里为了无缝兼容旧 UI 先适配：
  const res = await authFetch('/forum/public/posts?pageSize=50');
  const items: any[] = res.items || [];
  
  const allThreads = items.map(mapPostToEntry);
  const now = new Date();

  const active = allThreads.filter(
    (t) => !t.expiresAt || t.expiresAt.getTime() > now.getTime(),
  );

  const totalThreads = active.length;
  const totalTopics = active.filter((t) => t.kind === 'topic').length;
  const totalGossip = active.filter((t) => t.kind === 'gossip').length;
  const totalReplies = active.reduce((acc, t) => acc + (t.replyCount || 0), 0);

  const hotThreads = [...active].sort((a, b) => b.replyCount - a.replyCount).slice(0, 5);
  const latestGossip = active
    .filter((t) => t.kind === 'gossip')
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);
  const topics = active
    .filter((t) => t.kind === 'topic')
    .sort((a, b) => b.replyCount - a.replyCount)
    .slice(0, 5);
  const expiringThreads = active
    .filter((t) => t.expiresAt)
    .sort((a, b) => a.expiresAt!.getTime() - b.expiresAt!.getTime())
    .slice(0, 5);

  return {
    totalThreads,
    totalTopics,
    totalGossip,
    totalReplies,
    hotThreads,
    latestGossip,
    topics,
    expiringThreads,
  };
}

export async function listCommunityEntries(
  channel?: CommunityChannel | '全部',
): Promise<CommunityEntry[]> {
  const url = (!channel || channel === '全部') 
    ? '/forum/public/posts?pageSize=100' 
    : `/forum/public/posts?boardSlug=TODO_SLUGIFY_${channel}`;
  
  const res = await authFetch(url);
  const items: any[] = res.items || [];
  return items.map(mapPostToEntry);
}

export async function getCommunityThread(uid: string) {
  const res = await authFetch(`/forum/public/posts/${uid}`);
  const post = res; // Assuming res is the mapped post detail
  
  // also fetch comments
  const commentsRes = await authFetch(`/forum/public/posts/${uid}/comments?pageSize=100`);
  const commentsItems: any[] = commentsRes.items || [];

  const thread = mapPostToEntry(post);
  const replies: CommunityReply[] = commentsItems.map((c) => ({
    uid: c.id.toString(),
    threadId: uid,
    content: c.content,
    author: c.author?.nickname || '匿名回复',
    anonymous: false, // 简化处理
    createdAt: new Date(c.createdAt),
  }));

  return { thread, replies };
}

// ─── 写入方法 ──────────────────────────────────

export async function createCommunityThread(input: {
  title: string;
  content: string;
  channel: CommunityChannel;
  anonymous: boolean;
  author: string;
}): Promise<string> {
  const payload = {
    title: input.title || '无标题',
    content: input.content,
    boardSlug: 'TODO_SLUGIFY_' + input.channel, // 实际需与后端的 Slug 对齐
    postType: input.channel === '专题' ? 'GUIDE' : 'DISCUSSION',
  };
  
  const res = await authFetch('/forum/user/posts', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return res.id.toString();
}

export async function createCommunityReply(input: {
  threadId: string;
  content: string;
  anonymous: boolean;
  author: string;
}): Promise<void> {
  await authFetch(`/forum/user/posts/${input.threadId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content: input.content }),
  });
}

export async function promoteCommunityThreadToTopic(uid: string): Promise<void> {
  // Demo 方案，实际可调用 updateOwnPost 等接口更改状态
  await authFetch(`/forum/user/posts/${uid}`, {
    method: 'PATCH',
    body: JSON.stringify({ postType: 'GUIDE' }),
  });
}

export async function createSelfGossipThread(text: string): Promise<string> {
  return createCommunityThread({
    title: '',
    content: text,
    channel: 'Gossip 贴板',
    author: '当前浏览器',
    anonymous: true,
  });
}

// ─── 工具函数 ──────────────────────────────────

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes} 分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} 小时前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} 天前`;
  return d.toLocaleDateString('zh-CN');
}

export function formatExpiry(date?: Date | string | null): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  const diff = d.getTime() - Date.now();
  if (diff <= 0) return '已过期';
  const hours = Math.floor(diff / 3600_000);
  if (hours < 1) return `${Math.floor(diff / 60_000)} 分钟后销毁`;
  if (hours < 24) return `${hours} 小时后销毁`;
  return `${Math.floor(hours / 24)} 天后销毁`;
}
