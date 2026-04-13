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
  hidden: { opacity: 0, scale: 0.95, y: 15 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
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
        Explicitly forced single viewport. 
        Using a flex spacer to push Hero strictly top, and Grid strictly bottom.
      */}
      <div className="flex flex-col h-[calc(100dvh-8.5rem)] bg-white px-5 sm:px-8 py-2 font-sans selection:bg-brand-dark/5 overflow-hidden">
        <div className="w-full h-full max-w-4xl mx-auto flex flex-col">
          
          {/* Top Hero Section - Anchored near top */}
          <motion.div
            initial={{ opacity: 0, filter: 'blur(8px)', y: 10 }}
            animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col shrink-0 mt-6 sm:mt-12"
          >
            <h1 className="text-[4rem] sm:text-[6rem] lg:text-[7rem] font-bold tracking-tighter text-brand-dark leading-none flex items-end">
              APEX<span className="text-brand-border animate-pulse ml-0.5 sm:ml-2 -mb-0.5 sm:-mb-2">_</span>
            </h1>
            
            <div className="mt-5 sm:mt-8 flex flex-col space-y-1.5 sm:space-y-4">
              <h2 className="text-[22px] sm:text-3xl font-semibold tracking-tight text-brand-dark/95 leading-tight">
                {pageConfig.hero.title}
              </h2>
              <p className="text-[13px] sm:text-base lg:text-lg text-brand-gray tracking-wide max-w-xl font-medium leading-relaxed">
                <span className="text-brand-border font-mono mr-1.5 sm:mr-2">/</span>
                {pageConfig.hero.subtitle.replace('//', '').trim()}
              </p>
            </div>
          </motion.div>

          {/* Flexible empty space acts as an unbreakable spring pushing everything to the edges */}
          <div className="flex-1 min-h-[1rem]" />

          {/* Bottom Interactive Section - Anchored to very bottom */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full shrink-0 flex flex-col pb-2 sm:pb-6" 
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 w-full">
              {pageConfig.scenarios.map((item) => {
                const Icon = SCENARIO_ICONS[item.id as keyof typeof SCENARIO_ICONS];
                return (
                  <motion.div key={item.id} variants={itemVariants} className="w-full">
                    <Link
                      to={item.path}
                      className="group flex flex-col items-start p-5 rounded-[24px] bg-[#fbfbfd] border border-brand-border/30 hover:border-brand-border/60 hover:bg-[#f5f5f7] transition-all duration-400 active:scale-[0.96] shadow-sm relative overflow-hidden h-full"
                    >
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-brand-dark shadow-[0_2px_10px_rgba(0,0,0,0.04)] group-hover:scale-105 transition-transform duration-300 mb-4 sm:mb-6 shrink-0 border border-brand-border/20">
                        <Icon size={18} strokeWidth={1.5} />
                      </div>
                      <div className="flex flex-col w-full">
                        <h3 className="text-[15px] sm:text-base font-semibold tracking-tight text-brand-dark leading-snug group-hover:text-brand-dark/80 transition-colors">
                          {item.title}
                        </h3>
                        {/* Always visible on iOS */}
                        <p className="text-[11px] sm:text-xs text-brand-gray/80 mt-1 lines-clamp-2 md:line-clamp-3 font-medium leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {/* Credit Footer - explicitly removed 'hidden' to be visible on phones globally */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 1 }}
              className="mt-6 flex flex-col items-center justify-center space-y-1.5 opacity-80"
            >
              <div className="text-[10px] sm:text-[11px] font-bold tracking-[0.15em] uppercase text-brand-dark flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-dark" />
                {pageConfig.footer.badgeText}
              </div>
              <div className="text-[9px] sm:text-[10px] font-semibold tracking-[0.08em] text-brand-gray/60 uppercase text-center w-full">
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
