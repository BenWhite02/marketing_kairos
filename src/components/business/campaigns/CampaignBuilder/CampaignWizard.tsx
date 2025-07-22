// src/components/business/campaigns/CampaignBuilder/CampaignWizard.tsx

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckIcon,
  BoltIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { Button } from '../../../ui/Button';
import { Card, CardHeader, CardBody, CardFooter } from '../../../ui/Card';
import { Input, Select, TextArea } from '../../../ui/Input';
import { Modal } from '../../../ui/Modal';

interface CampaignWizardProps {
  open: boolean;
  onClose: () => void;
  onSave: (campaign: CampaignFormData) => void;
  initialData?: Partial<CampaignFormData>;
}

interface CampaignFormData {
  name: string;
  type: string;
  goal: string;
  description: string;
  budget: {
    total: number;
    currency: string;
    allocation: 'even' | 'weighted' | 'performance';
  };
  timeline: {
    startDate: string;
    endDate: string;
    timezone: string;
  };
  audience: {
    segments: string[];
    estimatedSize: number;
    targeting: 'broad' | 'specific' | 'custom';
  };
  channels: {
    email: boolean;
    sms: boolean;
    push: boolean;
    social: boolean;
    display: boolean;
    search: boolean;
  };
  objectives: {
    primary: string;
    secondary: string[];
    kpis: string[];
  };
}

const CAMPAIGN_TYPES = [
  { 
    value: 'acquisition', 
    label: 'Customer Acquisition', 
    icon: '🎯', 
    description: 'Attract new customers and grow your audience',
    goals: ['Increase sign-ups', 'Drive trial conversions', 'Expand market reach']
  },
  { 
    value: 'retention', 
    label: 'Customer Retention', 
    icon: '💝', 
    description: 'Keep existing customers engaged and loyal',
    goals: ['Reduce churn', 'Increase engagement', 'Build loyalty']
  },
  { 
    value: 'conversion', 
    label: 'Conversion Optimization', 
    icon: '⚡', 
    description: 'Increase conversion rates and revenue per customer',
    goals: ['Optimize checkout', 'Reduce cart abandonment', 'Increase AOV']
  },
  { 
    value: 'engagement', 
    label: 'Engagement Building', 
    icon: '🔥', 
    description: 'Build deeper relationships with your audience',
    goals: ['Increase time on site', 'Boost social engagement', 'Drive content consumption']
  },
  { 
    value: 'winback', 
    label: 'Win-back Campaign', 
    icon: '🎪', 
    description: 'Re-engage dormant or churned customers',
    goals: ['Reactivate accounts', 'Win back churned customers', 'Revive engagement']
  }
];

const CHANNELS = [
  { key: 'email', label: 'Email', icon: '📧', description: 'Email marketing campaigns' },
  { key: 'sms', label: 'SMS', icon: '💬', description: 'Text message campaigns' },
  { key: 'push', label: 'Push Notifications', icon: '🔔', description: 'Mobile app notifications' },
  { key: 'social', label: 'Social Media', icon: '📱', description: 'Social platform campaigns' },
  { key: 'display', label: 'Display Ads', icon: '🖼️', description: 'Banner and display advertising' },
  { key: 'search', label: 'Search Ads', icon: '🔍', description: 'Search engine marketing' }
];

const AUDIENCE_SEGMENTS = [
  'New Visitors', 'Returning Customers', 'VIP Customers', 'Cart Abandoners',
  'High Value', 'At Risk', 'Win-back Targets', 'Engaged Users',
  'Mobile Users', 'Desktop Users', 'Email Subscribers', 'Social Followers'
];

const PRIMARY_OBJECTIVES = [
  { value: 'awareness', label: 'Brand Awareness' },
  { value: 'consideration', label: 'Consideration' },
  { value: 'conversion', label: 'Conversion' },
  { value: 'retention', label: 'Retention' },
  { value: 'advocacy', label: 'Advocacy' }
];

const KPIS = [
  'Click-through Rate', 'Conversion Rate', 'Return on Ad Spend (ROAS)',
  'Customer Acquisition Cost (CAC)', 'Lifetime Value (LTV)', 'Engagement Rate',
  'Open Rate', 'Unsubscribe Rate', 'Revenue', 'Profit Margin'
];

