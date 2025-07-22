// File Path: src/components/features/Notifications/NotificationSettings.tsx

import React from 'react';
import { Switch } from '@headlessui/react';
import { useNotificationStore } from '../../../stores/ui/notificationStore';
import { Input } from '../../ui/Input';

export const NotificationSettings: React.FC = () => {
  const { preferences, setPreferences } = useNotificationStore();

  const updatePreference = (key: string, value: any) => {
    setPreferences({ [key]: value });
  };

  const updateCategory = (category: string, enabled: boolean) => {
    setPreferences({
      categories: {
        ...preferences.categories,
        [category]: enabled,
      },
    });
  };

  const updatePriority = (priority: string, enabled: boolean) => {
    setPreferences({
      priority: {
        ...preferences.priority,
        [priority]: enabled,
      },
    });
  };

  const updateQuietHours = (field: string, value: any) => {
    setPreferences({
      quietHours: {
        ...preferences.quietHours,
        [field]: value,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Notification Preferences
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-700">Email Notifications</h4>
              <p className="text-sm text-gray-500">Receive notifications via email</p>
            </div>
            <Switch
              checked={preferences.email}
              onChange={(enabled) => updatePreference('email', enabled)}
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                ${preferences.email ? 'bg-blue-600' : 'bg-gray-200'}
              `}
            >
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${preferences.email ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </Switch>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-700">Push Notifications</h4>
              <p className="text-sm text-gray-500">Receive browser push notifications</p>
            </div>
            <Switch
              checked={preferences.push}
              onChange={(enabled) => updatePreference('push', enabled)}
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                ${preferences.push ? 'bg-blue-600' : 'bg-gray-200'}
              `}
            >
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${preferences.push ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </Switch>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-700">In-App Notifications</h4>
              <p className="text-sm text-gray-500">Show notifications within the app</p>
            </div>
            <Switch
              checked={preferences.inApp}
              onChange={(enabled) => updatePreference('inApp', enabled)}
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                ${preferences.inApp ? 'bg-blue-600' : 'bg-gray-200'}
              `}
            >
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${preferences.inApp ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </Switch>
          </div>
        </div>
      </div>

      {/* Category Settings */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Notification Categories
        </h3>
        
        <div className="space-y-3">
          {Object.entries(preferences.categories).map(([category, enabled]) => (
            <div key={category} className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-700 capitalize">
                  {category}
                </h4>
              </div>
              <Switch
                checked={enabled}
                onChange={(value) => updateCategory(category, value)}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                  ${enabled ? 'bg-blue-600' : 'bg-gray-200'}
                `}
              >
                <span
                  className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                    ${enabled ? 'translate-x-6' : 'translate-x-1'}
                  `}
                />
              </Switch>
            </div>
          ))}
        </div>
      </div>

      {/* Priority Settings */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Priority Levels
        </h3>
        
        <div className="space-y-3">
          {Object.entries(preferences.priority).map(([priority, enabled]) => (
            <div key={priority} className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-700 capitalize">
                  {priority}
                </h4>
              </div>
              <Switch
                checked={enabled}
                onChange={(value) => updatePriority(priority, value)}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                  ${enabled ? 'bg-blue-600' : 'bg-gray-200'}
                `}
              >
                <span
                  className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                    ${enabled ? 'translate-x-6' : 'translate-x-1'}
                  `}
                />
              </Switch>
            </div>
          ))}
        </div>
      </div>

      {/* Quiet Hours */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Quiet Hours
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-700">Enable Quiet Hours</h4>
              <p className="text-sm text-gray-500">Suppress non-critical notifications during specified hours</p>
            </div>
            <Switch
              checked={preferences.quietHours.enabled}
              onChange={(enabled) => updateQuietHours('enabled', enabled)}
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                ${preferences.quietHours.enabled ? 'bg-blue-600' : 'bg-gray-200'}
              `}
            >
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${preferences.quietHours.enabled ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </Switch>
          </div>

          {preferences.quietHours.enabled && (
            <div className="grid grid-cols-2 gap-4 pl-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time
                </label>
                <Input
                  type="time"
                  value={preferences.quietHours.start}
                  onChange={(e) => updateQuietHours('start', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Time
                </label>
                <Input
                  type="time"
                  value={preferences.quietHours.end}
                  onChange={(e) => updateQuietHours('end', e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};