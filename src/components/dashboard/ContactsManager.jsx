import React, { useState, useEffect } from 'react';
import { User, Phone, Save, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../../supabaseClient';

const ContactsManager = ({ isFaceAuthRequired, onFaceAuthRequired }) => {
  const [contacts, setContacts] = useState([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('user_id', localStorage.getItem('userId'));

      if (error) throw error;

      setContacts(data?.length > 0 
        ? data.map(contact => ({
            name: contact.contact_name,
            phone: contact.phone_number
          }))
        : [{ name: '', phone: '' }]
      );
      
      setHasUnsavedChanges(false);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      alert('Failed to load contacts');
      setIsLoading(false);
    }
  };

  const addContact = () => {
    setContacts([...contacts, { name: '', phone: '' }]);
    setHasUnsavedChanges(true);
  };

  const removeContact = (index) => {
    setContacts(contacts.filter((_, i) => i !== index));
    setHasUnsavedChanges(true);
  };

  const updateContact = (index, field, value) => {
    const newContacts = [...contacts];
    newContacts[index] = { ...newContacts[index], [field]: value };
    setContacts(newContacts);
    setHasUnsavedChanges(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isFaceAuthRequired) {
      onFaceAuthRequired();
      return;
    }

    try {
      if (contacts.some(contact => !contact.name || !contact.phone)) {
        throw new Error('Please fill in all contact details');
      }

      // Delete existing contacts
      await supabase
        .from('emergency_contacts')
        .delete()
        .eq('user_id', localStorage.getItem('userId'));

      // Insert new contacts
      const { error } = await supabase
        .from('emergency_contacts')
        .insert(contacts.map(contact => ({
          user_id: localStorage.getItem('userId'),
          contact_name: contact.name,
          phone_number: contact.phone
        })));

      if (error) throw error;
      
      alert('Contacts saved successfully!');
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error saving contacts:', error);
      alert(error.message || 'Failed to save contacts');
    }
  };

  const sendEmergencySMS = async (phoneNumber) => {
    if (!phoneNumber) {
      alert('Please enter a valid phone number');
      return;
    }

    try {
      const response = await fetch('/api/send-emergency-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber }),
      });

      if (!response.ok) throw new Error('Failed to send SMS');
      alert('Emergency SMS sent successfully');
    } catch (error) {
      console.error('Error sending SMS:', error);
      alert('Failed to send emergency SMS');
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 text-center text-white">
        Loading contacts...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-900/50 rounded-xl overflow-hidden border border-gray-700/50">
      <div className="p-4 border-b border-gray-700/50 bg-gray-800/50 backdrop-blur-sm">
        <h2 className="text-xl font-semibold text-white">Emergency Contacts</h2>
        <p className="text-sm text-gray-400">Manage your emergency contacts</p>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-auto">
        <div className="p-4 space-y-4">
          {contacts.map((contact, index) => (
            <div key={index} className="bg-gray-800/30 p-4 rounded-lg border border-gray-700/50">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300">Contact #{index + 1}</span>
                {contacts.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeContact(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    value={contact.name}
                    onChange={(e) => updateContact(index, 'name', e.target.value)}
                    placeholder="Contact Name"
                    required
                    className="flex-1 bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Phone className="text-gray-400 h-5 w-5" />
                  <input
                    type="tel"
                    value={contact.phone}
                    onChange={(e) => updateContact(index, 'phone', e.target.value)}
                    placeholder="Phone Number"
                    required
                    pattern="[0-9]+"
                    className="flex-1 bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => sendEmergencySMS(contact.phone)}
                  disabled={!contact.phone}
                  className="w-full bg-red-600 py-2 px-4 rounded-lg text-white hover:bg-red-700 transition-colors mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send Emergency SMS
                </button>
              </div>
            </div>
          ))}
          
          <button
            type="button"
            onClick={addContact}
            className="w-full py-2 px-4 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-800/30 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Add Contact
          </button>
        </div>
      </form>

      <div className="p-4 border-t border-gray-700/50">
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={!hasUnsavedChanges}
          className="w-full bg-blue-600 py-2 px-4 rounded-lg text-white hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
        >
          <Save className="h-5 w-5" />
          Save Contacts
        </button>
      </div>
    </div>
  );
};

export default ContactsManager;