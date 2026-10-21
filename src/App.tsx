import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LoginPage } from './components/public/LoginPage';
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { AdminPages } from './components/dashboard/admin/AdminPages';
import { StudentPages } from './components/dashboard/student/StudentPages';
import { ParentPages } from './components/dashboard/parent/ParentPages';
import { WardenPages } from './components/dashboard/warden/WardenPages';
import { SecurityPages } from './components/dashboard/security/SecurityPages';
import { ToastContainer } from './components/common/ToastContainer';
import { ParentNotificationModal } from './components/common/ParentNotificationModal';

const GlobalModals: React.FC = () => {
  const { activeParentNotificationModal, setActiveParentNotificationModal } = useApp();
  if (!activeParentNotificationModal) return null;
  return (
    <ParentNotificationModal
      notification={activeParentNotificationModal}
      onClose={() => setActiveParentNotificationModal(null)}
    />
  );
};

const MainContent: React.FC = () => {
  const { currentUser } = useApp();

  // The Login page is the default opening page.
  // When a user is not authenticated, display the Login screen directly.
  if (!currentUser) {
    return <LoginPage />;
  }

  // If user is authenticated, display the Role-Based Dashboard
  return (
    <DashboardLayout>
      {currentUser.role === 'admin' && <AdminPages />}
      {currentUser.role === 'student' && <StudentPages />}
      {currentUser.role === 'parent' && <ParentPages />}
      {currentUser.role === 'warden' && <WardenPages />}
      {currentUser.role === 'security' && <SecurityPages />}
    </DashboardLayout>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
      <GlobalModals />
      <ToastContainer />
    </AppProvider>
  );
}
