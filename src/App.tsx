import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { ToastProvider } from './components/ui/toast';
import LoginPage from './features/auth/pages/LoginPage';
import DashboardHome from './features/dashboard/pages/DashboardHome';
import DashboardLayout from './components/layout/DashboardLayout';
import { Stethoscope } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, profile, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState('dashboard');

  // Automatically select the default tab based on the active session role
  useEffect(() => {
    if (profile) {
      if ((profile.role as string) === 'patient') {
        setCurrentTab('patient_dashboard');
      } else {
        setCurrentTab('dashboard');
      }
    }
  }, [profile]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-bg-base text-text-main">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <div className="h-16 w-16 bg-brand-primary/10 text-brand-primary flex items-center justify-center rounded-2xl">
            <Stethoscope size={36} className="animate-spin" style={{ animationDuration: '3s' }} />
          </div>
          <div className="flex flex-col items-center">
            <span className="font-extrabold text-xl tracking-tight text-text-heading">CareDesk</span>
            <span className="text-xs text-text-muted">Loading secure workspace...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/"
        element={
          user ? (
            <DashboardLayout currentTab={currentTab} setCurrentTab={setCurrentTab}>
              <DashboardHomeWrapper currentTab={currentTab} />
            </DashboardLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// Simple tab selector router inside the main container
const DashboardHomeWrapper: React.FC<{ currentTab: string }> = ({ currentTab }) => {
  return <DashboardHome activeTab={currentTab} />;
};

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <DataProvider>
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </DataProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
