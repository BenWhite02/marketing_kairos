// src/components/business/testing/ExperimentDesigner/StatisticalConfig.tsx

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CalculatorIcon,
  ChartBarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  AcademicCapIcon,
  BoltIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { Button } from '../../../ui/Button';
import { Card, CardHeader, CardBody } from '../../../ui/Card';
import { Input, Select } from '../../../ui/Input';
import type { StatisticalConfig as StatisticalConfigType } from './ExperimentBuilder';

interface StatisticalConfigProps {
  statistical: StatisticalConfigType;
  audienceSize: number;
  onChange: (statistical: StatisticalConfigType) => void;
  readOnly?: boolean;
  error?: string;
}

interface SampleSizeCalculation {
  recommendedSize: number;
  estimatedDuration: number;
  powerAnalysis: {
    actualPower: number;
    detectionRate: number;
    falsePositiveRate: number;
  };
  recommendations: string[];
}

const CONFIDENCE_LEVELS = [
  { value: 90, label: '90% (Low risk)', description: 'Suitable for minor changes' },
  { value: 95, label: '95% (Standard)', description: 'Industry standard for most tests' },
  { value: 99, label: '99% (High confidence)', description: 'For critical business decisions' }
];

const STATISTICAL_POWER_LEVELS = [
  { value: 70, label: '70% (Minimum)', description: 'Low power, higher risk of false negatives' },
  { value: 80, label: '80% (Standard)', description: 'Industry standard statistical power' },
  { value: 90, label: '90% (High)', description: 'High power, requires larger sample size' },
  { value: 95, label: '95% (Very High)', description: 'Maximum power, very large sample required' }
];

const MDE_PRESETS = [
  { value: 1, label: '1% (Very Sensitive)', description: 'Detect very small changes' },
  { value: 2, label: '2% (Sensitive)', description: 'Detect small changes' },
  { value: 5, label: '5% (Standard)', description: 'Industry standard detection' },
  { value: 10, label: '10% (Large)', description: 'Detect only large changes' },
  { value: 20, label: '20% (Very Large)', description: 'Detect only major changes' }
];

// Statistical calculation functions
const calculateSampleSize = (
  confidenceLevel: number,
  statisticalPower: number,
  minimumDetectableEffect: number,
  baselineConversionRate: number = 5
): number => {
  // Simplified sample size calculation using normal approximation
  const alpha = (100 - confidenceLevel) / 100;
  const beta = (100 - statisticalPower) / 100;
  
  // Z-scores
  const zAlpha = confidenceLevel === 90 ? 1.645 : confidenceLevel === 95 ? 1.96 : 2.576;
  const zBeta = statisticalPower === 70 ? 0.524 : statisticalPower === 80 ? 0.842 : statisticalPower === 90 ? 1.282 : 1.645;
  
  // Convert percentages to proportions
  const p1 = baselineConversionRate / 100;
  const p2 = p1 * (1 + minimumDetectableEffect / 100);
  
  // Effect size
  const pooledP = (p1 + p2) / 2;
  const effectSize = Math.abs(p2 - p1);
  
  // Sample size per group
  const sampleSize = Math.ceil(
    (Math.pow(zAlpha + zBeta, 2) * 2 * pooledP * (1 - pooledP)) / Math.pow(effectSize, 2)
  );
  
  return Math.max(100, sampleSize); // Minimum 100 per variant
};

const calculateTestDuration = (sampleSize: number, dailyTraffic: number): number => {
  return Math.ceil(sampleSize / Math.max(1, dailyTraffic));
};

