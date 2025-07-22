// File Path: src/stores/ui/monitoringStore.ts

import { create } from 'zustand';
import { SystemHealth, PerformanceMetric, LiveMetrics, PerformanceAlert, LiveAnalyticsData } from '../../types/monitoring';

interface MonitoringState {
  // State
  systemHealth: SystemHealth | null;
  performanceMetrics: PerformanceMetric[];
  liveMetrics: LiveMetrics | null;
  alerts: PerformanceAlert[];
  analyticsData: LiveAnalyticsData | null;
  isMonitoring: boolean;
  lastUpdate: number;
  
  // Settings
  refreshInterval: number;
  alertThresholds: Record<string, { warning: number; critical: number }>;
  
  // Actions
  updateSystemHealth: (health: SystemHealth) => void;
  updatePerformanceMetric: (metric: PerformanceMetric) => void;
  updateLiveMetrics: (metrics: LiveMetrics) => void;
  addAlert: (alert: PerformanceAlert) => void;
  acknowledgeAlert: (alertId: string) => void;
  resolveAlert: (alertId: string) => void;
  clearResolvedAlerts: () => void;
  updateAnalyticsData: (data: LiveAnalyticsData) => void;
  setRefreshInterval: (interval: number) => void;
  setAlertThreshold: (metric: string, thresholds: { warning: number; critical: number }) => void;
  startMonitoring: () => void;
  stopMonitoring: () => void;
  
  // Getters
  getActiveAlerts: () => PerformanceAlert[];
  getCriticalAlerts: () => PerformanceAlert[];
  getMetricsByCategory: (category: string) => PerformanceMetric[];
  getSystemStatusSummary: () => { status: string; issueCount: number };
}

const defaultThresholds = {
  responseTime: { warning: 500, critical: 1000 },
  errorRate: { warning: 0.05, critical: 0.1 },
  cpuUsage: { warning: 0.7, critical: 0.9 },
  memoryUsage: { warning: 0.8, critical: 0.95 },
  activeUsers: { warning: 10000, critical: 15000 },
};

export const useMonitoringStore = create<MonitoringState>((set, get) => ({
  // Initial state
  systemHealth: null,
  performanceMetrics: [],
  liveMetrics: null,
  alerts: [],
  analyticsData: null,
  isMonitoring: false,
  lastUpdate: 0,
  refreshInterval: 30000, // 30 seconds
  alertThresholds: defaultThresholds,

  // Actions
  updateSystemHealth: (health) => {
    set({ systemHealth: health, lastUpdate: Date.now() });
  },

  updatePerformanceMetric: (metric) => {
    set((state) => {
      const existingIndex = state.performanceMetrics.findIndex(m => m.id === metric.id);
      const updatedMetrics = [...state.performanceMetrics];
      
      if (existingIndex >= 0) {
        updatedMetrics[existingIndex] = metric;
      } else {
        updatedMetrics.push(metric);
      }
      
      return { performanceMetrics: updatedMetrics, lastUpdate: Date.now() };
    });
  },

  updateLiveMetrics: (metrics) => {
    set({ liveMetrics: metrics, lastUpdate: Date.now() });
  },

  addAlert: (alert) => {
    set((state) => ({
      alerts: [alert, ...state.alerts],
    }));
  },

  acknowledgeAlert: (alertId) => {
    set((state) => ({
      alerts: state.alerts.map(alert =>
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      ),
    }));
  },

  resolveAlert: (alertId) => {
    set((state) => ({
      alerts: state.alerts.map(alert =>
        alert.id === alertId ? { ...alert, resolvedAt: Date.now() } : alert
      ),
    }));
  },

  clearResolvedAlerts: () => {
    set((state) => ({
      alerts: state.alerts.filter(alert => !alert.resolvedAt),
    }));
  },

  updateAnalyticsData: (data) => {
    set({ analyticsData: data, lastUpdate: Date.now() });
  },

  setRefreshInterval: (interval) => {
    set({ refreshInterval: interval });
  },

  setAlertThreshold: (metric, thresholds) => {
    set((state) => ({
      alertThresholds: {
        ...state.alertThresholds,
        [metric]: thresholds,
      },
    }));
  },

  startMonitoring: () => {
    set({ isMonitoring: true });
  },

  stopMonitoring: () => {
    set({ isMonitoring: false });
  },

  // Getters
  getActiveAlerts: () => {
    const state = get();
    return state.alerts.filter(alert => !alert.resolvedAt);
  },

  getCriticalAlerts: () => {
    const state = get();
    return state.alerts.filter(alert => alert.type === 'critical' && !alert.resolvedAt);
  },

  getMetricsByCategory: (category) => {
    const state = get();
    return state.performanceMetrics.filter(metric => metric.category === category);
  },

  getSystemStatusSummary: () => {
    const state = get();
    const activeAlerts = state.getActiveAlerts();
    const criticalCount = activeAlerts.filter(a => a.type === 'critical').length;
    
    if (criticalCount > 0) {
      return { status: 'critical', issueCount: criticalCount };
    }
    
    const warningCount = activeAlerts.filter(a => a.type === 'warning').length;
    if (warningCount > 0) {
      return { status: 'warning', issueCount: warningCount };
    }
    
    return { status: 'healthy', issueCount: 0 };
  },
}));