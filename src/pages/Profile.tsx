import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, HeartPulse,
  MessageSquare, LogOut, TerminalSquare, ShieldAlert,
  Terminal, Shield
} from 'lucide-react';
import CyberLayout from '../components/layout/CyberLayout';
import CommunityAccessGate from '../components/community/CommunityAccessGate';
import { apiService } from '../services/api';
import { User as UserType } from '../types';
import { cn } from '../../lib/utils';
import { LOCAL_NUMBER_KEYS, readLocalNumber, subscribeLocalNumber, writeLocalNumber } from '../../lib/localSignals';
import InitialBadge from '../components/common/InitialBadge';
import { forumApi } from '../services/forumApi';
import { getAuthSession } from '../services/authService';
import { motion } from 'framer-motion';
import { syncPetStatus } from '../../lib/petOs';

// --- Cyberpunk / CLI Components ---

const GlitchText: React.FC<{ text: string; className?: string; glitchHoverOnly?: boolean }> = ({ text, className, glitchHoverOnly }) => {
  return (
    <span className={cn("relative inline-block group font-bold tracking-wider", className)}>
      <span className="relative z-10">{text}</span>
      <span className={cn(
        "absolute top-0 left-[1px] z-0 text-[#00ff41] opacity-30 select-none",
        glitchHoverOnly ? "opacity-0 group-hover:opacity-30 group-hover:clip-glitch-1" : "clip-glitch-1"
      )} aria-hidden>{text}</span>
      <span className={cn(
        "absolute top-0 left-[-2px] z-0 text-[#ff0040] opacity-30 select-none",
        glitchHoverOnly ? "opacity-0 group-hover:opacity-30 group-hover:clip-glitch-2" : "clip-glitch-2"
      )} aria-hidden>{text}</span>
    </span>
  );
};

