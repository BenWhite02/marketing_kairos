// src/components/business/testing/ExperimentDesigner/TrafficAllocation.tsx

import React, { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRightIcon,
  AdjustmentsHorizontalIcon,
  ChartPieIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  TrendingUpIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { Button } from '../../../ui/Button';
import { Card, CardHeader, CardBody } from '../../../ui/Card';
import { Input } from '../../../ui/Input';
import type { TrafficConfig, ExperimentVariant } from './ExperimentBuilder';

interface TrafficAllocationProps {
  traffic: TrafficConfig;
  variants: ExperimentVariant[];
  onChange: (traffic: TrafficConfig) => void;
  readOnly?: boolean;
  error?: string;
}

const PRESET_SPLITS = [
  { name: 'Equal Split', icon: '⚖️', splits: [50, 50] },
  { name: '90/10 Split', icon: '📊', splits: [90, 10] },
  { name: '80/20 Split', icon: '📈', splits: [80, 20] },
  { name: '70/30 Split', icon: '📉', splits: [70, 30] },
  { name: 'A/B/C Equal', icon: '🎯', splits: [33.33, 33.33, 33.34] },
  { name: 'Control Heavy', icon: '🛡️', splits: [60, 20, 20] }
];

const VARIANT_COLORS = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-yellow-500',
  'bg-red-500'
];

