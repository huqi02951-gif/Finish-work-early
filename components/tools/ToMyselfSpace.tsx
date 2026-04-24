import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { LOCAL_NUMBER_KEYS, incrementLocalNumber, readLocalNumber, writeLocalNumber } from '../../lib/localSignals';
import { getBestToken } from '../../src/services/authService';
import { useToast } from '../../src/components/common/Toast';
import { dispatchPetEvent } from '../../lib/petOs';
import {
  todayTodoStore,
  useTodayTodos,
  type TodoUrgency,
} from '../../lib/todayTodoStore';
import { earnLossStore } from '../../lib/earnLossStore';
import {
  Settings, X, Check, Plus, Trash2,
  Coffee, Sparkles, Timer, Utensils, Play, Square,
  Fish, Timer as TimerIcon,
  AlertTriangle, Clock, Briefcase, RefreshCw, ThumbsDown,
} from 'lucide-react';

// ─── Storage helpers ──────────────────────────────────────────────────────────
const SK = {
  SALARY:       'cl_monthly_salary',
  WORK_START:   'cl_work_start',
  WORK_END:     'cl_work_end',
  FOCUS_SESSIONS: 'cl_focus_sessions',
  LAST_FOOD:    'cl_last_food',
  SKIP_FOOD:    'cl_skip_food',
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
  const raw = localStorage.getItem(key);
  const v = Number(raw);
  return raw !== null && !isNaN(v) ? v : fallback;
}

