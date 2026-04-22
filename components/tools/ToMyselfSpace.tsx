import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { LOCAL_NUMBER_KEYS, incrementLocalNumber, readLocalNumber, writeLocalNumber } from '../../lib/localSignals';
import { getBestToken } from '../../src/services/authService';
import { useToast } from '../../src/components/common/Toast';
import { dispatchPetEvent } from '../../lib/petOs';
import {
  Settings, X, Check, Plus, Trash2, RotateCcw,
  Coffee, Sparkles, Timer, Utensils, Play, Square
} from 'lucide-react';

// ─── Storage helpers ──────────────────────────────────────────────────────────
const SK = {
  SALARY:     'cl_monthly_salary',
  WORK_START: 'cl_work_start',
  WORK_END:   'cl_work_end',
  XP:         'cl_hacker_xp',
  TREES:      'cl_hacker_trees',
  TODOS:      'cl_today_todos',
} as const;

const TOOL_DATA_API_ROOT = (
  import.meta.env.VITE_API_BASE_URL ||
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : '')
).replace(/\/$/, '') + '/api/v1';

async function createArtifactRecord(input: {
  toolId: string;
  title: string;
  content: string;
  metadata?: Record<string, unknown>;
}) {
  const token = getBestToken();
  if (!token) return { ok: false as const, reason: 'unauthenticated' as const };

  try {
    const response = await fetch(`${TOOL_DATA_API_ROOT}/artifacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        return { ok: false as const, reason: 'unauthenticated' as const };
      }
      return { ok: false as const, reason: 'request_failed' as const };
    }

    incrementLocalNumber(LOCAL_NUMBER_KEYS.artifactSavedSignal, 0);
    return { ok: true as const };
  } catch {
    return { ok: false as const, reason: 'network_error' as const };
  }
}

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

function emitXP(next: number) {
  writeLocalNumber(LOCAL_NUMBER_KEYS.xp, next);
  window.dispatchEvent(new CustomEvent('cl_xp', { detail: next }));
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
  const workTotal  = endMin - startMin;
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
  const otSec       = isOvertime ? (currMin - endMin) * 60 + currSec : 0;

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
    <div className="bg-brand-dark rounded-[24px] p-6 flex flex-col h-full relative overflow-hidden shadow-sm">
      <div className="flex items-start justify-between mb-8 relative z-10">
        <div>
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.15em] mb-2">高效下班系统</p>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              {!isBefore && !isOvertime && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-40"></span>}
              <span className={cn("relative inline-flex rounded-full h-2 w-2", isOvertime ? "bg-red-400" : isBefore ? "bg-white/20" : "bg-emerald-400")}></span>
            </span>
            <span className="text-xs font-bold text-white/70">
              {isOvertime ? '已进入免费加班时段' : isBefore ? '尚未进入工作时段' : '正在工作时段中'}
            </span>
          </div>
        </div>
        <button onClick={openSettings} className="p-2 -mr-2 text-white/30 hover:text-white/80 transition-colors rounded-full hover:bg-white/5">
          <Settings size={14} />
        </button>
      </div>

      <AnimatePresence>
        {showSettings && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            className="absolute inset-x-5 top-[4.5rem] bg-[#111827] border border-white/12 rounded-2xl p-4 z-30 shadow-2xl">
            <div className="flex justify-between mb-3">
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">设置</p>
              <button onClick={() => setShowSettings(false)} className="text-white/30 hover:text-white transition-colors"><X size={14} /></button>
            </div>
            <div className="space-y-2 mb-3">
              <div>
                <label className="text-[10px] text-white/40 font-bold block mb-1">月薪 (元)</label>
                <input type="number" value={draft.salary} onChange={e => setDraft(d => ({ ...d, salary: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 text-white text-xs font-bold rounded-xl px-3 py-2 outline-none focus:border-white/30" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-white/40 font-bold block mb-1">上班</label>
                  <input type="time" value={draft.start} onChange={e => setDraft(d => ({ ...d, start: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 text-white text-xs font-bold rounded-xl px-3 py-2 outline-none focus:border-white/30" />
                </div>
                <div>
                  <label className="text-[10px] text-white/40 font-bold block mb-1">下班</label>
                  <input type="time" value={draft.end} onChange={e => setDraft(d => ({ ...d, end: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 text-white text-xs font-bold rounded-xl px-3 py-2 outline-none focus:border-white/30" />
                </div>
              </div>
            </div>
            <button onClick={saveSettings} className="w-full py-2.5 bg-white text-brand-dark text-xs font-bold rounded-xl hover:bg-white/90 transition-all">保存</button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 mb-8">
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-medium text-white/50">¥</span>
          <motion.p key={Math.floor(earned * 10)} initial={{ opacity: .8 }} animate={{ opacity: 1 }} className="text-5xl md:text-6xl font-black text-white tabular-nums tracking-tighter" style={{ fontFamily: 'ui-monospace, SFMono-Regular, monospace' }}>
            {earned.toFixed(2)}
          </motion.p>
        </div>
        <p className="text-[11px] text-white/50 mt-3 font-medium flex gap-3">
          <span>时薪 ¥{hourlyRate.toFixed(1)}</span>
          <span className="text-white/20">|</span>
          <span>分薪 ¥{minuteRate.toFixed(3)}</span>
        </p>
      </div>

      <div className="relative z-10 mb-8">
        <div className="flex justify-between text-[11px] font-bold mb-2 text-white/40">
          <span>{workStart}</span>
          <span className={cn(isOvertime ? 'text-red-400/80' : isBefore ? 'text-white/20' : 'text-white/80')}>
            {isOvertime ? `已加班 ${Math.floor(otSec / 3600)}h ${Math.floor((otSec % 3600) / 60)}m` : isBefore ? '等待开工' : `距下班 ${remH > 0 ? remH + 'h ' : ''}${remM}m`}
          </span>
          <span>{workEnd}</span>
        </div>
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div className={cn('h-full rounded-full transition-colors duration-500', isOvertime ? 'bg-red-400' : 'bg-white')} initial={{ width: 0 }} animate={{ width: `${Math.min(progress, 100)}%` }} transition={{ duration: 1, ease: 'easeOut' }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-auto relative z-10">
        <div className="bg-white/5 rounded-2xl p-4 flex flex-col justify-center">
          <p className="text-[10px] text-white/40 font-bold mb-1 tracking-[0.15em] uppercase">月薪</p>
          <p className="text-lg font-black text-white tabular-nums">¥{salary.toLocaleString()}</p>
        </div>
        <div className="bg-white/5 rounded-2xl p-4 flex flex-col justify-center">
          <p className="text-[10px] text-white/40 font-bold mb-1 tracking-[0.15em] uppercase">年薪估算</p>
          <p className="text-lg font-black text-white tabular-nums">¥{(salary * 12 / 10000).toFixed(1)}<span className="text-xs text-white/50 ml-1">万</span></p>
        </div>
      </div>
    </div>
  );
};

// ─── MODULE 2 · Focus Timer ────────────────────────────────────────────────────
const FocusTimer: React.FC = () => {
  const WORK_SECS  = 25 * 60;
  const BREAK_SECS = 5  * 60;

  const [phase,        setPhase]        = useState<'work' | 'break'>('work');
  const [timeLeft,     setTimeLeft]     = useState(WORK_SECS);
  const [isActive,     setIsActive]     = useState(false);
  const [sessions,     setSessions]     = useState(() => loadNum(SK.TREES, 0));
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completionHandledRef = useRef(false);
  const toast = useToast();

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      completionHandledRef.current = false;
      timerRef.current = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0 && isActive) {
      if (completionHandledRef.current) {
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
      }
      completionHandledRef.current = true;
      clearInterval(timerRef.current!);
      setIsActive(false);

      if (phase === 'work') {
        const next = sessions + 1;
        setSessions(next);
        writeLocalNumber(LOCAL_NUMBER_KEYS.trees, next);
        const xp = readLocalNumber(LOCAL_NUMBER_KEYS.xp, 0);
        emitXP(xp + 50);

        void createArtifactRecord({
          toolId: 'to-myself-focus-timer',
          title: `专注完成记录 #${next}`,
          content: `完成 1 次 25 分钟专注，获得 50 能量，累计专注 ${next} 次。`,
          metadata: { phase: 'work', durationSeconds: WORK_SECS, rewardXp: 50, totalSessions: next, completedAt: new Date().toISOString() },
        }).then((result) => {
          if (!result.ok && result.reason !== 'unauthenticated') {
            toast.warning('专注记录同步失败');
          } else {
             toast.success('🎉 专注完成！已发放 XP。');
          }
        });
        setTimeout(() => { setPhase('break'); setTimeLeft(BREAK_SECS); }, 1500);
      } else {
        setTimeout(() => { setPhase('work'); setTimeLeft(WORK_SECS); }, 1500);
      }
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isActive, timeLeft, phase, sessions, toast]);

  const reset = () => {
    completionHandledRef.current = false;
    setIsActive(false);
    setTimeLeft(phase === 'work' ? WORK_SECS : BREAK_SECS);
  };
  
  const total = phase === 'work' ? WORK_SECS : BREAK_SECS;
  const prog  = ((total - timeLeft) / total) * 100;
  const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const s = (timeLeft % 60).toString().padStart(2, '0');
  const isBreak    = phase === 'break';
  const circumf    = 2 * Math.PI * 54;

  return (
    <div className="bg-white rounded-[24px] border border-brand-border/10 p-6 flex flex-col h-full shadow-sm relative overflow-hidden transition-colors duration-500">
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col gap-1">
          <p className="text-[10px] font-bold text-brand-gray/50 uppercase tracking-[0.15em]">Focus</p>
          <span className="text-xs font-bold text-brand-dark flex items-center gap-1.5">
            {isBreak ? '休息时间' : '专注时段'}
            <span className="text-brand-gray/30 font-normal">|</span>
            <span className="text-brand-gray">Session {sessions + 1}</span>
          </span>
        </div>
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-offwhite">
          <Timer size={13} className="text-brand-gray" />
        </div>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center">
        <div className="relative w-32 h-32 mb-8">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" className="text-brand-offwhite" strokeWidth="4" />
            <motion.circle
              cx="60" cy="60" r="54" fill="none"
              stroke="currentColor" className={isBreak ? "text-brand-gray" : "text-brand-dark"} strokeWidth="5" strokeLinecap="round"
              strokeDasharray={circumf}
              strokeDashoffset={circumf * (1 - prog / 100)}
              transition={{ duration: 0.5 }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className={cn('text-3xl font-black tabular-nums tracking-tighter', isBreak ? 'text-brand-gray' : 'text-brand-dark')} style={{ fontFamily: 'ui-monospace, SFMono-Regular, monospace' }}>
              {m}:{s}
            </p>
          </div>
        </div>

        <div className="flex gap-2 w-full max-w-[220px]">
          <motion.button whileTap={{ scale: 0.96 }} onClick={() => setIsActive(a => !a)}
            className={cn(
              'flex-grow py-3 rounded-2xl text-xs font-bold transition-all flex justify-center items-center gap-2 shadow-sm',
              isActive ? 'bg-brand-offwhite text-brand-dark hover:bg-brand-border/10 border border-brand-border/10' : 'bg-brand-dark text-white border border-brand-dark'
            )}>
            {isActive ? <Square size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}
            {isActive ? '暂停' : isBreak ? '开始休息' : '开始专注'}
          </motion.button>
          <motion.button whileTap={{ scale: 0.96 }} onClick={reset} className="w-12 rounded-2xl flex items-center justify-center bg-brand-offwhite border border-brand-border/10 text-brand-gray hover:bg-brand-border/20 transition-colors">
            <RotateCcw size={14} />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

// ─── MODULE 3 · Today Todo ─────────────────────────────────────────────────────
interface TodoItem { id: number; text: string; done: boolean }

const TodayTodo: React.FC = () => {
  const todayKey = `${SK.TODOS}_${new Date().toDateString()}`;
  const [todos, setTodos] = useState<TodoItem[]>(() => loadJSON(todayKey, []));
  const [input, setInput] = useState('');
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
    <div className="bg-white rounded-[24px] border border-brand-border/10 shadow-sm p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col gap-1">
          <p className="text-[10px] font-bold text-brand-gray/50 uppercase tracking-[0.15em]">To Do List</p>
          <p className="text-xs font-bold text-brand-dark">
            {doneCount}/{todos.length} <span className="text-brand-gray font-normal ml-0.5">Tasks Done</span>
          </p>
        </div>
        {todos.length > 0 && doneCount === todos.length && (
           <div className="w-8 h-8 rounded-full bg-brand-dark text-white flex items-center justify-center">
             <Check size={12} strokeWidth={3} />
           </div>
        )}
      </div>

      {todos.length > 0 && (
        <div className="w-full h-1 bg-brand-offwhite rounded-full mb-5 overflow-hidden">
          <motion.div className="h-full bg-brand-dark rounded-full" animate={{ width: `${(doneCount / todos.length) * 100}%` }} transition={{ duration: 0.4 }} />
        </div>
      )}

      <div className="flex-grow overflow-y-auto space-y-1 mb-4 pr-1 scrollbar-hide" style={{ maxHeight: '160px' }}>
        <AnimatePresence initial={false}>
          {todos.length === 0 && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-[11px] text-brand-gray/40 font-medium py-8">
              当前没有待办事项
            </motion.p>
          )}
          {todos.map(todo => (
            <motion.div key={todo.id} layout initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
              className="flex items-center gap-3 group p-2.5 rounded-2xl hover:bg-brand-offwhite transition-colors">
              <button onClick={() => toggle(todo.id)} className={cn('w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-all', todo.done ? 'bg-brand-dark border-brand-dark' : 'border-brand-border/20 hover:border-brand-dark/50')}>
                {todo.done && <Check size={11} className="text-white" strokeWidth={3} />}
              </button>
              <span className={cn('flex-grow text-xs font-medium leading-snug transition-colors', todo.done ? 'line-through text-brand-gray/40' : 'text-brand-dark')}>
                {todo.text}
              </span>
              <button onClick={() => remove(todo.id)} className="opacity-0 group-hover:opacity-100 text-brand-gray hover:text-red-500 transition-all p-1">
                <Trash2 size={12} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="flex gap-2">
        <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()}
          placeholder="添加任务..."
          className="flex-grow bg-brand-offwhite border border-brand-border/10 text-brand-dark placeholder-brand-gray/40 px-4 py-3 rounded-2xl text-xs font-medium outline-none focus:border-brand-dark/20 transition-colors" />
        <button onClick={add} className="w-11 h-11 bg-brand-dark text-white rounded-2xl flex items-center justify-center hover:bg-brand-dark/90 transition-all active:scale-95 shadow-sm shrink-0">
          <Plus size={16} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
};

// ─── MODULE 4 · Food Selector ─────────────────────────────────────────────────
const FoodSelector: React.FC = () => {
  const FOODS = [
    { emoji: '🍔', item: '麦当劳 1+1' }, { emoji: '🍗', item: 'KFC 疯狂四' },
    { emoji: '🍚', item: '猪脚饭' },    { emoji: '🍜', item: '兰州拉面' },
    { emoji: '🥗', item: '鸡胸沙拉' },  { emoji: '🌶️', item: '麻辣烫' },
    { emoji: '🍱', item: '台式卤肉饭' }, { emoji: '🍝', item: '意大利面' },
    { emoji: '🥙', item: '全麦三明治' }, { emoji: '🍲', item: '螺蛳粉' },
  ];

  const [idx, setIdx] = useState<number | null>(null);
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
    <div className="bg-white rounded-[24px] border border-brand-border/10 shadow-sm p-6 flex flex-col h-full min-h-[300px]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col gap-1">
          <p className="text-[10px] font-bold text-brand-gray/50 uppercase tracking-[0.15em]">Food Selector</p>
          <span className="text-xs font-bold text-brand-dark">今天吃什么</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-brand-offwhite flex items-center justify-center">
          <Utensils size={13} className="text-brand-gray" />
        </div>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center gap-6">
        <div className="w-20 h-20 bg-brand-offwhite border border-brand-border/10 rounded-[24px] flex items-center justify-center overflow-hidden">
          <span className={cn('text-3xl transition-all duration-75', isRolling && 'scale-95 opacity-50 blur-[1px]')}>
            {current.emoji}
          </span>
        </div>
        
        <div className="h-8 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {!isRolling && idx !== null && (
              <motion.p key={idx} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-sm font-black text-brand-dark">
                {FOODS[idx].item}
              </motion.p>
            )}
          </AnimatePresence>
          {(idx === null && !isRolling) && (
            <p className="text-[11px] font-bold text-brand-gray/50 tracking-wider">听天由命</p>
          )}
        </div>
      </div>

      <motion.button whileTap={{ scale: 0.96 }} onClick={roll} disabled={isRolling} 
        className="mt-6 w-full py-3.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 bg-brand-dark text-white shadow-sm disabled:opacity-50">
        {isRolling ? <Sparkles size={13} className="animate-spin" /> : <Square size={11} className="rotate-45" fill="currentColor" />}
        {isRolling ? '随机中...' : idx !== null ? '重新随机' : '抽取结果'}
      </motion.button>
    </div>
  );
};

