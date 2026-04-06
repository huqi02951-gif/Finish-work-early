import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Users, ShieldCheck, Briefcase, UserCheck, ArrowRight, Utensils, Coffee, 
  Timer, RotateCcw, Sparkles, Send, Heart, Terminal, Lock, EyeOff, 
  Activity, ChevronRight, Search, FileText, CheckCircle2, AlertCircle,
  Calendar as CalendarIcon, Moon, Sun, Palette, Compass, Ban
} from 'lucide-react';
import { Solar, Lunar } from 'lunar-javascript';
import { motion, AnimatePresence } from 'framer-motion';
import { SKILLS } from '../constants/skills';
import { cn } from '../lib/utils';
import MaterialChecklistCenter from './MaterialChecklistCenter';

const FengShuiCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [direction, setDirection] = useState(0);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthData = [
    { name: 'JANUARY', quote: 'This month: you will receive an email. It will ruin your day.', animal: '🐱' },
    { name: 'FEBRUARY', quote: 'Rest is important. You will not be allowed any.', animal: '🐶' },
    { name: 'MARCH', quote: "I'll prioritise this immediately—right after I finish doing absolutely nothing.", animal: '🐱' },
    { name: 'APRIL', quote: 'You’ll fix a problem you didn’t cause. Again.', animal: '🐶' },
    { name: 'MAY', quote: 'We value your time. That’s why we’ll waste it efficiently.', animal: '🐱' },
    { name: 'JUNE', quote: 'Drink water. Check your posture. Continue spiraling.', animal: '🐶' },
    { name: 'JULY', quote: 'I’ve escalated this to my higher self - She declined.', animal: '🐶' },
    { name: 'AUGUST', quote: 'I have read your urgent message. I have chosen peace instead.', animal: '🐱' },
    { name: 'SEPTEMBER', quote: 'You are a vital part of the team. Much like the office plant.', animal: '🐱' },
    { name: 'OCTOBER', quote: "A sudden urge to work hard? Don't worry, it passes quickly.", animal: '🐶' },
    { name: 'NOVEMBER', quote: 'Your feedback is highly valued. It has been securely placed in the bin.', animal: '🐱' },
    { name: 'DECEMBER', quote: 'Q4 is finally closing. My will to live closed weeks ago.', animal: '🐶' },
  ];

  const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const firstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();

  const prevMonth = () => {
    setDirection(-1);
    setCurrentDate(new Date(year, month - 1, 1));
  };
  const nextMonth = () => {
    setDirection(1);
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getFengShui = (day: number) => {
    const solar = Solar.fromYmd(year, month + 1, day);
    const lunar = solar.getLunar();
    
    const tips: Record<string, any> = {
      '金': { color: '金色/白色', item: '金属边框眼镜', taboo: '与人争执' },
      '木': { color: '绿色/青色', item: '绿植/木质挂件', taboo: '久坐不动' },
      '水': { color: '蓝色/黑色', item: '水杯/加湿器', taboo: '过度焦虑' },
      '火': { color: '红色/紫色', item: '红色工牌绳', taboo: '急躁行事' },
      '土': { color: '黄色/咖啡色', item: '陶瓷杯/石头摆件', taboo: '言而无信' },
    };
    
    const elements = ['金', '木', '水', '火', '土'];
    const el = elements[day % 5];
    return {
      lunar: `${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`,
      jieQi: lunar.getJieQi(),
      ...tips[el]
    };
  };

  const calendarDays = [];
  const totalDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);

  for (let i = 0; i < startDay; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= totalDays; i++) {
    calendarDays.push(i);
  }

  const currentMonthInfo = monthData[month];

  return (
    <div className="bg-[#721c24] p-8 rounded-[2.5rem] border border-white/10 shadow-2xl flex flex-col h-[650px] relative overflow-hidden font-sans text-white col-span-full">
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ 
        backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', 
        backgroundSize: '20px 20px' 
      }}></div>

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
              <CalendarIcon size={24} className="text-[#D4AF37]" />
            </div>
            <div>
              <h4 className="font-serif text-2xl tracking-tight">打工风水日历</h4>
              <p className="text-[#D4AF37] text-[10px] uppercase tracking-[0.3em] font-bold opacity-80">Less Drama, More Snacks</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-full transition-colors"><ChevronRight size={20} className="rotate-180" /></button>
            <span className="font-serif text-xl min-w-[120px] text-center">{year} {currentMonthInfo.name}</span>
            <button onClick={nextMonth} className="p-2 hover:bg-white/10 rounded-full transition-colors"><ChevronRight size={20} /></button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 flex-grow overflow-hidden">
          <div className="flex-1 bg-white/5 rounded-3xl p-6 border border-white/5 flex flex-col">
            <div className="grid grid-cols-7 mb-4 text-center">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                <span key={d} className="text-[10px] font-bold text-[#D4AF37] opacity-60">{d}</span>
              ))}
            </div>
            <AnimatePresence mode="wait">
              <motion.div 
                key={`${year}-${month}`}
                initial={{ x: direction * 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -direction * 50, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-7 gap-2 flex-grow"
              >
                {calendarDays.map((day, idx) => {
                  if (day === null) return <div key={`empty-${idx}`} />;
                  const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
                  const fs = getFengShui(day);
                  return (
                    <div 
                      key={day} 
                      className={cn(
                        "relative flex flex-col items-center justify-center p-2 rounded-xl transition-all group cursor-default",
                        isToday ? "bg-[#D4AF37] text-[#721c24] shadow-lg scale-105" : "hover:bg-white/10"
                      )}
                    >
                      <span className="text-sm font-bold">{day}</span>
                      <span className={cn("text-[8px] opacity-60", isToday ? "text-[#721c24]" : "text-white/60")}>
                        {fs.jieQi || fs.lunar}
                      </span>
                      {fs.jieQi && (
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                      )}
                    </div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="w-full md:w-[320px] flex flex-col gap-6">
            <div className="bg-white/10 rounded-3xl p-6 border border-white/10 relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 text-6xl opacity-10 group-hover:scale-110 transition-transform duration-500">
                {currentMonthInfo.animal}
              </div>
              <p className="text-xs font-serif italic leading-relaxed mb-4 relative z-10">
                “{currentMonthInfo.quote}”
              </p>
              <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-[#D4AF37]">
                <Sparkles size={12} /> 2026 Survival Guide
              </div>
            </div>

            <div className="bg-white/5 rounded-3xl p-6 border border-white/5 flex-grow">
              <h5 className="text-xs font-bold uppercase tracking-widest text-[#D4AF37] mb-6 flex items-center gap-2">
                <Compass size={14} /> 今日打工风水
              </h5>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-[#D4AF37]">
                    <Palette size={18} />
                  </div>
                  <div>
                    <p className="text-[9px] text-white/40 uppercase font-bold">宜穿/带颜色</p>
                    <p className="text-xs font-bold">{getFengShui(new Date().getDate()).color}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-[#D4AF37]">
                    <Sun size={18} />
                  </div>
                  <div>
                    <p className="text-[9px] text-white/40 uppercase font-bold">开运好物</p>
                    <p className="text-xs font-bold">{getFengShui(new Date().getDate()).item}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-red-400">
                    <Ban size={18} />
                  </div>
                  <div>
                    <p className="text-[9px] text-white/40 uppercase font-bold">打工大忌</p>
                    <p className="text-xs font-bold">{getFengShui(new Date().getDate()).taboo}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-auto flex justify-between items-center text-[9px] text-white/20 font-bold uppercase tracking-widest">
              <span>宜: 摸鱼 / 忌: 内卷</span>
              <span>V1.0_FENGSHUI</span>
            </div>
          </div>
        </div>
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
  const [step, setStep] = useState(-1); // -1 for setup
  const [userName, setUserName] = useState('你');
  const [monthlySalary, setMonthlySalary] = useState(6500);
  const [overtimeMin, setOvertimeMin] = useState(0);
  const [isAutoTime, setIsAutoTime] = useState(true);
  const [freedomPoints, setFreedomPoints] = useState(0);
  const [isRestDay, setIsRestDay] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  
  // Random content state
  const [randomA, setRandomA] = useState('');
  const [randomB, setRandomB] = useState('');
  const [randomC, setRandomC] = useState({ boss: '', truth: '' });
  const [randomD, setRandomD] = useState('');
  const [randomE, setRandomE] = useState('');
  const [randomF, setRandomF] = useState('');

  // Constants for calculation
  const WORKING_DAYS = 21.75;
  const DAILY_HOURS = 8;
  const getHourlyRate = () => monthlySalary / (WORKING_DAYS * DAILY_HOURS);

  // Content Pools
  const POOL_A = [
    "你以为你在尽责，领导以为你在加班表演。", "你做得再完美，也只是“好用”。", "你不走，就是在教他们：你可以被无限用。",
    "你加班不是敬业，是给管理烂账兜底。", "你不是不可替代，你是不敢离开。", "你以为你在扛责任，其实你在扛别人的不作为。",
    "你越拼，越像“默认可压榨”的那一类人。", "你不说做不完，他们就默认你永远做得完。", "你今天不下班，明天他们就给你安排“本来就该这样”。",
    "你以为你在争口气，其实你在把自己卖便宜。", "你把命熬干了，公司只会说：辛苦了。", "你以为努力会被看见？更多时候只会被利用。",
    "你不是效率低，你是任务超载；但背锅的是你。", "你加班的样子像在赎罪：赎完也没奖。", "你不是核心，你是补洞工具。",
    "你不走，不是因为忙，是因为怕。", "你一沉默，任务就长在你身上。", "你的责任感，在资本面前是免费燃料。",
    "你在公司多坐一小时，尊重不会多一克。", "你越“可靠”，越“难涨薪”。", "别把“能扛”当优点，那是被反复加码的入口。",
    "你做完了又怎样？下一个锅已经在路上。", "你不反抗边界，边界就永远不存在。", "你以为你在建设团队，团队在消耗你。",
    "你今天把自己榨干，明天还是你来补位。", "你把工作当命，工作把你当工具。", "你以为你在卷同事，其实你在卷自己的人生。",
    "你不是“不够努力”，你是“被设计成永远不够”。", "你越想证明自己，越容易被抓来证明别人。", "你以为你在冲刺，领导以为你在待命。",
    "你不下班，是在把“自愿加班”变成制度。", "你今天多做的，全是对自己边界的背叛。", "你不是在努力，你是在练习被消耗。",
    "你把“辛苦”当荣耀，他们把你当成本。", "你不敢说不会，结果就是永远做不完。", "你以为你在撑起项目，其实你在撑起老板的KPI。",
    "你以为你在忍，其实你在让别人更敢。", "你不是离不开工作，是离不开“被需要”的幻觉。", "你越拖到深夜，越证明他们安排得对：你能扛。",
    "你的人生不是无限续航电池，别再免费供电。"
  ];

  const POOL_B = [
    "春节一停工，天没塌；你晚走一小时也不会立功。", "世界不会因为你下班而停转，只会因为你不下班而失控。",
    "假期那么多人不干活，公司不也活着？", "少你一天，地球照转；多你一夜，你只会更疲惫。",
    "你不是齿轮，你是人；齿轮坏了能换，人坏了要命。", "春节都能按下暂停键，你为啥不能？",
    "天塌不了，塌的是你睡眠。", "你走了项目不死，你不走你先死机。", "你把自己当救世主，公司把你当替补席。",
    "你不下班不是拯救世界，是拯救别人的懒。", "春节停摆叫“正常”，你准点下班也该叫正常。",
    "少你一小时不会崩，多你一小时只会亏。", "你走了还有流程，你不走只有消耗。", "轮子会转，别拿自己当轴。",
    "世界从不缺“能扛的人”，缺的是“敢走的人”。"
  ];

  const POOL_C = [
    { boss: "“我也很辛苦”", truth: "“你也别想好过”" },
    { boss: "“我就比你高一点”", truth: "“其它收益我不说”" },
    { boss: "“再坚持一下”", truth: "“我先把压力转给你”" },
    { boss: "“这是机会”", truth: "“这是免费加活”" },
    { boss: "“你成长很快”", truth: "“你可以多干点还别涨钱”" },
    { boss: "“大家都这样”", truth: "“我不准备改规则”" },
    { boss: "“你是主力”", truth: "“你是耗材”" },
    { boss: "“我相信你”", truth: "“我不想管细节”" },
    { boss: "“先把项目拿下来”", truth: "“先把你拿下”" },
    { boss: "“等结果出来再谈”", truth: "“等你忘了再谈”" },
    { boss: "“别计较”", truth: "“我很计较成本”" },
    { boss: "“格局大一点”", truth: "“你忍一下”" },
    { boss: "“我们是一家人”", truth: "“你别谈钱”" },
    { boss: "“公司不会亏待你”", truth: "“现在先亏待你”" },
    { boss: "“你先顶一下”", truth: "“我先躲一下”" },
    { boss: "“你要学会担当”", truth: "“你要学会背锅”" },
    { boss: "“这个事很急”", truth: "“我没规划”" },
    { boss: "“你先做出来”", truth: "“做错了你负责”" },
    { boss: "“不要情绪化”", truth: "“我情绪更大但我有权”" },
    { boss: "“你很有潜力”", truth: "“我很想压你”" }
  ];

  const POOL_D = [
    "你每多加一小时，时薪就被稀释一次。", "通勤餐费情绪损耗都算进去，你是在倒贴上班。", "你以为你在拼命，其实你在做慈善。",
    "加班不是产出，是成本上浮。成本谁承担？你。", "你的时间不是无限的，你的工资也没按分钟涨。", "你熬夜的那一小时，换不来一句“加薪”。",
    "你越免费，越显得“你本来就值这么多”。", "你在用寿命对冲管理失误。", "你以为你在投资未来，其实你在消耗现在。",
    "把“辛苦”折现，折不出一分钱。", "你把自己榨得越干，他们越觉得这是常态。", "你不是效率低，是任务量高；但算绩效时只记“你慢”。",
    "你把健康亏进去，账面没人给你补。", "你加班换来的不是晋升，是“以后都交给你”。", "真正的结算：钱、资源、话语权。其余都是表演。"
  ];

  const POOL_E = [
    "动作：关电脑。别解释。立刻。", "动作：起身离开工位，去洗把脸。", "动作：把未完成写成3条，明天继续。现在下班。",
    "动作：发一句话：我今天做不完，明天几点交。", "动作：把“加班原因”写出来：真紧急还是不敢走？",
    "动作：去运动20分钟。你欠的是身体，不是老板。", "动作：把手机开勿扰30分钟，先把自己救回来。",
    "动作：把任务拆成1个番茄，做完就停。", "动作：把“我必须做完”改成“我只能做到这”。", "动作：点下班按钮。你的人生不需要审批。"
  ];

  const POOL_F = [
    "我现在有A/B/C三项，今天只能完成A+B，C需要延后或分配，您希望怎么排？",
    "这个我可以接，但会挤占原本X任务，质量会受影响。您确认优先级吗？",
    "我评估过了，今天做不完。我今晚能推进到第X步，明天上午补完并提交。",
    "这块我缺的是XX信息/权限/模板，没有会反复返工。能否补齐资源再推进？",
    "我不会这部分，需要明确口径/示例，否则我做出来也可能不符合预期。",
    "目前工作量超出单人可承载范围，需要拆分或延长周期，否则只能牺牲质量。",
    "我可以今天先给阶段成果和风险点，完整交付需要到明天X点。",
    "如果必须今晚完成，需要协调一位同事支持或减掉另外两项工作。",
    "我理解紧急，但我现在的排期已满，您看是否调整截止时间或调整任务范围？",
    "我不想做无效加班，先确认目标与验收标准，避免返工。"
  ];

  useEffect(() => {
    const checkStatus = () => {
      const now = new Date();
      const day = now.getDay();
      const isWeekend = day === 0 || day === 6;
      setIsRestDay(isWeekend);

      if (isAutoTime && !isWeekend) {
        const hour = now.getHours();
        const min = now.getMinutes();
        if (hour >= 17) {
          const diff = (hour - 17) * 60 + min;
          setOvertimeMin(diff);
        } else {
          setOvertimeMin(0);
        }
      }
    };
    checkStatus();
    const timer = setInterval(checkStatus, 60000);
    
    // Randomize content on mount
    setRandomA(POOL_A[Math.floor(Math.random() * POOL_A.length)]);
    setRandomB(POOL_B[Math.floor(Math.random() * POOL_B.length)]);
    setRandomC(POOL_C[Math.floor(Math.random() * POOL_C.length)]);
    setRandomD(POOL_D[Math.floor(Math.random() * POOL_D.length)]);
    setRandomE(POOL_E[Math.floor(Math.random() * POOL_E.length)]);
    setRandomF(POOL_F[Math.floor(Math.random() * POOL_F.length)]);

    return () => clearInterval(timer);
  }, [isAutoTime]);

  const calculateLoss = () => {
    const baseLoss = (overtimeMin / 60) * getHourlyRate();
    return isRestDay ? baseLoss * 3 : baseLoss;
  };

  const renderFreedomTree = () => {
    const stages = [
      <div key="0" className="w-4 h-4 bg-brand-gold/20 rounded-full" />,
      <div key="1" className="w-8 h-8 bg-brand-gold/40 rounded-full flex items-center justify-center"><div className="w-2 h-4 bg-brand-gold/60 rounded-t-full" /></div>,
      <div key="2" className="w-12 h-12 bg-brand-gold/60 rounded-full flex items-center justify-center"><div className="w-4 h-8 bg-brand-gold/80 rounded-t-full" /></div>,
      <div key="3" className="w-16 h-16 bg-brand-gold/80 rounded-full flex items-center justify-center"><Sparkles className="text-white" size={24} /></div>,
      <div key="4" className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)]"><Heart className="text-white" size={40} /></div>
    ];
    return stages[Math.min(stages.length - 1, freedomPoints)];
  };

  return (
    <div className="bg-brand-dark p-8 rounded-[2.5rem] border border-white/10 shadow-2xl flex flex-col h-[650px] relative overflow-hidden font-sans">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 relative z-10">
        <div>
          <h4 className="font-serif text-2xl text-white tracking-tight flex items-center gap-2">
            高效下班
            {isRestDay && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">今日休息</span>}
          </h4>
          <p className="text-brand-gold text-[10px] uppercase tracking-[0.2em] font-bold">强制下班·发疯清醒官</p>
        </div>
        <div className="flex flex-col items-end">
          <div className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">自由之树</div>
          {renderFreedomTree()}
        </div>
      </div>

      <div className="flex-grow flex flex-col relative z-10">
        {step === -1 && (
          <div className="space-y-8 animate-fade-in">
            <div className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-6">
              <h5 className="text-white font-bold">身份与价值初始化</h5>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] text-white/40 uppercase tracking-widest mb-2 block">你的称呼</label>
                  <input 
                    type="text" 
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-brand-gold outline-none transition-colors"
                    placeholder="默认：你"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-white/40 uppercase tracking-widest mb-2 block">月薪 (RMB)</label>
                  <input 
                    type="number" 
                    value={monthlySalary}
                    onChange={(e) => setMonthlySalary(parseInt(e.target.value) || 0)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-brand-gold outline-none transition-colors"
                  />
                </div>
              </div>
            </div>
            <button 
              onClick={() => setStep(0)}
              className="w-full py-5 bg-brand-gold text-brand-dark rounded-2xl font-black text-sm shadow-xl hover:scale-[1.02] transition-transform"
            >
              进入清醒系统
            </button>
          </div>
        )}

        {step === 0 && (
          <div className="space-y-8 animate-fade-in">
            <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
              <h5 className="text-white font-bold mb-4">第一步：面对现实</h5>
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/60">下班追踪模式</span>
                  <button 
                    onClick={() => setIsAutoTime(!isAutoTime)}
                    className={cn(
                      "text-[10px] px-3 py-1 rounded-full border transition-all font-bold",
                      isAutoTime ? "bg-brand-gold text-brand-dark border-brand-gold" : "bg-white/5 text-white/40 border-white/10"
                    )}
                  >
                    {isAutoTime ? "自动 (17:00起)" : "手动"}
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/60">超时时长 (min)</span>
                  <div className="flex items-center gap-4">
                    <button disabled={isAutoTime} onClick={() => setOvertimeMin(Math.max(0, overtimeMin - 15))} className="w-8 h-8 rounded-full border border-white/10 text-white/40">-</button>
                    <span className="text-2xl font-bold text-brand-gold w-12 text-center">{overtimeMin}</span>
                    <button disabled={isAutoTime} onClick={() => setOvertimeMin(overtimeMin + 15)} className="w-8 h-8 rounded-full border border-white/10 text-white/40">+</button>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center p-6 border border-brand-gold/20 rounded-3xl bg-brand-gold/5">
              <p className="text-brand-gold text-sm font-bold italic mb-2">“{randomA}”</p>
              <p className="text-[10px] text-white/30">
                {isRestDay ? "节假日加班损失 (3倍计算)：" : "超时折损："}
                ¥{calculateLoss().toFixed(2)}
              </p>
            </div>
            <button 
              onClick={() => { setStep(1); setFreedomPoints(1); }}
              className="w-full py-5 bg-brand-gold text-brand-dark rounded-2xl font-black text-sm shadow-xl hover:scale-[1.02] transition-transform"
            >
              开始清醒之旅
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-8 animate-fade-in text-center">
            <h5 className="text-white font-bold">第二步：粉碎幻觉</h5>
            <p className="text-xs text-white/60">你的屏幕上堆满了“紧急”任务。它们其实只是别人的焦虑。点击屏幕 10 次，粉碎它们。</p>
            <div 
              onClick={() => {
                setClickCount(prev => prev + 1);
                if (clickCount >= 9) { setStep(2); setFreedomPoints(2); setClickCount(0); }
              }}
              className="w-full h-48 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center relative cursor-pointer group"
            >
              <div className="absolute inset-0 flex items-center justify-center opacity-20 group-active:scale-95 transition-transform">
                <Terminal size={80} className="text-brand-gold" />
              </div>
              <span className="text-4xl font-black text-white z-10">{10 - clickCount}</span>
            </div>
            <p className="text-brand-gold text-xs font-bold italic">“{randomB}”</p>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-fade-in">
            <h5 className="text-white font-bold text-center">第三步：识破画饼</h5>
            <p className="text-xs text-white/60 text-center">老板又在喂“饼”了。选择那个最真实的翻译。</p>
            <div className="space-y-3">
              {[randomC, POOL_C[Math.floor(Math.random() * POOL_C.length)], POOL_C[Math.floor(Math.random() * POOL_C.length)]].map((item, idx) => (
                <button 
                  key={idx}
                  onClick={() => { setStep(3); setFreedomPoints(3); }}
                  className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-left hover:bg-brand-gold/10 hover:border-brand-gold/30 transition-all group"
                >
                  <p className="text-[10px] text-white/40 mb-1">{item.boss}</p>
                  <p className="text-sm text-white font-bold group-hover:text-brand-gold">{item.truth}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 animate-fade-in text-center">
            <h5 className="text-white font-bold">第四步：生命估值</h5>
            <p className="text-xs text-white/60">你正在用生命对冲管理失误。拖动滑块，看看你把自己卖得有多便宜。</p>
            <div className="bg-white/5 p-8 rounded-3xl border border-white/10">
              <input 
                type="range" 
                min="0" max="300" 
                value={overtimeMin}
                onChange={(e) => setOvertimeMin(parseInt(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-brand-gold"
              />
              <div className="mt-6 flex justify-between items-end">
                <div className="text-left">
                  <p className="text-[10px] text-white/40 uppercase">当前时薪</p>
                  <p className="text-xl font-bold text-white">¥{getHourlyRate().toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-white/40 uppercase">{isRestDay ? "假期折损 (x3)" : "超时损失"}</p>
                  <p className="text-xl font-bold text-red-500">-¥{calculateLoss().toFixed(2)}</p>
                </div>
              </div>
            </div>
            <div className="text-[10px] text-white/30 italic">“{randomD}”</div>
            <button 
              onClick={() => { setStep(4); setFreedomPoints(4); }}
              className="w-full py-5 bg-brand-gold text-brand-dark rounded-2xl font-black text-sm shadow-xl"
            >
              我看清了，我要走
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-fade-in text-center flex flex-col items-center justify-center h-full">
            <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mb-2">
              <Heart className="text-emerald-500" size={48} />
            </div>
            <h5 className="text-xl font-black text-white">觉醒成功</h5>
            <div className="space-y-4 w-full">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-left">
                <p className="text-[9px] text-brand-gold font-bold uppercase tracking-widest mb-1">立刻执行</p>
                <p className="text-xs text-white font-bold">{randomE}</p>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-left">
                <p className="text-[9px] text-brand-gold font-bold uppercase tracking-widest mb-1">开口话术</p>
                <p className="text-xs text-white italic">“{randomF}”</p>
              </div>
            </div>
            <p className="text-brand-gold text-xs font-bold italic mt-2">“世界不会因为你下班停转，但你会因为不下班死机。”</p>
            <button 
              onClick={() => { setStep(-1); setFreedomPoints(0); setOvertimeMin(0); }}
              className="mt-4 px-8 py-3 bg-white/5 border border-white/10 text-white/40 rounded-full text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors"
            >
              重新初始化
            </button>
          </div>
        )}
      </div>

      {/* Footer Status */}
      <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center text-[9px] text-white/20 font-bold uppercase tracking-widest">
        <span>状态: {step === 4 ? '完全觉醒' : '正在清醒中'}</span>
        <span>版本: V2.1_AWAKEN</span>
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
                    <FengShuiCalendar />
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
