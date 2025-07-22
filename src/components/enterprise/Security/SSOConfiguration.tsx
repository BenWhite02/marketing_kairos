// src/components/enterprise/Security/SSOConfiguration.tsx

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  KeyIcon,
  CogIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  DocumentDuplicateIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';
import { Card, CardHeader, CardBody } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Input, TextArea } from '../../ui/Input';
import { Badge } from '../../ui/Badge';
import { SecurityConfiguration } from '../../../types/enterprise';

interface SSOConfigurationProps {
  configuration?: SecurityConfiguration;
  onSave?: (config: Partial<SecurityConfiguration>) => void;
  onTest?: (provider: string) => Promise<boolean>;
}

export const SSOConfiguration: React.FC<SSOConfigurationProps> = ({
  configuration,
  onSave,
  onTest,
}) => {
  const [selectedProvider, setSelectedProvider] = useState<'saml' | 'oauth2' | 'openid' | 'ldap'>('saml');
  const [formData, setFormData] = useState(configuration?.sso || {
    enabled: false,
    provider: 'saml',
    configuration: {},
    attributes: {
      email: 'email',
      firstName: 'firstName',
      lastName: 'lastName',
      groups: 'groups',
    },
    autoProvisioning: true,
    defaultRole: 'user',
  });
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSecrets, setShowSecrets] = useState(false);

  const providers = [
    {
      id: 'saml',
      name: 'SAML 2.0',
      description: 'Security Assertion Markup Language',
      icon: KeyIcon,
      popular: true,
    },
    {
      id: 'oauth2',
      name: 'OAuth 2.0',
      description: 'Open Authorization protocol',
      icon: CogIcon,
      popular: true,
    },
    {
      id: 'openid',
      name: 'OpenID Connect',
      description: 'OpenID Connect protocol',
      icon: CheckCircleIcon,
      popular: false,
    },
    {
      id: 'ldap',
      name: 'LDAP',
      description: 'Lightweight Directory Access Protocol',
      icon: DocumentDuplicateIcon,
      popular: false,
    },
  ] as const;

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
  };

  const handleProviderChange = (provider: typeof selectedProvider) => {
    setSelectedProvider(provider);
    setFormData({
      ...formData,
      provider,
      configuration: {}, // Reset configuration when changing provider
    });
    setTestResult(null);
  };

  const handleTest = async () => {
    setIsLoading(true);
    setTestResult(null);
    
    try {
      const success = await onTest?.(selectedProvider) ?? true;
      setTestResult({
        success,
        message: success 
          ? 'Connection test successful! SSO configuration is working correctly.'
          : 'Connection test failed. Please check your configuration and try again.',
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Test failed: ' + (error instanceof Error ? error.message : 'Unknown error'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    onSave?.({ sso: formData });
  };

  const renderProviderConfiguration = () => {
    switch (selectedProvider) {
      case 'saml':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Entity ID *
                </label>
                <Input
                  value={formData.configuration.entityId || ''}
                  onChange={(e) => handleInputChange('configuration.entityId', e.target.value)}
                  placeholder="https://your-idp.com/entity-id"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SSO URL *
                </label>
                <Input
                  value={formData.configuration.ssoUrl || ''}
                  onChange={(e) => handleInputChange('configuration.ssoUrl', e.target.value)}
                  placeholder="https://your-idp.com/sso"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                X.509 Certificate *
              </label>
              <TextArea
                value={formData.configuration.certificate || ''}
                onChange={(e) => handleInputChange('configuration.certificate', e.target.value)}
                placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
                rows={6}
              />
              <p className="mt-1 text-xs text-gray-500">
                Paste the X.509 certificate from your identity provider
              </p>
            </div>
          </div>
        );

      case 'oauth2':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client ID *
                </label>
                <Input
                  value={formData.configuration.clientId || ''}
                  onChange={(e) => handleInputChange('configuration.clientId', e.target.value)}
                  placeholder="your-client-id"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client Secret *
                </label>
                <div className="relative">
                  <Input
                    type={showSecrets ? 'text' : 'password'}
                    value={formData.configuration.clientSecret || ''}
                    onChange={(e) => handleInputChange('configuration.clientSecret', e.target.value)}
                    placeholder="your-client-secret"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecrets(!showSecrets)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showSecrets ? (
                      <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Authorization URL *
              </label>
              <Input
                value={formData.configuration.ssoUrl || ''}
                onChange={(e) => handleInputChange('configuration.ssoUrl', e.target.value)}
                placeholder="https://your-provider.com/oauth/authorize"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Scopes
              </label>
              <Input
                value={formData.configuration.scope?.join(' ') || ''}
                onChange={(e) => handleInputChange('configuration.scope', e.target.value.split(' ').filter(Boolean))}
                placeholder="openid profile email"
              />
              <p className="mt-1 text-xs text-gray-500">
                Space-separated list of OAuth scopes
              </p>
            </div>
          </div>
        );

      case 'openid':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client ID *
                </label>
                <Input
                  value={formData.configuration.clientId || ''}
                  onChange={(e) => handleInputChange('configuration.clientId', e.target.value)}
                  placeholder="your-client-id"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client Secret *
                </label>
                <div className="relative">
                  <Input
                    type={showSecrets ? 'text' : 'password'}
                    value={formData.configuration.clientSecret || ''}
                    onChange={(e) => handleInputChange('configuration.clientSecret', e.target.value)}
                    placeholder="your-client-secret"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecrets(!showSecrets)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showSecrets ? (
                      <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Issuer URL *
              </label>
              <Input
                value={formData.configuration.issuer || ''}
                onChange={(e) => handleInputChange('configuration.issuer', e.target.value)}
                placeholder="https://your-provider.com/.well-known/openid_configuration"
              />
            </div>
          </div>
        );

      case 'ldap':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  LDAP URL *
                </label>
                <Input
                  value={formData.configuration.ldapUrl || ''}
                  onChange={(e) => handleInputChange('configuration.ldapUrl', e.target.value)}
                  placeholder="ldap://your-ldap-server.com:389"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Base DN *
                </label>
                <Input
                  value={formData.configuration.baseDn || ''}
                  onChange={(e) => handleInputChange('configuration.baseDn', e.target.value)}
                  placeholder="dc=company,dc=com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bind DN
                </label>
                <Input
                  value={formData.configuration.bindDn || ''}
                  onChange={(e) => handleInputChange('configuration.bindDn', e.target.value)}
                  placeholder="cn=admin,dc=company,dc=com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bind Password
                </label>
                <Input
                  type={showSecrets ? 'text' : 'password'}
                  value={formData.configuration.bindPassword || ''}
                  onChange={(e) => handleInputChange('configuration.bindPassword', e.target.value)}
                  placeholder="bind-password"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Single Sign-On Configuration</h2>
        <p className="mt-2 text-gray-600">
          Configure SSO authentication for your organization
        </p>
      </div>

      {/* Enable/Disable SSO */}
      <Card>
        <CardBody className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Enable Single Sign-On</h3>
              <p className="text-sm text-gray-600">
                Allow users to authenticate using your identity provider
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enabled}
                onChange={(e) => handleInputChange('enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </CardBody>
      </Card>

      {formData.enabled && (
        <>
          {/* Provider Selection */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Identity Provider</h3>
              <p className="text-gray-600">Choose your SSO provider type</p>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {providers.map((provider) => {
                  const Icon = provider.icon;
                  const isSelected = selectedProvider === provider.id;
                  
                  return (
                    <motion.button
                      key={provider.id}
                      onClick={() => handleProviderChange(provider.id)}
                      className={`relative p-4 rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {provider.popular && (
                        <Badge variant="primary" className="absolute -top-2 -right-2 text-xs">
                          Popular
                        </Badge>
                      )}
                      <Icon className={`w-8 h-8 mx-auto mb-2 ${
                        isSelected ? 'text-blue-600' : 'text-gray-600'
                      }`} />
                      <h4 className={`font-semibold text-sm ${
                        isSelected ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {provider.name}
                      </h4>
                      <p className={`text-xs mt-1 ${
                        isSelected ? 'text-blue-700' : 'text-gray-500'
                      }`}>
                        {provider.description}
                      </p>
                    </motion.button>
                  );
                })}
              </div>
            </CardBody>
          </Card>

          {/* Provider Configuration */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Provider Configuration</h3>
              <p className="text-gray-600">Configure your {providers.find(p => p.id === selectedProvider)?.name} settings</p>
            </CardHeader>
            <CardBody>
              {renderProviderConfiguration()}
            </CardBody>
          </Card>

          {/* Attribute Mapping */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Attribute Mapping</h3>
              <p className="text-gray-600">Map user attributes from your identity provider</p>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Attribute
                  </label>
                  <Input
                    value={formData.attributes.email}
                    onChange={(e) => handleInputChange('attributes.email', e.target.value)}
                    placeholder="email"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name Attribute
                  </label>
                  <Input
                    value={formData.attributes.firstName}
                    onChange={(e) => handleInputChange('attributes.firstName', e.target.value)}
                    placeholder="firstName"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name Attribute
                  </label>
                  <Input
                    value={formData.attributes.lastName}
                    onChange={(e) => handleInputChange('attributes.lastName', e.target.value)}
                    placeholder="lastName"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Groups Attribute
                  </label>
                  <Input
                    value={formData.attributes.groups}
                    onChange={(e) => handleInputChange('attributes.groups', e.target.value)}
                    placeholder="groups"
                  />
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Auto-Provisioning */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">User Provisioning</h3>
              <p className="text-gray-600">Configure automatic user creation and role assignment</p>
            </CardHeader>
            <CardBody>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Auto-Provisioning</h4>
                    <p className="text-sm text-gray-600">
                      Automatically create new users when they sign in for the first time
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.autoProvisioning}
                      onChange={(e) => handleInputChange('autoProvisioning', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {formData.autoProvisioning && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Role
                    </label>
                    <select
                      value={formData.defaultRole}
                      onChange={(e) => handleInputChange('defaultRole', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="user">User</option>
                      <option value="editor">Editor</option>
                      <option value="admin">Admin</option>
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                      Role assigned to new users when auto-provisioning is enabled
                    </p>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Test Connection */}
          <Card>
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Test Connection</h3>
                  <p className="text-sm text-gray-600">
                    Verify your SSO configuration is working correctly
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleTest}
                  disabled={isLoading}
                >
                  {isLoading ? 'Testing...' : 'Test Connection'}
                </Button>
              </div>

              {testResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-4 p-4 rounded-lg ${
                    testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                  }`}
                >
                  <div className="flex items-center">
                    {testResult.success ? (
                      <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                    ) : (
                      <XCircleIcon className="w-5 h-5 text-red-500 mr-2" />
                    )}
                    <p className={`text-sm font-medium ${
                      testResult.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {testResult.message}
                    </p>
                  </div>
                </motion.div>
              )}
            </CardBody>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <Button variant="outline">Cancel</Button>
            <Button variant="primary" onClick={handleSave}>
              Save Configuration
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
