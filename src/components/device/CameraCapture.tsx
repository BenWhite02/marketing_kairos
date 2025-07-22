// src/components/device/CameraCapture.tsx
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CameraIcon, 
  XMarkIcon, 
  ArrowPathIcon,
  PhotoIcon,
  VideoCameraIcon,
  StopIcon
} from '@heroicons/react/24/outline';
import { useCamera } from '../../hooks/device/useDeviceApis';
import { TouchButton } from '../mobile/TouchButton';

interface CameraCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoCapture?: (photoData: string) => void;
  onVideoCapture?: (videoBlob: Blob) => void;
  mode?: 'photo' | 'video' | 'both';
  facingMode?: 'user' | 'environment';
  className?: string;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  isOpen,
  onClose,
  onPhotoCapture,
  onVideoCapture,
  mode = 'both',
  facingMode = 'environment',
  className
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  
  const [currentMode, setCurrentMode] = useState<'photo' | 'video'>('photo');
  const [currentFacing, setCurrentFacing] = useState(facingMode);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [flash, setFlash] = useState(false);

  const { isAvailable, isActive, stream, error, startCamera, stopCamera } = useCamera();

  // Recording timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Initialize camera when opened
  useEffect(() => {
    if (isOpen && isAvailable) {
      initializeCamera();
    } else {
      stopCamera();
    }

    return () => stopCamera();
  }, [isOpen, isAvailable, currentFacing]);

  const initializeCamera = async () => {
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: currentFacing,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: currentMode === 'video'
      };

      const mediaStream = await startCamera(constraints);
      
      if (videoRef.current && mediaStream) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error('Failed to initialize camera:', err);
    }
  };

  const handlePhotoCapture = useCallback(() => {
    if (!videoRef.current || !stream) return;

    // Flash effect
    setFlash(true);
    setTimeout(() => setFlash(false), 150);

    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }

    const canvas = canvasRef.current || document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) return;

    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0);
    
    const photoData = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedPhotos(prev => [photoData, ...prev.slice(0, 4)]);
    onPhotoCapture?.(photoData);
  }, [stream, onPhotoCapture]);

  const handleVideoStart = useCallback(() => {
    if (!stream) return;

    try {
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm; codecs=vp9'
      });
      
      const chunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const videoBlob = new Blob(chunks, { type: 'video/webm' });
        onVideoCapture?.(videoBlob);
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      
      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100]);
      }
    } catch (err) {
      console.error('Failed to start recording:', err);
    }
  }, [stream, onVideoCapture]);

  const handleVideoStop = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(200);
      }
    }
  }, [isRecording]);

  const toggleFacingMode = useCallback(() => {
    setCurrentFacing(prev => prev === 'user' ? 'environment' : 'user');
  }, []);

  const formatRecordingTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 z-50 bg-black ${className}`}
      >
        {/* Flash Overlay */}
        <AnimatePresence>
          {flash && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="absolute inset-0 bg-white z-30"
            />
          )}
        </AnimatePresence>

        {/* Camera View */}
        <div className="relative w-full h-full">
          {isActive && stream ? (
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-gray-900">
              <div className="text-center text-white">
                {error ? (
                  <div className="space-y-4">
                    <CameraIcon className="w-16 h-16 mx-auto text-gray-400" />
                    <p className="text-lg font-medium">Camera Error</p>
                    <p className="text-sm text-gray-300">{error}</p>
                    <TouchButton onClick={initializeCamera} variant="primary">
                      Try Again
                    </TouchButton>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-16 h-16 mx-auto border-4 border-gray-400 border-t-white rounded-full animate-spin" />
                    <p className="text-lg font-medium">Starting Camera...</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Top Controls */}
          <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/50 to-transparent">
            <div className="flex items-center justify-between p-4">
              <TouchButton
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="text-white bg-black/20 backdrop-blur-sm"
                icon={XMarkIcon}
              />

              {/* Recording Timer */}
              {isRecording && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center space-x-2 bg-red-600 text-white px-3 py-1 rounded-full"
                >
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span className="text-sm font-mono">{formatRecordingTime(recordingTime)}</span>
                </motion.div>
              )}

              <TouchButton
                onClick={toggleFacingMode}
                variant="ghost"
                size="sm"
                className="text-white bg-black/20 backdrop-blur-sm"
                icon={ArrowPathIcon}
              />
            </div>
          </div>

          {/* Mode Selector */}
          {mode === 'both' && (
            <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-20">
              <div className="flex bg-black/30 backdrop-blur-sm rounded-full p-1">
                <button
                  onClick={() => setCurrentMode('photo')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    currentMode === 'photo'
                      ? 'bg-white text-black'
                      : 'text-white'
                  }`}
                >
                  Photo
                </button>
                <button
                  onClick={() => setCurrentMode('video')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    currentMode === 'video'
                      ? 'bg-white text-black'
                      : 'text-white'
                  }`}
                >
                  Video
                </button>
              </div>
            </div>
          )}

          {/* Bottom Controls */}
          <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/50 to-transparent">
            <div className="flex items-center justify-between p-6">
              {/* Recent Photos */}
              <div className="flex space-x-2">
                {capturedPhotos.slice(0, 3).map((photo, index) => (
                  <motion.img
                    key={index}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    src={photo}
                    className="w-12 h-12 rounded-lg object-cover border-2 border-white/30"
                    alt={`Captured photo ${index + 1}`}
                  />
                ))}
                {capturedPhotos.length === 0 && (
                  <div className="w-12 h-12 rounded-lg bg-black/20 border-2 border-white/30 flex items-center justify-center">
                    <PhotoIcon className="w-6 h-6 text-white/50" />
                  </div>
                )}
              </div>

              {/* Capture Button */}
              <div className="flex-1 flex justify-center">
                {currentMode === 'photo' ? (
                  <TouchButton
                    onClick={handlePhotoCapture}
                    className="w-20 h-20 rounded-full bg-white border-4 border-gray-300 shadow-lg"
                    disabled={!isActive}
                    hapticFeedback={true}
                  >
                    <div className="w-16 h-16 rounded-full bg-white shadow-inner" />
                  </TouchButton>
                ) : (
                  <TouchButton
                    onClick={isRecording ? handleVideoStop : handleVideoStart}
                    className={`w-20 h-20 rounded-full border-4 border-white shadow-lg transition-all ${
                      isRecording ? 'bg-red-600' : 'bg-white'
                    }`}
                    disabled={!isActive}
                    hapticFeedback={true}
                  >
                    {isRecording ? (
                      <StopIcon className="w-8 h-8 text-white" />
                    ) : (
                      <VideoCameraIcon className="w-8 h-8 text-red-600" />
                    )}
                  </TouchButton>
                )}
              </div>

              {/* Gallery/Settings */}
              <div className="w-12" />
            </div>
          </div>
        </div>

        {/* Hidden Canvas for Photo Capture */}
        <canvas ref={canvasRef} className="hidden" />
      </motion.div>
    </AnimatePresence>
  );
};