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
      title: '手把手教：对公信贷系统全流程操作指南 (2026修订版)',
      content:
        '各位新入行的客户经理：很多新手卡在贷前和审查录入环节。主要流程：\n1. 客户建档与评级：先走对公信息维护，确保财报导入正确。\n2. 发起授信申请：必须挂接最新的评级结果，审查意见里"是否新增授信"选是。\n3. 如果卡在【补充退回】：不需要撤销全流程！直接在待办页面选补充材料节点提交即可。\n有问题的直接下面回帖，每天下班前解答。',
      channel: '经验分享',
      author: '实名认证-张经理',
      anonymous: false,
      kind: 'thread',
      likes: 42,
      replyCount: 5,
      createdAt: h(24),
    },
    {
      uid: crypto.randomUUID(),
      title: '银承汇票贴现业务具体操作步骤 (新手防坑必读)',
      content:
        '今天跑完了一笔3000万的银承贴现，把操作步骤固化下来供参考：\n\n一、前置检查\n1. 承兑行是否在总行准入白名单内（这是坑！有些城商行额度刚用满）。\n2. 贸易背景真实性：发票日期必须在汇票出票日之前或差不多，合同要验原件。\n\n二、系统操作\n主系统 -> 票据业务 -> 银承贴现申请 -> 输入票号自动跳出票面信息 -> 这里的[利率审批表]附件必须是双签版，否则复核必退回！\n如果报错"票据状态异常"，先让客户在网银点一下"贴现签收"，系统有20分钟延迟。',
      channel: '系统操作',
      author: '实名认证-李行长',
      anonymous: false,
      kind: 'thread',
      likes: 128,
      replyCount: 12,
      createdAt: h(12),
    },
    {
      uid: crypto.randomUUID(),
      title: '授信审批「一次退回不用重走全流程」的操作路径',
      content:
        '上周试了一下：如果审查只是退补材料而不是否决，系统里选「补充退回」而不是「审批退回」，客户经理端会保留已填信息，改完直接重新提交。之前一直不知道这两个按钮的区别，白白多走了好几次全流程。分享给大家参考。',
      channel: '系统操作',
      author: '实名认证-陈经理',
      anonymous: false,
      kind: 'thread',
      likes: 85,
      replyCount: 2,
      createdAt: h(36),
    },
    {
      uid: crypto.randomUUID(),
      title: '合规预警：近期查严的几个贷款资金流向问题',
      content:
        '接分行通知，最近重点查这三个流向：\n1. 贷款发放后直接转入房地产开发企业账户。\n2. 流贷转入证券公司、理财公司。\n3. 小微贷款转入个人账户再购买豪车/私募。\n各位放款后7天内的受托支付凭证一定要看仔细了，不要只看第一手的流水，务必穿透查三层！',
      channel: '合规探讨',
      author: '合规部-王专员',
      anonymous: false,
      kind: 'thread',
      likes: 67,
      replyCount: 8,
      createdAt: h(5),
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
  const isDark = input.channel === '匿名吐槽' || input.channel === '二手交易';

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
