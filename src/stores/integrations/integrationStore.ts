// src/stores/integrations/integrationStore.ts

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { 
  Integration, 
  IntegrationType, 
  IntegrationCategory,
  IntegrationStatus,
  IntegrationHealth,
  IntegrationEvent,
  IntegrationTemplate,
  DataMapping
} from '../../types/integrations';

interface IntegrationState {
  // State
  integrations: Integration[];
  templates: IntegrationTemplate[];
  health: IntegrationHealth[];
  events: IntegrationEvent[];
  selectedIntegration: Integration | null;
  selectedTemplate: IntegrationTemplate | null;
  
  // UI State
  isLoading: boolean;
  isConnecting: boolean;
  isSyncing: boolean;
  error: string | null;
  searchQuery: string;
  filterType: IntegrationType | 'all';
  filterCategory: IntegrationCategory | 'all';
  filterStatus: IntegrationStatus | 'all';
  sortBy: 'name' | 'type' | 'status' | 'lastSync' | 'health';
  sortOrder: 'asc' | 'desc';
  viewMode: 'grid' | 'list';
  showHealthDetails: boolean;
  
  // Pagination
  currentPage: number;
  pageSize: number;
  totalCount: number;
  hasMore: boolean;

  // Actions
  fetchIntegrations: () => Promise<void>;
  fetchTemplates: () => Promise<void>;
  fetchHealth: () => Promise<void>;
  fetchEvents: (integrationId?: string) => Promise<void>;
  
  createIntegration: (template: IntegrationTemplate, config: any) => Promise<Integration>;
  updateIntegration: (id: string, updates: Partial<Integration>) => Promise<void>;
  deleteIntegration: (id: string) => Promise<void>;
  connectIntegration: (id: string) => Promise<void>;
  disconnectIntegration: (id: string) => Promise<void>;
  syncIntegration: (id: string) => Promise<void>;
  testConnection: (id: string) => Promise<boolean>;
  
  updateDataMapping: (id: string, mapping: DataMapping) => Promise<void>;
  validateConfiguration: (config: any, template: IntegrationTemplate) => Promise<{ isValid: boolean; errors: string[] }>;
  
  // UI Actions
  setSelectedIntegration: (integration: Integration | null) => void;
  setSelectedTemplate: (template: IntegrationTemplate | null) => void;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Partial<{ type: IntegrationType | 'all'; category: IntegrationCategory | 'all'; status: IntegrationStatus | 'all' }>) => void;
  setSorting: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  setShowHealthDetails: (show: boolean) => void;
  setPage: (page: number) => void;
  clearError: () => void;
  reset: () => void;
}

