import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { CompanyHistory } from '../../components/CompanyPanel';

export const CompanyHistoryPage = () => {
  const [activeTab, setActiveTab] = useState('history');

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <CompanyHistory />
    </Layout>
  );
};
