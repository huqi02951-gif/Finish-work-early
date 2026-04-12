import React from 'react';
import { ChevronLeft, Home, Briefcase, User, TerminalSquare } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../../../lib/utils';
import InitialBadge from '../common/InitialBadge';

const NAV_ITEMS = [
  { path: '/workspace', label: '工作台', icon: Briefcase },
  { path: '/bbs', label: '社区', icon: TerminalSquare },
  { path: '/profile', label: '我的', icon: User },
];

interface CyberLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showBack?: boolean;
}

const CyberLayout: React.FC<CyberLayoutProps> = ({ children, title, subtitle, showBack }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#050505] text-[#00ff41] font-mono relative overflow-hidden">
      {/* CRT Scanline Overlay applied globally via layout */}
      <div className="fixed inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] opacity-30 z-0"></div>
      
      <header className="sticky top-0 z-50 border-b border-[#00ff41]/30 bg-black/95 backdrop-blur px-4">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {showBack ? (
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex h-9 w-9 items-center justify-center border border-[#00ff41]/30 bg-black text-[#00ff41] transition-colors hover:border-[#00ff41] hover:bg-[#00ff41]/10"
              >
                <ChevronLeft size={16} />
              </button>
            ) : (
              <Link
                to="/"
                className="inline-flex h-9 w-9 items-center justify-center border border-[#00ff41]/30 bg-black text-[#00ff41] transition-colors hover:border-[#00ff41] hover:bg-[#00ff41]/10"
              >
                <Home size={16} />
              </Link>
            )}

            <div className="min-w-0">
              <div className="truncate text-sm font-bold text-[#00ff41] shadow-[0_0_5px_rgba(0,255,65,0.5)]">[ {title} ]</div>
              {subtitle ? <div className="truncate text-[10px] text-[#00ff41]/60"> {'>'} {subtitle}</div> : null}
            </div>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-[#00ff41]/60">
            <span className="hidden sm:inline animate-pulse">encrypted-session_ACTIVE</span>
            <InitialBadge label="SYS" tone="cyber" className="h-8 w-8 !border-[#00ff41] !text-[#00ff41] !bg-black" />
          </div>
        </div>
      </header>

      <main className="pb-20 relative z-10">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#00ff41]/30 bg-black/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-around px-2">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex h-full w-full flex-col items-center justify-center gap-1 text-[10px] font-bold transition-all relative group',
                  isActive ? 'text-[#00ff41] bg-[#00ff41]/5' : 'text-[#00ff41]/40 hover:text-[#00ff41]/80 hover:bg-[#00ff41]/5',
                )}
              >
                {isActive && <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#00ff41] shadow-[0_0_8px_rgba(0,255,65,0.8)]"></div>}
                <item.icon size={18} className={isActive ? 'animate-pulse' : ''} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default CyberLayout;
