import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Users, ShieldCheck, Briefcase, UserCheck, ArrowRight, Utensils, Coffee, Timer, RotateCcw, Sparkles, Send, Heart, Terminal, Lock, EyeOff, Activity, ChevronRight, Search, FileText } from 'lucide-react';
import { SKILLS } from '../constants/skills';
import { cn } from '../lib/utils';
import MaterialChecklistCenter from './MaterialChecklistCenter';

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
    <div className="bg-white p-10 rounded-[2.5rem] border border-brand-border/10 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col items-center text-center h-full group overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-orange-400/20"></div>
      <div className="w-14 h-14 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
        <Utensils size={28} />
      </div>
      <h4 className="font-serif text-2xl text-brand-dark mb-2 tracking-tight">今天吃什么</h4>
      <p className="text-brand-gray text-[10px] mb-10 uppercase tracking-[0.3em] font-bold opacity-60">打工人午餐救星</p>
      
      <div className="w-full py-12 bg-brand-light-gray/50 rounded-3xl mb-10 flex flex-col items-center justify-center min-h-[160px] border border-brand-border/5 relative overflow-hidden">
        {currentGroup && (
          <span className="absolute top-4 px-3 py-1 bg-orange-100 text-orange-600 text-[9px] font-bold rounded-full uppercase tracking-widest animate-fade-in">
            {currentGroup}
          </span>
        )}
        <span className={cn(
          "text-3xl font-bold transition-all duration-200 tracking-tight px-6",
          isRolling ? "text-brand-gray/30 scale-95 blur-[2px]" : "text-brand-gold scale-110"
        )}>
          {current}
        </span>
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {foodGroups.slice(0, 4).map(g => (
          <span key={g.name} className="text-[9px] text-brand-gray/40 font-bold border border-brand-border/10 px-2 py-1 rounded-md">
            #{g.name}
          </span>
        ))}
      </div>

      <div className="mt-auto w-full">
        <button 
          onClick={() => setIsRolling(!isRolling)}
          className={cn(
            "w-full py-4 rounded-2xl font-bold text-sm transition-all duration-300 shadow-lg active:scale-95",
            !isRolling 
              ? "bg-brand-dark text-white hover:bg-brand-dark/90" 
              : "bg-brand-gold text-brand-dark hover:bg-brand-gold/90"
          )}
        >
          {!isRolling ? '开始挑选' : '就这个了！'}
        </button>
        {!isRolling && current !== '今天吃什么？' && (
          <p className="mt-6 text-[11px] text-brand-gray italic font-medium animate-fade-in">“打工人不骗打工人，这顿准没错”</p>
        )}
      </div>
    </div>
  );
};

