import React, { useState } from 'react';
import { AdminDataProvider, useAdminData } from './admin/AdminDataContext';
import { AdminLogin } from './AdminLogin';
import { AdminLayout } from './admin/AdminLayout';
import { AdminDashboard } from './admin/AdminDashboard';
import { AdminProducts } from './admin/AdminProducts';
import { AdminAnnouncements } from './admin/AdminAnnouncements';
import { AdminActivity } from './admin/AdminActivity';
import { AdminSettings } from './admin/AdminSettings';


function AdminContent() {
  const { user, setUser, isFirebaseActive } = useAdminData();
  const [currentTab, setCurrentTab] = useState('dashboard');

  if (!user) {
    return <AdminLogin onLogin={setUser} />;
  }

  const renderTab = () => {
    switch (currentTab) {
      case 'dashboard': return <AdminDashboard onNavigate={setCurrentTab} />;
      case 'products': return <AdminProducts />;
      case 'announcements': return <AdminAnnouncements />;
      case 'activity': return <AdminActivity />;
      case 'settings': return <AdminSettings />;
      default: return <AdminDashboard />;
    }
  };

  return (
    <AdminLayout
      user={user}
      currentTab={currentTab}
      onTabChange={setCurrentTab}
      onLogout={() => setUser(null)}
      isFirebaseActive={isFirebaseActive}
    >
      {renderTab()}
    </AdminLayout>
  );
}

export function Admin() {
  return <AdminContent />;
}

