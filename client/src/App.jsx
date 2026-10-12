import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Spinner } from './components/UI/Spinner';

// Layouts
import { AuthLayout } from './layouts/AuthLayout';
import { DashboardLayout } from './layouts/DashboardLayout';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Employee Pages
import { EmployeeDashboard } from './pages/employee/EmployeeDashboard';
import { CreateVoucherPage } from './pages/employee/CreateVoucherPage';
import { EditVoucherPage } from './pages/employee/EditVoucherPage';
import { MyVouchersPage } from './pages/employee/MyVouchersPage';

// Director Pages
import { DirectorDashboard } from './pages/director/DirectorDashboard';
import { PendingApprovalsPage } from './pages/director/PendingApprovalsPage';
import { AllVouchersDirectorPage } from './pages/director/AllVouchersDirectorPage';

// Accounts Pages
import { AccountsDashboard } from './pages/accounts/AccountsDashboard';
import { AllVouchersAccountsPage } from './pages/accounts/AllVouchersAccountsPage';

// Shared Detail Page
import { VoucherDetailPage } from './pages/employee/VoucherDetailPage';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Role Authorization Wrapper
const RoleRoute = ({ allowedRoles = [], children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user || !allowedRoles.includes(user.role)) {
    // Redirect user to their appropriate role home page
    if (user?.role === 'Director') return <Navigate to="/director/dashboard" replace />;
    if (user?.role === 'Accounts') return <Navigate to="/accounts/dashboard" replace />;
    return <Navigate to="/employee/dashboard" replace />;
  }

  return children;
};

// Default Route Redirector
const DefaultRedirect = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (user?.role === 'Director') return <Navigate to="/director/dashboard" replace />;
  if (user?.role === 'Accounts') return <Navigate to="/accounts/dashboard" replace />;
  return <Navigate to="/employee/dashboard" replace />;
};

export function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public Auth Routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* Dashboard Shell with Protected & Role-gated Routes */}
            <Route
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              {/* Employee Routes */}
              <Route
                path="/employee/dashboard"
                element={
                  <RoleRoute allowedRoles={['Employee']}>
                    <EmployeeDashboard />
                  </RoleRoute>
                }
              />
              <Route
                path="/employee/vouchers/new"
                element={
                  <RoleRoute allowedRoles={['Employee']}>
                    <CreateVoucherPage />
                  </RoleRoute>
                }
              />
              <Route
                path="/employee/vouchers/:id/edit"
                element={
                  <RoleRoute allowedRoles={['Employee']}>
                    <EditVoucherPage />
                  </RoleRoute>
                }
              />
              <Route
                path="/employee/vouchers"
                element={
                  <RoleRoute allowedRoles={['Employee']}>
                    <MyVouchersPage />
                  </RoleRoute>
                }
              />
              <Route
                path="/employee/vouchers/:id"
                element={
                  <RoleRoute allowedRoles={['Employee']}>
                    <VoucherDetailPage />
                  </RoleRoute>
                }
              />

              {/* Director Routes */}
              <Route
                path="/director/dashboard"
                element={
                  <RoleRoute allowedRoles={['Director']}>
                    <DirectorDashboard />
                  </RoleRoute>
                }
              />
              <Route
                path="/director/approvals"
                element={
                  <RoleRoute allowedRoles={['Director']}>
                    <PendingApprovalsPage />
                  </RoleRoute>
                }
              />
              <Route
                path="/director/vouchers"
                element={
                  <RoleRoute allowedRoles={['Director']}>
                    <AllVouchersDirectorPage />
                  </RoleRoute>
                }
              />
              <Route
                path="/director/vouchers/:id"
                element={
                  <RoleRoute allowedRoles={['Director']}>
                    <VoucherDetailPage />
                  </RoleRoute>
                }
              />

              {/* Accounts Routes */}
              <Route
                path="/accounts/dashboard"
                element={
                  <RoleRoute allowedRoles={['Accounts']}>
                    <AccountsDashboard />
                  </RoleRoute>
                }
              />
              <Route
                path="/accounts/vouchers"
                element={
                  <RoleRoute allowedRoles={['Accounts']}>
                    <AllVouchersAccountsPage />
                  </RoleRoute>
                }
              />
              <Route
                path="/accounts/vouchers/:id"
                element={
                  <RoleRoute allowedRoles={['Accounts']}>
                    <VoucherDetailPage />
                  </RoleRoute>
                }
              />
            </Route>

            {/* Catch All Redirect */}
            <Route path="*" element={<DefaultRedirect />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
