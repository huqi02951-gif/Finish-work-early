import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './components/Home';
import ScenarioCenter from './components/ScenarioCenter';
import SkillsLibrary from './components/SkillsLibrary';
import UpdateLog from './components/UpdateLog';
import UsageInstructions from './components/UsageInstructions';
import Feedback from './components/Feedback';
import SkillDetail from './components/SkillDetail';
import RateOfferTool from './components/tools/RateOfferTool';
import AcceptanceCalculator from './components/tools/AcceptanceCalculator';
import FeeDiscountTool from './components/tools/FeeDiscountTool';
import NewsTypesettingAssistant from './components/tools/NewsTypesettingAssistant';
import BatchBillingTool from './components/tools/BatchBillingTool';
import SensitiveCommAssistant from './components/tools/SensitiveCommAssistant';

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/scenarios" element={<ScenarioCenter />} />
          <Route path="/skills" element={<SkillsLibrary />} />
          <Route path="/skills/:id" element={<SkillDetail />} />
          <Route path="/rate-offer" element={<RateOfferTool />} />
          <Route path="/acceptance-calculator" element={<AcceptanceCalculator />} />
          <Route path="/fee-discount" element={<FeeDiscountTool />} />
          <Route path="/news-assistant" element={<NewsTypesettingAssistant />} />
          <Route path="/batch-billing" element={<BatchBillingTool />} />
          <Route path="/sensitive-comm" element={<SensitiveCommAssistant />} />
          <Route path="/updates" element={<UpdateLog />} />
          <Route path="/instructions" element={<UsageInstructions />} />
          <Route path="/feedback" element={<Feedback />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
