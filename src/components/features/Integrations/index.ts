// src/components/features/Integrations/index.ts

// Main Dashboard and Management
export { default as IntegrationsDashboard } from './IntegrationsDashboard';
export { default as IntegrationMarketplace } from './IntegrationMarketplace';

// CRM Integrations
export { default as CRMConnector } from './CRM/CRMConnector';

// Email Provider Integrations  
export { default as EmailProviderConnector } from './Email/EmailProviderConnector';

// Data Warehouse Integrations
export { default as DataWarehouseConnector } from './DataWarehouse/DataWarehouseConnector';

// Types and Interfaces
export type {
  Integration,
  IntegrationTemplate,
  CRMIntegration,
  EmailProviderIntegration,
  DataWarehouseIntegration,
  IntegrationType,
  IntegrationCategory,
  IntegrationStatus,
  IntegrationHealth,
  IntegrationEvent,
  CRMProvider,
  EmailProvider,
  DataWarehouseProvider,
  FieldMapping,
  DataMapping,
  WebhookIntegration
} from '../../types/integrations';

// Store and Hooks
export { useIntegrationStore, useFilteredIntegrations, useIntegrationHealth as useIntegrationHealthSelector } from '../../stores/integrations/integrationStore';
export { 
  default as useIntegrations,
  useCRMIntegrations,
  useEmailIntegrations, 
  useDataWarehouseIntegrations,
  useIntegrationHealth
} from '../../hooks/business/useIntegrations';

// Utilities and Constants
export const INTEGRATION_CATEGORIES = [
  'customer-data',
  'marketing-automation', 
  'analytics-reporting',
  'communication',
  'data-storage',
  'authentication',
  'e-commerce',
  'custom'
] as const;

export const INTEGRATION_TYPES = [
  'crm',
  'email-provider',
  'social-media',
  'analytics', 
  'data-warehouse',
  'e-commerce',
  'sso',
  'webhook',
  'custom'
] as const;

export const CRM_PROVIDERS = [
  'salesforce',
  'hubspot', 
  'dynamics-365',
  'pipedrive',
  'zoho',
  'custom'
] as const;

export const EMAIL_PROVIDERS = [
  'sendgrid',
  'mailchimp',
  'klaviyo',
  'constant-contact',
  'campaign-monitor',
  'custom'
] as const;

export const DATA_WAREHOUSE_PROVIDERS = [
  'snowflake',
  'bigquery',
  'redshift', 
  'databricks',
  'synapse',
  'custom'
] as const;

// Helper Functions
export const getIntegrationTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    'crm': 'bg-blue-100 text-blue-800 border-blue-200',
    'email-provider': 'bg-green-100 text-green-800 border-green-200',
    'analytics': 'bg-purple-100 text-purple-800 border-purple-200',
    'data-warehouse': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'social-media': 'bg-pink-100 text-pink-800 border-pink-200',
    'e-commerce': 'bg-orange-100 text-orange-800 border-orange-200',
    'sso': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'webhook': 'bg-gray-100 text-gray-800 border-gray-200'
  };
  return colors[type] || colors['webhook'];
};

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    'connected': 'bg-green-100 text-green-800 border-green-200',
    'connecting': 'bg-blue-100 text-blue-800 border-blue-200',
    'syncing': 'bg-blue-100 text-blue-800 border-blue-200',
    'error': 'bg-red-100 text-red-800 border-red-200',
    'disconnected': 'bg-gray-100 text-gray-800 border-gray-200',
    'configuration-required': 'bg-yellow-100 text-yellow-800 border-yellow-200'
  };
  return colors[status] || colors['disconnected'];
};

export const getHealthScoreColor = (score: number): string => {
  if (score >= 90) return 'text-green-600';
  if (score >= 70) return 'text-yellow-600'; 
  if (score >= 50) return 'text-orange-600';
  return 'text-red-600';
};

export const formatSyncFrequency = (frequency: string): string => {
  const formats: Record<string, string> = {
    'real-time': 'Real-time',
    'hourly': 'Every hour',
    'daily': 'Daily',
    'weekly': 'Weekly', 
    'manual': 'Manual only'
  };
  return formats[frequency] || frequency;
};

export const getProviderLogo = (provider: string): string => {
  return `/images/integrations/${provider.toLowerCase()}.svg`;
};

// Template helpers
export const filterTemplatesByCategory = (
  templates: IntegrationTemplate[], 
  category: string
): IntegrationTemplate[] => {
  if (category === 'all') return templates;
  return templates.filter(template => template.category === category);
};

