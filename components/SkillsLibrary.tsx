import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronRight, Users, ShieldCheck, Briefcase, User, Lock } from 'lucide-react';
import AppLayout from '../src/components/layout/AppLayout';
import { SKILLS } from '../constants/skills';
import { SCENE_TAG_OPTIONS } from '../content/pageConfigDefaults';
import { cn } from '../lib/utils';
import { getSkills } from '../src/services/contentApi';
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

const SkillsLibrary: React.FC = () => {
  const [sceneFilter, setSceneFilter] = useState<string>('全部场景');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [skills, setSkills] = useState<Skill[]>(SKILLS);

  useEffect(() => {
    let cancelled = false;

    getSkills()
      .then((response) => {
        if (!cancelled && response.length > 0) setSkills(response);
      })
      .catch(() => {
        if (!cancelled) setSkills(SKILLS);
      });

    return () => { cancelled = true; };
  }, []);

  const filteredSkills = useMemo(() => {
    const list = skills.filter((skill) => {
      const matchesScene = sceneFilter === '全部场景' ||
        (skill.sceneTags && skill.sceneTags.includes(sceneFilter as SceneTag));

      const keyword = searchQuery.toLowerCase();
      const matchesSearch = skill.name.toLowerCase().includes(keyword) ||
        skill.description.toLowerCase().includes(keyword) ||
        skill.category.toLowerCase().includes(keyword);

      return matchesScene && matchesSearch;
    });

    return list;
  }, [skills, sceneFilter, searchQuery]);

  return (
    <AppLayout title="仓库" showBack theme="default">
      <div className="pb-24 bg-[#F5F6FA] min-h-[100dvh]">
        <div className="sticky top-14 z-40 bg-[#F5F6FA]/90 backdrop-blur-lg pt-4 pb-3 px-4 shadow-[0_4px_24px_rgba(245,246,250,0.8)] -mx-px">
          <div className="max-w-6xl mx-auto">
            <div className="mb-3">
              <p className="text-[11px] font-extrabold tracking-[0.18em] uppercase text-neutral-400">Tool Library</p>
              <h1 className="text-2xl font-black tracking-tight text-neutral-900">仓库</h1>
            </div>
           
            <div className="relative mb-3">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400/70 w-4 h-4" />
              <input
                type="text"
                placeholder="搜索技能、场景或工具..."
                className="w-full pl-10 pr-4 py-3 bg-white border border-neutral-200/70 rounded-2xl focus:outline-none focus:border-neutral-300 focus:ring-4 focus:ring-neutral-200/40 transition-all text-sm font-medium shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
               <button
                  onClick={() => setSceneFilter('全部场景')}
                  className={cn(
                    'px-3 py-2 rounded-xl text-xs font-extrabold transition-all border text-center',
                    sceneFilter === '全部场景'
                      ? 'bg-neutral-900 text-white border-neutral-900 shadow-md'
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
                      'px-3 py-2 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5',
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
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 pt-4 pb-2 flex items-center justify-between">
          <span className="text-[11px] text-neutral-400 font-extrabold tracking-widest uppercase">
            检索结果: {filteredSkills.length}
          </span>
        </div>

        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filteredSkills.length > 0 ? (
            filteredSkills.map((skill) => {
              const isSelf = skill.sceneTags?.includes('对自己');
              const target = skill.toolRoute || `/skills/${skill.id}`;
              const actionLabel = skill.toolRoute ? '打开工具' : '查看详情';

              return (
                <Link
                  key={skill.id}
                  to={target}
                  className={cn(
                    "bg-white p-4 rounded-2xl transition-all flex flex-col relative overflow-hidden ring-1 ring-inset min-h-[172px] hover:-translate-y-0.5 hover:shadow-md",
                    isSelf ? "ring-slate-200/70 bg-gradient-to-br from-white to-slate-50/70" : "ring-neutral-200/50 shadow-[0_2px_12px_rgba(0,0,0,0.015)]"
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h2 className="text-[15px] font-extrabold text-neutral-900 tracking-tight leading-snug">
                        {skill.name}
                      </h2>
                      <ChevronRight size={18} className="text-neutral-300 shrink-0 mt-0.5" />
                    </div>
                    
                    <div className="text-[10px] font-bold text-neutral-400 mb-2.5 flex items-center gap-1.5">
                      <span>{skill.category}</span>
                      {skill.sceneTags?.length ? (
                        <>
                          <span className="text-neutral-200">/</span>
                          <span className="truncate">
                            {skill.sceneTags.join('、')}
                          </span>
                        </>
                      ) : null}
                      {isSelf && <Lock size={10} className="text-neutral-300 shrink-0" />}
                    </div>

                    <p className="text-[13px] text-neutral-500 font-medium leading-relaxed mb-4 line-clamp-3 break-words">
                       {skill.description}
                    </p>
                  </div>
                  
                  <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-neutral-400">{skill.form}</span>
                    <span className="text-[11px] font-extrabold text-neutral-900">{actionLabel}</span>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="col-span-full py-20 px-6 text-center">
              <Search className="w-8 h-8 mx-auto text-neutral-300 mb-4" />
              <h3 className="text-base font-bold text-neutral-600 mb-1">
                没找到匹配工具
              </h3>
              <p className="text-xs text-neutral-400 font-medium mb-6">
                调整标签过滤或清空搜索词
              </p>
              <button
                onClick={() => { setSceneFilter('全部场景'); setSearchQuery(''); }}
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
