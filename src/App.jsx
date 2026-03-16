import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/ErrorBoundary';
import IntroAnimation from './pages/IntroAnimation';
import StudentDashboard from './pages/StudentDashboard';
import CoursePage from './pages/CoursePage';
import MyLearnings from './pages/MyLearnings';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  // Must have token AND be a STUDENT (not admin accessing student routes)
  if (!token || role !== 'STUDENT') {
    localStorage.clear();
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
