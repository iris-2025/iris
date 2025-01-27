import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Save, X, AlertTriangle } from 'lucide-react';

const NotesComponent = () => {
  const [notes, setNotes] = useState([
    {
      id: 1,
      title: "Emergency Contact Information",
      content: "Local emergency number: 911\nFamily doctor: Dr. Smith (555-0123)",
      type: "emergency",
      date: new Date().toISOString()
    },
    {
      id: 2,
      title: "Medication Schedule",
      content: "Morning: Blood pressure medicine\nEvening: Vitamins",
      type: "medical",
      date: new Date().toISOString()
    }
  ]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingNote, setEditingNote] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    type: "general"
  });

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddNote = () => {
    if (newNote.title && newNote.content) {
      setNotes([
        {
          id: Date.now(),
          ...newNote,
          date: new Date().toISOString()
        },
        ...notes
      ]);
      setShowAddModal(false);
      setNewNote({ title: "", content: "", type: "general" });
    }
  };

  const handleUpdateNote = () => {
    if (editingNote && editingNote.title && editingNote.content) {
      setNotes(notes.map(note =>
        note.id === editingNote.id ? editingNote : note
      ));
      setEditingNote(null);
    }
  };

  const handleDeleteNote = (id) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'emergency':
        return 'text-red-400 bg-red-400/10';
      case 'medical':
        return 'text-blue-400 bg-blue-400/10';
      case 'appointment':
        return 'text-green-400 bg-green-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  return (
    <div className="flex flex-col h-full max-w-md mx-auto bg-gray-900/50 rounded-xl overflow-hidden border border-gray-700/50">
      {/* Header */}
      <div className="p-4 border-b border-gray-700/50 bg-gray-800/50 backdrop-blur-sm">
        <h2 className="text-xl font-semibold text-white">Notes</h2>
        <p className="text-sm text-gray-400">Manage your important notes and reminders</p>
      </div>

      {/* Search and Add */}
      <div className="p-4 border-b border-gray-700/50 bg-gray-800/30">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg pl-10 pr-4 py-2 
                text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="p-2 bg-blue-600 rounded-lg text-white hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-3">
          {filteredNotes.map(note => (
            <div
              key={note.id}
              className="bg-gray-800/30 rounded-lg border border-gray-700/50 overflow-hidden"
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-medium text-white">{note.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(note.type)}`}>
                      {note.type}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingNote(note)}
                      className="text-gray-400 hover:text-gray-300"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="text-gray-400 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="text-gray-300 whitespace-pre-line">{note.content}</p>
                <span className="text-xs text-gray-500 mt-2 block">
                  {new Date(note.date).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Note Modal */}
      {showAddModal && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-xl w-96 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-white">Add New Note</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Title</label>
                <input
                  type="text"
                  value={newNote.title}
                  onChange={(e) => setNewNote({...newNote, title: e.target.value})}
                  className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 
                    text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="Enter note title"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Content</label>
                <textarea
                  value={newNote.content}
                  onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                  className="w-full h-32 bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 
                    text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                  placeholder="Enter note content"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Type</label>
                <select
                  value={newNote.type}
                  onChange={(e) => setNewNote({...newNote, type: e.target.value})}
                  className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 
                    text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="general">General</option>
                  <option value="medical">Medical</option>
                  <option value="emergency">Emergency</option>
                  <option value="appointment">Appointment</option>
                </select>
              </div>
              
              <button
                onClick={handleAddNote}
                className="w-full bg-blue-600 py-2 px-4 rounded-lg text-white hover:bg-blue-700 
                  transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="h-5 w-5" />
                Add Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Note Modal */}
      {editingNote && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-xl w-96 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-white">Edit Note</h3>
              <button 
                onClick={() => setEditingNote(null)}
                className="text-gray-400 hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Title</label>
                <input
                  type="text"
                  value={editingNote.title}
                  onChange={(e) => setEditingNote({...editingNote, title: e.target.value})}
                  className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 
                    text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Content</label>
                <textarea
                  value={editingNote.content}
                  onChange={(e) => setEditingNote({...editingNote, content: e.target.value})}
                  className="w-full h-32 bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 
                    text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Type</label>
                <select
                  value={editingNote.type}
                  onChange={(e) => setEditingNote({...editingNote, type: e.target.value})}
                  className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 
                    text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="general">General</option>
                  <option value="medical">Medical</option>
                  <option value="emergency">Emergency</option>
                  <option value="appointment">Appointment</option>
                </select>
              </div>
              
              <button
                onClick={handleUpdateNote}
                className="w-full bg-blue-600 py-2 px-4 rounded-lg text-white hover:bg-blue-700 
                  transition-colors flex items-center justify-center gap-2"
              >
                <Save className="h-5 w-5" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesComponent;