// File Path: src/components/features/Notifications/NotificationFilters.tsx

import React from 'react';
import { useNotificationStore } from '../../../stores/ui/notificationStore';
import { Select } from '../../ui/Input';

export const NotificationFilters: React.FC = () => {
  const { filters, setFilters } = useNotificationStore();

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    { value: 'system', label: 'System' },
    { value: 'campaign', label: 'Campaigns' },
    { value: 'experiment', label: 'Experiments' },
    { value: 'moment', label: 'Moments' },
    { value: 'analytics', label: 'Analytics' },
  ];

  const typeOptions = [
    { value: '', label: 'All Types' },
    { value: 'info', label: 'Info' },
    { value: 'success', label: 'Success' },
    { value: 'warning', label: 'Warning' },
    { value: 'error', label: 'Error' },
  ];

  const priorityOptions = [
    { value: '', label: 'All Priorities' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' },
  ];

  const readStatusOptions = [
    { value: '', label: 'All' },
    { value: 'false', label: 'Unread Only' },
    { value: 'true', label: 'Read Only' },
  ];

  return (
    <div className="space-y-3 rounded-md border border-gray-200 bg-gray-50 p-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Category
          </label>
          <Select
            value={filters.category || ''}
            onChange={(e) => setFilters({ category: e.target.value || undefined })}
            options={categoryOptions}
            size="sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Type
          </label>
          <Select
            value={filters.type || ''}
            onChange={(e) => setFilters({ type: e.target.value || undefined })}
            options={typeOptions}
            size="sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Priority
          </label>
          <Select
            value={filters.priority || ''}
            onChange={(e) => setFilters({ priority: e.target.value || undefined })}
            options={priorityOptions}
            size="sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Status
          </label>
          <Select
            value={filters.read !== undefined ? filters.read.toString() : ''}
            onChange={(e) => {
              const value = e.target.value;
              setFilters({ 
                read: value === '' ? undefined : value === 'true' 
              });
            }}
            options={readStatusOptions}
            size="sm"
          />
        </div>
      </div>

      {/* Clear Filters */}
      {(filters.category || filters.type || filters.priority || filters.read !== undefined) && (
        <div className="pt-2 border-t border-gray-200">
          <button
            onClick={() => setFilters({})}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
};