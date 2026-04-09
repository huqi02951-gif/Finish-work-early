import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Users, ShieldCheck, Briefcase, UserCheck, ArrowRight, Utensils, Coffee, 
  Timer, RotateCcw, Sparkles, Send, Heart, Terminal, Lock, EyeOff, 
  Activity, ChevronRight, Search, FileText, CheckCircle2, AlertCircle, X,
  Calendar as CalendarIcon, Moon, Sun, Palette, Compass, Ban, Zap,
  LayoutDashboard, Target, User, Database
} from 'lucide-react';
import { Solar, Lunar } from 'lunar-javascript';
import { motion, AnimatePresence } from 'framer-motion';
import { SKILLS } from '../constants/skills';
import { cn } from '../lib/utils';
import MaterialChecklistCenter from './MaterialChecklistCenter';
import AppLayout from '../src/components/layout/AppLayout';

const FengShuiCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [direction, setDirection] = useState(0);
  const [showDivination, setShowDivination] = useState(false);
  const [divinationResult, setDivinationResult] = useState<any>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showDayDetail, setShowDayDetail] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthData = [
    { name: '一月', en: 'January', quote: '本月预告：你会收到一封邮件，它会毁了你的一天。', quoteEn: 'This month: you will receive an email. It will ruin your day.', animal: '🐴', img: 'https://picsum.photos/seed/worker-horse-rain/600/400' },
    { name: '二月', en: 'February', quote: '休息确实很重要，但公司觉得你可能并不需要。', quoteEn: 'Rest is important. You will not be allowed any.', animal: '🐴', img: 'https://picsum.photos/seed/worker-horse-elevator/600/400' },
    { name: '三月', en: 'March', quote: '我会立刻处理——等我忙完这阵子“无所事事”再说。', quoteEn: 'I’ll prioritise this immediately—right after I finish doing absolutely nothing.', animal: '🐴', img: 'https://picsum.photos/seed/worker-horse-construction/600/400' },
    { name: '四月', en: 'April', quote: '恭喜你，又要去给别人的烂摊子擦屁股了。第N次。', quoteEn: 'You’ll fix a problem you didn’t cause. Again.', animal: '🐴', img: 'https://picsum.photos/seed/worker-horse-error/600/400' },
    { name: '五月', en: 'May', quote: '我们非常看重你的时间，所以决定开个会把它高效浪费掉。', quoteEn: 'We value your time. That’s why we’ll waste it efficiently.', animal: '🐴', img: 'https://picsum.photos/seed/worker-horse-tea/600/400' },
    { name: '六月', en: 'June', quote: '多喝热水，挺直腰杆，然后优雅地原地崩溃。', quoteEn: 'Drink water. Check your posture. Continue spiraling.', animal: '🐴', img: 'https://picsum.photos/seed/worker-horse-lipstick/600/400' },
    { name: '七月', en: 'July', quote: '这事儿我已经上报给“高我”了，她表示：别来沾边。', quoteEn: 'I’ve escalated this to my higher self - She declined.', animal: '🐴', img: 'https://picsum.photos/seed/worker-horse-happy/600/400' },
    { name: '八月', en: 'August', quote: '已读你的紧急消息，但我选择了内心平静。', quoteEn: 'I have read your urgent message. I have chosen peace instead.', animal: '🐴', img: 'https://picsum.photos/seed/worker-horse-calculator/600/400' },
    { name: '九月', en: 'September', quote: '你是团队不可或缺的一部分，地位仅次于那盆发财树。', quoteEn: 'You are a vital part of the team. Much like the office plant.', animal: '🐴', img: 'https://picsum.photos/seed/worker-horse-lying/600/400' },
    { name: '十月', en: 'October', quote: '突然想努力工作？别怕，这种幻觉很快就会消失。', quoteEn: 'A sudden urge to work hard? Don\'t worry, it passes quickly.', animal: '🐴', img: 'https://picsum.photos/seed/worker-horse-boss/600/400' },
    { name: '十一月', en: 'November', quote: '您的反馈非常重要，我们已经把它精准投递到垃圾桶了。', quoteEn: 'Your feedback is highly valued. It has been securely placed in the bin.', animal: '🐴', img: 'https://picsum.photos/seed/worker-horse-crying/600/400' },
    { name: '十二月', en: 'December', quote: 'Q4终于要结束了，我的求生欲早已提前下班。', quoteEn: 'Q4 is finally closing. My will to live closed weeks ago.', animal: '🐴', img: 'https://picsum.photos/seed/worker-horse-beer/600/400' },
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
    try {
      const solar = Solar.fromYmd(year, month + 1, day);
      const lunar = solar.getLunar();
      const dayGanZhi = lunar.getDayGanZhi();
      const elementStr = dayGanZhi && dayGanZhi.length >= 2 ? dayGanZhi.charAt(1) : '子';

      const elementsMap: Record<string, string> = {
        '子': '水', '亥': '水',
        '寅': '木', '卯': '木',
        '巳': '火', '午': '火',
        '申': '金', '酉': '金',
        '辰': '土', '戌': '土', '丑': '土', '未': '土'
      };

      const el = elementsMap[elementStr] || '土';
      
      const tips: Record<string, any> = {
        '金': { 
          color: '金色/白色 (Gold/White)', 
          hex: '#D4AF37',
          item: '金属边框眼镜 (Metal Glasses)', 
          taboo: '与人争执 (Conflict)',
          suit: '整理文档 (Organizing Docs)'
        },
        '木': { 
          color: '绿色/青色 (Green/Cyan)', 
          hex: '#22c55e',
          item: '绿植/木质挂件 (Plants/Wood)', 
          taboo: '久坐不动 (Sedentary)',
          suit: '头脑风暴 (Brainstorming)'
        },
        '水': { 
          color: '蓝色/黑色 (Blue/Black)', 
          hex: '#3b82f6',
          item: '水杯/加湿器 (Water/Humidifier)', 
          taboo: '过度焦虑 (Anxiety)',
          suit: '深度沟通 (Deep Communication)'
        },
        '火': { 
          color: '红色/紫色 (Red/Purple)', 
          hex: '#ef4444',
          item: '红色工牌绳 (Red Lanyard)', 
          taboo: '急躁行事 (Impatience)',
          suit: '项目上线 (Project Launch)'
        },
        '土': { 
          color: '黄色/咖啡色 (Yellow/Brown)', 
          hex: '#a855f7',
          item: '陶瓷杯/石头摆件 (Ceramic/Stone)', 
          taboo: '言而无信 (Breaking Promise)',
          suit: '复盘总结 (Review & Summary)'
        },
      };

      // Worker Holidays
      const workerHolidays: Record<string, string> = {
        '1-1': '元旦',
        '3-8': '女神节',
        '5-1': '劳动节',
        '6-1': '儿童节',
        '10-1': '国庆节',
        '10-24': '程序员节',
        '11-11': '双十一',
        '12-25': '圣诞节',
      };
      
      // Lunar Festivals
      const lunarFestivals = lunar.getFestivals();
      const otherFestivals = lunar.getOtherFestivals();
      const solarFestivals = solar.getFestivals();
      
      let holiday = workerHolidays[`${month + 1}-${day}`] || '';
      if (!holiday && lunarFestivals.length > 0) holiday = lunarFestivals[0];
      if (!holiday && solarFestivals.length > 0) holiday = solarFestivals[0];
      
      const jieQi = lunar.getJieQi();
      
      return {
        lunar: lunar.getDayInChinese(),
        lunarMonth: lunar.getMonthInChinese(),
        ganZhi: dayGanZhi,
        element: el,
        jieQi,
        holiday,
        ...tips[el]
      };
    } catch (e) {
      console.error('FengShui error:', e);
      return {
        lunar: '初一',
        lunarMonth: '正月',
        ganZhi: '甲子',
        element: '水',
        jieQi: '',
        holiday: '',
        color: '白色 (White)',
        hex: '#ffffff',
        item: '水杯 (Water)',
        taboo: '加班 (Overtime)',
        suit: '摸鱼 (Slacking Off)'
      };
    }
  };

  const handleDayClick = (day: number | null) => {
    if (day) {
      setSelectedDay(day);
      setShowDayDetail(true);
    }
  };

  const handleDivination = () => {
    setShowDivination(true);
    const hexagrams = [
      { name: '乾为天', desc: '大吉。事业如日中天，宜积极进取，老板可能会给你画个大饼。', quote: '天行健，君子以自强不息。' },
      { name: '坤为地', desc: '顺遂。宜守不宜攻，保持耐心，适合在工位上静静摸鱼。', quote: '地势坤，君子以厚德载物。' },
      { name: '水雷屯', desc: '波折。万事开头难，项目初期阻力大，宜寻求同事帮助。', quote: '云雷屯，君子以经纶。' },
      { name: '山水蒙', desc: '迷茫。宜虚心学习，切忌盲目接需求，先搞清楚需求文档。', quote: '山下出泉，蒙；君子以果行育德。' },
      { name: '水天需', desc: '等待。时机未到，宜静观其变，等下班时间到了再走。', quote: '云上于天，需；君子以饮食宴乐。' },
      { name: '天水讼', desc: '口舌。宜和为贵，避免与产品经理争执，退一步海阔天空。', quote: '天与水违行，讼；君子以作事谋始。' },
      { name: '地水师', desc: '统帅。宜团队协作，严明纪律，开会时不要迟到。', quote: '地中有水，师；君子以容民畜众。' },
      { name: '水地比', desc: '相亲。宜广结善缘，互利共赢，多请同事喝下午茶。', quote: '地上有水，比；先王以建万国，亲诸侯。' }
    ];
    const result = hexagrams[Math.floor(Math.random() * hexagrams.length)];
    setDivinationResult(result);
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
    <div className="bg-[#721c24] p-6 md:p-8 rounded-[2.5rem] border border-white/10 shadow-2xl flex flex-col min-h-[800px] md:h-[750px] relative overflow-hidden font-sans text-white col-span-full">
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ 
        backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', 
        backgroundSize: '20px 20px' 
      }}></div>

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-white/10 pb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
              <CalendarIcon size={24} className="text-[#D4AF37]" />
            </div>
            <div>
              <h4 className="font-serif text-xl md:text-2xl tracking-tight uppercase">Worker's Feng Shui | 打工风水</h4>
              <p className="text-[#D4AF37] text-[9px] md:text-[10px] uppercase tracking-[0.3em] font-bold opacity-80">Less drama, more snacks! | 少点儿戏，多点好吃的！</p>
            </div>
          </div>
          <div className="flex items-center gap-4 self-end sm:self-auto">
            <button onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-full transition-colors"><ChevronRight size={20} className="rotate-180" /></button>
            <span className="font-serif text-lg md:text-xl min-w-[160px] text-center">{year} {currentMonthInfo.name} ({currentMonthInfo.en})</span>
            <button onClick={nextMonth} className="p-2 hover:bg-white/10 rounded-full transition-colors"><ChevronRight size={20} /></button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 flex-grow overflow-y-auto lg:overflow-hidden pr-2 lg:pr-0 custom-scrollbar">
          <div className="flex-1 bg-white/5 rounded-3xl p-6 border border-white/5 flex flex-col relative min-h-[400px]">
            {/* Divination Overlay */}
            {/* Removed inline overlay, using modal instead */}
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
                    <motion.div 
                      key={day} 
                      whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
                      onClick={() => handleDayClick(day)}
                      className={cn(
                        "relative flex flex-col items-center justify-center p-2 rounded-xl transition-all group cursor-pointer",
                        isToday ? "bg-[#D4AF37] text-[#721c24] shadow-lg scale-105" : "hover:bg-white/10"
                      )}
                    >
                      <span className="text-sm font-bold">{day}</span>
                      <span className={cn("text-[8px] opacity-60 text-center leading-none mt-0.5", isToday ? "text-[#721c24]" : "text-white/60")}>
                        {fs.holiday || fs.jieQi || fs.lunar}
                      </span>
                      {fs.hex && (
                        <div 
                          className="absolute bottom-1 w-1 h-1 rounded-full" 
                          style={{ backgroundColor: isToday ? '#721c24' : fs.hex }}
                        />
                      )}
                      {(fs.jieQi || fs.holiday) && !isToday && (
                        <div className={cn("absolute top-1 right-1 w-1.5 h-1.5 rounded-full animate-pulse", fs.holiday ? "bg-yellow-400" : "bg-red-400")} />
                      )}
                    </motion.div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="w-full lg:w-[320px] flex flex-col gap-6">
            {/* Image Card */}
            <div className="bg-white/10 rounded-3xl overflow-hidden border border-white/10 h-48 relative group">
              <img 
                src={currentMonthInfo.img} 
                alt={currentMonthInfo.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#721c24] to-transparent opacity-60"></div>
              <div className="absolute bottom-4 left-4 font-serif text-lg font-bold">
                {currentMonthInfo.name}
              </div>
            </div>

            {/* Quote Card */}
            <div className="bg-white/10 rounded-3xl p-6 border border-white/10 relative overflow-hidden group">
              {month === 11 && (
                <div className="absolute -top-2 -right-8 bg-[#D4AF37] text-[#721c24] py-1 px-10 rotate-45 text-[8px] font-bold shadow-lg z-20">
                  AWARD OF SURVIVAL
                </div>
              )}
              <p className="text-xs font-serif italic leading-relaxed mb-2 relative z-10">
                “{currentMonthInfo.quote}”
              </p>
              <p className="text-[10px] opacity-60 italic mb-4 relative z-10">
                “{currentMonthInfo.quoteEn}”
              </p>
              <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-[#D4AF37]">
                <Sparkles size={12} /> 2026 打工人求生指南 | Survival Guide
              </div>
            </div>

            <div className="bg-white/5 rounded-3xl p-6 border border-white/5 flex-grow">
              <h5 className="text-xs font-bold uppercase tracking-widest text-[#D4AF37] mb-6 flex items-center gap-2">
                <Compass size={14} /> 今日打工风水 | Daily Feng Shui
              </h5>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-[#D4AF37]">
                    <Palette size={18} />
                  </div>
                  <div>
                    <p className="text-[9px] text-white/40 uppercase font-bold">Lucky Color | 宜穿/带颜色</p>
                    <p className="text-xs font-bold">{getFengShui(Math.min(new Date().getDate(), totalDays)).color}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-[#D4AF37]">
                    <Sun size={18} />
                  </div>
                  <div>
                    <p className="text-[9px] text-white/40 uppercase font-bold">Lucky Item | 开运好物</p>
                    <p className="text-xs font-bold">{getFengShui(Math.min(new Date().getDate(), totalDays)).item}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-red-400">
                    <Ban size={18} />
                  </div>
                  <div>
                    <p className="text-[9px] text-white/40 uppercase font-bold">Taboo | 打工大忌</p>
                    <p className="text-xs font-bold">{getFengShui(Math.min(new Date().getDate(), totalDays)).taboo}</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleDivination}
                className="mt-8 w-full py-3 bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-[#721c24] rounded-xl flex items-center justify-center gap-2 transition-all group font-bold shadow-lg"
              >
                <Sparkles size={16} className="group-hover:rotate-12 transition-transform" />
                <span className="text-xs tracking-widest">卜一卦 | Divinate</span>
              </button>
            </div>

            <div className="mt-auto flex flex-col gap-2">
              <div className="flex justify-between items-center text-[9px] text-white/20 font-bold uppercase tracking-widest">
                <span>宜: 摸鱼 / 忌: 内卷 | Fish: Yes / Overwork: No</span>
                <span>V1.3_PDF_SYNC</span>
              </div>
              <div className="p-3 bg-black/20 rounded-xl border border-white/5 text-[8px] leading-tight opacity-40 italic space-y-1">
                <p>WARNING: The owner of this calendar operates strictly on caffeine, snacks, and spite. Please adjust your urgency accordingly.</p>
                <p>WARRANTY: Zero guarantee that the "I SHOULD DO" list will actually be done.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Day Detail Modal */}
      <AnimatePresence>
        {showDayDetail && selectedDay && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowDayDetail(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#1a1a1a] border border-[#D4AF37]/30 rounded-[2rem] p-8 max-w-md w-full relative overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="absolute top-0 right-0 p-4">
                <button onClick={() => setShowDayDetail(false)} className="text-white/40 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              {(() => {
                const fs = getFengShui(selectedDay);
                return (
                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 border-4 border-[#D4AF37]/20" style={{ backgroundColor: `${fs.hex}20` }}>
                      <span className="text-4xl" style={{ color: fs.hex }}>{fs.element}</span>
                    </div>
                    
                    <h2 className="text-3xl font-serif text-[#D4AF37] mb-1">{year}年{month + 1}月{selectedDay}日</h2>
                    <p className="text-white/60 mb-6">{fs.lunarMonth}月{fs.lunar} · {fs.ganZhi}年</p>

                    <div className="grid grid-cols-2 gap-4 w-full mb-8">
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                        <p className="text-[10px] uppercase tracking-wider text-white/40 mb-1">五行属性</p>
                        <p className="text-lg font-medium" style={{ color: fs.hex }}>{fs.element}</p>
                      </div>
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                        <p className="text-[10px] uppercase tracking-wider text-white/40 mb-1">幸运色</p>
                        <p className="text-sm font-medium text-white/90">{fs.color}</p>
                      </div>
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/10 col-span-2">
                        <p className="text-[10px] uppercase tracking-wider text-white/40 mb-1">幸运物品</p>
                        <p className="text-sm font-medium text-white/90">{fs.item}</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4 w-full">
                      <div className="flex items-center gap-4 bg-green-500/10 p-4 rounded-2xl border border-green-500/20">
                        <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center shrink-0">
                          <span className="text-xl">宜</span>
                        </div>
                        <p className="text-sm text-green-400 text-left font-medium">{fs.suit}</p>
                      </div>
                      <div className="flex items-center gap-4 bg-red-500/10 p-4 rounded-2xl border border-red-500/20">
                        <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center shrink-0">
                          <span className="text-xl">忌</span>
                        </div>
                        <p className="text-sm text-red-400 text-left font-medium">{fs.taboo}</p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Divination Modal */}
      <AnimatePresence>
        {showDivination && divinationResult && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowDivination(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#1a1a1a] border border-[#D4AF37]/30 rounded-[2rem] p-8 max-w-md w-full relative overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="absolute top-0 right-0 p-4">
                <button onClick={() => setShowDivination(false)} className="text-white/40 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mb-6 border-2 border-[#D4AF37]/30">
                  <span className="text-5xl font-serif text-[#D4AF37]">{divinationResult.name.charAt(0)}</span>
                </div>
                
                <h2 className="text-3xl font-serif text-[#D4AF37] mb-2">{divinationResult.name}</h2>
                <div className="w-12 h-0.5 bg-[#D4AF37]/30 mb-6"></div>
                
                <p className="text-lg text-white/90 mb-4 leading-relaxed">
                  {divinationResult.desc}
                </p>
                
                <div className="bg-white/5 p-6 rounded-2xl border border-white/10 w-full italic text-white/60">
                  "{divinationResult.quote}"
                </div>

                <button 
                  onClick={() => setShowDivination(false)}
                  className="mt-8 w-full py-4 bg-[#D4AF37] text-black font-bold rounded-xl hover:bg-[#B8860B] transition-colors"
                >
                  领旨谢恩
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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

const SensitiveCommModule = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-brand-border/10 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden group">
      <div className="grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-7 p-8 md:p-12">
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
          
          <h3 className="font-serif text-3xl md:text-4xl text-brand-dark mb-4 md:mb-6 tracking-tight">敏感沟通助手</h3>
          <p className="text-base md:text-lg text-brand-gray mb-8 md:mb-10 font-medium leading-relaxed opacity-80">
            处理对客沟通中“必须说、但不好说”的敏感事项。把最难表达、最容易引发误解的事项，沉淀为高情商、专业、边界清晰的标准化话术。
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8 md:mb-10">
            {[
              { label: '收费通知', icon: Zap },
              { label: '利率调整', icon: Activity },
              { label: '授信暂缓', icon: AlertCircle },
              { label: '拒绝办理', icon: Ban },
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2 p-3 md:p-4 bg-brand-light-gray/50 rounded-xl md:rounded-2xl border border-brand-border/5 group-hover:bg-brand-gold/5 transition-colors">
                <item.icon size={16} className="text-brand-gold md:hidden" />
                <item.icon size={18} className="text-brand-gold hidden md:block" />
                <span className="text-[9px] md:text-[10px] font-bold text-brand-dark">{item.label}</span>
              </div>
            ))}
          </div>

          <button 
            onClick={() => navigate('/sensitive-comm')}
            className="w-full md:w-auto px-8 md:px-10 py-4 md:py-5 bg-brand-dark text-white rounded-xl md:rounded-2xl font-bold text-base md:text-lg hover:bg-brand-dark/90 transition-all shadow-xl flex items-center justify-center gap-3 group/btn"
          >
            立即进入助手
            <ArrowRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
        
        <div className="lg:col-span-5 bg-brand-light-gray/30 p-8 md:p-10 flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-brand-border/10 relative overflow-hidden">
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
        <div className="lg:col-span-7 p-8 md:p-16">
          <div className="flex items-center gap-4 mb-6 md:mb-8">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-brand-dark text-white rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg">
              <LayoutDashboard size={20} className="md:hidden" />
              <LayoutDashboard size={24} className="hidden md:block" />
            </div>
            <div>
              <h3 className="font-serif text-2xl md:text-3xl text-brand-dark tracking-tight">客户经理业务通</h3>
              <p className="text-brand-gold text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em] mt-1">场景化业务打法中心 + 经验风格库</p>
            </div>
          </div>
          
          <p className="text-base md:text-lg text-brand-gray font-medium leading-relaxed mb-8 md:mb-10 opacity-80">
            把产品知识、行业判断、客户对话和推进路径沉淀成可复用的业务打法。
            解决“面对客户说什么、怎么问、怎么推”的实战痛点。
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-10 md:mb-12">
            {[
              { label: '按场景进入', icon: Zap, desc: '首次拜访/他行竞争' },
              { label: '按产品进入', icon: Briefcase, desc: '银承/流贷/抵押' },
              { label: '按行业进入', icon: Target, desc: '制造/贸易/科技' },
            ].map((item, idx) => (
              <div key={idx} className="flex flex-row sm:flex-col items-center sm:items-start gap-4 sm:gap-2 p-4 md:p-5 bg-brand-light-gray/50 rounded-xl md:rounded-2xl border border-brand-border/5 group-hover:bg-brand-gold/5 transition-colors">
                <item.icon size={20} className="text-brand-gold shrink-0" />
                <div>
                  <p className="text-xs font-bold text-brand-dark">{item.label}</p>
                  <p className="text-[9px] text-brand-gray font-medium mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={() => navigate('/business-guide')}
            className="w-full md:w-auto px-8 md:px-10 py-4 md:py-5 bg-brand-dark text-white rounded-xl md:rounded-2xl font-bold text-base md:text-lg hover:bg-brand-dark/90 transition-all shadow-xl flex items-center justify-center gap-3 group/btn"
          >
            开启业务通
            <ArrowRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
        
        <div className="lg:col-span-5 bg-brand-dark p-8 md:p-12 flex flex-col justify-center border-t lg:border-t-0 border-white/5 relative overflow-hidden">
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
      <div className="pb-24 bg-brand-offwhite min-h-screen">
        {/* Apple Music Style Header */}
        <header className="px-6 pt-12 pb-8">
          <h1 className="text-4xl font-bold tracking-tight text-brand-dark mb-2">场景中心</h1>
          <p className="text-brand-gray font-medium text-sm max-w-md">
            按业务场景组织，直观展示每个环节下的实用工具。
            从客户沟通到内部审批，全方位提升作业效能。
          </p>
        </header>

        {/* Segmented Control Style Tabs */}
        <div className="px-6 mb-10 overflow-x-auto no-scrollbar">
          <div className="inline-flex p-1 bg-brand-light-gray rounded-2xl border border-brand-border/5">
            {scenarios.map((s) => (
              <button
                key={s.id}
                onClick={() => handleTabChange(s.id)}
                className={cn(
                  "px-6 py-2.5 rounded-xl text-[13px] font-bold transition-all duration-300 whitespace-nowrap flex items-center gap-2",
                  activeTab === s.id 
                    ? "bg-white text-brand-dark shadow-sm scale-100" 
                    : "text-brand-gray hover:text-brand-dark"
                )}
              >
                <s.icon size={14} className={cn(activeTab === s.id ? "text-apple-blue" : "opacity-50")} />
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
                <div className="flex items-center gap-4 mb-8">
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shrink-0", s.color)}>
                    <s.icon size={24} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-brand-dark tracking-tight">{s.title}</h2>
                    <p className="text-xs text-brand-gray font-medium opacity-80">{s.desc}</p>
                  </div>
                </div>

                {s.id === 'self' ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
                    <FoodSelector />
                    <EfficientOffDutyGame />
                    <FocusTimer />
                    <GossipZone />
                    <FengShuiCalendar />
                  </div>
                ) : s.id === 'customer' ? (
                  <div className="space-y-12 md:space-y-16">
                    <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                      <BusinessGuideModule />
                    </div>

                    <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                      <div className="flex items-center justify-between mb-6 md:mb-10">
                        <h3 className="font-serif text-2xl md:text-3xl text-brand-dark tracking-tight">核心沟通工具</h3>
                        <div className="h-px flex-grow bg-brand-border/10 ml-4 md:ml-8"></div>
                      </div>
                      <SensitiveCommModule />
                    </div>

                    <div className="animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                      <MaterialChecklistCenter />
                    </div>
                    
                    <div className="pt-10 md:pt-16 border-t border-brand-border/5">
                      <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold text-brand-dark tracking-tight">更多实用工具</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {relatedSkills.filter(skill => skill.id !== 'sensitive-comm-assistant').map(skill => (
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
                              <Link to={`/skills/${skill.id}`} className="text-apple-blue text-[11px] font-bold flex items-center gap-1 hover:gap-2 transition-all">
                                立即使用 <ChevronRight size={14} />
                              </Link>
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
                            <Link to={`/skills/${skill.id}`} className="text-apple-blue text-[11px] font-bold flex items-center gap-1 hover:gap-2 transition-all">
                              立即使用 <ChevronRight size={14} />
                            </Link>
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
