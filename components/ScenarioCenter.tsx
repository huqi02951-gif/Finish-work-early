import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Users, ShieldCheck, Briefcase, UserCheck, ArrowRight, Utensils, Coffee, 
  Timer, RotateCcw, Sparkles, Send, Heart, Terminal, Lock, EyeOff, 
  Activity, ChevronRight, Search, FileText, CheckCircle2, AlertCircle, X,
  Calendar as CalendarIcon, Moon, Sun, Palette, Compass, Ban, Zap,
  LayoutDashboard, Target, User, Database, Star, Info, Clock, TrendingUp, Settings
} from 'lucide-react';
import { Solar, Lunar } from 'lunar-javascript';
import { motion, AnimatePresence } from 'framer-motion';
import { SKILLS } from '../constants/skills';
import { cn } from '../lib/utils';
import MaterialChecklistCenter from './MaterialChecklistCenter';
import AppLayout from '../src/components/layout/AppLayout';


const GlitchText: React.FC<{ text: string; className?: string; glitchHoverOnly?: boolean }> = ({ text, className, glitchHoverOnly }) => {
  return (
    <span className={cn("relative inline-block group", className)}>
      <span className="relative z-10">{text}</span>
      <span className={cn(
        "absolute top-0 left-[1px] z-0 text-[#00ff41] opacity-30 select-none whitespace-nowrap",
        glitchHoverOnly ? "opacity-0 group-hover:opacity-30 group-hover:clip-glitch-1" : "clip-glitch-1"
      )} aria-hidden>{text}</span>
      <span className={cn(
        "absolute top-0 left-[-1px] z-0 text-[#ff0040] opacity-20 select-none whitespace-nowrap",
        glitchHoverOnly ? "opacity-0 group-hover:opacity-20 group-hover:clip-glitch-2" : "clip-glitch-2"
      )} aria-hidden>{text}</span>
    </span>
  );
};

const TypewriterText: React.FC<{ text: string; delay?: number; className?: string; onComplete?: () => void }> = ({ text, delay = 0, className, onComplete }) => {
  const [displayText, setDisplayText] = useState('');
  
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let index = 0;
    const startTyping = () => {
      timeout = setInterval(() => {
        setDisplayText(text.substring(0, index + 1));
        index++;
        if (index === text.length) {
          clearInterval(timeout);
          if (onComplete) onComplete();
        }
      }, 50);
    };
    if (delay > 0) setTimeout(startTyping, delay);
    else startTyping();
    return () => clearInterval(timeout);
  }, [text, delay]);

  return (
    <span className={className}>
      {displayText}
      <span className="animate-pulse bg-[#00ff41] w-2 h-4 inline-block ml-1 align-middle"></span>
    </span>
  );
};

const AsciiProgress: React.FC<{ percent: number; width?: number; color?: string }> = ({ percent, width = 15, color = "text-[#00ff41]" }) => {
  const filledCount = Math.round((percent / 100) * width);
  const emptyCount = width - filledCount;
  const filled = "█".repeat(filledCount);
  const empty = "░".repeat(emptyCount);
  return (
    <span className={cn("font-mono tracking-tight", color)}>
      [{filled}<span className="text-gray-700">{empty}</span>] {percent.toFixed(0)}%
    </span>
  );
};

const FengShuiCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Solar | null>(null);

  const solar = Solar.fromDate(currentDate);
  const lunar = solar.getLunar();

  const daysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
    for (let i = 1; i <= lastDay.getDate(); i++) days.push(Solar.fromYmd(year, month + 1, i));
    return days;
  };

  const getFengShuiInfo = (s: Solar) => {
    const l = s.getLunar();
    return {
      lunarDay: l.getDayInChinese(),
      lunarMonth: l.getMonthInChinese(),
      ganZhiYear: l.getYearInGanZhi(),
      ganZhiMonth: l.getMonthInGanZhi(),
      ganZhiDay: l.getDayInGanZhi(),
      zodiac: l.getYearShengXiao(),
      yi: l.getDayYi(),
      ji: l.getDayJi(),
      wuXing: l.getDayNaYin(),
      chong: l.getDayChongDesc(),
      sha: l.getDaySha(),
      position: l.getDayPositionXiDesc(),
    };
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] rounded-xl overflow-hidden shadow-2xl border border-[#00ff41]/30 font-mono relative">
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] opacity-40 z-0"></div>
      
      {/* Header */}
      <div className="p-3 border-b border-[#00ff41]/30 flex justify-between items-center bg-black relative z-10">
        <div className="flex items-center gap-2 text-[#00ff41]">
          <span className="text-gray-500">$</span>
          <span className="text-[10px] font-bold uppercase tracking-widest">./oracle_module.sh</span>
        </div>
        <div className="flex items-center gap-4 text-[#00ff41]">
          <button onClick={() => { const d = new Date(currentDate); d.setMonth(d.getMonth() - 1); setCurrentDate(d); }} className="hover:text-white transition-colors">{'<'}</button>
          <span className="text-xs font-bold tracking-widest">{currentDate.getFullYear()}-{String(currentDate.getMonth() + 1).padStart(2,'0')}</span>
          <button onClick={() => { const d = new Date(currentDate); d.setMonth(d.getMonth() + 1); setCurrentDate(d); }} className="hover:text-white transition-colors">{'>'}</button>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto custom-scrollbar p-4 space-y-4 relative z-10">
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {['周日', '周一', '周二', '周三', '周四', '周五', '周六'].map(d => (
            <div key={d} className="text-center text-[10px] font-bold text-[#00ff41]/50 py-1">{d}</div>
          ))}
          {daysInMonth().map((day, idx) => {
            if (!day) return <div key={`empty-${idx}`} />;
            const isToday = day.toYmd() === Solar.fromDate(new Date()).toYmd();
            const isSelected = selectedDay?.toYmd() === day.toYmd();
            
            return (
              <button
                key={day.toYmd()}
                onClick={() => setSelectedDay(day)}
                className={cn(
                  "aspect-square flex flex-col items-center justify-center transition-all relative border border-transparent hover:border-[#00ff41]/30",
                  isSelected ? "bg-[#00ff41]/20 border-[#00ff41] shadow-[0_0_10px_rgba(0,255,65,0.3)] z-10" : 
                  isToday ? "border-[#00ff41]/50 text-[#00ff41]" : "text-[#00ff41]/40"
                )}
              >
                <span className={cn("text-[12px] font-bold", isSelected ? "text-[#00ff41]" : "")}>{day.getDay()}</span>
                {isToday && !isSelected && <div className="absolute bottom-1 w-1.5 h-1.5 bg-[#00ff41] animate-pulse" />}
              </button>
            );
          })}
        </div>

        {/* Selected Day Details */}
        <AnimatePresence mode="wait">
          {selectedDay && (
            <motion.div
              key={selectedDay.toYmd()}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-black/80 border border-[#00ff41]/30 p-3 space-y-3 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 px-2 py-0.5 bg-[#00ff41] text-black text-[8px] font-bold">已解密数据</div>
              <div className="flex justify-between items-start pt-2">
                <div>
                  <h5 className="text-[#00ff41] text-xs font-bold font-mono">查询日期: {selectedDay.toYmd()}</h5>
                  <p className="text-[10px] text-[#00ff41]/70 uppercase tracking-widest mt-1">
                    {getFengShuiInfo(selectedDay).ganZhiYear}年 / {getFengShuiInfo(selectedDay).lunarMonth}月 {getFengShuiInfo(selectedDay).lunarDay}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-[10px] leading-relaxed">
                <div className="border border-[#00ff41]/20 p-2">
                  <div className="text-[#00ff41] font-bold mb-1">系统授权 (宜):</div>
                  <div className="text-[#00ff41]/80">{getFengShuiInfo(selectedDay).yi.join(' ')}</div>
                </div>
                <div className="border border-red-500/30 p-2 bg-red-950/20">
                  <div className="text-red-500 font-bold mb-1">系统拦截 (忌):</div>
                  <div className="text-red-400/80">{getFengShuiInfo(selectedDay).ji.join(' ')}</div>
                </div>
              </div>

              <div className="space-y-1 text-[10px] pt-1 border-t border-[#00ff41]/20 mt-2 text-[#00ff41]/60">
                <div className="flex justify-between"><span># 属性(五行):</span> <span className="text-[#00ff41]">{getFengShuiInfo(selectedDay).wuXing}</span></div>
                <div className="flex justify-between"><span># 方位(喜神):</span> <span className="text-[#00ff41]">{getFengShuiInfo(selectedDay).position}</span></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const FoodSelector = () => {
  const foodGroups = [
    { name: '快餐西式', items: ['麦当劳 1+1', '肯德基 疯狂星期四', '塔斯汀 中国汉堡', '汉堡王', '赛百味'] },
    { name: '米饭便当', items: ['隆江猪脚饭', '湘式小炒肉', '照烧鸡腿饭', '台式卤肉饭', '广式烧腊饭', '咖喱牛肉饭', '日式肥牛饭'] },
    { name: '粉面主食', items: ['兰州拉面', '重庆小面', '柳州螺蛳粉', '南昌拌粉', '山西刀削面', '老北京炸酱面', '河南烩面'] },
    { name: '减脂轻食', items: ['鸡胸肉沙拉', '全麦三明治', '杂粮饭便当', '荞麦面', '瑞幸 吐司套餐'] },
    { name: '重口过瘾', items: ['杨国福麻辣烫', '张亮麻辣烫', '一人食冒菜', '麻辣香锅', '酸菜鱼饭'] },
    { name: '街边小吃', items: ['煎饼果子', '烤冷面', '便利店关东煮', '全家饭团', '萨莉亚'] }
  ];

  const allFoods = foodGroups.flatMap(g => g.items);
  const [current, setCurrent] = useState('等待执行指令...');
  const [isRolling, setIsRolling] = useState(false);
  const [hasRolled, setHasRolled] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isRolling) {
      interval = setInterval(() => {
        const randomFood = allFoods[Math.floor(Math.random() * allFoods.length)];
        const glitchChars = '!<>-_\\\\/[]{}—=+*^?#_';
        const glitch = Array.from({length: randomFood.length}, () => glitchChars[Math.floor(Math.random()*glitchChars.length)]).join('');
        setCurrent(Math.random() > 0.5 ? randomFood : glitch);
      }, 50);
    } else if (hasRolled) {
      const finalFood = allFoods[Math.floor(Math.random() * allFoods.length)];
      setCurrent(finalFood);
    }
    return () => clearInterval(interval);
  }, [isRolling, allFoods, hasRolled]);

  return (
    <div className="bg-[#0a0a0a] p-6 rounded-xl border border-[#00ff41]/30 flex flex-col h-full relative font-mono text-[#00ff41] shadow-[inset_0_0_20px_rgba(0,255,65,0.05)] overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] opacity-40 z-0"></div>
      
      <div className="relative z-10 flex flex-col items-center flex-grow">
        <div className="w-full text-[10px] text-gray-500 mb-6 flex justify-between border-b border-[#00ff41]/20 pb-2">
          <span>$ ./rng_food.exe</span>
          <span className="animate-pulse">_</span>
        </div>
        
        <div className="w-full h-32 flex flex-col items-center justify-center border border-[#00ff41]/20 bg-[#00ff41]/5 mb-6 relative group overflow-hidden">
          <div className="absolute inset-0 bg-[#00ff41]/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <span className={cn(
            "text-xl sm:text-2xl font-bold transition-all px-4 text-center z-10",
            isRolling ? "text-[#00ff41]/50 blur-[1px]" : "text-[#00ff41]"
          )}>
            {hasRolled && !isRolling ? <GlitchText text={current} /> : current}
          </span>
        </div>

        <div className="w-full flex flex-wrap justify-center gap-1.5 mb-8">
          {foodGroups.map(g => (
            <span key={g.name} className="text-[9px] text-[#00ff41]/40 border border-[#00ff41]/20 px-1.5 py-0.5">
              [{g.name}]
            </span>
          ))}
        </div>

        <div className="mt-auto w-full">
          <button 
            onClick={() => {
              if (!isRolling) {
                const currentXp = Number(localStorage.getItem('cl_hacker_xp')) || 8420;
                if (currentXp >= 5) {
                  localStorage.setItem('cl_hacker_xp', String(currentXp - 5));
                  window.dispatchEvent(new Event('storage'));
                  setHasRolled(true);
                  setIsRolling(true);
                } else {
                  setCurrent('ERR: 算力不足(-5 XP)');
                }
              } else {
                setIsRolling(false);
              }
            }}
            className={cn(
              "w-full py-3 border text-[12px] font-bold transition-all flex justify-center items-center gap-2",
              !isRolling 
                ? "bg-[#00ff41]/10 border-[#00ff41]/50 text-[#00ff41] hover:bg-[#00ff41]/20 shadow-[0_0_10px_rgba(0,255,65,0.2)]" 
                : "bg-red-950/30 border-red-500/50 text-red-500 shadow-[0_0_10px_rgba(255,0,0,0.2)]"
            )}
          >
            {isRolling ? "终止随机进程" : hasRolled ? "重新抽取 (-5 XP)" : "执行抽选程序 (-5 XP)"}
          </button>
        </div>
      </div>
    </div>
  );
};

