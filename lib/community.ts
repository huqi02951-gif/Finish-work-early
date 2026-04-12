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

const SEED_KEY = 'fwe:community-seeded-v2';

async function ensureSeed() {
  if (localStorage.getItem(SEED_KEY) === '1') return;
  
  // Clear old data when upgrading to v2 seeds
  await cdb.threads.clear();
  await cdb.replies.clear();

  const now = new Date();
  const h = (hours: number) => new Date(now.getTime() - hours * 3600_000);
  const exp = (hours: number) => new Date(now.getTime() + hours * 3600_000);

  const seeds: CommunityEntry[] = [
    {
      uid: crypto.randomUUID(),
      title: '如何营销高新制造企业进门打法 (避雷版)',
      content:
        '这周跑了三家高新制造企业，总结了几条进门话术和避雷点。千万别一上来就提流贷，没人缺你那点钱。切入点要放在“设备更新补贴”和“长易担的简易备案流程”上，告诉他们审批能在3天内走完。同时一定要前置看下纳税评级，别跑到最后发现是个C。',
      channel: '经验分享',
      author: '实名认证-张经理',
      anonymous: false,
      kind: 'thread',
      likes: 65,
      replyCount: 3,
      createdAt: h(24),
    },
    {
      uid: crypto.randomUUID(),
      title: '对公批量打款/批量开户操作最后一步最容易错的事项总结',
      content:
        '各位刚入手对公的姐妹们看过来：批量开户上传明细表的时候，表头的格式一定不能动！尤其是身份证号那一列必须要设为文本格式，不然会有科学计数法导致校验全军覆没！还有，打款前让客户一定要先在网银上做一次小额测试验证，退票真的很麻烦！',
      channel: '经验分享',
      author: '网点-王主管',
      anonymous: false,
      kind: 'thread',
      likes: 124,
      replyCount: 2,
      createdAt: h(5),
    },
    {
      uid: crypto.randomUUID(),
      title: '厂工宝盒、长易担目前碰到的雷区及退件汇总专题',
      content:
        '汇总了分行最近长易担被退件的几个高频原因：\n1. 营授比超标，强行包装。\n2. 中小担白名单未准入直接发起了流程。\n3. 高新资质正在重新认定期内，没提供有效期延续证明。\n遇到这些情况应该怎么补救，建议都进来看看，持续更新。',
      channel: '专题',
      author: '审查部-老李',
      anonymous: false,
      kind: 'topic',
      likes: 88,
      replyCount: 2,
      createdAt: h(20),
    },
    {
      uid: crypto.randomUUID(),
      title: '新人入行手册：如何使用工具解放双手？（具体每个工具保姆级剖析）',
      content:
        '刚入行怎么不熬夜？巧用工作台的工具！\n比如“利率优惠签报智能生成”，你只要输入客户名和痛点，它自动写官话，直接复制进OA，能省出半小时；再比如“敏感沟通助手”，催款怎么催得不伤和气，直接选语气生成发给客户就行。手把手帖子见评论区。',
      channel: '专题',
      author: '实名认证-陈行长',
      anonymous: false,
      kind: 'topic',
      likes: 210,
      replyCount: 0,
      createdAt: h(48),
    },
    {
      uid: crypto.randomUUID(),
      title: '姐妹们有没有听说过XXD的瓜吗？',
      content: '听说是上次去分中心汇报的时候因为什么指标的事大吵了一架？有人知道内情吗？吃瓜吃到一半好捉急。',
      channel: 'Gossip 贴板',
      author: '匿名节点',
      anonymous: true,
      kind: 'gossip',
      likes: 45,
      replyCount: 2,
      expiresAt: exp(4),
      source: 'bbs',
      createdAt: h(2),
    },
    {
      uid: crypto.randomUUID(),
      title: '客户经理的最新定级管理办法太不合理了！',
      content: '凭什么我拼死拼活做进来的大额低成本存款就不计入核心评级了？难道只有放贷款算业绩？有没有人知道怎么才能在新办法下拿到高奖金？心累。',
      channel: '匿名吐槽',
      author: '匿名查水表',
      anonymous: true,
      kind: 'dark',
      likes: 130,
      replyCount: 1,
      expiresAt: exp(8),
      source: 'bbs',
      createdAt: h(10),
    },
    {
      uid: crypto.randomUUID(),
      title: '闲置出个大F机械键盘和人体工学椅，救救老腰',
      content: '退坑不当牛马了（不是）。换新装备，一把青轴FILCO和一把网易严选的椅子，500打包带走，或者请我喝10杯瑞幸生椰拿铁也行。同城自提。',
      channel: '二手交易',
      author: '键盘侠节点',
      anonymous: true,
      kind: 'dark',
      likes: 8,
      replyCount: 1,
      expiresAt: exp(24),
      source: 'bbs',
      createdAt: h(3),
    },
    {
      uid: crypto.randomUUID(),
      title: '今年大家的工资发了多少？真的降了吗？',
      content: '坐标某支行，怎么感觉上个月的绩效比去年同期缩水了30%...是不是因为大盘指标没完成所以统扣了？好焦虑啊。',
      channel: 'Gossip 贴板',
      author: '匿名破防',
      anonymous: true,
      kind: 'gossip',
      likes: 315,
      replyCount: 1,
      expiresAt: exp(12),
      source: 'bbs',
      createdAt: h(1),
    },
    {
      uid: crypto.randomUUID(),
      title: '去武汉出差的报销流程现在怎么走？求推荐咖啡店',
      content: '明天要去武汉分行跟进个项目，现在跨省出差审批需要在新OA走哪条线？另外有姐妹知道那边哪家咖啡馆或者甜点好吃又有格调的吗？（能开正规餐饮专票的最好哈哈）',
      channel: 'Gossip 贴板',
      author: '当前浏览器',
      anonymous: true,
      kind: 'gossip',
      likes: 12,
      replyCount: 1,
      expiresAt: exp(24),
      source: 'bbs',
      createdAt: h(5),
    }
  ];

  await cdb.threads.bulkAdd(seeds);

  // Add a few seed replies
  const threadUids = seeds.map((s) => s.uid);
  await cdb.replies.bulkAdd([
    {
      uid: crypto.randomUUID(),
      threadId: threadUids[0],
      content: '真的！第一句切入点太重要了，前两天去谈一家科技企业，刚说可以做贷款就被赶出来了...',
      author: '李小妹',
      anonymous: false,
      createdAt: h(20),
    },
    {
      uid: crypto.randomUUID(),
      threadId: threadUids[0],
      content: '请教下张经理，如果对方说自己有交行的低息贷了，我们还有什么突破口吗？',
      author: '匿名节点',
      anonymous: true,
      createdAt: h(18),
    },
    {
      uid: crypto.randomUUID(),
      threadId: threadUids[0],
      content: '回复楼上：用“政策性增信”的额度来打，交行的敞口额度不用占用，这个是纯新增的额度。',
      author: '实名认证-张经理',
      anonymous: false,
      createdAt: h(15),
    },
    {
      uid: crypto.randomUUID(),
      threadId: threadUids[1],
      content: '补充一下，科学计数法那个太坑了，上周整整导错了一下午。',
      author: '匿名节点',
      anonymous: true,
      createdAt: h(3),
    },
    {
      uid: crypto.randomUUID(),
      threadId: threadUids[1],
      content: '谢谢王姐救命之恩！',
      author: '实名认证-小王',
      anonymous: false,
      createdAt: h(2),
    },
    {
      uid: crypto.randomUUID(),
      threadId: threadUids[2],
      content: '昨天刚因为漏了高新证书延续被退件，老李总结得太准了。',
      author: '匿名大冤种',
      anonymous: true,
      createdAt: h(10),
    },
    {
      uid: crypto.randomUUID(),
      threadId: threadUids[2],
      content: '如果是营授比超了一点点，有什么话术能在审查那边通过吗？',
      author: '想放款想疯了',
      anonymous: true,
      createdAt: h(8),
    },
    {
      uid: crypto.randomUUID(),
      threadId: threadUids[4],
      content: '听说是争那个中收指标，好像还拍桌子了，这瓜太大了保熟！',
      author: '冲浪第一人',
      anonymous: true,
      createdAt: h(1.5),
    },
    {
      uid: crypto.randomUUID(),
      threadId: threadUids[4],
      content: '别问了，问就是大家都要被连坐罚款了。',
      author: '心累的搬砖工',
      anonymous: true,
      createdAt: h(1),
    },
    {
      uid: crypto.randomUUID(),
      threadId: threadUids[5],
      content: '严重同感，现在做大资产全是苦力活，结果定级一看全在混！',
      author: '底层牛马',
      anonymous: true,
      createdAt: h(9),
    },
    {
      uid: crypto.randomUUID(),
      threadId: threadUids[6],
      content: '键盘单出吗？在二楼业务部可以直接面交！',
      author: '打字如飞',
      anonymous: true,
      createdAt: h(1),
    },
    {
      uid: crypto.randomUUID(),
      threadId: threadUids[7],
      content: '何止30%，我的算下来降了快一半，房贷都要都不上了。',
      author: '匿名泪目',
      anonymous: true,
      createdAt: h(0.5),
    },
    {
      uid: crypto.randomUUID(),
      threadId: threadUids[8],
      content: '走分行OA系统的【跨地区特别申请单】，甜点强烈推荐汉街上的那家Maison，凭发票能直接开报。',
      author: '吃货大队长',
      anonymous: true,
      createdAt: h(2),
    }
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
