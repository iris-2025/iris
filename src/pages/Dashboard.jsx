// pages/Dashboard.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';

function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = () => {
      try {
        const sessionStr = localStorage.getItem('session');
        if (!sessionStr) {
          navigate('/login');
          return;
        }

        const session = JSON.parse(sessionStr);
        
        // Check if session is expired (24 hours)
        const sessionAge = new Date() - new Date(session.timestamp);
        if (sessionAge > 24 * 60 * 60 * 1000) {
          localStorage.removeItem('session');
          navigate('/login');
          return;
        }
      } catch (error) {
        localStorage.removeItem('session');
        navigate('/login');
      }
    };

    checkSession();
    const interval = setInterval(checkSession, 60000);
    return () => clearInterval(interval);
  }, [navigate]);

  return <DashboardLayout />;
}

export default Dashboard;