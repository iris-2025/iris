
// components/layout/DashboardLayout.jsx
import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Sidebar from './Sidebar';
import ChatComponent from '../dashboard/ChatComponent';
import WeatherComponent from '../dashboard/WeatherComponent';
import CalendarComponent from '../dashboard/CalendarComponent';
import MapComponent from '../dashboard/MapComponent';
import NotesComponent from '../dashboard/NotesComponent';
import SettingsComponent from '../dashboard/SettingsComponent';
const GOOGLE_MAPS_API_KEY = 'AIzaSyBRA7gd40g5JUKf_Laig5wWRhQkQIZbDYY'; // 

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeComponent, setActiveComponent] = useState('chat');

  const renderComponent = () => {
    switch (activeComponent) {
      case 'chat':
        return <ChatComponent />;
      case 'weather':
        return <WeatherComponent />;
      case 'calendar':
        return <CalendarComponent />;
      case 'map':
        return  <MapComponent apiKey={GOOGLE_MAPS_API_KEY} />;
      case 'notes':
        return <NotesComponent />;
      case 'settings':
        return <SettingsComponent />;
      default:
        return <ChatComponent />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <header className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between lg:hidden">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="text-gray-300 hover:text-white transition-colors"
        >
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="text-white text-xl font-semibold">Dashboard</h1>
        <div className="w-6" />
      </header>

      <div className="flex h-[calc(100vh-64px)] lg:h-screen">
        <Sidebar
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
          activeComponent={activeComponent}
          setActiveComponent={setActiveComponent}
        />

        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {renderComponent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
