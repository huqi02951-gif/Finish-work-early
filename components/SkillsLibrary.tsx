import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, ArrowRight, Database, LayoutDashboard, Zap, Sparkles } from 'lucide-react';
import { SKILLS } from '../constants/skills';
import { cn } from '../lib/utils';
import AppLayout from '../src/components/layout/AppLayout';

const SkillsLibrary: React.FC = () => {
  const [filter, setFilter] = useState<string>('全部');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filterOptions = ['全部', '在线可用', '本地工具', '需后端支持', '开发中/能力介绍'];

  const filteredSkills = SKILLS.filter(skill => {
    const skillStatuses = Array.isArray(skill.status) ? skill.status : [skill.status];
    const matchesFilter = filter === '全部' || skillStatuses.includes(filter as any);
    const matchesSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         skill.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <AppLayout title="Skills 工具库" showBack>
      <div className="pb-24 bg-brand-offwhite min-h-screen">
        {/* Apple Music Style Header */}
        <header className="px-6 pt-12 pb-8">
          <h1 className="text-4xl font-bold tracking-tight text-brand-dark mb-2">Skills 工具库</h1>
          <p className="text-brand-gray font-medium text-sm max-w-md">
            全量 Skills 展示与检索。每个 Skill 对应一个具体业务痛点，
            把经验、流程、模板、口径、测算逻辑固化下来。
          </p>
        </header>

        {/* Search and Filter */}
        <div className="px-6 mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gray" size={18} />
            <input 
              type="text" 
              placeholder="搜索技能名称、描述 or 关键词..." 
              className="w-full pl-11 pr-4 py-3 bg-brand-light-gray border border-brand-border/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-apple-blue/20 transition-all text-sm font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {filterOptions.map((option) => (
              <button
                key={option}
                onClick={() => setFilter(option)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap border",
                  filter === option 
                    ? "bg-brand-dark text-white border-brand-dark shadow-md" 
                    : "bg-white text-brand-gray border-brand-border/10 hover:bg-brand-light-gray"
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Skills Grid */}
        <div className="px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSkills.length > 0 ? (
            filteredSkills.map((skill) => (
              <div key={skill.id} className="bg-white p-6 rounded-3xl border border-brand-border/5 shadow-sm hover:shadow-xl transition-all group flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <span className="px-3 py-1 bg-brand-light-gray text-brand-dark text-[9px] font-bold uppercase tracking-widest rounded-full border border-brand-border/10">
                    {skill.category}
                  </span>
                  <div className="flex flex-wrap gap-1.5 justify-end">
                    {(Array.isArray(skill.status) ? skill.status : [skill.status]).map((status, idx) => (
                      <span key={idx} className={cn(
                        "text-[9px] font-bold px-2 py-0.5 rounded-full border",
                        status === '在线可用' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : 
                        status === '需后端支持' ? "bg-apple-blue/5 text-apple-blue border-apple-blue/10" :
                        status === '本地工具' ? "bg-orange-50 text-orange-600 border-orange-100" :
                        "bg-brand-light-gray text-brand-gray border-brand-border/10"
                      )}>
                        {status}
                      </span>
                    ))}
                  </div>
                </div>
                <h4 className="text-lg font-bold text-brand-dark mb-2 tracking-tight group-hover:text-apple-blue transition-colors">{skill.name}</h4>
                <p className="text-xs text-brand-gray mb-6 leading-relaxed flex-grow font-medium opacity-80">{skill.description}</p>
                
                <div className="space-y-3 mb-6 pt-4 border-t border-brand-border/5">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-lg bg-brand-light-gray flex items-center justify-center text-brand-gray mt-0.5">
                      <LayoutDashboard size={12} />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-brand-gray/50 uppercase tracking-widest mb-0.5">适用场景</p>
                      <p className="text-[11px] text-brand-dark font-bold">{skill.scene}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-lg bg-brand-light-gray flex items-center justify-center text-brand-gray mt-0.5">
                      <Zap size={12} />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-brand-gray/50 uppercase tracking-widest mb-0.5">核心输入</p>
                      <p className="text-[11px] text-brand-dark font-bold line-clamp-1">{skill.input.join('、')}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-brand-border/5">
                  <span className="text-[9px] text-brand-gray/40 font-bold uppercase tracking-widest">{skill.form}</span>
                  <Link to={`/skills/${skill.id}`} className="text-apple-blue text-xs font-bold flex items-center gap-1 hover:gap-2 transition-all">
                    查看详情 <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 px-6 bg-white border border-brand-border/5 rounded-3xl text-center shadow-sm">
              <div className="w-16 h-16 bg-brand-light-gray rounded-full flex items-center justify-center mx-auto mb-6 text-brand-gray/30">
                <Database size={32} />
              </div>
              <h3 className="text-xl font-bold text-brand-dark mb-2 tracking-tight">未找到匹配的 Skills</h3>
              <p className="text-sm text-brand-gray mb-8 font-medium opacity-60">尝试更换搜索词或筛选条件</p>
              <button 
                onClick={() => {setFilter('全部'); setSearchQuery('');}}
                className="px-8 py-3 bg-brand-dark text-white rounded-full text-xs font-bold hover:bg-brand-dark/90 transition-all shadow-lg"
              >
                重置搜索
              </button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default SkillsLibrary;
