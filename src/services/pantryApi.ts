import { io, Socket } from 'socket.io-client';
import { getBestToken } from './authService';

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : '')
).replace(/\/$/, '');

const API_ROOT = `${API_BASE_URL}/api/v1`;

export type PantryPostKind = 'burn' | 'gossip' | 'thread';
export type PantryVisibilityMode = 'PERMANENT' | 'EPHEMERAL';
export type ReactionType = 'FIRE' | 'BRICK' | 'EYES' | 'TEA' | 'SUPPORT';
export type ListingType = 'SELL' | 'WANTED';
export type ListingStatus = 'ACTIVE' | 'RESERVED' | 'SOLD' | 'CANCELLED' | 'HIDDEN' | 'EXPIRED';
export type OrderStatus = 'REQUESTED' | 'ACCEPTED' | 'PAID_OFF_PLATFORM' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED';

export interface CommunityIdentity {
  id: number;
  userId: number;
  alias: string;
  color: string;
  status: string;
  coffeeQrUrl?: string | null;
  coffeeNote?: string | null;
  coffeePublic?: boolean;
  reputation?: number;
}

export interface PantryPost {
  id: number;
  title: string;
  content: string;
  kind: PantryPostKind;
  visibilityMode: PantryVisibilityMode;
  expiresAt?: string | null;
  anonymousAlias: string;
  aliasColor: string;
  heatScore: number;
  reactionCount: number;
  bookmarkCount?: number;
  commentCount: number;
  radarScore?: number;
  coffee?: {
    qrUrl: string;
    note?: string | null;
  } | null;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  authorId: number;
}