// ─── MODULE 5 · Paid Poop Monitor ─────────────────────────────────────────────
const PaidPoopMonitor: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [salary] = useState(() => loadNum(SK.SALARY, 8000));
  const hourlyRate = (salary / 22) / 8; 
  const earned = (seconds / 3600) * hourlyRate;
  const toast = useToast();

  useEffect(() => {
    let interval: any;
    if (isActive) {
      interval = setInterval(() => setSeconds(s => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTouchFish = () => {
    incrementLocalNumber(LOCAL_NUMBER_KEYS.touchFishCounter, 0);
    void dispatchPetEvent('touch_fish');
    toast.success('已摸鱼');
  };

  const handleDrinkCoffee = () => {
    incrementLocalNumber(LOCAL_NUMBER_KEYS.coffeeCounter, 0);
    void dispatchPetEvent('drink_coffee');
    toast.success('已喝咖啡');
  };

  return (
    <div className="bg-white rounded-[24px] border border-brand-border/10 shadow-sm p-6 flex flex-col h-full min-h-[300px] relative">
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col gap-1">
          <p className="text-[10px] font-bold text-brand-gray/50 uppercase tracking-[0.15em]">Paid Time</p>
          <span className="text-xs font-bold text-brand-dark">带薪拉屎</span>
        </div>
        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center transition-colors", isActive ? "bg-brand-dark text-white" : "bg-brand-offwhite text-brand-gray")}>
          <Coffee size={13} />
        </div>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center gap-1">
        <div className="text-4xl font-black text-brand-dark tabular-nums tracking-tighter" style={{ fontFamily: 'ui-monospace, SFMono-Regular, monospace' }}>
          {formatTime(seconds)}
        </div>
        <div className="mt-3 flex items-baseline gap-1 text-xs font-bold text-brand-gray/60">
          <span>当前摸鱼差价提取</span>
          <span className="text-sm font-black text-brand-dark ml-1 tracking-tight">¥{earned.toFixed(3)}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleTouchFish}
          className="rounded-2xl border border-brand-border/10 bg-brand-offwhite px-3 py-3 text-xs font-bold text-brand-dark transition-colors hover:bg-brand-border/10"
        >
          摸鱼
        </button>
        <button
          onClick={handleDrinkCoffee}
          className="rounded-2xl border border-brand-border/10 bg-brand-offwhite px-3 py-3 text-xs font-bold text-brand-dark transition-colors hover:bg-brand-border/10"
        >
          喝咖啡
        </button>
      </div>

      <motion.button whileTap={{ scale: 0.96 }} onClick={() => setIsActive(!isActive)}
        className={cn(
          "mt-6 w-full py-3.5 rounded-2xl text-xs font-bold transition-all shadow-sm flex justify-center items-center border",
          isActive ? "bg-brand-offwhite hover:bg-brand-border/10 text-brand-dark border-brand-border/10" : "bg-brand-dark text-white border-brand-dark"
        )}>
        {isActive ? "结算并返回工位" : "开始带薪拉屎"}
      </motion.button>
    </div>
  );
};

// ─── MAIN: ToMyselfSpace ──────────────────────────────────────────────────────
export default function ToMyselfSpace() {
  return (
    <div className="w-full max-w-full mx-auto pb-10 overflow-x-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 auto-rows-max">
        <div className="md:col-span-2 lg:col-span-2 min-h-[320px]">
          <SalaryMonitor />
        </div>
        <div className="min-h-[320px]">
          <FocusTimer />
        </div>
        <div className="min-h-[320px]">
          <TodayTodo />
        </div>
        <div className="min-h-[320px]">
          <FoodSelector />
        </div>
        <div className="min-h-[320px]">
          <PaidPoopMonitor />
        </div>
      </div>
    </div>
  );
}
