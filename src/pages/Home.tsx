import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Briefcase, LayoutDashboard, Lock, MessageSquare, ShieldCheck, Users } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import { cn } from '../../lib/utils';
import { getCommunitySummary } from '../../lib/community';

const scenarios = [
  { id: 'customer', title: '对客户', desc: '营销话术、产品测算、推进路径', path: '/scenarios?tab=customer' },
  { id: 'review', title: '对审查', desc: '合规口径、准入核对、报批建议', path: '/scenarios?tab=review' },
  { id: 'backoffice', title: '对中后台', desc: '系统操作、材料清单、流程梳理', path: '/scenarios?tab=backoffice' },
  { id: 'self', title: '对自己', desc: '效率工具、经验沉淀、茶水间贴板', path: '/scenarios?tab=self' },
];

const Home: React.FC = () => {
  const [communitySummary, setCommunitySummary] = useState<Awaited<ReturnType<typeof getCommunitySummary>> | null>(null);

  useEffect(() => {
    getCommunitySummary().then(setCommunitySummary);
  }, []);

  return (
    <AppLayout title="首页">
      <div className="mx-auto flex min-h-[calc(100vh-7rem)] max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6">
        <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-gray">Finish Work Early</div>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight text-brand-dark sm:text-5xl">
              今天先处理哪一类工作。
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-brand-gray">
              这里不做展示型首页。直接把四类高频场景、正式工作台和暗网社区入口放到第一屏，减少跳转和视觉负担。
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/workspace"
                className="inline-flex items-center gap-2 rounded-md border border-brand-dark bg-brand-dark px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-black"
              >
                打开工作台
                <ArrowRight size={15} />
              </Link>
              <Link
                to="/bbs"
                className="inline-flex items-center gap-2 rounded-md border border-brand-border/70 px-4 py-2 text-sm font-semibold text-brand-dark transition-colors hover:bg-brand-light-gray"
              >
                进入暗网社区
                <Lock size={15} />
              </Link>
            </div>
          </div>

          <div className="grid gap-3">
            <div className="rounded-md border border-brand-border/60 bg-brand-offwhite p-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-gray">workspace pulse</div>
              <div className="mt-3 grid grid-cols-3 gap-3">
                {[
                  { label: '活跃主题', value: communitySummary?.totalThreads ?? 0, icon: MessageSquare },
                  { label: '专题', value: communitySummary?.totalTopics ?? 0, icon: LayoutDashboard },
                  { label: 'Gossip', value: communitySummary?.totalGossip ?? 0, icon: Lock },
                ].map((item) => (
                  <div key={item.label} className="rounded-md border border-brand-border/50 bg-white p-3">
                    <item.icon size={15} className="text-brand-gray" />
                    <div className="mt-3 text-xl font-semibold text-brand-dark">{item.value}</div>
                    <div className="mt-1 text-[11px] text-brand-gray">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-md border border-brand-border/60 bg-white p-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-gray">today focus</div>
              <div className="mt-3 grid gap-2 text-sm text-brand-dark">
                <div className="flex items-center justify-between rounded-md border border-brand-border/50 p-3">
                  <span className="inline-flex items-center gap-2"><Briefcase size={15} /> 正式工作流汇总</span>
                  <Link to="/workspace" className="text-brand-gray hover:text-brand-dark">进入</Link>
                </div>
                <div className="flex items-center justify-between rounded-md border border-brand-border/50 p-3">
                  <span className="inline-flex items-center gap-2"><Users size={15} /> 工具仓库与场景入口</span>
                  <Link to="/skills" className="text-brand-gray hover:text-brand-dark">查看</Link>
                </div>
                <div className="flex items-center justify-between rounded-md border border-brand-border/50 p-3">
                  <span className="inline-flex items-center gap-2"><ShieldCheck size={15} /> 匿名讨论与系统经验</span>
                  <Link to="/bbs" className="text-brand-gray hover:text-brand-dark">接入</Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {scenarios.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className={cn(
                'rounded-md border border-brand-border/60 bg-white p-5 transition-colors hover:bg-brand-offwhite',
              )}
            >
              <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-gray">scenario</div>
              <div className="mt-3 text-lg font-semibold text-brand-dark">{item.title}</div>
              <p className="mt-2 text-sm leading-6 text-brand-gray">{item.desc}</p>
              <div className="mt-4 inline-flex items-center gap-1 text-sm text-brand-dark">
                进入
                <ArrowRight size={14} />
              </div>
            </Link>
          ))}
        </section>
      </div>
    </AppLayout>
  );
};

export default Home;
