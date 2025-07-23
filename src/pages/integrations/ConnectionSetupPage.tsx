// src/pages/integrations/ConnectionSetupPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CogIcon,
  KeyIcon,
  ServerIcon,
  TestTubeIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

interface ConnectionConfig {
  id: string;
  name: string;
  provider: string;
  logo: string;
  description: string;
  authType: 'oauth' | 'api_key' | 'username_password' | 'token';
  fields: ConfigField[];
  features: string[];
  status?: 'connected' | 'disconnected' | 'testing' | 'error';
}

interface ConfigField {
  id: string;
  label: string;
  type: 'text' | 'password' | 'url' | 'select' | 'textarea';
  required: boolean;
  placeholder?: string;
  helpText?: string;
  options?: string[];
}

const integrationConfigs: Record<string, ConnectionConfig> = {
  salesforce: {
    id: 'salesforce',
    name: 'Salesforce',
    provider: 'Salesforce',
    logo: '🔗',
    description: 'Connect to Salesforce CRM for bidirectional contact and lead synchronization',
    authType: 'oauth',
    fields: [
      {
        id: 'instance_url',
        label: 'Instance URL',
        type: 'url',
        required: true,
        placeholder: 'https://your-company.salesforce.com',
        helpText: 'Your Salesforce instance URL'
      },
      {
        id: 'api_version',
        label: 'API Version',
        type: 'select',
        required: true,
        options: ['v58.0', 'v57.0', 'v56.0'],
        helpText: 'Salesforce API version to use'
      }
    ],
    features: ['Bidirectional Sync', 'Real-time Updates', 'Custom Fields', 'Lead Management']
  },
  hubspot: {
    id: 'hubspot',
    name: 'HubSpot',
    provider: 'HubSpot',
    logo: '🧡',
    description: 'Integrate with HubSpot CRM, Marketing Hub, and Sales Hub',
    authType: 'api_key',
    fields: [
      {
        id: 'api_key',
        label: 'API Key',
        type: 'password',
        required: true,
        placeholder: 'Enter your HubSpot API key',
        helpText: 'Find this in your HubSpot account settings under Integrations > API Key'
      }
    ],
    features: ['Contact Sync', 'Deal Pipeline', 'Marketing Automation', 'Custom Properties']
  }
};

