
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
      desc: '营销话术、业务打法、产品测算。', 
      icon: Users,
      color: 'text-apple-blue',
      bg: 'bg-apple-blue/5',
      path: '/scenarios?tab=customer'
    },
    { 
      id: 'review', 
      title: '对审查', 
      desc: '政策解读、准入核对、合规建议。', 
      icon: ShieldCheck,
      color: 'text-apple-purple',
      bg: 'bg-apple-purple/5',
      path: '/scenarios?tab=review'
    },
    { 
      id: 'backoffice', 
      title: '对中后台', 
      desc: '流程指引、材料清单、系统操作。', 
      icon: Database,
      color: 'text-apple-indigo',
      bg: 'bg-apple-indigo/5',
      path: '/scenarios?tab=backoffice'
    },
    { 
      id: 'self', 
      title: '对自己', 
      desc: '经验沉淀、效率工具、职场成长。', 
      icon: User,
      color: 'text-apple-pink',
      bg: 'bg-apple-pink/5',
      path: '/scenarios?tab=self'
    },
  ];

  return (
    <AppLayout title="首页">
      <div className="pb-24 relative overflow-hidden bg-white">
        {/* Subtle Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[400px] apple-event-gradient pointer-events-none opacity-40" />

        {/* Header Section - Minimalist */}
        <section className="px-8 pt-16 pb-12 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-block px-3 py-1 rounded-full bg-brand-dark/5 text-[10px] font-bold tracking-[0.3em] uppercase mb-6 opacity-40">
              finish work early
            </div>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 apple-text-gradient leading-tight">
              客户经理agent+skills<br />很强很强！
            </h2>
            <p className="text-lg text-brand-gray font-medium max-w-xs mx-auto leading-relaxed opacity-80">
              你的业务最强外挂，<br />让专业信手拈来。
            </p>
          </motion.div>
        </section>

        {/* Core Scenarios - 2x2 Grid */}
        <section className="px-6 grid grid-cols-2 gap-4 relative z-10 mb-16">
          {scenarios.map((item, idx) => (
            <Link 
              key={item.id} 
              to={item.path}
              className="group apple-card p-6 transition-all hover:shadow-2xl active:scale-[0.95] flex flex-col justify-between min-h-[200px] border-brand-border/5 bg-white/50 backdrop-blur-md"
            >
              <div>
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 shadow-sm", item.bg, item.color)}>
                  <item.icon size={28} />
                </div>
                <h3 className="text-2xl font-bold text-brand-dark mb-2 tracking-tight">{item.title}</h3>
                <p className="text-[12px] text-brand-gray font-medium leading-relaxed opacity-70">{item.desc}</p>
              </div>
              <div className="flex items-center gap-1 text-[13px] font-bold text-apple-blue mt-6">
                进入场景 <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </section>

        {/* Footer Note */}
        <footer className="px-8 py-12 text-center border-t border-brand-border/10">
          <p className="text-[10px] font-bold text-brand-gray uppercase tracking-[0.4em] mb-2">Designed by XD.HU, Pyllis Feng</p>
          <p className="text-[9px] text-brand-gray/40 font-medium">© 2026 客户经理agent+skills很强很强！</p>
        </footer>
      </div>
    </AppLayout>
  );
};

export default Home;