// Mock API functions
const mockIntegrationsAPI = {
  async getIntegrations(): Promise<Integration[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return [
      {
        id: 'int-1',
        name: 'Salesforce Production',
        type: 'crm',
        category: 'customer-data',
        status: 'connected',
        provider: 'salesforce',
        description: 'Primary Salesforce CRM integration for customer data sync',
        logoUrl: '/images/integrations/salesforce.svg',
        configuration: {
          apiKey: '***hidden***',
          baseUrl: 'https://mycompany.salesforce.com',
          customFields: { instanceUrl: 'https://mycompany.salesforce.com' },
          rateLimits: { requestsPerMinute: 100, requestsPerHour: 5000, requestsPerDay: 100000, burstLimit: 200 },
          retrySettings: { maxRetries: 3, initialDelay: 1000, maxDelay: 30000, backoffMultiplier: 2 }
        },
        lastSync: new Date('2025-01-20T10:30:00'),
        syncFrequency: 'hourly',
        dataMapping: {
          fieldMappings: [
            { sourceField: 'Email', targetField: 'email', dataType: 'email', isRequired: true },
            { sourceField: 'FirstName', targetField: 'firstName', dataType: 'string', isRequired: false },
            { sourceField: 'LastName', targetField: 'lastName', dataType: 'string', isRequired: true }
          ],
          transformations: [],
          syncDirection: 'bidirectional',
          conflictResolution: 'most-recent'
        },
        createdAt: new Date('2024-12-01T09:00:00'),
        updatedAt: new Date('2025-01-20T10:30:00'),
        createdBy: 'john.doe@company.com',
        tags: ['production', 'crm', 'customer-data'],
        isActive: true,
        healthScore: 95,
        errorCount: 0
      },
      {
        id: 'int-2',
        name: 'HubSpot Marketing',
        type: 'crm',
        category: 'marketing-automation',
        status: 'connected',
        provider: 'hubspot',
        description: 'HubSpot integration for marketing automation and lead management',
        logoUrl: '/images/integrations/hubspot.svg',
        configuration: {
          apiKey: '***hidden***',
          baseUrl: 'https://api.hubapi.com',
          customFields: { portalId: '12345678' },
          rateLimits: { requestsPerMinute: 100, requestsPerHour: 40000, requestsPerDay: 1000000, burstLimit: 150 },
          retrySettings: { maxRetries: 3, initialDelay: 1000, maxDelay: 30000, backoffMultiplier: 2 }
        },
        lastSync: new Date('2025-01-20T11:15:00'),
        syncFrequency: 'real-time',
        dataMapping: {
          fieldMappings: [
            { sourceField: 'email', targetField: 'email', dataType: 'email', isRequired: true },
            { sourceField: 'firstname', targetField: 'firstName', dataType: 'string', isRequired: false },
            { sourceField: 'lastname', targetField: 'lastName', dataType: 'string', isRequired: false }
          ],
          transformations: [],
          syncDirection: 'inbound',
          conflictResolution: 'source-wins'
        },
        createdAt: new Date('2024-11-15T14:20:00'),
        updatedAt: new Date('2025-01-20T11:15:00'),
        createdBy: 'marketing@company.com',
        tags: ['marketing', 'automation', 'leads'],
        isActive: true,
        healthScore: 88,
        errorCount: 2
      },
      {
        id: 'int-3',
        name: 'SendGrid Email',
        type: 'email-provider',
        category: 'communication',
        status: 'connected',
        provider: 'sendgrid',
        description: 'SendGrid integration for transactional and marketing emails',
        logoUrl: '/images/integrations/sendgrid.svg',
        configuration: {
          apiKey: '***hidden***',
          baseUrl: 'https://api.sendgrid.com',
          customFields: { senderId: 'verified-sender@company.com' },
          rateLimits: { requestsPerMinute: 600, requestsPerHour: 36000, requestsPerDay: 864000, burstLimit: 1000 },
          retrySettings: { maxRetries: 5, initialDelay: 500, maxDelay: 60000, backoffMultiplier: 2 }
        },
        lastSync: new Date('2025-01-20T09:45:00'),
        syncFrequency: 'real-time',
        dataMapping: {
          fieldMappings: [],
          transformations: [],
          syncDirection: 'outbound',
          conflictResolution: 'source-wins'
        },
        createdAt: new Date('2024-10-10T16:30:00'),
        updatedAt: new Date('2025-01-20T09:45:00'),
        createdBy: 'devops@company.com',
        tags: ['email', 'transactional', 'marketing'],
        isActive: true,
        healthScore: 92,
        errorCount: 1
      },
      {
        id: 'int-4',
        name: 'Google Analytics 4',
        type: 'analytics',
        category: 'analytics-reporting',
        status: 'error',
        provider: 'google-analytics',
        description: 'Google Analytics 4 integration for web analytics and conversion tracking',
        logoUrl: '/images/integrations/google-analytics.svg',
        configuration: {
          customFields: { propertyId: 'GA4-12345678', measurementId: 'G-XXXXXXXXXX' },
          rateLimits: { requestsPerMinute: 100, requestsPerHour: 10000, requestsPerDay: 200000, burstLimit: 200 },
          retrySettings: { maxRetries: 3, initialDelay: 2000, maxDelay: 60000, backoffMultiplier: 2 }
        },
        lastSync: new Date('2025-01-19T23:30:00'),
        syncFrequency: 'daily',
        dataMapping: {
          fieldMappings: [],
          transformations: [],
          syncDirection: 'inbound',
          conflictResolution: 'source-wins'
        },
        createdAt: new Date('2024-09-20T11:00:00'),
        updatedAt: new Date('2025-01-19T23:30:00'),
        createdBy: 'analytics@company.com',
        tags: ['analytics', 'web', 'conversions'],
        isActive: true,
        healthScore: 45,
        errorCount: 15,
        lastError: 'Authentication failed: Invalid credentials'
      }
    ];
  },

  async getTemplates(): Promise<IntegrationTemplate[]> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return [
      {
        id: 'tpl-salesforce',
        name: 'Salesforce CRM',
        description: 'Connect with Salesforce to sync contacts, leads, and opportunities',
        provider: 'Salesforce',
        category: 'customer-data',
        logoUrl: '/images/integrations/salesforce.svg',
        isOfficial: true,
        rating: 4.8,
        installCount: 12500,
        documentation: 'https://docs.kairos.com/integrations/salesforce',
        supportLevel: 'official',
        configurationSchema: {
          required: ['instanceUrl', 'clientId', 'clientSecret'],
          properties: {
            instanceUrl: { type: 'string', title: 'Instance URL' },
            clientId: { type: 'string', title: 'Client ID' },
            clientSecret: { type: 'string', title: 'Client Secret', secret: true }
          }
        },
        requiredPermissions: ['read_contacts', 'write_contacts', 'read_opportunities'],
        tags: ['crm', 'salesforce', 'popular'],
        version: '2.1.0',
        lastUpdated: new Date('2025-01-15T10:00:00')
      },
      {
        id: 'tpl-hubspot',
        name: 'HubSpot',
        description: 'Integrate with HubSpot for marketing automation and lead management',
        provider: 'HubSpot',
        category: 'marketing-automation',
        logoUrl: '/images/integrations/hubspot.svg',
        isOfficial: true,
        rating: 4.7,
        installCount: 8900,
        documentation: 'https://docs.kairos.com/integrations/hubspot',
        supportLevel: 'official',
        configurationSchema: {
          required: ['apiKey'],
          properties: {
            apiKey: { type: 'string', title: 'API Key', secret: true },
            portalId: { type: 'string', title: 'Portal ID' }
          }
        },
        requiredPermissions: ['contacts', 'companies', 'deals'],
        tags: ['crm', 'marketing', 'automation'],
        version: '1.9.2',
        lastUpdated: new Date('2025-01-10T14:30:00')
      }
    ];
  },

  async getHealth(): Promise<IntegrationHealth[]> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    return [
      {
        integrationId: 'int-1',
        overallScore: 95,
        connectionHealth: { score: 100, status: 'excellent', trend: 'stable', details: 'Connection stable, no timeouts' },
        dataQuality: { score: 92, status: 'excellent', trend: 'improving', details: 'High data quality, minimal validation errors' },
        performance: { score: 98, status: 'excellent', trend: 'stable', details: 'Average response time: 150ms' },
        errorRate: { score: 88, status: 'good', trend: 'stable', details: '0.5% error rate over last 24h' },
        lastCheck: new Date('2025-01-20T12:00:00'),
        recommendations: []
      },
      {
        integrationId: 'int-2',
        overallScore: 88,
        connectionHealth: { score: 95, status: 'excellent', trend: 'stable', details: 'Reliable connection with minimal latency' },
        dataQuality: { score: 85, status: 'good', trend: 'stable', details: 'Some data validation warnings' },
        performance: { score: 90, status: 'good', trend: 'improving', details: 'Average response time: 250ms' },
        errorRate: { score: 82, status: 'good', trend: 'declining', details: '1.2% error rate, trending down' },
        lastCheck: new Date('2025-01-20T12:00:00'),
        recommendations: [
          {
            type: 'optimization',
            priority: 'medium',
            title: 'Optimize data mapping',
            description: 'Some field mappings could be optimized for better performance',
            actionRequired: 'Review and update field mappings',
            estimatedImpact: '+5% performance improvement'
          }
        ]
      }
    ];
  }
};

