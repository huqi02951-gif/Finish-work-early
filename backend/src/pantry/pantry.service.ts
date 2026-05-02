import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CommentStatus,
  DirectMessageStatus,
  MarketListingStatus,
  MarketListingType,
  PantryIdentityStatus,
  PantryNotificationType,
  PantryReactionType,
  PantryReportStatus,
  PantryReportTargetType,
  PantryVisibilityMode,
  PostSourceType,
  PostStatus,
  PostType,
  Prisma,
  TradeOrderStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PantryGateway } from './pantry.gateway';

const PANTRY_BOARD_SLUG = 'pantry';
const ALIAS_COLORS = ['#00ff41', '#a855f7', '#f59e0b', '#ef4444', '#38bdf8', '#f472b6'];
const ALIAS_PREFIXES = ['Null', 'Echo', 'Cipher', 'Shadow', 'Raven', 'Ghost', 'Signal', 'Patch'];
const BANNED_MARKET_TERMS = ['代打卡', '账号买卖', '银行卡', '套现', '发票', '外挂'];
const BANNED_COMMUNITY_TERMS = [...BANNED_MARKET_TERMS, '<script', 'javascript:', 'onerror=', 'onload='];

type CreatePostInput = {
  title?: string;
  content?: string;
  kind?: 'burn' | 'gossip' | 'thread';
  visibilityMode?: 'PERMANENT' | 'EPHEMERAL' | 'permanent' | 'ephemeral';
  ttlMinutes?: number;
  tags?: string[];
};

type CreateListingInput = {
  type?: 'SELL' | 'WANTED' | 'sell' | 'wanted';
  title?: string;
  description?: string;
  category?: string;
  condition?: string;
  priceText?: string;
  priceCents?: number;
  expiresInDays?: number;
};

const publicAuthorSelect = {
  id: true,
  username: true,
  nickname: true,
  role: true,
  createdAt: true,
  communityIdentity: true,
} satisfies Prisma.UserSelect;

const postInclude = {
  author: { select: publicAuthorSelect },
  board: { select: { id: true, slug: true, name: true, isOfficial: true } },
  tags: { include: { tag: true } },
  _count: {
    select: {
      comments: { where: { deletedAt: null, status: CommentStatus.PUBLISHED } },
      reactions: true,
    },
  },
} satisfies Prisma.PostInclude;

const listingInclude = {
  seller: { select: publicAuthorSelect },
  _count: { select: { orders: true } },
} satisfies Prisma.MarketListingInclude;

const orderInclude = {
  listing: true,
  buyer: { select: publicAuthorSelect },
  seller: { select: publicAuthorSelect },
} satisfies Prisma.TradeOrderInclude;

