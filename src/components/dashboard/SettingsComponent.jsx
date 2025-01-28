import React, { useState, useEffect, useRef } from 'react';
import { User, Phone, Save, Plus, Trash2, Camera } from 'lucide-react';

import * as faceapi from 'face-api.js';

import { supabase } from '../../supabaseClient';


const SettingsComponent = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isFaceRegistered, setIsFaceRegistered] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [contacts, setContacts] = useState([{ name: '', phone: '' }]);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    loadFaceApiModels();
    checkFaceRegistration();
    fetchContacts();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const loadFaceApiModels = async () => {
    try {
      await Promise.all([
        faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
      ]);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading face-api models:', error);
    }
  };

  const checkFaceRegistration = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user?.id) return;

    const { data: faceData } = await supabase
      .from('user_faces')
      .select('*')
      .eq('user_id', userData.user.id)
      .single();

    setIsFaceRegistered(!!faceData);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };

  const captureAndProcessFace = async () => {
    if (!videoRef.current) return null;
    
    const detections = await faceapi.detectSingleFace(videoRef.current)
      .withFaceLandmarks()
      .withFaceDescriptor();
    
    if (!detections) {
      alert('No face detected! Please ensure your face is clearly visible.');
      return null;
    }
    
    return detections.descriptor;
  };

  const registerFace = async () => {
    try {
      const descriptor = await captureAndProcessFace();
      if (!descriptor) return;

      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user?.id) {
        alert('Please log in first');
        return;
      }

      const { error } = await supabase.from('user_faces').upsert({
        user_id: userData.user.id,
        face_encoding: JSON.stringify(Array.from(descriptor)),
        updated_at: new Date().toISOString()
      });

      if (error) throw error;

      setIsFaceRegistered(true);
      alert('Face registered successfully!');
      stopCamera();
    } catch (error) {
      console.error('Error registering face:', error);
      alert('Failed to register face');
    }
  };

  const verifyFace = async () => {
    try {
      const currentDescriptor = await captureAndProcessFace();
      if (!currentDescriptor) return;

      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user?.id) return;

      const { data: faceData } = await supabase
        .from('user_faces')
        .select('face_encoding')
        .eq('user_id', userData.user.id)
        .single();

      if (!faceData) {
        alert('No registered face found. Please register first.');
        return;
      }

      const storedDescriptor = new Float32Array(JSON.parse(faceData.face_encoding));
      const distance = faceapi.euclideanDistance(currentDescriptor, storedDescriptor);
      
      if (distance < 0.6) {
        setIsVerified(true);
        stopCamera();
      } else {
        alert('Face verification failed. Please try again.');
      }
    } catch (error) {
      console.error('Error verifying face:', error);
      alert('Face verification failed');
    }
  };

  const fetchContacts = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user?.id) return;

      const { data, error } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('user_id', userData.user.id);

      if (error) throw error;

      if (data && data.length > 0) {
        setContacts(data.map(contact => ({
          name: contact.contact_name,
          phone: contact.phone_number
        })));
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  const addContact = () => {
    setContacts([...contacts, { name: '', phone: '' }]);
  };

  const removeContact = (index) => {
    setContacts(contacts.filter((_, i) => i !== index));
  };

  const updateContact = (index, field, value) => {
    const newContacts = [...contacts];
    newContacts[index] = { ...newContacts[index], [field]: value };
    setContacts(newContacts);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user?.id) {
        alert('Please log in first');
        return;
      }

      // Delete existing contacts
      await supabase
        .from('emergency_contacts')
        .delete()
        .eq('user_id', userData.user.id);

      // Insert new contacts
      const { error } = await supabase.from('emergency_contacts').insert(
        contacts.map(contact => ({
          user_id: userData.user.id,
          contact_name: contact.name,
          phone_number: contact.phone
        }))
      );

      if (error) throw error;
      alert('Contacts saved successfully!');
    } catch (error) {
      console.error('Error saving contacts:', error);
      alert('Failed to save contacts');
    }
  };

  const sendEmergencySMS = async (phoneNumber) => {
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

  return (
    <div className="flex flex-col h-full max-w-md mx-auto bg-gray-900/50 rounded-xl overflow-hidden border border-gray-700/50">
      {isLoading ? (
        <div className="p-4 text-center text-white">Loading face recognition models...</div>
      ) : !isVerified ? (
        <div className="p-4">
          <h3 className="text-lg font-medium text-white mb-4">
            {isFaceRegistered ? 'Face Verification Required' : 'Face Registration Required'}
          </h3>
          <video
            ref={videoRef}
            autoPlay
            className="w-full rounded-lg mb-4"
          />
          <div className="space-y-2">
            <button
              onClick={startCamera}
              className="w-full bg-blue-600 py-2 px-4 rounded-lg text-white hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Camera className="h-5 w-5" />
              Start Camera
            </button>
            {isFaceRegistered ? (
              <button
                onClick={verifyFace}
                className="w-full bg-green-600 py-2 px-4 rounded-lg text-white hover:bg-green-700 transition-colors"
              >
                Verify Face
              </button>
            ) : (
              <button
                onClick={registerFace}
                className="w-full bg-green-600 py-2 px-4 rounded-lg text-white hover:bg-green-700 transition-colors"
              >
                Register Face
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-full">
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
                        className="flex-1 bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => sendEmergencySMS(contact.phone)}
                      className="w-full bg-red-600 py-2 px-4 rounded-lg text-white hover:bg-red-700 transition-colors mt-2"
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
              className="w-full bg-blue-600 py-2 px-4 rounded-lg text-white hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Save className="h-5 w-5" />
              Save Contacts
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsComponent;