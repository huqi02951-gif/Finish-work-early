
import React from 'react';
import { ChevronLeft, Home as HomeIcon, Search } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, title, showBack }) => {
  const navigate = useNavigate();

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
            {title || '客户经理 Agent + Skills 很强很强！'}
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-brand-light-gray rounded-full transition-all active:scale-90">
            <Search size={20} className="text-brand-gray" />
          </button>
          <div className="w-8 h-8 rounded-full bg-brand-light-gray border border-brand-border/10 overflow-hidden">
            <img 
              src="https://picsum.photos/seed/user/100/100" 
              alt="Avatar" 
              className="w-full h-full object-cover grayscale"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          {children}
        </motion.div>
      </main>

      {/* Footer / Safe Area */}
      <footer className="h-12 safe-area-bottom opacity-0 pointer-events-none" />
    </div>
  );
};

export default AppLayout;
