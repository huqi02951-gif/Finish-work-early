
export type UserRole = 'admin' | 'user' | 'manager';

export interface User {
  id: string;
  nickname: string;
  avatar: string;
  role: UserRole;
  email?: string;
  createdAt: string;
}

export type PostStatus = 'draft' | 'pending' | 'published' | 'archived';

export interface Post {
  id: string;
  userId: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  images: string[];
  status: PostStatus;
  createdAt: string;
  updatedAt: string;
  author?: User;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: string;
  author?: User;
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
