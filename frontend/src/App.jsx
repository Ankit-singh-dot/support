import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoadingSpinner from './components/common/LoadingSpinner';
import OnboardingModal from './components/auth/OnboardingModal';

// Pages
import HomePage from './pages/HomePage';

// Dedicated Auth Pages (No Clerk for Admin & Agent!)
import AdminLoginPage from './pages/auth/AdminLoginPage';
import AgentLoginPage from './pages/auth/AgentLoginPage';
import CustomerLoginPage from './pages/auth/CustomerLoginPage';

// Layouts
import CustomerLayout from './components/layout/CustomerLayout';
import StaffLayout from './components/layout/StaffLayout';
import RoleGuard from './components/auth/RoleGuard';
import CustomerAuthGuard from './components/auth/CustomerAuthGuard';

// Customer Pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CustomerTickets from './pages/customer/CustomerTickets';
import CreateTicket from './pages/customer/CreateTicket';
import CustomerTicketDetails from './pages/customer/CustomerTicketDetails';

// Staff Pages
import StaffDashboard from './pages/staff/StaffDashboard';
import AgentWorkspace from './pages/staff/AgentWorkspace';
import AllTickets from './pages/staff/AllTickets';
import AssignedTickets from './pages/staff/AssignedTickets';
import StaffTicketDetails from './pages/staff/StaffTicketDetails';
import AgentManagement from './pages/staff/AgentManagement';

import NotFound from './pages/NotFound';

export function App() {
  const { user, isSignedIn } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // When signed in through Clerk, check if the Customer profile details are complete
    if (isSignedIn && user && user.role === 'CUSTOMER') {
      const hasPhone = Boolean(user.phone && String(user.phone).trim().length >= 4);
      const isComplete = Boolean(user.onboarded && hasPhone);
      setShowOnboarding(!isComplete);
    } else {
      setShowOnboarding(false);
    }
  }, [isSignedIn, user]);

  return (
    <>
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />

      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<HomePage />} />

        {/* Dedicated Non-Clerk Login Routes for Admin and Agent */}
        <Route path="/login/admin" element={<AdminLoginPage />} />
        <Route path="/admin/agent" element={<AgentLoginPage />} />
        <Route path="/login/agent" element={<AgentLoginPage />} />

        {/* Customer Login Routes */}
        <Route path="/login/costuemer" element={<CustomerLoginPage />} />
        <Route path="/login/customer" element={<CustomerLoginPage />} />
        <Route path="/login" element={<Navigate to="/login/customer" replace />} />

        {/* Shortcut to Agent Portal */}
        <Route path="/agent" element={<Navigate to="/login/agent" replace />} />

        {/* Customer Portal Routes */}
        <Route
          path="/portal"
          element={
            <CustomerAuthGuard>
              <CustomerLayout />
            </CustomerAuthGuard>
          }
        >
          <Route index element={<Navigate to="/portal/dashboard" replace />} />
          <Route path="dashboard" element={<CustomerDashboard />} />
          <Route path="tickets" element={<CustomerTickets />} />
          <Route path="tickets/new" element={<CreateTicket />} />
          <Route path="tickets/:id" element={<CustomerTicketDetails />} />
        </Route>

        {/* Staff Workspace Routes (Agent & Admin) */}
        <Route
          path="/staff"
          element={
            <RoleGuard allowedRoles={['AGENT', 'ADMIN']}>
              <StaffLayout />
            </RoleGuard>
          }
        >
          <Route index element={<Navigate to="/staff/dashboard" replace />} />
          <Route path="dashboard" element={<StaffDashboard />} />
          <Route path="agent" element={<AgentWorkspace />} />
          <Route path="tickets" element={<AllTickets />} />
          <Route path="assigned" element={<AssignedTickets />} />
          <Route path="tickets/:id" element={<StaffTicketDetails />} />
          {/* Admin only */}
          <Route
            path="agents"
            element={
              <RoleGuard allowedRoles={['ADMIN']}>
                <AgentManagement />
              </RoleGuard>
            }
          />
        </Route>

        {/* 404 Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
