import React from 'react';
import { History, Calendar, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import AppLayout from '../src/components/layout/AppLayout';

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
    <AppLayout title="更新记录中心" showBack>
      <div className="pb-24 bg-brand-offwhite min-h-screen">
        {/* Apple Music Style Header */}
        <header className="px-6 pt-12 pb-8">
          <h1 className="text-4xl font-bold tracking-tight text-brand-dark mb-2">更新记录</h1>
          <p className="text-brand-gray font-medium text-sm max-w-md">
            记录 Agent 能力的每一次进化。我们坚持以真实业务痛点为导向，
            持续迭代、固化经验，为一线客户经理减负。
          </p>
        </header>

        <div className="px-6 space-y-8">
          {updates.map((update, idx) => (
            <div key={update.version} className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-2 rounded-full bg-apple-blue shadow-[0_0_8px_rgba(0,122,255,0.5)]" />
                <span className="text-[11px] font-bold text-brand-gray uppercase tracking-widest">{update.date}</span>
                <span className="px-2 py-0.5 bg-brand-light-gray text-brand-gray text-[9px] font-bold rounded-full border border-brand-border/10">
                  {update.version}
                </span>
              </div>
              
              <div className="bg-white p-6 rounded-3xl border border-brand-border/5 shadow-sm">
                <h3 className="text-xl font-bold text-brand-dark mb-3 tracking-tight">{update.title}</h3>
                <p className="text-xs text-brand-gray mb-6 leading-relaxed font-medium opacity-80 italic border-l-2 border-brand-border/10 pl-4">
                  {update.desc}
                </p>
                <ul className="space-y-3">
                  {update.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-xs text-brand-dark font-medium">
                      <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 mx-6 p-8 bg-brand-dark rounded-3xl text-center shadow-xl shadow-brand-dark/20 relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-6 text-white">
              <Clock size={24} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">更多能力正在孵化中</h3>
            <p className="text-white/60 text-sm font-medium mb-8 max-w-xs mx-auto">
              我们有一份长长的 Skills 待办清单，如果你有急需解决的痛点，欢迎与我们共创。
            </p>
            <button className="px-8 py-3 bg-white text-brand-dark rounded-full font-bold text-xs hover:opacity-90 transition-all">
              提交需求建议
            </button>
          </div>
          <div className="absolute top-0 right-0 w-48 h-48 bg-apple-blue/10 blur-[80px] -mr-24 -mt-24 rounded-full" />
        </div>
      </div>
    </AppLayout>
  );
};

export default UpdateLog;
