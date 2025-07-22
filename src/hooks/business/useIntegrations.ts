// src/hooks/business/useIntegrations.ts

import { useState, useEffect, useCallback } from 'react';
import { useIntegrationStore } from '../../stores/integrations/integrationStore';
import { 
  Integration, 
  IntegrationTemplate, 
  IntegrationHealth,
  IntegrationEvent,
  IntegrationType,
  IntegrationStatus 
} from '../../types/integrations';

export interface IntegrationFilters {
  type?: IntegrationType | 'all';
  status?: IntegrationStatus | 'all';
  searchQuery?: string;
  healthScore?: {
    min: number;
    max: number;
  };
}

export interface IntegrationActions {
  // CRUD Operations
  createIntegration: (template: IntegrationTemplate, config: any) => Promise<Integration>;
  updateIntegration: (id: string, updates: Partial<Integration>) => Promise<void>;
  deleteIntegration: (id: string) => Promise<void>;
  
  // Connection Management
  connectIntegration: (id: string) => Promise<void>;
  disconnectIntegration: (id: string) => Promise<void>;
  testConnection: (id: string) => Promise<boolean>;
  syncIntegration: (id: string) => Promise<void>;
  
  // Bulk Operations
  bulkSync: (ids: string[]) => Promise<void>;
  bulkConnect: (ids: string[]) => Promise<void>;
  bulkDisconnect: (ids: string[]) => Promise<void>;
  bulkDelete: (ids: string[]) => Promise<void>;
  
  // Data Management
  refreshData: () => Promise<void>;
  exportIntegrations: (format: 'csv' | 'json') => Promise<void>;
  
  // Health & Monitoring
  refreshHealth: () => Promise<void>;
  getIntegrationEvents: (id: string) => Promise<IntegrationEvent[]>;
}

export interface IntegrationMetrics {
  total: number;
  connected: number;
  disconnected: number;
  errors: number;
  averageHealth: number;
  syncingCount: number;
  lastSyncTime?: Date;
}

export interface UseIntegrationsReturn {
  // Data
  integrations: Integration[];
  filteredIntegrations: Integration[];
  templates: IntegrationTemplate[];
  health: IntegrationHealth[];
  events: IntegrationEvent[];
  
  // Selected Items
  selectedIntegration: Integration | null;
  selectedTemplate: IntegrationTemplate | null;
  
  // UI State
  isLoading: boolean;
  isConnecting: boolean;
  isSyncing: boolean;
  error: string | null;
  
  // Filters and Search
  filters: IntegrationFilters;
  setFilters: (filters: Partial<IntegrationFilters>) => void;
  clearFilters: () => void;
  
  // Metrics
  metrics: IntegrationMetrics;
  
  // Actions
  actions: IntegrationActions;
  
  // Selection Management
  setSelectedIntegration: (integration: Integration | null) => void;
  setSelectedTemplate: (template: IntegrationTemplate | null) => void;
  
  // Utility Functions
  getIntegrationHealth: (id: string) => IntegrationHealth | undefined;
  getIntegrationsByType: (type: IntegrationType) => Integration[];
  getIntegrationsByStatus: (status: IntegrationStatus) => Integration[];
  isIntegrationHealthy: (id: string) => boolean;
  canIntegrationSync: (id: string) => boolean;
}

