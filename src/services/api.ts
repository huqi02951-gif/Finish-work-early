
import { MOCK_USER, MOCK_POSTS, MOCK_NOTIFICATIONS } from '../mock/data';
import { Post, Notification, User } from '../types';
import { getLocalPosts, saveLocalPost } from '../../lib/localDB';

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
    const localPosts = await getLocalPosts('feed');
    const posts = [
      ...localPosts.map((post): Post => ({
        id: `local-${post.id}`,
        userId: 'local-user',
        title: post.title || '未命名内容',
        content: post.content,
        category: String(post.metadata?.category || '经验分享'),
        tags: Array.isArray(post.metadata?.tags) ? post.metadata.tags : [],
        images: Array.isArray(post.metadata?.images) ? post.metadata.images : [],
        status: 'published',
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.createdAt.toISOString(),
        author: {
          ...MOCK_USER,
          id: 'local-user',
          nickname: post.author || '当前浏览器',
        },
      })),
      ...MOCK_POSTS,
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (category) {
      return posts.filter(p => p.category === category);
    }
    return posts;
  },

  getPostById: async (id: string): Promise<Post | undefined> => {
    const posts = await apiService.getPosts();
    return posts.find(p => p.id === id);
  },

  createPost: async (post: Partial<Post>): Promise<Post> => {
    const newPost: Post = {
      id: `local-${Math.random().toString(36).slice(2, 11)}`,
      userId: MOCK_USER.id,
      title: post.title || '',
      content: post.content || '',
      category: post.category || '未分类',
      tags: post.tags || [],
      images: post.images || [],
      status: 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: MOCK_USER,
    };
    await saveLocalPost({
      type: 'feed',
      title: newPost.title,
      content: newPost.content,
      author: MOCK_USER.nickname,
      likes: 0,
      metadata: {
        category: newPost.category,
        tags: newPost.tags,
        images: newPost.images,
      },
    });
    return newPost;
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
