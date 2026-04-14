import React from 'react';
import { MessageSquare, Clock } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { Comment } from '../../types';

interface CommentSectionProps {
  comments: Comment[];
  loading?: boolean;
  dark?: boolean;
}

const CommentSection: React.FC<CommentSectionProps> = ({ comments, loading, dark }) => {
  const formatRelativeTime = (dateStr: string): string => {
    const d = new Date(dateStr);
    const diff = Date.now() - d.getTime();
    const minutes = Math.floor(diff / 60_000);
    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes} 分钟前`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} 小时前`;
    return d.toLocaleDateString('zh-CN');
  };

  if (loading) {
    return (
      <div className={cn('space-y-3', dark ? 'text-[#00ff41]/30' : 'text-brand-gray')}>
        {[1, 2, 3].map(i => (
          <div key={i} className={cn('p-3 rounded-lg animate-pulse', dark ? 'bg-black border border-[#00ff41]/10' : 'bg-brand-light-gray/30 border border-brand-border/10')}>
            <div className={cn('h-3 w-24 rounded mb-2', dark ? 'bg-[#00ff41]/10' : 'bg-brand-border/30')} />
            <div className={cn('h-3 w-full rounded', dark ? 'bg-[#00ff41]/10' : 'bg-brand-border/30')} />
          </div>
        ))}
      </div>
    );
  }

  if (!comments.length) {
    return (
      <div className={cn(
        'text-center py-8 text-sm',
        dark ? 'text-[#00ff41]/30' : 'text-brand-gray'
      )}>
        <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
        暂无评论
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {comments.map(comment => (
        <div
          key={comment.id}
          className={cn(
            'p-3 rounded-lg border',
            dark ? 'border-[#00ff41]/10 bg-black/50' : 'border-brand-border/10 bg-brand-light-gray/20'
          )}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <span className={cn('text-xs font-medium', dark ? 'text-[#00ff41]/70' : 'text-brand-dark')}>
              {comment.author?.nickname || '匿名用户'}
            </span>
            <span className={cn('text-[10px] flex items-center gap-1', dark ? 'text-[#00ff41]/30' : 'text-brand-gray')}>
              <Clock className="w-2.5 h-2.5" /> {formatRelativeTime(comment.createdAt)}
            </span>
          </div>
          <p className={cn('text-sm leading-relaxed', dark ? 'text-[#00ff41]/60' : 'text-brand-dark/80')}>
            {comment.content}
          </p>
        </div>
      ))}
    </div>
  );
};

export default CommentSection;