const EfficientOffDutyGame = () => {
  const [sanity, setSanity] = useState(0);
  const [currentPie, setCurrentPie] = useState(0);
  const [isShattering, setIsShattering] = useState(false);
  const [showTruth, setShowTruth] = useState(false);

  const pies = [
    { lie: "你是公司的关键齿轮", truth: "春节没你地球也转，少演深情，赶紧下班。" },
    { lie: "这个项目对你很重要", truth: "项目是老板的资产，加班是你的负债。清醒点。" },
    { lie: "我们要有主人翁意识", truth: "工资是工资，股份你有吗？别拿命填别人的账本。" },
    { lie: "年轻人要多磨炼", truth: "磨炼的是你，收益的是他。你只是个好用的耗材。" },
    { lie: "大家再辛苦一下", truth: "辛苦的是你，买房的是他。每多加一小时，你就在稀释自己。" },
    { lie: "这是为了你的成长", truth: "成长了压榨效率，降低了生存质量。这叫折旧。" },
    { lie: "我们要看长远发展", truth: "长远是画饼，当下是白嫖。沉默默认能扛，以后更惨。" }
  ];

  const handleShatter = () => {
    setIsShattering(true);
    setTimeout(() => {
      setIsShattering(false);
      setShowTruth(true);
      if (sanity < 100) setSanity(prev => Math.min(100, prev + 20));
    }, 600);
  };

  const nextPie = () => {
    setShowTruth(false);
    setCurrentPie((currentPie + 1) % pies.length);
  };

  return (
    <div className="bg-white p-10 rounded-[2.5rem] border border-brand-border/10 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col h-full group relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-brand-gold/20"></div>
      
      <div className="flex justify-between items-start mb-8">
        <div>
          <h4 className="font-serif text-2xl text-brand-dark mb-1 tracking-tight">高效下班</h4>
          <p className="text-brand-gray text-[10px] uppercase tracking-[0.3em] font-bold opacity-60">职场画饼粉碎机</p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-1">清醒值</span>
          <div className="w-24 h-1.5 bg-brand-light-gray rounded-full overflow-hidden">
            <div 
              className="h-full bg-brand-gold transition-all duration-1000 ease-out"
              style={{ width: `${sanity}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center py-6 relative">
        {!showTruth ? (
          <div className={cn(
            "text-center transition-all duration-500",
            isShattering ? "scale-150 opacity-0 blur-xl" : "scale-100 opacity-100"
          )}>
            <div className="w-20 h-20 bg-brand-light-gray rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner relative">
              <span className="text-4xl">🥧</span>
              <div className="absolute -top-2 -right-2 bg-brand-dark text-white text-[8px] px-2 py-1 rounded-full font-bold animate-bounce">BOSS PIE</div>
            </div>
            <p className="text-brand-dark font-serif text-xl mb-8 leading-tight italic">“{pies[currentPie].lie}”</p>
            <button 
              onClick={handleShatter}
              disabled={isShattering}
              className="px-8 py-3 bg-brand-dark text-white rounded-xl font-bold text-xs hover:bg-brand-dark/90 transition-all active:scale-95 flex items-center gap-2 mx-auto"
            >
              <Sparkles size={14} className="text-brand-gold" /> 粉碎幻觉
            </button>
          </div>
        ) : (
          <div className="text-center animate-fade-in-up w-full">
            <div className="w-20 h-20 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🦔</span>
            </div>
            <div className="bg-brand-dark p-6 rounded-2xl mb-8 relative">
              <div className="absolute -top-2 -left-2 bg-brand-gold text-brand-dark text-[8px] px-2 py-1 rounded-full font-bold">TRUTH</div>
              <p className="text-white text-sm font-medium leading-relaxed">
                {pies[currentPie].truth}
              </p>
            </div>
            <button 
              onClick={nextPie}
              className="text-brand-gold text-[11px] font-bold uppercase tracking-widest hover:gap-3 transition-all flex items-center gap-2 mx-auto"
            >
              Next Lie <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      <div className="mt-8 pt-8 border-t border-brand-border/10">
        <button 
          disabled={sanity < 60}
          className={cn(
            "w-full py-4 rounded-2xl font-bold text-sm transition-all duration-500 flex items-center justify-center gap-2 shadow-xl",
            sanity >= 60 
              ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20" 
              : "bg-brand-light-gray text-brand-gray cursor-not-allowed opacity-50"
          )}
        >
          <Timer size={18} /> {sanity >= 60 ? "立刻下班，去过人生" : `清醒值不足 (${sanity}/60)`}
        </button>
        <p className="text-center mt-4 text-[9px] text-brand-gray font-medium opacity-40 uppercase tracking-widest">
          {sanity >= 60 ? "检测到神智清醒，准许撤离" : "幻觉过重，请继续粉碎"}
        </p>
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
    <div className="bg-white p-10 rounded-[2.5rem] border border-brand-border/10 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col h-full group relative overflow-hidden">
      <div className={cn(
        "absolute top-0 left-0 w-full h-1 transition-colors duration-500",
        mode === 'focus' ? "bg-brand-dark" : "bg-emerald-400"
      )}></div>
      
      <div className="flex justify-between items-start mb-8">
        <div className="w-14 h-14 bg-brand-light-gray text-brand-dark rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
          <Timer size={28} />
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setCopyMode('gentle')}
            className={cn("px-3 py-1 rounded-full text-[10px] font-bold transition-all", copyMode === 'gentle' ? "bg-brand-gold text-brand-dark" : "bg-brand-light-gray text-brand-gray")}
          >温和</button>
          <button 
            onClick={() => setCopyMode('toxic')}
            className={cn("px-3 py-1 rounded-full text-[10px] font-bold transition-all", copyMode === 'toxic' ? "bg-brand-dark text-white" : "bg-brand-light-gray text-brand-gray")}
          >毒舌</button>
        </div>
      </div>

      <h4 className="font-serif text-2xl text-brand-dark mb-2 tracking-tight">打工人番茄时钟</h4>
      <p className="text-brand-gray text-[10px] mb-8 uppercase tracking-[0.3em] font-bold opacity-60">
        {mode === 'focus' ? copy[copyMode].focus : copy[copyMode].rest}
      </p>

      <div className="text-7xl font-mono font-bold text-brand-dark mb-6 tracking-tighter tabular-nums text-center">
        {formatTime(timeLeft)}
      </div>

      {/* Duration Selector */}
      <div className="flex justify-center gap-3 mb-10">
        {[15, 25, 45, 60].map(mins => (
          <button
            key={mins}
            disabled={isActive}
            onClick={() => {
              setFocusDuration(mins);
              if (mode === 'focus') setTimeLeft(mins * 60);
            }}
            className={cn(
              "px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all border",
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

      <div className="flex gap-4 w-full mb-8">
        <button 
          onClick={() => setIsActive(!isActive)}
          className={cn(
            "flex-grow py-5 rounded-2xl font-bold text-sm transition-all duration-300 shadow-xl active:scale-95",
            isActive ? "bg-brand-light-gray text-brand-gray" : "bg-brand-dark text-white"
          )}
        >
          {isActive ? '暂停' : (mode === 'focus' ? '开始专注' : '开始休息')}
        </button>
        {isActive && mode === 'focus' && (
          <button 
            onClick={() => setInterruptions(prev => prev + 1)}
            className="px-6 bg-red-50 text-red-500 rounded-2xl font-bold text-xs hover:bg-red-100 transition-all"
          >
            被打断
          </button>
        )}
      </div>

      {/* Task List Section */}
      <div className="w-full pt-8 border-t border-brand-border/10 mt-auto">
        <div className="flex justify-between items-center mb-6">
          <p className="text-[11px] font-bold text-brand-gray uppercase tracking-widest opacity-60">今日三件事</p>
          <span className="text-[11px] font-bold text-brand-gold bg-brand-gold/10 px-3 py-1 rounded-full">{completedTomatoes} 🍅</span>
        </div>
        
        <div className="space-y-3 mb-6 max-h-[120px] overflow-y-auto pr-2 custom-scrollbar">
          {tasks.map(task => (
            <div key={task.id} className="flex items-center gap-3 p-3 bg-brand-light-gray/50 rounded-xl border border-brand-border/5">
              <input 
                type="checkbox" 
                checked={task.completed}
                onChange={() => setTasks(tasks.map(t => t.id === task.id ? {...t, completed: !t.completed} : t))}
                className="w-4 h-4 rounded border-brand-border text-brand-gold focus:ring-brand-gold"
              />
              <span className={cn("text-xs font-medium", task.completed ? "line-through text-brand-gray/50" : "text-brand-dark")}>
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
                className="flex-grow bg-transparent border-b border-brand-border/30 text-xs py-2 outline-none focus:border-brand-gold transition-colors"
              />
              <button onClick={addTask} className="text-brand-gold hover:text-brand-dark"><ChevronRight size={18} /></button>
            </div>
          )}
        </div>

        <div className="flex justify-between text-[9px] text-brand-gray font-bold uppercase tracking-widest opacity-40">
          <span>被打断次数: {interruptions}</span>
          <span>中速力运行中</span>
        </div>
      </div>

      {/* Review Modal */}
      {showReview && (
        <div className="absolute inset-0 glass z-50 flex items-center justify-center p-8 animate-fade-in">
          <div className="bg-white w-full rounded-[2.5rem] p-8 shadow-2xl border border-brand-border/20">
            <Sparkles className="text-brand-gold mb-4 mx-auto" size={32} />
            <h5 className="text-center font-serif text-xl text-brand-dark mb-6">番茄完成！一分钟复盘</h5>
            <div className="space-y-4 mb-8">
              <p className="text-[11px] text-brand-gray font-bold uppercase tracking-widest">1. 我完成了什么？</p>
              <p className="text-xs text-brand-dark font-medium bg-brand-light-gray p-3 rounded-xl">已记录一个番茄时间</p>
              <p className="text-[11px] text-brand-gray font-bold uppercase tracking-widest">2. 刚才被打断了吗？</p>
              <p className="text-xs text-brand-dark font-medium bg-brand-light-gray p-3 rounded-xl">{interruptions > 0 ? `是的，被干扰了 ${interruptions} 次` : '全程专注，非常棒'}</p>
            </div>
            <button 
              onClick={() => {
                setShowReview(false);
                setMode('rest');
                setTimeLeft(5 * 60);
                setInterruptions(0);
              }}
              className="w-full py-4 bg-brand-dark text-white rounded-2xl font-bold text-sm shadow-xl"
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
    <div className="bg-black p-10 rounded-[2.5rem] border border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.05)] flex flex-col h-[550px] relative overflow-hidden group font-mono">
      {/* Matrix/Tech Aesthetic Background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-20 bg-[length:100%_2px,3px_100%] pointer-events-none"></div>
      </div>
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-between mb-8 border-b border-emerald-500/10 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,1)]"></div>
            <h4 className="text-2xl text-emerald-500 font-bold tracking-tighter uppercase">GOSSIP</h4>
          </div>
          <div className="flex items-center gap-2 text-emerald-500/40 text-[10px]">
            <Activity size={12} className="animate-pulse" />
            <span className="uppercase tracking-[0.3em] font-bold">Encrypted</span>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto space-y-6 pr-2 custom-scrollbar mb-8">
          {gossips.length > 0 ? (
            gossips.map((g) => (
              <div key={g.id} className="bg-emerald-500/5 border border-emerald-500/10 p-6 rounded-2xl animate-fade-in hover:bg-emerald-500/10 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] text-emerald-500/60 uppercase tracking-widest flex items-center gap-2 font-bold">
                    <Terminal size={12} /> Node_{g.id.toString().slice(-4)}
                  </span>
                  <span className="text-[10px] text-emerald-500/30 font-bold">{g.time}</span>
                </div>
                <p className="text-emerald-400/90 text-xs leading-relaxed break-words font-medium">
                  {g.content}
                </p>
                <div className="mt-4 pt-4 border-t border-emerald-500/10 flex items-center justify-between">
                  <button className="flex items-center gap-2 text-[10px] text-emerald-500/40 hover:text-emerald-500 transition-colors font-bold">
                    <Heart size={12} /> {g.likes}
                  </button>
                  <div className="flex items-center gap-2 text-[9px] text-emerald-500/10 font-bold uppercase tracking-widest">
                    <Lock size={10} /> 256-bit AES
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
              <EyeOff size={48} className="text-emerald-500 mb-6" />
              <p className="text-[11px] text-emerald-500 uppercase tracking-[0.4em] font-bold">Waiting for transmission...</p>
              <div className="mt-8 w-40 h-1 bg-emerald-500/10 rounded-full overflow-hidden">
                <div className="w-1/2 h-full bg-emerald-500/50 animate-[loading_2s_infinite_linear]"></div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-auto pt-6 border-t border-emerald-500/10">
          <div className="relative">
            <div className="absolute -top-7 left-0 text-[9px] text-emerald-500/30 uppercase tracking-[0.3em] font-bold">Input Stream</div>
            <textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="w-full bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4 text-xs text-emerald-400 placeholder:text-emerald-900/50 focus:ring-1 focus:ring-emerald-500/30 focus:border-emerald-500/30 outline-none transition-all resize-none h-24 font-medium"
            />
            <button 
              onClick={handleSubmit}
              className="absolute bottom-4 right-4 p-3 bg-emerald-500 text-black rounded-xl hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] active:scale-95"
            >
              <Send size={18} />
            </button>
          </div>
          <div className="flex justify-between items-center mt-4 text-[9px] text-emerald-500/20 uppercase tracking-[0.3em] font-bold">
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

const ScenarioCenter: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'customer';

  const scenarios = [
    { id: 'customer', title: '对客户', icon: Users, desc: '把专业术语转化为客户听得懂的话，提升沟通效率。', color: 'bg-blue-50 text-blue-600' },
    { id: 'audit', title: '对审查', icon: ShieldCheck, desc: '自动生成结构化、规范化的报批文案，降低退件率。', color: 'bg-green-50 text-green-600' },
    { id: 'backoffice', title: '对中后台', icon: Briefcase, desc: '提供标准字段、邮件模板和材料清单，协同更顺畅。', color: 'bg-purple-50 text-purple-600' },
    { id: 'self', title: '对自己', icon: UserCheck, desc: '给自己一点奖励/调剂的小角落，放松一下再出发。', color: 'bg-orange-50 text-orange-600' },
  ];

  const getSkillsByScenario = (scenarioTitle: string) => {
    return SKILLS.filter(skill => skill.scene.includes(scenarioTitle));
  };

  const handleTabChange = (id: string) => {
    setSearchParams({ tab: id });
  };

  return (
    <div className="py-24 bg-brand-offwhite min-h-screen">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mb-24">
          <h1 className="font-serif text-5xl md:text-7xl text-brand-dark mb-10 tracking-tight animate-fade-in-up">场景中心</h1>
          <p className="text-xl text-brand-gray leading-relaxed font-medium animate-fade-in-up opacity-80" style={{ animationDelay: '0.1s' }}>
            按业务场景组织，直观展示每个环节下的赋能工具。
            从客户沟通到内部审批，全方位提升作业效能。
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-4 mb-20 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {scenarios.map((s) => (
            <button
              key={s.id}
              onClick={() => handleTabChange(s.id)}
              className={cn(
                "px-8 py-4 rounded-full text-sm font-bold transition-all duration-500 flex items-center gap-3 shadow-sm",
                activeTab === s.id 
                  ? "bg-brand-dark text-white shadow-xl scale-105" 
                  : "bg-white text-brand-gray hover:bg-brand-light-gray border border-brand-border/10"
              )}
            >
              <s.icon size={18} className={cn(activeTab === s.id ? "text-brand-gold" : "opacity-50")} />
              {s.title}
            </button>
          ))}
        </div>

        <div className="animate-fade-in">
          {scenarios.filter(s => s.id === activeTab).map((s) => {
            const relatedSkills = getSkillsByScenario(s.title);
            return (
              <div key={s.id}>
                <div className="flex flex-col md:flex-row md:items-center gap-10 mb-16 animate-fade-in-up">
                  <div className={cn("w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl", s.color)}>
                    <s.icon size={40} />
                  </div>
                  <div className="max-w-2xl">
                    <h2 className="font-serif text-4xl text-brand-dark mb-4 tracking-tight">{s.title}</h2>
                    <p className="text-lg text-brand-gray font-medium opacity-80 leading-relaxed">{s.desc}</p>
                  </div>
                </div>

                {s.id === 'self' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <FoodSelector />
                    <EfficientOffDutyGame />
                    <FocusTimer />
                    <GossipZone />
                  </div>
                ) : s.id === 'customer' ? (
                  <div className="space-y-16">
                    <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                      <MaterialChecklistCenter />
                    </div>
                    
                    <div className="pt-16 border-t border-brand-border/10">
                      <div className="flex items-center justify-between mb-10">
                        <h3 className="font-serif text-3xl text-brand-dark tracking-tight">更多赋能工具</h3>
                        <div className="h-px flex-grow bg-brand-border/10 mx-8"></div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {relatedSkills.map(skill => (
                          <div key={skill.id} className="bg-white p-10 rounded-[2.5rem] border border-brand-border/10 shadow-sm hover:shadow-2xl transition-all duration-500 group flex flex-col">
                            <div className="flex justify-between items-start mb-10">
                              <span className="px-4 py-1.5 bg-brand-light-gray text-brand-dark text-[10px] font-bold uppercase tracking-widest rounded-full border border-brand-border/20">
                                {skill.category}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <div className={cn("w-1.5 h-1.5 rounded-full", skill.status === '在线可用' ? "bg-emerald-500" : "bg-brand-gray")}></div>
                                <span className="text-[10px] font-bold text-brand-dark uppercase tracking-widest">
                                  {skill.status}
                                </span>
                              </div>
                            </div>
                            <h4 className="font-serif text-2xl text-brand-dark mb-4 tracking-tight group-hover:text-brand-gold transition-colors">{skill.name}</h4>
                            <p className="text-brand-gray text-sm mb-10 line-clamp-2 font-medium leading-relaxed opacity-80">{skill.description}</p>
                            <div className="flex items-center justify-between mt-auto pt-8 border-t border-brand-border/10">
                              <span className="text-[10px] text-brand-gray/40 font-bold uppercase tracking-[0.2em]">{skill.form}</span>
                              <Link to={`/skills/${skill.id}`} className="text-brand-gold text-[13px] font-bold flex items-center gap-1 hover:gap-2 transition-all">
                                立即使用 <ChevronRight size={16} />
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {relatedSkills.length > 0 ? (
                      relatedSkills.map(skill => (
                        <div key={skill.id} className="bg-white p-10 rounded-[2.5rem] border border-brand-border/10 shadow-sm hover:shadow-2xl transition-all duration-500 group flex flex-col">
                          <div className="flex justify-between items-start mb-10">
                            <span className="px-4 py-1.5 bg-brand-light-gray text-brand-dark text-[10px] font-bold uppercase tracking-widest rounded-full border border-brand-border/20">
                              {skill.category}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <div className={cn("w-1.5 h-1.5 rounded-full", skill.status === '在线可用' ? "bg-emerald-500" : "bg-brand-gray")}></div>
                              <span className="text-[10px] font-bold text-brand-dark uppercase tracking-widest">
                                {skill.status}
                              </span>
                            </div>
                          </div>
                          <h4 className="font-serif text-2xl text-brand-dark mb-4 tracking-tight group-hover:text-brand-gold transition-colors">{skill.name}</h4>
                          <p className="text-brand-gray text-sm mb-10 line-clamp-2 font-medium leading-relaxed opacity-80">{skill.description}</p>
                          <div className="flex items-center justify-between mt-auto pt-8 border-t border-brand-border/10">
                            <span className="text-[10px] text-brand-gray/40 font-bold uppercase tracking-[0.2em]">{skill.form}</span>
                            <Link to={`/skills/${skill.id}`} className="text-brand-gold text-[13px] font-bold flex items-center gap-1 hover:gap-2 transition-all">
                              立即使用 <ChevronRight size={16} />
                            </Link>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full py-24 px-10 bg-white border border-brand-border/10 rounded-[3rem] text-center shadow-sm">
                        <div className="w-20 h-20 bg-brand-light-gray rounded-full flex items-center justify-center mx-auto mb-8">
                          <Search size={32} className="text-brand-gray opacity-30" />
                        </div>
                        <h4 className="font-serif text-2xl text-brand-dark mb-4 tracking-tight">即将上线</h4>
                        <p className="text-brand-gray font-medium opacity-60 mb-10 max-w-md mx-auto">该场景下的更多 Skills 正在由业务专家与 Agent 团队共同打造中，敬请期待...</p>
                        <Link to="/feedback" className="inline-flex items-center gap-2 px-8 py-4 bg-brand-dark text-white rounded-full font-bold text-sm hover:bg-brand-dark/90 transition-all shadow-xl">
                          提交你的场景需求 <ArrowRight size={18} />
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
    </div>
  );
};

export default ScenarioCenter;
