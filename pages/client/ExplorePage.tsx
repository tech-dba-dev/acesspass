import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { ClientExplore } from '../../components/ClientPanel';

export const ClientExplorePage = () => {
  const [activeTab, setActiveTab] = useState('explore');

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <ClientExplore />
    </Layout>
  );
};
