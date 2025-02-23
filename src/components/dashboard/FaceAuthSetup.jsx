import React, { useState, useEffect, useRef } from 'react';
import { Camera, X, AlertCircle } from 'lucide-react';
import * as faceapi from 'face-api.js';

const FaceAuthSetup = ({ onVerificationComplete = () => {} }) => {
  // Essential states
  const [isLoading, setIsLoading] = useState(true);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [debug, setDebug] = useState({});
  const [error, setError] = useState(null);

  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const detectionRef = useRef(null);

  useEffect(() => {
    loadModels();
    return () => cleanup();
  }, []);

  const loadModels = async () => {
    try {
      console.log('📚 Loading face detection models...');
      const modelPath = '/models';
      
      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri(modelPath),
        faceapi.nets.faceLandmark68Net.loadFromUri(modelPath),
        faceapi.nets.faceRecognitionNet.loadFromUri(modelPath)
      ]);
      
      console.log('✅ Models loaded successfully');
      setDebug(prev => ({ ...prev, modelsLoaded: true }));
    } catch (err) {
      console.error('❌ Model loading error:', err);
      setError('Failed to load face detection models: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const cleanup = () => {
    console.log('🧹 Cleaning up resources');
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (detectionRef.current) {
      clearInterval(detectionRef.current);
    }
  };

  const startCamera = async () => {
    try {
      console.log('📸 Starting camera...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: 640,
          height: 480,
          facingMode: 'user',
          frameRate: 30
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        await videoRef.current.play();
        setIsCameraActive(true);
        startDetection();
        console.log('✅ Camera started successfully');
      }
    } catch (err) {
      console.error('❌ Camera error:', err);
      setError(err.message);
    }
  };

  const startDetection = () => {
    console.log('🔍 Starting face detection');
    if (detectionRef.current) clearInterval(detectionRef.current);

    detectionRef.current = setInterval(async () => {
      if (!videoRef.current?.videoWidth) return;

      try {
        // Update canvas size
        const canvas = canvasRef.current;
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        
        // Detect face
        const detection = await faceapi.detectSingleFace(
          videoRef.current,
          new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 })
        ).withFaceLandmarks();

        // Clear previous drawings
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (detection) {
          const { box } = detection.detection;
          
          // Draw face box
          ctx.strokeStyle = '#00ff00';
          ctx.lineWidth = 2;
          ctx.strokeRect(box.x, box.y, box.width, box.height);

          // Draw dots for face landmarks
          ctx.fillStyle = '#00ff00';
          detection.landmarks.positions.forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI);
            ctx.fill();
          });

          setFaceDetected(true);
          setDebug(prev => ({
            ...prev,
            confidence: detection.detection.score.toFixed(2),
            position: {
              x: Math.round(box.x),
              y: Math.round(box.y),
              width: Math.round(box.width),
              height: Math.round(box.height)
            }
          }));
        } else {
          setFaceDetected(false);
          setDebug(prev => ({ ...prev, confidence: null }));
        }
      } catch (err) {
        console.error('❌ Detection error:', err);
        setDebug(prev => ({ ...prev, error: err.message }));
      }
    }, 100);
  };

  const stopCamera = () => {
    console.log('⏹️ Stopping camera');
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setFaceDetected(false);
  };

  if (isLoading) {
    return <div className="p-4 text-white">Loading face detection system...</div>;
  }

  return (
    <div className="bg-gray-900 rounded-xl p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-white">Face Detection</h3>
        {isCameraActive && (
          <button 
            onClick={stopCamera}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-200">
          <AlertCircle className="h-5 w-5" />
          <p>{error}</p>
        </div>
      )}

      <div className="relative w-full mb-4">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full rounded-lg bg-gray-800"
          style={{ height: '480px', objectFit: 'cover' }}
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full"
        />
        
        <div className="absolute bottom-4 left-0 right-0 text-center">
          <span 
            className={`px-3 py-1 rounded-full text-sm ${
              faceDetected ? 'bg-green-500' : 'bg-red-500'
            } text-white`}
          >
            {faceDetected ? 'Face Detected' : 'No Face Detected'}
          </span>
        </div>
      </div>

      {!isCameraActive && (
        <button
          onClick={startCamera}
          className="w-full bg-blue-600 py-2 px-4 rounded-lg text-white hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <Camera className="h-5 w-5" />
          Start Camera
        </button>
      )}

      {/* Debug Information */}
      <div className="mt-4 p-3 bg-gray-800 rounded-lg text-sm text-gray-300 space-y-1">
        <p>📊 Models Loaded: {debug.modelsLoaded ? '✅' : '❌'}</p>
        <p>📸 Camera Active: {isCameraActive ? '✅' : '❌'}</p>
        {debug.confidence && (
          <p>🎯 Confidence: {debug.confidence}</p>
        )}
        {debug.position && (
          <div>
            <p>📍 Position:</p>
            <pre className="text-xs">
              {JSON.stringify(debug.position, null, 2)}
            </pre>
          </div>
        )}
        {debug.error && (
          <p className="text-red-400">❌ Error: {debug.error}</p>
        )}
      </div>
    </div>
  );
};

export default FaceAuthSetup;