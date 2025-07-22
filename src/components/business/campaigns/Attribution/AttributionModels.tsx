// src/components/business/campaigns/Attribution/AttributionModels.tsx

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  CursorArrowRaysIcon,
  ArrowPathIcon,
  SparklesIcon,
  ClockIcon,
  UserGroupIcon,
  TrophyIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { Button } from '../../../ui/Button';
import { Card, CardHeader, CardBody } from '../../../ui/Card';
import { Select } from '../../../ui/Input';

interface TouchpointData {
  id: string;
  channel: 'email' | 'sms' | 'push' | 'social' | 'display' | 'search' | 'direct' | 'referral';
  campaign: string;
  moment: string;
  timestamp: string;
  position: number;
  value: number;
  cost: number;
  engagement: {
    impressions: number;
    clicks: number;
    conversions: number;
  };
}

interface ConversionData {
  id: string;
  customerId: string;
  value: number;
  timestamp: string;
  touchpoints: TouchpointData[];
  conversionPath: string[];
}

interface AttributionModel {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  algorithm: (touchpoints: TouchpointData[]) => Record<string, number>;
  color: string;
}

interface AttributionModelsProps {
  conversions: ConversionData[];
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  timeframe: '7d' | '30d' | '90d' | '1y';
  onTimeframeChange: (timeframe: '7d' | '30d' | '90d' | '1y') => void;
}

const ATTRIBUTION_MODELS: AttributionModel[] = [
  {
    id: 'first-touch',
    name: 'First Touch',
    description: 'All credit goes to the first touchpoint in the customer journey',
    icon: CursorArrowRaysIcon,
    color: 'bg-green-50 border-green-200 text-green-700',
    algorithm: (touchpoints) => {
      const result: Record<string, number> = {};
      if (touchpoints.length > 0) {
        const firstTouch = touchpoints[0];
        result[firstTouch.channel] = 100;
      }
      return result;
    }
  },
  {
    id: 'last-touch',
    name: 'Last Touch',
    description: 'All credit goes to the last touchpoint before conversion',
    icon: TrophyIcon,
    color: 'bg-blue-50 border-blue-200 text-blue-700',
    algorithm: (touchpoints) => {
      const result: Record<string, number> = {};
      if (touchpoints.length > 0) {
        const lastTouch = touchpoints[touchpoints.length - 1];
        result[lastTouch.channel] = 100;
      }
      return result;
    }
  },
  {
    id: 'linear',
    name: 'Linear',
    description: 'Credit is distributed equally across all touchpoints',
    icon: ChartBarIcon,
    color: 'bg-purple-50 border-purple-200 text-purple-700',
    algorithm: (touchpoints) => {
      const result: Record<string, number> = {};
      const creditPerTouch = touchpoints.length > 0 ? 100 / touchpoints.length : 0;
      
      touchpoints.forEach(touch => {
        result[touch.channel] = (result[touch.channel] || 0) + creditPerTouch;
      });
      return result;
    }
  },
  {
    id: 'time-decay',
    name: 'Time Decay',
    description: 'More recent touchpoints receive greater credit',
    icon: ClockIcon,
    color: 'bg-orange-50 border-orange-200 text-orange-700',
    algorithm: (touchpoints) => {
      const result: Record<string, number> = {};
      const decayRate = 0.7; // 30% decay per step back
      let totalWeight = 0;
      
      // Calculate weights (more recent = higher weight)
      const weights = touchpoints.map((_, index) => {
        const weight = Math.pow(decayRate, touchpoints.length - 1 - index);
        totalWeight += weight;
        return weight;
      });
      
      // Distribute credit based on weights
      touchpoints.forEach((touch, index) => {
        const credit = (weights[index] / totalWeight) * 100;
        result[touch.channel] = (result[touch.channel] || 0) + credit;
      });
      
      return result;
    }
  },
  {
    id: 'position-based',
    name: 'Position Based',
    description: '40% first, 40% last, 20% distributed among middle touchpoints',
    icon: UserGroupIcon,
    color: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    algorithm: (touchpoints) => {
      const result: Record<string, number> = {};
      
      if (touchpoints.length === 1) {
        result[touchpoints[0].channel] = 100;
      } else if (touchpoints.length === 2) {
        result[touchpoints[0].channel] = 50;
        result[touchpoints[1].channel] = 50;
      } else {
        // First touch gets 40%
        result[touchpoints[0].channel] = 40;
        
        // Last touch gets 40%
        const lastChannel = touchpoints[touchpoints.length - 1].channel;
        result[lastChannel] = (result[lastChannel] || 0) + 40;
        
        // Middle touches share 20%
        const middleTouches = touchpoints.slice(1, -1);
        const creditPerMiddle = middleTouches.length > 0 ? 20 / middleTouches.length : 0;
        
        middleTouches.forEach(touch => {
          result[touch.channel] = (result[touch.channel] || 0) + creditPerMiddle;
        });
      }
      
      return result;
    }
  },
  {
    id: 'data-driven',
    name: 'Data Driven',
    description: 'AI-powered attribution based on conversion probability',
    icon: SparklesIcon,
    color: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    algorithm: (touchpoints) => {
      const result: Record<string, number> = {};
      
      // Simulate data-driven attribution using engagement metrics
      let totalScore = 0;
      const scores = touchpoints.map(touch => {
        // Calculate score based on engagement metrics
        const ctr = touch.engagement.clicks / Math.max(touch.engagement.impressions, 1);
        const conversionRate = touch.engagement.conversions / Math.max(touch.engagement.clicks, 1);
        const score = (ctr * 100) + (conversionRate * 200) + (touch.value / 100);
        totalScore += score;
        return score;
      });
      
      // Distribute credit based on engagement scores
      touchpoints.forEach((touch, index) => {
        const credit = totalScore > 0 ? (scores[index] / totalScore) * 100 : 0;
        result[touch.channel] = (result[touch.channel] || 0) + credit;
      });
      
      return result;
    }
  }
];

