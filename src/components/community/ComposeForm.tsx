import React, { useState } from 'react';
import { Send, Eye, EyeOff, Tag, FileText } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useToast } from '../../components/common/Toast';

interface ComposeFormProps {
  onSubmit: (data: { title: string; content: string; category: string; anonymous: boolean; tags: string[] }) => Promise<void>;
  categories: string[];
  dark?: boolean;
  placeholder?: string;
}

const ComposeForm: React.FC<ComposeFormProps> = ({ onSubmit, categories, dark, placeholder }) => {
  const toast = useToast();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(categories[0] || '');
  const [anonymous, setAnonymous] = useState(true);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      setTags(prev => [...prev, t]);
      setTagInput('');
    }
  };

  const removeTag = (t: string) => {
    setTags(prev => prev.filter(x => x !== t));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.warning('请填写标题');
      return;
    }
    if (!content.trim()) {
      toast.warning('请填写正文');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({ title: title.trim(), content: content.trim(), category, anonymous, tags });
      setTitle('');
      setContent('');
      setTags([]);
      setTagInput('');
      toast.success('发布成功');
    } catch {
      toast.error('发布失败，请检查网络连接');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Category + Anonymous */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <label className={cn('text-[10px] font-bold uppercase tracking-widest mb-1.5 block', dark ? 'text-[#00ff41]/50' : 'text-brand-gray')}>
            频道
          </label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className={cn(
              'w-full px-3 py-2 rounded-lg text-sm border outline-none transition-all',
              dark
                ? 'bg-black border-[#00ff41]/30 text-[#00ff41] focus:border-[#00ff41]'
                : 'bg-white border-brand-border/30 text-brand-dark focus:border-brand-dark'
            )}
          >
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <label className={cn(
          'inline-flex items-center gap-2 text-sm self-end pb-2 cursor-pointer',
          dark ? 'text-[#00ff41]/70' : 'text-brand-dark'
        )}>
          {anonymous ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          <input
            type="checkbox"
            checked={anonymous}
            onChange={e => setAnonymous(e.target.checked)}
            className="sr-only"
          />
          <span className={cn(
            'w-8 h-4 rounded-full relative transition-all',
            anonymous ? 'bg-[#00ff41]' : (dark ? 'bg-[#00ff41]/20' : 'bg-brand-border')
          )}>
            <span className={cn(
              'absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform',
              anonymous ? 'left-4.5' : 'left-0.5'
            )} />
          </span>
          {anonymous ? '匿名' : '实名'}
        </label>
      </div>

      {/* Title */}
      <div>
        <label className={cn('text-[10px] font-bold uppercase tracking-widest mb-1.5 block flex items-center gap-1.5', dark ? 'text-[#00ff41]/50' : 'text-brand-gray')}>
          <FileText className="w-3 h-3" /> 标题
        </label>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="请输入标题"
          className={cn(
            'w-full px-4 py-2.5 rounded-lg text-sm border outline-none transition-all',
            dark
              ? 'bg-black border-[#00ff41]/30 text-[#00ff41] placeholder:text-[#00ff41]/20 focus:border-[#00ff41]'
              : 'bg-white border-brand-border/30 text-brand-dark placeholder:text-brand-gray/40 focus:border-brand-dark'
          )}
        />
      </div>

      {/* Content */}
      <div>
        <label className={cn('text-[10px] font-bold uppercase tracking-widest mb-1.5 block', dark ? 'text-[#00ff41]/50' : 'text-brand-gray')}>
          正文
        </label>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder={placeholder || '请输入正文内容...'}
          rows={5}
          className={cn(
            'w-full px-4 py-2.5 rounded-lg text-sm border outline-none transition-all resize-none',
            dark
              ? 'bg-black border-[#00ff41]/30 text-[#00ff41] placeholder:text-[#00ff41]/20 focus:border-[#00ff41]'
              : 'bg-white border-brand-border/30 text-brand-dark placeholder:text-brand-gray/40 focus:border-brand-dark'
          )}
        />
      </div>

      {/* Tags */}
      <div>
        <label className={cn('text-[10px] font-bold uppercase tracking-widest mb-1.5 block flex items-center gap-1.5', dark ? 'text-[#00ff41]/50' : 'text-brand-gray')}>
          <Tag className="w-3 h-3" /> 标签
        </label>
        <div className="flex gap-2">
          <input
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
            placeholder="输入标签后按回车"
            className={cn(
              'flex-1 px-3 py-2 rounded-lg text-xs border outline-none transition-all',
              dark
                ? 'bg-black border-[#00ff41]/30 text-[#00ff41] placeholder:text-[#00ff41]/20 focus:border-[#00ff41]'
                : 'bg-white border-brand-border/30 text-brand-dark placeholder:text-brand-gray/40 focus:border-brand-dark'
            )}
          />
          <button
            type="button"
            onClick={addTag}
            className={cn(
              'px-3 py-2 rounded-lg text-xs font-bold border transition-all',
              dark ? 'border-[#00ff41]/30 text-[#00ff41] hover:bg-[#00ff41]/10' : 'border-brand-border/30 text-brand-dark hover:bg-brand-light-gray/50'
            )}
          >
            添加
          </button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {tags.map(t => (
              <button
                key={t}
                type="button"
                onClick={() => removeTag(t)}
                className={cn(
                  'px-2 py-0.5 rounded text-[10px] font-medium border transition-all',
                  dark ? 'text-[#a855f7]/60 border-[#a855f7]/30 hover:border-[#a855f7]' : 'text-brand-gray border-brand-border/30 hover:border-brand-dark'
                )}
              >
                #{t} ×
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting}
        className={cn(
          'w-full py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50',
          dark
            ? 'bg-[#00ff41] text-black hover:bg-[#00ff41]/90 active:scale-[0.98]'
            : 'bg-brand-dark text-white hover:bg-brand-dark/90 active:scale-[0.98]'
        )}
      >
        <Send className="w-4 h-4" />
        {submitting ? '发布中...' : '发布'}
      </button>
    </form>
  );
};

export default ComposeForm;
