import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useSpring, useTransform } from 'framer-motion';
import {
  Settings, LogOut, ChevronRight, Briefcase,
  Coffee, Fish, Timer, Flame, Heart, Info,
  Sparkles, X, Check, Users, Toilet, MoonStar, Sun,
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
import { getDayMode, getHolidayToday } from '../../lib/holidays';
import { getPetCompanionHidden, setPetCompanionHidden } from '../../components/pet/PetCompanion';

const SK = {
  WORK_START: 'cl_work_start',
  WORK_END:   'cl_work_end',
  FOCUS_SESSIONS: 'cl_focus_sessions',
};

// ─── 数字滚动动画 ─────────────────────────────────────────────
const AnimatedAmount: React.FC<{ value: number; prefix?: string; decimals?: number; className?: string }> = ({
  value, prefix = '¥', decimals = 2, className,
}) => {
  const spring = useSpring(value, { stiffness: 80, damping: 18 });
  const display = useTransform(spring, (v) => `${prefix}${v.toFixed(decimals)}`);
  useEffect(() => { spring.set(value); }, [value, spring]);
  return <motion.span className={cn('tabular-nums', className)}>{display}</motion.span>;
};

const AnimatedInt: React.FC<{ value: number; className?: string }> = ({ value, className }) => {
  const spring = useSpring(value, { stiffness: 100, damping: 20 });
  const display = useTransform(spring, (v) => Math.round(v).toString());
  useEffect(() => { spring.set(value); }, [value, spring]);
  return <motion.span className={cn('tabular-nums', className)}>{display}</motion.span>;
};

// ─── 心情寄语(根据时段 + 净赚) ──────────────────────────────
function getMoodLine(hour: number, net: number): string {
  if (net > 50) return '今天的你,在认真为自己上班。';
  if (net < -30) return '已经在为明天的你存信用了——别太用力。';
  if (hour < 7) return '天没亮就醒了,记得只属于你的清晨。';
  if (hour < 11) return '上午第一杯水,先于第一封邮件。';
  if (hour < 14) return '中午能眯五分钟,胜过下午所有咖啡。';
  if (hour < 18) return '快到下班点了,深呼吸,你比早上更值钱。';
  if (hour < 22) return '今天差不多就这样,明天的事明天再说。';
  return '夜深了,合上电脑也是一种生产力。';
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const authSession = getAuthSession();
  const isLoggedIn = authSession !== null && authSession.loginMethod !== 'demo';

  // ─── Live data ──────────────────────────────────────────────
  const [summary, setSummary] = useState(() => earnLossStore.getTodaySummary());
  const [salary, setSalary] = useState(() => readLocalNumber(LOCAL_NUMBER_KEYS.salary, 6000));
  const [touchFishCounter, setTouchFishCounter] = useState(() => readLocalNumber(LOCAL_NUMBER_KEYS.touchFishCounter, 0));
  const [coffeeCounter, setCoffeeCounter] = useState(() => readLocalNumber(LOCAL_NUMBER_KEYS.coffeeCounter, 0));
  const [focusSessions, setFocusSessions] = useState(() => {
    const raw = localStorage.getItem(SK.FOCUS_SESSIONS);
    const v = Number(raw);
    return !isNaN(v) ? v : 0;
  });
  const [workStart, setWorkStart] = useState(() => localStorage.getItem(SK.WORK_START) || '09:00');
  const [workEnd, setWorkEnd] = useState(() => localStorage.getItem(SK.WORK_END) || '17:00');

  const [showWageEditor, setShowWageEditor] = useState(false);
  const [draft, setDraft] = useState({ salary: String(salary), start: workStart, end: workEnd });
  const [petHidden, setPetHidden] = useState(() => getPetCompanionHidden());
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => earnLossStore.subscribe(setSummary), []);
  useEffect(() => subscribeLocalNumber(LOCAL_NUMBER_KEYS.salary, 6000, setSalary), []);
  useEffect(() => subscribeLocalNumber(LOCAL_NUMBER_KEYS.touchFishCounter, 0, setTouchFishCounter), []);
  useEffect(() => subscribeLocalNumber(LOCAL_NUMBER_KEYS.coffeeCounter, 0, setCoffeeCounter), []);
  useEffect(() => {
    const t = window.setInterval(() => {
      setNow(new Date());
      const raw = localStorage.getItem(SK.FOCUS_SESSIONS);
      const v = Number(raw);
      setFocusSessions(!isNaN(v) ? v : 0);
    }, 30_000);
    return () => window.clearInterval(t);
  }, []);

  const netToday = summary.earnTotal - summary.lossTotal;
  const hourlyRate = useMemo(() => +(((salary / 22) / 8).toFixed(1)), [salary]);
  const minuteRate = hourlyRate / 60;

  const dayMode = getDayMode(now);
  const holiday = getHolidayToday(now);

  const moodLine = useMemo(() => getMoodLine(now.getHours(), netToday), [now, netToday]);

  // 加班奖励折算: 每杯咖啡按 15 分钟摸鱼价值
  const coffeeImpliedEarn = summary.coffeeEarn || (summary.coffeeCount * minuteRate * 15);

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

  const togglePetHidden = () => {
    const next = !petHidden;
    setPetCompanionHidden(next);
    setPetHidden(next);
  };

  // ─── Aurora & 主题色根据情绪 ────────────────────────────────
  const auroraClass = useMemo(() => {
    if (dayMode === 'holiday') return 'from-pink-200/40 via-amber-100/30 to-transparent';
    if (dayMode === 'weekend') return 'from-amber-100/50 via-orange-50/30 to-transparent';
    if (netToday > 0) return 'from-emerald-100/50 via-teal-50/30 to-transparent';
    if (netToday < 0) return 'from-orange-100/50 via-rose-50/30 to-transparent';
    return 'from-slate-100/40 via-white to-transparent';
  }, [dayMode, netToday]);

  return (
    <AppLayout title="我的" theme="default">
      <div className="relative min-h-[calc(100dvh-8rem)] overflow-hidden bg-[#fbfbfd] pb-12">
        {/* Aurora */}
        <motion.div
          aria-hidden
          className={cn(
            'pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-gradient-to-b blur-2xl',
            auroraClass,
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
        />

        <div className="relative max-w-5xl mx-auto px-5 sm:px-6 pt-6 sm:pt-10 space-y-6">

          {/* ─── 节假日 / 周末 提示带 ─────────────────────── */}
          {dayMode !== 'workday' && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'flex items-center gap-3 rounded-2xl border px-4 py-3 text-[12px] font-bold',
                dayMode === 'holiday'
                  ? 'border-pink-200/70 bg-pink-50/80 text-pink-800'
                  : 'border-amber-200/70 bg-amber-50/80 text-amber-800',
              )}
            >
              <span className="text-lg">{holiday ? holiday.emoji : (dayMode === 'weekend' ? '🛋️' : '🎉')}</span>
              <div className="min-w-0">
                <p className="font-black truncate">
                  {holiday ? `今天 · ${holiday.name}` : '今天是周末'}
                </p>
                <p className="text-[11px] font-medium opacity-80 truncate">
                  {holiday ? holiday.vibe : '工资照领,地球继续转。'}
                </p>
              </div>
            </motion.div>
          )}

          {/* ─── 身份卡(精简) ──────────────────────────── */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-[28px] border border-white/60 bg-white/75 p-6 shadow-[0_24px_80px_-30px_rgba(15,23,42,0.18)] backdrop-blur-xl sm:p-7"
          >
            <div className="absolute -top-12 -right-10 h-44 w-44 rounded-full bg-brand-dark/[0.04] blur-2xl pointer-events-none" />

            <div className="relative z-10 flex items-start gap-4">
              <InitialBadge
                label={authSession?.user?.nickname?.[0] || '我'}
                className="h-14 w-14 text-xl border border-brand-border/20 shadow-sm"
              />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black tracking-[0.22em] uppercase text-brand-gray/60 mb-1">
                  APEX · {isLoggedIn ? 'SIGNED IN' : 'GUEST'}
                </p>
                <h1 className="text-2xl font-black tracking-tight text-brand-dark truncate">
                  {authSession?.user?.nickname || '未登录用户'}
                </h1>
                <p className="text-[12px] text-brand-gray font-medium mt-1.5 leading-relaxed">
                  {moodLine}
                </p>
              </div>
              <button
                type="button"
                onClick={openWageEditor}
                aria-label="调整工资与作息"
                className="shrink-0 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-brand-border/30 bg-white text-brand-dark hover:bg-brand-light-gray transition-colors"
              >
                <Settings size={15} />
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
          </motion.section>

          {/* ─── 今日战绩 Hero ──────────────────────────── */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.5 }}
            className={cn(
              'relative overflow-hidden rounded-[28px] border p-6 sm:p-8 backdrop-blur-xl shadow-[0_24px_80px_-30px_rgba(15,23,42,0.2)]',
              netToday >= 0
                ? 'bg-gradient-to-br from-emerald-50/90 via-white/70 to-white/60 border-emerald-100/70'
                : 'bg-gradient-to-br from-rose-50/90 via-white/70 to-white/60 border-rose-100/70',
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-gray/60">Today</p>
                <h2 className="text-base font-black text-brand-dark">今日战绩</h2>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-gray/60">时薪</p>
                <p className="text-[12px] font-black text-brand-dark tabular-nums">¥{hourlyRate.toFixed(1)}/h</p>
              </div>
            </div>

            {/* 净赚大字 */}
            <div className="mt-1">
              <p className="text-[11px] font-black tracking-[0.18em] uppercase text-brand-gray/70">
                {netToday >= 0 ? 'NET EARNED' : 'NET LOSS'}
              </p>
              <AnimatedAmount
                value={netToday}
                prefix={netToday >= 0 ? '+¥' : '-¥'}
                className={cn(
                  'block text-[44px] sm:text-[56px] font-black leading-none mt-1',
                  netToday >= 0 ? 'text-emerald-700' : 'text-rose-600',
                )}
                decimals={2}
              />
              <p className="mt-3 text-[12px] text-brand-gray font-medium">
                {netToday >= 0
                  ? `相当于额外赚回 ${Math.round(netToday / minuteRate || 0)} 分钟自由。`
                  : `今天为公司多干了 ${Math.round(Math.abs(netToday) / minuteRate || 0)} 分钟未付费时间。`}
              </p>
            </div>

            {/* chip 横滑 */}
            <div className="-mx-1 mt-5 flex gap-2 overflow-x-auto scrollbar-none">
              <Chip icon={<Fish size={11} />}    label="摸鱼"   value={touchFishCounter} unit="次" />
              <Chip icon={<Coffee size={11} />}  label="咖啡"   value={coffeeCounter}    unit="杯" />
              <Chip icon={<Timer size={11} />}   label="专注"   value={focusSessions}    unit="段" />
              <Chip icon={<Flame size={11} />}   label="加班"   value={summary.otMin}    unit="分" tone="warn" />
            </div>
          </motion.section>

          {/* ─── 爽点收益板 ─────────────────────────────── */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="grid grid-cols-2 gap-3"
          >
            <EarnTile
              icon={<Toilet size={14} />}
              tone="emerald"
              title="带薪拉屎"
              amount={summary.paidPoopEarn}
              meta={`${summary.paidPoopMin} 分钟 · ${summary.paidPoopCount} 次`}
              quip={summary.paidPoopMin > 0 ? '老板请客的卫生间时光。' : '今天还没去坐马桶赚钱。'}
            />
            <EarnTile
              icon={<Fish size={14} />}
              tone="cyan"
              title="摸鱼奖励"
              amount={summary.touchFishEarn}
              meta={`${summary.touchFishMin} 分钟 · ${summary.touchFishCount} 次`}
              quip={summary.touchFishMin > 0 ? '摸的不是鱼,是命运。' : '准备好你的第一条小鱼了吗?'}
            />
            <EarnTile
              icon={<Coffee size={14} />}
              tone="amber"
              title="咖啡回血"
              amount={coffeeImpliedEarn}
              meta={`${summary.coffeeCount} 杯`}
              quip={summary.coffeeCount > 0 ? '续命液体,折现成你的休息。' : '别等第三杯才记得喝水。'}
            />
            <EarnTile
              icon={<Flame size={14} />}
              tone="rose"
              title="加班亏损"
              amount={-summary.overtimeLossTotal}
              meta={`白干 ${summary.otMin} 分钟`}
              quip={summary.overtimeLossTotal > 0 ? '今晚下班一定要走出门。' : '今天没亏,挺好。'}
            />
          </motion.section>

          {/* ─── 入口列表 ────────────────────────────────── */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="bg-white/80 backdrop-blur-xl rounded-[24px] border border-white/60 shadow-sm overflow-hidden"
          >
            <RowLink
              icon={<Briefcase size={16} />}
              title="场景中心"
              meta="对自己 / 对客户 / 对审核"
              to="/scenarios?tab=self"
            />
            <Divider />
            <RowButton
              icon={<Heart size={16} />}
              title="我的小东西"
              meta={petHidden ? '休眠中,点这里把它请回来' : '正在右下角陪着你'}
              onClick={togglePetHidden}
              actionLabel={petHidden ? '唤回' : '收起'}
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
            <Divider />
            <RowLink
              icon={<Sparkles size={16} />}
              title="关于 APEX"
              meta="信仰、声音、想法,都在这里"
              to="/about"
            />
          </motion.section>

          {/* ─── 折叠:档案 & 设置 ──────────────────────── */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="bg-white/70 backdrop-blur-xl rounded-[24px] border border-white/60 shadow-sm overflow-hidden"
          >
            <details className="group">
              <summary className="flex cursor-pointer items-center gap-3 px-5 py-4 list-none hover:bg-brand-offwhite/60 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-brand-offwhite text-brand-dark flex items-center justify-center border border-brand-border/20">
                  {now.getHours() < 18 ? <Sun size={16} /> : <MoonStar size={16} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-brand-dark">档案 & 设置</p>
                  <p className="text-[11px] text-brand-gray font-medium mt-0.5">
                    ¥{salary.toLocaleString()} · {workStart}–{workEnd}
                  </p>
                </div>
                <ChevronRight size={16} className="text-brand-gray/40 transition-transform group-open:rotate-90" />
              </summary>

              <div className="px-5 pb-5 pt-1 space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <FactCard label="月薪" value={`¥${salary.toLocaleString()}`} />
                  <FactCard label="时薪" value={`¥${hourlyRate.toFixed(1)}`} />
                  <FactCard label="作息" value={`${workStart}–${workEnd}`} />
                </div>
                <button
                  onClick={openWageEditor}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-brand-border/30 bg-white px-4 py-3 text-sm font-bold text-brand-dark hover:bg-brand-light-gray transition-colors"
                >
                  <Settings size={14} /> 调整工资与作息
                </button>
                <Link
                  to="/feedback"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-brand-border/30 bg-white px-4 py-3 text-sm font-bold text-brand-dark hover:bg-brand-light-gray transition-colors"
                >
                  <Info size={14} /> 反馈建议
                </Link>
                {isLoggedIn && (
                  <button
                    onClick={handleLogout}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-200/70 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600 hover:bg-rose-100 transition-colors"
                  >
                    <LogOut size={14} /> 退出登录
                  </button>
                )}
              </div>
            </details>
          </motion.section>

          <p className="pt-4 pb-2 text-center text-[10px] font-mono tracking-[0.3em] text-brand-gray/40">
            APEX · 替你站在你这边
          </p>
        </div>
      </div>

      {/* ─── 工资作息抽屉 ────────────────────────────────── */}
      {showWageEditor && (
        <div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4"
          onClick={() => setShowWageEditor(false)}
        >
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
                <input
                  type="number" value={draft.salary}
                  onChange={(e) => setDraft((d) => ({ ...d, salary: e.target.value }))}
                  className="w-full bg-brand-offwhite border border-brand-border/20 rounded-2xl px-4 py-3 text-sm font-black text-brand-dark tabular-nums outline-none focus:border-brand-dark/40"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-brand-gray block mb-1.5">上班时间</label>
                  <input
                    type="time" value={draft.start}
                    onChange={(e) => setDraft((d) => ({ ...d, start: e.target.value }))}
                    className="w-full bg-brand-offwhite border border-brand-border/20 rounded-2xl px-4 py-3 text-sm font-black text-brand-dark tabular-nums outline-none focus:border-brand-dark/40"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-brand-gray block mb-1.5">下班时间</label>
                  <input
                    type="time" value={draft.end}
                    onChange={(e) => setDraft((d) => ({ ...d, end: e.target.value }))}
                    className="w-full bg-brand-offwhite border border-brand-border/20 rounded-2xl px-4 py-3 text-sm font-black text-brand-dark tabular-nums outline-none focus:border-brand-dark/40"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={saveWageEditor}
              className="w-full mt-6 py-3.5 rounded-2xl bg-brand-dark text-white text-sm font-black flex items-center justify-center gap-2 hover:bg-brand-dark/90 transition-colors"
            >
              <Check size={14} /> 保存
            </button>
          </motion.div>
        </div>
      )}
    </AppLayout>
  );
};

// ─── 子组件 ─────────────────────────────────────────────────
const Chip: React.FC<{ icon: React.ReactNode; label: string; value: number; unit: string; tone?: 'default' | 'warn' }> = ({
  icon, label, value, unit, tone = 'default',
}) => (
  <div className={cn(
    'shrink-0 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold',
    tone === 'warn'
      ? 'bg-amber-50 border-amber-200/70 text-amber-700'
      : 'bg-white/80 border-brand-border/30 text-brand-dark',
  )}>
    {icon}
    <span className="opacity-70">{label}</span>
    <AnimatedInt value={value} className="text-[12px] font-black" />
    <span className="opacity-60">{unit}</span>
  </div>
);

const TONE_MAP: Record<string, { bg: string; ring: string; text: string; iconBg: string; iconText: string }> = {
  emerald: { bg: 'bg-emerald-50/80', ring: 'border-emerald-100', text: 'text-emerald-700', iconBg: 'bg-emerald-100', iconText: 'text-emerald-600' },
  cyan:    { bg: 'bg-cyan-50/80',    ring: 'border-cyan-100',    text: 'text-cyan-700',    iconBg: 'bg-cyan-100',    iconText: 'text-cyan-600' },
  amber:   { bg: 'bg-amber-50/80',   ring: 'border-amber-100',   text: 'text-amber-700',   iconBg: 'bg-amber-100',   iconText: 'text-amber-600' },
  rose:    { bg: 'bg-rose-50/80',    ring: 'border-rose-100',    text: 'text-rose-700',    iconBg: 'bg-rose-100',    iconText: 'text-rose-600' },
};

const EarnTile: React.FC<{
  icon: React.ReactNode;
  tone: 'emerald' | 'cyan' | 'amber' | 'rose';
  title: string;
  amount: number;
  meta: string;
  quip: string;
}> = ({ icon, tone, title, amount, meta, quip }) => {
  const t = TONE_MAP[tone];
  const isLoss = amount < 0;
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={cn(
        'rounded-[20px] border backdrop-blur-xl p-4 cursor-default',
        t.bg, t.ring,
      )}
    >
      <div className="flex items-center justify-between">
        <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center', t.iconBg, t.iconText)}>
          {icon}
        </div>
        <p className="text-[9px] font-black uppercase tracking-widest text-brand-gray/60">{meta}</p>
      </div>
      <p className="mt-3 text-[11px] font-bold text-brand-dark/70">{title}</p>
      <AnimatedAmount
        value={Math.abs(amount)}
        prefix={isLoss ? '-¥' : '¥'}
        className={cn('block text-xl font-black mt-0.5', t.text)}
      />
      <p className="mt-1.5 text-[10.5px] leading-snug text-brand-gray/80 line-clamp-2">{quip}</p>
    </motion.div>
  );
};

const FactCard: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="rounded-2xl bg-brand-offwhite border border-brand-border/15 px-3 py-3">
    <p className="text-[9px] font-bold text-brand-gray/60 uppercase tracking-widest">{label}</p>
    <p className="text-[14px] font-black tabular-nums mt-1 text-brand-dark truncate">{value}</p>
  </div>
);

const RowLink: React.FC<{ icon: React.ReactNode; title: string; meta?: string; to: string }> = ({ icon, title, meta, to }) => (
  <Link to={to} className="w-full flex items-center gap-3 px-5 py-4 hover:bg-brand-offwhite/70 transition-colors group">
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

const RowButton: React.FC<{
  icon: React.ReactNode;
  title: string;
  meta?: string;
  onClick: () => void;
  actionLabel?: string;
}> = ({ icon, title, meta, onClick, actionLabel }) => (
  <button onClick={onClick} className="w-full flex items-center gap-3 px-5 py-4 hover:bg-brand-offwhite/70 transition-colors group text-left">
    <div className="w-9 h-9 rounded-xl bg-brand-offwhite text-brand-dark flex items-center justify-center shrink-0 border border-brand-border/20">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-bold text-brand-dark truncate">{title}</p>
      {meta && <p className="text-[11px] text-brand-gray font-medium truncate mt-0.5">{meta}</p>}
    </div>
    {actionLabel && (
      <span className="text-[11px] font-black uppercase tracking-wider text-brand-gray/60 group-hover:text-brand-dark transition-colors shrink-0">
        {actionLabel}
      </span>
    )}
  </button>
);

const Divider = () => <div className="mx-5 h-px bg-brand-border/20" />;

export default Profile;
