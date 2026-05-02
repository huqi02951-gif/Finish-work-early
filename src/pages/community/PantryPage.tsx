import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Bookmark,
  Coffee,
  Flame,
  LockKeyhole,
  MessageCircle,
  Package2,
  Radio,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Zap,
} from 'lucide-react';
import CyberLayout from '../../components/layout/CyberLayout';
import { useToast } from '../../components/common/Toast';
import { cn } from '../../../lib/utils';
import { getBestToken } from '../../services/authService';
import {
  connectPantrySocket,
  MarketListing,
  pantryApi,
  PantryFeed,
  PantryPost,
  PantryPostKind,
  PantryVisibilityMode,
  TradeOrder,
} from '../../services/pantryApi';

type ComposerMode = 'radar' | 'saga' | 'burn' | 'market';
type Reaction = 'FIRE' | 'BRICK' | 'EYES' | 'TEA' | 'SUPPORT';
type MobileSection = 'radar' | 'rails' | 'market' | 'inbox';

const TTL_OPTIONS = [
  { label: '30m', value: 30 },
  { label: '2h', value: 120 },
  { label: '12h', value: 720 },
  { label: '24h', value: 1440 },
];

const MODE_META: Record<ComposerMode, { label: string; eyebrow: string; kind: PantryPostKind; visibility: PantryVisibilityMode }> = {
  radar: { label: '爆料 Radar', eyebrow: 'GOSSIP SIGNAL', kind: 'gossip', visibility: 'PERMANENT' },
  saga: { label: '深水长瓜', eyebrow: 'SLOW-BURN FINANCE MELON', kind: 'thread', visibility: 'PERMANENT' },
  burn: { label: '马上焚', eyebrow: 'BURN AFTER READING', kind: 'burn', visibility: 'EPHEMERAL' },
  market: { label: '黑市暗单', eyebrow: 'MARKET SIGNAL', kind: 'thread', visibility: 'PERMANENT' },
};

function formatRemain(expiresAt?: string | null) {
  if (!expiresAt) return '永久追更';
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return '已焚毁';
  const mins = Math.ceil(ms / 60_000);
  if (mins < 60) return `${mins} 分钟后焚`;
  return `${Math.ceil(mins / 60)} 小时后焚`;
}

