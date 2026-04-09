
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Image, Tag, Send, X, AlertCircle } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import { apiService } from '../services/api';
import { cn } from '../../lib/utils';

const Publish: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('经验分享');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const categories = ['政策解读', '业务打法', '经验分享', '行业动态'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    setIsSubmitting(true);
    try {
      // Future: POST to /api/posts
      await apiService.createPost({ title, content, category });
      setShowSuccess(true);
      setTimeout(() => navigate('/feed'), 1500);
    } catch (error) {
      console.error('Failed to publish:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout title="发布内容">
      <div className="px-4 py-6">
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
            <button type="button" className="flex items-center gap-2 px-4 py-2 bg-brand-light-gray rounded-xl text-xs font-bold text-brand-gray opacity-60 hover:opacity-100 transition-all">
              <Image size={16} /> 添加图片
            </button>
            <button type="button" className="flex items-center gap-2 px-4 py-2 bg-brand-light-gray rounded-xl text-xs font-bold text-brand-gray opacity-60 hover:opacity-100 transition-all">
              <Tag size={16} /> 添加标签
            </button>
          </div>

          {/* Audit Notice */}
          <div className="p-4 bg-brand-gold/5 border border-brand-gold/10 rounded-2xl flex gap-3">
            <AlertCircle size={18} className="text-brand-gold shrink-0" />
            <p className="text-[11px] text-brand-dark/70 leading-relaxed font-medium">
              发布的内容将进入<span className="text-brand-gold font-bold">待审核</span>状态，审核通过后将展示在发现页。请确保内容合规。
            </p>
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

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6 bg-brand-dark/20 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-[2rem] shadow-2xl text-center space-y-4 animate-scale-in">
            <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg">
              <Send size={32} />
            </div>
            <h3 className="text-xl font-serif text-brand-dark">发布成功</h3>
            <p className="text-sm text-brand-gray font-medium">内容已提交审核，请耐心等待。</p>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default Publish;
