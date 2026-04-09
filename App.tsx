import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
// New Pages
import HomePage from './src/pages/Home';
import FeedPage from './src/pages/Feed';
import PublishPage from './src/pages/Publish';
import MessagesPage from './src/pages/Messages';
import ProfilePage from './src/pages/Profile';

// Existing Components
import ScenarioCenter from './components/ScenarioCenter';
import SkillsLibrary from './components/SkillsLibrary';
import UpdateLog from './components/UpdateLog';
import UsageInstructions from './components/UsageInstructions';
import Feedback from './components/Feedback';
import BBSCenter from './components/BBSCenter';
import MaterialChecklistCenter from './components/MaterialChecklistCenter';
import SkillDetail from './components/SkillDetail';
import RateOfferTool from './components/tools/RateOfferTool';
import AcceptanceCalculator from './components/tools/AcceptanceCalculator';
import FeeDiscountTool from './components/tools/FeeDiscountTool';
import NewsTypesettingAssistant from './components/tools/NewsTypesettingAssistant';
import BatchBillingTool from './components/tools/BatchBillingTool';
import SensitiveCommAssistant from './components/tools/SensitiveCommAssistant';
import BusinessGuide from './components/tools/BusinessGuide';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Main Navigation Hub */}
        <Route path="/" element={<HomePage />} />

        {/* Core Four Modules */}
        <Route path="/scenarios" element={<ScenarioCenter />} />
        <Route path="/skills" element={<SkillsLibrary />} />
        <Route path="/updates" element={<UpdateLog />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/bbs" element={<BBSCenter />} />
        <Route path="/profile" element={<ProfilePage />} />

        {/* Sub-pages & Tools */}
        <Route path="/skills/:id" element={<SkillDetail />} />
        <Route path="/rate-offer" element={<RateOfferTool />} />
        <Route path="/acceptance-calculator" element={<AcceptanceCalculator />} />
        <Route path="/fee-discount" element={<FeeDiscountTool />} />
        <Route path="/news-assistant" element={<NewsTypesettingAssistant />} />
        <Route path="/batch-billing" element={<BatchBillingTool />} />
        <Route path="/sensitive-comm" element={<SensitiveCommAssistant />} />
        <Route path="/business-guide" element={<BusinessGuide />} />
        <Route path="/material-checklist" element={<MaterialChecklistCenter />} />
        <Route path="/instructions" element={<UsageInstructions />} />
      </Routes>
    </Router>
  );
};

export default App;
