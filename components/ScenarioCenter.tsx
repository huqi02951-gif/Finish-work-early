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
    
    // Padding for first week
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(Solar.fromYmd(year, month + 1, i));
    }
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
    <div className="flex flex-col h-full bg-brand-dark rounded-3xl overflow-hidden shadow-2xl border border-white/5">
      {/* Header */}
      <div className="p-5 border-b border-white/10 flex justify-between items-center bg-black/20">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-gold" />
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">玄学日历</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => { const d = new Date(currentDate); d.setMonth(d.getMonth() - 1); setCurrentDate(d); }}
            className="p-1.5 hover:bg-white/5 rounded-lg transition-colors text-white/60"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
          </button>
          <span className="text-xs font-bold text-white tracking-widest">
            {currentDate.getFullYear()}年 {currentDate.getMonth() + 1}月
          </span>
          <button 
            onClick={() => { const d = new Date(currentDate); d.setMonth(d.getMonth() + 1); setCurrentDate(d); }}
            className="p-1.5 hover:bg-white/5 rounded-lg transition-colors text-white/60"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto custom-scrollbar p-5 space-y-6">
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {['日', '一', '二', '三', '四', '五', '六'].map(d => (
            <div key={d} className="text-center text-[10px] font-bold text-white/20 py-2">{d}</div>
          ))}
          {daysInMonth().map((day, idx) => {
            if (!day) return <div key={`empty-${idx}`} />;
            const isToday = day.toYmd() === Solar.fromDate(new Date()).toYmd();
            const isSelected = selectedDay?.toYmd() === day.toYmd();
            const info = getFengShuiInfo(day);
            
            return (
              <button
                key={day.toYmd()}
                onClick={() => setSelectedDay(day)}
                className={cn(
                  "aspect-square rounded-xl flex flex-col items-center justify-center transition-all relative group",
                  isSelected ? "bg-brand-gold text-brand-dark shadow-lg scale-105 z-10" : 
                  isToday ? "bg-white/10 text-white" : "hover:bg-white/5 text-white/60"
                )}
              >
                <span className="text-xs font-bold">{day.getDay()}</span>
                <span className={cn(
                  "text-[8px] opacity-40",
                  isSelected ? "text-brand-dark/60" : "text-white/40"
                )}>{info.lunarDay}</span>
                {isToday && !isSelected && <div className="absolute bottom-1.5 w-1 h-1 bg-brand-gold rounded-full" />}
              </button>
            );
          })}
        </div>

        {/* Selected Day Details */}
        <AnimatePresence mode="wait">
          {selectedDay && (
            <motion.div
              key={selectedDay.toYmd()}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white/5 rounded-2xl border border-white/10 p-5 space-y-5"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h5 className="text-lg font-serif text-white mb-1">
                    {selectedDay.getMonth()}月{selectedDay.getDay()}日
                  </h5>
                  <p className="text-[10px] text-brand-gold font-bold uppercase tracking-widest">
                    {getFengShuiInfo(selectedDay).ganZhiYear}年 {getFengShuiInfo(selectedDay).lunarMonth}月 {getFengShuiInfo(selectedDay).lunarDay}
                  </p>
                </div>
                <div className="text-right">
                  <span className="px-2 py-1 bg-brand-gold/20 text-brand-gold rounded text-[10px] font-bold">
                    {getFengShuiInfo(selectedDay).zodiac}年
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                  <div className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mb-2">宜</div>
                  <div className="text-[10px] text-emerald-100/80 leading-relaxed">
                    {getFengShuiInfo(selectedDay).yi.slice(0, 4).join(' · ')}
                  </div>
                </div>
                <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                  <div className="text-[9px] font-bold text-red-500 uppercase tracking-widest mb-2">忌</div>
                  <div className="text-[10px] text-red-100/80 leading-relaxed">
                    {getFengShuiInfo(selectedDay).ji.slice(0, 4).join(' · ')}
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-white/40">五行属性</span>
                  <span className="text-white font-medium">{getFengShuiInfo(selectedDay).wuXing}</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-white/40">每日冲煞</span>
                  <span className="text-white font-medium">{getFengShuiInfo(selectedDay).chong}</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-white/40">喜神方位</span>
                  <span className="text-brand-gold font-bold">{getFengShuiInfo(selectedDay).position}</span>
                </div>
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
    { name: '快餐/西式', items: ['麦当劳 1+1', '肯德基 疯狂星期四', '塔斯汀 中国汉堡', '汉堡王', '赛百味'] },
    { name: '米饭/便当', items: ['隆江猪脚饭', '湘式小炒肉', '照烧鸡腿饭', '台式卤肉饭', '广式烧腊饭', '咖喱牛肉饭', '日式肥牛饭'] },
    { name: '面食/粉类', items: ['兰州拉面', '重庆小面', '柳州螺蛳粉', '南昌拌粉', '山西刀削面', '老北京炸酱面', '河南烩面'] },
    { name: '轻食/减脂', items: ['鸡胸肉沙拉', '全麦三明治', '杂粮饭便当', '荞麦面', '瑞幸 吐司套餐'] },
    { name: '重口/过瘾', items: ['杨国福麻辣烫', '张亮麻辣烫', '一人食冒菜', '麻辣香锅', '酸菜鱼饭'] },
    { name: '街边/小吃', items: ['煎饼果子', '烤冷面', '便利店关东煮', '全家饭团', '萨莉亚'] }
  ];

  const allFoods = foodGroups.flatMap(g => g.items);
  const [current, setCurrent] = useState('今天吃什么？');
  const [currentGroup, setCurrentGroup] = useState('');
  const [isRolling, setIsRolling] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isRolling) {
      interval = setInterval(() => {
        const randomFood = allFoods[Math.floor(Math.random() * allFoods.length)];
        setCurrent(randomFood);
        const group = foodGroups.find(g => g.items.includes(randomFood))?.name || '';
        setCurrentGroup(group);
      }, 80);
    }
    return () => clearInterval(interval);
  }, [isRolling, allFoods]);

  return (
    <div className="bg-white p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] border border-brand-border/10 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col items-center text-center h-full group overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-orange-400/20"></div>
      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-orange-50 text-orange-500 rounded-xl sm:rounded-2xl flex items-center justify-center mb-6 sm:mb-8 group-hover:scale-110 transition-transform duration-500">
        <Utensils size={24} className="sm:hidden" />
        <Utensils size={28} className="hidden sm:block" />
      </div>
      <h4 className="font-serif text-xl sm:text-2xl text-brand-dark mb-1 sm:mb-2 tracking-tight">今天吃什么</h4>
      <p className="text-brand-gray text-[8px] sm:text-[10px] mb-6 sm:mb-10 uppercase tracking-[0.3em] font-bold opacity-60">打工人午餐救星</p>
      
      <div className="w-full py-8 sm:py-12 bg-brand-light-gray/50 rounded-2xl sm:rounded-3xl mb-6 sm:mb-10 flex flex-col items-center justify-center min-h-[120px] sm:min-h-[160px] border border-brand-border/5 relative overflow-hidden">
        {currentGroup && (
          <span className="absolute top-3 sm:top-4 px-2 sm:px-3 py-0.5 sm:py-1 bg-orange-100 text-orange-600 text-[8px] sm:text-[9px] font-bold rounded-full uppercase tracking-widest animate-fade-in">
            {currentGroup}
          </span>
        )}
        <span className={cn(
          "text-xl sm:text-3xl font-bold transition-all duration-200 tracking-tight px-4 sm:px-6",
          isRolling ? "text-brand-gray/30 scale-95 blur-[2px]" : "text-brand-gold scale-110"
        )}>
          {current}
        </span>
      </div>

      <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mb-6 sm:mb-10">
        {foodGroups.slice(0, 4).map(g => (
          <span key={g.name} className="text-[8px] sm:text-[9px] text-brand-gray/40 font-bold border border-brand-border/10 px-2 py-1 rounded-md">
            #{g.name}
          </span>
        ))}
      </div>

      <div className="mt-auto w-full">
        <button 
          onClick={() => setIsRolling(!isRolling)}
          className={cn(
            "w-full py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm transition-all duration-300 shadow-lg active:scale-95",
            !isRolling 
              ? "bg-brand-dark text-white hover:bg-brand-dark/90" 
              : "bg-brand-gold text-brand-dark hover:bg-brand-gold/90"
          )}
        >
          {!isRolling ? '开始挑选' : '就这个了！'}
        </button>
        {!isRolling && current !== '今天吃什么？' && (
          <p className="mt-4 sm:mt-6 text-[10px] sm:text-[11px] text-brand-gray italic font-medium animate-fade-in">“打工人不骗打工人，这顿准没错”</p>
        )}
      </div>
    </div>
  );
};

