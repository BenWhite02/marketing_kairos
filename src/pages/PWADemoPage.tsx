// src/pages/PWADemoPage.tsx - Example implementation
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CameraIcon, 
  MapPinIcon, 
  ShareIcon,
  DevicePhoneMobileIcon,
  BellIcon,
  WifiIcon
} from '@heroicons/react/24/outline';

import { MobileLayout } from '../components/mobile/MobileLayout';
import { TouchButton } from '../components/mobile/TouchButton';
import { MobileList } from '../components/mobile/MobileLayout';
import { CameraCapture } from '../components/device/CameraCapture';
import { LocationPicker } from '../components/device/LocationPicker';
import { usePWA } from '../providers/PWAProvider';
import { useDeviceCapabilities, useWebShare, useGeolocation } from '../hooks/device/useDeviceApis';

export const PWADemoPage: React.FC = () => {
  const [showCamera, setShowCamera] = useState(false);
  const [showLocation, setShowLocation] = useState(false);
  const { isInstalled, isOnline } = usePWA();
  const capabilities = useDeviceCapabilities();
  const { share } = useWebShare();
  const { position } = useGeolocation();

  const handleShare = async () => {
    try {
      await share({
        title: 'Kairos Marketing Platform',
        text: 'Check out this amazing marketing orchestration platform!',
        url: window.location.href
      });
    } catch (error) {
      console.log('Share cancelled or failed');
    }
  };

  const demoItems = [
    {
      id: 'camera',
      title: 'Camera Capture',
      subtitle: 'Take photos and videos with device camera',
      icon: <CameraIcon className="w-6 h-6 text-blue-600" />,
      action: (
        <TouchButton
          onClick={() => setShowCamera(true)}
          variant="primary"
          size="sm"
          disabled={!capabilities.camera}
        >
          Open
        </TouchButton>
      )
    },
    {
      id: 'location',
      title: 'Location Services',
      subtitle: position ? 
        `Current: ${position.latitude.toFixed(4)}, ${position.longitude.toFixed(4)}` :
        'Get current device location',
      icon: <MapPinIcon className="w-6 h-6 text-green-600" />,
      action: (
        <TouchButton
          onClick={() => setShowLocation(true)}
          variant="primary"
          size="sm"
          disabled={!capabilities.geolocation}
        >
          Get Location
        </TouchButton>
      )
    },
    {
      id: 'share',
      title: 'Web Share API',
      subtitle: 'Share content using device share sheet',
      icon: <ShareIcon className="w-6 h-6 text-purple-600" />,
      action: (
        <TouchButton
          onClick={handleShare}
          variant="primary"
          size="sm"
          disabled={!capabilities.webShare}
        >
          Share
        </TouchButton>
      )
    },
    {
      id: 'notifications',
      title: 'Push Notifications',
      subtitle: 'Real-time notifications for campaigns',
      icon: <BellIcon className="w-6 h-6 text-orange-600" />,
      badge: capabilities.notifications ? 'Available' : 'Not Available'
    },
    {
      id: 'offline',
      title: 'Offline Support',
      subtitle: 'Works without internet connection',
      icon: <WifiIcon className="w-6 h-6 text-indigo-600" />,
      badge: isOnline ? 'Online' : 'Offline'
    },
    {
      id: 'pwa',
      title: 'PWA Installation',
      subtitle: isInstalled ? 'App is installed' : 'Install as app',
      icon: <DevicePhoneMobileIcon className="w-6 h-6 text-red-600" />,
      badge: isInstalled ? 'Installed' : 'Browser'
    }
  ];

  return (
    <MobileLayout
      title="PWA Features Demo"
      showBackButton={true}
      onBackClick={() => window.history.back()}
    >
      <div className="p-4 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-8"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl mx-auto mb-4 flex items-center justify-center">
            <DevicePhoneMobileIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            PWA Features
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Experience native app features in your browser
          </p>
        </motion.div>

        {/* Capabilities Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Device Capabilities
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${capabilities.camera ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-600 dark:text-gray-300">Camera</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${capabilities.geolocation ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-600 dark:text-gray-300">Location</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${capabilities.vibration ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-600 dark:text-gray-300">Vibration</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${capabilities.webShare ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-600 dark:text-gray-300">Web Share</span>
            </div>
          </div>
        </motion.div>

        {/* Feature List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden"
        >
          <MobileList items={demoItems} />
        </motion.div>

        {/* App Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            App Status
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">Installation:</span>
              <span className={`font-medium ${isInstalled ? 'text-green-600' : 'text-blue-600'}`}>
                {isInstalled ? 'Installed as App' : 'Running in Browser'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">Connection:</span>
              <span className={`font-medium ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">Device Type:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {/Mobi|Android/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop'}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-3">
            💡 PWA Tips
          </h3>
          <ul className="space-y-2 text-sm text-yellow-700 dark:text-yellow-300">
            <li>• Install the app for the best experience</li>
            <li>• Enable notifications to stay updated</li>
            <li>• Works offline after first visit</li>
            <li>• Uses native device features</li>
          </ul>
        </motion.div>
      </div>

      {/* Camera Modal */}
      <CameraCapture
        isOpen={showCamera}
        onClose={() => setShowCamera(false)}
        onPhotoCapture={(photo) => {
          console.log('Photo captured:', photo);
          // Handle photo upload or storage
        }}
      />

      {/* Location Modal */}
      <LocationPicker
        isOpen={showLocation}
        onClose={() => setShowLocation(false)}
        onLocationSelect={(location) => {
          console.log('Location selected:', location);
          // Handle location data
        }}
      />
    </MobileLayout>
  );
};
