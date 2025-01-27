import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Cloud,
  Calendar,
  Map,
  FileText,
  Settings,
  LogOut,
  X,
  Plane,
  User,
  Book,
  Hotel,
} from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen, activeComponent, setActiveComponent }) => {
  const navigate = useNavigate();
  const [sessionData, setSessionData] = useState(null);

  useEffect(() => {
    const checkSession = () => {
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

      setSessionData(session);
    };

    checkSession();
    // Check session status every minute
    const intervalId = setInterval(checkSession, 60000);

    return () => clearInterval(intervalId);
  }, [navigate]);

  const handleLogout = () => {
    try {
      localStorage.removeItem('session');
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      // Still redirect to login even if there's an error
      navigate('/login');
    }
  };

  const menuItems = [
    { id: 'chat', icon: MessageSquare, label: 'Travel Chat' },
    { id: 'weather', icon: Cloud, label: 'Weather' },
    { id: 'itinerary', icon: Book, label: 'Itinerary' },
    { id: 'hotels', icon: Hotel, label: 'Hotels' },
    { id: 'calendar', icon: Calendar, label: 'Calendar' },
    { id: 'map', icon: Map, label: 'Explore' },
    { id: 'notes', icon: FileText, label: 'Travel Notes' },
    { id: 'settings', icon: Settings, label: 'Emergency Settings' }
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed lg:static inset-y-0 left-0 w-72 bg-gray-800
          transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 transition-transform duration-200 ease-in-out
          flex flex-col z-30 h-full
        `}
      >
        {/* App Logo and Title */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <Plane className="h-6 w-6 text-white" />
            <h2 className="text-xl font-bold text-white">TravelBuddy</h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* User Profile Section */}
        {sessionData && (
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center space-x-4">
              <div className="bg-gray-600 p-2 rounded-full">
                <User className="h-8 w-8 text-gray-300" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-medium truncate">
                  {sessionData.user.email}
                </h3>
                <p className="text-sm text-gray-400 truncate">
                  Logged in
                </p>
              </div>
            </div>
            <div className="mt-3 text-xs text-gray-400">
              Session started: {new Date(sessionData.timestamp).toLocaleString()}
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => {
                setActiveComponent(id);
                setIsOpen(false);
              }}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg
                transition-colors duration-200
                ${
                  activeComponent === id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }
              `}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{label}</span>
            </button>
          ))}
        </nav>

        {/* Logout Section */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg
              text-red-400 hover:bg-red-500/10 transition-colors duration-200"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;