const AsciiProgress: React.FC<{ percent: number; width?: number; color?: string; danger?: boolean }> = ({ percent, width = 20, color = "text-[#00ff41]", danger }) => {
  const filledCount = Math.round((Math.min(100, Math.max(0, percent)) / 100) * width);
  const emptyCount = width - filledCount;
  const filled = "█".repeat(filledCount);
  const empty = "░".repeat(emptyCount);
  
  return (
    <span className={cn("font-mono tracking-tight", color, danger ? "text-red-500" : "")}>
      [{filled}<span className={danger ? "text-red-900" : "text-green-900"}>{empty}</span>] {percent.toFixed(0)}%
    </span>
  );
};

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserType | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  
  const [now, setNow] = useState(new Date());
  const [monthlySalary, setMonthlySalary] = useState(() => readLocalNumber(LOCAL_NUMBER_KEYS.salary, 6200));
  const [restoredLife, setRestoredLife] = useState(0);
  const touchFishCounterRef = useRef(readLocalNumber(LOCAL_NUMBER_KEYS.touchFishCounter, 0));
  const coffeeCounterRef = useRef(readLocalNumber(LOCAL_NUMBER_KEYS.coffeeCounter, 0));
  
  const [myPostCount, setMyPostCount] = useState(0);
  const [myLikesReceived, setMyLikesReceived] = useState(0);

  const [isEditingSalary, setIsEditingSalary] = useState(false);
  const [salaryInput, setSalaryInput] = useState(String(monthlySalary));

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await apiService.getCurrentUser();
        setUser(data);
      } catch {
        setUser(null);
      }
    };
    void fetchUser();
    
    // Fetch real community stats from backend
    const fetchCommunityStats = async () => {
      setStatsLoading(true);
      setStatsError(null);
      const session = getAuthSession();
      if (!session || session.loginMethod === 'demo') {
        setMyPostCount(0);
        setMyLikesReceived(0);
        setStatsLoading(false);
        return;
      }
      try {
        const res = await forumApi.getMyPosts({ pageSize: 100 });
        setMyPostCount(res.total);
        setMyLikesReceived(0); // likes not yet supported by backend
      } catch {
        setMyPostCount(0);
        setMyLikesReceived(0);
        setStatsError('社区统计读取失败，已回退为 0');
      } finally {
        setStatsLoading(false);
      }
    };
    void fetchCommunityStats();

  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const unsub = subscribeLocalNumber(LOCAL_NUMBER_KEYS.salary, 6200, setMonthlySalary);
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsubTouchFish = subscribeLocalNumber(
      LOCAL_NUMBER_KEYS.touchFishCounter,
      0,
      (nextCount) => {
        const delta = Math.max(0, nextCount - touchFishCounterRef.current);
        touchFishCounterRef.current = nextCount;
        if (delta > 0) {
          setRestoredLife((prev) => prev + delta * 15);
        }
      },
    );

    const unsubCoffee = subscribeLocalNumber(
      LOCAL_NUMBER_KEYS.coffeeCounter,
      0,
      (nextCount) => {
        const delta = Math.max(0, nextCount - coffeeCounterRef.current);
        coffeeCounterRef.current = nextCount;
        if (delta > 0) {
          setRestoredLife((prev) => prev + delta * 10);
        }
      },
    );

    return () => {
      unsubTouchFish();
      unsubCoffee();
    };
  }, []);

  // Time metrics computations (9-12, 14-17)
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
    status = 'OFF_DUTY'; // Lunch
    workedMinutes = 180;
  } else if (currentMinutesInDay < 17 * 60) {
    status = 'WORKING';
    workedMinutes = 180 + (currentMinutesInDay - 14 * 60);
  } else {
    status = 'OVERTIME';
    workedMinutes = 360;
    overtimeMinutes = currentMinutesInDay - 17 * 60;
  }

  // Financial computations
  const minuteRate = monthlySalary / 20 / 360;
  const earnedToday = workedMinutes * minuteRate;
  const lostToOvertime = overtimeMinutes * minuteRate;

  // Life Value (0-100)
  let baseLife = 100;
  if (status === 'WORKING') {
    baseLife = 100 - (workedMinutes / 360) * 30; 
  } else if (status === 'OVERTIME') {
    baseLife = 100 - 30 - overtimeMinutes * 0.5; 
  } else if (status === 'OFF_DUTY') {
    baseLife = 100; 
  }
  
  const currentLifeRaw = baseLife + restoredLife;
  const currentLife = Math.max(0, Math.min(100, currentLifeRaw));

  // Determine State UI
  const isDanger = currentLife < 40 || status === 'OVERTIME';
  let heartbeatDesc = 'STATUS_STABLE_心如止水';
  if (status === 'OFF_DUTY') {
    heartbeatDesc = 'STATUS_MAX_活力四射!!';
  } else if (status === 'OVERTIME') {
    heartbeatDesc = 'ERR_OVERLOAD_心律不齐';
  } else if (isDanger) {
    heartbeatDesc = 'CRITICAL_亟待抢救';
  }

  useEffect(() => {
    void syncPetStatus(status);
  }, [status]);

  useEffect(() => {
    writeLocalNumber(LOCAL_NUMBER_KEYS.currentLife, Number(currentLife.toFixed(1)));
  }, [currentLife]);

  const currentLevel = Math.floor((myPostCount * 50 + myLikesReceived * 10) / 100) + 1;

  const saveSalary = () => {
    const val = Number(salaryInput);
    if (!isNaN(val) && val > 0) {
      writeLocalNumber(LOCAL_NUMBER_KEYS.salary, val);
      setMonthlySalary(val);
    }
    setIsEditingSalary(false);
  };

  return (
    <CyberLayout title="SysOps" subtitle="生命维持终端 (Daemon_V2)">
      <CommunityAccessGate moduleName="执行底层逻辑管控模块" />

      <div className="p-4 relative z-10 max-w-lg mx-auto space-y-6">
        
        {/* Terminal Header Info */}
        <section className={cn(
          "border p-3 shadow-[0_0_15px_rgba(0,255,65,0.1)] relative overflow-hidden transition-colors",
          isDanger ? "border-red-500 bg-red-950/20" : "border-[#00ff41]/30 bg-black"
        )}>
          {isDanger && (
            <motion.div 
              className="absolute inset-0 bg-red-500/10"
              animate={{ opacity: [0.1, 0.3, 0.1] }}
              transition={{ repeat: Infinity, duration: 1 }}
            />
          )}

          <div className="text-[#00ff41] text-[10px] mb-3 font-bold opacity-70 flex justify-between items-center">
            <span><span className="text-gray-500">$</span> ./check_health_status.sh -v</span>
          </div>
          
          <div className="flex gap-4 items-start relative z-10">
            <div className={cn(
               "w-16 h-16 shrink-0 relative flex items-center justify-center border-2 border-dashed",
               isDanger ? "border-red-500 shadow-[0_0_10px_rgba(255,0,0,0.5)]" : "border-[#00ff41]/50 bg-[#0A1A0F]"
            )}>
              <InitialBadge label={user?.nickname || '客户经理'} tone="cyber" className="h-12 w-12 text-sm !bg-black" />
            </div>
            
            <div className="flex-grow space-y-1">
              <div className="flex justify-between items-end">
                <GlitchText text={`代号: ${user?.nickname || '实名认证-客户经理'}`} className={cn("text-lg font-bold tracking-tight", isDanger ? "text-red-500" : "text-[#00ff41]")} glitchHoverOnly />
                <span className="text-[#f5a623] text-[10px] border border-[#f5a623]/50 px-1 font-bold">LVL.{currentLevel}</span>
              </div>
              
              <div className="text-[10px] mt-1 space-y-1.5 font-bold">
                <div className="flex items-center gap-1.5 opacity-80">
                  <HeartPulse className={cn("w-3 h-3", isDanger ? "text-red-500 animate-pulse" : "text-[#00ff41]")} />
                  <span className={isDanger ? "text-red-500" : "text-[#00ff41]"}>[{heartbeatDesc}]</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-gray-400">生命值 (Life_Force)</span>
                  <span className={isDanger ? "text-red-500" : "text-[#00ff41]"}>{currentLife.toFixed(1)}/100</span>
                </div>
                <AsciiProgress percent={currentLife} width={22} danger={isDanger} />
              </div>
            </div>
          </div>
        </section>

        {/* Experience Badges & Check-in (Task 3 / 5 Enhancements) */}
        <section className="border border-[#00ff41]/20 p-3 bg-[#0a0a0a]">
          <div className="text-[#00ff41] text-[10px] mb-3 pb-1 border-b border-[#00ff41]/20 flex justify-between items-center">
            <span className="flex items-center gap-1"><Shield className="w-3 h-3"/> 职场挂件与徽章库 (Badges)</span>
            {/* 每日签到/工作打卡 (Punch in) UI */}
            <button className="flex items-center justify-center gap-1 bg-[#00ff41]/10 hover:bg-[#00ff41]/20 px-3 py-1 min-h-[44px] border border-[#00ff41]/30 transition-all active:scale-95 group">
              <span className="text-[#00ff41] text-[9px] font-bold">今日打卡</span>
              <div className="w-1.5 h-1.5 rounded-full bg-[#00ff41] animate-pulse" />
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
             <div className="shrink-0 flex flex-col items-center gap-1 w-12 opacity-50 hover:opacity-100 transition-opacity">
               <div className="w-8 h-8 flex items-center justify-center rounded-sm border border-[#00ff41]/40 bg-[#00ff41]/5 text-[#00FFAA] shadow-[0_0_8px_rgba(0,255,170,0.1)]">
                 <TerminalSquare size={14} />
               </div>
               <span className="text-[8px] font-mono text-[#00ff41]/70">创作者</span>
             </div>
             
             <div className="shrink-0 flex flex-col items-center gap-1 w-12 opacity-30">
               <div className="w-8 h-8 flex items-center justify-center rounded-sm border border-dashed border-[#00ff41]/20 bg-black text-[#00ff41]/30">
                 <Briefcase size={14} />
               </div>
               <span className="text-[8px] font-mono text-[#00ff41]/40">10W+贴</span>
             </div>

             <div className="shrink-0 flex flex-col items-center gap-1 w-12 opacity-30">
               <div className="w-8 h-8 flex items-center justify-center rounded-sm border border-dashed border-[#00ff41]/20 bg-black text-[#00ff41]/30">
                 <MessageSquare size={14} />
               </div>
               <span className="text-[8px] font-mono text-[#00ff41]/40">意见领袖</span>
             </div>
          </div>
        </section>

        {/* Salary Matrix */}
        <section className={cn(
          "border border-[#00ff41]/30 p-3 relative",
          status === 'OVERTIME' && "border-red-500 shadow-[0_0_15px_rgba(255,0,0,0.3)] bg-red-950/20"
        )}>
          <div className="text-[#00ff41] text-[10px] mb-2 pb-1 border-b border-[#00ff41]/20 flex items-center justify-between">
            <span className="flex items-center gap-1">
              {status === 'OVERTIME' ? <ShieldAlert className="w-3 h-3 text-red-500" /> : <Terminal className="w-3 h-3"/>}
              <span>Sys.Crypto_Value 收益引擎</span>
            </span>
            <div className="flex items-center gap-2">
              <span className="opacity-50 text-[8px]">BASE_VAL:</span>
              {isEditingSalary ? (
                <div className="flex items-center gap-1">
                  <input 
                    autoFocus
                    value={salaryInput}
                    onChange={(e) => setSalaryInput(e.target.value)}
                    onBlur={saveSalary}
                    onKeyDown={(e) => e.key === 'Enter' && saveSalary()}
                    className="bg-[#00ff41]/10 border border-[#00ff41]/50 text-[#00ff41] text-[10px] w-16 px-1 outline-none"
                  />
                </div>
              ) : (
                <span 
                  onClick={() => setIsEditingSalary(true)}
                  className="cursor-pointer hover:bg-[#00ff41]/20 px-2 py-1 min-h-[36px] flex items-center border border-dashed border-[#00ff41]/30"
                >
                  {monthlySalary}
                </span>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center py-2">
            <div>
              <div className="text-[9px] text-[#00ff41]/60 mb-1 tracking-wider uppercase">今日已入账 (Verified)</div>
              <div className="text-2xl font-bold text-[#00ff41] drop-shadow-[0_0_8px_rgba(0,255,65,0.8)]">
                ¥ {earnedToday.toFixed(2)}
              </div>
            </div>
            <div className="text-right border-l border-[#00ff41]/20 pl-4">
              <div className="text-[9px] text-[#00ff41]/60 mb-1 tracking-wider uppercase">被无偿剥削 (Loss)</div>
              <div className={cn("text-lg font-bold", status === 'OVERTIME' ? "text-red-500 animate-pulse" : "text-[#00ff41]/50")}>
                ¥ {lostToOvertime.toFixed(2)}
              </div>
            </div>
          </div>
          {status === 'OVERTIME' && (
             <div className="text-[9px] text-red-400 mt-2 p-1 border border-red-900/50 bg-red-950/40 font-bold uppercase tracking-widest text-center">
                ! Warning: Working without compensation !
             </div>
          )}
        </section>

        {/* Access logs */}
        <section className="border border-[#00ff41]/30 p-3">
          <div className="text-[#00ff41] text-[10px] mb-2 pb-1 border-b border-[#00ff41]/20 flex justify-between items-center">
            <span className="flex items-center gap-1"><TerminalSquare className="w-3 h-3"/> 社区节点声望</span>
            <span className="text-[8px] text-[#00ff41]/50">
              {statsLoading ? 'SYNCING' : statsError ? 'FALLBACK' : 'ONLINE'}
            </span>
          </div>
          <div className="flex justify-between items-center text-[11px] my-1">
            <span className="text-[#00ff41]/70">上传数据包 [发帖记录]</span>
            <span className="font-bold text-[#00ff41]">
              {"█".repeat(Math.min(10, myPostCount))} {myPostCount} 个
            </span>
          </div>
          <div className="flex justify-between items-center text-[11px] my-1">
            <span className="text-[#00ff41]/70">接收共鸣波 [获赞数]</span>
            <span className="font-bold text-[#00ff41]">
              {"█".repeat(Math.min(10, myLikesReceived))} {myLikesReceived} 次
            </span>
          </div>
          {statsError && (
            <div className="mt-2 text-[9px] text-amber-400">{statsError}</div>
          )}
        </section>

        {/* System Out */}
        <section className="pt-2">
          <button 
            onClick={() => navigate('/')}
            className="w-full bg-[#050505] border border-red-900 hover:border-red-500 hover:bg-red-500/10 p-3 flex justify-between items-center group transition-colors"
          >
            <span className="text-[11px] text-red-500 font-bold font-mono group-hover:text-red-400">
              <span className="text-gray-600 mr-2">$</span>
              sudo poweroff --退出终端链接
            </span>
            <LogOut className="w-4 h-4 text-red-500 group-hover:text-red-400" />
          </button>
        </section>

      </div>
    </CyberLayout>
  );
};

export default Profile;
