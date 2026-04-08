import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, ShieldCheck, Briefcase, UserCheck, Sparkles, LayoutDashboard, Database, ChevronRight } from 'lucide-react';
import { SKILLS } from '../constants/skills';
import { cn } from '../lib/utils';

const Home: React.FC = () => {
  const scenarios = [
    { title: '对客户', icon: Users, desc: '把专业术语转化为客户听得懂的话，提升沟通效率。', color: 'bg-blue-50 text-blue-600', id: 'customer' },
    { title: '对审查', icon: ShieldCheck, desc: '自动生成结构化、规范化的报批文案，降低退件率。', color: 'bg-green-50 text-green-600', id: 'review' },
    { title: '对中后台', icon: Briefcase, desc: '提供标准字段、邮件模板和材料清单，协同更顺畅。', color: 'bg-purple-50 text-purple-600', id: 'backoffice' },
    { title: '对自己', icon: UserCheck, desc: '固化经验与逻辑，清晰指引下一步流程，减少事务性工作。', color: 'bg-orange-50 text-orange-600', id: 'self' },
  ];

  const featuredSkills = [
    SKILLS.find(s => s.id === 'sensitive-comm-assistant'),
    SKILLS.find(s => s.id === 'cd-calculator'),
    SKILLS.find(s => s.id === 'rate-discount-report'),
    SKILLS.find(s => s.id === 'discount-credit-workflow'),
  ].filter(Boolean) as typeof SKILLS;

  const getSkillCount = (scenarioTitle: string) => {
    return SKILLS.filter(skill => skill.scene.includes(scenarioTitle)).length;
  };

  return (
    <div className="flex flex-col animate-fade-in">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-white">
        {/* Subtle Background Elements */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-gold/5 blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-brand-accent/10 blur-[120px]"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center max-w-5xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-light-gray border border-brand-border/30 text-brand-gray text-[10px] font-bold tracking-[0.3em] uppercase rounded-full mb-10 animate-fade-in-up">
            <Sparkles size={12} className="text-brand-gold" /> 客户经理 Agent + Skills
          </div>
          
          <h1 className="font-serif text-6xl md:text-8xl font-bold leading-[1.1] text-brand-dark mb-10 tracking-tight animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            客户经理 Agent + Skills <br className="hidden md:block" />
            <span className="text-brand-gold italic font-normal">超级超级强</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-brand-gray font-medium leading-relaxed mb-16 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            将实战经验沉淀为可复用的数字技能。通过场景化驱动，实现业务流程标准化与话术模板化，让专业力量在每一次交互中精准释放。
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-8 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <Link 
              to="/scenarios" 
              className="group px-10 py-5 bg-brand-dark text-white rounded-full font-bold text-lg hover:bg-brand-dark/90 transition-all shadow-2xl hover:shadow-brand-dark/20 flex items-center gap-3"
            >
              <LayoutDashboard size={20} /> 进入场景中心
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              to="/skills" 
              className="group text-brand-dark font-bold text-lg flex items-center gap-2 hover:text-brand-gold transition-colors"
            >
              <Database size={20} /> 浏览 Skills 工具库
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Core Scenarios - Bento Grid Style */}
      <section className="py-32 bg-brand-light-gray/50 border-y border-brand-border/20">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mb-20">
            <h2 className="text-[11px] font-bold tracking-[0.4em] text-brand-gray uppercase mb-6">Core Scenarios</h2>
            <h3 className="font-serif text-4xl md:text-6xl text-brand-dark mb-8 tracking-tight">四大核心工作场景</h3>
            <p className="text-lg text-brand-gray leading-relaxed font-medium">
              针对银行一线客户经理的真实痛点，我们将工作场景拆解为四个维度，每个维度都由专属 Skills 提供支撑，实现全流程赋能。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {scenarios.map((s, idx) => (
              <Link 
                key={s.title} 
                to={`/scenarios?tab=${s.id}`}
                className="p-10 bg-white rounded-[2rem] border border-brand-border/10 hover:border-brand-gold/20 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-500 group relative overflow-hidden"
              >
                <div className="absolute top-8 right-8 text-[10px] font-bold text-brand-border group-hover:text-brand-gold transition-colors tracking-widest">
                  {getSkillCount(s.title)} SKILLS
                </div>
                <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-10 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm", s.color)}>
                  <s.icon size={32} />
                </div>
                <h4 className="font-serif text-3xl text-brand-dark mb-6 tracking-tight">{s.title}</h4>
                <p className="text-brand-gray text-sm leading-relaxed mb-10 font-medium opacity-80">{s.desc}</p>
                <div className="text-brand-gold text-[11px] font-bold flex items-center gap-2 uppercase tracking-widest group-hover:gap-3 transition-all">
                  Explore Scene <ChevronRight size={14} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Skills - Minimalist Cards */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-10">
            <div className="max-w-2xl">
              <h2 className="text-[11px] font-bold tracking-[0.4em] text-brand-gray uppercase mb-6">Featured Skills</h2>
              <h3 className="font-serif text-4xl md:text-6xl text-brand-dark mb-8 tracking-tight">精选技能展示</h3>
              <p className="text-lg text-brand-gray font-medium">
                这些技能已经过实战检验，能够显著提升客户经理在特定环节的作业效率与专业度。
              </p>
            </div>
            <Link to="/skills" className="group px-8 py-4 border-2 border-brand-dark text-brand-dark rounded-full font-bold hover:bg-brand-dark hover:text-white transition-all duration-300 flex items-center gap-2">
              查看全部工具库 <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredSkills.map((skill) => (
              <div key={skill.id} className="group bg-brand-light-gray/30 p-8 rounded-[2.5rem] border border-transparent hover:border-brand-border/30 hover:bg-white hover:shadow-2xl transition-all duration-500 flex flex-col">
                <div className="flex justify-between items-start mb-8">
                  <span className="px-3 py-1 bg-white text-brand-dark text-[10px] font-bold uppercase tracking-widest rounded-full border border-brand-border/20 shadow-sm">
                    {skill.category}
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    {(Array.isArray(skill.status) ? skill.status : [skill.status]).map((status, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full", 
                          status === '在线可用' ? "bg-emerald-500" : 
                          status === '需后端支持' ? "bg-blue-500" :
                          status === '本地工具' ? "bg-orange-500" :
                          "bg-brand-gray"
                        )}></div>
                        <span className="text-[10px] font-bold text-brand-dark uppercase tracking-widest">
                          {status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <h4 className="font-serif text-2xl text-brand-dark mb-4 tracking-tight leading-tight">{skill.name}</h4>
                <p className="text-brand-gray text-xs mb-8 line-clamp-3 font-medium leading-relaxed opacity-80 flex-grow">{skill.description}</p>
                
                <Link to={`/skills/${skill.id}`} className="w-full py-3.5 bg-white text-brand-dark border border-brand-border/30 rounded-2xl text-[12px] font-bold hover:bg-brand-dark hover:text-white hover:border-brand-dark transition-all duration-300 flex items-center justify-center gap-2 shadow-sm">
                  查看详情 <ChevronRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* System Console / CTA */}
      <section className="py-32 bg-brand-dark relative overflow-hidden font-mono">
        {/* Technical Background */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[repeating-linear-gradient(0deg,transparent,transparent_1px,rgba(255,255,255,0.1)_1px,rgba(255,255,255,0.1)_2px)] bg-[size:100%_3px]"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-6xl mx-auto bg-white/[0.02] border border-white/10 rounded-[3rem] p-10 md:p-20 backdrop-blur-3xl relative">
            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-brand-gold/30 rounded-tl-[3rem]"></div>
            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-brand-gold/30 rounded-br-[3rem]"></div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div>
                <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-brand-gold/10 border border-brand-gold/20 rounded-full mb-10">
                  <div className="w-2 h-2 rounded-full bg-brand-gold animate-pulse"></div>
                  <span className="text-[10px] font-bold text-brand-gold uppercase tracking-[0.3em]">System.Deployment.Active</span>
                </div>
                
                <h2 className="text-4xl md:text-6xl font-bold text-white mb-10 tracking-tighter leading-[1.1]">
                  开启你的 <br />
                  <span className="text-brand-gold">智能作业</span> 时代
                </h2>
                
                <p className="text-white/40 text-lg leading-relaxed mb-12 font-medium">
                  不再是简单的工具堆砌，而是深度理解业务逻辑的数字伙伴。<br />
                  加入共创，定义属于你的超级助手。
                </p>

                <div className="flex flex-wrap gap-6">
                  <Link to="/feedback" className="px-10 py-4 bg-brand-gold text-brand-dark rounded-2xl font-bold text-sm hover:bg-brand-gold/90 transition-all shadow-[0_0_30px_rgba(197,160,89,0.2)]">
                    申请试用 / 共创
                  </Link>
                  <Link to="/instructions" className="px-10 py-4 border border-white/10 text-white/60 rounded-2xl font-bold text-sm hover:bg-white/5 transition-all">
                    技术文档
                  </Link>
                </div>
              </div>

              <div className="hidden lg:block">
                <div className="bg-black/40 rounded-3xl border border-white/5 p-8 font-mono text-xs leading-relaxed text-white/60 shadow-2xl backdrop-blur-md">
                  <div className="flex gap-2 mb-8">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/20"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20"></div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="text-brand-gold opacity-80">$</span>
                      <span className="text-white/80">initialize agent_core --v1.0.4</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-emerald-500/80">&gt;</span>
                      <span className="text-emerald-500/60">Loading scenario_matrix... [DONE]</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-emerald-500/80">&gt;</span>
                      <span className="text-emerald-500/60">Connecting to skills_db... [OK]</span>
                    </div>
                    <div className="h-px w-full bg-white/5 my-4"></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-white/20 uppercase tracking-widest text-[9px]">Active Skills</p>
                        <p className="text-white/60 text-lg font-bold">{SKILLS.length}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-white/20 uppercase tracking-widest text-[9px]">System Latency</p>
                        <p className="text-white/60 text-lg font-bold">24ms</p>
                      </div>
                    </div>
                    <div className="h-px w-full bg-white/5 my-4"></div>
                    <div className="flex items-center gap-3">
                      <span className="animate-pulse text-brand-gold">_</span>
                      <span className="text-white/40">waiting for user input...</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
