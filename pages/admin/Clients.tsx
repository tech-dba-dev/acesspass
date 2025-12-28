import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { AdminClients } from '../../components/AdminPanel';

export const AdminClientsPage = () => {
  const [activeTab, setActiveTab] = useState('users');

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <AdminClients />
    </Layout>
  );
};
