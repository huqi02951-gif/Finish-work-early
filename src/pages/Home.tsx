import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, ShieldCheck, Database, User, ArrowUpRight, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
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

const SCENARIO_ACCENT: Record<HomePageScenarioConfig['id'], string> = {
  customer:   'text-blue-600 bg-blue-50/70 border-blue-100',
  review:     'text-emerald-600 bg-emerald-50/70 border-emerald-100',
  backoffice: 'text-amber-600 bg-amber-50/70 border-amber-100',
  self:       'text-rose-600 bg-rose-50/70 border-rose-100',
};

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};

const item: Variants = {
  hidden:  { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};

const Home: React.FC = () => {
  const [pageConfig, setPageConfig] = useState(HOME_PAGE_DEFAULT_CONFIG);
  const [clock, setClock] = useState(() => new Date());

  useEffect(() => {
    let cancelled = false;
    getPageConfig('home_page')
      .then((config) => { if (!cancelled) setPageConfig(config); })
      .catch(() => { if (!cancelled) setPageConfig(HOME_PAGE_DEFAULT_CONFIG); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const hh = clock.getHours().toString().padStart(2, '0');
  const mm = clock.getMinutes().toString().padStart(2, '0');
  const ss = clock.getSeconds().toString().padStart(2, '0');
  const dateStr = `${clock.getFullYear()}.${(clock.getMonth() + 1).toString().padStart(2, '0')}.${clock.getDate().toString().padStart(2, '0')}`;
  const weekday = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][clock.getDay()];

  return (
    <AppLayout title="finish work early" theme="default">
      <div className="relative flex h-[calc(100dvh-3.5rem)] flex-col overflow-hidden bg-[#f7f6f2] font-sans text-[#171717]">
        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col px-5 py-6 sm:px-8 sm:py-10">

          {/* ─── Top meta row ─────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-500 sm:mb-10 sm:text-[11px]"
          >
            <div className="flex items-center gap-3">
              <span className="relative flex h-2 w-2 items-center justify-center">
                <span className="absolute h-2 w-2 rounded-full bg-emerald-400/20" />
                <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              <span className="normal-case tracking-[0.08em]">finish work early</span>
            </div>
            <div className="hidden items-center gap-4 tabular-nums sm:flex">
              <span>{dateStr}</span>
              <span className="text-neutral-300">·</span>
              <span>{weekday}</span>
              <span className="text-neutral-300">·</span>
              <span className="flex items-center gap-1.5">
                <Clock size={10} />
                {hh}:{mm}<span className="text-neutral-300">:{ss}</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5 tabular-nums sm:hidden">
              <Clock size={10} />
              {hh}:{mm}
            </div>
          </motion.div>

          {/* ─── Hero ─────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, filter: 'blur(8px)', y: 10 }}
            animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="flex shrink-0 flex-col"
          >
            <ApexWordmark />

            <div className="mt-7 max-w-2xl sm:mt-12">
              <h2 className="text-[22px] font-semibold leading-tight text-neutral-900 sm:text-[31px] md:text-[36px]">
                {pageConfig.hero.title}
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-500 sm:text-[15px]">
                {pageConfig.hero.subtitle}
              </p>
            </div>
          </motion.div>

          <div className="flex-1 min-h-4 sm:min-h-12" />

          {/* ─── Scenarios grid ──────────────────────────────────── */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="visible"
            className="w-full shrink-0 pt-6 sm:pt-14"
          >
            <div className="mb-4 flex items-baseline justify-between sm:mb-5">
              <p className="text-[11px] font-semibold tracking-[0.16em] text-neutral-500">
                选择你的工作场景
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4 sm:gap-4">
              {pageConfig.scenarios.map((s) => {
                const Icon = SCENARIO_ICONS[s.id as keyof typeof SCENARIO_ICONS];
                const accent = SCENARIO_ACCENT[s.id as keyof typeof SCENARIO_ACCENT];
                return (
                  <motion.div key={s.id} variants={item}>
                    <Link
                      to={s.path}
                      className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-neutral-200/80 bg-white/78 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-neutral-300 hover:bg-white active:scale-[0.99] sm:p-5"
                    >
                      <div className="relative z-10 mb-6 flex items-start justify-between sm:mb-8">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg border sm:h-11 sm:w-11 ${accent}`}>
                          <Icon size={18} strokeWidth={2} />
                        </div>
                        <ArrowUpRight size={16} className="text-neutral-300 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-neutral-900" />
                      </div>

                      <div className="relative z-10">
                        <h3 className="text-[14px] font-semibold leading-snug text-neutral-950 sm:text-lg">
                          {s.title}
                        </h3>
                        <p className="mt-1 line-clamp-1 text-[10px] font-medium leading-relaxed text-neutral-500 sm:line-clamp-2 sm:text-[12px]">
                          {s.desc}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* ─── Footer stamp ───────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-8 flex items-center justify-end border-t border-neutral-200/80 pt-5 text-[10px] font-medium tracking-[0.12em] text-neutral-400 sm:mt-10"
          >
            <span className="inline">{pageConfig.footer.creditText}</span>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
};

const ApexWordmark: React.FC = () => (
  <div className="relative">
    <h1
      aria-label="APEX"
      className="select-none text-[5.4rem] font-[780] leading-[0.78] text-neutral-950 sm:text-[8rem] md:text-[10.8rem] lg:text-[13.2rem]"
      style={{
        fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif',
        letterSpacing: 0,
        fontVariantLigatures: 'none',
      }}
    >
      APEX
    </h1>
    <div className="mt-3 h-px w-full max-w-[17rem] bg-gradient-to-r from-neutral-950 via-neutral-300 to-transparent sm:mt-5 sm:max-w-[24rem]" />
  </div>
);

export default Home;
