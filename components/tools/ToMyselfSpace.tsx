import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Solar } from 'lunar-javascript';
import { cn } from '../../lib/utils';

// ─────────────────────────────────────────────
// 🎨 游戏化 UI 基础组件
// ─────────────────────────────────────────────

/** 糖果风卡片 */
const CandyCard = ({
  children,
  className,
  gradient,
}: {
  children: React.ReactNode;
  className?: string;
  gradient: string;
}) => (
  <motion.div
    whileHover={{ y: -4, scale: 1.01 }}
    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    className={cn(
      'relative rounded-3xl overflow-hidden shadow-lg border-2 border-white/60',
      gradient,
      className,
    )}
  >
    {/* 高光 */}
    <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/30 to-transparent pointer-events-none rounded-t-3xl" />
    {children}
  </motion.div>
);

/** 游戏风进度条 */
const GameBar = ({
  value,
  max,
  color,
  glow,
  label,
}: {
  value: number;
  max: number;
  color: string;
  glow: string;
  label?: string;
}) => {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between text-[10px] font-bold mb-1 text-white/70">
          <span>{label}</span>
          <span>{pct.toFixed(0)}%</span>
        </div>
      )}
      <div className="w-full h-4 bg-black/20 rounded-full overflow-hidden border border-white/20 relative">
        <motion.div
          className={cn('h-full rounded-full', color)}
          style={{ boxShadow: `0 0 12px ${glow}` }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, type: 'spring' }}
        />
        {/* 高光条 */}
        <div className="absolute top-0.5 left-1 right-1 h-1 bg-white/30 rounded-full pointer-events-none" />
      </div>
    </div>
  );
};

/** 闪烁宝石标签 */
const GemBadge = ({ children, color }: { children: React.ReactNode; color: string }) => (
  <motion.span
    animate={{ scale: [1, 1.05, 1] }}
    transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
    className={cn(
      'inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black text-white shadow-md border border-white/30',
      color,
    )}
  >
    {children}
  </motion.span>
);

