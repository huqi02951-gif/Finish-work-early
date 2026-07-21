import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeftRight,
  Bell,
  Bookmark,
  Check,
  ChevronRight,
  CircleAlert,
  Coffee,
  Eye,
  Flame,
  Inbox,
  LockKeyhole,
  MessageCircle,
  Package2,
  Plus,
  Radio,
  RefreshCw,
  Search,
  Send,
  Shield,
  ShieldCheck,
  Siren,
  Sparkles,
  Store,
  X,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../../components/common/Toast';
import { cn } from '../../../lib/utils';
import { getBestToken, isAuthenticated } from '../../services/authService';
import {
  connectPantrySocket,
  MarketListing,
  OrderStatus,
  pantryApi,
  PantryFeed,
  PantryPost,
  PantryPostKind,
  PantryVisibilityMode,
  ReactionType,
  TradeOrder,
} from '../../services/pantryApi';

type ComposerMode = 'radar' | 'saga' | 'burn' | 'market';
type MobileSection = 'radar' | 'rails' | 'market' | 'inbox';
type MarketView = 'browse' | 'orders';

const TTL_OPTIONS = [
  { label: '30 分钟', value: 30 },
  { label: '2 小时', value: 120 },
  { label: '12 小时', value: 720 },
  { label: '24 小时', value: 1440 },
];

const MODE_META: Record<ComposerMode, { label: string; kind: PantryPostKind; visibility: PantryVisibilityMode }> = {
  radar: { label: '爆料 Radar', kind: 'gossip', visibility: 'PERMANENT' },
  saga: { label: '深水长瓜', kind: 'thread', visibility: 'PERMANENT' },
  burn: { label: '马上焚', kind: 'burn', visibility: 'EPHEMERAL' },
  market: { label: '发布暗单', kind: 'thread', visibility: 'PERMANENT' },
};

const ORDER_STEPS = ['发起', '接单', '私信确认', '当面交付', '双方完成'];
const MARKET_ASSETS = ['/assets/pantry/pothos-barter.png', '/assets/pantry/cushion-barter.png'];

function formatRemain(expiresAt?: string | null) {
  if (!expiresAt) return '持续追踪';
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return '已焚毁';
  const mins = Math.ceil(ms / 60_000);
  if (mins < 60) return `${mins} 分钟后焚`;
  const hours = Math.ceil(mins / 60);
  if (hours < 24) return `${hours} 小时后焚`;
  return `${Math.ceil(hours / 24)} 天后到期`;
}

