// src/components/features/Integrations/DataWarehouse/DataWarehouseConnector.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  CircleStackIcon,
  TableCellsIcon,
  DocumentTextIcon,
  EyeIcon,
  EyeSlashIcon,
  ChartBarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { Button } from '../../../ui/Button';
import { Input } from '../../../ui/Input';
import { Card, CardHeader, CardBody } from '../../../ui/Card';
import { Badge } from '../../../ui/Badge';
import { DataWarehouseIntegration, DataWarehouseProvider, DataSchema, QueryCapability } from '../../../../types/integrations';
import { classNames } from '../../../../utils/dom/classNames';

interface DataWarehouseConnectorProps {
  integration?: DataWarehouseIntegration;
  provider: DataWarehouseProvider;
  onSave?: (config: any) => void;
  onTest?: (config: any) => Promise<boolean>;
  onCancel?: () => void;
  isEditing?: boolean;
}

interface WarehouseConfig {
  [key: string]: any;
  connectionString?: string;
  host?: string;
  database?: string;
  schema?: string;
  username?: string;
  password?: string;
  warehouse?: string;
  role?: string;
  account?: string;
  project?: string;
  dataset?: string;
  keyFile?: string;
}

interface TestResult {
  isConnected: boolean;
  connectionInfo?: {
    version: string;
    region: string;
    type: string;
    size: string;
  };
  schemas: DataSchema[];
  capabilities: QueryCapability[];
  performance?: {
    connectionTime: number;
    queryTime: number;
    dataTransferRate: string;
  };
  error?: string;
}