export const CampaignWizard: React.FC<CampaignWizardProps> = ({
  open,
  onClose,
  onSave,
  initialData
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<CampaignFormData>({
    name: '',
    type: '',
    goal: '',
    description: '',
    budget: {
      total: 10000,
      currency: 'USD',
      allocation: 'even'
    },
    timeline: {
      startDate: '',
      endDate: '',
      timezone: 'UTC'
    },
    audience: {
      segments: [],
      estimatedSize: 0,
      targeting: 'broad'
    },
    channels: {
      email: false,
      sms: false,
      push: false,
      social: false,
      display: false,
      search: false
    },
    objectives: {
      primary: '',
      secondary: [],
      kpis: []
    },
    ...initialData
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps = [
    { id: 'basic', title: 'Basic Information', icon: BoltIcon },
    { id: 'budget', title: 'Budget & Timeline', icon: CurrencyDollarIcon },
    { id: 'audience', title: 'Audience & Targeting', icon: UserGroupIcon },
    { id: 'channels', title: 'Channels & Distribution', icon: ChatBubbleLeftRightIcon },
    { id: 'objectives', title: 'Objectives & KPIs', icon: ChartBarIcon }
  ];

  const updateFormData = useCallback((field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  const updateNestedFormData = useCallback((parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof CampaignFormData],
        [field]: value
      }
    }));
  }, []);

  const validateStep = useCallback((step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 0: // Basic Information
        if (!formData.name.trim()) newErrors.name = 'Campaign name is required';
        if (!formData.type) newErrors.type = 'Campaign type is required';
        if (!formData.goal.trim()) newErrors.goal = 'Campaign goal is required';
        break;
      
      case 1: // Budget & Timeline
        if (formData.budget.total <= 0) newErrors.budget = 'Budget must be greater than 0';
        if (!formData.timeline.startDate) newErrors.startDate = 'Start date is required';
        if (!formData.timeline.endDate) newErrors.endDate = 'End date is required';
        if (new Date(formData.timeline.startDate) >= new Date(formData.timeline.endDate)) {
          newErrors.dateRange = 'End date must be after start date';
        }
        break;
      
      case 2: // Audience
        if (formData.audience.segments.length === 0) {
          newErrors.segments = 'At least one audience segment is required';
        }
        break;
      
      case 3: // Channels
        const selectedChannels = Object.values(formData.channels).filter(Boolean);
        if (selectedChannels.length === 0) {
          newErrors.channels = 'At least one channel must be selected';
        }
        break;
      
      case 4: // Objectives
        if (!formData.objectives.primary) newErrors.primary = 'Primary objective is required';
        if (formData.objectives.kpis.length === 0) newErrors.kpis = 'At least one KPI is required';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleNext = useCallback(() => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  }, [currentStep, validateStep, steps.length]);

  const handlePrevious = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  }, []);

  const handleSubmit = useCallback(() => {
    if (validateStep(currentStep)) {
      onSave(formData);
    }
  }, [currentStep, formData, onSave, validateStep]);

  const handleClose = useCallback(() => {
    setCurrentStep(0);
    setFormData({
      name: '',
      type: '',
      goal: '',
      description: '',
      budget: { total: 10000, currency: 'USD', allocation: 'even' },
      timeline: { startDate: '', endDate: '', timezone: 'UTC' },
      audience: { segments: [], estimatedSize: 0, targeting: 'broad' },
      channels: { email: false, sms: false, push: false, social: false, display: false, search: false },
      objectives: { primary: '', secondary: [], kpis: [] }
    });
    setErrors({});
    onClose();
  }, [onClose]);

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Basic Information
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Name *
              </label>
              <Input
                placeholder="Enter campaign name"
                value={formData.name}
                onChange={(e) => updateFormData('name', e.target.value)}
                error={errors.name}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Campaign Type *
              </label>
              <div className="grid grid-cols-1 gap-3">
                {CAMPAIGN_TYPES.map((type) => (
                  <Card
                    key={type.value}
                    className={`cursor-pointer transition-all duration-200 ${
                      formData.type === type.value
                        ? 'ring-2 ring-blue-500 bg-blue-50'
                        : 'hover:shadow-md hover:bg-gray-50'
                    }`}
                    onClick={() => updateFormData('type', type.value)}
                  >
                    <CardBody className="p-4">
                      <div className="flex items-start space-x-3">
                        <span className="text-2xl">{type.icon}</span>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{type.label}</h4>
                          <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {type.goals.map((goal) => (
                              <span
                                key={goal}
                                className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                              >
                                {goal}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
              {errors.type && <p className="text-red-600 text-sm mt-1">{errors.type}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Goal *
              </label>
              <TextArea
                placeholder="Describe the main goal of this campaign..."
                value={formData.goal}
                onChange={(e) => updateFormData('goal', e.target.value)}
                rows={3}
                error={errors.goal}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <TextArea
                placeholder="Additional details about the campaign..."
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                rows={2}
              />
            </div>
          </div>
        );

      case 1: // Budget & Timeline
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Budget *
                </label>
                <Input
                  type="number"
                  placeholder="10000"
                  value={formData.budget.total}
                  onChange={(e) => updateNestedFormData('budget', 'total', Number(e.target.value))}
                  error={errors.budget}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <Select
                  value={formData.budget.currency}
                  onChange={(e) => updateNestedFormData('budget', 'currency', e.target.value)}
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget Allocation Strategy
              </label>
              <Select
                value={formData.budget.allocation}
                onChange={(e) => updateNestedFormData('budget', 'allocation', e.target.value)}
              >
                <option value="even">Even Distribution</option>
                <option value="weighted">Weighted by Channel</option>
                <option value="performance">Performance-Based</option>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <Input
                  type="date"
                  value={formData.timeline.startDate}
                  onChange={(e) => updateNestedFormData('timeline', 'startDate', e.target.value)}
                  error={errors.startDate}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date *
                </label>
                <Input
                  type="date"
                  value={formData.timeline.endDate}
                  onChange={(e) => updateNestedFormData('timeline', 'endDate', e.target.value)}
                  error={errors.endDate}
                />
              </div>
            </div>

            {errors.dateRange && (
              <p className="text-red-600 text-sm">{errors.dateRange}</p>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timezone
              </label>
              <Select
                value={formData.timeline.timezone}
                onChange={(e) => updateNestedFormData('timeline', 'timezone', e.target.value)}
              >
                <option value="UTC">UTC - Coordinated Universal Time</option>
                <option value="America/New_York">EST - Eastern Time</option>
                <option value="America/Los_Angeles">PST - Pacific Time</option>
                <option value="Europe/London">GMT - Greenwich Mean Time</option>
              </Select>
            </div>
          </div>
        );

      case 2: // Audience & Targeting
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Targeting Strategy
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { value: 'broad', label: 'Broad Targeting', description: 'Reach a wide audience' },
                  { value: 'specific', label: 'Specific Segments', description: 'Target specific groups' },
                  { value: 'custom', label: 'Custom Audiences', description: 'Custom-built audiences' }
                ].map((option) => (
                  <Card
                    key={option.value}
                    className={`cursor-pointer transition-all duration-200 ${
                      formData.audience.targeting === option.value
                        ? 'ring-2 ring-blue-500 bg-blue-50'
                        : 'hover:shadow-md hover:bg-gray-50'
                    }`}
                    onClick={() => updateNestedFormData('audience', 'targeting', option.value)}
                  >
                    <CardBody className="p-4 text-center">
                      <h4 className="font-medium text-gray-900">{option.label}</h4>
                      <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Audience Segments *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {AUDIENCE_SEGMENTS.map((segment) => (
                  <label
                    key={segment}
                    className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={formData.audience.segments.includes(segment)}
                      onChange={(e) => {
                        const segments = e.target.checked
                          ? [...formData.audience.segments, segment]
                          : formData.audience.segments.filter(s => s !== segment);
                        updateNestedFormData('audience', 'segments', segments);
                      }}
                    />
                    <span className="text-sm text-gray-700">{segment}</span>
                  </label>
                ))}
              </div>
              {errors.segments && <p className="text-red-600 text-sm mt-1">{errors.segments}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Audience Size
              </label>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {formData.audience.segments.length > 0 
                    ? (formData.audience.segments.length * 25000).toLocaleString()
                    : '0'
                  }
                </div>
                <div className="text-sm text-blue-600">Estimated reach</div>
              </div>
            </div>
          </div>
        );

      case 3: // Channels & Distribution
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Channels *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {CHANNELS.map((channel) => (
                  <Card
                    key={channel.key}
                    className={`cursor-pointer transition-all duration-200 ${
                      formData.channels[channel.key as keyof typeof formData.channels]
                        ? 'ring-2 ring-blue-500 bg-blue-50'
                        : 'hover:shadow-md hover:bg-gray-50'
                    }`}
                    onClick={() => updateNestedFormData('channels', channel.key, 
                      !formData.channels[channel.key as keyof typeof formData.channels])}
                  >
                    <CardBody className="p-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{channel.icon}</span>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{channel.label}</h4>
                          <p className="text-sm text-gray-600">{channel.description}</p>
                        </div>
                        <div className="flex-shrink-0">
                          {formData.channels[channel.key as keyof typeof formData.channels] && (
                            <CheckIcon className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
              {errors.channels && <p className="text-red-600 text-sm mt-1">{errors.channels}</p>}
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Selected Channels</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(formData.channels)
                  .filter(([_, selected]) => selected)
                  .map(([key, _]) => {
                    const channel = CHANNELS.find(c => c.key === key);
                    return channel ? (
                      <span
                        key={key}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {channel.icon} {channel.label}
                      </span>
                    ) : null;
                  })}
              </div>
              {Object.values(formData.channels).filter(Boolean).length === 0 && (
                <p className="text-gray-500 text-sm">No channels selected</p>
              )}
            </div>
          </div>
        );

      case 4: // Objectives & KPIs
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Objective *
              </label>
              <Select
                value={formData.objectives.primary}
                onChange={(e) => updateNestedFormData('objectives', 'primary', e.target.value)}
                error={errors.primary}
              >
                <option value="">Select primary objective</option>
                {PRIMARY_OBJECTIVES.map((obj) => (
                  <option key={obj.value} value={obj.value}>{obj.label}</option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Key Performance Indicators (KPIs) *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {KPIS.map((kpi) => (
                  <label
                    key={kpi}
                    className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={formData.objectives.kpis.includes(kpi)}
                      onChange={(e) => {
                        const kpis = e.target.checked
                          ? [...formData.objectives.kpis, kpi]
                          : formData.objectives.kpis.filter(k => k !== kpi);
                        updateNestedFormData('objectives', 'kpis', kpis);
                      }}
                    />
                    <span className="text-sm text-gray-700">{kpi}</span>
                  </label>
                ))}
              </div>
              {errors.kpis && <p className="text-red-600 text-sm mt-1">{errors.kpis}</p>}
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">Campaign Summary</h4>
              <div className="space-y-1 text-sm text-green-800">
                <p><strong>Type:</strong> {CAMPAIGN_TYPES.find(t => t.value === formData.type)?.label}</p>
                <p><strong>Budget:</strong> {formData.budget.currency} {formData.budget.total.toLocaleString()}</p>
                <p><strong>Duration:</strong> {formData.timeline.startDate} to {formData.timeline.endDate}</p>
                <p><strong>Channels:</strong> {Object.entries(formData.channels).filter(([_, selected]) => selected).length}</p>
                <p><strong>Audience Segments:</strong> {formData.audience.segments.length}</p>
                <p><strong>KPIs:</strong> {formData.objectives.kpis.length}</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal open={open} onClose={handleClose} size="xl">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Create New Campaign</h2>
            <p className="text-gray-600">Step {currentStep + 1} of {steps.length}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClose} icon={XMarkIcon} />
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 ${
                      isCompleted
                        ? 'bg-green-600 text-white'
                        : isActive
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckIcon className="w-5 h-5" />
                    ) : (
                      <StepIcon className="w-4 h-4" />
                    )}
                  </div>
                  <div className={`ml-2 ${index < steps.length - 1 ? 'mr-4' : ''}`}>
                    <div className={`text-sm font-medium ${isActive ? 'text-blue-600' : 'text-gray-900'}`}>
                      {step.title}
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 ${isCompleted ? 'bg-green-600' : 'bg-gray-200'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="min-h-[400px]"
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>

        {/* Footer */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            icon={ChevronLeftIcon}
          >
            Previous
          </Button>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
            >
              Cancel
            </Button>
            
            {currentStep === steps.length - 1 ? (
              <Button
                variant="primary"
                onClick={handleSubmit}
                icon={CheckIcon}
              >
                Create Campaign
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handleNext}
                icon={ChevronRightIcon}
              >
                Next
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};