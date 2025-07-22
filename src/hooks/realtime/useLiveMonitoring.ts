// File Path: src/hooks/realtime/useLiveMonitoring.ts

import { useEffect, useRef } from 'react';
import { useMonitoringStore } from '../../stores/ui/monitoringStore';
import { useWebSocket } from './useWebSocket';
import { SystemHealth, LiveMetrics, PerformanceAlert } from '../../types/monitoring';

export interface UseLiveMonitoringOptions {
  refreshInterval?: number;
  enableAlerts?: boolean;
  autoStart?: boolean;
}

export const useLiveMonitoring = (options: UseLiveMonitoringOptions = {}) => {
  const {
    refreshInterval = 30000,
    enableAlerts = true,
    autoStart = true,
  } = options;

  const {
    systemHealth,
    liveMetrics,
    alerts,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    setRefreshInterval,
    getActiveAlerts,
    getCriticalAlerts,
    getSystemStatusSummary,
  } = useMonitoringStore();

  const { isConnected } = useWebSocket();
  const intervalRef = useRef<NodeJS.Timeout>();

  // Set refresh interval
  useEffect(() => {
    setRefreshInterval(refreshInterval);
  }, [refreshInterval, setRefreshInterval]);

  // Auto-start monitoring
  useEffect(() => {
    if (autoStart && isConnected && !isMonitoring) {
      startMonitoring();
    }
  }, [autoStart, isConnected, isMonitoring, startMonitoring]);

  // Mock data generation for development
  useEffect(() => {
    if (!isMonitoring) return;

    const generateMockData = () => {
      // Mock system health
      const mockHealth: SystemHealth = {
        status: Math.random() > 0.9 ? 'degraded' : 'healthy',
        services: {
          api: {
            status: 'up',
            responseTime: Math.floor(Math.random() * 200) + 50,
            lastCheck: Date.now(),
            errorCount: Math.floor(Math.random() * 5),
            uptime: Date.now() - (Math.random() * 86400000),
          },
          database: {
            status: 'up',
            responseTime: Math.floor(Math.random() * 100) + 20,
            lastCheck: Date.now(),
            errorCount: Math.floor(Math.random() * 2),
            uptime: Date.now() - (Math.random() * 86400000),
          },
          cache: {
            status: 'up',
            responseTime: Math.floor(Math.random() * 50) + 10,
            lastCheck: Date.now(),
            errorCount: 0,
            uptime: Date.now() - (Math.random() * 86400000),
          },
          analytics: {
            status: 'up',
            responseTime: Math.floor(Math.random() * 300) + 100,
            lastCheck: Date.now(),
            errorCount: Math.floor(Math.random() * 3),
            uptime: Date.now() - (Math.random() * 86400000),
          },
          websocket: {
            status: isConnected ? 'up' : 'down',
            responseTime: Math.floor(Math.random() * 100) + 30,
            lastCheck: Date.now(),
            errorCount: 0,
            uptime: Date.now() - (Math.random() * 86400000),
          },
        },
        metrics: {
          responseTime: Math.floor(Math.random() * 200) + 100,
          uptime: Date.now() - (Math.random() * 86400000 * 30), // Up to 30 days
          activeUsers: Math.floor(Math.random() * 1000) + 500,
          errorRate: Math.random() * 0.05,
          memoryUsage: Math.random() * 0.8 + 0.1,
          cpuUsage: Math.random() * 0.6 + 0.1,
        },
        timestamp: Date.now(),
      };

      // Mock live metrics
      const mockMetrics: LiveMetrics = {
        campaigns: {
          active: Math.floor(Math.random() * 20) + 5,
          impressions: Math.floor(Math.random() * 50000) + 10000,
          clicks: Math.floor(Math.random() * 2000) + 500,
          conversions: Math.floor(Math.random() * 200) + 50,
          revenue: Math.floor(Math.random() * 100000) + 10000,
          roas: Math.random() * 5 + 2,
        },
        moments: {
          delivered: Math.floor(Math.random() * 10000) + 5000,
          opened: Math.floor(Math.random() * 5000) + 2000,
          clicked: Math.floor(Math.random() * 1000) + 200,
          bounced: Math.floor(Math.random() * 500) + 100,
          deliveryRate: Math.random() * 0.1 + 0.9,
          openRate: Math.random() * 0.2 + 0.2,
        },
        experiments: {
          running: Math.floor(Math.random() * 10) + 3,
          participants: Math.floor(Math.random() * 5000) + 1000,
          conversions: Math.floor(Math.random() * 500) + 100,
          winnerDeclared: Math.floor(Math.random() * 5),
          confidenceLevel: Math.random() * 0.2 + 0.8,
        },
        atoms: {
          total: Math.floor(Math.random() * 50) + 20,
          active: Math.floor(Math.random() * 40) + 15,
          accuracy: Math.random() * 0.1 + 0.9,
          usageCount: Math.floor(Math.random() * 1000) + 500,
        },
        timestamp: Date.now(),
      };

      useMonitoringStore.getState().updateSystemHealth(mockHealth);
      useMonitoringStore.getState().updateLiveMetrics(mockMetrics);

      // Occasionally generate alerts
      if (enableAlerts && Math.random() > 0.95) {
        const mockAlert: PerformanceAlert = {
          id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: Math.random() > 0.7 ? 'critical' : 'warning',
          title: 'Performance Alert',
          message: 'Response time has exceeded threshold',
          metric: 'response_time',
          currentValue: Math.floor(Math.random() * 500) + 500,
          threshold: 500,
          timestamp: Date.now(),
          acknowledged: false,
        };
        
        useMonitoringStore.getState().addAlert(mockAlert);
      }
    };

    // Generate initial data
    generateMockData();

    // Set up interval
    intervalRef.current = setInterval(generateMockData, refreshInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isMonitoring, refreshInterval, enableAlerts, isConnected]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMonitoring();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [stopMonitoring]);

  return {
    systemHealth,
    liveMetrics,
    alerts,
    isMonitoring,
    isConnected,
    activeAlerts: getActiveAlerts(),
    criticalAlerts: getCriticalAlerts(),
    systemStatusSummary: getSystemStatusSummary(),
    startMonitoring,
    stopMonitoring,
  };
};