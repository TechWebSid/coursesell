'use client';
import { useRef, useCallback, useState, useEffect } from 'react';
import Webcam from 'react-webcam';

const WebcamCapture = ({ onCapture, isRegistration = false }) => {
  const webcamRef = useRef(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [error, setError] = useState('');

  const videoConstraints = {
    width: 720,
    height: 480,
    facingMode: "user"
  };

  useEffect(() => {
    // Check if browser supports getUserMedia
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Camera access is not supported by your browser');
      return;
    }

    // Request camera permission
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(() => setIsCameraReady(true))
      .catch((err) => {
        console.error('Camera error:', err);
        setError('Unable to access camera. Please ensure camera permissions are granted.');
      });

    // Cleanup
    return () => {
      if (webcamRef.current?.stream) {
        const tracks = webcamRef.current.stream.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const capture = useCallback(() => {
    if (!webcamRef.current) return;

    try {
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) {
        setError('Failed to capture image. Please try again.');
        return;
      }
      onCapture(imageSrc);
    } catch (err) {
      console.error('Capture error:', err);
      setError('Failed to capture image. Please try again.');
    }
  }, [onCapture]);

  if (error) {
    return (
      <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-red-500 text-center p-4">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative">
        {isCameraReady ? (
          <>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              className="w-full h-full object-cover"
              onUserMediaError={(err) => {
                console.error('Webcam error:', err);
                setError('Failed to access camera. Please check permissions.');
              }}
            />
            {/* Overlay for face guide */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="border-2 border-dashed border-white opacity-50 rounded-full w-48 h-48"></div>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-gray-500">Initializing camera...</p>
          </div>
        )}
      </div>

      <div className="mt-4 bg-blue-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-blue-800">
          {isRegistration ? 'Tips for registration:' : 'For best results:'}
        </h3>
        <ul className="mt-2 text-sm text-blue-700 list-disc list-inside">
          <li>Ensure your face is well-lit</li>
          <li>Look directly at the camera</li>
          <li>Position your face within the circle</li>
          {isRegistration && <li>Remove glasses if possible</li>}
        </ul>
      </div>

      <button
        onClick={capture}
        disabled={!isCameraReady}
        className="mt-4 w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isRegistration ? 'Capture Face' : 'Verify Face'}
      </button>
    </div>
  );
};

export default WebcamCapture; 