import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Coffee, Calendar, Heart, Zap, Timer, 
  MessageCircle, Star, Sparkles, Sprout, Wind
} from 'lucide-react';
import { Solar } from 'lunar-javascript';
import { cn } from '../../lib/utils';

// --- 通用 UI 组件 ---
const SoftCard = ({ children, colorTheme, className }: { children: React.ReactNode, colorTheme: 'mint' | 'peach' | 'sage' | 'blue' | 'white', className?: string }) => {
  const themeColors = {
    mint: "bg-[#F1F8F4] border-white/60",
    peach: "bg-[#FFF0F2] border-white/60",
    sage: "bg-[#EAECE6] border-white/60",
    blue: "bg-[#F0F4F8] border-white/60",
    white: "bg-[#FCFCFA] border-brand-border/5"
  };

  return (
    <motion.div 
      whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(0,0,0,0.06)" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn(
        "rounded-[2rem] p-6 lg:p-8 border backdrop-blur-sm shadow-[0_12px_32px_rgba(0,0,0,0.03)] relative overflow-hidden",
        themeColors[colorTheme],
        className
      )}
    >
      {children}
    </motion.div>
  );
};

// --- 模块 1：今日盲盒：吃点好的 (原 rng_food.exe) ---
const FoodSelector = () => {
  const foodGroups = [
    { name: '快餐', items: ['麦当劳 1+1', 'KFC 疯狂星期四', '塔斯汀汉堡', '萨莉亚'] },
    { name: '米饭', items: ['隆江猪脚饭', '照烧鸡腿饭', '咖喱牛肉饭', '台式卤肉饭'] },
    { name: '粉面', items: ['兰州拉面', '柳州螺蛳粉', '南昌拌粉', '老北京炸酱面'] },
    { name: '轻食', items: ['鸡胸肉沙拉', '全麦三明治', '杂粮便当', '荞麦面'] },
    { name: '重口', items: ['杨国福麻辣烫', '麻辣香锅', '酸菜鱼饭', '冒菜'] },
  ];
  const allFoods = foodGroups.flatMap(g => g.items);
  
  const [current, setCurrent] = useState('今天想吃点什么？');
  const [isRolling, setIsRolling] = useState(false);
  const [hasRolled, setHasRolled] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isRolling) {
      interval = setInterval(() => {
        setCurrent(allFoods[Math.floor(Math.random() * allFoods.length)]);
      }, 60); // 柔和的滚动频率
    } else if (hasRolled) {
      setCurrent(allFoods[Math.floor(Math.random() * allFoods.length)]);
    }
    return () => clearInterval(interval);
  }, [isRolling, allFoods, hasRolled]);

  const handleRoll = () => {
    if (!isRolling) {
      const currentXp = Number(localStorage.getItem('cl_hacker_xp')) || 8420;
      localStorage.setItem('cl_hacker_xp', String(Math.max(0, currentXp - 5)));
      setHasRolled(true);
      setIsRolling(true);
      setTimeout(() => setIsRolling(false), 1500); // 自动停止
    }
  };

  return (
    <SoftCard colorTheme="peach" className="flex flex-col h-full group">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-500">
          <Coffee size={16} />
        </div>
        <h3 className="font-bold text-brand-dark">今日盲盒</h3>
        <span className="ml-auto text-[10px] bg-white/50 px-2 py-1 rounded-full text-rose-500 font-medium">-5 点能量</span>
      </div>
      
      <div className="flex-grow flex flex-col items-center justify-center text-center">
        <motion.div 
          animate={isRolling ? { scale: 1.05, y: [-2, 2, -2] } : { scale: 1, y: 0 }}
          transition={isRolling ? { repeat: Infinity, duration: 0.2 } : { type: "spring" }}
          className={cn(
            "text-2xl font-bold mb-4 transition-colors",
            isRolling ? "text-rose-300 blur-[0.5px]" : "text-rose-600"
          )}
        >
          {current}
        </motion.div>
        {hasRolled && !isRolling && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-rose-400 font-medium">
            <Sparkles size={12} className="inline mr-1" /> 辛苦啦，好好吃一顿吧！
          </motion.div>
        )}
      </div>

      <motion.button 
        whileTap={{ scale: 0.95 }}
        onClick={handleRoll}
        disabled={isRolling}
        className="mt-6 w-full py-3 sm:py-4 bg-white/60 hover:bg-white rounded-xl text-rose-500 font-bold text-sm shadow-sm transition-all"
      >
        {isRolling ? "正在翻找美味..." : (hasRolled ? "再抽一次" : "吃点好的")}
      </motion.button>
    </SoftCard>
  );
};

