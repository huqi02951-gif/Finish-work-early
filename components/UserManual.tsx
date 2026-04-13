/**
 * UserManual — 用户手册
 *
 * 最基础、最白话的模块使用指南。
 * 说明每个模块能做什么、点哪里、出来什么结果。
 * 后续可接数据库/CMS 驱动，当前先用静态配置。
 */
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users, ShieldCheck, Briefcase, User, Compass,
  LayoutDashboard, FileText, MessageSquare, Zap,
  ChevronRight, BookOpen, ArrowRight,
} from 'lucide-react';
import AppLayout from '../src/components/layout/AppLayout';
import { cn } from '../lib/utils';

interface ModuleGuide {
  icon: React.ElementType;
  name: string;
  path: string;
  color: string;
  whatItDoes: string;
  whereToClick: string;
  whatYouGet: string;
}

/**
 * 模块指南数据 — 后续可迁移至数据库
 */
const MODULES: ModuleGuide[] = [
  {
    icon: Compass,
    name: '场景中心',
    path: '/scenarios',
    color: 'bg-apple-blue',
    whatItDoes: '按"对客户、对审查、对中后台、对自己"四个视角，把所有工具和功能分好类。不知道从哪开始？就来这里。',
    whereToClick: '首页 → 点击任意场景卡片，或底部导航「首页」→ 场景入口',
    whatYouGet: '快速找到当前场景需要的工具、话术和模板',
  },
  {
    icon: LayoutDashboard,
    name: '客户经理业务通',
    path: '/business-guide',
    color: 'bg-brand-dark',
    whatItDoes: '产品打法手册。包含长融保、长易担等产品的准入判断、进门对话、需求识别、高频问答和可复制话术。',
    whereToClick: '场景中心 → 对客户 → 客户经理业务通，或直接搜索产品名',
    whatYouGet: '一整套"面对客户怎么说、怎么问、怎么推"的结构化打法',
  },
  {
    icon: Users,
    name: '产品实战场景（对客户）',
    path: '/product-scene?product=chang_rong_bao&scene=customer',
    color: 'bg-apple-blue',
    whatItDoes: '长融保/长易担的客户视角实战页：核心卖点、营销切入点、可直接复制发给客户的话术、客户高频问答。',
    whereToClick: '场景中心 → 对客户 → 产品实战场景 → 选"对客户"标签',
    whatYouGet: '复制即用的客户沟通话术、清晰的卖点提炼、快速进入材料清单',
  },
  {
    icon: ShieldCheck,
    name: '产品实战场景（对审查）',
    path: '/product-scene?product=chang_rong_bao&scene=review',
    color: 'bg-apple-purple',
    whatItDoes: '长融保/长易担的审查视角实战页：逐项检核表（可打勾）、审查说明模板、授信上报内容模板，全部可复制。',
    whereToClick: '场景中心 → 对客户 → 产品实战场景 → 选"对审查"标签',
    whatYouGet: '可复制的审查说明和授信上报模板、不遗漏任何准入项的检核清单',
  },
  {
    icon: FileText,
    name: '材料清单中心',
    path: '/material-checklist',
    color: 'bg-emerald-500',
    whatItDoes: '自动生成对客材料清单。选业务类型 → 填客户信息 → 一键导出标准化 Word/Excel 清单。',
    whereToClick: '场景中心 → 对客户 → 材料清单中心，或顶部导航直达',
    whatYouGet: '一份可以直接发给客户的标准化材料清单文件',
  },
  {
    icon: Zap,
    name: 'Skills 工具库',
    path: '/skills',
    color: 'bg-brand-gold',
    whatItDoes: '全量工具列表。每个工具对应一个具体痛点：测算、签报生成、话术模板、排版、开票等。支持按场景标签筛选。',
    whereToClick: '底部导航「仓库」，或首页 → Skills 入口',
    whatYouGet: '找到并立即使用对应的工具，节省重复劳动时间',
  },
  {
    icon: MessageSquare,
    name: '敏感沟通助手',
    path: '/sensitive-comm',
    color: 'bg-orange-500',
    whatItDoes: '处理"必须说但不好说"的事：收费通知、利率调整、授信暂缓、拒绝办理。生成高情商话术。',
    whereToClick: '场景中心 → 对客户 → 核心沟通工具，或 Skills 工具库搜索',
    whatYouGet: '4 种风格的标准话术：直接发送版、正式版、柔和版、电话提纲版',
  },
  {
    icon: User,
    name: '对自己空间',
    path: '/scenarios?tab=self',
    color: 'bg-apple-pink',
    whatItDoes: '打工人的私人充电站：薪资监控、今天吃什么、打工风水历、宠物养成、番茄钟、匿名吐槽墙。',
    whereToClick: '场景中心 → 切到"对自己"标签',
    whatYouGet: '放松一下，充个电，顺便赚点能量值',
  },
  {
    icon: Briefcase,
    name: '交流社区 (BBS)',
    path: '/bbs',
    color: 'bg-apple-indigo',
    whatItDoes: '客户经理实战交流平台。分享展业心得、解决业务难题、看看别人怎么做的。',
    whereToClick: '底部导航「工作台」→ BBS 入口',
    whatYouGet: '同行经验分享、问题答疑、实战案例',
  },
];

