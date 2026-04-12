/**
 * 社区数据层 — 基于 Dexie (IndexedDB) 的本地社区原型
 *
 * 所有帖子、回复、gossip、专题都存在浏览器本地。
 * API 形状与未来后端接口保持一致，替换时只改实现不改接口。
 */
import Dexie, { type EntityTable } from 'dexie';

// ─── 类型 ──────────────────────────────────────

export const COMMUNITY_CHANNELS = [
  '经验分享',
  '系统操作',
  '今日生活',
  '暗帖区',
  'Gossip 贴板',
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
  source?: string; // 'self_gossip' | 'bbs' | ...
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

// ─── 数据库 ────────────────────────────────────

class CommunityDB extends Dexie {
  threads!: EntityTable<CommunityEntry, 'uid'>;
  replies!: EntityTable<CommunityReply, 'uid'>;

  constructor() {
    super('FinishWorkEarlyCommunity');

    this.version(1).stores({
      threads: 'uid, channel, kind, createdAt, expiresAt, source',
      replies: 'uid, threadId, createdAt',
    });
  }
}

const cdb = new CommunityDB();

// ─── 种子数据 ──────────────────────────────────

const SEED_KEY = 'fwe:community-seeded';

async function ensureSeed() {
  if (localStorage.getItem(SEED_KEY) === '1') return;
  const count = await cdb.threads.count();
  if (count > 0) {
    localStorage.setItem(SEED_KEY, '1');
    return;
  }

  const now = new Date();
  const h = (hours: number) => new Date(now.getTime() - hours * 3600_000);
  const exp = (hours: number) => new Date(now.getTime() + hours * 3600_000);

  const seeds: CommunityEntry[] = [
    {
      uid: crypto.randomUUID(),
      title: '授信审批「一次退回不用重走全流程」的操作路径',
      content:
        '上周试了一下：如果审查只是退补材料而不是否决，系统里选「补充退回」而不是「审批退回」，客户经理端会保留已填信息，改完直接重新提交。之前一直不知道这两个按钮的区别，白白多走了好几次全流程。分享给大家参考。',
      channel: '经验分享',
      author: '匿名节点',
      anonymous: true,
      kind: 'thread',
      likes: 7,
      replyCount: 2,
      createdAt: h(3),
    },
    {
      uid: crypto.randomUUID(),
      title: 'CM2025 批量录入贷后检查报告的隐藏入口',
      content:
        '系统操作 → 贷后管理 → 左下角有个「批量导入」，支持 Excel 模板。官方文档没提但确实能用。模板在 CM 帮助中心搜「贷后批量」可以下载。一次可以导入 50 条。',
      channel: '系统操作',
      author: '当前浏览器',
      anonymous: false,
      kind: 'thread',
      likes: 12,
      replyCount: 4,
      createdAt: h(6),
    },
    {
      uid: crypto.randomUUID(),
      title: '听说年中考核要改成季度制了？',
      content:
        '今天开会的时候领导提了一嘴，说总行在推季度考核试点。不知道是不是所有分行都会跟进。有人听到更多消息吗？',
      channel: '暗帖区',
      author: '匿名节点',
      anonymous: true,
      kind: 'dark',
      likes: 3,
      replyCount: 1,
      expiresAt: exp(20),
      createdAt: h(2),
    },
    {
      uid: crypto.randomUUID(),
      title: '',
      content: '食堂三楼的麻辣烫今天加了新的菌菇拼盘，意外好吃，推荐。',
      channel: 'Gossip 贴板',
      author: '匿名节点',
      anonymous: true,
      kind: 'gossip',
      likes: 5,
      replyCount: 0,
      expiresAt: exp(22),
      source: 'self_gossip',
      createdAt: h(1),
    },
    {
      uid: crypto.randomUUID(),
      title: '新人入行 30 天实战手册',
      content:
        '汇总了入行第一个月最高频遇到的 12 个场景（开户、授信、银承、利率签报……），每个场景附上操作路径和避坑点。持续更新中，欢迎补充。',
      channel: '专题',
      author: '当前浏览器',
      anonymous: false,
      kind: 'topic',
      likes: 18,
      replyCount: 6,
      createdAt: h(48),
    },
  ];

  await cdb.threads.bulkAdd(seeds);

  // Add a few seed replies
  const threadUids = seeds.map((s) => s.uid);
  await cdb.replies.bulkAdd([
    {
      uid: crypto.randomUUID(),
      threadId: threadUids[0],
      content: '真的有用！之前每次都要重新填一遍，太痛苦了。',
      author: '当前浏览器',
      anonymous: false,
      createdAt: h(2),
    },
    {
      uid: crypto.randomUUID(),
      threadId: threadUids[0],
      content: '补充一下：如果涉及担保变更，还是得走全流程，这个快捷方式只适用于补材料。',
      author: '匿名节点',
      anonymous: true,
      createdAt: h(1.5),
    },
    {
      uid: crypto.randomUUID(),
      threadId: threadUids[1],
      content: '试了一下确实可以！模板格式要注意日期列必须是 yyyy-mm-dd 格式，否则会报错。',
      author: '匿名节点',
      anonymous: true,
      createdAt: h(4),
    },
  ]);

  localStorage.setItem(SEED_KEY, '1');
}

// Init on module load
ensureSeed();

// ─── 查询方法 ──────────────────────────────────

export async function getCommunitySummary() {
  await ensureSeed();

  const allThreads = await cdb.threads.toArray();
  const now = new Date();

  // Filter out expired
  const active = allThreads.filter(
    (t) => !t.expiresAt || new Date(t.expiresAt).getTime() > now.getTime(),
  );

  const totalThreads = active.length;
  const totalTopics = active.filter((t) => t.kind === 'topic').length;
  const totalGossip = active.filter((t) => t.kind === 'gossip').length;
  const totalReplies = await cdb.replies.count();

  // Sort by likes desc for hot threads
  const hotThreads = [...active]
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 5);

  const latestGossip = active
    .filter((t) => t.kind === 'gossip' || t.channel === 'Gossip 贴板')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const topics = active
    .filter((t) => t.kind === 'topic')
    .sort((a, b) => b.replyCount - a.replyCount)
    .slice(0, 5);

  const expiringThreads = active
    .filter((t) => t.expiresAt)
    .sort((a, b) => new Date(a.expiresAt!).getTime() - new Date(b.expiresAt!).getTime())
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
  await ensureSeed();

  const now = new Date();
  let items: CommunityEntry[];

  if (!channel || channel === '全部') {
    items = await cdb.threads.toArray();
  } else {
    items = await cdb.threads.where('channel').equals(channel).toArray();
  }

  // Filter expired
  return items
    .filter((t) => !t.expiresAt || new Date(t.expiresAt).getTime() > now.getTime())
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getCommunityThread(uid: string) {
  const thread = await cdb.threads.get(uid);
  if (!thread) return null;

  const replies = await cdb.replies
    .where('threadId')
    .equals(uid)
    .toArray();

  replies.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

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
  const isGossip = input.channel === 'Gossip 贴板';
  const isDark = input.channel === '暗帖区';

  const kind: CommunityKind = isGossip
    ? 'gossip'
    : isDark
      ? 'dark'
      : 'thread';

  const uid = crypto.randomUUID();
  const now = new Date();

  await cdb.threads.add({
    uid,
    title: input.title || (isGossip ? '' : '无标题'),
    content: input.content,
    channel: input.channel,
    author: input.author,
    anonymous: input.anonymous,
    kind,
    likes: 0,
    replyCount: 0,
    expiresAt: isGossip || isDark ? new Date(now.getTime() + 24 * 3600_000) : undefined,
    source: 'bbs',
    createdAt: now,
  });

  return uid;
}

export async function createCommunityReply(input: {
  threadId: string;
  content: string;
  anonymous: boolean;
  author: string;
}): Promise<void> {
  await cdb.replies.add({
    uid: crypto.randomUUID(),
    threadId: input.threadId,
    content: input.content,
    author: input.author,
    anonymous: input.anonymous,
    createdAt: new Date(),
  });

  // Increment reply count on thread
  const thread = await cdb.threads.get(input.threadId);
  if (thread) {
    await cdb.threads.update(input.threadId, {
      replyCount: (thread.replyCount || 0) + 1,
    });
  }
}

export async function promoteCommunityThreadToTopic(uid: string): Promise<void> {
  await cdb.threads.update(uid, {
    kind: 'topic',
    channel: '专题',
    expiresAt: undefined,
  });
}

export async function createSelfGossipThread(text: string): Promise<string> {
  const uid = crypto.randomUUID();
  const now = new Date();

  await cdb.threads.add({
    uid,
    title: '',
    content: text,
    channel: 'Gossip 贴板',
    author: '当前浏览器',
    anonymous: false,
    kind: 'gossip',
    likes: 0,
    replyCount: 0,
    expiresAt: new Date(now.getTime() + 24 * 3600_000),
    source: 'self_gossip',
    createdAt: now,
  });

  return uid;
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
