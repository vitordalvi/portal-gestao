import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { AnalystsPage } from './pages/AnalystsPage';
import { SchedulePage } from './pages/SchedulePage';
import { MyTimeEntriesPage } from './pages/MyTimeEntriesPage';

const AppContent: React.FC = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <LoginPage />;
  }

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
          <Route path="/analysts" element={<AnalystsPage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/my-time-entries" element={<MyTimeEntriesPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
