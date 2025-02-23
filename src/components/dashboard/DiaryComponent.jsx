import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

const DiaryComponent = () => {
  const [entries, setEntries] = useState([]);
  const [newEntry, setNewEntry] = useState({ 
    title: '', 
    content: '', 
    mood: '',
    entry_date: new Date().toLocaleDateString('en-CA')  // Changed to local date string in YYYY-MM-DD format
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [selectedMood, setSelectedMood] = useState('');

  // Function to convert local date to UTC for storage
  const toUTCDate = (dateString) => {
    const date = new Date(dateString);
    const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    return utcDate.toISOString().split('T')[0];
  };

  // Function to convert UTC date to local date
  const toLocalDate = (dateString) => {
    const date = new Date(dateString);
    return new Date(date.getTime() + (date.getTimezoneOffset() * 60000)).toLocaleDateString();
  };

  // Fetch diary entries with filters
  const fetchEntries = async () => {
    try {
      setIsLoading(true);
      const session = JSON.parse(localStorage.getItem('session'));
      
      if (!session?.user?.id) {
        throw new Error('No session found');
      }

      let query = supabase
        .from('diary_entries')
        .select('*')
        .eq('user_id', session.user.id);

      // Apply search filter if exists
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
      }

      // Apply date filters if exist with timezone adjustment
      if (dateRange.startDate) {
        query = query.gte('entry_date', toUTCDate(dateRange.startDate));
      }
      if (dateRange.endDate) {
        query = query.lte('entry_date', toUTCDate(dateRange.endDate));
      }

      // Apply mood filter if exists
      if (selectedMood) {
        query = query.eq('mood', selectedMood);
      }

      // Order by entry date and created time
      query = query.order('entry_date', { ascending: false })
                  .order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      setEntries(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Create new entry
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const session = JSON.parse(localStorage.getItem('session'));

      if (!session?.user?.id) {
        throw new Error('No session found');
      }

      const { data, error } = await supabase
        .from('diary_entries')
        .insert([
          {
            user_id: parseInt(session.user.id),
            title: newEntry.title,
            content: newEntry.content,
            mood: newEntry.mood,
            entry_date: toUTCDate(newEntry.entry_date)  // Convert to UTC before saving
          }
        ])
        .select();

      if (error) throw error;

      setEntries([data[0], ...entries]);
      setNewEntry({ 
        title: '', 
        content: '', 
        mood: '',
        entry_date: new Date().toLocaleDateString('en-CA')
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Update entry
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('diary_entries')
        .update({
          title: newEntry.title,
          content: newEntry.content,
          mood: newEntry.mood,
          entry_date: toUTCDate(newEntry.entry_date),  // Convert to UTC before saving
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedEntry.id)
        .select();

      if (error) throw error;

      setEntries(entries.map(entry => 
        entry.id === selectedEntry.id ? data[0] : entry
      ));
      setNewEntry({ 
        title: '', 
        content: '', 
        mood: '',
        entry_date: new Date().toLocaleDateString('en-CA')
      });
      setIsEditing(false);
      setSelectedEntry(null);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('diary_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setEntries(entries.filter(entry => entry.id !== id));
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [searchQuery, dateRange, selectedMood]);

  const moods = ['happy', 'sad', 'excited', 'anxious', 'calm'];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Search and Filters */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <select
              value={selectedMood}
              onChange={(e) => setSelectedMood(e.target.value)}
              className="bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Moods</option>
              {moods.map(mood => (
                <option key={mood} value={mood} className="capitalize">
                  {mood}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Form Section */}
        <form 
          onSubmit={isEditing ? handleUpdate : handleSubmit}
          className="bg-gray-800 rounded-lg p-6 mb-8 shadow-lg"
        >
          <h2 className="text-2xl font-semibold mb-6">
            {isEditing ? 'Edit Entry' : 'New Diary Entry'}
          </h2>
          
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Title"
              value={newEntry.title}
              onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
              className="w-full bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
            
            <textarea
              placeholder="Write your thoughts..."
              value={newEntry.content}
              onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
              className="w-full bg-gray-700 rounded-lg px-4 py-2 h-32 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="date"
                value={newEntry.entry_date}
                onChange={(e) => setNewEntry({ ...newEntry, entry_date: e.target.value })}
                className="w-full bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
              
              <select
                value={newEntry.mood}
                onChange={(e) => setNewEntry({ ...newEntry, mood: e.target.value })}
                className="w-full bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select Mood</option>
                {moods.map(mood => (
                  <option key={mood} value={mood} className="capitalize">
                    {mood}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex justify-end space-x-4">
              {isEditing && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setSelectedEntry(null);
                    setNewEntry({ 
                      title: '', 
                      content: '', 
                      mood: '',
                      entry_date: new Date().toLocaleDateString('en-CA')
                    });
                  }}
                  className="px-6 py-2 bg-gray-600 rounded-lg hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="px-6 py-2 bg-purple-600 rounded-lg hover:bg-purple-500 transition-colors"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : isEditing ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500 text-white p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Entries List */}
        <div className="space-y-6">
          {entries.map((entry) => (
            <div 
              key={entry.id}
              className="bg-gray-800 rounded-lg p-6 shadow-lg"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold">{entry.title}</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {toLocalDate(entry.entry_date)}  {/* Using our custom date formatter */}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setSelectedEntry(entry);
                      setNewEntry({
                        title: entry.title,
                        content: entry.content,
                        mood: entry.mood,
                        entry_date: entry.entry_date
                      });
                    }}
                    className="text-purple-400 hover:text-purple-300"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Delete
                  </button>
                </div>
              </div>
              
              <p className="text-gray-300 mb-4">{entry.content}</p>
              
              <div className="flex justify-between text-sm text-gray-400">
                <span>Last updated: {new Date(entry.updated_at).toLocaleString()}</span>
                {entry.mood && (
                  <span className="capitalize px-3 py-1 bg-gray-700 rounded-full">
                    {entry.mood}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DiaryComponent;