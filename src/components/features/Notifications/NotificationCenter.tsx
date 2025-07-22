// File Path: src/components/features/Notifications/NotificationCenter.tsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BellIcon, 
  XMarkIcon, 
  CheckIcon, 
  TrashIcon,
  FunnelIcon,
  Cog6ToothIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { useNotificationStore } from '../../../stores/ui/notificationStore';
import { NotificationFilters } from './NotificationFilters';
import { NotificationList } from './NotificationList';
import { NotificationSettings } from './NotificationSettings';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    notifications,
    unreadCount,
    filters,
    setFilters,
    markAllAsRead,
    clearAll,
    getFilteredNotifications,
  } = useNotificationStore();

  const [activeTab, setActiveTab] = useState<'notifications' | 'settings'>('notifications');
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredNotifications = getFilteredNotifications();

  useEffect(() => {
    setFilters({ search: searchTerm });
  }, [searchTerm, setFilters]);

  const handleMarkAllRead = () => {
    markAllAsRead();
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all notifications?')) {
      clearAll();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-gray-500 bg-opacity-75"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl"
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <BellIcon className="h-6 w-6 text-gray-700" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Notifications
                </h2>
                {unreadCount > 0 && (
                  <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                    {unreadCount}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="rounded-md p-1 text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="mt-4 flex space-x-1">
              <button
                onClick={() => setActiveTab('notifications')}
                className={`rounded-md px-3 py-1 text-sm font-medium ${
                  activeTab === 'notifications'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Notifications
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`rounded-md px-3 py-1 text-sm font-medium ${
                  activeTab === 'settings'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Settings
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'notifications' ? (
              <div className="flex h-full flex-col">
                {/* Search and Actions */}
                <div className="border-b border-gray-200 p-4">
                  <div className="relative mb-3">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search notifications..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowFilters(!showFilters)}
                        className="text-gray-600"
                      >
                        <FunnelIcon className="mr-1 h-4 w-4" />
                        Filters
                      </Button>
                    </div>

                    <div className="flex space-x-2">
                      {unreadCount > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleMarkAllRead}
                          className="text-gray-600"
                        >
                          <CheckIcon className="mr-1 h-4 w-4" />
                          Mark all read
                        </Button>
                      )}
                      {notifications.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleClearAll}
                          className="text-gray-600"
                        >
                          <TrashIcon className="mr-1 h-4 w-4" />
                          Clear all
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Filters */}
                  <AnimatePresence>
                    {showFilters && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-3 overflow-hidden"
                      >
                        <NotificationFilters />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Notification List */}
                <div className="flex-1 overflow-y-auto">
                  <NotificationList notifications={filteredNotifications} />
                </div>
              </div>
            ) : (
              <div className="h-full overflow-y-auto p-4">
                <NotificationSettings />
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};