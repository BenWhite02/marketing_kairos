// src/components/business/campaigns/JourneyBuilder/JourneyStep.tsx

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  BoltIcon,
  ChatBubbleLeftRightIcon,
  QuestionMarkCircleIcon,
  ClockIcon,
  UserGroupIcon,
  ArrowsPointingOutIcon,
  StopIcon,
  TrashIcon,
  Cog6ToothIcon,
  PlayIcon
} from '@heroicons/react/24/outline';
import { Button } from '../../../ui/Button';
import { Card, CardBody } from '../../../ui/Card';
import { Input, Select } from '../../../ui/Input';

interface Position {
  x: number;
  y: number;
}

interface JourneyStepData {
  id: string;
  type: 'trigger' | 'moment' | 'decision' | 'delay' | 'split' | 'merge' | 'end';
  position: Position;
  title: string;
  subtitle?: string;
  config: {
    momentId?: string;
    delayDuration?: number;
    delayUnit?: 'minutes' | 'hours' | 'days';
    condition?: string;
    splitType?: 'random' | 'rules' | 'percentage';
    splitRatio?: number;
    channels?: string[];
    triggers?: string[];
  };
  inputs: string[];
  outputs: string[];
}

interface JourneyStepProps {
  step: JourneyStepData;
  isSelected: boolean;
  isDragging: boolean;
  onMouseDown: (event: React.MouseEvent) => void;
  onConfigChange: (config: Partial<JourneyStepData['config']>) => void;
  onDelete: () => void;
  onStartConnection: (stepId: string, output: string, position: Position) => void;
  onCompleteConnection: (stepId: string, input: string) => void;
  connectionMode: boolean;
  readOnly?: boolean;
}

const STEP_ICONS = {
  trigger: BoltIcon,
  moment: ChatBubbleLeftRightIcon,
  decision: QuestionMarkCircleIcon,
  delay: ClockIcon,
  split: UserGroupIcon,
  merge: ArrowsPointingOutIcon,
  end: StopIcon
};

const STEP_COLORS = {
  trigger: 'border-green-500 bg-green-50 text-green-700',
  moment: 'border-blue-500 bg-blue-50 text-blue-700',
  decision: 'border-yellow-500 bg-yellow-50 text-yellow-700',
  delay: 'border-purple-500 bg-purple-50 text-purple-700',
  split: 'border-orange-500 bg-orange-50 text-orange-700',
  merge: 'border-indigo-500 bg-indigo-50 text-indigo-700',
  end: 'border-red-500 bg-red-50 text-red-700'
};

