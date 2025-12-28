import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { AdminCompanies } from '../../components/AdminPanel';

export const AdminCompaniesPage = () => {
  const [activeTab, setActiveTab] = useState('companies');

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <AdminCompanies />
    </Layout>
  );
};
