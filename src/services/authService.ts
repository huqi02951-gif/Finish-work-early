import { User } from '../types';

const AUTH_STORAGE_KEY = 'fwe:auth-session';
const DEMO_SESSION_STORAGE = 'fwe:demo-session';
const DEMO_CLIENT_KEY_STORAGE = 'fwe:demo-client-key';

export interface AuthSession {
  accessToken: string;
  user: User;
  loginMethod: 'email' | 'phone' | 'demo';
  loginTime: string;
}

/**
 * Get the current auth session (real login, not demo)
 */
export function getAuthSession(): AuthSession | null {
  const stored = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as AuthSession;
  } catch {
    return null;
  }
}

/**
 * Save auth session to localStorage
 */
export function setAuthSession(session: AuthSession): void {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  // Clear demo session if exists
  localStorage.removeItem(DEMO_SESSION_STORAGE);
  localStorage.removeItem(DEMO_CLIENT_KEY_STORAGE);
}

/**
 * Clear auth session (logout)
 */
export function clearAuthSession(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

/**
 * Check if user is authenticated (real login, not demo)
 */
export function isAuthenticated(): boolean {
  const session = getAuthSession();
  return session !== null && session.loginMethod !== 'demo';
}

/**
 * Check if current session is demo/guest mode
 */
export function isDemoSession(): boolean {
  const session = getAuthSession();
  if (session?.loginMethod === 'demo') return true;
  // Also check if only demo session exists
  const demoSession = localStorage.getItem(DEMO_SESSION_STORAGE);
  return !session && !!demoSession;
}

/**
 * Get the best available token (real auth first, then demo)
 */
export function getBestToken(): string | null {
  const session = getAuthSession();
  if (session) return session.accessToken;

  const demoSession = localStorage.getItem(DEMO_SESSION_STORAGE);
  if (demoSession) {
    try {
      const parsed = JSON.parse(demoSession) as { accessToken: string };
      return parsed.accessToken;
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Get the best available user info
 */
export function getBestUser(): User | null {
  const session = getAuthSession();
  if (session) return session.user;

  const demoSession = localStorage.getItem(DEMO_SESSION_STORAGE);
  if (demoSession) {
    try {
      const parsed = JSON.parse(demoSession) as { user: User };
      return parsed.user;
    } catch {
      return null;
    }
  }
  return null;
}
