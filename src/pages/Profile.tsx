
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, Settings, Bookmark, FileText, Shield, ChevronRight, LogOut,
  HelpCircle, Award, Heart, MessageCircle, Zap, Sparkles, Trophy,
  Clock, TrendingUp, Target, Calendar, Utensils, Timer, Coffee,
  ArrowUpRight, Flame, BarChart3, Star, Activity, Gift, Brain
} from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import { apiService } from '../services/api';
import { User as UserType } from '../types';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserType | null>(null);
  const [activeSection, setActiveSection] = useState<'overview' | 'growth' | 'tools'>('overview');
  const [now, setNow] = useState(new Date());
  const [monthlySalary] = useState(10000);

  useEffect(() => {
    const fetchUser = async () => {
      const data = await apiService.getCurrentUser();
      setUser(data);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Salary calculations (synced with EfficientOffDutyGame)
  const hourlyRate = monthlySalary / 20 / 8;
  const minuteRate = hourlyRate / 60;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const isOvertime = currentMinutes >= 17 * 60;
  const earnedToday = Math.min(Math.max(currentMinutes - 9 * 60, 0), 480) * minuteRate;
  const overtimeLoss = isOvertime ? (currentMinutes - 17 * 60) * minuteRate : 0;

  // Mock data
  const joinDays = 892;
  const skillsUsed = 47;
  const focusTomatoes = 3;

  const stats = [
    { label: '获赞', value: '1,284', icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50' },
    { label: '发帖', value: '67', icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: '积分', value: '8,420', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: '收藏', value: '256', icon: Bookmark, color: 'text-purple-500', bg: 'bg-purple-50' },
  ];

  const quickTools = [
    { icon: Utensils, label: '今天吃什么', desc: '午餐选择困难症救星', path: '/scenarios?tab=self', color: 'bg-orange-500' },
    { icon: Timer, label: '番茄时钟', desc: `今日已完成 ${focusTomatoes} 个`, path: '/scenarios?tab=self', color: 'bg-red-500' },
    { icon: TrendingUp, label: '加班计算器', desc: isOvertime ? `已损失 ¥${overtimeLoss.toFixed(1)}` : '实时时薪追踪', path: '/scenarios?tab=self', color: 'bg-emerald-500' },
    { icon: Calendar, label: '玄学日历', desc: '今日宜忌速查', path: '/scenarios?tab=self', color: 'bg-indigo-500' },
  ];

  const activityFeed = [
    { id: 1, type: 'skill', title: '使用了「利率优惠生成」工具', time: '30分钟前', icon: Zap, color: 'text-amber-500' },
    { id: 2, type: 'post', title: '发布了帖子：如何提高拓客效率？', time: '2小时前', icon: FileText, color: 'text-blue-500' },
    { id: 3, type: 'comment', title: '回复了：关于长融保审批的合规细节', time: '昨天', icon: MessageCircle, color: 'text-purple-500' },
    { id: 4, type: 'achievement', title: '解锁成就：连续7天准时下班 🏆', time: '3天前', icon: Trophy, color: 'text-amber-600' },
    { id: 5, type: 'skill', title: '使用了「银承/存单测算」工具', time: '上周', icon: Zap, color: 'text-amber-500' },
  ];

  const achievements = [
    { icon: '🏆', title: '准时下班王', desc: '连续7天17:00前下班', unlocked: true },
    { icon: '🔥', title: '热帖制造机', desc: '单帖获赞超过100', unlocked: true },
    { icon: '🧠', title: 'Skills大师', desc: '使用超过10个不同工具', unlocked: true },
    { icon: '⏰', title: '番茄收割者', desc: '累计完成100个番茄钟', unlocked: false },
    { icon: '📊', title: '数据达人', desc: '生成50份测算报告', unlocked: false },
    { icon: '🌟', title: '全能选手', desc: '四大场景各使用20次', unlocked: false },
  ];

  // Radar data (usage across 4 scenarios)
  const radarData = [
    { label: '对客户', value: 85 },
    { label: '对审查', value: 62 },
    { label: '对中后台', value: 45 },
    { label: '对自己', value: 78 },
  ];

  return (
    <AppLayout title="我的">
      <div className="pb-24 bg-brand-offwhite min-h-screen">
        {/* Compact Profile Header */}
        <section className="relative pt-6 pb-4 px-4 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-brand-dark via-brand-dark to-brand-dark/90" />
          <div className="absolute top-0 right-0 w-40 h-40 bg-brand-gold/10 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[60px]" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-white/10 p-0.5 overflow-hidden border border-white/10">
                  <img 
                    src={user?.avatar || 'https://picsum.photos/seed/user/200/200'} 
                    alt={user?.nickname} 
                    className="w-full h-full object-cover rounded-xl"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-brand-gold rounded-md flex items-center justify-center border-2 border-brand-dark">
                  <Star className="w-2.5 h-2.5 text-brand-dark" />
                </div>
              </div>
              <div className="flex-grow">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  {user?.nickname || '客户经理'}
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="px-1.5 py-0.5 bg-brand-gold/20 text-brand-gold rounded text-[8px] font-bold uppercase tracking-wider">
                    Pro Agent
                  </span>
                  <span className="text-[10px] text-white/40 font-mono">入职 {joinDays} 天</span>
                </div>
              </div>
              <button onClick={() => navigate('/settings')} className="p-2 bg-white/5 rounded-xl border border-white/10 text-white/40 hover:text-white transition-all">
                <Settings className="w-4 h-4" />
              </button>
            </div>

            {/* Live Earning Strip */}
            <div className="bg-white/5 rounded-xl px-3 py-2 border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={cn("w-1.5 h-1.5 rounded-full", isOvertime ? "bg-red-500 animate-pulse" : "bg-emerald-500")} />
                <span className="text-[10px] text-white/50 font-medium">
                  {isOvertime ? '加班中' : '工作中'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-white/40">今日已赚 </span>
                <span className={cn("text-xs font-mono font-bold", isOvertime ? "text-red-400" : "text-emerald-400")}>
                  ¥{earnedToday.toFixed(0)}
                </span>
                {isOvertime && (
                  <span className="text-[10px] text-red-400 ml-1.5 font-mono">-¥{overtimeLoss.toFixed(1)}</span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="px-4 -mt-2 relative z-20">
          <div className="bg-white rounded-2xl p-3 shadow-sm border border-brand-border/5 grid grid-cols-4 gap-1">
            {stats.map((stat, idx) => (
              <motion.div 
                key={idx}
                whileTap={{ scale: 0.95 }}
                className="flex flex-col items-center gap-0.5 py-2 cursor-pointer group"
              >
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110", stat.bg)}>
                  <stat.icon className={cn("w-3.5 h-3.5", stat.color)} />
                </div>
                <span className="text-sm font-bold text-brand-dark">{stat.value}</span>
                <span className="text-[9px] text-brand-gray font-bold">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Section Tabs */}
        <section className="px-4 mt-4">
          <div className="flex p-0.5 bg-brand-light-gray/50 rounded-xl border border-brand-border/5">
            {[
              { id: 'overview', label: '效能概览', icon: Activity },
              { id: 'growth', label: '成长轨迹', icon: TrendingUp },
              { id: 'tools', label: '我的工具', icon: Zap },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id as any)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[11px] font-bold transition-all",
                  activeSection === tab.id ? "bg-white text-brand-dark shadow-sm" : "text-brand-gray"
                )}
              >
                <tab.icon className="w-3 h-3" />
                {tab.label}
              </button>
            ))}
          </div>
        </section>

        {/* Content Sections */}
        <AnimatePresence mode="wait">
          {activeSection === 'overview' && (
            <motion.section key="overview" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="px-4 mt-4 space-y-3">
              {/* Skill Radar */}
              <div className="bg-white rounded-2xl p-4 border border-brand-border/5 shadow-sm">
                <h3 className="text-[11px] font-bold text-brand-dark mb-3 flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-brand-gold" /> 场景使用频次
                </h3>
                <div className="space-y-2">
                  {radarData.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-[10px] text-brand-gray w-14 shrink-0">{item.label}</span>
                      <div className="flex-grow h-5 bg-brand-light-gray/50 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{width:0}}
                          animate={{width:`${item.value}%`}}
                          transition={{duration:0.8,delay:idx*0.1}}
                          className={cn(
                            "h-full rounded-full flex items-center justify-end pr-2",
                            idx === 0 ? "bg-blue-500" : idx === 1 ? "bg-purple-500" : idx === 2 ? "bg-indigo-500" : "bg-rose-500"
                          )}
                        >
                          <span className="text-[8px] font-bold text-white">{item.value}%</span>
                        </motion.div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Today's Highlights */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white rounded-2xl p-3 border border-brand-border/5 shadow-sm">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Timer className="w-3 h-3 text-red-500" />
                    <span className="text-[10px] font-bold text-brand-gray">番茄钟</span>
                  </div>
                  <div className="text-xl font-bold text-brand-dark">{focusTomatoes}<span className="text-xs text-brand-gray font-normal ml-0.5">/ 8</span></div>
                  <div className="w-full h-1 bg-brand-light-gray rounded-full mt-2">
                    <div className="h-full bg-red-500 rounded-full" style={{width:`${(focusTomatoes/8)*100}%`}} />
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-3 border border-brand-border/5 shadow-sm">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Zap className="w-3 h-3 text-amber-500" />
                    <span className="text-[10px] font-bold text-brand-gray">工具使用</span>
                  </div>
                  <div className="text-xl font-bold text-brand-dark">{skillsUsed}<span className="text-xs text-brand-gray font-normal ml-0.5">次</span></div>
                  <div className="text-[9px] text-emerald-500 font-bold mt-2 flex items-center gap-0.5">
                    <ArrowUpRight className="w-2.5 h-2.5" /> +12% 本月
                  </div>
                </div>
              </div>

              {/* Achievements */}
              <div className="bg-white rounded-2xl p-4 border border-brand-border/5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[11px] font-bold text-brand-dark flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 text-amber-500" /> 成就勋章
                  </h3>
                  <span className="text-[10px] text-brand-gray">{achievements.filter(a => a.unlocked).length}/{achievements.length}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {achievements.map((ach, idx) => (
                    <div key={idx} className={cn(
                      "flex flex-col items-center p-2 rounded-xl text-center transition-all",
                      ach.unlocked ? "bg-amber-50 border border-amber-200" : "bg-brand-light-gray/30 opacity-40"
                    )}>
                      <span className="text-lg mb-0.5">{ach.icon}</span>
                      <span className="text-[9px] font-bold text-brand-dark line-clamp-1">{ach.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.section>
          )}

          {activeSection === 'growth' && (
            <motion.section key="growth" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="px-4 mt-4 space-y-3">
              <h3 className="text-[11px] font-bold text-brand-dark px-1 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-brand-gold" /> 最近动态
              </h3>
              {activityFeed.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{opacity:0,x:-10}}
                  animate={{opacity:1,x:0}}
                  transition={{delay:idx*0.05}}
                  className="bg-white p-3.5 rounded-2xl border border-brand-border/5 shadow-sm flex items-start gap-3 group cursor-pointer hover:shadow-md transition-all"
                >
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                    item.type === 'post' ? "bg-blue-50" : item.type === 'comment' ? "bg-purple-50" : item.type === 'achievement' ? "bg-amber-50" : "bg-amber-50"
                  )}>
                    <item.icon className={cn("w-3.5 h-3.5", item.color)} />
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="text-[12px] font-medium text-brand-dark line-clamp-2 leading-relaxed group-hover:text-blue-600 transition-colors">{item.title}</p>
                    <span className="text-[9px] text-brand-gray mt-1 block">{item.time}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-brand-border shrink-0 mt-1 group-hover:text-blue-500 transition-colors" />
                </motion.div>
              ))}
            </motion.section>
          )}

          {activeSection === 'tools' && (
            <motion.section key="tools" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="px-4 mt-4 space-y-3">
              <h3 className="text-[11px] font-bold text-brand-dark px-1 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-brand-gold" /> 快捷工具（关联「对自己」）
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {quickTools.map((tool, idx) => (
                  <motion.div
                    key={idx}
                    whileTap={{scale:0.97}}
                    onClick={() => navigate(tool.path)}
                    className="bg-white p-3.5 rounded-2xl border border-brand-border/5 shadow-sm cursor-pointer group hover:shadow-md transition-all"
                  >
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-white mb-2", tool.color)}>
                      <tool.icon className="w-4 h-4" />
                    </div>
                    <h4 className="text-[12px] font-bold text-brand-dark group-hover:text-blue-600 transition-colors">{tool.label}</h4>
                    <p className="text-[10px] text-brand-gray mt-0.5">{tool.desc}</p>
                  </motion.div>
                ))}
              </div>

              {/* Quick Menu */}
              <div className="space-y-2 mt-2">
                {[
                  { icon: FileText, label: '我的发布', count: '12', path: '/bbs' },
                  { icon: Bookmark, label: '收藏内容', count: '256', path: '/skills' },
                  { icon: Trophy, label: '成就中心', count: '3/6', path: '/scenarios?tab=self' },
                  { icon: HelpCircle, label: '使用帮助', path: '/instructions' },
                ].map((item, idx) => (
                  <Link
                    key={idx}
                    to={item.path}
                    className="flex items-center justify-between p-3 bg-white rounded-xl border border-brand-border/5 shadow-sm hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-brand-light-gray flex items-center justify-center text-brand-dark/50 group-hover:text-blue-500 group-hover:bg-blue-50 transition-all">
                        <item.icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h4 className="text-[12px] font-bold text-brand-dark">{item.label}</h4>
                        {item.count && <p className="text-[9px] text-brand-gray">{item.count} 项</p>}
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-brand-border group-hover:text-blue-500 transition-all" />
                  </Link>
                ))}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Footer */}
        <section className="px-4 mt-6 space-y-3">
          <button 
            className="w-full py-3 bg-red-50 text-red-500 rounded-2xl font-bold text-[12px] flex items-center justify-center gap-1.5 hover:bg-red-100 transition-all active:scale-95 border border-red-100"
          >
            <LogOut className="w-3.5 h-3.5" /> 退出登录
          </button>
          <div className="text-center py-4 space-y-1 opacity-30">
            <p className="text-[9px] font-bold text-brand-gray uppercase tracking-[0.3em]">finish work early</p>
            <p className="text-[8px] text-brand-gray">© 2026 客户经理agent+skills</p>
          </div>
        </section>
      </div>
    </AppLayout>
  );
};

export default Profile;
