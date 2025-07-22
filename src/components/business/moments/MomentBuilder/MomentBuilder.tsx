// src/components/business/moments/MomentBuilder/MomentBuilder.tsx

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  UsersIcon,
  SparklesIcon,
  DocumentDuplicateIcon,
  ArrowLeftIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { Button } from '../../../ui/Button';
import { Card, CardHeader, CardBody, CardFooter } from '../../../ui/Card';
import { Input, TextArea } from '../../../ui/Input';
import { Modal } from '../../../ui/Modal';
import { ContentEditor } from './ContentEditor';
import { ChannelSelector } from './ChannelSelector';
import { AudienceBuilder } from './AudienceBuilder';
import { SchedulingTool } from './SchedulingTool';
import { PersonalizationRules } from './PersonalizationRules';

// Types
interface MomentConfig {
  id: string;
  name: string;
  description: string;
  type: 'immediate' | 'scheduled' | 'triggered' | 'behavioral';
  status: 'draft' | 'review' | 'active' | 'paused' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  channels: ChannelConfig[];
  audience: AudienceConfig;
  content: ContentConfig;
  scheduling: SchedulingConfig;
  personalization: PersonalizationConfig;
  testing: TestingConfig;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

interface ChannelConfig {
  type: 'email' | 'sms' | 'push' | 'web' | 'in_app';
  enabled: boolean;
  content: any;
  settings: any;
}

interface AudienceConfig {
  name: string;
  description: string;
  atoms: string[];
  estimatedSize: number;
  rules: any[];
}

interface ContentConfig {
  subject?: string;
  title: string;
  body: string;
  cta: string;
  assets: string[];
  variables: string[];
}

interface SchedulingConfig {
  type: 'immediate' | 'scheduled' | 'recurring';
  startDate?: string;
  endDate?: string;
  timezone: string;
  frequency?: 'daily' | 'weekly' | 'monthly';
  triggers: TriggerConfig[];
}

interface TriggerConfig {
  id: string;
  type: 'event' | 'behavior' | 'time' | 'condition';
  name: string;
  conditions: any[];
}

interface PersonalizationConfig {
  enabled: boolean;
  rules: PersonalizationRule[];
  variables: PersonalizationVariable[];
}

interface PersonalizationRule {
  id: string;
  name: string;
  condition: string;
  content: any;
}

interface PersonalizationVariable {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean';
  defaultValue: any;
}

interface TestingConfig {
  enabled: boolean;
  type: 'ab' | 'multivariate';
  variants: TestVariant[];
  allocation: number[];
}

interface TestVariant {
  id: string;
  name: string;
  content: any;
  weight: number;
}

interface MomentBuilderProps {
  moment?: MomentConfig;
  onSave: (moment: MomentConfig) => void;
  onCancel: () => void;
  onPreview: (moment: MomentConfig, channel: string) => void;
  onTest: (moment: MomentConfig) => void;
  availableChannels: string[];
  availableAtoms: any[];
  templates: any[];
  readOnly?: boolean;
}

const MomentBuilder: React.FC<MomentBuilderProps> = ({
  moment,
  onSave,
  onCancel,
  onPreview,
  onTest,
  availableChannels = ['email', 'sms', 'push', 'web', 'in_app'],
  availableAtoms = [],
  templates = [],
  readOnly = false
}) => {
  // State Management
  const [activeTab, setActiveTab] = useState<string>('content');
  const [currentMoment, setCurrentMoment] = useState<MomentConfig>(
    moment || {
      id: `moment_${Date.now()}`,
      name: '',
      description: '',
      type: 'immediate',
      status: 'draft',
      priority: 'medium',
      channels: [
        {
          type: 'email',
          enabled: true,
          content: {},
          settings: {}
        }
      ],
      audience: {
        name: '',
        description: '',
        atoms: [],
        estimatedSize: 0,
        rules: []
      },
      content: {
        title: '',
        body: '',
        cta: '',
        assets: [],
        variables: []
      },
      scheduling: {
        type: 'immediate',
        timezone: 'UTC',
        triggers: []
      },
      personalization: {
        enabled: false,
        rules: [],
        variables: []
      },
      testing: {
        enabled: false,
        type: 'ab',
        variants: [],
        allocation: [100]
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current-user'
    }
  );

  const [showPreview, setShowPreview] = useState(false);
  const [previewChannel, setPreviewChannel] = useState('email');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Tabs configuration
  const tabs = [
    {
      id: 'content',
      name: 'Content',
      icon: DocumentDuplicateIcon,
      description: 'Create your moment content'
    },
    {
      id: 'channels',
      name: 'Channels',
      icon: SparklesIcon,
      description: 'Select delivery channels'
    },
    {
      id: 'audience',
      name: 'Audience',
      icon: UsersIcon,
      description: 'Define target audience'
    },
    {
      id: 'scheduling',
      name: 'Scheduling',
      icon: ClockIcon,
      description: 'Set timing and triggers'
    },
    {
      id: 'personalization',
      name: 'Personalization',
      icon: SparklesIcon,
      description: 'Add dynamic content'
    },
    {
      id: 'testing',
      name: 'A/B Testing',
      icon: Cog6ToothIcon,
      description: 'Configure testing variants'
    }
  ];

  // Validation
  const validateMoment = useCallback((): string[] => {
    const errors: string[] = [];
    
    if (!currentMoment.name.trim()) {
      errors.push('Moment name is required');
    }
    
    if (!currentMoment.content.title.trim()) {
      errors.push('Content title is required');
    }
    
    if (!currentMoment.content.body.trim()) {
      errors.push('Content body is required');
    }
    
    if (currentMoment.channels.filter(c => c.enabled).length === 0) {
      errors.push('At least one channel must be enabled');
    }
    
    if (currentMoment.audience.atoms.length === 0) {
      errors.push('Audience targeting is required');
    }
    
    if (currentMoment.type === 'scheduled' && !currentMoment.scheduling.startDate) {
      errors.push('Scheduled moments require a start date');
    }
    
    return errors;
  }, [currentMoment]);

  // Event Handlers
  const handleSave = useCallback(async () => {
    const errors = validateMoment();
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    setIsLoading(true);
    try {
      const updatedMoment = {
        ...currentMoment,
        updatedAt: new Date().toISOString()
      };
      await onSave(updatedMoment);
    } finally {
      setIsLoading(false);
    }
  }, [currentMoment, validateMoment, onSave]);

  const handlePreview = useCallback((channel: string) => {
    setPreviewChannel(channel);
    setShowPreview(true);
    onPreview(currentMoment, channel);
  }, [currentMoment, onPreview]);

  const handleTest = useCallback(() => {
    onTest(currentMoment);
  }, [currentMoment, onTest]);

  const updateMoment = useCallback((updates: Partial<MomentConfig>) => {
    setCurrentMoment(prev => ({
      ...prev,
      ...updates,
      updatedAt: new Date().toISOString()
    }));
    setValidationErrors([]);
  }, []);

  // Computed values
  const completionPercentage = useMemo(() => {
    let completed = 0;
    let total = 6;
    
    if (currentMoment.name && currentMoment.content.title && currentMoment.content.body) completed++;
    if (currentMoment.channels.some(c => c.enabled)) completed++;
    if (currentMoment.audience.atoms.length > 0) completed++;
    if (currentMoment.type !== 'immediate' || currentMoment.scheduling.triggers.length > 0) completed++;
    if (currentMoment.personalization.enabled) completed++;
    if (currentMoment.testing.enabled) completed++;
    
    return Math.round((completed / total) * 100);
  }, [currentMoment]);

  const enabledChannels = useMemo(() => {
    return currentMoment.channels.filter(c => c.enabled);
  }, [currentMoment.channels]);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {moment ? 'Edit Moment' : 'Create New Moment'}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {completionPercentage}% complete • {enabledChannels.length} channel(s) selected
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Progress Bar */}
            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-600"
                initial={{ width: 0 }}
                animate={{ width: `${completionPercentage}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            
            {/* Action Buttons */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePreview('email')}
              disabled={!currentMoment.content.body}
            >
              <EyeIcon className="w-4 h-4 mr-2" />
              Preview
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleTest}
              disabled={validationErrors.length > 0}
            >
              Test
            </Button>
            
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              loading={isLoading}
              disabled={readOnly}
            >
              <CheckIcon className="w-4 h-4 mr-2" />
              Save Moment
            </Button>
          </div>
        </div>
        
        {/* Validation Errors */}
        <AnimatePresence>
          {validationErrors.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg"
            >
              <div className="flex">
                <XMarkIcon className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">Please fix the following issues:</p>
                  <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      w-full flex items-center px-3 py-3 text-left rounded-lg transition-colors
                      ${isActive 
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' 
                        : 'text-gray-700 hover:bg-gray-50'
                      }
                    `}
                  >
                    <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                    <div>
                      <div className="font-medium">{tab.name}</div>
                      <div className="text-xs text-gray-500 mt-1">{tab.description}</div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Basic Information */}
                {activeTab === 'content' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <h3 className="text-lg font-medium">Basic Information</h3>
                      </CardHeader>
                      <CardBody className="space-y-4">
                        <Input
                          label="Moment Name"
                          value={currentMoment.name}
                          onChange={(e) => updateMoment({ name: e.target.value })}
                          placeholder="Enter moment name"
                          required
                          disabled={readOnly}
                        />
                        
                        <TextArea
                          label="Description"
                          value={currentMoment.description}
                          onChange={(e) => updateMoment({ description: e.target.value })}
                          placeholder="Describe this moment's purpose"
                          rows={3}
                          disabled={readOnly}
                        />
                        
                        <div className="grid grid-cols-2 gap-4">
                          <Input
                            type="select"
                            label="Type"
                            value={currentMoment.type}
                            onChange={(e) => updateMoment({ type: e.target.value as any })}
                            disabled={readOnly}
                          >
                            <option value="immediate">Immediate</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="triggered">Event Triggered</option>
                            <option value="behavioral">Behavioral</option>
                          </Input>
                          
                          <Input
                            type="select"
                            label="Priority"
                            value={currentMoment.priority}
                            onChange={(e) => updateMoment({ priority: e.target.value as any })}
                            disabled={readOnly}
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                          </Input>
                        </div>
                      </CardBody>
                    </Card>
                    
                    <ContentEditor
                      content={currentMoment.content}
                      onChange={(content) => updateMoment({ content })}
                      templates={templates}
                      readOnly={readOnly}
                    />
                  </div>
                )}