const UserManual: React.FC = () => {
  return (
    <AppLayout title="使用手册" showBack>
      <div className="pb-20 bg-brand-offwhite min-h-screen">
        {/* Header */}
        <header className="px-6 pt-8 pb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-brand-dark text-white rounded-xl flex items-center justify-center shadow-lg">
              <BookOpen size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-brand-dark tracking-tight">使用手册</h1>
              <p className="text-[10px] text-brand-gray font-medium opacity-70">每个模块能做什么、点哪里、出来什么结果</p>
            </div>
          </div>
          <div className="bg-brand-gold/10 border border-brand-gold/20 rounded-xl p-4">
            <p className="text-xs text-brand-dark font-medium leading-relaxed">
              <strong>新手建议：</strong>先去「场景中心」选一个最贴合你当前需要的场景（比如"对客户"），点进去就能看到相关的所有工具和入口。不确定用什么？往下翻，每个模块都有白话说明。
            </p>
          </div>
        </header>

        {/* Module Cards */}
        <div className="px-6 space-y-3">
          {MODULES.map((m, idx) => (
            <Link
              key={idx}
              to={m.path}
              className="block bg-white rounded-xl border border-brand-border/5 shadow-sm hover:shadow-md transition-all overflow-hidden group"
            >
              <div className="p-4 sm:p-5">
                {/* Title Row */}
                <div className="flex items-center gap-3 mb-3">
                  <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white', m.color)}>
                    <m.icon size={16} />
                  </div>
                  <h3 className="text-sm font-bold text-brand-dark group-hover:text-apple-blue transition-colors flex-1">{m.name}</h3>
                  <ChevronRight size={14} className="text-brand-gray/30 group-hover:text-apple-blue group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>

                {/* What it does */}
                <p className="text-xs text-brand-dark/80 font-medium leading-relaxed mb-3">
                  {m.whatItDoes}
                </p>

                {/* Where & What */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="bg-brand-light-gray/40 rounded-lg px-3 py-2">
                    <p className="text-[9px] text-brand-gray/50 font-bold uppercase tracking-widest mb-0.5">怎么进去</p>
                    <p className="text-[10px] text-brand-dark font-medium">{m.whereToClick}</p>
                  </div>
                  <div className="bg-brand-light-gray/40 rounded-lg px-3 py-2">
                    <p className="text-[9px] text-brand-gray/50 font-bold uppercase tracking-widest mb-0.5">能拿到什么</p>
                    <p className="text-[10px] text-brand-dark font-medium">{m.whatYouGet}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 mt-8">
          <div className="bg-brand-dark rounded-xl p-5 text-center">
            <p className="text-xs text-white/70 font-medium mb-3">找不到你要的功能？有改进建议？</p>
            <Link
              to="/feedback"
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-white text-brand-dark rounded-lg text-xs font-bold hover:bg-brand-gold hover:text-white transition-all"
            >
              提交反馈 <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default UserManual;
