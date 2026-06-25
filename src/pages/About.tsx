import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowUpRight, MessageSquare, Lightbulb, Rocket,
  Sparkles, Heart, Clock, Mic, Paperclip, Send,
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

          {/* ─── Echo 声音界面 ───────────────────────────── */}
          <motion.section
            id="echo"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16, duration: 0.7 }}
            className="relative overflow-hidden rounded-[32px] border border-white/70 bg-white/82 p-5 shadow-[0_26px_90px_-42px_rgba(15,23,42,0.32)] backdrop-blur-2xl sm:p-7"
          >
            <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_35%_35%,rgba(255,255,255,0.98),rgba(199,210,254,0.42)_38%,rgba(244,114,182,0.18)_62%,transparent_74%)] blur-[1px]" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-indigo-50/60 to-transparent" />

            <div className="relative z-10 grid gap-7 lg:grid-cols-[0.86fr_1.14fr] lg:items-center">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-brand-gray/60">
                  Echo · AI 口
                </p>
                <h3 className="mt-3 text-[30px] font-black tracking-[-0.04em] text-brand-dark sm:text-[42px]">
                  Ask 小海螺 Echo
                </h3>
                <p className="mt-3 max-w-md text-[13px] font-medium leading-relaxed text-brand-gray sm:text-[14px]">
                  它不是一个新按钮，而是 APEX 的声音入口。你可以问业务、交材料、要清单，也可以在快撑不住的时候，把那句话轻轻说出来。
                </p>
              </div>

              <div className="rounded-[28px] border border-brand-border/20 bg-white/88 p-4 shadow-[0_22px_70px_-42px_rgba(15,23,42,0.45)] sm:p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-dark text-white">
                      <Sparkles size={15} />
                    </span>
                    <div>
                      <p className="text-[11px] font-black text-brand-dark">小海螺在呢</p>
                      <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-brand-gray/50">Voice / Text / Skills</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-700">
                    Ready
                  </span>
                </div>

                <div className="rounded-[24px] border border-brand-border/20 bg-[#fbfbfd] px-4 pb-4 pt-4">
                  <p className="text-[13px] font-bold leading-relaxed text-brand-dark sm:text-[15px]">
                    在 APEX 中构建、询问、完成工作
                  </p>
                  <p className="mt-2 text-[12px] font-medium leading-relaxed text-brand-gray">
                    帮我查一下客户工商信息，生成授信调查报告，再把今天的卡点做一个低压复盘。
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex gap-2">
                      <span className="grid h-9 w-9 place-items-center rounded-full border border-brand-border/20 bg-white text-brand-dark">
                        <Mic size={15} />
                      </span>
                      <span className="grid h-9 w-9 place-items-center rounded-full border border-brand-border/20 bg-white text-brand-dark">
                        <Paperclip size={15} />
                      </span>
                    </div>
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-dark text-white shadow-lg shadow-brand-dark/15">
                      <Send size={15} />
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 pb-1">
                  {[
                    ['查工商信息', '/skills'],
                    ['生成调查报告', '/material-checklist'],
                    ['转补件清单', '/checklist-generator'],
                    ['今天中午吃什么', '/scenarios?tab=self'],
                    ['陪我低压复盘', '/feedback?tab=co-create'],
                  ].map(([label, to]) => (
                    <Link
                      key={label}
                      to={to}
                      className="rounded-full border border-brand-border/20 bg-white px-3.5 py-2 text-[11px] font-black text-brand-dark shadow-sm transition-colors hover:bg-brand-offwhite"
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
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
