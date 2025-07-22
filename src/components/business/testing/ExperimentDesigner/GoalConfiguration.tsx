// src/components/business/testing/ExperimentDesigner/GoalConfiguration.tsx

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  HeartIcon,
  ClockIcon,
  PlusIcon,
  TrashIcon,
  StarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  TrophyIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import { Button } from '../../../ui/Button';
import { Card, CardHeader, CardBody, CardFooter } from '../../../ui/Card';
import { Input, Select } from '../../../ui/Input';
import type { GoalConfig } from './ExperimentBuilder';

interface GoalConfigurationProps {
  goals: GoalConfig[];
  onChange: (goals: GoalConfig[]) => void;
  readOnly?: boolean;
  error?: string;
}

const GOAL_TYPES = [
  {
    id: 'conversion',
    name: 'Conversion',
    description: 'Track conversion events and rates',
    icon: TrophyIcon,
    color: 'bg-green-100 text-green-800 border-green-200',
    metrics: [
      { id: 'conversion_rate', name: 'Conversion Rate', unit: '%', description: 'Percentage of users who convert' },
      { id: 'conversions', name: 'Total Conversions', unit: 'count', description: 'Total number of conversions' },
      { id: 'conversion_value', name: 'Conversion Value', unit: 'currency', description: 'Total value of conversions' },
      { id: 'cost_per_conversion', name: 'Cost Per Conversion', unit: 'currency', description: 'Average cost to acquire conversion' }
    ]
  },
  {
    id: 'revenue',
    name: 'Revenue',
    description: 'Track revenue and financial metrics',
    icon: CurrencyDollarIcon,
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    metrics: [
      { id: 'revenue', name: 'Total Revenue', unit: 'currency', description: 'Total revenue generated' },
      { id: 'revenue_per_user', name: 'Revenue Per User', unit: 'currency', description: 'Average revenue per user' },
      { id: 'average_order_value', name: 'Average Order Value', unit: 'currency', description: 'Average value per order' },
      { id: 'roas', name: 'Return on Ad Spend', unit: 'ratio', description: 'Revenue divided by ad spend' }
    ]
  },
  {
    id: 'engagement',
    name: 'Engagement',
    description: 'Track user engagement and interaction',
    icon: HeartIcon,
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    metrics: [
      { id: 'click_through_rate', name: 'Click-Through Rate', unit: '%', description: 'Percentage of users who click' },
      { id: 'open_rate', name: 'Open Rate', unit: '%', description: 'Percentage of emails opened' },
      { id: 'engagement_rate', name: 'Engagement Rate', unit: '%', description: 'Overall engagement percentage' },
      { id: 'time_on_page', name: 'Time on Page', unit: 'seconds', description: 'Average time spent on page' }
    ]
  },
  {
    id: 'retention',
    name: 'Retention',
    description: 'Track user retention and loyalty',
    icon: ClockIcon,
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    metrics: [
      { id: 'retention_rate', name: 'Retention Rate', unit: '%', description: 'Percentage of users who return' },
      { id: 'repeat_purchase_rate', name: 'Repeat Purchase Rate', unit: '%', description: 'Percentage who purchase again' },
      { id: 'customer_lifetime_value', name: 'Customer Lifetime Value', unit: 'currency', description: 'Total value per customer' },
      { id: 'churn_rate', name: 'Churn Rate', unit: '%', description: 'Percentage of users who leave' }
    ]
  }
];

const getGoalTypeConfig = (type: string) => {
  return GOAL_TYPES.find(gt => gt.id === type) || GOAL_TYPES[0];
};

