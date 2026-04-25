import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Settings, LogOut, ChevronRight, Briefcase,
  Coffee, Fish, Timer, Flame, Heart, MessageSquare, Info,
  Wallet, Sparkles, X, Check, Users,
} from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import InitialBadge from '../components/common/InitialBadge';
import { getAuthSession, clearAuthSession } from '../services/authService';
import { apiService } from '../services/api';
import { cn } from '../../lib/utils';
import { earnLossStore } from '../../lib/earnLossStore';
import {
  LOCAL_NUMBER_KEYS,
  readLocalNumber,
  writeLocalNumber,
  subscribeLocalNumber,
} from '../../lib/localSignals';

const SK = {
  WORK_START: 'cl_work_start',
  WORK_END:   'cl_work_end',
  FOCUS_SESSIONS: 'cl_focus_sessions',
};

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const authSession = getAuthSession();
  const isLoggedIn = authSession !== null && authSession.loginMethod !== 'demo';

  // ─── Live data ──────────────────────────────────────────────
  const [summary, setSummary] = useState(() => earnLossStore.getTodaySummary());
  const [salary, setSalary] = useState(() => readLocalNumber(LOCAL_NUMBER_KEYS.salary, 6000));
  const [touchFish, setTouchFish] = useState(() => readLocalNumber(LOCAL_NUMBER_KEYS.touchFishCounter, 0));
  const [coffee, setCoffee] = useState(() => readLocalNumber(LOCAL_NUMBER_KEYS.coffeeCounter, 0));
  const [focusSessions, setFocusSessions] = useState(() => {
    const raw = localStorage.getItem(SK.FOCUS_SESSIONS);
    const v = Number(raw);
    return !isNaN(v) ? v : 0;
  });
  const [workStart, setWorkStart] = useState(() => localStorage.getItem(SK.WORK_START) || '09:00');
  const [workEnd, setWorkEnd] = useState(() => localStorage.getItem(SK.WORK_END) || '17:00');

  const [showWageEditor, setShowWageEditor] = useState(false);
  const [draft, setDraft] = useState({ salary: String(salary), start: workStart, end: workEnd });

  useEffect(() => earnLossStore.subscribe(setSummary), []);
  useEffect(() => subscribeLocalNumber(LOCAL_NUMBER_KEYS.salary, 6000, setSalary), []);
  useEffect(() => subscribeLocalNumber(LOCAL_NUMBER_KEYS.touchFishCounter, 0, setTouchFish), []);
  useEffect(() => subscribeLocalNumber(LOCAL_NUMBER_KEYS.coffeeCounter, 0, setCoffee), []);

  const netToday = summary.earnTotal - summary.lossTotal;

  const handleLogout = async () => {
    try { await apiService.logout(); } catch { /* ignore */ }
    clearAuthSession();
    navigate('/', { replace: true });
  };

  const openWageEditor = () => {
    setDraft({ salary: String(salary), start: workStart, end: workEnd });
    setShowWageEditor(true);
  };

  const saveWageEditor = () => {
    const v = Number(draft.salary);
    if (v > 0) {
      writeLocalNumber(LOCAL_NUMBER_KEYS.salary, v);
      setSalary(v);
    }
    localStorage.setItem(SK.WORK_START, draft.start);
    localStorage.setItem(SK.WORK_END, draft.end);
    setWorkStart(draft.start);
    setWorkEnd(draft.end);
    setShowWageEditor(false);
  };

  const hourlyRate = ((salary / 22) / 8).toFixed(1);

  return (
    <AppLayout title="我的" theme="default">
      <div className="min-h-[calc(100dvh-8rem)] bg-[radial-gradient(circle_at_top_left,rgba(17,24,39,0.06),transparent_34%),linear-gradient(180deg,#ffffff_0%,#f6f7f9_100%)] pb-10">
        <div className="max-w-5xl mx-auto px-5 sm:px-6 pt-6 sm:pt-10 space-y-5">

          {/* ─── Identity card ──────────────────────────────── */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-[32px] bg-white/90 p-6 sm:p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] border border-white/80"
          >
            <div className="absolute -top-10 -right-10 h-48 w-48 rounded-full bg-brand-dark/[0.04] blur-2xl pointer-events-none" />
            <div className="absolute top-0 right-0 p-8 opacity-[0.05] pointer-events-none">
              <Sparkles size={160} />
            </div>

            <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4 min-w-0">
              <InitialBadge
                label={authSession?.user?.nickname?.[0] || '我'}
                className="h-16 w-16 text-2xl border border-brand-border/20 shadow-sm"
              />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-brand-gray/60 uppercase tracking-[0.22em] mb-1">
                  APEX Profile · {isLoggedIn ? 'Signed In' : 'Guest'}
                </p>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-brand-dark truncate">
                  {authSession?.user?.nickname || '未登录用户'}
                </h1>
                <p className="text-xs text-brand-gray font-medium mt-1 truncate">
                  {authSession?.user?.email || '登录后云端同步你的记录'}
                </p>
              </div>
              </div>
              <button
                type="button"
                onClick={openWageEditor}
                className="shrink-0 rounded-2xl border border-brand-border/20 bg-brand-dark px-4 py-3 text-xs font-black text-white shadow-sm hover:bg-brand-dark/90 transition-colors"
              >
                调整工资与作息
              </button>
            </div>

            {!isLoggedIn && (
              <Link
                to="/login"
                className="relative z-10 mt-5 block w-full py-3 rounded-2xl bg-brand-dark text-white text-sm font-black text-center hover:bg-brand-dark/90 transition-colors"
              >
                登录 / 注册
              </Link>
            )}

            <div className="relative z-10 mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-2xl bg-brand-offwhite border border-brand-border/10 p-4">
                <p className="text-[9px] font-bold text-brand-gray/60 uppercase tracking-widest">月薪</p>
                <p className="text-xl font-black tabular-nums mt-1 text-brand-dark">¥{salary.toLocaleString()}</p>
              </div>
              <div className="rounded-2xl bg-brand-offwhite border border-brand-border/10 p-4">
                <p className="text-[9px] font-bold text-brand-gray/60 uppercase tracking-widest">时薪</p>
                <p className="text-xl font-black tabular-nums mt-1 text-brand-dark">¥{hourlyRate}</p>
              </div>
              <div className="rounded-2xl bg-brand-offwhite border border-brand-border/10 p-4">
                <p className="text-[9px] font-bold text-brand-gray/60 uppercase tracking-widest">作息</p>
                <p className="text-xl font-black tabular-nums mt-1 text-brand-dark">{workStart}–{workEnd}</p>
              </div>
            </div>
          </motion.section>

          {/* ─── Today's ledger ────────────────────────────── */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.5 }}
            className="bg-white rounded-[28px] border border-brand-border/20 shadow-sm p-5 sm:p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-brand-gray/60">Today</p>
                <h2 className="text-base sm:text-lg font-black text-brand-dark">今日战绩</h2>
              </div>
              <div className={cn(
                "px-3 py-1 rounded-full text-[11px] font-black tabular-nums border",
                netToday >= 0
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-red-50 text-red-600 border-red-200"
              )}>
                净 {netToday >= 0 ? '+' : ''}¥{netToday.toFixed(2)}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div className="rounded-2xl bg-emerald-50 border border-emerald-100 px-3 py-3">
                <p className="text-[9px] font-bold text-emerald-600/70 uppercase tracking-wider">赚</p>
                <p className="mt-1 text-base sm:text-lg font-black text-emerald-700 tabular-nums">¥{summary.earnTotal.toFixed(2)}</p>
              </div>
              <div className="rounded-2xl bg-red-50 border border-red-100 px-3 py-3">
                <p className="text-[9px] font-bold text-red-600/70 uppercase tracking-wider">亏</p>
                <p className="mt-1 text-base sm:text-lg font-black text-red-600 tabular-nums">¥{summary.lossTotal.toFixed(2)}</p>
              </div>
              <div className="rounded-2xl bg-amber-50 border border-amber-100 px-3 py-3">
                <p className="text-[9px] font-bold text-amber-700/70 uppercase tracking-wider">白干</p>
                <p className="mt-1 text-base sm:text-lg font-black text-amber-700 tabular-nums">¥{summary.overtimeLossTotal.toFixed(2)}</p>
              </div>
            </div>
          </motion.section>

          {/* ─── Lifetime counters ─────────────────────────── */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="bg-white rounded-[28px] border border-brand-border/20 shadow-sm p-5 sm:p-6"
          >
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-brand-gray/60 mb-4">Lifetime</p>
            <div className="grid grid-cols-3 gap-3">
              <StatBlock icon={<Timer size={14} />}  label="专注次数" value={focusSessions} />
              <StatBlock icon={<Fish size={14} />}   label="摸鱼次数" value={touchFish} />
              <StatBlock icon={<Coffee size={14} />} label="喝咖啡"   value={coffee} />
            </div>
          </motion.section>

          {/* ─── Settings list ─────────────────────────────── */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="bg-white rounded-[28px] border border-brand-border/20 shadow-sm overflow-hidden"
          >
            <RowButton
              icon={<Wallet size={16} />}
              title="工资 & 作息"
              meta={`¥${salary.toLocaleString()} · ${workStart}–${workEnd}`}
              onClick={openWageEditor}
            />
            <Divider />
            <RowLink
              icon={<Briefcase size={16} />}
              title="场景中心 · 对自己"
              meta="高效下班 / 专注 / To do / 摸鱼三件套"
              to="/scenarios?tab=self"
            />
            <Divider />
            <RowLink
              icon={<Heart size={16} />}
              title="PET_OS"
              meta="养一只属于打工人的宠物"
              to="/scenarios?tab=self"
            />
            <Divider />
            <RowLink
              icon={<Flame size={16} />}
              title="Skills 工具库"
              meta="全量业务技能仓库"
              to="/skills"
            />
            <Divider />
            <RowLink
              icon={<Users size={16} />}
              title="社区"
              meta="同行的声音都在这里"
              to="/bbs"
            />
          </motion.section>

          {/* ─── About & logout ────────────────────────────── */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="bg-white rounded-[28px] border border-brand-border/20 shadow-sm overflow-hidden"
          >
            <RowLink icon={<MessageSquare size={16} />} title="反馈建议" meta="说说你想要什么" to="/feedback" />
            <Divider />
            <RowLink icon={<Info size={16} />} title="关于 APEX" meta="APEX · v2.0" to="/about" />
            {isLoggedIn && (
              <>
                <Divider />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-red-50 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                    <LogOut size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-red-600">退出登录</p>
                  </div>
                </button>
              </>
            )}
          </motion.section>

          <p className="pt-4 pb-2 text-center text-[10px] font-mono tracking-wider text-brand-gray/40">
            APEX
          </p>
        </div>
      </div>

      {/* ─── Wage editor modal ──────────────────────────────── */}
      {showWageEditor && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4"
             onClick={() => setShowWageEditor(false)}>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-md bg-white rounded-t-[28px] sm:rounded-[28px] p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-brand-gray/60">Settings</p>
                <h3 className="text-lg font-black text-brand-dark">工资 & 作息</h3>
              </div>
              <button onClick={() => setShowWageEditor(false)} className="p-2 rounded-full hover:bg-brand-light-gray">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-brand-gray block mb-1.5">月薪 (元)</label>
                <input type="number" value={draft.salary}
                  onChange={(e) => setDraft((d) => ({ ...d, salary: e.target.value }))}
                  className="w-full bg-brand-offwhite border border-brand-border/20 rounded-2xl px-4 py-3 text-sm font-black text-brand-dark tabular-nums outline-none focus:border-brand-dark/40" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-brand-gray block mb-1.5">上班时间</label>
                  <input type="time" value={draft.start}
                    onChange={(e) => setDraft((d) => ({ ...d, start: e.target.value }))}
                    className="w-full bg-brand-offwhite border border-brand-border/20 rounded-2xl px-4 py-3 text-sm font-black text-brand-dark tabular-nums outline-none focus:border-brand-dark/40" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-brand-gray block mb-1.5">下班时间</label>
                  <input type="time" value={draft.end}
                    onChange={(e) => setDraft((d) => ({ ...d, end: e.target.value }))}
                    className="w-full bg-brand-offwhite border border-brand-border/20 rounded-2xl px-4 py-3 text-sm font-black text-brand-dark tabular-nums outline-none focus:border-brand-dark/40" />
                </div>
              </div>
            </div>

            <button onClick={saveWageEditor}
              className="w-full mt-6 py-3.5 rounded-2xl bg-brand-dark text-white text-sm font-black flex items-center justify-center gap-2 hover:bg-brand-dark/90 transition-colors">
              <Check size={14} /> 保存
            </button>
          </motion.div>
        </div>
      )}
    </AppLayout>
  );
};