const formatTime = (s: number) => {
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// ─── 打工人分组常量 ────────────────────────────────────────────────────────────
export const TODO_URGENCY_GROUPS = [
  { key: 'urgent' as const,       label: '很着急' },
  { key: 'nobody_cares' as const, label: 'nobody cares' },
  { key: 'not_my_biz' as const,   label: 'none of my business' },
  { key: 'guess_who' as const,    label: 'guess who' },
] as const;

const URGENCY_BADGE_STYLE: Record<TodoUrgency, string> = {
  urgent:       'bg-red-100 text-red-700 border-red-200',
  nobody_cares: 'bg-gray-100 text-gray-500 border-gray-200',
  not_my_biz:   'bg-amber-100 text-amber-700 border-amber-200',
  guess_who:    'bg-purple-100 text-purple-700 border-purple-200',
  unset:        'bg-brand-offwhite text-brand-gray/40 border-brand-border/10',
};

const URGENCY_LABEL: Record<TodoUrgency, string> = {
  urgent:       '很着急',
  nobody_cares: 'nobody cares',
  not_my_biz:   'none of my business',
  guess_who:    'guess who',
  unset:        '未分类',
};

// urgency 分组的 tooltip：增加一点讽刺感
const URGENCY_HINT: Record<TodoUrgency, string> = {
  urgent:       '真着急，还是领导觉得着急？',
  nobody_cares: '心知肚明没人在意，但还是得写',
  not_my_biz:   '不是我的锅，但不得不背',
  guess_who:    '谁安排的，谁清楚',
  unset:        '还没决定',
};

// ─── MODULE 1 · 高效下班系统 ──────────────────────────────────────────────────

const SalaryMonitor: React.FC = () => {
  const [salary, setSalary]       = useState(() => loadNum(SK.SALARY, 6000));
  const [workStart, setWorkStart] = useState(() => localStorage.getItem(SK.WORK_START) || '09:00');
  const [workEnd, setWorkEnd]     = useState(() => localStorage.getItem(SK.WORK_END)   || '17:00');
  const [now, setNow]             = useState(() => new Date());
  const [showSettings, setShowSettings] = useState(false);
  const [draft, setDraft] = useState({ salary: '6000', start: '09:00', end: '17:00' });
  const [summary, setSummary] = useState(() => earnLossStore.getTodaySummary());
  const lastOtRef = useRef(0);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => { writeLocalNumber(LOCAL_NUMBER_KEYS.salary, salary); }, [salary]);

  useEffect(() => {
    setSummary(earnLossStore.getTodaySummary());
    return earnLossStore.subscribe(setSummary);
  }, []);

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

  const workedSec = isBefore ? 0 : isOvertime ? workTotal * 60 : (currMin - startMin) * 60 + currSec;
  const earned    = (dailySal * workedSec) / (workTotal * 60);
  const progress  = isBefore ? 0 : isOvertime ? 100 : (workedSec / (workTotal * 60)) * 100;
  const remainSec = isOvertime ? 0 : (endMin - currMin) * 60 - currSec;
  const remH      = Math.floor(remainSec / 3600);
  const remM      = Math.floor((remainSec % 3600) / 60);
  const otSec     = isOvertime ? (currMin - endMin) * 60 + currSec : 0;
  const otMin     = isOvertime ? Math.floor(otSec / 60) : 0;
  const todayDateKey = now.toDateString();

  useEffect(() => {
    if (!isOvertime) return;
    if (otMin <= lastOtRef.current) return;
    const recorded = earnLossStore.recordOvertimeLoss({ minuteRate, otMinutes: otMin, dateKey: todayDateKey });
    if (recorded) lastOtRef.current = otMin;
  }, [isOvertime, minuteRate, otMin, todayDateKey]);

  useEffect(() => {
    if (otMin === 0) lastOtRef.current = 0;
  }, [otMin, todayDateKey]);

  // ─── 4-state verdict ───────────────────────────────────────────────────────
  type VerdictState = 'before' | 'working' | 'go_now' | 'overtime';
  const verdictState: VerdictState =
    isBefore ? 'before' :
    isOvertime && otMin <= 5 ? 'go_now' :
    isOvertime ? 'overtime' :
    'working';

  const VERDICT = {
    before: {
      label: '还没开工',
      hint:  `${workStart} 才开始，先歇着吧`,
      icon:  <Clock size={14} />,
      color: 'text-white/60',
    },
    working: {
      label: remainSec <= 3600
        ? `还差 ${remM}m，准备收拾包`
        : `还差 ${remH > 0 ? remH + 'h ' : ''}${remM}m，继续熬`,
      hint: `到 ${workEnd} 准点走人，一秒都不多留`,
      icon:  <Briefcase size={14} />,
      color: 'text-white',
    },
    go_now: {
      label: '到点了，快跑',
      hint:  `已过 ${workEnd}，你还在干嘛`,
      icon:  <Check size={14} />,
      color: 'text-emerald-300',
    },
    overtime: {
      label: `已免费打工 ${otMin} 分钟`,
      hint:  '你的时间值钱，但你不在乎',
      icon:  <AlertTriangle size={14} />,
      color: 'text-red-400',
    },
  }[verdictState];

  const statusText =
    verdictState === 'before'   ? '尚未开工' :
    verdictState === 'overtime' ? '免费加班进行中' :
    verdictState === 'go_now'   ? '到点，走人' :
    '正在工作时段中';

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
              {verdictState === 'working' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-40"></span>}
              <span className={cn('relative inline-flex rounded-full h-2 w-2',
                verdictState === 'overtime' ? 'bg-red-400' :
                verdictState === 'go_now'   ? 'bg-emerald-400' :
                verdictState === 'before'   ? 'bg-white/20' :
                'bg-emerald-400'
              )}></span>
            </span>
            <span className="text-xs font-bold text-white/70">{statusText}</span>
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

      {/* 实时薪资 */}
      <div className="relative z-10 mb-8">
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-medium text-white/50">¥</span>
          <motion.p key={Math.floor(earned * 10)} initial={{ opacity: .8 }} animate={{ opacity: 1 }}
            className="text-5xl md:text-6xl font-black text-white tabular-nums tracking-tighter"
            style={{ fontFamily: 'ui-monospace, SFMono-Regular, monospace' }}>
            {earned.toFixed(2)}
          </motion.p>
        </div>
        <p className="text-[11px] text-white/50 mt-3 font-medium flex gap-3">
          <span>时薪 ¥{hourlyRate.toFixed(1)}</span>
          <span className="text-white/20">|</span>
          <span>分薪 ¥{minuteRate.toFixed(3)}</span>
        </p>
      </div>

      {/* 时间进度条 */}
      <div className="relative z-10 mb-8">
        <div className="flex justify-between text-[11px] font-bold mb-2 text-white/40">
          <span>{workStart}</span>
          <span className={cn(
            isOvertime ? 'text-red-400/80' :
            isBefore   ? 'text-white/20' :
            remainSec <= 3600 ? 'text-amber-300/80' : 'text-white/80'
          )}>
            {isOvertime ? `免费加班 ${otMin}m` : isBefore ? '等待开工' : `距下班 ${remH > 0 ? remH + 'h ' : ''}${remM}m`}
          </span>
          <span>{workEnd}</span>
        </div>
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className={cn('h-full rounded-full transition-colors duration-500',
              isOvertime ? 'bg-red-400' :
              remainSec <= 3600 ? 'bg-amber-300' : 'bg-white'
            )}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progress, 100)}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* 今日账单 */}
      <div className={cn(
        'relative z-10 mb-5 rounded-2xl p-4 border transition-colors',
        verdictState === 'overtime' ? 'bg-red-500/10 border-red-400/30' : 'bg-white/5 border-white/10'
      )}>
        <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.15em] mb-3">今日账单</p>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-white/5 px-3 py-3">
            <p className="text-[9px] text-emerald-400/60 font-bold uppercase">今日赚钱</p>
            <p className="mt-1 text-lg font-black text-emerald-300 tabular-nums">¥{summary.earnTotal.toFixed(2)}</p>
          </div>
          <div className="rounded-xl bg-white/5 px-3 py-3">
            <p className="text-[9px] text-red-400/60 font-bold uppercase">今日亏钱</p>
            <p className="mt-1 text-lg font-black text-red-400 tabular-nums">¥{summary.lossTotal.toFixed(2)}</p>
          </div>
          <div className="rounded-xl bg-white/5 px-3 py-3">
            <p className="text-[9px] text-amber-300/70 font-bold uppercase">加班白干</p>
            <p className="mt-1 text-lg font-black text-amber-200 tabular-nums">¥{summary.overtimeLossTotal.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* 下班判断 */}
      <div className={cn(
        'relative z-10 rounded-2xl p-4 border transition-colors',
        verdictState === 'go_now'   ? 'bg-emerald-400/10 border-emerald-400/30' :
        verdictState === 'overtime' ? 'bg-red-400/10 border-red-400/30' :
        'bg-white/5 border-white/10'
      )}>
        <div className="flex items-center justify-between mb-1">
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.15em]">今天能不能走</p>
          <span className="text-[10px] font-bold text-white/30">
            {verdictState === 'overtime' || verdictState === 'go_now' ? `已过 ${workEnd}` : `等到 ${workEnd}`}
          </span>
        </div>
        <p className={cn('text-base font-black tracking-tight flex items-center gap-2', VERDICT.color)}>
          {VERDICT.icon}
          {VERDICT.label}
        </p>
        <p className="text-[11px] text-white/40 mt-1 font-medium">{VERDICT.hint}</p>
      </div>
    </div>
  );
};

