import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/ErrorBoundary';
import IntroAnimation from './pages/IntroAnimation';
import StudentDashboard from './pages/StudentDashboard';
import CoursePage from './pages/CoursePage';
import MyLearnings from './pages/MyLearnings';
import Login from './pages/Login';

// Check if user is authenticated (has valid token and student role)
const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  return !!(token && role === 'STUDENT');
};

const ProtectedRoute = ({ children }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    // Only check if token exists and role is STUDENT
    // Don't clear localStorage here - let API calls handle expired tokens
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token || role !== 'STUDENT') {
      // Only redirect, don't clear storage automatically
      // Storage will be cleared on actual logout or session expiry via API
      setIsValid(false);
    } else {
      setIsValid(true);
    }
    setIsChecking(false);
  }, []);

  if (isChecking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050614' }}>
        <div style={{ color: '#818cf8', fontSize: '1rem' }}>Loading...</div>
      </div>
    );
  }

  if (!isValid) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

const App = () => {
  return (
    <ErrorBoundary>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1a1b2e',
              color: '#fff',
              border: '1px solid rgba(129, 140, 248, 0.2)',
              borderRadius: '12px',
              fontSize: '0.9rem',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            },
            success: {
              iconTheme: { primary: '#4ade80', secondary: '#000' },
            },
            error: {
              iconTheme: { primary: '#f87171', secondary: '#000' },
            },
          }}
        />
        <Routes>
          <Route path="/" element={<IntroAnimation />} />
          <Route
            path="/student-dashboard"
            element={
              <ProtectedRoute>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-learnings"
            element={
              <ProtectedRoute>
                <MyLearnings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/course/:id"
            element={
              <ProtectedRoute>
                <CoursePage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
};

export default App;