export const useIntegrationStore = create<IntegrationState>()(
  subscribeWithSelector((set, get) => ({
    // Initial State
    integrations: [],
    templates: [],
    health: [],
    events: [],
    selectedIntegration: null,
    selectedTemplate: null,
    
    // UI State
    isLoading: false,
    isConnecting: false,
    isSyncing: false,
    error: null,
    searchQuery: '',
    filterType: 'all',
    filterCategory: 'all',
    filterStatus: 'all',
    sortBy: 'name',
    sortOrder: 'asc',
    viewMode: 'grid',
    showHealthDetails: false,
    
    // Pagination
    currentPage: 1,
    pageSize: 12,
    totalCount: 0,
    hasMore: false,

    // Actions
    fetchIntegrations: async () => {
      set({ isLoading: true, error: null });
      try {
        const integrations = await mockIntegrationsAPI.getIntegrations();
        set({ 
          integrations, 
          totalCount: integrations.length,
          isLoading: false 
        });
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Failed to fetch integrations',
          isLoading: false 
        });
      }
    },

    fetchTemplates: async () => {
      set({ isLoading: true, error: null });
      try {
        const templates = await mockIntegrationsAPI.getTemplates();
        set({ templates, isLoading: false });
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Failed to fetch templates',
          isLoading: false 
        });
      }
    },

    fetchHealth: async () => {
      try {
        const health = await mockIntegrationsAPI.getHealth();
        set({ health });
      } catch (error) {
        console.error('Failed to fetch health data:', error);
      }
    },

    fetchEvents: async (integrationId?: string) => {
      // Mock events data
      const mockEvents: IntegrationEvent[] = [
        {
          id: 'evt-1',
          integrationId: integrationId || 'int-1',
          type: 'sync-completed',
          status: 'success',
          message: 'Successfully synced 1,250 records',
          timestamp: new Date('2025-01-20T11:30:00'),
          duration: 45000,
          recordsProcessed: 1250
        }
      ];
      set({ events: mockEvents });
    },

    createIntegration: async (template: IntegrationTemplate, config: any) => {
      set({ isConnecting: true, error: null });
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const newIntegration: Integration = {
          id: `int-${Date.now()}`,
          name: `${template.name} Integration`,
          type: template.category === 'customer-data' ? 'crm' : 'email-provider',
          category: template.category,
          status: 'connected',
          provider: template.provider.toLowerCase(),
          description: template.description,
          logoUrl: template.logoUrl,
          configuration: {
            ...config,
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
          createdBy: 'current-user@company.com',
          tags: template.tags,
          isActive: true,
          healthScore: 100,
          errorCount: 0
        };

        const { integrations } = get();
        set({ 
          integrations: [...integrations, newIntegration],
          isConnecting: false,
          selectedIntegration: newIntegration
        });
        
        return newIntegration;
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Failed to create integration',
          isConnecting: false 
        });
        throw error;
      }
    },

    updateIntegration: async (id: string, updates: Partial<Integration>) => {
      const { integrations } = get();
      const updatedIntegrations = integrations.map(integration =>
        integration.id === id 
          ? { ...integration, ...updates, updatedAt: new Date() }
          : integration
      );
      set({ integrations: updatedIntegrations });
    },

    deleteIntegration: async (id: string) => {
      const { integrations } = get();
      set({ 
        integrations: integrations.filter(integration => integration.id !== id),
        selectedIntegration: null
      });
    },

    connectIntegration: async (id: string) => {
      await get().updateIntegration(id, { status: 'connected', healthScore: 95 });
    },

    disconnectIntegration: async (id: string) => {
      await get().updateIntegration(id, { status: 'disconnected', healthScore: 0 });
    },

    syncIntegration: async (id: string) => {
      set({ isSyncing: true });
      try {
        await new Promise(resolve => setTimeout(resolve, 3000));
        await get().updateIntegration(id, { lastSync: new Date() });
        set({ isSyncing: false });
      } catch (error) {
        set({ isSyncing: false });
        throw error;
      }
    },

    testConnection: async (id: string) => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      return Math.random() > 0.2; // 80% success rate
    },

    updateDataMapping: async (id: string, mapping: DataMapping) => {
      await get().updateIntegration(id, { dataMapping: mapping });
    },

    validateConfiguration: async (config: any, template: IntegrationTemplate) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const errors: string[] = [];
      const required = template.configurationSchema.required || [];
      
      for (const field of required) {
        if (!config[field]) {
          errors.push(`${field} is required`);
        }
      }
      
      return { isValid: errors.length === 0, errors };
    },

    // UI Actions
    setSelectedIntegration: (integration) => set({ selectedIntegration: integration }),
    setSelectedTemplate: (template) => set({ selectedTemplate: template }),
    setSearchQuery: (query) => set({ searchQuery: query, currentPage: 1 }),
    setFilters: (filters) => set({ ...filters, currentPage: 1 }),
    setSorting: (sortBy, sortOrder) => set({ sortBy, sortOrder }),
    setViewMode: (mode) => set({ viewMode: mode }),
    setShowHealthDetails: (show) => set({ showHealthDetails: show }),
    setPage: (page) => set({ currentPage: page }),
    clearError: () => set({ error: null }),
    reset: () => set({
      selectedIntegration: null,
      selectedTemplate: null,
      searchQuery: '',
      filterType: 'all',
      filterCategory: 'all',
      filterStatus: 'all',
      currentPage: 1,
      error: null
    })
  }))
);

// Computed selectors
export const useFilteredIntegrations = () => {
  return useIntegrationStore((state) => {
    let filtered = state.integrations;

    // Apply search filter
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(integration =>
        integration.name.toLowerCase().includes(query) ||
        integration.description.toLowerCase().includes(query) ||
        integration.provider.toLowerCase().includes(query) ||
        integration.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply type filter
    if (state.filterType !== 'all') {
      filtered = filtered.filter(integration => integration.type === state.filterType);
    }

    // Apply category filter
    if (state.filterCategory !== 'all') {
      filtered = filtered.filter(integration => integration.category === state.filterCategory);
    }

    // Apply status filter
    if (state.filterStatus !== 'all') {
      filtered = filtered.filter(integration => integration.status === state.filterStatus);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (state.sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'lastSync':
          aValue = a.lastSync?.getTime() || 0;
          bValue = b.lastSync?.getTime() || 0;
          break;
        case 'health':
          aValue = a.healthScore;
          bValue = b.healthScore;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return state.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return state.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  });
};

export const useIntegrationHealth = (integrationId: string) => {
  return useIntegrationStore((state) => 
    state.health.find(h => h.integrationId === integrationId)
  );
};