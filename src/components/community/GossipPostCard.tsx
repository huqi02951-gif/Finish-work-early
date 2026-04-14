import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Clock, MessageSquare, Zap, RotateCcw, WifiOff } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { GossipPost, GossipStatus } from '../../types/gossip';
import { STATUS_LABELS, STATUS_COLORS, formatCountdown, computeStatus, HEAT_THRESHOLDS } from '../../types/gossip';

interface GossipPostCardProps {
  post: GossipPost;
  onRevive?: (id: string) => void;
}

const GossipPostCard: React.FC<GossipPostCardProps> = ({ post, onRevive }) => {
  const [status, setStatus] = useState<GossipStatus>(post.status);
  const [countdown, setCountdown] = useState(formatCountdown(post.expireAt));

  useEffect(() => {
    const timer = setInterval(() => {
      const s = computeStatus(post);
      setStatus(s);
      setCountdown(formatCountdown(post.expireAt));
    }, 30000);
    return () => clearInterval(timer);
  }, [post]);

  const isBurned = status === 'burned';

  if (isBurned) {
    return (
      <div className="border border-gray-800 bg-gray-950/20 rounded-xl p-4 opacity-40">
        <div className="flex items-center gap-2 text-gray-600 mb-2">
          <WifiOff className="w-3 h-3" />
          <span className="text-[10px] font-bold uppercase tracking-widest">信号已中断</span>
        </div>
        <p className="text-xs text-gray-700 line-clamp-1 font-mono">
          {post.title}
        </p>
        <p className="text-[9px] text-gray-800 mt-2 font-mono">
          EXPIRED: {new Date(post.expireAt).toLocaleString('zh-CN')}
        </p>
      </div>
    );
  }

  const shouldRevive = status === 'about_to_burn';

  return (
    <div
      className={cn(
        'border rounded-xl p-4 transition-all group relative overflow-hidden',
        status === 'about_to_burn'
          ? 'border-rose-700/50 bg-rose-950/10 animate-pulse-slow'
          : status === 'hot_discussion'
            ? 'border-red-800/40 bg-red-950/10'
            : 'border-[#a855f7]/20 bg-black/40 hover:border-[#a855f7]/40'
      )}
    >
      {/* Heat indicator orb */}
      <div
        className="absolute -top-4 -right-4 w-16 h-16 rounded-full blur-xl pointer-events-none"
        style={{
          backgroundColor: post.heatScore > 80 ? 'rgba(255,0,64,0.08)' : post.heatScore > 50 ? 'rgba(255,107,0,0.06)' : 'rgba(168,85,247,0.04)',
        }}
      />

      {/* Status + countdown */}
      <div className="flex items-center justify-between mb-2 relative z-10">
        <span className={cn('px-2 py-0.5 rounded text-[9px] font-bold border', STATUS_COLORS[status])}>
          {STATUS_LABELS[status]}
        </span>
        <span className="flex items-center gap-1 text-[10px] font-mono text-[#ff0040]/60">
          <Clock className="w-2.5 h-2.5" />
          {countdown}
        </span>
      </div>

      {/* Title */}
      <Link
        to={`/bbs/pantry/thread/${post.id}`}
        className="relative z-10"
      >
        <h4 className="text-sm font-bold text-[#00ff41]/80 group-hover:text-[#00ff41] transition-colors leading-snug mb-1">
          {post.title}
        </h4>
      </Link>

      {/* Content preview */}
      <p className="text-[10px] text-[#00ff41]/40 line-clamp-2 font-mono leading-relaxed mb-3 relative z-10">
        {post.content}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-3 relative z-10">
        {post.tags.slice(0, 3).map(tag => (
          <span key={tag} className="text-[8px] px-1.5 py-0.5 bg-[#a855f7]/10 text-[#a855f7]/50 rounded border border-[#a855f7]/10 font-mono">
            #{tag}
          </span>
        ))}
      </div>

      {/* Footer: stats + revive */}
      <div className="flex items-center justify-between relative z-10 pt-2 border-t border-white/5">
        <div className="flex items-center gap-3 text-[9px] text-[#00ff41]/30 font-mono">
          <span className="flex items-center gap-1"><Flame className="w-2.5 h-2.5" /> {post.heatScore}</span>
          <span className="flex items-center gap-1"><MessageSquare className="w-2.5 h-2.5" /> {post.replyCount}</span>
          {post.reviveCount > 0 && (
            <span className="flex items-center gap-1 text-purple-400/50"><RotateCcw className="w-2.5 h-2.5" /> {post.reviveCount}</span>
          )}
        </div>
        {shouldRevive && onRevive && (
          <button
            onClick={() => onRevive(post.id)}
            className="flex items-center gap-1 text-[9px] font-bold text-[#ff0040] border border-[#ff0040]/40 px-2 py-0.5 rounded hover:bg-[#ff0040]/10 transition-all"
          >
            <Zap className="w-2.5 h-2.5" /> 续命 +4h
          </button>
        )}
      </div>
    </div>
  );
};

export default GossipPostCard;
