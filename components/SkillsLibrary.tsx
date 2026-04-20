/**
 * SkillsLibrary — Skills 工具库
 *
 * 改造点（精修版）：
 * 1. 顶部分类筛选为横向滑动胶囊 (Pill Tabs)
 * 2. 状态筛选极简状态灯指示
 * 3. 卡片重排为密集 List Cards
 * 4. “对自己”类别下的小锁图标与星标置顶前端逻辑
 */
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronRight, Users, ShieldCheck, Briefcase, User, Lock, Star, Cloud, Code, Monitor, Loader2 } from 'lucide-react';
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
  '对自己': UserIconWrapper, // specific wrapper to allow lock usage
  '全部场景': Briefcase,
};

function UserIconWrapper({ className }: { className?: string }) {
  return <User className={className} />;
}

const SCENE_COLOR: Record<string, string> = {
  '对客户': 'bg-blue-50 text-blue-600 border-blue-200',
  '对审查': 'bg-purple-50 text-purple-600 border-purple-200',
  '对中后台': 'bg-indigo-50 text-indigo-600 border-indigo-200',
  '对自己': 'bg-slate-50 text-slate-600 border-slate-200',
};

const getStatusBadge = (statusStr: string) => {
  if (statusStr.includes('在线可用')) {
    return <span className="flex items-center gap-1 bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> 在线可用</span>;
  }
  if (statusStr.includes('本地工具')) {
    return <span className="flex items-center gap-1 bg-neutral-100 text-neutral-600 border border-neutral-300 px-2 py-0.5 rounded-full text-[10px] font-bold"><Monitor size={10} /> 本地工具</span>;
  }
  if (statusStr.includes('需要后端支持')) {
    return <span className="flex items-center gap-1 bg-sky-50 text-sky-600 border border-sky-200 px-2 py-0.5 rounded-full text-[10px] font-bold"><Cloud size={10} /> 需后端</span>;
  }
  return <span className="flex items-center gap-1 text-neutral-500 border border-dashed border-neutral-300 px-2 py-0.5 rounded-full text-[10px] font-bold opacity-80"><Code size={10} /> 开发中</span>;
};