// ─────────────────────────────────────────────
// 💰 模块 1：高效下班清醒系统（重设计）
// ─────────────────────────────────────────────
const SalaryMonitor = () => {
  const [monthlySalary, setMonthlySalary] = useState(
    () => Number(localStorage.getItem('cl_monthly_salary')) || 6200,
  );
  const [now, setNow] = useState(new Date());
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState(String(monthlySalary));
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    localStorage.setItem('cl_monthly_salary', monthlySalary.toString());
  }, [monthlySalary]);

  useEffect(() => {
    intervalRef.current = setInterval(() => setNow(new Date()), 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const workDays = 22;
  const dailySalary = monthlySalary / workDays;
  const currMin = now.getHours() * 60 + now.getMinutes();
  const currSec = now.getSeconds();
  const start = 9 * 60;
  const end = 17 * 60;

  const isBeforeWork = currMin < start;
  const isOvertime = currMin >= end;
  const workTotal = end - start; // 480 min

  // 今日已赚（秒级精度）
  const workedSec = isBeforeWork
    ? 0
    : isOvertime
    ? workTotal * 60
    : (currMin - start) * 60 + currSec;
  const dailyEarned = (dailySalary * workedSec) / (workTotal * 60);

  // 月薪折算
  const annualSalary = monthlySalary * 12;
  const hourlyRate = dailySalary / 8;
  const minuteRate = hourlyRate / 60;

  // 进度百分比
  const progress = isBeforeWork ? 0 : isOvertime ? 100 : (workedSec / (workTotal * 60)) * 100;

  // 下班倒计时
  const remainSec = isOvertime ? 0 : (end - currMin) * 60 - currSec;
  const remH = Math.floor(remainSec / 3600);
  const remM = Math.floor((remainSec % 3600) / 60);
  const remS = remainSec % 60;

  // 加班亏损
  const overtimeSec = isOvertime ? (currMin - end) * 60 + currSec : 0;
  const overtimeCost = (overtimeSec / 3600) * hourlyRate;
  const overtimeH = Math.floor(overtimeSec / 3600);
  const overtimeM = Math.floor((overtimeSec % 3600) / 60);

  // 颜色方案
  const barColor = isOvertime
    ? 'bg-gradient-to-r from-red-400 to-pink-500'
    : progress > 75
    ? 'bg-gradient-to-r from-yellow-400 to-orange-400'
    : 'bg-gradient-to-r from-green-400 to-emerald-400';

  const barGlow = isOvertime ? '#f87171' : progress > 75 ? '#fb923c' : '#34d399';

  const handleSalaryConfirm = () => {
    const v = Number(inputVal);
    if (v > 0) setMonthlySalary(v);
    setEditing(false);
  };

  return (
    <CandyCard gradient="bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]" className="p-5 flex flex-col h-full">
      {/* 标题行 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">💼</span>
          <span className="font-black text-white text-sm tracking-wide">高效下班清醒系统</span>
        </div>
        {isOvertime ? (
          <GemBadge color="bg-red-500">🔴 加班中</GemBadge>
        ) : isBeforeWork ? (
          <GemBadge color="bg-indigo-500">🌙 未上班</GemBadge>
        ) : (
          <GemBadge color="bg-emerald-500">🟢 上班中</GemBadge>
        )}
      </div>

      {/* 核心数字：今日已赚 */}
      <div className="bg-black/30 rounded-2xl p-4 mb-4 text-center border border-white/10 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-yellow-400/60"
              style={{ left: `${15 + i * 14}%`, top: '20%' }}
              animate={{ y: [0, -8, 0], opacity: [0.4, 1, 0.4] }}
              transition={{ repeat: Infinity, duration: 1.5 + i * 0.2, delay: i * 0.15 }}
            />
          ))}
        </div>
        <p className="text-[10px] font-bold text-yellow-400/60 uppercase tracking-widest mb-1">今日已赚（实时）</p>
        <motion.p
          key={Math.floor(dailyEarned * 10)}
          initial={{ scale: 1.1, color: '#fbbf24' }}
          animate={{ scale: 1, color: '#ffffff' }}
          transition={{ duration: 0.3 }}
          className="text-4xl font-black text-white"
        >
          ¥{dailyEarned.toFixed(2)}
        </motion.p>
        <p className="text-[10px] text-white/40 mt-1 font-medium">每分钟 ¥{minuteRate.toFixed(3)} · 时薪 ¥{hourlyRate.toFixed(1)}</p>
      </div>

      {/* 进度条：工作进度 */}
      <div className="mb-4">
        <div className="flex justify-between text-[10px] text-white/50 font-bold mb-2">
          <span>09:00 上班</span>
          <span className={cn(isOvertime ? 'text-red-400' : 'text-emerald-400', 'font-black')}>
            {isOvertime
              ? `加班 ${overtimeH}h ${overtimeM}m ↑`
              : isBeforeWork
              ? '等待上班'
              : `还剩 ${remH > 0 ? remH + 'h ' : ''}${remM}m ${remS}s`}
          </span>
          <span>17:00 下班</span>
        </div>
        <GameBar value={progress} max={100} color={barColor} glow={barGlow} />
        {/* 里程碑刻度 */}
        <div className="flex justify-between mt-1 px-0.5">
          {['午餐', '下午茶', '下班!'].map((label, i) => (
            <div key={i} className="flex flex-col items-center" style={{ marginLeft: i === 0 ? '33%' : i === 1 ? '16%' : '0' }}>
              <div className={cn('w-px h-2', progress > [41, 75, 100][i] ? 'bg-white/60' : 'bg-white/20')} />
              <span className={cn('text-[8px] font-bold mt-0.5', progress > [41, 75, 100][i] ? 'text-white/70' : 'text-white/30')}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 月薪进度 + 数据面板 */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {/* 月薪 */}
        <div className="bg-black/20 rounded-xl p-3 border border-white/10">
          <p className="text-[9px] text-white/40 font-bold mb-1">月薪目标</p>
          {editing ? (
            <div className="flex gap-1">
              <input
                autoFocus
                type="number"
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSalaryConfirm()}
                className="w-full bg-white/10 text-white text-xs font-bold rounded-lg px-2 py-1 outline-none border border-yellow-400/40 focus:border-yellow-400"
              />
              <button onClick={handleSalaryConfirm} className="text-[10px] text-yellow-400 font-black px-1">✓</button>
            </div>
          ) : (
            <button onClick={() => { setEditing(true); setInputVal(String(monthlySalary)); }} className="text-left w-full">
              <p className="text-lg font-black text-yellow-400">¥{monthlySalary.toLocaleString()}</p>
              <p className="text-[8px] text-white/30 mt-0.5">点击修改 ✏️</p>
            </button>
          )}
        </div>
        {/* 年薪换算 */}
        <div className="bg-black/20 rounded-xl p-3 border border-white/10">
          <p className="text-[9px] text-white/40 font-bold mb-1">年化估算</p>
          <p className="text-lg font-black text-purple-300">¥{(annualSalary / 10000).toFixed(1)}<span className="text-xs">万</span></p>
          <p className="text-[8px] text-white/30 mt-0.5">日薪 ¥{dailySalary.toFixed(0)}</p>
        </div>
      </div>

      {/* 加班亏损警告 */}
      {isOvertime && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-500/20 border border-red-400/40 rounded-xl p-3 text-center"
        >
          <p className="text-red-300 font-black text-xs mb-1">⚠️ 你正在免费加班！</p>
          <p className="text-red-400/80 text-[10px]">
            已亏损 <span className="text-red-300 font-black">¥{overtimeCost.toFixed(2)}</span> 的时间价值
          </p>
          <p className="text-red-400/50 text-[9px] mt-1">离开！你已完成今日工作价值。</p>
        </motion.div>
      )}

      {/* 下班动力 */}
      {!isOvertime && !isBeforeWork && progress >= 90 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-500/20 border border-emerald-400/40 rounded-xl p-3 text-center"
        >
          <p className="text-emerald-300 font-black text-xs">🎉 即将完成今日任务！</p>
          <p className="text-emerald-400/70 text-[10px] mt-1">坚持一下，马上就能下班啦～</p>
        </motion.div>
      )}
    </CandyCard>
  );
};