// ─── MODULE 2 · Focus Timer ────────────────────────────────────────────────────
const FOCUS_DURATIONS = [25, 45, 60] as const;
type FocusDuration = (typeof FOCUS_DURATIONS)[number];

const FocusTimer: React.FC = () => {
  const todos = useTodayTodos();
  const undone = useMemo(() => todos.filter(t => !t.done), [todos]);

  const [durationMin, setDurationMin] = useState<FocusDuration>(25);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessions, setSessions] = useState(() => loadNum(SK.FOCUS_SESSIONS, 0));
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completionHandledRef = useRef(false);
  const toast = useToast();

  useEffect(() => {
    if (!isActive) setTimeLeft(durationMin * 60);
  }, [durationMin, isActive]);

  useEffect(() => {
    if (selectedTaskId !== null && !undone.some(t => t.id === selectedTaskId)) {
      setSelectedTaskId(null);
      if (isActive) {
        if (timerRef.current) clearInterval(timerRef.current);
        setIsActive(false);
        setTimeLeft(durationMin * 60);
      }
    }
  }, [undone, selectedTaskId, isActive, durationMin]);

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

      const taskId = selectedTaskId;
      const task = taskId != null ? todos.find(t => t.id === taskId) : null;
      if (taskId != null) todayTodoStore.markDone(taskId);

      const next = sessions + 1;
      setSessions(next);
      localStorage.setItem(SK.FOCUS_SESSIONS, String(next));

      void createArtifactRecord({
        toolId: 'to-myself-focus-timer',
        title: `专注完成记录 #${next}`,
        content: `完成 1 次 ${durationMin} 分钟专注${task ? `（任务：${task.text}）` : ''}，累计专注 ${next} 次。`,
        metadata: {
          durationSeconds: durationMin * 60,
          totalSessions: next,
          taskId,
          taskText: task?.text ?? null,
          completedAt: new Date().toISOString(),
        },
      }).then((result) => {
        if (!result.ok && result.reason !== 'unauthenticated') {
          toast.warning('专注记录同步失败');
        } else {
          toast.success(task ? `专注完成！已勾掉「${task.text}」` : '专注完成！');
        }
      });

      setSelectedTaskId(null);
      setTimeout(() => setTimeLeft(durationMin * 60), 1200);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isActive, timeLeft, selectedTaskId, sessions, durationMin, toast, todos]);

  const start = () => {
    if (timeLeft === 0) setTimeLeft(durationMin * 60);
    setIsActive(true);
  };

  const abort = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    completionHandledRef.current = false;
    setIsActive(false);
    setTimeLeft(durationMin * 60);
  };

  const total  = durationMin * 60;
  const prog   = ((total - timeLeft) / total) * 100;
  const m      = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const s      = (timeLeft % 60).toString().padStart(2, '0');
  const circumf = 2 * Math.PI * 54;

  const selectedTask = selectedTaskId != null ? todos.find(t => t.id === selectedTaskId) ?? null : null;

  return (
    <div className="bg-white rounded-[24px] border border-brand-border/10 p-6 flex flex-col h-full shadow-sm relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col gap-1">
          <p className="text-[10px] font-bold text-brand-gray/50 uppercase tracking-[0.15em]">Focus</p>
          <span className="text-xs font-bold text-brand-dark flex items-center gap-1.5">
            {isActive ? '专注进行中' : '选任务或直接开始'}
            <span className="text-brand-gray/30 font-normal">|</span>
            <span className="text-brand-gray">Session {sessions + 1}</span>
          </span>
        </div>
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-offwhite">
          <Timer size={13} className="text-brand-gray" />
        </div>
      </div>

      <div className="mb-3">
        {isActive ? (
          <div className="w-full bg-brand-offwhite border border-brand-border/10 rounded-xl px-3 py-2 text-[11px] font-bold text-brand-dark truncate">
            {selectedTask ? `专注：${selectedTask.text}` : '自由专注'}
          </div>
        ) : undone.length === 0 ? (
          <div className="w-full bg-brand-offwhite border border-brand-border/10 rounded-xl px-3 py-2 text-[11px] font-medium text-brand-gray/60">
            没有任务，直接开始也行
          </div>
        ) : (
          <select
            value={selectedTaskId ?? ''}
            onChange={e => setSelectedTaskId(e.target.value ? Number(e.target.value) : null)}
            className="w-full bg-brand-offwhite border border-brand-border/10 text-brand-dark text-[11px] font-bold rounded-xl px-3 py-2 outline-none focus:border-brand-dark/30"
          >
            <option value="">不绑定任务，直接专注</option>
            {undone.map(t => (
              <option key={t.id} value={t.id}>{`[${URGENCY_LABEL[t.urgency]}] ${t.text}`}</option>
            ))}
          </select>
        )}
      </div>

      <div className="flex gap-1.5 mb-4">
        {FOCUS_DURATIONS.map(d => (
          <button key={d} disabled={isActive} onClick={() => setDurationMin(d)}
            className={cn(
              'flex-1 py-1.5 rounded-xl text-[11px] font-bold border transition-colors',
              durationMin === d ? 'bg-brand-dark text-white border-brand-dark' : 'bg-brand-offwhite text-brand-gray border-brand-border/10 hover:text-brand-dark',
              isActive && 'opacity-40 cursor-not-allowed',
            )}>
            {d}m
          </button>
        ))}
      </div>

      <div className="flex-grow flex flex-col items-center justify-center">
        <div className="relative w-28 h-28 mb-6">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" className="text-brand-offwhite" strokeWidth="4" />
            <motion.circle
              cx="60" cy="60" r="54" fill="none"
              stroke="currentColor" className="text-brand-dark" strokeWidth="5" strokeLinecap="round"
              strokeDasharray={circumf}
              strokeDashoffset={circumf * (1 - prog / 100)}
              transition={{ duration: 0.5 }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-3xl font-black tabular-nums tracking-tighter text-brand-dark" style={{ fontFamily: 'ui-monospace, SFMono-Regular, monospace' }}>
              {m}:{s}
            </p>
          </div>
        </div>

        <div className="flex gap-2 w-full max-w-[220px]">
          <motion.button whileTap={{ scale: 0.96 }} onClick={isActive ? abort : start}
            className={cn(
              'flex-grow py-3 rounded-2xl text-xs font-bold transition-all flex justify-center items-center gap-2 shadow-sm border',
              isActive
                ? 'bg-brand-offwhite text-brand-dark hover:bg-brand-border/10 border-brand-border/10'
                : 'bg-brand-dark text-white border-brand-dark',
            )}>
            {isActive ? <Square size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}
            {isActive ? '放弃' : '开始专注'}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

// ─── MODULE 3 · Today Todo ────────────────────────────────────────────────────

const TodayTodo: React.FC = () => {
  const todos = useTodayTodos();
  const [input, setInput] = useState('');
  const [selectedUrgency, setSelectedUrgency] = useState<TodoUrgency>('urgent');
  const inputRef = useRef<HTMLInputElement>(null);

  const add = () => {
    const text = input.trim();
    if (!text) return;
    todayTodoStore.add(text, selectedUrgency);
    setInput('');
    inputRef.current?.focus();
  };

  const toggle = (id: number) => todayTodoStore.toggle(id);
  const remove = (id: number) => todayTodoStore.remove(id);
  const cycleUrgency = (id: number, current: TodoUrgency) => {
    const order: TodoUrgency[] = ['unset', 'urgent', 'nobody_cares', 'not_my_biz', 'guess_who'];
    const idx = order.indexOf(current);
    todayTodoStore.setUrgency(id, order[(idx + 1) % order.length]);
  };

  const doneCount = todos.filter(t => t.done).length;
  const undone = todos.filter(t => !t.done);
  const done = todos.filter(t => t.done);
  const urgencyOrder: Record<string, number> = { urgent: 0, nobody_cares: 1, not_my_biz: 2, guess_who: 3, unset: 4 };
  const sortedUndone = [...undone].sort((a, b) => {
    const diff = (urgencyOrder[a.urgency] ?? 99) - (urgencyOrder[b.urgency] ?? 99);
    return diff !== 0 ? diff : a.id - b.id;
  });

  const allDone = todos.length > 0 && doneCount === todos.length;

  return (
    <div className="bg-white rounded-[24px] border border-brand-border/10 shadow-sm p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col gap-1">
          <p className="text-[10px] font-bold text-brand-gray/50 uppercase tracking-[0.15em]">To Do List</p>
          <p className="text-xs font-bold text-brand-dark">
            {allDone
              ? <span className="text-emerald-600">全部完成 · 你今天努力了</span>
              : <>{doneCount}/{todos.length} <span className="text-brand-gray font-normal ml-0.5">tasks done</span></>
            }
          </p>
        </div>
        {allDone && (
          <div className="w-8 h-8 rounded-full bg-brand-dark text-white flex items-center justify-center">
            <Check size={12} strokeWidth={3} />
          </div>
        )}
      </div>

      {todos.length > 0 && (
        <div className="w-full h-1 bg-brand-offwhite rounded-full mb-4 overflow-hidden">
          <motion.div className="h-full bg-brand-dark rounded-full" animate={{ width: `${(doneCount / todos.length) * 100}%` }} transition={{ duration: 0.4 }} />
        </div>
      )}

      {/* 分组标签栏 — 只显示有任务的分组 */}
      {undone.length > 0 && (
        <div className="flex gap-1 mb-3 flex-wrap">
          {TODO_URGENCY_GROUPS.map(g => {
            const count = undone.filter(t => t.urgency === g.key).length;
            if (count === 0) return null;
            return (
              <span key={g.key} title={URGENCY_HINT[g.key]} className={cn('px-2 py-0.5 rounded-md text-[9px] font-bold border cursor-help', URGENCY_BADGE_STYLE[g.key as TodoUrgency])}>
                {g.label} ({count})
              </span>
            );
          })}
        </div>
      )}

      <div className="flex-grow overflow-y-auto space-y-1 mb-4 pr-1 scrollbar-hide" style={{ maxHeight: '160px' }}>
        <AnimatePresence initial={false}>
          {todos.length === 0 && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center text-[11px] text-brand-gray/40 font-medium py-8">
              今天有什么事要做？<br />
              <span className="text-[10px] text-brand-gray/30">加进来，然后分类 — 很着急还是 nobody cares</span>
            </motion.p>
          )}

          {sortedUndone.map(todo => (
            <motion.div key={todo.id} layout initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
              className="flex items-center gap-3 group p-2.5 rounded-2xl hover:bg-brand-offwhite transition-colors">
              <button onClick={() => toggle(todo.id)}
                className="w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-all border-brand-border/20 hover:border-brand-dark/50">
                {todo.done && <Check size={11} className="text-white" strokeWidth={3} />}
              </button>
              <span className="flex-grow min-w-0 text-xs font-medium text-brand-dark leading-snug block truncate">
                {todo.text}
              </span>
              <button
                onClick={() => cycleUrgency(todo.id, todo.urgency as TodoUrgency)}
                title={URGENCY_HINT[(todo.urgency as TodoUrgency) ?? 'unset']}
                className={cn(
                  'shrink-0 px-1.5 py-0.5 rounded-md text-[8px] font-bold border transition-colors',
                  URGENCY_BADGE_STYLE[(todo.urgency as TodoUrgency) ?? 'unset']
                )}>
                {URGENCY_LABEL[(todo.urgency as TodoUrgency) ?? 'unset']}
              </button>
              <button onClick={() => remove(todo.id)} className="opacity-0 group-hover:opacity-100 text-brand-gray hover:text-red-500 transition-all p-1">
                <Trash2 size={12} />
              </button>
            </motion.div>
          ))}

          {done.length > 0 && sortedUndone.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 py-1">
              <div className="flex-grow h-px bg-brand-border/30" />
              <span className="text-[9px] text-brand-gray/30 font-bold">已完成</span>
              <div className="flex-grow h-px bg-brand-border/30" />
            </motion.div>
          )}

          {done.map(todo => (
            <motion.div key={todo.id} layout initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
              className="flex items-center gap-3 group p-2.5 rounded-2xl opacity-40">
              <button onClick={() => toggle(todo.id)} className="w-5 h-5 rounded-lg bg-brand-dark border-brand-dark flex items-center justify-center shrink-0">
                <Check size={11} className="text-white" strokeWidth={3} />
              </button>
              <span className="flex-grow text-xs font-medium line-through text-brand-gray/40 truncate">{todo.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 添加任务 */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()}
            placeholder="这任务很着急，还是 nobody cares？"
            className="flex-grow bg-brand-offwhite border border-brand-border/10 text-brand-dark placeholder-brand-gray/40 px-4 py-3 rounded-2xl text-xs font-medium outline-none focus:border-brand-dark/20 transition-colors" />
          <button onClick={add} className="w-11 h-11 bg-brand-dark text-white rounded-2xl flex items-center justify-center hover:bg-brand-dark/90 transition-all active:scale-95 shadow-sm shrink-0">
            <Plus size={16} strokeWidth={3} />
          </button>
        </div>
        <div className="flex gap-1">
          {TODO_URGENCY_GROUPS.map(g => (
            <button key={g.key} onClick={() => setSelectedUrgency(g.key)} title={URGENCY_HINT[g.key]}
              className={cn(
                'flex-1 py-1 rounded-lg text-[8px] font-bold border transition-all',
                selectedUrgency === g.key ? URGENCY_BADGE_STYLE[g.key] : 'bg-brand-offwhite text-brand-gray/40 border-brand-border/10 hover:text-brand-gray'
              )}>
              {g.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── MODULE 4 · Food Selector ──────────────────────────────────────────────────
const FOODS = [
  { emoji: '🍔', item: '麦当劳 1+1' }, { emoji: '🍗', item: 'KFC 疯狂四' },
  { emoji: '🍚', item: '猪脚饭' },    { emoji: '🍜', item: '兰州拉面' },
  { emoji: '🥗', item: '鸡胸沙拉' },  { emoji: '🌶️', item: '麻辣烫' },
  { emoji: '🍱', item: '台式卤肉饭' }, { emoji: '🍝', item: '意大利面' },
  { emoji: '🥙', item: '全麦三明治' }, { emoji: '🍲', item: '螺蛳粉' },
];

const FoodSelector: React.FC = () => {
  const [idx, setIdx] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [displayIdx, setDisplayIdx] = useState(0);
  const [skipIdx, setSkipIdx] = useState<number | null>(null);
  const [lastEaten, setLastEaten] = useState<string | null>(() => localStorage.getItem(SK.LAST_FOOD));
  const rollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (rollRef.current) clearInterval(rollRef.current); }, []);

  const rollExcluding = (excludeIdx: number | null) => {
    if (isRolling) return;
    setIsRolling(true);
    rollRef.current = setInterval(() => {
      setDisplayIdx(Math.floor(Math.random() * FOODS.length));
    }, 80);
    setTimeout(() => {
      clearInterval(rollRef.current!);
      let final: number;
      const pool = FOODS.map((_, i) => i).filter(i => i !== excludeIdx);
      final = pool[Math.floor(Math.random() * pool.length)];
      setIdx(final);
      setDisplayIdx(final);
      setSkipIdx(null);
      setIsRolling(false);
      const name = FOODS[final].item;
      localStorage.setItem(SK.LAST_FOOD, name);
      setLastEaten(name);
    }, 1400);
  };

  const roll = () => rollExcluding(null);

  const skipCurrent = () => {
    if (idx === null) return;
    setSkipIdx(idx);
    rollExcluding(idx);
  };

  const current = FOODS[isRolling ? displayIdx : (idx ?? displayIdx)];

  return (
    <div className="bg-white rounded-[24px] border border-brand-border/10 shadow-sm p-6 flex flex-col h-full min-h-[300px]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col gap-1">
          <p className="text-[10px] font-bold text-brand-gray/50 uppercase tracking-[0.15em]">Food Selector</p>
          <span className="text-xs font-bold text-brand-dark">今天吃什么</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-brand-offwhite flex items-center justify-center">
          <Utensils size={13} className="text-brand-gray" />
        </div>
      </div>

      {lastEaten && idx === null && (
        <p className="text-[10px] text-brand-gray/40 font-medium mb-2 text-center">上次吃了：{lastEaten}</p>
      )}

      <div className="flex-grow flex flex-col items-center justify-center gap-4">
        <div className="w-20 h-20 bg-brand-offwhite border border-brand-border/10 rounded-[24px] flex items-center justify-center overflow-hidden">
          <span className={cn('text-3xl transition-all duration-75', isRolling && 'scale-95 opacity-50 blur-[1px]')}>
            {current.emoji}
          </span>
        </div>

        <div className="h-8 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {!isRolling && idx !== null && (
              <motion.p key={idx} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="text-sm font-black text-brand-dark">
                {FOODS[idx].item}
              </motion.p>
            )}
          </AnimatePresence>
          {idx === null && !isRolling && (
            <p className="text-[11px] font-bold text-brand-gray/50 tracking-wider">听天由命</p>
          )}
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <motion.button whileTap={{ scale: 0.96 }} onClick={roll} disabled={isRolling}
          className="flex-1 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 bg-brand-dark text-white shadow-sm disabled:opacity-50">
          {isRolling ? <Sparkles size={13} className="animate-spin" /> : <RefreshCw size={11} />}
          {isRolling ? '随机中...' : idx !== null ? '再来一个' : '帮我决定'}
        </motion.button>
        {idx !== null && !isRolling && (
          <motion.button whileTap={{ scale: 0.96 }} onClick={skipCurrent}
            className="px-4 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1 bg-brand-offwhite text-brand-gray border border-brand-border/10 hover:text-red-500">
            <ThumbsDown size={11} />
            不想吃
          </motion.button>
        )}
      </div>
    </div>
  );
};

// ─── Earned-today badge (shared) ──────────────────────────────────────────────
const EarnedTodayBadge: React.FC<{ type: 'paid_poop' | 'touch_fish' | 'drink_coffee'; label: string }> = ({ type, label }) => {
  const [total, setTotal] = useState(() => {
    const records = earnLossStore.getToday();
    return records.filter(r => r.type === type).reduce((s, r) => s + r.amount, 0);
  });

  useEffect(() => {
    const refresh = () => {
      const records = earnLossStore.getToday();
      setTotal(records.filter(r => r.type === type).reduce((s, r) => s + r.amount, 0));
    };
    return earnLossStore.subscribe(refresh);
  }, [type]);

  if (total === 0) return null;
  return (
    <p className="text-[10px] font-bold text-brand-gray/50 text-center mt-1">
      {label} <span className="text-emerald-600 font-black">¥{total.toFixed(2)}</span>
    </p>
  );
};

// ─── MODULE 5a · 带薪拉屎 ────────────────────────────────────────────────────
const PaidPoopModule: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [salary] = useState(() => loadNum(SK.SALARY, 6000));
  const hourlyRate = (salary / 22) / 8;
  const earned = (seconds / 3600) * hourlyRate;

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isActive) interval = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(interval!);
  }, [isActive]);

  const handleStop = () => {
    setIsActive(false);
    if (seconds > 0) {
      earnLossStore.append({
        type: 'paid_poop',
        amount: earned,
        duration: seconds,
        timestamp: Date.now(),
        dateKey: new Date().toDateString(),
      });
    }
    setSeconds(0);
  };

  return (
    <div className="bg-white rounded-[24px] border border-brand-border/10 shadow-sm p-6 flex flex-col h-full min-h-[300px]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col gap-1">
          <p className="text-[10px] font-bold text-brand-gray/50 uppercase tracking-[0.15em]">Paid Time</p>
          <span className="text-xs font-bold text-brand-dark">带薪拉屎</span>
        </div>
        <div className={cn('w-8 h-8 rounded-full flex items-center justify-center transition-colors', isActive ? 'bg-brand-dark text-white' : 'bg-brand-offwhite text-brand-gray')}>
          <TimerIcon size={13} />
        </div>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center gap-1">
        <div className="text-4xl font-black text-brand-dark tabular-nums tracking-tighter" style={{ fontFamily: 'ui-monospace, SFMono-Regular, monospace' }}>
          {formatTime(seconds)}
        </div>
        <div className="mt-3 flex items-baseline gap-1 text-xs font-bold text-brand-gray/60">
          <span>正在带薪赚</span>
          <span className="text-sm font-black text-brand-dark ml-1 tracking-tight">¥{earned.toFixed(3)}</span>
        </div>
        {!isActive && seconds === 0 && (
          <p className="text-[10px] text-brand-gray/40 text-center mt-2 font-medium px-2">
            蹲着的每一秒，都是合法收入
          </p>
        )}
      </div>

      <motion.button whileTap={{ scale: 0.96 }} onClick={isActive ? handleStop : () => setIsActive(true)}
        className={cn(
          'mt-6 w-full py-3.5 rounded-2xl text-xs font-bold transition-all shadow-sm flex justify-center items-center border',
          isActive ? 'bg-brand-offwhite hover:bg-brand-border/10 text-brand-dark border-brand-border/10' : 'bg-brand-dark text-white border-brand-dark'
        )}>
        {isActive ? '结算，返回工位' : '开始带薪拉屎'}
      </motion.button>
      <EarnedTodayBadge type="paid_poop" label="今天带薪赚了" />
    </div>
  );
};

// ─── MODULE 5b · 摸鱼 ────────────────────────────────────────────────────────
const TouchFishModule: React.FC = () => {
  const toast = useToast();
  const [count, setCount] = useState(0);

  const handleTouchFish = () => {
    incrementLocalNumber(LOCAL_NUMBER_KEYS.touchFishCounter, 0);
    void dispatchPetEvent('touch_fish');
    const salary = readLocalNumber(LOCAL_NUMBER_KEYS.salary, 6000);
    const minuteRate = (salary / 22 / 8) / 60;
    const earned = minuteRate * 5;
    earnLossStore.append({
      type: 'touch_fish',
      amount: earned,
      duration: 5 * 60,
      timestamp: Date.now(),
      dateKey: new Date().toDateString(),
    });
    setCount(c => c + 1);
    toast.success(`已摸鱼 +¥${earned.toFixed(2)}`);
  };

  return (
    <div className="bg-white rounded-[24px] border border-brand-border/10 shadow-sm p-6 flex flex-col h-full min-h-[300px]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col gap-1">
          <p className="text-[10px] font-bold text-brand-gray/50 uppercase tracking-[0.15em]">Touch Fish</p>
          <span className="text-xs font-bold text-brand-dark">摸鱼</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-brand-offwhite text-brand-gray flex items-center justify-center">
          <Fish size={13} />
        </div>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center gap-3">
        {count === 0 ? (
          <p className="text-center text-xs text-brand-gray/60 font-medium px-2">
            每次摸鱼计 5 分钟工资<br />
            <span className="text-[10px] text-brand-gray/40">这也是你今天赚到的钱</span>
          </p>
        ) : (
          <p className="text-center text-xs text-brand-gray/60 font-medium">
            今天摸了 <span className="font-black text-brand-dark">{count}</span> 次
          </p>
        )}
      </div>

      <motion.button whileTap={{ scale: 0.96 }} onClick={handleTouchFish}
        className="w-full py-3.5 rounded-2xl text-xs font-bold transition-all shadow-sm flex justify-center items-center bg-brand-dark text-white border border-brand-dark">
        <Fish size={14} className="mr-1.5" /> 摸一下
      </motion.button>
      <EarnedTodayBadge type="touch_fish" label="今天摸鱼赚了" />
    </div>
  );
};

// ─── MODULE 5c · 喝咖啡 ──────────────────────────────────────────────────────
const CoffeeModule: React.FC = () => {
  const toast = useToast();
  const [count, setCount] = useState(0);

  const handleDrinkCoffee = () => {
    incrementLocalNumber(LOCAL_NUMBER_KEYS.coffeeCounter, 0);
    void dispatchPetEvent('drink_coffee');
    const salary = readLocalNumber(LOCAL_NUMBER_KEYS.salary, 6000);
    const minuteRate = (salary / 22 / 8) / 60;
    const earned = minuteRate * 10;
    earnLossStore.append({
      type: 'drink_coffee',
      amount: earned,
      duration: 10 * 60,
      timestamp: Date.now(),
      dateKey: new Date().toDateString(),
    });
    setCount(c => c + 1);
    toast.success(`已喝咖啡 +¥${earned.toFixed(2)}`);
  };

  return (
    <div className="bg-white rounded-[24px] border border-brand-border/10 shadow-sm p-6 flex flex-col h-full min-h-[300px]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col gap-1">
          <p className="text-[10px] font-bold text-brand-gray/50 uppercase tracking-[0.15em]">Coffee Break</p>
          <span className="text-xs font-bold text-brand-dark">喝咖啡</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-brand-offwhite text-brand-gray flex items-center justify-center">
          <Coffee size={13} />
        </div>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center gap-3">
        {count === 0 ? (
          <p className="text-center text-xs text-brand-gray/60 font-medium px-2">
            每次喝咖啡计 10 分钟工资<br />
            <span className="text-[10px] text-brand-gray/40">这也是你今天赚到的钱</span>
          </p>
        ) : (
          <p className="text-center text-xs text-brand-gray/60 font-medium">
            今天喝了 <span className="font-black text-brand-dark">{count}</span> 杯
          </p>
        )}
      </div>

      <motion.button whileTap={{ scale: 0.96 }} onClick={handleDrinkCoffee}
        className="w-full py-3.5 rounded-2xl text-xs font-bold transition-all shadow-sm flex justify-center items-center bg-brand-dark text-white border border-brand-dark">
        <Coffee size={14} className="mr-1.5" /> 喝一杯
      </motion.button>
      <EarnedTodayBadge type="drink_coffee" label="今天喝咖啡赚了" />
    </div>
  );
};

// ─── MAIN ─────────────────────────────────────────────────────────────────────
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
        <div className="min-h-[300px]">
          <PaidPoopModule />
        </div>
        <div className="min-h-[300px]">
          <TouchFishModule />
        </div>
        <div className="min-h-[300px]">
          <CoffeeModule />
        </div>
      </div>
    </div>
  );
}
