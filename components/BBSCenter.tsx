
import React from 'react';
import { MessageSquare, Users, Lightbulb, Share2, MessageCircle, ArrowRight } from 'lucide-react';
import AppLayout from '../src/components/layout/AppLayout';
import { cn } from '../lib/utils';

const BBSCenter: React.FC = () => {
  const sections = [
    {
      title: '经验交流',
      desc: '分享一线实战经验，交流业务心得。',
      icon: Users,
      color: 'text-apple-blue',
      bg: 'bg-apple-blue/5',
      count: '128 讨论'
    },
    {
      title: '需求共创',
      desc: '提交你的业务痛点，我们共同打造新 Skill。',
      icon: Lightbulb,
      color: 'text-apple-purple',
      bg: 'bg-apple-purple/5',
      count: '45 提案'
    },
    {
      title: '案例沉淀',
      desc: '经典案例库，复盘成功路径。',
      icon: Share2,
      color: 'text-apple-indigo',
      bg: 'bg-apple-indigo/5',
      count: '89 案例'
    },
    {
      title: '工具反馈',
      desc: '对现有工具的改进建议与 Bug 反馈。',
      icon: MessageCircle,
      color: 'text-apple-pink',
      bg: 'bg-apple-pink/5',
      count: '23 反馈'
    }
  ];

  return (
    <AppLayout title="论坛中心" showBack>
      <div className="pb-24 bg-white min-h-screen">
        {/* Header Section */}
        <header className="px-6 pt-12 pb-8">
          <div className="inline-block px-3 py-1 rounded-full bg-brand-dark/5 text-[9px] font-bold tracking-[0.3em] uppercase mb-6 opacity-40">
            finish work early
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-brand-dark mb-2">论坛中心</h1>
          <p className="text-brand-gray font-medium text-sm max-w-md">
            汇聚一线智慧，共创最强 Agent。在这里分享经验、沉淀案例、反馈需求。
          </p>
        </header>

        {/* Sections Grid */}
        <div className="px-6 space-y-4">
          {sections.map((section, idx) => (
            <div 
              key={idx}
              className="group apple-card p-6 flex items-center justify-between hover:shadow-lg transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-5">
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0", section.bg, section.color)}>
                  <section.icon size={28} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-brand-dark mb-1">{section.title}</h3>
                  <p className="text-xs text-brand-gray font-medium line-clamp-1">{section.desc}</p>
                  <span className="inline-block mt-2 text-[10px] font-bold text-brand-gray/40 uppercase tracking-widest">
                    {section.count}
                  </span>
                </div>
              </div>
              <ArrowRight size={20} className="text-brand-border group-hover:text-apple-blue transition-colors" />
            </div>
          ))}
        </div>

        {/* Coming Soon Note */}
        <div className="mt-12 mx-6 p-8 bg-brand-light-gray/50 rounded-3xl text-center border border-brand-border/5">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <MessageSquare size={24} className="text-apple-blue" />
          </div>
          <h3 className="text-xl font-bold text-brand-dark mb-2">持续开放共创</h3>
          <p className="text-sm text-brand-gray font-medium mb-6">
            论坛模块正在深度开发中，目前仅开放部分版块浏览。
          </p>
          <button className="px-8 py-3 bg-brand-dark text-white rounded-full font-bold text-xs hover:opacity-90 transition-all">
            申请内测权限
          </button>
        </div>
      </div>
    </AppLayout>
  );
};

export default BBSCenter;
