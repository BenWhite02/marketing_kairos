// File Path: src/types/monitoring.ts

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down';
  services: {
    api: ServiceStatus;
    database: ServiceStatus;
    cache: ServiceStatus;
    analytics: ServiceStatus;
    websocket: ServiceStatus;
  };
  metrics: {
    responseTime: number;
    uptime: number;
    activeUsers: number;
    errorRate: number;
    memoryUsage: number;
    cpuUsage: number;
  };
  timestamp: number;
}

export interface ServiceStatus {
  status: 'up' | 'down' | 'degraded';
  responseTime: number;
  lastCheck: number;
  errorCount: number;
  uptime: number;
}

export interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  previousValue?: number;
  threshold?: {
    warning: number;
    critical: number;
  };
  unit: string;
  category: 'response' | 'throughput' | 'error' | 'resource';
  timestamp: number;
}

export interface LiveMetrics {
  campaigns: {
    active: number;
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
    roas: number;
  };
  moments: {
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    deliveryRate: number;
    openRate: number;
  };
  experiments: {
    running: number;
    participants: number;
    conversions: number;
    winnerDeclared: number;
    confidenceLevel: number;
  };
  atoms: {
    total: number;
    active: number;
    accuracy: number;
    usageCount: number;
  };
  timestamp: number;
}

export interface PerformanceAlert {
  id: string;
  type: 'warning' | 'critical' | 'info';
  title: string;
  message: string;
  metric: string;
  currentValue: number;
  threshold: number;
  entityType?: 'campaign' | 'moment' | 'experiment' | 'system';
  entityId?: string;
  timestamp: number;
  acknowledged: boolean;
  resolvedAt?: number;
}

export interface LiveAnalyticsData {
  timeRange: '1h' | '6h' | '24h' | '7d';
  metrics: Array<{
    timestamp: number;
    campaigns: number;
    moments: number;
    experiments: number;
    revenue: number;
    users: number;
  }>;
  realTimeEvents: Array<{
    id: string;
    type: 'conversion' | 'click' | 'impression' | 'experiment_start' | 'moment_sent';
    entityType: string;
    entityId: string;
    value?: number;
    timestamp: number;
  }>;
}