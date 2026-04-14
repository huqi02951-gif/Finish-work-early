import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, ThumbsUp, Clock, Bookmark, Pin } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { Post } from '../../types';

const TYPE_COLORS: Record<string, string> = {
  '经验帖': 'text-blue-600 bg-blue-50 border-blue-200',
  '工具帖': 'text-cyan-600 bg-cyan-50 border-cyan-200',
  '信贷操作': 'text-emerald-600 bg-emerald-50 border-emerald-200',
  '产品建议': 'text-amber-600 bg-amber-50 border-amber-200',
  '开发共创': 'text-purple-600 bg-purple-50 border-purple-200',
  '手册分享': 'text-indigo-600 bg-indigo-50 border-indigo-200',
};

interface PostCardProps {
  post: Post;
  variant?: 'professional' | 'pantry';
  basePath?: string;
}

const PostCard: React.FC<PostCardProps> = ({ post, variant = 'professional', basePath = '/bbs/thread' }) => {
  const formatRelativeTime = (dateStr: string): string => {
    const d = new Date(dateStr);
    const diff = Date.now() - d.getTime();
    const minutes = Math.floor(diff / 60_000);
    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes} 分钟前`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} 小时前`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} 天前`;
    return d.toLocaleDateString('zh-CN');
  };

  const isDark = variant === 'pantry';

  return (
    <Link
      to={`${basePath}/${post.id}`}
      className={cn(
        'group block rounded-xl p-4 transition-all border',
        isDark
          ? 'border-[#00ff41]/20 bg-black hover:border-[#00ff41] hover:bg-[#00ff41]/5'
          : 'border-brand-border/20 bg-white hover:border-brand-gold/30 hover:shadow-sm'
      )}
    >
      {/* Top row: pinned + type + time */}
      <div className="flex items-center gap-2 mb-2">
        {post.isPinned && (
          <span className={cn(
            'flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold',
            isDark ? 'text-amber-400 border-amber-800 bg-amber-950/30' : 'text-amber-600 bg-amber-50 border-amber-200'
          )}>
            <Pin className="w-2.5 h-2.5" /> 置顶
          </span>
        )}
        {post.category && (
          <span className={cn(
            'px-1.5 py-0.5 rounded text-[9px] font-bold border',
            isDark
              ? 'text-[#00ff41] border-[#00ff41]/50 bg-[#00ff41]/10'
              : (TYPE_COLORS[post.category] || 'text-brand-gray border-brand-border/50 bg-brand-light-gray/50')
          )}>
            {post.category}
          </span>
        )}
        <span className={cn('text-[10px] ml-auto flex items-center gap-1', isDark ? 'text-[#00ff41]/40' : 'text-brand-gray')}>
          <Clock className="w-2.5 h-2.5" /> {formatRelativeTime(post.createdAt)}
        </span>
      </div>

      {/* Title */}
      <h3 className={cn(
        'text-sm font-bold mb-1 group-hover:underline leading-snug',
        isDark ? 'text-[#00ff41] group-hover:text-[#00ff41]' : 'text-brand-dark'
      )}>
        {post.title}
      </h3>

      {/* Content preview */}
      {post.content && (
        <p className={cn(
          'text-xs line-clamp-2 leading-relaxed mb-3',
          isDark ? 'text-[#00ff41]/50' : 'text-brand-gray'
        )}>
          {post.content}
        </p>
      )}

      {/* Tags + stats */}
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1.5">
          {post.tags?.slice(0, 3).map(tag => (
            <span key={tag} className={cn(
              'text-[9px] px-1.5 py-0.5 rounded border font-medium',
              isDark
                ? 'text-[#00ff41]/40 border-[#00ff41]/10 bg-[#00ff41]/5'
                : 'text-brand-gray/60 border-brand-border/20 bg-brand-light-gray/30'
            )}>
              #{tag}
            </span>
          ))}
        </div>
        <div className={cn('flex items-center gap-3 text-[10px]', isDark ? 'text-[#00ff41]/30' : 'text-brand-gray')}>
          <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {post.commentCount || 0}</span>
          <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" /></span>
        </div>
      </div>
    </Link>
  );
};

export default PostCard;