export const searchTemplates = (
  templates: IntegrationTemplate[],
  query: string
): IntegrationTemplate[] => {
  if (!query) return templates;
  const searchLower = query.toLowerCase();
  return templates.filter(template =>
    template.name.toLowerCase().includes(searchLower) ||
    template.description.toLowerCase().includes(searchLower) ||
    template.provider.toLowerCase().includes(searchLower) ||
    template.tags.some(tag => tag.toLowerCase().includes(searchLower))
  );
};

// Validation helpers
export const validateIntegrationConfig = (
  config: Record<string, any>,
  requiredFields: string[]
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  requiredFields.forEach(field => {
    if (!config[field] || (typeof config[field] === 'string' && config[field].trim() === '')) {
      errors.push(`${field} is required`);
    }
  });
  
  // Additional validations
  if (config.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.email)) {
    errors.push('Invalid email format');
  }
  
  if (config.url && !/^https?:\/\/.+/.test(config.url)) {
    errors.push('Invalid URL format');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Mock data generators for development
export const generateMockIntegration = (overrides?: Partial<Integration>): Integration => {
  const baseIntegration: Integration = {
    id: `int-${Date.now()}`,
    name: 'Mock Integration',
    type: 'crm',
    category: 'customer-data',
    status: 'connected',
    provider: 'mock-provider',
    description: 'A mock integration for testing purposes',
    logoUrl: '/images/integrations/default.svg',
    configuration: {
      customFields: {},
      rateLimits: { requestsPerMinute: 100, requestsPerHour: 5000, requestsPerDay: 100000, burstLimit: 200 },
      retrySettings: { maxRetries: 3, initialDelay: 1000, maxDelay: 30000, backoffMultiplier: 2 }
    },
    syncFrequency: 'hourly',
    dataMapping: {
      fieldMappings: [],
      transformations: [],
      syncDirection: 'bidirectional',
      conflictResolution: 'most-recent'
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'mock-user@example.com',
    tags: ['mock', 'testing'],
    isActive: true,
    healthScore: 95,
    errorCount: 0
  };
  
  return { ...baseIntegration, ...overrides };
};

export const generateMockTemplate = (overrides?: Partial<IntegrationTemplate>): IntegrationTemplate => {
  const baseTemplate: IntegrationTemplate = {
    id: `tpl-${Date.now()}`,
    name: 'Mock Template',
    description: 'A mock integration template for testing',
    provider: 'Mock Provider',
    category: 'customer-data',
    logoUrl: '/images/integrations/default.svg',
    isOfficial: true,
    rating: 4.5,
    installCount: 1000,
    documentation: 'https://docs.example.com',
    supportLevel: 'official',
    configurationSchema: {
      required: ['apiKey'],
      properties: {
        apiKey: { type: 'string', title: 'API Key' }
      }
    },
    requiredPermissions: ['read', 'write'],
    tags: ['mock', 'testing'],
    version: '1.0.0',
    lastUpdated: new Date()
  };
  
  return { ...baseTemplate, ...overrides };
};

// Performance optimization helpers
export const memoizeIntegrationFilters = <T extends any[], R>(
  fn: (...args: T) => R
) => {
  const cache = new Map<string, R>();
  
  return (...args: T): R => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = fn(...args);
    cache.set(key, result);
    
    // Clear cache if it gets too large
    if (cache.size > 100) {
      cache.clear();
    }
    
    return result;
  };
};

// Analytics helpers
export const calculateIntegrationMetrics = (integrations: Integration[]) => {
  const total = integrations.length;
  const connected = integrations.filter(i => i.status === 'connected').length;
  const errors = integrations.filter(i => i.status === 'error').length;
  const averageHealth = total > 0 
    ? Math.round(integrations.reduce((sum, i) => sum + i.healthScore, 0) / total)
    : 0;
  
  return {
    total,
    connected,
    connectionRate: total > 0 ? Math.round((connected / total) * 100) : 0,
    errorRate: total > 0 ? Math.round((errors / total) * 100) : 0,
    averageHealth,
    healthyCount: integrations.filter(i => i.healthScore >= 80).length
  };
};

// Export default as main integration module
export default {
  IntegrationsDashboard,
  IntegrationMarketplace,
  CRMConnector,
  EmailProviderConnector,
  DataWarehouseConnector,
  useIntegrations,
  generateMockIntegration,
  generateMockTemplate,
  calculateIntegrationMetrics
};