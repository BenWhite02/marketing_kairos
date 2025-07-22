// File Path: src/components/features/LiveMonitoring/LiveMetricsWidget.tsx

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  ClockIcon,
  BeakerIcon,
  CubeIcon,
} from '@heroicons/react/24/outline';
import { useMonitoringStore } from '../../../stores/ui/monitoringStore';
import { useWebSocketSubscription } from '../../../hooks/realtime/useWebSocket';
import { WebSocketEventType } from '../../../services/websocket/MessageTypes';
import { LiveMetrics } from '../../../types/monitoring';

interface LiveMetricsWidgetProps {
  autoRefresh?: boolean;
  refreshInterval?: number;
  compact?: boolean;
}

export const LiveMetricsWidget: React.FC<LiveMetricsWidgetProps> = ({
  autoRefresh = true,
  refreshInterval = 30000,
  compact = false,
}) => {
  const { liveMetrics, updateLiveMetrics, setRefreshInterval } = useMonitoringStore();

  // Subscribe to live metrics updates
  useWebSocketSubscription<LiveMetrics>(
    WebSocketEventType.ANALYTICS_UPDATE,
    (metrics) => {
      updateLiveMetrics(metrics);
    },
    []
  );

  useEffect(() => {
    if (autoRefresh) {
      setRefreshInterval(refreshInterval);
    }
  }, [autoRefresh, refreshInterval, setRefreshInterval]);

  if (!liveMetrics) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  const formatValue = (value: number, format: string) => {
    switch (format) {
      case 'currency':
        return `$${value.toLocaleString()}`;
      case 'percentage':
        return `${(value * 100).toFixed(1)}%`;
      case 'number':
      default:
        return value.toLocaleString();
    }
  };

  const metrics = [
    {
      label: 'Campaigns',
      icon: ChartBarIcon,
      color: 'blue',
      data: [
        { label: 'Active', value: liveMetrics.campaigns.active, format: 'number' },
        { label: 'Impressions', value: liveMetrics.campaigns.impressions, format: 'number' },
        { label: 'ROAS', value: liveMetrics.campaigns.roas, format: 'percentage' },
        { label: 'Revenue', value: liveMetrics.campaigns.revenue, format: 'currency' },
      ],
    },
    {
      label: 'Moments',
      icon: ClockIcon,
      color: 'green',
      data: [
        { label: 'Delivered', value: liveMetrics.moments.delivered, format: 'number' },
        { label: 'Delivery Rate', value: liveMetrics.moments.deliveryRate, format: 'percentage' },
        { label: 'Open Rate', value: liveMetrics.moments.openRate, format: 'percentage' },
        { label: 'Clicked', value: liveMetrics.moments.clicked, format: 'number' },
      ],
    },
    {
      label: 'Experiments',
      icon: BeakerIcon,
      color: 'purple',
      data: [
        { label: 'Running', value: liveMetrics.experiments.running, format: 'number' },
        { label: 'Participants', value: liveMetrics.experiments.participants, format: 'number' },
        { label: 'Confidence', value: liveMetrics.experiments.confidenceLevel, format: 'percentage' },
        { label: 'Winners', value: liveMetrics.experiments.winnerDeclared, format: 'number' },
      ],
    },
    {
      label: 'Atoms',
      icon: CubeIcon,
      color: 'orange',
      data: [
        { label: 'Total', value: liveMetrics.atoms.total, format: 'number' },
        { label: 'Active', value: liveMetrics.atoms.active, format: 'number' },
        { label: 'Accuracy', value: liveMetrics.atoms.accuracy, format: 'percentage' },
        { label: 'Usage', value: liveMetrics.atoms.usageCount, format: 'number' },
      ],
    },
  ];

  if (compact) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
// File Path: src/components/features/LiveMonitoring/LiveMetricsWidget.tsx

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  ClockIcon,
  BeakerIcon,
  CubeIcon,
} from '@heroicons/react/24/outline';
import { useMonitoringStore } from '../../../stores/ui/monitoringStore';
import { useWebSocketSubscription } from '../../../hooks/realtime/useWebSocket';
import { WebSocketEventType } from '../../../services/websocket/MessageTypes';
import { LiveMetrics } from '../../../types/monitoring';

interface LiveMetricsWidgetProps {
  autoRefresh?: boolean;
  refreshInterval?: number;
  compact?: boolean;
}

