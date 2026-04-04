import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Users, ShieldCheck, Briefcase, UserCheck, ArrowRight, Utensils, Coffee, Timer, RotateCcw, Sparkles, Send, Heart, Terminal, Lock, EyeOff, Activity, ChevronRight, Search } from 'lucide-react';
import { SKILLS } from '../constants/skills';
import { cn } from '../lib/utils';

const FoodSelector = () => {
  const foods = ['麦当劳', '轻食沙拉', '馄饨', '拌面', '牛肉面', '鸡腿饭', '盖浇饭', '便当', '粥', '三明治', '饭团', '麻辣烫', '关东煮', '汉堡', '米线', '炒饭', '鸡肉', '猪肉', '牛肉', '牛奶', '面包', '鸡蛋', '酸奶', '香蕉', '玉米', '燕麦', '蔬菜沙拉'];
  const [current, setCurrent] = useState('今天吃什么？');
  const [isRolling, setIsRolling] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isRolling) {
      interval = setInterval(() => {
        setCurrent(foods[Math.floor(Math.random() * foods.length)]);
      }, 80);
    }
    return () => clearInterval(interval);
  }, [isRolling]);

  return (
    <div className="bg-white p-10 rounded-[2.5rem] border border-brand-border/10 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col items-center text-center h-full group overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-orange-400/20"></div>
      <div className="w-14 h-14 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
        <Utensils size={28} />
      </div>
      <h4 className="font-serif text-2xl text-brand-dark mb-2 tracking-tight">今天吃什么</h4>
      <p className="text-brand-gray text-[10px] mb-10 uppercase tracking-[0.3em] font-bold opacity-60">打工人午餐救星</p>
      
      <div className="w-full py-12 bg-brand-light-gray/50 rounded-3xl mb-10 flex items-center justify-center min-h-[120px] border border-brand-border/5">
        <span className={cn(
          "text-3xl font-bold transition-all duration-200 tracking-tight",
          isRolling ? "text-brand-gray/30 scale-95 blur-[2px]" : "text-brand-gold scale-110"
        )}>
          {current}
        </span>
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
          <p className="mt-6 text-[11px] text-brand-gray italic font-medium animate-fade-in">“今天别纠结了，就吃这个”</p>
        )}
      </div>
    </div>
  );
};

const QuoteGenerator = () => {
  const quotes = [
    '你的工资高到值得你无效加班吗？',
    '现在不提效，晚上又在工位后悔',
    '你是在工作，还是在表演忙碌？',
    '早点做完，早点下班，别和自己过不去',
    '拖到晚上八点，问题还是这些问题',
    '摸鱼一时爽，加班火葬场',
    '效率是给自己的，时间是偷不来的',
    '别让假装努力，透支了你的生活',
    '下班后的自由，才是真正的自由'
  ];
  const [current, setCurrent] = useState('点击开始，清醒一下');
  const [isRolling, setIsRolling] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isRolling) {
      interval = setInterval(() => {
        setCurrent(quotes[Math.floor(Math.random() * quotes.length)]);
      }, 80);
    }
    return () => clearInterval(interval);
  }, [isRolling]);

  return (
    <div className="bg-white p-10 rounded-[2.5rem] border border-brand-border/10 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col items-center text-center h-full group relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-purple-400/20"></div>
      <div className="w-14 h-14 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
        <Coffee size={28} />
      </div>
      <h4 className="font-serif text-2xl text-brand-dark mb-2 tracking-tight">我要早下班</h4>
      <p className="text-brand-gray text-[10px] mb-10 uppercase tracking-[0.3em] font-bold opacity-60">打工人骂醒器</p>
      
      <div className="w-full p-8 bg-brand-dark rounded-3xl mb-10 flex items-center justify-center min-h-[140px] relative overflow-hidden shadow-2xl">
        <div className="absolute top-4 left-4 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
        <span className={cn(
          "text-[15px] font-medium leading-relaxed transition-all duration-200 text-center",
          isRolling ? "text-white/20 blur-[2px]" : "text-white"
        )}>
          {current}
        </span>
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
          {!isRolling ? '开始随机' : '停止'}
        </button>
      </div>
    </div>
  );
};

const FocusTimer = () => {
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [isActive, setIsActive] = useState(false);
  const [trees, setTrees] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      setTrees(prev => prev + 1);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setTimeLeft(15 * 60);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="bg-white p-10 rounded-[2.5rem] border border-brand-border/10 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col items-center text-center h-full group relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-emerald-400/20"></div>
      <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
        <Timer size={28} />
      </div>
      <h4 className="font-serif text-2xl text-brand-dark mb-2 tracking-tight">专注的很</h4>
      <p className="text-brand-gray text-[10px] mb-10 uppercase tracking-[0.3em] font-bold opacity-60">种下一棵专注之树</p>

      <div className="text-6xl font-mono font-bold text-brand-dark mb-10 tracking-tighter tabular-nums">
        {formatTime(timeLeft)}
      </div>

      <div className="flex gap-4 w-full mb-10">
        <button 
          onClick={() => setIsActive(!isActive)}
          className={cn(
            "flex-grow py-4 rounded-2xl font-bold text-sm transition-all duration-300 shadow-lg active:scale-95",
            !isActive 
              ? "bg-brand-dark text-white hover:bg-brand-dark/90" 
              : "bg-brand-light-gray text-brand-gray hover:bg-brand-border/20"
          )}
        >
          {!isActive ? '开始专注' : '暂停'}
        </button>
        <button 
          onClick={() => {setIsActive(false); setTimeLeft(15 * 60);}}
          className="p-4 bg-brand-light-gray text-brand-gray rounded-2xl hover:bg-brand-border/20 transition-all active:scale-95"
        >
          <RotateCcw size={20} />
        </button>
      </div>

      <div className="w-full pt-8 border-t border-brand-border/10 mt-auto">
        <div className="flex justify-between items-center mb-4">
          <p className="text-[11px] font-bold text-brand-gray uppercase tracking-widest opacity-60">今日小森林</p>
          <span className="text-[11px] font-bold text-brand-gold bg-brand-gold/10 px-3 py-1 rounded-full">{trees} 棵</span>
        </div>
        <div className="flex flex-wrap justify-center gap-2 min-h-[32px]">
          {Array.from({ length: trees }).map((_, i) => (
            <span key={i} className="text-2xl animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>🌲</span>
          ))}
          {trees === 0 && <span className="text-[11px] text-brand-gray/30 italic font-medium">还没种下树苗...</span>}
        </div>
      </div>

      {showSuccess && (
        <div className="absolute inset-x-10 top-1/2 -translate-y-1/2 glass p-8 rounded-3xl border-brand-gold/30 shadow-2xl z-20 animate-fade-in-up">
          <Sparkles className="mx-auto text-brand-gold mb-4" size={40} />
          <p className="text-brand-dark font-bold text-lg tracking-tight">专注完成！</p>
          <p className="text-xs text-brand-gray mt-2 font-medium">你成功种下了一棵新树 🌲</p>
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
                    <QuoteGenerator />
                    <FocusTimer />
                    <GossipZone />
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