// --- 模块 2：早C晚A：下班倒计时 (原 monitor_salary.sh) ---
const SalaryMonitor = () => {
  const [monthlySalary, setMonthlySalary] = useState(() => Number(localStorage.getItem('cl_monthly_salary')) || 6200);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    localStorage.setItem('cl_monthly_salary', monthlySalary.toString());
  }, [monthlySalary]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const workDays = 20;
  const currMin = now.getHours() * 60 + now.getMinutes();
  const start = 9 * 60, end = 17 * 60;
  
  const isOvertime = currMin >= end;
  const isBeforeWork = currMin < start;
  
  let progress = 0;
  if (!isBeforeWork && !isOvertime) {
    progress = ((currMin - start) / (end - start)) * 100;
  } else if (isOvertime) {
    progress = 100;
  }

  const overtimeMin = isOvertime ? currMin - end : 0;
  const dailyEarn = (monthlySalary / workDays) * (progress / 100);

  return (
    <SoftCard colorTheme="blue" className="flex flex-col h-full relative">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
          <Zap size={16} />
        </div>
        <h3 className="font-bold text-brand-dark">一天进度</h3>
        <input 
          type="number" 
          value={monthlySalary} 
          onChange={e => setMonthlySalary(Number(e.target.value))} 
          className="ml-auto w-16 bg-white/50 text-xs px-2 py-1 rounded-lg text-center outline-none focus:ring-2 focus:ring-blue-200"
        />
      </div>

      <div className="flex flex-col items-center justify-center flex-grow py-4">
        {isBeforeWork ? (
          <div className="text-blue-400 font-medium text-sm flex flex-col items-center gap-2">
            <Coffee size={24} className="opacity-50" />
            新的一天还没开始，先喝杯咖啡吧
          </div>
        ) : isOvertime ? (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-400 mb-2">100%</h2>
            <p className="text-xs text-slate-400 font-medium">已滞留 {Math.floor(overtimeMin/60)}h {overtimeMin%60}m，你的时薪在缩水哦~</p>
          </div>
        ) : (
          <div className="text-center w-full">
            <h2 className="text-4xl font-bold text-blue-500 mb-1">¥{dailyEarn.toFixed(1)}</h2>
            <p className="text-xs text-blue-400 mb-6 font-medium">今日已到账（估算）</p>
            
            {/* 柔和进度条 */}
            <div className="w-full bg-white/60 h-4 rounded-full overflow-hidden p-0.5">
              <motion.div 
                className="h-full bg-gradient-to-r from-blue-300 to-blue-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, type: "spring" }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-blue-400 font-bold mt-2 px-1">
              <span>09:00</span>
              <span>17:00 (进度 {progress.toFixed(1)}%)</span>
            </div>
          </div>
        )}
      </div>
    </SoftCard>
  );
};

