// utils/emergencyContacts.js

const CONTACTS_KEY = 'emergency_contacts';

/**
 * Gets emergency contacts for a user
 * @param {string} userEmail - User's email
 * @returns {Array} List of emergency contacts
 */
export const getEmergencyContacts = (userEmail) => {
  try {
    const contactsData = localStorage.getItem(`${CONTACTS_KEY}_${userEmail}`);
    return contactsData ? JSON.parse(contactsData) : [];
  } catch (error) {
    console.error('Error getting emergency contacts:', error);
    return [];
  }
};

/**
 * Adds a new emergency contact
 * @param {string} userEmail - User's email
 * @param {Object} contact - Contact details
 * @returns {Array} Updated list of contacts
 */
export const addEmergencyContact = (userEmail, contact) => {
  try {
    const contacts = getEmergencyContacts(userEmail);
    const newContact = {
      id: Date.now().toString(),
      name: contact.name,
      relation: contact.relation,
      mobile: contact.mobile
    };
    
    const updatedContacts = [...contacts, newContact];
    localStorage.setItem(`${CONTACTS_KEY}_${userEmail}`, JSON.stringify(updatedContacts));
    return updatedContacts;
  } catch (error) {
    console.error('Error adding emergency contact:', error);
    throw new Error('Failed to add emergency contact');
  }
};

/**
 * Removes an emergency contact
 * @param {string} userEmail - User's email
 * @param {string} contactId - Contact ID to remove
 * @returns {Array} Updated list of contacts
 */
export const removeEmergencyContact = (userEmail, contactId) => {
  try {
    const contacts = getEmergencyContacts(userEmail);
    const updatedContacts = contacts.filter(contact => contact.id !== contactId);
    localStorage.setItem(`${CONTACTS_KEY}_${userEmail}`, JSON.stringify(updatedContacts));
    return updatedContacts;
  } catch (error) {
    console.error('Error removing emergency contact:', error);
    throw new Error('Failed to remove emergency contact');
  }
};

// EmergencyContactsComponent.jsx
import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { getSession } from './sessionManager';
import { getEmergencyContacts, addEmergencyContact, removeEmergencyContact } from './emergencyContacts';

const EmergencyContactsComponent = () => {
  const [contacts, setContacts] = useState([]);
  const [newContact, setNewContact] = useState({ name: '', relation: '', mobile: '' });
  const [error, setError] = useState('');
  
  const session = getSession();
  const userEmail = session?.email;

  useEffect(() => {
    if (userEmail) {
      const userContacts = getEmergencyContacts(userEmail);
      setContacts(userContacts);
    }
  }, [userEmail]);

  const handleAddContact = (e) => {
    e.preventDefault();
    try {
      if (!userEmail) throw new Error('No active session');
      
      const updatedContacts = addEmergencyContact(userEmail, newContact);
      setContacts(updatedContacts);
      setNewContact({ name: '', relation: '', mobile: '' });
      setError('');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleRemoveContact = (contactId) => {
    try {
      if (!userEmail) throw new Error('No active session');
      
      const updatedContacts = removeEmergencyContact(userEmail, contactId);
      setContacts(updatedContacts);
      setError('');
    } catch (error) {
      setError(error.message);
    }
  };

  if (!userEmail) {
    return <div className="text-red-400">Please log in to manage emergency contacts</div>;
  }

  return (
    <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-700/50">
      <h2 className="text-xl font-semibold text-white mb-4">Emergency Contacts</h2>
      
      {error && (
        <div className="mb-4 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleAddContact} className="mb-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <input
            type="text"
            value={newContact.name}
            onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Contact Name"
            className="bg-gray-700/50 border border-gray-600/50 rounded px-3 py-2 text-white"
            required
          />
          <input
            type="text"
            value={newContact.relation}
            onChange={(e) => setNewContact(prev => ({ ...prev, relation: e.target.value }))}
            placeholder="Relation"
            className="bg-gray-700/50 border border-gray-600/50 rounded px-3 py-2 text-white"
            required
          />
          <input
            type="tel"
            value={newContact.mobile}
            onChange={(e) => setNewContact(prev => ({ ...prev, mobile: e.target.value }))}
            placeholder="Mobile Number"
            className="bg-gray-700/50 border border-gray-600/50 rounded px-3 py-2 text-white"
            required
          />
        </div>
        <button
          type="submit"
          className="mt-4 flex items-center gap-2 bg-blue-600 px-4 py-2 rounded text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add Contact
        </button>
      </form>

      <div className="space-y-3">
        {contacts.map(contact => (
          <div
            key={contact.id}
            className="flex items-center justify-between bg-gray-800/50 p-3 rounded"
          >
            <div>
              <div className="text-white font-medium">{contact.name}</div>
              <div className="text-gray-400 text-sm">{contact.relation} • {contact.mobile}</div>
            </div>
            <button
              onClick={() => handleRemoveContact(contact.id)}
              className="text-gray-400 hover:text-red-400"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        ))}
        
        {contacts.length === 0 && (
          <div className="text-gray-400 text-center py-4">
            No emergency contacts added yet
          </div>
        )}
      </div>
    </div>
  );
};

export default EmergencyContactsComponent;