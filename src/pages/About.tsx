import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowUpRight, MessageSquare, Lightbulb, Rocket,
  Sparkles, Heart, Clock,
} from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import { earnLossStore } from '../../lib/earnLossStore';
import { getPetStateSnapshot, initializePetOsSession } from '../../lib/petOs';

const About: React.FC = () => {
  const [savedOtMin, setSavedOtMin] = useState(0);
  const [petDays, setPetDays] = useState(0);
  const [petAlive, setPetAlive] = useState(false);
  const ideaCount = 0; // 本地占位,后续接 saveLocalPost 统计

  useEffect(() => {
    const summary = earnLossStore.getTodaySummary();
    setSavedOtMin(summary.touchFishMin + summary.paidPoopMin);

    void (async () => {
      try {
        const [{ identity }] = await Promise.all([
          initializePetOsSession(),
          getPetStateSnapshot(),
        ]);
        if (identity?.enabledAt) {
          setPetAlive(true);
          const days = Math.max(1, Math.floor((Date.now() - identity.enabledAt) / 86400_000));
          setPetDays(days);
        }
      } catch { /* ignore */ }
    })();

    const unsub = earnLossStore.subscribe((s) => {
      setSavedOtMin(s.touchFishMin + s.paidPoopMin);
    });
    return unsub;
  }, []);

  return (
    <AppLayout title="关于 APEX" showBack>
      <div className="relative min-h-[calc(100dvh-8rem)] overflow-hidden bg-[#fbfbfd] pb-16">
        {/* Aurora */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-gradient-to-b from-indigo-100/40 via-pink-50/30 to-transparent blur-3xl"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2 }}
        />
        <div className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        <div className="relative max-w-5xl mx-auto px-5 sm:px-8 pt-10 sm:pt-16 space-y-12">
          {/* ─── Manifesto Hero ────────────────────────── */}
          <motion.section
            initial={{ opacity: 0, filter: 'blur(8px)', y: 12 }}
            animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-[10px] sm:text-[11px] font-black tracking-[0.22em] uppercase text-brand-gray/70 mb-4">
              MANIFESTO · 2026
            </p>
            <h1 className="text-[40px] sm:text-[64px] md:text-[84px] font-black tracking-[-0.04em] leading-[0.92] text-brand-dark">
              你是天才。
            </h1>
            <h2 className="mt-3 text-[24px] sm:text-[40px] md:text-[52px] font-black tracking-[-0.03em] leading-[1.05] text-brand-gray/90">
              这个世界<span className="text-brand-dark">为你的想法</span>多走了一步。
            </h2>

            <p className="mt-8 max-w-2xl text-[14px] sm:text-[16px] leading-relaxed text-neutral-600 font-medium">
              APEX 不是又一个逼你打卡的工具——它替你站在你这边。<br />
              我们相信每个人都在自己的世界里有一套理解, 那些被觉得"奇怪"的角度, 往往就是下一次突破。<br />
              所以这里没有 KPI, 没有进度条 ——<span className="text-brand-dark font-bold">只有你, 和你的下班时间。</span>
            </p>
          </motion.section>

          {/* ─── 三个信念 ──────────────────────────────── */}
          <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4"
          >
            <BeliefCard
              icon={<Clock size={18} />}
              tone="emerald"
              eyebrow="BELIEF 01"
              title="高效 ≠ 加班"
              metric={`${savedOtMin}`}
              metricUnit="分钟"
              caption="今天为自己省下的时间。"
            />
            <BeliefCard
              icon={<Lightbulb size={18} />}
              tone="amber"
              eyebrow="BELIEF 02"
              title="想法值钱"
              metric={`${ideaCount}`}
              metricUnit="条"
              caption="你提交过的天才点子。"
            />
            <BeliefCard
              icon={<Heart size={18} />}
              tone="rose"
              eyebrow="BELIEF 03"
              title="陪你走完这一天"
              metric={petAlive ? `${petDays}` : '—'}
              metricUnit={petAlive ? '天' : '尚未领养'}
              caption="小东西陪着你的天数。"
            />
          </motion.section>

          {/* ─── 行动入口 ──────────────────────────────── */}
          <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.7 }}
          >
            <div className="flex items-baseline justify-between mb-4">
              <p className="text-[10px] sm:text-[11px] font-black tracking-[0.22em] uppercase text-brand-dark">
                Take Action
              </p>
              <p className="text-[11px] text-brand-gray font-medium">
                你的每个声音都会被存下来
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <ActionCard
                to="/feedback?tab=pain"
                icon={<MessageSquare size={18} />}
                title="吐槽 / 痛点"
                desc="哪些破事让你今天又想离职?写下来,我们替你记着。"
                accent="from-blue-500/10 to-blue-500/0"
                accentText="text-blue-600"
              />
              <ActionCard
                to="/feedback?tab=feature"
                icon={<Lightbulb size={18} />}
                title="提需求"
                desc="你想让 APEX 帮你做的那件事——直接说,不用客气。"
                accent="from-amber-500/10 to-amber-500/0"
                accentText="text-amber-600"
              />
              <ActionCard
                to="/feedback?tab=co-create"
                icon={<Rocket size={18} />}
                title="工创申请"
                desc="一句话描述你的天才点子,我们陪你把它做出来。"
                accent="from-rose-500/10 to-rose-500/0"
                accentText="text-rose-600"
              />
            </div>
          </motion.section>

          {/* ─── 尾签名 ────────────────────────────────── */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="border-t border-brand-border/30 pt-6 flex items-center justify-between text-[11px] text-brand-gray/70 font-mono tracking-wider"
          >
            <span className="inline-flex items-center gap-2">
              <Sparkles size={12} />
              APEX · v2.0
            </span>
            <span>替你站在你这边</span>
          </motion.section>
        </div>
      </div>
    </AppLayout>
  );
};

