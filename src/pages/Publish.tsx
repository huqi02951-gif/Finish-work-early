
import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Image, Tag, Send, AlertCircle, Lock } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import { forumApi } from '../services/forumApi';
import { getAuthSession } from '../services/authService';
import { cn } from '../../lib/utils';

const Publish: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('经验分享');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const redirectTimerRef = useRef<number | null>(null);

  const categories = ['政策解读', '业务打法', '经验分享', '行业动态'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    // Check if user is authenticated
    const session = getAuthSession();
    if (!session || session.loginMethod === 'demo') {
      setShowLoginModal(true);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await forumApi.createPost({ title, content, category });
      setShowSuccess(true);
      redirectTimerRef.current = window.setTimeout(() => navigate('/feed'), 1500);
    } catch (error) {
      console.error('Failed to publish:', error);
      setSubmitError(error instanceof Error ? error.message : '发布失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  React.useEffect(() => {
    return () => {
      if (redirectTimerRef.current !== null) {
        window.clearTimeout(redirectTimerRef.current);
      }
    };
  }, []);

  return (
    <AppLayout title="发布内容">
      <div className="px-4 py-6">
        <div className="mb-4 px-4 py-3 bg-emerald-50 border border-emerald-200/60 rounded-2xl flex items-start gap-3">
          <span className="text-sm">●</span>
          <p className="text-[11px] text-emerald-700 font-medium leading-relaxed">
            当前为 Phase 1 后端联通模式。发布后内容会写入后端数据库，并出现在“发现”页。
          </p>
        </div>
        {submitError ? (
          <div className="mb-4 px-4 py-3 bg-rose-50 border border-rose-200/60 rounded-2xl flex items-start gap-3">
            <span className="text-sm">!</span>
            <p className="text-[11px] text-rose-700 font-medium leading-relaxed">
              发布失败：{submitError}
            </p>
          </div>
        ) : null}
        <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in-up">
          {/* Category Selection */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-brand-gray uppercase tracking-[0.2em] opacity-60">选择分类</label>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                    category === cat 
                      ? "bg-brand-dark text-white border-brand-dark shadow-md" 
                      : "bg-white text-brand-gray border-brand-border/10"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Title Input */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-brand-gray uppercase tracking-[0.2em] opacity-60">标题</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="输入一个吸引人的标题..."
              className="w-full px-4 py-3 bg-white border border-brand-border/10 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-brand-gold/20 transition-all"
              required
            />
          </div>

          {/* Content Input */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-brand-gray uppercase tracking-[0.2em] opacity-60">正文内容</label>
            <textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="分享您的业务心得、政策解读或实战话术..."
              className="w-full h-48 px-4 py-4 bg-white border border-brand-border/10 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-brand-gold/20 transition-all resize-none"
              required
            />
          </div>

          {/* Media Upload Placeholder */}
          <div className="flex gap-4">
            <button
              type="button"
              disabled
              title="当前前端-only 版本暂未开放图片上传"
              className="flex items-center gap-2 px-4 py-2 bg-brand-light-gray rounded-xl text-xs font-bold text-brand-gray opacity-50 cursor-not-allowed"
            >
              <Image size={16} /> 图片上传未开放
            </button>
            <button
              type="button"
              disabled
              title="当前前端-only 版本暂未开放标签编辑"
              className="flex items-center gap-2 px-4 py-2 bg-brand-light-gray rounded-xl text-xs font-bold text-brand-gray opacity-50 cursor-not-allowed"
            >
              <Tag size={16} /> 标签编辑未开放
            </button>
          </div>

          {/* Local Demo Notice */}
          <div className="p-4 bg-brand-gold/5 border border-brand-gold/10 rounded-2xl flex gap-3">
            <AlertCircle size={18} className="text-brand-gold shrink-0" />
            <p className="text-[11px] text-brand-dark/70 leading-relaxed font-medium">
              当前阶段请以<span className="text-brand-gold font-bold">邮箱登录</span>后发帖，你的帖子将持久化到数据库，跨设备可见。
            </p>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-brand-gray/70 px-1">
            <Lock size={14} className="text-brand-gray/50" />
            <span>登录后发帖绑定账号，退出再登录仍可见。图片、标签前端暂未接入。</span>
          </div>

          {/* Submit Button */}
          <button 
            type="submit"
            disabled={isSubmitting || !title || !content}
            className={cn(
              "w-full py-4 bg-brand-dark text-white rounded-2xl font-bold text-base shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95",
              (isSubmitting || !title || !content) ? "opacity-50 cursor-not-allowed" : "hover:bg-brand-dark/90"
            )}
          >
            {isSubmitting ? "正在发布..." : (
              <>
                <Send size={18} /> 立即发布
              </>
            )}
          </button>
        </form>
      </div>

      {/* Login Required Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6 bg-brand-dark/20 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-[2rem] shadow-2xl text-center space-y-5 animate-scale-in max-w-sm w-full">
            <div className="w-16 h-16 bg-brand-dark text-white rounded-full flex items-center justify-center mx-auto shadow-lg">
              <Lock size={28} />
            </div>
            <h3 className="text-lg font-bold text-brand-dark">需要登录后发帖</h3>
            <p className="text-sm text-brand-gray leading-relaxed">
              登录后你的帖子将持久化到数据库，换设备也能看到。<br/>
              游客模式发的帖子仅当前浏览器可见。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLoginModal(false)}
                className="flex-1 py-3 bg-white border-2 border-brand-dark text-brand-dark rounded-2xl font-bold text-sm hover:bg-brand-dark hover:text-white transition-all"
              >
                稍后再说
              </button>
              <button
                onClick={() => navigate('/login')}
                className="flex-1 py-3 bg-brand-dark text-white rounded-2xl font-bold text-sm hover:bg-brand-dark/90 transition-all"
              >
                去登录
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6 bg-brand-dark/20 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-[2rem] shadow-2xl text-center space-y-4 animate-scale-in">
            <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg">
              <Send size={32} />
            </div>
            <h3 className="text-xl font-serif text-brand-dark">发布成功</h3>
            <p className="text-sm text-brand-gray font-medium">内容已写入后端数据库，正在跳转到发现页。</p>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default Publish;