export const TrafficAllocation: React.FC<TrafficAllocationProps> = ({
  traffic,
  variants,
  onChange,
  readOnly = false,
  error
}) => {
  const [rampUpEnabled, setRampUpEnabled] = useState(traffic.rampUp?.enabled || false);

  // Calculate current distribution
  const currentDistribution = useMemo(() => {
    return variants.map(variant => ({
      ...variant,
      allocation: traffic.distribution[variant.id] || 0
    }));
  }, [variants, traffic.distribution]);

  const totalAllocation = useMemo(() => {
    return Object.values(traffic.distribution).reduce((sum, allocation) => sum + allocation, 0);
  }, [traffic.distribution]);

  const updateTrafficAllocation = useCallback((allocation: number) => {
    onChange({
      ...traffic,
      allocation
    });
  }, [traffic, onChange]);

  const updateVariantAllocation = useCallback((variantId: string, allocation: number) => {
    const newDistribution = {
      ...traffic.distribution,
      [variantId]: allocation
    };
    onChange({
      ...traffic,
      distribution: newDistribution
    });
  }, [traffic, onChange]);

  const applyPresetSplit = useCallback((splits: number[]) => {
    if (readOnly) return;
    
    const newDistribution: { [variantId: string]: number } = {};
    variants.forEach((variant, index) => {
      newDistribution[variant.id] = splits[index] || 0;
    });
    
    onChange({
      ...traffic,
      distribution: newDistribution
    });
  }, [variants, traffic, onChange, readOnly]);

  const equalizeTraffic = useCallback(() => {
    if (readOnly) return;
    
    const equalSplit = 100 / variants.length;
    const newDistribution: { [variantId: string]: number } = {};
    
    variants.forEach(variant => {
      newDistribution[variant.id] = equalSplit;
    });
    
    onChange({
      ...traffic,
      distribution: newDistribution
    });
  }, [variants, traffic, onChange, readOnly]);

  const updateRampUp = useCallback((rampUpConfig: Partial<TrafficConfig['rampUp']>) => {
    onChange({
      ...traffic,
      rampUp: {
        enabled: rampUpEnabled,
        startPercent: 10,
        targetPercent: 100,
        durationHours: 24,
        ...traffic.rampUp,
        ...rampUpConfig
      }
    });
  }, [traffic, onChange, rampUpEnabled]);

  const isValidDistribution = Math.abs(totalAllocation - 100) < 0.1;

  return (
    <div className="space-y-6">
      {/* Overall Traffic Allocation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Overall Traffic Allocation
              </h3>
              <p className="text-sm text-gray-500">
                Percentage of total traffic to include in this experiment
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {traffic.allocation}%
              </div>
              <div className="text-sm text-gray-500">of all traffic</div>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Traffic Allocation (%)"
                type="number"
                value={traffic.allocation}
                onChange={(e) => updateTrafficAllocation(parseFloat(e.target.value) || 0)}
                min={1}
                max={100}
                step={1}
                disabled={readOnly}
              />
              <div className="flex items-end">
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Daily Users
                  </label>
                  <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600">
                    {Math.round((traffic.allocation / 100) * 10000).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start">
                <InformationCircleIcon className="h-5 w-5 text-blue-500 mt-0.5 mr-2" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1">Traffic Allocation Guidelines:</p>
                  <ul className="space-y-1">
                    <li>• Start with 10-20% for risky experiments</li>
                    <li>• Use 50-100% for safe UI/copy changes</li>
                    <li>• Consider business impact before increasing</li>
                    <li>• Monitor performance and adjust as needed</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Variant Distribution */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Variant Distribution
              </h3>
              <p className="text-sm text-gray-500">
                How to split traffic between test variants
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-sm font-medium ${
                isValidDistribution ? 'text-green-600' : 'text-red-600'
              }`}>
                {totalAllocation.toFixed(1)}% / 100%
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={equalizeTraffic}
                disabled={readOnly}
              >
                Equalize
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <div className="space-y-6">
            {/* Preset Splits */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Presets</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {PRESET_SPLITS.filter(preset => preset.splits.length <= variants.length).map((preset) => (
                  <motion.button
                    key={preset.name}
                    onClick={() => applyPresetSplit(preset.splits)}
                    className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={!readOnly ? { scale: 1.02 } : {}}
                    whileTap={!readOnly ? { scale: 0.98 } : {}}
                    disabled={readOnly}
                  >
                    <div className="text-lg mb-1">{preset.icon}</div>
                    <div className="text-xs font-medium text-gray-700">{preset.name}</div>
                    <div className="text-xs text-gray-500">
                      {preset.splits.map(split => `${split}%`).join(' / ')}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Visual Distribution */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Current Distribution</h4>
              <div className="space-y-3">
                {/* Progress Bar */}
                <div className="w-full h-8 bg-gray-200 rounded-lg overflow-hidden flex">
                  {currentDistribution.map((variant, index) => (
                    <div
                      key={variant.id}
                      className={`${VARIANT_COLORS[index % VARIANT_COLORS.length]} flex items-center justify-center text-white text-xs font-medium transition-all duration-300`}
                      style={{ width: `${variant.allocation}%` }}
                    >
                      {variant.allocation > 10 && `${variant.allocation.toFixed(1)}%`}
                    </div>
                  ))}
                </div>

                {/* Legend */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {currentDistribution.map((variant, index) => (
                    <div key={variant.id} className="flex items-center justify-between p-2 border border-gray-200 rounded">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded ${VARIANT_COLORS[index % VARIANT_COLORS.length]} mr-2`} />
                        <span className="text-sm font-medium text-gray-700">{variant.name}</span>
                        {variant.isControl && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            CONTROL
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {variant.allocation.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Manual Allocation Inputs */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Manual Allocation</h4>
              <div className="space-y-3">
                {variants.map((variant, index) => (
                  <div key={variant.id} className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded ${VARIANT_COLORS[index % VARIANT_COLORS.length]}`} />
                    <div className="flex-1">
                      <label className="text-sm font-medium text-gray-700">
                        {variant.name}
                        {variant.isControl && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            CONTROL
                          </span>
                        )}
                      </label>
                    </div>
                    <div className="w-24">
                      <Input
                        type="number"
                        value={traffic.distribution[variant.id] || 0}
                        onChange={(e) => updateVariantAllocation(variant.id, parseFloat(e.target.value) || 0)}
                        min={0}
                        max={100}
                        step={0.1}
                        disabled={readOnly}
                      />
                    </div>
                    <span className="text-sm text-gray-500 w-8">%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Estimated Users */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">
                  {Math.round((totalAllocation / 100) * (traffic.allocation / 100) * 10000).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Daily Users</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">
                  {variants.length}
                </div>
                <div className="text-sm text-gray-600">Variants</div>
              </div>
              <div className="text-center">
                <div className={`text-lg font-bold ${
                  isValidDistribution ? 'text-green-600' : 'text-red-600'
                }`}>
                  {Math.round(totalAllocation * 10) / 10}%
                </div>
                <div className="text-sm text-gray-600">Total Allocation</div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Ramp-Up Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <TrendingUpIcon className="h-5 w-5 text-orange-600 mr-2" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">Gradual Ramp-Up</h3>
                <p className="text-sm text-gray-500">
                  Gradually increase traffic to minimize risk
                </p>
              </div>
            </div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={rampUpEnabled}
                onChange={(e) => {
                  setRampUpEnabled(e.target.checked);
                  updateRampUp({ enabled: e.target.checked });
                }}
                className="mr-2"
                disabled={readOnly}
              />
              <span className="text-sm font-medium text-gray-700">Enable Ramp-Up</span>
            </label>
          </div>
        </CardHeader>
        {rampUpEnabled && (
          <CardBody>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Start Percentage"
                  type="number"
                  value={traffic.rampUp?.startPercent || 10}
                  onChange={(e) => updateRampUp({ startPercent: parseFloat(e.target.value) || 10 })}
                  min={1}
                  max={100}
                  step={1}
                  disabled={readOnly}
                />
                <Input
                  label="Target Percentage"
                  type="number"
                  value={traffic.rampUp?.targetPercent || 100}
                  onChange={(e) => updateRampUp({ targetPercent: parseFloat(e.target.value) || 100 })}
                  min={1}
                  max={100}
                  step={1}
                  disabled={readOnly}
                />
                <Input
                  label="Duration (hours)"
                  type="number"
                  value={traffic.rampUp?.durationHours || 24}
                  onChange={(e) => updateRampUp({ durationHours: parseFloat(e.target.value) || 24 })}
                  min={1}
                  max={168}
                  step={1}
                  disabled={readOnly}
                />
              </div>

              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="flex items-start">
                  <ClockIcon className="h-5 w-5 text-orange-500 mt-0.5 mr-2" />
                  <div className="text-sm text-orange-700">
                    <p className="font-medium mb-1">Ramp-Up Schedule:</p>
                    <p>
                      Start at {traffic.rampUp?.startPercent || 10}% traffic, 
                      gradually increase to {traffic.rampUp?.targetPercent || 100}% 
                      over {traffic.rampUp?.durationHours || 24} hours.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        )}
      </Card>

      {/* Validation Messages */}
      <div className="space-y-2">
        {!isValidDistribution && (
          <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-sm text-red-800">
              Variant traffic must total exactly 100%. Current total: {totalAllocation.toFixed(1)}%
            </span>
          </div>
        )}

        {traffic.allocation < 10 && (
          <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-2" />
            <span className="text-sm text-yellow-800">
              Low traffic allocation may result in longer test duration for statistical significance.
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