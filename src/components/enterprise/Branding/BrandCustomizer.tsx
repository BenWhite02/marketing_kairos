// src/components/enterprise/Branding/BrandCustomizer.tsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SwatchIcon,
  PhotoIcon,
  CogIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  ArrowPathIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline';
import { useBrandStore } from '../../../stores/enterprise/brandStore';
import { BrandConfiguration } from '../../../types/enterprise';
import { Button } from '../../ui/Button';
import { Card, CardHeader, CardBody } from '../../ui/Card';
import { Input, TextArea } from '../../ui/Input';

interface BrandCustomizerProps {
  brandId?: string;
  onSave?: (brand: BrandConfiguration) => void;
  onCancel?: () => void;
}

export const BrandCustomizer: React.FC<BrandCustomizerProps> = ({
  brandId,
  onSave,
  onCancel,
}) => {
  const {
    currentBrand,
    previewBrand,
    previewMode,
    isLoading,
    error,
    isDirty,
    loadBrand,
    updateBrand,
    createBrand,
    enablePreview,
    disablePreview,
    updatePreview,
    validateBrand,
    clearError,
  } = useBrandStore();

  const [activeTab, setActiveTab] = useState<'basic' | 'colors' | 'typography' | 'layout' | 'domain'>('basic');
  const [formData, setFormData] = useState<Partial<BrandConfiguration>>({});
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    if (brandId && brandId !== currentBrand?.id) {
      loadBrand(brandId);
    }
  }, [brandId, currentBrand?.id, loadBrand]);

  useEffect(() => {
    if (currentBrand) {
      setFormData(currentBrand);
      enablePreview(currentBrand);
    }
  }, [currentBrand, enablePreview]);

  useEffect(() => {
    return () => {
      disablePreview();
    };
  }, [disablePreview]);

  const handleInputChange = (path: string, value: any) => {
    const newFormData = { ...formData };
    const keys = path.split('.');
    let current = newFormData;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
    setFormData(newFormData);
    updatePreview(newFormData);

    // Clear validation errors when user starts typing
    setValidationErrors([]);
    clearError();
  };

  const handleSave = async () => {
    const validation = validateBrand(formData);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    try {
      if (brandId) {
        await updateBrand(brandId, formData);
      } else {
        const newId = await createBrand(formData as Omit<BrandConfiguration, 'id' | 'createdAt' | 'updatedAt' | 'version'>);
        brandId = newId;
      }
      
      onSave?.(formData as BrandConfiguration);
    } catch (error) {
      console.error('Failed to save brand:', error);
    }
  };

  const handleCancel = () => {
    disablePreview();
    setFormData(currentBrand || {});
    setValidationErrors([]);
    clearError();
    onCancel?.();
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: CogIcon },
    { id: 'colors', label: 'Colors', icon: SwatchIcon },
    { id: 'typography', label: 'Typography', icon: DocumentDuplicateIcon },
    { id: 'layout', label: 'Layout', icon: PhotoIcon },
    { id: 'domain', label: 'Domain', icon: EyeIcon },
  ];

  const colorPresets = [
    { name: 'Default', primary: '#6366f1', secondary: '#8b5cf6' },
    { name: 'Ocean', primary: '#0891b2', secondary: '#06b6d4' },
    { name: 'Forest', primary: '#059669', secondary: '#10b981' },
    { name: 'Sunset', primary: '#ea580c', secondary: '#f97316' },
    { name: 'Purple', primary: '#9333ea', secondary: '#a855f7' },
    { name: 'Rose', primary: '#e11d48', secondary: '#f43f5e' },
  ];

  const fontPresets = [
    { name: 'Inter', value: 'Inter, system-ui, sans-serif' },
    { name: 'Roboto', value: 'Roboto, system-ui, sans-serif' },
    { name: 'Open Sans', value: 'Open Sans, system-ui, sans-serif' },
    { name: 'Lato', value: 'Lato, system-ui, sans-serif' },
    { name: 'Montserrat', value: 'Montserrat, system-ui, sans-serif' },
    { name: 'Poppins', value: 'Poppins, system-ui, sans-serif' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-2">
          <ArrowPathIcon className="w-5 h-5 animate-spin" />
          <span>Loading brand configuration...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {brandId ? 'Edit Brand' : 'Create Brand'}
            </h1>
            <p className="mt-2 text-gray-600">
              Customize your brand appearance and domain settings
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {previewMode && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-lg">
                <EyeIcon className="w-4 h-4" />
                <span className="text-sm font-medium">Preview Mode</span>
              </div>
            )}
            
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              <XMarkIcon className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={isLoading || !isDirty}
            >
              <CheckIcon className="w-4 h-4 mr-2" />
              {brandId ? 'Update' : 'Create'} Brand
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {(error || validationErrors.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg"
          >
            <div className="flex">
              <XMarkIcon className="w-5 h-5 text-red-400 mt-0.5" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  {error ? 'Error' : 'Validation Errors'}
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  {error && <p>{error}</p>}
                  {validationErrors.length > 0 && (
                    <ul className="list-disc list-inside space-y-1">
                      {validationErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <CardBody className="p-0">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`w-full flex items-center px-4 py-3 text-left text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </CardBody>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'basic' && (
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Basic Information</h3>
                    <p className="text-gray-600">Configure basic brand settings and logo</p>
                  </CardHeader>
                  <CardBody className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Brand Name *
                        </label>
                        <Input
                          value={formData.name || ''}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="Enter brand name"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Status
                        </label>
                        <select
                          value={formData.status || 'draft'}
                          onChange={(e) => handleInputChange('status', e.target.value)}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="draft">Draft</option>
                          <option value="active">Active</option>
                          <option value="archived">Archived</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <TextArea
                        value={formData.description || ''}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Describe this brand configuration"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Primary Logo URL *
                        </label>
                        <Input
                          value={formData.logo?.primary || ''}
                          onChange={(e) => handleInputChange('logo.primary', e.target.value)}
                          placeholder="https://example.com/logo.png"
                        />
                        {formData.logo?.primary && (
                          <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                            <img
                              src={formData.logo.primary}
                              alt="Primary Logo Preview"
                              className="max-h-16 object-contain"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Favicon URL
                        </label>
                        <Input
                          value={formData.logo?.favicon || ''}
                          onChange={(e) => handleInputChange('logo.favicon', e.target.value)}
                          placeholder="https://example.com/favicon.ico"
                        />
                        {formData.logo?.favicon && (
                          <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                            <img
                              src={formData.logo.favicon}
                              alt="Favicon Preview"
                              className="w-8 h-8 object-contain"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </CardBody>
                </Card>
              )}

              {activeTab === 'colors' && (
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Color Scheme</h3>
                    <p className="text-gray-600">Define your brand colors and theme</p>
                  </CardHeader>
                  <CardBody className="space-y-6">
                    {/* Color Presets */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Color Presets
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        {colorPresets.map((preset) => (
                          <button
                            key={preset.name}
                            onClick={() => {
                              handleInputChange('colors.primary', preset.primary);
                              handleInputChange('colors.secondary', preset.secondary);
                            }}
                            className="p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors group"
                          >
                            <div className="flex space-x-1 mb-2">
                              <div
                                className="w-4 h-4 rounded"
                                style={{ backgroundColor: preset.primary }}
                              />
                              <div
                                className="w-4 h-4 rounded"
                                style={{ backgroundColor: preset.secondary }}
                              />
                            </div>
                            <span className="text-xs font-medium text-gray-700 group-hover:text-gray-900">
                              {preset.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Primary Colors */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Primary Color
                        </label>
                        <div className="flex space-x-3">
                          <input
                            type="color"
                            value={formData.colors?.primary || '#6366f1'}
                            onChange={(e) => handleInputChange('colors.primary', e.target.value)}
                            className="w-12 h-10 rounded border border-gray-300"
                          />
                          <Input
                            value={formData.colors?.primary || ''}
                            onChange={(e) => handleInputChange('colors.primary', e.target.value)}
                            placeholder="#6366f1"
                            className="flex-1"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Secondary Color
                        </label>
                        <div className="flex space-x-3">
                          <input
                            type="color"
                            value={formData.colors?.secondary || '#8b5cf6'}
                            onChange={(e) => handleInputChange('colors.secondary', e.target.value)}
                            className="w-12 h-10 rounded border border-gray-300"
                          />
                          <Input
                            value={formData.colors?.secondary || ''}
                            onChange={(e) => handleInputChange('colors.secondary', e.target.value)}
                            placeholder="#8b5cf6"
                            className="flex-1"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Accent Color
                        </label>
                        <div className="flex space-x-3">
                          <input
                            type="color"
                            value={formData.colors?.accent || '#06b6d4'}
                            onChange={(e) => handleInputChange('colors.accent', e.target.value)}
                            className="w-12 h-10 rounded border border-gray-300"
                          />
                          <Input
                            value={formData.colors?.accent || ''}
                            onChange={(e) => handleInputChange('colors.accent', e.target.value)}
                            placeholder="#06b6d4"
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Surface Colors */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Background Color
                        </label>
                        <div className="flex space-x-3">
                          <input
                            type="color"
                            value={formData.colors?.background || '#ffffff'}
                            onChange={(e) => handleInputChange('colors.background', e.target.value)}
                            className="w-12 h-10 rounded border border-gray-300"
                          />
                          <Input
                            value={formData.colors?.background || ''}
                            onChange={(e) => handleInputChange('colors.background', e.target.value)}
                            placeholder="#ffffff"
                            className="flex-1"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Surface Color
                        </label>
                        <div className="flex space-x-3">
                          <input
                            type="color"
                            value={formData.colors?.surface || '#f8fafc'}
                            onChange={(e) => handleInputChange('colors.surface', e.target.value)}
                            className="w-12 h-10 rounded border border-gray-300"
                          />
                          <Input
                            value={formData.colors?.surface || ''}
                            onChange={(e) => handleInputChange('colors.surface', e.target.value)}
                            placeholder="#f8fafc"
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Color Preview */}
                    <div className="mt-8">
                      <h4 className="text-md font-medium text-gray-900 mb-4">Color Preview</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { name: 'Primary', color: formData.colors?.primary },
                          { name: 'Secondary', color: formData.colors?.secondary },
                          { name: 'Accent', color: formData.colors?.accent },
                          { name: 'Background', color: formData.colors?.background },
                        ].map((item) => (
                          <div key={item.name} className="text-center">
                            <div
                              className="w-full h-16 rounded-lg border border-gray-200 mb-2"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="text-sm font-medium text-gray-700">{item.name}</span>
                            <div className="text-xs text-gray-500">{item.color}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardBody>
                </Card>
              )}

              {activeTab === 'typography' && (
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Typography</h3>
                    <p className="text-gray-600">Configure fonts and text styling</p>
                  </CardHeader>
                  <CardBody className="space-y-6">
                    {/* Font Presets */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Font Presets
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {fontPresets.map((preset) => (
                          <button
                            key={preset.name}
                            onClick={() => {
                              handleInputChange('typography.fontFamily.primary', preset.value);
                              handleInputChange('typography.fontFamily.secondary', preset.value);
                            }}
                            className="p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors group"
                            style={{ fontFamily: preset.value }}
                          >
                            <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                              {preset.name}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              The quick brown fox
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Font Families */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Primary Font
                        </label>
                        <Input
                          value={formData.typography?.fontFamily?.primary || ''}
                          onChange={(e) => handleInputChange('typography.fontFamily.primary', e.target.value)}
                          placeholder="Inter, system-ui, sans-serif"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Monospace Font
                        </label>
                        <Input
                          value={formData.typography?.fontFamily?.monospace || ''}
                          onChange={(e) => handleInputChange('typography.fontFamily.monospace', e.target.value)}
                          placeholder="JetBrains Mono, monospace"
                        />
                      </div>
                    </div>

                    {/* Typography Preview */}
                    <div className="mt-8">
                      <h4 className="text-md font-medium text-gray-900 mb-4">Typography Preview</h4>
                      <div
                        className="p-6 bg-gray-50 rounded-lg"
                        style={{
                          fontFamily: formData.typography?.fontFamily?.primary || 'Inter, system-ui, sans-serif'
                        }}
                      >
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Heading 1</h1>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Heading 2</h2>
                        <h3 className="text-xl font-medium text-gray-700 mb-4">Heading 3</h3>
                        <p className="text-base text-gray-600 mb-4">
                          This is a paragraph of body text that demonstrates how your chosen typography
                          will look in the interface. It includes multiple sentences to show text flow
                          and readability.
                        </p>
                        <p className="text-sm text-gray-500">
                          This is smaller text that might be used for captions or secondary information.
                        </p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              )}

              {activeTab === 'layout' && (
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Layout & Spacing</h3>
                    <p className="text-gray-600">Configure border radius, spacing, and shadows</p>
                  </CardHeader>
                  <CardBody className="space-y-6">
                    {/* Border Radius */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Border Radius
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {['sm', 'md', 'lg'].map((size) => (
                          <div key={size}>
                            <label className="block text-xs font-medium text-gray-600 mb-1 uppercase">
                              {size}
                            </label>
                            <Input
                              value={formData.layout?.borderRadius?.[size] || ''}
                              onChange={(e) => handleInputChange(`layout.borderRadius.${size}`, e.target.value)}
                              placeholder={size === 'sm' ? '0.125rem' : size === 'md' ? '0.375rem' : '0.5rem'}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Layout Preview */}
                    <div className="mt-8">
                      <h4 className="text-md font-medium text-gray-900 mb-4">Layout Preview</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                          <div
                            className="w-full h-24 bg-gradient-to-r from-blue-400 to-blue-600 mb-3"
                            style={{
                              borderRadius: formData.layout?.borderRadius?.sm || '0.125rem',
                              boxShadow: formData.layout?.shadows?.sm || '0 1px 2px 0 rgb(0 0 0 / 0.05)'
                            }}
                          />
                          <span className="text-sm font-medium text-gray-700">Small Radius + Shadow</span>
                        </div>
                        <div className="text-center">
                          <div
                            className="w-full h-24 bg-gradient-to-r from-purple-400 to-purple-600 mb-3"
                            style={{
                              borderRadius: formData.layout?.borderRadius?.md || '0.375rem',
                              boxShadow: formData.layout?.shadows?.md || '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                            }}
                          />
                          <span className="text-sm font-medium text-gray-700">Medium Radius + Shadow</span>
                        </div>
                        <div className="text-center">
                          <div
                            className="w-full h-24 bg-gradient-to-r from-green-400 to-green-600 mb-3"
                            style={{
                              borderRadius: formData.layout?.borderRadius?.lg || '0.5rem',
                              boxShadow: formData.layout?.shadows?.lg || '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                            }}
                          />
                          <span className="text-sm font-medium text-gray-700">Large Radius + Shadow</span>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              )}

              {activeTab === 'domain' && (
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Custom Domain</h3>
                    <p className="text-gray-600">Configure white-label domain settings</p>
                  </CardHeader>
                  <CardBody className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Custom Domain
                        </label>
                        <Input
                          value={formData.domain?.customDomain || ''}
                          onChange={(e) => handleInputChange('domain.customDomain', e.target.value)}
                          placeholder="app.yourcompany.com"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Point your domain to our servers via CNAME record
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Subdomain Prefix
                        </label>
                        <Input
                          value={formData.domain?.subdomainPrefix || ''}
                          onChange={(e) => handleInputChange('domain.subdomainPrefix', e.target.value)}
                          placeholder="yourcompany"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Will create: yourcompany.kairos.app
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="sslEnabled"
                        checked={formData.domain?.sslEnabled || false}
                        onChange={(e) => handleInputChange('domain.sslEnabled', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="sslEnabled" className="text-sm font-medium text-gray-700">
                        Enable SSL/TLS encryption
                      </label>
                    </div>

                    {/* Domain Status */}
                    {formData.domain?.customDomain && (
                      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Domain Status</h4>
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${
                            formData.domain.status === 'active' ? 'bg-green-500' :
                            formData.domain.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                          }`} />
                          <span className="text-sm text-gray-600 capitalize">
                            {formData.domain.status || 'pending'}
                          </span>
                        </div>
                        
                        {formData.domain.status === 'pending' && (
                          <div className="mt-3 text-xs text-gray-600">
                            <p>Please add the following CNAME record to your DNS:</p>
                            <div className="mt-2 p-2 bg-gray-100 rounded font-mono text-xs">
                              {formData.domain.customDomain} CNAME kairos-app.vercel.app
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardBody>
                </Card>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
