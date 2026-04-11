
import React from 'react';
import { ChevronLeft, Home as HomeIcon, LayoutDashboard, MessageSquare, User, Briefcase } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { motion } from 'framer-motion';
import { useNavigate, Link, useLocation } from 'react-router-dom';

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
    <div className="flex flex-col min-h-screen bg-white text-brand-dark font-sans selection:bg-apple-blue/10 selection:text-apple-blue">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-brand-border/10 px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {showBack ? (
            <button 
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 hover:bg-brand-light-gray rounded-full transition-all active:scale-90"
            >
              <ChevronLeft size={24} className="text-apple-blue" />
            </button>
          ) : (
            <Link to="/" className="p-2 -ml-2 hover:bg-brand-light-gray rounded-full transition-all active:scale-90">
              <HomeIcon size={20} className="text-brand-dark" />
            </Link>
          )}
          <h1 className="text-[17px] font-bold tracking-tight line-clamp-1">
            {title || '客户经理agent+skills很强很强！'}
          </h1>
        </div>
        
        <Link to="/profile" className="w-8 h-8 rounded-full bg-brand-light-gray border border-brand-border/10 overflow-hidden">
          <img
            src="https://picsum.photos/seed/user/100/100"
            alt="Avatar"
            className="w-full h-full object-cover grayscale"
            referrerPolicy="no-referrer"
          />
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow pb-20">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          {children}
        </motion.div>
      </main>

      {/* Fixed Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-2xl border-t border-brand-border/10 safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-2">
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
                  "flex flex-col items-center justify-center gap-1 w-full h-full transition-all active:scale-90",
                  isActive ? "text-apple-blue" : "text-brand-gray hover:text-brand-dark"
                )}
              >
                <item.icon size={22} className={cn("transition-transform", isActive && "scale-110")} />
                <span className="text-[10px] font-bold tracking-tight">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default AppLayout;
