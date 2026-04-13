import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  FileText,
  MessageSquare,
  Sparkles,
  Wrench,
} from 'lucide-react';
import { FORUM_GUIDE_POSTS } from '../content/forumGuidePosts';
import { MANUAL_QUICK_GUIDES } from '../content/manualQuickGuides';
import { cn } from '../lib/utils';
import { forumApi } from '../src/services/forumApi';
import type { Post } from '../src/types';

const GUIDE_LINKS: Record<string, { label: string; path: string }> = {
  home: { label: '去首页', path: '/' },
  business_guide: { label: '去业务通', path: '/business-guide?product=chang_yi_dan' },
  skills: { label: '去 Skills', path: '/skills' },
  scene_usage: { label: '看产品场景页', path: '/product-scene?product=chang_yi_dan&scene=customer' },
};

const guideIconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  home: Sparkles,
  business_guide: MessageSquare,
  skills: Wrench,
  scene_usage: FileText,
};

const UsageInstructions: React.FC = () => {
  const [officialPosts, setOfficialPosts] = useState<Post[]>([]);
  const quickGuides = MANUAL_QUICK_GUIDES.filter((item) => item.moduleCode !== 'scene_usage');
  const sceneGuide = MANUAL_QUICK_GUIDES.find((item) => item.moduleCode === 'scene_usage');
  const fallbackForumPosts = useMemo(
    () => [...FORUM_GUIDE_POSTS].sort((a, b) => a.sortOrder - b.sortOrder),
    [],
  );

  useEffect(() => {
    forumApi
      .getOfficialPosts({ boardSlug: 'official-help', pageSize: 6 })
      .then((response) => setOfficialPosts(response.items))
      .catch(() => setOfficialPosts([]));
  }, []);

  return (
    <div className="min-h-screen bg-brand-offwhite py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <section className="mb-8 rounded-3xl border border-brand-border/10 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-gold/20 bg-brand-gold/10 px-3 py-1 text-[11px] font-bold text-brand-gold">
            <BookOpen size={14} />
            APEX 帮助帖入口
          </div>
          <h1 className="text-2xl font-bold text-brand-dark sm:text-3xl">先别背系统，先按手上的事找入口</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-brand-gray">
            这里不是技术说明。你只需要看现在要做什么，是要跟客户讲产品、给审查整理说明、找材料，还是先找一个能直接生成内容的工具。
          </p>
        </section>

        <section className="mb-8 grid gap-6 lg:grid-cols-3">
          {quickGuides.map((guide) => {
            const Icon = guideIconMap[guide.moduleCode] || BookOpen;
            const link = GUIDE_LINKS[guide.moduleCode];
            return (
              <article key={guide.moduleCode} className="rounded-3xl border border-brand-border/10 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-light-gray text-brand-dark">
                    <Icon size={20} />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-brand-dark">{guide.moduleName}</div>
                    <div className="text-xs text-brand-gray">最小上手说明</div>
                  </div>
                </div>

                <div className="space-y-4 text-sm">
                  {guide.whatItDoes?.length ? (
                    <div>
                      <div className="mb-2 text-xs font-bold uppercase tracking-widest text-brand-gray/70">这个模块能干什么</div>
                      <div className="space-y-2">
                        {guide.whatItDoes.map((item) => (
                          <div key={item} className="rounded-xl bg-brand-light-gray/30 px-4 py-3 text-brand-dark">
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {guide.whereToClick?.length ? (
                    <div>
                      <div className="mb-2 text-xs font-bold uppercase tracking-widest text-brand-gray/70">点哪里</div>
                      <ul className="space-y-2">
                        {guide.whereToClick.map((item) => (
                          <li key={item} className="flex gap-2 text-brand-gray">
                            <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-brand-gold" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {guide.whatYouWillSee?.length ? (
                    <div>
                      <div className="mb-2 text-xs font-bold uppercase tracking-widest text-brand-gray/70">会出来什么</div>
                      <div className="flex flex-wrap gap-2">
                        {guide.whatYouWillSee.map((item) => (
                          <span key={item} className="rounded-full border border-brand-border/10 bg-brand-light-gray/20 px-3 py-1 text-xs font-medium text-brand-dark">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {guide.whenToUse?.length ? (
                    <div>
                      <div className="mb-2 text-xs font-bold uppercase tracking-widest text-brand-gray/70">什么时候用</div>
                      <div className="space-y-2">
                        {guide.whenToUse.map((item) => (
                          <div key={item} className="rounded-xl border border-brand-border/10 px-4 py-3 text-brand-gray">
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>

                {link ? (
                  <Link
                    to={link.path}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-dark px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-brand-dark/90"
                  >
                    {link.label}
                    <ArrowRight size={14} />
                  </Link>
                ) : null}
              </article>
            );
          })}
        </section>

        {sceneGuide?.sceneGuides?.length ? (
          <section className="mb-8 rounded-3xl border border-brand-border/10 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-5 flex items-center gap-2 text-sm font-bold text-brand-dark">
              <FileText size={16} className="text-apple-purple" />
              对客户 / 对审查怎么用
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              {sceneGuide.sceneGuides.map((item) => (
                <article key={item.sceneTag} className="rounded-2xl border border-brand-border/10 bg-brand-light-gray/20 p-5">
                  <h2 className="mb-4 text-lg font-bold text-brand-dark">{item.sceneTag}</h2>
                  <div className="space-y-4 text-sm">
                    <div>
                      <div className="mb-2 text-xs font-bold uppercase tracking-widest text-brand-gray/70">这个模块能帮你做什么</div>
                      <div className="space-y-2">
                        {item.whatItDoes.map((text) => (
                          <div key={text} className="rounded-xl bg-white px-4 py-3 text-brand-dark">{text}</div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="mb-2 text-xs font-bold uppercase tracking-widest text-brand-gray/70">点哪里</div>
                      <div className="space-y-2">
                        {item.whereToClick.map((text) => (
                          <div key={text} className="rounded-xl border border-brand-border/10 px-4 py-3 text-brand-gray">{text}</div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="mb-2 text-xs font-bold uppercase tracking-widest text-brand-gray/70">会看到什么</div>
                      <div className="flex flex-wrap gap-2">
                        {item.whatYouWillSee.map((text) => (
                          <span key={text} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-brand-dark">{text}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="mb-2 text-xs font-bold uppercase tracking-widest text-brand-gray/70">什么时候用</div>
                      <div className="space-y-2">
                        {item.whenToUse.map((text) => (
                          <div key={text} className="rounded-xl bg-white px-4 py-3 text-brand-gray">{text}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <section className="mb-8 rounded-3xl border border-brand-border/10 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-5 flex items-center gap-2 text-sm font-bold text-brand-dark">
            <BookOpen size={16} className="text-brand-gold" />
            论坛官方帮助帖
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            {officialPosts.length ? (
              officialPosts.map((post) => (
                <Link
                  key={post.id}
                  to={post.postType === 'TOPIC' ? `/formal/topic/${post.id}` : `/formal/thread/${post.id}`}
                  className="rounded-2xl border border-brand-border/10 bg-brand-light-gray/20 p-4 hover:bg-white transition-colors"
                >
                  <div className="text-sm font-bold text-brand-dark">{post.title}</div>
                  <div className="mt-2 text-sm leading-7 text-brand-gray">{post.summary || post.content}</div>
                </Link>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-brand-border/20 bg-brand-light-gray/10 p-4 text-sm text-brand-gray">
                当前未连接到论坛官方帖数据，下面继续显示本地帮助帖备用内容。
              </div>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-brand-border/10 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-5 flex items-center gap-2 text-sm font-bold text-brand-dark">
            <BookOpen size={16} className="text-brand-gold" />
            论坛挂载版帮助帖（本地回退）
          </div>
          <div className="space-y-5">
            {fallbackForumPosts.map((post) => (
              <article key={post.slug} className="rounded-2xl border border-brand-border/10 bg-brand-light-gray/15 p-5">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className={cn(
                        'rounded-full px-3 py-1 text-[11px] font-bold',
                        tag.includes('帮助')
                          ? 'bg-brand-gold/10 text-brand-gold'
                          : 'bg-white text-brand-gray'
                      )}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <h2 className="text-lg font-bold text-brand-dark">{post.title}</h2>
                <p className="mt-2 text-sm leading-7 text-brand-gray">{post.summary}</p>

                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  {post.sections.map((section) => (
                    <section key={section.title} className="rounded-2xl bg-white p-4">
                      <h3 className="mb-3 text-sm font-bold text-brand-dark">{section.title}</h3>
                      <div className="space-y-2">
                        {section.body.map((line) => (
                          <div key={line} className="text-sm leading-7 text-brand-gray">
                            {line}
                          </div>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default UsageInstructions;
