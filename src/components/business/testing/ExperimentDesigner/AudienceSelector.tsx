// src/components/business/testing/ExperimentDesigner/AudienceSelector.tsx

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserGroupIcon,
  PlusIcon,
  TrashIcon,
  FunnelIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ChartBarIcon,
  GlobeAltIcon,
  ClockIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { Button } from '../../../ui/Button';
import { Card, CardHeader, CardBody, CardFooter } from '../../../ui/Card';
import { Input, Select } from '../../../ui/Input';
import type { AudienceConfig } from './ExperimentBuilder';

interface AudienceSelectorProps {
  audience: AudienceConfig;
  onChange: (audience: AudienceConfig) => void;
  readOnly?: boolean;
  error?: string;
}

interface AtomFilter {
  atomId: string;
  atomName: string;
  operator: string;
  value: any;
  type: 'demographic' | 'behavioral' | 'transactional' | 'contextual';
}

// Mock atoms for testing (replace with real data from atoms store)
const AVAILABLE_ATOMS = [
  {
    id: 'age_range',
    name: 'Age Range',
    type: 'demographic',
    description: 'Customer age demographics',
    operators: ['equals', 'between', 'greater_than', 'less_than'],
    valueType: 'number'
  },
  {
    id: 'location',
    name: 'Geographic Location',
    type: 'demographic',
    description: 'Customer location',
    operators: ['equals', 'in', 'not_in'],
    valueType: 'select',
    options: ['US', 'CA', 'UK', 'DE', 'FR', 'AU', 'JP']
  },
  {
    id: 'purchase_frequency',
    name: 'Purchase Frequency',
    type: 'behavioral',
    description: 'How often customer purchases',
    operators: ['equals', 'greater_than', 'less_than'],
    valueType: 'number'
  },
  {
    id: 'total_spent',
    name: 'Total Amount Spent',
    type: 'transactional',
    description: 'Customer lifetime value',
    operators: ['greater_than', 'less_than', 'between'],
    valueType: 'currency'
  },
  {
    id: 'last_purchase',
    name: 'Days Since Last Purchase',
    type: 'behavioral',
    description: 'Recency of last purchase',
    operators: ['greater_than', 'less_than', 'between'],
    valueType: 'number'
  },
  {
    id: 'email_engagement',
    name: 'Email Engagement Rate',
    type: 'behavioral',
    description: 'Email open and click rates',
    operators: ['greater_than', 'less_than'],
    valueType: 'percentage'
  },
  {
    id: 'device_type',
    name: 'Device Type',
    type: 'contextual',
    description: 'Primary device used',
    operators: ['equals', 'in'],
    valueType: 'select',
    options: ['mobile', 'desktop', 'tablet']
  },
  {
    id: 'acquisition_channel',
    name: 'Acquisition Channel',
    type: 'behavioral',
    description: 'How customer was acquired',
    operators: ['equals', 'in'],
    valueType: 'select',
    options: ['organic', 'paid_search', 'social', 'email', 'referral', 'direct']
  }
];

const OPERATORS = {
  equals: { label: 'equals', symbol: '=' },
  not_equals: { label: 'does not equal', symbol: '≠' },
  greater_than: { label: 'greater than', symbol: '>' },
  less_than: { label: 'less than', symbol: '<' },
  between: { label: 'between', symbol: '↔' },
  in: { label: 'is one of', symbol: '∈' },
  not_in: { label: 'is not one of', symbol: '∉' },
  contains: { label: 'contains', symbol: '⊃' }
};

const SEGMENTS = [
  { id: 'high_value', name: 'High Value Customers', size: 5000, description: 'Customers with high LTV' },
  { id: 'recent_purchasers', name: 'Recent Purchasers', size: 12000, description: 'Purchased in last 30 days' },
  { id: 'email_engaged', name: 'Email Engaged', size: 25000, description: 'High email engagement' },
  { id: 'mobile_users', name: 'Mobile Users', size: 18000, description: 'Primarily mobile shoppers' },
  { id: 'new_customers', name: 'New Customers', size: 3000, description: 'Customers acquired in last 90 days' },
  { id: 'at_risk', name: 'At Risk', size: 8000, description: 'Haven\'t purchased recently' }
];