export const JourneyStep: React.FC<JourneyStepProps> = ({
  step,
  isSelected,
  isDragging,
  onMouseDown,
  onConfigChange,
  onDelete,
  onStartConnection,
  onCompleteConnection,
  connectionMode,
  readOnly = false
}) => {
  const [showConfig, setShowConfig] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const StepIcon = STEP_ICONS[step.type];
  const stepColor = STEP_COLORS[step.type];

  const handleOutputClick = useCallback((output: string, event: React.MouseEvent) => {
    if (readOnly) return;
    
    event.stopPropagation();
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const position = {
      x: step.position.x + 120,
      y: step.position.y + 20
    };
    onStartConnection(step.id, output, position);
  }, [step.id, step.position, onStartConnection, readOnly]);

  const handleInputClick = useCallback((input: string, event: React.MouseEvent) => {
    if (readOnly || !connectionMode) return;
    
    event.stopPropagation();
    onCompleteConnection(step.id, input);
  }, [step.id, onCompleteConnection, connectionMode, readOnly]);

  const renderStepConfig = () => {
    if (!showConfig) return null;

    switch (step.type) {
      case 'moment':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Message Type
              </label>
              <Select
                value={step.config.momentId || ''}
                onChange={(e) => onConfigChange({ momentId: e.target.value })}
                className="text-xs"
              >
                <option value="">Select moment</option>
                <option value="welcome">Welcome Email</option>
                <option value="follow-up">Follow-up SMS</option>
                <option value="offer">Special Offer</option>
                <option value="reminder">Reminder Push</option>
              </Select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Channels
              </label>
              <div className="flex flex-wrap gap-1">
                {['email', 'sms', 'push', 'in-app'].map((channel) => (
                  <label key={channel} className="flex items-center text-xs">
                    <input
                      type="checkbox"
                      className="mr-1 rounded border-gray-300"
                      checked={step.config.channels?.includes(channel) || false}
                      onChange={(e) => {
                        const channels = step.config.channels || [];
                        const newChannels = e.target.checked
                          ? [...channels, channel]
                          : channels.filter(c => c !== channel);
                        onConfigChange({ channels: newChannels });
                      }}
                    />
                    {channel}
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 'delay':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Duration
              </label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={step.config.delayDuration || 1}
                  onChange={(e) => onConfigChange({ delayDuration: Number(e.target.value) })}
                  className="text-xs w-16"
                  min="1"
                />
                <Select
                  value={step.config.delayUnit || 'hours'}
                  onChange={(e) => onConfigChange({ delayUnit: e.target.value as 'minutes' | 'hours' | 'days' })}
                  className="text-xs"
                >
                  <option value="minutes">Minutes</option>
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                </Select>
              </div>
            </div>
          </div>
        );

      case 'decision':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Condition
              </label>
              <Select
                value={step.config.condition || ''}
                onChange={(e) => onConfigChange({ condition: e.target.value })}
                className="text-xs"
              >
                <option value="">Select condition</option>
                <option value="opened-email">Opened Email</option>
                <option value="clicked-link">Clicked Link</option>
                <option value="made-purchase">Made Purchase</option>
                <option value="time-passed">Time Passed</option>
              </Select>
            </div>
          </div>
        );

      case 'split':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Split Type
              </label>
              <Select
                value={step.config.splitType || 'percentage'}
                onChange={(e) => onConfigChange({ splitType: e.target.value as 'random' | 'rules' | 'percentage' })}
                className="text-xs"
              >
                <option value="percentage">Percentage</option>
                <option value="random">Random</option>
                <option value="rules">Rules-based</option>
              </Select>
            </div>
            
            {step.config.splitType === 'percentage' && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Split Ratio (Path 1)
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="range"
                    min="0"
                    max="100"
                    value={step.config.splitRatio || 50}
                    onChange={(e) => onConfigChange({ splitRatio: Number(e.target.value) })}
                    className="flex-1"
                  />
                  <span className="text-xs text-gray-600 w-8">
                    {step.config.splitRatio || 50}%
                  </span>
                </div>
              </div>
            )}
          </div>
        );

      case 'trigger':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Trigger Events
              </label>
              <div className="space-y-1">
                {['signup', 'purchase', 'cart-abandon', 'page-visit'].map((trigger) => (
                  <label key={trigger} className="flex items-center text-xs">
                    <input
                      type="checkbox"
                      className="mr-2 rounded border-gray-300"
                      checked={step.config.triggers?.includes(trigger) || false}
                      onChange={(e) => {
                        const triggers = step.config.triggers || [];
                        const newTriggers = e.target.checked
                          ? [...triggers, trigger]
                          : triggers.filter(t => t !== trigger);
                        onConfigChange({ triggers: newTriggers });
                      }}
                    />
                    {trigger.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      className="absolute"
      style={{
        left: step.position.x,
        top: step.position.y,
        zIndex: isDragging ? 1000 : isSelected ? 100 : 10
      }}
      animate={{
        scale: isDragging ? 1.05 : 1,
        rotate: isDragging ? 1 : 0
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card
        className={`
          relative cursor-move transition-all duration-200 min-w-[120px] max-w-[200px]
          ${stepColor}
          ${isSelected ? 'ring-2 ring-blue-500 shadow-lg' : 'shadow-md'}
          ${isDragging ? 'shadow-xl' : ''}
          ${isHovered ? 'shadow-lg' : ''}
        `}
        onMouseDown={onMouseDown}
      >
        <CardBody className="p-3">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <StepIcon className="w-4 h-4 flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{step.title}</div>
                {step.subtitle && (
                  <div className="text-xs opacity-75 truncate">{step.subtitle}</div>
                )}
              </div>
            </div>
            
            {!readOnly && (isSelected || isHovered) && (
              <div className="flex items-center gap-1 ml-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowConfig(!showConfig);
                  }}
                  className="w-6 h-6 p-0"
                >
                  <Cog6ToothIcon className="w-3 h-3" />
                </Button>
                
                {step.id !== 'start' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                    }}
                    className="w-6 h-6 p-0 text-red-600 hover:text-red-700"
                  >
                    <TrashIcon className="w-3 h-3" />
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Step Configuration */}
          {showConfig && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-current border-opacity-20 pt-2 mt-2"
            >
              {renderStepConfig()}
            </motion.div>
          )}

          {/* Step Status */}
          <div className="flex items-center justify-between mt-2 text-xs">
            <div className="flex items-center gap-1">
              <PlayIcon className="w-3 h-3" />
              <span>Active</span>
            </div>
            <div className="text-opacity-75">
              {step.type === 'delay' && step.config.delayDuration 
                ? `${step.config.delayDuration} ${step.config.delayUnit}`
                : step.type === 'split' && step.config.splitRatio
                ? `${step.config.splitRatio}% / ${100 - step.config.splitRatio}%`
                : step.config.channels?.length
                ? `${step.config.channels.length} channels`
                : ''}
            </div>
          </div>
        </CardBody>

        {/* Input Connection Points */}
        {step.inputs.map((input, index) => (
          <div
            key={`input-${input}`}
            className={`
              absolute w-3 h-3 bg-white border-2 border-current rounded-full
              cursor-pointer hover:scale-125 transition-transform
              ${connectionMode ? 'bg-blue-100 border-blue-500' : ''}
            `}
            style={{
              left: -6,
              top: 20 + index * 15
            }}
            onClick={(e) => handleInputClick(input, e)}
            title={`Input: ${input}`}
          />
        ))}

        {/* Output Connection Points */}
        {step.outputs.map((output, index) => (
          <div
            key={`output-${output}`}
            className={`
              absolute w-3 h-3 bg-white border-2 border-current rounded-full
              cursor-pointer hover:scale-125 transition-transform
              ${connectionMode ? 'bg-green-100 border-green-500' : ''}
            `}
            style={{
              right: -6,
              top: 20 + index * 15
            }}
            onClick={(e) => handleOutputClick(output, e)}
            title={`Output: ${output}`}
          />
        ))}

        {/* Output Labels */}
        {step.outputs.length > 1 && (
          <div className="absolute left-full ml-2 top-0 space-y-1">
            {step.outputs.map((output, index) => (
              <div
                key={`label-${output}`}
                className="text-xs bg-white px-1 py-0.5 rounded shadow text-gray-600"
                style={{ marginTop: 15 + index * 15 }}
              >
                {output === 'yes' ? '✓' : output === 'no' ? '✗' : output}
              </div>
            ))}
          </div>
        )}
      </Card>
    </motion.div>
  );
};