                {/* Channel Selection */}
                {activeTab === 'channels' && (
                  <ChannelSelector
                    channels={currentMoment.channels}
                    availableChannels={availableChannels}
                    onChange={(channels) => updateMoment({ channels })}
                    onPreview={handlePreview}
                    readOnly={readOnly}
                  />
                )}

                {/* Audience Builder */}
                {activeTab === 'audience' && (
                  <AudienceBuilder
                    audience={currentMoment.audience}
                    availableAtoms={availableAtoms}
                    onChange={(audience) => updateMoment({ audience })}
                    readOnly={readOnly}
                  />
                )}

                {/* Scheduling */}
                {activeTab === 'scheduling' && (
                  <SchedulingTool
                    scheduling={currentMoment.scheduling}
                    momentType={currentMoment.type}
                    onChange={(scheduling) => updateMoment({ scheduling })}
                    readOnly={readOnly}
                  />
                )}

                {/* Personalization */}
                {activeTab === 'personalization' && (
                  <PersonalizationRules
                    personalization={currentMoment.personalization}
                    availableAtoms={availableAtoms}
                    onChange={(personalization) => updateMoment({ personalization })}
                    readOnly={readOnly}
                  />
                )}

                {/* A/B Testing */}
                {activeTab === 'testing' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <h3 className="text-lg font-medium">A/B Testing Configuration</h3>
                      </CardHeader>
                      <CardBody>
                        <div className="text-center py-8 text-gray-500">
                          <Cog6ToothIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                          <p>A/B Testing configuration will be available in Phase 2</p>
                          <p className="text-sm mt-2">Configure test variants and traffic allocation</p>
                        </div>
                      </CardBody>
                    </Card>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <Modal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title={`Preview - ${previewChannel.charAt(0).toUpperCase() + previewChannel.slice(1)}`}
        size="lg"
      >
        <div className="p-6">
          <div className="text-center text-gray-500">
            <EyeIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Preview functionality will be available in Phase 2</p>
            <p className="text-sm mt-2">Real-time preview across all channels</p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MomentBuilder;