// src/components/business/campaigns/JourneyBuilder/StepPalette.tsx

import React from 'react';
import { motion } from 'framer-motion';
import {
  XMarkIcon,
  BoltIcon,
  ChatBubbleLeftRightIcon,
  QuestionMarkCircleIcon,
  ClockIcon,
  UserGroupIcon,
  ArrowsPointingOutIcon,
  StopIcon
} from '@heroicons/react/24/outline';
import { Button } from '../../../ui/Button';
import { Card, CardHeader, CardBody } from '../../../ui/Card';

interface Position {
  x: number;
  y: number;
}

interface StepPaletteProps {
  onAddStep: (type: 'trigger' | 'moment' | 'decision' | 'delay' | 'split' | 'merge' | 'end', position?: Position) => void;
  onClose: () => void;
}

interface StepTypeConfig {
  type: 'trigger' | 'moment' | 'decision' | 'delay' | 'split' | 'merge' | 'end';
  label: string;
  icon: React.ComponentType<any>;
  description: string;
  color: string;
  category: 'trigger' | 'action' | 'logic' | 'utility';
}

const STEP_TYPES: StepTypeConfig[] = [
  {
    type: 'trigger',
    label: 'Trigger',
    icon: BoltIcon,
    description: 'Start journey with an event',
    color: 'border-green-500 bg-green-50 text-green-700 hover:bg-green-100',
    category: 'trigger'
  },
  {
    type: 'moment',
    label: 'Send Moment',
    icon: ChatBubbleLeftRightIcon,
    description: 'Send message to customer',
    color: 'border-blue-500 bg-blue-50 text-blue-700 hover:bg-blue-100',
    category: 'action'
  },
  {
    type: 'decision',
    label: 'Decision Point',
    icon: QuestionMarkCircleIcon,
    description: 'Branch based on condition',
    color: 'border-yellow-500 bg-yellow-50 text-yellow-700 hover:bg-yellow-100',
    category: 'logic'
  },
  {
    type: 'delay',
    label: 'Wait',
    icon: ClockIcon,
    description: 'Add time delay',
    color: 'border-purple-500 bg-purple-50 text-purple-700 hover:bg-purple-100',
    category: 'utility'
  },
  {
    type: 'split',
    label: 'Split Audience',
    icon: UserGroupIcon,
    description: 'Divide audience into paths',
    color: 'border-orange-500 bg-orange-50 text-orange-700 hover:bg-orange-100',
    category: 'logic'
  },
  {
    type: 'merge',
    label: 'Merge Paths',
    icon: ArrowsPointingOutIcon,
    description: 'Combine multiple paths',
    color: 'border-indigo-500 bg-indigo-50 text-indigo-700 hover:bg-indigo-100',
    category: 'utility'
  },
  {
    type: 'end',
    label: 'End Journey',
    icon: StopIcon,
    description: 'Complete customer journey',
    color: 'border-red-500 bg-red-50 text-red-700 hover:bg-red-100',
    category: 'utility'
  }
];

const CATEGORIES = [
  { key: 'trigger', label: 'Triggers', icon: '🚀' },
  { key: 'action', label: 'Actions', icon: '📧' },
  { key: 'logic', label: 'Logic', icon: '🤔' },
  { key: 'utility', label: 'Utilities', icon: '🛠️' }
];

export const StepPalette: React.FC<StepPaletteProps> = ({ onAddStep, onClose }) => {
  const handleStepClick = (stepType: StepTypeConfig['type']) => {
    onAddStep(stepType);
  };

  const stepsByCategory = STEP_TYPES.reduce((acc, step) => {
    if (!acc[step.category]) {
      acc[step.category] = [];
    }
    acc[step.category].push(step);
    return acc;
  }, {} as Record<string, StepTypeConfig[]>);

  return (
    <motion.div
      initial={{ opacity: 0, x: -300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -300 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="absolute left-4 top-16 z-20 w-80"
    >
      <Card className="shadow-xl border-2 border-gray-200">
        <CardHeader className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Add Journey Step</h3>
              <p className="text-sm text-gray-600">Choose a step type to add to your journey</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} icon={XMarkIcon} />
          </div>
        </CardHeader>

        <CardBody className="p-0 max-h-96 overflow-y-auto">
          {CATEGORIES.map((category) => {
            const categorySteps = stepsByCategory[category.key] || [];
            if (categorySteps.length === 0) return null;

            return (
              <div key={category.key} className="p-4 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">{category.icon}</span>
                  <h4 className="font-medium text-gray-900">{category.label}</h4>
                </div>

                <div className="space-y-2">
                  {categorySteps.map((step) => {
                    const StepIcon = step.icon;
                    
                    return (
                      <motion.button
                        key={step.type}
                        onClick={() => handleStepClick(step.type)}
                        className={`
                          w-full p-3 rounded-lg border-2 transition-all duration-200 text-left
                          ${step.color}
                          hover:shadow-md hover:scale-[1.02]
                          active:scale-95
                        `}
                        whileHover={{ y: -1 }}
                        whileTap={{ y: 0 }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            <StepIcon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm">{step.label}</div>
                            <div className="text-xs opacity-75 mt-1">{step.description}</div>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </CardBody>

        {/* Quick Tips */}
        <div className="p-4 bg-blue-50 border-t border-blue-200">
          <h5 className="font-medium text-blue-900 text-sm mb-2">💡 Quick Tips</h5>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Drag steps around the canvas to organize your journey</li>
            <li>• Click connection points to link steps together</li>
            <li>• Configure each step by clicking the settings icon</li>
            <li>• Use decision points to create branching logic</li>
          </ul>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <h5 className="font-medium text-gray-900 text-sm mb-2">⌨️ Keyboard Shortcuts</h5>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Delete</span>
              <kbd className="bg-white px-1 rounded">Del</kbd>
            </div>
            <div className="flex justify-between">
              <span>Pan</span>
              <kbd className="bg-white px-1 rounded">Ctrl+Drag</kbd>
            </div>
            <div className="flex justify-between">
              <span>Zoom</span>
              <kbd className="bg-white px-1 rounded">Wheel</kbd>
            </div>
            <div className="flex justify-between">
              <span>Fit View</span>
              <kbd className="bg-white px-1 rounded">F</kbd>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};