const EfficientOffDutyGame = () => {
  const [monthlySalary, setMonthlySalary] = useState(() => Number(localStorage.getItem('cl_monthly_salary')) || 6200);
  const [now, setNow] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'calculator' | 'roast'>('calculator');
  const [currentRoast, setCurrentRoast] = useState(0);

  useEffect(() => {
    localStorage.setItem('cl_monthly_salary', monthlySalary.toString());
    window.dispatchEvent(new Event('storage'));
  }, [monthlySalary]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const workDays = 20;
  const dailySalary = monthlySalary / workDays;
  const hourlyRate = dailySalary / 8;
  const minuteRate = hourlyRate / 60;
  const secondRate = minuteRate / 60;

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const workStart = 9 * 60; 
  const workEnd = 17 * 60;  

  const isWorkTime = currentMinutes >= workStart && currentMinutes < workEnd;
  const isOvertime = currentMinutes >= workEnd;
  
  const overtimeMinutes = isOvertime ? currentMinutes - workEnd : 0;
  const overtimeLoss = overtimeMinutes * minuteRate + now.getSeconds() * secondRate;
  const earnedToday = Math.min(Math.max(currentMinutes - workStart, 0), 480) * minuteRate;

  const roasts = [
    { text: "正在榨取剩余价值... 老板已加购一杯【星巴克】", id: "0x1A" },
    { text: "时间流逝警告：你的时薪并没有因为加班增加", id: "0x2B" },
    { text: "严重警告：你的青春正在为老板的劳斯莱斯加油", id: "0x3C" },
    { text: "加班不仅不会让你变强，只会让你的价格跳水", id: "0x4D" },
    { text: "正常节点已进入【健身房】，你已进入【重症监护室】。", id: "0x5E" },
  ];

  useEffect(() => {
    const timer = setInterval(() => setCurrentRoast(p => (p + 1) % roasts.length), 4000);
    return () => clearInterval(timer);
  }, [roasts.length]);

  return (
    <div className="flex flex-col bg-[#0a0a0a] border border-[#00ff41]/30 rounded-xl overflow-hidden font-mono shadow-[0_0_15px_rgba(0,255,65,0.05)] relative">
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] opacity-40 z-0"></div>
      
      <div className="p-2 border-b border-[#00ff41]/30 bg-black flex justify-between items-center relative z-10">
        <div className="text-[#00ff41] text-[10px] font-bold">
          <span className="text-gray-500">$</span> ./monitor_salary.sh
        </div>
        <div className="flex border border-[#00ff41]/30">
          <button onClick={() => setActiveTab('calculator')} className={cn("px-3 py-1 text-[10px]", activeTab === 'calculator' ? "bg-[#00ff41] text-black" : "text-[#00ff41]")}>监控板</button>
          <button onClick={() => setActiveTab('roast')} className={cn("px-3 py-1 text-[10px]", activeTab === 'roast' ? "bg-[#00ff41] text-black" : "text-[#00ff41]")}>系统日志</button>
        </div>
      </div>

      <div className="p-4 relative z-10 text-[#00ff41]">
        {activeTab === 'calculator' ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center text-[11px] border-b border-[#00ff41]/20 pb-2">
              <div className="flex items-center gap-2">
                <span>[变量] 月薪:</span>
                <input type="number" value={monthlySalary} onChange={e => setMonthlySalary(Number(e.target.value))} className="bg-transparent border-b border-[#00ff41] w-16 outline-none text-[#00ff41] text-center" />
              </div>
              <span className="font-bold">折合: ¥{hourlyRate.toFixed(1)}/时</span>
            </div>

            <div className={cn("p-4 border", isOvertime ? "border-red-500 bg-red-950/20" : "border-[#00ff41]/50 bg-[#00ff41]/5")}>
              {isOvertime ? (
                <>
                  <div className="text-red-500 text-[11px] font-bold animate-pulse">警告：系统监测到无偿加班行为！</div>
                  <div className="text-4xl font-bold text-red-500 mt-2">-¥{overtimeLoss.toFixed(2)}</div>
                  <div className="text-red-400/70 text-[10px] mt-2 space-x-2">
                    <span>已滞留: {Math.floor(overtimeMinutes/60)}小时 {overtimeMinutes%60}分钟 {now.getSeconds()}秒</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-[#00ff41] text-[11px] font-bold">运行状态：正常创收中</div>
                  <div className="text-3xl font-bold mt-2 text-[#00ff41]">¥{earnedToday.toFixed(2)}</div>
                  <div className="text-[#00ff41]/70 text-[10px] mt-2">今日进度：{(earnedToday/dailySalary*100).toFixed(1)}%</div>
                </>
              )}
            </div>

            {isOvertime && (
              <div className="border border-red-500/30 p-3 space-y-2">
                <div className="text-[10px] text-red-500 font-bold">等价损失换算：</div>
                {[
                  { name: '一杯瑞幸咖啡', cost: 9.9 },
                  { name: '一份外卖快餐', cost: 20 },
                  { name: '一张电影票', cost: 50 },
                ].map(i => (
                  <div key={i.name} className="flex justify-between text-[10px]">
                    <span className="text-red-400">-{'>'} {i.name}</span>
                    <span className={overtimeLoss >= i.cost ? "text-red-500 bg-red-950 px-1 font-bold" : "text-gray-500"}>
                      {overtimeLoss >= i.cost ? '[已彻底损失]' : `再加 ¥${(i.cost - overtimeLoss).toFixed(1)}`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="border border-[#00ff41]/30 bg-[#00ff41]/5 p-4 min-h-[120px] relative">
              <div className="absolute top-0 right-0 px-2 py-0.5 text-[9px] border-b border-l border-[#00ff41]/30 text-[#00ff41]/50 bg-black">日志流 TAIL -F</div>
              <AnimatePresence mode="wait">
                <motion.div key={currentRoast} initial={{opacity:0, x:-5}} animate={{opacity:1, x:0}} exit={{opacity:0}} className="mt-4">
                  <div className="text-[#00ff41]/50 text-[10px] mb-1">[{roasts[currentRoast].id}] ERROR_DUMP:</div>
                  <TypewriterText text={roasts[currentRoast].text} className="text-xs" />
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="flex gap-1 justify-center">
              {roasts.map((_, i) => <div key={i} className={cn("w-2 h-0.5", i === currentRoast ? "bg-[#00ff41]" : "bg-[#00ff41]/20")} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const FocusTimer = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [focusDuration, setFocusDuration] = useState(25);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'focus' | 'rest'>('focus');
  const [tasks, setTasks] = useState<{id: number, text: string, completed: boolean}[]>([]);
  const [newTask, setNewTask] = useState('');
  const [interruptions, setInterruptions] = useState(0);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [trees, setTrees] = useState(() => Number(localStorage.getItem('cl_hacker_trees')) || 0);

  useEffect(() => {
    let interval: any;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(p => p - 1), 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      if (mode === 'focus') {
        setSessionCompleted(true);
        const newTrees = trees + 1;
        setTrees(newTrees);
        localStorage.setItem('cl_hacker_trees', newTrees.toString());
        const currentXp = Number(localStorage.getItem('cl_hacker_xp')) || 8420;
        localStorage.setItem('cl_hacker_xp', String(currentXp + 50));
        window.dispatchEvent(new Event('storage'));
      } else {
        setMode('focus');
        setTimeLeft(focusDuration * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode, focusDuration, trees]);

  const m = Math.floor(timeLeft / 60);
  const s = timeLeft % 60;
  const timeStr = `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;

  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks([...tasks, { id: Date.now(), text: newTask, completed: false }]);
    setNewTask('');
  };

  return (
    <div className="p-6 rounded-xl border border-[#00ff41]/30 h-full flex flex-col font-mono relative overflow-hidden bg-[#0a0a0a] shadow-[inset_0_0_30px_rgba(0,255,65,0.02)]">
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] opacity-40 z-0"></div>
      
      <div className="relative z-10 flex flex-col h-full text-[#00ff41]">
        <div className="flex justify-between items-center text-[10px] mb-6 border-b border-[#00ff41]/20 pb-2 text-[#00ff41]/70">
          <span>$ ./focus_node.exe {mode === 'focus' ? '--专注模式' : '--极速冷却'}</span>
          <span>系统在线: {trees} 个运行节点</span>
        </div>

        <div className="flex justify-center text-5xl sm:text-7xl font-bold tracking-widest my-8 items-center border border-[#00ff41] py-4 bg-[#00ff41]/5 shadow-[0_0_15px_rgba(0,255,65,0.1)]">
          <GlitchText text={timeStr} />
        </div>

        <div className="flex justify-center gap-3 mb-6">
          {[15, 25, 45, 60].map(mins => (
            <button
              key={mins} disabled={isActive}
              onClick={() => { setFocusDuration(mins); if (mode === 'focus') setTimeLeft(mins * 60); }}
              className={cn("px-4 py-1.5 text-[11px] border transition-colors font-bold",
                focusDuration === mins ? "bg-[#00ff41] text-black border-[#00ff41]" : "border-[#00ff41]/30 hover:bg-[#00ff41]/10 text-[#00ff41]",
                isActive && "opacity-50"
              )}
            >
              [{mins} 分钟]
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => setIsActive(!isActive)}
            className={cn("flex-grow py-3 text-[13px] font-bold border transition-colors",
              isActive ? "bg-red-950/40 text-red-500 border-red-500/50 hover:bg-red-900/40" : "bg-[#00ff41]/20 text-[#00ff41] border-[#00ff41]/50 hover:bg-[#00ff41]/30"
            )}
          >
            {isActive ? '强行中断进程' : '执行代码流'}
          </button>
          {isActive && mode === 'focus' && (
            <button onClick={() => {
              setInterruptions(p => p + 1);
              const currentXp = Number(localStorage.getItem('cl_hacker_xp')) || 8420;
              localStorage.setItem('cl_hacker_xp', String(Math.max(0, currentXp - 5)));
              window.dispatchEvent(new Event('storage'));
            }} className="px-4 border border-yellow-500/50 text-yellow-500 bg-yellow-950/20 text-[11px] font-bold hover:bg-yellow-900/30">
              干扰! (-5 XP)
            </button>
          )}
        </div>

        <div className="mt-8 border-t border-[#00ff41]/20 pt-4 flex-grow">
          <div className="text-[11px] text-[#00ff41]/50 mb-3 font-bold">任务执行队列:</div>
          <div className="space-y-3 mb-4">
            {tasks.map(t => (
              <div key={t.id} className="flex flex-wrap items-center gap-2 text-xs">
                <button onClick={() => setTasks(tasks.map(x => x.id === t.id ? {...x, completed: !x.completed} : x))} className="text-[#00ff41]">
                  [{t.completed ? 'X' : ' '}]
                </button>
                <span className={t.completed ? 'opacity-50 line-through' : ''}>{t.text}</span>
              </div>
            ))}
            {tasks.length < 3 && (
              <div className="flex items-center gap-2 text-xs">
                <span>{'>'}</span>
                <input type="text" value={newTask} onChange={e => setNewTask(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTask()} placeholder="输入新进程..." className="bg-transparent border-b border-[#00ff41]/50 outline-none flex-grow text-[#00ff41] placeholder-[#00ff41]/30 pb-1" />
              </div>
            )}
          </div>
          
          <div className="flex text-[9px] justify-between text-[#00ff41]/40 border-t border-[#00ff41]/10 pt-3 mt-auto font-bold tracking-widest">
            <span>出错登记: {interruptions}次</span>
            <span>算力结晶: {"🌲".repeat(trees)}</span>
          </div>
        </div>

        {sessionCompleted && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur z-20 flex items-center justify-center p-6">
            <div className="border border-[#00ff41] bg-black p-6 w-full text-center space-y-4 shadow-[0_0_20px_rgba(0,255,65,0.4)]">
              <GlitchText text="进程执行完毕！" className="text-xl font-bold uppercase block text-[#00ff41]" />
              <div className="text-[11px] border border-[#00ff41]/30 p-4 space-y-2 text-left">
                <div className="text-[#00ff41] font-bold">{'>>>'} 系统已注入 +50 点成长经验</div>
                <div className={interruptions > 0 ? "text-yellow-500" : "text-[#00ff41]/70"}>- 警告分析: 检测到 {interruptions} 次外来干扰 (自动扣除经验: {interruptions * 5}点)</div>
                <div className="mt-4 border-t border-[#00ff41]/30 pt-2 text-[#00ff41]/50">建议返回「我的」页面查验黑客等级。</div>
              </div>
              <button onClick={() => { setSessionCompleted(false); setMode('rest'); setTimeLeft(5*60); setInterruptions(0); }} className="px-4 py-3 bg-[#00ff41] text-black text-xs font-bold w-full mt-4">
                进入冷却休眠模式 [ENTER]
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


const GossipZone = () => {
  const [gossips, setGossips] = useState<any[]>([]);
  const [input, setInput] = useState('');

  const handleSubmit = () => {
    if (!input.trim()) return;
    const newGossip = {
      id: Date.now(),
      content: input,
      time: new Date().toLocaleTimeString(),
      likes: 0
    };
    setGossips([newGossip, ...gossips]);
    setInput('');
  };

  return (
    <div className="bg-black p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] border border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.05)] flex flex-col h-[500px] sm:h-[550px] relative overflow-hidden group font-mono">
      {/* Matrix/Tech Aesthetic Background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-20 bg-[length:100%_2px,3px_100%] pointer-events-none"></div>
      </div>
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-between mb-6 sm:mb-8 border-b border-emerald-500/10 pb-4 sm:pb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-1.5 h-1.5 sm:w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,1)]"></div>
            <h4 className="text-xl sm:text-2xl text-emerald-500 font-bold tracking-tighter uppercase">GOSSIP</h4>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 text-emerald-500/40 text-[8px] sm:text-[10px]">
            <Activity size={10} className="sm:hidden animate-pulse" />
            <Activity size={12} className="hidden sm:block animate-pulse" />
            <span className="uppercase tracking-[0.3em] font-bold">Encrypted</span>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto space-y-4 sm:space-y-6 pr-1 sm:pr-2 custom-scrollbar mb-6 sm:mb-8">
          {gossips.length > 0 ? (
            gossips.map((g) => (
              <div key={g.id} className="bg-emerald-500/5 border border-emerald-500/10 p-4 sm:p-6 rounded-xl sm:rounded-2xl animate-fade-in hover:bg-emerald-500/10 transition-all">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <span className="text-[8px] sm:text-[10px] text-emerald-500/60 uppercase tracking-widest flex items-center gap-1.5 sm:gap-2 font-bold">
                    <Terminal size={10} className="sm:hidden" />
                    <Terminal size={12} className="hidden sm:block" /> Node_{g.id.toString().slice(-4)}
                  </span>
                  <span className="text-[8px] sm:text-[10px] text-emerald-500/30 font-bold">{g.time}</span>
                </div>
                <p className="text-emerald-400/90 text-[10px] sm:text-xs leading-relaxed break-words font-medium">
                  {g.content}
                </p>
                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-emerald-500/10 flex items-center justify-between">
                  <button className="flex items-center gap-1.5 sm:gap-2 text-[8px] sm:text-[10px] text-emerald-500/40 hover:text-emerald-500 transition-colors font-bold">
                    <Heart size={10} className="sm:hidden" />
                    <Heart size={12} className="hidden sm:block" /> {g.likes}
                  </button>
                  <div className="flex items-center gap-1.5 sm:gap-2 text-[8px] sm:text-[9px] text-emerald-500/10 font-bold uppercase tracking-widest">
                    <Lock size={10} /> 256-bit AES
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
              <EyeOff size={36} className="sm:hidden text-emerald-500 mb-4" />
              <EyeOff size={48} className="hidden sm:block text-emerald-500 mb-6" />
              <p className="text-[9px] sm:text-[11px] text-emerald-500 uppercase tracking-[0.4em] font-bold">Waiting for transmission...</p>
              <div className="mt-6 sm:mt-8 w-32 sm:w-40 h-0.5 sm:h-1 bg-emerald-500/10 rounded-full overflow-hidden">
                <div className="w-1/2 h-full bg-emerald-500/50 animate-[loading_2s_infinite_linear]"></div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-auto pt-4 sm:pt-6 border-t border-emerald-500/10">
          <div className="relative">
            <div className="absolute -top-6 sm:-top-7 left-0 text-[8px] sm:text-[9px] text-emerald-500/30 uppercase tracking-[0.3em] font-bold">Input Stream</div>
            <textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="w-full bg-emerald-500/5 border border-emerald-500/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-[10px] sm:text-xs text-emerald-400 placeholder:text-emerald-900/50 focus:ring-1 focus:ring-emerald-500/30 focus:border-emerald-500/30 outline-none transition-all resize-none h-20 sm:h-24 font-medium"
            />
            <button 
              onClick={handleSubmit}
              className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 p-2.5 sm:p-3 bg-emerald-500 text-black rounded-lg sm:rounded-xl hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] active:scale-95"
            >
              <Send size={16} className="sm:hidden" />
              <Send size={18} className="hidden sm:block" />
            </button>
          </div>
          <div className="flex justify-between items-center mt-3 sm:mt-4 text-[8px] sm:text-[9px] text-emerald-500/20 uppercase tracking-[0.3em] font-bold">
            <span>Anonymity: High</span>
            <span>Status: Connected</span>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}} />
    </div>
  );
};

const SensitiveCommModule = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-brand-border/10 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden group">
      <div className="grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-7 p-6 md:p-12">
          <div className="flex items-center gap-4 mb-6 md:mb-8">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-brand-dark text-white rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg">
              <ShieldCheck size={20} className="md:hidden" />
              <ShieldCheck size={24} className="hidden md:block" />
            </div>
            <div>
              <span className="px-3 py-1 bg-brand-gold/10 text-brand-gold text-[9px] md:text-[10px] font-bold uppercase tracking-widest rounded-full border border-brand-gold/20">
                对客沟通 Skill
              </span>
            </div>
          </div>
          
          <h3 className="font-serif text-2xl md:text-4xl text-brand-dark mb-3 md:mb-6 tracking-tight">敏感沟通助手</h3>
          <p className="text-sm md:text-lg text-brand-gray mb-6 md:mb-10 font-medium leading-relaxed opacity-70">
            处理对客沟通中“必须说、但不好说”的敏感事项。把最难表达、最容易引发误解的事项，沉淀为高情商、专业、边界清晰的标准化话术。
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-6 md:mb-10">
            {[
              { label: '收费通知', icon: Zap },
              { label: '利率调整', icon: Activity },
              { label: '授信暂缓', icon: AlertCircle },
              { label: '拒绝办理', icon: Ban },
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2 p-3 md:p-4 bg-brand-light-gray/30 rounded-xl md:rounded-2xl border border-brand-border/5 group-hover:bg-brand-gold/5 transition-colors">
                <item.icon size={14} className="text-brand-gold md:hidden" />
                <item.icon size={18} className="text-brand-gold hidden md:block" />
                <span className="text-[9px] md:text-[10px] font-bold text-brand-dark">{item.label}</span>
              </div>
            ))}
          </div>

          <button 
            onClick={() => navigate('/sensitive-comm')}
            className="w-full md:w-auto px-6 md:px-10 py-3.5 md:py-5 bg-brand-dark text-white rounded-xl md:rounded-2xl font-bold text-sm md:text-lg hover:bg-brand-dark/90 transition-all shadow-xl flex items-center justify-center gap-3 group/btn"
          >
            立即进入助手
            <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
        
        <div className="lg:col-span-5 bg-brand-light-gray/20 p-6 md:p-10 flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-brand-border/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
            <Sparkles size={200} />
          </div>
          <div className="space-y-4 md:space-y-6 relative z-10">
            <div className="p-5 md:p-6 bg-white rounded-xl md:rounded-2xl shadow-sm border border-brand-border/5 transform -rotate-1 md:-rotate-2 hover:rotate-0 transition-transform duration-500">
              <p className="text-[9px] md:text-[10px] text-brand-gold font-bold uppercase tracking-widest mb-2">生成示例：授信暂缓</p>
              <p className="text-[11px] md:text-xs text-brand-gray font-medium leading-relaxed italic">
                “现阶段暂不具备推进条件，建议待相关条件补足后再行评估，我会持续帮您关注政策变化。”
              </p>
            </div>
            <div className="p-5 md:p-6 bg-white rounded-xl md:rounded-2xl shadow-sm border border-brand-border/5 transform rotate-1 hover:rotate-0 transition-transform duration-500">
              <p className="text-[9px] md:text-[10px] text-brand-gold font-bold uppercase tracking-widest mb-2">生成示例：收费通知</p>
              <p className="text-[11px] md:text-xs text-brand-gray font-medium leading-relaxed italic">
                “提前和您同步一下，根据行内最新规则...您可以关注下账户日均存款情况，达到标准后可自动减免。”
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const BusinessGuideModule = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-[2rem] md:rounded-[3rem] border border-brand-border/10 shadow-sm hover:shadow-2xl transition-all duration-700 overflow-hidden group">
      <div className="grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-7 p-6 md:p-16">
          <div className="flex items-center gap-4 mb-6 md:mb-8">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-brand-dark text-white rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg">
              <LayoutDashboard size={20} className="md:hidden" />
              <LayoutDashboard size={24} className="hidden md:block" />
            </div>
            <div>
              <h3 className="font-serif text-xl md:text-3xl text-brand-dark tracking-tight">客户经理业务通</h3>
              <p className="text-brand-gold text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em] mt-1">场景化业务打法中心 + 经验风格库</p>
            </div>
          </div>
          
          <p className="text-sm md:text-lg text-brand-gray font-medium leading-relaxed mb-6 md:mb-10 opacity-70">
            把产品知识、行业判断、客户对话和推进路径沉淀成可复用的业务打法。
            解决“面对客户说什么、怎么问、怎么推”的实战痛点。
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-4 mb-8 md:mb-12">
            {[
              { label: '按场景进入', icon: Zap, desc: '首次拜访/他行竞争' },
              { label: '按产品进入', icon: Briefcase, desc: '银承/流贷/抵押' },
              { label: '按行业进入', icon: Target, desc: '制造/贸易/科技' },
            ].map((item, idx) => (
              <div key={idx} className="flex flex-row sm:flex-col items-center sm:items-start gap-4 sm:gap-2 p-4 md:p-5 bg-brand-light-gray/30 rounded-xl md:rounded-2xl border border-brand-border/5 group-hover:bg-brand-gold/5 transition-colors">
                <item.icon size={18} className="text-brand-gold shrink-0" />
                <div>
                  <p className="text-[11px] font-bold text-brand-dark">{item.label}</p>
                  <p className="text-[9px] text-brand-gray font-medium mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={() => navigate('/business-guide')}
            className="w-full md:w-auto px-6 md:px-10 py-3.5 md:py-5 bg-brand-dark text-white rounded-xl md:rounded-2xl font-bold text-sm md:text-lg hover:bg-brand-dark/90 transition-all shadow-xl flex items-center justify-center gap-3 group/btn"
          >
            开启业务通
            <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
        
        <div className="lg:col-span-5 bg-brand-dark p-6 md:p-12 flex flex-col justify-center border-t lg:border-t-0 border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
            <Sparkles size={200} className="text-brand-gold" />
          </div>
          <div className="space-y-6 md:space-y-8 relative z-10">
            <div className="flex items-center gap-4 text-white/40 mb-2">
              <User size={16} />
              <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest">经验上身 · 风格切换</span>
            </div>
            
            <div className="space-y-3 md:space-y-4">
              {[
                { name: 'Amy', style: '关系建立型', desc: '“张总，好久没见，听说咱们公司...”' },
                { name: 'Emily', style: '专业推进型', desc: '“根据我对贵司财报的分析...”' },
              ].map((p, idx) => (
                <div key={idx} className="p-4 md:p-5 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl backdrop-blur-sm transform hover:scale-105 transition-all duration-500">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-brand-gold text-xs font-bold">{p.name}</span>
                    <span className="text-[8px] md:text-[9px] text-white/40 font-bold uppercase tracking-widest">{p.style}</span>
                  </div>
                  <p className="text-[10px] md:text-[11px] text-white/60 italic leading-relaxed">
                    {p.desc}
                  </p>
                </div>
              ))}
            </div>
            
            <div className="pt-2 md:pt-4">
              <p className="text-[9px] md:text-[10px] text-white/30 font-medium leading-relaxed">
                不仅仅是资料库，更是你的“业务操作系统”。
                支持一键复制话术、清单与路径。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ScenarioCenter: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'customer';
  const [showAllSkills, setShowAllSkills] = useState(false);

  const scenarios = [
    { id: 'customer', title: '对客户', icon: Users, desc: '营销话术、业务打法、产品测算。', color: 'bg-apple-blue' },
    { id: 'review', title: '对审查', icon: ShieldCheck, desc: '政策解读、准入核对、合规建议。', color: 'bg-apple-purple' },
    { id: 'backoffice', title: '对中后台', icon: Database, desc: '流程指引、材料清单、系统操作。', color: 'bg-apple-indigo' },
    { id: 'self', title: '对自己', icon: User, desc: '经验沉淀、效率工具、职场成长。', color: 'bg-apple-pink' },
  ];

  const getSkillsByScenario = (scenarioTitle: string) => {
    return SKILLS.filter(skill => skill.scene.includes(scenarioTitle));
  };

  const handleTabChange = (id: string) => {
    setSearchParams({ tab: id });
  };

  return (
    <AppLayout title="场景中心" showBack>
      <div className={cn("pb-16 sm:pb-24 min-h-screen transition-colors duration-700", activeTab === 'self' ? "bg-[#050505]" : "bg-brand-offwhite")}>
        {/* ChatGPT Style Header */}
        <header className="px-6 pt-10 sm:pt-16 pb-8 sm:pb-12 text-center max-w-2xl mx-auto">
          <div className={cn("inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-2xl mb-6 shadow-2xl transform -rotate-3 transition-colors", activeTab === 'self' ? "bg-[#00ff41] text-black" : "bg-brand-dark text-white")}>
            <Compass size={28} className="sm:hidden" />
            <Compass size={36} className="hidden sm:block" />
          </div>
          <h1 className={cn("text-3xl sm:text-5xl font-serif font-bold tracking-tight mb-4 transition-colors", activeTab === 'self' ? "text-[#00ff41]" : "text-brand-dark")}>场景中心</h1>
          <p className={cn("font-medium text-sm sm:text-lg leading-relaxed opacity-70 transition-colors", activeTab === 'self' ? "text-[#00ff41]/70" : "text-brand-gray")}>
            按业务场景组织，直观展示每个环节下的实用工具。
            从客户沟通到内部审批，全方位提升作业效能。
          </p>
        </header>

        {/* Segmented Control Style Tabs */}
        <div className={cn("px-6 mb-8 sm:mb-16 sticky top-0 z-40 backdrop-blur-md py-4", activeTab === 'self' ? "bg-black/80" : "bg-brand-offwhite/80")}>
          <div className={cn("max-w-fit mx-auto p-1 rounded-2xl border flex gap-1", activeTab === 'self' ? "bg-[#1a1a1a] border-[#00ff41]/30" : "bg-brand-light-gray/50 border-brand-border/5")}>
            {scenarios.map((s) => (
              <button
                key={s.id}
                onClick={() => handleTabChange(s.id)}
                className={cn(
                  "px-4 sm:px-8 py-2.5 sm:py-3 rounded-xl text-[12px] sm:text-[14px] font-bold transition-all duration-500 whitespace-nowrap flex items-center gap-2",
                  activeTab === s.id 
                    ? (s.id === 'self' ? "bg-[#00ff41] text-black shadow-[0_0_15px_rgba(0,255,65,0.4)] scale-100" : "bg-white text-brand-dark shadow-xl scale-100") 
                    : (activeTab === 'self' ? "text-[#00ff41]/50 hover:text-[#00ff41] hover:bg-[#00ff41]/10" : "text-brand-gray hover:text-brand-dark hover:bg-white/50")
                )}
              >
                <s.icon size={14} className={cn(activeTab === s.id ? (s.id === 'self' ? "text-black" : "text-brand-dark") : "opacity-40")} />
                {s.title}
              </button>
            ))}
          </div>
        </div>

        <div className="px-6 animate-fade-in relative z-10">
          {scenarios.filter(s => s.id === activeTab).map((s) => {
            const relatedSkills = getSkillsByScenario(s.title);
            return (
              <div key={s.id}>
                {s.id !== 'self' && (
                  <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                    <div className={cn("w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shrink-0", s.color)}>
                      <s.icon size={20} className="text-white sm:hidden" />
                      <s.icon size={24} className="text-white hidden sm:block" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-brand-dark tracking-tight">{s.title}</h2>
                      <p className="text-[10px] sm:text-xs text-brand-gray font-medium opacity-80">{s.desc}</p>
                    </div>
                  </div>
                )}

                {s.id === 'self' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
                    <FoodSelector />
                    <EfficientOffDutyGame />
                    <FocusTimer />
                    <GossipZone />
                    <FengShuiCalendar />
                  </div>
                ) : s.id === 'customer' ? (
                  <div className="space-y-8 sm:space-y-12 md:space-y-16">
                    <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                      <BusinessGuideModule />
                    </div>

                    <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                      <div className="flex items-center justify-between mb-6 sm:mb-10">
                        <h3 className="font-serif text-xl sm:text-2xl md:text-3xl text-brand-dark tracking-tight">核心沟通工具</h3>
                        <div className="h-px flex-grow bg-brand-border/10 ml-4 md:ml-8"></div>
                      </div>
                      <SensitiveCommModule />
                    </div>
 
                    <div className="animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                      <div className="flex items-center justify-between mb-6 sm:mb-10">
                        <h3 className="font-serif text-xl sm:text-2xl md:text-3xl text-brand-dark tracking-tight">材料清单中心</h3>
                        <div className="h-px flex-grow bg-brand-border/10 ml-4 md:ml-8"></div>
                      </div>
                      <MaterialChecklistCenter />
                    </div>
                    
                    <div className="pt-8 sm:pt-10 md:pt-16 border-t border-brand-border/5">
                      <div className="flex items-center justify-between mb-6 sm:mb-8">
                        <h3 className="text-lg sm:text-xl font-bold text-brand-dark tracking-tight">更多实用工具</h3>
                        <button 
                          onClick={() => setShowAllSkills(!showAllSkills)}
                          className="text-[10px] sm:text-xs font-bold text-brand-gray hover:text-brand-dark transition-all flex items-center gap-1"
                        >
                          {showAllSkills ? '收起' : '查看全部'}
                          <ChevronRight size={14} className={cn("transition-transform", showAllSkills && "rotate-90")} />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {relatedSkills
                          .filter(skill => !['sensitive-comm-assistant', 'chang-rong-bao', 'chang-yi-dan'].includes(skill.id))
                          .filter(skill => showAllSkills || ['cd-calculator', 'account-fee-discount'].includes(skill.id))
                          .map(skill => (
                          <div key={skill.id} className="bg-white p-5 sm:p-6 rounded-3xl border border-brand-border/5 shadow-sm hover:shadow-xl transition-all duration-500 group flex flex-col">
                            <div className="flex justify-between items-start mb-4 sm:mb-6">
                              <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 bg-brand-light-gray text-brand-dark text-[8px] sm:text-[9px] font-bold uppercase tracking-widest rounded-full border border-brand-border/10">
                                {skill.category}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <div className={cn("w-1.5 h-1.5 rounded-full", skill.status === '在线可用' ? "bg-emerald-500" : "bg-brand-gray")}></div>
                                <span className="text-[8px] sm:text-[9px] font-bold text-brand-dark uppercase tracking-widest">
                                  {skill.status}
                                </span>
                              </div>
                            </div>
                            <h4 className="text-base sm:text-lg font-bold text-brand-dark mb-2 tracking-tight group-hover:text-apple-blue transition-colors">{skill.name}</h4>
                            <p className="text-[10px] sm:text-xs text-brand-gray mb-6 sm:mb-8 line-clamp-2 font-medium leading-relaxed opacity-80">{skill.description}</p>
                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-brand-border/5">
                              <span className="text-[8px] sm:text-[9px] text-brand-gray/40 font-bold uppercase tracking-[0.2em]">{skill.form}</span>
                              <div className="flex items-center gap-3">
                                <Link to={`/skills/${skill.id}`} className="text-brand-gray text-[10px] sm:text-[11px] font-bold hover:text-brand-dark transition-all">
                                  详情
                                </Link>
                                {skill.status === '在线可用' && skill.toolRoute && (
                                  <Link to={skill.toolRoute} className="text-apple-blue text-[10px] sm:text-[11px] font-bold flex items-center gap-1 hover:gap-2 transition-all bg-apple-blue/5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg">
                                    运行 <ChevronRight size={12} />
                                  </Link>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {relatedSkills.length > 0 ? (
                      relatedSkills.map(skill => (
                        <div key={skill.id} className="bg-white p-6 rounded-3xl border border-brand-border/5 shadow-sm hover:shadow-xl transition-all duration-500 group flex flex-col">
                          <div className="flex justify-between items-start mb-6">
                            <span className="px-3 py-1 bg-brand-light-gray text-brand-dark text-[9px] font-bold uppercase tracking-widest rounded-full border border-brand-border/10">
                              {skill.category}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <div className={cn("w-1.5 h-1.5 rounded-full", skill.status === '在线可用' ? "bg-emerald-500" : "bg-brand-gray")}></div>
                              <span className="text-[9px] font-bold text-brand-dark uppercase tracking-widest">
                                {skill.status}
                              </span>
                            </div>
                          </div>
                          <h4 className="text-lg font-bold text-brand-dark mb-2 tracking-tight group-hover:text-apple-blue transition-colors">{skill.name}</h4>
                          <p className="text-xs text-brand-gray mb-8 line-clamp-2 font-medium leading-relaxed opacity-80">{skill.description}</p>
                          <div className="flex items-center justify-between mt-auto pt-4 border-t border-brand-border/5">
                            <span className="text-[9px] text-brand-gray/40 font-bold uppercase tracking-[0.2em]">{skill.form}</span>
                            <div className="flex items-center gap-3">
                              <Link to={`/skills/${skill.id}`} className="text-brand-gray text-[11px] font-bold hover:text-brand-dark transition-all">
                                详情
                              </Link>
                              {skill.status === '在线可用' && skill.toolRoute && (
                                <Link to={skill.toolRoute} className="text-apple-blue text-[11px] font-bold flex items-center gap-1 hover:gap-2 transition-all bg-apple-blue/5 px-3 py-1.5 rounded-lg">
                                  立即运行 <ChevronRight size={14} />
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full py-20 px-6 bg-white border border-brand-border/5 rounded-[2rem] text-center shadow-sm">
                        <div className="w-16 h-16 bg-brand-light-gray rounded-full flex items-center justify-center mx-auto mb-6">
                          <Search size={28} className="text-brand-gray opacity-30" />
                        </div>
                        <h4 className="text-xl font-bold text-brand-dark mb-2 tracking-tight">即将上线</h4>
                        <p className="text-sm text-brand-gray font-medium opacity-60 mb-8 max-w-md mx-auto">该场景下的更多 Skills 正在由业务专家与 Agent 团队共同打造中，敬请期待...</p>
                        <Link to="/feedback" className="inline-flex items-center gap-2 px-8 py-3 bg-brand-dark text-white rounded-full font-bold text-xs hover:bg-brand-dark/90 transition-all shadow-xl">
                          提交你的场景需求 <ArrowRight size={16} />
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
};

export default ScenarioCenter;
