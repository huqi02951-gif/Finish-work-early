
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, NavLink, useLocation } from 'react-router-dom';
import { 
  User, 
  Settings, 
  Bookmark, 
  FileText, 
  Shield, 
  ChevronRight, 
  LogOut,
  HelpCircle,
  Award,
  Heart,
  MessageCircle,
  Zap,
  Sparkles,
  Trophy
} from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import { apiService } from '../services/api';
import { User as UserType } from '../types';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const Profile: React.FC = () => {
  const [user, setUser] = useState<UserType | null>(null);
  const [activeTab, setActiveTab] = useState<'activity' | 'stats'>('activity');

  useEffect(() => {
    const fetchUser = async () => {
      const data = await apiService.getCurrentUser();
      setUser(data);
    };
    fetchUser();
  }, []);

  const stats = [
    { label: '获赞', value: '1,284', icon: Heart, color: 'text-apple-pink' },
    { label: '收藏', value: '256', icon: Bookmark, color: 'text-apple-blue' },
    { label: '积分', value: '8,420', icon: Zap, color: 'text-brand-gold' },
  ];

  const activitySummary = [
    { id: 1, type: 'post', title: '关于新产品定价的几点思考', time: '2小时前', likes: 45, comments: 12 },
    { id: 2, type: 'comment', title: '回复了：如何提高拓客效率？', time: '昨天', likes: 8, comments: 0 },
    { id: 3, type: 'post', title: '分享一个超实用的敏感沟通话术模板', time: '3天前', likes: 128, comments: 34 },
  ];

  const menuItems = [
    { icon: FileText, label: '我的发布', count: '12', path: '/profile/posts' },
    { icon: Trophy, label: '成就勋章', count: '8', path: '/profile/achievements' },
    { icon: Settings, label: '偏好设置', path: '/settings' },
  ];

  return (
    <AppLayout title="我的">
      <div className="pb-24 bg-brand-offwhite min-h-screen">
        {/* Apple Event Style Header */}
        <section className="relative pt-16 pb-12 px-8 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full apple-event-gradient opacity-30 pointer-events-none" />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 flex flex-col items-center text-center"
          >
            <div className="inline-block px-3 py-1 rounded-full bg-brand-dark/5 text-[9px] font-bold tracking-[0.3em] uppercase mb-8 opacity-40">
              finish work early
            </div>

            <div className="relative mb-6">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="w-28 h-28 rounded-full bg-white p-1.5 shadow-2xl border border-brand-border/5 overflow-hidden relative z-10"
              >
                <img 
                  src={user?.avatar || 'https://picsum.photos/seed/user/200/200'} 
                  alt={user?.nickname} 
                  className="w-full h-full object-cover rounded-full grayscale hover:grayscale-0 transition-all duration-500"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-2 border border-dashed border-apple-blue/20 rounded-full"
              />
              <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-brand-dark text-white rounded-full flex items-center justify-center border-4 border-brand-offwhite shadow-lg z-20">
                <Award size={18} className="text-brand-gold" />
              </div>
            </div>

            <h2 className="text-3xl font-bold text-brand-dark tracking-tight mb-2">
              {user?.nickname || '客户经理'}
            </h2>
            <div className="flex items-center gap-2 px-4 py-1.5 bg-brand-dark text-white rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg">
              <Sparkles size={12} className="text-brand-gold" />
              {user?.role === 'admin' ? 'Senior Manager' : 'Professional Agent'}
            </div>
          </motion.div>
        </section>

        {/* Interactive Stats Grid */}
        <section className="px-6 -mt-6 relative z-20">
          <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-xl border border-white/20 grid grid-cols-3 gap-4">
            {stats.map((stat, idx) => (
              <motion.div 
                key={idx}
                whileTap={{ scale: 0.95 }}
                className="flex flex-col items-center gap-1"
              >
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-1", stat.color, "bg-current/5")}>
                  <stat.icon size={20} />
                </div>
                <span className="text-xl font-bold text-brand-dark tracking-tight">{stat.value}</span>
                <span className="text-[10px] font-bold text-brand-gray uppercase tracking-widest opacity-40">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Activity Summary Section */}
        <section className="px-6 mt-10">
          <div className="flex items-center justify-between mb-6 px-2">
            <h3 className="text-xl font-bold tracking-tight text-brand-dark">动态汇总</h3>
            <button className="text-xs font-bold text-apple-blue">查看全部</button>
          </div>

          <div className="space-y-4">
            {activitySummary.map((activity, idx) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-5 rounded-3xl border border-brand-border/5 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      activity.type === 'post' ? "bg-apple-blue/10 text-apple-blue" : "bg-apple-purple/10 text-apple-purple"
                    )}>
                      {activity.type === 'post' ? <FileText size={16} /> : <MessageCircle size={16} />}
                    </div>
                    <span className="text-[10px] font-bold text-brand-gray uppercase tracking-widest">{activity.time}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-brand-gray/40">
                      <Heart size={12} /> {activity.likes}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-brand-gray/40">
                      <MessageCircle size={12} /> {activity.comments}
                    </div>
                  </div>
                </div>
                <h4 className="text-sm font-bold text-brand-dark group-hover:text-apple-blue transition-colors line-clamp-2 leading-relaxed">
                  {activity.title}
                </h4>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Quick Menu */}
        <section className="px-6 mt-10 space-y-3">
          {menuItems.map((item, idx) => (
            <Link 
              key={idx}
              to={item.path}
              className="flex items-center justify-between p-5 bg-white rounded-3xl border border-brand-border/5 shadow-sm hover:shadow-md transition-all active:scale-[0.98] group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-light-gray flex items-center justify-center text-brand-dark opacity-60 group-hover:text-apple-blue group-hover:bg-apple-blue/5 transition-all">
                  <item.icon size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-brand-dark">{item.label}</h4>
                  {item.count && <p className="text-[10px] text-brand-gray font-bold uppercase tracking-widest mt-0.5">{item.count} 项内容</p>}
                </div>
              </div>
              <ChevronRight size={18} className="text-brand-border group-hover:text-apple-blue transition-all" />
            </Link>
          ))}
        </section>

        {/* Logout & Branding */}
        <section className="px-8 py-12 text-center">
          <button className="w-full py-5 bg-red-50 text-red-500 rounded-3xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-100 transition-all active:scale-95 mb-8">
            <LogOut size={18} /> 退出登录
          </button>
          
          <div className="space-y-2 opacity-30">
            <p className="text-[10px] font-bold text-brand-gray uppercase tracking-[0.4em]">finish work early</p>
            <p className="text-[9px] text-brand-gray font-medium">© 2026 客户经理agent+skills很强很强！</p>
          </div>
        </section>
      </div>
    </AppLayout>
  );
};

export default Profile;
