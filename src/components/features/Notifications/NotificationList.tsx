// File Path: src/components/features/Notifications/NotificationList.tsx

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import {
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  TrashIcon,
  EyeIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';
import { Notification } from '../../../types/notifications';
import { useNotificationStore } from '../../../stores/ui/notificationStore';
import { Button } from '../../ui/Button';

interface NotificationListProps {
  notifications: Notification[];
}

export const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
}) => {
  const { markAsRead, removeNotification } = useNotificationStore();

  const getNotificationIcon = (type: Notification['type']) => {
    const iconClass = "h-5 w-5";
    
    switch (type) {
      case 'success':
        return <CheckCircleIcon className={`${iconClass} text-green-500`} />;
      case 'warning':
        return <ExclamationTriangleIcon className={`${iconClass} text-yellow-500`} />;
      case 'error':
        return <XCircleIcon className={`${iconClass} text-red-500`} />;
      default:
        return <InformationCircleIcon className={`${iconClass} text-blue-500`} />;
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'critical':
        return 'border-l-red-500 bg-red-50';
      case 'high':
        return 'border-l-orange-500 bg-orange-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      default:
        return 'border-l-blue-500 bg-blue-50';
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    if (notification.actionUrl) {
      window.open(notification.actionUrl, '_blank');
    }
  };

  const handleDelete = (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    removeNotification(notificationId);
  };

  const handleMarkRead = (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    markAsRead(notificationId);
  };

  if (notifications.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <InformationCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications</h3>
          <p className="mt-1 text-sm text-gray-500">
            You're all caught up! New notifications will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2 p-4">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`
              relative cursor-pointer rounded-lg border-l-4 bg-white p-4 shadow-sm transition-all hover:shadow-md
              ${getPriorityColor(notification.priority)}
              ${!notification.read ? 'ring-2 ring-blue-200' : ''}
            `}
            onClick={() => handleNotificationClick(notification)}
          >
            <div className="flex items-start space-x-3">
              {/* Icon */}
              <div className="flex-shrink-0">
                {getNotificationIcon(notification.type)}
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className={`text-sm font-medium ${
                      notification.read ? 'text-gray-700' : 'text-gray-900'
                    }`}>
                      {notification.title}
                    </h4>
                    <p className={`mt-1 text-sm ${
                      notification.read ? 'text-gray-500' : 'text-gray-700'
                    }`}>
                      {notification.message}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="ml-4 flex flex-shrink-0 space-x-1">
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleMarkRead(e, notification.id)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="Mark as read"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {notification.actionUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="Open link"
                      >
                        <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDelete(e, notification.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                      title="Delete"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                  <span className="capitalize">{notification.category}</span>
                  <span>{formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}</span>
                </div>

                {/* Action Button */}
                {notification.actionText && notification.actionUrl && (
                  <div className="mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(notification.actionUrl, '_blank');
                      }}
                    >
                      {notification.actionText}
                    </Button>
                  </div>
                )}
              </div>

              {/* Unread indicator */}
              {!notification.read && (
                <div className="h-2 w-2 rounded-full bg-blue-500" />
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};