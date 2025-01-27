import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Clock, CalendarDays, X, AlertTriangle } from 'lucide-react';

const CalendarComponent = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showEventModal, setShowEventModal] = useState(false);
  const [events, setEvents] = useState([
    {
      date: new Date(),
      title: "Medicine Reminder",
      time: "09:00",
      type: "medical",
    },
    {
      date: new Date(),
      title: "Doctor's Appointment",
      time: "14:30",
      type: "appointment",
    }
  ]);
  const [newEvent, setNewEvent] = useState({
    title: "",
    time: "",
    type: "general"
  });

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const changeMonth = (offset) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    if (!date) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const getEventsForDate = (date) => {
    if (!date) return [];
    return events.filter(event => 
      event.date.toDateString() === date.toDateString()
    );
  };

  const handleAddEvent = () => {
    if (newEvent.title && newEvent.time) {
      setEvents([...events, {
        ...newEvent,
        date: selectedDate
      }]);
      setShowEventModal(false);
      setNewEvent({ title: "", time: "", type: "general" });
    }
  };

  const handleDeleteEvent = (eventToDelete) => {
    setEvents(events.filter(event => 
      event.date !== eventToDelete.date || 
      event.title !== eventToDelete.title || 
      event.time !== eventToDelete.time
    ));
  };

  return (
    <div className="flex flex-col h-full max-w-md mx-auto bg-gray-900/50 rounded-xl overflow-hidden border border-gray-700/50">
      {/* Header */}
      <div className="p-4 border-b border-gray-700/50 bg-gray-800/50 backdrop-blur-sm">
        <h2 className="text-xl font-semibold text-white">Calendar</h2>
        <p className="text-sm text-gray-400">Manage your reminders and appointments</p>
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between p-4 bg-gray-800/30">
        <button 
          onClick={() => changeMonth(-1)}
          className="p-2 rounded-lg hover:bg-gray-700/50 text-gray-300"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h3 className="text-lg font-medium text-white">
          {months[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <button 
          onClick={() => changeMonth(1)}
          className="p-2 rounded-lg hover:bg-gray-700/50 text-gray-300"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="p-4 flex-1 overflow-auto">
        <div className="grid grid-cols-7 gap-1 mb-1">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
            <div key={day} className="text-center text-sm text-gray-400 py-1">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {getDaysInMonth(currentDate).map((date, index) => (
            <button
              key={index}
              onClick={() => date && setSelectedDate(date)}
              className={`
                aspect-square p-1 rounded-lg relative
                ${date ? 'hover:bg-gray-700/50' : 'opacity-0 cursor-default'}
                ${isToday(date) ? 'bg-blue-600/20 text-blue-400' : ''}
                ${isSelected(date) ? 'bg-gray-700/50 text-white' : 'text-gray-300'}
              `}
            >
              {date && (
                <>
                  <span className="text-sm">{date.getDate()}</span>
                  {getEventsForDate(date).length > 0 && (
                    <span className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  )}
                </>
              )}
            </button>
          ))}
        </div>

        {/* Events for Selected Date */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-white font-medium">
              Events for {selectedDate.toLocaleDateString()}
            </h4>
            <button
              onClick={() => setShowEventModal(true)}
              className="p-1.5 rounded-lg hover:bg-gray-700/50 text-gray-300"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
          
          <div className="space-y-2">
            {getEventsForDate(selectedDate).map((event, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg border border-gray-700/50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-300">{event.time}</span>
                  </div>
                  <span className="text-white">{event.title}</span>
                </div>
                <button
                  onClick={() => handleDeleteEvent(event)}
                  className="text-gray-400 hover:text-red-400"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      {showEventModal && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-xl w-96 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-white">Add New Event</h3>
              <button 
                onClick={() => setShowEventModal(false)}
                className="text-gray-400 hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Event Title</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                  className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 
                    text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="Enter event title"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Time</label>
                <input
                  type="time"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                  className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 
                    text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Event Type</label>
                <select
                  value={newEvent.type}
                  onChange={(e) => setNewEvent({...newEvent, type: e.target.value})}
                  className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 
                    text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="general">General</option>
                  <option value="medical">Medical</option>
                  <option value="appointment">Appointment</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>
              
              <button
                onClick={handleAddEvent}
                className="w-full bg-blue-600 py-2 px-4 rounded-lg text-white hover:bg-blue-700 
                  transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="h-5 w-5" />
                Add Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarComponent;