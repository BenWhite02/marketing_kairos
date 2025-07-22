// src/components/business/moments/MomentBuilder/SchedulingTool.tsx

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClockIcon,
  CalendarDaysIcon,
  BoltIcon,
  CpuChipIcon,
  GlobeAltIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  PlusIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon,
  PlayIcon,
  PauseIcon
} from '@heroicons/react/24/outline';
import { Button } from '../../../ui/Button';
import { Card, CardHeader, CardBody, CardFooter } from '../../../ui/Card';
import { Input, Select } from '../../../ui/Input';
import { Modal } from '../../../ui/Modal';

// Types
interface SchedulingConfig {
  type: 'immediate' | 'scheduled' | 'recurring';
  startDate?: string;
  endDate?: string;
  timezone: string;
  frequency?: 'daily' | 'weekly' | 'monthly';
  triggers: TriggerConfig[];
}

interface TriggerConfig {
  id: string;
  type: 'event' | 'behavior' | 'time' | 'condition';
  name: string;
  conditions: TriggerCondition[];
  delay?: number;
  delayUnit?: 'minutes' | 'hours' | 'days';
  enabled: boolean;
}

interface TriggerCondition {
  id: string;
  field: string;
  operator: string;
  value: any;
  logicOperator: 'AND' | 'OR';
}

interface SchedulingToolProps {
  scheduling: SchedulingConfig;
  momentType: 'immediate' | 'scheduled' | 'triggered' | 'behavioral';
  onChange: (scheduling: SchedulingConfig) => void;
  readOnly?: boolean;
}

