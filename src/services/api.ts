import { User } from '../types';
import { getAuthSession, getBestToken, getBestUser } from './authService';

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
interface BackendUser {
  id: number;
  username: string;
  nickname: string;
  email?: string;
  phone?: string;
  role: BackendRole;
  createdAt: string;
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

function mapBackendUser(user: BackendUser): User {
  return {
    id: String(user.id),
    nickname: user.nickname || user.username,
    avatar: '',
    role: mapBackendRole(user.role),
    createdAt: user.createdAt,
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
  }
};