function formatTime(value: string) {
  return new Date(value).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function radarScore(post: PantryPost) {
  return post.radarScore ?? Math.max(
    1,
    post.heatScore + post.reactionCount * 2 + post.commentCount * 4 + (post.bookmarkCount || 0) * 5,
  );
}

function previewFeed(): PantryFeed {
  const now = Date.now();
  const posts: PantryPost[] = [
    {
      id: 9101,
      title: '某部门二季度奖金延迟发放，两个口径正在互相打架',
      content: '目前只有两个独立信源，仍待核实。请只补充时间线和公开口径，不要上传名单、证件或内部文件。',
      kind: 'gossip',
      visibilityMode: 'PERMANENT',
      expiresAt: null,
      anonymousAlias: 'Radar_4F7A',
      aliasColor: '#9ee870',
      heatScore: 82,
      reactionCount: 27,
      bookmarkCount: 19,
      commentCount: 18,
      radarScore: 328,
      coffee: null,
      createdAt: new Date(now - 2 * 60_000).toISOString(),
      updatedAt: new Date(now - 2 * 60_000).toISOString(),
      tags: ['薪资实况', '待核实'],
      authorId: 101,
    },
    {
      id: 9102,
      title: '某城商行新系统上线第二天崩了，柜面排队到午后',
      content: '已收到三段相互吻合的时间线，但原因仍没有正式说明。请补充影响范围，不要把责任推给具体个人。',
      kind: 'gossip',
      visibilityMode: 'PERMANENT',
      expiresAt: null,
      anonymousAlias: '暗号_8C3D',
      aliasColor: '#f0c978',
      heatScore: 76,
      reactionCount: 31,
      bookmarkCount: 14,
      commentCount: 24,
      radarScore: 354,
      coffee: null,
      createdAt: new Date(now - 8 * 60_000).toISOString(),
      updatedAt: new Date(now - 4 * 60_000).toISOString(),
      tags: ['网点避雷', '系统崩溃'],
      authorId: 102,
    },
    {
      id: 9103,
      title: '长期追更：组织调整传闻的五条时间线',
      content: '只整理可交叉验证的信息。没有证据的猜测会单独标注，涉及个人隐私的内容会被删除。',
      kind: 'thread',
      visibilityMode: 'PERMANENT',
      expiresAt: null,
      anonymousAlias: '茶水间守夜人',
      aliasColor: '#9ee870',
      heatScore: 91,
      reactionCount: 42,
      bookmarkCount: 36,
      commentCount: 36,
      radarScore: 492,
      coffee: null,
      createdAt: new Date(now - 15 * 60_000).toISOString(),
      updatedAt: new Date(now - 1 * 60_000).toISOString(),
      tags: ['巨瓜追踪', '持续更新'],
      authorId: 103,
    },
    {
      id: 9104,
      title: '马上焚：今晚谁还在被同一套材料反复折腾？',
      content: '这条会自动消失。只讨论流程问题，不贴客户信息和业务截图。',
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
      authorId: 104,
    },
  ];
  const listings: MarketListing[] = [
    {
      id: 8101,
      type: 'SELL',
      title: '绿萝，状态很好',
      description: '换一杯中杯咖啡即可，工作日午休在公共区域当面交付。',
      category: '绿植',
      condition: '状态良好',
      priceText: '想换：一杯咖啡',
      priceCents: null,
      status: 'ACTIVE',
      anonymousAlias: '绿影_27',
      aliasColor: '#9ee870',
      sellerId: 201,
      isMine: false,
      orderCount: 4,
      expiresAt: new Date(now + 9 * 24 * 3600_000).toISOString(),
      createdAt: new Date(now - 34 * 60_000).toISOString(),
      updatedAt: new Date(now - 34 * 60_000).toISOString(),
    },
    {
      id: 8102,
      type: 'SELL',
      title: '办公靠垫，轻微使用',
      description: '想换一个干净鼠标垫，双方在公共区域看实物后确认。',
      category: '办公用品',
      condition: '轻微使用',
      priceText: '想换：鼠标垫',
      priceCents: null,
      status: 'ACTIVE',
      anonymousAlias: '云栖_11',
      aliasColor: '#f0c978',
      sellerId: 202,
      isMine: false,
      orderCount: 2,
      expiresAt: new Date(now + 6 * 24 * 3600_000).toISOString(),
      createdAt: new Date(now - 2 * 3600_000).toISOString(),
      updatedAt: new Date(now - 2 * 3600_000).toISOString(),
    },
  ];
  return {
    identity: {
      id: 0,
      userId: 0,
      alias: 'Radar_DEMO',
      color: '#9ee870',
      status: 'PREVIEW',
      coffeePublic: false,
      reputation: 88,
    },
    posts,
    listings,
    conversations: [
      {
        id: 7101,
        otherUserId: 201,
        otherAlias: '绿影_27',
        otherColor: '#9ee870',
        listingId: 8101,
        orderId: 6101,
        lastMessage: '周三午休可以在公共区域看实物。',
        lastAt: new Date(now - 4 * 60_000).toISOString(),
        latestMessage: null,
        unreadCount: 1,
      },
    ],
    orders: [
      {
        id: 6101,
        listingId: 8101,
        listingTitle: '绿萝，状态很好',
        buyerId: 0,
        sellerId: 201,
        counterpartyAlias: '绿影_27',
        status: 'ACCEPTED',
        note: '想用一杯咖啡交换',
        offPlatformNote: null,
        disputeReason: null,
        createdAt: new Date(now - 14 * 60_000).toISOString(),
        updatedAt: new Date(now - 5 * 60_000).toISOString(),
      },
    ],
    radar: [...posts].sort((a, b) => radarScore(b) - radarScore(a)),
    rising: posts.slice(0, 3),
    burningSoon: posts.filter((post) => post.expiresAt),
    sagas: posts.filter((post) => post.kind === 'thread'),
    marketSignals: listings,
    coffeeLeaderboard: [],
  };
}

const PantryPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [feed, setFeed] = useState<PantryFeed | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [previewOverride, setPreviewOverride] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [mode, setMode] = useState<ComposerMode>('radar');
  const [postDraft, setPostDraft] = useState({ title: '', content: '', ttlMinutes: 30 });
  const [listingDraft, setListingDraft] = useState({
    type: 'SELL' as 'SELL' | 'WANTED',
    title: '',
    priceText: '',
    category: '办公用品',
    condition: '九成新',
    description: '',
  });
  const [coffeeDraft, setCoffeeDraft] = useState({ qrUrl: '', note: '', public: false });
  const [coffeeOpen, setCoffeeOpen] = useState(false);
  const [marketFilter, setMarketFilter] = useState<'ALL' | 'SELL' | 'WANTED'>('ALL');
  const [marketView, setMarketView] = useState<MarketView>('browse');
  const [messageDraft, setMessageDraft] = useState<Record<number, string>>({});
  const [mobileSection, setMobileSection] = useState<MobileSection>('radar');
  const [followedIds, setFollowedIds] = useState<number[]>([]);
  const authed = isAuthenticated();

  const loadFeed = async (forcePreview = previewOverride) => {
    if (!getBestToken() || forcePreview) {
      setFeed(previewFeed());
      setLoadError('');
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError('');
    try {
      const payload = await pantryApi.getFeed();
      setFeed(payload);
      setCoffeeDraft({
        qrUrl: payload.identity.coffeeQrUrl || '',
        note: payload.identity.coffeeNote || '',
        public: Boolean(payload.identity.coffeePublic),
      });
      setFollowedIds(payload.posts.filter((post) => post.isBookmarked).map((post) => post.id));
    } catch (error) {
      setFeed(null);
      setLoadError(error instanceof Error ? error.message : '茶水间加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadFeed();
    const socket = connectPantrySocket();
    if (!socket) return undefined;
    const refresh = () => void loadFeed(false);
    socket.on('feed:update', refresh);
    socket.on('conversation:update', refresh);
    socket.on('order:update', refresh);
    return () => {
      socket.disconnect();
    };
  }, []);

  const radar = useMemo(
    () => feed?.radar?.length
      ? feed.radar
      : [...(feed?.posts || [])].sort((a, b) => radarScore(b) - radarScore(a)),
    [feed],
  );
  const rising = useMemo(() => feed?.rising?.length ? feed.rising : radar.slice(0, 4), [feed, radar]);
  const sagas = useMemo(
    () => feed?.sagas?.length ? feed.sagas : (feed?.posts || []).filter((post) => post.kind === 'thread'),
    [feed],
  );
  const marketSignals = useMemo(
    () => feed?.marketSignals?.length ? feed.marketSignals : feed?.listings || [],
    [feed],
  );
  const filteredMarketSignals = useMemo(
    () => marketFilter === 'ALL' ? marketSignals : marketSignals.filter((item) => item.type === marketFilter),
    [marketFilter, marketSignals],
  );
  const unreadCount = useMemo(
    () => (feed?.conversations || []).reduce((sum, item) => sum + (item.unreadCount || 0), 0),
    [feed],
  );

  const requireLogin = (action: string) => {
    toast.warning(`${action}需要先登录`);
    navigate('/login');
    return false;
  };

  const openComposer = (nextMode: ComposerMode) => {
    if (!authed) {
      requireLogin(nextMode === 'market' ? '发布暗单' : '投递情报');
      return;
    }
    setMode(nextMode);
    setComposerOpen(true);
  };

  const publish = async () => {
    if (!authed) return void requireLogin('发布');
    if (mode === 'market') return void publishListing();
    if (!postDraft.title.trim() || !postDraft.content.trim()) {
      toast.warning('标题和正文都要写');
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
      await loadFeed(false);
      toast.success('情报已进入雷达');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '发布失败');
    }
  };

  const publishListing = async () => {
    if (!authed) return void requireLogin('发布暗单');
    if (!listingDraft.title.trim() || !listingDraft.description.trim() || !listingDraft.priceText.trim()) {
      toast.warning('物品、说明和想换的东西都要写');
      return;
    }
    try {
      await pantryApi.createListing({ ...listingDraft, expiresInDays: 14 });
      setListingDraft({
        type: 'SELL',
        title: '',
        priceText: '',
        category: '办公用品',
        condition: '九成新',
        description: '',
      });
      setComposerOpen(false);
      await loadFeed(false);
      toast.success('暗单已进入置换台');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '暗单发布失败');
    }
  };

  const react = async (post: PantryPost, type: ReactionType) => {
    if (!authed) return void requireLogin('参与讨论');
    try {
      await pantryApi.react(post.id, type);
      await loadFeed(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '互动失败');
    }
  };

  const follow = async (post: PantryPost) => {
    if (!authed) return void requireLogin('关注线索');
    try {
      const result = await pantryApi.bookmark(post.id);
      setFollowedIds((current) => current.includes(post.id) ? current : [...current, post.id]);
      toast.success(result.alreadyBookmarked ? '这条线索已在追踪中' : '已加入追踪');
      await loadFeed(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '关注失败');
    }
  };

  const reportPost = async (post: PantryPost) => {
    if (!authed) return void requireLogin('举报');
    try {
      await pantryApi.report({
        targetType: 'POST',
        targetId: post.id,
        reason: '疑似隐私或违规内容',
        detail: '由茶水间信息流快捷举报提交，请管理员复核。',
      });
      toast.success('已提交复核，不会向发帖人暴露你的身份');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '举报失败');
    }
  };

  const startOrder = async (listing: MarketListing) => {
    if (!authed) return void requireLogin('发起置换');
    try {
      await pantryApi.createOrder(listing.id, `希望用「${listing.priceText || '约定物品'}」进行置换。`);
      setMarketView('orders');
      await loadFeed(false);
      toast.success('置换请求已送达，已建立匿名密信');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '置换请求失败');
    }
  };

  const updateOrder = async (order: TradeOrder, status: OrderStatus) => {
    if (!authed) return void requireLogin('更新置换状态');
    try {
      const note = status === 'PAID_OFF_PLATFORM'
        ? '双方已在公共区域确认并完成实物交付。'
        : status === 'DISPUTED'
          ? '交易信息或实物与约定不符，请平台协助复核。'
          : undefined;
      await pantryApi.updateOrderStatus(order.id, status, note);
      await loadFeed(false);
      toast.success('置换状态已更新');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '状态更新失败');
    }
  };

  const sendMessage = async (conversationId: number) => {
    const content = (messageDraft[conversationId] || '').trim();
    if (!content) return;
    if (!authed) return void requireLogin('发送密信');
    try {
      await pantryApi.sendMessage(conversationId, content);
      setMessageDraft((previous) => ({ ...previous, [conversationId]: '' }));
      await loadFeed(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '密信发送失败');
    }
  };

  const saveCoffee = async () => {
    if (!authed) return void requireLogin('保存咖啡资料');
    try {
      await pantryApi.updateCoffeeProfile({
        coffeeQrUrl: coffeeDraft.qrUrl,
        coffeeNote: coffeeDraft.note,
        coffeePublic: coffeeDraft.public,
      });
      setCoffeeOpen(false);
      await loadFeed(false);
      toast.success('咖啡资料已更新');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '保存失败');
    }
  };

  const stamp = `${feed?.identity.alias || 'Radar_DEMO'} · ${new Date().toLocaleDateString('zh-CN')}`;

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#070807] font-mono text-[#f4efe4] selection:bg-[#9ee870]/30">
      <PantryHeader
        alias={feed?.identity.alias || 'Radar_DEMO'}
        authed={authed}
        unreadCount={unreadCount}
        onLogin={() => navigate('/login')}
      />

      <div className="mx-auto w-full max-w-[1120px] px-3 pb-28 pt-4 sm:px-5 lg:pb-24">
        {!authed && (
          <ReadOnlyNotice onLogin={() => navigate('/login')} />
        )}

        {loading ? (
          <div className="flex min-h-[50vh] flex-col items-center justify-center text-[#9ee870]/65">
            <RefreshCw className="mb-3 h-6 w-6 animate-spin" />
            <p className="text-xs font-bold tracking-[0.18em]">正在接入匿名雷达</p>
          </div>
        ) : loadError && !feed ? (
          <LoadFailure
            message={loadError}
            onRetry={() => void loadFeed(false)}
            onPreview={() => {
              setPreviewOverride(true);
              void loadFeed(true);
            }}
          />
        ) : (
          <div className="relative">
            <WatermarkLayer stamp={stamp} />
            <div className="relative z-10">
              {mobileSection === 'radar' && (
                <RadarView
                  posts={radar}
                  listings={marketSignals}
                  followedIds={followedIds}
                  authed={authed}
                  onOpenPost={(post) => authed ? navigate(`/bbs/pantry/thread/${post.id}`) : requireLogin('查看完整讨论')}
                  onReact={react}
                  onFollow={follow}
                  onReport={reportPost}
                  onCompose={() => openComposer('radar')}
                  onOpenMarket={() => setMobileSection('market')}
                />
              )}

              {mobileSection === 'rails' && (
                <TrackingView
                  posts={[...sagas, ...rising.filter((post) => !sagas.some((item) => item.id === post.id))]}
                  followedIds={followedIds}
                  onFollow={follow}
                  onOpenPost={(post) => authed ? navigate(`/bbs/pantry/thread/${post.id}`) : requireLogin('查看完整讨论')}
                />
              )}

              {mobileSection === 'market' && (
                <MarketViewPanel
                  listings={filteredMarketSignals}
                  allListings={marketSignals}
                  orders={feed?.orders || []}
                  identityUserId={feed?.identity.userId || 0}
                  filter={marketFilter}
                  view={marketView}
                  onFilter={setMarketFilter}
                  onView={setMarketView}
                  onOrder={startOrder}
                  onUpdateOrder={updateOrder}
                  onCompose={() => openComposer('market')}
                  onOpenInbox={() => setMobileSection('inbox')}
                />
              )}

              {mobileSection === 'inbox' && (
                <InboxView
                  conversations={feed?.conversations || []}
                  messageDraft={messageDraft}
                  onDraftChange={(id, value) => setMessageDraft((previous) => ({ ...previous, [id]: value }))}
                  onSend={sendMessage}
                  onCoffee={() => authed ? setCoffeeOpen(true) : requireLogin('设置咖啡资料')}
                />
              )}
            </div>
          </div>
        )}
      </div>

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

      {coffeeOpen && (
        <CoffeeSettings
          draft={coffeeDraft}
          onChange={setCoffeeDraft}
          onClose={() => setCoffeeOpen(false)}
          onSave={saveCoffee}
        />
      )}

      <MobileSectionTabs active={mobileSection} unreadCount={unreadCount} onChange={setMobileSection} />
    </div>
  );
};