export const StatisticalConfig: React.FC<StatisticalConfigProps> = ({
  statistical,
  audienceSize,
  onChange,
  readOnly = false,
  error
}) => {
  const [baselineConversionRate, setBaselineConversionRate] = useState(5);
  const [dailyTrafficPerVariant, setDailyTrafficPerVariant] = useState(1000);

  // Calculate sample size and recommendations
  const calculations = useMemo((): SampleSizeCalculation => {
    const recommendedSize = calculateSampleSize(
      statistical.confidenceLevel,
      statistical.statisticalPower,
      statistical.minimumDetectableEffect,
      baselineConversionRate
    );

    const estimatedDuration = calculateTestDuration(recommendedSize, dailyTrafficPerVariant);

    const powerAnalysis = {
      actualPower: statistical.statisticalPower,
      detectionRate: statistical.statisticalPower / 100,
      falsePositiveRate: (100 - statistical.confidenceLevel) / 100
    };

    const recommendations: string[] = [];

    if (recommendedSize > statistical.sampleSize) {
      recommendations.push(`Increase sample size to ${recommendedSize.toLocaleString()} for optimal power`);
    }

    if (estimatedDuration > 14) {
      recommendations.push('Consider increasing daily traffic or reducing MDE to shorten test duration');
    }

    if (statistical.minimumDetectableEffect < 2) {
      recommendations.push('Very small MDE requires large sample sizes and longer test duration');
    }

    if (statistical.confidenceLevel > 95 && statistical.statisticalPower > 90) {
      recommendations.push('High confidence + high power combination requires very large samples');
    }

    return {
      recommendedSize,
      estimatedDuration,
      powerAnalysis,
      recommendations
    };
  }, [statistical, baselineConversionRate, dailyTrafficPerVariant]);

  // Auto-update sample size when parameters change
  useEffect(() => {
    if (!readOnly) {
      onChange({
        ...statistical,
        sampleSize: calculations.recommendedSize
      });
    }
  }, [calculations.recommendedSize, readOnly, statistical, onChange]);

  const updateStatistical = useCallback((updates: Partial<StatisticalConfigType>) => {
    if (readOnly) return;
    onChange({ ...statistical, ...updates });
  }, [statistical, onChange, readOnly]);

  const applyPreset = useCallback((preset: 'conservative' | 'standard' | 'aggressive') => {
    if (readOnly) return;

    const presets = {
      conservative: {
        confidenceLevel: 99,
        statisticalPower: 90,
        minimumDetectableEffect: 5,
        earlyStoppingEnabled: false
      },
      standard: {
        confidenceLevel: 95,
        statisticalPower: 80,
        minimumDetectableEffect: 5,
        earlyStoppingEnabled: true
      },
      aggressive: {
        confidenceLevel: 90,
        statisticalPower: 70,
        minimumDetectableEffect: 10,
        earlyStoppingEnabled: true
      }
    };

    updateStatistical(presets[preset]);
  }, [updateStatistical, readOnly]);

  return (
    <div className="space-y-6">
      {/* Statistical Presets */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium text-gray-900">Statistical Presets</h3>
          <p className="text-sm text-gray-500">
            Quick configurations for different testing scenarios
          </p>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.button
              onClick={() => applyPreset('conservative')}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors disabled:opacity-50"
              whileHover={!readOnly ? { scale: 1.02 } : {}}
              whileTap={!readOnly ? { scale: 0.98 } : {}}
              disabled={readOnly}
            >
              <ShieldCheckIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-medium text-gray-900 mb-1">Aggressive</h4>
              <p className="text-xs text-gray-600">90% confidence, 70% power, 10% MDE</p>
              <p className="text-xs text-gray-500 mt-1">Faster results, lower precision</p>
            </motion.button>
          </div>
        </CardBody>
      </Card>

      {/* Core Statistical Parameters */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium text-gray-900">Statistical Parameters</h3>
          <p className="text-sm text-gray-500">
            Configure the core statistical settings for your experiment
          </p>
        </CardHeader>
        <CardBody>
          <div className="space-y-6">
            {/* Confidence Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confidence Level
              </label>
              <Select
                value={statistical.confidenceLevel}
                onChange={(e) => updateStatistical({ confidenceLevel: parseInt(e.target.value) })}
                disabled={readOnly}
              >
                {CONFIDENCE_LEVELS.map(level => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                {CONFIDENCE_LEVELS.find(l => l.value === statistical.confidenceLevel)?.description}
              </p>
            </div>

            {/* Statistical Power */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statistical Power
              </label>
              <Select
                value={statistical.statisticalPower}
                onChange={(e) => updateStatistical({ statisticalPower: parseInt(e.target.value) })}
                disabled={readOnly}
              >
                {STATISTICAL_POWER_LEVELS.map(power => (
                  <option key={power.value} value={power.value}>
                    {power.label}
                  </option>
                ))}
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                {STATISTICAL_POWER_LEVELS.find(p => p.value === statistical.statisticalPower)?.description}
              </p>
            </div>

            {/* Minimum Detectable Effect */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Detectable Effect (MDE)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="number"
                  value={statistical.minimumDetectableEffect}
                  onChange={(e) => updateStatistical({ minimumDetectableEffect: parseFloat(e.target.value) || 1 })}
                  min={0.1}
                  max={50}
                  step={0.1}
                  disabled={readOnly}
                />
                <Select
                  value={statistical.minimumDetectableEffect}
                  onChange={(e) => updateStatistical({ minimumDetectableEffect: parseFloat(e.target.value) })}
                  disabled={readOnly}
                >
                  {MDE_PRESETS.map(preset => (
                    <option key={preset.value} value={preset.value}>
                      {preset.label}
                    </option>
                  ))}
                </Select>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Smallest improvement you want to detect with confidence
              </p>
            </div>

            {/* Significance Threshold */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Significance Threshold (p-value)
              </label>
              <Input
                type="number"
                value={statistical.significanceThreshold}
                onChange={(e) => updateStatistical({ significanceThreshold: parseFloat(e.target.value) || 0.05 })}
                min={0.01}
                max={0.1}
                step={0.01}
                disabled={readOnly}
              />
              <p className="text-xs text-gray-500 mt-1">
                p-value threshold for declaring statistical significance (typically 0.05)
              </p>
            </div>

            {/* Early Stopping */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Early Stopping</h4>
                <p className="text-xs text-gray-500">
                  Allow experiment to stop early if significant results are detected
                </p>
              </div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={statistical.earlyStoppingEnabled}
                  onChange={(e) => updateStatistical({ earlyStoppingEnabled: e.target.checked })}
                  className="mr-2"
                  disabled={readOnly}
                />
                <span className="text-sm font-medium text-gray-700">Enable</span>
              </label>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Sample Size Calculator */}
      <Card>
        <CardHeader>
          <div className="flex items-center">
            <CalculatorIcon className="h-5 w-5 text-purple-600 mr-2" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">Sample Size Calculator</h3>
              <p className="text-sm text-gray-500">
                Estimate required sample size and test duration
              </p>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <div className="space-y-6">
            {/* Input Parameters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Baseline Conversion Rate (%)"
                type="number"
                value={baselineConversionRate}
                onChange={(e) => setBaselineConversionRate(parseFloat(e.target.value) || 5)}
                min={0.1}
                max={50}
                step={0.1}
                disabled={readOnly}
              />
              <Input
                label="Daily Traffic Per Variant"
                type="number"
                value={dailyTrafficPerVariant}
                onChange={(e) => setDailyTrafficPerVariant(parseInt(e.target.value) || 1000)}
                min={100}
                step={100}
                disabled={readOnly}
              />
            </div>

            {/* Results */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {calculations.recommendedSize.toLocaleString()}
                </div>
                <div className="text-sm text-purple-700">Sample Size Per Variant</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {calculations.estimatedDuration}
                </div>
                <div className="text-sm text-blue-700">Days</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {(calculations.powerAnalysis.actualPower).toFixed(0)}%
                </div>
                <div className="text-sm text-green-700">Statistical Power</div>
              </div>
            </div>

            {/* Current vs Recommended */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Sample Size Comparison</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Current Sample Size:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {statistical.sampleSize.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Recommended Size:</span>
                  <span className={`text-sm font-medium ${
                    statistical.sampleSize >= calculations.recommendedSize ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {calculations.recommendedSize.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className={`h-2 rounded-full ${
                      statistical.sampleSize >= calculations.recommendedSize ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min((statistical.sampleSize / calculations.recommendedSize) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Update Sample Size */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Use recommended sample size?</span>
              <Button
                variant="outline"
                onClick={() => updateStatistical({ sampleSize: calculations.recommendedSize })}
                disabled={readOnly || statistical.sampleSize === calculations.recommendedSize}
              >
                Update to {calculations.recommendedSize.toLocaleString()}
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Power Analysis */}
      <Card>
        <CardHeader>
          <div className="flex items-center">
            <ChartBarIcon className="h-5 w-5 text-green-600 mr-2" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">Power Analysis</h3>
              <p className="text-sm text-gray-500">
                Statistical analysis of your experiment design
              </p>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-sm text-green-700 font-medium">True Positive Rate</div>
                <div className="text-2xl font-bold text-green-600">
                  {(calculations.powerAnalysis.detectionRate * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-green-600">
                  Probability of detecting a real effect
                </div>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <div className="text-sm text-red-700 font-medium">False Positive Rate</div>
                <div className="text-2xl font-bold text-red-600">
                  {(calculations.powerAnalysis.falsePositiveRate * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-red-600">
                  Probability of false positive result
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Interpretation:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• {(calculations.powerAnalysis.detectionRate * 100).toFixed(0)}% chance of detecting the minimum effect if it exists</li>
                <li>• {((1 - calculations.powerAnalysis.detectionRate) * 100).toFixed(0)}% chance of missing a real effect (Type II error)</li>
                <li>• {(calculations.powerAnalysis.falsePositiveRate * 100).toFixed(1)}% chance of false positive (Type I error)</li>
                <li>• {((1 - calculations.powerAnalysis.falsePositiveRate) * 100).toFixed(1)}% confidence in negative results</li>
              </ul>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Recommendations */}
      {calculations.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <InformationCircleIcon className="h-5 w-5 text-yellow-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Recommendations</h3>
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              {calculations.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-sm text-yellow-800">{recommendation}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Advanced Settings */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium text-gray-900">Advanced Settings</h3>
          <p className="text-sm text-gray-500">
            Fine-tune statistical parameters for specific requirements
          </p>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <Input
              label="Custom Sample Size"
              type="number"
              value={statistical.sampleSize}
              onChange={(e) => updateStatistical({ sampleSize: parseInt(e.target.value) || 100 })}
              min={100}
              step={100}
              disabled={readOnly}
            />

            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Statistical Formulas Used:</h4>
              <div className="text-xs text-gray-600 space-y-1">
                <div>• Sample Size: Based on normal approximation for proportions</div>
                <div>• Power: 1 - β (probability of detecting true effect)</div>
                <div>• Confidence: 1 - α (probability of avoiding false positive)</div>
                <div>• Effect Size: Relative difference between variants</div>
              </div>
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
              <h4 className="text-sm font-medium text-red-800">Statistical Configuration Error</h4>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};-1">Conservative</h4>
              <p className="text-xs text-gray-600">99% confidence, 90% power, 5% MDE</p>
              <p className="text-xs text-gray-500 mt-1">High certainty, larger sample needed</p>
            </motion.button>

            <motion.button
              onClick={() => applyPreset('standard')}
              className="p-4 border-2 border-green-200 bg-green-50 rounded-lg hover:border-green-300 hover:bg-green-100 transition-colors disabled:opacity-50"
              whileHover={!readOnly ? { scale: 1.02 } : {}}
              whileTap={!readOnly ? { scale: 0.98 } : {}}
              disabled={readOnly}
            >
              <AcademicCapIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-medium text-gray-900 mb-1">Standard</h4>
              <p className="text-xs text-gray-600">95% confidence, 80% power, 5% MDE</p>
              <p className="text-xs text-gray-500 mt-1">Industry standard, recommended</p>
            </motion.button>

            <motion.button
              onClick={() => applyPreset('aggressive')}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors disabled:opacity-50"
              whileHover={!readOnly ? { scale: 1.02 } : {}}
              whileTap={!readOnly ? { scale: 0.98 } : {}}
              disabled={readOnly}
            >
              <BoltIcon className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <h4 className="font-medium text-gray-900 mb