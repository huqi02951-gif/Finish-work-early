
import { MOCK_USER, MOCK_POSTS, MOCK_NOTIFICATIONS } from '../mock/data';
import { Post, Notification, User } from '../types';

/**
 * API Service Layer
 * 
 * Future Integration:
 * - Replace mock returns with fetch/axios calls to your backend (Firebase, Supabase, etc.)
 * - Use environment variables for API base URLs
 */

export const apiService = {
  // User APIs
  getCurrentUser: async (): Promise<User> => {
    // Future: GET /api/me
    return Promise.resolve(MOCK_USER);
  },

  // Post APIs
  getPosts: async (category?: string): Promise<Post[]> => {
    // Future: GET /api/posts?category=${category}
    let posts = [...MOCK_POSTS];
    if (category) {
      posts = posts.filter(p => p.category === category);
    }
    return Promise.resolve(posts);
  },

  getPostById: async (id: string): Promise<Post | undefined> => {
    // Future: GET /api/posts/${id}
    return Promise.resolve(MOCK_POSTS.find(p => p.id === id));
  },

  createPost: async (post: Partial<Post>): Promise<Post> => {
    // Future: POST /api/posts
    const newPost: Post = {
      id: Math.random().toString(36).substr(2, 9),
      userId: MOCK_USER.id,
      title: post.title || '',
      content: post.content || '',
      category: post.category || '未分类',
      tags: post.tags || [],
      images: post.images || [],
      status: 'pending', // Default to pending for audit
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: MOCK_USER,
    };
    return Promise.resolve(newPost);
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
