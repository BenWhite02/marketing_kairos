// src/components/business/testing/TestManagement/TestCard.tsx

import React from 'react';
import { motion } from 'framer-motion';
import {
  PlayIcon,
  PauseIcon,
  StopIcon,
  PencilIcon,
  TrashIcon,
  ChartBarIcon,
  TrophyIcon,
  ClockIcon,
  UserGroupIcon,
  BeakerIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { Button } from '../../../ui/Button';
import { Card, CardHeader, CardBody, CardFooter } from '../../../ui/Card';
import type { ExperimentConfig } from '../ExperimentDesigner/ExperimentBuilder';

interface TestCardProps {
  experiment: ExperimentConfig;
  viewMode: 'grid' | 'list';
  selected: boolean;
  onSelect: (selected: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
  onViewResults: () => void;
  readOnly?: boolean;
}

const STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-800 border-gray-200',
  review: 'bg-blue-100 text-blue-800 border-blue-200',
  active: 'bg-green-100 text-green-800 border-green-200',
  paused: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  completed: 'bg-purple-100 text-purple-800 border-purple-200'
};

const STATUS_ICONS = {
  draft: ClockIcon,
  review: BeakerIcon,
  active: PlayIcon,
  paused: PauseIcon,
  completed: TrophyIcon
};

const EXPERIMENT_TYPE_LABELS = {
  ab: 'A/B Test',
  multivariate: 'Multivariate',
  split: 'Split Test'
};

export const TestCard: React.FC<TestCardProps> = ({
  experiment,
  viewMode,
  selected,
  onSelect,
  onEdit,
  onDelete,
  onStart,
  onPause,
  onStop,
  onViewResults,
  readOnly = false
}) => {
  const StatusIcon = STATUS_ICONS[experiment.status];
  const winningVariant = experiment.variants.find(v => v.performance?.isWinner);
  const controlVariant = experiment.variants.find(v => v.isControl);
  const hasResults = experiment.variants.some(v => v.performance);
  const isActive = experiment.status === 'active';
  const isCompleted = experiment.status === 'completed';

  // Calculate days running or remaining
  const getDaysInfo = () => {
    if (experiment.startDate) {
      const now = new Date();
      const start = new Date(experiment.startDate);
      const daysRunning = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      
      if (isActive) {
        const remaining = Math.max(0, experiment.duration - daysRunning);
        return `${remaining} days left`;
      } else if (isCompleted) {
        return `Ran ${daysRunning} days`;
      }
    }
    return `${experiment.duration} days planned`;
  };

  // Calculate lift percentage if there's a winner
  const getLiftPercentage = () => {
    if (winningVariant && controlVariant && winningVariant.performance && controlVariant.performance) {
      const lift = ((winningVariant.performance.conversionRate - controlVariant.performance.conversionRate) / controlVariant.performance.conversionRate) * 100;
      return lift.toFixed(1);
    }
    return null;
  };

  const getActionButtons = () => {
    const buttons = [];

    if (experiment.status === 'draft') {
      buttons.push(
        <Button
          key="start"
          variant="primary"
          size="sm"
          onClick={onStart}
          leftIcon={PlayIcon}
          disabled={readOnly}
        >
          Start
        </Button>
      );
    }

    if (experiment.status === 'active') {
      buttons.push(
        <Button
          key="pause"
          variant="outline"
          size="sm"
          onClick={onPause}
          leftIcon={PauseIcon}
          disabled={readOnly}
        >
          Pause
        </Button>
      );
      buttons.push(
        <Button
          key="stop"
          variant="outline"
          size="sm"
          onClick={onStop}
          leftIcon={StopIcon}
          disabled={readOnly}
        >
          Stop
        </Button>
      );
    }

    if (experiment.status === 'paused') {
      buttons.push(
        <Button
          key="resume"
          variant="primary"
          size="sm"
          onClick={onStart}
          leftIcon={PlayIcon}
          disabled={readOnly}
        >
          Resume
        </Button>
      );
    }

    if (hasResults || isCompleted) {
      buttons.push(
        <Button
          key="results"
          variant="outline"
          size="sm"
          onClick={onViewResults}
          leftIcon={ChartBarIcon}
        >
          View Results
        </Button>
      );
    }

    return buttons;
  };

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return 'text-gray-500';
    if (confidence >= 95) return 'text-green-600';
    if (confidence >= 90) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (viewMode === 'list') {
    return (
      <Card className={`transition-all duration-200 hover:shadow-md ${selected ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}>
        <CardBody>
          <div className="flex items-center space-x-4">
            {/* Selection Checkbox */}
            <input
              type="checkbox"
              checked={selected}
              onChange={(e) => onSelect(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            
            {/* Main Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-1">
                <h3 className="text-lg font-medium text-gray-900 truncate">
                  {experiment.name}
                </h3>
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[experiment.status]}`}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {experiment.status.toUpperCase()}
                </div>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {EXPERIMENT_TYPE_LABELS[experiment.type]}
                </span>
              </div>
              <p className="text-sm text-gray-600 truncate">
                {experiment.description}
              </p>
            </div>

            {/* Metrics */}
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <div className="text-center">
                <div className="font-medium text-gray-900">{experiment.variants.length}</div>
                <div className="text-xs">Variants</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-gray-900">{(experiment.audience.size / 1000).toFixed(0)}K</div>
                <div className="text-xs">Audience</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-gray-900">{getDaysInfo()}</div>
                <div className="text-xs">Duration</div>
              </div>
              {winningVariant && (
                <div className="text-center">
                  <div className="font-medium text-green-600 flex items-center">
                    <TrophyIcon className="h-3 w-3 mr-1" />
                    +{getLiftPercentage()}%
                  </div>
                  <div className="text-xs">Lift</div>
                </div>
              )}
              {hasResults && (
                <div className="text-center">
                  <div className={`font-medium ${getConfidenceColor(winningVariant?.performance?.confidence)}`}>
                    {winningVariant?.performance?.confidence.toFixed(0)}%
                  </div>
                  <div className="text-xs">Confidence</div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              {getActionButtons()}
              <Button
                variant="ghost"
                size="sm"
                onClick={onEdit}
                disabled={readOnly}
                title="Edit experiment"
              >
                <PencilIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                disabled={readOnly || isActive}
                className="text-red-600 hover:text-red-700 disabled:text-gray-400"
                title="Delete experiment"
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  // Grid view
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Card className={`h-full flex flex-col transition-all duration-200 hover:shadow-lg ${
        selected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
      }`}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1 min-w-0">
              <input
                type="checkbox"
                checked={selected}
                onChange={(e) => onSelect(e.target.checked)}
                className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-medium text-gray-900 mb-1 line-clamp-2">
                  {experiment.name}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {experiment.description}
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {EXPERIMENT_TYPE_LABELS[experiment.type]}
                  </span>
                  <span className="text-xs text-gray-500">
                    ID: {experiment.id}
                  </span>
                </div>
              </div>
            </div>
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[experiment.status]}`}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {experiment.status.toUpperCase()}
            </div>
          </div>
        </CardHeader>

        <CardBody className="flex-1">
          <div className="space-y-4">
            {/* Hypothesis */}
            <div>
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                Hypothesis
              </div>
              <p className="text-sm text-gray-700 line-clamp-3">
                {experiment.hypothesis}
              </p>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-2 bg-gray-50 rounded">
                <div className="flex items-center text-xs text-gray-500 mb-1">
                  <BeakerIcon className="h-3 w-3 mr-1" />
                  Variants
                </div>
                <div className="text-sm font-medium text-gray-900">
                  {experiment.variants.length} variants
                </div>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <div className="flex items-center text-xs text-gray-500 mb-1">
                  <UserGroupIcon className="h-3 w-3 mr-1" />
                  Audience
                </div>
                <div className="text-sm font-medium text-gray-900">
                  {(experiment.audience.size / 1000).toFixed(0)}K users
                </div>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <div className="flex items-center text-xs text-gray-500 mb-1">
                  <ClockIcon className="h-3 w-3 mr-1" />
                  Duration
                </div>
                <div className="text-sm font-medium text-gray-900">
                  {getDaysInfo()}
                </div>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <div className="flex items-center text-xs text-gray-500 mb-1">
                  <TrophyIcon className="h-3 w-3 mr-1" />
                  Goals
                </div>
                <div className="text-sm font-medium text-gray-900">
                  {experiment.goals.length} goal(s)
                </div>
              </div>
            </div>

            {/* Performance Summary */}
            {hasResults && (
              <div className="p-3 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                    Performance
                  </div>
                  {winningVariant && (
                    <div className="flex items-center text-xs text-green-600 font-medium">
                      <TrophyIcon className="h-3 w-3 mr-1" />
                      Winner Detected
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  {experiment.variants.slice(0, 3).map((variant) => (
                    <div key={variant.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          variant.performance?.isWinner 
                            ? 'bg-green-500' 
                            : variant.isControl 
                            ? 'bg-blue-500' 
                            : 'bg-gray-400'
                        }`} />
                        <span className="text-gray-700 truncate">
                          {variant.name}
                          {variant.isControl && (
                            <span className="text-xs text-blue-600 ml-1">(Control)</span>
                          )}
                        </span>
                        {variant.performance?.isWinner && (
                          <TrophyIcon className="h-3 w-3 text-green-500 ml-1" />
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">
                          {variant.performance?.conversionRate.toFixed(1)}%
                        </div>
                        <div className={`text-xs ${getConfidenceColor(variant.performance?.confidence)}`}>
                          {variant.performance?.confidence.toFixed(0)}% conf.
                        </div>
                      </div>
                    </div>
                  ))}
                  {experiment.variants.length > 3 && (
                    <div className="text-xs text-gray-500 text-center pt-1">
                      +{experiment.variants.length - 3} more variants
                    </div>
                  )}
                  {winningVariant && getLiftPercentage() && (
                    <div className="pt-2 mt-2 border-t border-green-200">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Improvement:</span>
                        <div className="flex items-center text-sm font-medium text-green-600">
                          <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
                          +{getLiftPercentage()}%
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Traffic Allocation */}
            <div>
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Traffic Allocation
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${experiment.traffic.allocation}%` }}
                />
              </div>
              <div className="text-xs text-gray-500">
                {experiment.traffic.allocation}% of total traffic
              </div>
            </div>

            {/* Status Indicator */}
            {isActive && (
              <div className="flex items-center p-2 bg-green-50 border border-green-200 rounded">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                <span className="text-xs text-green-700 font-medium">
                  Experiment is currently running
                </span>
              </div>
            )}

            {experiment.status === 'draft' && (
              <div className="flex items-center p-2 bg-yellow-50 border border-yellow-200 rounded">
                <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500 mr-2" />
                <span className="text-xs text-yellow-700 font-medium">
                  Ready to launch when you're ready
                </span>
              </div>
            )}
          </div>
        </CardBody>

        <CardFooter className="border-t border-gray-100">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-2">
              {getActionButtons()}
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={onEdit}
                disabled={readOnly}
                title="Edit experiment"
              >
                <PencilIcon className="h-4 w-4" />
              </Button>
              {hasResults && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onViewResults}
                  title="View detailed results"
                >
                  <EyeIcon className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                disabled={readOnly || isActive}
                className="text-red-600 hover:text-red-700 disabled:text-gray-400"
                title={isActive ? "Cannot delete active experiment" : "Delete experiment"}
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Footer Metadata */}
          <div className="w-full pt-2 mt-2 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div>
                Created: {experiment.createdAt.toLocaleDateString()}
              </div>
              <div>
                {experiment.startDate && (
                  <>Started: {experiment.startDate.toLocaleDateString()}</>
                )}
                {experiment.endDate && (
                  <>Ended: {experiment.endDate.toLocaleDateString()}</>
                )}
                {!experiment.startDate && !experiment.endDate && (
                  <>Last updated: {experiment.updatedAt.toLocaleDateString()}</>
                )}
              </div>
            </div>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};