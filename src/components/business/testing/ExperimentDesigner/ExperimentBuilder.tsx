// src/components/business/testing/ExperimentDesigner/ExperimentBuilder.tsx

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BeakerIcon,
  ChartBarIcon,
  UserGroupIcon,
  CogIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  PlayIcon
} from '@heroicons/react/24/outline';
import { Button } from '../../../ui/Button';
import { Card, CardHeader, CardBody, CardFooter } from '../../../ui/Card';
import { Input, TextArea } from '../../../ui/Input';
import { VariantManager } from './VariantManager';
import { AudienceSelector } from './AudienceSelector';
import { GoalConfiguration } from './GoalConfiguration';
import { TrafficAllocation } from './TrafficAllocation';
import { StatisticalConfig } from './StatisticalConfig';

export interface ExperimentConfig {
  id: string;
  name: string;
  description: string;
  hypothesis: string;
  type: 'ab' | 'multivariate' | 'split';
  status: 'draft' | 'review' | 'active' | 'paused' | 'completed';
  variants: ExperimentVariant[];
  audience: AudienceConfig;
  goals: GoalConfig[];
  traffic: TrafficConfig;
  statistical: StatisticalConfig;
  duration: number; // days
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExperimentVariant {
  id: string;
  name: string;
  description: string;
  isControl: boolean;
  traffic: number; // percentage
  content: {
    type: 'moment' | 'campaign' | 'atom';
    config: any;
  };
  performance?: {
    impressions: number;
    conversions: number;
    conversionRate: number;
    confidence: number;
    isWinner?: boolean;
  };
}

export interface AudienceConfig {
  size: number;
  segments: string[];
  filters: {
    atomId: string;
    operator: string;
    value: any;
  }[];
  exclusions?: string[];
}

export interface GoalConfig {
  id: string;
  name: string;
  type: 'conversion' | 'revenue' | 'engagement' | 'retention';
  metric: string;
  target?: number;
  isPrimary: boolean;
  weight: number;
}

export interface TrafficConfig {
  allocation: number; // percentage of total traffic
  distribution: { [variantId: string]: number }; // percentage per variant
  rampUp?: {
    enabled: boolean;
    startPercent: number;
    targetPercent: number;
    durationHours: number;
  };
}

export interface StatisticalConfig {
  confidenceLevel: number; // 90, 95, 99
  minimumDetectableEffect: number; // percentage
  statisticalPower: number; // typically 80%
  sampleSize: number;
  earlyStoppingEnabled: boolean;
  significanceThreshold: number;
}

interface ExperimentBuilderProps {
  experiment?: ExperimentConfig;
  onSave: (experiment: ExperimentConfig) => void;
  onCancel: () => void;
  readOnly?: boolean;
}

const EXPERIMENT_STEPS = [
  { id: 'basic', name: 'Basic Info', icon: BeakerIcon },
  { id: 'variants', name: 'Variants', icon: DocumentDuplicateIcon },
  { id: 'audience', name: 'Audience', icon: UserGroupIcon },
  { id: 'goals', name: 'Goals', icon: ChartBarIcon },
  { id: 'traffic', name: 'Traffic', icon: ArrowRightIcon },
  { id: 'statistical', name: 'Statistical', icon: CogIcon },
];

export const ExperimentBuilder: React.FC<ExperimentBuilderProps> = ({
  experiment,
  onSave,
  onCancel,
  readOnly = false
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [config, setConfig] = useState<ExperimentConfig>(
    experiment || {
      id: `exp_${Date.now()}`,
      name: '',
      description: '',
      hypothesis: '',
      type: 'ab',
      status: 'draft',
      variants: [
        {
          id: 'control',
          name: 'Control',
          description: 'Original version',
          isControl: true,
          traffic: 50,
          content: { type: 'moment', config: {} }
        },
        {
          id: 'variant_a',
          name: 'Variant A',
          description: 'Test version',
          isControl: false,
          traffic: 50,
          content: { type: 'moment', config: {} }
        }
      ],
      audience: {
        size: 10000,
        segments: [],
        filters: []
      },
      goals: [],
      traffic: {
        allocation: 100,
        distribution: { control: 50, variant_a: 50 }
      },
      statistical: {
        confidenceLevel: 95,
        minimumDetectableEffect: 5,
        statisticalPower: 80,
        sampleSize: 0,
        earlyStoppingEnabled: true,
        significanceThreshold: 0.05
      },
      duration: 14,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  );

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateStep = useCallback((stepId: string): boolean => {
    const errors: Record<string, string> = {};

    switch (stepId) {
      case 'basic':
        if (!config.name.trim()) errors.name = 'Experiment name is required';
        if (!config.hypothesis.trim()) errors.hypothesis = 'Hypothesis is required';
        break;
      case 'variants':
        if (config.variants.length < 2) errors.variants = 'At least 2 variants required';
        if (!config.variants.some(v => v.isControl)) errors.control = 'One variant must be control';
        break;
      case 'audience':
        if (config.audience.size < 100) errors.audience = 'Minimum audience size is 100';
        break;
      case 'goals':
        if (config.goals.length === 0) errors.goals = 'At least one goal is required';
        if (!config.goals.some(g => g.isPrimary)) errors.primary = 'One goal must be primary';
        break;
      case 'traffic':
        const totalTraffic = Object.values(config.traffic.distribution).reduce((a, b) => a + b, 0);
        if (Math.abs(totalTraffic - 100) > 0.1) errors.traffic = 'Traffic must total 100%';
        break;
      case 'statistical':
        if (config.statistical.sampleSize < 100) errors.sample = 'Minimum sample size is 100';
        break;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [config]);

  const handleStepChange = useCallback((stepIndex: number) => {
    const currentStepId = EXPERIMENT_STEPS[currentStep].id;
    if (validateStep(currentStepId)) {
      setCurrentStep(stepIndex);
    }
  }, [currentStep, validateStep]);

  const handleNext = useCallback(() => {
    if (currentStep < EXPERIMENT_STEPS.length - 1) {
      handleStepChange(currentStep + 1);
    }
  }, [currentStep, handleStepChange]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const handleSave = useCallback(() => {
    const currentStepId = EXPERIMENT_STEPS[currentStep].id;
    if (validateStep(currentStepId)) {
      onSave({
        ...config,
        updatedAt: new Date()
      });
    }
  }, [config, currentStep, validateStep, onSave]);

  const handleLaunch = useCallback(() => {
    if (validateStep(EXPERIMENT_STEPS[currentStep].id)) {
      onSave({
        ...config,
        status: 'active',
        startDate: new Date(),
        updatedAt: new Date()
      });
    }
  }, [config, currentStep, validateStep, onSave]);

  const updateConfig = useCallback((updates: Partial<ExperimentConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  const renderStepContent = () => {
    const stepId = EXPERIMENT_STEPS[currentStep].id;

    switch (stepId) {
      case 'basic':
        return (
          <div className="space-y-6">
            <div>
              <Input
                label="Experiment Name"
                value={config.name}
                onChange={(e) => updateConfig({ name: e.target.value })}
                placeholder="Enter experiment name..."
                required
                error={validationErrors.name}
                disabled={readOnly}
              />
            </div>

            <div>
              <TextArea
                label="Description"
                value={config.description}
                onChange={(e) => updateConfig({ description: e.target.value })}
                placeholder="Describe the experiment..."
                rows={3}
                disabled={readOnly}
              />
            </div>

            <div>
              <TextArea
                label="Hypothesis"
                value={config.hypothesis}
                onChange={(e) => updateConfig({ hypothesis: e.target.value })}
                placeholder="State your hypothesis (e.g., 'Changing the CTA button color to red will increase click-through rates by 15%')..."
                rows={4}
                required
                error={validationErrors.hypothesis}
                disabled={readOnly}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experiment Type
                </label>
                <select
                  value={config.type}
                  onChange={(e) => updateConfig({ type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={readOnly}
                >
                  <option value="ab">A/B Test</option>
                  <option value="multivariate">Multivariate Test</option>
                  <option value="split">Split Test</option>
                </select>
              </div>

              <div>
                <Input
                  label="Duration (days)"
                  type="number"
                  value={config.duration}
                  onChange={(e) => updateConfig({ duration: parseInt(e.target.value) || 14 })}
                  min={1}
                  max={365}
                  disabled={readOnly}
                />
              </div>
            </div>
          </div>
        );

      case 'variants':
        return (
          <VariantManager
            variants={config.variants}
            onChange={(variants) => updateConfig({ variants })}
            experimentType={config.type}
            readOnly={readOnly}
            error={validationErrors.variants || validationErrors.control}
          />
        );

      case 'audience':
        return (
          <AudienceSelector
            audience={config.audience}
            onChange={(audience) => updateConfig({ audience })}
            readOnly={readOnly}
            error={validationErrors.audience}
          />
        );

      case 'goals':
        return (
          <GoalConfiguration
            goals={config.goals}
            onChange={(goals) => updateConfig({ goals })}
            readOnly={readOnly}
            error={validationErrors.goals || validationErrors.primary}
          />
        );

      case 'traffic':
        return (
          <TrafficAllocation
            traffic={config.traffic}
            variants={config.variants}
            onChange={(traffic) => updateConfig({ traffic })}
            readOnly={readOnly}
            error={validationErrors.traffic}
          />
        );

      case 'statistical':
        return (
          <StatisticalConfig
            statistical={config.statistical}
            audienceSize={config.audience.size}
            onChange={(statistical) => updateConfig({ statistical })}
            readOnly={readOnly}
            error={validationErrors.sample}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {EXPERIMENT_STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            const hasError = Object.keys(validationErrors).length > 0 && index === currentStep;

            return (
              <React.Fragment key={step.id}>
                <motion.button
                  onClick={() => !readOnly && handleStepChange(index)}
                  className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : isCompleted
                      ? 'bg-green-50 text-green-600 cursor-pointer hover:bg-green-100'
                      : hasError
                      ? 'bg-red-50 text-red-600'
                      : 'bg-gray-50 text-gray-400'
                  } ${readOnly ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  whileHover={!readOnly ? { scale: 1.05 } : {}}
                  whileTap={!readOnly ? { scale: 0.95 } : {}}
                  disabled={readOnly}
                >
                  <div className={`p-2 rounded-full ${
                    isActive
                      ? 'bg-blue-100'
                      : isCompleted
                      ? 'bg-green-100'
                      : hasError
                      ? 'bg-red-100'
                      : 'bg-gray-100'
                  }`}>
                    {isCompleted ? (
                      <CheckCircleIcon className="h-6 w-6" />
                    ) : hasError ? (
                      <ExclamationTriangleIcon className="h-6 w-6" />
                    ) : (
                      <Icon className="h-6 w-6" />
                    )}
                  </div>
                  <span className="text-xs font-medium mt-1">{step.name}</span>
                </motion.button>

                {index < EXPERIMENT_STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${
                    index < currentStep ? 'bg-green-300' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {EXPERIMENT_STEPS[currentStep].name}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Step {currentStep + 1} of {EXPERIMENT_STEPS.length}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                config.status === 'draft'
                  ? 'bg-gray-100 text-gray-800'
                  : config.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : config.status === 'paused'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {config.status.toUpperCase()}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardBody>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </CardBody>

        <CardFooter>
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={currentStep === 0 ? onCancel : handlePrevious}
              disabled={readOnly}
            >
              {currentStep === 0 ? 'Cancel' : 'Previous'}
            </Button>

            <div className="flex items-center space-x-3">
              {currentStep === EXPERIMENT_STEPS.length - 1 ? (
                <>
                  <Button
                    variant="outline"
                    onClick={handleSave}
                    disabled={readOnly}
                  >
                    Save Draft
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleLaunch}
                    disabled={readOnly || config.status === 'active'}
                    leftIcon={PlayIcon}
                  >
                    Launch Experiment
                  </Button>
                </>
              ) : (
                <Button
                  variant="primary"
                  onClick={handleNext}
                  disabled={readOnly}
                  rightIcon={ArrowRightIcon}
                >
                  Next
                </Button>
              )}
            </div>
          </div>
        </CardFooter>
      </Card>

      {/* Validation Errors */}
      {Object.keys(validationErrors).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg"
        >
          <div className="flex items-start">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
            <div>
              <h4 className="text-sm font-medium text-red-800">Please fix the following errors:</h4>
              <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                {Object.values(validationErrors).map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};