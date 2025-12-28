import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { ClientProfile } from '../../components/ClientProfile';

export const ClientProfilePage = () => {
  const [activeTab, setActiveTab] = useState('client-profile');

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <ClientProfile />
    </Layout>
  );
};
