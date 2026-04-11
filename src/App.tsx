import React from 'react';
import { HashRouter as Router, Route, Routes, Link } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import BBSCenter from '../components/BBSCenter';
import Feedback from '../components/Feedback';
import MaterialChecklistCenter from '../components/MaterialChecklistCenter';
import ScenarioCenter from '../components/ScenarioCenter';
import SkillDetail from '../components/SkillDetail';
import SkillsLibrary from '../components/SkillsLibrary';
import UpdateLog from '../components/UpdateLog';
import UsageInstructions from '../components/UsageInstructions';
import AcceptanceCalculator from '../components/tools/AcceptanceCalculator';
import BatchBillingTool from '../components/tools/BatchBillingTool';
import BusinessGuide from '../components/tools/BusinessGuide';
import FeeDiscountTool from '../components/tools/FeeDiscountTool';
import NewsTypesettingAssistant from '../components/tools/NewsTypesettingAssistant';
import RateOfferTool from '../components/tools/RateOfferTool';
import SensitiveCommAssistant from '../components/tools/SensitiveCommAssistant';
import FeedPage from './pages/Feed';
import HomePage from './pages/Home';
import MessagesPage from './pages/Messages';
import ProfilePage from './pages/Profile';
import PublishPage from './pages/Publish';

/* ─── 404 Not Found ─── */
const NotFoundPage = () => (
  <AppLayout title="页面未找到">
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      <div className="text-7xl font-black text-brand-dark/10 mb-4">404</div>
      <h2 className="text-xl font-bold text-brand-dark mb-2">找不到这个页面</h2>
      <p className="text-sm text-brand-gray mb-8">你访问的路径不存在，或者页面已被移除。</p>
      <Link
        to="/"
        className="px-8 py-3 bg-brand-dark text-white rounded-2xl font-bold text-sm hover:bg-brand-dark/90 transition-all shadow-lg"
      >
        返回首页
      </Link>
    </div>
  </AppLayout>
);

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* ─── 首页 & 社交页（自带 AppLayout） ─── */}
        <Route path="/" element={<HomePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/feed" element={<FeedPage />} />
        <Route path="/publish" element={<PublishPage />} />
        <Route path="/messages" element={<MessagesPage />} />

        {/* ─── 场景中心（自带 AppLayout） ─── */}
        <Route path="/scenarios" element={<ScenarioCenter />} />

        {/* ─── 业务工具（统一使用 AppLayout） ─── */}
        <Route path="/skills" element={<AppLayout title="Skills 工具库"><SkillsLibrary /></AppLayout>} />
        <Route path="/skills/:id" element={<AppLayout title="Skill 详情" showBack><SkillDetail /></AppLayout>} />
        <Route path="/rate-offer" element={<AppLayout title="利率优惠签报" showBack><RateOfferTool /></AppLayout>} />
        <Route path="/acceptance-calculator" element={<AppLayout title="银承/存单测算" showBack><AcceptanceCalculator /></AppLayout>} />
        <Route path="/fee-discount" element={<AppLayout title="费用优惠申请" showBack><FeeDiscountTool /></AppLayout>} />
        <Route path="/news-assistant" element={<AppLayout title="宣传稿排版助手" showBack><NewsTypesettingAssistant /></AppLayout>} />
        <Route path="/batch-billing" element={<AppLayout title="批量开票工具" showBack><BatchBillingTool /></AppLayout>} />
        <Route path="/sensitive-comm" element={<AppLayout title="敏感沟通助手" showBack><SensitiveCommAssistant /></AppLayout>} />
        <Route path="/business-guide" element={<AppLayout title="业务通" showBack><BusinessGuide /></AppLayout>} />
        <Route path="/material-checklist" element={<AppLayout title="材料清单中心" showBack><MaterialChecklistCenter /></AppLayout>} />

        {/* ─── 信息页 ─── */}
        <Route path="/updates" element={<AppLayout title="更新日志" showBack><UpdateLog /></AppLayout>} />
        <Route path="/feedback" element={<AppLayout title="反馈共创" showBack><Feedback /></AppLayout>} />
        <Route path="/bbs" element={<AppLayout title="讨论区"><BBSCenter /></AppLayout>} />
        <Route path="/instructions" element={<AppLayout title="使用说明" showBack><UsageInstructions /></AppLayout>} />

        {/* ─── 404 Fallback ─── */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
};

export default App;