const getAtomTypeIcon = (type: string) => {
  switch (type) {
    case 'demographic': return UserGroupIcon;
    case 'behavioral': return ChartBarIcon;
    case 'transactional': return CurrencyDollarIcon;
    case 'contextual': return GlobeAltIcon;
    default: return FunnelIcon;
  }
};

const getAtomTypeColor = (type: string) => {
  switch (type) {
    case 'demographic': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'behavioral': return 'bg-green-100 text-green-800 border-green-200';
    case 'transactional': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'contextual': return 'bg-orange-100 text-orange-800 border-orange-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const AudienceSelector: React.FC<AudienceSelectorProps> = ({
  audience,
  onChange,
  readOnly = false,
  error
}) => {
  const [selectedSegments, setSelectedSegments] = useState<string[]>(audience.segments || []);
  const [filters, setFilters] = useState<AtomFilter[]>(
    audience.filters?.map(f => {
      const atom = AVAILABLE_ATOMS.find(a => a.id === f.atomId);
      return {
        atomId: f.atomId,
        atomName: atom?.name || 'Unknown Atom',
        operator: f.operator,
        value: f.value,
        type: atom?.type as any || 'demographic'
      };
    }) || []
  );
  const [exclusions, setExclusions] = useState<string[]>(audience.exclusions || []);

  // Calculate estimated audience size based on filters and segments
  const estimatedSize = useMemo(() => {
    let baseSize = 100000; // Total audience
    
    // Apply segment filters
    if (selectedSegments.length > 0) {
      const segmentSizes = selectedSegments.map(segmentId => 
        SEGMENTS.find(s => s.id === segmentId)?.size || 0
      );
      baseSize = Math.min(baseSize, Math.max(...segmentSizes));
    }

    // Apply atom filters (rough estimation)
    filters.forEach(filter => {
      baseSize *= 0.7; // Each filter reduces audience by ~30%
    });

    // Apply exclusions
    if (exclusions.length > 0) {
      baseSize *= 0.9; // Exclusions reduce by ~10%
    }

    return Math.round(baseSize);
  }, [selectedSegments, filters, exclusions]);

  // Update parent component when audience changes
  const updateAudience = useCallback(() => {
    const updatedAudience: AudienceConfig = {
      size: estimatedSize,
      segments: selectedSegments,
      filters: filters.map(f => ({
        atomId: f.atomId,
        operator: f.operator,
        value: f.value
      })),
      exclusions
    };
    onChange(updatedAudience);
  }, [estimatedSize, selectedSegments, filters, exclusions, onChange]);

  // Update audience whenever dependencies change
  React.useEffect(() => {
    updateAudience();
  }, [updateAudience]);

  const handleSegmentToggle = useCallback((segmentId: string) => {
    if (readOnly) return;
    setSelectedSegments(prev => 
      prev.includes(segmentId)
        ? prev.filter(id => id !== segmentId)
        : [...prev, segmentId]
    );
  }, [readOnly]);

  const handleAddFilter = useCallback(() => {
    if (readOnly) return;
    const newFilter: AtomFilter = {
      atomId: '',
      atomName: '',
      operator: 'equals',
      value: '',
      type: 'demographic'
    };
    setFilters(prev => [...prev, newFilter]);
  }, [readOnly]);

  const handleUpdateFilter = useCallback((index: number, updates: Partial<AtomFilter>) => {
    if (readOnly) return;
    setFilters(prev => prev.map((filter, i) => 
      i === index ? { ...filter, ...updates } : filter
    ));
  }, [readOnly]);

  const handleRemoveFilter = useCallback((index: number) => {
    if (readOnly) return;
    setFilters(prev => prev.filter((_, i) => i !== index));
  }, [readOnly]);

  const renderValueInput = (filter: AtomFilter, index: number) => {
    const atom = AVAILABLE_ATOMS.find(a => a.id === filter.atomId);
    if (!atom) return null;

    const updateValue = (value: any) => {
      handleUpdateFilter(index, { value });
    };

    switch (atom.valueType) {
      case 'select':
        return (
          <Select
            value={filter.value}
            onChange={(e) => updateValue(e.target.value)}
            disabled={readOnly}
          >
            <option value="">Select value</option>
            {atom.options?.map(option => (
              <option key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </option>
            ))}
          </Select>
        );
      
      case 'number':
        return (
          <Input
            type="number"
            value={filter.value}
            onChange={(e) => updateValue(parseFloat(e.target.value) || 0)}
            placeholder="Enter number"
            disabled={readOnly}
          />
        );
      
      case 'currency':
        return (
          <Input
            type="number"
            value={filter.value}
            onChange={(e) => updateValue(parseFloat(e.target.value) || 0)}
            placeholder="0.00"
            step="0.01"
            disabled={readOnly}
          />
        );
      
      case 'percentage':
        return (
          <Input
            type="number"
            value={filter.value}
            onChange={(e) => updateValue(parseFloat(e.target.value) || 0)}
            placeholder="0-100"
            min={0}
            max={100}
            step="0.1"
            disabled={readOnly}
          />
        );
      
      default:
        return (
          <Input
            value={filter.value}
            onChange={(e) => updateValue(e.target.value)}
            placeholder="Enter value"
            disabled={readOnly}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Audience Size Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <UserGroupIcon className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Estimated Audience</h3>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {estimatedSize.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">customers</div>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Segments</span>
              <div className="font-medium">{selectedSegments.length} selected</div>
            </div>
            <div>
              <span className="text-gray-500">Filters</span>
              <div className="font-medium">{filters.length} active</div>
            </div>
            <div>
              <span className="text-gray-500">Exclusions</span>
              <div className="font-medium">{exclusions.length} applied</div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Pre-built Segments */}
      <Card>
        <CardHeader>
          <h4 className="text-md font-medium text-gray-900">Pre-built Segments</h4>
          <p className="text-sm text-gray-500">
            Select from existing customer segments to quickly define your audience
          </p>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {SEGMENTS.map((segment) => (
              <motion.button
                key={segment.id}
                onClick={() => handleSegmentToggle(segment.id)}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  selectedSegments.includes(segment.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                } ${readOnly ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                whileHover={!readOnly ? { scale: 1.02 } : {}}
                whileTap={!readOnly ? { scale: 0.98 } : {}}
                disabled={readOnly}
              >
                <div className="flex items-center justify-between mb-2">
                  <h5 className={`font-medium ${
                    selectedSegments.includes(segment.id) ? 'text-blue-900' : 'text-gray-900'
                  }`}>
                    {segment.name}
                  </h5>
                  <div className={`text-sm font-medium ${
                    selectedSegments.includes(segment.id) ? 'text-blue-600' : 'text-gray-600'
                  }`}>
                    {segment.size.toLocaleString()}
                  </div>
                </div>
                <p className={`text-xs ${
                  selectedSegments.includes(segment.id) ? 'text-blue-700' : 'text-gray-600'
                }`}>
                  {segment.description}
                </p>
                {selectedSegments.includes(segment.id) && (
                  <div className="mt-2">
                    <CheckCircleIcon className="h-4 w-4 text-blue-600" />
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Atom-based Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-md font-medium text-gray-900">Custom Filters</h4>
              <p className="text-sm text-gray-500">
                Use eligibility atoms to create precise audience definitions
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleAddFilter}
              leftIcon={PlusIcon}
              disabled={readOnly}
            >
              Add Filter
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <AnimatePresence>
              {filters.map((filter, index) => {
                const atom = AVAILABLE_ATOMS.find(a => a.id === filter.atomId);
                const Icon = getAtomTypeIcon(filter.type);

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="p-4 border border-gray-200 rounded-lg bg-gray-50"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                      {/* Atom Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Atom
                        </label>
                        <Select
                          value={filter.atomId}
                          onChange={(e) => {
                            const selectedAtom = AVAILABLE_ATOMS.find(a => a.id === e.target.value);
                            handleUpdateFilter(index, {
                              atomId: e.target.value,
                              atomName: selectedAtom?.name || '',
                              type: selectedAtom?.type as any || 'demographic',
                              operator: 'equals',
                              value: ''
                            });
                          }}
                          disabled={readOnly}
                        >
                          <option value="">Select atom</option>
                          {AVAILABLE_ATOMS.map(atom => (
                            <option key={atom.id} value={atom.id}>
                              {atom.name}
                            </option>
                          ))}
                        </Select>
                      </div>

                      {/* Operator Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Operator
                        </label>
                        <Select
                          value={filter.operator}
                          onChange={(e) => handleUpdateFilter(index, { operator: e.target.value })}
                          disabled={readOnly || !filter.atomId}
                        >
                          {atom?.operators.map(op => (
                            <option key={op} value={op}>
                              {OPERATORS[op as keyof typeof OPERATORS]?.label || op}
                            </option>
                          ))}
                        </Select>
                      </div>

                      {/* Value Input */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Value
                        </label>
                        {renderValueInput(filter, index)}
                      </div>

                      {/* Atom Type Badge */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Type
                        </label>
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getAtomTypeColor(filter.type)}`}>
                          <Icon className="h-3 w-3 mr-1" />
                          {filter.type}
                        </div>
                      </div>

                      {/* Remove Button */}
                      <div>
                        <Button
                          variant="ghost"
                          onClick={() => handleRemoveFilter(index)}
                          disabled={readOnly}
                          className="text-red-600 hover:text-red-700"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Filter Description */}
                    {atom && (
                      <div className="mt-2 text-xs text-gray-600">
                        {atom.description}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {filters.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <FunnelIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No custom filters added yet</p>
                <p className="text-sm">Add filters to refine your audience targeting</p>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Exclusions */}
      <Card>
        <CardHeader>
          <h4 className="text-md font-medium text-gray-900">Exclusions</h4>
          <p className="text-sm text-gray-500">
            Exclude specific segments or customers from this experiment
          </p>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {SEGMENTS.map((segment) => (
              <label key={segment.id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={exclusions.includes(segment.id)}
                  onChange={(e) => {
                    if (readOnly) return;
                    setExclusions(prev =>
                      e.target.checked
                        ? [...prev, segment.id]
                        : prev.filter(id => id !== segment.id)
                    );
                  }}
                  className="mr-3"
                  disabled={readOnly}
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{segment.name}</div>
                  <div className="text-sm text-gray-600">{segment.size.toLocaleString()} customers</div>
                </div>
              </label>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Audience Preview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h4 className="text-md font-medium text-gray-900">Audience Summary</h4>
            <Button variant="outline" leftIcon={EyeIcon} disabled={readOnly}>
              Preview Audience
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            {/* Size Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {estimatedSize.toLocaleString()}
                </div>
                <div className="text-sm text-blue-700">Final Audience Size</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {selectedSegments.length + filters.length}
                </div>
                <div className="text-sm text-green-700">Total Criteria</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {((estimatedSize / 100000) * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-purple-700">Of Total Audience</div>
              </div>
            </div>

            {/* Criteria Summary */}
            <div className="space-y-2">
              <h5 className="font-medium text-gray-900">Applied Criteria:</h5>
              <div className="space-y-1 text-sm">
                {selectedSegments.map(segmentId => {
                  const segment = SEGMENTS.find(s => s.id === segmentId);
                  return (
                    <div key={segmentId} className="flex items-center text-blue-700">
                      <CheckCircleIcon className="h-4 w-4 mr-2" />
                      Segment: {segment?.name}
                    </div>
                  );
                })}
                {filters.map((filter, index) => (
                  <div key={index} className="flex items-center text-green-700">
                    <CheckCircleIcon className="h-4 w-4 mr-2" />
                    {filter.atomName} {OPERATORS[filter.operator as keyof typeof OPERATORS]?.symbol} {filter.value}
                  </div>
                ))}
                {exclusions.map(exclusionId => {
                  const segment = SEGMENTS.find(s => s.id === exclusionId);
                  return (
                    <div key={exclusionId} className="flex items-center text-red-700">
                      <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
                      Exclude: {segment?.name}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recommendations */}
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h6 className="font-medium text-yellow-800 mb-1">Recommendations:</h6>
              <ul className="text-sm text-yellow-700 space-y-1">
                {estimatedSize < 1000 && (
                  <li>• Consider broadening your criteria - sample size may be too small for reliable results</li>
                )}
                {estimatedSize > 50000 && (
                  <li>• Large audience size detected - consider adding more specific filters for better targeting</li>
                )}
                {filters.length === 0 && selectedSegments.length === 0 && (
                  <li>• Add segments or filters to better define your test audience</li>
                )}
                {selectedSegments.length > 3 && (
                  <li>• Multiple segments selected - ensure they don't overlap significantly</li>
                )}
              </ul>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 border border-red-200 rounded-lg"
        >
          <div className="flex items-start">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
            <div>
              <h4 className="text-sm font-medium text-red-800">Audience Configuration Error</h4>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};