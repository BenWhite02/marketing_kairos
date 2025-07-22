// src/components/features/Integrations/CRM/CRMConnector.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  CogIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  DocumentTextIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import { Button } from '../../../ui/Button';
import { Input } from '../../../ui/Input';
import { Card, CardHeader, CardBody, CardFooter } from '../../../ui/Card';
import { Badge } from '../../../ui/Badge';
import { Modal } from '../../../ui/Modal';
import { CRMIntegration, CRMProvider, CRMObject, FieldMapping } from '../../../../types/integrations';
import { classNames } from '../../../../utils/dom/classNames';

interface CRMConnectorProps {
  integration?: CRMIntegration;
  provider: CRMProvider;
  onSave?: (config: any) => void;
  onTest?: (config: any) => Promise<boolean>;
  onCancel?: () => void;
  isEditing?: boolean;
}

interface ConnectionConfig {
  [key: string]: any;
  instanceUrl?: string;
  clientId?: string;
  clientSecret?: string;
  apiKey?: string;
  accessToken?: string;
  portalId?: string;
}

interface TestResult {
  isConnected: boolean;
  availableObjects: CRMObject[];
  userInfo?: {
    name: string;
    email: string;
    organization: string;
  };
  permissions: string[];
  error?: string;
}

const CRMConnector: React.FC<CRMConnectorProps> = ({
  integration,
  provider,
  onSave,
  onTest,
  onCancel,
  isEditing = false
}) => {
  const [config, setConfig] = useState<ConnectionConfig>({});
  const [isConnecting, setIsConnecting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [step, setStep] = useState<'config' | 'test' | 'mapping' | 'confirm'>('config');
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [selectedObjects, setSelectedObjects] = useState<CRMObject[]>([]);

  useEffect(() => {
    if (integration) {
      setConfig(integration.configuration.customFields || {});
      setFieldMappings(integration.dataMapping.fieldMappings || []);
    }
  }, [integration]);

  const getProviderConfig = () => {
    switch (provider) {
      case 'salesforce':
        return {
          name: 'Salesforce',
          logo: '/images/integrations/salesforce.svg',
          fields: [
            { key: 'instanceUrl', label: 'Instance URL', type: 'url', required: true, placeholder: 'https://yourinstance.salesforce.com' },
            { key: 'clientId', label: 'Client ID', type: 'text', required: true, placeholder: 'Connected App Client ID' },
            { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true, placeholder: 'Connected App Client Secret' }
          ],
          objects: ['contact', 'lead', 'account', 'opportunity', 'campaign'] as CRMObject[],
          documentation: 'https://docs.kairos.com/integrations/salesforce'
        };
      case 'hubspot':
        return {
          name: 'HubSpot',
          logo: '/images/integrations/hubspot.svg',
          fields: [
            { key: 'apiKey', label: 'API Key', type: 'password', required: true, placeholder: 'Your HubSpot API Key' },
            { key: 'portalId', label: 'Portal ID', type: 'text', required: false, placeholder: 'Your HubSpot Portal ID (optional)' }
          ],
          objects: ['contact', 'company', 'deal', 'ticket'] as CRMObject[],
          documentation: 'https://docs.kairos.com/integrations/hubspot'
        };
      case 'dynamics-365':
        return {
          name: 'Microsoft Dynamics 365',
          logo: '/images/integrations/dynamics-365.svg',
          fields: [
            { key: 'instanceUrl', label: 'Instance URL', type: 'url', required: true, placeholder: 'https://yourorg.crm.dynamics.com' },
            { key: 'clientId', label: 'Application ID', type: 'text', required: true, placeholder: 'Azure Application ID' },
            { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true, placeholder: 'Azure Application Secret' },
            { key: 'tenantId', label: 'Tenant ID', type: 'text', required: true, placeholder: 'Azure Tenant ID' }
          ],
          objects: ['contact', 'account', 'lead', 'opportunity'] as CRMObject[],
          documentation: 'https://docs.kairos.com/integrations/dynamics-365'
        };
      default:
        return null;
    }
  };

  const providerConfig = getProviderConfig();

  const handleConfigChange = (key: string, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const toggleShowSecret = (key: string) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleTestConnection = async () => {
    if (!onTest) return;

    setIsTesting(true);
    setTestResult(null);

    try {
      const isConnected = await onTest(config);
      
      // Mock test result - in real implementation this would come from the API
      const mockResult: TestResult = {
        isConnected,
        availableObjects: providerConfig?.objects || [],
        userInfo: {
          name: 'John Doe',
          email: 'john.doe@company.com',
          organization: 'ACME Corp'
        },
        permissions: ['read_contacts', 'write_contacts', 'read_leads', 'write_leads']
      };

      if (!isConnected) {
        mockResult.error = 'Invalid credentials or network error';
      }

      setTestResult(mockResult);
      
      if (isConnected) {
        setSelectedObjects(mockResult.availableObjects);
        setTimeout(() => setStep('mapping'), 1000);
      }
    } catch (error) {
      setTestResult({
        isConnected: false,
        availableObjects: [],
        permissions: [],
        error: error instanceof Error ? error.message : 'Connection failed'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleAddFieldMapping = () => {
    const newMapping: FieldMapping = {
      sourceField: '',
      targetField: '',
      dataType: 'string',
      isRequired: false
    };
    setFieldMappings(prev => [...prev, newMapping]);
  };

  const handleUpdateFieldMapping = (index: number, updates: Partial<FieldMapping>) => {
    setFieldMappings(prev => prev.map((mapping, i) => 
      i === index ? { ...mapping, ...updates } : mapping
    ));
  };

  const handleRemoveFieldMapping = (index: number) => {
    setFieldMappings(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setIsConnecting(true);
    try {
      const fullConfig = {
        ...config,
        provider,
        objects: selectedObjects,
        fieldMappings
      };
      
      await onSave?.(fullConfig);
    } finally {
      setIsConnecting(false);
    }
  };

  const isConfigValid = () => {
    if (!providerConfig) return false;
    return providerConfig.fields
      .filter(field => field.required)
      .every(field => config[field.key]);
  };

  const renderConfigStep = () => (
    <div className="space-y-6">
      {/* Provider Info */}
      <div className="flex items-center space-x-4">
        <img
          src={providerConfig?.logo}
          alt={providerConfig?.name}
          className="w-16 h-16 rounded-lg object-contain bg-gray-50 p-3"
        />
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Connect to {providerConfig?.name}
          </h3>
          <p className="text-gray-600">
            Configure your {providerConfig?.name} connection settings
          </p>
        </div>
      </div>

      {/* Configuration Fields */}
      <div className="space-y-4">
        {providerConfig?.fields.map((field) => (
          <div key={field.key}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="relative">
              <Input
                type={field.type === 'password' && !showSecrets[field.key] ? 'password' : 'text'}
                placeholder={field.placeholder}
                value={config[field.key] || ''}
                onChange={(e) => handleConfigChange(field.key, e.target.value)}
                required={field.required}
              />
              {field.type === 'password' && (
                <button
                  type="button"
                  onClick={() => toggleShowSecret(field.key)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showSecrets[field.key] ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Documentation Link */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex items-start space-x-3">
          <DocumentTextIcon className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900">
              Need help setting up {providerConfig?.name}?
            </h4>
            <p className="text-sm text-blue-700 mt-1">
              Follow our step-by-step guide to configure your integration.
            </p>
            <a
              href={providerConfig?.documentation}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium mt-2 inline-block"
            >
              View Documentation →
            </a>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleTestConnection}
          disabled={!isConfigValid()}
          isLoading={isTesting}
        >
          Test Connection
        </Button>
      </div>
    </div>
  );

  const renderTestStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Testing Connection
        </h3>
        
        {isTesting ? (
          <div className="space-y-4">
            <ArrowPathIcon className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
            <p className="text-gray-600">Connecting to {providerConfig?.name}...</p>
          </div>
        ) : testResult ? (
          <div className="space-y-6">
            {/* Connection Status */}
            <div className={classNames(
              "inline-flex items-center space-x-2 px-4 py-2 rounded-full",
              testResult.isConnected
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            )}>
              {testResult.isConnected ? (
                <CheckCircleIcon className="w-5 h-5" />
              ) : (
                <ExclamationTriangleIcon className="w-5 h-5" />
              )}
              <span className="font-medium">
                {testResult.isConnected ? 'Connection Successful' : 'Connection Failed'}
              </span>
            </div>

            {/* Connection Details */}
            {testResult.isConnected && testResult.userInfo && (
              <div className="bg-gray-50 rounded-lg p-6 text-left">
                <h4 className="font-medium text-gray-900 mb-4">Connection Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-3">
                    <UserGroupIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {testResult.userInfo.name}
                      </div>
                      <div className="text-xs text-gray-600">
                        {testResult.userInfo.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <BuildingOfficeIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {testResult.userInfo.organization}
                      </div>
                      <div className="text-xs text-gray-600">Organization</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <ChartBarIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {testResult.availableObjects.length} Objects
                      </div>
                      <div className="text-xs text-gray-600">Available</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error Details */}
            {!testResult.isConnected && testResult.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left">
                <h4 className="font-medium text-red-900 mb-2">Error Details</h4>
                <p className="text-sm text-red-700">{testResult.error}</p>
              </div>
            )}

            {/* Available Objects */}
            {testResult.isConnected && testResult.availableObjects.length > 0 && (
              <div className="text-left">
                <h4 className="font-medium text-gray-900 mb-3">Available Objects</h4>
                <div className="flex flex-wrap gap-2">
                  {testResult.availableObjects.map((object) => (
                    <Badge key={object} variant="secondary" className="capitalize">
                      {object.replace('-', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep('config')}>
                Back
              </Button>
              {testResult.isConnected ? (
                <Button variant="primary" onClick={() => setStep('mapping')}>
                  Configure Mapping
                </Button>
              ) : (
                <Button variant="primary" onClick={handleTestConnection}>
                  Retry
                </Button>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );

  const renderMappingStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Field Mapping
        </h3>
        <p className="text-gray-600">
          Map {providerConfig?.name} fields to Kairos customer attributes
        </p>
      </div>

      {/* Object Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Select Objects to Sync
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {testResult?.availableObjects.map((object) => (
            <label key={object} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedObjects.includes(object)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedObjects(prev => [...prev, object]);
                  } else {
                    setSelectedObjects(prev => prev.filter(o => o !== object));
                  }
                }}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-900 capitalize">
                {object.replace('-', ' ')}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Field Mappings */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="text-sm font-medium text-gray-700">
            Field Mappings
          </label>
          <Button size="sm" variant="outline" onClick={handleAddFieldMapping}>
            Add Mapping
          </Button>
        </div>

        <div className="space-y-3">
          {fieldMappings.map((mapping, index) => (
            <Card key={index} variant="outline">
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Source Field
                    </label>
                    <Input
                      placeholder="CRM field name"
                      value={mapping.sourceField}
                      onChange={(e) => handleUpdateFieldMapping(index, { sourceField: e.target.value })}
                      size="sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Target Field
                    </label>
                    <select
                      value={mapping.targetField}
                      onChange={(e) => handleUpdateFieldMapping(index, { targetField: e.target.value })}
                      className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">Select field</option>
                      <option value="email">Email</option>
                      <option value="firstName">First Name</option>
                      <option value="lastName">Last Name</option>
                      <option value="phone">Phone</option>
                      <option value="company">Company</option>
                      <option value="title">Title</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Data Type
                    </label>
                    <select
                      value={mapping.dataType}
                      onChange={(e) => handleUpdateFieldMapping(index, { dataType: e.target.value as any })}
                      className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="string">Text</option>
                      <option value="email">Email</option>
                      <option value="phone">Phone</option>
                      <option value="number">Number</option>
                      <option value="date">Date</option>
                      <option value="boolean">Boolean</option>
                    </select>
                  </div>
                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={mapping.isRequired}
                        onChange={(e) => handleUpdateFieldMapping(index, { isRequired: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs text-gray-700">Required</span>
                    </label>
                  </div>
                  <div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemoveFieldMapping(index)}
                      className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {fieldMappings.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No field mappings configured yet.</p>
            <p className="text-sm mt-1">Add mappings to sync data between systems.</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep('test')}>
          Back
        </Button>
        <Button
          variant="primary"
          onClick={() => setStep('confirm')}
          disabled={selectedObjects.length === 0}
        >
          Review & Save
        </Button>
      </div>
    </div>
  );

  const renderConfirmStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Review & Confirm
        </h3>
        <p className="text-gray-600">
          Review your {providerConfig?.name} integration settings before saving
        </p>
      </div>

      {/* Summary */}
      <div className="space-y-4">
        <Card variant="outline">
          <CardHeader>
            <h4 className="font-medium text-gray-900">Connection Settings</h4>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              {providerConfig?.fields.map((field) => (
                <div key={field.key} className="flex justify-between">
                  <span className="text-sm text-gray-600">{field.label}:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {field.type === 'password' ? '●●●●●●●●' : config[field.key] || 'Not set'}
                  </span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card variant="outline">
          <CardHeader>
            <h4 className="font-medium text-gray-900">Sync Configuration</h4>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-600">Objects to sync:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedObjects.map((object) => (
                    <Badge key={object} variant="secondary" className="capitalize">
                      {object.replace('-', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Field mappings:</span>
                <span className="text-sm font-medium text-gray-900 ml-2">
                  {fieldMappings.length} configured
                </span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep('mapping')}>
          Back
        </Button>
        <Button
          variant="primary"
          onClick={handleSave}
          isLoading={isConnecting}
        >
          {isEditing ? 'Update Integration' : 'Create Integration'}
        </Button>
      </div>
    </div>
  );

  if (!providerConfig) {
    return (
      <div className="text-center py-8">
        <ExclamationTriangleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Unsupported Provider
        </h3>
        <p className="text-gray-600">
          The provider "{provider}" is not yet supported.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[
            { key: 'config', label: 'Configuration' },
            { key: 'test', label: 'Test Connection' },
            { key: 'mapping', label: 'Field Mapping' },
            { key: 'confirm', label: 'Confirm' }
          ].map((stepItem, index) => (
            <div key={stepItem.key} className="flex items-center">
              <div className={classNames(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                step === stepItem.key
                  ? "bg-blue-600 text-white"
                  : index < ['config', 'test', 'mapping', 'confirm'].indexOf(step)
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 text-gray-600"
              )}>
                {index < ['config', 'test', 'mapping', 'confirm'].indexOf(step) ? (
                  <CheckCircleIcon className="w-5 h-5" />
                ) : (
                  index + 1
                )}
              </div>
              <span className={classNames(
                "ml-2 text-sm font-medium",
                step === stepItem.key ? "text-blue-600" : "text-gray-600"
              )}>
                {stepItem.label}
              </span>
              {index < 3 && (
                <div className={classNames(
                  "flex-1 h-0.5 mx-4",
                  index < ['config', 'test', 'mapping', 'confirm'].indexOf(step)
                    ? "bg-green-600"
                    : "bg-gray-200"
                )} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <CardBody className="p-8">
          {step === 'config' && renderConfigStep()}
          {step === 'test' && renderTestStep()}
          {step === 'mapping' && renderMappingStep()}
          {step === 'confirm' && renderConfirmStep()}
        </CardBody>
      </Card>
    </div>
  );
};

export default CRMConnector;