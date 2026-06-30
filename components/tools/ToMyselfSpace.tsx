import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { LOCAL_NUMBER_KEYS, LOCAL_STRING_KEYS, incrementLocalNumber, readLocalNumber, writeLocalNumber, writeLocalString, subscribeLocalNumber, subscribeLocalString } from '../../lib/localSignals';
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
  ArrowRight, Gamepad2, Heart, Sun, Compass,
} from 'lucide-react';

// ─── Storage helpers ──────────────────────────────────────────────────────────
const SK = {
  SALARY:       'cl_monthly_salary',
  WORK_START:   'cl_work_start',
  WORK_END:     'cl_work_end',
  FOCUS_SESSIONS: 'cl_focus_sessions',
  LAST_FOOD:    'cl_last_food',
  SKIP_FOOD:    'cl_skip_food',
  BIRTH_YEAR:   'cl_birth_year',
  BIRTH_MONTH:  'cl_birth_month',
  BIRTH_DAY:    'cl_birth_day',
  RETIRE_AGE:   'cl_retire_age',
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

// ─── 夸夸语录 ────────────────────────────────────────────────────────────────
const PRAISES = [
  "你是最棒的人！",
  "今天的你，在认真为自己上班",
  "深呼吸，你比早上更值钱了",
  "不是你的锅，但你已经做得很好了",
  "下班快乐！自由属于你",
  "今天也存活下来了，厉害！",
  "摸摸鱼怎么了，这是你的权利",
  "你值得拥有不加班的人生",
  "你的时间很值钱，别忘了",
  "今天辛苦了，你超棒的",
  "今天也是认真生活的一天呢",
  "你的存在本身就是有意义的",
  "辛苦了，奖励自己一朵小红花",
  "你是办公室里最亮的光",
  "今天也努力了，你已经很棒了",
];

// ─── 可爱配色 ────────────────────────────────────────────────────────────────
const CUTE = {
  green:  'text-emerald-400',
  greenBg: 'bg-emerald-400',
  yellow: 'text-amber-300',
  yellowBg: 'bg-amber-300',
  blue:   'text-blue-300',
  blueBg: 'bg-blue-300',
  red:    'text-rose-300',
  redBg:  'bg-rose-300',
  greenBorder: 'border-emerald-400/30',
  yellowBorder: 'border-amber-300/30',
  blueBorder: 'border-blue-300/30',
  greenBgSoft: 'bg-emerald-400/10',
  yellowBgSoft: 'bg-amber-300/10',
  blueBgSoft: 'bg-blue-400/10',
} as const;

// ─── MODULE 1 · 高效下班系统 ──────────────────────────────────────────────────

const SalaryMonitor: React.FC = () => {
  const [salary, setSalary]       = useState(() => loadNum(SK.SALARY, 6000));
  const [workStart, setWorkStart] = useState(() => localStorage.getItem(SK.WORK_START) || '09:00');
  const [workEnd, setWorkEnd]     = useState(() => localStorage.getItem(SK.WORK_END)   || '17:00');
  const [now, setNow]             = useState(() => new Date());
  const [showSettings, setShowSettings] = useState(false);
  const [draft, setDraft] = useState({ salary: '6000', start: '09:00', end: '17:00', birthYear: '1995', birthMonth: '1', birthDay: '1', retireAge: '60' });
  const [summary, setSummary] = useState(() => earnLossStore.getTodaySummary());
  const lastOtRef = useRef(0);

  // 退休相关状态
  const [birthYear, setBirthYear] = useState(() => loadNum(SK.BIRTH_YEAR, 0));
  const [birthMonth, setBirthMonth] = useState(() => loadNum(SK.BIRTH_MONTH, 0));
  const [birthDay, setBirthDay] = useState(() => loadNum(SK.BIRTH_DAY, 0));
  const [retireAge, setRetireAge] = useState(() => loadNum(SK.RETIRE_AGE, 0));

  // 夸夸状态
  const [praise, setPraise] = useState<string | null>(() => {
    const today = new Date().toDateString();
    const stored = localStorage.getItem('cl_praise_date');
    if (stored === today) return localStorage.getItem('cl_praise_text');
    return null;
  });

  // 账单展开状态
  const [showBill, setShowBill] = useState(false);

  // 已下班状态
  const [stoppedToday, setStoppedToday] = useState(() => earnLossStore.isOvertimeStopped());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => { writeLocalNumber(LOCAL_NUMBER_KEYS.salary, salary); }, [salary]);

  useEffect(() => {
    const unsub = subscribeLocalString(LOCAL_STRING_KEYS.workStart, '09:00', setWorkStart);
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = subscribeLocalString(LOCAL_STRING_KEYS.workEnd, '17:00', setWorkEnd);
    return unsub;
  }, []);

  useEffect(() => subscribeLocalNumber(LOCAL_NUMBER_KEYS.salary, 6000, setSalary), []);

  useEffect(() => {
    setSummary(earnLossStore.getTodaySummary());
    return earnLossStore.subscribe(setSummary);
  }, []);

  // 每日重置夸夸
  useEffect(() => {
    const today = new Date().toDateString();
    const stored = localStorage.getItem('cl_praise_date');
    if (stored !== today) {
      localStorage.setItem('cl_praise_date', today);
      const randomPraise = PRAISES[Math.floor(Math.random() * PRAISES.length)];
      localStorage.setItem('cl_praise_text', randomPraise);
      setPraise(randomPraise);
    }
  }, []);

  // 每日重置停止状态
  useEffect(() => {
    const today = new Date().toDateString();
    const stored = localStorage.getItem('cl_stopped_date');
    if (stored !== today) {
      localStorage.removeItem('cl_stopped_date');
      earnLossStore.resetStopped();
      setStoppedToday(false);
    }
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
    if (stoppedToday) return;
    if (otMin <= lastOtRef.current) return;
    const recorded = earnLossStore.recordOvertimeLoss({ minuteRate, otMinutes: otMin, dateKey: todayDateKey });
    if (recorded) lastOtRef.current = otMin;
  }, [isOvertime, minuteRate, otMin, todayDateKey, stoppedToday]);

  useEffect(() => {
    if (otMin === 0) lastOtRef.current = 0;
  }, [otMin, todayDateKey]);

  // ─── 退休计算 ────────────────────────────────────────────────────────────────
  const retirement = useMemo(() => {
    if (!birthYear || !birthMonth || !birthDay || !retireAge) return null;
    const today = new Date();
    const retireDate = new Date(birthYear + retireAge, birthMonth - 1, birthDay);
    const diffMs = retireDate.getTime() - today.getTime();
    const totalDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    const yearsLeft = Math.floor(totalDays / 365);
    const leftDays = totalDays % 365;

    // 工作进度
    const workStartAge = 22;
    const totalWorkYears = retireAge - workStartAge;
    const currentAge = today.getFullYear() - birthYear -
      (today.getMonth() + 1 < birthMonth || (today.getMonth() + 1 === birthMonth && today.getDate() < birthDay) ? 1 : 0);
    const workedYears = Math.max(0, Math.min(currentAge - workStartAge, totalWorkYears));
    const workedPercent = totalWorkYears > 0 ? (workedYears / totalWorkYears) * 100 : 0;

    return { totalDays, yearsLeft, leftDays, workedPercent, totalWorkYears, workedYears, retireDate };
  }, [birthYear, birthMonth, birthDay, retireAge, now]);

  // ─── 4-state verdict ───────────────────────────────────────────────────────
  type VerdictState = 'before' | 'working' | 'go_now' | 'overtime' | 'stopped';
  const verdictState: VerdictState =
    stoppedToday ? 'stopped' :
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
      color: CUTE.green,
    },
    overtime: {
      label: `已免费打工 ${otMin} 分钟`,
      hint:  '你的时间值钱，但你不在乎',
      icon:  <AlertTriangle size={14} />,
      color: CUTE.red,
    },
    stopped: {
      label: '已下班，自由啦',
      hint:  '亏损已停止，今天辛苦了',
      icon:  <Sun size={14} />,
      color: CUTE.yellow,
    },
  }[verdictState];

  const statusText =
    verdictState === 'stopped'    ? '已下班，自由啦' :
    verdictState === 'before'     ? '尚未开工' :
    verdictState === 'overtime'   ? '免费加班进行中' :
    verdictState === 'go_now'     ? '到点，走人' :
    '正在工作时段中';

  const triggerPraise = () => {
    const randomPraise = PRAISES[Math.floor(Math.random() * PRAISES.length)];
    localStorage.setItem('cl_praise_text', randomPraise);
    localStorage.setItem('cl_praise_date', new Date().toDateString());
    setPraise(randomPraise);
  };

  const handleClockOff = () => {
    earnLossStore.stopOvertime();
    setStoppedToday(true);
    localStorage.setItem('cl_stopped_date', new Date().toDateString());
    triggerPraise();
    setShowBill(true);
  };

  const openSettings = () => {
    setDraft({
      salary: String(salary), start: workStart, end: workEnd,
      birthYear: String(birthYear || 1995),
      birthMonth: String(birthMonth || 1),
      birthDay: String(birthDay || 1),
      retireAge: String(retireAge || 60),
    });
    setShowSettings(true);
  };

  const saveSettings = () => {
    const v = Number(draft.salary);
    if (v > 0) setSalary(v);
    writeLocalString(LOCAL_STRING_KEYS.workStart, draft.start);
    writeLocalString(LOCAL_STRING_KEYS.workEnd, draft.end);
    const by = Number(draft.birthYear);
    const bm = Number(draft.birthMonth);
    const bd = Number(draft.birthDay);
    const ra = Number(draft.retireAge);
    if (by > 1900 && by < 2010) { localStorage.setItem(SK.BIRTH_YEAR, String(by)); setBirthYear(by); }
    if (bm > 0 && bm <= 12) { localStorage.setItem(SK.BIRTH_MONTH, String(bm)); setBirthMonth(bm); }
    if (bd > 0 && bd <= 31) { localStorage.setItem(SK.BIRTH_DAY, String(bd)); setBirthDay(bd); }
    if (ra > 30 && ra < 100) { localStorage.setItem(SK.RETIRE_AGE, String(ra)); setRetireAge(ra); }
    setShowSettings(false);
  };

  const netIncome = summary.earnTotal - summary.lossTotal;

  return (
    <div className="bg-gradient-to-br from-emerald-900/90 via-blue-900/90 to-slate-900 rounded-[24px] p-6 flex flex-col h-full relative overflow-hidden shadow-sm">
      {/* 装饰气泡 */}
      <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-emerald-400/10 blur-xl" />
      <div className="absolute -left-4 bottom-20 w-16 h-16 rounded-full bg-amber-300/10 blur-lg" />
      <div className="absolute right-10 bottom-40 w-12 h-12 rounded-full bg-blue-300/10 blur-md" />

      {/* 顶部标题栏 */}
      <div className="flex items-start justify-between mb-6 relative z-10">
        <div>
          <p className="text-[10px] font-bold text-emerald-300/70 uppercase tracking-[0.15em] mb-2">高效下班系统</p>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              {verdictState === 'working' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-40"></span>}
              <span className={cn('relative inline-flex rounded-full h-2 w-2',
                verdictState === 'overtime' ? CUTE.redBg :
                verdictState === 'go_now'   ? CUTE.greenBg :
                verdictState === 'stopped'  ? CUTE.yellowBg :
                verdictState === 'before'   ? 'bg-white/20' :
                CUTE.greenBg
              )}></span>
            </span>
            <span className="text-xs font-bold text-white/70">{statusText}</span>
          </div>
        </div>
        <button onClick={openSettings} className="p-2 -mr-2 text-white/30 hover:text-white/80 transition-colors rounded-full hover:bg-white/5">
          <Settings size={14} />
        </button>
      </div>

      {/* 夸夸卡片 */}
      <AnimatePresence>
        {praise && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 mb-5 rounded-2xl px-4 py-3 bg-gradient-to-r from-emerald-400/15 to-amber-300/15 border border-emerald-300/20 cursor-pointer"
            onClick={triggerPraise}
          >
            <div className="flex items-center gap-2">
              <Heart size={12} className="text-rose-300 fill-rose-300/50" />
              <p className="text-xs font-bold text-emerald-200">{praise}</p>
              <Sparkles size={10} className="text-amber-300 ml-auto shrink-0" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 设置面板 */}
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
                  <label className="text-[10px] text-white/40 font-bold block mb-1">上班时间</label>
                  <input type="time" value={draft.start} onChange={e => setDraft(d => ({ ...d, start: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 text-white text-xs font-bold rounded-xl px-3 py-2 outline-none focus:border-white/30" />
                </div>
                <div>
                  <label className="text-[10px] text-white/40 font-bold block mb-1">下班时间</label>
                  <input type="time" value={draft.end} onChange={e => setDraft(d => ({ ...d, end: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 text-white text-xs font-bold rounded-xl px-3 py-2 outline-none focus:border-white/30" />
                </div>
              </div>
              {/* 退休设置 */}
              <div className="pt-2 border-t border-white/10">
                <p className="text-[10px] font-bold text-amber-300/60 mb-2">退休计划设置</p>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <label className="text-[10px] text-white/40 font-bold block mb-1">出生年</label>
                    <input type="number" value={draft.birthYear} onChange={e => setDraft(d => ({ ...d, birthYear: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 text-white text-xs font-bold rounded-xl px-3 py-2 outline-none focus:border-white/30" />
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <div>
                      <label className="text-[10px] text-white/40 font-bold block mb-1">月</label>
                      <input type="number" min="1" max="12" value={draft.birthMonth} onChange={e => setDraft(d => ({ ...d, birthMonth: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 text-white text-xs font-bold rounded-xl px-3 py-2 outline-none focus:border-white/30" />
                    </div>
                    <div>
                      <label className="text-[10px] text-white/40 font-bold block mb-1">日</label>
                      <input type="number" min="1" max="31" value={draft.birthDay} onChange={e => setDraft(d => ({ ...d, birthDay: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 text-white text-xs font-bold rounded-xl px-3 py-2 outline-none focus:border-white/30" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-white/40 font-bold block mb-1">退休年龄</label>
                  <input type="number" value={draft.retireAge} onChange={e => setDraft(d => ({ ...d, retireAge: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 text-white text-xs font-bold rounded-xl px-3 py-2 outline-none focus:border-white/30" />
                </div>
              </div>
            </div>
            <button onClick={saveSettings} className="w-full py-2.5 bg-gradient-to-r from-emerald-400 to-blue-400 text-brand-dark text-xs font-bold rounded-xl hover:from-emerald-300 hover:to-blue-300 transition-all">保存设置</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 实时薪资 */}
      <div className="relative z-10 mb-6">
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-medium text-emerald-300/50">¥</span>
          <motion.p key={Math.floor(earned * 10)} initial={{ opacity: .8 }} animate={{ opacity: 1 }}
            className="text-5xl md:text-6xl font-black text-white tabular-nums tracking-tighter"
            style={{ fontFamily: 'ui-monospace, SFMono-Regular, monospace' }}>
            {earned.toFixed(2)}
          </motion.p>
        </div>
        <p className="text-[11px] text-white/50 mt-3 font-medium flex gap-3">
          <span className="text-emerald-300/70">时薪 ¥{hourlyRate.toFixed(1)}</span>
          <span className="text-white/20">|</span>
          <span className="text-amber-300/70">分薪 ¥{minuteRate.toFixed(3)}</span>
        </p>
      </div>

      {/* 时间进度条 */}
      <div className="relative z-10 mb-6">
        <div className="flex justify-between text-[11px] font-bold mb-2">
          <span className="text-blue-300/60">{workStart}</span>
          <span className={cn(
            isOvertime ? CUTE.red :
            isBefore   ? 'text-white/20' :
            remainSec <= 3600 ? CUTE.yellow : 'text-emerald-300/80'
          )}>
            {isOvertime ? `免费加班 ${otMin}m` : isBefore ? '等待开工' : `距下班 ${remH > 0 ? remH + 'h ' : ''}${remM}m`}
          </span>
          <span className="text-blue-300/60">{workEnd}</span>
        </div>
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className={cn('h-full rounded-full transition-colors duration-500',
              isOvertime ? 'bg-gradient-to-r from-rose-400 to-red-400' :
              remainSec <= 3600 ? 'bg-gradient-to-r from-amber-300 to-yellow-300' : 'bg-gradient-to-r from-emerald-300 to-green-400'
            )}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progress, 100)}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* 今日账单 */}
      <div className={cn(
        'relative z-10 mb-4 rounded-2xl p-4 border transition-colors',
        verdictState === 'overtime' ? 'bg-rose-400/10 border-rose-300/20' : 'bg-white/5 border-white/10'
      )}>
        <p className="text-[10px] font-bold text-blue-300/60 uppercase tracking-[0.15em] mb-3">今日账单</p>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-emerald-400/10 px-3 py-3">
            <p className="text-[9px] text-emerald-400/60 font-bold uppercase">今日赚钱</p>
            <p className="mt-1 text-lg font-black text-emerald-300 tabular-nums">¥{summary.earnTotal.toFixed(2)}</p>
          </div>
          <div className="rounded-xl bg-rose-400/10 px-3 py-3">
            <p className="text-[9px] text-rose-400/60 font-bold uppercase">今日亏钱</p>
            <p className="mt-1 text-lg font-black text-rose-300 tabular-nums">¥{summary.lossTotal.toFixed(2)}</p>
          </div>
          <div className="rounded-xl bg-amber-300/10 px-3 py-3">
            <p className="text-[9px] text-amber-300/60 font-bold uppercase">加班白干</p>
            <p className="mt-1 text-lg font-black text-amber-200 tabular-nums">¥{summary.overtimeLossTotal.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* 退休倒计时 */}
      {retirement && (
        <div className="relative z-10 mb-4 rounded-2xl p-4 border border-blue-300/20 bg-blue-400/5">
          <div className="flex items-center gap-2 mb-3">
            <Sun size={12} className="text-amber-300" />
            <p className="text-[10px] font-bold text-blue-300/60 uppercase tracking-[0.15em]">退休倒计时</p>
          </div>
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-2xl font-black text-emerald-300">{retirement.yearsLeft}</span>
            <span className="text-xs text-emerald-300/70 font-bold">年</span>
            <span className="text-2xl font-black text-emerald-300 ml-2">{retirement.leftDays}</span>
            <span className="text-xs text-emerald-300/70 font-bold">天</span>
          </div>
          <p className="text-[11px] text-white/40 mb-3">距离 {retireAge} 岁自由还有 {retirement.totalDays.toLocaleString()} 天</p>
          {/* 工作进度条 */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[9px] text-blue-300/60 font-bold">已工作 {retirement.workedYears}/{retirement.totalWorkYears} 年</span>
            <span className="text-[9px] text-amber-300/60 font-bold ml-auto">{retirement.workedPercent.toFixed(1)}%</span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-amber-300 to-emerald-400"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(retirement.workedPercent, 100)}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>
      )}

      {/* 下班判断 + 停止亏损按钮 */}
      <div className={cn(
        'relative z-10 rounded-2xl p-4 border transition-colors',
        verdictState === 'go_now'   ? CUTE.greenBgSoft :
        verdictState === 'overtime' ? 'bg-rose-400/10' :
        verdictState === 'stopped'  ? CUTE.yellowBgSoft :
        'bg-white/5 border-white/10'
      )}>
        <div className="flex items-center justify-between mb-1">
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.15em]">今天能不能走</p>
          <span className="text-[10px] font-bold text-white/30">
            {verdictState === 'overtime' || verdictState === 'go_now' ? `已过 ${workEnd}` : `等到 ${workEnd}`}
          </span>
        </div>
        <p className={cn('text-base font-black tracking-tight flex items-center gap-2 mb-3', VERDICT.color)}>
          {VERDICT.icon}
          {VERDICT.label}
        </p>
        <p className="text-[11px] text-white/40 mb-3 font-medium">{VERDICT.hint}</p>

        {/* 已下班按钮 */}
        {verdictState === 'go_now' || verdictState === 'overtime' ? (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleClockOff}
            className="w-full py-3 rounded-2xl text-xs font-bold bg-gradient-to-r from-emerald-400 to-green-400 text-brand-dark shadow-lg shadow-emerald-400/20 hover:from-emerald-300 hover:to-green-300 transition-all flex items-center justify-center gap-2"
          >
            <Check size={14} />
            我已下班！停止亏损
          </motion.button>
        ) : verdictState === 'stopped' ? (
          <div className="w-full py-3 rounded-2xl text-xs font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-300/30 flex items-center justify-center gap-2">
            <Sun size={14} />
            已下班，今天亏损已停止
          </div>
        ) : null}
      </div>

      {/* 可展开的今日账单详情 */}
      <div className="relative z-10 mt-4">
        <button
          onClick={() => setShowBill(!showBill)}
          className="w-full py-2.5 rounded-xl text-[10px] font-bold text-white/40 hover:text-white/70 bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center gap-1"
        >
          {showBill ? '收起账单' : '查看今日详细账单'}
          <motion.span animate={{ rotate: showBill ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ArrowRight size={10} className="rotate-90" />
          </motion.span>
        </button>
        <AnimatePresence>
          {showBill && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-2 rounded-2xl p-4 bg-white/5 border border-white/10 space-y-2">
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3">今日详细</p>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/50">基础薪资</span>
                  <span className="text-white font-bold tabular-nums">¥{earned.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/50">摸鱼收入 ({summary.touchFishCount}次)</span>
                  <span className="text-emerald-300 font-bold tabular-nums">+¥{summary.touchFishEarn.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/50">带薪拉屎 ({summary.paidPoopCount}次/{summary.paidPoopMin}min)</span>
                  <span className="text-emerald-300 font-bold tabular-nums">+¥{summary.paidPoopEarn.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/50">咖啡回血 ({summary.coffeeCount}杯)</span>
                  <span className="text-emerald-300 font-bold tabular-nums">+¥{summary.coffeeEarn.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/50">加班亏损 ({summary.otMin}min)</span>
                  <span className="text-rose-300 font-bold tabular-nums">-¥{summary.overtimeLossTotal.toFixed(2)}</span>
                </div>

                <div className="pt-2 mt-2 border-t border-white/10 flex justify-between items-center">
                  <span className="text-sm font-bold text-white/70">今日净收入</span>
                  <span className={cn(
                    'text-xl font-black tabular-nums',
                    netIncome >= 0 ? 'text-emerald-300' : 'text-rose-300'
                  )}>
                    ¥{netIncome.toFixed(2)}
                  </span>
                </div>

                {praise && (
                  <div className="pt-2 flex items-center gap-2 justify-center">
                    <Heart size={10} className="text-rose-300 fill-rose-300/50" />
                    <p className="text-[10px] font-bold text-emerald-200">{praise}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// ─── MODULE 1b · Apex 算一卦 Entry ────────────────────────────────────────────

const ApexGuaEntry: React.FC = () => {
  const navigate = useNavigate();

  return (
    <motion.button
      type="button"
      onClick={() => navigate('/apex-gua')}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.985 }}
      className="group relative flex h-full min-h-[320px] w-full flex-col overflow-hidden rounded-[24px] border border-stone-200/60 bg-[linear-gradient(135deg,#faf5f5_0%,#ffffff_42%,#fef2f2_100%)] p-6 text-left shadow-sm transition-shadow hover:shadow-xl hover:shadow-stone-950/8"
    >
      <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full border border-stone-200/70 bg-stone-100/40" />
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-[radial-gradient(circle_at_20%_100%,rgba(192,57,43,0.12),transparent_62%)]" />

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#c0392b] text-white shadow-lg shadow-red-900/20">
            <Compass size={20} strokeWidth={2.5} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-red-500/80">CSPRNG 起卦</p>
            <h3 className="mt-1 text-base font-black tracking-tight text-brand-dark">Apex 算一卦</h3>
          </div>
        </div>
        <div className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[9px] font-black text-rose-600">
          易经
        </div>
      </div>

      <div className="relative z-10 mt-6 flex flex-1 flex-col justify-between">
        <div>
          <p className="max-w-[28rem] text-[13px] font-semibold leading-6 text-brand-dark/72">
            大衍蓍法或铜钱速卜，六次轻触成卦。卦匣收藏，卦象解读，一键起卦。
          </p>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <div className="rounded-2xl border border-red-100 bg-white/70 px-3 py-3">
              <p className="text-[9px] font-black uppercase tracking-widest text-brand-gray/60">方法</p>
              <p className="mt-1 text-xs font-black leading-snug text-brand-dark">蓍草 / 铜钱</p>
            </div>
            <div className="rounded-2xl border border-amber-100 bg-white/70 px-3 py-3">
              <p className="text-[9px] font-black uppercase tracking-widest text-brand-gray/60">收藏</p>
              <p className="mt-1 flex items-center gap-1.5 text-xs font-black text-brand-dark">
                <Sparkles size={13} className="text-amber-500" />
                卦匣存档
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#c0392b] px-3 py-1.5 text-[10px] font-black text-white">
            <Sparkles size={12} />
            APEX · 起一卦
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-black text-red-600 transition-transform group-hover:translate-x-1">
            开始算卦
            <ArrowRight size={14} />
          </span>
        </div>
      </div>
    </motion.button>
  );
};

// ─── MODULE 2 · Grievance Game Entry ──────────────────────────────────────────

const GrievanceGameEntry: React.FC = () => {
  const navigate = useNavigate();

  return (
    <motion.button
      type="button"
      onClick={() => navigate('/grievance-game')}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.985 }}
      className="group relative flex h-full min-h-[320px] w-full flex-col overflow-hidden rounded-[24px] border border-rose-200/60 bg-[linear-gradient(135deg,#fff7ed_0%,#ffffff_42%,#fff1f2_100%)] p-6 text-left shadow-sm transition-shadow hover:shadow-xl hover:shadow-rose-950/8"
    >
      <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full border border-rose-200/70 bg-rose-100/40" />
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-[radial-gradient(circle_at_20%_100%,rgba(251,191,36,0.28),transparent_62%)]" />

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-dark text-white shadow-lg shadow-rose-900/20">
            <Gamepad2 size={20} strokeWidth={2.5} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-rose-500/80">职场扎小人</p>
            <h3 className="mt-1 text-base font-black tracking-tight text-brand-dark">职场怨气回收站</h3>
          </div>
        </div>
        <div className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[9px] font-black text-emerald-700">
          自愈中心
        </div>
      </div>

      <div className="relative z-10 mt-6 flex flex-1 flex-col justify-between">
        <div>
          <p className="max-w-[28rem] text-[13px] font-semibold leading-6 text-brand-dark/72">
            先给小人立案，再把它扎入职场十八层地狱。一层层扎下去，怨气回收，功德到账。
          </p>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <div className="rounded-2xl border border-rose-100 bg-white/70 px-3 py-3">
              <p className="text-[9px] font-black uppercase tracking-widest text-brand-gray/60">玩法</p>
              <p className="mt-1 text-xs font-black leading-snug text-brand-dark">一层层扎下去</p>
            </div>
            <div className="rounded-2xl border border-amber-100 bg-white/70 px-3 py-3">
              <p className="text-[9px] font-black uppercase tracking-widest text-brand-gray/60">状态</p>
              <p className="mt-1 flex items-center gap-1.5 text-xs font-black text-brand-dark">
                <Sparkles size={13} className="text-amber-500" />
                获取职场功德
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-dark px-3 py-1.5 text-[10px] font-black text-white">
            <Sparkles size={12} />
            APEX · 开始清算
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-black text-rose-600 transition-transform group-hover:translate-x-1">
            开始清算
            <ArrowRight size={14} />
          </span>
        </div>
      </div>
    </motion.button>
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

  useEffect(() => subscribeLocalString(LOCAL_STRING_KEYS.focusSessions, '0', (v) => {
    const nv = Number(v);
    if (!isNaN(nv)) setSessions(nv);
  }), []);
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
      writeLocalString(LOCAL_STRING_KEYS.focusSessions, String(next));

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
// 打工人食堂 —— 按品类分组的打工人真实食谱
// 每个条目：emoji + 名称 + 品类 + 价格区间 + 口味标签
const FOODS = [
  // 💰 10元以内吃饱 (15)
  { emoji: '🫓', item: '煎饼果子', cat: '早餐', price: 8, taste: '咸香' },
  { emoji: '🥞', item: '手抓饼', cat: '早餐', price: 10, taste: '咸香' },
  { emoji: '🫔', item: '粽子 + 豆浆', cat: '早餐', price: 8, taste: '甜' },
  { emoji: '🥟', item: '小笼包 8 个', cat: '早餐', price: 10, taste: '咸香' },
  { emoji: '🥟', item: '包子 2 个 + 稀饭', cat: '早餐', price: 6, taste: '咸香' },
  { emoji: '🍳', item: '蛋炒饭', cat: '快餐', price: 10, taste: '咸香' },
  { emoji: '🍜', item: '沙县拌面', cat: '面/粉', price: 8, taste: '清淡' },
  { emoji: '🥟', item: '沙县馄饨', cat: '快餐', price: 10, taste: '清淡' },
  { emoji: '🥮', item: '肉夹馍', cat: '小吃', price: 10, taste: '咸香' },
  { emoji: '🫓', item: '鸡蛋灌饼', cat: '小吃', price: 8, taste: '咸香' },
  { emoji: '🥟', item: '饺子 1 份', cat: '快餐', price: 10, taste: '咸香' },
  { emoji: '🍜', item: '热干面', cat: '面/粉', price: 8, taste: '重口' },
  { emoji: '🥘', item: '土豆丝盖饭', cat: '米饭', price: 10, taste: '清淡' },
  { emoji: '🍳', item: '蛋饼 + 豆浆', cat: '早餐', price: 8, taste: '清淡' },
  { emoji: '🍜', item: '阳春面', cat: '面/粉', price: 8, taste: '清淡' },

  // 💰 15-25元吃好 (30)
  { emoji: '🍚', item: '猪脚饭', cat: '米饭', price: 18, taste: '重口' },
  { emoji: '🍛', item: '黄焖鸡米饭', cat: '米饭', price: 18, taste: '重口' },
  { emoji: '🍱', item: '台式卤肉饭', cat: '米饭', price: 16, taste: '咸香' },
  { emoji: '🍖', item: '烤肉拌饭', cat: '米饭', price: 16, taste: '重口' },
  { emoji: '🍳', item: '煲仔饭', cat: '米饭', price: 18, taste: '咸香' },
  { emoji: '🍚', item: '木桶饭', cat: '米饭', price: 16, taste: '重口' },
  { emoji: '🍛', item: '鱼香肉丝盖饭', cat: '米饭', price: 16, taste: '重口' },
  { emoji: '🥘', item: '宫保鸡丁饭', cat: '米饭', price: 16, taste: '微辣' },
  { emoji: '🍖', item: '红烧排骨饭', cat: '米饭', price: 20, taste: '咸香' },
  { emoji: '🍛', item: '咖喱鸡饭', cat: '米饭', price: 18, taste: '微辣' },
  { emoji: '🍜', item: '兰州拉面', cat: '面/粉', price: 15, taste: '清淡' },
  { emoji: '🍜', item: '重庆小面', cat: '面/粉', price: 15, taste: '重口' },
  { emoji: '🍜', item: '酸辣粉', cat: '面/粉', price: 12, taste: '重口' },
  { emoji: '🌶️', item: '麻辣烫', cat: '面/粉', price: 18, taste: '重口' },
  { emoji: '🍲', item: '螺蛳粉', cat: '面/粉', price: 16, taste: '重口' },
  { emoji: '🍜', item: '炸酱面', cat: '面/粉', price: 15, taste: '咸香' },
  { emoji: '🍜', item: '刀削面', cat: '面/粉', price: 15, taste: '清淡' },
  { emoji: '🍜', item: '老友粉', cat: '面/粉', price: 16, taste: '重口' },
  { emoji: '🍜', item: '桂林米粉', cat: '面/粉', price: 15, taste: '清淡' },
  { emoji: '🍜', item: '过桥米线', cat: '面/粉', price: 18, taste: '清淡' },
  { emoji: '🔥', item: '麻辣香锅', cat: '火锅', price: 25, taste: '重口' },
  { emoji: '🍲', item: '一人食火锅', cat: '火锅', price: 25, taste: '重口' },
  { emoji: '🍢', item: '串串香', cat: '火锅', price: 22, taste: '重口' },
  { emoji: '🐟', item: '烤鱼', cat: '火锅', price: 25, taste: '重口' },
  { emoji: '🍲', item: '冒菜', cat: '火锅', price: 20, taste: '重口' },
  { emoji: '🥘', item: '干锅', cat: '火锅', price: 22, taste: '重口' },
  { emoji: '🥗', item: '鸡胸沙拉', cat: '轻食', price: 22, taste: '清淡' },
  { emoji: '🥙', item: '全麦三明治', cat: '轻食', price: 18, taste: '清淡' },
  { emoji: '🥬', item: 'Wagas 能量碗', cat: '轻食', price: 25, taste: '清淡' },
  { emoji: '🌯', item: '赛百味 Subway', cat: '轻食', price: 22, taste: '清淡' },

  // 🍗 快餐连锁 (12)
  { emoji: '🍔', item: '麦当劳 1+1', cat: '快餐', price: 14, taste: '重口' },
  { emoji: '🍗', item: 'KFC 疯狂四', cat: '快餐', price: 16, taste: '重口' },
  { emoji: '🍟', item: '华莱士全鸡', cat: '快餐', price: 22, taste: '重口' },
  { emoji: '🌮', item: '塔斯汀汉堡', cat: '快餐', price: 18, taste: '重口' },
  { emoji: '🍔', item: '汉堡王套餐', cat: '快餐', price: 25, taste: '重口' },
  { emoji: '🍟', item: '德克士手枪腿', cat: '快餐', price: 18, taste: '重口' },
  { emoji: '🍟', item: '麦当劳麦辣鸡腿堡', cat: '快餐', price: 16, taste: '重口' },
  { emoji: '🍗', item: '正新鸡排 + 可乐', cat: '快餐', price: 12, taste: '重口' },
  { emoji: '🍕', item: '达美乐披萨', cat: '快餐', price: 25, taste: '咸香' },
  { emoji: '🌯', item: '肯德基嫩牛五方', cat: '快餐', price: 16, taste: '微辣' },
  { emoji: '🍔', item: '魏家凉皮套餐', cat: '快餐', price: 15, taste: '微辣' },
  { emoji: '🥤', item: '杨国福麻辣烫套餐', cat: '快餐', price: 22, taste: '重口' },

  // 🍣 外卖/品质 (18)
  { emoji: '🍣', item: '回转寿司', cat: '日料', price: 40, taste: '清淡' },
  { emoji: '🍜', item: '日式拉面', cat: '日料', price: 32, taste: '咸香' },
  { emoji: '🍱', item: '日式便当', cat: '日料', price: 30, taste: '清淡' },
  { emoji: '🍱', item: '日料便当外卖', cat: '日料', price: 28, taste: '清淡' },
  { emoji: '🍛', item: '日式咖喱饭', cat: '日料', price: 28, taste: '咸香' },
  { emoji: '🐟', item: '三文鱼定食', cat: '日料', price: 38, taste: '清淡' },
  { emoji: '🥡', item: '东北盒饭', cat: '外卖', price: 16, taste: '咸香' },
  { emoji: '🥗', item: '减脂餐外卖', cat: '外卖', price: 28, taste: '清淡' },
  { emoji: '🍛', item: '咖喱饭外卖', cat: '外卖', price: 22, taste: '咸香' },
  { emoji: '🥡', item: '煲仔饭外卖', cat: '外卖', price: 20, taste: '咸香' },
  { emoji: '🥘', item: '湘菜小炒外卖', cat: '外卖', price: 25, taste: '重口' },
  { emoji: '🍖', item: '烤鸭饭', cat: '外卖', price: 22, taste: '咸香' },
  { emoji: '🥩', item: '隆江猪脚饭', cat: '外卖', price: 18, taste: '咸香' },
  { emoji: '🍛', item: '咖喱牛腩饭', cat: '外卖', price: 25, taste: '微辣' },
  { emoji: '🥘', item: '新疆大盘鸡', cat: '地方', price: 28, taste: '重口' },
  { emoji: '🥟', item: '广东肠粉', cat: '地方', price: 12, taste: '清淡' },
  { emoji: '🍜', item: '成都冒菜', cat: '地方', price: 20, taste: '重口' },
  { emoji: '🥘', item: '贵州酸汤鱼饭', cat: '地方', price: 22, taste: '微辣' },

  // 🥪 轻食/异国 (12)
  { emoji: '🥪', item: 'Pret 三明治', cat: '轻食', price: 25, taste: '清淡' },
  { emoji: '🥑', item: '牛油果吐司', cat: '轻食', price: 22, taste: '清淡' },
  { emoji: '🥗', item: '凯撒沙拉', cat: '轻食', price: 22, taste: '清淡' },
  { emoji: '🌮', item: '墨西哥卷饼', cat: '异国', price: 28, taste: '微辣' },
  { emoji: '🥙', item: '土耳其烤肉卷', cat: '异国', price: 22, taste: '重口' },
  { emoji: '🍝', item: '意大利面', cat: '异国', price: 25, taste: '咸香' },
  { emoji: '🥘', item: '泰式打抛猪饭', cat: '异国', price: 28, taste: '重口' },
  { emoji: '🍜', item: '越南河粉 Pho', cat: '异国', price: 28, taste: '清淡' },
  { emoji: '🥗', item: '波奇饭 Poke', cat: '异国', price: 32, taste: '清淡' },
  { emoji: '🥘', item: '韩式拌饭', cat: '异国', price: 22, taste: '重口' },
  { emoji: '🍜', item: '韩式炸酱面', cat: '异国', price: 22, taste: '咸香' },
  { emoji: '🥟', item: '韩式泡菜饺子', cat: '异国', price: 22, taste: '重口' },

  // 🍖 犒劳自己/奢侈 (12)
  { emoji: '🥩', item: '牛排套餐', cat: '奢侈', price: 68, taste: '咸香' },
  { emoji: '🍖', item: '烤肉自助', cat: '奢侈', price: 55, taste: '重口' },
  { emoji: '🍖', item: '北京烤鸭', cat: '奢侈', price: 58, taste: '咸香' },
  { emoji: '🍣', item: '日料 Omakase', cat: '奢侈', price: 88, taste: '清淡' },
  { emoji: '🥘', item: '铁板烧', cat: '奢侈', price: 55, taste: '重口' },
  { emoji: '🦞', item: '海鲜大餐', cat: '奢侈', price: 78, taste: '咸香' },
  { emoji: '🍲', item: '椰子鸡火锅', cat: '奢侈', price: 58, taste: '清淡' },
  { emoji: '🥩', item: '烤肉 + 啤酒', cat: '奢侈', price: 48, taste: '重口' },
  { emoji: '🍲', item: '重庆老火锅', cat: '奢侈', price: 55, taste: '重口' },
  { emoji: '🍗', item: '脆皮烤乳猪', cat: '奢侈', price: 48, taste: '咸香' },
  { emoji: '🥩', item: '黑椒牛柳意面', cat: '奢侈', price: 38, taste: '咸香' },
  { emoji: '🍲', item: '云南汽锅鸡', cat: '奢侈', price: 45, taste: '清淡' },

  // 🥧 下午茶/加餐 (10)
  { emoji: '☕', item: '星巴克 + 蛋糕', cat: '下午茶', price: 38, taste: '甜' },
  { emoji: '🧋', item: '奶茶 + 小料', cat: '下午茶', price: 18, taste: '甜' },
  { emoji: '🍰', item: '甜品店小蛋糕', cat: '下午茶', price: 22, taste: '甜' },
  { emoji: '🥐', item: '面包店新品', cat: '下午茶', price: 15, taste: '甜' },
  { emoji: '🍩', item: '甜甜圈 + 美式', cat: '下午茶', price: 20, taste: '甜' },
  { emoji: '🧁', item: '泡芙 + 拿铁', cat: '下午茶', price: 22, taste: '甜' },
  { emoji: '🥤', item: '瑞幸咖啡 + 点心', cat: '下午茶', price: 18, taste: '甜' },
  { emoji: '🍪', item: '曲奇 + 奶茶', cat: '下午茶', price: 15, taste: '甜' },
  { emoji: '🧊', item: '冰淇淋/冰沙', cat: '下午茶', price: 12, taste: '甜' },
  { emoji: '🥜', item: '坚果 + 酸奶', cat: '下午茶', price: 15, taste: '清淡' },
];

type FoodHistoryEntry = { item: string; date: string };

const PRICE_TIERS = [
  { key: '全部', label: '全部', icon: '🍽️' },
  { key: '省钱', label: '省钱 (<¥15)', icon: '💰' },
  { key: '正常', label: '正常 (¥15-30)', icon: '🍚' },
  { key: '奢侈', label: '奢侈 (>¥30)', icon: '🍖' },
];

const TASTE_FILTERS = ['全部', '清淡', '咸香', '微辣', '重口', '甜'];

const FoodSelector: React.FC = () => {
  const [idx, setIdx] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [displayIdx, setDisplayIdx] = useState(0);
  const [lastEaten, setLastEaten] = useState<string | null>(() => localStorage.getItem(SK.LAST_FOOD));

  // Persistent skip list (JSON array of item names)
  const [skipList, setSkipList] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(SK.SKIP_FOOD);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });

  // Recent 7-day food history
  const [history, setHistory] = useState<FoodHistoryEntry[]>(() => {
    try {
      const raw = localStorage.getItem('cl_food_history');
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });

  // Batch exclusion panel toggle
  const [showExclusions, setShowExclusions] = useState(false);

  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [activeCat, setActiveCat] = useState<string>('全部');
  const [activePrice, setActivePrice] = useState<string>('全部');
  const [activeTaste, setActiveTaste] = useState<string>('全部');
  const [isSurprise, setIsSurprise] = useState(false);

  const rollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (rollRef.current) clearInterval(rollRef.current); }, []);

  const categories = useMemo(() => {
    const cats = new Set(FOODS.map(f => f.cat));
    return ['全部', ...Array.from(cats)];
  }, []);

  // Penalty map: recently eaten items get lower probability
  const recentPenalties = useMemo(() => {
    const map = new Map<string, number>();
    for (let i = 0; i < Math.min(history.length, 10); i++) {
      map.set(history[i].item, 10 - i);
    }
    return map;
  }, [history]);

  const toggleSkip = (item: string) => {
    setSkipList(prev => {
      const next = prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item];
      localStorage.setItem(SK.SKIP_FOOD, JSON.stringify(next));
      return next;
    });
  };

  const pushHistory = (item: string) => {
    const today = new Date().toISOString().slice(0, 10);
    const updated = [{ item, date: today }, ...history.filter(e => e.item !== item)].slice(0, 20);
    setHistory(updated);
    localStorage.setItem('cl_food_history', JSON.stringify(updated));
  };

  const getFilteredPool = (excludeNames: string[], effectiveCat: string): number[] => {
    let pool = FOODS.map((_, i) => i);
    if (effectiveCat !== '全部') pool = pool.filter(i => FOODS[i].cat === effectiveCat);
    if (activePrice === '省钱') pool = pool.filter(i => FOODS[i].price < 15);
    else if (activePrice === '正常') pool = pool.filter(i => FOODS[i].price >= 15 && FOODS[i].price <= 30);
    else if (activePrice === '奢侈') pool = pool.filter(i => FOODS[i].price > 30);
    if (activeTaste !== '全部') pool = pool.filter(i => FOODS[i].taste === activeTaste);
    pool = pool.filter(i => !skipList.includes(FOODS[i].item));
    pool = pool.filter(i => !excludeNames.includes(FOODS[i].item));
    return pool;
  };

  // Weighted random: recent items get much lower probability
  const weightedPick = (pool: number[]): number => {
    if (pool.length === 0) return Math.floor(Math.random() * FOODS.length);
    const weights = pool.map(i => {
      const penalty = recentPenalties.get(FOODS[i].item) ?? 0;
      return Math.max(1, 10 - penalty * 2);
    });
    const total = weights.reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    for (let j = 0; j < pool.length; j++) {
      r -= weights[j];
      if (r <= 0) return pool[j];
    }
    return pool[pool.length - 1];
  };

  const rollExcluding = (excludeNames: string[]) => {
    if (isRolling) return;

    let effectiveCat = activeCat;
    if (isSurprise) {
      const catOptions = FOODS.map(f => f.cat).filter((v, i, a) => a.indexOf(v) === i);
      effectiveCat = catOptions[Math.floor(Math.random() * catOptions.length)];
    }

    const candidatePool = getFilteredPool(excludeNames, effectiveCat);

    setIsRolling(true);
    rollRef.current = setInterval(() => {
      setDisplayIdx(Math.floor(Math.random() * FOODS.length));
    }, 80);
    setTimeout(() => {
      clearInterval(rollRef.current!);
      const final = candidatePool.length > 0
        ? weightedPick(candidatePool)
        : weightedPick(FOODS.map((_, i) => i));
      setIdx(final);
      setDisplayIdx(final);
      setIsRolling(false);
      const name = FOODS[final].item;
      localStorage.setItem(SK.LAST_FOOD, name);
      setLastEaten(name);
      pushHistory(name);
    }, 1400);
  };

  const roll = () => rollExcluding(Array.from(recentPenalties.keys()).slice(0, 5));

  const skipCurrent = () => {
    if (idx === null) return;
    const next = skipList.includes(FOODS[idx].item) ? skipList : [...skipList, FOODS[idx].item];
    localStorage.setItem(SK.SKIP_FOOD, JSON.stringify(next));
    setSkipList(next);
    rollExcluding([...Array.from(recentPenalties.keys()).slice(0, 5), FOODS[idx].item]);
  };

  const current = FOODS[isRolling ? displayIdx : (idx ?? displayIdx)];
  const skipCount = skipList.length;

  return (
    <div className="bg-white rounded-[24px] border border-brand-border/10 shadow-sm p-6 flex flex-col h-full min-h-[420px]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col gap-1">
          <p className="text-[10px] font-bold text-brand-gray/50 uppercase tracking-[0.15em]">Food Selector</p>
          <span className="text-xs font-bold text-brand-dark">今天吃什么 · {FOODS.length} 种选择</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-brand-offwhite flex items-center justify-center">
          <Utensils size={13} className="text-brand-gray" />
        </div>
      </div>

      {lastEaten && idx === null && (
        <p className="text-[10px] text-brand-gray/40 font-medium mb-1 text-center">上次吃了：{lastEaten}</p>
      )}

      {/* Filters: category + price + taste */}
      <div className="mb-3 space-y-2">
        {/* Category row */}
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map(cat => (
            <button key={cat} onClick={() => { setActiveCat(cat); setIsSurprise(false); }}
              className={cn(
                'shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all',
                activeCat === cat && !isSurprise
                  ? 'bg-brand-dark text-white border-brand-dark'
                  : 'bg-brand-offwhite text-brand-gray/50 border-brand-border/10 hover:text-brand-dark'
              )}>
              {cat}
            </button>
          ))}
          <button onClick={() => { setIsSurprise(!isSurprise); setActiveCat('全部'); }}
            className={cn(
              'shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all',
              isSurprise
                ? 'bg-amber-400 text-amber-900 border-amber-300'
                : 'bg-brand-offwhite text-brand-gray/50 border-brand-border/10 hover:text-brand-dark'
            )}>
            🎲 盲选品类
          </button>
        </div>
        {/* Price tier row */}
        <div className="flex gap-1">
          {PRICE_TIERS.map(t => (
            <button key={t.key} onClick={() => setActivePrice(t.key)}
              className={cn(
                'flex-1 py-1 rounded-lg text-[9px] font-bold border transition-all',
                activePrice === t.key
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-brand-offwhite text-brand-gray/40 border-brand-border/10 hover:text-brand-gray'
              )}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
        {/* Taste filter row */}
        <div className="flex gap-1">
          {TASTE_FILTERS.map(t => (
            <button key={t} onClick={() => setActiveTaste(t)}
              className={cn(
                'flex-1 py-1 rounded-lg text-[9px] font-bold border transition-all',
                activeTaste === t
                  ? 'bg-brand-dark text-white border-brand-dark'
                  : 'bg-brand-offwhite text-brand-gray/40 border-brand-border/10 hover:text-brand-gray'
              )}>
              {t === '清淡' ? '🥬' : t === '咸香' ? '🧂' : t === '微辣' ? '🌶️' : t === '重口' ? '🔥' : t === '甜' ? '🍬' : '🍽️'} {t}
            </button>
          ))}
        </div>
      </div>

      {/* Recent history */}
      {history.length > 1 && idx === null && (
        <div className="mb-2 px-1">
          <p className="text-[9px] font-bold text-brand-gray/30 uppercase tracking-widest mb-1">最近吃过（自动降低概率）</p>
          <div className="flex gap-1.5 flex-wrap">
            {history.slice(0, 6).map((e, i) => {
              const food = FOODS.find(f => f.item === e.item);
              return (
                <span key={i} title={e.date} className="text-[10px] px-1.5 py-0.5 rounded bg-brand-offwhite text-brand-gray/50 cursor-help">
                  {food ? food.emoji : '🍽️'} {e.item}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Main display */}
      <div className="flex-grow flex flex-col items-center justify-center gap-3">
        <div className="w-20 h-20 bg-brand-offwhite border border-brand-border/10 rounded-[24px] flex items-center justify-center overflow-hidden">
          <span className={cn('text-3xl transition-all duration-75', isRolling && 'scale-95 opacity-50 blur-[1px]')}>
            {current.emoji}
          </span>
        </div>

        <div className="h-14 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {!isRolling && idx !== null && (
              <motion.div key={idx} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="text-center">
                <p className="text-sm font-black text-brand-dark">{FOODS[idx].item}</p>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-brand-offwhite text-brand-gray/60 font-bold">
                    {FOODS[idx].cat}
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 font-bold">
                    ¥{FOODS[idx].price}
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-orange-50 text-orange-500 font-bold">
                    {FOODS[idx].taste}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {idx === null && !isRolling && (
            <p className="text-[11px] font-bold text-brand-gray/50 tracking-wider text-center">
              {isSurprise ? '🎲 随机品类 + 随机选择' : '听天由命'}
              {recentPenalties.size > 0 && (
                <span className="text-brand-gray/30 text-[10px] block mt-0.5">最近吃过的概率更低</span>
              )}
            </p>
          )}
        </div>
      </div>

      {/* Exclusion panel */}
      <AnimatePresence>
        {showExclusions && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="mb-3 overflow-hidden">
            <div className="bg-brand-offwhite rounded-2xl p-3 border border-brand-border/10 max-h-[120px] overflow-y-auto">
              <p className="text-[9px] font-bold text-brand-gray/40 uppercase tracking-widest mb-2">不想吃（点选排除）</p>
              <div className="flex gap-1.5 flex-wrap">
                {FOODS.map(f => {
                  const skipped = skipList.includes(f.item);
                  return (
                    <button key={f.item} onClick={() => toggleSkip(f.item)}
                      className={cn(
                        'px-2 py-1 rounded-lg text-[10px] font-bold border transition-all',
                        skipped
                          ? 'bg-red-50 text-red-500 border-red-200 line-through opacity-60'
                          : 'bg-white text-brand-gray/70 border-brand-border/20 hover:border-brand-dark/30'
                      )}>
                      {f.emoji} {f.item}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-4 flex gap-2">
        <motion.button whileTap={{ scale: 0.96 }} onClick={roll} disabled={isRolling}
          className="flex-1 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 bg-brand-dark text-white shadow-sm disabled:opacity-50">
          {isRolling ? <Sparkles size={13} className="animate-spin" /> : <RefreshCw size={11} />}
          {isRolling ? '随机中...' : idx !== null ? '再来一个' : '帮我决定'}
        </motion.button>
        <motion.button whileTap={{ scale: 0.96 }} onClick={() => setShowExclusions(!showExclusions)}
          className={cn(
            'px-3 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1 border',
            showExclusions
              ? 'bg-red-50 text-red-500 border-red-200'
              : 'bg-brand-offwhite text-brand-gray border-brand-border/10 hover:text-brand-dark'
          )}>
          {skipCount > 0 ? <><X size={11} /> {skipCount}项</> : <><X size={11} /> 排除</>}
        </motion.button>
        {idx !== null && !isRolling && (
          <motion.button whileTap={{ scale: 0.96 }} onClick={skipCurrent}
            className="px-3 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1 bg-brand-offwhite text-brand-gray border border-brand-border/10 hover:text-red-500">
            <ThumbsDown size={11} />
            换一个
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
  const [salary, setSalary] = useState(() => loadNum(SK.SALARY, 6000));

  useEffect(() => subscribeLocalNumber(LOCAL_NUMBER_KEYS.salary, 6000, setSalary), []);
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
  const [count, setCount] = useState(() => loadNum(LOCAL_NUMBER_KEYS.touchFishCounter, 0));
  const [cooldownLeft, setCooldownLeft] = useState(0);
  const cooldownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const COOLDOWN_SEC = 30;

  useEffect(() => subscribeLocalNumber(LOCAL_NUMBER_KEYS.touchFishCounter, 0, setCount), []);

  useEffect(() => {
    if (cooldownLeft <= 0) return;
    const t = setInterval(() => setCooldownLeft((c) => (c <= 1 ? 0 : c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldownLeft > 0]);

  const handleTouchFish = () => {
    if (cooldownLeft > 0) return;
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
    setCooldownLeft(COOLDOWN_SEC);
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

      <motion.button whileTap={cooldownLeft > 0 ? undefined : { scale: 0.96 }}
        disabled={cooldownLeft > 0}
        onClick={handleTouchFish}
        className={cn(
          'w-full py-3.5 rounded-2xl text-xs font-bold transition-all shadow-sm flex justify-center items-center border',
          cooldownLeft > 0
            ? 'bg-white/20 text-white/40 border-white/10 cursor-not-allowed'
            : 'bg-brand-dark text-white border-brand-dark'
        )}>
        <Fish size={14} className="mr-1.5" />
        {cooldownLeft > 0 ? `冷却中 ${cooldownLeft}s` : '摸一下'}
      </motion.button>
      <EarnedTodayBadge type="touch_fish" label="今天摸鱼赚了" />
    </div>
  );
};

// ─── MODULE 5c · 喝咖啡 ──────────────────────────────────────────────────────
const CoffeeModule: React.FC = () => {
  const toast = useToast();
  const [count, setCount] = useState(() => loadNum(LOCAL_NUMBER_KEYS.coffeeCounter, 0));
  const [cooldownLeft, setCooldownLeft] = useState(0);
  const cooldownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const COOLDOWN_SEC = 60;

  useEffect(() => subscribeLocalNumber(LOCAL_NUMBER_KEYS.coffeeCounter, 0, setCount), []);

  useEffect(() => {
    if (cooldownLeft <= 0) return;
    const t = setInterval(() => setCooldownLeft((c) => (c <= 1 ? 0 : c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldownLeft > 0]);

  const handleDrinkCoffee = () => {
    if (cooldownLeft > 0) return;
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
    setCooldownLeft(COOLDOWN_SEC);
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

      <motion.button whileTap={cooldownLeft > 0 ? undefined : { scale: 0.96 }}
        disabled={cooldownLeft > 0}
        onClick={handleDrinkCoffee}
        className={cn(
          'w-full py-3.5 rounded-2xl text-xs font-bold transition-all shadow-sm flex justify-center items-center border',
          cooldownLeft > 0
            ? 'bg-white/20 text-white/40 border-white/10 cursor-not-allowed'
            : 'bg-brand-dark text-white border-brand-dark'
        )}>
        <Coffee size={14} className="mr-1.5" />
        {cooldownLeft > 0 ? `冷却中 ${cooldownLeft}s` : '喝一杯'}
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
        <div className="md:col-span-2 lg:col-span-3 min-h-[320px]">
          <ApexGuaEntry />
        </div>
        <div className="md:col-span-2 lg:col-span-3 min-h-[320px]">
          <GrievanceGameEntry />
        </div>
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