function formatTime(value: string) {
  return new Date(value).toLocaleString([], { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function radarScore(post: PantryPost) {
  return post.radarScore ?? Math.max(1, post.heatScore + post.reactionCount * 2 + post.commentCount * 4 + (post.bookmarkCount || 0) * 5);
}

function previewFeed(): PantryFeed {
  const now = Date.now();
  const posts: PantryPost[] = [
    {
      id: 9101,
      title: '突发：今天有人在 17 楼会议室听到一个很大的组织调整瓜',
      content: '线索还没完全坐实，但两个不同小群都在传同一个版本：下周一会有一轮部门合并，几个岗位会被重新分配。欢迎补充证据，别贴个人隐私。',
      kind: 'gossip',
      visibilityMode: 'PERMANENT',
      expiresAt: null,
      anonymousAlias: 'Gossip_7F',
      aliasColor: '#f8d58b',
      heatScore: 96,
      reactionCount: 38,
      bookmarkCount: 21,
      commentCount: 42,
      radarScore: 428,
      coffee: { qrUrl: '收款码预览：作者已公开咖啡码', note: '爆料有用就请楼主喝杯冰美式' },
      createdAt: new Date(now - 18 * 60_000).toISOString(),
      updatedAt: new Date(now - 5 * 60_000).toISOString(),
      tags: ['组织调整', '一线情报'],
      authorId: 101,
    },
    {
      id: 9102,
      title: '马上焚：今晚谁还在被客户反复改授信材料？',
      content: '这条 30 分钟后从前台消失。只想确认一下，是不是每个人都在同一个晚上被同一类需求折磨。',
      kind: 'burn',
      visibilityMode: 'EPHEMERAL',
      expiresAt: new Date(now + 27 * 60_000).toISOString(),
      anonymousAlias: 'Burn_2C',
      aliasColor: '#fb7185',
      heatScore: 44,
      reactionCount: 17,
      bookmarkCount: 3,
      commentCount: 12,
      radarScore: 188,
      coffee: null,
      createdAt: new Date(now - 3 * 60_000).toISOString(),
      updatedAt: new Date(now - 2 * 60_000).toISOString(),
      tags: ['马上焚'],
      authorId: 102,
    },
    {
      id: 9103,
      title: '长期追更：某系统每周五下午必崩，到底是谁在背锅？',
      content: '本帖长期记录每次事故时间、影响范围和临时补救方式。欢迎按楼层补证据，最后整理成一份避坑手册。',
      kind: 'thread',
      visibilityMode: 'PERMANENT',
      expiresAt: null,
      anonymousAlias: 'Archivist_11',
      aliasColor: '#c4b5fd',
      heatScore: 73,
      reactionCount: 24,
      bookmarkCount: 36,
      commentCount: 58,
      radarScore: 356,
      coffee: { qrUrl: '收款码预览：持续整理贡献', note: '感谢长期维护帖子的线人' },
      createdAt: new Date(now - 4 * 3600_000).toISOString(),
      updatedAt: new Date(now - 16 * 60_000).toISOString(),
      tags: ['长期追更', '系统'],
      authorId: 103,
    },
    {
      id: 9104,
      title: '听说某产品线口径又改了，上午培训和下午邮件不一致',
      content: '如果你也收到了两个版本，麻烦贴一下时间线。现在最需要的是把变更顺序还原出来。',
      kind: 'gossip',
      visibilityMode: 'PERMANENT',
      expiresAt: null,
      anonymousAlias: 'Signal_A8',
      aliasColor: '#67e8f9',
      heatScore: 58,
      reactionCount: 19,
      bookmarkCount: 12,
      commentCount: 25,
      radarScore: 241,
      coffee: null,
      createdAt: new Date(now - 72 * 60_000).toISOString(),
      updatedAt: new Date(now - 30 * 60_000).toISOString(),
      tags: ['产品口径'],
      authorId: 104,
    },
  ];
  const listings: MarketListing[] = [
    {
      id: 8101,
      type: 'SELL',
      title: 'HHKB 静电容键盘，成色很好',
      description: '只做合法二手交换。平台不托管支付，双方私信确认线下或站外交付。',
      category: '键盘鼠标',
      condition: '九成新',
      priceText: '900 / 可换显示器支架',
      priceCents: null,
      status: 'ACTIVE',
      anonymousAlias: 'Market_09',
      aliasColor: '#9ae6b4',
      sellerId: 201,
      isMine: false,
      orderCount: 4,
      expiresAt: new Date(now + 12 * 24 * 3600_000).toISOString(),
      createdAt: new Date(now - 34 * 60_000).toISOString(),
      updatedAt: new Date(now - 34 * 60_000).toISOString(),
    },
    {
      id: 8102,
      type: 'WANTED',
      title: '求一个舒服腰垫，别太商务',
      description: '预算 150 内。最好能午休时面交，私信说。',
      category: '办公人体工学',
      condition: '不限',
      priceText: '150 内',
      priceCents: null,
      status: 'ACTIVE',
      anonymousAlias: 'Market_77',
      aliasColor: '#fbbf24',
      sellerId: 202,
      isMine: false,
      orderCount: 1,
      expiresAt: new Date(now + 8 * 24 * 3600_000).toISOString(),
      createdAt: new Date(now - 2 * 3600_000).toISOString(),
      updatedAt: new Date(now - 2 * 3600_000).toISOString(),
    },
  ];
  return {
    identity: {
      id: 0,
      userId: 0,
      alias: 'Radar_DEMO',
      color: '#f8d58b',
      status: 'PREVIEW',
      coffeePublic: true,
      coffeeQrUrl: '预览收款码',
      coffeeNote: '如果你喜欢这个茶水间，可以把咖啡入口放在这里。',
      reputation: 88,
    },
    posts,
    listings,
    conversations: [
      {
        id: 7101,
        otherUserId: 201,
        otherAlias: 'Market_09',
        otherColor: '#9ae6b4',
        listingId: 8101,
        orderId: 6101,
        lastMessage: '可以明天中午楼下交付，站外确认即可。',
        lastAt: new Date(now - 4 * 60_000).toISOString(),
        latestMessage: null,
      },
    ],
    orders: [
      {
        id: 6101,
        listingId: 8101,
        listingTitle: 'HHKB 静电容键盘，成色很好',
        buyerId: 0,
        sellerId: 201,
        counterpartyAlias: 'Market_09',
        status: 'ACCEPTED',
        note: '想要这个键盘',
        offPlatformNote: null,
        disputeReason: null,
        createdAt: new Date(now - 14 * 60_000).toISOString(),
        updatedAt: new Date(now - 5 * 60_000).toISOString(),
      },
    ],
    radar: posts.sort((a, b) => radarScore(b) - radarScore(a)),
    rising: posts.slice(0, 3),
    burningSoon: posts.filter((post) => post.expiresAt),
    sagas: posts.filter((post) => post.kind === 'thread'),
    marketSignals: listings,
    coffeeLeaderboard: posts
      .filter((post) => post.coffee)
      .map((post) => ({
        authorId: post.authorId,
        alias: post.anonymousAlias,
        color: post.aliasColor,
        radarScore: radarScore(post),
        coffee: post.coffee!,
      })),
  };
}

const PantryPage: React.FC = () => {
  const toast = useToast();
  const [feed, setFeed] = useState<PantryFeed | null>(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const [loadError, setLoadError] = useState('');
  const [previewOverride, setPreviewOverride] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [mode, setMode] = useState<ComposerMode>('radar');
  const [postDraft, setPostDraft] = useState({ title: '', content: '', ttlMinutes: 30 });
  const [listingDraft, setListingDraft] = useState({
    type: 'SELL' as 'SELL' | 'WANTED',
    title: '',
    priceText: '',
    category: '键盘鼠标',
    condition: '九成新',
    description: '',
  });
  const [coffeeDraft, setCoffeeDraft] = useState({ qrUrl: '', note: '', public: false });
  const [coffeeOpen, setCoffeeOpen] = useState(false);
  const [marketFilter, setMarketFilter] = useState<'ALL' | 'SELL' | 'WANTED'>('ALL');
  const [messageDraft, setMessageDraft] = useState<Record<number, string>>({});
  const [mobileSection, setMobileSection] = useState<MobileSection>('radar');

  const authed = Boolean(getBestToken());

  const loadFeed = async (forcePreview = previewOverride) => {
    if (!getBestToken() || forcePreview) {
      setFeed(previewFeed());
      setLoadError('');
      setNotice(forcePreview ? '正在查看预览模式：真实发帖、咖啡码、私信、交易需要切回真实接口并登录。' : '未登录预览模式：可浏览完整 Gossip Radar，真实发帖、咖啡码、私信、交易需登录和可用数据库。');
      setLoading(false);
      return;
    }
    setLoading(true);
    setNotice('');
    setLoadError('');
    try {
      const payload = await pantryApi.getFeed();
      setFeed(payload);
      setCoffeeDraft({
        qrUrl: payload.identity.coffeeQrUrl || '',
        note: payload.identity.coffeeNote || '',
        public: Boolean(payload.identity.coffeePublic),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : '茶水间加载失败';
      setFeed(null);
      setLoadError(message);
      setNotice(`真实接口加载失败：${message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeed();
    const socket = connectPantrySocket();
    if (!socket) return undefined;
    const refresh = () => loadFeed(false);
    socket.on('feed:update', refresh);
    socket.on('conversation:update', refresh);
    socket.on('order:update', refresh);
    return () => {
      socket.disconnect();
    };
  }, []);

  const radar = useMemo(() => feed?.radar?.length ? feed.radar : [...(feed?.posts || [])].sort((a, b) => radarScore(b) - radarScore(a)), [feed]);
  const rising = useMemo(() => feed?.rising?.length ? feed.rising : radar.slice(0, 4), [feed, radar]);
  const burningSoon = useMemo(() => feed?.burningSoon?.length ? feed.burningSoon : (feed?.posts || []).filter((post) => post.expiresAt), [feed]);
  const sagas = useMemo(() => feed?.sagas?.length ? feed.sagas : (feed?.posts || []).filter((post) => post.kind === 'thread'), [feed]);
  const marketSignals = useMemo(() => feed?.marketSignals?.length ? feed.marketSignals : feed?.listings || [], [feed]);
  const filteredMarketSignals = useMemo(
    () => marketFilter === 'ALL' ? marketSignals : marketSignals.filter((item) => item.type === marketFilter),
    [marketFilter, marketSignals],
  );

  const simulatePost = () => {
    const now = Date.now();
    const meta = MODE_META[mode];
    const created: PantryPost = {
      id: now,
      title: postDraft.title.trim(),
      content: postDraft.content.trim(),
      kind: meta.kind,
      visibilityMode: meta.visibility,
      expiresAt: meta.visibility === 'EPHEMERAL' ? new Date(now + postDraft.ttlMinutes * 60_000).toISOString() : null,
      anonymousAlias: feed?.identity.alias || 'Radar_DEMO',
      aliasColor: feed?.identity.color || '#f8d58b',
      heatScore: 0,
      reactionCount: 0,
      bookmarkCount: 0,
      commentCount: 0,
      radarScore: 12,
      coffee: null,
      createdAt: new Date(now).toISOString(),
      updatedAt: new Date(now).toISOString(),
      tags: [meta.label],
      authorId: 0,
    };
    setFeed((current) => current ? { ...current, posts: [created, ...current.posts], radar: [created, ...(current.radar || [])] } : previewFeed());
  };

  const publish = async () => {
    if (mode === 'market') {
      await publishListing();
      return;
    }
    if (!postDraft.title.trim() || !postDraft.content.trim()) {
      toast.warning('标题和正文都要写');
      return;
    }
    if (!authed) {
      simulatePost();
      setPostDraft({ title: '', content: '', ttlMinutes: 30 });
      setComposerOpen(false);
      toast.success('预览模式：已模拟写入情报雷达');
      return;
    }
    const meta = MODE_META[mode];
    try {
      await pantryApi.createPost({
        title: postDraft.title.trim(),
        content: postDraft.content.trim(),
        kind: meta.kind,
        visibilityMode: meta.visibility,
        ttlMinutes: postDraft.ttlMinutes,
        tags: [meta.label],
      });
      setPostDraft({ title: '', content: '', ttlMinutes: 30 });
      setComposerOpen(false);
      await loadFeed();
      toast.success('情报已进入雷达');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '发布失败');
    }
  };

  const publishListing = async () => {
    if (!listingDraft.title.trim() || !listingDraft.description.trim()) {
      toast.warning('暗单标题和说明都要写');
      return;
    }
    if (!authed) {
      const now = Date.now();
      const created: MarketListing = {
        id: now,
        ...listingDraft,
        priceCents: null,
        status: 'ACTIVE',
        anonymousAlias: feed?.identity.alias || 'Radar_DEMO',
        aliasColor: feed?.identity.color || '#f8d58b',
        sellerId: 0,
        isMine: true,
        orderCount: 0,
        expiresAt: new Date(now + 14 * 24 * 3600_000).toISOString(),
        createdAt: new Date(now).toISOString(),
        updatedAt: new Date(now).toISOString(),
      };
      setFeed((current) => current ? { ...current, listings: [created, ...current.listings], marketSignals: [created, ...(current.marketSignals || [])] } : previewFeed());
      setComposerOpen(false);
      toast.success('预览模式：暗单已进入雷达');
      return;
    }
    try {
      await pantryApi.createListing({ ...listingDraft, expiresInDays: 14 });
      setListingDraft({ type: 'SELL', title: '', priceText: '', category: '键盘鼠标', condition: '九成新', description: '' });
      setComposerOpen(false);
      await loadFeed();
      toast.success('暗单已上架');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '上架失败');
    }
  };

  const react = async (post: PantryPost, type: Reaction) => {
    if (!authed) {
      setFeed((current) => current ? {
        ...current,
        posts: current.posts.map((item) => item.id === post.id ? {
          ...item,
          reactionCount: item.reactionCount + 1,
          heatScore: item.heatScore + (type === 'FIRE' ? 3 : 1),
          radarScore: radarScore(item) + (type === 'FIRE' ? 12 : 5),
        } : item),
      } : previewFeed());
      return;
    }
    await pantryApi.react(post.id, type);
    await loadFeed();
  };

  const bookmark = async (post: PantryPost) => {
    if (!authed) {
      setFeed((current) => current ? {
        ...current,
        posts: current.posts.map((item) => item.id === post.id ? {
          ...item,
          bookmarkCount: (item.bookmarkCount || 0) + 1,
          heatScore: item.heatScore + 2,
          radarScore: radarScore(item) + 15,
        } : item),
      } : previewFeed());
      toast.success('预览模式：已追更');
      return;
    }
    await pantryApi.bookmark(post.id);
    await loadFeed();
    toast.success('已追更');
  };

  const startOrder = async (listing: MarketListing) => {
    if (!authed) {
      const now = Date.now();
      const order: TradeOrder = {
        id: now,
        listingId: listing.id,
        listingTitle: listing.title,
        buyerId: 0,
        sellerId: listing.sellerId,
        counterpartyAlias: listing.anonymousAlias,
        status: 'REQUESTED',
        note: '预览模式模拟下单',
        offPlatformNote: null,
        disputeReason: null,
        createdAt: new Date(now).toISOString(),
        updatedAt: new Date(now).toISOString(),
      };
      setFeed((current) => current ? { ...current, orders: [order, ...current.orders] } : previewFeed());
      toast.success('预览模式：已创建暗单交易');
      return;
    }
    await pantryApi.createOrder(listing.id, '想要这个，方便私信确认交付方式。');
    await loadFeed();
  };

  const sendMessage = async (conversationId: number) => {
    const content = (messageDraft[conversationId] || '').trim();
    if (!content) return;
    if (!authed) {
      setFeed((current) => current ? {
        ...current,
        conversations: current.conversations.map((item) => item.id === conversationId ? { ...item, lastMessage: content, lastAt: new Date().toISOString() } : item),
      } : previewFeed());
      setMessageDraft((prev) => ({ ...prev, [conversationId]: '' }));
      toast.success('预览模式：密信已送达');
      return;
    }
    await pantryApi.sendMessage(conversationId, content);
    setMessageDraft((prev) => ({ ...prev, [conversationId]: '' }));
    await loadFeed();
  };

  const saveCoffee = async () => {
    if (!authed) {
      setFeed((current) => current ? {
        ...current,
        identity: {
          ...current.identity,
          coffeeQrUrl: coffeeDraft.qrUrl || '预览收款码',
          coffeeNote: coffeeDraft.note,
          coffeePublic: coffeeDraft.public,
        },
      } : previewFeed());
      toast.success('预览模式：咖啡资料已模拟保存');
      return;
    }
    await pantryApi.updateCoffeeProfile({
      coffeeQrUrl: coffeeDraft.qrUrl,
      coffeeNote: coffeeDraft.note,
      coffeePublic: coffeeDraft.public,
    });
    await loadFeed();
    toast.success('咖啡资料已更新');
  };

  return (
    <CyberLayout title="地下茶水间" subtitle="Gossip Radar · 匿名情报站 · 合法二手暗单">
      <div className="min-h-screen bg-[#090607] text-[#f7efe3]">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 space-y-5 pb-28 lg:pb-5">
          <section className="relative overflow-hidden border border-[#7f1d1d]/60 bg-[radial-gradient(circle_at_top_left,rgba(127,29,29,0.46),transparent_34%),linear-gradient(135deg,#16090b,#060506_72%)] px-4 py-5 sm:px-6 sm:py-6">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#f8d58b] to-transparent" />
            <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.28em] text-[#f8d58b]/70">
                  <Radio className="h-3.5 w-3.5" /> Tonight's Radar
                  <span className="border border-[#f8d58b]/30 px-2 py-0.5 text-[#f8d58b]">LIVE</span>
                </div>
                <h1 className="mt-4 max-w-3xl text-2xl font-black leading-tight tracking-tight sm:text-4xl xl:text-5xl">
                  今天最热的瓜，正在这里发酵。
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[#d9c7b4]/75">
                  爆料、追更、马上焚、暗单和密信被压进同一个情报雷达。前台匿名，后台留痕；高级感可以拉满，边界也要守住。
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2">
                <RadarMetric label="雷达热度" value={radar[0] ? radarScore(radar[0]) : 0} icon={TrendingUp} />
                <RadarMetric label="正在升温" value={rising.length} icon={Zap} />
                <RadarMetric label="即将焚毁" value={burningSoon.length} icon={Flame} />
                <RadarMetric label="黑市暗单" value={marketSignals.length} icon={Package2} />
              </div>
            </div>
          </section>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 rounded border border-[#f8d58b]/25 bg-[#120b0c] px-3 py-2">
              <div className="h-8 w-8 rounded-full border border-[#f8d58b]/40 bg-[#f8d58b]/10" />
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#f8d58b]/55">Your Codename</p>
                <p className="text-sm font-black" style={{ color: feed?.identity.color || '#f8d58b' }}>{feed?.identity.alias || 'Radar_DEMO'}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setCoffeeOpen((v) => !v)} className="inline-flex items-center gap-2 rounded border border-[#f8d58b]/40 bg-[#f8d58b]/10 px-3 py-2 text-xs font-black text-[#f8d58b]">
                <Coffee className="h-4 w-4" /> 请喝咖啡资料
              </button>
              <button onClick={() => setComposerOpen(true)} className="inline-flex items-center gap-2 rounded bg-[#f8d58b] px-4 py-2 text-xs font-black text-[#14090a]">
                <Sparkles className="h-4 w-4" /> 投递情报
              </button>
            </div>
          </div>

          {notice && (
            <div className="flex items-start gap-2 border border-[#f8d58b]/25 bg-[#f8d58b]/10 px-3 py-2 text-xs leading-5 text-[#f8d58b]">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {notice}
            </div>
          )}

          {coffeeOpen && (
            <section className="grid gap-3 border border-[#f8d58b]/25 bg-[#120b0c] p-4 md:grid-cols-[1fr_1fr_auto]">
              <input value={coffeeDraft.qrUrl} onChange={(e) => setCoffeeDraft((d) => ({ ...d, qrUrl: e.target.value }))} placeholder="收款码图片 URL / 说明" className="border border-[#f8d58b]/20 bg-black px-3 py-2 text-sm outline-none" />
              <input value={coffeeDraft.note} onChange={(e) => setCoffeeDraft((d) => ({ ...d, note: e.target.value }))} placeholder="咖啡备注，例如：感谢长期追更" className="border border-[#f8d58b]/20 bg-black px-3 py-2 text-sm outline-none" />
              <button onClick={() => { setCoffeeDraft((d) => ({ ...d, public: !d.public })); }} className={cn('border px-3 py-2 text-xs font-black', coffeeDraft.public ? 'border-[#f8d58b] text-[#f8d58b]' : 'border-[#f8d58b]/20 text-[#d9c7b4]/60')}>{coffeeDraft.public ? '公开展示' : '暂不公开'}</button>
              <button onClick={saveCoffee} className="md:col-span-3 rounded bg-[#f8d58b] px-3 py-2 text-xs font-black text-black">保存咖啡资料</button>
            </section>
          )}

          {loading ? (
            <div className="py-24 text-center text-[#f8d58b]/50"><RefreshCw className="mx-auto mb-3 h-6 w-6 animate-spin" /> 正在扫描情报...</div>
          ) : loadError && !feed ? (
            <section className="border border-[#fb7185]/35 bg-[#1d0b0f] p-6 text-center">
              <AlertTriangle className="mx-auto mb-3 h-7 w-7 text-[#fb7185]" />
              <h2 className="text-lg font-black text-[#fff7ed]">真实茶水间接口暂时不可用</h2>
              <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-[#fda4af]/80">
                当前没有自动塞入假数据，避免把数据库或接口问题伪装成正常。错误信息：{loadError}
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={() => {
                    setPreviewOverride(false);
                    void loadFeed(false);
                  }}
                  className="rounded bg-[#f8d58b] px-4 py-2 text-xs font-black text-black"
                >
                  重试真实接口
                </button>
                <button
                  onClick={() => {
                    setPreviewOverride(true);
                    void loadFeed(true);
                  }}
                  className="rounded border border-[#f8d58b]/30 px-4 py-2 text-xs font-black text-[#f8d58b]"
                >
                  仅查看预览
                </button>
              </div>
            </section>
          ) : (
            <>
              <main className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
                <section className={cn('space-y-3', mobileSection !== 'radar' && 'hidden lg:block')}>
                  {radar.length === 0 ? (
                    <div className="border border-dashed border-[#f8d58b]/25 bg-black/30 px-6 py-12 text-center">
                      <Radio className="mx-auto mb-3 h-7 w-7 text-[#f8d58b]/60" />
                      <p className="text-sm font-black text-[#f8d58b]">情报雷达暂时空空</p>
                      <p className="mx-auto mt-2 max-w-xs text-[11px] leading-5 text-[#d9c7b4]/55">
                        投递第一条爆料、深水瓜或马上焚，让雷达开始转起来。
                      </p>
                      <button
                        onClick={() => setComposerOpen(true)}
                        className="mt-4 inline-flex items-center gap-2 rounded bg-[#f8d58b] px-4 py-2 text-xs font-black text-black"
                      >
                        <Sparkles className="h-3.5 w-3.5" /> 投递情报
                      </button>
                    </div>
                  ) : (
                    radar.map((item, index) => (
                      <IntelCard key={item.id} post={item} rank={index + 1} onReact={react} onBookmark={bookmark} />
                    ))
                  )}
                </section>

                <aside
                  className={cn(
                    'space-y-4',
                    mobileSection === 'rails' || mobileSection === 'inbox' ? '' : 'hidden lg:block',
                  )}
                >
                  <div className={cn(mobileSection === 'inbox' ? 'hidden lg:block space-y-4' : 'space-y-4')}>
                    <Panel title="正在升温" icon={TrendingUp}>
                      {rising.slice(0, 5).map((post) => <MiniPost key={post.id} post={post} />)}
                    </Panel>
                    <Panel title="马上焚" icon={Flame}>
                      {burningSoon.slice(0, 5).map((post) => <MiniPost key={post.id} post={post} danger />)}
                    </Panel>
                    <Panel title="深水长瓜" icon={Bookmark}>
                      {sagas.slice(0, 5).map((post) => <MiniPost key={post.id} post={post} />)}
                    </Panel>
                    <Panel title="咖啡榜" icon={Coffee}>
                      {(feed?.coffeeLeaderboard || []).length === 0 ? (
                        <p className="text-xs text-[#d9c7b4]/50">还没有公开咖啡码的线人。</p>
                      ) : feed!.coffeeLeaderboard!.map((item) => (
                        <CoffeeRow key={`${item.authorId}-${item.alias}`} item={item} />
                      ))}
                    </Panel>
                  </div>
                  <Panel title="密信" icon={LockKeyhole}>
                    {(feed?.conversations || []).length === 0 ? (
                      <p className="text-xs text-[#d9c7b4]/50">暂时还没有密信。下完单后双方可以在这里直接对话。</p>
                    ) : (feed?.conversations || []).map((conversation) => (
                      <div key={conversation.id} className="space-y-2 border border-[#f8d58b]/15 bg-black/30 p-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-black" style={{ color: conversation.otherColor }}>{conversation.otherAlias}</span>
                          <span className="text-[10px] text-[#d9c7b4]/45">{formatTime(conversation.lastAt)}</span>
                        </div>
                        <p className="text-xs text-[#d9c7b4]/65">{conversation.lastMessage}</p>
                        <div className="flex gap-2">
                          <input value={messageDraft[conversation.id] || ''} onChange={(e) => setMessageDraft((d) => ({ ...d, [conversation.id]: e.target.value }))} placeholder="回一封密信" className="min-w-0 flex-1 border border-[#f8d58b]/15 bg-black px-2 py-1 text-xs outline-none" />
                          <button onClick={() => sendMessage(conversation.id)} className="bg-[#f8d58b] px-2 text-black"><Send className="h-3.5 w-3.5" /></button>
                        </div>
                      </div>
                    ))}
                  </Panel>
                </aside>
              </main>

              <div className={cn(mobileSection !== 'market' && 'hidden lg:block')}>
                <BlackMarketDistrict
                  listings={filteredMarketSignals}
                  allListings={marketSignals}
                  allCount={marketSignals.length}
                  filter={marketFilter}
                  onFilter={setMarketFilter}
                  onOrder={startOrder}
                  onOpenComposer={() => {
                    setMode('market');
                    setComposerOpen(true);
                  }}
                />
              </div>
            </>
          )}

          {composerOpen && (
            <Composer
              mode={mode}
              setMode={setMode}
              postDraft={postDraft}
              setPostDraft={setPostDraft}
              listingDraft={listingDraft}
              setListingDraft={setListingDraft}
              onClose={() => setComposerOpen(false)}
              onSubmit={publish}
            />
          )}
        </div>
        <MobileSectionTabs active={mobileSection} onChange={setMobileSection} />
      </div>
    </CyberLayout>
  );
};

const MOBILE_TABS: Array<{ key: MobileSection; label: string; icon: React.FC<{ className?: string }> }> = [
  { key: 'radar', label: 'Radar', icon: Radio },
  { key: 'rails', label: '热轨', icon: TrendingUp },
  { key: 'market', label: '暗市', icon: Package2 },
  { key: 'inbox', label: '密信', icon: LockKeyhole },
];

const MobileSectionTabs: React.FC<{ active: MobileSection; onChange: (next: MobileSection) => void }> = ({ active, onChange }) => (
  <nav
    className="lg:hidden fixed inset-x-0 bottom-0 z-40 border-t border-[#f8d58b]/25 bg-[#0a0707]/95 backdrop-blur-md safe-area-bottom"
    aria-label="茶水间分区切换"
  >
    <ul className="grid grid-cols-4">
      {MOBILE_TABS.map(({ key, label, icon: Icon }) => {
        const isActive = active === key;
        return (
          <li key={key}>
            <button
              type="button"
              onClick={() => onChange(key)}
              className={cn(
                'flex w-full flex-col items-center gap-1 px-2 py-2 text-[10px] font-black uppercase tracking-[0.16em] transition-colors',
                isActive ? 'text-[#f8d58b]' : 'text-[#d9c7b4]/55 hover:text-[#f8d58b]/80',
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className={cn('h-4 w-4', isActive && 'drop-shadow-[0_0_6px_rgba(248,213,139,0.5)]')} />
              {label}
            </button>
          </li>
        );
      })}
    </ul>
  </nav>
);

const RadarMetric: React.FC<{ label: string; value: number | string; icon: React.FC<{ className?: string }> }> = ({ label, value, icon: Icon }) => (
  <div className="border border-[#f8d58b]/20 bg-black/35 p-3">
    <Icon className="mb-2 h-4 w-4 text-[#f8d58b]" />
    <p className="text-2xl font-black text-[#f8d58b]">{value}</p>
    <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[#d9c7b4]/50">{label}</p>
  </div>
);

const IntelCard: React.FC<{ post: PantryPost; rank: number; onReact: (post: PantryPost, type: Reaction) => void; onBookmark: (post: PantryPost) => void }> = ({ post, rank, onReact, onBookmark }) => {
  const isBurn = post.visibilityMode === 'EPHEMERAL';
  const isSaga = post.kind === 'thread';
  return (
    <article className={cn('group border bg-[#120b0c] p-4 sm:p-5 transition-colors hover:bg-[#181012]', isBurn ? 'border-[#fb7185]/35' : 'border-[#f8d58b]/20')}>
      <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#d9c7b4]/50">
        <span className="text-[#f8d58b]">#{rank.toString().padStart(2, '0')}</span>
        <span className={cn('border px-1.5 py-0.5', isBurn ? 'border-[#fb7185]/40 text-[#fb7185]' : isSaga ? 'border-[#c4b5fd]/40 text-[#c4b5fd]' : 'border-[#f8d58b]/35 text-[#f8d58b]')}>
          {isBurn ? '马上焚' : isSaga ? '深水长瓜' : '爆料 Radar'}
        </span>
        <span style={{ color: post.aliasColor }} className="max-w-[110px] truncate">{post.anonymousAlias}</span>
        <span>{formatTime(post.createdAt)}</span>
        <span>{formatRemain(post.expiresAt)}</span>
      </div>
      <h2 className="mt-3 text-lg sm:text-xl font-black leading-snug text-[#fff7ed] break-words">{post.title}</h2>
      <p className="mt-2 text-sm leading-6 text-[#d9c7b4]/78 break-words">{post.content}</p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {[
          ['FIRE', '火'],
          ['EYES', '围观'],
          ['BRICK', '拍砖'],
          ['TEA', '递茶'],
          ['SUPPORT', '撑'],
        ].map(([type, label]) => (
          <button key={type} onClick={() => onReact(post, type as Reaction)} className="rounded-full border border-[#f8d58b]/20 px-2.5 py-1 text-[11px] font-bold text-[#f8d58b]/80 hover:border-[#f8d58b]">
            {label}
          </button>
        ))}
        <button onClick={() => onBookmark(post)} className="rounded-full border border-[#f8d58b]/20 px-2.5 py-1 text-[11px] font-bold text-[#f8d58b]/80 hover:border-[#f8d58b]">追更</button>
        <div className="ml-auto flex items-center gap-3 text-[11px] text-[#d9c7b4]/50">
          <span>Radar {radarScore(post)}</span>
          <span>{post.commentCount} 留言</span>
          <span>{post.bookmarkCount || 0} 追更</span>
        </div>
      </div>
      {post.coffee && <CoffeeButton coffee={post.coffee} alias={post.anonymousAlias} />}
    </article>
  );
};

const CoffeeButton: React.FC<{ coffee: { qrUrl: string; note?: string | null }; alias: string }> = ({ coffee, alias }) => (
  <div className="mt-4 flex flex-col gap-2 border border-[#f8d58b]/20 bg-[#f8d58b]/5 p-3 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <p className="text-xs font-black text-[#f8d58b]">请 {alias} 喝咖啡</p>
      <p className="mt-1 text-[11px] text-[#d9c7b4]/55">{coffee.note || '作者公开了收款码，平台不经手资金。'}</p>
    </div>
    <div className="max-w-xs truncate rounded border border-[#f8d58b]/30 bg-black px-3 py-2 text-[11px] text-[#f8d58b]">{coffee.qrUrl}</div>
  </div>
);

const MarketSignalCard: React.FC<{ listing: MarketListing; onOrder: (listing: MarketListing) => void }> = ({ listing, onOrder }) => (
  <article className="border border-[#2dd4bf]/25 bg-[#071313] p-4">
    <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#99f6e4]/60">
      <Package2 className="h-3.5 w-3.5" />
      <span>黑市暗单</span>
      <span>{listing.type === 'SELL' ? '出物' : '求购'}</span>
      <span style={{ color: listing.aliasColor }}>{listing.anonymousAlias}</span>
    </div>
    <div className="mt-3 flex items-start justify-between gap-3">
      <div>
        <h2 className="text-lg font-black text-[#ecfeff]">{listing.title}</h2>
        <p className="mt-2 text-sm leading-6 text-[#ccfbf1]/70">{listing.description}</p>
      </div>
      <p className="shrink-0 text-right text-sm font-black text-[#f8d58b]">{listing.priceText || '私信议价'}</p>
    </div>
    <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-[#ccfbf1]/55">
      <span>{listing.category}</span>
      <span>{listing.condition}</span>
      <span>{formatRemain(listing.expiresAt)}</span>
      {!listing.isMine && <button onClick={() => onOrder(listing)} className="ml-auto rounded bg-[#2dd4bf] px-3 py-1.5 text-xs font-black text-black">下单并密信</button>}
    </div>
  </article>
);

const BlackMarketDistrict: React.FC<{
  listings: MarketListing[];
  allListings: MarketListing[];
  allCount: number;
  filter: 'ALL' | 'SELL' | 'WANTED';
  onFilter: (filter: 'ALL' | 'SELL' | 'WANTED') => void;
  onOrder: (listing: MarketListing) => void;
  onOpenComposer: () => void;
}> = ({ listings, allListings, allCount, filter, onFilter, onOrder, onOpenComposer }) => (
  <section className="relative overflow-hidden border border-[#14b8a6]/30 bg-[radial-gradient(circle_at_top_right,rgba(20,184,166,0.22),transparent_30%),linear-gradient(135deg,#031312,#07090a_70%)] p-4 sm:p-5">
    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#2dd4bf] to-transparent" />
    <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)]">
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.26em] text-[#5eead4]/70">
            <Package2 className="h-4 w-4" /> Black Market
          </div>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-[#ecfeff] sm:text-3xl">黑市暗单</h2>
          <p className="mt-2 text-sm leading-6 text-[#ccfbf1]/68">
            参考暗网的“目录、暗号、私信成交”氛围，但只允许合法二手和求购。平台不托管资金，所有交付走双方确认。
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            ['ALL', '全部', allCount],
            ['SELL', '出物', allListings.filter((item) => item.type === 'SELL').length],
            ['WANTED', '求购', allListings.filter((item) => item.type === 'WANTED').length],
          ].map(([key, label, count]) => (
            <button
              key={key}
              onClick={() => onFilter(key as 'ALL' | 'SELL' | 'WANTED')}
              className={cn(
                'border px-2 py-2 text-xs font-black transition-colors',
                filter === key ? 'border-[#2dd4bf] bg-[#2dd4bf] text-black' : 'border-[#2dd4bf]/20 text-[#99f6e4]/70 hover:border-[#2dd4bf]/60',
              )}
            >
              {label}
              <span className="ml-1 opacity-70">{count}</span>
            </button>
          ))}
        </div>

        <div className="border border-[#2dd4bf]/20 bg-black/35 p-3 text-[11px] leading-5 text-[#99f6e4]/72">
          <p className="font-black text-[#2dd4bf]">交易边界</p>
          <p className="mt-1">禁止违法、灰产、代打卡、账号买卖、银行卡、套现、发票和外挂。发现可举报，后台可下架。</p>
        </div>

        <button onClick={onOpenComposer} className="w-full rounded bg-[#2dd4bf] px-4 py-3 text-sm font-black text-[#031312]">
          发布暗单
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {listings.length === 0 ? (
          <div className="col-span-full border border-dashed border-[#2dd4bf]/25 px-6 py-10 text-center">
            <Package2 className="mx-auto mb-3 h-7 w-7 text-[#2dd4bf]/60" />
            <p className="text-sm font-black text-[#2dd4bf]">当前筛选下没有暗单</p>
            <p className="mx-auto mt-2 max-w-xs text-[11px] leading-5 text-[#99f6e4]/55">
              切到「全部」看看，或自己来发一条出物 / 求购。
            </p>
          </div>
        ) : listings.map((listing) => (
          <DarkListingCard key={listing.id} listing={listing} onOrder={onOrder} />
        ))}
      </div>
    </div>
  </section>
);

const DarkListingCard: React.FC<{ listing: MarketListing; onOrder: (listing: MarketListing) => void }> = ({ listing, onOrder }) => (
  <article className="group border border-[#2dd4bf]/18 bg-black/45 p-4 transition-colors hover:border-[#2dd4bf]/55 hover:bg-[#06201e]">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#99f6e4]/55">
          <span className="border border-[#2dd4bf]/30 px-1.5 py-0.5 text-[#2dd4bf]">{listing.type === 'SELL' ? 'SELL' : 'WANTED'}</span>
          <span style={{ color: listing.aliasColor }}>{listing.anonymousAlias}</span>
          <span>{listing.category}</span>
        </div>
        <h3 className="mt-3 text-base font-black leading-snug text-[#ecfeff]">{listing.title}</h3>
      </div>
      <div className="shrink-0 rounded border border-[#f8d58b]/25 bg-[#f8d58b]/10 px-2 py-1 text-right text-xs font-black text-[#f8d58b]">
        {listing.priceText || '私信'}
      </div>
    </div>
    <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#ccfbf1]/68">{listing.description}</p>
    <div className="mt-4 grid grid-cols-3 gap-2 text-[10px] text-[#99f6e4]/55">
      <span className="border border-[#2dd4bf]/10 bg-black/30 px-2 py-1">{listing.condition || '成色未知'}</span>
      <span className="border border-[#2dd4bf]/10 bg-black/30 px-2 py-1">{formatRemain(listing.expiresAt)}</span>
      <span className="border border-[#2dd4bf]/10 bg-black/30 px-2 py-1">{listing.orderCount} 个询单</span>
    </div>
    <div className="mt-4 flex items-center gap-2">
      <button
        onClick={() => onOrder(listing)}
        disabled={listing.isMine || listing.status !== 'ACTIVE'}
        className="flex-1 rounded bg-[#2dd4bf] px-3 py-2 text-xs font-black text-black disabled:cursor-not-allowed disabled:opacity-35"
      >
        {listing.isMine ? '我的暗单' : '下单并密信'}
      </button>
      <button className="rounded border border-[#2dd4bf]/25 px-3 py-2 text-xs font-black text-[#99f6e4]/70">详情</button>
    </div>
  </article>
);

const Panel: React.FC<{ title: string; icon: React.FC<{ className?: string }>; children: React.ReactNode }> = ({ title, icon: Icon, children }) => (
  <section className="border border-[#f8d58b]/20 bg-[#120b0c] p-4">
    <h3 className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[#f8d58b]"><Icon className="h-4 w-4" /> {title}</h3>
    <div className="space-y-2">{children}</div>
  </section>
);

const MiniPost: React.FC<{ post: PantryPost; danger?: boolean }> = ({ post, danger }) => (
  <div className="border border-[#f8d58b]/10 bg-black/25 p-3">
    <p className={cn('text-xs font-black leading-5', danger ? 'text-[#fb7185]' : 'text-[#fff7ed]')}>{post.title}</p>
    <div className="mt-2 flex items-center justify-between text-[10px] text-[#d9c7b4]/45">
      <span>{post.anonymousAlias}</span>
      <span>{danger ? formatRemain(post.expiresAt) : `Radar ${radarScore(post)}`}</span>
    </div>
  </div>
);

const CoffeeRow: React.FC<{ item: { alias: string; color: string; radarScore: number; coffee: { qrUrl: string; note?: string | null } } }> = ({ item }) => (
  <div className="border border-[#f8d58b]/10 bg-black/25 p-3">
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs font-black" style={{ color: item.color }}>{item.alias}</span>
      <span className="text-[10px] text-[#f8d58b]">Radar {item.radarScore}</span>
    </div>
    <p className="mt-1 text-[11px] text-[#d9c7b4]/55">{item.coffee.note || '公开咖啡码'}</p>
  </div>
);

const Composer: React.FC<{
  mode: ComposerMode;
  setMode: (mode: ComposerMode) => void;
  postDraft: { title: string; content: string; ttlMinutes: number };
  setPostDraft: React.Dispatch<React.SetStateAction<{ title: string; content: string; ttlMinutes: number }>>;
  listingDraft: { type: 'SELL' | 'WANTED'; title: string; priceText: string; category: string; condition: string; description: string };
  setListingDraft: React.Dispatch<React.SetStateAction<{ type: 'SELL' | 'WANTED'; title: string; priceText: string; category: string; condition: string; description: string }>>;
  onClose: () => void;
  onSubmit: () => void;
}> = ({ mode, setMode, postDraft, setPostDraft, listingDraft, setListingDraft, onClose, onSubmit }) => (
  <div className="fixed inset-0 z-50 bg-black/70 p-4 backdrop-blur-sm overflow-y-auto">
    <div className="mx-auto max-w-2xl max-h-[calc(100vh-2rem)] overflow-y-auto border border-[#f8d58b]/30 bg-[#120b0c] p-4 text-[#f7efe3] shadow-2xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#f8d58b]/60">Dispatch</p>
          <h2 className="text-xl font-black">投递一条新情报</h2>
        </div>
        <button onClick={onClose} className="border border-[#f8d58b]/25 px-3 py-1.5 text-xs">关闭</button>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {(Object.keys(MODE_META) as ComposerMode[]).map((key) => (
          <button key={key} onClick={() => setMode(key)} className={cn('border px-2 py-2 text-xs font-black', mode === key ? 'border-[#f8d58b] bg-[#f8d58b] text-black' : 'border-[#f8d58b]/20 text-[#f8d58b]/70')}>
            {MODE_META[key].label}
          </button>
        ))}
      </div>
      {mode === 'market' ? (
        <div className="mt-4 grid gap-3">
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setListingDraft((d) => ({ ...d, type: 'SELL' }))} className={cn('border py-2 text-xs font-black', listingDraft.type === 'SELL' ? 'border-[#2dd4bf] text-[#2dd4bf]' : 'border-[#f8d58b]/20')}>出物</button>
            <button onClick={() => setListingDraft((d) => ({ ...d, type: 'WANTED' }))} className={cn('border py-2 text-xs font-black', listingDraft.type === 'WANTED' ? 'border-[#2dd4bf] text-[#2dd4bf]' : 'border-[#f8d58b]/20')}>求购</button>
          </div>
          {(['title', 'priceText', 'category', 'condition'] as const).map((key) => (
            <input key={key} value={listingDraft[key]} onChange={(e) => setListingDraft((d) => ({ ...d, [key]: e.target.value }))} placeholder={{ title: '暗单标题', priceText: '价格 / 交换方式', category: '分类', condition: '成色' }[key]} className="border border-[#f8d58b]/20 bg-black px-3 py-2 text-sm outline-none" />
          ))}
          <textarea value={listingDraft.description} onChange={(e) => setListingDraft((d) => ({ ...d, description: e.target.value }))} rows={4} placeholder="说明：只允许合法二手/求购。禁止违法、灰产、代打卡、账号买卖。" className="border border-[#f8d58b]/20 bg-black px-3 py-2 text-sm outline-none" />
        </div>
      ) : (
        <div className="mt-4 grid gap-3">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f8d58b]/55">{MODE_META[mode].eyebrow}</div>
          <input value={postDraft.title} onChange={(e) => setPostDraft((d) => ({ ...d, title: e.target.value }))} placeholder="标题要像一句会让人点开的情报" className="border border-[#f8d58b]/20 bg-black px-3 py-2 text-sm outline-none" />
          <textarea value={postDraft.content} onChange={(e) => setPostDraft((d) => ({ ...d, content: e.target.value }))} rows={6} placeholder="写线索、时间线、猜测或求证。不要贴隐私和违法内容。" className="border border-[#f8d58b]/20 bg-black px-3 py-2 text-sm outline-none" />
          {mode === 'burn' && (
            <div className="grid grid-cols-4 gap-2">
              {TTL_OPTIONS.map((item) => (
                <button key={item.value} onClick={() => setPostDraft((d) => ({ ...d, ttlMinutes: item.value }))} className={cn('border py-2 text-xs font-black', postDraft.ttlMinutes === item.value ? 'border-[#fb7185] text-[#fb7185]' : 'border-[#f8d58b]/20')}>{item.label}</button>
              ))}
            </div>
          )}
        </div>
      )}
      <button onClick={onSubmit} className="mt-4 w-full rounded bg-[#f8d58b] py-3 text-sm font-black text-black">写入雷达</button>
    </div>
  </div>
);

export default PantryPage;