@Injectable()
export class PantryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: PantryGateway,
  ) {}

  async getFeed(userId: number) {
    const identity = await this.ensureIdentity(userId);
    const now = new Date();
    const board = await this.requirePantryBoard();

    const [posts, listings, conversations, orders] = await this.prisma.$transaction([
      this.prisma.post.findMany({
        where: {
          boardId: board.id,
          deletedAt: null,
          status: PostStatus.PUBLISHED,
          OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
        },
        orderBy: [{ isPinned: 'desc' }, { heatScore: 'desc' }, { createdAt: 'desc' }],
        take: 50,
        include: postInclude,
      }),
      this.prisma.marketListing.findMany({
        where: {
          status: { in: [MarketListingStatus.ACTIVE, MarketListingStatus.RESERVED] },
          OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
        },
        orderBy: [{ createdAt: 'desc' }],
        take: 50,
        include: listingInclude,
      }),
      this.listConversationRows(userId, 20),
      this.prisma.tradeOrder.findMany({
        where: { OR: [{ buyerId: userId }, { sellerId: userId }] },
        orderBy: { updatedAt: 'desc' },
        take: 20,
        include: orderInclude,
      }),
    ]);

    const serializedPosts = posts.map((post) => this.serializePost(post));
    const serializedListings = listings.map((listing) => this.serializeListing(listing, userId));
    const grouped = this.groupRadarFeed(serializedPosts, serializedListings);

    return {
      identity,
      posts: serializedPosts,
      listings: serializedListings,
      conversations: conversations.map((conversation) => this.serializeConversation(conversation, userId)),
      orders: orders.map((order) => this.serializeOrder(order, userId)),
      ...grouped,
    };
  }

  async createPost(userId: number, input: CreatePostInput) {
    const identity = await this.ensureUsableIdentity(userId);
    const board = await this.requirePantryBoard();
    const title = this.requireText(input.title, 'title', 160);
    const content = this.requireText(input.content, 'content', 5000);
    this.assertSafeCommunityText(`${title}\n${content}`);
    const visibilityMode = this.parseVisibility(input.visibilityMode);
    const expiresAt =
      visibilityMode === PantryVisibilityMode.EPHEMERAL
        ? this.resolveExpiry(input.ttlMinutes)
        : null;
    const kind = ['burn', 'gossip', 'thread'].includes(String(input.kind)) ? input.kind : 'thread';

    const post = await this.prisma.$transaction(async (tx) => {
      const created = await tx.post.create({
        data: {
          boardId: board.id,
          title,
          content,
          summary: content.slice(0, 140),
          category: board.name,
          postType: PostType.DISCUSSION,
          sourceType: PostSourceType.USER,
          status: PostStatus.PUBLISHED,
          authorId: userId,
          visibilityMode,
          expiresAt,
          anonymousAlias: identity.alias,
          contentData: { pantryKind: kind },
        },
      });
      await this.syncTags(tx, created.id, input.tags || []);
      return tx.post.findUniqueOrThrow({ where: { id: created.id }, include: postInclude });
    });

    const serialized = this.serializePost(post);
    this.gateway.emitFeed({ type: 'post:new', post: serialized });
    return serialized;
  }

  async getPostDetail(userId: number, postId: number) {
    await this.ensureIdentity(userId);
    const board = await this.requirePantryBoard();
    const now = new Date();
    const post = await this.prisma.post.findFirst({
      where: {
        id: postId,
        boardId: board.id,
        deletedAt: null,
        status: PostStatus.PUBLISHED,
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      include: postInclude,
    });
    if (!post) throw new NotFoundException('Post not found');
    return this.serializePost(post);
  }

  async createComment(userId: number, postId: number, content: string) {
    await this.ensureUsableIdentity(userId);
    const post = await this.requireVisiblePantryPost(postId);
    if (post.commentsLockedAt) {
      throw new ForbiddenException('Comments are locked');
    }

    const comment = await this.prisma.comment.create({
      data: {
        postId,
        authorId: userId,
        content: this.requireSafeText(content, 'content', 2000),
      },
      include: { author: { select: publicAuthorSelect } },
    });

    return this.serializeComment(comment);
  }

  async listComments(userId: number, postId: number) {
    await this.ensureIdentity(userId);
    await this.requireVisiblePantryPost(postId);
    const comments = await this.prisma.comment.findMany({
      where: {
        postId,
        deletedAt: null,
        status: CommentStatus.PUBLISHED,
      },
      orderBy: { createdAt: 'asc' },
      include: { author: { select: publicAuthorSelect } },
      take: 100,
    });
    return comments.map((comment) => this.serializeComment(comment));
  }

  async react(userId: number, postId: number, rawType: string) {
    await this.ensureUsableIdentity(userId);
    await this.requireVisiblePantryPost(postId);
    const type = this.parseReaction(rawType);

    const existing = await this.prisma.postReaction.findFirst({
      where: { postId, userId, type },
    });
    if (existing) {
      return { ok: true, alreadyReacted: true };
    }

    await this.prisma.$transaction([
      this.prisma.postReaction.create({ data: { postId, userId, type } }),
      this.prisma.post.update({
        where: { id: postId },
        data: {
          reactionCount: { increment: 1 },
          heatScore: { increment: type === PantryReactionType.FIRE ? 3 : 1 },
        },
      }),
    ]);

    return { ok: true, alreadyReacted: false };
  }

  async bookmark(userId: number, postId: number) {
    await this.ensureUsableIdentity(userId);
    await this.requireVisiblePantryPost(postId);

    const existing = await this.prisma.postBookmark.findFirst({ where: { postId, userId } });
    if (existing) {
      return { ok: true, alreadyBookmarked: true };
    }

    await this.prisma.$transaction([
      this.prisma.postBookmark.create({ data: { postId, userId } }),
      this.prisma.post.update({
        where: { id: postId },
        data: {
          bookmarkCount: { increment: 1 },
          heatScore: { increment: 2 },
        },
      }),
    ]);

    return { ok: true, alreadyBookmarked: false };
  }

  async updateCoffeeProfile(userId: number, input: { coffeeQrUrl?: string; coffeeNote?: string; coffeePublic?: boolean }) {
    await this.ensureIdentity(userId);
    return this.prisma.communityIdentity.update({
      where: { userId },
      data: {
        coffeeQrUrl: this.normalizeCoffeeUrl(input.coffeeQrUrl),
        coffeeNote: this.requireSafeOptionalText(input.coffeeNote, 500),
        coffeePublic: Boolean(input.coffeePublic),
      },
    });
  }

  async report(userId: number, input: { targetType?: string; targetId?: number; reason?: string; detail?: string }) {
    const targetType = this.parseReportTarget(input.targetType);
    const targetId = Number(input.targetId);
    if (!Number.isInteger(targetId) || targetId <= 0) {
      throw new BadRequestException('targetId is required');
    }

    const existing = await this.prisma.report.findFirst({
      where: { reporterId: userId, targetType, targetId, status: { in: [PantryReportStatus.OPEN, PantryReportStatus.REVIEWING] } },
    });
    if (existing) return existing;

    const report = await this.prisma.report.create({
      data: {
        reporterId: userId,
        targetType,
        targetId,
        reason: this.requireSafeText(input.reason, 'reason', 100),
        detail: this.requireSafeOptionalText(input.detail, 1000),
      },
    });
    return report;
  }

  async listListings(userId: number) {
    const now = new Date();
    const listings = await this.prisma.marketListing.findMany({
      where: {
        status: { in: [MarketListingStatus.ACTIVE, MarketListingStatus.RESERVED] },
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      orderBy: [{ createdAt: 'desc' }],
      include: listingInclude,
    });
    return listings.map((listing) => this.serializeListing(listing, userId));
  }

  async createListing(userId: number, input: CreateListingInput) {
    const identity = await this.ensureUsableIdentity(userId);
    const title = this.requireText(input.title, 'title', 160);
    const description = this.requireText(input.description, 'description', 4000);
    this.assertLegalMarketText(`${title}\n${description}`);
    this.assertSafeCommunityText(`${title}\n${description}`);

    const listing = await this.prisma.marketListing.create({
      data: {
        sellerId: userId,
        type: this.parseListingType(input.type),
        title,
        description,
        category: this.normalizeText(input.category, 80) || '其他',
        condition: this.normalizeText(input.condition, 80),
        priceText: this.normalizeText(input.priceText, 80) || '私信议价',
        priceCents: Number.isInteger(input.priceCents) ? input.priceCents : null,
        anonymousAlias: identity.alias,
        expiresAt: this.resolveListingExpiry(input.expiresInDays),
      },
      include: listingInclude,
    });

    this.gateway.emitFeed({ type: 'listing:new', listing: this.serializeListing(listing, userId) });
    return this.serializeListing(listing, userId);
  }

  async createOrder(userId: number, listingId: number, note?: string) {
    await this.ensureUsableIdentity(userId);
    const listing = await this.prisma.marketListing.findFirst({
      where: { id: listingId, status: MarketListingStatus.ACTIVE },
    });
    if (!listing) throw new NotFoundException('Listing not found');
    if (listing.sellerId === userId) throw new BadRequestException('Cannot order your own listing');

    const order = await this.prisma.$transaction(async (tx) => {
      const created = await tx.tradeOrder.create({
        data: {
          listingId,
          buyerId: userId,
          sellerId: listing.sellerId,
          note: this.requireSafeOptionalText(note, 1000),
        },
        include: orderInclude,
      });
      await tx.marketListing.update({
        where: { id: listingId },
        data: { status: MarketListingStatus.RESERVED },
      });
      await this.ensureConversationTx(tx, userId, listing.sellerId, listingId, created.id, '我想要这个，方便聊聊吗？');
      return created;
    });

    await this.notifyOrderLifecycle(order, 'created');
    this.emitOrderSnapshots(order);
    return this.serializeOrder(order, userId);
  }

  async listMyOrders(userId: number, input: { status?: string; take?: number } = {}) {
    const take = Number.isFinite(input.take) ? Math.min(Math.max(Number(input.take), 1), 100) : 50;
    const status = input.status ? this.parseOrderStatus(input.status) : null;
    const orders = await this.prisma.tradeOrder.findMany({
      where: {
        OR: [{ buyerId: userId }, { sellerId: userId }],
        ...(status ? { status } : {}),
      },
      orderBy: { updatedAt: 'desc' },
      take,
      include: orderInclude,
    });
    return orders.map((order) => this.serializeOrder(order, userId));
  }

  async updateOrderStatus(userId: number, orderId: number, input: { status?: string; note?: string }) {
    const order = await this.prisma.tradeOrder.findUnique({ where: { id: orderId }, include: orderInclude });
    if (!order) throw new NotFoundException('Order not found');
    if (order.buyerId !== userId && order.sellerId !== userId) {
      throw new ForbiddenException('No access to this order');
    }

    const next = this.parseOrderStatus(input.status);
    this.assertOrderTransition(order, userId, next);

    const updated = await this.prisma.$transaction(async (tx) => {
      const saved = await tx.tradeOrder.update({
        where: { id: orderId },
        data: {
          status: next,
          offPlatformNote:
            next === TradeOrderStatus.PAID_OFF_PLATFORM ? this.requireSafeOptionalText(input.note, 1000) : undefined,
          disputeReason:
            next === TradeOrderStatus.DISPUTED ? this.requireSafeOptionalText(input.note, 1000) : undefined,
        },
        include: orderInclude,
      });

      if (next === TradeOrderStatus.COMPLETED) {
        await tx.marketListing.update({
          where: { id: order.listingId },
          data: { status: MarketListingStatus.SOLD },
        });
      }
      if (next === TradeOrderStatus.CANCELLED || next === TradeOrderStatus.DISPUTED) {
        await tx.marketListing.update({
          where: { id: order.listingId },
          data: { status: next === TradeOrderStatus.CANCELLED ? MarketListingStatus.ACTIVE : MarketListingStatus.RESERVED },
        });
      }
      return saved;
    });

    await this.notifyOrderLifecycle(updated, 'status');
    this.emitOrderSnapshots(updated);
    return this.serializeOrder(updated, userId);
  }

  async listNotifications(userId: number, take = 50) {
    const safeTake = Number.isFinite(take) ? Math.min(Math.max(Number(take), 1), 100) : 50;
    return this.prisma.pantryNotification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: safeTake,
    });
  }

  async markNotificationRead(userId: number, id: number) {
    const notification = await this.prisma.pantryNotification.findFirst({ where: { id, userId } });
    if (!notification) throw new NotFoundException('Notification not found');
    return this.prisma.pantryNotification.update({
      where: { id },
      data: { readAt: new Date() },
    });
  }

  async listConversations(userId: number) {
    const conversations = await this.listConversationRows(userId, 50);
    return conversations.map((conversation) => this.serializeConversation(conversation, userId));
  }

  async createConversation(userId: number, input: { recipientId?: number; listingId?: number; orderId?: number; message?: string }) {
    await this.ensureUsableIdentity(userId);
    const recipientId = Number(input.recipientId);
    if (!Number.isInteger(recipientId) || recipientId <= 0 || recipientId === userId) {
      throw new BadRequestException('recipientId is required');
    }

    const conversation = await this.prisma.$transaction((tx) =>
      this.ensureConversationTx(
        tx,
        userId,
        recipientId,
        input.listingId ? Number(input.listingId) : null,
        input.orderId ? Number(input.orderId) : null,
        input.message,
      ),
    );

    return this.serializeConversation(conversation, userId);
  }

  async sendMessage(userId: number, conversationId: number, content: string) {
    await this.ensureUsableIdentity(userId);
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [{ userAId: userId }, { userBId: userId }],
      },
    });
    if (!conversation) throw new NotFoundException('Conversation not found');

    const message = await this.prisma.$transaction(async (tx) => {
      const created = await tx.directMessage.create({
        data: {
          conversationId,
          senderId: userId,
          content: this.requireSafeText(content, 'content', 3000),
        },
        include: { sender: { select: publicAuthorSelect } },
      });
      await tx.conversation.update({
        where: { id: conversationId },
        data: { lastMessage: created.content, lastAt: created.createdAt },
      });
      return created;
    });

    const serialized = this.serializeMessage(message);
    const recipientId = conversation.userAId === userId ? conversation.userBId : conversation.userAId;
    await this.createNotification(recipientId, {
      type: PantryNotificationType.MESSAGE,
      title: '收到一封新的密信',
      body: serialized.content.slice(0, 80),
      targetType: 'CONVERSATION',
      targetId: conversationId,
    });
    this.gateway.emitMessage(conversationId, [conversation.userAId, conversation.userBId], {
      conversationId,
      message: serialized,
    });
    return serialized;
  }

  async getConversationMessages(userId: number, conversationId: number) {
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [{ userAId: userId }, { userBId: userId }],
      },
    });
    if (!conversation) throw new NotFoundException('Conversation not found');

    const messages = await this.prisma.directMessage.findMany({
      where: { conversationId, status: DirectMessageStatus.SENT },
      orderBy: { createdAt: 'asc' },
      include: { sender: { select: publicAuthorSelect } },
      take: 200,
    });
    await this.prisma.directMessage.updateMany({
      where: { conversationId, senderId: { not: userId }, readAt: null },
      data: { readAt: new Date() },
    });
    return messages.map((message) => this.serializeMessage(message));
  }

  async listReports() {
    return this.prisma.report.findMany({
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
      take: 100,
      include: {
        reporter: { select: publicAuthorSelect },
      },
    });
  }

  async resolveReport(id: number, status: 'RESOLVED' | 'REJECTED' | 'REVIEWING') {
    return this.prisma.report.update({
      where: { id },
      data: {
        status,
        resolvedAt: status === 'RESOLVED' || status === 'REJECTED' ? new Date() : null,
      },
    });
  }

  async setListingStatus(id: number, status: MarketListingStatus) {
    if (!(status in MarketListingStatus)) {
      throw new BadRequestException('Unsupported listing status');
    }
    return this.prisma.marketListing.update({
      where: { id },
      data: { status },
    });
  }

  async setIdentityStatus(id: number, status: PantryIdentityStatus, mutedUntil?: string) {
    if (!(status in PantryIdentityStatus)) {
      throw new BadRequestException('Unsupported identity status');
    }
    return this.prisma.communityIdentity.update({
      where: { id },
      data: {
        status,
        mutedUntil: mutedUntil ? new Date(mutedUntil) : null,
      },
    });
  }

  private async ensureIdentity(userId: number) {
    const existing = await this.prisma.communityIdentity.findUnique({ where: { userId } });
    if (existing) return existing;

    for (let attempt = 0; attempt < 5; attempt++) {
      const suffix = Math.random().toString(36).slice(2, 7).toUpperCase();
      const alias = `${ALIAS_PREFIXES[Math.floor(Math.random() * ALIAS_PREFIXES.length)]}_${suffix}`;
      try {
        return await this.prisma.communityIdentity.create({
          data: {
            userId,
            alias,
            color: ALIAS_COLORS[Math.floor(Math.random() * ALIAS_COLORS.length)],
          },
        });
      } catch {
        // retry on rare alias collision
      }
    }
    throw new BadRequestException('Failed to create identity');
  }

  private async ensureUsableIdentity(userId: number) {
    const identity = await this.ensureIdentity(userId);
    if (identity.status === PantryIdentityStatus.BANNED) {
      throw new ForbiddenException('Pantry identity is banned');
    }
    if (identity.status === PantryIdentityStatus.MUTED && (!identity.mutedUntil || identity.mutedUntil > new Date())) {
      throw new ForbiddenException('Pantry identity is muted');
    }
    return identity;
  }

  private async requirePantryBoard() {
    const board = await this.prisma.board.findUnique({ where: { slug: PANTRY_BOARD_SLUG } });
    if (!board) throw new NotFoundException('Pantry board not found');
    return board;
  }

  private async requireVisiblePantryPost(postId: number) {
    const now = new Date();
    const board = await this.requirePantryBoard();
    const post = await this.prisma.post.findFirst({
      where: {
        id: postId,
        boardId: board.id,
        deletedAt: null,
        status: PostStatus.PUBLISHED,
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
    });
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  private listConversationRows(userId: number, take: number) {
    return this.prisma.conversation.findMany({
      where: { OR: [{ userAId: userId }, { userBId: userId }] },
      orderBy: { lastAt: 'desc' },
      take,
      include: {
        userA: { select: publicAuthorSelect },
        userB: { select: publicAuthorSelect },
        messages: {
          where: { status: DirectMessageStatus.SENT },
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: { sender: { select: publicAuthorSelect } },
        },
        _count: {
          select: {
            messages: {
              where: { status: DirectMessageStatus.SENT, senderId: { not: userId }, readAt: null },
            },
          },
        },
      },
    });
  }

  private async ensureConversationTx(
    tx: Prisma.TransactionClient,
    userAId: number,
    userBId: number,
    listingId?: number | null,
    orderId?: number | null,
    initialMessage?: string,
  ) {
    const [a, b] = userAId < userBId ? [userAId, userBId] : [userBId, userAId];
    const existing = await tx.conversation.findFirst({
      where: {
        userAId: a,
        userBId: b,
        listingId: listingId ?? null,
        orderId: orderId ?? null,
      },
      include: {
        userA: { select: publicAuthorSelect },
        userB: { select: publicAuthorSelect },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: { sender: { select: publicAuthorSelect } },
        },
        _count: { select: { messages: true } },
      },
    });
    const conversation = existing || await tx.conversation.create({
      data: {
        userAId: a,
        userBId: b,
        listingId: listingId ?? null,
        orderId: orderId ?? null,
      },
      include: {
        userA: { select: publicAuthorSelect },
        userB: { select: publicAuthorSelect },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: { sender: { select: publicAuthorSelect } },
        },
        _count: { select: { messages: true } },
      },
    });

    const text = this.requireSafeOptionalText(initialMessage, 3000);
    if (!text) return conversation;

    const message = await tx.directMessage.create({
      data: { conversationId: conversation.id, senderId: userAId, content: text },
    });
    return tx.conversation.update({
      where: { id: conversation.id },
      data: { lastMessage: message.content, lastAt: message.createdAt },
      include: {
        userA: { select: publicAuthorSelect },
        userB: { select: publicAuthorSelect },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: { sender: { select: publicAuthorSelect } },
        },
        _count: { select: { messages: true } },
      },
    });
  }

  private async syncTags(tx: Prisma.TransactionClient, postId: number, tags: string[]) {
    const clean = Array.from(new Set((tags || []).map((item) => this.normalizeText(item, 30)).filter(Boolean)));
    await tx.postTag.deleteMany({ where: { postId } });
    for (const name of clean.slice(0, 6)) {
      const tag = await tx.tag.upsert({
        where: { name },
        update: { status: 'ACTIVE' },
        create: { name, slug: name.toLowerCase().replace(/\s+/g, '-'), status: 'ACTIVE' },
      });
      await tx.postTag.create({ data: { postId, tagId: tag.id } });
    }
  }

  private serializePost(post: Prisma.PostGetPayload<{ include: typeof postInclude }>) {
    const data = (post.contentData || {}) as { pantryKind?: string };
    const identity = post.author.communityIdentity;
    const radarScore = this.computeRadarScore({
      heatScore: post.heatScore,
      reactionCount: post.reactionCount,
      bookmarkCount: post.bookmarkCount,
      commentCount: post._count.comments,
      reputation: identity?.reputation || 0,
      createdAt: post.createdAt,
    });
    return {
      id: post.id,
      title: post.title,
      content: post.content,
      summary: post.summary,
      kind: data.pantryKind || 'thread',
      visibilityMode: post.visibilityMode,
      expiresAt: post.expiresAt,
      anonymousAlias: post.anonymousAlias || post.author.communityIdentity?.alias || '匿名用户',
      aliasColor: post.author.communityIdentity?.color || '#00ff41',
      heatScore: post.heatScore,
      reactionCount: post.reactionCount,
      bookmarkCount: post.bookmarkCount,
      commentCount: post._count.comments,
      radarScore,
      coffee: identity?.coffeePublic && identity.coffeeQrUrl
        ? {
            qrUrl: identity.coffeeQrUrl,
            note: identity.coffeeNote,
          }
        : null,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      tags: post.tags.map((item) => item.tag.name),
      authorId: post.authorId,
    };
  }

  private serializeComment(comment: Prisma.CommentGetPayload<{ include: { author: { select: typeof publicAuthorSelect } } }>) {
    return {
      id: comment.id,
      postId: comment.postId,
      content: comment.content,
      createdAt: comment.createdAt,
      authorId: comment.authorId,
      anonymousAlias: comment.author.communityIdentity?.alias || '匿名用户',
      aliasColor: comment.author.communityIdentity?.color || '#00ff41',
    };
  }

  private serializeListing(listing: Prisma.MarketListingGetPayload<{ include: typeof listingInclude }>, currentUserId: number) {
    return {
      id: listing.id,
      type: listing.type,
      title: listing.title,
      description: listing.description,
      category: listing.category,
      condition: listing.condition,
      priceText: listing.priceText,
      priceCents: listing.priceCents,
      status: listing.status,
      anonymousAlias: listing.anonymousAlias,
      aliasColor: listing.seller.communityIdentity?.color || '#00ff41',
      sellerId: listing.sellerId,
      isMine: listing.sellerId === currentUserId,
      orderCount: listing._count.orders,
      expiresAt: listing.expiresAt,
      createdAt: listing.createdAt,
      updatedAt: listing.updatedAt,
    };
  }

  private groupRadarFeed(posts: any[], listings: any[]) {
    const now = Date.now();
    const byScore = [...posts].sort((a, b) => b.radarScore - a.radarScore);
    const burningSoon = posts
      .filter((post) => post.expiresAt)
      .sort((a, b) => new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime())
      .slice(0, 8);
    const sagas = posts
      .filter((post) => post.visibilityMode === PantryVisibilityMode.PERMANENT && post.kind !== 'burn')
      .sort((a, b) => (b.commentCount + b.bookmarkCount) - (a.commentCount + a.bookmarkCount))
      .slice(0, 8);
    const rising = posts
      .filter((post) => now - new Date(post.createdAt).getTime() < 24 * 3600_000)
      .sort((a, b) => b.radarScore - a.radarScore)
      .slice(0, 8);
    const coffeeLeaderboard = byScore
      .filter((post) => post.coffee)
      .slice(0, 6)
      .map((post) => ({
        authorId: post.authorId,
        alias: post.anonymousAlias,
        color: post.aliasColor,
        radarScore: post.radarScore,
        coffee: post.coffee,
      }));

    return {
      radar: byScore.slice(0, 30),
      rising,
      burningSoon,
      sagas,
      marketSignals: listings.slice(0, 8),
      coffeeLeaderboard,
    };
  }

  private computeRadarScore(input: {
    heatScore: number;
    reactionCount: number;
    bookmarkCount: number;
    commentCount: number;
    reputation: number;
    createdAt: Date;
  }) {
    const ageHours = Math.max(1, (Date.now() - input.createdAt.getTime()) / 3600_000);
    const engagement =
      input.heatScore +
      input.reactionCount * 2 +
      input.commentCount * 4 +
      input.bookmarkCount * 5 +
      Math.floor(input.reputation / 10);
    return Math.round((engagement * 100) / Math.pow(ageHours + 2, 1.15));
  }

  private serializeOrder(order: Prisma.TradeOrderGetPayload<{ include: typeof orderInclude }>, currentUserId: number) {
    return {
      id: order.id,
      listingId: order.listingId,
      listingTitle: order.listing.title,
      buyerId: order.buyerId,
      sellerId: order.sellerId,
      counterpartyAlias:
        currentUserId === order.buyerId
          ? order.seller.communityIdentity?.alias || '匿名卖家'
          : order.buyer.communityIdentity?.alias || '匿名买家',
      status: order.status,
      note: order.note,
      offPlatformNote: order.offPlatformNote,
      disputeReason: order.disputeReason,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }

  private serializeConversation(conversation: any, currentUserId: number) {
    const other = conversation.userAId === currentUserId ? conversation.userB : conversation.userA;
    return {
      id: conversation.id,
      otherUserId: other.id,
      otherAlias: other.communityIdentity?.alias || other.nickname || '匿名用户',
      otherColor: other.communityIdentity?.color || '#00ff41',
      listingId: conversation.listingId || null,
      orderId: conversation.orderId || null,
      lastMessage: conversation.lastMessage || conversation.messages?.[0]?.content || '',
      lastAt: conversation.lastAt,
      latestMessage: conversation.messages?.[0] ? this.serializeMessage(conversation.messages[0]) : null,
      unreadCount: conversation._count?.messages || 0,
    };
  }

  private serializeMessage(message: any) {
    return {
      id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      content: message.content,
      createdAt: message.createdAt,
      anonymousAlias: message.sender?.communityIdentity?.alias || '匿名用户',
      aliasColor: message.sender?.communityIdentity?.color || '#00ff41',
    };
  }

  private requireText(value: unknown, field: string, max = 5000) {
    const text = this.normalizeText(value, max);
    if (!text) throw new BadRequestException(`${field} is required`);
    return text;
  }

  private requireSafeText(value: unknown, field: string, max = 5000) {
    const text = this.requireText(value, field, max);
    this.assertSafeCommunityText(text);
    return text;
  }

  private requireSafeOptionalText(value: unknown, max = 5000) {
    const text = this.normalizeText(value, max);
    if (!text) return null;
    this.assertSafeCommunityText(text);
    return text;
  }

  private normalizeText(value: unknown, max = 5000) {
    const text = String(value || '').trim();
    if (!text) return '';
    return text.slice(0, max);
  }

  private normalizeCoffeeUrl(value: unknown) {
    const text = this.normalizeText(value, 2000);
    if (!text) return null;
    this.assertSafeCommunityText(text);
    try {
      const url = new URL(text);
      if (url.protocol !== 'https:') {
        throw new BadRequestException('咖啡码只允许 https 图片或收款页链接');
      }
      return url.toString();
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      throw new BadRequestException('咖啡码链接格式不正确');
    }
  }

  private parseVisibility(value: unknown) {
    const normalized = String(value || 'PERMANENT').toUpperCase();
    return normalized === 'EPHEMERAL' ? PantryVisibilityMode.EPHEMERAL : PantryVisibilityMode.PERMANENT;
  }

  private resolveExpiry(ttlMinutes?: number) {
    const allowed = new Set([30, 120, 720, 1440]);
    const ttl = allowed.has(Number(ttlMinutes)) ? Number(ttlMinutes) : 30;
    return new Date(Date.now() + ttl * 60_000);
  }

  private resolveListingExpiry(days?: number) {
    const normalized = Number(days);
    const safeDays = Number.isFinite(normalized) && normalized > 0 ? Math.min(normalized, 30) : 14;
    return new Date(Date.now() + safeDays * 24 * 3600_000);
  }

  private parseReaction(value: string) {
    const normalized = String(value || '').toUpperCase();
    if (normalized in PantryReactionType) return normalized as PantryReactionType;
    return PantryReactionType.EYES;
  }

  private parseReportTarget(value?: string) {
    const normalized = String(value || '').toUpperCase();
    if (normalized in PantryReportTargetType) return normalized as PantryReportTargetType;
    throw new BadRequestException('Unsupported report target');
  }

  private parseListingType(value?: string) {
    const normalized = String(value || 'SELL').toUpperCase();
    return normalized === MarketListingType.WANTED ? MarketListingType.WANTED : MarketListingType.SELL;
  }

  private parseOrderStatus(value?: string) {
    const normalized = String(value || '').toUpperCase();
    if (normalized in TradeOrderStatus) return normalized as TradeOrderStatus;
    throw new BadRequestException('Unsupported order status');
  }

  private emitOrderSnapshots(order: Prisma.TradeOrderGetPayload<{ include: typeof orderInclude }>) {
    this.gateway.emitOrderTo(order.buyerId, { order: this.serializeOrder(order, order.buyerId) });
    this.gateway.emitOrderTo(order.sellerId, { order: this.serializeOrder(order, order.sellerId) });
  }

  private async notifyOrderLifecycle(
    order: Prisma.TradeOrderGetPayload<{ include: typeof orderInclude }>,
    event: 'created' | 'status',
  ) {
    const listingTitle = order.listing.title;
    if (event === 'created') {
      await this.createNotification(order.sellerId, {
        type: PantryNotificationType.ORDER,
        title: '黑市暗单收到新询单',
        body: `有人对「${listingTitle}」下单了，请尽快确认。`,
        targetType: 'ORDER',
        targetId: order.id,
      });
      await this.createNotification(order.buyerId, {
        type: PantryNotificationType.ORDER,
        title: '暗单已提交',
        body: `你对「${listingTitle}」的下单已送达卖家。`,
        targetType: 'ORDER',
        targetId: order.id,
      });
      return;
    }

    const statusText: Record<TradeOrderStatus, string> = {
      REQUESTED: '等待卖家确认',
      ACCEPTED: '卖家已接单',
      PAID_OFF_PLATFORM: '买家已标记线下付款',
      COMPLETED: '交易已完成',
      CANCELLED: '交易已取消，商品已恢复可见',
      DISPUTED: '交易进入纠纷状态',
    };
    await Promise.all([order.buyerId, order.sellerId].map((userId) =>
      this.createNotification(userId, {
        type: PantryNotificationType.ORDER,
        title: '黑市暗单状态更新',
        body: `「${listingTitle}」${statusText[order.status]}。`,
        targetType: 'ORDER',
        targetId: order.id,
      }),
    ));
  }

  private async createNotification(
    userId: number,
    input: {
      type: PantryNotificationType;
      title: string;
      body?: string | null;
      targetType?: string;
      targetId?: number;
    },
  ) {
    const notification = await this.prisma.pantryNotification.create({
      data: {
        userId,
        type: input.type,
        title: this.normalizeText(input.title, 160),
        body: this.normalizeText(input.body, 1000) || null,
        targetType: input.targetType || null,
        targetId: input.targetId || null,
      },
    });
    this.gateway.emitNotification(userId, notification);
    return notification;
  }

  private assertOrderTransition(order: { buyerId: number; sellerId: number; status: TradeOrderStatus }, userId: number, next: TradeOrderStatus) {
    if (order.status === TradeOrderStatus.COMPLETED || order.status === TradeOrderStatus.CANCELLED) {
      throw new BadRequestException('Order is closed');
    }
    if (order.status === TradeOrderStatus.DISPUTED && next !== TradeOrderStatus.COMPLETED) {
      throw new BadRequestException('Disputed order can only be completed after resolution');
    }
    if (next === TradeOrderStatus.ACCEPTED && userId !== order.sellerId) {
      throw new ForbiddenException('Only seller can accept');
    }
    if (next === TradeOrderStatus.ACCEPTED && order.status !== TradeOrderStatus.REQUESTED) {
      throw new BadRequestException('Only requested orders can be accepted');
    }
    if (next === TradeOrderStatus.PAID_OFF_PLATFORM && userId !== order.buyerId) {
      throw new ForbiddenException('Only buyer can mark off-platform payment');
    }
    if (next === TradeOrderStatus.PAID_OFF_PLATFORM && order.status !== TradeOrderStatus.ACCEPTED) {
      throw new BadRequestException('Only accepted orders can be marked paid');
    }
    if (next === TradeOrderStatus.COMPLETED && userId !== order.buyerId) {
      throw new ForbiddenException('Only buyer can complete');
    }
    if (next === TradeOrderStatus.COMPLETED && !([TradeOrderStatus.PAID_OFF_PLATFORM, TradeOrderStatus.DISPUTED] as TradeOrderStatus[]).includes(order.status)) {
      throw new BadRequestException('Only paid or disputed orders can be completed');
    }
    if (next === TradeOrderStatus.CANCELLED) {
      if (order.status === TradeOrderStatus.PAID_OFF_PLATFORM) {
        throw new BadRequestException('Paid orders cannot be cancelled; open a dispute instead');
      }
      if (order.status === TradeOrderStatus.ACCEPTED && userId !== order.sellerId) {
        throw new ForbiddenException('Only seller can cancel accepted unpaid orders');
      }
      return;
    }
    if (next === TradeOrderStatus.DISPUTED) {
      if (!([TradeOrderStatus.ACCEPTED, TradeOrderStatus.PAID_OFF_PLATFORM] as TradeOrderStatus[]).includes(order.status)) {
        throw new BadRequestException('Only active orders can be disputed');
      }
      return;
    }
  }

  private assertLegalMarketText(text: string) {
    const hit = BANNED_MARKET_TERMS.find((term) => text.includes(term));
    if (hit) {
      throw new BadRequestException(`交易区禁止发布：${hit}`);
    }
  }

  private assertSafeCommunityText(text: string) {
    const lowered = text.toLowerCase();
    const hit = BANNED_COMMUNITY_TERMS.find((term) => lowered.includes(term.toLowerCase()));
    if (hit) {
      throw new BadRequestException(`茶水间禁止发布：${hit}`);
    }
  }
}