const PantryHeader: React.FC<{
  alias: string;
  authed: boolean;
  unreadCount: number;
  onLogin: () => void;
}> = ({ alias, authed, unreadCount, onLogin }) => (
  <header className="sticky top-0 z-40 border-b border-[#9ee870]/18 bg-[#070807]/96 px-3 backdrop-blur-xl sm:px-5">
    <div className="mx-auto flex min-h-16 max-w-[1120px] items-center justify-between gap-3 py-2">
      <Link to="/profile" className="group flex min-w-0 items-center gap-3" aria-label="返回我的">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#9ee870]/45 bg-[#10200f] text-[#9ee870] transition-colors group-hover:border-[#9ee870]">
          <Radio className="h-5 w-5" />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-lg font-black tracking-[0.08em] text-[#9ee870]">地下茶水间</span>
          <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#f4efe4]/52">
            对同事匿名 <span>·</span> 对平台可审计 <ShieldCheck className="h-3 w-3 text-[#9ee870]" />
          </span>
        </span>
      </Link>
      {authed ? (
        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden items-center gap-1.5 text-xs text-[#f4efe4]/58 sm:flex">
            <Radio className="h-3.5 w-3.5 text-[#9ee870]" /> {alias}
          </span>
          <span className="border border-[#9ee870]/30 px-2 py-1 text-[10px] font-black tracking-[0.12em] text-[#9ee870]">LIVE</span>
          <span className="relative flex h-9 min-w-9 items-center justify-center border border-[#f0c978]/30 px-2 text-[#f0c978]">
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && <span className="ml-1 text-[10px] font-black">{unreadCount}</span>}
          </span>
        </div>
      ) : (
        <button onClick={onLogin} className="min-h-11 shrink-0 border border-[#9ee870]/35 px-3 text-xs font-black text-[#9ee870]">登录进入</button>
      )}
    </div>
  </header>
);

const ReadOnlyNotice: React.FC<{ onLogin: () => void }> = ({ onLogin }) => (
  <div className="mb-4 flex items-center gap-3 border border-[#f0c978]/24 bg-[#151109] px-3 py-3 text-xs text-[#f0c978]">
    <Eye className="h-4 w-4 shrink-0" />
    <p className="min-w-0 flex-1 leading-5">当前为只读预览。登录后才能投递、追踪、评论、密信和发起置换。</p>
    <button onClick={onLogin} className="min-h-10 shrink-0 border border-[#f0c978]/45 px-3 font-black">去登录</button>
  </div>
);

const RadarView: React.FC<{
  posts: PantryPost[];
  listings: MarketListing[];
  followedIds: number[];
  authed: boolean;
  onOpenPost: (post: PantryPost) => void;
  onReact: (post: PantryPost, type: ReactionType) => void;
  onFollow: (post: PantryPost) => void;
  onReport: (post: PantryPost) => void;
  onCompose: () => void;
  onOpenMarket: () => void;
}> = ({ posts, listings, followedIds, authed, onOpenPost, onReact, onFollow, onReport, onCompose, onOpenMarket }) => (
  <main>
    <section className="mb-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-lg font-black tracking-[0.08em] text-[#9ee870]">
            今日雷达 <span className="h-1.5 w-1.5 rounded-full bg-[#9ee870]" />
            <span className="text-[10px] tracking-[0.18em]">LIVE · 实时更新</span>
          </p>
          <p className="mt-1 text-[10px] text-[#f4efe4]/42">未核实内容不等于事实，补充线索也要守住隐私边界。</p>
        </div>
        <button onClick={onCompose} className="hidden min-h-11 items-center gap-2 bg-[#f0c978] px-4 text-xs font-black text-[#11120f] sm:flex">
          <Plus className="h-4 w-4" /> 投递情报
        </button>
      </div>
      <div className="grid grid-cols-3 divide-x divide-[#f0c978]/16 border border-[#f0c978]/18 bg-[#0c0d0b]">
        <RadarTopic icon={Siren} label="网点避雷" count="23 条" />
        <RadarTopic icon={ArrowLeftRight} label="薪资实况" count="18 条" />
        <RadarTopic icon={Flame} label="巨瓜追踪" count="7 条" />
      </div>
    </section>

    {posts.length === 0 ? (
      <EmptyRadar onCompose={onCompose} />
    ) : (
      <div className="space-y-3">
        {posts.map((post, index) => (
          <React.Fragment key={post.id}>
            <IntelCard
              post={post}
              followed={followedIds.includes(post.id) || Boolean(post.isBookmarked)}
              onOpen={() => onOpenPost(post)}
              onReact={onReact}
              onFollow={onFollow}
              onReport={onReport}
            />
            {index === 1 && listings.length > 0 && (
              <MarketPreview listings={listings.slice(0, 2)} onOpen={onOpenMarket} />
            )}
            {index === 0 && (
              <button onClick={onCompose} className="flex min-h-16 w-full items-center gap-3 border border-[#f0c978]/60 bg-[#11120f] px-4 text-left transition-colors hover:bg-[#17160f]">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#1e3518] text-[#9ee870]"><Sparkles className="h-5 w-5" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-black text-[#f4efe4]">投递情报</span>
                  <span className="mt-1 block truncate text-[10px] text-[#f4efe4]/50">写线索、贴图或传证据，匿名投稿</span>
                </span>
                <Send className="h-5 w-5 text-[#f0c978]" />
              </button>
            )}
          </React.Fragment>
        ))}
      </div>
    )}

    <button onClick={onCompose} className="mt-4 flex min-h-16 w-full items-center gap-3 border border-[#f0c978]/60 bg-[#11120f] px-4 text-left transition-colors hover:bg-[#17160f]">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#1e3518] text-[#9ee870]"><Sparkles className="h-5 w-5" /></span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-black text-[#f4efe4]">投递情报</span>
        <span className="mt-1 block truncate text-[10px] text-[#f4efe4]/50">写线索、贴图或传证据，匿名投稿</span>
      </span>
      <Send className="h-5 w-5 text-[#f0c978]" />
    </button>

    <div className="mt-3 flex items-start gap-2 border border-[#f4efe4]/10 bg-[#0d0e0c] px-3 py-2 text-[10px] leading-5 text-[#f4efe4]/42">
      <Shield className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#f0c978]" />
      禁止发布隐私、证件、客户资料、内部文件和违法内容。违规内容将被处理并保留审计记录。
    </div>
    {!authed && <p className="mt-2 text-center text-[10px] text-[#f4efe4]/32">只读预览不会把任何操作写入数据库。</p>}
  </main>
);

const RadarTopic: React.FC<{ icon: React.FC<{ className?: string }>; label: string; count: string }> = ({ icon: Icon, label, count }) => (
  <div className="flex min-h-[76px] flex-col items-center justify-center px-2 py-3 text-center">
    <Icon className="mb-1.5 h-4 w-4 text-[#f0c978]" />
    <span className="text-[11px] font-black text-[#f0c978] sm:text-xs">{label}</span>
    <span className="mt-1 text-[9px] text-[#f4efe4]/38">{count}新信号</span>
  </div>
);

const IntelCard: React.FC<{
  post: PantryPost;
  followed: boolean;
  onOpen: () => void;
  onReact: (post: PantryPost, type: ReactionType) => void;
  onFollow: (post: PantryPost) => void;
  onReport: (post: PantryPost) => void;
}> = ({ post, followed, onOpen, onReact, onFollow, onReport }) => {
  const isBurn = post.visibilityMode === 'EPHEMERAL';
  const confidence = Math.min(96, Math.max(56, Math.round(radarScore(post) / 5)));
  return (
    <article className={cn('border bg-[#0c0d0b] p-4 sm:p-5', isBurn ? 'border-[#fb7185]/35' : 'border-[#f0c978]/20')}>
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-current bg-[#10200f]" style={{ color: post.aliasColor }}>
          {post.kind === 'thread' ? <Bookmark className="h-4 w-4" /> : isBurn ? <Flame className="h-4 w-4" /> : <Radio className="h-4 w-4" />}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="max-w-[150px] truncate text-sm font-black" style={{ color: post.aliasColor }}>{post.anonymousAlias}</span>
            <span className="bg-[#163014] px-1.5 py-0.5 text-[10px] font-black text-[#9ee870]">可信 {confidence}%</span>
          </div>
          <p className="mt-1 text-[10px] text-[#f4efe4]/42">{formatTime(post.createdAt)} · {post.tags[0] || '情报雷达'}</p>
        </div>
        <button onClick={() => onFollow(post)} className={cn('min-h-10 shrink-0 border px-3 text-[10px] font-black', followed ? 'border-[#9ee870]/35 bg-[#163014] text-[#9ee870]' : 'border-[#f0c978]/50 text-[#f0c978]')}>
          {followed ? <span className="flex items-center gap-1"><Check className="h-3.5 w-3.5" /> 已关注</span> : <span className="flex items-center gap-1"><Plus className="h-3.5 w-3.5" /> 关注线索</span>}
        </button>
      </div>

      <button onClick={onOpen} className="mt-4 block w-full text-left">
        <span className={cn('mr-2 inline-block border px-2 py-1 align-middle text-[10px] font-black', isBurn ? 'border-[#fb7185]/55 text-[#fb7185]' : 'border-[#f0c978]/48 text-[#f0c978]')}>
          {isBurn ? '马上焚' : '未核实'}
        </span>
        <h2 className="mt-3 text-[17px] font-black leading-7 tracking-tight text-[#f8f4ec] sm:text-xl">{post.title}</h2>
        <p className="mt-2 line-clamp-3 text-[13px] leading-6 text-[#f4efe4]/62 sm:text-sm">{post.content}</p>
      </button>

      <div className="mt-3 flex flex-wrap gap-2">
        {post.tags.slice(0, 3).map((tag) => <span key={tag} className="text-[10px] font-bold text-[#f0c978]">#{tag}</span>)}
        {post.expiresAt && <span className="text-[10px] font-bold text-[#fb7185]">{formatRemain(post.expiresAt)}</span>}
      </div>

      <div className="mt-4 flex items-center border-t border-[#f0c978]/12 pt-3 text-xs text-[#f4efe4]/48">
        <button onClick={() => onReact(post, 'FIRE')} className="flex min-h-10 items-center gap-1.5 pr-5 text-[#f0c978]"><Flame className="h-4 w-4" /> {post.reactionCount}</button>
        <button onClick={onOpen} className="flex min-h-10 items-center gap-1.5 px-3"><MessageCircle className="h-4 w-4" /> {post.commentCount}</button>
        <span className="mx-2 h-4 w-px bg-[#f4efe4]/12" />
        <span className="text-[10px]">Radar {radarScore(post)}</span>
        <button onClick={() => onReport(post)} className="ml-auto flex min-h-10 items-center gap-1.5 pl-3"><Shield className="h-4 w-4" /> 举报</button>
      </div>
    </article>
  );
};

const MarketPreview: React.FC<{ listings: MarketListing[]; onOpen: () => void }> = ({ listings, onOpen }) => (
  <section className="border border-[#f0c978]/70 bg-[#0d0e0c] p-3">
    <button onClick={onOpen} className="mb-3 flex min-h-10 w-full items-center gap-2 text-left">
      <Store className="h-4 w-4 text-[#9ee870]" />
      <span className="text-xs font-black tracking-[0.08em] text-[#9ee870]">暗市正在置换</span>
      <span className="hidden text-[10px] text-[#f4efe4]/38 sm:inline">仅限合法闲置物品 · 不支持现金交易</span>
      <span className="ml-auto flex items-center gap-1 text-[10px] font-black text-[#f0c978]">进入暗市 <ChevronRight className="h-3.5 w-3.5" /></span>
    </button>
    <div className="grid grid-cols-2 gap-2">
      {listings.map((listing, index) => (
        <button key={listing.id} onClick={onOpen} className="flex min-h-[76px] items-center gap-2 overflow-hidden border border-[#f0c978]/14 bg-[#11120f] p-2 text-left">
          <img src={MARKET_ASSETS[index % MARKET_ASSETS.length]} alt="" className="h-14 w-14 shrink-0 object-cover" />
          <span className="min-w-0">
            <span className="block truncate text-xs font-black text-[#f4efe4]">{listing.title}</span>
            <span className="mt-1 block truncate text-[9px] text-[#9ee870]">{listing.priceText || '私信约定置换物'}</span>
          </span>
        </button>
      ))}
    </div>
  </section>
);

const TrackingView: React.FC<{
  posts: PantryPost[];
  followedIds: number[];
  onFollow: (post: PantryPost) => void;
  onOpenPost: (post: PantryPost) => void;
}> = ({ posts, followedIds, onFollow, onOpenPost }) => (
  <main>
    <SectionHeading eyebrow="Signal tracking" title="线索追踪" description="把零散爆料整理成时间线，更新会回到你的追踪页。" />
    <div className="space-y-3">
      {posts.map((post, index) => (
        <article key={post.id} className="border border-[#9ee870]/18 bg-[#0c0d0b] p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#9ee870]/35 text-[#9ee870]">{index + 1}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-black text-[#f4efe4]">{post.title}</p>
              <p className="mt-1 text-[10px] text-[#f4efe4]/38">最新更新 {formatTime(post.updatedAt)} · {post.commentCount} 条补充</p>
            </div>
            <button onClick={() => onFollow(post)} className="min-h-10 border border-[#f0c978]/35 px-3 text-[10px] font-black text-[#f0c978]">
              {followedIds.includes(post.id) || post.isBookmarked ? '已关注' : '关注'}
            </button>
          </div>
          <button onClick={() => onOpenPost(post)} className="mt-4 w-full border-l border-[#9ee870]/35 pl-4 text-left">
            <p className="line-clamp-2 text-xs leading-6 text-[#f4efe4]/58">{post.content}</p>
            <span className="mt-3 inline-flex items-center gap-1 text-[10px] font-black text-[#9ee870]">查看证据时间线 <ChevronRight className="h-3 w-3" /></span>
          </button>
        </article>
      ))}
      {posts.length === 0 && <EmptyState icon={Search} title="还没有追踪中的线索" detail="在雷达页关注一条线索，它的后续会出现在这里。" />}
    </div>
  </main>
);

const MarketViewPanel: React.FC<{
  listings: MarketListing[];
  allListings: MarketListing[];
  orders: TradeOrder[];
  identityUserId: number;
  filter: 'ALL' | 'SELL' | 'WANTED';
  view: MarketView;
  onFilter: (filter: 'ALL' | 'SELL' | 'WANTED') => void;
  onView: (view: MarketView) => void;
  onOrder: (listing: MarketListing) => void;
  onUpdateOrder: (order: TradeOrder, status: OrderStatus) => void;
  onCompose: () => void;
  onOpenInbox: () => void;
}> = ({ listings, allListings, orders, identityUserId, filter, view, onFilter, onView, onOrder, onUpdateOrder, onCompose, onOpenInbox }) => (
  <main>
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#f0c978]/55">P2P barter desk</p>
        <h1 className="mt-1 text-2xl font-black tracking-tight text-[#f0c978]">暗市置换</h1>
        <p className="mt-1 text-[10px] leading-5 text-[#f4efe4]/44">仅限合法闲置物品 · 不支持现金交易</p>
      </div>
      <button onClick={onCompose} className="flex min-h-11 shrink-0 items-center gap-2 bg-[#f0c978] px-4 text-xs font-black text-[#11120f]"><Plus className="h-4 w-4" /> 发布暗单</button>
    </div>

    <div className="mb-4 grid grid-cols-2 border-y border-[#f0c978]/16">
      <button onClick={() => onView('browse')} className={cn('min-h-12 border-b-2 text-sm font-black', view === 'browse' ? 'border-[#9ee870] text-[#9ee870]' : 'border-transparent text-[#f4efe4]/45')}>逛置换</button>
      <button onClick={() => onView('orders')} className={cn('min-h-12 border-b-2 text-sm font-black', view === 'orders' ? 'border-[#9ee870] text-[#9ee870]' : 'border-transparent text-[#f4efe4]/45')}>我的订单 {orders.length > 0 && <span className="ml-1 text-[10px]">{orders.length}</span>}</button>
    </div>

    {view === 'browse' ? (
      <>
        <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
          {([
            ['ALL', '全部', allListings.length],
            ['SELL', '可换', allListings.filter((item) => item.type === 'SELL').length],
            ['WANTED', '求换', allListings.filter((item) => item.type === 'WANTED').length],
          ] as const).map(([key, label, count]) => (
            <button key={key} onClick={() => onFilter(key)} className={cn('min-h-10 shrink-0 border px-4 text-xs font-black', filter === key ? 'border-[#9ee870] bg-[#163014] text-[#9ee870]' : 'border-[#f4efe4]/12 text-[#f4efe4]/48')}>
              {label} {count}
            </button>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {listings.map((listing, index) => <DarkListingCard key={listing.id} listing={listing} image={MARKET_ASSETS[index % MARKET_ASSETS.length]} onOrder={onOrder} />)}
          {listings.length === 0 && <div className="sm:col-span-2"><EmptyState icon={Package2} title="当前没有可见暗单" detail="换个筛选，或者发布一件合法闲置物品。" /></div>}
        </div>
        <MarketSafety />
      </>
    ) : (
      <div className="space-y-3">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} identityUserId={identityUserId} onUpdate={onUpdateOrder} onOpenInbox={onOpenInbox} />
        ))}
        {orders.length === 0 && <EmptyState icon={ArrowLeftRight} title="还没有置换订单" detail="从一件真正需要的闲置开始，发起后会自动建立匿名密信。" />}
        <MarketSafety />
      </div>
    )}
  </main>
);

const DarkListingCard: React.FC<{ listing: MarketListing; image: string; onOrder: (listing: MarketListing) => void }> = ({ listing, image, onOrder }) => (
  <article className="overflow-hidden border border-[#f0c978]/18 bg-[#0c0d0b]">
    <div className="grid grid-cols-[112px_1fr]">
      <img src={image} alt={listing.title} className="h-full min-h-36 w-full object-cover" />
      <div className="min-w-0 p-3">
        <div className="flex items-start justify-between gap-2">
          <span className="border border-[#9ee870]/28 px-1.5 py-0.5 text-[9px] font-black text-[#9ee870]">{listing.type === 'SELL' ? '可换' : '求换'}</span>
          <span className="text-[9px] text-[#f4efe4]/32">{formatRemain(listing.expiresAt)}</span>
        </div>
        <h2 className="mt-2 line-clamp-2 text-sm font-black leading-6 text-[#f4efe4]">{listing.title}</h2>
        <p className="mt-1 text-[10px] text-[#f4efe4]/42">{listing.condition} · {listing.anonymousAlias}</p>
        <p className="mt-2 line-clamp-2 text-[10px] leading-5 text-[#9ee870]">{listing.priceText || '私信约定置换物'}</p>
      </div>
    </div>
    <div className="border-t border-[#f0c978]/12 p-3">
      <p className="line-clamp-2 text-[11px] leading-5 text-[#f4efe4]/50">{listing.description}</p>
      <button onClick={() => onOrder(listing)} disabled={listing.isMine || listing.status !== 'ACTIVE'} className="mt-3 min-h-11 w-full border border-[#f0c978]/52 text-xs font-black text-[#f0c978] disabled:cursor-not-allowed disabled:opacity-35">
        {listing.isMine ? '我的暗单' : listing.status !== 'ACTIVE' ? '置换进行中' : '发起置换并密信'}
      </button>
    </div>
  </article>
);

const OrderCard: React.FC<{
  order: TradeOrder;
  identityUserId: number;
  onUpdate: (order: TradeOrder, status: OrderStatus) => void;
  onOpenInbox: () => void;
}> = ({ order, identityUserId, onUpdate, onOpenInbox }) => {
  const statusIndex = {
    REQUESTED: 0,
    ACCEPTED: 2,
    PAID_OFF_PLATFORM: 3,
    COMPLETED: 4,
    CANCELLED: 0,
    DISPUTED: 3,
  }[order.status];
  const isBuyer = identityUserId === order.buyerId;
  const isSeller = identityUserId === order.sellerId;
  const nextAction = order.status === 'REQUESTED' && isSeller
    ? { status: 'ACCEPTED' as const, label: '确认接单' }
    : order.status === 'ACCEPTED' && isBuyer
      ? { status: 'PAID_OFF_PLATFORM' as const, label: '确认当面交付' }
      : order.status === 'PAID_OFF_PLATFORM' && isBuyer
        ? { status: 'COMPLETED' as const, label: '双方完成' }
        : null;
  return (
    <article className="border border-[#f0c978]/18 bg-[#0c0d0b] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] text-[#f4efe4]/38">ORDER #{order.id} · 对方 {order.counterpartyAlias}</p>
          <h2 className="mt-1 text-sm font-black text-[#f4efe4]">{order.listingTitle}</h2>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>
      <div className="mt-5 grid grid-cols-5 gap-1">
        {ORDER_STEPS.map((step, index) => (
          <div key={step} className="text-center">
            <div className={cn('mx-auto flex h-7 w-7 items-center justify-center rounded-full border text-[10px] font-black', index <= statusIndex && order.status !== 'CANCELLED' ? 'border-[#9ee870] bg-[#163014] text-[#9ee870]' : 'border-[#f4efe4]/14 text-[#f4efe4]/28')}>
              {index < statusIndex ? <Check className="h-3.5 w-3.5" /> : index + 1}
            </div>
            <p className="mt-1 text-[8px] leading-4 text-[#f4efe4]/40">{step}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2 border-t border-[#f0c978]/12 pt-3">
        <button onClick={onOpenInbox} className="min-h-10 flex-1 border border-[#9ee870]/30 px-3 text-[10px] font-black text-[#9ee870]">进入关联密信</button>
        {nextAction && <button onClick={() => onUpdate(order, nextAction.status)} className="min-h-10 flex-1 bg-[#f0c978] px-3 text-[10px] font-black text-[#11120f]">{nextAction.label}</button>}
        {!['COMPLETED', 'CANCELLED', 'DISPUTED'].includes(order.status) && (
          <button onClick={() => onUpdate(order, order.status === 'REQUESTED' || (order.status === 'ACCEPTED' && isSeller) ? 'CANCELLED' : 'DISPUTED')} className="min-h-10 border border-[#fb7185]/30 px-3 text-[10px] font-black text-[#fb7185]">
            {order.status === 'REQUESTED' || (order.status === 'ACCEPTED' && isSeller) ? '取消' : '申诉'}
          </button>
        )}
      </div>
    </article>
  );
};

const OrderStatusBadge: React.FC<{ status: OrderStatus }> = ({ status }) => {
  const label: Record<OrderStatus, string> = {
    REQUESTED: '待接单',
    ACCEPTED: '确认中',
    PAID_OFF_PLATFORM: '已交付',
    COMPLETED: '已完成',
    CANCELLED: '已取消',
    DISPUTED: '申诉中',
  };
  return <span className={cn('shrink-0 border px-2 py-1 text-[9px] font-black', status === 'DISPUTED' || status === 'CANCELLED' ? 'border-[#fb7185]/35 text-[#fb7185]' : 'border-[#9ee870]/35 text-[#9ee870]')}>{label[status]}</span>;
};

const MarketSafety: React.FC = () => (
  <section className="mt-4 border border-[#f0c978]/18 bg-[#11120f] p-4">
    <h2 className="flex items-center gap-2 text-xs font-black text-[#f0c978]"><ShieldCheck className="h-4 w-4" /> 安全公约</h2>
    <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-[10px] leading-5 text-[#f4efe4]/48 sm:grid-cols-4">
      <span>不支持现金交易</span><span>不发布违禁物品</span><span>公共场所交付</span><span>可举报、可申诉</span>
    </div>
  </section>
);

const InboxView: React.FC<{
  conversations: PantryFeed['conversations'];
  messageDraft: Record<number, string>;
  onDraftChange: (id: number, value: string) => void;
  onSend: (id: number) => void;
  onCoffee: () => void;
}> = ({ conversations, messageDraft, onDraftChange, onSend, onCoffee }) => (
  <main>
    <div className="flex items-end justify-between gap-3">
      <SectionHeading eyebrow="Encrypted relay" title="匿名密信" description="关联线索与置换订单，身份只对平台审计系统可见。" />
      <button onClick={onCoffee} className="mb-5 flex min-h-10 shrink-0 items-center gap-1.5 border border-[#f0c978]/28 px-3 text-[10px] font-black text-[#f0c978]"><Coffee className="h-3.5 w-3.5" /> 咖啡资料</button>
    </div>
    <div className="space-y-3">
      {conversations.map((conversation) => (
        <article key={conversation.id} className="border border-[#9ee870]/18 bg-[#0c0d0b] p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#9ee870]/35 text-[#9ee870]"><LockKeyhole className="h-4 w-4" /></span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black" style={{ color: conversation.otherColor }}>{conversation.otherAlias}</p>
              <p className="mt-1 truncate text-[10px] text-[#f4efe4]/38">{conversation.orderId ? `关联置换 #${conversation.orderId}` : '匿名讨论'}</p>
            </div>
            <span className="text-[9px] text-[#f4efe4]/32">{formatTime(conversation.lastAt)}</span>
          </div>
          <p className="mt-4 border-l border-[#9ee870]/35 pl-3 text-xs leading-6 text-[#f4efe4]/58">{conversation.lastMessage}</p>
          <div className="mt-4 flex gap-2">
            <input value={messageDraft[conversation.id] || ''} onChange={(event) => onDraftChange(conversation.id, event.target.value)} placeholder="发送安全消息，不会显示真实身份" className="min-h-11 min-w-0 flex-1 border border-[#f4efe4]/12 bg-[#070807] px-3 text-xs text-[#f4efe4] outline-none focus:border-[#9ee870]/55" />
            <button onClick={() => onSend(conversation.id)} className="flex h-11 w-11 shrink-0 items-center justify-center bg-[#163014] text-[#9ee870]" aria-label="发送密信"><Send className="h-4 w-4" /></button>
          </div>
        </article>
      ))}
      {conversations.length === 0 && <EmptyState icon={Inbox} title="还没有匿名密信" detail="关注线索、参与讨论或发起置换后，关联会话会出现在这里。" />}
    </div>
  </main>
);

const SectionHeading: React.FC<{ eyebrow: string; title: string; description: string }> = ({ eyebrow, title, description }) => (
  <div className="mb-5">
    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#9ee870]/52">{eyebrow}</p>
    <h1 className="mt-1 text-2xl font-black tracking-tight text-[#f4efe4]">{title}</h1>
    <p className="mt-2 max-w-xl text-[11px] leading-5 text-[#f4efe4]/42">{description}</p>
  </div>
);

const EmptyRadar: React.FC<{ onCompose: () => void }> = ({ onCompose }) => (
  <EmptyState icon={Radio} title="情报雷达暂时安静" detail="投递第一条合规线索，让真正有用的信息开始流动。" action="投递情报" onAction={onCompose} />
);

const EmptyState: React.FC<{
  icon: React.FC<{ className?: string }>;
  title: string;
  detail: string;
  action?: string;
  onAction?: () => void;
}> = ({ icon: Icon, title, detail, action, onAction }) => (
  <div className="border border-dashed border-[#f0c978]/24 bg-[#0c0d0b] px-5 py-12 text-center">
    <Icon className="mx-auto h-7 w-7 text-[#f0c978]/55" />
    <p className="mt-3 text-sm font-black text-[#f4efe4]">{title}</p>
    <p className="mx-auto mt-2 max-w-sm text-[11px] leading-5 text-[#f4efe4]/42">{detail}</p>
    {action && onAction && <button onClick={onAction} className="mt-4 min-h-11 bg-[#f0c978] px-4 text-xs font-black text-[#11120f]">{action}</button>}
  </div>
);

const LoadFailure: React.FC<{ message: string; onRetry: () => void; onPreview: () => void }> = ({ message, onRetry, onPreview }) => (
  <section className="mx-auto mt-10 max-w-xl border border-[#fb7185]/35 bg-[#160d0e] p-6 text-center">
    <CircleAlert className="mx-auto h-7 w-7 text-[#fb7185]" />
    <h1 className="mt-3 text-lg font-black">真实茶水间暂时不可用</h1>
    <p className="mt-2 text-xs leading-6 text-[#f4efe4]/52">{message}</p>
    <div className="mt-4 flex justify-center gap-2">
      <button onClick={onRetry} className="min-h-11 bg-[#f0c978] px-4 text-xs font-black text-[#11120f]">重试接口</button>
      <button onClick={onPreview} className="min-h-11 border border-[#f0c978]/35 px-4 text-xs font-black text-[#f0c978]">只读预览</button>
    </div>
  </section>
);

const WatermarkLayer: React.FC<{ stamp: string }> = ({ stamp }) => (
  <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden opacity-[0.09]" aria-hidden="true">
    {Array.from({ length: 12 }).map((_, index) => (
      <span key={index} className="absolute whitespace-nowrap text-[9px] font-black tracking-[0.12em] text-[#9ee870]" style={{ top: `${4 + index * 8}%`, left: `${index % 2 === 0 ? -4 : 36}%`, transform: 'rotate(-9deg)' }}>
        {stamp} · 安全水印
      </span>
    ))}
  </div>
);

const MOBILE_TABS: Array<{ key: MobileSection; label: string; icon: React.FC<{ className?: string }> }> = [
  { key: 'radar', label: '雷达', icon: Radio },
  { key: 'rails', label: '追踪', icon: Bookmark },
  { key: 'market', label: '暗市', icon: Store },
  { key: 'inbox', label: '密信', icon: MessageCircle },
];

const MobileSectionTabs: React.FC<{ active: MobileSection; unreadCount: number; onChange: (next: MobileSection) => void }> = ({ active, unreadCount, onChange }) => (
  <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[#9ee870]/22 bg-[#070807]/97 backdrop-blur-xl safe-area-bottom" aria-label="茶水间分区">
    <ul className="mx-auto grid h-16 max-w-[1120px] grid-cols-4">
      {MOBILE_TABS.map(({ key, label, icon: Icon }) => {
        const isActive = active === key;
        return (
          <li key={key}>
            <button onClick={() => onChange(key)} className={cn('relative flex h-full w-full flex-col items-center justify-center gap-1 text-[10px] font-black transition-colors', isActive ? 'bg-[#10200f] text-[#9ee870]' : key === 'market' ? 'text-[#f0c978]' : 'text-[#f4efe4]/46')} aria-current={isActive ? 'page' : undefined}>
              {isActive && <span className="absolute inset-x-0 top-0 h-px bg-[#9ee870]" />}
              <Icon className="h-5 w-5" />
              <span>{label}</span>
              {key === 'inbox' && unreadCount > 0 && <span className="absolute right-[calc(50%-18px)] top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#f0c978] px-1 text-[8px] text-[#11120f]">{unreadCount}</span>}
            </button>
          </li>
        );
      })}
    </ul>
  </nav>
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
  <div className="fixed inset-0 z-50 overflow-y-auto bg-black/82 p-3 backdrop-blur-sm sm:p-5">
    <div className="mx-auto max-w-2xl border border-[#f0c978]/32 bg-[#0c0d0b] p-4 text-[#f4efe4] shadow-2xl sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#9ee870]/55">Encrypted dispatch</p>
          <h2 className="mt-1 text-xl font-black">{mode === 'market' ? '发布一条置换暗单' : '投递一条新情报'}</h2>
          <p className="mt-1 text-[10px] text-[#f4efe4]/40">对同事匿名，对平台可审计。发布后可举报、可追踪。</p>
        </div>
        <button onClick={onClose} className="flex h-10 w-10 items-center justify-center border border-[#f4efe4]/14 text-[#f4efe4]/56" aria-label="关闭"><X className="h-4 w-4" /></button>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {(Object.keys(MODE_META) as ComposerMode[]).map((key) => (
          <button key={key} onClick={() => setMode(key)} className={cn('min-h-11 border px-2 text-xs font-black', mode === key ? 'border-[#f0c978] bg-[#f0c978] text-[#11120f]' : 'border-[#f0c978]/18 text-[#f0c978]/62')}>
            {MODE_META[key].label}
          </button>
        ))}
      </div>
      {mode === 'market' ? (
        <div className="mt-4 grid gap-3">
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setListingDraft((draft) => ({ ...draft, type: 'SELL' }))} className={cn('min-h-11 border text-xs font-black', listingDraft.type === 'SELL' ? 'border-[#9ee870] text-[#9ee870]' : 'border-[#f4efe4]/12 text-[#f4efe4]/44')}>我有闲置</button>
            <button onClick={() => setListingDraft((draft) => ({ ...draft, type: 'WANTED' }))} className={cn('min-h-11 border text-xs font-black', listingDraft.type === 'WANTED' ? 'border-[#9ee870] text-[#9ee870]' : 'border-[#f4efe4]/12 text-[#f4efe4]/44')}>我想求换</button>
          </div>
          <input value={listingDraft.title} onChange={(event) => setListingDraft((draft) => ({ ...draft, title: event.target.value }))} placeholder="物品名称，例如：状态很好的绿萝" className="min-h-12 border border-[#f4efe4]/12 bg-[#070807] px-3 text-sm outline-none focus:border-[#9ee870]/55" />
          <div className="grid grid-cols-2 gap-2">
            <input value={listingDraft.category} onChange={(event) => setListingDraft((draft) => ({ ...draft, category: event.target.value }))} placeholder="分类" className="min-h-12 border border-[#f4efe4]/12 bg-[#070807] px-3 text-sm outline-none focus:border-[#9ee870]/55" />
            <input value={listingDraft.condition} onChange={(event) => setListingDraft((draft) => ({ ...draft, condition: event.target.value }))} placeholder="成色" className="min-h-12 border border-[#f4efe4]/12 bg-[#070807] px-3 text-sm outline-none focus:border-[#9ee870]/55" />
          </div>
          <input value={listingDraft.priceText} onChange={(event) => setListingDraft((draft) => ({ ...draft, priceText: event.target.value }))} placeholder="想换什么，例如：一杯咖啡（禁止现金）" className="min-h-12 border border-[#9ee870]/22 bg-[#070807] px-3 text-sm text-[#9ee870] outline-none focus:border-[#9ee870]/65" />
          <textarea value={listingDraft.description} onChange={(event) => setListingDraft((draft) => ({ ...draft, description: event.target.value }))} rows={5} placeholder="描述状态、交付方式和大致区域。禁止现金、违禁物品、账号、银行卡、票据和灰产服务。" className="border border-[#f4efe4]/12 bg-[#070807] px-3 py-3 text-sm leading-6 outline-none focus:border-[#9ee870]/55" />
        </div>
      ) : (
        <div className="mt-4 grid gap-3">
          <input value={postDraft.title} onChange={(event) => setPostDraft((draft) => ({ ...draft, title: event.target.value }))} placeholder="一句话说明这条线索" className="min-h-12 border border-[#f4efe4]/12 bg-[#070807] px-3 text-sm outline-none focus:border-[#9ee870]/55" />
          <textarea value={postDraft.content} onChange={(event) => setPostDraft((draft) => ({ ...draft, content: event.target.value }))} rows={7} placeholder="写清时间线、可核实事实和仍待求证的部分。不要贴个人隐私、客户资料、证件或内部文件。" className="border border-[#f4efe4]/12 bg-[#070807] px-3 py-3 text-sm leading-6 outline-none focus:border-[#9ee870]/55" />
          {mode === 'burn' && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {TTL_OPTIONS.map((item) => (
                <button key={item.value} onClick={() => setPostDraft((draft) => ({ ...draft, ttlMinutes: item.value }))} className={cn('min-h-10 border text-[10px] font-black', postDraft.ttlMinutes === item.value ? 'border-[#fb7185] text-[#fb7185]' : 'border-[#f4efe4]/12 text-[#f4efe4]/42')}>{item.label}</button>
              ))}
            </div>
          )}
        </div>
      )}
      <div className="mt-4 flex items-start gap-2 border border-[#fb7185]/20 bg-[#160d0e] p-3 text-[10px] leading-5 text-[#f4efe4]/50">
        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#fb7185]" />
        发布即表示你同意社区规则。平台会记录账号与操作用于安全审计，但不会向普通用户展示真实身份。
      </div>
      <button onClick={onSubmit} className="mt-4 min-h-12 w-full bg-[#f0c978] text-sm font-black text-[#11120f]">{mode === 'market' ? '发布到暗市置换' : '写入匿名雷达'}</button>
    </div>
  </div>
);

const CoffeeSettings: React.FC<{
  draft: { qrUrl: string; note: string; public: boolean };
  onChange: React.Dispatch<React.SetStateAction<{ qrUrl: string; note: string; public: boolean }>>;
  onClose: () => void;
  onSave: () => void;
}> = ({ draft, onChange, onClose, onSave }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/82 p-4 backdrop-blur-sm">
    <section className="w-full max-w-lg border border-[#f0c978]/30 bg-[#0c0d0b] p-5">
      <div className="flex items-start justify-between gap-3">
        <div><p className="text-[10px] uppercase tracking-[0.2em] text-[#f0c978]/55">Coffee profile</p><h2 className="mt-1 text-lg font-black">咖啡感谢入口</h2></div>
        <button onClick={onClose} className="flex h-10 w-10 items-center justify-center border border-[#f4efe4]/14"><X className="h-4 w-4" /></button>
      </div>
      <p className="mt-3 text-[11px] leading-5 text-[#f4efe4]/46">这是对长期整理者的自愿感谢入口，与暗市置换无关，平台不经手资金。</p>
      <div className="mt-4 grid gap-3">
        <input value={draft.qrUrl} onChange={(event) => onChange((current) => ({ ...current, qrUrl: event.target.value }))} placeholder="收款码图片 URL / 说明" className="min-h-12 border border-[#f4efe4]/12 bg-[#070807] px-3 text-sm outline-none" />
        <input value={draft.note} onChange={(event) => onChange((current) => ({ ...current, note: event.target.value }))} placeholder="感谢说明" className="min-h-12 border border-[#f4efe4]/12 bg-[#070807] px-3 text-sm outline-none" />
        <button onClick={() => onChange((current) => ({ ...current, public: !current.public }))} className={cn('min-h-11 border text-xs font-black', draft.public ? 'border-[#9ee870] text-[#9ee870]' : 'border-[#f4efe4]/12 text-[#f4efe4]/45')}>{draft.public ? '公开展示' : '暂不公开'}</button>
        <button onClick={onSave} className="min-h-12 bg-[#f0c978] text-sm font-black text-[#11120f]">保存资料</button>
      </div>
    </section>
  </div>
);

export default PantryPage;
