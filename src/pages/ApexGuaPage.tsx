import React from 'react';
import AppLayout from '../components/layout/AppLayout';
import { ApexGuaApp } from '../components/gua/ApexGuaApp';

const ApexGuaPage: React.FC = () => {
  return (
    <AppLayout title="Apex 算一卦" showBack>
      <div className="min-h-[calc(100vh-3.5rem)] bg-[#fafafa] px-4 py-6 flex items-start justify-center">
        <ApexGuaApp />
      </div>
    </AppLayout>
  );
};

export default ApexGuaPage;
