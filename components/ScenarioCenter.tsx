import React, { useState, useMemo } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Users, ShieldCheck, Briefcase, ArrowRight,
  Sparkles, Activity, ChevronRight, Search, AlertCircle,
  Ban, Zap,
  LayoutDashboard, Target, User, Database
} from 'lucide-react';
import ToMyselfSpace from './tools/ToMyselfSpace';
import PetOsMountSlot from './pet/PetOsMountSlot';
import { motion } from 'framer-motion';
import { SKILLS } from '../constants/skills';
import { cn } from '../lib/utils';
import AppLayout from '../src/components/layout/AppLayout';

const ANIM_DELAY_1 = { animationDelay: '0.3s' };
const ANIM_DELAY_2 = { animationDelay: '0.4s' };
const ANIM_DELAY_3 = { animationDelay: '0.5s' };


const SensitiveCommModule = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-brand-border/10 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden group">
      <div className="grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-7 p-6 md:p-12">
          <div className="flex items-center gap-4 mb-6 md:mb-8">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-brand-dark text-white rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg">
              <ShieldCheck size={20} className="md:hidden" />
              <ShieldCheck size={24} className="hidden md:block" />
            </div>
            <div>
              <span className="px-3 py-1 bg-brand-gold/10 text-brand-gold text-[9px] md:text-[10px] font-bold uppercase tracking-widest rounded-full border border-brand-gold/20">
                对客沟通 Skill
              </span>
            </div>
          </div>
          
          <h3 className="font-serif text-2xl md:text-4xl text-brand-dark mb-3 md:mb-6 tracking-tight">敏感沟通助手</h3>
          <p className="text-sm md:text-lg text-brand-gray mb-6 md:mb-10 font-medium leading-relaxed opacity-70">
            处理对客沟通中“必须说、但不好说”的敏感事项。把最难表达、最容易引发误解的事项，沉淀为高情商、专业、边界清晰的标准化话术。
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-6 md:mb-10">
            {[
              { label: '收费通知', icon: Zap },
              { label: '利率调整', icon: Activity },
              { label: '授信暂缓', icon: AlertCircle },
              { label: '拒绝办理', icon: Ban },
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2 p-3 md:p-4 bg-brand-light-gray/30 rounded-xl md:rounded-2xl border border-brand-border/5 group-hover:bg-brand-gold/5 transition-colors">
                <item.icon size={14} className="text-brand-gold md:hidden" />
                <item.icon size={18} className="text-brand-gold hidden md:block" />
                <span className="text-[9px] md:text-[10px] font-bold text-brand-dark">{item.label}</span>
              </div>
            ))}
          </div>

          <button 
            onClick={() => navigate('/sensitive-comm')}
            className="w-full md:w-auto px-6 md:px-10 py-3.5 md:py-5 bg-brand-dark text-white rounded-xl md:rounded-2xl font-bold text-sm md:text-lg hover:bg-brand-dark/90 transition-all shadow-xl flex items-center justify-center gap-3 group/btn"
          >
            立即进入助手
            <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
        
        <div className="lg:col-span-5 bg-brand-light-gray/20 p-6 md:p-10 flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-brand-border/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
            <Sparkles size={200} />
          </div>
          <div className="space-y-4 md:space-y-6 relative z-10">
            <div className="p-5 md:p-6 bg-white rounded-xl md:rounded-2xl shadow-sm border border-brand-border/5 transform -rotate-1 md:-rotate-2 hover:rotate-0 transition-transform duration-500">
              <p className="text-[9px] md:text-[10px] text-brand-gold font-bold uppercase tracking-widest mb-2">生成示例：授信暂缓</p>
              <p className="text-[11px] md:text-xs text-brand-gray font-medium leading-relaxed italic">
                “现阶段暂不具备推进条件，建议待相关条件补足后再行评估，我会持续帮您关注政策变化。”
              </p>
            </div>
            <div className="p-5 md:p-6 bg-white rounded-xl md:rounded-2xl shadow-sm border border-brand-border/5 transform rotate-1 hover:rotate-0 transition-transform duration-500">
              <p className="text-[9px] md:text-[10px] text-brand-gold font-bold uppercase tracking-widest mb-2">生成示例：收费通知</p>
              <p className="text-[11px] md:text-xs text-brand-gray font-medium leading-relaxed italic">
                “提前和您同步一下，根据行内最新规则...您可以关注下账户日均存款情况，达到标准后可自动减免。”
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const BusinessGuideModule = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-[2rem] md:rounded-[3rem] border border-brand-border/10 shadow-sm hover:shadow-2xl transition-all duration-700 overflow-hidden group">
      <div className="grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-7 p-6 md:p-16">
          <div className="flex items-center gap-4 mb-6 md:mb-8">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-brand-dark text-white rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg">
              <LayoutDashboard size={20} className="md:hidden" />
              <LayoutDashboard size={24} className="hidden md:block" />
            </div>
            <div>
              <h3 className="font-serif text-xl md:text-3xl text-brand-dark tracking-tight">客户经理业务通</h3>
              <p className="text-brand-gold text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em] mt-1">场景化业务打法中心 + 经验风格库</p>
            </div>
          </div>
          
          <p className="text-sm md:text-lg text-brand-gray font-medium leading-relaxed mb-6 md:mb-10 opacity-70">
            把产品知识、行业判断、客户对话和推进路径沉淀成可复用的业务打法。
            解决“面对客户说什么、怎么问、怎么推”的实战痛点。
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-4 mb-8 md:mb-12">
            {[
              { label: '按场景进入', icon: Zap, desc: '首次拜访/他行竞争' },
              { label: '按产品进入', icon: Briefcase, desc: '银承/流贷/抵押' },
              { label: '按行业进入', icon: Target, desc: '制造/贸易/科技' },
            ].map((item, idx) => (
              <div key={idx} className="flex flex-row sm:flex-col items-center sm:items-start gap-4 sm:gap-2 p-4 md:p-5 bg-brand-light-gray/30 rounded-xl md:rounded-2xl border border-brand-border/5 group-hover:bg-brand-gold/5 transition-colors">
                <item.icon size={18} className="text-brand-gold shrink-0" />
                <div>
                  <p className="text-[11px] font-bold text-brand-dark">{item.label}</p>
                  <p className="text-[9px] text-brand-gray font-medium mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={() => navigate('/business-guide')}
            className="w-full md:w-auto px-6 md:px-10 py-3.5 md:py-5 bg-brand-dark text-white rounded-xl md:rounded-2xl font-bold text-sm md:text-lg hover:bg-brand-dark/90 transition-all shadow-xl flex items-center justify-center gap-3 group/btn"
          >
            开启业务通
            <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
        
        <div className="lg:col-span-5 bg-brand-light-gray/30 p-6 md:p-12 flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-brand-border/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
            <Sparkles size={200} className="text-brand-dark" />
          </div>
          <div className="space-y-6 md:space-y-8 relative z-10">
            <div className="flex items-center gap-4 text-brand-gray mb-2">
              <User size={16} />
              <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest">经验上身 · 风格切换</span>
            </div>
            
            <div className="space-y-3 md:space-y-4">
              {[
                { name: 'Amy', style: '关系建立型', desc: '“张总，好久没见，听说咱们公司...”' },
                { name: 'Emily', style: '专业推进型', desc: '“根据我对贵司财报的分析...”' },
              ].map((p, idx) => (
                <div key={idx} className="p-4 md:p-5 bg-white border border-brand-border/10 rounded-xl md:rounded-2xl shadow-sm transform hover:-translate-y-0.5 transition-all duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-brand-gold text-xs font-bold">{p.name}</span>
                    <span className="text-[8px] md:text-[9px] text-brand-gray font-bold uppercase tracking-widest">{p.style}</span>
                  </div>
                  <p className="text-[10px] md:text-[11px] text-brand-gray italic leading-relaxed">
                    {p.desc}
                  </p>
                </div>
              ))}
            </div>
            
            <div className="pt-2 md:pt-4">
              <p className="text-[9px] md:text-[10px] text-brand-gray/70 font-medium leading-relaxed">
                不仅仅是资料库，更是你的“业务操作系统”。
                支持一键复制话术、清单与路径。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface SkillCardProps {
  skill: typeof SKILLS[number];
  runLabel?: string;
}

const SkillCard: React.FC<SkillCardProps> = ({ skill, runLabel = '运行' }) => (
  <div className="bg-white p-5 sm:p-6 rounded-3xl border border-brand-border/5 shadow-sm hover:shadow-xl transition-all duration-500 group flex flex-col">
    <div className="flex justify-between items-start mb-4 sm:mb-6">
      <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 bg-brand-light-gray text-brand-dark text-[8px] sm:text-[9px] font-bold uppercase tracking-widest rounded-full border border-brand-border/10">
        {skill.category}
      </span>
      <div className="flex items-center gap-1.5">
        <div className={cn("w-1.5 h-1.5 rounded-full", skill.status === '在线可用' ? "bg-emerald-500" : "bg-brand-gray")} />
        <span className="text-[8px] sm:text-[9px] font-bold text-brand-dark uppercase tracking-widest">{skill.status}</span>
      </div>
    </div>
    <h4 className="text-base sm:text-lg font-bold text-brand-dark mb-2 tracking-tight group-hover:text-apple-blue transition-colors">{skill.name}</h4>
    <p className="text-[10px] sm:text-xs text-brand-gray mb-6 sm:mb-8 line-clamp-2 font-medium leading-relaxed opacity-80">{skill.description}</p>
    <div className="flex items-center justify-between mt-auto pt-4 border-t border-brand-border/5">
      <span className="text-[8px] sm:text-[9px] text-brand-gray/40 font-bold uppercase tracking-[0.2em]">{skill.form}</span>
      <div className="flex items-center gap-3">
        <Link to={`/skills/${skill.id}`} className="text-brand-gray text-[10px] sm:text-[11px] font-bold hover:text-brand-dark transition-all">详情</Link>
        {skill.status === '在线可用' && skill.toolRoute && (
          <Link to={skill.toolRoute} className="text-apple-blue text-[10px] sm:text-[11px] font-bold flex items-center gap-1 hover:gap-2 transition-all bg-apple-blue/5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg">
            {runLabel} <ChevronRight size={12} />
          </Link>
        )}
      </div>
    </div>
  </div>
);

const SCENARIOS = [
  { id: 'customer', title: '对客户', icon: Users, desc: '营销话术、业务打法、产品测算。', color: 'bg-apple-blue' },
  { id: 'review', title: '对审查', icon: ShieldCheck, desc: '政策解读、准入核对、合规建议。', color: 'bg-apple-purple' },
  { id: 'backoffice', title: '对中后台', icon: Database, desc: '流程指引、材料清单、系统操作。', color: 'bg-apple-indigo' },
  { id: 'self', title: '对自己', icon: User, desc: '经验沉淀、效率工具、职场成长。', color: 'bg-apple-pink' },
];

const SKILLS_BY_SCENARIO = SCENARIOS.reduce<Record<string, typeof SKILLS>>((acc, s) => {
  acc[s.title] = SKILLS.filter(skill => skill.scene.includes(s.title));
  return acc;
}, {});

const ScenarioCenter: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'customer';
  const [showAllSkills, setShowAllSkills] = useState(false);

  const handleTabChange = (id: string) => {
    setSearchParams({ tab: id });
  };

  return (
    <AppLayout title="场景中心" showBack>
      <div className="pb-16 sm:pb-24 bg-brand-offwhite">
        <header className="px-5 sm:px-6 pt-8 sm:pt-12 pb-5 sm:pb-8 max-w-6xl mx-auto">
          <p className="text-[11px] font-extrabold tracking-[0.18em] uppercase text-brand-gray/60 mb-2">Scenario Center</p>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-3 text-brand-dark">场景中心</h1>
          <p className="font-medium text-sm sm:text-base leading-relaxed text-brand-gray max-w-2xl">
            按真实工作顺序组织工具：先沟通，再材料，再业务打法，最后进入产品实战。
          </p>
        </header>

        <div className="px-4 sm:px-6 mb-7 sm:mb-10 sticky top-14 z-40 backdrop-blur-md py-3 bg-brand-offwhite/90 border-y border-brand-border/5">
          <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-2">
            {SCENARIOS.map((s) => (
              <button
                key={s.id}
                onClick={() => handleTabChange(s.id)}
                className={cn(
                  "px-3 sm:px-5 py-3 rounded-xl text-[13px] sm:text-[14px] font-bold transition-all duration-300 flex items-center justify-center gap-2 border",
                  activeTab === s.id
                    ? "bg-white text-brand-dark shadow-sm border-brand-border/20"
                    : "bg-white/50 text-brand-gray hover:text-brand-dark hover:bg-white border-transparent"
                )}
              >
                <s.icon size={14} className={cn(activeTab === s.id ? "text-brand-dark" : "opacity-40")} />
                {s.title}
              </button>
            ))}
          </div>
        </div>

        <div className="px-5 sm:px-6 animate-fade-in max-w-6xl mx-auto">
          {SCENARIOS.filter(s => s.id === activeTab).map((s) => {
            const relatedSkills = SKILLS_BY_SCENARIO[s.title];
            return (
              <div key={s.id}>
                {s.id !== 'self' && (
                  <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                    <div className={cn("w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shrink-0", s.color)}>
                      <s.icon size={20} className="text-white sm:hidden" />
                      <s.icon size={24} className="text-white hidden sm:block" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-brand-dark tracking-tight">{s.title}</h2>
                      <p className="text-[10px] sm:text-xs text-brand-gray font-medium opacity-80">{s.desc}</p>
                    </div>
                  </div>
                )}

                {s.id === 'self' ? (
                  <div className="w-full overflow-x-hidden">
                    <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                      <div className={cn("w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shrink-0", s.color)}>
                        <s.icon size={20} className="text-white sm:hidden" />
                        <s.icon size={24} className="text-white hidden sm:block" />
                      </div>
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-brand-dark tracking-tight">{s.title}</h2>
                        <p className="text-[10px] sm:text-xs text-brand-gray font-medium opacity-80">{s.desc}</p>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <PetOsMountSlot />
                      <ToMyselfSpace />
                    </div>
                  </div>
                ) : s.id === 'customer' ? (
                  <div className="space-y-8 sm:space-y-12 md:space-y-16">
                    <div className="animate-fade-in-up" style={ANIM_DELAY_1}>
                      <div className="flex items-center mb-6 sm:mb-10 gap-4">
                        <h3 className="font-serif text-xl sm:text-2xl md:text-3xl text-brand-dark tracking-tight shrink-0">核心沟通工具</h3>
                        <div className="h-px flex-grow bg-brand-border/10" />
                      </div>
                      <SensitiveCommModule />
                    </div>

                    {/* 材料清单中心 — 改为独立页面链接 */}
                    <div className="animate-fade-in-up" style={ANIM_DELAY_2}>
                      <Link
                        to="/material-checklist?type=credit"
                        className="flex items-center justify-between bg-white p-5 sm:p-6 rounded-2xl border border-brand-border/5 shadow-sm hover:shadow-xl transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-brand-dark text-white rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                            <Briefcase size={20} className="sm:hidden" />
                            <Briefcase size={24} className="hidden sm:block" />
                          </div>
                          <div>
                            <h3 className="text-base sm:text-lg font-bold text-brand-dark group-hover:text-apple-blue transition-colors">材料清单中心</h3>
                            <p className="text-[10px] sm:text-xs text-brand-gray font-medium opacity-70">自动生成对客材料清单，支持一键导出 Word / Excel</p>
                          </div>
                        </div>
                        <ArrowRight size={18} className="text-brand-gray group-hover:text-apple-blue group-hover:translate-x-1 transition-all shrink-0" />
                      </Link>
                    </div>

                    <div className="animate-fade-in-up" style={ANIM_DELAY_3}>
                      <BusinessGuideModule />
                    </div>

                    {/* 产品实战场景入口 */}
                    <div className="animate-fade-in-up" style={{ animationDelay: '0.45s' }}>
                      <div className="flex items-center mb-6 sm:mb-10 gap-4">
                        <h3 className="font-serif text-xl sm:text-2xl md:text-3xl text-brand-dark tracking-tight shrink-0">产品实战场景</h3>
                        <div className="h-px flex-grow bg-brand-border/10" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                          { id: 'chang_yi_dan', name: '长易担', desc: '简易备案制 · 效率极高 · 优质客户专属', tag: '高效模式' },
                          { id: 'chang_rong_bao', name: '长融保', desc: '稳健型银担合作 · 80%担保 · 适配面广', tag: '传统模式' },
                        ].map((p) => (
                          <div
                            key={p.id}
                            className="bg-white p-5 sm:p-6 rounded-2xl border border-brand-border/5 shadow-sm hover:shadow-xl transition-all group flex flex-col"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-lg font-bold text-brand-dark group-hover:text-apple-blue transition-colors">{p.name}</h4>
                              <span className="px-2.5 py-0.5 bg-brand-gold/10 text-brand-gold text-[9px] font-bold rounded-full">{p.tag}</span>
                            </div>
                            <p className="text-xs text-brand-gray font-medium mb-4 opacity-70">{p.desc}</p>
                            <div className="mb-3">
                              <Link
                                to={`/checklist-generator?product=${p.id}`}
                                className="block py-2 bg-brand-dark text-white rounded-lg text-[11px] font-bold text-center hover:opacity-90 transition-colors"
                              >
                                生成材料
                              </Link>
                            </div>
                            <div className="flex gap-2 mt-auto">
                              <Link
                                to={`/product-scene?product=${p.id}&scene=customer`}
                                className="flex-1 py-2 bg-apple-blue/5 text-apple-blue rounded-lg text-[11px] font-bold text-center hover:bg-apple-blue/10 transition-colors"
                              >
                                对客户
                              </Link>
                              <Link
                                to={`/product-scene?product=${p.id}&scene=review`}
                                className="flex-1 py-2 bg-apple-purple/5 text-apple-purple rounded-lg text-[11px] font-bold text-center hover:bg-apple-purple/10 transition-colors"
                              >
                                对审查
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-8 sm:pt-10 md:pt-16 border-t border-brand-border/5">
                      <div className="flex items-center justify-between mb-6 sm:mb-8">
                        <h3 className="text-lg sm:text-xl font-bold text-brand-dark tracking-tight">更多实用工具</h3>
                        <button
                          onClick={() => setShowAllSkills(!showAllSkills)}
                          className="text-[10px] sm:text-xs font-bold text-brand-gray hover:text-brand-dark transition-all flex items-center gap-1"
                        >
                          {showAllSkills ? '收起' : '查看全部'}
                          <ChevronRight size={14} className={cn("transition-transform", showAllSkills && "rotate-90")} />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {relatedSkills
                          .filter(skill => !['sensitive-comm-assistant', 'chang-rong-bao', 'chang-yi-dan'].includes(skill.id))
                          .filter(skill => showAllSkills || ['cd-calculator', 'account-fee-discount'].includes(skill.id))
                          .map(skill => <SkillCard key={skill.id} skill={skill} />)}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {relatedSkills.length > 0 ? (
                      relatedSkills.map(skill => <SkillCard key={skill.id} skill={skill} runLabel="立即运行" />)
                    ) : (
                      <div className="col-span-full py-20 px-6 bg-white border border-brand-border/5 rounded-[2rem] text-center shadow-sm">
                        <div className="w-16 h-16 bg-brand-light-gray rounded-full flex items-center justify-center mx-auto mb-6">
                          <Search size={28} className="text-brand-gray opacity-30" />
                        </div>
                        <h4 className="text-xl font-bold text-brand-dark mb-2 tracking-tight">即将上线</h4>
                        <p className="text-sm text-brand-gray font-medium opacity-60 mb-8 max-w-md mx-auto">该场景下的更多 Skills 正在由业务专家与 Agent 团队共同打造中，敬请期待...</p>
                        <Link to="/feedback" className="inline-flex items-center gap-2 px-8 py-3 bg-brand-dark text-white rounded-full font-bold text-xs hover:bg-brand-dark/90 transition-all shadow-xl">
                          提交你的场景需求 <ArrowRight size={16} />
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
};

export default ScenarioCenter;
