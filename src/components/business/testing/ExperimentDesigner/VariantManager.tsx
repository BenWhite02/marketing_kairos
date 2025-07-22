// src/components/business/testing/ExperimentDesigner/VariantManager.tsx

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  EyeIcon,
  PencilIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  SwatchIcon,
  CodeBracketIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { Button } from '../../../ui/Button';
import { Card, CardHeader, CardBody, CardFooter } from '../../../ui/Card';
import { Input, TextArea } from '../../../ui/Input';
import { Modal } from '../../../ui/Modal';
import type { ExperimentVariant } from './ExperimentBuilder';

interface VariantManagerProps {
  variants: ExperimentVariant[];
  onChange: (variants: ExperimentVariant[]) => void;
  experimentType: 'ab' | 'multivariate' | 'split';
  readOnly?: boolean;
  error?: string;
}

interface VariantEditorModalProps {
  variant: ExperimentVariant | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (variant: ExperimentVariant) => void;
  readOnly?: boolean;
}

const VARIANT_COLORS = [
  'bg-blue-100 text-blue-800 border-blue-200',
  'bg-green-100 text-green-800 border-green-200',
  'bg-purple-100 text-purple-800 border-purple-200',
  'bg-orange-100 text-orange-800 border-orange-200',
  'bg-pink-100 text-pink-800 border-pink-200',
  'bg-indigo-100 text-indigo-800 border-indigo-200',
  'bg-yellow-100 text-yellow-800 border-yellow-200',
  'bg-red-100 text-red-800 border-red-200',
];

const CONTENT_TYPES = [
  {
    id: 'moment',
    name: 'Moment',
    description: 'Test different moment configurations',
    icon: SwatchIcon,
    fields: [
      { key: 'subject', label: 'Subject Line', type: 'text' },
      { key: 'content', label: 'Content', type: 'textarea' },
      { key: 'cta', label: 'Call to Action', type: 'text' },
      { key: 'channel', label: 'Channel', type: 'select', options: ['email', 'sms', 'push', 'web'] }
    ]
  },
  {
    id: 'campaign',
    name: 'Campaign',
    description: 'Test different campaign strategies',
    icon: CodeBracketIcon,
    fields: [
      { key: 'strategy', label: 'Strategy', type: 'text' },
      { key: 'budget', label: 'Budget', type: 'number' },
      { key: 'duration', label: 'Duration', type: 'number' },
      { key: 'channels', label: 'Channels', type: 'multiselect', options: ['email', 'sms', 'social', 'display'] }
    ]
  },
  {
    id: 'atom',
    name: 'Atom Configuration',
    description: 'Test different atom rules',
    icon: PhotoIcon,
    fields: [
      { key: 'rule', label: 'Rule Logic', type: 'textarea' },
      { key: 'threshold', label: 'Threshold', type: 'number' },
      { key: 'weight', label: 'Weight', type: 'number' }
    ]
  }
];

