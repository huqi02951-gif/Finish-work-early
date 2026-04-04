import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, ArrowRight, Database, LayoutDashboard, Zap, Sparkles } from 'lucide-react';
import { SKILLS } from '../constants/skills';
import { cn } from '../lib/utils';

const SkillsLibrary: React.FC = () => {
  const [filter, setFilter] = useState<string>('全部');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filterOptions = ['全部', '在线可用', '本地工具', '需后端支持', '开发中/能力介绍'];

  const filteredSkills = SKILLS.filter(skill => {
    const matchesFilter = filter === '全部' || skill.status === filter;
    const matchesSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         skill.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="py-24 bg-brand-offwhite min-h-screen">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mb-20 animate-fade-in-up">
          <h1 className="font-serif text-5xl md:text-6xl text-brand-dark mb-8">Skills 工具库</h1>
          <p className="text-xl text-stone-500 leading-relaxed">
            全量 Skills 展示与检索。每个 Skill 对应一个具体业务痛点，
            把经验、流程、模板、口径、测算逻辑固化下来。
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white p-6 rounded-xl border border-stone-100 shadow-sm mb-12 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
              <input 
                type="text" 
                placeholder="搜索技能名称、描述或关键词..." 
                className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
              <div className="flex items-center gap-2 text-stone-400 mr-2">
                <Filter size={18} />
                <span className="text-sm font-bold uppercase tracking-widest">筛选状态</span>
              </div>
              {filterOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => setFilter(option)}
                  className={cn(
                    "px-4 py-2 rounded-md text-sm font-medium transition-all",
                    filter === option 
                      ? "bg-brand-dark text-white shadow-lg" 
                      : "bg-stone-50 text-stone-600 hover:bg-stone-100"
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {filteredSkills.length > 0 ? (
            filteredSkills.map((skill) => (
              <div key={skill.id} className="bg-white p-8 rounded-xl border border-stone-100 shadow-sm hover:shadow-xl transition-all group flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <span className="px-3 py-1 bg-brand-gold/10 text-brand-gold text-[10px] font-bold uppercase tracking-wider rounded-full border border-brand-gold/20">
                    {skill.category}
                  </span>
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded",
                    skill.status === '在线可用' ? "bg-green-100 text-green-700" : 
                    skill.status === '需后端支持' ? "bg-blue-100 text-blue-700" :
                    skill.status === '本地工具' ? "bg-orange-100 text-orange-700" :
                    "bg-stone-100 text-stone-600"
                  )}>
                    {skill.status}
                  </span>
                </div>
                <h4 className="font-serif text-2xl text-brand-dark mb-4 group-hover:text-brand-gold transition-colors">{skill.name}</h4>
                <p className="text-stone-500 text-sm mb-6 leading-relaxed flex-grow">{skill.description}</p>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded bg-stone-50 flex items-center justify-center text-stone-400 mt-0.5">
                      <LayoutDashboard size={12} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">适用场景</p>
                      <p className="text-xs text-stone-600">{skill.scene}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded bg-stone-50 flex items-center justify-center text-stone-400 mt-0.5">
                      <Zap size={12} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">核心输入</p>
                      <p className="text-xs text-stone-600 line-clamp-1">{skill.input.join('、')}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-stone-50">
                  <span className="text-[10px] text-stone-400 font-medium uppercase tracking-widest">{skill.form}</span>
                  <Link to={`/skills/${skill.id}`} className="text-brand-gold text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">
                    查看详情 <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-24 px-8 bg-white border border-stone-100 rounded-xl text-center shadow-sm">
              <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6 text-stone-300">
                <Database size={32} />
              </div>
              <h3 className="font-serif text-2xl text-brand-dark mb-2">未找到匹配的 Skills</h3>
              <p className="text-stone-400 mb-8">尝试更换搜索词或筛选条件</p>
              <button 
                onClick={() => {setFilter('全部'); setSearchQuery('');}}
                className="px-6 py-2 bg-brand-dark text-white rounded-md text-sm font-bold hover:bg-brand-dark/90 transition-all"
              >
                重置搜索
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillsLibrary;
