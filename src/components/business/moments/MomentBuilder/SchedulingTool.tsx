// src/components/business/moments/MomentBuilder/SchedulingTool.tsx

import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '../../../ui/Card';
import { Button } from '../../../ui/Button';
import { Input, Select } from '../../../ui/Input';

interface SchedulingConfig {
  type: 'immediate' | 'scheduled' | 'triggered' | 'recurring';
  scheduledDate?: string;
  scheduledTime?: string;
  triggerEvent?: string;
  recurringPattern?: 'daily' | 'weekly' | 'monthly';
  timezone?: string;
}

interface SchedulingToolProps {
  config: SchedulingConfig;
  onChange: (config: SchedulingConfig) => void;
  readOnly?: boolean;
}

export const SchedulingTool: React.FC<SchedulingToolProps> = ({
  config,
  onChange,
  readOnly = false
}) => {
  const [selectedType, setSelectedType] = useState<SchedulingConfig['type']>(config.type);

  const handleTypeChange = (type: SchedulingConfig['type']) => {
    setSelectedType(type);
    onChange({ ...config, type });
  };

  const handleConfigChange = (field: keyof SchedulingConfig, value: any) => {
    onChange({ ...config, [field]: value });
  };

  const getEstimatedDelivery = () => {
    switch (config.type) {
      case 'immediate':
        return 'Within 5 minutes';
      case 'scheduled':
        if (config.scheduledDate && config.scheduledTime) {
          return `${config.scheduledDate} at ${config.scheduledTime}`;
        }
        return 'Set date and time';
      case 'triggered':
        return 'When trigger event occurs';
      case 'recurring':
        return `Every ${config.recurringPattern || 'period'}`;
      default:
        return 'Unknown';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Scheduling & Timing</h3>
          <div className="text-sm text-gray-600">
            Delivery: {getEstimatedDelivery()}
          </div>
        </div>
      </CardHeader>
      <CardBody>
        <div className="space-y-6">
          {/* Scheduling Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Delivery Type
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: 'immediate', label: 'Send Now', desc: 'Immediate delivery' },
                { value: 'scheduled', label: 'Schedule', desc: 'Set date & time' },
                { value: 'triggered', label: 'Triggered', desc: 'Event-based' },
                { value: 'recurring', label: 'Recurring', desc: 'Repeat delivery' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => handleTypeChange(option.value as SchedulingConfig['type'])}
                  disabled={readOnly}
                  className={`p-3 border rounded-lg text-left transition-colors ${
                    selectedType === option.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-sm">{option.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{option.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Scheduled Delivery */}
          {selectedType === 'scheduled' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Date"
                type="date"
                value={config.scheduledDate || ''}
                onChange={(e) => handleConfigChange('scheduledDate', e.target.value)}
                disabled={readOnly}
              />
              <Input
                label="Time"
                type="time"
                value={config.scheduledTime || ''}
                onChange={(e) => handleConfigChange('scheduledTime', e.target.value)}
                disabled={readOnly}
              />
            </div>
          )}

          {/* Triggered Delivery */}
          {selectedType === 'triggered' && (
            <div>
              <Select
                label="Trigger Event"
                value={config.triggerEvent || ''}
                onChange={(e) => handleConfigChange('triggerEvent', e.target.value)}
                disabled={readOnly}
              >
                <option value="">Select trigger...</option>
                <option value="user_signup">User Signup</option>
                <option value="purchase_complete">Purchase Complete</option>
                <option value="cart_abandon">Cart Abandonment</option>
                <option value="page_visit">Page Visit</option>
                <option value="email_open">Email Open</option>
                <option value="app_open">App Open</option>
              </Select>
            </div>
          )}

          {/* Recurring Delivery */}
          {selectedType === 'recurring' && (
            <div>
              <Select
                label="Recurring Pattern"
                value={config.recurringPattern || ''}
                onChange={(e) => handleConfigChange('recurringPattern', e.target.value)}
                disabled={readOnly}
              >
                <option value="">Select pattern...</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </Select>
            </div>
          )}

          {/* Timezone */}
          <div>
            <Select
              label="Timezone"
              value={config.timezone || 'UTC'}
              onChange={(e) => handleConfigChange('timezone', e.target.value)}
              disabled={readOnly}
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
              <option value="Europe/London">London Time</option>
              <option value="Asia/Tokyo">Tokyo Time</option>
            </Select>
          </div>

          {/* Delivery Summary */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Delivery Summary</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <div>Type: {selectedType}</div>
              <div>Estimated delivery: {getEstimatedDelivery()}</div>
              <div>Timezone: {config.timezone || 'UTC'}</div>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};