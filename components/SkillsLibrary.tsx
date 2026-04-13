/**
 * SkillsLibrary — Skills 工具库
 *
 * 改造点：
 * 1. 新增场景标签筛选（对客户/对审查/对中后台/对自己）
 * 2. 卡片风格从宣传式改为工具式紧凑风格
 * 3. 强化：名称、标签、适用场景、核心输入、立即使用
 * 4. 弱化：大段描述文案
 *
 * 数据来源优先级：API > 本地 SKILLS 常量
 * 后续接数据库时，只需调整 getSkills() 即可。
 */
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronRight, Zap, Users, ShieldCheck, Briefcase, User } from 'lucide-react';
import AppLayout from '../src/components/layout/AppLayout';
import { SKILLS } from '../constants/skills';
import { SKILLS_LIBRARY_PAGE_DEFAULT_CONFIG, SCENE_TAG_OPTIONS } from '../content/pageConfigDefaults';
import { cn } from '../lib/utils';
import { getPageConfig, getSkills } from '../src/services/contentApi';
import type { Skill, SceneTag } from '../types';

/* ─── Scene tag icon mapping ─── */
const SCENE_ICON: Record<string, React.ElementType> = {
  '对客户': Users,
  '对审查': ShieldCheck,
  '对中后台': Briefcase,
  '对自己': User,
};
const SCENE_COLOR: Record<string, string> = {
  '对客户': 'bg-apple-blue/10 text-apple-blue border-apple-blue/20',
  '对审查': 'bg-apple-purple/10 text-apple-purple border-apple-purple/20',
  '对中后台': 'bg-apple-indigo/10 text-apple-indigo border-apple-indigo/20',
  '对自己': 'bg-apple-pink/10 text-apple-pink border-apple-pink/20',
};