const MOCK_CONVERSIONS: ConversionData[] = [
  {
    id: 'conv_1',
    customerId: 'cust_123',
    value: 150.00,
    timestamp: '2025-07-21T10:30:00Z',
    conversionPath: ['social', 'email', 'direct'],
    touchpoints: [
      {
        id: 'tp_1',
        channel: 'social',
        campaign: 'Summer Sale',
        moment: 'Social Ad',
        timestamp: '2025-07-18T14:20:00Z',
        position: 1,
        value: 50.00,
        cost: 5.00,
        engagement: { impressions: 1000, clicks: 50, conversions: 2 }
      },
      {
        id: 'tp_2',
        channel: 'email',
        campaign: 'Follow-up Series',
        moment: 'Product Reminder',
        timestamp: '2025-07-20T09:15:00Z',
        position: 2,
        value: 75.00,
        cost: 2.00,
        engagement: { impressions: 500, clicks: 75, conversions: 8 }
      },
      {
        id: 'tp_3',
        channel: 'direct',
        campaign: 'Direct Visit',
        moment: 'Website Visit',
        timestamp: '2025-07-21T10:30:00Z',
        position: 3,
        value: 150.00,
        cost: 0.00,
        engagement: { impressions: 1, clicks: 1, conversions: 1 }
      }
    ]
  },
  {
    id: 'conv_2',
    customerId: 'cust_456',
    value: 299.99,
    timestamp: '2025-07-21T15:45:00Z',
    conversionPath: ['search', 'display', 'email', 'direct'],
    touchpoints: [
      {
        id: 'tp_4',
        channel: 'search',
        campaign: 'Brand Keywords',
        moment: 'Search Ad',
        timestamp: '2025-07-15T11:00:00Z',
        position: 1,
        value: 75.00,
        cost: 8.00,
        engagement: { impressions: 2000, clicks: 100, conversions: 5 }
      },
      {
        id: 'tp_5',
        channel: 'display',
        campaign: 'Retargeting',
        moment: 'Banner Ad',
        timestamp: '2025-07-17T16:30:00Z',
        position: 2,
        value: 100.00,
        cost: 3.50,
        engagement: { impressions: 5000, clicks: 150, conversions: 12 }
      },
      {
        id: 'tp_6',
        channel: 'email',
        campaign: 'Newsletter',
        moment: 'Weekly Update',
        timestamp: '2025-07-19T08:00:00Z',
        position: 3,
        value: 149.99,
        cost: 1.00,
        engagement: { impressions: 1000, clicks: 200, conversions: 25 }
      },
      {
        id: 'tp_7',
        channel: 'direct',
        campaign: 'Direct Visit',
        moment: 'Website Visit',
        timestamp: '2025-07-21T15:45:00Z',
        position: 4,
        value: 299.99,
        cost: 0.00,
        engagement: { impressions: 1, clicks: 1, conversions: 1 }
      }
    ]
  }
];

