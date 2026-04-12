import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Solar } from 'lunar-javascript';
import { cn } from '../../lib/utils';
import { LOCAL_NUMBER_KEYS, readLocalNumber, subscribeLocalNumber, writeLocalNumber } from '../../lib/localSignals';
import { createSelfGossipThread } from '../../lib/community';
import {
  Settings, X, Check, Plus, Trash2, RotateCcw,
  Coffee, Heart, Zap, Gift, Sparkles,
} from 'lucide-react';

// ─── Storage helpers ──────────────────────────────────────────────────────────
const SK = {
  SALARY:     'cl_monthly_salary',
  WORK_START: 'cl_work_start',
  WORK_END:   'cl_work_end',
  XP:         'cl_hacker_xp',
  TREES:      'cl_hacker_trees',
  NOTES:      'cl_gossip_notes',
  TODOS:      'cl_today_todos',
  PET:        'cl_active_pet',
  PET_COLL:   'cl_pet_collection',
  PET_BOXES:  'cl_pet_boxes_opened',
} as const;

function loadNum(key: string, fallback: number) {
  if (key === SK.SALARY) return readLocalNumber(LOCAL_NUMBER_KEYS.salary, fallback);
  if (key === SK.XP) return readLocalNumber(LOCAL_NUMBER_KEYS.xp, fallback);
  if (key === SK.TREES) return readLocalNumber(LOCAL_NUMBER_KEYS.trees, fallback);
  const raw = localStorage.getItem(key);
  const v = Number(raw);
  return raw !== null && !isNaN(v) ? v : fallback;
}
function loadJSON<T>(key: string, fallback: T): T {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback; }
  catch { return fallback; }
}
// Emit XP change so all modules stay in sync via a custom event
function emitXP(next: number) {
  writeLocalNumber(LOCAL_NUMBER_KEYS.xp, next);
  window.dispatchEvent(new CustomEvent('cl_xp', { detail: next }));
}

// ─── Pet system ───────────────────────────────────────────────────────────────
interface PetDef { emoji: string; name: string; rarity: 'normal' | 'rare' | 'legendary'; bg: string }
interface ActivePet { id: string; def: PetDef; mood: number; hunger: number; lastFed: number; createdAt: number }

const PET_POOL: PetDef[] = [
  // normal 60%
  { emoji: '🐱', name: '橘猫',   rarity: 'normal',    bg: 'from-orange-50 to-yellow-50' },
  { emoji: '🐶', name: '柴犬',   rarity: 'normal',    bg: 'from-amber-50 to-orange-50'  },
  { emoji: '🐹', name: '仓鼠',   rarity: 'normal',    bg: 'from-pink-50 to-rose-50'     },
  { emoji: '🐰', name: '兔兔',   rarity: 'normal',    bg: 'from-slate-50 to-gray-100'   },
  { emoji: '🐸', name: '青蛙君', rarity: 'normal',    bg: 'from-green-50 to-emerald-50' },
  // rare 30%
  { emoji: '🦊', name: '狐狸',   rarity: 'rare',      bg: 'from-orange-100 to-red-50'   },
  { emoji: '🐼', name: '熊猫',   rarity: 'rare',      bg: 'from-gray-100 to-slate-50'   },
  { emoji: '🦋', name: '蝴蝶',   rarity: 'rare',      bg: 'from-purple-50 to-violet-50' },
  { emoji: '🦜', name: '鹦鹉',   rarity: 'rare',      bg: 'from-cyan-50 to-teal-50'     },
  // legendary 10%
  { emoji: '🐉', name: '小青龙', rarity: 'legendary', bg: 'from-yellow-50 to-amber-100' },
  { emoji: '🦄', name: '独角兽', rarity: 'legendary', bg: 'from-pink-50 to-purple-50'   },
];

const RARITY_STYLE = {
  normal:    { label: '普通',   badge: 'bg-brand-light-gray text-brand-gray border-brand-border/30' },
  rare:      { label: '稀有 ✦', badge: 'bg-apple-blue/10 text-apple-blue border-apple-blue/20'     },
  legendary: { label: '传说 ★', badge: 'bg-amber-50 text-amber-600 border-amber-200'               },
};

function rollPet(): PetDef {
  const r = Math.random();
  const pool = r < 0.10
    ? PET_POOL.filter(p => p.rarity === 'legendary')
    : r < 0.40
    ? PET_POOL.filter(p => p.rarity === 'rare')
    : PET_POOL.filter(p => p.rarity === 'normal');
  return pool[Math.floor(Math.random() * pool.length)];
}

function makePet(def: PetDef): ActivePet {
  return { id: `${Date.now()}`, def, mood: 80, hunger: 20, lastFed: Date.now(), createdAt: Date.now() };
}

// ─── MODULE 1 · Salary Monitor ────────────────────────────────────────────────
const SalaryMonitor: React.FC = () => {
  const [salary, setSalary]       = useState(() => loadNum(SK.SALARY, 8000));
  const [workStart, setWorkStart] = useState(() => localStorage.getItem(SK.WORK_START) || '09:00');
  const [workEnd, setWorkEnd]     = useState(() => localStorage.getItem(SK.WORK_END)   || '18:00');
  const [now, setNow]             = useState(() => new Date());
  const [showSettings, setShowSettings] = useState(false);
  const [draft, setDraft] = useState({ salary: '8000', start: '09:00', end: '18:00' });

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => { writeLocalNumber(LOCAL_NUMBER_KEYS.salary, salary); }, [salary]);

  const { startMin, endMin } = useMemo(() => {
    const [sh, sm] = workStart.split(':').map(Number);
    const [eh, em] = workEnd.split(':').map(Number);
    return { startMin: sh * 60 + sm, endMin: eh * 60 + em };
  }, [workStart, workEnd]);

  const workDays   = 22;
  const workTotal  = endMin - startMin;                    // minutes
  const dailySal   = salary / workDays;
  const hourlyRate = dailySal / (workTotal / 60);
  const minuteRate = hourlyRate / 60;

  const currMin = now.getHours() * 60 + now.getMinutes();
  const currSec = now.getSeconds();
  const isBefore   = currMin < startMin;
  const isOvertime = currMin >= endMin;

  const workedSec   = isBefore ? 0 : isOvertime ? workTotal * 60 : (currMin - startMin) * 60 + currSec;
  const earned      = (dailySal * workedSec) / (workTotal * 60);
  const progress    = isBefore ? 0 : isOvertime ? 100 : (workedSec / (workTotal * 60)) * 100;
  const remainSec   = isOvertime ? 0 : (endMin - currMin) * 60 - currSec;
  const remH        = Math.floor(remainSec / 3600);
  const remM        = Math.floor((remainSec % 3600) / 60);
  const remS        = remainSec % 60;
  const otSec       = isOvertime ? (currMin - endMin) * 60 + currSec : 0;
  const otCost      = (otSec / 3600) * hourlyRate;

  const openSettings = () => {
    setDraft({ salary: String(salary), start: workStart, end: workEnd });
    setShowSettings(true);
  };
  const saveSettings = () => {
    const v = Number(draft.salary);
    if (v > 0) setSalary(v);
    setWorkStart(draft.start);
    setWorkEnd(draft.end);
    localStorage.setItem(SK.WORK_START, draft.start);
    localStorage.setItem(SK.WORK_END, draft.end);
    setShowSettings(false);
  };

  return (
    <div className="bg-brand-dark rounded-3xl p-6 flex flex-col h-full relative overflow-hidden">
      {/* grid bg */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px)', backgroundSize: '24px 24px' }} />

      {/* Header */}
      <div className="flex items-start justify-between mb-5 relative z-10">
        <div>
          <p className="text-[9px] font-bold text-white/25 uppercase tracking-[.22em] mb-2">高效下班清醒系统</p>
          <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold',
            isOvertime ? 'bg-red-500/20 text-red-400' : isBefore ? 'bg-white/8 text-white/30' : 'bg-emerald-500/20 text-emerald-400'
          )}>
            <span className={cn('w-1.5 h-1.5 rounded-full',
              isOvertime ? 'bg-red-400' : isBefore ? 'bg-white/30' : 'bg-emerald-400 animate-pulse'
            )} />
            {isOvertime ? '加班中' : isBefore ? '未上班' : '上班中'}
          </span>
        </div>
        <button onClick={openSettings}
          className="w-8 h-8 rounded-xl bg-white/8 hover:bg-white/15 flex items-center justify-center text-white/30 hover:text-white/80 transition-all">
          <Settings size={13} />
        </button>
      </div>

      {/* Settings overlay */}
      <AnimatePresence>
        {showSettings && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            className="absolute inset-x-5 top-[4.5rem] bg-[#111827] border border-white/12 rounded-2xl p-4 z-30 shadow-2xl">
            <div className="flex justify-between mb-3">
              <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">个人设置</p>
              <button onClick={() => setShowSettings(false)} className="text-white/30 hover:text-white transition-colors"><X size={12} /></button>
            </div>
            <div className="space-y-2 mb-3">
              <div>
                <label className="text-[9px] text-white/30 font-bold block mb-1">月薪（元）</label>
                <input type="number" value={draft.salary}
                  onChange={e => setDraft(d => ({ ...d, salary: e.target.value }))}
                  className="w-full bg-white/8 border border-white/12 text-white text-xs font-bold rounded-xl px-3 py-2 outline-none focus:border-apple-blue" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] text-white/30 font-bold block mb-1">上班</label>
                  <input type="time" value={draft.start}
                    onChange={e => setDraft(d => ({ ...d, start: e.target.value }))}
                    className="w-full bg-white/8 border border-white/12 text-white text-xs font-bold rounded-xl px-3 py-2 outline-none focus:border-apple-blue" />
                </div>
                <div>
                  <label className="text-[9px] text-white/30 font-bold block mb-1">下班</label>
                  <input type="time" value={draft.end}
                    onChange={e => setDraft(d => ({ ...d, end: e.target.value }))}
                    className="w-full bg-white/8 border border-white/12 text-white text-xs font-bold rounded-xl px-3 py-2 outline-none focus:border-apple-blue" />
                </div>
              </div>
            </div>
            <button onClick={saveSettings}
              className="w-full py-2.5 bg-apple-blue text-white text-xs font-bold rounded-xl hover:bg-apple-blue/90 transition-all">
              保存
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Big number */}
      <div className="relative z-10 mb-5">
        <motion.p key={Math.floor(earned * 10)} initial={{ opacity: .6 }} animate={{ opacity: 1 }}
          className="text-5xl sm:text-6xl font-black text-white tabular-nums leading-none" style={{ fontFamily: 'ui-monospace, SFMono-Regular, monospace' }}>
          ¥{earned.toFixed(2)}
        </motion.p>
        <p className="text-[10px] text-white/25 mt-1.5" style={{ fontFamily: 'ui-monospace, SFMono-Regular, monospace' }}>
          时薪 ¥{hourlyRate.toFixed(1)} · 分钟 ¥{minuteRate.toFixed(3)}
        </p>
      </div>

      {/* Progress bar */}
      <div className="relative z-10 mb-5">
        <div className="flex justify-between text-[9px] font-bold mb-2 text-white/30">
          <span>{workStart}</span>
          <span className={cn('font-black', isOvertime ? 'text-red-400' : isBefore ? 'text-white/20' : 'text-white/70')}>
            {isOvertime
              ? `加班 ${Math.floor(otSec / 3600)}h ${Math.floor((otSec % 3600) / 60)}m`
              : isBefore ? '等待上班'
              : `${remH > 0 ? remH + 'h ' : ''}${remM}m ${remS}s`}
          </span>
          <span>{workEnd}</span>
        </div>
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className={cn('h-full rounded-full', isOvertime ? 'bg-red-400' : progress > 80 ? 'bg-yellow-400' : 'bg-emerald-400')}
            initial={{ width: 0 }} animate={{ width: `${Math.min(progress, 100)}%` }}
            transition={{ duration: .8, ease: 'easeOut' }} />
        </div>
        <div className="relative h-4 mt-0.5">
          {[{ pct: 36, label: '午饭' }, { pct: 75, label: '下午茶' }].map(({ pct, label }) => (
            <div key={label} className="absolute flex flex-col items-center" style={{ left: `${pct}%`, transform: 'translateX(-50%)' }}>
              <div className={cn('w-px h-1.5', progress >= pct ? 'bg-white/30' : 'bg-white/10')} />
              <span className={cn('text-[8px] font-bold', progress >= pct ? 'text-white/40' : 'text-white/15')}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 mt-auto relative z-10">
        <div className="bg-white/5 rounded-2xl p-3 border border-white/8">
          <p className="text-[8px] text-white/25 font-bold mb-1">月薪</p>
          <p className="text-sm font-black text-white" style={{ fontFamily: 'ui-monospace, SFMono-Regular, monospace' }}>¥{salary.toLocaleString()}</p>
          <p className="text-[8px] text-white/20 mt-0.5">日薪 ¥{dailySal.toFixed(0)}</p>
        </div>
        <div className="bg-white/5 rounded-2xl p-3 border border-white/8">
          <p className="text-[8px] text-white/25 font-bold mb-1">年薪估算</p>
          <p className="text-sm font-black text-purple-300" style={{ fontFamily: 'ui-monospace, SFMono-Regular, monospace' }}>
            ¥{(salary * 12 / 10000).toFixed(1)}<span className="text-xs">万</span>
          </p>
          <p className="text-[8px] text-white/20 mt-0.5">时薪 ¥{hourlyRate.toFixed(1)}</p>
        </div>
      </div>

      {isOvertime && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="mt-3 bg-red-500/12 border border-red-500/20 rounded-2xl p-3 text-center relative z-10">
          <p className="text-red-400 text-xs font-bold">⚠️ 正在免费加班，已亏 ¥{otCost.toFixed(2)}</p>
        </motion.div>
      )}
      {!isOvertime && !isBefore && progress >= 90 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="mt-3 bg-emerald-500/12 border border-emerald-500/20 rounded-2xl p-3 text-center relative z-10">
          <p className="text-emerald-400 text-xs font-bold">🎉 快下班啦，再坚持一下！</p>
        </motion.div>
      )}
    </div>
  );
};

