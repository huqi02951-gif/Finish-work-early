import React, { useState } from 'react';
import { MessageSquare, Send, CheckCircle2, AlertCircle, Sparkles, UserPlus, Zap } from 'lucide-react';
import { cn } from '../lib/utils';
import AppLayout from '../src/components/layout/AppLayout';
import { saveLocalPost } from '../lib/localDB';

const Feedback: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'pain' | 'feature' | 'co-create' | 'trial'>('pain');

  const tabs = [
    { id: 'pain', label: '提交痛点', icon: AlertCircle, desc: '描述你在业务中遇到的繁琐、重复性工作。' },
    { id: 'feature', label: '提交需求', icon: Zap, desc: '对现有 Skill 的改进建议或新功能想法。' },
    { id: 'co-create', label: '申请共创', icon: Sparkles, desc: '作为业务专家参与 Skill 的逻辑设计与测试。' },
    { id: 'trial', label: '申请试用', icon: UserPlus, desc: '申请加入内测名单，优先体验最新 Skills。' },
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      const name = String(formData.get('name') || '').trim();
      const contact = String(formData.get('contact') || '').trim();
      const department = String(formData.get('department') || '').trim();
      const detail = String(formData.get('detail') || '').trim();

      await saveLocalPost({
        type: 'feedback',
        title: tabs.find((tab) => tab.id === activeTab)?.label || '反馈',
        content: detail,
        author: name || '匿名用户',
        likes: 0,
        metadata: {
          activeTab,
          contact,
          department,
        },
      });

      setSubmitted(true);
      e.currentTarget.reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout title="共创 / 交流中心" showBack>
      <div className="pb-24 bg-brand-offwhite min-h-screen">
        {/* Apple Music Style Header */}
        <header className="px-6 pt-12 pb-8">
          <h1 className="text-4xl font-bold tracking-tight text-brand-dark mb-2">反馈 / 共创</h1>
          <p className="text-brand-gray font-medium text-sm max-w-md">
            每一个伟大的 Skill 都源自一线的真实痛点。
            我们期待你的声音，无论是吐槽、建议还是共创申请。
          </p>
          <div className="mt-4 px-4 py-3 bg-amber-50 border border-amber-200/60 rounded-2xl text-[11px] text-amber-700 font-medium leading-relaxed">
            当前为本地演示模式。你提交的内容会保存在当前浏览器，便于后续整理和演示，不会自动发送给项目组。
          </div>
        </header>

        <div className="px-6 space-y-8">
          {/* Segmented Control Style Tabs */}
          <div className="overflow-x-auto no-scrollbar">
            <div className="inline-flex p-1 bg-brand-light-gray rounded-2xl border border-brand-border/5">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[12px] font-bold transition-all duration-300 whitespace-nowrap flex items-center gap-2",
                    activeTab === tab.id 
                      ? "bg-white text-brand-dark shadow-sm" 
                      : "text-brand-gray hover:text-brand-dark"
                  )}
                >
                  <tab.icon size={14} className={cn(activeTab === tab.id ? "text-apple-blue" : "opacity-50")} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-brand-border/5 shadow-sm">
            {submitted ? (
              <div className="py-12 text-center animate-fade-in">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-2xl font-bold text-brand-dark mb-2 tracking-tight">提交成功！</h3>
                <p className="text-brand-gray text-sm font-medium mb-8 max-w-xs mx-auto">
                  内容已保存到当前浏览器的本地反馈记录中，可作为后续整理和产品规划素材。
                </p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="px-8 py-3 bg-brand-dark text-white rounded-full font-bold text-xs hover:opacity-90 transition-all shadow-lg"
                >
                  再次提交
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-brand-gray uppercase tracking-widest ml-1">姓名</label>
                    <input
                      name="name"
                      required
                      type="text" 
                      placeholder="请输入姓名" 
                      className="w-full px-4 py-3 bg-brand-light-gray border border-brand-border/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-apple-blue/20 transition-all text-sm font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-brand-gray uppercase tracking-widest ml-1">联系方式</label>
                    <input
                      name="contact"
                      required
                      type="text" 
                      placeholder="手机或邮箱" 
                      className="w-full px-4 py-3 bg-brand-light-gray border border-brand-border/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-apple-blue/20 transition-all text-sm font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-brand-gray uppercase tracking-widest ml-1">所属机构/部门</label>
                  <input
                    name="department"
                    required
                    type="text" 
                    placeholder="例如：XX分行 XX支行 普惠金融部" 
                    className="w-full px-4 py-3 bg-brand-light-gray border border-brand-border/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-apple-blue/20 transition-all text-sm font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-brand-gray uppercase tracking-widest ml-1">
                    {activeTab === 'pain' ? '痛点描述' : activeTab === 'feature' ? '建议内容' : activeTab === 'co-create' ? '共创意向' : '申请理由'}
                  </label>
                  <textarea
                    name="detail"
                    required
                    rows={5}
                    placeholder={activeTab === 'pain' ? '请描述你在业务中遇到的繁琐、重复性工作，以及你希望如何被解决...' : '请输入详细内容...'}
                    className="w-full px-4 py-3 bg-brand-light-gray border border-brand-border/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-apple-blue/20 transition-all text-sm font-medium resize-none"
                  ></textarea>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className={cn(
                      "w-full py-4 bg-brand-dark text-white rounded-2xl font-bold text-sm transition-all shadow-xl shadow-brand-dark/10 flex items-center justify-center gap-2",
                      isSubmitting ? "opacity-60 cursor-not-allowed" : "hover:opacity-95",
                    )}
                  >
                    <Send size={18} /> {isSubmitting ? '保存中...' : '保存到本地'}
                  </button>
                  <p className="mt-4 text-center text-[10px] text-brand-gray font-medium">
                    当前不会自动发给项目组；这是浏览器本地保存，用于梳理需求和演示流程。
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Feedback;
