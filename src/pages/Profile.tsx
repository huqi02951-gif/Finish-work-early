import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Terminal, ShieldAlert, Cpu, HeartPulse, Activity, LogOut, 
  Settings, FolderTree, ArrowRight, Zap, Target, Lock
} from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import { apiService } from '../services/api';
import { User as UserType } from '../types';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// --- Cyberpunk / CLI Components ---

const GlitchText: React.FC<{ text: string; className?: string; glitchHoverOnly?: boolean }> = ({ text, className, glitchHoverOnly }) => {
  return (
    <span className={cn("relative inline-block group", className)}>
      <span className="relative z-10">{text}</span>
      <span className={cn(
        "absolute top-0 left-[1px] z-0 text-[#00ff41] opacity-30 select-none",
        glitchHoverOnly ? "opacity-0 group-hover:opacity-30 group-hover:clip-glitch-1" : "clip-glitch-1"
      )} aria-hidden>{text}</span>
      <span className={cn(
        "absolute top-0 left-[-1px] z-0 text-[#ff0040] opacity-20 select-none",
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
      }, 50); // typing speed
    };

    if (delay > 0) {
      setTimeout(startTyping, delay);
    } else {
      startTyping();
    }

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
      [{filled}<span className="text-gray-600">{empty}</span>] {percent.toFixed(0)}%
    </span>
  );
};

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserType | null>(null);
  const [activeScreen, setActiveScreen] = useState<'AUTH' | 'MAIN' | 'TOOLS' | 'LOGOUT'>('AUTH');
  const [activeTab, setActiveTab] = useState<'SYS_STATS' | 'MODULES' | 'ACHIEVEMENTS'>('SYS_STATS');
  const [now, setNow] = useState(new Date());
  
  // Game state
  const [monthlySalary] = useState(10000);
  const [level] = useState(42);
  const [xp] = useState(8420);
  const nextLevelXp = 10000;
  const xpPercent = (xp / nextLevelXp) * 100;

  useEffect(() => {
    const fetchUser = async () => {
      const data = await apiService.getCurrentUser();
      setUser(data);
    };
    fetchUser();
    
    // Boot sequence mock
    setTimeout(() => setActiveScreen('MAIN'), 1500);
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

  // Render Authentication screen
  if (activeScreen === 'AUTH') {
    return (
      <AppLayout title="Terminal">
        <div className="bg-[#050505] min-h-screen text-[#00ff41] font-mono p-4 flex flex-col justify-center items-center relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] opacity-50 z-50"></div>
          
          <div className="text-center z-10 w-full max-w-sm">
            <Lock className="w-12 h-12 mx-auto mb-4 opacity-70 animate-pulse text-[#00ff41]" />
            <div className="text-left bg-black p-4 border border-[#00ff41]/30 shadow-[0_0_15px_rgba(0,255,65,0.2)]">
              <TypewriterText text="CONNECTING TO SECURE MAINFRAME..." />
              <br/>
              <TypewriterText text="VERIFYING AGENT PROTOCOLS..." delay={500} />
              <br/>
              <TypewriterText text="ACCESS GRANTED." delay={1000} className="text-green-300 font-bold" />
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Stats Grid Data
  const sysStats = [
    { label: 'LIKES', val: '1284', icon: HeartPulse },
    { label: 'POSTS', val: '67', icon: Terminal },
    { label: 'TOKENS', val: xp.toString(), icon: Zap },
  ];

  const quickTools = [
    { cmd: './execute --food', label: '今天吃什么', path: '/scenarios?tab=self', badge: 'v1.0' },
    { cmd: './focus --tomato', label: '番茄时钟', path: '/scenarios?tab=self', badge: 'ACTIVE' },
    { cmd: './calc --overtime', label: '加班计算器', path: '/scenarios?tab=self', badge: isOvertime ? 'CRITICAL' : 'OK' },
    { cmd: './run --fengshui', label: '玄学日历', path: '/scenarios?tab=self', badge: 'Daily' },
  ];

  return (
    <AppLayout title="SysOps">
      <div className="bg-[#050505] min-h-[100dvh] text-gray-300 font-mono pb-24 relative overflow-hidden">
        {/* CRT Scanline Overlay */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] opacity-40 z-50"></div>
        
        {/* Vim-like top bar */}
        <div className="bg-[#1a1a1a] text-[#00ff41] px-2 py-1 flex justify-between text-[10px] border-b border-[#00ff41]/20 sticky top-0 z-40">
          <span className="flex items-center gap-1"><Terminal className="w-3 h-3"/> tty1</span>
          <span>root@{user?.nickname || 'agent'} ~</span>
        </div>

        <div className="p-4 relative z-10 max-w-lg mx-auto space-y-6">
          
          {/* Identity Box */}
          <section className="border border-[#00ff41]/30 bg-black p-3 shadow-[0_0_10px_rgba(0,255,65,0.1)]">
            <div className="text-[#00ff41] text-[10px] mb-2 font-bold opacity-70">
              <span className="text-gray-500">$</span> whoami --details
            </div>
            
            <div className="flex gap-4 items-start">
              <div className="w-16 h-16 border-2 border-[#00ff41]/50 p-1 shrink-0 relative group cursor-pointer overflow-hidden bg-[#0A1A0F]">
                <img 
                  src={user?.avatar || 'https://picsum.photos/seed/hacker/200/200'} 
                  alt="avatar" 
                  className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all mix-blend-luminosity"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-[#00ff41]/20 mix-blend-overlay group-hover:opacity-0 transition-opacity"></div>
                {/* Glitch overlay on hover */}
                <div className="absolute -inset-1 bg-[#00ff41] opacity-0 group-hover:opacity-20 group-hover:clip-glitch-1 mix-blend-overlay pointer-events-none"></div>
              </div>
              
              <div className="flex-grow space-y-1">
                <div className="flex justify-between items-end">
                  <GlitchText text={`ID: ${user?.nickname || 'CLI_AGENT'}`} className="text-[#00ff41] text-lg font-bold tracking-tight" glitchHoverOnly />
                  <span className="text-[#f5a623] text-[10px] border border-[#f5a623]/50 px-1">LVL.{level}</span>
                </div>
                
                <div className="text-[10px] text-gray-400">CLASS: PRO_AGENT</div>
                <div className="text-[10px] mt-1 space-y-0.5">
                  <div className="flex justify-between text-[#00ff41]">
                    <span>XP_SYNC</span>
                    <span>{xp}/{nextLevelXp}</span>
                  </div>
                  <AsciiProgress percent={xpPercent} width={20} />
                </div>
              </div>
            </div>
          </section>

          {/* Overtime Alert Monitor */}
          <section>
            <div className="text-[#00ff41] text-[10px] mb-1 font-bold opacity-70">
              <span className="text-gray-500">$</span> ./monitor_salary.sh
            </div>
            
            <motion.div 
              className={cn(
                "p-3 border text-xs", 
                isOvertime 
                  ? "border-red-500 bg-red-950/30 text-red-400 shadow-[0_0_15px_rgba(255,0,0,0.2)]" 
                  : "border-[#00ff41]/30 bg-[#00ff41]/5 text-[#00ff41]"
              )}
              animate={isOvertime ? { boxShadow: ['0 0 5px #ff0000', '0 0 15px #ff0000', '0 0 5px #ff0000'] } : {}}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold flex items-center gap-1">
                  {isOvertime ? <ShieldAlert className="w-3.5 h-3.5 text-red-500 animate-pulse" /> : <Activity className="w-3.5 h-3.5" />}
                  {isOvertime ? "SYSTEM ALERT" : "STATUS OK"}
                </span>
                <span className="text-[10px] opacity-70">{now.toLocaleTimeString('en-US', { hour12: false })}</span>
              </div>
              
              {isOvertime ? (
                <div className="space-y-1 mt-2">
                  <GlitchText text="EXPLOITATION DETECTED (无偿加班中)" className="text-red-500 font-bold block" />
                  <div className="flex justify-between mt-2 border-t border-red-900/50 pt-1">
                    <span>ESTIMATED LOSS:</span>
                    <span className="font-bold text-red-400">¥ {overtimeLoss.toFixed(2)}</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-1 mt-2 border-l-2 border-[#00ff41] pl-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">NODE STATUS</span>
                    <span>ACTIVE</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">DAILY YIELD</span>
                    <span className="text-[#00ff41]">¥ {earnedToday.toFixed(0)}</span>
                  </div>
                </div>
              )}
            </motion.div>
          </section>

          {/* Terminal Tabs */}
          <section>
            <div className="flex border-b border-[#00ff41]/30 mb-3">
              {[
                { id: 'SYS_STATS', label: 'SYS_STATS', cmd: 'top' },
                { id: 'MODULES', label: 'SKILL_MAP', cmd: 'ls -l' },
                { id: 'ACHIEVEMENTS', label: 'BADGES', cmd: 'cat badges.txt' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "px-3 py-1.5 text-[10px] md:text-xs font-bold transition-all relative",
                    activeTab === tab.id 
                      ? "text-black bg-[#00ff41]" 
                      : "text-[#00ff41]/50 hover:text-[#00ff41]"
                  )}
                >
                  {tab.cmd}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'SYS_STATS' && (
                <motion.div key="stats" initial={{opacity:0, x:-5}} animate={{opacity:1, x:0}} exit={{opacity:0}} className="space-y-4">
                  {/* Grid Metrics */}
                  <div className="grid grid-cols-3 gap-2">
                    {sysStats.map((stat, idx) => (
                      <div key={idx} className="border border-[#00ff41]/20 bg-[#00ff41]/5 p-2 flex flex-col items-center justify-center relative overflow-hidden group cursor-crosshair">
                        <stat.icon className="w-4 h-4 text-[#00ff41]/40 mb-1 group-hover:text-[#00ff41] transition-colors" />
                        <span className="text-[#00ff41] font-bold">{stat.val}</span>
                        <span className="text-[8px] text-gray-500 tracking-widest">{stat.label}</span>
                        {/* Hover corner brackets */}
                        <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-[#00ff41] opacity-0 group-hover:opacity-100"></div>
                        <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-[#00ff41] opacity-0 group-hover:opacity-100"></div>
                      </div>
                    ))}
                  </div>

                  {/* CPU / Usage bars */}
                  <div className="border border-[#00ff41]/20 p-3">
                    <div className="text-[10px] text-[#00ff41] mb-2 pb-1 border-b border-[#00ff41]/20 flex items-center gap-1">
                      <Cpu className="w-3 h-3"/> SCENARIO_ALLOCATION
                    </div>
                    {[
                      { label: 'CLIENT_OPS', val: 85 },
                      { label: 'AUDIT_NET', val: 62 },
                      { label: 'MID_OFFICE', val: 45 },
                      { label: 'SELF_CARE', val: 78 },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center text-[10px] my-1.5">
                        <span className="w-20 text-[#00ff41]/70">{item.label}</span>
                        <span>[</span>
                        <span className="flex-grow text-[#00ff41]">
                          {"#".repeat(Math.floor(item.val/5))}
                          <span className="text-gray-700">{".".repeat(20 - Math.floor(item.val/5))}</span>
                        </span>
                        <span>]</span>
                        <span className="w-8 text-right text-[#00ff41]">{item.val}%</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'MODULES' && (
                <motion.div key="modules" initial={{opacity:0, x:-5}} animate={{opacity:1, x:0}} exit={{opacity:0}} className="space-y-2">
                  <div className="text-[#00ff41] text-[10px] mb-2 opacity-70">
                    <span className="text-gray-500">$</span> ls -la ./quick_tools/
                  </div>
                  {quickTools.map((tool, idx) => (
                    <motion.div 
                      key={idx}
                      whileHover={{ x: 5 }}
                      onClick={() => navigate(tool.path)}
                      className="border border-[#00ff41]/20 hover:border-[#00ff41] bg-black p-2 flex items-center justify-between cursor-pointer group transition-all"
                    >
                      <div className="flex flex-col">
                        <span className="text-[#00ff41] text-xs font-bold font-mono group-hover:hidden transition-all">{tool.cmd}</span>
                        <span className="text-[#00ff41] text-xs font-bold font-mono hidden group-hover:block transition-all">
                          <span className="bg-[#00ff41] text-black px-1.5 mr-1">EXEC</span> {tool.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "text-[9px] px-1 border",
                          tool.badge === 'CRITICAL' ? "border-red-500 text-red-500 animate-pulse" : "border-[#00ff41]/50 text-[#00ff41]/70"
                        )}>
                          {tool.badge}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                  
                  {/* Additional directories */}
                  <div className="pt-4 grid grid-cols-2 gap-2">
                    {[
                      { icon: FolderTree, label: '../settings', path: '/settings' },
                      { icon: FolderTree, label: '../bbs_logs', path: '/bbs' },
                    ].map((dir, idx) => (
                      <Link key={idx} to={dir.path} className="flex items-center gap-1.5 text-[10px] text-gray-500 hover:text-[#00ff41] transition-colors cursor-pointer border border-transparent hover:border-[#00ff41]/30 bg-[#1a1a1a] p-2">
                        <dir.icon className="w-3.5 h-3.5" /> {dir.label}
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'ACHIEVEMENTS' && (
                <motion.div key="achievements" initial={{opacity:0, x:-5}} animate={{opacity:1, x:0}} exit={{opacity:0}}>
                  <div className="border border-[#00ff41]/20 bg-black p-3 space-y-3">
                    <div className="text-[10px] text-[#00ff41]/70 border-b border-[#00ff41]/20 pb-1 mb-2 font-mono">
                      DECRYPTED CERTIFICATES
                    </div>
                    {[
                      { title: 'MASTER_HACKER', stat: 'Used 10+ Tools', unlocked: true },
                      { title: 'RUNTIME_OVERLORD', stat: '7x NO OVERTIME', unlocked: true },
                      { title: 'SIGNAL_AMPLIFIER', stat: '100+ LIKES/POST', unlocked: true },
                      { title: 'CRON_MASTER', stat: '100 POMODOROS', unlocked: false },
                    ].map((ach, idx) => (
                      <div key={idx} className={cn(
                        "flex items-center justify-between p-2 border-l-2",
                        ach.unlocked ? "border-[#00ff41] bg-[#00ff41]/5 text-[#00ff41]" : "border-gray-700 bg-gray-900 text-gray-600"
                      )}>
                        <div>
                          <div className={cn("text-[10px] font-bold tracking-widest", ach.unlocked ? "text-[#00ff41]" : "text-gray-500")}>
                            {ach.unlocked ? `[${ach.title}]` : '[ENCRYPTED_BLOCK]'}
                          </div>
                          <div className="text-[8px] opacity-70 mt-0.5">{ach.stat}</div>
                        </div>
                        <div className="text-xs">
                          {ach.unlocked ? <Target className="w-4 h-4 text-[#00ff41]" /> : <Lock className="w-4 h-4 text-gray-600" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* Footer CLI Logout */}
          <section className="pt-4 pb-8">
            <button 
              onClick={() => setActiveScreen('LOGOUT')}
              className="w-full relative group bg-[#0A0A0A] border text-left flex justify-between items-center overflow-hidden border-red-900/50 hover:border-red-500/80 transition-all p-3"
            >
              <div className="absolute inset-0 bg-red-500/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-300 pointer-events-none"></div>
              <span className="text-[11px] text-red-500 font-bold font-mono group-hover:text-red-400 z-10 transition-colors">
                <span className="text-gray-600 mr-2">$</span>
                sudo poweroff --terminate
              </span>
              <LogOut className="w-4 h-4 text-red-500 group-hover:text-red-400 z-10" />
            </button>
            
            <div className="text-center py-4 mt-6">
              <p className="text-[8px] font-mono text-[#00ff41]/30">
                F.W.E CORE_SYSTEM v2.0 <br/>
                ©2026 OPENCLAW_AGENT_MATRIX
              </p>
            </div>
          </section>

        </div>
      </div>
    </AppLayout>
  );
};

export default Profile;