const SkillsLibrary: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>('全部');
  const [sceneFilter, setSceneFilter] = useState<string>('全部场景');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [skills, setSkills] = useState<Skill[]>(SKILLS);
  const [pageConfig, setPageConfig] = useState(SKILLS_LIBRARY_PAGE_DEFAULT_CONFIG);

  useEffect(() => {
    let cancelled = false;

    getSkills()
      .then((response) => {
        if (!cancelled && response.length > 0) setSkills(response);
      })
      .catch(() => {
        if (!cancelled) setSkills(SKILLS);
      });

    getPageConfig('skills_library_page')
      .then((config) => {
        if (!cancelled) setPageConfig(config);
      })
      .catch(() => {
        if (!cancelled) setPageConfig(SKILLS_LIBRARY_PAGE_DEFAULT_CONFIG);
      });

    return () => { cancelled = true; };
  }, []);

  const filterOptions = useMemo(
    () => pageConfig.filterOptions?.length ? pageConfig.filterOptions : SKILLS_LIBRARY_PAGE_DEFAULT_CONFIG.filterOptions,
    [pageConfig.filterOptions],
  );

  const filteredSkills = useMemo(() => {
    return skills.filter((skill) => {
      // Status filter
      const skillStatuses = Array.isArray(skill.status) ? skill.status : [skill.status];
      const matchesStatus = statusFilter === '全部' || skillStatuses.includes(statusFilter as any);

      // Scene tag filter
      const matchesScene = sceneFilter === '全部场景' ||
        (skill.sceneTags && skill.sceneTags.includes(sceneFilter as SceneTag));

      // Search
      const keyword = searchQuery.toLowerCase();
      const matchesSearch = skill.name.toLowerCase().includes(keyword) ||
        skill.description.toLowerCase().includes(keyword) ||
        skill.category.toLowerCase().includes(keyword);

      return matchesStatus && matchesScene && matchesSearch;
    });
  }, [skills, statusFilter, sceneFilter, searchQuery]);

  return (
    <AppLayout title="Skills 工具库" showBack>
      <div className="pb-24 bg-brand-offwhite min-h-screen">
        {/* Header */}
        <header className="px-6 pt-8 pb-4">
          <h1 className="text-2xl font-bold tracking-tight text-brand-dark mb-1">{pageConfig.title}</h1>
          <p className="text-brand-gray font-medium text-xs opacity-70">{pageConfig.subtitle}</p>
        </header>

        {/* Filters */}
        <div className="px-6 mb-4 space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-gray w-4 h-4" />
            <input
              type="text"
              placeholder="搜索工具名称或关键词..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-brand-border/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-apple-blue/20 transition-all text-xs font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Scene Tag Filter — 核心新增 */}
          <div className="flex gap-1.5 flex-wrap">
            {SCENE_TAG_OPTIONS.map((tag) => {
              const Icon = SCENE_ICON[tag];
              return (
                <button
                  key={tag}
                  onClick={() => setSceneFilter(tag)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap border flex items-center gap-1.5',
                    sceneFilter === tag
                      ? 'bg-brand-dark text-white border-brand-dark shadow-sm'
                      : 'bg-white text-brand-gray border-brand-border/10 hover:bg-brand-light-gray',
                  )}
                >
                  {Icon && <Icon size={12} />}
                  {tag}
                </button>
              );
            })}
          </div>

          {/* Status Filter */}
          <div className="flex gap-1.5 flex-wrap">
            {filterOptions.map((option) => (
              <button
                key={option}
                onClick={() => setStatusFilter(option)}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap border',
                  statusFilter === option
                    ? 'bg-brand-dark/80 text-white border-brand-dark/80'
                    : 'bg-white text-brand-gray/60 border-brand-border/5 hover:bg-brand-light-gray',
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Count */}
        <div className="px-6 mb-3">
          <span className="text-[10px] text-brand-gray font-bold tracking-widest uppercase">
            共 {filteredSkills.length} 个工具
          </span>
        </div>

        {/* Skills Grid — 紧凑工具式卡片 */}
        <div className="px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredSkills.length > 0 ? (
            filteredSkills.map((skill) => {
              const skillStatuses = Array.isArray(skill.status) ? skill.status : [skill.status];
              const isOnline = skillStatuses.includes('在线可用');

              return (
                <div
                  key={skill.id}
                  className="bg-white p-4 rounded-xl border border-brand-border/5 shadow-sm hover:shadow-md transition-all group flex flex-col"
                >
                  {/* Top: Name + Status */}
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-bold text-brand-dark tracking-tight group-hover:text-apple-blue transition-colors leading-tight flex-1 mr-2">
                      {skill.name}
                    </h4>
                    <div className={cn(
                      'shrink-0 w-2 h-2 rounded-full mt-1.5',
                      isOnline ? 'bg-emerald-500' : 'bg-brand-gray/30',
                    )} />
                  </div>

                  {/* Scene Tags */}
                  {skill.sceneTags && skill.sceneTags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {skill.sceneTags.map((tag) => (
                        <span
                          key={tag}
                          className={cn(
                            'text-[8px] font-bold px-1.5 py-0.5 rounded border',
                            SCENE_COLOR[tag] || 'bg-brand-light-gray text-brand-gray border-brand-border/10',
                          )}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Brief: scene + input */}
                  <div className="text-[10px] text-brand-gray/70 font-medium mb-3 space-y-0.5">
                    <p className="truncate"><span className="text-brand-gray/40 mr-1">输入:</span>{skill.input.slice(0, 3).join('、')}{skill.input.length > 3 ? '...' : ''}</p>
                  </div>

                  {/* Bottom: category + actions */}
                  <div className="flex items-center justify-between mt-auto pt-2.5 border-t border-brand-border/5">
                    <span className="text-[8px] text-brand-gray/40 font-bold uppercase tracking-widest truncate max-w-[40%]">
                      {skill.category}
                    </span>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/skills/${skill.id}`}
                        className="text-brand-gray text-[10px] font-bold hover:text-brand-dark transition-all"
                      >
                        详情
                      </Link>
                      {isOnline && skill.toolRoute && (
                        <Link
                          to={skill.toolRoute}
                          className="text-apple-blue text-[10px] font-bold flex items-center gap-0.5 hover:gap-1 transition-all bg-apple-blue/5 px-2 py-1 rounded-lg"
                        >
                          使用 <ChevronRight size={12} />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-16 px-6 bg-white border border-brand-border/5 rounded-2xl text-center shadow-sm">
              <h3 className="text-lg font-bold text-brand-dark mb-2 tracking-tight">
                {pageConfig.emptyState.title}
              </h3>
              <p className="text-sm text-brand-gray mb-6 font-medium opacity-60">
                {pageConfig.emptyState.description}
              </p>
              <button
                onClick={() => { setStatusFilter('全部'); setSceneFilter('全部场景'); setSearchQuery(''); }}
                className="px-6 py-2.5 bg-brand-dark text-white rounded-xl text-xs font-bold hover:bg-brand-dark/90 transition-all shadow-lg"
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
