import React, { useState } from 'react';
import { ChevronLeft, Home as HomeIcon, LayoutDashboard, User, Briefcase, LogOut } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { motion } from 'framer-motion';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import InitialBadge from '../common/InitialBadge';
import { getAuthSession, clearAuthSession } from '../../services/authService';
import { apiService } from '../../services/api';

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
  const [showUserMenu, setShowUserMenu] = useState(false);
  const authSession = getAuthSession();
  const isLoggedIn = authSession !== null && authSession.loginMethod !== 'demo';

  const handleLogout = async () => {
    try {
      await apiService.logout();
    } catch { /* ignore */ }
    clearAuthSession();
    setShowUserMenu(false);
    navigate('/', { replace: true });
  };

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

          <div className="relative shrink-0">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 rounded-md border border-brand-border/50 bg-white px-2 py-1.5 text-xs font-semibold text-brand-dark transition-colors hover:bg-brand-light-gray"
            >
              <InitialBadge label={authSession?.user?.nickname?.[0] || '我'} className="h-7 w-7" />
              <span className="hidden sm:inline truncate max-w-[100px]">
                {authSession?.user?.nickname || (isLoggedIn ? '已登录' : '未登录')}
              </span>
            </button>

            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-[60]" onClick={() => setShowUserMenu(false)} />
                <div className="absolute right-0 top-full mt-2 z-[70] w-56 rounded-2xl border border-brand-border/10 bg-white p-2 shadow-xl">
                  {isLoggedIn ? (
                    <>
                      <div className="px-3 py-2 border-b border-brand-border/10">
                        <p className="text-xs font-bold truncate">{authSession?.user?.nickname}</p>
                        {authSession?.user?.email && (
                          <p className="text-[10px] text-brand-gray truncate">{authSession.user.email}</p>
                        )}
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium hover:bg-brand-light-gray transition-colors"
                      >
                        <User size={14} /> 个人主页
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <LogOut size={14} /> 退出登录
                      </button>
                    </>
                  ) : (
                    <Link
                      to="/login"
                      onClick={() => setShowUserMenu(false)}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-brand-dark hover:bg-brand-light-gray transition-colors"
                    >
                      <User size={14} /> 登录 / 注册
                    </Link>
                  )}
                </div>
              </>
            )}
          </div>
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