const SkillsLibrary: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>('全部');
  const [sceneFilter, setSceneFilter] = useState<string>('全部场景');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [skills, setSkills] = useState<Skill[]>(SKILLS);
  const [pageConfig, setPageConfig] = useState(SKILLS_LIBRARY_PAGE_DEFAULT_CONFIG);
  const [starredIds, setStarredIds] = useState<Record<string, boolean>>({});

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

    // Load starred
    const savedStars = localStorage.getItem('starred_skills');
    if (savedStars) setStarredIds(JSON.parse(savedStars));

    return () => { cancelled = true; };
  }, []);

  const toggleStar = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const newStars = { ...starredIds, [id]: !starredIds[id] };
    setStarredIds(newStars);
    localStorage.setItem('starred_skills', JSON.stringify(newStars));
  }

  const filterOptions = useMemo(
    () => pageConfig.filterOptions?.length ? pageConfig.filterOptions : SKILLS_LIBRARY_PAGE_DEFAULT_CONFIG.filterOptions,
    [pageConfig.filterOptions],
  );

  const filteredSkills = useMemo(() => {
    const list = skills.filter((skill) => {
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

    // Sort starred first
    return list.sort((a, b) => {
      if (starredIds[a.id] && !starredIds[b.id]) return -1;
      if (!starredIds[a.id] && starredIds[b.id]) return 1;
      return 0;
    });
  }, [skills, statusFilter, sceneFilter, searchQuery, starredIds]);

  return (
    <AppLayout title="仓库" showBack theme="default">
      <div className="pb-24 bg-[#F5F6FA] min-h-[100dvh]">
        {/* Header (Sticky background) */}
        <div className="sticky top-14 z-40 bg-[#F5F6FA]/80 backdrop-blur-lg pt-4 pb-2 px-4 shadow-[0_4px_24px_rgba(245,246,250,0.8)] -mx-px">
           
          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400/70 w-4 h-4" />
            <input
              type="text"
              placeholder="搜索技能或场景..."
              className="w-full pl-10 pr-4 py-2 bg-white/60 border border-neutral-200/40 rounded-[12px] focus:outline-none focus:bg-white focus:border-neutral-300 transition-all text-sm font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Scene Tag Pill Tabs */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 snap-x">
             <button
                onClick={() => setSceneFilter('全部场景')}
                className={cn(
                  'snap-start shrink-0 px-4 py-1.5 rounded-full text-xs font-extrabold transition-all border',
                  sceneFilter === '全部场景'
                    ? 'bg-neutral-800 text-white border-neutral-800 shadow-md'
                    : 'bg-white text-neutral-600 border-neutral-200/80 hover:bg-neutral-50',
                )}
             >
                全部场景
             </button>
            {SCENE_TAG_OPTIONS.map((tag) => {
              if (tag === '全部场景') return null; // handled
              const isSelf = tag === '对自己';
              return (
                <button
                  key={tag}
                  onClick={() => setSceneFilter(tag)}
                  className={cn(
                    'snap-start shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all border flex items-center gap-1.5',
                    sceneFilter === tag
                      ? (isSelf ? 'bg-slate-700 text-white border-slate-700 shadow-md' : 'bg-blue-600 text-white border-blue-600 shadow-md')
                      : 'bg-white text-neutral-600 border-neutral-200/80',
                  )}
                >
                  {isSelf && <Lock size={12} className={sceneFilter === tag ? "opacity-90" : "opacity-40"} />} 
                  {!isSelf && SCENE_ICON[tag] && React.createElement(SCENE_ICON[tag] as any, { size: 12 })}
                  {tag}
                </button>
              );
            })}
          </div>
          
          {/* Status Segmented Control */}
           <div className="flex gap-1.5 overflow-x-auto no-scrollbar mt-3 pb-1 -mx-4 px-4">
            {filterOptions.map((option) => (
              <button
                key={option}
                onClick={() => setStatusFilter(option)}
                className={cn(
                  'shrink-0 px-3 py-1 rounded-[8px] text-[10px] font-bold transition-all border',
                  statusFilter === option
                    ? 'bg-neutral-200 text-neutral-800 border-transparent shadow-sm'
                    : 'bg-transparent text-neutral-400 border-transparent hover:text-neutral-600',
                )}
              >
                {option}
              </button>
            ))}
          </div>

        </div>

        {/* Count */}
        <div className="px-5 pt-4 pb-2 flex items-center justify-between">
          <span className="text-[11px] text-neutral-400 font-extrabold tracking-widest uppercase">
            检索结果: {filteredSkills.length}
          </span>
        </div>

        {/* Dense List Cards */}
        <div className="px-4 flex flex-col gap-3">
          {filteredSkills.length > 0 ? (
            filteredSkills.map((skill) => {
              const isSelf = skill.sceneTags?.includes('对自己');
              const isStarred = !!starredIds[skill.id];

              return (
                <div
                  key={skill.id}
                  className={cn(
                    "bg-white p-4 rounded-[16px] transition-all flex relative overflow-hidden ring-1 ring-inset",
                    isSelf ? "ring-orange-500/10 shadow-[0_2px_8px_rgba(249,115,22,0.03)] bg-gradient-to-br from-white to-orange-50/30" : "ring-neutral-200/30 shadow-[0_2px_12px_rgba(0,0,0,0.015)]"
                  )}
                >
                  {/* Left content area */}
                  <div className="flex-1 min-w-0 pr-3">
                     <div className="flex items-center gap-2 mb-1.5">
                       <Link to={`/skills/${skill.id}`} className="text-[15px] font-extrabold text-neutral-800 tracking-tight hover:text-blue-600 break-words pr-2 leading-snug">
                         {skill.name}
                       </Link>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                        {skill.sceneTags && skill.sceneTags.map((tag) => (
                           <span
                             key={tag}
                             className={cn(
                               'text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 border',
                               SCENE_COLOR[tag] || 'bg-neutral-100 text-neutral-500 border-neutral-200',
                             )}
                           >
                              {tag === '对自己' && <Lock size={8}/>}
                             {tag}
                           </span>
                        ))}
                    </div>

                    <p className="text-[13px] text-neutral-500 font-medium leading-relaxed mb-3 line-clamp-2 pr-2 break-words">
                       {skill.description}
                    </p>
                    
                    <div className="flex items-center">
                       {getStatusBadge(Array.isArray(skill.status) ? skill.status[0] : skill.status)}
                    </div>
                  </div>
                  
                  {/* Right Action Stack */}
                  <div className="shrink-0 flex flex-col justify-between items-end pl-2">
                      <button 
                         onClick={(e) => toggleStar(e, skill.id)} 
                         className={cn("w-11 h-11 flex items-center justify-center rounded-full transition-colors active:scale-95 -mr-2 -mt-2", isStarred ? "text-orange-400" : "hover:bg-neutral-50/50 text-neutral-200 hover:text-neutral-300")}
                      >
                         <Star size={18} fill={isStarred ? "currentColor" : "none"} />
                      </button>

                      {skill.toolRoute ? (
                         <Link
                           to={skill.toolRoute}
                           className="w-11 h-11 rounded-full flex items-center justify-center text-neutral-300 hover:text-neutral-500 active:scale-95 transition-all mt-auto -mr-2"
                         >
                            <ChevronRight size={18} strokeWidth={2.5} />
                         </Link>
                      ) : (
                         <Link
                          to={`/skills/${skill.id}`}
                          className="w-11 h-11 rounded-full flex items-center justify-center text-neutral-300 hover:text-neutral-500 active:scale-95 transition-all mt-auto -mr-2"
                         >
                           <ChevronRight size={18} strokeWidth={2.5} />
                         </Link>
                      )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-20 px-6 text-center">
              <Loader2 className="w-8 h-8 mx-auto text-neutral-300 mb-4 animate-spin-slow" />
              <h3 className="text-base font-bold text-neutral-600 mb-1">
                无可用组件
              </h3>
              <p className="text-xs text-neutral-400 font-medium mb-6">
                调整标签过滤或清空搜索词
              </p>
              <button
                onClick={() => { setStatusFilter('全部'); setSceneFilter('全部场景'); setSearchQuery(''); }}
                className="px-6 py-2 bg-white border border-neutral-200 rounded-full text-xs font-bold shadow-sm"
              >
                 重置检索
              </button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default SkillsLibrary;
