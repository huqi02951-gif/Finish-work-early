import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import {
  getPetStateSnapshot,
  initializePetOsSession,
  subscribePetState,
  type PetIdentityRecord,
  type PetStateRecord,
} from '../../lib/petOs';
import { getCardPosture, getCardMoodTint, type PetCardPosture } from '../../lib/petOsState';
import {
  LOCAL_NUMBER_KEYS,
  readLocalNumber,
  subscribeLocalNumber,
} from '../../lib/localSignals';

const HIDDEN_KEY = 'pet_companion_hidden';
const HIDDEN_EVENT = 'fwe:pet-companion-visibility';

const POSTURE_SVG: Record<PetCardPosture, React.ReactNode> = {
  '精神': (
    <>
      <circle cx="14" cy="18" r="2.6" fill="currentColor" />
      <circle cx="26" cy="18" r="2.6" fill="currentColor" />
      <path d="M16 25 Q 20 30 24 25" fill="none" stroke="currentColor" strokeWidth="2" />
    </>
  ),
  '平常': (
    <>
      <circle cx="14" cy="19" r="2.4" fill="currentColor" />
      <circle cx="26" cy="19" r="2.4" fill="currentColor" />
      <path d="M17 26 H 23" stroke="currentColor" strokeWidth="2" />
    </>
  ),
  '疲惫': (
    <>
      <path d="M11 18 Q 14 16 17 18" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M23 18 Q 26 16 29 18" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M17 26 H 23" stroke="currentColor" strokeWidth="2" />
    </>
  ),
  '担心': (
    <>
      <path d="M10 16 Q 13 12 17 17" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M23 17 Q 27 12 30 16" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="20" cy="26" r="2.2" fill="currentColor" />
    </>
  ),
  '睡着': (
    <>
      <path d="M11 19 H 17" stroke="currentColor" strokeWidth="2.5" />
      <path d="M23 19 H 29" stroke="currentColor" strokeWidth="2.5" />
      <path d="M17 25 Q 20 26 23 25" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M27 9 A 4 4 0 0 0 31 13 A 5 5 0 0 1 27 9" fill="none" stroke="currentColor" strokeWidth="1.5" className="opacity-60" />
    </>
  ),
};

const MOOD_BG: Record<string, string> = {
  '精神': 'bg-emerald-50 text-emerald-700 ring-emerald-200/70',
  '平常': 'bg-white text-neutral-700 ring-neutral-200',
  '疲惫': 'bg-amber-50 text-amber-700 ring-amber-200/70',
  '担心': 'bg-rose-50 text-rose-600 ring-rose-200/70',
  '睡着': 'bg-indigo-50 text-indigo-600 ring-indigo-200/70',
};

type Stage = 'baby' | 'teen' | 'adult';

function deriveStage(xp: number): Stage {
  if (xp < 40) return 'baby';
  if (xp < 160) return 'teen';
  return 'adult';
}

const STAGE_SCALE: Record<Stage, number> = {
  baby: 0.8,
  teen: 0.95,
  adult: 1.1,
};

export function setPetCompanionHidden(hidden: boolean) {
  try {
    if (hidden) localStorage.setItem(HIDDEN_KEY, '1');
    else localStorage.removeItem(HIDDEN_KEY);
  } catch { /* ignore */ }
  window.dispatchEvent(new CustomEvent(HIDDEN_EVENT, { detail: hidden }));
}

export function getPetCompanionHidden() {
  try { return localStorage.getItem(HIDDEN_KEY) === '1'; } catch { return false; }
}

interface PetCompanionProps {
  /** 在某些上下文(CLI、登录页)关闭浮窗 */
  disabled?: boolean;
}

