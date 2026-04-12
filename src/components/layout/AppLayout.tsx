import React from 'react';
import { ChevronLeft, Home as HomeIcon, LayoutDashboard, User, Briefcase } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { motion } from 'framer-motion';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import InitialBadge from '../common/InitialBadge';

const NAV_ITEMS = [
  { path: '/', label: '首页', icon: HomeIcon },
  { path: '/skills', label: '仓库', icon: LayoutDashboard },
  { path: '/workspace', label: '工作台', icon: Briefcase },
  { path: '/profile', label: '我的', icon: User },
];

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, title, showBack }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col bg-white text-brand-dark font-sans selection:bg-brand-dark/5 selection:text-brand-dark">
      <header className="sticky top-0 z-50 border-b border-brand-border/40 bg-white/92 backdrop-blur px-4">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4">
          <div className="flex min-w-0 flex-1 items-center gap-3">
          {showBack ? (
            <button 
              onClick={() => navigate(-1)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-brand-border/50 bg-white transition-colors hover:bg-brand-light-gray"
            >
              <ChevronLeft size={18} className="text-brand-dark" />
            </button>
          ) : (
            <Link to="/" className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-brand-border/50 bg-white transition-colors hover:bg-brand-light-gray">
              <HomeIcon size={20} className="text-brand-dark" />
            </Link>
          )}
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">{title || 'Finish Work Early'}</div>
              <div className="truncate text-[11px] text-brand-gray">light shell / local-first</div>
            </div>
          </div>

          <Link to="/profile" className="inline-flex items-center gap-2 rounded-md border border-brand-border/50 bg-white px-2 py-1.5 text-xs font-semibold text-brand-dark transition-colors hover:bg-brand-light-gray shrink-0">
            <InitialBadge label="我" className="h-7 w-7" />
            <span className="hidden sm:inline">我的</span>
          </Link>
        </div>
      </header>

      <main className="flex-grow pb-20">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          {children}
        </motion.div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-brand-border/40 bg-white/94 backdrop-blur safe-area-bottom">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-around px-2">
          {NAV_ITEMS.map((item) => {
            const isActive = item.path === '/' 
              ? location.pathname === '/' 
              : item.path.includes('?') 
                ? location.pathname + location.search === item.path
                : location.pathname === item.path && !location.search.includes('tab=self');
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex h-full flex-1 flex-col items-center justify-center gap-1 transition-colors px-1",
                  isActive ? "text-brand-dark" : "text-brand-gray hover:text-brand-dark"
                )}
              >
                <item.icon size={18} className={cn("transition-transform", isActive && "scale-110")} />
                <span className="text-[10px] font-bold tracking-tight whitespace-nowrap">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default AppLayout;
