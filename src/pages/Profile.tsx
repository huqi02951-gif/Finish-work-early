import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Briefcase, Coffee, HeartPulse, Crosshair, Map,
  MessageSquare, ThumbsUp, LogOut, ShieldAlert,
  Flame, BatteryCharging, BatteryWarning, User as UserIcon
} from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import { apiService } from '../services/api';
import { User as UserType } from '../types';
import { cn } from '../../lib/utils';
import { LOCAL_NUMBER_KEYS, readLocalNumber, subscribeLocalNumber } from '../../lib/localSignals';
import InitialBadge from '../components/common/InitialBadge';
import { listCommunityEntries } from '../../lib/community';
import { motion, AnimatePresence } from 'framer-motion';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserType | null>(null);
  
  // Real-time calculation
  const [now, setNow] = useState(new Date());
  
  // Settings & Upgrades
  const [monthlySalary, setMonthlySalary] = useState(() => readLocalNumber(LOCAL_NUMBER_KEYS.salary, 6200));
  
  // Custom Interaction States
  const [restoredLife, setRestoredLife] = useState(0);
  
  // Community stats
  const [myPostCount, setMyPostCount] = useState(0);
  const [myLikesReceived, setMyLikesReceived] = useState(0);

  useEffect(() => {
    const fetchUser = async () => {
      const data = await apiService.getCurrentUser();
      setUser(data);
    };
    fetchUser();
    
    // Fetch real community stats for "当前浏览器用户" or default
    const fetchCommunityStats = async () => {
      const all = await listCommunityEntries('全部');
      // Approximate filter for user
      const mine = all.filter(p => p.author === '当前浏览器用户' || p.author === '实名认证-张经理');
      setMyPostCount(mine.length);
      const likes = mine.reduce((acc, curr) => acc + curr.likes, 0);
      setMyLikesReceived(likes);
    };
    fetchCommunityStats();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000); // UI update tick
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const unsub = subscribeLocalNumber(LOCAL_NUMBER_KEYS.salary, 6200, setMonthlySalary);
    return () => unsub();
  }, []);

  // Time metrics computations
  // Logic: 9:00 - 12:00 = 3h, 14:00 - 17:00 = 3h (Total 6h per day = 360 mins)
  const hour = now.getHours();
  const minute = now.getMinutes();
  const currentMinutesInDay = hour * 60 + minute;

  let status: 'OFF_DUTY' | 'WORKING' | 'OVERTIME' = 'OFF_DUTY';
  let workedMinutes = 0;
  let overtimeMinutes = 0;

  if (currentMinutesInDay < 9 * 60) {
    status = 'OFF_DUTY';
  } else if (currentMinutesInDay < 12 * 60) {
    status = 'WORKING';
    workedMinutes = currentMinutesInDay - 9 * 60;
  } else if (currentMinutesInDay < 14 * 60) {
    status = 'OFF_DUTY'; // Lunch break
    workedMinutes = 180; // 3 hours in morning
  } else if (currentMinutesInDay < 17 * 60) {
    status = 'WORKING';
    workedMinutes = 180 + (currentMinutesInDay - 14 * 60);
  } else {
    status = 'OVERTIME';
    workedMinutes = 360;
    overtimeMinutes = currentMinutesInDay - 17 * 60;
  }

  // Financial computations
  // 6200 RMB / 20 days / 360 mins = 0.861 RMB/min
  const minuteRate = monthlySalary / 20 / 360;
  const earnedToday = workedMinutes * minuteRate;
  const lostToOvertime = overtimeMinutes * minuteRate;

  // Life Value (生命值 0 - 100)
  // Baseline 100.
  // Working drops at a rate of 30 total over 6 hours (-5/hour)
  // Overtime drops at 1/min! (Super fast)
  // Restore life via actions
  let baseLife = 100;
  if (status === 'WORKING') {
    baseLife = 100 - (workedMinutes / 360) * 30; // Max drops to 70 normally
  } else if (status === 'OVERTIME') {
    baseLife = 100 - 30 - overtimeMinutes * 0.5; // Drops fast
  } else if (status === 'OFF_DUTY') {
    // Regenerating / Full
    baseLife = 100; 
  }
  
  const currentLifeRaw = baseLife + restoredLife;
  const currentLife = Math.max(0, Math.min(100, currentLifeRaw));

  // Determine Heartbeat / Avatar styling
  const isDanger = currentLife < 40 || status === 'OVERTIME';
  
  let heartbeatDesc = '心如止水';
  let badgeTone: "neutral" | "cyber" = 'neutral';
  
  if (status === 'OFF_DUTY') {
    heartbeatDesc = '活力四射!!';
    badgeTone = 'neutral';
  } else if (status === 'OVERTIME') {
    heartbeatDesc = '异常飙升 (心律不齐)';
    badgeTone = 'cyber';
  } else if (isDanger) {
    heartbeatDesc = '亟待抢救';
    badgeTone = 'cyber';
  }

  // Handlers
  const handleTouchFish = () => {
    setRestoredLife(prev => prev + 15);
  };

  const handleDrinkCoffee = () => {
    setRestoredLife(prev => prev + 10);
  };

  const currentLevel = Math.floor((myPostCount * 50 + myLikesReceived * 10) / 100) + 1;

  return (
    <AppLayout title="打工人生存看板">
      <div className="bg-brand-offwhite min-h-[100dvh] pb-24 font-sans text-brand-dark">
        {/* Banner */}
        <div className="bg-brand-dark pt-12 pb-6 px-6 text-white rounded-b-3xl shadow-md relative overflow-hidden">
          {/* subtle background pulse if danger */}
          {isDanger && (
            <motion.div 
              className="absolute inset-0 bg-red-600/20"
              animate={{ opacity: [0.1, 0.4, 0.1] }}
              transition={{ repeat: Infinity, duration: 1 }}
            />
          )}

          <div className="flex items-center gap-5 relative z-10">
            <div className="relative">
              <div className={cn(
                "w-20 h-20 rounded-full border-4 flex items-center justify-center bg-white",
                status === 'OVERTIME' ? "border-red-500 animate-pulse" : "border-white"
              )}>
                <InitialBadge label={user?.nickname || '客户经理'} className="w-16 h-16 text-xl shadow-sm" tone={badgeTone} />
              </div>
              <div className={cn(
                "absolute -bottom-2 -right-2 px-2 py-0.5 text-[10px] font-bold rounded-full border-2 border-brand-dark flex items-center gap-1",
                status === 'OFF_DUTY' ? "bg-green-400 text-brand-dark" :
                status === 'OVERTIME' ? "bg-red-500 text-white animate-bounce" : "bg-blue-400 text-brand-dark"
              )}>
                {status === 'OFF_DUTY' ? '🏄 下班' : status === 'OVERTIME' ? '🔥 爆肝' : '💼 搬砖'}
              </div>
            </div>
            
            <div className="flex-1">
              <h1 className="text-xl font-bold mb-1 flex items-center gap-2">
                {user?.nickname || '实名认证-客户经理'}
                <span className="text-[10px] px-2 py-0.5 rounded-sm bg-white/20 text-white font-normal backdrop-blur-sm">LV.{currentLevel} 行家</span>
              </h1>
              <div className="text-sm text-white/80 flex items-center gap-1.5 font-medium">
                <HeartPulse className="w-4 h-4 opacity-80" /> 
                {heartbeatDesc}
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 mt-6 max-w-lg mx-auto space-y-6">

          {/* Life & Salary Monitor Widget */}
          <section className="bg-white rounded-2xl p-5 shadow-sm border border-brand-border/60">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-bold text-brand-dark flex items-center gap-1.5">
                <BatteryCharging className="w-4 h-4 text-brand-dark" /> 生命体态监控
              </h2>
              <div className="text-[10px] bg-brand-light-gray text-brand-gray px-2 py-1 rounded">时区同步正常</div>
            </div>

            <div className="space-y-4">
              {/* Life Value Bar */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1.5">
                  <span className="text-brand-dark">剩余生命力</span>
                  <span className={cn(currentLife < 30 ? "text-red-500" : "text-brand-dark")}>{currentLife.toFixed(0)} / 100</span>
                </div>
                <div className="h-2.5 w-full bg-brand-light-gray rounded-full overflow-hidden">
                  <motion.div 
                    className={cn(
                      "h-full rounded-full transition-all duration-300",
                      currentLife > 60 ? "bg-green-500" : currentLife > 30 ? "bg-yellow-500" : "bg-red-500"
                    )}
                    initial={{ width: 0 }}
                    animate={{ width: `${currentLife}%` }}
                  />
                </div>
                {status === 'OVERTIME' && <p className="text-[10px] text-red-500 mt-1 font-medium">⚠️ 警告：当前无偿加班正在剧烈消耗你的健康指标！</p>}
              </div>

              {/* Earnings Panel */}
              <div className={cn(
                "rounded-xl p-4 flex justify-between items-center transition-colors",
                status === 'OVERTIME' ? "bg-red-50 border border-red-100" : "bg-brand-offwhite border border-brand-border/40"
              )}>
                <div>
                  <div className="text-[10px] text-brand-gray mb-0.5">💰 今日到手 (按 {monthlySalary} 基准推算)</div>
                  <div className="text-2xl font-bold text-brand-dark">¥{earnedToday.toFixed(2)}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-brand-gray mb-0.5">无偿被剥削</div>
                  <div className="text-sm font-bold text-red-500">¥{lostToOvertime.toFixed(2)}</div>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Actions / Touch Fish */}
          <section className="grid grid-cols-2 gap-3">
            <button 
              onClick={handleTouchFish}
              className="bg-white border border-brand-border/60 rounded-xl p-4 flex items-center justify-center gap-2 shadow-sm hover:bg-brand-offwhite hover:scale-[1.02] transition-all active:scale-95"
            >
              <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                <Map className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-brand-dark">带薪发呆</div>
                <div className="text-[9px] text-brand-gray">恢复 +15 生命</div>
              </div>
            </button>

            <button 
              onClick={handleDrinkCoffee}
              className="bg-white border border-brand-border/60 rounded-xl p-4 flex items-center justify-center gap-2 shadow-sm hover:bg-brand-offwhite hover:scale-[1.02] transition-all active:scale-95"
            >
              <div className="bg-amber-100 p-2 rounded-full text-amber-700">
                <Coffee className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-brand-dark">续命咖啡</div>
                <div className="text-[9px] text-brand-gray">脉动回来 +10</div>
              </div>
            </button>
          </section>

          {/* Community Nexus */}
          <section className="bg-white rounded-2xl p-5 shadow-sm border border-brand-border/60">
            <div className="flex justify-between items-center mb-4 border-b border-brand-border/40 pb-3">
              <h2 className="text-sm font-bold text-brand-dark flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-brand-dark" /> 职场威望中心
              </h2>
              <Link to="/workspace" className="text-[10px] text-brand-dark font-medium px-2 py-1 rounded bg-brand-light-gray hover:bg-brand-border/40 transition">
                去发帖 &gt;
              </Link>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-brand-offwhite rounded-lg">
                <div className="text-xl font-black text-brand-dark mb-1">{myPostCount}</div>
                <div className="text-[10px] text-brand-gray">发布经验帖</div>
              </div>
              <div className="text-center p-3 bg-brand-offwhite rounded-lg">
                <div className="text-xl font-black text-brand-dark mb-1">{myLikesReceived}</div>
                <div className="text-[10px] text-brand-gray">获同事共鸣点赞</div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-[10px] text-brand-gray">每发一帖或获得点赞，均可提升系统职场行家段位。</p>
            </div>
          </section>

          {/* System Configs */}
          <section className="bg-white rounded-2xl p-2 shadow-sm border border-brand-border/60 divide-y divide-brand-border/30">
            <Link to="/settings" className="flex items-center justify-between p-3 hover:bg-brand-offwhite rounded-t-xl transition-colors">
              <div className="flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-brand-gray" />
                <span className="text-xs font-semibold text-brand-dark">修改基础底薪池配置</span>
              </div>
              <div className="text-[10px] text-brand-gray font-medium">当前 ¥{monthlySalary} &gt;</div>
            </Link>
            
            <button 
              onClick={() => navigate('/')}
              className="w-full flex items-center justify-center gap-2 p-4 text-red-500 hover:bg-red-50 rounded-b-xl transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-xs font-bold">打卡下班退出 (Logout)</span>
            </button>
          </section>
          
          <div className="text-center py-4">
            <p className="text-[8px] font-medium tracking-widest text-brand-gray/40 uppercase">
              WORK SMART, NOT HARD.<br/>FWE INTERNAL DAEMON V2.0
            </p>
          </div>

        </div>
      </div>
    </AppLayout>
  );
};

export default Profile;
