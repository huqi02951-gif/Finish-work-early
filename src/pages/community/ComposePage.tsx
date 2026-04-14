import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Terminal } from 'lucide-react';
import AppLayout from '../../components/layout/AppLayout';
import ComposeForm from '../../components/community/ComposeForm';
import { cn } from '../../../lib/utils';

const PROFESSIONAL_CATEGORIES = ['经验帖', '工具帖', '信贷操作', '产品建议', '开发共创', '手册分享'];
const PANTRY_CATEGORIES = ['匿名吐槽', 'Gossip 贴板', '二手交易', '请喝咖啡'];

type Zone = 'professional' | 'pantry';

const ComposePage: React.FC = () => {
  const navigate = useNavigate();
  const [zone, setZone] = useState<Zone>('professional');

  const handlePost = async (data: { title: string; content: string; category: string; anonymous: boolean; tags: string[] }) => {
    console.log('New post:', zone, data);
    // Navigate to the appropriate zone after posting
    navigate(zone === 'professional' ? '/bbs/professional' : '/bbs/pantry');
  };

  return (
    <AppLayout title="发布帖子" showBack>
      <div className="py-4 md:py-8 bg-brand-offwhite min-h-screen pb-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-serif text-brand-dark tracking-tight mb-1">发布新帖子</h1>
              <p className="text-sm text-brand-gray">选择区域，填写内容，发布到社区</p>
            </div>

            {/* Zone Toggle */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setZone('professional')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold border transition-all',
                  zone === 'professional'
                    ? 'bg-brand-dark text-white border-brand-dark shadow-lg'
                    : 'bg-white text-brand-gray border-brand-border/20 hover:border-brand-dark'
                )}
              >
                <FileText className="w-4 h-4" /> 专业业务区
              </button>
              <button
                onClick={() => setZone('pantry')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold border transition-all',
                  zone === 'pantry'
                    ? 'bg-[#050505] text-[#00ff41] border-[#00ff41]/40 shadow-lg'
                    : 'bg-white text-brand-gray border-brand-border/20 hover:border-[#00ff41]/40'
                )}
              >
                <Terminal className="w-4 h-4" /> 地下茶水间
              </button>
            </div>

            {/* Form */}
            <div className={cn(
              'rounded-2xl border p-6 shadow-sm',
              zone === 'professional'
                ? 'bg-white border-brand-border/10'
                : 'bg-[#050505] border-[#00ff41]/20'
            )}>
              <h3 className={cn(
                'text-sm font-bold mb-4 flex items-center gap-2',
                zone === 'professional' ? 'text-brand-dark' : 'text-[#00ff41]'
              )}>
                {zone === 'professional' ? <FileText className="w-4 h-4 text-brand-gold" /> : <Terminal className="w-4 h-4" />}
                {zone === 'professional' ? '专业区发帖' : '茶水间加密贴'}
              </h3>
              <ComposeForm
                onSubmit={handlePost}
                categories={zone === 'professional' ? PROFESSIONAL_CATEGORIES : PANTRY_CATEGORIES}
                dark={zone === 'pantry'}
                placeholder={
                  zone === 'professional'
                    ? '分享你的实战经验、工具教程或产品建议...'
                    : '吐个槽，爆个料，或者出个闲置...'
                }
              />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ComposePage;
