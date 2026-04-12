import { MOCK_NOTIFICATIONS } from '../mock/data';
import { Post, Notification, User } from '../types';
import { getAuthSession, getBestToken, getBestUser, isDemoSession } from './authService';

/**
 * API Service Layer
 * 
 * Future Integration:
 * Phase 1:
 * - Feed / publish 已切到真实后端
 * - 通知仍保留 mock，下一阶段接入
 */

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:3000' 
    : '')
).replace(/\/$/, '');
const API_ROOT = `${API_BASE_URL}/api/v1`;
const DEMO_CLIENT_KEY_STORAGE = 'fwe:demo-client-key';
const DEMO_SESSION_STORAGE = 'fwe:demo-session';

type BackendRole = 'USER' | 'ADMIN' | 'MANAGER';
type BackendPostStatus = 'PUBLISHED' | 'PENDING' | 'ARCHIVED';

interface BackendUser {
  id: number;
  username: string;
  nickname: string;
  email?: string;
  phone?: string;
  role: BackendRole;
  createdAt: string;
}

interface BackendPost {
  id: number;
  authorId: number;
  title: string;
  content: string;
  category: string;
  status: BackendPostStatus;
  createdAt: string;
  updatedAt: string;
  author: BackendUser;
  _count?: {
    comments: number;
  };
}

interface DemoSession {
  accessToken: string;
  user: User;
}

let demoSessionPromise: Promise<DemoSession> | null = null;

function getDemoClientKey(): string {
  const stored = localStorage.getItem(DEMO_CLIENT_KEY_STORAGE);
  if (stored) return stored;

  const next = crypto.randomUUID();
  localStorage.setItem(DEMO_CLIENT_KEY_STORAGE, next);
  return next;
}

function mapBackendRole(role: BackendRole): User['role'] {
  if (role === 'ADMIN') return 'admin';
  if (role === 'MANAGER') return 'manager';
  return 'user';
}

function mapBackendStatus(status: BackendPostStatus): Post['status'] {
  if (status === 'PENDING') return 'pending';
  if (status === 'ARCHIVED') return 'archived';
  return 'published';
}

function mapBackendUser(user: BackendUser): User {
  return {
    id: String(user.id),
    nickname: user.nickname || user.username,
    avatar: '',
    role: mapBackendRole(user.role),
    createdAt: user.createdAt,
  };
}

function mapBackendPost(post: BackendPost): Post {
  return {
    id: String(post.id),
    userId: String(post.authorId),
    title: post.title,
    content: post.content,
    category: post.category || '经验分享',
    tags: [],
    images: [],
    status: mapBackendStatus(post.status),
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    author: mapBackendUser(post.author),
  };
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_ROOT}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const payload = await response.json();
      if (payload?.message) {
        message = Array.isArray(payload.message) ? payload.message.join(', ') : String(payload.message);
      }
    } catch {
      const text = await response.text();
      if (text) message = text;
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

async function createDemoSession(): Promise<DemoSession> {
  const payload = await requestJson<{
    access_token: string;
    user: BackendUser;
  }>('/auth/demo-session', {
    method: 'POST',
    body: JSON.stringify({
      clientKey: getDemoClientKey(),
      nickname: '当前浏览器用户',
    }),
  });

  const session: DemoSession = {
    accessToken: payload.access_token,
    user: mapBackendUser(payload.user),
  };
  localStorage.setItem(DEMO_SESSION_STORAGE, JSON.stringify(session));
  return session;
}

async function ensureDemoSession(forceRefresh = false): Promise<DemoSession> {
  if (!forceRefresh) {
    const stored = localStorage.getItem(DEMO_SESSION_STORAGE);
    if (stored) {
      try {
        return JSON.parse(stored) as DemoSession;
      } catch {
        localStorage.removeItem(DEMO_SESSION_STORAGE);
      }
    }
  }

  if (!demoSessionPromise || forceRefresh) {
    demoSessionPromise = createDemoSession().finally(() => {
      demoSessionPromise = null;
    });
  }

  return demoSessionPromise;
}

async function withAuth<T>(builder: (token: string) => Promise<T>): Promise<T> {
  // Prefer real auth token first
  const realToken = getBestToken();
  if (realToken) {
    return builder(realToken);
  }
  // Fallback to demo session
  try {
    const session = await ensureDemoSession();
    return await builder(session.accessToken);
  } catch (error) {
    if (error instanceof Error && /401|Unauthorized/i.test(error.message)) {
      const refreshed = await ensureDemoSession(true);
      return builder(refreshed.accessToken);
    }
    throw error;
  }
}

export const apiService = {
  // Auth APIs
  sendEmailCode: async (email: string): Promise<{ success: boolean; message: string }> => {
    return requestJson('/auth/email/send-code', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  verifyEmailCode: async (email: string, code: string): Promise<{ access_token: string; user: BackendUser }> => {
    return requestJson('/auth/email/verify', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });
  },

  logout: async (): Promise<{ success: boolean; message: string }> => {
    const token = getBestToken();
    if (!token) return { success: true, message: '已退出' };
    return requestJson('/auth/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // User APIs
  getCurrentUser: async (): Promise<User> => {
    // Prefer real auth user
    const session = getAuthSession();
    if (session) return session.user;
    const realUser = getBestUser();
    if (realUser) return realUser;
    // Fallback to demo session
    const demoSession = await ensureDemoSession();
    return demoSession.user;
  },

  // Post APIs
  getPosts: async (category?: string): Promise<Post[]> => {
    const search = category ? `?category=${encodeURIComponent(category)}` : '';
    const posts = await requestJson<BackendPost[]>(`/posts${search}`);
    return posts.map(mapBackendPost);
  },

  getPostById: async (id: string): Promise<Post | undefined> => {
    if (!id) return undefined;
    const post = await requestJson<BackendPost>(`/posts/${id}`);
    return mapBackendPost(post);
  },

  createPost: async (post: Partial<Post>): Promise<Post> => {
    const created = await withAuth((token) =>
      requestJson<BackendPost>('/posts', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: post.title || '',
          content: post.content || '',
          category: post.category || '经验分享',
        }),
      }),
    );

    return mapBackendPost(created);
  },

  getMyPosts: async (): Promise<Post[]> => {
    const posts = await withAuth((token) =>
      requestJson<BackendPost[]>('/users/me/posts', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    );
    return posts.map(mapBackendPost);
  },

  createComment: async (postId: string, content: string): Promise<any> => {
    return withAuth((token) =>
      requestJson(`/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      }),
    );
  },

  // Notification APIs
  getNotifications: async (): Promise<Notification[]> => {
    // Future: GET /api/notifications
    return Promise.resolve(MOCK_NOTIFICATIONS);
  },

  markNotificationAsRead: async (id: string): Promise<void> => {
    // Future: PATCH /api/notifications/${id}/read
    return Promise.resolve();
  }
};
