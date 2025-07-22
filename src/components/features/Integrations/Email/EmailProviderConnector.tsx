// src/components/features/Integrations/Email/EmailProviderConnector.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  EnvelopeIcon,
  ChartBarIcon,
  DocumentTextIcon,
  EyeIcon,
  EyeSlashIcon,
  Cog6ToothIcon,
  PlayIcon
} from '@heroicons/react/24/outline';
import { Button } from '../../../ui/Button';
import { Input } from '../../../ui/Input';
import { Card, CardHeader, CardBody, CardFooter } from '../../../ui/Card';
import { Badge } from '../../../ui/Badge';
import { EmailProviderIntegration, EmailProvider, EmailCapability, EmailTemplate } from '../../../../types/integrations';
import { classNames } from '../../../../utils/dom/classNames';

interface EmailProviderConnectorProps {
  integration?: EmailProviderIntegration;
  provider: EmailProvider;
  onSave?: (config: any) => void;
  onTest?: (config: any) => Promise<boolean>;
  onCancel?: () => void;
  isEditing?: boolean;
}

interface EmailConfig {
  [key: string]: any;
  apiKey?: string;
  apiSecret?: string;
  senderId?: string;
  senderName?: string;
  replyTo?: string;
  datacenter?: string;
  listId?: string;
}

interface TestResult {
  isConnected: boolean;
  accountInfo?: {
    name: string;
    email: string;
    plan: string;
    monthlyQuota: number;
    usedQuota: number;
  };
  capabilities: EmailCapability[];
  templates: EmailTemplate[];
  domains: string[];
  error?: string;
}