// --- 模块 3：专注温室：时间花园 (原 focus_node.exe) ---
const FocusTimer = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [trees, setTrees] = useState(() => Number(localStorage.getItem('cl_hacker_trees')) || 0);
  
  useEffect(() => {
    let interval: any;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(p => p - 1), 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      setTrees(t => {
        const newT = t + 1;
        localStorage.setItem('cl_hacker_trees', newT.toString());
        return newT;
      });
      const currentXp = Number(localStorage.getItem('cl_hacker_xp')) || 8420;
      localStorage.setItem('cl_hacker_xp', String(currentXp + 50));
      setTimeLeft(25 * 60);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggle = () => setIsActive(!isActive);
  const reset = () => { setIsActive(false); setTimeLeft(25*60); };
  
  const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const s = (timeLeft % 60).toString().padStart(2, '0');
  const isRunning = isActive && timeLeft > 0;

  return (
    <SoftCard colorTheme="sage" className="flex flex-col h-full relative overflow-hidden">
      {/* 呼吸感背景光晕 */}
      {isRunning && (
        <motion.div 
          animate={{ opacity: [0.1, 0.3, 0.1], scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 4 }}
          className="absolute inset-0 bg-emerald-200/20 rounded-full blur-3xl -z-0"
        />
      )}

      <div className="flex items-center gap-2 mb-4 relative z-10">
        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
          <Sprout size={16} />
        </div>
        <h3 className="font-bold text-brand-dark">时间花园</h3>
        <span className="ml-auto text-[10px] text-emerald-600 font-bold bg-white/50 px-2 py-1 rounded-full">已种出 {trees} 棵</span>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center relative z-10">
        <motion.div 
          animate={isRunning ? { scale: 1.02 } : { scale: 1 }}
          className="text-5xl lg:text-6xl font-bold text-emerald-600 tracking-tight"
        >
          {m}:{s}
        </motion.div>
        <p className="text-xs text-emerald-500/70 font-medium mt-2">
          {isRunning ? "安静生长中..." : "种下 25 分钟专注时光"}
        </p>
      </div>

      <div className="flex gap-2 relative z-10 mt-4">
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={toggle}
          className={cn(
            "flex-grow py-3 rounded-xl font-bold text-sm shadow-sm transition-all",
            isRunning ? "bg-white/40 text-emerald-600" : "bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-200"
          )}
        >
          {isRunning ? "暂停生长" : "开始种植"}
        </motion.button>
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={reset}
          className="w-12 flex items-center justify-center bg-white/50 text-emerald-600 rounded-xl hover:bg-white"
        >
          <Timer size={16} />
        </motion.button>
      </div>
    </SoftCard>
  );
};

// --- 模块 4：今日运势：老黄历 (原 oracle_module.sh) ---
const DailyOracle = () => {
  const currentDate = new Date();
  const solar = Solar.fromDate(currentDate);
  const lunar = solar.getLunar();
  
  const wuXing = lunar.getDayNaYin();
  const yi = lunar.getDayYi().slice(0, 3).join(' · ');
  const ji = lunar.getDayJi().slice(0, 3).join(' · ');

  return (
    <SoftCard colorTheme="white" className="flex flex-col h-full bg-gradient-to-br from-[#FCFCFA] to-[#F5F1EB]">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
          <Calendar size={16} />
        </div>
        <h3 className="font-bold text-brand-dark">今日签</h3>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center border-y border-brand-border/5 py-4 my-2">
        <h1 className="text-6xl font-serif text-brand-dark opacity-10 font-bold absolute pointer-events-none select-none tracking-tighter">
          {solar.getDay()}
        </h1>
        <div className="text-center z-10">
          <p className="text-sm text-brand-gray font-medium mb-1">
            {solar.getYear()}年{solar.getMonth()}月{solar.getDay()}日
          </p>
          <p className="text-xs text-orange-600/60 font-bold tracking-widest mb-4">
            {lunar.getYearInGanZhi()}年 {lunar.getMonthInChinese()}月{lunar.getDayInChinese()}
          </p>
          
          <div className="flex gap-4 sm:gap-6 justify-center text-sm">
            <div className="text-center">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2 text-xs font-bold">宜</div>
              <span className="text-brand-dark font-medium opacity-80">{yi || '平安'}</span>
            </div>
            <div className="w-px bg-brand-border/10"></div>
            <div className="text-center">
              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-2 text-xs font-bold">忌</div>
              <span className="text-brand-gray font-medium opacity-70">{ji || '暴躁'}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-center mt-2 text-[10px] text-brand-gray opacity-40 font-bold tracking-widest">
        五行：{wuXing}
      </div>
    </SoftCard>
  );
};

// --- 模块 5：茶水间：心情贴纸板 (原 GOSSIP) ---
const GossipBoard = () => {
  const [notes, setNotes] = useState([
    { id: 1, text: "今天天气真好，下午想喝杯热可可", color: "bg-yellow-100" },
    { id: 2, text: "顺利搞定一个大单！给自己点赞", color: "bg-blue-100" }
  ]);
  const [input, setInput] = useState('');
  
  const colors = ["bg-yellow-100", "bg-blue-100", "bg-pink-100", "bg-green-100"];

  const handlePost = () => {
    if (!input.trim()) return;
    const newNote = {
      id: Date.now(),
      text: input,
      color: colors[Math.floor(Math.random() * colors.length)]
    };
    setNotes([newNote, ...notes].slice(0, 6)); // 保留最新的 6 个
    setInput('');
  };

  return (
    <SoftCard colorTheme="mint" className="flex flex-col h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-teal-600 shadow-sm">
          <MessageCircle size={16} />
        </div>
        <h3 className="font-bold text-brand-dark">茶水间贴板</h3>
      </div>

      <div className="flex-grow flex flex-wrap content-start gap-3 overflow-hidden relative mb-4">
        <AnimatePresence>
          {notes.map((note, i) => (
            <motion.div
              layout
              initial={{ scale: 0.8, opacity: 0, rotate: Math.random() * 10 - 5 }}
              animate={{ scale: 1, opacity: 1, rotate: Math.random() * 6 - 3 }}
              className={cn("p-3 sm:p-4 shadow-sm w-[45%] flex-grow rounded-lg text-xs leading-relaxed text-slate-700 font-medium", note.color)}
              key={note.id}
            >
              <div className="w-2 h-2 rounded-full bg-black/10 mx-auto -mt-1 mb-2"></div>
              {note.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-auto flex gap-2">
        <input 
          type="text" 
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handlePost()}
          placeholder="写张悄悄话便利贴..." 
          className="flex-grow bg-white/80 border-none px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-200 font-medium placeholder-slate-400 shadow-sm"
        />
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={handlePost}
          className="w-10 h-10 bg-teal-500 text-white rounded-xl flex items-center justify-center hover:bg-teal-600 shadow-sm"
        >
          <Heart size={16} />
        </motion.button>
      </div>
    </SoftCard>
  );
};


// --- 主控整合 ---
export default function ToMyselfSpace() {
  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 sm:space-y-8 pb-10">
      
      {/* 状态总览 - 轻量化 */}
      <div className="flex items-center gap-3 px-2 mb-2">
        <div className="bg-white px-4 py-2 rounded-full shadow-sm text-xs font-bold text-brand-dark flex items-center gap-2 border border-brand-border/5">
          <Star size={14} className="text-brand-gold" />
          <span>能量星数：{localStorage.getItem('cl_hacker_xp') || 8420}</span>
        </div>
        <p className="text-xs text-brand-gray font-medium opacity-60 ml-auto">
          这是你的私人充电站，休息一下吧
        </p>
      </div>

      {/* Bento Grid 布局 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[300px]">
        {/* 长跨度模块 */}
        <div className="lg:col-span-2">
          <FocusTimer />
        </div>
        
        {/* 单格模块 */}
        <div>
          <FoodSelector />
        </div>
        
        {/* 单格模块 */}
        <div>
          <SalaryMonitor />
        </div>

        {/* 单格模块 */}
        <div>
          <DailyOracle />
        </div>

        {/* 双格跨度，茶水间 */}
        <div className="md:col-span-2 lg:col-span-1">
          <GossipBoard />
        </div>
      </div>
    </div>
  );
}
