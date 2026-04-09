
import React, { useState, useEffect } from 'react';
import { 
  User, 
  Settings, 
  Bookmark, 
  FileText, 
  Shield, 
  ChevronRight, 
  LogOut,
  HelpCircle,
  Award
} from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import { apiService } from '../services/api';
import { User as UserType } from '../types';
import { cn } from '../../lib/utils';

const Profile: React.FC = () => {
  const [user, setUser] = useState<UserType | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const data = await apiService.getCurrentUser();
      setUser(data);
    };
    fetchUser();
  }, []);

  const menuItems = [
    { icon: FileText, label: '我的发布', count: '12', path: '/profile/posts' },
    { icon: Bookmark, label: '我的收藏', count: '24', path: '/profile/bookmarks' },
    { icon: Award, label: '我的成就', count: 'Lv.4', path: '/profile/achievements' },
  ];

  const settingsItems = [
    { icon: Settings, label: '系统设置', path: '/settings' },
    { icon: HelpCircle, label: '帮助与反馈', path: '/help' },
    { icon: Shield, label: '隐私与安全', path: '/privacy' },
  ];

  return (
    <AppLayout title="我的">
      <div className="px-4 py-8 space-y-8">
        {/* User Profile Header */}
        <section className="flex flex-col items-center text-center space-y-4 animate-fade-in">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-brand-light-gray p-1 border-2 border-brand-gold/20 overflow-hidden shadow-xl">
              <img 
                src={user?.avatar} 
                alt={user?.nickname} 
                className="w-full h-full object-cover rounded-full"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-brand-dark text-white rounded-full flex items-center justify-center border-4 border-brand-offwhite shadow-lg">
              <Award size={14} className="text-brand-gold" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-serif text-brand-dark tracking-tight">{user?.nickname || '加载中...'}</h2>
            <p className="text-xs text-brand-gray font-bold uppercase tracking-[0.2em] mt-1 opacity-60">{user?.role === 'admin' ? '高级管理员' : '客户经理'}</p>
          </div>
          <button className="px-6 py-2 bg-white border border-brand-border/10 rounded-full text-xs font-bold text-brand-dark shadow-sm hover:shadow-md transition-all active:scale-95">
            编辑资料
          </button>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-3 gap-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          {menuItems.map((item, idx) => (
            <div key={idx} className="bg-white p-4 rounded-2xl border border-brand-border/10 shadow-sm flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-brand-light-gray flex items-center justify-center text-brand-dark opacity-80">
                <item.icon size={20} />
              </div>
              <span className="text-xs font-bold text-brand-dark">{item.count}</span>
              <span className="text-[10px] font-bold text-brand-gray uppercase tracking-widest opacity-60">{item.label}</span>
            </div>
          ))}
        </section>

        {/* Settings List */}
        <section className="bg-white rounded-[2rem] border border-brand-border/10 shadow-sm overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {settingsItems.map((item, idx) => (
            <div 
              key={idx} 
              className={cn(
                "px-6 py-4 flex items-center justify-between hover:bg-brand-light-gray/30 transition-all active:bg-brand-light-gray/50 cursor-pointer",
                idx !== settingsItems.length - 1 && "border-b border-brand-border/5"
              )}
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-brand-light-gray flex items-center justify-center text-brand-gray">
                  <item.icon size={18} />
                </div>
                <span className="text-sm font-bold text-brand-dark">{item.label}</span>
              </div>
              <ChevronRight size={16} className="text-brand-gray opacity-20" />
            </div>
          ))}
        </section>

        {/* Admin Entry (Conditional) */}
        {user?.role === 'admin' && (
          <section className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="p-6 bg-brand-dark text-white rounded-[2rem] shadow-xl relative overflow-hidden group cursor-pointer">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <Shield size={60} />
              </div>
              <div className="relative z-10">
                <h3 className="text-lg font-serif tracking-tight mb-1">管理后台入口</h3>
                <p className="text-xs text-white/60 font-medium">内容审核、用户管理与数据统计</p>
                <div className="mt-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-brand-gold">
                  立即进入 <ChevronRight size={12} />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Logout Button */}
        <section className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <button className="w-full py-4 bg-red-50 text-red-500 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-100 transition-all active:scale-95">
            <LogOut size={18} /> 退出登录
          </button>
          <p className="text-center text-[10px] text-brand-gray mt-6 opacity-40 font-bold uppercase tracking-widest">
            版本 v1.2.0 • 金融赋能助手
          </p>
        </section>
      </div>
    </AppLayout>
  );
};

export default Profile;
