import React, { useState } from 'react';
import { ChevronLeft, Home as HomeIcon, LayoutDashboard, User, Briefcase, LogOut, TerminalSquare } from 'lucide-react';
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
  { path: '/bbs', label: '社区', icon: TerminalSquare },
  { path: '/profile', label: '我的', icon: User },
];

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
  theme?: 'default' | 'cli';
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, title, showBack, theme = 'default' }) => {
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

  const isCli = theme === 'cli';

  return (
    <div className={cn(
      "flex min-h-screen flex-col font-sans",
      isCli ? "bg-black text-green-500 font-mono selection:bg-green-500/30 selection:text-green-200" : "bg-white text-brand-dark selection:bg-brand-dark/5 selection:text-brand-dark"
    )}>
      <header className={cn(
        "sticky top-0 z-50 border-b px-4 backdrop-blur",
        isCli ? "border-green-500/30 bg-black/90" : "border-brand-border/40 bg-white/92"
      )}>
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4">
          <div className="flex min-w-0 flex-1 items-center gap-3">
          {showBack ? (
            <button 
              onClick={() => navigate(-1)}
              className={cn(
                "inline-flex h-9 w-9 items-center justify-center rounded-md border transition-colors",
                isCli ? "border-green-500/30 bg-black hover:bg-green-900/20" : "border-brand-border/50 bg-white hover:bg-brand-light-gray"
              )}
            >
              <ChevronLeft size={18} className={isCli ? "text-green-500" : "text-brand-dark"} />
            </button>
          ) : (
            <Link to="/" className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-md border transition-colors",
              isCli ? "border-green-500/30 bg-black hover:bg-green-900/20" : "border-brand-border/50 bg-white hover:bg-brand-light-gray"
            )}>
              <HomeIcon size={20} className={isCli ? "text-green-500" : "text-brand-dark"} />
            </Link>
          )}
            <div className="min-w-0">
              <div className="truncate text-[15px] font-bold tracking-tight">{title || 'APEX'}</div>
              <div className={cn("truncate text-[12px] font-medium", isCli ? "text-green-500/60" : "text-brand-gray")}>
                APEX
              </div>
            </div>
          </div>

          <div className="relative shrink-0">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className={cn(
                "flex items-center gap-2 rounded-md border px-2 py-1.5 text-xs font-semibold transition-colors",
                isCli ? "border-green-500/30 bg-black text-green-500 hover:bg-green-900/20" : "border-brand-border/50 bg-white text-brand-dark hover:bg-brand-light-gray"
              )}
            >
              <InitialBadge label={authSession?.user?.nickname?.[0] || '我'} className="h-7 w-7" />
              <span className="hidden sm:inline truncate max-w-[100px]">
                {authSession?.user?.nickname || (isLoggedIn ? '已登录' : '未登录')}
              </span>
            </button>

            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-[60]" onClick={() => setShowUserMenu(false)} />
                <div className={cn(
                  "absolute right-0 top-full mt-2 z-[70] w-56 rounded-2xl border p-2 shadow-xl",
                  isCli ? "border-green-500/30 bg-black shadow-green-900/20" : "border-brand-border/10 bg-white"
                )}>
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
                      className={cn(
                        "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition-colors",
                        isCli ? "text-green-500 hover:bg-green-900/20" : "text-brand-dark hover:bg-brand-light-gray"
                      )}
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

      <nav className={cn(
        "fixed bottom-0 left-0 right-0 z-50 border-t backdrop-blur safe-area-bottom",
        isCli ? "border-green-500/30 bg-black/90" : "border-brand-border/40 bg-white/94"
      )}>
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
                  isCli 
                    ? (isActive ? "text-green-400 font-bold drop-shadow-[0_0_5px_rgba(74,222,128,0.5)]" : "text-green-700 hover:text-green-500")
                    : (isActive ? "text-brand-dark" : "text-brand-gray hover:text-brand-dark")
                )}
              >
                <item.icon size={20} className={cn("transition-transform", isActive && "scale-110")} />
                <span className="text-[11px] font-bold tracking-tight whitespace-nowrap">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default AppLayout;
