// src/components/pwa/InstallPrompt.tsx
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, ArrowDownTrayIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline';
import { usePWA } from '../../providers/PWAProvider';
import { Button } from '../ui/Button';

interface InstallPromptProps {
  className?: string;
}

export const InstallPrompt: React.FC<InstallPromptProps> = ({ className }) => {
  const { showInstallPrompt, installApp, dismissInstallPrompt, isInstalled } = usePWA();
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if user has dismissed prompt recently
    const dismissedTime = localStorage.getItem('pwa-install-dismissed');
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    if (dismissedTime && parseInt(dismissedTime) > sevenDaysAgo) {
      setDismissed(true);
      return;
    }

    // Show prompt after user has been active for 2 minutes
    const timer = setTimeout(() => {
      if (showInstallPrompt && !isInstalled && !dismissed) {
        setShowPrompt(true);
      }
    }, 120000);

    return () => clearTimeout(timer);
  }, [showInstallPrompt, isInstalled, dismissed]);

  const handleInstall = async () => {
    try {
      await installApp();
      setShowPrompt(false);
    } catch (error) {
      console.error('Installation failed:', error);
    }
  };

  const handleDismiss = () => {
    dismissInstallPrompt();
    setShowPrompt(false);
    setDismissed(true);
  };

  if (!showPrompt || isInstalled) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className={`
          fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto
          bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700
          ${className}
        `}
      >
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-2xl" />
        
        <div className="relative p-6">
          {/* Close Button */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Dismiss install prompt"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>

          {/* App Icon */}
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <DevicePhoneMobileIcon className="w-8 h-8 text-white" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              {/* Title and Description */}
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                Install Kairos App
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                Get the full Kairos experience with faster loading, offline access, and native app features.
              </p>

              {/* Features List */}
              <div className="space-y-2 mb-6">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3 flex-shrink-0" />
                  Works offline - access your campaigns anywhere
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3 flex-shrink-0" />
                  Push notifications for real-time updates
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3 flex-shrink-0" />
                  Faster loading and smoother performance
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Button
                  onClick={handleInstall}
                  variant="primary"
                  size="sm"
                  className="flex-1"
                  icon={ArrowDownTrayIcon}
                >
                  Install App
                </Button>
                <Button
                  onClick={handleDismiss}
                  variant="ghost"
                  size="sm"
                  className="px-4"
                >
                  Not now
                </Button>
              </div>
            </div>
          </div>

          {/* Installation Steps (for manual installation) */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <details className="group">
              <summary className="text-sm text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                Manual installation instructions
              </summary>
              <div className="mt-3 space-y-2 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-start space-x-2">
                  <span className="font-medium">iOS Safari:</span>
                  <span>Tap Share → Add to Home Screen</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="font-medium">Android Chrome:</span>
                  <span>Tap Menu → Add to Home Screen</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="font-medium">Desktop:</span>
                  <span>Look for install icon in address bar</span>
                </div>
              </div>
            </details>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// Update Available Prompt Component
export const UpdatePrompt: React.FC<{ className?: string }> = ({ className }) => {
  const { isUpdateAvailable, updateApp } = usePWA();
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (isUpdateAvailable) {
      setShowPrompt(true);
    }
  }, [isUpdateAvailable]);

  const handleUpdate = async () => {
    try {
      await updateApp();
      setShowPrompt(false);
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!showPrompt) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -100 }}
        className={`
          fixed top-4 left-4 right-4 z-50 max-w-md mx-auto
          bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700
          ${className}
        `}
      >
        <div className="p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <ArrowDownTrayIcon className="w-5 h-5 text-white" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                Update Available
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">
                A new version of Kairos is ready with improvements and bug fixes.
              </p>

              <div className="flex space-x-2">
                <Button
                  onClick={handleUpdate}
                  variant="primary"
                  size="xs"
                  className="flex-1"
                >
                  Update Now
                </Button>
                <Button
                  onClick={handleDismiss}
                  variant="ghost"
                  size="xs"
                  className="px-3"
                >
                  Later
                </Button>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label="Dismiss update prompt"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// Offline Indicator Component
export const OfflineIndicator: React.FC<{ className?: string }> = ({ className }) => {
  const { isOnline } = usePWA();

  if (isOnline) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        fixed top-0 left-0 right-0 z-40
        bg-yellow-500 text-yellow-900 text-center py-2 px-4 text-sm font-medium
        ${className}
      `}
    >
      <div className="flex items-center justify-center space-x-2">
        <div className="w-2 h-2 bg-yellow-700 rounded-full animate-pulse" />
        <span>You're offline. Some features may be limited.</span>
      </div>
    </motion.div>
  );
};