
import { User, Post, Notification } from '../types';

export const MOCK_USER: User = {
  id: 'u1',
  nickname: '资深客户经理',
  avatar: '',
  role: 'admin',
  email: 'manager@bank.com',
  createdAt: '2024-01-01T00:00:00Z',
};

export const MOCK_POSTS: Post[] = [
  {
    id: 'p1',
    userId: 'u1',
    title: '关于对公电子渠道收费政策调整的深度解读',
    content: '近期不少客户询问收费调整细节，核心点在于日均存款档次的自动匹配...',
    category: '政策解读',
    tags: ['收费标准', '对公业务'],
    images: [],
    status: 'published',
    createdAt: '2026-04-01T10:00:00Z',
    updatedAt: '2026-04-01T10:00:00Z',
    author: MOCK_USER,
  },
  {
    id: 'p2',
    userId: 'u1',
    title: '新一代供应链金融产品推介话术',
    content: '针对制造业客户，重点突出审批快、额度高、线上化操作的优势...',
    category: '业务打法',
    tags: ['供应链', '制造业'],
    images: [],
    status: 'published',
    createdAt: '2026-04-05T14:30:00Z',
    updatedAt: '2026-04-05T14:30:00Z',
    author: MOCK_USER,
  },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    userId: 'u1',
    type: 'system',
    content: '您的“场景中心”功能已更新，新增移动端适配优化。',
    read: false,
    createdAt: '2026-04-09T09:00:00Z',
  },
  {
    id: 'n2',
    userId: 'u1',
    type: 'comment',
    content: '王经理评论了您的文章：非常实用的解读！',
    read: true,
    createdAt: '2026-04-08T15:00:00Z',
  },
];