const DataWarehouseConnector: React.FC<DataWarehouseConnectorProps> = ({
  integration,
  provider,
  onSave,
  onTest,
  onCancel,
  isEditing = false
}) => {
  const [config, setConfig] = useState<WarehouseConfig>({});
  const [isConnecting, setIsConnecting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [step, setStep] = useState<'config' | 'test' | 'schemas' | 'confirm'>('config');
  const [selectedSchemas, setSelectedSchemas] = useState<string[]>([]);
  const [queryLimits, setQueryLimits] = useState({
    maxRowsPerQuery: 10000,
    maxQueriesPerHour: 100,
    enableCaching: true,
    timeoutSeconds: 300
  });

  useEffect(() => {
    if (integration) {
      setConfig(integration.configuration.customFields || {});
    }
  }, [integration]);

  const getProviderConfig = () => {
    switch (provider) {
      case 'snowflake':
        return {
          name: 'Snowflake',
          logo: '/images/integrations/snowflake.svg',
          description: 'Cloud data platform for analytics and data engineering',
          fields: [
            { key: 'account', label: 'Account Identifier', type: 'text', required: true, placeholder: 'ab12345.us-east-1' },
            { key: 'username', label: 'Username', type: 'text', required: true, placeholder: 'your-username' },
            { key: 'password', label: 'Password', type: 'password', required: true, placeholder: 'your-password' },
            { key: 'warehouse', label: 'Warehouse', type: 'text', required: true, placeholder: 'COMPUTE_WH' },
            { key: 'database', label: 'Database', type: 'text', required: true, placeholder: 'your-database' },
            { key: 'schema', label: 'Default Schema', type: 'text', required: false, placeholder: 'PUBLIC' },
            { key: 'role', label: 'Role', type: 'text', required: false, placeholder: 'ACCOUNTADMIN' }
          ],
          capabilities: ['select', 'insert', 'update', 'delete', 'aggregate', 'join', 'window-functions'] as QueryCapability[],
          documentation: 'https://docs.kairos.com/integrations/snowflake',
          features: [
            'Automatic scaling',
            'Zero-copy cloning',
            'Time travel',
            'Multi-cluster warehouses',
            'Advanced security'
          ]
        };
      case 'bigquery':
        return {
          name: 'Google BigQuery',
          logo: '/images/integrations/bigquery.svg',
          description: 'Serverless, highly scalable data warehouse',
          fields: [
            { key: 'project', label: 'Project ID', type: 'text', required: true, placeholder: 'your-gcp-project' },
            { key: 'dataset', label: 'Default Dataset', type: 'text', required: false, placeholder: 'your-dataset' },
            { key: 'keyFile', label: 'Service Account Key (JSON)', type: 'textarea', required: true, placeholder: 'Paste your service account JSON key here' }
          ],
          capabilities: ['select', 'insert', 'update', 'delete', 'aggregate', 'join', 'window-functions'] as QueryCapability[],
          documentation: 'https://docs.kairos.com/integrations/bigquery',
          features: [
            'Serverless architecture',
            'Built-in machine learning',
            'Real-time analytics',
            'Petabyte scale',
            'Standard SQL support'
          ]
        };
      case 'redshift':
        return {
          name: 'Amazon Redshift',
          logo: '/images/integrations/redshift.svg',
          description: 'Fast, simple, cost-effective data warehouse',
          fields: [
            { key: 'host', label: 'Cluster Endpoint', type: 'text', required: true, placeholder: 'your-cluster.abcdef.us-west-2.redshift.amazonaws.com' },
            { key: 'database', label: 'Database Name', type: 'text', required: true, placeholder: 'your-database' },
            { key: 'username', label: 'Username', type: 'text', required: true, placeholder: 'your-username' },
            { key: 'password', label: 'Password', type: 'password', required: true, placeholder: 'your-password' },
            { key: 'port', label: 'Port', type: 'number', required: false, placeholder: '5439' }
          ],
          capabilities: ['select', 'insert', 'update', 'delete', 'aggregate', 'join'] as QueryCapability[],
          documentation: 'https://docs.kairos.com/integrations/redshift',
          features: [
            'Columnar storage',
            'Massively parallel processing',
            'Advanced compression',
            'Result caching',
            'Automated backups'
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
        connectionInfo: {
          version: provider === 'snowflake' ? '7.3.0' : provider === 'bigquery' ? '2.0' : '1.0.35',
          region: provider === 'snowflake' ? 'us-east-1' : provider === 'bigquery' ? 'us-central1' : 'us-west-2',
          type: provider === 'snowflake' ? 'Standard' : provider === 'bigquery' ? 'Serverless' : 'dc2.large',
          size: provider === 'snowflake' ? 'Small' : provider === 'bigquery' ? 'N/A' : '2 nodes'
        },
        schemas: [
          {
            name: 'PUBLIC',
            tables: [
              { name: 'customers', columns: [
                { name: 'id', dataType: 'NUMBER', isNullable: false, isPrimaryKey: true, isForeignKey: false },
                { name: 'email', dataType: 'VARCHAR', isNullable: false, isPrimaryKey: false, isForeignKey: false },
                { name: 'created_at', dataType: 'TIMESTAMP', isNullable: false, isPrimaryKey: false, isForeignKey: false }
              ], rowCount: 150000, lastUpdated: new Date() },
              { name: 'orders', columns: [
                { name: 'id', dataType: 'NUMBER', isNullable: false, isPrimaryKey: true, isForeignKey: false },
                { name: 'customer_id', dataType: 'NUMBER', isNullable: false, isPrimaryKey: false, isForeignKey: true },
                { name: 'total', dataType: 'DECIMAL', isNullable: false, isPrimaryKey: false, isForeignKey: false }
              ], rowCount: 500000, lastUpdated: new Date() }
            ]
          },
          {
            name: 'ANALYTICS',
            tables: [
              { name: 'user_events', columns: [
                { name: 'event_id', dataType: 'VARCHAR', isNullable: false, isPrimaryKey: true, isForeignKey: false },
                { name: 'user_id', dataType: 'NUMBER', isNullable: false, isPrimaryKey: false, isForeignKey: true },
                { name: 'event_type', dataType: 'VARCHAR', isNullable: false, isPrimaryKey: false, isForeignKey: false }
              ], rowCount: 2500000, lastUpdated: new Date() }
            ]
          }
        ],
        capabilities: providerConfig?.capabilities || [],
        performance: {
          connectionTime: 1250,
          queryTime: 850,
          dataTransferRate: '15.2 MB/s'
        }
      };

      if (!isConnected) {
        mockResult.error = 'Connection failed: Invalid credentials or network timeout';
      }

      setTestResult(mockResult);
      
      if (isConnected) {
        setSelectedSchemas(mockResult.schemas.map(s => s.name));
        setTimeout(() => setStep('schemas'), 1000);
      }
    } catch (error) {
      setTestResult({
        isConnected: false,
        schemas: [],
        capabilities: [],
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
        selectedSchemas,
        queryLimits,
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

  const getTotalTables = () => {
    return testResult?.schemas
      .filter(schema => selectedSchemas.includes(schema.name))
      .reduce((total, schema) => total + schema.tables.length, 0) || 0;
  };

  const getTotalRows = () => {
    return testResult?.schemas
      .filter(schema => selectedSchemas.includes(schema.name))
      .reduce((total, schema) => 
        total + schema.tables.reduce((schemaTotal, table) => schemaTotal + table.rowCount, 0), 0) || 0;
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
        <h4 className="text-lg font-medium text-gray-900">Connection Configuration</h4>
        {providerConfig?.fields.map((field) => (
          <div key={field.key}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="relative">
              {field.type === 'textarea' ? (
                <textarea
                  placeholder={field.placeholder}
                  value={config[field.key] || ''}
                  onChange={(e) => handleConfigChange(field.key, e.target.value)}
                  required={field.required}
                  rows={6}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              ) : (
                <Input
                  type={field.type === 'password' && !showSecrets[field.key] ? 'password' : field.type}
                  placeholder={field.placeholder}
                  value={config[field.key] || ''}
                  onChange={(e) => handleConfigChange(field.key, e.target.value)}
                  required={field.required}
                />
              )}
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
            {field.key === 'keyFile' && (
              <p className="text-xs text-gray-500 mt-1">
                Download your service account key from Google Cloud Console
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Query Capabilities */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">Supported Query Capabilities</h4>
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
              Follow our step-by-step guide to configure your data warehouse connection.
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
            {testResult.isConnected && testResult.connectionInfo && (
              <div className="bg-gray-50 rounded-lg p-6 text-left">
                <h4 className="font-medium text-gray-900 mb-4">Connection Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-3">
                    <CircleStackIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        Version {testResult.connectionInfo.version}
                      </div>
                      <div className="text-xs text-gray-600">Database Version</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <ChartBarIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {testResult.connectionInfo.region}
                      </div>
                      <div className="text-xs text-gray-600">Region</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <TableCellsIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {testResult.connectionInfo.type}
                      </div>
                      <div className="text-xs text-gray-600">Instance Type</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <ClockIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {testResult.connectionInfo.size}
                      </div>
                      <div className="text-xs text-gray-600">Size</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Performance Metrics */}
            {testResult.isConnected && testResult.performance && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-left">
                <h4 className="font-medium text-green-900 mb-3">Performance Metrics</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-green-700">Connection Time:</span>
                    <span className="font-medium text-green-900 ml-1">
                      {testResult.performance.connectionTime}ms
                    </span>
                  </div>
                  <div>
                    <span className="text-green-700">Query Time:</span>
                    <span className="font-medium text-green-900 ml-1">
                      {testResult.performance.queryTime}ms
                    </span>
                  </div>
                  <div>
                    <span className="text-green-700">Transfer Rate:</span>
                    <span className="font-medium text-green-900 ml-1">
                      {testResult.performance.dataTransferRate}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Schemas Overview */}
            {testResult.isConnected && testResult.schemas.length > 0 && (
              <div className="text-left">
                <h4 className="font-medium text-gray-900 mb-3">Available Schemas</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {testResult.schemas.slice(0, 4).map((schema) => (
                    <Card key={schema.name} variant="outline">
                      <CardBody className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="text-sm font-medium text-gray-900">
                              {schema.name}
                            </h5>
                            <p className="text-xs text-gray-600">
                              {schema.tables.length} tables
                            </p>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {schema.tables.reduce((sum, table) => sum + table.rowCount, 0).toLocaleString()} rows
                          </Badge>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
                {testResult.schemas.length > 4 && (
                  <p className="text-sm text-gray-500 mt-2">
                    +{testResult.schemas.length - 4} more schemas available
                  </p>
                )}
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
                    <li>Verify your connection parameters are correct</li>
                    <li>Check if your account has the required permissions</li>
                    <li>Ensure your firewall allows connections to the warehouse</li>
                    <li>Verify the warehouse/cluster is running</li>
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
                <Button variant="primary" onClick={() => setStep('schemas')}>
                  Configure Schemas
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

  const renderSchemasStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Schema Selection
        </h3>
        <p className="text-gray-600">
          Choose which schemas to include in your integration
        </p>
      </div>

      {/* Schema Selection */}
      <div className="space-y-4">
        {testResult?.schemas.map((schema) => (
          <Card key={schema.name} variant="outline">
            <CardHeader>
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedSchemas.includes(schema.name)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedSchemas(prev => [...prev, schema.name]);
                      } else {
                        setSelectedSchemas(prev => prev.filter(s => s !== schema.name));
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">{schema.name}</h4>
                    <p className="text-sm text-gray-600">
                      {schema.tables.length} tables • {schema.tables.reduce((sum, table) => sum + table.rowCount, 0).toLocaleString()} total rows
                    </p>
                  </div>
                </label>
                <Badge variant="secondary">
                  {schema.tables.length} tables
                </Badge>
              </div>
            </CardHeader>
            {selectedSchemas.includes(schema.name) && (
              <CardBody>
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-gray-900">Tables:</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {schema.tables.map((table) => (
                      <div key={table.name} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm text-gray-900">{table.name}</span>
                        <span className="text-xs text-gray-500">
                          {table.rowCount.toLocaleString()} rows
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardBody>
            )}
          </Card>
        ))}
      </div>

      {/* Query Limits */}
      <Card variant="outline">
        <CardHeader>
          <h4 className="font-medium text-gray-900">Query Limits & Settings</h4>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Rows per Query
              </label>
              <Input
                type="number"
                value={queryLimits.maxRowsPerQuery}
                onChange={(e) => setQueryLimits(prev => ({ ...prev, maxRowsPerQuery: parseInt(e.target.value) }))}
                min="1000"
                max="100000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Queries per Hour
              </label>
              <Input
                type="number"
                value={queryLimits.maxQueriesPerHour}
                onChange={(e) => setQueryLimits(prev => ({ ...prev, maxQueriesPerHour: parseInt(e.target.value) }))}
                min="10"
                max="1000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Query Timeout (seconds)
              </label>
              <Input
                type="number"
                value={queryLimits.timeoutSeconds}
                onChange={(e) => setQueryLimits(prev => ({ ...prev, timeoutSeconds: parseInt(e.target.value) }))}
                min="30"
                max="3600"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="enableCaching"
                checked={queryLimits.enableCaching}
                onChange={(e) => setQueryLimits(prev => ({ ...prev, enableCaching: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="enableCaching" className="text-sm text-gray-900">
                Enable query result caching
              </label>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Selection Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-blue-700">Schemas:</span>
            <span className="font-medium text-blue-900 ml-1">
              {selectedSchemas.length}
            </span>
          </div>
          <div>
            <span className="text-blue-700">Tables:</span>
            <span className="font-medium text-blue-900 ml-1">
              {getTotalTables()}
            </span>
          </div>
          <div>
            <span className="text-blue-700">Total Rows:</span>
            <span className="font-medium text-blue-900 ml-1">
              {getTotalRows().toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep('test')}>
          Back
        </Button>
        <Button
          variant="primary"
          onClick={() => setStep('confirm')}
          disabled={selectedSchemas.length === 0}
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
                    {testResult?.connectionInfo?.type} • {testResult?.connectionInfo?.region}
                  </div>
                </div>
              </div>
              <div className="text-sm">
                <span className="text-gray-600">Version:</span>
                <span className="font-medium text-gray-900 ml-1">
                  {testResult?.connectionInfo?.version}
                </span>
              </div>
              <div className="text-sm">
                <span className="text-gray-600">Performance:</span>
                <span className="font-medium text-gray-900 ml-1">
                  {testResult?.performance?.connectionTime}ms connection
                </span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Schema Summary */}
        <Card variant="outline">
          <CardHeader>
            <h4 className="font-medium text-gray-900">Data Summary</h4>
          </CardHeader>
          <CardBody>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Selected Schemas:</span>
                <span className="font-medium text-gray-900">
                  {selectedSchemas.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Tables:</span>
                <span className="font-medium text-gray-900">
                  {getTotalTables()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Rows:</span>
                <span className="font-medium text-gray-900">
                  {getTotalRows().toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Query Limit:</span>
                <span className="font-medium text-gray-900">
                  {queryLimits.maxRowsPerQuery.toLocaleString()} rows
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Caching:</span>
                <Badge variant={queryLimits.enableCaching ? "secondary" : "outline"} className="text-xs">
                  {queryLimits.enableCaching ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Selected Schemas */}
      <Card variant="outline">
        <CardHeader>
          <h4 className="font-medium text-gray-900">Selected Schemas</h4>
        </CardHeader>
        <CardBody>
          <div className="flex flex-wrap gap-2">
            {selectedSchemas.map((schemaName) => (
              <Badge key={schemaName} variant="secondary">
                {schemaName}
              </Badge>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Capabilities */}
      <Card variant="outline">
        <CardHeader>
          <h4 className="font-medium text-gray-900">Query Capabilities</h4>
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
        <Button variant="outline" onClick={() => setStep('schemas')}>
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
          The data warehouse provider "{provider}" is not yet supported.
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
            { key: 'schemas', label: 'Schema Selection' },
            { key: 'confirm', label: 'Confirm' }
          ].map((stepItem, index) => (
            <div key={stepItem.key} className="flex items-center">
              <div className={classNames(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                step === stepItem.key
                  ? "bg-blue-600 text-white"
                  : index < ['config', 'test', 'schemas', 'confirm'].indexOf(step)
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 text-gray-600"
              )}>
                {index < ['config', 'test', 'schemas', 'confirm'].indexOf(step) ? (
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
                  index < ['config', 'test', 'schemas', 'confirm'].indexOf(step)
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
          {step === 'schemas' && renderSchemasStep()}
          {step === 'confirm' && renderConfirmStep()}
        </CardBody>
      </Card>
    </div>
  );
};

export default DataWarehouseConnector;