import React, { useMemo } from 'react';
import { VolumeX, Volume2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

export type PetPosture = 'energetic' | 'normal' | 'tired' | 'worried' | 'sleepy';
export type MoodTint = 'warm' | 'neutral' | 'cool';

export interface PetOsCardProps {
  isAdopted?: boolean;
  onAdopt?: () => void;
  adoptTitle?: string;
  adoptDesc?: string;

  posture?: PetPosture | string;
  moodTint?: MoodTint | string;
  bubbleText?: string;
  statusDesc?: string;
  muted?: boolean;
  onToggleMute?: () => void;
}

const POSTURE_MAP: Record<string, { label: string, svg: React.ReactNode }> = {
  energetic: {
    label: '精神',
    svg: (
      <>
        <circle cx="12" cy="16" r="2.5" fill="currentColor" />
        <circle cx="28" cy="16" r="2.5" fill="currentColor" />
        <path d="M16 23 Q 20 28 24 23" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M7 12 Q 12 10 17 12" fill="none" stroke="currentColor" strokeWidth="1.5" className="opacity-40" />
        <path d="M23 12 Q 28 10 33 12" fill="none" stroke="currentColor" strokeWidth="1.5" className="opacity-40" />
      </>
    )
  },
  normal: {
    label: '平常',
    svg: (
      <>
        <circle cx="13" cy="18" r="2.5" fill="currentColor" />
        <circle cx="27" cy="18" r="2.5" fill="currentColor" />
        <path d="M18 25 H 22" stroke="currentColor" strokeWidth="2" />
      </>
    )
  },
  tired: {
    label: '疲惫',
    svg: (
      <g style={{ transform: 'translateY(2px)' }}>
        <path d="M10 16 Q 12 14 15 16" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M25 16 Q 28 14 30 16" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M17 26 H 23" stroke="currentColor" strokeWidth="2" />
        <path d="M9 19 Q 12 21 15 19" fill="none" stroke="currentColor" strokeWidth="1" className="opacity-30" />
        <path d="M25 19 Q 28 21 31 19" fill="none" stroke="currentColor" strokeWidth="1" className="opacity-30" />
      </g>
    )
  },
  worried: {
    label: '担心',
    svg: (
      <>
        <path d="M10 15 Q 12 11 16 16" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M24 16 Q 28 11 30 15" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="18" cy="25" r="2.5" fill="currentColor" />
        <circle cx="13" cy="19" r="1.5" fill="currentColor" className="opacity-50" />
        <circle cx="27" cy="19" r="1.5" fill="currentColor" className="opacity-50" />
      </>
    )
  },
  sleepy: {
    label: '睡着',
    svg: (
      <>
        <path d="M10 18 H 15" stroke="currentColor" strokeWidth="2.5" />
        <path d="M25 18 H 30" stroke="currentColor" strokeWidth="2.5" />
        <path d="M17 24 Q 20 25 23 24" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M25 8 A 4 4 0 0 0 29 12 A 5 5 0 0 1 25 8" fill="none" stroke="currentColor" strokeWidth="1.5" className="opacity-50" />
        <circle cx="21" cy="7" r="0.5" fill="currentColor" className="opacity-40" />
      </>
    )
  }
};

export const PetOsCard: React.FC<PetOsCardProps> = ({
  isAdopted = true,
  onAdopt,
  adoptTitle,
  adoptDesc,

  posture = 'normal',
  moodTint = 'neutral',
  bubbleText,
  statusDesc,
  muted = false,
  onToggleMute,
}) => {
  // 冻结 moodTint 映射
  const normalizedMood = useMemo(() => {
    if (moodTint === 'warm' || moodTint === 'amber' || moodTint === 'orange') return 'warm';
    if (moodTint === 'cool' || moodTint === 'blue' || moodTint === 'green' || moodTint === 'cyan') return 'cool';
    return 'neutral';
  }, [moodTint]);

  const moodClasses = {
    warm: 'bg-[#fffbf5] border-[#f5e6d3] text-[#785b37]',
    cool: 'bg-[#f5f8ff] border-[#d3e0f5] text-[#375278]',
    neutral: 'bg-[#fafafa] border-[#e5e5e5] text-[#404040]',
  }[normalizedMood];

  const safePosture = (posture || 'normal').toLowerCase();
  // Provide safe fallback mapping for non-standard posture strings to avoid breaking during integration
  const mappedPosture = (POSTURE_MAP[safePosture] !== undefined) 
    ? safePosture 
    : (['idle', 'pause', 'quiet'].includes(safePosture) ? 'sleepy' : 'normal');

  const currentPosture = POSTURE_MAP[mappedPosture];

  if (!isAdopted) {
    return (
      <div className={cn(
        "w-full px-4 py-4 md:p-5 rounded-[20px] md:rounded-[24px] border border-brand-border/15 bg-[#fafafa]/80 flex flex-row items-center justify-between mb-3 box-border shadow-sm ring-1 ring-inset ring-transparent"
      )}>
        <div className="flex flex-col flex-1 min-w-0 pr-4">
          <h3 className="text-[14px] md:text-[15px] font-extrabold tracking-tight text-brand-dark opacity-95 mb-1.5 leading-none">
            {adoptTitle || '这里住着一只小东西'}
          </h3>
          <p className="text-[12px] md:text-[13px] font-[400] text-brand-gray opacity-80 leading-snug">
            {adoptDesc || '愿意让它陪你吗'}
          </p>
        </div>
        <button
          onClick={onAdopt}
          className="shrink-0 h-[44px] min-w-[88px] px-5 rounded-full bg-brand-dark text-white text-[13px] font-bold active:scale-[0.98] transition-transform flex items-center justify-center shadow-md shadow-brand-dark/10"
        >
          带它回家
        </button>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes pet-breath {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        .pet-breath-anim {
          animation: pet-breath 2.4s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .pet-breath-anim { animation: none; }
        }
      `}</style>
      
      <div className={cn(
        "w-full px-4 py-3.5 md:p-5 rounded-[20px] md:rounded-[24px] border border-solid flex items-start sm:items-center justify-between mb-3 box-border",
        "transition-colors duration-800 ease-linear",
        "shadow-none ring-0",
        moodClasses
      )}>
        
        <div className="flex items-start gap-4 flex-1 min-w-0">
          
          {/* Avatar Section - 单一呼吸来源 */}
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-[14px] md:rounded-2xl border flex flex-col items-center justify-center shrink-0 border-black/5 bg-white/60 relative pet-breath-anim overflow-hidden">
            {/* 姿态切换使用交叉淡入不并存 400ms */}
            <AnimatePresence>
              <motion.svg 
                key={mappedPosture}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                viewBox="0 0 40 40" 
                className="w-10 h-10 absolute inset-0 m-auto text-current pointer-events-none" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                {currentPosture.svg}
              </motion.svg>
            </AnimatePresence>
          </div>

          {/* Content Section */}
          <div className="flex flex-col flex-1 min-w-0 pr-1 min-h-[48px] md:min-h-[56px] justify-center relative">
            
            {/* Header Line */}
            <div className="flex items-center gap-2 mb-1.5 md:mb-2">
              <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-black/5 font-bold opacity-70 tracking-widest leading-none shrink-0">
                {currentPosture.label}
              </span>
            </div>
            
            {/* Status Description (if provided) */}
            {statusDesc && (
              <p className="mb-2 text-[12px] leading-5 opacity-65 pr-2 break-words">
                {statusDesc}
              </p>
            )}

            {/* Bubble Text - 锚点稳定向右下延展 */}
            <div className="w-full text-left relative min-h-[19px]">
              <AnimatePresence mode="wait">
                <motion.p 
                  key={bubbleText || 'empty'}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className={cn(
                    "text-[13px] md:text-[14px] font-[400] leading-relaxed w-full pt-0.5 pb-0.5 break-words line-clamp-2",
                    bubbleText ? "opacity-85 pr-2" : "opacity-30"
                  )}
                >
                  {bubbleText || '它这会儿安静地陪着你。'}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
        </div>
        
        {/* Mute Toggle Section - 稳定热区，纯 opacity 反馈 */}
        <div className="shrink-0 flex items-start h-full pl-2">
          <button 
            onClick={onToggleMute}
            className={cn(
              "p-1 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full outline-none focus:outline-none cursor-pointer",
              "transition-opacity duration-150 ease-in-out",
              muted ? "opacity-25 hover:opacity-60 bg-black/5" : "opacity-60 hover:opacity-100 hover:bg-black/5"
            )}
            aria-label={muted ? "取消静音" : "静音"}
          >
            {muted ? <VolumeX className="w-4.5 h-4.5 opacity-60" /> : <Volume2 className="w-4.5 h-4.5" />}
          </button>
        </div>
      </div>
    </>
  );
};