// ─── Sub-components ────────────────────────────────────────────
const StatBlock: React.FC<{ icon: React.ReactNode; label: string; value: number }> = ({ icon, label, value }) => (
  <div className="rounded-2xl bg-brand-offwhite border border-brand-border/10 px-3 py-3.5">
    <div className="flex items-center gap-1.5 text-brand-gray mb-1.5">
      {icon}
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </div>
    <p className="text-xl sm:text-2xl font-black text-brand-dark tabular-nums leading-none">{value}</p>
  </div>
);

const RowLink: React.FC<{ icon: React.ReactNode; title: string; meta?: string; to: string }> = ({ icon, title, meta, to }) => (
  <Link to={to} className="w-full flex items-center gap-3 px-5 py-4 hover:bg-brand-offwhite transition-colors group">
    <div className="w-9 h-9 rounded-xl bg-brand-offwhite text-brand-dark flex items-center justify-center shrink-0 border border-brand-border/20">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-bold text-brand-dark truncate">{title}</p>
      {meta && <p className="text-[11px] text-brand-gray font-medium truncate mt-0.5">{meta}</p>}
    </div>
    <ChevronRight size={16} className="text-brand-gray/40 group-hover:text-brand-dark group-hover:translate-x-0.5 transition-all shrink-0" />
  </Link>
);

const RowButton: React.FC<{ icon: React.ReactNode; title: string; meta?: string; onClick: () => void }> = ({ icon, title, meta, onClick }) => (
  <button onClick={onClick} className="w-full flex items-center gap-3 px-5 py-4 hover:bg-brand-offwhite transition-colors group text-left">
    <div className="w-9 h-9 rounded-xl bg-brand-offwhite text-brand-dark flex items-center justify-center shrink-0 border border-brand-border/20">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-bold text-brand-dark truncate">{title}</p>
      {meta && <p className="text-[11px] text-brand-gray font-medium truncate mt-0.5">{meta}</p>}
    </div>
    <Settings size={14} className="text-brand-gray/40 group-hover:text-brand-dark transition-colors shrink-0" />
  </button>
);

const Divider = () => <div className="mx-5 h-px bg-brand-border/20" />;

export default Profile;
