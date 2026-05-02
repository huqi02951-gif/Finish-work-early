import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronRight, Users, ShieldCheck, Briefcase, User, Lock } from 'lucide-react';
import AppLayout from '../src/components/layout/AppLayout';
import { SKILLS } from '../constants/skills';
import { SCENE_TAG_OPTIONS } from '../content/pageConfigDefaults';
import { cn } from '../lib/utils';
import { getSkills } from '../src/services/contentApi';
import type { Skill, SceneTag } from '../types';

const SCENE_ICON: Record<string, React.ElementType> = {
  '对客户': Users,
  '对审查': ShieldCheck,
  '对中后台': Briefcase,
  '对自己': UserIconWrapper,
  '全部场景': Briefcase,
};

type SkillCardCopy = {
  title: string;
  desc: string;
  eyebrow: string;
  action: string;
};

const SKILL_CARD_COPY: Record<string, SkillCardCopy> = {
  'cd-calculator': {
    title: '客户问银承/存单划不划算，先把账摊开',
    desc: '收益、成本、口径先算明白，再去聊方案，少一点现场拍脑袋。',
    eyebrow: '算收益 · 算成本',
    action: '开始算账',
  },
  'account-fee-discount': {
    title: '账户收费要解释，也要能报批',
    desc: '客户要优惠、内部要理由，把申请材料和报批话术先收成能用的版本。',
    eyebrow: '收费优惠 · 报批',
    action: '整理申请',
  },
  'rate-discount-report': {
    title: '利率优惠别再从空白文档开始',
    desc: '把优惠理由、客户贡献、审批边界写清楚，减少来回改稿。',
    eyebrow: '利率优惠 · 签报',
    action: '生成初稿',
  },
  'news-assistant': {
    title: 'AI 写好了，但我真的懒得排版',
    desc: '把新闻稿、图片和零散素材收成能直接交、能直接发的稿子。',
    eyebrow: '投稿排版 · 交付',
    action: '收成稿子',
  },
  'sensitive-comm-assistant': {
    title: '客户一问收费就炸？先把话术收住',
    desc: '收费通知、利率调整、授信暂缓这类消息，先改成边界清楚又不刺耳的说法。',
    eyebrow: '对客沟通 · 高风险',
    action: '改一版话术',
  },
  'batch-billing-generation': {
    title: '项下开票别再一份份手搓',
    desc: '客户信息填好后，批量收成开票材料，适合重复但不能出错的活。',
    eyebrow: '批量开票 · 少重复',
    action: '批量生成',
  },
  'discount-credit-workflow': {
    title: '贴现/专门授信材料，一次性捋顺',
    desc: '从客户信息到内部材料，把最容易漏的环节放在同一条线上处理。',
    eyebrow: '授信材料 · 全流程',
    action: '开始整理',
  },
  'chang-rong-bao': {
    title: '小微客户想要增信，先看长融保能不能接',
    desc: '适合政策性担保的客户，先判断边界，再决定怎么往下聊。',
    eyebrow: '经营贷 · 增信',
    action: '查看打法',
  },
  'chang-yi-dan': {
    title: '优质小微要快一点，长易担先过一遍',
    desc: '先进制造、科技类客户适不适合，额度和准入先有个底。',
    eyebrow: '经营贷 · 快审',
    action: '查看打法',
  },
  'scenario-center': {
    title: '不知道从哪下手，就按场景找',
    desc: '拜访、沟通、报批、协同，先选当下这件事，再找顺手入口。',
    eyebrow: '按事找入口',
    action: '进入场景',
  },
  'business-guide-main': {
    title: '见客户前，先把产品打法过一遍',
    desc: '产品概况、准入、开场、材料清单集中看，别到现场再翻。',
    eyebrow: '产品打法 · 拜访前',
    action: '翻一下打法',
  },
  'material-checklist-main': {
    title: '客户要“一次性材料”，这里直接发',
    desc: '常见材料按场景整理好，适合发客户，也适合自己先核一遍。',
    eyebrow: '材料清单 · 少来回',
    action: '生成清单',
  },
  'bbs-center-main': {
    title: '有些坑，还是同事讲得最快',
    desc: '看实战经验、问真实问题，也把自己刚踩过的坑留给后来人。',
    eyebrow: '经验帖 · 同行互助',
    action: '去看看',
  },
  'feng-shui-calendar': {
    title: '今天适合硬刚，还是适合绕路？',
    desc: '用一点轻松口吻提醒自己：该推进就推进，该避雷就避雷。',
    eyebrow: '打工日历 · 轻提醒',
    action: '看今天',
  },
  'food-selector': {
    title: '中午吃什么，不要再开会讨论了',
    desc: '选择困难的时候，让它直接给一个能接受的答案。',
    eyebrow: '午饭救场',
    action: '摇一个',
  },
  'off-duty-game': {
    title: '别把免费加班当努力',
    desc: '上班、下班、损失和赚回来的时间都摆出来，提醒自己别被拖走。',
    eyebrow: '准时下班 · 清醒账',
    action: '开始算',
  },
  'update-log-main': {
    title: '最近又改了什么，来这儿扫一眼',
    desc: '只看和自己有关的变化，不看长篇废话。',
    eyebrow: '最近变化',
    action: '扫一眼',
  },
  'feedback-main': {
    title: '哪里难用，直接丢过来',
    desc: '不是写意见簿，是把真实卡点留下来，方便下一轮直接改。',
    eyebrow: '卡点反馈',
    action: '说一句',
  },
  'industry-manufacturing': {
    title: '制造业客户怎么聊，先看经营逻辑',
    desc: '从采购、生产到销售，把客户到底缺什么先想清楚。',
    eyebrow: '制造业 · 拜访前',
    action: '看切入点',
  },
  'industry-tech': {
    title: '科技企业别只问报表，研发和专利也要看',
    desc: '专精特新、高新客户的价值点和风险点，先有一套判断口径。',
    eyebrow: '科技企业 · 识别',
    action: '看切入点',
  },
  'scenario-first-visit': {
    title: '第一次见客户，别把开场交给临场发挥',
    desc: '开场白、需求摸排和下一步动作，先在脑子里走一遍。',
    eyebrow: '首次拜访 · 开场',
    action: '看打法',
  },
  'scenario-competitor': {
    title: '他行已经在了，也不是完全没机会',
    desc: '先找服务盲区，再决定从哪里切入，不要一上来硬抢。',
    eyebrow: '存量挖掘 · 竞品',
    action: '找切口',
  },
  'bbs-feed': {
    title: '看看别人今天怎么破局',
    desc: '实战动态比空泛经验更有用，适合没思路时翻一翻。',
    eyebrow: '实战动态',
    action: '刷一刷',
  },
  'bbs-publish': {
    title: '刚踩过的坑，发出来能救人',
    desc: '成功案例、失败经验、卡住的问题，都可以写成一条短帖。',
    eyebrow: '发经验帖',
    action: '开一帖',
  },
  'messages-center': {
    title: '别人回复你了，别错过',
    desc: '评论、点赞、提醒集中看，少一点到处翻。',
    eyebrow: '消息提醒',
    action: '查看消息',
  },
  'profile-main': {
    title: '把自己的节奏看清楚',
    desc: '最近做了什么、关注什么、常用什么，先收在自己的页面里。',
    eyebrow: '我的页面',
    action: '看看自己',
  },
};

