import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, ShieldCheck, Database, User, ArrowRight, ChevronRight } from 'lucide-react';
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
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
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
    <AppLayout title="首页">
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-6rem)] relative overflow-hidden bg-white px-4 py-8 sm:py-12">
        <div className="w-full max-w-3xl mx-auto flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-8 sm:mb-14"
          >
            <h1 className="text-2xl sm:text-[2.75rem] font-medium tracking-tight mb-3 text-brand-dark leading-tight">
              {pageConfig.hero.title}
            </h1>
            <p className="text-sm sm:text-lg text-brand-gray/80 font-normal max-w-md mx-auto leading-relaxed">
              {pageConfig.hero.subtitle}
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 gap-3 sm:gap-4 w-full"
          >
            {pageConfig.scenarios.map((item) => {
              const Icon = SCENARIO_ICONS[item.id];

              return (
                <motion.div key={item.id} variants={itemVariants}>
                  <Link
                    to={item.path}
                    className="group flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 p-5 sm:p-6 rounded-2xl border border-brand-border/40 bg-white hover:bg-brand-offwhite hover:border-brand-border/80 transition-all duration-300 active:scale-[0.98] shadow-sm hover:shadow-md"
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-brand-border/60 flex items-center justify-center bg-brand-light-gray group-hover:bg-white group-hover:scale-110 transition-transform duration-300 shrink-0">
                      <Icon size={20} className="text-brand-dark opacity-80" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                        <h3 className="text-sm sm:text-base font-bold text-brand-dark tracking-tight truncate">
                          {item.title}
                        </h3>
                        <ArrowRight
                          size={14}
                          className="text-brand-gray opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300 hidden sm:block"
                        />
                      </div>
                      <p className="text-[10px] sm:text-sm text-brand-gray leading-tight sm:leading-relaxed opacity-80 line-clamp-1 sm:line-clamp-2">
                        {item.desc}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="mt-10 sm:mt-16 text-center space-y-3 sm:space-y-4"
          >
            <div className="inline-block px-4 py-1.5 rounded-full bg-brand-offwhite border border-brand-border/30 text-[10px] font-medium tracking-[0.2em] uppercase text-brand-gray/60">
              {pageConfig.footer.badgeText}
            </div>
            <div className="text-[9px] font-medium tracking-[0.1em] text-brand-gray/40 uppercase">
              {pageConfig.footer.creditText}
            </div>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Home;