const ConnectionSetupPage: React.FC = () => {
  const { integrationId } = useParams<{ integrationId: string }>();
  const navigate = useNavigate();
  const [config, setConfig] = useState<ConnectionConfig | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (integrationId && integrationConfigs[integrationId]) {
      setConfig(integrationConfigs[integrationId]);
    } else {
      // Handle unknown integration
      setConfig({
        id: integrationId || 'unknown',
        name: 'Unknown Integration',
        provider: 'Unknown Provider',
        logo: '🔧',
        description: 'Configuration for this integration type',
        authType: 'api_key',
        fields: [
          {
            id: 'api_key',
            label: 'API Key',
            type: 'password',
            required: true,
            placeholder: 'Enter your API key'
          }
        ],
        features: ['Basic Integration']
      });
    }
  }, [integrationId]);

  const handleInputChange = (fieldId: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleTestConnection = async () => {
    setTestStatus('testing');
    setErrorMessage('');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock success
      setTestStatus('success');
    } catch (error) {
      setTestStatus('error');
      setErrorMessage('Connection test failed. Please check your configuration.');
    }
  };

  const handleSaveConnection = async () => {
    setIsLoading(true);
    
    try {
      // Simulate saving
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Navigate back to integrations page
      navigate('/integrations');
    } catch (error) {
      setErrorMessage('Failed to save connection. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { id: 1, name: 'Configuration', icon: CogIcon },
    { id: 2, name: 'Test Connection', icon: TestTubeIcon },
    { id: 3, name: 'Confirmation', icon: CheckCircleIcon }
  ];

  if (!config) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Integration not found</h2>
          <Button onClick={() => navigate('/integrations')}>
            Back to Integrations
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => navigate('/integrations')}
                className="flex items-center"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back
              </Button>
              
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                  {config.logo}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Connect {config.name}
                  </h1>
                  <p className="text-gray-600">{config.provider}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`
                    flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors
                    ${isActive ? 'border-blue-600 bg-blue-600 text-white' : 
                      isCompleted ? 'border-green-600 bg-green-600 text-white' : 
                      'border-gray-300 text-gray-400'}
                  `}>
                    {isCompleted ? (
                      <CheckCircleIcon className="h-6 w-6" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {step.name}
                  </span>
                  {index < steps.length - 1 && (
                    <div className="w-16 h-0.5 bg-gray-300 mx-4" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-900">
                  {currentStep === 1 && 'Configuration'}
                  {currentStep === 2 && 'Test Connection'}
                  {currentStep === 3 && 'Confirmation'}
                </h2>
                <p className="text-gray-600">
                  {currentStep === 1 && config.description}
                  {currentStep === 2 && 'Verify your connection settings are working correctly'}
                  {currentStep === 3 && 'Review and confirm your integration setup'}
                </p>
              </CardHeader>

              <CardBody>
                {currentStep === 1 && (
                  <div className="space-y-6">
                    {config.fields.map((field) => (
                      <div key={field.id}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {field.label}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        
                        {field.type === 'select' ? (
                          <select
                            value={formData[field.id] || ''}
                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select...</option>
                            {field.options?.map((option) => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        ) : field.type === 'textarea' ? (
                          <textarea
                            value={formData[field.id] || ''}
                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                            placeholder={field.placeholder}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            rows={4}
                          />
                        ) : (
                          <Input
                            type={field.type}
                            value={formData[field.id] || ''}
                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                            placeholder={field.placeholder}
                            className="w-full"
                          />
                        )}
                        
                        {field.helpText && (
                          <p className="mt-1 text-sm text-gray-500">{field.helpText}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="text-center py-8">
                    {testStatus === 'idle' && (
                      <div>
                        <ServerIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Ready to test connection
                        </h3>
                        <p className="text-gray-600 mb-6">
                          Click the button below to verify your configuration
                        </p>
                        <Button onClick={handleTestConnection} variant="primary">
                          Test Connection
                        </Button>
                      </div>
                    )}

                    {testStatus === 'testing' && (
                      <div>
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Testing connection...
                        </h3>
                        <p className="text-gray-600">Please wait while we verify your settings</p>
                      </div>
                    )}

                    {testStatus === 'success' && (
                      <div>
                        <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Connection successful!
                        </h3>
                        <p className="text-gray-600 mb-6">
                          Your integration is configured correctly
                        </p>
                        <Button onClick={() => setCurrentStep(3)} variant="primary">
                          Continue
                        </Button>
                      </div>
                    )}

                    {testStatus === 'error' && (
                      <div>
                        <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Connection failed
                        </h3>
                        <p className="text-red-600 mb-6">{errorMessage}</p>
                        <div className="flex space-x-3 justify-center">
                          <Button onClick={() => setCurrentStep(1)} variant="outline">
                            Edit Configuration
                          </Button>
                          <Button onClick={handleTestConnection} variant="primary">
                            Retry Test
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="text-center py-4">
                      <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Ready to connect!
                      </h3>
                      <p className="text-gray-600">
                        Your {config.name} integration is configured and tested
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Integration Summary</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Provider: {config.provider}</li>
                        <li>• Authentication: {config.authType.replace('_', ' ').toUpperCase()}</li>
                        <li>• Features: {config.features.join(', ')}</li>
                      </ul>
                    </div>
                  </div>
                )}
              </CardBody>

              <CardFooter>
                <div className="flex justify-between w-full">
                  <div>
                    {currentStep > 1 && (
                      <Button
                        variant="outline"
                        onClick={() => setCurrentStep(currentStep - 1)}
                      >
                        Previous
                      </Button>
                    )}
                  </div>
                  
                  <div>
                    {currentStep < 3 && (
                      <Button
                        variant="primary"
                        onClick={() => setCurrentStep(currentStep + 1)}
                        disabled={currentStep === 2 && testStatus !== 'success'}
                      >
                        Next
                      </Button>
                    )}
                    
                    {currentStep === 3 && (
                      <Button
                        variant="primary"
                        onClick={handleSaveConnection}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Saving...' : 'Save Connection'}
                      </Button>
                    )}
                  </div>
                </div>
              </CardFooter>
            </Card>
          </div>

          {/* Sidebar */}
          <div>
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium text-gray-900">Features</h3>
              </CardHeader>
              <CardBody>
                <ul className="space-y-2">
                  {config.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <h3 className="text-lg font-medium text-gray-900">Need Help?</h3>
              </CardHeader>
              <CardBody>
                <p className="text-sm text-gray-600 mb-4">
                  Check our documentation for detailed setup instructions.
                </p>
                <Button variant="outline" className="w-full">
                  View Documentation
                </Button>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionSetupPage;