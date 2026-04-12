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
    <div className="min-h-screen bg-[#06100c] text-[#d7ffe3] font-mono">
      <header className="sticky top-0 z-50 border-b border-[#183425] bg-[#07110d]/90 backdrop-blur px-4">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {showBack ? (
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#21432f] bg-[#0b1711] text-[#8cffb0] transition-colors hover:border-[#2d6541]"
              >
                <ChevronLeft size={16} />
              </button>
            ) : (
              <Link
                to="/"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#21432f] bg-[#0b1711] text-[#8cffb0] transition-colors hover:border-[#2d6541]"
              >
                <Home size={16} />
              </Link>
            )}

            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-[#e9fff0]">{title}</div>
              {subtitle ? <div className="truncate text-[10px] text-[#70a17f]">{subtitle}</div> : null}
            </div>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-[#70a17f]">
            <span className="hidden sm:inline">encrypted-session</span>
            <InitialBadge label="node" tone="cyber" className="h-8 w-8" />
          </div>
        </div>
      </header>

      <main className="pb-20">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#183425] bg-[#07110d]/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-around px-2">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex h-full w-full flex-col items-center justify-center gap-1 text-[10px] font-semibold transition-colors',
                  isActive ? 'text-[#8cffb0]' : 'text-[#70a17f] hover:text-[#b4f7c8]',
                )}
              >
                <item.icon size={16} />
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
