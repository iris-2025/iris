// utils/faceApiConfig.js
import * as faceapi from 'face-api.js';

export const loadModels = async () => {
  try {
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
      faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
      faceapi.nets.faceRecognitionNet.loadFromUri('/models')
    ]);
    console.log('Models loaded successfully');
    return true;
  } catch (error) {
    console.error('Error loading models:', error);
    throw error;
  }
};
