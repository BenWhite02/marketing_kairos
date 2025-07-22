// File Path: src/components/features/Notifications/NotificationToast.tsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { Notification } from '../../../types/notifications';
import { useNotificationStore } from '../../../stores/ui/notificationStore';
import { Button } from '../../ui/Button';

interface NotificationToastProps {
  notification: Notification;
  onClose: () => void;
  duration?: number;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onClose,
  duration = 5000,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const { markAsRead } = useNotificationStore();

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for exit animation
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getIcon = () => {
    const iconClass = "h-5 w-5";
    
    switch (notification.type) {
      case 'success':
        return <CheckCircleIcon className={`${iconClass} text-green-400`} />;
      case 'warning':
        return <ExclamationTriangleIcon className={`${iconClass} text-yellow-400`} />;
      case 'error':
        return <XCircleIcon className={`${iconClass} text-red-400`} />;
      default:
        return <InformationCircleIcon className={`${iconClass} text-blue-400`} />;
    }
  };

  const getToastStyle = () => {
    switch (notification.type) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  const handleClick = () => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    if (notification.actionUrl) {
      window.open(notification.actionUrl, '_blank');
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 300, scale: 0.3 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 300, scale: 0.5, transition: { duration: 0.2 } }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className={`
            pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg border shadow-lg
            ${getToastStyle()}
          `}
        >
          <div className="p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {getIcon()}
              </div>
              
              <div className="ml-3 w-0 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {notification.title}
                </p>
                <p className="mt-1 text-sm text-gray-700">
                  {notification.message}
                </p>
                
                {notification.actionText && notification.actionUrl && (
                  <div className="mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClick}
                      className="text-xs"
                    >
                      {notification.actionText}
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="ml-4 flex flex-shrink-0">
                <button
                  onClick={handleClose}
                  className="inline-flex rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <span className="sr-only">Close</span>
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Toast Container Component
export const NotificationToastContainer: React.FC = () => {
  const { toastQueue, removeNotification } = useNotificationStore();

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-end px-4 py-6 sm:items-start sm:p-6">
      <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
        <AnimatePresence>
          {toastQueue.slice(0, 3).map((notification) => (
            <NotificationToast
              key={notification.id}
              notification={notification}
              onClose={() => removeNotification(notification.id)}
              duration={notification.priority === 'critical' ? 10000 : 5000}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};