export const useIntegrations = (initialFilters?: IntegrationFilters): UseIntegrationsReturn => {
  const store = useIntegrationStore();
  const [filters, setFiltersState] = useState<IntegrationFilters>(initialFilters || {});
  const [bulkOperationInProgress, setBulkOperationInProgress] = useState(false);

  // Load initial data
  useEffect(() => {
    store.fetchIntegrations();
    store.fetchTemplates();
    store.fetchHealth();
  }, []);

  // Filter integrations based on current filters
  const filteredIntegrations = useCallback(() => {
    let filtered = store.integrations;

    // Apply type filter
    if (filters.type && filters.type !== 'all') {
      filtered = filtered.filter(integration => integration.type === filters.type);
    }

    // Apply status filter
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(integration => integration.status === filters.status);
    }

    // Apply search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(integration =>
        integration.name.toLowerCase().includes(query) ||
        integration.description.toLowerCase().includes(query) ||
        integration.provider.toLowerCase().includes(query) ||
        integration.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply health score filter
    if (filters.healthScore) {
      filtered = filtered.filter(integration =>
        integration.healthScore >= filters.healthScore!.min &&
        integration.healthScore <= filters.healthScore!.max
      );
    }

    return filtered;
  }, [store.integrations, filters]);

  // Calculate metrics
  const metrics: IntegrationMetrics = useCallback(() => {
    const integrations = store.integrations;
    const connected = integrations.filter(i => i.status === 'connected').length;
    const disconnected = integrations.filter(i => i.status === 'disconnected').length;
    const errors = integrations.filter(i => i.status === 'error').length;
    const syncing = integrations.filter(i => i.status === 'syncing').length;
    
    const averageHealth = integrations.length > 0 
      ? Math.round(integrations.reduce((sum, i) => sum + i.healthScore, 0) / integrations.length)
      : 0;

    const lastSynced = integrations
      .filter(i => i.lastSync)
      .sort((a, b) => (b.lastSync?.getTime() || 0) - (a.lastSync?.getTime() || 0))
      [0]?.lastSync;

    return {
      total: integrations.length,
      connected,
      disconnected,
      errors,
      averageHealth,
      syncingCount: syncing,
      lastSyncTime: lastSynced
    };
  }, [store.integrations]);

  // Update filters
  const setFilters = useCallback((newFilters: Partial<IntegrationFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFiltersState({});
  }, []);

  // Bulk operations
  const bulkSync = useCallback(async (ids: string[]) => {
    setBulkOperationInProgress(true);
    try {
      await Promise.all(ids.map(id => store.syncIntegration(id)));
    } finally {
      setBulkOperationInProgress(false);
    }
  }, [store]);

  const bulkConnect = useCallback(async (ids: string[]) => {
    setBulkOperationInProgress(true);
    try {
      await Promise.all(ids.map(id => store.connectIntegration(id)));
    } finally {
      setBulkOperationInProgress(false);
    }
  }, [store]);

  const bulkDisconnect = useCallback(async (ids: string[]) => {
    setBulkOperationInProgress(true);
    try {
      await Promise.all(ids.map(id => store.disconnectIntegration(id)));
    } finally {
      setBulkOperationInProgress(false);
    }
  }, [store]);

  const bulkDelete = useCallback(async (ids: string[]) => {
    setBulkOperationInProgress(true);
    try {
      await Promise.all(ids.map(id => store.deleteIntegration(id)));
    } finally {
      setBulkOperationInProgress(false);
    }
  }, [store]);

  // Export integrations
  const exportIntegrations = useCallback(async (format: 'csv' | 'json') => {
    const integrations = filteredIntegrations();
    
    if (format === 'csv') {
      const headers = ['Name', 'Type', 'Provider', 'Status', 'Health Score', 'Last Sync'];
      const rows = integrations.map(integration => [
        integration.name,
        integration.type,
        integration.provider,
        integration.status,
        integration.healthScore.toString(),
        integration.lastSync?.toISOString() || 'Never'
      ]);
      
      const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `integrations-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } else {
      const jsonContent = JSON.stringify(integrations, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `integrations-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  }, [filteredIntegrations]);

  // Refresh data
  const refreshData = useCallback(async () => {
    await Promise.all([
      store.fetchIntegrations(),
      store.fetchHealth(),
      store.fetchEvents()
    ]);
  }, [store]);

  // Utility functions
  const getIntegrationHealth = useCallback((id: string) => {
    return store.health.find(h => h.integrationId === id);
  }, [store.health]);

  const getIntegrationsByType = useCallback((type: IntegrationType) => {
    return store.integrations.filter(integration => integration.type === type);
  }, [store.integrations]);

  const getIntegrationsByStatus = useCallback((status: IntegrationStatus) => {
    return store.integrations.filter(integration => integration.status === status);
  }, [store.integrations]);

  const isIntegrationHealthy = useCallback((id: string) => {
    const health = getIntegrationHealth(id);
    return health ? health.overallScore >= 80 : false;
  }, [getIntegrationHealth]);

  const canIntegrationSync = useCallback((id: string) => {
    const integration = store.integrations.find(i => i.id === id);
    return integration ? integration.status === 'connected' && integration.isActive : false;
  }, [store.integrations]);

  // Actions object
  const actions: IntegrationActions = {
    createIntegration: store.createIntegration,
    updateIntegration: store.updateIntegration,
    deleteIntegration: store.deleteIntegration,
    connectIntegration: store.connectIntegration,
    disconnectIntegration: store.disconnectIntegration,
    testConnection: store.testConnection,
    syncIntegration: store.syncIntegration,
    bulkSync,
    bulkConnect,
    bulkDisconnect,
    bulkDelete,
    refreshData,
    exportIntegrations,
    refreshHealth: store.fetchHealth,
    getIntegrationEvents: store.fetchEvents
  };

  return {
    // Data
    integrations: store.integrations,
    filteredIntegrations: filteredIntegrations(),
    templates: store.templates,
    health: store.health,
    events: store.events,
    
    // Selected Items
    selectedIntegration: store.selectedIntegration,
    selectedTemplate: store.selectedTemplate,
    
    // UI State
    isLoading: store.isLoading,
    isConnecting: store.isConnecting || bulkOperationInProgress,
    isSyncing: store.isSyncing,
    error: store.error,
    
    // Filters
    filters,
    setFilters,
    clearFilters,
    
    // Metrics
    metrics: metrics(),
    
    // Actions
    actions,
    
    // Selection Management
    setSelectedIntegration: store.setSelectedIntegration,
    setSelectedTemplate: store.setSelectedTemplate,
    
    // Utility Functions
    getIntegrationHealth,
    getIntegrationsByType,
    getIntegrationsByStatus,
    isIntegrationHealthy,
    canIntegrationSync
  };
};

