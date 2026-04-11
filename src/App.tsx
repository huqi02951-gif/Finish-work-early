import React from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import BBSCenter from '../components/BBSCenter';
import Feedback from '../components/Feedback';
import Layout from '../components/Layout';
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

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route
          path="/scenarios"
          element={<ScenarioCenter />}
        />
        <Route
          path="/skills"
          element={
            <Layout>
              <SkillsLibrary />
            </Layout>
          }
        />
        <Route
          path="/updates"
          element={
            <Layout>
              <UpdateLog />
            </Layout>
          }
        />
        <Route
          path="/feedback"
          element={
            <Layout>
              <Feedback />
            </Layout>
          }
        />
        <Route
          path="/bbs"
          element={
            <Layout>
              <BBSCenter />
            </Layout>
          }
        />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/feed" element={<FeedPage />} />
        <Route path="/publish" element={<PublishPage />} />
        <Route path="/messages" element={<MessagesPage />} />

        <Route
          path="/skills/:id"
          element={
            <Layout>
              <SkillDetail />
            </Layout>
          }
        />
        <Route
          path="/rate-offer"
          element={
            <Layout>
              <RateOfferTool />
            </Layout>
          }
        />
        <Route
          path="/acceptance-calculator"
          element={
            <Layout>
              <AcceptanceCalculator />
            </Layout>
          }
        />
        <Route
          path="/fee-discount"
          element={
            <Layout>
              <FeeDiscountTool />
            </Layout>
          }
        />
        <Route
          path="/news-assistant"
          element={
            <Layout>
              <NewsTypesettingAssistant />
            </Layout>
          }
        />
        <Route
          path="/batch-billing"
          element={
            <Layout>
              <BatchBillingTool />
            </Layout>
          }
        />
        <Route
          path="/sensitive-comm"
          element={
            <Layout>
              <SensitiveCommAssistant />
            </Layout>
          }
        />
        <Route
          path="/business-guide"
          element={
            <Layout>
              <BusinessGuide />
            </Layout>
          }
        />
        <Route
          path="/material-checklist"
          element={
            <Layout>
              <MaterialChecklistCenter />
            </Layout>
          }
        />
        <Route
          path="/instructions"
          element={
            <Layout>
              <UsageInstructions />
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
