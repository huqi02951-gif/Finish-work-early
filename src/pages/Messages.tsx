
import React, { useState, useEffect } from 'react';
import { Bell, MessageSquare, Heart, ShieldCheck, ChevronRight } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import { MOCK_NOTIFICATIONS } from '../mock/data';
import { Notification } from '../types';
import { cn } from '../../lib/utils';

const Messages: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadNotifications = () => {
      setIsLoading(true);
      setNotifications(MOCK_NOTIFICATIONS);
      setIsLoading(false);
    };
    loadNotifications();
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'system': return <ShieldCheck className="text-blue-500" size={20} />;
      case 'comment': return <MessageSquare className="text-emerald-500" size={20} />;
      case 'like': return <Heart className="text-pink-500" size={20} />;
      case 'audit': return <ShieldCheck className="text-amber-500" size={20} />;
      default: return <Bell className="text-brand-gray" size={20} />;
    }
  };

  return (
    <AppLayout title="消息">
      {/* 🧪 本地演示标签 */}
      <div className="mx-4 mt-3 px-4 py-2.5 bg-amber-50 border border-amber-200/60 rounded-2xl flex items-center gap-2">
        <span className="text-sm">🧪</span>
        <span className="text-[11px] text-amber-700 font-medium">本地演示模式 · 数据仅保存在当前浏览器中</span>
      </div>
      <div className="px-4 py-6 space-y-6">
        {/* Notification Types Grid */}
        <div className="grid grid-cols-4 gap-4 animate-fade-in">
          {[
            { label: '系统通知', icon: ShieldCheck, color: 'bg-blue-50' },
            { label: '评论回复', icon: MessageSquare, color: 'bg-emerald-50' },
            { label: '收到的赞', icon: Heart, color: 'bg-pink-50' },
            { label: '审核反馈', icon: ShieldCheck, color: 'bg-amber-50' },
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", item.color)}>
                <item.icon size={20} className="opacity-80" />
              </div>
              <span className="text-[10px] font-bold text-brand-gray">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Notification List */}
        <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <h3 className="text-[10px] font-bold text-brand-gray uppercase tracking-[0.2em] opacity-60 px-1">最近通知</h3>
          
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-white rounded-2xl animate-pulse border border-brand-border/10" />
              ))}
            </div>
          ) : notifications.length > 0 ? (
            <div className="space-y-3">
              {notifications.map((n) => (
                <div 
                  key={n.id} 
                  className={cn(
                    "bg-white p-4 rounded-2xl border border-brand-border/10 shadow-sm flex items-start gap-4 transition-all active:scale-[0.98]",
                    !n.read && "border-l-4 border-l-brand-gold"
                  )}
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-light-gray flex items-center justify-center shrink-0">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-grow">
                    <p className="text-sm font-medium text-brand-dark leading-relaxed">{n.content}</p>
                    <p className="text-[10px] text-brand-gray mt-1 opacity-60 font-bold uppercase tracking-widest">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-brand-gray opacity-20 mt-1" />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center space-y-4 opacity-40">
              <Bell size={48} className="mx-auto" />
              <p className="text-sm font-bold uppercase tracking-widest">暂无新通知</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Messages;
