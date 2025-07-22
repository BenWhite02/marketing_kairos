// src/components/device/LocationPicker.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPinIcon, 
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useGeolocation } from '../../hooks/device/useDeviceApis';
import { TouchButton } from '../mobile/TouchButton';

interface LocationPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect?: (location: { latitude: number; longitude: number; address?: string }) => void;
  showMap?: boolean;
  accuracyThreshold?: number;
  className?: string;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  isOpen,
  onClose,
  onLocationSelect,
  showMap = false,
  accuracyThreshold = 100,
  className
}) => {
  const { position, error, isLoading, getCurrentPosition, watchPosition } = useGeolocation();
  const [address, setAddress] = useState<string>('');
  const [isWatching, setIsWatching] = useState(false);
  const [locationHistory, setLocationHistory] = useState<Array<{
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: number;
    address?: string;
  }>>([]);

  // Reverse geocoding to get address
  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    try {
      // Using a public geocoding service (replace with your preferred service)
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${process.env.REACT_APP_OPENCAGE_API_KEY}&language=en&pretty=1`
      );
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        return data.results[0].formatted;
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
    }
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }, []);

  // Update address when position changes
  useEffect(() => {
    if (position) {
      reverseGeocode(position.latitude, position.longitude)
        .then(addr => setAddress(addr));
      
      // Add to history
      setLocationHistory(prev => [
        {
          ...position,
          address: address
        },
        ...prev.slice(0, 4)
      ]);
    }
  }, [position, reverseGeocode]);

  const handleGetCurrentLocation = useCallback(async () => {
    try {
      await getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      });
    } catch (err) {
      console.error('Failed to get current location:', err);
    }
  }, [getCurrentPosition]);

  const handleStartWatching = useCallback(() => {
    const stopWatching = watchPosition({
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000
    });
    
    setIsWatching(true);
    
    // Store cleanup function
    if (stopWatching) {
      return () => {
        stopWatching();
        setIsWatching(false);
      };
    }
  }, [watchPosition]);

  const handleStopWatching = useCallback(() => {
    setIsWatching(false);
  }, []);

  const handleSelectLocation = useCallback(() => {
    if (position) {
      onLocationSelect?.({
        latitude: position.latitude,
        longitude: position.longitude,
        address
      });
      onClose();
    }
  }, [position, address, onLocationSelect, onClose]);

  const getAccuracyLevel = (accuracy: number): { level: string; color: string; description: string } => {
    if (accuracy <= 10) {
      return { level: 'Excellent', color: 'text-green-600', description: 'GPS accurate to within 10 meters' };
    } else if (accuracy <= 50) {
      return { level: 'Good', color: 'text-blue-600', description: 'GPS accurate to within 50 meters' };
    } else if (accuracy <= 100) {
      return { level: 'Fair', color: 'text-yellow-600', description: 'GPS accurate to within 100 meters' };
    } else {
      return { level: 'Poor', color: 'text-red-600', description: 'GPS accuracy over 100 meters' };
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm ${className}`}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl max-h-[80vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Select Location
            </h2>
            <TouchButton
              onClick={onClose}
              variant="ghost"
              size="sm"
              icon={XMarkIcon}
              className="text-gray-500"
            />
          </div>

          <div className="p-6 space-y-6 overflow-y-auto">
            {/* Current Location Status */}
            <div className="space-y-4">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center space-x-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800"
                >
                  <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
                  <div>
                    <p className="text-sm font-medium text-red-800 dark:text-red-200">
                      Location Error
                    </p>
                    <p className="text-xs text-red-600 dark:text-red-300">
                      {error}
                    </p>
                  </div>
                </motion.div>
              )}

              {position && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800"
                >
                  <div className="flex items-start space-x-3">
                    <CheckCircleIcon className="w-6 h-6 text-green-600 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-green-800 dark:text-green-200">
                        Location Found
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-300 mt-1">
                        {address || 'Loading address...'}
                      </p>
                      
                      {/* Coordinates */}
                      <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 space-y-1">
                        <div>
                          Lat: {position.latitude.toFixed(6)}, Lng: {position.longitude.toFixed(6)}
                        </div>
                        
                        {/* Accuracy Information */}
                        {position.accuracy && (
                          <div className="flex items-center space-x-2">
                            <span>Accuracy:</span>
                            <span className={getAccuracyLevel(position.accuracy).color}>
                              {getAccuracyLevel(position.accuracy).level}
                            </span>
                            <span>({position.accuracy.toFixed(0)}m)</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <TouchButton
                onClick={handleGetCurrentLocation}
                disabled={isLoading}
                variant="primary"
                className="w-full flex items-center justify-center space-x-2"
                icon={isLoading ? ArrowPathIcon : MapPinIcon}
              >
                <span>
                  {isLoading ? 'Getting Location...' : 'Get Current Location'}
                </span>
                {isLoading && (
                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                )}
              </TouchButton>

              <div className="flex space-x-3">
                <TouchButton
                  onClick={isWatching ? handleStopWatching : handleStartWatching}
                  variant="secondary"
                  className="flex-1"
                >
                  {isWatching ? 'Stop Tracking' : 'Track Location'}
                </TouchButton>
                
                {position && (
                  <TouchButton
                    onClick={handleSelectLocation}
                    variant="primary"
                    className="flex-1"
                    disabled={position.accuracy > accuracyThreshold}
                  >
                    Use This Location
                  </TouchButton>
                )}
              </div>
            </div>

            {/* Map Placeholder */}
            {showMap && position && (
              <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <MapPinIcon className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">Map integration available</p>
                  <p className="text-xs">Add your preferred map service here</p>
                </div>
              </div>
            )}

            {/* Location History */}
            {locationHistory.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  Recent Locations
                </h3>
                <div className="space-y-2">
                  {locationHistory.slice(0, 3).map((loc, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => onLocationSelect?.(loc)}
                      className="w-full p-3 text-left bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <MapPinIcon className="w-5 h-5 text-gray-400" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 dark:text-white truncate">
                            {loc.address || `${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)}`}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(loc.timestamp).toLocaleTimeString()} • Accuracy: {loc.accuracy.toFixed(0)}m
                          </p>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Tips */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                Location Tips
              </h4>
              <ul className="text-xs text-blue-600 dark:text-blue-300 space-y-1">
                <li>• Move to an open area for better GPS accuracy</li>
                <li>• Enable high accuracy mode in your device settings</li>
                <li>• Wait a moment for the GPS to stabilize</li>
                {isWatching && <li>• Tracking mode will update your location automatically</li>}
              </ul>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};