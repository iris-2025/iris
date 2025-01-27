// App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const sessionStr = localStorage.getItem('session');
      if (!sessionStr) {
        setAuthenticated(false);
        setLoading(false);
        return;
      }

      const session = JSON.parse(sessionStr);
      const sessionAge = new Date() - new Date(session.timestamp);
      
      if (sessionAge > 24 * 60 * 60 * 1000) {
        localStorage.removeItem('session');
        setAuthenticated(false);
      } else {
        setAuthenticated(true);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return authenticated ? children : <Navigate to="/login" />;
};

// Public Route Component (redirects to dashboard if already authenticated)
const PublicRoute = ({ children }) => {
  const sessionStr = localStorage.getItem('session');
  if (sessionStr) {
    const session = JSON.parse(sessionStr);
    const sessionAge = new Date() - new Date(session.timestamp);
    
    if (sessionAge <= 24 * 60 * 60 * 1000) {
      return <Navigate to="/dashboard" />;
    }
    localStorage.removeItem('session');
  }
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } 
        />
        
        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        
        {/* Default Route */}
        <Route 
          path="/" 
          element={<Navigate to="/dashboard" />} 
        />

        {/* 404 Route */}
        <Route 
          path="*" 
          element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900">404</h1>
                <p className="mt-2 text-gray-600">Page not found</p>
                <a 
                  href="/dashboard" 
                  className="mt-4 inline-block text-indigo-600 hover:text-indigo-500"
                >
                  Go back home
                </a>
              </div>
            </div>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}