const SchedulingTool: React.FC<SchedulingToolProps> = ({
  scheduling,
  momentType,
  onChange,
  readOnly = false
}) => {
  // State Management
  const [activeTab, setActiveTab] = useState<'basic' | 'triggers' | 'advanced'>('basic');
  const [showTriggerBuilder, setShowTriggerBuilder] = useState(false);
  const [editingTrigger, setEditingTrigger] = useState<TriggerConfig | null>(null);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  // Available timezones
  const timezones = [
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'Europe/London', label: 'British Time (GMT)' },
    { value: 'Europe/Paris', label: 'Central European Time (CET)' },
    { value: 'Europe/Berlin', label: 'Central European Time (CET)' },
    { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
    { value: 'Asia/Shanghai', label: 'China Standard Time (CST)' },
    { value: 'Asia/Mumbai', label: 'India Standard Time (IST)' },
    { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)' }
  ];

  // Event trigger types
  const eventTriggerTypes = [
    {
      id: 'user_signup',
      name: 'User Signup',
      description: 'Triggered when a user creates an account',
      category: 'User Lifecycle',
      icon: '👋',
      commonDelays: [0, 5, 30, 60] // minutes
    },
    {
      id: 'purchase_completed',
      name: 'Purchase Completed',
      description: 'Triggered when a purchase is made',
      category: 'E-commerce',
      icon: '🛒',
      commonDelays: [0, 60, 1440] // minutes (0, 1hr, 24hr)
    },
    {
      id: 'cart_abandoned',
      name: 'Cart Abandoned',
      description: 'Triggered when a user abandons their cart',
      category: 'E-commerce',
      icon: '🛍️',
      commonDelays: [60, 180, 1440] // minutes (1hr, 3hr, 24hr)
    },
    {
      id: 'email_clicked',
      name: 'Email Clicked',
      description: 'Triggered when a user clicks an email link',
      category: 'Engagement',
      icon: '📧',
      commonDelays: [0, 30, 120] // minutes
    },
    {
      id: 'page_visited',
      name: 'Page Visited',
      description: 'Triggered when a specific page is visited',
      category: 'Website Activity',
      icon: '🌐',
      commonDelays: [0, 15, 60] // minutes
    },
    {
      id: 'milestone_reached',
      name: 'Milestone Reached',
      description: 'Triggered when a user reaches a milestone',
      category: 'User Lifecycle',
      icon: '🏆',
      commonDelays: [0, 60, 360] // minutes
    },
    {
      id: 'subscription_renewal',
      name: 'Subscription Renewal',
      description: 'Triggered on subscription renewal date',
      category: 'Billing',
      icon: '💳',
      commonDelays: [0, 1440, 10080] // minutes (0, 1day, 7days)
    },
    {
      id: 'support_ticket',
      name: 'Support Ticket Created',
      description: 'Triggered when a support ticket is created',
      category: 'Customer Service',
      icon: '🎫',
      commonDelays: [0, 30, 240] // minutes
    }
  ];

  // Behavioral trigger types
  const behaviorTriggerTypes = [
    {
      id: 'inactivity_period',
      name: 'Inactivity Period',
      description: 'User hasn\'t been active for specified time',
      category: 'Engagement',
      icon: '😴',
      commonDelays: [0, 60, 1440] // minutes
    },
    {
      id: 'high_engagement',
      name: 'High Engagement',
      description: 'User shows high engagement patterns',
      category: 'Engagement',
      icon: '🔥',
      commonDelays: [0, 30, 120] // minutes
    },
    {
      id: 'spending_threshold',
      name: 'Spending Threshold',
      description: 'User reaches spending milestone',
      category: 'Purchase Behavior',
      icon: '💰',
      commonDelays: [0, 60, 360] // minutes
    },
    {
      id: 'product_browsing',
      name: 'Product Browsing',
      description: 'User browses specific product categories',
      category: 'Product Interest',
      icon: '👀',
      commonDelays: [15, 60, 180] // minutes
    },
    {
      id: 'location_based',
      name: 'Location-Based',
      description: 'User enters or exits a specific location',
      category: 'Location',
      icon: '📍',
      commonDelays: [0, 15, 30] // minutes
    },
    {
      id: 'device_switch',
      name: 'Device Switch',
      description: 'User switches between devices',
      category: 'Technology',
      icon: '📱',
      commonDelays: [0, 5, 15] // minutes
    }
  ];

  // Event Handlers
  const updateScheduling = useCallback((updates: Partial<SchedulingConfig>) => {
    onChange({
      ...scheduling,
      ...updates
    });
  }, [scheduling, onChange]);

  const addTrigger = useCallback((triggerType: any) => {
    const newTrigger: TriggerConfig = {
      id: `trigger_${Date.now()}`,
      type: triggerType.category === 'User Lifecycle' || 
            triggerType.category === 'E-commerce' || 
            triggerType.category === 'Website Activity' ||
            triggerType.category === 'Billing' ||
            triggerType.category === 'Customer Service' ? 'event' : 'behavior',
      name: triggerType.name,
      conditions: [],
      delay: triggerType.commonDelays ? triggerType.commonDelays[0] : 0,
      delayUnit: 'minutes',
      enabled: true
    };
    
    updateScheduling({
      triggers: [...scheduling.triggers, newTrigger]
    });
    
    setShowTriggerBuilder(false);
  }, [scheduling.triggers, updateScheduling]);

  const updateTrigger = useCallback((triggerId: string, updates: Partial<TriggerConfig>) => {
    const updatedTriggers = scheduling.triggers.map(trigger =>
      trigger.id === triggerId ? { ...trigger, ...updates } : trigger
    );
    
    updateScheduling({ triggers: updatedTriggers });
  }, [scheduling.triggers, updateScheduling]);

  const removeTrigger = useCallback((triggerId: string) => {
    updateScheduling({
      triggers: scheduling.triggers.filter(t => t.id !== triggerId)
    });
  }, [scheduling.triggers, updateScheduling]);

  const duplicateTrigger = useCallback((triggerId: string) => {
    const originalTrigger = scheduling.triggers.find(t => t.id === triggerId);
    if (originalTrigger) {
      const duplicatedTrigger: TriggerConfig = {
        ...originalTrigger,
        id: `trigger_${Date.now()}`,
        name: `${originalTrigger.name} (Copy)`
      };
      
      updateScheduling({
        triggers: [...scheduling.triggers, duplicatedTrigger]
      });
    }
  }, [scheduling.triggers, updateScheduling]);

  // Computed values
  const canSchedule = useMemo(() => {
    return momentType === 'scheduled' || momentType === 'triggered' || momentType === 'behavioral';
  }, [momentType]);

  const schedulingTypeOptions = useMemo(() => {
    const options = [
      { value: 'immediate', label: 'Send Immediately', disabled: momentType !== 'immediate' }
    ];
    
    if (canSchedule) {
      options.push(
        { value: 'scheduled', label: 'Schedule for Later', disabled: false },
        { value: 'recurring', label: 'Recurring Schedule', disabled: false }
      );
    }
    
    return options;
  }, [canSchedule, momentType]);

  const getSchedulingStatus = useCallback(() => {
    if (scheduling.type === 'immediate') {
      return { color: 'green', text: 'Will send immediately when triggered' };
    }
    if (scheduling.type === 'scheduled' && scheduling.startDate) {
      const date = new Date(scheduling.startDate);
      const now = new Date();
      if (date < now) {
        return { color: 'red', text: 'Start date is in the past' };
      }
      return { color: 'blue', text: `Scheduled for ${date.toLocaleString()}` };
    }
    if (scheduling.type === 'recurring') {
      return { color: 'purple', text: `Recurring ${scheduling.frequency || 'daily'}` };
    }
    return { color: 'yellow', text: 'Configuration incomplete' };
  }, [scheduling]);

  const getTriggerStatusColor = useCallback((trigger: TriggerConfig) => {
    if (!trigger.enabled) return 'gray';
    if (trigger.type === 'event') return 'blue';
    if (trigger.type === 'behavior') return 'green';
    return 'purple';
  }, []);

  const formatDelay = useCallback((delay: number = 0, unit: string = 'minutes') => {
    if (delay === 0) return 'Immediate';
    
    if (unit === 'minutes') {
      if (delay < 60) return `${delay} minute${delay !== 1 ? 's' : ''}`;
      if (delay < 1440) return `${Math.floor(delay / 60)} hour${Math.floor(delay / 60) !== 1 ? 's' : ''}`;
      return `${Math.floor(delay / 1440)} day${Math.floor(delay / 1440) !== 1 ? 's' : ''}`;
    }
    
    return `${delay} ${unit}`;
  }, []);

  const status = getSchedulingStatus();

  return (
    <div className="space-y-6">
      {/* Header with Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Scheduling Configuration</h3>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              status.color === 'green' ? 'bg-green-100 text-green-800' :
              status.color === 'blue' ? 'bg-blue-100 text-blue-800' :
              status.color === 'purple' ? 'bg-purple-100 text-purple-800' :
              status.color === 'red' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {status.text}
            </div>
          </div>
        </CardHeader>
        
        <CardBody className="space-y-6">
          {/* Basic Scheduling Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Scheduling Type
              </label>
              <Select
                value={scheduling.type}
                onChange={(e) => updateScheduling({ type: e.target.value as any })}
                disabled={readOnly}
              >
                {schedulingTypeOptions.map((option) => (
                  <option key={option.value} value={option.value} disabled={option.disabled}>
                    {option.label}
                  </option>
                ))}
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                {scheduling.type === 'immediate' && 'Messages will be sent immediately when conditions are met'}
                {scheduling.type === 'scheduled' && 'Messages will be sent at the specified date and time'}
                {scheduling.type === 'recurring' && 'Messages will be sent on a recurring schedule'}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timezone
              </label>
              <Select
                value={scheduling.timezone}
                onChange={(e) => updateScheduling({ timezone: e.target.value })}
                disabled={readOnly}
              >
                {timezones.map((tz) => (
                  <option key={tz.value} value={tz.value}>{tz.label}</option>
                ))}
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                All scheduling will be calculated in this timezone
              </p>
            </div>
          </div>

          {/* Scheduled Configuration */}
          {scheduling.type === 'scheduled' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg"
            >
              <div className="flex items-center space-x-2">
                <CalendarDaysIcon className="w-5 h-5 text-blue-600" />
                <h4 className="font-medium text-blue-900">Scheduled Delivery</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="datetime-local"
                  label="Start Date & Time"
                  value={scheduling.startDate || ''}
                  onChange={(e) => updateScheduling({ startDate: e.target.value })}
                  disabled={readOnly}
                  required
                />
                
                <Input
                  type="datetime-local"
                  label="End Date & Time (Optional)"
                  value={scheduling.endDate || ''}
                  onChange={(e) => updateScheduling({ endDate: e.target.value })}
                  disabled={readOnly}
                />
              </div>

              {scheduling.startDate && new Date(scheduling.startDate) < new Date() && (
                <div className="flex items-center space-x-2 text-red-600 text-sm">
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  <span>Warning: Start date is in the past</span>
                </div>
              )}
            </motion.div>
          )}

          {/* Recurring Configuration */}
          {scheduling.type === 'recurring' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 p-4 bg-purple-50 border border-purple-200 rounded-lg"
            >
              <div className="flex items-center space-x-2">
                <ClockIcon className="w-5 h-5 text-purple-600" />
                <h4 className="font-medium text-purple-900">Recurring Schedule</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select
                  label="Frequency"
                  value={scheduling.frequency || 'daily'}
                  onChange={(e) => updateScheduling({ frequency: e.target.value as any })}
                  disabled={readOnly}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </Select>
                
                <Input
                  type="datetime-local"
                  label="Start Date & Time"
                  value={scheduling.startDate || ''}
                  onChange={(e) => updateScheduling({ startDate: e.target.value })}
                  disabled={readOnly}
                  required
                />
                
                <Input
                  type="datetime-local"
                  label="End Date & Time (Optional)"
                  value={scheduling.endDate || ''}
                  onChange={(e) => updateScheduling({ endDate: e.target.value })}
                  disabled={readOnly}
                />
              </div>

              <div className="text-sm text-purple-700 bg-purple-100 p-3 rounded">
                <strong>Recurring Schedule:</strong> This moment will be sent {scheduling.frequency || 'daily'} 
                {scheduling.startDate && ` starting ${new Date(scheduling.startDate).toLocaleString()}`}
                {scheduling.endDate && ` until ${new Date(scheduling.endDate).toLocaleString()}`}
              </div>
            </motion.div>
          )}
        </CardBody>
      </Card>

      {/* Triggers Configuration */}
      {(momentType === 'triggered' || momentType === 'behavioral') && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BoltIcon className="w-5 h-5 text-yellow-600" />
                <div>
                  <h3 className="text-lg font-medium">Trigger Configuration</h3>
                  <p className="text-sm text-gray-500">
                    Define when this moment should be triggered
                  </p>
                </div>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowTriggerBuilder(true)}
                disabled={readOnly}
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Trigger
              </Button>
            </div>
          </CardHeader>
          
          <CardBody>
            {scheduling.triggers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <BoltIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No triggers configured</p>
                <p className="text-sm">Add triggers to define when this moment should be sent</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setShowTriggerBuilder(true)}
                  disabled={readOnly}
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add Your First Trigger
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {scheduling.triggers.map((trigger, index) => (
                  <motion.div
                    key={trigger.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 border rounded-lg transition-all ${
                      trigger.enabled 
                        ? `border-${getTriggerStatusColor(trigger)}-200 bg-${getTriggerStatusColor(trigger)}-50` 
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className={`p-2 rounded-lg ${
                          trigger.type === 'event' ? 'bg-blue-100' : 
                          trigger.type === 'behavior' ? 'bg-green-100' : 'bg-purple-100'
                        }`}>
                          {trigger.type === 'event' ? (
                            <CpuChipIcon className={`w-5 h-5 ${
                              trigger.type === 'event' ? 'text-blue-600' : 
                              trigger.type === 'behavior' ? 'text-green-600' : 'text-purple-600'
                            }`} />
                          ) : (
                            <ChartBarIcon className={`w-5 h-5 ${
                              trigger.type === 'behavior' ? 'text-green-600' : 'text-purple-600'
                            }`} />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">{trigger.name}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              trigger.type === 'event' ? 'bg-blue-100 text-blue-800' : 
                              trigger.type === 'behavior' ? 'bg-green-100 text-green-800' : 
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {trigger.type}
                            </span>
                            {!trigger.enabled && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                Disabled
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                            <span>Delay: {formatDelay(trigger.delay, trigger.delayUnit)}</span>
                            <span>•</span>
                            <span>Status: {trigger.enabled ? 'Active' : 'Disabled'}</span>
                            {trigger.conditions.length > 0 && (
                              <>
                                <span>•</span>
                                <span>{trigger.conditions.length} condition{trigger.conditions.length !== 1 ? 's' : ''}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {/* Enable/Disable Toggle */}
                        <button
                          type="button"
                          onClick={() => updateTrigger(trigger.id, { enabled: !trigger.enabled })}
                          disabled={readOnly}
                          className={`
                            relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                            ${trigger.enabled ? 'bg-indigo-600' : 'bg-gray-200'}
                            ${readOnly ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                          `}
                        >
                          <span
                            className={`
                              inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                              ${trigger.enabled ? 'translate-x-6' : 'translate-x-1'}
                            `}
                          />
                        </button>
                        
                        {/* Action Menu */}
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingTrigger(trigger);
                              setShowTriggerBuilder(true);
                            }}
                            disabled={readOnly}
                            title="Edit trigger"
                          >
                            <AdjustmentsHorizontalIcon className="w-4 h-4" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => duplicateTrigger(trigger.id)}
                            disabled={readOnly}
                            title="Duplicate trigger"
                          >
                            📋
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTrigger(trigger.id)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50"
                            disabled={readOnly}
                            title="Delete trigger"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Trigger Details */}
                    {trigger.conditions.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="text-sm text-gray-600">
                          <strong>Conditions:</strong> {trigger.conditions.length} condition{trigger.conditions.length !== 1 ? 's' : ''} configured
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* Advanced Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AdjustmentsHorizontalIcon className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-medium">Advanced Settings</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
            >
              {showAdvancedSettings ? 'Hide' : 'Show'} Advanced
            </Button>
          </div>
        </CardHeader>
        
        <AnimatePresence>
          {showAdvancedSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Time Zone Optimization */}
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-3">
                      <GlobeAltIcon className="w-5 h-5 text-blue-600" />
                      <h4 className="font-medium text-gray-900">Time Zone Optimization</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Automatically optimize send times based on recipient time zones
                    </p>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          disabled={readOnly}
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Enable time zone optimization
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          disabled={readOnly}
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Respect business hours (9 AM - 6 PM)
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          disabled={readOnly}
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Skip weekends and holidays
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Frequency Capping */}
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-3">
                      <ClockIcon className="w-5 h-5 text-orange-600" />
                      <h4 className="font-medium text-gray-900">Frequency Capping</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Limit how often messages are sent to prevent fatigue
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          placeholder="5"
                          className="w-20"
                          disabled={readOnly}
                        />
                        <span className="text-sm text-gray-600">messages per day</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          placeholder="2"
                          className="w-20"
                          disabled={readOnly}
                        />
                        <span className="text-sm text-gray-600">hours between messages</span>
                      </div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          disabled={readOnly}
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Apply global frequency limits
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Priority & Queue Management */}
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-3">
                      <ChartBarIcon className="w-5 h-5 text-purple-600" />
                      <h4 className="font-medium text-gray-900">Priority & Queue</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Control message priority and queue handling
                    </p>
                    <div className="space-y-3">
                      <Select
                        label="Message Priority"
                        disabled={readOnly}
                      >
                        <option value="low">Low Priority</option>
                        <option value="normal">Normal Priority</option>
                        <option value="high">High Priority</option>
                        <option value="urgent">Urgent</option>
                      </Select>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          placeholder="1000"
                          className="w-24"
                          disabled={readOnly}
                        />
                        <span className="text-sm text-gray-600">messages per minute</span>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Options */}
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-3">
                      <BoltIcon className="w-5 h-5 text-green-600" />
                      <h4 className="font-medium text-gray-900">Delivery Options</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Configure delivery behavior and retry settings
                    </p>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          disabled={readOnly}
                          defaultChecked
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Enable automatic retries
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          disabled={readOnly}
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Skip unsubscribed users
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          disabled={readOnly}
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Enable delivery tracking
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </CardBody>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Warning Messages */}
      {scheduling.type === 'scheduled' && scheduling.startDate && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
        >
          <div className="flex items-start space-x-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-yellow-800">Scheduling Notice</p>
              <ul className="mt-2 text-yellow-700 space-y-1">
                <li>• Scheduled messages will be queued for delivery at the specified time</li>
                <li>• Time zone calculations are based on recipient preferences when available</li>
                <li>• Messages may be delayed if system maintenance is scheduled</li>
                {new Date(scheduling.startDate) < new Date() && (
                  <li className="text-red-700">• ⚠️ Start date is in the past - please update</li>
                )}
              </ul>
            </div>
          </div>
        </motion.div>
      )}

      {scheduling.triggers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-blue-50 border border-blue-200 rounded-lg"
        >
          <div className="flex items-start space-x-2">
            <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-blue-800">Trigger Information</p>
              <ul className="mt-2 text-blue-700 space-y-1">
                <li>• Triggers are evaluated in real-time when events occur</li>
                <li>• Multiple triggers use OR logic (any trigger can fire the moment)</li>
                <li>• Disabled triggers will not fire but remain configured</li>
                <li>• Delays are applied after the trigger conditions are met</li>
                <li>• Triggers respect frequency capping and time zone settings</li>
              </ul>
            </div>
          </div>
        </motion.div>
      )}

      {/* Trigger Builder Modal */}
      <Modal
        isOpen={showTriggerBuilder}
        onClose={() => {
          setShowTriggerBuilder(false);
          setEditingTrigger(null);
        }}
        title={editingTrigger ? 'Edit Trigger' : 'Add Trigger'}
        size="lg"
      >
        <div className="p-6">
          <div className="space-y-6">
            {/* Event Triggers */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <CpuChipIcon className="w-5 h-5 text-blue-600 mr-2" />
                Event Triggers
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {eventTriggerTypes.map((triggerType) => (
                  <div
                    key={triggerType.id}
                    className="p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 hover:shadow-sm transition-all"
                    onClick={() => addTrigger(triggerType)}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{triggerType.icon}</span>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{triggerType.name}</div>
                        <div className="text-sm text-gray-600">{triggerType.description}</div>
                        <div className="text-xs text-blue-600 mt-1">{triggerType.category}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Behavioral Triggers */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <ChartBarIcon className="w-5 h-5 text-green-600 mr-2" />
                Behavioral Triggers
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {behaviorTriggerTypes.map((triggerType) => (
                  <div
                    key={triggerType.id}
                    className="p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-green-300 hover:shadow-sm transition-all"
                    onClick={() => addTrigger(triggerType)}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{triggerType.icon}</span>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{triggerType.name}</div>
                        <div className="text-sm text-gray-600">{triggerType.description}</div>
                        <div className="text-xs text-green-600 mt-1">{triggerType.category}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SchedulingTool;