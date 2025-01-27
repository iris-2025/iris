import React, { useState } from 'react';
import { User, Phone, Mail, Bell, Save, Plus, Trash2 } from 'lucide-react';

const SettingsComponent = () => {
  const [contacts, setContacts] = useState([
    { name: '', phone: '', email: '' }
  ]);
  const [alertPreferences, setAlertPreferences] = useState({
    sms: true,
    email: false
  });

  const addContact = () => {
    setContacts([...contacts, { name: '', phone: '', email: '' }]);
  };

  const removeContact = (index) => {
    const newContacts = contacts.filter((_, i) => i !== index);
    setContacts(newContacts);
  };

  const updateContact = (index, field, value) => {
    const newContacts = [...contacts];
    newContacts[index] = { ...newContacts[index], [field]: value };
    setContacts(newContacts);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle saving contacts and preferences
    console.log('Saving settings:', { contacts, alertPreferences });
  };

  return (
    <div className="flex flex-col h-full max-w-md mx-auto bg-gray-900/50 rounded-xl overflow-hidden border border-gray-700/50">
      {/* Header */}
      <div className="p-4 border-b border-gray-700/50 bg-gray-800/50 backdrop-blur-sm">
        <h2 className="text-xl font-semibold text-white">Emergency Settings</h2>
        <p className="text-sm text-gray-400">Manage your emergency contacts and alert preferences</p>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-auto">
        {/* Emergency Contacts Section */}
        <div className="p-4 border-b border-gray-700/50">
          <h3 className="text-lg font-medium text-white mb-4">Emergency Contacts</h3>
          
          <div className="space-y-4">
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
                      className="flex-1 bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 
                        text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Phone className="text-gray-400 h-5 w-5" />
                    <input
                      type="tel"
                      value={contact.phone}
                      onChange={(e) => updateContact(index, 'phone', e.target.value)}
                      placeholder="Phone Number"
                      className="flex-1 bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 
                        text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Mail className="text-gray-400 h-5 w-5" />
                    <input
                      type="email"
                      value={contact.email}
                      onChange={(e) => updateContact(index, 'email', e.target.value)}
                      placeholder="Email Address"
                      className="flex-1 bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 
                        text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addContact}
            className="mt-4 w-full py-2 px-4 border border-gray-600 rounded-lg text-gray-300 
              hover:bg-gray-800/30 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Add Contact
          </button>
        </div>

        {/* Alert Preferences Section */}
        <div className="p-4">
          <h3 className="text-lg font-medium text-white mb-4">Alert Preferences</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
              <div className="flex items-center gap-2 text-gray-300">
                <Phone className="h-5 w-5" />
                <span>SMS Alerts</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={alertPreferences.sms}
                  onChange={(e) => setAlertPreferences({ ...alertPreferences, sms: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer 
                  peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] 
                  after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full 
                  after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
              <div className="flex items-center gap-2 text-gray-300">
                <Mail className="h-5 w-5" />
                <span>Email Alerts</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={alertPreferences.email}
                  onChange={(e) => setAlertPreferences({ ...alertPreferences, email: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer 
                  peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] 
                  after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full 
                  after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </form>

      {/* Save Button */}
      <div className="p-4 border-t border-gray-700/50">
        <button
          type="submit"
          onClick={handleSubmit}
          className="w-full bg-blue-600 py-2 px-4 rounded-lg text-white hover:bg-blue-700 
            transition-colors flex items-center justify-center gap-2"
        >
          <Save className="h-5 w-5" />
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default SettingsComponent;