// ─── MODULE 2 · Electronic Pet + Blind Box ────────────────────────────────────
const PetModule: React.FC<{ xp: number; onXPChange: (next: number) => void }> = ({ xp, onXPChange }) => {
  const [pet, setPet]           = useState<ActivePet | null>(() => loadJSON(SK.PET, null));
  const [collection, setCollection] = useState<PetDef[]>(() => loadJSON(SK.PET_COLL, []));
  const [boxesOpened, setBoxesOpened] = useState(() => loadNum(SK.PET_BOXES, 0));
  const [phase, setPhase]       = useState<'idle' | 'shaking' | 'reveal'>('idle');
  const [revealDef, setRevealDef] = useState<PetDef | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const BOX_COST = 100;

  useEffect(() => { localStorage.setItem(SK.PET, JSON.stringify(pet)); }, [pet]);
  useEffect(() => { localStorage.setItem(SK.PET_COLL, JSON.stringify(collection)); }, [collection]);
  useEffect(() => { localStorage.setItem(SK.PET_BOXES, String(boxesOpened)); }, [boxesOpened]);

  // Decay mood/hunger over time
  useEffect(() => {
    if (!pet) return;
    const id = setInterval(() => {
      setPet(p => {
        if (!p) return p;
        const hoursSinceFed = (Date.now() - p.lastFed) / 3_600_000;
        return {
          ...p,
          hunger: Math.min(100, p.hunger + hoursSinceFed * 5),
          mood:   Math.max(0,   p.mood   - hoursSinceFed * 3),
        };
      });
    }, 30_000);
    return () => clearInterval(id);
  }, [pet?.id]);

  const openBox = () => {
    if (xp < BOX_COST || phase !== 'idle') return;
    onXPChange(xp - BOX_COST);
    setPhase('shaking');
    setTimeout(() => {
      const def = rollPet();
      setRevealDef(def);
      setPhase('reveal');
      setBoxesOpened(b => b + 1);
      setCollection(prev => {
        if (prev.some(p => p.name === def.name)) return prev;
        return [...prev, def];
      });
      setTimeout(() => {
        setPet(makePet(def));
        setPhase('idle');
        setRevealDef(null);
      }, 2800);
    }, 1400);
  };

  const doAction = (type: 'pat' | 'feed' | 'play') => {
    if (!pet) return;
    if (type === 'feed' && xp < 30) { setActionFeedback('能量不足！'); setTimeout(() => setActionFeedback(null), 1500); return; }
    setPet(p => {
      if (!p) return p;
      if (type === 'pat')  return { ...p, mood: Math.min(100, p.mood + 10) };
      if (type === 'feed') return { ...p, hunger: Math.max(0, p.hunger - 40), mood: Math.min(100, p.mood + 15), lastFed: Date.now() };
      return { ...p, mood: Math.min(100, p.mood + 20) };
    });
    if (type === 'feed') onXPChange(xp - 30);
    const msgs = { pat: '摸了摸头 🥰', feed: '吃饱啦！', play: '玩得好开心 🎉' };
    setActionFeedback(msgs[type]);
    setTimeout(() => setActionFeedback(null), 1500);
  };

  const moodLabel = (m: number) => m >= 80 ? '超开心 😊' : m >= 50 ? '还不错 🙂' : m >= 30 ? '有点累 😐' : '不高兴 😢';
  const hungerLabel = (h: number) => h >= 70 ? '超级饿 😫' : h >= 40 ? '有点饿 🍽️' : '吃饱了 😌';
  const ageInDays = pet ? Math.max(0, Math.floor((Date.now() - pet.createdAt) / 86_400_000)) : 0;

  return (
    <div className="bg-white rounded-3xl border border-brand-border/10 shadow-sm p-5 flex flex-col h-full relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[9px] font-bold text-brand-gray/50 uppercase tracking-[.2em] mb-1">电子宠物</p>
          <div className="flex items-center gap-1.5">
            <Gift size={13} className="text-apple-pink" />
            <span className="text-xs font-bold text-brand-dark">宠物盲盒</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[9px] text-brand-gray/40 font-bold">已集 {collection.length} 只</p>
          <div className="flex gap-0.5 mt-1 justify-end">
            {collection.slice(-5).map((p, i) => (
              <span key={i} className="text-base leading-none">{p.emoji}</span>
            ))}
          </div>
        </div>
      </div>

      {/* No pet yet → blind box */}
      {!pet && phase === 'idle' && (
        <div className="flex-grow flex flex-col items-center justify-center gap-4">
          <motion.div
            className="w-24 h-24 bg-gradient-to-br from-apple-pink/10 to-apple-purple/10 rounded-3xl border-2 border-dashed border-brand-border/20 flex items-center justify-center text-5xl cursor-pointer select-none"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            onClick={openBox}
          >
            🎁
          </motion.div>
          <div className="text-center">
            <p className="text-sm font-bold text-brand-dark mb-1">开个宠物盲盒</p>
            <p className="text-[10px] text-brand-gray opacity-60">消耗 {BOX_COST} 能量</p>
            {xp < BOX_COST && (
              <p className="text-[10px] text-red-400 font-bold mt-1">能量不足（当前 {xp}）</p>
            )}
          </div>
          <button onClick={openBox} disabled={xp < BOX_COST}
            className={cn(
              'px-6 py-2.5 rounded-2xl text-xs font-bold transition-all',
              xp >= BOX_COST
                ? 'bg-brand-dark text-white hover:bg-brand-dark/90 shadow-lg'
                : 'bg-brand-light-gray text-brand-gray/40 cursor-not-allowed'
            )}>
            开盲盒 · {BOX_COST} 能量
          </button>
        </div>
      )}

      {/* Shaking box animation */}
      {phase === 'shaking' && (
        <div className="flex-grow flex flex-col items-center justify-center gap-4">
          <motion.div
            className="text-7xl"
            animate={{ rotate: [-8, 8, -8, 8, -4, 4, 0], scale: [1, 1.1, 1, 1.1, 1] }}
            transition={{ duration: 1.4, ease: 'easeInOut' }}
          >
            🎁
          </motion.div>
          <p className="text-sm font-bold text-brand-dark animate-pulse">正在开盒...</p>
        </div>
      )}

      {/* Reveal animation */}
      {phase === 'reveal' && revealDef && (
        <motion.div
          initial={{ opacity: 0, scale: .5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          className="flex-grow flex flex-col items-center justify-center gap-3"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
            className={cn('w-24 h-24 rounded-3xl bg-gradient-to-br flex items-center justify-center text-5xl shadow-lg', revealDef.bg)}
          >
            {revealDef.emoji}
          </motion.div>
          <p className="text-xl font-black text-brand-dark">{revealDef.name}</p>
          <span className={cn('px-3 py-1 rounded-full text-[10px] font-bold border', RARITY_STYLE[revealDef.rarity].badge)}>
            {RARITY_STYLE[revealDef.rarity].label}
          </span>
          <p className="text-[10px] text-brand-gray opacity-60">它选择了你！</p>
        </motion.div>
      )}

      {/* Active pet */}
      {pet && phase === 'idle' && (
        <div className="flex-grow flex flex-col">
          {/* Pet display */}
          <div className={cn('flex-grow flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br mb-4 p-4 relative', pet.def.bg)}>
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
              className="text-6xl mb-2"
            >
              {pet.def.emoji}
            </motion.div>
            <p className="text-sm font-black text-brand-dark">{pet.def.name}</p>
            <p className="text-[9px] text-brand-gray/60 font-bold">{ageInDays} 天大</p>

            {/* Action feedback toast */}
            <AnimatePresence>
              {actionFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: .9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute top-2 left-1/2 -translate-x-1/2 bg-brand-dark/80 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap"
                >
                  {actionFeedback}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mood & hunger bars */}
          <div className="space-y-2 mb-3">
            <div className="flex items-center gap-2">
              <Heart size={11} className="text-apple-pink shrink-0" />
              <div className="flex-grow h-1.5 bg-brand-light-gray rounded-full overflow-hidden">
                <motion.div className="h-full bg-apple-pink rounded-full" animate={{ width: `${pet.mood}%` }} transition={{ duration: .6 }} />
              </div>
              <span className="text-[9px] text-brand-gray font-bold shrink-0 w-16 text-right">{moodLabel(pet.mood)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Coffee size={11} className="text-amber-500 shrink-0" />
              <div className="flex-grow h-1.5 bg-brand-light-gray rounded-full overflow-hidden">
                <motion.div className={cn('h-full rounded-full', pet.hunger > 60 ? 'bg-red-400' : 'bg-amber-400')} animate={{ width: `${pet.hunger}%` }} transition={{ duration: .6 }} />
              </div>
              <span className="text-[9px] text-brand-gray font-bold shrink-0 w-16 text-right">{hungerLabel(pet.hunger)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { type: 'pat' as const,  label: '摸头',  icon: '🤚', cost: null },
              { type: 'feed' as const, label: '喂食',  icon: '🍎', cost: 30   },
              { type: 'play' as const, label: '玩耍',  icon: '🎾', cost: null },
            ].map(({ type, label, icon, cost }) => (
              <button key={type} onClick={() => doAction(type)}
                className="flex flex-col items-center py-2 rounded-xl bg-brand-light-gray/60 hover:bg-brand-light-gray border border-brand-border/10 transition-all active:scale-95 gap-1">
                <span className="text-base leading-none">{icon}</span>
                <span className="text-[9px] font-bold text-brand-dark">{label}</span>
                {cost && <span className="text-[8px] text-brand-gray/50">-{cost}</span>}
              </button>
            ))}
          </div>

          {/* Replace pet */}
          <button onClick={() => setPet(null)}
            className="mt-2 w-full text-[9px] text-brand-gray/40 hover:text-brand-gray font-bold transition-colors">
            送走 · 重新开盒
          </button>
        </div>
      )}
    </div>
  );
};

// ─── MODULE 3 · Focus Timer ────────────────────────────────────────────────────
const FocusTimer: React.FC<{ onXPChange: (next: number) => void; xp: number }> = ({ onXPChange, xp }) => {
  const WORK_SECS  = 25 * 60;
  const BREAK_SECS = 5  * 60;

  const [phase,        setPhase]        = useState<'work' | 'break'>('work');
  const [timeLeft,     setTimeLeft]     = useState(WORK_SECS);
  const [isActive,     setIsActive]     = useState(false);
  const [sessions,     setSessions]     = useState(() => loadNum(SK.TREES, 0));
  const [justDone,     setJustDone]     = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0 && isActive) {
      clearInterval(timerRef.current!);
      setIsActive(false);
      setJustDone(true);
      if (phase === 'work') {
        const next = sessions + 1;
        setSessions(next);
        writeLocalNumber(LOCAL_NUMBER_KEYS.trees, next);
        onXPChange(xp + 50);
        setTimeout(() => {
          setPhase('break');
          setTimeLeft(BREAK_SECS);
          setJustDone(false);
        }, 2500);
      } else {
        setTimeout(() => {
          setPhase('work');
          setTimeLeft(WORK_SECS);
          setJustDone(false);
        }, 1500);
      }
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isActive, timeLeft]);

  const reset = () => { setIsActive(false); setTimeLeft(phase === 'work' ? WORK_SECS : BREAK_SECS); };
  const total = phase === 'work' ? WORK_SECS : BREAK_SECS;
  const prog  = ((total - timeLeft) / total) * 100;
  const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const s = (timeLeft % 60).toString().padStart(2, '0');

  const isBreak    = phase === 'break';
  const ringColor  = isBreak ? '#007AFF' : '#34d399';
  const ringGlow   = isBreak ? '#007AFF' : '#34d399';
  const circumf    = 2 * Math.PI * 52;

  return (
    <div className={cn(
      'rounded-3xl p-5 flex flex-col h-full transition-colors duration-500',
      isBreak ? 'bg-gradient-to-br from-apple-blue/10 to-apple-indigo/5 border border-apple-blue/15' : 'bg-gradient-to-br from-[#0d3b14] to-[#134e1c]'
    )}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className={cn('text-[9px] font-bold uppercase tracking-[.2em] mb-1', isBreak ? 'text-apple-blue/50' : 'text-white/25')}>
            专注花园
          </p>
          <span className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold',
            isBreak ? 'bg-apple-blue/15 text-apple-blue' : 'bg-emerald-500/20 text-emerald-400'
          )}>
            {isBreak ? '☕ 休息时间' : `🌱 专注 · 第 ${sessions + 1} 节`}
          </span>
        </div>
        <div className={cn('flex items-center gap-1 rounded-full px-3 py-1.5 border', isBreak ? 'bg-apple-blue/10 border-apple-blue/20' : 'bg-white/8 border-white/15')}>
          <span className={cn('text-sm', isBreak ? 'text-apple-blue' : 'text-yellow-300')}>🌲</span>
          <span className={cn('text-xs font-black', isBreak ? 'text-apple-blue' : 'text-white')}>{sessions}</span>
        </div>
      </div>

      {/* Circle timer */}
      <div className="flex-grow flex flex-col items-center justify-center">
        <div className="relative w-36 h-36 mb-5">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="7" />
            <motion.circle
              cx="60" cy="60" r="52" fill="none"
              stroke={ringColor} strokeWidth="7" strokeLinecap="round"
              strokeDasharray={circumf}
              strokeDashoffset={circumf * (1 - prog / 100)}
              style={{ filter: isActive ? `drop-shadow(0 0 10px ${ringGlow})` : 'none' }}
              transition={{ duration: .5 }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.p
              animate={isActive ? { scale: [1, 1.02, 1] } : {}}
              transition={{ repeat: Infinity, duration: 2 }}
              className={cn('text-3xl font-black tabular-nums', isBreak ? 'text-apple-blue' : 'text-white')}
              style={{ fontFamily: 'ui-monospace, SFMono-Regular, monospace' }}
            >
              {m}:{s}
            </motion.p>
            <p className={cn('text-[9px] font-bold mt-0.5', isBreak ? 'text-apple-blue/60' : 'text-emerald-400/70')}>
              {isActive ? (isBreak ? '好好休息' : '生长中 🌱') : '准备开始'}
            </p>
          </div>
        </div>

        <AnimatePresence>
          {justDone && (
            <motion.div initial={{ opacity: 0, scale: .8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="text-center mb-4">
              <p className={cn('text-2xl mb-1', isBreak ? '☕' : '🎉')}>{isBreak ? '☕' : '🎉'}</p>
              <p className={cn('text-sm font-black', isBreak ? 'text-apple-blue' : 'text-yellow-300')}>
                {isBreak ? '休息结束！' : '+50 能量 · 种下一棵树！'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-2 w-full max-w-[200px]">
          <motion.button whileTap={{ scale: .94 }} onClick={() => setIsActive(a => !a)}
            className={cn(
              'flex-grow py-3 rounded-2xl text-sm font-black transition-all border-2',
              isBreak
                ? isActive ? 'bg-apple-blue/15 text-apple-blue border-apple-blue/30' : 'bg-apple-blue text-white border-apple-blue shadow-lg'
                : isActive ? 'bg-yellow-400/15 text-yellow-300 border-yellow-400/30' : 'bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-900/30'
            )}>
            {isActive ? '⏸ 暂停' : isBreak ? '▶ 开始休息' : '▶ 开始专注'}
          </motion.button>
          <motion.button whileTap={{ scale: .9 }} onClick={reset}
            className={cn(
              'w-12 rounded-2xl flex items-center justify-center border-2 font-black',
              isBreak ? 'bg-apple-blue/10 text-apple-blue/60 border-apple-blue/20 hover:bg-apple-blue/20' : 'bg-white/8 text-white/50 border-white/12 hover:bg-white/15'
            )}>
            <RotateCcw size={15} />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

// ─── MODULE 4 · Today Todo ─────────────────────────────────────────────────────
interface TodoItem { id: number; text: string; done: boolean }

const TodayTodo: React.FC = () => {
  const todayKey = `${SK.TODOS}_${new Date().toDateString()}`;
  const [todos, setTodos] = useState<TodoItem[]>(() => loadJSON(todayKey, []));
  const [input, setInput]   = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { localStorage.setItem(todayKey, JSON.stringify(todos)); }, [todos, todayKey]);

  const add = () => {
    const text = input.trim();
    if (!text) return;
    setTodos(t => [...t, { id: Date.now(), text, done: false }]);
    setInput('');
    inputRef.current?.focus();
  };

  const toggle = (id: number) => setTodos(t => t.map(i => i.id === id ? { ...i, done: !i.done } : i));
  const remove = (id: number) => setTodos(t => t.filter(i => i.id !== id));

  const doneCount = todos.filter(t => t.done).length;

  return (
    <div className="bg-white rounded-3xl border border-brand-border/10 shadow-sm p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[9px] font-bold text-brand-gray/50 uppercase tracking-[.2em] mb-1">今日清单</p>
          <p className="text-xs font-bold text-brand-dark">
            {doneCount}/{todos.length} 完成
            {todos.length > 0 && doneCount === todos.length && <span className="ml-1 text-emerald-500">全部搞定！🎉</span>}
          </p>
        </div>
        {todos.length > 0 && (
          <div className="w-8 h-8 rounded-full bg-brand-light-gray/60 flex items-center justify-center">
            <span className="text-[10px] font-black text-brand-gray">
              {Math.round((doneCount / todos.length) * 100)}%
            </span>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {todos.length > 0 && (
        <div className="w-full h-1 bg-brand-light-gray rounded-full mb-4 overflow-hidden">
          <motion.div className="h-full bg-emerald-400 rounded-full"
            animate={{ width: `${(doneCount / todos.length) * 100}%` }}
            transition={{ duration: .4 }} />
        </div>
      )}

      {/* List */}
      <div className="flex-grow overflow-y-auto space-y-1.5 mb-3 pr-1" style={{ maxHeight: '180px' }}>
        <AnimatePresence initial={false}>
          {todos.length === 0 && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center text-[10px] text-brand-gray/40 font-medium py-6">
              今天有什么要做的？
            </motion.p>
          )}
          {todos.map(todo => (
            <motion.div key={todo.id} layout
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}
              className="flex items-center gap-2 group p-2 rounded-xl hover:bg-brand-light-gray/40 transition-colors">
              <button onClick={() => toggle(todo.id)}
                className={cn(
                  'w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all',
                  todo.done ? 'bg-emerald-500 border-emerald-500' : 'border-brand-border/30 hover:border-emerald-400'
                )}>
                {todo.done && <Check size={11} className="text-white" strokeWidth={3} />}
              </button>
              <span className={cn('flex-grow text-xs font-medium leading-snug', todo.done ? 'line-through text-brand-gray/40' : 'text-brand-dark')}>
                {todo.text}
              </span>
              <button onClick={() => remove(todo.id)}
                className="opacity-0 group-hover:opacity-100 text-brand-gray/30 hover:text-red-400 transition-all">
                <Trash2 size={12} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          placeholder="添加任务..."
          className="flex-grow bg-brand-light-gray/50 border border-brand-border/10 text-brand-dark placeholder-brand-gray/40 px-3 py-2 rounded-xl text-xs outline-none focus:ring-2 focus:ring-apple-blue/20 font-medium" />
        <button onClick={add}
          className="w-9 h-9 bg-brand-dark text-white rounded-xl flex items-center justify-center hover:bg-brand-dark/80 transition-all active:scale-95">
          <Plus size={15} />
        </button>
      </div>
    </div>
  );
};

// ─── MODULE 5 · Food Selector ─────────────────────────────────────────────────
const FoodSelector: React.FC = () => {
  const FOODS = [
    { emoji: '🍔', item: '麦当劳 1+1' }, { emoji: '🍗', item: 'KFC 疯狂四' },
    { emoji: '🍚', item: '猪脚饭' },    { emoji: '🍜', item: '兰州拉面' },
    { emoji: '🥗', item: '鸡胸沙拉' },  { emoji: '🌶️', item: '麻辣烫' },
    { emoji: '🍱', item: '台式卤肉饭' }, { emoji: '🍝', item: '意大利面' },
    { emoji: '🥙', item: '全麦三明治' }, { emoji: '🍲', item: '螺蛳粉' },
  ];

  const [idx, setIdx]           = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const rollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [displayIdx, setDisplayIdx] = useState(0);

  useEffect(() => () => { if (rollRef.current) clearInterval(rollRef.current); }, []);

  const roll = () => {
    if (isRolling) return;
    setIsRolling(true);
    rollRef.current = setInterval(() => {
      setDisplayIdx(Math.floor(Math.random() * FOODS.length));
    }, 80);
    setTimeout(() => {
      clearInterval(rollRef.current!);
      const final = Math.floor(Math.random() * FOODS.length);
      setIdx(final);
      setDisplayIdx(final);
      setIsRolling(false);
    }, 1400);
  };

  const current = FOODS[isRolling ? displayIdx : (idx ?? displayIdx)];

  return (
    <div className="bg-gradient-to-br from-rose-50 to-orange-50 rounded-3xl border border-rose-100 p-5 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4">
        <Coffee size={14} className="text-rose-400" />
        <p className="text-xs font-bold text-rose-700">今天吃什么</p>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center gap-3">
        <motion.div
          animate={isRolling ? { rotate: [-3, 3, -3], scale: [1, 1.08, 1] } : { rotate: 0, scale: 1 }}
          transition={isRolling ? { repeat: Infinity, duration: .12 } : { type: 'spring' }}
          className="w-20 h-20 rounded-3xl bg-white/80 border-2 border-rose-200 shadow-lg flex flex-col items-center justify-center gap-1"
        >
          <span className={cn('text-3xl', isRolling && 'blur-[1px]')}>{current.emoji}</span>
        </motion.div>

        <AnimatePresence mode="wait">
          {!isRolling && idx !== null && (
            <motion.p key={idx} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="text-sm font-black text-rose-700 text-center">
              {FOODS[idx].item}
            </motion.p>
          )}
        </AnimatePresence>

        {(idx === null && !isRolling) && (
          <p className="text-[11px] text-rose-400/70 font-medium text-center">让命运决定今天的午饭</p>
        )}
      </div>

      <motion.button
        whileTap={{ scale: .94 }} onClick={roll} disabled={isRolling}
        className="mt-4 w-full py-3 rounded-2xl bg-rose-500 text-white font-black text-sm hover:bg-rose-600 transition-all shadow-lg shadow-rose-200 disabled:opacity-60">
        {isRolling ? '🎲 随机中...' : idx !== null ? '🔄 再摇一次' : '🎲 开始摇'}
      </motion.button>
    </div>
  );
};

// ─── MODULE 6 · Daily Oracle ──────────────────────────────────────────────────
const DailyOracle: React.FC = () => {
  const { solar, lunar, yi, ji, wuXing, luckLevel } = useMemo(() => {
    const d   = new Date();
    const sol = Solar.fromDate(d);
    const lun = sol.getLunar();
    return {
      solar:     sol,
      lunar:     lun,
      yi:        lun.getDayYi().slice(0, 3).join(' · ') || '平安',
      ji:        lun.getDayJi().slice(0, 3).join(' · ') || '暴躁',
      wuXing:    lun.getDayNaYin(),
      luckLevel: (sol.getDay() + sol.getMonth()) % 4,
    };
  }, []);

  return (
    <div className="bg-gradient-to-br from-[#1a0533] via-[#0d1b4b] to-[#002b36] rounded-3xl p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[9px] font-bold text-white/25 uppercase tracking-[.2em] mb-1">今日签</p>
          <p className="text-xs font-bold text-white/70">
            {solar.getMonth()}月{solar.getDay()}日
          </p>
        </div>
        <div className="flex gap-0.5">
          {['🌟', '⭐', '✨', '💫'].map((ic, i) => (
            <span key={i} className={cn('text-xs', i <= luckLevel ? 'opacity-100' : 'opacity-15')}>{ic}</span>
          ))}
        </div>
      </div>

      <div className="flex-grow flex flex-col justify-center">
        <p className="text-emerald-300/70 text-[10px] font-black tracking-widest text-center mb-6">
          {lunar.getYearInGanZhi()}年 {lunar.getMonthInChinese()}月{lunar.getDayInChinese()}
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col items-center bg-emerald-500/15 border border-emerald-500/20 rounded-2xl px-3 py-4">
            <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[10px] font-black mb-2">宜</div>
            <p className="text-white/80 text-[10px] font-bold text-center leading-relaxed">{yi}</p>
          </div>
          <div className="flex flex-col items-center bg-red-500/12 border border-red-500/20 rounded-2xl px-3 py-4">
            <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white text-[10px] font-black mb-2">忌</div>
            <p className="text-white/60 text-[10px] font-bold text-center leading-relaxed">{ji}</p>
          </div>
        </div>
      </div>

      <p className="text-center text-[8px] text-white/20 font-bold tracking-widest mt-4">五行 · {wuXing}</p>
    </div>
  );
};

// ─── MODULE 7 · Gossip Board ──────────────────────────────────────────────────
interface NoteItem { id: number; text: string; color: string }

const NOTE_COLORS = [
  { bg: 'bg-yellow-100', border: 'border-yellow-300/60', dot: 'bg-yellow-400' },
  { bg: 'bg-pink-100',   border: 'border-pink-300/60',   dot: 'bg-pink-400'   },
  { bg: 'bg-blue-100',   border: 'border-blue-300/60',   dot: 'bg-blue-400'   },
  { bg: 'bg-green-100',  border: 'border-green-300/60',  dot: 'bg-green-400'  },
  { bg: 'bg-purple-100', border: 'border-purple-300/60', dot: 'bg-purple-400' },
];

const GossipBoard: React.FC = () => {
  const [notes, setNotes] = useState<NoteItem[]>(() =>
    loadJSON<NoteItem[]>(SK.NOTES, [
      { id: 1, text: '今天天气真好，想喝杯热可可 ☕', color: 'yellow' },
      { id: 2, text: '顺利搞定一个大单！给自己点赞 🎉', color: 'blue' },
    ])
  );
  const [input, setInput] = useState('');

  useEffect(() => { localStorage.setItem(SK.NOTES, JSON.stringify(notes)); }, [notes]);

  const add = () => {
    const text = input.trim();
    if (!text) return;
    const c = NOTE_COLORS[notes.length % NOTE_COLORS.length];
    setNotes(prev => [{ id: Date.now(), text, color: c.bg }, ...prev].slice(0, 9));
    void createSelfGossipThread(text);
    setInput('');
  };

  const remove = (id: number) => setNotes(prev => prev.filter(n => n.id !== id));

  const colorFor = (bg: string) => NOTE_COLORS.find(c => c.bg === bg) || NOTE_COLORS[0];

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl border border-amber-100 p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[9px] font-bold text-amber-700/50 uppercase tracking-[.2em] mb-1">茶水间贴板</p>
          <p className="text-xs font-bold text-amber-700">随手写下你的碎碎念</p>
        </div>
        <span className="text-[9px] font-black bg-white/60 text-amber-600 rounded-full px-2.5 py-1 border border-amber-200">
          {notes.length}/9
        </span>
      </div>

      <div className="flex-grow overflow-y-auto mb-3" style={{ maxHeight: '200px' }}>
        <div className="grid grid-cols-2 gap-2">
          <AnimatePresence>
            {notes.map((note, i) => {
              const c = colorFor(note.color);
              return (
                <motion.div key={note.id} layout
                  initial={{ scale: .85, opacity: 0, rotate: Math.random() * 6 - 3 }}
                  animate={{ scale: 1, opacity: 1, rotate: i % 2 === 0 ? -1.5 : 1.5 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className={cn('p-3 rounded-2xl border-2 shadow-sm text-xs text-slate-700 font-medium leading-relaxed relative group', c.bg, c.border)}
                >
                  <div className={cn('w-2.5 h-2.5 rounded-full mx-auto -mt-0.5 mb-1.5 shadow-sm', c.dot)} />
                  {note.text}
                  <button onClick={() => remove(note.id)}
                    className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-black/10 text-black/30 hover:bg-red-400 hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                    <X size={8} />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          placeholder="写张便利贴..."
          className="flex-grow bg-white/70 border-2 border-amber-200/60 text-slate-700 placeholder-slate-400/70 px-3 py-2.5 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-amber-300 font-medium" />
        <button onClick={add}
          className="w-10 h-10 bg-amber-500 text-white rounded-2xl flex items-center justify-center hover:bg-amber-600 transition-all active:scale-95 shadow-md border-2 border-amber-400">
          💌
        </button>
      </div>
    </div>
  );
};

// ─── MAIN: ToMyselfSpace ──────────────────────────────────────────────────────
export default function ToMyselfSpace() {
  const [xp, setXpState] = useState(() => loadNum(SK.XP, 8420));
  const [trees, setTrees] = useState(() => loadNum(SK.TREES, 0));

  // Listen for XP changes from any submodule
  useEffect(() => {
    const handler = (e: Event) => setXpState((e as CustomEvent<number>).detail);
    window.addEventListener('cl_xp', handler);
    return () => window.removeEventListener('cl_xp', handler);
  }, []);

  useEffect(() => subscribeLocalNumber(LOCAL_NUMBER_KEYS.trees, 0, setTrees), []);

  const handleXPChange = useCallback((next: number) => {
    const v = Math.max(0, next);
    emitXP(v);
    setXpState(v);
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto pb-10 space-y-5">
      {/* HUD */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full px-4 py-2 shadow-md border-2 border-yellow-300">
          <Zap size={14} className="text-white" />
          <span className="text-white font-black text-sm">{xp.toLocaleString()} 能量</span>
        </div>
        <div className="flex items-center gap-2 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full px-4 py-2 shadow-md border-2 border-emerald-300">
          <span className="text-base">🌲</span>
          <span className="text-white font-black text-sm">{trees} 棵植物</span>
        </div>
        <p className="ml-auto text-xs text-brand-gray/40 font-medium hidden sm:flex items-center gap-1">
          <Sparkles size={11} /> 你的私人充电小站
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-[300px]">
        {/* Salary — 2/3 wide */}
        <div className="lg:col-span-2">
          <SalaryMonitor />
        </div>
        {/* Pet */}
        <div>
          <PetModule xp={xp} onXPChange={handleXPChange} />
        </div>
        {/* Focus — 2/3 wide */}
        <div className="lg:col-span-2">
          <FocusTimer xp={xp} onXPChange={handleXPChange} />
        </div>
        {/* Oracle */}
        <div>
          <DailyOracle />
        </div>
        {/* Todo — 1/2 wide */}
        <div style={{ height: '320px' }}>
          <TodayTodo />
        </div>
        {/* Food — 1/4 wide (fits in 1 col) */}
        <div style={{ height: '320px' }}>
          <FoodSelector />
        </div>
        {/* Gossip — full width */}
        <div className="md:col-span-2 lg:col-span-3" style={{ height: '320px' }}>
          <GossipBoard />
        </div>
      </div>
    </div>
  );
}