const EfficientOffDutyGame = () => {
  const [monthlySalary, setMonthlySalary] = useState(10000);
  const [showSalaryInput, setShowSalaryInput] = useState(false);
  const [now, setNow] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'calculator' | 'roast'>('calculator');
  const [quizStep, setQuizStep] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [currentRoast, setCurrentRoast] = useState(0);
  const [declaration, setDeclaration] = useState('');
  const [copied, setCopied] = useState(false);

  // Real-time clock update every second
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Salary calculations
  const workDays = 20;
  const dailySalary = monthlySalary / workDays;
  const hourlyRate = dailySalary / 8;
  const minuteRate = hourlyRate / 60;
  const secondRate = minuteRate / 60;

  const hour = now.getHours();
  const minute = now.getMinutes();
  const second = now.getSeconds();
  const currentMinutes = hour * 60 + minute;
  const workStart = 9 * 60; // 9:00
  const workEnd = 17 * 60;  // 17:00

  const isWorkTime = currentMinutes >= workStart && currentMinutes < workEnd;
  const isOvertime = currentMinutes >= workEnd;
  const isBeforeWork = currentMinutes < workStart;

  // Overtime calculation
  const overtimeMinutes = isOvertime ? currentMinutes - workEnd : 0;
  const overtimeHours = Math.floor(overtimeMinutes / 60);
  const overtimeMins = overtimeMinutes % 60;
  const overtimeLoss = overtimeMinutes * minuteRate + second * secondRate;

  // Work progress
  const workedMinutes = isWorkTime ? currentMinutes - workStart : isOvertime ? 480 : 0;
  const earnedToday = Math.min(workedMinutes, 480) * minuteRate + (isWorkTime ? second * secondRate : 0);
  const minutesUntilOff = isWorkTime ? workEnd - currentMinutes : 0;

  // Roast quotes
  const roasts = [
    { text: "加班一小时，老板又买了一杯星巴克 ☕", emoji: "💰" },
    { text: "你的时间在流逝，但薪水不会因为加班多一分钱", emoji: "⏰" },
    { text: "老板的劳斯莱斯轮胎，就是你加班的青春打的气", emoji: "🚗" },
    { text: "加班不会让你变得更优秀，只会让你变得更便宜", emoji: "📉" },
    { text: "别人下班去健身房，你下班去ICU", emoji: "🏥" },
    { text: "你以为你在拼事业？你只是在帮老板拼豪宅", emoji: "🏠" },
    { text: "加班最大的谎言：我这次忙完就好了", emoji: "🤡" },
    { text: "你996，老板669（6套房6辆车9位数存款）", emoji: "💎" },
    { text: "加一小时班 = 损失一次火锅自由 🍲", emoji: "🍲" },
  ];

  // Quiz
  const quizQuestions = [
    {
      q: "周五下午5:01，老板说'这个不急，你今天做完就行'，你会？",
      options: ["马上开始做", "说好的然后慢慢整理包", "直接说明天做"],
      scores: [0, 5, 10]
    },
    {
      q: "同事在加班，你已经做完了，你会？",
      options: ["留下来陪着", "装作很忙然后偷偷走", "大声说'我走啦再见'"],
      scores: [0, 5, 10]
    },
    {
      q: "老板周末在群里发消息@你，你会？",
      options: ["立刻回复", "假装没看到，周一再处理", "把群设为免打扰"],
      scores: [0, 5, 10]
    },
  ];

  // Declarations
  const declarations = [
    `本人郑重宣布：从今天起，${hour}:${String(minute).padStart(2,'0')}分以后的每一分钟都属于我自己！每加班1分钟 = 损失¥${minuteRate.toFixed(2)}！`,
    `打工人觉醒宣言：我的时薪值¥${hourlyRate.toFixed(0)}，老板休想用加班996偷走我的生活！到点下班是我的权利！`,
    `今日下班公告：本人已于17:00准时关闭工作脑，开启生活脑。如有急事，请联系明天早上9:00的我。当前加班损失估算：¥${overtimeLoss.toFixed(2)}`,
  ];

  const generateDeclaration = () => {
    const d = declarations[Math.floor(Math.random() * declarations.length)];
    setDeclaration(d);
  };

  const copyDeclaration = () => {
    navigator.clipboard.writeText(declaration);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Auto-cycle roast quotes
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentRoast(prev => (prev + 1) % roasts.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col bg-white rounded-3xl border border-brand-border/10 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-3 border-b border-brand-border/5 flex justify-between items-center bg-brand-light-gray/20">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-brand-gold" />
          <span className="text-[11px] font-bold text-brand-dark tracking-wide">高效下班计算器</span>
        </div>
        <div className="flex p-0.5 bg-brand-light-gray/50 rounded-lg">
          <button 
            onClick={() => setActiveTab('calculator')}
            className={cn("px-2.5 py-1 rounded-md text-[10px] font-bold transition-all", activeTab === 'calculator' ? "bg-white text-brand-dark shadow-sm" : "text-brand-gray")}
          >💰 损失计算</button>
          <button 
            onClick={() => setActiveTab('roast')}
            className={cn("px-2.5 py-1 rounded-md text-[10px] font-bold transition-all", activeTab === 'roast' ? "bg-white text-brand-dark shadow-sm" : "text-brand-gray")}
          >🔥 骂醒打工人</button>
        </div>
      </div>

      <div className="p-4">
        <AnimatePresence mode="wait">
          {activeTab === 'calculator' ? (
            <motion.div key="calc" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="space-y-3">
              {/* Salary setting */}
              <div className="flex items-center justify-between">
                <button onClick={() => setShowSalaryInput(!showSalaryInput)} className="text-[10px] text-brand-gray font-medium flex items-center gap-1 hover:text-brand-dark">
                  <Settings className="w-3 h-3" /> 月薪 ¥{monthlySalary.toLocaleString()}
                </button>
                <span className="text-[10px] text-brand-gray font-mono">时薪 ¥{hourlyRate.toFixed(1)}</span>
              </div>
              
              {showSalaryInput && (
                <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} className="overflow-hidden">
                  <input 
                    type="range" min={3000} max={50000} step={500} value={monthlySalary}
                    onChange={e => setMonthlySalary(Number(e.target.value))}
                    className="w-full h-1.5 bg-brand-light-gray rounded-full appearance-none accent-brand-gold"
                  />
                  <div className="flex justify-between text-[9px] text-brand-gray/50 mt-1">
                    <span>¥3,000</span><span>¥50,000</span>
                  </div>
                </motion.div>
              )}

              {/* Main Display */}
              <div className={cn(
                "rounded-2xl p-4 text-center",
                isOvertime ? "bg-red-50 border border-red-200" : isWorkTime ? "bg-emerald-50 border border-emerald-200" : "bg-blue-50 border border-blue-200"
              )}>
                {isBeforeWork && (
                  <>
                    <div className="text-[10px] text-blue-500 font-bold mb-1">☀️ 还没上班呢</div>
                    <div className="text-2xl font-mono font-black text-blue-600">
                      {Math.floor((workStart - currentMinutes)/60)}h {(workStart - currentMinutes) % 60}m
                    </div>
                    <div className="text-[10px] text-blue-400 mt-1">距离上班</div>
                  </>
                )}
                {isWorkTime && (
                  <>
                    <div className="text-[10px] text-emerald-600 font-bold mb-1">⏱️ 正在努力搬砖中</div>
                    <div className="text-3xl font-mono font-black text-emerald-700">
                      {Math.floor(minutesUntilOff/60)}:{String(minutesUntilOff % 60).padStart(2,'0')}:{String(60-second).padStart(2,'0')}
                    </div>
                    <div className="text-[10px] text-emerald-500 mt-1 font-bold">距离下班 · 已赚 ¥{earnedToday.toFixed(2)}</div>
                  </>
                )}
                {isOvertime && (
                  <>
                    <div className="text-[10px] text-red-500 font-bold mb-1 animate-pulse">🚨 加班警报！你在亏钱！</div>
                    <div className="text-3xl font-mono font-black text-red-600">
                      -¥{overtimeLoss.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-red-400 mt-1">
                      已无偿加班 {overtimeHours > 0 ? `${overtimeHours}h ` : ''}{overtimeMins}m {second}s
                    </div>
                  </>
                )}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-brand-light-gray/30 rounded-xl p-2.5 text-center">
                  <div className="text-[9px] text-brand-gray mb-0.5">日薪</div>
                  <div className="text-xs font-bold text-brand-dark">¥{dailySalary.toFixed(0)}</div>
                </div>
                <div className="bg-brand-light-gray/30 rounded-xl p-2.5 text-center">
                  <div className="text-[9px] text-brand-gray mb-0.5">每分钟</div>
                  <div className="text-xs font-bold text-brand-dark">¥{minuteRate.toFixed(2)}</div>
                </div>
                <div className="bg-brand-light-gray/30 rounded-xl p-2.5 text-center">
                  <div className="text-[9px] text-brand-gray mb-0.5">今日已赚</div>
                  <div className="text-xs font-bold text-emerald-600">¥{earnedToday.toFixed(0)}</div>
                </div>
              </div>

              {/* Overtime guilt bar (only when overtime) */}
              {isOvertime && (
                <div className="bg-red-50 rounded-xl p-3 border border-red-100">
                  <div className="text-[10px] font-bold text-red-600 mb-2">加班等价损失清单：</div>
                  <div className="space-y-1.5">
                    {[
                      { icon: "🍜", text: "一碗热干面", cost: 12 },
                      { icon: "☕", text: "一杯美式咖啡", cost: 25 },
                      { icon: "🍔", text: "一份麦当劳套餐", cost: 39 },
                      { icon: "🎬", text: "一张电影票", cost: 50 },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-[10px] text-red-700">{item.icon} {item.text}</span>
                        <span className={cn("text-[10px] font-mono font-bold", overtimeLoss >= item.cost ? "text-red-600" : "text-red-300")}>
                          {overtimeLoss >= item.cost ? "✅ 已损失" : `还差¥${(item.cost - overtimeLoss).toFixed(1)}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key="roast" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="space-y-3">
              {/* Roast Quotes Carousel */}
              <div className="bg-brand-dark rounded-2xl p-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-brand-gold/10 rounded-full blur-2xl" />
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentRoast}
                    initial={{opacity:0,y:10}}
                    animate={{opacity:1,y:0}}
                    exit={{opacity:0,y:-10}}
                    className="relative z-10"
                  >
                    <div className="text-xl mb-2">{roasts[currentRoast].emoji}</div>
                    <p className="text-[12px] text-white/80 leading-relaxed font-medium">{roasts[currentRoast].text}</p>
                  </motion.div>
                </AnimatePresence>
                <div className="flex gap-1 mt-3">
                  {roasts.map((_, i) => (
                    <div key={i} className={cn("h-0.5 rounded-full transition-all", i === currentRoast ? "w-4 bg-brand-gold" : "w-1.5 bg-white/20")} />
                  ))}
                </div>
              </div>

              {/* Quiz */}
              {!showQuizResult ? (
                <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
                  <div className="text-[10px] font-bold text-amber-700 mb-2 uppercase tracking-wider">🧠 打工觉醒测试 ({quizStep + 1}/{quizQuestions.length})</div>
                  <p className="text-[12px] font-bold text-brand-dark mb-3 leading-relaxed">{quizQuestions[quizStep].q}</p>
                  <div className="space-y-1.5">
                    {quizQuestions[quizStep].options.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          const newScore = quizScore + quizQuestions[quizStep].scores[idx];
                          setQuizScore(newScore);
                          if (quizStep < quizQuestions.length - 1) {
                            setQuizStep(quizStep + 1);
                          } else {
                            setShowQuizResult(true);
                          }
                        }}
                        className="w-full text-left px-3 py-2 bg-white rounded-xl text-[11px] font-medium text-brand-dark hover:bg-amber-100 transition-all border border-amber-100 active:scale-[0.98]"
                      >
                        {String.fromCharCode(65 + idx)}. {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <motion.div initial={{scale:0.9,opacity:0}} animate={{scale:1,opacity:1}} className="bg-amber-50 rounded-2xl p-4 border border-amber-200 text-center">
                  <div className="text-2xl mb-2">{quizScore >= 25 ? "🏆" : quizScore >= 15 ? "💪" : "😰"}</div>
                  <div className="text-lg font-bold text-brand-dark mb-1">觉醒指数：{quizScore}/30</div>
                  <p className="text-[11px] text-amber-700 mb-3">
                    {quizScore >= 25 ? "恭喜！你是下班之神 🎉 准时下班对你来说就是呼吸一样自然" : 
                     quizScore >= 15 ? "还行，有觉醒意识但还需反复练习" : "严重警告⚠️ 你正在被职场PUA，请立刻觉醒！"}
                  </p>
                  <button onClick={() => {setQuizStep(0);setQuizScore(0);setShowQuizResult(false)}} className="px-4 py-1.5 rounded-lg bg-amber-200 text-amber-800 text-[11px] font-bold">再测一次</button>
                </motion.div>
              )}

              {/* Declaration Generator */}
              <div className="bg-brand-light-gray/30 rounded-2xl p-4 border border-brand-border/5">
                <button 
                  onClick={generateDeclaration}
                  className="w-full py-2.5 bg-brand-dark text-white rounded-xl text-[11px] font-bold hover:bg-brand-dark/90 transition-all flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Send className="w-3 h-3" /> 生成下班宣言
                </button>
                {declaration && (
                  <motion.div initial={{opacity:0,y:5}} animate={{opacity:1,y:0}} className="mt-3 p-3 bg-white rounded-xl border border-brand-border/10">
                    <p className="text-[11px] text-brand-dark leading-relaxed">{declaration}</p>
                    <button 
                      onClick={copyDeclaration}
                      className="mt-2 px-3 py-1 bg-brand-gold/10 text-brand-gold rounded-lg text-[10px] font-bold hover:bg-brand-gold/20 transition-all"
                    >
                      {copied ? "✅ 已复制" : "📋 复制分享"}
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};



const FocusTimer = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [focusDuration, setFocusDuration] = useState(25);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'focus' | 'rest'>('focus');
  const [copyMode, setCopyMode] = useState<'gentle' | 'toxic'>('toxic');
  const [tasks, setTasks] = useState<{id: number, text: string, completed: boolean}[]>([]);
  const [newTask, setNewTask] = useState('');
  const [interruptions, setInterruptions] = useState(0);
  const [showReview, setShowReview] = useState(false);
  const [completedTomatoes, setCompletedTomatoes] = useState(0);

  const copy = {
    gentle: {
      focus: "这一刻，只属于你和你的任务。",
      rest: "辛苦了，给大脑一个深呼吸。",
      start: "慢慢来，比较快。"
    },
    toxic: {
      focus: "别看手机了，手机里没有你的年终奖。",
      rest: "起来活动下，别年纪轻轻腰就废了。",
      start: "你的工资高到值得你无效加班吗？"
    }
  };

  useEffect(() => {
    let interval: any;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      if (mode === 'focus') {
        setCompletedTomatoes(prev => prev + 1);
        setShowReview(true);
      } else {
        setMode('focus');
        setTimeLeft(focusDuration * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode, focusDuration]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks([...tasks, { id: Date.now(), text: newTask, completed: false }]);
    setNewTask('');
  };

  return (
    <div className="bg-white p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] border border-brand-border/10 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col h-full group relative overflow-hidden">
      <div className={cn(
        "absolute top-0 left-0 w-full h-1 transition-colors duration-500",
        mode === 'focus' ? "bg-brand-dark" : "bg-emerald-400"
      )}></div>
      
      <div className="flex justify-between items-start mb-6 sm:mb-8">
        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-brand-light-gray text-brand-dark rounded-xl sm:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
          <Timer size={24} className="sm:hidden" />
          <Timer size={28} className="hidden sm:block" />
        </div>
        <div className="flex gap-1.5 sm:gap-2">
          <button 
            onClick={() => setCopyMode('gentle')}
            className={cn("px-2.5 sm:px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-bold transition-all", copyMode === 'gentle' ? "bg-brand-gold text-brand-dark" : "bg-brand-light-gray text-brand-gray")}
          >温和</button>
          <button 
            onClick={() => setCopyMode('toxic')}
            className={cn("px-2.5 sm:px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-bold transition-all", copyMode === 'toxic' ? "bg-brand-dark text-white" : "bg-brand-light-gray text-brand-gray")}
          >毒舌</button>
        </div>
      </div>

      <h4 className="font-serif text-xl sm:text-2xl text-brand-dark mb-1 sm:mb-2 tracking-tight">打工人番茄时钟</h4>
      <p className="text-brand-gray text-[8px] sm:text-[10px] mb-6 sm:mb-8 uppercase tracking-[0.3em] font-bold opacity-60">
        {mode === 'focus' ? copy[copyMode].focus : copy[copyMode].rest}
      </p>

      <div className="text-5xl sm:text-7xl font-mono font-bold text-brand-dark mb-6 tracking-tighter tabular-nums text-center">
        {formatTime(timeLeft)}
      </div>

      {/* Duration Selector */}
      <div className="flex justify-center gap-2 sm:gap-3 mb-8 sm:mb-10">
        {[15, 25, 45, 60].map(mins => (
          <button
            key={mins}
            disabled={isActive}
            onClick={() => {
              setFocusDuration(mins);
              if (mode === 'focus') setTimeLeft(mins * 60);
            }}
            className={cn(
              "px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-bold transition-all border",
              focusDuration === mins 
                ? "bg-brand-dark text-white border-brand-dark shadow-lg scale-105" 
                : "bg-white text-brand-gray border-brand-border/20 hover:border-brand-border/50",
              isActive && "opacity-50 cursor-not-allowed"
            )}
          >
            {mins}m
          </button>
        ))}
      </div>

      <div className="flex gap-3 sm:gap-4 w-full mb-6 sm:mb-8">
        <button 
          onClick={() => setIsActive(!isActive)}
          className={cn(
            "flex-grow py-4 sm:py-5 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm transition-all duration-300 shadow-xl active:scale-95",
            isActive ? "bg-brand-light-gray text-brand-gray" : "bg-brand-dark text-white"
          )}
        >
          {isActive ? '暂停' : (mode === 'focus' ? '开始专注' : '开始休息')}
        </button>
        {isActive && mode === 'focus' && (
          <button 
            onClick={() => setInterruptions(prev => prev + 1)}
            className="px-4 sm:px-6 bg-red-50 text-red-500 rounded-xl sm:rounded-2xl font-bold text-[10px] sm:text-xs hover:bg-red-100 transition-all"
          >
            被打断
          </button>
        )}
      </div>

      {/* Task List Section */}
      <div className="w-full pt-6 sm:pt-8 border-t border-brand-border/10 mt-auto">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <p className="text-[9px] sm:text-[11px] font-bold text-brand-gray uppercase tracking-widest opacity-60">今日三件事</p>
          <span className="text-[9px] sm:text-[11px] font-bold text-brand-gold bg-brand-gold/10 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">{completedTomatoes} 🍅</span>
        </div>
        
        <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6 max-h-[100px] sm:max-h-[120px] overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">
          {tasks.map(task => (
            <div key={task.id} className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-brand-light-gray/50 rounded-lg sm:rounded-xl border border-brand-border/5">
              <input 
                type="checkbox" 
                checked={task.completed}
                onChange={() => setTasks(tasks.map(t => t.id === task.id ? {...t, completed: !t.completed} : t))}
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border-brand-border text-brand-gold focus:ring-brand-gold"
              />
              <span className={cn("text-[10px] sm:text-xs font-medium", task.completed ? "line-through text-brand-gray/50" : "text-brand-dark")}>
                {task.text}
              </span>
            </div>
          ))}
          {tasks.length < 3 && (
            <div className="flex gap-2">
              <input 
                type="text" 
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTask()}
                placeholder="添加任务..."
                className="flex-grow bg-transparent border-b border-brand-border/30 text-[10px] sm:text-xs py-1.5 sm:py-2 outline-none focus:border-brand-gold transition-colors"
              />
              <button onClick={addTask} className="text-brand-gold hover:text-brand-dark"><ChevronRight size={16} /></button>
            </div>
          )}
        </div>

        <div className="flex justify-between text-[8px] sm:text-[9px] text-brand-gray font-bold uppercase tracking-widest opacity-40">
          <span>被打断次数: {interruptions}</span>
          <span>中速力运行中</span>
        </div>
      </div>

      {/* Review Modal */}
      {showReview && (
        <div className="absolute inset-0 glass z-50 flex items-center justify-center p-6 sm:p-8 animate-fade-in">
          <div className="bg-white w-full rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 shadow-2xl border border-brand-border/20">
            <Sparkles className="text-brand-gold mb-3 sm:mb-4 mx-auto sm:hidden" size={24} />
            <Sparkles className="text-brand-gold mb-3 sm:mb-4 mx-auto hidden sm:block" size={32} />
            <h5 className="text-center font-serif text-lg sm:text-xl text-brand-dark mb-4 sm:mb-6">番茄完成！一分钟复盘</h5>
            <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
              <p className="text-[9px] sm:text-[11px] text-brand-gray font-bold uppercase tracking-widest">1. 我完成了什么？</p>
              <p className="text-[10px] sm:text-xs text-brand-dark font-medium bg-brand-light-gray p-2.5 sm:p-3 rounded-lg sm:rounded-xl">已记录一个番茄时间</p>
              <p className="text-[9px] sm:text-[11px] text-brand-gray font-bold uppercase tracking-widest">2. 刚才被打断了吗？</p>
              <p className="text-[10px] sm:text-xs text-brand-dark font-medium bg-brand-light-gray p-2.5 sm:p-3 rounded-lg sm:rounded-xl">{interruptions > 0 ? `是的，被干扰了 ${interruptions} 次` : '全程专注，非常棒'}</p>
            </div>
            <button 
              onClick={() => {
                setShowReview(false);
                setMode('rest');
                setTimeLeft(5 * 60);
                setInterruptions(0);
              }}
              className="w-full py-3.5 sm:py-4 bg-brand-dark text-white rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm shadow-xl"
            >
              开始休息
            </button>
          </div>
        </div>
      )}
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
      <div className="pb-16 sm:pb-24 bg-brand-offwhite min-h-screen">
        {/* ChatGPT Style Header */}
        <header className="px-6 pt-10 sm:pt-16 pb-8 sm:pb-12 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-brand-dark text-white rounded-2xl mb-6 shadow-2xl transform -rotate-3">
            <Compass size={28} className="sm:hidden" />
            <Compass size={36} className="hidden sm:block" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight text-brand-dark mb-4">场景中心</h1>
          <p className="text-brand-gray font-medium text-sm sm:text-lg leading-relaxed opacity-70">
            按业务场景组织，直观展示每个环节下的实用工具。
            从客户沟通到内部审批，全方位提升作业效能。
          </p>
        </header>

        {/* Segmented Control Style Tabs */}
        <div className="px-6 mb-8 sm:mb-16 sticky top-0 z-40 bg-brand-offwhite/80 backdrop-blur-md py-4">
          <div className="max-w-fit mx-auto p-1 bg-brand-light-gray/50 rounded-2xl border border-brand-border/5 flex gap-1">
            {scenarios.map((s) => (
              <button
                key={s.id}
                onClick={() => handleTabChange(s.id)}
                className={cn(
                  "px-4 sm:px-8 py-2.5 sm:py-3 rounded-xl text-[12px] sm:text-[14px] font-bold transition-all duration-500 whitespace-nowrap flex items-center gap-2",
                  activeTab === s.id 
                    ? "bg-white text-brand-dark shadow-xl scale-100" 
                    : "text-brand-gray hover:text-brand-dark hover:bg-white/50"
                )}
              >
                <s.icon size={14} className={cn(activeTab === s.id ? "text-brand-dark" : "opacity-40")} />
                {s.title}
              </button>
            ))}
          </div>
        </div>

        <div className="px-6 animate-fade-in">
          {scenarios.filter(s => s.id === activeTab).map((s) => {
            const relatedSkills = getSkillsByScenario(s.title);
            return (
              <div key={s.id}>
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
