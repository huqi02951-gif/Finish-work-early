import React from 'react';
import { HashRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { ToastProvider } from './components/common/Toast';
import AppLayout from './components/layout/AppLayout';
import Feedback from '../components/Feedback';
import ApexPreviewPage from '../components/ApexPreviewPage';
import MaterialChecklistCenter from '../components/MaterialChecklistCenter';
import ScenarioCenter from '../components/ScenarioCenter';
import SkillDetail from '../components/SkillDetail';
import SkillsLibrary from '../components/SkillsLibrary';
import UpdateLog from '../components/UpdateLog';
import UsageInstructions from '../components/UsageInstructions';
import ProductScenePage from '../components/ProductScenePage';
import UserManual from '../components/UserManual';
import AcceptanceCalculator from '../components/tools/AcceptanceCalculator';
import BatchBillingTool from '../components/tools/BatchBillingTool';
import BusinessGuide from '../components/tools/BusinessGuide';
import FeeDiscountTool from '../components/tools/FeeDiscountTool';
import NewsTypesettingAssistant from '../components/tools/NewsTypesettingAssistant';
import RateOfferTool from '../components/tools/RateOfferTool';
import ChecklistGenerator from '../components/tools/ChecklistGenerator';
import SensitiveCommAssistant from '../components/tools/SensitiveCommAssistant';
import FeedPage from './pages/Feed';
import HomePage from './pages/Home';
import MessagesPage from './pages/Messages';
import ProfilePage from './pages/Profile';
import PublishPage from './pages/Publish';
import WorkspacePage from './pages/Workspace';
import BBSPage from './pages/community/BBS';
import BBSHomePage from './pages/community/BBSHome';
import PantryPage from './pages/community/PantryPage';
import PantryThreadPage from './pages/community/PantryThreadPage';
import ProfessionalZonePage from './pages/community/ProfessionalZone';
import ComposePage from './pages/community/ComposePage';
import CommunityThreadPage from './pages/community/CommunityThread';
import CommunityTopicPage from './pages/community/CommunityTopic';
import FormalThreadPage from './pages/community/FormalThread';
import FormalTopicPage from './pages/community/FormalTopic';
import LoginPage from './pages/auth/LoginPage';

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
    <ToastProvider>
      <Router>
        <Routes>
          {/* ─── 登录页 ─── */}
          <Route path="/login" element={<LoginPage />} />

          {/* ─── 首页 & 社交页（自带 AppLayout） ─── */}
          <Route path="/" element={<HomePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/publish" element={<PublishPage />} />
          <Route path="/messages" element={<MessagesPage />} />

          {/* ─── 场景中心（自带 AppLayout） ─── */}
          <Route path="/scenarios" element={<ScenarioCenter />} />

          {/* ─── 业务工具（组件内自带 AppLayout，此处直接渲染） ─── */}
          <Route path="/skills" element={<SkillsLibrary />} />
          <Route path="/skills/:id" element={<SkillDetail />} />
          <Route path="/rate-offer" element={<RateOfferTool />} />
          <Route path="/acceptance-calculator" element={<AcceptanceCalculator />} />
          <Route path="/fee-discount" element={<FeeDiscountTool />} />
          <Route path="/news-assistant" element={<NewsTypesettingAssistant />} />
          <Route path="/batch-billing" element={<BatchBillingTool />} />
          <Route path="/sensitive-comm" element={<SensitiveCommAssistant />} />
          <Route path="/business-guide" element={<BusinessGuide />} />
          <Route path="/product-scene" element={<ProductScenePage />} />
          <Route path="/apex-preview" element={<ApexPreviewPage />} />
          <Route path="/material-checklist" element={<AppLayout title="材料清单中心" showBack><MaterialChecklistCenter /></AppLayout>} />
          <Route path="/checklist-generator" element={<AppLayout title="检核表生成器" showBack><ChecklistGenerator /></AppLayout>} />

          {/* ─── 信息页（组件内自带 AppLayout） ─── */}
          <Route path="/updates" element={<UpdateLog />} />
          <Route path="/feedback" element={<Feedback />} />

          {/* ─── BBS 社区（双区架构） ─── */}
          <Route path="/bbs" element={<BBSHomePage />} />
          <Route path="/bbs/legacy" element={<BBSPage />} />
          <Route path="/bbs/professional" element={<ProfessionalZonePage />} />
          <Route path="/bbs/pantry" element={<PantryPage />} />
          <Route path="/bbs/pantry/thread/:id" element={<PantryThreadPage />} />
          <Route path="/bbs/compose" element={<ComposePage />} />

          {/* ─── 旧版社区路由（兼容） ─── */}
          <Route path="/bbs/thread/:id" element={<CommunityThreadPage />} />
          <Route path="/bbs/topic/:id" element={<CommunityTopicPage />} />

          <Route path="/instructions" element={<AppLayout title="使用说明" showBack><UsageInstructions /></AppLayout>} />
          <Route path="/manual" element={<UserManual />} />

          {/* ─── 工作台 ─── */}
          <Route path="/workspace" element={<WorkspacePage />} />
          <Route path="/formal/thread/:id" element={<FormalThreadPage />} />
          <Route path="/formal/topic/:id" element={<FormalTopicPage />} />

          {/* ─── 404 Fallback ─── */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
};

export default App;