// ─────────────────────────────────────────────
// 🌻 模块 2：专注温室（植物大战僵尸风格）
// ─────────────────────────────────────────────
const FocusTimer = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [trees, setTrees] = useState(() => Number(localStorage.getItem('cl_hacker_trees')) || 0);
  const [justCompleted, setJustCompleted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => setTimeLeft(p => p - 1), 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      setJustCompleted(true);
      setTrees(t => {
        const newT = t + 1;
        localStorage.setItem('cl_hacker_trees', newT.toString());
        return newT;
      });
      const xp = Number(localStorage.getItem('cl_hacker_xp')) || 8420;
      localStorage.setItem('cl_hacker_xp', String(xp + 50));
      setTimeLeft(25 * 60);
      setTimeout(() => setJustCompleted(false), 3000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  const toggle = () => setIsActive(a => !a);
  const reset = () => { setIsActive(false); setTimeLeft(25 * 60); };

  const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const s = (timeLeft % 60).toString().padStart(2, '0');
  const progress = ((25 * 60 - timeLeft) / (25 * 60)) * 100;

  // 植物阵列
  const plantEmojis = ['🌱', '🌿', '🌲', '🌳', '🌻', '🌸', '🍀', '🪴'];
  const treesDisplay = Math.min(trees, 8);

  return (
    <CandyCard gradient="bg-gradient-to-br from-[#134e1c] via-[#1a5e2a] to-[#0d3b14]" className="p-5 flex flex-col h-full">
      {/* 顶部 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌻</span>
          <span className="font-black text-white text-sm">专注花园</span>
        </div>
        <div className="flex items-center gap-1 bg-yellow-400/20 rounded-full px-3 py-1 border border-yellow-400/30">
          <span className="text-sm">☀️</span>
          <span className="text-yellow-300 font-black text-xs">{trees * 50} 阳光</span>
        </div>
      </div>

      {/* 植物展示栏（PvZ 式） */}
      <div className="bg-black/20 rounded-2xl p-3 mb-4 border border-white/10">
        <p className="text-[9px] text-white/40 font-bold mb-2 uppercase tracking-widest">我的花园 · {trees} 棵</p>
        <div className="flex flex-wrap gap-1 min-h-[32px]">
          {trees === 0 ? (
            <span className="text-white/20 text-[10px] font-medium self-center">还没有植物，专注 25 分钟种下第一棵吧！</span>
          ) : (
            [...Array(treesDisplay)].map((_, i) => (
              <motion.span
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.05, type: 'spring' }}
                className="text-2xl"
              >
                {plantEmojis[i % plantEmojis.length]}
              </motion.span>
            ))
          )}
          {trees > 8 && (
            <span className="text-white/50 text-xs font-bold self-end ml-1">+{trees - 8}</span>
          )}
        </div>
      </div>

      {/* 计时器主体 */}
      <div className="flex-grow flex flex-col items-center justify-center relative">
        {/* 圆形进度 */}
        <div className="relative w-32 h-32 mb-4">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
            <motion.circle
              cx="60" cy="60" r="52"
              fill="none"
              stroke={isActive ? '#4ade80' : '#86efac'}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 52}`}
              strokeDashoffset={`${2 * Math.PI * 52 * (1 - progress / 100)}`}
              style={{ filter: isActive ? 'drop-shadow(0 0 8px #4ade80)' : 'none' }}
              transition={{ duration: 0.5 }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.p
              animate={isActive ? { scale: [1, 1.03, 1] } : {}}
              transition={isActive ? { repeat: Infinity, duration: 2 } : {}}
              className="text-3xl font-black text-white tabular-nums"
            >
              {m}:{s}
            </motion.p>
            <p className="text-[9px] text-emerald-400/70 font-bold mt-0.5">
              {isActive ? '生长中🌱' : '准备种植'}
            </p>
          </div>
        </div>

        {/* 完成庆祝 */}
        <AnimatePresence>
          {justCompleted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="absolute text-center"
            >
              <p className="text-2xl">🎉</p>
              <p className="text-yellow-300 font-black text-sm">+50 阳光！</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-2 mt-2">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={toggle}
          className={cn(
            'flex-grow py-3 rounded-2xl font-black text-sm shadow-lg border-2 transition-all',
            isActive
              ? 'bg-yellow-400/20 text-yellow-300 border-yellow-400/40 hover:bg-yellow-400/30'
              : 'bg-emerald-500 text-white border-emerald-400 hover:bg-emerald-400 shadow-emerald-900',
          )}
        >
          {isActive ? '⏸ 暂停' : '▶ 开始种植'}
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={reset}
          className="w-12 flex items-center justify-center bg-white/10 text-white/60 rounded-2xl hover:bg-white/20 border-2 border-white/10 font-black text-lg"
        >
          ↺
        </motion.button>
      </div>
    </CandyCard>
  );
};

// ─────────────────────────────────────────────
// 🍭 模块 3：今日盲盒（糖果消消乐风格）
// ─────────────────────────────────────────────
const FoodSelector = () => {
  const foodGroups = [
    { emoji: '🍔', items: ['麦当劳 1+1', 'KFC 疯狂星期四', '塔斯汀汉堡', '萨莉亚'] },
    { emoji: '🍚', items: ['隆江猪脚饭', '照烧鸡腿饭', '咖喱牛肉饭', '台式卤肉饭'] },
    { emoji: '🍜', items: ['兰州拉面', '柳州螺蛳粉', '南昌拌粉', '老北京炸酱面'] },
    { emoji: '🥗', items: ['鸡胸肉沙拉', '全麦三明治', '杂粮便当', '荞麦面'] },
    { emoji: '🌶️', items: ['杨国福麻辣烫', '麻辣香锅', '酸菜鱼饭', '冒菜'] },
  ];
  const allFoods = useMemo(() => foodGroups.flatMap(g => g.items.map(item => ({ emoji: g.emoji, item }))), []);

  const [current, setCurrent] = useState({ emoji: '🎲', item: '今天吃什么？' });
  const [isRolling, setIsRolling] = useState(false);
  const [hasRolled, setHasRolled] = useState(false);
  const rollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleRoll = () => {
    if (isRolling) return;
    const xp = Number(localStorage.getItem('cl_hacker_xp')) || 8420;
    localStorage.setItem('cl_hacker_xp', String(Math.max(0, xp - 5)));
    setHasRolled(true);
    setIsRolling(true);
    rollRef.current = setInterval(() => {
      setCurrent(allFoods[Math.floor(Math.random() * allFoods.length)]);
    }, 80);
    setTimeout(() => {
      if (rollRef.current) clearInterval(rollRef.current);
      setCurrent(allFoods[Math.floor(Math.random() * allFoods.length)]);
      setIsRolling(false);
    }, 1500);
  };

  useEffect(() => () => { if (rollRef.current) clearInterval(rollRef.current); }, []);

  // 糖果颜色轮转
  const candyColors = [
    'from-pink-400 to-rose-400',
    'from-purple-400 to-violet-400',
    'from-yellow-400 to-orange-400',
    'from-blue-400 to-cyan-400',
    'from-green-400 to-emerald-400',
  ];

  return (
    <CandyCard gradient="bg-gradient-to-br from-[#ff6eb4] via-[#ff8cc8] to-[#ffaad4]" className="p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🍭</span>
          <span className="font-black text-white text-sm drop-shadow">今日盲盒</span>
        </div>
        <span className="text-[9px] font-black bg-white/30 text-white rounded-full px-2 py-1 border border-white/40">-5 能量</span>
      </div>

      {/* 结果展示（糖果泡泡） */}
      <div className="flex-grow flex flex-col items-center justify-center">
        <motion.div
          animate={isRolling ? { rotate: [-2, 2, -2], scale: [1, 1.05, 1] } : { rotate: 0, scale: 1 }}
          transition={isRolling ? { repeat: Infinity, duration: 0.15 } : { type: 'spring' }}
          className={cn(
            'w-24 h-24 rounded-full flex flex-col items-center justify-center shadow-2xl border-4 border-white/60 mb-4',
            'bg-gradient-to-br',
            hasRolled ? candyColors[allFoods.indexOf(current) % candyColors.length] : 'from-white/40 to-white/20',
          )}
          style={{ boxShadow: isRolling ? '0 0 30px rgba(255,255,255,0.6)' : '0 8px 32px rgba(0,0,0,0.15)' }}
        >
          <span className={cn('text-3xl', isRolling && 'blur-[1px]')}>{current.emoji}</span>
          {!isRolling && hasRolled && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[8px] font-black text-white drop-shadow-md text-center px-1 leading-tight mt-1"
            >
              {current.item}
            </motion.p>
          )}
        </motion.div>

        {hasRolled && !isRolling && (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-white/80 text-[11px] font-bold text-center drop-shadow"
          >
            ✨ 就决定是你了！好好吃一顿～
          </motion.p>
        )}
        {!hasRolled && (
          <p className="text-white/60 text-[11px] font-bold text-center">摇一摇，让命运决定午饭</p>
        )}
      </div>

      <motion.button
        whileTap={{ scale: 0.92 }}
        whileHover={{ scale: 1.03 }}
        onClick={handleRoll}
        disabled={isRolling}
        className="mt-4 w-full py-3 rounded-2xl bg-white/90 text-pink-600 font-black text-sm shadow-lg border-2 border-white hover:bg-white transition-all disabled:opacity-60"
      >
        {isRolling ? '🎲 摇摇摇...' : hasRolled ? '🔄 再摇一次' : '🎲 开始摇'}
      </motion.button>
    </CandyCard>
  );
};

// ─────────────────────────────────────────────
// 📅 模块 4：今日签（老黄历）
// ─────────────────────────────────────────────
const DailyOracle = () => {
  const currentDate = new Date();
  const solar = Solar.fromDate(currentDate);
  const lunar = solar.getLunar();
  const wuXing = lunar.getDayNaYin();
  const yi = lunar.getDayYi().slice(0, 3).join(' · ');
  const ji = lunar.getDayJi().slice(0, 3).join(' · ');

  const luckIcons = ['🌟', '⭐', '✨', '💫'];
  const luckLevel = ((solar.getDay() + solar.getMonth()) % 4);

  return (
    <CandyCard gradient="bg-gradient-to-br from-[#2d1b69] via-[#11998e] to-[#38ef7d]" className="p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🔮</span>
          <span className="font-black text-white text-sm drop-shadow">今日签</span>
        </div>
        <div className="flex gap-0.5">
          {luckIcons.map((icon, i) => (
            <span key={i} className={cn('text-xs', i <= luckLevel ? 'opacity-100' : 'opacity-20')}>
              {icon}
            </span>
          ))}
        </div>
      </div>

      {/* 日期大字 */}
      <div className="flex-grow flex flex-col items-center justify-center relative">
        <div className="text-8xl font-black text-white/10 absolute select-none pointer-events-none leading-none">
          {solar.getDay()}
        </div>
        <div className="relative z-10 text-center">
          <p className="text-white/80 text-xs font-bold mb-1">
            {solar.getYear()}年{solar.getMonth()}月{solar.getDay()}日
          </p>
          <p className="text-emerald-300 text-[10px] font-black tracking-widest mb-5">
            {lunar.getYearInGanZhi()}年 {lunar.getMonthInChinese()}月{lunar.getDayInChinese()}
          </p>

          <div className="flex gap-4 justify-center">
            {/* 宜 */}
            <div className="flex flex-col items-center bg-emerald-400/20 rounded-2xl px-4 py-3 border border-emerald-400/30">
              <div className="w-7 h-7 rounded-full bg-emerald-400 flex items-center justify-center text-white text-xs font-black mb-2 shadow-lg">宜</div>
              <p className="text-white/90 text-[10px] font-bold text-center leading-relaxed max-w-[60px]">{yi || '平安'}</p>
            </div>
            {/* 忌 */}
            <div className="flex flex-col items-center bg-red-400/20 rounded-2xl px-4 py-3 border border-red-400/30">
              <div className="w-7 h-7 rounded-full bg-red-400 flex items-center justify-center text-white text-xs font-black mb-2 shadow-lg">忌</div>
              <p className="text-white/70 text-[10px] font-bold text-center leading-relaxed max-w-[60px]">{ji || '暴躁'}</p>
            </div>
          </div>
        </div>
      </div>

      <p className="text-center text-[9px] text-white/30 font-bold tracking-widest mt-3">五行 · {wuXing}</p>
    </CandyCard>
  );
};

// ─────────────────────────────────────────────
// 💬 模块 5：茶水间贴板
// ─────────────────────────────────────────────
const GossipBoard = () => {
  const [notes, setNotes] = useState([
    { id: 1, text: '今天天气真好，下午想喝杯热可可 ☕', emoji: '🟡' },
    { id: 2, text: '顺利搞定一个大单！给自己点赞 🎉', emoji: '🔵' },
  ]);
  const [input, setInput] = useState('');

  const noteColors = [
    { bg: 'bg-yellow-100', border: 'border-yellow-300', dot: '🟡' },
    { bg: 'bg-pink-100', border: 'border-pink-300', dot: '🔴' },
    { bg: 'bg-blue-100', border: 'border-blue-300', dot: '🔵' },
    { bg: 'bg-green-100', border: 'border-green-300', dot: '🟢' },
    { bg: 'bg-purple-100', border: 'border-purple-300', dot: '🟣' },
  ];

  const handlePost = () => {
    if (!input.trim()) return;
    const color = noteColors[notes.length % noteColors.length];
    setNotes([{ id: Date.now(), text: input, emoji: color.dot }, ...notes].slice(0, 6));
    setInput('');
  };

  const noteColorMap: Record<string, { bg: string; border: string }> = {
    '🟡': { bg: 'bg-yellow-100', border: 'border-yellow-300' },
    '🔴': { bg: 'bg-pink-100', border: 'border-pink-300' },
    '🔵': { bg: 'bg-blue-100', border: 'border-blue-300' },
    '🟢': { bg: 'bg-green-100', border: 'border-green-300' },
    '🟣': { bg: 'bg-purple-100', border: 'border-purple-300' },
  };

  return (
    <CandyCard gradient="bg-gradient-to-br from-[#ffecd2] to-[#fcb69f]" className="p-5 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">📝</span>
        <span className="font-black text-rose-700 text-sm">茶水间贴板</span>
        <span className="ml-auto text-[9px] font-black bg-white/50 text-rose-600 rounded-full px-2 py-1">{notes.length}/6 条</span>
      </div>

      <div className="flex-grow overflow-hidden mb-3">
        <div
          className="grid gap-2"
          style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}
        >
          <AnimatePresence>
            {notes.map((note, i) => {
              const colors = noteColorMap[note.emoji] || { bg: 'bg-yellow-100', border: 'border-yellow-300' };
              return (
                <motion.div
                  key={note.id}
                  layout
                  initial={{ scale: 0.8, opacity: 0, rotate: Math.random() * 8 - 4 }}
                  animate={{ scale: 1, opacity: 1, rotate: i % 2 === 0 ? -2 : 2 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className={cn(
                    'p-3 rounded-2xl border-2 shadow-md text-xs text-slate-700 font-medium leading-relaxed relative',
                    colors.bg,
                    colors.border,
                  )}
                >
                  <div className="w-3 h-3 rounded-full bg-white/60 border border-black/10 mx-auto -mt-1 mb-2" />
                  {note.text}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex gap-2 mt-auto">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handlePost()}
          placeholder="写张悄悄话便利贴..."
          className="flex-grow bg-white/70 border-2 border-white/60 text-slate-700 placeholder-slate-400 px-4 py-2.5 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-rose-300 font-medium shadow-sm"
        />
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handlePost}
          className="w-10 h-10 bg-rose-400 text-white rounded-2xl flex items-center justify-center hover:bg-rose-500 shadow-md border-2 border-rose-300 font-black text-lg"
        >
          💌
        </motion.button>
      </div>
    </CandyCard>
  );
};

// ─────────────────────────────────────────────
// 🏆 主控：对自己空间
// ─────────────────────────────────────────────
export default function ToMyselfSpace() {
  const [xp, setXp] = useState(() => Number(localStorage.getItem('cl_hacker_xp')) || 8420);
  const [trees] = useState(() => Number(localStorage.getItem('cl_hacker_trees')) || 0);

  useEffect(() => {
    const sync = () => setXp(Number(localStorage.getItem('cl_hacker_xp')) || 8420);
    const id = setInterval(sync, 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto pb-10 space-y-6">
      {/* 顶部状态栏（游戏 HUD 风格） */}
      <div className="flex flex-wrap items-center gap-3 px-1">
        <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full px-4 py-2 shadow-lg border-2 border-yellow-300">
          <span className="text-lg">⭐</span>
          <span className="text-white font-black text-sm">{xp.toLocaleString()} 能量</span>
        </div>
        <div className="flex items-center gap-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full px-4 py-2 shadow-lg border-2 border-green-300">
          <span className="text-lg">🌲</span>
          <span className="text-white font-black text-sm">{trees} 棵植物</span>
        </div>
        <p className="ml-auto text-xs text-brand-gray/60 font-medium hidden sm:block">
          🎮 你的私人充电小站
        </p>
      </div>

      {/* Bento 主网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 auto-rows-[320px]">
        {/* 高效下班 - 大卡 */}
        <div className="lg:col-span-2">
          <SalaryMonitor />
        </div>
        {/* 盲盒 */}
        <div>
          <FoodSelector />
        </div>
        {/* 专注花园 - 大卡 */}
        <div className="lg:col-span-2">
          <FocusTimer />
        </div>
        {/* 今日签 */}
        <div>
          <DailyOracle />
        </div>
        {/* 茶水间 - 全宽 */}
        <div className="md:col-span-2 lg:col-span-3" style={{ height: '280px' }}>
          <GossipBoard />
        </div>
      </div>
    </div>
  );
}
