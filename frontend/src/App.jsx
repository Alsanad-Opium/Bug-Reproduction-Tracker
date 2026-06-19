import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Login, Register } from './pages/AuthPages';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { ProjectDetails } from './pages/ProjectDetails';
import { CreateProject } from './pages/CreateProject';
import { CreateBug } from './pages/CreateBug';
import { BugDetails } from './pages/BugDetails';
import './App.css';

const HomeRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: 'var(--paper)',
          fontFamily: 'var(--font-mono)',
          fontSize: '1.2rem'
        }}
      >
        [VERIFYING CREDENTIALS PROTOCOL...]
      </div>
    );
  }

  if (!user) {
    return <Landing />;
  }

  return <Dashboard />;
};

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: 'var(--paper)',
          fontFamily: 'var(--font-mono)',
          fontSize: '1.2rem'
        }}
      >
        [VERIFYING CREDENTIALS PROTOCOL...]
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AppContent = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Public / Dashboard switcher Route */}
        <Route path="/" element={<HomeRoute />} />
        <Route
          path="/project/:id"
          element={
            <ProtectedRoute>
              <ProjectDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-project"
          element={
            <ProtectedRoute>
              <CreateProject />
            </ProtectedRoute>
          }
        />
        <Route
          path="/report-bug"
          element={
            <ProtectedRoute>
              <CreateBug />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bug/:id"
          element={
            <ProtectedRoute>
              <BugDetails />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
