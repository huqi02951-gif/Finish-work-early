
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Zap, 
  Clock, 
  ChevronRight,
  MessageSquare,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

const Home: React.FC = () => {
  return (
    <AppLayout title="客户经理 Agent + Skills 很强很强！">
      <div className="pb-24 relative overflow-hidden bg-white">
        {/* Subtle Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] apple-event-gradient pointer-events-none opacity-50" />

        {/* Hero Section - Apple Event Typography */}
        <section className="px-8 pt-20 pb-16 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-[13px] font-bold text-apple-blue uppercase tracking-[0.3em] mb-6">让专业，信手拈来</p>
            <h2 className="text-5xl md:text-8xl font-bold tracking-tight mb-8 apple-text-gradient leading-[1.05]">
              客户经理 Agent<br />+ Skills <span className="text-apple-blue">很强很强！</span>
            </h2>
            <p className="text-lg md:text-2xl text-brand-gray font-medium max-w-2xl mx-auto leading-relaxed">
              将枯燥的产品逻辑转化为生动的实战智慧，<br className="hidden md:block" />
              让复杂的营销打法变得如呼吸般简单。
            </p>
          </motion.div>
        </section>

        {/* Core Modules - Apple Style Grid */}
        <section className="px-6 grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10 mb-20">
          {[
            { 
              id: 'scenarios', 
              title: '场景中心', 
              desc: '按业务场景组织，直观展示每个环节下的赋能工具。', 
              path: '/scenarios', 
              icon: LayoutDashboard,
              color: 'text-apple-blue',
              bg: 'bg-apple-blue/5'
            },
            { 
              id: 'skills', 
              title: 'Skills 中心', 
              desc: '全量 Skills 展示与检索。把经验、流程、模板固化下来。', 
              path: '/skills', 
              icon: Zap,
              color: 'text-apple-purple',
              bg: 'bg-apple-purple/5'
            },
            { 
              id: 'updates', 
              title: '更新记录中心', 
              desc: '记录 Agent 能力的每一次进化。持续迭代，为一线减负。', 
              path: '/updates', 
              icon: Clock,
              color: 'text-apple-indigo',
              bg: 'bg-apple-indigo/5'
            },
            { 
              id: 'feedback', 
              title: '共创 / 赋能中心', 
              desc: '提交你的场景需求，与 Agent 团队共同打造最强库。', 
              path: '/feedback', 
              icon: MessageSquare,
              color: 'text-apple-pink',
              bg: 'bg-apple-pink/5'
            },
          ].map((item, idx) => (
            <Link 
              key={item.id} 
              to={item.path}
              className="group apple-card p-10 transition-all hover:shadow-2xl hover:shadow-black/5 active:scale-[0.98] flex flex-col justify-between min-h-[260px] border-brand-border/10"
            >
              <div>
                <div className={cn("w-14 h-14 rounded-[20px] flex items-center justify-center mb-8 transition-transform group-hover:scale-110", item.bg, item.color)}>
                  <item.icon size={28} />
                </div>
                <h3 className="text-3xl font-bold text-brand-dark mb-3 tracking-tight">{item.title}</h3>
                <p className="text-base text-brand-gray font-medium leading-relaxed opacity-80">{item.desc}</p>
              </div>
              <div className="flex items-center gap-2 text-[14px] font-bold text-apple-blue mt-8">
                立即进入 <ChevronRight size={18} className="transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </section>

        {/* Featured Skills - Minimalist List */}
        <section className="px-6 mb-20 max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8 px-4">
            <h3 className="text-2xl font-bold tracking-tight">热门 Skills</h3>
            <Link to="/skills" className="text-[15px] font-bold text-apple-blue hover:underline">查看全部</Link>
          </div>
          <div className="space-y-4">
            {[
              { name: '业务打法通', category: '行业判断', path: '/business-guide' },
              { name: '敏感沟通助手', category: '沟通赋能', path: '/sensitive-comm' },
              { name: '银承/存单测算小助手', category: '测算工具', path: '/skills' },
            ].map((skill, idx) => (
              <Link 
                key={idx} 
                to={skill.path}
                className="flex items-center justify-between p-6 bg-brand-light-gray/40 hover:bg-brand-light-gray rounded-[24px] transition-all group active:scale-[0.99]"
              >
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-[16px] bg-white flex items-center justify-center shadow-sm border border-brand-border/5">
                    <Sparkles size={20} className="text-apple-blue" />
                  </div>
                  <div>
                    <h4 className="text-[17px] font-bold text-brand-dark">{skill.name}</h4>
                    <p className="text-[11px] text-brand-gray font-bold uppercase tracking-[0.2em] mt-0.5">{skill.category}</p>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-sm">
                  <ArrowRight size={20} className="text-apple-blue" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Footer Note */}
        <footer className="px-8 py-20 text-center border-t border-brand-border/10 bg-brand-light-gray/20">
          <div className="mb-8 flex justify-center gap-6 opacity-40">
            <div className="w-8 h-8 rounded-full bg-brand-dark" />
            <div className="w-8 h-8 rounded-full bg-apple-blue" />
            <div className="w-8 h-8 rounded-full bg-apple-purple" />
          </div>
          <p className="text-[12px] font-bold text-brand-gray uppercase tracking-[0.4em] mb-3">Designed by XD.HU, Pyllis Feng</p>
          <p className="text-[11px] text-brand-gray/50 font-medium">© 2026 客户经理 Agent + Skills 很强很强！</p>
        </footer>
      </div>
    </AppLayout>
  );
};

export default Home;
