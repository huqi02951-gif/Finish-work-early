import React, { useState } from 'react';
import { Heart, Coffee, Send } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useToast } from '../../components/common/Toast';

interface TipJarProps {
  dark?: boolean;
  targetName?: string;
}

const TipJar: React.FC<TipJarProps> = ({ dark, targetName = '开发者' }) => {
  const toast = useToast();
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState('');
  const [selected, setSelected] = useState<string | null>(null);

  const amounts = [
    { label: '☕ 一杯咖啡', value: '15' },
    { label: '🍵 一杯奶茶', value: '25' },
    { label: '🍱 一份午餐', value: '40' },
  ];

  const handleTip = () => {
    if (!selected) {
      toast.warning('请先选择打赏金额');
      return;
    }
    toast.success(`感谢打赏 ${selected} 元！已转达给 ${targetName}`);
    setShow(false);
    setMessage('');
    setSelected(null);
  };

  return (
    <div className={cn(
      'rounded-xl border p-4',
      dark ? 'border-[#00ff41]/20 bg-black/50' : 'border-brand-border/10 bg-white'
    )}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Heart className={cn('w-4 h-4', dark ? 'text-[#ff0040]' : 'text-red-500')} />
          <span className={cn('text-sm font-bold', dark ? 'text-[#00ff41]/70' : 'text-brand-dark')}>
            请 {targetName} 喝咖啡
          </span>
        </div>
        <button
          onClick={() => setShow(!show)}
          className={cn(
            'text-[11px] font-bold px-3 py-1 rounded-lg transition-all',
            dark
              ? 'text-[#00ff41] border border-[#00ff41]/30 hover:bg-[#00ff41]/10'
              : 'text-brand-dark border border-brand-border/30 hover:bg-brand-light-gray/50'
          )}
        >
          {show ? '取消' : '打赏'}
        </button>
      </div>

      {show && (
        <div className="space-y-3 animate-fade-in-up">
          <div className="grid grid-cols-3 gap-2">
            {amounts.map(a => (
              <button
                key={a.value}
                onClick={() => setSelected(a.value)}
                className={cn(
                  'py-2 px-3 rounded-lg text-xs font-medium border transition-all text-center',
                  selected === a.value
                    ? (dark ? 'bg-[#00ff41]/20 border-[#00ff41] text-[#00ff41]' : 'bg-brand-dark text-white border-brand-dark')
                    : (dark ? 'border-[#00ff41]/20 text-[#00ff41]/50 hover:border-[#00ff41]/40' : 'border-brand-border/30 text-brand-gray hover:border-brand-dark')
                )}
              >
                {a.label}
                <div className="text-[9px] opacity-60">¥{a.value}</div>
              </button>
            ))}
          </div>
          <input
            type="text"
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="留句话（可选）"
            className={cn(
              'w-full px-3 py-2 rounded-lg text-xs outline-none border transition-all',
              dark
                ? 'bg-black border-[#00ff41]/20 text-[#00ff41] placeholder:text-[#00ff41]/20 focus:border-[#00ff41]/40'
                : 'bg-brand-light-gray/30 border-brand-border/20 text-brand-dark placeholder:text-brand-gray/40 focus:border-brand-dark'
            )}
          />
          <button
            onClick={handleTip}
            className={cn(
              'w-full py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all',
              dark
                ? 'bg-[#00ff41] text-black hover:bg-[#00ff41]/90'
                : 'bg-brand-dark text-white hover:bg-brand-dark/90'
            )}
          >
            <Coffee className="w-3.5 h-3.5" /> 确认打赏
          </button>
        </div>
      )}
    </div>
  );
};

export default TipJar;
