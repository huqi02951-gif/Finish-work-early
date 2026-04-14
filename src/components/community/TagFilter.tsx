import React from 'react';
import { cn } from '../../../lib/utils';

interface TagFilterProps {
  tags: string[];
  activeTag: string | null;
  onTagClick: (tag: string | null) => void;
  dark?: boolean;
}

const TagFilter: React.FC<TagFilterProps> = ({ tags, activeTag, onTagClick, dark }) => (
  <div className="flex flex-wrap gap-2">
    <button
      onClick={() => onTagClick(null)}
      className={cn(
        'px-3 py-1 rounded-full text-[11px] font-medium transition-all border',
        !activeTag
          ? (dark ? 'bg-[#00ff41] text-black border-[#00ff41]' : 'bg-brand-dark text-white border-brand-dark')
          : (dark ? 'text-[#00ff41]/60 border-[#00ff41]/30 hover:border-[#00ff41]' : 'text-brand-gray border-brand-border/50 hover:border-brand-dark')
      )}
    >
      全部
    </button>
    {tags.map(tag => (
      <button
        key={tag}
        onClick={() => onTagClick(tag)}
        className={cn(
          'px-3 py-1 rounded-full text-[11px] font-medium transition-all border',
          activeTag === tag
            ? (dark ? 'bg-[#00ff41] text-black border-[#00ff41]' : 'bg-brand-dark text-white border-brand-dark')
            : (dark ? 'text-[#00ff41]/60 border-[#00ff41]/30 hover:border-[#00ff41]' : 'text-brand-gray border-brand-border/50 hover:border-brand-dark')
        )}
      >
        {tag}
      </button>
    ))}
  </div>
);

export default TagFilter;
