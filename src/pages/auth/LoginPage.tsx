import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Smartphone, User } from 'lucide-react';
import EmailLogin from './EmailLogin';
import PhoneLogin from './PhoneLogin';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'email' | 'phone' | 'demo'>('email');

  const handleContinueDemo = () => {
    // Keep current demo session, just navigate back
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-dark/5 to-white flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-brand-gray mb-6 hover:text-brand-dark transition-colors"
        >
          <ArrowLeft size={16} /> 返回
        </button>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-brand-border/10 p-8">
          {/* Logo / Title */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-brand-dark rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-white text-2xl font-bold">A</span>
            </div>
            <h1 className="text-xl font-bold text-brand-dark">APEX</h1>
            <p className="text-xs text-brand-gray mt-1">登录以同步你的数据，跨设备使用</p>
          </div>

          {/* Tabs */}
          <div className="flex bg-brand-light-gray rounded-2xl p-1 mb-6">
            <button
              onClick={() => setActiveTab('email')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'email'
                  ? 'bg-white text-brand-dark shadow-sm'
                  : 'text-brand-gray/60'
              }`}
            >
              <Mail size={14} /> 邮箱
            </button>
            <button
              onClick={() => setActiveTab('phone')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'phone'
                  ? 'bg-white text-brand-dark shadow-sm'
                  : 'text-brand-gray/60'
              }`}
            >
              <Smartphone size={14} /> 手机
            </button>
            <button
              onClick={() => setActiveTab('demo')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'demo'
                  ? 'bg-white text-brand-dark shadow-sm'
                  : 'text-brand-gray/60'
              }`}
            >
              <User size={14} /> 游客
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'email' && <EmailLogin />}

          {activeTab === 'phone' && <PhoneLogin />}

          {activeTab === 'demo' && (
            <div className="space-y-4">
              <div className="px-4 py-3 bg-amber-50 border border-amber-200/60 rounded-2xl">
                <p className="text-xs text-amber-800 leading-relaxed">
                  <span className="font-bold">⚠️ 游客模式限制</span><br/>
                  发帖身份绑定当前浏览器，换设备/换浏览器后无法查看历史数据。建议注册账号以获得完整体验。
                </p>
              </div>
              <button
                onClick={handleContinueDemo}
                className="w-full py-3.5 bg-white border-2 border-brand-dark text-brand-dark rounded-2xl font-bold text-sm hover:bg-brand-dark hover:text-white transition-all"
              >
                继续使用游客模式
              </button>
            </div>
          )}
        </div>

        {/* Footer note */}
        <p className="text-[11px] text-brand-gray text-center mt-6">
          登录后，你的帖子、评论将跨设备同步。
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
