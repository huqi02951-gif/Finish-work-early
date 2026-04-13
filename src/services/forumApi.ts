import type { Comment, ForumBoard, Post, User } from '../types';
import { getAuthSession } from './authService';

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : '')
).replace(/\/$/, '');

const API_ROOT = `${API_BASE_URL}/api/v1`;

interface BackendUser {
  id: number;
  username: string;
  nickname: string;
  role: 'USER' | 'MANAGER' | 'ADMIN';
  createdAt: string;
}

interface BackendForumBoard {
  id: number;
  slug: string;
  name: string;
  description?: string | null;
  isOfficial: boolean;
  requiresReview: boolean;
  sortOrder: number;
  postCount: number;
}

interface BackendForumTag {
  id: number;
  slug: string;
  name: string;
}

interface BackendForumPost {
  id: number;
  title: string;
  summary?: string | null;
  content: string;
  board?: {
    id: number;
    slug: string;
    name: string;
    isOfficial: boolean;
  } | null;
  postType: 'DISCUSSION' | 'TOPIC' | 'GUIDE' | 'FAQ' | 'UPDATE';
  isOfficial: boolean;
  isPinned: boolean;
  status: 'PUBLISHED' | 'PENDING' | 'HIDDEN' | 'REJECTED' | 'ARCHIVED';
  category: string;
  relatedProductSlug?: string | null;
  relatedSkillSlug?: string | null;
  relatedPageKey?: string | null;
  createdAt: string;
  updatedAt: string;
  author?: BackendUser | null;
  tags: BackendForumTag[];
  commentCount: number;
  commentsLocked: boolean;
  contentData?: unknown;
}

interface BackendForumComment {
  id: number;
  postId: number;
  content: string;
  status: 'PUBLISHED' | 'HIDDEN';
  createdAt: string;
  updatedAt: string;
  author?: BackendUser | null;
}

interface PagedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

function mapRole(role: BackendUser['role']): User['role'] {
  if (role === 'ADMIN') return 'admin';
  if (role === 'MANAGER') return 'manager';
  return 'user';
}

function mapUser(user?: BackendUser | null): User | undefined {
  if (!user) return undefined;
  return {
    id: String(user.id),
    nickname: user.nickname || user.username,
    avatar: '',
    role: mapRole(user.role),
    createdAt: user.createdAt,
  };
}

function mapBoard(board?: BackendForumPost['board']): ForumBoard | null {
  if (!board) return null;
  return {
    id: board.id,
    slug: board.slug,
    name: board.name,
    isOfficial: board.isOfficial,
    requiresReview: false,
    sortOrder: 0,
    postCount: 0,
  };
}

function mapStatus(status: BackendForumPost['status']): Post['status'] {
  if (status === 'PENDING') return 'pending';
  if (status === 'HIDDEN') return 'hidden';
  if (status === 'REJECTED') return 'rejected';
  if (status === 'ARCHIVED') return 'archived';
  return 'published';
}

function mapPost(post: BackendForumPost): Post {
  return {
    id: String(post.id),
    userId: post.author ? String(post.author.id) : '',
    title: post.title,
    summary: post.summary || undefined,
    content: post.content,
    category: post.category,
    tags: post.tags.map((item) => item.name),
    images: [],
    status: mapStatus(post.status),
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    author: mapUser(post.author),
    board: mapBoard(post.board),
    commentCount: post.commentCount,
    postType: post.postType,
    isOfficial: post.isOfficial,
    isPinned: post.isPinned,
    commentsLocked: post.commentsLocked,
    relatedProductSlug: post.relatedProductSlug || undefined,
    relatedSkillSlug: post.relatedSkillSlug || undefined,
    relatedPageKey: post.relatedPageKey || undefined,
    contentData: post.contentData,
  };
}

function mapComment(comment: BackendForumComment): Comment {
  return {
    id: String(comment.id),
    postId: String(comment.postId),
    userId: comment.author ? String(comment.author.id) : '',
    content: comment.content,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    status: comment.status,
    author: mapUser(comment.author),
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

function buildQuery(params: Record<string, string | number | boolean | undefined>) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value));
    }
  });
  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

function requireRealToken() {
  const session = getAuthSession();
  if (!session || session.loginMethod === 'demo') {
    throw new Error('请先登录后再操作');
  }
  return session.accessToken;
}

export const forumApi = {
  async getBoards(): Promise<ForumBoard[]> {
    return requestJson<BackendForumBoard[]>('/forum/boards');
  },

  async getPosts(params: {
    boardSlug?: string;
    postType?: string;
    isOfficial?: boolean;
    tag?: string;
    q?: string;
    page?: number;
    pageSize?: number;
  } = {}): Promise<PagedResponse<Post>> {
    const response = await requestJson<PagedResponse<BackendForumPost>>(
      `/forum/posts${buildQuery(params)}`,
    );
    return {
      ...response,
      items: response.items.map(mapPost),
    };
  },

  async getOfficialPosts(params: { boardSlug?: string; pageSize?: number } = {}): Promise<PagedResponse<Post>> {
    return this.getPosts({
      ...params,
      isOfficial: true,
    });
  },

  async getPostDetail(id: string | number): Promise<Post> {
    const response = await requestJson<BackendForumPost>(`/forum/posts/${id}`);
    return mapPost(response);
  },

  async getPostComments(id: string | number, params: { page?: number; pageSize?: number } = {}): Promise<PagedResponse<Comment>> {
    const response = await requestJson<PagedResponse<BackendForumComment>>(
      `/forum/posts/${id}/comments${buildQuery(params)}`,
    );
    return {
      ...response,
      items: response.items.map(mapComment),
    };
  },

  async createPost(input: {
    boardSlug: string;
    title: string;
    content: string;
    summary?: string;
    tags?: string[];
    postType?: string;
    relatedProductSlug?: string;
    relatedSkillSlug?: string;
    relatedPageKey?: string;
  }): Promise<Post> {
    const token = requireRealToken();
    const response = await requestJson<BackendForumPost>('/forum/posts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(input),
    });
    return mapPost(response);
  },

  async updatePost(id: string | number, input: {
    boardSlug?: string;
    title?: string;
    content?: string;
    summary?: string;
    tags?: string[];
  }): Promise<Post> {
    const token = requireRealToken();
    const response = await requestJson<BackendForumPost>(`/forum/posts/${id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(input),
    });
    return mapPost(response);
  },

  async deletePost(id: string | number): Promise<Post> {
    const token = requireRealToken();
    const response = await requestJson<BackendForumPost>(`/forum/posts/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return mapPost(response);
  },

  async createComment(id: string | number, content: string): Promise<Comment> {
    const token = requireRealToken();
    const response = await requestJson<BackendForumComment>(`/forum/posts/${id}/comments`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    });
    return mapComment(response);
  },

  async getMyPosts(params: { page?: number; pageSize?: number } = {}): Promise<PagedResponse<Post>> {
    const token = requireRealToken();
    const response = await requestJson<PagedResponse<BackendForumPost>>(
      `/forum/me/posts${buildQuery(params)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return {
      ...response,
      items: response.items.map(mapPost),
    };
  },
};
