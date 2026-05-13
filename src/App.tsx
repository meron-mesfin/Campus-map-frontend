import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
// Layouts
import { DashboardLayout } from './components/layout/DashboardLayout';
// Pages
import { Login } from './pages/Login';
import { Settings } from './pages/Settings';
// Campus Admin Pages
import { CampusDashboard } from './pages/campus/CampusDashboard';
import { Locations } from './pages/campus/Locations';
import { StaffManagement } from './pages/campus/StaffManagement';
import { Feedback } from './pages/campus/Feedback';
import { Reports as CampusReports } from './pages/campus/Reports';
// System Admin Pages
import { SystemDashboard } from './pages/system/SystemDashboard';
import { ManageAdmins } from './pages/system/ManageAdmins';
import { ActivityLogs } from './pages/system/ActivityLogs';
import { SystemReports } from './pages/system/SystemReports';
import { SystemFeedback } from './pages/system/SystemFeedback';

type DisplayRole = 'Campus Admin' | 'System Admin';

function toDisplayRole(role: string | undefined): DisplayRole {
  return role === 'system_admin' ? 'System Admin' : 'Campus Admin';
}

function ProtectedRoute({
  children,
  allowedRole,
}: {
  children: React.ReactNode;
  allowedRole?: DisplayRole;
}) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (allowedRole && toDisplayRole(user?.role) !== allowedRole) {
    return (
      <Navigate
        to={user?.role === 'system_admin' ? '/system' : '/campus'}
        replace
      />
    );
  }
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  if (isAuthenticated && user) {
    return (
      <Navigate
        to={user.role === 'system_admin' ? '/system' : '/campus'}
        replace
      />
    );
  }
  return <>{children}</>;
}

function AppRoutes() {
  const { user } = useAuth();
  const displayRole = toDisplayRole(user?.role);

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      {/* Campus Admin Routes */}
      <Route
        path="/campus"
        element={
          <ProtectedRoute allowedRole="Campus Admin">
            <DashboardLayout role="Campus Admin" />
          </ProtectedRoute>
        }
      >
        <Route index element={<CampusDashboard />} />
        <Route path="locations" element={<Locations />} />
        <Route path="staff" element={<StaffManagement />} />
        <Route path="feedback" element={<Feedback />} />
        <Route path="reports" element={<CampusReports />} />
      </Route>

      {/* System Admin Routes */}
      <Route
        path="/system"
        element={
          <ProtectedRoute allowedRole="System Admin">
            <DashboardLayout role="System Admin" />
          </ProtectedRoute>
        }
      >
        <Route index element={<SystemDashboard />} />
        <Route path="admins" element={<ManageAdmins />} />
        <Route path="logs" element={<ActivityLogs />} />
        <Route path="feedback" element={<SystemFeedback />} />
        <Route path="reports" element={<SystemReports />} />
      </Route>

      {/* Shared Settings */}
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <DashboardLayout role={displayRole} />
          </ProtectedRoute>
        }
      >
        <Route index element={<Settings />} />
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </ThemeProvider>
  );
}
