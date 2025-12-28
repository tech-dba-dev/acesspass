import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { Profile } from '../Profile';

export const AdminProfilePage = () => {
  const [activeTab, setActiveTab] = useState('admin-profile');

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <Profile />
    </Layout>
  );
};
