import React, { useMemo, useState } from 'react';
import {
  BookOpen,
  ClipboardList,
  FileText,
  MessageSquare,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import AppLayout from '../src/components/layout/AppLayout';
import { BUSINESS_GUIDE_PRODUCTS } from '../content/businessGuideProducts';
import {
  CHANG_RONG_BAO_VS_CHANG_YI_DAN_COMPARISON,
  FORUM_GUIDE_POSTS,
  MANUAL_QUICK_GUIDES,
  POLICY_GUARANTEE_CHECKLIST_RUNTIME_RULES,
} from '../content/apexStructuredContent';

const PRODUCT_OPTIONS = [
  { id: 'chang_rong_bao', label: '长融保' },
  { id: 'chang_yi_dan', label: '长易担' },
] as const;

const cardClass = 'rounded-xl border border-brand-border/10 bg-white p-4 shadow-sm';
const sectionTitleClass = 'mb-3 flex items-center gap-2 text-sm font-bold text-brand-dark';

const ApexPreviewPage: React.FC = () => {
  const [activeProductId, setActiveProductId] = useState<'chang_rong_bao' | 'chang_yi_dan'>('chang_rong_bao');

  const activeProduct = useMemo(
    () => BUSINESS_GUIDE_PRODUCTS.find((product) => product.id === activeProductId),
    [activeProductId],
  );

  const messagingPack = activeProduct?.messagingPack;

  return (
    <AppLayout title="APEX 预览" showBack>
      <div className="min-h-screen bg-brand-offwhite">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <section className={`${cardClass} mb-6`}>
            <div className="mb-4">
              <h1 className="text-xl font-bold text-brand-dark">结构化内容预览</h1>
              <p className="mt-1 text-sm text-brand-gray">
                这里直接展示这次新增的 APEX 配置内容，不走宣传页，只看可接入的数据结果。
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {PRODUCT_OPTIONS.map((option) => {
                const isActive = option.id === activeProductId;
                return (
                  <button
                    key={option.id}
                    onClick={() => setActiveProductId(option.id)}
                    className={[
                      'rounded-lg border px-4 py-2 text-sm font-bold transition-colors',
                      isActive
                        ? 'border-brand-dark bg-brand-dark text-white'
                        : 'border-brand-border/20 bg-white text-brand-dark hover:bg-brand-light-gray',
                    ].join(' ')}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </section>

          {activeProduct && messagingPack && (
            <>
              <section className={`${cardClass} mb-6`}>
                <div className={sectionTitleClass}>
                  <Sparkles size={16} className="text-brand-gold" />
                  <span>{activeProduct.name} · 当前挂载信息</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg bg-brand-light-gray/40 p-3">
                    <div className="text-[11px] font-bold uppercase tracking-wide text-brand-gray">产品模板</div>
                    <div className="mt-1 text-sm font-medium text-brand-dark">
                      checklist: {activeProduct.checklistTemplateCode || '-'}
                    </div>
                    <div className="mt-1 text-sm font-medium text-brand-dark">
                      review: {activeProduct.reviewSubmissionTemplateCode || '-'}
                    </div>
                  </div>
                  <div className="rounded-lg bg-brand-light-gray/40 p-3">
                    <div className="text-[11px] font-bold uppercase tracking-wide text-brand-gray">产品概览</div>
                    <div className="mt-1 text-sm font-medium text-brand-dark">{activeProduct.overview}</div>
                  </div>
                </div>
              </section>

              <section className={`${cardClass} mb-6`}>
                <div className={sectionTitleClass}>
                  <MessageSquare size={16} className="text-apple-blue" />
                  <span>对客直发话术</span>
                </div>
                <div className="grid gap-3 lg:grid-cols-3">
                  {messagingPack.directCustomerScripts.map((item) => (
                    <article key={item.code} className="rounded-lg border border-brand-border/10 bg-brand-light-gray/20 p-4">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <h3 className="text-sm font-bold text-brand-dark">{item.title}</h3>
                        <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-gray">
                          {item.channel}
                        </span>
                      </div>
                      <p className="text-sm leading-6 text-brand-dark">{item.content}</p>
                      {item.variant ? (
                        <div className="mt-3 text-[11px] font-medium text-brand-gray">
                          类型：{item.variant === 'short' ? '短版' : '中版'}
                        </div>
                      ) : null}
                    </article>
                  ))}
                </div>
              </section>

              {messagingPack.oneLineSellingPoint ? (
                <section className={`${cardClass} mb-6`}>
                  <div className={sectionTitleClass}>
                    <Sparkles size={16} className="text-brand-gold" />
                    <span>一句话卖点</span>
                  </div>
                  <div className="rounded-lg bg-brand-light-gray/20 p-4 text-sm leading-6 text-brand-dark">
                    {messagingPack.oneLineSellingPoint}
                  </div>
                </section>
              ) : null}

              {(messagingPack.marketingEntryPoints?.length || messagingPack.suitableCustomerTalks?.length) ? (
                <section className="mb-6 grid gap-6 lg:grid-cols-2">
                  {messagingPack.marketingEntryPoints?.length ? (
                    <div className={cardClass}>
                      <div className={sectionTitleClass}>
                        <MessageSquare size={16} className="text-apple-blue" />
                        <span>营销切入点</span>
                      </div>
                      <div className="space-y-3">
                        {messagingPack.marketingEntryPoints.map((item) => (
                          <div key={item.code} className="rounded-lg bg-brand-light-gray/20 p-4">
                            <div className="mb-1 text-sm font-bold text-brand-dark">{item.title}</div>
                            <div className="text-sm leading-6 text-brand-dark">{item.content}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {messagingPack.suitableCustomerTalks?.length ? (
                    <div className={cardClass}>
                      <div className={sectionTitleClass}>
                        <BookOpen size={16} className="text-orange-500" />
                        <span>适合什么客户怎么讲</span>
                      </div>
                      <div className="space-y-3">
                        {messagingPack.suitableCustomerTalks.map((item) => (
                          <div key={item.code} className="rounded-lg bg-brand-light-gray/20 p-4">
                            <div className="mb-1 text-sm font-bold text-brand-dark">{item.title}</div>
                            <div className="mb-2 text-xs font-medium text-brand-gray">{item.customerProfile}</div>
                            <div className="text-sm leading-6 text-brand-dark">{item.content}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </section>
              ) : null}

              {(messagingPack.internalUnderstanding?.length ||
                messagingPack.valueVsOrdinaryLoan?.length ||
                messagingPack.compareWithOrdinaryCredit?.length ||
                messagingPack.mediumLongTermNarratives?.length ||
                messagingPack.whyNowNarratives?.length ||
                messagingPack.industryTalks?.length) ? (
                <section className="mb-6 grid gap-6 lg:grid-cols-2">
                  {messagingPack.internalUnderstanding?.length ? (
                    <div className={cardClass}>
                      <div className={sectionTitleClass}>
                        <BookOpen size={16} className="text-brand-gold" />
                        <span>客户经理内部理解版</span>
                      </div>
                      <div className="space-y-2">
                        {messagingPack.internalUnderstanding.map((item) => (
                          <div key={item} className="rounded-lg bg-brand-light-gray/20 px-3 py-2 text-sm text-brand-dark">
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {messagingPack.valueVsOrdinaryLoan?.length ? (
                    <div className={cardClass}>
                      <div className={sectionTitleClass}>
                        <FileText size={16} className="text-apple-purple" />
                        <span>和普通经营贷相比怎么讲</span>
                      </div>
                      <div className="space-y-2">
                        {messagingPack.valueVsOrdinaryLoan.map((item) => (
                          <div key={item} className="rounded-lg bg-brand-light-gray/20 px-3 py-2 text-sm text-brand-dark">
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {messagingPack.compareWithOrdinaryCredit?.length ? (
                    <div className={cardClass}>
                      <div className={sectionTitleClass}>
                        <ClipboardList size={16} className="text-apple-blue" />
                        <span>和普通授信/担保贷怎么讲差异</span>
                      </div>
                      <div className="space-y-2">
                        {messagingPack.compareWithOrdinaryCredit.map((item) => (
                          <div key={item} className="rounded-lg bg-brand-light-gray/20 px-3 py-2 text-sm text-brand-dark">
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {messagingPack.mediumLongTermNarratives?.length ? (
                    <div className={cardClass}>
                      <div className={sectionTitleClass}>
                        <Sparkles size={16} className="text-emerald-500" />
                        <span>为什么适合中长期融资需求</span>
                      </div>
                      <div className="space-y-2">
                        {messagingPack.mediumLongTermNarratives.map((item) => (
                          <div key={item} className="rounded-lg bg-brand-light-gray/20 px-3 py-2 text-sm text-brand-dark">
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {messagingPack.whyNowNarratives?.length ? (
                    <div className={cardClass}>
                      <div className={sectionTitleClass}>
                        <Sparkles size={16} className="text-brand-gold" />
                        <span>为什么现在值得推进</span>
                      </div>
                      <div className="space-y-2">
                        {messagingPack.whyNowNarratives.map((item) => (
                          <div key={item} className="rounded-lg bg-brand-light-gray/20 px-3 py-2 text-sm text-brand-dark">
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {messagingPack.industryTalks?.length ? (
                    <div className={cardClass}>
                      <div className={sectionTitleClass}>
                        <BookOpen size={16} className="text-orange-500" />
                        <span>分行业怎么讲</span>
                      </div>
                      <div className="space-y-3">
                        {messagingPack.industryTalks.map((item) => (
                          <div key={item.code} className="rounded-lg bg-brand-light-gray/20 p-4">
                            <div className="mb-1 text-sm font-bold text-brand-dark">{item.title}</div>
                            <div className="mb-2 text-xs font-medium text-brand-gray">{item.industry}</div>
                            <div className="text-sm leading-6 text-brand-dark">{item.content}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </section>
              ) : null}

              <section className={`${cardClass} mb-6`}>
                <div className={sectionTitleClass}>
                  <FileText size={16} className="text-apple-purple" />
                  <span>对审查可复制话术</span>
                </div>
                <div className="grid gap-3 lg:grid-cols-2">
                  {messagingPack.reviewSubmissionScripts.map((item) => (
                    <article key={item.code} className="rounded-lg border border-brand-border/10 bg-brand-light-gray/20 p-4">
                      <h3 className="mb-2 text-sm font-bold text-brand-dark">{item.title}</h3>
                      <p className="text-sm leading-6 text-brand-dark">{item.content}</p>
                    </article>
                  ))}
                </div>
              </section>

              <section className={`${cardClass} mb-6`}>
                <div className={sectionTitleClass}>
                  <BookOpen size={16} className="text-orange-500" />
                  <span>常见 Q&amp;A</span>
                </div>
                <div className="space-y-3">
                  {messagingPack.commonQA.map((item) => (
                    <article key={item.question} className="rounded-lg border border-brand-border/10 bg-brand-light-gray/20 p-4">
                      <div className="text-sm font-bold text-brand-dark">Q: {item.question}</div>
                      <div className="mt-2 text-sm leading-6 text-brand-dark">A: {item.answer}</div>
                      {item.prohibited ? (
                        <div className="mt-2 text-xs font-medium text-red-600">禁止口径：{item.prohibited}</div>
                      ) : null}
                    </article>
                  ))}
                </div>
              </section>

              <section className="mb-6 grid gap-6 lg:grid-cols-2">
                <div className={cardClass}>
                  <div className={sectionTitleClass}>
                    <ShieldAlert size={16} className="text-red-500" />
                    <span>禁止承诺口径</span>
                  </div>
                  <div className="space-y-2">
                    {messagingPack.forbiddenCommitments.map((item) => (
                      <div key={item} className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className={cardClass}>
                  <div className={sectionTitleClass}>
                    <Sparkles size={16} className="text-emerald-500" />
                    <span>提速放款提示</span>
                  </div>
                  <div className="space-y-2">
                    {messagingPack.fastTrackTips.map((item) => (
                      <div key={item} className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {(messagingPack.canSay?.length || messagingPack.shouldNotSayDead?.length || messagingPack.marketingTemplates) ? (
                <section className="mb-6 grid gap-6 lg:grid-cols-2">
                  {messagingPack.canSay?.length ? (
                    <div className={cardClass}>
                      <div className={sectionTitleClass}>
                        <Sparkles size={16} className="text-emerald-500" />
                        <span>哪些话可以说</span>
                      </div>
                      <div className="space-y-2">
                        {messagingPack.canSay.map((item) => (
                          <div key={item} className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {messagingPack.shouldNotSayDead?.length ? (
                    <div className={cardClass}>
                      <div className={sectionTitleClass}>
                        <ShieldAlert size={16} className="text-red-500" />
                        <span>哪些话不要说死</span>
                      </div>
                      <div className="space-y-2">
                        {messagingPack.shouldNotSayDead.map((item) => (
                          <div key={item} className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {messagingPack.marketingTemplates ? (
                    <div className={`${cardClass} lg:col-span-2`}>
                      <div className={sectionTitleClass}>
                        <MessageSquare size={16} className="text-apple-blue" />
                        <span>营销切入模板</span>
                      </div>
                      <div className="grid gap-3 lg:grid-cols-2">
                        <div className="rounded-lg bg-brand-light-gray/20 p-4">
                          <div className="mb-1 text-sm font-bold text-brand-dark">第一次拜访客户怎么开口</div>
                          <div className="text-sm leading-6 text-brand-dark">{messagingPack.marketingTemplates.firstVisit}</div>
                        </div>
                        <div className="rounded-lg bg-brand-light-gray/20 p-4">
                          <div className="mb-1 text-sm font-bold text-brand-dark">客户说先看看怎么跟进</div>
                          <div className="text-sm leading-6 text-brand-dark">{messagingPack.marketingTemplates.followUp}</div>
                        </div>
                        <div className="rounded-lg bg-brand-light-gray/20 p-4">
                          <div className="mb-1 text-sm font-bold text-brand-dark">客户问利率怎么答</div>
                          <div className="text-sm leading-6 text-brand-dark">{messagingPack.marketingTemplates.rateReply}</div>
                        </div>
                        <div className="rounded-lg bg-brand-light-gray/20 p-4">
                          <div className="mb-1 text-sm font-bold text-brand-dark">客户问贴补怎么答</div>
                          <div className="text-sm leading-6 text-brand-dark">{messagingPack.marketingTemplates.subsidyReply}</div>
                        </div>
                        <div className="rounded-lg bg-brand-light-gray/20 p-4 lg:col-span-2">
                          <div className="mb-1 text-sm font-bold text-brand-dark">客户问为什么要报税资料怎么答</div>
                          <div className="text-sm leading-6 text-brand-dark">{messagingPack.marketingTemplates.taxDocsReply}</div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </section>
              ) : null}
            </>
          )}

          <section className={`${cardClass} mb-6`}>
            <div className={sectionTitleClass}>
              <FileText size={16} className="text-apple-purple" />
              <span>长融保 vs 长易担对比话术</span>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-lg border border-brand-border/10 bg-brand-light-gray/20 p-4">
                <div className="mb-3 text-sm font-bold text-brand-dark">内部判断版</div>
                <div className="space-y-2">
                  {CHANG_RONG_BAO_VS_CHANG_YI_DAN_COMPARISON.internalJudgement.map((item) => (
                    <div key={item} className="rounded-lg bg-white px-3 py-2 text-sm text-brand-dark">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border border-brand-border/10 bg-brand-light-gray/20 p-4">
                <div className="mb-3 text-sm font-bold text-brand-dark">对客户解释版</div>
                <div className="space-y-2">
                  {CHANG_RONG_BAO_VS_CHANG_YI_DAN_COMPARISON.customerExplanation.map((item) => (
                    <div key={item} className="rounded-lg bg-white px-3 py-2 text-sm text-brand-dark">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className={`${cardClass} mb-6`}>
            <div className={sectionTitleClass}>
              <ClipboardList size={16} className="text-apple-blue" />
              <span>检核表运行规则</span>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-lg border border-brand-border/10 bg-brand-light-gray/20 p-4">
                <h3 className="mb-3 text-sm font-bold text-brand-dark">默认值逻辑</h3>
                <pre className="overflow-x-auto whitespace-pre-wrap text-xs leading-6 text-brand-dark">
                  {JSON.stringify(POLICY_GUARANTEE_CHECKLIST_RUNTIME_RULES.defaultValueRules, null, 2)}
                </pre>
              </div>

              <div className="rounded-lg border border-brand-border/10 bg-brand-light-gray/20 p-4">
                <h3 className="mb-3 text-sm font-bold text-brand-dark">必填项逻辑</h3>
                <pre className="overflow-x-auto whitespace-pre-wrap text-xs leading-6 text-brand-dark">
                  {JSON.stringify(POLICY_GUARANTEE_CHECKLIST_RUNTIME_RULES.requiredRules, null, 2)}
                </pre>
              </div>

              <div className="rounded-lg border border-brand-border/10 bg-brand-light-gray/20 p-4">
                <h3 className="mb-3 text-sm font-bold text-brand-dark">条件显示逻辑</h3>
                <pre className="overflow-x-auto whitespace-pre-wrap text-xs leading-6 text-brand-dark">
                  {JSON.stringify(POLICY_GUARANTEE_CHECKLIST_RUNTIME_RULES.visibilityRules, null, 2)}
                </pre>
              </div>

              <div className="rounded-lg border border-brand-border/10 bg-brand-light-gray/20 p-4">
                <h3 className="mb-3 text-sm font-bold text-brand-dark">计算字段示例</h3>
                <pre className="overflow-x-auto whitespace-pre-wrap text-xs leading-6 text-brand-dark">
                  {JSON.stringify(POLICY_GUARANTEE_CHECKLIST_RUNTIME_RULES.computedFields, null, 2)}
                </pre>
              </div>
            </div>
          </section>

          <section className={cardClass}>
            <div className={sectionTitleClass}>
              <BookOpen size={16} className="text-brand-gold" />
              <span>最小用户手册</span>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {MANUAL_QUICK_GUIDES.map((guide) => (
                <article key={guide.moduleCode} className="rounded-lg border border-brand-border/10 bg-brand-light-gray/20 p-4">
                  <h3 className="mb-3 text-sm font-bold text-brand-dark">{guide.moduleName}</h3>

                  {guide.sceneGuides ? (
                    <div className="space-y-4">
                      {guide.sceneGuides.map((scene) => (
                        <div key={scene.sceneTag} className="rounded-lg bg-white p-3">
                          <div className="mb-2 text-sm font-bold text-brand-dark">{scene.sceneTag}</div>
                          <div className="space-y-2 text-sm text-brand-dark">
                            <div><span className="font-bold">能干什么：</span>{scene.whatItDoes.join('、')}</div>
                            <div><span className="font-bold">点哪里：</span>{scene.whereToClick.join('、')}</div>
                            <div><span className="font-bold">会出来什么：</span>{scene.whatYouWillSee.join('、')}</div>
                            <div><span className="font-bold">什么时候用：</span>{scene.whenToUse.join('、')}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2 text-sm text-brand-dark">
                      <div><span className="font-bold">能干什么：</span>{guide.whatItDoes?.join('、')}</div>
                      <div><span className="font-bold">点哪里：</span>{guide.whereToClick?.join('、')}</div>
                      <div><span className="font-bold">会出来什么：</span>{guide.whatYouWillSee?.join('、')}</div>
                      <div><span className="font-bold">什么时候用：</span>{guide.whenToUse?.join('、')}</div>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </section>

          <section className={`${cardClass} mt-6`}>
            <div className={sectionTitleClass}>
              <BookOpen size={16} className="text-brand-gold" />
              <span>论坛/交流区挂载版手册</span>
            </div>
            <div className="space-y-4">
              {FORUM_GUIDE_POSTS.map((post) => (
                <article key={post.slug} className="rounded-lg border border-brand-border/10 bg-brand-light-gray/20 p-4">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold text-brand-dark">{post.title}</h3>
                    <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-gray">
                      排序 {post.sortOrder}
                    </span>
                  </div>
                  <p className="mb-3 text-sm leading-6 text-brand-gray">{post.summary}</p>
                  <div className="mb-3 flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-white px-2 py-1 text-[11px] font-medium text-brand-dark">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="space-y-3">
                    {post.sections.map((section) => (
                      <div key={section.title} className="rounded-lg bg-white p-3">
                        <div className="mb-2 text-sm font-bold text-brand-dark">{section.title}</div>
                        <div className="space-y-1.5">
                          {section.body.map((line) => (
                            <div key={line} className="text-sm leading-6 text-brand-dark">
                              {line}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </AppLayout>
  );
};

export default ApexPreviewPage;
