import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronRight, LayoutDashboard, Database, History, BookOpen, MessageSquare, Home as HomeIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  if (location.pathname === '/') return null;

  const breadcrumbMap: Record<string, string> = {
    'scenarios': '场景中心',
    'skills': 'Skills 工具库',
    'updates': '更新记录',
    'instructions': '使用说明',
    'feedback': '反馈/共创',
    'rate-offer': '利率优惠智能生成',
    'acceptance-calculator': '银承/存单测算小助手',
    'fee-discount': '中收优惠生成器'
  };

  return (
    <nav className="container mx-auto px-6 py-4 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-brand-gray animate-fade-in">
      <Link to="/" className="hover:text-brand-dark transition-colors flex items-center gap-1">
        <HomeIcon size={10} />
        首页
      </Link>
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const displayName = breadcrumbMap[name] || name;

        return (
          <React.Fragment key={name}>
            <ChevronRight size={10} className="text-brand-border" />
            {isLast ? (
              <span className="text-brand-dark">{displayName}</span>
            ) : (
              <Link to={routeTo} className="hover:text-brand-dark transition-colors">
                {displayName}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: '场景中心', path: '/scenarios', icon: LayoutDashboard },
    { name: 'Skills 工具库', path: '/skills', icon: Database },
    { name: '更新记录', path: '/updates', icon: History },
    { name: '使用说明', path: '/instructions', icon: BookOpen },
    { name: '反馈/共创', path: '/feedback', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-brand-offwhite selection:bg-brand-gold/20 selection:text-brand-dark">
      {/* Navigation */}
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b",
        isScrolled 
          ? "bg-white/80 backdrop-blur-xl border-brand-border/50 py-3 shadow-[0_1px_0_rgba(0,0,0,0.05)]" 
          : "bg-transparent border-transparent py-5"
      )}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-brand-dark rounded-xl flex items-center justify-center text-brand-gold font-serif font-bold text-xl shadow-2xl group-hover:scale-105 transition-all duration-500">
              A
            </div>
            <div className="hidden sm:block">
              <h1 className="font-serif font-bold text-lg tracking-tight text-brand-dark leading-none">客户经理 Agent + Skills</h1>
              <p className="text-[9px] text-brand-gold font-bold uppercase tracking-[0.25em] mt-1 opacity-80">超级超级强</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-10">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "text-[13px] font-medium transition-all duration-300 hover:text-brand-dark relative py-1",
                  location.pathname === item.path 
                    ? "text-brand-dark after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1px] after:bg-brand-dark" 
                    : "text-brand-gray"
                )}
              >
                {item.name}
              </Link>
            ))}
            <Link 
              to="/skills" 
              className="px-6 py-2 bg-brand-dark text-white rounded-full text-[13px] font-medium hover:bg-brand-dark/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
            >
              立即体验
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button className="lg:hidden p-2 text-brand-dark hover:bg-brand-light-gray rounded-full transition-colors" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Nav Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-brand-offwhite/95 backdrop-blur-2xl flex flex-col pt-24 px-8 lg:hidden animate-fade-in">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMenuOpen(false)}
              className={cn(
                "flex items-center justify-between py-5 border-b border-brand-border/30 text-xl font-serif tracking-tight",
                location.pathname === item.path ? "text-brand-dark" : "text-brand-gray"
              )}
            >
              <span className="flex items-center gap-4">
                <item.icon size={22} className="opacity-50" />
                {item.name}
              </span>
              <ChevronRight size={18} className="opacity-30" />
            </Link>
          ))}
          <Link 
            to="/skills" 
            onClick={() => setIsMenuOpen(false)}
            className="mt-12 w-full py-4 bg-brand-dark text-white rounded-2xl text-center font-medium shadow-2xl hover:bg-brand-dark/90 transition-all"
          >
            立即体验
          </Link>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow pt-24 pb-20">
        <Breadcrumbs />
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-brand-dark text-white py-6 border-t border-white/5 relative overflow-hidden font-mono">
        {/* Subtle Terminal Grid Background */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:15px_15px]"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Left: Terminal Brand */}
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-brand-gold rounded flex items-center justify-center text-brand-dark font-bold text-xs">
                &gt;_
              </div>
              <div className="flex flex-col">
                <h2 className="text-[10px] font-bold tracking-widest text-white/80 uppercase leading-none">客户经理 Agent + Skills</h2>
                <p className="text-[8px] text-brand-gold font-bold uppercase tracking-[0.2em] mt-1 opacity-60">超级超级强 / System.Ready</p>
              </div>
            </div>

            {/* Center: The Message */}
            <div className="text-center md:text-left">
              <p className="text-[11px] text-white/70 leading-relaxed font-medium">
                每个客户经理都有自己的超级助手，我们也都是超级厉害的人。
                <span className="ml-3 text-white/30 italic">“我想早点儿下班。”</span>
              </p>
            </div>

            {/* Right: Status */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest">Live Status</span>
              </div>
              <div className="h-3 w-px bg-white/10"></div>
              <Link to="/feedback" className="text-[8px] font-bold text-white/30 hover:text-brand-gold transition-colors uppercase tracking-widest">Feedback</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
