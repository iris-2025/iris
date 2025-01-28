import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Clock, X, AlertTriangle } from 'lucide-react';
import { supabase } from '../../supabaseClient';

const CalendarComponent = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showEventModal, setShowEventModal] = useState(false);
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({
    title: "",
    time: "",
    type: "general"
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const getUserFromStorage = () => {
    const sessionData = localStorage.getItem('session');
    if (!sessionData) return null;
    
    const session = JSON.parse(sessionData);
    // Check if session has expired
    if (new Date(session.expiry) < new Date()) {
      localStorage.removeItem('session');
      return null;
    }
    return session.user;
  };
  
  const fetchEvents = async () => {
    const user = getUserFromStorage();
    if (!user || !user.id) {
      setLoading(false);
      setError('Please sign in to view events');
      return;
    }

    try {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      console.log(`Fetching events for user_id: ${parseInt(user.id)}, between ${startOfMonth.toISOString()} and ${endOfMonth.toISOString()}`);

      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', parseInt(user.id)) // Ensure user_id is parsed as integer
        .gte('event_date', startOfMonth.toISOString().split('T')[0]) // Format as 'YYYY-MM-DD'
        .lte('event_date', endOfMonth.toISOString().split('T')[0]); // Format as 'YYYY-MM-DD'

      if (error) {
        console.error('Supabase Fetch Error:', error);
        throw error;
      }

      const formattedEvents = data.map(event => ({
        ...event,
        date: new Date(event.event_date),
        time: event.event_time.slice(0, 5)
      }));

      setEvents(formattedEvents);
      setError(null);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate]);

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

  const handleAddEvent = async () => {
    const user = getUserFromStorage();
    if (!user || !user.id) {
      setError('Please sign in to add events');
      return;
    }

    if (!newEvent.title || !newEvent.time) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const eventDate = new Date(selectedDate);
      eventDate.setHours(0, 0, 0, 0);
      const formattedDate = eventDate.toISOString().split('T')[0]; // 'YYYY-MM-DD'

      console.log('Adding Event:', {
        user_id: parseInt(user.id),
        title: newEvent.title,
        event_date: formattedDate,
        event_time: newEvent.time,
        event_type: newEvent.type
      });

      const { data, error } = await supabase
        .from('calendar_events')
        .insert([{
          user_id: parseInt(user.id), // Ensure user_id is parsed as integer
          title: newEvent.title,
          event_date: formattedDate,
          event_time: newEvent.time,
          event_type: newEvent.type
        }])
        .select();

      if (error) {
        console.error('Supabase Insert Error:', error);
        throw error;
      }

      const formattedNewEvent = {
        ...data[0],
        date: new Date(data[0].event_date),
        time: data[0].event_time.slice(0, 5)
      };

      setEvents([...events, formattedNewEvent]);
      setShowEventModal(false);
      setNewEvent({ title: "", time: "", type: "general" });
      setError(null);
    } catch (err) {
      console.error('Error adding event:', err);
      setError('Failed to add event');
    }
  };

  const handleDeleteEvent = async (eventToDelete) => {
    const user = getUserFromStorage();
    if (!user || !user.id) {
      setError('Please sign in to delete events');
      return;
    }

    try {
      console.log('Deleting Event:', {
        id: eventToDelete.id,
        user_id: parseInt(user.id)
      });

      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', eventToDelete.id)
        .eq('user_id', parseInt(user.id)); // Ensure user_id is parsed as integer

      if (error) {
        console.error('Supabase Delete Error:', error);
        throw error;
      }

      setEvents(events.filter(event => event.id !== eventToDelete.id));
      setError(null);
    } catch (err) {
      console.error('Error deleting event:', err);
      setError('Failed to delete event');
    }
  };

  // If no user data, show auth required message
  if (!getUserFromStorage()) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 bg-gray-900/50 rounded-xl border border-gray-700/50">
        <AlertTriangle className="h-8 w-8 text-yellow-500 mb-2" />
        <h2 className="text-lg font-medium text-white mb-2">Authentication Required</h2>
        <p className="text-gray-400 text-center">Please sign in to access your calendar</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-w-md mx-auto bg-gray-900/50 rounded-xl overflow-hidden border border-gray-700/50">
      {/* Header */}
      <div className="p-4 border-b border-gray-700/50 bg-gray-800/50 backdrop-blur-sm">
        <h2 className="text-xl font-semibold text-white">Calendar</h2>
        <p className="text-sm text-gray-400">Manage your reminders and appointments</p>
      </div>

      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/50 mx-4 mt-4 rounded-lg flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-300" />
          <p className="text-red-200 text-sm">{error}</p>
        </div>
      )}

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
          
          {loading ? (
            <div className="text-center p-4 text-gray-400">
              Loading events...
            </div>
          ) : (
            <div className="space-y-2">
              {getEventsForDate(selectedDate).map((event, index) => (
                <div 
                  key={event.id} // Changed key to event.id for uniqueness
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
              {getEventsForDate(selectedDate).length === 0 && (
                <div className="text-center p-4 text-gray-400">
                  No events for this date
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-xl w-96 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-white">Add New Event</h3>
              <button 
                onClick={() => {
                  setShowEventModal(false);
                  setNewEvent({ title: "", time: "", type: "general" });
                }}
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
                disabled={!newEvent.title || !newEvent.time}
                className={`
                  w-full py-2 px-4 rounded-lg text-white transition-colors 
                  flex items-center justify-center gap-2
                  ${!newEvent.title || !newEvent.time 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'}
                `}
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
