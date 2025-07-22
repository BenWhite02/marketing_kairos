// src/components/business/campaigns/CampaignBuilder/CampaignConfig.tsx

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  XMarkIcon,
  Cog6ToothIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  SaveIcon,
  PlayIcon,
  PauseIcon,
  StopIcon
} from '@heroicons/react/24/outline';
import { Button } from '../../../ui/Button';
import { Card, CardHeader, CardBody } from '../../../ui/Card';
import { Input, Select, TextArea } from '../../../ui/Input';
import { Modal } from '../../../ui/Modal';

interface Campaign {
  id: string;
  name: string;
  type: 'acquisition' | 'retention' | 'conversion' | 'engagement' | 'winback';
  status: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
  goal: string;
  budget: {
    total: number;
    spent: number;
    remaining: number;
    currency: string;
  };
  timeline: {
    startDate: string;
    endDate: string;
    duration: number;
    progress: number;
  };
  audience: {
    size: number;
    segments: string[];
  };
  channels: string[];
  moments: number;
  performance: {
    reach: number;
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
    roas: number;
    ctr: number;
    conversionRate: number;
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

interface CampaignConfigProps {
  open: boolean;
  campaign: Campaign;
  onClose: () => void;
  onSave: (updates: Partial<Campaign>) => void;
}

const CAMPAIGN_TYPES = [
  { value: 'acquisition', label: 'Customer Acquisition', icon: '🎯' },
  { value: 'retention', label: 'Customer Retention', icon: '💝' },
  { value: 'conversion', label: 'Conversion Optimization', icon: '⚡' },
  { value: 'engagement', label: 'Engagement Building', icon: '🔥' },
  { value: 'winback', label: 'Win-back Campaign', icon: '🎪' }
];

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft', color: 'gray' },
  { value: 'active', label: 'Active', color: 'green' },
  { value: 'paused', label: 'Paused', color: 'yellow' },
  { value: 'completed', label: 'Completed', color: 'blue' },
  { value: 'archived', label: 'Archived', color: 'red' }
];

export const CampaignConfig: React.FC<CampaignConfigProps> = ({
  open,
  campaign,
  onClose,
  onSave
}) => {
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState({
    name: campaign.name,
    type: campaign.type,
    status: campaign.status,
    goal: campaign.goal,
    budget: { ...campaign.budget },
    timeline: { ...campaign.timeline }
  });
  const [hasChanges, setHasChanges] = useState(false);

  const tabs = [
    { id: 'general', label: 'General', icon: Cog6ToothIcon },
    { id: 'budget', label: 'Budget', icon: CurrencyDollarIcon },
    { id: 'timeline', label: 'Timeline', icon: CalendarIcon },
    { id: 'audience', label: 'Audience', icon: UserGroupIcon },
    { id: 'channels', label: 'Channels', icon: ChatBubbleLeftRightIcon },
    { id: 'performance', label: 'Performance', icon: ChartBarIcon }
  ];

  const updateFormData = useCallback((field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  }, []);

  const updateNestedFormData = useCallback((parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof typeof formData],
        [field]: value
      }
    }));
    setHasChanges(true);
  }, []);

  const handleSave = useCallback(() => {
    onSave(formData);
    setHasChanges(false);
  }, [formData, onSave]);

  const handleStatusChange = useCallback((status: Campaign['status']) => {
    updateFormData('status', status);
    // Auto-save status changes for immediate effect
    onSave({ status });
  }, [onSave, updateFormData]);

  const getStatusColor = (status: Campaign['status']) => {
    const statusConfig = STATUS_OPTIONS.find(s => s.value === status);
    return statusConfig ? statusConfig.color : 'gray';
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Name
              </label>
              <Input
                value={formData.name}
                onChange={(e) => updateFormData('name', e.target.value)}
                placeholder="Campaign name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Type
              </label>
              <Select
                value={formData.type}
                onChange={(e) => updateFormData('type', e.target.value)}
              >
                {CAMPAIGN_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Goal
              </label>
              <TextArea
                value={formData.goal}
                onChange={(e) => updateFormData('goal', e.target.value)}
                rows={3}
                placeholder="Describe the campaign goal..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Campaign Status
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {STATUS_OPTIONS.map((status) => (
                  <Card
                    key={status.value}
                    className={`cursor-pointer transition-all duration-200 ${
                      formData.status === status.value
                        ? 'ring-2 ring-blue-500 bg-blue-50'
                        : 'hover:shadow-md hover:bg-gray-50'
                    }`}
                    onClick={() => handleStatusChange(status.value as Campaign['status'])}
                  >
                    <CardBody className="p-3 text-center">
                      <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${
                        status.color === 'green' ? 'bg-green-500' :
                        status.color === 'yellow' ? 'bg-yellow-500' :
                        status.color === 'blue' ? 'bg-blue-500' :
                        status.color === 'red' ? 'bg-red-500' : 'bg-gray-500'
                      }`} />
                      <div className="text-sm font-medium text-gray-900">{status.label}</div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Campaign Overview</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Created:</span>
                  <div className="font-medium">{new Date(campaign.createdAt).toLocaleDateString()}</div>
                </div>
                <div>
                  <span className="text-gray-600">Last Updated:</span>
                  <div className="font-medium">{new Date(campaign.updatedAt).toLocaleDateString()}</div>
                </div>
                <div>
                  <span className="text-gray-600">Created By:</span>
                  <div className="font-medium">{campaign.createdBy}</div>
                </div>
                <div>
                  <span className="text-gray-600">Campaign ID:</span>
                  <div className="font-medium text-xs">{campaign.id}</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'budget':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Budget
                </label>
                <Input
                  type="number"
                  value={formData.budget.total}
                  onChange={(e) => updateNestedFormData('budget', 'total', Number(e.target.value))}
                  placeholder="Total budget"
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardBody className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(campaign.budget.total, campaign.budget.currency)}
                  </div>
                  <div className="text-sm text-gray-600">Total Budget</div>
                </CardBody>
              </Card>

              <Card>
                <CardBody className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {formatCurrency(campaign.budget.spent, campaign.budget.currency)}
                  </div>
                  <div className="text-sm text-gray-600">Amount Spent</div>
                </CardBody>
              </Card>

              <Card>
                <CardBody className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(campaign.budget.remaining, campaign.budget.currency)}
                  </div>
                  <div className="text-sm text-gray-600">Remaining</div>
                </CardBody>
              </Card>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget Utilization
              </label>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-blue-600 h-4 rounded-full transition-all duration-300 flex items-center justify-end pr-2"
                  style={{ width: `${Math.min((campaign.budget.spent / campaign.budget.total) * 100, 100)}%` }}
                >
                  <span className="text-white text-xs font-medium">
                    {((campaign.budget.spent / campaign.budget.total) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4">
              <h4 className="font-medium text-yellow-900 mb-2">Budget Alerts</h4>
              <div className="space-y-2 text-sm text-yellow-800">
                {campaign.budget.spent / campaign.budget.total > 0.8 && (
                  <p>⚠️ Budget is 80% utilized</p>
                )}
                {campaign.budget.spent / campaign.budget.total > 0.9 && (
                  <p>🚨 Budget is 90% utilized - consider adjusting spend</p>
                )}
                {campaign.budget.remaining < 1000 && (
                  <p>💰 Less than $1,000 remaining in budget</p>
                )}
              </div>
            </div>
          </div>
        );

      case 'timeline':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <Input
                  type="date"
                  value={formData.timeline.startDate}
                  onChange={(e) => updateNestedFormData('timeline', 'startDate', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <Input
                  type="date"
                  value={formData.timeline.endDate}
                  onChange={(e) => updateNestedFormData('timeline', 'endDate', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Progress
              </label>
              <div className="w-full bg-gray-200 rounded-full h-6">
                <div
                  className="bg-green-600 h-6 rounded-full transition-all duration-300 flex items-center justify-center"
                  style={{ width: `${campaign.timeline.progress}%` }}
                >
                  <span className="text-white text-sm font-medium">
                    {campaign.timeline.progress}%
                  </span>
                </div>
              </div>
              <div className="flex justify-between text-sm text-gray-600 mt-1">
                <span>{new Date(campaign.timeline.startDate).toLocaleDateString()}</span>
                <span>{new Date(campaign.timeline.endDate).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardBody className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {campaign.timeline.duration}
                  </div>
                  <div className="text-sm text-gray-600">Total Days</div>
                </CardBody>
              </Card>

              <Card>
                <CardBody className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round(campaign.timeline.duration * (campaign.timeline.progress / 100))}
                  </div>
                  <div className="text-sm text-gray-600">Days Elapsed</div>
                </CardBody>
              </Card>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Timeline Status</h4>
              <div className="space-y-2 text-sm text-blue-800">
                <p>📅 Campaign started {new Date(campaign.timeline.startDate).toLocaleDateString()}</p>
                <p>🎯 Campaign ends {new Date(campaign.timeline.endDate).toLocaleDateString()}</p>
                <p>📊 {campaign.timeline.progress}% of timeline completed</p>
                <p>⏱️ {Math.round(campaign.timeline.duration * ((100 - campaign.timeline.progress) / 100))} days remaining</p>
              </div>
            </div>
          </div>
        );

      case 'audience':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardBody className="p-4 text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {campaign.audience.size.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Total Audience Size</div>
                </CardBody>
              </Card>

              <Card>
                <CardBody className="p-4 text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {campaign.performance.reach.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Actual Reach</div>
                </CardBody>
              </Card>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Audience Segments
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {campaign.audience.segments.map((segment, index) => (
                  <Card key={index}>
                    <CardBody className="p-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">{segment}</span>
                        <span className="text-sm text-gray-600">
                          {Math.round(campaign.audience.size / campaign.audience.segments.length).toLocaleString()}
                        </span>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reach Effectiveness
              </label>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-purple-600 h-4 rounded-full transition-all duration-300 flex items-center justify-end pr-2"
                  style={{ width: `${Math.min((campaign.performance.reach / campaign.audience.size) * 100, 100)}%` }}
                >
                  <span className="text-white text-xs font-medium">
                    {((campaign.performance.reach / campaign.audience.size) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="flex justify-between text-sm text-gray-600 mt-1">
                <span>0</span>
                <span>{campaign.audience.size.toLocaleString()} (Target Size)</span>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <h4 className="font-medium text-purple-900 mb-2">Audience Insights</h4>
              <div className="space-y-2 text-sm text-purple-800">
                <p>👥 {campaign.audience.segments.length} audience segments targeted</p>
                <p>📈 {((campaign.performance.reach / campaign.audience.size) * 100).toFixed(1)}% reach rate achieved</p>
                <p>🎯 Average segment size: {Math.round(campaign.audience.size / campaign.audience.segments.length).toLocaleString()}</p>
              </div>
            </div>
          </div>
        );

      case 'channels':
        return (
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Active Channels</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {campaign.channels.map((channel) => (
                  <Card key={channel}>
                    <CardBody className="p-4 text-center">
                      <div className="text-2xl mb-2">
                        {channel === 'email' ? '📧' :
                         channel === 'sms' ? '💬' :
                         channel === 'social' ? '📱' :
                         channel === 'display' ? '🖼️' :
                         channel === 'search' ? '🔍' : '📢'}
                      </div>
                      <div className="text-sm font-medium text-gray-900 capitalize">{channel}</div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Channel Performance</h4>
              <div className="space-y-3">
                {campaign.channels.map((channel) => {
                  // Mock channel-specific performance data
                  const channelPerformance = {
                    impressions: Math.round(campaign.performance.impressions / campaign.channels.length),
                    clicks: Math.round(campaign.performance.clicks / campaign.channels.length),
                    conversions: Math.round(campaign.performance.conversions / campaign.channels.length),
                    ctr: campaign.performance.ctr + (Math.random() * 2 - 1), // Slight variation
                  };

                  return (
                    <Card key={channel}>
                      <CardBody className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-medium text-gray-900 capitalize">{channel}</h5>
                          <span className="text-sm text-gray-600">
                            CTR: {channelPerformance.ctr.toFixed(1)}%
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="text-gray-600">Impressions</div>
                            <div className="font-semibold">{channelPerformance.impressions.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-gray-600">Clicks</div>
                            <div className="font-semibold">{channelPerformance.clicks.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-gray-600">Conversions</div>
                            <div className="font-semibold">{channelPerformance.conversions.toLocaleString()}</div>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  );
                })}
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">Channel Strategy</h4>
              <div className="space-y-2 text-sm text-green-800">
                <p>📊 {campaign.channels.length} channels active</p>
                <p>🎯 Multi-channel approach for maximum reach</p>
                <p>📈 Cross-channel attribution tracking enabled</p>
                <p>⚡ Real-time optimization across all channels</p>
              </div>
            </div>
          </div>
        );

      case 'performance':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardBody className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {campaign.performance.impressions.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Impressions</div>
                </CardBody>
              </Card>

              <Card>
                <CardBody className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {campaign.performance.clicks.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Clicks</div>
                </CardBody>
              </Card>

              <Card>
                <CardBody className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {campaign.performance.conversions.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Conversions</div>
                </CardBody>
              </Card>

              <Card>
                <CardBody className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {formatCurrency(campaign.performance.revenue)}
                  </div>
                  <div className="text-sm text-gray-600">Revenue</div>
                </CardBody>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardBody className="p-4 text-center">
                  <div className="text-3xl font-bold text-red-600">
                    {campaign.performance.ctr.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Click-through Rate</div>
                </CardBody>
              </Card>

              <Card>
                <CardBody className="p-4 text-center">
                  <div className="text-3xl font-bold text-yellow-600">
                    {campaign.performance.conversionRate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Conversion Rate</div>
                </CardBody>
              </Card>

              <Card>
                <CardBody className="p-4 text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {campaign.performance.roas.toFixed(1)}x
                  </div>
                  <div className="text-sm text-gray-600">Return on Ad Spend</div>
                </CardBody>
              </Card>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Performance Trends</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-center text-gray-600">
                  📈 Chart visualization would be implemented here<br/>
                  Integration with charting library (Chart.js, Recharts, etc.)
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">Performance Summary</h4>
              <div className="space-y-2 text-sm text-green-800">
                <p>🎯 Campaign is performing above industry average</p>
                <p>📈 ROAS of {campaign.performance.roas.toFixed(1)}x exceeds target</p>
                <p>💰 Generated {formatCurrency(campaign.performance.revenue)} in revenue</p>
                <p>🔄 {campaign.performance.conversions.toLocaleString()} conversions achieved</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal open={open} onClose={onClose} size="xl">
      <div className="flex h-[600px]">
        {/* Sidebar Navigation */}
        <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Campaign Settings</h2>
            <p className="text-sm text-gray-600">{campaign.name}</p>
          </div>

          <nav className="space-y-1">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <TabIcon className="w-5 h-5 mr-3" />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Quick Actions */}
          <div className="mt-8 space-y-2">
            <h4 className="text-xs font-medium text-gray-900 uppercase tracking-wide">
              Quick Actions
            </h4>
            
            {campaign.status === 'active' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusChange('paused')}
                icon={PauseIcon}
                className="w-full justify-start"
              >
                Pause Campaign
              </Button>
            )}
            
            {campaign.status === 'paused' && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleStatusChange('active')}
                icon={PlayIcon}
                className="w-full justify-start"
              >
                Resume Campaign
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStatusChange('completed')}
              icon={StopIcon}
              className="w-full justify-start"
            >
              Complete Campaign
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {tabs.find(t => t.id === activeTab)?.label}
              </h3>
              <p className="text-sm text-gray-600">
                Configure {tabs.find(t => t.id === activeTab)?.label.toLowerCase()} settings
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {hasChanges && (
                <div className="text-sm text-yellow-600">
                  Unsaved changes
                </div>
              )}
              <Button variant="ghost" size="sm" onClick={onClose} icon={XMarkIcon} />
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {renderTabContent()}
            </motion.div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-600">
              Last updated: {new Date(campaign.updatedAt).toLocaleString()}
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={!hasChanges}
                icon={SaveIcon}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};