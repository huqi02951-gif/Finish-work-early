export type GossipStatus = 'just_sent' | 'fermenting' | 'hot_discussion' | 'about_to_burn' | 'revived' | 'burned';

export interface GossipPost {
  id: string;
  title: string;
  content: string;
  author: string;
  isAnonymous: boolean;
  category: '匿名吐槽' | 'Gossip 贴板' | '二手交易' | '请喝咖啡';
  createdAt: string;
  expireAt: string; // ISO timestamp
  heatScore: number; // 0-100
  reviveCount: number;
  status: GossipStatus;
  replyCount: number;
  tags: string[];
}

export const HEAT_THRESHOLDS = {
  revive: 20,     // +4h
  hot: 50,        // +8h
  protection: 80, // +12h
};

export const STATUS_LABELS: Record<GossipStatus, string> = {
  just_sent: '刚投递',
  fermenting: '正在发酵',
  hot_discussion: '今夜热议',
  about_to_burn: '即将焚毁',
  revived: '续命成功',
  burned: '信号已中断',
};

export const STATUS_COLORS: Record<GossipStatus, string> = {
  just_sent: 'text-blue-400 border-blue-800 bg-blue-950/30',
  fermenting: 'text-amber-400 border-amber-800 bg-amber-950/30',
  hot_discussion: 'text-red-400 border-red-800 bg-red-950/30',
  about_to_burn: 'text-rose-400 border-rose-700 bg-rose-950/40 animate-pulse',
  revived: 'text-purple-400 border-purple-800 bg-purple-950/30',
  burned: 'text-gray-600 border-gray-800 bg-gray-950/20',
};

export function computeStatus(post: GossipPost): GossipStatus {
  const now = Date.now();
  const expire = new Date(post.expireAt).getTime();

  if (post.status === 'burned') return 'burned';

  if (now > expire && post.heatScore < HEAT_THRESHOLDS.revive) {
    return 'burned';
  }

  if (post.heatScore >= HEAT_THRESHOLDS.protection) {
    return 'hot_discussion';
  }
  if (now > expire - 3600000 && post.heatScore >= HEAT_THRESHOLDS.revive) {
    return 'about_to_burn';
  }
  if (post.heatScore >= HEAT_THRESHOLDS.hot) {
    return 'hot_discussion';
  }
  if (post.heatScore >= HEAT_THRESHOLDS.revive) {
    return post.reviveCount > 0 ? 'revived' : 'fermenting';
  }
  return 'just_sent';
}

export function formatCountdown(expireAt: string): string {
  const now = Date.now();
  const diff = new Date(expireAt).getTime() - now;
  if (diff <= 0) return '已焚毁';
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}
