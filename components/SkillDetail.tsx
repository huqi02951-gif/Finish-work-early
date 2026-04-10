import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, CheckCircle2, Zap, LayoutDashboard, Users, FileText, 
  Download, Play, AlertCircle, Info, ArrowRight, ChevronRight, 
  Sparkles, ShieldCheck, Target, MessageSquare, BarChart3, Clock
} from 'lucide-react';
import { SKILLS } from '../constants/skills';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';
import AppLayout from '../src/components/layout/AppLayout';

const SkillDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const skill = SKILLS.find(s => s.id === id);

  if (!skill) {
    return (
      <div className="py-40 text-center bg-brand-offwhite min-h-screen">
        <h2 className="font-serif text-4xl text-brand-dark mb-6 tracking-tight">未找到该 Skill</h2>
        <Link to="/skills" className="text-brand-gold font-bold hover:underline flex items-center justify-center gap-2">
          <ArrowLeft size={18} /> 返回工具库
        </Link>
      </div>
    );
  }

  const guide = skill.marketingGuide;

  return (
    <AppLayout title={skill.name} showBack>
    <div className="py-3 sm:py-8 bg-brand-offwhite min-h-screen">
      <div className="container mx-auto px-4 sm:px-6">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-10">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-4 sm:space-y-10">
            <div className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-[2.5rem] border border-brand-border/10 shadow-sm hover:shadow-xl transition-all duration-700">
              <div className="flex flex-wrap justify-between items-start mb-4 sm:mb-8 gap-3 sm:gap-6">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-2 mb-2 sm:mb-4">
                    <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-brand-light-gray text-brand-dark text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] rounded-full border border-brand-border/20">
                      {skill.category}
                    </span>
                    <div className="flex items-center gap-1">
                      <div className={cn("w-1.5 h-1.5 rounded-full", skill.status === '在线可用' ? "bg-emerald-500" : "bg-brand-gray")}></div>
                      <span className="text-[9px] font-bold text-brand-dark uppercase tracking-widest">
                        {skill.status}
                      </span>
                    </div>
                  </div>
                  <h1 className="font-serif text-xl sm:text-3xl text-brand-dark tracking-tight leading-tight">{skill.name}</h1>
                </div>
              </div>
 
              <div className="relative mb-4 sm:mb-10">
                <div className="absolute top-0 left-0 w-0.5 sm:w-1 h-full bg-brand-gold rounded-full opacity-30"></div>
                <p className="text-[13px] sm:text-base text-brand-gray leading-relaxed pl-4 sm:pl-8 font-medium opacity-80">
                  {skill.description}
                </p>
              </div>
 
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-8">
                <div className="bg-brand-light-gray/30 p-4 sm:p-8 rounded-xl sm:rounded-[2rem] border border-brand-border/5">
                  <h3 className="flex items-center gap-2 text-[9px] sm:text-[10px] font-bold text-brand-gray uppercase tracking-[0.2em] mb-3 sm:mb-6 opacity-60">
                    <Zap size={14} className="text-brand-gold" /> 输入参数
                  </h3>
                  <ul className="space-y-2 sm:space-y-4">
                    {skill.input.map(item => (
                      <li key={item} className="flex items-center gap-2 text-brand-dark font-medium text-[13px] sm:text-base">
                        <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-brand-gold/40"></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-brand-light-gray/30 p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] border border-brand-border/5">
                  <h3 className="flex items-center gap-2 text-[9px] sm:text-[10px] font-bold text-brand-gray uppercase tracking-[0.2em] mb-3 sm:mb-6 opacity-60">
                    <FileText size={14} className="text-brand-gold" /> 输出成果
                  </h3>
                  <ul className="space-y-2 sm:space-y-4">
                    {skill.output.map(item => (
                      <li key={item} className="flex items-center gap-2 text-brand-dark font-medium text-[13px] sm:text-base">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Marketing Guide Section (If exists) */}
            {guide && (
              <div className="space-y-4 sm:space-y-8">
                {/* 1. 产品框架 & 理解 */}
                <div className="bg-white rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-8 shadow-sm border border-brand-border/10">
                  <div className="flex items-center gap-3 mb-4 sm:mb-6">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-brand-gold/10 rounded-lg sm:rounded-xl flex items-center justify-center text-brand-gold">
                      <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <h2 className="text-base sm:text-xl font-serif font-bold text-brand-dark">产品框架与核心逻辑</h2>
                  </div>
                  
                  <div className="space-y-3 sm:space-y-6">
                    <div>
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-gold mb-2 sm:mb-3">底层逻辑</h3>
                      <p className="text-[13px] sm:text-sm text-brand-gray leading-relaxed font-medium">{guide.framework}</p>
                    </div>
                    <div className="p-3 sm:p-6 bg-brand-light-gray/50 rounded-xl sm:rounded-2xl border border-brand-border/5">
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-dark mb-2 sm:mb-3">产品定位</h3>
                      <p className="text-[12px] sm:text-sm text-brand-gray leading-relaxed font-medium">{guide.understanding}</p>
                    </div>
                  </div>
                </div>
 
                {/* 2. 行业切入 & 场景 */}
                <div className="bg-brand-dark rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-12 md:p-16 shadow-2xl text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                  
                  <div className="flex items-center gap-4 mb-8 sm:mb-10 relative z-10">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-xl sm:rounded-2xl flex items-center justify-center text-brand-gold">
                      <Target className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-serif font-bold">行业切入与核心场景</h2>
                  </div>
                  
                  <div className="space-y-8 sm:space-y-10 relative z-10">
                    <p className="text-lg sm:text-xl text-white/70 leading-relaxed font-light">{guide.industryFocus}</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {['设备更新', '技术改造', '数字化升级', '扩产周转'].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 sm:gap-4 bg-white/5 border border-white/10 p-4 sm:p-5 rounded-xl sm:rounded-2xl">
                          <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-brand-gold rounded-full"></div>
                          <span className="text-xs sm:text-sm font-bold tracking-wide">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
 
                {/* 3. 目标客群 */}
                <div className="bg-white rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-12 md:p-16 shadow-sm border border-brand-border/10">
                  <div className="flex items-center gap-4 mb-8 sm:mb-10">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-brand-gold/10 rounded-xl sm:rounded-2xl flex items-center justify-center text-brand-gold">
                      <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-serif font-bold text-brand-dark">谁最适合这个产品？</h2>
                  </div>
                  
                  <div className="bg-brand-light-gray/50 rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-10 border border-brand-border/5">
                    <p className="text-base sm:text-lg text-brand-gray leading-relaxed font-medium whitespace-pre-line">{guide.targetCustomers}</p>
                  </div>
                </div>
 
                {/* 4. 营销话术 & 沟通 */}
                <div className="bg-white rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-12 md:p-16 shadow-sm border border-brand-border/10">
                  <div className="flex items-center gap-4 mb-8 sm:mb-10">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-brand-gold/10 rounded-xl sm:rounded-2xl flex items-center justify-center text-brand-gold">
                      <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-serif font-bold text-brand-dark">对客沟通与营销话术</h2>
                  </div>
                  
                  <div className="space-y-8 sm:space-y-12">
                    <div className="relative pl-6 sm:pl-8">
                      <div className="absolute left-0 top-0 bottom-0 w-1 sm:w-1.5 bg-brand-gold rounded-full opacity-40"></div>
                      <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-brand-gold mb-3 sm:mb-4">首次拜访开口</h3>
                      <p className="text-xl sm:text-2xl font-serif italic text-brand-dark leading-tight">“{guide.openingTalk}”</p>
                    </div>
 
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                      <div className="p-6 sm:p-8 bg-brand-light-gray/50 rounded-[1.5rem] sm:rounded-[2rem] border border-brand-border/5">
                        <h4 className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-brand-gray mb-3 sm:mb-4 flex items-center gap-2">
                          <BarChart3 size={14} /> 竞品对比策略
                        </h4>
                        <p className="text-xs sm:text-sm text-brand-gray leading-relaxed font-medium">{guide.comparison}</p>
                      </div>
                      <div className="p-6 sm:p-8 bg-brand-light-gray/50 rounded-[1.5rem] sm:rounded-[2rem] border border-brand-border/5">
                        <h4 className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-brand-gray mb-3 sm:mb-4 flex items-center gap-2">
                          <Zap size={14} /> 利率谈话技巧
                        </h4>
                        <p className="text-xs sm:text-sm text-brand-gray leading-relaxed font-medium">{guide.interestRates}</p>
                      </div>
                    </div>
 
                    <div className="p-8 sm:p-10 bg-brand-dark text-white rounded-[2rem] sm:rounded-[2.5rem] relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-700">
                        <Sparkles className="w-12 h-12 sm:w-16 sm:h-16" />
                      </div>
                      <h4 className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-brand-gold mb-4 sm:mb-6">行业专家视角 (Role Play)</h4>
                      <p className="text-lg sm:text-xl text-white/90 leading-relaxed italic font-light">“{guide.rolePlay}”</p>
                    </div>
                  </div>
                </div>
 
                {/* 5. 材料与流程 */}
                <div className="bg-white rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-12 md:p-16 shadow-sm border border-brand-border/10">
                  <div className="flex items-center gap-4 mb-8 sm:mb-10">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-brand-gold/10 rounded-xl sm:rounded-2xl flex items-center justify-center text-brand-gold">
                      <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-serif font-bold text-brand-dark">材料准备与提速建议</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
                    <div>
                      <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-brand-gold mb-4 sm:mb-6">材料清单梳理</h3>
                      <p className="text-brand-gray text-xs sm:text-sm leading-relaxed whitespace-pre-line font-medium">{guide.materials}</p>
                    </div>
                    <div className="space-y-6 sm:space-y-8">
                      <div className="p-6 sm:p-8 bg-emerald-50 rounded-[1.5rem] sm:rounded-[2rem] border border-emerald-100">
                        <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-emerald-700 mb-3 sm:mb-4 flex items-center gap-2">
                          <Clock size={14} /> 尽快放款的关键
                        </h3>
                        <p className="text-emerald-900/80 text-xs sm:text-sm leading-relaxed font-medium">{guide.speedUp}</p>
                      </div>
                      <div className="p-6 sm:p-8 bg-brand-gold/5 rounded-[1.5rem] sm:rounded-[2rem] border border-brand-gold/10">
                        <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-brand-gold mb-3 sm:mb-4 flex items-center gap-2">
                          <CheckCircle2 size={14} /> 核心总结
                        </h3>
                        <p className="text-brand-dark text-xs sm:text-sm font-bold leading-relaxed">{guide.summary}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
 
            {/* Preview / Demo Area */}
            <div className="bg-brand-dark rounded-[2.5rem] sm:rounded-[3.5rem] p-10 sm:p-16 md:p-24 text-center relative overflow-hidden shadow-2xl group">
               <div className="absolute inset-0 opacity-20 pointer-events-none transition-opacity duration-700 group-hover:opacity-30">
                  <div className="w-full h-full bg-[radial-gradient(circle_at_center,#C5A059_0%,transparent_70%)]"></div>
               </div>
               <div className="relative z-10 max-w-2xl mx-auto">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-brand-gold/10 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-8 sm:mb-10 border border-brand-gold/20">
                    <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-brand-gold" />
                  </div>
                  <h3 className="font-serif text-3xl sm:text-4xl md:text-5xl text-white mb-6 sm:mb-8 tracking-tight">立即开始使用</h3>
                  <p className="text-base sm:text-lg text-white/60 mb-10 sm:mb-12 leading-relaxed font-medium">
                    {skill.status === '在线可用' 
                      ? '该工具已在线部署，你可以直接输入参数并生成结果。' 
                      : '该工具目前需要特定的运行环境，请根据下方指引进行操作。'}
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
                    {skill.status === '在线可用' ? (
                      <button 
                        onClick={() => skill.toolRoute ? navigate(skill.toolRoute) : alert('该工具正在部署中...')}
                        className="px-8 py-4 sm:px-12 sm:py-5 bg-brand-gold text-brand-dark rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg hover:shadow-2xl hover:shadow-brand-gold/40 transition-all flex items-center justify-center gap-3 active:scale-95"
                      >
                        <Play className="w-5 h-5 sm:w-6 sm:h-6" /> 在线运行
                      </button>
                    ) : (
                      <button className="px-8 py-4 sm:px-12 sm:py-5 bg-white/10 text-white border border-white/20 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg hover:bg-white/20 transition-all flex items-center justify-center gap-3 active:scale-95">
                        <Download className="w-5 h-5 sm:w-6 sm:h-6" /> 下载工具包
                      </button>
                    )}
                    <Link to="/instructions" className="px-8 py-4 sm:px-12 sm:py-5 border border-white/10 text-white rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg hover:bg-white/20 transition-all flex items-center justify-center gap-3 active:scale-95">
                      <Info className="w-5 h-5 sm:w-6 sm:h-6" /> 查看说明
                    </Link>
                  </div>
               </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="lg:col-span-4 space-y-6 sm:space-y-10">
            <div className="bg-white p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] border border-brand-border/10 shadow-sm">
              <h3 className="text-[9px] sm:text-[11px] font-bold text-brand-gray uppercase tracking-[0.3em] mb-6 sm:mb-10 opacity-60">基本信息</h3>
              <div className="space-y-6 sm:space-y-10">
                <div className="flex items-start gap-4 sm:gap-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-brand-light-gray flex items-center justify-center text-brand-gray border border-brand-border/10 shrink-0">
                    <LayoutDashboard className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <p className="text-[8px] sm:text-[10px] font-bold text-brand-gray uppercase tracking-[0.2em] mb-1 sm:mb-2 opacity-60">适用场景</p>
                    <p className="text-base sm:text-lg text-brand-dark font-bold tracking-tight">{skill.scene}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 sm:gap-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-brand-light-gray flex items-center justify-center text-brand-gray border border-brand-border/10 shrink-0">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <p className="text-[8px] sm:text-[10px] font-bold text-brand-gray uppercase tracking-[0.2em] mb-1 sm:mb-2 opacity-60">面向对象</p>
                    <p className="text-base sm:text-lg text-brand-dark font-bold tracking-tight">{skill.audience.join('、')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 sm:gap-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-brand-light-gray flex items-center justify-center text-brand-gray border border-brand-border/10 shrink-0">
                    <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <p className="text-[8px] sm:text-[10px] font-bold text-brand-gray uppercase tracking-[0.2em] mb-1 sm:mb-2 opacity-60">当前形态</p>
                    <p className="text-base sm:text-lg text-brand-dark font-bold tracking-tight">{skill.form}</p>
                  </div>
                </div>
              </div>
            </div>
 
            {skill.note && (
              <div className="bg-orange-50/50 p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] border border-orange-100/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-orange-400/5 rounded-full -mr-12 -mt-12"></div>
                <div className="flex items-center gap-3 text-orange-700 font-bold text-xs mb-4 sm:mb-6">
                  <AlertCircle className="w-[18px] h-[18px] sm:w-5 sm:h-5" /> 特别说明
                </div>
                <p className="text-orange-800/80 text-xs sm:text-sm leading-relaxed font-medium">
                  {skill.note}
                </p>
              </div>
            )}
 
            <div className="bg-brand-dark p-8 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-brand-gold/5 rounded-full -mr-16 -mb-16 transition-transform duration-700 group-hover:scale-150"></div>
              <h3 className="font-serif text-xl sm:text-2xl mb-4 sm:mb-6 tracking-tight">需要定制开发？</h3>
              <p className="text-white/60 text-xs sm:text-sm mb-6 sm:mb-8 leading-relaxed font-medium">
                如果该 Skill 无法完全满足你的业务需求，欢迎申请共创定制。
              </p>
              <Link to="/feedback" className="text-brand-gold text-xs sm:text-sm font-bold flex items-center gap-2 hover:gap-4 transition-all">
                申请共创 <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
    </AppLayout>
  );
};

export default SkillDetail;
