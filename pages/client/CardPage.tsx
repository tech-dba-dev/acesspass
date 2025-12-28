import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { ClientCard } from '../../components/ClientPanel';

export const ClientCardPage = () => {
  const [activeTab, setActiveTab] = useState('my-card');

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <ClientCard />
    </Layout>
  );
};
