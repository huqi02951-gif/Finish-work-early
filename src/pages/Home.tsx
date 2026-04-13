import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, ShieldCheck, Database, User } from 'lucide-react';
import { motion } from 'framer-motion';
import AppLayout from '../components/layout/AppLayout';
import { HOME_PAGE_DEFAULT_CONFIG } from '../../content/pageConfigDefaults';
import { getPageConfig } from '../services/contentApi';
import type { HomePageScenarioConfig } from '../../types';

const SCENARIO_ICONS = {
  customer: Users,
  review: ShieldCheck,
  backoffice: Database,
  self: User,
} satisfies Record<HomePageScenarioConfig['id'], typeof Users>;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

const Home: React.FC = () => {
  const [pageConfig, setPageConfig] = useState(HOME_PAGE_DEFAULT_CONFIG);

  useEffect(() => {
    let cancelled = false;

    getPageConfig('home_page')
      .then((config) => {
        if (!cancelled) {
          setPageConfig(config);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPageConfig(HOME_PAGE_DEFAULT_CONFIG);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AppLayout title="APEX / 首页" theme="default">
      {/* 
        Container constrained to exact remaining height (100dvh - 3.5rem header - ~5rem footer padding).
        Uses overflow-hidden to guarantee a locked, app-like single screen on mobile.
      */}
      <div className="flex flex-col h-[calc(100dvh-8.5rem)] bg-white px-4 sm:px-8 py-4 sm:py-8 font-sans selection:bg-brand-dark/5 overflow-hidden">
        <div className="w-full h-full max-w-4xl mx-auto flex flex-col justify-between">
          
          {/* Top Hero Section */}
          <motion.div
            initial={{ opacity: 0, filter: 'blur(8px)', y: 10 }}
            animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col shrink-0 mt-2 sm:mt-10"
          >
            <h1 className="text-[3.5rem] sm:text-[6rem] lg:text-[7rem] font-bold tracking-tighter text-brand-dark leading-none flex items-end">
              APEX<span className="text-brand-border animate-pulse ml-0.5 sm:ml-2 -mb-0.5 sm:-mb-2">_</span>
            </h1>
            
            <div className="mt-4 sm:mt-8 flex flex-col space-y-1.5 sm:space-y-4">
              <h2 className="text-xl sm:text-3xl font-semibold tracking-tight text-brand-dark/95 leading-tight">
                {pageConfig.hero.title}
              </h2>
              <p className="text-xs sm:text-base lg:text-lg text-brand-gray tracking-wide max-w-xl font-medium leading-relaxed">
                <span className="text-brand-border font-mono mr-1.5 sm:mr-2">/</span>
                {pageConfig.hero.subtitle.replace('//', '').trim()}
              </p>
            </div>
          </motion.div>

          {/* Bottom Grid Section */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full flex flex-col justify-end min-h-0 mt-4" 
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 w-full h-[32vh] sm:h-auto min-h-[200px]">
              {pageConfig.scenarios.map((item) => {
                const Icon = SCENARIO_ICONS[item.id as keyof typeof SCENARIO_ICONS];
                return (
                  <motion.div key={item.id} variants={itemVariants} className="w-full h-full">
                    <Link
                      to={item.path}
                      className="group flex flex-col justify-between items-start p-4 sm:p-5 rounded-[20px] sm:rounded-[24px] bg-brand-light-gray/60 hover:bg-brand-light-gray border border-transparent hover:border-brand-border/30 transition-all duration-300 active:scale-[0.97] h-full"
                    >
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white flex items-center justify-center text-brand-dark shadow-[0_2px_8px_rgba(0,0,0,0.04)] group-hover:scale-105 transition-transform duration-300 shrink-0">
                        <Icon size={16} strokeWidth={2} />
                      </div>
                      <div className="flex flex-col mt-auto w-full pt-4">
                        <h3 className="text-sm sm:text-base font-semibold tracking-tight text-brand-dark leading-tight group-hover:text-brand-dark/80 transition-colors line-clamp-1">
                          {item.title}
                        </h3>
                        {/* Hidden on very small heights to protect single-screen layout, visible otherwise */}
                        <p className="text-[10px] sm:text-xs text-brand-gray/80 mt-1 line-clamp-2 md:line-clamp-3 font-medium leading-snug hidden sm:block overflow-hidden">
                          {item.desc}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="mt-4 sm:mt-6 flex items-center justify-between opacity-70"
            >
              <div className="text-[9px] sm:text-[10px] font-bold tracking-[0.15em] uppercase text-brand-gray flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-dark" />
                {pageConfig.footer.badgeText}
              </div>
              <div className="text-[9px] sm:text-[10px] font-medium tracking-[0.1em] text-brand-gray/40 uppercase hidden sm:block">
                {pageConfig.footer.creditText}
              </div>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </AppLayout>
  );
};

export default Home;
