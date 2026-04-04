import React, { useState } from 'react';
import { MessageSquare, Send, CheckCircle2, AlertCircle, Sparkles, UserPlus, Zap } from 'lucide-react';
import { cn } from '../lib/utils';

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
    <div className="py-24 bg-brand-offwhite min-h-screen">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mb-20 animate-fade-in-up">
          <h1 className="font-serif text-5xl md:text-6xl text-brand-dark mb-8">反馈 / 共创</h1>
          <p className="text-xl text-stone-500 leading-relaxed">
            每一个伟大的 Skill 都源自一线的真实痛点。
            我们期待你的声音，无论是吐槽、建议还是共创申请。
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          {/* Tabs Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "w-full p-6 rounded-xl border text-left transition-all duration-300 group",
                  activeTab === tab.id 
                    ? "bg-brand-dark text-white border-brand-dark shadow-xl scale-[1.02]" 
                    : "bg-white text-stone-600 border-stone-100 hover:border-brand-gold/30 hover:shadow-md"
                )}
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                    activeTab === tab.id ? "bg-brand-gold text-brand-dark" : "bg-stone-50 text-stone-400 group-hover:text-brand-gold"
                  )}>
                    <tab.icon size={20} />
                  </div>
                  <span className="font-serif text-xl font-bold">{tab.label}</span>
                </div>
                <p className={cn(
                  "text-sm leading-relaxed",
                  activeTab === tab.id ? "text-stone-400" : "text-stone-500"
                )}>
                  {tab.desc}
                </p>
              </button>
            ))}
          </div>

          {/* Form Area */}
          <div className="lg:col-span-8">
            <div className="bg-white p-10 rounded-2xl border border-stone-100 shadow-sm">
              {submitted ? (
                <div className="py-20 text-center animate-fade-in">
                  <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 text-green-500">
                    <CheckCircle2 size={40} />
                  </div>
                  <h3 className="font-serif text-3xl text-brand-dark mb-4">提交成功！</h3>
                  <p className="text-stone-500 mb-8 max-w-md mx-auto">
                    感谢你的反馈。我们的项目组将在 3 个工作日内进行评估并与你取得联系。
                  </p>
                  <button 
                    onClick={() => setSubmitted(false)}
                    className="px-8 py-3 bg-brand-dark text-white rounded-md font-bold hover:bg-brand-dark/90 transition-all"
                  >
                    再次提交
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">姓名</label>
                      <input 
                        required
                        type="text" 
                        placeholder="请输入姓名" 
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">联系方式 (手机/邮箱)</label>
                      <input 
                        required
                        type="text" 
                        placeholder="请输入联系方式" 
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">所属机构/部门</label>
                    <input 
                      required
                      type="text" 
                      placeholder="例如：XX分行 XX支行 普惠金融部" 
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">
                      {activeTab === 'pain' ? '痛点描述' : activeTab === 'feature' ? '建议内容' : activeTab === 'co-create' ? '共创意向' : '申请理由'}
                    </label>
                    <textarea 
                      required
                      rows={6}
                      placeholder={activeTab === 'pain' ? '请描述你在业务中遇到的繁琐、重复性工作，以及你希望如何被解决...' : '请输入详细内容...'}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all resize-none"
                    ></textarea>
                  </div>

                  <div className="pt-4">
                    <button 
                      type="submit" 
                      className="w-full py-4 bg-brand-dark text-white rounded-md font-bold text-lg hover:bg-brand-dark/90 transition-all shadow-xl hover:shadow-brand-dark/20 flex items-center justify-center gap-3"
                    >
                      <Send size={20} /> 立即提交
                    </button>
                    <p className="mt-6 text-center text-xs text-stone-400">
                      提交即代表你同意项目组在必要时与你联系以进一步了解详情。
                    </p>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
