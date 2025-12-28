import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { CompanyValidator } from '../../components/CompanyPanel';

export const CompanyValidatePage = () => {
  const [activeTab, setActiveTab] = useState('validate');

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <CompanyValidator />
    </Layout>
  );
};