const VariantEditorModal: React.FC<VariantEditorModalProps> = ({
  variant,
  isOpen,
  onClose,
  onSave,
  readOnly = false
}) => {
  const [editingVariant, setEditingVariant] = useState<ExperimentVariant>(
    variant || {
      id: `variant_${Date.now()}`,
      name: '',
      description: '',
      isControl: false,
      traffic: 0,
      content: { type: 'moment', config: {} }
    }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSave = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!editingVariant.name.trim()) {
      newErrors.name = 'Variant name is required';
    }

    if (!editingVariant.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (editingVariant.traffic < 0 || editingVariant.traffic > 100) {
      newErrors.traffic = 'Traffic must be between 0 and 100';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSave(editingVariant);
      onClose();
    }
  }, [editingVariant, onSave, onClose]);

  const updateVariant = useCallback((updates: Partial<ExperimentVariant>) => {
    setEditingVariant(prev => ({ ...prev, ...updates }));
  }, []);

  const updateContent = useCallback((config: any) => {
    setEditingVariant(prev => ({
      ...prev,
      content: { ...prev.content, config }
    }));
  }, []);

  const selectedContentType = CONTENT_TYPES.find(ct => ct.id === editingVariant.content.type);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="large">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            {variant ? 'Edit Variant' : 'Create Variant'}
          </h3>
          <Button variant="ghost" onClick={onClose}>
            Ã—
          </Button>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Variant Name"
              value={editingVariant.name}
              onChange={(e) => updateVariant({ name: e.target.value })}
              placeholder="e.g., Red Button, New Layout..."
              required
              error={errors.name}
              disabled={readOnly}
            />

            <Input
              label="Traffic Allocation (%)"
              type="number"
              value={editingVariant.traffic}
              onChange={(e) => updateVariant({ traffic: parseFloat(e.target.value) || 0 })}
              min={0}
              max={100}
              step={0.1}
              error={errors.traffic}
              disabled={readOnly}
            />
          </div>

          <TextArea
            label="Description"
            value={editingVariant.description}
            onChange={(e) => updateVariant({ description: e.target.value })}
            placeholder="Describe what makes this variant different..."
            rows={3}
            required
            error={errors.description}
            disabled={readOnly}
          />

          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={editingVariant.isControl}
                onChange={(e) => updateVariant({ isControl: e.target.checked })}
                className="mr-2"
                disabled={readOnly}
              />
              <span className="text-sm font-medium text-gray-700">
                This is the control variant
              </span>
            </label>
          </div>

          {/* Content Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Content Type
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {CONTENT_TYPES.map((contentType) => {
                const Icon = contentType.icon;
                const isSelected = editingVariant.content.type === contentType.id;

                return (
                  <motion.button
                    key={contentType.id}
                    onClick={() => !readOnly && updateVariant({ 
                      content: { type: contentType.id as any, config: {} } 
                    })}
                    className={`p-4 border-2 rounded-lg text-left transition-colors ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    } ${readOnly ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                    whileHover={!readOnly ? { scale: 1.02 } : {}}
                    whileTap={!readOnly ? { scale: 0.98 } : {}}
                    disabled={readOnly}
                    type="button"
                  >
                    <div className="flex items-center mb-2">
                      <Icon className={`h-5 w-5 mr-2 ${
                        isSelected ? 'text-blue-600' : 'text-gray-500'
                      }`} />
                      <span className={`font-medium ${
                        isSelected ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {contentType.name}
                      </span>
                    </div>
                    <p className={`text-xs ${
                      isSelected ? 'text-blue-700' : 'text-gray-600'
                    }`}>
                      {contentType.description}
                    </p>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Content Configuration */}
          {selectedContentType && (
            <Card>
              <CardHeader>
                <h4 className="text-md font-medium text-gray-900">
                  {selectedContentType.name} Configuration
                </h4>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedContentType.fields.map((field) => {
                    const value = editingVariant.content.config[field.key] || '';

                    if (field.type === 'textarea') {
                      return (
                        <div key={field.key} className="md:col-span-2">
                          <TextArea
                            label={field.label}
                            value={value}
                            onChange={(e) => updateContent({
                              ...editingVariant.content.config,
                              [field.key]: e.target.value
                            })}
                            rows={3}
                            disabled={readOnly}
                          />
                        </div>
                      );
                    }

                    if (field.type === 'select') {
                      return (
                        <div key={field.key}>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {field.label}
                          </label>
                          <select
                            value={value}
                            onChange={(e) => updateContent({
                              ...editingVariant.content.config,
                              [field.key]: e.target.value
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={readOnly}
                          >
                            <option value="">Select {field.label}</option>
                            {field.options?.map((option) => (
                              <option key={option} value={option}>
                                {option.charAt(0).toUpperCase() + option.slice(1)}
                              </option>
                            ))}
                          </select>
                        </div>
                      );
                    }

                    return (
                      <Input
                        key={field.key}
                        label={field.label}
                        type={field.type}
                        value={value}
                        onChange={(e) => updateContent({
                          ...editingVariant.content.config,
                          [field.key]: e.target.value
                        })}
                        disabled={readOnly}
                      />
                    );
                  })}
                </div>
              </CardBody>
            </Card>
          )}
        </div>

        <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={readOnly}>
            {variant ? 'Update Variant' : 'Create Variant'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export const VariantManager: React.FC<VariantManagerProps> = ({
  variants,
  onChange,
  experimentType,
  readOnly = false,
  error
}) => {
  const [editingVariant, setEditingVariant] = useState<ExperimentVariant | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateVariant = useCallback(() => {
    setEditingVariant(null);
    setIsModalOpen(true);
  }, []);

  const handleEditVariant = useCallback((variant: ExperimentVariant) => {
    setEditingVariant(variant);
    setIsModalOpen(true);
  }, []);

  const handleDeleteVariant = useCallback((variantId: string) => {
    const updatedVariants = variants.filter(v => v.id !== variantId);
    onChange(updatedVariants);
  }, [variants, onChange]);

  const handleDuplicateVariant = useCallback((variant: ExperimentVariant) => {
    const duplicatedVariant: ExperimentVariant = {
      ...variant,
      id: `variant_${Date.now()}`,
      name: `${variant.name} (Copy)`,
      isControl: false,
      traffic: 0
    };
    onChange([...variants, duplicatedVariant]);
  }, [variants, onChange]);

  const handleSaveVariant = useCallback((variant: ExperimentVariant) => {
    if (editingVariant) {
      // Update existing variant
      const updatedVariants = variants.map(v => 
        v.id === variant.id ? variant : v
      );
      onChange(updatedVariants);
    } else {
      // Add new variant
      onChange([...variants, variant]);
    }
  }, [variants, onChange, editingVariant]);

  const totalTraffic = variants.reduce((sum, variant) => sum + variant.traffic, 0);
  const hasControl = variants.some(v => v.isControl);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            Test Variants ({variants.length})
          </h3>
          <p className="text-sm text-gray-500">
            Configure the different versions you want to test
          </p>
        </div>
        <Button
          variant="primary"
          onClick={handleCreateVariant}
          leftIcon={PlusIcon}
          disabled={readOnly}
        >
          Add Variant
        </Button>
      </div>

      {/* Traffic Allocation Summary */}
      <Card>
        <CardBody>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium text-gray-900">Traffic Allocation</h4>
            <span className={`text-sm font-medium ${
              Math.abs(totalTraffic - 100) < 0.1 ? 'text-green-600' : 'text-red-600'
            }`}>
              {totalTraffic.toFixed(1)}% / 100%
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div 
              className={`h-3 rounded-full transition-all duration-300 ${
                Math.abs(totalTraffic - 100) < 0.1 ? 'bg-green-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(totalTraffic, 100)}%` }}
            />
          </div>
          
          {Math.abs(totalTraffic - 100) > 0.1 && (
            <p className="text-xs text-red-600 mt-1">
              Traffic allocation must total 100%. Current total: {totalTraffic.toFixed(1)}%
            </p>
          )}
        </CardBody>
      </Card>

      {/* Variants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {variants.map((variant, index) => (
            <motion.div
              key={variant.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className={`relative ${VARIANT_COLORS[index % VARIANT_COLORS.length]} border-2`}>
                {/* Control Badge */}
                {variant.isControl && (
                  <div className="absolute -top-2 -right-2">
                    <div className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                      CONTROL
                    </div>
                  </div>
                )}

                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{variant.name}</h4>
                      <p className="text-xs text-gray-600 mt-1">{variant.description}</p>
                    </div>
                    <div className="flex items-center space-x-1 ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditVariant(variant)}
                        disabled={readOnly}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDuplicateVariant(variant)}
                        disabled={readOnly}
                      >
                        <DocumentDuplicateIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteVariant(variant.id)}
                        disabled={readOnly || variants.length <= 2}
                        className="text-red-600 hover:text-red-700"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardBody>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Traffic</span>
                      <span className="text-sm font-medium">{variant.traffic}%</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Content Type</span>
                      <span className="text-sm font-medium capitalize">{variant.content.type}</span>
                    </div>

                    {variant.performance && (
                      <div className="pt-2 border-t border-gray-200">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-gray-500">Impressions</span>
                            <div className="font-medium">{variant.performance.impressions.toLocaleString()}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Conversions</span>
                            <div className="font-medium">{variant.performance.conversions.toLocaleString()}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">CVR</span>
                            <div className="font-medium">{variant.performance.conversionRate.toFixed(2)}%</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Confidence</span>
                            <div className="font-medium">{variant.performance.confidence.toFixed(1)}%</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Validation Messages */}
      <div className="space-y-2">
        {!hasControl && (
          <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-2" />
            <span className="text-sm text-yellow-800">
              You must designate one variant as the control group.
            </span>
          </div>
        )}

        {variants.length < 2 && (
          <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-sm text-red-800">
              You need at least 2 variants to run an experiment.
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

      {/* Variant Editor Modal */}
      <VariantEditorModal
        variant={editingVariant}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveVariant}
        readOnly={readOnly}
      />
    </div>
  );
};
