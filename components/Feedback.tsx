import React, { useState } from 'react';
import { MessageSquare, Send, CheckCircle2, AlertCircle, Sparkles, UserPlus, Zap } from 'lucide-react';
import { cn } from '../lib/utils';
import AppLayout from '../src/components/layout/AppLayout';

const Feedback: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState<'pain' | 'feature' | 'co-create' | 'trial'>('pain');

  const tabs = [
    { id: 'pain', label: '提交痛点', icon: AlertCircle, desc: '描述你在业务中遇到的繁琐、重复性工作。' },
    { id: 'feature', label: '提交需求', icon: Zap, desc: '对现有 Skill 的改进建议或新功能想法。' },
    { id: 'co-create', label: '申请共创', icon: Sparkles, desc: '作为业务专家参与 Skill 的逻辑设计与测试。' },
    { id: 'trial', label: '申请试用', icon: UserPlus, desc: '申请加入内测名单，优先体验最新 Skills。' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
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
                  感谢你的反馈。我们的项目组将在 3 个工作日内进行评估并与你取得联系。
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
                      required
                      type="text" 
                      placeholder="请输入姓名" 
                      className="w-full px-4 py-3 bg-brand-light-gray border border-brand-border/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-apple-blue/20 transition-all text-sm font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-brand-gray uppercase tracking-widest ml-1">联系方式</label>
                    <input 
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
                    required
                    rows={5}
                    placeholder={activeTab === 'pain' ? '请描述你在业务中遇到的繁琐、重复性工作，以及你希望如何被解决...' : '请输入详细内容...'}
                    className="w-full px-4 py-3 bg-brand-light-gray border border-brand-border/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-apple-blue/20 transition-all text-sm font-medium resize-none"
                  ></textarea>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit" 
                    className="w-full py-4 bg-brand-dark text-white rounded-2xl font-bold text-sm hover:opacity-95 transition-all shadow-xl shadow-brand-dark/10 flex items-center justify-center gap-2"
                  >
                    <Send size={18} /> 立即提交
                  </button>
                  <p className="mt-4 text-center text-[10px] text-brand-gray font-medium">
                    提交即代表你同意项目组在必要时与你联系以进一步了解详情。
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