const EmailProviderConnector: React.FC<EmailProviderConnectorProps> = ({
  integration,
  provider,
  onSave,
  onTest,
  onCancel,
  isEditing = false
}) => {
  const [config, setConfig] = useState<EmailConfig>({});
  const [isConnecting, setIsConnecting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [step, setStep] = useState<'config' | 'test' | 'settings' | 'confirm'>('config');
  const [emailSettings, setEmailSettings] = useState({
    defaultSender: '',
    defaultReplyTo: '',
    trackOpens: true,
    trackClicks: true,
    enableAnalytics: true,
    customDomain: ''
  });

  useEffect(() => {
    if (integration) {
      setConfig(integration.configuration.customFields || {});
    }
  }, [integration]);

  const getProviderConfig = () => {
    switch (provider) {
      case 'sendgrid':
        return {
          name: 'SendGrid',
          logo: '/images/integrations/sendgrid.svg',
          description: 'Reliable email delivery for transactional and marketing emails',
          fields: [
            { key: 'apiKey', label: 'API Key', type: 'password', required: true, placeholder: 'SG.xxxxxxxxxx' },
            { key: 'senderId', label: 'Verified Sender Email', type: 'email', required: true, placeholder: 'noreply@yourdomain.com' },
            { key: 'senderName', label: 'Sender Name', type: 'text', required: false, placeholder: 'Your Company' }
          ],
          capabilities: ['transactional', 'marketing', 'templates', 'analytics'] as EmailCapability[],
          documentation: 'https://docs.kairos.com/integrations/sendgrid',
          features: [
            'High deliverability rates',
            'Advanced analytics',
            'Template management',
            'A/B testing support',
            'Real-time event tracking'
          ]
        };
      case 'mailchimp':
        return {
          name: 'Mailchimp',
          logo: '/images/integrations/mailchimp.svg',
          description: 'All-in-one marketing platform for email campaigns and automation',
          fields: [
            { key: 'apiKey', label: 'API Key', type: 'password', required: true, placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-us1' },
            { key: 'listId', label: 'Default List ID', type: 'text', required: false, placeholder: 'xxxxxxxxxx' }
          ],
          capabilities: ['marketing', 'automation', 'segmentation', 'analytics'] as EmailCapability[],
          documentation: 'https://docs.kairos.com/integrations/mailchimp',
          features: [
            'Advanced segmentation',
            'Marketing automation',
            'Landing page builder',
            'Social media integration',
            'Audience insights'
          ]
        };
      case 'klaviyo':
        return {
          name: 'Klaviyo',
          logo: '/images/integrations/klaviyo.svg',
          description: 'Powerful email marketing and SMS platform for ecommerce',
          fields: [
            { key: 'apiKey', label: 'Private API Key', type: 'password', required: true, placeholder: 'pk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' },
            { key: 'publicKey', label: 'Public API Key', type: 'text', required: true, placeholder: 'xxxxxxxx' }
          ],
          capabilities: ['marketing', 'automation', 'segmentation', 'analytics'] as EmailCapability[],
          documentation: 'https://docs.kairos.com/integrations/klaviyo',
          features: [
            'Behavioral targeting',
            'SMS integration',
            'Predictive analytics',
            'Advanced flows',
            'Revenue attribution'
          ]
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
        accountInfo: {
          name: 'ACME Corp',
          email: 'admin@acme.com',
          plan: provider === 'sendgrid' ? 'Pro' : 'Standard',
          monthlyQuota: provider === 'sendgrid' ? 100000 : 50000,
          usedQuota: provider === 'sendgrid' ? 25000 : 12000
        },
        capabilities: providerConfig?.capabilities || [],
        templates: [
          {
            id: 'tpl-1',
            name: 'Welcome Email',
            subject: 'Welcome to {{company_name}}!',
            content: '<h1>Welcome!</h1><p>Thanks for joining us.</p>',
            isActive: true,
            category: 'onboarding',
            tags: ['welcome', 'new-user']
          },
          {
            id: 'tpl-2',
            name: 'Password Reset',
            subject: 'Reset your password',
            content: '<p>Click here to reset your password: {{reset_link}}</p>',
            isActive: true,
            category: 'transactional',
            tags: ['password', 'security']
          }
        ],
        domains: ['yourdomain.com', 'subdomain.yourdomain.com']
      };

      if (!isConnected) {
        mockResult.error = 'Invalid API key or network error';
      }

      setTestResult(mockResult);
      
      if (isConnected) {
        setTimeout(() => setStep('settings'), 1000);
      }
    } catch (error) {
      setTestResult({
        isConnected: false,
        capabilities: [],
        templates: [],
        domains: [],
        error: error instanceof Error ? error.message : 'Connection failed'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    setIsConnecting(true);
    try {
      const fullConfig = {
        ...config,
        provider,
        emailSettings,
        capabilities: testResult?.capabilities || []
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
      <div className="flex items-start space-x-4">
        <img
          src={providerConfig?.logo}
          alt={providerConfig?.name}
          className="w-16 h-16 rounded-lg object-contain bg-gray-50 p-3"
        />
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900">
            Connect to {providerConfig?.name}
          </h3>
          <p className="text-gray-600 mt-1">
            {providerConfig?.description}
          </p>
          
          {/* Features */}
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Key Features:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {providerConfig?.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Configuration Fields */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-gray-900">Configuration</h4>
        {providerConfig?.fields.map((field) => (
          <div key={field.key}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="relative">
              <Input
                type={field.type === 'password' && !showSecrets[field.key] ? 'password' : field.type}
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

      {/* Capabilities */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">Available Capabilities</h4>
        <div className="flex flex-wrap gap-2">
          {providerConfig?.capabilities.map((capability) => (
            <Badge key={capability} variant="secondary" className="capitalize">
              {capability.replace('-', ' ')}
            </Badge>
          ))}
        </div>
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
              Follow our step-by-step guide to configure your email integration.
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

            {/* Account Details */}
            {testResult.isConnected && testResult.accountInfo && (
              <div className="bg-gray-50 rounded-lg p-6 text-left">
                <h4 className="font-medium text-gray-900 mb-4">Account Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-3">
                    <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {testResult.accountInfo.name}
                      </div>
                      <div className="text-xs text-gray-600">
                        {testResult.accountInfo.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <ChartBarIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {testResult.accountInfo.plan} Plan
                      </div>
                      <div className="text-xs text-gray-600">Current Plan</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-xs font-medium text-blue-600">
                        {Math.round((testResult.accountInfo.usedQuota / testResult.accountInfo.monthlyQuota) * 100)}%
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {testResult.accountInfo.usedQuota.toLocaleString()} / {testResult.accountInfo.monthlyQuota.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-600">Monthly Quota</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <PlayIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {testResult.capabilities.length} Features
                      </div>
                      <div className="text-xs text-gray-600">Available</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Available Templates */}
            {testResult.isConnected && testResult.templates.length > 0 && (
              <div className="text-left">
                <h4 className="font-medium text-gray-900 mb-3">Available Templates</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {testResult.templates.slice(0, 4).map((template) => (
                    <Card key={template.id} variant="outline" className="text-left">
                      <CardBody className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h5 className="text-sm font-medium text-gray-900 truncate">
                              {template.name}
                            </h5>
                            <p className="text-xs text-gray-600 truncate">
                              {template.subject}
                            </p>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge variant="secondary" className="text-xs">
                                {template.category}
                              </Badge>
                              {template.isActive && (
                                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                  Active
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
                {testResult.templates.length > 4 && (
                  <p className="text-sm text-gray-500 mt-2">
                    +{testResult.templates.length - 4} more templates available
                  </p>
                )}
              </div>
            )}

            {/* Verified Domains */}
            {testResult.isConnected && testResult.domains.length > 0 && (
              <div className="text-left">
                <h4 className="font-medium text-gray-900 mb-3">Verified Domains</h4>
                <div className="flex flex-wrap gap-2">
                  {testResult.domains.map((domain) => (
                    <Badge key={domain} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      <CheckCircleIcon className="w-3 h-3 mr-1" />
                      {domain}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Error Details */}
            {!testResult.isConnected && testResult.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left">
                <h4 className="font-medium text-red-900 mb-2">Error Details</h4>
                <p className="text-sm text-red-700">{testResult.error}</p>
                <div className="mt-3 text-sm text-red-600">
                  <p className="font-medium">Common solutions:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Verify your API key is correct and active</li>
                    <li>Check if your account has the required permissions</li>
                    <li>Ensure your firewall allows outbound connections</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep('config')}>
                Back
              </Button>
              {testResult.isConnected ? (
                <Button variant="primary" onClick={() => setStep('settings')}>
                  Configure Settings
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

  const renderSettingsStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Email Settings
        </h3>
        <p className="text-gray-600">
          Configure default settings for your email integration
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sender Settings */}
        <Card variant="outline">
          <CardHeader>
            <h4 className="font-medium text-gray-900">Sender Configuration</h4>
          </CardHeader>
          <CardBody className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Sender Email
              </label>
              <Input
                type="email"
                placeholder="noreply@yourdomain.com"
                value={emailSettings.defaultSender}
                onChange={(e) => setEmailSettings(prev => ({ ...prev, defaultSender: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Reply-To Email
              </label>
              <Input
                type="email"
                placeholder="support@yourdomain.com"
                value={emailSettings.defaultReplyTo}
                onChange={(e) => setEmailSettings(prev => ({ ...prev, defaultReplyTo: e.target.value }))}
              />
            </div>
            {provider !== 'mailchimp' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Domain (Optional)
                </label>
                <Input
                  type="text"
                  placeholder="mail.yourdomain.com"
                  value={emailSettings.customDomain}
                  onChange={(e) => setEmailSettings(prev => ({ ...prev, customDomain: e.target.value }))}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Custom domain for email sending (requires DNS configuration)
                </p>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Tracking Settings */}
        <Card variant="outline">
          <CardHeader>
            <h4 className="font-medium text-gray-900">Tracking & Analytics</h4>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={emailSettings.trackOpens}
                  onChange={(e) => setEmailSettings(prev => ({ ...prev, trackOpens: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">Track Email Opens</span>
                  <p className="text-xs text-gray-500">Monitor when recipients open your emails</p>
                </div>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={emailSettings.trackClicks}
                  onChange={(e) => setEmailSettings(prev => ({ ...prev, trackClicks: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">Track Link Clicks</span>
                  <p className="text-xs text-gray-500">Monitor clicks on links within emails</p>
                </div>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={emailSettings.enableAnalytics}
                  onChange={(e) => setEmailSettings(prev => ({ ...prev, enableAnalytics: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">Enable Advanced Analytics</span>
                  <p className="text-xs text-gray-500">Detailed reporting and campaign insights</p>
                </div>
              </label>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Capabilities Summary */}
      <Card variant="outline">
        <CardHeader>
          <h4 className="font-medium text-gray-900">Integration Capabilities</h4>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {testResult?.capabilities.map((capability) => (
              <div key={capability} className="flex items-center space-x-2">
                <CheckCircleIcon className="w-5 h-5 text-green-500" />
                <span className="text-sm text-gray-900 capitalize">
                  {capability.replace('-', ' ')}
                </span>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep('test')}>
          Back
        </Button>
        <Button variant="primary" onClick={() => setStep('confirm')}>
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Connection Summary */}
        <Card variant="outline">
          <CardHeader>
            <h4 className="font-medium text-gray-900">Connection Details</h4>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <img
                  src={providerConfig?.logo}
                  alt={providerConfig?.name}
                  className="w-8 h-8 rounded object-contain bg-gray-50 p-1"
                />
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {providerConfig?.name}
                  </div>
                  <div className="text-xs text-gray-600">
                    {testResult?.accountInfo?.plan} Plan
                  </div>
                </div>
              </div>
              <div className="text-sm">
                <span className="text-gray-600">Account:</span>
                <span className="font-medium text-gray-900 ml-1">
                  {testResult?.accountInfo?.email}
                </span>
              </div>
              <div className="text-sm">
                <span className="text-gray-600">Templates:</span>
                <span className="font-medium text-gray-900 ml-1">
                  {testResult?.templates.length || 0} available
                </span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Settings Summary */}
        <Card variant="outline">
          <CardHeader>
            <h4 className="font-medium text-gray-900">Email Settings</h4>
          </CardHeader>
          <CardBody>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Default Sender:</span>
                <span className="font-medium text-gray-900">
                  {emailSettings.defaultSender || 'Not set'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Reply-To:</span>
                <span className="font-medium text-gray-900">
                  {emailSettings.defaultReplyTo || 'Not set'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Track Opens:</span>
                <Badge variant={emailSettings.trackOpens ? "secondary" : "outline"} className="text-xs">
                  {emailSettings.trackOpens ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Track Clicks:</span>
                <Badge variant={emailSettings.trackClicks ? "secondary" : "outline"} className="text-xs">
                  {emailSettings.trackClicks ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Analytics:</span>
                <Badge variant={emailSettings.enableAnalytics ? "secondary" : "outline"} className="text-xs">
                  {emailSettings.enableAnalytics ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Capabilities */}
      <Card variant="outline">
        <CardHeader>
          <h4 className="font-medium text-gray-900">Available Capabilities</h4>
        </CardHeader>
        <CardBody>
          <div className="flex flex-wrap gap-2">
            {testResult?.capabilities.map((capability) => (
              <Badge key={capability} variant="secondary" className="capitalize">
                {capability.replace('-', ' ')}
              </Badge>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep('settings')}>
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
          The email provider "{provider}" is not yet supported.
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
            { key: 'settings', label: 'Email Settings' },
            { key: 'confirm', label: 'Confirm' }
          ].map((stepItem, index) => (
            <div key={stepItem.key} className="flex items-center">
              <div className={classNames(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                step === stepItem.key
                  ? "bg-blue-600 text-white"
                  : index < ['config', 'test', 'settings', 'confirm'].indexOf(step)
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 text-gray-600"
              )}>
                {index < ['config', 'test', 'settings', 'confirm'].indexOf(step) ? (
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
                  index < ['config', 'test', 'settings', 'confirm'].indexOf(step)
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
          {step === 'settings' && renderSettingsStep()}
          {step === 'confirm' && renderConfirmStep()}
        </CardBody>
      </Card>
    </div>
  );
};

export default EmailProviderConnector;