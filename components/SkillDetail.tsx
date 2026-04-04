import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Zap, LayoutDashboard, Users, FileText, Download, Play, AlertCircle, Info, ArrowRight, ChevronRight, Sparkles } from 'lucide-react';
import { SKILLS } from '../constants/skills';
import { cn } from '../lib/utils';

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

  return (
    <div className="py-24 bg-brand-offwhite min-h-screen">
      <div className="container mx-auto px-6">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-3 text-brand-gray hover:text-brand-dark transition-all mb-16 group font-bold text-sm uppercase tracking-widest opacity-60 hover:opacity-100"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 返回上一页
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-16">
            <div className="bg-white p-12 md:p-16 rounded-[3rem] border border-brand-border/10 shadow-sm hover:shadow-xl transition-all duration-700">
              <div className="flex flex-wrap justify-between items-start mb-12 gap-8">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="px-4 py-1.5 bg-brand-light-gray text-brand-dark text-[10px] font-bold uppercase tracking-[0.2em] rounded-full border border-brand-border/20">
                      {skill.category}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <div className={cn("w-1.5 h-1.5 rounded-full", skill.status === '在线可用' ? "bg-emerald-500" : "bg-brand-gray")}></div>
                      <span className="text-[10px] font-bold text-brand-dark uppercase tracking-widest">
                        {skill.status}
                      </span>
                    </div>
                  </div>
                  <h1 className="font-serif text-5xl md:text-6xl text-brand-dark tracking-tight leading-tight">{skill.name}</h1>
                </div>
              </div>

              <div className="relative mb-16">
                <div className="absolute top-0 left-0 w-1 h-full bg-brand-gold rounded-full opacity-30"></div>
                <p className="text-2xl text-brand-gray leading-relaxed pl-10 font-medium opacity-80">
                  {skill.description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                <div className="bg-brand-light-gray/30 p-10 rounded-[2.5rem] border border-brand-border/5">
                  <h3 className="flex items-center gap-3 text-[11px] font-bold text-brand-gray uppercase tracking-[0.3em] mb-8 opacity-60">
                    <Zap size={16} className="text-brand-gold" /> 输入参数
                  </h3>
                  <ul className="space-y-6">
                    {skill.input.map(item => (
                      <li key={item} className="flex items-center gap-4 text-brand-dark font-medium text-lg">
                        <div className="w-2 h-2 rounded-full bg-brand-gold/40"></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-brand-light-gray/30 p-10 rounded-[2.5rem] border border-brand-border/5">
                  <h3 className="flex items-center gap-3 text-[11px] font-bold text-brand-gray uppercase tracking-[0.3em] mb-8 opacity-60">
                    <FileText size={16} className="text-brand-gold" /> 输出成果
                  </h3>
                  <ul className="space-y-6">
                    {skill.output.map(item => (
                      <li key={item} className="flex items-center gap-4 text-brand-dark font-medium text-lg">
                        <CheckCircle2 size={20} className="text-emerald-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Preview / Demo Area */}
            <div className="bg-brand-dark rounded-[3.5rem] p-16 md:p-24 text-center relative overflow-hidden shadow-2xl group">
               <div className="absolute inset-0 opacity-20 pointer-events-none transition-opacity duration-700 group-hover:opacity-30">
                  <div className="w-full h-full bg-[radial-gradient(circle_at_center,#C5A059_0%,transparent_70%)]"></div>
               </div>
               <div className="relative z-10 max-w-2xl mx-auto">
                  <div className="w-20 h-20 bg-brand-gold/10 rounded-3xl flex items-center justify-center mx-auto mb-10 border border-brand-gold/20">
                    <Sparkles size={40} className="text-brand-gold" />
                  </div>
                  <h3 className="font-serif text-4xl md:text-5xl text-white mb-8 tracking-tight">立即开始使用</h3>
                  <p className="text-lg text-white/60 mb-12 leading-relaxed font-medium">
                    {skill.status === '在线可用' 
                      ? '该工具已在线部署，你可以直接输入参数并生成结果。' 
                      : '该工具目前需要特定的运行环境，请根据下方指引进行操作。'}
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center gap-6">
                    {skill.status === '在线可用' ? (
                      <button 
                        onClick={() => skill.toolRoute ? navigate(skill.toolRoute) : alert('该工具正在部署中...')}
                        className="px-12 py-5 bg-brand-gold text-brand-dark rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-brand-gold/40 transition-all flex items-center justify-center gap-3 active:scale-95"
                      >
                        <Play size={24} /> 在线运行
                      </button>
                    ) : (
                      <button className="px-12 py-5 bg-white/10 text-white border border-white/20 rounded-2xl font-bold text-lg hover:bg-white/20 transition-all flex items-center justify-center gap-3 active:scale-95">
                        <Download size={24} /> 下载工具包
                      </button>
                    )}
                    <Link to="/instructions" className="px-12 py-5 border border-white/10 text-white rounded-2xl font-bold text-lg hover:bg-white/20 transition-all flex items-center justify-center gap-3 active:scale-95">
                      <Info size={24} /> 查看说明
                    </Link>
                  </div>
               </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="lg:col-span-4 space-y-10">
            <div className="bg-white p-10 rounded-[2.5rem] border border-brand-border/10 shadow-sm">
              <h3 className="text-[11px] font-bold text-brand-gray uppercase tracking-[0.3em] mb-10 opacity-60">基本信息</h3>
              <div className="space-y-10">
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-brand-light-gray flex items-center justify-center text-brand-gray border border-brand-border/10">
                    <LayoutDashboard size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-brand-gray uppercase tracking-[0.2em] mb-2 opacity-60">适用场景</p>
                    <p className="text-lg text-brand-dark font-bold tracking-tight">{skill.scene}</p>
                  </div>
                </div>
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-brand-light-gray flex items-center justify-center text-brand-gray border border-brand-border/10">
                    <Users size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-brand-gray uppercase tracking-[0.2em] mb-2 opacity-60">面向对象</p>
                    <p className="text-lg text-brand-dark font-bold tracking-tight">{skill.audience.join('、')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-brand-light-gray flex items-center justify-center text-brand-gray border border-brand-border/10">
                    <Zap size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-brand-gray uppercase tracking-[0.2em] mb-2 opacity-60">当前形态</p>
                    <p className="text-lg text-brand-dark font-bold tracking-tight">{skill.form}</p>
                  </div>
                </div>
              </div>
            </div>

            {skill.note && (
              <div className="bg-orange-50/50 p-10 rounded-[2.5rem] border border-orange-100/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-orange-400/5 rounded-full -mr-12 -mt-12"></div>
                <div className="flex items-center gap-3 text-orange-700 font-bold text-sm mb-6">
                  <AlertCircle size={20} /> 特别说明
                </div>
                <p className="text-orange-800/80 text-sm leading-relaxed font-medium">
                  {skill.note}
                </p>
              </div>
            )}

            <div className="bg-brand-dark p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-brand-gold/5 rounded-full -mr-16 -mb-16 transition-transform duration-700 group-hover:scale-150"></div>
              <h3 className="font-serif text-2xl mb-6 tracking-tight">需要定制开发？</h3>
              <p className="text-white/60 text-sm mb-8 leading-relaxed font-medium">
                如果该 Skill 无法完全满足你的业务需求，欢迎申请共创定制。
              </p>
              <Link to="/feedback" className="text-brand-gold text-sm font-bold flex items-center gap-2 hover:gap-4 transition-all">
                申请共创 <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillDetail;