export const AttributionModels: React.FC<AttributionModelsProps> = ({
  conversions = MOCK_CONVERSIONS,
  selectedModel,
  onModelChange,
  timeframe,
  onTimeframeChange
}) => {
  const [showComparison, setShowComparison] = useState(false);

  // Calculate attribution results for all models
  const attributionResults = useMemo(() => {
    const results: Record<string, Record<string, number>> = {};
    
    ATTRIBUTION_MODELS.forEach(model => {
      results[model.id] = {};
      
      conversions.forEach(conversion => {
        const channelCredits = model.algorithm(conversion.touchpoints);
        
        Object.entries(channelCredits).forEach(([channel, credit]) => {
          if (!results[model.id][channel]) {
            results[model.id][channel] = 0;
          }
          // Apply credit as percentage of conversion value
          results[model.id][channel] += (credit / 100) * conversion.value;
        });
      });
    });
    
    return results;
  }, [conversions]);

  // Get selected model results
  const selectedResults = attributionResults[selectedModel] || {};
  const totalValue = Object.values(selectedResults).reduce((sum, value) => sum + value, 0);

  // Channel colors for consistency
  const getChannelColor = (channel: string) => {
    const colors: Record<string, string> = {
      email: '#3b82f6',      // blue
      social: '#10b981',     // green
      search: '#f59e0b',     // yellow
      display: '#ef4444',    // red
      sms: '#8b5cf6',        // purple
      push: '#06b6d4',       // cyan
      direct: '#6b7280',     // gray
      referral: '#f97316'    // orange
    };
    return colors[channel] || '#6b7280';
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Get percentage for channel
  const getChannelPercentage = (value: number) => {
    return totalValue > 0 ? (value / totalValue) * 100 : 0;
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Attribution Analysis</h2>
          <p className="text-gray-600">Understand how different channels contribute to conversions</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select
            value={timeframe}
            onChange={(e) => onTimeframeChange(e.target.value as any)}
            className="w-32"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </Select>
          
          <Button
            variant={showComparison ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setShowComparison(!showComparison)}
            icon={ArrowPathIcon}
          >
            Compare Models
          </Button>
        </div>
      </div>

      {/* Attribution Model Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ATTRIBUTION_MODELS.map((model) => {
          const ModelIcon = model.icon;
          const isSelected = selectedModel === model.id;
          
          return (
            <motion.div
              key={model.id}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className={`
                  cursor-pointer transition-all duration-200 border-2
                  ${isSelected 
                    ? `${model.color} ring-2 ring-blue-500 shadow-lg` 
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }
                `}
                onClick={() => onModelChange(model.id)}
              >
                <CardBody className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-white bg-opacity-70' : 'bg-gray-100'}`}>
                      <ModelIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{model.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{model.description}</p>
                      
                      {isSelected && (
                        <div className="mt-3 pt-3 border-t border-current border-opacity-20">
                          <div className="text-sm font-medium">
                            Total Attributed: {formatCurrency(totalValue)}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            Across {conversions.length} conversions
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Attribution Results */}
      {selectedModel && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Channel Attribution Chart */}
          <Card>
            <CardHeader className="p-4 border-b border-gray-200">
              <h3 className="font-medium text-gray-900">Channel Attribution</h3>
              <p className="text-sm text-gray-600">
                Revenue attribution by {ATTRIBUTION_MODELS.find(m => m.id === selectedModel)?.name}
              </p>
            </CardHeader>
            <CardBody className="p-4">
              <div className="space-y-4">
                {Object.entries(selectedResults)
                  .sort(([, a], [, b]) => b - a)
                  .map(([channel, value]) => {
                    const percentage = getChannelPercentage(value);
                    
                    return (
                      <div key={channel} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: getChannelColor(channel) }}
                            />
                            <span className="font-medium text-gray-900 capitalize">
                              {channel}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-gray-900">
                              {formatCurrency(value)}
                            </div>
                            <div className="text-sm text-gray-600">
                              {percentage.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                        
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <motion.div
                            className="h-2 rounded-full"
                            style={{ backgroundColor: getChannelColor(channel) }}
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardBody>
          </Card>

          {/* Attribution Insights */}
          <Card>
            <CardHeader className="p-4 border-b border-gray-200">
              <h3 className="font-medium text-gray-900">Attribution Insights</h3>
              <p className="text-sm text-gray-600">Key findings and recommendations</p>
            </CardHeader>
            <CardBody className="p-4">
              <div className="space-y-4">
                {/* Top performing channel */}
                {Object.entries(selectedResults).length > 0 && (
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-green-700 mb-2">
                      <TrophyIcon className="w-4 h-4" />
                      <span className="font-medium">Top Performer</span>
                    </div>
                    <div className="text-sm text-green-800">
                      {Object.entries(selectedResults)
                        .sort(([, a], [, b]) => b - a)[0]?.[0]?.toUpperCase()} 
                      generates the highest attributed revenue with{' '}
                      {formatCurrency(Math.max(...Object.values(selectedResults)))}
                    </div>
                  </div>
                )}

                {/* Optimization opportunities */}
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-blue-700 mb-2">
                    <SparklesIcon className="w-4 h-4" />
                    <span className="font-medium">Optimization Opportunity</span>
                  </div>
                  <div className="text-sm text-blue-800">
                    Consider increasing investment in top-performing channels
                    and testing multi-touch sequences for better attribution.
                  </div>
                </div>

                {/* Journey insights */}
                <div className="bg-purple-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-purple-700 mb-2">
                    <InformationCircleIcon className="w-4 h-4" />
                    <span className="font-medium">Journey Insights</span>
                  </div>
                  <div className="text-sm text-purple-800">
                    Average customer journey length:{' '}
                    {(conversions.reduce((sum, conv) => sum + conv.touchpoints.length, 0) / conversions.length).toFixed(1)} touchpoints
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Model Comparison */}
      {showComparison && (
        <Card>
          <CardHeader className="p-4 border-b border-gray-200">
            <h3 className="font-medium text-gray-900">Attribution Model Comparison</h3>
            <p className="text-sm text-gray-600">
              Compare how different models attribute revenue across channels
            </p>
          </CardHeader>
          <CardBody className="p-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 font-medium text-gray-900">Channel</th>
                    {ATTRIBUTION_MODELS.map(model => (
                      <th key={model.id} className="text-right py-2 font-medium text-gray-900">
                        {model.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from(new Set(
                    Object.values(attributionResults)
                      .flatMap(result => Object.keys(result))
                  )).map(channel => (
                    <tr key={channel} className="border-b border-gray-100">
                      <td className="py-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: getChannelColor(channel) }}
                          />
                          <span className="capitalize">{channel}</span>
                        </div>
                      </td>
                      {ATTRIBUTION_MODELS.map(model => {
                        const value = attributionResults[model.id]?.[channel] || 0;
                        return (
                          <td key={model.id} className="py-2 text-right">
                            {formatCurrency(value)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  <tr className="border-t-2 border-gray-300 font-medium">
                    <td className="py-2">Total</td>
                    {ATTRIBUTION_MODELS.map(model => {
                      const total = Object.values(attributionResults[model.id] || {})
                        .reduce((sum, value) => sum + value, 0);
                      return (
                        <td key={model.id} className="py-2 text-right">
                          {formatCurrency(total)}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
};