import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { Profile } from '../Profile';

export const CompanyProfilePage = () => {
  const [activeTab, setActiveTab] = useState('company-profile');

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <Profile />
    </Layout>
  );
};
