import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, ShieldCheck, Database, User, ArrowUpRight, Clock } from 'lucide-react';
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

const SCENARIO_ACCENT: Record<HomePageScenarioConfig['id'], string> = {
  customer:   'from-blue-500/10 to-blue-500/0 text-blue-600',
  review:     'from-emerald-500/10 to-emerald-500/0 text-emerald-600',
  backoffice: 'from-amber-500/10 to-amber-500/0 text-amber-600',
  self:       'from-rose-500/10 to-rose-500/0 text-rose-600',
};

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};

const item = {
  hidden:  { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
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
    <AppLayout title="APEX / 首页" theme="default">
      <div className="relative flex flex-col min-h-[calc(100dvh-8rem)] bg-[#FBFBFC] font-sans overflow-hidden">
        {/* Background grid accent */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: 'linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        <div className="relative z-10 w-full max-w-6xl mx-auto px-5 sm:px-8 py-6 sm:py-10 flex flex-col flex-1">

          {/* ─── Top meta row ─────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold tracking-[0.18em] uppercase text-brand-gray/70 mb-8 sm:mb-12"
          >
            <div className="flex items-center gap-3">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              <span>System · Online</span>
            </div>
            <div className="hidden sm:flex items-center gap-4 tabular-nums">
              <span>{dateStr}</span>
              <span className="text-brand-gray/30">·</span>
              <span>{weekday}</span>
              <span className="text-brand-gray/30">·</span>
              <span className="flex items-center gap-1.5">
                <Clock size={10} />
                {hh}:{mm}<span className="text-brand-gray/30">:{ss}</span>
              </span>
            </div>
            <div className="sm:hidden flex items-center gap-1.5 tabular-nums">
              <Clock size={10} />
              {hh}:{mm}
            </div>
          </motion.div>

          {/* ─── Hero ─────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, filter: 'blur(8px)', y: 10 }}
            animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col shrink-0"
          >
            <h1 className="text-[4rem] sm:text-[6rem] md:text-[8rem] lg:text-[9.5rem] font-black tracking-[-0.04em] text-brand-dark leading-[0.88] flex items-end">
              APEX<span className="text-brand-border animate-pulse ml-0.5 sm:ml-2 -mb-0.5 sm:-mb-2">_</span>
            </h1>

            <p className="mt-3 sm:mt-5 text-[13px] sm:text-[17px] md:text-[19px] font-mono font-medium tracking-[0.08em] text-brand-gray flex items-center gap-2 sm:gap-3">
              <span className="inline-block w-8 sm:w-14 h-px bg-brand-dark/70" />
              <span className="text-brand-dark/80 uppercase">Finish Work Early</span>
            </p>

            <div className="mt-8 sm:mt-12 max-w-2xl">
              <h2 className="text-[22px] sm:text-[32px] md:text-[38px] font-extrabold tracking-tight text-neutral-900 leading-tight">
                {pageConfig.hero.title}
              </h2>
              <p className="mt-3 sm:mt-4 text-[13px] sm:text-base text-brand-gray font-medium leading-relaxed">
                <span className="text-brand-border font-mono mr-1.5">//</span>
                {pageConfig.hero.subtitle.replace('//', '').trim()}
              </p>
            </div>
          </motion.div>

          <div className="flex-1 min-h-8 sm:min-h-12" />

          {/* ─── Scenarios grid ──────────────────────────────────── */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="visible"
            className="w-full shrink-0 pt-10 sm:pt-14"
          >
            <div className="flex items-baseline justify-between mb-4 sm:mb-5">
              <p className="text-[10px] sm:text-[11px] font-extrabold tracking-[0.2em] uppercase text-brand-dark">
                Scenario Entry
              </p>
              <p className="text-[10px] sm:text-[11px] font-medium tracking-wide text-brand-gray/70">
                四个打工战线 · 选一个开工
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
              {pageConfig.scenarios.map((s) => {
                const Icon = SCENARIO_ICONS[s.id as keyof typeof SCENARIO_ICONS];
                const accent = SCENARIO_ACCENT[s.id as keyof typeof SCENARIO_ACCENT];
                return (
                  <motion.div key={s.id} variants={item}>
                    <Link
                      to={s.path}
                      className="group relative flex flex-col h-full p-4 sm:p-5 rounded-2xl bg-white border border-brand-border/30 hover:border-brand-dark/60 hover:shadow-lg transition-all duration-300 active:scale-[0.98] overflow-hidden"
                    >
                      {/* accent glow */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-40 group-hover:opacity-100 transition-opacity pointer-events-none`} />

                      <div className="relative z-10 flex items-start justify-between mb-6 sm:mb-8">
                        <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white border border-brand-border/30 flex items-center justify-center shadow-sm ${accent.split(' ').pop()}`}>
                          <Icon size={18} strokeWidth={2} />
                        </div>
                        <ArrowUpRight size={16} className="text-brand-gray/40 group-hover:text-brand-dark group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
                      </div>

                      <div className="relative z-10">
                        <h3 className="text-[15px] sm:text-lg font-black tracking-tight text-brand-dark leading-snug">
                          {s.title}
                        </h3>
                        <p className="mt-1 text-[11px] sm:text-[12px] text-brand-gray font-medium line-clamp-2 leading-relaxed">
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
            className="mt-8 sm:mt-10 pt-5 border-t border-brand-border/30 flex items-center justify-between text-[10px] font-mono tracking-wider text-brand-gray/50"
          >
            <span>{pageConfig.footer.badgeText} · v2.0</span>
            <span className="hidden sm:inline">{pageConfig.footer.creditText}</span>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Home;
