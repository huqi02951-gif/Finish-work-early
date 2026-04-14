import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Briefcase,
  FileText,
  MessageSquare,
  Pin,
  Plus,
  Sparkles,
  Wrench,
} from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import { cn } from '../../lib/utils';
import { db, type GeneratedArtifact } from '../../lib/localDB';
import { useCustomer } from '../../lib/CustomerContext';
import { forumApi } from '../services/forumApi';
import { getAuthSession } from '../services/authService';
import type { ForumBoard, Post } from '../types';
import { useToast } from '../components/common/Toast';

const TOOL_META: Record<string, { name: string; path: string }> = {
  'sensitive-comm': { name: '敏感沟通助手', path: '/sensitive-comm' },
  'rate-offer': { name: '利率优惠签报', path: '/rate-offer' },
  'acceptance-calc': { name: '银承/存单测算', path: '/acceptance-calculator' },
  'material-checklist': { name: '材料清单中心', path: '/material-checklist' },
};

const DEFAULT_BOARD = 'experience-sharing';

const WorkspacePage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { customer, setCustomer, clearCustomer, hasCustomer } = useCustomer();
  const [boards, setBoards] = useState<ForumBoard[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [officialPosts, setOfficialPosts] = useState<Post[]>([]);
  const [recentArtifacts, setRecentArtifacts] = useState<GeneratedArtifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [composing, setComposing] = useState(false);
  const [activeBoard, setActiveBoard] = useState<string>('all');
  const [form, setForm] = useState({
    boardSlug: DEFAULT_BOARD,
    title: '',
    content: '',
    tags: '',
  });
  const [mobileTab, setMobileTab] = useState<'posts' | 'tools'>('posts');

  const quickTools = useMemo(
    () => ['sensitive-comm', 'rate-offer', 'acceptance-calc', 'material-checklist'].map((id) => ({ id, ...TOOL_META[id] })),
    [],
  );

  const displayBoards = useMemo(
    () => boards.filter((item) => !item.isOfficial),
    [boards],
  );

  const loadCommunity = async () => {
    setLoading(true);
    try {
      const [boardList, postList, officialList, artifacts] = await Promise.all([
        forumApi.getBoards(),
        forumApi.getPosts({
          boardSlug: activeBoard === 'all' ? undefined : activeBoard,
          pageSize: 20,
        }),
        forumApi.getOfficialPosts({
          pageSize: 4,
        }),
        db.artifacts.orderBy('createdAt').reverse().limit(4).toArray(),
      ]);

      setBoards(boardList);
      setPosts(postList.items);
      setOfficialPosts(officialList.items);
      setRecentArtifacts(artifacts);

      if (!boardList.find((item) => item.slug === form.boardSlug && !item.isOfficial)) {
        const fallbackBoard = boardList.find((item) => !item.isOfficial)?.slug || DEFAULT_BOARD;
        setForm((current) => ({ ...current, boardSlug: fallbackBoard }));
      }
    } catch (error) {
      console.error('Failed to load workspace community', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCommunity();
  }, [activeBoard]);

  const handleCreatePost = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;

    const session = getAuthSession();
    if (!session || session.loginMethod === 'demo') {
      toast.warning('请先登录后再发帖');
      navigate('/login');
      return;
    }

    try {
      await forumApi.createPost({
        boardSlug: form.boardSlug,
        title: form.title.trim(),
        content: form.content.trim(),
        tags: form.tags
          .split(/[，,]/)
          .map((item) => item.trim())
          .filter(Boolean),
        postType: form.boardSlug === 'system-operations' ? 'TOPIC' : 'DISCUSSION',
      });
      setForm({
        boardSlug: form.boardSlug,
        title: '',
        content: '',
        tags: '',
      });
      setComposing(false);
      await loadCommunity();
    } catch (error) {
      const message = error instanceof Error ? error.message : '发帖失败';
      toast.error(message);
    }
  };

  const getPostPath = (post: Post) =>
    post.postType === 'TOPIC' ? `/formal/topic/${post.id}` : `/formal/thread/${post.id}`;

  return (
    <AppLayout title="工作台">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:gap-6 px-4 py-4 sm:px-6 sm:py-6">
        <section className="flex flex-col gap-3 border-b border-brand-border/40 pb-4 sm:pb-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex-grow">
              <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-gray">workspace</div>
              <h1 className="mt-2 text-xl sm:text-3xl font-bold text-brand-dark">正式业务社区与经验库</h1>
              <p className="mt-1 max-w-2xl text-xs leading-6 text-brand-gray">
                这里是 APEX 的经验沉淀中心、官方帮助中心和客户经理实战交流区。游客可看，登录后可发帖、评论、沉淀经验。
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                to="/instructions"
                className="inline-flex items-center gap-2 rounded-lg border border-brand-border/40 bg-white px-3 py-2 text-xs font-semibold text-brand-dark hover:bg-brand-offwhite transition-colors"
              >
                <FileText size={14} />
                官方帮助
              </Link>
              <button
                onClick={() => setComposing((current) => !current)}
                className="inline-flex items-center gap-2 rounded-lg bg-brand-dark px-3 py-2 text-xs font-semibold text-white hover:bg-black transition-colors"
              >
                <Plus size={14} />
                发布经验帖
              </button>
            </div>
          </div>
        </section>

        {/* Mobile Tab Switcher */}
        <div className="flex gap-1 mb-2 bg-brand-offwhite/80 rounded-xl p-1 sm:hidden">
          <button onClick={() => setMobileTab('posts')}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${mobileTab === 'posts' ? 'bg-white text-brand-dark shadow-sm' : 'text-brand-gray'}`}>
            帖子
          </button>
          <button onClick={() => setMobileTab('tools')}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${mobileTab === 'tools' ? 'bg-white text-brand-dark shadow-sm' : 'text-brand-gray'}`}>
            工具 & 帮助
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
          <div className="flex flex-col gap-6">
            {/* Board filter — hidden on mobile when tools tab is active */}
            <section className={cn(
              "rounded-xl border border-brand-border/50 bg-white p-5",
              "lg:block",
              mobileTab === 'tools' ? "hidden sm:block" : "block",
            )}>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setActiveBoard('all')}
                  className={`rounded-full px-4 py-2 text-xs font-bold transition-colors ${
                    activeBoard === 'all'
                      ? 'bg-brand-dark text-white'
                      : 'bg-brand-offwhite text-brand-dark hover:bg-brand-light-gray'
                  }`}
                >
                  全部
                </button>
                {displayBoards.map((board) => (
                  <button
                    key={board.slug}
                    type="button"
                    onClick={() => setActiveBoard(board.slug)}
                    className={`rounded-full px-4 py-2 text-xs font-bold transition-colors ${
                      activeBoard === board.slug
                        ? 'bg-brand-dark text-white'
                        : 'bg-brand-offwhite text-brand-dark hover:bg-brand-light-gray'
                    }`}
                  >
                    {board.name}
                  </button>
                ))}
              </div>
            </section>

            {composing ? (
              <section className="rounded-xl border border-brand-border/50 bg-white p-5">
                <form className="grid gap-3" onSubmit={handleCreatePost}>
                  <div className="grid gap-3 md:grid-cols-[180px_1fr]">
                    <select
                      value={form.boardSlug}
                      onChange={(event) => setForm((current) => ({ ...current, boardSlug: event.target.value }))}
                      className="rounded-xl border border-brand-border/50 bg-white px-3 py-2 text-base outline-none"
                    >
                      {displayBoards.map((board) => (
                        <option key={board.slug} value={board.slug}>
                          {board.name}
                        </option>
                      ))}
                    </select>
                    <input
                      value={form.title}
                      onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                      className="rounded-xl border border-brand-border/50 bg-white px-3 py-2 text-base outline-none"
                      placeholder="一句话概括你的经验或问题"
                      required
                    />
                  </div>
                  <textarea
                    value={form.content}
                    onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))}
                    className="min-h-28 rounded-xl border border-brand-border/50 bg-white px-3 py-2 text-base leading-6 outline-none"
                    placeholder="写清楚场景、客户情况、你的判断和实际结果，后面的同事才真能用。"
                    required
                  />
                  <input
                    value={form.tags}
                    onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))}
                    className="rounded-xl border border-brand-border/50 bg-white px-3 py-2 text-base outline-none"
                    placeholder="标签，多个用逗号分隔，例如：长易担, 制造业, 进门打法"
                  />
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setComposing(false)}
                      className="px-4 py-2 text-sm text-brand-gray hover:text-brand-dark"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      className="rounded-xl bg-brand-dark px-4 py-2 text-sm font-semibold text-white hover:bg-black transition-colors"
                    >
                      发布
                    </button>
                  </div>
                </form>
              </section>
            ) : null}

            <section className="rounded-xl border border-brand-border/50 bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-brand-dark">最新帖子</h2>
                  <p className="mt-1 text-xs text-brand-gray">置顶和官方内容会优先展示，后面是最新的实战帖子。</p>
                </div>
              </div>

              <div className="grid gap-4">
                {loading ? (
                  <div className="rounded-xl border border-dashed border-brand-border/50 p-8 text-center text-sm text-brand-gray">
                    正在读取论坛内容...
                  </div>
                ) : posts.length ? (
                  posts.map((post) => (
                    <article key={post.id} className="rounded-xl border border-brand-border/50 bg-brand-offwhite p-4 transition-colors hover:bg-white">
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-brand-gray">
                        {post.isPinned ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-brand-gold/10 px-2 py-1 font-semibold text-brand-gold">
                            <Pin size={12} />
                            置顶
                          </span>
                        ) : null}
                        {post.board ? (
                          <span className="font-semibold text-brand-dark">{post.board.name}</span>
                        ) : null}
                        {post.isOfficial ? <span>官方帖</span> : null}
                        <span>{post.author?.nickname || '未知用户'}</span>
                        <span>{new Date(post.createdAt).toLocaleString('zh-CN')}</span>
                      </div>

                      <Link to={getPostPath(post)} className="mt-3 block">
                        <h3 className="text-lg font-semibold text-brand-dark">{post.title}</h3>
                        <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-sm leading-6 text-brand-gray">
                          {post.summary || post.content}
                        </p>
                      </Link>

                      <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-brand-gray">
                        <span className="inline-flex items-center gap-1">
                          <MessageSquare size={13} />
                          {post.commentCount || 0} 条评论
                        </span>
                        {post.tags.slice(0, 4).map((tag) => (
                          <span key={tag} className="rounded-full bg-white px-2 py-1 text-[10px] font-semibold text-brand-dark">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-brand-border/50 p-8 text-center text-sm text-brand-gray">
                    还没有帖子，登录后可以发第一条经验帖。
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className={cn(
            "flex flex-col gap-6",
            "lg:block",
            mobileTab === 'posts' ? "hidden sm:flex" : "flex",
          )}>
            <section className="rounded-xl border border-brand-border/50 bg-white p-5">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-brand-dark">
                <Sparkles size={16} className="text-brand-gold" />
                官方帮助帖
              </div>
              <div className="grid gap-3">
                {officialPosts.map((post) => (
                  <Link key={post.id} to={getPostPath(post)} className="rounded-xl border border-brand-border/40 bg-brand-offwhite p-3 hover:bg-white transition-colors">
                    <div className="text-sm font-semibold text-brand-dark">{post.title}</div>
                    <div className="mt-1 text-xs leading-5 text-brand-gray">{post.summary || post.content}</div>
                  </Link>
                ))}
                {!officialPosts.length ? (
                  <div className="rounded-xl border border-dashed border-brand-border/50 p-4 text-sm text-brand-gray">
                    暂无官方帮助帖。
                  </div>
                ) : null}
              </div>
            </section>

            <section className="rounded-xl border border-brand-border/50 bg-white p-5">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-brand-dark">
                <Wrench size={16} />
                高频工具
              </div>
              <div className="grid gap-2">
                {quickTools.map((tool) => (
                  <Link
                    key={tool.id}
                    to={tool.path}
                    className="flex items-center justify-between rounded-xl border border-brand-border/40 bg-brand-offwhite px-3 py-2 text-sm text-brand-dark hover:bg-white transition-colors"
                  >
                    <span>{tool.name}</span>
                    <ArrowRight size={14} className="text-brand-gray" />
                  </Link>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-brand-border/50 bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <div className="text-sm font-semibold text-brand-dark">当前客户上下文</div>
                {hasCustomer ? (
                  <button type="button" onClick={clearCustomer} className="text-[11px] text-brand-gray hover:text-brand-dark">
                    清除
                  </button>
                ) : null}
              </div>
              {hasCustomer ? (
                <div className="grid gap-3">
                  <div>
                    <div className="text-[11px] text-brand-gray">客户名称</div>
                    <div className="mt-1 text-sm font-semibold text-brand-dark">{customer.name}</div>
                  </div>
                  {customer.contactPerson ? (
                    <div>
                      <div className="text-[11px] text-brand-gray">联系人</div>
                      <div className="mt-1 text-sm font-semibold text-brand-dark">{customer.contactPerson}</div>
                    </div>
                  ) : null}
                </div>
              ) : (
                <input
                  placeholder="输入名称后回车，锁定客户上下文"
                  className="w-full rounded-xl border border-brand-border/50 bg-brand-offwhite px-3 py-2 text-base outline-none"
                  onKeyDown={(event) => {
                    const value = (event.target as HTMLInputElement).value.trim();
                    if (event.key === 'Enter' && value) {
                      setCustomer({ name: value });
                      (event.target as HTMLInputElement).value = '';
                    }
                  }}
                />
              )}
            </section>

            <section className="rounded-xl border border-brand-border/50 bg-white p-5">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-brand-dark">
                <Briefcase size={16} />
                最近生成
              </div>
              <div className="grid gap-3">
                {recentArtifacts.length ? (
                  recentArtifacts.map((item) => (
                    <div key={item.id} className="rounded-xl border border-brand-border/40 bg-brand-offwhite px-3 py-2">
                      <div className="text-sm font-semibold text-brand-dark">{item.title}</div>
                      <div className="mt-1 text-[11px] text-brand-gray">{new Date(item.createdAt).toLocaleString('zh-CN')}</div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-brand-border/50 p-4 text-sm text-brand-gray">
                    还没有最近生成记录。
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default WorkspacePage;
