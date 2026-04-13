
export type UserRole = 'admin' | 'user' | 'manager';

export interface User {
  id: string;
  nickname: string;
  avatar: string;
  role: UserRole;
  email?: string;
  createdAt: string;
}

export type PostStatus = 'draft' | 'pending' | 'published' | 'hidden' | 'rejected' | 'archived';
export type ForumPostStatus = 'PUBLISHED' | 'PENDING' | 'HIDDEN' | 'REJECTED' | 'ARCHIVED';
export type ForumPostType = 'DISCUSSION' | 'TOPIC' | 'GUIDE' | 'FAQ' | 'UPDATE';

export interface ForumBoard {
  id: number;
  slug: string;
  name: string;
  description?: string | null;
  isOfficial: boolean;
  requiresReview: boolean;
  sortOrder: number;
  postCount: number;
}

export interface ForumTag {
  id: number;
  slug: string;
  name: string;
}

export interface Post {
  id: string;
  userId: string;
  title: string;
  summary?: string | null;
  content: string;
  category: string;
  tags: string[];
  images: string[];
  status: PostStatus;
  createdAt: string;
  updatedAt: string;
  author?: User;
  board?: ForumBoard | null;
  commentCount?: number;
  postType?: ForumPostType;
  isOfficial?: boolean;
  isPinned?: boolean;
  commentsLocked?: boolean;
  relatedProductSlug?: string | null;
  relatedSkillSlug?: string | null;
  relatedPageKey?: string | null;
  contentData?: unknown;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: string;
  author?: User;
  updatedAt?: string;
  status?: 'PUBLISHED' | 'HIDDEN';
}

export interface Notification {
  id: string;
  userId: string;
  type: 'system' | 'comment' | 'like' | 'audit';
  content: string;
  read: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  operatorId: string;
  action: string;
  targetType: string;
  targetId: string;
  createdAt: string;
}
