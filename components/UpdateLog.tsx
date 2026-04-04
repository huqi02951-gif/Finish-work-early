import React from 'react';
import { History, Calendar, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';

const UpdateLog: React.FC = () => {
  const updates = [
    {
      date: '2026-04-04',
      version: 'v2.0.0',
      title: '核心业务工具全面集成',
      desc: '成功将“利率优惠智能生成”、“银承/存单测算小助手”及“中收优惠生成器”三大核心工具由本地/原型状态重构为在线交互版本。',
      type: 'feature',
      items: [
        '利率优惠智能生成：支持多种文案风格，自动匹配底线利率与审批权限',
        '银承/存单测算小助手：实现票据金额与存单质押实时测算，自动生成对客话术',
        '中收优惠生成器：支持批量生成 OA 申请文案，并可在线下载标准 Excel 附件',
        '对自己场景优化：新增“今天吃什么”、“我要早下班”及“专注的很”三大互动模块'
      ]
    },
    {
      date: '2024-11-15',
      version: 'v1.2.0',
      title: '新增“项下开票批量生成”开发中能力展示',
      desc: '针对大批量开票需求，通过模板引擎一键生成多份标准化文档，大幅减少重复录入工作。',
      type: 'feature',
      items: ['新增项下开票批量生成 Skill 介绍', '优化 Skills 工具库筛选逻辑', '更新场景中心分类展示']
    },
    {
      date: '2024-10-28',
      version: 'v1.1.5',
      title: '“账户业务费用优惠申请”本地工具发布',
      desc: '支持本地 Python GUI 环境运行，一键生成 Excel 申请表及 OA 文案。',
      type: 'release',
      items: ['发布账户业务费用优惠申请本地工具', '优化测算小助手计算逻辑', '修复部分签报生成格式问题']
    },
    {
      date: '2024-09-12',
      version: 'v1.1.0',
      title: '“银承/存单测算小助手”在线版上线',
      desc: '提供标准化的测算口径输出，方便与中后台沟通。',
      type: 'feature',
      items: ['上线银承/存单测算小助手', '新增对中后台协同场景支持', '优化移动端适配体验']
    },
    {
      date: '2024-08-20',
      version: 'v1.0.0',
      title: '客户经理 Agent + Skills 超级超级强正式发布',
      desc: '把客户经理每天反复转译的信息，沉淀成可复用的 Skills。',
      type: 'release',
      items: ['发布首页、场景中心、工具库', '上线利率优惠签报智能生成 Skill', '开启反馈/共创通道']
    }
  ];

  return (
    <div className="py-24 bg-brand-offwhite min-h-screen">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mb-20 animate-fade-in-up">
          <h1 className="font-serif text-5xl md:text-6xl text-brand-dark mb-8">更新记录</h1>
          <p className="text-xl text-stone-500 leading-relaxed">
            记录 Agent 能力的每一次进化。我们坚持以真实业务痛点为导向，
            持续迭代、固化经验，为一线客户经理减负。
          </p>
        </div>

        <div className="relative max-w-4xl animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          {/* Timeline Line */}
          <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-stone-200 -translate-x-1/2 hidden md:block"></div>

          <div className="space-y-16">
            {updates.map((update, idx) => (
              <div key={update.version} className={cn(
                "relative flex flex-col md:flex-row gap-8 md:gap-0",
                idx % 2 === 0 ? "md:flex-row-reverse" : ""
              )}>
                {/* Timeline Dot */}
                <div className="absolute left-0 md:left-1/2 top-0 w-4 h-4 bg-white border-4 border-brand-gold rounded-full -translate-x-1/2 z-10 hidden md:block"></div>

                {/* Content Card */}
                <div className="w-full md:w-[45%]">
                  <div className="bg-white p-8 rounded-xl border border-stone-100 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <span className="flex items-center gap-2 text-brand-gold text-sm font-bold">
                        <Calendar size={14} /> {update.date}
                      </span>
                      <span className="px-2 py-0.5 bg-stone-100 text-stone-500 text-[10px] font-bold rounded uppercase tracking-widest">
                        {update.version}
                      </span>
                    </div>
                    <h3 className="font-serif text-2xl text-brand-dark mb-4">{update.title}</h3>
                    <p className="text-stone-500 text-sm mb-6 leading-relaxed italic border-l-2 border-stone-100 pl-4">
                      {update.desc}
                    </p>
                    <ul className="space-y-3">
                      {update.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-stone-600">
                          <CheckCircle2 size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Spacer for the other side */}
                <div className="hidden md:block w-[10%]"></div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-24 py-12 px-8 bg-brand-dark rounded-xl text-center animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="w-12 h-12 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-gold">
            <Clock size={24} />
          </div>
          <h3 className="font-serif text-2xl text-white mb-4">更多能力正在孵化中</h3>
          <p className="text-stone-400 mb-8 max-w-md mx-auto">
            我们有一份长长的 Skills 待办清单，如果你有急需解决的痛点，欢迎与我们共创。
          </p>
          <button className="px-8 py-3 bg-brand-gold text-brand-dark rounded-md font-bold hover:bg-brand-gold/90 transition-all">
            提交需求建议
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateLog;