function getSkillCardCopy(skill: Skill): SkillCardCopy {
  const mapped = SKILL_CARD_COPY[skill.id];
  if (mapped) return mapped;

  return {
    title: skill.name,
    desc: skill.description,
    eyebrow: skill.sceneTags?.join(' · ') || '实用入口',
    action: skill.toolRoute ? '现在就用' : '进去看看',
  };
}

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
      const copy = getSkillCardCopy(skill);
      const matchesSearch = skill.name.toLowerCase().includes(keyword) ||
        skill.description.toLowerCase().includes(keyword) ||
        skill.category.toLowerCase().includes(keyword) ||
        copy.title.toLowerCase().includes(keyword) ||
        copy.desc.toLowerCase().includes(keyword) ||
        copy.eyebrow.toLowerCase().includes(keyword);

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
              <p className="text-[11px] font-extrabold tracking-[0.18em] uppercase text-neutral-400">APEX Library</p>
              <h1 className="text-2xl font-black tracking-tight text-neutral-900">仓库</h1>
            </div>
           
            <div className="relative mb-3">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400/70 w-4 h-4" />
              <input
                type="text"
                placeholder="搜一个你现在卡住的事，比如收费、材料、排版..."
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
            找到 {filteredSkills.length} 条能用的入口
          </span>
        </div>

        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filteredSkills.length > 0 ? (
            filteredSkills.map((skill) => {
              const isSelf = skill.sceneTags?.includes('对自己');
              const target = skill.toolRoute || `/skills/${skill.id}`;
              const copy = getSkillCardCopy(skill);

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
                        {copy.title}
                      </h2>
                      <ChevronRight size={18} className="text-neutral-300 shrink-0 mt-0.5" />
                    </div>
                    
                    <div className="text-[10px] font-bold text-neutral-400 mb-2.5 flex items-center gap-1.5">
                      <span>{copy.eyebrow}</span>
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
                       {copy.desc}
                    </p>
                  </div>
                  
                  <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-neutral-400">点开就能接着做</span>
                    <span className="text-[11px] font-extrabold text-neutral-900">{copy.action}</span>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="col-span-full py-20 px-6 text-center">
              <Search className="w-8 h-8 mx-auto text-neutral-300 mb-4" />
              <h3 className="text-base font-bold text-neutral-600 mb-1">
                没找到对应入口
              </h3>
              <p className="text-xs text-neutral-400 font-medium mb-6">
                换个更口语的词搜，比如“收费”“材料”“排版”。
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
