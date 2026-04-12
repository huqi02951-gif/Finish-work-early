import React from 'react';
import { Link } from 'react-router-dom';
import { Users, ShieldCheck, Database, User, ArrowRight } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

const scenarios = [
  { 
    id: 'customer', 
    title: '对客户', 
    desc: '营销话术、业务打法、产品测算', 
    icon: Users,
    path: '/scenarios?tab=customer'
  },
  { 
    id: 'review', 
    title: '对审查', 
    desc: '政策解读、准入核对、合规建议', 
    icon: ShieldCheck,
    path: '/scenarios?tab=review'
  },
  { 
    id: 'backoffice', 
    title: '对中后台', 
    desc: '流程指引、材料清单、系统操作', 
    icon: Database,
    path: '/scenarios?tab=backoffice'
  },
  { 
    id: 'self', 
    title: '对自己', 
    desc: '经验沉淀、效率工具、职场成长', 
    icon: User,
    path: '/scenarios?tab=self'
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
  }
};

const Home: React.FC = () => {
  return (
    <AppLayout title="首页">
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-6rem)] relative overflow-hidden bg-white px-4 py-8 sm:py-12">
        <div className="w-full max-w-3xl mx-auto flex flex-col items-center">
          
          {/* Header Section - ChatGPT Style */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-8 sm:mb-14"
          >
            <h1 className="text-2xl sm:text-[2.75rem] font-medium tracking-tight mb-3 text-brand-dark leading-tight">
              今天想处理什么业务？
            </h1>
            <p className="text-sm sm:text-lg text-brand-gray/80 font-normal max-w-md mx-auto leading-relaxed">
              让工具拳拳到肉，让专业能力信手拈来。
            </p>
          </motion.div>

          {/* 4 Modules Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 gap-3 sm:gap-4 w-full"
          >
            {scenarios.map((item) => (
              <motion.div key={item.id} variants={itemVariants}>
                <Link 
                  to={item.path}
                  className="group flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 p-5 sm:p-6 rounded-2xl border border-brand-border/40 bg-white hover:bg-brand-offwhite hover:border-brand-border/80 transition-all duration-300 active:scale-[0.98] shadow-sm hover:shadow-md"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-brand-border/60 flex items-center justify-center bg-brand-light-gray group-hover:bg-white group-hover:scale-110 transition-transform duration-300 shrink-0">
                    <item.icon size={20} className="text-brand-dark opacity-80" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                      <h3 className="text-sm sm:text-base font-bold text-brand-dark tracking-tight truncate">
                        {item.title}
                      </h3>
                      <ArrowRight size={14} className="text-brand-gray opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300 hidden sm:block" />
                    </div>
                    <p className="text-[10px] sm:text-sm text-brand-gray leading-tight sm:leading-relaxed opacity-80 line-clamp-1 sm:line-clamp-2">
                      {item.desc}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.variants>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="mt-10 sm:mt-16 text-center space-y-3 sm:space-y-4"
          >
            <div className="inline-block px-4 py-1.5 rounded-full bg-brand-offwhite border border-brand-border/30 text-[10px] font-medium tracking-[0.2em] uppercase text-brand-gray/60">
              Finish Work Early
            </div>
            <div className="text-[9px] font-medium tracking-[0.1em] text-brand-gray/40 uppercase">
              Designed by XD.HU & PHYLLIS FENG
            </div>
          </motion.div>

        </div>
      </div>
    </AppLayout>
  );
};

export default Home;