export const GoalConfiguration: React.FC<GoalConfigurationProps> = ({
  goals,
  onChange,
  readOnly = false,
  error
}) => {
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);

  const handleAddGoal = useCallback(() => {
    if (readOnly) return;
    
    const newGoal: GoalConfig = {
      id: `goal_${Date.now()}`,
      name: '',
      type: 'conversion',
      metric: 'conversion_rate',
      isPrimary: goals.length === 0, // First goal is primary by default
      weight: 100
    };
    onChange([...goals, newGoal]);
  }, [goals, onChange, readOnly]);

  const handleUpdateGoal = useCallback((goalId: string, updates: Partial<GoalConfig>) => {
    if (readOnly) return;
    
    const updatedGoals = goals.map(goal => 
      goal.id === goalId ? { ...goal, ...updates } : goal
    );
    
    // Ensure only one primary goal
    if (updates.isPrimary) {
      updatedGoals.forEach(goal => {
        if (goal.id !== goalId) {
          goal.isPrimary = false;
        }
      });
    }
    
    onChange(updatedGoals);
  }, [goals, onChange, readOnly]);

  const handleRemoveGoal = useCallback((goalId: string) => {
    if (readOnly) return;
    
    const updatedGoals = goals.filter(goal => goal.id !== goalId);
    
    // If we removed the primary goal, make the first remaining goal primary
    if (updatedGoals.length > 0 && !updatedGoals.some(g => g.isPrimary)) {
      updatedGoals[0].isPrimary = true;
    }
    
    onChange(updatedGoals);
  }, [goals, onChange, readOnly]);

  const handleSetPrimary = useCallback((goalId: string) => {
    if (readOnly) return;
    
    const updatedGoals = goals.map(goal => ({
      ...goal,
      isPrimary: goal.id === goalId
    }));
    onChange(updatedGoals);
  }, [goals, onChange, readOnly]);

  const totalWeight = goals.reduce((sum, goal) => sum + goal.weight, 0);
  const hasPrimaryGoal = goals.some(goal => goal.isPrimary);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            Success Goals ({goals.length})
          </h3>
          <p className="text-sm text-gray-500">
            Define what success looks like for this experiment
          </p>
        </div>
        <Button
          variant="primary"
          onClick={handleAddGoal}
          leftIcon={PlusIcon}
          disabled={readOnly}
        >
          Add Goal
        </Button>
      </div>

      {/* Goal Type Overview */}
      <Card>
        <CardHeader>
          <h4 className="text-md font-medium text-gray-900">Available Goal Types</h4>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {GOAL_TYPES.map((goalType) => {
              const Icon = goalType.icon;
              const isUsed = goals.some(g => g.type === goalType.id);
              
              return (
                <div
                  key={goalType.id}
                  className={`p-4 border-2 rounded-lg ${goalType.color} ${
                    isUsed ? 'opacity-100' : 'opacity-60'
                  }`}
                >
                  <div className="flex items-center mb-2">
                    <Icon className="h-5 w-5 mr-2" />
                    <span className="font-medium">{goalType.name}</span>
                    {isUsed && (
                      <CheckCircleIcon className="h-4 w-4 ml-auto" />
                    )}
                  </div>
                  <p className="text-xs">{goalType.description}</p>
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>

      {/* Goals List */}
      <div className="space-y-4">
        <AnimatePresence>
          {goals.map((goal, index) => {
            const goalType = getGoalTypeConfig(goal.type);
            const Icon = goalType.icon;
            const isExpanded = expandedGoal === goal.id;
            const selectedMetric = goalType.metrics.find(m => m.id === goal.metric);

            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className={`border-2 ${goalType.color}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Icon className="h-5 w-5 mr-3" />
                        <div>
                          <div className="flex items-center">
                            <h4 className="font-medium text-gray-900">
                              {goal.name || `Goal ${index + 1}`}
                            </h4>
                            {goal.isPrimary && (
                              <div className="ml-2 flex items-center">
                                <StarIcon className="h-4 w-4 text-yellow-500 mr-1" />
                                <span className="text-xs font-medium text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full">
                                  PRIMARY
                                </span>
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            {goalType.name} • {selectedMetric?.name}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-600">
                          Weight: {goal.weight}%
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedGoal(isExpanded ? null : goal.id)}
                          disabled={readOnly}
                        >
                          {isExpanded ? '−' : '+'}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <CardBody>
                          <div className="space-y-4">
                            {/* Goal Basic Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <Input
                                label="Goal Name"
                                value={goal.name}
                                onChange={(e) => handleUpdateGoal(goal.id, { name: e.target.value })}
                                placeholder="Enter goal name..."
                                disabled={readOnly}
                              />
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Goal Type
                                </label>
                                <Select
                                  value={goal.type}
                                  onChange={(e) => handleUpdateGoal(goal.id, { 
                                    type: e.target.value as any,
                                    metric: GOAL_TYPES.find(gt => gt.id === e.target.value)?.metrics[0]?.id || ''
                                  })}
                                  disabled={readOnly}
                                >
                                  {GOAL_TYPES.map(gt => (
                                    <option key={gt.id} value={gt.id}>
                                      {gt.name}
                                    </option>
                                  ))}
                                </Select>
                              </div>
                            </div>

                            {/* Metric Selection */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Metric
                                </label>
                                <Select
                                  value={goal.metric}
                                  onChange={(e) => handleUpdateGoal(goal.id, { metric: e.target.value })}
                                  disabled={readOnly}
                                >
                                  {goalType.metrics.map(metric => (
                                    <option key={metric.id} value={metric.id}>
                                      {metric.name}
                                    </option>
                                  ))}
                                </Select>
                                {selectedMetric && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    {selectedMetric.description}
                                  </p>
                                )}
                              </div>

                              <Input
                                label="Target Value (optional)"
                                type="number"
                                value={goal.target || ''}
                                onChange={(e) => handleUpdateGoal(goal.id, { 
                                  target: parseFloat(e.target.value) || undefined 
                                })}
                                placeholder="Enter target..."
                                disabled={readOnly}
                              />
                            </div>

                            {/* Weight and Primary */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <Input
                                label="Weight (%)"
                                type="number"
                                value={goal.weight}
                                onChange={(e) => handleUpdateGoal(goal.id, { 
                                  weight: parseFloat(e.target.value) || 0 
                                })}
                                min={0}
                                max={100}
                                step={1}
                                disabled={readOnly}
                              />
                              
                              <div className="flex items-center space-x-4 pt-6">
                                <label className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={goal.isPrimary}
                                    onChange={(e) => e.target.checked && handleSetPrimary(goal.id)}
                                    className="mr-2"
                                    disabled={readOnly}
                                  />
                                  <span className="text-sm font-medium text-gray-700">
                                    Primary Goal
                                  </span>
                                </label>
                              </div>
                            </div>

                            {/* Metric Info */}
                            {selectedMetric && (
                              <div className="p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center mb-2">
                                  <ArrowTrendingUpIcon className="h-4 w-4 text-gray-500 mr-2" />
                                  <span className="text-sm font-medium text-gray-700">
                                    Metric Details
                                  </span>
                                </div>
                                <div className="text-xs text-gray-600 space-y-1">
                                  <div><strong>Unit:</strong> {selectedMetric.unit}</div>
                                  <div><strong>Description:</strong> {selectedMetric.description}</div>
                                </div>
                              </div>
                            )}
                          </div>
                        </CardBody>

                        <CardFooter>
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="outline"
                              onClick={() => handleRemoveGoal(goal.id)}
                              disabled={readOnly || goals.length <= 1}
                              className="text-red-600 hover:text-red-700"
                            >
                              <TrashIcon className="h-4 w-4 mr-1" />
                              Remove Goal
                            </Button>
                          </div>
                        </CardFooter>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {goals.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <TrophyIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Goals Defined</h3>
            <p className="text-sm">Add at least one goal to measure experiment success</p>
            <Button
              variant="primary"
              onClick={handleAddGoal}
              leftIcon={PlusIcon}
              disabled={readOnly}
              className="mt-4"
            >
              Add Your First Goal
            </Button>
          </div>
        )}
      </div>

      {/* Goals Summary */}
      {goals.length > 0 && (
        <Card>
          <CardHeader>
            <h4 className="text-md font-medium text-gray-900">Goals Summary</h4>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{goals.length}</div>
                <div className="text-sm text-blue-700">Total Goals</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {hasPrimaryGoal ? '1' : '0'}
                </div>
                <div className="text-sm text-green-700">Primary Goal</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className={`text-2xl font-bold ${
                  Math.abs(totalWeight - 100) < 0.1 ? 'text-purple-600' : 'text-red-600'
                }`}>
                  {totalWeight}%
                </div>
                <div className="text-sm text-purple-700">Total Weight</div>
              </div>
            </div>

            {/* Weight Distribution */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">Weight Distribution</span>
                <span className={`font-medium ${
                  Math.abs(totalWeight - 100) < 0.1 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {totalWeight}% / 100%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    Math.abs(totalWeight - 100) < 0.1 ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(totalWeight, 100)}%` }}
                />
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Validation Messages */}
      <div className="space-y-2">
        {!hasPrimaryGoal && goals.length > 0 && (
          <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-2" />
            <span className="text-sm text-yellow-800">
              Please designate one goal as primary for statistical analysis.
            </span>
          </div>
        )}

        {Math.abs(totalWeight - 100) > 0.1 && goals.length > 1 && (
          <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-2" />
            <span className="text-sm text-yellow-800">
              Goal weights should total 100%. Current total: {totalWeight}%
            </span>
          </div>
        )}

        {error && (
          <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-sm text-red-800">{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};