export const LiveMetricsWidget: React.FC<LiveMetricsWidgetProps> = ({
  autoRefresh = true,
  refreshInterval = 30000,
  compact = false,
}) => {
  const { liveMetrics, updateLiveMetrics, setRefreshInterval } = useMonitoringStore();

  // Subscribe to live metrics updates
  useWebSocketSubscription<LiveMetrics>(
    WebSocketEventType.ANALYTICS_UPDATE,
    (metrics) => {
      updateLiveMetrics(metrics);
    },
    []
  );

  useEffect(() => {
    if (autoRefresh) {
      setRefreshInterval(refreshInterval);
    }
  }, [autoRefresh, refreshInterval, setRefreshInterval]);

  if (!liveMetrics) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  const formatValue = (value: number, format: string) => {
    switch (format) {
      case 'currency':
        return `${value.toLocaleString()}`;
      case 'percentage':
        return `${(value * 100).toFixed(1)}%`;
      case 'number':
      default:
        return value.toLocaleString();
    }
  };

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 border-blue-200 text-blue-700',
      green: 'bg-green-50 border-green-200 text-green-700',
      purple: 'bg-purple-50 border-purple-200 text-purple-700',
      orange: 'bg-orange-50 border-orange-200 text-orange-700',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getIconColor = (color: string) => {
    const colors = {
      blue: 'text-blue-500',
      green: 'text-green-500',
      purple: 'text-purple-500',
      orange: 'text-orange-500',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const metrics = [
    {
      label: 'Campaigns',
      icon: ChartBarIcon,
      color: 'blue',
      data: [
        { label: 'Active', value: liveMetrics.campaigns.active, format: 'number' },
        { label: 'Impressions', value: liveMetrics.campaigns.impressions, format: 'number' },
        { label: 'ROAS', value: liveMetrics.campaigns.roas, format: 'percentage' },
        { label: 'Revenue', value: liveMetrics.campaigns.revenue, format: 'currency' },
      ],
    },
    {
      label: 'Moments',
      icon: ClockIcon,
      color: 'green',
      data: [
        { label: 'Delivered', value: liveMetrics.moments.delivered, format: 'number' },
        { label: 'Delivery Rate', value: liveMetrics.moments.deliveryRate, format: 'percentage' },
        { label: 'Open Rate', value: liveMetrics.moments.openRate, format: 'percentage' },
        { label: 'Clicked', value: liveMetrics.moments.clicked, format: 'number' },
      ],
    },
    {
      label: 'Experiments',
      icon: BeakerIcon,
      color: 'purple',
      data: [
        { label: 'Running', value: liveMetrics.experiments.running, format: 'number' },
        { label: 'Participants', value: liveMetrics.experiments.participants, format: 'number' },
        { label: 'Confidence', value: liveMetrics.experiments.confidenceLevel, format: 'percentage' },
        { label: 'Winners', value: liveMetrics.experiments.winnerDeclared, format: 'number' },
      ],
    },
    {
      label: 'Atoms',
      icon: CubeIcon,
      color: 'orange',
      data: [
        { label: 'Total', value: liveMetrics.atoms.total, format: 'number' },
        { label: 'Active', value: liveMetrics.atoms.active, format: 'number' },
        { label: 'Accuracy', value: liveMetrics.atoms.accuracy, format: 'percentage' },
        { label: 'Usage', value: liveMetrics.atoms.usageCount, format: 'number' },
      ],
    },
  ];

  if (compact) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`
              rounded-lg border p-4 ${getColorClasses(metric.color)}
            `}
          >
            <div className="flex items-center space-x-2 mb-2">
              <metric.icon className={`h-5 w-5 ${getIconColor(metric.color)}`} />
              <h3 className="text-sm font-medium">{metric.label}</h3>
            </div>
            <div className="text-lg font-bold">
              {formatValue(metric.data[0].value, metric.data[0].format)}
            </div>
            <div className="text-xs opacity-75">
              {metric.data[0].label}
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Live Metrics</h2>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Live</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2">
                <metric.icon className={`h-6 w-6 ${getIconColor(metric.color)}`} />
                <h3 className="text-sm font-medium text-gray-900">{metric.label}</h3>
              </div>
              
              <div className="space-y-2">
                {metric.data.map((item, index) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{item.label}</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatValue(item.value, item.format)}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Last updated */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Last updated: {new Date(liveMetrics.timestamp).toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
};