// ─── 子组件 ─────────────────────────────────────────────────
const BELIEF_TONE: Record<string, { iconBg: string; iconText: string; metric: string; ring: string }> = {
  emerald: { iconBg: 'bg-emerald-100', iconText: 'text-emerald-600', metric: 'text-emerald-700', ring: 'border-emerald-100' },
  amber:   { iconBg: 'bg-amber-100',   iconText: 'text-amber-600',   metric: 'text-amber-700',   ring: 'border-amber-100' },
  rose:    { iconBg: 'bg-rose-100',    iconText: 'text-rose-600',    metric: 'text-rose-700',    ring: 'border-rose-100' },
};

const BeliefCard: React.FC<{
  icon: React.ReactNode;
  tone: 'emerald' | 'amber' | 'rose';
  eyebrow: string;
  title: string;
  metric: string;
  metricUnit: string;
  caption: string;
}> = ({ icon, tone, eyebrow, title, metric, metricUnit, caption }) => {
  const t = BELIEF_TONE[tone];
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className={`rounded-[24px] border ${t.ring} bg-white/85 backdrop-blur-xl p-5 shadow-[0_18px_60px_-30px_rgba(15,23,42,0.18)]`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.iconBg} ${t.iconText}`}>
          {icon}
        </div>
        <p className="text-[9px] font-black uppercase tracking-[0.22em] text-brand-gray/60">{eyebrow}</p>
      </div>
      <h3 className="text-[15px] font-black text-brand-dark">{title}</h3>
      <p className={`mt-3 text-[32px] font-black leading-none tabular-nums ${t.metric}`}>
        {metric}
        <span className="ml-1 text-[12px] font-bold text-brand-gray/70">{metricUnit}</span>
      </p>
      <p className="mt-2 text-[12px] text-brand-gray font-medium leading-snug">{caption}</p>
    </motion.div>
  );
};

const ActionCard: React.FC<{
  to: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  accent: string;
  accentText: string;
}> = ({ to, icon, title, desc, accent, accentText }) => (
  <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }}>
    <Link
      to={to}
      className="group relative flex flex-col h-full overflow-hidden rounded-[24px] border border-brand-border/30 bg-white p-5 shadow-sm hover:border-brand-dark/60 hover:shadow-lg transition-all"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-50 group-hover:opacity-100 transition-opacity pointer-events-none`} />
      <div className="relative z-10 flex items-start justify-between mb-6">
        <div className={`w-10 h-10 rounded-xl bg-white border border-brand-border/30 flex items-center justify-center shadow-sm ${accentText}`}>
          {icon}
        </div>
        <ArrowUpRight size={16} className="text-brand-gray/40 group-hover:text-brand-dark group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
      </div>
      <div className="relative z-10">
        <h3 className="text-[15px] font-black tracking-tight text-brand-dark">{title}</h3>
        <p className="mt-1.5 text-[12px] text-brand-gray font-medium leading-relaxed">{desc}</p>
      </div>
    </Link>
  </motion.div>
);

export default About;