const PetCompanion: React.FC<PetCompanionProps> = ({ disabled = false }) => {
  const [petState, setPetState] = useState<PetStateRecord | null>(null);
  const [petIdentity, setPetIdentity] = useState<PetIdentityRecord | null>(null);
  const [currentLife, setCurrentLife] = useState<number>(() =>
    typeof window === 'undefined' ? 100 : readLocalNumber(LOCAL_NUMBER_KEYS.currentLife, 100),
  );
  const [xp, setXp] = useState<number>(() =>
    typeof window === 'undefined' ? 0 : readLocalNumber(LOCAL_NUMBER_KEYS.xp, 0),
  );
  const [hidden, setHidden] = useState<boolean>(() => getPetCompanionHidden());
  const [clock, setClock] = useState<number>(() => Date.now());
  const [peeking, setPeeking] = useState(false);
  const peekTimerRef = useRef<number | null>(null);

  // Bootstrap pet identity
  useEffect(() => {
    let cancelled = false;
    const bootstrap = async () => {
      try {
        const [{ identity }, snapshot] = await Promise.all([
          initializePetOsSession(),
          getPetStateSnapshot(),
        ]);
        if (!cancelled) {
          setPetIdentity(identity);
          setPetState(snapshot);
        }
      } catch { /* ignore */ }
    };
    void bootstrap();
    const unsubscribe = subscribePetState((state) => {
      if (!cancelled) setPetState(state);
    });
    return () => { cancelled = true; unsubscribe(); };
  }, []);

  useEffect(() => {
    const t = window.setInterval(() => setClock(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => subscribeLocalNumber(LOCAL_NUMBER_KEYS.currentLife, 100, setCurrentLife), []);
  useEffect(() => subscribeLocalNumber(LOCAL_NUMBER_KEYS.xp, 0, setXp), []);

  // Hidden state sync (cross-tab + cross-component)
  useEffect(() => {
    const onCustom = (e: Event) => {
      const next = (e as CustomEvent<boolean>).detail;
      setHidden(!!next);
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === HIDDEN_KEY) setHidden(getPetCompanionHidden());
    };
    window.addEventListener(HIDDEN_EVENT, onCustom);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(HIDDEN_EVENT, onCustom);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  // Random "peek" animation every 25–55s
  useEffect(() => {
    if (disabled || hidden) return;
    const schedule = () => {
      const delay = 25000 + Math.random() * 30000;
      peekTimerRef.current = window.setTimeout(() => {
        setPeeking(true);
        window.setTimeout(() => setPeeking(false), 2200);
        schedule();
      }, delay);
    };
    schedule();
    return () => {
      if (peekTimerRef.current) window.clearTimeout(peekTimerRef.current);
    };
  }, [disabled, hidden]);

  const isAdopted = !!petIdentity?.enabledAt;

  const cardPosture = useMemo(
    () => getCardPosture(petState?.posture ?? 'idle', currentLife, petState?.lastStatus ?? null),
    [petState?.posture, petState?.lastStatus, currentLife],
  );

  const moodBg = MOOD_BG[cardPosture] ?? MOOD_BG['平常'];
  // moodTintClass — kept for parity with PetOsCard styling; not currently rendered
  void getCardMoodTint(petState?.lastStatus ?? null);

  const bubbleVisible = useMemo(() => {
    if (!petState?.bubbleText || !petState?.bubbleExpiresAt) return false;
    if (petState.muted) return false;
    return petState.bubbleExpiresAt > clock;
  }, [clock, petState]);

  const stage = deriveStage(xp);
  const scale = STAGE_SCALE[stage];

  if (disabled || hidden || !isAdopted) return null;

  return (
    <>
      <style>{`
        @keyframes pet-companion-breath {
          0%, 100% { transform: translateY(0) scale(1); }
          50%      { transform: translateY(-2px) scale(1.02); }
        }
        .pet-companion-breath { animation: pet-companion-breath 3s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .pet-companion-breath { animation: none; }
        }
      `}</style>

      <motion.div
        className="fixed z-[80] pointer-events-none"
        style={{ right: 16, bottom: 84 }}
        initial={{ opacity: 0, y: 24 }}
        animate={{
          opacity: 1,
          y: 0,
          x: peeking ? -18 : 0,
        }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* bubble */}
        <AnimatePresence>
          {bubbleVisible && petState?.bubbleText && (
            <motion.div
              key={petState.bubbleText}
              initial={{ opacity: 0, y: 6, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.9 }}
              transition={{ duration: 0.25 }}
              className="pointer-events-auto absolute right-[78px] bottom-3 max-w-[200px] rounded-2xl bg-white/95 px-3 py-2 text-[12px] leading-snug text-neutral-700 shadow-lg ring-1 ring-black/5 backdrop-blur"
            >
              {petState.bubbleText}
              <span className="absolute -right-1.5 bottom-3 h-3 w-3 rotate-45 bg-white/95 ring-1 ring-black/5" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* avatar bubble */}
        <button
          type="button"
          onClick={() => setPetCompanionHidden(false)}
          className={cn(
            'pointer-events-auto group relative flex h-[68px] w-[68px] items-center justify-center rounded-full ring-1 backdrop-blur shadow-[0_12px_36px_-12px_rgba(15,23,42,0.35)] transition-shadow',
            moodBg,
            'hover:shadow-[0_18px_48px_-14px_rgba(15,23,42,0.45)]',
          )}
          aria-label="电子宠物"
        >
          <div className="pet-companion-breath" style={{ transform: `scale(${scale})` }}>
            <AnimatePresence mode="wait">
              <motion.svg
                key={cardPosture}
                viewBox="0 0 40 40"
                width="44"
                height="44"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                {POSTURE_SVG[cardPosture]}
              </motion.svg>
            </AnimatePresence>
          </div>

          {/* close button */}
          <span
            role="button"
            aria-label="收起小东西"
            onClick={(e) => {
              e.stopPropagation();
              setPetCompanionHidden(true);
            }}
            className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-white text-neutral-500 ring-1 ring-black/5 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X size={11} />
          </span>

          {/* stage dot */}
          <span
            className={cn(
              'absolute -bottom-0.5 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full',
              stage === 'baby' && 'bg-rose-300',
              stage === 'teen' && 'bg-emerald-400',
              stage === 'adult' && 'bg-indigo-500',
            )}
          />
        </button>
      </motion.div>
    </>
  );
};

export default PetCompanion;
