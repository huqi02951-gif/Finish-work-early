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
      <footer className="bg-brand-dark text-white pt-32 pb-20 border-t border-white/5 relative overflow-hidden">
        {/* Decorative Background Element */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-gold/5 rounded-full blur-[120px] -mr-64 -mt-64 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-brand-gold/5 rounded-full blur-[100px] -ml-32 -mb-32 pointer-events-none"></div>

        <div className="container mx-auto px-6 relative z-10">
          {/* Manifesto Section */}
          <div className="max-w-4xl mb-32 animate-fade-in">
            <h2 className="text-[11px] font-bold text-brand-gold uppercase tracking-[0.4em] mb-10 opacity-80">
              Original Intention / 最初衷
            </h2>
            <div className="space-y-8">
              <p className="font-serif text-4xl md:text-6xl leading-[1.1] tracking-tight text-white">
                让每一位客户经理，<br />
                都拥有属于自己的<span className="text-brand-gold italic">超级大脑</span>。
              </p>
              <p className="text-xl md:text-2xl text-white/40 leading-relaxed max-w-2xl font-medium">
                将实战经验沉淀为可复用的数字技能，<br />
                让专业不再是少数人的专利，而是每一次交互的标配。
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-32">
            <div className="md:col-span-5">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-10 h-10 bg-brand-gold rounded-xl flex items-center justify-center text-brand-dark font-serif font-bold text-2xl shadow-2xl">A</div>
                <div className="h-px w-12 bg-white/10"></div>
                <h2 className="font-serif font-bold text-xl text-white tracking-tight">Agent + Skills</h2>
              </div>
              <p className="max-w-xs text-sm leading-relaxed mb-10 text-white/40 font-medium">
                基于真实业务场景构建的智能作业平台。<br />
                为卓越而生，为效能而战。
              </p>
              <div className="flex gap-6">
                <div className="group cursor-pointer">
                  <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 group-hover:bg-brand-gold group-hover:text-brand-dark transition-all duration-500">
                    <MessageSquare size={18} />
                  </div>
                </div>
                <div className="group cursor-pointer">
                  <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 group-hover:bg-brand-gold group-hover:text-brand-dark transition-all duration-500">
                    <BookOpen size={18} />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="md:col-span-2">
              <h3 className="text-white font-serif font-bold mb-8 tracking-tight text-lg">探索</h3>
              <ul className="space-y-5 text-[13px] font-medium text-white/40">
                <li><Link to="/scenarios" className="hover:text-brand-gold transition-colors">场景中心</Link></li>
                <li><Link to="/skills" className="hover:text-brand-gold transition-colors">Skills 工具库</Link></li>
                <li><Link to="/updates" className="hover:text-brand-gold transition-colors">更新记录</Link></li>
              </ul>
            </div>
            
            <div className="md:col-span-2">
              <h3 className="text-white font-serif font-bold mb-8 tracking-tight text-lg">支持</h3>
              <ul className="space-y-5 text-[13px] font-medium text-white/40">
                <li><Link to="/instructions" className="hover:text-brand-gold transition-colors">使用说明</Link></li>
                <li><Link to="/feedback" className="hover:text-brand-gold transition-colors">反馈/共创</Link></li>
              </ul>
            </div>

            <div className="md:col-span-3">
              <h3 className="text-white font-serif font-bold mb-8 tracking-tight text-lg">系统状态</h3>
              <div className="p-6 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)] animate-pulse"></div>
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white">All Systems Operational</span>
                </div>
                <div className="space-y-2">
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="w-full h-full bg-emerald-500/40"></div>
                  </div>
                  <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest">
                    Uptime: 99.99%
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-bold uppercase tracking-[0.3em] text-white/20">
            <p>© 2024 客户经理 Agent 项目组. Crafted with Precision.</p>
            <div className="flex gap-10">
              <span className="hover:text-brand-gold transition-colors cursor-pointer">Privacy</span>
              <span className="hover:text-brand-gold transition-colors cursor-pointer">Terms</span>
              <span className="hover:text-brand-gold transition-colors cursor-pointer">Security</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
