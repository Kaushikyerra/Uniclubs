import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { Clubs } from './pages/Clubs';
import { Events } from './pages/Events';
import { ClubDetail } from './pages/ClubDetail';
import { AdminManagement } from './pages/AdminManagement';
import { AIChatBot } from './components/AIChatBot';
import { initializeData } from './services/mockData';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { UserRole } from './types';

// Wrapper for Layout to inject auth user
const LayoutWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, signOut } = useAuth();
  return <Layout user={user} onLogout={signOut}>{children}</Layout>;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        <Route path="/dashboard" element={
          <LayoutWrapper><Dashboard user={useAuth().user!} /></LayoutWrapper>
        } />
        
        <Route path="/clubs" element={
          <LayoutWrapper><Clubs user={useAuth().user!} /></LayoutWrapper>
        } />
        
        <Route path="/clubs/:id" element={
          <LayoutWrapper><ClubDetail user={useAuth().user!} /></LayoutWrapper>
        } />
        
        <Route path="/events" element={
          <LayoutWrapper><Events user={useAuth().user!} /></LayoutWrapper>
        } />
      </Route>

      {/* Admin Route */}
      <Route element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]} />}>
        <Route path="/admin" element={
          <LayoutWrapper>
            <AdminManagement />
          </LayoutWrapper>
        } />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  // Initialize mock data for content (Clubs/Events)
  React.useEffect(() => {
    initializeData();
  }, []);

  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <AIChatBot />
      </Router>
    </AuthProvider>
  );
}

export default App;
