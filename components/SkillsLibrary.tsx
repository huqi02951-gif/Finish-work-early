import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Database, LayoutDashboard, Zap, ChevronRight } from 'lucide-react';
import AppLayout from '../src/components/layout/AppLayout';
import { SKILLS } from '../constants/skills';
import { SKILLS_LIBRARY_PAGE_DEFAULT_CONFIG } from '../content/pageConfigDefaults';
import { cn } from '../lib/utils';
import { getPageConfig, getSkills } from '../src/services/contentApi';
import type { Skill } from '../types';

const SkillsLibrary: React.FC = () => {
  const [filter, setFilter] = useState<string>('全部');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [skills, setSkills] = useState<Skill[]>(SKILLS);
  const [pageConfig, setPageConfig] = useState(SKILLS_LIBRARY_PAGE_DEFAULT_CONFIG);

  useEffect(() => {
    let cancelled = false;

    getSkills()
      .then((response) => {
        if (!cancelled && response.length > 0) {
          setSkills(response);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSkills(SKILLS);
        }
      });

    getPageConfig('skills_library_page')
      .then((config) => {
        if (!cancelled) {
          setPageConfig(config);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPageConfig(SKILLS_LIBRARY_PAGE_DEFAULT_CONFIG);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filterOptions = useMemo(
    () =>
      pageConfig.filterOptions?.length
        ? pageConfig.filterOptions
        : SKILLS_LIBRARY_PAGE_DEFAULT_CONFIG.filterOptions,
    [pageConfig.filterOptions],
  );

  const filteredSkills = skills.filter((skill) => {
    const skillStatuses = Array.isArray(skill.status) ? skill.status : [skill.status];
    const matchesFilter = filter === '全部' || skillStatuses.includes(filter as any);
    const keyword = searchQuery.toLowerCase();
    const matchesSearch =
      skill.name.toLowerCase().includes(keyword) || skill.description.toLowerCase().includes(keyword);

    return matchesFilter && matchesSearch;
  });

  return (
    <AppLayout title="Skills 工具库" showBack>
      <div className="pb-24 bg-brand-offwhite min-h-screen">
        <header className="px-6 pt-10 sm:pt-12 pb-6 sm:pb-8">
          <div className="inline-block px-3 py-1 rounded-full bg-brand-dark/5 text-[8px] sm:text-[9px] font-bold tracking-[0.2em] sm:tracking-[0.3em] uppercase mb-4 sm:mb-6 opacity-40">
            {pageConfig.badgeText}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-brand-dark mb-2">
            {pageConfig.title}
          </h1>
          <p className="text-brand-gray font-medium text-xs sm:text-sm max-w-md opacity-70">
            {pageConfig.subtitle}
          </p>
        </header>

        <div className="px-6 mb-6 sm:mb-8 space-y-3 sm:space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gray w-4 h-4 sm:w-[18px] sm:h-[18px]" />
            <input
              type="text"
              placeholder="搜索技能名称、描述 or 关键词..."
              className="w-full pl-11 pr-4 py-2.5 sm:py-3 bg-brand-light-gray border border-brand-border/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-apple-blue/20 transition-all text-xs sm:text-sm font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-2 flex-wrap pb-2">
            {filterOptions.map((option) => (
              <button
                key={option}
                onClick={() => setFilter(option)}
                className={cn(
                  'px-3 sm:px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-bold transition-all whitespace-nowrap border',
                  filter === option
                    ? 'bg-brand-dark text-white border-brand-dark shadow-md'
                    : 'bg-white text-brand-gray border-brand-border/10 hover:bg-brand-light-gray',
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="px-6 mb-4 flex justify-between items-center animate-fade-in">
          <span className="text-[10px] sm:text-xs text-brand-gray font-bold tracking-widest uppercase">
            {searchQuery || filter !== '全部' ? `共找到 ${filteredSkills.length} 个结果` : `共 ${filteredSkills.length} 个工具`}
          </span>
        </div>

        <div className="px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredSkills.length > 0 ? (
            filteredSkills.map((skill) => {
              const skillStatuses = Array.isArray(skill.status) ? skill.status : [skill.status];
              const isOnline = skillStatuses.includes('在线可用');

              return (
                <div
                  key={skill.id}
                  className="bg-white p-5 sm:p-6 rounded-3xl border border-brand-border/5 shadow-sm hover:shadow-xl transition-all group flex flex-col"
                >
                  <div className="flex justify-between items-start mb-4 sm:mb-6">
                    <span className="px-2.5 py-0.5 bg-brand-light-gray text-brand-dark text-[8px] sm:text-[9px] font-bold uppercase tracking-widest rounded-full border border-brand-border/10">
                      {skill.category}
                    </span>
                    <div className="flex flex-wrap gap-1 justify-end">
                      {skillStatuses.map((status, idx) => (
                        <span
                          key={`${skill.id}-${idx}`}
                          className={cn(
                            'text-[8px] sm:text-[9px] font-bold px-2 py-0.5 rounded-full border',
                            status === '在线可用'
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                              : status === '需后端支持'
                                ? 'bg-apple-blue/5 text-apple-blue border-apple-blue/10'
                                : status === '本地工具'
                                  ? 'bg-orange-50 text-orange-600 border-orange-100'
                                  : 'bg-brand-light-gray text-brand-gray border-brand-border/10',
                          )}
                        >
                          {status}
                        </span>
                      ))}
                    </div>
                  </div>

                  <h4 className="text-base sm:text-lg font-bold text-brand-dark mb-1.5 sm:mb-2 tracking-tight group-hover:text-apple-blue transition-colors">
                    {skill.name}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-brand-gray mb-6 leading-relaxed flex-grow font-medium opacity-80">
                    {skill.description}
                  </p>

                  <div className="space-y-2.5 sm:space-y-3 mb-5 sm:mb-6 pt-4 border-t border-brand-border/5">
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-lg bg-brand-light-gray flex items-center justify-center text-brand-gray mt-0.5 shrink-0">
                        <LayoutDashboard size={12} />
                      </div>
                      <div>
                        <p className="text-[8px] sm:text-[9px] font-bold text-brand-gray/50 uppercase tracking-widest mb-0.5">
                          适用场景
                        </p>
                        <p className="text-[10px] sm:text-[11px] text-brand-dark font-bold">{skill.scene}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-lg bg-brand-light-gray flex items-center justify-center text-brand-gray mt-0.5 shrink-0">
                        <Zap size={12} />
                      </div>
                      <div>
                        <p className="text-[8px] sm:text-[9px] font-bold text-brand-gray/50 uppercase tracking-widest mb-0.5">
                          核心输入
                        </p>
                        <p className="text-[10px] sm:text-[11px] text-brand-dark font-bold line-clamp-1">
                          {skill.input.join('、')}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-brand-border/5">
                    <span className="text-[9px] text-brand-gray/40 font-bold uppercase tracking-widest">
                      {skill.form}
                    </span>
                    <div className="flex items-center gap-3">
                      <Link
                        to={`/skills/${skill.id}`}
                        className="text-brand-gray text-[11px] font-bold hover:text-brand-dark transition-all"
                      >
                        详情
                      </Link>
                      {isOnline && skill.toolRoute && (
                        <Link
                          to={skill.toolRoute}
                          className="text-apple-blue text-[11px] font-bold flex items-center gap-1 hover:gap-2 transition-all bg-apple-blue/5 px-3 py-1.5 rounded-lg"
                        >
                          立即运行 <ChevronRight size={14} />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-20 px-6 bg-white border border-brand-border/5 rounded-3xl text-center shadow-sm">
              <div className="w-16 h-16 bg-brand-light-gray rounded-full flex items-center justify-center mx-auto mb-6 text-brand-gray/30">
                <Database size={32} />
              </div>
              <h3 className="text-xl font-bold text-brand-dark mb-2 tracking-tight">
                {pageConfig.emptyState.title}
              </h3>
              <p className="text-sm text-brand-gray mb-8 font-medium opacity-60">
                {pageConfig.emptyState.description}
              </p>
              <button
                onClick={() => {
                  setFilter('全部');
                  setSearchQuery('');
                }}
                className="px-8 py-3 bg-brand-dark text-white rounded-full text-xs font-bold hover:bg-brand-dark/90 transition-all shadow-lg"
              >
                {pageConfig.emptyState.resetLabel}
              </button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default SkillsLibrary;