// Specialized hooks for specific integration types
export const useCRMIntegrations = () => {
  const { getIntegrationsByType, ...rest } = useIntegrations();
  return {
    ...rest,
    crmIntegrations: getIntegrationsByType('crm')
  };
};

export const useEmailIntegrations = () => {
  const { getIntegrationsByType, ...rest } = useIntegrations();
  return {
    ...rest,
    emailIntegrations: getIntegrationsByType('email-provider')
  };
};

export const useDataWarehouseIntegrations = () => {
  const { getIntegrationsByType, ...rest } = useIntegrations();
  return {
    ...rest,
    dataWarehouseIntegrations: getIntegrationsByType('data-warehouse')
  };
};

// Health monitoring hook
export const useIntegrationHealth = (integrationId?: string) => {
  const { health, actions } = useIntegrations();
  
  const integrationHealth = integrationId 
    ? health.find(h => h.integrationId === integrationId)
    : undefined;

  const refreshHealth = useCallback(() => {
    actions.refreshHealth();
  }, [actions]);

  useEffect(() => {
    // Auto-refresh health every 5 minutes
    const interval = setInterval(refreshHealth, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refreshHealth]);

  return {
    health: integrationHealth,
    allHealth: health,
    refreshHealth,
    isHealthy: integrationHealth ? integrationHealth.overallScore >= 80 : false,
    hasWarnings: integrationHealth ? integrationHealth.overallScore < 80 && integrationHealth.overallScore >= 60 : false,
    hasCriticalIssues: integrationHealth ? integrationHealth.overallScore < 60 : false
  };
};

export default useIntegrations;