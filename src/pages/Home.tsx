
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Zap, 
  Clock, 
  ChevronRight,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Users,
  ShieldCheck,
  Database,
  User
} from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

const Home: React.FC = () => {
  const scenarios = [
    { 
      id: 'customer', 
      title: '对客户', 
      desc: '营销话术、业务打法、产品测算', 
      icon: Users,
      color: 'text-apple-blue',
      bg: 'bg-apple-blue/5',
      path: '/scenarios?tab=customer'
    },
    { 
      id: 'review', 
      title: '对审查', 
      desc: '政策解读、准入核对、合规建议', 
      icon: ShieldCheck,
      color: 'text-apple-purple',
      bg: 'bg-apple-purple/5',
      path: '/scenarios?tab=review'
    },
    { 
      id: 'backoffice', 
      title: '对中后台', 
      desc: '流程指引、材料清单、系统操作', 
      icon: Database,
      color: 'text-apple-indigo',
      bg: 'bg-apple-indigo/5',
      path: '/scenarios?tab=backoffice'
    },
    { 
      id: 'self', 
      title: '对自己', 
      desc: '经验沉淀、效率工具、职场成长', 
      icon: User,
      color: 'text-apple-pink',
      bg: 'bg-apple-pink/5',
      path: '/scenarios?tab=self'
    },
  ];

  return (
    <AppLayout title="首页">
      <div className="h-[calc(100vh-8rem)] flex flex-col items-center justify-center relative overflow-hidden bg-white px-6">
        {/* Subtle Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full apple-event-gradient pointer-events-none opacity-30" />

        <div className="w-full max-w-2xl mx-auto relative z-10 flex flex-col items-center">
          {/* Header Section - ChatGPT Style */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-10"
          >
            <div className="inline-block px-3 py-1 rounded-full bg-brand-dark/5 text-[9px] font-bold tracking-[0.2em] uppercase mb-4 opacity-40">
              finish work early
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 apple-text-gradient leading-tight">
              今天想处理什么业务？
            </h2>
            <p className="text-sm sm:text-base text-brand-gray font-medium max-w-xs mx-auto leading-relaxed opacity-60">
              你的业务最强外挂，让专业信手拈来。
            </p>
          </motion.div>

          {/* Core Scenarios - Compact Grid */}
          <div className="grid grid-cols-2 gap-3 w-full">
            {scenarios.map((item, idx) => (
              <Link 
                key={item.id} 
                to={item.path}
                className="group apple-card p-4 sm:p-5 transition-all hover:shadow-xl active:scale-[0.98] flex flex-col gap-3 border-brand-border/10 bg-white/60 backdrop-blur-md"
              >
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm", item.bg, item.color)}>
                  <item.icon size={20} />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-brand-dark mb-1 tracking-tight">{item.title}</h3>
                  <p className="text-[10px] sm:text-[11px] text-brand-gray font-medium leading-tight opacity-60 line-clamp-2">{item.desc}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Footer Note - Minimalist */}
          <footer className="mt-12 text-center opacity-30">
            <p className="text-[9px] font-bold text-brand-gray uppercase tracking-[0.3em]">Designed by XD.HU, Phyllis Feng</p>
          </footer>
        </div>
      </div>
    </AppLayout>
  );
};

export default Home;