export interface MarketListing {
  id: number;
  type: ListingType;
  title: string;
  description: string;
  category: string;
  condition?: string | null;
  priceText?: string | null;
  priceCents?: number | null;
  status: ListingStatus;
  anonymousAlias: string;
  aliasColor: string;
  sellerId: number;
  isMine: boolean;
  orderCount: number;
  expiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TradeOrder {
  id: number;
  listingId: number;
  listingTitle: string;
  buyerId: number;
  sellerId: number;
  counterpartyAlias: string;
  status: OrderStatus;
  note?: string | null;
  offPlatformNote?: string | null;
  disputeReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PantryConversation {
  id: number;
  otherUserId: number;
  otherAlias: string;
  otherColor: string;
  listingId?: number | null;
  orderId?: number | null;
  lastMessage: string;
  lastAt: string;
  latestMessage?: DirectMessage | null;
  unreadCount?: number;
}

export interface DirectMessage {
  id: number;
  conversationId: number;
  senderId: number;
  content: string;
  createdAt: string;
  anonymousAlias: string;
  aliasColor: string;
}

export interface PantryFeed {
  identity: CommunityIdentity;
  posts: PantryPost[];
  listings: MarketListing[];
  conversations: PantryConversation[];
  orders: TradeOrder[];
  radar?: PantryPost[];
  rising?: PantryPost[];
  burningSoon?: PantryPost[];
  sagas?: PantryPost[];
  marketSignals?: MarketListing[];
  coffeeLeaderboard?: Array<{
    authorId: number;
    alias: string;
    color: string;
    radarScore: number;
    coffee: {
      qrUrl: string;
      note?: string | null;
    };
  }>;
}

export interface PantryNotification {
  id: number;
  userId: number;
  type: 'ORDER' | 'MESSAGE' | 'REPORT' | 'SYSTEM';
  title: string;
  body?: string | null;
  targetType?: string | null;
  targetId?: number | null;
  readAt?: string | null;
  createdAt: string;
}

function requireToken() {
  const token = getBestToken();
  if (!token) {
    throw new Error('请先登录后再进入地下茶水间');
  }
  return token;
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const token = requireToken();
  const response = await fetch(`${API_ROOT}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init?.headers || {}),
    },
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const payload = await response.json();
      if (payload?.message) message = Array.isArray(payload.message) ? payload.message.join(', ') : String(payload.message);
    } catch {
      const text = await response.text();
      if (text) message = text;
    }
    throw new Error(message);
  }
  return response.json() as Promise<T>;
}

export const pantryApi = {
  getFeed: () => requestJson<PantryFeed>('/pantry/feed'),
  getPostDetail: (postId: number) => requestJson<PantryPost>(`/pantry/posts/${postId}`),
  createPost: (input: {
    title: string;
    content: string;
    kind: PantryPostKind;
    visibilityMode: PantryVisibilityMode;
    ttlMinutes?: number;
    tags?: string[];
  }) => requestJson<PantryPost>('/pantry/posts', { method: 'POST', body: JSON.stringify(input) }),
  createComment: (postId: number, content: string) =>
    requestJson(`/pantry/posts/${postId}/comments`, { method: 'POST', body: JSON.stringify({ content }) }),
  listComments: (postId: number) => requestJson(`/pantry/posts/${postId}/comments`),
  react: (postId: number, type: ReactionType) =>
    requestJson(`/pantry/posts/${postId}/reactions`, { method: 'POST', body: JSON.stringify({ type }) }),
  bookmark: (postId: number) =>
    requestJson(`/pantry/posts/${postId}/bookmarks`, { method: 'POST' }),
  updateCoffeeProfile: (input: { coffeeQrUrl?: string; coffeeNote?: string; coffeePublic?: boolean }) =>
    requestJson('/pantry/me/coffee', { method: 'PATCH', body: JSON.stringify(input) }),
  report: (input: { targetType: 'POST' | 'COMMENT' | 'LISTING' | 'MESSAGE'; targetId: number; reason: string; detail?: string }) =>
    requestJson('/pantry/reports', { method: 'POST', body: JSON.stringify(input) }),
  listListings: () => requestJson<MarketListing[]>('/pantry/listings'),
  createListing: (input: {
    type: ListingType;
    title: string;
    description: string;
    category: string;
    condition?: string;
    priceText?: string;
    expiresInDays?: number;
  }) => requestJson<MarketListing>('/pantry/listings', { method: 'POST', body: JSON.stringify(input) }),
  createOrder: (listingId: number, note?: string) =>
    requestJson<TradeOrder>(`/pantry/listings/${listingId}/orders`, { method: 'POST', body: JSON.stringify({ note }) }),
  listMyOrders: (params: { status?: OrderStatus; take?: number } = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.set('status', params.status);
    if (params.take) query.set('take', String(params.take));
    const suffix = query.toString() ? `?${query.toString()}` : '';
    return requestJson<TradeOrder[]>(`/pantry/orders/me${suffix}`);
  },
  updateOrderStatus: (orderId: number, status: OrderStatus, note?: string) =>
    requestJson<TradeOrder>(`/pantry/orders/${orderId}/status`, { method: 'PATCH', body: JSON.stringify({ status, note }) }),
  listNotifications: (take = 50) => requestJson<PantryNotification[]>(`/pantry/notifications?take=${take}`),
  markNotificationRead: (notificationId: number) =>
    requestJson<PantryNotification>(`/pantry/notifications/${notificationId}/read`, { method: 'PATCH' }),
  listConversations: () => requestJson<PantryConversation[]>('/pantry/conversations'),
  createConversation: (input: { recipientId: number; listingId?: number; orderId?: number; message?: string }) =>
    requestJson<PantryConversation>('/pantry/conversations', { method: 'POST', body: JSON.stringify(input) }),
  getMessages: (conversationId: number) => requestJson<DirectMessage[]>(`/pantry/conversations/${conversationId}/messages`),
  sendMessage: (conversationId: number, content: string) =>
    requestJson<DirectMessage>(`/pantry/conversations/${conversationId}/messages`, { method: 'POST', body: JSON.stringify({ content }) }),
};

export function connectPantrySocket() {
  const token = getBestToken();
  if (!token) return null;

  const socket: Socket = io(`${API_BASE_URL}/pantry`, {
    transports: ['websocket', 'polling'],
    auth: { token },
  });
  socket.on('connect', () => socket.emit('auth', { token }));
  return socket;
}
